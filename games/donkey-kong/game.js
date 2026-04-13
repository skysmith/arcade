const BUILD_NUMBER = "2026.04.13.2";
const MAX_PLAYERS = 4;
const KEYBOARD_PLAYER_ID = "keyboard-1";
const GRAVITY = 900;
const MOVE_SPEED = 170;
const CLIMB_SPEED = 130;
const JUMP_SPEED = 365;
const RESPAWN_MS = 1300;
const CLIMB_GRAB_X_PADDING = 12;
const CLIMB_GRAB_Y_PADDING = 12;
const CLIMB_EXIT_PADDING = 4;
const PLAYER_COLORS = ["#7cff8b", "#6fbdff", "#ffd36f", "#ff8fab"];
const PLAYER_LABELS = ["P1", "P2", "P3", "P4"];

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const arcadeCabinet = window.ArcadeCabinet || null;

const ui = {
  stage: document.getElementById("stage-value"),
  players: document.getElementById("players-value"),
  score: document.getElementById("score-value"),
  status: document.getElementById("status-value"),
  hint: document.getElementById("hint-value"),
};

document.title = `donkey-kong build ${BUILD_NUMBER}`;

const platforms = [
  { x1: 108, x2: 870, yLeft: 144, yRight: 178 },
  { x1: 90, x2: 888, yLeft: 288, yRight: 250 },
  { x1: 108, x2: 870, yLeft: 382, yRight: 420 },
  { x1: 90, x2: 888, yLeft: 532, yRight: 492 },
  { x1: 108, x2: 870, yLeft: 628, yRight: 666 },
];

const ladders = [
  createLadder(220, 4, 3),
  createLadder(718, 4, 3),
  createLadder(310, 3, 2),
  createLadder(760, 3, 2),
  createLadder(212, 2, 1),
  createLadder(650, 2, 1),
  createLadder(762, 1, 0),
  createLadder(348, 1, 0),
];

const goal = { x: 254, y: 108, width: 96, height: 68 };
const kong = { x: 148, y: 112, width: 96, height: 86 };

const state = {
  players: new Map(),
  controllerAssignments: new Map(),
  joinButtonSnapshot: {},
  pauseButtonSnapshot: {},
  lastTime: 0,
  paused: false,
  round: 1,
  score: 0,
  rescues: 0,
  barrels: [],
  barrelTimer: 0.7,
  gameOver: false,
  stageClear: false,
  stageClearTimer: 0,
  keyboard: {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
  },
  lastStatusText: "",
};
let gameOverMenuShown = false;

function createLadder(x, lowerIndex, upperIndex) {
  const lowerY = platformYAt(platforms[lowerIndex], x);
  const upperY = platformYAt(platforms[upperIndex], x);
  return {
    x,
    lowerIndex,
    upperIndex,
    yTop: upperY - 6,
    yBottom: lowerY + 6,
    width: 20,
  };
}

function platformYAt(platform, x) {
  const t = (x - platform.x1) / (platform.x2 - platform.x1);
  return platform.yLeft + (platform.yRight - platform.yLeft) * t;
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
    width: 24,
    height: 30,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    lives: 3,
    alive: true,
    onLadder: false,
    respawnAt: 0,
    score: 0,
    groundedPlatform: 4,
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
  const bottom = platforms[4];
  const laneWidth = (bottom.x2 - bottom.x1) / Math.max(1, activePlayers.length + 1);
  activePlayers.forEach((player, index) => {
    player.label = PLAYER_LABELS[index] || `P${index + 1}`;
    player.color = PLAYER_COLORS[index % PLAYER_COLORS.length];
    const x = bottom.x1 + laneWidth * (index + 1);
    player.x = x;
    player.y = platformYAt(bottom, x) - player.height;
    player.vx = 0;
    player.vy = 0;
    player.onLadder = false;
    player.groundedPlatform = 4;
  });
}

function removePlayer(playerId) {
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
  if (!navigator.getGamepads) {
    return [];
  }
  return Array.from(navigator.getGamepads()).filter((pad) => Boolean(pad));
}

