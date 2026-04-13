const BUILD_NUMBER = "2026.04.13.5";
const WIDTH = 960;
const HEIGHT = 600;
const NAV_REPEAT_DELAY = 180;
const DEADZONE = 0.28;
const MAX_ESCORTS = 3;
const INTERACT_RANGE = 58;
const BOARD_RANGE = 76;
const SHOT_SPEED = 420;
const ENEMY_SHOT_SPEED = 280;
const MAX_PLAYER_SPEED = 250;
const PLAYER_ACCELERATION = 210;
const PLAYER_FRICTION = 0.992;
const STAR_COUNT = 140;
const SAVE_STORAGE_PREFIX = "arcade.jumpwake.save.slot";
const SAVE_SLOT_COUNT = 3;
const SCAN_RANGE = 122;
const EVENT_DURATION = 18;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ui = {
  sector: document.getElementById("sector-value"),
  credits: document.getElementById("credits-value"),
  hull: document.getElementById("hull-value"),
  shield: document.getElementById("shield-value"),
  cargo: document.getElementById("cargo-value"),
  status: document.getElementById("status-value"),
  hint: document.getElementById("hint-value"),
  overlayTitle: document.getElementById("overlay-title"),
  overlayCopy: document.getElementById("overlay-copy"),
  menuList: document.getElementById("menu-list"),
  panelDetail: document.getElementById("panel-detail"),
  shipDetail: document.getElementById("ship-detail"),
  factionDetail: document.getElementById("faction-detail"),
};

document.title = `Jumpwake build ${BUILD_NUMBER}`;

const COMMODITIES = [
  { id: "food", name: "Food Staples", base: 34, mass: 1 },
  { id: "ore", name: "Refined Ore", base: 52, mass: 1 },
  { id: "meds", name: "Field Medicine", base: 96, mass: 1 },
  { id: "lux", name: "Luxury Goods", base: 118, mass: 1 },
  { id: "munitions", name: "Munitions", base: 88, mass: 1 },
  { id: "contraband", name: "Contraband", base: 154, mass: 1 },
];

const HULLS = {
  kestrel: { name: "Rust Kestrel", classRole: "Scrap interceptor", silhouette: "kestrel", maxHull: 100, maxShield: 46, shieldRegen: 9, cargoCap: 6, fuelCap: 4, turn: 0.076, accel: 228, maxSpeed: 266, friction: 0.991, boardBonus: 0.02, sale: 420, weaponProfile: "pulse", slotText: "Light nose pulse" },
  cutter: { name: "Courier Cutter", classRole: "Fast courier", silhouette: "cutter", maxHull: 120, maxShield: 58, shieldRegen: 10, cargoCap: 8, fuelCap: 4, turn: 0.068, accel: 212, maxSpeed: 252, friction: 0.992, boardBonus: 0.04, sale: 620, weaponProfile: "pulse", slotText: "Courier pulse pair" },
  raider: { name: "Broken Raider", classRole: "Boarding skiff", silhouette: "raider", maxHull: 146, maxShield: 34, shieldRegen: 7, cargoCap: 5, fuelCap: 3, turn: 0.082, accel: 240, maxSpeed: 274, friction: 0.989, boardBonus: 0.08, sale: 780, weaponProfile: "scatter", slotText: "Scatter spikes" },
  corvette: { name: "Shale Corvette", classRole: "Heavy combatant", silhouette: "corvette", maxHull: 180, maxShield: 84, shieldRegen: 12, cargoCap: 9, fuelCap: 5, turn: 0.056, accel: 182, maxSpeed: 226, friction: 0.993, boardBonus: 0.12, sale: 1220, weaponProfile: "rail", slotText: "Rail lance" },
  patrol: { name: "Checkpoint Patrol", classRole: "Authority interceptor", silhouette: "patrol", maxHull: 134, maxShield: 64, shieldRegen: 11, cargoCap: 5, fuelCap: 4, turn: 0.07, accel: 214, maxSpeed: 248, friction: 0.992, boardBonus: 0.05, sale: 920, weaponProfile: "pulse", slotText: "Authority pulse" },
  trader: { name: "Long Haul Trader", classRole: "Civilian freighter", silhouette: "trader", maxHull: 156, maxShield: 52, shieldRegen: 8, cargoCap: 14, fuelCap: 5, turn: 0.052, accel: 158, maxSpeed: 206, friction: 0.994, boardBonus: 0.01, sale: 860, weaponProfile: "missile", slotText: "Defense rack" },
  smuggler: { name: "Nightglass Smuggler", classRole: "Illegal courier", silhouette: "cutter", maxHull: 128, maxShield: 62, shieldRegen: 10, cargoCap: 9, fuelCap: 5, turn: 0.074, accel: 222, maxSpeed: 264, friction: 0.99, boardBonus: 0.06, sale: 980, weaponProfile: "scatter", slotText: "Hidden scatter bay" },
  tug: { name: "Cinder Tug", classRole: "Industrial hauler", silhouette: "trader", maxHull: 194, maxShield: 44, shieldRegen: 7, cargoCap: 16, fuelCap: 4, turn: 0.044, accel: 138, maxSpeed: 188, friction: 0.995, boardBonus: 0.03, sale: 1040, weaponProfile: "pulse", slotText: "Utility pulse" },
};

const FACTIONS = [
  { id: "independent", name: "Independents" },
  { id: "authority", name: "Central Authority" },
  { id: "frontier", name: "Frontier Union" },
  { id: "pirate", name: "Dust Pirates" },
  { id: "syndicate", name: "Nightglass Syndicate" },
];

const SECTORS = {
  grey_exchange: {
    id: "grey_exchange",
    name: "Grey Exchange",
    faction: "independent",
    description: "A scrappy starter trade station where every captain claims they are only one lucky haul away from a corvette.",
    danger: 0.22,
    neighbors: ["union_harbor", "shale_barrens", "cinder_wake"],
    station: { x: 212, y: 316 },
    palette: { glow: "rgba(128, 194, 255, 0.09)", planet: "#6f8797", planetShadow: "#435664", station: "#8ddcff", stationWarm: "#ffcf74" },
    legality: "open",
    routeNotes: "Starter trade hub with forgiving traffic and cheap fixes.",
    intel: "Food and ore move steadily here. Grey Exchange buys stories, spare parts, and second chances.",
    shipyard: ["kestrel", "cutter"],
    traffic: { traders: 3, patrols: 1, pirates: 0, hostilePirates: 0, smugglers: 0 },
    economy: { food: 0.88, ore: 1.14, meds: 1.06, lux: 1.03, munitions: 1.08, contraband: 1.18 },
  },
  union_harbor: {
    id: "union_harbor",
    name: "Union Harbor",
    faction: "frontier",
    description: "Union Harbor pays well for food and medicine, but pirates smell the same shortages you do.",
    danger: 0.38,
    neighbors: ["grey_exchange", "authority_gate", "iron_hollow"],
    station: { x: 742, y: 210 },
    palette: { glow: "rgba(147, 255, 201, 0.08)", planet: "#4f8c77", planetShadow: "#295445", station: "#a7ffe0", stationWarm: "#ffe081" },
    legality: "lawful",
    routeNotes: "Shortages reward steady lawful hauling, but convoy lanes draw pirate scouts.",
    intel: "Medicine, food, and contract work pay well. Frontier captains remember who shows up.",
    shipyard: ["cutter", "trader"],
    traffic: { traders: 2, patrols: 1, pirates: 1, hostilePirates: 0, smugglers: 0 },
    economy: { food: 1.18, ore: 0.92, meds: 1.22, lux: 0.94, munitions: 1.14, contraband: 1.08 },
  },
  shale_barrens: {
    id: "shale_barrens",
    name: "Shale Barrens",
    faction: "pirate",
    description: "Refineries, wreck fields, and pirate skimmers make this the fastest way to get rich or get boarded.",
    danger: 0.64,
    neighbors: ["grey_exchange", "authority_gate", "ember_market"],
    station: { x: 694, y: 430 },
    palette: { glow: "rgba(255, 152, 118, 0.1)", planet: "#8a5944", planetShadow: "#4a2d24", station: "#ffb287", stationWarm: "#ffe29a" },
    legality: "pirate",
    routeNotes: "A pirate pressure zone where munitions are cheap and insurance myths go to die.",
    intel: "Boarding pays, escorts die fast, and nobody asks where a captured ship came from.",
    shipyard: ["raider", "smuggler"],
    traffic: { traders: 1, patrols: 0, pirates: 2, hostilePirates: 1, smugglers: 1 },
    economy: { food: 1.08, ore: 0.72, meds: 1.14, lux: 1.24, munitions: 0.82, contraband: 0.78 },
  },
  authority_gate: {
    id: "authority_gate",
    name: "Authority Gate",
    faction: "authority",
    description: "A hard-edged checkpoint system that pays premiums for munitions and punishes smugglers who get sloppy.",
    danger: 0.41,
    neighbors: ["union_harbor", "shale_barrens", "iron_hollow", "mirage_verge"],
    station: { x: 544, y: 140 },
    palette: { glow: "rgba(255, 214, 124, 0.09)", planet: "#8074a6", planetShadow: "#4c486b", station: "#c0d1ff", stationWarm: "#ffd980" },
    legality: "strict",
    routeNotes: "Checkpoint core-edge sector. Good lawful prices, bad place to be caught dirty.",
    intel: "Patrols scan aggressively here. Carry contraband through this lane only if you like stories ending early.",
    shipyard: ["patrol", "corvette"],
    traffic: { traders: 1, patrols: 2, pirates: 1, hostilePirates: 1, smugglers: 0 },
    economy: { food: 0.98, ore: 1.08, meds: 1.02, lux: 1.16, munitions: 1.28, contraband: 1.46 },
  },
  cinder_wake: {
    id: "cinder_wake",
    name: "Cinder Wake",
    faction: "independent",
    description: "A furnace-lit industrial stop where tug crews trade ore, fuel rumors, and ship plating by the crate.",
    danger: 0.31,
    neighbors: ["grey_exchange", "iron_hollow"],
    station: { x: 306, y: 484 },
    palette: { glow: "rgba(255, 136, 96, 0.12)", planet: "#8f5a49", planetShadow: "#553126", station: "#ffc39a", stationWarm: "#ffd37d" },
    legality: "open",
    routeNotes: "Industrial/mining sector with cheap ore, strong plating deals, and rougher pilots than they look.",
    intel: "Ore leaves cheap, plating starts cheap, and tugs sometimes hide salvage contracts in plain sight.",
    shipyard: ["tug", "trader"],
    traffic: { traders: 2, patrols: 0, pirates: 1, hostilePirates: 0, smugglers: 0 },
    economy: { food: 1.04, ore: 0.68, meds: 1.12, lux: 1.1, munitions: 1.02, contraband: 1.2 },
  },
  iron_hollow: {
    id: "iron_hollow",
    name: "Iron Hollow",
    faction: "frontier",
    description: "An extraction belt with hard cargo contracts, battered escorts, and a market that swings with every convoy delay.",
    danger: 0.48,
    neighbors: ["union_harbor", "cinder_wake", "authority_gate", "ember_market"],
    station: { x: 432, y: 378 },
    palette: { glow: "rgba(167, 225, 255, 0.08)", planet: "#667584", planetShadow: "#3c4a56", station: "#b9e6ff", stationWarm: "#ffe19c" },
    legality: "lawful",
    routeNotes: "Frontier shortage port sitting between industry and pirate leakage.",
    intel: "Ore is cheap, munitions spike when convoys get hit, and salvage jobs appear after every bad week.",
    shipyard: ["cutter", "tug", "trader"],
    traffic: { traders: 2, patrols: 1, pirates: 1, hostilePirates: 1, smugglers: 0 },
    economy: { food: 1.12, ore: 0.8, meds: 1.08, lux: 1.16, munitions: 1.2, contraband: 1.18 },
  },
  ember_market: {
    id: "ember_market",
    name: "Ember Market",
    faction: "syndicate",
    description: "A gray-market exchange hidden behind refinery glare where credits talk louder than flags.",
    danger: 0.58,
    neighbors: ["shale_barrens", "iron_hollow", "mirage_verge"],
    station: { x: 828, y: 356 },
    palette: { glow: "rgba(255, 112, 179, 0.1)", planet: "#8e5476", planetShadow: "#4f2f45", station: "#ffb6d6", stationWarm: "#ffd58d" },
    legality: "gray",
    routeNotes: "Black-market or gray zone where contraband routes come together and loyalties get rented.",
    intel: "Contraband clears fast, syndicate deals open up with warm rep, and patrols rarely stay long.",
    shipyard: ["smuggler", "raider", "corvette"],
    traffic: { traders: 1, patrols: 0, pirates: 1, hostilePirates: 1, smugglers: 2 },
    economy: { food: 1.02, ore: 1.02, meds: 1.18, lux: 0.92, munitions: 0.96, contraband: 0.72 },
  },
  mirage_verge: {
    id: "mirage_verge",
    name: "Mirage Verge",
    faction: "syndicate",
    description: "A strange edge system where survey crews, ghost traffic, and expensive data move under a long blue haze.",
    danger: 0.67,
    neighbors: ["authority_gate", "ember_market"],
    station: { x: 758, y: 92 },
    palette: { glow: "rgba(122, 182, 255, 0.12)", planet: "#5e75b0", planetShadow: "#344160", station: "#b9ccff", stationWarm: "#ffe6a1" },
    legality: "gray",
    routeNotes: "Weird-edge teaser sector with high payouts, smugglers, and enough patrol attention to keep runs dramatic.",
    intel: "Data couriers pay, patrols arrive late, and captains who learn this route print their own stories.",
    shipyard: ["smuggler", "patrol", "corvette"],
    traffic: { traders: 1, patrols: 1, pirates: 1, hostilePirates: 1, smugglers: 1 },
    economy: { food: 1.18, ore: 1.06, meds: 1.24, lux: 1.28, munitions: 1.12, contraband: 0.9 },
  },
};

const STAR_MAP = [
  { id: "grey_exchange", x: 0.18, y: 0.58 },
  { id: "union_harbor", x: 0.69, y: 0.27 },
  { id: "shale_barrens", x: 0.67, y: 0.73 },
  { id: "authority_gate", x: 0.48, y: 0.18 },
  { id: "cinder_wake", x: 0.28, y: 0.83 },
  { id: "iron_hollow", x: 0.42, y: 0.63 },
  { id: "ember_market", x: 0.82, y: 0.6 },
  { id: "mirage_verge", x: 0.79, y: 0.12 },
];

const state = {
  lastTime: 0,
  mode: "dock",
  currentSectorId: "grey_exchange",
  dockScreen: "root",
  selectedMenuIndex: 0,
  previousDockIndex: 0,
  selectedGamepadIndex: null,
  firstConnectedGamepadIndex: null,
  navHoldUntil: 0,
  actionLockUntil: 0,
  navButtons: {},
  buttonSnapshot: {},
  statusText: "",
  hintText: "",
  overlayTitle: "",
  overlayCopy: "",
  detailCards: [],
  player: {
    hullId: "kestrel",
    hull: HULLS.kestrel.maxHull,
    shield: HULLS.kestrel.maxShield,
    credits: 540,
    fuel: HULLS.kestrel.fuelCap,
    cargo: {},
    cargoCapBonus: 0,
    hullBonus: 0,
    x: WIDTH * 0.52,
    y: HEIGHT * 0.48,
    vx: 0,
    vy: 0,
    angle: -Math.PI / 2,
    fireCooldown: 0,
    boardSkill: 0.04,
    scannerLevel: 0,
    weaponLevel: 0,
    shieldCooldown: 0,
    bountyProgress: {},
    missionProgress: {},
  },
  factions: {
    independent: 6,
    authority: 0,
    frontier: 3,
    pirate: -8,
  },
  activeContracts: [],
  availableContracts: [],
  escortHangar: [],
  escortCommand: "defend",
  activeSectorEvent: null,
  scanState: null,
  scanCooldown: 0,
  debugVisible: false,
  factionArc: {
    stage: "intro",
    path: null,
    completed: [],
  },
  enemyShips: [],
  bullets: [],
  sparks: [],
  popup: null,
  starmapSelection: "union_harbor",
  starmapReturnMode: "dock",
  saveSlot: 0,
  discoveredSectors: ["grey_exchange", "union_harbor", "shale_barrens", "cinder_wake"],
  banner: null,
  bannerTimer: 0,
  screenShake: 0,
  stars: Array.from({ length: STAR_COUNT }, (_, index) => ({
    x: (Math.sin(index * 74.12) * 10000 % 1 + 1) % 1 * WIDTH,
    y: (Math.sin((index + 13) * 29.71) * 10000 % 1 + 1) % 1 * HEIGHT,
    size: 1 + (index % 3),
    alpha: 0.18 + (index % 6) * 0.08,
  })),
};

