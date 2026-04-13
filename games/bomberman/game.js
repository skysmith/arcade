const BUILD_NUMBER = "2026.04.13.1";
const MAX_PLAYERS = 4;
const COLS = 15;
const ROWS = 11;
const TILE_SIZE = 56;
const BOARD_OFFSET_X = 60;
const BOARD_OFFSET_Y = 44;
const KEYBOARD_PLAYER_ID = "keyboard-1";
const PLAYER_LABELS = ["P1", "P2", "P3", "P4"];
const PLAYER_COLORS = ["#ffdf72", "#7fd7ff", "#ff8aa6", "#9bf593"];
const ENEMY_COLORS = ["#ff9b57", "#ff6a88", "#73d9c8", "#ffd46f"];
const BOMB_FUSE = 2.15;
const FLAME_DURATION = 0.58;
const RESPAWN_DELAY = 1.25;
const RESPAWN_SHIELD = 1.65;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const arcadeCabinet = window.ArcadeCabinet || null;

const ui = {
  round: document.getElementById("round-value"),
  players: document.getElementById("players-value"),
  enemies: document.getElementById("enemies-value"),
  status: document.getElementById("status-value"),
  hint: document.getElementById("hint-value"),
};

document.title = `bomberman build ${BUILD_NUMBER}`;

const spawnTiles = [
  { x: 1, y: 1 },
  { x: COLS - 2, y: ROWS - 2 },
  { x: COLS - 2, y: 1 },
  { x: 1, y: ROWS - 2 },
];

const directionOrder = [
  { dx: 0, dy: -1 },
  { dx: 1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
];

const state = {
  round: 1,
  score: 0,
  board: [],
  bombs: [],
  flames: [],
  enemies: [],
  players: new Map(),
  controllerAssignments: new Map(),
  joinButtonSnapshot: {},
  inputSnapshot: {},
  keyboard: {
    left: false,
    right: false,
    up: false,
    down: false,
    bombHeld: false,
  },
  paused: false,
  gameOver: false,
  roundClear: false,
  roundAdvanceTimer: 0,
  lastTime: 0,
  lastStatusText: "",
};
let gameOverMenuShown = false;

function createCell(kind = "empty") {
  return { kind, pickup: null, exitState: null };
}

function tileCenterX(x) {
  return BOARD_OFFSET_X + x * TILE_SIZE + TILE_SIZE / 2;
}

function tileCenterY(y) {
  return BOARD_OFFSET_Y + y * TILE_SIZE + TILE_SIZE / 2;
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function shuffle(list) {
  for (let index = list.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [list[index], list[swapIndex]] = [list[swapIndex], list[index]];
  }
  return list;
}

function forEachBoard(board, fn) {
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      fn(board[y][x], x, y);
    }
  }
}

function forEachCell(fn) {
  forEachBoard(state.board, fn);
}

function cellAt(x, y) {
  return state.board[y]?.[x] || null;
}

function bombAt(x, y) {
  return state.bombs.find((bomb) => bomb.tileX === x && bomb.tileY === y);
}

function flameAt(x, y) {
  return state.flames.find((flame) => flame.tileX === x && flame.tileY === y);
}

function createBoard(round) {
  const board = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => createCell("empty")));
  const safeTiles = new Set();

  spawnTiles.forEach(({ x, y }) => {
    safeTiles.add(`${x},${y}`);
    safeTiles.add(`${x + 1},${y}`);
    safeTiles.add(`${x - 1},${y}`);
    safeTiles.add(`${x},${y + 1}`);
    safeTiles.add(`${x},${y - 1}`);
  });

  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const edge = x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1;
      const pillar = x % 2 === 0 && y % 2 === 0;
      if (edge || pillar) {
        board[y][x] = createCell("wall");
        continue;
      }
      if (safeTiles.has(`${x},${y}`)) {
        continue;
      }
      const density = Math.min(0.52 + round * 0.03, 0.68);
      if (Math.random() < density) {
        board[y][x] = createCell("soft");
      }
    }
  }

  const softTiles = [];
  forEachBoard(board, (cell, x, y) => {
    if (cell.kind === "soft") {
      softTiles.push({ cell, x, y });
    }
  });

  if (softTiles.length === 0) {
    return createBoard(round);
  }

  const exitTile = randomFrom(softTiles);
  exitTile.cell.exitState = "hidden";

  const pickupPool = [];
  const pickupCount = Math.min(8, 3 + round);
  for (let index = 0; index < pickupCount; index += 1) {
    pickupPool.push(index % 3 === 0 ? "bomb" : index % 3 === 1 ? "flame" : "skate");
  }

  const pickupTiles = shuffle(softTiles.slice());
  pickupPool.forEach((pickup, index) => {
    const tile = pickupTiles[index];
    if (!tile || tile.cell.exitState) {
      return;
    }
    tile.cell.pickup = pickup;
  });

  return board;
}

