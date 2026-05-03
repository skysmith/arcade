import { createArcadeStage } from "../../shared/arcade-stage.js";
import {
  DEFAULT_PLAYER_LIVES,
  decrementLives,
  formatLives,
  hasLivesRemaining,
} from "../../shared/lives-config.js";

const BUILD_NUMBER = "2026.04.12.1";
const MAX_PLAYERS = 4;
const PLAYER_COLORS = ["#ffbe64", "#7dd3ff", "#92ff9d", "#ff8fb1"];
const PLAYER_LABELS = ["P1", "P2", "P3", "P4"];
const KEYBOARD_PLAYER_ID = "keyboard-1";
const WIDTH = 960;
const HEIGHT = 600;
const ASTEROID_POINTS = { 3: 20, 2: 50, 1: 100 };
const SHIP_RADIUS = 14;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const playfieldShell = document.getElementById("playfield-shell");
const playfieldStage = document.getElementById("playfield-stage");
const arcadeCabinet = window.ArcadeCabinet || null;

const ui = {
  wave: document.getElementById("wave-value"),
  players: document.getElementById("players-value"),
  score: document.getElementById("score-value"),
  status: document.getElementById("status-value"),
  hint: document.getElementById("hint-value"),
};

document.title = `asteroids build ${BUILD_NUMBER}`;

const cabinetStage = createArcadeStage({
  shell: playfieldShell,
  stage: playfieldStage,
  canvas,
  logicalWidth: WIDTH,
  logicalHeight: HEIGHT,
});

const starfield = Array.from({ length: 140 }, (_, index) => {
  const seed = Math.sin((index + 1) * 91.73) * 10000;
  const fraction = seed - Math.floor(seed);
  const altSeed = Math.sin((index + 1) * 53.19) * 10000;
  const altFraction = altSeed - Math.floor(altSeed);
  return {
    x: fraction * WIDTH,
    y: altFraction * HEIGHT,
    radius: 0.8 + ((index * 13) % 10) * 0.17,
    alpha: 0.2 + ((index * 17) % 10) * 0.06,
  };
});

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
    thrust: false,
    fire: false,
    hyperspace: false,
  },
  keyboardEdge: {
    hyperspace: false,
  },
  bullets: [],
  asteroids: [],
  particles: [],
  saucer: null,
  saucerTimer: 9,
  nextWaveTimer: 0,
  joinButtonSnapshot: {},
  pauseButtonSnapshot: {},
  lastStatusText: "",
};
let gameOverMenuShown = false;

function trimControllerName(name) {
  return name.replace(/\(STANDARD GAMEPAD Vendor:.*$/i, "").trim() || "Controller";
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function wrapPosition(body) {
  if (body.x < -body.radius) body.x += WIDTH + body.radius * 2;
  if (body.x > WIDTH + body.radius) body.x -= WIDTH + body.radius * 2;
  if (body.y < -body.radius) body.y += HEIGHT + body.radius * 2;
  if (body.y > HEIGHT + body.radius) body.y -= HEIGHT + body.radius * 2;
}

function distanceSquared(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

function createParticleBurst(x, y, color, count = 12, speed = 160) {
  for (let index = 0; index < count; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = randomBetween(speed * 0.4, speed);
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      life: randomBetween(0.35, 0.9),
      maxLife: 0,
      color,
    });
    state.particles[state.particles.length - 1].maxLife = state.particles[state.particles.length - 1].life;
  }
}

function randomAsteroidVertices(radius) {
  return Array.from({ length: 10 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 10;
    const wobble = radius * randomBetween(0.72, 1.18);
    return {
      angle,
      distance: wobble,
    };
  });
}

function createAsteroid(size, x, y, baseAngle = Math.random() * Math.PI * 2, speedScale = 1) {
  const radius = size === 3 ? 46 : size === 2 ? 28 : 16;
  const speed = (size === 3 ? randomBetween(24, 48) : size === 2 ? randomBetween(48, 80) : randomBetween(70, 120)) * speedScale;
  return {
    x,
    y,
    vx: Math.cos(baseAngle) * speed,
    vy: Math.sin(baseAngle) * speed,
    rotation: randomBetween(-0.75, 0.75),
    angle: randomBetween(0, Math.PI * 2),
    radius,
    size,
    vertices: randomAsteroidVertices(radius),
  };
}

function safeSpawnPoint() {
  const candidateOffsets = [
    { x: 0, y: 0 },
    { x: -120, y: -70 },
    { x: 120, y: -70 },
    { x: -140, y: 90 },
    { x: 140, y: 90 },
  ];

  for (const offset of candidateOffsets) {
    const x = WIDTH / 2 + offset.x;
    const y = HEIGHT / 2 + offset.y;
    const safe = state.asteroids.every((asteroid) => distanceSquared(x, y, asteroid.x, asteroid.y) > (asteroid.radius + 140) ** 2);
    if (safe) {
      return { x, y };
    }
  }

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const x = randomBetween(100, WIDTH - 100);
    const y = randomBetween(100, HEIGHT - 100);
    const safe = state.asteroids.every((asteroid) => distanceSquared(x, y, asteroid.x, asteroid.y) > (asteroid.radius + 130) ** 2);
    if (safe) {
      return { x, y };
    }
  }

  return { x: WIDTH / 2, y: HEIGHT / 2 };
}