function currentSector() {
  return SECTORS[state.currentSectorId];
}

function debugLines() {
  const eventName = state.activeSectorEvent ? state.activeSectorEvent.title : "none";
  const scanName = state.scanState ? state.scanState.type : "none";
  return [
    `Sector ${currentSector().name} danger ${Math.round(currentSector().danger * 100)}%`,
    `Event ${eventName}`,
    `Scan ${scanName}`,
    `Rep A:${factionReputation("authority")} F:${factionReputation("frontier")} P:${factionReputation("pirate")} S:${factionReputation("syndicate")}`,
    `Contracts ${state.activeContracts.length} Escorts ${escortCount()} Save ${state.saveSlot + 1}`,
  ];
}

function currentHull() {
  return HULLS[state.player.hullId];
}

function maxHull() {
  return currentHull().maxHull + state.player.hullBonus;
}

function maxShield() {
  return currentHull().maxShield;
}

function maxCargo() {
  return currentHull().cargoCap + state.player.cargoCapBonus;
}

function cargoUsed() {
  return Object.values(state.player.cargo).reduce((sum, amount) => sum + amount, 0);
}

function cargoAmount(id) {
  return state.player.cargo[id] || 0;
}

function setStatus(text) {
  state.statusText = text;
}

function setHint(text) {
  state.hintText = text;
}

function setOverlay(title, copy) {
  state.overlayTitle = title;
  state.overlayCopy = copy;
}

function showBanner(title, copy, duration = 2.4) {
  state.banner = { title, copy };
  state.bannerTimer = duration;
}

function addScreenShake(amount = 10) {
  state.screenShake = Math.max(state.screenShake, amount);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function angleTo(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

function wrapBody(body) {
  if (body.x < -24) body.x += WIDTH + 48;
  if (body.x > WIDTH + 24) body.x -= WIDTH + 48;
  if (body.y < -24) body.y += HEIGHT + 48;
  if (body.y > HEIGHT + 24) body.y -= HEIGHT + 48;
}

function formatCredits(value) {
  return `${Math.round(value).toLocaleString()} cr`;
}

function commodityById(id) {
  return COMMODITIES.find((commodity) => commodity.id === id);
}

function factionName(id) {
  return FACTIONS.find((faction) => faction.id === id)?.name || id;
}

function toneForReputation(value) {
  if (value >= 10) return "good";
  if (value <= -10) return "bad";
  return "";
}

function repLabel(value) {
  if (value >= 16) return "Trusted";
  if (value >= 8) return "Warm";
  if (value >= -3) return "Neutral";
  if (value >= -11) return "Tense";
  return "Hostile";
}

function factionReputation(factionId) {
  return state.factions[factionId] || 0;
}

function currentSectorRep() {
  return factionReputation(currentSector().faction);
}

function hasContraband() {
  return cargoAmount("contraband") > 0;
}

function lawfulSector(sector = currentSector()) {
  return sector.legality === "lawful" || sector.legality === "strict";
}

function dockAccessState() {
  const sector = currentSector();
  const rep = factionReputation(sector.faction);
  if ((sector.legality === "lawful" || sector.legality === "strict") && rep <= -12) {
    return "restricted";
  }
  if (sector.legality === "gray" && rep >= 6) {
    return "favored";
  }
  return "open";
}

function escortCount() {
  return state.escortHangar.length;
}

function knownSectorIds() {
  return state.discoveredSectors.filter((id) => SECTORS[id]);
}

function discoverSector(sectorId) {
  if (!SECTORS[sectorId] || state.discoveredSectors.includes(sectorId)) return;
  state.discoveredSectors.push(sectorId);
}

function updateDiscoveredSectors(sectorId = state.currentSectorId) {
  discoverSector(sectorId);
  for (const neighborId of SECTORS[sectorId].neighbors) {
    discoverSector(neighborId);
  }
}

function saveStorageKey(slot = 0) {
  return `${SAVE_STORAGE_PREFIX}.${slot}`;
}

function savedRunMeta(slot = 0) {
  try {
    const raw = window.localStorage.getItem(saveStorageKey(slot));
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved || !saved.currentSectorId || !saved.player) return null;
    return {
      slot,
      savedAt: saved.savedAt,
      sectorName: SECTORS[saved.currentSectorId]?.name || "Unknown sector",
      credits: Number(saved.player.credits || 0),
      hullName: HULLS[saved.player.hullId]?.name || "Unknown ship",
    };
  } catch (_error) {
    return null;
  }
}

function contractsForSector(sectorId) {
  return state.activeContracts.filter((contract) => contract.destinationId === sectorId);
}

function contractBadgeText(sectorId) {
  const contracts = contractsForSector(sectorId);
  if (!contracts.length) return "";
  if (contracts.length === 1) return `Mission: ${contracts[0].title}`;
  return `${contracts.length} missions ready here`;
}

function contractBadgeShort(sectorId) {
  const contracts = contractsForSector(sectorId);
  if (!contracts.length) return "";
  return contracts.length === 1 ? "JOB" : `${contracts.length} JOBS`;
}

function activeMissionLines(limit = 5) {
  if (!state.activeContracts.length) {
    return ["No active missions. Dock up, hit the board, and stack a reason to travel."];
  }
  return state.activeContracts.slice(0, limit).map((contract) => {
    const destination = SECTORS[contract.destinationId]?.name || "Unknown";
    const tags = Array.isArray(contract.tags) && contract.tags.length ? ` • ${contract.tags.slice(0, 2).join(" / ")}` : "";
    return `${contract.title} -> ${destination}${tags}`;
  });
}

function missionSummaryCopy(limit = 4) {
  return activeMissionLines(limit).join(" | ");
}

function eventPoolForSector(sector = currentSector()) {
  const events = [
    {
      id: `${sector.id}-distress`,
      title: "Distress Ping",
      copy: "A battered freighter is screaming for escort cover somewhere in the lane.",
      tag: "Rescue",
    },
    {
      id: `${sector.id}-salvage-drift`,
      title: "Salvage Drift",
      copy: "Fresh wreck signatures are drifting through local traffic. Somebody will cash that in.",
      tag: "Salvage",
    },
  ];

  if (sector.legality === "strict" || sector.legality === "lawful") {
    events.push({
      id: `${sector.id}-convoy`,
      title: "Convoy Window",
      copy: "Merchant traffic is bunching up into a safer convoy lane. Clean jobs get easier for a few minutes.",
      tag: "Lawful",
    });
  }

  if (sector.legality === "strict") {
    events.push({
      id: `${sector.id}-scan-scare`,
      title: "Inspection Sweep",
      copy: "Patrol transponders are hot. Any dirty cargo is about to become a problem.",
      tag: "Patrol",
    });
  }

  if (sector.faction === "pirate" || sector.legality === "gray") {
    events.push({
      id: `${sector.id}-shadow-run`,
      title: "Pirate Shadow",
      copy: "Raider scouts are pacing haulers at range and waiting for somebody to blink first.",
      tag: "Pirate",
    });
    events.push({
      id: `${sector.id}-handoff`,
      title: "Black Market Handoff",
      copy: "Quiet buyers are moving through the lane. Contraband sells faster while they linger.",
      tag: "Gray",
    });
  }

  return events;
}

function chooseSectorEvent(sector = currentSector()) {
  const pool = eventPoolForSector(sector);
  if (pool.length === 0) {
    state.activeSectorEvent = null;
    return;
  }
  const index = Math.floor(Math.random() * pool.length);
  state.activeSectorEvent = {
    ...pool[index],
    timeLeft: EVENT_DURATION,
  };
}

function currentSectorEventTag() {
  return state.activeSectorEvent ? `${state.activeSectorEvent.title} | ${state.activeSectorEvent.tag}` : "No active lane event";
}

function activeArcContractId() {
  const path = state.factionArc.path;
  const stage = state.factionArc.stage;
  return path ? `arc-${path}-${stage}` : null;
}

function marketPrice(sectorId, commodityId) {
  const sector = SECTORS[sectorId];
  const commodity = commodityById(commodityId);
  const modifier = sector.economy[commodityId] || 1;
  const rep = factionReputation(sector.faction);
  const repAdjustment = clamp(1 - rep * 0.012, 0.82, 1.22);
  const legalAdjustment = sector.legality === "strict" && commodityId === "contraband"
    ? 1.18
    : sector.legality === "gray" && commodityId === "contraband"
      ? 0.82
      : sector.faction === "pirate" && commodityId === "contraband"
        ? 0.78
        : 1;
  return Math.round(commodity.base * modifier * repAdjustment * legalAdjustment);
}

function missionRewardBase(sectorId) {
  const sector = SECTORS[sectorId];
  return 90 + Math.round(sector.danger * 260) + (sector.legality === "strict" ? 14 : sector.legality === "gray" ? 26 : 0);
}

function generateContracts(sectorId) {
  const sector = SECTORS[sectorId];
  const contracts = [];
  const neighbors = sector.neighbors;
  const firstTarget = neighbors[0];
  const secondTarget = neighbors[1] || neighbors[0];
  const lastTarget = neighbors[neighbors.length - 1];
  const cargoCommodity = COMMODITIES[(sectorId.length + neighbors.length) % COMMODITIES.length];
  const localJobCommodity = COMMODITIES[(sectorId.charCodeAt(0) + 3) % COMMODITIES.length];
  const smugglingTarget = neighbors.find((id) => SECTORS[id].legality !== "strict") || neighbors[0];

  contracts.push({
    id: `${sectorId}-cargo`,
    type: "cargo",
    title: `Freight ${cargoCommodity.name} to ${SECTORS[firstTarget].name}`,
    copy: `Move ${cargoCommodity.name.toLowerCase()} through one jump lane for a clean payout and better standing with ${factionName(SECTORS[firstTarget].faction)}.`,
    reward: missionRewardBase(firstTarget) + 80,
    commodityId: cargoCommodity.id,
    amount: 2,
    destinationId: firstTarget,
    factionId: sector.faction,
    tags: ["Cargo", "Lawful"],
  });

  contracts.push({
    id: `${sectorId}-courier`,
    type: "courier",
    title: `Courier packet to ${SECTORS[secondTarget].name}`,
    copy: `Dock at ${SECTORS[secondTarget].name} with the packet intact. No cargo space required, just a clean run.`,
    reward: missionRewardBase(secondTarget) + 72,
    destinationId: secondTarget,
    factionId: sector.faction,
    tags: ["Courier", "Fast"],
  });

  contracts.push({
    id: `${sectorId}-bounty`,
    type: "bounty",
    title: `Clear raiders near ${SECTORS[lastTarget].name}`,
    copy: `Disable one pirate ship in ${SECTORS[lastTarget].name} and dock anywhere lawful to clear the bounty escrow.`,
    reward: missionRewardBase(lastTarget) + 130,
    requiredKills: 1,
    destinationId: lastTarget,
    factionId: sector.faction === "pirate" ? "authority" : sector.faction,
    tags: ["Bounty", "Combat"],
  });

  contracts.push({
    id: `${sectorId}-salvage`,
    type: "salvage",
    title: `Recover salvage around ${SECTORS[lastTarget].name}`,
    copy: `Board or strip one disabled ship in ${SECTORS[lastTarget].name}. Salvage crews pay for whatever story brought it in.`,
    reward: missionRewardBase(lastTarget) + 118,
    requiredBoards: 1,
    destinationId: lastTarget,
    factionId: sector.faction === "pirate" ? "independent" : sector.faction,
    tags: ["Salvage", "Boarding"],
  });

  contracts.push({
    id: `${sectorId}-market`,
    type: "market",
    title: `Bring back ${localJobCommodity.name}`,
    copy: `Return with three units of ${localJobCommodity.name.toLowerCase()} margin from your next run. The board pays for hustle, not purity.`,
    reward: missionRewardBase(sectorId) + 110,
    commodityId: localJobCommodity.id,
    amount: 3,
    destinationId: sectorId,
    factionId: "independent",
    tags: ["Trade", "Flexible"],
  });

  contracts.push({
    id: `${sectorId}-smuggle`,
    type: "smuggling",
    title: `Nightglass handoff to ${SECTORS[smugglingTarget].name}`,
    copy: `Carry a sealed contraband packet to ${SECTORS[smugglingTarget].name}. Strict checkpoints will make this spicy.`,
    reward: missionRewardBase(smugglingTarget) + 164,
    commodityId: "contraband",
    amount: 1,
    destinationId: smugglingTarget,
    factionId: sector.legality === "gray" || sector.faction === "pirate" ? sector.faction : "syndicate",
    contraband: true,
    tags: ["Smuggling", "Illegal"],
  });

  const arcContract = generateFactionArcContract(sectorId);
  if (arcContract) {
    contracts.push(arcContract);
  }

  return contracts;
}

function generateFactionArcContract(sectorId) {
  const stage = state.factionArc.stage;
  const path = state.factionArc.path;

  if (stage === "intro" && path && !state.factionArc.completed.includes(`arc-choice-${path}`)) {
    return null;
  }

  if (stage === "intro" && !path && sectorId === "grey_exchange") {
    return {
      id: "arc-choice-syndicate",
      type: "courier",
      title: "Nightglass Offer",
      copy: "A Nightglass broker wants a sealed courier packet moved quietly to Ember Market. Taking it means choosing a side.",
      reward: 188,
      destinationId: "ember_market",
      factionId: "syndicate",
      arcChoice: "syndicate",
      tags: ["Faction Arc", "Choice", "Gray"],
    };
  }
  if (stage === "intro" && !path && sectorId === "authority_gate") {
    return {
      id: "arc-choice-authority",
      type: "courier",
      title: "Customs Tipoff",
      copy: "Authority handlers want a quiet courier packet delivered to the checkpoint office. They claim it keeps the lane clean.",
      reward: 176,
      destinationId: "authority_gate",
      factionId: "authority",
      arcChoice: "authority",
      tags: ["Faction Arc", "Choice", "Lawful"],
    };
  }

  if (stage === "path-job-1" && path === "syndicate" && sectorId === "ember_market") {
    return {
      id: "arc-syndicate-path-job-1",
      type: "smuggling",
      title: "Quiet Wake",
      copy: "Carry a sealed Nightglass package to Mirage Verge without letting a checkpoint crew touch it.",
      reward: 244,
      commodityId: "contraband",
      amount: 1,
      destinationId: "mirage_verge",
      factionId: "syndicate",
      contraband: true,
      tags: ["Faction Arc", "Smuggling", "Gray"],
    };
  }

  if (stage === "path-job-1" && path === "authority" && sectorId === "authority_gate") {
    return {
      id: "arc-authority-path-job-1",
      type: "bounty",
      title: "Sweep The Verge",
      copy: "Disable one pirate ship near Mirage Verge and return through a lawful dock to clear the checkpoint ledger.",
      reward: 236,
      requiredKills: 1,
      destinationId: "mirage_verge",
      factionId: "authority",
      tags: ["Faction Arc", "Bounty", "Lawful"],
    };
  }

  if (stage === "path-job-2" && path === "syndicate" && sectorId === "mirage_verge") {
    return {
      id: "arc-syndicate-path-job-2",
      type: "courier",
      title: "Burn Notice",
      copy: "Deliver Nightglass intel back to Grey Exchange and keep the lane hot enough to confuse the patrols.",
      reward: 268,
      destinationId: "grey_exchange",
      factionId: "syndicate",
      tags: ["Faction Arc", "Courier", "Gray"],
    };
  }

  if (stage === "path-job-2" && path === "authority" && sectorId === "mirage_verge") {
    return {
      id: "arc-authority-path-job-2",
      type: "courier",
      title: "Checkpoint Report",
      copy: "Bring the Mirage Verge sweep report back to Union Harbor so the Authority can tighten the lane.",
      reward: 254,
      destinationId: "union_harbor",
      factionId: "authority",
      tags: ["Faction Arc", "Courier", "Lawful"],
    };
  }

  return null;
}

function resetContractsForSector() {
  state.availableContracts = generateContracts(state.currentSectorId);
}

function addCargo(commodityId, amount) {
  if (cargoUsed() + amount > maxCargo()) {
    return false;
  }
  state.player.cargo[commodityId] = cargoAmount(commodityId) + amount;
  return true;
}

function removeCargo(commodityId, amount) {
  const current = cargoAmount(commodityId);
  if (current < amount) {
    return false;
  }
  const next = current - amount;
  if (next > 0) {
    state.player.cargo[commodityId] = next;
  } else {
    delete state.player.cargo[commodityId];
  }
  return true;
}

function modifyReputation(factionId, delta) {
  state.factions[factionId] = clamp((state.factions[factionId] || 0) + delta, -20, 20);
}

function createSpark(x, y, color, count = 10) {
  for (let index = 0; index < count; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 120;
    state.sparks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.2 + Math.random() * 0.5,
      maxLife: 0.4 + Math.random() * 0.4,
      color,
    });
  }
}

