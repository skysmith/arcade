import { createArcadeStage } from "../../shared/arcade-stage.js";
import {
  DEFAULT_PLAYER_LIVES,
  decrementLives,
  formatLives,
  hasLivesRemaining,
  scoreLivesValue,
} from "../../shared/lives-config.js";

const BUILD_NUMBER = "2026.04.13.1";
const MAX_PLAYERS = 4;
const KEYBOARD_PLAYER_ID = "keyboard-1";
const PLAYER_COLORS = ["#9df0ff", "#ffd676", "#ff9cc0", "#8ff4a7"];
const PLAYER_LABELS = ["P1", "P2", "P3", "P4"];
const GAMEPLAY_KEYS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", " ", "Spacebar", "p", "P", "r", "R"]);
const GRAVITY = 960;
const MOVE_SPEED = 190;
const JUMP_SPEED = 430;
const RESPAWN_MS = 1300;
const SNOW_SPEED = 410;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const WIDTH = Number(canvas.getAttribute("width"));
const HEIGHT = Number(canvas.getAttribute("height"));
const playfieldShell = document.getElementById("playfield-shell");
const playfieldStage = document.getElementById("playfield-stage");
const arcadeCabinet = window.ArcadeCabinet || null;

const ui = {
  stage: document.getElementById("stage-value"),
  players: document.getElementById("players-value"),
  enemies: document.getElementById("enemies-value"),
  status: document.getElementById("status-value"),
  hint: document.getElementById("hint-value"),
};

document.title = `snow-bros build ${BUILD_NUMBER}`;

const cabinetStage = createArcadeStage({
  shell: playfieldShell,
  stage: playfieldStage,
  canvas,
  logicalWidth: WIDTH,
  logicalHeight: HEIGHT,
});

const platforms = [
  { x1: 96, x2: 864, y: 672 },
  { x1: 188, x2: 766, y: 574 },
  { x1: 106, x2: 386, y: 478 },
  { x1: 572, x2: 854, y: 478 },
  { x1: 222, x2: 738, y: 384 },
  { x1: 184, x2: 778, y: 288 },
];

const state = {
  players: new Map(),
  controllerAssignments: new Map(),
  joinButtonSnapshot: {},
  pauseButtonSnapshot: {},
  keyboard: {
    left: false,
    right: false,
    jump: false,
    shoot: false,
  },
  round: 1,
  enemies: [],
  snowShots: [],
  snowballs: [],
  gameOver: false,
  paused: false,
  lastTime: 0,
  lastStatusText: "",
};
let gameOverMenuShown = false;

function platformForX(x, yTolerance = 10) {
  return platforms.find((platform) => x >= platform.x1 && x <= platform.x2 && yTolerance >= 0);
}

function spawnPlayer(source, controllerIndex, controllerName) {
  if (state.players.size >= MAX_PLAYERS) return;

  const slot = state.players.size;
  const id = source === "keyboard" ? KEYBOARD_PLAYER_ID : `gamepad-${controllerIndex}`;
  if (state.players.has(id)) return;

  const player = {
    id,
    source,
    controllerIndex,
    controllerName,
    label: PLAYER_LABELS[slot] || `P${slot + 1}`,
    color: PLAYER_COLORS[slot % PLAYER_COLORS.length],
    width: 26,
    height: 30,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    facing: 1,
    lives: DEFAULT_PLAYER_LIVES,
    alive: true,
    respawnAt: 0,
    groundedPlatform: 0,
    jumpPressedLastFrame: false,
    shootPressedLastFrame: false,
    shootCooldown: 0,
  };

  state.players.set(id, player);
  if (controllerIndex !== null) {
    state.controllerAssignments.set(controllerIndex, id);
    state.pauseButtonSnapshot[controllerIndex] = true;
  }
  relayoutPlayers();
}

function relayoutPlayers() {
  const players = [...state.players.values()];
  const ground = platforms[0];
  const laneWidth = (ground.x2 - ground.x1) / Math.max(1, players.length + 1);
  players.forEach((player, index) => {
    player.label = PLAYER_LABELS[index] || `P${index + 1}`;
    player.color = PLAYER_COLORS[index % PLAYER_COLORS.length];
    player.x = ground.x1 + laneWidth * (index + 1);
    player.y = ground.y - player.height;
    player.vx = 0;
    player.vy = 0;
    player.groundedPlatform = 0;
  });
}

