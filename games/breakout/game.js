import { applyCanvasRenderScale, attachViewportResize, syncCanvasBackingStore } from "../../shared/arcade-stage.js";
import {
  DEFAULT_PLAYER_LIVES,
  decrementLives,
  formatLives,
  hasLivesRemaining,
} from "../../shared/lives-config.js";

const COURT_COUNT = 4;
const BUILD_NUMBER = "2026.04.13.1";
const WIDTH = 240;
const HEIGHT = 360;
const ROWS = 7;
const COLS = 8;
const TOP_OFFSET = 48;
const BRICK_GAP = 5;
const PADDLE_HEIGHT = 12;
const BALL_RADIUS = 6;
const COURT_MARGIN_X = 10;
const COURT_MARGIN_TOP = 10;
const COURT_MARGIN_BOTTOM = 20;

const COLORS = {
  bg: "#050912",
  frame: "#1d2d47",
  text: "#eef6ff",
  muted: "#a2b3cb",
  paddle: "#ffcb68",
  ball: "#f5fbff",
  safe: "#93f9a4",
  danger: "#ff7f8c",
  bricks: ["#ff7f8c", "#ffb968", "#ffe36f", "#8df8a0", "#7cd1ff", "#b58fff", "#ff97d6"],
};
const arcadeCabinet = window.ArcadeCabinet || null;
let gameOverMenuShown = false;

const GLOBAL_INPUT_STATE = {
  pause: false,
  restart: false,
};

const COURT_CONTROL_SCHEMES = {
  1: {
    left: ["ArrowLeft"],
    right: ["ArrowRight"],
    serve: ["Space"],
    save: ["ShiftLeft", "ShiftRight"],
  },
  2: {
    left: ["KeyA"],
    right: ["KeyD"],
    serve: ["KeyF"],
    save: ["KeyG"],
  },
  3: {
    left: ["KeyJ"],
    right: ["KeyL"],
    serve: ["Semicolon"],
    save: ["Quote"],
  },
  4: {
    left: ["Numpad4"],
    right: ["Numpad6"],
    serve: ["Numpad0"],
    save: ["Numpad1"],
  },
};

function createCourtInputState() {
  return {
    left: false,
    right: false,
    serve: false,
    save: false,
  };
}

const courtInputStates = Object.fromEntries(
  Array.from({ length: COURT_COUNT }, (_, index) => [index + 1, createCourtInputState()])
);

const ui = {
  connection: document.getElementById("connection-status"),
  buildNumber: document.getElementById("build-number"),
  phase: document.getElementById("phase-label"),
  message: document.getElementById("message-label"),
  score: document.getElementById("score-value"),
  live: document.getElementById("live-value"),
  bricks: document.getElementById("bricks-value"),
  modeValue: document.getElementById("mode-value"),
  footerHint: document.getElementById("footer-hint"),
  footerStatus: document.getElementById("footer-status"),
  courtGrid: document.getElementById("court-grid"),
  settingsButton: document.getElementById("settings-button"),
  settingsModal: document.getElementById("settings-modal"),
  settingsClose: document.getElementById("settings-close"),
  modeClassic: document.getElementById("mode-classic"),
  modeMultitap: document.getElementById("mode-multitap"),
  bridgeStatus: document.getElementById("bridge-status"),
};

const gameState = {
  started: false,
  paused: false,
  mode: "classic",
  lastTime: 0,
  controllerSlots: new Map(),
  joinButtonSnapshot: {},
};

ui.buildNumber.textContent = `build ${BUILD_NUMBER}`;

const courts = Array.from({ length: COURT_COUNT }, (_, zeroIndex) => createCourtState(zeroIndex + 1));

function syncCourtCanvasSizing() {
  courts.forEach((court) => {
    court.renderState = syncCanvasBackingStore(court.canvas, {
      logicalWidth: WIDTH,
      logicalHeight: HEIGHT,
    });
  });
}

syncCourtCanvasSizing();
attachViewportResize(syncCourtCanvasSizing);