function rechargeShield(body, cap, regenPerSecond, dt) {
  if (body.disabled) return;
  body.shieldCooldown = Math.max(0, (body.shieldCooldown || 0) - dt);
  if (body.shieldCooldown > 0) {
    return;
  }
  body.shield = clamp((body.shield || 0) + regenPerSecond * dt, 0, cap);
}

function applyDamageToTarget(target, damage, shieldColor, hullColor) {
  let remaining = damage;
  if ((target.shield || 0) > 0) {
    const absorbed = Math.min(target.shield, remaining);
    target.shield -= absorbed;
    remaining -= absorbed;
    target.shieldCooldown = 2.2;
    createSpark(target.x, target.y, shieldColor, absorbed >= damage ? 6 : 10);
    if (target.shield <= 0) {
      createSpark(target.x, target.y, "#b7f1ff", 12);
      addScreenShake(5);
    }
  }
  if (remaining > 0) {
    target.hull -= remaining;
    createSpark(target.x, target.y, hullColor, 8);
    addScreenShake(6);
  }
}

function spawnEnemy(type, x, y, options = {}) {
  const variants = {
    pirate: { hullId: "raider", hull: 74, speed: 118, color: "#ff8a8a", reward: 110, boardDifficulty: 0.45, faction: "pirate", disposition: "neutral", weaponProfile: "scatter" },
    patrol: { hullId: "patrol", hull: 112, speed: 112, color: "#7ad8ff", reward: 90, boardDifficulty: 0.36, faction: "authority", disposition: "neutral", weaponProfile: "pulse" },
    trader: { hullId: "trader", hull: 94, speed: 82, color: "#ffe081", reward: 48, boardDifficulty: 0.24, faction: "independent", disposition: "neutral", weaponProfile: "missile" },
    smuggler: { hullId: "smuggler", hull: 106, speed: 126, color: "#f6a5d7", reward: 78, boardDifficulty: 0.38, faction: "syndicate", disposition: "neutral", weaponProfile: "scatter" },
  };
  const variant = { ...variants[type], ...options };
  state.enemyShips.push({
    id: `${type}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    x,
    y,
    vx: 0,
    vy: 0,
    angle: Math.random() * Math.PI * 2,
    hull: variant.hull,
    shield: Math.round(HULLS[variant.hullId].maxShield * (type === "pirate" ? 0.7 : type === "trader" ? 0.85 : 1)),
    maxHull: variant.hull,
    maxShield: HULLS[variant.hullId].maxShield,
    shieldRegen: HULLS[variant.hullId].shieldRegen,
    speed: variant.speed,
    color: variant.color,
    reward: variant.reward,
    faction: variant.faction,
    hullId: variant.hullId,
    weaponProfile: variant.weaponProfile || HULLS[variant.hullId].weaponProfile,
    boardDifficulty: variant.boardDifficulty,
    disposition: variant.disposition,
    contactState: variant.disposition,
    disabled: false,
    fireCooldown: 1 + Math.random() * 1.4,
    shieldCooldown: 0,
    cargo: { ore: type === "trader" ? 2 : 1, munitions: type === "pirate" ? 1 : 0 },
  });
}

function refillSectorTraffic() {
  state.enemyShips = [];
  state.bullets = [];
  const sector = currentSector();
  const layout = sector.traffic || { traders: 2, patrols: 1, pirates: 1, hostilePirates: 0, smugglers: 0 };
  const lawfulHeat = lawfulSector(sector) && currentSectorRep() <= -8 ? 1 : 0;
  const pirateHeat = sector.faction === "pirate" || sector.legality === "gray" ? 0 : 1;

  for (let index = 0; index < layout.pirates; index += 1) {
    spawnEnemy("pirate", 120 + Math.random() * 720, 80 + Math.random() * 420, { disposition: pirateHeat && Math.random() < sector.danger * 0.34 ? "suspicious" : "neutral" });
  }
  for (let index = 0; index < layout.hostilePirates; index += 1) {
    spawnEnemy("pirate", 120 + Math.random() * 720, 80 + Math.random() * 420, { disposition: "hostile" });
  }
  for (let index = 0; index < layout.patrols; index += 1) {
    spawnEnemy("patrol", 180 + Math.random() * 620, 120 + Math.random() * 320, { disposition: lawfulHeat ? "suspicious" : "neutral" });
  }
  for (let index = 0; index < layout.traders; index += 1) {
    spawnEnemy("trader", 150 + Math.random() * 680, 100 + Math.random() * 380, { disposition: "neutral" });
  }
  for (let index = 0; index < (layout.smugglers || 0); index += 1) {
    spawnEnemy("smuggler", 150 + Math.random() * 680, 100 + Math.random() * 380, { disposition: sector.legality === "strict" ? "suspicious" : "neutral", cargo: { contraband: 2, lux: 1 } });
  }

  if (state.activeSectorEvent?.tag === "Lawful") {
    spawnEnemy("trader", 160 + Math.random() * 640, 110 + Math.random() * 340, { disposition: "neutral", cargo: { food: 2, meds: 1 } });
  }
  if (state.activeSectorEvent?.tag === "Pirate") {
    spawnEnemy("pirate", 160 + Math.random() * 640, 110 + Math.random() * 340, { disposition: "suspicious" });
  }
  if (state.activeSectorEvent?.tag === "Gray") {
    spawnEnemy("smuggler", 160 + Math.random() * 640, 110 + Math.random() * 340, { disposition: "neutral", cargo: { contraband: 1, lux: 2 } });
  }
}

function enterDockMode(message) {
  state.mode = "dock";
  state.dockScreen = "root";
  state.selectedMenuIndex = state.previousDockIndex || 0;
  state.popup = null;
  state.player.vx = 0;
  state.player.vy = 0;
  updateDiscoveredSectors();
  resetContractsForSector();
  resolveContractsOnDock();
  if (dockAccessState() === "restricted") {
    setStatus(message || `Restricted docking at ${currentSector().name}. Services only until relations improve.`);
    setHint("You can save, repair, refuel, and leave. Lawful stations close their good doors to hostile captains.");
  } else {
    setStatus(message || `Docked at ${currentSector().name}.`);
    setHint("Use the command deck to trade, refit, browse contracts, or push back into the lane.");
  }
  setOverlay(`Docked at ${currentSector().name}`, currentSector().intel || currentSector().description);
  showBanner(currentSector().name, "Docked and on station power.", 2);
}

function enterFlightMode(message) {
  state.mode = "flight";
  state.popup = null;
  state.scanState = null;
  state.actionLockUntil = performance.now() + 260;
  state.player.x = currentSector().station.x + 90;
  state.player.y = currentSector().station.y;
  state.player.vx = 0;
  state.player.vy = 0;
  state.player.fireCooldown = 0.16;
  keyboard.fire = false;
  keyboard.pause = false;
  chooseSectorEvent();
  refillSectorTraffic();
  setStatus(message || `${currentSector().name} lane active.`);
  setHint(`Steer with stick or d-pad. South fires, west docks or boards, north opens the starmap. ${currentSectorEventTag()}.`);
  setOverlay(currentSector().name, "Traffic is live. Pick your fights, dock clean, or jump before the sector notices what you stole.");
  showBanner(currentSector().name, "Undocked. Lane traffic is live.", 2.4);
}

function completeContract(contract, bonusText) {
  state.player.credits += contract.reward;
  modifyReputation(contract.factionId, 2);
  state.activeContracts = state.activeContracts.filter((active) => active.id !== contract.id);
  advanceFactionArc(contract);
  setStatus(`${contract.title} complete. ${formatCredits(contract.reward)} paid. ${bonusText || ""}`.trim());
}

function failContracts(predicate, reason, repFaction = null, repDelta = 0) {
  const failed = state.activeContracts.filter(predicate);
  if (failed.length === 0) return;
  state.activeContracts = state.activeContracts.filter((contract) => !predicate(contract));
  for (const contract of failed) {
    if ((contract.type === "cargo" || contract.type === "smuggling") && contract.commodityId) {
      removeCargo(contract.commodityId, Math.min(contract.amount || 0, cargoAmount(contract.commodityId)));
    }
    if (contract.type === "bounty") {
      delete state.player.bountyProgress[contract.id];
    }
    if (contract.type === "salvage") {
      delete state.player.missionProgress[contract.id];
    }
  }
  if (repFaction && repDelta) {
    modifyReputation(repFaction, repDelta);
  }
  setStatus(reason);
}

function advanceFactionArc(contract) {
  if (contract.id === "arc-choice-syndicate") {
    state.factionArc.path = "syndicate";
    state.factionArc.stage = "path-job-1";
    state.factionArc.completed.push(contract.id);
    modifyReputation("syndicate", 3);
    showBanner("Nightglass In", "The Syndicate now treats you like a useful captain.", 3);
    return;
  }
  if (contract.id === "arc-choice-authority") {
    state.factionArc.path = "authority";
    state.factionArc.stage = "path-job-1";
    state.factionArc.completed.push(contract.id);
    modifyReputation("authority", 3);
    showBanner("Checkpoint Cleared", "The Authority now considers you worth briefings.", 3);
    return;
  }
  if (contract.id === "arc-syndicate-path-job-1") {
    state.factionArc.stage = "path-job-2";
    state.factionArc.completed.push(contract.id);
    modifyReputation("authority", -2);
    return;
  }
  if (contract.id === "arc-authority-path-job-1") {
    state.factionArc.stage = "path-job-2";
    state.factionArc.completed.push(contract.id);
    modifyReputation("pirate", -1);
    return;
  }
  if (contract.id === "arc-syndicate-path-job-2") {
    state.factionArc.stage = "resolved";
    state.factionArc.completed.push(contract.id);
    modifyReputation("syndicate", 4);
    modifyReputation("authority", -2);
    showBanner("Gray Wake", "Nightglass routes open wider for you now.", 3.2);
    return;
  }
  if (contract.id === "arc-authority-path-job-2") {
    state.factionArc.stage = "resolved";
    state.factionArc.completed.push(contract.id);
    modifyReputation("authority", 4);
    modifyReputation("syndicate", -2);
    showBanner("Clean Lanes", "Authority checkpoints now treat you more warmly.", 3.2);
  }
}

function resolveContractsOnDock() {
  const sectorId = state.currentSectorId;
  for (const contract of [...state.activeContracts]) {
    if (contract.type === "cargo" && contract.destinationId === sectorId && cargoAmount(contract.commodityId) >= contract.amount) {
      removeCargo(contract.commodityId, contract.amount);
      completeContract(contract, "Cargo offloaded.");
    } else if (contract.type === "courier" && contract.destinationId === sectorId) {
      completeContract(contract, "Packet transferred.");
    } else if (contract.type === "market" && contract.destinationId === sectorId && cargoAmount(contract.commodityId) >= contract.amount) {
      removeCargo(contract.commodityId, contract.amount);
      completeContract(contract, "Speculation paid off.");
    } else if (contract.type === "smuggling" && contract.destinationId === sectorId && cargoAmount(contract.commodityId) >= contract.amount) {
      removeCargo(contract.commodityId, contract.amount);
      modifyReputation("syndicate", 2);
      completeContract(contract, "Handoff clean. Nobody asked questions.");
    } else if (contract.type === "salvage" && (state.player.missionProgress[contract.id] || 0) >= contract.requiredBoards && contract.destinationId === sectorId) {
      completeContract(contract, "Salvage crew paid out.");
      delete state.player.missionProgress[contract.id];
    } else if (contract.type === "bounty" && (state.player.bountyProgress[contract.id] || 0) >= contract.requiredKills && sectorId !== "shale_barrens") {
      completeContract(contract, "Bounty escrow cleared.");
      delete state.player.bountyProgress[contract.id];
    }
  }
}

function tryBuyCommodity(commodityId) {
  if (dockAccessState() === "restricted") {
    setStatus("Station trade access is restricted.");
    return;
  }
  if (commodityId === "contraband" && currentSector().legality === "strict") {
    setStatus("This station will not openly sell contraband.");
    return;
  }
  const price = marketPrice(state.currentSectorId, commodityId);
  if (state.player.credits < price) {
    setStatus("Not enough credits for that load.");
    return;
  }
  if (!addCargo(commodityId, 1)) {
    setStatus("Cargo hold is full.");
    return;
  }
  state.player.credits -= price;
  setStatus(`Bought ${commodityById(commodityId).name} for ${formatCredits(price)}.`);
}

function trySellCommodity(commodityId) {
  if (dockAccessState() === "restricted" && commodityId !== "contraband") {
    setStatus("Trade access is restricted to emergency processing only.");
    return;
  }
  const price = marketPrice(state.currentSectorId, commodityId);
  if (!removeCargo(commodityId, 1)) {
    setStatus("You do not have that commodity on board.");
    return;
  }
  state.player.credits += price;
  setStatus(`Sold ${commodityById(commodityId).name} for ${formatCredits(price)}.`);
}

function acceptContract(contractId) {
  if (dockAccessState() === "restricted") {
    setStatus("Local dispatch will not offer contracts while your papers read hostile.");
    return;
  }
  const contract = state.availableContracts.find((entry) => entry.id === contractId);
  if (!contract) return;
  if (state.activeContracts.some((entry) => entry.id === contractId)) {
    setStatus("That contract is already active.");
    return;
  }
  if (state.activeContracts.length >= 3) {
    setStatus("Your dispatch board is full. Finish something first.");
    return;
  }
  state.activeContracts.push({ ...contract });
  if (contract.arcChoice) {
    state.factionArc.path = contract.arcChoice;
  }
  if (contract.type === "cargo" || contract.type === "smuggling") {
    if (!addCargo(contract.commodityId, contract.amount)) {
      state.activeContracts = state.activeContracts.filter((entry) => entry.id !== contract.id);
      setStatus("Not enough cargo space for that freight contract.");
      return;
    }
  }
  if (contract.arcChoice) {
    state.availableContracts = state.availableContracts.filter((entry) => entry.id !== contractId);
  }
  setStatus(`Accepted: ${contract.title}.`);
}

function upgradeHullPlating() {
  const cost = 220 + state.player.hullBonus * 4;
  if (state.player.credits < cost) {
    setStatus("Not enough credits for ship plating.");
    return;
  }
  if (state.player.hullBonus >= 60) {
    setStatus("This ship is already running hot on extra plating.");
    return;
  }
  state.player.credits -= cost;
  state.player.hullBonus += 20;
  state.player.hull = maxHull();
  state.player.shield = maxShield();
  setStatus(`Ship reinforced. Max ship integrity is now ${maxHull()}.`);
}

function upgradeCargoRacks() {
  const cost = 180 + state.player.cargoCapBonus * 35;
  if (state.player.credits < cost) {
    setStatus("Not enough credits for cargo racks.");
    return;
  }
  if (state.player.cargoCapBonus >= 6) {
    setStatus("Cargo racks are already maxed for this slice.");
    return;
  }
  state.player.credits -= cost;
  state.player.cargoCapBonus += 2;
  setStatus(`Cargo racks fitted. Capacity is now ${maxCargo()}.`);
}

function upgradePulseArray() {
  const cost = 260 + state.player.weaponLevel * 100;
  if (state.player.credits < cost) {
    setStatus("Not enough credits for a pulse-array tune.");
    return;
  }
  if (state.player.weaponLevel >= 2) {
    setStatus("Weapons are already tuned as far as this dock can safely push.");
    return;
  }
  state.player.credits -= cost;
  state.player.weaponLevel += 1;
  setStatus("Pulse array tuned. Fire rate and impact improved.");
}

function purchaseHull(hullId) {
  const hull = HULLS[hullId];
  if (!hull) return;
  if (!(currentSector().shipyard || []).includes(hullId)) {
    setStatus("This station cannot source that ship.");
    return;
  }
  if (state.player.credits < hull.sale) {
    setStatus("Not enough credits to buy that ship.");
    return;
  }
  if (escortCount() >= MAX_ESCORTS) {
    setStatus("Hangar is full. Sell or swap a ship before buying another.");
    return;
  }
  state.player.credits -= hull.sale;
  state.escortHangar.push({ name: hull.name, sale: hull.sale, hullId });
  setStatus(`${hull.name} purchased and moved into your hangar.`);
}

function repairShip() {
  const missing = maxHull() - state.player.hull;
  if (missing <= 0) {
    setStatus("Ship already topped off.");
    return;
  }
  const cost = Math.ceil(missing * 1.9);
  if (state.player.credits < cost) {
    setStatus("Not enough credits for a full repair ticket.");
    return;
  }
  state.player.credits -= cost;
  state.player.hull = maxHull();
  state.player.shield = maxShield();
  setStatus(`Ship restored for ${formatCredits(cost)}.`);
}

function refuelShip() {
  const missing = currentHull().fuelCap - state.player.fuel;
  if (missing <= 0) {
    setStatus("Fuel tanks already full.");
    return;
  }
  const cost = missing * 36;
  if (state.player.credits < cost) {
    setStatus("Not enough credits for fuel.");
    return;
  }
  state.player.credits -= cost;
  state.player.fuel = currentHull().fuelCap;
  setStatus(`Tanks refilled for ${formatCredits(cost)}.`);
}

function triggerPatrolScan(ship) {
  if (state.scanState || state.popup) return;
  const carryingContraband = hasContraband();
  const badStanding = factionReputation("authority") <= -9;
  if (!carryingContraband && !badStanding) return;

  state.scanState = {
    type: "patrol-scan",
    patrolId: ship.id,
    carryingContraband,
    badStanding,
  };
  state.scanCooldown = 12;

  const fine = carryingContraband ? 110 : 70;
  openPopup({
    title: "Patrol Scan",
    copy: carryingContraband
      ? "Authority patrols have you on a hot scan. They found dirty cargo and want the situation resolved immediately."
      : "Authority patrols are leaning on your registry. They want a compliance payment or a reason to escalate.",
    options: [
      {
        label: "Pay Fine",
        meta: `${formatCredits(fine)} | Lose standing and keep moving`,
        confirm() {
          closePopup();
          resolvePatrolScan("fine", fine);
        },
      },
      {
        label: "Dump Cargo",
        meta: carryingContraband ? "Jettison contraband to cool the checkpoint" : "No dirty cargo to dump",
        disabled: !carryingContraband,
        confirm() {
          closePopup();
          resolvePatrolScan("dump", fine);
        },
      },
      {
        label: "Punch It",
        meta: "Refuse inspection and turn the patrol hostile",
        confirm() {
          closePopup();
          resolvePatrolScan("run", fine);
        },
      },
    ],
  });
}

function resolvePatrolScan(action, fine) {
  const patrol = state.enemyShips.find((ship) => ship.id === state.scanState?.patrolId);
  if (action === "fine") {
    state.player.credits = Math.max(0, state.player.credits - fine);
    modifyReputation("authority", -2);
    failContracts((contract) => contract.type === "smuggling", "Checkpoint fine paid. Any active smuggling handoff is blown.", "syndicate", -2);
    setStatus(`Inspection resolved with a fine of ${formatCredits(fine)}.`);
  } else if (action === "dump") {
    const dumped = cargoAmount("contraband");
    if (dumped > 0) {
      removeCargo("contraband", dumped);
    }
    modifyReputation("authority", -1);
    failContracts((contract) => contract.type === "smuggling", "Contraband dumped under patrol pressure. Smuggling work failed.", "syndicate", -2);
    setStatus("Contraband dumped. Patrols stand down, but the buyers will remember this.");
  } else {
    if (patrol) {
      patrol.disposition = "hostile";
      patrol.contactState = "hostile";
    }
    for (const ship of state.enemyShips) {
      if (ship.type === "patrol" && distance(ship, state.player) < 240) {
        ship.disposition = "hostile";
        ship.contactState = "hostile";
      }
    }
    modifyReputation("authority", -3);
    setStatus("Inspection refused. Patrols are now hostile.");
  }
  state.scanState = null;
}

function sellEscort(index) {
  const escort = state.escortHangar[index];
  if (!escort) return;
  state.escortHangar.splice(index, 1);
  state.player.credits += escort.sale;
  setStatus(`Sold ${escort.name} for ${formatCredits(escort.sale)}.`);
}

function swapFlagship(index) {
  const escort = state.escortHangar[index];
  if (!escort) return;
  const nextHull = HULLS[escort.hullId];
  if (!nextHull) return;
  const currentShip = {
    name: currentHull().name,
    sale: currentHull().sale,
    hullId: state.player.hullId,
  };
  state.player.hullId = escort.hullId;
  state.player.hull = Math.min(nextHull.maxHull + state.player.hullBonus, nextHull.maxHull + state.player.hullBonus);
  state.player.shield = nextHull.maxShield;
  state.player.fuel = Math.min(state.player.fuel, nextHull.fuelCap);
  state.escortHangar.splice(index, 1, currentShip);
  setStatus(`Flagship swapped to ${nextHull.name}.`);
}

function cycleEscortCommand() {
  const commands = ["defend", "follow", "attack", "regroup"];
  const nextIndex = (commands.indexOf(state.escortCommand) + 1) % commands.length;
  state.escortCommand = commands[nextIndex];
  setStatus(`Escort command set to ${state.escortCommand}.`);
}

function travelToSector(targetSectorId) {
  const sector = currentSector();
  if (!sector.neighbors.includes(targetSectorId)) {
    setStatus("That lane is not linked from here.");
    return;
  }
  if (state.player.fuel <= 0) {
    setStatus("No fuel for hyperspace.");
    return;
  }
  state.player.fuel -= 1;
  state.currentSectorId = targetSectorId;
  state.starmapSelection = targetSectorId;
  updateDiscoveredSectors(targetSectorId);
  setStatus(`Jump complete. Entered ${currentSector().name}.`);
  if (state.mode === "dock" || state.starmapReturnMode === "dock") {
    enterDockMode(`Arrived in ${currentSector().name}.`);
  } else {
    enterFlightMode(`Hyperspace exit complete in ${currentSector().name}.`);
  }
}

function openStarmap(returnMode = state.mode === "dock" ? "dock" : "flight", selection = null) {
  state.starmapReturnMode = returnMode;
  state.mode = "starmap";
  state.selectedMenuIndex = 0;
  if (selection && SECTORS[selection]) {
    state.starmapSelection = selection;
    const neighborIndex = currentSector().neighbors.indexOf(selection);
    if (neighborIndex >= 0) {
      state.selectedMenuIndex = neighborIndex;
    }
  }
  setStatus(`Starmap open over ${currentSector().name}.`);
  setHint("Chart open. Browse connected sectors and active mission destinations, south confirms, B exits.");
}

function openDockScreen(screen) {
  state.dockScreen = screen;
  state.selectedMenuIndex = 0;
  if (screen === "market") {
    setHint("Browse prices with the d-pad. South buys or sells one unit. B undocks from port.");
  } else if (screen === "contracts") {
    setHint("Review route tags and payout, then take work with south. B undocks from port.");
  } else if (screen === "outfitter") {
    setHint("Compare ships and upgrades from the command deck. South commits a purchase. B undocks.");
  } else if (screen === "hangar") {
    setHint("Swap flagship, sell captured ships, or change escort doctrine from here. B undocks.");
  } else if (screen === "services") {
    setHint("Save, load, repair, and refuel from port services. B undocks from port.");
  }
}

function closeDockScreen() {
  state.dockScreen = "root";
  state.selectedMenuIndex = state.previousDockIndex || 0;
  setHint("Use the command deck to trade, refit, browse contracts, or push back into the lane. B undocks immediately.");
}

function openPopup(config) {
  state.popup = {
    title: config.title,
    copy: config.copy,
    options: config.options,
    selectedIndex: 0,
    style: config.style || "modal",
    anchorX: config.anchorX ?? WIDTH * 0.5,
    anchorY: config.anchorY ?? HEIGHT * 0.5,
  };
  state.selectedMenuIndex = 0;
}

function closePopup() {
  state.popup = null;
}

function nearestDisabledShip() {
  let match = null;
  let best = Infinity;
  for (const ship of state.enemyShips) {
    if (!ship.disabled) continue;
    const d = distance(state.player, ship);
    if (d < best) {
      best = d;
      match = ship;
    }
  }
  return match && best <= BOARD_RANGE ? match : null;
}

function tryBoardNearestShip() {
  const ship = nearestDisabledShip();
  if (!ship) {
    setStatus("No disabled ship close enough to board.");
    return;
  }
  const boardChance = clamp(0.46 + state.player.boardSkill + currentHull().boardBonus + state.escortHangar.length * 0.05 - ship.boardDifficulty, 0.22, 0.88);
  const anchorX = (state.player.x + ship.x) * 0.5;
  const anchorY = (state.player.y + ship.y) * 0.5 - 36;
  openPopup({
    title: `Board ${HULLS[ship.hullId].name}`,
    copy: `Hold west near the drifting ship, then board. Odds ${Math.round(boardChance * 100)}%. If the team gets aboard cleanly, you decide what happens next.`,
    style: "boarding",
    anchorX,
    anchorY,
    options: [
      {
        label: "Launch Boarding Action",
        meta: "Breach the ship and secure the deck",
        confirm() {
          closePopup();
          resolveBoarding(ship, boardChance);
        },
      },
      {
        label: "Stand Down",
        meta: "Leave the drifting ship where it is",
        confirm() {
          closePopup();
          setStatus("Boarding action cancelled.");
        },
      },
    ],
  });
}

function noteSalvageProgress() {
  for (const contract of state.activeContracts) {
    if (contract.type === "salvage" && contract.destinationId === state.currentSectorId) {
      state.player.missionProgress[contract.id] = (state.player.missionProgress[contract.id] || 0) + 1;
    }
  }
}

function finalizeBoardingRemoval(ship, sparkColor = "#9ef59f", sparkCount = 16) {
  noteSalvageProgress();
  state.enemyShips = state.enemyShips.filter((entry) => entry.id !== ship.id);
  createSpark(ship.x, ship.y, sparkColor, sparkCount);
  addScreenShake(6);
}

function lootDisabledShip(ship) {
  const lootValue = Object.entries(ship.cargo).filter(([, amount]) => amount > 0);
  let moved = 0;
  for (const [commodityId, amount] of lootValue) {
    for (let index = 0; index < amount; index += 1) {
      if (addCargo(commodityId, 1)) {
        moved += 1;
      }
    }
  }
  modifyReputation(ship.faction === "pirate" ? "pirate" : ship.faction, ship.faction === "pirate" ? -1 : -2);
  finalizeBoardingRemoval(ship, "#9ef59f", 12);
  setStatus(moved > 0 ? `Boarding complete. Cargo stripped from the ${HULLS[ship.hullId].name}.` : `Boarding complete, but there was barely anything worth hauling out.`);
}

function captureDisabledShip(ship) {
  const hullDef = HULLS[ship.hullId];
  if (state.escortHangar.length >= MAX_ESCORTS) {
    setStatus("Escort roster is full. Clear a slot before trying to capture another ship.");
    return;
  }
  state.escortHangar.push({ name: hullDef.name, sale: hullDef.sale, hullId: ship.hullId });
  modifyReputation(ship.faction === "pirate" ? "pirate" : ship.faction, ship.faction === "pirate" ? -1 : -2);
  finalizeBoardingRemoval(ship, "#9ef59f", 18);
  setStatus(`${hullDef.name} captured and folded into your escort roster.`);
}

function scuttleDisabledShip(ship) {
  const scuttleValue = Math.round(HULLS[ship.hullId].sale * 0.35) + ship.reward;
  state.player.credits += scuttleValue;
  modifyReputation(ship.faction === "pirate" ? "pirate" : ship.faction, ship.faction === "pirate" ? -1 : -2);
  finalizeBoardingRemoval(ship, "#ffcf74", 20);
  setStatus(`Ship scuttled. Salvage teams transferred ${formatCredits(scuttleValue)} in recovery credit.`);
}

function showBoardingResolution(ship) {
  const hullName = HULLS[ship.hullId].name;
  const cargoSummary = Object.entries(ship.cargo)
    .filter(([, amount]) => amount > 0)
    .map(([commodityId, amount]) => `${commodityById(commodityId)?.name || commodityId} x${amount}`)
    .join(" | ");
  const anchorX = (state.player.x + ship.x) * 0.5;
  const anchorY = (state.player.y + ship.y) * 0.5 - 28;

  openPopup({
    title: `${hullName} Secured`,
    copy: cargoSummary
      ? `The deck is yours. Cargo manifest: ${cargoSummary}. Choose whether to strip it, capture it, or scuttle it for recovery credit.`
      : "The deck is yours. Not much cargo survived, so this is really a choice between keeping the ship or reducing it to salvage.",
    style: "boarding",
    anchorX,
    anchorY,
    options: [
      {
        label: "Loot Cargo",
        meta: "Strip the hold and leave the hulk behind",
        confirm() {
          closePopup();
          lootDisabledShip(ship);
        },
      },
      {
        label: "Capture Ship",
        meta: state.escortHangar.length >= MAX_ESCORTS ? "Escort roster full" : "Take control and assign the ship to your roster",
        disabled: state.escortHangar.length >= MAX_ESCORTS,
        confirm() {
          closePopup();
          captureDisabledShip(ship);
        },
      },
      {
        label: "Scuttle Ship",
        meta: "Destroy the drifting ship and cash out the salvage",
        confirm() {
          closePopup();
          scuttleDisabledShip(ship);
        },
      },
    ],
  });
}

function resolveBoarding(ship, chance) {
  const roll = Math.random();
  if (roll > chance) {
    state.player.hull = clamp(state.player.hull - 16, 0, maxHull());
    createSpark(ship.x, ship.y, "#ff8a8a", 18);
    addScreenShake(8);
    state.enemyShips = state.enemyShips.filter((entry) => entry.id !== ship.id);
    setStatus("Boarding failed. You got the team back, but not clean.");
    if (state.player.hull <= 0) {
      loseShip();
    }
    return;
  }
  showBoardingResolution(ship);
  setStatus(`Boarding succeeded. ${HULLS[ship.hullId].name} is secure. Choose the outcome.`);
}

function loseShip() {
  state.player.credits = Math.max(0, state.player.credits - 180);
  state.player.hull = maxHull();
  state.player.fuel = Math.max(1, state.player.fuel);
  state.player.vx = 0;
  state.player.vy = 0;
  failContracts((contract) => contract.type === "courier", "Courier packet lost during recovery. Dispatch marked the job failed.");
  enterDockMode("You barely made it back on insurance tethers. Credits lost, ship patched.");
}

function snapshotGame() {
  return {
    currentSectorId: state.currentSectorId,
    saveSlot: state.saveSlot,
    player: {
      hullId: state.player.hullId,
      hull: state.player.hull,
      shield: state.player.shield,
      credits: state.player.credits,
      fuel: state.player.fuel,
      cargo: state.player.cargo,
      cargoCapBonus: state.player.cargoCapBonus,
      hullBonus: state.player.hullBonus,
      boardSkill: state.player.boardSkill,
      scannerLevel: state.player.scannerLevel,
      weaponLevel: state.player.weaponLevel,
      shieldCooldown: state.player.shieldCooldown,
      bountyProgress: state.player.bountyProgress,
      missionProgress: state.player.missionProgress,
    },
    factions: state.factions,
    activeContracts: state.activeContracts,
    escortHangar: state.escortHangar,
    escortCommand: state.escortCommand,
    discoveredSectors: state.discoveredSectors,
    factionArc: state.factionArc,
    savedAt: new Date().toISOString(),
  };
}

function saveGame(slot = state.saveSlot) {
  try {
    state.saveSlot = slot;
    window.localStorage.setItem(saveStorageKey(slot), JSON.stringify(snapshotGame()));
    setStatus(`Run saved in slot ${slot + 1} at ${currentSector().name}.`);
    return true;
  } catch (_error) {
    setStatus("Save failed on this browser.");
    return false;
  }
}

function loadSavedGame(slot = state.saveSlot) {
  try {
    const raw = window.localStorage.getItem(saveStorageKey(slot));
    if (!raw) {
      return false;
    }
    const saved = JSON.parse(raw);
    if (!saved || !SECTORS[saved.currentSectorId] || !HULLS[saved.player?.hullId]) {
      return false;
    }

    state.currentSectorId = saved.currentSectorId;
    state.saveSlot = Number(saved.saveSlot ?? slot) || slot;
    state.player.hullId = saved.player.hullId;
    state.player.hull = clamp(Number(saved.player.hull || HULLS[saved.player.hullId].maxHull), 1, HULLS[saved.player.hullId].maxHull + Number(saved.player.hullBonus || 0));
    state.player.shield = clamp(Number(saved.player.shield ?? HULLS[saved.player.hullId].maxShield), 0, HULLS[saved.player.hullId].maxShield);
    state.player.credits = Number(saved.player.credits || 0);
    state.player.fuel = clamp(Number(saved.player.fuel || 0), 0, HULLS[saved.player.hullId].fuelCap);
    state.player.cargo = { ...(saved.player.cargo || {}) };
    state.player.cargoCapBonus = Number(saved.player.cargoCapBonus || 0);
    state.player.hullBonus = Number(saved.player.hullBonus || 0);
    state.player.boardSkill = Number(saved.player.boardSkill || 0.04);
    state.player.scannerLevel = Number(saved.player.scannerLevel || 0);
    state.player.weaponLevel = Number(saved.player.weaponLevel || 0);
    state.player.shieldCooldown = Number(saved.player.shieldCooldown || 0);
    state.player.bountyProgress = { ...(saved.player.bountyProgress || {}) };
    state.player.missionProgress = { ...(saved.player.missionProgress || {}) };
    state.factions = { ...state.factions, ...(saved.factions || {}) };
    state.activeContracts = Array.isArray(saved.activeContracts)
      ? saved.activeContracts.filter((contract) => contract && contract.id && contract.type && contract.destinationId)
      : [];
    state.escortHangar = Array.isArray(saved.escortHangar) ? saved.escortHangar : [];
    state.escortCommand = saved.escortCommand || "defend";
    state.discoveredSectors = Array.isArray(saved.discoveredSectors) && saved.discoveredSectors.length ? saved.discoveredSectors : state.discoveredSectors;
    state.factionArc = saved.factionArc && typeof saved.factionArc === "object"
      ? {
          stage: saved.factionArc.stage || "intro",
          path: saved.factionArc.path || null,
          completed: Array.isArray(saved.factionArc.completed) ? saved.factionArc.completed : [],
        }
      : state.factionArc;
    enterDockMode(`Loaded save slot ${slot + 1} in ${currentSector().name}.`);
    return true;
  } catch (_error) {
    return false;
  }
}

function spawnShot(origin, angle, speed, life, from, color, damage, velocityX = 0, velocityY = 0) {
  state.bullets.push({
    x: origin.x + Math.cos(angle) * 18,
    y: origin.y + Math.sin(angle) * 18,
    vx: Math.cos(angle) * speed + velocityX,
    vy: Math.sin(angle) * speed + velocityY,
    life,
    from,
    color,
    damage,
  });
}

function fireWeaponPattern(origin, angle, profile, from, baseColor, ownerVelocityX = 0, ownerVelocityY = 0, powerBonus = 0) {
  if (profile === "scatter") {
    for (const spread of [-0.12, 0, 0.12]) {
      spawnShot(origin, angle + spread, from === "player" ? SHOT_SPEED * 0.95 : ENEMY_SHOT_SPEED * 0.9, 0.85, from, baseColor, 8 + powerBonus, ownerVelocityX, ownerVelocityY);
    }
    return;
  }
  if (profile === "rail") {
    spawnShot(origin, angle, from === "player" ? SHOT_SPEED * 1.28 : ENEMY_SHOT_SPEED * 1.18, 1.35, from, baseColor, 26 + powerBonus * 2, ownerVelocityX, ownerVelocityY);
    return;
  }
  if (profile === "missile") {
    spawnShot(origin, angle, from === "player" ? SHOT_SPEED * 0.82 : ENEMY_SHOT_SPEED * 0.76, 1.8, from, baseColor, 14 + powerBonus, ownerVelocityX, ownerVelocityY);
    return;
  }
  spawnShot(origin, angle, from === "player" ? SHOT_SPEED : ENEMY_SHOT_SPEED, 1.1, from, baseColor, 18 + powerBonus, ownerVelocityX, ownerVelocityY);
}

function firePlayerShot() {
  if (state.player.fireCooldown > 0) {
    return;
  }
  const profile = currentHull().weaponProfile;
  state.player.fireCooldown = Math.max(0.14, (profile === "rail" ? 0.62 : profile === "scatter" ? 0.42 : profile === "missile" ? 0.54 : 0.34) - state.player.weaponLevel * 0.05);
  fireWeaponPattern(
    state.player,
    state.player.angle,
    profile,
    "player",
    profile === "rail" ? "#b8e6ff" : profile === "scatter" ? "#8fe9ff" : profile === "missile" ? "#ffd37d" : "#7ad8ff",
    state.player.vx * 0.15,
    state.player.vy * 0.15,
    state.player.weaponLevel * 5
  );
  createSpark(
    state.player.x + Math.cos(state.player.angle) * 16,
    state.player.y + Math.sin(state.player.angle) * 16,
    profile === "rail" ? "#b8e6ff" : profile === "missile" ? "#ffd37d" : "#7ad8ff",
    4
  );
}

function fireEnemyShot(ship) {
  const aim = angleTo(ship, state.player);
  const color = ship.type === "patrol" ? "#ffe081" : ship.type === "smuggler" ? "#f0afd2" : "#ff8a8a";
  fireWeaponPattern(ship, aim, ship.weaponProfile || "pulse", "enemy", color, 0, 0, ship.type === "patrol" ? -2 : 0);
  createSpark(
    ship.x + Math.cos(aim) * 14,
    ship.y + Math.sin(aim) * 14,
    color,
    3
  );
}

function awardKill(ship) {
  state.player.credits += ship.reward;
  if (ship.faction === "pirate") {
    modifyReputation("pirate", -1);
    modifyReputation(currentSector().faction === "pirate" ? "independent" : currentSector().faction, 1);
  } else {
    modifyReputation(ship.faction, -3);
  }
  for (const contract of state.activeContracts) {
    if (contract.type === "bounty" && contract.destinationId === state.currentSectorId && ship.faction === "pirate") {
      state.player.bountyProgress[contract.id] = (state.player.bountyProgress[contract.id] || 0) + 1;
    }
  }
  setStatus(`${ship.type === "pirate" ? "Pirate" : ship.type === "patrol" ? "Patrol" : "Trader"} disabled. ${formatCredits(ship.reward)} in salvage credits.`);
  addScreenShake(7);
}

function getGamepads() {
  if (!navigator.getGamepads) {
    return [];
  }
  return Array.from(navigator.getGamepads()).filter(Boolean);
}

function buttonPressed(pad, index) {
  return Boolean(pad.buttons[index] && pad.buttons[index].pressed);
}

function activePad() {
  const pads = getGamepads();
  if (pads.length === 0) {
    state.selectedGamepadIndex = null;
    state.firstConnectedGamepadIndex = null;
    return null;
  }
  if (state.selectedGamepadIndex !== null) {
    const selected = pads.find((pad) => pad.index === state.selectedGamepadIndex);
    if (selected) {
      return selected;
    }
  }
  const first = pads[0];
  state.selectedGamepadIndex = first.index;
  state.firstConnectedGamepadIndex = first.index;
  return first;
}

function buttonJustPressed(key, pressed) {
  const previous = state.buttonSnapshot[key] || false;
  state.buttonSnapshot[key] = pressed;
  return pressed && !previous;
}

function gamepadNavigation(now) {
  const pad = activePad();
  if (!pad) return 0;

  const axisX = Math.abs(pad.axes[0] || 0) > DEADZONE ? pad.axes[0] : 0;
  const axisY = Math.abs(pad.axes[1] || 0) > DEADZONE ? pad.axes[1] : 0;
  const up = buttonPressed(pad, 12) || axisY < -DEADZONE;
  const down = buttonPressed(pad, 13) || axisY > DEADZONE;

  if (now < state.navHoldUntil) {
    return 0;
  }
  if (up) {
    state.navHoldUntil = now + NAV_REPEAT_DELAY;
    return -1;
  }
  if (down) {
    state.navHoldUntil = now + NAV_REPEAT_DELAY;
    return 1;
  }
  return 0;
}

function readFlightInput() {
  const pad = activePad();
  const input = {
    moveX: 0,
    moveY: 0,
    fire: false,
    interact: false,
    map: false,
    back: false,
    pause: false,
  };

  if (pad) {
    input.moveX = Math.abs(pad.axes[0] || 0) > DEADZONE ? pad.axes[0] : 0;
    input.moveY = Math.abs(pad.axes[1] || 0) > DEADZONE ? pad.axes[1] : 0;
    input.fire = buttonJustPressed(`pad-${pad.index}-fire`, buttonPressed(pad, 0));
    input.interact = buttonJustPressed(`pad-${pad.index}-interact`, buttonPressed(pad, 2));
    input.map = buttonJustPressed(`pad-${pad.index}-map`, buttonPressed(pad, 3));
    input.back = buttonJustPressed(`pad-${pad.index}-back`, buttonPressed(pad, 1));
    input.pause = buttonJustPressed(`pad-${pad.index}-pause`, buttonPressed(pad, 9));
  }

  return input;
}

const keyboard = {
  up: false,
  down: false,
  left: false,
  right: false,
  fire: false,
  interact: false,
  back: false,
  map: false,
  pause: false,
};

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["arrowup", "w"].includes(key)) keyboard.up = true;
  if (["arrowdown", "s"].includes(key)) keyboard.down = true;
  if (["arrowleft", "a"].includes(key)) keyboard.left = true;
  if (["arrowright", "d"].includes(key)) keyboard.right = true;
  if (key === " ") keyboard.fire = true;
  if (key === "shift") keyboard.interact = true;
  if (key === "escape") keyboard.back = true;
  if (key === "`") {
    state.debugVisible = !state.debugVisible;
  }
  if (key === "tab") {
    keyboard.map = true;
    event.preventDefault();
  }
  if (key === "enter") keyboard.pause = true;

  if (state.mode !== "flight") {
    if (["arrowup", "arrowdown", "w", "s", " ", "enter", "escape", "shift", "tab"].includes(key)) {
      event.preventDefault();
    }
  }
});

