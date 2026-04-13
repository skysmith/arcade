const width = 960;
const height = 540;
const groundY = 472;
const SINGLEPLAYER_CAMERA_ANCHOR_X = width * 0.25;
const MULTIPLAYER_CAMERA_ANCHOR_X = width * 0.75;
const MULTIPLAYER_GROUP_CAMERA_THRESHOLD_X = width * 0.5;
const SCENE_SEGMENT_WIDTH = 3200;
const sceneBlendWidth = 960;
const SCENE_REPEAT_COUNT = 16;
const PLAYER_WALK_SPEED = 190;
const PLAYER_RUN_SPEED = 310;
const PLAYER_JUMP_VELOCITY = 460;
const PLAYER_RUN_DOUBLE_TAP_WINDOW = 220;
const PLAYER_RUN_AXIS_THRESHOLD = 0.82;
const PLAYER_SCREEN_DRAG_SOFT_X = width * 0.1;
const PLAYER_SCREEN_DRAG_HARD_X = width * 0.06;
const PLAYER_SCREEN_DRAG_SOFT_X_CROWDED = width * 0.04;
const PLAYER_SCREEN_DRAG_HARD_X_CROWDED = width * 0.02;
const PLAYER_SCREEN_LEAD_SOFT_X = width * 0.9;
const PLAYER_SCREEN_LEAD_HARD_X = width * 0.96;
const PLAYER_SCREEN_LEAD_SOFT_X_CROWDED = width * 0.94;
const PLAYER_SCREEN_LEAD_HARD_X_CROWDED = width * 0.98;
const PLAYER_SCREEN_DRAG_CATCHUP = 0.18;
const PLAYER_SCREEN_DRAG_MIN_SPEED = 72;
const PLAYER_SCREEN_DRAG_MAX_SPEED = 240;
const CHILL_EDGE_MARGIN = 96;
const CHILL_RIGHT_BIAS = 0.67;
const CHILL_RIGHT_TURN_MIN = 1600;
const CHILL_RIGHT_TURN_MAX = 3000;
const CHILL_LEFT_TURN_MIN = 800;
const CHILL_LEFT_TURN_MAX = 1500;
const CHILL_MONSTER_ENGAGE_RANGE = 220;
const CHILL_MONSTER_ATTACK_RANGE = 88;
const PLAYER_INTERACTION_DURATION = 1500;
const PLAYER_FLIP_ROTATION = 720;
const PLAYER_ATTACK_COOLDOWN = 180;
const PLAYER_HIT_STUN = 240;
const PLAYER_INVULNERABLE_TIME = 620;
const NPC_INTERACTION_RANGE = 188;
const NPC_INTERACTION_DURATION = 1400;
const NPC_WALK_SPEED_MIN = 18;
const NPC_WALK_SPEED_MAX = 30;
const NPC_SOCIAL_DURATION_MIN = 1900;
const NPC_SOCIAL_DURATION_MAX = 3200;
const NPC_SOCIAL_COOLDOWN_MIN = 6000;
const NPC_SOCIAL_COOLDOWN_MAX = 11000;
const NPC_MONSTER_FEAR_RANGE = 210;
const NPC_MONSTER_FEAR_VERTICAL_RANGE = 112;
const NPC_SCARED_SPEED_MULTIPLIER = 2.1;
const NPC_SCARED_RECOVERY = 700;
const NPC_SCARED_PAIR_COOLDOWN = 2200;
const BIRD_SPAWN_DELAY_MIN = 9000;
const BIRD_SPAWN_DELAY_MAX = 18000;
const BIRD_SPEED_MIN = 140;
const BIRD_SPEED_MAX = 220;
const BIRD_FRAME_DURATION_MIN = 95;
const BIRD_FRAME_DURATION_MAX = 132;
const BEACH_WAVE_SCROLL_SPEED = 20;
const BEACH_WAVE_BOB_SPEED = 0.0017;
const BEACH_WAVE_BOB_AMOUNT = 3.5;
const ENEMY_SPAWN_DELAY_MIN = 3800;
const ENEMY_SPAWN_DELAY_MAX = 6200;
const ENEMY_MOVE_SPEED_MIN = 42;
const ENEMY_MOVE_SPEED_MAX = 68;
const ENEMY_CONTACT_RANGE = 34;
const ENEMY_CONTACT_COOLDOWN = 1200;
const ENEMY_MAX_ACTIVE = 5;
const ENEMY_DESPAWN_DISTANCE = 1680;
const ENEMY_SPAWN_RETRY_DELAY_MIN = 800;
const ENEMY_SPAWN_RETRY_DELAY_MAX = 1400;
const ENEMY_STOMP_BOUNCE_VELOCITY = 320;
const ENEMY_STOMP_MIN_FALL_SPEED = 90;
const ENEMY_STOMP_TOP_TOLERANCE = 24;
const MAX_LOCAL_PLAYERS = 4;
const GAMEPAD_DEADZONE = 0.24;
const GAMEPAD_JOIN_SPACING = 56;
const PLAYER_VARIANTS = [
  {
    id: "classic",
    label: "Classic",
    swatches: ["#2f5a7a", "#1f303d"],
    palette: {
      skin: 0xe6c2a2,
      nose: 0xcf9b74,
      eye: 0x1f303d,
      smile: 0x7d5a45,
      shirt: 0x1f303d,
      shirtAccent: 0x3f6173,
      sleeve: 0x304b5d,
      pants: 0x4d6f8d,
      shoe: 0x5a4030,
      hat: 0x2f5a7a,
      hatPanel: 0x4b7b9d,
      brim: 0x173247,
      beard: null,
    },
  },
  {
    id: "canyon",
    label: "Canyon",
    swatches: ["#7c4c43", "#d18f65"],
    palette: {
      skin: 0xd6ab84,
      nose: 0xb98566,
      eye: 0x2b201c,
      smile: 0x704b39,
      shirt: 0x784840,
      shirtAccent: 0xd18f65,
      sleeve: 0x96584d,
      pants: 0x6a6f86,
      shoe: 0x4e372c,
      hat: 0x7c4c43,
      hatPanel: 0xc98566,
      brim: 0x3b231d,
      beard: 0x6b4636,
    },
  },
  {
    id: "spruce",
    label: "Spruce",
    swatches: ["#46684e", "#a6bc7f"],
    palette: {
      skin: 0xe1b992,
      nose: 0xc7926d,
      eye: 0x22302a,
      smile: 0x6f543d,
      shirt: 0x365446,
      shirtAccent: 0xa6bc7f,
      sleeve: 0x50715d,
      pants: 0x6e7a58,
      shoe: 0x4a392b,
      hat: 0x46684e,
      hatPanel: 0x73936d,
      brim: 0x213329,
      beard: null,
    },
  },
  {
    id: "coast",
    label: "Coast",
    swatches: ["#2f6f74", "#ff957f"],
    palette: {
      skin: 0xf0c9a8,
      nose: 0xd3a281,
      eye: 0x21323e,
      smile: 0x83604c,
      shirt: 0x2d6367,
      shirtAccent: 0xff957f,
      sleeve: 0x418084,
      pants: 0x60748b,
      shoe: 0x4a382c,
      hat: 0x2f6f74,
      hatPanel: 0x7db7ba,
      brim: 0x14383a,
      hair: 0x6f4d46,
      hairAccent: 0xbc8a78,
      silhouette: "woman",
      beard: null,
    },
  },
  {
    id: "midnight",
    label: "Midnight",
    swatches: ["#463c77", "#d5c3ff"],
    palette: {
      skin: 0xc99877,
      nose: 0xae7c60,
      eye: 0x161525,
      smile: 0x65473a,
      shirt: 0x332f5b,
      shirtAccent: 0xd5c3ff,
      sleeve: 0x4b487b,
      pants: 0x53647d,
      shoe: 0x332722,
      hat: 0x463c77,
      hatPanel: 0x8e84c9,
      brim: 0x1d1a37,
      hair: 0x2a2138,
      hairAccent: 0x66538c,
      silhouette: "woman",
      beard: null,
    },
  },
];
const DEFAULT_PLAYER_VARIANT = PLAYER_VARIANTS[0].id;
const DEFAULT_PLAYER_SLOT_VARIANTS = PLAYER_VARIANTS.slice(0, MAX_LOCAL_PLAYERS).map((variant) => variant.id);

const DAY_TOP = Phaser.Display.Color.ValueToColor(0x8fcffd);
const DAY_BOTTOM = Phaser.Display.Color.ValueToColor(0xf1e5b9);
const NIGHT_TOP = Phaser.Display.Color.ValueToColor(0x13203f);
const NIGHT_BOTTOM = Phaser.Display.Color.ValueToColor(0x2a3554);
const DAY_CYCLE_OFFSET = 0.22;
const SUN_TRAVEL_WINDOW = 0.47;
const MOON_RISE_DELAY = 0.03;
const MOON_TRAVEL_WINDOW = 0.47;
const SCENE_TYPES = ["city", "mountain", "beach", "neighborhood", "desert", "arches", "boardwalk", "alpine"];
const SCENE_CYCLE = shuffleWithSeed(SCENE_TYPES, 0xd37e71);
const TOTAL_SCENE_SEGMENTS = SCENE_CYCLE.length * SCENE_REPEAT_COUNT;
const worldWidth = SCENE_SEGMENT_WIDTH * TOTAL_SCENE_SEGMENTS;
const CITY_SKYLINE = [
  { x: 0, width: 120, height: 182 },
  { x: 108, width: 92, height: 154 },
  { x: 188, width: 136, height: 220 },
  { x: 316, width: 84, height: 170 },
  { x: 392, width: 124, height: 196 },
  { x: 500, width: 92, height: 144 },
  { x: 584, width: 144, height: 232 },
];
const NEIGHBORHOOD_HOUSE_SPECS = [
  { x: 18, width: 168, height: 88, body: 0xc7d4d8, roof: 0x8a5c50 },
  { x: 220, width: 184, height: 96, body: 0xd6ceb8, roof: 0x6f7b93 },
  { x: 438, width: 150, height: 82, body: 0xc8d8c2, roof: 0x8d6e47 },
  { x: 616, width: 128, height: 92, body: 0xe1d2c4, roof: 0x7b5a77 },
];
const CITY_LIGHT_ON_COLOR = "#ffd95a";
const NEIGHBORHOOD_LIGHT_ON_COLOR = "#ffd86d";
const PLAYER_MANUAL_EMOTES = [
  { style: "wave", emoteKey: "emote-heart" },
  { style: "cheer", emoteKey: "emote-spark" },
  { style: "tip", emoteKey: "emote-heart" },
  { style: "peace", emoteKey: "emote-smile" },
  { style: "shrug", emoteKey: "emote-note" },
  { style: "jumpjack", emoteKey: "emote-burst" },
  { style: "flip", emoteKey: "emote-star" },
];
const GAME_MODES = [
  {
    id: "coop",
    label: "Co-op",
    description: "Work together against cute robots and puff monsters.",
  },
  {
    id: "ffa",
    label: "Free For All",
    description: "Players bop each other with the same move set.",
  },
];
const DEFAULT_GAME_MODE = GAME_MODES[0].id;
const ATTACK_PROFILES = {
  "a-neutral": {
    pose: "attack-jab",
    duration: 240,
    activeStart: 45,
    activeEnd: 150,
    width: 44,
    height: 24,
    offsetX: 30,
    offsetY: -16,
    effectWidth: 40,
    effectHeight: 18,
    effectAngle: -10,
    effectColor: 0xffd364,
    knockbackX: 240,
    knockbackY: 80,
    damage: 1,
  },
  "a-side": {
    pose: "attack-side",
    duration: 270,
    activeStart: 35,
    activeEnd: 170,
    width: 58,
    height: 28,
    offsetX: 36,
    offsetY: -14,
    effectWidth: 58,
    effectHeight: 20,
    effectAngle: -4,
    effectColor: 0xffb85e,
    dashX: 140,
    knockbackX: 320,
    knockbackY: 90,
    damage: 1,
  },
  "a-up": {
    pose: "attack-up",
    duration: 250,
    activeStart: 35,
    activeEnd: 160,
    width: 34,
    height: 62,
    offsetX: 10,
    offsetY: -56,
    effectWidth: 30,
    effectHeight: 56,
    effectAngle: -68,
    effectColor: 0xffe490,
    knockbackX: 110,
    knockbackY: 250,
    damage: 1,
  },
  "a-down": {
    pose: "attack-down",
    duration: 260,
    activeStart: 50,
    activeEnd: 170,
    width: 54,
    height: 22,
    offsetX: 24,
    offsetY: 6,
    effectWidth: 54,
    effectHeight: 16,
    effectAngle: 12,
    effectColor: 0xf6c15b,
    knockbackX: 220,
    knockbackY: 48,
    damage: 1,
  },
  "b-neutral": {
    pose: "attack-spin",
    duration: 340,
    activeStart: 65,
    activeEnd: 220,
    width: 56,
    height: 52,
    offsetX: 16,
    offsetY: -18,
    effectWidth: 54,
    effectHeight: 44,
    effectAngle: 0,
    effectColor: 0x8fd7ff,
    knockbackX: 250,
    knockbackY: 120,
    damage: 2,
  },
  "b-side": {
    pose: "attack-side",
    duration: 320,
    activeStart: 45,
    activeEnd: 220,
    width: 68,
    height: 28,
    offsetX: 42,
    offsetY: -14,
    effectWidth: 72,
    effectHeight: 22,
    effectAngle: -2,
    effectColor: 0x89d8ff,
    dashX: 220,
    knockbackX: 380,
    knockbackY: 92,
    damage: 2,
  },
  "b-up": {
    pose: "attack-up",
    duration: 320,
    activeStart: 35,
    activeEnd: 220,
    width: 42,
    height: 72,
    offsetX: 10,
    offsetY: -64,
    effectWidth: 34,
    effectHeight: 68,
    effectAngle: -76,
    effectColor: 0xb8ecff,
    launchY: 300,
    knockbackX: 120,
    knockbackY: 280,
    damage: 2,
  },
  "b-down": {
    pose: "attack-down",
    duration: 330,
    activeStart: 65,
    activeEnd: 220,
    width: 70,
    height: 24,
    offsetX: 18,
    offsetY: 10,
    effectWidth: 68,
    effectHeight: 18,
    effectAngle: 8,
    effectColor: 0x9ed7ff,
    knockbackX: 250,
    knockbackY: 70,
    damage: 2,
  },
};

function createSeededRng(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 0x100000000;
  };
}

function shuffleWithSeed(items, seed) {
  const random = createSeededRng(seed);
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function heroTextureKey(variantId, poseName) {
  return `hero-${variantId}-${poseName}`;
}

function getPlayerVariant(variantId) {
  return PLAYER_VARIANTS.find((variant) => variant.id === variantId) ?? PLAYER_VARIANTS[0];
}

function getPlayerSlotVariant(slot) {
  return getPlayerVariant(playerSlotVariantIds[slot] ?? DEFAULT_PLAYER_VARIANT).id;
}

function getPlayerStateBySlot(slot) {
  if (slot === 0) {
    return primaryPlayerState;
  }

  for (const companion of companionPlayers.values()) {
    if (companion.slot === slot) {
      return companion;
    }
  }

  return null;
}

function getVariantPreviewSrc(variantId) {
  const cacheKey = heroTextureKey(variantId, "idle");
  if (pauseMenuPreviewCache.has(cacheKey)) {
    return pauseMenuPreviewCache.get(cacheKey);
  }

  const texture = activeScene?.textures?.get?.(cacheKey);
  const sourceImage = texture?.getSourceImage?.();
  let previewSrc = "";

  if (sourceImage && typeof sourceImage.toDataURL === "function") {
    previewSrc = sourceImage.toDataURL("image/png");
  } else if (activeScene?.textures?.getBase64) {
    previewSrc = activeScene.textures.getBase64(cacheKey) ?? "";
  }

  pauseMenuPreviewCache.set(cacheKey, previewSrc);
  return previewSrc;
}

const config = {
  type: Phaser.AUTO,
  parent: "studio-root",
  width,
  height,
  backgroundColor: "#8fcffd",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 1100 }, debug: false },
  },
  scene: { preload, create, update },
};

const game = new Phaser.Game(config);

let cursors;
let movementKeys;
let chillKey;
let emoteCycleKey;
let controllerPanelKey;
let pauseKey;
let attackKeys;
let player;
let clouds = [];
let birds = [];
let npcs = [];
let npcPairs = [];
let enemies = [];
let layers = {};
let currentDaylight = 1;
let chillMode = false;
let birdSpawnTimer = 0;
let beachWavePhase = 0;
let enemySpawnTimer = 0;
let enemyIdCounter = 0;
let manualEmoteIndex = -1;
let chillState = {
  direction: 1,
  turnTimer: 0,
  jumpTimer: 0,
  idleTimer: 0,
};
let primaryPlayerState;
let players = [];
let companionPlayers = new Map();
let joinedGamepadOrder = [];
let primaryGamepadIndex = null;
let connectedGamepads = [];
let controllerStates = new Map();
let controllerPanelVisible = false;
let controllerPanel;
let controllerPanelSummary;
let controllerPanelList;
let activeScene;
let pauseMenuVisible = false;
let pauseMenu;
let pauseMenuPlayerCountGrid;
let pauseMenuSlotGrid;
let pauseMenuGrid;
let pauseMenuModeGrid;
let pauseMenuCharacterSection;
let pauseMenuCharacterToggleButton;
let pauseMenuCharacterCloseButton;
let pauseMenuControllerGrid;
let pauseMenuControllerCopy;
let pauseMenuControllerRefreshButton;
let pauseMenuHint;
let pauseMenuControllerSignature = "";
let desiredPlayerCount = 1;
let selectedPlayerSlot = 0;
let characterSelectVisible = false;
let playerSlotVariantIds = DEFAULT_PLAYER_SLOT_VARIANTS.slice();
let gameMode = DEFAULT_GAME_MODE;
let gamepadListenersBound = false;
let pauseMenuPreviewCache = new Map();

