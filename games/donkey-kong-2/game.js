const BUILD_NUMBER = "2026.04.13.2";
const MAX_PLAYERS = 4;
const KEYBOARD_PLAYER_ID = "keyboard-1";
const PLAYER_COLORS = ["#7cff8b", "#6fbdff", "#ffd36f", "#ff8fab"];
const PLAYER_LABELS = ["P1", "P2", "P3", "P4"];
const GRAVITY = 900;
const MOVE_SPEED = 170;
const CLIMB_SPEED = 150;
const JUMP_SPEED = 370;
const RESPAWN_MS = 1300;
const CLIMB_GRAB_X_PADDING = 14;
const CLIMB_GRAB_Y_PADDING = 16;
const CLIMB_EXIT_PADDING = 4;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const arcadeCabinet = window.ArcadeCabinet || null;

const ui = {
  stage: document.getElementById("stage-value"),
  players: document.getElementById("players-value"),
  locks: document.getElementById("locks-value"),
  status: document.getElementById("status-value"),
  hint: document.getElementById("hint-value"),
};

document.title = `Donkey Kong Jr. build ${BUILD_NUMBER}`;

const platforms = [
  { x1: 134, x2: 826, y: 668 },
  { x1: 122, x2: 780, y: 538 },
  { x1: 168, x2: 852, y: 406 },
  { x1: 132, x2: 764, y: 274 },
  { x1: 178, x2: 814, y: 144 },
];

const vines = [
  createVinePair(210, 248, 0, 1),
  createVinePair(374, 412, 1, 2),
  createVinePair(548, 586, 0, 3),
  createVinePair(694, 732, 2, 4),
  createVinePair(474, 512, 3, 4),
];

const keySpawns = [
  { x: 684, y: platforms[4].y - 34, lockIndex: 0 },
  { x: 330, y: platforms[3].y - 34, lockIndex: 1 },
  { x: 178, y: platforms[2].y - 34, lockIndex: 2 },
];

const locks = [
  { x: 486, y: 88, width: 24, height: 38, unlocked: false },
  { x: 548, y: 88, width: 24, height: 38, unlocked: false },
  { x: 610, y: 88, width: 24, height: 38, unlocked: false },
];

const cageGoal = { x: 470, y: 30, width: 180, height: 96 };
const dk = { x: 138, y: 86, width: 104, height: 76 };

const state = {
  players: new Map(),
  controllerAssignments: new Map(),
  joinButtonSnapshot: {},
  pauseButtonSnapshot: {},
  keyboard: {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
  },
  keys: [],
  round: 1,
  locksReleased: 0,
  score: 0,
  gameOver: false,
  paused: false,
  lastTime: 0,
  birds: [],
  sparks: [],
  birdTimer: 0.8,
  sparkTimer: 1.7,
  lastStatusText: "",
};
let gameOverMenuShown = false;

const GAMEPLAY_KEYS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "Spacebar", "p", "P", "r", "R"]);

function createVinePair(leftX, rightX, lowerPlatformIndex, upperPlatformIndex) {
  return {
    leftX,
    rightX,
    centerX: (leftX + rightX) / 2,
    width: rightX - leftX + 20,
    lowerPlatformIndex,
    upperPlatformIndex,
    yBottom: platforms[lowerPlatformIndex].y - 4,
    yTop: platforms[upperPlatformIndex].y,
  };
}

function resetRound(advance = false) {
  gameOverMenuShown = false;
  arcadeCabinet?.closeResults?.();
  if (advance) {
    state.round += 1;
    state.score += 400;
  }

  state.gameOver = false;
  state.paused = false;
  state.locksReleased = 0;
  state.keys = keySpawns.map((spawn) => ({
    x: spawn.x,
    y: spawn.y,
    width: 18,
    height: 18,
    carriedBy: null,
    delivered: false,
    lockIndex: spawn.lockIndex,
  }));
  locks.forEach((lock) => {
    lock.unlocked = false;
  });

  state.birds = [];
  state.sparks = [];
  state.birdTimer = 0.9;
  state.sparkTimer = 1.8;

  for (const player of state.players.values()) {
    resetPlayer(player);
    player.lives = Math.max(player.lives, 3);
  }

  relayoutPlayers();
}