window.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  if (["arrowup", "w"].includes(key)) keyboard.up = false;
  if (["arrowdown", "s"].includes(key)) keyboard.down = false;
  if (["arrowleft", "a"].includes(key)) keyboard.left = false;
  if (["arrowright", "d"].includes(key)) keyboard.right = false;
  if (key === " ") keyboard.fire = false;
  if (key === "shift") keyboard.interact = false;
  if (key === "escape") keyboard.back = false;
  if (key === "tab") keyboard.map = false;
  if (key === "enter") keyboard.pause = false;
});

function menuEntries() {
  if (state.popup) {
    return state.popup.options.map((option) => ({
      label: option.label,
      meta: option.meta,
      confirm: option.confirm,
    }));
  }

  if (state.mode === "starmap") {
    const sector = currentSector();
    return sector.neighbors.map((neighborId) => {
      const neighbor = SECTORS[neighborId];
      const contractBadge = contractBadgeText(neighborId);
      return {
        label: `Jump to ${neighbor.name}`,
        meta: `Fuel 1 | ${neighbor.legality} | danger ${Math.round(neighbor.danger * 100)}% | ${contractBadge || neighbor.routeNotes}`,
        confirm: () => travelToSector(neighborId),
      };
    }).concat({
      label: "Return",
      meta: "Close the chart and return to your previous view.",
      confirm: () => {
        if (state.starmapReturnMode === "dock") {
          enterDockMode(`Chart closed at ${currentSector().name}.`);
        } else {
          state.mode = "flight";
          setStatus("Chart folded. Back in the lane.");
        }
      },
    });
  }

  if (state.mode === "flight") {
    return [
      { label: "Resume Flight", meta: "Return to the lane.", confirm: () => setStatus("Back in the lane.") },
      {
        label: "Open Starmap",
        meta: "Plot a one-jump lane from space.",
        confirm: () => {
          openStarmap("flight");
        },
      },
      { label: "Emergency Dock Vector", meta: "Fly near the station and press west to dock.", disabled: true, confirm: () => {} },
    ];
  }

  const restricted = dockAccessState() === "restricted";
  if (state.dockScreen === "market") {
    return COMMODITIES.flatMap((commodity) => ([
      {
        label: `Buy ${commodity.name}`,
        meta: `${formatCredits(marketPrice(state.currentSectorId, commodity.id))} each | ${commodityMarketNote(commodity.id)}`,
        disabled: restricted,
        confirm: () => tryBuyCommodity(commodity.id),
      },
      {
        label: `Sell ${commodity.name}`,
        meta: `On board: ${cargoAmount(commodity.id)} | ${formatCredits(marketPrice(state.currentSectorId, commodity.id))} | ${commodityMarketNote(commodity.id)}`,
        disabled: cargoAmount(commodity.id) <= 0,
        confirm: () => trySellCommodity(commodity.id),
      },
    ])).concat({
      label: "Back",
      meta: "Return to the dock command deck.",
      confirm: closeDockScreen,
    });
  }

  if (state.dockScreen === "contracts") {
    const contractEntries = state.availableContracts.map((contract) => ({
      label: contract.title,
      meta: `${formatCredits(contract.reward)} | ${(contract.tags || []).join(" / ") || contract.copy}`,
      disabled: restricted || state.activeContracts.some((entry) => entry.id === contract.id),
      confirm: () => acceptContract(contract.id),
    }));
    return contractEntries.concat({
      label: "Back",
      meta: "Return to the dock command deck.",
      confirm: closeDockScreen,
    });
  }

  if (state.dockScreen === "outfitter") {
    const canBuyHull = (hullId) => (currentSector().shipyard || []).includes(hullId) && state.player.credits >= HULLS[hullId].sale;
    const shipyardEntries = (currentSector().shipyard || []).filter((hullId) => hullId !== state.player.hullId).map((hullId) => ({
      label: `Buy ${HULLS[hullId].name}`,
      meta: `${formatCredits(HULLS[hullId].sale)} | ${HULLS[hullId].classRole}`,
      disabled: restricted || !canBuyHull(hullId),
      confirm: () => purchaseHull(hullId),
    }));
    return [
      { label: "Ship Plating", meta: `${formatCredits(220 + state.player.hullBonus * 4)} | +20 max ship integrity`, disabled: restricted, confirm: upgradeHullPlating },
      { label: "Cargo Racks", meta: `${formatCredits(180 + state.player.cargoCapBonus * 35)} | +2 cargo space`, disabled: restricted, confirm: upgradeCargoRacks },
      { label: "Pulse-Array Tune", meta: `${formatCredits(260 + state.player.weaponLevel * 100)} | Sharper fire and more punch`, disabled: restricted, confirm: upgradePulseArray },
      ...shipyardEntries,
      { label: "Back", meta: "Return to the dock command deck.", confirm: closeDockScreen },
    ];
  }

  if (state.dockScreen === "hangar") {
    const entries = [
      {
        label: `Escort Doctrine: ${state.escortCommand}`,
        meta: "Cycle follow, defend, attack, and regroup behavior.",
        disabled: escortCount() === 0,
        confirm: cycleEscortCommand,
      },
    ];
    state.escortHangar.forEach((escort, index) => {
      entries.push({
        label: `Swap to ${escort.name}`,
        meta: `${escort.hullId} | ${formatCredits(escort.sale)} sale value`,
        confirm: () => swapFlagship(index),
      });
      entries.push({
        label: `Sell ${escort.name}`,
        meta: `Release ship for ${formatCredits(escort.sale)}`,
        confirm: () => sellEscort(index),
      });
    });
    if (state.escortHangar.length === 0) {
      entries.push({ label: "No captured ships", meta: "Board something worth stealing and come back.", disabled: true, confirm: () => {} });
    }
    entries.push({ label: "Back", meta: "Return to the dock command deck.", confirm: closeDockScreen });
    return entries;
  }

  if (state.dockScreen === "services") {
    const entries = [
      { label: "Repair Ship", meta: `${formatCredits(Math.ceil((maxHull() - state.player.hull) * 1.9))}`, confirm: repairShip },
      { label: "Refuel Tanks", meta: `${formatCredits((currentHull().fuelCap - state.player.fuel) * 36)}`, confirm: refuelShip },
    ];
    for (let slot = 0; slot < SAVE_SLOT_COUNT; slot += 1) {
      const meta = savedRunMeta(slot);
      entries.push({
        label: `Save Slot ${slot + 1}`,
        meta: meta ? `Overwrite ${meta.sectorName} | ${meta.hullName}` : "Empty strategic dock save slot",
        confirm: () => saveGame(slot),
      });
      entries.push({
        label: `Load Slot ${slot + 1}`,
        meta: meta ? `${meta.sectorName} | ${meta.hullName} | ${formatCredits(meta.credits)}` : "No saved run in this slot",
        disabled: !meta,
        confirm: () => loadSavedGame(slot),
      });
    }
    entries.push({ label: "Back", meta: "Return to the dock command deck.", confirm: closeDockScreen });
    return entries;
  }

  return [
    { label: "Undock", meta: "Launch into the local lane.", confirm: () => { state.previousDockIndex = state.selectedMenuIndex; enterFlightMode(); } },
    { label: "Commodity Market", meta: restricted ? "Market privileges restricted by local authority." : "Buy low, sell high, and make room in the hold.", confirm: () => openDockScreen("market") },
    { label: "Contract Board", meta: restricted ? "Restricted captains are not offered station work." : "Stack up to three jobs and build standing.", confirm: () => openDockScreen("contracts") },
    { label: "Outfitter", meta: restricted ? "Restricted docking only grants emergency services." : "Plating, cargo racks, shipyard deals, and pulse-array tuning.", confirm: () => openDockScreen("outfitter") },
    { label: "Hangar", meta: restricted ? "Hangar control is currently locked by local authority." : "Swap ships, sell captures, and set escort doctrine.", confirm: () => openDockScreen("hangar") },
    { label: "Services", meta: "Repair, refuel, and manage strategic save slots.", confirm: () => openDockScreen("services") },
    {
      label: "Starmap",
      meta: "Plot the next jump lane while docked.",
      confirm: () => {
        openStarmap("dock");
      },
    },
  ];
}

