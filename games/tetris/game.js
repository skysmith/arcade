const BOARD_COUNT = 4;
const arcadeCabinet = window.ArcadeCabinet || null;
const BUILD_NUMBER = "2026.04.12.5";
const COLS = 10;
const ROWS = 20;
const HIDDEN_ROWS = 2;
const LOCK_DELAY_MS = 500;
const DAS_MS = 150;
const ARR_MS = 55;
const SOFT_DROP_INTERVAL = 28;
const GAMEPAD_AXIS_THRESHOLD = 0.45;

const BOARD_SIZES = {
  1: { cell: 16, previewCell: 12 },
  2: { cell: 22, previewCell: 18 },
  3: { cell: 22, previewCell: 18 },
  4: { cell: 22, previewCell: 18 },
};

const COLORS = {
  I: "#49d7ff",
  J: "#4f72ff",
  L: "#ff9d3c",
  O: "#ffd84c",
  S: "#5af78e",
  T: "#d979ff",
  Z: "#ff5d73",
  ghost: "rgba(196, 224, 255, 0.18)",
  grid: "rgba(255, 255, 255, 0.05)",
  frame: "#172036",
  text: "#eef4ff",
};

const PIECES = {
  I: [
    [[0, 1], [1, 1], [2, 1], [3, 1]],
    [[2, 0], [2, 1], [2, 2], [2, 3]],
    [[0, 2], [1, 2], [2, 2], [3, 2]],
    [[1, 0], [1, 1], [1, 2], [1, 3]],
  ],
  J: [
    [[0, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [2, 2]],
    [[1, 0], [1, 1], [0, 2], [1, 2]],
  ],
  L: [
    [[2, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [1, 1], [1, 2], [2, 2]],
    [[0, 1], [1, 1], [2, 1], [0, 2]],
    [[0, 0], [1, 0], [1, 1], [1, 2]],
  ],
  O: [
    [[1, 0], [2, 0], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [2, 1]],
  ],
  S: [
    [[1, 0], [2, 0], [0, 1], [1, 1]],
    [[1, 0], [1, 1], [2, 1], [2, 2]],
    [[1, 1], [2, 1], [0, 2], [1, 2]],
    [[0, 0], [0, 1], [1, 1], [1, 2]],
  ],
  T: [
    [[1, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [1, 1], [2, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [1, 2]],
    [[1, 0], [0, 1], [1, 1], [1, 2]],
  ],
  Z: [
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    [[2, 0], [1, 1], [2, 1], [1, 2]],
    [[0, 1], [1, 1], [1, 2], [2, 2]],
    [[1, 0], [0, 1], [1, 1], [0, 2]],
  ],
};

const SPAWN_X = { I: 3, J: 3, L: 3, O: 3, S: 3, T: 3, Z: 3 };

const GLOBAL_INPUT_STATE = {
  pause: false,
  restart: false,
};

const GAMEPAD_ACTIONS = {
  left: (pad) => buttonPressed(pad, 14) || axisPressed(pad, 0, -1),
  right: (pad) => buttonPressed(pad, 15) || axisPressed(pad, 0, 1),
  down: (pad) => buttonPressed(pad, 13) || axisPressed(pad, 1, 1),
  rotateCW: (pad) => buttonPressed(pad, 0) || buttonPressed(pad, 5),
  rotateCCW: (pad) => buttonPressed(pad, 2) || buttonPressed(pad, 4),
  hold: (pad) => buttonPressed(pad, 1),
  hardDrop: (pad) => buttonPressed(pad, 3),
};

const BOARD_CONTROL_SCHEMES = {
  1: {
    left: ["ArrowLeft"],
    right: ["ArrowRight"],
    down: ["ArrowDown"],
    rotateCW: ["ArrowUp", "KeyX"],
    rotateCCW: ["KeyZ"],
    hold: ["KeyC"],
    hardDrop: ["Space"],
  },
  2: {
    left: ["KeyA"],
    right: ["KeyD"],
    down: ["KeyS"],
    rotateCW: ["KeyW"],
    rotateCCW: ["KeyQ"],
    hold: ["KeyE"],
    hardDrop: ["KeyF"],
  },
  3: {
    left: ["KeyJ"],
    right: ["KeyL"],
    down: ["KeyK"],
    rotateCW: ["KeyI"],
    rotateCCW: ["KeyU"],
    hold: ["KeyO"],
    hardDrop: ["BracketLeft"],
  },
  4: {
    left: ["Numpad4"],
    right: ["Numpad6"],
    down: ["Numpad5"],
    rotateCW: ["Numpad8"],
    rotateCCW: ["Numpad7"],
    hold: ["Numpad9"],
    hardDrop: ["Numpad0"],
  },
};

function createBoardInputState() {
  return {
    left: false,
    right: false,
    down: false,
    rotateCW: false,
    rotateCCW: false,
    hardDrop: false,
    hold: false,
  };
}

function createBoardRepeatTracker() {
  return {
    left: { active: false, nextFire: 0 },
    right: { active: false, nextFire: 0 },
    down: { active: false, nextFire: 0 },
  };
}

const boardInputStates = Object.fromEntries(
  Array.from({ length: BOARD_COUNT }, (_, index) => [index + 1, createBoardInputState()])
);

const gamepadInputState = createBoardInputState();
const gamepadGlobalInputState = { pause: false, restart: false };
const gamepadPressedState = {
  left: false,
  right: false,
  down: false,
  rotateCW: false,
  rotateCCW: false,
  hardDrop: false,
  hold: false,
};
const controllerStatus = {
  connected: false,
  name: "",
};

const boardRepeatTrackers = Object.fromEntries(
  Array.from({ length: BOARD_COUNT }, (_, index) => [index + 1, createBoardRepeatTracker()])
);

const ui = {
  connection: document.getElementById("connection-status"),
  buildNumber: document.getElementById("build-number"),
  phase: document.getElementById("phase-label"),
  message: document.getElementById("message-label"),
  score: document.getElementById("score-value"),
  live: document.getElementById("live-value"),
  lines: document.getElementById("lines-value"),
  level: document.getElementById("level-value"),
  footerHint: document.getElementById("footer-hint"),
  footerStatus: document.getElementById("footer-status"),
  boardGrid: document.getElementById("board-grid"),
  bridgeStatus: document.getElementById("bridge-status"),
  settingsButton: document.getElementById("settings-button"),
  settingsModal: document.getElementById("settings-modal"),
  settingsClose: document.getElementById("settings-close"),
  modeClassic: document.getElementById("mode-classic"),
  modeMultitap: document.getElementById("mode-multitap"),
  musicToggle: document.getElementById("music-toggle"),
  trackSelect: document.getElementById("track-select"),
  musicHelp: document.getElementById("music-help"),
};

const gameState = {
  started: false,
  paused: false,
  mode: "classic",
  lastTime: 0,
  musicEnabled: false,
  musicTrack: "midnight",
};
let gameOverMenuShown = false;
let audioContext = null;
let audioMasterGain = null;
let audioLowpass = null;
let audioNextStepTime = 0;
let audioStepIndex = 0;
let pausedBeforeArcadeMenu = false;

const MUSIC_TRACKS = {
  midnight: {
    bpm: 82,
    bass: [36, null, 36, null, 43, null, 41, null, 34, null, 34, null, 43, null, 41, null],
    lead: [67, 70, 72, 70, 65, 67, 70, 67, 63, 67, 70, 67, 65, 67, 63, 60],
    pad: [48, 53, 46, 51],
  },
  pixelRain: {
    bpm: 96,
    bass: [41, null, 41, null, 38, null, 36, null, 41, null, 41, null, 43, null, 38, null],
    lead: [72, 74, 77, 74, 70, 72, 74, 77, 69, 72, 74, 72, 67, 69, 72, 74],
    pad: [53, 50, 48, 55],
  },
};

const boards = Array.from({ length: BOARD_COUNT }, (_, zeroIndex) => createBoardState(zeroIndex + 1));
ui.buildNumber.textContent = `build ${BUILD_NUMBER}`;

function createBoardState(index) {
  const boardCanvas = document.getElementById(`board-canvas-${index}`);
  const holdCanvas = document.getElementById(`hold-canvas-${index}`);
  const nextCanvas = document.getElementById(`next-canvas-${index}`);
  const { cell, previewCell } = BOARD_SIZES[index];

  return {
    index,
    cardEl: document.querySelector(`[data-board-card="${index}"]`),
    ctx: boardCanvas.getContext("2d"),
    holdCtx: holdCanvas.getContext("2d"),
    nextCtx: nextCanvas.getContext("2d"),
    boardCanvas,
    holdCanvas,
    nextCanvas,
    phaseEl: document.getElementById(`board-phase-${index}`),
    scoreEl: document.getElementById(`board-score-${index}`),
    linesEl: document.getElementById(`board-lines-${index}`),
    cell,
    previewCell,
    boardWidth: COLS * cell,
    boardHeight: ROWS * cell,
    board: createEmptyBoard(),
    bag: [],
    queue: [],
    active: null,
    hold: null,
    holdLocked: false,
    score: 0,
    lines: 0,
    level: 1,
    dropAccumulator: 0,
    lockAccumulator: 0,
    gameOver: false,
    justCleared: 0,
    lineFlashMs: 0,
  };
}

function createEmptyBoard() {
  return Array.from({ length: ROWS + HIDDEN_ROWS }, () => Array(COLS).fill(null));
}

function buttonPressed(pad, index) {
  return Boolean(pad?.buttons?.[index]?.pressed);
}

function axisPressed(pad, index, direction) {
  const value = pad?.axes?.[index] ?? 0;
  return direction < 0 ? value <= -GAMEPAD_AXIS_THRESHOLD : value >= GAMEPAD_AXIS_THRESHOLD;
}

function resetGamepadState() {
  Object.keys(gamepadInputState).forEach((key) => {
    gamepadInputState[key] = false;
  });
  Object.keys(gamepadGlobalInputState).forEach((key) => {
    gamepadGlobalInputState[key] = false;
  });
  Object.keys(gamepadPressedState).forEach((key) => {
    gamepadPressedState[key] = false;
  });
  controllerStatus.connected = false;
  controllerStatus.name = "";
}

function getActiveGamepad() {
  if (typeof navigator === "undefined" || typeof navigator.getGamepads !== "function") {
    return null;
  }

  const pads = navigator.getGamepads();
  for (const pad of pads) {
    if (pad?.connected) {
      return pad;
    }
  }

  return null;
}

function syncGamepadInput() {
  if (gameState.mode !== "classic") {
    resetGamepadState();
    return;
  }

  const pad = getActiveGamepad();
  if (!pad) {
    resetGamepadState();
    return;
  }

  controllerStatus.connected = true;
  controllerStatus.name = String(pad.id || "Gamepad").trim() || "Gamepad";

  const currentState = Object.fromEntries(
    Object.entries(GAMEPAD_ACTIONS).map(([action, resolver]) => [action, resolver(pad)])
  );

  gamepadInputState.left = currentState.left;
  gamepadInputState.right = currentState.right;
  gamepadInputState.down = currentState.down;

  ["rotateCW", "rotateCCW", "hardDrop", "hold"].forEach((action) => {
    if (currentState[action] && !gamepadPressedState[action]) {
      gamepadInputState[action] = true;
    }
  });

  ["pause", "restart"].forEach((action) => {
    if (currentState[action] && !gamepadPressedState[action]) {
      gamepadGlobalInputState[action] = true;
    }
  });

  Object.keys(gamepadPressedState).forEach((action) => {
    gamepadPressedState[action] = Boolean(currentState[action]);
  });
}

function getActiveBoards() {
  return gameState.mode === "multitap" ? boards : [boards[0]];
}

function getActiveLiveBoards() {
  return getActiveBoards().filter((boardState) => !boardState.gameOver && boardState.active);
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function primeQueue(boardState) {
  while (boardState.queue.length < 5) {
    if (boardState.bag.length === 0) {
      boardState.bag = shuffle(["I", "J", "L", "O", "S", "T", "Z"]);
    }
    boardState.queue.push(boardState.bag.pop());
  }
}

function spawnPiece(boardState, unlockHold = true) {
  primeQueue(boardState);
  const type = boardState.queue.shift();
  boardState.active = { type, rotation: 0, x: SPAWN_X[type], y: 0 };
  boardState.holdLocked = !unlockHold;
  boardState.lockAccumulator = 0;
  primeQueue(boardState);
  if (collides(boardState, boardState.active.x, boardState.active.y, boardState.active.rotation)) {
    boardState.gameOver = true;
  }
}

function resetBoard(boardState) {
  boardState.board = createEmptyBoard();
  boardState.bag = [];
  boardState.queue = [];
  boardState.active = null;
  boardState.hold = null;
  boardState.holdLocked = false;
  boardState.score = 0;
  boardState.lines = 0;
  boardState.level = 1;
  boardState.dropAccumulator = 0;
  boardState.lockAccumulator = 0;
  boardState.gameOver = false;
  boardState.justCleared = 0;
  boardState.lineFlashMs = 0;
  primeQueue(boardState);
  spawnPiece(boardState);
}

function resetGame() {
  gameOverMenuShown = false;
  arcadeCabinet?.closeResults?.();
  boards.forEach(resetBoard);
  gameState.started = false;
  gameState.paused = false;
  gameState.lastTime = 0;
  Object.values(boardInputStates).forEach((state) => {
    Object.keys(state).forEach((key) => {
      state[key] = false;
    });
  });
  Object.values(boardRepeatTrackers).forEach((trackerSet) => {
    Object.values(trackerSet).forEach((tracker) => {
      tracker.active = false;
      tracker.nextFire = 0;
    });
  });
  resetGamepadState();
  applyModeVisuals();
  syncMusicUi();
  syncHud();
}

function applyModeVisuals() {
  ui.boardGrid.classList.toggle("classic-mode", gameState.mode === "classic");
  ui.boardGrid.classList.toggle("multitap-mode", gameState.mode === "multitap");
  ui.modeClassic.classList.toggle("is-active", gameState.mode === "classic");
  ui.modeMultitap.classList.toggle("is-active", gameState.mode === "multitap");
}

function setMode(mode) {
  gameState.mode = mode;
  if (mode !== "classic") {
    resetGamepadState();
  }
  applyModeVisuals();
  syncHud();
}

function syncMusicUi() {
  ui.musicToggle.textContent = gameState.musicEnabled ? "Music On" : "Music Off";
  ui.musicToggle.classList.toggle("is-active", gameState.musicEnabled);
  ui.trackSelect.value = gameState.musicTrack;
}

function midiToFreq(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}

function ensureAudio() {
  if (audioContext) return audioContext;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) {
    ui.musicHelp.textContent = "This browser does not expose Web Audio for the built-in music.";
    return null;
  }
  audioContext = new Ctx();
  audioMasterGain = audioContext.createGain();
  audioMasterGain.gain.value = 0.16;
  audioLowpass = audioContext.createBiquadFilter();
  audioLowpass.type = "lowpass";
  audioLowpass.frequency.value = 1800;
  audioLowpass.Q.value = 0.9;
  audioLowpass.connect(audioMasterGain);
  audioMasterGain.connect(audioContext.destination);
  audioNextStepTime = audioContext.currentTime;
  audioStepIndex = 0;
  return audioContext;
}

async function armMusic() {
  if (!gameState.musicEnabled) return;
  const ctx = ensureAudio();
  if (!ctx) return;
  if (ctx.state !== "running") {
    try {
      await ctx.resume();
    } catch {
      ui.musicHelp.textContent = "The browser blocked audio resume. Try another input.";
      return;
    }
  }
}

function scheduleTone(type, frequency, startTime, duration, volume, attack = 0.01, release = 0.12) {
  if (!audioContext || !audioLowpass) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + release);
  osc.connect(gain);
  gain.connect(audioLowpass);
  osc.start(startTime);
  osc.stop(startTime + duration + release + 0.02);
}

function schedulePad(rootMidi, startTime, stepDuration) {
  [0, 7, 12].forEach((interval, index) => {
    scheduleTone("triangle", midiToFreq(rootMidi + interval), startTime, stepDuration * 3.6, 0.035 - index * 0.007, 0.08, 0.25);
  });
}

function updateMusicScheduler() {
  if (!gameState.musicEnabled) return;
  const ctx = ensureAudio();
  if (!ctx || ctx.state !== "running") return;
  const track = MUSIC_TRACKS[gameState.musicTrack];
  const stepDuration = 60 / track.bpm / 2;
  while (audioNextStepTime < ctx.currentTime + 0.18) {
    const step = audioStepIndex % 16;
    const bassMidi = track.bass[step];
    const leadMidi = track.lead[step];
    if (bassMidi !== null) {
      scheduleTone("triangle", midiToFreq(bassMidi), audioNextStepTime, stepDuration * 0.9, 0.08, 0.01, 0.16);
    }
    if (leadMidi !== null) {
      scheduleTone("square", midiToFreq(leadMidi), audioNextStepTime + 0.015, stepDuration * 0.55, 0.045, 0.008, 0.12);
    }
    if (step % 4 === 0) {
      schedulePad(track.pad[(step / 4) % track.pad.length], audioNextStepTime, stepDuration);
    }
    audioNextStepTime += stepDuration;
    audioStepIndex += 1;
  }
}

function setMusicEnabled(enabled) {
  gameState.musicEnabled = enabled;
  if (!enabled && audioContext) {
    audioMasterGain.gain.cancelScheduledValues(audioContext.currentTime);
    audioMasterGain.gain.setTargetAtTime(0, audioContext.currentTime, 0.03);
  }
  if (enabled && audioContext) {
    audioMasterGain.gain.cancelScheduledValues(audioContext.currentTime);
    audioMasterGain.gain.setTargetAtTime(0.16, audioContext.currentTime, 0.08);
    audioNextStepTime = audioContext.currentTime;
  }
  syncMusicUi();
}

function setMusicTrack(trackName) {
  gameState.musicTrack = trackName;
  if (audioContext) {
    audioNextStepTime = audioContext.currentTime;
    audioStepIndex = 0;
  }
  syncMusicUi();
}

function getCells(boardState, piece = boardState.active) {
  return PIECES[piece.type][piece.rotation].map(([x, y]) => ({
    x: piece.x + x,
    y: piece.y + y,
  }));
}

function collides(boardState, x, y, rotation, type = boardState.active.type) {
  return PIECES[type][rotation].some(([dx, dy]) => {
    const cellX = x + dx;
    const cellY = y + dy;
    if (cellX < 0 || cellX >= COLS || cellY >= ROWS + HIDDEN_ROWS) return true;
    if (cellY < 0) return false;
    return Boolean(boardState.board[cellY][cellX]);
  });
}

function movePiece(boardState, dx, dy) {
  if (boardState.gameOver) return false;
  const nextX = boardState.active.x + dx;
  const nextY = boardState.active.y + dy;
  if (collides(boardState, nextX, nextY, boardState.active.rotation)) return false;
  boardState.active.x = nextX;
  boardState.active.y = nextY;
  if (dx !== 0) boardState.lockAccumulator = 0;
  return true;
}

function rotatePiece(boardState, direction) {
  if (boardState.gameOver) return;
  const nextRotation = (boardState.active.rotation + direction + 4) % 4;
  for (const offset of [0, -1, 1, -2, 2]) {
    const nextX = boardState.active.x + offset;
    if (!collides(boardState, nextX, boardState.active.y, nextRotation)) {
      boardState.active.rotation = nextRotation;
      boardState.active.x = nextX;
      boardState.lockAccumulator = 0;
      return;
    }
  }
}

function holdPiece(boardState) {
  if (boardState.gameOver || boardState.holdLocked) return;
  const previousHold = boardState.hold;
  boardState.hold = boardState.active.type;
  boardState.holdLocked = true;
  boardState.lockAccumulator = 0;
  if (previousHold) {
    boardState.active = { type: previousHold, rotation: 0, x: SPAWN_X[previousHold], y: 0 };
    if (collides(boardState, boardState.active.x, boardState.active.y, boardState.active.rotation)) {
      boardState.gameOver = true;
    }
  } else {
    spawnPiece(boardState, false);
  }
}

function hardDrop(boardState) {
  if (boardState.gameOver) return;
  let distance = 0;
  while (movePiece(boardState, 0, 1)) distance += 1;
  boardState.score += distance * 2;
  lockPiece(boardState);
}

function lockPiece(boardState) {
  for (const cell of getCells(boardState)) {
    if (cell.y < 0) {
      boardState.gameOver = true;
      continue;
    }
    boardState.board[cell.y][cell.x] = boardState.active.type;
  }
  clearLines(boardState);
  if (!boardState.gameOver) spawnPiece(boardState);
}

function clearLines(boardState) {
  const clearedRows = [];
  for (let y = 0; y < boardState.board.length; y += 1) {
    if (boardState.board[y].every(Boolean)) clearedRows.push(y);
  }
  if (clearedRows.length === 0) {
    boardState.justCleared = 0;
    return;
  }
  boardState.justCleared = clearedRows.length;
  boardState.lineFlashMs = 120;
  for (const y of [...clearedRows].sort((a, b) => b - a)) {
    boardState.board.splice(y, 1);
    boardState.board.unshift(Array(COLS).fill(null));
  }
  boardState.lines += clearedRows.length;
  boardState.score += [0, 100, 300, 500, 800][clearedRows.length] * boardState.level;
  boardState.level = Math.floor(boardState.lines / 10) + 1;
}

function getDropInterval(boardState) {
  return Math.max(80, 900 - (boardState.level - 1) * 70);
}

function getGhostY(boardState) {
  let ghostY = boardState.active.y;
  while (!collides(boardState, boardState.active.x, ghostY + 1, boardState.active.rotation)) {
    ghostY += 1;
  }
  return ghostY;
}

function boardPhase(boardState) {
  if (boardState.gameOver) return "Topped Out";
  if (!gameState.started) return "Ready";
  if (gameState.paused) return "Paused";
  if (boardState.justCleared >= 4) return "Tetris";
  if (boardState.justCleared > 0) return `Clear x${boardState.justCleared}`;
  return `Lv ${boardState.level}`;
}

function syncHud() {
  const activeBoards = getActiveBoards();
  const totalScore = activeBoards.reduce((sum, boardState) => sum + boardState.score, 0);
  const totalLines = activeBoards.reduce((sum, boardState) => sum + boardState.lines, 0);
  const liveBoards = activeBoards.filter((boardState) => !boardState.gameOver).length;

  ui.score.textContent = String(totalScore);
  ui.live.textContent = String(liveBoards);
  ui.lines.textContent = `${totalLines} total lines cleared`;
  ui.level.textContent = gameState.mode === "classic" ? "Classic" : "Multitap";
  ui.connection.textContent = controllerStatus.connected
    ? `Controller: ${controllerStatus.name}`
    : "Keyboard / bridge ready";
  ui.footerStatus.textContent = gameState.mode === "classic"
    ? controllerStatus.connected
      ? "Browser gamepad active on the classic lane."
      : "Classic lane supports browser gamepads and the native controller bridge."
    : "Multitap uses separate lanes. Controller support remains classic-lane only.";
  ui.bridgeStatus.textContent = gameState.mode === "classic"
    ? controllerStatus.connected
      ? "Browser controller detected. The native bridge is still available as a fallback."
      : "Use a browser-detected gamepad, or run the native bridge if the browser does not expose your pad."
    : "Multitap currently expects one keyboard lane per terminal while controller support stays on the classic lane.";

  if (!gameState.started) {
    ui.phase.textContent = "Ready";
    ui.message.textContent = gameState.mode === "classic"
      ? "Move, rotate, or drop to begin."
      : "Each terminal has its own controls. Start with any active lane.";
  } else if (gameState.paused) {
    ui.phase.textContent = "Paused";
    ui.message.textContent = "The game is frozen. Press pause again to continue.";
  } else if (liveBoards === 0) {
    ui.phase.textContent = gameState.mode === "classic" ? "Game Over" : "All Terminals Down";
    ui.message.textContent = "Everything active has topped out. Press restart and go again.";
  } else if (gameState.mode === "multitap" && liveBoards === 1) {
    ui.phase.textContent = "Last Terminal Standing";
    ui.message.textContent = "One terminal survived. Keep it alive.";
  } else {
    ui.phase.textContent = gameState.mode === "classic" ? `Level ${activeBoards[0].level}` : "Multitap";
    ui.message.textContent = gameState.mode === "classic"
      ? "Classic stack management. Keep the center clean."
      : `${liveBoards} terminals still active. Every lane plays independently.`;
  }

  boards.forEach((boardState) => {
    boardState.phaseEl.textContent = boardPhase(boardState);
    boardState.scoreEl.textContent = `${boardState.score} pts`;
    boardState.linesEl.textContent = `${boardState.lines} lines`;
  });
}

function isRunOver() {
  const activeBoards = getActiveBoards();
  return gameState.started && activeBoards.length > 0 && activeBoards.every((boardState) => boardState.gameOver);
}

function showGameOverMenu() {
  if (gameOverMenuShown || !isRunOver()) {
    return;
  }
  gameOverMenuShown = true;
  const totalScore = getActiveBoards().reduce((sum, boardState) => sum + boardState.score, 0);
  arcadeCabinet?.reportGameOver?.({
    gameId: "tetris",
    title: "Tetris",
    score: totalScore,
    onRestart: resetGame,
  });
}

function drawCell(ctx, x, y, color, size) {
  const px = x * size;
  const py = y * size;
  ctx.fillStyle = color;
  ctx.fillRect(px + 1, py + 1, size - 2, size - 2);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(px + 1, py + 1, size - 2, Math.max(4, Math.floor(size * 0.22)));
}

function drawOverlay(boardState, title, subtitle) {
  const { ctx, boardWidth, boardHeight } = boardState;
  ctx.fillStyle = "rgba(2, 6, 14, 0.74)";
  ctx.fillRect(0, 0, boardWidth, boardHeight);
  ctx.fillStyle = COLORS.text;
  ctx.textAlign = "center";
  ctx.font = `700 ${Math.max(22, Math.floor(boardState.cell * 1.1))}px Avenir Next`;
  ctx.fillText(title, boardWidth / 2, boardHeight / 2 - 10);
  ctx.font = `500 ${Math.max(12, Math.floor(boardState.cell * 0.55))}px Avenir Next`;
  ctx.fillStyle = "rgba(238, 244, 255, 0.74)";
  ctx.fillText(subtitle, boardWidth / 2, boardHeight / 2 + 18);
}

function renderPreview(ctx, width, height, pieces, previewCell) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#0b1221";
  ctx.fillRect(0, 0, width, height);
  pieces.forEach((type, index) => {
    if (!type) return;
    const shape = PIECES[type][0];
    const minX = Math.min(...shape.map(([x]) => x));
    const maxX = Math.max(...shape.map(([x]) => x));
    const minY = Math.min(...shape.map(([, y]) => y));
    const maxY = Math.max(...shape.map(([, y]) => y));
    const shapeWidth = (maxX - minX + 1) * previewCell;
    const shapeHeight = (maxY - minY + 1) * previewCell;
    const offsetX = (width - shapeWidth) / 2 - minX * previewCell;
    const baseY = index * (previewCell * 3.4) + 10;
    const offsetY = baseY + (previewCell * 2.2 - shapeHeight) / 2 - minY * previewCell;
    for (const [x, y] of shape) {
      ctx.fillStyle = COLORS[type];
      ctx.fillRect(offsetX + x * previewCell + 1, offsetY + y * previewCell + 1, previewCell - 2, previewCell - 2);
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillRect(offsetX + x * previewCell + 1, offsetY + y * previewCell + 1, previewCell - 2, Math.max(3, Math.floor(previewCell * 0.2)));
    }
  });
}

function renderBoard(boardState) {
  const { ctx, boardWidth, boardHeight, cell } = boardState;
  ctx.clearRect(0, 0, boardWidth, boardHeight);
  ctx.fillStyle = COLORS.frame;
  ctx.fillRect(0, 0, boardWidth, boardHeight);

  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  for (let x = 0; x <= COLS; x += 1) {
    ctx.beginPath();
    ctx.moveTo(x * cell + 0.5, 0);
    ctx.lineTo(x * cell + 0.5, boardHeight);
    ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y += 1) {
    ctx.beginPath();
    ctx.moveTo(0, y * cell + 0.5);
    ctx.lineTo(boardWidth, y * cell + 0.5);
    ctx.stroke();
  }

  for (let y = HIDDEN_ROWS; y < ROWS + HIDDEN_ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const value = boardState.board[y][x];
      if (value) drawCell(ctx, x, y - HIDDEN_ROWS, COLORS[value], cell);
    }
  }

  if (boardState.active && !boardState.gameOver) {
    const ghostPiece = { ...boardState.active, y: getGhostY(boardState) };
    for (const cellPos of getCells(boardState, ghostPiece)) {
      if (cellPos.y >= HIDDEN_ROWS) drawCell(ctx, cellPos.x, cellPos.y - HIDDEN_ROWS, COLORS.ghost, cell);
    }
    for (const cellPos of getCells(boardState)) {
      if (cellPos.y >= HIDDEN_ROWS) drawCell(ctx, cellPos.x, cellPos.y - HIDDEN_ROWS, COLORS[boardState.active.type], cell);
    }
  }

  const boardActiveInMode = getActiveBoards().includes(boardState);
  if (!gameState.started && boardActiveInMode && !boardState.gameOver) {
    drawOverlay(boardState, boardState.index === 1 && gameState.mode === "classic" ? "Classic" : `Terminal ${boardState.index}`, "Waiting for input");
  } else if (gameState.paused && boardActiveInMode && !boardState.gameOver) {
    drawOverlay(boardState, "Paused", "Shared input frozen");
  } else if (boardState.gameOver && boardActiveInMode) {
    drawOverlay(boardState, "Topped Out", "This lane is done");
  }

  renderPreview(boardState.holdCtx, boardState.holdCanvas.width, boardState.holdCanvas.height, boardState.hold ? [boardState.hold] : [], boardState.previewCell);
  renderPreview(boardState.nextCtx, boardState.nextCanvas.width, boardState.nextCanvas.height, boardState.queue.slice(0, 3), boardState.previewCell);
}

function render() {
  boards.forEach(renderBoard);
  syncHud();
  showGameOverMenu();
}

function startRun() {
  if (!gameState.started) gameState.started = true;
}

function handleBoardActionPress(boardState, action) {
  armMusic();
  startRun();
  switch (action) {
    case "left":
      movePiece(boardState, -1, 0);
      break;
    case "right":
      movePiece(boardState, 1, 0);
      break;
    case "down":
      if (movePiece(boardState, 0, 1)) boardState.score += 1;
      break;
    case "rotateCW":
      rotatePiece(boardState, 1);
      break;
    case "rotateCCW":
      rotatePiece(boardState, -1);
      break;
    case "hardDrop":
      hardDrop(boardState);
      break;
    case "hold":
      holdPiece(boardState);
      break;
    default:
      break;
  }
}

function handleGlobalActionPress(action) {
  armMusic();
  switch (action) {
    case "pause":
      if (getActiveBoards().some((boardState) => !boardState.gameOver)) gameState.paused = !gameState.paused;
      break;
    case "restart":
      resetGame();
      break;
    default:
      break;
  }
}

function updateRepeatingAction(boardState, action, pressed, now, initialDelay, repeatDelay) {
  const tracker = boardRepeatTrackers[boardState.index][action];
  if (pressed) {
    if (!tracker.active) {
      tracker.active = true;
      tracker.nextFire = now + initialDelay;
      handleBoardActionPress(boardState, action);
      return;
    }
    if (now >= tracker.nextFire) {
      tracker.nextFire = now + repeatDelay;
      handleBoardActionPress(boardState, action);
    }
  } else {
    tracker.active = false;
  }
}

function updateInputs(now) {
  getActiveBoards().forEach((boardState) => {
    const inputState = boardInputStates[boardState.index];
    const useGamepad = gameState.mode === "classic" && boardState.index === 1;
    const leftPressed = inputState.left || (useGamepad && gamepadInputState.left);
    const rightPressed = inputState.right || (useGamepad && gamepadInputState.right);
    const downPressed = inputState.down || (useGamepad && gamepadInputState.down);
    updateRepeatingAction(boardState, "left", leftPressed && !rightPressed, now, DAS_MS, ARR_MS);
    updateRepeatingAction(boardState, "right", rightPressed && !leftPressed, now, DAS_MS, ARR_MS);
    updateRepeatingAction(boardState, "down", downPressed, now, 0, SOFT_DROP_INTERVAL);
    ["rotateCW", "rotateCCW", "hardDrop", "hold"].forEach((action) => {
      if (inputState[action] || (useGamepad && gamepadInputState[action])) {
        handleBoardActionPress(boardState, action);
        inputState[action] = false;
        if (useGamepad) {
          gamepadInputState[action] = false;
        }
      }
    });
  });

  ["pause", "restart"].forEach((action) => {
    if (GLOBAL_INPUT_STATE[action] || gamepadGlobalInputState[action]) {
      handleGlobalActionPress(action);
      GLOBAL_INPUT_STATE[action] = false;
      gamepadGlobalInputState[action] = false;
    }
  });
}

function updateBoards(delta) {
  if (gameState.paused || !gameState.started) return;
  getActiveBoards().forEach((boardState) => {
    if (boardState.gameOver) return;
    boardState.dropAccumulator += delta;
    boardState.lineFlashMs = Math.max(0, boardState.lineFlashMs - delta);
    const interval = getDropInterval(boardState);
    while (boardState.dropAccumulator >= interval) {
      boardState.dropAccumulator -= interval;
      if (!movePiece(boardState, 0, 1)) break;
      boardState.lockAccumulator = 0;
    }
    if (collides(boardState, boardState.active.x, boardState.active.y + 1, boardState.active.rotation)) {
      boardState.lockAccumulator += delta;
      if (boardState.lockAccumulator >= LOCK_DELAY_MS) lockPiece(boardState);
    } else {
      boardState.lockAccumulator = 0;
    }
  });
}

function gameLoop(timestamp) {
  if (gameState.lastTime === 0) gameState.lastTime = timestamp;
  const delta = timestamp - gameState.lastTime;
  gameState.lastTime = timestamp;
  syncGamepadInput();
  updateInputs(timestamp);
  updateBoards(delta);
  updateMusicScheduler();
  render();
  requestAnimationFrame(gameLoop);
}

function listenForKeyboard() {
  const boardKeyToAction = new Map();
  Object.entries(BOARD_CONTROL_SCHEMES).forEach(([boardIndex, actions]) => {
    Object.entries(actions).forEach(([action, codes]) => {
      codes.forEach((code) => boardKeyToAction.set(code, { boardIndex: Number.parseInt(boardIndex, 10), action }));
    });
  });

  const globalKeymap = {
    KeyP: "pause",
    KeyR: "restart",
  };

  window.addEventListener("keydown", (event) => {
    const globalAction = globalKeymap[event.code];
    if (globalAction) {
      event.preventDefault();
      if (!event.repeat) {
        GLOBAL_INPUT_STATE[globalAction] = true;
      }
      return;
    }

    const binding = boardKeyToAction.get(event.code);
    if (!binding) return;
    if (gameState.mode === "classic" && binding.boardIndex !== 1) return;
    event.preventDefault();
    const inputState = boardInputStates[binding.boardIndex];
    if (binding.action === "left" || binding.action === "right" || binding.action === "down") {
      inputState[binding.action] = true;
    } else if (!event.repeat) {
      inputState[binding.action] = true;
    }
  });

  window.addEventListener("keyup", (event) => {
    const binding = boardKeyToAction.get(event.code);
    if (!binding) return;
    event.preventDefault();
    const inputState = boardInputStates[binding.boardIndex];
    if (binding.action === "left" || binding.action === "right" || binding.action === "down") {
      inputState[binding.action] = false;
    }
  });
}

function updateBridgeStatus() {
  syncHud();
}

function installArcadeHooks() {
  window.__arcadeCabinetHooks = {
    onPauseOpen() {
      pausedBeforeArcadeMenu = gameState.paused;
      gameState.paused = true;
    },
    onPauseClose() {
      gameState.paused = pausedBeforeArcadeMenu;
    },
  };
}

function openSettings() {
  updateBridgeStatus();
  ui.settingsModal.classList.remove("hidden");
}

function closeSettings() {
  ui.settingsModal.classList.add("hidden");
}

function bindUi() {
  ui.settingsButton.addEventListener("click", openSettings);
  ui.settingsClose.addEventListener("click", closeSettings);
  ui.settingsModal.addEventListener("click", (event) => {
    if (event.target === ui.settingsModal) closeSettings();
  });
  ui.modeClassic.addEventListener("click", () => setMode("classic"));
  ui.modeMultitap.addEventListener("click", () => setMode("multitap"));
  ui.musicToggle.addEventListener("click", async () => {
    setMusicEnabled(!gameState.musicEnabled);
    if (gameState.musicEnabled) {
      await armMusic();
      ui.musicHelp.textContent = "Built-in lo-fi loop is on.";
    } else {
      ui.musicHelp.textContent = "Music is off.";
    }
  });
  ui.trackSelect.addEventListener("change", () => {
    setMusicTrack(ui.trackSelect.value);
    ui.musicHelp.textContent = "Track updated.";
  });
  window.addEventListener("keydown", (event) => {
    if (event.code === "Escape" && !ui.settingsModal.classList.contains("hidden")) {
      closeSettings();
    }
  });
}

resetGame();
updateBridgeStatus();
installArcadeHooks();
bindUi();
listenForKeyboard();
render();
requestAnimationFrame(gameLoop);
