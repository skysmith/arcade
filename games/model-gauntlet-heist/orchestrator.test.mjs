import test from "node:test";
import assert from "node:assert/strict";

import {
  createMoeTurnOrchestrator,
  createTaskRouter,
} from "./orchestrator.mjs";

test("router selects experts by task type", () => {
  const router = createTaskRouter();
  const routed = router([
    { id: "t1", type: "text" },
    { id: "t2", type: "vision" },
    { id: "t3", type: "rule-check" },
  ]);

  assert.deepEqual(routed.byTask.map((entry) => entry.experts), [
    ["planner", "narrator"],
    ["vision"],
    ["judge"],
  ]);
  assert.deepEqual(routed.selectedExperts, ["planner", "narrator", "vision", "judge"]);
});

test("orchestrator retries expert calls and succeeds after judge accept", async () => {
  let plannerCalls = 0;
  const orchestrator = createMoeTurnOrchestrator({
    experts: {
      planner: async () => {
        plannerCalls += 1;
        if (plannerCalls === 1) {
          throw new Error("planner transient failure");
        }
        return { scoreDelta: 25, alarmDelta: 1 };
      },
      narrator: async () => ({ narrativeSummary: "Team moves quietly." }),
    },
    judge: async ({ candidateState }) => {
      if (candidateState.alarm <= candidateState.alarmMax) {
        return { decision: "accept" };
      }
      return {
        decision: "repair",
        repairs: [{ type: "clamp", field: "alarm", min: 0, max: candidateState.alarmMax }],
      };
    },
    retryLimit: 1,
    maxIterations: 3,
    timeoutMs: 1000,
  });

  const result = await orchestrator({
    missionState: { alarm: 0, alarmMax: 10, score: 0, integrity: 3 },
    playerAction: { action: "Scout" },
    tasks: [{ id: "turn-text", type: "text" }],
  });

  assert.equal(result.outcome, "success");
  assert.equal(result.iterations, 1);
  assert.equal(plannerCalls, 2);
  assert.equal(result.finalState.score, 25);
});

test("judge can request repair before accept", async () => {
  const orchestrator = createMoeTurnOrchestrator({
    experts: {
      planner: async ({ iteration }) => {
        if (iteration === 1) {
          return { alarmDelta: -8, scoreDelta: 10 };
        }
        return { alarmDelta: 2, scoreDelta: 15 };
      },
      narrator: async () => ({ narrativeSummary: "Field update." }),
    },
    judge: async ({ candidateState, iteration }) => {
      if (candidateState.alarm < 0) {
        return {
          decision: "repair",
          reason: "alarm cannot be negative",
          repairs: [{ type: "set", field: "alarm", value: 0 }],
        };
      }
      if (iteration >= 2) {
        return { decision: "accept" };
      }
      return { decision: "reject", repairs: [{ type: "set", field: "alarm", value: 0 }] };
    },
    maxIterations: 3,
    timeoutMs: 1000,
  });

  const result = await orchestrator({
    missionState: { alarm: 3, alarmMax: 10, score: 0, integrity: 3 },
    playerAction: { action: "Hack" },
    tasks: [{ id: "turn-text", type: "text" }],
  });

  assert.equal(result.outcome, "success");
  assert.equal(result.iterations, 2);
  assert.equal(result.trace.iterations[0].decision, "repair");
  assert.equal(result.finalState.alarm, 2);
  assert.equal(result.finalState.score, 25);
});

test("loop terminates on max iterations", async () => {
  const orchestrator = createMoeTurnOrchestrator({
    experts: {
      planner: async () => ({ scoreDelta: 1 }),
      narrator: async () => ({ narrativeSummary: "Still uncertain." }),
    },
    judge: async () => ({
      decision: "repair",
      repairs: [{ type: "set", field: "alarm", value: 1 }],
    }),
    maxIterations: 2,
    timeoutMs: 1000,
  });

  const result = await orchestrator({
    missionState: { alarm: 0, alarmMax: 10, score: 0, integrity: 3 },
    playerAction: { action: "Wait" },
    tasks: [{ id: "turn-text", type: "text" }],
  });

  assert.equal(result.outcome, "max_iterations");
  assert.equal(result.iterations, 2);
  assert.equal(result.trace.iterations.length, 2);
});

test("loop terminates deterministically on timeout", async () => {
  let now = 0;
  const clock = () => now;
  const orchestrator = createMoeTurnOrchestrator({
    experts: {
      planner: async () => {
        now += 4;
        return { scoreDelta: 1 };
      },
      narrator: async () => {
        now += 4;
        return { narrativeSummary: "Time pressure." };
      },
    },
    judge: async () => ({
      decision: "repair",
      repairs: [{ type: "set", field: "alarm", value: 0 }],
    }),
    maxIterations: 5,
    timeoutMs: 7,
    clock,
  });

  const result = await orchestrator({
    missionState: { alarm: 0, alarmMax: 10, score: 0, integrity: 3 },
    playerAction: { action: "Scout" },
    tasks: [{ id: "turn-text", type: "text" }],
  });

  assert.equal(result.outcome, "timeout");
  assert.equal(result.iterations, 1);
});
