import { createArcadeStage } from "../../shared/arcade-stage.js";

const BUILD_NUMBER = "2026.04.21.2";
const WIDTH = 960;
const HEIGHT = 600;
const NAV_REPEAT_DELAY = 180;
const DEADZONE = 0.28;
const MAX_ESCORTS = 3;
const MAX_PARTY_PLAYERS = 4;
const INTERACT_RANGE = 58;
const BOARD_RANGE = 76;
const SHOT_SPEED = 420;
const ENEMY_SHOT_SPEED = 280;
const MAX_PLAYER_SPEED = 250;
const PLAYER_ACCELERATION = 210;
const PLAYER_FRICTION = 0.992;
const STAR_COUNT = 140;
const SAVE_STORAGE_PREFIX = "arcade.whispering-willow.save.slot";
const SAVE_NAME_STORAGE_PREFIX = "arcade.whispering-willow.save.slotname";
const SAVE_SLOT_COUNT = 3;
const AUTOSAVE_INTERVAL_MS = 12000;
const SCAN_RANGE = 122;
const EVENT_DURATION = 18;
const SECTOR_STATE_TURNS = 4;
const ENCOUNTER_DELAY_RANGE = [7, 12];
const LANE_ENCOUNTER_POPUPS_ENABLED = false;
const STORY_ADVENTURE_MODE = true;
const ESCAPE_POD_SPEED = 118;
const MESSAGE_LOG_LIMIT = 18;
const THREAD_SCROLL_STEP = 54;
const VOICE_MANIFEST_PATH = "./assets/audio/voice-manifest.json";
const VOICE_VOLUME = 0.86;
const VOICE_REPLAY_DEDUPE_MS = 1200;
const MUSIC_FADE_RATE = 1.8;
const MUSIC_DUCK_VOLUME = 0.12;
const MUSIC_TRACKS = {
  dock: {
    title: "Roots of Lumen",
    file: "./assets/audio/music/roots-of-lumen-dock.mp3",
    volume: 0.32,
  },
  flight: {
    title: "Willowlight Path",
    file: "./assets/audio/music/willowlight-path-flight.mp3",
    volume: 0.38,
  },
  starmap: {
    title: "Roots of Lumen - Long Map",
    file: "./assets/audio/music/roots-of-lumen-map.mp3",
    volume: 0.28,
  },
  tension: {
    title: "Willowlight Path - Tension",
    file: "./assets/audio/music/willowlight-path-tension.mp3",
    volume: 0.34,
  },
};
const MUSIC_PLAYLIST = ["dock", "flight", "starmap", "tension"];
const AUTOPILOT_ORBIT_RADIUS = 172;
const AUTOPILOT_SPEED_TARGET = 116;
const AUTOPILOT_ACCEL_SCALE = 0.78;
const AUTOPILOT_ANGULAR_SPEED = 0.22;
const GAMEPAD_RIGHT_BUMPER = 5;
const DEFAULT_EMOTE_DURATION = 0.9;
const ESCORT_CALLSIGN_BANK = {
  dinghy: ["Skiff", "Bailer", "Patch", "Scull", "Pebble", "Tiller"],
  kestrel: ["Wake", "Spray", "Needle", "Reed", "Morrow", "Gale"],
  cutter: ["Swift", "Current", "Slip", "Tern", "Bright", "Sail"],
  raider: ["Hook", "Spur", "Bite", "Rook", "Flint", "Squall"],
  corvette: ["Bulwark", "Keel", "Rampart", "Mainmast", "Lancer", "Breakwater"],
  patrol: ["Ward", "Beacon", "Sentinel", "Lantern", "Harbor", "Talon"],
  trader: ["Ballast", "Longline", "Drift", "Caravel", "Ledger", "Fathom"],
  smuggler: ["Veil", "Hush", "Ghostwake", "Quiet", "Cipher", "Mist"],
  tug: ["Towline", "Anchor", "Spar", "Mudhook", "Bollard", "Clamp"],
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

const PARTY_SLOT_STYLES = [
  { name: "Traveler One", tint: "#eef7df", accent: "#9fe0a8" },
  { name: "Traveler Two", tint: "#ffdca8", accent: "#f0b36b" },
  { name: "Traveler Three", tint: "#cfe7ff", accent: "#8fc7ff" },
  { name: "Traveler Four", tint: "#f0d7ff", accent: "#c9a5ff" },
];

const FLIGHT_EMOTES = [
  { id: "lantern-bloom", label: "Lantern bloom", status: "flashes a lantern bloom", color: "#f6dd82", duration: 0.82 },
  { id: "willow-spin", label: "Willow spin", status: "pulls a full willow spin", color: "#aef4d5", duration: 0.74 },
  { id: "moon-glow", label: "Moon glow", status: "glows moon-blue for a beat", color: "#9ec9ff", duration: 0.96 },
  { id: "spark-ring", label: "Spark ring", status: "draws a spark ring", color: "#ffd280", duration: 1.05 },
];

document.title = `Whispering Willow build ${BUILD_NUMBER}`;

const cabinetStage = createArcadeStage({
  shell: playfieldShell,
  stage: playfieldStage,
  canvas,
  logicalWidth: WIDTH,
  logicalHeight: HEIGHT,
});

const COMMODITIES = [
  { id: "food", name: "Trail Provisions", base: 34, mass: 1 },
  { id: "ore", name: "Rootstone Bundles", base: 52, mass: 1 },
  { id: "meds", name: "Herbal Remedies", base: 96, mass: 1 },
  { id: "lux", name: "Festival Trinkets", base: 118, mass: 1 },
  { id: "munitions", name: "Hunter's Kit", base: 88, mass: 1 },
  { id: "contraband", name: "Forbidden Charms", base: 154, mass: 1 },
];

const HULLS = {
  dinghy: { name: "Patch Skiff", classRole: "Pocket sailer", silhouette: "dinghy", maxHull: 74, maxShield: 20, shieldRegen: 6, cargoCap: 4, fuelCap: 2, turn: 0.084, accel: 206, maxSpeed: 236, friction: 0.992, boardBonus: 0.01, sale: 160, weaponProfile: "pulse", slotText: "Little storm charm" },
  kestrel: { name: "Needle Sloop", classRole: "Quick island runner", silhouette: "kestrel", maxHull: 100, maxShield: 46, shieldRegen: 9, cargoCap: 6, fuelCap: 3, turn: 0.076, accel: 228, maxSpeed: 266, friction: 0.991, boardBonus: 0.02, sale: 420, weaponProfile: "pulse", slotText: "Spray-fast rig" },
  cutter: { name: "Banyan Cutter", classRole: "Swift courier sailer", silhouette: "cutter", maxHull: 120, maxShield: 58, shieldRegen: 10, cargoCap: 8, fuelCap: 4, turn: 0.068, accel: 212, maxSpeed: 252, friction: 0.992, boardBonus: 0.04, sale: 620, weaponProfile: "pulse", slotText: "Courier rigging" },
  raider: { name: "Hook Brig", classRole: "Boarding raider", silhouette: "raider", maxHull: 146, maxShield: 34, shieldRegen: 7, cargoCap: 5, fuelCap: 3, turn: 0.082, accel: 240, maxSpeed: 274, friction: 0.989, boardBonus: 0.08, sale: 780, weaponProfile: "scatter", slotText: "Hook-and-swarm deck" },
  corvette: { name: "Sunward Brigantine", classRole: "Heavy war sailer", silhouette: "corvette", maxHull: 180, maxShield: 84, shieldRegen: 12, cargoCap: 9, fuelCap: 6, turn: 0.056, accel: 182, maxSpeed: 226, friction: 0.993, boardBonus: 0.12, sale: 1220, weaponProfile: "rail", slotText: "Long gun deck" },
  patrol: { name: "Warden Sloop", classRole: "Harbor interceptor", silhouette: "patrol", maxHull: 134, maxShield: 64, shieldRegen: 11, cargoCap: 5, fuelCap: 4, turn: 0.07, accel: 214, maxSpeed: 248, friction: 0.992, boardBonus: 0.05, sale: 920, weaponProfile: "pulse", slotText: "Lantern watch rig" },
  trader: { name: "Lantern Caravel", classRole: "Civilian merchantman", silhouette: "trader", maxHull: 156, maxShield: 52, shieldRegen: 8, cargoCap: 14, fuelCap: 5, turn: 0.052, accel: 158, maxSpeed: 206, friction: 0.994, boardBonus: 0.01, sale: 860, weaponProfile: "missile", slotText: "Wide hold and awning" },
  smuggler: { name: "Moonveil Smack", classRole: "Hidden-run cutter", silhouette: "cutter", maxHull: 128, maxShield: 62, shieldRegen: 10, cargoCap: 9, fuelCap: 5, turn: 0.074, accel: 222, maxSpeed: 264, friction: 0.99, boardBonus: 0.06, sale: 980, weaponProfile: "scatter", slotText: "False-bottom rig" },
  tug: { name: "Mossback Barge", classRole: "Heavy tow sailer", silhouette: "trader", maxHull: 194, maxShield: 44, shieldRegen: 7, cargoCap: 16, fuelCap: 4, turn: 0.044, accel: 138, maxSpeed: 188, friction: 0.995, boardBonus: 0.03, sale: 1040, weaponProfile: "pulse", slotText: "Tow mast and winch" },
};

const HULL_MENU_ART = {
  dinghy: "./assets/concepts/ships/patch-skiff-card.png",
  kestrel: "./assets/concepts/ships/reed-runner-boat.png",
  cutter: "./assets/concepts/ships/banyan-cutter-card.png",
  trader: "./assets/concepts/ships/lantern-caravel-card.png",
  tug: "./assets/concepts/ships/mossback-barge-boat.png",
  raider: "./assets/concepts/ships/ember-snipe-skiff.png",
  smuggler: "./assets/concepts/ships/moonveil-smack-card.png",
  patrol: "./assets/concepts/ships/warden-sloop-card.png",
  corvette: "./assets/concepts/ships/sunward-brigantine-card.png",
};

const SECTOR_MENU_ART = {
  grey_exchange: "./assets/concepts/places/mangrove-house-shore-card.png",
  union_harbor: "./assets/concepts/places/whispering-banyan-shore-card.png",
  shale_barrens: "./assets/concepts/places/crooked-sea-cave-card.png",
  authority_gate: "./assets/concepts/places/moonpool-shore-card.png",
  cinder_wake: "./assets/concepts/places/mossjaw-isle-card.png",
  iron_hollow: "./assets/concepts/places/lantern-quay-card.png",
  ember_market: "./assets/concepts/places/shell-market-card.png",
  mirage_verge: "./assets/concepts/places/moonglass-cay-card.png",
  sol: "./assets/concepts/places/sunroot-atoll-card.png",
  alpha_centauri: "./assets/concepts/places/reefspan-card.png",
  barnards_star: "./assets/concepts/places/driftwood-rest-card.png",
  sirius: "./assets/concepts/places/silverpool-card.png",
  tau_ceti: "./assets/concepts/places/quiet-keys-card.png",
  reedfall_basin: "./assets/concepts/places/whispering-banyan-shore-card.png",
  briar_hearth: "./assets/concepts/places/driftwood-rest-card.png",
  rootmirror_bog: "./assets/concepts/places/mossjaw-isle-card.png",
  hollow_door: "./assets/concepts/places/moonglass-cay-card.png",
};

const ARCHIVE_ART = {
  "primer:cluster": "./assets/archive/archipelago-primer-card.png",
  "primer:jumpwake": "./assets/archive/whispering-tides-lexicon-card.png",
  "faction:authority": "./assets/archive/wardens-card.png",
  "faction:frontier": "./assets/archive/hearthfolk-card.png",
  "faction:independent": "./assets/archive/wayfolk-card.png",
  "faction:nightglass": "./assets/archive/moonglass-circle-card.png",
  "faction:pirate": "./assets/archive/goblin-clans-card.png",
  "history:old-light-charter": "./assets/archive/old-tide-charter-card.png",
  "history:relay-ledger": "./assets/archive/ferry-ledger-card.png",
  "history:blue-archive-hearing": "./assets/archive/lagoon-hearing-card.png",
};

const FACTIONS = [
  { id: "independent", name: "Wayfolk" },
  { id: "authority", name: "Wardens" },
  { id: "frontier", name: "Hearthfolk" },
  { id: "pirate", name: "Goblin Clans" },
  { id: "syndicate", name: "Moonglass Circle" },
];

const SECTORS = {
  grey_exchange: {
    id: "grey_exchange",
    name: "Mangrove House",
    faction: "independent",
    description: "A weathered mangrove inn on stilts where island travelers trade stew, rumors, and careful hope before pushing back into the channels.",
    danger: 0.22,
    neighbors: ["union_harbor", "shale_barrens", "cinder_wake"],
    station: { x: 212, y: 316 },
    palette: { glow: "rgba(128, 194, 255, 0.09)", planet: "#6f8797", planetShadow: "#435664", station: "#8ddcff", stationWarm: "#ffcf74" },
    legality: "open",
    routeNotes: "A cozy starting quay with kind gossip, steady supplies, and boat channels leading toward stranger islands.",
    intel: "Herbal bundles, sailcloth, and hand-copied tide maps move steadily here. Mangrove House buys stories, good manners, and second chances.",
    shipyard: ["dinghy", "kestrel", "cutter"],
    traffic: { traders: 3, patrols: 1, pirates: 0, hostilePirates: 0, smugglers: 0 },
    economy: { food: 0.88, ore: 1.14, meds: 1.06, lux: 1.03, munitions: 1.08, contraband: 1.18 },
  },
  union_harbor: {
    id: "union_harbor",
    name: "Whispering Banyan",
    faction: "frontier",
    description: "An ancient banyan on a shrine isle where charms, healing water, and careful listeners gather whenever the archipelago starts speaking too loudly.",
    danger: 0.38,
    neighbors: ["grey_exchange", "authority_gate", "iron_hollow", "reedfall_basin"],
    station: { x: 742, y: 210 },
    palette: { glow: "rgba(147, 255, 201, 0.08)", planet: "#4f8c77", planetShadow: "#295445", station: "#a7ffe0", stationWarm: "#ffe081" },
    legality: "lawful",
    routeNotes: "A sacred shrine isle where healing tasks and gentle courage matter more than speed.",
    intel: "Herbs, tidewater, and old songs matter here. The banyan remembers who arrived to help and who only came to take.",
    shipyard: ["cutter", "trader"],
    traffic: { traders: 2, patrols: 1, pirates: 1, hostilePirates: 0, smugglers: 0 },
    economy: { food: 1.18, ore: 0.92, meds: 1.22, lux: 0.94, munitions: 1.14, contraband: 1.08 },
  },
  shale_barrens: {
    id: "shale_barrens",
    name: "Crooked Sea Cave",
    faction: "pirate",
    description: "A hidden sea cave under a bent island cliff where goblins skitter, secrets echo, and old tunnels breathe cold salt magic.",
    danger: 0.64,
    neighbors: ["grey_exchange", "authority_gate", "ember_market", "rootmirror_bog", "hollow_door"],
    station: { x: 694, y: 430 },
    palette: { glow: "rgba(255, 152, 118, 0.1)", planet: "#8a5944", planetShadow: "#4a2d24", station: "#ffb287", stationWarm: "#ffe29a" },
    legality: "pirate",
    routeNotes: "A dangerous threshold where tide tracks, stolen trinkets, and goblin trouble all converge.",
    intel: "Lantern wax, scavenged baubles, and frightened whispers gather here. Nobody agrees whether the cave is a den, a shrine, or both.",
    shipyard: ["raider", "smuggler"],
    traffic: { traders: 1, patrols: 0, pirates: 2, hostilePirates: 1, smugglers: 1 },
    economy: { food: 1.08, ore: 0.72, meds: 1.14, lux: 1.24, munitions: 0.82, contraband: 0.78 },
  },
  authority_gate: {
    id: "authority_gate",
    name: "Moonpool Shore",
    faction: "authority",
    description: "A moonlit lagoon shore where frightened magic gathers around reeds, smooth stones, and a child who does not yet understand what they carry.",
    danger: 0.41,
    neighbors: ["union_harbor", "shale_barrens", "iron_hollow", "reedfall_basin", "mirage_verge", "hollow_door", "sol"],
    station: { x: 544, y: 140 },
    palette: { glow: "rgba(255, 214, 124, 0.09)", planet: "#8074a6", planetShadow: "#4c486b", station: "#c0d1ff", stationWarm: "#ffd980" },
    legality: "strict",
    routeNotes: "A tense lagoon landing where watchful adults, drifting lights, and half-spoken fears crowd the shore.",
    intel: "The water reacts to strong feelings here. The wrong word can startle the whole moonpool into motion.",
    shipyard: ["patrol", "corvette"],
    traffic: { traders: 1, patrols: 2, pirates: 1, hostilePirates: 1, smugglers: 0 },
    economy: { food: 0.98, ore: 1.08, meds: 1.02, lux: 1.16, munitions: 1.28, contraband: 1.46 },
  },
  cinder_wake: {
    id: "cinder_wake",
    name: "Mossjaw Isle",
    faction: "independent",
    description: "A muddy jungle isle torn by tusk marks and old roots, watched over by a huge grumpy boar who may still decide you are worth trusting.",
    danger: 0.31,
    neighbors: ["grey_exchange", "iron_hollow", "rootmirror_bog"],
    station: { x: 306, y: 484 },
    palette: { glow: "rgba(255, 136, 96, 0.12)", planet: "#8f5a49", planetShadow: "#553126", station: "#ffc39a", stationWarm: "#ffd37d" },
    legality: "open",
    routeNotes: "A wild island of churned earth, boar trails, and signs that the archipelago is angrier than it should be.",
    intel: "Fallen fruit, rooting pits, and half-broken tide shrines mark the place. If Mossjaw likes you, the island softens. If not, it closes in.",
    shipyard: ["tug", "trader"],
    traffic: { traders: 2, patrols: 0, pirates: 1, hostilePirates: 0, smugglers: 0 },
    economy: { food: 1.04, ore: 0.68, meds: 1.12, lux: 1.1, munitions: 1.02, contraband: 1.2 },
  },
  iron_hollow: {
    id: "iron_hollow",
    name: "Lantern Quay",
    faction: "frontier",
    description: "A marshy quay of boardwalks and hanging lanterns where ferrymen, mushroom gatherers, and tide wardens trade practical help.",
    danger: 0.48,
    neighbors: ["union_harbor", "cinder_wake", "authority_gate", "ember_market", "rootmirror_bog"],
    station: { x: 432, y: 378 },
    palette: { glow: "rgba(167, 225, 255, 0.08)", planet: "#667584", planetShadow: "#3c4a56", station: "#b9e6ff", stationWarm: "#ffe19c" },
    legality: "lawful",
    routeNotes: "A damp crossing where supplies matter, channels shift, and every traveler wants dry boots by dusk.",
    intel: "Bog salt, glowcaps, and lantern oil move steadily. When the archipelago turns mean, Lantern Quay becomes everybody's problem at once.",
    shipyard: ["cutter", "tug", "trader"],
    traffic: { traders: 2, patrols: 1, pirates: 1, hostilePirates: 1, smugglers: 0 },
    economy: { food: 1.12, ore: 0.8, meds: 1.08, lux: 1.16, munitions: 1.2, contraband: 1.18 },
  },
  ember_market: {
    id: "ember_market",
    name: "Shell Market",
    faction: "syndicate",
    description: "A hidden shell bazaar under woven lanterns where charm-sellers, peddlers, and smiling strangers trade favors after dusk.",
    danger: 0.58,
    neighbors: ["shale_barrens", "iron_hollow", "mirage_verge", "sirius"],
    station: { x: 828, y: 356 },
    palette: { glow: "rgba(255, 112, 179, 0.1)", planet: "#8e5476", planetShadow: "#4f2f45", station: "#ffb6d6", stationWarm: "#ffd58d" },
    legality: "gray",
    routeNotes: "A secret market where rare charms, risky bargains, and island gossip change hands after dark.",
    intel: "Moon-seeds, glamours, and pocket promises all sell well here. The market is friendly right up until it isn't.",
    shipyard: ["smuggler", "raider", "corvette"],
    traffic: { traders: 1, patrols: 0, pirates: 1, hostilePirates: 1, smugglers: 2 },
    economy: { food: 1.02, ore: 1.02, meds: 1.18, lux: 0.92, munitions: 0.96, contraband: 0.72 },
  },
  mirage_verge: {
    id: "mirage_verge",
    name: "Moonglass Cay",
    faction: "syndicate",
    description: "A silver-blue cay of glassy pools and pale palms where reflections linger too long and channels forget where they were going.",
    danger: 0.67,
    neighbors: ["authority_gate", "ember_market", "tau_ceti", "hollow_door"],
    station: { x: 758, y: 92 },
    palette: { glow: "rgba(122, 182, 255, 0.12)", planet: "#5e75b0", planetShadow: "#344160", station: "#b9ccff", stationWarm: "#ffe6a1" },
    legality: "gray",
    routeNotes: "An eerie island edge where light bends strangely and every shortcut asks a price.",
    intel: "Moonlit petals, strange omens, and truth-bending reflections gather here. It is beautiful enough to make caution feel optional.",
    shipyard: ["smuggler", "patrol", "corvette"],
    traffic: { traders: 1, patrols: 1, pirates: 1, hostilePirates: 1, smugglers: 1 },
    economy: { food: 1.18, ore: 1.06, meds: 1.24, lux: 1.28, munitions: 1.12, contraband: 0.9 },
  },
  sol: {
    id: "sol",
    name: "Sunroot Atoll",
    faction: "authority",
    description: "A radiant old atoll around a giant root-crowned banyan where the oldest promises of the archipelago were once spoken aloud.",
    danger: 0.24,
    neighbors: ["authority_gate", "barnards_star", "sirius"],
    station: { x: 604, y: 82 },
    palette: { glow: "rgba(255, 196, 96, 0.18)", planet: "#d89b52", planetShadow: "#8c5f2b", station: "#ffd28a", stationWarm: "#fff1b0" },
    legality: "strict",
    routeNotes: "A bright sacred atoll tied to ancient island law, memory, and obligations older than any village.",
    intel: "Sunroot still behaves like the center of the old islands. People arrive here to ask permission, settle disputes, or remember who they were meant to be.",
    permit: "coreTransit",
    shipyard: ["cutter", "patrol", "corvette"],
    traffic: { traders: 3, patrols: 3, pirates: 0, hostilePirates: 0, smugglers: 0 },
    economy: { food: 1.02, ore: 1.18, meds: 0.98, lux: 1.2, munitions: 1.12, contraband: 1.56 },
  },
  alpha_centauri: {
    id: "alpha_centauri",
    name: "Reefspan",
    faction: "frontier",
    description: "A lively run of rope bridges and shallow reefs where families, traders, and wandering helpers keep the crossings useful.",
    danger: 0.34,
    neighbors: ["barnards_star", "briar_hearth", "tau_ceti", "sol"],
    station: { x: 728, y: 150 },
    palette: { glow: "rgba(255, 214, 142, 0.13)", planet: "#89a47c", planetShadow: "#4f5f45", station: "#d7f1c9", stationWarm: "#ffe29a" },
    legality: "lawful",
    routeNotes: "A practical run of bridges, skiffs, and shared work where kindness often arrives wearing wet boots.",
    intel: "Fresh produce, stitched sails, and channel news move well through Reefspan. It rewards people who show up when the weather turns bad.",
    shipyard: ["cutter", "trader", "tug"],
    traffic: { traders: 3, patrols: 1, pirates: 1, hostilePirates: 0, smugglers: 0 },
    economy: { food: 1.12, ore: 0.92, meds: 1.14, lux: 0.96, munitions: 1.02, contraband: 1.08 },
  },
  barnards_star: {
    id: "barnards_star",
    name: "Driftwood Rest",
    faction: "independent",
    description: "A driftwood camp with a dependable fire where practical folk stop before braving the darker outer isles.",
    danger: 0.29,
    neighbors: ["sol", "alpha_centauri", "briar_hearth", "tau_ceti"],
    station: { x: 548, y: 54 },
    palette: { glow: "rgba(255, 134, 104, 0.14)", planet: "#b26956", planetShadow: "#6b3d30", station: "#ffd0b3", stationWarm: "#ffe19a" },
    legality: "open",
    routeNotes: "A modest, trusted landing where stories are weighed carefully and supplies are never quite enough.",
    intel: "Stew, dry kindling, and boat nails move steadily. Driftwood Rest matters because sensible people keep making it matter.",
    shipyard: ["kestrel", "cutter", "tug"],
    traffic: { traders: 2, patrols: 1, pirates: 0, hostilePirates: 0, smugglers: 1 },
    economy: { food: 1.06, ore: 0.86, meds: 1.08, lux: 1.02, munitions: 1.04, contraband: 1.14 },
  },
  sirius: {
    id: "sirius",
    name: "Silverpool",
    faction: "authority",
    description: "A polished lakeside refuge of silver water, bright pennants, and very proper people who prefer mysteries to stay tidy.",
    danger: 0.36,
    neighbors: ["sol", "tau_ceti", "ember_market"],
    station: { x: 896, y: 164 },
    palette: { glow: "rgba(167, 213, 255, 0.16)", planet: "#7fa4c2", planetShadow: "#48637b", station: "#d7e8ff", stationWarm: "#fff0b4" },
    legality: "strict",
    routeNotes: "A refined waterside enclave where formality, old custom, and watchful eyes all travel together.",
    intel: "Silverwork, invitations, and ceremonial errands matter here. Silverpool remembers breaches of manners almost as strongly as breaches of law.",
    permit: "coreTransit",
    shipyard: ["patrol", "corvette", "trader"],
    traffic: { traders: 2, patrols: 3, pirates: 1, hostilePirates: 0, smugglers: 0 },
    economy: { food: 0.96, ore: 1.04, meds: 0.98, lux: 1.28, munitions: 1.18, contraband: 1.52 },
  },
  tau_ceti: {
    id: "tau_ceti",
    name: "Quiet Keys",
    faction: "syndicate",
    description: "A hush of little keys and hidden cottages where private bargains are made in soft voices above pale water.",
    danger: 0.52,
    neighbors: ["alpha_centauri", "barnards_star", "sirius", "mirage_verge", "hollow_door"],
    station: { x: 904, y: 84 },
    palette: { glow: "rgba(196, 255, 203, 0.1)", planet: "#7a8f63", planetShadow: "#445038", station: "#d1ffd8", stationWarm: "#ffdf9f" },
    legality: "gray",
    routeNotes: "A secretive key-cluster where favors, unusual remedies, and delicate truths move quietly from hand to hand.",
    intel: "Rare roots, sealed letters, and moonglass tokens all pass through Quiet Keys. Nothing here calls itself dangerous, which is part of the danger.",
    permit: "nightglassTransit",
    shipyard: ["smuggler", "trader", "corvette"],
    traffic: { traders: 2, patrols: 1, pirates: 1, hostilePirates: 1, smugglers: 2 },
    economy: { food: 1.04, ore: 1.0, meds: 1.16, lux: 1.18, munitions: 1.06, contraband: 0.76 },
  },
  reedfall_basin: {
    id: "reedfall_basin",
    name: "Reedfall Basin",
    faction: "frontier",
    description: "A bowl of green reeds, drowned steps, and patient survey stakes where every breeze sounds like someone counting names under their breath.",
    danger: 0.42,
    neighbors: ["union_harbor", "authority_gate", "briar_hearth", "rootmirror_bog"],
    station: { x: 188, y: 196 },
    palette: { glow: "rgba(148, 235, 184, 0.12)", planet: "#6a9b72", planetShadow: "#345a3c", station: "#bbf0c8", stationWarm: "#f6d47d" },
    legality: "lawful",
    routeNotes: "A flooded survey basin where witness stakes, reed bells, and old ferry names keep resurfacing.",
    intel: "Survey strings, bell reeds, and careful testimony matter here. Tamsin says the basin does not forget a name once the wind has carried it.",
    shipyard: ["dinghy", "kestrel", "cutter"],
    traffic: { traders: 2, patrols: 1, pirates: 1, hostilePirates: 0, smugglers: 1 },
    economy: { food: 1.08, ore: 0.94, meds: 1.2, lux: 0.98, munitions: 1.08, contraband: 1.16 },
  },
  briar_hearth: {
    id: "briar_hearth",
    name: "Briar Hearth",
    faction: "independent",
    description: "A high dry hearth wrapped in thornbloom and wind chimes, kept by bell-ringers who remember which crossings once welcomed the lost.",
    danger: 0.33,
    neighbors: ["barnards_star", "alpha_centauri", "reedfall_basin", "hollow_door"],
    station: { x: 256, y: 104 },
    palette: { glow: "rgba(245, 190, 126, 0.14)", planet: "#a87857", planetShadow: "#5c3d2d", station: "#ffd3a3", stationWarm: "#fff0ad" },
    legality: "open",
    routeNotes: "A dry refuge of bells, thornbloom, and practical memory where old welcome lists are still sung aloud.",
    intel: "Briar Hearth trades in nails, hearthsalt, and remembered names. If Ollie rings a bell for you, someone is about to be counted properly.",
    shipyard: ["kestrel", "cutter", "tug"],
    traffic: { traders: 2, patrols: 0, pirates: 0, hostilePirates: 0, smugglers: 1 },
    economy: { food: 0.94, ore: 1.04, meds: 1.08, lux: 1.0, munitions: 1.06, contraband: 1.08 },
  },
  rootmirror_bog: {
    id: "rootmirror_bog",
    name: "Rootmirror Bog",
    faction: "pirate",
    description: "A dark reflective bog where mangrove roots loop through black water and goblin children learn which reflections are safe to trust.",
    danger: 0.61,
    neighbors: ["cinder_wake", "iron_hollow", "shale_barrens", "reedfall_basin", "hollow_door"],
    station: { x: 496, y: 502 },
    palette: { glow: "rgba(99, 205, 168, 0.11)", planet: "#556d49", planetShadow: "#263625", station: "#9bd8a5", stationWarm: "#e7c476" },
    legality: "pirate",
    routeNotes: "A risky mirror-bog where hidden families, root marks, and underway scouts all watch the water.",
    intel: "Blackroot salve, smuggled food, and witness lanterns move quietly here. The bog rewards people who keep their voices soft and their promises exact.",
    shipyard: ["dinghy", "raider", "smuggler"],
    traffic: { traders: 1, patrols: 0, pirates: 2, hostilePirates: 1, smugglers: 2 },
    economy: { food: 1.14, ore: 0.78, meds: 1.18, lux: 1.22, munitions: 0.9, contraband: 0.74 },
  },
  hollow_door: {
    id: "hollow_door",
    name: "The Hollow Door",
    faction: "syndicate",
    description: "A root-wrapped threshold under a pale cliff where the official map becomes embarrassed and the old underways start naming prices.",
    danger: 0.7,
    neighbors: ["mirage_verge", "shale_barrens", "rootmirror_bog", "briar_hearth", "tau_ceti", "authority_gate"],
    station: { x: 628, y: 292 },
    palette: { glow: "rgba(196, 170, 255, 0.16)", planet: "#6a5e91", planetShadow: "#38334f", station: "#c9b8ff", stationWarm: "#f3d184" },
    legality: "gray",
    routeNotes: "A hidden threshold where ferry ghosts, broker debts, and old goblin crossings meet under one impossible lintel.",
    intel: "Door chalk, moonglass tokens, and witness marks all matter here. Mire Kest says the place only opens for people carrying a truth someone tried to close.",
    shipyard: ["smuggler", "raider", "patrol"],
    traffic: { traders: 1, patrols: 1, pirates: 1, hostilePirates: 1, smugglers: 2 },
    economy: { food: 1.18, ore: 0.92, meds: 1.2, lux: 1.3, munitions: 1.04, contraband: 0.7 },
  },
};

const ISLAND_BACKDROP_PROFILES = {
  grey_exchange: {
    waterTop: "rgba(77, 165, 198, 0.26)",
    waterMid: "rgba(28, 103, 132, 0.62)",
    waterBottom: "rgba(7, 43, 57, 0.94)",
    sand: "#d5c089",
    foliage: "#355f48",
    foliageDark: "#1d3a2a",
    trunk: "#5a4530",
    isletOffsetX: 0,
    isletOffsetY: 0,
    isletRx: 78,
    isletRy: 30,
    dockLength: 62,
    palms: 4,
    distantY: 0.72,
  },
  union_harbor: {
    waterTop: "rgba(97, 190, 201, 0.24)",
    waterMid: "rgba(33, 128, 128, 0.58)",
    waterBottom: "rgba(7, 56, 62, 0.94)",
    sand: "#e0d6a4",
    foliage: "#44795e",
    foliageDark: "#224533",
    trunk: "#685239",
    isletOffsetX: -6,
    isletOffsetY: -4,
    isletRx: 86,
    isletRy: 32,
    dockLength: 36,
    palms: 3,
    distantY: 0.69,
  },
  shale_barrens: {
    waterTop: "rgba(67, 154, 192, 0.22)",
    waterMid: "rgba(31, 88, 118, 0.64)",
    waterBottom: "rgba(10, 34, 46, 0.95)",
    sand: "#bca07d",
    foliage: "#4e5f38",
    foliageDark: "#2a3220",
    trunk: "#56412e",
    isletOffsetX: -4,
    isletOffsetY: 6,
    isletRx: 88,
    isletRy: 34,
    dockLength: 28,
    palms: 2,
    distantY: 0.75,
    cliff: true,
  },
  authority_gate: {
    waterTop: "rgba(109, 188, 222, 0.26)",
    waterMid: "rgba(54, 116, 173, 0.58)",
    waterBottom: "rgba(16, 53, 88, 0.95)",
    sand: "#ded2a8",
    foliage: "#4d7a66",
    foliageDark: "#274838",
    trunk: "#5e4934",
    isletOffsetX: 2,
    isletOffsetY: 2,
    isletRx: 82,
    isletRy: 30,
    dockLength: 40,
    palms: 2,
    distantY: 0.71,
  },
  cinder_wake: {
    waterTop: "rgba(74, 158, 187, 0.24)",
    waterMid: "rgba(38, 96, 116, 0.62)",
    waterBottom: "rgba(10, 39, 44, 0.96)",
    sand: "#c7b07f",
    foliage: "#49603a",
    foliageDark: "#27341f",
    trunk: "#62462d",
    isletOffsetX: -12,
    isletOffsetY: 10,
    isletRx: 90,
    isletRy: 36,
    dockLength: 22,
    palms: 5,
    distantY: 0.77,
  },
  iron_hollow: {
    waterTop: "rgba(95, 176, 193, 0.24)",
    waterMid: "rgba(31, 103, 111, 0.62)",
    waterBottom: "rgba(8, 50, 52, 0.96)",
    sand: "#d3c89c",
    foliage: "#46634f",
    foliageDark: "#21392d",
    trunk: "#5f4f39",
    isletOffsetX: -2,
    isletOffsetY: 3,
    isletRx: 84,
    isletRy: 31,
    dockLength: 72,
    palms: 3,
    distantY: 0.74,
  },
  ember_market: {
    waterTop: "rgba(88, 164, 205, 0.22)",
    waterMid: "rgba(49, 82, 138, 0.58)",
    waterBottom: "rgba(20, 38, 74, 0.94)",
    sand: "#dec28c",
    foliage: "#3d5b4f",
    foliageDark: "#1d302b",
    trunk: "#66402f",
    isletOffsetX: 4,
    isletOffsetY: 2,
    isletRx: 76,
    isletRy: 28,
    dockLength: 58,
    palms: 4,
    distantY: 0.73,
  },
  mirage_verge: {
    waterTop: "rgba(115, 187, 223, 0.24)",
    waterMid: "rgba(71, 109, 184, 0.58)",
    waterBottom: "rgba(28, 55, 103, 0.95)",
    sand: "#e8debd",
    foliage: "#66857b",
    foliageDark: "#324f48",
    trunk: "#6b5a47",
    isletOffsetX: -10,
    isletOffsetY: -6,
    isletRx: 80,
    isletRy: 27,
    dockLength: 34,
    palms: 2,
    distantY: 0.68,
  },
  sol: {
    waterTop: "rgba(96, 190, 225, 0.22)",
    waterMid: "rgba(44, 140, 180, 0.54)",
    waterBottom: "rgba(11, 72, 94, 0.93)",
    sand: "#e9d695",
    foliage: "#5d7a48",
    foliageDark: "#314526",
    trunk: "#755134",
    isletOffsetX: -10,
    isletOffsetY: -8,
    isletRx: 96,
    isletRy: 34,
    dockLength: 50,
    palms: 3,
    distantY: 0.68,
    atoll: true,
  },
  alpha_centauri: {
    waterTop: "rgba(86, 188, 218, 0.24)",
    waterMid: "rgba(42, 128, 164, 0.58)",
    waterBottom: "rgba(9, 63, 88, 0.95)",
    sand: "#e3d3a3",
    foliage: "#55785e",
    foliageDark: "#2a4737",
    trunk: "#6a5238",
    isletOffsetX: -4,
    isletOffsetY: -4,
    isletRx: 72,
    isletRy: 25,
    dockLength: 66,
    palms: 3,
    distantY: 0.71,
    chain: true,
  },
  barnards_star: {
    waterTop: "rgba(83, 173, 205, 0.22)",
    waterMid: "rgba(31, 105, 134, 0.56)",
    waterBottom: "rgba(8, 52, 70, 0.94)",
    sand: "#d1bf8f",
    foliage: "#4e684d",
    foliageDark: "#24362b",
    trunk: "#6d4b34",
    isletOffsetX: -14,
    isletOffsetY: -6,
    isletRx: 68,
    isletRy: 24,
    dockLength: 44,
    palms: 2,
    distantY: 0.73,
  },
  sirius: {
    waterTop: "rgba(104, 198, 228, 0.24)",
    waterMid: "rgba(62, 137, 189, 0.56)",
    waterBottom: "rgba(18, 70, 110, 0.95)",
    sand: "#ece2bf",
    foliage: "#5f7c72",
    foliageDark: "#314842",
    trunk: "#6b5644",
    isletOffsetX: -8,
    isletOffsetY: -8,
    isletRx: 74,
    isletRy: 26,
    dockLength: 52,
    palms: 1,
    distantY: 0.7,
  },
  tau_ceti: {
    waterTop: "rgba(109, 205, 215, 0.24)",
    waterMid: "rgba(45, 146, 148, 0.54)",
    waterBottom: "rgba(11, 72, 76, 0.95)",
    sand: "#ebe4c7",
    foliage: "#68856a",
    foliageDark: "#36503b",
    trunk: "#6f6047",
    isletOffsetX: -6,
    isletOffsetY: -10,
    isletRx: 64,
    isletRy: 22,
    dockLength: 38,
    palms: 2,
    distantY: 0.67,
    chain: true,
  },
  reedfall_basin: {
    waterTop: "rgba(91, 193, 194, 0.24)",
    waterMid: "rgba(43, 126, 113, 0.58)",
    waterBottom: "rgba(9, 58, 51, 0.95)",
    sand: "#d8cd9a",
    foliage: "#567d57",
    foliageDark: "#29452d",
    trunk: "#604c35",
    isletOffsetX: 10,
    isletOffsetY: 4,
    isletRx: 82,
    isletRy: 26,
    dockLength: 48,
    palms: 2,
    distantY: 0.7,
    chain: true,
  },
  briar_hearth: {
    waterTop: "rgba(88, 176, 205, 0.22)",
    waterMid: "rgba(43, 115, 137, 0.54)",
    waterBottom: "rgba(10, 54, 70, 0.94)",
    sand: "#dec28c",
    foliage: "#6a7046",
    foliageDark: "#393b28",
    trunk: "#715038",
    isletOffsetX: -8,
    isletOffsetY: -2,
    isletRx: 70,
    isletRy: 24,
    dockLength: 40,
    palms: 2,
    distantY: 0.72,
  },
  rootmirror_bog: {
    waterTop: "rgba(65, 149, 159, 0.22)",
    waterMid: "rgba(26, 83, 78, 0.62)",
    waterBottom: "rgba(6, 37, 34, 0.96)",
    sand: "#bba879",
    foliage: "#3e6043",
    foliageDark: "#1f3526",
    trunk: "#563f2d",
    isletOffsetX: -12,
    isletOffsetY: 8,
    isletRx: 94,
    isletRy: 34,
    dockLength: 30,
    palms: 5,
    distantY: 0.76,
  },
  hollow_door: {
    waterTop: "rgba(103, 177, 214, 0.23)",
    waterMid: "rgba(58, 91, 154, 0.58)",
    waterBottom: "rgba(21, 38, 79, 0.96)",
    sand: "#d7c28e",
    foliage: "#58635c",
    foliageDark: "#29342f",
    trunk: "#594735",
    isletOffsetX: -6,
    isletOffsetY: -4,
    isletRx: 76,
    isletRy: 25,
    dockLength: 24,
    palms: 1,
    distantY: 0.69,
    cliff: true,
  },
};

// Audio is intentionally deferred for a dedicated pass; these hooks give the sound layer authored places to land later.
const SECTOR_PERSONALITY = {
  grey_exchange: {
    arrivalTitle: "Warm Lanterns",
    arrival: "Firelight glows through mangrove roots and the inn sounds carry farther than they should over the evening tide.",
    banner: "Warm food, old charts, and rumors worth hearing.",
    dock: "The common room smells like bread, saltwood smoke, and travelers pretending they are not nervous about tomorrow's crossing.",
    watch: "dock rumors, missing children, and kind people choosing whether to help",
  },
  union_harbor: {
    arrivalTitle: "Whispered Roots",
    arrival: "Wind moves through the banyan roots like voices trying not to frighten you away.",
    banner: "Healing charms, soft warnings, and old island memory.",
    dock: "Even the quiet here feels purposeful, as if the shrine isle is waiting to see whether you know how to listen.",
    watch: "healing rites, strange omens, and whatever the banyan chooses to reveal",
  },
  shale_barrens: {
    arrivalTitle: "Bent Stone",
    arrival: "The cliff seems asleep until you notice the crooked cave mouth and all the little tracks that vanish beneath it.",
    banner: "Goblin mischief, buried secrets, old sea tunnels.",
    dock: "Nothing here wants to be called welcoming, but plenty of things want to be noticed.",
    watch: "goblin scouts, hidden passages, and trouble pretending to be curiosity",
  },
  authority_gate: {
    arrivalTitle: "Moon Current",
    arrival: "Lagoon light flickers between reeds while nervous magic shivers across the water's edge.",
    banner: "Lagoon omens, frightened magic, watchful adults.",
    dock: "The shore is tense with the feeling that one gentle word might help and one wrong move might make everything worse.",
    watch: "the tide child, drifting lights, and the mood of the water itself",
  },
  cinder_wake: {
    arrivalTitle: "Tusk Marks",
    arrival: "Broken ferns, deep hoofprints, and a low irritated grunt tell you Mossjaw noticed you before you noticed him.",
    banner: "Boar trails, churned earth, uneasy trust.",
    dock: "The island feels huge and alive, the sort of place that might forgive you if you behave well enough.",
    watch: "Mossjaw, old tide stones, and signs the archipelago is trying to warn someone",
  },
  iron_hollow: {
    arrivalTitle: "Quay Lanterns",
    arrival: "Bog lights sway over the walkways while planks creak beneath hurried boots and ferry poles.",
    banner: "Lantern quays, wet boots, practical help.",
    dock: "Everyone here looks ready to lend a hand as long as you do not waste it.",
    watch: "ferry crossings, medicine bundles, and the weather turning on travelers",
  },
  ember_market: {
    arrivalTitle: "Lantern Shells",
    arrival: "Woven lights glow through shell arches while everybody pretends they came here for ordinary reasons.",
    banner: "Secret bargains, shell paths, smiling risk.",
    dock: "The market is merry in the careful way of places where every favor has a second meaning.",
    watch: "rare charms, whispered favors, and who owes whom by moonrise",
  },
  mirage_verge: {
    arrivalTitle: "Moonlit Glass",
    arrival: "The cay reflects you in pools that seem a heartbeat late to agree with what you did.",
    banner: "Strange reflections, pale palms, careful steps.",
    dock: "It is hard to tell whether the place is inviting you inward or warning you away.",
    watch: "misleading channels, reflection tricks, and old cay magic",
  },
  sol: {
    arrivalTitle: "Sun Crown",
    arrival: "Golden light spills across the atoll and every old oath feels suddenly close enough to hear.",
    banner: "Ancient roots, bright law, long memory.",
    dock: "Even the birds seem to stand straighter here.",
    watch: "old promises, sacred law, and people trying to sound wiser than they feel",
  },
  alpha_centauri: {
    arrivalTitle: "Reef Bridges",
    arrival: "Rope bridges, skiff wakes, and busy voices make the crossing feel safely inhabited again.",
    banner: "Bridgework, shared chores, steady kindness.",
    dock: "The ferryfolk here have the look of people who solve problems before anyone has time to dramatize them.",
    watch: "bridge repairs, family errands, and requests that become obligations",
  },
  barnards_star: {
    arrivalTitle: "Drift Fire",
    arrival: "Smoke curls above the drift piles and the campfire looks like it has been waiting for you to stop pretending you were not tired.",
    banner: "Campfire truth, boat nails, quiet endurance.",
    dock: "Nobody fusses, but somebody always shifts over to make room on the log.",
    watch: "weather signs, old warnings, and travelers who know the reefs too well",
  },
  sirius: {
    arrivalTitle: "Silver Light",
    arrival: "Sun on water turns the whole shore bright enough to make secrets feel briefly impossible.",
    banner: "Formal courtesy, bright water, careful eyes.",
    dock: "Everyone here has excellent posture and at least one opinion they are too polite to say directly.",
    watch: "invitations, obligations, and respectable people with untidy motives",
  },
  tau_ceti: {
    arrivalTitle: "Quiet Water",
    arrival: "Pale spray drifts across the keys while cottage lights blink on and off as if deciding whether to admit you exist.",
    banner: "Soft voices, sealed letters, private bargains.",
    dock: "The silence here feels chosen, not empty.",
    watch: "sealed messages, herbal bargains, and smiles that reveal nothing",
  },
  reedfall_basin: {
    arrivalTitle: "Reed Bells",
    arrival: "Reeds click together in the basin wind, and every stake in the water looks like it was set to remember someone.",
    banner: "Witness stakes, soft bells, half-sunk names.",
    dock: "The landing is quiet in the way a room gets quiet when someone important is about to testify.",
    watch: "survey strings, reed bells, and names the water keeps repeating",
  },
  briar_hearth: {
    arrivalTitle: "Thorn Chimes",
    arrival: "Briar chimes lift in the wind above a dry hearth, bright enough to make tired travelers stand a little straighter.",
    banner: "Dry fire, old welcome lists, bell memory.",
    dock: "Nobody asks why you came before offering you a warm cup, which somehow makes every answer feel more serious.",
    watch: "bell ledgers, welcome rolls, and people who refuse to forget the lost",
  },
  rootmirror_bog: {
    arrivalTitle: "Black Roots",
    arrival: "Dark water reflects the roots overhead one heartbeat late, and little lanterns vanish whenever you look too directly.",
    banner: "Mirror water, goblin families, soft promises.",
    dock: "The bog listens with more faces than it shows.",
    watch: "hidden cove families, root marks, and reflections that answer back",
  },
  hollow_door: {
    arrivalTitle: "Unmapped Lintel",
    arrival: "A root-wrapped doorway stands where the cliff should be solid, and the channel hushes as if waiting for a password.",
    banner: "Hidden threshold, old ferry debts, dangerous truth.",
    dock: "The place feels less discovered than reluctantly acknowledged.",
    watch: "door chalk, ferry ghosts, and people pretending they never used this route",
  },
};

const SECTOR_ARCHIVE = {
  grey_exchange: {
    title: "Mangrove House Guestbook",
    focus: "home quay",
    copy: "Mangrove House survives on soup pots, trust, and the kind of welcome that steadies frightened travelers before they step back into the channels. Beds matter here, but so do rumors, reassurances, and who still leaves a lantern burning after midnight.",
    rumors: [
      "The innkeeper keeps an extra bowl warm most nights, just in case a traveler arrives too shaken to ask for one.",
      "Some regulars swear the hooded figure only appears when the archipelago has already chosen who it wants to test next.",
    ],
  },
  union_harbor: {
    title: "Whispering Banyan Notes",
    focus: "old island truth",
    copy: "The Whispering Banyan is not simply a tree, but a listening place. Healing, memory, and warning all gather beneath its roots, and many who come seeking answers leave carrying gentler questions instead.",
    rumors: [
      "If you sleep beneath the willow after telling the truth, your dreams are said to come back arranged in the right order.",
      "Birds refuse to nest on one branch of the tree, and no elder will say why.",
    ],
  },
  shale_barrens: {
    title: "Crooked Sea Cave Record",
    focus: "goblin tunnels",
    copy: "The Crooked Sea Cave marks a threshold between ordinary island channels and older underways where goblins, burrows, and forgotten roots share the same dark. It is less a single place than a promise that the cliff contains more than stone.",
    rumors: [
      "The goblins who use the hill-door are said to be frightened first and troublesome second.",
      "A child once followed glowing mushrooms down there and came back talking to the river in their sleep.",
    ],
  },
  authority_gate: {
    title: "Moonpool Shore Journal",
    focus: "wild lagoon magic",
    copy: "Moonpool Shore is where the archipelago's deeper magic has started showing through. Water, fear, and memory seem bound together here, and the frightened child by the lagoon may be a victim of that bond rather than its cause.",
    rumors: [
      "Some nights the river repeats things nobody said aloud.",
      "The child at the bank is not cursed, the old women say, only frightened by a magic too large to carry alone.",
    ],
  },
  cinder_wake: {
    title: "Mossjaw Field Notes",
    focus: "island trust",
    copy: "Mossjaw Isle belongs to the archipelago in a louder way than most places do. The great boar who guards it is gruff, dangerous, and entirely capable of deciding that mercy matters more than fear.",
    rumors: [
      "Mossjaw remembers who came with weapons out and who came with an open hand.",
      "The oldest stones in the glade predate the inn, the willow, and anyone living who still knows their names.",
    ],
  },
  iron_hollow: {
    title: "Lantern Quay Supply Notes",
    focus: "marsh help",
    copy: "Lantern Quay is what happens when too many small needs arrive at one damp boardwalk. Everyone looks overworked because they are, and every delay immediately turns into a story about who was helped first and who was asked to wait.",
    rumors: [
      "Quay rumor says half the ferry hands here keep spare lanterns for crossings nobody officially scheduled.",
      "The clinic quarter keeps a board of missed deliveries with names on it, and nobody likes seeing theirs added.",
    ],
  },
  ember_market: {
    title: "Shell Market Favor Book",
    focus: "moonglass bargains",
    copy: "Shell Market turns trouble into politeness. Deals are quiet, stylish, and heavily deniable, but under the polish it is still a place where favors change hands faster than shells.",
    rumors: [
      "Market hosts are said to seat Warden buyers and Moonglass runners in the same room as long as neither side uses legal names.",
      "A lantern row known as the Ember Spine supposedly has more listening charms than light fixtures.",
    ],
  },
  mirage_verge: {
    title: "Moonglass Cay Field Notes",
    focus: "mirror water",
    copy: "Moonglass Cay sells certainty in tiny, dangerous portions. Tide readers, quiet runners, and speculative charm-workers all work the same blue haze, hoping the next packet or omen changes how the islands are mapped.",
    rumors: [
      "Cay hands swear there are boats here that vanish from ordinary sight but still leave their docking gifts on time.",
      "Moonglass brokers claim the most valuable export is not charmwork, but certainty sold in tiny portions.",
    ],
  },
  sol: {
    title: "Sunroot Civic Abstract",
    focus: "old tide law",
    copy: "Sunroot Atoll still behaves like the center, even when the crossings around it are held together by travelers living far from its ceremonies. Its power is not just tradition, but the assumption that its ledgers are the final version of history.",
    rumors: [
      "Ledger clerks joke that a traveler can survive bad weather more easily than a mislabeled Sunroot filing.",
      "Old dockhands insist the atoll still keeps spare berths for boats carrying politically inconvenient bundles.",
    ],
  },
  alpha_centauri: {
    title: "Reefspan Family Register",
    focus: "crossing families",
    copy: "Reefspan feels expansive because its work still remembers names instead of just numbers. Ferry families, bridge tenders, and ambitious helpers all overlap here, each convinced they are building the next stable middle of the archipelago.",
    rumors: [
      "Reefspan elders can apparently settle a quay argument faster than any magistrate if the right welcome-rolls are at risk.",
      "Young boat-hands say the fastest way to get blacklisted here is not sneaking, but making an elder cousin look careless.",
    ],
  },
  barnards_star: {
    title: "Driftwood Relay Book",
    focus: "independent memory",
    copy: "Driftwood Rest matters because practical people kept it mattering. Relay crews, repair sheds, and old boat-hands preserved routes here long after larger powers started calling those same routes marginal.",
    rumors: [
      "Some relay menders still keep handwritten route books because they trust ink more than Sunroot-approved updates.",
      "Driftwood gossip says half the islands' missing paperwork passed through here on purpose, not by accident.",
    ],
  },
  sirius: {
    title: "Silverpool White Ledger",
    focus: "polished custom",
    copy: "Silverpool turns manners into traffic management. Ceremony bundles, hearings, Warden dispatches, and respectable money all travel the same polished channels, each pretending the others are merely background.",
    rumors: [
      "The wealthiest Silverpool buyers allegedly judge travelers by how quietly their companions wait during inspection holds.",
      "A courthouse clerk swears most hearings here are decided long before the first sealed packet reaches the table.",
    ],
  },
  tau_ceti: {
    title: "Quiet Keys Quiet File",
    focus: "private favors",
    copy: "Quiet Keys is where respectable business and gray leverage stop pretending to be opposites. Brokers, charm financiers, and Moonglass intermediaries all speak the language of discretion because discretion is the real export.",
    rumors: [
      "Quiet Keys lenders are said to bless both sides of the same hidden run as long as nobody asks how the numbers stay clean.",
      "Moonglass regulars whisper that the fastest path to real trust here is bringing back silence instead of profit.",
    ],
  },
  reedfall_basin: {
    title: "Reedfall Basin Survey",
    focus: "witness water",
    copy: "Reedfall Basin was once a harmless survey stop until the ferries started vanishing from memory faster than from water. The reed stakes are now witness markers, each one tied to a name somebody official forgot too neatly.",
    rumors: [
      "Tamsin says the basin reeds ring differently for names spoken honestly and names spoken for paperwork.",
      "Children here learn to count ferry bells before numbers, because bells are harder to forge than ledgers.",
    ],
  },
  briar_hearth: {
    title: "Briar Hearth Bell-Roll",
    focus: "remembered welcome",
    copy: "Briar Hearth keeps old welcome rolls by bell tone, not ink. It was never powerful enough to command a route, but it stayed stubborn enough to remember who was allowed through before the maps learned to exclude them.",
    rumors: [
      "Ollie Lark keeps one cracked bell wrapped in red cloth and only rings it for names that came back wrong.",
      "The thornbloom path opens easily for hungry travelers and stubbornly for officials in polished boots.",
    ],
  },
  rootmirror_bog: {
    title: "Rootmirror Bog Lantern Book",
    focus: "hidden families",
    copy: "Rootmirror Bog shelters people who learned to move under roots after ordinary crossings became refusals. Its mirror water is dangerous, but its families are more organized than any patrol report wants to admit.",
    rumors: [
      "Goblin children leave paired lanterns in the bog: one for the face they show, one for the name they are keeping safe.",
      "Rill's pilots say Rootmirror paths change shape when someone lies about why they came.",
    ],
  },
  hollow_door: {
    title: "Hollow Door Chalk Marks",
    focus: "unofficial threshold",
    copy: "The Hollow Door is an underways threshold shared by wardens, brokers, goblin pilots, and innkeepers who all insist they have no reason to know it. Every chalk mark on the lintel is a debt, a witness, or a warning.",
    rumors: [
      "Mire Kest erases one chalk mark every time a hidden traveler reaches safe water.",
      "The door only refuses people who arrive empty-handed and people who arrive carrying truths they plan to sell too cheaply.",
    ],
  },
};

const CONTACT_ARCHIVE = {
  "independent-mara-kade": {
    title: "Auntie Sable Marris",
    role: "Mangrove House host",
    tags: ["Wayfolk", "Rumors", "Mangrove House"],
    portrait: "./assets/contacts/auntie-sable-marris-portrait-v3.png",
    opener: "Sit, eat, and let the weather leave your bones. People tell the truth by accident when they feel safe, and these islands are getting too sick for me to ignore what slips out.",
    copy: "Sable keeps Mangrove House full of stew, rumors, and the kind of welcome that makes frightened people say more than they planned. She has the gift of sounding grandmotherly while quietly sorting truth from performance.",
  },
  "union-juno-vale": {
    title: "Sister Nera Bloom",
    role: "Banyan keeper",
    tags: ["Hearthfolk", "Healer", "Whispering Banyan"],
    portrait: "./assets/contacts/sister-nera-bloom-portrait.png",
    opener: "The banyan hears fear before most people admit it out loud. If I am asking for help, some part of the archipelago is frightened enough to reach through root and tide for steady hands.",
    copy: "Nera tends the Whispering Banyan and the frightened people drawn to it. She speaks softly, notices everything, and believes the islands can still be soothed if enough people answer panic with care.",
  },
  "salvage-dax-brindle": {
    title: "Pip Tidewell",
    role: "Reef gleaner",
    tags: ["Wayfolk", "Relics", "Lantern Quay"],
    portrait: "./assets/contacts/pip-tidewell-portrait-v2.png",
    opener: "Reef water keeps what people lose and what the islands are not ready to explain. If I send for you, it means something interesting just washed out of hiding.",
    copy: "Pip makes a living pulling useful things out of wrecks, tide caves, and reef-snared ruins. He jokes like a beachcomber, but the moment the archipelago gives up a secret he starts listening like a historian.",
  },
  "nightglass-vey-neral": {
    title: "The Hooded Figure",
    role: "Mysterious guide",
    tags: ["Moonglass Circle", "Guide", "Whispering Banyan"],
    portrait: "./assets/contacts/hooded-guide-portrait-v2.png",
    opener: "You have followed the channels this far without turning cruel. Good. There are truths in these islands that only answer if approached gently and in the right order.",
    copy: "The hooded figure appeared at just the right moment to set the party on the trail of the Whispering Banyan. They speak like someone testing whether you are kind enough to trust and brave enough to survive the answer.",
  },
  "core-ilya-sen": {
    title: "Warden Elric Fen",
    role: "River watch",
    tags: ["Wardens", "Old Law", "Moonpool Shore"],
    portrait: "./assets/contacts/warden-elric-fen-portrait-v2.png",
    opener: "Boundary stones are shifting, the ferries are nervous, and the old laws are not keeping pace. I would prefer facts over panic, but the islands are offering both.",
    copy: "Elric keeps the old tide laws, ferry markers, and boundary stones. He is cautious, dutiful, and increasingly aware that the trouble in the islands does not fit neatly inside any rulebook he inherited.",
  },
  "bounty-marshal-tovin": {
    title: "Marshal Bramble Hart",
    role: "Thorn ranger",
    tags: ["Wardens", "Protector", "Outer Paths"],
    portrait: "./assets/contacts/marshal-bramble-hart-portrait-v2.png",
    opener: "If I send word, something with teeth, knives, or bad judgment is making the paths unsafe. Help me settle it before fear turns the whole wood meaner than it already is.",
    copy: "Bramble watches the rougher crossings where scared travelers, goblin raiders, and bad decisions keep meeting each other. He speaks bluntly, protects fiercely, and respects people who solve danger without becoming cruel.",
  },
  "pirate-rill-scrimshaw": {
    title: "Rill Scrimshaw",
    role: "Underway pilot",
    tags: ["Goblin Clans", "Underways", "Crooked Sea Cave"],
    portrait: "./assets/contacts/rill-scrimshaw-portrait-v2.png",
    opener: "If this reached you, somebody in the coves already voted that you are more useful than dangerous. Do not make me regret defending that opinion.",
    copy: "Rill pilots hidden coves, reef cuts, and old underways the wardens mostly pretend are myths. She insists most so-called pirate trouble starts as hunger, eviction, or one more frightened island being told it no longer counts.",
  },
  "hollow-mire-kest": {
    title: "Mire Kest",
    role: "Hollow Door keeper",
    tags: ["Moonglass Circle", "Thresholds", "Hollow Door"],
    portrait: "",
    opener: "Step lightly at the Hollow Door. It keeps better count than any ledger, and it remembers who crossed because they were desperate and who crossed because they were cruel.",
    copy: "Mire Kest keeps the Hollow Door's chalk marks, debts, and quiet arrivals in an order that only looks like superstition from outside. They speak mildly, count precisely, and never forget which institutions used the underways before condemning them.",
  },
  "briar-ollie-lark": {
    title: "Ollie Lark",
    role: "Briar bell-ringer",
    tags: ["Wayfolk", "Bell Rolls", "Briar Hearth"],
    portrait: "",
    opener: "If a bell remembers a name, I write it down. If someone powerful wants that name missing, I ring louder.",
    copy: "Ollie Lark tends Briar Hearth's cracked bells and old welcome rolls. He believes the first violence was not a raid or closure, but the moment a name was quietly removed from the list of people allowed to come home.",
  },
  "reedfall-tamsin-voss": {
    title: "Tamsin Voss",
    role: "Reedfall surveyor",
    tags: ["Hearthfolk", "Witness Stakes", "Reedfall Basin"],
    portrait: "",
    opener: "The reeds keep repeating the same names, and I have learned not to argue with water when it is trying this hard to testify.",
    copy: "Tamsin Voss maps Reedfall Basin with survey twine, reed bells, and a stubborn refusal to call testimony folklore. If the water keeps repeating a name, she writes it down until someone powerful gets uncomfortable.",
  },
};

const STAR_MAP = [
  { id: "grey_exchange", x: 0.18, y: 0.58 },
  { id: "union_harbor", x: 0.34, y: 0.34 },
  { id: "shale_barrens", x: 0.7, y: 0.67 },
  { id: "authority_gate", x: 0.51, y: 0.23 },
  { id: "cinder_wake", x: 0.28, y: 0.8 },
  { id: "iron_hollow", x: 0.45, y: 0.56 },
  { id: "ember_market", x: 0.84, y: 0.53 },
  { id: "mirage_verge", x: 0.78, y: 0.26 },
  { id: "sol", x: 0.56, y: 0.07 },
  { id: "alpha_centauri", x: 0.66, y: 0.12 },
  { id: "barnards_star", x: 0.39, y: 0.1 },
  { id: "sirius", x: 0.84, y: 0.16 },
  { id: "tau_ceti", x: 0.75, y: 0.06 },
  { id: "reedfall_basin", x: 0.22, y: 0.25 },
  { id: "briar_hearth", x: 0.25, y: 0.09 },
  { id: "rootmirror_bog", x: 0.52, y: 0.78 },
  { id: "hollow_door", x: 0.63, y: 0.4 },
];

function createPlayerState(slot = 0, overrides = {}) {
  const style = PARTY_SLOT_STYLES[slot] || PARTY_SLOT_STYLES[0];
  return {
    id: overrides.id || `player-${slot + 1}`,
    slot,
    name: overrides.name || style.name,
    tint: overrides.tint || style.tint,
    accent: overrides.accent || style.accent,
    hullId: overrides.hullId || "dinghy",
    hull: overrides.hull ?? HULLS[overrides.hullId || "dinghy"].maxHull,
    shield: overrides.shield ?? HULLS[overrides.hullId || "dinghy"].maxShield,
    credits: overrides.credits ?? 180,
    fuel: overrides.fuel ?? HULLS[overrides.hullId || "dinghy"].fuelCap,
    loanerHull: Boolean(overrides.loanerHull),
    cargo: { ...(overrides.cargo || {}) },
    cargoCapBonus: Number(overrides.cargoCapBonus || 0),
    hullBonus: Number(overrides.hullBonus || 0),
    x: overrides.x ?? WIDTH * 0.52,
    y: overrides.y ?? HEIGHT * 0.48,
    vx: overrides.vx ?? 0,
    vy: overrides.vy ?? 0,
    angle: overrides.angle ?? (-Math.PI / 2),
    fireCooldown: Number(overrides.fireCooldown || 0),
    autopilotEnabled: Boolean(overrides.autopilotEnabled),
    lastActiveAt: Number(overrides.lastActiveAt || 0),
    emoteIndex: Number(overrides.emoteIndex || 0),
    activeEmote: overrides.activeEmote || null,
    emoteTimer: Number(overrides.emoteTimer || 0),
    emoteDuration: Number(overrides.emoteDuration || 0),
    emoteSeed: Number(overrides.emoteSeed || 0),
    boardSkill: Number(overrides.boardSkill ?? 0.04),
    scannerLevel: Number(overrides.scannerLevel || 0),
    weaponLevel: Number(overrides.weaponLevel || 0),
    shieldCooldown: Number(overrides.shieldCooldown || 0),
    shieldFlash: Number(overrides.shieldFlash || 0),
    bountyProgress: { ...(overrides.bountyProgress || {}) },
    missionProgress: { ...(overrides.missionProgress || {}) },
  };
}

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
  voice: {
    enabled: false,
    unlocked: false,
    manifest: null,
    baseUrl: null,
    current: null,
    missing: new Set(),
    lastKey: "",
    lastStartedAt: 0,
  },
  music: {
    unlocked: false,
    playlistIndex: 0,
    currentKey: null,
    current: null,
    tracks: new Map(),
  },
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
  partyMembers: [],
  activePartyMemberIndex: 0,
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
    rill: { stage: "intro", completed: [] },
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
  threadReplyIndex: 0,
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
  resettingProgress: false,
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

function syncPartyState() {
  if (!Array.isArray(state.partyMembers) || state.partyMembers.length === 0) {
    state.partyMembers = [createPlayerState(0, state.player)];
  }

  state.partyMembers = state.partyMembers.slice(0, MAX_PARTY_PLAYERS);

  while (state.partyMembers.length < 4) {
    state.partyMembers.push(createPlayerState(state.partyMembers.length, {
      credits: 180,
      x: state.partyMembers[0]?.x ?? WIDTH * 0.52,
      y: state.partyMembers[0]?.y ?? HEIGHT * 0.48,
      angle: -Math.PI / 2,
    }));
  }

  state.activePartyMemberIndex = clamp(state.activePartyMemberIndex || 0, 0, state.partyMembers.length - 1);
  state.player = state.partyMembers[0];
}

function partyMembers() {
  return state.partyMembers;
}

function partyMember(index) {
  return state.partyMembers[clamp(index, 0, state.partyMembers.length - 1)] || state.player;
}

function activeDockPlayer() {
  return partyMember(state.activePartyMemberIndex || 0);
}

function playerHullFor(player = state.player) {
  return HULLS[player.hullId];
}

function playerMaxHull(player = state.player) {
  return playerHullFor(player).maxHull + player.hullBonus;
}

function playerMaxShield(player = state.player) {
  return playerHullFor(player).maxShield;
}

function playerMaxCargo(player = state.player) {
  return playerHullFor(player).cargoCap + player.cargoCapBonus;
}

function playerCargoUsed(player = state.player) {
  return Object.values(player.cargo).reduce((sum, amount) => sum + amount, 0);
}

function playerCargoAmount(player = state.player, id) {
  return player.cargo[id] || 0;
}

function formationOffsetForPartySlot(slot, leader = state.player) {
  const order = Math.max(0, slot - 1);
  const trailDistance = 54 + order * 24;
  const sideOffset = (order - 1) * 34;
  return {
    x: leader.x - Math.cos(leader.angle) * trailDistance + Math.sin(leader.angle) * sideOffset,
    y: leader.y - Math.sin(leader.angle) * trailDistance - Math.cos(leader.angle) * sideOffset,
  };
}

function syncPartyFormationToLead(force = false) {
  syncPartyState();
  const leader = state.player;
  partyMembers().forEach((member, index) => {
    if (index === 0) return;
    const target = formationOffsetForPartySlot(index, leader);
    if (force || !Number.isFinite(member.x) || !Number.isFinite(member.y)) {
      member.x = target.x;
      member.y = target.y;
      member.vx = leader.vx * 0.5;
      member.vy = leader.vy * 0.5;
      member.angle = leader.angle;
    }
  });
}

function partyFlightMembers() {
  return partyMembers().filter((member) => member.hull > 0);
}

function nearestPartyMemberTo(body) {
  let best = state.player;
  let bestDistance = Infinity;
  for (const member of partyFlightMembers()) {
    const d = distance(body, member);
    if (d < bestDistance) {
      bestDistance = d;
      best = member;
    }
  }
  return best;
}

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
  return playerHullFor(state.player);
}

