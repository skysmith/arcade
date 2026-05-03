import { createArcadeStage } from "../../shared/arcade-stage.js";

const BUILD_NUMBER = "2026.04.25.4";
const SAVE_VERSION = 1;
const SAVE_STORAGE_KEY = "sim-planet:campaign-save:v1";
const WIDTH = 960;
const HEIGHT = 540;
const TWO_PI = Math.PI * 2;
const ORBIT_SCALE_Y = 0.62;
const MOON_ORBIT_SCALE_Y = 0.76;
const FIXED_STEP = 1 / 60;
const MAX_FRAME_STEPS = 8;
const TIME_SCALES = [0.5, 1, 2, 4];
const CYCLE_SECONDS = 10;
const IMPACT_DURATION = 4.35;
const IMPACT_MASS_COST = 7;
const IMPACT_GUIDANCE_STABILITY_COST = 0.8;
const MAX_ACTIVE_IMPACTS = 3;
const EVENT_LOG_LIMIT = 4;
const EVENT_LOG_VISIBLE_LIMIT = 2;
const WARNING_VISIBLE_LIMIT = 1;
const HUD_TEXT_LIMIT = 78;
const HUD_PULSE_MS = 520;
const GAMEPAD_AXIS_DEADZONE = 0.45;
const MAX_PLAYERS = 4;
const MUSIC_FADE_RATE = 0.08;
const MUSIC_CROSSFADE_SECONDS = 4.8;
const PLAYER_COLORS = ["#f4f7ef", "#8ce5f0", "#f1be63", "#bda4ff"];
const TWO_PLAYER_NARROW_STAGE_WIDTH = 720;
const MUSIC_TRACKS = {
  solarRun: {
    title: "Tiny Solar Run",
    file: "./assets/audio/music/tiny-solar-run.mp3",
    volume: 0.22,
  },
  orbitalDrift: {
    title: "Orbital Drift",
    file: "./assets/audio/music/orbital-drift.mp3",
    volume: 0.2,
  },
  solarRunAlt: {
    title: "Tiny Solar Run Alt",
    file: "./assets/audio/music/tiny-solar-run-2.mp3",
    volume: 0.2,
  },
  orbitalDriftAlt: {
    title: "Orbital Drift Alt",
    file: "./assets/audio/music/orbital-drift-2.mp3",
    volume: 0.19,
  },
};
const MUSIC_PLAYLIST = ["solarRun", "orbitalDrift", "solarRunAlt", "orbitalDriftAlt"];
const GAMEPAD_BUTTONS = {
  a: 0,
  b: 1,
  x: 2,
  y: 3,
  lb: 4,
  rb: 5,
  back: 8,
  start: 9,
  dpadUp: 12,
  dpadDown: 13,
  dpadLeft: 14,
  dpadRight: 15,
};
const IMPACT_INTENTS = [
  {
    id: "orbit-lift",
    label: "Orbit Lift",
    orbitDelta: 15,
    spinDelta: 0.11,
    tiltDelta: 0.03,
    stabilityCost: 3.4,
    yield: { mass: 3, volatiles: 1 },
  },
  {
    id: "orbit-brake",
    label: "Orbit Brake",
    orbitDelta: -13,
    spinDelta: -0.09,
    tiltDelta: -0.022,
    stabilityCost: 3.1,
    yield: { mass: 4 },
  },
  {
    id: "spin-up",
    label: "Spin Up",
    orbitDelta: 4,
    spinDelta: 0.25,
    tiltDelta: 0.048,
    stabilityCost: 3.8,
    yield: { volatiles: 2 },
  },
];

const DISCOVERY_COST = { plasma: 8 };
const TRAVEL_COST = { fleet: 1, plasma: 16, population: 3, stability: 6 };
const DISCOVERY_RULES = { cycle: 1, crew: 1, stability: 48, project: { id: "deep-space-relays", level: 1 } };
const TRAVEL_RULES = { crew: 8, fleet: 1, plasma: 16, population: 3, stability: 42, project: { id: "warp-drives", level: 1 } };
const STARTER_ARCHETYPE_ID = "helio-cradle";
const OPENING_BLUEPRINT_ID = "habitat";
const DEFAULT_PLAYER_SELECTION = {
  focusIndex: 3,
  selectedKind: "body",
  selectedLabel: "Morrow",
  impactAsteroidLabel: "Icar-01",
  impactTargetLabel: "Morrow",
  impactIntentIndex: 0,
};
const SYSTEM_ARCHETYPES = [
  {
    id: STARTER_ARCHETYPE_ID,
    label: "Helio Cradle",
    descriptor: "Balanced starter system with stable orbits and mixed resources.",
    opportunity: "Balanced collectors, habitats, and solar lifting keep every build path open.",
    hazard: "Low hazard drift gives operators time to learn impact control.",
    hazardInterval: 44,
    hazardStabilityCost: 2.2,
    hazardEvent: "Micrometeor lane",
    starCore: "#f2c15e",
    starMid: "#f1be63",
    starGlow: "rgba(241, 190, 99, 0)",
    backgroundCore: "#101616",
    stabilityDrift: 0.42,
    cycleMassGain: 2.6,
    resourcePulse: { mass: 1, volatiles: 1, plasma: 1 },
    commandMultipliers: { solarPlasma: 1, solarStability: 1 },
    structureRateMultipliers: {},
  },
  {
    id: "flare-forge",
    label: "Flare Forge",
    descriptor: "Plasma-rich close-orbit system shaped by stellar flare shear.",
    opportunity: "Solar lifting is stronger and shipyards stay plasma-fed.",
    hazard: "Flare shear drains stability faster and punishes long local cycles.",
    hazardInterval: 28,
    hazardStabilityCost: 3.5,
    hazardEvent: "Stellar flare shear",
    starCore: "#fff0b0",
    starMid: "#ff8f5d",
    starGlow: "rgba(255, 143, 93, 0)",
    backgroundCore: "#17100d",
    stabilityDrift: 0.68,
    cycleMassGain: 1.7,
    resourcePulse: { mass: 0.82, volatiles: 0.74, plasma: 1.62 },
    commandMultipliers: { solarPlasma: 1.5, solarStability: 1.45 },
    structureRateMultipliers: {
      "solar-rig": { plasma: 1.55, stability: 1.35 },
      retrofit: { stability: 1.12 },
      collector: { mass: 0.88, volatiles: 0.82 },
    },
    bodies: [
      { key: "inner", label: "Cinder", type: "planet", orbit: 78, orbitScale: 0.7, radius: 9, speed: 0.62, phase: 0.35, spin: 1.82, spinPhase: 0.1, tilt: -0.12, color: "#d88255", accent: "#ffd89b", orbitColor: "rgba(255, 143, 93, 0.24)" },
      { key: "forge", label: "Aurum", type: "planet", orbit: 146, orbitScale: 0.62, radius: 16, speed: 0.34, phase: 1.52, spin: 1.04, spinPhase: 1.2, tilt: 0.24, color: "#c9a35f", accent: "#ffe27d", orbitColor: "rgba(241, 190, 99, 0.22)" },
      { key: "spark", label: "Spark", type: "moon", parentKey: "forge", orbit: 32, orbitScale: 0.76, radius: 5, speed: 1.7, phase: 3.8, spin: 0.66, spinPhase: 0.6, tilt: 0.03, color: "#cfc6b5", accent: "#fff3c6", orbitColor: "rgba(255, 243, 198, 0.18)" },
      { key: "outer", label: "Pyre", type: "planet", orbit: 224, orbitScale: 0.57, radius: 22, speed: 0.21, phase: 3.25, spin: 0.72, spinPhase: 2.1, tilt: -0.28, color: "#a6686b", accent: "#ffc0a4", orbitColor: "rgba(255, 125, 110, 0.18)" },
      { key: "ast-1", label: "Striker", type: "asteroid", orbit: 282, orbitScale: 0.6, radius: 4, speed: 0.16, phase: 0.72, spin: 2.8, spinPhase: 0.8, tilt: 0.16, color: "#b98265", accent: "#ffd1a1", orbitColor: "rgba(255, 143, 93, 0.14)" },
      { key: "ast-2", label: "Skarn", type: "asteroid", orbit: 304, orbitScale: 0.63, radius: 3, speed: 0.13, phase: 2.38, spin: 3.24, spinPhase: 0.3, tilt: -0.18, color: "#8f6b58", accent: "#f0c98d", orbitColor: "rgba(255, 143, 93, 0.12)" },
      { key: "ast-3", label: "Kindle", type: "asteroid", orbit: 326, orbitScale: 0.66, radius: 5, speed: 0.1, phase: 4.5, spin: 2.35, spinPhase: 1.4, tilt: 0.26, color: "#c0946e", accent: "#ffd1a1", orbitColor: "rgba(255, 143, 93, 0.1)" },
    ],
  },
  {
    id: "dark-lens",
    label: "Dark Lens",
    descriptor: "Tidal system with a harvestable black-hole anchor and sparse volatiles.",
    opportunity: "Black-hole harvesting becomes available and exotic matter yields are higher.",
    hazard: "Tidal shear eats stability and makes impacts more expensive to absorb.",
    hazardInterval: 30,
    hazardStabilityCost: 3.8,
    hazardEvent: "Tidal shear pulse",
    starCore: "#dfd4ff",
    starMid: "#846de0",
    starGlow: "rgba(132, 109, 224, 0)",
    backgroundCore: "#0d0b17",
    stabilityDrift: 0.86,
    cycleMassGain: 2.15,
    resourcePulse: { mass: 1.18, volatiles: 0.62, plasma: 0.86 },
    commandMultipliers: { solarPlasma: 0.86, solarStability: 1.12 },
    structureRateMultipliers: {
      "black-hole": { exotic: 1.65, plasma: 1.2, stability: 1.38 },
      collector: { mass: 1.22, volatiles: 0.75 },
      retrofit: { stability: 0.9 },
    },
    bodies: [
      { key: "inner", label: "Sable", type: "planet", orbit: 96, orbitScale: 0.67, radius: 11, speed: 0.48, phase: 0.2, spin: 1.32, spinPhase: 0.5, tilt: -0.21, color: "#6e677e", accent: "#cfc2ff", orbitColor: "rgba(189, 164, 255, 0.22)" },
      { key: "lens", label: "Eidolon", type: "planet", orbit: 172, orbitScale: 0.6, radius: 18, speed: 0.28, phase: 1.8, spin: 0.86, spinPhase: 1.1, tilt: 0.32, color: "#52647f", accent: "#8ce5f0", orbitColor: "rgba(140, 229, 240, 0.18)" },
      { key: "umbra", label: "Umbra", type: "moon", parentKey: "lens", orbit: 42, orbitScale: 0.78, radius: 6, speed: 1.05, phase: 4.15, spin: 0.42, spinPhase: 1.5, tilt: 0.08, color: "#8b8197", accent: "#e6deff", orbitColor: "rgba(230, 222, 255, 0.15)" },
      { key: "outer", label: "Meridian", type: "planet", orbit: 246, orbitScale: 0.56, radius: 21, speed: 0.18, phase: 3.35, spin: 0.62, spinPhase: 2.4, tilt: -0.38, color: "#5e7b86", accent: "#a8e6f0", orbitColor: "rgba(168, 230, 240, 0.16)" },
      { key: "maw", label: "Maw", type: "black-hole", orbit: 336, orbitScale: 0.55, radius: 15, speed: 0.045, phase: 5.2, spin: 1.15, spinPhase: 0, tilt: 0, color: "#050407", accent: "#d7c6ff", orbitColor: "rgba(215, 198, 255, 0.13)" },
      { key: "ast-1", label: "Shard", type: "asteroid", orbit: 286, orbitScale: 0.61, radius: 5, speed: 0.12, phase: 0.72, spin: 2.4, spinPhase: 0.4, tilt: -0.1, color: "#7e7287", accent: "#d7c6ff", orbitColor: "rgba(215, 198, 255, 0.12)" },
      { key: "ast-2", label: "Grav", type: "asteroid", orbit: 312, orbitScale: 0.64, radius: 4, speed: 0.095, phase: 2.45, spin: 2.9, spinPhase: 0.9, tilt: 0.18, color: "#665a73", accent: "#cfc2ff", orbitColor: "rgba(215, 198, 255, 0.1)" },
      { key: "ast-3", label: "Rift", type: "asteroid", orbit: 358, orbitScale: 0.58, radius: 3, speed: 0.072, phase: 4.62, spin: 3.1, spinPhase: 1.6, tilt: -0.22, color: "#554d64", accent: "#cfc2ff", orbitColor: "rgba(215, 198, 255, 0.09)" },
    ],
  },
  {
    id: "ice-drift",
    label: "Ice Drift",
    descriptor: "Volatile-heavy outer system with slow orbits and brittle asteroid fields.",
    opportunity: "Habitats and retrofits are easier to sustain with abundant volatiles.",
    hazard: "Dim plasma income slows shipyards unless solar rigs are protected.",
    hazardInterval: 40,
    hazardStabilityCost: 2.6,
    hazardEvent: "Ice debris front",
    starCore: "#d7fbff",
    starMid: "#75c8d8",
    starGlow: "rgba(117, 200, 216, 0)",
    backgroundCore: "#071317",
    stabilityDrift: 0.5,
    cycleMassGain: 2.35,
    resourcePulse: { mass: 0.94, volatiles: 1.72, plasma: 0.58 },
    commandMultipliers: { solarPlasma: 0.68, solarStability: 0.8 },
    structureRateMultipliers: {
      habitat: { crew: 1.3, volatiles: 1.15, stability: 1.15 },
      retrofit: { stability: 1.35, volatiles: 1.15 },
      "solar-rig": { plasma: 0.72, stability: 0.78 },
    },
    bodies: [
      { key: "inner", label: "Rime", type: "planet", orbit: 104, orbitScale: 0.66, radius: 12, speed: 0.4, phase: 0.42, spin: 0.96, spinPhase: 0.2, tilt: -0.09, color: "#8fb8c4", accent: "#d7fbff", orbitColor: "rgba(140, 229, 240, 0.2)" },
      { key: "reef", label: "Pelagos", type: "planet", orbit: 178, orbitScale: 0.61, radius: 19, speed: 0.24, phase: 1.66, spin: 0.7, spinPhase: 1.7, tilt: 0.2, color: "#5f91a0", accent: "#c8fff4", orbitColor: "rgba(155, 224, 109, 0.15)" },
      { key: "needle", label: "Needle", type: "moon", parentKey: "reef", orbit: 39, orbitScale: 0.82, radius: 5, speed: 1.24, phase: 4.35, spin: 0.52, spinPhase: 0.5, tilt: 0.04, color: "#d1e2e6", accent: "#ffffff", orbitColor: "rgba(244, 247, 239, 0.17)" },
      { key: "outer", label: "Haven", type: "planet", orbit: 252, orbitScale: 0.57, radius: 23, speed: 0.16, phase: 3.2, spin: 0.54, spinPhase: 2.3, tilt: -0.2, color: "#789a91", accent: "#bfe78d", orbitColor: "rgba(155, 224, 109, 0.17)" },
      { key: "ast-1", label: "Boreal", type: "asteroid", orbit: 294, orbitScale: 0.62, radius: 4, speed: 0.11, phase: 0.82, spin: 2.1, spinPhase: 0.6, tilt: 0.1, color: "#a8b8b6", accent: "#eaffff", orbitColor: "rgba(140, 229, 240, 0.12)" },
      { key: "ast-2", label: "Floe", type: "asteroid", orbit: 318, orbitScale: 0.66, radius: 5, speed: 0.085, phase: 2.4, spin: 2.55, spinPhase: 1.1, tilt: -0.15, color: "#91aaa8", accent: "#d7fbff", orbitColor: "rgba(140, 229, 240, 0.1)" },
      { key: "ast-3", label: "Glass", type: "asteroid", orbit: 342, orbitScale: 0.59, radius: 3, speed: 0.072, phase: 4.5, spin: 2.9, spinPhase: 1.7, tilt: 0.24, color: "#b7caca", accent: "#ffffff", orbitColor: "rgba(140, 229, 240, 0.09)" },
    ],
  },
];

const RESOURCE_LABELS = {
  mass: "Mass",
  volatiles: "Volatiles",
  plasma: "Plasma",
  exotic: "Exotic",
  population: "Population",
  crew: "Crew",
  fleet: "Fleet",
  stability: "Stability",
};
const COMPACT_RESOURCE_LABELS = {
  mass: "Mass",
  volatiles: "Vol",
  plasma: "Plasma",
  exotic: "Exotic",
  population: "Pop",
  crew: "Crew",
  fleet: "Fleet",
  stability: "Stab",
};
const STRUCTURE_POPULATION_WEIGHTS = {
  collector: 0.04,
  habitat: 0.7,
  shipyard: 0.18,
  "survey-array": 0.08,
  "solar-rig": 0.03,
  retrofit: 0.12,
  "mass-driver": 0.04,
  "solar-lifter": 0.03,
  "o-neill-cylinder": 1.55,
  "synthetic-world": 3.1,
  "black-hole": 0.02,
};
const AUTOMATION_BLUEPRINT_IDS = new Set([
  "collector",
  "shipyard",
  "survey-array",
  "solar-rig",
  "mass-driver",
  "solar-lifter",
  "synthetic-world",
  "black-hole",
]);
const CIVIC_BLUEPRINT_IDS = new Set(["habitat", "o-neill-cylinder", "synthetic-world"]);
const COMPACT_INTENT_LABELS = {
  "orbit-lift": "Lift",
  "orbit-brake": "Brake",
  "spin-up": "Spin",
};
const STARTING_RESOURCES = {
  mass: 120,
  volatiles: 34,
  plasma: 18,
  exotic: 0,
  population: 12,
  crew: 0,
  fleet: 0,
};
const STRUCTURE_BLUEPRINTS = [
  {
    id: "collector",
    label: "Collector Array",
    orbit: 188,
    speed: 0.16,
    phase: 0.15,
    orbitScale: 0.61,
    color: "#9be06d",
    commandLabel: "Boost Collectors",
    detail: "Harvests asteroid slag into mass and volatiles.",
    cost: { mass: 24 },
    rates: { mass: 0.7, volatiles: 0.22, stability: -0.015 },
  },
  {
    id: "habitat",
    label: "Habitat Ring",
    orbit: 226,
    speed: 0.12,
    phase: 1.28,
    orbitScale: 0.59,
    color: "#bda4ff",
    commandLabel: "Rally Crew",
    detail: "Turns volatiles into population, crew, and steady system maintenance.",
    cost: { mass: 30, volatiles: 14 },
    rates: { population: 0.018, crew: 0.048, volatiles: -0.08, stability: 0.02 },
  },
  {
    id: "shipyard",
    label: "Shipyard Cradle",
    orbit: 264,
    speed: 0.105,
    phase: 2.35,
    orbitScale: 0.58,
    color: "#8ce5f0",
    commandLabel: "Rush Hull",
    detail: "Consumes mass and plasma to assemble heavy hulls early and warp-capable frames much later.",
    cost: { mass: 48, plasma: 12, population: 0.3, crew: 3 },
    requires: { structure: "habitat" },
    rates: { fleet: 0.031, mass: -0.16, plasma: -0.04 },
  },
  {
    id: "survey-array",
    label: "Survey Array",
    orbit: 166,
    speed: 0.18,
    phase: 0.62,
    orbitScale: 0.62,
    color: "#8ce5f0",
    commandLabel: "Survey Target",
    detail: "Deep observatory ring that charts destinations and refines system telemetry.",
    cost: { mass: 40, plasma: 10, population: 0.4, crew: 2 },
    requires: { structure: "shipyard", project: { id: "orbital-refueling", level: 1 } },
    rates: { plasma: -0.02, stability: -0.012 },
  },
  {
    id: "solar-rig",
    label: "Solar Lifting Rig",
    orbit: 74,
    speed: 0.28,
    phase: 3.72,
    orbitScale: 0.69,
    color: "#ff9b67",
    commandLabel: "Surge Lift",
    detail: "Skims stellar plasma while pushing flare stress into stability.",
    cost: { mass: 26, plasma: 8 },
    requires: { structure: "collector" },
    rates: { plasma: 0.28, stability: -0.044 },
  },
  {
    id: "retrofit",
    label: "Retrofit Platform",
    orbit: 154,
    speed: 0.145,
    phase: 4.5,
    orbitScale: 0.63,
    color: "#f1be63",
    commandLabel: "Patch Planet",
    detail: "Spends mass and volatiles to improve habitability and stability.",
    cost: { mass: 40, volatiles: 18, crew: 2 },
    requires: { structure: "habitat" },
    rates: { stability: 0.046, mass: -0.07, volatiles: -0.04 },
  },
  {
    id: "mass-driver",
    label: "Mass Driver",
    orbit: 242,
    speed: 0.14,
    phase: 2.48,
    orbitScale: 0.6,
    color: "#f1be63",
    commandLabel: "Prime Driver",
    detail: "Heavy kinetic relay that stages controlled asteroid pushes once survey telemetry is online.",
    cost: { mass: 56, plasma: 14, population: 0.3, crew: 2 },
    requires: { structure: "survey-array", project: { id: "asteroid-prospecting", level: 1 } },
    rates: { mass: -0.06, stability: -0.02 },
  },
  {
    id: "solar-lifter",
    label: "Solar Lifter",
    orbit: 62,
    speed: 0.32,
    phase: 5.2,
    orbitScale: 0.7,
    color: "#ff9b67",
    commandLabel: "Lift Plasma",
    detail: "Full-scale stellar siphon that turns mature logistics and close-in solar work into heavy plasma yield.",
    cost: { mass: 64, plasma: 20, population: 0.5, crew: 3 },
    requires: { structure: "solar-rig", project: { id: "asteroid-refineries", level: 1 } },
    rates: { plasma: 0.09, stability: -0.03 },
  },
  {
    id: "o-neill-cylinder",
    label: "O'Neill Cylinder",
    orbit: 298,
    speed: 0.088,
    phase: 1.74,
    orbitScale: 0.56,
    color: "#c8fff4",
    commandLabel: "Open Cylinder",
    detail: "Rotating megahabitat arc that turns mature logistics and civic engineering into city-scale population growth.",
    cost: { mass: 96, volatiles: 28, plasma: 24, population: 1.4, crew: 6 },
    requires: { structure: "habitat", project: { id: "megahabitat-charters", level: 1 } },
    rates: { population: 0.085, crew: 0.17, volatiles: -0.14, stability: 0.055 },
  },
  {
    id: "synthetic-world",
    label: "Synthetic World",
    orbit: 322,
    speed: 0.072,
    phase: 4.16,
    orbitScale: 0.55,
    color: "#7fe0c2",
    commandLabel: "Stabilize Biosphere",
    detail: "Planet-scale fabrication shell that turns megahabitat know-how into a full synthetic biosphere and deeper industry.",
    cost: { mass: 140, volatiles: 32, plasma: 36, population: 2.4, crew: 10, fleet: 1 },
    requires: { structure: "o-neill-cylinder", project: { id: "synthetic-ecologies", level: 1 } },
    rates: { population: 0.13, crew: 0.12, volatiles: 0.18, stability: 0.08, plasma: -0.06, mass: -0.04 },
  },
  {
    id: "black-hole",
    label: "Black-Hole Harvester",
    orbit: 316,
    speed: 0.075,
    phase: 5.45,
    orbitScale: 0.57,
    color: "#d7c6ff",
    commandLabel: "Bleed Exotic",
    detail: "Anchors to a black hole and converts plasma into exotic matter.",
    cost: { mass: 56, plasma: 18, population: 0.5, crew: 5 },
    requires: { blackHole: true, structure: "shipyard", project: { id: "singularity-theory", level: 1 } },
    rates: { exotic: 0.024, plasma: -0.075, stability: -0.055 },
  },
];
const PROJECT_BLUEPRINTS = [
  {
    id: "stability-lattice",
    label: "Stability Lattice",
    maxLevel: 3,
    cost: { mass: 44, volatiles: 16 },
    detail: "Adds orbital buffers that slow stability drift and soften hazard pulses.",
    summary: "Hazards and impacts hurt less.",
    track: "engineering",
    requires: { structure: "habitat" },
  },
  {
    id: "civic-growth",
    label: "Civic Growth",
    maxLevel: 3,
    cost: { mass: 26, volatiles: 16, plasma: 5 },
    detail: "Invests in housing loops, civic services, and family-scale life support so population growth is something you can deliberately buy.",
    summary: "Habitats grow Population and Crew faster.",
    track: "science",
    requires: { structure: "habitat" },
  },
  {
    id: "orbital-refueling",
    label: "Orbital Refueling",
    maxLevel: 2,
    cost: { mass: 34, plasma: 8, crew: 1 },
    detail: "Builds depot logistics, tanker docks, and propellant discipline so later orbital programs can scale up.",
    summary: "Unlocks heavier orbital programs.",
    track: "engineering",
    requires: { structure: "shipyard" },
  },
  {
    id: "survey-network",
    label: "Deep Survey Network",
    maxLevel: 3,
    cost: { mass: 36, plasma: 6 },
    detail: "Links observatories across orbit so charting future systems costs less plasma.",
    summary: "Charting costs less Plasma.",
    track: "science",
    requires: { structure: "survey-array" },
  },
  {
    id: "asteroid-prospecting",
    label: "Asteroid Prospecting",
    maxLevel: 2,
    cost: { mass: 28, plasma: 10, crew: 1 },
    detail: "Expands survey science from simple charting into ore mapping, trajectory math, and industrial site selection.",
    summary: "Unlocks Mass Driver construction.",
    track: "science",
    requires: { structure: "survey-array", project: { id: "survey-network", level: 1 } },
  },
  {
    id: "logistics-spine",
    label: "Logistics Spine",
    maxLevel: 3,
    cost: { mass: 58, plasma: 8, population: 0.4, crew: 1.5 },
    detail: "Connects stations into a shared freight web so structure output compounds.",
    summary: "Structures produce more.",
    track: "engineering",
    requires: { structure: "shipyard", project: { id: "orbital-refueling", level: 1 } },
  },
  {
    id: "robotic-automation",
    label: "Robotic Automation",
    maxLevel: 3,
    cost: { mass: 42, plasma: 12, population: 0.4, crew: 1 },
    detail: "Moves repetitive station labor into robotics. Industry runs harder with fewer specialists, but automated lanes add system management pressure.",
    summary: "Boosts industrial output and lowers Crew costs.",
    track: "engineering",
    requires: { structure: "shipyard", project: { id: "logistics-spine", level: 1 } },
  },
  {
    id: "megahabitat-charters",
    label: "Megahabitat Charters",
    maxLevel: 1,
    cost: { mass: 48, volatiles: 18, population: 0.8, crew: 2 },
    detail: "Turns orbital housing into full city-scale planning, closed-loop support, and megastructure habitat design.",
    summary: "Unlocks O'Neill Cylinders.",
    track: "science",
    requires: { structure: "habitat", project: { id: "logistics-spine", level: 1 } },
  },
  {
    id: "asteroid-refineries",
    label: "Asteroid Refineries",
    maxLevel: 2,
    cost: { mass: 62, plasma: 12, crew: 2 },
    detail: "Builds the ore cracking, slag handling, and feedstock pipelines that make star lifting scale economically.",
    summary: "Unlocks Solar Lifter construction.",
    track: "engineering",
    requires: { structure: "mass-driver", project: { id: "asteroid-prospecting", level: 1 } },
  },
  {
    id: "deep-space-relays",
    label: "Deep Space Relays",
    maxLevel: 1,
    cost: { mass: 54, plasma: 14, fleet: 0.4 },
    detail: "Extends observatory work into true interstellar baseline relays. Routes can be charted, but still not traveled yet.",
    summary: "Unlocks interstellar charting.",
    track: "science",
    requires: { structure: "survey-array", project: { id: "asteroid-prospecting", level: 1 } },
  },
  {
    id: "synthetic-ecologies",
    label: "Synthetic Ecologies",
    maxLevel: 1,
    cost: { mass: 72, volatiles: 22, plasma: 18, population: 1.2, crew: 2 },
    detail: "Pushes from megahabitat life support into full world-shell ecology, weather control, and biosphere engineering.",
    summary: "Unlocks Synthetic Worlds.",
    track: "science",
    requires: { structure: "o-neill-cylinder", project: { id: "megahabitat-charters", level: 1 } },
  },
  {
    id: "singularity-theory",
    label: "Singularity Theory",
    maxLevel: 1,
    cost: { mass: 88, plasma: 28, population: 0.8, crew: 4, fleet: 0.6 },
    detail: "Moves the civilization from giant infrastructure into gravity engineering, compact singularities, and controlled warp mathematics.",
    summary: "Unlocks black-hole and warp research.",
    track: "science",
    requires: { structure: "synthetic-world", project: { id: "deep-space-relays", level: 1 } },
  },
  {
    id: "warp-drives",
    label: "Warp Drives",
    maxLevel: 1,
    cost: { mass: 96, plasma: 32, population: 1, crew: 5, fleet: 1.2 },
    detail: "Turns late singularity theory into actual drive engineering. Interstellar travel stays locked until this is complete.",
    summary: "Unlocks interstellar travel.",
    track: "engineering",
    requires: { structure: "shipyard", project: { id: "singularity-theory", level: 1 } },
  },
  {
    id: "ark-stores",
    label: "Ark Stores",
    maxLevel: 3,
    cost: { volatiles: 26, plasma: 12, population: 0.8, fleet: 0.4 },
    detail: "Stocks colony arks with seed cargo that arrives with every jump.",
    summary: "Jumps seed extra resources.",
    track: "engineering",
    requires: { structure: "shipyard", project: { id: "warp-drives", level: 1 } },
  },
];

const STRUCTURE_UPGRADE_MAX_LEVEL = 3;
const STRUCTURE_LEVEL_OUTPUT_STEP = 0.28;
const STRUCTURE_LEVEL_COST_REDUCTION_STEP = 0.06;
const STRUCTURE_LEVEL_STABILITY_STEP = 0.08;
const STRUCTURE_DISASSEMBLE_UNLOCK_CYCLE = 2;
const STRUCTURE_DISASSEMBLE_REFUND_RATIO = 0.58;
const LOCAL_RULES = [
  {
    id: "worlds-build",
    title: "Worlds commission orbitals",
    detail: "Select a planet or black hole to place the next piece of infrastructure there.",
  },
  {
    id: "structures-act",
    title: "Structures host tech ladders",
    detail: "Operate, upgrade, salvage, and fund science or engineering from the focused structure menu.",
  },
  {
    id: "asteroids-shift",
    title: "Asteroids reshape systems",
    detail: "Prospecting and refineries come first; then mass drivers and impacts become industrial tools instead of starter toys.",
  },
];
const BLUEPRINT_ACTION_PRIORITY = [
  "habitat",
  "collector",
  "shipyard",
  "survey-array",
  "retrofit",
  "solar-rig",
  "mass-driver",
  "solar-lifter",
  "o-neill-cylinder",
  "synthetic-world",
  "black-hole",
];
const PROJECT_ACCESS_HINTS = {
  "survey-network": "Survey Array",
  "stability-lattice": "Habitat Ring or Retrofit Platform",
  "civic-growth": "Habitat Ring or Retrofit Platform",
  "orbital-refueling": "Shipyard Cradle",
  "asteroid-prospecting": "Survey Array",
  "logistics-spine": "Shipyard Cradle",
  "robotic-automation": "Shipyard Cradle",
  "megahabitat-charters": "Habitat Ring",
  "asteroid-refineries": "Mass Driver",
  "deep-space-relays": "Survey Array",
  "synthetic-ecologies": "O'Neill Cylinder",
  "singularity-theory": "Survey Array",
  "warp-drives": "Shipyard Cradle",
  "ark-stores": "Shipyard Cradle",
};
const FOCUS_ART_LIBRARY = {
  "survey-array": {
    kicker: "Orbital observatory",
    title: "Survey Array",
    image: "./assets/focus/survey-array-card.png",
    prompt: "Needle-thin survey spires, cold cyan optics, and deep-space telemetry screens around a quiet orbital relay.",
  },
  "mass-driver": {
    kicker: "Kinetic relay",
    title: "Mass Driver",
    image: "./assets/focus/mass-driver-card.png",
    prompt: "Heavy magnetic rails, amber hazard light, and asteroid guidance gantries wrapped around a brutalist launch ring.",
  },
  "solar-lifter": {
    kicker: "Stellar siphon",
    title: "Solar Lifter",
    image: "./assets/focus/solar-lifter-card.png",
    prompt: "A sun-skimming plasma lifter with radiant heat veils, articulated collector fins, and a dangerous gold corona.",
  },
  "o-neill-cylinder": {
    kicker: "Megahabitat",
    title: "O'Neill Cylinder",
    image: "./assets/focus/o-neill-cylinder-card.png",
    prompt: "A vast rotating cylinder habitat with civic light bands, agricultural valleys, and glittering traffic stitched along the hull.",
  },
  "synthetic-world": {
    kicker: "Synthetic world",
    title: "Synthetic World",
    image: "./assets/focus/synthetic-world-card.png",
    prompt: "A world-scale artificial biosphere with engineered oceans, orbital mirrors, and immense fabrication belts shaping a new planet.",
  },
  collector: {
    kicker: "Orbital works",
    title: "Collector Array",
    image: "./assets/focus/collector-array-card.png",
    prompt: "Scavenger collector frames in dusty orbit, modular ore bins, and green utility beacons against a sparse starfield.",
  },
  habitat: {
    kicker: "Orbital works",
    title: "Habitat Ring",
    image: "./assets/focus/habitat-ring-card.png",
    prompt: "A luminous habitat ring with soft civic lighting, docking petals, and lived-in sci-fi infrastructure around a garden core.",
  },
  shipyard: {
    kicker: "Orbital works",
    title: "Shipyard Cradle",
    image: "./assets/focus/shipyard-cradle-card.png",
    prompt: "Massive hull scaffolds and cyan construction arms assembling jump frames in a disciplined orbital shipyard.",
  },
  "solar-rig": {
    kicker: "Orbital works",
    title: "Solar Lifting Rig",
    image: "./assets/focus/solar-lifting-rig-card.png",
    prompt: "A close-in stellar lifting rig with burnished armor, plasma intake vanes, and terrifying sunfire beneath it.",
  },
  retrofit: {
    kicker: "Orbital works",
    title: "Retrofit Platform",
    image: "./assets/focus/retrofit-platform-card.png",
    prompt: "Repair docks, articulated patch cranes, and warm industrial lights around a stability-tuning retrofit platform.",
  },
  "black-hole": {
    kicker: "Orbital works",
    title: "Black-Hole Harvester",
    image: "./assets/focus/black-hole-harvester-card.png",
    prompt: "A violet-black gravity harvester with tether spines, sacrificial shielding, and exotic matter containment halos.",
  },
  aster: {
    kicker: "Inner world",
    title: "Aster",
    image: "./assets/focus/aster-world-card.png",
    prompt: "A warm mineral world close to its sun, metallic cloud bands, foundry launches, and bright orbital traffic.",
  },
  vela: {
    kicker: "Garden world",
    title: "Vela",
    image: "./assets/focus/vela-world-card.png",
    prompt: "A green ocean world with soft clouds, shallow seas, and elegant ring traffic built for long-term settlement.",
  },
  morrow: {
    kicker: "Frontier world",
    title: "Morrow",
    image: "./assets/focus/morrow-world-card.png",
    prompt: "A cold blue frontier planet with ice haze, broad moonswept horizons, and heavy orbital industry above it.",
  },
  latch: {
    kicker: "Tidal moon",
    title: "Latch",
    image: "./assets/focus/latch-moon-card.png",
    prompt: "A dusty inner moon with sharp shadow lines, foundry traffic overhead, and a nearby world filling part of the sky.",
  },
  reef: {
    kicker: "Settlement moon",
    title: "Reef",
    image: "./assets/focus/reef-moon-card.png",
    prompt: "A pale colony moon with calm orbital lanes, soft reflected green light, and survey traffic crossing the horizon.",
  },
  "icar-01": {
    kicker: "Ore body",
    title: "Icar-01",
    image: "./assets/focus/icar-01-asteroid-card.png",
    prompt: "A rugged maneuver-capable asteroid with beacon strobes, scarred ore faces, and tiny guidance thrusters ready for a controlled shove.",
  },
  planet: {
    kicker: "Planetary anchor",
    title: "Focused planet",
    image: "./assets/focus/planet-generic-card.png",
    prompt: "A cinematic colony world with orbital traffic, dramatic atmosphere, and a clear staging orbit for new infrastructure.",
  },
  moon: {
    kicker: "Minor body",
    title: "Focused moon",
    image: "./assets/focus/moon-generic-card.png",
    prompt: "A cratered moon seen from a nearby orbital construction lane, quiet and cold with reflected planet light.",
  },
  asteroid: {
    kicker: "Ore body",
    title: "Focused asteroid",
    image: "./assets/focus/asteroid-generic-card.png",
    prompt: "A rugged ore-rich asteroid with scarred rock faces, navigation beacons, and maneuver thrusters ready for controlled impacts.",
  },
  "black-hole-body": {
    kicker: "Singularity anchor",
    title: "Focused black hole",
    image: "./assets/focus/black-hole-body-card.png",
    prompt: "A dangerous black-hole lensing field with impossible light arcs and engineered anchor pylons hanging at the edge of the well.",
  },
};