function preload() {
  const g = this.add.graphics({ x: 0, y: 0 });

  const drawLimb = (points, width, color) => {
    g.lineStyle(width, color, 1);
    g.beginPath();
    g.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i += 1) {
      g.lineTo(points[i].x, points[i].y);
    }
    g.strokePath();
    g.fillStyle(color, 1);
    for (const point of points) {
      g.fillCircle(point.x, point.y, width * 0.46);
    }
  };

  const drawFoot = (point, toeOffset, color = 0x5a4030) => {
    g.fillStyle(color, 1);
    g.fillEllipse(point.x + toeOffset, point.y + 2, 11, 4.5);
  };

  const createRandomSpacedPositions = (count, minX, maxX, minGap, seed) => {
    if (count <= 0) {
      return [];
    }
    if (count === 1) {
      return [Math.round((minX + maxX) * 0.5)];
    }

    const span = maxX - minX;
    const totalMinGap = minGap * (count - 1);
    const extraGap = Math.max(0, span - totalMinGap);
    const random = createSeededRng(seed);
    const weights = Array.from({ length: count - 1 }, () => 0.7 + random() * 1.1);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const positions = [minX];
    let x = minX;

    for (let i = 0; i < weights.length; i += 1) {
      x += minGap + (extraGap * weights[i]) / totalWeight;
      positions.push(x);
    }

    return positions.map((position) => Math.round(position));
  };

  const drawHero = (textureKey, palette, pose = {}) => {
    const bodyBob = pose.bodyBob ?? 0;
    const bodyShiftX = pose.bodyShiftX ?? 0;
    const torsoX = 24 + bodyShiftX;
    const torsoY = 39 + bodyBob;
    const headX = 33 + (pose.headX ?? 0) + bodyShiftX * 0.35;
    const headY = 24 + (pose.headY ?? 0) + bodyBob * 0.25;
    const shoulderLeftX = 25 + bodyShiftX;
    const shoulderRightX = 41 + bodyShiftX;
    const hipLeftX = 30 + bodyShiftX;
    const hipRightX = 38 + bodyShiftX;
    const makePoints = (baseX, baseY, offsets) => offsets.map(([offsetX, offsetY]) => ({
      x: baseX + offsetX,
      y: baseY + offsetY,
    }));
    const backArm = makePoints(shoulderLeftX, torsoY + 4, pose.backArm ?? [[0, 0], [-2, 11], [-1, 22]]);
    const frontArm = makePoints(shoulderRightX, torsoY + 4, pose.frontArm ?? [[0, 0], [2, 11], [3, 22]]);
    const backLeg = makePoints(hipLeftX, torsoY + 28, pose.backLeg ?? [[0, 0], [-1, 11], [-1, 20]]);
    const frontLeg = makePoints(hipRightX, torsoY + 28, pose.frontLeg ?? [[0, 0], [1, 11], [1, 20]]);
    const backFootToe = pose.backFootToe ?? Phaser.Math.Clamp(backLeg[2].x - backLeg[1].x, -2.5, 2.5);
    const frontFootToe = pose.frontFootToe ?? Phaser.Math.Clamp(frontLeg[2].x - frontLeg[1].x, -2.5, 2.5);

    g.clear();
    g.fillStyle(0x000000, 0);
    g.fillRect(0, 0, 64, 92);
    g.fillStyle(0x000000, pose.shadowAlpha ?? 0.13);
    g.fillEllipse(31, pose.shadowY ?? 88, pose.shadowWidth ?? 24, 8);

    drawLimb(backArm, 7, palette.sleeve);
    drawLimb(backLeg, 8, palette.pants);
    drawFoot(backLeg[2], backFootToe, palette.shoe);

    g.fillStyle(palette.shirt, 1);
    g.fillRoundedRect(torsoX, torsoY, 18, 30, 6);
    g.fillStyle(palette.pants, 1);
    g.fillRoundedRect(torsoX + 1, torsoY + 22, 16, 7, 3);
    g.fillRoundedRect(torsoX + 2, torsoY + 25, 5, 5, 2);
    g.fillRoundedRect(torsoX + 11, torsoY + 25, 5, 5, 2);
    g.fillStyle(palette.shirtAccent, 1);
    g.fillRoundedRect(torsoX + 4, torsoY + 3, 10, 20, 4);

    drawLimb(frontLeg, 8, palette.pants);
    drawFoot(frontLeg[2], frontFootToe, palette.shoe);
    drawLimb(frontArm, 7, palette.sleeve);
    g.fillStyle(palette.skin, 1);
    g.fillCircle(backArm[2].x, backArm[2].y, 3);
    g.fillCircle(frontArm[2].x, frontArm[2].y, 3);

    if (palette.hair != null && palette.silhouette === "woman") {
      g.fillStyle(palette.hair, 1);
      g.fillEllipse(headX - 7, headY + 5, 14, 24);
      g.fillEllipse(headX - 11, headY + 8, 8, 22);
      g.fillEllipse(headX - 2, headY + 9, 8, 18);
      if (palette.hairAccent != null) {
        g.fillStyle(palette.hairAccent, 0.26);
        g.fillEllipse(headX - 8, headY + 3, 8, 18);
      }
    }

    g.fillStyle(palette.skin, 1);
    g.fillEllipse(headX, headY, 22, 28);
    g.fillStyle(palette.nose, 1);
    g.fillTriangle(headX + 7, headY - 1, headX + 13, headY + 3, headX + 7, headY + 7);
    g.fillStyle(palette.eye, 1);
    g.fillCircle(headX + 5, headY, 1.7);
    g.lineStyle(2, palette.smile, 1);
    g.beginPath();
    g.moveTo(headX + 3, headY + 9);
    g.lineTo(headX + 7, headY + 10);
    g.strokePath();

    if (palette.beard != null) {
      g.fillStyle(palette.beard, 1);
      g.fillEllipse(headX - 1, headY + 8, 13, 8);
      g.fillTriangle(headX - 7, headY + 5, headX - 1, headY + 14, headX + 5, headY + 5);
    }

    if (palette.hair != null && palette.silhouette === "woman") {
      g.fillStyle(palette.hair, 1);
      g.fillRoundedRect(headX - 10, headY - 3, 6, 13, 3);
      g.fillEllipse(headX - 4, headY - 5, 10, 6);
    }

    g.fillStyle(palette.hat, 1);
    g.fillEllipse(headX - 1, headY - 9, 25, 12);
    g.fillRoundedRect(headX - 13, headY - 12, 20, 10, 4);
    g.fillRoundedRect(headX - 4, headY - 14, 8, 4, 2);
    g.fillStyle(palette.hatPanel, 0.36);
    g.fillTriangle(headX - 5, headY - 14, headX + 2, headY - 8, headX - 3, headY - 3);
    g.lineStyle(3, palette.brim, 1);
    g.beginPath();
    g.moveTo(headX + 2, headY - 6);
    g.lineTo(headX + 19, headY - 8);
    g.strokePath();

    g.generateTexture(textureKey, 64, 92);
  };

  const heroPoseDefinitions = [
    ["idle", {}],
    ["walk-1", {
      bodyBob: -1,
      bodyShiftX: -1,
      backArm: [[0, 0], [3, 10], [4, 20]],
      frontArm: [[0, 0], [-1, 12], [-3, 21]],
      backLeg: [[0, 0], [2, 10], [4, 18]],
      frontLeg: [[0, 0], [-2, 11], [-1, 20]],
    }],
    ["walk-2", {
      bodyBob: 0,
      backArm: [[0, 0], [1, 10], [2, 20]],
      frontArm: [[0, 0], [0, 11], [1, 21]],
      backLeg: [[0, 0], [1, 11], [1, 20]],
      frontLeg: [[0, 0], [0, 10], [2, 18]],
    }],
    ["walk-3", {
      bodyBob: -1,
      bodyShiftX: 1,
      backArm: [[0, 0], [-1, 12], [-3, 21]],
      frontArm: [[0, 0], [3, 10], [4, 20]],
      backLeg: [[0, 0], [-2, 11], [-1, 20]],
      frontLeg: [[0, 0], [2, 10], [4, 18]],
    }],
    ["walk-4", {
      bodyBob: 0,
      backArm: [[0, 0], [0, 11], [1, 21]],
      frontArm: [[0, 0], [1, 10], [2, 20]],
      backLeg: [[0, 0], [0, 10], [2, 18]],
      frontLeg: [[0, 0], [1, 11], [1, 20]],
    }],
    ["jump-rise", {
      bodyBob: -2,
      headY: -1,
      shadowAlpha: 0.08,
      shadowWidth: 18,
      backArm: [[0, 0], [0, 8], [-3, 15]],
      frontArm: [[0, 0], [2, 8], [5, 15]],
      backLeg: [[0, 0], [-1, 8], [-4, 14]],
      frontLeg: [[0, 0], [2, 8], [5, 14]],
    }],
    ["jump-peak", {
      bodyBob: -3,
      headY: -2,
      shadowAlpha: 0.06,
      shadowWidth: 16,
      backArm: [[0, 0], [-1, 7], [-5, 13]],
      frontArm: [[0, 0], [3, 7], [7, 13]],
      backLeg: [[0, 0], [-2, 7], [-5, 12]],
      frontLeg: [[0, 0], [3, 7], [6, 12]],
    }],
    ["jump-fall", {
      bodyBob: -1,
      headY: 1,
      shadowAlpha: 0.08,
      shadowWidth: 18,
      backArm: [[0, 0], [-3, 10], [-5, 19]],
      frontArm: [[0, 0], [4, 10], [6, 19]],
      backLeg: [[0, 0], [1, 12], [3, 20]],
      frontLeg: [[0, 0], [-1, 11], [-3, 19]],
    }],
    ["attack-jab", {
      bodyBob: -1,
      bodyShiftX: 1,
      backArm: [[0, 0], [-2, 9], [-4, 18]],
      frontArm: [[0, 0], [7, 2], [13, 4]],
      backLeg: [[0, 0], [-1, 11], [-1, 20]],
      frontLeg: [[0, 0], [2, 10], [4, 19]],
    }],
    ["attack-side", {
      bodyBob: -2,
      bodyShiftX: 2,
      headX: 1,
      backArm: [[0, 0], [-2, 8], [-3, 17]],
      frontArm: [[0, 0], [8, 1], [14, 2]],
      backLeg: [[0, 0], [-2, 11], [-3, 20]],
      frontLeg: [[0, 0], [3, 10], [6, 18]],
    }],
    ["attack-up", {
      bodyBob: -2,
      headY: -1,
      shadowAlpha: 0.08,
      shadowWidth: 18,
      backArm: [[0, 0], [-2, 5], [-4, -7]],
      frontArm: [[0, 0], [5, -6], [9, -18]],
      backLeg: [[0, 0], [-1, 11], [-2, 20]],
      frontLeg: [[0, 0], [2, 10], [3, 19]],
    }],
    ["attack-down", {
      bodyBob: 0,
      headY: 1,
      backArm: [[0, 0], [-1, 10], [-2, 18]],
      frontArm: [[0, 0], [3, 12], [10, 17]],
      backLeg: [[0, 0], [-3, 9], [-7, 16]],
      frontLeg: [[0, 0], [3, 8], [8, 14]],
      shadowWidth: 26,
      shadowAlpha: 0.1,
    }],
    ["attack-spin", {
      bodyBob: -3,
      headY: -1,
      shadowAlpha: 0.06,
      shadowWidth: 20,
      backArm: [[0, 0], [-6, 0], [-10, -8]],
      frontArm: [[0, 0], [6, 1], [10, -7]],
      backLeg: [[0, 0], [-4, 9], [-8, 15]],
      frontLeg: [[0, 0], [4, 9], [8, 15]],
    }],
    ["hurt", {
      bodyBob: -1,
      headY: 1,
      backArm: [[0, 0], [-4, 6], [-8, 14]],
      frontArm: [[0, 0], [4, 6], [8, 14]],
      backLeg: [[0, 0], [-2, 10], [-4, 20]],
      frontLeg: [[0, 0], [2, 10], [5, 20]],
    }],
    ["wave-1", {
      bodyBob: -1,
      bodyShiftX: -1,
      backArm: [[0, 0], [-1, 10], [-2, 20]],
      frontArm: [[0, 0], [5, -2], [8, -14]],
      backLeg: [[0, 0], [0, 10], [1, 20]],
      frontLeg: [[0, 0], [1, 10], [2, 19]],
    }],
    ["wave-2", {
      bodyBob: -2,
      bodyShiftX: -1,
      headY: -1,
      backArm: [[0, 0], [-2, 9], [-4, 18]],
      frontArm: [[0, 0], [4, -8], [1, -21]],
      backLeg: [[0, 0], [-1, 10], [-1, 20]],
      frontLeg: [[0, 0], [2, 10], [3, 19]],
    }],
    ["tip-1", {
      bodyBob: -1,
      backArm: [[0, 0], [-1, 10], [-2, 20]],
      frontArm: [[0, 0], [4, -4], [2, -13]],
      backLeg: [[0, 0], [0, 10], [1, 20]],
      frontLeg: [[0, 0], [1, 10], [2, 19]],
    }],
    ["tip-2", {
      bodyBob: -1,
      headY: -1,
      backArm: [[0, 0], [-2, 9], [-4, 18]],
      frontArm: [[0, 0], [5, -7], [1, -17]],
      backLeg: [[0, 0], [-1, 10], [-1, 20]],
      frontLeg: [[0, 0], [1, 10], [2, 19]],
    }],
    ["cheer", {
      bodyBob: -2,
      headY: -1,
      shadowAlpha: 0.1,
      backArm: [[0, 0], [-4, -5], [-8, -15]],
      frontArm: [[0, 0], [5, -5], [9, -15]],
      backLeg: [[0, 0], [-1, 10], [-2, 19]],
      frontLeg: [[0, 0], [1, 10], [3, 19]],
    }],
    ["peace-1", {
      bodyBob: -1,
      bodyShiftX: -1,
      headY: -1,
      backArm: [[0, 0], [-1, 10], [-2, 20]],
      frontArm: [[0, 0], [5, -4], [8, -13]],
      backLeg: [[0, 0], [0, 10], [1, 20]],
      frontLeg: [[0, 0], [1, 10], [2, 19]],
    }],
    ["peace-2", {
      bodyBob: -2,
      bodyShiftX: -1,
      headY: -2,
      backArm: [[0, 0], [-2, 9], [-4, 18]],
      frontArm: [[0, 0], [6, -7], [9, -18]],
      backLeg: [[0, 0], [-1, 10], [-1, 20]],
      frontLeg: [[0, 0], [1, 10], [2, 19]],
    }],
    ["shrug-1", {
      bodyBob: -1,
      backArm: [[0, 0], [-5, 3], [-8, 11]],
      frontArm: [[0, 0], [5, 3], [8, 11]],
      backLeg: [[0, 0], [0, 10], [1, 20]],
      frontLeg: [[0, 0], [1, 10], [2, 19]],
    }],
    ["shrug-2", {
      bodyBob: -2,
      headY: -1,
      backArm: [[0, 0], [-6, 1], [-9, 10]],
      frontArm: [[0, 0], [6, 1], [9, 10]],
      backLeg: [[0, 0], [-1, 10], [-1, 20]],
      frontLeg: [[0, 0], [1, 10], [2, 19]],
    }],
    ["jumpjack-1", {
      bodyBob: -1,
      headY: -1,
      backArm: [[0, 0], [-5, 1], [-10, 8]],
      frontArm: [[0, 0], [5, 1], [10, 8]],
      backLeg: [[0, 0], [-2, 10], [-4, 20]],
      frontLeg: [[0, 0], [2, 10], [4, 20]],
    }],
    ["jumpjack-2", {
      bodyBob: -4,
      headY: -2,
      shadowAlpha: 0.08,
      shadowWidth: 18,
      backArm: [[0, 0], [-6, -8], [-12, -18]],
      frontArm: [[0, 0], [6, -8], [12, -18]],
      backLeg: [[0, 0], [-4, 10], [-8, 20]],
      frontLeg: [[0, 0], [4, 10], [8, 20]],
    }],
    ["flip-1", {
      bodyBob: -2,
      headY: -1,
      shadowAlpha: 0.08,
      shadowWidth: 18,
      backArm: [[0, 0], [-3, 5], [-6, 12]],
      frontArm: [[0, 0], [3, 4], [6, 11]],
      backLeg: [[0, 0], [-2, 8], [-5, 14]],
      frontLeg: [[0, 0], [2, 8], [5, 14]],
    }],
    ["flip-2", {
      bodyBob: -4,
      headY: -2,
      shadowAlpha: 0.05,
      shadowWidth: 14,
      backArm: [[0, 0], [-5, 0], [-4, -6]],
      frontArm: [[0, 0], [5, 0], [4, -6]],
      backLeg: [[0, 0], [-3, 6], [-8, 8]],
      frontLeg: [[0, 0], [3, 6], [8, 8]],
    }],
    ["flip-3", {
      bodyBob: -2,
      headY: -1,
      shadowAlpha: 0.08,
      shadowWidth: 18,
      backArm: [[0, 0], [-4, 3], [-7, 10]],
      frontArm: [[0, 0], [4, 5], [7, 12]],
      backLeg: [[0, 0], [-3, 9], [-6, 15]],
      frontLeg: [[0, 0], [3, 7], [6, 13]],
    }],
  ];

  for (const variant of PLAYER_VARIANTS) {
    for (const [poseName, pose] of heroPoseDefinitions) {
      drawHero(heroTextureKey(variant.id, poseName), variant.palette, pose);
    }
  }
  const drawNpc = (textureKey, palette, pose = {}) => {
    const bodyBob = pose.bodyBob ?? 0;
    const bodyShiftX = pose.bodyShiftX ?? 0;
    const torsoX = 19 + bodyShiftX;
    const torsoY = 40 + bodyBob;
    const headX = 28 + (pose.headX ?? 0) + bodyShiftX * 0.35;
    const headY = 24 + (pose.headY ?? 0) + bodyBob * 0.2;
    const shoulderLeftX = 20 + bodyShiftX;
    const shoulderRightX = 35 + bodyShiftX;
    const hipLeftX = 24 + bodyShiftX;
    const hipRightX = 31 + bodyShiftX;
    const makePoints = (baseX, baseY, offsets) => offsets.map(([offsetX, offsetY]) => ({
      x: baseX + offsetX,
      y: baseY + offsetY,
    }));
    const backArm = makePoints(shoulderLeftX, torsoY + 4, pose.backArm ?? [[0, 0], [-1, 10], [-1, 18]]);
    const frontArm = makePoints(shoulderRightX, torsoY + 4, pose.frontArm ?? [[0, 0], [1, 10], [2, 18]]);
    const backLeg = makePoints(hipLeftX, torsoY + 24, pose.backLeg ?? [[0, 0], [0, 11], [0, 18]]);
    const frontLeg = makePoints(hipRightX, torsoY + 24, pose.frontLeg ?? [[0, 0], [1, 10], [1, 18]]);
    const backFootToe = pose.backFootToe ?? Phaser.Math.Clamp(backLeg[2].x - backLeg[1].x, -2, 2);
    const frontFootToe = pose.frontFootToe ?? Phaser.Math.Clamp(frontLeg[2].x - frontLeg[1].x, -2, 2);

    g.clear();
    g.fillStyle(0x000000, 0);
    g.fillRect(0, 0, 56, 88);
    g.fillStyle(0x000000, pose.shadowAlpha ?? 0.12);
    g.fillEllipse(28, pose.shadowY ?? 84, pose.shadowWidth ?? 22, 7);

    drawLimb(backArm, 6, palette.sleeve);
    drawLimb(backLeg, 7, palette.pants);
    drawFoot(backLeg[2], backFootToe);

    g.fillStyle(palette.shirt, 1);
    g.fillRoundedRect(torsoX, torsoY, 16, 24, 5);
    g.fillStyle(palette.accent, 1);
    g.fillRoundedRect(torsoX + 3, torsoY + 4, 10, 14, 4);
    g.fillStyle(palette.pants, 1);
    g.fillTriangle(torsoX, torsoY + 22, torsoX + 16, torsoY + 22, torsoX + 9, torsoY + 36);

    drawLimb(frontLeg, 7, palette.pants);
    drawFoot(frontLeg[2], frontFootToe);
    drawLimb(frontArm, 6, palette.sleeve);

    g.fillStyle(palette.skin, 1);
    g.fillCircle(backArm[2].x, backArm[2].y, 2.7);
    g.fillCircle(frontArm[2].x, frontArm[2].y, 2.7);
    g.fillEllipse(headX, headY, 18, 23);
    g.fillStyle(palette.hair, 1);
    g.fillEllipse(headX - 1, headY - 7, 24, 11);
    g.fillRoundedRect(headX - 10, headY - 7, 18, 5, 3);
    g.fillStyle(0x24303b, 1);
    g.fillCircle(headX + 3, headY - 1, 1.4);
    g.lineStyle(2, 0x7d5a45, 1);
    g.beginPath();
    g.moveTo(headX, headY + 7);
    g.lineTo(headX + 4, headY + 8);
    g.strokePath();

    g.generateTexture(textureKey, 56, 88);
  };

  [
    {
      key: "npc-sage",
      shirt: 0x69916d,
      accent: 0x9ac48d,
      sleeve: 0x446a52,
      pants: 0x5a7082,
      hair: 0x5c4536,
      skin: 0xe5c4a5,
    },
    {
      key: "npc-sun",
      shirt: 0xcf8751,
      accent: 0xf0bc72,
      sleeve: 0x8b5d39,
      pants: 0x6c6f88,
      hair: 0x40312a,
      skin: 0xdcb394,
    },
    {
      key: "npc-sea",
      shirt: 0x5a8fab,
      accent: 0x9ad0dc,
      sleeve: 0x3d6178,
      pants: 0x586977,
      hair: 0x2b3144,
      skin: 0xf0ceb0,
    },
  ].forEach((palette) => {
    drawNpc(`${palette.key}-idle`, palette);
    drawNpc(`${palette.key}-walk-1`, palette, {
      bodyBob: -1,
      bodyShiftX: -1,
      backArm: [[0, 0], [2, 9], [4, 17]],
      frontArm: [[0, 0], [-1, 9], [-3, 17]],
      backLeg: [[0, 0], [2, 10], [3, 18]],
      frontLeg: [[0, 0], [-2, 10], [-3, 18]],
    });
    drawNpc(`${palette.key}-walk-2`, palette, {
      bodyBob: 0,
      bodyShiftX: 1,
      backArm: [[0, 0], [-1, 9], [-3, 17]],
      frontArm: [[0, 0], [2, 9], [4, 17]],
      backLeg: [[0, 0], [-2, 10], [-3, 18]],
      frontLeg: [[0, 0], [2, 10], [3, 18]],
    });
    drawNpc(`${palette.key}-wave-1`, palette, {
      bodyBob: -1,
      bodyShiftX: -1,
      frontArm: [[0, 0], [6, -1], [8, -12]],
      backArm: [[0, 0], [-1, 10], [-2, 18]],
      frontLeg: [[0, 0], [1, 10], [2, 18]],
      backLeg: [[0, 0], [-1, 11], [-1, 18]],
    });
    drawNpc(`${palette.key}-wave-2`, palette, {
      bodyBob: -2,
      bodyShiftX: -1,
      headY: -1,
      frontArm: [[0, 0], [5, -8], [2, -20]],
      backArm: [[0, 0], [-2, 9], [-4, 17]],
      frontLeg: [[0, 0], [2, 10], [2, 18]],
      backLeg: [[0, 0], [-1, 10], [-2, 18]],
    });
  });

  const drawSparkBot = (textureKey, pose = {}) => {
    const bodyBob = pose.bodyBob ?? 0;
    const legSpread = pose.legSpread ?? 0;
    const armLift = pose.armLift ?? 0;
    const eyeBlink = pose.eyeBlink ?? 0;

    g.clear();
    g.fillStyle(0x000000, 0);
    g.fillRect(0, 0, 64, 88);
    g.fillStyle(0x000000, pose.shadowAlpha ?? 0.11);
    g.fillEllipse(31, 82, 24, 7);
    g.fillStyle(0x7bd9ff, 1);
    g.fillCircle(31, 16 + bodyBob, 4);
    g.fillStyle(0xe9fbff, 1);
    g.fillRoundedRect(19, 22 + bodyBob, 24, 28, 7);
    g.fillStyle(0xb7ebff, 1);
    g.fillRoundedRect(22, 25 + bodyBob, 18, 11, 4);
    g.fillStyle(0x27344a, 1);
    g.fillCircle(27, 31 + bodyBob, 1.6);
    g.fillCircle(35, 31 + bodyBob, 1.6);
    if (!eyeBlink) {
      g.lineStyle(2, 0x50a4d0, 1);
      g.beginPath();
      g.moveTo(26, 39 + bodyBob);
      g.lineTo(36, 39 + bodyBob);
      g.strokePath();
    }
    g.lineStyle(5, 0x8ab4d3, 1);
    g.beginPath();
    g.moveTo(21, 32 + bodyBob);
    g.lineTo(11, 36 + bodyBob + armLift);
    g.strokePath();
    g.beginPath();
    g.moveTo(43, 32 + bodyBob);
    g.lineTo(53, 36 + bodyBob - armLift);
    g.strokePath();
    g.lineStyle(6, 0x6d8aa8, 1);
    g.beginPath();
    g.moveTo(26, 50 + bodyBob);
    g.lineTo(23 - legSpread, 67);
    g.strokePath();
    g.beginPath();
    g.moveTo(36, 50 + bodyBob);
    g.lineTo(39 + legSpread, 67);
    g.strokePath();
    g.fillStyle(0x4c627d, 1);
    g.fillRoundedRect(15, 32 + bodyBob, 4, 6, 2);
    g.fillRoundedRect(45, 32 + bodyBob, 4, 6, 2);
    drawFoot({ x: 23 - legSpread, y: 67 }, -1.4, 0x44546c);
    drawFoot({ x: 39 + legSpread, y: 67 }, 1.4, 0x44546c);
    g.generateTexture(textureKey, 64, 88);
  };

  const drawPuffPal = (textureKey, pose = {}) => {
    const bodyBob = pose.bodyBob ?? 0;
    const bounce = pose.bounce ?? 0;
    const armLift = pose.armLift ?? 0;

    g.clear();
    g.fillStyle(0x000000, 0);
    g.fillRect(0, 0, 64, 88);
    g.fillStyle(0x000000, pose.shadowAlpha ?? 0.1);
    g.fillEllipse(31, 82, 24, 7);
    g.fillStyle(0xd4b2ff, 1);
    g.fillEllipse(31, 44 + bodyBob, 30, 28 - bounce);
    g.fillEllipse(21, 33 + bodyBob, 15, 15);
    g.fillEllipse(41, 33 + bodyBob, 15, 15);
    g.fillStyle(0xefdeff, 1);
    g.fillEllipse(29, 38 + bodyBob, 12, 9);
    g.fillStyle(0x2f2743, 1);
    g.fillCircle(26, 43 + bodyBob, 1.7);
    g.fillCircle(36, 43 + bodyBob, 1.7);
    g.lineStyle(2, 0x7c5ba0, 1);
    g.beginPath();
    g.moveTo(27, 49 + bodyBob);
    g.lineTo(35, 49 + bodyBob);
    g.strokePath();
    g.lineStyle(5, 0xbb8fff, 1);
    g.beginPath();
    g.moveTo(19, 49 + bodyBob);
    g.lineTo(12, 56 + bodyBob + armLift);
    g.strokePath();
    g.beginPath();
    g.moveTo(43, 49 + bodyBob);
    g.lineTo(50, 56 + bodyBob - armLift);
    g.strokePath();
    g.fillStyle(0x8a63bf, 1);
    g.fillEllipse(24, 67, 8, 5);
    g.fillEllipse(38, 67, 8, 5);
    g.generateTexture(textureKey, 64, 88);
  };

  drawSparkBot("enemy-bot-idle");
  drawSparkBot("enemy-bot-walk-1", { bodyBob: -1, legSpread: 2, armLift: -2 });
  drawSparkBot("enemy-bot-walk-2", { legSpread: -2, armLift: 2 });
  drawSparkBot("enemy-bot-bonk", { bodyBob: -1, armLift: 4, eyeBlink: 1 });
  drawPuffPal("enemy-blob-idle");
  drawPuffPal("enemy-blob-walk-1", { bodyBob: -1, bounce: 3, armLift: -2 });
  drawPuffPal("enemy-blob-walk-2", { bodyBob: 0, bounce: 1, armLift: 2 });
  drawPuffPal("enemy-blob-bonk", { bodyBob: -1, bounce: 4, armLift: 5 });

  g.clear();
  g.fillStyle(0x000000, 0);
  g.fillRect(0, 0, 42, 38);
  g.fillStyle(0xffffff, 0.35);
  g.fillEllipse(21, 18, 30, 24);
  g.fillStyle(0xf66f93, 1);
  g.fillCircle(15, 15, 7);
  g.fillCircle(27, 15, 7);
  g.fillTriangle(8, 18, 34, 18, 21, 32);
  g.generateTexture("emote-heart", 42, 38);
  g.clear();

  g.fillStyle(0x000000, 0);
  g.fillRect(0, 0, 42, 42);
  g.fillStyle(0xffffff, 0.34);
  g.fillCircle(21, 21, 15);
  g.fillStyle(0xffe48a, 1);
  g.fillCircle(21, 21, 7);
  g.fillTriangle(21, 7, 24, 17, 18, 17);
  g.fillTriangle(35, 21, 25, 24, 25, 18);
  g.fillTriangle(21, 35, 24, 25, 18, 25);
  g.fillTriangle(7, 21, 17, 24, 17, 18);
  g.fillTriangle(30, 12, 26, 19, 22, 15);
  g.fillTriangle(30, 30, 22, 27, 26, 23);
  g.fillTriangle(12, 30, 16, 23, 20, 27);
  g.fillTriangle(12, 12, 20, 15, 16, 19);
  g.generateTexture("emote-spark", 42, 42);
  g.clear();

  g.fillStyle(0x000000, 0);
  g.fillRect(0, 0, 42, 42);
  g.fillStyle(0xffffff, 0.34);
  g.fillCircle(21, 21, 15);
  g.fillStyle(0xffcf5d, 1);
  g.fillCircle(21, 21, 10);
  g.fillStyle(0x24303b, 1);
  g.fillCircle(17, 18, 1.7);
  g.fillCircle(25, 18, 1.7);
  g.lineStyle(2.2, 0x7d5a45, 1);
  g.beginPath();
  g.arc(21, 22, 5.8, Phaser.Math.DegToRad(18), Phaser.Math.DegToRad(162), false);
  g.strokePath();
  g.generateTexture("emote-smile", 42, 42);
  g.clear();

  g.fillStyle(0x000000, 0);
  g.fillRect(0, 0, 42, 42);
  g.fillStyle(0xffffff, 0.34);
  g.fillCircle(21, 21, 15);
  g.lineStyle(4.6, 0x7aa3ff, 1);
  g.beginPath();
  g.moveTo(17, 31);
  g.lineTo(17, 15);
  g.lineTo(28, 12);
  g.strokePath();
  g.fillStyle(0x7aa3ff, 1);
  g.fillCircle(17, 31, 3.6);
  g.fillCircle(27.5, 29, 3.4);
  g.fillCircle(28, 12, 2.6);
  g.generateTexture("emote-note", 42, 42);
  g.clear();

  g.fillStyle(0x000000, 0);
  g.fillRect(0, 0, 42, 42);
  g.fillStyle(0xffffff, 0.34);
  g.fillCircle(21, 21, 15);
  g.fillStyle(0xffb14f, 1);
  g.fillCircle(21, 21, 6);
  [
    [21, 6, 24, 15, 18, 15],
    [36, 21, 27, 24, 27, 18],
    [21, 36, 24, 27, 18, 27],
    [6, 21, 15, 24, 15, 18],
    [31, 11, 26, 19, 22, 15],
    [31, 31, 22, 27, 26, 23],
    [11, 31, 16, 23, 20, 27],
    [11, 11, 20, 15, 16, 19],
  ].forEach((points) => {
    g.fillTriangle(...points);
  });
  g.generateTexture("emote-burst", 42, 42);
  g.clear();

  g.fillStyle(0x000000, 0);
  g.fillRect(0, 0, 42, 42);
  g.fillStyle(0xffffff, 0.34);
  g.fillCircle(21, 21, 15);
  g.fillStyle(0x8fd7ff, 1);
  g.fillTriangle(21, 7, 25, 17, 17, 17);
  g.fillTriangle(35, 21, 25, 25, 25, 17);
  g.fillTriangle(21, 35, 25, 25, 17, 25);
  g.fillTriangle(7, 21, 17, 25, 17, 17);
  g.fillStyle(0xcff2ff, 1);
  g.fillCircle(21, 21, 5);
  g.generateTexture("emote-star", 42, 42);
  g.clear();

  g.fillStyle(0x000000, 0);
  g.fillRect(0, 0, 42, 42);
  g.fillStyle(0xffffff, 0.34);
  g.fillCircle(21, 21, 15);
  g.fillStyle(0xffc55b, 1);
  g.fillRoundedRect(18.5, 9, 5, 17, 2);
  g.fillCircle(21, 31, 3.4);
  g.fillStyle(0xffffff, 0.85);
  g.fillCircle(22, 13, 1.2);
  g.generateTexture("emote-alert", 42, 42);
  g.clear();

  g.clear();

  g.fillStyle(0xffffff, 0);
  g.fillRect(0, 0, 172, 92);
  g.fillStyle(0xffffff, 0.97);
  g.fillEllipse(38, 50, 48, 30);
  g.fillEllipse(74, 38, 58, 36);
  g.fillEllipse(112, 48, 52, 30);
  g.fillEllipse(144, 44, 42, 24);
  g.generateTexture("cloud", 172, 92);
  g.clear();

  const drawBird = (textureKey, pose) => {
    g.clear();
    g.fillStyle(0x000000, 0);
    g.fillRect(0, 0, 52, 30);
    g.fillStyle(0x34445a, 1);
    g.fillTriangle(28, 13 + pose.bodyLift, 8, pose.wingTipY, 24, 15 + pose.wingDrop);
    g.fillTriangle(28, 13 + pose.bodyLift, 48, pose.wingTipY + pose.trailingWingOffset, 32, 15 + pose.wingDrop);
    g.fillTriangle(23, 15 + pose.bodyLift, 14, 11 + pose.tailLift, 14, 18 + pose.tailLift);
    g.fillEllipse(27, 14 + pose.bodyLift, 12, 7);
    g.fillCircle(33, 13 + pose.headLift, 3.4);
    g.fillStyle(0x516274, 1);
    g.fillEllipse(28, 15 + pose.bodyLift, 8, 2.8);
    g.fillStyle(0x34445a, 1);
    g.fillTriangle(36, 13 + pose.headLift, 41, 14 + pose.headLift, 36, 15 + pose.headLift);
    g.generateTexture(textureKey, 52, 30);
  };

  drawBird("bird-up", {
    wingTipY: 5,
    trailingWingOffset: -2,
    wingDrop: -1,
    tailLift: -1,
    bodyLift: -1,
    headLift: -1,
  });
  drawBird("bird-mid", {
    wingTipY: 9,
    trailingWingOffset: 0,
    wingDrop: 0,
    tailLift: 0,
    bodyLift: 0,
    headLift: 0,
  });
  drawBird("bird-down", {
    wingTipY: 16,
    trailingWingOffset: 2,
    wingDrop: 2,
    tailLift: 1,
    bodyLift: 1,
    headLift: 0,
  });
  drawBird("bird-glide", {
    wingTipY: 11,
    trailingWingOffset: 0,
    wingDrop: 0,
    tailLift: 0,
    bodyLift: 0,
    headLift: 0,
  });

  // Clear the last bird pose before building the mountain tilesprite texture.
  g.clear();

  const backRidge = [
    [0, 184],
    [28, 178],
    [58, 169],
    [88, 160],
    [116, 148],
    [146, 136],
    [174, 126],
    [206, 114],
    [238, 98],
    [266, 90],
    [294, 98],
    [322, 92],
    [352, 98],
    [384, 114],
    [418, 108],
    [448, 95],
    [480, 103],
    [512, 118],
  ];
  g.fillStyle(0x69717c, 1);
  g.beginPath();
  g.moveTo(0, 240);
  for (const [x, y] of backRidge) {
    g.lineTo(x, y);
  }
  g.lineTo(512, 240);
  g.closePath();
  g.fillPath();

  const frontRidge = [
    [0, 194],
    [30, 186],
    [64, 182],
    [96, 170],
    [126, 164],
    [156, 156],
    [188, 144],
    [220, 132],
    [252, 126],
    [286, 132],
    [318, 128],
    [350, 138],
    [382, 146],
    [414, 142],
    [446, 130],
    [480, 138],
    [512, 150],
  ];
  g.fillStyle(0x7e7984, 0.96);
  g.beginPath();
  g.moveTo(0, 240);
  for (const [x, y] of frontRidge) {
    g.lineTo(x, y);
  }
  g.lineTo(512, 240);
  g.closePath();
  g.fillPath();

  g.fillStyle(0xa89fa5, 0.22);
  g.beginPath();
  g.moveTo(54, 190);
  g.lineTo(112, 172);
  g.lineTo(166, 152);
  g.lineTo(190, 156);
  g.lineTo(150, 182);
  g.lineTo(92, 198);
  g.closePath();
  g.fillPath();
  g.beginPath();
  g.moveTo(198, 168);
  g.lineTo(246, 124);
  g.lineTo(286, 118);
  g.lineTo(318, 126);
  g.lineTo(278, 152);
  g.lineTo(224, 178);
  g.closePath();
  g.fillPath();
  g.beginPath();
  g.moveTo(362, 176);
  g.lineTo(420, 152);
  g.lineTo(468, 136);
  g.lineTo(504, 146);
  g.lineTo(470, 168);
  g.lineTo(408, 188);
  g.closePath();
  g.fillPath();
  g.generateTexture("mountains", 512, 240);
  g.clear();

  const alpineBackRidge = [
    [0, 178],
    [62, 166],
    [128, 150],
    [192, 156],
    [260, 142],
    [326, 134],
    [396, 146],
    [470, 132],
    [536, 138],
    [606, 126],
    [680, 142],
    [760, 178],
  ];
  g.fillStyle(0x9cb0c9, 0.98);
  g.beginPath();
  g.moveTo(0, 240);
  for (const [x, y] of alpineBackRidge) {
    g.lineTo(x, y);
  }
  g.lineTo(760, 240);
  g.closePath();
  g.fillPath();

  const alpineFrontRidge = [
    [0, 204],
    [54, 190],
    [118, 182],
    [184, 164],
    [248, 170],
    [316, 154],
    [390, 166],
    [460, 148],
    [528, 154],
    [600, 140],
    [676, 158],
    [760, 204],
  ];
  g.fillStyle(0x7890b1, 0.98);
  g.beginPath();
  g.moveTo(0, 240);
  for (const [x, y] of alpineFrontRidge) {
    g.lineTo(x, y);
  }
  g.lineTo(760, 240);
  g.closePath();
  g.fillPath();

  g.fillStyle(0xf6fbff, 0.98);
  [
    [82, 168, 42, 26],
    [158, 148, 64, 36],
    [286, 138, 62, 32],
    [430, 140, 56, 30],
    [566, 128, 68, 34],
  ].forEach(([x, y, capWidth, capHeight]) => {
    g.fillTriangle(x, y + capHeight, x + capWidth * 0.5, y, x + capWidth, y + capHeight);
    g.fillTriangle(x + 10, y + capHeight - 6, x + capWidth * 0.5, y + 8, x + capWidth - 8, y + capHeight - 4);
  });
  g.fillStyle(0xd7e6f2, 0.66);
  g.fillRect(0, 184, 760, 56);
  g.generateTexture("alpine-backdrop", 760, 240);
  g.clear();

  for (const building of CITY_SKYLINE) {
    const y = 252 - building.height;
    g.fillStyle(0x50657a, 1);
    g.fillRect(building.x, y, building.width, building.height);
  }
  g.generateTexture("city-buildings", 728, 252);
  g.clear();

  const cityTreeXs = createRandomSpacedPositions(3, 68, 454, 132, 0xc1741);
  const cityTreeSpecs = [
    { trunkHeight: 72, canopy: 28 },
    { trunkHeight: 80, canopy: 32 },
    { trunkHeight: 76, canopy: 30 },
  ];
  for (let i = 0; i < cityTreeSpecs.length; i += 1) {
    const tree = cityTreeSpecs[i];
    const x = cityTreeXs[i];
    const topY = 192 - tree.trunkHeight;
    g.fillStyle(0x80573e, 1);
    g.fillRect(x - 6, topY, 12, tree.trunkHeight);
    g.fillStyle(0x5d8147, 1);
    g.fillCircle(x, topY - 16, tree.canopy);
    g.fillCircle(x - tree.canopy * 0.52, topY - 5, tree.canopy * 0.8);
    g.fillCircle(x + tree.canopy * 0.56, topY - 4, tree.canopy * 0.76);
  }
  g.generateTexture("city-trees", 640, 196);
  g.clear();

  g.fillStyle(0x6d4b34, 1);
  const pineStarts = createRandomSpacedPositions(3, 86, 544, 146, 0x91e5);
  const pineHeights = [112, 138, 122];
  for (let i = 0; i < pineStarts.length; i += 1) {
    const x = pineStarts[i];
    const top = 190 - pineHeights[i];
    g.fillRect(x - 6, 122, 12, 68);
    g.fillStyle(0x35513a, 1);
    g.fillTriangle(x - 34, 154, x, top, x + 34, 154);
    g.fillTriangle(x - 42, 174, x, top + 26, x + 42, 174);
    g.fillTriangle(x - 48, 194, x, top + 52, x + 48, 194);
    g.fillStyle(0x6d4b34, 1);
  }
  g.generateTexture("pine-trees", 640, 196);
  g.clear();

  const alpineTreeXs = createRandomSpacedPositions(4, 74, 606, 124, 0xa11e4);
  const alpineTreeHeights = [106, 132, 114, 126];
  for (let i = 0; i < alpineTreeXs.length; i += 1) {
    const x = alpineTreeXs[i];
    const top = 192 - alpineTreeHeights[i];
    g.fillStyle(0x6d5542, 1);
    g.fillRect(x - 5, 126, 10, 64);
    g.fillStyle(0x4d7b63, 1);
    g.fillTriangle(x - 34, 156, x, top, x + 34, 156);
    g.fillTriangle(x - 42, 174, x, top + 24, x + 42, 174);
    g.fillTriangle(x - 48, 194, x, top + 50, x + 48, 194);
    g.fillStyle(0xf6fbff, 0.94);
    g.fillTriangle(x - 12, top + 18, x, top + 4, x + 12, top + 18);
    g.fillTriangle(x - 18, top + 42, x - 2, top + 26, x + 16, top + 42);
    g.fillTriangle(x - 22, top + 68, x + 2, top + 48, x + 24, top + 68);
  }
  g.fillStyle(0x8f6a56, 1);
  g.fillRect(268, 152, 78, 38);
  g.fillStyle(0xf2f6fb, 1);
  g.fillTriangle(256, 152, 307, 126, 358, 152);
  g.fillStyle(0x8bb4df, 1);
  g.fillRoundedRect(298, 164, 16, 14, 3);
  g.generateTexture("alpine-trees", 680, 204);
  g.clear();

  g.fillStyle(0x57aecf, 1);
  g.fillRect(0, 0, 720, 188);
  g.fillStyle(0x7dd6e9, 0.24);
  [26, 64, 106, 146].forEach((y, index) => {
    g.fillRect(0, y, 720, index % 2 === 0 ? 3 : 2);
  });
  g.generateTexture("beach-water", 720, 188);
  g.clear();

  g.fillStyle(0xbff3ff, 0.18);
  [
    [18, 24, 96],
    [158, 24, 74],
    [298, 24, 118],
    [482, 24, 88],
    [618, 24, 104],
    [34, 58, 62],
    [154, 58, 122],
    [330, 58, 96],
    [474, 58, 72],
    [590, 58, 82],
    [16, 88, 104],
    [166, 88, 82],
    [296, 88, 132],
    [490, 88, 96],
    [626, 88, 88],
    [48, 122, 76],
    [182, 122, 118],
    [346, 122, 88],
    [474, 122, 108],
    [622, 122, 86],
    [24, 154, 92],
    [162, 154, 72],
    [294, 154, 122],
    [462, 154, 84],
    [586, 154, 110],
  ].forEach(([x, y, waveWidth]) => {
    g.fillRoundedRect(x, y, waveWidth, 4, 2);
  });
  g.fillStyle(0xe7fbff, 0.28);
  [
    [72, 114, 76],
    [238, 134, 94],
    [426, 106, 84],
    [572, 136, 88],
  ].forEach(([x, y, waveWidth]) => {
    g.fillRoundedRect(x, y, waveWidth, 5, 2);
  });
  g.generateTexture("beach-wave-lines", 720, 188);
  g.clear();

  g.fillStyle(0x5aa8c2, 1);
  g.fillRect(0, 120, 760, 120);
  g.fillStyle(0x88d4e4, 0.42);
  g.fillRect(0, 112, 760, 10);
  g.fillStyle(0x6f95ac, 0.5);
  g.beginPath();
  g.moveTo(0, 178);
  [
    [72, 164],
    [138, 172],
    [224, 156],
    [304, 166],
    [392, 154],
    [468, 168],
    [558, 158],
    [642, 170],
    [760, 178],
  ].forEach(([x, y]) => {
    g.lineTo(x, y);
  });
  g.lineTo(760, 240);
  g.lineTo(0, 240);
  g.closePath();
  g.fillPath();
  g.fillStyle(0x3f5b73, 0.9);
  g.fillRect(110, 146, 6, 44);
  g.fillRect(136, 152, 6, 38);
  g.fillRect(162, 158, 6, 32);
  g.fillRect(188, 162, 6, 28);
  g.fillRect(102, 142, 98, 8);
  g.fillStyle(0xb1ebf2, 0.22);
  [26, 66, 102, 136].forEach((y) => {
    g.fillRect(0, y, 760, 2);
  });
  g.generateTexture("boardwalk-backdrop", 760, 240);
  g.clear();

  const palmXs = createRandomSpacedPositions(3, 104, 618, 190, 0xb34c4);
  const palmSpecs = [
    { x: palmXs[0], trunkHeight: 118, canopyWidth: 54 },
    { x: palmXs[1], trunkHeight: 142, canopyWidth: 62 },
    { x: palmXs[2], trunkHeight: 126, canopyWidth: 58 },
  ];
  for (const palm of palmSpecs) {
    const baseY = 212;
    const topY = baseY - palm.trunkHeight;
    g.fillStyle(0x8d6546, 1);
    g.fillRoundedRect(palm.x - 6, topY, 12, palm.trunkHeight, 4);
    g.fillStyle(0x4e8157, 1);
    g.fillTriangle(palm.x - 2, topY + 6, palm.x - palm.canopyWidth, topY + 26, palm.x - 8, topY + 30);
    g.fillTriangle(palm.x + 2, topY + 6, palm.x + palm.canopyWidth, topY + 22, palm.x + 10, topY + 32);
    g.fillTriangle(palm.x, topY + 8, palm.x - 16, topY - 24, palm.x + 18, topY + 12);
    g.fillTriangle(palm.x, topY + 10, palm.x + 22, topY - 18, palm.x - 18, topY + 14);
    g.fillTriangle(palm.x - 4, topY + 12, palm.x - 48, topY - 6, palm.x - 6, topY + 22);
    g.fillTriangle(palm.x + 4, topY + 12, palm.x + 48, topY - 8, palm.x + 10, topY + 22);
  }
  g.fillStyle(0xde6d74, 1);
  g.fillTriangle(220, 170, 246, 144, 272, 170);
  g.fillStyle(0x6d5143, 1);
  g.fillRect(244, 170, 4, 34);
  g.fillStyle(0xf2dfad, 1);
  g.fillEllipse(250, 208, 76, 12);
  g.fillStyle(0xfff2d2, 0.8);
  g.fillEllipse(250, 200, 58, 5);
  g.generateTexture("beach-palms", 720, 220);
  g.clear();

  const boardwalkStorefronts = [
    { x: 20, width: 116, height: 82, body: 0xdab79b, roof: 0xbf6f58, awning: 0xf7d18f },
    { x: 154, width: 128, height: 94, body: 0xd3cadc, roof: 0x5f7fa4, awning: 0x8cd0dd },
    { x: 302, width: 120, height: 86, body: 0xd9c6a9, roof: 0x7d9c71, awning: 0xe8efb0 },
    { x: 446, width: 138, height: 92, body: 0xe2c2b3, roof: 0xb55b6f, awning: 0xf4b4ba },
    { x: 606, width: 114, height: 84, body: 0xd6d2c8, roof: 0x6c667d, awning: 0xf8de9b },
  ];
  for (const shop of boardwalkStorefronts) {
    const y = 214 - shop.height;
    g.fillStyle(shop.body, 1);
    g.fillRect(shop.x, y, shop.width, shop.height);
    g.fillStyle(shop.roof, 1);
    g.fillRoundedRect(shop.x - 6, y - 12, shop.width + 12, 16, 6);
    g.fillStyle(shop.awning, 1);
    g.fillRoundedRect(shop.x + 6, y + 8, shop.width - 12, 14, 5);
    g.fillStyle(0xffffff, 0.78);
    for (let wx = shop.x + 14; wx < shop.x + shop.width - 18; wx += 28) {
      g.fillRoundedRect(wx, y + 32, 14, 20, 3);
    }
    g.fillStyle(0x75584a, 1);
    g.fillRoundedRect(shop.x + shop.width * 0.5 - 10, y + shop.height - 40, 20, 40, 4);
    g.fillStyle(0xffe8a4, 1);
    for (let bulb = 0; bulb < 6; bulb += 1) {
      g.fillCircle(shop.x + 12 + bulb * ((shop.width - 24) / 5), y - 2, 2.2);
    }
  }
  g.fillStyle(0x6b4c39, 1);
  g.fillRect(0, 194, 760, 10);
  g.fillStyle(0x8b684e, 1);
  for (let x = 0; x <= 760; x += 34) {
    g.fillRect(x, 194, 8, 30);
  }
  g.generateTexture("boardwalk-shops", 760, 228);
  g.clear();

  for (const house of NEIGHBORHOOD_HOUSE_SPECS) {
    const y = 216 - house.height;
    g.fillStyle(house.body, 1);
    g.fillRect(house.x, y, house.width, house.height);
    g.fillStyle(house.roof, 1);
    g.fillTriangle(house.x - 8, y, house.x + house.width * 0.5, y - 30, house.x + house.width + 8, y);
    g.fillStyle(0x7a8794, 0.94);
    const windowTop = y + 18;
    for (let wx = house.x + 18; wx < house.x + house.width - 18; wx += 34) {
      g.fillRoundedRect(wx, windowTop, 16, 18, 3);
      g.fillRoundedRect(wx, windowTop + 28, 16, 18, 3);
    }
    g.fillStyle(0x6c5448, 1);
    g.fillRoundedRect(house.x + house.width * 0.5 - 10, y + house.height - 38, 20, 38, 4);
  }
  g.generateTexture("neighborhood-houses", 760, 236);
  g.clear();

  const neighborhoodTreeXs = createRandomSpacedPositions(5, 86, 676, 96, 0x4eed2);
  const neighborhoodTreeSpecs = [
    { x: neighborhoodTreeXs[0], trunkHeight: 58, canopy: 34 },
    { x: neighborhoodTreeXs[1], trunkHeight: 64, canopy: 38 },
    { x: neighborhoodTreeXs[2], trunkHeight: 54, canopy: 30 },
    { x: neighborhoodTreeXs[3], trunkHeight: 68, canopy: 40 },
    { x: neighborhoodTreeXs[4], trunkHeight: 60, canopy: 34 },
  ];
  for (const tree of neighborhoodTreeSpecs) {
    const baseY = 190;
    const topY = baseY - tree.trunkHeight;
    g.fillStyle(0x7d573d, 1);
    g.fillRect(tree.x - 5, topY, 10, tree.trunkHeight);
    g.fillStyle(0x5f8655, 1);
    g.fillCircle(tree.x, topY - 4, tree.canopy);
    g.fillCircle(tree.x - tree.canopy * 0.55, topY + 8, tree.canopy * 0.72);
    g.fillCircle(tree.x + tree.canopy * 0.55, topY + 8, tree.canopy * 0.72);
  }
  g.fillStyle(0x6f9157, 1);
  [
    [36, 154, 98, 22],
    [290, 160, 116, 18],
    [470, 158, 126, 20],
    [620, 156, 104, 22],
  ].forEach(([x, y, shrubWidth, shrubHeight]) => {
    g.fillRoundedRect(x, y, shrubWidth, shrubHeight, 8);
  });
  g.generateTexture("neighborhood-trees", 760, 196);
  g.clear();

  const desertBackdropHeight = 320;
  const desertBackDunes = [
    [0, 192],
    [58, 178],
    [116, 168],
    [178, 176],
    [238, 164],
    [304, 154],
    [372, 164],
    [442, 176],
    [520, 170],
    [594, 158],
    [666, 164],
    [760, 192],
  ];
  g.fillStyle(0xc3925c, 1);
  g.beginPath();
  g.moveTo(0, desertBackdropHeight);
  for (const [x, y] of desertBackDunes) {
    g.lineTo(x, y);
  }
  g.lineTo(760, desertBackdropHeight);
  g.closePath();
  g.fillPath();

  const desertFrontDunes = [
    [0, 212],
    [68, 198],
    [152, 190],
    [236, 204],
    [324, 194],
    [416, 182],
    [504, 194],
    [588, 206],
    [672, 194],
    [760, 212],
  ];
  g.fillStyle(0xe2b26c, 0.98);
  g.beginPath();
  g.moveTo(0, desertBackdropHeight);
  for (const [x, y] of desertFrontDunes) {
    g.lineTo(x, y);
  }
  g.lineTo(760, desertBackdropHeight);
  g.closePath();
  g.fillPath();
  g.fillStyle(0xd0a05e, 1);
  g.fillRect(0, 240, 760, desertBackdropHeight - 240);
  g.fillStyle(0xa36548, 0.82);
  g.fillRoundedRect(92, 128, 72, 44, 10);
  g.fillRoundedRect(108, 102, 42, 28, 8);
  g.fillRoundedRect(566, 122, 78, 50, 10);
  g.fillRoundedRect(584, 96, 40, 30, 8);
  g.generateTexture("desert-dunes", 760, desertBackdropHeight);
  g.clear();

  const desertPlantXs = createRandomSpacedPositions(4, 92, 608, 132, 0xd35e7);
  const desertPlantHeights = [82, 104, 90, 116];
  const drawJoshuaTree = (x, baseY, height, branchDirection) => {
    const trunkColor = 0x7a5d3b;
    const leafColor = 0x6f8b47;
    const tipColor = 0x89a65a;
    const trunkTopY = baseY - height;
    const trunkPoints = [
      { x, y: baseY },
      { x: x - 2, y: trunkTopY + 32 },
      { x: x + branchDirection * 5, y: trunkTopY },
    ];
    const lowerBranch = [
      { x: x + branchDirection * 3, y: trunkTopY + 34 },
      { x: x + branchDirection * 18, y: trunkTopY + 18 },
      { x: x + branchDirection * 30, y: trunkTopY + 8 },
    ];
    const upperBranch = [
      { x: x + branchDirection * 4, y: trunkTopY + 12 },
      { x: x - branchDirection * 10, y: trunkTopY - 2 },
      { x: x - branchDirection * 18, y: trunkTopY - 18 },
    ];

    drawLimb(trunkPoints, 10, trunkColor);
    drawLimb(lowerBranch, 7, trunkColor);
    drawLimb(upperBranch, 6, trunkColor);

    [
      { x: trunkPoints[2].x, y: trunkPoints[2].y - 4, size: 22 },
      { x: lowerBranch[2].x, y: lowerBranch[2].y - 2, size: 16 },
      { x: upperBranch[2].x, y: upperBranch[2].y - 2, size: 15 },
    ].forEach((tuft) => {
      g.fillStyle(leafColor, 1);
      g.fillEllipse(tuft.x, tuft.y, tuft.size, tuft.size * 0.58);
      g.fillEllipse(tuft.x - tuft.size * 0.26, tuft.y + 1, tuft.size * 0.58, tuft.size * 0.34);
      g.fillEllipse(tuft.x + tuft.size * 0.24, tuft.y - 1, tuft.size * 0.54, tuft.size * 0.32);
      g.fillStyle(tipColor, 0.92);
      g.fillTriangle(tuft.x - 3, tuft.y - 10, tuft.x, tuft.y - 18, tuft.x + 3, tuft.y - 10);
      g.fillTriangle(tuft.x - 10, tuft.y - 2, tuft.x - 15, tuft.y - 9, tuft.x - 6, tuft.y - 7);
      g.fillTriangle(tuft.x + 10, tuft.y - 2, tuft.x + 15, tuft.y - 9, tuft.x + 6, tuft.y - 7);
    });
  };

  for (let i = 0; i < desertPlantXs.length; i += 1) {
    const x = desertPlantXs[i];
    const height = desertPlantHeights[i];
    const baseY = 198;
    if (i === 2) {
      const topY = baseY - height;
      g.fillStyle(0x3f7041, 1);
      g.fillRoundedRect(x - 7, topY + 18, 14, height, 5);
      g.fillRoundedRect(x - 24, topY + 36, 14, 44, 5);
      g.fillRoundedRect(x + 10, topY + 50, 14, 38, 5);
      g.fillRoundedRect(x - 18, topY + 28, 10, 18, 4);
      g.fillRoundedRect(x + 12, topY + 40, 10, 16, 4);
    } else {
      drawJoshuaTree(x, baseY, height + (i === 1 ? 10 : 0), i % 2 === 0 ? 1 : -1);
    }
  }
  g.fillStyle(0x7e9250, 1);
  [
    [42, 186, 44],
    [210, 190, 36],
    [416, 186, 52],
    [560, 188, 40],
  ].forEach(([x, y, spread]) => {
    g.fillTriangle(x, y, x + spread * 0.5, y - 18, x + spread, y);
    g.fillTriangle(x + 10, y + 2, x + spread * 0.5, y - 12, x + spread - 8, y + 2);
  });
  g.generateTexture("desert-cacti", 680, 204);
  g.clear();

  const archesBackMesa = [
    [0, 202],
    [64, 194],
    [128, 168],
    [196, 158],
    [266, 170],
    [336, 160],
    [406, 148],
    [478, 162],
    [550, 156],
    [626, 142],
    [694, 164],
    [760, 202],
  ];
  g.fillStyle(0xc88961, 0.96);
  g.fillRect(0, 0, 760, 240);
  g.fillStyle(0xdfab79, 0.72);
  g.fillRect(0, 0, 760, 104);
  g.fillStyle(0xb87454, 0.55);
  g.fillRect(0, 104, 760, 48);
  g.fillStyle(0x9d5f46, 1);
  g.beginPath();
  g.moveTo(0, 240);
  for (const [x, y] of archesBackMesa) {
    g.lineTo(x, y);
  }
  g.lineTo(760, 240);
  g.closePath();
  g.fillPath();
  g.fillStyle(0xc68256, 0.92);
  g.fillRoundedRect(62, 104, 64, 84, 16);
  g.fillRoundedRect(74, 82, 42, 26, 10);
  g.fillRoundedRect(604, 94, 70, 98, 18);
  g.fillRoundedRect(620, 64, 40, 34, 12);
  g.generateTexture("arches-backdrop", 760, 240);
  g.clear();

  g.fillStyle(0xc2744f, 1);
  g.fillRoundedRect(128, 118, 46, 104, 12);
  g.fillRoundedRect(278, 126, 42, 96, 12);
  g.fillRoundedRect(156, 104, 138, 30, 12);
  g.fillStyle(0xd99663, 0.88);
  g.fillRoundedRect(172, 110, 104, 10, 5);
  g.fillStyle(0xad6447, 1);
  g.fillRoundedRect(414, 94, 54, 128, 16);
  g.fillRoundedRect(502, 134, 42, 88, 12);
  g.fillRoundedRect(590, 112, 64, 110, 18);
  g.fillStyle(0x6f844a, 1);
  [
    [38, 194, 40],
    [352, 190, 34],
    [702, 194, 38],
  ].forEach(([x, y, spread]) => {
    g.fillTriangle(x, y, x + spread * 0.5, y - 18, x + spread, y);
    g.fillTriangle(x + 8, y + 2, x + spread * 0.5, y - 12, x + spread - 6, y + 2);
  });
  g.generateTexture("arches-pillars", 760, 224);
  g.clear();

  g.fillStyle(0xdfc78e, 1);
  g.fillRect(0, 0, 128, 68);
  g.fillStyle(0xf5e6bb, 1);
  g.fillRect(0, 0, 128, 16);
  g.fillStyle(0xfbf3db, 0.86);
  g.fillRect(0, 18, 128, 4);
  g.fillStyle(0xcdb06d, 1);
  g.fillRect(0, 44, 128, 24);
  g.generateTexture("beach-ground", 128, 68);
  g.clear();

  g.fillStyle(0x8e8168, 1);
  g.fillRect(0, 0, 128, 68);
  g.fillStyle(0xa69a7a, 1);
  g.fillRect(0, 0, 128, 18);
  g.fillStyle(0x726650, 1);
  g.fillRect(0, 40, 128, 28);
  g.fillStyle(0xcabf9e, 1);
  g.fillRect(0, 42, 128, 14);
  g.fillStyle(0x8d836d, 1);
  g.fillRect(0, 56, 128, 12);
  g.generateTexture("city-ground", 128, 68);
  g.clear();

  g.fillStyle(0x907f5e, 1);
  g.fillRect(0, 0, 128, 68);
  g.fillStyle(0xa99972, 1);
  g.fillRect(0, 0, 128, 16);
  g.fillStyle(0x7d7052, 1);
  g.fillRect(0, 42, 128, 26);
  g.fillStyle(0xb9ab84, 1);
  g.fillRect(0, 44, 128, 10);
  g.fillStyle(0x6d644b, 0.9);
  [
    [14, 50, 10, 6],
    [58, 54, 14, 7],
    [104, 48, 12, 6],
  ].forEach(([x, y, rockWidth, rockHeight]) => {
    g.fillRoundedRect(x, y, rockWidth, rockHeight, 3);
  });
  g.generateTexture("mountain-ground", 128, 68);
  g.clear();

  g.fillStyle(0x799058, 1);
  g.fillRect(0, 0, 128, 68);
  g.fillStyle(0x90a96b, 1);
  g.fillRect(0, 0, 128, 18);
  g.fillStyle(0xbeb5a8, 1);
  g.fillRect(0, 42, 128, 18);
  g.fillStyle(0xe1d6c2, 1);
  g.fillRect(0, 60, 128, 8);
  g.generateTexture("neighborhood-ground", 128, 68);
  g.clear();

  g.fillStyle(0xd8af69, 1);
  g.fillRect(0, 0, 128, 68);
  g.fillStyle(0xe8c37c, 1);
  g.fillRect(0, 0, 128, 18);
  g.fillStyle(0xc89255, 1);
  g.fillRect(0, 42, 128, 26);
  g.fillStyle(0xa86f42, 0.9);
  [
    [12, 46, 10, 8],
    [54, 54, 16, 8],
    [96, 48, 12, 10],
  ].forEach(([x, y, rockWidth, rockHeight]) => {
    g.fillRoundedRect(x, y, rockWidth, rockHeight, 3);
  });
  g.generateTexture("desert-ground", 128, 68);
  g.clear();

  g.fillStyle(0xbf7a52, 1);
  g.fillRect(0, 0, 128, 68);
  g.fillStyle(0xd89565, 1);
  g.fillRect(0, 0, 128, 18);
  g.fillStyle(0x96563e, 1);
  g.fillRect(0, 40, 128, 28);
  g.fillStyle(0xe2ab76, 0.86);
  g.fillRect(0, 18, 128, 4);
  g.generateTexture("arches-ground", 128, 68);
  g.clear();

  g.fillStyle(0x9f7756, 1);
  g.fillRect(0, 0, 128, 68);
  g.fillStyle(0xc8996c, 1);
  g.fillRect(0, 0, 128, 14);
  g.fillStyle(0x7e5a41, 1);
  for (let plankX = 0; plankX < 128; plankX += 16) {
    g.fillRect(plankX, 14, 12, 54);
  }
  g.fillStyle(0x5f4331, 0.66);
  [18, 34, 50].forEach((y) => {
    g.fillRect(0, y, 128, 2);
  });
  g.generateTexture("boardwalk-ground", 128, 68);
  g.clear();

  g.fillStyle(0xe7f1fb, 1);
  g.fillRect(0, 0, 128, 68);
  g.fillStyle(0xf9fcff, 1);
  g.fillRect(0, 0, 128, 18);
  g.fillStyle(0xc8d8ea, 1);
  g.fillRect(0, 42, 128, 26);
  g.fillStyle(0xd7e4f1, 1);
  [
    [14, 48, 18, 6],
    [60, 54, 14, 5],
    [94, 46, 20, 7],
  ].forEach(([x, y, driftWidth, driftHeight]) => {
    g.fillRoundedRect(x, y, driftWidth, driftHeight, 3);
  });
  g.fillStyle(0xa7bfd6, 0.65);
  g.fillRect(0, 58, 128, 4);
  g.generateTexture("alpine-ground", 128, 68);
  g.clear();

  g.fillStyle(0x917d56, 1);
  g.fillRect(0, 0, 128, 68);
  g.fillStyle(0x735f41, 1);
  g.fillRect(0, 44, 128, 24);
  g.fillStyle(0xb39967, 1);
  g.fillRect(0, 52, 128, 8);
  g.generateTexture("ground", 128, 68);
  g.destroy();
}