function spawnShip(player) {
  const spawn = safeSpawnPoint();
  player.active = true;
  player.x = spawn.x;
  player.y = spawn.y;
  player.vx = 0;
  player.vy = 0;
  player.angle = -Math.PI / 2;
  player.radius = SHIP_RADIUS;
  player.fireCooldown = 0;
  player.invulnerableTimer = 2.2;
  player.respawnTimer = 0;
  player.hyperspaceCooldown = 0;
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
    label: PLAYER_LABELS[slot] || `P${slot + 1}`,
    color: PLAYER_COLORS[slot % PLAYER_COLORS.length],
    lives: DEFAULT_PLAYER_LIVES,
    x: WIDTH / 2,
    y: HEIGHT / 2,
    vx: 0,
    vy: 0,
    angle: -Math.PI / 2,
    radius: SHIP_RADIUS,
    fireCooldown: 0,
    invulnerableTimer: 0,
    respawnTimer: 0,
    hyperspaceCooldown: 0,
    active: false,
  };

  state.players.set(id, player);
  if (controllerIndex !== null) {
    state.controllerAssignments.set(controllerIndex, id);
  }

  if (state.gameOver && state.players.size === 1) {
    restartRun();
    return;
  }

  if (!state.gameOver) {
    spawnShip(player);
  }
}

function removePlayer(playerId) {
  const player = state.players.get(playerId);
  if (!player) {
    return;
  }

  state.players.delete(playerId);

  if (player.controllerIndex !== null) {
    state.controllerAssignments.delete(player.controllerIndex);
    delete state.joinButtonSnapshot[player.controllerIndex];
    delete state.pauseButtonSnapshot[player.controllerIndex];
  }

  let slot = 0;
  for (const nextPlayer of state.players.values()) {
    nextPlayer.slot = slot;
    nextPlayer.label = PLAYER_LABELS[slot] || `P${slot + 1}`;
    nextPlayer.color = PLAYER_COLORS[slot % PLAYER_COLORS.length];
    slot += 1;
  }
}

function getGamepads() {
  if (!navigator.getGamepads) {
    return [];
  }
  return Array.from(navigator.getGamepads()).filter(Boolean);
}

function togglePause() {
  if (state.gameOver) {
    return;
  }
  state.paused = !state.paused;
  setStatus(state.paused ? "Paused. Press P or Start to resume." : "Back in flight.");
}

function ensureInputRoster() {
  const pads = getGamepads();
  const liveIndexes = new Set(pads.map((pad) => pad.index));
  const assignedIndexes = new Set(state.controllerAssignments.keys());

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
    const startPressed = !!pad.buttons[9]?.pressed;
    const previousJoinPressed = state.joinButtonSnapshot[pad.index] || false;
    const previousPausePressed = state.pauseButtonSnapshot[pad.index] || false;
    state.joinButtonSnapshot[pad.index] = startPressed;
    state.pauseButtonSnapshot[pad.index] = startPressed;

    if (!startPressed) {
      continue;
    }

    if (!previousJoinPressed && !state.controllerAssignments.has(pad.index) && state.players.size < MAX_PLAYERS) {
      spawnPlayer("gamepad", pad.index, trimControllerName(pad.id || `Controller ${pad.index + 1}`));
      continue;
    }

    if (!previousPausePressed && state.controllerAssignments.has(pad.index)) {
      togglePause();
    }
  }

  for (const index of Object.keys(state.joinButtonSnapshot)) {
    if (!liveIndexes.has(Number(index))) {
      delete state.joinButtonSnapshot[index];
      delete state.pauseButtonSnapshot[index];
    }
  }
}