function collectOpenTiles() {
  const tiles = [];
  forEachCell((cell, x, y) => {
    if (cell.kind === "empty" || cell.kind === "exit") {
      tiles.push({ x, y });
    }
  });
  return shuffle(tiles);
}

function createPlayer(source, controllerIndex, controllerName) {
  const slot = state.players.size;
  const spawn = spawnTiles[slot % spawnTiles.length];
  return {
    id: source === "keyboard" ? KEYBOARD_PLAYER_ID : `gamepad-${controllerIndex}`,
    source,
    controllerIndex,
    controllerName,
    slot,
    label: PLAYER_LABELS[slot] || `P${slot + 1}`,
    color: PLAYER_COLORS[slot % PLAYER_COLORS.length],
    tileX: spawn.x,
    tileY: spawn.y,
    x: tileCenterX(spawn.x),
    y: tileCenterY(spawn.y),
    targetX: spawn.x,
    targetY: spawn.y,
    moving: false,
    direction: null,
    speed: 4.1,
    bombPower: 2,
    maxBombs: 1,
    activeBombs: 0,
    lives: 3,
    alive: true,
    respawnAt: 0,
    shieldUntil: 0,
  };
}

function isTileWalkable(x, y, moverId = null, ignoreBombs = false) {
  const cell = cellAt(x, y);
  if (!cell) return false;
  if (cell.kind === "wall" || cell.kind === "soft") {
    return false;
  }
  if (ignoreBombs) {
    return true;
  }
  const bomb = bombAt(x, y);
  if (!bomb) {
    return true;
  }
  return bomb.ownerId === moverId && bomb.ghostOwner;
}