const LOCAL_ACTION_COLUMNS = 2;
const ACTION_BURST_STYLES = {
  build: { halo: [140, 229, 240], accent: [244, 247, 239] },
  operate: { halo: [241, 190, 99], accent: [255, 239, 198] },
  upgrade: { halo: [189, 164, 255], accent: [140, 229, 240] },
  salvage: { halo: [255, 125, 110], accent: [241, 190, 99] },
  project: { halo: [140, 229, 240], accent: [189, 164, 255] },
  travel: { halo: [181, 231, 255], accent: [241, 190, 99] },
};

const canvas = document.getElementById("system-canvas");
const ctx = canvas.getContext("2d");
const playfieldShell = document.getElementById("playfield-shell");
const playfieldStage = document.getElementById("playfield-stage");

const ui = {
  bootPanel: document.getElementById("boot-panel"),
  startButton: document.getElementById("start-button"),
  arcadeLink: document.getElementById("arcade-link"),
  pauseButton: document.getElementById("pause-button"),
  slowerButton: document.getElementById("slower-button"),
  fasterButton: document.getElementById("faster-button"),
  restartButton: document.getElementById("restart-button"),
  cycle: document.getElementById("cycle-value"),
  stability: document.getElementById("stability-value"),
  mass: document.getElementById("mass-value"),
  volatiles: document.getElementById("volatiles-value"),
  plasma: document.getElementById("plasma-value"),
  exotic: document.getElementById("exotic-value"),
  population: document.getElementById("population-value"),
  crew: document.getElementById("crew-value"),
  fleet: document.getElementById("fleet-value"),
  system: document.getElementById("system-value"),
  jumps: document.getElementById("jumps-value"),
  players: document.getElementById("players-value"),
  timeScale: document.getElementById("time-scale-value"),
  phase: document.getElementById("phase-value"),
  hint: document.getElementById("hint-value"),
  commandPanel: document.getElementById("command-panel"),
  commandOwner: document.getElementById("command-owner-value"),
  selection: document.getElementById("selection-value"),
  selectionDetail: document.getElementById("selection-detail"),
  selectionLearn: document.getElementById("selection-learn"),
  outcomeReport: document.getElementById("outcome-report"),
  outcomeKicker: document.getElementById("outcome-kicker-value"),
  outcomeTitle: document.getElementById("outcome-title-value"),
  outcomeStory: document.getElementById("outcome-story-value"),
  outcomeNow: document.getElementById("outcome-now-value"),
  outcomeOutput: document.getElementById("outcome-output-value"),
  impactDraft: document.getElementById("impact-draft-value"),
  assetFigure: document.getElementById("asset-figure"),
  assetImage: document.getElementById("asset-image"),
  assetFallback: document.getElementById("asset-fallback"),
  assetKicker: document.getElementById("asset-kicker-value"),
  assetTitle: document.getElementById("asset-title-value"),
  assetPrompt: document.getElementById("asset-prompt-value"),
  contextActionList: document.getElementById("context-action-list"),
  previousSelectionButton: document.getElementById("previous-selection-button"),
  nextSelectionButton: document.getElementById("next-selection-button"),
  markAsteroidButton: document.getElementById("mark-asteroid-button"),
  markTargetButton: document.getElementById("mark-target-button"),
  impactIntentButton: document.getElementById("impact-intent-button"),
  structureCommandButton: document.getElementById("structure-command-button"),
  queueImpactButton: document.getElementById("queue-impact-button"),
  buildList: document.getElementById("build-list"),
  buildCount: document.getElementById("build-count-value"),
  buildStatus: document.getElementById("build-status-value"),
  projectList: document.getElementById("project-list"),
  projectCount: document.getElementById("project-count-value"),
  projectStatus: document.getElementById("project-status-value"),
  travelState: document.getElementById("travel-state-value"),
  systemDetail: document.getElementById("system-detail-value"),
  discovery: document.getElementById("discovery-value"),
  chartSystemButton: document.getElementById("chart-system-button"),
  jumpSystemButton: document.getElementById("jump-system-button"),
  ordersSummary: document.getElementById("orders-summary-value"),
  objective: document.getElementById("objective-value"),
  objectiveDetail: document.getElementById("objective-detail-value"),
  stabilityChip: document.getElementById("stability-chip-value"),
  activeImpacts: document.getElementById("active-impacts-value"),
  readiness: document.getElementById("readiness-value"),
  warningStack: document.getElementById("warning-stack"),
  warningCount: document.getElementById("warning-count-value"),
  warningList: document.getElementById("warning-list"),
  eventCount: document.getElementById("event-count-value"),
  eventLogList: document.getElementById("event-log-list"),
  playerPanels: document.getElementById("player-panels"),
  operationsDrawer: document.getElementById("operations-drawer"),
  joinCount: document.getElementById("join-count-value"),
  joinDetail: document.getElementById("join-detail-value"),
  joinList: document.getElementById("join-list"),
};

const buildCardNodes = new Map();
const projectCardNodes = new Map();
const metricPulseTimers = new Map();
const connectedGamepads = new Map();
let renderedEventSignature = "";
let renderedPlayerPanelSignature = "";
let renderedJoinSignature = "";
let renderedActionSignature = "";
let renderedBuildSignature = "";
let renderedProjectSignature = "";
let renderedFocusSignature = "";
let renderedOutcomeSignature = "";

document.title = `Sim Planet build ${BUILD_NUMBER}`;

const stage = createArcadeStage({
  shell: playfieldShell,
  stage: playfieldStage,
  canvas,
  logicalWidth: WIDTH,
  logicalHeight: HEIGHT,
});

ui.assetImage?.addEventListener("load", () => {
  ui.assetFigure?.classList.add("has-image");
  ui.assetFigure?.classList.remove("is-missing");
});

ui.assetImage?.addEventListener("error", () => {
  ui.assetFigure?.classList.remove("has-image");
  ui.assetFigure?.classList.add("is-missing");
});

const stars = Array.from({ length: 150 }, (_, index) => {
  const xSeed = Math.sin((index + 3) * 74.31) * 10000;
  const ySeed = Math.sin((index + 7) * 41.17) * 10000;
  return {
    x: (xSeed - Math.floor(xSeed)) * WIDTH,
    y: (ySeed - Math.floor(ySeed)) * HEIGHT,
    radius: 0.55 + ((index * 11) % 9) * 0.11,
    alpha: 0.28 + ((index * 17) % 10) * 0.045,
  };
});

const bodies = [
  {
    label: "Aster",
    type: "planet",
    orbit: 86,
    orbitScale: 0.68,
    radius: 10,
    speed: 0.55,
    phase: 0.15,
    spin: 1.65,
    spinPhase: 0.4,
    tilt: -0.18,
    color: "#d8a35d",
    accent: "#f7d38a",
    orbitColor: "rgba(247, 211, 138, 0.22)",
  },
  {
    label: "Vela",
    type: "planet",
    orbit: 142,
    orbitScale: 0.62,
    radius: 17,
    speed: 0.32,
    phase: 1.7,
    spin: 0.92,
    spinPhase: 1.1,
    tilt: 0.28,
    color: "#77a983",
    accent: "#bfe78d",
    orbitColor: "rgba(155, 224, 109, 0.23)",
  },
  {
    label: "Reef",
    type: "moon",
    parent: "Vela",
    orbit: 35,
    orbitScale: 0.72,
    radius: 5,
    speed: 1.62,
    phase: 3.9,
    spin: 0.55,
    spinPhase: 0,
    tilt: 0,
    color: "#c9d4c9",
    accent: "#f4f7ef",
    orbitColor: "rgba(244, 247, 239, 0.22)",
  },
  {
    label: "Morrow",
    type: "planet",
    orbit: 214,
    orbitScale: 0.58,
    radius: 23,
    speed: 0.2,
    phase: 3.25,
    spin: 0.74,
    spinPhase: 2.2,
    tilt: -0.34,
    color: "#7694b8",
    accent: "#a8e6f0",
    orbitColor: "rgba(168, 230, 240, 0.2)",
  },
  {
    label: "Latch",
    type: "moon",
    parent: "Morrow",
    orbit: 48,
    orbitScale: 0.8,
    radius: 7,
    speed: 0.9,
    phase: 5.1,
    spin: 0.38,
    spinPhase: 1.6,
    tilt: 0.08,
    color: "#a58974",
    accent: "#f0c98d",
    orbitColor: "rgba(240, 201, 141, 0.19)",
  },
  {
    label: "Icar-01",
    type: "asteroid",
    orbit: 288,
    orbitScale: 0.6,
    radius: 4,
    speed: 0.14,
    phase: 0.55,
    spin: 2.7,
    spinPhase: 0.8,
    tilt: 0.1,
    color: "#b48b70",
    accent: "#f0c98d",
    orbitColor: "rgba(180, 139, 112, 0.16)",
  },
  {
    label: "Icar-02",
    type: "asteroid",
    orbit: 305,
    orbitScale: 0.62,
    radius: 3,
    speed: 0.11,
    phase: 2.45,
    spin: 3.15,
    spinPhase: 0.25,
    tilt: -0.15,
    color: "#947860",
    accent: "#e5b978",
    orbitColor: "rgba(180, 139, 112, 0.12)",
  },
  {
    label: "Icar-03",
    type: "asteroid",
    orbit: 318,
    orbitScale: 0.65,
    radius: 5,
    speed: 0.09,
    phase: 4.6,
    spin: 2.2,
    spinPhase: 1.4,
    tilt: 0.3,
    color: "#c09a78",
    accent: "#f0c98d",
    orbitColor: "rgba(180, 139, 112, 0.1)",
  },
];
const STARTER_BODIES = bodies.map(cloneBody);

const structures = [];
const STARTER_STRUCTURE_COUNT = structures.length;

const bodyBaselines = new Map(
  bodies.map((body) => [
    body.label,
    {
      orbit: body.orbit,
      speed: body.speed,
      phase: body.phase,
      spin: body.spin,
      spinPhase: body.spinPhase,
      tilt: body.tilt,
    },
  ]),
);
const structureBaselines = new Map(
  structures.map((structure) => [
    structure.label,
    {
      orbit: structure.orbit,
      speed: structure.speed,
      phase: structure.phase,
      commandPulse: 0,
    },
  ]),
);

function cloneBody(body) {
  return { ...body };
}

function cloneResources(resources = {}) {
  return Object.fromEntries(Object.entries(resources).map(([resource, value]) => [resource, value]));
}

function addResourceMaps(target = {}, source = {}) {
  const next = cloneResources(target);
  for (const [resource, value] of Object.entries(source)) {
    next[resource] = (next[resource] || 0) + value;
  }
  return next;
}

function scaleResources(resources = {}, multiplier = 1) {
  const next = {};
  for (const [resource, value] of Object.entries(resources)) {
    next[resource] = Math.round(value * multiplier * 10) / 10;
  }
  return next;
}

function createProjectLevelState() {
  return Object.fromEntries(PROJECT_BLUEPRINTS.map((project) => [project.id, 0]));
}

function createPlayerSlot(slotIndex) {
  const id = slotIndex + 1;
  const impactIntent = IMPACT_INTENTS[DEFAULT_PLAYER_SELECTION.impactIntentIndex] || IMPACT_INTENTS[0];
  return {
    id,
    label: `P${id}`,
    active: id === 1,
    controllerIndex: null,
    color: PLAYER_COLORS[slotIndex] || PLAYER_COLORS[0],
    focusIndex: DEFAULT_PLAYER_SELECTION.focusIndex,
    focusTargetLabel: DEFAULT_PLAYER_SELECTION.selectedLabel,
    lastBodyLabel: DEFAULT_PLAYER_SELECTION.selectedLabel,
    lastStructureLabel: "",
    selectedKind: DEFAULT_PLAYER_SELECTION.selectedKind,
    selectedLabel: DEFAULT_PLAYER_SELECTION.selectedLabel,
    impactAsteroidLabel: DEFAULT_PLAYER_SELECTION.impactAsteroidLabel,
    impactTargetLabel: DEFAULT_PLAYER_SELECTION.impactTargetLabel,
    impactIntentIndex: DEFAULT_PLAYER_SELECTION.impactIntentIndex,
    commandIntent: impactIntent.id,
    buildBlueprintIndex: openingBlueprintIndex(),
    localMenuOpen: false,
    localActionIndex: 0,
    inputSnapshot: {},
  };
}

function captureBodyBaselines() {
  bodyBaselines.clear();
  for (const body of bodies) {
    bodyBaselines.set(body.label, {
      orbit: body.orbit,
      speed: body.speed,
      phase: body.phase,
      spin: body.spin,
      spinPhase: body.spinPhase,
      tilt: body.tilt,
    });
  }
}

let nextImpactId = 1;

const state = {
  phase: "boot",
  cycle: 0,
  stability: 87,
  mass: STARTING_RESOURCES.mass,
  volatiles: STARTING_RESOURCES.volatiles,
  plasma: STARTING_RESOURCES.plasma,
  exotic: STARTING_RESOURCES.exotic,
  population: STARTING_RESOURCES.population,
  crew: STARTING_RESOURCES.crew,
  fleet: STARTING_RESOURCES.fleet,
  currentSystemArchetypeId: STARTER_ARCHETYPE_ID,
  systemName: "Helio Cradle",
  systemIndex: 0,
  jumps: 0,
  totalCycles: 0,
  discoveredSystem: null,
  visitedSystems: ["Helio Cradle"],
  lastTravelSummary: "Build Habitat, Shipyard, Refueling, and Survey Array before even thinking about interstellar travel.",
  projectLevels: createProjectLevelState(),
  elapsed: 0,
  lastTime: 0,
  accumulator: 0,
  paused: false,
  timeScaleIndex: 1,
  players: Array.from({ length: MAX_PLAYERS }, (_, index) => createPlayerSlot(index)),
  impactQueue: [],
  impactBursts: [],
  actionBursts: [],
  massAdjustment: 0,
  volatilesAdjustment: 0,
  plasmaAdjustment: 0,
  exoticAdjustment: 0,
  populationAdjustment: 0,
  crewAdjustment: 0,
  fleetAdjustment: 0,
  stabilityAdjustment: 0,
  lastBuildSummary: "No structures built yet.",
  lastProjectSummary: "No science or engineering funded yet.",
  lastImpactSummary: "No impacts queued.",
  outcomeReport: null,
  nextOutcomeId: 1,
  events: [],
  nextEventId: 1,
  lastHazardTick: 0,
  collapseLogged: false,
  bootMenuFocusIndex: 0,
  music: {
    audioSupported: typeof Audio === "function",
    blocked: false,
    unlocked: false,
    playlistIndex: 0,
    currentKey: null,
    current: null,
    pendingKey: null,
    pending: null,
    tracks: new Map(),
  },
};

function campaignStorage() {
  try {
    return window.localStorage || globalThis.localStorage || null;
  } catch {
    return null;
  }
}

function finiteOr(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

function savedBodyBaselines() {
  return [...bodyBaselines.entries()].map(([label, baseline]) => [
    label,
    {
      orbit: baseline.orbit,
      speed: baseline.speed,
      phase: baseline.phase,
      spin: baseline.spin,
      spinPhase: baseline.spinPhase,
      tilt: baseline.tilt,
    },
  ]);
}

function serializeBody(body) {
  return {
    label: body.label,
    type: body.type,
    parent: body.parent || "",
    orbit: body.orbit,
    orbitScale: body.orbitScale,
    radius: body.radius,
    speed: body.speed,
    phase: body.phase,
    spin: body.spin,
    spinPhase: body.spinPhase,
    tilt: body.tilt,
    color: body.color,
    accent: body.accent,
    orbitColor: body.orbitColor,
  };
}

function serializeStructure(structure) {
  return {
    label: structure.label,
    blueprintId: structure.blueprintId || "",
    starterId: structure.starterId || "",
    orbit: structure.orbit,
    speed: structure.speed,
    phase: structure.phase,
    orbitScale: structure.orbitScale,
    color: structure.color,
    commandLabel: structure.commandLabel,
    detail: structure.detail,
    rates: cloneResources(structure.rates || {}),
    uptime: structure.uptime || 0,
    level: structureLevel(structure),
    maxLevel: structure.maxLevel || STRUCTURE_UPGRADE_MAX_LEVEL,
    anchorLabel: structure.anchorLabel || "",
    investedCost: cloneResources(structure.investedCost || {}),
    offline: Boolean(structure.offline),
    offlineReason: structure.offlineReason || "",
  };
}

function serializePlayer(player) {
  return {
    id: player.id,
    label: player.label,
    color: player.color,
    focusIndex: player.focusIndex,
    focusTargetLabel: player.focusTargetLabel,
    lastBodyLabel: player.lastBodyLabel,
    lastStructureLabel: player.lastStructureLabel,
    selectedKind: player.selectedKind,
    selectedLabel: player.selectedLabel,
    impactAsteroidLabel: player.impactAsteroidLabel,
    impactTargetLabel: player.impactTargetLabel,
    impactIntentIndex: player.impactIntentIndex,
    commandIntent: player.commandIntent,
    buildBlueprintIndex: player.buildBlueprintIndex,
  };
}

function createCampaignSave() {
  return {
    version: SAVE_VERSION,
    buildNumber: BUILD_NUMBER,
    savedAt: new Date().toISOString(),
    phase: "running",
    paused: state.paused,
    currentSystemArchetypeId: state.currentSystemArchetypeId,
    systemName: state.systemName,
    systemIndex: state.systemIndex,
    jumps: state.jumps,
    totalCycles: state.totalCycles,
    discoveredSystem: state.discoveredSystem ? { ...state.discoveredSystem } : null,
    visitedSystems: [...state.visitedSystems],
    projectLevels: { ...state.projectLevels },
    elapsed: state.elapsed,
    cycle: state.cycle,
    timeScaleIndex: state.timeScaleIndex,
    resources: {
      mass: state.mass,
      volatiles: state.volatiles,
      plasma: state.plasma,
      exotic: state.exotic,
      population: state.population,
      crew: state.crew,
      fleet: state.fleet,
      stability: state.stability,
    },
    adjustments: {
      mass: state.massAdjustment,
      volatiles: state.volatilesAdjustment,
      plasma: state.plasmaAdjustment,
      exotic: state.exoticAdjustment,
      population: state.populationAdjustment,
      crew: state.crewAdjustment,
      fleet: state.fleetAdjustment,
      stability: state.stabilityAdjustment,
    },
    bodies: bodies.map(serializeBody),
    bodyBaselines: savedBodyBaselines(),
    structures: structures.slice(STARTER_STRUCTURE_COUNT).map(serializeStructure),
    players: state.players.map(serializePlayer),
    impactQueue: state.impactQueue.map((impact) => ({ ...impact })),
    nextImpactId,
    lastBuildSummary: state.lastBuildSummary,
    lastProjectSummary: state.lastProjectSummary,
    lastTravelSummary: state.lastTravelSummary,
    lastImpactSummary: state.lastImpactSummary,
    outcomeReport: state.outcomeReport ? { ...state.outcomeReport } : null,
    nextOutcomeId: state.nextOutcomeId,
    events: state.events.map((event) => ({ ...event })),
    nextEventId: state.nextEventId,
    lastHazardTick: state.lastHazardTick,
    collapseLogged: state.collapseLogged,
    ordersOpen: Boolean(ui.operationsDrawer?.open),
  };
}

function saveCampaign({ force = false } = {}) {
  if (!force && state.phase !== "running") {
    return false;
  }

  const storage = campaignStorage();
  if (!storage) {
    return false;
  }

  try {
    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(createCampaignSave()));
    return true;
  } catch {
    return false;
  }
}