function setStatus(text) {
  state.lastStatusText = text;
  ui.status.textContent = text;
}

function readKeyboardInput() {
  return {
    left: state.keyboard.left,
    right: state.keyboard.right,
    thrust: state.keyboard.thrust,
    fire: state.keyboard.fire,
    hyperspace: state.keyboard.hyperspace && !state.keyboardEdge.hyperspace,
  };
}

function readGamepadInput(controllerIndex) {
  if (controllerIndex === null || !navigator.getGamepads) {
    return { left: false, right: false, thrust: false, fire: false, hyperspace: false };
  }

  const pad = navigator.getGamepads()[controllerIndex];
  if (!pad) {
    return { left: false, right: false, thrust: false, fire: false, hyperspace: false };
  }

  const axisX = pad.axes[0] ?? 0;
  const axisY = pad.axes[1] ?? 0;
  const left = axisX < -0.35 || !!pad.buttons[14]?.pressed;
  const right = axisX > 0.35 || !!pad.buttons[15]?.pressed;
  const thrust = axisY < -0.3 || !!pad.buttons[12]?.pressed;
  const fire = !!pad.buttons[0]?.pressed || !!pad.buttons[1]?.pressed || !!pad.buttons[5]?.pressed;
  const hyperspace = !!pad.buttons[2]?.pressed || !!pad.buttons[3]?.pressed || !!pad.buttons[4]?.pressed;
  return { left, right, thrust, fire, hyperspace };
}

function createPlayerBullet(player) {
  const noseDistance = player.radius + 7;
  const x = player.x + Math.cos(player.angle) * noseDistance;
  const y = player.y + Math.sin(player.angle) * noseDistance;
  const bulletSpeed = 440;
  state.bullets.push({
    ownerId: player.id,
    x,
    y,
    vx: player.vx + Math.cos(player.angle) * bulletSpeed,
    vy: player.vy + Math.sin(player.angle) * bulletSpeed,
    radius: 2.5,
    life: 1.1,
    color: player.color,
  });
  createParticleBurst(x, y, player.color, 3, 70);
}

function triggerHyperspace(player) {
  if (player.hyperspaceCooldown > 0 || !player.active) {
    return;
  }

  createParticleBurst(player.x, player.y, player.color, 10, 110);
  const spawn = safeSpawnPoint();
  player.x = spawn.x;
  player.y = spawn.y;
  player.vx = randomBetween(-40, 40);
  player.vy = randomBetween(-40, 40);
  player.invulnerableTimer = Math.max(player.invulnerableTimer, 1.3);
  player.hyperspaceCooldown = 3.8;

  if (Math.random() < 0.12) {
    destroyPlayer(player);
    setStatus(`${player.label} lost a ship in hyperspace.`);
  }
}

function destroyPlayer(player) {
  if (!player.active) {
    return;
  }

  player.active = false;
  player.lives = decrementLives(player.lives);
  player.respawnTimer = hasLivesRemaining(player.lives) ? 2.2 : 0;
  createParticleBurst(player.x, player.y, player.color, 18, 220);

  if (!hasLivesRemaining(player.lives)) {
    setStatus(`${player.label} is out of ships.`);
  }
}

function maybeRespawnPlayer(player, dt) {
  if (player.active || !hasLivesRemaining(player.lives) || state.gameOver) {
    return;
  }

  player.respawnTimer = Math.max(0, player.respawnTimer - dt);
  if (player.respawnTimer > 0) {
    return;
  }

  const spawn = safeSpawnPoint();
  const safe = state.asteroids.every((asteroid) => distanceSquared(spawn.x, spawn.y, asteroid.x, asteroid.y) > (asteroid.radius + 90) ** 2);
  if (!safe) {
    player.respawnTimer = 0.4;
    return;
  }
  spawnShip(player);
}