function settleSpawn(player) {
  const preferred = spawnTiles[player.slot % spawnTiles.length];
  const candidates = [preferred, ...spawnTiles, ...collectOpenTiles()];
  const seen = new Set();

  for (const tile of candidates) {
    const key = `${tile.x},${tile.y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (!isTileWalkable(tile.x, tile.y, player.id, true)) {
      continue;
    }
    const enemyTooClose = state.enemies.some((enemy) => Math.abs(enemy.tileX - tile.x) + Math.abs(enemy.tileY - tile.y) < 2);
    if (enemyTooClose) {
      continue;
    }
    player.tileX = tile.x;
    player.tileY = tile.y;
    player.targetX = tile.x;
    player.targetY = tile.y;
    player.x = tileCenterX(tile.x);
    player.y = tileCenterY(tile.y);
    player.moving = false;
    player.direction = null;
    return;
  }
}

function spawnPlayer(source, controllerIndex, controllerName) {
  if (state.players.size >= MAX_PLAYERS) {
    return;
  }
  const player = createPlayer(source, controllerIndex, controllerName);
  settleSpawn(player);
  player.shieldUntil = performance.now() / 1000 + RESPAWN_SHIELD;
  state.players.set(player.id, player);
  if (controllerIndex !== null) {
    state.controllerAssignments.set(controllerIndex, player.id);
  }
}

function removePlayer(playerId) {
  state.players.delete(playerId);
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

function readKeyboardInput() {
  return {
    axisX: (state.keyboard.right ? 1 : 0) - (state.keyboard.left ? 1 : 0),
    axisY: (state.keyboard.down ? 1 : 0) - (state.keyboard.up ? 1 : 0),
    bomb: state.keyboard.bombHeld,
    pause: false,
  };
}

function readGamepadInput(controllerIndex) {
  if (controllerIndex === null || !navigator.getGamepads) {
    return { axisX: 0, axisY: 0, bomb: false, pause: false };
  }

  const pad = navigator.getGamepads()[controllerIndex];
  if (!pad) {
    return { axisX: 0, axisY: 0, bomb: false, pause: false };
  }

  const axisX = Math.abs(pad.axes[0] ?? 0) > 0.25 ? pad.axes[0] : 0;
  const axisY = Math.abs(pad.axes[1] ?? 0) > 0.25 ? pad.axes[1] : 0;
  const dpadX = (pad.buttons[15]?.pressed ? 1 : 0) - (pad.buttons[14]?.pressed ? 1 : 0);
  const dpadY = (pad.buttons[13]?.pressed ? 1 : 0) - (pad.buttons[12]?.pressed ? 1 : 0);

  return {
    axisX: dpadX || axisX,
    axisY: dpadY || axisY,
    bomb: !!pad.buttons[0]?.pressed || !!pad.buttons[1]?.pressed || !!pad.buttons[5]?.pressed,
    pause: !!pad.buttons[9]?.pressed || !!pad.buttons[8]?.pressed,
  };
}

function edgeTrigger(id, action, pressed) {
  const key = `${id}:${action}`;
  const previous = state.inputSnapshot[key] || false;
  state.inputSnapshot[key] = pressed;
  return pressed && !previous;
}

function chooseDirection(axisX, axisY) {
  const absX = Math.abs(axisX);
  const absY = Math.abs(axisY);
  if (absX < 0.2 && absY < 0.2) {
    return null;
  }
  if (absX >= absY) {
    return axisX >= 0 ? { dx: 1, dy: 0 } : { dx: -1, dy: 0 };
  }
  return axisY >= 0 ? { dx: 0, dy: 1 } : { dx: 0, dy: -1 };
}

function attemptMove(entity, direction, moverId = null) {
  if (!direction) return false;
  const nextX = entity.tileX + direction.dx;
  const nextY = entity.tileY + direction.dy;
  if (!isTileWalkable(nextX, nextY, moverId)) {
    return false;
  }
  entity.targetX = nextX;
  entity.targetY = nextY;
  entity.direction = direction;
  entity.moving = true;
  return true;
}

function advanceEntity(entity, dt) {
  if (!entity.moving) {
    return;
  }
  const targetPixelX = tileCenterX(entity.targetX);
  const targetPixelY = tileCenterY(entity.targetY);
  const deltaX = targetPixelX - entity.x;
  const deltaY = targetPixelY - entity.y;
  const distance = Math.hypot(deltaX, deltaY);
  const speed = entity.speed * TILE_SIZE * dt;

  if (distance <= speed || distance < 0.001) {
    entity.x = targetPixelX;
    entity.y = targetPixelY;
    entity.tileX = entity.targetX;
    entity.tileY = entity.targetY;
    entity.direction = null;
    entity.moving = false;
    return;
  }

  entity.x += (deltaX / distance) * speed;
  entity.y += (deltaY / distance) * speed;
}

function maybeReleaseBombGhosts() {
  for (const bomb of state.bombs) {
    if (!bomb.ghostOwner) continue;
    const owner = state.players.get(bomb.ownerId);
    if (!owner || owner.tileX !== bomb.tileX || owner.tileY !== bomb.tileY) {
      bomb.ghostOwner = false;
    }
  }
}

function placeBomb(player) {
  if (!player.alive || player.activeBombs >= player.maxBombs) {
    return;
  }
  if (bombAt(player.tileX, player.tileY)) {
    return;
  }
  state.bombs.push({
    tileX: player.tileX,
    tileY: player.tileY,
    ownerId: player.id,
    fuse: BOMB_FUSE,
    power: player.bombPower,
    ghostOwner: true,
  });
  player.activeBombs += 1;
}

function hitPlayer(player, now) {
  if (!player.alive || player.shieldUntil > now) {
    return;
  }
  player.lives -= 1;
  if (player.lives <= 0) {
    player.alive = false;
    player.respawnAt = 0;
    return;
  }
  player.alive = false;
  player.respawnAt = now + RESPAWN_DELAY;
}

function respawnPlayers(now) {
  for (const player of state.players.values()) {
    if (player.alive || player.lives <= 0 || player.respawnAt === 0 || now < player.respawnAt) {
      continue;
    }
    player.alive = true;
    player.respawnAt = 0;
    player.shieldUntil = now + RESPAWN_SHIELD;
    settleSpawn(player);
  }
}

function applyPickup(player) {
  const cell = cellAt(player.tileX, player.tileY);
  if (!cell || !cell.pickup) {
    return;
  }
  if (cell.pickup === "bomb") {
    player.maxBombs = Math.min(player.maxBombs + 1, 6);
  } else if (cell.pickup === "flame") {
    player.bombPower = Math.min(player.bombPower + 1, 6);
  } else {
    player.speed = Math.min(player.speed + 0.45, 6.2);
  }
  cell.pickup = null;
  state.score += 40;
}

function togglePause() {
  if (state.gameOver || state.roundClear) {
    return;
  }
  state.paused = !state.paused;
}

function updatePlayers(delta, now) {
  const dt = delta / 1000;
  let pausePressed = false;

  for (const player of state.players.values()) {
    const input = player.source === "keyboard" ? readKeyboardInput() : readGamepadInput(player.controllerIndex);
    pausePressed ||= edgeTrigger(player.id, "pause", input.pause);

    if (!player.alive) {
      continue;
    }

    if (edgeTrigger(player.id, "bomb", input.bomb)) {
      placeBomb(player);
    }

    const direction = chooseDirection(input.axisX, input.axisY);
    if (!player.moving) {
      attemptMove(player, direction, player.id);
    }
    advanceEntity(player, dt);
    applyPickup(player);

    if (flameAt(player.tileX, player.tileY)) {
      hitPlayer(player, now);
    }
  }

  if (pausePressed) {
    togglePause();
  }
}

function createEnemies(round) {
  const enemies = [];
  const total = Math.min(3 + round, 8);
  const openTiles = collectOpenTiles().filter((tile) => !spawnTiles.some((spawn) => spawn.x === tile.x && spawn.y === tile.y));
  for (let index = 0; index < total; index += 1) {
    const tile = openTiles[index];
    if (!tile) break;
    enemies.push({
      id: `enemy-${round}-${index}`,
      tileX: tile.x,
      tileY: tile.y,
      x: tileCenterX(tile.x),
      y: tileCenterY(tile.y),
      targetX: tile.x,
      targetY: tile.y,
      moving: false,
      direction: null,
      speed: 2.4 + round * 0.08 + (index % 3) * 0.2,
      color: ENEMY_COLORS[index % ENEMY_COLORS.length],
    });
  }
  return enemies;
}

function chooseEnemyDirection(enemy) {
  const options = directionOrder.filter((direction) => isTileWalkable(enemy.tileX + direction.dx, enemy.tileY + direction.dy));
  if (options.length === 0) {
    return null;
  }
  const alivePlayers = [...state.players.values()].filter((player) => player.alive);
  if (alivePlayers.length === 0) {
    return randomFrom(options);
  }
  const nearest = alivePlayers.reduce((best, player) => {
    const distance = Math.abs(player.tileX - enemy.tileX) + Math.abs(player.tileY - enemy.tileY);
    if (!best || distance < best.distance) {
      return { player, distance };
    }
    return best;
  }, null);

  const ranked = options
    .map((direction) => ({
      direction,
      distance: Math.abs(nearest.player.tileX - (enemy.tileX + direction.dx)) + Math.abs(nearest.player.tileY - (enemy.tileY + direction.dy)),
    }))
    .sort((left, right) => left.distance - right.distance);

  if (Math.random() < 0.68) {
    return ranked[0]?.direction || randomFrom(options);
  }
  return randomFrom(options);
}

function updateEnemies(delta, now) {
  const dt = delta / 1000;
  for (const enemy of state.enemies) {
    if (!enemy.moving) {
      const direction = chooseEnemyDirection(enemy);
      attemptMove(enemy, direction);
    }
    advanceEntity(enemy, dt);
  }

  for (const enemy of state.enemies) {
    for (const player of state.players.values()) {
      if (!player.alive) continue;
      const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      if (distance < TILE_SIZE * 0.38) {
        hitPlayer(player, now);
      }
    }
  }
}

function revealCellLoot(cell) {
  if (cell.exitState === "hidden") {
    cell.exitState = "open";
    cell.kind = "exit";
    return;
  }
  cell.kind = "empty";
}

function createFlame(tileX, tileY, ownerId) {
  const existing = flameAt(tileX, tileY);
  if (existing) {
    existing.life = FLAME_DURATION;
    return;
  }
  state.flames.push({
    tileX,
    tileY,
    ownerId,
    life: FLAME_DURATION,
  });
}

function explodeBomb(bomb) {
  const owner = state.players.get(bomb.ownerId);
  if (owner) {
    owner.activeBombs = Math.max(0, owner.activeBombs - 1);
  }

  createFlame(bomb.tileX, bomb.tileY, bomb.ownerId);

  for (const direction of directionOrder) {
    for (let step = 1; step <= bomb.power; step += 1) {
      const tileX = bomb.tileX + direction.dx * step;
      const tileY = bomb.tileY + direction.dy * step;
      const cell = cellAt(tileX, tileY);
      if (!cell) break;
      if (cell.kind === "wall") {
        break;
      }

      createFlame(tileX, tileY, bomb.ownerId);
      const chainedBomb = bombAt(tileX, tileY);
      if (chainedBomb) {
        chainedBomb.fuse = 0;
      }

      if (cell.kind === "soft") {
        revealCellLoot(cell);
        state.score += 10;
        break;
      }
    }
  }
}

function updateBombs(delta) {
  const dt = delta / 1000;
  const exploding = [];
  for (const bomb of state.bombs) {
    bomb.fuse -= dt;
    if (bomb.fuse <= 0) {
      exploding.push(bomb);
    }
  }
  if (exploding.length === 0) {
    return;
  }
  state.bombs = state.bombs.filter((bomb) => !exploding.includes(bomb));
  exploding.forEach(explodeBomb);
}

function updateFlames(delta, now) {
  const dt = delta / 1000;
  for (const flame of state.flames) {
    flame.life -= dt;
  }
  state.flames = state.flames.filter((flame) => flame.life > 0);

  for (const enemy of [...state.enemies]) {
    if (flameAt(enemy.tileX, enemy.tileY)) {
      state.enemies = state.enemies.filter((candidate) => candidate.id !== enemy.id);
      state.score += 120;
    }
  }

  for (const player of state.players.values()) {
    if (!player.alive) continue;
    if (flameAt(player.tileX, player.tileY)) {
      hitPlayer(player, now);
    }
  }
}

function createRound() {
  state.board = createBoard(state.round);
  state.bombs = [];
  state.flames = [];
  state.enemies = createEnemies(state.round);
  state.roundClear = false;
  state.roundAdvanceTimer = 0;

  let slot = 0;
  for (const player of state.players.values()) {
    player.slot = slot;
    player.label = PLAYER_LABELS[slot] || `P${slot + 1}`;
    player.color = PLAYER_COLORS[slot % PLAYER_COLORS.length];
    player.activeBombs = 0;
    player.alive = player.lives > 0;
    player.respawnAt = 0;
    player.shieldUntil = performance.now() / 1000 + RESPAWN_SHIELD;
    settleSpawn(player);
    slot += 1;
  }
}

function resetRun() {
  gameOverMenuShown = false;
  arcadeCabinet?.closeResults?.();
  state.round = 1;
  state.score = 0;
  state.gameOver = false;
  state.roundClear = false;
  state.roundAdvanceTimer = 0;
  state.paused = false;
  state.lastStatusText = "";
  state.bombs = [];
  state.flames = [];
  state.enemies = [];
  for (const player of state.players.values()) {
    player.speed = 4.1;
    player.bombPower = 2;
    player.maxBombs = 1;
    player.activeBombs = 0;
    player.lives = 3;
    player.alive = true;
    player.respawnAt = 0;
    player.shieldUntil = performance.now() / 1000 + RESPAWN_SHIELD;
  }
  createRound();
}

function showGameOverMenu() {
  if (gameOverMenuShown || !state.gameOver) {
    return;
  }
  gameOverMenuShown = true;
  arcadeCabinet?.reportGameOver?.({
    gameId: "bomberman",
    title: "Bomberman",
    score: state.score,
    onRestart: resetRun,
  });
}

function openExitCell() {
  forEachCell((cell) => {
    if (cell.exitState === "open") {
      cell.kind = "exit";
    }
  });
}

function livingPlayers() {
  return [...state.players.values()].filter((player) => player.alive);
}

function allPlayersSpent() {
  return [...state.players.values()].length > 0
    && [...state.players.values()].every((player) => !player.alive && player.lives <= 0);
}

function updateRoundState(delta, now) {
  if (!state.roundClear && state.enemies.length === 0) {
    openExitCell();
    for (const player of livingPlayers()) {
      const cell = cellAt(player.tileX, player.tileY);
      if (cell?.kind === "exit") {
        state.roundClear = true;
        state.roundAdvanceTimer = 1.15;
      }
    }
  }

  if (state.roundClear) {
    state.roundAdvanceTimer -= delta / 1000;
    if (state.roundAdvanceTimer <= 0) {
      state.round += 1;
      createRound();
    }
  }

  if (!state.roundClear && allPlayersSpent()) {
    state.gameOver = true;
    state.paused = false;
    showGameOverMenu();
  }

  respawnPlayers(now);
}

function statusText() {
  if (state.gameOver) {
    return "Game over. Press R to reset the cabinet.";
  }
  if (state.roundClear) {
    return "Exit reached. Loading the next room.";
  }
  if (state.paused) {
    return "Paused.";
  }
  if (state.enemies.length === 0) {
    return "Room clear. Find the exit hatch.";
  }
  if ([...state.players.values()].some((player) => !player.alive && player.lives > 0)) {
    return "Hold the room. Fallen bombers are respawning.";
  }
  return "Blast soft blocks, grab upgrades, and clear a path.";
}

function drawBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#281019");
  gradient.addColorStop(1, "#13070d");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255, 188, 120, 0.05)";
  for (let index = 0; index < 30; index += 1) {
    const size = 24 + (index % 5) * 10;
    ctx.fillRect(20 + index * 31, 24 + (index % 7) * 18, size, 3);
  }
}

function drawBoard() {
  const boardWidth = COLS * TILE_SIZE;
  const boardHeight = ROWS * TILE_SIZE;

  ctx.save();
  ctx.translate(BOARD_OFFSET_X, BOARD_OFFSET_Y);

  ctx.fillStyle = "#241018";
  ctx.fillRect(-14, -14, boardWidth + 28, boardHeight + 28);
  ctx.fillStyle = "#31131d";
  ctx.fillRect(0, 0, boardWidth, boardHeight);

  forEachCell((cell, x, y) => {
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.strokeRect(px + 0.5, py + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);

    if (cell.kind === "wall") {
      ctx.fillStyle = "#5d2430";
      ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
      ctx.fillStyle = "#7d3343";
      ctx.fillRect(px + 11, py + 11, TILE_SIZE - 22, TILE_SIZE - 22);
      return;
    }

    if (cell.kind === "soft") {
      ctx.fillStyle = "#b05e36";
      ctx.fillRect(px + 5, py + 7, TILE_SIZE - 10, TILE_SIZE - 14);
      ctx.fillStyle = "#cf8452";
      for (let stripe = 0; stripe < 3; stripe += 1) {
        ctx.fillRect(px + 10, py + 12 + stripe * 12, TILE_SIZE - 20, 5);
      }
      return;
    }

    if (cell.kind === "exit") {
      ctx.fillStyle = "#5fe6c7";
      ctx.fillRect(px + 11, py + 11, TILE_SIZE - 22, TILE_SIZE - 22);
      ctx.fillStyle = "#18353a";
      ctx.fillRect(px + 17, py + 17, TILE_SIZE - 34, TILE_SIZE - 34);
    }

    if (cell.pickup) {
      ctx.save();
      ctx.translate(px + TILE_SIZE / 2, py + TILE_SIZE / 2);
      if (cell.pickup === "bomb") {
        ctx.fillStyle = "#69b7ff";
        ctx.beginPath();
        ctx.arc(0, 2, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1b4d9b";
        ctx.fillRect(-3, -12, 6, 8);
      } else if (cell.pickup === "flame") {
        ctx.fillStyle = "#ff8f4a";
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.quadraticCurveTo(13, -2, 8, 10);
        ctx.quadraticCurveTo(2, 16, 0, 18);
        ctx.quadraticCurveTo(-2, 16, -8, 10);
        ctx.quadraticCurveTo(-13, -2, 0, -14);
        ctx.fill();
      } else {
        ctx.fillStyle = "#7cd6ff";
        ctx.fillRect(-10, -6, 20, 12);
        ctx.fillStyle = "#d5f4ff";
        ctx.fillRect(-6, -10, 12, 20);
      }
      ctx.restore();
    }
  });

  ctx.restore();
}

function drawBombs() {
  for (const bomb of state.bombs) {
    const x = tileCenterX(bomb.tileX);
    const y = tileCenterY(bomb.tileY);
    const pulse = 1 + Math.sin((BOMB_FUSE - bomb.fuse) * 10) * 0.05;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = "#2f7dff";
    ctx.beginPath();
    ctx.arc(0, 2, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#dff4ff";
    ctx.fillRect(-2, -16, 4, 9);
    ctx.fillStyle = "#7fd7ff";
    ctx.beginPath();
    ctx.arc(-6, -4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawFlames() {
  for (const flame of state.flames) {
    const x = tileCenterX(flame.tileX);
    const y = tileCenterY(flame.tileY);
    const alpha = Math.max(0.24, flame.life / FLAME_DURATION);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.fillStyle = "#ffd667";
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.quadraticCurveTo(18, -8, 12, 6);
    ctx.quadraticCurveTo(7, 22, 0, 26);
    ctx.quadraticCurveTo(-7, 22, -12, 6);
    ctx.quadraticCurveTo(-18, -8, 0, -24);
    ctx.fill();
    ctx.fillStyle = "#ff8249";
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.quadraticCurveTo(11, -2, 7, 9);
    ctx.quadraticCurveTo(3, 16, 0, 18);
    ctx.quadraticCurveTo(-3, 16, -7, 9);
    ctx.quadraticCurveTo(-11, -2, 0, -14);
    ctx.fill();
    ctx.restore();
  }
}

function drawEnemies() {
  for (const enemy of state.enemies) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.roundRect(-18, -18, 36, 36, 10);
    ctx.fill();
    ctx.fillStyle = "#2b1320";
    ctx.fillRect(-10, -5, 6, 6);
    ctx.fillRect(4, -5, 6, 6);
    ctx.fillRect(-8, 8, 16, 4);
    ctx.restore();
  }
}

function drawPlayerSprite(player) {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.arc(0, -6, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-14, 6, 28, 18);
  ctx.fillStyle = "#2a1420";
  ctx.fillRect(-9, -10, 4, 4);
  ctx.fillRect(5, -10, 4, 4);
  ctx.fillStyle = "#fff7ef";
  ctx.font = '700 12px "Avenir Next", "Segoe UI", sans-serif';
  ctx.textAlign = "center";
  ctx.fillText(player.label, 0, -26);
  for (let index = 0; index < player.lives; index += 1) {
    ctx.fillStyle = "#ffd978";
    ctx.fillRect(-16 + index * 10, 28, 7, 7);
  }
  ctx.restore();
}

function drawPlayers(now) {
  for (const player of state.players.values()) {
    if (!player.alive && player.lives <= 0) {
      continue;
    }
    if (!player.alive && player.lives > 0) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = player.color;
      ctx.beginPath();
      ctx.arc(tileCenterX(player.tileX), tileCenterY(player.tileY), 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      continue;
    }
    const flicker = player.shieldUntil > now && Math.floor(now * 10) % 2 === 0;
    if (flicker) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      drawPlayerSprite(player);
      ctx.restore();
    } else {
      drawPlayerSprite(player);
    }
  }
}

function drawScoreStrip() {
  ctx.save();
  ctx.fillStyle = "rgba(255, 247, 239, 0.9)";
  ctx.font = '700 16px "Avenir Next", "Segoe UI", sans-serif';
  ctx.textAlign = "left";
  ctx.fillText(`Build ${BUILD_NUMBER}`, 24, canvas.height - 22);
  ctx.textAlign = "right";
  ctx.fillText(`Score ${state.score}`, canvas.width - 24, canvas.height - 22);
  ctx.restore();
}

function drawOverlay() {
  if (!state.paused && !state.gameOver && !state.roundClear) {
    return;
  }
  ctx.save();
  ctx.fillStyle = "rgba(10, 4, 7, 0.56)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff7ef";
  ctx.textAlign = "center";
  ctx.font = '700 36px "Avenir Next", "Segoe UI", sans-serif';
  ctx.fillText(state.gameOver ? "Game Over" : state.roundClear ? "Room Clear" : "Paused", canvas.width / 2, 160);
  ctx.font = '600 18px "Avenir Next", "Segoe UI", sans-serif';
  ctx.fillStyle = "rgba(255, 247, 239, 0.8)";
  ctx.fillText(state.gameOver ? "Press R to reset the run." : state.roundClear ? "Next room is loading." : "Press P or Start to resume.", canvas.width / 2, 198);
  ctx.restore();
}

function draw(now) {
  drawBackground();
  drawBoard();
  drawBombs();
  drawFlames();
  drawEnemies();
  drawPlayers(now);
  drawScoreStrip();
  drawOverlay();
}

function syncUi() {
  ui.round.textContent = String(state.round);
  ui.players.textContent = String(state.players.size);
  ui.enemies.textContent = String(state.enemies.length);

  const nextStatus = statusText();
  if (nextStatus !== state.lastStatusText) {
    ui.status.textContent = nextStatus;
    state.lastStatusText = nextStatus;
  }

  if (state.gameOver) {
    ui.hint.textContent = "Press R to reset. Pads can still join for the next run.";
  } else if (state.enemies.length === 0) {
    ui.hint.textContent = "The room is clear. Find the hatch and step onto it.";
  } else {
    ui.hint.textContent = "Drop bombs with Space or A. Start joins new pads and pauses seated players.";
  }
}

function update(delta, now) {
  ensureInputRoster();
  maybeReleaseBombGhosts();

  if (!state.board.length) {
    createRound();
  }

  if (!state.paused && !state.gameOver) {
    updatePlayers(delta, now);
    if (!state.roundClear) {
      updateEnemies(delta, now);
      updateBombs(delta);
      updateFlames(delta, now);
    }
    updateRoundState(delta, now);
  } else {
    respawnPlayers(now);
    updatePlayers(0, now);
  }

  syncUi();
}

function frame(nowMs) {
  const now = nowMs / 1000;
  const delta = state.lastTime ? Math.min(32, nowMs - state.lastTime) : 16;
  state.lastTime = nowMs;
  update(delta, now);
  draw(now);
  requestAnimationFrame(frame);
}

window.addEventListener("keydown", (event) => {
  if (event.repeat) {
    return;
  }
  if (event.code === "ArrowLeft") state.keyboard.left = true;
  if (event.code === "ArrowRight") state.keyboard.right = true;
  if (event.code === "ArrowUp") state.keyboard.up = true;
  if (event.code === "ArrowDown") state.keyboard.down = true;
  if (event.code === "Space") {
    state.keyboard.bombHeld = true;
    event.preventDefault();
  }
  if (event.code === "KeyP") {
    togglePause();
  }
  if (event.code === "KeyR") {
    resetRun();
  }
});

window.addEventListener("keyup", (event) => {
  if (event.code === "ArrowLeft") state.keyboard.left = false;
  if (event.code === "ArrowRight") state.keyboard.right = false;
  if (event.code === "ArrowUp") state.keyboard.up = false;
  if (event.code === "ArrowDown") state.keyboard.down = false;
  if (event.code === "Space") {
    state.keyboard.bombHeld = false;
    event.preventDefault();
  }
});

resetRun();
requestAnimationFrame(frame);