function create() {
  activeScene = this;
  createSky(this);
  createParallax(this);
  createGround(this);
  createPlayer(this);
  createNPCs(this);
  createCombatSystems(this);
  createControls(this);
  createCamera(this);
  createControllerPanel();
  createPauseMenu(this);
  installArcadeHooks();
  registerGamepadListeners();
  syncGamepads(this);
  enableChillMode();
  updateDayNightCycle(this);
  updateParallax(this.cameras.main.scrollX, primaryPlayerState.actor.x);
}

function createSky(scene) {
  layers.skyTop = scene.add.rectangle(width * 0.5, height * 0.5, width, height, 0x8fcffd)
    .setScrollFactor(0)
    .setDepth(-20);
  layers.skyBottom = scene.add.rectangle(width * 0.5, height * 0.9, width, height * 0.38, 0xf1e5b9, 0.94)
    .setScrollFactor(0)
    .setDepth(-19);

  layers.sunDisk = scene.add.circle(0, 0, 24, 0xffd76e, 1);
  layers.sun = scene.add.container(width + 120, 96, [layers.sunDisk])
    .setScrollFactor(0)
    .setDepth(-18);

  layers.moonDisk = scene.add.circle(0, 0, 22, 0xf4f7ff, 1);
  layers.moonMask = scene.add.circle(10, -5, 20, 0x13203f, 1);
  layers.moon = scene.add.container(width + 120, 96, [layers.moonDisk, layers.moonMask])
    .setScrollFactor(0)
    .setDepth(-18);
}