function splitAsteroid(asteroid, bulletColor) {
  createParticleBurst(asteroid.x, asteroid.y, bulletColor || "#c7e2ff", asteroid.size === 3 ? 14 : 10, 160);

  if (asteroid.size <= 1) {
    return [];
  }

  const nextSize = asteroid.size - 1;
  return [
    createAsteroid(nextSize, asteroid.x, asteroid.y, asteroid.angle + Math.PI / 3, 1.25),
    createAsteroid(nextSize, asteroid.x, asteroid.y, asteroid.angle - Math.PI / 3, 1.25),
  ];
}

function setupWave(wave, preservePlayers = true) {
  state.wave = wave;
  state.bullets = [];
  state.particles = [];
  state.saucer = null;
  state.saucerTimer = Math.max(4, 10 - wave * 0.45);
  state.nextWaveTimer = 0;
  state.asteroids = [];

  const asteroidCount = Math.min(10, 4 + wave);
  for (let index = 0; index < asteroidCount; index += 1) {
    const side = index % 4;
    let x = 0;
    let y = 0;
    if (side === 0) {
      x = randomBetween(0, WIDTH);
      y = randomBetween(-40, 40);
    } else if (side === 1) {
      x = randomBetween(WIDTH - 40, WIDTH + 40);
      y = randomBetween(0, HEIGHT);
    } else if (side === 2) {
      x = randomBetween(0, WIDTH);
      y = randomBetween(HEIGHT - 40, HEIGHT + 40);
    } else {
      x = randomBetween(-40, 40);
      y = randomBetween(0, HEIGHT);
    }

    const asteroid = createAsteroid(3, x, y);
    const safe = [...state.players.values()].every((player) => !player.active || distanceSquared(player.x, player.y, asteroid.x, asteroid.y) > 220 ** 2);
    if (safe) {
      state.asteroids.push(asteroid);
    } else {
      index -= 1;
    }
  }

  if (!preservePlayers) {
    for (const player of state.players.values()) {
      player.lives = DEFAULT_PLAYER_LIVES;
      player.active = false;
      player.respawnTimer = 0;
    }
  }

  for (const player of state.players.values()) {
    if (hasLivesRemaining(player.lives)) {
      spawnShip(player);
    }
  }

  setStatus(`Wave ${state.wave} started. Clear the field.`);
}

function restartRun() {
  gameOverMenuShown = false;
  arcadeCabinet?.closeResults?.();
  state.score = 0;
  state.gameOver = false;
  state.paused = false;
  for (const player of state.players.values()) {
    player.lives = DEFAULT_PLAYER_LIVES;
    player.active = false;
    player.respawnTimer = 0;
  }
  setupWave(1, false);
}

function showGameOverMenu() {
  if (gameOverMenuShown || !state.gameOver) {
    return;
  }
  gameOverMenuShown = true;
  arcadeCabinet?.reportGameOver?.({
    gameId: "asteroids",
    title: "Asteroids",
    score: state.score,
    onRestart: restartRun,
  });
}

function updatePlayers(dt) {
  for (const player of state.players.values()) {
    maybeRespawnPlayer(player, dt);
    player.fireCooldown = Math.max(0, player.fireCooldown - dt);
    player.invulnerableTimer = Math.max(0, player.invulnerableTimer - dt);
    player.hyperspaceCooldown = Math.max(0, player.hyperspaceCooldown - dt);

    if (!player.active) {
      continue;
    }

    const input = player.source === "keyboard"
      ? readKeyboardInput()
      : readGamepadInput(player.controllerIndex);

    const turnSpeed = 3.8;
    const thrustPower = 240;
    if (input.left) {
      player.angle -= turnSpeed * dt;
    }
    if (input.right) {
      player.angle += turnSpeed * dt;
    }
    if (input.thrust) {
      player.vx += Math.cos(player.angle) * thrustPower * dt;
      player.vy += Math.sin(player.angle) * thrustPower * dt;
      createParticleBurst(
        player.x - Math.cos(player.angle) * 12,
        player.y - Math.sin(player.angle) * 12,
        "rgba(255,190,100,0.7)",
        1,
        40
      );
    }

    const drag = Math.pow(0.992, dt * 60);
    player.vx *= drag;
    player.vy *= drag;
    player.x += player.vx * dt;
    player.y += player.vy * dt;
    wrapPosition(player);

    if (input.fire && player.fireCooldown === 0) {
      createPlayerBullet(player);
      player.fireCooldown = 0.24;
    }

    if (input.hyperspace) {
      triggerHyperspace(player);
    }
  }

  state.keyboardEdge.hyperspace = state.keyboard.hyperspace;
}

