import { readFile } from "node:fs/promises";

const ALLOWED_TASK_TYPES = new Set(["text", "vision", "rule-check"]);
const ALLOWED_DIFFICULTIES = new Set(["rookie", "standard", "expert"]);

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasOnlyNonEmptyStrings(values) {
  return Array.isArray(values) && values.length > 0 && values.every((entry) => isNonEmptyString(entry));
}

export function validateMissionPack(pack) {
  const errors = [];

  if (!pack || typeof pack !== "object" || Array.isArray(pack)) {
    return {
      valid: false,
      errors: ["mission pack must be an object"],
      stats: { missions: 0, visionMissions: 0 },
    };
  }

  if (!isNonEmptyString(pack.packId)) {
    errors.push("packId is required");
  }
  if (!isNonEmptyString(pack.title)) {
    errors.push("title is required");
  }
  if (!Number.isInteger(pack.schemaVersion) || pack.schemaVersion < 1) {
    errors.push("schemaVersion must be a positive integer");
  }
  if (!Array.isArray(pack.missions)) {
    errors.push("missions must be an array");
  }

  const missions = Array.isArray(pack.missions) ? pack.missions : [];
  if (missions.length < 10 || missions.length > 20) {
    errors.push("missions count must be between 10 and 20");
  }

  const missionIdSet = new Set();
  let visionMissions = 0;

  missions.forEach((mission, missionIndex) => {
    const missionPath = `missions[${missionIndex}]`;
    if (!mission || typeof mission !== "object" || Array.isArray(mission)) {
      errors.push(`${missionPath} must be an object`);
      return;
    }

    const { id, title, difficulty, turnLimit, alarmMax, briefing, objective, tasks } = mission;

    if (!isNonEmptyString(id)) {
      errors.push(`${missionPath}.id is required`);
    } else if (missionIdSet.has(id)) {
      errors.push(`${missionPath}.id must be unique`);
    } else {
      missionIdSet.add(id);
    }

    if (!isNonEmptyString(title)) {
      errors.push(`${missionPath}.title is required`);
    }
    if (!ALLOWED_DIFFICULTIES.has(difficulty)) {
      errors.push(`${missionPath}.difficulty must be one of rookie|standard|expert`);
    }
    if (!Number.isInteger(turnLimit) || turnLimit < 3) {
      errors.push(`${missionPath}.turnLimit must be an integer >= 3`);
    }
    if (!Number.isInteger(alarmMax) || alarmMax < 5) {
      errors.push(`${missionPath}.alarmMax must be an integer >= 5`);
    }
    if (!isNonEmptyString(briefing)) {
      errors.push(`${missionPath}.briefing is required`);
    }
    if (!isNonEmptyString(objective)) {
      errors.push(`${missionPath}.objective is required`);
    }

    if (!Array.isArray(tasks) || tasks.length < 1) {
      errors.push(`${missionPath}.tasks must be a non-empty array`);
      return;
    }

    const taskIdSet = new Set();
    const hasVisionTask = tasks.some((task) => task?.type === "vision");
    if (hasVisionTask) {
      visionMissions += 1;
    }

    tasks.forEach((task, taskIndex) => {
      const taskPath = `${missionPath}.tasks[${taskIndex}]`;
      if (!task || typeof task !== "object" || Array.isArray(task)) {
        errors.push(`${taskPath} must be an object`);
        return;
      }

      if (!isNonEmptyString(task.id)) {
        errors.push(`${taskPath}.id is required`);
      } else if (taskIdSet.has(task.id)) {
        errors.push(`${taskPath}.id must be unique within mission`);
      } else {
        taskIdSet.add(task.id);
      }

      if (!ALLOWED_TASK_TYPES.has(task.type)) {
        errors.push(`${taskPath}.type must be one of text|vision|rule-check`);
      }
      if (!isNonEmptyString(task.prompt)) {
        errors.push(`${taskPath}.prompt is required`);
      }

      if (task.type === "vision") {
        if (!isNonEmptyString(task.imageRef)) {
          errors.push(`${taskPath}.imageRef is required for vision tasks`);
        }
        if (!hasOnlyNonEmptyStrings(task.expectedClues)) {
          errors.push(`${taskPath}.expectedClues must be a non-empty string array for vision tasks`);
        }
      }

      if (task.type !== "vision") {
        if (!hasOnlyNonEmptyStrings(task.answerKeywords)) {
          errors.push(`${taskPath}.answerKeywords must be a non-empty string array for non-vision tasks`);
        }
      }
    });
  });

  if (visionMissions < 3) {
    errors.push("at least 3 missions must include vision tasks");
  }

  return {
    valid: errors.length === 0,
    errors,
    stats: {
      missions: missions.length,
      visionMissions,
    },
  };
}

export function loadMissionPack(rawPack) {
  const parsed = typeof rawPack === "string" ? JSON.parse(rawPack) : rawPack;
  const validation = validateMissionPack(parsed);

  if (!validation.valid) {
    const details = validation.errors.join("; ");
    throw new Error(`Invalid mission pack: ${details}`);
  }

  return {
    ...parsed,
    missions: parsed.missions.map((mission) => ({
      ...mission,
      tasks: mission.tasks.map((task) => ({ ...task })),
    })),
    meta: {
      missionCount: validation.stats.missions,
      visionMissionCount: validation.stats.visionMissions,
    },
  };
}

export async function loadMissionPackFromFile(filePath) {
  const raw = await readFile(filePath, "utf8");
  return loadMissionPack(raw);
}

export function missionToTurnTasks(mission) {
  if (!mission || !Array.isArray(mission.tasks)) {
    return [];
  }
  return mission.tasks.map((task) => ({
    id: task.id,
    type: task.type,
    prompt: task.prompt,
  }));
}