function createParallax(scene) {
  layers.mountains = scene.add.tileSprite(0, groundY - 92, width, 240, "mountains")
    .setOrigin(0, 1)
    .setScrollFactor(0)
    .setDepth(-13)
    .setAlpha(0);

  layers.alpineBackdrop = scene.add.tileSprite(0, groundY - 88, width, 240, "alpine-backdrop")
    .setOrigin(0, 1)
    .setScrollFactor(0)
    .setDepth(-12.8)
    .setAlpha(0);

  layers.desertDunes = scene.add.tileSprite(0, groundY + 4, width, 320, "desert-dunes")
    .setOrigin(0, 1)
    .setScrollFactor(0)
    .setDepth(-12)
    .setAlpha(0);

  layers.archesBackdrop = scene.add.tileSprite(0, groundY - 88, width, 240, "arches-backdrop")
    .setOrigin(0, 1)
    .setScrollFactor(0)
    .setDepth(-12)
    .setAlpha(0);

  layers.beachWater = scene.add.tileSprite(0, groundY - 12, width, 188, "beach-water")
    .setOrigin(0, 1)
    .setScrollFactor(0)
    .setDepth(-12)
    .setAlpha(0);

  layers.boardwalkBackdrop = scene.add.tileSprite(0, groundY - 16, width, 240, "boardwalk-backdrop")
    .setOrigin(0, 1)
    .setScrollFactor(0)
    .setDepth(-11.8)
    .setAlpha(0);

  layers.beachWaveLines = scene.add.tileSprite(0, groundY - 12, width, 188, "beach-wave-lines")
    .setOrigin(0, 1)
    .setScrollFactor(0)
    .setDepth(-11.5)
    .setAlpha(0);

  layers.cityBuildings = scene.add.tileSprite(0, groundY - 8, width, 252, "city-buildings")
    .setOrigin(0, 1)
    .setScrollFactor(0)
    .setDepth(-11)
    .setAlpha(1);

  createCityLightsTexture(scene);
  layers.cityLights = scene.add.tileSprite(0, groundY - 8, width, 252, "city-lights")
    .setOrigin(0, 1)
    .setScrollFactor(0)
    .setDepth(-10)
    .setAlpha(0);

  layers.neighborhoodHouses = scene.add.tileSprite(0, groundY - 8, width, 236, "neighborhood-houses")
    .setOrigin(0, 1)
    .setScrollFactor(0)
    .setDepth(-10)
    .setAlpha(0);

  layers.boardwalkShops = scene.add.tileSprite(0, groundY + 4, width, 228, "boardwalk-shops")
    .setOrigin(0, 1)
    .setScrollFactor(0)
    .setDepth(-9.5)
    .setAlpha(0);

  createNeighborhoodLightsTexture(scene);
  layers.neighborhoodLights = scene.add.tileSprite(0, groundY - 8, width, 236, "neighborhood-lights")
    .setOrigin(0, 1)
    .setScrollFactor(0)
    .setDepth(-9)
    .setAlpha(0);

  layers.cityTrees = scene.add.tileSprite(0, groundY + 4, width, 196, "city-trees")
    .setOrigin(0, 1)
    .setScrollFactor(0)
    .setDepth(-9)
    .setAlpha(0.88);

  layers.beachPalms = scene.add.tileSprite(0, groundY + 8, width, 220, "beach-palms")
    .setOrigin(0, 1)
    .setScrollFactor(0)
    .setDepth(-9)
    .setAlpha(0);

  layers.pineTrees = scene.add.tileSprite(0, groundY + 4, width, 196, "pine-trees")
    .setOrigin(0, 1)
    .setScrollFactor(0)
    .setDepth(-8)
    .setAlpha(0);

  layers.alpineTrees = scene.add.tileSprite(0, groundY + 4, width, 204, "alpine-trees")
    .setOrigin(0, 1)
    .setScrollFactor(0)
    .setDepth(-8)
    .setAlpha(0);

  layers.neighborhoodTrees = scene.add.tileSprite(0, groundY + 4, width, 196, "neighborhood-trees")
    .setOrigin(0, 1)
    .setScrollFactor(0)
    .setDepth(-8)
    .setAlpha(0);

  layers.desertCacti = scene.add.tileSprite(0, groundY + 4, width, 204, "desert-cacti")
    .setOrigin(0, 1)
    .setScrollFactor(0)
    .setDepth(-8)
    .setAlpha(0);

  layers.archesPillars = scene.add.tileSprite(0, groundY + 4, width, 224, "arches-pillars")
    .setOrigin(0, 1)
    .setScrollFactor(0)
    .setDepth(-8)
    .setAlpha(0);

  const cloudSpecs = [
    { x: 210, y: 92, scale: 1.05, speed: 7, alpha: 0.88 },
    { x: 530, y: 148, scale: 0.82, speed: 10, alpha: 0.74 },
    { x: 780, y: 78, scale: 1.15, speed: 5, alpha: 0.82 },
    { x: 1030, y: 134, scale: 0.9, speed: 8, alpha: 0.66 },
    { x: 1320, y: 60, scale: 0.72, speed: 12, alpha: 0.56 },
  ];

  clouds = cloudSpecs.map((spec) => {
    const sprite = scene.add.image(spec.x, spec.y, "cloud")
      .setScale(spec.scale)
      .setAlpha(spec.alpha)
      .setScrollFactor(0)
      .setDepth(-16);
    return { ...spec, sprite };
  });

  birds = [];
  resetBirdSpawnTimer();
  scheduleCityLightShuffle(scene);
}

function createGround(scene) {
  const ground = scene.physics.add.staticGroup();
  for (let x = 64; x < worldWidth + 128; x += 128) {
    ground.create(x, groundY + 34, "ground").setDepth(-6).refreshBody();
  }
  layers.ground = ground;

  layers.cityGround = scene.add.tileSprite(0, groundY, width, 68, "city-ground")
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(-5)
    .setAlpha(0);

  layers.mountainGround = scene.add.tileSprite(0, groundY, width, 68, "mountain-ground")
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(-5)
    .setAlpha(0);

  layers.beachGround = scene.add.tileSprite(0, groundY, width, 68, "beach-ground")
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(-5)
    .setAlpha(0);

  layers.boardwalkGround = scene.add.tileSprite(0, groundY, width, 68, "boardwalk-ground")
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(-5)
    .setAlpha(0);

  layers.neighborhoodGround = scene.add.tileSprite(0, groundY, width, 68, "neighborhood-ground")
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(-5)
    .setAlpha(0);

  layers.desertGround = scene.add.tileSprite(0, groundY, width, 68, "desert-ground")
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(-5)
    .setAlpha(0);

  layers.alpineGround = scene.add.tileSprite(0, groundY, width, 68, "alpine-ground")
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(-5)
    .setAlpha(0);

  layers.archesGround = scene.add.tileSprite(0, groundY, width, 68, "arches-ground")
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(-5)
    .setAlpha(0);
}

function tintGroundTiles(tint) {
  layers.ground.children.iterate((tile) => {
    tile.setTint(tint);
  });
}

function createControls(scene) {
  cursors = scene.input.keyboard.createCursorKeys();
  movementKeys = scene.input.keyboard.addKeys({
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D,
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
  });
  attackKeys = scene.input.keyboard.addKeys({
    attackA: Phaser.Input.Keyboard.KeyCodes.J,
    attackB: Phaser.Input.Keyboard.KeyCodes.K,
  });
  chillKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
  emoteCycleKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
  controllerPanelKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
  pauseKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
}

function createCamera(scene) {
  const camera = scene.cameras.main;
  camera.setBounds(0, 0, worldWidth, height);
  camera.setBackgroundColor(0x8fcffd);
  camera.roundPixels = true;
  updateCamera(camera);
}

function createControllerPanel() {
  if (typeof document === "undefined") {
    return;
  }

  controllerPanel = document.getElementById("controller-panel");
  controllerPanelSummary = document.getElementById("controller-panel-summary");
  controllerPanelList = document.getElementById("controller-panel-list");
  if (controllerPanel) {
    controllerPanel.classList.toggle("is-visible", controllerPanelVisible);
  }
  updateControllerPanel();
}

function createPauseMenu(scene) {
  if (typeof document === "undefined") {
    return;
  }

  pauseMenu = document.getElementById("pause-menu");
  pauseMenuPlayerCountGrid = document.getElementById("pause-menu-player-count-grid");
  pauseMenuSlotGrid = document.getElementById("pause-menu-slot-grid");
  pauseMenuGrid = document.getElementById("pause-menu-grid");
  pauseMenuModeGrid = document.getElementById("pause-menu-mode-grid");
  pauseMenuCharacterSection = document.getElementById("pause-menu-character-section");
  pauseMenuCharacterToggleButton = document.getElementById("pause-menu-character-toggle");
  pauseMenuCharacterCloseButton = document.getElementById("pause-menu-character-close");
  pauseMenuControllerGrid = document.getElementById("pause-menu-controller-grid");
  pauseMenuControllerCopy = document.getElementById("pause-menu-controller-copy");
  pauseMenuControllerRefreshButton = document.getElementById("pause-menu-controller-refresh");
  pauseMenuHint = document.getElementById("pause-menu-hint");

  if (pauseMenuCharacterToggleButton) {
    pauseMenuCharacterToggleButton.addEventListener("click", () => {
      setCharacterSelectVisible(!characterSelectVisible);
    });
  }

  if (pauseMenuCharacterCloseButton) {
    pauseMenuCharacterCloseButton.addEventListener("click", () => {
      setCharacterSelectVisible(false);
    });
  }

  if (pauseMenuControllerRefreshButton) {
    pauseMenuControllerRefreshButton.addEventListener("click", () => {
      if (!activeScene) {
        return;
      }
      syncGamepads(activeScene);
      updatePauseMenu();
    });
  }

  updatePauseMenuControllerOptions();
  updatePauseMenu();
}

function installArcadeHooks() {
  window.__arcadeCabinetHooks = {
    onPauseOpen() {
      if (activeScene && !pauseMenuVisible) {
        freezeActorMotion(primaryPlayerState?.actor);
        for (const companion of companionPlayers.values()) {
          freezeActorMotion(companion.actor);
        }
        activeScene.physics.world.pause();
        activeScene.time.timeScale = 0;
      }
    },
    onPauseClose() {
      if (activeScene && !pauseMenuVisible) {
        activeScene.physics.world.resume();
        activeScene.time.timeScale = 1;
      }
    },
    getPauseActions() {
      return [
        {
          id: "party-setup",
          label: "Party Setup",
          run() {
            openPartySetupFromArcadeMenu();
          },
        },
      ];
    },
  };
}

function registerGamepadListeners() {
  if (gamepadListenersBound || typeof window === "undefined") {
    return;
  }

  const resyncGamepads = () => {
    if (activeScene) {
      syncGamepads(activeScene);
    } else {
      connectedGamepads = getConnectedGamepads();
      updateControllerPanel();
      updatePauseMenuControllerOptions(true);
      updatePauseMenu();
    }
  };

  window.addEventListener("gamepadconnected", resyncGamepads);
  window.addEventListener("gamepaddisconnected", resyncGamepads);
  window.addEventListener("focus", resyncGamepads);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      resyncGamepads();
    }
  });

  gamepadListenersBound = true;
}

function getPauseMenuControllerSignature() {
  return [
    ...joinedGamepadOrder.map((index) => `joined:${index}`),
    ...connectedGamepads.map((gamepad) => `${gamepad.index}:${gamepad.id}:${gamepad.mapping || "raw"}`),
  ].join("|");
}

function getControllerLabel(gamepad) {
  return `Controller ${gamepad.index + 1}`;
}

function getResolvedPlayerCount() {
  if (primaryGamepadIndex != null) {
    return Phaser.Math.Clamp(joinedGamepadOrder.length, 1, MAX_LOCAL_PLAYERS);
  }

  return 1;
}