function updateBullets(dt) {
  state.bullets = state.bullets.filter((bullet) => {
    bullet.life -= dt;
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    wrapPosition(bullet);
    return bullet.life > 0;
  });
}

function updateAsteroids(dt) {
  for (const asteroid of state.asteroids) {
    asteroid.x += asteroid.vx * dt;
    asteroid.y += asteroid.vy * dt;
    asteroid.angle += asteroid.rotation * dt;
    wrapPosition(asteroid);
  }
}

function updateParticles(dt) {
  state.particles = state.particles.filter((particle) => {
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= 0.985;
    particle.vy *= 0.985;
    return particle.life > 0;
  });
}

function maybeSpawnSaucer(dt) {
  if (state.saucer || state.wave < 2 || state.gameOver) {
    return;
  }
  state.saucerTimer -= dt;
  if (state.saucerTimer > 0) {
    return;
  }

  const fromLeft = Math.random() < 0.5;
  state.saucer = {
    x: fromLeft ? -50 : WIDTH + 50,
    y: randomBetween(90, HEIGHT - 110),
    vx: fromLeft ? 95 + state.wave * 6 : -(95 + state.wave * 6),
    vy: randomBetween(-28, 28),
    radius: 18,
    fireCooldown: 1.8,
    color: "#ff7d6b",
  };
  state.saucerTimer = randomBetween(9, 15);
  setStatus("Saucer inbound.");
}

function updateSaucer(dt) {
  if (!state.saucer) {
    return;
  }

  state.saucer.x += state.saucer.vx * dt;
  state.saucer.y += state.saucer.vy * dt;
  if (state.saucer.y < 60 || state.saucer.y > HEIGHT - 60) {
    state.saucer.vy *= -1;
  }
  state.saucer.fireCooldown -= dt;

  if (state.saucer.fireCooldown <= 0) {
    const target = [...state.players.values()].find((player) => player.active);
    if (target) {
      const angle = Math.atan2(target.y - state.saucer.y, target.x - state.saucer.x);
      state.bullets.push({
        ownerId: "saucer",
        x: state.saucer.x,
        y: state.saucer.y,
        vx: Math.cos(angle) * 240,
        vy: Math.sin(angle) * 240,
        radius: 3,
        life: 1.9,
        color: "#ff7d6b",
      });
      state.saucer.fireCooldown = randomBetween(1.2, 2.3);
    }
  }

  if (state.saucer.x < -120 || state.saucer.x > WIDTH + 120) {
    state.saucer = null;
  }
}

function handleBulletCollisions() {
  const nextAsteroids = [];

  for (const asteroid of state.asteroids) {
    let destroyed = false;

    for (const bullet of state.bullets) {
      if (destroyed || bullet.life <= 0) {
        continue;
      }
      if (distanceSquared(asteroid.x, asteroid.y, bullet.x, bullet.y) > (asteroid.radius + bullet.radius) ** 2) {
        continue;
      }

      bullet.life = 0;
      destroyed = true;
      if (bullet.ownerId !== "saucer") {
        state.score += ASTEROID_POINTS[asteroid.size] || 0;
      }
      nextAsteroids.push(...splitAsteroid(asteroid, bullet.color));
    }

    if (!destroyed) {
      nextAsteroids.push(asteroid);
    }
  }

  state.asteroids = nextAsteroids;

  if (state.saucer) {
    for (const bullet of state.bullets) {
      if (bullet.ownerId === "saucer" || bullet.life <= 0) {
        continue;
      }
      if (distanceSquared(state.saucer.x, state.saucer.y, bullet.x, bullet.y) <= (state.saucer.radius + bullet.radius) ** 2) {
        bullet.life = 0;
        createParticleBurst(state.saucer.x, state.saucer.y, "#ff7d6b", 16, 180);
        state.score += 200;
        state.saucer = null;
        setStatus("Saucer destroyed.");
        break;
      }
    }
  }

  state.bullets = state.bullets.filter((bullet) => bullet.life > 0);
}