function removePlayer(playerId) {
  state.players.delete(playerId);
  relayoutPlayers();
}

function getGamepads() {
  if (!navigator.getGamepads) return [];
  return Array.from(navigator.getGamepads()).filter(Boolean);
}

function trimControllerName(name) {
  return name.replace(/\(STANDARD GAMEPAD Vendor:.*$/i, "").trim() || "Controller";
}

function ensureInputRoster() {
  const pads = getGamepads();
  const liveIndexes = new Set();
  const assignedIndexes = new Set(state.controllerAssignments.keys());

  for (const pad of pads) {
    liveIndexes.add(pad.index);
  }

  for (const [index, playerId] of [...state.controllerAssignments.entries()]) {
    if (liveIndexes.has(index)) continue;
    state.controllerAssignments.delete(index);
    removePlayer(playerId);
  }

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
    }
  }

  for (const index of Object.keys(state.joinButtonSnapshot)) {
    if (!liveIndexes.has(Number(index))) {
      delete state.joinButtonSnapshot[index];
      delete state.pauseButtonSnapshot[index];
    }
  }
}

function readKeyboardInput() {
  return {
    left: state.keyboard.left,
    right: state.keyboard.right,
    jump: state.keyboard.jump,
    shoot: state.keyboard.shoot,
  };
}

function readGamepadInput(controllerIndex) {
  if (controllerIndex === null || !navigator.getGamepads) {
    return { left: false, right: false, jump: false, shoot: false };
  }

  const pad = navigator.getGamepads()[controllerIndex];
  if (!pad) {
    return { left: false, right: false, jump: false, shoot: false };
  }

  const axisX = pad.axes[0] ?? 0;

  return {
    left: axisX < -0.35 || !!pad.buttons[14]?.pressed,
    right: axisX > 0.35 || !!pad.buttons[15]?.pressed,
    jump: !!pad.buttons[0]?.pressed,
    shoot: !!pad.buttons[1]?.pressed || !!pad.buttons[2]?.pressed || !!pad.buttons[3]?.pressed,
  };
}

function setStatus(text) {
  state.lastStatusText = text;
}

function groundedPlatformIndex(entity) {
  const feetY = entity.y + entity.height;
  for (let index = 0; index < platforms.length; index += 1) {
    const platform = platforms[index];
    if (entity.x + entity.width < platform.x1 || entity.x > platform.x2) continue;
    if (Math.abs(feetY - platform.y) <= 10) {
      return index;
    }
  }
  return null;
}