function getDesiredCompanionAssignments() {
  const assignments = [];
  const companionControllers = joinedGamepadOrder.filter((index) => index !== primaryGamepadIndex);

  for (let slot = 1; slot < getResolvedPlayerCount(); slot += 1) {
    const controllerIndex = companionControllers[slot - 1];
    if (controllerIndex == null) {
      break;
    }
    assignments.push({
      key: controllerIndex,
      slot,
      type: "gamepad",
      controllerIndex,
    });
  }

  return assignments;
}

function getAvailableInputPlayerCount() {
  return Math.min(MAX_LOCAL_PLAYERS, Math.max(1, connectedGamepads.length));
}

function getCompanionAssignmentForSlot(slot) {
  return getDesiredCompanionAssignments().find((assignment) => assignment.slot === slot) ?? null;
}

function getPlayerSlotControllerCopy(slot) {
  if (slot === 0) {
    return primaryGamepadIndex == null
      ? "Keyboard driving P1"
      : `${getControllerLabel({ index: primaryGamepadIndex })} driving P1`;
  }

  const assignment = getCompanionAssignmentForSlot(slot);
  if (!assignment) {
    return `P${slot + 1} waiting for controller`;
  }

  return assignment.type === "keyboard"
    ? `Keyboard driving P${slot + 1}`
    : `${getControllerLabel({ index: assignment.controllerIndex })} driving P${slot + 1}`;
}

function syncCompanionAssignments() {
  if (!activeScene) {
    return;
  }

  desiredPlayerCount = getResolvedPlayerCount();
  selectedPlayerSlot = Phaser.Math.Clamp(selectedPlayerSlot, 0, desiredPlayerCount - 1);
  syncCompanionPlayers(activeScene, getDesiredCompanionAssignments());
}

function setSelectedPlayerSlot(slot) {
  selectedPlayerSlot = Phaser.Math.Clamp(slot, 0, desiredPlayerCount - 1);
  updatePauseMenu();
}

function setCharacterSelectVisible(isVisible) {
  characterSelectVisible = Boolean(isVisible);
  updatePauseMenu();
}

function setPlayerVariantForSlot(slot, variantId) {
  const variant = getPlayerVariant(variantId);
  playerSlotVariantIds[slot] = variant.id;

  const playerState = getPlayerStateBySlot(slot);
  if (playerState) {
    playerState.variantId = variant.id;
    playerState.walkCycle = 0;
    playerState.actor.setAngle(0);
    playerState.actor.setTexture(heroTextureKey(variant.id, "idle"));
    playerState.actor.clearTint();
  }

  characterSelectVisible = false;
  updatePauseMenu();
}

function renderPauseMenuPlayerCountOptions() {
  if (!pauseMenuPlayerCountGrid) {
    return;
  }

  pauseMenuPlayerCountGrid.innerHTML = "";
}

function renderPauseMenuModeOptions() {
  if (!pauseMenuModeGrid) {
    return;
  }

  pauseMenuModeGrid.innerHTML = GAME_MODES.map((mode) => `<button
    type="button"
    class="pause-menu__count-option${mode.id === gameMode ? " is-selected" : ""}"
    data-game-mode="${mode.id}"
  >${escapeHtml(mode.label)}</button>`).join("");

  pauseMenuModeGrid.querySelectorAll("[data-game-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextMode = button.getAttribute("data-game-mode");
      if (nextMode) {
        setGameMode(nextMode);
      }
    });
  });
}

function renderPauseMenuSlotOptions() {
  if (!pauseMenuSlotGrid) {
    return;
  }

  pauseMenuSlotGrid.innerHTML = Array.from({ length: desiredPlayerCount }, (_, slot) => {
    const variant = getPlayerVariant(getPlayerSlotVariant(slot));
    const previewSrc = getVariantPreviewSrc(variant.id);
    return `<button
      type="button"
      class="pause-menu__slot${slot === selectedPlayerSlot ? " is-selected" : ""}"
      data-player-slot="${slot}"
    >
      <span class="pause-menu__slot-badge">P${slot + 1}</span>
      <span class="pause-menu__preview-frame pause-menu__preview-frame--slot">
        ${previewSrc
          ? `<img class="pause-menu__character-preview" src="${previewSrc}" alt="${escapeHtml(variant.label)} preview" />`
          : `<span class="pause-menu__character-fallback">${escapeHtml(variant.label)}</span>`}
      </span>
      <span class="pause-menu__copy">
        <strong>${escapeHtml(variant.label)}</strong>
        <span>${escapeHtml(getPlayerSlotControllerCopy(slot))}</span>
      </span>
    </button>`;
  }).join("");

  pauseMenuSlotGrid.querySelectorAll("[data-player-slot]").forEach((button) => {
    button.addEventListener("click", () => {
      const slot = Number(button.getAttribute("data-player-slot"));
      if (!Number.isNaN(slot)) {
        setSelectedPlayerSlot(slot);
        setCharacterSelectVisible(true);
      }
    });
  });
}

function renderPauseMenuVariantOptions() {
  if (!pauseMenuGrid) {
    return;
  }

  const activeVariantId = getPlayerSlotVariant(selectedPlayerSlot);
  pauseMenuGrid.innerHTML = PLAYER_VARIANTS.map((variant) => {
    const previewSrc = getVariantPreviewSrc(variant.id);
    return `<button
      type="button"
      class="pause-menu__option${variant.id === activeVariantId ? " is-selected" : ""}"
      data-variant="${variant.id}"
    >
      <span class="pause-menu__preview-frame">
        ${previewSrc
          ? `<img class="pause-menu__character-preview" src="${previewSrc}" alt="${escapeHtml(variant.label)} preview" />`
          : `<span class="pause-menu__character-fallback">${escapeHtml(variant.label)}</span>`}
      </span>
      <span class="pause-menu__copy">
        <strong>${escapeHtml(variant.label)}</strong>
        <span>Assign to P${selectedPlayerSlot + 1}</span>
      </span>
    </button>`;
  }).join("");

  pauseMenuGrid.querySelectorAll("[data-variant]").forEach((button) => {
    button.addEventListener("click", () => {
      const variantId = button.getAttribute("data-variant");
      if (variantId) {
        setPlayerVariantForSlot(selectedPlayerSlot, variantId);
      }
    });
  });
}

function updatePauseMenuControllerOptions(force = false) {
  if (!pauseMenuControllerGrid) {
    return;
  }

  const signature = getPauseMenuControllerSignature();
  if (!force && signature === pauseMenuControllerSignature) {
    return;
  }
  pauseMenuControllerSignature = signature;

  const controllerOptions = connectedGamepads.map((gamepad) => ({
    badge:
      gamepad.index === primaryGamepadIndex
        ? "P1"
        : companionPlayers.has(gamepad.index)
          ? `P${companionPlayers.get(gamepad.index).slot + 1}`
          : "Ready",
    label: getControllerLabel(gamepad),
    meta: `${gamepad.id} - move or press a face button to join, Start opens cabinet menu`,
    selected: joinedGamepadOrder.includes(gamepad.index),
  }));

  if (controllerOptions.length === 0) {
    controllerOptions.push({
      badge: "Keyboard",
      label: "Keyboard fallback",
      meta: "Move: arrows or A/D. Jump: Space. Attack A: J. Attack B: K. Emote: Shift.",
      selected: true,
    });
  }

  pauseMenuControllerGrid.innerHTML = controllerOptions
    .map(
      (option) => `<button
        type="button"
        class="pause-menu__controller-option${option.selected ? " is-selected" : ""}"
        disabled
      >
        <span class="pause-menu__controller-badge">${escapeHtml(option.badge)}</span>
        <span class="pause-menu__controller-label">${escapeHtml(option.label)}</span>
        <span class="pause-menu__controller-meta">${escapeHtml(option.meta)}</span>
      </button>`,
    )
    .join("");

  if (pauseMenuControllerCopy) {
    pauseMenuControllerCopy.textContent =
      `${getControllerDiscoveryCopy()} Joined pads fill the player cards live. Bottom face button = Attack A. Left face button = Attack B. Right/top face = jump. Right stick click = chill.`;
  }
}

function toggleControllerPanel() {
  controllerPanelVisible = !controllerPanelVisible;
  if (controllerPanel) {
    controllerPanel.classList.toggle("is-visible", controllerPanelVisible);
  }
}

function updatePauseMenu() {
  if (!pauseMenu) {
    return;
  }

  pauseMenu.classList.toggle("is-visible", pauseMenuVisible);
  pauseMenu.setAttribute("aria-hidden", String(!pauseMenuVisible));
  if (pauseMenuCharacterSection) {
    pauseMenuCharacterSection.hidden = !characterSelectVisible;
  }
  if (pauseMenuCharacterToggleButton) {
    pauseMenuCharacterToggleButton.textContent = characterSelectVisible ? "Hide Character Select" : `Choose Character for P${selectedPlayerSlot + 1}`;
  }
  renderPauseMenuModeOptions();
  renderPauseMenuPlayerCountOptions();
  renderPauseMenuSlotOptions();
  if (characterSelectVisible) {
    renderPauseMenuVariantOptions();
  }
  if (pauseMenuControllerCopy) {
    pauseMenuControllerCopy.textContent =
      `${getControllerDiscoveryCopy()} Joined pads fill the player cards live. Bottom face button = Attack A. Left face button = Attack B. Right/top face = jump. Right stick click = chill.`;
  }
  if (pauseMenuHint) {
    const activeVariant = getPlayerVariant(getPlayerSlotVariant(selectedPlayerSlot));
    const modeMeta = getGameModeMeta();
    pauseMenuHint.textContent =
      `Mode: ${modeMeta.label}. P${selectedPlayerSlot + 1} is set to ${activeVariant.label}. ${getPlayerSlotControllerCopy(selectedPlayerSlot)}. Move a controller to join the next open slot. Esc to resume.`;
  }
  updatePauseMenuControllerOptions(true);
}

function freezeActorMotion(actor) {
  if (!actor?.body) {
    return;
  }

  actor.setVelocity(0, 0);
  actor.body.stop();
}

function setPauseMenuVisible(scene, isVisible) {
  pauseMenuVisible = Boolean(isVisible);

  if (pauseMenuVisible) {
    characterSelectVisible = false;
    freezeActorMotion(primaryPlayerState?.actor);
    for (const companion of companionPlayers.values()) {
      freezeActorMotion(companion.actor);
    }
    scene.physics.world.pause();
    scene.time.timeScale = 0;
  } else {
    scene.physics.world.resume();
    scene.time.timeScale = 1;
  }

  updatePauseMenu();
}

function togglePauseMenu(scene) {
  setPauseMenuVisible(scene, !pauseMenuVisible);
}

function closeArcadePauseMenu() {
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
}

function openPartySetupFromArcadeMenu() {
  closeArcadePauseMenu();
  window.setTimeout(() => {
    if (activeScene) {
      setPauseMenuVisible(activeScene, true);
    }
  }, 0);
}

function getGamepadsApi() {
  if (typeof navigator === "undefined") {
    return null;
  }

  if (typeof navigator.getGamepads === "function") {
    return navigator.getGamepads.bind(navigator);
  }

  if (typeof navigator.webkitGetGamepads === "function") {
    return navigator.webkitGetGamepads.bind(navigator);
  }

  return null;
}

function getConnectedGamepads() {
  const getGamepads = getGamepadsApi();
  if (!getGamepads) {
    return [];
  }

  return Array.from(getGamepads())
    .filter((gamepad) => gamepad && gamepad.connected)
    .sort((left, right) => left.index - right.index);
}

function getControllerDiscoveryCopy() {
  if (!getGamepadsApi()) {
    return "This browser does not expose the Gamepad API here, so keyboard is the only available input.";
  }

  if (connectedGamepads.length === 0) {
    return "No controllers detected yet. Click the game once, then press any button or D-pad on the connected Bluetooth controller to wake it up.";
  }

  return "Move a connected controller or press a face button to join the next open player slot. The first joined controller becomes P1.";
}

function isGamepadButtonDown(button) {
  return Boolean(button && (button.pressed || button.value > 0.5));
}

function getEmptyControllerInput() {
  return {
    connected: false,
    moveX: 0,
    left: false,
    right: false,
    leftPressed: false,
    rightPressed: false,
    strongLeft: false,
    strongRight: false,
    up: false,
    down: false,
    jumpHeld: false,
    jumpPressed: false,
    attackAHeld: false,
    attackAPressed: false,
    attackBHeld: false,
    attackBPressed: false,
    emoteHeld: false,
    emotePressed: false,
    chillHeld: false,
    chillTogglePressed: false,
    joinPressed: false,
    anyManualInput: false,
    id: "",
    mapping: "none",
  };
}

function buildControllerInput(gamepad, previousInput = getEmptyControllerInput()) {
  const axisX = gamepad.axes?.[0] ?? 0;
  const axisY = gamepad.axes?.[1] ?? 0;
  const left = axisX <= -GAMEPAD_DEADZONE || isGamepadButtonDown(gamepad.buttons?.[14]);
  const right = axisX >= GAMEPAD_DEADZONE || isGamepadButtonDown(gamepad.buttons?.[15]);
  const strongLeft = axisX <= -PLAYER_RUN_AXIS_THRESHOLD || (isGamepadButtonDown(gamepad.buttons?.[14]) && !right);
  const strongRight = axisX >= PLAYER_RUN_AXIS_THRESHOLD || (isGamepadButtonDown(gamepad.buttons?.[15]) && !left);
  const up = axisY <= -GAMEPAD_DEADZONE || isGamepadButtonDown(gamepad.buttons?.[12]);
  const down = axisY >= GAMEPAD_DEADZONE || isGamepadButtonDown(gamepad.buttons?.[13]);
  const attackAHeld = isGamepadButtonDown(gamepad.buttons?.[0]);
  const jumpHeld = isGamepadButtonDown(gamepad.buttons?.[1]) || isGamepadButtonDown(gamepad.buttons?.[3]);
  const attackBHeld = isGamepadButtonDown(gamepad.buttons?.[2]);
  const emoteHeld = isGamepadButtonDown(gamepad.buttons?.[4]) || isGamepadButtonDown(gamepad.buttons?.[5]);
  const chillHeld = isGamepadButtonDown(gamepad.buttons?.[11]);
  const anyManualInput = left || right || up || down || jumpHeld || attackAHeld || attackBHeld || emoteHeld;

  return {
    connected: true,
    index: gamepad.index,
    id: gamepad.id,
    mapping: gamepad.mapping || "raw",
    moveX: axisX,
    left,
    right,
    leftPressed: left && !previousInput.left,
    rightPressed: right && !previousInput.right,
    strongLeft,
    strongRight,
    up,
    down,
    jumpHeld,
    jumpPressed: jumpHeld && !previousInput.jumpHeld,
    attackAHeld,
    attackAPressed: attackAHeld && !previousInput.attackAHeld,
    attackBHeld,
    attackBPressed: attackBHeld && !previousInput.attackBHeld,
    emoteHeld,
    emotePressed: emoteHeld && !previousInput.emoteHeld,
    chillHeld,
    chillTogglePressed: chillHeld && !previousInput.chillHeld,
    joinPressed: anyManualInput && !previousInput.anyManualInput,
    anyManualInput,
  };
}

function getControllerInput(gamepadIndex) {
  return controllerStates.get(gamepadIndex) ?? getEmptyControllerInput();
}

function syncJoinedGamepads() {
  const connectedIndexes = new Set(connectedGamepads.map((gamepad) => gamepad.index));
  joinedGamepadOrder = joinedGamepadOrder.filter((index) => connectedIndexes.has(index));

  if (joinedGamepadOrder.length === 0 && connectedGamepads.length === 1) {
    joinedGamepadOrder = [connectedGamepads[0].index];
  }

  for (const gamepad of connectedGamepads) {
    if (joinedGamepadOrder.includes(gamepad.index)) {
      continue;
    }
    const input = controllerStates.get(gamepad.index);
    if (input?.joinPressed && joinedGamepadOrder.length < MAX_LOCAL_PLAYERS) {
      joinedGamepadOrder.push(gamepad.index);
    }
  }

  primaryGamepadIndex = joinedGamepadOrder[0] ?? null;
  desiredPlayerCount = getResolvedPlayerCount();
  selectedPlayerSlot = Phaser.Math.Clamp(selectedPlayerSlot, 0, desiredPlayerCount - 1);
}

function syncGamepads(scene) {
  const previousStates = controllerStates;
  connectedGamepads = getConnectedGamepads();
  controllerStates = new Map();

  for (const gamepad of connectedGamepads) {
    controllerStates.set(gamepad.index, buildControllerInput(gamepad, previousStates.get(gamepad.index)));
  }

  syncJoinedGamepads();
  syncCompanionPlayers(scene, getDesiredCompanionAssignments());
  updateControllerPanel();
  updatePauseMenuControllerOptions();
}

function syncCompanionPlayers(scene, desiredCompanionAssignments) {
  const desiredSet = new Set(desiredCompanionAssignments.map((assignment) => assignment.key));
  for (const [inputKey, companion] of companionPlayers.entries()) {
    if (!desiredSet.has(inputKey)) {
      companion.actor.destroy();
      companion.emote.destroy();
      companion.attackEffect.destroy();
      companionPlayers.delete(inputKey);
    }
  }

  desiredCompanionAssignments.forEach((assignment) => {
    const { key, slot, type, controllerIndex } = assignment;
    const variantId = getPlayerSlotVariant(slot);
    let companion = companionPlayers.get(key);
    if (!companion) {
      companion = createHeroState(scene, {
        id: `p${slot + 1}`,
        x: primaryPlayerState.actor.x - GAMEPAD_JOIN_SPACING * slot,
        tint: 0xffffff,
        depth: 2.9,
        variantId,
      });
      companionPlayers.set(key, companion);
    }

    companion.controllerIndex = controllerIndex;
    companion.inputType = type;
    companion.slot = slot;
    if (companion.variantId !== variantId) {
      companion.variantId = variantId;
      companion.walkCycle = 0;
      companion.actor.setAngle(0);
      companion.actor.setTexture(heroTextureKey(variantId, "idle"));
    }
    companion.actor.clearTint();
  });

  refreshPlayers();
}

function updateCompanionPlayers(scene, delta) {
  for (const companion of companionPlayers.values()) {
    const input = companion.inputType === "keyboard"
      ? buildKeyboardLeadInput()
      : getControllerInput(companion.controllerIndex);
    updateControlledPlayer(companion, input, { allowChill: false, toggledChillOn: false, delta });
  }
}

function isPlayerOnGround(playerState) {
  const body = playerState.actor.body;
  return body.blocked.down || body.touching.down;
}

function getClosestPlayerToX(x) {
  let closestPlayer = primaryPlayerState;
  let closestDistance = Math.abs(primaryPlayerState.actor.x - x);

  for (const playerState of companionPlayers.values()) {
    const distance = Math.abs(playerState.actor.x - x);
    if (distance < closestDistance) {
      closestPlayer = playerState;
      closestDistance = distance;
    }
  }

  return closestPlayer;
}

function getCameraFocusX() {
  if (players.length >= 3) {
    const activePlayerX = players
      .filter((playerState) => playerState.actor?.active)
      .map((playerState) => playerState.actor.x)
      .sort((left, right) => left - right);

    if (activePlayerX.length >= 2) {
      const secondLeadX = activePlayerX[activePlayerX.length - 2];
      const desiredScrollX = Math.max(0, secondLeadX - MULTIPLAYER_GROUP_CAMERA_THRESHOLD_X);
      return desiredScrollX + MULTIPLAYER_CAMERA_ANCHOR_X;
    }
  }

  if (players.length > 1) {
    let leadX = primaryPlayerState.actor.x;

    for (const companion of companionPlayers.values()) {
      leadX = Math.max(leadX, companion.actor.x);
    }

    return leadX;
  }

  let frontMostX = primaryPlayerState.actor.x;
  let weightedX = primaryPlayerState.actor.x * 1.3;
  let totalWeight = 1.3;

  for (const companion of companionPlayers.values()) {
    frontMostX = Math.max(frontMostX, companion.actor.x);
    const distance = Math.abs(companion.actor.x - frontMostX);
    if (distance > width * 0.8) {
      continue;
    }

    const weight = Phaser.Math.Linear(1, 0.25, distance / (width * 0.8));
    weightedX += companion.actor.x * weight;
    totalWeight += weight;
  }

  return Math.max(frontMostX - width * 0.16, weightedX / totalWeight);
}

function getCameraAnchorX() {
  return players.length > 1 ? MULTIPLAYER_CAMERA_ANCHOR_X : SINGLEPLAYER_CAMERA_ANCHOR_X;
}

function applyScreenDrag(camera, delta) {
  if (!players.length) {
    return;
  }

  const isCrowdedMultiplayer = players.length >= 3;
  const softLeftBound =
    camera.scrollX + (isCrowdedMultiplayer ? PLAYER_SCREEN_DRAG_SOFT_X_CROWDED : PLAYER_SCREEN_DRAG_SOFT_X);
  const hardLeftBound =
    camera.scrollX + (isCrowdedMultiplayer ? PLAYER_SCREEN_DRAG_HARD_X_CROWDED : PLAYER_SCREEN_DRAG_HARD_X);
  const softRightBound =
    camera.scrollX +
    (isCrowdedMultiplayer ? PLAYER_SCREEN_LEAD_SOFT_X_CROWDED : PLAYER_SCREEN_LEAD_SOFT_X);
  const hardRightBound =
    camera.scrollX +
    (isCrowdedMultiplayer ? PLAYER_SCREEN_LEAD_HARD_X_CROWDED : PLAYER_SCREEN_LEAD_HARD_X);

  for (const playerState of players) {
    const actor = playerState.actor;
    if (!actor?.active) {
      continue;
    }

    if (actor.x < hardLeftBound) {
      actor.x = hardLeftBound;
      if (actor.body) {
        actor.body.reset(actor.x, actor.y);
      }
      continue;
    }

    if (actor.x > hardRightBound) {
      actor.x = hardRightBound;
      if (actor.body) {
        actor.body.reset(actor.x, actor.y);
      }
      continue;
    }

    if (actor.x > softRightBound) {
      const distance = actor.x - softRightBound;
      const leashSpeed = Phaser.Math.Clamp(
        (isCrowdedMultiplayer ? PLAYER_SCREEN_DRAG_MIN_SPEED * 0.7 : PLAYER_SCREEN_DRAG_MIN_SPEED) +
          distance * (isCrowdedMultiplayer ? PLAYER_SCREEN_DRAG_CATCHUP * 0.65 : PLAYER_SCREEN_DRAG_CATCHUP) +
          (delta / 16.67) * 6,
        isCrowdedMultiplayer ? PLAYER_SCREEN_DRAG_MIN_SPEED * 0.7 : PLAYER_SCREEN_DRAG_MIN_SPEED,
        isCrowdedMultiplayer ? PLAYER_SCREEN_DRAG_MAX_SPEED * 0.75 : PLAYER_SCREEN_DRAG_MAX_SPEED,
      );
      actor.setVelocityX(Math.min(actor.body.velocity.x, -leashSpeed));
      continue;
    }

    if (actor.x >= softLeftBound) {
      continue;
    }

    const input = playerState.lastInput ?? getEmptyControllerInput();
    if (input.left && !input.right) {
      continue;
    }

    const distance = softLeftBound - actor.x;
    const catchupSpeed = Phaser.Math.Clamp(
      (isCrowdedMultiplayer ? PLAYER_SCREEN_DRAG_MIN_SPEED * 0.7 : PLAYER_SCREEN_DRAG_MIN_SPEED) +
        distance * (isCrowdedMultiplayer ? PLAYER_SCREEN_DRAG_CATCHUP * 0.65 : PLAYER_SCREEN_DRAG_CATCHUP) +
        (delta / 16.67) * 6,
      isCrowdedMultiplayer ? PLAYER_SCREEN_DRAG_MIN_SPEED * 0.7 : PLAYER_SCREEN_DRAG_MIN_SPEED,
      isCrowdedMultiplayer ? PLAYER_SCREEN_DRAG_MAX_SPEED * 0.75 : PLAYER_SCREEN_DRAG_MAX_SPEED,
    );
    actor.setVelocityX(Math.max(actor.body.velocity.x, catchupSpeed));
  }
}