function showGameOverMenu() {
  if (gameOverMenuShown || !state.gameOver) {
    return;
  }
  gameOverMenuShown = true;
  arcadeCabinet?.reportGameOver?.({
    gameId: "donkey-kong-2",
    title: "Donkey Kong Jr.",
    score: state.score,
    onRestart: () => {
      resetRound(false);
      setStatus("Rescue reset.");
    },
  });
}

function resetPlayer(player) {
  player.width = 24;
  player.height = 30;
  player.vx = 0;
  player.vy = 0;
  player.onVine = false;
  player.vineId = null;
  player.alive = true;
  player.respawnAt = 0;
  player.carryingKey = null;
  player.groundedPlatform = 0;
  player.jumpPressedLastFrame = false;
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
    width: 24,
    height: 30,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    lives: 3,
    alive: true,
    onVine: false,
    vineId: null,
    respawnAt: 0,
    carryingKey: null,
    groundedPlatform: 0,
    jumpPressedLastFrame: false,
  };

  state.players.set(id, player);
  if (controllerIndex !== null) {
    state.controllerAssignments.set(controllerIndex, id);
    state.pauseButtonSnapshot[controllerIndex] = true;
  }
  relayoutPlayers();
}

function relayoutPlayers() {
  const activePlayers = [...state.players.values()];
  const bottom = platforms[0];
  const laneWidth = (bottom.x2 - bottom.x1) / Math.max(1, activePlayers.length + 1);
  activePlayers.forEach((player, index) => {
    player.label = PLAYER_LABELS[index] || `P${index + 1}`;
    player.color = PLAYER_COLORS[index % PLAYER_COLORS.length];
    const x = bottom.x1 + laneWidth * (index + 1);
    player.x = x;
    player.y = bottom.y - player.height;
    player.vx = 0;
    player.vy = 0;
    player.onVine = false;
    player.vineId = null;
    player.groundedPlatform = 0;
  });
}

