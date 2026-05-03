import { createArcadeStage } from "../../shared/arcade-stage.js";

const BUILD_NUMBER = "2026.04.21.1";
const MAX_PLAYERS = 4;
const KEYBOARD_PLAYER_ID = "keyboard-1";
const WIDTH = 960;
const HEIGHT = 600;
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const NUMBERS = Array.from({ length: 10 }, (_, index) => String(index + 1));
const SOUND_WORDS = ["SUN", "CAT", "DOG", "BUG", "FISH", "MOON", "HAT", "MAP", "LOG", "BEE"];
const DRAGON_SOUND_WORDS = ["FIRE", "EGG", "WING", "GEM", "NEST", "CAVE", "MOON", "STAR", "SMOKE", "TAIL"];
const BUILD_WORDS = ["CAT", "DOG", "SUN", "BUG", "HAT", "MAP"];
const CAPSTONE_WORDS = ["FROG", "STAR", "TREE", "SHIP", "TRAIN", "DRAGON"];
const TRAIN_SEQUENCES = [
  ["1", "2", "3"],
  ["2", "3", "4"],
  ["3", "4", "5"],
  ["A", "B", "C"],
  ["C", "A", "T"],
  ["D", "O", "G"],
];
const SEQUENCE_TILE_POOL = ["1", "2", "3", "4", "5", "A", "B", "C", "D", "G", "O", "T"];
const PLAYER_COLORS = ["#75f0d4", "#ffd46d", "#ff7c86", "#a8f36b"];
const PLAYER_LABELS = ["P1", "P2", "P3", "P4"];
const TILE_COLORS = ["#f7fbff", "#a8f36b", "#75f0d4", "#ffd46d", "#ff9cc5", "#bca7ff", "#ffb06d", "#92d5ff"];
const LAUNCHPAD = { x: 334, y: 424, width: 292, height: 88 };
const LAUNCHPAD_HITBOX_PADDING_X = 34;
const LAUNCHPAD_HITBOX_PADDING_Y = 8;
const TILE_LAUNCHPAD_ACCEPTANCE = 0.45;
const LAUNCHPAD_ACTIVE_BOTTOM = HEIGHT;
const VOICE_MANIFEST_PATH = "./assets/audio/voice-manifest.json";
const VOICE_DELAY_PADDING_SECONDS = 0.32;
const VOICE_FEEDBACK_FALLBACK_SECONDS = 2.25;
const LEVELS = [
  {
    id: 1,
    title: "Launchpad Letters",
    shortTitle: "Launchpad",
    mode: "uppercase",
    goal: 10,
    theme: "spaceport",
    promptLead: "Find",
    instruction: "Find the big letter.",
    launchLabel: "LAUNCH",
    readyLabel: "READY",
    dropCopy: "Drop to launch",
    completeLine: "letters launched",
  },
  {
    id: 2,
    title: "Moon Garden",
    shortTitle: "Moon Garden",
    mode: "lowercase",
    goal: 10,
    theme: "moon",
    promptLead: "Little",
    instruction: "Match little letters to big letters.",
    launchLabel: "GARDEN",
    readyLabel: "GROW",
    dropCopy: "Plant the match",
    completeLine: "little letters matched",
  },
  {
    id: 3,
    title: "Planet Count",
    shortTitle: "Planet Count",
    mode: "numbers",
    goal: 10,
    theme: "planets",
    promptLead: "Number",
    instruction: "Find the matching number.",
    launchLabel: "ORBIT",
    readyLabel: "LOCKED",
    dropCopy: "Drop into orbit",
    completeLine: "numbers counted",
  },
  {
    id: 4,
    title: "Forest Sounds",
    shortTitle: "Forest Sounds",
    mode: "sounds",
    goal: 8,
    theme: "forest",
    promptLead: "Starts",
    instruction: "Find the letter that starts the word.",
    launchLabel: "TRAIL",
    readyLabel: "FOUND",
    dropCopy: "Drop on the trail",
    completeLine: "starting sounds found",
  },
  {
    id: 5,
    title: "Word Workshop",
    shortTitle: "Workshop",
    mode: "words",
    goal: 5,
    theme: "workshop",
    promptLead: "Build",
    instruction: "Build the word one letter at a time.",
    launchLabel: "BUILD",
    readyLabel: "PLACE",
    dropCopy: "Drop into the tray",
    completeLine: "words built",
  },
  {
    id: 6,
    title: "Dino Dig Site",
    shortTitle: "Dino Dig",
    mode: "lowercase",
    goal: 10,
    theme: "dino",
    promptLead: "Fossil",
    instruction: "Dig up the little letter that matches.",
    launchLabel: "DIG",
    readyLabel: "FOUND",
    dropCopy: "Drop in the dig site",
    completeLine: "fossils matched",
  },
  {
    id: 7,
    title: "Train Yard",
    shortTitle: "Train Yard",
    mode: "sequence",
    goal: 6,
    theme: "train",
    promptLead: "Load",
    instruction: "Load the train cars in order.",
    launchLabel: "TRACK",
    readyLabel: "COUPLE",
    dropCopy: "Drop on the track",
    completeLine: "trains loaded",
  },
  {
    id: 8,
    title: "Tractor Farm",
    shortTitle: "Tractor Farm",
    mode: "numbers",
    goal: 10,
    theme: "tractor",
    promptLead: "Harvest",
    instruction: "Find the number for the harvest.",
    launchLabel: "TRAILER",
    readyLabel: "LOAD",
    dropCopy: "Drop in the trailer",
    completeLine: "harvests counted",
  },
  {
    id: 9,
    title: "Dragon Hatchery",
    shortTitle: "Hatchery",
    mode: "sounds",
    goal: 8,
    theme: "dragon",
    promptLead: "Hatch",
    instruction: "Feed the dragon the first letter sound.",
    launchLabel: "NEST",
    readyLabel: "HATCH",
    dropCopy: "Drop in the nest",
    completeLine: "dragon sounds found",
    soundWords: DRAGON_SOUND_WORDS,
  },
  {
    id: 10,
    title: "Word Workshop Plus",
    shortTitle: "Word Plus",
    mode: "words",
    goal: 6,
    theme: "wordplus",
    promptLead: "Build",
    instruction: "Build bigger words one letter at a time.",
    launchLabel: "FORGE",
    readyLabel: "SET",
    dropCopy: "Drop into the word forge",
    completeLine: "bigger words built",
    wordPool: CAPSTONE_WORDS,
  },
];

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const playfieldShell = document.getElementById("playfield-shell");
const playfieldStage = document.getElementById("playfield-stage");
const menuOverlay = document.getElementById("menu-overlay");
const menuButtons = [...document.querySelectorAll("[data-level-id], [data-menu-action]")];

const ui = {
  round: document.getElementById("round-value"),
  target: document.getElementById("target-value"),
  goal: document.getElementById("goal-value"),
  players: document.getElementById("players-value"),
  status: document.getElementById("status-value"),
  hint: document.getElementById("hint-value"),
};

document.title = `letter-launchpad build ${BUILD_NUMBER}`;

const cabinetStage = createArcadeStage({
  shell: playfieldShell,
  stage: playfieldStage,
  canvas,
  logicalWidth: WIDTH,
  logicalHeight: HEIGHT,
});