function trimControllerName(name) {
  return name.replace(/\(STANDARD GAMEPAD Vendor:.*$/i, "").trim() || "Controller";
}

function getNearestLadder(player) {
  const centerX = player.x + player.width / 2;
  const feetY = player.y + player.height;
  return ladders.find((ladder) =>
    Math.abs(centerX - ladder.x) <= CLIMB_GRAB_X_PADDING &&
    feetY >= ladder.yTop - CLIMB_GRAB_Y_PADDING &&
    feetY <= ladder.yBottom + 10
  ) || null;
}

function readKeyboardInput() {
  return {
    left: state.keyboard.left,
    right: state.keyboard.right,
    up: state.keyboard.up,
    down: state.keyboard.down,
    jump: state.keyboard.jump,
    pause: false,
  };
}

function readGamepadInput(controllerIndex) {
  if (controllerIndex === null || !navigator.getGamepads) {
    return { left: false, right: false, up: false, down: false, jump: false, pause: false };
  }

  const pad = navigator.getGamepads()[controllerIndex];
  if (!pad) {
    return { left: false, right: false, up: false, down: false, jump: false, pause: false };
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
      !!pad.buttons[3]?.pressed ||
      !!pad.buttons[5]?.pressed,
    pause: !!pad.buttons[9]?.pressed,
  };
}

function resetRound(fullReset = false) {
  gameOverMenuShown = false;
  arcadeCabinet?.closeResults?.();
  if (fullReset) {
    state.round = 1;
    state.score = 0;
    state.rescues = 0;
  }

  state.barrels = [];
  state.barrelTimer = Math.max(0.45, 0.82 - state.round * 0.04);
  state.gameOver = false;
  state.stageClear = false;
  state.stageClearTimer = 0;

  for (const player of state.players.values()) {
    if (fullReset) {
      player.lives = 3;
      player.score = 0;
    }
    player.alive = true;
    player.respawnAt = 0;
    player.vx = 0;
    player.vy = 0;
    player.onLadder = false;
  }
  relayoutPlayers();
}

function showGameOverMenu() {
  if (gameOverMenuShown || !state.gameOver) {
    return;
  }
  gameOverMenuShown = true;
  arcadeCabinet?.reportGameOver?.({
    gameId: "donkey-kong",
    title: "Donkey Kong",
    score: state.score,
    onRestart: () => resetRound(true),
  });
}

function spawnBarrel() {
  const startX = 230;
  const startPlatform = 0;
  state.barrels.push({
    x: startX,
    y: platformYAt(platforms[startPlatform], startX) - 16,
    radius: 12,
    platformIndex: startPlatform,
    direction: 1,
    speed: 96 + state.round * 8,
    dropSpeed: 170,
    dropping: false,
    targetPlatform: startPlatform + 1,
  });
}

function updateBarrels(delta) {
  if (state.stageClear) {
    return;
  }
  const dt = delta / 1000;
  state.barrelTimer -= dt;
  if (state.barrelTimer <= 0) {
    spawnBarrel();
    state.barrelTimer = Math.max(0.48, 1.28 - state.round * 0.05);
  }

  for (const barrel of state.barrels) {
    if (barrel.dropping) {
      barrel.y += barrel.dropSpeed * dt;
      const targetPlatform = platforms[barrel.targetPlatform];
      const targetY = platformYAt(targetPlatform, barrel.x) - barrel.radius;
      if (barrel.y >= targetY) {
        barrel.y = targetY;
        barrel.platformIndex = barrel.targetPlatform;
        barrel.dropping = false;
        barrel.direction = barrel.platformIndex % 2 === 0 ? 1 : -1;
      }
      continue;
    }

    barrel.x += barrel.direction * barrel.speed * dt;
    const platform = platforms[barrel.platformIndex];
    barrel.y = platformYAt(platform, barrel.x) - barrel.radius;

    const atRightEdge = barrel.x >= platform.x2 - 12;
    const atLeftEdge = barrel.x <= platform.x1 + 12;
    if (barrel.platformIndex < platforms.length - 1 && ((barrel.direction > 0 && atRightEdge) || (barrel.direction < 0 && atLeftEdge))) {
      barrel.dropping = true;
      barrel.targetPlatform = barrel.platformIndex + 1;
      barrel.x = Math.max(platform.x1 + 12, Math.min(platform.x2 - 12, barrel.x));
    }
  }

  state.barrels = state.barrels.filter((barrel) => barrel.y < canvas.height + 30 && barrel.platformIndex < platforms.length);
}

function handlePause(input, player) {
  if (player.source !== "gamepad" || player.controllerIndex === null) {
    return;
  }
  const previous = state.pauseButtonSnapshot[player.controllerIndex] || false;
  state.pauseButtonSnapshot[player.controllerIndex] = input.pause;
  if (input.pause && !previous) {
    state.paused = !state.paused;
  }
}

function updatePlayers(delta) {
  const dt = delta / 1000;

  if (state.stageClear) {
    return;
  }

  for (const player of state.players.values()) {
    if (!player.alive) {
      if (player.lives > 0 && player.respawnAt > 0 && performance.now() >= player.respawnAt) {
        player.alive = true;
        player.respawnAt = 0;
        player.vx = 0;
        player.vy = 0;
        player.onLadder = false;
        const lane = platforms[4];
        const x = lane.x1 + ((player.label === "P1" ? 1 : player.label === "P2" ? 2 : player.label === "P3" ? 3 : 4) * ((lane.x2 - lane.x1) / 5));
        player.x = x;
        player.y = platformYAt(lane, x) - player.height;
      }
      continue;
    }

    const input = player.source === "keyboard" ? readKeyboardInput() : readGamepadInput(player.controllerIndex);
    handlePause(input, player);

    const ladder = getNearestLadder(player);
    const wantsLadder = ladder && (input.up || input.down);
    const feetY = player.y + player.height;
    const nearLadderTop = ladder && Math.abs(feetY - ladder.yTop) <= CLIMB_GRAB_Y_PADDING;
    const nearLadderBottom = ladder && Math.abs(feetY - ladder.yBottom) <= CLIMB_GRAB_Y_PADDING;
    const bodyInsideLadder = ladder
      && player.y >= ladder.yTop - player.height - CLIMB_GRAB_Y_PADDING
      && feetY <= ladder.yBottom + CLIMB_GRAB_Y_PADDING;
    const canGrabLadder = wantsLadder && (player.onLadder || nearLadderTop || nearLadderBottom || bodyInsideLadder);

    if (canGrabLadder) {
      player.onLadder = true;
      player.vx = 0;
      player.vy = 0;
      player.x = ladder.x - player.width / 2;
      if (input.up) {
        player.y -= CLIMB_SPEED * dt;
      } else if (input.down) {
        player.y += CLIMB_SPEED * dt;
      }
      const minY = ladder.yTop - player.height + 8;
      const maxY = ladder.yBottom - player.height + 8;
      player.y = Math.max(minY, Math.min(maxY, player.y));

      const atTopExit = player.y <= minY + CLIMB_EXIT_PADDING;
      const atBottomExit = player.y >= maxY - CLIMB_EXIT_PADDING;
      if (atTopExit && input.up) {
        const surface = platformYAt(platforms[ladder.upperIndex], ladder.x);
        player.onLadder = false;
        player.y = surface - player.height;
        player.groundedPlatform = ladder.upperIndex;
      } else if (atBottomExit && input.down) {
        const surface = platformYAt(platforms[ladder.lowerIndex], ladder.x);
        player.onLadder = false;
        player.y = surface - player.height;
        player.groundedPlatform = ladder.lowerIndex;
      }
    } else {
      if (player.onLadder) {
        player.onLadder = false;
      }

      let move = 0;
      if (input.left) move -= 1;
      if (input.right) move += 1;
      player.vx = move * MOVE_SPEED;

      const currentPlatform = findSupportingPlatform(player);
      const onGround = currentPlatform !== null;
      if (input.jump && !player.jumpPressedLastFrame && onGround) {
        player.vy = -JUMP_SPEED;
      }
      player.jumpPressedLastFrame = input.jump;

      player.vy += GRAVITY * dt;
      player.x += player.vx * dt;
      player.y += player.vy * dt;

      player.x = Math.max(28, Math.min(canvas.width - 28, player.x));

      const landedPlatform = findSupportingPlatform(player);
      if (landedPlatform !== null && player.vy >= 0) {
        player.groundedPlatform = landedPlatform;
        const surface = platformYAt(platforms[landedPlatform], player.x + player.width / 2);
        player.y = surface - player.height;
        player.vy = 0;
      }
    }

    if (player.y > canvas.height + 40) {
      loseLife(player);
    }

    if (player.alive && reachedGoal(player)) {
      player.score += 500;
      state.score += 500;
      state.rescues += 1;
      state.stageClear = true;
      state.stageClearTimer = 2.35;
      player.vx = 0;
      player.vy = 0;
      setStatus(`${player.label} reached Pauline. Stage clear!`);
      break;
    }
  }
}

function reachedGoal(player) {
  return (
    player.x + player.width > goal.x &&
    player.x < goal.x + goal.width &&
    player.y + player.height > goal.y &&
    player.y < goal.y + goal.height
  );
}

function findSupportingPlatform(player) {
  const feetY = player.y + player.height;
  const centerX = player.x + player.width / 2;
  for (let index = platforms.length - 1; index >= 0; index -= 1) {
    const platform = platforms[index];
    if (centerX < platform.x1 || centerX > platform.x2) {
      continue;
    }
    const surface = platformYAt(platform, centerX);
    if (Math.abs(feetY - surface) <= 12 && player.vy >= -20) {
      return index;
    }
  }
  return null;
}

function loseLife(player) {
  player.lives -= 1;
  player.alive = false;
  player.respawnAt = player.lives > 0 ? performance.now() + RESPAWN_MS : 0;
  player.vx = 0;
  player.vy = 0;
  player.onLadder = false;

  if ([...state.players.values()].every((entry) => !entry.alive && entry.lives <= 0)) {
    state.gameOver = true;
  }
}

function updateCollisions() {
  for (const barrel of state.barrels) {
    for (const player of state.players.values()) {
      if (!player.alive) {
        continue;
      }
      const px = player.x + player.width / 2;
      const py = player.y + player.height / 2;
      const dx = barrel.x - px;
      const dy = barrel.y - py;
      const distance = Math.hypot(dx, dy);
      if (distance <= barrel.radius + 12) {
        loseLife(player);
      }
    }
  }
}

function drawBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#060712";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.3)";
  for (let i = 0; i < 50; i += 1) {
    const x = (i * 89) % canvas.width;
    const y = (i * 67) % canvas.height;
    ctx.fillRect(x, y, 2, 2);
  }
}