function renderMenu() {
  const entries = menuEntries();
  if (entries.length === 0) {
    ui.menuList.replaceChildren();
    return;
  }

  state.selectedMenuIndex = clamp(state.selectedMenuIndex, 0, entries.length - 1);
  if (state.popup?.style === "boarding") {
    ui.menuList.replaceChildren();
    return;
  }
  ui.menuList.replaceChildren();

  entries.forEach((entry, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "menu-button";
    if (index === state.selectedMenuIndex) {
      button.classList.add("is-selected");
    }
    if (entry.disabled) {
      button.classList.add("is-disabled");
    }
    button.innerHTML = `
      <span class="menu-label">${entry.label}</span>
      <span class="menu-meta">${entry.meta || ""}</span>
    `;
    button.addEventListener("click", () => {
      state.selectedMenuIndex = index;
      if (!entry.disabled) {
        entry.confirm();
      }
      render();
    });
    ui.menuList.append(button);
  });
}

function renderDetailPanel() {
  ui.panelDetail.replaceChildren();
  const entries = menuEntries();
  const focused = entries[state.selectedMenuIndex];
  const cards = [];

  if (state.popup && state.popup.style !== "boarding") {
    cards.push({
      title: state.popup.title,
      copy: state.popup.copy,
      tags: ["Popup", `${state.popup.options.length} choices`],
    });
  } else if (state.mode === "dock") {
    const access = dockAccessState();
    cards.push({
      title: currentSector().name,
      copy: currentSector().routeNotes || currentSector().description,
      tags: [factionName(currentSector().faction), currentSector().legality, `Danger ${Math.round(currentSector().danger * 100)}%`, access],
    });
    cards.push({
      title: state.dockScreen === "root" ? "Station Intel" : state.dockScreen === "market" ? "Cargo Manifest" : state.dockScreen === "contracts" ? "Contract Pressure" : state.dockScreen === "outfitter" ? "Shipyard & Loadout" : state.dockScreen === "hangar" ? "Hangar Deck" : "Services Ledger",
      copy: stationContextCopy(),
      tags: stationContextTags(),
    });
  } else if (state.mode === "flight") {
    const disabled = nearestDisabledShip();
    cards.push({
      title: "Live Lane",
      copy: disabled
        ? `Disabled ${HULLS[disabled.hullId].name} in boarding range. Press west to make a very bad and possibly excellent decision.`
        : "Traffic is moving. Pirates want a piece, stations want your docking fee, and the line between haul and battle is thin.",
      tags: [`${state.enemyShips.length} contacts`, `${state.escortHangar.length} escorts`],
    });
  } else if (state.mode === "starmap") {
    const destination = currentSector().neighbors[state.selectedMenuIndex] ? SECTORS[currentSector().neighbors[state.selectedMenuIndex]] : null;
    const destinationContracts = destination ? contractsForSector(destination.id) : [];
    cards.push({
      title: destination ? destination.name : "Starmap",
      copy: destination
        ? `${destination.routeNotes} ${destinationContracts.length ? `Contract pull: ${destinationContracts.map((contract) => contract.title).join(" | ")}.` : "No active contracts pointed here right now."}`
        : "One-jump lanes only in this slice. Connected systems are enough to make trade routes, pirate pressure, and shortages legible.",
      tags: destination
        ? [factionName(destination.faction), destination.legality, `Danger ${Math.round(destination.danger * 100)}%`, `Fuel 1`, ...(destinationContracts.length ? [`${destinationContracts.length} jobs`] : [])]
        : [`Fuel ${state.player.fuel}/${currentHull().fuelCap}`],
    });
  }

  if (focused && state.popup?.style !== "boarding") {
    cards.push({
      title: focused.label,
      copy: focused.meta || "Ready.",
      tags: focused.disabled ? ["Unavailable"] : [],
    });
  }

  for (const card of cards) {
    const element = document.createElement("div");
    element.className = "detail-card";
    const tags = card.tags?.length
      ? `<div class="detail-tags">${card.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>`
      : "";
    element.innerHTML = `
      <div class="detail-title">${card.title}</div>
      <div class="detail-copy">${card.copy}</div>
      ${tags}
    `;
    ui.panelDetail.append(element);
  }
}