function removePlayer(playerId) {
  const player = state.players.get(playerId);
  if (player?.carryingKey !== null) {
    const key = state.keys[player.carryingKey];
    if (key && !key.delivered) {
      key.carriedBy = null;
      key.x = player.x + player.width / 2;
      key.y = player.y - 10;
    }
  }
  state.players.delete(playerId);
  relayoutPlayers();
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

function getGamepads() {
  if (!navigator.getGamepads) return [];
  return Array.from(navigator.getGamepads()).filter(Boolean);
}

function trimControllerName(name) {
  return name.replace(/\(STANDARD GAMEPAD Vendor:.*$/i, "").trim() || "Controller";
}

function readKeyboardInput() {
  return {
    left: state.keyboard.left,
    right: state.keyboard.right,
    up: state.keyboard.up,
    down: state.keyboard.down,
    jump: state.keyboard.jump,
  };
}

function readGamepadInput(controllerIndex) {
  if (controllerIndex === null || !navigator.getGamepads) {
    return { left: false, right: false, up: false, down: false, jump: false };
  }

  const pad = navigator.getGamepads()[controllerIndex];
  if (!pad) {
    return { left: false, right: false, up: false, down: false, jump: false };
  }

  const axisX = pad.axes[0] ?? 0;
  const axisY = pad.axes[1] ?? 0;

  return {
    left: axisX < -0.35 || !!pad.buttons[14]?.pressed,
    right: axisX > 0.35 || !!pad.buttons[15]?.pressed,
    up: axisY < -0.35 || !!pad.buttons[12]?.pressed,
    down: axisY > 0.35 || !!pad.buttons[13]?.pressed,
    jump:
      !!pad.buttons[0]?.pressed ||
      !!pad.buttons[1]?.pressed ||
      !!pad.buttons[2]?.pressed ||
      !!pad.buttons[3]?.pressed,
  };
}

function nearestVine(player) {
  const centerX = player.x + player.width / 2;
  const feetY = player.y + player.height;
  return vines.find((vine) =>
    centerX >= vine.leftX - CLIMB_GRAB_X_PADDING &&
    centerX <= vine.rightX + CLIMB_GRAB_X_PADDING &&
    feetY >= vine.yTop - CLIMB_GRAB_Y_PADDING &&
    feetY <= vine.yBottom + 10
  ) || null;
}

function groundedPlatformIndex(player) {
  const feetY = player.y + player.height;
  for (let index = 0; index < platforms.length; index += 1) {
    const platform = platforms[index];
    if (player.x + player.width < platform.x1 || player.x > platform.x2) {
      continue;
    }
    if (Math.abs(feetY - platform.y) <= 8) {
      return index;
    }
  }
  return null;
}

function platformUnderEntity(entity) {
  const feetY = entity.y + entity.height;
  for (let index = 0; index < platforms.length; index += 1) {
    const platform = platforms[index];
    if (entity.x + entity.width < platform.x1 || entity.x > platform.x2) {
      continue;
    }
    if (Math.abs(feetY - platform.y) <= 18) {
      return index;
    }
  }
  return null;
}

function updatePlayers(dt) {
  for (const player of state.players.values()) {
    if (!player.alive) {
      if (performance.now() >= player.respawnAt && player.lives > 0) {
        player.alive = true;
        player.vx = 0;
        player.vy = 0;
        player.onVine = false;
        player.vineId = null;
        player.x = platforms[0].x1 + 70 + Math.random() * 240;
        player.y = platforms[0].y - player.height;
      }
      continue;
    }

    const input = player.source === "keyboard" ? readKeyboardInput() : readGamepadInput(player.controllerIndex);
    const currentPlatformIndex = groundedPlatformIndex(player);
    if (currentPlatformIndex !== null) {
      player.groundedPlatform = currentPlatformIndex;
    }

    const vine = nearestVine(player);
    const feetY = player.y + player.height;
    const wantsVine = vine && (input.up || input.down);
    const bodyInsideVineSpan = vine
      && player.y >= vine.yTop - player.height - CLIMB_GRAB_Y_PADDING
      && feetY <= vine.yBottom + 8;
    const canGrabVine = wantsVine
      && (
        player.onVine
        || Math.abs(feetY - vine.yBottom) <= CLIMB_GRAB_Y_PADDING
        || Math.abs(feetY - vine.yTop) <= CLIMB_GRAB_Y_PADDING
        || bodyInsideVineSpan
      );

    if (canGrabVine) {
      player.onVine = true;
      player.vineId = vines.indexOf(vine);
      player.vx = 0;
      player.vy = 0;
      player.x = vine.centerX - player.width / 2;
    }

    if (player.onVine) {
      const activeVine = vines[player.vineId] || vine;
      if (!activeVine) {
        player.onVine = false;
      } else {
        player.x = activeVine.centerX - player.width / 2;
        player.vy = 0;
        if (input.up) {
          player.y -= CLIMB_SPEED * dt;
        }
        if (input.down) {
          player.y += CLIMB_SPEED * dt;
        }
        player.y = Math.max(activeVine.yTop - player.height, Math.min(activeVine.yBottom - player.height, player.y));

        const topTouch = Math.abs((player.y + player.height) - activeVine.yTop) <= 8;
        const bottomTouch = Math.abs((player.y + player.height) - activeVine.yBottom) <= 8;
        const atTopExit = player.y <= activeVine.yTop - player.height + CLIMB_EXIT_PADDING;
        const atBottomExit = player.y >= activeVine.yBottom - player.height - CLIMB_EXIT_PADDING;
        if ((topTouch && !input.up) || (atTopExit && input.up)) {
          player.onVine = false;
          player.y = activeVine.yTop - player.height;
          player.groundedPlatform = activeVine.upperPlatformIndex;
        } else if ((bottomTouch && !input.down) || (atBottomExit && input.down)) {
          player.onVine = false;
          player.y = activeVine.yBottom - player.height;
          player.groundedPlatform = activeVine.lowerPlatformIndex;
        }

        if (input.jump && !player.jumpPressedLastFrame) {
          player.onVine = false;
          player.vy = -JUMP_SPEED * 0.8;
          player.vx = input.left ? -MOVE_SPEED * 0.75 : input.right ? MOVE_SPEED * 0.75 : 0;
        }
      }
    } else {
      player.vx = 0;
      if (input.left) {
        player.vx -= MOVE_SPEED;
      }
      if (input.right) {
        player.vx += MOVE_SPEED;
      }
      player.x += player.vx * dt;
      player.vy += GRAVITY * dt;
      if (input.jump && !player.jumpPressedLastFrame && currentPlatformIndex !== null) {
        player.vy = -JUMP_SPEED;
      }
      player.y += player.vy * dt;

      const platformIndex = groundedPlatformIndex(player);
      if (platformIndex !== null && player.vy >= 0) {
        player.y = platforms[platformIndex].y - player.height;
        player.vy = 0;
        player.groundedPlatform = platformIndex;
      }
    }

    player.x = Math.max(90, Math.min(canvas.width - 90 - player.width, player.x));
    if (player.y > canvas.height + 30) {
      loseLife(player, "A climber dropped off the vines.");
      continue;
    }

    player.jumpPressedLastFrame = input.jump;
    updateCarriedKey(player);
    checkKeyPickup(player);
    checkLockDelivery(player);
    checkGoal(player);
  }
}

function updateCarriedKey(player) {
  if (player.carryingKey === null) return;
  const key = state.keys[player.carryingKey];
  if (!key || key.delivered) {
    player.carryingKey = null;
    return;
  }
  key.x = player.x + player.width / 2;
  key.y = player.y - 10;
}

function checkKeyPickup(player) {
  if (player.carryingKey !== null) return;
  for (let index = 0; index < state.keys.length; index += 1) {
    const key = state.keys[index];
    if (key.delivered || key.carriedBy !== null) continue;
    if (rectsIntersect(player, key)) {
      key.carriedBy = player.id;
      player.carryingKey = index;
      state.score += 50;
      setStatus(`${player.label} grabbed a key.`);
      return;
    }
  }
}

function checkLockDelivery(player) {
  if (player.carryingKey === null) return;
  const key = state.keys[player.carryingKey];
  const lock = locks[key.lockIndex];
  if (!lock || lock.unlocked) return;
  const deliveryZone = {
    x: lock.x - 14,
    y: lock.y - 10,
    width: lock.width + 28,
    height: lock.height + 40,
  };
  if (!rectsIntersect(player, deliveryZone)) return;

  lock.unlocked = true;
  key.delivered = true;
  key.carriedBy = null;
  player.carryingKey = null;
  state.locksReleased += 1;
  state.score += 200;
  setStatus(`${player.label} broke chain ${state.locksReleased}.`);
}

function checkGoal(player) {
  if (state.locksReleased < locks.length) return;
  if (!rectsIntersect(player, cageGoal)) return;
  setStatus(`${player.label} reached the cage. Round clear!`);
  resetRound(true);
}

function loseLife(player, reason) {
  player.alive = false;
  player.lives -= 1;
  player.onVine = false;
  player.vineId = null;
  player.respawnAt = performance.now() + RESPAWN_MS;

  if (player.carryingKey !== null) {
    const key = state.keys[player.carryingKey];
    if (key && !key.delivered) {
      key.carriedBy = null;
      key.x = player.x + player.width / 2;
      key.y = Math.max(100, player.y - 8);
    }
    player.carryingKey = null;
  }

  setStatus(reason);
  const survivingPlayers = [...state.players.values()].filter((entry) => entry.lives > 0);
  if (survivingPlayers.length === 0) {
    state.gameOver = true;
    setStatus("All climbers are down. Press R to restart.");
  }
}

function spawnBird() {
  const platformIndex = [1, 2, 3][Math.floor(Math.random() * 3)];
  const platform = platforms[platformIndex];
  const fromLeft = Math.random() > 0.5;
  state.birds.push({
    type: "bird",
    x: fromLeft ? platform.x1 - 30 : platform.x2 + 30,
    y: platform.y - 28,
    width: 28,
    height: 20,
    vx: fromLeft ? 120 + state.round * 6 : -120 - state.round * 6,
    platformIndex,
  });
}

function spawnSpark() {
  const vineIndex = Math.floor(Math.random() * vines.length);
  const vine = vines[vineIndex];
  const startsTop = Math.random() > 0.5;
  state.sparks.push({
    type: "spark",
    x: vine.centerX - 10,
    y: startsTop ? vine.yTop - 20 : vine.yBottom - 20,
    width: 20,
    height: 20,
    vy: startsTop ? 110 : -110,
    vineIndex,
  });
}

function updateHazards(dt) {
  state.birdTimer -= dt;
  if (state.birdTimer <= 0) {
    spawnBird();
    state.birdTimer = Math.max(0.7, 1.8 - state.round * 0.08);
  }

  state.sparkTimer -= dt;
  if (state.sparkTimer <= 0) {
    spawnSpark();
    state.sparkTimer = Math.max(1.2, 2.6 - state.round * 0.06);
  }

  state.birds = state.birds.filter((bird) => {
    bird.x += bird.vx * dt;
    return bird.x > -80 && bird.x < canvas.width + 80;
  });

  state.sparks = state.sparks.filter((spark) => {
    const vine = vines[spark.vineIndex];
    if (!vine) return false;
    spark.y += spark.vy * dt;
    if (spark.y < vine.yTop - 24 || spark.y > vine.yBottom) {
      spark.vy *= -1;
      spark.y = Math.max(vine.yTop - 20, Math.min(vine.yBottom - 20, spark.y));
    }
    spark.x = vine.centerX - spark.width / 2;
    return true;
  });

  for (const player of state.players.values()) {
    if (!player.alive) continue;
    for (const bird of state.birds) {
      if (rectsIntersect(player, bird)) {
        loseLife(player, `${player.label} got clipped by a snapjaw.`);
        break;
      }
    }
    if (!player.alive) continue;
    for (const spark of state.sparks) {
      if (rectsIntersect(player, spark)) {
        loseLife(player, `${player.label} hit an electric vine spark.`);
        break;
      }
    }
  }
}

function rectsIntersect(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function setStatus(text) {
  state.lastStatusText = text;
}

function updateUi() {
  ui.stage.textContent = `Round ${state.round}`;
  ui.players.textContent = String(state.players.size);
  ui.locks.textContent = `${state.locksReleased} / ${locks.length}`;
  ui.status.textContent = state.lastStatusText || "Climb the vines and break the chains.";
  ui.hint.textContent = state.gameOver
    ? "Press R to restart the rescue."
    : "Grab each key and carry it into the matching chain lock.";
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#172613");
  sky.addColorStop(0.45, "#10180f");
  sky.addColorStop(1, "#07110c");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255, 235, 175, 0.06)";
  ctx.beginPath();
  ctx.arc(748, 86, 82, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2d1d18";
  ctx.fillRect(0, canvas.height - 36, canvas.width, 36);
}

function drawPlatforms() {
  for (const platform of platforms) {
    ctx.fillStyle = "#84553a";
    ctx.fillRect(platform.x1, platform.y - 10, platform.x2 - platform.x1, 14);
    ctx.fillStyle = "#3a2318";
    for (let x = platform.x1 + 8; x < platform.x2; x += 36) {
      ctx.fillRect(x, platform.y + 4, 10, 12);
    }
  }
}

function drawVines() {
  for (const vine of vines) {
    ctx.strokeStyle = "#7be691";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(vine.leftX, vine.yBottom);
    ctx.lineTo(vine.leftX, vine.yTop);
    ctx.moveTo(vine.rightX, vine.yBottom);
    ctx.lineTo(vine.rightX, vine.yTop);
    ctx.stroke();

    ctx.strokeStyle = "rgba(205, 255, 217, 0.35)";
    ctx.lineWidth = 2;
    for (let y = vine.yTop + 12; y < vine.yBottom - 8; y += 24) {
      ctx.beginPath();
      ctx.moveTo(vine.leftX, y);
      ctx.lineTo(vine.rightX, y + 8);
      ctx.stroke();
    }
  }
}

function drawTopSet() {
  ctx.fillStyle = "#c8553e";
  ctx.fillRect(dk.x, dk.y, dk.width, dk.height);
  ctx.fillStyle = "#f7d8a3";
  ctx.fillRect(dk.x + 38, dk.y + 24, 26, 20);
  ctx.fillStyle = "#8fc0ff";
  ctx.fillRect(cageGoal.x, cageGoal.y, cageGoal.width, cageGoal.height);
  ctx.strokeStyle = "#d8ecff";
  ctx.lineWidth = 5;
  ctx.strokeRect(cageGoal.x, cageGoal.y, cageGoal.width, cageGoal.height);

  locks.forEach((lock, index) => {
    ctx.strokeStyle = lock.unlocked ? "#b8efd0" : "#dbe7d9";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(lock.x + lock.width / 2, 18);
    ctx.lineTo(lock.x + lock.width / 2, lock.y + lock.height);
    ctx.stroke();
    ctx.fillStyle = lock.unlocked ? "#68d28a" : "#d8e6d4";
    ctx.fillRect(lock.x, lock.y, lock.width, lock.height);
    ctx.fillStyle = "#0d1710";
    ctx.fillRect(lock.x + 8, lock.y + 12, 8, 12);
    if (!lock.unlocked) {
      ctx.fillStyle = "#ffd978";
      ctx.fillText(String(index + 1), lock.x + 7, lock.y - 8);
    }
  });
}

function drawKeys() {
  for (const key of state.keys) {
    if (key.delivered) continue;
    ctx.fillStyle = "#ffd978";
    ctx.fillRect(key.x - 7, key.y - 4, 16, 10);
    ctx.beginPath();
    ctx.arc(key.x + 9, key.y + 1, 7, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHazards() {
  for (const bird of state.birds) {
    ctx.fillStyle = "#d26e58";
    ctx.beginPath();
    ctx.ellipse(bird.x + 14, bird.y + 10, 14, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffe4bf";
    ctx.fillRect(bird.x + (bird.vx > 0 ? 18 : 4), bird.y + 8, 8, 4);
  }

  for (const spark of state.sparks) {
    ctx.fillStyle = "#8fd6ff";
    ctx.beginPath();
    ctx.arc(spark.x + 10, spark.y + 10, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#dff6ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(spark.x + 3, spark.y + 10);
    ctx.lineTo(spark.x + 17, spark.y + 10);
    ctx.moveTo(spark.x + 10, spark.y + 3);
    ctx.lineTo(spark.x + 10, spark.y + 17);
    ctx.stroke();
  }
}

function drawPlayers() {
  for (const player of state.players.values()) {
    if (!player.alive) continue;
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = "#101511";
    ctx.fillRect(player.x + 6, player.y + 6, 4, 4);
    ctx.fillRect(player.x + 14, player.y + 6, 4, 4);
    ctx.fillStyle = "#f5fff7";
    ctx.font = '12px "Avenir Next", "Segoe UI", sans-serif';
    ctx.fillText(`${player.label} ${Math.max(player.lives, 0)}`, player.x - 4, player.y - 10);
  }
}

function drawOverlay() {
  if (!state.gameOver && !state.paused) return;
  ctx.fillStyle = "rgba(4, 7, 8, 0.58)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f4fff7";
  ctx.textAlign = "center";
  ctx.font = '700 40px "Avenir Next", "Segoe UI", sans-serif';
  ctx.fillText(state.gameOver ? "Rescue Lost" : "Paused", canvas.width / 2, canvas.height / 2 - 12);
  ctx.font = '500 20px "Avenir Next", "Segoe UI", sans-serif';
  ctx.fillText(state.gameOver ? "Press R to restart." : "Press P or Start to resume.", canvas.width / 2, canvas.height / 2 + 24);
  ctx.textAlign = "left";
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawPlatforms();
  drawVines();
  drawTopSet();
  drawKeys();
  drawHazards();
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
    updateHazards(dt);
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
  if (event.key === "ArrowUp") state.keyboard.up = true;
  if (event.key === "ArrowDown") state.keyboard.down = true;
  if (event.key === " " || event.key === "Spacebar") state.keyboard.jump = true;
  if (event.key.toLowerCase() === "p") {
    state.paused = !state.paused;
    setStatus(state.paused ? "Paused." : "Back on the vines.");
  }
  if (event.key.toLowerCase() === "r") {
    resetRound(false);
    setStatus("Rescue reset.");
  }
});

window.addEventListener("keyup", (event) => {
  if (GAMEPLAY_KEYS.has(event.key)) {
    event.preventDefault();
  }
  if (event.key === "ArrowLeft") state.keyboard.left = false;
  if (event.key === "ArrowRight") state.keyboard.right = false;
  if (event.key === "ArrowUp") state.keyboard.up = false;
  if (event.key === "ArrowDown") state.keyboard.down = false;
  if (event.key === " " || event.key === "Spacebar") state.keyboard.jump = false;
});

window.__arcadeCabinetHooks = {
  onPauseOpen() {
    state.paused = true;
    setStatus("Paused. Use the cabinet menu to resume, restart, or head back.");
  },
  onPauseClose() {
    if (!state.gameOver) {
      state.paused = false;
      setStatus("Back on the vines.");
    }
  },
  getPauseActions() {
    return [
      {
        id: "restart",
        label: state.gameOver ? "Play Again" : "Restart Run",
        run() {
          resetRound(false);
          setStatus("Rescue reset.");
        },
      },
    ];
  },
};

spawnPlayer("keyboard", null, "Keyboard");
resetRound(false);
setStatus("Climb the vines and break the chains.");
updateUi();
window.__donkeyKong2Debug = { state, platforms, vines, locks, keySpawns };
requestAnimationFrame(update);
