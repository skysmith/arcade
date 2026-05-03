const DEFAULT_ROUTE_TABLE = Object.freeze({
  text: Object.freeze(["planner", "narrator"]),
  vision: Object.freeze(["vision"]),
  "rule-check": Object.freeze(["judge"]),
});

function cloneState(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function createTaskRouter(routeTable = DEFAULT_ROUTE_TABLE) {
  const normalizedRouteTable = Object.fromEntries(
    Object.entries(routeTable).map(([type, experts]) => [type, [...experts]])
  );

  return function routeTasks(tasks = []) {
    const byTask = [];
    const selectedExperts = [];
    const selectedExpertSet = new Set();

    tasks.forEach((task, index) => {
      const taskId = task?.id ?? `task-${index + 1}`;
      const taskType = task?.type ?? "text";
      const experts = normalizedRouteTable[taskType] ? [...normalizedRouteTable[taskType]] : [];

      experts.forEach((expertName) => {
        if (!selectedExpertSet.has(expertName)) {
          selectedExpertSet.add(expertName);
          selectedExperts.push(expertName);
        }
      });

      byTask.push({
        taskId,
        taskType,
        experts,
        task,
      });
    });

    return { byTask, selectedExperts };
  };
}

function defaultJudge({ candidateState }) {
  const repairs = [];
  if (Number.isFinite(candidateState.alarm) && Number.isFinite(candidateState.alarmMax)) {
    if (candidateState.alarm < 0 || candidateState.alarm > candidateState.alarmMax) {
      repairs.push({
        type: "clamp",
        field: "alarm",
        min: 0,
        max: candidateState.alarmMax,
      });
    }
  }
  if (Number.isFinite(candidateState.integrity) && candidateState.integrity < 0) {
    repairs.push({
      type: "set",
      field: "integrity",
      value: 0,
    });
  }
  if (!Number.isFinite(candidateState.score)) {
    return {
      decision: "reject",
      reason: "score must be a finite number",
      repairs: [{ type: "set", field: "score", value: 0 }],
    };
  }
  if (repairs.length > 0) {
    return {
      decision: "repair",
      reason: "candidate state violated deterministic bounds",
      repairs,
    };
  }
  return { decision: "accept", reason: "state is consistent" };
}

function applyRepairs(baseState, repairs = []) {
  const next = cloneState(baseState);
  repairs.forEach((repair) => {
    if (!repair || !repair.type) {
      return;
    }
    if (repair.type === "set") {
      next[repair.field] = repair.value;
      return;
    }
    if (repair.type === "clamp") {
      const currentValue = Number(next[repair.field] ?? 0);
      next[repair.field] = clamp(currentValue, Number(repair.min), Number(repair.max));
      return;
    }
    if (repair.type === "patch" && repair.value && typeof repair.value === "object") {
      Object.assign(next, repair.value);
    }
  });
  return next;
}

function mergeOutputsIntoState(baseState, outputs) {
  const nextState = cloneState(baseState);
  const mergedNarrative = [];
  const mergedRecommendations = [];
  const mergedClues = [];

  outputs.forEach((output) => {
    if (!output || output.ok !== true || !output.result) {
      return;
    }
    const result = output.result;
    if (Number.isFinite(result.alarmDelta)) {
      nextState.alarm = Number(nextState.alarm ?? 0) + result.alarmDelta;
    }
    if (Number.isFinite(result.integrityDelta)) {
      nextState.integrity = Number(nextState.integrity ?? 0) + result.integrityDelta;
    }
    if (Number.isFinite(result.scoreDelta)) {
      nextState.score = Number(nextState.score ?? 0) + result.scoreDelta;
    }
    if (Number.isFinite(result.lootDelta)) {
      nextState.loot = Number(nextState.loot ?? 0) + result.lootDelta;
    }
    if (Number.isFinite(result.objectiveDelta)) {
      nextState.objectiveProgress = Number(nextState.objectiveProgress ?? 0) + result.objectiveDelta;
    }
    if (Array.isArray(result.clues)) {
      result.clues.forEach((clue) => mergedClues.push(clue));
    }
    if (Array.isArray(result.recommendedNextActions)) {
      result.recommendedNextActions.forEach((entry) => mergedRecommendations.push(entry));
    }
    if (typeof result.narrativeSummary === "string" && result.narrativeSummary.trim()) {
      mergedNarrative.push(result.narrativeSummary.trim());
    }
    if (result.statePatch && typeof result.statePatch === "object") {
      Object.assign(nextState, result.statePatch);
    }
  });

  if (mergedClues.length > 0) {
    nextState.clues = [...(Array.isArray(nextState.clues) ? nextState.clues : []), ...mergedClues];
  }
  if (mergedRecommendations.length > 0) {
    nextState.recommendedNextActions = mergedRecommendations;
  }
  if (mergedNarrative.length > 0) {
    nextState.narrativeSummary = mergedNarrative.join(" ");
  }
  return nextState;
}

async function runExpertWithRetry({
  expertName,
  expertFn,
  input,
  retryLimit,
}) {
  const errors = [];
  let attempts = 0;
  while (attempts <= retryLimit) {
    attempts += 1;
    try {
      const result = await expertFn(input);
      return {
        ok: true,
        expertName,
        attempts,
        result: result ?? {},
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }
  return {
    ok: false,
    expertName,
    attempts,
    errors,
  };
}

export function createMoeTurnOrchestrator({
  experts = {},
  judge = defaultJudge,
  router = createTaskRouter(),
  retryLimit = 1,
  maxIterations = 3,
  timeoutMs = 2500,
  clock = () => Date.now(),
} = {}) {
  if (!Number.isInteger(maxIterations) || maxIterations < 1) {
    throw new Error("maxIterations must be a positive integer");
  }
  if (!Number.isInteger(retryLimit) || retryLimit < 0) {
    throw new Error("retryLimit must be a non-negative integer");
  }
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error("timeoutMs must be a positive number");
  }

  return async function runTurn({
    missionState,
    playerAction,
    tasks = [],
    context = {},
  }) {
    let workingState = cloneState(missionState ?? {});
    const startedAt = clock();
    const deadline = startedAt + timeoutMs;

    const trace = {
      startedAt,
      deadline,
      retries: retryLimit,
      maxIterations,
      iterations: [],
    };

    for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
      if (clock() >= deadline) {
        return {
          outcome: "timeout",
          iterations: iteration - 1,
          finalState: workingState,
          trace,
        };
      }

      const routed = router(tasks);
      const expertRuns = [];

      for (const assignment of routed.byTask) {
        for (const expertName of assignment.experts) {
          const expertFn = experts[expertName];
          if (typeof expertFn !== "function") {
            expertRuns.push({
              ok: false,
              expertName,
              attempts: 0,
              errors: [`missing expert handler: ${expertName}`],
              taskId: assignment.taskId,
              taskType: assignment.taskType,
            });
            continue;
          }

          const output = await runExpertWithRetry({
            expertName,
            expertFn,
            retryLimit,
            input: {
              task: assignment.task,
              taskId: assignment.taskId,
              taskType: assignment.taskType,
              gameState: cloneState(workingState),
              playerAction,
              iteration,
              context,
            },
          });
          output.taskId = assignment.taskId;
          output.taskType = assignment.taskType;
          expertRuns.push(output);
        }
      }

      const candidateState = mergeOutputsIntoState(workingState, expertRuns);
      const judgeResult = await judge({
        iteration,
        missionState: cloneState(workingState),
        candidateState: cloneState(candidateState),
        playerAction,
        expertRuns: cloneState(expertRuns),
      });
      const decision = judgeResult?.decision ?? "reject";

      trace.iterations.push({
        iteration,
        routed,
        expertRuns,
        decision,
        reason: judgeResult?.reason ?? "",
      });

      if (decision === "accept") {
        return {
          outcome: "success",
          iterations: iteration,
          finalState: candidateState,
          trace,
        };
      }

      if (decision === "repair" || decision === "reject") {
        workingState = applyRepairs(candidateState, judgeResult?.repairs ?? []);
      } else {
        workingState = candidateState;
      }

      if (clock() >= deadline) {
        return {
          outcome: "timeout",
          iterations: iteration,
          finalState: workingState,
          trace,
        };
      }
    }

    return {
      outcome: "max_iterations",
      iterations: maxIterations,
      finalState: workingState,
      trace,
    };
  };
}

export { DEFAULT_ROUTE_TABLE };