function drawStage() {
  platforms.forEach((platform, index) => {
    ctx.strokeStyle = index % 2 === 0 ? "#ff6e67" : "#ff8f76";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(platform.x1, platform.yLeft);
    ctx.lineTo(platform.x2, platform.yRight);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 213, 172, 0.35)";
    ctx.lineWidth = 2;
    for (let x = platform.x1; x <= platform.x2; x += 36) {
      const y = platformYAt(platform, x);
      ctx.beginPath();
      ctx.moveTo(x - 10, y - 7);
      ctx.lineTo(x + 10, y + 7);
      ctx.stroke();
    }
  });

  ladders.forEach((ladder) => {
    ctx.strokeStyle = "#74b6ff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(ladder.x - 8, ladder.yTop);
    ctx.lineTo(ladder.x - 8, ladder.yBottom);
    ctx.moveTo(ladder.x + 8, ladder.yTop);
    ctx.lineTo(ladder.x + 8, ladder.yBottom);
    ctx.stroke();

    for (let y = ladder.yTop + 6; y < ladder.yBottom; y += 16) {
      ctx.beginPath();
      ctx.moveTo(ladder.x - 8, y);
      ctx.lineTo(ladder.x + 8, y);
      ctx.stroke();
    }
  });
}

function drawKongAndGoal() {
  ctx.fillStyle = "#8f4a2d";
  ctx.fillRect(kong.x, kong.y, kong.width, kong.height);
  ctx.fillStyle = "#efc39a";
  ctx.fillRect(kong.x + 18, kong.y + 18, 60, 24);
  ctx.fillRect(kong.x + 28, kong.y + 50, 16, 16);
  ctx.fillRect(kong.x + 56, kong.y + 50, 16, 16);

  ctx.fillStyle = "#ff7aa3";
  ctx.fillRect(goal.x + 30, goal.y + 18, 16, 36);
  ctx.fillRect(goal.x + 50, goal.y + 18, 16, 36);
  ctx.fillStyle = "#ffe2a8";
  ctx.fillRect(goal.x + 34, goal.y + 4, 28, 16);

  ctx.strokeStyle = "rgba(255, 214, 232, 0.55)";
  ctx.lineWidth = 3;
  ctx.strokeRect(goal.x + 18, goal.y + 10, 48, 50);

  ctx.fillStyle = "#f3d270";
  ctx.font = "600 14px Avenir Next";
  ctx.fillText("PAULINE", goal.x - 2, goal.y - 6);
}