function clearSavedCampaign() {
  const storage = campaignStorage();
  if (!storage) {
    return false;
  }

  try {
    storage.removeItem(SAVE_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

function readSavedCampaign() {
  const storage = campaignStorage();
  if (!storage) {
    return null;
  }

  try {
    const raw = storage.getItem(SAVE_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const save = JSON.parse(raw);
    if (save?.version !== SAVE_VERSION || !Array.isArray(save.bodies) || save.bodies.length === 0) {
      clearSavedCampaign();
      return null;
    }
    return save;
  } catch {
    clearSavedCampaign();
    return null;
  }
}

function hydrateSavedBody(saved) {
  return {
    label: String(saved.label || "Unknown"),
    type: String(saved.type || "planet"),
    parent: saved.parent || undefined,
    orbit: finiteOr(Number(saved.orbit), 120),
    orbitScale: finiteOr(Number(saved.orbitScale), ORBIT_SCALE_Y),
    radius: finiteOr(Number(saved.radius), 12),
    speed: finiteOr(Number(saved.speed), 0.1),
    phase: finiteOr(Number(saved.phase), 0),
    spin: finiteOr(Number(saved.spin), 0.5),
    spinPhase: finiteOr(Number(saved.spinPhase), 0),
    tilt: finiteOr(Number(saved.tilt), 0),
    color: saved.color || "#7694b8",
    accent: saved.accent || "#a8e6f0",
    orbitColor: saved.orbitColor || "rgba(168, 230, 240, 0.2)",
    guidancePulse: 0,
  };
}

function hydrateSavedStructure(saved) {
  const blueprint = saved.blueprintId ? blueprintById(saved.blueprintId) : null;
  const level = clamp(Math.round(Number(saved.level) || 1), 1, STRUCTURE_UPGRADE_MAX_LEVEL);
  return {
    label: String(saved.label || blueprint?.label || "Orbital"),
    blueprintId: saved.blueprintId || "",
    starterId: saved.starterId || "",
    orbit: finiteOr(Number(saved.orbit), blueprint?.orbit || 180),
    speed: finiteOr(Number(saved.speed), blueprint?.speed || 0.1),
    phase: finiteOr(Number(saved.phase), blueprint?.phase || 0),
    orbitScale: finiteOr(Number(saved.orbitScale), blueprint?.orbitScale || ORBIT_SCALE_Y),
    color: saved.color || blueprint?.color || "#8ce5f0",
    commandLabel: saved.commandLabel || blueprint?.commandLabel || "Run Structure",
    detail: saved.detail || blueprint?.detail || "Local orbital infrastructure.",
    rates: blueprint ? structureRatesForLevel(blueprint, level) : cloneResources(saved.rates || {}),
    uptime: finiteOr(Number(saved.uptime), 0),
    commandPulse: 0,
    level,
    maxLevel: saved.maxLevel || STRUCTURE_UPGRADE_MAX_LEVEL,
    anchorLabel: saved.anchorLabel || "",
    investedCost: cloneResources(saved.investedCost || blueprint?.cost || {}),
    offline: Boolean(saved.offline),
    offlineReason: saved.offlineReason || "",
  };
}

function restoreSavedBodyBaselines(save) {
  bodyBaselines.clear();
  if (Array.isArray(save.bodyBaselines)) {
    for (const [label, baseline] of save.bodyBaselines) {
      if (!label || !baseline) {
        continue;
      }
      bodyBaselines.set(label, {
        orbit: finiteOr(Number(baseline.orbit), 120),
        speed: finiteOr(Number(baseline.speed), 0.1),
        phase: finiteOr(Number(baseline.phase), 0),
        spin: finiteOr(Number(baseline.spin), 0.5),
        spinPhase: finiteOr(Number(baseline.spinPhase), 0),
        tilt: finiteOr(Number(baseline.tilt), 0),
      });
    }
  }

  if (bodyBaselines.size === 0) {
    captureBodyBaselines();
  }
}

function restoreSavedPlayers(save) {
  const savedPlayers = Array.isArray(save.players) ? save.players : [];
  state.players = Array.from({ length: MAX_PLAYERS }, (_, index) => {
    const base = createPlayerSlot(index);
    const saved = savedPlayers.find((player) => player?.id === base.id) || {};
    return {
      ...base,
      color: saved.color || base.color,
      focusIndex: finiteOr(Number(saved.focusIndex), base.focusIndex),
      focusTargetLabel: saved.focusTargetLabel || base.focusTargetLabel,
      lastBodyLabel: saved.lastBodyLabel || base.lastBodyLabel,
      lastStructureLabel: saved.lastStructureLabel || base.lastStructureLabel,
      selectedKind: saved.selectedKind || base.selectedKind,
      selectedLabel: saved.selectedLabel || base.selectedLabel,
      impactAsteroidLabel: saved.impactAsteroidLabel || base.impactAsteroidLabel,
      impactTargetLabel: saved.impactTargetLabel || base.impactTargetLabel,
      impactIntentIndex: finiteOr(Number(saved.impactIntentIndex), base.impactIntentIndex),
      commandIntent: saved.commandIntent || base.commandIntent,
      buildBlueprintIndex: finiteOr(Number(saved.buildBlueprintIndex), base.buildBlueprintIndex),
      active: base.id === 1,
      controllerIndex: null,
      localMenuOpen: false,
      localActionIndex: 0,
      inputSnapshot: {},
    };
  });

  for (const player of state.players) {
    ensurePlayerSelection(player);
  }
}

function restoreSavedCampaign() {
  const save = readSavedCampaign();
  if (!save) {
    return false;
  }

  try {
    bodies.splice(0, bodies.length, ...save.bodies.map(hydrateSavedBody));
    restoreSavedBodyBaselines(save);
    state.currentSystemArchetypeId = save.currentSystemArchetypeId || STARTER_ARCHETYPE_ID;
    state.systemName = save.systemName || "Helio Cradle";
    state.systemIndex = finiteOr(Number(save.systemIndex), 0);
    state.jumps = finiteOr(Number(save.jumps), 0);
    state.totalCycles = finiteOr(Number(save.totalCycles), 0);
    state.discoveredSystem = save.discoveredSystem ? { ...save.discoveredSystem } : null;
    state.visitedSystems = Array.isArray(save.visitedSystems) && save.visitedSystems.length > 0
      ? [...save.visitedSystems]
      : [state.systemName];
    state.projectLevels = {
      ...createProjectLevelState(),
      ...(save.projectLevels || {}),
    };

    structures.splice(
      STARTER_STRUCTURE_COUNT,
      Math.max(0, structures.length - STARTER_STRUCTURE_COUNT),
      ...(Array.isArray(save.structures) ? save.structures.map(hydrateSavedStructure) : []),
    );
    refreshBuiltStructureRates();

    const resources = save.resources || {};
    const adjustments = save.adjustments || {};
    state.phase = "running";
    state.paused = Boolean(save.paused);
    state.elapsed = finiteOr(Number(save.elapsed), 0);
    state.cycle = finiteOr(Number(save.cycle), Math.floor(state.elapsed / CYCLE_SECONDS));
    state.lastTime = performance.now();
    state.accumulator = 0;
    state.timeScaleIndex = clamp(Math.round(Number(save.timeScaleIndex) || 1), 0, TIME_SCALES.length - 1);
    state.mass = finiteOr(Number(resources.mass), STARTING_RESOURCES.mass);
    state.volatiles = finiteOr(Number(resources.volatiles), STARTING_RESOURCES.volatiles);
    state.plasma = finiteOr(Number(resources.plasma), STARTING_RESOURCES.plasma);
    state.exotic = finiteOr(Number(resources.exotic), STARTING_RESOURCES.exotic);
    state.population = finiteOr(Number(resources.population), STARTING_RESOURCES.population);
    state.crew = finiteOr(Number(resources.crew), STARTING_RESOURCES.crew);
    state.fleet = finiteOr(Number(resources.fleet), STARTING_RESOURCES.fleet);
    state.stability = finiteOr(Number(resources.stability), 87);
    state.massAdjustment = finiteOr(Number(adjustments.mass), 0);
    state.volatilesAdjustment = finiteOr(Number(adjustments.volatiles), 0);
    state.plasmaAdjustment = finiteOr(Number(adjustments.plasma), 0);
    state.exoticAdjustment = finiteOr(Number(adjustments.exotic), 0);
    state.populationAdjustment = finiteOr(Number(adjustments.population), state.population - naturalResourceValues().population);
    state.crewAdjustment = finiteOr(Number(adjustments.crew), 0);
    state.fleetAdjustment = finiteOr(Number(adjustments.fleet), 0);
    state.stabilityAdjustment = finiteOr(Number(adjustments.stability), 0);
    state.impactQueue = Array.isArray(save.impactQueue) ? save.impactQueue.map((impact) => ({ ...impact })) : [];
    state.impactBursts = [];
    state.actionBursts = [];
    nextImpactId = finiteOr(Number(save.nextImpactId), Math.max(0, ...state.impactQueue.map((impact) => impact.id || 0)) + 1);
    state.lastBuildSummary = save.lastBuildSummary || "Campaign restored from autosave.";
    state.lastProjectSummary = save.lastProjectSummary || "Science and engineering state restored.";
    state.lastTravelSummary = save.lastTravelSummary || systemDetailText();
    state.lastImpactSummary = save.lastImpactSummary || "Autosave restored.";
    state.outcomeReport = save.outcomeReport ? { ...save.outcomeReport } : null;
    state.nextOutcomeId = finiteOr(Number(save.nextOutcomeId), (state.outcomeReport?.id || 0) + 1);
    state.events = Array.isArray(save.events) ? save.events.map((event) => ({ ...event })).slice(0, EVENT_LOG_LIMIT) : [];
    state.nextEventId = finiteOr(Number(save.nextEventId), Math.max(0, ...state.events.map((event) => event.id || 0)) + 1);
    state.lastHazardTick = finiteOr(Number(save.lastHazardTick), 0);
    state.collapseLogged = Boolean(save.collapseLogged);
    state.bootMenuFocusIndex = 0;
    restoreSavedPlayers(save);
    setOrdersDrawerOpen(save.ordersOpen !== false);
    syncUi();
    return true;
  } catch {
    clearSavedCampaign();
    return false;
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function resetMusicAudio(audio) {
  if (!audio) {
    return;
  }
  audio.pause();
  audio.currentTime = 0;
  audio.volume = 0;
}

function currentMusicKey() {
  return MUSIC_PLAYLIST[state.music.playlistIndex % MUSIC_PLAYLIST.length] || null;
}

function nextMusicKey() {
  return MUSIC_PLAYLIST[(state.music.playlistIndex + 1) % MUSIC_PLAYLIST.length] || currentMusicKey();
}

function musicTargetVolume(key) {
  return MUSIC_TRACKS[key]?.volume || 0;
}

function unlockMusic() {
  if (!state.music.audioSupported || !MUSIC_PLAYLIST.length) {
    return false;
  }
  state.music.unlocked = true;
  state.music.blocked = false;
  syncMusic(0.016);
  return true;
}

function musicAudioForKey(key) {
  if (!state.music.audioSupported || !key) {
    return null;
  }
  const track = MUSIC_TRACKS[key];
  if (!track) {
    return null;
  }
  if (state.music.tracks.has(key)) {
    return state.music.tracks.get(key);
  }
  const audio = new Audio(track.file);
  audio.loop = false;
  audio.preload = "auto";
  audio.volume = 0;
  audio.addEventListener("ended", () => advanceMusicTrack(audio));
  audio.addEventListener("error", () => {
    if (state.music.current === audio) {
      state.music.current = null;
      state.music.currentKey = null;
    }
    if (state.music.pending === audio) {
      state.music.pending = null;
      state.music.pendingKey = null;
    }
    state.music.blocked = true;
  });
  state.music.tracks.set(key, audio);
  return audio;
}

function startMusicAudio(audio, role) {
  if (!audio) {
    return null;
  }
  audio.currentTime = 0;
  audio.volume = 0;
  const playPromise = audio.play();
  if (playPromise?.catch) {
    playPromise.catch(() => {
      if (role === "current" && state.music.current === audio) {
        state.music.current = null;
        state.music.currentKey = null;
      }
      if (role === "pending" && state.music.pending === audio) {
        state.music.pending = null;
        state.music.pendingKey = null;
      }
      state.music.blocked = true;
    });
  }
  return audio;
}

function promotePendingMusicTrack() {
  if (!state.music.pending) {
    return;
  }
  const previous = state.music.current;
  state.music.current = state.music.pending;
  state.music.currentKey = state.music.pendingKey;
  state.music.pending = null;
  state.music.pendingKey = null;
  state.music.playlistIndex = (state.music.playlistIndex + 1) % MUSIC_PLAYLIST.length;
  resetMusicAudio(previous);
}

function advanceMusicTrack(audio = null) {
  if (audio && state.music.current && state.music.current !== audio) {
    if (state.music.pending === audio) {
      resetMusicAudio(audio);
      state.music.pending = null;
      state.music.pendingKey = null;
    }
    return;
  }
  if (state.music.pending) {
    promotePendingMusicTrack();
    return;
  }
  resetMusicAudio(audio || state.music.current);
  state.music.current = null;
  state.music.currentKey = null;
  state.music.playlistIndex = (state.music.playlistIndex + 1) % MUSIC_PLAYLIST.length;
}

function shouldQueuePendingMusic() {
  if (!state.music.current || state.music.pending || MUSIC_PLAYLIST.length < 2) {
    return false;
  }
  if (state.music.current.ended) {
    return true;
  }
  const duration = state.music.current.duration;
  if (!Number.isFinite(duration) || duration <= 0) {
    return false;
  }
  return duration - state.music.current.currentTime <= MUSIC_CROSSFADE_SECONDS;
}

function queuePendingMusicTrack() {
  if (state.music.pending) {
    return;
  }
  const key = nextMusicKey();
  if (!key || key === state.music.currentKey) {
    return;
  }
  const audio = musicAudioForKey(key);
  if (!audio) {
    return;
  }
  state.music.pendingKey = key;
  state.music.pending = audio;
  startMusicAudio(audio, "pending");
}

function syncMusic(dt = 0.033) {
  if (!state.music.audioSupported || !state.music.unlocked || state.music.blocked || !MUSIC_PLAYLIST.length) {
    return;
  }

  if (!state.music.current) {
    const key = currentMusicKey();
    const audio = musicAudioForKey(key);
    if (!audio) {
      return;
    }
    state.music.currentKey = key;
    state.music.current = audio;
    startMusicAudio(audio, "current");
  }

  if (!state.music.current) {
    return;
  }

  if (shouldQueuePendingMusic()) {
    queuePendingMusicTrack();
  }

  const maxStep = MUSIC_FADE_RATE * Math.max(0.016, dt);
  const currentTarget = state.music.pending ? 0 : musicTargetVolume(state.music.currentKey);
  const currentDelta = clamp(currentTarget - state.music.current.volume, -maxStep, maxStep);
  state.music.current.volume = clamp(state.music.current.volume + currentDelta, 0, 1);

  if (state.music.pending) {
    const pendingTarget = musicTargetVolume(state.music.pendingKey);
    const pendingDelta = clamp(pendingTarget - state.music.pending.volume, -maxStep, maxStep);
    state.music.pending.volume = clamp(state.music.pending.volume + pendingDelta, 0, 1);
  }

  if (state.music.pending && (!state.music.current || state.music.current.ended || state.music.current.volume <= 0.01)) {
    promotePendingMusicTrack();
  }
}

function systemCenter() {
  return { x: WIDTH * 0.5, y: HEIGHT * 0.53 };
}

function currentSystemArchetype() {
  return SYSTEM_ARCHETYPES.find((archetype) => archetype.id === state.currentSystemArchetypeId) || SYSTEM_ARCHETYPES[0];
}

function travelableArchetypes() {
  return SYSTEM_ARCHETYPES.filter((archetype) => Array.isArray(archetype.bodies) && archetype.bodies.length > 0);
}

function seededUnit(seed) {
  const value = Math.sin(seed * 91.733 + 17.13) * 10000;
  return value - Math.floor(value);
}

function generatedBodyLabel(template, systemNumber) {
  return `${template.label}-${systemNumber}`;
}

function createGeneratedBodies(archetype, systemIndex) {
  const systemNumber = systemIndex + 1;
  const labelByKey = new Map();
  archetype.bodies.forEach((template) => {
    labelByKey.set(template.key, generatedBodyLabel(template, systemNumber));
  });

  return archetype.bodies.map((template, templateIndex) => {
    const seed = (systemIndex + 1) * 103 + templateIndex * 37 + archetype.id.length * 19;
    const orbitJitter = template.type === "moon" ? 3 : template.type === "asteroid" ? 9 : 6;
    const speedJitter = 1 + (seededUnit(seed + 1) - 0.5) * 0.12;
    return {
      label: labelByKey.get(template.key),
      type: template.type,
      parent: template.parentKey ? labelByKey.get(template.parentKey) : undefined,
      orbit: Math.max(28, Math.round(template.orbit + (seededUnit(seed) - 0.5) * orbitJitter)),
      orbitScale: template.orbitScale,
      radius: template.radius,
      speed: Math.max(0.035, template.speed * speedJitter),
      phase: (template.phase + seededUnit(seed + 2) * 0.72) % TWO_PI,
      spin: Math.max(0.12, template.spin * (1 + (seededUnit(seed + 3) - 0.5) * 0.18)),
      spinPhase: (template.spinPhase + seededUnit(seed + 4) * 0.6) % TWO_PI,
      tilt: clamp(template.tilt + (seededUnit(seed + 5) - 0.5) * 0.08, -0.72, 0.72),
      color: template.color,
      accent: template.accent,
      orbitColor: template.orbitColor,
    };
  });
}

function loadStarterSystemBodies() {
  bodies.splice(0, bodies.length, ...STARTER_BODIES.map(cloneBody));
  captureBodyBaselines();
}

function loadGeneratedSystemBodies(archetype, systemIndex) {
  const generatedBodies = createGeneratedBodies(archetype, systemIndex);
  bodies.splice(0, bodies.length, ...generatedBodies);
  captureBodyBaselines();
}

function naturalResourceValues() {
  const archetype = currentSystemArchetype();
  const pulse = archetype.resourcePulse || {};
  const stabilityLevel = stabilityProjectLevel();
  const stabilityDrift = archetype.stabilityDrift * Math.max(0.58, 1 - stabilityLevel * 0.12);
  return {
    mass: STARTING_RESOURCES.mass + Math.max(0, Math.sin(state.elapsed * 0.5)) * 18 * (pulse.mass || 1) + state.cycle * archetype.cycleMassGain,
    volatiles: STARTING_RESOURCES.volatiles + Math.max(0, Math.cos(state.elapsed * 0.28)) * 5 * (pulse.volatiles || 1),
    plasma: STARTING_RESOURCES.plasma + Math.max(0, Math.sin(state.elapsed * 0.35)) * 22 * (pulse.plasma || 1),
    exotic: STARTING_RESOURCES.exotic,
    population: STARTING_RESOURCES.population,
    crew: STARTING_RESOURCES.crew,
    fleet: STARTING_RESOURCES.fleet,
    stability: 87 + stabilityLevel * 1.5 - state.cycle * stabilityDrift + Math.sin(state.elapsed * 0.18) * 2.4,
  };
}

function anchorResourceAdjustmentsToCurrent() {
  const natural = naturalResourceValues();
  state.massAdjustment = state.mass - natural.mass;
  state.volatilesAdjustment = state.volatiles - natural.volatiles;
  state.plasmaAdjustment = state.plasma - natural.plasma;
  state.exoticAdjustment = state.exotic - natural.exotic;
  state.populationAdjustment = state.population - natural.population;
  state.crewAdjustment = state.crew - natural.crew;
  state.fleetAdjustment = state.fleet - natural.fleet;
  state.stabilityAdjustment = state.stability - natural.stability;
}

function captureResourceState() {
  return {
    mass: state.mass,
    volatiles: state.volatiles,
    plasma: state.plasma,
    exotic: state.exotic,
    population: state.population,
    crew: state.crew,
    fleet: state.fleet,
    stability: state.stability,
  };
}

function restoreResourceState(resources) {
  state.mass = resources.mass;
  state.volatiles = resources.volatiles;
  state.plasma = resources.plasma;
  state.exotic = resources.exotic;
  state.population = resources.population;
  state.crew = resources.crew;
  state.fleet = resources.fleet;
  state.stability = resources.stability;
}

function scaledStructureRates(blueprint) {
  const multipliers = currentSystemArchetype().structureRateMultipliers?.[blueprint.id] || {};
  const logisticsLevel = logisticsProjectLevel();
  const automationLevel = automationProjectLevel();
  const civicLevel = civicGrowthProjectLevel();
  const prospectingLevel = projectLevel("asteroid-prospecting");
  const refineryLevel = projectLevel("asteroid-refineries");
  const refuelingLevel = projectLevel("orbital-refueling");
  const syntheticLevel = projectLevel("synthetic-ecologies");
  const singularityLevel = projectLevel("singularity-theory");
  const rates = {};
  for (const [resource, rate] of Object.entries(blueprint.rates)) {
    let scaledRate = rate * (multipliers[resource] || 1);
    if (CIVIC_BLUEPRINT_IDS.has(blueprint.id)) {
      if (resource === "population") {
        scaledRate *= 1 + civicLevel * 0.2;
      } else if (resource === "crew") {
        scaledRate *= 1 + civicLevel * 0.08;
      } else if (resource === "volatiles" && scaledRate < 0) {
        scaledRate *= 1 + civicLevel * 0.05;
      }
    }
    if (blueprint.id === "collector") {
      if (resource === "mass") {
        scaledRate *= 1 + prospectingLevel * 0.14 + refineryLevel * 0.12;
      } else if (resource === "volatiles") {
        scaledRate *= 1 + prospectingLevel * 0.1 + refineryLevel * 0.08;
      }
    }
    if (blueprint.id === "shipyard") {
      if (resource === "fleet") {
        scaledRate *= 1 + refuelingLevel * 0.16;
      } else if (resource === "plasma" && scaledRate < 0) {
        scaledRate *= Math.max(0.68, 1 - refuelingLevel * 0.1);
      }
    }
    if (blueprint.id === "survey-array" && resource === "plasma" && scaledRate < 0) {
      scaledRate *= Math.max(0.62, 1 - projectLevel("survey-network") * 0.1);
    }
    if (blueprint.id === "solar-lifter" && resource === "plasma") {
      scaledRate *= 1 + refineryLevel * 0.18;
    }
    if (blueprint.id === "synthetic-world" && syntheticLevel > 0) {
      if (resource === "population" || resource === "volatiles" || resource === "stability") {
        scaledRate *= 1 + syntheticLevel * 0.12;
      }
    }
    if (blueprint.id === "black-hole" && resource === "exotic") {
      scaledRate *= 1 + singularityLevel * 0.2;
    }
    if (automationLevel > 0 && AUTOMATION_BLUEPRINT_IDS.has(blueprint.id)) {
      if (resource !== "stability" && resource !== "population" && resource !== "crew" && scaledRate > 0) {
        scaledRate *= 1 + automationLevel * 0.12;
      } else if (resource !== "stability" && scaledRate < 0) {
        scaledRate *= Math.max(0.72, 1 - automationLevel * 0.06);
      }
    }
    if (resource !== "stability" && logisticsLevel > 0) {
      scaledRate *= scaledRate > 0
        ? 1 + logisticsLevel * 0.12
        : Math.max(0.78, 1 - logisticsLevel * 0.06);
    }
    rates[resource] = scaledRate;
  }
  if (blueprint.id === "mass-driver") {
    rates.mass = (rates.mass || 0) + prospectingLevel * 0.08 + refineryLevel * 0.14;
    if (refineryLevel > 0) {
      rates.volatiles = (rates.volatiles || 0) + refineryLevel * 0.025;
    }
  }
  if (blueprint.id === "solar-rig" && refineryLevel > 0) {
    rates.plasma = (rates.plasma || 0) * (1 + refineryLevel * 0.08);
  }
  if (automationLevel > 0 && AUTOMATION_BLUEPRINT_IDS.has(blueprint.id)) {
    rates.stability = (rates.stability || 0) - automationLevel * 0.006;
  }
  return rates;
}

function systemDetailText() {
  const archetype = currentSystemArchetype();
  return `${state.systemName}: ${archetype.opportunity} Hazard: ${archetype.hazard}`;
}

function restoreSystemLayout() {
  structures.splice(STARTER_STRUCTURE_COUNT);

  for (const body of bodies) {
    const baseline = bodyBaselines.get(body.label);
    if (!baseline) {
      continue;
    }
    body.orbit = baseline.orbit;
    body.speed = baseline.speed;
    body.phase = baseline.phase;
    body.spin = baseline.spin;
    body.spinPhase = baseline.spinPhase;
    body.tilt = baseline.tilt;
    body.guidancePulse = 0;
  }

  for (const structure of structures) {
    const baseline = structureBaselines.get(structure.label);
    if (!baseline) {
      continue;
    }
    structure.orbit = baseline.orbit;
    structure.speed = baseline.speed;
    structure.phase = baseline.phase;
    structure.commandPulse = baseline.commandPulse;
    structure.uptime = 0;
    structure.offline = false;
    structure.offlineReason = "";
  }
}

function findBody(label) {
  return bodies.find((body) => body.label === label) || null;
}

function findStructure(label) {
  return structures.find((structure) => structure.label === label) || null;
}

function primaryPlayer() {
  return state.players[0];
}

function playerBySlot(slot) {
  return state.players[slot - 1] || primaryPlayer();
}

function activePlayers() {
  return state.players.filter((player) => player.active);
}

function playersWithSelection(kind, label) {
  return activePlayers().filter((player) => player.selectedKind === kind && player.selectedLabel === label);
}

function playersWithDraftedAsteroid(label) {
  return activePlayers().filter((player) => player.impactAsteroidLabel === label);
}

function playersWithDraftedTarget(label) {
  return activePlayers().filter((player) => player.impactTargetLabel === label);
}

function playerPrefix(player) {
  return player?.id === 1 ? "" : `${player.label}: `;
}

function burstStyleForTone(tone = "operate") {
  return ACTION_BURST_STYLES[tone] || ACTION_BURST_STYLES.operate;
}

function rgba(rgb, alpha = 1) {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

function currentIntent(player = primaryPlayer()) {
  return IMPACT_INTENTS[player.impactIntentIndex] || IMPACT_INTENTS[0];
}

function syncPlayerCommandIntent(player) {
  player.commandIntent = currentIntent(player).id;
}

function defaultTargetBody() {
  return findBody(DEFAULT_PLAYER_SELECTION.impactTargetLabel) || firstTargetPlanet() || bodies[0] || null;
}

function defaultAsteroidBody() {
  return findBody(DEFAULT_PLAYER_SELECTION.impactAsteroidLabel)
    || firstAvailableAsteroid()
    || bodies.find((body) => body.type === "asteroid")
    || null;
}

function ensurePlayerSelection(player = primaryPlayer()) {
  if (!player) {
    return primaryPlayer();
  }

  let selected = player.selectedKind === "structure" ? findStructure(player.selectedLabel) : findBody(player.selectedLabel);
  if (!selected) {
    const fallback = defaultTargetBody();
    if (fallback) {
      player.selectedKind = "body";
      player.selectedLabel = fallback.label;
      selected = fallback;
    }
  }

  if (player.selectedKind === "body") {
    const bodyIndex = bodies.findIndex((body) => body.label === player.selectedLabel);
    player.focusIndex = bodyIndex >= 0 ? bodyIndex : Math.max(0, Math.min(player.focusIndex || 0, bodies.length - 1));
    player.focusTargetLabel = bodies[player.focusIndex]?.label || player.selectedLabel;
  } else if (!bodies[player.focusIndex]) {
    const fallbackFocus = defaultTargetBody();
    player.focusIndex = fallbackFocus ? bodies.indexOf(fallbackFocus) : 0;
    player.focusTargetLabel = fallbackFocus?.label || "";
  }

  const target = findBody(player.impactTargetLabel);
  if (!target || !isTargetBody(target)) {
    player.impactTargetLabel = defaultTargetBody()?.label || "";
  }

  const asteroid = findBody(player.impactAsteroidLabel);
  if (!asteroid || asteroid.type !== "asteroid") {
    player.impactAsteroidLabel = defaultAsteroidBody()?.label || "";
  }

  player.impactIntentIndex = clamp(player.impactIntentIndex, 0, IMPACT_INTENTS.length - 1);
  syncPlayerCommandIntent(player);
  return player;
}

function resetPlayerForSystem(player, { target = null, asteroid = null } = {}) {
  const targetBody = target || defaultTargetBody();
  const asteroidBody = asteroid || defaultAsteroidBody();
  player.active = player.id === 1 || Number.isInteger(player.controllerIndex);
  player.focusIndex = targetBody ? bodies.indexOf(targetBody) : DEFAULT_PLAYER_SELECTION.focusIndex;
  player.focusTargetLabel = targetBody?.label || DEFAULT_PLAYER_SELECTION.selectedLabel;
  player.lastBodyLabel = targetBody?.label || DEFAULT_PLAYER_SELECTION.selectedLabel;
  player.lastStructureLabel = "";
  player.selectedKind = targetBody ? "body" : DEFAULT_PLAYER_SELECTION.selectedKind;
  player.selectedLabel = targetBody?.label || DEFAULT_PLAYER_SELECTION.selectedLabel;
  player.impactAsteroidLabel = asteroidBody?.label || DEFAULT_PLAYER_SELECTION.impactAsteroidLabel;
  player.impactTargetLabel = targetBody?.label || DEFAULT_PLAYER_SELECTION.impactTargetLabel;
  player.impactIntentIndex = DEFAULT_PLAYER_SELECTION.impactIntentIndex;
  player.buildBlueprintIndex = openingBlueprintIndex();
  player.localMenuOpen = false;
  player.localActionIndex = 0;
  player.inputSnapshot = {};
  syncPlayerCommandIntent(player);
  ensurePlayerSelection(player);
}

function resetAllPlayersForSystem(options = {}) {
  for (const player of state.players) {
    resetPlayerForSystem(player, options);
  }
}

function resourceAdjustmentKey(resource) {
  return resource + "Adjustment";
}

function formatPopulation(value) {
  const safeValue = Math.max(0, Number(value) || 0);
  if (safeValue >= 1000) {
    const billions = safeValue / 1000;
    return `${billions >= 10 ? Math.round(billions) : billions.toFixed(1)}B`;
  }
  if (safeValue >= 100) {
    return `${Math.round(safeValue)}M`;
  }
  return `${safeValue.toFixed(1)}M`;
}

function formatResourceAmount(resource, value) {
  if (resource === "population") {
    return formatPopulation(value);
  }
  if (resource === "stability") {
    return `${Math.ceil(value)}%`;
  }
  if (resource === "crew" || resource === "fleet" || resource === "exotic") {
    const numeric = Number(value) || 0;
    return numeric === Math.trunc(numeric) ? String(numeric) : numeric.toFixed(1);
  }
  return String(Math.ceil(value));
}

function formatResourceNeed(resource, value) {
  return `${RESOURCE_LABELS[resource] || resource} ${formatResourceAmount(resource, value)}`;
}

function formatResourceValue(resource, value) {
  if (resource === "stability") {
    return `${Math.round(value)}%`;
  }
  if (resource === "population") {
    return formatPopulation(value);
  }
  if (resource === "crew" || resource === "fleet" || resource === "exotic") {
    return value.toFixed(1);
  }
  return String(Math.round(value));
}

function formatResourceList(resources) {
  return Object.entries(resources)
    .map(([resource, value]) => `${RESOURCE_LABELS[resource] || resource} ${formatResourceAmount(resource, value)}`)
    .join(" / ");
}

function compactResourceLabel(resource) {
  return COMPACT_RESOURCE_LABELS[resource] || RESOURCE_LABELS[resource] || resource;
}

function formatCompactResourceList(resources) {
  return Object.entries(resources)
    .map(([resource, value]) => `${compactResourceLabel(resource)} ${formatResourceAmount(resource, value)}`)
    .join(" / ");
}

function formatRates(rates) {
  return Object.entries(rates)
    .map(([resource, rate]) => {
      const sign = rate > 0 ? "+" : "";
      const suffix = resource === "stability" ? "%/s" : "/s";
      return `${sign}${rate.toFixed(rate === Math.trunc(rate) ? 0 : 2)} ${RESOURCE_LABELS[resource] || resource}${suffix}`;
    })
    .join("  ");
}

function formatCompactRates(rates) {
  return Object.entries(rates)
    .map(([resource, rate]) => {
      const sign = rate > 0 ? "+" : "";
      const suffix = resource === "stability" ? "%/s" : "/s";
      const precision = Math.abs(rate) >= 1 || rate === Math.trunc(rate) ? 0 : 2;
      return `${sign}${rate.toFixed(precision)} ${compactResourceLabel(resource)}${suffix}`;
    })
    .join("  ");
}

function bodyPopulationWeight(body) {
  if (body.type === "planet") {
    return Math.max(0.8, body.radius / 11);
  }
  if (body.type === "moon") {
    return Math.max(0.08, body.radius / 26);
  }
  return 0;
}

function structurePopulationWeight(structure) {
  const key = structureLabelKey(structure);
  const baseWeight = STRUCTURE_POPULATION_WEIGHTS[key] || 0.03;
  return baseWeight * Math.max(1, structureLevel(structure));
}

function totalPopulationWeight() {
  const bodyWeight = bodies.reduce((total, body) => total + bodyPopulationWeight(body), 0);
  const structureWeight = structures.reduce((total, structure) => total + structurePopulationWeight(structure), 0);
  return Math.max(1, bodyWeight + structureWeight);
}

function localPopulationForWeight(weight) {
  if (weight <= 0 || state.population <= 0) {
    return 0;
  }
  return (state.population * weight) / totalPopulationWeight();
}

function populationForBody(body) {
  return localPopulationForWeight(bodyPopulationWeight(body));
}

function populationForStructure(structure) {
  return localPopulationForWeight(structurePopulationWeight(structure));
}

function populationForSelection(selected) {
  return selected.kind === "structure"
    ? populationForStructure(selected.item)
    : populationForBody(selected.item);
}

function compactPopulationReadout(selected) {
  return `pop ${formatPopulation(populationForSelection(selected))}`;
}

const STRUCTURE_OUTCOME_COPY = {
  collector: {
    story: ({ anchor }) => `${anchor} now has scavenger frames sweeping rock slag into sorted storage instead of letting it drift past the colony.`,
    now: "Boost Collectors can dump emergency Mass and Volatiles; Solar Lifting Rig plans are unblocked on inner worlds.",
  },
  habitat: {
    story: ({ anchor }) => `${anchor} has moved from work camp to living orbit: pressure shells, gardens, and maintenance crews are finally part of the system.`,
    now: "Population and Crew start growing, stability gets a small support buffer, and Shipyard Cradle becomes the next major build.",
  },
  shipyard: {
    story: ({ anchor }) => `${anchor} can now assemble hull frames instead of waiting on imported launches and improvised dock work.`,
    now: "Rush Hull is available, Fleet starts accumulating, and Orbital Refueling can be funded from this deck.",
  },
  "survey-array": {
    story: ({ anchor }) => `${anchor} has a cold observatory ring listening past local traffic and cleaning up the system's telemetry.`,
    now: "Survey projects live here, from Deep Survey Network through asteroid prospecting and late relay work.",
  },
  "solar-rig": {
    story: ({ anchor }) => `${anchor} has a close-in plasma skimmer drinking from the star and feeding the early energy economy.`,
    now: "Surge Lift gives fast Plasma bursts, and the refinery path can later scale this into Solar Lifter work.",
  },
  retrofit: {
    story: ({ anchor }) => `${anchor} has a repair platform that can patch orbital stress before small problems become system collapse.`,
    now: "Patch Planet is available for stability recovery, and the platform passively trades materials for safer operations.",
  },
  "mass-driver": {
    story: ({ anchor }) => `${anchor} now has the first serious kinetic relay: asteroid handling has become infrastructure, not improvisation.`,
    now: "Prime Driver can ready idle asteroids, and Asteroid Refineries can turn prospecting into industrial feedstock.",
  },
  "solar-lifter": {
    story: ({ anchor }) => `${anchor} has stepped into mature stellar industry with a full siphon built to move serious plasma.`,
    now: "Lift Plasma gives larger energy bursts and keeps late megastructure work supplied if stability can absorb the stress.",
  },
  "o-neill-cylinder": {
    story: ({ anchor }) => `${anchor} now carries a city-scale habitat instead of a station, with civic districts rotating under their own sky.`,
    now: "Population and Crew growth jump, Megahabitat Charters pay off, and Synthetic Ecologies becomes a credible next project.",
  },
  "synthetic-world": {
    story: ({ anchor }) => `${anchor} has crossed from orbital survival into planet-making: fabricated seas, mirrors, and biosphere sectors are online.`,
    now: "Synthetic-world capacity supports large population growth, Singularity Theory, and true civilization-scale industry.",
  },
  "black-hole": {
    story: ({ anchor }) => `${anchor} has a harvester holding position at the gravity well with containment rings ready to bleed impossible matter.`,
    now: "Bleed Exotic converts Plasma into Exotic Matter when a black-hole anchor is present.",
  },
};

function anchorOutcomeText(anchorLabel = "") {
  return anchorLabel ? `${anchorLabel}'s orbit` : "local orbit";
}

function resolveOutcomeCopy(value, context) {
  return typeof value === "function" ? value(context) : value;
}

function createStructureOutcomeReport(blueprint, structure, { anchorLabel = "" } = {}) {
  const copy = STRUCTURE_OUTCOME_COPY[blueprint.id] || {};
  const context = {
    blueprint,
    structure,
    anchor: anchorOutcomeText(anchorLabel || structure.anchorLabel),
  };
  return {
    tone: "build",
    kicker: "Commission Report",
    title: `${structure.label} online`,
    story: resolveOutcomeCopy(copy.story, context)
      || `${structure.label} is now part of the local orbital economy.`,
    now: resolveOutcomeCopy(copy.now, context)
      || `Run ${blueprint.commandLabel} from the structure deck.`,
    output: `Passive ${formatCompactRates(structure.rates)}`,
  };
}

function createUpgradeOutcomeReport(structure) {
  return {
    tone: "upgrade",
    kicker: "Retrofit Report",
    title: `${structure.label} upgraded to ${structureLevelTag(structure)}`,
    story: `${structure.label} received tighter routing, better automation, and higher-capacity station modules.`,
    now: "Passive output and active command bursts are stronger from this structure.",
    output: `Updated ${formatCompactRates(structure.rates)}`,
  };
}

function createProjectOutcomeReport(project, level) {
  return {
    tone: "project",
    kicker: `${projectTrackLabel(project)} Report`,
    title: `${project.label} L${level} funded`,
    story: project.detail,
    now: projectEffectText(project, level),
    output: `${projectTrackLabel(project)} ${level}/${project.maxLevel}`,
  };
}

function createOperationOutcomeReport(structure, summary) {
  const blueprint = structure?.blueprintId ? blueprintById(structure.blueprintId) : null;
  return {
    tone: "operate",
    kicker: "Action Report",
    title: `${structureDisplayName(structure)} acted`,
    story: summary,
    now: blueprint ? `Run ${structure.commandLabel} again when reserves need a direct pulse.` : "Starter systems cycled locally.",
    output: blueprint ? `Baseline ${formatCompactRates(structure.rates)}` : structure.detail,
  };
}

function createTravelOutcomeReport({ title, story, now, output }) {
  return {
    tone: "travel",
    kicker: "Travel Report",
    title,
    story,
    now,
    output,
  };
}

function setOutcomeReport(report) {
  if (!report) {
    state.outcomeReport = null;
    renderedOutcomeSignature = "";
    return;
  }

  state.outcomeReport = {
    id: state.nextOutcomeId,
    time: state.elapsed,
    ...report,
  };
  state.nextOutcomeId += 1;
  renderedOutcomeSignature = "";
}

function compactIntentLabel(intent) {
  const id = typeof intent === "string" ? intent : intent?.id;
  return COMPACT_INTENT_LABELS[id] || intent?.label || id || "";
}

function compactHudText(text, maxLength = HUD_TEXT_LIMIT) {
  let output = String(text || "").trim();
  const replacements = [
    ["Survey cycle active. Orbital works accepting build orders.", "Survey active. Orders ready."],
    ["Survey cycle active. Orbital works and tech ladders accepting orders.", "Survey active. Tech ladder ready."],
    ["Seed system loaded. Start the run to open build orders.", "Seed ready. Start to open orders."],
    ["Seed system loaded. Start the run to begin the orbital age.", "Seed ready. Start orbital age."],
    ["Campaign reset to Helio Cradle. Local build grid restored.", "Reset to Helio Cradle."],
    ["Campaign reset to Helio Cradle. Early orbital economy restored.", "Reset to Helio Cradle."],
    ["Start with Habitat Ring. It turns volatiles into population and crew for shipyards and later survey work.", "Start with Habitat Ring."],
    ["Start with Habitat Ring. It turns volatiles into population and crew for shipyards, depots, and later science.", "Start with Habitat Ring."],
    ["Build Habitat Ring first. Impacts can tune planets after the economy is moving.", "Build Habitat first. Impacts are optional."],
    ["Build Habitat Ring first. Impacts are industrial tools later, not opening moves.", "Build Habitat first. Impacts later."],
    ["Build collectors, habitats, solar rigs, shipyards, and retrofit platforms from local asset decks.", "Use local decks."],
    ["Click a planet, asteroid, or structure. Queue an impact with Q after selecting an asteroid and target.", "Select body. Set rock and target. Queue impact."],
    ["System collapse: stability reached zero. Reset and avoid stacked hazards, impacts, and solar surges next run.", "Collapse. Reset and reduce hazard load."],
    ["Local build grid refreshed; campaign stockpiles and jump history preserved.", "Build grid refreshed."],
    ["Retrofit platforms and lighter queues reduce collapse risk.", "Patch or reduce queues."],
  ];
  for (const [from, to] of replacements) {
    output = output.split(from).join(to);
  }
  output = output.replace(/\s+/g, " ");
  if (output.length <= maxLength) {
    return output;
  }
  return output.slice(0, Math.max(0, maxLength - 3)).trimEnd() + "...";
}

function compactEventMessage(event) {
  let message = compactHudText(event.message, 64);
  message = message.replace(/ adjusted orbit to /, " -> orbit ");
  message = message.replace(/ and spin to /, " / spin ");
  message = message.replace(/ is ready for a guided nudge./, " ready.");
  message = message.replace(/ is the selected impact target./, " targeted.");
  message = message.replace(/Impact mode set to /, "Mode ");
  return compactHudText(message, 58);
}

function formatClock(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remaining}`;
}

function addEventLog(kind, message) {
  if (!message) {
    return;
  }

  const latest = state.events[0];
  if (latest?.message === message && latest.kind === kind) {
    latest.time = state.elapsed;
    return;
  }

  state.events = [
    {
      id: state.nextEventId,
      kind,
      message,
      time: state.elapsed,
    },
    ...state.events,
  ].slice(0, EVENT_LOG_LIMIT);
  state.nextEventId += 1;
}

function pulseResourceMetric(resource, amount) {
  const element = ui[resource];
  const metric = element?.closest(".metric");
  if (!metric || !Number.isFinite(amount) || Math.abs(amount) < 0.001) {
    return;
  }

  const tone = amount > 0 ? "is-gain" : "is-loss";
  metric.classList.remove("is-gain", "is-loss");
  void metric.offsetWidth;
  metric.classList.add(tone);

  const previousTimer = metricPulseTimers.get(resource);
  if (previousTimer) {
    window.clearTimeout(previousTimer);
  }

  metricPulseTimers.set(resource, window.setTimeout(() => {
    metric.classList.remove(tone);
    metricPulseTimers.delete(resource);
  }, HUD_PULSE_MS));
}

function blueprintById(id) {
  return STRUCTURE_BLUEPRINTS.find((blueprint) => blueprint.id === id) || null;
}

function blueprintIndexById(id) {
  const index = STRUCTURE_BLUEPRINTS.findIndex((blueprint) => blueprint.id === id);
  return index >= 0 ? index : 0;
}

function openingBlueprintIndex() {
  return blueprintIndexById(OPENING_BLUEPRINT_ID);
}

function projectById(id) {
  return PROJECT_BLUEPRINTS.find((project) => project.id === id) || null;
}

function projectLevel(projectId) {
  return state.projectLevels?.[projectId] || 0;
}

function hasProjectLevel(projectId, level = 1) {
  return projectLevel(projectId) >= level;
}

function projectTrackLabel(project) {
  return project?.track === "science" ? "Science" : "Engineering";
}

function completedProjectCount() {
  return Object.values(state.projectLevels || {}).reduce((total, level) => total + level, 0);
}

function scaledProjectCost(project) {
  const level = projectLevel(project.id);
  const scale = 1 + level * 0.62;
  const cost = {};
  for (const [resource, amount] of Object.entries(project.cost)) {
    cost[resource] = Math.round(amount * scale * 10) / 10;
  }
  return cost;
}

function discoveryCost() {
  const discount = projectLevel("survey-network") * 2;
  return {
    plasma: Math.max(3, DISCOVERY_COST.plasma - discount),
  };
}

function stabilityProjectLevel() {
  return projectLevel("stability-lattice");
}

function logisticsProjectLevel() {
  return projectLevel("logistics-spine");
}

function jumpSeedBonus() {
  const level = projectLevel("ark-stores");
  if (level <= 0) {
    return {};
  }
  return {
    mass: 14 * level,
    volatiles: 6 * level,
    plasma: 4 * level,
  };
}

function automationProjectLevel() {
  return projectLevel("robotic-automation");
}

function civicGrowthProjectLevel() {
  return projectLevel("civic-growth");
}

function blueprintCost(blueprint) {
  const cost = cloneResources(blueprint?.cost || {});
  const automation = automationProjectLevel();
  if (automation > 0 && AUTOMATION_BLUEPRINT_IDS.has(blueprint?.id) && cost.crew) {
    cost.crew = Math.round(cost.crew * Math.max(0.58, 1 - automation * 0.12) * 10) / 10;
  }
  return cost;
}

function structureLevel(structure) {
  return structure?.level || 1;
}

function structureLevelTag(structure) {
  return `L${structureLevel(structure)}`;
}

function commandOutputMultiplier(structure) {
  return 1 + (structureLevel(structure) - 1) * 0.35;
}

function positiveRateMultiplier(structure) {
  return 1 + (structureLevel(structure) - 1) * STRUCTURE_LEVEL_OUTPUT_STEP;
}

function negativeRateMultiplier(structure, resource) {
  if (resource === "stability") {
    return Math.max(0.72, 1 - (structureLevel(structure) - 1) * STRUCTURE_LEVEL_STABILITY_STEP);
  }
  return Math.max(0.78, 1 - (structureLevel(structure) - 1) * STRUCTURE_LEVEL_COST_REDUCTION_STEP);
}

function structureRatesForLevel(blueprint, level = 1) {
  const base = scaledStructureRates(blueprint);
  const mockStructure = { level };
  const next = {};
  for (const [resource, rate] of Object.entries(base)) {
    next[resource] = rate >= 0
      ? rate * positiveRateMultiplier(mockStructure)
      : rate * negativeRateMultiplier(mockStructure, resource);
  }
  return next;
}

function structureLabelKey(structure) {
  if (structure?.blueprintId) {
    return structure.blueprintId;
  }
  return structure?.starterId || structure?.label?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "structure";
}

function cleanGeneratedLabel(label = "") {
  return String(label).replace(/-\d+$/, "");
}

function structureDisplayName(structure) {
  if (!structure) {
    return "";
  }
  return structure.blueprintId ? `${structure.label} ${structureLevelTag(structure)}` : structure.label;
}

function bodyArtKey(body) {
  const rawLabel = String(body?.label || "").toLowerCase();
  const cleanLabel = cleanGeneratedLabel(rawLabel);
  if (rawLabel === "icar-01") {
    return "icar-01";
  }
  if (cleanLabel === "aster") {
    return "aster";
  }
  if (cleanLabel === "vela") {
    return "vela";
  }
  if (cleanLabel === "morrow") {
    return "morrow";
  }
  if (cleanLabel === "latch") {
    return "latch";
  }
  if (cleanLabel === "reef") {
    return "reef";
  }
  if (body?.type === "black-hole" || body?.type === "blackhole" || body?.type === "singularity") {
    return "black-hole-body";
  }
  return body?.type || "planet";
}

function focusArtForSelection(selected) {
  if (selected.kind === "structure") {
    return FOCUS_ART_LIBRARY[structureLabelKey(selected.item)] || FOCUS_ART_LIBRARY.planet;
  }
  return FOCUS_ART_LIBRARY[bodyArtKey(selected.item)] || FOCUS_ART_LIBRARY.planet;
}

function canBlueprintAnchorOnBody(blueprint, body) {
  if (!blueprint || !body) {
    return false;
  }
  if (blueprint.id === "black-hole") {
    return body.type === "black-hole" || body.type === "blackhole" || body.type === "singularity";
  }
  if (body.type !== "planet") {
    return false;
  }
  if (blueprint.id === "solar-rig" || blueprint.id === "solar-lifter") {
    return body.orbit <= 120;
  }
  return true;
}

function localBlueprintCandidates(body) {
  const recommended = recommendedBlueprintId();
  const orderedIds = [
    recommended,
    ...BLUEPRINT_ACTION_PRIORITY,
  ].filter(Boolean);
  const seen = new Set();
  const candidates = [];

  for (const id of orderedIds) {
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    const blueprint = blueprintById(id);
    if (blueprint && canBlueprintAnchorOnBody(blueprint, body)) {
      candidates.push(blueprint);
    }
  }

  return candidates.slice(0, 4);
}

function structureUpgradeCost(structure) {
  const blueprint = structure?.blueprintId ? blueprintById(structure.blueprintId) : null;
  if (!blueprint || structureLevel(structure) >= STRUCTURE_UPGRADE_MAX_LEVEL) {
    return null;
  }
  const multiplier = 0.58 + (structureLevel(structure) - 1) * 0.44;
  return scaleResources(blueprintCost(blueprint), multiplier);
}

function canUpgradeStructure(structure) {
  const cost = structureUpgradeCost(structure);
  if (!cost) {
    return false;
  }
  return Object.entries(cost).every(([resource, amount]) => (state[resource] || 0) >= amount);
}

function disassembleRefund(structure) {
  return scaleResources(structure?.investedCost || {}, STRUCTURE_DISASSEMBLE_REFUND_RATIO);
}

function canDisassembleStructure(structure) {
  if (!structure?.blueprintId || state.phase !== "running") {
    return false;
  }
  return structureLevel(structure) > 1
    || builtStructureTypeCount(structure.blueprintId) > 1
    || state.cycle >= STRUCTURE_DISASSEMBLE_UNLOCK_CYCLE;
}

function projectActionsForSelection(selected) {
  if (selected.kind !== "structure") {
    return [];
  }

  const structure = selected.item;
  if (structure.blueprintId === "survey-array" || structure.label === "Survey Array") {
    return ["survey-network", "asteroid-prospecting", "deep-space-relays", "singularity-theory"];
  }
  if (structure.blueprintId === "habitat" || structure.blueprintId === "retrofit") {
    return ["stability-lattice", "civic-growth", "megahabitat-charters"];
  }
  if (structure.blueprintId === "shipyard") {
    return ["orbital-refueling", "logistics-spine", "robotic-automation", "warp-drives", "ark-stores"];
  }
  if (structure.blueprintId === "mass-driver") {
    return ["asteroid-refineries"];
  }
  if (structure.blueprintId === "o-neill-cylinder") {
    return ["synthetic-ecologies"];
  }
  return [];
}

function selectionLearnText(player, selected) {
  if (selected.kind === "structure") {
    const anchor = selected.item.anchorLabel ? ` Anchored from ${selected.item.anchorLabel}.` : "";
    if (localActionMenuOpen(player)) {
      return `Structure control live.${anchor} Move the stick across actions, press A to execute, and press B to step back out.`;
    }
    if (selected.item.blueprintId === "survey-array" || selected.item.label === "Survey Array") {
      return `Press A to enter the Survey Array control deck.${anchor} This is where the science ladder lives: survey networking, asteroid prospecting, relay work, and eventually singularity theory.`;
    }
    if (selected.item.blueprintId === "shipyard") {
      return `Press A to enter the Shipyard deck.${anchor} Engineering projects here take you from orbital refueling to freight logistics and finally warp-drive construction.`;
    }
    if (selected.item.blueprintId === "mass-driver" || selected.item.label === "Mass Driver") {
      return `Press A to enter the Mass Driver deck.${anchor} It becomes worthwhile after prospecting science is online and you are ready to turn asteroids into deliberate industry.`;
    }
    if (selected.item.blueprintId === "solar-lifter" || selected.item.label === "Solar Lifter") {
      return `Press A to enter the Solar Lifter deck.${anchor} This is a late stellar-industry structure that belongs after prospecting, refineries, and broader logistics are already stable.`;
    }
    if (selected.item.blueprintId === "o-neill-cylinder") {
      return `Press A to enter the O'Neill Cylinder deck.${anchor} This is the shift from stations to city-scale habitats, and it opens the path toward synthetic worlds.`;
    }
    if (selected.item.blueprintId === "synthetic-world") {
      return `Press A to enter the Synthetic World deck.${anchor} Once you can support this, singularity theory and warp engineering finally become believable next steps.`;
    }
    if (selected.item.blueprintId) {
      return `Press A to expand this orbital into a larger control deck.${anchor} LB jumps back to worlds, RB returns to orbitals, and upgrades, salvage, or tech stay local here instead of in the suggestion rail.`;
    }
    return "Press A to expand this starter structure into its local control deck instead of relying on the suggestion rail.";
  }

  if (localActionMenuOpen(player)) {
    return `${selected.item.label} local deck live. Move the stick across actions, press A to execute, and press B to step back out.`;
  }

  if (selected.item.type === "asteroid") {
    return `Press A to open the asteroid action deck. This rock is already loaded for ${findBody(player.impactTargetLabel)?.label || "the current target"}, so you can queue the impact from there when ready.`;
  }
  if (selected.item.type === "black-hole" || selected.item.type === "blackhole" || selected.item.type === "singularity") {
    return "Press A to open the black-hole action deck. Black holes anchor harvesters, so singularity orbitals are commissioned from this local menu.";
  }
  if (selected.item.type === "moon") {
    return "Moons are observation anchors and hazards. They usually have fewer local actions, but A will still open the local deck when there is something to do here.";
  }
  return "Selecting a planet makes it the current target. Press A to open its local build deck, LB keeps you on world lanes, and RB jumps across to orbital lanes.";
}

function suggestedGoalCards() {
  if (state.phase === "boot") {
    return [
      {
        title: "Start in local orbit",
        detail: "Click Aster or Morrow. Day one is orbital industry and depots, not warp travel.",
      },
      {
        title: "Build Habitat Ring first",
        detail: "Habitats turn Volatiles into Crew so you can grow into Shipyard work and local science.",
      },
      {
        title: "Interstellar is late game",
        detail: "Megahabitats, synthetic worlds, singularity theory, and warp drives all sit far above the opening economy.",
      },
    ];
  }

  if (!hasBuiltStructure("habitat")) {
    return [
      {
        title: "Build Habitat Ring",
        detail: "Select a planet and commission Habitat Ring from its local menu.",
      },
      {
        title: "Protect stability",
        detail: "Solar surges and impacts are risky before retrofits and lattices exist.",
      },
      {
        title: "Stay near-future for now",
        detail: "First get crew and baseline production online. The late Isaac Arthur stuff comes much later.",
      },
    ];
  }

  if (!hasBuiltStructure("shipyard")) {
    return [
      {
        title: `Grow Crew to 3`,
        detail: `You have ${state.crew.toFixed(1)}. Run Habitat Rings and keep Volatiles flowing.`,
      },
      {
        title: "Build Shipyard Cradle",
        detail: "Select a planet and commission the shipyard once Habitat support is online.",
      },
      {
        title: "Keep cislunar industry tidy",
        detail: "Fund Stability Lattice if drift feels rough, but stay focused on getting a working shipyard online.",
      },
    ];
  }

  if (!hasProjectLevel("orbital-refueling")) {
    return [
      {
        title: "Fund Orbital Refueling",
        detail: "Select Shipyard Cradle and fund the refueling project. Heavy orbital work should not happen before depots and tanker logistics exist.",
      },
      {
        title: "Keep crew on hand",
        detail: `Refueling needs crew and plasma. Current Crew ${state.crew.toFixed(1)}, Plasma ${Math.floor(state.plasma)}.`,
      },
      {
        title: "Survey can wait a minute",
        detail: "We are still building near-future orbital competence before pushing into asteroid industry or deep-space relays.",
      },
    ];
  }

  if (!hasBuiltStructure("survey-array")) {
    return [
      {
        title: "Build Survey Array",
        detail: "Now that refueling exists, commission Survey Array from a selected world to open the science track.",
      },
      {
        title: "Hold off on impacts",
        detail: "Mass Driver is now a later industrial tool. Keep growing resources before you start reshaping orbits.",
      },
      {
        title: "Prepare the energy budget",
        detail: "Collectors and solar rigs help support the observatory tier and later stellar industry.",
      },
    ];
  }

  if (!hasProjectLevel("survey-network")) {
    return [
      {
        title: "Fund Survey Network",
        detail: "Survey Network is the first real science project. It makes later charting cheaper and starts the asteroid path.",
      },
      {
        title: "Keep Shipyard running",
        detail: `Shipyards turn Mass and Plasma into Fleet. Current Fleet ${state.fleet.toFixed(1)}.`,
      },
      {
        title: "Still no interstellar rush",
        detail: "This is observatory groundwork. Charting and travel remain late-game until much more science and engineering is complete.",
      },
    ];
  }

  if (!hasProjectLevel("asteroid-prospecting")) {
    return [
      {
        title: "Fund Asteroid Prospecting",
        detail: "Select Survey Array and push beyond simple charts into ore mapping, trajectory math, and industrial targeting.",
      },
      {
        title: !hasBuiltStructure("mass-driver") ? "Mass Driver comes next" : "Prepare ore flow",
        detail: !hasBuiltStructure("mass-driver")
          ? "Mass Driver unlocks after prospecting. It should feel earned, not starter tech."
          : "If you already built it, line up stable asteroids and let the system learn to move mass deliberately.",
      },
      {
        title: "Solar industry is parallel",
        detail: "Collectors and solar rigs can grow beside the asteroid track so plasma is ready when refineries show up.",
      },
    ];
  }

  if (!hasBuiltStructure("mass-driver")) {
    return [
      {
        title: "Build Mass Driver",
        detail: "Commission Mass Driver from a world menu once prospecting is online.",
      },
      {
        title: "Turn asteroids into industry",
        detail: "This is the handoff from observation to heavy engineering. Impacts should now feel like infrastructure, not chaos.",
      },
      {
        title: "Keep stability buffered",
        detail: "World-shaping comes with risk; patch with retrofits or lattices if the system gets shaky.",
      },
    ];
  }

  if (!hasProjectLevel("asteroid-refineries")) {
    return [
      {
        title: "Fund Asteroid Refineries",
        detail: "Select Mass Driver and convert prospecting into actual ore cracking, slag handling, and feedstock pipelines.",
      },
      {
        title: !hasBuiltStructure("solar-rig") ? "Add Solar Rig" : "Scale Solar Rig",
        detail: !hasBuiltStructure("solar-rig")
          ? "A close-in Solar Lifting Rig helps feed later stellar work."
          : "Solar work and asteroid refining together prepare the real plasma economy.",
      },
      {
        title: "Megastructures still ahead",
        detail: "Solar Lifters, O'Neill cylinders, and synthetic worlds are still above this tier.",
      },
    ];
  }

  if (!hasBuiltStructure("solar-lifter")) {
    return [
      {
        title: "Build Solar Lifter",
        detail: "Now the stellar megastructure tier opens. Commission Solar Lifter from an inner world after refineries are funded.",
      },
      {
        title: "Fund freight webs in parallel",
        detail: projectLevel("logistics-spine") < 1
          ? "Shipyard engineering should still push Logistics Spine upward."
          : "Logistics Spine compounds the value of every late orbital you build.",
      },
      {
        title: "This is still pre-warp",
        detail: "We are building serious stellar industry, but not leaving the system yet.",
      },
    ];
  }

  if (!hasProjectLevel("megahabitat-charters")) {
    return [
      {
        title: "Fund Megahabitat Charters",
        detail: "Select Habitat Ring and shift from stations to full city-scale orbital design.",
      },
      {
        title: "Keep logistics healthy",
        detail: "Megahabitats make sense only once refueling and freight infrastructure already work.",
      },
      {
        title: "Synthetic worlds come after cities",
        detail: "O'Neill cylinders should arrive before planet-scale fabrication.",
      },
    ];
  }

  if (!hasBuiltStructure("o-neill-cylinder")) {
    return [
      {
        title: "Build O'Neill Cylinder",
        detail: "Commission your first true megahabitat from a selected world.",
      },
      {
        title: "Let city-scale life support breathe",
        detail: "High crew and stable volatiles make this feel like a civilization step, not just another upgrade.",
      },
      {
        title: "Synthetic world research is next",
        detail: "Once megahabitats exist, world-shell ecology becomes plausible.",
      },
    ];
  }

  if (!hasProjectLevel("synthetic-ecologies")) {
    return [
      {
        title: "Fund Synthetic Ecologies",
        detail: "Select the O'Neill Cylinder and push life-support science toward whole artificial worlds.",
      },
      {
        title: "Keep plasma reserves up",
        detail: "Synthetic world work is hungry. Stellar industry should already be doing real labor for you.",
      },
      {
        title: "Singularity theory waits beyond this",
        detail: "Warp math is still locked behind civilization-scale habitat and biosphere engineering.",
      },
    ];
  }

  if (!hasBuiltStructure("synthetic-world")) {
    return [
      {
        title: "Build Synthetic World",
        detail: "Commission a synthetic world only after megahabitats and ecology research are both mature.",
      },
      {
        title: "A real civilization marker",
        detail: "This is the point where the project stops being orbital survival and becomes system-scale civilization building.",
      },
      {
        title: "Deep-space relays follow",
        detail: "Once worlds can be built, interstellar baselines finally make sense.",
      },
    ];
  }

  if (!hasProjectLevel("deep-space-relays")) {
    return [
      {
        title: "Fund Deep Space Relays",
        detail: "Select Survey Array and build the first true interstellar baseline network.",
      },
      {
        title: "Charting is okay now",
        detail: "Relays unlock charting, but you still will not be able to travel until warp engineering arrives.",
      },
      {
        title: "Singularity theory is next",
        detail: "We still need compact gravity engineering before the colony can move between stars.",
      },
    ];
  }

  if (!hasProjectLevel("singularity-theory")) {
    return [
      {
        title: "Fund Singularity Theory",
        detail: "Select Survey Array and turn deep-space relays plus synthetic-world capacity into actual gravity engineering.",
      },
      {
        title: "Black-hole tech finally enters play",
        detail: "This is the first point where the game starts speaking the language of singularities and warp math.",
      },
      {
        title: "Shipyard engineering still matters",
        detail: "Warp drives will be funded from Shipyard after the science case is closed.",
      },
    ];
  }

  if (!hasProjectLevel("warp-drives")) {
    return [
      {
        title: "Fund Warp Drives",
        detail: "Select Shipyard Cradle and turn singularity theory into actual interstellar hardware.",
      },
      {
        title: "No early exits",
        detail: "This is the deliberate gate: charting can happen, but leaving the system stays impossible until this project lands.",
      },
      {
        title: "Ark Stores are optional polish",
        detail: "Once warp drives exist, cargo seeding and smoother jumps become the secondary engineering lane.",
      },
    ];
  }

  if (!state.discoveredSystem) {
    return [
      {
        title: "Chart the next system",
        detail: canDiscoverSystem()
          ? `Select Survey Array and chart for ${formatCompactResourceList(discoveryCost())}.`
          : `Charting still needs ${missingDiscoveryRequirements().slice(0, 2).join(", ")}${missingDiscoveryRequirements().length > 2 ? "..." : ""}.`,
      },
      {
        title: "Jumps are finally credible",
        detail: "Warp Drives are online. Now the old chart-and-jump verbs belong to a civilization that actually earned them.",
      },
      {
        title: projectLevel("ark-stores") < 1 ? "Fund Ark Stores" : "Carry a soft landing",
        detail: projectLevel("ark-stores") < 1
          ? "Ark Stores seed extra cargo into new systems if you want gentler openings."
          : "Carry extra stability and plasma if you want a softer landing in the next system.",
      },
    ];
  }

  if (canTravel()) {
    return [
      {
        title: `Jump to ${state.discoveredSystem.name}`,
        detail: "Select Shipyard Cradle and jump from its local menu when you want to leave.",
      },
      {
        title: "Carry a reserve buffer",
        detail: "Even now, extra stability and plasma make the next system less punishing.",
      },
      {
        title: "Black-hole systems are now meaningful",
        detail: "Once singularity theory exists, rare systems with black holes become real late-game industrial targets.",
      },
    ];
  }

  const missing = missingTravelRequirements();
  return [
    {
      title: "Prep the jump",
      detail: `Shipyard jump still needs ${missing.slice(0, 2).join(", ")}${missing.length > 2 ? "..." : ""}.`,
    },
    {
      title: "Warp hardware is built",
      detail: "At this point the remaining blockers are practical reserves, not missing fantasy tech.",
    },
    {
      title: "Shipyard owns departure",
      detail: "Destination charting belongs to Survey Array, but actual interstellar movement still happens from Shipyard.",
    },
  ];
}

function orderedLocalRules(selected) {
  if (selected.kind === "structure") {
    return [LOCAL_RULES[1], LOCAL_RULES[0], LOCAL_RULES[2]];
  }
  if (selected.item.type === "asteroid") {
    return [LOCAL_RULES[2], LOCAL_RULES[0], LOCAL_RULES[1]];
  }
  return [LOCAL_RULES[0], LOCAL_RULES[1], LOCAL_RULES[2]];
}

function hasBuiltStructure(blueprintId) {
  return structures.some((structure) => structure.blueprintId === blueprintId);
}

function systemHasBlackHole() {
  return bodies.some((body) => body.type === "black-hole" || body.type === "blackhole" || body.type === "singularity");
}

function addResource(resource, amount, { pulse = false } = {}) {
  if (resource === "stability") {
    state.stabilityAdjustment += amount;
    state.stability = clamp(state.stability + amount, 0, 100);
    if (pulse) {
      pulseResourceMetric(resource, amount);
    }
    return;
  }

  const adjustmentKey = resourceAdjustmentKey(resource);
  if (adjustmentKey in state) {
    state[adjustmentKey] += amount;
  }
  state[resource] = Math.max(0, (state[resource] || 0) + amount);
  if (pulse) {
    pulseResourceMetric(resource, amount);
  }
}

function missingBlueprintRequirements(blueprint) {
  const missing = [];
  if (state.phase !== "running") {
    missing.push("start run");
  }

  if (blueprint.requires?.blackHole && !systemHasBlackHole()) {
    missing.push("black hole in system");
  }

  if (blueprint.requires?.structure && !hasBuiltStructure(blueprint.requires.structure)) {
    const requiredBlueprint = blueprintById(blueprint.requires.structure);
    missing.push(requiredBlueprint ? requiredBlueprint.label : "prerequisite structure");
  }

  if (blueprint.requires?.project) {
    const requiredProject = projectById(blueprint.requires.project.id);
    const requiredLevel = blueprint.requires.project.level || 1;
    if (projectLevel(blueprint.requires.project.id) < requiredLevel) {
      missing.push(`${requiredProject?.label || "project"} L${requiredLevel}`);
    }
  }

  for (const [resource, amount] of Object.entries(blueprintCost(blueprint))) {
    const available = state[resource] || 0;
    if (available < amount) {
      missing.push(formatResourceNeed(resource, amount - available));
    }
  }

  return missing;
}

function canBuildBlueprint(blueprint) {
  return missingBlueprintRequirements(blueprint).length === 0;
}

function missingProjectRequirements(project) {
  const missing = [];
  if (state.phase !== "running") {
    missing.push("start run");
  }

  const level = projectLevel(project.id);
  if (level >= project.maxLevel) {
    missing.push("max level");
  }

  if (project.requires?.structure && !hasBuiltStructure(project.requires.structure)) {
    const requiredBlueprint = blueprintById(project.requires.structure);
    missing.push(requiredBlueprint ? requiredBlueprint.label : "prerequisite structure");
  }

  if (project.requires?.project) {
    const requiredProject = projectById(project.requires.project.id);
    const requiredLevel = project.requires.project.level || 1;
    if (projectLevel(project.requires.project.id) < requiredLevel) {
      missing.push(`${requiredProject?.label || "project"} L${requiredLevel}`);
    }
  }

  const cost = scaledProjectCost(project);
  for (const [resource, amount] of Object.entries(cost)) {
    const available = state[resource] || 0;
    if (available < amount) {
      missing.push(formatResourceNeed(resource, amount - available));
    }
  }

  return missing;
}

function canFundProject(project) {
  return missingProjectRequirements(project).length === 0;
}

function projectEffectText(project, nextLevel = projectLevel(project.id) + 1) {
  if (project.id === "stability-lattice") {
    return `${Math.round(nextLevel * 12)}% softer drift and hazards`;
  }
  if (project.id === "civic-growth") {
    return `Habitat Population +${Math.round(nextLevel * 20)}%, Crew +${Math.round(nextLevel * 8)}%`;
  }
  if (project.id === "orbital-refueling") {
    return `Shipyard Fleet +${Math.round(nextLevel * 16)}%, plasma upkeep reduced`;
  }
  if (project.id === "survey-network") {
    return `Chart cost -${Math.min(6, nextLevel * 2)} Plasma`;
  }
  if (project.id === "asteroid-prospecting") {
    return nextLevel >= 1 ? "Mass Driver construction unlocked; collectors and drivers find more ore" : "Ore survey coverage improved";
  }
  if (project.id === "logistics-spine") {
    return `+${Math.round(nextLevel * 12)}% station output`;
  }
  if (project.id === "robotic-automation") {
    return `Industrial output +${Math.round(nextLevel * 12)}%, heavy Crew costs lower`;
  }
  if (project.id === "megahabitat-charters") {
    return "O'Neill Cylinder construction unlocked";
  }
  if (project.id === "asteroid-refineries") {
    return nextLevel >= 1 ? "Solar Lifter construction unlocked; Mass Drivers produce feedstock" : "Ore refining throughput improved";
  }
  if (project.id === "deep-space-relays") {
    return "Interstellar charting unlocked";
  }
  if (project.id === "synthetic-ecologies") {
    return "Synthetic World construction unlocked";
  }
  if (project.id === "singularity-theory") {
    return "Black-hole harvesters and warp research unlocked";
  }
  if (project.id === "warp-drives") {
    return "Shipyards can finally jump between stars";
  }
  if (project.id === "ark-stores") {
    const bonus = {
      mass: 14 * nextLevel,
      volatiles: 6 * nextLevel,
      plasma: 4 * nextLevel,
    };
    return `Jump seed ${formatCompactResourceList(bonus)}`;
  }
  return project.summary;
}

function fundProject(projectId, player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  const project = projectById(projectId);
  if (!project) {
    return false;
  }

  const missing = missingProjectRequirements(project);
  if (missing.length > 0) {
    state.lastProjectSummary = `${project.label} unavailable: requires ${missing.join(", ")}.`;
    addEventLog("blocked", state.lastProjectSummary);
    syncUi();
    return false;
  }

  const cost = scaledProjectCost(project);
  for (const [resource, amount] of Object.entries(cost)) {
    addResource(resource, -amount, { pulse: true });
  }

  const nextLevel = projectLevel(project.id) + 1;
  state.projectLevels[project.id] = nextLevel;
  refreshBuiltStructureRates();
  const selected = selectedObject(player);
  if (selected.kind === "structure") {
    primeStructurePulse(selected.item, "project");
    spawnStructureActionBurst(selected.item, "project", { duration: 1.4, scale: 1.02 });
  }
  state.lastProjectSummary = `${project.label} L${nextLevel} funded. ${projectEffectText(project, nextLevel)}.`;
  state.lastImpactSummary = state.lastProjectSummary;
  setOutcomeReport(createProjectOutcomeReport(project, nextLevel));
  addEventLog("success", state.lastProjectSummary);
  syncUi();
  return true;
}

function builtStructureCount() {
  return Math.max(0, structures.length - STARTER_STRUCTURE_COUNT);
}

function builtStructureTypeCount(blueprintId) {
  return structures.filter((structure) => structure.blueprintId === blueprintId).length;
}

function recommendedBlueprintId() {
  if (state.phase !== "running") {
    return OPENING_BLUEPRINT_ID;
  }
  if (state.stability < 35 && hasBuiltStructure("habitat")) {
    return "retrofit";
  }
  if (!hasBuiltStructure("habitat")) {
    return "habitat";
  }
  if (!hasBuiltStructure("collector") && state.mass < 56) {
    return "collector";
  }
  if (!hasBuiltStructure("shipyard")) {
    return "shipyard";
  }
  if (!hasProjectLevel("orbital-refueling")) {
    return null;
  }
  if (!hasBuiltStructure("survey-array")) {
    return "survey-array";
  }
  if (!hasBuiltStructure("solar-rig") && state.plasma < DISCOVERY_COST.plasma + 8) {
    return "solar-rig";
  }
  if (hasProjectLevel("asteroid-prospecting") && !hasBuiltStructure("mass-driver")) {
    return "mass-driver";
  }
  if (hasProjectLevel("asteroid-refineries") && !hasBuiltStructure("solar-lifter")) {
    return "solar-lifter";
  }
  if (hasProjectLevel("megahabitat-charters") && !hasBuiltStructure("o-neill-cylinder")) {
    return "o-neill-cylinder";
  }
  if (hasProjectLevel("synthetic-ecologies") && !hasBuiltStructure("synthetic-world")) {
    return "synthetic-world";
  }
  return null;
}

function recommendedProjectId() {
  if (state.phase !== "running" || !hasBuiltStructure("habitat")) {
    return null;
  }
  if (state.stability < 48 && projectLevel("stability-lattice") < 3) {
    return "stability-lattice";
  }
  if (hasBuiltStructure("habitat") && state.population < 10 && projectLevel("civic-growth") < 3) {
    return "civic-growth";
  }
  if (hasBuiltStructure("shipyard") && !hasProjectLevel("orbital-refueling")) {
    return "orbital-refueling";
  }
  if (hasBuiltStructure("survey-array") && projectLevel("survey-network") < 1) {
    return "survey-network";
  }
  if (hasBuiltStructure("survey-array") && hasProjectLevel("survey-network") && !hasProjectLevel("asteroid-prospecting")) {
    return "asteroid-prospecting";
  }
  if (hasBuiltStructure("shipyard") && hasProjectLevel("orbital-refueling") && projectLevel("logistics-spine") < 1) {
    return "logistics-spine";
  }
  if (hasBuiltStructure("shipyard") && hasProjectLevel("logistics-spine") && projectLevel("robotic-automation") < 1) {
    return "robotic-automation";
  }
  if (hasBuiltStructure("shipyard") && hasProjectLevel("orbital-refueling") && projectLevel("logistics-spine") < 2) {
    return "logistics-spine";
  }
  if (hasBuiltStructure("mass-driver") && !hasProjectLevel("asteroid-refineries")) {
    return "asteroid-refineries";
  }
  if (hasBuiltStructure("habitat") && hasProjectLevel("logistics-spine") && projectLevel("civic-growth") < 1) {
    return "civic-growth";
  }
  if (hasBuiltStructure("habitat") && hasProjectLevel("logistics-spine") && !hasProjectLevel("megahabitat-charters")) {
    return "megahabitat-charters";
  }
  if (hasBuiltStructure("survey-array") && hasProjectLevel("asteroid-prospecting") && !hasProjectLevel("deep-space-relays")) {
    return "deep-space-relays";
  }
  if (hasBuiltStructure("o-neill-cylinder") && !hasProjectLevel("synthetic-ecologies")) {
    return "synthetic-ecologies";
  }
  if (hasBuiltStructure("synthetic-world") && hasProjectLevel("deep-space-relays") && !hasProjectLevel("singularity-theory")) {
    return "singularity-theory";
  }
  if (hasBuiltStructure("shipyard") && hasProjectLevel("singularity-theory") && !hasProjectLevel("warp-drives")) {
    return "warp-drives";
  }
  if (hasBuiltStructure("shipyard") && hasProjectLevel("warp-drives") && projectLevel("ark-stores") < 2) {
    return "ark-stores";
  }
  if (hasBuiltStructure("shipyard") && projectLevel("robotic-automation") < 3) {
    return "robotic-automation";
  }
  if (hasBuiltStructure("habitat") && projectLevel("civic-growth") < 3) {
    return "civic-growth";
  }
  if (hasBuiltStructure("survey-array") && projectLevel("survey-network") < 3) {
    return "survey-network";
  }
  return null;
}

function ordersSummaryText() {
  if (state.phase === "boot") {
    return "First Loop";
  }
  if (state.stability < 25) {
    return "Patch Stability";
  }
  const project = recommendedProjectId();
  if (project) {
    const blueprint = projectById(project);
    const prefix = blueprint?.track === "science" ? "Science" : "Eng";
    return `${prefix}: ${blueprint?.label.split(" ")[0] || "Fund"}`;
  }
  const blueprint = recommendedBlueprintId();
  if (blueprint) {
    return `Next: ${blueprintById(blueprint)?.label.split(" ")[0] || "Build"}`;
  }
  if (!state.discoveredSystem) {
    return canDiscoverSystem() ? "Next: Chart" : "Charge Chart";
  }
  return canTravel() ? "Next: Jump" : "Prep Jump";
}

function guidanceHintText() {
  if (state.phase === "boot") {
    return "Start, select a planet, and build Habitat Ring first. Interstellar travel is now a very late unlock.";
  }
  if (state.stability < 25) {
    return "Stability is critical. Retrofit if available and pause new impacts.";
  }
  if (!hasBuiltStructure("habitat")) {
    return "Select a planet and commission Habitat Ring there; it turns Volatiles into Population and Crew.";
  }
  if (!hasBuiltStructure("shipyard")) {
    return state.crew < 3
      ? `Crew is growing (${state.crew.toFixed(1)}/3). Keep the system stable until Shipyard is affordable.`
      : "Select a planet and commission Shipyard Cradle to start fleet production.";
  }
  if (!hasProjectLevel("orbital-refueling")) {
    return "Select Shipyard Cradle and fund Orbital Refueling. The game now starts with depot logistics before deeper sci-fi branches.";
  }
  if (!hasBuiltStructure("survey-array")) {
    return "Select a world and commission Survey Array there. Science starts there, but travel is still far away.";
  }
  if (!hasProjectLevel("asteroid-prospecting")) {
    return "Select Survey Array and fund Asteroid Prospecting. Mass Drivers and heavier asteroid industry now depend on it.";
  }
  if (!hasBuiltStructure("mass-driver")) {
    return "Commission Mass Driver from a selected world once prospecting is online.";
  }
  if (!hasProjectLevel("asteroid-refineries")) {
    return "Select Mass Driver and fund Asteroid Refineries to convert rock-moving into real industrial throughput.";
  }
  if (!hasBuiltStructure("solar-lifter")) {
    return "Build Solar Lifter after the refinery tier. Heavy plasma is now a late reward, not a starter toy.";
  }
  if (!hasProjectLevel("megahabitat-charters")) {
    return "Select Habitat Ring and fund Megahabitat Charters. City-scale orbital life should arrive before synthetic worlds or warp travel.";
  }
  if (!hasBuiltStructure("o-neill-cylinder")) {
    return "Commission an O'Neill Cylinder from a selected world to push into true megahabitat territory.";
  }
  if (!hasProjectLevel("synthetic-ecologies")) {
    return "Select the O'Neill Cylinder and fund Synthetic Ecologies before trying to build a Synthetic World.";
  }
  if (!hasBuiltStructure("synthetic-world")) {
    return "Build a Synthetic World. Singularity theory and warp engineering are now gated behind civilization-scale habitat work.";
  }
  if (!hasProjectLevel("deep-space-relays")) {
    return "Select Survey Array and fund Deep Space Relays. Charting should unlock before actual travel does.";
  }
  if (!hasProjectLevel("singularity-theory")) {
    return "Select Survey Array and fund Singularity Theory. This is the science gate before any believable warp program.";
  }
  if (!hasProjectLevel("warp-drives")) {
    return "Select Shipyard Cradle and fund Warp Drives. Jumping stays impossible until this engineering step is complete.";
  }
  if (!state.discoveredSystem) {
    const missing = missingDiscoveryRequirements();
    return missing.length === 0
      ? `Chart the next system for ${formatCompactResourceList(discoveryCost())}.`
      : `Charting needs ${missing.slice(0, 2).join(", ")}${missing.length > 2 ? "..." : ""}.`;
  }
  if (canTravel()) {
    return `Jump to ${state.discoveredSystem.name}; the next system is ready.`;
  }
  const missing = missingTravelRequirements();
  return `Jump prep needs ${missing.slice(0, 2).join(", ")}${missing.length > 2 ? "..." : ""}.`;
}

function refreshBuiltStructureRates() {
  for (const structure of structures) {
    if (!structure.blueprintId) {
      continue;
    }
    const blueprint = blueprintById(structure.blueprintId);
    if (!blueprint) {
      continue;
    }
    structure.rates = structureRatesForLevel(blueprint, structureLevel(structure));
  }
}

function selectedAnchorBody(player = primaryPlayer()) {
  const selected = selectedObject(player);
  if (selected.kind !== "body") {
    return null;
  }
  if (selected.item.type === "planet" || selected.item.type === "black-hole" || selected.item.type === "blackhole" || selected.item.type === "singularity") {
    return selected.item;
  }
  return null;
}

function createBuiltStructure(blueprint, { anchorLabel = "", investedCost = null } = {}) {
  const count = builtStructureTypeCount(blueprint.id);
  const globalCount = builtStructureCount();
  return {
    label: `${blueprint.label} ${count + 1}`,
    blueprintId: blueprint.id,
    orbit: blueprint.orbit + count * 11,
    speed: blueprint.speed,
    phase: (blueprint.phase + count * 0.72 + globalCount * 0.21) % TWO_PI,
    orbitScale: blueprint.orbitScale,
    color: blueprint.color,
    commandLabel: blueprint.commandLabel,
    detail: blueprint.detail,
    rates: structureRatesForLevel(blueprint, 1),
    uptime: 0,
    commandPulse: 1,
    level: 1,
    maxLevel: STRUCTURE_UPGRADE_MAX_LEVEL,
    anchorLabel,
    investedCost: cloneResources(investedCost || blueprintCost(blueprint)),
    offline: false,
    offlineReason: "",
  };
}

function buildStructure(blueprintId, player = primaryPlayer(), { anchorLabel = "" } = {}) {
  player = ensurePlayerSelection(player);
  const blueprint = blueprintById(blueprintId);
  if (!blueprint) {
    return false;
  }

  const missing = missingBlueprintRequirements(blueprint);
  if (missing.length > 0) {
    state.lastBuildSummary = `${playerPrefix(player)}${blueprint.label} unavailable: requires ${missing.join(", ")}.`;
    addEventLog("blocked", state.lastBuildSummary);
    syncUi();
    return false;
  }

  const cost = blueprintCost(blueprint);
  for (const [resource, amount] of Object.entries(cost)) {
    addResource(resource, -amount, { pulse: true });
  }

  const structure = createBuiltStructure(blueprint, { anchorLabel, investedCost: cost });
  structures.push(structure);
  player.selectedKind = "structure";
  player.selectedLabel = structure.label;
  player.lastStructureLabel = structure.label;
  player.focusTargetLabel = structure.label;
  player.localMenuOpen = false;
  player.localActionIndex = 0;
  primeStructurePulse(structure, "build");
  spawnStructureActionBurst(structure, "build", { duration: 1.6, scale: 1.12 });
  const anchorText = anchorLabel ? ` Anchored from ${anchorLabel}.` : "";
  state.lastBuildSummary = `${playerPrefix(player)}${structure.label} built.${anchorText} ${formatRates(structure.rates)}.`;
  state.lastImpactSummary = state.lastBuildSummary;
  setOutcomeReport(createStructureOutcomeReport(blueprint, structure, { anchorLabel }));
  addEventLog("success", state.lastBuildSummary);
  syncUi();
  return true;
}

function buildSelectedLocalStructure(blueprintId, player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  const blueprint = blueprintById(blueprintId);
  const anchor = selectedAnchorBody(player);
  if (!blueprint || !anchor || !canBlueprintAnchorOnBody(blueprint, anchor)) {
    state.lastBuildSummary = `${playerPrefix(player)}Select a valid world or anchor body before commissioning ${blueprint?.label || "that orbital"}.`;
    addEventLog("blocked", state.lastBuildSummary);
    syncUi();
    return false;
  }
  return buildStructure(blueprintId, player, { anchorLabel: anchor.label });
}

function upgradeStructure(structureLabel, player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  const structure = findStructure(structureLabel);
  if (!structure?.blueprintId) {
    state.lastBuildSummary = `${playerPrefix(player)}Only built orbitals can be upgraded.`;
    addEventLog("blocked", state.lastBuildSummary);
    syncUi();
    return false;
  }

  const cost = structureUpgradeCost(structure);
  if (!cost) {
    state.lastBuildSummary = `${playerPrefix(player)}${structure.label} is already at max level.`;
    addEventLog("blocked", state.lastBuildSummary);
    syncUi();
    return false;
  }

  const missing = Object.entries(cost)
    .filter(([resource, amount]) => (state[resource] || 0) < amount)
    .map(([resource, amount]) => formatResourceNeed(resource, amount - (state[resource] || 0)));
  if (missing.length > 0) {
    state.lastBuildSummary = `${playerPrefix(player)}${structure.label} upgrade blocked: needs ${missing.join(", ")}.`;
    addEventLog("blocked", state.lastBuildSummary);
    syncUi();
    return false;
  }

  for (const [resource, amount] of Object.entries(cost)) {
    addResource(resource, -amount, { pulse: true });
  }

  structure.level = structureLevel(structure) + 1;
  structure.investedCost = addResourceMaps(structure.investedCost, cost);
  const blueprint = blueprintById(structure.blueprintId);
  structure.rates = structureRatesForLevel(blueprint, structure.level);
  primeStructurePulse(structure, "upgrade");
  spawnStructureActionBurst(structure, "upgrade", { duration: 1.45, scale: 1.08 });
  state.lastBuildSummary = `${playerPrefix(player)}${structure.label} upgraded to ${structureLevelTag(structure)}. ${formatRates(structure.rates)}.`;
  state.lastImpactSummary = state.lastBuildSummary;
  setOutcomeReport(createUpgradeOutcomeReport(structure));
  addEventLog("success", state.lastBuildSummary);
  syncUi();
  return true;
}

function disassembleStructure(structureLabel, player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  const structure = findStructure(structureLabel);
  if (!structure?.blueprintId || !canDisassembleStructure(structure)) {
    state.lastBuildSummary = `${playerPrefix(player)}${structure?.label || "That orbital"} cannot be disassembled yet.`;
    addEventLog("blocked", state.lastBuildSummary);
    syncUi();
    return false;
  }

  const refund = disassembleRefund(structure);
  primeStructurePulse(structure, "salvage");
  spawnStructureActionBurst(structure, "salvage", { duration: 1.55, scale: 1.16 });
  for (const [resource, amount] of Object.entries(refund)) {
    addResource(resource, amount, { pulse: true });
  }

  const index = structures.indexOf(structure);
  if (index >= STARTER_STRUCTURE_COUNT) {
    structures.splice(index, 1);
  }

  for (const slot of activePlayers()) {
    if (slot.selectedKind === "structure" && slot.selectedLabel === structure.label) {
      const fallback = findBody(structure.anchorLabel) || defaultTargetBody() || bodies[0];
      slot.selectedKind = "body";
      slot.selectedLabel = fallback?.label || DEFAULT_PLAYER_SELECTION.selectedLabel;
      slot.focusIndex = Math.max(0, bodies.findIndex((body) => body.label === slot.selectedLabel));
      slot.focusTargetLabel = slot.selectedLabel;
      slot.localMenuOpen = false;
      slot.localActionIndex = 0;
    }
  }

  state.lastBuildSummary = `${playerPrefix(player)}${structure.label} disassembled. Salvage recovered ${formatCompactResourceList(refund)}.`;
  state.lastImpactSummary = state.lastBuildSummary;
  setOutcomeReport({
    tone: "salvage",
    kicker: "Salvage Report",
    title: `${structure.label} recovered`,
    story: "The orbital was broken down cleanly, leaving the lane open for a different structure or a quieter system.",
    now: "The selected operator returned to a world anchor and can commission something else.",
    output: `Recovered ${formatCompactResourceList(refund)}`,
  });
  addEventLog("success", state.lastBuildSummary);
  syncUi();
  return true;
}

function isTargetBody(body) {
  return body?.type === "planet";
}

function isAsteroidBusy(label) {
  return state.impactQueue.some((impact) => impact.asteroidLabel === label);
}

function selectedObject(player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  if (player.selectedKind === "structure") {
    const structure = findStructure(player.selectedLabel);
    if (structure) {
      return { kind: "structure", item: structure };
    }
  }

  const body = findBody(player.selectedLabel) || bodies[player.focusIndex] || bodies[0];
  return { kind: "body", item: body };
}

function focusedBody(player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  const selected = selectedObject(player);
  if (selected.kind === "body") {
    return selected.item;
  }
  return bodies[player.focusIndex] || bodies[0];
}

function selectableObjects() {
  return [
    ...bodies.map((body) => ({ kind: "body", label: body.label })),
    ...structures.map((structure) => ({ kind: "structure", label: structure.label })),
  ];
}

function selectedSelectableIndex(player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  const objects = selectableObjects();
  return Math.max(0, objects.findIndex((object) => object.kind === player.selectedKind && object.label === player.selectedLabel));
}

function selectObject(kind, label, { autoDraft = true, player = primaryPlayer() } = {}) {
  player = ensurePlayerSelection(player);
  const next = kind === "structure" ? findStructure(label) : findBody(label);
  if (!next) {
    return false;
  }

  player.selectedKind = kind;
  player.selectedLabel = label;
  player.localMenuOpen = false;
  player.localActionIndex = 0;

  if (kind === "body") {
    player.lastBodyLabel = label;
    const bodyIndex = bodies.findIndex((body) => body.label === label);
    if (bodyIndex >= 0) {
      player.focusIndex = bodyIndex;
      player.focusTargetLabel = label;
    }

    if (autoDraft && next.type === "asteroid" && !isAsteroidBusy(next.label)) {
      player.impactAsteroidLabel = next.label;
      state.lastImpactSummary = `${playerPrefix(player)}${next.label} loaded as the impact body.`;
    } else if (autoDraft && isTargetBody(next)) {
      player.impactTargetLabel = next.label;
      state.lastImpactSummary = `${playerPrefix(player)}${next.label} locked as the impact target.`;
    }
  } else {
    player.lastStructureLabel = label;
  }

  syncPlayerCommandIntent(player);
  syncUi();
  return true;
}

function changeSelection(direction, player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  const objects = selectableObjects();
  const currentIndex = selectedSelectableIndex(player);
  const nextObject = objects[(currentIndex + direction + objects.length) % objects.length];
  selectObject(nextObject.kind, nextObject.label, { player });
}

function changeFocus(direction, player = primaryPlayer()) {
  changeSelection(direction, player);
}

function cycleBodySelection(direction, player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  if (bodies.length === 0) {
    return false;
  }

  const selected = selectedObject(player);
  const currentIndex = selected.kind === "body"
    ? bodies.findIndex((body) => body.label === selected.item.label)
    : player.focusIndex;
  const nextIndex = (Math.max(0, currentIndex) + direction + bodies.length) % bodies.length;
  return selectObject("body", bodies[nextIndex].label, { player });
}

function cycleStructureSelection(direction, player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  if (structures.length === 0) {
    return false;
  }

  const selected = selectedObject(player);
  const currentIndex = selected.kind === "structure"
    ? structures.findIndex((structure) => structure.label === selected.item.label)
    : -1;
  const startIndex = currentIndex >= 0 ? currentIndex : direction > 0 ? -1 : 0;
  const nextIndex = (startIndex + direction + structures.length) % structures.length;
  return selectObject("structure", structures[nextIndex].label, { player });
}

function preferredBodyLabel(player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  return findBody(player.selectedKind === "body" ? player.selectedLabel : "")
    ?.label
    || findBody(player.lastBodyLabel)?.label
    || findBody(player.impactTargetLabel)?.label
    || defaultTargetBody()?.label
    || bodies[0]?.label
    || "";
}

function preferredStructureLabel(player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  const selected = selectedObject(player);
  return findStructure(player.selectedKind === "structure" ? player.selectedLabel : "")
    ?.label
    || findStructure(player.lastStructureLabel)?.label
    || (selected.kind === "body" ? structures.find((structure) => structure.anchorLabel === selected.item.label)?.label : "")
    || structures.find((structure) => structure.anchorLabel === player.lastBodyLabel)?.label
    || structures[0]?.label
    || "";
}

function selectBodyLane(player = primaryPlayer(), { cycleIfAlreadyThere = false } = {}) {
  player = ensurePlayerSelection(player);
  if (player.selectedKind === "body") {
    return cycleIfAlreadyThere ? cycleBodySelection(-1, player) : false;
  }
  const label = preferredBodyLabel(player);
  return label ? selectObject("body", label, { autoDraft: false, player }) : false;
}

function selectStructureLane(player = primaryPlayer(), { cycleIfAlreadyThere = false } = {}) {
  player = ensurePlayerSelection(player);
  if (player.selectedKind === "structure") {
    return cycleIfAlreadyThere ? cycleStructureSelection(1, player) : false;
  }
  const label = preferredStructureLabel(player);
  return label ? selectObject("structure", label, { player }) : false;
}

function cycleSelectedCategory(direction, player = primaryPlayer()) {
  const selected = selectedObject(player);
  return selected.kind === "structure"
    ? cycleStructureSelection(direction, player)
    : cycleBodySelection(direction, player);
}

function firstAvailableAsteroid() {
  return bodies.find((body) => body.type === "asteroid" && !isAsteroidBusy(body.label)) || null;
}

function firstTargetPlanet() {
  return bodies.find(isTargetBody) || bodies.find((body) => body.type !== "asteroid" && body.type !== "moon") || bodies[0] || null;
}

function missingDiscoveryRequirements() {
  const missing = [];
  const cost = discoveryCost();
  if (state.phase !== "running") {
    missing.push("start run");
  }
  if (state.discoveredSystem) {
    missing.push("destination already charted");
  }
  if (state.cycle < DISCOVERY_RULES.cycle) {
    missing.push(`${DISCOVERY_RULES.cycle - state.cycle} local cycles`);
  }
  if (!hasBuiltStructure("habitat")) {
    missing.push("Habitat Ring");
  }
  if (DISCOVERY_RULES.project) {
    const requiredProject = projectById(DISCOVERY_RULES.project.id);
    const requiredLevel = DISCOVERY_RULES.project.level || 1;
    if (!hasProjectLevel(DISCOVERY_RULES.project.id, requiredLevel)) {
      missing.push(`${requiredProject?.label || "project"} L${requiredLevel}`);
    }
  }
  if (state.crew < DISCOVERY_RULES.crew) {
    missing.push(`Crew ${(DISCOVERY_RULES.crew - state.crew).toFixed(1)}`);
  }
  if (state.plasma < cost.plasma) {
    missing.push(`Plasma ${Math.ceil(cost.plasma - state.plasma)}`);
  }
  if (state.stability < DISCOVERY_RULES.stability) {
    missing.push(`Stability ${Math.ceil(DISCOVERY_RULES.stability - state.stability)}%`);
  }
  return missing;
}

function nextDiscoverySystem() {
  const options = travelableArchetypes();
  const archetype = options[state.systemIndex % options.length] || options[0];
  const index = state.systemIndex + 1;
  return {
    index,
    archetypeId: archetype.id,
    name: `${archetype.label} ${index + 1}`,
    label: archetype.label,
    descriptor: archetype.descriptor,
    opportunity: archetype.opportunity,
    hazard: archetype.hazard,
  };
}

function canDiscoverSystem() {
  return missingDiscoveryRequirements().length === 0;
}

function discoverSystem(player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  const missing = missingDiscoveryRequirements();
  if (missing.length > 0) {
    state.lastTravelSummary = `Charting unavailable: requires ${missing.join(", ")}.`;
    state.lastImpactSummary = state.lastTravelSummary;
    addEventLog("blocked", state.lastTravelSummary);
    syncUi();
    return false;
  }

  const cost = discoveryCost();
  addResource("plasma", -cost.plasma, { pulse: true });
  state.discoveredSystem = nextDiscoverySystem();
  const selected = selectedObject(player);
  if (selected.kind === "structure") {
    primeStructurePulse(selected.item, "travel");
    spawnStructureActionBurst(selected.item, "travel", { duration: 1.35, scale: 1.02 });
  }
  state.lastTravelSummary = `Charted ${state.discoveredSystem.name}: ${state.discoveredSystem.opportunity} Warp travel still waits on stocked shipyards and drive engineering.`;
  state.lastImpactSummary = `${state.discoveredSystem.name} discovered. Hazard: ${state.discoveredSystem.hazard}`;
  setOutcomeReport(createTravelOutcomeReport({
    title: `${state.discoveredSystem.name} charted`,
    story: state.discoveredSystem.descriptor,
    now: "The route is known, but departure still belongs to stocked shipyards with warp-drive engineering.",
    output: `Hazard: ${state.discoveredSystem.hazard}`,
  }));
  addEventLog("success", state.lastImpactSummary);
  syncUi();
  return true;
}

function missingTravelRequirements() {
  const missing = [];
  if (state.phase !== "running") {
    missing.push("start run");
  }
  if (state.paused) {
    missing.push("resume simulation");
  }
  if (!state.discoveredSystem) {
    missing.push("charted destination");
  }
  if (!hasBuiltStructure("shipyard")) {
    missing.push("Shipyard Cradle");
  }
  if (TRAVEL_RULES.project) {
    const requiredProject = projectById(TRAVEL_RULES.project.id);
    const requiredLevel = TRAVEL_RULES.project.level || 1;
    if (!hasProjectLevel(TRAVEL_RULES.project.id, requiredLevel)) {
      missing.push(`${requiredProject?.label || "project"} L${requiredLevel}`);
    }
  }
  if (state.crew < TRAVEL_RULES.crew) {
    missing.push(formatResourceNeed("crew", TRAVEL_RULES.crew - state.crew));
  }
  if (state.fleet < TRAVEL_RULES.fleet) {
    missing.push(formatResourceNeed("fleet", TRAVEL_RULES.fleet - state.fleet));
  }
  if (state.plasma < TRAVEL_RULES.plasma) {
    missing.push(formatResourceNeed("plasma", TRAVEL_RULES.plasma - state.plasma));
  }
  if (state.population < TRAVEL_RULES.population) {
    missing.push(formatResourceNeed("population", TRAVEL_RULES.population - state.population));
  }
  if (state.stability < TRAVEL_RULES.stability) {
    missing.push(formatResourceNeed("stability", TRAVEL_RULES.stability - state.stability));
  }
  return missing;
}

function canTravel() {
  return missingTravelRequirements().length === 0;
}

function travelStateText() {
  if (state.phase !== "running") {
    return "Locked";
  }
  if (state.discoveredSystem && canTravel()) {
    return "Ready";
  }
  if (state.discoveredSystem) {
    return "Charted";
  }
  if (!hasProjectLevel("deep-space-relays")) {
    return "Local Era";
  }
  if (!hasProjectLevel("warp-drives")) {
    return "Warp Tech";
  }
  if (canDiscoverSystem()) {
    return "Chart";
  }
  return "Locked";
}

function discoveryStatusText() {
  if (state.discoveredSystem) {
    const missing = missingTravelRequirements();
    const travelText = missing.length === 0
      ? `Jump ready. Cost ${formatResourceList(TRAVEL_COST)}.`
      : `Jump to ${state.discoveredSystem.name} requires ${missing.join(", ")}.`;
    return `${state.discoveredSystem.name}: ${state.discoveredSystem.descriptor} ${travelText}`;
  }

  if (!hasProjectLevel("orbital-refueling")) {
    return "Early progression stays local: build refueling logistics before deep survey or interstellar ambitions even enter the conversation.";
  }

  if (!hasBuiltStructure("survey-array")) {
    return "Build Survey Array after Shipyard and refueling to unlock the science ladder.";
  }

  if (!hasProjectLevel("deep-space-relays")) {
    return "Deep Space Relays are the charting gate. Interstellar travel is intentionally late and still locked behind warp engineering after that.";
  }

  if (!hasProjectLevel("warp-drives")) {
    return "Routes can be charted once relay work is complete, but leaving the system still requires Singularity Theory and Warp Drives.";
  }

  const missing = missingDiscoveryRequirements();
  if (missing.length === 0) {
    return `Chart the next star system for ${formatResourceList(discoveryCost())}.`;
  }
  return `Charting requires ${missing.join(", ")}.`;
}

function travelToDiscoveredSystem(player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  const missing = missingTravelRequirements();
  if (missing.length > 0) {
    state.lastTravelSummary = `Jump unavailable: requires ${missing.join(", ")}.`;
    state.lastImpactSummary = state.lastTravelSummary;
    addEventLog("blocked", state.lastTravelSummary);
    syncUi();
    return false;
  }

  const destination = state.discoveredSystem;
  const archetype = SYSTEM_ARCHETYPES.find((candidate) => candidate.id === destination.archetypeId);
  if (!archetype) {
    state.lastTravelSummary = "Jump telemetry failed: destination archetype missing.";
    state.lastImpactSummary = state.lastTravelSummary;
    addEventLog("danger", state.lastTravelSummary);
    syncUi();
    return false;
  }

  addResource("fleet", -TRAVEL_COST.fleet, { pulse: true });
  addResource("plasma", -TRAVEL_COST.plasma, { pulse: true });
  addResource("population", -TRAVEL_COST.population, { pulse: true });
  addResource("stability", -TRAVEL_COST.stability, { pulse: true });
  const preservedResources = captureResourceState();

  state.totalCycles += state.cycle;
  state.jumps += 1;
  state.systemIndex = destination.index;
  state.currentSystemArchetypeId = archetype.id;
  state.systemName = destination.name;
  state.visitedSystems = [...state.visitedSystems, destination.name];
  state.discoveredSystem = null;

  loadGeneratedSystemBodies(archetype, state.systemIndex);
  restoreSystemLayout();

  state.elapsed = 0;
  state.cycle = 0;
  state.accumulator = 0;
  state.paused = false;
  state.impactQueue = [];
  state.impactBursts = [];
  state.actionBursts = [];
  state.lastHazardTick = 0;
  state.collapseLogged = false;
  restoreResourceState(preservedResources);
  const seedBonus = jumpSeedBonus();
  for (const [resource, amount] of Object.entries(seedBonus)) {
    addResource(resource, amount);
  }
  anchorResourceAdjustmentsToCurrent();

  resetAllPlayersForSystem({ target: firstTargetPlanet(), asteroid: firstAvailableAsteroid() });

  const seedText = Object.keys(seedBonus).length > 0 ? ` Ark Stores delivered ${formatCompactResourceList(seedBonus)}.` : "";
  state.lastBuildSummary = `Arrived in ${state.systemName}. Local build grid refreshed; campaign stockpiles, population base, and project levels preserved after the ark commitment.${seedText}`;
  state.lastTravelSummary = `${state.systemName}: ${archetype.opportunity} Hazard: ${archetype.hazard}`;
  state.lastImpactSummary = state.lastTravelSummary;
  setOutcomeReport(createTravelOutcomeReport({
    title: `${state.systemName} arrival`,
    story: archetype.descriptor,
    now: `The old project ladder and stockpiles survived the jump, while ${formatPopulation(TRAVEL_COST.population)} population committed to the outgoing ark.`,
    output: `${archetype.opportunity} Hazard: ${archetype.hazard}`,
  }));
  addEventLog("success", state.lastBuildSummary);
  state.lastTime = performance.now();
  syncUi();
  return true;
}

function markSelectedAsteroid(player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  const selected = selectedObject(player);
  if (selected.kind !== "body" || selected.item.type !== "asteroid" || isAsteroidBusy(selected.item.label)) {
    return false;
  }

  player.impactAsteroidLabel = selected.item.label;
  state.lastImpactSummary = `${playerPrefix(player)}${selected.item.label} is ready for a guided nudge.`;
  addEventLog("info", state.lastImpactSummary);
  syncUi();
  return true;
}

function markSelectedTarget(player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  const selected = selectedObject(player);
  if (selected.kind !== "body" || !isTargetBody(selected.item)) {
    return false;
  }

  player.impactTargetLabel = selected.item.label;
  state.lastImpactSummary = `${playerPrefix(player)}${selected.item.label} is the selected impact target.`;
  addEventLog("info", state.lastImpactSummary);
  syncUi();
  return true;
}

function cycleImpactIntent(player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  player.impactIntentIndex = (player.impactIntentIndex + 1) % IMPACT_INTENTS.length;
  syncPlayerCommandIntent(player);
  state.lastImpactSummary = `${playerPrefix(player)}Impact mode set to ${currentIntent(player).label}.`;
  addEventLog("info", state.lastImpactSummary);
  syncUi();
}

function canQueueImpact(player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  const asteroid = findBody(player.impactAsteroidLabel);
  const target = findBody(player.impactTargetLabel);
  return Boolean(
    state.phase === "running"
      && !state.paused
      && asteroid
      && asteroid.type === "asteroid"
      && !isAsteroidBusy(asteroid.label)
      && target
      && isTargetBody(target)
      && state.impactQueue.length < MAX_ACTIVE_IMPACTS
      && state.mass >= IMPACT_MASS_COST,
  );
}

function queueImpact(player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  if (!canQueueImpact(player)) {
    state.lastImpactSummary = state.phase === "running"
      ? `${playerPrefix(player)}Impact queue needs an idle asteroid, a planet target, and enough mass.`
      : "Start the run before queuing asteroid impacts.";
    addEventLog("blocked", state.lastImpactSummary);
    syncUi();
    return false;
  }

  const asteroid = findBody(player.impactAsteroidLabel);
  const target = findBody(player.impactTargetLabel);
  const intent = currentIntent(player);
  const center = systemCenter();
  const positions = resolveBodyPositions(center.x, center.y, state.elapsed);
  const start = positions.get(asteroid.label) || { x: center.x, y: center.y };

  asteroid.guidancePulse = 1;
  state.impactQueue.push({
    id: nextImpactId,
    ownerPlayerId: player.id,
    asteroidLabel: asteroid.label,
    targetLabel: target.label,
    intentId: intent.id,
    progress: 0,
    duration: IMPACT_DURATION + asteroid.radius * 0.18,
    startX: start.x,
    startY: start.y,
  });
  nextImpactId += 1;
  const guidanceStabilityCost = IMPACT_GUIDANCE_STABILITY_COST * Math.max(0.78, 1 - stabilityProjectLevel() * 0.07);
  state.massAdjustment -= IMPACT_MASS_COST;
  state.stabilityAdjustment -= guidanceStabilityCost;
  state.mass = Math.max(0, state.mass - IMPACT_MASS_COST);
  state.stability = Math.max(0, state.stability - guidanceStabilityCost);
  pulseResourceMetric("mass", -IMPACT_MASS_COST);
  pulseResourceMetric("stability", -guidanceStabilityCost);
  state.lastImpactSummary = `${playerPrefix(player)}${asteroid.label} queued for ${target.label}: ${intent.label}.`;
  addEventLog("warning", state.lastImpactSummary);
  syncUi();
  return true;
}

function primeStructurePulse(structure, tone = "operate") {
  if (!structure) {
    return;
  }
  structure.commandPulse = 1;
  structure.commandTone = tone;
}

function spawnStructureActionBurst(structure, tone = "operate", { duration = 1.35, scale = 1 } = {}) {
  if (!structure) {
    return;
  }
  state.actionBursts.push({
    label: structure.label,
    orbit: structure.orbit,
    orbitScale: structure.orbitScale,
    phase: structure.phase,
    speed: structure.speed,
    tone,
    scale,
    age: 0,
    duration,
  });
}

function runBuiltStructureCommand(structure, player = primaryPlayer()) {
  const blueprint = blueprintById(structure.blueprintId);
  primeStructurePulse(structure, "operate");
  spawnStructureActionBurst(structure, "operate", { duration: 1.25, scale: 0.96 });
  const commandBoost = commandOutputMultiplier(structure);

  if (!blueprint) {
    state.lastBuildSummary = `${structure.label} acknowledged.`;
    return;
  }

  if (structure.blueprintId === "collector") {
    addResource("mass", 5 * commandBoost, { pulse: true });
    addResource("volatiles", 1.5 * commandBoost, { pulse: true });
    state.lastBuildSummary = `${structure.label} dumped an emergency harvest burst into storage.`;
  } else if (structure.blueprintId === "habitat") {
    if (state.volatiles >= 2) {
      addResource("volatiles", -2, { pulse: true });
      addResource("population", 0.22 * commandBoost, { pulse: true });
      addResource("crew", 0.65 * commandBoost, { pulse: true });
      addResource("stability", 0.45 * commandBoost, { pulse: true });
      state.lastBuildSummary = `${structure.label} opened reserve housing, growing population and crew support.`;
    } else {
      state.lastBuildSummary = `${structure.label} needs Volatiles 2 for a crew rally.`;
    }
  } else if (structure.blueprintId === "shipyard") {
    if (state.mass >= 7 && state.plasma >= 2) {
      addResource("mass", -7, { pulse: true });
      addResource("plasma", -2, { pulse: true });
      addResource("fleet", 0.4 * commandBoost, { pulse: true });
      state.lastBuildSummary = `${structure.label} rushed a partial hull frame.`;
    } else {
      state.lastBuildSummary = `${structure.label} needs Mass 7 and Plasma 2 to rush a hull.`;
    }
  } else if (structure.blueprintId === "solar-rig") {
    const multipliers = currentSystemArchetype().commandMultipliers || {};
    const plasmaGain = 4.2 * commandBoost * (multipliers.solarPlasma || 1);
    const stabilityCost = 1.1 * Math.max(0.76, 1 - (structureLevel(structure) - 1) * 0.09) * (multipliers.solarStability || 1);
    addResource("plasma", plasmaGain, { pulse: true });
    addResource("stability", -stabilityCost, { pulse: true });
    state.lastBuildSummary = `${structure.label} surged the stellar siphon for Plasma ${plasmaGain.toFixed(1)}.`;
  } else if (structure.blueprintId === "retrofit") {
    if (state.mass >= 5 && state.volatiles >= 3) {
      addResource("mass", -5, { pulse: true });
      addResource("volatiles", -3, { pulse: true });
      addResource("stability", 2.4 * commandBoost, { pulse: true });
      state.lastBuildSummary = `${structure.label} patched orbital stress and raised stability.`;
    } else {
      state.lastBuildSummary = `${structure.label} needs Mass 5 and Volatiles 3 for a retrofit patch.`;
    }
  } else if (structure.blueprintId === "survey-array") {
    const target = findBody(player.impactTargetLabel) || bodies.find(isTargetBody);
    if (target) {
      player.impactTargetLabel = target.label;
    }
    state.lastBuildSummary = `${structure.label} refined survey telemetry around ${player.impactTargetLabel}.`;
  } else if (structure.blueprintId === "mass-driver") {
    const asteroid = firstAvailableAsteroid();
    if (asteroid) {
      player.impactAsteroidLabel = asteroid.label;
      state.lastBuildSummary = `${structure.label} primed ${asteroid.label} for controlled impact.`;
    } else {
      state.lastBuildSummary = `${structure.label} has no idle asteroid to prime.`;
    }
  } else if (structure.blueprintId === "solar-lifter") {
    const multipliers = currentSystemArchetype().commandMultipliers || {};
    const plasmaGain = 3.8 * commandBoost * (multipliers.solarPlasma || 1);
    const stabilityCost = 1.25 * (multipliers.solarStability || 1);
    addResource("plasma", plasmaGain, { pulse: true });
    addResource("stability", -stabilityCost, { pulse: true });
    state.lastBuildSummary = `${structure.label} drew Plasma ${plasmaGain.toFixed(1)} and raised local hazard stress.`;
  } else if (structure.blueprintId === "o-neill-cylinder") {
    if (state.volatiles >= 3) {
      addResource("volatiles", -3, { pulse: true });
      addResource("population", 0.82 * commandBoost, { pulse: true });
      addResource("crew", 1.1 * commandBoost, { pulse: true });
      addResource("stability", 0.7 * commandBoost, { pulse: true });
      state.lastBuildSummary = `${structure.label} opened new habitat districts and raised civic throughput.`;
    } else {
      state.lastBuildSummary = `${structure.label} needs Volatiles 3 to open new districts.`;
    }
  } else if (structure.blueprintId === "synthetic-world") {
    if (state.mass >= 8 && state.plasma >= 4) {
      addResource("mass", -8, { pulse: true });
      addResource("plasma", -4, { pulse: true });
      addResource("stability", 1.8 * commandBoost, { pulse: true });
      addResource("population", 1.25 * commandBoost, { pulse: true });
      addResource("crew", 0.8 * commandBoost, { pulse: true });
      state.lastBuildSummary = `${structure.label} stabilized a biosphere sector and expanded long-horizon settlement capacity.`;
    } else {
      state.lastBuildSummary = `${structure.label} needs Mass 8 and Plasma 4 to stabilize a biosphere sector.`;
    }
  } else if (structure.blueprintId === "black-hole") {
    const multipliers = currentSystemArchetype().structureRateMultipliers?.["black-hole"] || {};
    const plasmaCost = 4.2 * (multipliers.plasma || 1);
    const exoticGain = 1 * commandBoost * (multipliers.exotic || 1);
    const stabilityCost = 1 * (multipliers.stability || 1);
    if (!systemHasBlackHole()) {
      state.lastBuildSummary = `${structure.label} has no black hole anchor in this system.`;
    } else if (state.plasma >= plasmaCost) {
      addResource("plasma", -plasmaCost, { pulse: true });
      addResource("exotic", exoticGain, { pulse: true });
      addResource("stability", -stabilityCost, { pulse: true });
      state.lastBuildSummary = `${structure.label} bled Exotic ${exoticGain.toFixed(1)} from the gravity well.`;
    } else {
      state.lastBuildSummary = `${structure.label} needs Plasma ${Math.ceil(plasmaCost)} to fire the harvester.`;
    }
  } else {
    state.lastBuildSummary = `${structure.label} cycled local systems and reported green status.`;
  }

  state.lastImpactSummary = state.lastBuildSummary;
  const blocked = state.lastBuildSummary.includes("needs")
    || state.lastBuildSummary.includes("no black hole")
    || state.lastBuildSummary.includes("no idle asteroid");
  if (!blocked) {
    setOutcomeReport(createOperationOutcomeReport(structure, state.lastBuildSummary));
  }
  addEventLog(blocked ? "blocked" : "success", state.lastBuildSummary);
}

function runSelectedStructureCommand(player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  const selected = selectedObject(player);
  if (selected.kind !== "structure") {
    return false;
  }

  const structure = selected.item;

  if (structure.blueprintId) {
    runBuiltStructureCommand(structure, player);
    state.lastBuildSummary = playerPrefix(player) + state.lastBuildSummary;
    state.lastImpactSummary = state.lastBuildSummary;
    syncUi();
    return true;
  }

  primeStructurePulse(structure, "operate");
  spawnStructureActionBurst(structure, "operate", { duration: 1.25, scale: 0.96 });

  if (structure.label === "Survey Array") {
    const target = findBody(player.impactTargetLabel) || bodies.find(isTargetBody);
    if (target) {
      player.impactTargetLabel = target.label;
    }
    state.lastImpactSummary = `${playerPrefix(player)}Survey Array refined the ${player.impactTargetLabel} impact window.`;
  } else if (structure.label === "Mass Driver") {
    const asteroid = firstAvailableAsteroid();
    if (asteroid) {
      player.impactAsteroidLabel = asteroid.label;
      state.lastImpactSummary = `${playerPrefix(player)}Mass Driver primed ${asteroid.label} for controlled impact.`;
    } else {
      state.lastImpactSummary = `${playerPrefix(player)}Mass Driver has no idle asteroid to prime.`;
    }
  } else if (structure.label === "Solar Lifter") {
    const multipliers = currentSystemArchetype().commandMultipliers || {};
    const plasmaGain = 3.8 * (multipliers.solarPlasma || 1);
    const stabilityCost = 1.25 * (multipliers.solarStability || 1);
    addResource("plasma", plasmaGain, { pulse: true });
    addResource("stability", -stabilityCost, { pulse: true });
    state.lastImpactSummary = `${playerPrefix(player)}Solar Lifter drew Plasma ${plasmaGain.toFixed(1)} and raised local hazard stress.`;
  }

  addEventLog(state.lastImpactSummary.includes("no idle") ? "blocked" : "success", state.lastImpactSummary);
  syncUi();
  return true;
}

function contextActionDescriptors(player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  const selected = selectedObject(player);
  const actions = [];

  if (selected.kind === "body") {
    const body = selected.item;

    if (body.type === "planet" || body.type === "black-hole" || body.type === "blackhole" || body.type === "singularity") {
      for (const blueprint of localBlueprintCandidates(body)) {
        const missing = missingBlueprintRequirements(blueprint);
        actions.push({
          id: `build-${blueprint.id}`,
          label: `Commission ${blueprint.label}`,
          tag: "Build",
          detail: `${formatCompactResourceList(blueprintCost(blueprint))}${body.type === "planet" ? ` from ${body.label}` : ""}.`,
          disabled: missing.length > 0,
          tone: blueprint.id === recommendedBlueprintId() ? "primary" : "default",
          reason: missing.length > 0 ? `Need ${missing.slice(0, 2).join(", ")}${missing.length > 2 ? "..." : ""}.` : blueprint.detail,
          perform: () => buildSelectedLocalStructure(blueprint.id, player),
        });
      }
    }

    if (body.type === "asteroid") {
      actions.push({
        id: "cycle-impact-mode",
        label: currentIntent(player).label,
        tag: "Impact mode",
        detail: `Current target ${player.impactTargetLabel || "none"}.`,
        disabled: false,
        tone: "default",
        reason: "Cycle through Orbit Lift, Orbit Brake, and Spin Up.",
        perform: () => cycleImpactIntent(player),
      });
      actions.push({
        id: "queue-impact",
        label: "Queue Impact",
        tag: "Impact",
        detail: `${body.label} -> ${player.impactTargetLabel || "No target"}.`,
        disabled: !canQueueImpact(player),
        tone: "primary",
        reason: canQueueImpact(player)
          ? `Ready for ${compactIntentLabel(currentIntent(player))}.`
          : "Need an idle asteroid, a planet target, free queue space, and enough Mass.",
        perform: () => queueImpact(player),
      });
    } else if (isTargetBody(body)) {
      actions.push({
        id: "queue-impact",
        label: "Queue Impact",
        tag: "Impact",
        detail: `${player.impactAsteroidLabel || "No rock"} -> ${body.label}.`,
        disabled: !canQueueImpact(player),
        tone: "default",
        reason: canQueueImpact(player)
          ? `Ready for ${compactIntentLabel(currentIntent(player))}.`
          : "Pick an asteroid and keep enough Mass in reserve before queuing.",
        perform: () => queueImpact(player),
      });
    }

    return actions.slice(0, 5);
  }

  const structure = selected.item;
  actions.push({
    id: "run-structure",
    label: structure.commandLabel,
    tag: "Operate",
    detail: structure.blueprintId ? `Direct action from ${structureDisplayName(structure)}.` : structure.detail,
    disabled: false,
    tone: "primary",
    reason: structure.blueprintId ? formatCompactRates(structure.rates) : structure.detail,
    perform: () => runSelectedStructureCommand(player),
  });

  if (structure.blueprintId) {
    const upgradeCost = structureUpgradeCost(structure);
    actions.push({
      id: "upgrade-structure",
      label: upgradeCost ? `Upgrade to L${structureLevel(structure) + 1}` : "Upgrade Maxed",
      tag: "Upgrade",
      detail: upgradeCost ? formatCompactResourceList(upgradeCost) : "At max level.",
      disabled: !canUpgradeStructure(structure),
      tone: "default",
      reason: canUpgradeStructure(structure)
        ? "Improves passive output and active commands."
        : upgradeCost
          ? `Need ${Object.entries(upgradeCost)
            .filter(([resource, amount]) => (state[resource] || 0) < amount)
            .map(([resource, amount]) => formatResourceNeed(resource, amount - (state[resource] || 0)))
            .join(", ")}.`
          : "This orbital is already fully upgraded.",
      perform: () => upgradeStructure(structure.label, player),
    });
    actions.push({
      id: "disassemble-structure",
      label: "Disassemble",
      tag: "Salvage",
      detail: formatCompactResourceList(disassembleRefund(structure)),
      disabled: !canDisassembleStructure(structure),
      tone: "danger",
      reason: canDisassembleStructure(structure)
        ? "Breaks the orbital down and returns raw materials."
        : `Unlocks after ${structureLevel(structure) > 1 ? "selection refresh" : `L2, a duplicate, or cycle ${STRUCTURE_DISASSEMBLE_UNLOCK_CYCLE}`}.`,
      perform: () => disassembleStructure(structure.label, player),
    });
  }

  if (structure.blueprintId === "survey-array" || structure.label === "Survey Array") {
    const missing = missingDiscoveryRequirements();
    actions.push({
      id: "chart-system",
      label: state.discoveredSystem ? "Destination Charted" : "Chart Destination",
      tag: "Travel",
      detail: state.discoveredSystem ? state.discoveredSystem.name : formatCompactResourceList(discoveryCost()),
      disabled: !canDiscoverSystem(),
      tone: "default",
      reason: canDiscoverSystem() ? "Survey Array is the place to chart a new system." : `Need ${missing.slice(0, 2).join(", ")}${missing.length > 2 ? "..." : ""}.`,
      perform: () => discoverSystem(player),
    });
  }

  if (structure.blueprintId === "shipyard") {
    const missing = missingTravelRequirements();
    actions.push({
      id: "jump-system",
      label: state.discoveredSystem ? `Jump ${state.discoveredSystem.name}` : "Jump Locked",
      tag: "Travel",
      detail: state.discoveredSystem ? "Launch from this shipyard." : "Chart a destination first.",
      disabled: !canTravel(),
      tone: "default",
      reason: canTravel() ? "Shipyard Cradle moves the colony to the next system." : `Need ${missing.slice(0, 2).join(", ")}${missing.length > 2 ? "..." : ""}.`,
      perform: () => travelToDiscoveredSystem(player),
    });
  }

  for (const projectId of projectActionsForSelection(selected)) {
    const project = projectById(projectId);
    if (!project) {
      continue;
    }
    const missing = missingProjectRequirements(project);
    actions.push({
      id: `project-${project.id}`,
      label: project.label,
      tag: projectTrackLabel(project),
      detail: projectLevel(project.id) >= project.maxLevel ? "Complete" : formatCompactResourceList(scaledProjectCost(project)),
      disabled: !canFundProject(project),
      tone: project.id === recommendedProjectId() ? "primary" : "default",
      reason: canFundProject(project)
        ? projectEffectText(project, Math.min(project.maxLevel, projectLevel(project.id) + 1))
        : `Need ${missing.slice(0, 2).join(", ")}${missing.length > 2 ? "..." : ""}.`,
      perform: () => fundProject(project.id, player),
    });
  }

  return actions.slice(0, 10);
}

function localActionMenuOpen(player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  return Boolean(player.localMenuOpen);
}

function normalizeLocalActionIndex(player = primaryPlayer(), actions = contextActionDescriptors(player)) {
  player = ensurePlayerSelection(player);
  if (actions.length === 0) {
    player.localActionIndex = 0;
    return 0;
  }
  player.localActionIndex = clamp(player.localActionIndex ?? 0, 0, actions.length - 1);
  return player.localActionIndex;
}

function openLocalActionMenu(player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  const actions = contextActionDescriptors(player);
  if (actions.length === 0) {
    return false;
  }
  player.localMenuOpen = true;
  player.localActionIndex = 0;
  normalizeLocalActionIndex(player, actions);
  syncUi();
  return true;
}

function closeLocalActionMenu(player = primaryPlayer(), { resetIndex = false, sync = true } = {}) {
  player = ensurePlayerSelection(player);
  const wasOpen = Boolean(player.localMenuOpen);
  player.localMenuOpen = false;
  if (resetIndex) {
    player.localActionIndex = 0;
  }
  if (sync && wasOpen) {
    syncUi();
  }
  return wasOpen;
}

function moveLocalActionFocus(direction, player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  if (!localActionMenuOpen(player)) {
    return false;
  }

  const actions = contextActionDescriptors(player);
  if (actions.length === 0) {
    return false;
  }

  const currentIndex = normalizeLocalActionIndex(player, actions);
  const nextIndex = clamp(currentIndex + direction, 0, actions.length - 1);
  if (nextIndex === currentIndex) {
    return false;
  }
  player.localActionIndex = nextIndex;
  syncUi();
  return true;
}

function performFocusedLocalAction(player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  if (!localActionMenuOpen(player)) {
    return false;
  }

  const actions = contextActionDescriptors(player);
  const actionIndex = normalizeLocalActionIndex(player, actions);
  const action = actions[actionIndex];
  if (!action) {
    return false;
  }

  if (action.disabled) {
    state.lastImpactSummary = `${playerPrefix(player)}${action.label} is not ready. ${action.reason}`;
    addEventLog("blocked", state.lastImpactSummary);
    syncUi();
    return false;
  }

  const result = action.perform();
  if (player.selectedKind === "structure") {
    normalizeLocalActionIndex(player);
  } else {
    player.localMenuOpen = false;
    player.localActionIndex = 0;
  }
  syncUi();
  return result !== false;
}

function nextBuildableBlueprint(player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  const anchor = selectedAnchorBody(player);
  if (anchor) {
    const local = localBlueprintCandidates(anchor).find((blueprint) => canBuildBlueprint(blueprint));
    if (local) {
      return { blueprint: local, index: blueprintIndexById(local.id) };
    }
  }
  const startIndex = clamp(player.buildBlueprintIndex || 0, 0, STRUCTURE_BLUEPRINTS.length - 1);
  for (let offset = 0; offset < STRUCTURE_BLUEPRINTS.length; offset += 1) {
    const index = (startIndex + offset) % STRUCTURE_BLUEPRINTS.length;
    const blueprint = STRUCTURE_BLUEPRINTS[index];
    if (canBuildBlueprint(blueprint)) {
      return { blueprint, index };
    }
  }
  return null;
}

function runPlayerCommand(player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  if (localActionMenuOpen(player)) {
    return performFocusedLocalAction(player);
  }
  const selected = selectedObject(player);
  if (selected.kind === "structure") {
    return runSelectedStructureCommand(player);
  }

  const nextBuild = nextBuildableBlueprint(player);
  if (!nextBuild) {
    const nextBlueprint = STRUCTURE_BLUEPRINTS[player.buildBlueprintIndex || 0] || STRUCTURE_BLUEPRINTS[0];
    const missing = nextBlueprint ? missingBlueprintRequirements(nextBlueprint) : [];
    state.lastBuildSummary = missing.length > 0
      ? `${playerPrefix(player)}No build order ready. ${nextBlueprint.label} requires ${missing.join(", ")}.`
      : `${playerPrefix(player)}No build order ready.`;
    state.lastImpactSummary = state.lastBuildSummary;
    addEventLog("blocked", state.lastBuildSummary);
    syncUi();
    return false;
  }

  player.buildBlueprintIndex = (nextBuild.index + 1) % STRUCTURE_BLUEPRINTS.length;
  const anchor = selectedAnchorBody(player);
  return anchor
    ? buildStructure(nextBuild.blueprint.id, player, { anchorLabel: anchor.label })
    : buildStructure(nextBuild.blueprint.id, player);
}

function queueAsteroidAction(player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  const selected = selectedObject(player);
  if (selected.kind === "body" && selected.item.type === "asteroid" && !isAsteroidBusy(selected.item.label)) {
    player.impactAsteroidLabel = selected.item.label;
  } else if (selected.kind === "body" && isTargetBody(selected.item)) {
    player.impactTargetLabel = selected.item.label;
  }
  return queueImpact(player);
}

function cancelPlayerCommand(player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  if (state.phase === "boot") {
    navigateToArcade();
    return true;
  }

  if (localActionMenuOpen(player)) {
    closeLocalActionMenu(player, { sync: false });
    state.lastImpactSummary = `${playerPrefix(player)}${player.selectedLabel} control deck closed.`;
    addEventLog("info", state.lastImpactSummary);
    syncUi();
    return true;
  }

  if (state.paused) {
    togglePause();
    return true;
  }

  const selected = selectedObject(player);
  const target = findBody(player.impactTargetLabel) || defaultTargetBody();
  if (target && (selected.kind !== "body" || selected.item.label !== target.label)) {
    selectObject("body", target.label, { autoDraft: false, player });
    state.lastImpactSummary = `${playerPrefix(player)}Command cancelled. Focus returned to ${target.label}.`;
    addEventLog("info", state.lastImpactSummary);
    syncUi();
    return true;
  }

  state.lastImpactSummary = `${playerPrefix(player)}No active command to cancel.`;
  addEventLog("info", state.lastImpactSummary);
  syncUi();
  return false;
}

function handleMenuBack(player = primaryPlayer()) {
  if (localActionMenuOpen(player)) {
    closeLocalActionMenu(player, { sync: false });
    state.lastImpactSummary = `${playerPrefix(player)}${player.selectedLabel} control deck closed.`;
    addEventLog("info", state.lastImpactSummary);
    syncUi();
    return true;
  }

  if (state.phase === "boot" || state.paused) {
    navigateToArcade();
    return true;
  }

  if (state.phase === "running") {
    state.paused = true;
    state.accumulator = 0;
    state.lastTime = performance.now();
    state.lastImpactSummary = `${playerPrefix(player)}Paused. Press Back/View again to return to the arcade.`;
    addEventLog("info", state.lastImpactSummary);
    syncUi();
    return true;
  }

  return false;
}

function setOrdersDrawerOpen(open) {
  if (!ui.operationsDrawer) {
    return;
  }
  ui.operationsDrawer.open = Boolean(open);
  playfieldStage.classList.toggle("is-orders-open", Boolean(open));
}

function resetState(nextPhase = "boot") {
  loadStarterSystemBodies();
  state.currentSystemArchetypeId = STARTER_ARCHETYPE_ID;
  state.systemName = "Helio Cradle";
  state.systemIndex = 0;
  state.jumps = 0;
  state.totalCycles = 0;
  state.discoveredSystem = null;
  state.visitedSystems = ["Helio Cradle"];
  state.projectLevels = createProjectLevelState();
  restoreSystemLayout();
  nextImpactId = 1;
  state.phase = nextPhase;
  state.cycle = 0;
  state.stability = 87;
  state.mass = STARTING_RESOURCES.mass;
  state.volatiles = STARTING_RESOURCES.volatiles;
  state.plasma = STARTING_RESOURCES.plasma;
  state.exotic = STARTING_RESOURCES.exotic;
  state.population = STARTING_RESOURCES.population;
  state.crew = STARTING_RESOURCES.crew;
  state.fleet = STARTING_RESOURCES.fleet;
  state.elapsed = 0;
  state.lastTime = performance.now();
  state.accumulator = 0;
  state.paused = false;
  state.timeScaleIndex = 1;
  state.impactQueue = [];
  state.impactBursts = [];
  state.actionBursts = [];
  state.massAdjustment = 0;
  state.volatilesAdjustment = 0;
  state.plasmaAdjustment = 0;
  state.exoticAdjustment = 0;
  state.populationAdjustment = 0;
  state.crewAdjustment = 0;
  state.fleetAdjustment = 0;
  state.stabilityAdjustment = 0;
  state.lastBuildSummary = "Start with Habitat Ring. It turns volatiles into population and crew for shipyards, depots, and later science.";
  state.lastProjectSummary = "Fund local science and engineering to climb from orbital depots to warp drives.";
  state.lastTravelSummary = "Build Habitat, Shipyard, Refueling, and Survey Array before even thinking about interstellar travel.";
  state.lastImpactSummary = "Build Habitat Ring first. Impacts are industrial tools later, not opening moves.";
  state.outcomeReport = null;
  state.nextOutcomeId = 1;
  state.events = [];
  state.nextEventId = 1;
  state.lastHazardTick = 0;
  state.collapseLogged = false;
  resetAllPlayersForSystem();
  addEventLog(nextPhase === "running" ? "info" : "success", nextPhase === "running" ? "Survey cycle active. Orbital works and tech ladders accepting orders." : "Seed system loaded. Start the run to begin the orbital age.");
  state.bootMenuFocusIndex = 0;
  setOrdersDrawerOpen(false);
  syncUi();
}

function startRun() {
  unlockMusic();
  if (state.phase === "running") {
    state.paused = false;
    state.lastTime = performance.now();
    syncUi();
    return;
  }

  resetState("running");
  setOrdersDrawerOpen(true);
  syncUi();
}

function restartRun() {
  unlockMusic();
  clearSavedCampaign();
  resetState("running");
  setOrdersDrawerOpen(true);
  addEventLog("success", "Campaign reset to Helio Cradle. Early orbital economy restored.");
  syncUi();
}

function togglePause() {
  if (state.phase === "boot") {
    startRun();
    return;
  }

  if (state.phase !== "running") {
    return;
  }

  state.paused = !state.paused;
  state.accumulator = 0;
  state.lastTime = performance.now();
  addEventLog("info", state.paused ? "Simulation paused." : "Simulation resumed.");
  syncUi();
}

function currentTimeScale() {
  return TIME_SCALES[state.timeScaleIndex];
}

function changeTimeScale(direction) {
  state.timeScaleIndex = Math.max(0, Math.min(TIME_SCALES.length - 1, state.timeScaleIndex + direction));
  addEventLog("info", `Time scale set to ${currentTimeScale()}x.`);
  syncUi();
}

function describeSelection(selected) {
  const populationText = ` / ${compactPopulationReadout(selected)}`;
  if (selected.kind === "structure") {
    const rates = selected.item.rates ? ` / ${formatCompactRates(selected.item.rates)}` : "";
    const status = selected.item.offline ? `offline: ${selected.item.offlineReason}` : "online";
    const anchor = selected.item.anchorLabel ? ` / ${selected.item.anchorLabel}` : "";
    const levelText = selected.item.blueprintId ? ` / ${structureLevelTag(selected.item)}` : "";
    return `${selected.item.label}: ${status}${levelText}${anchor}${populationText}${rates}`;
  }

  const body = selected.item;
  if (body.type === "black-hole") {
    return `${body.label}: black-hole anchor / harvester unlock / select to build locally`;
  }

  if (body.type === "asteroid") {
    const status = isAsteroidBusy(body.label) ? "in flight" : "idle";
    return `${body.label}: asteroid ${status} / spin ${body.spin.toFixed(2)} / select to queue impact work`;
  }

  if (body.type === "moon") {
    return `${body.label}: moon / ${body.parent} / ${Math.round(body.orbit)}u${populationText}`;
  }

  return `${body.label}: orbit ${Math.round(body.orbit)}u / spin ${body.spin.toFixed(2)}${populationText} / select to commission orbitals here`;
}

function draftText(player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  const asteroid = findBody(player.impactAsteroidLabel);
  const target = findBody(player.impactTargetLabel);
  const asteroidText = asteroid ? asteroid.label : "No rock";
  const targetText = target ? target.label : "No target";
  const queueText = state.impactQueue.length > 0 ? ` (${state.impactQueue.length}/${MAX_ACTIVE_IMPACTS})` : "";
  return `${player.label} ${asteroidText} -> ${targetText} / ${compactIntentLabel(currentIntent(player))}${queueText}`;
}

function setupBuildControls() {
  if (!ui.buildList) {
    return;
  }

  ui.buildList.textContent = "";
  buildCardNodes.clear();

  for (let index = 0; index < 3; index += 1) {
    const card = document.createElement("article");
    card.className = "goal-card";

    const title = document.createElement("strong");
    title.className = "goal-card__title";

    const detail = document.createElement("p");
    detail.className = "goal-card__detail";

    card.append(title, detail);
    ui.buildList.append(card);
    buildCardNodes.set(`goal-${index}`, { card, title, detail });
  }
}

function syncBuildControls() {
  if (!ui.buildList) {
    return;
  }

  const goals = suggestedGoalCards();
  const signature = goals.map((goal) => `${goal.title}:${goal.detail}`).join("|");
  if (signature === renderedBuildSignature) {
    return;
  }
  renderedBuildSignature = signature;

  ui.buildCount.textContent = `${goals.length} live`;
  ui.buildStatus.textContent = compactHudText("Goals only. Select a world or structure to actually do the work.", 84);

  for (let index = 0; index < 3; index += 1) {
    const nodes = buildCardNodes.get(`goal-${index}`);
    const goal = goals[index];
    if (!nodes) {
      continue;
    }
    nodes.card.classList.toggle("is-hidden", !goal);
    nodes.title.textContent = goal?.title || "";
    nodes.detail.textContent = goal?.detail || "";
  }
}

function setupProjectControls() {
  if (!ui.projectList) {
    return;
  }

  ui.projectList.textContent = "";
  projectCardNodes.clear();

  for (const rule of LOCAL_RULES) {
    const card = document.createElement("article");
    card.className = "note-card";

    const title = document.createElement("strong");
    title.className = "note-card__title";
    title.textContent = rule.title;

    const detail = document.createElement("p");
    detail.className = "note-card__detail";
    detail.textContent = rule.detail;

    card.append(title, detail);
    ui.projectList.append(card);
    projectCardNodes.set(rule.id, { card, title, detail });
  }
}

function syncProjectControls() {
  if (!ui.projectList) {
    return;
  }

  const selected = selectedObject(primaryPlayer());
  const ordered = orderedLocalRules(selected);
  const signature = [
    selected.kind,
    selected.item.label,
    ordered.map((rule) => rule.id).join("|"),
  ].join("::");
  if (signature === renderedProjectSignature) {
    return;
  }
  renderedProjectSignature = signature;

  ui.projectCount.textContent = "Local menus";
  ui.projectStatus.textContent = compactHudText(selectionLearnText(primaryPlayer(), selected), 86);

  for (const rule of LOCAL_RULES) {
    const nodes = projectCardNodes.get(rule.id);
    if (!nodes) {
      continue;
    }
    const emphasis = ordered[0]?.id === rule.id;
    nodes.card.classList.toggle("is-emphasis", emphasis);
    nodes.title.textContent = rule.title;
    nodes.detail.textContent = rule.detail;
  }
}

function objectiveState() {
  if (state.phase === "boot") {
    return {
      title: "Select a world",
      detail: "Then build Habitat Ring from its local menu. Travel is a late-game technology now.",
    };
  }

  if (state.stability <= 0) {
    return {
      title: "Collapse",
      detail: "Reset and reduce hazard load.",
    };
  }

  if (state.stability < 25) {
    return {
      title: "Recover stability",
      detail: "Patch with retrofits; avoid impacts.",
    };
  }

  if (!hasBuiltStructure("habitat")) {
    return {
      title: "Build Habitat",
      detail: "Select a planet and commission it there.",
    };
  }

  if (!hasBuiltStructure("shipyard")) {
    if (state.crew < 3) {
      return {
        title: "Grow Crew",
        detail: `${state.crew.toFixed(1)}/3 for Shipyard.`,
      };
    }
    return {
      title: "Build Shipyard",
      detail: "Commission it from a selected planet.",
    };
  }

  if (!hasProjectLevel("orbital-refueling")) {
    return {
      title: "Fund Refueling",
      detail: "Use Shipyard Cradle to build depot logistics before heavier orbital programs.",
    };
  }

  if (!hasBuiltStructure("survey-array")) {
    return {
      title: "Build Survey Array",
      detail: "Commission the observatory from a selected world to open the science ladder.",
    };
  }

  if (!hasProjectLevel("survey-network")) {
    return {
      title: "Fund Survey Network",
      detail: "Use Survey Array to establish your first real observatory project.",
    };
  }

  if (!hasProjectLevel("asteroid-prospecting")) {
    return {
      title: "Fund Prospecting",
      detail: "Use Survey Array to unlock asteroid industry and Mass Driver construction.",
    };
  }

  if (!hasBuiltStructure("mass-driver")) {
    return {
      title: "Build Mass Driver",
      detail: "Commission it from a selected world once prospecting is online.",
    };
  }

  if (!hasProjectLevel("asteroid-refineries")) {
    return {
      title: "Fund Refineries",
      detail: "Use Mass Driver to turn asteroid handling into real industrial feedstock.",
    };
  }

  if (!hasBuiltStructure("solar-lifter")) {
    return {
      title: "Build Solar Lifter",
      detail: "Commission the late stellar-industry tier from an inner world.",
    };
  }

  if (!hasProjectLevel("megahabitat-charters")) {
    return {
      title: "Fund Megahabitats",
      detail: "Use Habitat Ring to unlock O'Neill-cylinder-scale civic engineering.",
    };
  }

  if (!hasBuiltStructure("o-neill-cylinder")) {
    return {
      title: "Build O'Neill Cylinder",
      detail: "Commission a city-scale habitat from a selected world.",
    };
  }

  if (!hasProjectLevel("synthetic-ecologies")) {
    return {
      title: "Fund Synthetic Ecologies",
      detail: "Use the O'Neill Cylinder to push toward full artificial worlds.",
    };
  }

  if (!hasBuiltStructure("synthetic-world")) {
    return {
      title: "Build Synthetic World",
      detail: "Commission a full artificial world before singularity research.",
    };
  }

  if (!hasProjectLevel("deep-space-relays")) {
    return {
      title: "Fund Deep Space Relays",
      detail: "Use Survey Array to unlock interstellar charting, not travel yet.",
    };
  }

  if (!hasProjectLevel("singularity-theory")) {
    return {
      title: "Fund Singularity Theory",
      detail: "Close the science case for gravity engineering before attempting warp drives.",
    };
  }

  if (!hasProjectLevel("warp-drives")) {
    return {
      title: "Fund Warp Drives",
      detail: "Use Shipyard Cradle to finally unlock interstellar travel.",
    };
  }

  if (!state.discoveredSystem) {
    const missing = missingDiscoveryRequirements();
    if (missing.length === 0) {
      return {
        title: "Chart destination",
        detail: `Select Survey Array and spend ${formatCompactResourceList(discoveryCost())}.`,
      };
    }
    return {
      title: "Charge charting",
      detail: `Need ${missing.slice(0, 2).join(", ")}${missing.length > 2 ? "..." : ""}.`,
    };
  }

  if (canTravel()) {
    return {
      title: `Jump: ${state.discoveredSystem.name}`,
      detail: "Use Shipyard Cradle to depart.",
    };
  }

  const missing = missingTravelRequirements();
  return {
    title: "Prep jump",
    detail: `Need ${missing.slice(0, 2).join(", ")}${missing.length > 2 ? "..." : ""}.`,
  };
}

function computeWarnings() {
  const warnings = [];
  const offlineStructures = structures.filter((structure) => structure.offline);

  if (state.phase === "boot") {
    return warnings;
  }

  if (state.stability <= 0) {
    warnings.push({
      level: "danger",
      title: "Collapse",
      detail: "Reset to recover.",
    });
  } else if (state.stability < 25) {
    warnings.push({
      level: "danger",
      title: "Critical stability",
      detail: "Pause impacts; patch orbitals.",
    });
  } else if (state.stability < 45) {
    warnings.push({
      level: "warning",
      title: "Low stability",
      detail: "Impacts and surges are risky.",
    });
  }

  if (offlineStructures.length > 0) {
    warnings.push({
      level: "warning",
      title: `${offlineStructures.length} structure${offlineStructures.length === 1 ? "" : "s"} offline`,
      detail: offlineStructures.slice(0, 1).map((structure) => `${structure.label} ${structure.offlineReason}`).join("; "),
    });
  }

  if (state.impactQueue.length >= MAX_ACTIVE_IMPACTS) {
    warnings.push({
      level: "warning",
      title: "Impact queue full",
      detail: "Wait for current impacts.",
    });
  }

  if (state.mass < IMPACT_MASS_COST) {
    warnings.push({
      level: "warning",
      title: "Mass below impact cost",
      detail: `Need Mass ${IMPACT_MASS_COST}.`,
    });
  }

  if (state.discoveredSystem && state.plasma < TRAVEL_COST.plasma) {
    warnings.push({
      level: "warning",
      title: "Jump plasma shortfall",
      detail: `Need ${formatResourceNeed("plasma", TRAVEL_COST.plasma - state.plasma)}.`,
    });
  }

  if (state.discoveredSystem && state.population < TRAVEL_COST.population) {
    warnings.push({
      level: "warning",
      title: "Jump population shortfall",
      detail: `Need ${formatResourceNeed("population", TRAVEL_COST.population - state.population)}.`,
    });
  }

  return warnings;
}

function syncObjectiveHud() {
  const objective = objectiveState();
  ui.objective.textContent = objective.title;
  ui.objectiveDetail.textContent = objective.detail;
  ui.stabilityChip.textContent = `${Math.max(0, Math.round(state.stability))}%`;
  ui.activeImpacts.textContent = `${state.impactQueue.length}/${MAX_ACTIVE_IMPACTS}`;
  ui.readiness.textContent = travelStateText();
}

function syncWarnings() {
  const warnings = computeWarnings();
  ui.warningList.textContent = "";
  ui.warningCount.textContent = warnings.length === 0 ? "Clear" : String(warnings.length);
  ui.warningStack.classList.toggle("is-clear", warnings.length === 0);
  ui.warningStack.classList.toggle("has-danger", warnings.some((warning) => warning.level === "danger"));

  if (warnings.length === 0) {
    const item = document.createElement("div");
    item.className = "warning-item warning-item--clear";
    const title = document.createElement("strong");
    title.textContent = "Clear";
    item.append(title);
    ui.warningList.append(item);
    return;
  }

  for (const warning of warnings.slice(0, WARNING_VISIBLE_LIMIT)) {
    const item = document.createElement("div");
    item.className = `warning-item warning-item--${warning.level}`;
    const title = document.createElement("strong");
    title.textContent = warning.title;
    const detail = document.createElement("span");
    detail.textContent = warning.detail;
    item.append(title, detail);
    ui.warningList.append(item);
  }
}

function syncEventLog() {
  const visibleEvents = state.events.slice(0, EVENT_LOG_VISIBLE_LIMIT);
  const signature = visibleEvents.map((event) => `${event.id}:${event.kind}:${compactEventMessage(event)}:${Math.floor(event.time)}`).join("|");
  if (signature === renderedEventSignature) {
    return;
  }
  renderedEventSignature = signature;

  ui.eventLogList.textContent = "";
  ui.eventCount.textContent = state.events.length > EVENT_LOG_VISIBLE_LIMIT
    ? `${EVENT_LOG_VISIBLE_LIMIT}/${state.events.length}`
    : String(state.events.length);

  for (const event of visibleEvents) {
    const item = document.createElement("li");
    item.className = `event-log__item event-log__item--${event.kind}`;
    const label = document.createElement("small");
    label.textContent = formatClock(event.time);
    const message = document.createElement("span");
    message.textContent = compactEventMessage(event);
    item.append(label, message);
    ui.eventLogList.append(item);
  }
}

function syncOutcomeReport() {
  if (!ui.outcomeReport) {
    return;
  }

  const report = state.phase === "running" ? state.outcomeReport : null;
  if (!report) {
    ui.outcomeReport.hidden = true;
    renderedOutcomeSignature = "";
    return;
  }

  const signature = [
    report.id,
    report.tone,
    report.kicker,
    report.title,
    report.story,
    report.now,
    report.output,
  ].join("::");
  ui.outcomeReport.hidden = false;
  if (signature === renderedOutcomeSignature) {
    return;
  }
  renderedOutcomeSignature = signature;

  ui.outcomeReport.className = `outcome-report outcome-report--${report.tone || "build"}`;
  if (ui.outcomeKicker) {
    ui.outcomeKicker.textContent = report.kicker || "Mission Report";
  }
  if (ui.outcomeTitle) {
    ui.outcomeTitle.textContent = compactHudText(report.title, 72);
  }
  if (ui.outcomeStory) {
    ui.outcomeStory.textContent = compactHudText(report.story, 190);
  }
  if (ui.outcomeNow) {
    ui.outcomeNow.textContent = compactHudText(report.now, 118);
  }
  if (ui.outcomeOutput) {
    ui.outcomeOutput.textContent = compactHudText(report.output, 96);
  }
}

function playerControlLabel(player) {
  if (Number.isInteger(player.controllerIndex)) {
    return connectedGamepads.get(player.controllerIndex)?.label || "Controller " + (player.controllerIndex + 1);
  }
  if (player.id === 1) {
    return "Keyboard / mouse";
  }
  return "Press A or Start to join";
}

function compactPlayerControlLabel(player) {
  if (Number.isInteger(player.controllerIndex)) {
    return "Pad " + (player.controllerIndex + 1);
  }
  return player.id === 1 ? "Keys / mouse" : "Open slot";
}

function compactSelectionSummary(selected) {
  const populationText = compactPopulationReadout(selected);
  if (selected.kind === "structure") {
    const stateText = selected.item.offline ? "offline" : "online";
    const anchorText = selected.item.anchorLabel ? ` / ${selected.item.anchorLabel}` : "";
    const levelText = selected.item.blueprintId ? ` / ${structureLevelTag(selected.item)}` : "";
    return "structure / " + stateText + levelText + anchorText + " / " + populationText;
  }

  const body = selected.item;
  if (body.type === "asteroid") {
    return "asteroid / " + (isAsteroidBusy(body.label) ? "in flight" : "idle");
  }
  if (body.type === "moon") {
    return "moon / " + (body.parent || "free") + " / " + populationText;
  }
  if (body.type === "black-hole") {
    return "black-hole / harvest anchor";
  }
  return "orbit " + Math.round(body.orbit) + "u / spin " + body.spin.toFixed(2) + " / " + populationText;
}

function compactDraftText(player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  const asteroid = findBody(player.impactAsteroidLabel);
  const target = findBody(player.impactTargetLabel);
  return (asteroid ? asteroid.label : "No asteroid") + " -> " + (target ? target.label : "No target");
}

function playerActionText(player, selected) {
  if (localActionMenuOpen(player)) {
    return "Stick moves actions / A execute / B exit";
  }
  if (selected.kind === "structure") {
    return "LB worlds / RB orbitals / A opens deck / X quick-run";
  }
  if (selected.item.type === "asteroid") {
    return "LB worlds / RB orbitals / A opens impact deck / Y queues";
  }
  if (isTargetBody(selected.item)) {
    return "LB worlds / RB orbitals / A opens local deck / X quick-build";
  }
  return "LB worlds / RB orbitals / A opens local deck / X acts";
}

function syncFocusedSelection() {
  if (!ui.selection || !ui.selectionDetail || !ui.contextActionList) {
    return;
  }

  const player = primaryPlayer();
  const selected = selectedObject(player);
  const art = focusArtForSelection(selected);
  const actions = contextActionDescriptors(player);
  const deckOpen = localActionMenuOpen(player);
  const focusedActionIndex = normalizeLocalActionIndex(player, actions);
  const signature = [
    selected.kind,
    selected.item.label,
    selected.kind === "structure" ? structureLevel(selected.item) : selected.item.type,
    formatPopulation(populationForSelection(selected)),
    player.impactAsteroidLabel,
    player.impactTargetLabel,
    currentIntent(player).id,
    deckOpen,
    focusedActionIndex,
    actions.map((action) => `${action.id}:${action.disabled}:${action.label}:${action.detail}`).join("|"),
  ].join("::");

  if (signature === renderedFocusSignature) {
    return;
  }
  renderedFocusSignature = signature;

  if (ui.commandPanel) {
    ui.commandPanel.hidden = !deckOpen;
  }
  ui.commandPanel?.classList.toggle("is-structure-focus", selected.kind === "structure");
  ui.commandPanel?.classList.toggle("is-body-focus", selected.kind === "body");
  ui.commandPanel?.classList.toggle("is-action-deck-open", deckOpen);

  ui.selection.textContent = selected.kind === "structure" ? structureDisplayName(selected.item) : selected.item.label;
  ui.selectionDetail.textContent = compactHudText(describeSelection(selected), 96);
  if (ui.selectionLearn) {
    ui.selectionLearn.textContent = compactHudText(selectionLearnText(player, selected), 132);
  }

  if (ui.assetFigure) {
    const accent = selected.item.color || selected.item.accent || "#8ce5f0";
    if (typeof ui.assetFigure.style?.setProperty === "function") {
      ui.assetFigure.style.setProperty("--asset-accent", accent);
    } else if (ui.assetFigure.style) {
      ui.assetFigure.style["--asset-accent"] = accent;
    }
    ui.assetFigure.classList.remove("has-image");
    ui.assetFigure.classList.add("is-missing");
  }
  if (ui.assetKicker) {
    ui.assetKicker.textContent = art.kicker;
  }
  if (ui.assetTitle) {
    ui.assetTitle.textContent = art.title;
  }
  if (ui.assetPrompt) {
    ui.assetPrompt.textContent = art.prompt;
  }
  if (ui.assetImage) {
    ui.assetImage.alt = `${art.title} concept art`;
    ui.assetImage.src = art.image;
  }

  ui.contextActionList.textContent = "";
  let focusedButton = null;
  actions.forEach((action, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `asset-action${action.tone ? ` asset-action--${action.tone}` : ""}`;
    if (deckOpen && index === focusedActionIndex) {
      button.classList.add("is-gamepad-focus");
      focusedButton = button;
    }
    button.disabled = action.disabled;
    button.addEventListener("click", action.perform);

    const tag = document.createElement("span");
    tag.className = "asset-action__tag";
    tag.textContent = action.tag;

    const label = document.createElement("strong");
    label.className = "asset-action__label";
    label.textContent = action.label;

    const detail = document.createElement("span");
    detail.className = "asset-action__detail";
    detail.textContent = action.detail;

    const reason = document.createElement("span");
    reason.className = "asset-action__reason";
    reason.textContent = action.reason;

    button.append(tag, label, detail, reason);
    ui.contextActionList.append(button);
  });
  focusedButton?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
}

function syncJoinPanel() {
  if (!ui.joinList || !ui.joinCount || !ui.joinDetail) {
    return;
  }

  const players = activePlayers();
  const pads = [...connectedGamepads.values()].sort((a, b) => a.index - b.index);
  const unjoinedPads = pads.filter((pad) => !pad.joined).length;
  const signature = [
    players.map((player) => `${player.id}:${player.controllerIndex ?? "keyboard"}:${player.selectedLabel}`).join("|"),
    pads.map((pad) => `${pad.index}:${pad.playerId ?? "open"}:${pad.label}`).join("|"),
  ].join("::");

  ui.joinCount.textContent = `${players.length} player${players.length === 1 ? "" : "s"}`;
  ui.joinDetail.textContent = unjoinedPads > 0
    ? `${unjoinedPads} controller${unjoinedPads === 1 ? "" : "s"} ready. Press A or Start to claim the next player slot.`
    : "Press A or Start on controllers to join P1-P4 before or during the run.";

  if (signature === renderedJoinSignature) {
    return;
  }
  renderedJoinSignature = signature;

  ui.joinList.textContent = "";
  for (const player of state.players) {
    const row = document.createElement("div");
    row.className = "join-slot";
    row.style.borderLeftColor = player.active ? player.color : "rgba(155, 218, 226, 0.28)";
    const name = document.createElement("strong");
    name.textContent = `${player.label}${player.active ? " joined" : " open"}`;
    const control = document.createElement("span");
    control.textContent = player.active ? playerControlLabel(player) : "Controller join";
    row.append(name, control);
    ui.joinList.append(row);
  }
}

function syncPlayerPanels() {
  if (!ui.playerPanels) {
    return;
  }

  const players = activePlayers();
  const compact = players.length > 1;
  const signature = players.map((player) => {
    const selected = selectedObject(player);
    return [
      compact ? "compact" : "full",
      player.id,
      player.controllerIndex ?? "keyboard",
      compactPlayerControlLabel(player),
      player.selectedKind,
      player.selectedLabel,
      formatPopulation(populationForSelection(selected)),
      selected.kind === "body" ? Math.round(selected.item.orbit) : selected.item.offline ? "offline" : "online",
      selected.kind === "body" ? selected.item.spin.toFixed(2) : selected.item.commandLabel,
      player.impactAsteroidLabel,
      player.impactTargetLabel,
      player.commandIntent,
      state.impactQueue.filter((impact) => impact.ownerPlayerId === player.id).length,
    ].join(":");
  }).join("|");

  if (signature === renderedPlayerPanelSignature) {
    return;
  }
  renderedPlayerPanelSignature = signature;
  ui.playerPanels.textContent = "";

  for (const player of players) {
    const selected = selectedObject(player);
    const ownQueue = state.impactQueue.filter((impact) => impact.ownerPlayerId === player.id).length;
    const panel = document.createElement("article");
    panel.className = "player-panel";
    panel.style.borderLeftColor = player.color;

    const topline = document.createElement("div");
    topline.className = "player-panel__topline";
    const label = document.createElement("span");
    label.className = "eyebrow";
    label.textContent = compact
      ? `${player.label} ${compactPlayerControlLabel(player)}`
      : `${player.label} / ${compactPlayerControlLabel(player)}`;
    const title = document.createElement("strong");
    title.textContent = selected.item.label;
    topline.append(label, title);

    const detail = document.createElement("p");
    detail.className = "player-panel__detail";
    detail.textContent = compactSelectionSummary(selected);

    const meta = document.createElement("div");
    meta.className = "player-panel__meta";
    const metaItems = compact
      ? [
        ["T", player.impactTargetLabel || "None"],
        ["R", player.impactAsteroidLabel || "None"],
        ["M", compactIntentLabel(currentIntent(player))],
      ]
      : [
        ["Target", player.impactTargetLabel || "None"],
        ["Rock", player.impactAsteroidLabel || "None"],
        ["Mode", currentIntent(player).label],
      ];
    for (const [name, value] of metaItems) {
      const item = document.createElement("span");
      const valueNode = document.createElement("strong");
      item.append(document.createTextNode(name), valueNode);
      valueNode.textContent = value;
      meta.append(item);
    }

    panel.append(topline, detail, meta);

    if (compact) {
      if (ownQueue > 0) {
        const queued = document.createElement("p");
        queued.className = "player-panel__draft";
        queued.textContent = `${ownQueue} queued`;
        panel.append(queued);
      }
    } else {
      const draft = document.createElement("p");
      draft.className = "player-panel__draft";
      draft.textContent = compactDraftText(player);

      const action = document.createElement("p");
      action.className = "player-panel__action";
      action.textContent = playerActionText(player, selected);

      panel.append(draft, action);
    }

    ui.playerPanels.append(panel);
  }
}

function syncUi() {
  ui.cycle.textContent = String(state.cycle);
  ui.stability.textContent = `${Math.max(0, Math.round(state.stability))}%`;
  ui.mass.textContent = String(Math.round(state.mass));
  ui.volatiles.textContent = String(Math.round(state.volatiles));
  ui.plasma.textContent = String(Math.round(state.plasma));
  ui.exotic.textContent = state.exotic.toFixed(1);
  ui.population.textContent = formatPopulation(state.population);
  ui.crew.textContent = state.crew.toFixed(1);
  ui.fleet.textContent = state.fleet.toFixed(1);
  ui.system.textContent = state.systemName;
  ui.jumps.textContent = String(state.jumps);

  const players = activePlayers();
  const multiplayer = players.length > 1;
  ui.players.textContent = players.length + "P";
  playfieldStage.classList.toggle("is-multiplayer", multiplayer);
  playfieldStage.classList.toggle("is-running", state.phase === "running");
  playfieldStage.classList.toggle("is-hud-compact", true);
  playfieldStage.classList.toggle("is-orders-open", Boolean(ui.operationsDrawer?.open));
  syncJoinPanel();
  syncPlayerPanels();

  const primary = primaryPlayer();
  const selected = selectedObject(primary);
  ui.commandOwner.textContent = primary.label + " Local Actions";
  ui.impactDraft.textContent = draftText(primary);
  syncFocusedSelection();

  ui.timeScale.textContent = currentTimeScale() + "x";
  ui.pauseButton.textContent = state.phase === "boot" ? "Start" : state.paused ? "Resume" : "Pause";
  ui.slowerButton.disabled = state.timeScaleIndex === 0;
  ui.fasterButton.disabled = state.timeScaleIndex === TIME_SCALES.length - 1;
  if (ui.markAsteroidButton) {
    ui.markAsteroidButton.disabled = selected.kind !== "body" || selected.item.type !== "asteroid" || isAsteroidBusy(selected.item.label);
  }
  if (ui.markTargetButton) {
    ui.markTargetButton.disabled = selected.kind !== "body" || !isTargetBody(selected.item);
  }
  if (ui.impactIntentButton) {
    ui.impactIntentButton.textContent = currentIntent(primary).label;
  }
  if (ui.structureCommandButton) {
    ui.structureCommandButton.disabled = selected.kind !== "structure";
    ui.structureCommandButton.textContent = selected.kind === "structure" ? selected.item.commandLabel : "Run Structure";
  }
  if (ui.previousSelectionButton) {
    ui.previousSelectionButton.disabled = localActionMenuOpen(primary);
  }
  if (ui.nextSelectionButton) {
    ui.nextSelectionButton.disabled = localActionMenuOpen(primary);
  }
  if (ui.queueImpactButton) {
    ui.queueImpactButton.disabled = !canQueueImpact(primary);
    ui.queueImpactButton.classList.toggle("command--primary", selected.kind === "body" && selected.item.type === "asteroid");
  }
  if (ui.ordersSummary) {
    ui.ordersSummary.textContent = ordersSummaryText();
  }
  ui.travelState.textContent = travelStateText();
  ui.systemDetail.textContent = systemDetailText();
  ui.discovery.textContent = discoveryStatusText();
  if (ui.chartSystemButton) {
    ui.chartSystemButton.disabled = !canDiscoverSystem();
  }
  if (ui.jumpSystemButton) {
    ui.jumpSystemButton.disabled = !canTravel();
  }
  syncBuildControls();
  syncProjectControls();
  syncObjectiveHud();
  syncWarnings();
  syncEventLog();
  syncOutcomeReport();
  ui.bootPanel.classList.toggle("is-hidden", state.phase === "running");

  if (state.phase === "boot") {
    ui.phase.textContent = "Boot ready.";
    ui.hint.textContent = guidanceHintText();
  } else if (state.paused) {
    ui.phase.textContent = "Paused.";
    ui.hint.textContent = "Press P, Start, or Resume.";
  } else {
    ui.phase.textContent = multiplayer ? `${players.length}P survey active.` : "Survey active.";
    ui.hint.textContent = compactHudText(guidanceHintText(), multiplayer ? 70 : 94);
  }
}

function arcadeLandingHref() {
  return ui.arcadeLink?.getAttribute("href") || "../../index.html";
}

function navigateToArcade() {
  const href = arcadeLandingHref();
  saveCampaign();
  if (typeof window.location?.assign === "function") {
    window.location.assign(href);
    return;
  }
  window.location.href = href;
}

function bootMenuControls() {
  return [ui.startButton, ui.arcadeLink].filter(Boolean);
}

function bootMenuFocusIndex() {
  const controls = bootMenuControls();
  const activeIndex = controls.indexOf(document.activeElement);
  return activeIndex >= 0 ? activeIndex : clamp(state.bootMenuFocusIndex, 0, Math.max(0, controls.length - 1));
}

function focusBootMenuControl(direction) {
  const controls = bootMenuControls();
  if (controls.length === 0) {
    return;
  }

  state.bootMenuFocusIndex = (bootMenuFocusIndex() + direction + controls.length) % controls.length;
  controls[state.bootMenuFocusIndex].focus?.();
}

function activateBootMenuControl() {
  const controls = bootMenuControls();
  if (controls.length === 0) {
    return;
  }

  const active = controls.includes(document.activeElement)
    ? document.activeElement
    : controls[state.bootMenuFocusIndex] || ui.startButton;
  active?.click?.();
}

function focusedCommandShouldHandleKey(event) {
  const tagName = event.target?.tagName;
  return tagName === "BUTTON" || tagName === "A";
}

function gamepadApiSupported() {
  return typeof navigator !== "undefined" && typeof navigator.getGamepads === "function";
}

function getGamepads() {
  if (!gamepadApiSupported()) {
    return [];
  }

  try {
    return Array.from(navigator.getGamepads()).filter(Boolean);
  } catch {
    return [];
  }
}

function gamepadLabel(pad) {
  const label = String(pad?.id || "").split("(")[0].trim();
  return label || `Controller ${(pad?.index ?? 0) + 1}`;
}

function playerForController(index) {
  return state.players.find((player) => player.controllerIndex === index) || null;
}

function updateConnectedGamepadRecord(pad) {
  if (!pad || typeof pad.index !== "number") {
    return null;
  }

  const player = playerForController(pad.index);
  const record = {
    index: pad.index,
    label: gamepadLabel(pad),
    playerId: player?.id || null,
    joined: Boolean(player),
  };
  connectedGamepads.set(pad.index, record);
  return record;
}

function assignGamepadToPlayer(pad) {
  const existingPlayer = playerForController(pad.index);
  if (existingPlayer) {
    existingPlayer.active = true;
    updateConnectedGamepadRecord(pad);
    return existingPlayer;
  }

  const openPlayer = state.players.find((player) => !Number.isInteger(player.controllerIndex)) || null;
  if (!openPlayer) {
    return null;
  }

  openPlayer.controllerIndex = pad.index;
  openPlayer.active = true;
  openPlayer.inputSnapshot = {};
  ensurePlayerSelection(openPlayer);
  updateConnectedGamepadRecord(pad);
  return openPlayer;
}

function joinGamepad(pad) {
  const player = assignGamepadToPlayer(pad);
  if (!player) {
    return null;
  }

  state.lastImpactSummary = `${player.label} joined on ${gamepadLabel(pad)}.`;
  addEventLog("info", state.lastImpactSummary);
  syncUi();
  return player;
}

function registerGamepad(pad) {
  const previous = connectedGamepads.get(pad?.index);
  const next = updateConnectedGamepadRecord(pad);
  return Boolean(next) && (
    !previous
      || previous.label !== next.label
      || previous.playerId !== next.playerId
      || previous.joined !== next.joined
  );
}

function forgetGamepad(index) {
  const player = playerForController(index);
  if (player) {
    player.controllerIndex = null;
    player.active = player.id === 1;
    player.inputSnapshot = {};
  }
  const existed = connectedGamepads.delete(index);
  resetGamepadEdges();
  return existed || Boolean(player);
}

function syncConnectedGamepads(pads) {
  const liveIndexes = new Set();
  let changed = false;

  for (const pad of pads) {
    liveIndexes.add(pad.index);
    changed = registerGamepad(pad) || changed;
  }

  for (const index of [...connectedGamepads.keys()]) {
    if (!liveIndexes.has(index)) {
      changed = forgetGamepad(index) || changed;
    }
  }

  if (changed) {
    renderedJoinSignature = "";
    renderedPlayerPanelSignature = "";
    syncUi();
  }
}

function axisDirection(value) {
  if (value <= -GAMEPAD_AXIS_DEADZONE) {
    return -1;
  }
  if (value >= GAMEPAD_AXIS_DEADZONE) {
    return 1;
  }
  return 0;
}

function gamepadButtonPressed(pad, buttonName) {
  return Boolean(pad.buttons?.[GAMEPAD_BUTTONS[buttonName]]?.pressed);
}

function normalizeGamepad(pad) {
  const axisX = axisDirection(pad.axes?.[0] ?? 0);
  const axisY = axisDirection(pad.axes?.[1] ?? 0);
  const dpadX = (gamepadButtonPressed(pad, "dpadRight") ? 1 : 0) - (gamepadButtonPressed(pad, "dpadLeft") ? 1 : 0);
  const dpadY = (gamepadButtonPressed(pad, "dpadDown") ? 1 : 0) - (gamepadButtonPressed(pad, "dpadUp") ? 1 : 0);
  const horizontal = dpadX || axisX;
  const vertical = dpadY || axisY;

  return {
    index: pad.index,
    label: gamepadLabel(pad),
    focusPrevious: horizontal < 0,
    focusNext: horizontal > 0,
    nearbyPrevious: vertical < 0,
    nearbyNext: vertical > 0,
    categoryPrevious: gamepadButtonPressed(pad, "lb"),
    categoryNext: gamepadButtonPressed(pad, "rb"),
    confirm: gamepadButtonPressed(pad, "a"),
    cancel: gamepadButtonPressed(pad, "b"),
    command: gamepadButtonPressed(pad, "x"),
    asteroidAction: gamepadButtonPressed(pad, "y"),
    pause: gamepadButtonPressed(pad, "start"),
    menuBack: gamepadButtonPressed(pad, "back"),
  };
}

function pollGamepadInputs() {
  const pads = getGamepads();
  syncConnectedGamepads(pads);

  const inputs = new Map();
  for (const pad of pads) {
    const input = normalizeGamepad(pad);
    if (!playerForController(pad.index) && (input.confirm || input.pause)) {
      const player = joinGamepad(pad);
      if (player) {
        input.justJoined = true;
        player.inputSnapshot["pad-confirm"] = input.confirm;
        player.inputSnapshot["pad-pause"] = input.pause;
        player.inputSnapshot["pad-cancel"] = input.cancel;
        player.inputSnapshot["pad-command"] = input.command;
        player.inputSnapshot["pad-asteroid-action"] = input.asteroidAction;
        player.inputSnapshot["pad-menu-back"] = input.menuBack;
      }
    }
    inputs.set(pad.index, input);
  }
  return inputs;
}

function edgeTrigger(player, name, pressed) {
  const key = `pad-${name}`;
  const previous = player.inputSnapshot[key] || false;
  player.inputSnapshot[key] = pressed;
  return pressed && !previous;
}

function resetGamepadEdges() {
  for (const player of state.players) {
    player.inputSnapshot = {};
  }
}

function handleGamepadConnected(event) {
  registerGamepad(event.gamepad);
}

function handleGamepadDisconnected(event) {
  if (typeof event.gamepad?.index === "number") {
    forgetGamepad(event.gamepad.index);
  } else {
    resetGamepadEdges();
  }
}

function activatePlayerSelection(player) {
  if (contextActionDescriptors(player).length > 0) {
    return localActionMenuOpen(player) ? performFocusedLocalAction(player) : openLocalActionMenu(player);
  }
  const selected = selectedObject(player);
  if (selected.item.type === "asteroid") {
    return markSelectedAsteroid(player);
  }
  if (isTargetBody(selected.item)) {
    return markSelectedTarget(player);
  }
  return false;
}

function handlePlayerGamepadInput(player, input) {
  if (
    input.justJoined
    || input.focusPrevious
    || input.focusNext
    || input.nearbyPrevious
    || input.nearbyNext
    || input.categoryPrevious
    || input.categoryNext
    || input.confirm
    || input.cancel
    || input.command
    || input.asteroidAction
    || input.pause
    || input.menuBack
  ) {
    unlockMusic();
  }

  if (input.justJoined) {
    syncUi();
    return;
  }

  const focusPreviousTriggered = edgeTrigger(player, "focus-previous", input.focusPrevious);
  const focusNextTriggered = edgeTrigger(player, "focus-next", input.focusNext);
  const nearbyPreviousTriggered = edgeTrigger(player, "nearby-previous", input.nearbyPrevious);
  const nearbyNextTriggered = edgeTrigger(player, "nearby-next", input.nearbyNext);
  const categoryPreviousTriggered = edgeTrigger(player, "category-previous", input.categoryPrevious);
  const categoryNextTriggered = edgeTrigger(player, "category-next", input.categoryNext);
  const confirmTriggered = edgeTrigger(player, "confirm", input.confirm);
  const cancelTriggered = edgeTrigger(player, "cancel", input.cancel);
  const commandTriggered = edgeTrigger(player, "command", input.command);
  const asteroidActionTriggered = edgeTrigger(player, "asteroid-action", input.asteroidAction);
  const pauseTriggered = edgeTrigger(player, "pause", input.pause);
  const menuBackTriggered = edgeTrigger(player, "menu-back", input.menuBack);

  if (state.phase === "boot") {
    if (cancelTriggered || menuBackTriggered) {
      navigateToArcade();
      return;
    }

    if (focusPreviousTriggered || nearbyPreviousTriggered || categoryPreviousTriggered) {
      focusBootMenuControl(-1);
    } else if (focusNextTriggered || nearbyNextTriggered || categoryNextTriggered) {
      focusBootMenuControl(1);
    }

    if (pauseTriggered) {
      startRun();
      return;
    }

    if (confirmTriggered) {
      activateBootMenuControl();
    }

    return;
  }

  if (menuBackTriggered) {
    handleMenuBack(player);
    return;
  }

  if (pauseTriggered) {
    togglePause();
    return;
  }

  if (state.paused) {
    if (cancelTriggered) {
      togglePause();
    }
    return;
  }

  if (localActionMenuOpen(player)) {
    if (focusPreviousTriggered) {
      moveLocalActionFocus(-1, player);
    }

    if (focusNextTriggered) {
      moveLocalActionFocus(1, player);
    }

    if (nearbyPreviousTriggered || categoryPreviousTriggered) {
      moveLocalActionFocus(-LOCAL_ACTION_COLUMNS, player);
    }

    if (nearbyNextTriggered || categoryNextTriggered) {
      moveLocalActionFocus(LOCAL_ACTION_COLUMNS, player);
    }

    if (confirmTriggered) {
      performFocusedLocalAction(player);
    }

    if (cancelTriggered) {
      cancelPlayerCommand(player);
    }

    if (commandTriggered) {
      runPlayerCommand(player);
    }

    return;
  }

  if (categoryPreviousTriggered) {
    selectBodyLane(player, { cycleIfAlreadyThere: true });
  }

  if (categoryNextTriggered) {
    selectStructureLane(player, { cycleIfAlreadyThere: true });
  }

  if (focusPreviousTriggered) {
    changeFocus(-1, player);
  }

  if (focusNextTriggered) {
    changeFocus(1, player);
  }

  if (nearbyPreviousTriggered) {
    cycleSelectedCategory(-1, player);
  }

  if (nearbyNextTriggered) {
    cycleSelectedCategory(1, player);
  }

  if (confirmTriggered) {
    activatePlayerSelection(player);
  }

  if (cancelTriggered) {
    cancelPlayerCommand(player);
  }

  if (commandTriggered) {
    runPlayerCommand(player);
  }

  if (asteroidActionTriggered) {
    queueAsteroidAction(player);
  }
}

function handleGamepadInput() {
  const inputs = pollGamepadInputs();
  for (const player of activePlayers()) {
    if (!Number.isInteger(player.controllerIndex)) {
      continue;
    }

    const input = inputs.get(player.controllerIndex);
    if (input) {
      handlePlayerGamepadInput(player, input);
    }
  }
}

function impactIntentById(intentId) {
  return IMPACT_INTENTS.find((intent) => intent.id === intentId) || IMPACT_INTENTS[0];
}

function applyImpact(impact) {
  const asteroid = findBody(impact.asteroidLabel);
  const target = findBody(impact.targetLabel);
  if (!asteroid || !target) {
    return;
  }

  const baseline = bodyBaselines.get(target.label);
  const intent = impactIntentById(impact.intentId);
  const power = 0.72 + asteroid.radius * 0.08;
  const nextOrbit = target.orbit + intent.orbitDelta * power;
  const orbitMin = Math.max(58, baseline.orbit - 34);
  const orbitMax = baseline.orbit + 34;

  target.orbit = clamp(nextOrbit, orbitMin, orbitMax);
  const orbitShift = target.orbit - baseline.orbit;
  target.speed = clamp(
    baseline.speed - orbitShift * 0.0012,
    Math.max(0.035, baseline.speed * 0.62),
    baseline.speed * 1.38,
  );
  target.spin = clamp(
    target.spin + intent.spinDelta * power,
    Math.max(0.12, baseline.spin - 0.62),
    baseline.spin + 0.82,
  );
  target.tilt = clamp(target.tilt + intent.tiltDelta * power, -0.72, 0.72);
  target.spinPhase += 0.42 * power;

  const stabilityCost = intent.stabilityCost * power * Math.max(0.72, 1 - stabilityProjectLevel() * 0.08);
  state.stabilityAdjustment -= stabilityCost;
  state.stability = Math.max(0, state.stability - stabilityCost);
  const yieldedResources = {};
  for (const [resource, amount] of Object.entries(intent.yield || {})) {
    const yielded = amount * power;
    yieldedResources[resource] = yielded;
    addResource(resource, yielded, { pulse: true });
  }
  state.impactBursts.push({
    targetLabel: target.label,
    intentId: intent.id,
    age: 0,
    duration: 1.15,
  });
  const yieldText = Object.keys(yieldedResources).length > 0 ? ` Salvage ${formatResourceList(yieldedResources)}.` : "";
  state.lastImpactSummary = `${asteroid.label} struck ${target.label}: ${intent.label} adjusted orbit to ${Math.round(target.orbit)}u and spin to ${target.spin.toFixed(2)}.${yieldText}`;
  pulseResourceMetric("stability", -stabilityCost);
  addEventLog("danger", state.lastImpactSummary);
}

function updateStructureEconomy(deltaSeconds) {
  for (const structure of structures) {
    if (!structure.rates) {
      continue;
    }

    const wasOffline = Boolean(structure.offline);
    const previousOfflineReason = structure.offlineReason;
    const shortages = [];
    for (const [resource, rate] of Object.entries(structure.rates)) {
      if (rate >= 0) {
        continue;
      }
      const required = Math.abs(rate) * deltaSeconds;
      if ((state[resource] || 0) < required) {
        shortages.push(formatResourceNeed(resource, required));
      }
    }

    if (shortages.length > 0) {
      structure.offline = true;
      structure.offlineReason = `needs ${shortages.join(", ")}`;
      if (!wasOffline || previousOfflineReason !== structure.offlineReason) {
        addEventLog("warning", `${structure.label} offline: ${structure.offlineReason}.`);
      }
      continue;
    }

    structure.offline = false;
    structure.offlineReason = "";
    if (wasOffline) {
      addEventLog("success", `${structure.label} production restored.`);
    }
    structure.uptime += deltaSeconds;
    for (const [resource, rate] of Object.entries(structure.rates)) {
      addResource(resource, rate * deltaSeconds);
    }
  }
}

function updateHazards() {
  const archetype = currentSystemArchetype();
  const interval = archetype.hazardInterval || 42;
  if (state.elapsed < interval) {
    return;
  }

  const hazardTick = Math.floor(state.elapsed / interval);
  if (hazardTick <= state.lastHazardTick) {
    return;
  }

  state.lastHazardTick = hazardTick;
  const structureLoad = Math.max(0, builtStructureCount() - 2) * 0.28;
  const queuedImpactLoad = state.impactQueue.length * 0.35;
  const stabilityShield = Math.max(0.64, 1 - stabilityProjectLevel() * 0.12);
  const stabilityCost = ((archetype.hazardStabilityCost || 2.5) + structureLoad + queuedImpactLoad) * stabilityShield;
  addResource("stability", -stabilityCost, { pulse: true });
  state.lastImpactSummary = `${archetype.hazardEvent || "System hazard"} cost Stability ${stabilityCost.toFixed(1)}. Retrofit platforms and lighter queues reduce collapse risk.`;
  addEventLog(stabilityCost >= 3 ? "warning" : "info", state.lastImpactSummary);
}

function updateImpactActions(deltaSeconds) {
  for (const body of bodies) {
    body.guidancePulse = Math.max(0, (body.guidancePulse || 0) - deltaSeconds * 1.8);
  }

  for (const structure of structures) {
    structure.commandPulse = Math.max(0, (structure.commandPulse || 0) - deltaSeconds * 1.5);
  }

  for (const impact of state.impactQueue) {
    impact.progress += deltaSeconds / impact.duration;
    if (impact.progress >= 1 && !impact.applied) {
      impact.progress = 1;
      impact.applied = true;
      applyImpact(impact);
    }
  }

  state.impactQueue = state.impactQueue.filter((impact) => !impact.applied);

  for (const burst of state.impactBursts) {
    burst.age += deltaSeconds;
  }
  state.impactBursts = state.impactBursts.filter((burst) => burst.age < burst.duration);

  for (const burst of state.actionBursts) {
    burst.age += deltaSeconds;
  }
  state.actionBursts = state.actionBursts.filter((burst) => burst.age < burst.duration);
}

function stepSimulation(deltaSeconds) {
  state.elapsed += deltaSeconds;
  state.cycle = Math.floor(state.elapsed / CYCLE_SECONDS);
  updateImpactActions(deltaSeconds);
  updateStructureEconomy(deltaSeconds);
  updateHazards();
  const natural = naturalResourceValues();
  state.mass = Math.max(0, natural.mass + state.massAdjustment);
  state.volatiles = Math.max(0, natural.volatiles + state.volatilesAdjustment);
  state.plasma = Math.max(0, natural.plasma + state.plasmaAdjustment);
  state.exotic = Math.max(0, natural.exotic + state.exoticAdjustment);
  state.population = Math.max(0, natural.population + state.populationAdjustment);
  state.crew = Math.max(0, natural.crew + state.crewAdjustment);
  state.fleet = Math.max(0, natural.fleet + state.fleetAdjustment);
  state.stability = clamp(natural.stability + state.stabilityAdjustment, 0, 100);
  if (state.stability <= 0 && !state.collapseLogged) {
    state.collapseLogged = true;
    state.lastImpactSummary = "System collapse: stability reached zero. Reset and avoid stacked hazards, impacts, and solar surges next run.";
    addEventLog("danger", state.lastImpactSummary);
  }
}

function update(deltaSeconds) {
  if (state.phase !== "running" || state.paused) {
    state.accumulator = 0;
    return;
  }

  state.accumulator += deltaSeconds;
  let steps = 0;

  while (state.accumulator >= FIXED_STEP && steps < MAX_FRAME_STEPS) {
    stepSimulation(FIXED_STEP * currentTimeScale());
    state.accumulator -= FIXED_STEP;
    steps += 1;
  }

  if (steps === MAX_FRAME_STEPS) {
    state.accumulator = 0;
  }

  if (steps > 0) {
    syncUi();
  }
}

function drawBackground() {
  const archetype = currentSystemArchetype();
  const gradient = ctx.createRadialGradient(WIDTH * 0.5, HEIGHT * 0.5, 40, WIDTH * 0.5, HEIGHT * 0.5, 520);
  gradient.addColorStop(0, archetype.backgroundCore || "#101616");
  gradient.addColorStop(0.52, "#06080a");
  gradient.addColorStop(1, "#020304");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  for (const star of stars) {
    ctx.globalAlpha = star.alpha;
    ctx.fillStyle = "#f4f7ef";
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, TWO_PI);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawOrbit(cx, cy, radius, scale = ORBIT_SCALE_Y, color = "rgba(155, 218, 226, 0.18)", dashed = false) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  if (dashed) {
    ctx.setLineDash([3, 10]);
  }
  ctx.beginPath();
  ctx.ellipse(cx, cy, radius, radius * scale, 0, 0, TWO_PI);
  ctx.stroke();
  ctx.restore();
}

function bodyAngle(body, time) {
  return body.phase + time * body.speed;
}

function bodySpinAngle(body, time) {
  return (body.spinPhase || 0) + time * body.spin;
}

function resolveBodyPositions(cx, cy, time) {
  const positions = new Map();
  const center = { x: cx, y: cy };

  for (const body of bodies) {
    const parent = body.parent ? positions.get(body.parent) || center : center;
    const angle = bodyAngle(body, time);
    const scale = body.orbitScale || (body.parent ? MOON_ORBIT_SCALE_Y : ORBIT_SCALE_Y);
    positions.set(body.label, {
      x: parent.x + Math.cos(angle) * body.orbit,
      y: parent.y + Math.sin(angle) * body.orbit * scale,
    });
  }

  return positions;
}

function resolveStructurePositions(cx, cy, time) {
  const positions = new Map();
  for (const structure of structures) {
    const angle = structure.phase + time * structure.speed;
    positions.set(structure.label, {
      x: cx + Math.cos(angle) * structure.orbit,
      y: cy + Math.sin(angle) * structure.orbit * structure.orbitScale,
      angle,
    });
  }
  return positions;
}

function drawSpinMarker(x, y, body, time) {
  const markerLength = body.radius * 0.85;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(bodySpinAngle(body, time) + body.tilt);
  ctx.strokeStyle = body.accent;
  ctx.lineWidth = body.type === "asteroid" ? 1 : 2;
  ctx.beginPath();
  ctx.moveTo(-markerLength, 0);
  ctx.lineTo(markerLength, 0);
  ctx.stroke();
  ctx.restore();
}

function drawBodyRing(position, radius, color, lineWidth = 2, dash = []) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.arc(position.x, position.y, radius, 0, TWO_PI);
  ctx.stroke();
  ctx.restore();
}

function drawBody(body, positions, time) {
  const position = positions.get(body.label);
  if (!position) {
    return;
  }

  const selectedPlayers = playersWithSelection("body", body.label);
  const asteroidDraftPlayers = playersWithDraftedAsteroid(body.label);
  const targetDraftPlayers = playersWithDraftedTarget(body.label);
  const selected = selectedPlayers.length > 0;
  const draftedAsteroid = asteroidDraftPlayers.length > 0;
  const draftedTarget = targetDraftPlayers.length > 0;
  const guided = body.guidancePulse || 0;

  if (body.type === "black-hole") {
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.rotate(time * 0.28 + body.phase);
    const gravityGlow = ctx.createRadialGradient(0, 0, 4, 0, 0, body.radius + 28);
    gravityGlow.addColorStop(0, "#010102");
    gravityGlow.addColorStop(0.46, "rgba(5, 4, 7, 0.96)");
    gravityGlow.addColorStop(1, "rgba(215, 198, 255, 0)");
    ctx.fillStyle = gravityGlow;
    ctx.beginPath();
    ctx.arc(0, 0, body.radius + 28, 0, TWO_PI);
    ctx.fill();
    ctx.strokeStyle = "rgba(215, 198, 255, 0.72)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, body.radius + 16, (body.radius + 16) * 0.36, 0, 0, TWO_PI);
    ctx.stroke();
    ctx.fillStyle = "#020204";
    ctx.beginPath();
    ctx.arc(0, 0, body.radius, 0, TWO_PI);
    ctx.fill();
    ctx.restore();

    selectedPlayers.forEach((player, index) => {
      drawBodyRing(position, body.radius + 23 + index * 5, player.color, 2.5);
    });

    ctx.fillStyle = "rgba(244, 247, 239, 0.82)";
    ctx.font = "600 10px Avenir Next, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(body.label, position.x, position.y + body.radius + 25);
    return;
  }

  if (guided > 0) {
    drawBodyRing(position, body.radius + 13 + guided * 9, `rgba(241, 190, 99, ${0.22 + guided * 0.22})`, 2);
  }

  ctx.fillStyle = body.color;
  ctx.beginPath();
  ctx.arc(position.x, position.y, body.radius, 0, TWO_PI);
  ctx.fill();

  drawSpinMarker(position.x, position.y, body, time);

  if (draftedAsteroid) {
    drawBodyRing(position, body.radius + 8, asteroidDraftPlayers[0]?.color || "rgba(241, 190, 99, 0.74)", 2, [3, 5]);
  }

  if (draftedTarget) {
    drawBodyRing(position, body.radius + 11, targetDraftPlayers[0]?.color || "rgba(140, 229, 240, 0.72)", 2);
  }

  selectedPlayers.forEach((player, index) => {
    drawBodyRing(position, body.radius + 16 + index * 5, player.color, 2.5);
  });

  if (body.type !== "asteroid" || selected || draftedAsteroid) {
    ctx.fillStyle = "rgba(244, 247, 239, 0.82)";
    ctx.font = "600 10px Avenir Next, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(body.label, position.x, position.y + body.radius + 16);
  }
}

function drawStructure(structure, positions) {
  const position = positions.get(structure.label);
  if (!position) {
    return;
  }

  const selectedPlayers = playersWithSelection("structure", structure.label);
  const selected = selectedPlayers.length > 0;
  const deckPlayers = selectedPlayers.filter((player) => localActionMenuOpen(player));
  const pulse = structure.commandPulse || 0;
  const pulseStyle = burstStyleForTone(structure.commandTone);
  const strokeColor = structure.offline ? "#ff7d6e" : structure.color;

  if (pulse > 0) {
    ctx.save();
    ctx.strokeStyle = rgba(pulseStyle.halo, 0.18 + pulse * 0.28);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(position.x, position.y, 22 + pulse * 16, 0, TWO_PI);
    ctx.stroke();
    ctx.strokeStyle = rgba(pulseStyle.accent, 0.12 + pulse * 0.22);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(position.x, position.y, 13 + pulse * 9, 0, TWO_PI);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.translate(position.x, position.y);
  ctx.rotate(position.angle + Math.PI / 4);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = structure.offline ? 1.5 : 2;
  ctx.strokeRect(-7, -7, 14, 14);
  ctx.beginPath();
  ctx.moveTo(-13, 0);
  ctx.lineTo(-7, 0);
  ctx.moveTo(7, 0);
  ctx.lineTo(13, 0);
  ctx.moveTo(0, -13);
  ctx.lineTo(0, -7);
  ctx.moveTo(0, 7);
  ctx.lineTo(0, 13);
  ctx.stroke();
  ctx.restore();

  if (structure.offline) {
    drawBodyRing(position, 18, "rgba(255, 125, 110, 0.46)", 1.5, [4, 5]);
  }

  if (selected) {
    selectedPlayers.forEach((player, index) => {
      const inset = 18 + index * 4;
      ctx.save();
      ctx.strokeStyle = player.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(position.x - inset, position.y - inset, inset * 2, inset * 2);
      ctx.restore();
    });

    ctx.fillStyle = "rgba(244, 247, 239, 0.82)";
    ctx.font = "600 10px Avenir Next, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(structure.label, position.x, position.y + 31);
  }

  if (deckPlayers.length > 0) {
    drawBodyRing(
      position,
      24 + Math.sin(state.elapsed * 5.6) * 2.5,
      rgba(burstStyleForTone("project").halo, 0.5),
      2.2,
      [4, 5],
    );
  }
}

function easedProgress(progress) {
  return 1 - Math.pow(1 - clamp(progress, 0, 1), 3);
}

function drawImpactPaths(positions) {
  for (const impact of state.impactQueue) {
    const target = positions.get(impact.targetLabel);
    if (!target) {
      continue;
    }

    const progress = easedProgress(impact.progress);
    const arcLift = Math.sin(progress * Math.PI) * 38;
    const x = impact.startX + (target.x - impact.startX) * progress;
    const y = impact.startY + (target.y - impact.startY) * progress - arcLift;

    ctx.save();
    ctx.strokeStyle = "rgba(241, 190, 99, 0.36)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 7]);
    ctx.beginPath();
    ctx.moveTo(impact.startX, impact.startY);
    ctx.quadraticCurveTo((impact.startX + target.x) * 0.5, (impact.startY + target.y) * 0.5 - 76, target.x, target.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#f1be63";
    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, TWO_PI);
    ctx.fill();
    ctx.strokeStyle = "rgba(244, 247, 239, 0.64)";
    ctx.beginPath();
    ctx.arc(target.x, target.y, 14 + Math.sin(state.elapsed * 7) * 2, 0, TWO_PI);
    ctx.stroke();
    ctx.restore();
  }
}

function drawImpactBursts(positions) {
  for (const burst of state.impactBursts) {
    const target = positions.get(burst.targetLabel);
    if (!target) {
      continue;
    }

    const progress = burst.age / burst.duration;
    ctx.save();
    ctx.strokeStyle = `rgba(140, 229, 240, ${Math.max(0, 0.68 - progress * 0.68)})`;
    ctx.lineWidth = 3 - progress;
    ctx.beginPath();
    ctx.arc(target.x, target.y, 18 + progress * 34, 0, TWO_PI);
    ctx.stroke();
    ctx.restore();
  }
}

function resolveActionBurstPosition(burst, positions, cx, cy, time) {
  const livePosition = burst.label ? positions.get(burst.label) : null;
  if (livePosition) {
    return livePosition;
  }
  const angle = (burst.phase || 0) + time * (burst.speed || 0);
  return {
    x: cx + Math.cos(angle) * (burst.orbit || 0),
    y: cy + Math.sin(angle) * (burst.orbit || 0) * (burst.orbitScale || ORBIT_SCALE_Y),
  };
}

function drawActionBursts(positions, cx, cy, time) {
  for (const burst of state.actionBursts) {
    const position = resolveActionBurstPosition(burst, positions, cx, cy, time);
    const progress = clamp(burst.age / burst.duration, 0, 1);
    const style = burstStyleForTone(burst.tone);
    const scale = burst.scale || 1;
    const outerRadius = (22 + progress * 56) * scale;
    const innerRadius = (12 + progress * 18) * scale;
    const fade = 1 - progress;

    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.rotate(progress * Math.PI * (burst.tone === "upgrade" ? 1.8 : 1.1));
    ctx.strokeStyle = rgba(style.halo, 0.62 * fade);
    ctx.lineWidth = 3.4 - progress * 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, outerRadius, 0, TWO_PI);
    ctx.stroke();
    ctx.setLineDash([6, 8]);
    ctx.strokeStyle = rgba(style.accent, 0.48 * fade);
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, innerRadius, 0, TWO_PI);
    ctx.stroke();
    ctx.setLineDash([]);
    const rayCount = burst.tone === "upgrade" ? 6 : burst.tone === "salvage" ? 5 : 4;
    for (let ray = 0; ray < rayCount; ray += 1) {
      const angle = (ray / rayCount) * TWO_PI;
      const inner = 14 * scale;
      const outer = (22 + progress * 26) * scale;
      ctx.strokeStyle = rgba(style.accent, 0.34 * fade);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
      ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function compactReadoutText(text, maxLength = 43) {
  return text.length > maxLength ? text.slice(0, maxLength - 3) + "..." : text;
}

function drawSelectionReadout(cx, cy, bodyPositions, structurePositions, player = primaryPlayer()) {
  player = ensurePlayerSelection(player);
  const selected = selectedObject(player);
  let position;
  let parent = { x: cx, y: cy };
  let title;
  let populationText;

  if (selected.kind === "body") {
    const body = selected.item;
    position = bodyPositions.get(body.label);
    parent = body.parent ? bodyPositions.get(body.parent) || parent : parent;
    title = `${player.label} ${body.label} ${body.type}`;
    populationText = `Population ${formatPopulation(populationForBody(body))}`;
  } else {
    const structure = selected.item;
    position = structurePositions.get(structure.label);
    title = `${player.label} ${structure.label} ${localActionMenuOpen(player) ? "control deck" : "structure"}`;
    populationText = `Population ${formatPopulation(populationForStructure(structure))}`;
  }

  if (!position) {
    return;
  }

  ctx.strokeStyle = "rgba(244, 247, 239, 0.36)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(parent.x, parent.y);
  ctx.lineTo(position.x, position.y);
  ctx.stroke();

  const tagWidth = 176;
  const tagHeight = 42;
  const tagX = clamp(position.x + 18, 16, WIDTH - tagWidth - 16);
  const tagY = clamp(position.y - 28, 18, HEIGHT - tagHeight - 10);
  ctx.fillStyle = "rgba(3, 4, 6, 0.58)";
  ctx.fillRect(tagX, tagY, tagWidth, tagHeight);
  ctx.strokeStyle = "rgba(155, 218, 226, 0.32)";
  ctx.strokeRect(tagX, tagY, tagWidth, tagHeight);
  ctx.fillStyle = "#f4f7ef";
  ctx.font = "800 11px Avenir Next, Segoe UI, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(compactReadoutText(title, 24), tagX + 8, tagY + 17);
  ctx.fillStyle = "#8ce5f0";
  ctx.font = "700 10px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText(compactReadoutText(populationText, 26), tagX + 8, tagY + 32);
}

function pointerToLogicalPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * WIDTH,
    y: ((event.clientY - rect.top) / rect.height) * HEIGHT,
  };
}

function hitTestSelectable(x, y, time) {
  const center = systemCenter();
  const bodyPositions = resolveBodyPositions(center.x, center.y, time);
  const structurePositions = resolveStructurePositions(center.x, center.y, time);
  const hits = [];

  for (const body of bodies) {
    const position = bodyPositions.get(body.label);
    if (!position) {
      continue;
    }
    const distance = Math.hypot(x - position.x, y - position.y);
    const radius = Math.max(16, body.radius + 12);
    if (distance <= radius) {
      hits.push({ kind: "body", label: body.label, distance });
    }
  }

  for (const structure of structures) {
    const position = structurePositions.get(structure.label);
    if (!position) {
      continue;
    }
    const distance = Math.hypot(x - position.x, y - position.y);
    if (distance <= 22) {
      hits.push({ kind: "structure", label: structure.label, distance });
    }
  }

  hits.sort((a, b) => a.distance - b.distance);
  return hits[0] || null;
}

function viewportPointToWorld(point) {
  const players = activePlayers();
  if (players.length <= 1) {
    return { player: primaryPlayer(), x: point.x, y: point.y };
  }

  const viewport = viewportLayout(players).find((candidate) => (
    point.x >= candidate.x
      && point.x <= candidate.x + candidate.width
      && point.y >= candidate.y
      && point.y <= candidate.y + candidate.height
  ));
  if (!viewport) {
    return null;
  }

  const camera = viewportCameraForPlayer(viewport, viewport.player);
  return {
    player: viewport.player,
    x: (point.x - camera.x) / camera.zoom,
    y: (point.y - camera.y) / camera.zoom,
  };
}

function handleCanvasPointerDown(event) {
  if (event.button !== 0) {
    return;
  }
  unlockMusic();

  const point = viewportPointToWorld(pointerToLogicalPoint(event));
  if (!point) {
    return;
  }

  const hit = hitTestSelectable(point.x, point.y, state.elapsed);
  if (hit) {
    selectObject(hit.kind, hit.label, { player: point.player });
  }
}

function drawPlayerCursor(player, bodyPositions, structurePositions) {
  if (state.phase !== "running") {
    return;
  }

  const selected = selectedObject(player);
  const position = selected.kind === "structure"
    ? structurePositions.get(selected.item.label)
    : bodyPositions.get(selected.item.label);
  if (!position) {
    return;
  }

  const radius = selected.kind === "body" ? selected.item.radius + 24 : localActionMenuOpen(player) ? 34 : 26;
  ctx.save();
  ctx.strokeStyle = player.color;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(position.x - radius, position.y);
  ctx.lineTo(position.x - radius + 10, position.y);
  ctx.moveTo(position.x + radius - 10, position.y);
  ctx.lineTo(position.x + radius, position.y);
  ctx.moveTo(position.x, position.y - radius);
  ctx.lineTo(position.x, position.y - radius + 10);
  ctx.moveTo(position.x, position.y + radius - 10);
  ctx.lineTo(position.x, position.y + radius);
  ctx.stroke();
  ctx.fillStyle = player.color;
  ctx.font = "800 10px Avenir Next, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(player.label, position.x, position.y - radius - 6);
  ctx.restore();
}

function drawWorldScene(readoutPlayer = primaryPlayer(), { showReadout = true } = {}) {
  const cx = WIDTH * 0.5;
  const cy = HEIGHT * 0.53;
  const time = state.elapsed;
  const positions = resolveBodyPositions(cx, cy, time);
  const structurePositions = resolveStructurePositions(cx, cy, time);

  drawBackground();

  for (const body of bodies) {
    const parent = body.parent ? positions.get(body.parent) || { x: cx, y: cy } : { x: cx, y: cy };
    drawOrbit(parent.x, parent.y, body.orbit, body.orbitScale, body.orbitColor, body.type === "asteroid");
  }

  for (const structure of structures) {
    drawOrbit(cx, cy, structure.orbit, structure.orbitScale, structure.color + "66");
  }

  drawImpactPaths(positions);

  const archetype = currentSystemArchetype();
  const sunGlow = ctx.createRadialGradient(cx, cy, 8, cx, cy, 74);
  sunGlow.addColorStop(0, archetype.starCore || "#fff7c7");
  sunGlow.addColorStop(0.35, archetype.starMid || "#f1be63");
  sunGlow.addColorStop(1, archetype.starGlow || "rgba(241, 190, 99, 0)");
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, 74, 0, TWO_PI);
  ctx.fill();

  ctx.fillStyle = archetype.starMid || "#f2c15e";
  ctx.beginPath();
  ctx.arc(cx, cy, 24 + Math.sin(time * 1.8) * 1.6, 0, TWO_PI);
  ctx.fill();

  for (const body of bodies) {
    if (body.type !== "moon") {
      drawBody(body, positions, time);
    }
  }

  for (const body of bodies) {
    if (body.type === "moon") {
      drawBody(body, positions, time);
    }
  }

  for (const structure of structures) {
    drawStructure(structure, structurePositions);
  }

  drawActionBursts(structurePositions, cx, cy, time);
  drawImpactBursts(positions);

  if (state.phase === "running") {
    if (showReadout) {
      drawSelectionReadout(cx, cy, positions, structurePositions, readoutPlayer);
    }
    drawPlayerCursor(readoutPlayer, positions, structurePositions);
  }
}

function twoPlayerLayoutMode() {
  const renderedWidth = stage.state.stageWidth || stage.state.cssWidth || WIDTH;
  return renderedWidth < TWO_PLAYER_NARROW_STAGE_WIDTH ? "horizontal" : "vertical";
}

function viewportLayout(players) {
  const viewportPlayers = players.slice(0, MAX_PLAYERS);
  const count = viewportPlayers.length;
  const halfWidth = WIDTH / 2;
  const halfHeight = HEIGHT / 2;

  if (count === 0) {
    return [];
  }

  if (count === 1) {
    return [{
      x: 0,
      y: 0,
      width: WIDTH,
      height: HEIGHT,
      player: viewportPlayers[0],
      index: 0,
      count,
      mode: "full",
    }];
  }

  let mode;
  let layouts;
  if (count === 2) {
    const splitMode = twoPlayerLayoutMode();
    mode = `two-${splitMode}`;
    layouts = splitMode === "horizontal"
      ? [
        { x: 0, y: 0, width: WIDTH, height: halfHeight },
        { x: 0, y: halfHeight, width: WIDTH, height: halfHeight },
      ]
      : [
        { x: 0, y: 0, width: halfWidth, height: HEIGHT },
        { x: halfWidth, y: 0, width: halfWidth, height: HEIGHT },
      ];
  } else if (count === 3) {
    mode = "three-panel";
    layouts = [
      { x: 0, y: 0, width: halfWidth, height: halfHeight },
      { x: halfWidth, y: 0, width: halfWidth, height: halfHeight },
      { x: 0, y: halfHeight, width: WIDTH, height: halfHeight },
    ];
  } else {
    mode = "quadrants";
    layouts = [
      { x: 0, y: 0, width: halfWidth, height: halfHeight },
      { x: halfWidth, y: 0, width: halfWidth, height: halfHeight },
      { x: 0, y: halfHeight, width: halfWidth, height: halfHeight },
      { x: halfWidth, y: halfHeight, width: halfWidth, height: halfHeight },
    ];
  }

  return viewportPlayers.map((player, index) => ({ ...layouts[index], player, index, count, mode }));
}

function playerViewportZoom(viewport) {
  if (viewport.count <= 1) {
    return 1;
  }

  const fitZoom = Math.min(viewport.width / WIDTH, viewport.height / HEIGHT) * 1.42;
  const focusZoom = viewport.mode === "two-vertical"
    ? 0.78
    : viewport.mode === "two-horizontal"
      ? 0.7
      : viewport.mode === "three-panel" && viewport.index === 2
        ? 0.72
        : 0.68;
  return clamp(Math.max(fitZoom, focusZoom), 0.62, 1);
}

function playerCameraTarget(player, bodyPositions, structurePositions) {
  const selected = selectedObject(player);
  if (selected.kind === "structure") {
    return structurePositions.get(selected.item.label) || systemCenter();
  }
  return bodyPositions.get(selected.item.label) || systemCenter();
}

function cameraTransformForViewport(viewport, target, zoom) {
  const scaledWidth = WIDTH * zoom;
  const scaledHeight = HEIGHT * zoom;
  const desiredX = viewport.x + viewport.width * 0.5 - target.x * zoom;
  const desiredY = viewport.y + viewport.height * 0.5 - target.y * zoom;
  const x = scaledWidth <= viewport.width
    ? viewport.x + (viewport.width - scaledWidth) * 0.5
    : clamp(desiredX, viewport.x + viewport.width - scaledWidth, viewport.x);
  const y = scaledHeight <= viewport.height
    ? viewport.y + (viewport.height - scaledHeight) * 0.5
    : clamp(desiredY, viewport.y + viewport.height - scaledHeight, viewport.y);
  return { x, y, zoom };
}

function viewportCameraForPlayer(viewport, player, time = state.elapsed) {
  const center = systemCenter();
  const bodyPositions = resolveBodyPositions(center.x, center.y, time);
  const structurePositions = resolveStructurePositions(center.x, center.y, time);
  const target = playerCameraTarget(player, bodyPositions, structurePositions);
  const zoom = playerViewportZoom(viewport);
  return cameraTransformForViewport(viewport, target, zoom);
}

function drawViewportFrame(viewport, player) {
  const selected = selectedObject(player);
  const selectedType = selected.kind === "body" ? selected.item.type : "structure";
  const panelWidth = clamp(viewport.width * 0.38, 136, Math.max(136, Math.min(230, viewport.width - 16)));
  const panelHeight = viewport.height < 300 ? 48 : 56;
  const labelLimit = Math.max(12, Math.floor((panelWidth - 18) / 7));
  const panelX = viewport.x + 8;
  const panelY = viewport.y + 8;

  ctx.save();
  ctx.strokeStyle = player.color;
  ctx.lineWidth = 2;
  ctx.strokeRect(viewport.x + 1, viewport.y + 1, viewport.width - 2, viewport.height - 2);

  ctx.fillStyle = "rgba(3, 4, 6, 0.72)";
  ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
  ctx.strokeStyle = player.color;
  ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

  ctx.fillStyle = player.color;
  ctx.font = "800 10px Avenir Next, Segoe UI, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(player.label + " VIEW", panelX + 8, panelY + 15);

  ctx.fillStyle = "#f4f7ef";
  ctx.font = "700 12px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText(compactReadoutText(selected.item.label, labelLimit), panelX + 8, panelY + 31);

  ctx.fillStyle = "rgba(170, 184, 186, 0.92)";
  ctx.font = "700 9px Avenir Next, Segoe UI, sans-serif";
  ctx.fillText(compactReadoutText(selectedType + " / " + currentIntent(player).label, labelLimit + 5), panelX + 8, panelY + 45);
  ctx.restore();
}

function drawViewportStateOverlay(viewport) {
  if (state.phase !== "boot" && !state.paused) {
    return;
  }

  ctx.save();
  ctx.fillStyle = state.phase === "boot" ? "rgba(3, 4, 6, 0.2)" : "rgba(3, 4, 6, 0.34)";
  ctx.fillRect(viewport.x, viewport.y, viewport.width, viewport.height);
  ctx.fillStyle = "rgba(244, 247, 239, 0.88)";
  ctx.font = "800 16px Avenir Next, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(state.phase === "boot" ? "Controller Joined" : "Paused", viewport.x + viewport.width / 2, viewport.y + viewport.height - 48);
  ctx.font = "600 11px Avenir Next, Segoe UI, sans-serif";
  ctx.fillStyle = "rgba(170, 184, 186, 0.92)";
  ctx.fillText(state.phase === "boot" ? "Start begins the Habitat -> Shipyard -> Jump loop." : "Start resumes simulation.", viewport.x + viewport.width / 2, viewport.y + viewport.height - 28);
  ctx.restore();
}

function drawPlayerViewport(viewport) {
  const player = viewport.player;
  const camera = viewportCameraForPlayer(viewport, player);

  ctx.save();
  ctx.beginPath();
  ctx.rect(viewport.x, viewport.y, viewport.width, viewport.height);
  ctx.clip();
  ctx.fillStyle = "#030406";
  ctx.fillRect(viewport.x, viewport.y, viewport.width, viewport.height);
  ctx.translate(camera.x, camera.y);
  ctx.scale(camera.zoom, camera.zoom);
  drawWorldScene(player, { showReadout: false });
  ctx.restore();

  drawViewportStateOverlay(viewport);
  drawViewportFrame(viewport, player);
}

function drawMultiplayerSystem(players) {
  const viewports = viewportLayout(players);
  for (const viewport of viewports) {
    drawPlayerViewport(viewport);
  }
}

function drawSystem() {
  const players = activePlayers().slice(0, MAX_PLAYERS);
  if (players.length > 1) {
    drawMultiplayerSystem(players);
    return;
  }

  drawWorldScene(primaryPlayer());

  if (state.phase === "boot") {
    drawBootScene();
  } else if (state.paused) {
    drawPauseVeil();
  }
}

function drawBootScene() {
  ctx.fillStyle = "rgba(3, 4, 6, 0.28)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "rgba(244, 247, 239, 0.82)";
  ctx.font = "700 22px Avenir Next, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Boot Scene: Starter System Online", WIDTH / 2, HEIGHT - 64);
  ctx.font = "600 15px Avenir Next, Segoe UI, sans-serif";
  ctx.fillStyle = "rgba(170, 184, 186, 0.9)";
  ctx.fillText("Build Habitat, grow people, add Shipyard, then Jump.", WIDTH / 2, HEIGHT - 38);
}

function drawPauseVeil() {
  ctx.fillStyle = "rgba(3, 4, 6, 0.45)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#f4f7ef";
  ctx.font = "800 24px Avenir Next, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Paused", WIDTH / 2, HEIGHT / 2);
}