const state = {
  screen: "menu",
  menuSelection: 0,
  selectedLevelId: 1,
  currentLevelId: 1,
  players: new Map(),
  controllerAssignments: new Map(),
  joinButtonSnapshot: {},
  keyboard: {
    left: false,
    right: false,
    up: false,
    down: false,
    action: false,
    start: false,
    back: false,
  },
  menuSnapshot: {
    up: false,
    down: false,
    confirm: false,
    back: false,
  },
  target: {
    display: "A",
    answer: "A",
    promptLead: "Find",
    promptValue: "A",
  },
  targetHistory: [],
  currentWord: "",
  wordProgress: [],
  currentSequence: [],
  sequenceProgress: [],
  round: 1,
  matches: 0,
  score: 0,
  attempts: 0,
  tiles: [],
  sparkles: [],
  feedback: "Ready.",
  feedbackTimer: 0,
  roundDelay: 0,
  paused: false,
  voice: {
    enabled: false,
    unlocked: false,
    manifest: null,
    baseUrl: null,
    current: null,
    missing: new Set(),
    durations: new Map(),
    metadataLoads: [],
  },
  lastTime: 0,
  lastStatusText: "",
};

function arcadeCabinet() {
  return window.ArcadeCabinet || null;
}

function navigateToArcade() {
  const cabinet = arcadeCabinet();
  if (cabinet?.navigateToArcade) {
    cabinet.navigateToArcade();
    return;
  }
  window.location.href = new URL("../../index.html", window.location.href).href;
}

window.__arcadeCabinetHooks = {
  getPauseActions() {
    return LEVELS.map((level) => ({
      id: `letter-level-${level.id}`,
      label: `Play Level ${level.id}: ${level.shortTitle}`,
      run: () => startLevel(level.id),
    }));
  },
  onPauseOpen() {
    state.paused = true;
  },
  onPauseClose() {
    if (state.screen === "play") {
      state.paused = false;
    }
  },
};

function currentLevel() {
  return LEVELS.find((level) => level.id === state.currentLevelId) || LEVELS[0];
}

function selectedLevel() {
  return LEVELS.find((level) => level.id === state.selectedLevelId) || LEVELS[0];
}