function createCourtState(index) {
  const canvas = document.getElementById(`court-canvas-${index}`);
  return {
    index,
    cardEl: document.querySelector(`[data-court-card="${index}"]`),
    ctx: canvas.getContext("2d"),
    canvas,
    renderState: { scaleX: 1, scaleY: 1 },
    phaseEl: document.getElementById(`court-phase-${index}`),
    scoreEl: document.getElementById(`court-score-${index}`),
    bricksEl: document.getElementById(`court-bricks-${index}`),
    active: index === 1,
    controllerIndex: null,
    score: 0,
    combo: 0,
    lives: DEFAULT_PLAYER_LIVES,
    level: 1,
    flashTimer: 0,
    serveLock: true,
    gameOver: false,
    win: false,
    paddle: {
      x: WIDTH / 2 - 34,
      width: 68,
      height: PADDLE_HEIGHT,
      speed: 280,
      boostTimer: 0,
    },
    ball: {
      x: WIDTH / 2,
      y: HEIGHT - 52,
      vx: 0,
      vy: 0,
      radius: BALL_RADIUS,
      speed: 208,
      trail: [],
    },
    bricks: [],
  };
}

function createBrickLayout(level) {
  const bricks = [];
  const brickWidth = (WIDTH - (COURT_MARGIN_X * 2) - 14 - (COLS - 1) * BRICK_GAP) / COLS;
  const brickHeight = 14;
  const offsetX = COURT_MARGIN_X + 7;
  const rows = Math.min(ROWS, 5 + Math.floor(level / 2));

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const durability = row >= rows - 2 && level > 2 ? 2 : 1;
      bricks.push({
        x: offsetX + col * (brickWidth + BRICK_GAP),
        y: TOP_OFFSET + row * (brickHeight + BRICK_GAP),
        width: brickWidth,
        height: brickHeight,
        durability,
        color: COLORS.bricks[row % COLORS.bricks.length],
      });
    }
  }

  return bricks;
}

function resetCourt(court, freshRun = false) {
  court.score = freshRun ? 0 : court.score;
  court.combo = 0;
  court.lives = freshRun ? DEFAULT_PLAYER_LIVES : court.lives;
  court.level = freshRun ? 1 : court.level;
  court.flashTimer = 0;
  court.serveLock = true;
  court.gameOver = false;
  court.win = false;
  court.paddle.x = WIDTH / 2 - 34;
  court.paddle.width = 68;
  court.paddle.boostTimer = 0;
  court.ball.x = court.paddle.x + court.paddle.width / 2;
  court.ball.y = paddleY(court) - BALL_RADIUS - 4;
  court.ball.vx = 0;
  court.ball.vy = 0;
  court.ball.speed = 208;
  court.ball.trail = [];
  court.bricks = createBrickLayout(court.level);
}

function paddleY(court) {
  return HEIGHT - COURT_MARGIN_BOTTOM - court.paddle.height;
}

function activateCourt(court, active) {
  court.active = active;
  court.cardEl?.classList.toggle("is-active", active);
  if (!active) {
    court.controllerIndex = null;
  }
}

function applyMode(mode) {
  gameState.mode = mode;
  ui.modeValue.textContent = mode === "multitap" ? "Multitap" : "Classic";
  ui.courtGrid.classList.toggle("classic-mode", mode === "classic");
  ui.courtGrid.classList.toggle("multitap-mode", mode === "multitap");
  ui.modeClassic.classList.toggle("is-active", mode === "classic");
  ui.modeMultitap.classList.toggle("is-active", mode === "multitap");

  courts.forEach((court, index) => {
    activateCourt(court, mode === "multitap" || index === 0);
    resetCourt(court, true);
  });

  syncControllerAssignments();
  updateHud();
}

function getActiveCourts() {
  return gameState.mode === "multitap" ? courts : [courts[0]];
}

function getLiveCourts() {
  return getActiveCourts().filter((court) => !court.gameOver);
}

function readKeyboardCourtInput(index) {
  return courtInputStates[index];
}