function frame(now) {
  const deltaSeconds = Math.min(0.12, (now - state.lastTime) / 1000 || 0);
  state.lastTime = now;
  handleGamepadInput();
  syncMusic(deltaSeconds);
  update(deltaSeconds);
  stage.syncContext(ctx);
  drawSystem();
  requestAnimationFrame(frame);
}

ui.startButton.addEventListener("click", startRun);
ui.arcadeLink.addEventListener("click", (event) => {
  event?.preventDefault?.();
  navigateToArcade();
});
ui.arcadeLink.addEventListener("keydown", (event) => {
  if (event.key === " ") {
    event.preventDefault();
    navigateToArcade();
  }
});
ui.pauseButton.addEventListener("click", togglePause);
ui.slowerButton.addEventListener("click", () => changeTimeScale(-1));
ui.fasterButton.addEventListener("click", () => changeTimeScale(1));
ui.restartButton.addEventListener("click", restartRun);
ui.previousSelectionButton.addEventListener("click", () => changeSelection(-1));
ui.nextSelectionButton.addEventListener("click", () => changeSelection(1));
ui.markAsteroidButton.addEventListener("click", markSelectedAsteroid);
ui.markTargetButton.addEventListener("click", markSelectedTarget);
ui.impactIntentButton.addEventListener("click", cycleImpactIntent);
ui.structureCommandButton.addEventListener("click", runSelectedStructureCommand);
ui.queueImpactButton.addEventListener("click", queueImpact);
ui.chartSystemButton.addEventListener("click", discoverSystem);
ui.jumpSystemButton.addEventListener("click", travelToDiscoveredSystem);
ui.operationsDrawer?.addEventListener("toggle", () => {
  playfieldStage.classList.toggle("is-orders-open", Boolean(ui.operationsDrawer.open));
});
canvas.addEventListener("pointerdown", handleCanvasPointerDown);
window.addEventListener("gamepadconnected", handleGamepadConnected);
window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);
window.addEventListener("pointerdown", () => {
  unlockMusic();
});
window.addEventListener("pagehide", () => {
  saveCampaign();
});
window.addEventListener("beforeunload", () => {
  saveCampaign();
});
window.addEventListener("keydown", (event) => {
  if (event.defaultPrevented) {
    return;
  }
  unlockMusic();
  if (event.key === "Enter" || event.key === " ") {
    if (state.phase === "boot" && focusedCommandShouldHandleKey(event)) {
      return;
    }
    if (state.phase === "boot") {
      event.preventDefault();
      startRun();
    }
    return;
  }
  if (event.key === "p" || event.key === "P") {
    event.preventDefault();
    togglePause();
    return;
  }
  if (event.key === "[" || event.key === "{") {
    event.preventDefault();
    changeFocus(-1);
    return;
  }
  if (event.key === "]" || event.key === "}") {
    event.preventDefault();
    changeFocus(1);
    return;
  }
  if (event.key === "a" || event.key === "A") {
    event.preventDefault();
    markSelectedAsteroid();
    return;
  }
  if (event.key === "t" || event.key === "T") {
    event.preventDefault();
    markSelectedTarget();
    return;
  }
  if (event.key === "m" || event.key === "M") {
    event.preventDefault();
    cycleImpactIntent();
    return;
  }
  if (event.key === "q" || event.key === "Q") {
    event.preventDefault();
    queueImpact();
    return;
  }
  if (event.key === "c" || event.key === "C") {
    event.preventDefault();
    discoverSystem();
    return;
  }
  if (event.key === "j" || event.key === "J") {
    event.preventDefault();
    travelToDiscoveredSystem();
    return;
  }
  if (event.key === "-" || event.key === "_") {
    event.preventDefault();
    changeTimeScale(-1);
    return;
  }
  if (event.key === "=" || event.key === "+") {
    event.preventDefault();
    changeTimeScale(1);
  }
});