function buildKeyboardLeadInput() {
  if (!cursors || !movementKeys || !attackKeys || !chillKey || !emoteCycleKey) {
    return getEmptyControllerInput();
  }

  const left = cursors.left.isDown || movementKeys.left.isDown;
  const right = cursors.right.isDown || movementKeys.right.isDown;
  const up = movementKeys.up.isDown;
  const down = movementKeys.down.isDown || cursors.down.isDown;
  const jumpHeld = cursors.up.isDown || movementKeys.jump.isDown;
  const attackAHeld = attackKeys.attackA.isDown;
  const attackBHeld = attackKeys.attackB.isDown;
  const emoteHeld = emoteCycleKey.isDown;
  const chillHeld = chillKey.isDown;

  return {
    connected: true,
    moveX: right ? 1 : left ? -1 : 0,
    left,
    right,
    leftPressed: Phaser.Input.Keyboard.JustDown(cursors.left) || Phaser.Input.Keyboard.JustDown(movementKeys.left),
    rightPressed: Phaser.Input.Keyboard.JustDown(cursors.right) || Phaser.Input.Keyboard.JustDown(movementKeys.right),
    strongLeft: false,
    strongRight: false,
    up,
    down,
    jumpHeld,
    jumpPressed: Phaser.Input.Keyboard.JustDown(cursors.up) || Phaser.Input.Keyboard.JustDown(movementKeys.jump),
    attackAHeld,
    attackAPressed: Phaser.Input.Keyboard.JustDown(attackKeys.attackA),
    attackBHeld,
    attackBPressed: Phaser.Input.Keyboard.JustDown(attackKeys.attackB),
    emoteHeld,
    emotePressed: Phaser.Input.Keyboard.JustDown(emoteCycleKey),
    chillHeld,
    chillTogglePressed: Phaser.Input.Keyboard.JustDown(chillKey),
    joinPressed: false,
    anyManualInput: left || right || up || down || jumpHeld || attackAHeld || attackBHeld || emoteHeld,
    id: "keyboard",
    mapping: "keyboard",
  };
}

function mergeInputs(...inputs) {
  return inputs.reduce((merged, input) => ({
    connected: merged.connected || input.connected,
    moveX: Math.abs(input.moveX ?? 0) > Math.abs(merged.moveX ?? 0) ? input.moveX : merged.moveX,
    left: merged.left || input.left,
    right: merged.right || input.right,
    leftPressed: merged.leftPressed || input.leftPressed,
    rightPressed: merged.rightPressed || input.rightPressed,
    strongLeft: merged.strongLeft || input.strongLeft,
    strongRight: merged.strongRight || input.strongRight,
    up: merged.up || input.up,
    down: merged.down || input.down,
    jumpHeld: merged.jumpHeld || input.jumpHeld,
    jumpPressed: merged.jumpPressed || input.jumpPressed,
    attackAHeld: merged.attackAHeld || input.attackAHeld,
    attackAPressed: merged.attackAPressed || input.attackAPressed,
    attackBHeld: merged.attackBHeld || input.attackBHeld,
    attackBPressed: merged.attackBPressed || input.attackBPressed,
    emoteHeld: merged.emoteHeld || input.emoteHeld,
    emotePressed: merged.emotePressed || input.emotePressed,
    chillHeld: merged.chillHeld || input.chillHeld,
    chillTogglePressed: merged.chillTogglePressed || input.chillTogglePressed,
    joinPressed: merged.joinPressed || input.joinPressed,
    anyManualInput: merged.anyManualInput || input.anyManualInput,
    id: merged.id || input.id,
    mapping: merged.mapping || input.mapping,
  }), getEmptyControllerInput());
}

function getAttackIntent(input, playerState) {
  let facing = playerState.facing;
  if (input.left && !input.right) {
    facing = -1;
  } else if (input.right && !input.left) {
    facing = 1;
  }

  let direction = "neutral";
  if (input.up) {
    direction = "up";
  } else if (input.down) {
    direction = "down";
  } else if (input.left !== input.right) {
    direction = "side";
  }

  return { direction, facing };
}

function getAttackProfile(buttonKind, direction) {
  return ATTACK_PROFILES[`${buttonKind}-${direction}`] ?? ATTACK_PROFILES[`${buttonKind}-neutral`];
}

function tryStartPlayerAttack(scene, playerState, buttonKind, input) {
  const attack = playerState.attack;
  if (!scene || !attack || attack.timer > 0 || attack.cooldown > 0 || playerState.stunTimer > 0) {
    return false;
  }

  const { direction, facing } = getAttackIntent(input, playerState);
  const profile = getAttackProfile(buttonKind, direction);
  playerState.facing = facing;
  playerState.actor.setFlipX(facing < 0);
  playerState.interaction.timer = 0;
  attack.timer = profile.duration;
  attack.duration = profile.duration;
  attack.cooldown = PLAYER_ATTACK_COOLDOWN;
  attack.direction = facing;
  attack.profileKey = `${buttonKind}-${direction}`;
  attack.profile = profile;
  attack.hitTargets.clear();

  if (profile.dashX) {
    playerState.actor.setVelocityX(facing * profile.dashX);
  } else {
    playerState.actor.setVelocityX(playerState.actor.body.velocity.x * 0.4);
  }

  if (profile.launchY) {
    playerState.actor.setVelocityY(-profile.launchY);
  }

  return true;
}

function updateControlledPlayer(playerState, input, { allowChill = false, toggledChillOn = false, delta = 0 } = {}) {
  const actor = playerState.actor;
  const onGround = isPlayerOnGround(playerState);
  const moveState = playerState.moveState;

  if (allowChill && !toggledChillOn && input.anyManualInput) {
    chillMode = false;
  }

  let resolvedInput = input;
  if (allowChill && chillMode) {
    resolvedInput = mergeInputs(input, getChillInput(delta, onGround));
  }

  if (resolvedInput.emotePressed) {
    triggerPlayerManualEmote(playerState);
  }

  if (resolvedInput.attackAPressed) {
    tryStartPlayerAttack(activeScene, playerState, "a", resolvedInput);
  }
  if (resolvedInput.attackBPressed) {
    tryStartPlayerAttack(activeScene, playerState, "b", resolvedInput);
  }

  if (playerState.stunTimer > 0) {
    actor.setVelocityX(actor.body.velocity.x * 0.88);
    playerState.lastInput = resolvedInput;
    return;
  }

  if (playerState.attack.timer > 0) {
    actor.setVelocityX(actor.body.velocity.x * 0.92);
    playerState.lastInput = resolvedInput;
    return;
  }

  let moveLeft = resolvedInput.left;
  let moveRight = resolvedInput.right;
  let jumpPressed = resolvedInput.jumpPressed;
  moveState.lastTapTimer = Math.max(0, moveState.lastTapTimer - delta);

  if (resolvedInput.leftPressed) {
    const shouldRun = resolvedInput.strongLeft
      || (moveState.lastTapDir === -1 && moveState.lastTapTimer > 0);
    moveState.lastTapDir = -1;
    moveState.lastTapTimer = PLAYER_RUN_DOUBLE_TAP_WINDOW;
    moveState.runDir = shouldRun ? -1 : (moveState.runDir === -1 ? 0 : moveState.runDir);
  }

  if (resolvedInput.rightPressed) {
    const shouldRun = resolvedInput.strongRight
      || (moveState.lastTapDir === 1 && moveState.lastTapTimer > 0);
    moveState.lastTapDir = 1;
    moveState.lastTapTimer = PLAYER_RUN_DOUBLE_TAP_WINDOW;
    moveState.runDir = shouldRun ? 1 : (moveState.runDir === 1 ? 0 : moveState.runDir);
  }

  if (moveLeft && moveRight) {
    moveState.runDir = 0;
  }

  if (moveLeft && !moveRight) {
    const moveSpeed = moveState.runDir === -1 ? PLAYER_RUN_SPEED : PLAYER_WALK_SPEED;
    actor.setVelocityX(-moveSpeed);
    actor.setFlipX(true);
    playerState.facing = -1;
  } else if (moveRight && !moveLeft) {
    const moveSpeed = moveState.runDir === 1 ? PLAYER_RUN_SPEED : PLAYER_WALK_SPEED;
    actor.setVelocityX(moveSpeed);
    actor.setFlipX(false);
    playerState.facing = 1;
  } else {
    moveState.runDir = 0;
    actor.setVelocityX(0);
  }

  if (jumpPressed && onGround) {
    actor.setVelocityY(-PLAYER_JUMP_VELOCITY);
  }

  playerState.lastInput = resolvedInput;
}

function getActorBounds(actor) {
  if (actor?.body) {
    return {
      left: actor.body.x,
      right: actor.body.x + actor.body.width,
      top: actor.body.y,
      bottom: actor.body.y + actor.body.height,
    };
  }

  return {
    left: actor.x - actor.displayWidth * 0.5,
    right: actor.x + actor.displayWidth * 0.5,
    top: actor.y - actor.displayHeight * 0.5,
    bottom: actor.y + actor.displayHeight * 0.5,
  };
}

function rectanglesOverlap(left, right) {
  return left.left <= right.right && left.right >= right.left && left.top <= right.bottom && left.bottom >= right.top;
}

function getAttackHitbox(playerState, profile, facing) {
  const centerX = playerState.actor.x + facing * profile.offsetX;
  const centerY = playerState.actor.y + profile.offsetY;
  return {
    left: centerX - profile.width * 0.5,
    right: centerX + profile.width * 0.5,
    top: centerY - profile.height * 0.5,
    bottom: centerY + profile.height * 0.5,
  };
}

function spawnCombatBurst(scene, x, y, textureKey, tint = 0xffffff) {
  const burst = scene.add.image(x, y, textureKey)
    .setDepth(7)
    .setScale(0.76)
    .setTint(tint)
    .setAlpha(0.94);
  scene.tweens.add({
    targets: burst,
    y: y - 28,
    alpha: 0,
    scale: 1.08,
    duration: 360,
    ease: "Quad.out",
    onComplete: () => burst.destroy(),
  });
}

function applyHitToPlayer(scene, attacker, target, profile, facing) {
  if (target.invulnerableTimer > 0 || !target.actor.active) {
    return false;
  }

  target.attack.timer = 0;
  target.attack.profile = null;
  target.attackEffect.setAlpha(0);
  target.interaction.timer = 0;
  target.stunTimer = PLAYER_HIT_STUN;
  target.invulnerableTimer = PLAYER_INVULNERABLE_TIME;
  target.actor.setVelocityX(facing * profile.knockbackX);
  target.actor.setVelocityY(-profile.knockbackY);
  target.facing = facing < 0 ? 1 : -1;
  spawnCombatBurst(scene, target.actor.x, target.actor.y - 74, "emote-star", 0xfff1a8);
  return true;
}

function defeatEnemy(scene, enemy) {
  spawnCombatBurst(scene, enemy.actor.x, enemy.actor.y - 52, "emote-burst", enemy.kind === "bot" ? 0x8fd7ff : 0xffd0f2);
  enemy.actor.destroy();
}

function tryStompEnemy(scene, playerState, enemy) {
  if (!enemy.actor.active || !playerState.actor.active || playerState.stunTimer > 0) {
    return false;
  }

  const playerBody = playerState.actor.body;
  const enemyBounds = getActorBounds(enemy.actor);
  const playerBounds = getActorBounds(playerState.actor);
  const previousBottom = playerBody.prev ? playerBody.prev.y + playerBody.height : playerBounds.bottom;
  const falling = playerBody.velocity.y >= ENEMY_STOMP_MIN_FALL_SPEED;
  const overlapping = rectanglesOverlap(playerBounds, enemyBounds);
  const enteringFromAbove = previousBottom <= enemyBounds.top + 8;
  const closeToTop = playerBounds.bottom <= enemyBounds.top + ENEMY_STOMP_TOP_TOLERANCE;

  if (!falling || !overlapping || !enteringFromAbove || !closeToTop) {
    return false;
  }

  playerState.actor.setVelocityY(-ENEMY_STOMP_BOUNCE_VELOCITY);
  playerState.actor.setVelocityX(playerState.actor.body.velocity.x * 0.92);
  playerState.facing = Math.sign(playerState.actor.body.velocity.x) || playerState.facing || 1;
  setPlayerInteraction(playerState, "cheer", "emote-star");
  defeatEnemy(scene, enemy);
  return true;
}

function applyHitToEnemy(scene, enemy, profile, facing) {
  if (!enemy.actor.active) {
    return false;
  }

  enemy.hp -= profile.damage;
  enemy.hitTimer = 220;
  enemy.contactCooldown = ENEMY_CONTACT_COOLDOWN * 0.4;
  enemy.actor.setVelocityX(facing * profile.knockbackX * 0.7);
  enemy.actor.setVelocityY(-profile.knockbackY * 0.72);
  spawnCombatBurst(scene, enemy.actor.x, enemy.actor.y - 52, enemy.hp <= 0 ? "emote-star" : "emote-spark", 0xfff0ad);

  if (enemy.hp <= 0) {
    defeatEnemy(scene, enemy);
  }

  return true;
}

function updatePlayerAttackState(scene, playerState, delta) {
  playerState.attack.cooldown = Math.max(0, playerState.attack.cooldown - delta);
  playerState.stunTimer = Math.max(0, playerState.stunTimer - delta);
  playerState.invulnerableTimer = Math.max(0, playerState.invulnerableTimer - delta);
  playerState.actor.setAlpha(
    playerState.invulnerableTimer > 0
      ? 0.76 + Math.sin(scene.time.now * 0.05 + playerState.slot) * 0.18
      : 1,
  );

  const attack = playerState.attack;
  if (attack.timer <= 0 || !attack.profile) {
    playerState.attackEffect.setAlpha(0);
    return;
  }

  attack.timer = Math.max(0, attack.timer - delta);
  const elapsed = attack.duration - attack.timer;
  const active = elapsed >= attack.profile.activeStart && elapsed <= attack.profile.activeEnd;
  const hitbox = getAttackHitbox(playerState, attack.profile, attack.direction);
  const progress = Phaser.Math.Clamp(elapsed / attack.duration, 0, 1);
  const pulse = 0.74 + Math.sin(progress * Math.PI) * 0.28;

  playerState.attackEffect
    .setPosition(
      playerState.actor.x + attack.direction * attack.profile.offsetX,
      playerState.actor.y + attack.profile.offsetY,
    )
    .setSize(attack.profile.effectWidth * pulse, attack.profile.effectHeight * (1 + pulse * 0.06))
    .setAngle(attack.profile.effectAngle * attack.direction)
    .setFillStyle(attack.profile.effectColor, active ? 0.28 : 0.16)
    .setStrokeStyle(2, 0xffffff, active ? 0.32 : 0.16)
    .setAlpha(attack.timer > 0 ? (active ? 0.92 : 0.5) : 0);

  if (!active) {
    if (attack.timer <= 0) {
      attack.profile = null;
      playerState.attackEffect.setAlpha(0);
    }
    return;
  }

  if (gameMode === "ffa") {
    for (const target of players) {
      if (target === playerState || attack.hitTargets.has(target.id) || !target.actor.active) {
        continue;
      }

      if (rectanglesOverlap(hitbox, getActorBounds(target.actor)) && applyHitToPlayer(scene, playerState, target, attack.profile, attack.direction)) {
        attack.hitTargets.add(target.id);
      }
    }
  } else {
    for (const enemy of enemies) {
      if (attack.hitTargets.has(enemy.id) || !enemy.actor.active) {
        continue;
      }

      if (rectanglesOverlap(hitbox, getActorBounds(enemy.actor)) && applyHitToEnemy(scene, enemy, attack.profile, attack.direction)) {
        attack.hitTargets.add(enemy.id);
      }
    }
  }

  if (attack.timer <= 0) {
    attack.profile = null;
    playerState.attackEffect.setAlpha(0);
  }
}

function updatePlayerCombat(scene, delta) {
  for (const playerState of players) {
    updatePlayerAttackState(scene, playerState, delta);
  }
}

function chooseEnemyKind(sceneType) {
  if (sceneType === "city" || sceneType === "neighborhood" || sceneType === "boardwalk") {
    return Math.random() < 0.75 ? "bot" : "blob";
  }
  if (sceneType === "arches" || sceneType === "desert") {
    return Math.random() < 0.3 ? "bot" : "blob";
  }
  if (sceneType === "alpine") {
    return Math.random() < 0.4 ? "bot" : "blob";
  }

  return Math.random() < 0.5 ? "bot" : "blob";
}

function getSceneTypeAtX(worldX) {
  return getSceneTypeAtSegment(
    Phaser.Math.Clamp(Math.floor(worldX / SCENE_SEGMENT_WIDTH), 0, TOTAL_SCENE_SEGMENTS - 1),
  );
}

function getNearestEnemyThreat(x, y, maxDistance = Infinity) {
  let nearest = null;
  let nearestScore = Infinity;

  for (const enemy of enemies) {
    if (!enemy.actor.active) {
      continue;
    }

    const dx = enemy.actor.x - x;
    const dy = Math.abs(enemy.actor.y - y);
    if (Math.abs(dx) > maxDistance || dy > NPC_MONSTER_FEAR_VERTICAL_RANGE) {
      continue;
    }

    const score = Math.abs(dx) + dy * 0.35;
    if (score < nearestScore) {
      nearest = enemy;
      nearestScore = score;
    }
  }

  return nearest
    ? {
      enemy: nearest,
      dx: nearest.actor.x - x,
      dy: nearest.actor.y - y,
      distance: nearestScore,
    }
    : null;
}

function spawnEnemy(scene) {
  if (gameMode !== "coop" || players.length === 0) {
    return false;
  }

  const focusX = getCameraFocusX();
  const nearbyEnemyCount = enemies.reduce((count, enemy) => (
    enemy.actor.active && Math.abs(enemy.actor.x - focusX) <= ENEMY_DESPAWN_DISTANCE * 0.55
      ? count + 1
      : count
  ), 0);
  if (nearbyEnemyCount >= ENEMY_MAX_ACTIVE) {
    return false;
  }

  const leadDirection = primaryPlayerState?.facing >= 0 ? 1 : -1;
  const spawnDirection = Math.random() < 0.74 ? leadDirection : -leadDirection;
  const spawnX = Phaser.Math.Clamp(
    focusX + spawnDirection * Phaser.Math.Between(Math.round(width * 0.48), Math.round(width * 0.68)),
    80,
    worldWidth - 80,
  );
  const kind = chooseEnemyKind(getSceneTypeAtX(spawnX));
  const textureBase = kind === "bot" ? "enemy-bot" : "enemy-blob";
  const actor = scene.physics.add.image(
    spawnX,
    kind === "bot" ? groundY - 58 : groundY - 54,
    `${textureBase}-idle`,
  );
  actor.setBounce(0.01);
  actor.setCollideWorldBounds(true);
  actor.setDepth(2.8);
  if (kind === "bot") {
    actor.body.setSize(24, 44).setOffset(20, 20);
  } else {
    actor.body.setSize(28, 40).setOffset(18, 24);
  }
  scene.physics.add.collider(actor, layers.ground);

  enemies.push({
    id: `enemy-${enemyIdCounter += 1}`,
    kind,
    textureBase,
    actor,
    hp: Phaser.Math.Between(3, 5),
    maxHp: 5,
    facing: spawnDirection > 0 ? -1 : 1,
    walkCycle: 0,
    moveSpeed: Phaser.Math.Between(ENEMY_MOVE_SPEED_MIN, ENEMY_MOVE_SPEED_MAX),
    hitTimer: 0,
    contactCooldown: Phaser.Math.Between(400, 900),
  });

  return true;
}

function bonkPlayerFromEnemy(scene, enemy, playerState) {
  if (playerState.invulnerableTimer > 0) {
    return;
  }

  const direction = Math.sign(playerState.actor.x - enemy.actor.x) || 1;
  playerState.attack.timer = 0;
  playerState.attack.profile = null;
  playerState.attackEffect.setAlpha(0);
  playerState.stunTimer = PLAYER_HIT_STUN;
  playerState.invulnerableTimer = PLAYER_INVULNERABLE_TIME;
  playerState.actor.setVelocityX(direction * 210);
  playerState.actor.setVelocityY(-180);
  setPlayerInteraction(playerState, "shrug", "emote-burst");
  enemy.contactCooldown = ENEMY_CONTACT_COOLDOWN;
  enemy.hitTimer = 120;
  enemy.actor.setVelocityX(-direction * 130);
  spawnCombatBurst(scene, playerState.actor.x, playerState.actor.y - 72, "emote-burst", 0xffedaa);
}

function updateEnemies(scene, delta) {
  if (gameMode !== "coop") {
    if (enemies.length > 0) {
      clearEnemies();
    }
    return;
  }

  enemySpawnTimer -= delta;
  if (enemySpawnTimer <= 0) {
    const spawned = spawnEnemy(scene);
    resetEnemySpawnTimer(!spawned);
  }

  const focusX = getCameraFocusX();
  enemies = enemies.filter((enemy) => {
    if (!enemy.actor.active) {
      return false;
    }

    const nearestPlayer = getClosestPlayerToX(enemy.actor.x);
    if (!nearestPlayer) {
      enemy.actor.destroy();
      return false;
    }

    if (
      Math.abs(nearestPlayer.actor.x - enemy.actor.x) > ENEMY_DESPAWN_DISTANCE
      && Math.abs(focusX - enemy.actor.x) > ENEMY_DESPAWN_DISTANCE * 0.85
    ) {
      enemy.actor.destroy();
      return false;
    }

    for (const playerState of players) {
      if (tryStompEnemy(scene, playerState, enemy)) {
        return false;
      }
    }

    enemy.hitTimer = Math.max(0, enemy.hitTimer - delta);
    enemy.contactCooldown = Math.max(0, enemy.contactCooldown - delta);
    const target = nearestPlayer;
    const direction = Math.sign(target.actor.x - enemy.actor.x) || enemy.facing;
    const distance = Math.abs(target.actor.x - enemy.actor.x);
    const closeEnough = distance <= ENEMY_CONTACT_RANGE && Math.abs(target.actor.y - enemy.actor.y) < 74;

    if (enemy.hitTimer <= 0) {
      if (closeEnough) {
        enemy.actor.setVelocityX(0);
        enemy.walkCycle = 0;
        if (enemy.contactCooldown <= 0) {
          bonkPlayerFromEnemy(scene, enemy, target);
        }
      } else {
        enemy.actor.setVelocityX(direction * enemy.moveSpeed);
        enemy.facing = direction;
        enemy.walkCycle += delta;
      }
    } else {
      enemy.actor.setVelocityX(enemy.actor.body.velocity.x * 0.9);
    }

    const moving = Math.abs(enemy.actor.body.velocity.x) > 12;
    if (enemy.hitTimer > 0) {
      enemy.actor.setTexture(`${enemy.textureBase}-bonk`);
    } else if (moving) {
      const frame = Math.floor(enemy.walkCycle / 170) % 2;
      enemy.actor.setTexture(`${enemy.textureBase}-walk-${frame + 1}`);
    } else {
      enemy.actor.setTexture(`${enemy.textureBase}-idle`);
    }
    enemy.actor.setFlipX(enemy.facing < 0);
    enemy.actor.setTint(enemy.hitTimer > 0 ? 0xfff1ba : 0xffffff);

    return true;
  });
}