function handleShipCollisions() {
  for (const player of state.players.values()) {
    if (!player.active || player.invulnerableTimer > 0) {
      continue;
    }

    const asteroidHit = state.asteroids.some((asteroid) => distanceSquared(player.x, player.y, asteroid.x, asteroid.y) <= (player.radius + asteroid.radius - 3) ** 2);
    if (asteroidHit) {
      destroyPlayer(player);
      continue;
    }

    for (const bullet of state.bullets) {
      if (bullet.ownerId === player.id || bullet.life <= 0) {
        continue;
      }
      if (distanceSquared(player.x, player.y, bullet.x, bullet.y) <= (player.radius + bullet.radius + 1) ** 2) {
        bullet.life = 0;
        destroyPlayer(player);
        break;
      }
    }

    if (state.saucer && distanceSquared(player.x, player.y, state.saucer.x, state.saucer.y) <= (player.radius + state.saucer.radius) ** 2) {
      destroyPlayer(player);
      createParticleBurst(state.saucer.x, state.saucer.y, "#ff7d6b", 12, 180);
      state.saucer = null;
    }
  }

  state.bullets = state.bullets.filter((bullet) => bullet.life > 0);
}

function maybeAdvanceWave(dt) {
  if (state.asteroids.length > 0 || state.gameOver) {
    state.nextWaveTimer = 0;
    return;
  }

  state.nextWaveTimer += dt;
  if (state.nextWaveTimer < 1.4) {
    setStatus(`Field clear. Wave ${state.wave + 1} incoming.`);
    return;
  }

  setupWave(state.wave + 1);
}

function checkGameOver() {
  if (state.players.size === 0) {
    return;
  }

  const anyoneAlive = [...state.players.values()].some((player) => player.active || hasLivesRemaining(player.lives));
  if (anyoneAlive || state.gameOver) {
    return;
  }

  state.gameOver = true;
  state.paused = false;
  setStatus("Game over. Press A, Start, or R to launch a new run.");
  showGameOverMenu();
}

function updateHud() {
  ui.wave.textContent = String(state.wave);
  ui.players.textContent = `${state.players.size}`;
  ui.score.textContent = String(state.score);

  const playerSummary = [...state.players.values()]
    .map((player) => `${player.label}:${formatLives(player.lives)}`)
    .join("  ");
  ui.hint.textContent = playerSummary
    ? `${playerSummary}  |  Space fires, Shift jumps, R restarts`
    : "Connect a pad or use the keyboard fallback.";
}

function update(dt) {
  ensureInputRoster();
  updateHud();

  if (state.paused || state.gameOver) {
    return;
  }

  updatePlayers(dt);
  updateBullets(dt);
  updateAsteroids(dt);
  updateParticles(dt);
  maybeSpawnSaucer(dt);
  updateSaucer(dt);
  handleBulletCollisions();
  handleShipCollisions();
  maybeAdvanceWave(dt);
  checkGameOver();
}

function drawShip(player) {
  const blink = player.invulnerableTimer > 0 && Math.floor(player.invulnerableTimer * 12) % 2 === 0;
  if (blink) {
    return;
  }

  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.angle + Math.PI / 2);
  ctx.strokeStyle = player.color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(11, 14);
  ctx.lineTo(0, 8);
  ctx.lineTo(-11, 14);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = player.color;
  ctx.font = '12px "Avenir Next", "Segoe UI", sans-serif';
  ctx.fillText(player.label, player.x - 10, player.y - 22);
}