window.__arcadeCabinetHooks = {
  getPauseActions() {
    return [
      {
        id: "resume-simulation",
        label: state.paused ? "Resume Simulation" : "Pause Simulation",
        run: togglePause,
      },
      {
        id: "restart-system",
        label: "Reset System",
        run: restartRun,
      },
    ];
  },
  onPauseOpen() {
    if (state.phase === "running") {
      state.paused = true;
      state.accumulator = 0;
      syncUi();
    }
  },
  onPauseClose() {
    if (state.phase === "running") {
      state.paused = false;
      state.lastTime = performance.now();
      syncUi();
    }
  },
};

window.__simPlanet = {
  getState() {
    const player = primaryPlayer();
    return {
      phase: state.phase,
      paused: state.paused,
      elapsed: state.elapsed,
      timeScale: currentTimeScale(),
      focus: focusedBody(player).label,
      selection: {
        kind: player.selectedKind,
        label: player.selectedLabel,
      },
      players: state.players.map((slot) => ({
        id: slot.id,
        label: slot.label,
        active: slot.active,
        controllerIndex: slot.controllerIndex,
        color: slot.color,
        focus: focusedBody(slot)?.label || slot.focusTargetLabel,
        localMenuOpen: localActionMenuOpen(slot),
        localActionIndex: slot.localActionIndex,
        selection: {
          kind: slot.selectedKind,
          label: slot.selectedLabel,
        },
        commandIntent: slot.commandIntent,
        impactDraft: {
          asteroid: slot.impactAsteroidLabel,
          target: slot.impactTargetLabel,
          intent: currentIntent(slot).id,
        },
      })),
      resources: {
        mass: state.mass,
        volatiles: state.volatiles,
        plasma: state.plasma,
        exotic: state.exotic,
        population: state.population,
        crew: state.crew,
        fleet: state.fleet,
        stability: state.stability,
      },
      progression: {
        systemName: state.systemName,
        archetype: currentSystemArchetype().id,
        jumps: state.jumps,
        totalCycles: state.totalCycles + state.cycle,
        visitedSystems: [...state.visitedSystems],
        discoveredSystem: state.discoveredSystem ? { ...state.discoveredSystem } : null,
        canDiscover: canDiscoverSystem(),
        canTravel: canTravel(),
        discoveryCost: discoveryCost(),
        discoveryMissing: missingDiscoveryRequirements(),
        travelMissing: missingTravelRequirements(),
      },
      input: {
        gamepadSupported: gamepadApiSupported(),
        connectedGamepads: [...connectedGamepads.values()].map((pad) => ({ ...pad })),
        bootMenuFocusIndex: state.bootMenuFocusIndex,
      },
      audio: {
        supported: state.music.audioSupported,
        unlocked: state.music.unlocked,
        blocked: state.music.blocked,
        playlistIndex: state.music.playlistIndex,
        currentKey: state.music.currentKey,
        currentTitle: state.music.currentKey ? MUSIC_TRACKS[state.music.currentKey]?.title || "" : "",
        pendingKey: state.music.pendingKey,
        pendingTitle: state.music.pendingKey ? MUSIC_TRACKS[state.music.pendingKey]?.title || "" : "",
        playlist: MUSIC_PLAYLIST.map((key) => ({
          key,
          title: MUSIC_TRACKS[key]?.title || "",
          volume: musicTargetVolume(key),
        })),
      },
      viewports: viewportLayout(activePlayers()).map((viewport) => {
        const camera = viewportCameraForPlayer(viewport, viewport.player);
        const selected = selectedObject(viewport.player);
        return {
          playerId: viewport.player.id,
          label: viewport.player.label,
          mode: viewport.mode,
          x: viewport.x,
          y: viewport.y,
          width: viewport.width,
          height: viewport.height,
          selection: selected.item.label,
          camera: {
            x: Number(camera.x.toFixed(2)),
            y: Number(camera.y.toFixed(2)),
            zoom: Number(camera.zoom.toFixed(2)),
          },
        };
      }),
      hud: {
        compact: true,
        ordersOpen: Boolean(ui.operationsDrawer?.open),
        ordersSummary: ordersSummaryText(),
        recommendedBlueprintId: recommendedBlueprintId(),
        recommendedProjectId: recommendedProjectId(),
        guidanceHint: guidanceHintText(),
        objective: objectiveState(),
        goals: suggestedGoalCards(),
        localRules: orderedLocalRules(selectedObject(primaryPlayer())).map((rule) => ({ ...rule })),
        warnings: computeWarnings(),
        events: state.events.map((event) => ({ ...event })),
        visibleEvents: state.events.slice(0, EVENT_LOG_VISIBLE_LIMIT).map((event) => ({
          ...event,
          message: compactEventMessage(event),
        })),
        outcome: state.outcomeReport ? { ...state.outcomeReport } : null,
      },
      focus: {
        selection: selectedObject(player),
        learnText: selectionLearnText(player, selectedObject(player)),
        menuOpen: localActionMenuOpen(player),
        actionIndex: normalizeLocalActionIndex(player, contextActionDescriptors(player)),
        actionColumns: LOCAL_ACTION_COLUMNS,
        actions: contextActionDescriptors(player).map((action, index) => ({
          id: action.id,
          label: action.label,
          tag: action.tag,
          detail: action.detail,
          reason: action.reason,
          disabled: action.disabled,
          focused: localActionMenuOpen(player) && normalizeLocalActionIndex(player, contextActionDescriptors(player)) === index,
        })),
        art: focusArtForSelection(selectedObject(player)),
      },
      impactDraft: {
        asteroid: player.impactAsteroidLabel,
        target: player.impactTargetLabel,
        intent: currentIntent(player).id,
      },
      impactQueue: state.impactQueue.map((impact) => ({
        ownerPlayerId: impact.ownerPlayerId || 1,
        asteroid: impact.asteroidLabel,
        target: impact.targetLabel,
        intent: impact.intentId,
        progress: impact.progress,
      })),
      bodies: bodies.map((body) => ({
        label: body.label,
        type: body.type,
        parent: body.parent || "star",
        orbit: body.orbit,
        orbitRate: body.speed,
        spinRate: body.spin,
        tilt: body.tilt,
        population: populationForBody(body),
      })),
      structures: structures.map((structure) => ({
        label: structure.label,
        blueprintId: structure.blueprintId || "starter",
        starterId: structure.starterId || "",
        level: structureLevel(structure),
        anchorLabel: structure.anchorLabel || "",
        orbit: structure.orbit,
        orbitRate: structure.speed,
        rates: structure.rates || {},
        offline: Boolean(structure.offline),
        offlineReason: structure.offlineReason || "",
        population: populationForStructure(structure),
      })),
      blueprints: STRUCTURE_BLUEPRINTS.map((blueprint) => ({
        id: blueprint.id,
        label: blueprint.label,
        cost: blueprintCost(blueprint),
        rates: scaledStructureRates(blueprint),
        missingRequirements: missingBlueprintRequirements(blueprint),
        canBuild: canBuildBlueprint(blueprint),
      })),
      projects: PROJECT_BLUEPRINTS.map((project) => ({
        id: project.id,
        label: project.label,
        track: projectTrackLabel(project),
        level: projectLevel(project.id),
        maxLevel: project.maxLevel,
        cost: scaledProjectCost(project),
        effect: projectEffectText(project, Math.min(project.maxLevel, projectLevel(project.id) + 1)),
        missingRequirements: missingProjectRequirements(project),
        canFund: canFundProject(project),
      })),
    };
  },
  start: startRun,
  togglePause,
  reset: restartRun,
  changeTimeScale,
  changeFocus,
  selectObject,
  markSelectedAsteroid,
  markSelectedTarget,
  cycleImpactIntent,
  queueImpact,
  buildStructure,
  buildSelectedLocalStructure,
  upgradeStructure,
  disassembleStructure,
  fundProject,
  discoverSystem,
  travelToDiscoveredSystem,
  save: () => saveCampaign({ force: state.phase === "running" }),
};

setupBuildControls();
setupProjectControls();
if (!restoreSavedCampaign()) {
  resetState("boot");
}
requestAnimationFrame(frame);