function updateControllerPanel() {
  if (!controllerPanelSummary || !controllerPanelList) {
    return;
  }

  if (controllerPanel) {
    controllerPanel.classList.toggle("is-visible", controllerPanelVisible);
  }

  const leadLabel = primaryGamepadIndex == null ? "Keyboard fallback active" : `P1 uses controller ${primaryGamepadIndex + 1}`;
  const modeLabel = getGameModeMeta().label;
  controllerPanelSummary.textContent =
    `${leadLabel}. Mode: ${modeLabel}. Party size: ${desiredPlayerCount}. Move: left stick or D-pad. Double-tap on keyboard or push the stick hard to run. Attack A: bottom face button. Attack B: left face button. Jump: right/top face button. Emote: shoulder buttons or Shift. Chill: right stick click or C. ${getControllerDiscoveryCopy()} Press G to toggle this panel.`;

  if (connectedGamepads.length === 0) {
    controllerPanelList.innerHTML = "<div class=\"controller-panel__empty\">No controllers connected yet. Press a button on the controller while this tab is focused.</div>";
    return;
  }

  controllerPanelList.innerHTML = connectedGamepads
    .map((gamepad) => {
      const role =
        gamepad.index === primaryGamepadIndex
          ? "P1 lead"
          : companionPlayers.has(gamepad.index)
            ? `P${companionPlayers.get(gamepad.index).slot + 1}`
            : "Ready to join";
      const mapping = gamepad.mapping || "raw";
      return `<div class="controller-panel__item"><strong>${role}</strong><span>${escapeHtml(
        gamepad.id,
      )}</span><span class="controller-panel__meta">${mapping} mapping</span></div>`;
    })
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function update(_, delta) {
  if (!primaryPlayerState || !cursors || !movementKeys || !attackKeys || !chillKey || !emoteCycleKey || !controllerPanelKey || !pauseKey) {
    return;
  }

  if (Phaser.Input.Keyboard.JustDown(pauseKey)) {
    togglePauseMenu(this);
  }

  syncGamepads(this);

  if (pauseMenuVisible) {
    return;
  }

  if (Phaser.Input.Keyboard.JustDown(controllerPanelKey)) {
    toggleControllerPanel();
  }

  const lead = primaryPlayerState;
  const leadInput = primaryGamepadIndex == null
    ? buildKeyboardLeadInput()
    : getControllerInput(primaryGamepadIndex);
  const toggledChillOn = leadInput.chillTogglePressed;
  if (toggledChillOn) {
    enableChillMode();
  }

  updateControlledPlayer(lead, leadInput, { allowChill: true, toggledChillOn, delta });
  const leadOnGround = isPlayerOnGround(lead);
  updateCompanionPlayers(this, delta);
  beachWavePhase += delta;
  updateDayNightCycle(this);
  updateClouds(delta);
  updateBirds(this, delta);
  updateEnemies(this, delta);
  updatePlayerCombat(this, delta);
  updateNPCs(this, delta);
  updatePlayerInteraction(this, delta, lead);
  updatePlayerAnimation(lead, delta, leadOnGround);
  for (const companion of companionPlayers.values()) {
    updatePlayerInteraction(this, delta, companion);
    updatePlayerAnimation(companion, delta, isPlayerOnGround(companion));
  }
  updateCamera(this.cameras.main);
  applyScreenDrag(this.cameras.main, delta);
  updateCamera(this.cameras.main);
  updateParallax(this.cameras.main.scrollX, getCameraFocusX());
}

function createPlayer(scene) {
  primaryPlayerState = createHeroState(scene, {
    id: "p1",
    x: SINGLEPLAYER_CAMERA_ANCHOR_X,
    tint: 0xffffff,
    depth: 3,
    variantId: getPlayerSlotVariant(0),
  });
  players = [primaryPlayerState];
  player = primaryPlayerState.actor;
  scene.physics.world.setBounds(0, 0, worldWidth, height);
}

function createHeroState(scene, { id, x, tint, depth, variantId = DEFAULT_PLAYER_VARIANT }) {
  const resolvedVariantId = getPlayerVariant(variantId).id;
  const actor = scene.physics.add.image(x, groundY - 74, heroTextureKey(resolvedVariantId, "idle"));
  actor.setBounce(0.02);
  actor.setCollideWorldBounds(true);
  actor.setDepth(depth);
  actor.body.setSize(18, 66).setOffset(23, 14);
  if (tint != null && tint !== 0xffffff) {
    actor.setTint(tint);
  } else {
    actor.clearTint();
  }

  const interaction = {
    timer: 0,
    waveTimer: 0,
    style: "wave",
    emoteKey: "emote-heart",
  };
  const emote = scene.add.image(actor.x, actor.y - 84, interaction.emoteKey)
    .setDepth(depth + 2)
    .setAlpha(0)
    .setScale(0.86);
  const attackEffect = scene.add.ellipse(actor.x, actor.y - 30, 40, 18, 0xffd364, 0)
    .setDepth(depth + 1)
    .setStrokeStyle(2, 0xffffff, 0);

  scene.physics.add.collider(actor, layers.ground);

  return {
    id,
    actor,
    emote,
    attackEffect,
    tint,
    variantId: resolvedVariantId,
    facing: 1,
    walkCycle: 0,
    interaction,
    attack: {
      timer: 0,
      cooldown: 0,
      duration: 0,
      direction: 1,
      profileKey: "",
      profile: null,
      hitTargets: new Set(),
    },
    stunTimer: 0,
    invulnerableTimer: 0,
    controllerIndex: null,
    inputType: "gamepad",
    slot: 0,
    lastInput: getEmptyControllerInput(),
    moveState: {
      lastTapDir: 0,
      lastTapTimer: 0,
      runDir: 0,
    },
  };
}

function refreshPlayers() {
  players = [primaryPlayerState, ...Array.from(companionPlayers.values()).sort((a, b) => a.slot - b.slot)];
}

function createCombatSystems() {
  enemies = [];
  enemyIdCounter = 0;
  resetEnemySpawnTimer();
}

function resetEnemySpawnTimer(retrySoon = false) {
  enemySpawnTimer = retrySoon
    ? Phaser.Math.Between(ENEMY_SPAWN_RETRY_DELAY_MIN, ENEMY_SPAWN_RETRY_DELAY_MAX)
    : Phaser.Math.Between(ENEMY_SPAWN_DELAY_MIN, ENEMY_SPAWN_DELAY_MAX);
}

function clearEnemies() {
  for (const enemy of enemies) {
    enemy.actor.destroy();
  }
  enemies = [];
}

function getGameModeMeta(modeId = gameMode) {
  return GAME_MODES.find((mode) => mode.id === modeId) ?? GAME_MODES[0];
}

function setGameMode(modeId) {
  if (!GAME_MODES.some((mode) => mode.id === modeId) || gameMode === modeId) {
    return;
  }

  gameMode = modeId;
  if (gameMode !== "coop") {
    clearEnemies();
  } else {
    resetEnemySpawnTimer();
  }

  updatePauseMenu();
  updateControllerPanel();
}

function createNPCs(scene) {
  const paletteKeys = ["npc-sage", "npc-sun", "npc-sea"];
  const emoteKeys = ["emote-heart", "emote-spark"];
  const random = createSeededRng(0x4e50a2);
  const npcSpecs = [];

  for (let segmentIndex = 0; segmentIndex < TOTAL_SCENE_SEGMENTS; segmentIndex += 1) {
    const sceneType = getSceneTypeAtSegment(segmentIndex);
    const segmentStart = segmentIndex * SCENE_SEGMENT_WIDTH;
    const roamLeft = segmentStart + 520;
    const roamRight = segmentStart + SCENE_SEGMENT_WIDTH - 520;
    const pairCenter = segmentStart + SCENE_SEGMENT_WIDTH * (0.46 + random() * 0.12);
    const separation = 112 + random() * 36;
    const pairId = `segment-${segmentIndex}`;
    const paletteOffset = Math.floor(random() * paletteKeys.length);
    const emoteOffset = Math.floor(random() * emoteKeys.length);
    const groundOffset =
      sceneType === "beach" || sceneType === "boardwalk"
        ? 8
        : sceneType === "desert"
          ? 4
          : sceneType === "alpine"
            ? 2
            : 0;

    for (let npcIndex = 0; npcIndex < 2; npcIndex += 1) {
      const direction = npcIndex === 0 ? -1 : 1;
      const x = Phaser.Math.Clamp(pairCenter + direction * separation * 0.5, roamLeft + 28, roamRight - 28);
      npcSpecs.push({
        id: `${pairId}-${npcIndex}`,
        x,
        textureBase: paletteKeys[(paletteOffset + npcIndex) % paletteKeys.length],
        emoteKey: emoteKeys[(emoteOffset + npcIndex) % emoteKeys.length],
        phase: random() * Math.PI * 2,
        pairId,
        roamLeft,
        roamRight,
        groundOffset,
      });
    }
  }

  npcs = npcSpecs.map((spec, index) => {
    const baseY = groundY + 6 + spec.groundOffset + (index % 2 === 0 ? 0 : 2);
    const actor = scene.add.image(spec.x, baseY, `${spec.textureBase}-idle`)
      .setOrigin(0.5, 1)
      .setDepth(2);
    const emote = scene.add.image(spec.x, baseY - 74, spec.emoteKey)
      .setDepth(4)
      .setAlpha(0)
      .setScale(0.84);

    return {
      ...spec,
      actor,
      emote,
      baseY,
      interactionTimer: 0,
      wasNearby: false,
      waveTimer: 0,
      walkCycle: spec.phase * 90,
      facing: index % 2 === 0 ? 1 : -1,
      x: spec.x,
      homeX: spec.x,
      targetX: spec.x,
      roamLeft: spec.roamLeft,
      roamRight: spec.roamRight,
      moveSpeed: Phaser.Math.Between(NPC_WALK_SPEED_MIN, NPC_WALK_SPEED_MAX),
      waitTimer: Phaser.Math.Between(400, 1500),
      socialTimer: 0,
      socialPartnerId: null,
      isMeeting: false,
      scaredTimer: 0,
      fleeDirection: 0,
    };
  });

  const pairGroups = new Map();
  for (const npc of npcs) {
    if (!pairGroups.has(npc.pairId)) {
      pairGroups.set(npc.pairId, []);
    }
    pairGroups.get(npc.pairId).push(npc);
  }

  npcPairs = Array.from(pairGroups.values())
    .filter((pair) => pair.length === 2)
    .map(([a, b]) => ({
      a,
      b,
      cooldown: Phaser.Math.Between(NPC_SOCIAL_COOLDOWN_MIN, NPC_SOCIAL_COOLDOWN_MAX),
      meetingX: (a.homeX + b.homeX) * 0.5,
      active: false,
    }));
}

function updateDayNightCycle(scene) {
  const orbit = ((scene.time.now * 0.0000045) + DAY_CYCLE_OFFSET) % 1;
  const sunVisible = orbit < SUN_TRAVEL_WINDOW;
  const sunProgress = sunVisible ? orbit / SUN_TRAVEL_WINDOW : 1;
  const moonStart = SUN_TRAVEL_WINDOW + MOON_RISE_DELAY;
  const moonEnd = moonStart + MOON_TRAVEL_WINDOW;
  const moonVisible = orbit >= moonStart && orbit < moonEnd;
  const moonProgress = moonVisible ? (orbit - moonStart) / MOON_TRAVEL_WINDOW : 0;
  const sunArc = sunVisible ? Math.sin(sunProgress * Math.PI) : 0;
  const moonArc = moonVisible ? Math.sin(moonProgress * Math.PI) : 0;
  const daylight = sunVisible ? 0.34 + sunArc * 0.66 : 0;
  currentDaylight = daylight;

  const topTint = lerpColor(NIGHT_TOP, DAY_TOP, daylight);
  const bottomTint = lerpColor(NIGHT_BOTTOM, DAY_BOTTOM, daylight);

  scene.cameras.main.setBackgroundColor(topTint);
  layers.skyTop.setFillStyle(topTint);
  layers.skyBottom.setFillStyle(bottomTint, 0.82 + daylight * 0.12);
  tintGroundTiles(lerpColorValue(0x575045, 0xffffff, daylight));

  const sunPosition = getCelestialPosition(sunProgress);
  layers.sun.setVisible(sunVisible).setPosition(sunPosition.x, sunPosition.y).setAlpha(sunVisible ? 0.26 + sunArc * 0.74 : 0);
  layers.sunDisk.setFillStyle(lerpColorValue(0xf7c857, 0xffdf80, daylight), 1);

  const moonPosition = getCelestialPosition(moonProgress);
  layers.moon.setVisible(moonVisible).setPosition(moonPosition.x + 12, moonPosition.y + 8).setAlpha(moonVisible ? 0.22 + moonArc * 0.78 : 0);
  layers.moonMask.setFillStyle(topTint, 1);

  layers.mountains.setTint(lerpColorValue(0x3c4457, 0x746775, daylight));
  layers.alpineBackdrop.setTint(lerpColorValue(0x40546f, 0xffffff, daylight));
  layers.desertDunes.setTint(lerpColorValue(0x4b3a40, 0xffffff, daylight));
  layers.archesBackdrop.setTint(lerpColorValue(0x402c3b, 0xffffff, daylight));
  layers.beachWater.setTint(lerpColorValue(0x20374f, 0xffffff, daylight));
  layers.boardwalkBackdrop.setTint(lerpColorValue(0x1d3550, 0xffffff, daylight));
  layers.beachWaveLines.setTint(lerpColorValue(0x74ccdf, 0xffffff, daylight));
  layers.cityBuildings.setTint(lerpColorValue(0x1f2b40, 0x50657a, daylight));
  layers.neighborhoodHouses.setTint(lerpColorValue(0x2d3340, 0xffffff, daylight));
  layers.boardwalkShops.setTint(lerpColorValue(0x2b3344, 0xffffff, daylight));
  layers.cityTrees.setTint(lerpColorValue(0x223028, 0x5d8147, daylight));
  layers.beachPalms.setTint(lerpColorValue(0x1d271d, 0xffffff, daylight));
  layers.pineTrees.setTint(lerpColorValue(0x18241b, 0x35513a, daylight));
  layers.alpineTrees.setTint(lerpColorValue(0x213034, 0xffffff, daylight));
  layers.neighborhoodTrees.setTint(lerpColorValue(0x223026, 0xffffff, daylight));
  layers.desertCacti.setTint(lerpColorValue(0x27341f, 0xffffff, daylight));
  layers.archesPillars.setTint(lerpColorValue(0x3f2a34, 0xffffff, daylight));
  layers.beachGround.setTint(lerpColorValue(0x564d38, 0xffffff, daylight));
  layers.boardwalkGround.setTint(lerpColorValue(0x574940, 0xffffff, daylight));
  layers.cityGround.setTint(lerpColorValue(0x4d4539, 0xffffff, daylight));
  layers.mountainGround.setTint(lerpColorValue(0x554d41, 0xffffff, daylight));
  layers.neighborhoodGround.setTint(lerpColorValue(0x43463b, 0xffffff, daylight));
  layers.desertGround.setTint(lerpColorValue(0x5a4236, 0xffffff, daylight));
  layers.alpineGround.setTint(lerpColorValue(0x617188, 0xffffff, daylight));
  layers.archesGround.setTint(lerpColorValue(0x51373a, 0xffffff, daylight));

  for (const npc of npcs) {
    npc.actor.setTint(0xffffff);
    npc.emote.setTint(0xffffff);
  }

  for (const playerState of players) {
    playerState.emote.setTint(lerpColorValue(0x727a92, 0xffffff, daylight));
  }

  for (const cloud of clouds) {
    cloud.sprite.setTint(lerpColorValue(0xc3d1e6, 0xffffff, daylight));
    cloud.sprite.setAlpha(cloud.alpha * (0.42 + daylight * 0.62));
  }
}

function getSceneWeights(playerX) {
  const sceneWeights = Object.fromEntries(SCENE_TYPES.map((sceneType) => [sceneType, 0]));
  const segmentIndex = Phaser.Math.Clamp(Math.floor(playerX / SCENE_SEGMENT_WIDTH), 0, TOTAL_SCENE_SEGMENTS - 1);
  const localX = playerX - segmentIndex * SCENE_SEGMENT_WIDTH;
  const blendHalf = sceneBlendWidth * 0.5;
  const currentScene = getSceneTypeAtSegment(segmentIndex);

  if (localX < blendHalf && segmentIndex > 0) {
    const blend = smoothBlend((localX + blendHalf) / sceneBlendWidth);
    sceneWeights[getSceneTypeAtSegment(segmentIndex - 1)] = 1 - blend;
    sceneWeights[currentScene] = blend;
    return sceneWeights;
  }

  if (localX > SCENE_SEGMENT_WIDTH - blendHalf && segmentIndex < TOTAL_SCENE_SEGMENTS - 1) {
    const blend = smoothBlend((localX - (SCENE_SEGMENT_WIDTH - blendHalf)) / sceneBlendWidth);
    sceneWeights[currentScene] = 1 - blend;
    sceneWeights[getSceneTypeAtSegment(segmentIndex + 1)] = blend;
    return sceneWeights;
  }

  sceneWeights[currentScene] = 1;
  return sceneWeights;
}

function getSceneTypeAtSegment(segmentIndex) {
  const cycleIndex = ((segmentIndex % SCENE_CYCLE.length) + SCENE_CYCLE.length) % SCENE_CYCLE.length;
  return SCENE_CYCLE[cycleIndex];
}

function smoothBlend(value) {
  const normalized = Phaser.Math.Clamp(value, 0, 1);
  return normalized * normalized * (3 - 2 * normalized);
}

function updateParallax(scrollX, playerX) {
  const sceneWeights = getSceneWeights(playerX);
  const beachWaveScrollOffset = (beachWavePhase * BEACH_WAVE_SCROLL_SPEED) / 1000;
  const beachWaveBob = Math.sin(beachWavePhase * BEACH_WAVE_BOB_SPEED) * BEACH_WAVE_BOB_AMOUNT;

  layers.mountains.tilePositionX = scrollX * 0.1;
  layers.alpineBackdrop.tilePositionX = scrollX * 0.09;
  layers.desertDunes.tilePositionX = scrollX * 0.13;
  layers.archesBackdrop.tilePositionX = scrollX * 0.11;
  layers.beachWater.tilePositionX = scrollX * 0.15;
  layers.boardwalkBackdrop.tilePositionX = scrollX * 0.14;
  layers.beachWaveLines.tilePositionX = scrollX * 0.18 + beachWaveScrollOffset;
  layers.beachWaveLines.tilePositionY = beachWaveBob;
  layers.cityBuildings.tilePositionX = scrollX * 0.24;
  layers.cityLights.tilePositionX = scrollX * 0.24;
  layers.neighborhoodHouses.tilePositionX = scrollX * 0.22;
  layers.neighborhoodLights.tilePositionX = scrollX * 0.22;
  layers.boardwalkShops.tilePositionX = scrollX * 0.26;
  layers.cityTrees.tilePositionX = scrollX * 0.34;
  layers.beachPalms.tilePositionX = scrollX * 0.32;
  layers.pineTrees.tilePositionX = scrollX * 0.38;
  layers.alpineTrees.tilePositionX = scrollX * 0.36;
  layers.neighborhoodTrees.tilePositionX = scrollX * 0.36;
  layers.desertCacti.tilePositionX = scrollX * 0.35;
  layers.archesPillars.tilePositionX = scrollX * 0.31;
  layers.cityGround.tilePositionX = scrollX * 0.48;
  layers.mountainGround.tilePositionX = scrollX * 0.47;
  layers.beachGround.tilePositionX = scrollX * 0.46;
  layers.boardwalkGround.tilePositionX = scrollX * 0.49;
  layers.neighborhoodGround.tilePositionX = scrollX * 0.48;
  layers.desertGround.tilePositionX = scrollX * 0.47;
  layers.alpineGround.tilePositionX = scrollX * 0.46;
  layers.archesGround.tilePositionX = scrollX * 0.49;

  layers.mountains.setAlpha(sceneWeights.mountain * 0.96);
  layers.alpineBackdrop.setAlpha(sceneWeights.alpine * 0.97);
  layers.desertDunes.setAlpha(sceneWeights.desert * 0.95);
  layers.archesBackdrop.setAlpha(sceneWeights.arches * 0.95);
  layers.beachWater.setAlpha(sceneWeights.beach * 0.94);
  layers.boardwalkBackdrop.setAlpha(sceneWeights.boardwalk * 0.95);
  layers.beachWaveLines.setAlpha(sceneWeights.beach * 0.76);
  layers.cityBuildings.setAlpha(sceneWeights.city * 0.96);
  layers.cityLights.setAlpha(sceneWeights.city * Phaser.Math.Clamp((1 - currentDaylight) * 1.2, 0, 0.9));
  layers.neighborhoodHouses.setAlpha(sceneWeights.neighborhood * 0.95);
  layers.neighborhoodLights.setAlpha(sceneWeights.neighborhood * Phaser.Math.Clamp((1 - currentDaylight) * 1.15, 0, 0.9));
  layers.boardwalkShops.setAlpha(sceneWeights.boardwalk * 0.95);
  layers.cityTrees.setAlpha(sceneWeights.city * 0.86);
  layers.beachPalms.setAlpha(sceneWeights.beach * 0.92);
  layers.pineTrees.setAlpha(sceneWeights.mountain * 0.92);
  layers.alpineTrees.setAlpha(sceneWeights.alpine * 0.92);
  layers.neighborhoodTrees.setAlpha(sceneWeights.neighborhood * 0.88);
  layers.desertCacti.setAlpha(sceneWeights.desert * 0.9);
  layers.archesPillars.setAlpha(sceneWeights.arches * 0.92);
  layers.cityGround.setAlpha(sceneWeights.city * 0.98);
  layers.mountainGround.setAlpha(sceneWeights.mountain * 0.98);
  layers.beachGround.setAlpha(sceneWeights.beach * 0.98);
  layers.boardwalkGround.setAlpha(sceneWeights.boardwalk * 0.98);
  layers.neighborhoodGround.setAlpha(sceneWeights.neighborhood * 0.98);
  layers.desertGround.setAlpha(sceneWeights.desert * 0.98);
  layers.alpineGround.setAlpha(sceneWeights.alpine * 0.98);
  layers.archesGround.setAlpha(sceneWeights.arches * 0.98);
}

function enableChillMode() {
  const initialDirection = primaryPlayerState.facing > 0 ? 1 : chooseChillDirection();
  chillMode = true;
  chillState = {
    direction: initialDirection,
    turnTimer: getChillTurnDuration(initialDirection),
    jumpTimer: Phaser.Math.Between(850, 2200),
    idleTimer: 0,
  };
}

function chooseChillDirection() {
  return Math.random() < CHILL_RIGHT_BIAS ? 1 : -1;
}

function getChillTurnDuration(direction) {
  if (direction > 0) {
    return Phaser.Math.Between(CHILL_RIGHT_TURN_MIN, CHILL_RIGHT_TURN_MAX);
  }

  return Phaser.Math.Between(CHILL_LEFT_TURN_MIN, CHILL_LEFT_TURN_MAX);
}

function getChillInput(delta, onGround) {
  chillState.turnTimer -= delta;
  chillState.jumpTimer -= delta;
  chillState.idleTimer -= delta;

  const threat = gameMode === "coop"
    ? getNearestEnemyThreat(primaryPlayerState.actor.x, primaryPlayerState.actor.y, CHILL_MONSTER_ENGAGE_RANGE)
    : null;

  if (threat) {
    chillState.direction = Math.sign(threat.dx) || primaryPlayerState.facing || 1;
    chillState.turnTimer = Math.max(chillState.turnTimer, 360);
    chillState.idleTimer = 0;
  } else if (primaryPlayerState.actor.x <= CHILL_EDGE_MARGIN) {
    chillState.direction = 1;
    chillState.turnTimer = getChillTurnDuration(1);
    chillState.idleTimer = 0;
  } else if (primaryPlayerState.actor.x >= worldWidth - CHILL_EDGE_MARGIN) {
    chillState.direction = -1;
    chillState.turnTimer = getChillTurnDuration(-1);
    chillState.idleTimer = 0;
  } else if (chillState.turnTimer <= 0) {
    chillState.direction = chooseChillDirection();
    chillState.turnTimer = getChillTurnDuration(chillState.direction);
    chillState.idleTimer = Math.random() < 0.24 ? Phaser.Math.Between(260, 760) : 0;
  }

  let moveLeft = false;
  let moveRight = false;
  let attackAPressed = false;
  let attackBPressed = false;

  if (threat) {
    const closeEnoughToAttack = Math.abs(threat.dx) <= CHILL_MONSTER_ATTACK_RANGE;
    moveLeft = threat.dx < 0;
    moveRight = threat.dx > 0;
    if (closeEnoughToAttack) {
      attackBPressed =
        Math.abs(threat.dx) > CHILL_MONSTER_ATTACK_RANGE * 0.68 &&
        Math.abs(threat.dx) < CHILL_MONSTER_ATTACK_RANGE * 0.96;
      attackAPressed = !attackBPressed;
    }
  } else if (chillState.idleTimer <= 0) {
    moveLeft = chillState.direction < 0;
    moveRight = chillState.direction > 0;
  }

  let jumpPressed = false;
  if (onGround && chillState.jumpTimer <= 0) {
    jumpPressed = Math.random() < (moveLeft || moveRight ? 0.48 : 0.18);
    chillState.jumpTimer = Phaser.Math.Between(900, 2400);
  }

  return mergeInputs(getEmptyControllerInput(), {
    connected: true,
    left: moveLeft,
    right: moveRight,
    jumpPressed,
    attackAHeld: attackAPressed,
    attackAPressed,
    attackBHeld: attackBPressed,
    attackBPressed,
  });
}

function getCelestialPosition(progress) {
  return {
    x: width + 160 - progress * (width + 320),
    y: 154 - Math.sin(progress * Math.PI) * 76,
  };
}

function updateClouds(delta) {
  for (const cloud of clouds) {
    cloud.sprite.x -= cloud.speed * (delta / 1000);
    if (cloud.sprite.x < -cloud.sprite.displayWidth * 0.7) {
      cloud.sprite.x = width + Phaser.Math.Between(80, 240);
      cloud.sprite.y = cloud.y + Phaser.Math.Between(-20, 20);
    }
  }
}

function resetBirdSpawnTimer() {
  birdSpawnTimer = Phaser.Math.Between(BIRD_SPAWN_DELAY_MIN, BIRD_SPAWN_DELAY_MAX);
}

function spawnBirdFlight(scene) {
  const direction = Math.random() < 0.65 ? -1 : 1;
  const flockSize = Phaser.Math.Between(1, 3);
  const anchorY = Phaser.Math.Between(62, 178);
  const baseSpeed = Phaser.Math.Between(BIRD_SPEED_MIN, BIRD_SPEED_MAX);
  const spawnX = direction < 0 ? width + Phaser.Math.Between(80, 180) : -Phaser.Math.Between(80, 180);
  const exitX = direction < 0 ? -140 : width + 140;
  const formationDrift = Phaser.Math.FloatBetween(0.0005, 0.0011);

  for (let index = 0; index < flockSize; index += 1) {
    const spacing = 28 + index * Phaser.Math.Between(18, 30);
    const startX = spawnX - direction * spacing;
    const targetDistance = Math.abs(exitX - startX);
    const travelSpeed = baseSpeed + Phaser.Math.Between(-18, 22);
    const sprite = scene.add.image(
      startX,
      anchorY + Phaser.Math.Between(-18, 18),
      "bird-mid",
    )
      .setScrollFactor(0)
      .setDepth(-15)
      .setScale(0.74 + Math.random() * 0.24)
      .setAlpha(0.72 + Math.random() * 0.14)
      .setFlipX(direction > 0);

    birds.push({
      sprite,
      x: startX,
      baseY: sprite.y,
      startX,
      exitX,
      direction,
      travelDistance: targetDistance,
      travelElapsed: 0,
      travelDuration: (targetDistance / travelSpeed) * 1000,
      baseAlpha: sprite.alpha,
      bobAmplitude: 3 + Math.random() * 4,
      bobSpeed: 0.0034 + Math.random() * 0.0011,
      swayAmplitude: 2 + Math.random() * 3,
      swaySpeed: 0.0016 + Math.random() * 0.0008,
      cruiseAmplitude: 4 + Math.random() * 4,
      cruiseSpeed: 0.002 + Math.random() * 0.0008,
      phase: Math.random() * Math.PI * 2,
      flapOffset: Phaser.Math.Between(0, 420),
      frameDuration: Phaser.Math.Between(BIRD_FRAME_DURATION_MIN, BIRD_FRAME_DURATION_MAX),
      bankAmount: Phaser.Math.FloatBetween(0.03, 0.08),
      formationDrift,
      flockOffset: index * 0.6,
    });
  }
}

function updateBirds(scene, delta) {
  birdSpawnTimer -= delta;
  if (birdSpawnTimer <= 0) {
    spawnBirdFlight(scene);
    resetBirdSpawnTimer();
  }

  birds = birds.filter((bird) => {
    const time = scene.time.now;
    bird.travelElapsed += delta;
    const progress = Phaser.Math.Clamp(bird.travelElapsed / bird.travelDuration, 0, 1);
    bird.x = Phaser.Math.Linear(bird.startX, bird.exitX, progress);
    const bob = Math.sin(time * bird.bobSpeed + bird.phase) * bird.bobAmplitude;
    const sway = Math.sin(time * bird.swaySpeed + bird.phase * 0.6 + bird.flockOffset) * bird.swayAmplitude;
    const cruise = Math.sin(time * bird.cruiseSpeed + bird.phase + bird.flockOffset) * bird.cruiseAmplitude;
    bird.sprite.x = bird.x + cruise;
    bird.sprite.y = bird.baseY + bob + sway;

    const flapPhase = Math.floor((time + bird.flapOffset) / bird.frameDuration) % 8;
    const frameKey =
      ["bird-up", "bird-mid", "bird-down", "bird-mid", "bird-glide", "bird-mid", "bird-down", "bird-mid"][
        flapPhase
      ];
    bird.sprite.setTexture(frameKey);
    bird.sprite.setRotation(
      Math.sin(time * bird.formationDrift + bird.phase + bird.flockOffset) * bird.bankAmount +
        Math.sin(time * bird.bobSpeed + bird.phase) * 0.02,
    );
    bird.sprite.setAlpha((0.5 + currentDaylight * 0.36) * bird.baseAlpha);
    bird.sprite.setTint(lerpColorValue(0xa8b4c7, 0x34445a, currentDaylight));

    if (progress >= 1) {
      bird.sprite.destroy();
      return false;
    }

    return true;
  });
}

function updateNPCSocials(delta) {
  for (const pair of npcPairs) {
    const aThreat = gameMode === "coop"
      ? getNearestEnemyThreat(pair.a.x, pair.a.baseY - 28, NPC_MONSTER_FEAR_RANGE)
      : null;
    const bThreat = gameMode === "coop"
      ? getNearestEnemyThreat(pair.b.x, pair.b.baseY - 28, NPC_MONSTER_FEAR_RANGE)
      : null;

    if (aThreat || bThreat) {
      if (pair.active) {
        cancelNPCMeeting(pair);
      }
      pair.a.socialTimer = 0;
      pair.b.socialTimer = 0;
      pair.a.socialPartnerId = null;
      pair.b.socialPartnerId = null;
      pair.cooldown = Math.max(pair.cooldown, NPC_SCARED_PAIR_COOLDOWN);
      continue;
    }

    const aBusyWithPlayer = pair.a.interactionTimer > 0;
    const bBusyWithPlayer = pair.b.interactionTimer > 0;
    const aSocializing = pair.a.socialTimer > 0;
    const bSocializing = pair.b.socialTimer > 0;

    if (pair.active) {
      if (aBusyWithPlayer || bBusyWithPlayer) {
        cancelNPCMeeting(pair);
        continue;
      }

      const aArrived = Math.abs(pair.a.x - pair.meetingX + 20) <= 6;
      const bArrived = Math.abs(pair.b.x - pair.meetingX - 20) <= 6;
      if (aArrived && bArrived) {
        const socialDuration = Phaser.Math.Between(NPC_SOCIAL_DURATION_MIN, NPC_SOCIAL_DURATION_MAX);
        pair.a.socialTimer = socialDuration;
        pair.b.socialTimer = socialDuration;
        pair.a.waveTimer = 0;
        pair.b.waveTimer = 120;
        pair.a.socialPartnerId = pair.b.id;
        pair.b.socialPartnerId = pair.a.id;
        pair.a.isMeeting = false;
        pair.b.isMeeting = false;
        pair.active = false;
        pair.cooldown = Phaser.Math.Between(NPC_SOCIAL_COOLDOWN_MIN, NPC_SOCIAL_COOLDOWN_MAX);
      }
      continue;
    }

    if (aBusyWithPlayer || bBusyWithPlayer || aSocializing || bSocializing) {
      continue;
    }

    pair.cooldown -= delta;
    if (pair.cooldown > 0) {
      continue;
    }

    const meetLeft = Math.max(pair.a.roamLeft, pair.b.roamLeft) + 20;
    const meetRight = Math.min(pair.a.roamRight, pair.b.roamRight) - 20;
    pair.meetingX = Phaser.Math.Clamp(
      (pair.a.homeX + pair.b.homeX) * 0.5 + Phaser.Math.Between(-16, 16),
      meetLeft,
      meetRight,
    );
    pair.a.targetX = pair.meetingX - 20;
    pair.b.targetX = pair.meetingX + 20;
    pair.a.waitTimer = 0;
    pair.b.waitTimer = 0;
    pair.a.isMeeting = true;
    pair.b.isMeeting = true;
    pair.a.socialPartnerId = pair.b.id;
    pair.b.socialPartnerId = pair.a.id;
    pair.active = true;
  }
}

function cancelNPCMeeting(pair) {
  pair.active = false;
  pair.cooldown = Phaser.Math.Between(2400, 5200);
  pair.a.isMeeting = false;
  pair.b.isMeeting = false;
  pair.a.socialPartnerId = null;
  pair.b.socialPartnerId = null;
  queueNPCWander(pair.a, true);
  queueNPCWander(pair.b, true);
}

function queueNPCWander(npc, immediate = false) {
  npc.targetX = Phaser.Math.Between(npc.roamLeft, npc.roamRight);
  npc.waitTimer = immediate ? 0 : Phaser.Math.Between(380, 1400);
  npc.isMeeting = false;
}

function findNPCById(id) {
  return npcs.find((npc) => npc.id === id) ?? null;
}

function updateNPCMotion(npc, delta) {
  if (npc.interactionTimer > 0 || npc.socialTimer > 0) {
    return false;
  }

  npc.waitTimer = Math.max(0, npc.waitTimer - delta);
  const distanceToTarget = npc.targetX - npc.x;
  if (Math.abs(distanceToTarget) <= 3) {
    npc.x = npc.targetX;
    if (!npc.isMeeting && npc.waitTimer <= 0) {
      queueNPCWander(npc);
    }
    return false;
  }

  if (npc.waitTimer > 0 && !npc.isMeeting) {
    return false;
  }

  const direction = Math.sign(distanceToTarget);
  npc.facing = direction === 0 ? npc.facing : direction;
  const step = Math.min(Math.abs(distanceToTarget), npc.moveSpeed * (delta / 1000));
  npc.x += direction * step;
  return step > 0.15;
}

function updateNPCs(scene, delta) {
  updateNPCSocials(delta);

  for (const npc of npcs) {
    npc.scaredTimer = Math.max(0, npc.scaredTimer - delta);
    const fearThreat = gameMode === "coop"
      ? getNearestEnemyThreat(npc.x, npc.baseY - 28, NPC_MONSTER_FEAR_RANGE)
      : null;
    if (fearThreat) {
      npc.scaredTimer = NPC_SCARED_RECOVERY;
      npc.fleeDirection = Math.sign(npc.x - fearThreat.enemy.actor.x) || (npc.facing === 0 ? 1 : npc.facing);
    }

    if (npc.scaredTimer > 0 && npc.fleeDirection !== 0) {
      npc.wasNearby = false;
      npc.interactionTimer = 0;
      npc.socialTimer = 0;
      npc.socialPartnerId = null;
      npc.isMeeting = false;
      npc.waitTimer = 0;
      npc.walkCycle += delta * 1.2;

      const fleeStep = npc.moveSpeed * NPC_SCARED_SPEED_MULTIPLIER * (delta / 1000);
      npc.x = Phaser.Math.Clamp(npc.x + npc.fleeDirection * fleeStep, npc.roamLeft, npc.roamRight);
      npc.facing = npc.fleeDirection;

      const walkFrames = npc.facing < 0
        ? [`${npc.textureBase}-walk-2`, `${npc.textureBase}-walk-1`]
        : [`${npc.textureBase}-walk-1`, `${npc.textureBase}-walk-2`];
      const walkFrame = Math.floor(npc.walkCycle / 160) % walkFrames.length;
      const panicBob = Math.sin(scene.time.now * 0.007 + npc.phase) * 2.2;
      npc.actor.setX(npc.x);
      npc.actor.setFlipX(npc.facing < 0);
      npc.actor.y = npc.baseY + panicBob;
      npc.actor.setTexture(walkFrames[walkFrame]);
      if (npc.emote.texture.key !== "emote-alert") {
        npc.emote.setTexture("emote-alert");
      }
      npc.emote.setPosition(
        npc.x,
        npc.baseY - 80 + panicBob - Math.sin(scene.time.now * 0.011 + npc.phase) * 2,
      );
      const panicAlpha = Phaser.Math.Linear(npc.emote.alpha, 0.94, 0.24);
      npc.emote.setAlpha(panicAlpha);
      npc.emote.setScale(0.9 + panicAlpha * 0.16 + Math.sin(scene.time.now * 0.01 + npc.phase) * 0.04);
      continue;
    }

    const closestPlayer = getClosestPlayerToX(npc.x);
    const distanceFromPlayer = closestPlayer.actor.x - npc.x;
    const nearby = Math.abs(distanceFromPlayer) <= NPC_INTERACTION_RANGE;
    if (nearby && !npc.wasNearby) {
      npc.interactionTimer = NPC_INTERACTION_DURATION;
      npc.waveTimer = 0;
      triggerPlayerInteraction(closestPlayer, npc);
    }

    npc.wasNearby = nearby;
    npc.interactionTimer = Math.max(0, npc.interactionTimer - delta);
    npc.socialTimer = Math.max(0, npc.socialTimer - delta);
    const interactingWithPlayer = npc.interactionTimer > 0;
    const socialPartner = npc.socialTimer > 0 ? findNPCById(npc.socialPartnerId) : null;
    const socializing = Boolean(socialPartner);

    const moving = updateNPCMotion(npc, delta);
    if (interactingWithPlayer || socializing) {
      npc.waveTimer += delta;
    } else if (moving) {
      npc.walkCycle += delta;
    } else {
      npc.walkCycle = 0;
    }

    if (interactingWithPlayer) {
      npc.facing = distanceFromPlayer < 0 ? -1 : 1;
    } else if (socializing) {
      npc.facing = socialPartner.x < npc.x ? -1 : 1;
    }

    const idleBob = Math.sin(scene.time.now * 0.0032 + npc.phase) * ((interactingWithPlayer || socializing) ? 2 : 1.2);
    npc.actor.setX(npc.x);
    npc.actor.setFlipX(npc.facing < 0);
    npc.actor.y = npc.baseY + idleBob;
    npc.emote.setPosition(
      npc.x,
      npc.baseY - 72 + idleBob - ((interactingWithPlayer || socializing) ? 8 : 0) - Math.sin(scene.time.now * 0.006 + npc.phase) * 2,
    );

    if (interactingWithPlayer || socializing) {
      const waveFrames = [`${npc.textureBase}-wave-1`, `${npc.textureBase}-wave-2`, `${npc.textureBase}-wave-1`];
      const waveFrame = Math.floor(npc.waveTimer / 140) % waveFrames.length;
      npc.actor.setTexture(waveFrames[waveFrame]);
    } else if (moving) {
      const walkFrames = npc.facing < 0
        ? [`${npc.textureBase}-walk-2`, `${npc.textureBase}-walk-1`]
        : [`${npc.textureBase}-walk-1`, `${npc.textureBase}-walk-2`];
      const walkFrame = Math.floor(npc.walkCycle / 180) % walkFrames.length;
      npc.actor.setTexture(walkFrames[walkFrame]);
    } else {
      npc.actor.setTexture(`${npc.textureBase}-idle`);
    }

    if (npc.socialTimer <= 0 && !npc.isMeeting) {
      npc.socialPartnerId = null;
    }

    if (npc.emote.texture.key !== npc.emoteKey) {
      npc.emote.setTexture(npc.emoteKey);
    }

    const targetAlpha = interactingWithPlayer ? 0.96 : socializing ? 0.78 : 0;
    const nextAlpha = Phaser.Math.Linear(npc.emote.alpha, targetAlpha, (interactingWithPlayer || socializing) ? 0.22 : 0.12);
    npc.emote.setAlpha(nextAlpha);
    npc.emote.setScale(0.84 + nextAlpha * 0.18 + Math.sin(scene.time.now * 0.007 + npc.phase) * 0.03);
  }
}

function setPlayerInteraction(playerState, style, emoteKey) {
  playerState.interaction.style = style;
  playerState.interaction.emoteKey = emoteKey;
  playerState.interaction.timer = PLAYER_INTERACTION_DURATION;
  playerState.interaction.waveTimer = 0;

  if (playerState.emote.texture.key !== emoteKey) {
    playerState.emote.setTexture(emoteKey);
  }
}

function triggerPlayerManualEmote(playerState = primaryPlayerState) {
  if (PLAYER_MANUAL_EMOTES.length === 0) {
    return;
  }

  const previousIndex = manualEmoteIndex;
  manualEmoteIndex = Phaser.Math.Between(0, PLAYER_MANUAL_EMOTES.length - 1);
  if (PLAYER_MANUAL_EMOTES.length > 1 && manualEmoteIndex === previousIndex) {
    manualEmoteIndex = (manualEmoteIndex + Phaser.Math.Between(1, PLAYER_MANUAL_EMOTES.length - 1))
      % PLAYER_MANUAL_EMOTES.length;
  }
  const preset = PLAYER_MANUAL_EMOTES[manualEmoteIndex];
  setPlayerInteraction(playerState, preset.style, preset.emoteKey);
}

function triggerPlayerInteraction(playerState, npc) {
  const roll = Phaser.Math.Between(0, 4);
  if (roll === 0) {
    setPlayerInteraction(playerState, "tip", npc.emoteKey);
  } else if (roll === 1) {
    setPlayerInteraction(playerState, "cheer", "emote-spark");
  } else if (roll === 2) {
    setPlayerInteraction(playerState, "wave", "emote-heart");
  } else {
    setPlayerInteraction(playerState, "wave", npc.emoteKey);
  }
}

function updatePlayerInteraction(scene, delta, playerState) {
  playerState.interaction.timer = Math.max(0, playerState.interaction.timer - delta);
  if (!playerState.emote || !playerState.actor) {
    return;
  }

  const active = playerState.interaction.timer > 0;
  const bob = Math.sin(scene.time.now * 0.0064 + 0.8) * 2;
  playerState.emote.setPosition(playerState.actor.x, playerState.actor.y - 86 - (active ? 8 : 0) + bob);
  const targetAlpha = active ? 0.94 : 0;
  const nextAlpha = Phaser.Math.Linear(playerState.emote.alpha, targetAlpha, active ? 0.22 : 0.12);
  playerState.emote.setAlpha(nextAlpha);
  playerState.emote.setScale(0.86 + nextAlpha * 0.16 + Math.sin(scene.time.now * 0.007 + 0.4) * 0.03);
}

function updatePlayerAnimation(playerState, delta, onGround) {
  const actor = playerState.actor;
  const moving = Math.abs(actor.body.velocity.x) > 8;
  const interaction = playerState.interaction;
  const texture = (poseName) => heroTextureKey(playerState.variantId, poseName);
  const attack = playerState.attack;

  if (attack.timer > 0 && attack.profile) {
    actor.setTexture(texture(attack.profile.pose));
    actor.setAngle(attack.profile.pose === "attack-spin"
      ? Math.sin(((attack.duration - attack.timer) / attack.duration) * Math.PI * 4) * 10 * attack.direction
      : 0);
    return;
  }

  if (playerState.stunTimer > 0) {
    actor.setTexture(texture("hurt"));
    actor.setAngle(-playerState.facing * 6);
    return;
  }

  if (!onGround) {
    playerState.walkCycle = 0;
    actor.setAngle(0);
    const verticalVelocity = actor.body.velocity.y;
    if (verticalVelocity < -140) {
      actor.setTexture(texture("jump-rise"));
    } else if (verticalVelocity > 160) {
      actor.setTexture(texture("jump-fall"));
    } else {
      actor.setTexture(texture("jump-peak"));
    }
    return;
  }

  if (interaction.timer > 0) {
    interaction.waveTimer += delta;
    if (interaction.style === "cheer") {
      actor.setAngle(0);
      actor.setTexture(texture("cheer"));
      return;
    }
    if (interaction.style === "flip") {
      const flipFrames = [texture("flip-1"), texture("flip-2"), texture("flip-3"), texture("flip-2")];
      const flipFrame = Math.floor(interaction.waveTimer / 90) % flipFrames.length;
      const spinProgress = Phaser.Math.Easing.Cubic.Out(
        Phaser.Math.Clamp(interaction.waveTimer / PLAYER_INTERACTION_DURATION, 0, 1),
      );
      actor.setTexture(flipFrames[flipFrame]);
      actor.setAngle(playerState.facing * PLAYER_FLIP_ROTATION * spinProgress);
      return;
    }

    let interactFrames = [texture("wave-1"), texture("wave-2"), texture("wave-1")];
    if (interaction.style === "tip") {
      interactFrames = [texture("tip-1"), texture("tip-2"), texture("tip-1")];
    } else if (interaction.style === "peace") {
      interactFrames = [texture("peace-1"), texture("peace-2"), texture("peace-1")];
    } else if (interaction.style === "shrug") {
      interactFrames = [texture("shrug-1"), texture("shrug-2"), texture("shrug-1")];
    } else if (interaction.style === "jumpjack") {
      interactFrames = [texture("jumpjack-1"), texture("jumpjack-2"), texture("jumpjack-1"), texture("jumpjack-2")];
    }
    actor.setAngle(0);
    const interactFrame = Math.floor(interaction.waveTimer / 140) % interactFrames.length;
    actor.setTexture(interactFrames[interactFrame]);
    return;
  }

  if (!moving) {
    playerState.walkCycle = 0;
    actor.setAngle(0);
    actor.setTexture(texture("idle"));
    return;
  }

  playerState.walkCycle += delta;
  actor.setAngle(0);
  const walkFrames = [texture("walk-1"), texture("walk-2"), texture("walk-3"), texture("walk-4")];
  const strideFrame = Math.floor(playerState.walkCycle / 110) % walkFrames.length;
  actor.setTexture(walkFrames[strideFrame]);
}

function updateCamera(camera) {
  camera.scrollX = Phaser.Math.Clamp(getCameraFocusX() - getCameraAnchorX(), 0, worldWidth - width);
  camera.scrollY = 0;
}

function lerpColor(start, end, amount) {
  const mix = Phaser.Display.Color.Interpolate.ColorWithColor(start, end, 100, amount * 100);
  return Phaser.Display.Color.GetColor(mix.r, mix.g, mix.b);
}

function lerpColorValue(startValue, endValue, amount) {
  const start = Phaser.Display.Color.ValueToColor(startValue);
  const end = Phaser.Display.Color.ValueToColor(endValue);
  return lerpColor(start, end, amount);
}

function createCityLightsTexture(scene) {
  if (scene.textures.exists("city-lights")) {
    scene.textures.remove("city-lights");
  }

  const texture = scene.textures.createCanvas("city-lights", 728, 252);
  redrawCityLights(texture);
}

function createNeighborhoodLightsTexture(scene) {
  if (scene.textures.exists("neighborhood-lights")) {
    scene.textures.remove("neighborhood-lights");
  }

  const texture = scene.textures.createCanvas("neighborhood-lights", 760, 236);
  redrawNeighborhoodLights(texture);
}

function redrawCityLights(texture) {
  const ctx = texture.context;
  ctx.clearRect(0, 0, 728, 252);

  for (const building of CITY_SKYLINE) {
    const y = 252 - building.height;
    for (let wx = building.x + 14; wx < building.x + building.width - 14; wx += 20) {
      for (let wy = y + 18; wy < y + building.height - 16; wy += 24) {
        if (Math.random() < 0.82) {
          ctx.fillStyle = CITY_LIGHT_ON_COLOR;
          ctx.fillRect(wx, wy, 8, 12);
        }
      }
    }
  }

  texture.refresh();
}

function redrawNeighborhoodLights(texture) {
  const ctx = texture.context;
  ctx.clearRect(0, 0, 760, 236);

  for (const house of NEIGHBORHOOD_HOUSE_SPECS) {
    const y = 216 - house.height;
    const windowTop = y + 18;
    for (let wx = house.x + 18; wx < house.x + house.width - 18; wx += 34) {
      for (const wy of [windowTop, windowTop + 28]) {
        if (Math.random() < 0.86) {
          ctx.fillStyle = NEIGHBORHOOD_LIGHT_ON_COLOR;
          ctx.beginPath();
          ctx.roundRect(wx, wy, 16, 18, 3);
          ctx.fill();
        }
      }
    }
  }

  texture.refresh();
}

function scheduleCityLightShuffle(scene) {
  scene.time.delayedCall(Phaser.Math.Between(10000, 20000), () => {
    redrawCityLights(scene.textures.get("city-lights"));
    redrawNeighborhoodLights(scene.textures.get("neighborhood-lights"));
    scheduleCityLightShuffle(scene);
  });
}
