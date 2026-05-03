import { createArcadeStage } from "../../shared/arcade-stage.js";

const BUILD_NUMBER = "2026.04.13.8";
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
const SAVE_NAME_STORAGE_PREFIX = "arcade.jumpwake.save.slotname";
const SAVE_SLOT_COUNT = 3;
const AUTOSAVE_INTERVAL_MS = 12000;
const SCAN_RANGE = 122;
const EVENT_DURATION = 18;
const SECTOR_STATE_TURNS = 4;
const ENCOUNTER_DELAY_RANGE = [7, 12];
const ESCAPE_POD_SPEED = 118;
const MESSAGE_LOG_LIMIT = 18;
const THREAD_SCROLL_STEP = 54;
const AUTOPILOT_ORBIT_RADIUS = 172;
const AUTOPILOT_SPEED_TARGET = 116;
const AUTOPILOT_ACCEL_SCALE = 0.78;
const AUTOPILOT_ANGULAR_SPEED = 0.22;
const ESCORT_CALLSIGN_BANK = {
  dinghy: ["Tin", "Skiff", "Patch", "Scuff", "Bailer", "Rivet"],
  kestrel: ["Wake", "Latch", "Relay", "Pinion", "Morrow", "Trace"],
  cutter: ["Needle", "Slip", "Quick", "Halo", "Vivid", "Vector"],
  raider: ["Rook", "Spur", "Bite", "Knuckle", "Vandal", "Flint"],
  corvette: ["Bulwark", "Anvil", "Lancer", "Rampart", "Keel", "Spoke"],
  patrol: ["Marshal", "Ledger", "Sentinel", "Ward", "Beacon", "Talon"],
  trader: ["Longline", "Ballast", "Tally", "Broker", "Drift", "Caravel"],
  smuggler: ["Hush", "Cipher", "Veil", "Ghost", "Velvet", "Quiet"],
  tug: ["Cinder", "Towline", "Clamp", "Anchor", "Forge", "Spar"],
};

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const playfieldShell = document.getElementById("playfield-shell");
const playfieldStage = document.getElementById("playfield-stage");

const ui = {
  sector: document.getElementById("sector-value"),
  credits: document.getElementById("credits-value"),
  hull: document.getElementById("hull-value"),
  shield: document.getElementById("shield-value"),
  cargo: document.getElementById("cargo-value"),
  status: document.getElementById("status-value"),
  hintBanner: document.querySelector(".hint-banner"),
  hint: document.getElementById("hint-value"),
  overlayTitle: document.getElementById("overlay-title"),
  overlayCopy: document.getElementById("overlay-copy"),
  menuList: document.getElementById("menu-list"),
  menuPanel: document.getElementById("menu-list")?.closest(".panel"),
  menuPanelTitle: document.getElementById("menu-panel-title"),
  menuPanelFootnote: document.getElementById("menu-panel-footnote"),
  detailPanelTitle: document.getElementById("detail-panel-title"),
  panelDetail: document.getElementById("panel-detail"),
  threadModal: document.getElementById("thread-modal"),
  messageLog: document.getElementById("message-log"),
  shipDetail: document.getElementById("ship-detail"),
  factionDetail: document.getElementById("faction-detail"),
  commandDeck: document.querySelector(".command-deck"),
};

document.title = `Jumpwake build ${BUILD_NUMBER}`;

const cabinetStage = createArcadeStage({
  shell: playfieldShell,
  stage: playfieldStage,
  canvas,
  logicalWidth: WIDTH,
  logicalHeight: HEIGHT,
});

const COMMODITIES = [
  { id: "food", name: "Food Staples", base: 34, mass: 1 },
  { id: "ore", name: "Refined Ore", base: 52, mass: 1 },
  { id: "meds", name: "Field Medicine", base: 96, mass: 1 },
  { id: "lux", name: "Luxury Goods", base: 118, mass: 1 },
  { id: "munitions", name: "Munitions", base: 88, mass: 1 },
  { id: "contraband", name: "Contraband", base: 154, mass: 1 },
];

const HULLS = {
  dinghy: { name: "Dockside Dinghy", classRole: "Patchwork runabout", silhouette: "dinghy", maxHull: 74, maxShield: 20, shieldRegen: 6, cargoCap: 4, fuelCap: 2, turn: 0.084, accel: 206, maxSpeed: 236, friction: 0.992, boardBonus: 0.01, sale: 160, weaponProfile: "pulse", slotText: "Utility pulse stub" },
  kestrel: { name: "Rust Kestrel", classRole: "Scrap interceptor", silhouette: "kestrel", maxHull: 100, maxShield: 46, shieldRegen: 9, cargoCap: 6, fuelCap: 3, turn: 0.076, accel: 228, maxSpeed: 266, friction: 0.991, boardBonus: 0.02, sale: 420, weaponProfile: "pulse", slotText: "Light nose pulse" },
  cutter: { name: "Courier Cutter", classRole: "Fast courier", silhouette: "cutter", maxHull: 120, maxShield: 58, shieldRegen: 10, cargoCap: 8, fuelCap: 4, turn: 0.068, accel: 212, maxSpeed: 252, friction: 0.992, boardBonus: 0.04, sale: 620, weaponProfile: "pulse", slotText: "Courier pulse pair" },
  raider: { name: "Broken Raider", classRole: "Boarding skiff", silhouette: "raider", maxHull: 146, maxShield: 34, shieldRegen: 7, cargoCap: 5, fuelCap: 3, turn: 0.082, accel: 240, maxSpeed: 274, friction: 0.989, boardBonus: 0.08, sale: 780, weaponProfile: "scatter", slotText: "Scatter spikes" },
  corvette: { name: "Shale Corvette", classRole: "Heavy combatant", silhouette: "corvette", maxHull: 180, maxShield: 84, shieldRegen: 12, cargoCap: 9, fuelCap: 6, turn: 0.056, accel: 182, maxSpeed: 226, friction: 0.993, boardBonus: 0.12, sale: 1220, weaponProfile: "rail", slotText: "Rail lance" },
  patrol: { name: "Checkpoint Patrol", classRole: "Authority interceptor", silhouette: "patrol", maxHull: 134, maxShield: 64, shieldRegen: 11, cargoCap: 5, fuelCap: 4, turn: 0.07, accel: 214, maxSpeed: 248, friction: 0.992, boardBonus: 0.05, sale: 920, weaponProfile: "pulse", slotText: "Authority pulse" },
  trader: { name: "Long Haul Trader", classRole: "Civilian freighter", silhouette: "trader", maxHull: 156, maxShield: 52, shieldRegen: 8, cargoCap: 14, fuelCap: 5, turn: 0.052, accel: 158, maxSpeed: 206, friction: 0.994, boardBonus: 0.01, sale: 860, weaponProfile: "missile", slotText: "Defense rack" },
  smuggler: { name: "Nightglass Smuggler", classRole: "Illegal courier", silhouette: "cutter", maxHull: 128, maxShield: 62, shieldRegen: 10, cargoCap: 9, fuelCap: 5, turn: 0.074, accel: 222, maxSpeed: 264, friction: 0.99, boardBonus: 0.06, sale: 980, weaponProfile: "scatter", slotText: "Hidden scatter bay" },
  tug: { name: "Cinder Tug", classRole: "Industrial hauler", silhouette: "trader", maxHull: 194, maxShield: 44, shieldRegen: 7, cargoCap: 16, fuelCap: 4, turn: 0.044, accel: 138, maxSpeed: 188, friction: 0.995, boardBonus: 0.03, sale: 1040, weaponProfile: "pulse", slotText: "Utility pulse" },
};

const HULL_MENU_ART = {
  dinghy: "./assets/ships/dinghy-card.png",
  kestrel: "./assets/ships/kestrel-card.png",
  cutter: "./assets/ships/cutter-card.png",
  trader: "./assets/ships/trader-card.png",
  tug: "./assets/ships/tug-card.png",
  raider: "./assets/ships/raider-card.png",
  smuggler: "./assets/ships/smuggler-card.png",
  patrol: "./assets/ships/patrol-card.png",
  corvette: "./assets/ships/corvette-card.png",
};

const SECTOR_MENU_ART = {
  grey_exchange: "./assets/docks/grey-exchange-card.png",
  union_harbor: "./assets/docks/union-harbor-card.png",
  shale_barrens: "./assets/docks/shale-barrens-card.png",
  authority_gate: "./assets/docks/authority-gate-card.png",
  cinder_wake: "./assets/docks/cinder-wake-card.png",
  iron_hollow: "./assets/docks/iron-hollow-card.png",
  ember_market: "./assets/docks/ember-market-card.png",
  mirage_verge: "./assets/docks/mirage-verge-card.png",
  sol: "./assets/docks/sol-card.png",
  alpha_centauri: "./assets/docks/alpha-centauri-card.png",
  barnards_star: "./assets/docks/barnards-star-card.png",
  sirius: "./assets/docks/sirius-card.png",
  tau_ceti: "./assets/docks/tau-ceti-card.png",
};

const ARCHIVE_ART = {
  "primer:cluster": "./assets/archive/near-lane-primer-card.png",
  "primer:jumpwake": "./assets/archive/jumpwake-lexicon-card.png",
  "faction:authority": "./assets/archive/central-authority-card.png",
  "faction:frontier": "./assets/archive/frontier-union-card.png",
  "faction:independent": "./assets/archive/independents-card.png",
  "faction:nightglass": "./assets/archive/nightglass-syndicate-card.png",
  "faction:pirate": "./assets/archive/dust-pirates-card.png",
  "history:old-light-charter": "./assets/archive/old-light-charter-card.png",
  "history:relay-ledger": "./assets/archive/relay-ledger-card.png",
  "history:blue-archive-hearing": "./assets/archive/blue-archive-hearing-card.png",
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
    shipyard: ["dinghy", "kestrel", "cutter"],
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
    neighbors: ["union_harbor", "shale_barrens", "iron_hollow", "mirage_verge", "sol"],
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
    neighbors: ["shale_barrens", "iron_hollow", "mirage_verge", "sirius"],
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
    neighbors: ["authority_gate", "ember_market", "tau_ceti"],
    station: { x: 758, y: 92 },
    palette: { glow: "rgba(122, 182, 255, 0.12)", planet: "#5e75b0", planetShadow: "#344160", station: "#b9ccff", stationWarm: "#ffe6a1" },
    legality: "gray",
    routeNotes: "Weird-edge teaser sector with high payouts, smugglers, and enough patrol attention to keep runs dramatic.",
    intel: "Data couriers pay, patrols arrive late, and captains who learn this route print their own stories.",
    shipyard: ["smuggler", "patrol", "corvette"],
    traffic: { traders: 1, patrols: 1, pirates: 1, hostilePirates: 1, smugglers: 1 },
    economy: { food: 1.18, ore: 1.06, meds: 1.24, lux: 1.28, munitions: 1.12, contraband: 0.9 },
  },
  sol: {
    id: "sol",
    name: "Sol",
    faction: "authority",
    description: "Humanity's old home system still runs on layered traffic control, old orbital yards, and enough bureaucracy to weaponize docking paperwork.",
    danger: 0.24,
    neighbors: ["authority_gate", "barnards_star", "sirius"],
    station: { x: 604, y: 82 },
    palette: { glow: "rgba(255, 196, 96, 0.18)", planet: "#d89b52", planetShadow: "#8c5f2b", station: "#ffd28a", stationWarm: "#fff1b0" },
    legality: "strict",
    routeNotes: "Core traffic around a bright primary. Safe lanes, expensive docking, and clean contracts.",
    intel: "Freight is polished, patrols are constant, and everyone still acts like Sol gets to define what lawful means.",
    permit: "coreTransit",
    shipyard: ["cutter", "patrol", "corvette"],
    traffic: { traders: 3, patrols: 3, pirates: 0, hostilePirates: 0, smugglers: 0 },
    economy: { food: 1.02, ore: 1.18, meds: 0.98, lux: 1.2, munitions: 1.12, contraband: 1.56 },
  },
  alpha_centauri: {
    id: "alpha_centauri",
    name: "Alpha Centauri",
    faction: "frontier",
    description: "A hard-working nearby twin-star corridor where family freighters, survey ships, and ambitious independents still think the next haul changes everything.",
    danger: 0.34,
    neighbors: ["barnards_star", "tau_ceti", "sol"],
    station: { x: 728, y: 150 },
    palette: { glow: "rgba(255, 214, 142, 0.13)", planet: "#89a47c", planetShadow: "#4f5f45", station: "#d7f1c9", stationWarm: "#ffe29a" },
    legality: "lawful",
    routeNotes: "Busy nearby system where clean hauling, supplies, and expansion contracts pay reliably.",
    intel: "Centauri wants food, medicine, and captains who can move between old authority routes and younger frontier money.",
    shipyard: ["cutter", "trader", "tug"],
    traffic: { traders: 3, patrols: 1, pirates: 1, hostilePirates: 0, smugglers: 0 },
    economy: { food: 1.12, ore: 0.92, meds: 1.14, lux: 0.96, munitions: 1.02, contraband: 1.08 },
  },
  barnards_star: {
    id: "barnards_star",
    name: "Barnard's Star",
    faction: "independent",
    description: "A dim red-star stop with outsized relevance because every practical captain passing between civilized lanes eventually comes through.",
    danger: 0.29,
    neighbors: ["sol", "alpha_centauri", "tau_ceti"],
    station: { x: 548, y: 54 },
    palette: { glow: "rgba(255, 134, 104, 0.14)", planet: "#b26956", planetShadow: "#6b3d30", station: "#ffd0b3", stationWarm: "#ffe19a" },
    legality: "open",
    routeNotes: "A dim nearby red dwarf anchor where independent traders regroup and salvage crews sell whatever survived the jump.",
    intel: "Barnard traffic is practical: ore, spare parts, and captains who can keep a hull together between bigger names.",
    shipyard: ["kestrel", "cutter", "tug"],
    traffic: { traders: 2, patrols: 1, pirates: 0, hostilePirates: 0, smugglers: 1 },
    economy: { food: 1.06, ore: 0.86, meds: 1.08, lux: 1.02, munitions: 1.04, contraband: 1.14 },
  },
  sirius: {
    id: "sirius",
    name: "Sirius",
    faction: "authority",
    description: "A bright, wealthy lane where prestige cargo, military courier work, and serious inspections all travel together.",
    danger: 0.36,
    neighbors: ["sol", "tau_ceti", "ember_market"],
    station: { x: 896, y: 164 },
    palette: { glow: "rgba(167, 213, 255, 0.16)", planet: "#7fa4c2", planetShadow: "#48637b", station: "#d7e8ff", stationWarm: "#fff0b4" },
    legality: "strict",
    routeNotes: "Bright nearby hub with upscale cargo, authority contracts, and enough scrutiny to make smugglers sweat.",
    intel: "Sirius pays for luxury movement and official dispatches. It also remembers every captain who thought the rules looked optional.",
    permit: "coreTransit",
    shipyard: ["patrol", "corvette", "trader"],
    traffic: { traders: 2, patrols: 3, pirates: 1, hostilePirates: 0, smugglers: 0 },
    economy: { food: 0.96, ore: 1.04, meds: 0.98, lux: 1.28, munitions: 1.18, contraband: 1.52 },
  },
  tau_ceti: {
    id: "tau_ceti",
    name: "Tau Ceti",
    faction: "syndicate",
    description: "A farther nearby star where quiet financiers, private surveyors, and gray-market middlemen all insist they are just doing business.",
    danger: 0.52,
    neighbors: ["alpha_centauri", "barnards_star", "sirius", "mirage_verge"],
    station: { x: 904, y: 84 },
    palette: { glow: "rgba(196, 255, 203, 0.1)", planet: "#7a8f63", planetShadow: "#445038", station: "#d1ffd8", stationWarm: "#ffdf9f" },
    legality: "gray",
    routeNotes: "Nearby gray-market crossroads where respectable freight and unrespectable packets change hands under clean paperwork.",
    intel: "Tau Ceti loves deniability. Data moves, contraband moves, and syndicate brokers are always one smile away from a harder ask.",
    permit: "nightglassTransit",
    shipyard: ["smuggler", "trader", "corvette"],
    traffic: { traders: 2, patrols: 1, pirates: 1, hostilePirates: 1, smugglers: 2 },
    economy: { food: 1.04, ore: 1.0, meds: 1.16, lux: 1.18, munitions: 1.06, contraband: 0.76 },
  },
};

// Audio is intentionally deferred for a dedicated pass; these hooks give the sound layer authored places to land later.
const SECTOR_PERSONALITY = {
  grey_exchange: {
    arrivalTitle: "Loose Lights",
    arrival: "Cheap beacon light and open comms hit the canopy before your drive field fully dies.",
    banner: "Starter traffic, live rumors, cheap repairs.",
    dock: "The berths smell like coolant, nervous ambition, and captains pretending this next haul changes everything.",
    watch: "small freight, salvage gossip, and hustlers selling confidence by the drink",
  },
  union_harbor: {
    arrivalTitle: "Union Traffic",
    arrival: "Convoy marks and tug chatter cut across the lane. Everything here feels scheduled around real need.",
    banner: "Clinics, manifests, and impatient convoy crews.",
    dock: "Dock crews move like they already know which shortage is coming next and who will have to answer for it.",
    watch: "medicine contracts, food convoys, and pirate scouts sniffing the edges",
  },
  shale_barrens: {
    arrivalTitle: "Hot Scrapyard",
    arrival: "Refinery glow paints the hull orange while raider silhouettes prowl the edges of local traffic.",
    banner: "Boarding country and refinery heat.",
    dock: "The port runs on stripped bolts, hard looks, and people who price captured hulls before they ask who flew them.",
    watch: "bounty work, desperate haulers, and quick money with teeth",
  },
  authority_gate: {
    arrivalTitle: "Checkpoint Glass",
    arrival: "Patrol transponders light up before the station does. Every vector here feels inspected.",
    banner: "Checkpoint lanes, hot scans, expensive mistakes.",
    dock: "Uniforms own the walkway and every clerk sounds one stamp away from escalation.",
    watch: "clean courier work, munitions premiums, and patrol pressure",
  },
  cinder_wake: {
    arrivalTitle: "Furnace Approach",
    arrival: "Refinery glare and tug beacons smear across the glass while heavy haulers wallow past the berth.",
    banner: "Industrial glare, salvage whispers, plating crews.",
    dock: "Plating teams hammer on hulls nearby and every tug captain has a better story than their manifest.",
    watch: "ore margins, salvage pulls, and hard industrial favors",
  },
  iron_hollow: {
    arrivalTitle: "Belt Traffic",
    arrival: "Extraction lights blink through dust and every freighter looks half-loaded, half late.",
    banner: "Belt work, convoy bruises, hungry markets.",
    dock: "The berth feels tired in the way only shortage ports do: busy, blunt, and one missed convoy from trouble.",
    watch: "ore runs, relief cargo, and escort attrition",
  },
  ember_market: {
    arrivalTitle: "Gray Warmth",
    arrival: "Refinery haze turns the station into a rumor with docking clamps. Transponders lie more openly here.",
    banner: "Contraband lanes, borrowed loyalties, deep pockets.",
    dock: "Nobody raises their voice because everybody assumes the room is wired, bought, or both.",
    watch: "syndicate packets, luxury margins, and private deals",
  },
  mirage_verge: {
    arrivalTitle: "Blue Haze",
    arrival: "Survey glare and ghost traffic slide through a long blue wash. Half the lane looks real and the other half invoices like it is.",
    banner: "Edge data, expensive uncertainty, late patrols.",
    dock: "People talk softly here, like the system itself might decide to sell their words.",
    watch: "data courier work, strange salvage, and gray-route heat",
  },
  sol: {
    arrivalTitle: "Core Burn",
    arrival: "Traffic control paints neat lines across the system and the old homeworld glows like it still expects obedience.",
    banner: "Core lanes, bright bureaucracy, polished freight.",
    dock: "Everything is clean, expensive, and quietly judgmental.",
    watch: "registry work, core politics, and zero tolerance for dirt",
  },
  alpha_centauri: {
    arrivalTitle: "Twin Route",
    arrival: "Twin-star glare and family freight traffic make the approach feel busy but human.",
    banner: "Expansion traffic, family freighters, steady money.",
    dock: "The berth is full of working crews who already know which cousin owns the next warehouse.",
    watch: "supplies, construction freight, and pragmatic frontier deals",
  },
  barnards_star: {
    arrivalTitle: "Red Relay",
    arrival: "The red star stains the lane and the old relay traffic feels stubborn enough to outlive official maps.",
    banner: "Old relays, independent memory, practical captains.",
    dock: "Nobody wastes words here. The room values delivered promises more than polished pitch.",
    watch: "relay paperwork, medicine, and captains who still remember old routes",
  },
  sirius: {
    arrivalTitle: "White Ledger",
    arrival: "White light, civic polish, and expensive docking vectors make the whole system feel like a hearing in progress.",
    banner: "Civic money, hearings, and clean reputations.",
    dock: "Administrators, buyers, and freight lawyers all move like they expect the room to notice.",
    watch: "sealed packets, family leverage, and luxury scrutiny",
  },
  tau_ceti: {
    arrivalTitle: "Quiet Velvet",
    arrival: "Deep blue haze and syndicate routing ghosts make the approach feel deliberate, private, and a little too smooth.",
    banner: "Nightglass depth, quiet leverage, clean denials.",
    dock: "Every smile looks practiced and every favor sounds like a test.",
    watch: "high-end contraband, private packets, and doors that only open once",
  },
};

const SECTOR_ARCHIVE = {
  grey_exchange: {
    title: "Grey Exchange Berthbook",
    focus: "broker web",
    copy: "Grey Exchange survives on patched hulls, recycled introductions, and captains too stubborn to wash out. Freight matters here, but favors, spare parts, and who still answers your call matter more.",
    rumors: [
      "Old hands swear berth twelve still carries weld scars from the lane contraction riots, and lucky captains tap them before launch.",
      "Grey Exchange bartenders keep two books: one for drinks and one for who suddenly started asking about upgraded drives.",
    ],
  },
  union_harbor: {
    title: "Union Harbor Ledger",
    focus: "convoy unions",
    copy: "Union Harbor treats logistics like a moral obligation. Clinics, food depots, and convoy boards all blur together into one promise: if the frontier is going to survive, somebody has to keep showing up.",
    rumors: [
      "Dispatch crews say a single missed med convoy can change election math faster than any speech.",
      "Union stevedores still leave an empty crate near the clinic docks for captains who died finishing relief runs.",
    ],
  },
  shale_barrens: {
    title: "Shale Barrens Scrap Sheet",
    focus: "boarding economy",
    copy: "The Barrens turn wreckage into commerce faster than most lawful ports can process an invoice. Captured hulls, stripped plating, and refinery leftovers all move through the same rough hands.",
    rumors: [
      "Pirate crews paint fake claim marks on drifting wrecks so civilians back off before the real boarding teams arrive.",
      "A Shale broker is supposedly building a private fleet one captured escort at a time and calling it insurance.",
    ],
  },
  authority_gate: {
    title: "Authority Gate Record",
    focus: "checkpoint culture",
    copy: "Authority Gate is where paperwork becomes architecture. Patrols, scanners, and polite threats are all parts of the same machine, designed to remind captains that movement is a privilege the core can still price.",
    rumors: [
      "Checkpoint clerks compete over who can catch contraband from handwriting alone before a scanner ever warms up.",
      "Pilots whisper that Gate patrol captains sell seizure timings to brokers who know how to bet against late freight.",
    ],
  },
  cinder_wake: {
    title: "Cinder Wake Yard Notes",
    focus: "industrial salvage",
    copy: "Cinder Wake runs hot, practical, and loud. Tug crews talk in plating grades, salvage crews talk in ghost stories, and both assume a ship is only honest once its panels have been pried back.",
    rumors: [
      "A plating foreman claims the best hull patches in-system still come from a war nobody officially admits reached this far out.",
      "Cinder tug crews say every third distress beacon here is really a crew trying to sell a wreck before the insurers hear about it.",
    ],
  },
  iron_hollow: {
    title: "Iron Hollow Dispatch Notes",
    focus: "shortage port",
    copy: "Iron Hollow is what happens when extraction money collides with convoy fragility. Everyone looks overworked because they are, and every delay immediately turns into a story about who profited from it.",
    rumors: [
      "Dock rumor says half the escort market here is captains quietly replacing ships they lost pretending a convoy was never hit.",
      "The clinic quarter keeps a board of missed deliveries with names on it, and nobody likes seeing theirs added.",
    ],
  },
  ember_market: {
    title: "Ember Market Black Book",
    focus: "gray exchange",
    copy: "Ember Market launders chaos into etiquette. Deals are quiet, stylish, and heavily deniable, but under the polish it is still a place where leverage changes hands faster than cargo.",
    rumors: [
      "Market hosts are said to seat Authority buyers and Nightglass couriers in the same room as long as neither side uses legal names.",
      "A refinery corridor known as the Ember Spine supposedly has more private listening devices than light fixtures.",
    ],
  },
  mirage_verge: {
    title: "Mirage Verge Field Notes",
    focus: "survey haze",
    copy: "Mirage Verge sells uncertainty at luxury rates. Survey crews, gray couriers, and speculative salvagers all work the same blue haze, hoping the next packet or anomaly changes how the cluster is mapped.",
    rumors: [
      "Verge dockhands swear there are ships here that vanish from ordinary scans but still pay docking fees on time.",
      "Data brokers claim the most valuable export in-system is not ore or tech, but certainty sold in tiny portions.",
    ],
  },
  sol: {
    title: "Sol Civic Abstract",
    focus: "core legitimacy",
    copy: "Sol still behaves like the center, even when the lanes around it are held together by captains living far from its speeches. Its power is not just fleets or wealth, but the assumption that its paperwork is the final version of history.",
    rumors: [
      "Registry clerks joke that a captain can survive a hull breach easier than a mislabeled Sol filing.",
      "Orbital yard workers insist the old drydocks still keep reserve berths for ships carrying politically inconvenient cargo.",
    ],
  },
  alpha_centauri: {
    title: "Alpha Centauri Family Register",
    focus: "freight families",
    copy: "Centauri feels expansive because its money still remembers names instead of just numbers. Freight families, survey syndicates, and ambitious independents all overlap here, each convinced they are building the next stable middle of the cluster.",
    rumors: [
      "Centauri freight elders can apparently settle a dock strike faster than any magistrate if the right manifests are at risk.",
      "Young captains say the fastest way to get blacklisted here is not smuggling, but making an elder cousin look careless.",
    ],
  },
  barnards_star: {
    title: "Barnard Relay Book",
    focus: "independent memory",
    copy: "Barnard's Star matters because practical people kept it mattering. Relay crews, repair shops, and old captains preserved routes here long after larger powers started calling those same routes marginal.",
    rumors: [
      "Some relay mechanics still keep handwritten route books because they trust ink more than core-approved updates.",
      "Barnard dock gossip says half the cluster's missing paperwork passed through here on purpose, not by accident.",
    ],
  },
  sirius: {
    title: "Sirius White Ledger",
    focus: "prestige traffic",
    copy: "Sirius turns class into traffic management. Luxury freight, hearings, military dispatches, and respectable money all travel the same polished lanes, each pretending the others are merely background.",
    rumors: [
      "The wealthiest Sirius buyers allegedly judge captains by how quietly their escorts idle during inspection holds.",
      "A courthouse clerk swears most hearings here are decided long before the first sealed packet reaches the table.",
    ],
  },
  tau_ceti: {
    title: "Tau Ceti Quiet File",
    focus: "private finance",
    copy: "Tau Ceti is where respectable business and gray leverage stop pretending to be opposites. Brokers, survey financiers, and Nightglass intermediaries all speak the language of discretion because discretion is the real export.",
    rumors: [
      "Tau lenders are said to insure both sides of the same smuggling run as long as nobody asks how the numbers stay clean.",
      "Nightglass regulars whisper that the fastest path to real trust here is bringing back silence instead of profit.",
    ],
  },
};

const CONTACT_ARCHIVE = {
  "independent-mara-kade": {
    title: "Mara Kade",
    role: "Grey Exchange broker",
    tags: ["Independent", "Broker", "Grey Exchange"],
    portrait: "./assets/contacts/mara-kade-avatar.png",
    copy: "Mara deals in freight, introductions, and the kind of quiet trust that keeps independent stations stitched together. She speaks like every job is only half about cargo and half about who still answers for Grey Exchange when things get hard.",
  },
  "union-juno-vale": {
    title: "Juno Vale",
    role: "Union dispatcher",
    tags: ["Frontier", "Dispatch", "Union Harbor"],
    portrait: "./assets/contacts/juno-vale-avatar.png",
    copy: "Juno treats logistics as a frontline discipline. To her, manifests are triage, convoy timing is politics, and every preventable delay is proof that somebody made survival less important than leverage.",
  },
  "salvage-dax-brindle": {
    title: "Dax Brindle",
    role: "Wreck diver",
    tags: ["Independent", "Salvage", "Cinder Wake"],
    portrait: "./assets/contacts/dax-brindle-avatar.png",
    copy: "Dax sees wrecks the way archivists see sealed boxes: as things that still might confess. He talks like a salvage broker, but he pays attention to old manifests, vanished names, and what drifting metal remembers.",
  },
  "nightglass-vey-neral": {
    title: "Vey Neral",
    role: "Nightglass broker",
    tags: ["Syndicate", "Broker", "Ember Market"],
    portrait: "./assets/contacts/vey-neral-avatar.png",
    copy: "Vey represents the Nightglass habit of making intimacy sound like strategy. Their offers are polished, selective, and wrapped in just enough courtesy to keep you from noticing how much risk is being pushed onto your hull.",
  },
  "core-ilya-sen": {
    title: "Clerk Ilya Sen",
    role: "Registry liaison",
    tags: ["Authority", "Registry", "Sol"],
    portrait: "./assets/contacts/ilya-sen-avatar.png",
    copy: "Ilya belongs to the bureaucratic class that keeps the core authoritative even when its practical reach thins. He believes records matter because records decide who counts, which is why he pays such close attention to frontier captains who refuse to stay minor.",
  },
  "bounty-marshal-tovin": {
    title: "Marshal Tovin",
    role: "Lane marshal",
    tags: ["Authority", "Security", "Checkpoint Lanes"],
    portrait: "./assets/contacts/marshal-tovin-avatar.png",
    copy: "Tovin is the lawful lane made personal: blunt, impatient, and allergic to romantic stories about violence. He values captains who close problems cleanly and distrusts anyone who seems to enjoy the work too much.",
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
  { id: "sol", x: 0.58, y: 0.08 },
  { id: "alpha_centauri", x: 0.7, y: 0.17 },
  { id: "barnards_star", x: 0.46, y: 0.07 },
  { id: "sirius", x: 0.66, y: 0.31 },
  { id: "tau_ceti", x: 0.75, y: 0.08 },
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
  messageLog: [],
  permits: {
    coreTransit: false,
    nightglassTransit: false,
  },
  player: {
    hullId: "dinghy",
    hull: HULLS.dinghy.maxHull,
    shield: HULLS.dinghy.maxShield,
    credits: 180,
    fuel: HULLS.dinghy.fuelCap,
    loanerHull: false,
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
    shieldFlash: 0,
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
  escortRegistryCounter: 1,
  escortFlightStates: [],
  escortCommand: "defend",
  activeSectorEvent: null,
  sectorStates: {},
  scanState: null,
  scanCooldown: 0,
  encounterCooldown: 0,
  encounterTriggeredThisFlight: false,
  encounterCounter: 0,
  debugVisible: false,
  factionArc: {
    stage: "intro",
    path: null,
    completed: [],
  },
  coreArc: {
    stage: "locked",
    completed: [],
  },
  contactArcs: {
    mara: { stage: "intro", completed: [] },
    dax: { stage: "intro", completed: [] },
    juno: { stage: "intro", completed: [] },
  },
  intrigue: {
    stage: "dormant",
    completed: [],
    flags: [],
  },
  visitedSectors: ["grey_exchange"],
  sectorRumorProgress: {},
  archiveKnownIds: [],
  archiveUnreadIds: [],
  missionThreads: {},
  uiTextCache: {
    offer: {},
    preview: {},
  },
  activeMissionThreadId: null,
  arrivalThreadPings: {},
  threadScrollOffset: Infinity,
  threadScrollMax: 0,
  lastDockDebrief: null,
  enemyShips: [],
  bullets: [],
  sparks: [],
  bursts: [],
  popup: null,
  escapeSequence: null,
  travelSequence: null,
  starmapSelection: "union_harbor",
  starmapCamera: { x: 0, y: 0 },
  starmapReturnMode: "dock",
  autopilot: {
    enabled: false,
    orbitAngle: 0,
    radius: AUTOPILOT_ORBIT_RADIUS,
  },
  lastAutosaveAt: 0,
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

function hasCompletedContract(contractId) {
  return state.intrigue.completed.includes(contractId)
    || state.factionArc.completed.includes(contractId)
    || state.coreArc.completed.includes(contractId)
    || state.contactArcs.mara.completed.includes(contractId)
    || state.contactArcs.dax.completed.includes(contractId)
    || state.contactArcs.juno.completed.includes(contractId);
}

function intrigueFlag(flag) {
  return state.intrigue.flags.includes(flag);
}

function markIntrigueFlag(flag) {
  if (!flag || intrigueFlag(flag)) return;
  state.intrigue.flags.push(flag);
}

function mysterySignalTags() {
  const tags = [];
  if (hasCompletedContract("mystery-relief-freight")) tags.push("relief freight that felt pre-cleared");
  if (hasCompletedContract("mystery-manifest-anomaly")) tags.push("a registry addendum that arrived before the audit request");
  if (hasCompletedContract("mystery-escort-trace")) tags.push("the missing escort hull Saint Radiant");
  if (hasCompletedContract("mystery-ninth-berth")) tags.push("references to a berth nobody will place on a public map");
  return tags;
}

function intrigueMemoryFlavor() {
  const tags = mysterySignalTags();
  if (!tags.length) return "";
  if (tags.length === 1) return `You have seen ${tags[0]} enough times that it no longer feels accidental.`;
  return `Too many people keep circling the same things: ${tags.slice(0, 3).join(", ")}.`;
}

function hullMenuArt(hullId) {
  return HULL_MENU_ART[hullId] || "";
}

function sectorMenuArt(sectorId) {
  return SECTOR_MENU_ART[sectorId] || "";
}

function archiveArt(entryId) {
  return ARCHIVE_ART[entryId] || "";
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

function sectorPersonality(sectorId = state.currentSectorId) {
  return SECTOR_PERSONALITY[sectorId] || {
    arrivalTitle: "Live Traffic",
    arrival: "The lane hands you back to local traffic with no special kindness.",
    banner: "Traffic is live and the room is already moving without you.",
    dock: "The docks are busy enough to hide stories in plain sight.",
    watch: "whatever opportunity blinks first",
  };
}

function sectorArrivalPacket(sectorId = state.currentSectorId) {
  const sector = SECTORS[sectorId];
  const personality = sectorPersonality(sectorId);
  const condition = sectorCondition(sectorId);
  return {
    title: `${sector.name} // ${personality.arrivalTitle}`,
    copy: [
      personality.arrival,
      sector.routeNotes,
      sector.intel,
      condition ? `Current lane condition: ${condition.title}. ${condition.copy}` : "",
      personality.watch ? `Watch for ${personality.watch}.` : "",
    ].filter(Boolean).join(" "),
    bannerTitle: personality.arrivalTitle,
    bannerCopy: personality.banner,
    hint: `Steer clean. ${personality.watch ? `Watch for ${personality.watch}. ` : ""}${currentSectorEventTag()}.`,
    overlay: `${personality.arrival} ${sector.intel}`,
  };
}

function dockMoodTag(sectorId = state.currentSectorId) {
  const sector = SECTORS[sectorId];
  if (!sector) return "Active Dock";
  if (sector.legality === "strict") return "Checkpoint Eyes";
  if (sector.legality === "gray") return "Private Deals";
  if (sector.legality === "pirate") return "Rough Berth";
  if (sector.faction === "frontier") return "Working Port";
  return "Open Berth";
}

function recentDebriefContextLine() {
  if (!state.lastDockDebrief?.summary) return "";
  return `Fresh aftermath: ${state.lastDockDebrief.summary}`;
}

function dockContextLine(sectorId = state.currentSectorId) {
  const sector = SECTORS[sectorId];
  const personality = sectorPersonality(sectorId);
  const condition = sectorCondition(sectorId);
  const access = dockAccessState();
  const rumorBeat = latestRumorForSector(sectorId);
  const rep = factionReputation(sector.faction);
  const repBeat = access === "restricted"
    ? "Security keeps you at arm's length and the room notices."
    : rep >= 10
      ? "People are greeting your hull by reputation before they read the registry."
      : rep <= -8
        ? "Half the berth pretends not to know you and the other half watches your hands."
        : "";
  return [
    personality.dock,
    condition ? `${condition.title} is shaping dock gossip right now.` : "",
    repBeat,
    rumorBeat ? `Latest whisper: ${rumorBeat}` : "",
    recentDebriefContextLine(),
  ].filter(Boolean).join(" ");
}

function allocateEscortCallsign(hullId) {
  const bank = ESCORT_CALLSIGN_BANK[hullId] || ESCORT_CALLSIGN_BANK.kestrel;
  const counter = Math.max(1, Number(state.escortRegistryCounter || 1));
  const stem = bank[(counter - 1) % bank.length];
  state.escortRegistryCounter = counter + 1;
  return `${stem}-${counter}`;
}

function normalizeEscortRecord(escort) {
  if (!escort || !HULLS[escort.hullId]) return null;
  const hull = HULLS[escort.hullId];
  return {
    name: typeof escort.name === "string" && escort.name.trim() ? escort.name.trim() : hull.name,
    sale: Number.isFinite(escort.sale) ? escort.sale : hull.sale,
    hullId: escort.hullId,
    callsign: typeof escort.callsign === "string" && escort.callsign.trim() ? escort.callsign.trim() : allocateEscortCallsign(escort.hullId),
    kills: Math.max(0, Number(escort.kills || 0)),
    captures: Math.max(0, Number(escort.captures || 0)),
    origin: escort.origin || "reserve",
  };
}

function createEscortRecord(hullId, options = {}) {
  if (!HULLS[hullId]) return null;
  return normalizeEscortRecord({
    hullId,
    name: options.name || HULLS[hullId].name,
    sale: options.sale ?? HULLS[hullId].sale,
    callsign: options.callsign,
    kills: options.kills || 0,
    captures: options.captures || 0,
    origin: options.origin || "reserve",
  });
}

function normalizeEscortHangar() {
  if (!Array.isArray(state.escortHangar)) {
    state.escortHangar = [];
    return;
  }
  state.escortHangar = state.escortHangar
    .map((escort) => normalizeEscortRecord(escort))
    .filter(Boolean)
    .slice(0, MAX_ESCORTS);
}

function escortDisplayName(escort) {
  return escort?.callsign || escort?.name || "Reserve Hull";
}

function escortFullLabel(escort) {
  const hullName = HULLS[escort?.hullId]?.name || escort?.name || "Unknown Hull";
  return `${escortDisplayName(escort)} • ${hullName}`;
}

function escortStatusLine(escort) {
  if (!escort) return "No reserve data";
  const parts = [];
  parts.push(`${HULLS[escort.hullId]?.classRole || "Reserve hull"}`);
  parts.push(escort.kills > 0 ? `${escort.kills} disable${escort.kills === 1 ? "" : "s"}` : "unblooded");
  if (escort.captures > 0) {
    parts.push(`${escort.captures} prize${escort.captures === 1 ? "" : "s"}`);
  } else if (escort.origin === "yard") {
    parts.push("yard berth");
  } else if (escort.origin === "capture") {
    parts.push("taken in boarding");
  } else {
    parts.push("reserve hull");
  }
  return parts.join(" | ");
}

function escortRosterSummary(limit = 3) {
  normalizeEscortHangar();
  if (!state.escortHangar.length) return "No reserve hulls";
  const names = state.escortHangar.slice(0, limit).map((escort) => escortDisplayName(escort));
  const extra = state.escortHangar.length - names.length;
  return extra > 0 ? `${names.join(" / ")} / +${extra}` : names.join(" / ");
}

function nearestEscortRecordTo(target) {
  normalizeEscortHangar();
  syncEscortFlightStates();
  let best = null;
  let bestDistance = Infinity;
  state.escortFlightStates.forEach((escortState, index) => {
    const escort = state.escortHangar[index];
    if (!escort || !escortState) return;
    const dist = distance(escortState, target);
    if (dist < bestDistance) {
      bestDistance = dist;
      best = escort;
    }
  });
  return best;
}

const UI_TEXT_FIXUPS = [
  ["â€™", "'"],
  ["â€˜", "'"],
  ["â€œ", '"'],
  ["â€�", '"'],
  ["â€¦", "..."],
  ["â€”", "-"],
  ["â€“", "-"],
  ["Â", ""],
  ["�", ""],
];

function normalizeUiText(text, options = {}) {
  if (text == null) return "";
  let value = String(text).normalize("NFC");
  for (const [artifact, replacement] of UI_TEXT_FIXUPS) {
    value = value.split(artifact).join(replacement);
  }
  value = value
    .replace(/\\[nrt]/g, " ")
    .replace(/\r?\n+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .trim();
  if (options.stripOuterQuotes) {
    const pairs = [
      ['"', '"'],
      ["'", "'"],
      ["“", "”"],
      ["‘", "’"],
    ];
    for (const [open, close] of pairs) {
      if (value.startsWith(open) && value.endsWith(close) && value.length > open.length + close.length) {
        value = value.slice(open.length, value.length - close.length).trim();
        break;
      }
    }
  }
  return value;
}

function promptLabelText(text) {
  return normalizeUiText(text, { stripOuterQuotes: true });
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeUiText(text, options = {}) {
  return escapeHtml(normalizeUiText(text, options));
}

function pushMessageLog(text, tag = "Update") {
  const normalized = normalizeUiText(text);
  if (!normalized) return;
  const previous = state.messageLog[0];
  if (previous && previous.text === normalized && previous.tag === tag) {
    return;
  }
  state.messageLog.unshift({
    text: normalized,
    tag,
    sectorId: state.currentSectorId,
  });
  state.messageLog = state.messageLog.slice(0, MESSAGE_LOG_LIMIT);
}

function shouldLogStatus(text) {
  if (!text) return false;
  if (text.startsWith("Taking fire in ")) return false;
  if (text === "Command deck highlighted. Use the side panel or press start again after a choice.") return false;
  return true;
}

function setStatus(text, options = {}) {
  const normalized = normalizeUiText(text);
  state.statusText = normalized;
  if (options.log === false) return;
  if (shouldLogStatus(normalized)) {
    pushMessageLog(normalized, options.tag || "Status");
  }
}

function setHint(text) {
  state.hintText = normalizeUiText(text);
}

function standardFlightHint() {
  return `Steer with stick or d-pad. South fires, west docks or boards, north opens the starmap. Left bumper toggles chill autopilot. ${currentSectorEventTag()}.`;
}

function disableAutopilot(options = {}) {
  if (!state.autopilot.enabled) return;
  state.autopilot.enabled = false;
  if (options.message) {
    setStatus(options.message, { tag: "Autopilot", log: options.log ?? true });
  }
  if (options.updateHint !== false) {
    setHint(standardFlightHint());
  }
}

function enableAutopilot() {
  const station = currentSector().station;
  state.autopilot.enabled = true;
  state.autopilot.radius = AUTOPILOT_ORBIT_RADIUS;
  state.autopilot.orbitAngle = Math.atan2(state.player.y - station.y, state.player.x - station.x);
  setStatus(`Chill autopilot engaged around ${currentSector().name}.`, { tag: "Autopilot" });
  setHint("Chill mode is holding a gentle orbit. Left bumper toggles it off, or touch the stick to take over.");
}

function toggleAutopilot() {
  if (playerIsInEscapePod() || state.mode !== "flight") return;
  if (state.autopilot.enabled) {
    disableAutopilot({ message: "Chill autopilot disengaged." });
    return;
  }
  enableAutopilot();
}

function updateAutopilot(dt) {
  const station = currentSector().station;
  state.autopilot.orbitAngle += AUTOPILOT_ANGULAR_SPEED * dt;
  const targetX = station.x + Math.cos(state.autopilot.orbitAngle) * state.autopilot.radius;
  const targetY = station.y + Math.sin(state.autopilot.orbitAngle) * state.autopilot.radius * 0.62;
  const dx = targetX - state.player.x;
  const dy = targetY - state.player.y;
  const desiredAngle = Math.atan2(dy, dx);
  state.player.angle = desiredAngle;

  const speed = Math.hypot(state.player.vx, state.player.vy);
  const needsPush = Math.hypot(dx, dy) > 28 || speed < AUTOPILOT_SPEED_TARGET;
  if (needsPush) {
    state.player.vx += Math.cos(desiredAngle) * currentHull().accel * AUTOPILOT_ACCEL_SCALE * dt;
    state.player.vy += Math.sin(desiredAngle) * currentHull().accel * AUTOPILOT_ACCEL_SCALE * dt;
  }
}

function setOverlay(title, copy) {
  state.overlayTitle = normalizeUiText(title);
  state.overlayCopy = normalizeUiText(copy);
}

function showBanner(title, copy, duration = 2.4) {
  state.banner = {
    title: normalizeUiText(title),
    copy: normalizeUiText(copy),
  };
  state.bannerTimer = duration;
}

function addScreenShake(amount = 10) {
  state.screenShake = Math.max(state.screenShake, amount);
}

function playerIsInEscapePod() {
  return Boolean(state.escapeSequence);
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

function dockAccessStateForSector(sector = currentSector()) {
  const rep = factionReputation(sector.faction);
  const sectorState = sectorCondition(sector.id);
  const underSweep = sectorState?.id === "inspection_sweep";
  if ((sector.legality === "lawful" || sector.legality === "strict") && (rep <= -16 || (underSweep && hasContraband() && rep <= -8))) {
    return "denied";
  }
  if ((sector.legality === "lawful" || sector.legality === "strict") && rep <= -12) {
    return "restricted";
  }
  if ((sector.legality === "gray" || sector.faction === "pirate") && (rep >= 6 || sectorState?.id === "shadow_market")) {
    return "favored";
  }
  return "open";
}

function dockAccessState() {
  return dockAccessStateForSector(currentSector());
}

function escortCount() {
  return state.escortHangar.length;
}

function hasAuthorityPermit() {
  return factionReputation("authority") >= 8 || state.factionArc.stage === "resolved" && state.factionArc.path === "authority";
}

function hasSyndicateAccess() {
  return factionReputation("syndicate") >= 6 || (state.factionArc.path === "syndicate" && state.factionArc.stage !== "intro");
}

function hasPirateContact() {
  return factionReputation("pirate") >= 4;
}

function hasSectorPermit(permitId) {
  return Boolean(state.permits?.[permitId]);
}

function travelPermitLabel(permitId) {
  if (permitId === "coreTransit") return "Core Transit Permit";
  if (permitId === "nightglassTransit") return "Nightglass Transit Key";
  return "Transit Permit";
}

function sectorTravelRequirement(sectorId) {
  const sector = SECTORS[sectorId];
  if (!sector?.permit) return null;
  if (hasSectorPermit(sector.permit)) return null;
  return sector.permit;
}

function canTravelToSector(sectorId) {
  return travelPlanForSector(sectorId).canTravel;
}

function hyperspaceLockText() {
  return state.player.loanerHull ? "Dockside loaner not cleared for hyperspace" : "";
}

function jumpCountLabel(count) {
  return `${count} jump${count === 1 ? "" : "s"}`;
}

function routingSectorIds(originId = state.currentSectorId) {
  return Array.from(new Set([originId, ...knownSectorIds()])).filter((sectorId) => SECTORS[sectorId]);
}

function plottedRouteToSector(targetSectorId, originId = state.currentSectorId) {
  if (!SECTORS[targetSectorId] || !SECTORS[originId]) return null;
  if (targetSectorId !== originId && !sectorIsKnown(targetSectorId)) return null;
  if (targetSectorId === originId) return [originId];

  const allowed = new Set(routingSectorIds(originId));
  const queue = [originId];
  const previous = new Map([[originId, null]]);

  while (queue.length) {
    const sectorId = queue.shift();
    for (const neighborId of SECTORS[sectorId].neighbors) {
      if (!allowed.has(neighborId) || previous.has(neighborId)) continue;
      previous.set(neighborId, sectorId);
      if (neighborId === targetSectorId) {
        const route = [targetSectorId];
        let cursor = sectorId;
        while (cursor) {
          route.unshift(cursor);
          cursor = previous.get(cursor) || null;
        }
        return route;
      }
      queue.push(neighborId);
    }
  }
  return null;
}

function routeFuelCost(route) {
  return Math.max(0, (route?.length || 1) - 1);
}

function routeWaypointLabel(route) {
  const via = (route || []).slice(1, -1).map((sectorId) => SECTORS[sectorId]?.name).filter(Boolean);
  if (!via.length) return "Direct lane";
  if (via.length === 1) return `Via ${via[0]}`;
  if (via.length === 2) return `Via ${via[0]} and ${via[1]}`;
  return `Via ${via[0]}, ${via[1]}, and ${via.length - 2} more`;
}

function routeSummaryLabel(route) {
  if (!route || route.length <= 1) return "";
  const names = route.map((sectorId) => SECTORS[sectorId]?.name).filter(Boolean);
  if (names.length <= 4) return names.join(" -> ");
  return `${names[0]} -> ${names[1]} -> ... -> ${names[names.length - 1]}`;
}

function routePermitBlock(route) {
  for (const sectorId of (route || []).slice(1)) {
    const requirement = sectorTravelRequirement(sectorId);
    if (requirement) {
      return { sectorId, requirement };
    }
  }
  return null;
}

function travelPlanForSector(sectorId, originId = state.currentSectorId) {
  if (!SECTORS[sectorId]) {
    return { route: null, fuelCost: 0, jumpCount: 0, blockedReason: "Unknown sector", blockedTag: "Route", canTravel: false, waypointLabel: "", routeLabel: "" };
  }
  if (sectorId === originId) {
    return { route: [originId], fuelCost: 0, jumpCount: 0, blockedReason: "Already in system", blockedTag: "Route", canTravel: false, waypointLabel: "", routeLabel: SECTORS[originId].name };
  }

  const route = plottedRouteToSector(sectorId, originId);
  if (!route) {
    return { route: null, fuelCost: 0, jumpCount: 0, blockedReason: "No mapped course from current sector", blockedTag: "Route", canTravel: false, waypointLabel: "", routeLabel: "" };
  }

  const fuelCost = routeFuelCost(route);
  const permitBlock = routePermitBlock(route);
  let blockedReason = "";
  let blockedTag = "Route";

  if (state.player.loanerHull) {
    blockedReason = hyperspaceLockText();
    blockedTag = "Flagship";
  } else if (permitBlock) {
    blockedReason = `${travelPermitLabel(permitBlock.requirement)} required at ${SECTORS[permitBlock.sectorId]?.name || "restricted sector"}`;
    blockedTag = "Permit";
  } else if (fuelCost > currentHull().fuelCap) {
    blockedReason = `Route needs ${fuelCost} fuel but ${currentHull().name} only carries ${currentHull().fuelCap}`;
    blockedTag = "Fuel";
  } else if (state.player.fuel < fuelCost) {
    blockedReason = `Route needs ${fuelCost} fuel and you only have ${state.player.fuel}`;
    blockedTag = "Fuel";
  }

  return {
    route,
    fuelCost,
    jumpCount: fuelCost,
    blockedReason,
    blockedTag,
    canTravel: !blockedReason,
    waypointLabel: routeWaypointLabel(route),
    routeLabel: routeSummaryLabel(route),
  };
}

function routeContainsLane(route, fromId, toId) {
  for (let index = 0; index < (route?.length || 0) - 1; index += 1) {
    const start = route[index];
    const end = route[index + 1];
    if ((start === fromId && end === toId) || (start === toId && end === fromId)) {
      return true;
    }
  }
  return false;
}

function travelLockText(sectorId) {
  return travelPlanForSector(sectorId).blockedReason;
}

function knownSectorIds() {
  return state.discoveredSectors.filter((id) => SECTORS[id]);
}

function knownStarmapNodes() {
  return STAR_MAP.filter((node) => sectorIsKnown(node.id) || node.id === state.currentSectorId);
}

function starmapNodeById(sectorId) {
  return STAR_MAP.find((node) => node.id === sectorId) || null;
}

function selectedStarmapSectorId() {
  if (state.starmapSelection && (sectorIsKnown(state.starmapSelection) || state.starmapSelection === state.currentSectorId)) {
    return state.starmapSelection;
  }
  return state.currentSectorId;
}

function syncStarmapMenuIndex() {
  const nodes = knownStarmapNodes();
  const index = nodes.findIndex((node) => node.id === selectedStarmapSectorId());
  state.selectedMenuIndex = index >= 0 ? index : 0;
}

function setStarmapSelection(sectorId) {
  if (!SECTORS[sectorId]) return;
  if (!sectorIsKnown(sectorId) && sectorId !== state.currentSectorId) return;
  state.starmapSelection = sectorId;
  syncStarmapMenuIndex();
}

function starmapFocusTarget() {
  const node = starmapNodeById(selectedStarmapSectorId()) || starmapNodeById(state.currentSectorId);
  if (!node) return { x: 0, y: 0 };
  const focusX = WIDTH * 0.42;
  const focusY = HEIGHT * 0.5;
  const targetX = clamp(focusX - node.x * WIDTH, -WIDTH * 0.16, WIDTH * 0.16);
  const targetY = clamp(focusY - node.y * HEIGHT, -HEIGHT * 0.12, HEIGHT * 0.12);
  return { x: targetX, y: targetY };
}

function sectorIsKnown(sectorId) {
  return state.discoveredSectors.includes(sectorId);
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

function saveNameStorageKey(slot = 0) {
  return `${SAVE_NAME_STORAGE_PREFIX}.${slot}`;
}

function defaultSaveSlotName(slot = 0) {
  return `Slot ${slot + 1}`;
}

function normalizeSaveSlotName(name) {
  if (typeof name !== "string") return "";
  return name.replace(/\s+/g, " ").trim().slice(0, 28);
}

function storedSaveSlotName(slot = 0) {
  try {
    return normalizeSaveSlotName(window.localStorage.getItem(saveNameStorageKey(slot)) || "");
  } catch (_error) {
    return "";
  }
}

function setStoredSaveSlotName(slot = 0, name = "") {
  const normalized = normalizeSaveSlotName(name);
  try {
    if (normalized) {
      window.localStorage.setItem(saveNameStorageKey(slot), normalized);
    } else {
      window.localStorage.removeItem(saveNameStorageKey(slot));
    }
    return normalized;
  } catch (_error) {
    return "";
  }
}

function readSavedGame(slot = 0) {
  const raw = window.localStorage.getItem(saveStorageKey(slot));
  if (!raw) return null;
  return JSON.parse(raw);
}

function saveSlotName(slot = 0, meta = null) {
  return meta?.slotName || storedSaveSlotName(slot) || defaultSaveSlotName(slot);
}

function savedRunMeta(slot = 0) {
  try {
    const saved = readSavedGame(slot);
    if (!saved || !saved.currentSectorId || !saved.player) return null;
    return {
      slot,
      slotName: storedSaveSlotName(slot) || normalizeSaveSlotName(saved.slotName || ""),
      savedAt: saved.savedAt,
      sectorName: SECTORS[saved.currentSectorId]?.name || "Unknown sector",
      credits: Number(saved.player.credits || 0),
      hullName: HULLS[saved.player.hullId]?.name || "Unknown ship",
    };
  } catch (_error) {
    return null;
  }
}

function latestSavedSlot() {
  let latest = null;
  for (let slot = 0; slot < SAVE_SLOT_COUNT; slot += 1) {
    const meta = savedRunMeta(slot);
    if (!meta) continue;
    const savedAt = Date.parse(meta.savedAt || "");
    if (!Number.isFinite(savedAt)) continue;
    if (!latest || savedAt > latest.savedAt) {
      latest = { slot, savedAt };
    }
  }
  return latest?.slot ?? null;
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

function missionContactProfile(contract = null, sector = currentSector()) {
  const portraits = {
    mara: "./assets/contacts/mara-kade-avatar.png",
    dax: "./assets/contacts/dax-brindle-avatar.png",
    juno: "./assets/contacts/juno-vale-avatar.png",
    ilya: "./assets/contacts/ilya-sen-avatar.png",
    vey: "./assets/contacts/vey-neral-avatar.png",
    tovin: "./assets/contacts/marshal-tovin-avatar.png",
    nix: "./assets/contacts/dockrunner-nix-avatar.png",
  };
  const byTheme = {
    core: {
      id: "core-ilya-sen",
      name: "Clerk Ilya Sen",
      role: "Registry Liaison",
      color: "#c8d8ff",
      portrait: portraits.ilya,
      initials: "IS",
      opener: "Keep your patch visible and your registry cleaner than your reputation, and we can talk about work that matters to the core.",
    },
    union: {
      id: "union-juno-vale",
      name: "Juno Vale",
      role: "Union Dispatcher",
      color: "#9ef59f",
      portrait: portraits.juno,
      initials: "JV",
      opener: "The Union pays captains who show up when the lane gets thin. Pull up a chair and tell me how much trouble you can survive.",
    },
    nightglass: {
      id: "nightglass-vey-neral",
      name: "Vey Neral",
      role: "Nightglass Broker",
      color: "#f0afd2",
      portrait: portraits.vey,
      initials: "VN",
      opener: "The room dips a few degrees when someone worth trusting leans in. If I am talking to you, that means something.",
    },
    salvage: {
      id: "salvage-dax-brindle",
      name: "Dax Brindle",
      role: "Wreck Diver",
      color: "#ffcf74",
      portrait: portraits.dax,
      initials: "DB",
      opener: "You have that look. The one that says a drifting hull is not a tragedy, it is an opportunity.",
    },
    bounty: {
      id: "bounty-marshal-tovin",
      name: "Marshal Tovin",
      role: "Lane Marshal",
      color: "#ff8a8a",
      portrait: portraits.tovin,
      initials: "MT",
      opener: "There is always somebody in the lane who thinks force is a personality. I need captains who can correct that.",
    },
    independent: {
      id: sector.id === "grey_exchange" ? "independent-mara-kade" : `independent-${sector.id}`,
      name: sector.id === "grey_exchange" ? "Mara Kade" : "Dockrunner Nix",
      role: sector.id === "grey_exchange" ? "Grey Exchange Regular" : "Independent Fixer",
      color: "#79d8ff",
      portrait: sector.id === "grey_exchange" ? portraits.mara : portraits.nix,
      initials: sector.id === "grey_exchange" ? "MK" : "DN",
      opener: sector.id === "grey_exchange"
        ? "You look like someone who still flies on nerve instead of paperwork. Sit down. I might have something."
        : "Word moves fast on these docks. If you came in clean, there is probably work worth hearing.",
    },
  };

  if ((contract?.tags || []).includes("Mara Thread")) {
    return {
      id: "independent-mara-kade",
      name: "Mara Kade",
      role: "Grey Exchange Regular",
      color: "#79d8ff",
      portrait: portraits.mara,
      initials: "MK",
      opener: "You made it back. Sit down. Every captain says they're only one haul away from getting clear. Very few know what clear even means.",
    };
  }
  if ((contract?.tags || []).includes("Dax Thread")) {
    return {
      id: "salvage-dax-brindle",
      name: "Dax Brindle",
      role: "Wreck Diver",
      color: "#ffcf74",
      portrait: portraits.dax,
      initials: "DB",
      opener: "Hull scars like yours mean you know the difference between a graveyard and an opportunity.",
    };
  }
  if ((contract?.tags || []).includes("Juno Thread")) {
    return {
      id: "union-juno-vale",
      name: "Juno Vale",
      role: "Union Dispatcher",
      color: "#9ef59f",
      initials: "JV",
      opener: "You showed up on the right dock at the right time. That usually means somebody is short on options.",
    };
  }
  if (contract && ((contract.tags || []).includes("Core Arc") || contract.grantsPermit === "coreTransit" || contract.factionId === "authority")) {
    return byTheme.core;
  }
  if (contract && ((contract.tags || []).includes("Faction Arc") || contract.factionId === "syndicate" || (contract.tags || []).includes("Nightglass"))) {
    return byTheme.nightglass;
  }
  if (contract?.type === "salvage") return byTheme.salvage;
  if (contract?.type === "bounty") return byTheme.bounty;
  if (contract?.factionId === "frontier") return byTheme.union;
  if (sector.faction === "frontier") return byTheme.union;
  if (sector.faction === "authority") return byTheme.core;
  if (sector.faction === "syndicate") return byTheme.nightglass;
  return byTheme.independent;
}

function existingMissionThreadIdForContract(contract) {
  if (!contract?.id) return null;
  const match = Object.values(state.missionThreads || {}).find((thread) => (
    Array.isArray(thread?.messages) && thread.messages.some((message) => message.contractId === contract.id)
  ));
  return match?.id || null;
}

function missionThreadIdForContract(contract) {
  return contract?.threadId || existingMissionThreadIdForContract(contract) || missionContactProfile(contract).id;
}

function appendMissionThreadMessage(threadId, message, options = {}) {
  if (!threadId) return;
  if (!state.missionThreads[threadId]) return;
  state.missionThreads[threadId].messages.push({
    from: message.from,
    text: normalizeUiText(message.text),
    contractId: message.contractId || null,
  });
  state.missionThreads[threadId].messages = state.missionThreads[threadId].messages.slice(-40);
  if (options.unread) {
    state.missionThreads[threadId].unread = (state.missionThreads[threadId].unread || 0) + 1;
  }
  if (state.dockScreen === "contract-thread" && state.activeMissionThreadId === threadId) {
    resetThreadViewport(true);
  }
}

function isOfferListingMessage(message, thread) {
  if (!message || !thread || message.from !== "them" || !message.text) return false;
  const relatedContracts = [...state.availableContracts, ...state.activeContracts]
    .filter((contract) => missionThreadIdForContract(contract) === thread.id);
  return relatedContracts.some((contract) => message.text === `${contract.title}. ${contract.copy}`);
}

function linkedCompletionMessages(thread) {
  if (!thread) return [];
  const contractIds = new Set(thread.messages.map((message) => message.contractId).filter(Boolean));
  if (!contractIds.size) return [];
  return Object.values(state.missionThreads || {})
    .filter((candidate) => candidate && candidate.id !== thread.id)
    .flatMap((candidate) => candidate.messages || [])
    .filter((message) => (
      contractIds.has(message.contractId)
      && message.from === "them"
      && typeof message.text === "string"
      && message.text.includes("Reward transferred:")
    ));
}

function visibleMissionThreadMessages(thread) {
  if (!thread) return [];
  const visible = thread.messages.filter((message) => !isOfferListingMessage(message, thread));
  const seen = new Set(visible.map((message) => `${message.from}:${message.contractId || ""}:${message.text}`));
  for (const message of linkedCompletionMessages(thread)) {
    const key = `${message.from}:${message.contractId || ""}:${message.text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    visible.push(message);
  }
  return visible;
}

function ensureMissionThread(contract) {
  const existingThreadId = contract?.threadId || existingMissionThreadIdForContract(contract);
  const fallbackContact = missionContactProfile(contract);
  const threadId = existingThreadId || fallbackContact.id;
  const contact = state.missionThreads[threadId]?.contact || fallbackContact;
  if (!state.missionThreads[threadId]) {
    state.missionThreads[threadId] = {
      id: threadId,
      contact,
      messages: [
        { from: "them", text: contact.opener, contractId: null },
      ],
      unread: 0,
    };
  } else {
    state.missionThreads[threadId].contact = contact;
  }
  return state.missionThreads[threadId];
}

function syncMissionThreads() {
  const contracts = [...state.availableContracts, ...state.activeContracts];
  contracts.forEach((contract) => {
    ensureMissionThread(contract);
  });
}

function missionInboxThreads() {
  const relevantIds = new Set([
    ...state.availableContracts.map((contract) => missionThreadIdForContract(contract)),
    ...state.activeContracts.map((contract) => missionThreadIdForContract(contract)),
    ...Object.values(state.missionThreads)
      .filter((thread) => (thread?.unread || 0) > 0)
      .map((thread) => thread.id),
    ...(state.activeMissionThreadId ? [state.activeMissionThreadId] : []),
  ]);
  return Array.from(relevantIds)
    .map((threadId) => state.missionThreads[threadId])
    .filter(Boolean)
    .sort((a, b) => (b.unread || 0) - (a.unread || 0) || a.contact.name.localeCompare(b.contact.name));
}

function setActiveMissionThread(threadId) {
  state.activeMissionThreadId = threadId;
  if (state.missionThreads[threadId]) {
    state.missionThreads[threadId].unread = 0;
  }
}

function missionResponseLabel(contract) {
  const contact = missionContactProfile(contract);
  const destination = SECTORS[contract.destinationId]?.name || "the next port";
  const responseVariant = (keySuffix, options, fallback = options[0] || "\"I'm listening.\"") => pickVariantForKey(
    `${contact.id}::${contract.id || contract.title || destination}::${contract.type || "misc"}::${keySuffix}`,
    options,
    fallback,
  );
  const byContact = {
    "independent-mara-kade": () => {
      if ((contract.tags || []).includes("Mara Thread")) return "\"All right, Mara. Put it on my deck and tell me who not to trust.\"";
      if (contract.type === "cargo") {
        return responseVariant("mara:cargo", [
          `"I'll move the freight to ${destination}. Quiet in, quiet out."`,
          `"Fine. I can get the cargo into ${destination} without the dock gossip learning my name."`,
          `"Put the freight on my deck. If it reaches ${destination} clean, we both keep smiling."`,
          `"I can float that load into ${destination}. Tell me which part of it bites if mishandled."`,
        ]);
      }
      if (contract.type === "courier") {
        return responseVariant("mara:courier", [
          `"I'll carry the packet to ${destination} and keep my mouth shut."`,
          `"I'll take the packet into ${destination}. If somebody asks, we were never interesting."`,
          `"Send the courier details. ${destination} gets the package, and the room gets less to talk about."`,
          `"I can hand it off in ${destination}. Keep the sender list off the page and we stay friends."`,
        ]);
      }
      if (contract.type === "smuggling") {
        return responseVariant("mara:smuggling", [
          `"Say the route once, quietly. If I take it to ${destination}, I don't want surprises at the dock."`,
          `"All right. Tell me how dirty this run gets before ${destination} starts pretending otherwise."`,
          `"I can slide it into ${destination}, but only if you give me the version without the perfume on it."`,
          `"If this job wants deniability, start with the checkpoint problem between here and ${destination}."`,
        ]);
      }
      if (contract.type === "bounty") {
        return responseVariant("mara:bounty", [
          `"Give me the face, the ship, and the reason. I'll decide how hard ${destination} needs to look away."`,
          `"If somebody needs a problem removed near ${destination}, start with what they did to earn the attention."`,
          `"All right, Mara. Who am I hunting, and who is paying to sound calm about it?"`,
          `"Put the target on the table. I'll decide whether ${destination} gets a cleaner skyline by morning."`,
        ]);
      }
      if (contract.type === "salvage") {
        return responseVariant("mara:salvage", [
          `"Tell me what is drifting and why it matters before every scavenger in ${destination} starts circling."`,
          `"If the hull is worth something, give me the coordinates and the lie wrapped around it."`,
          `"All right. Show me where the salvage sits and who thinks they already own it."`,
          `"I can check the drift for you. Start with why this wreck matters more than the usual ghosts."`,
        ]);
      }
      return responseVariant("mara:generic", [
        `"Give me the ${contract.title.toLowerCase()} angle. I'll see it through."`,
        `"Start with the part of ${contract.title.toLowerCase()} that is supposed to make me nervous."`,
        `"All right, Mara. Tell me why ${contract.title.toLowerCase()} is worth clearing my schedule for."`,
        `"Put the shape of ${contract.title.toLowerCase()} on the line and I'll tell you if it fits my deck."`,
      ]);
    },
    "union-juno-vale": () => {
      if ((contract.tags || []).includes("Juno Thread")) return `"Send the details. If people in ${destination} need it, I'm already moving."`;
      if (contract.type === "cargo") {
        return responseVariant("juno:cargo", [
          `"I'll run it to ${destination}. No delays, no excuses."`,
          `"Put the freight order through. If ${destination} needs it, I can move now."`,
          `"I can get that cargo into ${destination}. Keep the dock clear and I'll keep the promise."`,
          `"Send the manifest. ${destination} gets the load before somebody there starts counting shortages."`,
        ]);
      }
      if (contract.type === "courier") {
        return responseVariant("juno:courier", [
          `"I'll run it to ${destination}. No delays, no excuses."`,
          `"Packet run to ${destination} is fine. Give me the timing and I will make it stick."`,
          `"Send the courier details. If ${destination} is waiting, I won't be the reason it waits longer."`,
          `"I can carry the packet into ${destination}. Tell dispatch to stop worrying and start routing."`,
        ]);
      }
      if (contract.type === "bounty") {
        return responseVariant("juno:bounty", [
          `"Point me at the pressure point and I'll carry the work."`,
          `"Give me the hostile lane and the ship profile. I'll make space for the next convoy."`,
          `"If clearing ${destination} buys civilians breathing room, put me on it now."`,
          `"Tell me where the raiders are biting and I'll go make the lane usable again."`,
        ]);
      }
      if (contract.type === "salvage") {
        return responseVariant("juno:salvage", [
          `"Tell me what is stranded and whether survivors are part of the equation."`,
          `"If something is drifting off ${destination}, I want the rescue angle before the scrap value."`,
          `"Walk me through the salvage job and who gets hurt if nobody answers it."`,
          `"All right. Give me the wreck location and the urgency, not just the payout line."`,
        ]);
      }
      if (contract.type === "smuggling") {
        return responseVariant("juno:smuggling", [
          `"If you need this handled quietly, tell me who gets protected by the silence."`,
          `"Start with the reason this can't ride a lawful manifest into ${destination}."`,
          `"I hear you. Give me the real stakes before you ask me to shade the route."`,
          `"If discretion matters more than paperwork on this one, tell me why."`,
        ]);
      }
      return responseVariant("juno:generic", [
        `"Point me at the pressure point and I'll carry the work."`,
        `"Send the details. If this matters to ${destination}, I can move."`,
        `"Give me the real need, not the polished version, and I'll handle the route."`,
        `"Tell me what breaks if nobody takes ${contract.title.toLowerCase()}, and I'll decide from there."`,
      ]);
    },
    "salvage-dax-brindle": () => {
      if ((contract.tags || []).includes("Dax Thread")) return `"Talk me through the hull and tell me what part matters."`;
      if (contract.type === "salvage") {
        return responseVariant("dax:salvage", [
          `"I'll take the pull. Tell the crews to leave me something worth finding."`,
          `"Give me the drift, the damage, and the part everyone else is too scared to cut loose."`,
          `"All right. Mark the hull and keep the eager amateurs off it until I arrive."`,
          `"Show me the wreck and tell me what still matters inside it."`,
        ]);
      }
      if (contract.type === "cargo") {
        return responseVariant("dax:cargo", [
          `"Freight work from you always sounds like salvage with paperwork. Go on."`,
          `"If this cargo is really just metal with a deadline, tell me where it lands."`,
          `"All right, Dax. What's in the hold, and why does ${destination} care?"`,
          `"Give me the loadout. I want to know whether this is freight or a wreck waiting to happen."`,
        ]);
      }
      if (contract.type === "courier") {
        return responseVariant("dax:courier", [
          `"I can carry the packet, but you sound like the packet is the least interesting part."`,
          `"Fine. Hand me the courier job and tell me what piece of wreckage it points to."`,
          `"I'll move the message to ${destination}. Start with why you couldn't trust a cleaner deck."`,
          `"If this packet matters, talk me through the debris field around it."`,
        ]);
      }
      if (contract.type === "bounty") {
        return responseVariant("dax:bounty", [
          `"Who am I cracking open, and what do you think they'll spill when they do?"`,
          `"If this turns violent near ${destination}, tell me what survives the fight that you actually want."`,
          `"All right. Give me the target and the salvage value hidden behind the badge language."`,
          `"Point me at the ship. I'll worry about what falls out after."`,
        ]);
      }
      if (contract.type === "smuggling") {
        return responseVariant("dax:smuggling", [
          `"Say the quiet route slowly. I want to know which checkpoint thinks it's smarter than rust."`,
          `"If we're sneaking this into ${destination}, tell me what makes it worth the dented hull."`,
          `"Fine. Give me the route and the part that explodes if someone scans too deeply."`,
          `"I can run it quiet. Start with why this cargo couldn't survive daylight."`,
        ]);
      }
      return responseVariant("dax:generic", [
        `"All right, Dax. Show me where the metal gets interesting."`,
        `"Talk me through ${contract.title.toLowerCase()} like I'm already standing in the wreck."`,
        `"If ${contract.title.toLowerCase()} hides a good story under the plating, I'm listening."`,
        `"Give me the ugly version first. The pretty version never survives contact with salvage."`,
      ]);
    },
    "nightglass-vey-neral": () => {
      if ((contract.tags || []).includes("Faction Arc")) return "\"Fine. Start at the part you're willing to admit out loud.\"";
      if (contract.type === "smuggling") return `"I'll take the package to ${destination}. You can keep the names behind it."`;
      if (contract.type === "courier") {
        return responseVariant("vey:courier", [
          `"Send the packet details. I'll make sure ${destination} hears the quiet version first."`,
          `"All right. Give me the handoff for ${destination} and leave the decorative lies out of it."`,
          `"If this courier run reaches ${destination} clean, I assume somebody important sleeps better."`,
          `"Walk me through the packet, the timing, and why ${destination} suddenly matters."`,
        ]);
      }
      if (contract.type === "cargo") {
        return responseVariant("vey:cargo", [
          `"Freight to ${destination} is manageable. Tell me what part of the manifest wants deniability."`,
          `"I can move the cargo into ${destination}. Start with what is supposed to look ordinary."`,
          `"Give me the freight story for ${destination}, not the one you tell people with badges."`,
          `"If I'm carrying this load into ${destination}, I want the honest risk in one sentence."`,
        ]);
      }
      if (contract.type === "bounty") {
        return responseVariant("vey:bounty", [
          `"Interesting. Tell me who needs pressure applied near ${destination}, and why you prefer distance."`,
          `"Give me the target line for ${destination}. I assume subtlety is already off the table."`,
          `"If somebody needs removing around ${destination}, start with the part you're not saying."`,
          `"All right. Whose problem becomes mine if I take this into ${destination}?"`,
        ], `"All right. Whose problem becomes mine if I take this into ${destination}?"`);
      }
      return responseVariant("vey:generic", [
        "\"I'm listening. Give me the version that's safe to hear on an open line.\"",
        `"Start with the part that matters and end with why it points at ${destination}."`,
        `"Give me the quiet shape of it. I can fill in the dangerous parts on the way to ${destination}."`,
        "\"Talk like the room is listening and I will translate the rest from tone alone.\"",
      ], "\"I'm listening. Give me the version that's safe to hear on an open line.\"");
    },
    "core-ilya-sen": () => {
      if ((contract.tags || []).includes("Core Arc")) return `"Walk me through ${contract.title.toLowerCase()} and leave out the ornamental bureaucracy."`;
      return `"Send the manifest and the destination. I'll keep it clean into ${destination}."`;
    },
    "bounty-marshal-tovin": () => {
      if (contract.type === "bounty") return `"Give me the target and the lane. I'll handle it."`;
      return `"Understood. Point me at the problem."`;
    },
  };
  if (byContact[contact.id]) {
    return byContact[contact.id]();
  }
  if ((contract.tags || []).includes("Core Arc")) return `"Tell me about ${contract.title}."`;
  if ((contract.tags || []).includes("Faction Arc")) return `"I'm listening. Start with ${contract.title}."`;
  if (contract.type === "bounty") return `"Who needs ${contract.title.toLowerCase()} handled?"`;
  if (contract.type === "salvage") return `"Walk me through ${contract.title.toLowerCase()}."`;
  if (contract.type === "smuggling") return `"Say ${contract.title.toLowerCase()} quietly."`;
  return `"I can take ${contract.title.toLowerCase()}."`;
}

function missionChatMessages(contract = null) {
  const contact = missionContactProfile(contract);
  const messages = [
    { from: "them", text: contact.opener },
  ];

  if (!state.availableContracts.length) {
    messages.push({ from: "them", text: "The room is light on real work right now. Stay sharp and check back after traffic shifts." });
    return { contact, messages };
  }

  if (!contract) {
    const featured = state.availableContracts[0];
    messages.push({
      from: "them",
      text: `Right now the room is buzzing about ${featured.title}. ${featured.copy}`,
    });
    messages.push({
      from: "you",
      text: "Give me the shape of the room. I want the jobs that actually move the story forward.",
    });
    return { contact, messages };
  }

  messages.push({
    from: "them",
    text: `${contract.copy} Payout stands at ${formatCredits(contract.reward)} and the lane points toward ${SECTORS[contract.destinationId]?.name || "unknown space"}.`,
  });
  messages.push({
    from: "you",
    text: promptLabelText(missionResponseLabel(contract)),
  });
  if ((contract.tags || []).includes("Core Arc")) {
    messages.push({
      from: "them",
      text: "This is not just freight. People in the core are arguing about who still matters out here, and your ship keeps landing in the middle of that argument.",
    });
  } else if ((contract.tags || []).includes("Faction Arc")) {
    messages.push({
      from: "them",
      text: "Take it and someone important will remember your name. Maybe fondly. Maybe not.",
    });
  }
  return { contact, messages };
}

function missionThreadForCurrentSelection() {
  const threads = missionInboxThreads();
  if (!threads.length) return null;
  if (state.dockScreen === "contracts") {
    return threads[clamp(state.selectedMenuIndex, 0, threads.length - 1)] || threads[0];
  }
  const thread = state.missionThreads[state.activeMissionThreadId];
  return thread || null;
}

function missionThreadContractState(thread) {
  const active = state.activeContracts.filter((contract) => missionThreadIdForContract(contract) === thread.id);
  const available = state.availableContracts.filter((contract) => missionThreadIdForContract(contract) === thread.id);
  return { active, available };
}

function missionThreadFollowUpState(thread) {
  if (!thread) return null;
  const { active } = missionThreadContractState(thread);
  if (!active.length) return null;
  return {
    label: active.length === 1 ? "follow-up" : `${active.length} follow-ups`,
  };
}

function missionThreadRelationshipState(thread) {
  if (!thread) return null;
  if (thread.id === "independent-mara-kade") {
    if (state.contactArcs.mara.stage === "resolved") return { label: "inner room", warm: true };
    if (factionReputation("independent") >= 10) return { label: "warm broker", warm: true };
    if (factionReputation("independent") <= -6) return { label: "strained berth" };
  }
  if (thread.id === "union-juno-vale") {
    if (state.contactArcs.juno.stage === "resolved") return { label: "trusted dispatcher", warm: true };
    if (factionReputation("frontier") >= 10) return { label: "union favorite", warm: true };
    if (factionReputation("frontier") <= -6) return { label: "under review" };
  }
  if (thread.id === "salvage-dax-brindle") {
    if (state.contactArcs.dax.stage === "resolved") return { label: "proven diver", warm: true };
    if (factionReputation("independent") >= 8) return { label: "known scavenger", warm: true };
  }
  if (thread.id === "nightglass-vey-neral") {
    if (hasSectorPermit("nightglassTransit")) return { label: "inside line", warm: true };
    if (state.factionArc.path === "syndicate") return { label: "warm introduction", warm: true };
    if (factionReputation("syndicate") <= -6) return { label: "careful contact" };
  }
  if (thread.id === "core-ilya-sen") {
    if (state.coreArc.stage === "resolved") return { label: "registry known", warm: true };
    if (hasSectorPermit("coreTransit")) return { label: "cleared courier", warm: true };
    if (factionReputation("authority") <= -6) return { label: "flagged record" };
  }
  if (thread.id === "bounty-marshal-tovin") {
    if (factionReputation("authority") >= 10) return { label: "trusted asset", warm: true };
    if (factionReputation("authority") <= -8) return { label: "watched" };
  }
  return null;
}

function missionThreadStatusTags(thread) {
  if (!thread) return [];
  const { active, available } = missionThreadContractState(thread);
  const tags = [];
  if (thread.unread) {
    tags.push({ label: `${thread.unread} unread`, warm: true });
  }
  const relationship = missionThreadRelationshipState(thread);
  if (relationship) {
    tags.push(relationship);
  }
  if (active.length) {
    tags.push({ label: `${active.length} active job${active.length === 1 ? "" : "s"}` });
    const nextStop = SECTORS[active[0].destinationId]?.name;
    if (nextStop) tags.push({ label: `next stop ${nextStop}` });
  } else if (available.length) {
    tags.push({ label: `${available.length} lead${available.length === 1 ? "" : "s"}` });
    tags.push({ label: "awaiting reply", warm: true });
  } else {
    tags.push({ label: "thread cooling" });
  }
  return tags.slice(0, 4);
}

function resetThreadViewport(scrollToLatest = true) {
  state.threadScrollOffset = scrollToLatest ? Infinity : 0;
  state.threadScrollMax = 0;
}

function missionOfferBrief(thread) {
  if (!thread) return "The line is quiet for now.";
  const { active, available } = missionThreadContractState(thread);
  const latestVisible = visibleMissionThreadMessages(thread).slice(-1)[0];
  const firstName = thread.contact.name.split(" ")[0];
  const destinationName = (contract) => SECTORS[contract.destinationId]?.name || "the next port";
  const memory = contactMemoryFlavor(thread.id);
  const briefKeyRoot = [
    "offer",
    thread.id,
    active.map((contract) => contract.id).sort().join("|"),
    available.map((contract) => contract.id).sort().join("|"),
    latestVisible?.text || "",
    memory,
    state.intrigue.stage,
    state.intrigue.completed.join("|"),
  ].join("::");
  const cachedOffer = state.uiTextCache?.offer?.[thread.id];
  if (cachedOffer?.key === briefKeyRoot) {
    return cachedOffer.text;
  }
  const withMemory = (keySuffix, options) => {
    const line = pickVariantForKey(`${briefKeyRoot}::${keySuffix}`, options, "The line is quiet for now.");
    return memory && !line.includes(memory) ? `${line}${memory ? ` ${memory}` : ""}` : line;
  };
  const intrigueEcho = intrigueMemoryFlavor();
  const roleLead = {
    "independent-mara-kade": {
      active: (contract) => withMemory(`mara:active:${contract.id}`, [
        `Mara leans back like she already knows how this ends. Keep ${contract.title.toLowerCase()} moving into ${destinationName(contract)}, come back in one piece, and she will finally tell you why this run matters to her.`,
        `Mara is in that dangerous mood where she sounds relaxed. ${contract.title} still needs to move into ${destinationName(contract)}, and she expects you back before the room decides the story for her.`,
        `Mara has already written the ending in her head. Push ${contract.title.toLowerCase()} into ${destinationName(contract)} and return standing if you want to hear the part she has been saving.`,
        `Mara treats ${contract.title.toLowerCase()} like freight and fate in equal measure. Carry it into ${destinationName(contract)} and do not come back with a dramatic explanation.`,
      ]),
      quiet: () => withMemory("mara:quiet", [
        "Mara has gone quiet for the moment. That usually means she is listening to the room and waiting to see which captain comes back with their promises intact.",
        "Mara is off the line, but not disengaged. She is probably letting the berth gossip sort itself into something she can sell or survive.",
        "Mara has stopped talking for a minute. Around here that usually means she is taking the measure of everyone else's mistakes before choosing her next ask.",
        "No fresh push from Mara right now. She only goes this still when she is listening for which promise is about to break first.",
      ]),
      one: (contract) => withMemory(`mara:one:${contract.id}`, [
        `Mara keeps it simple: ${contract.copy} She makes it sound like freight, which is usually when it stops being just freight.`,
        `Mara only has one live angle for you right now: ${contract.copy} She is underselling it, which is how you know it matters.`,
        `Mara's current pitch is neat on purpose: ${contract.copy} If she is keeping the edges smooth, it usually means the real leverage is underneath.`,
        `Mara frames it like routine work: ${contract.copy} She does that whenever the cargo is only half the job.`,
      ]),
      many: (contracts) => withMemory(`mara:many:${contracts.map((contract) => contract.id).join("|")}`, [
        `Mara has a few angles open and all of them smell like leverage. Right now she is floating ${contracts.map((contract) => `${contract.title} through ${destinationName(contract)}`).join(", ")}. Pick the one that feels too clean, because that is probably the real story.`,
        `Mara has more than one thread moving: ${contracts.map((contract) => `${contract.title} through ${destinationName(contract)}`).join(", ")}. Whichever one looks safest is probably hiding the sharpest edge.`,
        `Mara's board is crowded in the way that means opportunity and liability arrived together. She is currently moving ${contracts.map((contract) => `${contract.title} toward ${destinationName(contract)}`).join(", ")}.`,
        `Mara has stacked several useful problems on the table: ${contracts.map((contract) => `${contract.title} via ${destinationName(contract)}`).join(", ")}. She wants to see which one you choose when nobody tells you the truth first.`,
      ]),
    },
    "union-juno-vale": {
      active: (contract) => withMemory(`juno:active:${contract.id}`, [
        `Juno is all clipped urgency right now. ${contract.title} needs to land in ${destinationName(contract)} before somebody on the union side has to explain another preventable loss.`,
        `Juno sounds like she has no spare oxygen for theatrics. ${contract.title} still needs to reach ${destinationName(contract)}, and she is counting delays in actual human cost.`,
        `Juno is pushing past polite now. ${contract.title} belongs in ${destinationName(contract)} before the people waiting there have to absorb another avoidable failure.`,
        `Juno is talking like the clock already ran out. Get ${contract.title.toLowerCase()} into ${destinationName(contract)} before dispatch has to explain why help stopped just short of the door.`,
      ]),
      quiet: () => withMemory("juno:quiet", [
        "Juno has stopped pinging for the moment. That usually means the clinic shelves are holding and the dispatch floor is too busy to waste words.",
        "Juno is quiet, which is the closest thing she gets to a break. Either the line is holding or she is too busy keeping it alive to write.",
        "No new pressure from Juno right now. That probably means things are merely strained instead of actively failing.",
        "Juno's thread is quiet for the moment. If she is not asking, it usually means she is triaging faster than she can type.",
      ]),
      one: (contract) => withMemory(`juno:one:${contract.id}`, [
        `Juno does not dress it up: ${contract.copy} In her voice, every delay already has a body count.`,
        `Juno keeps the brief brutally clean: ${contract.copy} She talks like everyone downstream is already waiting in the hall.`,
        `Juno's version leaves no room for romance: ${contract.copy} Even written down, it sounds like a stretcher being wheeled too fast.`,
        `Juno's update is all need and no decoration: ${contract.copy} She makes urgency feel like a physical weight.`,
      ]),
      many: (contracts) => withMemory(`juno:many:${contracts.map((contract) => contract.id).join("|")}`, [
        `Juno has stacked a few live needs on your screen: ${contracts.map((contract) => `${contract.title} to ${destinationName(contract)}`).join(", ")}. None of them are abstract to her, and she expects you to choose like you know that.`,
        `Juno has several live demands in motion: ${contracts.map((contract) => `${contract.title} into ${destinationName(contract)}`).join(", ")}. To her, every one of them already belongs to a real person.`,
        `Juno's board is crowded with things that should have moved yesterday: ${contracts.map((contract) => `${contract.title} toward ${destinationName(contract)}`).join(", ")}.`,
        `Juno has multiple urgent lanes open: ${contracts.map((contract) => `${contract.title} for ${destinationName(contract)}`).join(", ")}. She expects you to choose like you understand delay is not neutral.`,
      ]),
    },
    "salvage-dax-brindle": {
      active: (contract) => withMemory(`dax:active:${contract.id}`, [
        `Dax sounds almost cheerful, which is never comforting. Finish ${contract.title.toLowerCase()} around ${destinationName(contract)} and bring back the part that matters, not just the part that sells.`,
        `Dax has that bright scavenger tone again. ${contract.title} is still waiting near ${destinationName(contract)}, and he wants the truth out of it, not just the scrap value.`,
        `Dax is too upbeat for the subject. Close ${contract.title.toLowerCase()} around ${destinationName(contract)} and bring back the piece with a story in it.`,
        `Dax still wants ${contract.title.toLowerCase()} handled near ${destinationName(contract)}. He keeps pretending this is about salvage alone, which it never is.`,
      ]),
      quiet: () => withMemory("dax:quiet", [
        "Dax has nothing fresh for you right now. Either the wrecks are picked clean or he is waiting for the next hull to drift in looking expensive and unlucky.",
        "Dax is quiet for a minute. That usually means the metal is scarce, hidden, or already being fought over by people with worse manners.",
        "Nothing new from Dax just now. Either the scrape line is dry or he is letting someone else make the first dumb move.",
        "Dax has gone silent, which probably means he is watching a problem drift closer until it becomes profitable.",
      ]),
      one: (contract) => withMemory(`dax:one:${contract.id}`, [
        `Dax pitches it like a favor to the dead: ${contract.copy} Underneath that, you can hear him counting what the metal might still be hiding.`,
        `Dax sells this one like a respectful recovery: ${contract.copy} You can still hear the part of him already pricing the compartments.`,
        `Dax's pitch is half elegy, half inventory sheet: ${contract.copy} He wants whatever the hull kept secret after it stopped moving.`,
        `Dax gives you one clean wreck-side lead: ${contract.copy} He says it gently, which is never the same thing as kindly.`,
      ]),
      many: (contracts) => withMemory(`dax:many:${contracts.map((contract) => contract.id).join("|")}`, [
        `Dax has more than one wreck-side opportunity humming: ${contracts.map((contract) => `${contract.title} near ${destinationName(contract)}`).join(", ")}. To him, every hull is half salvage and half confession.`,
        `Dax has multiple scrape jobs on the board: ${contracts.map((contract) => `${contract.title} around ${destinationName(contract)}`).join(", ")}. He hears history rattling inside every busted frame.`,
        `Dax has a small choir of damaged opportunities going: ${contracts.map((contract) => `${contract.title} off ${destinationName(contract)}`).join(", ")}.`,
        `Dax is tracking several wreck-side angles at once: ${contracts.map((contract) => `${contract.title} near ${destinationName(contract)}`).join(", ")}. In his mind, ruined hulls are just testimony waiting to be opened.`,
      ]),
    },
    "nightglass-vey-neral": {
      active: (contract) => withMemory(`vey:active:${contract.id}`, [
        `Vey keeps the tone cool enough to fog the glass. ${contract.title} goes to ${destinationName(contract)}. Deliver it cleanly, do not ask who benefits, and they may keep speaking to you.`,
        `Vey is all polished restraint. ${contract.title} still moves toward ${destinationName(contract)}. Carry it without curiosity and everyone remains happier.`,
        `Vey writes like the message was ironed flat. ${contract.title} goes to ${destinationName(contract)}. The less you ask about its destination, the more future you probably have.`,
        `Vey sounds calm in the way people do when consequences are outsourced. ${contract.title} is still bound for ${destinationName(contract)}. Keep it invisible.`,
      ]),
      quiet: () => withMemory("vey:quiet", [
        "Vey has gone still on the line. With Nightglass, silence is rarely emptiness. It is usually inventory, judgment, or both.",
        "Vey is quiet for now. Nightglass silence usually means the work is being weighed, not forgotten.",
        "Nothing fresh from Vey. That sort of stillness never reads as comfort, only postponed consequence.",
        "Vey has left the thread cold for a moment. With Nightglass, that usually means someone is deciding what you are worth before speaking again.",
      ]),
      one: (contract) => withMemory(`vey:one:${contract.id}`, [
        `Vey frames it like an invitation you should probably fear: ${contract.copy} The wording is polite. The consequences almost certainly are not.`,
        `Vey makes this sound almost civilized: ${contract.copy} It reads like etiquette laid over a knife.`,
        `Vey's offer is phrased with immaculate manners: ${contract.copy} That usually means the danger has already been accounted for and assigned.`,
        `Vey sends one elegant little problem your way: ${contract.copy} The sentence structure is cleaner than the work will be.`,
      ]),
      many: (contracts) => withMemory(`vey:many:${contracts.map((contract) => contract.id).join("|")}`, [
        `Vey has several live offers in circulation: ${contracts.map((contract) => `${contract.title} toward ${destinationName(contract)}`).join(", ")}. None of them come with the whole truth, which is how Nightglass likes it.`,
        `Vey has more than one discreet opportunity open: ${contracts.map((contract) => `${contract.title} into ${destinationName(contract)}`).join(", ")}. The omissions are part of the design.`,
        `Vey is circulating a small set of tidy lies and useful errands: ${contracts.map((contract) => `${contract.title} via ${destinationName(contract)}`).join(", ")}.`,
        `Vey has several carefully incomplete offers waiting: ${contracts.map((contract) => `${contract.title} for ${destinationName(contract)}`).join(", ")}. Nightglass prefers clients who can work without being comforted.`,
      ]),
    },
    "core-ilya-sen": {
      active: (contract) => withMemory(`ilya:active:${contract.id}`, [
        `Ilya writes like he is filing you into a system while he talks. ${contract.title} is pointed at ${destinationName(contract)}, and he expects it handled cleanly enough to survive an archive review.`,
        `Ilya is still treating ${contract.title.toLowerCase()} like a document with engines attached. Deliver it into ${destinationName(contract)} without creating a paperwork weather event.`,
        `Ilya's tone suggests he is already imagining the after-action filing. ${contract.title} remains active for ${destinationName(contract)}. Please avoid becoming an appendix.`,
        `Ilya continues to speak in administrative pressure. ${contract.title} still routes through ${destinationName(contract)}, and he would prefer the record remain boring.`,
      ]),
      quiet: () => withMemory("ilya:quiet", [
        "Ilya has nothing fresh in the queue. Either the registry is satisfied for once, or he is arranging a problem that will arrive with paperwork attached.",
        "Ilya's line is quiet for now. That likely means the bureaucracy is between crises, not free of them.",
        "No new formal requests from Ilya. Somewhere, a stack of documents is probably trying to become your problem.",
        "Ilya has stopped writing for the moment. The registry is either content or preparing something more elaborate than a simple inconvenience.",
      ]),
      one: (contract) => withMemory(`ilya:one:${contract.id}`, [
        `Ilya's update reads like a memo with a pulse: ${contract.copy} Somewhere inside the phrasing, the core is trying to decide whether you are useful or dangerous.`,
        `Ilya has exactly one clean request at the moment: ${contract.copy} It sounds administrative until you notice how carefully every word was chosen.`,
        `Ilya's brief is all format and implication: ${contract.copy} The core never admits uncertainty out loud, but it leaks through the punctuation.`,
        `Ilya sends one registry-grade errand your way: ${contract.copy} It reads like a form letter that learned to judge people.`,
      ]),
      many: (contracts) => withMemory(`ilya:many:${contracts.map((contract) => contract.id).join("|")}`, [
        `Ilya has multiple clerical emergencies masquerading as options: ${contracts.map((contract) => `${contract.title} for ${destinationName(contract)}`).join(", ")}. Pick one and the paperwork will pretend it was inevitable.`,
        `Ilya's queue currently contains several polished administrative disasters: ${contracts.map((contract) => `${contract.title} to ${destinationName(contract)}`).join(", ")}.`,
        `Ilya has more than one tidy problem available: ${contracts.map((contract) => `${contract.title} through ${destinationName(contract)}`).join(", ")}. The forms are calm even when the lane is not.`,
        `Ilya presents several options as though they emerged from process rather than panic: ${contracts.map((contract) => `${contract.title} for ${destinationName(contract)}`).join(", ")}.`,
      ]),
    },
    "bounty-marshal-tovin": {
      active: (contract) => withMemory(`tovin:active:${contract.id}`, [
        `Tovin does not waste syllables. ${contract.title} is still open around ${destinationName(contract)}. He expects results, not stories.`,
        `Tovin is still on the same point: ${contract.title} remains active near ${destinationName(contract)}. He did not contact you for a conversation.`,
        `Tovin's message is as spare as ever. ${contract.title} stays open around ${destinationName(contract)}. Finish it before he has to repeat himself.`,
        `Tovin does not believe in decorative phrasing. ${contract.title} still needs closing near ${destinationName(contract)}. Go solve it.`,
      ]),
      quiet: () => withMemory("tovin:quiet", [
        "Tovin has gone quiet. Either the lane is behaving for once or someone else is currently disappointing him at close range.",
        "No fresh bark from Tovin right now. Either traffic improved or he found a different idiot to glare at.",
        "Tovin's thread is still. That probably means the lane is briefly tolerable or he is busy making someone else miserable in person.",
        "Tovin is quiet for the moment. Do not assume this reflects optimism.",
      ]),
      one: (contract) => withMemory(`tovin:one:${contract.id}`, [
        `Tovin's version is blunt enough to bruise: ${contract.copy} In his mind the problem already has a shape, and your ship is the tool for correcting it.`,
        `Tovin gives you one targetable problem: ${contract.copy} He has already skipped past the part where anyone pretends this is negotiable.`,
        `Tovin's briefing is one hard edge after another: ${contract.copy} He thinks clarity is a courtesy and softness is a waste.`,
        `Tovin only has one live ask right now: ${contract.copy} He has already decided the problem deserves less discussion and more thrust.`,
      ]),
      many: (contracts) => withMemory(`tovin:many:${contracts.map((contract) => contract.id).join("|")}`, [
        `Tovin has a few trouble spots marked in red: ${contracts.map((contract) => `${contract.title} near ${destinationName(contract)}`).join(", ")}. He would prefer you stop asking which one and simply start solving one.`,
        `Tovin currently has several open headaches: ${contracts.map((contract) => `${contract.title} around ${destinationName(contract)}`).join(", ")}. He considers the distinction between them your problem.`,
        `Tovin's board has multiple active messes: ${contracts.map((contract) => `${contract.title} near ${destinationName(contract)}`).join(", ")}.`,
        `Tovin has flagged several things he wants gone, finished, or silenced: ${contracts.map((contract) => `${contract.title} by ${destinationName(contract)}`).join(", ")}.`,
      ]),
    },
  };
  const voice = roleLead[thread.id] || {
    active: (contract) => withMemory(`default:active:${contract.id}`, [
      `${firstName} is waiting on ${contract.title.toLowerCase()} into ${destinationName(contract)}. Finish the run and the conversation moves.`,
      `${firstName} still needs ${contract.title.toLowerCase()} handled in ${destinationName(contract)}. Close it and the thread opens up.`,
      `${firstName} has one active concern: ${contract.title.toLowerCase()} into ${destinationName(contract)}. Finish that and the rest of the conversation changes.`,
    ]),
    quiet: () => withMemory("default:quiet", [
      `${firstName} does not have anything fresh on the table right now, but the thread stays warm if traffic shifts.`,
      `${firstName} is quiet for the moment. That usually means the next useful problem has not surfaced yet.`,
      `Nothing new from ${firstName} right now, but the line is still alive.`,
    ]),
    one: (contract) => withMemory(`default:one:${contract.id}`, [
      `${firstName} has one clean lead right now: ${contract.copy}`,
      `${firstName} is only pushing one angle at the moment: ${contract.copy}`,
      `${firstName}'s current lead is straightforward on paper: ${contract.copy}`,
    ]),
    many: (contracts) => withMemory(`default:many:${contracts.map((contract) => contract.id).join("|")}`, [
      `${firstName} has a few live angles at this port: ${contracts.map((contract) => `${contract.title} for ${destinationName(contract)}`).join(", ")}. Pick the thread you want to pull.`,
      `${firstName} has several open leads right now: ${contracts.map((contract) => `${contract.title} toward ${destinationName(contract)}`).join(", ")}.`,
      `${firstName} is juggling more than one useful problem: ${contracts.map((contract) => `${contract.title} via ${destinationName(contract)}`).join(", ")}.`,
    ]),
  };
  let result = "";
  if (active.length) {
    result = voice.active(active[0]);
  } else if (!available.length) {
    result = latestVisible?.from === "them" && latestVisible.text.includes("Reward transferred:")
      ? latestVisible.text
      : voice.quiet();
  } else if (available.length === 1) {
    const line = voice.one(available[0]);
    result = (available[0].tags || []).includes("Mystery") && intrigueEcho ? `${line} ${intrigueEcho}` : line;
  } else {
    const line = voice.many(available.slice(0, 3));
    result = available.some((contract) => (contract.tags || []).includes("Mystery")) && intrigueEcho ? `${line} ${intrigueEcho}` : line;
  }
  if (state.uiTextCache?.offer) {
    state.uiTextCache.offer[thread.id] = { key: briefKeyRoot, text: result };
  }
  return result;
}

function missionInboxPreview(thread) {
  if (!thread) return "No traffic yet.";
  const { active, available } = missionThreadContractState(thread);
  const latest = visibleMissionThreadMessages(thread).slice(-1)[0]?.text || thread.contact.opener;
  const destinationName = (contract) => SECTORS[contract.destinationId]?.name || "the next port";
  const intrigueEcho = intrigueMemoryFlavor();
  const previewKeyRoot = [
    "preview",
    thread.id,
    active.map((contract) => contract.id).sort().join("|"),
    available.map((contract) => contract.id).sort().join("|"),
    latest,
    state.intrigue.stage,
    state.intrigue.completed.join("|"),
  ].join("::");
  const cachedPreview = state.uiTextCache?.preview?.[thread.id];
  if (cachedPreview?.key === previewKeyRoot) {
    return cachedPreview.text;
  }
  const previewLine = (keySuffix, options, fallback = latest) => pickVariantForKey(`${previewKeyRoot}::${keySuffix}`, options, fallback);
  const previewByContact = {
    "independent-mara-kade": () => {
      if (active.length) return previewLine(`mara:active:${active[0].id}`, [
        `Still waiting on ${active[0].title.toLowerCase()} into ${destinationName(active[0])}. Don't make me come looking for my freight.`,
        `${active[0].title} still belongs in ${destinationName(active[0])}. I would rather not hear excuses before cargo.`,
        `${active[0].title} is still live into ${destinationName(active[0])}. Finish the run before the room starts freelancing the story.`,
      ]);
      if (available.length) return available.length === 1
        ? previewLine(`mara:one:${available[0].id}`, [
          `Got something for you. ${available[0].title} runs through ${destinationName(available[0])}, and it smells too clean.`,
          `One angle just opened: ${available[0].title} through ${destinationName(available[0])}. It looks tidy, which is suspicious.`,
          `I've got one live run for you. ${available[0].title} heads into ${destinationName(available[0])}, and I don't trust how easy it sounds.`,
        ])
        : previewLine(`mara:many:${available.map((contract) => contract.id).join("|")}`, [
          "I've got a few ways to make you useful. Pick a run and sit down before somebody else does.",
          "More than one angle is open. Read the board and choose which kind of trouble you want to carry.",
          "A few opportunities just got loose at once. Open the thread before somebody less capable volunteers.",
        ]);
      return previewLine("mara:quiet", [
        "Room's gone quiet for a minute. That never lasts here.",
        "The berth is briefly pretending to be calm.",
        "Nothing new for a minute. Grey Exchange rarely holds that pose for long.",
      ]);
    },
    "union-juno-vale": () => {
      if (active.length) return previewLine(`juno:active:${active[0].id}`, [
        `${active[0].title} still needs to reach ${destinationName(active[0])}. People are waiting on the other end.`,
        `${active[0].title} is still outstanding for ${destinationName(active[0])}. Someone there needs it, not eventually but soon.`,
        `${active[0].title} still has to land in ${destinationName(active[0])}. This is not paperwork to the people waiting.`,
      ]);
      if (available.length) return available.length === 1
        ? previewLine(`juno:one:${available[0].id}`, [
          `Need eyes on ${available[0].title.toLowerCase()} into ${destinationName(available[0])}. This one matters.`,
          `One live need just opened: ${available[0].title} to ${destinationName(available[0])}. I would not ping if it could wait.`,
          `I need a real captain on ${available[0].title.toLowerCase()} into ${destinationName(available[0])}. Open this if you're moving.`,
        ])
        : previewLine(`juno:many:${available.map((contract) => contract.id).join("|")}`, [
          "I have multiple live needs and none of them can sit. Open this when you're ready to move.",
          "Several things just crossed from urgent into immediate. Open the thread if you're actually available.",
          "More than one run needs attention now. Read the board and pick what you can finish.",
        ]);
      return previewLine("juno:quiet", [
        "Dispatch floor is holding for now. I'll ping when the lane goes thin again.",
        "Things are stable for a minute. I'm not wasting that by pretending it's permanent.",
        "No fresh dispatch pain at this exact second. Enjoy the rarity.",
      ]);
    },
    "salvage-dax-brindle": () => {
      if (active.length) return `${active[0].title} is still drifting out near ${destinationName(active[0])}. Bring me the part worth talking about.`;
      if (available.length) return available.length === 1
        ? `Found a hull-side opportunity near ${destinationName(available[0])}. Might even still have secrets in it.`
        : `A few wreck-side jobs just floated in. One of them has your name all over it.`;
      return "Nothing fresh on the scrape line. Either the metal is hiding or someone beat us to it.";
    },
    "nightglass-vey-neral": () => {
      if (active.length) return previewLine(`vey:active:${active[0].id}`, [
        `${active[0].title} remains in motion toward ${destinationName(active[0])}. Be discreet and we stay on speaking terms.`,
        `${active[0].title} is still live into ${destinationName(active[0])}. Keep it quiet and everyone keeps their options.`,
        `${active[0].title} continues toward ${destinationName(active[0])}. Discretion remains part of the cargo.`,
      ]);
      if (available.length) return available.length === 1
        ? previewLine(`vey:one:${available[0].id}`, [
          `A quiet offer is waiting. ${available[0].title} goes to ${destinationName(available[0])}. Read this privately.`,
          `One discreet opportunity just opened: ${available[0].title} into ${destinationName(available[0])}. Privacy would be wise.`,
          `I have one careful offer for you. ${available[0].title} routes through ${destinationName(available[0])}. Do not read this aloud.`,
        ])
        : previewLine(`vey:many:${available.map((contract) => contract.id).join("|")}`, [
          "Several delicate opportunities are open. I trust you to understand why that message is not detailed.",
          "Multiple quiet options are now available. Their lack of detail is intentional.",
          "A few Nightglass opportunities just surfaced. If you need everything explained, they are not for you.",
        ]);
      return previewLine("vey:quiet", [
        "No new Nightglass traffic. Enjoy the silence while it still means safety.",
        "Nightglass is quiet for a minute. That should not reassure you.",
        "No fresh syndicate traffic. Silence still counts as a kind of weather here.",
      ]);
    },
    "core-ilya-sen": () => {
      if (active.length) return `${active[0].title} is still pending for ${destinationName(active[0])}. Keep the manifest cleaner than your reputation.`;
      if (available.length) return available.length === 1
        ? `There is one formal request waiting in queue: ${available[0].title} for ${destinationName(available[0])}.`
        : `Several registry-grade opportunities require review. Choose one and try not to improvise.`;
      return "Your file is quiet for the moment. I assure you that is temporary.";
    },
    "bounty-marshal-tovin": () => {
      if (active.length) return previewLine(`tovin:active:${active[0].id}`, [
        `${active[0].title} is still open near ${destinationName(active[0])}. Finish it.`,
        `${active[0].title} remains active around ${destinationName(active[0])}. Close it.`,
        `${active[0].title} is still unresolved near ${destinationName(active[0])}. Correct that.`,
      ]);
      if (available.length) return available.length === 1
        ? previewLine(`tovin:one:${available[0].id}`, [
          `One targetable problem just lit up near ${destinationName(available[0])}.`,
          `A fresh problem surfaced near ${destinationName(available[0])}.`,
          `One solvable mess just appeared by ${destinationName(available[0])}.`,
        ])
        : previewLine(`tovin:many:${available.map((contract) => contract.id).join("|")}`, [
          "Multiple problems. Limited patience. Open this if you intend to be useful.",
          "Several issues. Same low tolerance. Open the thread or stay out of the way.",
          "More than one mess needs solving. Pick one and stop admiring the list.",
        ]);
      return previewLine("tovin:quiet", [
        "The lane is briefly less stupid than usual. Don't get attached.",
        "Traffic is almost tolerable for a minute.",
        "The lane has achieved a temporary and suspicious level of competence.",
      ]);
    },
  };
  if (!active.length && !available.length && latest.includes("Reward transferred:")) {
    return latest;
  }
  const specific = previewByContact[thread.id];
  let result = latest.length > 88 ? `${latest.slice(0, 85)}...` : latest;
  if (specific) {
    const line = specific();
    result = available.some((contract) => (contract.tags || []).includes("Mystery")) && intrigueEcho
      ? `${line} ${intrigueEcho}`
      : line;
  }
  if (state.uiTextCache?.preview) {
    state.uiTextCache.preview[thread.id] = { key: previewKeyRoot, text: result };
  }
  return result;
}

function contactMemoryFlavor(threadId) {
  if (threadId === "independent-mara-kade") {
    if (state.contactArcs.mara.stage === "resolved") return "She is not talking to you like a stranger anymore, and the whole berth can hear it.";
    if (state.contactArcs.mara.completed.includes("mara-dockside-whisper")) return "She still remembers that you carried her whisper back home without opening it.";
    if (state.contactArcs.mara.completed.includes("mara-quiet-haul")) return "You already proved you could keep one of her runs clean, which buys you more than credits in this room.";
  }
  if (threadId === "union-juno-vale") {
    if (state.contactArcs.juno.stage === "resolved") return "She trusts you now the way dispatchers only trust captains who have actually saved people.";
    if (state.contactArcs.juno.completed.includes("juno-convoy-proof")) return "She has not forgotten that you brought her proof instead of excuses.";
    if (state.contactArcs.juno.completed.includes("juno-relief-drop")) return "The clinic run still sits in her voice every time she talks to you.";
  }
  if (threadId === "salvage-dax-brindle") {
    if (state.contactArcs.dax.stage === "resolved") return "Dax talks to you like someone who has already seen what you bring back when the hull is ugly.";
    if (state.contactArcs.dax.completed.includes("dax-ledger-fragment")) return "He knows you can spot the difference between scrap value and real history now.";
    if (state.contactArcs.dax.completed.includes("dax-cinder-sweep")) return "You already came back from one bad pull with the right prize, and he clearly noticed.";
  }
  if (threadId === "nightglass-vey-neral") {
    if (hasSectorPermit("nightglassTransit")) return "The fact that you still hold a Nightglass transit key changes how carefully Vey chooses each word.";
    if (state.factionArc.path === "syndicate" && state.factionArc.stage === "resolved") return "Nightglass has you marked as more than a casual courier now, and Vey is careful not to sound impressed.";
    if (state.factionArc.path === "syndicate") return "You took one step into Vey's world already, and neither of you gets to pretend otherwise.";
  }
  if (threadId === "core-ilya-sen") {
    if (state.coreArc.stage === "resolved") return "The core has your name on file now, which means Ilya can no longer write you off as frontier noise.";
    if (state.coreArc.completed.includes("core-arc-centauri-relay")) return "He knows you carried the relay chain farther than most licensed couriers would have bothered.";
    if (hasSectorPermit("coreTransit")) return "Getting cleared into the core did more for his opinion of you than he would ever admit.";
  }
  if (threadId === "bounty-marshal-tovin") {
    if (factionReputation("authority") >= 10) return "Tovin's tone says you have stopped being random traffic and started looking like a dependable asset.";
    if (factionReputation("authority") <= -8) return "He remembers every time you made authority work harder than it needed to be.";
  }
  if (threadId === "independent-mara-kade" && hasCompletedContract("mystery-relief-freight")) {
    return "She keeps talking like that relief run touched a ledger bigger than the cargo itself.";
  }
  if (threadId === "union-juno-vale" && hasCompletedContract("mystery-relief-freight")) {
    return "Juno has not stopped sounding irritated that a so-called relief shipment arrived with political fingerprints all over it.";
  }
  if (threadId === "nightglass-vey-neral" && hasCompletedContract("mystery-manifest-anomaly")) {
    return "Vey clearly thinks the forged paperwork was not a forgery so much as an introduction.";
  }
  if (threadId === "core-ilya-sen" && hasCompletedContract("mystery-manifest-anomaly")) {
    return "Ilya has become extremely interested in who was able to make a routine registry correction appear before anyone admitted the error.";
  }
  if (threadId === "salvage-dax-brindle" && hasCompletedContract("mystery-escort-trace")) {
    return "Dax keeps treating Saint Radiant like a wreck with witnesses rather than a ship that merely went missing.";
  }
  return "";
}

function intrigueCrossTalkForContract(contract) {
  const destination = SECTORS[contract.destinationId]?.name || "the next port";
  if (contract.id === "mystery-relief-freight") {
    return [
      {
        threadId: "nightglass-vey-neral",
        text: `Relief freight is such a useful phrase. Half the time it means medicine. The other half it means someone wants leverage to arrive wearing a compassionate face. Your ${destination} handoff smelled like the second kind.`,
      },
      {
        threadId: "core-ilya-sen",
        text: `For the record, the ${destination} shipment was filed as routine civic relief. The speed with which that classification appeared is mildly interesting in a way I dislike.`,
      },
      {
        threadId: "union-juno-vale",
        text: `If anyone starts calling that ${destination} run routine relief, they're laundering the story. Real relief jobs do not arrive with pre-cleared signatures and people already waiting in pressed coats.`,
      },
    ];
  }
  if (contract.id === "mystery-manifest-anomaly") {
    return [
      {
        threadId: "independent-mara-kade",
        text: `Funny thing about forged manifests: the dangerous ones are not the sloppy ones. The dangerous ones look so routine everybody downstream agrees to remember them that way.`,
      },
      {
        threadId: "nightglass-vey-neral",
        text: `The Authority will call that addendum fraudulent because it arrived early. I would call it well sponsored. Timing like that usually means someone on both sides already agreed what the truth would be.`,
      },
      {
        threadId: "union-juno-vale",
        text: `That paperwork hit the board before the people harmed by it even got asked. That is not clerical drift. That is somebody building policy out of a lie while the dock is still busy unloading.`,
      },
    ];
  }
  if (contract.id === "mystery-escort-trace") {
    return [
      {
        threadId: "core-ilya-sen",
        text: `Saint Radiant should exist in three registries, two insurance bundles, and one convoy memorial index. At present it exists in fragments and denials, which is administratively impossible and therefore politically real.`,
      },
      {
        threadId: "nightglass-vey-neral",
        text: `Ships do not vanish cleanly unless several institutions are paid to remember less than they know. Saint Radiant keeps surfacing because somebody important failed to buy every witness.`,
      },
      {
        threadId: "salvage-dax-brindle",
        text: `The metal says escort hull. The paperwork says clerical loss. The people who say clerical loss usually have softer hands than the people who welded the thing.`,
      },
    ];
  }
  if (contract.id === "mystery-ninth-berth") {
    return [
      {
        threadId: "independent-mara-kade",
        text: `If somebody says Ninth Berth like it is a place instead of a rumor, pay attention. Rooms only get spoken that carefully when too many factions still owe them money.`,
      },
      {
        threadId: "nightglass-vey-neral",
        text: `Ninth Berth is not a station. It is an agreement people retreat into when official maps become inconvenient. If you heard the name twice, you are already closer than most captains get.`,
      },
      {
        threadId: "core-ilya-sen",
        text: `There is no licensed facility by that designation. There are, however, several sealed references to logistics activity that required unlicensed customs treatment. I dislike that sentence more every time I read it.`,
      },
    ];
  }
  return [];
}

function appendIntrigueCrossTalk(contract) {
  for (const entry of intrigueCrossTalkForContract(contract)) {
    if (!state.missionThreads[entry.threadId] && CONTACT_ARCHIVE[entry.threadId]) {
      const archive = CONTACT_ARCHIVE[entry.threadId];
      state.missionThreads[entry.threadId] = {
        id: entry.threadId,
        contact: {
          id: entry.threadId,
          name: archive.title,
          role: archive.role,
          color: entry.threadId === "nightglass-vey-neral"
            ? "#f0afd2"
            : entry.threadId === "core-ilya-sen"
              ? "#c8d8ff"
              : entry.threadId === "union-juno-vale"
                ? "#9ef59f"
                : entry.threadId === "salvage-dax-brindle"
                  ? "#ffcf74"
                  : "#79d8ff",
          portrait: archive.portrait,
          initials: archive.title.split(" ").map((part) => part[0]).join("").slice(0, 2),
          opener: archive.copy,
        },
        messages: [{ from: "them", text: archive.copy, contractId: null }],
        unread: 0,
      };
    }
    appendMissionThreadMessage(entry.threadId, {
      from: "them",
      text: entry.text,
      contractId: contract.id,
    }, { unread: true });
  }
}

function contractsForThread(threadId) {
  return {
    active: state.activeContracts.filter((contract) => missionThreadIdForContract(contract) === threadId),
    available: state.availableContracts.filter((contract) => missionThreadIdForContract(contract) === threadId),
  };
}

function arrivalPingForThread(thread, sectorId) {
  if (!thread) return null;
  const { active, available } = contractsForThread(thread.id);
  const relevantActive = active.filter((contract) => contract.destinationId === sectorId);
  const relevantAvailable = available.filter((contract) => contract.destinationId === sectorId);
  if (!relevantActive.length && !relevantAvailable.length) return null;

  const relevantContracts = [...relevantActive, ...relevantAvailable];
  const signature = `${sectorId}:${relevantActive.map((contract) => contract.id).sort().join("|")}::${relevantAvailable.map((contract) => contract.id).sort().join("|")}`;
  if (state.arrivalThreadPings[thread.id] === signature) {
    return null;
  }

  const contract = relevantContracts[0];
  const sectorName = SECTORS[sectorId]?.name || "this port";
  const trustByThread = {
    "independent-mara-kade": factionReputation("independent"),
    "union-juno-vale": factionReputation("frontier"),
    "salvage-dax-brindle": Math.round((factionReputation("independent") + factionReputation("pirate")) * 0.5),
    "nightglass-vey-neral": factionReputation("syndicate"),
    "core-ilya-sen": factionReputation("authority"),
    "bounty-marshal-tovin": factionReputation("authority"),
  };
  const trust = trustByThread[thread.id] ?? 0;
  const warm = trust >= 8;
  const cold = trust <= -4;
  const desperate = trust <= -10;
  const memory = contactMemoryFlavor(thread.id);
  const withMemory = (options, fallback) => {
    const line = pickVariant(options, fallback);
    return memory && !line.includes(memory) ? `${line} ${memory}` : line;
  };
  const contactVoices = {
    "independent-mara-kade": relevantActive.length
      ? warm
        ? pickVariant([
          `You made it to ${sectorName}. Good. ${contract.title} is still the job, and I know better than to waste a good captain once they've proven themselves.`,
          `You're in ${sectorName}. Good. ${contract.title} is still live, and at this point I'd rather trust you than retrain somebody worse.`,
          `You reached ${sectorName}. Good. ${contract.title} still matters there, and you've done enough that I'm not eager to replace you.`,
        ])
        : cold
          ? pickVariant([
            `You're in ${sectorName} now. Fine. ${contract.title} is still live, but don't mistake location for trust. Bring it home clean.`,
            `You're on-site in ${sectorName}. Good. ${contract.title} still needs closing, and arrival is not the same thing as reliability.`,
            `So you reached ${sectorName}. ${contract.title} remains live. Try not to confuse proximity with redemption.`,
          ])
          : pickVariant([
            `You made it to ${sectorName}. Good. ${contract.title} is still the job, but the room will be listening harder now that you're on-site.`,
            `You're in ${sectorName}. Good. ${contract.title} still matters, and being local means more people will remember how you handle it.`,
            `Good. ${sectorName} puts you close enough that ${contract.title.toLowerCase()} just became everybody's business.`,
          ])
      : warm
        ? pickVariant([
          `Since you're in ${sectorName}, I've opened a better angle for you. Read the board under my name and pick the one worth your fuel.`,
          `${sectorName} gives me room to offer you something better. Open the thread and take the run that deserves your tank.`,
          `Now that you're in ${sectorName}, I can hand you a cleaner angle. Check my board and choose well.`,
        ])
        : desperate
          ? pickVariant([
            `You're in ${sectorName}, and I need somebody to come through for Grey Exchange before the dock starts eating itself. Open the thread.`,
            `${sectorName} just made this urgent. Open the thread if you're willing to keep Grey Exchange from coming apart in public.`,
            `You're in the right place at the wrong moment. Open the thread before this turns into a dockside autopsy.`,
          ])
          : withMemory([
            `Since you're in ${sectorName}, one of my open angles just got real. Read the board under my name and choose how much trouble you want to carry.`,
            `${sectorName} just turned one of my pending angles into a real option. Open the thread and decide how brave you're feeling.`,
            `Your arrival in ${sectorName} made one of my jobs worth offering properly. Open the board and pick your flavor of trouble.`,
          ], `Since you're in ${sectorName}, one of my open angles just got real.`),
    "union-juno-vale": relevantActive.length
      ? warm
        ? pickVariant([
          `You are in ${sectorName}. Good. I knew if somebody on this list would actually close ${contract.title.toLowerCase()}, it would be you.`,
          `Good. You're in ${sectorName}. ${contract.title} is still live, and I trust you with it more than most of my official options.`,
          `You made it to ${sectorName}. Good. ${contract.title} still needs finishing, and you're the reason I'm not panicking louder.`,
        ])
        : desperate
          ? pickVariant([
            `You're in ${sectorName}. Good. Do not drift and do not make me beg twice. ${contract.title} is brushing up against real people now.`,
            `You're in ${sectorName}. Good. Stay focused. ${contract.title} is close enough to hurt people directly now.`,
            `Good. ${sectorName} puts you close to the damage. Finish ${contract.title.toLowerCase()} before this gets uglier.`,
          ])
          : pickVariant([
            `You are in ${sectorName} now. Good. Do not drift. People tied to ${contract.title.toLowerCase()} need that handled before the dock turns into another excuse.`,
            `You're in ${sectorName}. Good. ${contract.title} has moved from abstract problem to immediate one, so don't wander.`,
            `${sectorName} means you're finally close enough to matter. Close ${contract.title.toLowerCase()} before someone else pays for the delay.`,
          ])
      : warm
        ? pickVariant([
          `Since you reached ${sectorName}, one of my pending jobs just became workable. Open the thread. I'd rather hand it to someone I trust.`,
          `${sectorName} just made one of my waiting jobs possible. Open the thread and take it before I have to settle.`,
          `Now that you're in ${sectorName}, one of my held jobs can finally move. I'd rather it go to you.`,
        ])
        : cold
          ? pickVariant([
            `You're in ${sectorName}, so one of my jobs just turned relevant. Open the thread if you're ready to prove you're more reliable than your paperwork looks.`,
            `${sectorName} makes one of my jobs your problem, if you're serious about improving your file.`,
            `Now that you're in ${sectorName}, I have work that fits your position better than your reputation. Open the thread.`,
          ])
          : withMemory([
            `You're in ${sectorName}, which means one of my pending jobs just moved from paperwork to urgency. Open the thread and pick the run you can actually finish.`,
            `${sectorName} just converted one of my pending requests into live work. Open the thread and choose something you can really close.`,
            `Your arrival in ${sectorName} moved one of my quieter needs into active territory. Open the board and commit to something real.`,
          ], `You're in ${sectorName}, which means one of my pending jobs just moved from paperwork to urgency.`),
    "salvage-dax-brindle": relevantActive.length
      ? warm
        ? `${sectorName}, huh? Good. ${contract.title} should smell different up close, and I trust you to know which part is worth bringing back.`
        : cold
          ? `${sectorName}. Fine. ${contract.title} is still there if you can keep from turning yourself into more scrap.`
          : `${sectorName}, huh? Good. ${contract.title} should smell different up close. Bring back the piece that tells the story, not just the piece that sells.`
      : warm
        ? `You're in ${sectorName}, which puts you near a hull I'd rather you touch before anybody dumber does. Thread has the details.`
        : `You're in ${sectorName}, which puts you close to something worth pulling apart. I left the details in the thread if you're in the mood for honest scrap.${memory ? ` ${memory}` : ""}`,
    "nightglass-vey-neral": relevantActive.length
      ? warm
        ? `Now that you are in ${sectorName}, discretion matters more than speed. ${contract.title} is still live, and unlike most people, you have not made me regret the introduction.`
        : cold
          ? `You are in ${sectorName}. ${contract.title} remains live. Do try not to embarrass me now that I have risked speaking to you.`
          : `Now that you are in ${sectorName}, discretion matters more than speed. ${contract.title} is still live. Try not to make me regret the introduction.`
      : warm
        ? `${sectorName} opens certain doors. I have something there for you, specifically, which should tell you enough about how this relationship is going.`
        : desperate
          ? `${sectorName} just made a few ugly options time-sensitive. Open the thread somewhere private and do not forward it to anyone with a conscience.`
          : `${sectorName} opens certain doors. I have options waiting there for you, but I would prefer you read them somewhere private.${memory ? ` ${memory}` : ""}`,
    "core-ilya-sen": relevantActive.length
      ? warm
        ? `Registry notes your arrival in ${sectorName}. ${contract.title} remains active. Given your recent record, I am cautiously optimistic you may complete it without incident.`
        : cold
          ? `Registry notes your arrival in ${sectorName}. ${contract.title} remains active. Kindly resist your normal urge to complicate a clean assignment.`
          : `Registry notes your arrival in ${sectorName}. ${contract.title} remains active. Please behave like someone capable of finishing a clean assignment.`
      : warm
        ? `Your presence in ${sectorName} makes one pending matter newly relevant. I am placing it in your queue because, regrettably, you have earned that courtesy.`
        : `Your presence in ${sectorName} makes one pending matter newly relevant. Review the thread and decide whether you intend to be useful.${memory ? ` ${memory}` : ""}`,
    "bounty-marshal-tovin": relevantActive.length
      ? warm
        ? `You're in ${sectorName}. Good. ${contract.title} is still open, and you're one of the few captains I trust not to talk first and work later.`
        : cold
          ? `You're in ${sectorName}. Good. ${contract.title} is still open, and you've run out of excuses now.`
          : `You're in ${sectorName}. Good. ${contract.title} is still open, and geography is no longer a valid excuse.`
      : warm
        ? `${sectorName} just made one of my open problems reachable. If you want it, I would rather hand it to you than to a loud amateur.`
        : `${sectorName} just made one of my open problems your problem too, if you want it.${memory ? ` ${memory}` : ""}`,
  };
  const baseText = contactVoices[thread.id] || `${thread.contact.name.split(" ")[0]} noticed you entered ${sectorName}. One of their open leads just became relevant here.`;
  return {
    signature,
    text: memory && !baseText.includes(memory) ? `${baseText} ${memory}` : baseText,
  };
}

function triggerArrivalThreadPings(sectorId) {
  syncMissionThreads();
  const pings = [];
  for (const thread of missionInboxThreads()) {
    const ping = arrivalPingForThread(thread, sectorId);
    if (!ping) continue;
    appendMissionThreadMessage(thread.id, {
      from: "them",
      text: ping.text,
      contractId: null,
    }, { unread: true });
    state.arrivalThreadPings[thread.id] = ping.signature;
    pings.push(thread.contact.name);
  }
  if (pings.length) {
    const pingLine = pings.length > 2 ? `${pings.slice(0, 2).join(", ")} and ${pings.length - 2} more` : pings.join(", ");
    pushMessageLog(`New comms from ${pings.join(", ")} on entry to ${SECTORS[sectorId]?.name || "local space"}.`, "Comms");
    showBanner("Comms Waiting", `${pingLine} just lit up your inbox.`, 2.2);
  }
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

function nextBestContract() {
  if (state.activeMissionThreadId) {
    const focused = state.activeContracts.find((contract) => missionThreadIdForContract(contract) === state.activeMissionThreadId)
      || state.availableContracts.find((contract) => missionThreadIdForContract(contract) === state.activeMissionThreadId);
    if (focused) return focused;
  }
  return state.activeContracts[0] || state.availableContracts[0] || null;
}

function coreArcStatusLabel() {
  if (state.coreArc.stage === "locked") return "Locked";
  if (state.coreArc.stage === "sol-briefing") return "Sol briefing waiting";
  if (state.coreArc.stage === "barnard-ledger") return "Barnard lead active";
  if (state.coreArc.stage === "centauri-relay") return "Centauri relay active";
  if (state.coreArc.stage === "sirius-hearing") return "Sirius hearing active";
  if (state.coreArc.stage === "resolved") return "Resolved";
  return "In motion";
}

function completionImpactLine(contract) {
  const notes = [];
  if (contract.factionId) {
    notes.push(`${factionName(contract.factionId)} +2`);
  }
  if (contract.type === "smuggling") {
    notes.push("Nightglass +2");
  }
  if (contract.grantsPermit) {
    notes.push(`${travelPermitLabel(contract.grantsPermit)} cleared`);
  }
  if (!notes.length) {
    return "Dock ledgers shifted in your favor.";
  }
  return `Standing shift: ${notes.join(" • ")}.`;
}

function completionFollowUpLine(contract, bonusText) {
  const threadId = missionThreadIdForContract(contract);
  const warm = missionThreadRelationshipState({ id: threadId })?.warm;
  const destination = SECTORS[contract.destinationId]?.name || "the dock";
  if ((contract.tags || []).includes("Mystery")) {
    return pickVariant([
      `The dock knew the result of ${contract.title.toLowerCase()} before you said a word. That is either efficiency or foreknowledge, and neither reads clean.`,
      `Somebody on the receiving side moved faster than the cargo should have allowed. ${contract.title} may have landed in more than one ledger.`,
      `${contract.title} closed clean, but the reaction around ${destination} did not feel surprised enough to be ordinary.`,
      `The work is done. The part that lingers is how many people behaved like they were waiting for this exact outcome.`,
    ]);
  }
  const byThread = {
    "independent-mara-kade": () => {
      if (contract.type === "cargo") return warm
        ? "Freight is already off your deck and the room noticed whose registry it rode in on. That matters."
        : "Freight is off your deck. I will let the right people hear that you handled it clean.";
      if (contract.type === "courier" || contract.type === "smuggling") return warm
        ? "The packet reached the right hands. You did not just earn credits, you earned a cleaner chair at this table."
        : "The packet disappeared where it needed to. That buys you another inch of trust.";
      return `You brought ${contract.title.toLowerCase()} home from ${destination}. The dock is already repeating your name to itself.`;
    },
    "union-juno-vale": () => {
      if (contract.type === "cargo" || contract.type === "courier") return warm
        ? "The handoff is already moving outward to people who actually needed it. That is why I call you first now."
        : "The handoff is already moving outward to the people who needed it. Good work.";
      return "Dispatch has the handoff on the board already. That means one less excuse for the people who caused the delay.";
    },
    "salvage-dax-brindle": () => contract.type === "salvage"
      ? (warm
        ? "Recovery crews say you pulled the part that mattered, not just the metal that sold. That is rarer than it should be."
        : "Recovery crews paid fast, and Dax made sure they understood you brought back the right piece.")
      : "Whatever you dragged in from the lane is already being priced, argued over, and remembered.",
    "nightglass-vey-neral": () => contract.type === "smuggling"
      ? (warm
        ? pickVariant([
          "Package vanished exactly on schedule. You continue to justify a very selective conversation.",
          "The handoff disappeared with admirable discipline. You remain worth talking to carefully.",
          "Clean disappearance. Timed well enough to make discretion look effortless.",
          "The package left the world without drama, which is a rarer skill than most couriers realize.",
        ])
        : pickVariant([
          "Package vanished before the scanners had a chance to pretend they were awake. Efficient.",
          "The handoff cleared the lane before the checkpoint systems remembered how to notice things. Acceptable work.",
          "Package moved cleanly enough that the security layer only got to be offended in retrospect.",
          "By the time anyone official might have paid attention, the package was already a historical detail.",
          "The packet crossed quietly, left no bruise on the registry, and gave the scanners nothing but wounded dignity.",
        ]))
      : "Nightglass marked the handoff cleanly. That alone will make certain doors quieter when they open.",
    "core-ilya-sen": () => contract.grantsPermit === "coreTransit"
      ? "Registry updated the moment the packet landed. Bureaucracy rarely moves that fast unless somebody important is relieved."
      : (warm
        ? "Receipt is stamped, filed, and attached to your improving record. Ilya will hate how much that sounds like praise."
        : "Receipt is stamped and the record survived contact with you. Progress."),
    "bounty-marshal-tovin": () => contract.type === "bounty"
      ? (warm
        ? "Escrow cleared and one more violent idiot is off the lane. Tovin will call that a solid day."
        : "Escrow cleared. The lane complains less when pirate hulls stop moving.")
      : "The board updated the contract and the lane got slightly less stupid for it.",
  };
  const specific = byThread[threadId];
  if (specific) return specific();
  if (bonusText === "Packet transferred.") {
    return "The packet changed hands without noise and the sender made sure your side of the ledger reflected it.";
  }
  return "The dock updated the ledger on the run and the contact line warmed a little with it.";
}

function completionPayoutMessage(contract, bonusText) {
  const threadId = missionThreadIdForContract(contract);
  const warm = missionThreadRelationshipState({ id: threadId })?.warm;
  const destination = SECTORS[contract.destinationId]?.name || "the dock";
  if ((contract.tags || []).includes("Mystery")) {
    return pickVariant([
      `Good. ${destination} confirmed receipt, and the transfer cleared fast enough to suggest someone important was already watching.`,
      `Good. Payment moved before the dock had time to look confused. That is not how ordinary work settles.`,
      `Good. The credit transfer arrived almost pre-approved. Make of that what you like.`,
      `Good. Funds cleared with suspicious elegance. Somebody upstream wanted this settled before questions formed.`,
    ]);
  }
  const byThread = {
    "independent-mara-kade": () => (contract.type === "courier" || contract.type === "smuggling")
      ? (warm
        ? `Good. You made it to ${destination}. I just sent your side of it.`
        : `Good. You made it to ${destination}. I just pushed your payment.`)
      : contract.type === "cargo"
        ? (warm
          ? "Good. Freight is off your deck and I already sent your cut."
          : "Good. Freight is off your deck and I just released your payment.")
        : `Good. You made it to ${destination}. I just released your payment.`,
    "union-juno-vale": () => `Good. You made it to ${destination}. I just cleared your payment on my side.`,
    "salvage-dax-brindle": () => contract.type === "salvage"
      ? "Good pull. I just told the yard to release your cut."
      : `Good. You brought it into ${destination}. I just released your payment.`,
    "nightglass-vey-neral": () => `Good. That arrived where it needed to. I just sent your deposit.`,
    "core-ilya-sen": () => "Receipt confirmed. I just released your transfer.",
    "bounty-marshal-tovin": () => contract.type === "bounty"
      ? "Good. The board has the kill and I just cleared the payout."
      : `Good. You made it to ${destination}. I just cleared the payout.`,
  };
  const specific = byThread[threadId];
  if (specific) return specific();
  if (bonusText === "Packet transferred.") {
    return `Good. You made it to ${destination}. I just sent the deposit.`;
  }
  return `Good. You made it to ${destination}. I just released your payment.`;
}

function completionLoreLine(contract, bonusText) {
  if ((contract.tags || []).includes("Mystery")) {
    return pickVariant([
      "The formal job closed, but the institutional reaction around it suggested this was one fragment of a much older arrangement.",
      "What should have felt like a normal completion instead landed like proof that several different systems were already coordinating their memory.",
      "The handoff settled the contract and unsettled the story. Too many people treated the outcome like confirmation instead of news.",
      "The dock ledger marked the work complete, but the speed of the surrounding response suggested the real transaction happened somewhere off-record.",
    ]);
  }
  if (contract.grantsPermit === "coreTransit") {
    return "Authority traffic control stamped your registry for core-lane travel. Sol is no longer just a rumor on the board.";
  }
  if (contract.grantsPermit === "nightglassTransit") {
    return "A Nightglass broker passed you the kind of key that only exists if somebody already trusts you.";
  }
  if (contract.id === "core-arc-sol-briefing") {
    return "Barnard's Star answered Sol's old paperwork, which means the nearby stars still remember promises the core forgot.";
  }
  if (contract.id === "core-arc-barnard-ledger") {
    return "The relay ledger made it clear the independents kept the lane alive when official traffic thinned out.";
  }
  if (contract.id === "core-arc-centauri-relay") {
    return "Centauri freight houses put their family names behind the packet. That matters more than most permits.";
  }
  if (contract.id === "core-arc-sirius-hearing") {
    return "The hearing closed with your courier chain sitting in the middle of a rewritten regional story.";
  }
  if (contract.id === "arc-choice-syndicate" || contract.id === "arc-syndicate-path-job-1" || contract.id === "arc-syndicate-path-job-2") {
    return "Nightglass treated the run as a test, and you came back with your name still useful.";
  }
  if (contract.id === "arc-choice-authority" || contract.id === "arc-authority-path-job-1" || contract.id === "arc-authority-path-job-2") {
    return "The Authority closed another file with your ship attached to the margin notes.";
  }
  if (contract.type === "cargo") {
    return "Dock crews rolled the freight off clean, and the station ledger now reads you as reliable.";
  }
  if (contract.type === "courier") {
    return bonusText === "Packet transferred."
      ? "The packet changed hands without noise, which is exactly what the sender paid for."
      : "The handoff landed cleanly and your part of the story is now on the station record.";
  }
  if (contract.type === "market") {
    return "Speculation closed in your favor and the local board quietly marked you as a captain who can read a route.";
  }
  if (contract.type === "smuggling") {
    return "The handoff stayed quiet, which in gray work is the closest thing to applause.";
  }
  if (contract.type === "salvage") {
    return "Recovery crews paid out fast, and the wreck has already become somebody else's problem.";
  }
  if (contract.type === "bounty") {
    return "The escrow cleared and the lane got a little safer, or at least a little less crowded.";
  }
  return "The contract closed and the dock ledger marked the run complete.";
}

function nextStoryContractForDebrief(completions) {
  const wantsCore = completions.some((entry) => (entry.contract.tags || []).includes("Core Arc") || entry.contract.grantsPermit === "coreTransit");
  const wantsFaction = completions.some((entry) => (entry.contract.tags || []).includes("Faction Arc"));
  if (wantsCore) {
    return state.availableContracts.find((contract) => (contract.tags || []).includes("Core Arc")) || null;
  }
  if (wantsFaction) {
    return state.availableContracts.find((contract) => (contract.tags || []).includes("Faction Arc")) || null;
  }
  return null;
}

function openMissionDebrief(completions) {
  if (!completions.length) return;
  const nextContract = nextStoryContractForDebrief(completions);
  const totalReward = completions.reduce((sum, entry) => sum + entry.contract.reward, 0);
  const primaryThreadId = completions.length === 1 ? missionThreadIdForContract(completions[0].contract) : null;
  const primaryThread = primaryThreadId ? state.missionThreads[primaryThreadId] : null;
  const lines = completions.map((entry) => {
    const tags = Array.isArray(entry.contract.tags) && entry.contract.tags.length ? ` [${entry.contract.tags.slice(0, 2).join(" / ")}]` : "";
    return `${entry.contract.title}${tags}: +${formatCredits(entry.contract.reward)}. ${entry.bonusText} ${entry.lore} ${entry.impact}`;
  });
  const rewardLine = completions.length === 1
    ? `Reward confirmed: ${formatCredits(totalReward)} transferred on docking.`
    : `Rewards confirmed: ${formatCredits(totalReward)} total transferred on docking.`;
  const followUpLine = completions.length === 1
    ? `Contact follow-up: ${completions[0].followUp}`
    : `Follow-up traffic is waiting from ${Array.from(new Set(completions.map((entry) => ensureMissionThread(entry.contract).contact.name))).join(", ")}.`;
  const clueLine = nextContract
    ? `Next lead available: ${nextContract.title}.`
    : "No direct follow-up surfaced immediately, but the board has already updated.";

  state.lastDockDebrief = {
    completions: completions.map((entry) => entry.contract.id),
    nextContractId: nextContract?.id || null,
    summary: `${completions.map((entry) => entry.contract.title).join(", ")} closed for ${formatCredits(totalReward)}. ${followUpLine}`,
  };

  openPopup({
    title: completions.length === 1 ? "Mission Complete" : "Missions Complete",
    copy: `${lines.join(" ")} ${rewardLine} ${followUpLine} ${clueLine}`,
    options: [
      primaryThread
        ? {
            label: `Open ${primaryThread.contact.name}`,
            meta: "Read the follow-up, payout note, and any new lead.",
            confirm() {
              closePopup();
              setActiveMissionThread(primaryThread.id);
              state.dockScreen = "contract-thread";
              state.selectedMenuIndex = 0;
              resetThreadViewport(true);
              setHint("Up and down scroll the thread. Left and right move your reply. A sends and B returns to the inbox.");
            },
          }
        : null,
      nextContract
        ? {
            label: `Accept ${nextContract.title}`,
            meta: `${formatCredits(nextContract.reward)} | ${(nextContract.tags || []).join(" / ")}`,
            confirm() {
              closePopup();
              acceptContract(nextContract.id);
            },
          }
        : null,
      {
        label: "Review Mission Board",
        meta: "Stay docked and look over the updated contracts.",
        confirm() {
          closePopup();
          openDockScreen("contracts");
        },
      },
      {
        label: "Close Debrief",
        meta: "Return to the dock command deck.",
        confirm() {
          closePopup();
        },
      },
    ].filter(Boolean),
  });
}

function openArrivalPopup() {
  const arrival = sectorArrivalPacket();
  openPopup({
    title: arrival.title,
    copy: arrival.copy,
    options: [
      {
        label: "Continue",
        meta: "A or B closes this arrival brief.",
        confirm() {
          closePopup();
        },
      },
      {
        label: "Open Starmap",
        meta: "Review nearby lanes before you drift too far.",
        confirm() {
          closePopup();
          openStarmap("flight");
        },
      },
    ],
  });
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
  const condition = sectorCondition(sector.id);
  if (condition) {
    state.activeSectorEvent = {
      ...condition,
      timeLeft: EVENT_DURATION,
    };
    return;
  }
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

function sectorCondition(sectorId = state.currentSectorId) {
  const condition = state.sectorStates[sectorId];
  return condition && condition.turnsLeft > 0 ? condition : null;
}

function sectorConditionSummary(sectorId = state.currentSectorId) {
  const condition = sectorCondition(sectorId);
  return condition ? `${condition.title} (${condition.turnsLeft} jumps)` : "Stable lane";
}

function weightedRandom(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

function pickVariant(options, fallback = "") {
  if (!Array.isArray(options) || options.length === 0) return fallback;
  return options[Math.floor(Math.random() * options.length)] || fallback;
}

function stableHash(value) {
  const text = `${value ?? ""}`;
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pickVariantForKey(key, options, fallback = "") {
  if (!Array.isArray(options) || options.length === 0) return fallback;
  const index = stableHash(key) % options.length;
  return options[index] || fallback;
}

function chooseSectorCondition(sectorId) {
  const sector = SECTORS[sectorId];
  if (!sector) return null;
  const options = [
    {
      weight: lawfulSector(sector) ? 2.4 : 1.2,
      create: () => ({
        id: "salvage_drift",
        title: "Salvage Drift",
        copy: "Fresh wreck signatures are drifting through the lane and every captain with a scanner is getting greedy.",
        tag: "Salvage",
        turnsLeft: SECTOR_STATE_TURNS,
      }),
    },
  ];

  if (lawfulSector(sector)) {
    options.push({
      weight: 2.8,
      create: () => ({
        id: "convoy_window",
        title: "Convoy Window",
        copy: "Merchants are bunching up into a safer trade wave. Clean hauling and courier work pay better while it lasts.",
        tag: "Lawful",
        turnsLeft: SECTOR_STATE_TURNS,
      }),
    });
    options.push({
      weight: sector.legality === "strict" ? 2.9 : 1.8,
      create: () => ({
        id: "inspection_sweep",
        title: "Inspection Sweep",
        copy: "Checkpoint patrols are hot and dockmasters are checking cargo seals twice. Dirty captains are having a rough week.",
        tag: "Patrol",
        turnsLeft: SECTOR_STATE_TURNS,
      }),
    });
  }

  if (["cinder_wake", "iron_hollow", "shale_barrens"].includes(sectorId)) {
    options.push({
      weight: 3,
      create: () => ({
        id: "ore_glut",
        title: "Ore Glut",
        copy: "Refinery output is spilling over local storage. Ore is cheap, haulers are fat, and pirates are paying attention.",
        tag: "Trade",
        turnsLeft: SECTOR_STATE_TURNS,
      }),
    });
  }

  if (sector.faction === "pirate" || sector.legality === "gray") {
    options.push({
      weight: 3.2,
      create: () => ({
        id: "shadow_market",
        title: "Shadow Market",
        copy: "Quiet buyers are moving through the docks. Warm introductions and illegal goods suddenly matter a lot more.",
        tag: "Gray",
        turnsLeft: SECTOR_STATE_TURNS,
      }),
    });
  }

  if (sector.danger >= 0.45 || sector.faction === "pirate") {
    options.push({
      weight: 3,
      create: () => ({
        id: "pirate_raids",
        title: "Pirate Raids",
        copy: "Raiders are working the lane hard enough to scare off soft traffic and push bounty prices up.",
        tag: "Pirate",
        turnsLeft: SECTOR_STATE_TURNS,
      }),
    });
  }

  return weightedRandom(options).create();
}

function seedSectorConditions() {
  const starterIds = [...knownSectorIds()];
  for (const sectorId of starterIds) {
    if (Math.random() < 0.45) {
      state.sectorStates[sectorId] = chooseSectorCondition(sectorId);
    }
  }
}

function advanceSectorConditions(currentId = state.currentSectorId) {
  for (const [sectorId, condition] of Object.entries(state.sectorStates)) {
    condition.turnsLeft -= 1;
    if (condition.turnsLeft <= 0) {
      delete state.sectorStates[sectorId];
    }
  }

  const candidateIds = Array.from(new Set([currentId, ...knownSectorIds(), ...SECTORS[currentId].neighbors]));
  const openIds = candidateIds.filter((sectorId) => !state.sectorStates[sectorId]);
  if (openIds.length && Math.random() < 0.78) {
    const chosenId = openIds[Math.floor(Math.random() * openIds.length)];
    state.sectorStates[chosenId] = chooseSectorCondition(chosenId);
  }
}

function activeArcContractId() {
  const path = state.factionArc.path;
  const stage = state.factionArc.stage;
  return path ? `arc-${path}-${stage}` : null;
}

function sectorPriceModifier(sectorId, commodityId) {
  const condition = sectorCondition(sectorId);
  if (!condition) return 1;
  if (condition.id === "convoy_window") {
    if (commodityId === "food" || commodityId === "meds") return 1.1;
    if (commodityId === "munitions") return 1.14;
  }
  if (condition.id === "inspection_sweep") {
    if (commodityId === "contraband") return 1.34;
    if (commodityId === "munitions") return 1.12;
  }
  if (condition.id === "ore_glut" && commodityId === "ore") {
    return 0.72;
  }
  if (condition.id === "shadow_market") {
    if (commodityId === "contraband") return 1.22;
    if (commodityId === "lux") return 1.14;
  }
  if (condition.id === "pirate_raids") {
    if (commodityId === "munitions") return 1.16;
    if (commodityId === "food") return 1.08;
  }
  if (condition.id === "salvage_drift") {
    if (commodityId === "ore") return 0.88;
    if (commodityId === "munitions") return 1.08;
  }
  return 1;
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
  const conditionAdjustment = sectorPriceModifier(sectorId, commodityId);
  return Math.round(commodity.base * modifier * repAdjustment * legalAdjustment * conditionAdjustment);
}

function missionRewardBase(sectorId) {
  const sector = SECTORS[sectorId];
  return 90 + Math.round(sector.danger * 260) + (sector.legality === "strict" ? 14 : sector.legality === "gray" ? 26 : 0);
}

function applySectorConditionToContracts(sectorId, contracts) {
  const condition = sectorCondition(sectorId);
  if (!condition) return contracts;
  return contracts.map((contract) => {
    const next = { ...contract, tags: [...(contract.tags || [])] };
    if (condition.id === "convoy_window" && (contract.type === "cargo" || contract.type === "courier")) {
      next.reward += 36;
      next.tags.push("Convoy");
    }
    if (condition.id === "inspection_sweep" && contract.type === "smuggling") {
      next.reward += 52;
      next.tags.push("Hot Patrols");
    }
    if (condition.id === "ore_glut" && contract.commodityId === "ore") {
      next.reward += 26;
      next.tags.push("Bulk Freight");
    }
    if (condition.id === "shadow_market" && contract.type === "smuggling") {
      next.reward += 42;
      next.tags.push("Nightglass");
    }
    if (condition.id === "pirate_raids" && (contract.type === "bounty" || contract.type === "salvage")) {
      next.reward += 56;
      next.tags.push("Raid Pressure");
    }
    if (condition.id === "salvage_drift" && contract.type === "salvage") {
      next.reward += 34;
      next.tags.push("Fresh Wrecks");
    }
    return next;
  });
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

  const coreArcContract = generateCoreArcContract(sectorId);
  if (coreArcContract) {
    contracts.push(coreArcContract);
  }

  contracts.push(...generateRecurringContactContracts(sectorId));

  if (lawfulSector(sector) && hasAuthorityPermit()) {
    contracts.push({
      id: `${sectorId}-authority-priority`,
      type: "courier",
      title: `Priority dispatch to ${SECTORS[firstTarget].name}`,
      copy: "Authority traffic control is prioritizing captains with clean paperwork. Deliver the sealed packet fast and keep your registry tidy.",
      reward: missionRewardBase(firstTarget) + 148,
      destinationId: firstTarget,
      factionId: "authority",
      tags: ["Authority", "Priority"],
    });
  }

  if ((sector.legality === "gray" || sector.faction === "pirate") && hasSyndicateAccess()) {
    contracts.push({
      id: `${sectorId}-nightglass-ghost`,
      type: "smuggling",
      title: `Ghost handoff to ${SECTORS[smugglingTarget].name}`,
      copy: "A Nightglass broker trusts you enough to move a hotter package than the public board would ever admit exists.",
      reward: missionRewardBase(smugglingTarget) + 214,
      commodityId: "contraband",
      amount: 1,
      destinationId: smugglingTarget,
      factionId: "syndicate",
      contraband: true,
      tags: ["Nightglass", "Trusted"],
    });
  }

  if (sectorId === "authority_gate" && !hasSectorPermit("coreTransit") && factionReputation("authority") >= 2) {
    contracts.push({
      id: "authority-core-clearance",
      type: "courier",
      title: "Core Transit Screening",
      copy: "Authority Gate wants a clean manifest packet delivered to Union Harbor to finish your civilian core-lane screening. Completing it unlocks legal passage toward Sol and Sirius.",
      reward: missionRewardBase("union_harbor") + 124,
      destinationId: "union_harbor",
      factionId: "authority",
      grantsPermit: "coreTransit",
      tags: ["Authority", "Permit", "Clearance"],
    });
  }

  if ((sectorId === "ember_market" || sectorId === "mirage_verge") && !hasSectorPermit("nightglassTransit") && hasSyndicateAccess()) {
    contracts.push({
      id: "nightglass-transit-key",
      type: "courier",
      title: "Nightglass Transit Key",
      copy: "A broker wants a sealed cipher carried to Ember Market's trusted office. Complete it cleanly and the deeper gray routes toward Tau Ceti open to you.",
      reward: missionRewardBase("ember_market") + 172,
      destinationId: "ember_market",
      factionId: "syndicate",
      grantsPermit: "nightglassTransit",
      tags: ["Nightglass", "Permit", "Gray"],
    });
  }

  if (sectorId === "sol") {
    contracts.push({
      id: `${sectorId}-sol-dispatch`,
      type: "courier",
      title: "Orbital dispatch to Sirius",
      copy: "Core traffic control wants a sealed official packet delivered with no drama and no missing stamps.",
      reward: missionRewardBase("sirius") + 148,
      destinationId: "sirius",
      factionId: "authority",
      tags: ["Core", "Courier", "Authority"],
    });
  }

  if (sectorId === "barnards_star") {
    contracts.push({
      id: `${sectorId}-red-dwarf-salvage`,
      type: "salvage",
      title: "Barnard salvage sweep",
      copy: "A dim-lane recovery crew needs one clean salvage pull from the local drift and will pay quickly for discretion.",
      reward: missionRewardBase(sectorId) + 136,
      requiredBoards: 1,
      destinationId: sectorId,
      factionId: "independent",
      tags: ["Salvage", "Barnard"],
    });
  }

  if (sectorId === "alpha_centauri") {
    contracts.push({
      id: `${sectorId}-centauri-relief`,
      type: "cargo",
      title: "Centauri relief freight",
      copy: "Move medical pallets into Alpha Centauri's growing orbital neighborhoods before shortages turn ugly.",
      reward: missionRewardBase(sectorId) + 126,
      commodityId: "meds",
      amount: 2,
      destinationId: sectorId,
      factionId: "frontier",
      tags: ["Frontier", "Relief"],
    });
  }

  if (sectorId === "sirius") {
    contracts.push({
      id: `${sectorId}-luxury-run`,
      type: "market",
      title: "Sirius prestige delivery",
      copy: "Sirius buyers are paying hard for a clean luxury arrival from your next run.",
      reward: missionRewardBase(sectorId) + 164,
      commodityId: "lux",
      amount: 2,
      destinationId: sectorId,
      factionId: "authority",
      tags: ["Luxury", "Core"],
    });
  }

  if (sectorId === "tau_ceti") {
    contracts.push({
      id: `${sectorId}-tau-data-shadow`,
      type: "courier",
      title: "Tau Ceti quiet data run",
      copy: "A gray-market analytics house wants a packet slipped back toward Barnard's Star without inviting questions.",
      reward: missionRewardBase("barnards_star") + 182,
      destinationId: "barnards_star",
      factionId: "syndicate",
      tags: ["Gray", "Data", "Tau Ceti"],
    });
  }

  return applySectorConditionToContracts(sectorId, contracts);
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

function generateCoreArcContract(sectorId) {
  if (!hasSectorPermit("coreTransit")) {
    return null;
  }

  const stage = state.coreArc.stage;

  if ((stage === "locked" || stage === "sol-briefing") && sectorId === "sol" && !state.coreArc.completed.includes("core-arc-sol-briefing")) {
    return {
      id: "core-arc-sol-briefing",
      type: "courier",
      title: "Old Light Charter",
      copy: "A Sol registry clerk quietly admits the core lanes are fraying. Carry a sealed charter packet to Barnard's Star and see whether the old independent relays still answer to Sol's paperwork.",
      reward: missionRewardBase("barnards_star") + 196,
      destinationId: "barnards_star",
      factionId: "authority",
      tags: ["Core Arc", "Lore", "Sol"],
    };
  }

  if (stage === "barnard-ledger" && sectorId === "barnards_star" && !state.coreArc.completed.includes("core-arc-barnard-ledger")) {
    return {
      id: "core-arc-barnard-ledger",
      type: "market",
      title: "Relay Ledger Recovery",
      copy: "Barnard dockhands will release an old relay ledger if you bring in the spare medicine they were promised. It is half trade job, half historical archaeology.",
      reward: missionRewardBase("barnards_star") + 224,
      commodityId: "meds",
      amount: 2,
      destinationId: "barnards_star",
      factionId: "independent",
      tags: ["Core Arc", "Barnard", "Recovery"],
    };
  }

  if (stage === "centauri-relay" && sectorId === "alpha_centauri" && !state.coreArc.completed.includes("core-arc-centauri-relay")) {
    return {
      id: "core-arc-centauri-relay",
      type: "courier",
      title: "Centauri Family Relay",
      copy: "A Centauri freight family agrees to forward Barnard's ledger if you move their relay packet on to Sirius. The core may own the permits, but the nearby stars still run on personal trust.",
      reward: missionRewardBase("sirius") + 244,
      destinationId: "sirius",
      factionId: "frontier",
      tags: ["Core Arc", "Centauri", "Relay"],
    };
  }

  if (stage === "sirius-hearing" && sectorId === "sirius" && !state.coreArc.completed.includes("core-arc-sirius-hearing")) {
    return {
      id: "core-arc-sirius-hearing",
      type: "courier",
      title: "Blue Archive Hearing",
      copy: "Sirius administrators want the relay record returned to Sol under seal. The old story is becoming a new policy fight, and you now sit in the middle of it.",
      reward: missionRewardBase("sol") + 268,
      destinationId: "sol",
      factionId: "authority",
      tags: ["Core Arc", "Sirius", "Archive"],
    };
  }

  return null;
}

function generateRecurringContactContracts(sectorId) {
  const contracts = [];

  if (sectorId === "grey_exchange" && state.contactArcs.mara.stage === "intro" && !state.contactArcs.mara.completed.includes("mara-quiet-haul")) {
    contracts.push({
      id: "mara-quiet-haul",
      type: "cargo",
      title: "Mara's Quiet Haul",
      copy: "Mara Kade wants a no-drama freight run into Union Harbor to prove you can carry more than your own luck.",
      reward: missionRewardBase("union_harbor") + 102,
      commodityId: "food",
      amount: 2,
      destinationId: "union_harbor",
      factionId: "independent",
      tags: ["Mara Thread", "Cargo", "Character"],
    });
  }
  if (sectorId === "union_harbor" && state.contactArcs.mara.stage === "union_followup" && !state.contactArcs.mara.completed.includes("mara-dockside-whisper")) {
    contracts.push({
      id: "mara-dockside-whisper",
      type: "courier",
      title: "Mara's Dockside Whisper",
      copy: "Mara asks you to bring a quiet packet back to Grey Exchange. She says the freight was just the test.",
      reward: missionRewardBase("grey_exchange") + 126,
      destinationId: "grey_exchange",
      factionId: "independent",
      tags: ["Mara Thread", "Courier", "Character"],
    });
  }
  if (sectorId === "grey_exchange" && state.contactArcs.mara.stage === "grey_exchange_return" && !state.contactArcs.mara.completed.includes("mara-open-door")) {
    contracts.push({
      id: "mara-open-door",
      type: "courier",
      title: "Mara's Open Door",
      copy: "Mara has heard enough to know you are useful. Deliver her introduction onward to Cinder Wake and she will start opening better rooms for you.",
      reward: missionRewardBase("cinder_wake") + 148,
      destinationId: "cinder_wake",
      factionId: "independent",
      tags: ["Mara Thread", "Character", "Bridge"],
    });
  }

  if (sectorId === "cinder_wake" && state.contactArcs.dax.stage === "intro" && !state.contactArcs.dax.completed.includes("dax-cinder-sweep")) {
    contracts.push({
      id: "dax-cinder-sweep",
      type: "salvage",
      title: "Dax's Cinder Sweep",
      copy: "Dax Brindle wants one clean wreck pull from Cinder Wake to prove you can work around spinning metal without becoming part of it.",
      reward: missionRewardBase("cinder_wake") + 128,
      requiredBoards: 1,
      destinationId: "cinder_wake",
      factionId: "independent",
      tags: ["Dax Thread", "Salvage", "Character"],
    });
  }
  if (sectorId === "iron_hollow" && state.contactArcs.dax.stage === "iron_followup" && !state.contactArcs.dax.completed.includes("dax-ledger-fragment")) {
    contracts.push({
      id: "dax-ledger-fragment",
      type: "salvage",
      title: "Dax's Ledger Fragment",
      copy: "Dax heard about an old manifest fragment drifting through Iron Hollow. Recover the wreck and he swears the paper trail matters.",
      reward: missionRewardBase("iron_hollow") + 154,
      requiredBoards: 1,
      destinationId: "iron_hollow",
      factionId: "independent",
      tags: ["Dax Thread", "Salvage", "Lore"],
    });
  }
  if (sectorId === "barnards_star" && state.contactArcs.dax.stage === "barnard_followup" && !state.contactArcs.dax.completed.includes("dax-red-ledger")) {
    contracts.push({
      id: "dax-red-ledger",
      type: "courier",
      title: "Dax's Red Ledger",
      copy: "Dax sends the recovered fragment on toward Barnard's Star, where somebody still remembers the ships that vanished off the books.",
      reward: missionRewardBase("barnards_star") + 176,
      destinationId: "barnards_star",
      factionId: "independent",
      tags: ["Dax Thread", "Courier", "Lore"],
    });
  }

  if (sectorId === "union_harbor" && state.contactArcs.juno.stage === "intro" && !state.contactArcs.juno.completed.includes("juno-relief-drop")) {
    contracts.push({
      id: "juno-relief-drop",
      type: "cargo",
      title: "Juno's Relief Drop",
      copy: "Juno Vale needs medicine moved into Iron Hollow before the union clinics start losing people they could have saved.",
      reward: missionRewardBase("iron_hollow") + 118,
      commodityId: "meds",
      amount: 2,
      destinationId: "iron_hollow",
      factionId: "frontier",
      tags: ["Juno Thread", "Cargo", "Character"],
    });
  }
  if (sectorId === "iron_hollow" && state.contactArcs.juno.stage === "iron_report" && !state.contactArcs.juno.completed.includes("juno-convoy-proof")) {
    contracts.push({
      id: "juno-convoy-proof",
      type: "courier",
      title: "Juno's Convoy Proof",
      copy: "Juno wants proof of the delay sent to Alpha Centauri, where the freight families can pressure the right people.",
      reward: missionRewardBase("alpha_centauri") + 162,
      destinationId: "alpha_centauri",
      factionId: "frontier",
      tags: ["Juno Thread", "Courier", "Character"],
    });
  }
  if (sectorId === "alpha_centauri" && state.contactArcs.juno.stage === "centauri_push" && !state.contactArcs.juno.completed.includes("juno-union-voice")) {
    contracts.push({
      id: "juno-union-voice",
      type: "courier",
      title: "Juno's Union Voice",
      copy: "Take Juno's packet back to Union Harbor. The freight houses listened, and now she wants the answer on the record.",
      reward: missionRewardBase("union_harbor") + 184,
      destinationId: "union_harbor",
      factionId: "frontier",
      tags: ["Juno Thread", "Courier", "Character"],
    });
  }

  if (sectorId === "grey_exchange" && state.intrigue.stage === "dormant" && !state.intrigue.completed.includes("mystery-relief-freight")) {
    contracts.push({
      id: "mystery-relief-freight",
      type: "cargo",
      title: "Emergency Relief Freight",
      copy: "A rushed food-and-medicine pallet needs to hit Union Harbor under ordinary paperwork. Mara calls it relief freight. The payout suggests somebody wants it treated as more than mercy.",
      reward: missionRewardBase("union_harbor") + 144,
      commodityId: "food",
      amount: 2,
      destinationId: "union_harbor",
      factionId: "independent",
      threadId: "independent-mara-kade",
      tags: ["Mystery", "Relief", "Cargo"],
    });
  }
  if (sectorId === "union_harbor" && state.intrigue.stage === "relief-ledger" && !state.intrigue.completed.includes("mystery-manifest-anomaly")) {
    contracts.push({
      id: "mystery-manifest-anomaly",
      type: "courier",
      title: "Routine Manifest Addendum",
      copy: "Juno got handed a routine correction that was somehow logged before the complaint that should have created it. Carry the sealed addendum to Authority Gate and watch who acts like they were expecting you.",
      reward: missionRewardBase("authority_gate") + 168,
      destinationId: "authority_gate",
      factionId: "frontier",
      threadId: "union-juno-vale",
      tags: ["Mystery", "Registry", "Courier"],
    });
  }
  if (sectorId === "authority_gate" && state.intrigue.stage === "forged-chain" && !state.intrigue.completed.includes("mystery-escort-trace")) {
    contracts.push({
      id: "mystery-escort-trace",
      type: "courier",
      title: "Escort Registry Echo",
      copy: "Ilya has a fragmentary escort registry pointing at Barnard's Star and a ship called Saint Radiant that should either be archived, insured, or dead in a more legible way. Move the packet quietly and do not hand it to anyone before they use the name first.",
      reward: missionRewardBase("barnards_star") + 182,
      destinationId: "barnards_star",
      factionId: "authority",
      threadId: "core-ilya-sen",
      tags: ["Mystery", "Escort", "Registry"],
    });
  }
  if (sectorId === "barnards_star" && state.intrigue.stage === "ghost-escort" && !state.intrigue.completed.includes("mystery-ninth-berth")) {
    contracts.push({
      id: "mystery-ninth-berth",
      type: "courier",
      title: "Ninth Berth Coordinates",
      copy: "Dax found a hand-marked route note folded into the Saint Radiant trace. It references a place called Ninth Berth that nobody wants to admit exists. Carry the coordinates to Mirage Verge and pay attention to who stops sounding surprised.",
      reward: missionRewardBase("mirage_verge") + 206,
      destinationId: "mirage_verge",
      factionId: "independent",
      threadId: "salvage-dax-brindle",
      tags: ["Mystery", "Ninth Berth", "Courier"],
    });
  }

  return contracts;
}

function resetContractsForSector() {
  const activeIds = new Set(state.activeContracts.map((contract) => contract.id));
  state.availableContracts = generateContracts(state.currentSectorId)
    .filter((contract) => !activeIds.has(contract.id));
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

function createBurst(x, y, color, options = {}) {
  state.bursts.push({
    x,
    y,
    color,
    radius: options.radius ?? 12,
    grow: options.grow ?? 18,
    life: options.life ?? 0.26,
    maxLife: options.life ?? 0.26,
    fillAlpha: options.fillAlpha ?? 0.14,
    lineWidth: options.lineWidth ?? 2,
  });
}

function rechargeShield(body, cap, regenPerSecond, dt) {
  if (body.disabled) return;
  body.shieldCooldown = Math.max(0, (body.shieldCooldown || 0) - dt);
  if (body.shieldCooldown > 0) {
    body.shieldFlash = 1;
    return;
  }
  body.shieldFlash = Math.max(0, (body.shieldFlash || 0) - dt * 1.8);
  if ((body.shield || 0) >= cap) {
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
    target.shieldFlash = 1;
    createSpark(target.x, target.y, shieldColor, absorbed >= damage ? 6 : 10);
    createBurst(target.x, target.y, shieldColor, {
      radius: absorbed >= damage ? 10 : 14,
      grow: absorbed >= damage ? 12 : 18,
      life: absorbed >= damage ? 0.2 : 0.26,
      fillAlpha: absorbed >= damage ? 0.1 : 0.16,
    });
    if (target.shield <= 0) {
      createSpark(target.x, target.y, "#b7f1ff", 12);
      createBurst(target.x, target.y, "#b7f1ff", {
        radius: 18,
        grow: 28,
        life: 0.32,
        fillAlpha: 0.2,
        lineWidth: 2.4,
      });
      addScreenShake(5);
    }
  }
  if (remaining > 0) {
    target.hull -= remaining;
    createSpark(target.x, target.y, hullColor, 8);
    createBurst(target.x, target.y, hullColor, {
      radius: 13,
      grow: 16 + remaining * 0.3,
      life: 0.24,
      fillAlpha: 0.15,
    });
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
    shieldFlash: 0,
    cargo: { ore: type === "trader" ? 2 : 1, munitions: type === "pirate" ? 1 : 0 },
  });
}

function trafficAdjustmentForSector(sectorId = state.currentSectorId) {
  const condition = sectorCondition(sectorId);
  if (!condition) {
    return { traders: 0, patrols: 0, pirates: 0, hostilePirates: 0, smugglers: 0 };
  }
  if (condition.id === "convoy_window") {
    return { traders: 2, patrols: 1, pirates: -1, hostilePirates: 0, smugglers: 0 };
  }
  if (condition.id === "inspection_sweep") {
    return { traders: -1, patrols: 2, pirates: 0, hostilePirates: 0, smugglers: -1 };
  }
  if (condition.id === "ore_glut") {
    return { traders: 1, patrols: 0, pirates: 1, hostilePirates: 0, smugglers: 0 };
  }
  if (condition.id === "shadow_market") {
    return { traders: 0, patrols: -1, pirates: 0, hostilePirates: 0, smugglers: 2 };
  }
  if (condition.id === "pirate_raids") {
    return { traders: -1, patrols: 0, pirates: 2, hostilePirates: 1, smugglers: 0 };
  }
  if (condition.id === "salvage_drift") {
    return { traders: 1, patrols: 0, pirates: 1, hostilePirates: 0, smugglers: 0 };
  }
  return { traders: 0, patrols: 0, pirates: 0, hostilePirates: 0, smugglers: 0 };
}

function refillSectorTraffic() {
  state.enemyShips = [];
  state.bullets = [];
  const sector = currentSector();
  const layout = sector.traffic || { traders: 2, patrols: 1, pirates: 1, hostilePirates: 0, smugglers: 0 };
  const adjustment = trafficAdjustmentForSector(sector.id);
  const lawfulHeat = lawfulSector(sector) && currentSectorRep() <= -8 ? 1 : 0;
  const pirateHeat = sector.faction === "pirate" || sector.legality === "gray" ? 0 : 1;

  for (let index = 0; index < Math.max(0, layout.pirates + adjustment.pirates); index += 1) {
    spawnEnemy("pirate", 120 + Math.random() * 720, 80 + Math.random() * 420, { disposition: pirateHeat && Math.random() < sector.danger * 0.34 ? "suspicious" : "neutral" });
  }
  for (let index = 0; index < Math.max(0, layout.hostilePirates + adjustment.hostilePirates); index += 1) {
    spawnEnemy("pirate", 120 + Math.random() * 720, 80 + Math.random() * 420, { disposition: "hostile" });
  }
  for (let index = 0; index < Math.max(0, layout.patrols + adjustment.patrols); index += 1) {
    spawnEnemy("patrol", 180 + Math.random() * 620, 120 + Math.random() * 320, { disposition: lawfulHeat ? "suspicious" : "neutral" });
  }
  for (let index = 0; index < Math.max(0, layout.traders + adjustment.traders); index += 1) {
    spawnEnemy("trader", 150 + Math.random() * 680, 100 + Math.random() * 380, { disposition: "neutral" });
  }
  for (let index = 0; index < Math.max(0, (layout.smugglers || 0) + adjustment.smugglers); index += 1) {
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

function enterDockMode(message, options = {}) {
  const access = dockAccessState();
  if (access === "denied" && !options.force) {
    state.mode = "flight";
    setStatus(message || `Docking denied at ${currentSector().name}. Patrol control wants you gone.`);
    setHint("Keep clear of the station or improve your standing before asking again.");
    setOverlay(currentSector().name, currentSector().intel || currentSector().description);
    return;
  }
  state.mode = "dock";
  state.dockScreen = "root";
  state.selectedMenuIndex = state.previousDockIndex || 0;
  normalizeEscortHangar();
  state.popup = null;
  state.escapeSequence = null;
  state.player.vx = 0;
  state.player.vy = 0;
  updateDiscoveredSectors();
  const repairSummary = autoRepairOnDock();
  const refuelSummary = autoRefuelOnDock();
  resetContractsForSector();
  const completions = resolveContractsOnDock();
  resetContractsForSector();
  syncMissionThreads();
  if (options.dockEvent !== false) {
    recordDockLore({
      silent: Boolean(options.silentLore),
      markUnread: options.markArchiveUnread !== false,
    });
  }
  if (access === "restricted") {
    if (!completions.length) {
      const repairText = repairSummary.cost > 0
        ? repairSummary.full
          ? ` Auto-repair charged ${formatCredits(repairSummary.cost)}.`
          : ` Emergency repair charged ${formatCredits(repairSummary.cost)} and stabilized the hull.`
        : "";
      const refuelText = refuelSummary.cost > 0
        ? refuelSummary.full
          ? ` Auto-refuel charged ${formatCredits(refuelSummary.cost)}.`
          : ` Auto-refuel charged ${formatCredits(refuelSummary.cost)} and only partially topped off the tanks.`
        : "";
      setStatus((message || `Restricted docking at ${currentSector().name}. Services only until relations improve.`) + repairText + refuelText);
    }
    setHint("You can save, repair, refuel, and leave. Lawful stations close their good doors to hostile captains.");
  } else {
    if (!completions.length) {
      const repairText = repairSummary.cost > 0
        ? repairSummary.full
          ? ` Auto-repair charged ${formatCredits(repairSummary.cost)}.`
          : ` Auto-repair charged ${formatCredits(repairSummary.cost)} and only covered part of the damage.`
        : "";
      const refuelText = refuelSummary.cost > 0
        ? refuelSummary.full
          ? ` Auto-refuel charged ${formatCredits(refuelSummary.cost)}.`
          : ` Auto-refuel charged ${formatCredits(refuelSummary.cost)} and only partially topped off the tanks.`
        : "";
      setStatus((message || `Docked at ${currentSector().name}.`) + repairText + refuelText);
    }
    setHint(`${dockMoodTag()}. Use the command deck to trade, refit, browse contracts, or push back into the lane.`);
  }
  setOverlay(`Docked at ${currentSector().name}`, dockContextLine());
  showBanner(currentSector().name, `${dockMoodTag()} berth live.`, 2.6);
  if (completions.length) {
    setStatus(`Docked at ${currentSector().name}. ${completions.length} conversation update${completions.length === 1 ? "" : "s"} waiting in Missions.`);
    openMissionDebrief(completions);
    setOverlay(`Docked at ${currentSector().name}`, dockContextLine());
  }
}

function enterFlightMode(message, options = {}) {
  disableAutopilot({ updateHint: false, log: false });
  state.mode = "flight";
  state.popup = null;
  state.scanState = null;
  state.travelSequence = null;
  state.lastDockDebrief = null;
  state.encounterTriggeredThisFlight = false;
  state.encounterCooldown = ENCOUNTER_DELAY_RANGE[0] + Math.random() * (ENCOUNTER_DELAY_RANGE[1] - ENCOUNTER_DELAY_RANGE[0]);
  state.actionLockUntil = performance.now() + 260;
  state.player.x = options.spawnX ?? currentSector().station.x + 90;
  state.player.y = options.spawnY ?? currentSector().station.y;
  state.player.vx = options.vx ?? 0;
  state.player.vy = options.vy ?? 0;
  if (typeof options.angle === "number") {
    state.player.angle = options.angle;
  }
  state.player.fireCooldown = 0.16;
  keyboard.fire = false;
  keyboard.pause = false;
  normalizeEscortHangar();
  chooseSectorEvent();
  refillSectorTraffic();
  syncEscortFlightStates(options.resetEscorts ?? false);
  const arrivalPacket = sectorArrivalPacket();
  setStatus(message || `${currentSector().name} lane active.`);
  setHint(options.arrival ? arrivalPacket.hint : standardFlightHint());
  setOverlay(currentSector().name, options.arrival ? arrivalPacket.overlay : "Traffic is live. Pick your fights, dock clean, or jump before the sector notices what you stole.");
  showBanner(options.arrival ? arrivalPacket.bannerTitle : currentSector().name, options.arrival ? arrivalPacket.bannerCopy : "Undocked. Lane traffic is live.", options.arrival ? 2.9 : 2.4);
  ensureMissionSalvageTargets(options.arrival ? "arrival" : "undock");
}

function completeContract(contract, bonusText) {
  const thread = ensureMissionThread(contract);
  const lore = completionLoreLine(contract, bonusText);
  const impact = completionImpactLine(contract);
  const followUp = completionFollowUpLine(contract, bonusText);
  const payoutMessage = completionPayoutMessage(contract, bonusText);
  state.player.credits += contract.reward;
  if (contract.factionId) {
    modifyReputation(contract.factionId, 2);
  }
  state.activeContracts = state.activeContracts.filter((active) => active.id !== contract.id);
  if (contract.grantsPermit) {
    state.permits[contract.grantsPermit] = true;
    const permitName = travelPermitLabel(contract.grantsPermit);
    const permitCopy = contract.grantsPermit === "nightglassTransit"
      ? "Nightglass gray routes are now open."
      : "Core lanes are now open.";
    pushMessageLog(`${permitName} granted. ${permitCopy}`, "Permit");
    showBanner("Transit Cleared", `${permitName} approved. ${permitCopy}`, 3);
    if (contract.grantsPermit === "coreTransit" && state.coreArc.stage === "locked") {
      state.coreArc.stage = "sol-briefing";
      pushMessageLog("Sol registry traffic now has reason to notice your ship. A quiet briefing is waiting in the core.", "Lore");
    }
  }
  advanceFactionArc(contract);
  advanceCoreArc(contract);
  advanceRecurringContactArc(contract);
  advanceIntrigueArc(contract);
  appendMissionThreadMessage(thread.id, {
    from: "them",
    text: `${payoutMessage} Reward transferred: ${formatCredits(contract.reward)}.`,
    contractId: contract.id,
  }, { unread: true });
  appendMissionThreadMessage(thread.id, {
    from: "them",
    text: followUp,
    contractId: contract.id,
  }, { unread: true });
  pushMessageLog(`${thread.contact.name} followed up on ${contract.title}. ${impact}`, "Comms");
  setStatus(`${contract.title} complete. ${formatCredits(contract.reward)} paid. ${bonusText || ""}`.trim(), { tag: "Contract" });
  return {
    contract,
    bonusText: bonusText || "Mission ledger closed.",
    lore,
    impact,
    followUp,
  };
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

function advanceCoreArc(contract) {
  if (contract.id === "core-arc-sol-briefing") {
    state.coreArc.stage = "barnard-ledger";
    state.coreArc.completed.push(contract.id);
    modifyReputation("authority", 1);
    modifyReputation("independent", 1);
    showBanner("Old Paper, Live Route", "Sol's old charter network still reaches farther than the clerks expected.", 3.1);
    pushMessageLog("Barnard's Star answered Sol's sealed charter. Someone in the core is paying attention now.", "Lore");
    return;
  }
  if (contract.id === "core-arc-barnard-ledger") {
    state.coreArc.stage = "centauri-relay";
    state.coreArc.completed.push(contract.id);
    modifyReputation("independent", 2);
    showBanner("Barnard Ledger Found", "The independents kept better records than Sol gave them credit for.", 3.1);
    pushMessageLog("Barnard relay crews turned over a ledger showing how the nearby stars kept trade moving after the old lane contractions.", "Lore");
    return;
  }
  if (contract.id === "core-arc-centauri-relay") {
    state.coreArc.stage = "sirius-hearing";
    state.coreArc.completed.push(contract.id);
    modifyReputation("frontier", 2);
    showBanner("Centauri Trust", "The freight families vouched for you with their name and packet code.", 3.1);
    pushMessageLog("Alpha Centauri's old freight houses backed the Barnard record and forwarded it into Sirius jurisdiction.", "Lore");
    return;
  }
  if (contract.id === "core-arc-sirius-hearing") {
    state.coreArc.stage = "resolved";
    state.coreArc.completed.push(contract.id);
    modifyReputation("authority", 2);
    modifyReputation("frontier", 1);
    modifyReputation("independent", 1);
    showBanner("Core Hearing Closed", "Sol can no longer pretend the nearby stars are just satellite paperwork.", 3.4);
    pushMessageLog("The Sol-Sirius hearing closed with the nearby relays formally recognized as essential civil lanes. Your name is on the courier chain.", "Lore");
  }
}

function advanceRecurringContactArc(contract) {
  if (contract.id === "mara-quiet-haul") {
    state.contactArcs.mara.stage = "union_followup";
    state.contactArcs.mara.completed.push(contract.id);
    appendMissionThreadMessage("independent-mara-kade", {
      from: "them",
      text: "You kept the freight clean. Good. Now I know you can carry a quieter truth back home without dropping it.",
      contractId: contract.id,
    }, { unread: true });
    return;
  }
  if (contract.id === "mara-dockside-whisper") {
    state.contactArcs.mara.stage = "grey_exchange_return";
    state.contactArcs.mara.completed.push(contract.id);
    appendMissionThreadMessage("independent-mara-kade", {
      from: "them",
      text: "That packet was not about money. It was about who still answers when Grey Exchange asks. One more run and I start introducing you properly.",
      contractId: contract.id,
    }, { unread: true });
    return;
  }
  if (contract.id === "mara-open-door") {
    state.contactArcs.mara.stage = "resolved";
    state.contactArcs.mara.completed.push(contract.id);
    appendMissionThreadMessage("independent-mara-kade", {
      from: "them",
      text: "Doors are opening for you now. Not because you asked, but because you came back every time you said you would.",
      contractId: contract.id,
    }, { unread: true });
    return;
  }

  if (contract.id === "dax-cinder-sweep") {
    state.contactArcs.dax.stage = "iron_followup";
    state.contactArcs.dax.completed.push(contract.id);
    appendMissionThreadMessage("salvage-dax-brindle", {
      from: "them",
      text: "Clean recovery. There is another wreck in Iron Hollow carrying a fragment of something older than the ship itself. Interested?",
      contractId: contract.id,
    }, { unread: true });
    return;
  }
  if (contract.id === "dax-ledger-fragment") {
    state.contactArcs.dax.stage = "barnard_followup";
    state.contactArcs.dax.completed.push(contract.id);
    appendMissionThreadMessage("salvage-dax-brindle", {
      from: "them",
      text: "The fragment names ships that should not have vanished. Barnard's Star still has people who remember that handwriting.",
      contractId: contract.id,
    }, { unread: true });
    return;
  }
  if (contract.id === "dax-red-ledger") {
    state.contactArcs.dax.stage = "resolved";
    state.contactArcs.dax.completed.push(contract.id);
    appendMissionThreadMessage("salvage-dax-brindle", {
      from: "them",
      text: "You did not just pull metal. You pulled memory. Most captains never notice the difference.",
      contractId: contract.id,
    }, { unread: true });
    return;
  }

  if (contract.id === "juno-relief-drop") {
    state.contactArcs.juno.stage = "iron_report";
    state.contactArcs.juno.completed.push(contract.id);
    appendMissionThreadMessage("union-juno-vale", {
      from: "them",
      text: "Clinic got the medicine. Now I need proof of who made them wait in the first place.",
      contractId: contract.id,
    }, { unread: true });
    return;
  }
  if (contract.id === "juno-convoy-proof") {
    state.contactArcs.juno.stage = "centauri_push";
    state.contactArcs.juno.completed.push(contract.id);
    appendMissionThreadMessage("union-juno-vale", {
      from: "them",
      text: "Centauri listened. Freight families always do when the paperwork starts naming names. One last packet and this becomes policy instead of a complaint.",
      contractId: contract.id,
    }, { unread: true });
    return;
  }
  if (contract.id === "juno-union-voice") {
    state.contactArcs.juno.stage = "resolved";
    state.contactArcs.juno.completed.push(contract.id);
    appendMissionThreadMessage("union-juno-vale", {
      from: "them",
      text: "That is how a lane changes: one captain, one delivery, one piece of proof at a time. You did right by people who will never know your name.",
      contractId: contract.id,
    }, { unread: true });
  }
}

function advanceIntrigueArc(contract) {
  if (state.intrigue.completed.includes(contract.id)) return;

  if (contract.id === "mystery-relief-freight") {
    state.intrigue.stage = "relief-ledger";
    state.intrigue.completed.push(contract.id);
    markIntrigueFlag("relief-was-precleared");
    appendIntrigueCrossTalk(contract);
    pushMessageLog("A relief pallet reached Union Harbor with the kind of pre-cleared signatures that make dockworkers stop joking mid-sentence.", "Lore");
    showBanner("Ledger Ripple", "Too many people already knew where the relief freight would land.", 3);
    return;
  }
  if (contract.id === "mystery-manifest-anomaly") {
    state.intrigue.stage = "forged-chain";
    state.intrigue.completed.push(contract.id);
    markIntrigueFlag("forged-chain");
    appendIntrigueCrossTalk(contract);
    pushMessageLog("The manifest correction appeared older than the complaint that justified it. Somebody is backdating reality with institutional help.", "Lore");
    showBanner("Routine On Paper", "The addendum looked routine until everyone important acted like they had rehearsed it.", 3.1);
    return;
  }
  if (contract.id === "mystery-escort-trace") {
    state.intrigue.stage = "ghost-escort";
    state.intrigue.completed.push(contract.id);
    markIntrigueFlag("saint-radiant");
    appendIntrigueCrossTalk(contract);
    pushMessageLog("Saint Radiant keeps existing in the exact places a vanished escort should not: registry debris, salvage notes, and people who answer too quickly.", "Lore");
    showBanner("Ghost Escort", "Saint Radiant is no longer sounding like an accident.", 3.1);
    return;
  }
  if (contract.id === "mystery-ninth-berth") {
    state.intrigue.stage = "ninth-berth";
    state.intrigue.completed.push(contract.id);
    markIntrigueFlag("ninth-berth");
    appendIntrigueCrossTalk(contract);
    pushMessageLog("Ninth Berth is either a place shared by enemies, or a lie they all need badly enough to keep naming.", "Lore");
    showBanner("Quiet Coordinates", "Ninth Berth now has enough witnesses to stop feeling imaginary.", 3.2);
  }
}

function resolveContractsOnDock() {
  const sectorId = state.currentSectorId;
  const completions = [];
  for (const contract of [...state.activeContracts]) {
    if (contract.type === "cargo" && contract.destinationId === sectorId && cargoAmount(contract.commodityId) >= contract.amount) {
      removeCargo(contract.commodityId, contract.amount);
      completions.push(completeContract(contract, "Cargo offloaded."));
    } else if (contract.type === "courier" && contract.destinationId === sectorId) {
      completions.push(completeContract(contract, "Packet transferred."));
    } else if (contract.type === "market" && contract.destinationId === sectorId && cargoAmount(contract.commodityId) >= contract.amount) {
      removeCargo(contract.commodityId, contract.amount);
      completions.push(completeContract(contract, "Speculation paid off."));
    } else if (contract.type === "smuggling" && contract.destinationId === sectorId && cargoAmount(contract.commodityId) >= contract.amount) {
      removeCargo(contract.commodityId, contract.amount);
      modifyReputation("syndicate", 2);
      completions.push(completeContract(contract, "Handoff clean. Nobody asked questions."));
    } else if (contract.type === "salvage" && (state.player.missionProgress[contract.id] || 0) >= contract.requiredBoards && contract.destinationId === sectorId) {
      completions.push(completeContract(contract, "Salvage crew paid out."));
      delete state.player.missionProgress[contract.id];
    } else if (contract.type === "bounty" && (state.player.bountyProgress[contract.id] || 0) >= contract.requiredKills && sectorId !== "shale_barrens") {
      completions.push(completeContract(contract, "Bounty escrow cleared."));
      delete state.player.bountyProgress[contract.id];
    }
  }
  return completions.filter(Boolean);
}

function hullLicenseLabel(hullId) {
  if (hullId === "corvette" || hullId === "patrol") {
    return "Authority permit required";
  }
  if (hullId === "smuggler" || hullId === "raider") {
    return "Nightglass or pirate contact required";
  }
  return null;
}

function hasHullLicense(hullId) {
  if (hullId === "corvette" || hullId === "patrol") {
    return hasAuthorityPermit();
  }
  if (hullId === "smuggler" || hullId === "raider") {
    return hasSyndicateAccess() || hasPirateContact();
  }
  return true;
}

function tryBuyCommodity(commodityId) {
  if (commodityId === "contraband" && currentSector().legality === "gray" && !hasSyndicateAccess() && sectorCondition(state.currentSectorId)?.id !== "shadow_market") {
    setStatus("The black market does not know you well enough yet.");
    return;
  }
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
  if (commodityId === "contraband" && currentSector().legality === "gray" && !hasSyndicateAccess() && sectorCondition(state.currentSectorId)?.id !== "shadow_market") {
    setStatus("No buyer will touch your contraband without a better introduction.");
    return;
  }
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

function contractAcceptanceBlock(contract) {
  if (!contract) {
    return { type: "missing", reason: "That lead is no longer on the board." };
  }
  if (state.activeContracts.some((entry) => entry.id === contract.id)) {
    return { type: "already-active", reason: `${contract.title} is already active.` };
  }
  if (dockAccessState() === "restricted") {
    return { type: "restricted", reason: "Local dispatch will not offer contracts while your papers read hostile." };
  }
  if (state.activeContracts.length >= 3) {
    return { type: "board-full", reason: "Your dispatch board is full. Finish something first." };
  }
  if ((contract.type === "cargo" || contract.type === "smuggling") && contract.commodityId && cargoUsed() + contract.amount > maxCargo()) {
    return { type: "cargo-full", reason: "Not enough cargo space for that freight contract." };
  }
  if (contract.type === "smuggling" && !hasSyndicateAccess() && currentSector().faction !== "pirate" && currentSector().legality !== "gray") {
    return { type: "trust", reason: "Nobody here trusts you with hot cargo yet." };
  }
  return null;
}

function showContractBlockedPopup(contract, block) {
  const destinationName = SECTORS[contract?.destinationId]?.name || "the next stop";
  const stayHere = {
    label: "Stay Here",
    meta: "Keep reading the thread",
    confirm() {
      closePopup();
      setStatus(block.reason, { tag: "Contract" });
    },
  };

  if (block.type === "already-active") {
    openPopup({
      title: "Already Accepted",
      copy: `${contract.title} is already on your dispatch board. I can put ${destinationName} back on the chart if you want to move instead of re-reading the pitch.`,
      options: [
        {
          label: "Plot Destination",
          meta: destinationName,
          confirm() {
            closePopup();
            openStarmap("dock", contract.destinationId);
          },
        },
        stayHere,
      ],
    });
    return;
  }

  if (block.type === "board-full") {
    const nextContract = nextBestContract();
    openPopup({
      title: "Dispatch Board Full",
      copy: `${contract.title} cannot fit right now because you already have ${state.activeContracts.length} active jobs. Finish one first, or let the chart point at the next useful stop.`,
      options: [
        {
          label: nextContract ? "Plot Active Job" : "Open Chart",
          meta: nextContract ? `${nextContract.title} | ${SECTORS[nextContract.destinationId]?.name || "Unknown"}` : "Review nearby lanes",
          confirm() {
            closePopup();
            openStarmap("dock", nextContract?.destinationId || preferredMissionDestination());
          },
        },
        stayHere,
      ],
    });
    return;
  }

  openPopup({
    title: "Cannot Take Job",
    copy: `${block.reason} ${block.type === "trust" ? "Try a cleaner contact, improve your access, or come back when this dock trusts you more." : "Pick a different thread or come back after your situation changes."}`,
    options: [
      {
        label: "Back To Contacts",
        meta: "Look for another lead",
        confirm() {
          closePopup();
          closeDockScreen();
          setStatus(block.reason, { tag: "Contract" });
        },
      },
      stayHere,
    ],
  });
}

function attemptAcceptContract(contractId) {
  const contract = state.availableContracts.find((entry) => entry.id === contractId)
    || state.activeContracts.find((entry) => entry.id === contractId)
    || null;
  const block = contractAcceptanceBlock(contract);
  if (block) {
    showContractBlockedPopup(contract || { title: "This lead", destinationId: state.currentSectorId }, block);
    return;
  }
  acceptContract(contractId);
}

function acceptContract(contractId) {
  const contract = state.availableContracts.find((entry) => entry.id === contractId);
  if (!contract) return;
  const block = contractAcceptanceBlock(contract);
  if (block) {
    setStatus(block.reason);
    return;
  }
  const thread = ensureMissionThread(contract);
  state.activeContracts.push({ ...contract, threadId: thread.id });
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
  state.availableContracts = state.availableContracts.filter((entry) => entry.id !== contractId);
  appendMissionThreadMessage(thread.id, {
    from: "you",
    text: promptLabelText(missionResponseLabel(contract)),
    contractId: contract.id,
  });
  appendMissionThreadMessage(thread.id, {
    from: "them",
    text: `Good. ${SECTORS[contract.destinationId]?.name || "Unknown"} is waiting. Bring the work back alive and the conversation keeps moving.`,
    contractId: contract.id,
  });
  setActiveMissionThread(thread.id);
  if (contract.type === "salvage" && contract.destinationId === state.currentSectorId) {
    setStatus(`Accepted: ${contract.title}. Undock and the salvage contact should be waiting in-system.`, { tag: "Contract" });
  } else {
    setStatus(`Accepted: ${contract.title}.`, { tag: "Contract" });
  }
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
  state.player.shieldFlash = 0;
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
  normalizeEscortHangar();
  if (!(currentSector().shipyard || []).includes(hullId)) {
    setStatus("This station cannot source that ship.");
    return;
  }
  if (!hasHullLicense(hullId)) {
    setStatus(hullLicenseLabel(hullId) || "You do not have the required access for that ship.");
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
  const escort = createEscortRecord(hullId, { origin: "yard" });
  state.escortHangar.push(escort);
  setStatus(`${escortFullLabel(escort)} acquired and berthed in your hangar.${state.player.loanerHull ? " Swap into it before you try to leave the system." : ""}`);
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
  state.player.shieldFlash = 0;
  setStatus(`Ship restored for ${formatCredits(cost)}.`);
}

function autoRepairOnDock() {
  const missing = Math.max(0, maxHull() - state.player.hull);
  if (missing <= 0) {
    state.player.shield = maxShield();
    state.player.shieldFlash = 0;
    return { repaired: 0, cost: 0, full: true };
  }

  const affordableHull = Math.floor(state.player.credits / 1.9);
  const repaired = clamp(affordableHull, 0, missing);
  const cost = repaired > 0 ? Math.ceil(repaired * 1.9) : 0;

  if (cost > 0) {
    state.player.credits -= cost;
    state.player.hull = clamp(state.player.hull + repaired, 0, maxHull());
  }

  state.player.shield = state.player.hull >= maxHull() ? maxShield() : Math.max(state.player.shield, maxShield() * 0.6);
  state.player.shieldFlash = 0;

  return {
    repaired,
    cost,
    full: state.player.hull >= maxHull(),
  };
}

function autoRefuelOnDock() {
  const missing = Math.max(0, currentHull().fuelCap - state.player.fuel);
  if (missing <= 0) {
    return { refueled: 0, cost: 0, full: true };
  }

  const affordableFuel = Math.floor(state.player.credits / 36);
  const refueled = clamp(affordableFuel, 0, missing);
  const cost = refueled * 36;
  if (cost > 0) {
    state.player.credits -= cost;
    state.player.fuel = clamp(state.player.fuel + refueled, 0, currentHull().fuelCap);
  }

  return {
    refueled,
    cost,
    full: state.player.fuel >= currentHull().fuelCap,
  };
}

function syncEscortFlightStates(forceReset = false) {
  normalizeEscortHangar();
  if (!Array.isArray(state.escortFlightStates)) {
    state.escortFlightStates = [];
  }
  const next = [];
  state.escortHangar.forEach((escort, index) => {
    const previous = !forceReset ? state.escortFlightStates[index] : null;
    const spawnX = state.player.x - Math.cos(state.player.angle) * (54 + index * 18) + Math.sin(state.player.angle) * (index % 2 === 0 ? -20 : 20);
    const spawnY = state.player.y - Math.sin(state.player.angle) * (54 + index * 18) - Math.cos(state.player.angle) * (index % 2 === 0 ? -20 : 20);
    next.push({
      hullId: escort.hullId,
      x: previous?.hullId === escort.hullId ? previous.x : spawnX,
      y: previous?.hullId === escort.hullId ? previous.y : spawnY,
      vx: previous?.hullId === escort.hullId ? previous.vx : 0,
      vy: previous?.hullId === escort.hullId ? previous.vy : 0,
      angle: previous?.hullId === escort.hullId ? previous.angle : state.player.angle,
      fireCooldown: previous?.hullId === escort.hullId ? Math.max(0, Number(previous.fireCooldown || 0)) : Math.random() * 0.6,
    });
  });
  state.escortFlightStates = next;
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
  normalizeEscortHangar();
  const escort = state.escortHangar[index];
  if (!escort) return;
  state.escortHangar.splice(index, 1);
  state.player.credits += escort.sale;
  setStatus(`Sold ${escortFullLabel(escort)} for ${formatCredits(escort.sale)}.`);
}

function swapFlagship(index) {
  normalizeEscortHangar();
  const escort = state.escortHangar[index];
  if (!escort) return;
  const nextHull = HULLS[escort.hullId];
  if (!nextHull) return;
  const currentWasLoaner = state.player.loanerHull;
  const currentShip = currentWasLoaner ? null : createEscortRecord(state.player.hullId, { origin: "reserve" });
  state.player.hullId = escort.hullId;
  state.player.hull = Math.min(nextHull.maxHull + state.player.hullBonus, nextHull.maxHull + state.player.hullBonus);
  state.player.shield = nextHull.maxShield;
  state.player.shieldFlash = 0;
  state.player.fuel = Math.min(state.player.fuel, nextHull.fuelCap);
  state.player.loanerHull = false;
  if (currentShip) {
    state.escortHangar.splice(index, 1, currentShip);
  } else {
    state.escortHangar.splice(index, 1);
  }
  setStatus(currentWasLoaner
    ? `Flagship swapped to ${escortFullLabel(escort)}. Loaner cleared off your registry.`
    : `Flagship swapped to ${escortFullLabel(escort)}.`);
}

function cycleEscortCommand() {
  normalizeEscortHangar();
  const commands = ["defend", "follow", "attack", "regroup"];
  const nextIndex = (commands.indexOf(state.escortCommand) + 1) % commands.length;
  state.escortCommand = commands[nextIndex];
  setStatus(`Escort command set to ${state.escortCommand}. Wing in reserve: ${escortRosterSummary(2)}.`);
}

function setTravelDeparturePose() {
  state.player.x = currentSector().station.x + 90;
  state.player.y = currentSector().station.y;
  state.player.vx = 0;
  state.player.vy = 0;
  state.player.angle = 0;
}

function travelToSector(targetSectorId) {
  const plan = travelPlanForSector(targetSectorId);
  if (!plan.route) {
    setStatus(plan.blockedReason || "No mapped course to that sector.", { tag: plan.blockedTag || "Route" });
    return;
  }
  if (plan.blockedReason) {
    setStatus(`${SECTORS[targetSectorId].name} is locked. ${plan.blockedReason}.`, { tag: plan.blockedTag });
    return;
  }
  state.player.fuel -= plan.fuelCost;
  state.popup = null;
  state.scanState = null;
  state.travelSequence = {
    phase: "depart",
    routeIds: plan.route,
    legIndex: 0,
    totalLegs: plan.jumpCount,
    fromSectorId: plan.route[0],
    toSectorId: plan.route[1],
    finalSectorId: targetSectorId,
    time: 0,
    departDuration: 1.35,
    arrivalDuration: 2.25,
    warpFlash: 0,
  };
  state.mode = "transit";
  state.starmapSelection = targetSectorId;
  setTravelDeparturePose();
  state.enemyShips = [];
  state.bullets = [];
  setStatus(
    plan.jumpCount === 1
      ? `Jump drive spooling for ${SECTORS[targetSectorId].name}.`
      : `Course plotted for ${SECTORS[targetSectorId].name}. ${jumpCountLabel(plan.jumpCount)} chained in one burn.`,
    { tag: "Jump" },
  );
  setHint(
    plan.jumpCount === 1
      ? "Drive spool live. Hold together until the stars stretch thin."
      : `${plan.waypointLabel}. Burn ${plan.fuelCost} fuel and stay strapped in until final arrival.`,
  );
}

function openStarmap(returnMode = state.mode === "dock" ? "dock" : "flight", selection = null) {
  state.starmapReturnMode = returnMode;
  state.mode = "starmap";
  state.starmapSelection = selection && SECTORS[selection] ? selection : (selectedStarmapSectorId() || state.currentSectorId);
  syncStarmapMenuIndex();
  setStatus(`Starmap open over ${currentSector().name}.`);
  setHint(
    state.player.loanerHull
      ? `Chart open. ${hyperspaceLockText()}. Buy or swap into a real hull before leaving ${currentSector().name}.`
      : "Chart open. Sweep discovered systems with the stick or D-pad, south plots a full course, north toggles the chart, and B exits.",
  );
}

function closeStarmap() {
  if (state.starmapReturnMode === "flight") {
    state.mode = "flight";
    setStatus(`${currentSector().name} lane active.`, { log: false });
    setHint(state.autopilot.enabled
      ? "Chill mode is holding a gentle orbit. Left bumper toggles it off, or touch the stick to take over."
      : standardFlightHint());
    return;
  }
  enterDockMode(`Chart closed at ${currentSector().name}.`, { dockEvent: false });
}

function openDockScreen(screen) {
  state.previousDockIndex = state.selectedMenuIndex;
  state.dockScreen = screen;
  state.selectedMenuIndex = 0;
  if (screen === "contracts") {
    setHint("Unread contacts light up here. Open a thread with A, then answer from inside the conversation.");
  } else if (screen === "contract-thread") {
    resetThreadViewport(true);
    setHint("Up and down scroll the thread. Left and right move your reply. A sends and B returns to the inbox.");
  } else if (screen === "archive") {
    setHint("Browse recovered lore, berth files, and story dossiers. A opens a file, B returns to the command deck.");
  } else if (screen === "ships") {
    setHint("Buy hulls, switch flagship, and sell escorts from one fleet screen. B returns to the command deck.");
  }
}

function closeDockScreen() {
  if (state.dockScreen === "contract-thread") {
    state.dockScreen = "contracts";
    state.selectedMenuIndex = 0;
    resetThreadViewport(true);
    setHint("Unread messages are waiting here when contacts have something new.");
    return;
  }
  state.dockScreen = "root";
  state.selectedMenuIndex = state.previousDockIndex || 0;
  setHint("Use the command deck to trade, refit, browse contracts, or push back into the lane. B undocks from here.");
}

function factionCodexEntries() {
  return [
    {
      id: "faction:authority",
      category: "Faction",
      title: "Central Authority",
      meta: "Faction file • Core power",
      copy: "The dominant core-state power. They control strict lanes, patrol scans, and the paperwork wall between frontier life and systems like Sol.",
      tags: ["Lawful", "Core", hasSectorPermit("coreTransit") ? "Core Transit Approved" : "Core Transit Locked"],
      image: archiveArt("faction:authority"),
      imageAlt: "Central Authority archive art",
    },
    {
      id: "faction:frontier",
      category: "Faction",
      title: "Frontier Union",
      meta: "Faction file • Working coalition",
      copy: "A lawful regional bloc built from workers, convoy organizers, and pragmatic local governments that cannot wait for core approval.",
      tags: ["Frontier", "Lawful", repLabel(factionReputation("frontier"))],
      image: archiveArt("faction:frontier"),
      imageAlt: "Frontier Union archive art",
    },
    {
      id: "faction:independent",
      category: "Faction",
      title: "Independents",
      meta: "Faction file • Dockside resilience",
      copy: "Stations and worlds that survive by hustle, salvage, and practical deals. Grey Exchange sits in this orbit of half-legal resilience.",
      tags: ["Home", "Open", repLabel(factionReputation("independent"))],
      image: archiveArt("faction:independent"),
      imageAlt: "Independents archive art",
    },
    {
      id: "faction:nightglass",
      category: "Faction",
      title: "Nightglass Syndicate",
      meta: "Faction file • Gray broker web",
      copy: "A gray-market broker web that trades in introductions, sealed packets, and plausible deniability. Tau Ceti sits deeper in their trusted routes.",
      tags: ["Gray", hasSectorPermit("nightglassTransit") ? "Transit Key Held" : "Transit Key Locked", repLabel(factionReputation("syndicate"))],
      image: archiveArt("faction:nightglass"),
      imageAlt: "Nightglass Syndicate archive art",
    },
    {
      id: "faction:pirate",
      category: "Faction",
      title: "Dust Pirates",
      meta: "Faction file • Raider culture",
      copy: "Fragmented raider packs and opportunists who hit soft traffic, haunt salvage lanes, and thrive where patrol coverage falls apart.",
      tags: ["Pirate", "Boarding", repLabel(factionReputation("pirate"))],
      image: archiveArt("faction:pirate"),
      imageAlt: "Dust Pirates archive art",
    },
  ];
}

function archiveUnreadCount() {
  return Array.from(new Set(state.archiveUnreadIds || [])).length;
}

function markArchiveEntryRead(entryId) {
  state.archiveUnreadIds = (state.archiveUnreadIds || []).filter((id) => id !== entryId);
}

function archiveCategoryWeight(category) {
  const weights = {
    Primer: 0,
    Faction: 1,
    Sector: 2,
    Contact: 3,
    History: 4,
  };
  return weights[category] ?? 9;
}

function archivePrimerEntries() {
  return [
    {
      id: "primer:cluster",
      category: "Primer",
      title: "Near-Lane Primer",
      meta: "Primer • Chained short-hop space",
      copy: "This cluster runs on chained jumps, local trust, and stations that can never afford to be merely picturesque. Cheap hulls creep from berth to berth, richer ships burn whole routes at once, and everybody remembers who delivered when the lanes got thin.",
      tags: ["Primer", "Routes", "Working Space"],
      image: archiveArt("primer:cluster"),
      imageAlt: "Near-lane primer art",
    },
    {
      id: "primer:jumpwake",
      category: "Primer",
      title: "Jumpwake Lexicon",
      meta: "Primer • Dockside language",
      copy: "Captains in these lanes talk about berth heat, clean paper, hot packets, and who still answers when a station starts to wobble. Freight is never just freight for long; it is reputation, politics, and survival wearing cargo straps.",
      tags: ["Primer", "Culture", "Dockside"],
      image: archiveArt("primer:jumpwake"),
      imageAlt: "Jumpwake lexicon art",
    },
  ];
}

function sectorRumorList(sectorId) {
  return SECTOR_ARCHIVE[sectorId]?.rumors || [];
}

function latestRumorForSector(sectorId) {
  const rumors = sectorRumorList(sectorId);
  const heard = Math.max(0, Math.min(rumors.length, Number(state.sectorRumorProgress?.[sectorId] || 0)));
  return heard ? rumors[heard - 1] : "";
}

function nextSectorRumor(sectorId) {
  const rumors = sectorRumorList(sectorId);
  const heard = Math.max(0, Number(state.sectorRumorProgress?.[sectorId] || 0));
  if (heard >= rumors.length) return "";
  return rumors[heard];
}

function sectorArchiveEntries() {
  return state.visitedSectors
    .filter((sectorId) => SECTORS[sectorId] && SECTOR_ARCHIVE[sectorId])
    .map((sectorId) => {
      const sector = SECTORS[sectorId];
      const archive = SECTOR_ARCHIVE[sectorId];
      const rumorsHeard = Math.max(0, Math.min(archive.rumors.length, Number(state.sectorRumorProgress?.[sectorId] || 0)));
      const latestRumor = latestRumorForSector(sectorId);
      return {
        id: `sector:${sectorId}`,
        category: "Sector",
        title: archive.title,
        meta: `Sector file • ${sector.name}`,
        copy: `${archive.copy}${latestRumor ? ` Latest berth talk logged: ${latestRumor}` : ""}`,
        tags: [
          factionName(sector.faction),
          sector.legality,
          archive.focus,
          `${rumorsHeard}/${archive.rumors.length} whispers logged`,
        ],
        image: sectorMenuArt(sectorId),
        imageAlt: `${sector.name} berth art`,
      };
    });
}

function contactArchiveStageNote(contactId) {
  if (contactId === "independent-mara-kade") {
    if (state.contactArcs.mara.stage === "resolved") return "She now treats you like part of Grey Exchange's inner continuity, not just another captain renting courage by the shift.";
    if (state.contactArcs.mara.completed.includes("mara-dockside-whisper")) return "Her requests have shifted from proving yourself useful to proving you can be trusted with her introductions.";
  }
  if (contactId === "union-juno-vale") {
    if (state.contactArcs.juno.stage === "resolved") return "Juno now files you mentally with the captains who actually alter outcomes instead of merely transporting excuses.";
    if (state.contactArcs.juno.completed.includes("juno-convoy-proof")) return "Your work turned one delayed convoy into documentary pressure, which is exactly the kind of leverage dispatchers respect.";
  }
  if (contactId === "salvage-dax-brindle") {
    if (state.contactArcs.dax.stage === "resolved") return "Dax now speaks to you like someone capable of recovering memory, not merely metal.";
    if (state.contactArcs.dax.completed.includes("dax-ledger-fragment")) return "The ledger fragment changed how he talks to you: less scavenger, more co-conspirator in keeping inconvenient history alive.";
  }
  if (contactId === "nightglass-vey-neral") {
    if (state.factionArc.path === "syndicate" && state.factionArc.stage === "resolved") return "Nightglass has already tested you and found you composable under pressure, which is about as close to affection as Vey gets.";
    if (hasSectorPermit("nightglassTransit")) return "Holding a Nightglass transit key means Vey can no longer pretend you are only an outside courier.";
  }
  if (contactId === "core-ilya-sen") {
    if (state.coreArc.stage === "resolved") return "Ilya now has to file you as part of the record instead of a frontier irregular temporarily cluttering it.";
    if (hasSectorPermit("coreTransit")) return "Core transit clearance moved you from background traffic into the category of captains worth monitoring closely.";
  }
  if (contactId === "bounty-marshal-tovin") {
    if (factionReputation("authority") >= 10) return "Tovin's respect reads as shorter sentences and fewer warnings, which is probably the warmest version available.";
  }
  return "";
}

function knownArchiveContactIds() {
  const ids = new Set();
  if (state.visitedSectors.includes("grey_exchange") || state.contactArcs.mara.stage !== "intro") ids.add("independent-mara-kade");
  if (state.visitedSectors.includes("union_harbor") || state.contactArcs.juno.stage !== "intro") ids.add("union-juno-vale");
  if (state.visitedSectors.includes("cinder_wake") || state.contactArcs.dax.stage !== "intro") ids.add("salvage-dax-brindle");
  if (state.visitedSectors.some((sectorId) => ["ember_market", "tau_ceti", "mirage_verge"].includes(sectorId)) || state.factionArc.path === "syndicate" || hasSectorPermit("nightglassTransit")) ids.add("nightglass-vey-neral");
  if (state.visitedSectors.some((sectorId) => ["authority_gate", "sol", "sirius"].includes(sectorId)) || state.coreArc.stage !== "locked" || hasSectorPermit("coreTransit")) ids.add("core-ilya-sen");
  if (state.visitedSectors.some((sectorId) => ["authority_gate", "sirius"].includes(sectorId)) || state.activeContracts.some((contract) => contract.type === "bounty")) ids.add("bounty-marshal-tovin");
  return Array.from(ids);
}

function contactArchiveEntries() {
  return knownArchiveContactIds()
    .map((contactId) => {
      const archive = CONTACT_ARCHIVE[contactId];
      if (!archive) return null;
      const stageNote = contactArchiveStageNote(contactId);
      const relationship = missionThreadRelationshipState({ id: contactId });
      return {
        id: `contact:${contactId}`,
        category: "Contact",
        title: archive.title,
        meta: `Contact file • ${archive.role}`,
        copy: `${archive.copy}${stageNote ? ` ${stageNote}` : ""}`,
        tags: [archive.tags[0], archive.tags[1], archive.tags[2], relationship?.label].filter(Boolean),
        image: archive.portrait,
        imageAlt: `${archive.title} portrait`,
      };
    })
    .filter(Boolean);
}

function storyArchiveEntries() {
  const entries = [];
  if (hasCompletedContract("mystery-relief-freight")) {
    entries.push({
      id: "history:relief-freight-irregularity",
      category: "History",
      title: "Relief Freight Irregularity",
      meta: "History file • Contradictory paperwork",
      copy: "The so-called relief freight into Union Harbor moved under signatures that arrived too early and courtesies that landed too cleanly. Mara called it necessary, Juno called it compromised, and Ilya called it routine in a tone that made routine sound criminal.",
      tags: ["Mystery", "Relief", "Registry"],
    });
  }
  if (hasCompletedContract("mystery-manifest-anomaly")) {
    entries.push({
      id: "history:forged-registry-chain",
      category: "History",
      title: "Forged Registry Chain",
      meta: "History file • Administrative overlap",
      copy: "The manifest addendum proved someone could create an official-looking correction before the dispute it supposedly answered had even entered the queue. That implies hidden overlap between registry staff, broker networks, and whoever still benefits from making certain cargo look civic after the fact.",
      tags: ["Mystery", "Authority", "Nightglass"],
    });
  }
  if (hasCompletedContract("mystery-escort-trace")) {
    entries.push({
      id: "history:saint-radiant-trace",
      category: "History",
      title: "Saint Radiant Trace",
      meta: "History file • Missing escort",
      copy: "Saint Radiant keeps appearing in salvage fragments, escort paperwork, and nervous conversations that end one sentence too early. The useful theory is not that the ship vanished, but that too many institutions agreed to describe its disappearance differently.",
      tags: ["Mystery", "Escort", "Overlap"],
    });
  }
  if (hasCompletedContract("mystery-ninth-berth")) {
    entries.push({
      id: "history:ninth-berth",
      category: "History",
      title: "Ninth Berth",
      meta: "History file • Unofficial infrastructure",
      copy: "Ninth Berth is either a hidden dock, a protected fiction, or a shared euphemism for a logistics channel enemies all use when official maps become liabilities. The important part is that Mara, Vey, and Ilya all recognize the phrase while pretending they should not.",
      tags: ["Mystery", "Ninth Berth", "Hidden Overlap"],
    });
  }
  if (state.factionArc.path === "syndicate") {
    entries.push({
      id: "history:nightglass-introduction",
      category: "History",
      title: "Nightglass Introduction",
      meta: "History file • Broker politics",
      copy: "Accepting Nightglass work means choosing a world where courtesy is a delivery mechanism for leverage. The Syndicate does not need territorial flags everywhere because it survives by controlling introductions, timing, and what can safely remain unofficial.",
      tags: ["Nightglass", "Choice", "Gray"],
    });
  }
  if (state.factionArc.path === "authority") {
    entries.push({
      id: "history:authority-briefing",
      category: "History",
      title: "Authority Briefing Culture",
      meta: "History file • Lawful pressure",
      copy: "Choosing the Authority side means stepping into a culture that mistakes documentation for neutrality. Their patrols believe every lane becomes safer when the right people hold the paperwork, even when frontier captains know survival often started without permission.",
      tags: ["Authority", "Choice", "Lawful"],
    });
  }
  if (hasSectorPermit("nightglassTransit")) {
    entries.push({
      id: "history:nightglass-transit",
      category: "History",
      title: "Nightglass Transit Keys",
      meta: "History file • Quiet access",
      copy: "A Nightglass transit key is not just travel clearance; it is proof that a gray network has decided your ship is worth trusting with routes it normally hides inside rumor and debt.",
      tags: ["Permit", "Nightglass", "Transit"],
    });
  }
  if (hasSectorPermit("coreTransit")) {
    entries.push({
      id: "history:core-transit",
      category: "History",
      title: "Core Transit Clearance",
      meta: "History file • Official access",
      copy: "Core transit approval does more than open Sol-side routes. It marks your registry as relevant to the people still trying to define which systems count as central and which survive only by tolerated necessity.",
      tags: ["Permit", "Authority", "Transit"],
    });
  }
  if (state.coreArc.completed.includes("core-arc-sol-briefing")) {
    entries.push({
      id: "history:old-light-charter",
      category: "History",
      title: "Old Light Charter",
      meta: "History file • Sol to Barnard",
      copy: "The charter packet from Sol to Barnard proved the old relay web still answered when the core actually asked plainly enough. That alone says a lot about whose labor kept nearby space alive after official enthusiasm cooled.",
      tags: ["Core Arc", "Sol", "Barnard"],
      image: archiveArt("history:old-light-charter"),
      imageAlt: "Old Light Charter archive art",
    });
  }
  if (state.coreArc.completed.includes("core-arc-barnard-ledger")) {
    entries.push({
      id: "history:relay-ledger",
      category: "History",
      title: "Relay Ledger Recovery",
      meta: "History file • Independent memory",
      copy: "Barnard's ledger showed that independent relay crews carried whole stretches of the cluster through lean years the official record prefers to narrate as orderly decline. It was logistics as civil resistance, logged in grease and careful handwriting.",
      tags: ["Core Arc", "Barnard", "Ledger"],
      image: archiveArt("history:relay-ledger"),
      imageAlt: "Relay ledger archive art",
    });
  }
  if (state.coreArc.completed.includes("core-arc-centauri-relay")) {
    entries.push({
      id: "history:centauri-vouch",
      category: "History",
      title: "Centauri Freight Vouch",
      meta: "History file • Family leverage",
      copy: "When the Centauri freight families put their name behind a packet, they are doing more than forwarding cargo. They are staking generational credibility on a version of the region's history that the core can no longer dismiss as frontier embellishment.",
      tags: ["Core Arc", "Centauri", "Families"],
    });
  }
  if (state.coreArc.stage === "resolved") {
    entries.push({
      id: "history:blue-archive-hearing",
      category: "History",
      title: "Blue Archive Hearing",
      meta: "History file • Rewritten regional story",
      copy: "The Blue Archive hearing closed with your courier chain embedded in the official argument. The nearby stars are harder to describe as peripheral once their relay labor is on the record and attached to policy language the core now has to live with.",
      tags: ["Core Arc", "Sirius", "Archive"],
      image: archiveArt("history:blue-archive-hearing"),
      imageAlt: "Blue Archive hearing art",
    });
  }
  if (state.contactArcs.mara.stage === "resolved") {
    entries.push({
      id: "history:mara-open-door",
      category: "History",
      title: "Grey Exchange Open Door",
      meta: "History file • Broker trust",
      copy: "Mara's trust matters because Grey Exchange trust is infrastructure in disguise. Her introductions link captains, yards, and independent rooms that stay alive only when enough people still believe each other under pressure.",
      tags: ["Character", "Mara", "Independents"],
    });
  }
  if (state.contactArcs.dax.stage === "resolved") {
    entries.push({
      id: "history:dax-red-ledger",
      category: "History",
      title: "Red Ledger Fragments",
      meta: "History file • Salvage memory",
      copy: "Dax's ledger trail reframed salvage as archival work. Some wrecks do not merely leak cargo or parts; they leak missing names, erased movements, and proof that certain losses were curated long before they were mourned.",
      tags: ["Character", "Dax", "Salvage"],
    });
  }
  if (state.contactArcs.juno.stage === "resolved") {
    entries.push({
      id: "history:juno-union-voice",
      category: "History",
      title: "Union Voice Packet",
      meta: "History file • Dispatch pressure",
      copy: "Juno's packet chain turned routine relief traffic into a public argument about responsibility. It is a reminder that in working ports, policy often arrives disguised as one exhausted dispatcher refusing to let a delay vanish into procedure.",
      tags: ["Character", "Juno", "Frontier"],
    });
  }
  return entries;
}

function trackedArchiveEntries() {
  return [...sectorArchiveEntries(), ...contactArchiveEntries(), ...storyArchiveEntries()];
}

function archiveEntries() {
  const unread = new Set(state.archiveUnreadIds || []);
  const currentSectorEntryId = `sector:${state.currentSectorId}`;
  const entries = [...archivePrimerEntries(), ...factionCodexEntries(), ...trackedArchiveEntries()];
  const seen = new Set();
  return entries
    .filter((entry) => {
      if (!entry?.id || seen.has(entry.id)) return false;
      seen.add(entry.id);
      return true;
    })
    .sort((left, right) => {
      const unreadDelta = Number(unread.has(right.id)) - Number(unread.has(left.id));
      if (unreadDelta) return unreadDelta;
      const currentDelta = Number(right.id === currentSectorEntryId) - Number(left.id === currentSectorEntryId);
      if (currentDelta) return currentDelta;
      const categoryDelta = archiveCategoryWeight(left.category) - archiveCategoryWeight(right.category);
      if (categoryDelta) return categoryDelta;
      return left.title.localeCompare(right.title);
    });
}

function archiveEntryById(entryId) {
  return archiveEntries().find((entry) => entry.id === entryId) || null;
}

function refreshArchiveUnlocks(options = {}) {
  const tracked = trackedArchiveEntries();
  const known = new Set(state.archiveKnownIds || []);
  const unread = new Set(state.archiveUnreadIds || []);
  const newEntries = [];
  for (const entry of tracked) {
    if (!entry?.id || known.has(entry.id)) continue;
    known.add(entry.id);
    if (options.markUnread !== false) unread.add(entry.id);
    newEntries.push(entry);
  }
  state.archiveKnownIds = Array.from(known);
  state.archiveUnreadIds = Array.from(unread);
  if (!options.silent && newEntries.length) {
    const summary = newEntries.length === 1
      ? newEntries[0].title
      : `${newEntries[0].title} and ${newEntries.length - 1} more`;
    pushMessageLog(`Archive updated: ${summary}.`, "Archive");
  }
  return newEntries;
}

function advanceSectorRumor(sectorId, options = {}) {
  const rumor = nextSectorRumor(sectorId);
  if (!rumor) return "";
  state.sectorRumorProgress[sectorId] = Number(state.sectorRumorProgress[sectorId] || 0) + 1;
  if (!options.silent) {
    pushMessageLog(`Dock rumor at ${SECTORS[sectorId]?.name || "this berth"}: ${rumor}`, "Rumor");
  }
  return rumor;
}

function recordDockLore(options = {}) {
  const sectorId = state.currentSectorId;
  if (!SECTORS[sectorId]) return { rumor: "", newEntries: [] };
  if (!state.visitedSectors.includes(sectorId)) {
    state.visitedSectors.push(sectorId);
  }
  const rumor = advanceSectorRumor(sectorId, options);
  const newEntries = refreshArchiveUnlocks(options);
  return { rumor, newEntries };
}

function archiveOverviewCopy() {
  const sectors = sectorArchiveEntries().length;
  const contacts = contactArchiveEntries().length;
  const history = storyArchiveEntries().length;
  return `Recovered files: ${archiveEntries().length}. Docked sectors logged: ${sectors}/${Object.keys(SECTORS).length}. Known figures: ${contacts}. Historical notes recovered: ${history}.`;
}

function safePopupAnchor(style, anchorX = WIDTH * 0.5, anchorY = HEIGHT * 0.5) {
  const inset = style === "boarding" ? 120 : 56;
  return {
    x: clamp(anchorX, inset, WIDTH - inset),
    y: clamp(anchorY, inset, HEIGHT - inset),
  };
}

function openPopup(config) {
  const anchor = safePopupAnchor(config.style || "modal", config.anchorX, config.anchorY);
  state.popup = {
    title: normalizeUiText(config.title),
    copy: normalizeUiText(config.copy),
    options: (config.options || []).map((option) => ({
      ...option,
      label: normalizeUiText(option.label),
      meta: normalizeUiText(option.meta),
    })),
    selectedIndex: 0,
    style: config.style || "modal",
    anchorX: anchor.x,
    anchorY: anchor.y,
  };
  state.selectedMenuIndex = 0;
}

function closePopup() {
  const pad = activePad();
  state.popup = null;
  keyboard.fire = false;
  keyboard.pause = false;
  keyboard.back = false;
  keyboard.interact = false;
  state.actionLockUntil = performance.now() + 220;
  if (pad) {
    state.buttonSnapshot[`pad-${pad.index}-confirm-menu`] = buttonPressed(pad, 0);
    state.buttonSnapshot[`pad-${pad.index}-fire`] = buttonPressed(pad, 0);
    state.buttonSnapshot[`pad-${pad.index}-back-menu`] = buttonPressed(pad, 1);
    state.buttonSnapshot[`pad-${pad.index}-interact`] = buttonPressed(pad, 2);
  }
}

function nextEncounterContractId(prefix) {
  state.encounterCounter += 1;
  return `${prefix}-${state.encounterCounter}`;
}

function spawnEncounterShip(type, options = {}) {
  const angle = Math.random() * Math.PI * 2;
  const distanceOut = 120 + Math.random() * 90;
  const x = state.player.x + Math.cos(angle) * distanceOut;
  const y = state.player.y + Math.sin(angle) * distanceOut;
  spawnEnemy(type, x, y, options);
  return state.enemyShips[state.enemyShips.length - 1];
}

function addEncounterContract(contract) {
  if (state.activeContracts.length >= 3) {
    setStatus("Dispatch board is full, so the encounter offer slipped away.");
    return false;
  }
  state.activeContracts.push({ ...contract, threadId: contract.threadId || missionThreadIdForContract(contract) });
  if ((contract.type === "cargo" || contract.type === "smuggling") && contract.commodityId) {
    if (!addCargo(contract.commodityId, contract.amount)) {
      state.activeContracts = state.activeContracts.filter((entry) => entry.id !== contract.id);
      setStatus("Not enough cargo room for the encounter offer.");
      return false;
    }
  }
  return true;
}

function activeSalvageContractsForSector(sectorId = state.currentSectorId) {
  return state.activeContracts.filter((contract) => (
    contract.type === "salvage"
    && contract.destinationId === sectorId
    && (state.player.missionProgress[contract.id] || 0) < contract.requiredBoards
  ));
}

function spawnMissionSalvageShip(contract) {
  if (!contract) return null;
  if (state.enemyShips.some((ship) => ship.missionContractId === contract.id)) {
    return null;
  }
  const type = currentSector().legality === "gray" || currentSector().faction === "pirate" ? "smuggler" : "trader";
  const ship = spawnEncounterShip(type, {
    disposition: "neutral",
    disabled: true,
  });
  ship.disabled = true;
  ship.contactState = "boardable";
  ship.hull = Math.max(14, ship.hull * 0.35);
  ship.shield = 0;
  ship.vx = 0;
  ship.vy = 0;
  ship.missionContractId = contract.id;
  ship.cargo = type === "smuggler" ? { contraband: 1, lux: 1 } : { ore: 2, meds: 1 };
  return ship;
}

function ensureMissionSalvageTargets(reason = "flight") {
  const salvageContracts = activeSalvageContractsForSector();
  if (!salvageContracts.length) return 0;
  let spawned = 0;
  for (const contract of salvageContracts) {
    const ship = spawnMissionSalvageShip(contract);
    if (!ship) continue;
    spawned += 1;
  }
  if (spawned > 0) {
    const when = reason === "arrival" ? "on arrival" : reason === "undock" ? "after undocking" : "in the lane";
    setStatus(`Salvage contact marked ${when}. A disabled ship is drifting within boarding range.`, { tag: "Contract" });
  }
  return spawned;
}

function offerDistressEncounter() {
  const payout = 90 + Math.round(currentSector().danger * 80);
  if (state.enemyShips.some((ship) => ship.distressEncounter)) {
    setStatus("A distress beacon is already drifting nearby. Close in and board if you want to answer it.", { tag: "Encounter" });
    return;
  }
  const ship = spawnEncounterShip("trader", {
    disposition: "neutral",
    disabled: true,
    hull: 42,
    shield: 0,
    cargo: { meds: 1, food: 1 },
  });
  ship.disabled = true;
  ship.contactState = "boardable";
  ship.vx = 0;
  ship.vy = 0;
  ship.distressEncounter = {
    payout,
    factionId: currentSector().faction === "pirate" ? "independent" : currentSector().faction,
  };
  setStatus("Distress beacon tagged in the lane. If you want the story, get close and hit BOARD.", { tag: "Encounter" });
}

function showDistressBoardingResolution(ship) {
  const distress = ship.distressEncounter;
  if (!distress) return;
  const anchorX = (state.player.x + ship.x) * 0.5;
  const anchorY = (state.player.y + ship.y) * 0.5 - 28;
  openPopup({
    title: "Distress Call",
    copy: "The ship is running on fumes and panic. A shaken civilian crew needs immediate help stabilizing the hull and getting a beacon relay to traffic control.",
    style: "boarding",
    anchorX,
    anchorY,
    options: [
      {
        label: "Render Aid",
        meta: `${formatCredits(distress.payout)} | Build goodwill`,
        confirm() {
          closePopup();
          state.player.credits += distress.payout;
          modifyReputation(distress.factionId, 1);
          finalizeBoardingRemoval(ship, "#79d8ff", 14);
          showBanner("Distress Answered", "The lane will remember that you showed up.", 2.8);
          setStatus(`Rescue completed. ${formatCredits(distress.payout)} transferred by grateful traffic control.`, { tag: "Encounter" });
        },
      },
      {
        label: "Back Away",
        meta: "Leave the crew and return to your ship",
        confirm() {
          closePopup();
          setStatus("You pull your team back and leave the distress ship drifting.");
        },
      },
    ],
  });
}

function offerSalvageEncounter() {
  openPopup({
    title: "Salvage Ping",
    copy: "A scanner return shows a drifting hull with weak power and no clean registry. It could be profit, or trouble wrapped in profit.",
    options: [
      {
        label: "Investigate",
        meta: "Spawn a disabled ship in boarding range",
        confirm() {
          closePopup();
          const ship = spawnMissionSalvageShip({ id: nextEncounterContractId("salvage-drift") });
          setStatus(`Salvage contact found. The ${HULLS[ship.hullId].name} is drifting and ready for a boarding team.`);
        },
      },
      {
        label: "Leave It",
        meta: "Keep the lane moving",
        confirm() {
          closePopup();
          setStatus("You mark the salvage ping and move on.");
        },
      },
    ],
  });
}

function offerConvoyEncounter() {
  const destinationId = currentSector().neighbors.find((id) => lawfulSector(SECTORS[id])) || currentSector().neighbors[0];
  const contract = {
    id: nextEncounterContractId("encounter-convoy"),
    type: "courier",
    title: `Convoy dispatch to ${SECTORS[destinationId].name}`,
    copy: "Traffic control is short a reliable captain and wants a fast packet moved under convoy timing.",
    reward: missionRewardBase(destinationId) + 132,
    destinationId,
    factionId: currentSector().faction,
    tags: ["Encounter", "Convoy"],
  };
  openPopup({
    title: "Convoy Dispatch",
    copy: "A convoy marshal is looking for one more clean transponder to move priority freight before the window closes.",
    options: [
      {
        label: "Take It",
        meta: `${formatCredits(contract.reward)} | Fast lawful work`,
        confirm() {
          closePopup();
          if (addEncounterContract(contract)) {
            setStatus(`Encounter job accepted: ${contract.title}.`, { tag: "Encounter" });
          }
        },
      },
      {
        label: "Pass",
        meta: "Stay independent",
        confirm() {
          closePopup();
          setStatus("You wave off the convoy marshal.");
        },
      },
    ],
  });
}

function offerShadowEncounter() {
  const destinationId = currentSector().neighbors.find((id) => SECTORS[id].legality !== "strict") || currentSector().neighbors[0];
  const contract = {
    id: nextEncounterContractId("encounter-shadow"),
    type: "smuggling",
    title: `Shadow handoff to ${SECTORS[destinationId].name}`,
    copy: "A broker has one sealed packet and very little patience. Deliver it quietly and somebody important will notice.",
    reward: missionRewardBase(destinationId) + 188,
    commodityId: "contraband",
    amount: 1,
    destinationId,
    factionId: "syndicate",
    contraband: true,
    tags: ["Encounter", "Shadow"],
  };
  openPopup({
    title: "Shadow Broker",
    copy: "A Nightglass broker pings your transponder directly. They have a hot package and only trust captains who look flexible.",
    options: [
      {
        label: "Take Packet",
        meta: `${formatCredits(contract.reward)} | Contraband run`,
        confirm() {
          closePopup();
          if (addEncounterContract(contract)) {
            setStatus(`Hot package accepted for ${SECTORS[destinationId].name}.`, { tag: "Encounter" });
          }
        },
      },
      {
        label: "Decline",
        meta: "Stay out of it",
        confirm() {
          closePopup();
          setStatus("The broker ghosts your channel.");
        },
      },
    ],
  });
}

function offerPirateEncounter() {
  openPopup({
    title: "Pirate Bait",
    copy: "A dead transponder suddenly wakes up and starts walking your vector. Raider signatures are tightening around it.",
    options: [
      {
        label: "Punch Through",
        meta: "Fight an ambush for a shot at salvage",
        confirm() {
          closePopup();
          for (let index = 0; index < 2; index += 1) {
            spawnEncounterShip("pirate", { disposition: "hostile" });
          }
          setStatus("Ambush confirmed. Raiders are burning in hot.", { tag: "Encounter" });
        },
      },
      {
        label: "Run Cold",
        meta: "Bleed speed and slip away",
        confirm() {
          closePopup();
          state.player.vx *= 0.45;
          state.player.vy *= 0.45;
          setStatus("You run dark and let the trap drift past.");
        },
      },
    ],
  });
}

function maybeTriggerLaneEncounter(dt) {
  if (state.mode !== "flight" || state.popup || state.scanState || state.encounterTriggeredThisFlight || playerIsInEscapePod()) return;
  state.encounterCooldown -= dt;
  if (state.encounterCooldown > 0) return;

  const options = [];
  const sector = currentSector();
  options.push({ weight: 1.8, run: offerDistressEncounter });
  options.push({ weight: sectorCondition(sector.id)?.id === "salvage_drift" ? 3.4 : 1.4, run: offerSalvageEncounter });
  if (lawfulSector(sector) && dockAccessState() !== "restricted") {
    options.push({ weight: 2.3, run: offerConvoyEncounter });
  }
  if (sector.legality === "gray" || sector.faction === "pirate" || hasSyndicateAccess()) {
    options.push({ weight: 2.1, run: offerShadowEncounter });
  }
  if (sector.danger >= 0.45 || sectorCondition(sector.id)?.id === "pirate_raids") {
    options.push({ weight: 2.4, run: offerPirateEncounter });
  }

  state.encounterTriggeredThisFlight = true;
  weightedRandom(options).run();
}

function nearestDisabledShip() {
  let match = null;
  let best = Infinity;
  for (const ship of state.enemyShips) {
    if (!ship.disabled) continue;
    if (ship.x < 26 || ship.x > WIDTH - 26 || ship.y < 26 || ship.y > HEIGHT - 26) continue;
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
  normalizeEscortHangar();
  if (state.escortHangar.length >= MAX_ESCORTS) {
    setStatus("Escort roster is full. Clear a slot before trying to capture another ship.");
    return;
  }
  const escort = createEscortRecord(ship.hullId, { origin: "capture", captures: 1 });
  state.escortHangar.push(escort);
  modifyReputation(ship.faction === "pirate" ? "pirate" : ship.faction, ship.faction === "pirate" ? -1 : -2);
  finalizeBoardingRemoval(ship, "#9ef59f", 18);
  setStatus(`${escortFullLabel(escort)} captured and folded into your escort roster.`);
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
    createBurst(ship.x, ship.y, "#ff8a8a", { radius: 16, grow: 24, life: 0.3, fillAlpha: 0.18, lineWidth: 2.2 });
    addScreenShake(8);
    state.enemyShips = state.enemyShips.filter((entry) => entry.id !== ship.id);
    setStatus("Boarding failed. You got the team back, but not clean.");
    showBanner("Boarding Repelled", "The team got out, but the lane is rougher for it now.", 1.8);
    if (state.player.hull <= 0) {
      loseShip();
    }
    return;
  }
  if (ship.distressEncounter) {
    showDistressBoardingResolution(ship);
    setStatus("Boarding succeeded. The distress crew is waiting on your call.");
    showBanner("Distress Secured", "You reached the ship. Decide how involved you want to get.", 1.7);
    return;
  }
  showBoardingResolution(ship);
  setStatus(`Boarding succeeded. ${HULLS[ship.hullId].name} is secure. Choose the outcome.`);
  showBanner("Boarding Locked", `${HULLS[ship.hullId].name} is yours to strip, claim, or scuttle.`, 1.7);
}

function loseShip() {
  if (state.escapeSequence) return;
  const destroyedHullId = state.player.hullId;
  state.player.hull = 0;
  state.player.shield = 0;
  state.player.vx = 0;
  state.player.vy = 0;
  state.player.shieldFlash = 0;
  state.player.fireCooldown = 0;
  state.popup = null;
  state.scanState = null;
  state.actionLockUntil = performance.now() + 900;
  failContracts((contract) => contract.type === "courier", "Courier packet lost during pod ejection. Dispatch marked the job failed.");
  createSpark(state.player.x, state.player.y, "#ffcf74", 34);
  createSpark(state.player.x, state.player.y, "#ff8a8a", 26);
  createBurst(state.player.x, state.player.y, "#ffcf74", { radius: 22, grow: 42, life: 0.44, fillAlpha: 0.24, lineWidth: 2.8 });
  addScreenShake(18);
  showBanner("Hull Lost", "Escape pod launched. Hold tight while station control pulls you in.", 2.6);
  setStatus(`Hull breach. Escape pod away from the ${HULLS[destroyedHullId].name}.`, { tag: "Alert" });
  setHint("Escape pod is invulnerable and auto-returning to station.");
  state.escapeSequence = {
    destroyedHullId,
    x: state.player.x,
    y: state.player.y,
    vx: Math.cos(state.player.angle + Math.PI) * 28,
    vy: Math.sin(state.player.angle + Math.PI) * 28,
    angle: state.player.angle,
    plume: 1.2,
    explosionTime: 1.15,
  };
}

function fallbackHullAfterLoss(destroyedHullId) {
  const replacement = state.escortHangar.find((escort) => escort.hullId !== destroyedHullId) || state.escortHangar[0] || null;
  if (replacement) {
    state.escortHangar = state.escortHangar.filter((escort) => escort !== replacement);
    return { hullId: replacement.hullId, label: replacement.name, source: "hangar" };
  }
  return { hullId: "dinghy", label: HULLS.dinghy.name, source: "loaner" };
}

function completeEscapeRecovery() {
  const sequence = state.escapeSequence;
  if (!sequence) return;
  const replacement = fallbackHullAfterLoss(sequence.destroyedHullId);
  const replacementCost = replacement.source === "hangar"
    ? Math.round(HULLS[replacement.hullId].sale * 0.18)
    : Math.round(HULLS[replacement.hullId].sale * 0.32);
  state.player.credits = Math.max(0, state.player.credits - replacementCost);
  state.player.hullId = replacement.hullId;
  state.player.hull = HULLS[replacement.hullId].maxHull + state.player.hullBonus;
  state.player.shield = HULLS[replacement.hullId].maxShield;
  state.player.fuel = Math.max(1, Math.min(state.player.fuel, HULLS[replacement.hullId].fuelCap));
  state.player.loanerHull = replacement.source !== "hangar";
  state.player.vx = 0;
  state.player.vy = 0;
  state.player.angle = -Math.PI / 2;
  state.escapeSequence = null;
  enterDockMode(
    replacement.source === "hangar"
      ? `Escape pod recovered. Your old ship is gone, ${formatCredits(replacementCost)} was burned on recovery and refit, and ${replacement.label} is now your flagship.`
      : `Escape pod recovered. Your old ship is gone. Dock control set you up with a patched ${replacement.label} for ${formatCredits(replacementCost)}, but it is only cleared for local traffic until you buy or swap into a real ship.`,
    { force: true },
  );
}

function updateEscapeSequence(dt) {
  const sequence = state.escapeSequence;
  if (!sequence) return;
  sequence.explosionTime = Math.max(0, sequence.explosionTime - dt);
  sequence.plume = Math.max(0, sequence.plume - dt * 0.9);
  const target = currentSector().station;
  const targetAngle = angleTo(sequence, target);
  sequence.angle = targetAngle;
  sequence.vx += Math.cos(targetAngle) * ESCAPE_POD_SPEED * dt;
  sequence.vy += Math.sin(targetAngle) * ESCAPE_POD_SPEED * dt;
  const speed = Math.hypot(sequence.vx, sequence.vy);
  if (speed > ESCAPE_POD_SPEED) {
    sequence.vx = (sequence.vx / speed) * ESCAPE_POD_SPEED;
    sequence.vy = (sequence.vy / speed) * ESCAPE_POD_SPEED;
  }
  sequence.x += sequence.vx * dt;
  sequence.y += sequence.vy * dt;

  if (distance(sequence, target) <= INTERACT_RANGE - 8) {
    completeEscapeRecovery();
  }
}

function snapshotGame() {
  normalizeEscortHangar();
  return {
    currentSectorId: state.currentSectorId,
    saveSlot: state.saveSlot,
    slotName: storedSaveSlotName(state.saveSlot),
    player: {
      hullId: state.player.hullId,
      hull: state.player.hull,
      shield: state.player.shield,
      credits: state.player.credits,
      fuel: state.player.fuel,
      loanerHull: state.player.loanerHull,
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
    permits: state.permits,
    activeContracts: state.activeContracts,
    escortHangar: state.escortHangar,
    escortRegistryCounter: state.escortRegistryCounter,
    escortCommand: state.escortCommand,
    discoveredSectors: state.discoveredSectors,
    visitedSectors: state.visitedSectors,
    sectorRumorProgress: state.sectorRumorProgress,
    archiveKnownIds: state.archiveKnownIds,
    archiveUnreadIds: state.archiveUnreadIds,
    messageLog: state.messageLog,
    factionArc: state.factionArc,
    coreArc: state.coreArc,
    contactArcs: state.contactArcs,
    intrigue: state.intrigue,
    missionThreads: state.missionThreads,
    activeMissionThreadId: state.activeMissionThreadId,
    arrivalThreadPings: state.arrivalThreadPings,
    sectorStates: state.sectorStates,
    encounterCounter: state.encounterCounter,
    savedAt: new Date().toISOString(),
  };
}

function persistGame(slot = state.saveSlot, { announce = true } = {}) {
  try {
    state.saveSlot = slot;
    window.localStorage.setItem(saveStorageKey(slot), JSON.stringify(snapshotGame()));
    if (announce) {
      setStatus(`Run saved in ${saveSlotName(slot)} at ${currentSector().name}.`, { tag: "Save" });
    }
    return true;
  } catch (_error) {
    if (announce) {
      setStatus("Save failed on this browser.");
    }
    return false;
  }
}

function saveGame(slot = state.saveSlot) {
  const saved = persistGame(slot, { announce: true });
  if (saved && typeof performance !== "undefined") {
    state.lastAutosaveAt = performance.now();
  }
  return saved;
}

function autosaveGame() {
  const saved = persistGame(state.saveSlot, { announce: false });
  if (saved && typeof performance !== "undefined") {
    state.lastAutosaveAt = performance.now();
  }
  return saved;
}

function reloadGame() {
  autosaveGame();
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("_reload", Date.now().toString());
  window.location.replace(nextUrl.toString());
}

function renameSaveSlot(slot = state.saveSlot) {
  const currentName = storedSaveSlotName(slot);
  const input = window.prompt(
    `Name for save slot ${slot + 1}. Leave blank to reset to the default label.`,
    currentName,
  );
  if (input === null) {
    setStatus("Slot rename cancelled.");
    return false;
  }

  const nextName = setStoredSaveSlotName(slot, input);
  try {
    const saved = readSavedGame(slot);
    if (saved) {
      saved.slotName = nextName;
      window.localStorage.setItem(saveStorageKey(slot), JSON.stringify(saved));
    }
  } catch (_error) {
    // Ignore slot snapshot rewrite failures; the label storage is the source of truth.
  }

  setStatus(
    nextName
      ? `Save slot ${slot + 1} renamed to ${nextName}.`
      : `Save slot ${slot + 1} reset to ${defaultSaveSlotName(slot)}.`,
  );
  return true;
}

function loadSavedGame(slot = state.saveSlot) {
  try {
    const saved = readSavedGame(slot);
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
    state.player.loanerHull = Boolean(saved.player.loanerHull);
    state.player.cargo = { ...(saved.player.cargo || {}) };
    state.player.cargoCapBonus = Number(saved.player.cargoCapBonus || 0);
    state.player.hullBonus = Number(saved.player.hullBonus || 0);
    state.player.boardSkill = Number(saved.player.boardSkill || 0.04);
    state.player.scannerLevel = Number(saved.player.scannerLevel || 0);
    state.player.weaponLevel = Number(saved.player.weaponLevel || 0);
    state.player.shieldCooldown = Number(saved.player.shieldCooldown || 0);
    state.player.shieldFlash = 0;
    state.player.bountyProgress = { ...(saved.player.bountyProgress || {}) };
    state.player.missionProgress = { ...(saved.player.missionProgress || {}) };
    state.factions = { ...state.factions, ...(saved.factions || {}) };
    state.permits = { ...state.permits, ...(saved.permits || {}) };
    state.activeContracts = Array.isArray(saved.activeContracts)
      ? saved.activeContracts.filter((contract) => contract && contract.id && contract.type && contract.destinationId)
      : [];
    state.escortHangar = Array.isArray(saved.escortHangar) ? saved.escortHangar : [];
    state.escortRegistryCounter = Math.max(1, Number(saved.escortRegistryCounter || 1));
    normalizeEscortHangar();
    state.escortCommand = saved.escortCommand || "defend";
    state.discoveredSectors = Array.isArray(saved.discoveredSectors) && saved.discoveredSectors.length ? saved.discoveredSectors : state.discoveredSectors;
    state.visitedSectors = Array.isArray(saved.visitedSectors) && saved.visitedSectors.length
      ? saved.visitedSectors.filter((sectorId) => SECTORS[sectorId])
      : [saved.currentSectorId];
    state.sectorRumorProgress = saved.sectorRumorProgress && typeof saved.sectorRumorProgress === "object"
      ? saved.sectorRumorProgress
      : {};
    state.archiveKnownIds = Array.isArray(saved.archiveKnownIds) ? saved.archiveKnownIds : [];
    state.archiveUnreadIds = Array.isArray(saved.archiveUnreadIds) ? saved.archiveUnreadIds : [];
    state.messageLog = Array.isArray(saved.messageLog) ? saved.messageLog.slice(0, MESSAGE_LOG_LIMIT) : state.messageLog;
    state.factionArc = saved.factionArc && typeof saved.factionArc === "object"
      ? {
          stage: saved.factionArc.stage || "intro",
          path: saved.factionArc.path || null,
          completed: Array.isArray(saved.factionArc.completed) ? saved.factionArc.completed : [],
        }
      : state.factionArc;
    state.coreArc = saved.coreArc && typeof saved.coreArc === "object"
      ? {
          stage: saved.coreArc.stage || "locked",
          completed: Array.isArray(saved.coreArc.completed) ? saved.coreArc.completed : [],
        }
      : state.coreArc;
    state.contactArcs = saved.contactArcs && typeof saved.contactArcs === "object"
      ? {
          mara: { stage: saved.contactArcs.mara?.stage || "intro", completed: Array.isArray(saved.contactArcs.mara?.completed) ? saved.contactArcs.mara.completed : [] },
          dax: { stage: saved.contactArcs.dax?.stage || "intro", completed: Array.isArray(saved.contactArcs.dax?.completed) ? saved.contactArcs.dax.completed : [] },
          juno: { stage: saved.contactArcs.juno?.stage || "intro", completed: Array.isArray(saved.contactArcs.juno?.completed) ? saved.contactArcs.juno.completed : [] },
        }
      : state.contactArcs;
    state.intrigue = saved.intrigue && typeof saved.intrigue === "object"
      ? {
          stage: saved.intrigue.stage || "dormant",
          completed: Array.isArray(saved.intrigue.completed) ? saved.intrigue.completed : [],
          flags: Array.isArray(saved.intrigue.flags) ? saved.intrigue.flags : [],
        }
      : state.intrigue;
    state.uiTextCache = {
      offer: {},
      preview: {},
    };
    state.missionThreads = saved.missionThreads && typeof saved.missionThreads === "object" ? saved.missionThreads : {};
    state.activeMissionThreadId = typeof saved.activeMissionThreadId === "string" ? saved.activeMissionThreadId : null;
    state.arrivalThreadPings = saved.arrivalThreadPings && typeof saved.arrivalThreadPings === "object" ? saved.arrivalThreadPings : {};
    state.sectorStates = saved.sectorStates && typeof saved.sectorStates === "object" ? saved.sectorStates : state.sectorStates;
    state.encounterCounter = Number(saved.encounterCounter || 0);
    if (typeof performance !== "undefined") {
      state.lastAutosaveAt = performance.now();
    }
    refreshArchiveUnlocks({ silent: true, markUnread: false });
    enterDockMode(`Loaded ${saveSlotName(slot)} in ${currentSector().name}.`, { dockEvent: false });
    return true;
  } catch (_error) {
    return false;
  }
}

function loadMostRecentGame() {
  const slot = latestSavedSlot();
  return slot === null ? false : loadSavedGame(slot);
}

function maybeAutosave(now) {
  if (!Number.isFinite(now) || now - state.lastAutosaveAt < AUTOSAVE_INTERVAL_MS) {
    return;
  }
  autosaveGame();
}

function spawnShot(origin, angle, speed, life, from, color, damage, velocityX = 0, velocityY = 0, extras = {}) {
  state.bullets.push({
    x: origin.x + Math.cos(angle) * 18,
    y: origin.y + Math.sin(angle) * 18,
    vx: Math.cos(angle) * speed + velocityX,
    vy: Math.sin(angle) * speed + velocityY,
    life,
    from,
    color,
    damage,
    ...extras,
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
  const shotColor = profile === "rail" ? "#b8e6ff" : profile === "scatter" ? "#8fe9ff" : profile === "missile" ? "#ffd37d" : "#7ad8ff";
  state.player.fireCooldown = Math.max(0.14, (profile === "rail" ? 0.62 : profile === "scatter" ? 0.42 : profile === "missile" ? 0.54 : 0.34) - state.player.weaponLevel * 0.05);
  fireWeaponPattern(
    state.player,
    state.player.angle,
    profile,
    "player",
    shotColor,
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
  createBurst(
    state.player.x + Math.cos(state.player.angle) * 16,
    state.player.y + Math.sin(state.player.angle) * 16,
    shotColor,
    {
      radius: profile === "rail" ? 12 : 9,
      grow: profile === "rail" ? 18 : 12,
      life: profile === "rail" ? 0.22 : 0.16,
      fillAlpha: profile === "rail" ? 0.16 : 0.1,
    },
  );
  if (profile === "rail") addScreenShake(2);
  if (profile === "missile") addScreenShake(1);
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
  createBurst(
    ship.x + Math.cos(aim) * 14,
    ship.y + Math.sin(aim) * 14,
    color,
    { radius: 8, grow: 10, life: 0.14, fillAlpha: 0.08, lineWidth: 1.4 },
  );
}

function escortFireCooldown(profile, command = state.escortCommand) {
  const base = profile === "rail" ? 1.55 : profile === "scatter" ? 1.02 : profile === "missile" ? 1.34 : 0.92;
  return Math.max(0.48, base + (command === "attack" ? -0.12 : command === "follow" ? 0.06 : 0.14));
}

function nearestEscortTarget(escortState) {
  let bestShip = null;
  let bestDistance = Infinity;
  for (const ship of state.enemyShips) {
    if (ship.disabled) continue;
    const valid = state.escortCommand === "attack"
      ? ship.disposition === "hostile" || ship.disposition === "suspicious"
      : ship.disposition === "hostile";
    if (!valid) continue;
    const dist = distance(escortState, ship);
    if (dist < bestDistance) {
      bestShip = ship;
      bestDistance = dist;
    }
  }
  return { ship: bestShip, dist: bestDistance };
}

function fireEscortShot(escort, escortState, target, escortIndex) {
  const hull = HULLS[escort.hullId] || HULLS.cutter;
  const profile = hull.weaponProfile || "pulse";
  const aim = angleTo(escortState, target);
  const color = profile === "rail" ? "#d9fff0" : profile === "missile" ? "#c7ff9a" : "#9ef59f";
  const extras = { escortIndex };
  if (profile === "scatter") {
    for (const spread of [-0.1, 0, 0.1]) {
      spawnShot(escortState, aim + spread, SHOT_SPEED * 0.76, 0.72, "escort", color, 4, escortState.vx * 0.18, escortState.vy * 0.18, extras);
    }
  } else if (profile === "rail") {
    spawnShot(escortState, aim, SHOT_SPEED * 1.1, 1.2, "escort", color, 12, escortState.vx * 0.16, escortState.vy * 0.16, extras);
  } else if (profile === "missile") {
    spawnShot(escortState, aim, SHOT_SPEED * 0.72, 1.55, "escort", color, 8, escortState.vx * 0.14, escortState.vy * 0.14, extras);
  } else {
    spawnShot(escortState, aim, SHOT_SPEED * 0.82, 0.96, "escort", color, 7, escortState.vx * 0.18, escortState.vy * 0.18, extras);
  }
  createSpark(
    escortState.x + Math.cos(aim) * 12,
    escortState.y + Math.sin(aim) * 12,
    color,
    3,
  );
  createBurst(
    escortState.x + Math.cos(aim) * 12,
    escortState.y + Math.sin(aim) * 12,
    color,
    { radius: 7, grow: 9, life: 0.12, fillAlpha: 0.08, lineWidth: 1.2 },
  );
}

function awardKill(ship, source = "player", escort = null) {
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
  const hullName = HULLS[ship.hullId]?.name || (ship.type === "pirate" ? "Pirate" : ship.type === "patrol" ? "Patrol" : "Trader");
  createBurst(ship.x, ship.y, "#ffcf74", {
    radius: 18,
    grow: 28,
    life: 0.34,
    fillAlpha: 0.2,
    lineWidth: 2.4,
  });
  if (source === "escort" && escort) {
    escort.kills = (escort.kills || 0) + 1;
    setStatus(`${escortDisplayName(escort)} crippled ${hullName}. Boarding window open and ${formatCredits(ship.reward)} marked for salvage.`, { tag: "Wing" });
    showBanner(`${escortDisplayName(escort)} on target`, `${hullName} is drifting and ready for boarding.`, 1.8);
  } else {
    setStatus(`${hullName} disabled. ${formatCredits(ship.reward)} in salvage credits and a live boarding window.`, { tag: "Combat" });
    showBanner("Target Disabled", `${hullName} is drifting and ready for boarding.`, 1.6);
  }
  addScreenShake(7);
}

function destroyDisabledShip(ship, source = "player", escort = null) {
  const hullName = HULLS[ship.hullId]?.name || "Drifting hull";
  ship.hull = 0;
  ship.shield = 0;
  state.enemyShips = state.enemyShips.filter((entry) => entry.id !== ship.id);
  createSpark(ship.x, ship.y, "#ff8a8a", 24);
  createSpark(ship.x, ship.y, "#ffcf74", 14);
  createBurst(ship.x, ship.y, "#ff8a8a", {
    radius: 20,
    grow: 32,
    life: 0.38,
    fillAlpha: 0.22,
    lineWidth: 2.4,
  });
  createBurst(ship.x, ship.y, "#ffcf74", {
    radius: 12,
    grow: 20,
    life: 0.28,
    fillAlpha: 0.12,
  });
  addScreenShake(10);
  if (source === "escort" && escort) {
    setStatus(`${escortDisplayName(escort)} broke apart the drifting ${hullName}. Boarding window lost.`, { tag: "Wing" });
    showBanner(`${escortDisplayName(escort)} finished the job`, `${hullName} came apart under sustained fire.`, 1.6);
    return;
  }
  setStatus(`${hullName} destroyed. Boarding window lost.`, { tag: "Combat" });
  showBanner("Target Destroyed", `${hullName} came apart under sustained fire.`, 1.5);
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

function menuButtonPressed(pad) {
  return buttonPressed(pad, 8) || buttonPressed(pad, 9);
}

function applyRadialDeadzone(x, y, deadzone = DEADZONE) {
  const magnitude = Math.hypot(x, y);
  if (magnitude <= deadzone) {
    return { x: 0, y: 0 };
  }
  const scaledMagnitude = clamp((magnitude - deadzone) / (1 - deadzone), 0, 1);
  const normX = x / magnitude;
  const normY = y / magnitude;
  return {
    x: normX * scaledMagnitude,
    y: normY * scaledMagnitude,
  };
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

function consumeMenuConfirmInput(pad = activePad()) {
  keyboard.fire = false;
  keyboard.pause = false;
  state.actionLockUntil = performance.now() + 180;
  if (!pad) return;
  const pressed = buttonPressed(pad, 0);
  state.buttonSnapshot[`pad-${pad.index}-confirm-menu`] = pressed;
  state.buttonSnapshot[`pad-${pad.index}-fire`] = pressed;
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

function starmapDirectionalNavigation(now) {
  const pad = activePad();
  const axisX = pad && Math.abs(pad.axes[0] || 0) > DEADZONE ? pad.axes[0] : 0;
  const axisY = pad && Math.abs(pad.axes[1] || 0) > DEADZONE ? pad.axes[1] : 0;
  const dpadX = pad ? ((buttonPressed(pad, 15) ? 1 : 0) - (buttonPressed(pad, 14) ? 1 : 0)) : 0;
  const dpadY = pad ? ((buttonPressed(pad, 13) ? 1 : 0) - (buttonPressed(pad, 12) ? 1 : 0)) : 0;
  const keyboardX = (keyboard.right ? 1 : 0) - (keyboard.left ? 1 : 0);
  const keyboardY = (keyboard.down ? 1 : 0) - (keyboard.up ? 1 : 0);
  const moveX = axisX || dpadX || keyboardX;
  const moveY = axisY || dpadY || keyboardY;
  if (now < state.navHoldUntil) {
    return null;
  }
  if (!moveX && !moveY) {
    return null;
  }
  state.navHoldUntil = now + NAV_REPEAT_DELAY;
  const origin = starmapNodeById(selectedStarmapSectorId()) || starmapNodeById(state.currentSectorId);
  if (!origin) return null;
  const originX = origin.x * WIDTH;
  const originY = origin.y * HEIGHT;
  const magnitude = Math.hypot(moveX, moveY) || 1;
  const dirX = moveX / magnitude;
  const dirY = moveY / magnitude;
  let best = null;
  let bestScore = -Infinity;
  for (const node of knownStarmapNodes()) {
    if (node.id === origin.id) continue;
    const dx = node.x * WIDTH - originX;
    const dy = node.y * HEIGHT - originY;
    const distanceToNode = Math.hypot(dx, dy);
    if (distanceToNode < 1) continue;
    const dot = (dx / distanceToNode) * dirX + (dy / distanceToNode) * dirY;
    if (dot <= 0.22) continue;
    const score = dot * 1000 - distanceToNode;
    if (score > bestScore) {
      bestScore = score;
      best = node.id;
    }
  }
  keyboard.left = false;
  keyboard.right = false;
  keyboard.up = false;
  keyboard.down = false;
  return best;
}

function threadNavigationIntent(now) {
  const pad = activePad();
  const axisX = pad && Math.abs(pad.axes[0] || 0) > DEADZONE ? pad.axes[0] : 0;
  const axisY = pad && Math.abs(pad.axes[1] || 0) > DEADZONE ? pad.axes[1] : 0;
  const dpadX = pad ? ((buttonPressed(pad, 15) ? 1 : 0) - (buttonPressed(pad, 14) ? 1 : 0)) : 0;
  const dpadY = pad ? ((buttonPressed(pad, 13) ? 1 : 0) - (buttonPressed(pad, 12) ? 1 : 0)) : 0;
  const keyboardX = (keyboard.right ? 1 : 0) - (keyboard.left ? 1 : 0);
  const keyboardY = (keyboard.down ? 1 : 0) - (keyboard.up ? 1 : 0);
  const moveX = axisX || dpadX || keyboardX;
  const moveY = axisY || dpadY || keyboardY;
  if (now < state.navHoldUntil) {
    return { scroll: 0, reply: 0 };
  }
  if (moveY) {
    state.navHoldUntil = now + NAV_REPEAT_DELAY;
    keyboard.up = false;
    keyboard.down = false;
    return { scroll: moveY > 0 ? 1 : -1, reply: 0 };
  }
  if (moveX) {
    state.navHoldUntil = now + NAV_REPEAT_DELAY;
    keyboard.left = false;
    keyboard.right = false;
    return { scroll: 0, reply: moveX > 0 ? 1 : -1 };
  }
  return { scroll: 0, reply: 0 };
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
    chill: false,
  };

  if (pad) {
    const stick = applyRadialDeadzone(pad.axes[0] || 0, pad.axes[1] || 0);
    input.moveX = stick.x;
    input.moveY = stick.y;
    input.fire = buttonJustPressed(`pad-${pad.index}-fire`, buttonPressed(pad, 0));
    input.interact = buttonJustPressed(`pad-${pad.index}-interact`, buttonPressed(pad, 2));
    input.map = buttonJustPressed(`pad-${pad.index}-map`, buttonPressed(pad, 3));
    input.back = buttonJustPressed(`pad-${pad.index}-back`, buttonPressed(pad, 1));
    input.chill = buttonJustPressed(`pad-${pad.index}-chill`, buttonPressed(pad, 4));
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
  undock: false,
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
  if (key === "b") keyboard.undock = true;
  if (key === "`") {
    state.debugVisible = !state.debugVisible;
  }
  if (key === "tab") {
    keyboard.map = true;
    event.preventDefault();
  }
  if (key === "enter") keyboard.pause = true;

  if (state.mode !== "flight") {
    if (["arrowup", "arrowdown", "w", "s", " ", "enter", "escape", "shift", "tab", "b"].includes(key)) {
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
  if (key === "b") keyboard.undock = false;
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
    return knownStarmapNodes().map((node) => {
      const sector = SECTORS[node.id];
      const contractBadge = contractBadgeText(node.id);
      const plan = travelPlanForSector(node.id);
      const routeText = plan.jumpCount > 0 ? `${jumpCountLabel(plan.jumpCount)} | Fuel ${plan.fuelCost}` : "";
      return {
        label: sector.name,
        meta: plan.blockedReason
          ? `${plan.blockedReason} | ${routeText || "No course"} | ${sector.legality} | danger ${Math.round(sector.danger * 100)}%`
          : `${routeText} | ${sector.legality} | danger ${Math.round(sector.danger * 100)}% | ${contractBadge || plan.waypointLabel || sector.routeNotes}`,
        disabled: !plan.canTravel,
        confirm: () => travelToSector(node.id),
        confirmBlocked: () => {
          setStatus(
            plan.blockedReason
              ? `${sector.name} is locked. ${plan.blockedReason}.`
              : `${sector.name} is not available yet.`,
            { tag: plan.blockedTag || "Route" },
          );
        },
      };
    });
  }

  if (state.mode === "flight") {
    return [
      { label: "Resume Flight", meta: "Return to the lane.", confirm: () => setStatus("Back in the lane.") },
      {
        label: "Open Starmap",
        meta: "Plot a full route from space.",
        confirm: () => {
          openStarmap("flight");
        },
      },
      { label: "Emergency Dock Vector", meta: "Fly near the station and press west to dock.", disabled: true, confirm: () => {} },
    ];
  }

  const restricted = dockAccessState() === "restricted";
  if (state.dockScreen === "contracts") {
    const threads = missionInboxThreads();
    const threadEntries = threads.map((thread) => {
      const statusLine = missionThreadStatusTags(thread).map((tag) => tag.label).join(" • ");
      const followUp = missionThreadFollowUpState(thread);
      return {
        label: thread.contact.name,
        meta: statusLine ? `${thread.contact.role} • ${statusLine}` : thread.contact.role,
        preview: missionInboxPreview(thread),
        unread: thread.unread || 0,
        followUpLabel: followUp?.label || "",
        needsAttention: Boolean((thread.unread || 0) || followUp),
        avatarColor: thread.contact.color,
        avatarInitials: thread.contact.initials || thread.contact.name.split(" ").map((part) => part[0]).join("").slice(0, 2),
        avatarPortrait: thread.contact.portrait || "",
        confirm: () => {
          setActiveMissionThread(thread.id);
          state.dockScreen = "contract-thread";
          state.selectedMenuIndex = 0;
          resetThreadViewport(true);
          setHint("Up and down scroll the thread. Left and right move your reply. A sends and B returns to the inbox.");
        },
      };
    });
    if (!threadEntries.length) {
      threadEntries.push({
        label: "No new messages",
        meta: "The phone is quiet for now. Dock traffic will light it back up.",
        disabled: true,
        confirm: () => {},
      });
    }
    return threadEntries;
  }

  if (state.dockScreen === "contract-thread") {
    const thread = missionThreadForCurrentSelection();
    const availableContracts = thread
      ? state.availableContracts.filter((contract) => missionThreadIdForContract(contract) === thread.id)
      : [];
    const threadEntries = availableContracts.map((contract) => ({
      label: promptLabelText(missionResponseLabel(contract)),
      meta: `Payout ${formatCredits(contract.reward)} | ${SECTORS[contract.destinationId]?.name || "Unknown"} | ${(contract.tags || []).slice(0, 2).join(" / ") || contract.type}`,
      confirm: () => attemptAcceptContract(contract.id),
    }));
    if (!threadEntries.length) {
      threadEntries.push({
        label: "No reply to send",
        meta: "Finish the current run or wait for the contact to ping you again.",
        disabled: true,
        confirm: () => {},
      });
    }
    return threadEntries;
  }

  if (state.dockScreen === "archive") {
    const unread = new Set(state.archiveUnreadIds || []);
    return archiveEntries().map((entry) => ({
      label: entry.title,
      meta: `${unread.has(entry.id) ? "New • " : ""}${entry.meta || `${entry.category} file`} • ${entry.tags.slice(0, 2).join(" • ")}`,
      artKey: entry.image ? null : undefined,
      confirm: () => {
        markArchiveEntryRead(entry.id);
        openPopup({
          title: entry.title,
          copy: `${entry.copy}${entry.tags?.length ? ` Filed under: ${entry.tags.join(" • ")}.` : ""}`,
          options: [
            {
              label: "Close File",
              meta: "Return to the archive shelf.",
              confirm() {
                closePopup();
              },
            },
          ],
        });
      },
    }));
  }

  if (state.dockScreen === "ships") {
    normalizeEscortHangar();
    const canBuyHull = (hullId) => (currentSector().shipyard || []).includes(hullId) && state.player.credits >= HULLS[hullId].sale && hasHullLicense(hullId);
    const shipyardEntries = (currentSector().shipyard || []).filter((hullId) => hullId !== state.player.hullId).map((hullId) => ({
      label: `Buy ${HULLS[hullId].name}`,
      meta: `${formatCredits(HULLS[hullId].sale)} | ${HULLS[hullId].classRole}${hullLicenseLabel(hullId) ? ` | ${hullLicenseLabel(hullId)}` : ""}`,
      artKey: hullId,
      disabled: restricted || !canBuyHull(hullId),
      confirm: () => purchaseHull(hullId),
    }));
    const entries = [
      {
        label: `Flagship: ${currentHull().name}`,
        meta: `${currentHull().classRole} | Auto-repair and refuel happen on docking`,
        artKey: state.player.hullId,
        disabled: true,
        confirm: () => {},
      },
      {
        label: `Escort Doctrine: ${state.escortCommand}`,
        meta: `Cycle follow, defend, attack, and regroup behavior. Wing: ${escortRosterSummary(2)}.`,
        disabled: escortCount() === 0,
        confirm: cycleEscortCommand,
      },
      ...shipyardEntries,
    ];
    state.escortHangar.forEach((escort, index) => {
      entries.push({
        label: `Swap to ${escortDisplayName(escort)}`,
        meta: `${HULLS[escort.hullId]?.name || escort.hullId} | ${escortStatusLine(escort)}`,
        artKey: escort.hullId,
        confirm: () => swapFlagship(index),
      });
      entries.push({
        label: `Sell ${escortDisplayName(escort)}`,
        meta: `${HULLS[escort.hullId]?.name || escort.hullId} | Release for ${formatCredits(escort.sale)}`,
        artKey: escort.hullId,
        confirm: () => sellEscort(index),
      });
    });
    if (state.escortHangar.length === 0) {
      entries.push({ label: "No escort ships", meta: "Board something worth stealing or buy a hull and keep it in reserve.", disabled: true, confirm: () => {} });
    }
    entries.push({ label: "Back", meta: "Return to the dock command deck.", confirm: closeDockScreen });
    return entries;
  }

  return [
    { label: "Messages", meta: restricted ? "Restricted captains are not offered station work." : "Open your contacts, read the thread, and answer inside the conversation.", confirm: () => openDockScreen("contracts") },
    { label: "Archive", meta: `${archiveUnreadCount() ? `${archiveUnreadCount()} new file${archiveUnreadCount() === 1 ? "" : "s"} • ` : ""}Read berth lore, contact dossiers, and recovered history.`, confirm: () => openDockScreen("archive") },
    { label: "Ships", meta: "Buy hulls, switch flagship, sell escorts, and keep the fleet tidy.", artKey: state.player.hullId, confirm: () => openDockScreen("ships") },
    {
      label: "Starmap",
      meta: "Plot your next full course while docked.",
      confirm: () => {
        openStarmap("dock");
      },
    },
  ];
}

function renderMenu() {
  const entries = menuEntries();
  if (ui.commandDeck) {
    ui.commandDeck.classList.toggle("is-hidden-by-thread", state.mode === "dock" && state.dockScreen === "contract-thread");
  }
  if (ui.menuPanel) {
    ui.menuPanel.classList.toggle("is-hidden", state.mode === "dock" && state.dockScreen === "contract-thread");
  }
  if (entries.length === 0) {
    ui.menuList.replaceChildren();
    return;
  }

  state.selectedMenuIndex = clamp(state.selectedMenuIndex, 0, entries.length - 1);
  if (state.popup?.style === "boarding") {
    ui.menuList.replaceChildren();
    return;
  }
  if (state.mode === "dock" && state.dockScreen === "contract-thread") {
    ui.menuList.replaceChildren();
    return;
  }
  ui.menuList.replaceChildren();

  entries.forEach((entry, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "menu-button";
    const isMessageList = state.mode === "dock" && state.dockScreen === "contracts";
    if (index === state.selectedMenuIndex) {
      button.classList.add("is-selected");
    }
    if (entry.disabled) {
      button.classList.add("is-disabled");
    }
    if (isMessageList && !entry.disabled) {
      button.classList.add("menu-button--thread");
      if (entry.needsAttention) {
        button.classList.add("menu-button--thread-attention");
      }
      button.innerHTML = `
        <span class="thread-row-avatar" style="--avatar:${entry.avatarColor || "#79d8ff"}">
          ${entry.avatarPortrait
            ? `<img class="thread-row-avatar-image" src="${entry.avatarPortrait}" alt="${safeUiText(entry.label)}">`
            : `<span class="thread-row-avatar-fallback">${safeUiText(entry.avatarInitials || "??")}</span>`}
        </span>
        <span class="thread-row-copy">
          <span class="thread-row-head">
            <span class="menu-label">${safeUiText(entry.label)}</span>
            ${entry.followUpLabel ? `<span class="thread-row-pill thread-row-followup">${safeUiText(entry.followUpLabel)}</span>` : ""}
            ${entry.unread ? `<span class="thread-row-unread">${entry.unread} new</span>` : ""}
          </span>
          <span class="menu-meta">${safeUiText(entry.meta || "")}</span>
          <span class="thread-row-preview">${safeUiText(entry.preview || "")}</span>
        </span>
      `;
    } else {
      button.innerHTML = `
        <span class="menu-label">${safeUiText(entry.label)}</span>
        <span class="menu-meta">${safeUiText(entry.meta || "")}</span>
      `;
    }
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

function syncDockChrome() {
  if (!ui.menuPanelTitle || !ui.detailPanelTitle || !ui.menuPanelFootnote) return;
  if (state.mode !== "dock") {
    ui.menuPanelTitle.textContent = "Command Deck";
    ui.detailPanelTitle.textContent = "Context";
    ui.menuPanelFootnote.textContent = "Controller: D-pad browse, south confirm, B undock, start command menu.";
    return;
  }
  if (state.dockScreen === "contracts") {
    ui.menuPanelTitle.textContent = "Messages";
    ui.detailPanelTitle.textContent = "Preview";
    ui.menuPanelFootnote.textContent = "Controller: D-pad browse contacts, south opens thread, B returns to dock.";
    return;
  }
  if (state.dockScreen === "contract-thread") {
    ui.menuPanelTitle.textContent = "Messages";
    ui.detailPanelTitle.textContent = "Thread";
    ui.menuPanelFootnote.textContent = "Controller: Up/down scrolls, left/right picks a reply, A sends, B returns.";
    return;
  }
  if (state.dockScreen === "archive") {
    ui.menuPanelTitle.textContent = "Archive";
    ui.detailPanelTitle.textContent = "Lore";
    ui.menuPanelFootnote.textContent = "Controller: D-pad browses dossiers, south opens a file, B returns to dock.";
    return;
  }
  if (state.dockScreen === "ships") {
    ui.menuPanelTitle.textContent = "Ships";
    ui.detailPanelTitle.textContent = "Fleet Status";
    ui.menuPanelFootnote.textContent = "Controller: D-pad browse fleet options, south confirms, B returns to dock.";
    return;
  }
  ui.menuPanelTitle.textContent = "Command Deck";
  ui.detailPanelTitle.textContent = "Context";
  ui.menuPanelFootnote.textContent = "Controller: D-pad browse, south confirm, B undock, start command menu.";
}

function renderDetailPanel() {
  ui.panelDetail.replaceChildren();
  const entries = menuEntries();
  const focused = entries[state.selectedMenuIndex];
  const cards = [];

  if (state.mode === "dock" && state.dockScreen === "contracts") {
    const thread = missionThreadForCurrentSelection();
    if (!thread) {
      const empty = document.createElement("div");
      empty.className = "detail-card";
      empty.innerHTML = `
        <div class="detail-title">Messages</div>
        <div class="detail-copy">No contacts are waiting right now. Dock traffic will light this back up.</div>
      `;
      ui.panelDetail.append(empty);
      return;
    }
    const availableCount = state.availableContracts.filter((contract) => missionThreadIdForContract(contract) === thread.id).length;
    const activeCount = state.activeContracts.filter((contract) => missionThreadIdForContract(contract) === thread.id).length;
    const latestVisibleMessage = visibleMissionThreadMessages(thread);
    const latestMessage = latestVisibleMessage[latestVisibleMessage.length - 1]?.text || thread.contact.opener;
    const statusTags = missionThreadStatusTags(thread)
      .map((tag) => `<span class="tag">${safeUiText(tag.label)}</span>`)
      .join("");
    const preview = document.createElement("div");
    preview.className = "chat-shell";
    preview.innerHTML = `
      <div class="chat-header">
        <div class="chat-avatar" style="--avatar:${thread.contact.color}">
          ${thread.contact.portrait
            ? `<img class="chat-avatar-image" src="${thread.contact.portrait}" alt="${safeUiText(thread.contact.name)}">`
            : `<div class="chat-avatar-fallback">${safeUiText(thread.contact.initials || thread.contact.name.split(" ").map((part) => part[0]).join("").slice(0, 2))}</div>`}
          <div class="chat-avatar-shade"></div>
          <div class="chat-avatar-glass"></div>
        </div>
        <div class="chat-head-copy">
          <div class="chat-name">${safeUiText(thread.contact.name)}</div>
          <div class="chat-role">${safeUiText(thread.contact.role)}${thread.unread ? ` • ${thread.unread} new` : ""}</div>
        </div>
      </div>
      <div class="detail-copy">Latest: ${safeUiText(latestMessage)}</div>
      <div class="detail-tags">
        <span class="tag">${availableCount ? `${availableCount} lead${availableCount === 1 ? "" : "s"}` : "No open lead"}</span>
        <span class="tag">${activeCount ? `${activeCount} active` : "No active run"}</span>
        <span class="tag">A opens thread</span>
        ${statusTags}
      </div>
    `;
    ui.panelDetail.append(preview);
    return;
  }

  if (state.mode === "dock" && state.dockScreen === "contract-thread") {
    return;
  }

  if (state.mode === "dock" && state.dockScreen === "archive") {
    const shelf = archiveEntries();
    const entry = shelf[clamp(state.selectedMenuIndex, 0, shelf.length - 1)] || shelf[0];
    const latestRumor = latestRumorForSector(state.currentSectorId);
    [
      entry
        ? {
            title: entry.title,
            copy: entry.copy,
            image: entry.image || "",
            imageAlt: entry.imageAlt || `${entry.title} art`,
            mediaVariant: entry.image ? "hero" : "",
            tags: [entry.category, ...(entry.tags || []), (state.archiveUnreadIds || []).includes(entry.id) ? "New file" : ""].filter(Boolean).slice(0, 5),
          }
        : {
            title: "Archive Shelf",
            copy: "The archive is empty, which would be a problem if this game were not made entirely of paperwork, rumor, and memory.",
            tags: ["Archive", "Empty"],
          },
      {
        title: "Archive Ledger",
        copy: archiveOverviewCopy(),
        tags: [
          `${archiveUnreadCount()} unread`,
          `${sectorArchiveEntries().length} ports logged`,
          `${contactArchiveEntries().length} contacts known`,
          `${storyArchiveEntries().length} history files`,
        ],
      },
      {
        title: latestRumor ? `Current Berth Talk: ${currentSector().name}` : "Berth Talk",
        copy: latestRumor || `No dock rumor is logged for ${currentSector().name} yet. Stay docked long enough and the room will eventually tell on itself.`,
        tags: [dockMoodTag(), sectorPersonality(state.currentSectorId).watch || "local traffic"],
      },
    ].forEach((card) => {
      const element = document.createElement("div");
      element.className = "detail-card";
      if (card.image) {
        const media = document.createElement("div");
        media.className = card.mediaVariant ? `detail-card-media detail-card-media--${card.mediaVariant}` : "detail-card-media";
        const image = document.createElement("img");
        image.className = card.imageFit === "contain" ? "detail-card-image detail-card-image--contain" : "detail-card-image";
        image.src = card.image;
        image.alt = card.imageAlt || `${card.title} art`;
        image.addEventListener("error", () => media.remove());
        media.append(image);
        element.append(media);
      }
      const title = document.createElement("div");
      title.className = "detail-title";
      title.textContent = card.title;
      element.append(title);
      const copy = document.createElement("div");
      copy.className = "detail-copy";
      copy.textContent = card.copy;
      element.append(copy);
      if (card.tags?.length) {
        const tagRow = document.createElement("div");
        tagRow.className = "detail-tags";
        for (const tag of card.tags) {
          const pill = document.createElement("span");
          pill.className = "tag";
          pill.textContent = tag;
          tagRow.append(pill);
        }
        element.append(tagRow);
      }
      ui.panelDetail.append(element);
    });
    return;
  }

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
      image: sectorMenuArt(currentSector().id),
      imageAlt: `${currentSector().name} dock art`,
      mediaVariant: "wide",
      tags: [factionName(currentSector().faction), currentSector().legality, `Danger ${Math.round(currentSector().danger * 100)}%`, access],
    });
    cards.push({
      title:
        state.dockScreen === "root"
          ? "Station Intel"
          : state.dockScreen === "ships"
            ? "Fleet Berth"
            : "Command Deck",
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
    const destination = selectedStarmapSectorId() ? SECTORS[selectedStarmapSectorId()] : null;
    const destinationContracts = destination ? contractsForSector(destination.id) : [];
    const plan = destination ? travelPlanForSector(destination.id) : null;
    cards.push({
      title: destination ? destination.name : "Starmap",
      copy: destination
        ? `${plan?.blockedReason ? `${plan.blockedReason}. ` : plan?.jumpCount ? `${jumpCountLabel(plan.jumpCount)} plotted. ${plan.waypointLabel}. ` : ""}${destination.routeNotes} ${destinationContracts.length ? `Contract pull: ${destinationContracts.map((contract) => contract.title).join(" | ")}.` : "No active contracts pointed here right now."}`
        : "Plot full courses across known systems. Longer routes burn more fuel, and cheap hulls run out of range first.",
      mediaVariant: destination ? "wide" : "",
      tags: destination
        ? [factionName(destination.faction), destination.legality, sectorCondition(destination.id)?.title || "Stable lane", `Danger ${Math.round(destination.danger * 100)}%`, ...(plan?.jumpCount ? [jumpCountLabel(plan.jumpCount), `Fuel ${plan.fuelCost}`] : []), ...(plan?.blockedReason ? [plan.blockedReason] : []), ...(destinationContracts.length ? [`${destinationContracts.length} jobs`] : [])]
        : [`Fuel ${state.player.fuel}/${currentHull().fuelCap}`],
    });
  }

  if (focused && state.popup?.style !== "boarding") {
    const focusedHull = focused.artKey ? HULLS[focused.artKey] : null;
    cards.push({
      title: focused.label,
      copy: focused.meta || "Ready.",
      image: focused.artKey ? hullMenuArt(focused.artKey) : "",
      imageAlt: focusedHull ? `${focusedHull.name} menu art` : `${focused.label} menu art`,
      mediaVariant: focused.artKey ? "ship" : "",
      imageFit: focused.artKey ? "contain" : "",
      tags: focused.disabled ? ["Unavailable"] : [],
    });
  }

  for (const card of cards) {
    const element = document.createElement("div");
    element.className = "detail-card";
    if (card.image) {
      const media = document.createElement("div");
      media.className = card.mediaVariant ? `detail-card-media detail-card-media--${card.mediaVariant}` : "detail-card-media";
      const image = document.createElement("img");
      image.className = card.imageFit === "contain" ? "detail-card-image detail-card-image--contain" : "detail-card-image";
      image.src = card.image;
      image.alt = card.imageAlt || `${card.title} art`;
      image.addEventListener("error", () => media.remove());
      media.append(image);
      element.append(media);
    }
    const title = document.createElement("div");
    title.className = "detail-title";
    title.textContent = card.title;
    element.append(title);
    const copy = document.createElement("div");
    copy.className = "detail-copy";
    copy.textContent = card.copy;
    element.append(copy);
    if (card.tags?.length) {
      const tagRow = document.createElement("div");
      tagRow.className = "detail-tags";
      for (const tag of card.tags) {
        const pill = document.createElement("span");
        pill.className = "tag";
        pill.textContent = tag;
        tagRow.append(pill);
      }
      element.append(tagRow);
    }
    ui.panelDetail.append(element);
  }
}

function renderThreadModal() {
  if (!ui.threadModal) return;
  const visible = state.mode === "dock" && state.dockScreen === "contract-thread";
  ui.threadModal.classList.toggle("is-visible", visible);
  ui.threadModal.replaceChildren();
  if (!visible) {
    state.threadScrollMax = 0;
    return;
  }

  const thread = missionThreadForCurrentSelection();
  if (!thread) return;
  const visibleMessages = visibleMissionThreadMessages(thread);
  const replyEntries = menuEntries();
  const { active, available } = missionThreadContractState(thread);
  const subtitle = active.length
    ? `${active[0].title} active`
    : available.length
      ? `${available.length} open lead${available.length === 1 ? "" : "s"}`
      : "No open commitments";
  const statusTags = missionThreadStatusTags(thread)
    .map((tag) => `<span class="thread-status-tag${tag.warm ? " thread-status-tag--warm" : ""}">${safeUiText(tag.label)}</span>`)
    .join("");

  const overlay = document.createElement("div");
  overlay.className = "thread-overlay";
  overlay.innerHTML = `
    <div class="chat-shell chat-shell--thread chat-shell--overlay">
      <div class="chat-header">
        <div class="chat-avatar" style="--avatar:${thread.contact.color}">
          ${thread.contact.portrait
            ? `<img class="chat-avatar-image" src="${thread.contact.portrait}" alt="${safeUiText(thread.contact.name)}">`
            : `<div class="chat-avatar-fallback">${safeUiText(thread.contact.initials || thread.contact.name.split(" ").map((part) => part[0]).join("").slice(0, 2))}</div>`}
          <div class="chat-avatar-shade"></div>
          <div class="chat-avatar-glass"></div>
        </div>
        <div class="thread-header-copy">
          <div class="thread-header-meta">
            <div class="thread-title">${safeUiText(thread.contact.name)}</div>
            <div class="thread-subtitle">${safeUiText(thread.contact.role)}</div>
          </div>
          <div class="thread-status-tags">
            ${statusTags}
            <span class="thread-status-tag">${safeUiText(subtitle)}</span>
          </div>
        </div>
      </div>
      <div class="chat-thread chat-thread--overlay">
        ${visibleMessages.map((message) => `
          <div class="chat-row ${message.from === "you" ? "chat-row--you" : "chat-row--them"}">
            <div class="chat-bubble">${safeUiText(message.text)}</div>
          </div>
        `).join("")}
      </div>
      <div class="chat-offer-brief">
        <div class="chat-replies-title">Current Update</div>
        <div class="chat-offer-brief-copy">${safeUiText(missionOfferBrief(thread))}</div>
      </div>
      <div class="chat-replies chat-replies--overlay">
        <div class="chat-replies-title">Available Jobs</div>
        <div class="chat-replies-list chat-replies-list--overlay">
          ${replyEntries.map((entry, index) => `
            <button
              type="button"
              class="chat-reply${index === state.selectedMenuIndex ? " is-selected" : ""}${entry.disabled ? " is-disabled" : ""}"
              data-reply-index="${index}"
              ${entry.disabled ? "disabled" : ""}
            >
              <span class="chat-reply-label">${safeUiText(entry.label)}</span>
              <span class="chat-reply-meta">${safeUiText(entry.meta || "")}</span>
            </button>
          `).join("")}
        </div>
        <div class="thread-overlay-footnote">
          <span>Up/down scrolls the thread. Left/right changes your reply.</span>
          <span>A sends. B returns to contacts.</span>
        </div>
      </div>
    </div>
  `;

  overlay.querySelectorAll("[data-reply-index]").forEach((node) => {
    node.addEventListener("click", () => {
      const index = Number(node.getAttribute("data-reply-index"));
      if (!Number.isFinite(index)) return;
      state.selectedMenuIndex = index;
      const entry = replyEntries[index];
      if (entry && !entry.disabled) {
        entry.confirm();
      }
      render();
    });
  });

  ui.threadModal.append(overlay);

  const threadBody = overlay.querySelector(".chat-thread");
  if (threadBody) {
    const maxScroll = Math.max(0, threadBody.scrollHeight - threadBody.clientHeight);
    state.threadScrollMax = maxScroll;
    if (!Number.isFinite(state.threadScrollOffset)) {
      state.threadScrollOffset = maxScroll;
    }
    state.threadScrollOffset = clamp(state.threadScrollOffset, 0, maxScroll);
    threadBody.scrollTop = state.threadScrollOffset;
    threadBody.addEventListener("scroll", () => {
      state.threadScrollOffset = threadBody.scrollTop;
    });
  }
}

function stationContextCopy() {
  normalizeEscortHangar();
  if (state.dockScreen === "contracts") {
    return "This is just your contacts list. Browse the names like a message inbox, open one with A, and use B to back out when you are done.";
  }
  if (state.dockScreen === "contract-thread") {
    return "Read the full thread, scroll the history with up and down, then move across your next reply with left and right. B returns to contacts.";
  }
  if (state.dockScreen === "archive") {
    return `The archive keeps faction primers, port files, contact dossiers, and recovered historical notes in one place. ${archiveUnreadCount() ? `${archiveUnreadCount()} file${archiveUnreadCount() === 1 ? "" : "s"} still want your attention.` : "Everything currently unlocked has been reviewed."}`;
  }
  if (state.dockScreen === "ships") {
    return escortCount()
      ? `Current flagship: ${currentHull().name}. Reserve wing: ${state.escortHangar.map((escort) => escortFullLabel(escort)).join(" | ")}. The dock automatically repairs and refuels your main ship on arrival.`
      : `Current flagship: ${currentHull().name}. No reserve hulls yet. Buy one locally or take one the hard way out in the lane.`;
  }
  return `${dockContextLine()} Active contracts: ${state.activeContracts.length}. Cargo: ${cargoUsed()}/${maxCargo()}. Sector condition: ${sectorConditionSummary()}. ${state.factionArc.stage === "resolved" ? "Your name is moving through the sector grapevine now." : currentSectorEventTag()}.`;
}

function stationContextTags() {
  normalizeEscortHangar();
  if (state.dockScreen === "contracts") {
    return [`${missionInboxThreads().length} contacts`, `${state.availableContracts.length} leads`, sectorCondition(state.currentSectorId)?.title || `Arc ${state.factionArc.stage}`];
  }
  if (state.dockScreen === "contract-thread") {
    const thread = missionThreadForCurrentSelection();
    return thread
      ? [thread.contact.name, ...missionThreadStatusTags(thread).map((tag) => tag.label)].slice(0, 3)
      : ["No contact", "No thread", "Stand by"];
  }
  if (state.dockScreen === "archive") {
    return [`${archiveEntries().length} files`, `${archiveUnreadCount()} unread`, `${sectorArchiveEntries().length} port files`];
  }
  if (state.dockScreen === "ships") {
    return [currentHull().name, escortRosterSummary(2), `Doctrine ${state.escortCommand}`];
  }
  return [
    dockMoodTag(),
    sectorCondition(state.currentSectorId)?.title || "Stable lane",
    archiveUnreadCount() ? `${archiveUnreadCount()} archive updates` : `${knownSectorIds().length}/${Object.keys(SECTORS).length} known sectors`,
  ];
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
  normalizeEscortHangar();
  const rows = [
    ["Integrity", `${Math.round((state.player.hull / maxHull()) * 100)}%`],
    ["Shield", `${Math.round((state.player.shield / maxShield()) * 100)}%`],
    ["Ship", currentHull().name],
    ["Role", currentHull().classRole],
    ["Transit", state.player.loanerHull ? "Loaner hull | local traffic only" : "Hyperspace cleared"],
    ["Weapons", currentHull().slotText],
    ["Fuel", `${state.player.fuel} / ${currentHull().fuelCap}`],
    ["Cargo", `${cargoUsed()} / ${maxCargo()}`],
    ["Wing", escortRosterSummary(2)],
    ["Escorts", `${state.escortHangar.length} / ${MAX_ESCORTS}`],
    ["Credits", formatCredits(state.player.credits)],
  ];
  ui.shipDetail.replaceChildren();
  for (const [label, value] of rows) {
    const row = document.createElement("div");
    row.className = "fact-row";
    row.innerHTML = `<span class="fact-label">${safeUiText(label)}</span><span class="fact-value">${safeUiText(value)}</span>`;
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
      <span class="fact-label">${safeUiText(faction.name)}</span>
      <span class="fact-value" ${tone ? `data-tone="${tone}"` : ""}>${safeUiText(`${repLabel(value)} (${value > 0 ? "+" : ""}${value})`)}</span>
    `;
    ui.factionDetail.append(row);
  }
  const statuses = [
    ["Authority Permit", hasAuthorityPermit() ? "Cleared" : "Not cleared"],
    ["Nightglass Access", hasSyndicateAccess() ? "Warm intro" : "Cold"],
    ["Core Transit", hasSectorPermit("coreTransit") ? "Approved" : "Locked"],
    ["Nightglass Transit", hasSectorPermit("nightglassTransit") ? "Key held" : "Locked"],
    ["Docking", dockAccessState()],
  ];
  for (const [label, value] of statuses) {
    const row = document.createElement("div");
    row.className = "fact-row";
    row.innerHTML = `<span class="fact-label">${safeUiText(label)}</span><span class="fact-value">${safeUiText(value)}</span>`;
    ui.factionDetail.append(row);
  }
}

function renderMessageLog() {
  ui.messageLog.replaceChildren();
  const lines = state.messageLog.length
    ? state.messageLog
    : [{ text: "No traffic yet. The comms feed will collect contracts, jumps, rescues, losses, and station chatter as your run unfolds.", tag: "Comms", sectorId: state.currentSectorId }];

  for (const entry of lines) {
    const row = document.createElement("div");
    row.className = "message-log-entry";
    const sectorName = SECTORS[entry.sectorId]?.name || currentSector().name;
    row.innerHTML = `
      <div class="message-log-meta">${safeUiText(entry.tag)} • ${safeUiText(sectorName)}</div>
      <div class="message-log-copy">${safeUiText(entry.text)}</div>
    `;
    ui.messageLog.append(row);
  }
}

function renderHud() {
  const boardingTarget = state.mode === "flight" ? nearestDisabledShip() : null;
  ui.sector.textContent = currentSector().name;
  ui.credits.textContent = formatCredits(state.player.credits);
  ui.hull.textContent = playerIsInEscapePod() ? "POD" : `${Math.round((state.player.hull / maxHull()) * 100)}%`;
  ui.shield.textContent = playerIsInEscapePod() ? "SAFE" : `${Math.round((state.player.shield / maxShield()) * 100)}%`;
  ui.cargo.textContent = `${cargoUsed()} / ${maxCargo()}`;
  ui.status.textContent = state.statusText;
  ui.hint.textContent = boardingTarget
    ? `Boarding range on ${HULLS[boardingTarget.hullId]?.name || "disabled hull"}. Press west to board or keep firing to finish it off.`
    : state.hintText;
  ui.hintBanner?.classList.toggle("is-boarding-window", Boolean(boardingTarget));
  ui.overlayTitle.textContent = state.overlayTitle;
  ui.overlayCopy.textContent = state.overlayCopy;
}

function syncCabinetView() {
  const app = document.getElementById("app");
  if (!app) return;
  app.dataset.mode = state.mode;
  app.dataset.dockScreen = state.mode === "dock" ? state.dockScreen : "";
}

function render() {
  syncCabinetView();
  syncDockChrome();
  renderHud();
  renderMenu();
  renderDetailPanel();
  renderThreadModal();
  renderMessageLog();
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

function authoritySector(sectorId) {
  return SECTORS[sectorId]?.faction === "authority";
}

function mapNodeFill(sectorId, selected) {
  if (sectorId === state.currentSectorId) return "#ffcf74";
  if (selected) return "#79d8ff";
  const route = state.mode === "starmap" ? travelPlanForSector(selectedStarmapSectorId()).route : null;
  if (route?.includes(sectorId)) return "#bfeeff";
  if (authoritySector(sectorId)) return "#bcd0ff";
  return "#eef7ff";
}

function mapLaneStroke(fromId, toId) {
  const route = state.mode === "starmap" ? travelPlanForSector(selectedStarmapSectorId()).route : null;
  if (routeContainsLane(route, fromId, toId)) {
    return "rgba(255, 207, 116, 0.78)";
  }
  if (authoritySector(fromId) && authoritySector(toId)) return "rgba(192, 209, 255, 0.42)";
  if (authoritySector(fromId) || authoritySector(toId)) return "rgba(255, 217, 128, 0.34)";
  return "rgba(121, 216, 255, 0.22)";
}

function drawStarmapSingularities() {
  const singularities = [
    {
      x: WIDTH * 0.24,
      y: HEIGHT * 0.31,
      radius: 20,
      ringX: 34,
      ringY: 9,
      label: "EVENTIDE LENS",
    },
    {
      x: WIDTH * 0.73,
      y: HEIGHT * 0.18,
      radius: 28,
      ringX: 48,
      ringY: 12,
      label: "HOLLOW CROWN SHEAR",
    },
  ];

  ctx.save();
  for (const singularity of singularities) {
    const glow = ctx.createRadialGradient(
      singularity.x,
      singularity.y,
      singularity.radius * 0.25,
      singularity.x,
      singularity.y,
      singularity.radius * 2.8,
    );
    glow.addColorStop(0, "rgba(255, 207, 116, 0.16)");
    glow.addColorStop(0.45, "rgba(121, 216, 255, 0.09)");
    glow.addColorStop(1, "rgba(10, 18, 28, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(singularity.x, singularity.y, singularity.radius * 2.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(121, 216, 255, 0.18)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(singularity.x, singularity.y, singularity.ringX, singularity.ringY, -0.22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(singularity.x, singularity.y, singularity.ringX * 1.28, singularity.ringY * 1.52, 0.38, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(4, 8, 14, 0.96)";
    ctx.beginPath();
    ctx.arc(singularity.x, singularity.y, singularity.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 207, 116, 0.42)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(singularity.x, singularity.y, singularity.radius + 3, 0.3, Math.PI * 1.82);
    ctx.stroke();

    ctx.fillStyle = "rgba(142, 164, 182, 0.72)";
    ctx.font = "12px Avenir Next, Segoe UI, sans-serif";
    ctx.fillText(singularity.label, singularity.x - 28, singularity.y - singularity.radius - 16);
    ctx.fillRect(singularity.x - 22, singularity.y - singularity.radius - 8, 44, 2);
    ctx.fillRect(singularity.x - 22, singularity.y - singularity.radius - 2, 34, 2);
  }
  ctx.restore();
}

function shipPalette(ship) {
  if (ship.type === "patrol" || ship.faction === "authority") {
    return {
      hull: ship.disposition === "hostile" ? "#ffd082" : "#c8d8ff",
      accent: "#79d8ff",
      marker: "#ffd980",
    };
  }
  if (ship.type === "trader") {
    return {
      hull: "#c9d6e2",
      accent: "#9fb4c7",
      marker: "#9fb4c7",
    };
  }
  if (ship.type === "smuggler") {
    return {
      hull: "#f0afd2",
      accent: "#f7d67a",
      marker: "#f0afd2",
    };
  }
  if (ship.disposition === "hostile") {
    return {
      hull: ship.color,
      accent: "#ffcf74",
      marker: "#ff8a8a",
    };
  }
  if (ship.disposition === "suspicious") {
    return {
      hull: "#ffcf74",
      accent: "#ffd980",
      marker: "#ffcf74",
    };
  }
  return {
    hull: "#9cb7c7",
    accent: "#79d8ff",
    marker: "#79d8ff",
  };
}

function drawStation() {
  const station = currentSector().station;
  const palette = currentSector().palette;
  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.translate(station.x, station.y);
  ctx.strokeStyle = "rgba(141, 220, 255, 0.45)";
  ctx.lineWidth = 2.2;

  ctx.beginPath();
  ctx.ellipse(-10, 0, 80, 24, 0.18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(-10, 0, 54, 15, 0.18, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.beginPath();
  ctx.moveTo(-58, -10);
  ctx.lineTo(-24, -26);
  ctx.lineTo(18, -18);
  ctx.lineTo(48, -4);
  ctx.moveTo(-58, 10);
  ctx.lineTo(-24, 26);
  ctx.lineTo(18, 18);
  ctx.lineTo(48, 4);
  ctx.moveTo(-8, -42);
  ctx.lineTo(-8, 42);
  ctx.stroke();

  ctx.fillStyle = "rgba(4, 10, 16, 0.76)";
  ctx.beginPath();
  ctx.arc(-8, 0, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = palette.station;
  ctx.beginPath();
  ctx.arc(-8, 0, 32, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = palette.stationWarm;
  ctx.fillRect(-14, -36, 12, 12);
  ctx.fillRect(-14, 24, 12, 12);
  ctx.fillRect(18, -14, 12, 12);
  ctx.fillRect(18, 2, 12, 12);
  ctx.fillRect(-50, -8, 10, 10);
  ctx.fillRect(-50, 2, 10, 10);

  ctx.strokeStyle = "rgba(141, 220, 255, 0.5)";
  ctx.beginPath();
  ctx.moveTo(44, -12);
  ctx.lineTo(82, -24);
  ctx.lineTo(88, -16);
  ctx.lineTo(54, -4);
  ctx.closePath();
  ctx.moveTo(44, 12);
  ctx.lineTo(82, 24);
  ctx.lineTo(88, 16);
  ctx.lineTo(54, 4);
  ctx.closePath();
  ctx.stroke();

  ctx.fillStyle = palette.station;
  ctx.beginPath();
  ctx.arc(22, 0, 10, 0, Math.PI * 2);
  ctx.fill();
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

function drawDinghyHull() {
  ctx.beginPath();
  ctx.moveTo(12, 0);
  ctx.lineTo(1, -5);
  ctx.lineTo(-11, -4);
  ctx.lineTo(-16, 0);
  ctx.lineTo(-11, 4);
  ctx.lineTo(1, 5);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-2, -4);
  ctx.lineTo(3, 0);
  ctx.lineTo(-2, 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-11, -7);
  ctx.lineTo(-15, -10);
  ctx.moveTo(-11, 7);
  ctx.lineTo(-15, 10);
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
    dinghy: drawDinghyHull,
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

function drawShipRegalia(ship, x, y, angle, palette) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  if (ship.type === "patrol" || ship.faction === "authority") {
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-5, -5);
    ctx.lineTo(5, 0);
    ctx.lineTo(-5, 5);
    ctx.stroke();
    ctx.strokeStyle = "#ffd980";
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(0, 8);
    ctx.stroke();
  } else if (ship.type === "trader") {
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-10, -6);
    ctx.lineTo(-10, 6);
    ctx.stroke();
  } else if (ship.disposition === "hostile") {
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-12, -7);
    ctx.lineTo(-17, -7);
    ctx.lineTo(-17, 7);
    ctx.lineTo(-12, 7);
    ctx.moveTo(12, -7);
    ctx.lineTo(17, -7);
    ctx.lineTo(17, 7);
    ctx.lineTo(12, 7);
    ctx.stroke();
  }
  ctx.restore();
}

function drawEscapePod(sequence) {
  ctx.save();
  ctx.translate(sequence.x, sequence.y);
  ctx.rotate(sequence.angle);
  if (sequence.plume > 0.01) {
    ctx.fillStyle = `rgba(121, 216, 255, ${Math.min(0.8, sequence.plume)})`;
    ctx.beginPath();
    ctx.moveTo(-11, 0);
    ctx.lineTo(-23 - sequence.plume * 9, -5);
    ctx.lineTo(-23 - sequence.plume * 9, 5);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = "#eef7ff";
  ctx.beginPath();
  ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#79d8ff";
  ctx.beginPath();
  ctx.arc(3, 0, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.24)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function drawFlightScene() {
  cabinetStage.syncContext(ctx);
  const shakeX = state.screenShake > 0 ? (Math.random() - 0.5) * state.screenShake : 0;
  const shakeY = state.screenShake > 0 ? (Math.random() - 0.5) * state.screenShake : 0;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.save();
  ctx.translate(shakeX, shakeY);
  ctx.fillStyle = "#030812";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawStars();

  ctx.save();
  drawSectorBackdrop();
  ctx.restore();

  drawStation();

  for (const burst of state.bursts) {
    const alpha = clamp(burst.life / burst.maxLife, 0, 1);
    const progress = 1 - alpha;
    const radius = burst.radius + burst.grow * progress;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = burst.color;
    ctx.beginPath();
    ctx.arc(burst.x, burst.y, radius * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = alpha * 0.92;
    ctx.strokeStyle = burst.color;
    ctx.lineWidth = burst.lineWidth;
    ctx.beginPath();
    ctx.arc(burst.x, burst.y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

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
    ctx.lineWidth = bullet.from === "player" ? 2.4 : bullet.from === "escort" ? 2.1 : 2;
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(bullet.x, bullet.y);
    ctx.stroke();
  }

  syncEscortFlightStates();
  for (const escort of state.escortHangar) {
    const index = state.escortHangar.indexOf(escort);
    const escortState = state.escortFlightStates[index];
    const escortX = escortState?.x ?? state.player.x;
    const escortY = escortState?.y ?? state.player.y;
    const escortAngle = escortState?.angle ?? state.player.angle;
    ctx.strokeStyle = "rgba(158, 245, 159, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(escortX - Math.cos(escortAngle) * 10, escortY - Math.sin(escortAngle) * 10);
    ctx.lineTo(escortX - Math.cos(escortAngle) * 22, escortY - Math.sin(escortAngle) * 22);
    ctx.stroke();
    drawShip(escortX, escortY, escortAngle, "#9ef59f", 0.75, false, escort.hullId || "cutter");
    ctx.fillStyle = "rgba(158, 245, 159, 0.88)";
    ctx.font = "10px Avenir Next, Segoe UI, sans-serif";
    ctx.fillText(escortDisplayName(escort), escortX - 24, escortY - 22);
  }

  for (const ship of state.enemyShips) {
    const palette = shipPalette(ship);
    const shipColor = palette.hull;
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
    drawShipRegalia(ship, ship.x, ship.y, ship.angle, palette);
    const barWidth = 30;
    if (ship.shield > 0) {
      ctx.fillStyle = "rgba(121, 216, 255, 0.14)";
      ctx.fillRect(ship.x - barWidth / 2, ship.y - 33, barWidth, 3);
      ctx.fillStyle = "#79d8ff";
      ctx.fillRect(ship.x - barWidth / 2, ship.y - 33, barWidth * clamp(ship.shield / ship.maxShield, 0, 1), 3);
    }
    if ((ship.shieldFlash || 0) > 0.02) {
      const alpha = Math.min(0.58, ship.shieldFlash * 0.58);
      ctx.strokeStyle = "rgba(121, 216, 255, 0.24)";
      ctx.strokeStyle = `rgba(121, 216, 255, ${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ship.x, ship.y, 18, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.fillRect(ship.x - barWidth / 2, ship.y - 26, barWidth, 4);
    ctx.fillStyle = ship.disabled ? "#ffcf74" : ship.disposition === "hostile" ? ship.color : "rgba(173, 196, 214, 0.55)";
    ctx.fillRect(ship.x - barWidth / 2, ship.y - 26, barWidth * clamp(ship.hull / ship.maxHull, 0, 1), 4);
    ctx.fillStyle = ship.contactState === "boardable" ? "#ffcf74" : palette.marker;
    ctx.font = "11px Avenir Next, Segoe UI, sans-serif";
    ctx.fillText(contactStateLabel(ship), ship.x - 14, ship.y - 36);
    if (ship.disabled) {
      const pulse = 0.5 + Math.sin(performance.now() * 0.01 + ship.x * 0.02) * 0.5;
      ctx.strokeStyle = `rgba(255, 207, 116, ${0.32 + pulse * 0.22})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(ship.x, ship.y, 20 + pulse * 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (!ship.disabled) {
      ctx.fillStyle = palette.marker;
      ctx.beginPath();
      ctx.arc(ship.x + 18, ship.y - 14, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (!playerIsInEscapePod() && (state.player.shieldFlash || 0) > 0.02) {
    const alpha = Math.min(0.72, state.player.shieldFlash * 0.72);
    ctx.strokeStyle = `rgba(121, 216, 255, ${alpha})`;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, 19, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (!playerIsInEscapePod() && Math.hypot(state.player.vx, state.player.vy) > 24) {
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
  if (state.escapeSequence) {
    if (state.escapeSequence.explosionTime > 0) {
      const burst = 20 + state.escapeSequence.explosionTime * 28;
      ctx.fillStyle = `rgba(255, 207, 116, ${Math.min(0.9, state.escapeSequence.explosionTime)})`;
      ctx.beginPath();
      ctx.arc(state.player.x, state.player.y, burst, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 138, 138, ${Math.min(0.8, state.escapeSequence.explosionTime * 0.92)})`;
      ctx.beginPath();
      ctx.arc(state.player.x, state.player.y, burst * 0.56, 0, Math.PI * 2);
      ctx.fill();
    }
    drawEscapePod(state.escapeSequence);
  } else {
    drawShip(state.player.x, state.player.y, state.player.angle, "#eef7ff", 1, false, state.player.hullId);
  }

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
  if (state.mode === "transit") {
    drawTravelOverlay();
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
  const boxW = 268;
  const boxX = WIDTH - boxW - 26;
  const boxY = 26;
  ctx.fillStyle = "#eef7ff";
  ctx.font = "700 16px Avenir Next, Segoe UI, sans-serif";
  ctx.shadowColor = "rgba(0, 0, 0, 0.62)";
  ctx.shadowBlur = 14;
  ctx.fillText(state.activeSectorEvent.title, boxX, boxY);
  ctx.fillStyle = "rgba(168, 189, 209, 0.96)";
  ctx.font = "12px Avenir Next, Segoe UI, sans-serif";
  wrapText(state.activeSectorEvent.copy, boxX, boxY + 20, boxW, 14);
  ctx.restore();
}

function drawDebugOverlay() {
  const lines = debugLines();
  const boxWidth = 360;
  const boxHeight = 96;
  const dockLayout = state.mode === "dock";
  const boxX = dockLayout ? 18 : 18;
  const boxY = dockLayout ? 132 : HEIGHT - 120;
  ctx.save();
  ctx.fillStyle = "rgba(3, 9, 16, 0.9)";
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
  ctx.strokeStyle = "rgba(121, 216, 255, 0.28)";
  ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
  ctx.fillStyle = "#9ef59f";
  ctx.font = "12px Menlo, Monaco, monospace";
  lines.forEach((line, index) => {
    ctx.fillText(line, boxX + 12, boxY + 24 + index * 18);
  });
  ctx.restore();
}

function drawSectorBackdrop() {
  const sectorId = state.currentSectorId;
  const palette = currentSector().palette;

  if (sectorId === "sol") {
    ctx.fillStyle = "rgba(255, 208, 118, 0.22)";
    ctx.beginPath();
    ctx.arc(WIDTH * 0.82, HEIGHT * 0.12, 96, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffd27a";
    ctx.beginPath();
    ctx.arc(WIDTH * 0.82, HEIGHT * 0.12, 58, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (sectorId === "barnards_star") {
    ctx.fillStyle = "rgba(255, 132, 102, 0.16)";
    ctx.beginPath();
    ctx.arc(WIDTH * 0.8, HEIGHT * 0.13, 72, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d67959";
    ctx.beginPath();
    ctx.arc(WIDTH * 0.8, HEIGHT * 0.13, 36, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (sectorId === "alpha_centauri") {
    ctx.fillStyle = "rgba(255, 223, 155, 0.12)";
    ctx.beginPath();
    ctx.arc(WIDTH * 0.77, HEIGHT * 0.12, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffd98c";
    ctx.beginPath();
    ctx.arc(WIDTH * 0.77, HEIGHT * 0.12, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 240, 194, 0.7)";
    ctx.beginPath();
    ctx.arc(WIDTH * 0.9, HEIGHT * 0.18, 16, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (sectorId === "sirius") {
    ctx.fillStyle = "rgba(188, 218, 255, 0.18)";
    ctx.beginPath();
    ctx.arc(WIDTH * 0.84, HEIGHT * 0.1, 86, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d5e8ff";
    ctx.beginPath();
    ctx.arc(WIDTH * 0.84, HEIGHT * 0.1, 46, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (sectorId === "tau_ceti") {
    ctx.fillStyle = "rgba(196, 255, 203, 0.14)";
    ctx.beginPath();
    ctx.arc(WIDTH * 0.84, HEIGHT * 0.14, 76, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#b9d88d";
    ctx.beginPath();
    ctx.arc(WIDTH * 0.84, HEIGHT * 0.14, 40, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.fillStyle = palette.glow;
  ctx.beginPath();
  ctx.arc(WIDTH * 0.83, HEIGHT * 0.15, 110, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(WIDTH * 0.83, HEIGHT * 0.15, 74, 0, Math.PI * 2);
  ctx.fillStyle = palette.planet;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(WIDTH * 0.79, HEIGHT * 0.11, 18, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fill();
}

function drawTravelOverlay() {
  if (!state.travelSequence) return;
  const sequence = state.travelSequence;
  const departPhase = sequence.phase === "depart";
  const progress = clamp(sequence.time / (departPhase ? sequence.departDuration : sequence.arrivalDuration), 0, 1);
  const legLabel = sequence.totalLegs > 1 ? `Leg ${Math.min(sequence.totalLegs, sequence.legIndex + 1)} / ${sequence.totalLegs}` : "Single jump";
  const remainingRoute = routeSummaryLabel(sequence.routeIds.slice(Math.min(sequence.legIndex, sequence.routeIds.length - 1)));
  const remainingFuel = Math.max(0, state.player.fuel);

  ctx.save();
  const streakCount = departPhase ? 26 : 18;
  const centerX = state.player.x;
  const centerY = state.player.y;
  ctx.strokeStyle = departPhase ? `rgba(121, 216, 255, ${0.18 + progress * 0.5})` : `rgba(238, 247, 255, ${0.12 + (1 - progress) * 0.26})`;
  ctx.lineWidth = departPhase ? 2.2 : 1.6;
  for (let index = 0; index < streakCount; index += 1) {
    const y = (index / streakCount) * HEIGHT + ((sequence.time * 160 + index * 17) % 22);
    const length = departPhase ? 50 + progress * 180 : 34 + (1 - progress) * 120;
    const x = departPhase ? centerX - 160 - index * 12 : centerX - 220 - index * 10;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + length, y);
    ctx.stroke();
  }

  if (departPhase) {
    ctx.fillStyle = `rgba(255, 207, 116, ${progress * 0.42})`;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 18 + progress * 76, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = `rgba(121, 216, 255, ${(1 - progress) * 0.24})`;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 92 - progress * 34, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#eef7ff";
  ctx.font = "700 18px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText(
    departPhase ? `Jumping to ${SECTORS[sequence.toSectorId].name}` : `Arriving in ${currentSector().name}`,
    28,
    HEIGHT - 54,
  );
  ctx.fillStyle = "#9dc0d6";
  ctx.font = "13px Avenir Next, Segoe UI, sans-serif";
  wrapText(
    departPhase
      ? `${legLabel}. ${sequence.totalLegs > 1 ? `${remainingRoute}. ${routeWaypointLabel(sequence.routeIds.slice(Math.min(sequence.legIndex, sequence.routeIds.length - 1)))}. ` : ""}Drive field climbing. The ship surges forward until the lane folds. Fuel remaining on exit: ${remainingFuel}.`
      : sequence.totalLegs > 1
        ? `Final arrival after ${jumpCountLabel(sequence.totalLegs)}. You drift into ${currentSector().name} with the plotted course finally burned off.`
        : "Hyperspace exit complete. You drift into local traffic before the lane fully hands you back control.",
    28,
    HEIGHT - 32,
    420,
    16,
  );
  ctx.restore();
}

function drawDockBackdrop() {
  ctx.save();
  ctx.fillStyle = "rgba(4, 10, 16, 0.96)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawStars();
  drawSectorBackdrop();
  drawStation();
  drawShip(currentSector().station.x + 68, currentSector().station.y, -Math.PI / 2, "#eef7ff", 1, false, state.player.hullId);
  ctx.restore();
}

function traceChamferPanel(x, y, width, height, cut = 18, lean = 12) {
  ctx.beginPath();
  ctx.moveTo(x + cut, y);
  ctx.lineTo(x + width - cut - lean, y);
  ctx.lineTo(x + width, y + cut);
  ctx.lineTo(x + width, y + height - cut);
  ctx.lineTo(x + width - cut, y + height);
  ctx.lineTo(x + cut + lean, y + height);
  ctx.lineTo(x, y + height - cut);
  ctx.lineTo(x, y + cut);
  ctx.closePath();
}

function traceConsoleButton(x, y, width, height, cut = 10) {
  ctx.beginPath();
  ctx.moveTo(x + cut, y);
  ctx.lineTo(x + width - cut, y);
  ctx.lineTo(x + width, y + height * 0.5);
  ctx.lineTo(x + width - cut, y + height);
  ctx.lineTo(x + cut, y + height);
  ctx.lineTo(x, y + height * 0.5);
  ctx.closePath();
}

function drawPopupOverlay() {
  if (state.popup?.style === "boarding") {
    drawBoardingPopup();
    return;
  }
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.font = "16px Avenir Next, Segoe UI, sans-serif";
  const boxWidth = 560;
  const copyWidth = boxWidth - 40;
  const lineHeight = 22;
  const copyLines = wrappedLineCount(state.popup.copy, copyWidth);
  const boxHeight = 74 + copyLines * lineHeight + 18;
  const box = { x: (WIDTH - boxWidth) * 0.5, y: (HEIGHT - boxHeight) * 0.5, w: boxWidth, h: boxHeight };
  traceChamferPanel(box.x, box.y, box.w, box.h, 18, 12);
  ctx.fillStyle = "rgba(6, 15, 24, 0.95)";
  ctx.fill();
  ctx.strokeStyle = "rgba(121, 216, 255, 0.38)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 207, 116, 0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(box.x + 26, box.y + 14);
  ctx.lineTo(box.x + box.w - 42, box.y + 14);
  ctx.stroke();
  ctx.fillStyle = "rgba(121, 216, 255, 0.16)";
  ctx.fillRect(box.x + 18, box.y + 16, 120, 4);
  ctx.fillStyle = "#eef7ff";
  ctx.font = "700 22px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText(state.popup.title, box.x + 20, box.y + 36);
  ctx.fillStyle = "#a8bdd1";
  ctx.font = "16px Avenir Next, Segoe UI, sans-serif";
  wrapText(state.popup.copy, box.x + 20, box.y + 66, box.w - 40, lineHeight);
  ctx.restore();
}

function drawBoardingPopup() {
  const options = state.popup.options || [];
  const selectedIndex = clamp(state.selectedMenuIndex, 0, Math.max(0, options.length - 1));
  const boxWidth = 320;
  const copyX = 18;
  const copyY = 54;
  const copyWidth = boxWidth - 36;
  const copyLineHeight = 16;
  const copyLines = wrappedLineCount(state.popup.copy, copyWidth);
  const copyHeight = copyLines * copyLineHeight;
  const optionsStartY = copyY + copyHeight + 22;
  const optionRowHeight = 40;
  const footerGap = 24;
  const footerHeight = 18;
  const boxHeight = optionsStartY + options.length * optionRowHeight + footerGap + footerHeight;
  const edgePinned = state.popup.anchorX < 138 || state.popup.anchorX > WIDTH - 138 || state.popup.anchorY < 110 || state.popup.anchorY > HEIGHT - 110;
  const boxX = edgePinned
    ? (WIDTH - boxWidth) * 0.5
    : clamp(state.popup.anchorX - boxWidth * 0.5, 28, WIDTH - boxWidth - 28);
  const boxY = edgePinned
    ? clamp(HEIGHT * 0.2, 34, HEIGHT - boxHeight - 34)
    : clamp(state.popup.anchorY - boxHeight * 0.5, 34, HEIGHT - boxHeight - 34);
  const pointerX = clamp(state.popup.anchorX, boxX + 26, boxX + boxWidth - 26);
  const pointerY = clamp(state.popup.anchorY + boxHeight * 0.5 - 8, boxY + boxHeight + 18, HEIGHT - 12);

  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  if (!edgePinned) {
    ctx.strokeStyle = "rgba(121, 216, 255, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pointerX, pointerY);
    ctx.lineTo(state.popup.anchorX, state.popup.anchorY + 18);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(6, 15, 24, 0.96)";
  ctx.strokeStyle = "rgba(121, 216, 255, 0.42)";
  traceChamferPanel(boxX, boxY, boxWidth, boxHeight, 18, 10);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 207, 116, 0.24)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(boxX + 22, boxY + 12);
  ctx.lineTo(boxX + boxWidth - 36, boxY + 12);
  ctx.stroke();

  ctx.fillStyle = "#eef7ff";
  ctx.font = "700 18px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText(state.popup.title, boxX + 18, boxY + 30);

  ctx.fillStyle = "#a8bdd1";
  ctx.font = "13px Avenir Next, Segoe UI, sans-serif";
  wrapText(state.popup.copy, boxX + copyX, boxY + copyY, copyWidth, copyLineHeight);

  let optionY = boxY + optionsStartY;
  options.forEach((option, index) => {
    const selected = index === selectedIndex;
    ctx.fillStyle = selected ? "rgba(121, 216, 255, 0.18)" : "rgba(255, 255, 255, 0.03)";
    ctx.strokeStyle = selected ? "rgba(121, 216, 255, 0.7)" : "rgba(121, 216, 255, 0.16)";
    ctx.lineWidth = 1.5;
    traceConsoleButton(boxX + 14, optionY - 16, boxWidth - 28, 30, 10);
    ctx.fill();
    ctx.stroke();
    if (selected) {
      ctx.fillStyle = "rgba(255, 207, 116, 0.8)";
      ctx.beginPath();
      ctx.moveTo(boxX + 20, optionY - 1);
      ctx.lineTo(boxX + 28, optionY - 7);
      ctx.lineTo(boxX + 28, optionY + 5);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = option.disabled ? "#5f7385" : selected ? "#eef7ff" : "#c7d7e4";
    ctx.font = "700 12px Avenir Next, Segoe UI, sans-serif";
    ctx.fillText(option.label, boxX + (selected ? 34 : 24), optionY);
    if (option.meta) {
      ctx.fillStyle = option.disabled ? "#495b6c" : "#8ea4b6";
      ctx.font = "10px Avenir Next, Segoe UI, sans-serif";
      ctx.fillText(option.meta, boxX + (selected ? 34 : 24), optionY + 13);
    }
    optionY += optionRowHeight;
  });

  ctx.fillStyle = "#79d8ff";
  ctx.font = "10px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText("A confirm  B cancel", boxX + 18, boxY + boxHeight - 12);
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
  ctx.fillStyle = "#eef7ff";
  ctx.font = "700 28px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText("Starmap", 42, 56);
  ctx.fillStyle = "#8ea4b6";
  ctx.font = "14px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText("North toggles the chart, south confirms a course, and B backs out. Plot full routes and watch the highlight live.", 42, 78);

  ctx.save();
  ctx.translate(state.starmapCamera.x, state.starmapCamera.y);
  drawStarmapSingularities();
  ctx.lineWidth = 2;
  for (const node of STAR_MAP) {
    if (!sectorIsKnown(node.id) && node.id !== state.currentSectorId) continue;
    const sector = SECTORS[node.id];
    for (const neighborId of sector.neighbors) {
      if (!sectorIsKnown(neighborId) && neighborId !== state.currentSectorId) continue;
      if (neighborId < node.id) continue;
      const neighborNode = STAR_MAP.find((entry) => entry.id === neighborId);
      if (!neighborNode) continue;
      ctx.strokeStyle = mapLaneStroke(node.id, neighborId);
      ctx.beginPath();
      ctx.moveTo(node.x * WIDTH, node.y * HEIGHT);
      ctx.lineTo(neighborNode.x * WIDTH, neighborNode.y * HEIGHT);
      ctx.stroke();
    }
  }

  for (const node of STAR_MAP) {
    if (!sectorIsKnown(node.id) && node.id !== state.currentSectorId) continue;
    const selected = selectedStarmapSectorId() === node.id;
    const contractLabel = contractBadgeShort(node.id);
    ctx.fillStyle = mapNodeFill(node.id, selected);
    ctx.beginPath();
    ctx.arc(node.x * WIDTH, node.y * HEIGHT, node.id === state.currentSectorId ? 10 : 7, 0, Math.PI * 2);
    ctx.fill();
    if (authoritySector(node.id)) {
      ctx.strokeStyle = node.id === state.currentSectorId ? "rgba(255, 217, 128, 0.9)" : "rgba(192, 209, 255, 0.72)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(node.x * WIDTH, node.y * HEIGHT, node.id === state.currentSectorId ? 15 : 11, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#ffd980";
      ctx.fillRect(node.x * WIDTH - 2, node.y * HEIGHT - 20, 4, 4);
    }
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
  ctx.restore();
  drawStarmapMissionPanel();
  ctx.restore();
}

function drawStarmapMissionPanel() {
  const panelX = WIDTH - 330;
  const panelY = 112;
  const panelW = 294;
  const panelH = 318;
  const selectedSectorId = selectedStarmapSectorId();
  const selectedContracts = selectedSectorId ? contractsForSector(selectedSectorId) : [];

  ctx.save();
  ctx.fillStyle = "rgba(6, 15, 24, 0.9)";
  ctx.strokeStyle = "rgba(121, 216, 255, 0.26)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(panelX, panelY, panelW, panelH, 20);
  ctx.fill();
  ctx.stroke();

  const selectedSector = selectedSectorId ? SECTORS[selectedSectorId] : null;
  const panelTitle = selectedSector?.name || "Course Plot";
  ctx.fillStyle = "#eef7ff";
  ctx.font = "700 18px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText(panelTitle, panelX + 18, panelY + 28);
  ctx.fillStyle = "#8ea4b6";
  ctx.font = "13px Avenir Next, Segoe UI, sans-serif";
  const selectedPlan = selectedSector ? travelPlanForSector(selectedSector.id) : null;
  const summaryText = selectedSector
    ? (selectedPlan?.blockedReason
        ? `${selectedSector.name} is ${selectedPlan.jumpCount ? `${jumpCountLabel(selectedPlan.jumpCount)} out` : "on the chart"}, but ${selectedPlan.blockedReason}.`
        : selectedPlan?.jumpCount
          ? `${selectedSector.name} is ${jumpCountLabel(selectedPlan.jumpCount)} out. ${selectedPlan.waypointLabel}.`
          : `${selectedSector.name} is already under your keel.`)
    : "Route view across every active commitment in your hold.";
  wrapText(summaryText, panelX + 18, panelY + 50, panelW - 36, 16);

  let cardY = panelY + 86;
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
    const highlighted = contract.destinationId === selectedSectorId;
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
  ctx.fillText("Amber lanes mark the plotted course under your cursor.", panelX + 18, panelY + panelH - 16);
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

function wrappedLineCount(text, width) {
  const words = text.split(" ");
  let line = "";
  let lines = 0;
  for (const word of words) {
    const test = `${line}${word} `;
    if (ctx.measureText(test).width > width && line) {
      lines += 1;
      line = `${word} `;
    } else {
      line = test;
    }
  }
  if (line) {
    lines += 1;
  }
  return Math.max(1, lines);
}

function updateFlight(dt) {
  if (playerIsInEscapePod()) {
    updateEscapeSequence(dt);
    return;
  }
  const input = readFlightInput();
  const actionLocked = performance.now() < state.actionLockUntil;
  const keyboardMoveX = (keyboard.right ? 1 : 0) - (keyboard.left ? 1 : 0);
  const keyboardMoveY = (keyboard.down ? 1 : 0) - (keyboard.up ? 1 : 0);
  const moveX = Math.abs(input.moveX) > Math.abs(keyboardMoveX) ? input.moveX : keyboardMoveX;
  const moveY = Math.abs(input.moveY) > Math.abs(keyboardMoveY) ? input.moveY : keyboardMoveY;

  if (!actionLocked && input.chill) {
    toggleAutopilot();
  }

  if (state.autopilot.enabled && (moveX || moveY)) {
    disableAutopilot({ message: "Manual control restored." });
  }

  if (state.autopilot.enabled) {
    updateAutopilot(dt);
  } else if (moveX || moveY) {
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
  if (keyboard.pause) {
    keyboard.pause = false;
    openStarmap("flight", preferredMissionDestination());
    return;
  }
}

function updateEnemyShips(dt) {
  if (playerIsInEscapePod()) {
    for (const ship of state.enemyShips) {
      if (!ship.disabled) {
        ship.disposition = ship.type === "patrol" ? "neutral" : ship.disposition === "hostile" ? "suspicious" : ship.disposition;
        ship.contactState = ship.disabled ? "boardable" : ship.disposition;
      }
    }
    return;
  }
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

function updateEscorts(dt, options = {}) {
  const allowCombat = options.allowCombat !== false;
  if (state.escortHangar.length === 0 || playerIsInEscapePod()) return;
  syncEscortFlightStates();

  state.escortHangar.forEach((escort, index) => {
    const escortState = state.escortFlightStates[index];
    if (!escortState) return;
    const trailDistance = state.escortCommand === "regroup" ? 44 : state.escortCommand === "follow" ? 64 : 78 + index * 18;
    const sideOffset = (index - (state.escortHangar.length - 1) * 0.5) * 34;
    const targetX = state.player.x - Math.cos(state.player.angle) * trailDistance + Math.sin(state.player.angle) * sideOffset;
    const targetY = state.player.y - Math.sin(state.player.angle) * trailDistance - Math.cos(state.player.angle) * sideOffset;
    const dx = targetX - escortState.x;
    const dy = targetY - escortState.y;
    const distToSlot = Math.hypot(dx, dy);
    const desiredAngle = distToSlot > 4 ? Math.atan2(dy, dx) : state.player.angle;
    const hull = HULLS[escort.hullId] || HULLS.cutter;
    escortState.angle += Math.sin(desiredAngle - escortState.angle) * 0.1;
    const accel = hull.accel * (state.escortCommand === "attack" ? 0.72 : 0.62);
    const topSpeed = hull.maxSpeed * (state.escortCommand === "regroup" ? 0.78 : 0.88);
    if (distToSlot > 10) {
      escortState.vx += Math.cos(escortState.angle) * accel * dt;
      escortState.vy += Math.sin(escortState.angle) * accel * dt;
    }
    escortState.vx *= distToSlot < 18 ? 0.9 : 0.985;
    escortState.vy *= distToSlot < 18 ? 0.9 : 0.985;
    const escortSpeed = Math.hypot(escortState.vx, escortState.vy);
    if (escortSpeed > topSpeed) {
      escortState.vx = (escortState.vx / escortSpeed) * topSpeed;
      escortState.vy = (escortState.vy / escortSpeed) * topSpeed;
    }
    escortState.x += escortState.vx * dt;
    escortState.y += escortState.vy * dt;
    if (distance(escortState, state.player) > 220) {
      escortState.x = targetX;
      escortState.y = targetY;
      escortState.vx = state.player.vx * 0.5;
      escortState.vy = state.player.vy * 0.5;
      escortState.angle = state.player.angle;
    }
    wrapBody(escortState);
    escortState.fireCooldown = Math.max(0, (escortState.fireCooldown || 0) - dt);
  });

  if (!allowCombat) return;

  state.escortHangar.forEach((escort, index) => {
    const escortState = state.escortFlightStates[index];
    if (!escortState) return;
    const { ship: target, dist } = nearestEscortTarget(escortState);
    if (!target) return;
    const range = state.escortCommand === "follow" ? 170 : state.escortCommand === "attack" ? 250 : 210;
    if (dist > range) return;
    const aim = angleTo(escortState, target);
    escortState.angle += Math.sin(aim - escortState.angle) * 0.12;
    if (escortState.fireCooldown > 0) return;
    fireEscortShot(escort, escortState, target, index);
    escortState.fireCooldown = escortFireCooldown((HULLS[escort.hullId] || HULLS.cutter).weaponProfile || "pulse");
  });
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
    if (bullet.from === "player" || bullet.from === "escort") {
      for (const ship of state.enemyShips) {
        if (distance(bullet, ship) <= 16) {
          const escort = bullet.from === "escort" ? state.escortHangar[bullet.escortIndex] || nearestEscortRecordTo(ship) : null;
          if (!ship.disabled) {
            ship.disposition = "hostile";
            ship.contactState = "hostile";
          }
          applyDamageToTarget(ship, bullet.damage, "#79d8ff", bullet.color);
          bullet.life = 0;
          if (!ship.disabled && ship.hull <= 18) {
            ship.disabled = true;
            ship.hull = Math.max(6, ship.hull);
            ship.shield = 0;
            ship.contactState = "boardable";
            awardKill(
              ship,
              bullet.from === "escort" ? "escort" : "player",
              escort,
            );
          } else if (ship.disabled && ship.hull <= 0) {
            destroyDisabledShip(
              ship,
              bullet.from === "escort" ? "escort" : "player",
              escort,
            );
          }
          break;
        }
      }
    } else if (!playerIsInEscapePod() && distance(bullet, state.player) <= 14) {
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
  for (const burst of state.bursts) {
    burst.life -= dt;
  }
  state.bursts = state.bursts.filter((burst) => burst.life > 0);
  state.scanCooldown = Math.max(0, state.scanCooldown - dt);
  const starmapTarget = state.mode === "starmap" ? starmapFocusTarget() : { x: 0, y: 0 };
  const settle = Math.min(1, dt * 5.8);
  state.starmapCamera.x += (starmapTarget.x - state.starmapCamera.x) * settle;
  state.starmapCamera.y += (starmapTarget.y - state.starmapCamera.y) * settle;
  if (state.activeSectorEvent) {
    state.activeSectorEvent.timeLeft -= dt;
    if (state.activeSectorEvent.timeLeft <= 0) {
      state.activeSectorEvent = null;
      chooseSectorEvent();
    }
  }
  if (state.bannerTimer > 0) {
    state.bannerTimer = Math.max(0, state.bannerTimer - dt);
    if (state.bannerTimer === 0) {
      state.banner = null;
    }
  }
}

function updateTravelSequence(dt) {
  const sequence = state.travelSequence;
  if (!sequence) return;

  sequence.time += dt;

  if (sequence.phase === "depart") {
    const accel = 520 + sequence.time * 780;
    state.player.vx += Math.cos(state.player.angle) * accel * dt;
    state.player.vy += Math.sin(state.player.angle) * accel * dt;
    state.player.vx *= 0.998;
    state.player.vy *= 0.998;
    state.player.x += state.player.vx * dt;
    state.player.y += state.player.vy * dt;

    if (sequence.time >= sequence.departDuration) {
      state.currentSectorId = sequence.toSectorId;
      updateDiscoveredSectors(sequence.toSectorId);
      advanceSectorConditions(sequence.toSectorId);
      chooseSectorEvent();
      triggerArrivalThreadPings(sequence.toSectorId);
      sequence.legIndex += 1;
      if (sequence.legIndex >= sequence.totalLegs) {
        const station = currentSector().station;
        const arrivalAngle = Math.atan2(station.y - HEIGHT * 0.5, station.x - 68);
        state.player.x = 68;
        state.player.y = clamp(station.y + (Math.random() * 80 - 40), 84, HEIGHT - 84);
        state.player.angle = arrivalAngle;
        state.player.vx = Math.cos(arrivalAngle) * 172;
        state.player.vy = Math.sin(arrivalAngle) * 172;
        sequence.phase = "arrival";
        sequence.time = 0;
        setStatus(`Hyperspace exit complete in ${currentSector().name}.`, { tag: "Jump" });
        setHint("You drop into the system hot, then settle back into local drift.");
      } else {
        sequence.fromSectorId = state.currentSectorId;
        sequence.toSectorId = sequence.routeIds[sequence.legIndex + 1];
        sequence.time = 0;
        setTravelDeparturePose();
        setStatus(`Course holds through ${currentSector().name}. ${jumpCountLabel(sequence.totalLegs - sequence.legIndex)} remain to ${SECTORS[sequence.finalSectorId].name}.`, { tag: "Jump" });
        setHint(`${routeWaypointLabel(sequence.routeIds.slice(sequence.legIndex))}. Fuel reserve now ${state.player.fuel}.`);
      }
    }
    return;
  }

  const station = currentSector().station;
  const targetAngle = Math.atan2(station.y - state.player.y, station.x - state.player.x);
  state.player.angle = targetAngle;
  state.player.vx += Math.cos(targetAngle) * 42 * dt;
  state.player.vy += Math.sin(targetAngle) * 42 * dt;
  state.player.vx *= 0.986;
  state.player.vy *= 0.986;
  state.player.x += state.player.vx * dt;
  state.player.y += state.player.vy * dt;

  if (sequence.time >= sequence.arrivalDuration) {
    enterFlightMode(`Arrived in ${currentSector().name}.`, {
      arrival: true,
      spawnX: state.player.x,
      spawnY: state.player.y,
      vx: state.player.vx * 0.58,
      vy: state.player.vy * 0.58,
      angle: state.player.angle,
    });
    openArrivalPopup();
  }
}

function handleMenuInput(now) {
  if (state.mode === "starmap") {
    const nextSectorId = starmapDirectionalNavigation(now);
    if (nextSectorId) {
      setStarmapSelection(nextSectorId);
    }
  } else if (state.mode === "dock" && state.dockScreen === "contract-thread") {
    const intent = threadNavigationIntent(now);
    if (intent.scroll !== 0) {
      state.threadScrollOffset = clamp(
        (Number.isFinite(state.threadScrollOffset) ? state.threadScrollOffset : state.threadScrollMax) + intent.scroll * THREAD_SCROLL_STEP,
        0,
        state.threadScrollMax,
      );
    } else if (intent.reply !== 0) {
      state.selectedMenuIndex = clamp(state.selectedMenuIndex + intent.reply, 0, menuEntries().length - 1);
    }
  } else {
    const nav = gamepadNavigation(now) || ((keyboard.down ? 1 : 0) - (keyboard.up ? 1 : 0));
    if (nav !== 0) {
      state.selectedMenuIndex = clamp(state.selectedMenuIndex + nav, 0, menuEntries().length - 1);
      keyboard.up = false;
      keyboard.down = false;
    }
  }

  const pad = activePad();
  const confirmPressed = keyboard.fire || keyboard.pause || (pad && buttonJustPressed(`pad-${pad.index}-confirm-menu`, buttonPressed(pad, 0)));
  const chartTogglePressed = state.mode === "starmap" && (
    keyboard.map
    || (pad && buttonJustPressed(`pad-${pad.index}-map`, buttonPressed(pad, 3)))
  );
  const backPressed = keyboard.back || (pad && buttonJustPressed(`pad-${pad.index}-back-menu`, buttonPressed(pad, 1)));
  const undockPressed = keyboard.undock;

  if (undockPressed) {
    keyboard.undock = false;
    if (!state.popup && state.mode === "dock" && state.dockScreen === "root") {
      state.previousDockIndex = state.selectedMenuIndex;
      enterFlightMode("Undocking from station command deck.");
      return;
    }
  }

  if (confirmPressed) {
    consumeMenuConfirmInput(pad);
    const entry = state.mode === "starmap"
      ? menuEntries().find((item) => item.label === SECTORS[selectedStarmapSectorId()]?.name)
      : menuEntries()[state.selectedMenuIndex];
    if (entry) {
      if (entry.disabled) {
        entry.confirmBlocked?.();
      } else {
        entry.confirm();
      }
    }
  }

  if (chartTogglePressed) {
    keyboard.map = false;
    closeStarmap();
    return;
  }

  if (backPressed) {
    keyboard.back = false;
    if (state.popup) {
      closePopup();
    } else if (state.mode === "dock") {
      if (state.dockScreen !== "root") {
        closeDockScreen();
      } else {
        state.previousDockIndex = state.selectedMenuIndex;
        enterFlightMode("Undocking from station command deck.");
      }
    } else if (state.mode === "starmap") {
      closeStarmap();
    }
  }
}

function update(now) {
  const dt = Math.min((now - state.lastTime) / 1000 || 0, 0.033);
  state.lastTime = now;

  if (state.mode === "transit") {
    updateSparks(dt);
    updateTravelSequence(dt);
    updateEscorts(dt, { allowCombat: false });
  } else if (state.mode === "flight" && !state.popup) {
    updateFlight(dt);
    updateEnemyShips(dt);
    updateEscorts(dt);
    updateBullets(dt);
    updateSparks(dt);
    maybeTriggerLaneEncounter(dt);
  } else {
    updateSparks(dt);
  }
  updatePresentation(dt);

  if ((state.mode === "dock" || state.mode === "starmap" || state.popup) && state.mode !== "transit") {
    handleMenuInput(now);
  }

  maybeAutosave(now);

  render();
  drawFlightScene();
  requestAnimationFrame(update);
}

function preferredMissionDestination() {
  const active = state.activeContracts.find((contract) => sectorIsKnown(contract.destinationId)) || state.activeContracts[0];
  return active?.destinationId || currentSector().neighbors[0] || null;
}

function missionBriefSummary() {
  if (!state.activeContracts.length) {
    return "No active jobs yet. Open Messages when docked, take a thread that matters, and the next destination will stop feeling theoretical.";
  }
  return state.activeContracts.slice(0, 4).map((contract, index) => {
    const destination = SECTORS[contract.destinationId]?.name || "Unknown sector";
    const what = contract.type === "cargo" || contract.type === "smuggling"
      ? `Deliver ${commodityById(contract.commodityId)?.name || contract.title}`
      : contract.type === "courier"
        ? "Deliver the packet"
        : contract.type === "salvage"
          ? `Board ${contract.requiredBoards || 1} disabled ship${contract.requiredBoards === 1 ? "" : "s"}`
          : contract.type === "bounty"
            ? `Clear ${contract.requiredKills || 1} hostile ship${contract.requiredKills === 1 ? "" : "s"}`
            : contract.title;
    return `${index + 1}. ${contract.title} -> ${destination}. ${what}.`;
  }).join(" ");
}

function openMissionBriefFromPause() {
  window.ArcadeCabinet?.closePause?.();
  openPopup({
    title: "Current Mission Brief",
    copy: missionBriefSummary(),
    options: [
      {
        label: "Continue",
        meta: "Close this brief.",
        confirm() {
          closePopup();
        },
      },
      {
        label: "Open Starmap",
        meta: "Plot against your current active work.",
        confirm() {
          closePopup();
          const returnMode = state.mode === "dock" ? "dock" : "flight";
          openStarmap(returnMode, preferredMissionDestination());
        },
      },
    ],
  });
}

function openMissionChartFromPause() {
  window.ArcadeCabinet?.closePause?.();
  const returnMode = state.mode === "dock" ? "dock" : "flight";
  openStarmap(returnMode, preferredMissionDestination());
}

function openContactLegendFromPause() {
  window.ArcadeCabinet?.closePause?.();
  openPopup({
    title: "Contact Legend",
    copy: "Authority: lawful patrol and checkpoint traffic. Freighter: civilian trade ships. Smuggler: gray-market runners and Nightglass couriers. Hostile: ships committed to a fight. Suspicious: traffic that is circling, leaning in, or not yet sure whether to run or bite.",
    options: [
      {
        label: "Continue",
        meta: "Close this legend card.",
        confirm() {
          closePopup();
        },
      },
    ],
  });
}

function openArchiveFromPause() {
  window.ArcadeCabinet?.closePause?.();
  if (state.mode === "dock") {
    openDockScreen("archive");
    return;
  }
  const latestRumor = latestRumorForSector(state.currentSectorId);
  openPopup({
    title: "Archive Summary",
    copy: `${archiveOverviewCopy()} ${latestRumor ? `Latest dock whisper on ${currentSector().name}: ${latestRumor}` : `No current dock whisper is logged for ${currentSector().name}.`}`,
    options: [
      {
        label: "Continue",
        meta: "Close this summary.",
        confirm() {
          closePopup();
        },
      },
    ],
  });
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
        id: "reload",
        label: "Reload Game",
        run() {
          reloadGame();
        },
      },
      {
        id: "mission-brief",
        label: "Mission Brief",
        run() {
          openMissionBriefFromPause();
        },
      },
      {
        id: "starmap",
        label: "Open Starmap",
        run() {
          openMissionChartFromPause();
        },
      },
      {
        id: "archive",
        label: "Open Archive",
        run() {
          openArchiveFromPause();
        },
      },
      {
        id: "contact-legend",
        label: "Contact Legend",
        run() {
          openContactLegendFromPause();
        },
      },
    ];
  },
};

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    autosaveGame();
  }
});

window.addEventListener("pagehide", () => {
  autosaveGame();
});

window.addEventListener("beforeunload", () => {
  autosaveGame();
});

seedSectorConditions();

if (!loadMostRecentGame()) {
  enterDockMode("Docked. First run starts at Grey Exchange.");
}
render();
drawFlightScene();
requestAnimationFrame(update);