function stationContextCopy() {
  if (state.dockScreen === "market") {
    const manifest = COMMODITIES.filter((commodity) => cargoAmount(commodity.id) > 0)
      .map((commodity) => `${commodity.name} x${cargoAmount(commodity.id)}`)
      .join(" | ");
    return manifest || `Hold is light. ${currentSectorEventTag()}. This is a good time to set up a route instead of pretending an empty bay is strategy.`;
  }
  if (state.dockScreen === "contracts") {
    const active = state.activeContracts.length
      ? `Active: ${state.activeContracts.map((contract) => contract.title).join(" | ")}.`
      : "No active work. The board is still fresh.";
    const available = state.availableContracts.length
      ? `Fresh offers: ${state.availableContracts.map((contract) => contract.title).slice(0, 3).join(" | ")}.`
      : "No new offers right now.";
    return `${active} ${available}`;
  }
  if (state.dockScreen === "outfitter") {
    return `Current ship: ${currentHull().name}. ${currentHull().classRole}. Weapon: ${currentHull().slotText}. Shipyard stock: ${(currentSector().shipyard || []).map((hullId) => HULLS[hullId].name).join(", ")}.`;
  }
  if (state.dockScreen === "hangar") {
    return escortCount()
      ? `Escort command is ${state.escortCommand}. Stored ships: ${state.escortHangar.map((escort) => escort.name).join(" | ")}.`
      : "No spare ships in the hangar. A successful boarding action will change that quickly.";
  }
  if (state.dockScreen === "services") {
    const slotMeta = Array.from({ length: SAVE_SLOT_COUNT }, (_, slot) => savedRunMeta(slot))
      .filter(Boolean)
      .map((meta) => `Slot ${meta.slot + 1}: ${meta.sectorName}`)
      .join(" | ");
    return slotMeta || "No strategic dock saves yet. Slot a save before you start testing luck as a business model.";
  }
  return `${currentSector().intel} Active contracts: ${state.activeContracts.length}. Cargo: ${cargoUsed()}/${maxCargo()}. ${state.factionArc.stage === "resolved" ? "Your name is moving through the sector grapevine now." : currentSectorEventTag()}.`;
}

function stationContextTags() {
  if (state.dockScreen === "market") {
    return [`Used ${cargoUsed()}/${maxCargo()}`, hasContraband() ? "Contraband aboard" : "Clean hold", state.activeSectorEvent?.tag || "No event"];
  }
  if (state.dockScreen === "contracts") {
    return [`${state.activeContracts.length} active`, `${state.availableContracts.length} offers`, `Arc ${state.factionArc.stage}`];
  }
  if (state.dockScreen === "outfitter") {
    return [currentHull().weaponProfile, currentHull().classRole];
  }
  if (state.dockScreen === "hangar") {
    return [`${escortCount()} spare ships`, `Doctrine ${state.escortCommand}`];
  }
  if (state.dockScreen === "services") {
    return [`Slot ${state.saveSlot + 1}`, `Fuel ${state.player.fuel}/${currentHull().fuelCap}`];
  }
  return [currentSector().legality, `${knownSectorIds().length}/${Object.keys(SECTORS).length} known sectors`];
}

function commodityMarketNote(commodityId) {
  const price = marketPrice(state.currentSectorId, commodityId);
  const base = commodityById(commodityId)?.base || price;
  if (commodityId === "contraband" && currentSector().legality === "strict") {
    return "high risk";
  }
  if (price <= Math.round(base * 0.9)) {
    return "buy low";
  }
  if (price >= Math.round(base * 1.1)) {
    return "seller's market";
  }
  return "steady";
}

function renderShipPanel() {
  const rows = [
    ["Integrity", `${Math.round((state.player.hull / maxHull()) * 100)}%`],
    ["Shield", `${Math.round((state.player.shield / maxShield()) * 100)}%`],
    ["Ship", currentHull().name],
    ["Role", currentHull().classRole],
    ["Weapons", currentHull().slotText],
    ["Fuel", `${state.player.fuel} / ${currentHull().fuelCap}`],
    ["Cargo", `${cargoUsed()} / ${maxCargo()}`],
    ["Escorts", `${state.escortHangar.length} / ${MAX_ESCORTS}`],
    ["Credits", formatCredits(state.player.credits)],
  ];
  ui.shipDetail.replaceChildren();
  for (const [label, value] of rows) {
    const row = document.createElement("div");
    row.className = "fact-row";
    row.innerHTML = `<span class="fact-label">${label}</span><span class="fact-value">${value}</span>`;
    ui.shipDetail.append(row);
  }
}

function renderFactionPanel() {
  ui.factionDetail.replaceChildren();
  for (const faction of FACTIONS) {
    const value = state.factions[faction.id] || 0;
    const row = document.createElement("div");
    row.className = "fact-row";
    const tone = toneForReputation(value);
    row.innerHTML = `
      <span class="fact-label">${faction.name}</span>
      <span class="fact-value" ${tone ? `data-tone="${tone}"` : ""}>${repLabel(value)} (${value > 0 ? "+" : ""}${value})</span>
    `;
    ui.factionDetail.append(row);
  }
}

function renderHud() {
  ui.sector.textContent = currentSector().name;
  ui.credits.textContent = formatCredits(state.player.credits);
  ui.hull.textContent = `${Math.round((state.player.hull / maxHull()) * 100)}%`;
  ui.shield.textContent = `${Math.round((state.player.shield / maxShield()) * 100)}%`;
  ui.cargo.textContent = `${cargoUsed()} / ${maxCargo()}`;
  ui.status.textContent = state.statusText;
  ui.hint.textContent = state.hintText;
  ui.overlayTitle.textContent = state.overlayTitle;
  ui.overlayCopy.textContent = state.overlayCopy;
}

function syncCabinetView() {
  const app = document.getElementById("app");
  if (!app) return;
  app.dataset.mode = state.mode;
}

function render() {
  syncCabinetView();
  renderHud();
  renderMenu();
  renderDetailPanel();
  renderShipPanel();
  renderFactionPanel();
}

function drawStars() {
  for (const star of state.stars) {
    ctx.globalAlpha = star.alpha;
    ctx.fillStyle = "#cbe8ff";
    ctx.fillRect(star.x, star.y, star.size, star.size);
  }
  ctx.globalAlpha = 1;
}

function drawStation() {
  const station = currentSector().station;
  const palette = currentSector().palette;
  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.translate(station.x, station.y);
  ctx.fillStyle = palette.station;
  ctx.strokeStyle = palette.station;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(-42, -18, 78, 0, Math.PI * 2);
  ctx.fillStyle = palette.planet;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-26, -38, 26, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-42, -18, 78, Math.PI * 0.18, Math.PI * 1.28);
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.stroke();

  ctx.fillStyle = "rgba(4, 10, 16, 0.68)";
  ctx.beginPath();
  ctx.arc(36, 0, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(36, 0, 34, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(36, 0, 58, 16, 0.24, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-8, 0);
  ctx.lineTo(18, 0);
  ctx.moveTo(54, 0);
  ctx.lineTo(82, 0);
  ctx.stroke();
  ctx.fillStyle = palette.stationWarm;
  ctx.fillRect(12, -4, 10, 8);
  ctx.fillRect(50, -4, 10, 8);
  ctx.fillRect(30, -28, 12, 10);
  ctx.fillRect(30, 18, 12, 10);
  ctx.strokeStyle = "rgba(141, 220, 255, 0.45)";
  ctx.beginPath();
  ctx.moveTo(74, -14);
  ctx.lineTo(112, -26);
  ctx.lineTo(118, -18);
  ctx.lineTo(84, -6);
  ctx.closePath();
  ctx.moveTo(74, 14);
  ctx.lineTo(112, 26);
  ctx.lineTo(118, 18);
  ctx.lineTo(84, 6);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawShipFrame(draw, color, disabled) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  draw();
  if (disabled) {
    ctx.strokeStyle = "#ffcf74";
    ctx.beginPath();
    ctx.moveTo(-18, -14);
    ctx.lineTo(18, 14);
    ctx.moveTo(-18, 14);
    ctx.lineTo(18, -14);
    ctx.stroke();
  }
}

function drawKestrelHull() {
  ctx.beginPath();
  ctx.moveTo(16, 0);
  ctx.lineTo(-12, -10);
  ctx.lineTo(-7, 0);
  ctx.lineTo(-12, 10);
  ctx.closePath();
  ctx.stroke();
}

function drawCutterHull() {
  ctx.beginPath();
  ctx.moveTo(18, 0);
  ctx.lineTo(8, -8);
  ctx.lineTo(-12, -8);
  ctx.lineTo(-18, 0);
  ctx.lineTo(-12, 8);
  ctx.lineTo(8, 8);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-7, -6);
  ctx.lineTo(-2, 0);
  ctx.lineTo(-7, 6);
  ctx.stroke();
}

function drawRaiderHull() {
  ctx.beginPath();
  ctx.moveTo(19, 0);
  ctx.lineTo(1, -6);
  ctx.lineTo(-16, -14);
  ctx.lineTo(-8, -2);
  ctx.lineTo(-18, 0);
  ctx.lineTo(-8, 2);
  ctx.lineTo(-16, 14);
  ctx.lineTo(1, 6);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-4, -5);
  ctx.lineTo(6, 0);
  ctx.lineTo(-4, 5);
  ctx.stroke();
}