function readGamepadCourtInput(controllerIndex) {
  if (controllerIndex === null || !navigator.getGamepads) {
    return { left: false, right: false, serve: false, save: false };
  }

  const pad = navigator.getGamepads()[controllerIndex];
  if (!pad) {
    return { left: false, right: false, serve: false, save: false };
  }

  const axisX = pad.axes[0] ?? 0;
  return {
    left: axisX < -0.32 || !!pad.buttons[14]?.pressed,
    right: axisX > 0.32 || !!pad.buttons[15]?.pressed,
    serve: !!pad.buttons[0]?.pressed || !!pad.buttons[1]?.pressed || !!pad.buttons[5]?.pressed,
    save: !!pad.buttons[2]?.pressed || !!pad.buttons[3]?.pressed || !!pad.buttons[4]?.pressed,
  };
}

function getGamepads() {
  if (!navigator.getGamepads) {
    return [];
  }
  return Array.from(navigator.getGamepads()).filter(Boolean);
}

function trimControllerName(name) {
  return name.replace(/\(STANDARD GAMEPAD Vendor:.*$/i, "").trim() || "Controller";
}

function syncControllerAssignments() {
  const pads = getGamepads();
  const padIndexes = new Set(pads.map((pad) => pad.index));

  for (const court of courts) {
    if (court.controllerIndex !== null && !padIndexes.has(court.controllerIndex)) {
      court.controllerIndex = null;
    }
  }

  if (pads.length === 0) {
    ui.connection.textContent = "Keyboard mode";
    return;
  }

  const firstPad = pads[0];
  if (courts[0].controllerIndex === null) {
    courts[0].controllerIndex = firstPad.index;
  }

  if (gameState.mode === "classic") {
    for (let index = 1; index < courts.length; index += 1) {
      courts[index].controllerIndex = null;
    }
  } else {
    for (const pad of pads) {
      const startPressed = !!pad.buttons[9]?.pressed;
      const previous = gameState.joinButtonSnapshot[pad.index] || false;
      gameState.joinButtonSnapshot[pad.index] = startPressed;
      if (!startPressed || previous) {
        continue;
      }
      if (courts.some((court) => court.controllerIndex === pad.index)) {
        continue;
      }
      const emptyCourt = courts.find((court) => court.active && court.controllerIndex === null);
      if (emptyCourt) {
        emptyCourt.controllerIndex = pad.index;
      }
    }
  }

  const assigned = courts
    .filter((court) => court.active && court.controllerIndex !== null)
    .map((court) => `P${court.index}:${trimControllerName(navigator.getGamepads?.()[court.controllerIndex]?.id || `Pad ${court.controllerIndex + 1}`)}`);
  ui.connection.textContent = assigned.length > 0 ? assigned.join(" | ") : "Keyboard mode";
}

function serveBall(court) {
  if (!court.serveLock || court.gameOver) {
    return;
  }

  const angle = (-Math.PI / 2) + ((Math.random() - 0.5) * 0.7);
  court.ball.speed = 208 + (court.level - 1) * 14;
  court.ball.vx = Math.cos(angle) * court.ball.speed;
  court.ball.vy = Math.sin(angle) * court.ball.speed;
  court.serveLock = false;
  court.combo = 0;
}

function loseLife(court) {
  court.lives = decrementLives(court.lives);
  court.combo = 0;
  court.flashTimer = 0.7;
  if (!hasLivesRemaining(court.lives)) {
    court.gameOver = true;
    court.phaseEl.textContent = "Out";
    return;
  }
  court.phaseEl.textContent = "Reset";
  court.serveLock = true;
  court.ball.x = court.paddle.x + court.paddle.width / 2;
  court.ball.y = paddleY(court) - court.ball.radius - 4;
  court.ball.vx = 0;
  court.ball.vy = 0;
}

function advanceCourt(court) {
  court.level += 1;
  court.score += 250;
  court.flashTimer = 1;
  court.serveLock = true;
  court.bricks = createBrickLayout(court.level);
  court.ball.x = court.paddle.x + court.paddle.width / 2;
  court.ball.y = paddleY(court) - court.ball.radius - 4;
  court.ball.vx = 0;
  court.ball.vy = 0;
  court.phaseEl.textContent = `Wave ${court.level}`;
}

function updateCourt(court, dt) {
  if (!court.active || court.gameOver) {
    return;
  }

  const keyboardInput = readKeyboardCourtInput(court.index);
  const controllerInput = readGamepadCourtInput(court.controllerIndex);
  const input = {
    left: keyboardInput.left || controllerInput.left,
    right: keyboardInput.right || controllerInput.right,
    serve: keyboardInput.serve || controllerInput.serve,
    save: keyboardInput.save || controllerInput.save,
  };

  if (input.left) {
    court.paddle.x -= court.paddle.speed * dt;
  }
  if (input.right) {
    court.paddle.x += court.paddle.speed * dt;
  }

  if (input.save) {
    court.paddle.boostTimer = Math.max(court.paddle.boostTimer, 0.12);
  }
  court.paddle.boostTimer = Math.max(0, court.paddle.boostTimer - dt);
  const targetWidth = court.paddle.boostTimer > 0 ? 96 : 68;
  court.paddle.width += (targetWidth - court.paddle.width) * Math.min(1, dt * 14);
  court.paddle.x = Math.max(COURT_MARGIN_X, Math.min(WIDTH - COURT_MARGIN_X - court.paddle.width, court.paddle.x));

  if (court.serveLock) {
    court.ball.x = court.paddle.x + court.paddle.width / 2;
    court.ball.y = paddleY(court) - court.ball.radius - 4;
    if (input.serve) {
      serveBall(court);
    }
    return;
  }

  court.ball.x += court.ball.vx * dt;
  court.ball.y += court.ball.vy * dt;
  court.ball.trail.unshift({ x: court.ball.x, y: court.ball.y });
  court.ball.trail = court.ball.trail.slice(0, 8);

  if (court.ball.x <= COURT_MARGIN_X + court.ball.radius || court.ball.x >= WIDTH - COURT_MARGIN_X - court.ball.radius) {
    court.ball.x = Math.max(COURT_MARGIN_X + court.ball.radius, Math.min(WIDTH - COURT_MARGIN_X - court.ball.radius, court.ball.x));
    court.ball.vx *= -1;
  }

  if (court.ball.y <= COURT_MARGIN_TOP + court.ball.radius) {
    court.ball.y = COURT_MARGIN_TOP + court.ball.radius;
    court.ball.vy = Math.abs(court.ball.vy);
  }

  const paddleTop = paddleY(court);
  if (
    court.ball.y + court.ball.radius >= paddleTop &&
    court.ball.y - court.ball.radius <= paddleTop + PADDLE_HEIGHT &&
    court.ball.x + court.ball.radius >= court.paddle.x &&
    court.ball.x - court.ball.radius <= court.paddle.x + court.paddle.width &&
    court.ball.vy > 0
  ) {
    const hit = (court.ball.x - (court.paddle.x + court.paddle.width / 2)) / (court.paddle.width / 2);
    court.ball.vx = hit * (court.ball.speed * 0.95);
    court.ball.vy = -Math.abs(court.ball.speed * (0.82 + Math.abs(hit) * 0.18));
    court.ball.speed = Math.min(340, court.ball.speed + 5);
    court.combo = 0;
  }

  for (const brick of court.bricks) {
    if (brick.durability <= 0) {
      continue;
    }
    if (
      court.ball.x + court.ball.radius < brick.x ||
      court.ball.x - court.ball.radius > brick.x + brick.width ||
      court.ball.y + court.ball.radius < brick.y ||
      court.ball.y - court.ball.radius > brick.y + brick.height
    ) {
      continue;
    }

    brick.durability -= 1;
    court.score += brick.durability <= 0 ? 25 + court.combo * 4 : 10;
    court.combo += 1;

    const prevX = court.ball.x - court.ball.vx * dt;
    const prevY = court.ball.y - court.ball.vy * dt;
    const hitFromSide = prevX < brick.x || prevX > brick.x + brick.width;
    const hitFromTop = prevY < brick.y || prevY > brick.y + brick.height;

    if (hitFromSide) {
      court.ball.vx *= -1;
    } else if (hitFromTop) {
      court.ball.vy *= -1;
    } else {
      court.ball.vy *= -1;
    }
    break;
  }

  court.bricks = court.bricks.filter((brick) => brick.durability > 0);

  if (court.bricks.length === 0) {
    advanceCourt(court);
  }

  if (court.ball.y > HEIGHT - COURT_MARGIN_BOTTOM + court.ball.radius) {
    loseLife(court);
  }

  court.flashTimer = Math.max(0, court.flashTimer - dt);
  court.phaseEl.textContent = court.serveLock ? "Serve" : `Wave ${court.level}`;
}

function updateHud() {
  const activeCourts = getActiveCourts();
  const liveCourts = getLiveCourts();
  const totalScore = activeCourts.reduce((sum, court) => sum + court.score, 0);
  const totalBricks = activeCourts.reduce((sum, court) => sum + court.bricks.length, 0);

  ui.score.textContent = String(totalScore);
  ui.live.textContent = String(liveCourts.length);
  ui.bricks.textContent = `${totalBricks} total bricks left`;
  ui.phase.textContent = gameState.paused ? "Paused" : (gameState.mode === "multitap" ? "Multitap" : "Classic");
  ui.message.textContent = activeCourts.some((court) => court.gameOver)
    ? "Press A, Start, or R to relaunch the courts."
    : "Serve, ricochet, and clear the stack.";
  ui.footerStatus.textContent = activeCourts
    .map((court) => `P${court.index}:${formatLives(court.lives)}`)
    .join("  ");
  ui.footerHint.textContent = gameState.mode === "multitap"
    ? "Extra pads join on Start. Keyboard lanes stay active for all four courts."
    : "Classic lane supports keyboard fallback and the native bridge helper.";

  activeCourts.forEach((court) => {
    court.scoreEl.textContent = `${court.score} pts`;
    court.bricksEl.textContent = `${court.bricks.length} bricks`;
  });
}

function isRunOver() {
  const activeCourts = getActiveCourts();
  return activeCourts.length > 0 && activeCourts.every((court) => court.gameOver);
}

function showGameOverMenu() {
  if (gameOverMenuShown || !isRunOver()) {
    return;
  }
  gameOverMenuShown = true;
  const totalScore = getActiveCourts().reduce((sum, court) => sum + court.score, 0);
  arcadeCabinet?.reportGameOver?.({
    gameId: "breakout",
    title: "Breakout",
    score: totalScore,
    onRestart: restartRun,
  });
}

function drawCourt(court) {
  const ctx = court.ctx;
  applyCanvasRenderScale(ctx, court.renderState);
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, "#08111f");
  gradient.addColorStop(1, "#050912");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(COURT_MARGIN_X, COURT_MARGIN_TOP, WIDTH - COURT_MARGIN_X * 2, HEIGHT - COURT_MARGIN_TOP - COURT_MARGIN_BOTTOM);

  ctx.strokeStyle = COLORS.frame;
  ctx.lineWidth = 2;
  ctx.strokeRect(COURT_MARGIN_X, COURT_MARGIN_TOP, WIDTH - COURT_MARGIN_X * 2, HEIGHT - COURT_MARGIN_TOP - COURT_MARGIN_BOTTOM);

  for (const brick of court.bricks) {
    ctx.fillStyle = brick.color;
    ctx.globalAlpha = brick.durability === 2 ? 0.6 : 1;
    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = COLORS.paddle;
  ctx.fillRect(court.paddle.x, paddleY(court), court.paddle.width, court.paddle.height);

  court.ball.trail.forEach((point, index) => {
    ctx.globalAlpha = 0.3 - index * 0.03;
    ctx.beginPath();
    ctx.fillStyle = COLORS.ball;
    ctx.arc(point.x, point.y, Math.max(2, court.ball.radius - index * 0.4), 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.fillStyle = COLORS.ball;
  ctx.arc(court.ball.x, court.ball.y, court.ball.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.muted;
  ctx.font = '13px "Avenir Next", "Segoe UI", sans-serif';
  ctx.fillText(`Lives ${formatLives(court.lives)}`, COURT_MARGIN_X + 8, HEIGHT - 10);
  ctx.fillText(court.controllerIndex !== null ? `Pad ${court.controllerIndex + 1}` : `Key ${court.index}`, WIDTH - 76, HEIGHT - 10);

  if (court.flashTimer > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.35, court.flashTimer)})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  if (court.gameOver) {
    ctx.fillStyle = "rgba(5, 9, 18, 0.7)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.textAlign = "center";
    ctx.fillStyle = COLORS.text;
    ctx.font = '700 28px "Avenir Next", "Segoe UI", sans-serif';
    ctx.fillText("Court Down", WIDTH / 2, HEIGHT / 2 - 6);
    ctx.font = '16px "Avenir Next", "Segoe UI", sans-serif';
    ctx.fillStyle = COLORS.muted;
    ctx.fillText("Press A, Start, or R to restart", WIDTH / 2, HEIGHT / 2 + 26);
    ctx.textAlign = "start";
  }
}

function render() {
  getActiveCourts().forEach(drawCourt);
}

function restartRun() {
  gameOverMenuShown = false;
  arcadeCabinet?.closeResults?.();
  courts.forEach((court) => resetCourt(court, true));
  gameState.paused = false;
  updateHud();
}

function togglePause() {
  gameState.paused = !gameState.paused;
  updateHud();
}

function update(delta) {
  syncControllerAssignments();
  if (gameState.paused) {
    updateHud();
    return;
  }

  getActiveCourts().forEach((court) => updateCourt(court, delta));
  showGameOverMenu();
  updateHud();
}

function frame(timestamp) {
  if (!gameState.lastTime) {
    gameState.lastTime = timestamp;
  }
  const delta = Math.min(32, timestamp - gameState.lastTime) / 1000;
  gameState.lastTime = timestamp;

  update(delta);
  render();
  requestAnimationFrame(frame);
}

function onKeyChange(code, pressed) {
  Object.entries(COURT_CONTROL_SCHEMES).forEach(([index, mapping]) => {
    const courtInput = courtInputStates[index];
    if (mapping.left.includes(code)) courtInput.left = pressed;
    if (mapping.right.includes(code)) courtInput.right = pressed;
    if (mapping.serve.includes(code)) courtInput.serve = pressed;
    if (mapping.save.includes(code)) courtInput.save = pressed;
  });
}

function openSettings() {
  ui.settingsModal.classList.remove("hidden");
}

function closeSettings() {
  ui.settingsModal.classList.add("hidden");
}

window.addEventListener("keydown", (event) => {
  if (event.code === "KeyP" && !event.repeat) {
    togglePause();
  }
  if (event.code === "KeyR" && !event.repeat) {
    restartRun();
  }
  if (event.code === "Escape" && !ui.settingsModal.classList.contains("hidden")) {
    closeSettings();
  }
  onKeyChange(event.code, true);
});

window.addEventListener("keyup", (event) => {
  onKeyChange(event.code, false);
});

window.addEventListener("blur", () => {
  Object.values(courtInputStates).forEach((input) => {
    input.left = false;
    input.right = false;
    input.serve = false;
    input.save = false;
  });
});

ui.settingsButton.addEventListener("click", openSettings);
ui.settingsClose.addEventListener("click", closeSettings);
ui.settingsModal.addEventListener("click", (event) => {
  if (event.target === ui.settingsModal) {
    closeSettings();
  }
});

ui.modeClassic.addEventListener("click", () => applyMode("classic"));
ui.modeMultitap.addEventListener("click", () => applyMode("multitap"));

window.addEventListener("gamepadconnected", syncControllerAssignments);
window.addEventListener("gamepaddisconnected", syncControllerAssignments);

applyMode("classic");
ui.bridgeStatus.textContent = "Native bridge support targets the classic lane when the browser hides Bluetooth pads.";
requestAnimationFrame(frame);