function drawBarrels() {
  state.barrels.forEach((barrel) => {
    ctx.fillStyle = "#c17739";
    ctx.beginPath();
    ctx.arc(barrel.x, barrel.y, barrel.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#6f3b15";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(barrel.x, barrel.y, barrel.radius - 4, 0.4, Math.PI + 0.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(barrel.x, barrel.y, barrel.radius - 4, Math.PI + 0.9, Math.PI * 2 + 0.1);
    ctx.stroke();
  });
}

function drawPlayers() {
  for (const player of state.players.values()) {
    if (!player.alive) {
      continue;
    }

    ctx.fillStyle = player.color;
    ctx.fillRect(player.x + 5, player.y, 14, 12);
    ctx.fillRect(player.x + 3, player.y + 12, 18, 10);
    ctx.fillStyle = "#3f69ff";
    ctx.fillRect(player.x + 1, player.y + 22, 8, 8);
    ctx.fillRect(player.x + 15, player.y + 22, 8, 8);
  }
}

function drawPlayerPanel() {
  const players = [...state.players.values()];
  ctx.font = "600 12px Avenir Next";
  ctx.textAlign = "center";
  players.forEach((player, index) => {
    const x = 76 + index * 152;
    ctx.fillStyle = "rgba(7, 10, 18, 0.72)";
    ctx.fillRect(x - 40, 18, 126, 34);
    ctx.fillStyle = player.color;
    ctx.fillText(`${player.label} ${player.score} pts • ${Math.max(0, player.lives)}x`, x + 24, 40);
  });
}

function drawOverlay() {
  if (!state.paused && !state.gameOver && !state.stageClear) {
    return;
  }
  ctx.fillStyle = "rgba(2, 5, 12, 0.72)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f7f7ff";
  ctx.textAlign = "center";
  ctx.font = "700 42px Avenir Next";
  const title = state.stageClear ? "Stage Clear" : (state.gameOver ? "Stage Down" : "Paused");
  ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 10);
  ctx.font = "500 18px Avenir Next";
  ctx.fillStyle = "rgba(247,247,255,0.78)";
  const subtitle = state.stageClear
    ? "Pauline is safe. Resetting the stage..."
    : "Press R to restart. Extra players can still join with Start.";
  ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 26);

  if (state.stageClear) {
    ctx.font = "600 16px Avenir Next";
    ctx.fillStyle = "#ffd36f";
    ctx.fillText(`Bonus rescue: ${state.score} pts`, canvas.width / 2, canvas.height / 2 + 58);
  }
}