function drawCorvetteHull() {
  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.lineTo(10, -8);
  ctx.lineTo(-6, -10);
  ctx.lineTo(-18, -5);
  ctx.lineTo(-18, 5);
  ctx.lineTo(-6, 10);
  ctx.lineTo(10, 8);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-2, -9);
  ctx.lineTo(4, -16);
  ctx.moveTo(-2, 9);
  ctx.lineTo(4, 16);
  ctx.moveTo(-10, -4);
  ctx.lineTo(8, -4);
  ctx.moveTo(-10, 4);
  ctx.lineTo(8, 4);
  ctx.stroke();
}

function drawPatrolHull() {
  ctx.beginPath();
  ctx.moveTo(16, 0);
  ctx.lineTo(4, -8);
  ctx.lineTo(-7, -8);
  ctx.lineTo(-16, -3);
  ctx.lineTo(-16, 3);
  ctx.lineTo(-7, 8);
  ctx.lineTo(4, 8);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-5, -10);
  ctx.lineTo(-1, -4);
  ctx.lineTo(-5, 10);
  ctx.moveTo(3, -7);
  ctx.lineTo(10, 0);
  ctx.lineTo(3, 7);
  ctx.stroke();
}

function drawTraderHull() {
  ctx.beginPath();
  ctx.moveTo(14, 0);
  ctx.lineTo(6, -7);
  ctx.lineTo(-4, -7);
  ctx.lineTo(-16, -4);
  ctx.lineTo(-16, 4);
  ctx.lineTo(-4, 7);
  ctx.lineTo(6, 7);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.rect(-10, -4, 7, 8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-16, -8);
  ctx.lineTo(-22, -12);
  ctx.moveTo(-16, 8);
  ctx.lineTo(-22, 12);
  ctx.stroke();
}

function drawShip(x, y, angle, color, scale = 1, disabled = false, silhouette = "kestrel") {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  const profile = {
    kestrel: drawKestrelHull,
    cutter: drawCutterHull,
    raider: drawRaiderHull,
    corvette: drawCorvetteHull,
    patrol: drawPatrolHull,
    trader: drawTraderHull,
  }[silhouette] || drawKestrelHull;
  drawShipFrame(profile, color, disabled);
  ctx.restore();
}

