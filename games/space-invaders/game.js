const BUILD_NUMBER = "2026.04.13.1";
const MAX_PLAYERS = 4;
const PLAYER_COLORS = ["#9bf96f", "#6fc9ff", "#ffda72", "#ff8aa0"];
const PLAYER_LABELS = ["P1", "P2", "P3", "P4"];
const KEYBOARD_PLAYER_ID = "keyboard-1";
const PLAYER_FIRE_INTERVAL = 0.18;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const arcadeCabinet = window.ArcadeCabinet || null;

const ui = {
  wave: document.getElementById("wave-value"),
  players: document.getElementById("players-value"),
  score: document.getElementById("score-value"),
  status: document.getElementById("status-value"),
  hint: document.getElementById("hint-value"),
};

document.title = `space-invaders build ${BUILD_NUMBER}`;

const state = {
  players: new Map(),
  controllerAssignments: new Map(),
  score: 0,
  wave: 1,
  lastTime: 0,
  paused: false,
  gameOver: false,
  keyboard: {
    left: false,
    right: false,
    fireHeld: false,
  },
  bullets: [],
  enemyBullets: [],
  enemies: [],
  swarmDirection: 1,
  swarmSpeed: 22,
  enemyFireCooldown: 0,
  joinButtonSnapshot: {},
  lastStatusText: "",
};
let gameOverMenuShown = false;

function resetWave(advance = false) {
  if (advance) {
    state.wave += 1;
  }
  state.bullets = [];
  state.enemyBullets = [];
  state.enemies = [];
  state.swarmDirection = 1;
  state.swarmSpeed = 22 + (state.wave - 1) * 3;
  state.enemyFireCooldown = 0.45;

  const cols = 9;
  const rows = 4;
  const startX = 174;
  const startY = 86;
  const gapX = 66;
  const gapY = 44;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      state.enemies.push({
        x: startX + col * gapX,
        y: startY + row * gapY,
        width: 34,
        height: 22,
        value: (rows - row) * 10,
        alive: true,
      });
    }
  }

  for (const player of state.players.values()) {
    player.alive = true;
    player.respawnAt = 0;
    player.fireCooldown = PLAYER_FIRE_INTERVAL;
  }

  relayoutPlayers();
}

function spawnPlayer(source, controllerIndex, controllerName) {
  if (state.players.size >= MAX_PLAYERS) {
    return;
  }

  const slot = state.players.size;
  const id = source === "keyboard" ? KEYBOARD_PLAYER_ID : `gamepad-${controllerIndex}`;
  const player = {
    id,
    source,
    controllerIndex,
    controllerName,
    slot,
    x: canvas.width / 2,
    y: canvas.height - 54,
    width: 32,
    height: 18,
    speed: 320,
    color: PLAYER_COLORS[slot % PLAYER_COLORS.length],
    label: PLAYER_LABELS[slot] || `P${slot + 1}`,
    lives: 3,
    alive: true,
    fireCooldown: PLAYER_FIRE_INTERVAL,
    respawnAt: 0,
  };

  state.players.set(id, player);
  if (controllerIndex !== null) {
    state.controllerAssignments.set(controllerIndex, id);
  }
  relayoutPlayers();
}

function removePlayer(playerId) {
  state.players.delete(playerId);
  relayoutPlayers();
}

function relayoutPlayers() {
  const players = [...state.players.values()];
  const laneWidth = canvas.width / Math.max(1, players.length);
  players.forEach((player, index) => {
    player.slot = index;
    player.color = PLAYER_COLORS[index % PLAYER_COLORS.length];
    player.label = PLAYER_LABELS[index] || `P${index + 1}`;
    const center = laneWidth * index + laneWidth / 2;
    player.x = Math.max(32, Math.min(canvas.width - 32, center));
    player.y = canvas.height - 54;
  });
}