function syncUi() {
  ui.stage.textContent = `Round ${state.round}`;
  ui.players.textContent = String(state.players.size);
  ui.score.textContent = String(state.score);

  const controllerPlayers = [...state.players.values()].filter((player) => player.source === "gamepad");
  const waitingPads = Math.max(0, getGamepads().length - controllerPlayers.length);
  const statusText = state.stageClear
    ? "Pauline rescued. Catch your breath before the next barrel rush."
    : controllerPlayers.length > 0
    ? controllerPlayers.map((player) => `${player.label} on ${player.controllerName}`).join(" • ")
    : "Keyboard fallback ready.";

  if (statusText !== state.lastStatusText) {
    ui.status.textContent = statusText;
    state.lastStatusText = statusText;
  }

  ui.hint.textContent = state.stageClear
    ? "Next round is about to begin."
    : waitingPads > 0
    ? `${waitingPads} extra pad${waitingPads === 1 ? "" : "s"} waiting. Press Start to join live.`
    : "First pad becomes P1. Extra pads join live with Start.";
}

function render() {
  drawBackground();
  drawStage();
  drawKongAndGoal();
  drawBarrels();
  drawPlayers();
  drawPlayerPanel();
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

  if (state.stageClear) {
    state.stageClearTimer = Math.max(0, state.stageClearTimer - delta / 1000);
    if (state.stageClearTimer === 0) {
      state.round += 1;
      resetRound(false);
      setStatus(`Round ${state.round}. Kong kicked the barrels loose again.`);
    }
  }

  if (!state.paused && !state.gameOver && !state.stageClear) {
    updateBarrels(delta);
    updatePlayers(delta);
    updateCollisions();
  }

  if (state.gameOver) {
    showGameOverMenu();
  }

  render();
  requestAnimationFrame(update);
}

function setKeyboardKey(code, isDown) {
  if (code === "ArrowLeft") {
    state.keyboard.left = isDown;
  } else if (code === "ArrowRight") {
    state.keyboard.right = isDown;
  } else if (code === "ArrowUp") {
    state.keyboard.up = isDown;
  } else if (code === "ArrowDown") {
    state.keyboard.down = isDown;
  } else if (code === "Space") {
    state.keyboard.jump = isDown;
  }
}

window.addEventListener("keydown", (event) => {
  if (event.code === "KeyP" && !event.repeat) {
    state.paused = !state.paused;
    return;
  }
  if (event.code === "KeyR" && !event.repeat) {
    resetRound(true);
    return;
  }
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].includes(event.code)) {
    event.preventDefault();
    setKeyboardKey(event.code, true);
  }
});

window.addEventListener("keyup", (event) => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].includes(event.code)) {
    event.preventDefault();
    setKeyboardKey(event.code, false);
  }
});

window.addEventListener("gamepadconnected", ensureInputRoster);
window.addEventListener("gamepaddisconnected", ensureInputRoster);

ensureInputRoster();
resetRound(true);
render();
requestAnimationFrame(update);