function rectsIntersect(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function respawnPlayer(player) {
  player.alive = true;
  player.vx = 0;
  player.vy = 0;
  player.x = platforms[0].x1 + 80 + Math.random() * 260;
  player.y = platforms[0].y - player.height;
}

function loseLife(player, reason) {
  player.alive = false;
  player.lives = decrementLives(player.lives);
  player.respawnAt = performance.now() + RESPAWN_MS;
  setStatus(reason);

  if ([...state.players.values()].every((entry) => !hasLivesRemaining(entry.lives))) {
    state.gameOver = true;
    setStatus("The snow squad wiped out. Press A, Start, or R to restart.");
  }
}

function createEnemy(x, platformIndex, type = "goblin") {
  const platform = platforms[platformIndex];
  return {
    x,
    y: platform.y - 28,
    width: 26,
    height: 28,
    vx: Math.random() > 0.5 ? 72 : -72,
    vy: 0,
    groundedPlatform: platformIndex,
    type,
    snow: 0,
    frozen: false,
    rolling: false,
    rollingTimer: 0,
  };
}

function spawnWave() {
  const pattern = [
    createEnemy(250, 5, "goblin"),
    createEnemy(700, 5, "orb"),
    createEnemy(234, 4, "goblin"),
    createEnemy(714, 4, "orb"),
    createEnemy(190, 2, "goblin"),
    createEnemy(718, 3, "goblin"),
  ];

  state.enemies = pattern.slice(0, Math.min(pattern.length, 3 + state.round));
  state.snowShots = [];
  state.snowballs = [];
}

function resetRound(advance = false) {
  gameOverMenuShown = false;
  arcadeCabinet?.closeResults?.();
  if (advance) {
    state.round += 1;
  } else {
    state.round = 1;
  }

  state.gameOver = false;
  state.paused = false;
  spawnWave();

  for (const player of state.players.values()) {
    if (!advance) {
      player.lives = DEFAULT_PLAYER_LIVES;
    }
    player.shootCooldown = 0;
    player.jumpPressedLastFrame = false;
    player.shootPressedLastFrame = false;
    respawnPlayer(player);
  }
}

function showGameOverMenu() {
  if (gameOverMenuShown || !state.gameOver) {
    return;
  }
  gameOverMenuShown = true;
  const score = state.round * 100 + [...state.players.values()].reduce((sum, player) => sum + scoreLivesValue(player.lives) * 25, 0);
  arcadeCabinet?.reportGameOver?.({
    gameId: "snow-bros",
    title: "Snow Bros",
    score,
    onRestart: () => resetRound(false),
  });
}

function spawnSnowShot(player) {
  state.snowShots.push({
    x: player.x + player.width / 2,
    y: player.y + 12,
    width: 12,
    height: 12,
    vx: player.facing * SNOW_SPEED,
  });
}

function updatePlayers(dt) {
  for (const player of state.players.values()) {
    if (!player.alive) {
      if (performance.now() >= player.respawnAt && hasLivesRemaining(player.lives)) {
        respawnPlayer(player);
      }
      continue;
    }

    const input = player.source === "keyboard" ? readKeyboardInput() : readGamepadInput(player.controllerIndex);
    player.shootCooldown = Math.max(0, player.shootCooldown - dt);

    player.vx = 0;
    if (input.left) {
      player.vx -= MOVE_SPEED;
      player.facing = -1;
    }
    if (input.right) {
      player.vx += MOVE_SPEED;
      player.facing = 1;
    }

    const platformIndex = groundedPlatformIndex(player);
    if (platformIndex !== null) {
      player.groundedPlatform = platformIndex;
    }
    if (input.jump && !player.jumpPressedLastFrame && platformIndex !== null) {
      player.vy = -JUMP_SPEED;
    }
    if (input.shoot && !player.shootPressedLastFrame && player.shootCooldown <= 0) {
      spawnSnowShot(player);
      player.shootCooldown = 0.22;
    }

    player.x += player.vx * dt;
    player.vy += GRAVITY * dt;
    player.y += player.vy * dt;

    const landedPlatform = groundedPlatformIndex(player);
    if (landedPlatform !== null && player.vy >= 0) {
      player.y = platforms[landedPlatform].y - player.height;
      player.vy = 0;
      player.groundedPlatform = landedPlatform;
    }

    player.x = Math.max(64, Math.min(WIDTH - 64 - player.width, player.x));
    if (player.y > HEIGHT + 40) {
      loseLife(player, `${player.label} slipped off the mountain.`);
    }

    for (const enemy of state.enemies) {
      if (enemy.frozen && !enemy.rolling && rectsIntersect(player, enemy)) {
        enemy.rolling = true;
        enemy.rollingTimer = 2.4;
        enemy.vx = player.facing * 300;
        setStatus(`${player.label} kicked a snowball.`);
      } else if (!enemy.frozen && rectsIntersect(player, enemy)) {
        loseLife(player, `${player.label} got tagged by a creep.`);
        break;
      }
    }

    player.jumpPressedLastFrame = input.jump;
    player.shootPressedLastFrame = input.shoot;
  }
}

function updateSnowShots(dt) {
  state.snowShots = state.snowShots.filter((shot) => {
    shot.x += shot.vx * dt;
    if (shot.x < -20 || shot.x > WIDTH + 20) return false;

    for (const enemy of state.enemies) {
      if (enemy.rolling) continue;
      if (!rectsIntersect(shot, enemy)) continue;
      enemy.snow = Math.min(4, enemy.snow + 1);
      if (enemy.snow >= 4) {
        enemy.frozen = true;
        enemy.vx = 0;
        setStatus("Enemy packed into a snowball.");
      } else {
        setStatus("Snow stacking up.");
      }
      return false;
    }
    return true;
  });
}

function updateEnemies(dt) {
  for (const enemy of state.enemies) {
    if (enemy.rolling) {
      enemy.x += enemy.vx * dt;
      enemy.rollingTimer -= dt;
      for (const other of state.enemies) {
        if (other === enemy) continue;
        if (rectsIntersect(enemy, other)) {
          other.rolling = false;
          other.frozen = false;
          other.snow = 0;
          other.dead = true;
        }
      }
      if (enemy.x < 30 || enemy.x > WIDTH - 30 || enemy.rollingTimer <= 0) {
        enemy.dead = true;
      }
      continue;
    }

    if (enemy.frozen) {
      enemy.vx = 0;
      continue;
    }

    enemy.vy += GRAVITY * dt;
    enemy.y += enemy.vy * dt;
    const platformIndex = groundedPlatformIndex(enemy);
    if (platformIndex !== null && enemy.vy >= 0) {
      enemy.y = platforms[platformIndex].y - enemy.height;
      enemy.vy = 0;
      enemy.groundedPlatform = platformIndex;
    }

    enemy.x += enemy.vx * dt;
    const platform = platforms[enemy.groundedPlatform] || platforms[0];
    if (enemy.x <= platform.x1 || enemy.x + enemy.width >= platform.x2) {
      enemy.vx *= -1;
      enemy.x = Math.max(platform.x1, Math.min(platform.x2 - enemy.width, enemy.x));
    }

    if (Math.random() < 0.006 * state.round && platformIndex !== null) {
      enemy.vy = -320;
    }
  }

  state.enemies = state.enemies.filter((enemy) => !enemy.dead);
  if (!state.gameOver && state.enemies.length === 0) {
    setStatus("Peak clear. Next wave!");
    resetRound(true);
  }
}

function updateUi() {
  ui.stage.textContent = `Peak ${state.round}`;
  ui.players.textContent = String(state.players.size);
  ui.enemies.textContent = String(state.enemies.length);
  ui.status.textContent = state.lastStatusText || "Freeze the wave and kick the snowballs.";
  ui.hint.textContent = state.gameOver
    ? "Press A, Start, or R to restart."
    : "Hit enemies four times with snow, then run into them to launch a snowball.";
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, "#1f4b78");
  sky.addColorStop(0.6, "#14304e");
  sky.addColorStop(1, "#08121d");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "rgba(244, 251, 255, 0.08)";
  ctx.beginPath();
  ctx.arc(772, 88, 74, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#d8f1ff";
  for (let index = 0; index < 24; index += 1) {
    const x = (index * 163) % WIDTH;
    const y = (index * 97) % 240;
    ctx.beginPath();
    ctx.arc(x, y, 2 + (index % 2), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlatforms() {
  for (const platform of platforms) {
    ctx.fillStyle = "#8ec5e3";
    ctx.fillRect(platform.x1, platform.y - 12, platform.x2 - platform.x1, 18);
    ctx.fillStyle = "#d9f2ff";
    ctx.fillRect(platform.x1 + 8, platform.y - 12, platform.x2 - platform.x1 - 16, 8);
  }
}

function drawPlayers() {
  for (const player of state.players.values()) {
    if (!player.alive) continue;
    ctx.fillStyle = "#f7fcff";
    ctx.beginPath();
    ctx.roundRect(player.x, player.y, player.width, player.height, 10);
    ctx.fill();
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x + 4, player.y + 4, player.width - 8, 10);
    ctx.fillStyle = "#203246";
    ctx.fillRect(player.x + 7, player.y + 12, 4, 4);
    ctx.fillRect(player.x + 15, player.y + 12, 4, 4);
    ctx.font = '12px "Avenir Next", "Segoe UI", sans-serif';
    ctx.fillStyle = "#f7fcff";
    ctx.fillText(`${player.label} ${formatLives(player.lives)}`, player.x - 4, player.y - 10);
  }
}

function drawEnemies() {
  for (const enemy of state.enemies) {
    if (enemy.rolling || enemy.frozen) {
      ctx.fillStyle = "#f7fcff";
      ctx.beginPath();
      ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#a1d9ff";
      ctx.beginPath();
      ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 12, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }

    ctx.fillStyle = enemy.type === "orb" ? "#ffb36c" : "#ff7f8a";
    ctx.beginPath();
    ctx.roundRect(enemy.x, enemy.y, enemy.width, enemy.height, 10);
    ctx.fill();
    ctx.fillStyle = "#1b2238";
    ctx.fillRect(enemy.x + 6, enemy.y + 9, 4, 4);
    ctx.fillRect(enemy.x + 16, enemy.y + 9, 4, 4);

    if (enemy.snow > 0) {
      ctx.fillStyle = "rgba(247, 252, 255, 0.72)";
      ctx.fillRect(enemy.x - 2, enemy.y - 6, enemy.width + 4, 4 + enemy.snow * 4);
    }
  }
}

function drawSnowShots() {
  ctx.fillStyle = "#f7fcff";
  for (const shot of state.snowShots) {
    ctx.beginPath();
    ctx.arc(shot.x, shot.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawOverlay() {
  if (!state.gameOver && !state.paused) return;
  ctx.fillStyle = "rgba(5, 10, 18, 0.58)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#f6fbff";
  ctx.textAlign = "center";
  ctx.font = '700 40px "Avenir Next", "Segoe UI", sans-serif';
  ctx.fillText(state.gameOver ? "Snow Bros Down" : "Paused", WIDTH / 2, HEIGHT / 2 - 12);
  ctx.font = '500 20px "Avenir Next", "Segoe UI", sans-serif';
  ctx.fillText(state.gameOver ? "Press A, Start, or R to restart." : "Press P or Start to resume.", WIDTH / 2, HEIGHT / 2 + 22);
  ctx.textAlign = "left";
}

function draw() {
  cabinetStage.syncContext(ctx);
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawBackground();
  drawPlatforms();
  drawSnowShots();
  drawEnemies();
  drawPlayers();
  drawOverlay();
}

function update(timestamp) {
  if (!state.lastTime) {
    state.lastTime = timestamp;
  }
  const dt = Math.min(0.032, (timestamp - state.lastTime) / 1000);
  state.lastTime = timestamp;

  ensureInputRoster();

  if (!state.paused && !state.gameOver) {
    updatePlayers(dt);
    updateSnowShots(dt);
    updateEnemies(dt);
  }

  if (state.gameOver) {
    showGameOverMenu();
  }

  updateUi();
  draw();
  requestAnimationFrame(update);
}

window.addEventListener("keydown", (event) => {
  if (GAMEPLAY_KEYS.has(event.key)) {
    event.preventDefault();
  }
  if (event.repeat) return;
  if (event.key === "ArrowLeft") state.keyboard.left = true;
  if (event.key === "ArrowRight") state.keyboard.right = true;
  if (event.key === "ArrowUp") state.keyboard.jump = true;
  if (event.key === " " || event.key === "Spacebar") state.keyboard.shoot = true;
  if (event.key.toLowerCase() === "p") {
    state.paused = !state.paused;
    setStatus(state.paused ? "Paused." : "Back to snow business.");
  }
  if (event.key.toLowerCase() === "r") {
    resetRound(false);
    setStatus("Fresh snow wave loaded.");
  }
});

window.addEventListener("keyup", (event) => {
  if (GAMEPLAY_KEYS.has(event.key)) {
    event.preventDefault();
  }
  if (event.key === "ArrowLeft") state.keyboard.left = false;
  if (event.key === "ArrowRight") state.keyboard.right = false;
  if (event.key === "ArrowUp") state.keyboard.jump = false;
  if (event.key === " " || event.key === "Spacebar") state.keyboard.shoot = false;
});

window.__arcadeCabinetHooks = {
  onPauseOpen() {
    state.paused = true;
    setStatus("Paused. Use the cabinet menu to resume, restart, or head back.");
  },
  onPauseClose() {
    if (!state.gameOver) {
      state.paused = false;
      setStatus("Back to snow business.");
    }
  },
  getPauseActions() {
    return [
      {
        id: "restart",
        label: state.gameOver ? "Play Again" : "Restart Run",
        run() {
          resetRound(false);
          setStatus("Fresh snow wave loaded.");
        },
      },
    ];
  },
};

spawnPlayer("keyboard", null, "Keyboard");
resetRound(false);
setStatus("Freeze the wave and kick the snowballs.");
updateUi();
window.__snowBrosDebug = { state, platforms };
requestAnimationFrame(update);