function hasCompletedContract(contractId) {
  return state.intrigue.completed.includes(contractId)
    || state.factionArc.completed.includes(contractId)
    || state.coreArc.completed.includes(contractId)
    || state.contactArcs.mara.completed.includes(contractId)
    || state.contactArcs.dax.completed.includes(contractId)
    || state.contactArcs.juno.completed.includes(contractId)
    || state.contactArcs.rill.completed.includes(contractId);
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
  if (hasCompletedContract("mystery-relief-freight")) tags.push("a mercy run that felt pre-blessed");
  if (hasCompletedContract("mystery-manifest-anomaly")) tags.push("a ledger addendum that arrived before the complaint");
  if (hasCompletedContract("mystery-escort-trace")) tags.push("the missing ferry Saint Radiant");
  if (hasCompletedContract("mystery-ninth-berth")) tags.push("references to a lintel nobody will place on a public map");
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
  return playerMaxHull(state.player);
}

function maxShield() {
  return playerMaxShield(state.player);
}

function maxCargo() {
  return playerMaxCargo(state.player);
}

function cargoUsed() {
  return playerCargoUsed(state.player);
}

function cargoAmount(id) {
  return playerCargoAmount(state.player, id);
}

function sectorPersonality(sectorId = state.currentSectorId) {
  return SECTOR_PERSONALITY[sectorId] || {
    arrivalTitle: "Open Path",
    arrival: "The channel opens just enough to let you through, but not enough to promise anything.",
    banner: "The path is live and the world is already moving without you.",
    dock: "This resting place is busy enough to hide stories in plain sight.",
    watch: "whatever sign or creature makes itself known first",
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
      condition ? `Current island condition: ${condition.title}. ${condition.copy}` : "",
      personality.watch ? `Watch for ${personality.watch}.` : "",
    ].filter(Boolean).join(" "),
    bannerTitle: personality.arrivalTitle,
    bannerCopy: personality.banner,
    hint: `Travel gently. ${personality.watch ? `Watch for ${personality.watch}. ` : ""}${currentSectorEventTag()}.`,
    overlay: `${personality.arrival} ${sector.intel}`,
  };
}