function ensureInputRoster() {
  const pads = getGamepads();
  const liveIndexes = new Set();
  const assignedIndexes = new Set(state.controllerAssignments.keys());

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
    const joinPressed = !!pad.buttons[9]?.pressed;
    const previous = state.joinButtonSnapshot[pad.index] || false;
    state.joinButtonSnapshot[pad.index] = joinPressed;

    if (!joinPressed || previous) {
      continue;
    }
    if (state.controllerAssignments.has(pad.index)) {
      continue;
    }
    if (state.players.size >= MAX_PLAYERS) {
      continue;
    }
    spawnPlayer("gamepad", pad.index, trimControllerName(pad.id || `Controller ${pad.index + 1}`));
  }

  for (const index of Object.keys(state.joinButtonSnapshot)) {
    if (!liveIndexes.has(Number(index))) {
      delete state.joinButtonSnapshot[index];
    }
  }
}

function getGamepads() {
  if (!navigator.getGamepads) {
    return [];
  }
  return Array.from(navigator.getGamepads()).filter((pad) => Boolean(pad));
}

function trimControllerName(name) {
  return name.replace(/\(STANDARD GAMEPAD Vendor:.*$/i, "").trim() || "Controller";
}

function readKeyboardInput() {
  return {
    left: state.keyboard.left,
    right: state.keyboard.right,
    fire: state.keyboard.fireHeld,
    pause: false,
  };
}

function readGamepadInput(controllerIndex) {
  if (controllerIndex === null || !navigator.getGamepads) {
    return { left: false, right: false, fire: false, pause: false };
  }

  const pad = navigator.getGamepads()[controllerIndex];
  if (!pad) {
    return { left: false, right: false, fire: false, pause: false };
  }

  const axisX = pad.axes[0] ?? 0;
  const left = axisX < -0.35 || !!pad.buttons[14]?.pressed;
  const right = axisX > 0.35 || !!pad.buttons[15]?.pressed;
  const fire = !!pad.buttons[0]?.pressed || !!pad.buttons[1]?.pressed || !!pad.buttons[5]?.pressed;
  const pause = !!pad.buttons[9]?.pressed;
  return { left, right, fire, pause };
}

function createPlayerBullet(player) {
  state.bullets.push({
    ownerId: player.id,
    x: player.x,
    y: player.y - player.height,
    vy: -460,
    radius: 4,
    color: player.color,
  });
}

function createEnemyBullet(enemy) {
  state.enemyBullets.push({
    x: enemy.x,
    y: enemy.y + enemy.height * 0.5,
    vy: 250 + state.wave * 12,
    radius: 4,
  });
}

function updatePlayers(delta) {
  const dt = delta / 1000;
  let pausePressed = false;

  for (const player of state.players.values()) {
    if (!player.alive) {
      if (player.respawnAt > 0 && performance.now() >= player.respawnAt && player.lives > 0) {
        player.alive = true;
        player.respawnAt = 0;
        player.y = canvas.height - 54;
      }
      continue;
    }

    const input = player.source === "keyboard"
      ? readKeyboardInput()
      : readGamepadInput(player.controllerIndex);

    let dx = 0;
    if (input.left) dx -= 1;
    if (input.right) dx += 1;
    player.x = Math.max(26, Math.min(canvas.width - 26, player.x + dx * player.speed * dt));

    player.fireCooldown -= dt;
    if (input.fire && player.fireCooldown <= 0) {
      createPlayerBullet(player);
      player.fireCooldown = PLAYER_FIRE_INTERVAL;
    }

    if (input.pause) {
      pausePressed = true;
    }
  }

  if (pausePressed && !state.pauseLatched) {
    state.paused = !state.paused;
  }
  state.pauseLatched = pausePressed;
}

function updateBullets(delta) {
  const dt = delta / 1000;

  state.bullets.forEach((bullet) => {
    bullet.y += bullet.vy * dt;
  });
  state.enemyBullets.forEach((bullet) => {
    bullet.y += bullet.vy * dt;
  });

  state.bullets = state.bullets.filter((bullet) => bullet.y > -20);
  state.enemyBullets = state.enemyBullets.filter((bullet) => bullet.y < canvas.height + 20);
}

function updateEnemies(delta) {
  const dt = delta / 1000;
  const liveEnemies = state.enemies.filter((enemy) => enemy.alive);
  if (liveEnemies.length === 0) {
    resetWave(true);
    return;
  }

  let hitEdge = false;
  for (const enemy of liveEnemies) {
    enemy.x += state.swarmDirection * state.swarmSpeed * dt;
    if (enemy.x >= canvas.width - 44 || enemy.x <= 44) {
      hitEdge = true;
    }
  }

  if (hitEdge) {
    state.swarmDirection *= -1;
    for (const enemy of liveEnemies) {
      enemy.y += 18;
    }
  }

  state.enemyFireCooldown -= dt;
  if (state.enemyFireCooldown <= 0) {
    const columns = new Map();
    for (const enemy of liveEnemies) {
      const key = Math.round(enemy.x / 66);
      const current = columns.get(key);
      if (!current || enemy.y > current.y) {
        columns.set(key, enemy);
      }
    }
    const shooters = [...columns.values()];
    if (shooters.length > 0) {
      const shooter = shooters[Math.floor(Math.random() * shooters.length)];
      createEnemyBullet(shooter);
    }
    state.enemyFireCooldown = Math.max(0.28, 0.78 - state.wave * 0.03);
  }
}

function rectHit(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function updateCollisions() {
  for (const bullet of state.bullets) {
    for (const enemy of state.enemies) {
      if (!enemy.alive) {
        continue;
      }
      if (rectHit(bullet.x - bullet.radius, bullet.y - bullet.radius, bullet.radius * 2, bullet.radius * 2, enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height)) {
        enemy.alive = false;
        bullet.hit = true;
        state.score += enemy.value;
        break;
      }
    }
  }

  for (const bullet of state.enemyBullets) {
    for (const player of state.players.values()) {
      if (!player.alive) {
        continue;
      }
      if (rectHit(bullet.x - bullet.radius, bullet.y - bullet.radius, bullet.radius * 2, bullet.radius * 2, player.x - player.width / 2, player.y - player.height / 2, player.width, player.height)) {
        bullet.hit = true;
        player.lives -= 1;
        player.alive = false;
        player.respawnAt = player.lives > 0 ? performance.now() + 1100 : 0;
      }
    }
  }

  state.bullets = state.bullets.filter((bullet) => !bullet.hit);
  state.enemyBullets = state.enemyBullets.filter((bullet) => !bullet.hit);

  const invasionLine = canvas.height - 104;
  if (state.enemies.some((enemy) => enemy.alive && enemy.y >= invasionLine)) {
    state.gameOver = true;
  }

  const alivePlayers = [...state.players.values()].filter((player) => player.alive || player.lives > 0);
  if (alivePlayers.length === 0) {
    state.gameOver = true;
  }
}

function resetGame() {
  gameOverMenuShown = false;
  arcadeCabinet?.closeResults?.();
  state.score = 0;
  state.wave = 1;
  state.paused = false;
  state.gameOver = false;
  state.bullets = [];
  state.enemyBullets = [];
  for (const player of state.players.values()) {
    player.lives = 3;
    player.alive = true;
    player.respawnAt = 0;
    player.fireCooldown = PLAYER_FIRE_INTERVAL;
  }
  resetWave(false);
}

function showGameOverMenu() {
  if (gameOverMenuShown || !state.gameOver) {
    return;
  }
  gameOverMenuShown = true;
  arcadeCabinet?.reportGameOver?.({
    gameId: "space-invaders",
    title: "Space Invaders",
    score: state.score,
    onRestart: resetGame,
  });
}

function drawBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#03050b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.45)";
  for (let i = 0; i < 42; i += 1) {
    const x = (i * 97) % canvas.width;
    const y = (i * 53) % canvas.height;
    ctx.fillRect(x, y, 2, 2);
  }

  ctx.strokeStyle = "rgba(155, 249, 111, 0.32)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height - 28);
  ctx.lineTo(canvas.width, canvas.height - 28);
  ctx.stroke();
}

function drawEnemies() {
  for (const enemy of state.enemies) {
    if (!enemy.alive) continue;
    ctx.fillStyle = "#c8f56f";
    ctx.fillRect(enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height);
    ctx.clearRect(enemy.x - 10, enemy.y - 3, 4, 4);
    ctx.clearRect(enemy.x + 6, enemy.y - 3, 4, 4);
  }
}

function drawPlayers() {
  for (const player of state.players.values()) {
    const laneText = `${player.label} ${Math.max(0, player.lives)}x`;
    ctx.fillStyle = player.color;
    ctx.font = "600 12px Avenir Next";
    ctx.textAlign = "center";
    ctx.fillText(laneText, player.x, canvas.height - 8);

    if (!player.alive) {
      continue;
    }

    ctx.fillRect(player.x - 16, player.y - 8, 32, 12);
    ctx.fillRect(player.x - 4, player.y - 18, 8, 10);
  }
}

function drawBullets() {
  for (const bullet of state.bullets) {
    ctx.fillStyle = bullet.color;
    ctx.fillRect(bullet.x - 2, bullet.y - 10, 4, 16);
  }

  for (const bullet of state.enemyBullets) {
    ctx.fillStyle = "#ff6f7f";
    ctx.fillRect(bullet.x - 2, bullet.y - 8, 4, 14);
  }
}

function drawOverlay() {
  if (!state.paused && !state.gameOver) {
    return;
  }

  ctx.fillStyle = "rgba(2, 5, 12, 0.72)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f4f7ff";
  ctx.textAlign = "center";
  ctx.font = "700 42px Avenir Next";
  ctx.fillText(state.gameOver ? "Cabinet Reset" : "Paused", canvas.width / 2, canvas.height / 2 - 10);
  ctx.font = "500 18px Avenir Next";
  ctx.fillStyle = "rgba(244,247,255,0.76)";
  ctx.fillText("Press R to restart or P to keep going.", canvas.width / 2, canvas.height / 2 + 26);
}

function syncUi() {
  ui.wave.textContent = String(state.wave);
  ui.players.textContent = String(state.players.size);
  ui.score.textContent = String(state.score);

  const controllerPlayers = [...state.players.values()].filter((player) => player.source === "gamepad");
  const statusText = controllerPlayers.length > 0
    ? controllerPlayers.map((player) => `${player.label} on ${player.controllerName}`).join(" • ")
    : "Keyboard fallback ready.";

  if (statusText !== state.lastStatusText) {
    ui.status.textContent = statusText;
    state.lastStatusText = statusText;
  }

  ui.hint.textContent = state.players.size > 1
    ? "Extra pads join when Start is pressed. Start pauses. R restarts."
    : "First pad is P1. Extra pads join on Start. Hidden controller? Use the bridge launcher.";
}

function render() {
  drawBackground();
  drawEnemies();
  drawBullets();
  drawPlayers();
  drawOverlay();
  syncUi();
}

function update(timestamp) {
  ensureInputRoster();

  if (state.lastTime === 0) {
    state.lastTime = timestamp;
  }
  const delta = timestamp - state.lastTime;
  state.lastTime = timestamp;

  if (!state.paused && !state.gameOver) {
    updatePlayers(delta);
    updateBullets(delta);
    updateEnemies(delta);
    updateCollisions();
  }

  if (state.gameOver) {
    showGameOverMenu();
  }

  render();
  requestAnimationFrame(update);
}

function onKeyChange(code, isDown) {
  if (code === "ArrowLeft") {
    state.keyboard.left = isDown;
  } else if (code === "ArrowRight") {
    state.keyboard.right = isDown;
  } else if (code === "Space") {
    state.keyboard.fireHeld = isDown;
  }
}

window.addEventListener("keydown", (event) => {
  if (event.code === "KeyP" && !event.repeat) {
    state.paused = !state.paused;
    return;
  }
  if (event.code === "KeyR" && !event.repeat) {
    resetGame();
    return;
  }

  if (["ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
    event.preventDefault();
    onKeyChange(event.code, true);
  }
});

window.addEventListener("keyup", (event) => {
  if (["ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
    event.preventDefault();
    onKeyChange(event.code, false);
  }
});

window.addEventListener("gamepadconnected", ensureInputRoster);
window.addEventListener("gamepaddisconnected", ensureInputRoster);

ensureInputRoster();
resetGame();
render();
requestAnimationFrame(update);