function drawAsteroid(asteroid) {
  ctx.save();
  ctx.translate(asteroid.x, asteroid.y);
  ctx.rotate(asteroid.angle);
  ctx.strokeStyle = "rgba(221, 233, 255, 0.88)";
  ctx.lineWidth = asteroid.size === 3 ? 3 : 2;
  ctx.beginPath();
  asteroid.vertices.forEach((vertex, index) => {
    const x = Math.cos(vertex.angle) * vertex.distance;
    const y = Math.sin(vertex.angle) * vertex.distance;
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawSaucer() {
  if (!state.saucer) {
    return;
  }

  ctx.save();
  ctx.translate(state.saucer.x, state.saucer.y);
  ctx.strokeStyle = state.saucer.color;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 4, 22, 8, 0, 0, Math.PI * 2);
  ctx.moveTo(-12, -2);
  ctx.lineTo(12, -2);
  ctx.moveTo(-16, 4);
  ctx.lineTo(-10, -8);
  ctx.lineTo(10, -8);
  ctx.lineTo(16, 4);
  ctx.stroke();
  ctx.restore();
}

function drawBullets() {
  for (const bullet of state.bullets) {
    ctx.beginPath();
    ctx.fillStyle = bullet.color;
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawParticles() {
  for (const particle of state.particles) {
    const alpha = particle.maxLife > 0 ? particle.life / particle.maxLife : 0.6;
    ctx.fillStyle = particle.color.startsWith("rgba")
      ? particle.color.replace(/[\d.]+\)$/u, `${Math.max(0.08, alpha)})`)
      : particle.color;
    ctx.fillRect(particle.x, particle.y, 2.2, 2.2);
  }
}

function drawBackdrop() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, "#050916");
  gradient.addColorStop(1, "#02040a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  for (const star of starfield) {
    ctx.beginPath();
    ctx.fillStyle = `rgba(239, 247, 255, ${star.alpha})`;
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(67, 110, 196, 0.08)";
  ctx.lineWidth = 1;
  ctx.strokeRect(28, 28, WIDTH - 56, HEIGHT - 56);
}

function drawOverlayText() {
  if (!state.paused && !state.gameOver) {
    return;
  }

  ctx.fillStyle = "rgba(2, 6, 14, 0.56)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.textAlign = "center";
  ctx.fillStyle = "#f3f8ff";
  ctx.font = '700 34px "Avenir Next", "Segoe UI", sans-serif';
  ctx.fillText(state.gameOver ? "Run Over" : "Paused", WIDTH / 2, HEIGHT / 2 - 18);
  ctx.font = '500 18px "Avenir Next", "Segoe UI", sans-serif';
  ctx.fillStyle = "rgba(243, 248, 255, 0.76)";
  ctx.fillText(state.gameOver ? "Press A, Start, or R to restart the cabinet." : "Press P or Start to resume.", WIDTH / 2, HEIGHT / 2 + 18);
  ctx.textAlign = "start";
}

function render() {
  cabinetStage.syncContext(ctx);
  drawBackdrop();

  for (const asteroid of state.asteroids) {
    drawAsteroid(asteroid);
  }

  drawSaucer();
  drawParticles();
  drawBullets();

  for (const player of state.players.values()) {
    if (player.active) {
      drawShip(player);
    }
  }

  drawOverlayText();
}

function frame(timestamp) {
  if (!state.lastTime) {
    state.lastTime = timestamp;
  }
  const delta = Math.min(32, timestamp - state.lastTime) / 1000;
  state.lastTime = timestamp;

  update(delta);
  render();
  requestAnimationFrame(frame);
}

window.addEventListener("keydown", (event) => {
  if (event.repeat && (event.code === "KeyP" || event.code === "KeyR")) {
    return;
  }

  if (event.code === "ArrowLeft") state.keyboard.left = true;
  if (event.code === "ArrowRight") state.keyboard.right = true;
  if (event.code === "ArrowUp") state.keyboard.thrust = true;
  if (event.code === "Space") {
    state.keyboard.fire = true;
    event.preventDefault();
  }
  if (event.code === "ShiftLeft" || event.code === "ShiftRight") state.keyboard.hyperspace = true;
  if (event.code === "KeyP") togglePause();
  if (event.code === "KeyR") restartRun();
});

window.addEventListener("keyup", (event) => {
  if (event.code === "ArrowLeft") state.keyboard.left = false;
  if (event.code === "ArrowRight") state.keyboard.right = false;
  if (event.code === "ArrowUp") state.keyboard.thrust = false;
  if (event.code === "Space") state.keyboard.fire = false;
  if (event.code === "ShiftLeft" || event.code === "ShiftRight") state.keyboard.hyperspace = false;
});

window.addEventListener("blur", () => {
  state.keyboard.left = false;
  state.keyboard.right = false;
  state.keyboard.thrust = false;
  state.keyboard.fire = false;
  state.keyboard.hyperspace = false;
});

spawnPlayer("keyboard", null, "Keyboard");
setupWave(1);
updateHud();
requestAnimationFrame(frame);