function dockMoodTag(sectorId = state.currentSectorId) {
  const sector = SECTORS[sectorId];
  if (!sector) return "Living Path";
  if (sector.legality === "strict") return "Watchful Eyes";
  if (sector.legality === "gray") return "Private Favors";
  if (sector.legality === "pirate") return "Rough Burrow";
  if (sector.faction === "frontier") return "Helping Hands";
  return "Open Hearth";
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
    ? "Wardens keep you at arm's length and the room notices."
    : rep >= 10
      ? "People are greeting your boat by reputation before anyone checks the ledger."
      : rep <= -8
        ? "Half the quay pretends not to know you and the other half watches your hands."
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

async function loadVoiceManifest() {
  try {
    const response = await fetch(VOICE_MANIFEST_PATH, { cache: "no-store" });
    if (!response.ok) return;
    const manifest = await response.json();
    if (!manifest?.clips || typeof manifest.clips !== "object") return;
    state.voice.manifest = manifest;
    state.voice.baseUrl = new URL("./assets/audio/", window.location.href);
    state.voice.enabled = true;
    render();
  } catch (_error) {
    state.voice.enabled = false;
  }
}

function unlockVoice() {
  state.voice.unlocked = true;
}

function voiceClipUrl(key) {
  const file = state.voice.manifest?.clips?.[key]?.file;
  if (!file || !state.voice.baseUrl) return null;
  return new URL(file, state.voice.baseUrl).href;
}

function voiceKeyForThreadMessage(threadId, message) {
  if (!threadId || !message || message.from !== "them") return null;
  if (message.voiceKey && state.voice.manifest?.clips?.[message.voiceKey]) {
    return message.voiceKey;
  }
  if (message.contractId) {
    const contractKey = `thread.${threadId}.${message.contractId}`;
    if (state.voice.manifest?.clips?.[contractKey]) {
      return contractKey;
    }
  }
  const text = normalizeUiText(message.text);
  if (!text || !state.voice.manifest?.clips) return null;
  for (const [key, clip] of Object.entries(state.voice.manifest.clips)) {
    if (clip.characterId !== threadId) continue;
    if (normalizeUiText(clip.text) === text) {
      return key;
    }
  }
  return null;
}

function generatedThreadVoiceKey(threadId, kind) {
  return threadId && kind ? `thread.${threadId}.${kind}` : null;
}

function latestMissionThreadContactMessage(thread) {
  if (!thread) return null;
  return visibleMissionThreadMessages(thread)
    .slice()
    .reverse()
    .find((message) => message.from === "them") || null;
}

function latestMissionThreadVoiceKey(thread) {
  const latest = latestMissionThreadContactMessage(thread);
  return latest ? voiceKeyForThreadMessage(thread.id, latest) : null;
}

function threadHasLatestVoice(thread) {
  return Boolean(thread && state.voice.enabled && latestMissionThreadVoiceKey(thread));
}

function stopCurrentVoice() {
  if (!state.voice.current) return;
  state.voice.current.pause();
  state.voice.current.currentTime = 0;
  state.voice.current = null;
}

function playVoice(key, options = {}) {
  if (!state.voice.enabled || state.voice.missing.has(key)) return false;
  const url = voiceClipUrl(key);
  if (!url) return false;
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (!options.force && state.voice.lastKey === key && now - state.voice.lastStartedAt < VOICE_REPLAY_DEDUPE_MS) {
    return false;
  }

  unlockVoice();
  stopCurrentVoice();
  const audio = new Audio(url);
  audio.volume = VOICE_VOLUME;
  state.voice.current = audio;
  state.voice.lastKey = key;
  state.voice.lastStartedAt = now;
  audio.addEventListener("ended", () => {
    if (state.voice.current === audio) {
      state.voice.current = null;
    }
  });
  audio.addEventListener("error", () => {
    state.voice.missing.add(key);
    if (state.voice.current === audio) {
      state.voice.current = null;
    }
  }, { once: true });
  audio.play().catch(() => {
    if (state.voice.current === audio) {
      state.voice.current = null;
    }
  });
  return true;
}

function playMissionMessageVoice(threadId, message, options = {}) {
  const key = voiceKeyForThreadMessage(threadId, message);
  return key ? playVoice(key, options) : false;
}

function playLatestMissionThreadVoice(threadId, options = {}) {
  const thread = state.missionThreads?.[threadId];
  if (!thread) return false;
  const latest = latestMissionThreadContactMessage(thread);
  return latest ? playMissionMessageVoice(thread.id, latest, options) : false;
}

function unlockMusic() {
  state.music.unlocked = true;
  syncMusic(0.033);
}

function unlockAudio() {
  unlockVoice();
  unlockMusic();
}

function musicAudioForKey(key) {
  const track = MUSIC_TRACKS[key];
  if (!track) return null;
  if (state.music.tracks.has(key)) {
    return state.music.tracks.get(key);
  }
  const audio = new Audio(track.file);
  audio.loop = false;
  audio.preload = "auto";
  audio.volume = 0;
  audio.addEventListener("ended", () => advanceMusicTrack(audio));
  state.music.tracks.set(key, audio);
  return audio;
}

function currentPlaylistKey() {
  return MUSIC_PLAYLIST[state.music.playlistIndex % MUSIC_PLAYLIST.length] || MUSIC_PLAYLIST[0];
}

function shouldPauseMusicForState() {
  return state.mode === "dock" && (
    state.dockScreen === "contracts"
    || state.dockScreen === "contract-thread"
  );
}

function pauseCurrentMusic() {
  if (!state.music.current) return;
  state.music.current.pause();
  state.music.current = null;
  state.music.currentKey = null;
}

function advanceMusicTrack(audio = null) {
  if (audio && state.music.current && state.music.current !== audio) return;
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
  state.music.current = null;
  state.music.currentKey = null;
  state.music.playlistIndex = (state.music.playlistIndex + 1) % MUSIC_PLAYLIST.length;
  syncMusic(0.033);
}

function targetMusicVolume(key) {
  const track = MUSIC_TRACKS[key];
  if (!track) return 0;
  if (state.voice.current) {
    return Math.min(track.volume, MUSIC_DUCK_VOLUME);
  }
  return track.volume;
}

function syncMusic(dt = 0.033) {
  if (shouldPauseMusicForState()) {
    pauseCurrentMusic();
    return;
  }
  if (!state.music.unlocked) {
    return;
  }

  const key = state.music.currentKey || currentPlaylistKey();
  if (!state.music.current) {
    const audio = musicAudioForKey(key);
    if (!audio) return;
    state.music.currentKey = key;
    state.music.current = audio;
    audio.play().catch(() => {
      if (state.music.current === audio) {
        state.music.current = null;
        state.music.currentKey = null;
      }
    });
  }

  if (!state.music.current) return;
  const target = targetMusicVolume(key);
  const maxStep = MUSIC_FADE_RATE * Math.max(0.016, dt);
  const delta = clamp(target - state.music.current.volume, -maxStep, maxStep);
  state.music.current.volume = clamp(state.music.current.volume + delta, 0, 1);
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

function storyAdventureMode() {
  return STORY_ADVENTURE_MODE;
}

function standardFlightHint() {
  const westAction = storyAdventureMode() ? "sends a lantern pulse" : "rests or helps";
  return `Move with stick or D-pad. South acts, west ${westAction}, north opens the trail map. Left bumper toggles follow-autopilot. Right bumper cycles emotes. ${currentSectorEventTag()}.`;
}

function syncAutopilotAggregate() {
  state.autopilot.enabled = partyMembers().some((member) => member.autopilotEnabled);
}

function disableAutopilot(options = {}) {
  const target = options.player || state.player;
  if (!target?.autopilotEnabled) return;
  target.autopilotEnabled = false;
  syncAutopilotAggregate();
  if (options.message) {
    setStatus(options.message, { tag: "Autopilot", log: options.log ?? true });
  }
  if (options.updateHint !== false) {
    setHint(standardFlightHint());
  }
}

function enableAutopilot(player = state.player, slot = 0) {
  player.autopilotEnabled = true;
  syncAutopilotAggregate();
  setStatus(`${player.name} is now following the flotilla.`, { tag: "Autopilot" });
  if (slot === 0) {
    setHint("Follow-autopilot is trailing the most active traveler. Left bumper toggles it off; right bumper still cycles emotes.");
  }
}

function toggleAutopilot(player = state.player, slot = 0) {
  if (playerIsInEscapePod() || state.mode !== "flight") return;
  if (player.autopilotEnabled) {
    disableAutopilot({ player, message: `${player.name} is steering manually again.` });
    return;
  }
  enableAutopilot(player, slot);
}

function autopilotManualIntent(input) {
  return Math.abs(input.moveX) > 0.08
    || Math.abs(input.moveY) > 0.08
    || input.fire
    || input.interact
    || input.map
    || input.back;
}

function autopilotLeaderForSlot(slot, inputs, now) {
  let bestIndex = null;
  let bestScore = -Infinity;
  for (let index = 0; index < partyMembers().length; index += 1) {
    if (index === slot) continue;
    const member = partyMember(index);
    if (member.hull <= 0 || member.autopilotEnabled) continue;
    const input = inputs[index] || { moveX: 0, moveY: 0, fire: false, interact: false, map: false, back: false };
    const manualMagnitude = Math.hypot(input.moveX || 0, input.moveY || 0);
    const buttonBonus = (input.fire || input.interact || input.map || input.back) ? 0.8 : 0;
    const recentSeconds = Math.max(0, now - (member.lastActiveAt || 0));
    const recentBonus = Math.max(0, 2.4 - recentSeconds / 1000) * 0.7;
    const speedBonus = Math.min(1.4, Math.hypot(member.vx, member.vy) / 120);
    const score = manualMagnitude * 5 + buttonBonus + recentBonus + speedBonus;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  }
  if (bestIndex !== null && bestScore > 0.35) {
    return bestIndex;
  }
  for (let index = 0; index < partyMembers().length; index += 1) {
    if (index === slot) continue;
    const member = partyMember(index);
    if (member.hull > 0 && !member.autopilotEnabled) {
      return index;
    }
  }
  return null;
}

function autopilotFollowTarget(slot, leaderIndex) {
  const leader = partyMember(leaderIndex);
  const sidePattern = [0, -34, 34, -60];
  const trailPattern = [0, 72, 92, 118];
  const side = sidePattern[slot] ?? ((slot % 2 === 0 ? 1 : -1) * (28 + slot * 12));
  const trail = trailPattern[slot] ?? (76 + slot * 18);
  return {
    x: leader.x - Math.cos(leader.angle) * trail + Math.sin(leader.angle) * side,
    y: leader.y - Math.sin(leader.angle) * trail - Math.cos(leader.angle) * side,
  };
}

function updateAutopilot(player, slot, inputs, now, dt) {
  const leaderIndex = autopilotLeaderForSlot(slot, inputs, now);
  if (leaderIndex === null) return;
  const target = autopilotFollowTarget(slot, leaderIndex);
  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const desiredAngle = Math.atan2(dy, dx);
  player.angle = desiredAngle;

  const speed = Math.hypot(player.vx, player.vy);
  const needsPush = Math.hypot(dx, dy) > 28 || speed < AUTOPILOT_SPEED_TARGET;
  if (needsPush) {
    const hull = playerHullFor(player);
    player.vx += Math.cos(desiredAngle) * hull.accel * AUTOPILOT_ACCEL_SCALE * dt;
    player.vy += Math.sin(desiredAngle) * hull.accel * AUTOPILOT_ACCEL_SCALE * dt;
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

function currentIslandCollider() {
  const station = currentSector().station;
  const profile = ISLAND_BACKDROP_PROFILES[state.currentSectorId] || ISLAND_BACKDROP_PROFILES.grey_exchange;
  return {
    x: station.x + (profile.isletOffsetX || -10),
    y: station.y + (profile.isletOffsetY || -2),
    rx: Math.max(44, (profile.isletRx || 68) - 12),
    ry: Math.max(18, (profile.isletRy || 24) - 4),
  };
}

function resolveIslandCollision(body, options = {}) {
  if (!body || !Number.isFinite(body.x) || !Number.isFinite(body.y)) return false;
  const collider = currentIslandCollider();
  const margin = Number(options.margin || 0);
  const rx = collider.rx + margin;
  const ry = collider.ry + margin;
  const dx = body.x - collider.x;
  const dy = body.y - collider.y;
  const norm = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
  if (norm >= 1) return false;

  const scale = 1 / Math.max(0.0001, Math.sqrt(norm));
  body.x = collider.x + dx * scale;
  body.y = collider.y + dy * scale;
  if (Number.isFinite(body.vx)) body.vx *= 0.35;
  if (Number.isFinite(body.vy)) body.vy *= 0.35;
  return true;
}

function currentIslandProfile() {
  return ISLAND_BACKDROP_PROFILES[state.currentSectorId] || ISLAND_BACKDROP_PROFILES.grey_exchange;
}

function drawPalmCluster(x, y, profile, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = profile.trunk;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-4, -20, 0, -40);
  ctx.stroke();
  ctx.strokeStyle = profile.foliage;
  ctx.lineWidth = 2;
  for (const spread of [-0.95, -0.5, -0.12, 0.2, 0.62]) {
    ctx.beginPath();
    ctx.moveTo(0, -40);
    ctx.quadraticCurveTo(spread * 14, -48, spread * 26, -34 + Math.abs(spread) * 6);
    ctx.stroke();
  }
  ctx.restore();
}

function formatCredits(value) {
  return `${Math.round(value).toLocaleString()} coins`;
}

function commodityById(id) {
  return COMMODITIES.find((commodity) => commodity.id === id);
}

function factionName(id) {
  return FACTIONS.find((faction) => faction.id === id)?.name || id;
}

function displayTag(tag) {
  const labels = {
    "Authority": "Wardens",
    "Barnard": "Driftwood",
    "Bounty": "Trouble",
    "Bulk Freight": "Bulk Supplies",
    "Cargo": "Supplies",
    "Centauri": "Reefspan",
    "Clearance": "Blessing",
    "Convoy": "Ferry Chain",
    "Core": "Sunroot",
    "Core Arc": "Old Law",
    "Courier": "Message",
    "Escort": "Ferry",
    "Faction Arc": "Path Choice",
    "Freight": "Supplies",
    "Gray": "Moonglass",
    "Hot Patrols": "Watchful Wardens",
    "Nightglass": "Moonglass",
    "Permit": "Path Token",
    "Registry": "Ledger",
    "Salvage": "Recovery",
    "Sirius": "Silverpool",
    "Smuggling": "Hidden",
    "Sol": "Sunroot",
    "Tau Ceti": "Quiet Keys",
  };
  return labels[tag] || tag;
}

function displayTags(tags, limit = 2, separator = " / ") {
  return (tags || []).slice(0, limit).map(displayTag).join(separator);
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
  if (permitId === "coreTransit") return "Deep Path Blessing";
  if (permitId === "nightglassTransit") return "Moon Path Token";
  return "Path Blessing";
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
  return state.player.loanerHull ? "This borrowed travel form is only trusted on local paths" : "";
}

function jumpCountLabel(count) {
  return `${count} path stretch${count === 1 ? "" : "es"}`;
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
  if (!via.length) return "Direct path";
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
    return { route: null, fuelCost: 0, jumpCount: 0, blockedReason: "Unknown place", blockedTag: "Route", canTravel: false, waypointLabel: "", routeLabel: "" };
  }
  if (sectorId === originId) {
    return { route: [originId], fuelCost: 0, jumpCount: 0, blockedReason: "Already here", blockedTag: "Route", canTravel: false, waypointLabel: "", routeLabel: SECTORS[originId].name };
  }

  const route = plottedRouteToSector(sectorId, originId);
  if (!route) {
    return { route: null, fuelCost: 0, jumpCount: 0, blockedReason: "No known path from your current place", blockedTag: "Route", canTravel: false, waypointLabel: "", routeLabel: "" };
  }

  const fuelCost = routeFuelCost(route);
  const permitBlock = routePermitBlock(route);
  let blockedReason = "";
  let blockedTag = "Route";

  if (state.player.loanerHull) {
    blockedReason = hyperspaceLockText();
    blockedTag = "Flagship";
  } else if (permitBlock) {
    blockedReason = `${travelPermitLabel(permitBlock.requirement)} required at ${SECTORS[permitBlock.sectorId]?.name || "sealed place"}`;
    blockedTag = "Permit";
  } else if (fuelCost > currentHull().fuelCap) {
    blockedReason = `This route needs ${fuelCost} supplies but ${currentHull().name} only carries ${currentHull().fuelCap}`;
    blockedTag = "Fuel";
  } else if (state.player.fuel < fuelCost) {
    blockedReason = `This route needs ${fuelCost} supplies and you only have ${state.player.fuel}`;
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
  return { x: 0, y: 0 };
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
  if (contracts.length === 1) return `Quest: ${contracts[0].title}`;
  return `${contracts.length} quests waiting here`;
}

function contractBadgeShort(sectorId) {
  const contracts = contractsForSector(sectorId);
  if (!contracts.length) return "";
  return contracts.length === 1 ? "QUEST" : `${contracts.length} QUESTS`;
}

function missionContactProfile(contract = null, sector = currentSector()) {
  const profiles = {
    independent: {
      id: "independent-mara-kade",
      name: "Auntie Sable Marris",
      role: "Mangrove House host",
      color: "#d8bc79",
      portrait: CONTACT_ARCHIVE["independent-mara-kade"].portrait,
      initials: "SM",
      opener: CONTACT_ARCHIVE["independent-mara-kade"].opener,
    },
    frontier: {
      id: "union-juno-vale",
      name: "Sister Nera Bloom",
      role: "Banyan keeper",
      color: "#9fcf92",
      portrait: "./assets/contacts/sister-nera-bloom-portrait.png",
      initials: "NB",
      opener: CONTACT_ARCHIVE["union-juno-vale"].opener,
    },
    salvage: {
      id: "salvage-dax-brindle",
      name: "Pip Tidewell",
      role: "Reef gleaner",
      color: "#e3c277",
      portrait: "./assets/contacts/pip-tidewell-portrait-v2.png",
      initials: "PT",
      opener: CONTACT_ARCHIVE["salvage-dax-brindle"].opener,
    },
    syndicate: {
      id: "nightglass-vey-neral",
      name: "The Hooded Figure",
      role: "Mysterious guide",
      color: "#c7accf",
      portrait: "./assets/contacts/hooded-guide-portrait-v2.png",
      initials: "HF",
      opener: CONTACT_ARCHIVE["nightglass-vey-neral"].opener,
    },
    authority: {
      id: "core-ilya-sen",
      name: "Warden Elric Fen",
      role: "River watch",
      color: "#cdd9c7",
      portrait: "./assets/contacts/warden-elric-fen-portrait-v2.png",
      initials: "EF",
      opener: CONTACT_ARCHIVE["core-ilya-sen"].opener,
    },
    bounty: {
      id: "bounty-marshal-tovin",
      name: "Marshal Bramble Hart",
      role: "Thorn ranger",
      color: "#d68872",
      portrait: "./assets/contacts/marshal-bramble-hart-portrait-v2.png",
      initials: "BH",
      opener: CONTACT_ARCHIVE["bounty-marshal-tovin"].opener,
    },
    pirate: {
      id: "pirate-rill-scrimshaw",
      name: "Rill Scrimshaw",
      role: "Underway pilot",
      color: "#e09a6f",
      portrait: "./assets/contacts/rill-scrimshaw-portrait-v2.png",
      initials: "RS",
      opener: CONTACT_ARCHIVE["pirate-rill-scrimshaw"].opener,
    },
    hollow: {
      id: "hollow-mire-kest",
      name: "Mire Kest",
      role: "Hollow Door keeper",
      color: "#9fd4c8",
      portrait: "",
      initials: "MK",
      opener: CONTACT_ARCHIVE["hollow-mire-kest"].opener,
    },
    briar: {
      id: "briar-ollie-lark",
      name: "Ollie Lark",
      role: "Briar bell-ringer",
      color: "#e2b56e",
      portrait: "",
      initials: "OL",
      opener: CONTACT_ARCHIVE["briar-ollie-lark"].opener,
    },
    reedfall: {
      id: "reedfall-tamsin-voss",
      name: "Tamsin Voss",
      role: "Reedfall surveyor",
      color: "#94d7a5",
      portrait: "",
      initials: "TV",
      opener: CONTACT_ARCHIVE["reedfall-tamsin-voss"].opener,
    },
  };

  if ((contract?.tags || []).includes("Mara Thread")) return profiles.independent;
  if ((contract?.tags || []).includes("Dax Thread")) return profiles.salvage;
  if ((contract?.tags || []).includes("Juno Thread")) return profiles.frontier;
  if ((contract?.tags || []).includes("Rill Thread")) return profiles.pirate;
  if ((contract?.tags || []).includes("Hollow Thread")) return profiles.hollow;
  if ((contract?.tags || []).includes("Briar Thread")) return profiles.briar;
  if ((contract?.tags || []).includes("Reedfall Thread")) return profiles.reedfall;
  if (contract && ((contract.tags || []).includes("Core Arc") || contract.grantsPermit === "coreTransit" || contract.factionId === "authority")) return profiles.authority;
  if (contract && ((contract.tags || []).includes("Faction Arc") || contract.factionId === "syndicate" || (contract.tags || []).includes("Nightglass"))) return profiles.syndicate;
  if (contract?.factionId === "pirate") return profiles.pirate;
  if (contract?.type === "salvage") return profiles.salvage;
  if (contract?.type === "bounty") return profiles.bounty;
  if (contract?.factionId === "frontier") return profiles.frontier;
  if (sector.faction === "frontier") return profiles.frontier;
  if (sector.faction === "authority") return profiles.authority;
  if (sector.faction === "syndicate") return profiles.syndicate;
  if (sector.faction === "pirate") return profiles.pirate;
  return profiles.independent;
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

function refreshMissionThreadContacts() {
  const threadColors = {
    "independent-mara-kade": "#d8bc79",
    "union-juno-vale": "#9fcf92",
    "salvage-dax-brindle": "#e3c277",
    "nightglass-vey-neral": "#c7accf",
    "core-ilya-sen": "#cdd9c7",
    "bounty-marshal-tovin": "#d68872",
    "pirate-rill-scrimshaw": "#e09a6f",
    "hollow-mire-kest": "#9fd4c8",
    "briar-ollie-lark": "#e2b56e",
    "reedfall-tamsin-voss": "#94d7a5",
  };
  Object.entries(state.missionThreads || {}).forEach(([threadId, thread]) => {
    if (!thread || typeof thread !== "object") return;
    const archive = CONTACT_ARCHIVE[threadId];
    if (!archive) return;
    thread.contact = {
      id: threadId,
      name: archive.title,
      role: archive.role,
      color: threadColors[threadId] || thread.contact?.color || "#79d8ff",
      portrait: archive.portrait || "",
      initials: archive.title.split(" ").map((part) => part[0]).join("").slice(0, 2),
      opener: archive.opener || archive.copy,
    };
    if (Array.isArray(thread.messages) && thread.messages.length) {
      const firstMessage = thread.messages[0];
      if (firstMessage && firstMessage.from === "them" && firstMessage.contractId == null) {
        firstMessage.text = archive.opener || archive.copy;
      }
    }
  });
}

function appendMissionThreadMessage(threadId, message, options = {}) {
  if (!threadId) return;
  if (!state.missionThreads[threadId]) return;
  const entry = {
    from: message.from,
    text: normalizeUiText(message.text),
    contractId: message.contractId || null,
    voiceKey: message.voiceKey || null,
  };
  state.missionThreads[threadId].messages.push(entry);
  state.missionThreads[threadId].messages = state.missionThreads[threadId].messages.slice(-40);
  if (options.unread) {
    state.missionThreads[threadId].unread = (state.missionThreads[threadId].unread || 0) + 1;
  }
  if (state.dockScreen === "contract-thread" && state.activeMissionThreadId === threadId) {
    resetThreadViewport(true);
    playMissionMessageVoice(threadId, entry);
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
    playLatestMissionThreadVoice(threadId);
  }
}

function missionResponseLabel(contract) {
  const destination = SECTORS[contract.destinationId]?.name || "the next stop";
  const byType = {
    cargo: [
      `"I can carry that into ${destination}. Tell me who needs it most."`,
      `"All right. I'll bring it to ${destination} and keep the path clean."`,
    ],
    courier: [
      `"I'll carry the note to ${destination}. What should I watch for on the way?"`,
      `"Send the details. I can get this to ${destination}.`,
    ],
    smuggling: [
      `"If this needs quiet hands, start with why."`,
      `"I can carry it discreetly. Tell me what danger is hiding behind the favor."`,
    ],
    bounty: [
      `"Point me toward the trouble at ${destination}.`,
      `"Tell me what is making the paths unsafe and I'll deal with it."`,
    ],
    salvage: [
      `"Show me what the marsh gave up near ${destination}.`,
      `"All right. Tell me what was found and why it matters."`,
    ],
  };
  return pickVariantForKey(`mission-response:${contract.id}`, byType[contract.type] || [
    `"Tell me more about ${contract.title}.`,
    `"I'm listening. Start with what matters most."`,
  ]);
}

function missionChatMessages(contract = null) {
  const contact = missionContactProfile(contract);
  const messages = [
    { from: "them", text: contact.opener },
  ];

  if (!state.availableContracts.length) {
    messages.push({ from: "them", text: "The islands are quiet for the moment. Stay ready and check back when the channels start gossiping again." });
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
      text: "Give me the shape of things. I want the work that changes what is happening in these islands.",
    });
    return { contact, messages };
  }

  messages.push({
    from: "them",
    text: `${contract.copy} Payout stands at ${formatCredits(contract.reward)} and the trail points toward ${SECTORS[contract.destinationId]?.name || "unknown country"}.`,
  });
  messages.push({
    from: "you",
    text: promptLabelText(missionResponseLabel(contract)),
  });
  if ((contract.tags || []).includes("Core Arc")) {
    messages.push({
      from: "them",
      text: "This is not just another errand. The old laws, the tide wards, and the waking archipelago are all starting to contradict each other.",
    });
  } else if ((contract.tags || []).includes("Faction Arc")) {
    messages.push({
      from: "them",
      text: "Take it and one side of the isles will start to think you belong to them. Be careful what that buys.",
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

function currentThreadReplyIndex(entries = menuEntries()) {
  return clamp(state.threadReplyIndex || 0, 0, Math.max(0, entries.length - 1));
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
    if (state.coreArc.stage === "resolved") return { label: "ledger known", warm: true };
    if (hasSectorPermit("coreTransit")) return { label: "cleared courier", warm: true };
    if (factionReputation("authority") <= -6) return { label: "flagged record" };
  }
  if (thread.id === "bounty-marshal-tovin") {
    if (factionReputation("authority") >= 10) return { label: "trusted asset", warm: true };
    if (factionReputation("authority") <= -8) return { label: "watched" };
  }
  if (thread.id === "pirate-rill-scrimshaw") {
    if (state.contactArcs.rill.stage === "resolved") return { label: "underways trusted", warm: true };
    if (factionReputation("pirate") >= 8) return { label: "reef-side known", warm: true };
    if (factionReputation("pirate") <= -10) return { label: "shore unwelcome" };
  }
  if (thread.id === "hollow-mire-kest") {
    if (hasCompletedContract("mystery-hollow-door-knock")) return { label: "lintel known", warm: true };
    if (state.intrigue.stage === "hollow-door") return { label: "door opened", warm: true };
  }
  if (thread.id === "briar-ollie-lark") {
    if (hasCompletedContract("mystery-briar-bell")) return { label: "bell trusted", warm: true };
  }
  if (thread.id === "reedfall-tamsin-voss") {
    if (hasCompletedContract("mystery-reedfall-witnesses")) return { label: "witness logged", warm: true };
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
  if (!thread) return "The islands are quiet for the moment.";
  const { active, available } = missionThreadContractState(thread);
  const destinationName = (contract) => SECTORS[contract.destinationId]?.name || "the next stop";
  const firstName = thread.contact.name.split(" ")[0];
  const memory = contactMemoryFlavor(thread.id);
  const styleByThread = {
    "independent-mara-kade": { active: "Sable is watching how you carry this.", quiet: "Sable is listening to the inn breathe and waiting for the next useful rumor.", one: "Sable has one live lead.", many: "Sable has several trails on the table." },
    "union-juno-vale": { active: "Nera sounds worried enough to skip ceremony.", quiet: "Nera is tending the banyan and buying a little calm.", one: "Nera has one task that matters.", many: "Nera has several worries asking for hands." },
    "salvage-dax-brindle": { active: "Pip thinks the reef is hiding an answer.", quiet: "Pip has gone still, which usually means he is waiting for the tide to give something up.", one: "Pip found one promising clue.", many: "Pip has several briny leads worth sorting." },
    "nightglass-vey-neral": { active: "The hooded figure is measuring your kindness and your nerve at the same time.", quiet: "The hooded figure has gone silent again.", one: "A single careful lead is waiting.", many: "Several incomplete truths are waiting." },
    "core-ilya-sen": { active: "Elric wants the facts before fear outruns them.", quiet: "Elric is holding the crossings and waiting for clearer signs.", one: "Elric has one matter to settle.", many: "Elric has several boundary troubles open." },
    "bounty-marshal-tovin": { active: "Bramble wants the paths safer by dusk.", quiet: "Bramble is briefly not shouting about danger.", one: "Bramble has one rough problem marked.", many: "Bramble has several rough problems marked." },
    "pirate-rill-scrimshaw": { active: "Rill says the underways are moving people the official map stopped caring about.", quiet: "Rill is somewhere under the cliff line, listening for trouble in the coves.", one: "Rill has one quiet crossing to ask of you.", many: "Rill has several dangerous favors waiting in the dark water." },
  };
  const style = styleByThread[thread.id] || { active: `${firstName} still needs this handled.`, quiet: `${firstName} is quiet for the moment.`, one: `${firstName} has one lead.`, many: `${firstName} has several leads.` };

  let line = "";
  if (active.length) {
    line = `${style.active} ${active[0].title} still points toward ${destinationName(active[0])}.`;
  } else if (available.length === 1) {
    line = `${style.one} ${available[0].title} leads toward ${destinationName(available[0])}. ${available[0].copy}`;
  } else if (available.length > 1) {
    line = `${style.many} ${available.slice(0, 3).map((contract) => `${contract.title} at ${destinationName(contract)}`).join(", ")}.`;
  } else {
    line = style.quiet;
  }
  return memory ? `${line} ${memory}` : line;
}

function missionInboxPreview(thread) {
  if (!thread) return "No messages yet.";
  const { active, available } = missionThreadContractState(thread);
  const destinationName = (contract) => SECTORS[contract.destinationId]?.name || "the next stop";
  if (active.length) return `${active[0].title} still active at ${destinationName(active[0])}.`;
  if (available.length === 1) return `${available[0].title} waiting at ${destinationName(available[0])}.`;
  if (available.length > 1) return `${available.length} open leads across the isles.`;
  const latest = visibleMissionThreadMessages(thread).slice(-1)[0]?.text || thread.contact.opener;
  return latest.length > 88 ? `${latest.slice(0, 85)}...` : latest;
}

function contactMemoryFlavor(threadId) {
  if (threadId === "independent-mara-kade") {
    if (state.contactArcs.mara.stage === "resolved") return "Sable is not talking to you like a stranger anymore, and the whole house can hear it.";
    if (state.contactArcs.mara.completed.includes("mara-dockside-whisper")) return "She still remembers that you carried her quiet warning home without breaking trust.";
    if (state.contactArcs.mara.completed.includes("mara-quiet-haul")) return "You already proved you could carry one delicate favor cleanly, which buys more than coin in this room.";
  }
  if (threadId === "union-juno-vale") {
    if (state.contactArcs.juno.stage === "resolved") return "Nera trusts you now the way healers trust the people who actually show up when fear gets loud.";
    if (state.contactArcs.juno.completed.includes("juno-convoy-proof")) return "She has not forgotten that you brought her proof instead of pretty guesses.";
    if (state.contactArcs.juno.completed.includes("juno-relief-drop")) return "The first mercy run still sits in her voice every time she writes.";
  }
  if (threadId === "salvage-dax-brindle") {
    if (state.contactArcs.dax.stage === "resolved") return "Pip talks to you like someone who knows the difference between a relic and a clue.";
    if (state.contactArcs.dax.completed.includes("dax-ledger-fragment")) return "He knows you can spot the difference between recovery value and real history now.";
    if (state.contactArcs.dax.completed.includes("dax-cinder-sweep")) return "You already came back from one muddy pull with the right prize, and he clearly noticed.";
  }
  if (threadId === "nightglass-vey-neral") {
    if (hasSectorPermit("nightglassTransit")) return "The token you carry has changed how carefully the hooded figure chooses each word.";
    if (state.factionArc.path === "syndicate" && state.factionArc.stage === "resolved") return "You are no longer just another traveler to them, and neither of you gets to pretend otherwise.";
    if (state.factionArc.path === "syndicate") return "You took one step into their hidden channels already, and the islands remember that kind of choice.";
  }
  if (threadId === "core-ilya-sen") {
    if (state.coreArc.stage === "resolved") return "Elric can no longer dismiss you as a passing wanderer; your choices are part of the record now.";
    if (state.coreArc.completed.includes("core-arc-centauri-relay")) return "He knows you carried the old chain of obligations farther than most people would have bothered.";
    if (hasSectorPermit("coreTransit")) return "The official blessing did more for his opinion of you than he would ever admit.";
  }
  if (threadId === "bounty-marshal-tovin") {
    if (factionReputation("authority") >= 10) return "Bramble's tone says you have stopped being random trouble and started looking like dependable help.";
    if (factionReputation("authority") <= -8) return "He remembers every time you made hard paths harder than they needed to be.";
  }
  if (threadId === "pirate-rill-scrimshaw") {
    if (state.contactArcs.rill.stage === "resolved") return "Rill now talks to you like someone who understands the difference between raiding and refusing to disappear.";
    if (state.contactArcs.rill.completed.includes("rill-tide-testimony")) return "You carried underway truth into open water and came back with your name still intact.";
    if (state.contactArcs.rill.completed.includes("rill-reef-ledger")) return "Rill has started treating you less like a passing shore-hand and more like somebody who might actually listen.";
    if (state.contactArcs.rill.completed.includes("rill-cove-supper")) return "You helped one hidden cove eat through the week, and Rill clearly noticed you did not ask the wrong questions first.";
  }
  if (threadId === "independent-mara-kade" && hasCompletedContract("mystery-relief-freight")) {
    return "She keeps talking like that mercy run touched a ledger bigger than the bundles themselves.";
  }
  if (threadId === "union-juno-vale" && hasCompletedContract("mystery-relief-freight")) {
    return "Nera has not stopped sounding irritated that a so-called relief bundle arrived with political fingerprints all over it.";
  }
  if (threadId === "nightglass-vey-neral" && hasCompletedContract("mystery-manifest-anomaly")) {
    return "The hooded guide clearly thinks the odd paperwork was not a forgery so much as an introduction.";
  }
  if (threadId === "core-ilya-sen" && hasCompletedContract("mystery-manifest-anomaly")) {
    return "Elric has become extremely interested in who was able to make a routine ledger correction appear before anyone admitted the error.";
  }
  if (threadId === "salvage-dax-brindle" && hasCompletedContract("mystery-escort-trace")) {
    return "Pip keeps treating Saint Radiant like a wreck with witnesses rather than a ferry that merely went missing.";
  }
  if (threadId === "hollow-mire-kest" && hasCompletedContract("mystery-hollow-door-knock")) {
    return "Mire has started counting your arrivals as evidence rather than chance.";
  }
  if (threadId === "briar-ollie-lark" && hasCompletedContract("mystery-briar-bell")) {
    return "Ollie hears the cracked bell differently now that you brought it home with a name attached.";
  }
  if (threadId === "reedfall-tamsin-voss" && hasCompletedContract("mystery-reedfall-witnesses")) {
    return "Tamsin has your route pinned into the survey line as part of the basin's witness record.";
  }
  return "";
}

function intrigueCrossTalkForContract(contract) {
  const destination = SECTORS[contract.destinationId]?.name || "the next haven";
  if (contract.id === "mystery-relief-freight") {
    return [
      {
        threadId: "nightglass-vey-neral",
        text: `Mercy run is such a useful phrase. Half the time it means medicine. The other half it means someone wants leverage to arrive wearing a compassionate face. Your ${destination} handoff smelled like the second kind.`,
      },
      {
        threadId: "core-ilya-sen",
        text: `For the record, the ${destination} bundle was filed as routine civic relief. The speed with which that classification appeared is mildly interesting in a way I dislike.`,
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
        text: `Funny thing about forged ledgers: the dangerous ones are not the sloppy ones. The dangerous ones look so routine everybody downstream agrees to remember them that way.`,
      },
      {
        threadId: "nightglass-vey-neral",
        text: `The Wardens will call that addendum fraudulent because it arrived early. I would call it well sponsored. Timing like that usually means someone on both sides already agreed what the truth would be.`,
      },
      {
        threadId: "union-juno-vale",
        text: `That paperwork hit the board before the people harmed by it even got asked. That is not clerical drift. That is somebody building policy out of a lie while the quay is still busy unloading.`,
      },
    ];
  }
  if (contract.id === "mystery-escort-trace") {
    return [
      {
        threadId: "core-ilya-sen",
        text: `Saint Radiant should exist in three ledgers, two witness rolls, and one ferry memorial index. At present it exists in fragments and denials, which is administratively impossible and therefore politically real.`,
      },
      {
        threadId: "nightglass-vey-neral",
        text: `Boats do not vanish cleanly unless several institutions are paid to remember less than they know. Saint Radiant keeps surfacing because somebody important failed to buy every witness.`,
      },
      {
        threadId: "salvage-dax-brindle",
        text: `The wood says ferry craft. The paperwork says clerical loss. The people who say clerical loss usually have softer hands than the people who built the thing.`,
      },
    ];
  }
  if (contract.id === "mystery-ninth-berth") {
    return [
      {
        threadId: "independent-mara-kade",
        text: `If somebody says Ninth Lintel like it is a place instead of a rumor, pay attention. Doors only get spoken that carefully when too many factions still owe them money.`,
      },
      {
        threadId: "nightglass-vey-neral",
        text: `Ninth Lintel is not a quay. It is an agreement people retreat into when official maps become inconvenient. If you heard the name twice, you are already closer than most travelers get.`,
      },
      {
        threadId: "core-ilya-sen",
        text: `There is no licensed threshold by that designation. There are, however, several sealed references to route work that required unrecorded Warden handling. I dislike that sentence more every time I read it.`,
      },
    ];
  }
  if (contract.id === "mystery-hollow-door-knock") {
    return [
      {
        threadId: "hollow-mire-kest",
        text: `You reached ${destination}. Good. The door took the trace, which means Saint Radiant was carried through a route several respectable people still rely on while calling it criminal.`,
      },
      {
        threadId: "pirate-rill-scrimshaw",
        text: `Hollow Door, then. Told you the underways were not a campfire story. If Mire let you stand there, somebody already decided you might carry names without selling them.`,
      },
      {
        threadId: "nightglass-vey-neral",
        text: `The Hollow Door is not mine. That distinction matters. Moonglass knows how to pay for a threshold; Mire knows when a threshold should refuse payment.`,
      },
    ];
  }
  if (contract.id === "mystery-briar-bell") {
    return [
      {
        threadId: "briar-ollie-lark",
        text: `The clapper rang for a welcome-roll name that was scraped out, not lost. Bells are useful that way. They embarrass the paperwork.`,
      },
      {
        threadId: "independent-mara-kade",
        text: `Briar Hearth keeps the kind of memory polite people call quaint right up until it proves their filing cabinets lied.`,
      },
    ];
  }
  if (contract.id === "mystery-reedfall-witnesses") {
    return [
      {
        threadId: "reedfall-tamsin-voss",
        text: `The stakes answered. Three ferry names, one bad closure, and a trail of families pushed into water everyone later called unsafe. I am done letting officials call that folklore.`,
      },
      {
        threadId: "union-juno-vale",
        text: `Reedfall has always sounded too gentle for how much grief it holds. Thank you for bringing Ollie's bell there before anyone could file the problem into fog.`,
      },
    ];
  }
  if (contract.id === "mystery-rootmirror-lanterns") {
    return [
      {
        threadId: "reedfall-tamsin-voss",
        text: `Rootmirror matched the paired lanterns. These are not abstract missing names anymore. They are households, routes, children, and people who learned to vanish because open travel stopped protecting them.`,
      },
      {
        threadId: "pirate-rill-scrimshaw",
        text: `Careful with those lantern names. They are proof, yes, but they are also people. Bring them into daylight wrong and you will do the wardens' work for them.`,
      },
    ];
  }
  if (contract.id === "mystery-low-water-council") {
    return [
      {
        threadId: "independent-mara-kade",
        text: `Mangrove House can host a hard truth without letting anyone turn it into theater. Bring them home. I will keep the stew hot and the wrong listeners outside.`,
      },
      {
        threadId: "core-ilya-sen",
        text: `A council at Mangrove House has no formal standing. It may, regrettably, have more legitimacy than several formal hearings I have attended.`,
      },
      {
        threadId: "hollow-mire-kest",
        text: `Once the names are spoken together, nobody gets to own them alone. That is the point. That is also why several people will try.`,
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
                  : entry.threadId === "pirate-rill-scrimshaw"
                    ? "#e09a6f"
                    : entry.threadId === "hollow-mire-kest"
                      ? "#9fd4c8"
                      : entry.threadId === "briar-ollie-lark"
                        ? "#e2b56e"
                        : entry.threadId === "reedfall-tamsin-voss"
                          ? "#94d7a5"
                          : "#79d8ff",
          portrait: archive.portrait,
          initials: archive.title.split(" ").map((part) => part[0]).join("").slice(0, 2),
          opener: archive.opener || archive.copy,
        },
        messages: [{ from: "them", text: archive.opener || archive.copy, contractId: null }],
        unread: 0,
      };
    }
    appendMissionThreadMessage(entry.threadId, {
      from: "them",
      text: entry.text,
      contractId: contract.id,
      voiceKey: `thread.${entry.threadId}.${contract.id}`,
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
  const sectorName = SECTORS[sectorId]?.name || "this haven";
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
          `You made it to ${sectorName}. Good. ${contract.title} is still the job, and I know better than to waste a good traveler once they've proven themselves.`,
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
          `Since you're in ${sectorName}, I've opened a better angle for you. Read the board under my name and pick the one worth your time.`,
          `${sectorName} gives me room to offer you something better. Open the thread and take the run that deserves your steadiness.`,
          `Now that you're in ${sectorName}, I can hand you a cleaner angle. Check my board and choose well.`,
        ])
        : desperate
          ? pickVariant([
            `You're in ${sectorName}, and I need somebody to come through for Mangrove House before the quay starts eating itself. Open the thread.`,
            `${sectorName} just made this urgent. Open the thread if you're willing to keep Mangrove House from coming apart in public.`,
            `You're in the right place at the wrong moment. Open the thread before this turns into a quay-side autopsy.`,
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
        ? `You're in ${sectorName}, which puts you near a wreck I'd rather you touch before anybody dumber does. Thread has the details.`
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
        ? `The ledger notes your arrival in ${sectorName}. ${contract.title} remains active. Given your recent record, I am cautiously optimistic you may complete it without incident.`
        : cold
          ? `The ledger notes your arrival in ${sectorName}. ${contract.title} remains active. Kindly resist your normal urge to complicate a clean assignment.`
          : `The ledger notes your arrival in ${sectorName}. ${contract.title} remains active. Please behave like someone capable of finishing a clean assignment.`
      : warm
        ? `Your presence in ${sectorName} makes one pending matter newly relevant. I am placing it in your queue because, regrettably, you have earned that courtesy.`
        : `Your presence in ${sectorName} makes one pending matter newly relevant. Review the thread and decide whether you intend to be useful.${memory ? ` ${memory}` : ""}`,
    "bounty-marshal-tovin": relevantActive.length
      ? warm
        ? `You're in ${sectorName}. Good. ${contract.title} is still open, and you're one of the few travelers I trust not to talk first and work later.`
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
    voiceKey: generatedThreadVoiceKey(thread.id, relevantActive.length ? "arrival-active" : "arrival-available"),
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
      voiceKey: ping.voiceKey,
    }, { unread: true });
    state.arrivalThreadPings[thread.id] = ping.signature;
    pings.push(thread.contact.name);
  }
  if (pings.length) {
    const pingLine = pings.length > 2 ? `${pings.slice(0, 2).join(", ")} and ${pings.length - 2} more` : pings.join(", ");
    pushMessageLog(`New messages from ${pings.join(", ")} on entry to ${SECTORS[sectorId]?.name || "this place"}.`, "Messages");
    showBanner("Messages Waiting", `${pingLine} just lit up your inbox.`, 2.2);
  }
}

function activeMissionLines(limit = 5) {
  if (!state.activeContracts.length) {
    return ["No active missions. Dock up, hit the board, and stack a reason to travel."];
  }
  return state.activeContracts.slice(0, limit).map((contract) => {
    const destination = SECTORS[contract.destinationId]?.name || "Unknown";
    const tags = Array.isArray(contract.tags) && contract.tags.length ? ` • ${displayTags(contract.tags)}` : "";
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

function storyContractPriority(contract) {
  const tags = contract?.tags || [];
  if (tags.includes("Mystery")) return 0;
  if (tags.includes("Core Arc")) return 10;
  if (tags.includes("Faction Arc")) return 20;
  if (contract?.grantsPermit) return 25;
  if (tags.some((tag) => tag.endsWith("Thread") || tag === "Character" || tag === "Bridge")) return 30;
  return Infinity;
}

function isStoryContract(contract) {
  return storyContractPriority(contract) < Infinity;
}

function repairStalledArcChoice() {
  const path = state.factionArc.path;
  if (!path || state.factionArc.stage !== "intro") return false;
  const pendingId = `arc-choice-${path}`;
  const choiceIsCompleted = state.factionArc.completed.includes(pendingId);
  const choiceIsActive = state.activeContracts.some((contract) => contract.id === pendingId);
  if (choiceIsCompleted || choiceIsActive) return false;
  state.factionArc.path = null;
  return true;
}

function nextStoryLead() {
  if (repairStalledArcChoice() && state.mode === "dock") {
    resetContractsForSector();
  }
  const seen = new Set();
  const leads = [];
  const addLead = (contract, sourceSectorId, status) => {
    if (!contract || seen.has(contract.id) || !isStoryContract(contract)) return;
    seen.add(contract.id);
    leads.push({
      contract,
      sourceSectorId,
      status,
      priority: storyContractPriority(contract),
    });
  };

  for (const contract of state.activeContracts) {
    addLead(contract, state.currentSectorId, "active");
  }
  for (const contract of state.availableContracts) {
    addLead(contract, state.currentSectorId, "available-here");
  }
  for (const sectorId of knownSectorIds()) {
    for (const contract of generateContracts(sectorId)) {
      addLead(contract, sectorId, sectorId === state.currentSectorId ? "available-here" : "available-elsewhere");
    }
  }

  return leads.sort((a, b) => (
    a.priority - b.priority
    || (a.status === "active" ? -1 : b.status === "active" ? 1 : 0)
    || (a.sourceSectorId === state.currentSectorId ? -1 : b.sourceSectorId === state.currentSectorId ? 1 : 0)
    || a.contract.title.localeCompare(b.contract.title)
  ))[0] || null;
}

function storyLeadMeta(lead = nextStoryLead()) {
  if (!lead) return "No main thread lead is waiting right now.";
  const contract = lead.contract;
  if (lead.status === "active") {
    return `Active: ${contract.title} -> ${SECTORS[contract.destinationId]?.name || "Unknown"}.`;
  }
  if (lead.sourceSectorId === state.currentSectorId) {
    return `Next lead here: ${contract.title}.`;
  }
  return `Next lead at ${SECTORS[lead.sourceSectorId]?.name || "another haven"}: ${contract.title}.`;
}

function resumeStoryLead() {
  const lead = nextStoryLead();
  if (!lead) {
    openDockScreen("contracts");
    setStatus("No main story lead is waiting. Check Messages for local work or use the Trail Map to pick a clean route.", { tag: "Track" });
    return;
  }

  if (lead.status === "active") {
    openStarmap(state.mode === "flight" ? "flight" : "dock", lead.contract.destinationId);
    setStatus(`Tracking active mission: ${lead.contract.title}.`, { tag: "Track" });
    return;
  }

  if (state.activeContracts.length >= 3) {
    openPopup({
      title: "Quest Board Full",
      copy: `${lead.contract.title} is the next main lead, but your active board is full. Open Messages, choose any active mission thread, and use Drop Mission to free a slot.`,
      options: [
        {
          label: "Open Messages",
          meta: "Pick an active thread to drop or finish",
          confirm() {
            closePopup();
            openDockScreen("contracts");
          },
        },
        {
          label: "Plot Lead Source",
          meta: SECTORS[lead.sourceSectorId]?.name || "Lead location",
          confirm() {
            closePopup();
            openStarmap(state.mode === "flight" ? "flight" : "dock", lead.sourceSectorId);
          },
        },
        {
          label: "Close",
          meta: "Return to the island kit",
          confirm() {
            closePopup();
          },
        },
      ],
    });
    return;
  }

  if (lead.sourceSectorId === state.currentSectorId) {
    const thread = ensureMissionThread(lead.contract);
    setActiveMissionThread(thread.id);
    state.dockScreen = "contract-thread";
    state.threadReplyIndex = 0;
    resetThreadViewport(true);
    setStatus(`Next story lead open: ${lead.contract.title}.`, { tag: "Track" });
    setHint("A accepts the lead, B returns to Messages, and drop actions are available for active missions in this thread.");
    return;
  }

  openStarmap(state.mode === "flight" ? "flight" : "dock", lead.sourceSectorId);
  setStatus(`Next story lead is waiting at ${SECTORS[lead.sourceSectorId]?.name || "another haven"}: ${lead.contract.title}.`, { tag: "Track" });
}

function coreArcStatusLabel() {
  if (state.coreArc.stage === "locked") return "Locked";
  if (state.coreArc.stage === "sol-briefing") return "Sunroot briefing waiting";
  if (state.coreArc.stage === "barnard-ledger") return "Driftwood lead active";
  if (state.coreArc.stage === "centauri-relay") return "Reefspan relay active";
  if (state.coreArc.stage === "sirius-hearing") return "Silverpool hearing active";
  if (state.coreArc.stage === "resolved") return "Resolved";
  return "In motion";
}

function completionImpactLine(contract) {
  const notes = [];
  if (contract.factionId) {
    notes.push(`${factionName(contract.factionId)} +2`);
  }
  if (contract.type === "smuggling") {
    notes.push("Moonglass +2");
  }
  if (contract.grantsPermit) {
    notes.push(`${travelPermitLabel(contract.grantsPermit)} cleared`);
  }
  if (!notes.length) {
    return "Quay ledgers shifted in your favor.";
  }
  return `Standing shift: ${notes.join(" • ")}.`;
}

function completionFollowUpLine(contract, bonusText) {
  const threadId = missionThreadIdForContract(contract);
  const warm = missionThreadRelationshipState({ id: threadId })?.warm;
  const destination = SECTORS[contract.destinationId]?.name || "the quay";
  if ((contract.tags || []).includes("Mystery")) {
    return pickVariant([
      `The quay knew the result of ${contract.title.toLowerCase()} before you said a word. That is either efficiency or foreknowledge, and neither reads clean.`,
      `Somebody on the receiving side moved faster than the bundles should have allowed. ${contract.title} may have landed in more than one ledger.`,
      `${contract.title} closed clean, but the reaction around ${destination} did not feel surprised enough to be ordinary.`,
      `The work is done. The part that lingers is how many people behaved like they were waiting for this exact outcome.`,
    ]);
  }
  const byThread = {
    "independent-mara-kade": () => {
      if (contract.type === "cargo") return warm
        ? "The bundles are already off your deck and the room noticed whose boat carried them in. That matters."
        : "The bundles are off your deck. I will let the right people hear that you handled it clean.";
      if (contract.type === "courier" || contract.type === "smuggling") return warm
        ? "The packet reached the right hands. You did not just earn coins, you earned a cleaner chair at this table."
        : "The packet disappeared where it needed to. That buys you another inch of trust.";
      return `You brought ${contract.title.toLowerCase()} home from ${destination}. The quay is already repeating your name to itself.`;
    },
    "union-juno-vale": () => {
      if (contract.type === "cargo" || contract.type === "courier") return warm
        ? "The handoff is already moving outward to people who actually needed it. That is why I call you first now."
        : "The handoff is already moving outward to the people who needed it. Good work.";
      return "Dispatch has the handoff on the board already. That means one less excuse for the people who caused the delay.";
    },
    "salvage-dax-brindle": () => contract.type === "salvage"
      ? (warm
        ? "Recovery crews say you pulled the part that mattered, not just the piece that sold. That is rarer than it should be."
        : "Recovery crews paid fast, and Pip made sure they understood you brought back the right piece.")
      : "Whatever you dragged in from the crossing is already being priced, argued over, and remembered.",
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
          "The handoff cleared the crossing before the checkpoint watchers remembered how to notice things. Acceptable work.",
          "Package moved cleanly enough that the security layer only got to be offended in retrospect.",
          "By the time anyone official might have paid attention, the package was already a historical detail.",
          "The packet crossed quietly, left no bruise on the ledger, and gave the watchers nothing but wounded dignity.",
        ]))
      : "Moonglass marked the handoff cleanly. That alone will make certain doors quieter when they open.",
    "core-ilya-sen": () => contract.grantsPermit === "coreTransit"
      ? "The ledger updated the moment the packet landed. Bureaucracy rarely moves that fast unless somebody important is relieved."
      : (warm
        ? "Receipt is stamped, filed, and attached to your improving record. Elric will hate how much that sounds like praise."
        : "Receipt is stamped and the record survived contact with you. Progress."),
    "bounty-marshal-tovin": () => contract.type === "bounty"
      ? (warm
        ? "The posted reward cleared and one more violent fool is off the water. Bramble will call that a solid day."
        : "The posted reward cleared. The crossing complains less when raider boats stop moving.")
      : "The board updated the contract and the crossing got slightly less stupid for it.",
  };
  const specific = byThread[threadId];
  if (specific) return specific();
  if (bonusText === "Packet transferred.") {
    return "The packet changed hands without noise and the sender made sure your side of the ledger reflected it.";
  }
  return "The quay updated the ledger on the run and the contact line warmed a little with it.";
}

function completionPayoutMessage(contract, bonusText) {
  const threadId = missionThreadIdForContract(contract);
  const warm = missionThreadRelationshipState({ id: threadId })?.warm;
  const destination = SECTORS[contract.destinationId]?.name || "the quay";
  if ((contract.tags || []).includes("Mystery")) {
    return pickVariant([
      `Good. ${destination} confirmed receipt, and the transfer cleared fast enough to suggest someone important was already watching.`,
      `Good. Payment moved before the quay had time to look confused. That is not how ordinary work settles.`,
      `Good. The coin transfer arrived almost pre-approved. Make of that what you like.`,
      `Good. Coins cleared with suspicious elegance. Somebody upstream wanted this settled before questions formed.`,
    ]);
  }
  const byThread = {
    "independent-mara-kade": () => (contract.type === "courier" || contract.type === "smuggling")
      ? (warm
        ? `Good. You made it to ${destination}. I just sent your side of it.`
        : `Good. You made it to ${destination}. I just pushed your payment.`)
      : contract.type === "cargo"
        ? (warm
          ? "Good. The bundles are off your deck and I already sent your cut."
          : "Good. The bundles are off your deck and I just released your payment.")
        : `Good. You made it to ${destination}. I just released your payment.`,
    "union-juno-vale": () => `Good. You made it to ${destination}. I just cleared your payment on my side.`,
    "salvage-dax-brindle": () => contract.type === "salvage"
      ? "Good pull. I just told the yard to release your cut."
      : `Good. You brought it into ${destination}. I just released your payment.`,
    "nightglass-vey-neral": () => `Good. That arrived where it needed to. I just sent your deposit.`,
    "core-ilya-sen": () => "Receipt confirmed. I just released your transfer.",
    "bounty-marshal-tovin": () => contract.type === "bounty"
      ? "Good. The board has the trouble settled and I just cleared the payout."
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
      "The quay ledger marked the work complete, but the speed of the surrounding response suggested the real transaction happened somewhere off-record.",
    ]);
  }
  if (contract.grantsPermit === "coreTransit") {
    return "The Wardens stamped your ledger for Deep Path travel. Sunroot Atoll is no longer just a rumor on the board.";
  }
  if (contract.grantsPermit === "nightglassTransit") {
    return "A Moonglass broker passed you the kind of token that only exists if somebody already trusts you.";
  }
  if (contract.id === "core-arc-sol-briefing") {
    return "Driftwood Rest answered Sunroot's old paperwork, which means the nearby islands still remember promises the old law forgot.";
  }
  if (contract.id === "core-arc-barnard-ledger") {
    return "The ferry ledger made it clear the independents kept the crossing alive when official traffic thinned out.";
  }
  if (contract.id === "core-arc-centauri-relay") {
    return "Reefspan ferry families put their names behind the packet. That matters more than most path tokens.";
  }
  if (contract.id === "core-arc-sirius-hearing") {
    return "The hearing closed with your courier chain sitting in the middle of a rewritten regional story.";
  }
  if (contract.id === "arc-choice-syndicate" || contract.id === "arc-syndicate-path-job-1" || contract.id === "arc-syndicate-path-job-2") {
    return "Moonglass treated the run as a test, and you came back with your name still useful.";
  }
  if (contract.id === "arc-choice-authority" || contract.id === "arc-authority-path-job-1" || contract.id === "arc-authority-path-job-2") {
    return "The Wardens closed another file with your boat attached to the margin notes.";
  }
  if (contract.type === "cargo") {
    return "Quay crews rolled the bundles off clean, and the local ledger now reads you as reliable.";
  }
  if (contract.type === "courier") {
    return bonusText === "Packet transferred."
      ? "The packet changed hands without noise, which is exactly what the sender paid for."
      : "The handoff landed cleanly and your part of the story is now on the local record.";
  }
  if (contract.type === "market") {
    return "Barter closed in your favor and the local board quietly marked you as a traveler who can read a route.";
  }
  if (contract.type === "smuggling") {
    return "The handoff stayed quiet, which in gray work is the closest thing to applause.";
  }
  if (contract.type === "salvage") {
    return "Recovery crews paid out fast, and the wreck has already become somebody else's problem.";
  }
  if (contract.type === "bounty") {
    return "The reward cleared and the crossing got a little safer, or at least a little less crowded.";
  }
  return "The contract closed and the quay ledger marked the run complete.";
}

function nextStoryContractForDebrief(completions) {
  const wantsCore = completions.some((entry) => (entry.contract.tags || []).includes("Core Arc") || entry.contract.grantsPermit === "coreTransit");
  const wantsFaction = completions.some((entry) => (entry.contract.tags || []).includes("Faction Arc"));
  const wantsMystery = completions.some((entry) => (entry.contract.tags || []).includes("Mystery"));
  if (wantsCore) {
    return state.availableContracts.find((contract) => (contract.tags || []).includes("Core Arc")) || null;
  }
  if (wantsFaction) {
    return state.availableContracts.find((contract) => (contract.tags || []).includes("Faction Arc")) || null;
  }
  if (wantsMystery) {
    return state.availableContracts.find((contract) => (contract.tags || []).includes("Mystery")) || null;
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
    const tags = Array.isArray(entry.contract.tags) && entry.contract.tags.length ? ` [${displayTags(entry.contract.tags)}]` : "";
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
              state.threadReplyIndex = 0;
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
        label: "Open Trail Map",
        meta: "Review nearby paths before you wander too far.",
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
      title: "Lantern Call",
      copy: "A battered boat is flashing for help somewhere along the crossing.",
      tag: "Rescue",
    },
    {
      id: `${sector.id}-salvage-drift`,
      title: "Recovery Drift",
      copy: "Fresh wreck signs are drifting through local traffic. Somebody will turn that into a story or a payday.",
      tag: "Recovery",
    },
  ];

  if (sector.legality === "strict" || sector.legality === "lawful") {
    events.push({
      id: `${sector.id}-convoy`,
      title: "Ferry Chain Window",
      copy: "Merchant traffic is bunching up into a safer ferry chain. Clean jobs get easier for a few minutes.",
      tag: "Lawful",
    });
  }

  if (sector.legality === "strict") {
    events.push({
      id: `${sector.id}-scan-scare`,
      title: "Warden Sweep",
      copy: "Warden lanterns are bright. Any forbidden bundle is about to become a problem.",
      tag: "Wardens",
    });
  }

  if (sector.faction === "pirate" || sector.legality === "gray") {
    events.push({
      id: `${sector.id}-shadow-run`,
      title: "Raider Shadow",
      copy: "Raider scouts are pacing haulers at range and waiting for somebody to blink first.",
      tag: "Raiders",
    });
    events.push({
      id: `${sector.id}-handoff`,
      title: "Moonglass Handoff",
      copy: "Quiet buyers are moving through the crossing. Forbidden charms sell faster while they linger.",
      tag: "Moonglass",
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
  return state.activeSectorEvent ? `${state.activeSectorEvent.title} | ${state.activeSectorEvent.tag}` : "No active crossing event";
}

function sectorCondition(sectorId = state.currentSectorId) {
  const condition = state.sectorStates[sectorId];
  return condition && condition.turnsLeft > 0 ? condition : null;
}

function sectorConditionSummary(sectorId = state.currentSectorId) {
  const condition = sectorCondition(sectorId);
  return condition ? `${condition.title} (${condition.turnsLeft} crossings)` : "Stable crossing";
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
        title: "Recovery Drift",
        copy: storyAdventureMode()
          ? "Lost crates, old notes, and half-remembered directions are drifting through the crossing for patient travelers to recover."
          : "Fresh wreck signs are drifting through the crossing and every traveler with a hook is getting greedy.",
        tag: "Recovery",
        turnsLeft: SECTOR_STATE_TURNS,
      }),
    },
  ];

  if (lawfulSector(sector)) {
    options.push({
      weight: 2.8,
      create: () => ({
        id: "convoy_window",
        title: "Ferry Chain Window",
        copy: "Merchants are bunching up into a safer trade wave. Clean hauling and courier work pay better while it lasts.",
        tag: "Lawful",
        turnsLeft: SECTOR_STATE_TURNS,
      }),
    });
    options.push({
      weight: sector.legality === "strict" ? 2.9 : 1.8,
      create: () => ({
        id: "inspection_sweep",
        title: "Warden Sweep",
        copy: storyAdventureMode()
          ? "Harbor wardens are checking route passes twice and trying to keep nervous crossings orderly."
          : "Checkpoint patrols are hot and dockmasters are checking cargo seals twice. Dirty travelers are having a rough week.",
        tag: "Wardens",
        turnsLeft: SECTOR_STATE_TURNS,
      }),
    });
  }

  if (["cinder_wake", "iron_hollow", "shale_barrens"].includes(sectorId)) {
    options.push({
      weight: 3,
      create: () => ({
        id: "ore_glut",
        title: "Rootstone Glut",
        copy: storyAdventureMode()
          ? "Rootstone bundles are spilling over local storage. Stone is cheap, haulers are crowded, and everyone needs clear directions."
          : "Rootstone bundles are spilling over local storage. Stone is cheap, haulers are fat, and raiders are paying attention.",
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
        title: "Moonglass Market",
        copy: "Quiet buyers are moving through the quays. Warm introductions and forbidden goods suddenly matter a lot more.",
        tag: "Moonglass",
        turnsLeft: SECTOR_STATE_TURNS,
      }),
    });
  }

  if (sector.danger >= 0.45 || sector.faction === "pirate") {
    options.push({
      weight: 3,
      create: () => ({
        id: storyAdventureMode() ? "rough_crossing" : "pirate_raids",
        title: storyAdventureMode() ? "Rough Crossing" : "Raider Pressure",
        copy: storyAdventureMode()
          ? "The water is busy, the route markers are unreliable, and travelers are asking for calm guidance."
          : "Raiders are working the crossing hard enough to scare off soft traffic and push reward prices up.",
        tag: storyAdventureMode() ? "Crossing" : "Raiders",
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
  if (condition.id === "rough_crossing") {
    if (commodityId === "food" || commodityId === "meds") return 1.08;
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
      next.tags.push("Ferry Chain");
    }
    if (condition.id === "inspection_sweep" && contract.type === "smuggling") {
      next.reward += 52;
      next.tags.push("Watchful Wardens");
    }
    if (condition.id === "ore_glut" && contract.commodityId === "ore") {
      next.reward += 26;
      next.tags.push("Bulk Supplies");
    }
    if (condition.id === "shadow_market" && contract.type === "smuggling") {
      next.reward += 42;
      next.tags.push("Moonglass");
    }
    if (condition.id === "pirate_raids" && (contract.type === "bounty" || contract.type === "salvage")) {
      next.reward += 56;
      next.tags.push("Raid Pressure");
    }
    if (condition.id === "rough_crossing" && (contract.type === "courier" || contract.type === "salvage")) {
      next.reward += 48;
      next.tags.push("Rough Crossing");
    }
    if (condition.id === "salvage_drift" && contract.type === "salvage") {
      next.reward += 34;
      next.tags.push("Fresh Finds");
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
    title: `Carry ${cargoCommodity.name} to ${SECTORS[firstTarget].name}`,
    copy: `Bring ${cargoCommodity.name.toLowerCase()} along the next island crossing for a clean reward and better standing with ${factionName(SECTORS[firstTarget].faction)}.`,
    reward: missionRewardBase(firstTarget) + 80,
    commodityId: cargoCommodity.id,
    amount: 2,
    destinationId: firstTarget,
    factionId: sector.faction,
    tags: ["Supplies", "Steady"],
  });

  contracts.push({
    id: `${sectorId}-courier`,
    type: "courier",
    title: `Carry a sealed note to ${SECTORS[secondTarget].name}`,
    copy: `Reach ${SECTORS[secondTarget].name} with the note intact. It takes no pack space, only steady hands.`,
    reward: missionRewardBase(secondTarget) + 72,
    destinationId: secondTarget,
    factionId: sector.faction,
    tags: ["Message", "Quick"],
  });

  if (storyAdventureMode()) {
    contracts.push({
      id: `${sectorId}-crossing-care`,
      type: "courier",
      title: `Calm the crossing near ${SECTORS[lastTarget].name}`,
      copy: `Carry route notes, names, and reassurance to ${SECTORS[lastTarget].name}. The work is to make the next crossing feel less lonely.`,
      reward: missionRewardBase(lastTarget) + 130,
      destinationId: lastTarget,
      factionId: sector.faction === "pirate" ? "independent" : sector.faction,
      tags: ["Care", "Story"],
    });
  } else {
    contracts.push({
      id: `${sectorId}-bounty`,
      type: "bounty",
      title: `Drive off raiders near ${SECTORS[lastTarget].name}`,
      copy: `Stop one hostile raider in ${SECTORS[lastTarget].name} and return to a safe haven to collect the posted reward.`,
      reward: missionRewardBase(lastTarget) + 130,
      requiredKills: 1,
      destinationId: lastTarget,
      factionId: sector.faction === "pirate" ? "authority" : sector.faction,
      tags: ["Trouble", "Combat"],
    });
  }

  contracts.push({
    id: `${sectorId}-salvage`,
    type: "salvage",
    title: `Recover lost goods near ${SECTORS[lastTarget].name}`,
    copy: `Search one disabled traveler in ${SECTORS[lastTarget].name}. Recovery crews pay for whatever tale dragged it there.`,
    reward: missionRewardBase(lastTarget) + 118,
    requiredBoards: 1,
    destinationId: lastTarget,
    factionId: sector.faction === "pirate" ? "independent" : sector.faction,
    tags: ["Recovery", "Search"],
  });

  contracts.push({
    id: `${sectorId}-market`,
    type: "market",
    title: `Bring back ${localJobCommodity.name}`,
    copy: `Return with three bundles of ${localJobCommodity.name.toLowerCase()} from your next outing. The board pays for initiative, not perfection.`,
    reward: missionRewardBase(sectorId) + 110,
    commodityId: localJobCommodity.id,
    amount: 3,
    destinationId: sectorId,
    factionId: "independent",
    tags: ["Barter", "Flexible"],
  });

  contracts.push({
    id: `${sectorId}-smuggle`,
    type: "smuggling",
    title: `Moonglass handoff to ${SECTORS[smugglingTarget].name}`,
    copy: `Carry a sealed bundle of forbidden charms to ${SECTORS[smugglingTarget].name}. Watchful crossings will make this tense.`,
    reward: missionRewardBase(smugglingTarget) + 164,
    commodityId: "contraband",
    amount: 1,
    destinationId: smugglingTarget,
    factionId: sector.legality === "gray" || sector.faction === "pirate" ? sector.faction : "syndicate",
    contraband: true,
    tags: ["Hidden", "Risky"],
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
      title: `Warden dispatch to ${SECTORS[firstTarget].name}`,
      copy: "The Wardens are favoring travelers with clean names. Deliver the sealed message quickly and keep your story tidy.",
      reward: missionRewardBase(firstTarget) + 148,
      destinationId: firstTarget,
      factionId: "authority",
      tags: ["Wardens", "Priority"],
    });
  }

  if ((sector.legality === "gray" || sector.faction === "pirate") && hasSyndicateAccess()) {
    contracts.push({
      id: `${sectorId}-nightglass-ghost`,
      type: "smuggling",
      title: `Hidden handoff to ${SECTORS[smugglingTarget].name}`,
      copy: "A Moonglass broker trusts you enough to carry a more dangerous bundle than the public board would ever admit exists.",
      reward: missionRewardBase(smugglingTarget) + 214,
      commodityId: "contraband",
      amount: 1,
      destinationId: smugglingTarget,
      factionId: "syndicate",
      contraband: true,
      tags: ["Moonglass", "Trusted"],
    });
  }

  if (sectorId === "authority_gate" && !hasSectorPermit("coreTransit") && factionReputation("authority") >= 2) {
    contracts.push({
      id: "authority-core-clearance",
      type: "courier",
      title: "Deep Path Blessing",
      copy: "Moonpool Shore wants a clean ledger packet delivered to Whispering Banyan to finish your Deep Path blessing. Completing it opens legal passage toward Sunroot Atoll and Silverpool.",
      reward: missionRewardBase("union_harbor") + 124,
      destinationId: "union_harbor",
      factionId: "authority",
      grantsPermit: "coreTransit",
      tags: ["Wardens", "Path Token", "Blessing"],
    });
  }

  if ((sectorId === "ember_market" || sectorId === "mirage_verge") && !hasSectorPermit("nightglassTransit") && hasSyndicateAccess()) {
    contracts.push({
      id: "nightglass-transit-key",
      type: "courier",
      title: "Moon Path Token",
      copy: "A broker wants a sealed charm carried to Shell Market's trusted office. Complete it cleanly and the deeper Moonglass routes toward Quiet Keys open to you.",
      reward: missionRewardBase("ember_market") + 172,
      destinationId: "ember_market",
      factionId: "syndicate",
      grantsPermit: "nightglassTransit",
      tags: ["Moonglass", "Path Token", "Hidden"],
    });
  }

  if (sectorId === "sol") {
    contracts.push({
      id: `${sectorId}-sol-dispatch`,
      type: "courier",
      title: "Sunroot dispatch to Silverpool",
      copy: "The old tide clerks want a sealed official packet delivered with no drama and no missing stamps.",
      reward: missionRewardBase("sirius") + 148,
      destinationId: "sirius",
      factionId: "authority",
      tags: ["Sunroot", "Message", "Wardens"],
    });
  }

  if (sectorId === "barnards_star") {
    contracts.push({
      id: `${sectorId}-red-dwarf-salvage`,
      type: "salvage",
      title: "Driftwood recovery sweep",
      copy: "A dusk-path recovery crew needs one clean pull from the local drift and will pay quickly for discretion.",
      reward: missionRewardBase(sectorId) + 136,
      requiredBoards: 1,
      destinationId: sectorId,
      factionId: "independent",
      tags: ["Recovery", "Driftwood"],
    });
  }

  if (sectorId === "alpha_centauri") {
    contracts.push({
      id: `${sectorId}-centauri-relief`,
      type: "cargo",
      title: "Reefspan relief bundles",
      copy: "Move medical bundles into Reefspan's growing bridge neighborhoods before shortages turn ugly.",
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
      title: "Silverpool ceremony delivery",
      copy: "Silverpool buyers are paying hard for a clean ceremonial arrival from your next run.",
      reward: missionRewardBase(sectorId) + 164,
      commodityId: "lux",
      amount: 2,
      destinationId: sectorId,
      factionId: "authority",
      tags: ["Ceremony", "Sunroot"],
    });
  }

  if (sectorId === "tau_ceti") {
    contracts.push({
      id: `${sectorId}-tau-data-shadow`,
      type: "courier",
      title: "Quiet Keys hush-run",
      copy: "A Moonglass counting house wants a packet slipped back toward Driftwood Rest without inviting questions.",
      reward: missionRewardBase("barnards_star") + 182,
      destinationId: "barnards_star",
      factionId: "syndicate",
      tags: ["Moonglass", "Message", "Quiet Keys"],
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
      title: "Moonglass Offer",
      copy: "A Moonglass broker wants a sealed message packet moved quietly to Shell Market. Taking it means choosing a path.",
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
      title: "Warden Tipoff",
      copy: "Warden handlers want a quiet message packet delivered to the shore office. They claim it keeps the crossing clean.",
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
      copy: "Carry a sealed Moonglass package to Moonglass Cay without letting a checkpoint crew touch it.",
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
    return storyAdventureMode()
      ? {
        id: "arc-authority-path-job-1",
        type: "courier",
        title: "Guide The Verge",
        copy: "Carry a corrected crossing ledger to Mirage Verge so the watch can mark safe passage instead of hunting trouble.",
        reward: 236,
        destinationId: "mirage_verge",
        factionId: "authority",
        tags: ["Faction Arc", "Care", "Lawful"],
      }
      : {
        id: "arc-authority-path-job-1",
        type: "bounty",
        title: "Sweep The Verge",
        copy: "Disable one raider boat near Moonglass Cay and return through a lawful quay to clear the checkpoint ledger.",
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
      copy: "Deliver Moonglass intel back to Mangrove House and keep the crossing noisy enough to confuse the Wardens.",
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
      copy: "Bring the Moonglass Cay guidance report back to Whispering Banyan so the Wardens can protect the crossing without turning fear into policy.",
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
      title: "Old Tide Charter",
      copy: "A Sunroot ledger clerk quietly admits the old tide paths are fraying. Carry a sealed charter packet to Driftwood Rest and see whether the independent relays still answer to Sunroot's promises.",
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
      title: "Ferry Ledger Recovery",
      copy: "Driftwood Rest hands will release an old ferry ledger if you bring in the spare medicine they were promised. It is half trade job, half historical archaeology.",
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
      title: "Reefspan Family Relay",
      copy: "A Reefspan ferry family agrees to forward Driftwood's ledger if you move their relay packet on to Silverpool. Sunroot may own the tokens, but the nearby islands still run on personal trust.",
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
      title: "Lagoon Archive Hearing",
      copy: "Silverpool administrators want the relay record returned to Sunroot under seal. The old story is becoming a new policy fight, and you now sit in the middle of it.",
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
      title: "Sable's Quiet Errand",
      copy: "Sable wants a no-drama supply run into Whispering Banyan to prove you can carry more than your own luck.",
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
      title: "Sable's Quiet Whisper",
      copy: "Sable asks you to bring a quiet note back to Mangrove House. She says the first errand was only the test.",
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
      title: "Sable's Open Door",
      copy: "Sable has heard enough to know you are useful. Deliver her introduction onward to Mossjaw Isle and she will start opening better rooms for you.",
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
      title: "Pip's Fen Sweep",
      copy: "Pip wants one careful relic pull from Mossjaw Isle to prove you can work around old roots and bad mud without becoming part of the problem.",
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
      title: "Pip's Ledger Fragment",
      copy: "Pip heard about an old willow-ledger fragment surfacing in Lantern Fen. Recover it and he swears the paper trail matters.",
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
      title: "Pip's Red Ledger",
      copy: "Pip sends the recovered fragment on toward Briar Hearth, where somebody still remembers the crossings that vanished off the books.",
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
      title: "Nera's Relief Drop",
      copy: "Nera needs medicine moved into Lantern Fen before the marsh families lose people they could still save.",
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
      title: "Nera's Proof Packet",
      copy: "Nera wants proof of the delay sent to Alder Run, where the families can pressure the right people before fear hardens into blame.",
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
      title: "Nera's Banyan Voice",
      copy: "Take Nera's packet back to Whispering Banyan. The families listened, and now she wants the answer spoken plainly.",
      reward: missionRewardBase("union_harbor") + 184,
      destinationId: "union_harbor",
      factionId: "frontier",
      tags: ["Juno Thread", "Courier", "Character"],
    });
  }

  if (sectorId === "shale_barrens" && state.contactArcs.rill.stage === "intro" && !state.contactArcs.rill.completed.includes("rill-cove-supper")) {
    contracts.push({
      id: "rill-cove-supper",
      type: "cargo",
      title: "Rill's Cove Supper",
      copy: "Rill needs quiet food and remedies moved into Mossjaw Isle for families hiding off the marked channels. She says the real trick is arriving without making it look like a rescue.",
      reward: missionRewardBase("cinder_wake") + 132,
      commodityId: "food",
      amount: 2,
      destinationId: "cinder_wake",
      factionId: "pirate",
      threadId: "pirate-rill-scrimshaw",
      tags: ["Rill Thread", "Cargo", "Character", "Overlap"],
    });
  }
  if (sectorId === "cinder_wake" && state.contactArcs.rill.stage === "mossjaw_followup" && !state.contactArcs.rill.completed.includes("rill-reef-ledger")) {
    contracts.push({
      id: "rill-reef-ledger",
      type: "courier",
      title: "Rill's Reef Ledger",
      copy: "Rill found an old ferry tally hidden in a salt barrel and wants it carried to Moonpool Shore before wardens or brokers decide what it is supposed to mean. She claims Pip, Nera, and Elric will all hate it for different reasons.",
      reward: missionRewardBase("authority_gate") + 168,
      destinationId: "authority_gate",
      factionId: "pirate",
      threadId: "pirate-rill-scrimshaw",
      tags: ["Rill Thread", "Courier", "Lore", "Overlap"],
    });
  }
  if (sectorId === "authority_gate" && state.contactArcs.rill.stage === "shore_testimony" && !state.contactArcs.rill.completed.includes("rill-tide-testimony")) {
    contracts.push({
      id: "rill-tide-testimony",
      type: "courier",
      title: "Rill's Tide Testimony",
      copy: "Rill wants one last packet taken back through Crooked Sea Cave: names, closures, and witness marks proving that some of the so-called pirate routes became lifelines only after official ferries shut their doors. She says Bramble and Elric can argue with the meaning later if they still have the courage.",
      reward: missionRewardBase("shale_barrens") + 196,
      destinationId: "shale_barrens",
      factionId: "pirate",
      threadId: "pirate-rill-scrimshaw",
      tags: ["Rill Thread", "Courier", "Character", "Bridge"],
    });
  }

  if (sectorId === "grey_exchange" && state.intrigue.stage === "dormant" && !state.intrigue.completed.includes("mystery-relief-freight")) {
    contracts.push({
      id: "mystery-relief-freight",
      type: "cargo",
      title: "Mercy Run Under Seal",
      copy: "A rushed food-and-medicine pallet needs to reach Whispering Banyan under ordinary permission marks. Sable calls it mercy work. The payout suggests somebody wants it treated as more than kindness.",
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
      title: "Willow Ledger Addendum",
      copy: "Nera got handed a routine correction that was somehow logged before the complaint that should have created it. Carry the sealed addendum to Moonpool Shore and watch who acts like they were expecting you.",
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
      title: "Lost Ferry Echo",
      copy: "Elric has a fragmentary ferry record pointing at Briar Hearth and a craft called Saint Radiant that should either be archived, mourned, or remembered more clearly than this. Move the packet quietly and do not hand it to anyone before they use the name first.",
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
      title: "Hollow Door Coordinates",
      copy: "Pip found a hand-marked route note folded into the Saint Radiant trace. It references a place called the Hollow Door that nobody wants to admit exists. Carry the coordinates to Moonglass Grove and pay attention to who stops sounding surprised.",
      reward: missionRewardBase("mirage_verge") + 206,
      destinationId: "mirage_verge",
      factionId: "independent",
      threadId: "salvage-dax-brindle",
      tags: ["Mystery", "Hill-Door", "Courier"],
    });
  }
  if (sectorId === "mirage_verge" && state.intrigue.stage === "ninth-berth" && !state.intrigue.completed.includes("mystery-hollow-door-knock")) {
    contracts.push({
      id: "mystery-hollow-door-knock",
      type: "courier",
      title: "Knock at the Hollow Door",
      copy: "Mire Kest has answered the coordinates with a chalk mark and a warning: bring the Saint Radiant trace to the Hollow Door before too many careful people agree it was never real.",
      reward: missionRewardBase("hollow_door") + 224,
      destinationId: "hollow_door",
      factionId: "syndicate",
      threadId: "hollow-mire-kest",
      tags: ["Mystery", "Hollow Thread", "New Map"],
    });
  }
  if (sectorId === "hollow_door" && state.intrigue.stage === "hollow-door" && !state.intrigue.completed.includes("mystery-briar-bell")) {
    contracts.push({
      id: "mystery-briar-bell",
      type: "courier",
      title: "Briar Bell Clapper",
      copy: "Mire produces a cracked bell clapper tied to a ferry welcome-roll. Ollie Lark at Briar Hearth can test whether the name on it was removed, hidden, or sold.",
      reward: missionRewardBase("briar_hearth") + 206,
      destinationId: "briar_hearth",
      factionId: "independent",
      threadId: "briar-ollie-lark",
      tags: ["Mystery", "Briar Thread", "Bell Roll"],
    });
  }
  if (sectorId === "briar_hearth" && state.intrigue.stage === "briar-hearth" && !state.intrigue.completed.includes("mystery-reedfall-witnesses")) {
    contracts.push({
      id: "mystery-reedfall-witnesses",
      type: "courier",
      title: "Reedfall Witnesses",
      copy: "Ollie's bell names three crossings that were scrubbed from the welcome-roll. Tamsin Voss has witness stakes in Reedfall Basin that may still know who crossed.",
      reward: missionRewardBase("reedfall_basin") + 218,
      destinationId: "reedfall_basin",
      factionId: "frontier",
      threadId: "reedfall-tamsin-voss",
      tags: ["Mystery", "Reedfall Thread", "Witness"],
    });
  }
  if (sectorId === "reedfall_basin" && state.intrigue.stage === "reedfall-basin" && !state.intrigue.completed.includes("mystery-rootmirror-lanterns")) {
    contracts.push({
      id: "mystery-rootmirror-lanterns",
      type: "courier",
      title: "Rootmirror Lanterns",
      copy: "Tamsin can prove the ferry names were carried into the underways, but the paired lantern marks only make sense in Rootmirror Bog. Go quietly and let the hidden families decide what they are ready to say.",
      reward: missionRewardBase("rootmirror_bog") + 236,
      destinationId: "rootmirror_bog",
      factionId: "pirate",
      threadId: "reedfall-tamsin-voss",
      tags: ["Mystery", "Reedfall Thread", "Underways"],
    });
  }
  if (sectorId === "rootmirror_bog" && state.intrigue.stage === "rootmirror-bog" && !state.intrigue.completed.includes("mystery-low-water-council")) {
    contracts.push({
      id: "mystery-low-water-council",
      type: "courier",
      title: "Low-Water Council",
      copy: "Rootmirror's lantern families are willing to let the names surface if Mangrove House hosts the first safe telling. Carry their testimony home and keep every faction from owning it first.",
      reward: missionRewardBase("grey_exchange") + 248,
      destinationId: "grey_exchange",
      factionId: "independent",
      threadId: "hollow-mire-kest",
      tags: ["Mystery", "Hollow Thread", "Council"],
    });
  }

  return contracts;
}

function resetContractsForSector() {
  repairStalledArcChoice();
  const activeIds = new Set(state.activeContracts.map((contract) => contract.id));
  state.availableContracts = generateContracts(state.currentSectorId)
    .filter((contract) => !activeIds.has(contract.id));
  normalizeStoryAdventureContracts();
}

function storyAdventureContractFromBounty(contract) {
  if (!storyAdventureMode() || contract?.type !== "bounty") return contract;
  const { requiredKills: _requiredKills, ...rest } = contract;
  const destinationName = SECTORS[contract.destinationId]?.name || "the next crossing";
  const inheritedTags = (contract.tags || []).filter((tag) => !["Bounty", "Combat", "Trouble"].includes(tag));
  return {
    ...rest,
    type: "courier",
    title: contract.id === "arc-authority-path-job-1"
      ? "Guide The Verge"
      : `Calm the crossing near ${destinationName}`,
    copy: `Carry route notes, names, and reassurance to ${destinationName}. The work is to make the next crossing feel less lonely.`,
    tags: [...new Set([...inheritedTags, "Care", "Story"])],
  };
}

function normalizeStoryAdventureContracts() {
  if (!storyAdventureMode()) return;
  state.activeContracts = state.activeContracts.map(storyAdventureContractFromBounty);
  state.availableContracts = state.availableContracts.map(storyAdventureContractFromBounty);
  state.player.bountyProgress = {};
}

function addCargo(commodityId, amount, player = state.player) {
  if (playerCargoUsed(player) + amount > playerMaxCargo(player)) {
    return false;
  }
  player.cargo[commodityId] = playerCargoAmount(player, commodityId) + amount;
  return true;
}

function removeCargo(commodityId, amount, player = state.player) {
  const current = playerCargoAmount(player, commodityId);
  if (current < amount) {
    return false;
  }
  const next = current - amount;
  if (next > 0) {
    player.cargo[commodityId] = next;
  } else {
    delete player.cargo[commodityId];
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

function createEmoteRingSparks(x, y, color, count = 12, radius = 22) {
  for (let index = 0; index < count; index += 1) {
    const angle = (Math.PI * 2 * index) / count;
    const drift = 18 + Math.random() * 36;
    state.sparks.push({
      x: x + Math.cos(angle) * radius,
      y: y + Math.sin(angle) * radius,
      vx: Math.cos(angle + Math.PI / 2) * drift,
      vy: Math.sin(angle + Math.PI / 2) * drift,
      life: 0.52 + Math.random() * 0.26,
      maxLife: 0.68 + Math.random() * 0.22,
      color,
    });
  }
}

function triggerFlightEmote(player = state.player, ownerIndex = 0) {
  if (playerIsInEscapePod() || state.mode !== "flight" || FLIGHT_EMOTES.length === 0) return;
  const currentIndex = ((Math.trunc(player.emoteIndex || 0) % FLIGHT_EMOTES.length) + FLIGHT_EMOTES.length) % FLIGHT_EMOTES.length;
  const emote = FLIGHT_EMOTES[currentIndex];
  const color = emote.color || PARTY_SLOT_STYLES[ownerIndex]?.accent || player.accent || "#aef4d5";
  const duration = emote.duration || DEFAULT_EMOTE_DURATION;
  player.emoteIndex = (currentIndex + 1) % FLIGHT_EMOTES.length;
  player.activeEmote = emote.id;
  player.emoteTimer = duration;
  player.emoteDuration = duration;
  player.emoteSeed = Math.random() * Math.PI * 2;

  if (emote.id === "lantern-bloom") {
    createBurst(player.x, player.y, color, { radius: 12, grow: 44, life: 0.58, fillAlpha: 0.14, lineWidth: 2.4 });
    createSpark(player.x, player.y, color, 10);
  } else if (emote.id === "willow-spin") {
    createBurst(player.x, player.y, color, { radius: 18, grow: 22, life: 0.42, fillAlpha: 0.09, lineWidth: 2 });
    createSpark(player.x, player.y, color, 6);
    addScreenShake(0.5);
  } else if (emote.id === "moon-glow") {
    createBurst(player.x, player.y, color, { radius: 22, grow: 20, life: 0.7, fillAlpha: 0.1, lineWidth: 2.2 });
    player.shieldFlash = Math.max(player.shieldFlash || 0, 0.48);
  } else {
    createBurst(player.x, player.y, color, { radius: 16, grow: 34, life: 0.66, fillAlpha: 0.08, lineWidth: 1.8 });
    createEmoteRingSparks(player.x, player.y, color, 14, 24);
  }

  setStatus(`${player.name} ${emote.status}.`, { tag: "Emote", log: false });
}

function updatePlayerEmotes(dt) {
  for (const member of partyMembers()) {
    if ((member.emoteTimer || 0) <= 0) continue;
    member.emoteTimer = Math.max(0, member.emoteTimer - dt);
    if (member.emoteTimer === 0) {
      member.activeEmote = null;
      member.emoteDuration = 0;
    }
  }
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
  if (condition.id === "rough_crossing") {
    return { traders: 0, patrols: 0, pirates: 0, hostilePirates: 0, smugglers: 0 };
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
  const storyMode = storyAdventureMode();
  const lawfulHeat = !storyMode && lawfulSector(sector) && currentSectorRep() <= -8 ? 1 : 0;
  const pirateHeat = !storyMode && sector.faction !== "pirate" && sector.legality !== "gray";

  const pirateCount = storyMode
    ? Math.min(1, Math.max(0, layout.pirates + adjustment.pirates))
    : Math.max(0, layout.pirates + adjustment.pirates);
  const hostilePirateCount = storyMode ? 0 : Math.max(0, layout.hostilePirates + adjustment.hostilePirates);

  for (let index = 0; index < pirateCount; index += 1) {
    spawnEnemy("pirate", 120 + Math.random() * 720, 80 + Math.random() * 420, { disposition: pirateHeat && Math.random() < sector.danger * 0.34 ? "suspicious" : "neutral" });
  }
  for (let index = 0; index < hostilePirateCount; index += 1) {
    spawnEnemy("pirate", 120 + Math.random() * 720, 80 + Math.random() * 420, { disposition: "hostile" });
  }
  for (let index = 0; index < Math.max(0, layout.patrols + adjustment.patrols); index += 1) {
    spawnEnemy("patrol", 180 + Math.random() * 620, 120 + Math.random() * 320, { disposition: lawfulHeat ? "suspicious" : "neutral" });
  }
  for (let index = 0; index < Math.max(0, layout.traders + adjustment.traders); index += 1) {
    spawnEnemy("trader", 150 + Math.random() * 680, 100 + Math.random() * 380, { disposition: "neutral" });
  }
  for (let index = 0; index < Math.max(0, (layout.smugglers || 0) + adjustment.smugglers); index += 1) {
    spawnEnemy("smuggler", 150 + Math.random() * 680, 100 + Math.random() * 380, { disposition: !storyMode && sector.legality === "strict" ? "suspicious" : "neutral", cargo: { contraband: 2, lux: 1 } });
  }

  if (state.activeSectorEvent?.tag === "Lawful") {
    spawnEnemy("trader", 160 + Math.random() * 640, 110 + Math.random() * 340, { disposition: "neutral", cargo: { food: 2, meds: 1 } });
  }
  if (state.activeSectorEvent?.tag === "Pirate") {
    spawnEnemy("pirate", 160 + Math.random() * 640, 110 + Math.random() * 340, { disposition: storyMode ? "neutral" : "suspicious" });
  }
  if (state.activeSectorEvent?.tag === "Gray") {
    spawnEnemy("smuggler", 160 + Math.random() * 640, 110 + Math.random() * 340, { disposition: "neutral", cargo: { contraband: 1, lux: 2 } });
  }
}

function enterDockMode(message, options = {}) {
  const access = dockAccessState();
  if (access === "denied" && !options.force) {
    state.mode = "flight";
    setStatus(message || `Rest denied at ${currentSector().name}. The Wardens want you gone.`);
    setHint("Keep clear of the haven or improve your standing before asking again.");
    setOverlay(currentSector().name, currentSector().intel || currentSector().description);
    return;
  }
  state.mode = "dock";
  state.dockScreen = "root";
  state.selectedMenuIndex = state.previousDockIndex || 0;
  syncPartyState();
  normalizeEscortHangar();
  state.popup = null;
  state.escapeSequence = null;
  for (const member of partyMembers()) {
    member.vx = 0;
    member.vy = 0;
  }
  updateDiscoveredSectors();
  const repairSummary = autoRepairOnDock(state.player);
  const refuelSummary = autoRefuelOnDock(state.player);
  partyMembers().forEach((member, index) => {
    if (index === 0) return;
    autoRepairOnDock(member);
    autoRefuelOnDock(member);
  });
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
      setStatus((message || `Restricted rest at ${currentSector().name}. Services only until relations improve.`) + repairText + refuelText);
    }
    setHint("You can save, mend, restock, and leave. Watchful places close their good doors to hostile travelers.");
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
      setStatus((message || `Resting at ${currentSector().name}.`) + repairText + refuelText);
    }
    setHint(`${dockMoodTag()}. Use the island kit to barter, mend, browse quests, or head back onto the water.`);
  }
  setOverlay(`Resting at ${currentSector().name}`, dockContextLine());
  showBanner(currentSector().name, `${dockMoodTag()} quay live.`, 2.6);
  if (completions.length) {
    setStatus(`Resting at ${currentSector().name}. ${completions.length} conversation update${completions.length === 1 ? "" : "s"} waiting in Messages.`);
    openMissionDebrief(completions);
    setOverlay(`Resting at ${currentSector().name}`, dockContextLine());
  }
}

function enterFlightMode(message, options = {}) {
  disableAutopilot({ updateHint: false, log: false });
  syncPartyState();
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
  syncPartyFormationToLead(true);
  keyboard.fire = false;
  keyboard.pause = false;
  normalizeEscortHangar();
  chooseSectorEvent();
  refillSectorTraffic();
  syncEscortFlightStates(options.resetEscorts ?? false);
  const arrivalPacket = sectorArrivalPacket();
  setStatus(message || `${currentSector().name} waters active.`);
  setHint(options.arrival ? arrivalPacket.hint : standardFlightHint());
  setOverlay(currentSector().name, options.arrival ? arrivalPacket.overlay : "The archipelago is live. Pick your fights, rest cleanly, or sail on before the islands notice what you took.");
  showBanner(options.arrival ? arrivalPacket.bannerTitle : currentSector().name, options.arrival ? arrivalPacket.bannerCopy : "Back on the water. The archipelago is moving again.", options.arrival ? 2.9 : 2.4);
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
      ? "Moonglass moon paths are now open."
      : "Deep Path crossings are now open.";
    pushMessageLog(`${permitName} granted. ${permitCopy}`, "Permit");
    showBanner("Transit Cleared", `${permitName} approved. ${permitCopy}`, 3);
    if (contract.grantsPermit === "coreTransit" && state.coreArc.stage === "locked") {
      state.coreArc.stage = "sol-briefing";
      pushMessageLog("Sunroot ledger traffic now has reason to notice your boat. A quiet briefing is waiting along the old tide law.", "Lore");
    }
  }
  appendMissionThreadMessage(thread.id, {
    from: "them",
    text: `${payoutMessage} Reward transferred: ${formatCredits(contract.reward)}.`,
    contractId: contract.id,
    voiceKey: generatedThreadVoiceKey(thread.id, "completion-payout"),
  }, { unread: true });
  appendMissionThreadMessage(thread.id, {
    from: "them",
    text: followUp,
    contractId: contract.id,
    voiceKey: generatedThreadVoiceKey(thread.id, "completion-followup"),
  }, { unread: true });
  advanceFactionArc(contract);
  advanceCoreArc(contract);
  advanceRecurringContactArc(contract);
  advanceIntrigueArc(contract);
  pushMessageLog(`${thread.contact.name} followed up on ${contract.title}. ${impact}`, "Messages");
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
    showBanner("Moonglass In", "The Circle now treats you like a useful traveler.", 3);
    return;
  }
  if (contract.id === "arc-choice-authority") {
    state.factionArc.path = "authority";
    state.factionArc.stage = "path-job-1";
    state.factionArc.completed.push(contract.id);
    modifyReputation("authority", 3);
    showBanner("Checkpoint Cleared", "The Wardens now consider you worth briefings.", 3);
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
    showBanner("Gray Wake", "Moonglass routes open wider for you now.", 3.2);
    return;
  }
  if (contract.id === "arc-authority-path-job-2") {
    state.factionArc.stage = "resolved";
    state.factionArc.completed.push(contract.id);
    modifyReputation("authority", 4);
    modifyReputation("syndicate", -2);
    showBanner("Clean Crossings", "Warden checkpoints now treat you more warmly.", 3.2);
  }
}

function advanceCoreArc(contract) {
  if (contract.id === "core-arc-sol-briefing") {
    state.coreArc.stage = "barnard-ledger";
    state.coreArc.completed.push(contract.id);
    modifyReputation("authority", 1);
    modifyReputation("independent", 1);
    showBanner("Old Paper, Live Route", "Sunroot's old charter network still reaches farther than the clerks expected.", 3.1);
    pushMessageLog("Driftwood Rest answered Sunroot's sealed charter. Someone in the old law is paying attention now.", "Lore");
    return;
  }
  if (contract.id === "core-arc-barnard-ledger") {
    state.coreArc.stage = "centauri-relay";
    state.coreArc.completed.push(contract.id);
    modifyReputation("independent", 2);
    showBanner("Driftwood Ledger Found", "The independents kept better records than Sunroot gave them credit for.", 3.1);
    pushMessageLog("Driftwood relay crews turned over a ledger showing how the nearby islands kept trade moving after the old crossing closures.", "Lore");
    return;
  }
  if (contract.id === "core-arc-centauri-relay") {
    state.coreArc.stage = "sirius-hearing";
    state.coreArc.completed.push(contract.id);
    modifyReputation("frontier", 2);
    showBanner("Reefspan Trust", "The ferry families vouched for you with their name and packet code.", 3.1);
    pushMessageLog("Reefspan's old ferry houses backed the Driftwood record and forwarded it into Silverpool jurisdiction.", "Lore");
    return;
  }
  if (contract.id === "core-arc-sirius-hearing") {
    state.coreArc.stage = "resolved";
    state.coreArc.completed.push(contract.id);
    modifyReputation("authority", 2);
    modifyReputation("frontier", 1);
    modifyReputation("independent", 1);
    showBanner("Old Hearing Closed", "Sunroot can no longer pretend the nearby islands are just satellite paperwork.", 3.4);
    pushMessageLog("The Sunroot-Silverpool hearing closed with the nearby relays formally recognized as essential civil crossings. Your name is on the courier chain.", "Lore");
  }
}

function advanceRecurringContactArc(contract) {
  if (contract.id === "mara-quiet-haul") {
    state.contactArcs.mara.stage = "union_followup";
    state.contactArcs.mara.completed.push(contract.id);
    appendMissionThreadMessage("independent-mara-kade", {
      from: "them",
      text: "You kept the bundles clean. Good. Now I know you can carry a quieter truth back home without dropping it.",
      contractId: contract.id,
    }, { unread: true });
    return;
  }
  if (contract.id === "mara-dockside-whisper") {
    state.contactArcs.mara.stage = "grey_exchange_return";
    state.contactArcs.mara.completed.push(contract.id);
    appendMissionThreadMessage("independent-mara-kade", {
      from: "them",
      text: "That packet was not about money. It was about who still answers when Mangrove House asks. One more run and I start introducing you properly.",
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
      text: "Clean recovery. There is another wreck in Lantern Quay carrying a fragment of something older than the boat itself. Interested?",
      contractId: contract.id,
    }, { unread: true });
    return;
  }
  if (contract.id === "dax-ledger-fragment") {
    state.contactArcs.dax.stage = "barnard_followup";
    state.contactArcs.dax.completed.push(contract.id);
    appendMissionThreadMessage("salvage-dax-brindle", {
      from: "them",
      text: "The fragment names ferries that should not have vanished. Driftwood Rest still has people who remember that handwriting.",
      contractId: contract.id,
    }, { unread: true });
    return;
  }
  if (contract.id === "dax-red-ledger") {
    state.contactArcs.dax.stage = "resolved";
    state.contactArcs.dax.completed.push(contract.id);
    appendMissionThreadMessage("salvage-dax-brindle", {
      from: "them",
      text: "You did not just pull wreckage. You pulled memory. Most travelers never notice the difference.",
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
      text: "Reefspan listened. Ferry families always do when the paperwork starts naming names. One last packet and this becomes policy instead of a complaint.",
      contractId: contract.id,
    }, { unread: true });
    return;
  }
  if (contract.id === "juno-union-voice") {
    state.contactArcs.juno.stage = "resolved";
    state.contactArcs.juno.completed.push(contract.id);
    appendMissionThreadMessage("union-juno-vale", {
      from: "them",
      text: "That is how a crossing changes: one traveler, one delivery, one piece of proof at a time. You did right by people who will never know your name.",
      contractId: contract.id,
    }, { unread: true });
    return;
  }

  if (contract.id === "rill-cove-supper") {
    state.contactArcs.rill.stage = "mossjaw_followup";
    state.contactArcs.rill.completed.push(contract.id);
    modifyReputation("pirate", 2);
    modifyReputation("independent", 1);
    appendMissionThreadMessage("pirate-rill-scrimshaw", {
      from: "them",
      text: "Good. Nobody starved loudly enough to get noticed. Now I need you for something worse than hunger: proof. I found a ferry tally the wardens will hate and the coves are tired of losing arguments they were never allowed to enter.",
      contractId: contract.id,
    }, { unread: true });
    return;
  }
  if (contract.id === "rill-reef-ledger") {
    state.contactArcs.rill.stage = "shore_testimony";
    state.contactArcs.rill.completed.push(contract.id);
    modifyReputation("pirate", 2);
    modifyReputation("authority", -1);
    appendMissionThreadMessage("pirate-rill-scrimshaw", {
      from: "them",
      text: "You got the tally into open hands and came back anyway. That buys a kind of trust. One last run now: names, closures, witness marks. If the underways are going to stay alive, somebody has to carry their testimony where it can still bite.",
      contractId: contract.id,
    }, { unread: true });
    return;
  }
  if (contract.id === "rill-tide-testimony") {
    state.contactArcs.rill.stage = "resolved";
    state.contactArcs.rill.completed.push(contract.id);
    modifyReputation("pirate", 3);
    modifyReputation("independent", 1);
    appendMissionThreadMessage("pirate-rill-scrimshaw", {
      from: "them",
      text: "That is enough to make the right people uncomfortable, which means it might also be enough to keep a few coves alive. You did not fix the islands. You did something rarer. You made it harder for them to lie cleanly about who they pushed into the dark.",
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
    pushMessageLog("A mercy pallet reached Whispering Banyan with the kind of pre-cleared signatures that make quay workers stop joking mid-sentence.", "Lore");
    showBanner("Ledger Ripple", "Too many people already knew where the mercy bundle would land.", 3);
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
    pushMessageLog("Saint Radiant keeps existing in the exact places a vanished ferry should not: ledger debris, recovery notes, and people who answer too quickly.", "Lore");
    showBanner("Ghost Escort", "Saint Radiant is no longer sounding like an accident.", 3.1);
    return;
  }
  if (contract.id === "mystery-ninth-berth") {
    state.intrigue.stage = "ninth-berth";
    state.intrigue.completed.push(contract.id);
    markIntrigueFlag("ninth-berth");
    appendIntrigueCrossTalk(contract);
    pushMessageLog("Ninth Lintel is either a place shared by enemies, or a lie they all need badly enough to keep naming.", "Lore");
    showBanner("Quiet Coordinates", "Ninth Lintel now has enough witnesses to stop feeling imaginary.", 3.2);
    return;
  }
  if (contract.id === "mystery-hollow-door-knock") {
    state.intrigue.stage = "hollow-door";
    state.intrigue.completed.push(contract.id);
    markIntrigueFlag("hollow-door");
    appendIntrigueCrossTalk(contract);
    modifyReputation("syndicate", 1);
    modifyReputation("pirate", 1);
    pushMessageLog("The Hollow Door took the Saint Radiant trace like a key. The underways are not a rumor anymore; they are a witness network.", "Lore");
    showBanner("Door Ajar", "The old underways have started answering by name.", 3.2);
    return;
  }
  if (contract.id === "mystery-briar-bell") {
    state.intrigue.stage = "briar-hearth";
    state.intrigue.completed.push(contract.id);
    markIntrigueFlag("briar-bell");
    appendIntrigueCrossTalk(contract);
    modifyReputation("independent", 1);
    pushMessageLog("Briar Hearth's cracked bell rang for a welcome-roll name that the ledgers tried to forget.", "Lore");
    showBanner("Bell Name", "The missing crossing has a sound now.", 3.1);
    return;
  }
  if (contract.id === "mystery-reedfall-witnesses") {
    state.intrigue.stage = "reedfall-basin";
    state.intrigue.completed.push(contract.id);
    markIntrigueFlag("reedfall-witness");
    appendIntrigueCrossTalk(contract);
    modifyReputation("frontier", 1);
    pushMessageLog("Reedfall Basin matched the bell name to witness stakes set before the ferry record was scrubbed.", "Lore");
    showBanner("Witness Stakes", "The basin remembered what the ledgers refused.", 3.1);
    return;
  }
  if (contract.id === "mystery-rootmirror-lanterns") {
    state.intrigue.stage = "rootmirror-bog";
    state.intrigue.completed.push(contract.id);
    markIntrigueFlag("rootmirror-lanterns");
    appendIntrigueCrossTalk(contract);
    modifyReputation("pirate", 2);
    pushMessageLog("Rootmirror's paired lanterns tied the missing ferry names to living families, not just old policy harm.", "Lore");
    showBanner("Paired Lanterns", "The hidden families chose to be counted.", 3.2);
    return;
  }
  if (contract.id === "mystery-low-water-council") {
    state.intrigue.stage = "low-water-council";
    state.intrigue.completed.push(contract.id);
    markIntrigueFlag("low-water-council");
    appendIntrigueCrossTalk(contract);
    modifyReputation("independent", 2);
    modifyReputation("frontier", 1);
    modifyReputation("pirate", 1);
    pushMessageLog("Mangrove House now holds testimony from bells, reeds, and hidden lantern families. The next fight is about who gets to define safety.", "Lore");
    showBanner("Council Called", "The archipelago finally has witnesses in the same room.", 3.4);
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
      completions.push(completeContract(contract, "Recovery crew paid out."));
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
    return "Warden blessing required";
  }
  if (hullId === "smuggler" || hullId === "raider") {
    return "Moonglass or goblin contact required";
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
  const buyer = activeDockPlayer();
  if (commodityId === "contraband" && currentSector().legality === "gray" && !hasSyndicateAccess() && sectorCondition(state.currentSectorId)?.id !== "shadow_market") {
    setStatus("The hidden market does not know you well enough yet.");
    return;
  }
  if (dockAccessState() === "restricted") {
    setStatus("Local barter access is restricted.");
    return;
  }
  if (commodityId === "contraband" && currentSector().legality === "strict") {
    setStatus("No one here will openly sell forbidden charms.");
    return;
  }
  const price = marketPrice(state.currentSectorId, commodityId);
  if (buyer.credits < price) {
    setStatus("Not enough coins for that bundle.");
    return;
  }
  if (!addCargo(commodityId, 1, buyer)) {
    setStatus("Your pack is full.");
    return;
  }
  buyer.credits -= price;
  setStatus(`${buyer.name} bought ${commodityById(commodityId).name} for ${formatCredits(price)}.`);
}

function trySellCommodity(commodityId) {
  const seller = activeDockPlayer();
  if (commodityId === "contraband" && currentSector().legality === "gray" && !hasSyndicateAccess() && sectorCondition(state.currentSectorId)?.id !== "shadow_market") {
    setStatus("No buyer will touch your forbidden charms without a better introduction.");
    return;
  }
  if (dockAccessState() === "restricted" && commodityId !== "contraband") {
    setStatus("Barter access is restricted to urgent needs only.");
    return;
  }
  const price = marketPrice(state.currentSectorId, commodityId);
  if (!removeCargo(commodityId, 1, seller)) {
    setStatus("You are not carrying that item.");
    return;
  }
  seller.credits += price;
  setStatus(`${seller.name} sold ${commodityById(commodityId).name} for ${formatCredits(price)}.`);
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
    return { type: "board-full", reason: "Your quest board is full. Finish something first." };
  }
  if ((contract.type === "cargo" || contract.type === "smuggling") && contract.commodityId && cargoUsed() + contract.amount > maxCargo()) {
    return { type: "cargo-full", reason: "Not enough pack space for that delivery." };
  }
  if (contract.type === "smuggling" && !hasSyndicateAccess() && currentSector().faction !== "pirate" && currentSector().legality !== "gray") {
    return { type: "trust", reason: "Nobody here trusts you with hidden charms yet." };
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
      copy: `${contract.title} is already on your quest board. I can put ${destinationName} back on the map if you want to move instead of re-reading the pitch.`,
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
      copy: `${contract.title} cannot fit right now because you already have ${state.activeContracts.length} active quests. Finish one first, or let the map point at the next useful stop.`,
      options: [
        {
          label: nextContract ? "Plot Active Job" : "Open Chart",
          meta: nextContract ? `${nextContract.title} | ${SECTORS[nextContract.destinationId]?.name || "Unknown"}` : "Review nearby paths",
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

function abandonContract(contractId) {
  const contract = state.activeContracts.find((entry) => entry.id === contractId);
  if (!contract) {
    setStatus("That mission is no longer active.", { tag: "Mission" });
    return false;
  }

  const thread = ensureMissionThread(contract);
  state.activeContracts = state.activeContracts.filter((entry) => entry.id !== contract.id);

  if ((contract.type === "cargo" || contract.type === "smuggling") && contract.commodityId) {
    const carried = cargoAmount(contract.commodityId);
    if (carried > 0) {
      removeCargo(contract.commodityId, Math.min(contract.amount || 0, carried));
    }
  }
  if (contract.type === "bounty") {
    delete state.player.bountyProgress[contract.id];
  }
  if (contract.type === "salvage") {
    delete state.player.missionProgress[contract.id];
  }
  if (contract.arcChoice && state.factionArc.stage === "intro" && !state.factionArc.completed.includes(contract.id)) {
    state.factionArc.path = null;
  }

  appendMissionThreadMessage(thread.id, {
    from: "you",
    text: `I need to let ${contract.title} go for now.`,
    contractId: contract.id,
  });
  appendMissionThreadMessage(thread.id, {
    from: "them",
    text: "Understood. Better to admit a bad route than keep burning circles through it. The lead can return when the board has room and the path makes sense again.",
    contractId: contract.id,
    voiceKey: generatedThreadVoiceKey(thread.id, "drop"),
  }, { unread: true });

  resetContractsForSector();
  syncMissionThreads();
  state.threadReplyIndex = 0;
  pushMessageLog(`Dropped mission: ${contract.title}.`, "Mission");
  setStatus(`${contract.title} dropped. Cargo and mission progress for that job were cleared.`, { tag: "Mission" });
  return true;
}

function confirmAbandonContract(contractId) {
  const contract = state.activeContracts.find((entry) => entry.id === contractId);
  if (!contract) {
    setStatus("That mission is no longer active.", { tag: "Mission" });
    return;
  }
  const cargoWarning = (contract.type === "cargo" || contract.type === "smuggling")
    ? "Any mission cargo for it leaves your pack."
    : contract.type === "salvage" || contract.type === "bounty"
      ? "Any progress for it resets."
      : "You can pick it back up later if the contact offers it again.";
  openPopup({
    title: "Drop Mission",
    copy: `Drop ${contract.title}? ${cargoWarning} This is meant for getting unstuck, so there is no reputation hit.`,
    options: [
      {
        label: "Drop Mission",
        meta: "Clear it from the active board",
        confirm() {
          closePopup();
          abandonContract(contract.id);
        },
      },
      {
        label: "Keep Mission",
        meta: "Return to the thread",
        confirm() {
          closePopup();
        },
      },
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
      setStatus("Not enough pack space for that delivery.");
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
    voiceKey: generatedThreadVoiceKey(thread.id, "accept"),
  });
  setActiveMissionThread(thread.id);
  if (contract.type === "salvage" && contract.destinationId === state.currentSectorId) {
    setStatus(`Accepted: ${contract.title}. Push off and the salvage contact should be waiting out on the water.`, { tag: "Contract" });
  } else {
    setStatus(`Accepted: ${contract.title}.`, { tag: "Contract" });
  }
}

function upgradeHullPlating() {
  const player = activeDockPlayer();
  const cost = 220 + player.hullBonus * 4;
  if (player.credits < cost) {
    setStatus("Not enough coins for fresh bark plating.");
    return;
  }
  if (player.hullBonus >= 60) {
    setStatus("Your travel form is already carrying all the extra plating it should.");
    return;
  }
  player.credits -= cost;
  player.hullBonus += 20;
  player.hull = playerMaxHull(player);
  player.shield = playerMaxShield(player);
  player.shieldFlash = 0;
  setStatus(`${player.name}'s travel form reinforced. Max heart is now ${playerMaxHull(player)}.`);
}

function upgradeCargoRacks() {
  const player = activeDockPlayer();
  const cost = 180 + player.cargoCapBonus * 35;
  if (player.credits < cost) {
    setStatus("Not enough coins for stronger packs.");
    return;
  }
  if (player.cargoCapBonus >= 6) {
    setStatus("Your carrying kit is already as expanded as this place can make it.");
    return;
  }
  player.credits -= cost;
  player.cargoCapBonus += 2;
  setStatus(`${player.name}'s carrying kit improved. Capacity is now ${playerMaxCargo(player)}.`);
}

function upgradePulseArray() {
  const player = activeDockPlayer();
  const cost = 260 + player.weaponLevel * 100;
  if (player.credits < cost) {
    setStatus("Not enough coins for a combat charm tune-up.");
    return;
  }
  if (player.weaponLevel >= 2) {
    setStatus("Your combat charms are already tuned as far as this quay can safely push.");
    return;
  }
  player.credits -= cost;
  player.weaponLevel += 1;
  setStatus(`${player.name}'s combat charms tuned. Speed and impact improved.`);
}

function purchaseHull(hullId) {
  const hull = HULLS[hullId];
  if (!hull) return;
  const buyer = activeDockPlayer();
  if (!(currentSector().shipyard || []).includes(hullId)) {
    setStatus("This place cannot outfit that travel form.");
    return;
  }
  if (!hasHullLicense(hullId)) {
    setStatus(hullLicenseLabel(hullId) || "You do not have the required access for that ship.");
    return;
  }
  if (buyer.credits < hull.sale) {
    setStatus("Not enough coins to take on that travel form.");
    return;
  }
  buyer.credits -= hull.sale;
  buyer.hullId = hullId;
  buyer.hull = playerMaxHull(buyer);
  buyer.shield = playerMaxShield(buyer);
  buyer.fuel = Math.min(buyer.fuel, hull.fuelCap);
  buyer.loanerHull = false;
  setStatus(`${buyer.name} took on the ${hull.name} for ${formatCredits(hull.sale)}.`);
}

function repairShip() {
  const player = activeDockPlayer();
  const missing = playerMaxHull(player) - player.hull;
  if (missing <= 0) {
    setStatus("Your travel form is already fully mended.");
    return;
  }
  const cost = Math.ceil(missing * 1.9);
  if (player.credits < cost) {
    setStatus("Not enough coins for full repairs.");
    return;
  }
  player.credits -= cost;
  player.hull = playerMaxHull(player);
  player.shield = playerMaxShield(player);
  player.shieldFlash = 0;
  setStatus(`${player.name}'s travel form restored for ${formatCredits(cost)}.`);
}

function autoRepairOnDock(player = state.player) {
  const missing = Math.max(0, playerMaxHull(player) - player.hull);
  if (missing <= 0) {
    player.shield = playerMaxShield(player);
    player.shieldFlash = 0;
    return { repaired: 0, cost: 0, full: true };
  }

  const affordableHull = Math.floor(player.credits / 1.9);
  const repaired = clamp(affordableHull, 0, missing);
  const cost = repaired > 0 ? Math.ceil(repaired * 1.9) : 0;

  if (cost > 0) {
    player.credits -= cost;
    player.hull = clamp(player.hull + repaired, 0, playerMaxHull(player));
  }

  player.shield = player.hull >= playerMaxHull(player) ? playerMaxShield(player) : Math.max(player.shield, playerMaxShield(player) * 0.6);
  player.shieldFlash = 0;

  return {
    repaired,
    cost,
    full: player.hull >= playerMaxHull(player),
  };
}

function autoRefuelOnDock(player = state.player) {
  const missing = Math.max(0, playerHullFor(player).fuelCap - player.fuel);
  if (missing <= 0) {
    return { refueled: 0, cost: 0, full: true };
  }

  const affordableFuel = Math.floor(player.credits / 36);
  const refueled = clamp(affordableFuel, 0, missing);
  const cost = refueled * 36;
  if (cost > 0) {
    player.credits -= cost;
    player.fuel = clamp(player.fuel + refueled, 0, playerHullFor(player).fuelCap);
  }

  return {
    refueled,
    cost,
    full: player.fuel >= playerHullFor(player).fuelCap,
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
  const player = activeDockPlayer();
  const missing = playerHullFor(player).fuelCap - player.fuel;
  if (missing <= 0) {
    setStatus("Supplies are already full.");
    return;
  }
  const cost = missing * 36;
  if (player.credits < cost) {
    setStatus("Not enough coins for fresh supplies.");
    return;
  }
  player.credits -= cost;
  player.fuel = playerHullFor(player).fuelCap;
  setStatus(`${player.name}'s supplies replenished for ${formatCredits(cost)}.`);
}

function triggerPatrolScan(ship) {
  if (storyAdventureMode()) return;
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
      ? "Warden patrols have you on a hot scan. They found forbidden bundles and want the situation resolved immediately."
      : "Warden patrols are leaning on your ledger. They want a compliance payment or a reason to escalate.",
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
  } else if (storyAdventureMode()) {
    setStatus("You slip past the checkpoint and keep the crossing calm.");
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
  syncPartyFormationToLead(true);
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
      ? `Setting out for ${SECTORS[targetSectorId].name}.`
      : `Trail marked for ${SECTORS[targetSectorId].name}. ${jumpCountLabel(plan.jumpCount)} linked stretches to travel.`,
    { tag: "Jump" },
  );
  setHint(
    plan.jumpCount === 1
      ? "The channel is opening. Hold steady until the waters settle around you."
      : `${plan.waypointLabel}. Spend ${plan.fuelCost} supplies and stay ready until you reach the final island.`,
  );
}

function openStarmap(returnMode = state.mode === "dock" ? "dock" : "flight", selection = null) {
  state.starmapReturnMode = returnMode;
  state.mode = "starmap";
  state.starmapSelection = selection && SECTORS[selection] ? selection : (selectedStarmapSectorId() || state.currentSectorId);
  syncStarmapMenuIndex();
  setStatus(`Island chart open over ${currentSector().name}.`);
  setHint(
    state.player.loanerHull
      ? `Map open. ${hyperspaceLockText()}. Find a steadier travel form before leaving ${currentSector().name}.`
      : "Map open. Sweep known places with stick or D-pad, south marks a full route, north toggles the map, and B exits.",
  );
}

function closeStarmap() {
  if (state.starmapReturnMode === "flight") {
    state.mode = "flight";
    setStatus(`${currentSector().name} waters active.`, { log: false });
    setHint(state.autopilot.enabled
      ? "Follow-autopilot is trailing the most active traveler. Left bumper toggles it off; right bumper still cycles emotes."
      : standardFlightHint());
    return;
  }
  enterDockMode(`Island chart closed at ${currentSector().name}.`, { dockEvent: false });
}

function openDockScreen(screen) {
  state.previousDockIndex = state.selectedMenuIndex;
  state.dockScreen = screen;
  state.selectedMenuIndex = 0;
  if (screen === "contracts") {
    setHint("Unread contacts light up here. Open a thread with A, then answer from inside the conversation.");
  } else if (screen === "contract-thread") {
    state.threadReplyIndex = 0;
    resetThreadViewport(true);
    playLatestMissionThreadVoice(state.activeMissionThreadId);
    setHint("Up and down scroll the thread. Left and right move your reply. A sends and B returns to the inbox.");
  } else if (screen === "archive") {
    setHint("Browse recovered lore, place files, and story dossiers. A opens a file, B returns to the island kit.");
  } else if (screen === "ships") {
    setHint("Manage travel forms, switch your lead kit, and send companions home from one screen. B returns to the island kit.");
  }
}

function closeDockScreen() {
  if (state.dockScreen === "contract-thread") {
    state.dockScreen = "contracts";
    state.threadReplyIndex = 0;
    state.selectedMenuIndex = 0;
    resetThreadViewport(true);
    setHint("Unread messages are waiting here when contacts have something new.");
    return;
  }
  state.dockScreen = "root";
  state.selectedMenuIndex = state.previousDockIndex || 0;
  setHint("Use the island kit to barter, mend gear, browse quests, or head back onto the water. B sets out from here.");
}

function factionCodexEntries() {
  return [
    {
      id: "faction:authority",
      category: "Faction",
      title: "Wardens",
      meta: "Faction file • Old law",
      copy: "The Wardens speak for old island law, guarded crossings, and the bright sacred places that still expect people to ask permission before passing through.",
      tags: ["Lawful", "Old Law", hasSectorPermit("coreTransit") ? "Deep Path Open" : "Deep Path Sealed"],
      image: archiveArt("faction:authority"),
      imageAlt: "Wardens archive art",
    },
    {
      id: "faction:frontier",
      category: "Faction",
      title: "Hearthfolk",
      meta: "Faction file • Road keepers",
      copy: "Villages, ferrymen, healers, and practical folk who keep crossings useful even when the deeper isles grow strange.",
      tags: ["Frontier", "Lawful", repLabel(factionReputation("frontier"))],
      image: archiveArt("faction:frontier"),
      imageAlt: "Hearthfolk archive art",
    },
    {
      id: "faction:independent",
      category: "Faction",
      title: "Wayfolk",
      meta: "Faction file • Pathside resilience",
      copy: "Travelers, innkeepers, and island helpers who survive on trust, improvisation, and showing up when the archipelago turns difficult.",
      tags: ["Home", "Open", repLabel(factionReputation("independent"))],
      image: archiveArt("faction:independent"),
      imageAlt: "Independents archive art",
    },
    {
      id: "faction:nightglass",
      category: "Faction",
      title: "Moonglass Circle",
      meta: "Faction file • Hidden broker web",
      copy: "A hidden broker web that trades in introductions, sealed packets, and plausible deniability. Quiet Keys sits deeper in their trusted routes.",
      tags: ["Gray", hasSectorPermit("nightglassTransit") ? "Transit Key Held" : "Transit Key Locked", repLabel(factionReputation("syndicate"))],
      image: archiveArt("faction:nightglass"),
      imageAlt: "Moonglass Circle archive art",
    },
    {
      id: "faction:pirate",
      category: "Faction",
      title: "Goblin Clans",
      meta: "Faction file • Displaced island raiders",
      copy: "A scattered web of goblin crews, cave families, and underways pilots who survive in hidden cuts and bad water. Some raid, some ferry, some smuggle whole households through forgotten channels, and most insist the archipelago started calling them criminal long before it stopped making room for them.",
      tags: ["Underways", "Hidden Families", repLabel(factionReputation("pirate"))],
      image: archiveArt("faction:pirate"),
      imageAlt: "Goblin Clans archive art",
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
      title: "Archipelago Primer",
      meta: "Primer • Waterways and hidden channels",
      copy: "These islands run on ferries, mangrove cuts, boardwalks, and old agreements nobody wrote down in one place. Reefs, coves, and shrine isles stay alive because someone still carries medicine, rumors, and courage between them before fear settles in.",
      tags: ["Primer", "Routes", "Island Travel"],
      image: archiveArt("primer:cluster"),
      imageAlt: "Archipelago primer art",
    },
    {
      id: "primer:jumpwake",
      category: "Primer",
      title: "Tide Talk",
      meta: "Primer • Quay and channel language",
      copy: "People around Mangrove House talk about sour water, quiet crossings, wake-roots, lantern weather, and whether the islands feel listening or merely dark. Supplies are never just supplies for long; they become favors, promises, and proof that somebody still showed up.",
      tags: ["Primer", "Culture", "Island Talk"],
      image: archiveArt("primer:jumpwake"),
      imageAlt: "Tide talk art",
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
        meta: `Place file • ${sector.name}`,
        copy: `${archive.copy}${latestRumor ? ` Latest quay talk logged: ${latestRumor}` : ""}`,
        tags: [
          factionName(sector.faction),
          sector.legality,
          archive.focus,
          `${rumorsHeard}/${archive.rumors.length} whispers logged`,
        ],
        image: sectorMenuArt(sectorId),
        imageAlt: `${sector.name} place art`,
      };
    });
}

function contactArchiveStageNote(contactId) {
  if (contactId === "independent-mara-kade") {
    if (state.contactArcs.mara.stage === "resolved") return "Sable now treats you like part of the house's real circle, not just another traveler passing through with sand on their boots.";
    if (state.contactArcs.mara.completed.includes("mara-dockside-whisper")) return "Her requests have shifted from simple errands to quiet trust, which matters more than coin in a place like Mangrove House.";
  }
  if (contactId === "union-juno-vale") {
    if (state.contactArcs.juno.stage === "resolved") return "Nera now speaks to you like someone the banyan itself has started to trust.";
    if (state.contactArcs.juno.completed.includes("juno-convoy-proof")) return "Your work gave Nera proof that fear, not malice, is often what first twists a community out of balance.";
  }
  if (contactId === "salvage-dax-brindle") {
    if (state.contactArcs.dax.stage === "resolved") return "Pip now treats you like someone who can recover memory from silt, not just trinkets from ruins.";
    if (state.contactArcs.dax.completed.includes("dax-ledger-fragment")) return "The fragment changed how he talks to you: less bog-picker, more co-conspirator in keeping the archipelago's buried history alive.";
  }
  if (contactId === "nightglass-vey-neral") {
    if (state.factionArc.path === "syndicate" && state.factionArc.stage === "resolved") return "The hooded figure now trusts you with the sort of half-truths that function as invitations.";
    if (hasSectorPermit("nightglassTransit")) return "Their private token means you are no longer wandering blind through the deeper, stranger paths.";
  }
  if (contactId === "core-ilya-sen") {
    if (state.coreArc.stage === "resolved") return "Elric now has to count you among the people reshaping what the old river laws even mean.";
    if (hasSectorPermit("coreTransit")) return "The official river blessing moved you from harmless wanderer to someone the wardens now watch closely.";
  }
  if (contactId === "bounty-marshal-tovin") {
    if (factionReputation("authority") >= 10) return "Bramble's respect reads as shorter warnings and more confidence, which is probably the warmest version available.";
  }
  if (contactId === "pirate-rill-scrimshaw") {
    if (state.contactArcs.rill.stage === "resolved") return "Rill now treats you like someone who can carry underways truth into daylight without betraying the people hiding inside it.";
    if (state.contactArcs.rill.completed.includes("rill-reef-ledger")) return "You brought her ferry tally into the open and came back alive, which changed what she thinks you are for.";
    if (factionReputation("pirate") >= 8) return "Rill has stopped treating you like another shore-hand who only notices goblins after something catches fire.";
    if (state.visitedSectors.includes("shale_barrens")) return "Rill's name keeps surfacing whenever people talk about underways, missing ferries, and which coves still take in families nobody wants officially counted.";
  }
  if (contactId === "hollow-mire-kest") {
    if (hasCompletedContract("mystery-low-water-council")) return "Mire now regards the Hollow Door as only one witness among many, which is probably the healthiest thing a threshold can become.";
    if (hasCompletedContract("mystery-hollow-door-knock")) return "Mire has stopped treating you like an accidental visitor and started measuring which truths you can carry without cheapening them.";
  }
  if (contactId === "briar-ollie-lark") {
    if (hasCompletedContract("mystery-briar-bell")) return "Ollie now trusts you with bell names, which is to say he trusts you near the part of history people tried to make unsingable.";
  }
  if (contactId === "reedfall-tamsin-voss") {
    if (hasCompletedContract("mystery-reedfall-witnesses")) return "Tamsin has written your route into the witness stakes as one more reason the basin's testimony should be taken seriously.";
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
  if (state.visitedSectors.includes("shale_barrens") || factionReputation("pirate") >= 2) ids.add("pirate-rill-scrimshaw");
  if (state.visitedSectors.includes("hollow_door") || hasCompletedContract("mystery-hollow-door-knock") || state.intrigue.stage === "hollow-door") ids.add("hollow-mire-kest");
  if (state.visitedSectors.includes("briar_hearth") || hasCompletedContract("mystery-briar-bell")) ids.add("briar-ollie-lark");
  if (state.visitedSectors.includes("reedfall_basin") || hasCompletedContract("mystery-reedfall-witnesses")) ids.add("reedfall-tamsin-voss");
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
      title: "Mercy Run Irregularity",
      meta: "History file • Too-ready permissions",
      copy: "The so-called mercy run into Whispering Banyan moved under permissions that appeared before anyone publicly asked for them. Sable called it urgent, Nera called it wrong, and Elric called it impossible in a tone that made impossible sound familiar.",
      tags: ["Mystery", "Mercy", "Old Law"],
    });
  }
  if (hasCompletedContract("mystery-manifest-anomaly")) {
    entries.push({
      id: "history:forged-registry-chain",
      category: "History",
      title: "Forged Willow Ledger",
      meta: "History file • Memory written early",
      copy: "The corrected ledger reached the moonpool before the complaint that should have created it. Someone is not just rewriting records, but deciding what the archipelago will be allowed to remember before witnesses speak.",
      tags: ["Mystery", "Wardens", "Hidden Hand"],
    });
  }
  if (hasCompletedContract("mystery-escort-trace")) {
    entries.push({
      id: "history:saint-radiant-trace",
      category: "History",
      title: "Lost Ferry Trace",
      meta: "History file • Missing crossing",
      copy: "A lost ferry keeps surfacing in soaked scraps, ferry tallies, and conversations that stop one sentence too early. The useful theory is not that it vanished, but that too many people agreed to describe its disappearance differently.",
      tags: ["Mystery", "Ferry", "Overlap"],
    });
  }
  if (hasCompletedContract("mystery-ninth-berth")) {
    entries.push({
      id: "history:ninth-berth",
      category: "History",
      title: "The Ninth Lintel",
      meta: "History file • Hidden threshold",
      copy: "The Hollow Door is either a real buried passage, a protected fiction, or a name several old powers still use when official paths become liabilities. The important part is that Sable, the hooded figure, and Elric all recognize it while pretending they should not.",
      tags: ["Mystery", "Hill-Door", "Hidden Overlap"],
    });
  }
  if (hasCompletedContract("mystery-hollow-door-knock")) {
    entries.push({
      id: "history:hollow-door-opened",
      category: "History",
      title: "Door Chalk Witness",
      meta: "History file • Underways threshold",
      copy: "The Hollow Door accepted the Saint Radiant trace as if it had been waiting for the ferry to be named aloud. Its chalk marks suggest the underways were not an emergency improvisation, but a shared route various powers used whenever official maps became inconvenient.",
      tags: ["Mystery", "Hollow Door", "Underways"],
    });
  }
  if (hasCompletedContract("mystery-briar-bell")) {
    entries.push({
      id: "history:briar-bell-roll",
      category: "History",
      title: "Briar Bell Roll",
      meta: "History file • Names removed from welcome",
      copy: "Ollie Lark's cracked bell proved at least one ferry welcome-roll was altered after the fact. The violence was not only that people were displaced, but that someone tried to make their earlier welcome impossible to prove.",
      tags: ["Mystery", "Briar Hearth", "Bell Roll"],
    });
  }
  if (hasCompletedContract("mystery-reedfall-witnesses")) {
    entries.push({
      id: "history:reedfall-witness-stakes",
      category: "History",
      title: "Reedfall Witness Stakes",
      meta: "History file • Basin testimony",
      copy: "Reedfall Basin matched Briar Hearth's bell name to old witness stakes and ferry marks. The basin's testimony ties the erased welcome-roll to real crossings, making the missing people harder to reduce to rumor.",
      tags: ["Mystery", "Reedfall", "Witness"],
    });
  }
  if (hasCompletedContract("mystery-rootmirror-lanterns")) {
    entries.push({
      id: "history:rootmirror-lantern-families",
      category: "History",
      title: "Rootmirror Lantern Families",
      meta: "History file • Hidden households",
      copy: "Rootmirror Bog turned erased ferry names into living households. The paired lanterns show how families kept identity, route memory, and mutual protection alive after ordinary crossings stopped admitting them.",
      tags: ["Mystery", "Rootmirror", "Families"],
    });
  }
  if (hasCompletedContract("mystery-low-water-council")) {
    entries.push({
      id: "history:low-water-council",
      category: "History",
      title: "Low-Water Council",
      meta: "History file • Shared testimony",
      copy: "The Low-Water Council gathered innkeepers, bell-ringers, surveyors, goblin pilots, wardens, and hidden families around the same testimony. It did not solve the archipelago, but it made the old lie harder to maintain: that safety ever belonged to only one official map.",
      tags: ["Mystery", "Council", "Next Chapter"],
    });
  }
  if (state.visitedSectors.includes("shale_barrens") || factionReputation("pirate") >= 2) {
    entries.push({
      id: "history:underway-refugees",
      category: "History",
      title: "Underway Refugees",
      meta: "History file • Hidden coves and bad maps",
      copy: "The Goblin Clans are not one thing. Some are opportunists, some are wreck-cutters, and some are displaced island people moving families through forbidden channels after patrol closures, bad harvests, and ward failures turned legal routes into public refusals. The important intrigue question is not whether they raid, but who benefited first when they lost the right to move openly.",
      tags: ["Pirate", "Refugees", "Underways"],
    });
  }
  if (hasCompletedContract("mystery-relief-freight") && (state.visitedSectors.includes("shale_barrens") || factionReputation("pirate") >= 2)) {
    entries.push({
      id: "history:mercy-run-overlap",
      category: "History",
      title: "Mercy Run Overlap",
      meta: "History file • Too many interested parties",
      copy: "The mercy run mattered to too many people at once: Sable because people were hungry, Nera because something about it felt wrong, Elric because the permissions were impossible, and the Goblin Clans because sealed routes and closed ferries always push more desperate families into the underways. That is the shape of the archipelago's intrigue now: one act of kindness exposing three competing systems of control.",
      tags: ["Mystery", "Pirate", "Overlap"],
    });
  }
  if (state.factionArc.path === "syndicate") {
    entries.push({
      id: "history:nightglass-introduction",
      category: "History",
      title: "Moonglass Introduction",
      meta: "History file • Broker politics",
      copy: "Accepting Moonglass work means choosing a world where courtesy is a delivery mechanism for leverage. The Circle does not need territorial flags everywhere because it survives by controlling introductions, timing, and what can safely remain unofficial.",
      tags: ["Nightglass", "Choice", "Gray"],
    });
  }
  if (state.factionArc.path === "authority") {
    entries.push({
      id: "history:authority-briefing",
      category: "History",
      title: "Warden Briefing Culture",
      meta: "History file • Lawful pressure",
      copy: "Choosing the Warden side means stepping into a culture that mistakes documentation for neutrality. Their patrols believe every crossing becomes safer when the right people hold the paperwork, even when Hearthfolk know survival often started without permission.",
      tags: ["Authority", "Choice", "Lawful"],
    });
  }
  if (hasSectorPermit("nightglassTransit")) {
    entries.push({
      id: "history:nightglass-transit",
      category: "History",
      title: "Moon Path Tokens",
      meta: "History file • Quiet access",
      copy: "A Moon Path token is not just travel blessing; it is proof that a hidden network has decided your boat is worth trusting with routes it normally hides inside rumor and debt.",
      tags: ["Permit", "Nightglass", "Transit"],
    });
  }
  if (hasSectorPermit("coreTransit")) {
    entries.push({
      id: "history:core-transit",
      category: "History",
      title: "Deep Path Blessing",
      meta: "History file • Official access",
      copy: "Deep Path approval does more than open Sunroot-side routes. It marks your ledger as relevant to the people still trying to define which islands count as central and which survive only by tolerated necessity.",
      tags: ["Permit", "Authority", "Transit"],
    });
  }
  if (state.coreArc.completed.includes("core-arc-sol-briefing")) {
    entries.push({
      id: "history:old-light-charter",
      category: "History",
      title: "Old Tide Charter",
      meta: "History file • Sunroot to Driftwood",
      copy: "The charter packet from Sunroot to Driftwood proved the old relay web still answered when the center actually asked plainly enough. That alone says a lot about whose labor kept nearby islands alive after official enthusiasm cooled.",
      tags: ["Core Arc", "Sol", "Barnard"],
      image: archiveArt("history:old-light-charter"),
      imageAlt: "Old Tide Charter archive art",
    });
  }
  if (state.coreArc.completed.includes("core-arc-barnard-ledger")) {
    entries.push({
      id: "history:relay-ledger",
      category: "History",
      title: "Ferry Ledger Recovery",
      meta: "History file • Independent memory",
      copy: "Driftwood's ledger showed that independent relay crews carried whole stretches of the archipelago through lean years the official record prefers to narrate as orderly decline. It was crossing work as civil resistance, logged in grease and careful handwriting.",
      tags: ["Core Arc", "Barnard", "Ledger"],
      image: archiveArt("history:relay-ledger"),
      imageAlt: "Relay ledger archive art",
    });
  }
  if (state.coreArc.completed.includes("core-arc-centauri-relay")) {
    entries.push({
      id: "history:centauri-vouch",
      category: "History",
      title: "Reefspan Family Vouch",
      meta: "History file • Family leverage",
      copy: "When the Reefspan ferry families put their name behind a packet, they are doing more than forwarding supplies. They are staking generational credibility on a version of the region's history that Sunroot can no longer dismiss as island embellishment.",
      tags: ["Core Arc", "Centauri", "Families"],
    });
  }
  if (state.coreArc.stage === "resolved") {
    entries.push({
      id: "history:blue-archive-hearing",
      category: "History",
      title: "Lagoon Archive Hearing",
      meta: "History file • Rewritten regional story",
      copy: "The Lagoon Archive hearing closed with your courier chain embedded in the official argument. The nearby islands are harder to describe as peripheral once their relay labor is on the record and attached to policy language Sunroot now has to live with.",
      tags: ["Core Arc", "Sirius", "Archive"],
      image: archiveArt("history:blue-archive-hearing"),
      imageAlt: "Lagoon Archive hearing art",
    });
  }
  if (state.contactArcs.mara.stage === "resolved") {
    entries.push({
      id: "history:mara-open-door",
      category: "History",
      title: "Mangrove House Open Door",
      meta: "History file • Broker trust",
      copy: "Sable's trust matters because Mangrove House trust is infrastructure in disguise. Her introductions link ferries, families, and sheltered rooms that stay alive only when enough people still believe each other under pressure.",
      tags: ["Character", "Sable", "Wayfolk"],
    });
  }
  if (state.contactArcs.dax.stage === "resolved") {
    entries.push({
      id: "history:dax-red-ledger",
      category: "History",
      title: "Red Ledger Fragments",
      meta: "History file • Recovery memory",
      copy: "Pip's ledger trail reframed recovery as archival work. Some wrecks do not merely leak bundles or parts; they leak missing names, erased movements, and proof that certain losses were curated long before they were mourned.",
      tags: ["Character", "Pip", "Recovery"],
    });
  }
  if (state.contactArcs.juno.stage === "resolved") {
    entries.push({
      id: "history:juno-union-voice",
      category: "History",
      title: "Banyan Voice Packet",
      meta: "History file • Dispatch pressure",
      copy: "Nera's packet chain turned routine relief travel into a public argument about responsibility. It is a reminder that in working islands, policy often arrives disguised as one exhausted keeper refusing to let a delay vanish into procedure.",
      tags: ["Character", "Nera", "Hearthfolk"],
    });
  }
  if (state.contactArcs.rill.stage === "resolved") {
    entries.push({
      id: "history:rill-tide-testimony",
      category: "History",
      title: "Tide Testimony",
      meta: "History file • Underways witness",
      copy: "Rill's testimony chain forced the archipelago to admit that some underway routes became lifelines only after official ferries, safe harbors, and warded crossings stopped taking certain people in. Her trust matters because it turns rumor into witness and hidden survival into something harder to deny cleanly.",
      tags: ["Character", "Rill", "Underways"],
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
    state.buttonSnapshot[`pad-${pad.index}-emote`] = buttonPressed(pad, GAMEPAD_RIGHT_BUMPER);
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
  setStatus("Distress lantern spotted on the water. If you want the story, get close and hit BOARD.", { tag: "Encounter" });
}

function showDistressBoardingResolution(ship) {
  const distress = ship.distressEncounter;
  if (!distress) return;
  const anchorX = (state.player.x + ship.x) * 0.5;
  const anchorY = (state.player.y + ship.y) * 0.5 - 28;
  openPopup({
    title: "Distress Call",
    copy: "The little boat is running on fumes and panic. A shaken civilian crew needs immediate help stabilizing the hull and getting a lantern signal to the nearest shore watch.",
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
          showBanner("Distress Answered", "The waterways will remember that you showed up.", 2.8);
          setStatus(`Rescue completed. ${formatCredits(distress.payout)} transferred by grateful shore watch.`, { tag: "Encounter" });
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
  if (storyAdventureMode()) {
    offerDistressEncounter();
    return;
  }
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
  if (!LANE_ENCOUNTER_POPUPS_ENABLED) return;
  if (state.mode !== "flight" || state.popup || state.scanState || state.encounterTriggeredThisFlight || playerIsInEscapePod()) return;
  state.encounterCooldown -= dt;
  if (state.encounterCooldown > 0) return;

  const options = [];
  const sector = currentSector();
  options.push({ weight: 1.8, run: offerDistressEncounter });
  if (lawfulSector(sector) && dockAccessState() !== "restricted") {
    options.push({ weight: 2.3, run: offerConvoyEncounter });
  }
  if (sector.legality === "gray" || sector.faction === "pirate" || hasSyndicateAccess()) {
    options.push({ weight: 2.1, run: offerShadowEncounter });
  }
  if (!storyAdventureMode() && (sector.danger >= 0.45 || sectorCondition(sector.id)?.id === "pirate_raids")) {
    options.push({ weight: 2.4, run: offerPirateEncounter });
  }

  state.encounterTriggeredThisFlight = true;
  weightedRandom(options).run();
}

function nearestDisabledShip(player = state.player) {
  let match = null;
  let best = Infinity;
  for (const ship of state.enemyShips) {
    if (!ship.disabled) continue;
    if (ship.x < 26 || ship.x > WIDTH - 26 || ship.y < 26 || ship.y > HEIGHT - 26) continue;
    const d = distance(player, ship);
    if (d < best) {
      best = d;
      match = ship;
    }
  }
  return match && best <= BOARD_RANGE ? match : null;
}

function tryBoardNearestShip(player = state.player, playerIndex = 0) {
  const ship = nearestDisabledShip(player);
  if (!ship) {
    setStatus("No disabled ship close enough to board.");
    return;
  }
  const boardChance = clamp(0.46 + player.boardSkill + playerHullFor(player).boardBonus + state.escortHangar.length * 0.05 - ship.boardDifficulty, 0.22, 0.88);
  const anchorX = (player.x + ship.x) * 0.5;
  const anchorY = (player.y + ship.y) * 0.5 - 36;
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
          resolveBoarding(ship, boardChance, player, playerIndex);
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

function noteSalvageProgress(player = state.player) {
  for (const contract of state.activeContracts) {
    if (contract.type === "salvage" && contract.destinationId === state.currentSectorId) {
      player.missionProgress[contract.id] = (player.missionProgress[contract.id] || 0) + 1;
    }
  }
}

function finalizeBoardingRemoval(ship, sparkColor = "#9ef59f", sparkCount = 16, player = state.player) {
  noteSalvageProgress(player);
  state.enemyShips = state.enemyShips.filter((entry) => entry.id !== ship.id);
  createSpark(ship.x, ship.y, sparkColor, sparkCount);
  addScreenShake(6);
}

function lootDisabledShip(ship, player = state.player) {
  const lootValue = Object.entries(ship.cargo).filter(([, amount]) => amount > 0);
  let moved = 0;
  for (const [commodityId, amount] of lootValue) {
    for (let index = 0; index < amount; index += 1) {
      if (addCargo(commodityId, 1, player)) {
        moved += 1;
      }
    }
  }
  modifyReputation(ship.faction === "pirate" ? "pirate" : ship.faction, ship.faction === "pirate" ? -1 : -2);
  finalizeBoardingRemoval(ship, "#9ef59f", 12, player);
  setStatus(moved > 0 ? `Boarding complete. Cargo stripped from the ${HULLS[ship.hullId].name}.` : `Boarding complete, but there was barely anything worth hauling out.`);
}

function captureDisabledShip(ship, player = state.player) {
  normalizeEscortHangar();
  if (state.escortHangar.length >= MAX_ESCORTS) {
    setStatus("Escort roster is full. Clear a slot before trying to capture another ship.");
    return;
  }
  const escort = createEscortRecord(ship.hullId, { origin: "capture", captures: 1 });
  state.escortHangar.push(escort);
  modifyReputation(ship.faction === "pirate" ? "pirate" : ship.faction, ship.faction === "pirate" ? -1 : -2);
  finalizeBoardingRemoval(ship, "#9ef59f", 18, player);
  setStatus(`${escortFullLabel(escort)} captured and folded into your escort roster.`);
}

function scuttleDisabledShip(ship, player = state.player) {
  const scuttleValue = Math.round(HULLS[ship.hullId].sale * 0.35) + ship.reward;
  player.credits += scuttleValue;
  modifyReputation(ship.faction === "pirate" ? "pirate" : ship.faction, ship.faction === "pirate" ? -1 : -2);
  finalizeBoardingRemoval(ship, "#ffcf74", 20, player);
  setStatus(`Ship scuttled. Salvage teams transferred ${formatCredits(scuttleValue)} in recovery credit.`);
}

function showBoardingResolution(ship, player = state.player) {
  const hullName = HULLS[ship.hullId].name;
  const cargoSummary = Object.entries(ship.cargo)
    .filter(([, amount]) => amount > 0)
    .map(([commodityId, amount]) => `${commodityById(commodityId)?.name || commodityId} x${amount}`)
    .join(" | ");
  const anchorX = (player.x + ship.x) * 0.5;
  const anchorY = (player.y + ship.y) * 0.5 - 28;

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
          lootDisabledShip(ship, player);
        },
      },
      {
        label: "Capture Ship",
        meta: state.escortHangar.length >= MAX_ESCORTS ? "Escort roster full" : "Take control and assign the ship to your roster",
        disabled: state.escortHangar.length >= MAX_ESCORTS,
        confirm() {
          closePopup();
          captureDisabledShip(ship, player);
        },
      },
      {
        label: "Scuttle Ship",
        meta: "Destroy the drifting ship and cash out the salvage",
        confirm() {
          closePopup();
          scuttleDisabledShip(ship, player);
        },
      },
    ],
  });
}

function resolveBoarding(ship, chance, player = state.player, playerIndex = 0) {
  const roll = Math.random();
  if (roll > chance) {
    player.hull = clamp(player.hull - 16, 0, playerMaxHull(player));
    createSpark(ship.x, ship.y, "#ff8a8a", 18);
    createBurst(ship.x, ship.y, "#ff8a8a", { radius: 16, grow: 24, life: 0.3, fillAlpha: 0.18, lineWidth: 2.2 });
    addScreenShake(8);
    state.enemyShips = state.enemyShips.filter((entry) => entry.id !== ship.id);
    setStatus(`${player.name}'s boarding action failed. The crew got back, but not clean.`);
    showBanner("Boarding Repelled", "The team got out, but the lane is rougher for it now.", 1.8);
    if (playerIndex === 0 && player.hull <= 0) {
      loseShip();
    } else if (playerIndex !== 0 && player.hull <= 0) {
      player.hull = Math.max(1, playerMaxHull(player) * 0.4);
      player.shield = Math.max(0, playerMaxShield(player) * 0.35);
      player.x = state.player.x;
      player.y = state.player.y;
      setStatus(`${player.name}'s boarding crew was forced back to the flotilla.`);
    }
    return;
  }
  if (ship.distressEncounter) {
    showDistressBoardingResolution(ship);
    setStatus("Boarding succeeded. The distress crew is waiting on your call.");
    showBanner("Distress Secured", "You reached the ship. Decide how involved you want to get.", 1.7);
    return;
  }
  showBoardingResolution(ship, player);
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
  syncPartyState();
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
    partyMembers: state.partyMembers,
    activePartyMemberIndex: state.activePartyMemberIndex,
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
  if (state.resettingProgress) return false;
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

function clearSavedProgress() {
  try {
    const keys = Array.from({ length: window.localStorage.length }, (_, index) => window.localStorage.key(index))
      .filter((key) => key && (key.startsWith(SAVE_STORAGE_PREFIX) || key.startsWith(SAVE_NAME_STORAGE_PREFIX)));
    for (const key of keys) {
      window.localStorage.removeItem(key);
    }
    return true;
  } catch (_error) {
    return false;
  }
}

function resetProgressAndStartFresh() {
  state.resettingProgress = true;
  const cleared = clearSavedProgress();
  if (!cleared) {
    state.resettingProgress = false;
    setStatus("Reset failed on this browser. Progress was not changed.", { tag: "Reset" });
    return false;
  }
  setStatus("Progress erased. Starting fresh at Mangrove House.", { tag: "Reset" });
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("_reset", Date.now().toString());
  window.location.replace(nextUrl.toString());
  return true;
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
    state.partyMembers = Array.isArray(saved.partyMembers) && saved.partyMembers.length
      ? saved.partyMembers.map((member, index) => createPlayerState(index, member))
      : [createPlayerState(0, state.player)];
    state.activePartyMemberIndex = clamp(Number(saved.activePartyMemberIndex || 0), 0, MAX_PARTY_PLAYERS - 1);
    syncPartyState();
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
          rill: { stage: saved.contactArcs.rill?.stage || "intro", completed: Array.isArray(saved.contactArcs.rill?.completed) ? saved.contactArcs.rill.completed : [] },
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
    refreshMissionThreadContacts();
    state.activeMissionThreadId = typeof saved.activeMissionThreadId === "string" ? saved.activeMissionThreadId : null;
    state.arrivalThreadPings = saved.arrivalThreadPings && typeof saved.arrivalThreadPings === "object" ? saved.arrivalThreadPings : {};
    state.sectorStates = saved.sectorStates && typeof saved.sectorStates === "object" ? saved.sectorStates : state.sectorStates;
    state.encounterCounter = Number(saved.encounterCounter || 0);
    if (typeof performance !== "undefined") {
      state.lastAutosaveAt = performance.now();
    }
    normalizeStoryAdventureContracts();
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

function fireWeaponPattern(origin, angle, profile, from, baseColor, ownerVelocityX = 0, ownerVelocityY = 0, powerBonus = 0, extras = {}) {
  if (profile === "scatter") {
    for (const spread of [-0.12, 0, 0.12]) {
      spawnShot(origin, angle + spread, from === "player" ? SHOT_SPEED * 0.95 : ENEMY_SHOT_SPEED * 0.9, 0.85, from, baseColor, 8 + powerBonus, ownerVelocityX, ownerVelocityY, extras);
    }
    return;
  }
  if (profile === "rail") {
    spawnShot(origin, angle, from === "player" ? SHOT_SPEED * 1.28 : ENEMY_SHOT_SPEED * 1.18, 1.35, from, baseColor, 26 + powerBonus * 2, ownerVelocityX, ownerVelocityY, extras);
    return;
  }
  if (profile === "missile") {
    spawnShot(origin, angle, from === "player" ? SHOT_SPEED * 0.82 : ENEMY_SHOT_SPEED * 0.76, 1.8, from, baseColor, 14 + powerBonus, ownerVelocityX, ownerVelocityY, extras);
    return;
  }
  spawnShot(origin, angle, from === "player" ? SHOT_SPEED : ENEMY_SHOT_SPEED, 1.1, from, baseColor, 18 + powerBonus, ownerVelocityX, ownerVelocityY, extras);
}

function firePlayerShot(player = state.player, ownerIndex = 0) {
  if (player.fireCooldown > 0) {
    return;
  }
  const hull = playerHullFor(player);
  const profile = hull.weaponProfile;
  const shotColor = profile === "rail" ? "#b8e6ff" : profile === "scatter" ? "#8fe9ff" : profile === "missile" ? "#ffd37d" : "#7ad8ff";
  player.fireCooldown = Math.max(0.14, (profile === "rail" ? 0.62 : profile === "scatter" ? 0.42 : profile === "missile" ? 0.54 : 0.34) - player.weaponLevel * 0.05);
  fireWeaponPattern(
    player,
    player.angle,
    profile,
    "player",
    shotColor,
    player.vx * 0.15,
    player.vy * 0.15,
    player.weaponLevel * 5,
    { ownerIndex }
  );
  createSpark(
    player.x + Math.cos(player.angle) * 16,
    player.y + Math.sin(player.angle) * 16,
    profile === "rail" ? "#b8e6ff" : profile === "missile" ? "#ffd37d" : "#7ad8ff",
    4
  );
  createBurst(
    player.x + Math.cos(player.angle) * 16,
    player.y + Math.sin(player.angle) * 16,
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

function sendLanternPulse(player = state.player, ownerIndex = 0) {
  if (player.fireCooldown > 0) {
    return;
  }
  const accent = PARTY_SLOT_STYLES[ownerIndex]?.accent || "#aef4d5";
  player.fireCooldown = 0.72;
  createSpark(player.x, player.y, accent, 8);
  createBurst(player.x, player.y, accent, {
    radius: 16,
    grow: 34,
    life: 0.42,
    fillAlpha: 0.12,
    lineWidth: 2,
  });
  createBurst(player.x, player.y, "#f6dd82", {
    radius: 9,
    grow: 26,
    life: 0.34,
    fillAlpha: 0.1,
    lineWidth: 1.6,
  });
  setStatus(`${player.name} sends a lantern pulse across the water.`, { tag: "Signal", log: false });
}

function fireEnemyShot(ship) {
  const target = nearestPartyMemberTo(ship);
  const aim = angleTo(ship, target);
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
  const pads = orderedGamepads();
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

function orderedGamepads() {
  return getGamepads().slice().sort((a, b) => a.index - b.index);
}

function padForFlightSlot(slot) {
  return orderedGamepads()[slot] || null;
}

function slotHasDirectController(slot) {
  if (slot === 0) return true;
  return Boolean(padForFlightSlot(slot));
}

function buttonJustPressed(key, pressed) {
  const previous = state.buttonSnapshot[key] || false;
  state.buttonSnapshot[key] = pressed;
  return pressed && !previous;
}

function consumeMenuConfirmInput(pad = activePad()) {
  unlockAudio();
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

function readFlightInputForSlot(slot = 0) {
  const pad = slot === 0 ? padForFlightSlot(0) || activePad() : padForFlightSlot(slot);
  const input = {
    moveX: 0,
    moveY: 0,
    fire: false,
    interact: false,
    map: false,
    back: false,
    chill: false,
    emote: false,
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
    input.emote = buttonJustPressed(`pad-${pad.index}-emote`, buttonPressed(pad, GAMEPAD_RIGHT_BUMPER));
  }

  if (slot === 0) {
    const keyboardMoveX = (keyboard.right ? 1 : 0) - (keyboard.left ? 1 : 0);
    const keyboardMoveY = (keyboard.down ? 1 : 0) - (keyboard.up ? 1 : 0);
    if (Math.abs(keyboardMoveX) > Math.abs(input.moveX)) input.moveX = keyboardMoveX;
    if (Math.abs(keyboardMoveY) > Math.abs(input.moveY)) input.moveY = keyboardMoveY;
    input.fire = input.fire || keyboard.fire;
    input.interact = input.interact || keyboard.interact;
    input.map = input.map || keyboard.map;
    input.back = input.back || keyboard.back;
    input.chill = input.chill || keyboard.pause;
  }

  if (!state.music.unlocked && (
    Math.abs(input.moveX) > DEADZONE
    || Math.abs(input.moveY) > DEADZONE
    || input.fire
    || input.interact
    || input.map
    || input.back
    || input.chill
    || input.emote
  )) {
    unlockAudio();
  }

  return input;
}

function focusControllerForSlot(slot = 0) {
  const pad = padForFlightSlot(slot);
  if (pad) {
    state.selectedGamepadIndex = pad.index;
    if (state.firstConnectedGamepadIndex === null) {
      state.firstConnectedGamepadIndex = pad.index;
    }
  }
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
  unlockAudio();
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
      { label: "Resume Journey", meta: "Return to the island waters.", confirm: () => setStatus("Back on the water.") },
      {
        label: "Open Trail Map",
        meta: "Trace a full route from the wilds.",
        confirm: () => {
          openStarmap("flight");
        },
      },
      { label: "Find Safe Rest", meta: "Move near a haven and press west to settle in.", disabled: true, confirm: () => {} },
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
          state.threadReplyIndex = 0;
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
    const activeContracts = thread
      ? state.activeContracts.filter((contract) => missionThreadIdForContract(contract) === thread.id)
      : [];
    const availableContracts = thread
      ? state.availableContracts.filter((contract) => missionThreadIdForContract(contract) === thread.id)
      : [];
    const threadEntries = [];
    activeContracts.forEach((contract) => {
      threadEntries.push({
        label: `Track ${contract.title}`,
        meta: `Active mission | ${SECTORS[contract.destinationId]?.name || "Unknown"} | Open the trail map`,
        confirm: () => openStarmap("dock", contract.destinationId),
      });
      threadEntries.push({
        label: `Drop ${contract.title}`,
        meta: "Clear this active mission and free the board",
        confirm: () => confirmAbandonContract(contract.id),
      });
    });
    threadEntries.push(...availableContracts.map((contract) => ({
      label: promptLabelText(missionResponseLabel(contract)),
      meta: `Payout ${formatCredits(contract.reward)} | ${SECTORS[contract.destinationId]?.name || "Unknown"} | ${displayTags(contract.tags) || contract.type}`,
      confirm: () => attemptAcceptContract(contract.id),
    })));
    if (!threadEntries.length) {
      threadEntries.push({
        label: "No action here",
        meta: "This thread has no active mission or open reply right now.",
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
      meta: `${unread.has(entry.id) ? "New • " : ""}${entry.meta || `${entry.category} file`} • ${displayTags(entry.tags, 2, " • ")}`,
      artKey: entry.image ? null : undefined,
      confirm: () => {
        markArchiveEntryRead(entry.id);
        openPopup({
          title: entry.title,
          copy: `${entry.copy}${entry.tags?.length ? ` Filed under: ${displayTags(entry.tags, entry.tags.length, " • ")}.` : ""}`,
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
    const active = activeDockPlayer();
    const canBuyHull = (hullId) => (currentSector().shipyard || []).includes(hullId) && active.credits >= HULLS[hullId].sale && hasHullLicense(hullId);
    const shipyardEntries = (currentSector().shipyard || []).filter((hullId) => hullId !== active.hullId).map((hullId) => ({
      label: `Buy ${HULLS[hullId].name} for ${active.name}`,
      meta: `${formatCredits(HULLS[hullId].sale)} | ${HULLS[hullId].classRole}${hullLicenseLabel(hullId) ? ` | ${hullLicenseLabel(hullId)}` : ""}`,
      artKey: hullId,
      disabled: restricted || !canBuyHull(hullId),
      confirm: () => purchaseHull(hullId),
    }));
    const entries = [
      {
        label: `Active Traveler: ${active.name}`,
        meta: `${playerHullFor(active).name} | ${playerHullFor(active).classRole} | One island shopper at a time`,
        artKey: active.hullId,
        disabled: true,
        confirm: () => {},
      },
      ...partyMembers().map((member, index) => ({
        label: `${index === state.activePartyMemberIndex ? "Viewing" : "Switch To"} ${member.name}`,
        meta: `${playerHullFor(member).name} | ${formatCredits(member.credits)} | Pack ${playerCargoUsed(member)}/${playerMaxCargo(member)}`,
        artKey: member.hullId,
        disabled: index === state.activePartyMemberIndex,
        confirm: () => {
          state.activePartyMemberIndex = index;
          setStatus(`${member.name} steps up to handle the island menu.`);
        },
      })),
      {
        label: `Repair ${active.name}`,
        meta: `Restore ${playerHullFor(active).name} at this haven`,
        artKey: active.hullId,
        disabled: active.hull >= playerMaxHull(active),
        confirm: repairShip,
      },
      {
        label: `Refill ${active.name}`,
        meta: `Restock supplies for ${playerHullFor(active).name}`,
        artKey: active.hullId,
        disabled: active.fuel >= playerHullFor(active).fuelCap,
        confirm: refuelShip,
      },
      {
        label: `Companion Doctrine: ${state.escortCommand}`,
        meta: `Cycle follow, defend, attack, and regroup behavior. Company: ${escortRosterSummary(2)}.`,
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
        label: `Release ${escortDisplayName(escort)}`,
        meta: `${HULLS[escort.hullId]?.name || escort.hullId} | Release for ${formatCredits(escort.sale)}`,
        artKey: escort.hullId,
        confirm: () => sellEscort(index),
      });
    });
    if (state.escortHangar.length === 0) {
      entries.push({ label: "No reserve companions", meta: "Win one in the wilds or outfit one locally and keep it in reserve.", disabled: true, confirm: () => {} });
    }
    entries.push({ label: "Back", meta: "Return to the island kit.", confirm: closeDockScreen });
    return entries;
  }

  return [
    { label: "Messages", meta: restricted ? "Restricted travelers are not offered local work." : "Open your contacts, read the thread, and answer inside the conversation.", confirm: () => openDockScreen("contracts") },
    {
      label: "Get Back on Track",
      meta: storyLeadMeta(),
      confirm: resumeStoryLead,
    },
    { label: "Archive", meta: `${archiveUnreadCount() ? `${archiveUnreadCount()} new file${archiveUnreadCount() === 1 ? "" : "s"} • ` : ""}Read place lore, contact dossiers, and recovered history.`, confirm: () => openDockScreen("archive") },
    { label: "Party Kit", meta: "Choose which traveler handles island business, tune their boat, and keep the flotilla ready.", artKey: activeDockPlayer().hullId, confirm: () => openDockScreen("ships") },
    {
      label: "Trail Map",
      meta: "Plot your next full route while resting.",
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
      unlockAudio();
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
    ui.menuPanelTitle.textContent = "Island Kit";
    ui.detailPanelTitle.textContent = "Context";
    ui.menuPanelFootnote.textContent = "Controller: D-pad browse, south confirm, B shove off, start opens the island kit.";
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
    ui.menuPanelTitle.textContent = "Flotilla Kit";
    ui.detailPanelTitle.textContent = "Travel Status";
    ui.menuPanelFootnote.textContent = "Controller: D-pad browse gear options, south confirms, B returns to the quay.";
    return;
  }
  ui.menuPanelTitle.textContent = "Island Kit";
  ui.detailPanelTitle.textContent = "Context";
  ui.menuPanelFootnote.textContent = "Controller: D-pad browse, south confirm, B shove off, start opens the island kit.";
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
            tags: [entry.category, ...(entry.tags || []), (state.archiveUnreadIds || []).includes(entry.id) ? "New file" : ""].filter(Boolean).slice(0, 5).map(displayTag),
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
          `${sectorArchiveEntries().length} places logged`,
          `${contactArchiveEntries().length} contacts known`,
          `${storyArchiveEntries().length} history files`,
        ],
      },
      {
        title: latestRumor ? `Current Hearth Talk: ${currentSector().name}` : "Hearth Talk",
        copy: latestRumor || `No local whisper is logged for ${currentSector().name} yet. Stay awhile and the room will eventually tell on itself.`,
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
      imageAlt: `${currentSector().name} place art`,
      mediaVariant: "wide",
      tags: [factionName(currentSector().faction), currentSector().legality, `Danger ${Math.round(currentSector().danger * 100)}%`, access],
    });
    cards.push({
      title:
        state.dockScreen === "root"
          ? "Place Intel"
          : state.dockScreen === "ships"
            ? "Party Kit"
            : "Trail Kit",
      copy: stationContextCopy(),
      tags: stationContextTags(),
    });
  } else if (state.mode === "flight") {
    const disabled = nearestDisabledShip();
    cards.push({
      title: "Live Path",
      copy: disabled
        ? `Disabled ${HULLS[disabled.hullId].name} in search range. Press west to make a very bad and possibly excellent decision.`
        : "The islands are moving. Raiders want a piece, havens want your patience, and the line between journey and battle is thin.",
      tags: [`${state.enemyShips.length} contacts`, `${state.escortHangar.length} escorts`],
    });
  } else if (state.mode === "starmap") {
    const destination = selectedStarmapSectorId() ? SECTORS[selectedStarmapSectorId()] : null;
    const destinationContracts = destination ? contractsForSector(destination.id) : [];
    const plan = destination ? travelPlanForSector(destination.id) : null;
    cards.push({
      title: destination ? destination.name : "Trail Map",
      copy: destination
        ? `${plan?.blockedReason ? `${plan.blockedReason}. ` : plan?.jumpCount ? `${jumpCountLabel(plan.jumpCount)} plotted. ${plan.waypointLabel}. ` : ""}${destination.routeNotes} ${destinationContracts.length ? `Quest pull: ${destinationContracts.map((contract) => contract.title).join(" | ")}.` : "No active quests are pointed here right now."}`
        : "Plot full routes across known places. Longer routes use more supplies, and weaker forms run short first.",
      mediaVariant: destination ? "wide" : "",
      tags: destination
        ? [factionName(destination.faction), destination.legality, sectorCondition(destination.id)?.title || "Quiet path", `Danger ${Math.round(destination.danger * 100)}%`, ...(plan?.jumpCount ? [jumpCountLabel(plan.jumpCount), `Supplies ${plan.fuelCost}`] : []), ...(plan?.blockedReason ? [plan.blockedReason] : []), ...(destinationContracts.length ? [`${destinationContracts.length} quests`] : [])]
        : [`Supplies ${state.player.fuel}/${currentHull().fuelCap}`],
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
  const replyIndex = currentThreadReplyIndex(replyEntries);
  const { active, available } = missionThreadContractState(thread);
  const hasVoice = threadHasLatestVoice(thread);
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
        ${hasVoice ? `
          <button class="thread-voice-button" type="button" title="Replay latest voice line" aria-label="Replay latest voice line" data-thread-voice="${safeUiText(thread.id)}">▶</button>
        ` : ""}
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
        <div class="chat-replies-title">Replies & Actions</div>
        <div class="chat-replies-list chat-replies-list--overlay">
          ${replyEntries.map((entry, index) => `
            <button
              type="button"
              class="chat-reply${index === replyIndex ? " is-selected" : ""}${entry.disabled ? " is-disabled" : ""}"
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
      unlockAudio();
      const index = Number(node.getAttribute("data-reply-index"));
      if (!Number.isFinite(index)) return;
      state.threadReplyIndex = index;
      const entry = replyEntries[index];
      if (entry && !entry.disabled) {
        entry.confirm();
      }
      render();
    });
  });
  overlay.querySelector("[data-thread-voice]")?.addEventListener("click", () => {
    unlockAudio();
    playLatestMissionThreadVoice(thread.id, { force: true });
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
    return "This is your contacts list. Browse it like a letter pouch, open one with A, and use B to back out when you are done.";
  }
  if (state.dockScreen === "contract-thread") {
    return "Read the full exchange, scroll the history with up and down, then move across your next reply with left and right. B returns to contacts.";
  }
  if (state.dockScreen === "archive") {
    return `The archive keeps faction primers, place files, contact dossiers, and recovered old notes in one place. ${archiveUnreadCount() ? `${archiveUnreadCount()} file${archiveUnreadCount() === 1 ? "" : "s"} still want your attention.` : "Everything currently unlocked has been reviewed."}`;
  }
  if (state.dockScreen === "ships") {
    return escortCount()
      ? `Current travel form: ${currentHull().name}. Companions in reserve: ${state.escortHangar.map((escort) => escortFullLabel(escort)).join(" | ")}. Safe havens automatically mend and restock your lead form on arrival.`
      : `Current travel form: ${currentHull().name}. No reserve companions yet. Outfit one locally or win one the hard way out on the water.`;
  }
  return `${dockContextLine()} Active quests: ${state.activeContracts.length}. Pack: ${cargoUsed()}/${maxCargo()}. Place condition: ${sectorConditionSummary()}. ${state.factionArc.stage === "resolved" ? "Your name is moving through the island grapevine now." : currentSectorEventTag()}.`;
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
    return [`${archiveEntries().length} files`, `${archiveUnreadCount()} unread`, `${sectorArchiveEntries().length} place files`];
  }
  if (state.dockScreen === "ships") {
    return [activeDockPlayer().name, playerHullFor(activeDockPlayer()).name, `Doctrine ${state.escortCommand}`];
  }
  return [
    dockMoodTag(),
    sectorCondition(state.currentSectorId)?.title || "Quiet path",
    archiveUnreadCount() ? `${archiveUnreadCount()} lore updates` : `${knownSectorIds().length}/${Object.keys(SECTORS).length} known places`,
  ];
}

function commodityMarketNote(commodityId) {
  const price = marketPrice(state.currentSectorId, commodityId);
  const base = commodityById(commodityId)?.base || price;
  if (commodityId === "contraband" && currentSector().legality === "strict") {
    return "high risk";
  }
  if (price <= Math.round(base * 0.9)) {
    return "good bargain";
  }
  if (price >= Math.round(base * 1.1)) {
    return "costly here";
  }
  return "steady";
}

function renderShipPanel() {
  normalizeEscortHangar();
  const active = state.mode === "dock" ? activeDockPlayer() : state.player;
  const rows = [
    ["Active Traveler", `${active.name}${active === state.player ? " • Lead" : ""}`],
    ["Heart", `${Math.round((active.hull / playerMaxHull(active)) * 100)}%`],
    ["Ward", `${Math.round((active.shield / playerMaxShield(active)) * 100)}%`],
    ["Travel Form", playerHullFor(active).name],
    ["Style", playerHullFor(active).classRole],
    ["Passage", active.loanerHull ? "Local passage only" : "Long-path ready"],
    ["Talents", playerHullFor(active).slotText],
    ["Supplies", `${active.fuel} / ${playerHullFor(active).fuelCap}`],
    ["Pack", `${playerCargoUsed(active)} / ${playerMaxCargo(active)}`],
    ["Coins", formatCredits(active.credits)],
    ["Party", partyMembers().map((member) => `${member.name}: ${playerHullFor(member).name}`).join(" | ")],
    ["Escorts", `${state.escortHangar.length} / ${MAX_ESCORTS}`],
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
    ["Warden Trust", hasAuthorityPermit() ? "Recognized" : "Unproven"],
    ["Moonglass Welcome", hasSyndicateAccess() ? "Warm intro" : "Cold"],
    ["Deep Path", hasSectorPermit("coreTransit") ? "Open" : "Sealed"],
    ["Moon Path", hasSectorPermit("nightglassTransit") ? "Known" : "Hidden"],
    ["Resting", dockAccessState()],
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
    : [{ text: "No chatter yet. The story log will collect quests, crossings, rescues, losses, and quay gossip as your journey unfolds.", tag: "Log", sectorId: state.currentSectorId }];

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
  const hudPlayer = state.mode === "dock" ? activeDockPlayer() : state.player;
  ui.sector.textContent = currentSector().name;
  ui.credits.textContent = formatCredits(hudPlayer.credits);
  ui.hull.textContent = playerIsInEscapePod() ? "POD" : `${Math.round((hudPlayer.hull / playerMaxHull(hudPlayer)) * 100)}%`;
  ui.shield.textContent = playerIsInEscapePod() ? "SAFE" : `${Math.round((hudPlayer.shield / playerMaxShield(hudPlayer)) * 100)}%`;
  ui.cargo.textContent = `${playerCargoUsed(hudPlayer)} / ${playerMaxCargo(hudPlayer)}`;
  ui.status.textContent = state.statusText;
  ui.hint.textContent = boardingTarget
    ? `Search range on ${HULLS[boardingTarget.hullId]?.name || "disabled traveler"}. Press west to search or keep fighting to finish it off.`
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
    ctx.globalAlpha = star.alpha * 0.8;
    ctx.fillStyle = star.size > 1.5 ? "rgba(244, 231, 167, 0.95)" : "rgba(192, 227, 181, 0.9)";
    ctx.beginPath();
    ctx.arc(star.x, star.y, Math.max(1, star.size * 0.72), 0, Math.PI * 2);
    ctx.fill();
    if (star.size > 1.7) {
      ctx.globalAlpha = star.alpha * 0.24;
      ctx.fillStyle = "rgba(255, 219, 129, 0.9)";
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * 2.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

function authoritySector(sectorId) {
  return SECTORS[sectorId]?.faction === "authority";
}

function mapNodeFill(sectorId, selected) {
  if (sectorId === state.currentSectorId) return "#f1d39c";
  if (selected) return "#bfe4eb";
  const route = state.mode === "starmap" ? travelPlanForSector(selectedStarmapSectorId()).route : null;
  if (route?.includes(sectorId)) return "#d9ecd8";
  if (authoritySector(sectorId)) return "#dce7ea";
  return "#edf2df";
}

function mapLaneStroke(fromId, toId) {
  const route = state.mode === "starmap" ? travelPlanForSector(selectedStarmapSectorId()).route : null;
  if (routeContainsLane(route, fromId, toId)) {
    return "rgba(246, 203, 120, 0.84)";
  }
  if (authoritySector(fromId) && authoritySector(toId)) return "rgba(198, 219, 227, 0.44)";
  if (authoritySector(fromId) || authoritySector(toId)) return "rgba(163, 208, 221, 0.32)";
  return "rgba(126, 190, 208, 0.26)";
}

function starmapNodePoint(node) {
  return {
    x: node.x * WIDTH,
    y: node.y * HEIGHT,
  };
}

function starmapNodeRadius(nodeId) {
  return nodeId === state.currentSectorId ? 12 : 9;
}

function drawWaterwayLane(fromNode, toNode, strokeStyle) {
  const from = starmapNodePoint(fromNode);
  const to = starmapNodePoint(toNode);
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const startRadius = starmapNodeRadius(fromNode.id) + 5;
  const endRadius = starmapNodeRadius(toNode.id) + 5;
  const startX = from.x + Math.cos(angle) * startRadius;
  const startY = from.y + Math.sin(angle) * startRadius;
  const endX = to.x - Math.cos(angle) * endRadius;
  const endY = to.y - Math.sin(angle) * endRadius;
  const distanceBetween = Math.hypot(endX - startX, endY - startY);
  const bend = Math.min(32, Math.max(10, distanceBetween * 0.08)) * (((stableHash(`${fromNode.id}:${toNode.id}`) % 2) === 0) ? 1 : -1);
  const midX = (startX + endX) * 0.5;
  const midY = (startY + endY) * 0.5;
  const controlX = midX - Math.sin(angle) * bend;
  const controlY = midY + Math.cos(angle) * bend;

  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = routeContainsLane(state.mode === "starmap" ? travelPlanForSector(selectedStarmapSectorId()).route : null, fromNode.id, toNode.id) ? 3 : 2;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.quadraticCurveTo(controlX, controlY, endX, endY);
  ctx.stroke();
}

function drawStarmapSingularities() {
  const features = [
    {
      x: WIDTH * 0.24,
      y: HEIGHT * 0.28,
      radius: 24,
      ringX: 40,
      ringY: 16,
      label: "MOONPOOL",
      kind: "pool",
    },
    {
      x: WIDTH * 0.77,
      y: HEIGHT * 0.16,
      radius: 26,
      ringX: 56,
      ringY: 18,
      label: "WHISPER REEF",
      kind: "reef",
    },
  ];

  ctx.save();
  for (const feature of features) {
    const glow = ctx.createRadialGradient(
      feature.x,
      feature.y,
      feature.radius * 0.2,
      feature.x,
      feature.y,
      feature.radius * 3,
    );
    glow.addColorStop(0, "rgba(150, 222, 231, 0.22)");
    glow.addColorStop(0.45, "rgba(228, 238, 197, 0.09)");
    glow.addColorStop(1, "rgba(10, 18, 28, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(feature.x, feature.y, feature.radius * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(153, 216, 227, 0.24)";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.ellipse(feature.x, feature.y, feature.ringX, feature.ringY, -0.18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(feature.x, feature.y, feature.ringX * 1.18, feature.ringY * 1.36, 0.28, 0, Math.PI * 2);
    ctx.stroke();

    if (feature.kind === "pool") {
      ctx.fillStyle = "rgba(127, 196, 214, 0.2)";
      ctx.beginPath();
      ctx.ellipse(feature.x, feature.y, feature.radius, feature.radius * 0.82, 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(242, 219, 156, 0.42)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.ellipse(feature.x, feature.y, feature.radius - 5, feature.radius * 0.52, -0.24, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = "rgba(219, 208, 158, 0.18)";
      ctx.beginPath();
      ctx.ellipse(feature.x, feature.y, feature.radius + 5, feature.radius * 0.66, -0.04, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(169, 201, 121, 0.36)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(feature.x - feature.radius * 0.82, feature.y + 2);
      ctx.lineTo(feature.x - feature.radius * 0.2, feature.y - feature.radius * 0.18);
      ctx.lineTo(feature.x + feature.radius * 0.5, feature.y + feature.radius * 0.14);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(feature.x - feature.radius * 0.4, feature.y + feature.radius * 0.3);
      ctx.lineTo(feature.x + feature.radius * 0.85, feature.y + feature.radius * 0.05);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(194, 203, 173, 0.72)";
    ctx.font = "12px Avenir Next, Segoe UI, sans-serif";
    ctx.fillText(feature.label, feature.x - 34, feature.y - feature.radius - 16);
    ctx.fillRect(feature.x - 22, feature.y - feature.radius - 8, 44, 2);
    ctx.fillRect(feature.x - 22, feature.y - feature.radius - 2, 34, 2);
  }
  ctx.restore();
}

function shipPalette(ship) {
  if (ship.type === "patrol" || ship.faction === "authority") {
    return {
      hull: ship.disposition === "hostile" ? "#ffd082" : "#d6e0cc",
      accent: "#b9d9a3",
      marker: "#ffd980",
    };
  }
  if (ship.type === "trader") {
    return {
      hull: "#d6cfbf",
      accent: "#a7bc9b",
      marker: "#a7bc9b",
    };
  }
  if (ship.type === "smuggler") {
    return {
      hull: "#f0afd2",
      accent: "#d7cd86",
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
    hull: "#a5b8a4",
    accent: "#b6d4a0",
    marker: "#b6d4a0",
  };
}

function drawStation() {
  const station = currentSector().station;
  const palette = currentSector().palette;
  const profile = currentIslandProfile();
  ctx.save();
  ctx.globalAlpha = 0.96;
  ctx.translate(station.x, station.y);
  ctx.fillStyle = "rgba(8, 35, 42, 0.24)";
  ctx.beginPath();
  ctx.ellipse(profile.isletOffsetX || 0, 18 + (profile.isletOffsetY || 0), (profile.isletRx || 70) + 20, (profile.isletRy || 26) + 12, -0.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(132, 197, 222, 0.18)";
  ctx.beginPath();
  ctx.ellipse(profile.isletOffsetX || -6, (profile.isletOffsetY || 0) + 1, (profile.isletRx || 70) + 10, (profile.isletRy || 26) + 6, -0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = profile.sand;
  ctx.beginPath();
  ctx.ellipse(profile.isletOffsetX || -10, profile.isletOffsetY || -2, profile.isletRx || 68, profile.isletRy || 24, -0.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 242, 214, 0.34)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(profile.isletOffsetX || -10, profile.isletOffsetY || -2, profile.isletRx || 68, profile.isletRy || 24, -0.08, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = profile.foliageDark;
  ctx.beginPath();
  ctx.ellipse((profile.isletOffsetX || -10) - 18, (profile.isletOffsetY || -2) - 8, 18, 12, -0.12, 0, Math.PI * 2);
  ctx.ellipse((profile.isletOffsetX || -10) + 10, (profile.isletOffsetY || -2) - 12, 24, 14, 0.08, 0, Math.PI * 2);
  ctx.ellipse((profile.isletOffsetX || -10) + 34, (profile.isletOffsetY || -2) - 6, 18, 11, 0.16, 0, Math.PI * 2);
  ctx.fill();

  const dockLength = profile.dockLength || 52;
  ctx.fillStyle = "rgba(86, 63, 38, 0.96)";
  ctx.fillRect(12, -4, dockLength, 8);
  ctx.fillRect(12 + dockLength - 10, -8, 10, 16);
  ctx.fillRect(24, -12, 22, 14);

  ctx.fillStyle = palette.stationWarm;
  ctx.fillRect(29, -20, 7, 10);
  ctx.fillRect(16 + dockLength - 8, -18, 7, 12);
  ctx.fillRect(-22, -4, 8, 8);

  ctx.fillStyle = profile.foliage;
  ctx.beginPath();
  ctx.arc(-30, 10, 8, 0, Math.PI * 2);
  ctx.arc(-12, 12, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(193, 82, 63, 0.92)";
  ctx.beginPath();
  ctx.arc(-34, 10, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-22, 14, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(243, 225, 182, 0.9)";
  ctx.beginPath();
  ctx.arc(-34, 6, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-22, 10, 1.8, 0, Math.PI * 2);
  ctx.fill();

  for (let index = 0; index < (profile.palms || 2); index += 1) {
    drawPalmCluster(-20 + index * 22, -6 - (index % 2) * 6, profile, 0.75 + index * 0.05);
  }

  if (profile.cliff) {
    ctx.fillStyle = palette.planetShadow;
    ctx.beginPath();
    ctx.moveTo(-68, 16);
    ctx.lineTo(-58, -16);
    ctx.lineTo(-38, -28);
    ctx.lineTo(-22, -12);
    ctx.lineTo(-26, 14);
    ctx.closePath();
    ctx.fill();
  }

  if (profile.atoll) {
    ctx.strokeStyle = "rgba(100, 184, 155, 0.52)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(profile.isletOffsetX || -10, profile.isletOffsetY || -2, (profile.isletRx || 68) - 22, (profile.isletRy || 24) - 8, -0.08, 0, Math.PI * 2);
    ctx.stroke();
  }
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
  ctx.moveTo(17, 0);
  ctx.lineTo(8, -5);
  ctx.lineTo(-10, -6);
  ctx.lineTo(-17, 0);
  ctx.lineTo(-10, 6);
  ctx.lineTo(8, 5);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-2, -6);
  ctx.lineTo(-2, 7);
  ctx.moveTo(-2, -5);
  ctx.lineTo(7, -1);
  ctx.lineTo(-2, 2);
  ctx.stroke();
}

function drawDinghyHull() {
  ctx.beginPath();
  ctx.moveTo(13, 0);
  ctx.lineTo(4, -4);
  ctx.lineTo(-10, -4);
  ctx.lineTo(-16, 0);
  ctx.lineTo(-10, 4);
  ctx.lineTo(4, 4);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-1, -5);
  ctx.lineTo(-1, 5);
  ctx.moveTo(-1, -4);
  ctx.lineTo(5, -1);
  ctx.lineTo(-1, 1);
  ctx.stroke();
}

function drawCutterHull() {
  ctx.beginPath();
  ctx.moveTo(19, 0);
  ctx.lineTo(8, -7);
  ctx.lineTo(-13, -8);
  ctx.lineTo(-19, 0);
  ctx.lineTo(-13, 8);
  ctx.lineTo(8, 7);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-4, -9);
  ctx.lineTo(-4, 9);
  ctx.moveTo(-4, -8);
  ctx.lineTo(10, -2);
  ctx.lineTo(-4, 2);
  ctx.moveTo(-10, -6);
  ctx.lineTo(-10, 6);
  ctx.moveTo(-10, -5);
  ctx.lineTo(-2, -1);
  ctx.lineTo(-10, 2);
  ctx.stroke();
}

function drawRaiderHull() {
  ctx.beginPath();
  ctx.moveTo(19, 0);
  ctx.lineTo(5, -6);
  ctx.lineTo(-11, -9);
  ctx.lineTo(-19, -3);
  ctx.lineTo(-15, 0);
  ctx.lineTo(-19, 3);
  ctx.lineTo(-11, 9);
  ctx.lineTo(5, 6);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-6, -10);
  ctx.lineTo(-6, 10);
  ctx.moveTo(-6, -9);
  ctx.lineTo(9, -1);
  ctx.lineTo(-6, 3);
  ctx.moveTo(2, -7);
  ctx.lineTo(2, 7);
  ctx.moveTo(2, -6);
  ctx.lineTo(10, -2);
  ctx.lineTo(2, 1);
  ctx.stroke();
}

function drawCorvetteHull() {
  ctx.beginPath();
  ctx.moveTo(22, 0);
  ctx.lineTo(12, -7);
  ctx.lineTo(-7, -10);
  ctx.lineTo(-20, -6);
  ctx.lineTo(-20, 6);
  ctx.lineTo(-7, 10);
  ctx.lineTo(12, 7);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-8, -12);
  ctx.lineTo(-8, 12);
  ctx.moveTo(-8, -11);
  ctx.lineTo(4, -3);
  ctx.lineTo(-8, 2);
  ctx.moveTo(3, -9);
  ctx.lineTo(3, 9);
  ctx.moveTo(3, -8);
  ctx.lineTo(12, -2);
  ctx.lineTo(3, 2);
  ctx.moveTo(-14, -5);
  ctx.lineTo(14, -5);
  ctx.moveTo(-14, 5);
  ctx.lineTo(14, 5);
  ctx.stroke();
}

function drawPatrolHull() {
  ctx.beginPath();
  ctx.moveTo(17, 0);
  ctx.lineTo(6, -7);
  ctx.lineTo(-9, -7);
  ctx.lineTo(-17, -3);
  ctx.lineTo(-17, 3);
  ctx.lineTo(-9, 7);
  ctx.lineTo(6, 7);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-5, -10);
  ctx.lineTo(-5, 10);
  ctx.moveTo(-5, -9);
  ctx.lineTo(4, -2);
  ctx.lineTo(-5, 2);
  ctx.moveTo(4, -7);
  ctx.lineTo(4, 7);
  ctx.moveTo(4, -6);
  ctx.lineTo(11, -2);
  ctx.lineTo(4, 1);
  ctx.stroke();
}

function drawTraderHull() {
  ctx.beginPath();
  ctx.moveTo(16, 0);
  ctx.lineTo(8, -7);
  ctx.lineTo(-6, -8);
  ctx.lineTo(-18, -4);
  ctx.lineTo(-18, 4);
  ctx.lineTo(-6, 8);
  ctx.lineTo(8, 7);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-10, -10);
  ctx.lineTo(-10, 10);
  ctx.moveTo(-10, -9);
  ctx.lineTo(2, -3);
  ctx.lineTo(-10, 1);
  ctx.moveTo(0, -9);
  ctx.lineTo(0, 9);
  ctx.moveTo(0, -8);
  ctx.lineTo(11, -2);
  ctx.lineTo(0, 2);
  ctx.rect(-12, -4, 8, 8);
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

function activeEmoteConfig(member) {
  if (!member?.activeEmote || (member.emoteTimer || 0) <= 0) return null;
  return FLIGHT_EMOTES.find((emote) => emote.id === member.activeEmote) || null;
}

function activeEmoteProgress(member) {
  const duration = member.emoteDuration || DEFAULT_EMOTE_DURATION;
  return clamp(1 - (member.emoteTimer || 0) / duration, 0, 1);
}

function playerDrawAngle(member) {
  const emote = activeEmoteConfig(member);
  if (emote?.id !== "willow-spin") return member.angle;
  const progress = activeEmoteProgress(member);
  const eased = 1 - Math.pow(1 - progress, 3);
  return member.angle + Math.PI * 2 * eased;
}

function drawPlayerEmote(member) {
  const emote = activeEmoteConfig(member);
  if (!emote) return;
  const progress = activeEmoteProgress(member);
  const duration = member.emoteDuration || DEFAULT_EMOTE_DURATION;
  const fade = clamp((member.emoteTimer || 0) / Math.min(duration, 0.36), 0, 1);
  const color = emote.color || member.accent || "#aef4d5";
  const seed = member.emoteSeed || 0;

  ctx.save();
  ctx.translate(member.x, member.y);
  ctx.globalAlpha = fade;
  if (emote.id === "lantern-bloom") {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 18 + progress * 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = fade * 0.2;
    ctx.beginPath();
    ctx.arc(0, 0, 11 + progress * 12, 0, Math.PI * 2);
    ctx.fill();
  } else if (emote.id === "willow-spin") {
    ctx.rotate(seed + progress * Math.PI * 4);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, 0, 25, -0.35, Math.PI * 0.92);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 17, Math.PI * 1.04, Math.PI * 1.86);
    ctx.stroke();
  } else if (emote.id === "moon-glow") {
    ctx.fillStyle = color;
    ctx.globalAlpha = fade * 0.18;
    ctx.beginPath();
    ctx.arc(0, 0, 32 - progress * 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = fade * 0.72;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, 18 + Math.sin(progress * Math.PI) * 8, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.fillStyle = color;
    for (let index = 0; index < 8; index += 1) {
      const angle = seed + progress * Math.PI * 2 + (Math.PI * 2 * index) / 8;
      const radius = 20 + Math.sin(progress * Math.PI) * 10;
      ctx.globalAlpha = fade * (0.42 + (index % 2) * 0.24);
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * radius, Math.sin(angle) * radius, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
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
  ctx.fillStyle = "#06100c";
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
    drawShip(escortX, escortY, escortAngle, "#b8e194", 0.75, false, escort.hullId || "cutter");
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
    ctx.strokeStyle = ship.disposition === "hostile" ? "rgba(90, 40, 26, 0.28)" : "rgba(241, 248, 230, 0.12)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(ship.x, ship.y + 12, 16, 5, 0, 0, Math.PI * 2);
    ctx.stroke();
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
    for (const member of partyMembers()) {
      if ((member.shieldFlash || 0) > 0.02) {
        const alpha = Math.min(0.72, member.shieldFlash * 0.72);
        ctx.strokeStyle = `rgba(121, 216, 255, ${alpha})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(member.x, member.y, 19, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (Math.hypot(member.vx, member.vy) > 24) {
        ctx.strokeStyle = "rgba(121, 216, 255, 0.45)";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(
          member.x - Math.cos(member.angle) * 12,
          member.y - Math.sin(member.angle) * 12
        );
        ctx.lineTo(
          member.x - Math.cos(member.angle) * 24,
          member.y - Math.sin(member.angle) * 24
        );
        ctx.stroke();
      }
      ctx.strokeStyle = member === state.player ? "rgba(244, 247, 231, 0.16)" : "rgba(191, 224, 181, 0.14)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.ellipse(member.x, member.y + 12, 18, 6, 0, 0, Math.PI * 2);
      ctx.stroke();
      drawPlayerEmote(member);
      drawShip(member.x, member.y, playerDrawAngle(member), member.tint || "#eef7df", member === state.player ? 1 : 0.94, false, member.hullId);
      ctx.fillStyle = member.accent || "#9fe0a8";
      ctx.font = "10px Avenir Next, Segoe UI, sans-serif";
      ctx.fillText(member.name, member.x - 22, member.y - 22);
    }
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
  ctx.fillStyle = "rgba(191, 203, 179, 0.96)";
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
  ctx.fillStyle = "rgba(10, 16, 12, 0.9)";
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
  const palette = currentSector().palette;
  const profile = currentIslandProfile();
  const water = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  water.addColorStop(0, profile.waterTop);
  water.addColorStop(0.38, profile.waterMid);
  water.addColorStop(1, profile.waterBottom);
  ctx.fillStyle = water;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const lightPatch = ctx.createRadialGradient(WIDTH * 0.82, HEIGHT * 0.16, 8, WIDTH * 0.82, HEIGHT * 0.16, 180);
  lightPatch.addColorStop(0, "rgba(232, 244, 214, 0.3)");
  lightPatch.addColorStop(0.35, "rgba(179, 233, 232, 0.16)");
  lightPatch.addColorStop(1, "rgba(179, 233, 232, 0)");
  ctx.fillStyle = lightPatch;
  ctx.fillRect(WIDTH * 0.56, 0, WIDTH * 0.44, HEIGHT * 0.5);

  ctx.fillStyle = "rgba(238, 248, 255, 0.08)";
  ctx.beginPath();
  ctx.ellipse(WIDTH * 0.82, HEIGHT * 0.2, 118, 38, -0.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(238, 248, 255, 0.04)";
  ctx.beginPath();
  ctx.ellipse(WIDTH * 0.78, HEIGHT * 0.28, 164, 54, -0.2, 0, Math.PI * 2);
  ctx.fill();

  const shoals = [
    [0.11, 0.72, 0.11, 0.034, -0.18],
    [0.2, 0.6, 0.08, 0.026, 0.1],
    [0.88, 0.74, 0.14, 0.04, -0.08],
    [0.72, 0.42, 0.09, 0.03, 0.22],
  ];
  ctx.fillStyle = "rgba(205, 223, 161, 0.08)";
  shoals.forEach(([x, y, rx, ry, rotation]) => {
    ctx.beginPath();
    ctx.ellipse(WIDTH * x, HEIGHT * y, WIDTH * rx, HEIGHT * ry, rotation, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.strokeStyle = "rgba(214, 244, 255, 0.1)";
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 10; i += 1) {
    const y = HEIGHT * 0.16 + i * 44;
    const sway = ((i % 3) - 1) * 18;
    ctx.beginPath();
    ctx.moveTo(WIDTH * 0.03, y);
    ctx.bezierCurveTo(WIDTH * 0.2, y - 12 + sway, WIDTH * 0.52, y + 14 - sway, WIDTH * 0.97, y - 2);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i += 1) {
    const y = HEIGHT * (0.24 + i * 0.11);
    const x = WIDTH * (0.1 + (i % 3) * 0.23);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 26, y - 6, x + 58, y);
    ctx.quadraticCurveTo(x + 84, y + 6, x + 116, y);
    ctx.stroke();
  }

  const driftClusters = [
    [0.16, 0.78, 1],
    [0.9, 0.58, 0.8],
    [0.08, 0.3, 0.72],
    [0.68, 0.86, 0.86],
  ];
  driftClusters.forEach(([x, y, scale]) => {
    ctx.fillStyle = "rgba(33, 58, 38, 0.36)";
    ctx.beginPath();
    ctx.ellipse(WIDTH * x, HEIGHT * y, 14 * scale, 6 * scale, 0.12, 0, Math.PI * 2);
    ctx.ellipse(WIDTH * x + 11 * scale, HEIGHT * y - 5 * scale, 9 * scale, 4 * scale, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(154, 195, 128, 0.22)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(WIDTH * x - 6 * scale, HEIGHT * y - 3 * scale);
    ctx.lineTo(WIDTH * x + 6 * scale, HEIGHT * y + 4 * scale);
    ctx.stroke();
  });

  if (profile.chain) {
    ctx.fillStyle = "rgba(227, 212, 153, 0.68)";
    ctx.beginPath();
    ctx.ellipse(WIDTH * 0.62, HEIGHT * 0.32, 36, 12, -0.08, 0, Math.PI * 2);
    ctx.ellipse(WIDTH * 0.67, HEIGHT * 0.35, 28, 10, 0.04, 0, Math.PI * 2);
    ctx.ellipse(WIDTH * 0.58, HEIGHT * 0.38, 24, 8, 0.02, 0, Math.PI * 2);
    ctx.fill();
  }

  if (profile.cliff) {
    ctx.fillStyle = "rgba(79, 70, 58, 0.48)";
    ctx.beginPath();
    ctx.moveTo(WIDTH * 0.83, HEIGHT * 0.12);
    ctx.lineTo(WIDTH * 0.87, HEIGHT * 0.08);
    ctx.lineTo(WIDTH * 0.9, HEIGHT * 0.15);
    ctx.lineTo(WIDTH * 0.88, HEIGHT * 0.23);
    ctx.lineTo(WIDTH * 0.82, HEIGHT * 0.2);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = "rgba(255,255,255,0.05)";
  for (let i = 0; i < 18; i += 1) {
    const x = ((i * 67.3) % WIDTH) + 10;
    const y = HEIGHT * 0.16 + (i % 8) * 58;
    ctx.beginPath();
    ctx.arc(x % WIDTH, y, 1.2 + (i % 3) * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTravelOverlay() {
  if (!state.travelSequence) return;
  const sequence = state.travelSequence;
  const departPhase = sequence.phase === "depart";
  const progress = clamp(sequence.time / (departPhase ? sequence.departDuration : sequence.arrivalDuration), 0, 1);
  const legLabel = sequence.totalLegs > 1 ? `Leg ${Math.min(sequence.totalLegs, sequence.legIndex + 1)} / ${sequence.totalLegs}` : "Single crossing";
  const remainingRoute = routeSummaryLabel(sequence.routeIds.slice(Math.min(sequence.legIndex, sequence.routeIds.length - 1)));
  const remainingFuel = Math.max(0, state.player.fuel);

  ctx.save();
  const centerX = state.player.x;
  const centerY = state.player.y;
  ctx.fillStyle = departPhase ? "rgba(189, 229, 232, 0.08)" : "rgba(227, 241, 255, 0.05)";
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, 220, 92, -0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = departPhase ? "rgba(214, 244, 255, 0.12)" : "rgba(244, 248, 255, 0.1)";
  ctx.lineWidth = 1.4;
  for (let index = 0; index < 6; index += 1) {
    const y = centerY - 92 + index * 36 + ((sequence.time * 18 + index * 7) % 10);
    ctx.beginPath();
    ctx.moveTo(centerX - 280, y);
    ctx.bezierCurveTo(centerX - 120, y - 12, centerX + 80, y + 14, centerX + 280, y - 2);
    ctx.stroke();
  }

  for (const member of partyMembers()) {
    const wakeLength = 18 + Math.min(26, Math.hypot(member.vx, member.vy) * 0.05);
    ctx.strokeStyle = "rgba(191, 236, 255, 0.32)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(
      member.x - Math.cos(member.angle) * 12,
      member.y - Math.sin(member.angle) * 12
    );
    ctx.lineTo(
      member.x - Math.cos(member.angle) * wakeLength,
      member.y - Math.sin(member.angle) * wakeLength
    );
    ctx.stroke();
  }

  ctx.fillStyle = "#eef7ff";
  ctx.font = "700 18px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText(
    departPhase ? `Sailing to ${SECTORS[sequence.toSectorId].name}` : `Making shore at ${currentSector().name}`,
    28,
    HEIGHT - 54,
  );
  ctx.fillStyle = "#9dc0d6";
  ctx.font = "13px Avenir Next, Segoe UI, sans-serif";
  wrapText(
    departPhase
      ? `${legLabel}. ${sequence.totalLegs > 1 ? `${remainingRoute}. ${routeWaypointLabel(sequence.routeIds.slice(Math.min(sequence.legIndex, sequence.routeIds.length - 1)))}. ` : ""}The flotilla keeps a steady line through the channel. Supplies remaining on arrival: ${remainingFuel}.`
      : sequence.totalLegs > 1
        ? `Final arrival after ${jumpCountLabel(sequence.totalLegs)}. The four boats drift out of the crossing together and ${currentSector().name} rises ahead through the mist.`
        : "Crossing complete. Your boats settle back into the local waterway and the channel quiets around you.",
    28,
    HEIGHT - 32,
    420,
    16,
  );
  ctx.restore();
}

function drawDockBackdrop() {
  ctx.save();
  ctx.fillStyle = "rgba(8, 13, 10, 0.96)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawStars();
  drawSectorBackdrop();
  drawStation();
  ctx.strokeStyle = "rgba(244, 247, 231, 0.14)";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.ellipse(currentSector().station.x + 68, currentSector().station.y + 12, 18, 6, 0, 0, Math.PI * 2);
  ctx.stroke();
  drawShip(currentSector().station.x + 68, currentSector().station.y, -Math.PI / 2, "#eef7df", 1, false, state.player.hullId);
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
  const waterGradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  waterGradient.addColorStop(0, "rgba(6, 20, 31, 0.94)");
  waterGradient.addColorStop(0.5, "rgba(7, 34, 48, 0.9)");
  waterGradient.addColorStop(1, "rgba(5, 18, 26, 0.96)");
  ctx.fillStyle = waterGradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = "rgba(122, 203, 228, 0.08)";
  ctx.lineWidth = 1;
  for (let y = 112; y < HEIGHT - 24; y += 42) {
    ctx.beginPath();
    ctx.moveTo(26, y);
    ctx.bezierCurveTo(WIDTH * 0.28, y - 8, WIDTH * 0.7, y + 8, WIDTH - 24, y - 2);
    ctx.stroke();
  }

  ctx.fillStyle = "#eef7ff";
  ctx.font = "700 28px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText("Island Chart", 42, 56);
  ctx.fillStyle = "#a9ccd5";
  ctx.font = "14px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText("North toggles the chart, south confirms a crossing, and B backs out. Plot routes over blue water and watch the channels light up.", 42, 78);

  ctx.save();
  ctx.translate(state.starmapCamera.x, state.starmapCamera.y);
  drawStarmapSingularities();
  for (const node of STAR_MAP) {
    if (!sectorIsKnown(node.id) && node.id !== state.currentSectorId) continue;
    const sector = SECTORS[node.id];
    for (const neighborId of sector.neighbors) {
      if (!sectorIsKnown(neighborId) && neighborId !== state.currentSectorId) continue;
      if (neighborId < node.id) continue;
      const neighborNode = STAR_MAP.find((entry) => entry.id === neighborId);
      if (!neighborNode) continue;
      drawWaterwayLane(node, neighborNode, mapLaneStroke(node.id, neighborId));
    }
  }

  for (const node of STAR_MAP) {
    if (!sectorIsKnown(node.id) && node.id !== state.currentSectorId) continue;
    const selected = selectedStarmapSectorId() === node.id;
    const contractLabel = contractBadgeShort(node.id);
    const point = starmapNodePoint(node);
    const radius = starmapNodeRadius(node.id);
    ctx.fillStyle = "rgba(52, 120, 132, 0.22)";
    ctx.beginPath();
    ctx.ellipse(point.x, point.y + 10, radius + 12, radius * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ecd5a1";
    ctx.beginPath();
    ctx.ellipse(point.x, point.y, radius + 4, radius - 1, -0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = mapNodeFill(node.id, selected);
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius - 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = selected ? "rgba(186, 229, 240, 0.9)" : "rgba(28, 55, 61, 0.48)";
    ctx.lineWidth = selected ? 2.4 : 1.8;
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius + 5, 0, Math.PI * 2);
    ctx.stroke();
    if (authoritySector(node.id)) {
      ctx.strokeStyle = node.id === state.currentSectorId ? "rgba(255, 217, 128, 0.9)" : "rgba(192, 209, 255, 0.72)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius + 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#ffd980";
      ctx.fillRect(point.x - 2, point.y - 20, 4, 4);
    }
    ctx.fillStyle = "#eef7ff";
    ctx.font = "16px Avenir Next, Segoe UI, sans-serif";
    ctx.fillText(SECTORS[node.id].name, point.x + 16, point.y + 5);
    if (contractLabel) {
      const badgeX = point.x - 14;
      const badgeY = point.y - 28;
      const badgeWidth = Math.max(48, ctx.measureText(contractLabel).width + 18);
      ctx.fillStyle = "rgba(255, 207, 116, 0.94)";
      ctx.beginPath();
      ctx.rect(badgeX, badgeY, badgeWidth, 20);
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
  ctx.fillStyle = "rgba(9, 29, 44, 0.82)";
  ctx.strokeStyle = "rgba(173, 214, 224, 0.22)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.rect(panelX, panelY, panelW, panelH);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(240, 226, 191, 0.08)";
  ctx.strokeRect(panelX + 10, panelY + 10, panelW - 20, panelH - 20);

  const selectedSector = selectedSectorId ? SECTORS[selectedSectorId] : null;
  const panelTitle = selectedSector?.name || "Trail Map";
  ctx.fillStyle = "#eef7ff";
  ctx.font = "700 18px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText(panelTitle, panelX + 18, panelY + 28);
  ctx.fillStyle = "#afbea3";
  ctx.font = "13px Avenir Next, Segoe UI, sans-serif";
  const selectedPlan = selectedSector ? travelPlanForSector(selectedSector.id) : null;
  const summaryText = selectedSector
    ? (selectedPlan?.blockedReason
        ? `${selectedSector.name} is ${selectedPlan.jumpCount ? `${jumpCountLabel(selectedPlan.jumpCount)} away` : "on the map"}, but ${selectedPlan.blockedReason}.`
        : selectedPlan?.jumpCount
          ? `${selectedSector.name} is ${jumpCountLabel(selectedPlan.jumpCount)} away. ${selectedPlan.waypointLabel}.`
          : `${selectedSector.name} is already underfoot.`)
    : "Chart view across every active promise your party is carrying.";
  wrapText(summaryText, panelX + 18, panelY + 50, panelW - 36, 16);

  let cardY = panelY + 86;
  const lines = state.activeContracts.length ? state.activeContracts.slice(0, 5) : [];
  if (!lines.length) {
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fillRect(panelX + 14, cardY, panelW - 28, 62);
    ctx.fillStyle = "#c7d7e4";
    ctx.font = "600 14px Avenir Next, Segoe UI, sans-serif";
    wrapText("No active quests yet. Take on a thread that matters and the trail map will start calling out where to go next.", panelX + 26, cardY + 24, panelW - 52, 18);
    ctx.restore();
    return;
  }

  for (const contract of lines) {
    const destinationName = SECTORS[contract.destinationId]?.name || "Unknown";
    const highlighted = contract.destinationId === selectedSectorId;
    ctx.fillStyle = highlighted ? "rgba(255, 207, 116, 0.14)" : "rgba(255,255,255,0.04)";
    ctx.strokeStyle = highlighted ? "rgba(255, 207, 116, 0.52)" : "rgba(121, 216, 255, 0.12)";
    ctx.fillRect(panelX + 14, cardY, panelW - 28, 42);
    ctx.strokeRect(panelX + 14, cardY, panelW - 28, 42);
    ctx.fillStyle = highlighted ? "#fff2cf" : "#eef7ff";
    ctx.font = "700 14px Avenir Next, Segoe UI, sans-serif";
    ctx.fillText(contract.title.slice(0, 32), panelX + 26, cardY + 18);
    ctx.fillStyle = highlighted ? "#ffd88b" : "#8ea4b6";
    ctx.font = "12px Avenir Next, Segoe UI, sans-serif";
    const tags = Array.isArray(contract.tags) && contract.tags.length ? ` • ${displayTags(contract.tags)}` : "";
    ctx.fillText(`${destinationName}${tags}`, panelX + 26, cardY + 33);
    cardY += 52;
  }

  ctx.fillStyle = "#d8c279";
  ctx.font = "12px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText("Amber channels mark the route under your cursor.", panelX + 18, panelY + panelH - 16);
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
  syncPartyState();
  const actionLocked = performance.now() < state.actionLockUntil;
  const now = performance.now();
  const flightInputs = partyMembers().map((_, index) => readFlightInputForSlot(index));
  partyMembers().forEach((member, index) => {
    if (index === 0) return;
    if (!slotHasDirectController(index) && member.hull > 0) {
      member.autopilotEnabled = true;
    }
  });
  syncAutopilotAggregate();
  const leadInput = flightInputs[0];
  const moveX = leadInput.moveX;
  const moveY = leadInput.moveY;

  if (!actionLocked && leadInput.chill) {
    toggleAutopilot(state.player, 0);
  }
  if (!actionLocked && leadInput.emote) {
    triggerFlightEmote(state.player, 0);
  }

  if (autopilotManualIntent(leadInput) && state.player.autopilotEnabled) {
    disableAutopilot({ player: state.player, message: "Manual control restored." });
  }

  if (autopilotManualIntent(leadInput)) {
    state.player.lastActiveAt = now;
  }

  if (state.player.autopilotEnabled) {
    updateAutopilot(state.player, 0, flightInputs, now, dt);
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
  resolveIslandCollision(state.player);
  state.player.fireCooldown = Math.max(0, state.player.fireCooldown - dt);
  rechargeShield(state.player, maxShield(), currentHull().shieldRegen, dt);

  if (!actionLocked && leadInput.fire) {
    if (storyAdventureMode()) {
      sendLanternPulse(state.player, 0);
    } else {
      firePlayerShot();
    }
  }
  if (!actionLocked && leadInput.map) {
    focusControllerForSlot(0);
    state.activePartyMemberIndex = 0;
    openStarmap("flight");
    keyboard.map = false;
    return;
  }
  if (!actionLocked && leadInput.interact) {
    focusControllerForSlot(0);
    keyboard.interact = false;
    const stationDistance = distance(state.player, currentSector().station);
    if (stationDistance <= INTERACT_RANGE) {
      state.activePartyMemberIndex = 0;
      enterDockMode("Mooring line set. Back at shore.");
      return;
    }
    tryBoardNearestShip(state.player, 0);
  }
  if (keyboard.pause) {
    keyboard.pause = false;
    focusControllerForSlot(0);
    state.activePartyMemberIndex = 0;
    openStarmap("flight", preferredMissionDestination());
    return;
  }

  for (let index = 1; index < partyMembers().length; index += 1) {
    const member = partyMember(index);
    const input = flightInputs[index];
    if (!actionLocked && input.chill) {
      toggleAutopilot(member, index);
    }
    if (!actionLocked && input.emote) {
      triggerFlightEmote(member, index);
    }
    if (autopilotManualIntent(input) && member.autopilotEnabled) {
      disableAutopilot({ player: member, message: `${member.name} returns to manual sailing.` });
    }
    if (autopilotManualIntent(input)) {
      member.lastActiveAt = now;
    }
    if (moveX || moveY) {
      // keep followers in world even when only player one is steering
    }
    if (member.autopilotEnabled) {
      updateAutopilot(member, index, flightInputs, now, dt);
    } else if (input.moveX || input.moveY) {
      member.angle = Math.atan2(input.moveY, input.moveX);
      member.vx += Math.cos(member.angle) * playerHullFor(member).accel * dt;
      member.vy += Math.sin(member.angle) * playerHullFor(member).accel * dt;
    }
    member.vx *= playerHullFor(member).friction;
    member.vy *= playerHullFor(member).friction;
    const memberSpeed = Math.hypot(member.vx, member.vy);
    if (memberSpeed > playerHullFor(member).maxSpeed) {
      member.vx = (member.vx / memberSpeed) * playerHullFor(member).maxSpeed;
      member.vy = (member.vy / memberSpeed) * playerHullFor(member).maxSpeed;
    }
    member.x += member.vx * dt;
    member.y += member.vy * dt;
    wrapBody(member);
    resolveIslandCollision(member);
    member.fireCooldown = Math.max(0, member.fireCooldown - dt);
    rechargeShield(member, playerMaxShield(member), playerHullFor(member).shieldRegen, dt);
    if (!actionLocked && input.fire) {
      if (storyAdventureMode()) {
        sendLanternPulse(member, index);
      } else {
        firePlayerShot(member, index);
      }
    }
    if (!actionLocked && input.map) {
      focusControllerForSlot(index);
      state.activePartyMemberIndex = index;
      openStarmap("flight");
      return;
    }
    if (!actionLocked && input.interact && distance(member, currentSector().station) <= INTERACT_RANGE) {
      focusControllerForSlot(index);
      state.activePartyMemberIndex = index;
      enterDockMode(`${member.name} brings the flotilla to shore.`);
      return;
    }
    if (!actionLocked && input.interact) {
      focusControllerForSlot(index);
      tryBoardNearestShip(member, index);
      if (state.popup?.style === "boarding") {
        return;
      }
    }
  }
  syncAutopilotAggregate();
}

function updateEnemyShips(dt) {
  const storyMode = storyAdventureMode();
  if (playerIsInEscapePod()) {
    for (const ship of state.enemyShips) {
      if (!ship.disabled) {
        ship.disposition = storyMode || ship.type === "patrol" ? "neutral" : ship.disposition === "hostile" ? "suspicious" : ship.disposition;
        ship.contactState = ship.disabled ? "boardable" : ship.disposition;
      }
    }
    return;
  }
  for (const ship of state.enemyShips) {
    ship.fireCooldown -= dt;
    rechargeShield(ship, ship.maxShield, ship.shieldRegen, dt);
    const target = nearestPartyMemberTo(ship);
    const targetAngle = angleTo(ship, target);
    if (!ship.disabled) {
      const nearby = distance(ship, target);
      if (storyMode) {
        ship.disposition = "neutral";
      } else if (ship.type === "patrol" && lawfulSector() && nearby < 180 && hasContraband()) {
        ship.disposition = nearby < 120 ? "hostile" : "suspicious";
      } else if (ship.type === "patrol" && currentSectorRep() <= -10 && nearby < 180) {
        ship.disposition = nearby < 140 ? "hostile" : "suspicious";
      } else if (ship.type === "pirate" && ship.disposition === "neutral" && nearby < 170 && currentSector().danger > 0.5) {
        ship.disposition = "suspicious";
      }

      if (!storyMode && ship.type === "patrol" && lawfulSector() && nearby < SCAN_RANGE && state.scanCooldown <= 0) {
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
      resolveIslandCollision(ship, { margin: 6 });
      if (!storyMode && ship.fireCooldown <= 0 && ship.disposition === "hostile" && ship.type !== "trader" && nearby < 260) {
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
      resolveIslandCollision(ship, { margin: 6 });
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
    resolveIslandCollision(escortState, { margin: 4 });
    escortState.fireCooldown = Math.max(0, (escortState.fireCooldown || 0) - dt);
  });

  if (!allowCombat || storyAdventureMode()) return;

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
    } else if (!playerIsInEscapePod()) {
      for (let index = 0; index < partyMembers().length; index += 1) {
        const member = partyMember(index);
        if (distance(bullet, member) <= 14) {
          applyDamageToTarget(member, bullet.damage, "#79d8ff", bullet.color);
          bullet.life = 0;
          if (index === 0) {
            setStatus(`Taking fire in ${currentSector().name}. Shields ${Math.round((state.player.shield / maxShield()) * 100)}%, ship ${Math.round((state.player.hull / maxHull()) * 100)}%.`);
            if (state.player.hull <= 0) {
              loseShip();
              return;
            }
          } else if (member.hull <= 0) {
            member.hull = Math.max(1, playerMaxHull(member) * 0.4);
            member.shield = Math.max(0, playerMaxShield(member) * 0.35);
            member.x = state.player.x;
            member.y = state.player.y;
            setStatus(`${member.name}'s boat was forced back into formation.`);
          }
          break;
        }
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
  updatePlayerEmotes(dt);
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
    syncPartyFormationToLead(true);

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
        syncPartyFormationToLead(true);
        sequence.phase = "arrival";
        sequence.time = 0;
        setStatus(`Crossing complete at ${currentSector().name}.`, { tag: "Crossing" });
        setHint("You skim through the reeds, then settle back into the local waterway.");
      } else {
        sequence.fromSectorId = state.currentSectorId;
        sequence.toSectorId = sequence.routeIds[sequence.legIndex + 1];
        sequence.time = 0;
        setTravelDeparturePose();
        setStatus(`Course holds past ${currentSector().name}. ${jumpCountLabel(sequence.totalLegs - sequence.legIndex)} remain to ${SECTORS[sequence.finalSectorId].name}.`, { tag: "Crossing" });
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
  syncPartyFormationToLead(true);

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
    const replies = menuEntries();
    if (intent.scroll !== 0) {
      state.threadScrollOffset = clamp(
        (Number.isFinite(state.threadScrollOffset) ? state.threadScrollOffset : state.threadScrollMax) + intent.scroll * THREAD_SCROLL_STEP,
        0,
        state.threadScrollMax,
      );
    } else if (intent.reply !== 0) {
      state.threadReplyIndex = clamp(currentThreadReplyIndex(replies) + intent.reply, 0, replies.length - 1);
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
      enterFlightMode("Casting off from the quay.");
      return;
    }
  }

  if (confirmPressed) {
    consumeMenuConfirmInput(pad);
    const entry = state.mode === "starmap"
      ? menuEntries().find((item) => item.label === SECTORS[selectedStarmapSectorId()]?.name)
      : state.mode === "dock" && state.dockScreen === "contract-thread"
        ? menuEntries()[currentThreadReplyIndex()]
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
        enterFlightMode("Casting off from the quay.");
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
  syncMusic(dt);

  render();
  drawFlightScene();
  requestAnimationFrame(update);
}

function preferredMissionDestination() {
  const lead = nextStoryLead();
  if (lead?.status === "active" && sectorIsKnown(lead.contract.destinationId)) return lead.contract.destinationId;
  if (lead?.sourceSectorId && lead.sourceSectorId !== state.currentSectorId && sectorIsKnown(lead.sourceSectorId)) return lead.sourceSectorId;
  const active = state.activeContracts.find((contract) => sectorIsKnown(contract.destinationId)) || state.activeContracts[0];
  return active?.destinationId || currentSector().neighbors[0] || null;
}

function missionBriefSummary() {
  if (!state.activeContracts.length) {
    const lead = nextStoryLead();
    if (lead) {
      return `${storyLeadMeta(lead)} Open Get Back on Track while resting to jump straight to the right thread or chart.`;
    }
    return "No active quests yet. Open Messages while resting, take a thread that matters, and the next destination will stop feeling theoretical.";
  }
  return state.activeContracts.slice(0, 4).map((contract, index) => {
    const destination = SECTORS[contract.destinationId]?.name || "Unknown sector";
    const what = contract.type === "cargo" || contract.type === "smuggling"
      ? `Deliver ${commodityById(contract.commodityId)?.name || contract.title}`
      : contract.type === "courier"
        ? "Deliver the note"
        : contract.type === "salvage"
          ? `Search ${contract.requiredBoards || 1} disabled traveler${contract.requiredBoards === 1 ? "" : "s"}`
          : contract.type === "bounty"
            ? `Drive off ${contract.requiredKills || 1} hostile raider${contract.requiredKills === 1 ? "" : "s"}`
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
        label: "Open Trail Map",
        meta: "Trace your next path from the current quest list.",
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
    title: "Encounter Guide",
    copy: "Warden traffic means rules and scrutiny. Traders are ordinary travelers. Smugglers are gray-path runners and Moonglass couriers. Hostile means a creature or traveler has chosen conflict. Suspicious means something is circling, watching, or deciding whether to flee, bargain, or bite.",
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
    title: "Lore Summary",
    copy: `${archiveOverviewCopy()} ${latestRumor ? `Latest quay whisper around ${currentSector().name}: ${latestRumor}` : `No current whisper is logged for ${currentSector().name}.`}`,
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

function openResetProgressFromPause() {
  window.ArcadeCabinet?.closePause?.();
  openPopup({
    title: "Reset Progress",
    copy: "This erases every Whispering Willow save slot on this browser and starts a fresh game at Mangrove House. Story progress, messages, inventory, coins, routes, and unlocked files will be cleared. This cannot be undone.",
    options: [
      {
        label: "Erase and Start Fresh",
        meta: "Delete all saved progress and reload the game.",
        confirm() {
          closePopup();
          resetProgressAndStartFresh();
        },
      },
      {
        label: "Keep Progress",
        meta: "Cancel and return to the game.",
        confirm() {
          closePopup();
          setStatus("Reset cancelled. Your progress is still intact.", { tag: "Reset" });
        },
      },
    ],
  });
}

window.__arcadeCabinetHooks = {
  getPauseActions() {
    return [
      {
        id: "reset-progress",
        label: "Reset Progress",
        run() {
          openResetProgressFromPause();
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
        label: "Open Trail Map",
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
    pauseCurrentMusic();
    autosaveGame();
  } else {
    syncMusic(0.033);
  }
});

window.addEventListener("pagehide", () => {
  autosaveGame();
});

window.addEventListener("beforeunload", () => {
  autosaveGame();
});

seedSectorConditions();
syncPartyState();
loadVoiceManifest();

if (!loadMostRecentGame()) {
  enterDockMode("Resting at Mangrove House. The first crossing begins here.");
}
refreshMissionThreadContacts();
render();
drawFlightScene();
requestAnimationFrame(update);