function drawFlightScene() {
  const shakeX = state.screenShake > 0 ? (Math.random() - 0.5) * state.screenShake : 0;
  const shakeY = state.screenShake > 0 ? (Math.random() - 0.5) * state.screenShake : 0;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.save();
  ctx.translate(shakeX, shakeY);
  ctx.fillStyle = "#030812";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawStars();

  ctx.save();
  ctx.fillStyle = currentSector().palette.glow;
  ctx.beginPath();
  ctx.arc(WIDTH * 0.83, HEIGHT * 0.15, 110, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(WIDTH * 0.83, HEIGHT * 0.15, 74, 0, Math.PI * 2);
  ctx.fillStyle = currentSector().palette.planet;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(WIDTH * 0.79, HEIGHT * 0.11, 18, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fill();
  ctx.restore();

  drawStation();

  for (const spark of state.sparks) {
    const alpha = clamp(spark.life / spark.maxLife, 0, 1);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = spark.color;
    ctx.fillRect(spark.x, spark.y, 3, 3);
  }
  ctx.globalAlpha = 1;

  for (const bullet of state.bullets) {
    const tailX = bullet.x - bullet.vx * 0.02;
    const tailY = bullet.y - bullet.vy * 0.02;
    ctx.strokeStyle = bullet.color;
    ctx.lineWidth = bullet.from === "player" ? 2.4 : 2;
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(bullet.x, bullet.y);
    ctx.stroke();
  }

  for (const escort of state.escortHangar) {
    const index = state.escortHangar.indexOf(escort);
    const offsetAngle = state.player.angle + Math.PI * (0.9 + index * 0.35);
    const escortX = state.player.x + Math.cos(offsetAngle) * 42;
    const escortY = state.player.y + Math.sin(offsetAngle) * 42;
    ctx.strokeStyle = "rgba(158, 245, 159, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(escortX - Math.cos(state.player.angle) * 14, escortY - Math.sin(state.player.angle) * 14);
    ctx.lineTo(escortX - Math.cos(state.player.angle) * 24, escortY - Math.sin(state.player.angle) * 24);
    ctx.stroke();
    drawShip(escortX, escortY, state.player.angle, "#9ef59f", 0.75, false, escort.hullId || "cutter");
  }

  for (const ship of state.enemyShips) {
    const shipColor = ship.disposition === "hostile"
      ? ship.color
      : ship.disposition === "suspicious"
        ? "#ffcf74"
        : ship.type === "trader"
          ? "#c9d6e2"
          : ship.type === "smuggler"
            ? "#f0afd2"
            : "#9cb7c7";
    const silhouette = HULLS[ship.hullId]?.silhouette || ship.hullId;
    const velocity = Math.hypot(ship.vx, ship.vy);
    if (velocity > 18) {
      ctx.strokeStyle = ship.disposition === "hostile" ? "rgba(255, 138, 138, 0.4)" : "rgba(173, 196, 214, 0.28)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ship.x - Math.cos(ship.angle) * 12, ship.y - Math.sin(ship.angle) * 12);
      ctx.lineTo(ship.x - Math.cos(ship.angle) * 22, ship.y - Math.sin(ship.angle) * 22);
      ctx.stroke();
    }
    drawShip(ship.x, ship.y, ship.angle, shipColor, ship.type === "trader" || ship.type === "smuggler" ? 0.88 : 1, ship.disabled, silhouette);
    const barWidth = 30;
    if (ship.shield > 0) {
      ctx.fillStyle = "rgba(121, 216, 255, 0.14)";
      ctx.fillRect(ship.x - barWidth / 2, ship.y - 33, barWidth, 3);
      ctx.fillStyle = "#79d8ff";
      ctx.fillRect(ship.x - barWidth / 2, ship.y - 33, barWidth * (ship.shield / ship.maxShield), 3);
      ctx.strokeStyle = "rgba(121, 216, 255, 0.24)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ship.x, ship.y, 18, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.fillRect(ship.x - barWidth / 2, ship.y - 26, barWidth, 4);
    ctx.fillStyle = ship.disabled ? "#ffcf74" : ship.disposition === "hostile" ? ship.color : "rgba(173, 196, 214, 0.55)";
    ctx.fillRect(ship.x - barWidth / 2, ship.y - 26, barWidth * (ship.hull / ship.maxHull), 4);
    ctx.fillStyle = ship.contactState === "boardable" ? "#ffcf74" : ship.disposition === "hostile" ? "#ff8a8a" : ship.disposition === "suspicious" ? "#ffcf74" : ship.type === "trader" ? "#a8bdd1" : "#79d8ff";
    ctx.font = "11px Avenir Next, Segoe UI, sans-serif";
    ctx.fillText(contactStateLabel(ship), ship.x - 14, ship.y - 36);
    if (!ship.disabled) {
      ctx.fillStyle = ship.disposition === "hostile" ? "#ff8a8a" : ship.disposition === "suspicious" ? "#ffcf74" : ship.type === "trader" ? "#a8bdd1" : ship.type === "smuggler" ? "#f0afd2" : "#79d8ff";
      ctx.beginPath();
      ctx.arc(ship.x + 18, ship.y - 14, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (state.player.shield > 0) {
    ctx.strokeStyle = "rgba(121, 216, 255, 0.38)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, 19, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (Math.hypot(state.player.vx, state.player.vy) > 24) {
    ctx.strokeStyle = "rgba(121, 216, 255, 0.45)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(
      state.player.x - Math.cos(state.player.angle) * 12,
      state.player.y - Math.sin(state.player.angle) * 12
    );
    ctx.lineTo(
      state.player.x - Math.cos(state.player.angle) * 24,
      state.player.y - Math.sin(state.player.angle) * 24
    );
    ctx.stroke();
  }
  drawShip(state.player.x, state.player.y, state.player.angle, "#eef7ff", 1, false, state.player.hullId);

  if (state.mode === "starmap") {
    drawStarmapOverlay();
  }

  if (state.popup) {
    drawPopupOverlay();
  }

  if (state.mode === "dock") {
    drawDockBackdrop();
  }
  if (state.banner && state.bannerTimer > 0) {
    drawBanner();
  }
  if (state.activeSectorEvent && state.mode === "flight") {
    drawEventTicker();
  }
  if (state.debugVisible) {
    drawDebugOverlay();
  }
  ctx.restore();
}

function contactStateLabel(ship) {
  if (ship.disabled || ship.contactState === "boardable") return "BOARD";
  if (ship.disposition === "hostile") return "HOST";
  if (ship.disposition === "suspicious") return "SUSP";
  if (ship.type === "patrol") return "PATROL";
  if (ship.type === "smuggler") return "SMUG";
  if (ship.type === "trader") return "NEUT";
  return "NEUT";
}

function drawEventTicker() {
  ctx.save();
  ctx.fillStyle = "rgba(6, 14, 22, 0.88)";
  ctx.strokeStyle = "rgba(121, 216, 255, 0.28)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(WIDTH - 336, 28, 300, 72, 16);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#eef7ff";
  ctx.font = "700 18px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText(state.activeSectorEvent.title, WIDTH - 318, 56);
  ctx.fillStyle = "#a8bdd1";
  ctx.font = "13px Avenir Next, Segoe UI, sans-serif";
  wrapText(state.activeSectorEvent.copy, WIDTH - 318, 76, 268, 16);
  ctx.restore();
}

function drawDebugOverlay() {
  const lines = debugLines();
  ctx.save();
  ctx.fillStyle = "rgba(3, 9, 16, 0.9)";
  ctx.fillRect(18, HEIGHT - 120, 360, 96);
  ctx.strokeStyle = "rgba(121, 216, 255, 0.28)";
  ctx.strokeRect(18, HEIGHT - 120, 360, 96);
  ctx.fillStyle = "#9ef59f";
  ctx.font = "12px Menlo, Monaco, monospace";
  lines.forEach((line, index) => {
    ctx.fillText(line, 30, HEIGHT - 96 + index * 18);
  });
  ctx.restore();
}

function drawDockBackdrop() {
  ctx.save();
  ctx.fillStyle = "rgba(4, 10, 16, 0.96)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawStars();
  ctx.fillStyle = currentSector().palette.glow;
  ctx.beginPath();
  ctx.arc(WIDTH * 0.19, HEIGHT * 0.28, 144, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(WIDTH * 0.19, HEIGHT * 0.28, 104, 0, Math.PI * 2);
  ctx.fillStyle = currentSector().palette.planet;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(WIDTH * 0.15, HEIGHT * 0.23, 24, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fill();
  drawStation();
  drawShip(currentSector().station.x + 68, currentSector().station.y, -Math.PI / 2, "#eef7ff", 1, false, state.player.hullId);
  ctx.restore();
}

function drawPopupOverlay() {
  if (state.popup?.style === "boarding") {
    drawBoardingPopup();
    return;
  }
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  const box = { x: 160, y: 162, w: 640, h: 240 };
  ctx.fillStyle = "rgba(6, 15, 24, 0.94)";
  ctx.strokeStyle = "rgba(121, 216, 255, 0.34)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(box.x, box.y, box.w, box.h, 18);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#eef7ff";
  ctx.font = "700 26px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText(state.popup.title, box.x + 22, box.y + 42);
  ctx.fillStyle = "#a8bdd1";
  ctx.font = "16px Avenir Next, Segoe UI, sans-serif";
  wrapText(state.popup.copy, box.x + 22, box.y + 74, box.w - 44, 22);
  ctx.restore();
}

function drawBoardingPopup() {
  const options = state.popup.options || [];
  const selectedIndex = clamp(state.selectedMenuIndex, 0, Math.max(0, options.length - 1));
  const boxWidth = 320;
  const boxHeight = 188 + options.length * 32;
  const boxX = clamp(state.popup.anchorX - boxWidth * 0.5, 28, WIDTH - boxWidth - 28);
  const boxY = clamp(state.popup.anchorY - boxHeight * 0.5, 34, HEIGHT - boxHeight - 34);
  const pointerX = clamp(state.popup.anchorX, boxX + 26, boxX + boxWidth - 26);
  const pointerY = clamp(state.popup.anchorY + boxHeight * 0.5 - 8, boxY + boxHeight + 18, HEIGHT - 12);

  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.strokeStyle = "rgba(121, 216, 255, 0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pointerX, pointerY);
  ctx.lineTo(state.popup.anchorX, state.popup.anchorY + 18);
  ctx.stroke();

  ctx.fillStyle = "rgba(6, 15, 24, 0.96)";
  ctx.strokeStyle = "rgba(121, 216, 255, 0.42)";
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#eef7ff";
  ctx.font = "700 22px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText(state.popup.title, boxX + 18, boxY + 34);

  ctx.fillStyle = "#a8bdd1";
  ctx.font = "15px Avenir Next, Segoe UI, sans-serif";
  wrapText(state.popup.copy, boxX + 18, boxY + 62, boxWidth - 36, 19);

  let optionY = boxY + 128;
  options.forEach((option, index) => {
    const selected = index === selectedIndex;
    ctx.fillStyle = selected ? "rgba(121, 216, 255, 0.18)" : "rgba(255, 255, 255, 0.03)";
    ctx.strokeStyle = selected ? "rgba(121, 216, 255, 0.7)" : "rgba(121, 216, 255, 0.16)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(boxX + 14, optionY - 18, boxWidth - 28, 26, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = option.disabled ? "#5f7385" : selected ? "#eef7ff" : "#c7d7e4";
    ctx.font = "700 14px Avenir Next, Segoe UI, sans-serif";
    ctx.fillText(option.label, boxX + 24, optionY);
    if (option.meta) {
      ctx.fillStyle = option.disabled ? "#495b6c" : "#8ea4b6";
      ctx.font = "12px Avenir Next, Segoe UI, sans-serif";
      ctx.fillText(option.meta, boxX + 24, optionY + 15);
    }
    optionY += 36;
  });

  ctx.fillStyle = "#79d8ff";
  ctx.font = "12px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText("A confirm  B cancel", boxX + 18, boxY + boxHeight - 14);
  ctx.restore();
}

function drawBanner() {
  if (!state.banner) return;
  const alpha = Math.min(1, state.bannerTimer / 0.35, 1);
  ctx.save();
  ctx.globalAlpha = Math.min(alpha, 0.96);
  ctx.fillStyle = "rgba(7, 15, 25, 0.9)";
  ctx.strokeStyle = "rgba(121, 216, 255, 0.24)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(26, 26, 360, 84, 18);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#eef7ff";
  ctx.font = "700 24px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText(state.banner.title, 44, 60);
  ctx.fillStyle = "#a8bdd1";
  ctx.font = "16px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText(state.banner.copy, 44, 88);
  ctx.restore();
}

function drawStarmapOverlay() {
  ctx.save();
  ctx.fillStyle = "rgba(4, 10, 16, 0.84)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = "rgba(121, 216, 255, 0.22)";
  ctx.lineWidth = 2;
  for (const node of STAR_MAP) {
    const sector = SECTORS[node.id];
    for (const neighborId of sector.neighbors) {
      const neighborNode = STAR_MAP.find((entry) => entry.id === neighborId);
      if (!neighborNode) continue;
      ctx.beginPath();
      ctx.moveTo(node.x * WIDTH, node.y * HEIGHT);
      ctx.lineTo(neighborNode.x * WIDTH, neighborNode.y * HEIGHT);
      ctx.stroke();
    }
  }

  ctx.fillStyle = "#eef7ff";
  ctx.font = "700 28px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText("Starmap", 42, 56);
  ctx.fillStyle = "#8ea4b6";
  ctx.font = "14px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText("North or Start for the chart. Mission destinations are flagged directly on the lane map.", 42, 78);

  for (const node of STAR_MAP) {
    if (!state.discoveredSectors.includes(node.id) && node.id !== state.currentSectorId) continue;
    const selected = menuEntries()[state.selectedMenuIndex]?.label.includes(SECTORS[node.id].name);
    const contractLabel = contractBadgeShort(node.id);
    ctx.fillStyle = node.id === state.currentSectorId ? "#ffcf74" : selected ? "#79d8ff" : "#eef7ff";
    ctx.beginPath();
    ctx.arc(node.x * WIDTH, node.y * HEIGHT, node.id === state.currentSectorId ? 10 : 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#eef7ff";
    ctx.font = "16px Avenir Next, Segoe UI, sans-serif";
    ctx.fillText(SECTORS[node.id].name, node.x * WIDTH + 14, node.y * HEIGHT + 5);
    if (contractLabel) {
      const badgeX = node.x * WIDTH - 14;
      const badgeY = node.y * HEIGHT - 28;
      const badgeWidth = Math.max(48, ctx.measureText(contractLabel).width + 18);
      ctx.fillStyle = "rgba(255, 207, 116, 0.94)";
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeWidth, 20, 10);
      ctx.fill();
      ctx.fillStyle = "#17202b";
      ctx.font = "700 11px Avenir Next, Segoe UI, sans-serif";
      ctx.fillText(contractLabel, badgeX + 9, badgeY + 14);
    }
  }
  drawStarmapMissionPanel();
  ctx.restore();
}

function drawStarmapMissionPanel() {
  const panelX = WIDTH - 330;
  const panelY = 112;
  const panelW = 294;
  const panelH = 318;
  const selectedNeighborId = currentSector().neighbors[state.selectedMenuIndex] || null;
  const selectedContracts = selectedNeighborId ? contractsForSector(selectedNeighborId) : [];

  ctx.save();
  ctx.fillStyle = "rgba(6, 15, 24, 0.9)";
  ctx.strokeStyle = "rgba(121, 216, 255, 0.26)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(panelX, panelY, panelW, panelH, 20);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#eef7ff";
  ctx.font = "700 18px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText("Active Missions", panelX + 18, panelY + 28);
  ctx.fillStyle = "#8ea4b6";
  ctx.font = "13px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText(selectedContracts.length ? `Selected lane feeds ${selectedContracts.length} active job${selectedContracts.length === 1 ? "" : "s"}.` : "Route view across every active commitment in your hold.", panelX + 18, panelY + 50);

  let cardY = panelY + 70;
  const lines = state.activeContracts.length ? state.activeContracts.slice(0, 5) : [];
  if (!lines.length) {
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.beginPath();
    ctx.roundRect(panelX + 14, cardY, panelW - 28, 62, 14);
    ctx.fill();
    ctx.fillStyle = "#c7d7e4";
    ctx.font = "600 14px Avenir Next, Segoe UI, sans-serif";
    wrapText("No active missions yet. Grab work from a station board and the chart will start calling out destinations here.", panelX + 26, cardY + 24, panelW - 52, 18);
    ctx.restore();
    return;
  }

  for (const contract of lines) {
    const destinationName = SECTORS[contract.destinationId]?.name || "Unknown";
    const highlighted = contract.destinationId === selectedNeighborId;
    ctx.fillStyle = highlighted ? "rgba(255, 207, 116, 0.14)" : "rgba(255,255,255,0.04)";
    ctx.strokeStyle = highlighted ? "rgba(255, 207, 116, 0.52)" : "rgba(121, 216, 255, 0.12)";
    ctx.beginPath();
    ctx.roundRect(panelX + 14, cardY, panelW - 28, 42, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = highlighted ? "#fff2cf" : "#eef7ff";
    ctx.font = "700 14px Avenir Next, Segoe UI, sans-serif";
    ctx.fillText(contract.title.slice(0, 32), panelX + 26, cardY + 18);
    ctx.fillStyle = highlighted ? "#ffd88b" : "#8ea4b6";
    ctx.font = "12px Avenir Next, Segoe UI, sans-serif";
    const tags = Array.isArray(contract.tags) && contract.tags.length ? ` • ${contract.tags.slice(0, 2).join(" / ")}` : "";
    ctx.fillText(`${destinationName}${tags}`, panelX + 26, cardY + 33);
    cardY += 52;
  }

  ctx.fillStyle = "#79d8ff";
  ctx.font = "12px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText("Highlighted cards match the lane under your cursor.", panelX + 18, panelY + panelH - 16);
  ctx.restore();
}

function wrapText(text, x, y, width, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let cursorY = y;
  for (const word of words) {
    const test = `${line}${word} `;
    if (ctx.measureText(test).width > width && line) {
      ctx.fillText(line, x, cursorY);
      line = `${word} `;
      cursorY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, cursorY);
  }
}

function updateFlight(dt) {
  const input = readFlightInput();
  const actionLocked = performance.now() < state.actionLockUntil;
  const keyboardMoveX = (keyboard.right ? 1 : 0) - (keyboard.left ? 1 : 0);
  const keyboardMoveY = (keyboard.down ? 1 : 0) - (keyboard.up ? 1 : 0);
  const moveX = Math.abs(input.moveX) > Math.abs(keyboardMoveX) ? input.moveX : keyboardMoveX;
  const moveY = Math.abs(input.moveY) > Math.abs(keyboardMoveY) ? input.moveY : keyboardMoveY;

  if (moveX || moveY) {
    state.player.angle = Math.atan2(moveY, moveX);
    state.player.vx += Math.cos(state.player.angle) * currentHull().accel * dt;
    state.player.vy += Math.sin(state.player.angle) * currentHull().accel * dt;
  }

  state.player.vx *= currentHull().friction;
  state.player.vy *= currentHull().friction;
  const speed = Math.hypot(state.player.vx, state.player.vy);
  if (speed > currentHull().maxSpeed) {
    state.player.vx = (state.player.vx / speed) * currentHull().maxSpeed;
    state.player.vy = (state.player.vy / speed) * currentHull().maxSpeed;
  }

  state.player.x += state.player.vx * dt;
  state.player.y += state.player.vy * dt;
  wrapBody(state.player);
  state.player.fireCooldown = Math.max(0, state.player.fireCooldown - dt);
  rechargeShield(state.player, maxShield(), currentHull().shieldRegen, dt);

  if (!actionLocked && (input.fire || keyboard.fire)) {
    firePlayerShot();
  }
  if (!actionLocked && (input.map || keyboard.map)) {
    openStarmap("flight");
    keyboard.map = false;
    return;
  }
  if (!actionLocked && (input.interact || keyboard.interact)) {
    keyboard.interact = false;
    const stationDistance = distance(state.player, currentSector().station);
    if (stationDistance <= INTERACT_RANGE) {
      enterDockMode("Dock clamps locked. Back on station power.");
      return;
    }
    tryBoardNearestShip();
  }
  if (input.pause || keyboard.pause) {
    keyboard.pause = false;
    setStatus("Command deck highlighted. Use the side panel or press start again after a choice.");
  }
}

function updateEnemyShips(dt) {
  for (const ship of state.enemyShips) {
    ship.fireCooldown -= dt;
    rechargeShield(ship, ship.maxShield, ship.shieldRegen, dt);
    const targetAngle = angleTo(ship, state.player);
    if (!ship.disabled) {
      const nearby = distance(ship, state.player);
      if (ship.type === "patrol" && lawfulSector() && nearby < 180 && hasContraband()) {
        ship.disposition = nearby < 120 ? "hostile" : "suspicious";
      } else if (ship.type === "patrol" && currentSectorRep() <= -10 && nearby < 180) {
        ship.disposition = nearby < 140 ? "hostile" : "suspicious";
      } else if (ship.type === "pirate" && ship.disposition === "neutral" && nearby < 170 && currentSector().danger > 0.5) {
        ship.disposition = "suspicious";
      }

      if (ship.type === "patrol" && lawfulSector() && nearby < SCAN_RANGE && state.scanCooldown <= 0) {
        triggerPatrolScan(ship);
      }

      ship.contactState = ship.disabled ? "boardable" : ship.disposition;

      if (ship.disposition === "hostile") {
        ship.angle += Math.sin(targetAngle - ship.angle) * 0.05;
        ship.vx += Math.cos(ship.angle) * ship.speed * 0.9 * dt;
        ship.vy += Math.sin(ship.angle) * ship.speed * 0.9 * dt;
      } else if ((ship.type === "trader" || ship.type === "smuggler") && nearby < 180) {
        ship.angle += Math.sin((targetAngle + Math.PI) - ship.angle) * 0.08;
        ship.vx -= Math.cos(targetAngle) * ship.speed * 0.6 * dt;
        ship.vy -= Math.sin(targetAngle) * ship.speed * 0.6 * dt;
      } else if (ship.disposition === "suspicious") {
        ship.angle += Math.sin((targetAngle + Math.PI * 0.75) - ship.angle) * 0.04;
        ship.vx += Math.cos(ship.angle) * ship.speed * 0.4 * dt;
        ship.vy += Math.sin(ship.angle) * ship.speed * 0.4 * dt;
      } else if (ship.type === "patrol") {
        const stationAngle = angleTo(ship, currentSector().station);
        ship.angle += Math.sin((stationAngle + Math.PI / 2) - ship.angle) * 0.04;
        ship.vx += Math.cos(ship.angle) * ship.speed * 0.32 * dt;
        ship.vy += Math.sin(ship.angle) * ship.speed * 0.32 * dt;
      } else {
        ship.angle += Math.sin((targetAngle + Math.PI * 0.4) - ship.angle) * 0.02;
        ship.vx += Math.cos(ship.angle) * ship.speed * 0.22 * dt;
        ship.vy += Math.sin(ship.angle) * ship.speed * 0.22 * dt;
      }
      ship.vx *= 0.988;
      ship.vy *= 0.988;
      ship.x += ship.vx * dt;
      ship.y += ship.vy * dt;
      wrapBody(ship);
      if (ship.fireCooldown <= 0 && ship.disposition === "hostile" && ship.type !== "trader" && nearby < 260) {
        fireEnemyShot(ship);
        ship.fireCooldown = ship.weaponProfile === "rail" ? 1.8 + Math.random() * 1.2 : ship.weaponProfile === "scatter" ? 1.1 + Math.random() * 0.8 : 1.2 + Math.random() * 1.3;
      }
    } else {
      ship.contactState = "boardable";
      ship.vx *= 0.986;
      ship.vy *= 0.986;
      ship.x += ship.vx * dt;
      ship.y += ship.vy * dt;
      wrapBody(ship);
    }
  }
}

function updateEscorts(dt) {
  if (state.escortHangar.length === 0) return;
  for (const ship of state.enemyShips) {
    if (ship.disabled) continue;
    const isTarget = state.escortCommand === "attack"
      ? ship.disposition === "hostile" || ship.disposition === "suspicious"
      : ship.disposition === "hostile";
    if (!isTarget) continue;
    const dist = distance(ship, state.player);
    const range = state.escortCommand === "follow" ? 170 : state.escortCommand === "attack" ? 250 : 210;
    if (dist < range && Math.random() < dt * (state.escortCommand === "attack" ? 2.1 : 1.6)) {
      ship.hull -= 6 + state.escortHangar.length * 2 + (state.escortCommand === "attack" ? 2 : 0);
      createSpark(ship.x, ship.y, "#9ef59f", 3);
      if (ship.hull <= 18) {
        ship.disabled = true;
        ship.contactState = "boardable";
        ship.hull = Math.max(14, ship.hull);
        awardKill(ship);
      }
    }
  }
}

function updateBullets(dt) {
  for (const bullet of state.bullets) {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt;
    wrapBody(bullet);
  }
  state.bullets = state.bullets.filter((bullet) => bullet.life > 0);

  for (const bullet of [...state.bullets]) {
    if (bullet.from === "player") {
      for (const ship of state.enemyShips) {
        if (distance(bullet, ship) <= 16) {
          ship.disposition = "hostile";
          ship.contactState = "hostile";
          applyDamageToTarget(ship, bullet.damage, "#79d8ff", bullet.color);
          bullet.life = 0;
          if (!ship.disabled && ship.hull <= 18) {
            ship.disabled = true;
            ship.shield = 0;
            ship.contactState = "boardable";
            awardKill(ship);
          }
          break;
        }
      }
    } else if (distance(bullet, state.player) <= 14) {
      applyDamageToTarget(state.player, bullet.damage, "#79d8ff", bullet.color);
      bullet.life = 0;
      setStatus(`Taking fire in ${currentSector().name}. Shields ${Math.round((state.player.shield / maxShield()) * 100)}%, ship ${Math.round((state.player.hull / maxHull()) * 100)}%.`);
      if (state.player.hull <= 0) {
        loseShip();
        return;
      }
    }
  }
  state.bullets = state.bullets.filter((bullet) => bullet.life > 0);
}

function updateSparks(dt) {
  for (const spark of state.sparks) {
    spark.x += spark.vx * dt;
    spark.y += spark.vy * dt;
    spark.life -= dt;
  }
  state.sparks = state.sparks.filter((spark) => spark.life > 0);
}

function updatePresentation(dt) {
  state.screenShake = Math.max(0, state.screenShake - dt * 24);
  state.scanCooldown = Math.max(0, state.scanCooldown - dt);
  if (state.activeSectorEvent) {
    state.activeSectorEvent.timeLeft -= dt;
    if (state.activeSectorEvent.timeLeft <= 0) {
      state.activeSectorEvent = null;
    }
  }
  if (state.bannerTimer > 0) {
    state.bannerTimer = Math.max(0, state.bannerTimer - dt);
    if (state.bannerTimer === 0) {
      state.banner = null;
    }
  }
}

function handleMenuInput(now) {
  const nav = gamepadNavigation(now) || ((keyboard.down ? 1 : 0) - (keyboard.up ? 1 : 0));
  if (nav !== 0) {
    state.selectedMenuIndex = clamp(state.selectedMenuIndex + nav, 0, menuEntries().length - 1);
    keyboard.up = false;
    keyboard.down = false;
  }

  const pad = activePad();
  const confirmPressed = keyboard.fire || keyboard.pause || (pad && buttonJustPressed(`pad-${pad.index}-confirm-menu`, buttonPressed(pad, 0)));
  const backPressed = keyboard.back || (pad && buttonJustPressed(`pad-${pad.index}-back-menu`, buttonPressed(pad, 1)));

  if (confirmPressed) {
    keyboard.fire = false;
    keyboard.pause = false;
    const entry = menuEntries()[state.selectedMenuIndex];
    if (entry && !entry.disabled) {
      entry.confirm();
    }
  }

  if (backPressed) {
    keyboard.back = false;
    if (state.popup) {
      closePopup();
    } else if (state.mode === "dock") {
      state.previousDockIndex = state.selectedMenuIndex;
      enterFlightMode("Undocking from station command deck.");
    } else if (state.mode === "starmap") {
      if (state.starmapReturnMode === "flight") {
        state.mode = "flight";
      } else {
        enterDockMode(`Chart closed at ${currentSector().name}.`);
      }
    }
  }
}

function update(now) {
  const dt = Math.min((now - state.lastTime) / 1000 || 0, 0.033);
  state.lastTime = now;

  if (state.mode === "flight" && !state.popup) {
    updateFlight(dt);
    updateEnemyShips(dt);
    updateEscorts(dt);
    updateBullets(dt);
    updateSparks(dt);
  } else {
    updateSparks(dt);
  }
  updatePresentation(dt);

  if (state.mode !== "flight" || state.popup) {
    handleMenuInput(now);
  }

  render();
  drawFlightScene();
  requestAnimationFrame(update);
}

function preferredMissionDestination() {
  const active = state.activeContracts.find((contract) => currentSector().neighbors.includes(contract.destinationId));
  return active?.destinationId || currentSector().neighbors[0] || null;
}

function openMissionChartFromPause() {
  window.ArcadeCabinet?.closePause?.();
  const returnMode = state.mode === "dock" ? "dock" : "flight";
  openStarmap(returnMode, preferredMissionDestination());
}

window.__arcadeCabinetHooks = {
  getPauseActions() {
    return [
      {
        id: "save",
        label: "Save Game",
        run() {
          saveGame();
        },
      },
      {
        id: "mission-chart",
        label: "Map & Active Missions",
        run() {
          openMissionChartFromPause();
        },
      },
    ];
  },
};

if (!loadSavedGame()) {
  enterDockMode("Docked. First run starts at Grey Exchange.");
}
render();
drawFlightScene();
requestAnimationFrame(update);