function levelById(id) {
  return LEVELS.find((level) => level.id === Number(id)) || LEVELS[0];
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function shuffle(items) {
  const copy = items.slice();
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function roundRectPath(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function setFeedback(text, seconds = 1.25) {
  state.feedback = text;
  state.feedbackTimer = seconds;
}

async function loadVoiceManifest() {
  try {
    const response = await fetch(VOICE_MANIFEST_PATH, { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const manifest = await response.json();
    if (!manifest?.clips || typeof manifest.clips !== "object") {
      return;
    }
    state.voice.manifest = manifest;
    state.voice.baseUrl = new URL("./assets/audio/", window.location.href);
    state.voice.enabled = true;
    preloadVoiceDurations();
  } catch (_error) {
    state.voice.enabled = false;
  }
}

function unlockVoice() {
  state.voice.unlocked = true;
}

function voiceClipUrl(key) {
  const file = state.voice.manifest?.clips?.[key]?.file;
  if (!file || !state.voice.baseUrl) {
    return null;
  }
  return new URL(file, state.voice.baseUrl).href;
}

function rememberVoiceDuration(key, duration) {
  if (Number.isFinite(duration) && duration > 0) {
    state.voice.durations.set(key, duration);
  }
}

function preloadVoiceDurations() {
  if (!state.voice.manifest?.clips || !state.voice.baseUrl) {
    return;
  }
  state.voice.metadataLoads = Object.entries(state.voice.manifest.clips).map(([key, clip]) => {
    const audio = new Audio(new URL(clip.file, state.voice.baseUrl).href);
    audio.preload = "metadata";
    audio.addEventListener("loadedmetadata", () => rememberVoiceDuration(key, audio.duration), { once: true });
    audio.addEventListener("error", () => state.voice.missing.add(key), { once: true });
    audio.load();
    return audio;
  });
}

function voiceDelaySeconds(key, fallbackSeconds) {
  if (!state.voice.enabled || !state.voice.unlocked || state.voice.missing.has(key) || !voiceClipUrl(key)) {
    return 0;
  }
  const duration = state.voice.durations.get(key) || fallbackSeconds;
  return duration + VOICE_DELAY_PADDING_SECONDS;
}

function roundVoiceKey(level, kind, value, index = null) {
  const cleanValue = String(value).toUpperCase().replace(/[^A-Z0-9]+/g, "-");
  if (index === null) {
    return `level${level.id}.${kind}.${cleanValue}`;
  }
  return `level${level.id}.${kind}.${cleanValue}.${index}`;
}

function feedbackVoiceKey(level, kind) {
  return `level${level.id}.${kind}`;
}

function stopCurrentVoice() {
  if (!state.voice.current) {
    return;
  }
  state.voice.current.pause();
  state.voice.current.currentTime = 0;
  state.voice.current = null;
}

function playVoice(key) {
  if (!state.voice.enabled || !state.voice.unlocked || state.voice.missing.has(key)) {
    return false;
  }

  const url = voiceClipUrl(key);
  if (!url) {
    return false;
  }

  stopCurrentVoice();
  const audio = new Audio(url);
  audio.volume = 0.88;
  state.voice.current = audio;
  audio.addEventListener("loadedmetadata", () => rememberVoiceDuration(key, audio.duration), { once: true });
  audio.addEventListener("ended", () => {
    if (state.voice.current === audio) {
      state.voice.current = null;
    }
  });
  audio.addEventListener("error", () => {
    state.voice.missing.add(key);
    if (state.voice.current === audio) {
      state.voice.current = null;
    }
  }, { once: true });
  audio.play().catch(() => {
    if (state.voice.current === audio) {
      state.voice.current = null;
    }
  });
  return true;
}

function voiceDisclosure() {
  return state.voice.enabled ? "AI voice prompts enabled. " : "";
}

function trimControllerName(name) {
  return name.replace(/\(STANDARD GAMEPAD Vendor:.*$/i, "").trim() || "Controller";
}

function getGamepads() {
  if (!navigator.getGamepads) {
    return [];
  }
  return Array.from(navigator.getGamepads()).filter(Boolean);
}

function spawnPlayer(source, controllerIndex, controllerName) {
  if (state.players.size >= MAX_PLAYERS) {
    return;
  }

  const slot = state.players.size;
  const id = source === "keyboard" ? KEYBOARD_PLAYER_ID : `gamepad-${controllerIndex}`;
  if (state.players.has(id)) {
    return;
  }

  const player = {
    id,
    source,
    controllerIndex,
    controllerName,
    label: PLAYER_LABELS[slot] || `P${slot + 1}`,
    color: PLAYER_COLORS[slot % PLAYER_COLORS.length],
    x: WIDTH / 2,
    y: HEIGHT - 84,
    radius: 18,
    speed: 250,
    carrying: null,
    actionWasDown: false,
    lastMoveX: 0,
    lastMoveY: 0,
  };

  state.players.set(id, player);
  if (controllerIndex !== null) {
    state.controllerAssignments.set(controllerIndex, id);
  }
  relayoutPlayers();
}

function removePlayer(playerId) {
  const player = state.players.get(playerId);
  if (player?.carrying) {
    const tile = state.tiles.find((entry) => entry.id === player.carrying);
    if (tile) {
      tile.carriedBy = null;
      tile.vx = randomBetween(-38, 38);
      tile.vy = randomBetween(-28, 28);
    }
  }
  state.players.delete(playerId);
  relayoutPlayers();
}

function relayoutPlayers() {
  const players = [...state.players.values()];
  const laneWidth = WIDTH / Math.max(1, players.length + 1);
  players.forEach((player, index) => {
    player.label = PLAYER_LABELS[index] || `P${index + 1}`;
    player.color = PLAYER_COLORS[index % PLAYER_COLORS.length];
    if (state.screen === "menu") {
      player.x = laneWidth * (index + 1);
      player.y = HEIGHT - 80;
    } else if (!player.carrying) {
      player.x = Math.max(40, Math.min(WIDTH - 40, player.x || laneWidth * (index + 1)));
      player.y = Math.max(100, Math.min(HEIGHT - 44, player.y || HEIGHT - 84));
    }
  });
}

function ensureInputRoster() {
  const pads = getGamepads();
  const liveIndexes = new Set();
  for (const pad of pads) {
    liveIndexes.add(pad.index);
  }

  for (const [index, playerId] of [...state.controllerAssignments.entries()]) {
    if (liveIndexes.has(index)) {
      continue;
    }
    state.controllerAssignments.delete(index);
    removePlayer(playerId);
  }

  const assignedIndexes = new Set(state.controllerAssignments.keys());
  const connectedUnassignedPads = pads.filter((pad) => !assignedIndexes.has(pad.index));
  const hasGamepadPlayer = [...state.players.values()].some((player) => player.source === "gamepad");
  const keyboardPlayer = state.players.get(KEYBOARD_PLAYER_ID);

  if (!hasGamepadPlayer && connectedUnassignedPads.length > 0) {
    if (keyboardPlayer) {
      removePlayer(KEYBOARD_PLAYER_ID);
    }
    const firstPad = connectedUnassignedPads[0];
    spawnPlayer("gamepad", firstPad.index, trimControllerName(firstPad.id || `Controller ${firstPad.index + 1}`));
  }

  const refreshedHasGamepadPlayer = [...state.players.values()].some((player) => player.source === "gamepad");
  const refreshedKeyboardPlayer = state.players.get(KEYBOARD_PLAYER_ID);
  if (!refreshedHasGamepadPlayer && !refreshedKeyboardPlayer) {
    spawnPlayer("keyboard", null, "Keyboard");
  }
  if (refreshedHasGamepadPlayer && refreshedKeyboardPlayer) {
    removePlayer(KEYBOARD_PLAYER_ID);
  }

  for (const pad of pads) {
    const startPressed = !!pad.buttons[9]?.pressed;
    const previousJoin = state.joinButtonSnapshot[pad.index] || false;
    state.joinButtonSnapshot[pad.index] = startPressed;

    if (startPressed && !previousJoin && !state.controllerAssignments.has(pad.index) && state.players.size < MAX_PLAYERS) {
      spawnPlayer("gamepad", pad.index, trimControllerName(pad.id || `Controller ${pad.index + 1}`));
      setFeedback(`P${state.players.size} joined.`, 1);
    }
  }

  for (const index of Object.keys(state.joinButtonSnapshot)) {
    if (!liveIndexes.has(Number(index))) {
      delete state.joinButtonSnapshot[index];
    }
  }
}

function readKeyboardInput() {
  const x = (state.keyboard.right ? 1 : 0) - (state.keyboard.left ? 1 : 0);
  const y = (state.keyboard.down ? 1 : 0) - (state.keyboard.up ? 1 : 0);
  return {
    x,
    y,
    action: state.keyboard.action || state.keyboard.start,
    start: state.keyboard.start,
    back: state.keyboard.back,
  };
}

function readGamepadInput(controllerIndex) {
  if (controllerIndex === null || !navigator.getGamepads) {
    return { x: 0, y: 0, action: false, start: false, back: false };
  }

  const pad = navigator.getGamepads()[controllerIndex];
  if (!pad) {
    return { x: 0, y: 0, action: false, start: false, back: false };
  }

  const axisX = Math.abs(pad.axes[0] || 0) > 0.24 ? pad.axes[0] : 0;
  const axisY = Math.abs(pad.axes[1] || 0) > 0.24 ? pad.axes[1] : 0;
  const dpadX = (pad.buttons[15]?.pressed ? 1 : 0) - (pad.buttons[14]?.pressed ? 1 : 0);
  const dpadY = (pad.buttons[13]?.pressed ? 1 : 0) - (pad.buttons[12]?.pressed ? 1 : 0);

  return {
    x: dpadX || axisX,
    y: dpadY || axisY,
    action: !!pad.buttons[0]?.pressed || !!pad.buttons[5]?.pressed,
    start: !!pad.buttons[9]?.pressed,
    back: !!pad.buttons[1]?.pressed || !!pad.buttons[8]?.pressed,
  };
}

function readPlayerInput(player) {
  return player.source === "keyboard" ? readKeyboardInput() : readGamepadInput(player.controllerIndex);
}

function readMenuInput() {
  const keyboard = readKeyboardInput();
  const input = {
    up: keyboard.y < 0,
    down: keyboard.y > 0,
    confirm: keyboard.action || keyboard.start,
    back: keyboard.back,
  };

  for (const pad of getGamepads()) {
    const axisY = pad.axes[1] || 0;
    const altAxisY = pad.axes[7] || 0;
    input.up = input.up || !!pad.buttons[12]?.pressed || axisY < -0.45 || altAxisY < -0.45;
    input.down = input.down || !!pad.buttons[13]?.pressed || axisY > 0.45 || altAxisY > 0.45;
    input.confirm = input.confirm || !!pad.buttons[0]?.pressed || !!pad.buttons[9]?.pressed;
    input.back = input.back || !!pad.buttons[1]?.pressed || !!pad.buttons[8]?.pressed;
  }

  return input;
}

function edgeTrigger(snapshot, name, pressed) {
  const previous = snapshot[name] || false;
  snapshot[name] = pressed;
  return pressed && !previous;
}

function syncMenuSelection() {
  menuButtons.forEach((button, index) => {
    button.classList.toggle("is-selected", index === state.menuSelection);
  });
  const button = menuButtons[state.menuSelection];
  if (button?.dataset.levelId) {
    state.selectedLevelId = Number(button.dataset.levelId);
  }
}

function activateMenuButton(button) {
  if (!button) {
    return;
  }
  if (button.dataset.levelId) {
    startLevel(Number(button.dataset.levelId));
  } else if (button.dataset.menuAction === "arcade") {
    navigateToArcade();
  }
}

function updateMenuControls() {
  const input = readMenuInput();
  if (edgeTrigger(state.menuSnapshot, "up", input.up)) {
    state.menuSelection = (state.menuSelection - 1 + menuButtons.length) % menuButtons.length;
    syncMenuSelection();
  }
  if (edgeTrigger(state.menuSnapshot, "down", input.down)) {
    state.menuSelection = (state.menuSelection + 1) % menuButtons.length;
    syncMenuSelection();
  }
  if (edgeTrigger(state.menuSnapshot, "confirm", input.confirm)) {
    activateMenuButton(menuButtons[state.menuSelection]);
  }
  if (edgeTrigger(state.menuSnapshot, "back", input.back)) {
    navigateToArcade();
  }
}

function updateCompleteControls() {
  const input = readMenuInput();
  if (edgeTrigger(state.menuSnapshot, "confirm", input.confirm)) {
    startLevel(state.currentLevelId);
  }
  if (edgeTrigger(state.menuSnapshot, "back", input.back)) {
    navigateToArcade();
  }
}

function chooseFromPool(pool, recentCount = 4) {
  const recent = new Set(state.targetHistory.slice(-recentCount));
  const candidates = pool.filter((entry) => !recent.has(entry));
  const activePool = candidates.length > 0 ? candidates : pool;
  const value = activePool[Math.floor(Math.random() * activePool.length)];
  state.targetHistory.push(value);
  state.targetHistory = state.targetHistory.slice(-8);
  return value;
}

function createChoiceTiles(correct, pool, count) {
  const playerCount = Math.max(1, state.players.size);
  const correctCount = Math.min(MAX_PLAYERS, playerCount);
  const totalCount = Math.min(8, Math.max(count, correctCount + 3));
  const correctTiles = Array.from({ length: correctCount }, () => ({ ...correct }));
  const decoys = shuffle(pool.filter((entry) => entry.answer !== correct.answer)).slice(0, totalCount - correctTiles.length);
  return shuffle([...correctTiles, ...decoys]);
}

function maskedWord() {
  if (!state.currentWord) {
    return "";
  }
  return state.currentWord
    .split("")
    .map((letter, index) => state.wordProgress[index] || (index === state.wordProgress.length ? "_" : "_"))
    .join(" ");
}

function maskedSequence() {
  if (state.currentSequence.length === 0) {
    return "";
  }
  return state.currentSequence
    .map((item, index) => state.sequenceProgress[index] || "_")
    .join(" ");
}

function buildModeInProgress(level) {
  if (level.mode === "words") {
    return state.wordProgress.length < state.currentWord.length;
  }
  if (level.mode === "sequence") {
    return state.sequenceProgress.length < state.currentSequence.length;
  }
  return false;
}

function levelPool(level) {
  if (level.mode === "numbers") {
    return NUMBERS.map((number) => ({ label: number, answer: number }));
  }
  if (level.mode === "sequence") {
    return SEQUENCE_TILE_POOL.map((item) => ({ label: item, answer: item }));
  }
  if (level.mode === "lowercase") {
    return LETTERS.map((letter) => ({ label: letter.toLowerCase(), answer: letter }));
  }
  return LETTERS.map((letter) => ({ label: letter, answer: letter }));
}

function createRoundSpec(level) {
  if (level.mode === "sounds") {
    const word = chooseFromPool(level.soundWords || SOUND_WORDS);
    const answer = word[0];
    const choices = createChoiceTiles(
      { label: answer, answer },
      levelPool(level),
      Math.min(8, 5 + Math.floor(state.matches / 2))
    );
    return {
      target: {
        display: word,
        answer,
        promptLead: level.promptLead,
        promptValue: word,
      },
      choices,
      voiceKey: roundVoiceKey(level, "sound", word),
    };
  }

  if (level.mode === "sequence") {
    if (state.currentSequence.length === 0 || state.sequenceProgress.length >= state.currentSequence.length) {
      state.currentSequence = chooseFromPool(TRAIN_SEQUENCES, 2);
      state.sequenceProgress = [];
    }
    const answer = state.currentSequence[state.sequenceProgress.length];
    const choices = createChoiceTiles(
      { label: answer, answer },
      levelPool(level),
      6
    );
    return {
      target: {
        display: maskedSequence(),
        answer,
        promptLead: "Load",
        promptValue: state.currentSequence.join(" "),
      },
      choices,
      voiceKey: roundVoiceKey(level, "sequence", state.currentSequence.join("-"), state.sequenceProgress.length),
    };
  }

  if (level.mode === "words") {
    const wordPool = level.wordPool || BUILD_WORDS;
    if (!state.currentWord || state.wordProgress.length >= state.currentWord.length) {
      state.currentWord = chooseFromPool(wordPool, 3);
      state.wordProgress = [];
    }
    const answer = state.currentWord[state.wordProgress.length];
    const choices = createChoiceTiles(
      { label: answer, answer },
      levelPool(level),
      6
    );
    return {
      target: {
        display: maskedWord(),
        answer,
        promptLead: "Build",
        promptValue: state.currentWord,
      },
      choices,
      voiceKey: roundVoiceKey(level, "build", state.currentWord, state.wordProgress.length),
    };
  }

  const pool = levelPool(level);
  const answer = chooseFromPool(pool.map((entry) => entry.answer));
  const correct = pool.find((entry) => entry.answer === answer);
  const choices = createChoiceTiles(
    correct,
    pool,
    Math.min(8, 5 + Math.floor(state.matches / 3))
  );
  return {
    target: {
      display: level.mode === "lowercase" ? answer : correct.label,
      answer,
      promptLead: level.promptLead,
      promptValue: correct.label,
    },
    choices,
    voiceKey: roundVoiceKey(level, "find", answer),
  };
}

function tileSpawnPositions(level) {
  if (level.mode === "words" || level.mode === "sequence") {
    return shuffle([
      { x: 126, y: 222 },
      { x: 270, y: 250 },
      { x: 414, y: 222 },
      { x: 558, y: 250 },
      { x: 702, y: 222 },
      { x: 846, y: 250 },
      { x: 278, y: 340 },
      { x: 480, y: 352 },
      { x: 682, y: 340 },
    ]);
  }

  return shuffle([
    { x: 150, y: 176 },
    { x: 296, y: 134 },
    { x: 456, y: 184 },
    { x: 622, y: 132 },
    { x: 804, y: 176 },
    { x: 230, y: 316 },
    { x: 480, y: 304 },
    { x: 724, y: 316 },
  ]);
}

function spawnRound() {
  const level = currentLevel();
  const spec = createRoundSpec(level);
  state.target = spec.target;
  state.roundDelay = 0;
  const positions = tileSpawnPositions(level);

  state.tiles = spec.choices.map((choice, index) => ({
    id: `tile-${state.round}-${index}`,
    letter: choice.label,
    label: choice.label,
    answer: choice.answer,
    x: positions[index].x,
    y: positions[index].y,
    vx: randomBetween(-20, 20),
    vy: randomBetween(-14, 14),
    radius: 38,
    color: TILE_COLORS[index % TILE_COLORS.length],
    carriedBy: null,
    collected: false,
    flash: 0,
    bob: randomBetween(0, Math.PI * 2),
  }));

  if (spec.voiceKey) {
    playVoice(spec.voiceKey);
  }
}

function startLevel(levelId = state.selectedLevelId) {
  const level = levelById(levelId);
  arcadeCabinet()?.closePause?.();
  unlockVoice();
  state.screen = "play";
  menuOverlay.hidden = true;
  state.selectedLevelId = level.id;
  state.currentLevelId = level.id;
  state.round = 1;
  state.matches = 0;
  state.score = 0;
  state.attempts = 0;
  state.currentWord = "";
  state.wordProgress = [];
  state.currentSequence = [];
  state.sequenceProgress = [];
  state.targetHistory = [];
  state.paused = false;
  state.feedback = level.instruction;
  state.feedbackTimer = 1.4;
  state.sparkles = [];
  state.roundDelay = 0;
  for (const player of state.players.values()) {
    player.carrying = null;
    player.actionWasDown = false;
  }
  relayoutPlayers();
  spawnRound();
}

function overlapArea(a, b) {
  const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return width * height;
}

function tileInLaunchpad(tile) {
  return tileLaunchpadOverlap(tile) >= TILE_LAUNCHPAD_ACCEPTANCE;
}

function tileLaunchpadOverlap(tile) {
  const tileRect = {
    left: tile.x - tile.radius,
    right: tile.x + tile.radius,
    top: tile.y - tile.radius,
    bottom: tile.y + tile.radius,
  };
  const launchpadRect = {
    left: LAUNCHPAD.x - LAUNCHPAD_HITBOX_PADDING_X,
    right: LAUNCHPAD.x + LAUNCHPAD.width + LAUNCHPAD_HITBOX_PADDING_X,
    top: LAUNCHPAD.y - LAUNCHPAD_HITBOX_PADDING_Y,
    bottom: LAUNCHPAD_ACTIVE_BOTTOM,
  };
  const tileArea = (tile.radius * 2) ** 2;
  return overlapArea(tileRect, launchpadRect) / tileArea;
}

function carriedTileReadyToLaunch() {
  for (const player of state.players.values()) {
    if (!player.carrying) {
      continue;
    }
    const tile = state.tiles.find((entry) => entry.id === player.carrying);
    if (tile && tileInLaunchpad(tile)) {
      return true;
    }
  }
  return false;
}

function findNearestTile(player) {
  let best = null;
  let bestDistance = Infinity;
  for (const tile of state.tiles) {
    if (tile.collected || tile.carriedBy) {
      continue;
    }
    const distance = Math.hypot(tile.x - player.x, tile.y - player.y);
    if (distance < 68 && distance < bestDistance) {
      best = tile;
      bestDistance = distance;
    }
  }
  return best;
}

function releaseTile(player, tile) {
  tile.carriedBy = null;
  player.carrying = null;
  tile.vx = player.lastMoveX * 86 + randomBetween(-24, 24);
  tile.vy = player.lastMoveY * 86 + randomBetween(-20, 20);
}

function createSparkles(x, y, color, count = 20) {
  for (let index = 0; index < count; index += 1) {
    const angle = randomBetween(0, Math.PI * 2);
    const speed = randomBetween(80, 240);
    state.sparkles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: randomBetween(2, 5),
      life: randomBetween(0.45, 0.85),
      maxLife: 0.85,
      color,
    });
  }
}

function submitTile(player, tile) {
  const level = currentLevel();
  player.carrying = null;
  tile.carriedBy = null;
  state.attempts += 1;

  if (tile.answer === state.target.answer) {
    tile.collected = true;
    state.score += 100 + Math.max(0, 40 - state.attempts * 3);
    createSparkles(LAUNCHPAD.x + LAUNCHPAD.width / 2, LAUNCHPAD.y + 20, tile.color, 28);

    if (level.mode === "words") {
      state.wordProgress.push(tile.answer);
      const wordComplete = state.wordProgress.length >= state.currentWord.length;
      if (wordComplete) {
        state.matches += 1;
        setFeedback(`You built ${state.currentWord}.`, 1.3);
      } else {
        setFeedback(`Yes. Find ${state.currentWord[state.wordProgress.length]}.`, 1);
      }
    } else if (level.mode === "sequence") {
      state.sequenceProgress.push(tile.answer);
      const sequenceComplete = state.sequenceProgress.length >= state.currentSequence.length;
      if (sequenceComplete) {
        state.matches += 1;
        setFeedback(`Train loaded: ${state.currentSequence.join(" ")}.`, 1.3);
      } else {
        setFeedback(`Yes. Load ${state.currentSequence[state.sequenceProgress.length]}.`, 1);
      }
    } else {
      state.matches += 1;
      setFeedback(level.mode === "sounds" ? `Yes! ${state.target.answer} starts ${state.target.display}.` : `Yes! ${tile.letter}.`, 1.1);
    }

    if (state.matches >= level.goal) {
      state.screen = "complete";
      state.roundDelay = 0;
      setFeedback(`${level.shortTitle} complete.`, 3);
      createSparkles(WIDTH / 2, HEIGHT / 2, "#ffd46d", 42);
      playVoice(feedbackVoiceKey(level, "complete"));
    } else {
      const successKey = feedbackVoiceKey(level, "success");
      const successVoicePlayed = playVoice(successKey);
      const baseRoundDelay = buildModeInProgress(level) ? 0.45 : 0.72;
      state.round += 1;
      state.roundDelay = successVoicePlayed
        ? Math.max(baseRoundDelay, voiceDelaySeconds(successKey, VOICE_FEEDBACK_FALLBACK_SECONDS))
        : baseRoundDelay;
    }
    return;
  }

  tile.flash = 0.5;
  tile.x = Math.max(70, Math.min(WIDTH - 70, LAUNCHPAD.x + LAUNCHPAD.width / 2 + randomBetween(-130, 130)));
  tile.y = LAUNCHPAD.y - 34;
  tile.vx = randomBetween(-150, 150);
  tile.vy = randomBetween(-210, -130);
  setFeedback(level.mode === "numbers" ? "Try another number." : level.mode === "sequence" ? "Try the next train car." : "Try another letter.", 1.1);
  playVoice(feedbackVoiceKey(level, "tryAgain"));
}

function handlePlayerAction(player) {
  if (state.roundDelay > 0 || state.paused || state.screen !== "play") {
    return;
  }

  if (player.carrying) {
    const tile = state.tiles.find((entry) => entry.id === player.carrying);
    if (!tile) {
      player.carrying = null;
      return;
    }
    tile.x = player.x;
    tile.y = player.y - 48;
    if (tileInLaunchpad(tile)) {
      submitTile(player, tile);
    } else {
      releaseTile(player, tile);
    }
    return;
  }

  const tile = findNearestTile(player);
  if (tile) {
    tile.carriedBy = player.id;
    tile.vx = 0;
    tile.vy = 0;
    player.carrying = tile.id;
    setFeedback(`${player.label} has ${tile.letter}.`, 0.7);
  }
}

function updatePlayers(delta) {
  const dt = delta / 1000;

  for (const player of state.players.values()) {
    const input = readPlayerInput(player);

    if (state.screen !== "play" || state.paused) {
      player.actionWasDown = input.action;
      continue;
    }

    let { x, y } = input;
    const length = Math.hypot(x, y);
    if (length > 1) {
      x /= length;
      y /= length;
    }

    player.lastMoveX = x;
    player.lastMoveY = y;
    const speed = player.carrying ? player.speed * 0.9 : player.speed;
    player.x = Math.max(34, Math.min(WIDTH - 34, player.x + x * speed * dt));
    player.y = Math.max(118, Math.min(HEIGHT - 38, player.y + y * speed * dt));

    if (input.action && !player.actionWasDown) {
      handlePlayerAction(player);
    }
    player.actionWasDown = input.action;
  }
}

function updateTiles(delta) {
  const dt = delta / 1000;

  for (const tile of state.tiles) {
    tile.bob += dt * 2.4;
    tile.flash = Math.max(0, tile.flash - dt);

    if (tile.collected) {
      continue;
    }

    if (tile.carriedBy) {
      const player = state.players.get(tile.carriedBy);
      if (!player) {
        tile.carriedBy = null;
        continue;
      }
      tile.x = player.x;
      tile.y = player.y - 48;
      continue;
    }

    tile.x += tile.vx * dt;
    tile.y += tile.vy * dt;
    tile.vx *= 0.996;
    tile.vy *= 0.996;

    const minX = tile.radius + 18;
    const maxX = WIDTH - tile.radius - 18;
    const minY = 112;
    const maxY = HEIGHT - 146;
    if (tile.x < minX || tile.x > maxX) {
      tile.x = Math.max(minX, Math.min(maxX, tile.x));
      tile.vx *= -1;
    }
    if (tile.y < minY || tile.y > maxY) {
      tile.y = Math.max(minY, Math.min(maxY, tile.y));
      tile.vy *= -1;
    }
  }

  if (state.roundDelay > 0) {
    state.roundDelay -= dt;
    if (state.roundDelay <= 0 && state.screen === "play") {
      spawnRound();
    }
  }
}

function updateSparkles(delta) {
  const dt = delta / 1000;
  for (const sparkle of state.sparkles) {
    sparkle.life -= dt;
    sparkle.x += sparkle.vx * dt;
    sparkle.y += sparkle.vy * dt;
    sparkle.vy += 210 * dt;
  }
  state.sparkles = state.sparkles.filter((sparkle) => sparkle.life > 0);
}

function drawBackground() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  const level = currentLevel();
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  if (level.theme === "moon") {
    gradient.addColorStop(0, "#182136");
    gradient.addColorStop(0.58, "#27344f");
    gradient.addColorStop(1, "#4a3b58");
  } else if (level.theme === "planets") {
    gradient.addColorStop(0, "#090b25");
    gradient.addColorStop(0.55, "#172c5b");
    gradient.addColorStop(1, "#3a1c54");
  } else if (level.theme === "forest") {
    gradient.addColorStop(0, "#0f2c22");
    gradient.addColorStop(0.55, "#1e442c");
    gradient.addColorStop(1, "#15251d");
  } else if (level.theme === "workshop") {
    gradient.addColorStop(0, "#3b2630");
    gradient.addColorStop(0.58, "#403126");
    gradient.addColorStop(1, "#1d2730");
  } else if (level.theme === "dino") {
    gradient.addColorStop(0, "#21403a");
    gradient.addColorStop(0.56, "#5f5131");
    gradient.addColorStop(1, "#263128");
  } else if (level.theme === "train") {
    gradient.addColorStop(0, "#142130");
    gradient.addColorStop(0.58, "#263845");
    gradient.addColorStop(1, "#2e2620");
  } else if (level.theme === "tractor") {
    gradient.addColorStop(0, "#173b2c");
    gradient.addColorStop(0.56, "#315b2f");
    gradient.addColorStop(1, "#5a4728");
  } else if (level.theme === "dragon") {
    gradient.addColorStop(0, "#20273c");
    gradient.addColorStop(0.52, "#4a2f35");
    gradient.addColorStop(1, "#17362d");
  } else if (level.theme === "wordplus") {
    gradient.addColorStop(0, "#223038");
    gradient.addColorStop(0.56, "#332d42");
    gradient.addColorStop(1, "#20352f");
  } else {
    gradient.addColorStop(0, "#092421");
    gradient.addColorStop(0.55, "#102a2f");
    gradient.addColorStop(1, "#351d36");
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  if (level.theme === "moon") {
    ctx.fillStyle = "rgba(247, 251, 255, 0.18)";
    for (let index = 0; index < 11; index += 1) {
      const x = 72 + ((index * 149) % 820);
      const y = 128 + ((index * 67) % 340);
      ctx.beginPath();
      ctx.arc(x, y, 16 + (index % 3) * 7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(168, 243, 107, 0.55)";
    for (let index = 0; index < 8; index += 1) {
      const x = 96 + ((index * 113) % 760);
      const y = 430 + ((index * 31) % 74);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (level.theme === "planets") {
    for (let index = 0; index < 6; index += 1) {
      const x = 120 + index * 145;
      const y = 150 + Math.sin(index * 1.7) * 44;
      ctx.fillStyle = TILE_COLORS[index % TILE_COLORS.length];
      ctx.beginPath();
      ctx.arc(x, y, 22 + (index % 2) * 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(247, 251, 255, 0.24)";
      ctx.beginPath();
      ctx.ellipse(x, y, 42, 12, -0.25, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (level.theme === "forest") {
    ctx.fillStyle = "rgba(18, 13, 9, 0.45)";
    ctx.fillRect(0, HEIGHT - 92, WIDTH, 92);
    for (let index = 0; index < 12; index += 1) {
      const x = 44 + index * 84;
      ctx.fillStyle = "rgba(62, 39, 25, 0.88)";
      ctx.fillRect(x, 300 + (index % 3) * 18, 18, 190);
      ctx.fillStyle = index % 2 ? "#2d7a48" : "#3a9855";
      ctx.beginPath();
      ctx.arc(x + 9, 286 + (index % 3) * 18, 46, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (level.theme === "workshop") {
    ctx.fillStyle = "rgba(255, 212, 109, 0.16)";
    for (let x = 70; x < WIDTH; x += 118) {
      ctx.fillRect(x, 126, 44, 12);
      ctx.fillRect(x + 16, 110, 12, 44);
    }
    ctx.fillStyle = "rgba(18, 12, 8, 0.38)";
    ctx.fillRect(0, HEIGHT - 112, WIDTH, 112);
  } else if (level.theme === "dino") {
    ctx.fillStyle = "rgba(255, 212, 109, 0.2)";
    ctx.fillRect(0, HEIGHT - 116, WIDTH, 116);
    for (let index = 0; index < 7; index += 1) {
      const x = 76 + index * 132;
      const y = 150 + (index % 3) * 70;
      ctx.strokeStyle = "rgba(247, 251, 255, 0.48)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(x, y, 18, 0.2, Math.PI * 1.82);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 24, y + 4);
      ctx.lineTo(x + 62, y + 18);
      ctx.stroke();
      ctx.fillStyle = "rgba(247, 251, 255, 0.36)";
      ctx.beginPath();
      ctx.arc(x + 68, y + 20, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (level.theme === "train") {
    ctx.strokeStyle = "rgba(255, 212, 109, 0.52)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, HEIGHT - 122);
    ctx.lineTo(WIDTH, HEIGHT - 122);
    ctx.moveTo(0, HEIGHT - 82);
    ctx.lineTo(WIDTH, HEIGHT - 82);
    ctx.stroke();
    ctx.fillStyle = "rgba(247, 251, 255, 0.22)";
    for (let x = 34; x < WIDTH; x += 76) {
      ctx.fillRect(x, HEIGHT - 132, 12, 62);
    }
    ctx.fillStyle = "rgba(117, 240, 212, 0.24)";
    for (let index = 0; index < 5; index += 1) {
      const x = 110 + index * 180;
      ctx.fillRect(x, 120, 68, 18);
      ctx.fillRect(x + 10, 92, 48, 28);
    }
  } else if (level.theme === "tractor") {
    ctx.fillStyle = "rgba(168, 243, 107, 0.18)";
    for (let y = HEIGHT - 156; y < HEIGHT - 48; y += 24) {
      ctx.fillRect(0, y, WIDTH, 8);
    }
    ctx.fillStyle = "rgba(255, 212, 109, 0.42)";
    ctx.beginPath();
    ctx.arc(804, 128, 34, 0, Math.PI * 2);
    ctx.fill();
    for (let index = 0; index < 12; index += 1) {
      const x = 52 + index * 78;
      const y = 328 + (index % 4) * 28;
      ctx.fillStyle = index % 2 ? "#ffd46d" : "#a8f36b";
      ctx.fillRect(x, y, 28, 16);
    }
  } else if (level.theme === "dragon") {
    ctx.fillStyle = "rgba(255, 212, 109, 0.18)";
    for (let index = 0; index < 7; index += 1) {
      const x = 92 + index * 132;
      const y = 168 + (index % 2) * 78;
      ctx.beginPath();
      ctx.ellipse(x, y, 24, 32, 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(117, 240, 212, 0.36)";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(255, 124, 134, 0.26)";
    for (let index = 0; index < 6; index += 1) {
      const x = 142 + index * 142;
      ctx.beginPath();
      ctx.moveTo(x, 394);
      ctx.quadraticCurveTo(x + 26, 340, x + 48, 394);
      ctx.quadraticCurveTo(x + 24, 372, x, 394);
      ctx.fill();
    }
  } else if (level.theme === "wordplus") {
    ctx.fillStyle = "rgba(247, 251, 255, 0.12)";
    for (let y = 132; y <= 292; y += 80) {
      ctx.fillRect(64, y, WIDTH - 128, 12);
    }
    const shelfLetters = ["A", "B", "C", "D", "E", "F", "G", "O", "R", "S", "T", "W"];
    shelfLetters.forEach((letter, index) => {
      const x = 92 + (index % 6) * 136;
      const y = 92 + Math.floor(index / 6) * 80;
      ctx.fillStyle = TILE_COLORS[index % TILE_COLORS.length];
      roundRectPath(x, y, 40, 40, 6);
      ctx.fill();
      ctx.fillStyle = "#0d1720";
      ctx.font = "900 24px Avenir Next, Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(letter, x + 20, y + 23);
    });
  } else {
    ctx.fillStyle = "rgba(247, 251, 255, 0.34)";
    for (let index = 0; index < 36; index += 1) {
      const x = (index * 137) % WIDTH;
      const y = 24 + ((index * 71) % 410);
      ctx.fillRect(x, y, 2, 2);
    }
  }

  ctx.strokeStyle = level.theme === "forest" ? "rgba(168, 243, 107, 0.12)" : "rgba(117, 240, 212, 0.14)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= WIDTH; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 104);
    ctx.lineTo(x, HEIGHT - 132);
    ctx.stroke();
  }
  for (let y = 120; y <= HEIGHT - 150; y += 80) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }
}

function drawPrompt() {
  const level = currentLevel();
  ctx.save();
  if (level.mode === "words" || level.mode === "sequence") {
    const panelWidth = 540;
    const panelHeight = 154;
    const panelX = WIDTH / 2 - panelWidth / 2;
    const panelY = 14;
    ctx.shadowColor = "rgba(0, 0, 0, 0.34)";
    ctx.shadowBlur = 18;
    roundRectPath(panelX, panelY, panelWidth, panelHeight, 8);
    ctx.fillStyle = "rgba(8, 13, 24, 0.78)";
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(117, 240, 212, 0.22)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(247, 251, 255, 0.82)";
  ctx.font = "800 26px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText(state.target.promptLead || level.promptLead, WIDTH / 2, 42);

  ctx.fillStyle = "#ffd46d";
  ctx.font = level.mode === "words" || level.mode === "sequence" ? "900 74px Avenir Next, Segoe UI, sans-serif" : "900 92px Avenir Next, Segoe UI, sans-serif";
  ctx.shadowColor = "rgba(255, 212, 109, 0.58)";
  ctx.shadowBlur = 20;
  ctx.fillText(state.target.display, WIDTH / 2, 124);
  if (level.mode === "lowercase") {
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(247, 251, 255, 0.72)";
    ctx.font = "800 20px Avenir Next, Segoe UI, sans-serif";
    ctx.fillText(`Find little ${state.target.promptValue}`, WIDTH / 2, 154);
  } else if (level.mode === "sounds") {
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(247, 251, 255, 0.72)";
    ctx.font = "800 20px Avenir Next, Segoe UI, sans-serif";
    ctx.fillText(`Find the first sound`, WIDTH / 2, 154);
  } else if (level.mode === "numbers") {
    drawCountingDots(Number(state.target.answer), WIDTH / 2, 154);
  } else if (level.mode === "sequence") {
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(247, 251, 255, 0.72)";
    ctx.font = "800 20px Avenir Next, Segoe UI, sans-serif";
    ctx.fillText(state.target.promptValue, WIDTH / 2, 154);
  } else if (level.mode === "words") {
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(247, 251, 255, 0.72)";
    ctx.font = "800 20px Avenir Next, Segoe UI, sans-serif";
    ctx.fillText(state.target.promptValue, WIDTH / 2, 154);
  }
  ctx.restore();
}

function drawCountingDots(count, centerX, y) {
  if (!Number.isFinite(count)) {
    return;
  }
  const spacing = 18;
  const startX = centerX - ((count - 1) * spacing) / 2;
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255, 212, 109, 0.82)";
  for (let index = 0; index < count; index += 1) {
    ctx.beginPath();
    ctx.arc(startX + index * spacing, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLaunchpad() {
  ctx.save();
  const level = currentLevel();
  const ready = carriedTileReadyToLaunch();
  const centerX = LAUNCHPAD.x + LAUNCHPAD.width / 2;
  const glow = ctx.createRadialGradient(centerX, LAUNCHPAD.y + 34, 16, centerX, LAUNCHPAD.y + 34, ready ? 230 : 160);
  glow.addColorStop(0, ready ? "rgba(117, 240, 212, 0.5)" : "rgba(255, 212, 109, 0.38)");
  glow.addColorStop(1, "rgba(255, 212, 109, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(LAUNCHPAD.x - 110, LAUNCHPAD.y - 90, LAUNCHPAD.width + 220, HEIGHT - LAUNCHPAD.y + 120);

  if (ready) {
    ctx.fillStyle = "rgba(117, 240, 212, 0.16)";
    roundRectPath(
      LAUNCHPAD.x - LAUNCHPAD_HITBOX_PADDING_X,
      LAUNCHPAD.y - LAUNCHPAD_HITBOX_PADDING_Y,
      LAUNCHPAD.width + LAUNCHPAD_HITBOX_PADDING_X * 2,
      LAUNCHPAD_ACTIVE_BOTTOM - LAUNCHPAD.y + LAUNCHPAD_HITBOX_PADDING_Y,
      10
    );
    ctx.fill();
  }

  roundRectPath(LAUNCHPAD.x, LAUNCHPAD.y, LAUNCHPAD.width, LAUNCHPAD.height, 8);
  ctx.fillStyle = ready ? "rgba(15, 52, 48, 0.92)" : "rgba(12, 20, 26, 0.9)";
  ctx.fill();
  ctx.strokeStyle = ready ? "#75f0d4" : "#ffd46d";
  ctx.lineWidth = ready ? 6 : 4;
  ctx.setLineDash(ready ? [] : [14, 10]);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = ready ? "#ffd46d" : "#75f0d4";
  ctx.font = "900 18px Avenir Next, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(ready ? level.readyLabel : level.launchLabel, centerX, LAUNCHPAD.y + 34);
  ctx.fillStyle = "rgba(247, 251, 255, 0.72)";
  ctx.font = "700 16px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText(state.roundDelay > 0 ? "Great!" : ready ? level.dropCopy : "Bring the match here", centerX, LAUNCHPAD.y + 60);
  ctx.restore();
}

function drawTiles() {
  for (const tile of state.tiles) {
    if (tile.collected) {
      continue;
    }
    const lift = tile.carriedBy ? 0 : Math.sin(tile.bob) * 4;
    const x = tile.x;
    const y = tile.y + lift;
    const size = tile.radius * 2;

    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = tile.flash > 0 ? "rgba(255, 124, 134, 0.8)" : "rgba(0, 0, 0, 0.34)";
    ctx.shadowBlur = tile.flash > 0 ? 24 : 12;
    roundRectPath(-tile.radius, -tile.radius, size, size, 8);
    ctx.fillStyle = tile.flash > 0 ? "#ff7c86" : tile.color;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(8, 11, 16, 0.3)";
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#0d1720";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 52px Avenir Next, Segoe UI, sans-serif";
    ctx.fillText(tile.letter, 0, 3);
    ctx.restore();
  }
}

function drawPlayer(player) {
  const inputTilt = Math.max(-0.35, Math.min(0.35, player.lastMoveX * 0.2));
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(inputTilt);

  ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
  ctx.beginPath();
  ctx.ellipse(0, 22, 23, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.moveTo(0, -28);
  ctx.lineTo(19, 8);
  ctx.lineTo(10, 23);
  ctx.lineTo(-10, 23);
  ctx.lineTo(-19, 8);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#f7fbff";
  ctx.beginPath();
  ctx.arc(0, -3, 8, 0, Math.PI * 2);
  ctx.fill();

  if (Math.abs(player.lastMoveX) + Math.abs(player.lastMoveY) > 0.1) {
    ctx.fillStyle = "#ffd46d";
    ctx.beginPath();
    ctx.moveTo(-8, 22);
    ctx.lineTo(0, 38 + Math.sin(performance.now() / 80) * 4);
    ctx.lineTo(8, 22);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "900 13px Avenir Next, Segoe UI, sans-serif";
  ctx.fillStyle = "#f7fbff";
  ctx.fillText(player.label, player.x, player.y + 48);
  ctx.restore();
}

function drawPlayers() {
  for (const player of state.players.values()) {
    drawPlayer(player);
  }
}

function drawSparkles() {
  for (const sparkle of state.sparkles) {
    const alpha = Math.max(0, sparkle.life / sparkle.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = sparkle.color;
    ctx.beginPath();
    ctx.arc(sparkle.x, sparkle.y, sparkle.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawPausedOverlay() {
  if (!state.paused || state.screen !== "play") {
    return;
  }

  ctx.fillStyle = "rgba(6, 10, 14, 0.68)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#f7fbff";
  ctx.textAlign = "center";
  ctx.font = "900 48px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText("Paused", WIDTH / 2, HEIGHT / 2 - 4);
  ctx.font = "700 18px Avenir Next, Segoe UI, sans-serif";
  ctx.fillStyle = "rgba(247, 251, 255, 0.72)";
  ctx.fillText("Press Start or P to keep going.", WIDTH / 2, HEIGHT / 2 + 32);
}

function drawCompleteOverlay() {
  if (state.screen !== "complete") {
    return;
  }
  const level = currentLevel();

  ctx.fillStyle = "rgba(6, 10, 14, 0.68)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd46d";
  ctx.font = "900 54px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText(`Level ${level.id} Complete`, WIDTH / 2, HEIGHT / 2 - 36);
  ctx.fillStyle = "#f7fbff";
  ctx.font = "800 24px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText(`${state.matches} ${level.completeLine}`, WIDTH / 2, HEIGHT / 2 + 6);
  ctx.fillStyle = "rgba(247, 251, 255, 0.74)";
  ctx.font = "700 18px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText("Press A to practice again. Press B for Arcade.", WIDTH / 2, HEIGHT / 2 + 42);
}

function controllerStatusText() {
  const controllerPlayers = [...state.players.values()].filter((player) => player.source === "gamepad");
  if (controllerPlayers.length === 0) {
    return "Keyboard fallback ready.";
  }
  return controllerPlayers.map((player) => `${player.label} on ${player.controllerName}`).join(" | ");
}

function syncUi() {
  const level = currentLevel();
  ui.round.textContent = String(state.round);
  ui.target.textContent = state.target.display;
  ui.goal.textContent = `${state.matches}/${level.goal}`;
  ui.players.textContent = String(state.players.size);

  let statusText = state.feedbackTimer > 0 ? state.feedback : controllerStatusText();
  if (state.screen === "menu") {
    statusText = `${selectedLevel().shortTitle} is ready.`;
  } else if (state.screen === "complete") {
    statusText = `${level.shortTitle} complete.`;
  }

  if (statusText !== state.lastStatusText) {
    ui.status.textContent = statusText;
    state.lastStatusText = statusText;
  }

  if (state.screen === "menu") {
    ui.hint.textContent = `${voiceDisclosure()}Choose a level. A starts. B returns to Arcade.`;
  } else if (state.screen === "complete") {
    ui.hint.textContent = `${voiceDisclosure()}A practices Level ${level.id} again. B returns to Arcade.`;
  } else if (state.players.size > 1) {
    ui.hint.textContent = `${voiceDisclosure()}Grab a letter with A, drop it on the launchpad, and extra pads join with Start.`;
  } else {
    ui.hint.textContent = `${voiceDisclosure()}Move, grab with A or Space, and drop in the glowing zone. Start/Esc opens level choices.`;
  }
}

function render() {
  cabinetStage.syncContext(ctx);
  drawBackground();
  drawLaunchpad();
  drawTiles();
  drawPrompt();
  drawPlayers();
  drawSparkles();
  drawPausedOverlay();
  drawCompleteOverlay();
  syncUi();
}

function update(timestamp) {
  ensureInputRoster();

  if (state.lastTime === 0) {
    state.lastTime = timestamp;
  }
  const delta = Math.min(50, timestamp - state.lastTime);
  state.lastTime = timestamp;

  state.feedbackTimer = Math.max(0, state.feedbackTimer - delta / 1000);

  if (state.screen === "menu") {
    updateMenuControls();
  } else if (state.screen === "complete") {
    updateCompleteControls();
  } else {
    updatePlayers(delta);
    if (!state.paused) {
      updateTiles(delta);
    }
  }
  updateSparkles(delta);

  render();
  requestAnimationFrame(update);
}

function onKeyChange(code, isDown) {
  if (code === "ArrowLeft" || code === "KeyA") {
    state.keyboard.left = isDown;
  } else if (code === "ArrowRight" || code === "KeyD") {
    state.keyboard.right = isDown;
  } else if (code === "ArrowUp" || code === "KeyW") {
    state.keyboard.up = isDown;
  } else if (code === "ArrowDown" || code === "KeyS") {
    state.keyboard.down = isDown;
  } else if (code === "Space") {
    state.keyboard.action = isDown;
  } else if (code === "Enter") {
    state.keyboard.start = isDown;
  } else if (code === "Escape" || code === "KeyB") {
    state.keyboard.back = isDown;
  }
}

window.addEventListener("keydown", (event) => {
  if (event.code === "KeyP" && !event.repeat && state.screen === "play") {
    state.paused = !state.paused;
    return;
  }
  if (event.code === "KeyR" && !event.repeat) {
    startLevel(state.currentLevelId);
    return;
  }

  const handledCodes = [
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "KeyA",
    "KeyD",
    "KeyW",
    "KeyS",
    "Space",
    "Enter",
    "KeyB",
  ];
  if (handledCodes.includes(event.code)) {
    event.preventDefault();
    onKeyChange(event.code, true);
  }
});

window.addEventListener("keyup", (event) => {
  const handledCodes = [
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "KeyA",
    "KeyD",
    "KeyW",
    "KeyS",
    "Space",
    "Enter",
    "Escape",
    "KeyB",
  ];
  if (handledCodes.includes(event.code)) {
    event.preventDefault();
    onKeyChange(event.code, false);
  }
});

menuButtons.forEach((button, index) => {
  button.addEventListener("pointerenter", () => {
    state.menuSelection = index;
    syncMenuSelection();
  });
  button.addEventListener("click", () => {
    state.menuSelection = index;
    syncMenuSelection();
    activateMenuButton(button);
  });
});

window.addEventListener("gamepadconnected", ensureInputRoster);
window.addEventListener("gamepaddisconnected", ensureInputRoster);

loadVoiceManifest();
ensureInputRoster();
spawnRound();
syncMenuSelection();
render();
requestAnimationFrame(update);
