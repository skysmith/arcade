import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const BUILD_NUMBER = "2026.04.28.1";
const LY_SCALE = 6;
const J2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
const DAY_MS = 86_400_000;
const MAX_DPR = 2;
const SOLAR_RING_LY = 5;
const SELECTION_COLOR = "#f3bf68";
const DIMMED_OPACITY = 0.16;

const ui = {
  canvas: document.getElementById("star-scene"),
  scenePanel: document.querySelector(".scene-panel"),
  labelLayer: document.getElementById("label-layer"),
  rangeValue: document.getElementById("range-value"),
  visibleValue: document.getElementById("visible-value"),
  epochValue: document.getElementById("epoch-value"),
  ringValue: document.getElementById("ring-value"),
  detailName: document.getElementById("detail-name"),
  detailType: document.getElementById("detail-type"),
  detailDistance: document.getElementById("detail-distance"),
  detailSpectrum: document.getElementById("detail-spectrum"),
  detailMag: document.getElementById("detail-mag"),
  detailNote: document.getElementById("detail-note"),
  centerSelection: document.getElementById("center-selection"),
  resetView: document.getElementById("reset-view"),
  nearbyList: document.getElementById("nearby-list"),
  nearestCount: document.getElementById("nearest-count"),
  distanceFilter: document.getElementById("distance-filter"),
  objectSearch: document.getElementById("object-search"),
  objectOptions: document.getElementById("object-options"),
  toggleLabels: document.getElementById("toggle-labels"),
  toggleOrbits: document.getElementById("toggle-orbits"),
  toggleRoutes: document.getElementById("toggle-routes"),
  timeSpeed: document.getElementById("time-speed"),
  pauseTime: document.getElementById("pause-time"),
  presetButtons: [...document.querySelectorAll("[data-preset]")],
};

document.title = `Solar Neighborhood Star Chart build ${BUILD_NUMBER}`;

const STAR_DATA = [
  {
    id: "sol",
    name: "Sol",
    kind: "Main-sequence star",
    distance: 0,
    ra: 0,
    dec: 0,
    spectral: "G2V",
    mag: -26.74,
    note: "The chart origin. Eight planets are drawn in order around the Sun with expanded orbits for readability.",
  },
  {
    id: "proxima-centauri",
    name: "Proxima Centauri",
    kind: "Red dwarf",
    distance: 4.2465,
    ra: hms(14, 29, 42.9),
    dec: dms(-62, 40, 46),
    spectral: "M5.5V",
    mag: 11.13,
    note: "Nearest known star to the Sun and part of the Alpha Centauri system.",
  },
  {
    id: "alpha-centauri-a",
    name: "Alpha Centauri A",
    kind: "Sun-like star",
    distance: 4.367,
    ra: hms(14, 39, 36.5),
    dec: dms(-60, 50, 2),
    spectral: "G2V",
    mag: -0.01,
    offset: [0.09, 0.02, 0],
    note: "The brighter member of the Alpha Centauri AB binary, close to the Sun in color and mass.",
  },
  {
    id: "alpha-centauri-b",
    name: "Alpha Centauri B",
    kind: "Orange dwarf",
    distance: 4.367,
    ra: hms(14, 39, 35.1),
    dec: dms(-60, 50, 14),
    spectral: "K1V",
    mag: 1.33,
    offset: [-0.09, -0.02, 0],
    note: "The cooler Alpha Centauri companion. The pair is separated visually here more than in reality.",
  },
  {
    id: "barnards-star",
    name: "Barnard's Star",
    kind: "Red dwarf",
    distance: 5.963,
    ra: hms(17, 57, 48.5),
    dec: dms(4, 41, 36),
    spectral: "M4V",
    mag: 9.54,
    note: "A high-proper-motion red dwarf in Ophiuchus, one of the closest individual stars.",
  },
  {
    id: "luhman-16",
    name: "Luhman 16",
    kind: "Brown dwarf binary",
    distance: 6.50,
    ra: hms(10, 49, 18.7),
    dec: dms(-53, 19, 10),
    spectral: "L7.5 + T0.5",
    mag: 10.7,
    note: "A nearby brown-dwarf pair; dim in visible light despite being close.",
  },
  {
    id: "wise-0855",
    name: "WISE 0855-0714",
    kind: "Sub-brown dwarf",
    distance: 7.43,
    ra: hms(8, 55, 10.8),
    dec: dms(-7, 14, 42),
    spectral: "Y4",
    mag: 27,
    note: "One of the coldest known neighbors, visible mainly in infrared surveys.",
  },
  {
    id: "wolf-359",
    name: "Wolf 359",
    kind: "Red dwarf",
    distance: 7.86,
    ra: hms(10, 56, 28.9),
    dec: dms(7, 0, 53),
    spectral: "M6V",
    mag: 13.5,
    note: "A faint flare star in Leo, much too dim to see without a telescope.",
  },
  {
    id: "lalande-21185",
    name: "Lalande 21185",
    kind: "Red dwarf",
    distance: 8.31,
    ra: hms(11, 3, 20.2),
    dec: dms(35, 58, 12),
    spectral: "M2V",
    mag: 7.49,
    note: "One of the nearest red dwarfs in the northern sky.",
  },
  {
    id: "sirius-a",
    name: "Sirius A",
    kind: "White main-sequence star",
    distance: 8.60,
    ra: hms(6, 45, 8.9),
    dec: dms(-16, 42, 58),
    spectral: "A1V",
    mag: -1.46,
    note: "The brightest star in Earth's night sky. Its white-dwarf companion is separated for picking.",
  },
  {
    id: "sirius-b",
    name: "Sirius B",
    kind: "White dwarf",
    distance: 8.60,
    ra: hms(6, 45, 8.9),
    dec: dms(-16, 42, 58),
    spectral: "DA2",
    mag: 8.44,
    offset: [0.12, 0.02, -0.08],
    note: "A dense white dwarf companion to Sirius A.",
  },
  {
    id: "luyten-726-8",
    name: "Luyten 726-8",
    kind: "Red dwarf binary",
    distance: 8.73,
    ra: hms(1, 39, 1.3),
    dec: dms(-17, 57, 1),
    spectral: "M5.5V + M6V",
    mag: 12.5,
    note: "A nearby flare-star binary also known as UV Ceti.",
  },
  {
    id: "ross-154",
    name: "Ross 154",
    kind: "Red dwarf",
    distance: 9.69,
    ra: hms(18, 49, 49.4),
    dec: dms(-23, 50, 10),
    spectral: "M3.5V",
    mag: 10.44,
    note: "A faint Sagittarius red dwarf with flare activity.",
  },
  {
    id: "ross-248",
    name: "Ross 248",
    kind: "Red dwarf",
    distance: 10.30,
    ra: hms(23, 41, 55.0),
    dec: dms(44, 10, 38),
    spectral: "M6V",
    mag: 12.3,
    note: "A small Andromeda red dwarf; its proper motion will bring it closer in the far future.",
  },
  {
    id: "epsilon-eridani",
    name: "Epsilon Eridani",
    kind: "Orange dwarf",
    distance: 10.47,
    ra: hms(3, 32, 55.8),
    dec: dms(-9, 27, 29),
    spectral: "K2V",
    mag: 3.73,
    note: "A young nearby K star with debris disks and confirmed planetary material.",
  },
  {
    id: "lacaille-9352",
    name: "Lacaille 9352",
    kind: "Red dwarf",
    distance: 10.72,
    ra: hms(23, 5, 52.0),
    dec: dms(-35, 51, 11),
    spectral: "M0.5V",
    mag: 7.34,
    note: "A southern red dwarf with very high proper motion.",
  },
  {
    id: "ross-128",
    name: "Ross 128",
    kind: "Red dwarf",
    distance: 11.01,
    ra: hms(11, 47, 44.4),
    dec: dms(0, 48, 16),
    spectral: "M4V",
    mag: 11.13,
    note: "A quiet red dwarf with a known close-in planet candidate neighborhood.",
  },
  {
    id: "ez-aquarii",
    name: "EZ Aquarii",
    kind: "Triple red-dwarf system",
    distance: 11.27,
    ra: hms(22, 38, 33.4),
    dec: dms(-15, 18, 7),
    spectral: "M5V",
    mag: 12.9,
    note: "A compact nearby multiple system of red dwarfs.",
  },
  {
    id: "procyon-a",
    name: "Procyon A",
    kind: "Subgiant / main-sequence star",
    distance: 11.46,
    ra: hms(7, 39, 18.1),
    dec: dms(5, 13, 30),
    spectral: "F5IV-V",
    mag: 0.34,
    note: "One of the nearest bright stars, paired with a white dwarf.",
  },
  {
    id: "61-cygni",
    name: "61 Cygni",
    kind: "K-dwarf binary",
    distance: 11.41,
    ra: hms(21, 6, 53.9),
    dec: dms(38, 44, 58),
    spectral: "K5V + K7V",
    mag: 5.2,
    note: "A nearby binary famous as the first star system with a measured stellar parallax.",
  },
  {
    id: "groombridge-34",
    name: "Groombridge 34",
    kind: "Red dwarf binary",
    distance: 11.62,
    ra: hms(0, 18, 22.9),
    dec: dms(44, 1, 23),
    spectral: "M1V + M3V",
    mag: 8.1,
    note: "A nearby Andromeda binary of small red dwarfs.",
  },
  {
    id: "epsilon-indi",
    name: "Epsilon Indi",
    kind: "Orange dwarf",
    distance: 11.87,
    ra: hms(22, 3, 21.7),
    dec: dms(-56, 47, 10),
    spectral: "K5V",
    mag: 4.69,
    note: "A nearby K star with distant brown-dwarf companions.",
  },
  {
    id: "tau-ceti",
    name: "Tau Ceti",
    kind: "Sun-like star",
    distance: 11.91,
    ra: hms(1, 44, 4.1),
    dec: dms(-15, 56, 15),
    spectral: "G8.5V",
    mag: 3.50,
    note: "A quiet, metal-poor solar analog candidate with a long history in nearby-world searches.",
  },
  {
    id: "yz-ceti",
    name: "YZ Ceti",
    kind: "Red dwarf",
    distance: 12.12,
    ra: hms(1, 12, 30.6),
    dec: dms(-16, 59, 56),
    spectral: "M4.5V",
    mag: 12.1,
    note: "A very nearby red dwarf with compact planetary companions.",
  },
  {
    id: "luytens-star",
    name: "Luyten's Star",
    kind: "Red dwarf",
    distance: 12.36,
    ra: hms(7, 27, 24.5),
    dec: dms(5, 13, 33),
    spectral: "M3.5V",
    mag: 9.87,
    note: "A red dwarf near Procyon in Earth's sky, but much dimmer and closer.",
  },
  {
    id: "teegardens-star",
    name: "Teegarden's Star",
    kind: "Ultracool red dwarf",
    distance: 12.50,
    ra: hms(2, 53, 0.9),
    dec: dms(16, 52, 53),
    spectral: "M7V",
    mag: 15.1,
    note: "A small nearby star discovered through high proper-motion surveys.",
  },
  {
    id: "kapteyns-star",
    name: "Kapteyn's Star",
    kind: "Red subdwarf",
    distance: 12.83,
    ra: hms(5, 11, 40.6),
    dec: dms(-45, 1, 6),
    spectral: "M1VI",
    mag: 8.85,
    note: "An old halo star passing through the solar neighborhood.",
  },
  {
    id: "kruger-60",
    name: "Kruger 60",
    kind: "Red dwarf binary",
    distance: 13.15,
    ra: hms(22, 27, 59.5),
    dec: dms(57, 41, 45),
    spectral: "M3V + M4V",
    mag: 9.8,
    note: "A close binary in Cepheus, with both components far dimmer than the Sun.",
  },
  {
    id: "wolf-1061",
    name: "Wolf 1061",
    kind: "Red dwarf",
    distance: 14.05,
    ra: hms(16, 30, 18.1),
    dec: dms(-12, 39, 45),
    spectral: "M3V",
    mag: 10.1,
    note: "A nearby red dwarf with reported compact planets.",
  },
  {
    id: "gliese-674",
    name: "Gliese 674",
    kind: "Red dwarf",
    distance: 14.85,
    ra: hms(17, 28, 39.9),
    dec: dms(-46, 53, 43),
    spectral: "M2.5V",
    mag: 9.37,
    note: "A nearby M dwarf in Ara with a known Neptune-mass planet.",
  },
  {
    id: "gliese-876",
    name: "Gliese 876",
    kind: "Red dwarf",
    distance: 15.25,
    ra: hms(22, 53, 16.7),
    dec: dms(-14, 15, 49),
    spectral: "M4V",
    mag: 10.17,
    note: "A nearby red dwarf with one of the earliest well-studied multi-planet systems.",
  },
  {
    id: "altair",
    name: "Altair",
    kind: "Rapidly rotating A star",
    distance: 16.73,
    ra: hms(19, 50, 47.0),
    dec: dms(8, 52, 6),
    spectral: "A7V",
    mag: 0.77,
    note: "A nearby bright star in Aquila, visibly flattened by fast rotation.",
  },
  {
    id: "vega",
    name: "Vega",
    kind: "White main-sequence star",
    distance: 25.04,
    ra: hms(18, 36, 56.3),
    dec: dms(38, 47, 1),
    spectral: "A0V",
    mag: 0.03,
    note: "A bright northern star with a dusty debris disk; just beyond the 25 ly preset.",
  },
  {
    id: "fomalhaut",
    name: "Fomalhaut",
    kind: "White main-sequence star",
    distance: 25.13,
    ra: hms(22, 57, 39.0),
    dec: dms(-29, 37, 20),
    spectral: "A3V",
    mag: 1.16,
    note: "A bright nearby A star with a prominent debris ring.",
  },
  {
    id: "arcturus",
    name: "Arcturus",
    kind: "Orange giant",
    distance: 36.7,
    ra: hms(14, 15, 39.7),
    dec: dms(19, 10, 57),
    spectral: "K1.5III",
    mag: -0.05,
    note: "A bright evolved star passing through the local neighborhood.",
  },
  {
    id: "capella",
    name: "Capella",
    kind: "Giant-star system",
    distance: 42.9,
    ra: hms(5, 16, 41.4),
    dec: dms(45, 59, 53),
    spectral: "G8III + G0III",
    mag: 0.08,
    note: "A bright multiple-star system dominated by yellow giants.",
  },
];

const PLANET_DATA = [
  { id: "mercury", name: "Mercury", au: 0.387, period: 87.969, meanLongitude: 252.251, inclination: 7.0, node: 48.3, radius: 0.12, color: "#b7aaa0", spectral: "Rocky", mag: "", note: "Small innermost rocky planet; orbit is steeply inclined compared with Earth's." },
  { id: "venus", name: "Venus", au: 0.723, period: 224.701, meanLongitude: 181.980, inclination: 3.4, node: 76.7, radius: 0.18, color: "#e7c78f", spectral: "Rocky", mag: "", note: "Earth-sized inner planet with a dense reflective atmosphere." },
  { id: "earth", name: "Earth", au: 1.0, period: 365.256, meanLongitude: 100.466, inclination: 0.0, node: 0.0, radius: 0.19, color: "#75b8ff", spectral: "Rocky", mag: "", note: "The chart's observing home. One astronomical unit is Earth's average orbital distance." },
  { id: "mars", name: "Mars", au: 1.524, period: 686.980, meanLongitude: 355.453, inclination: 1.85, node: 49.6, radius: 0.15, color: "#e37d56", spectral: "Rocky", mag: "", note: "Outer rocky planet with a thin atmosphere and a more eccentric real orbit than shown here." },
  { id: "jupiter", name: "Jupiter", au: 5.203, period: 4332.589, meanLongitude: 34.404, inclination: 1.3, node: 100.5, radius: 0.38, color: "#e4bb83", spectral: "Gas giant", mag: "", note: "Largest planet; its gravity strongly shapes the asteroid belt and outer solar system." },
  { id: "saturn", name: "Saturn", au: 9.537, period: 10759.22, meanLongitude: 49.944, inclination: 2.49, node: 113.7, radius: 0.34, color: "#ead6a3", spectral: "Gas giant", mag: "", note: "Ringed gas giant. The ring mesh is symbolic, not to scale." },
  { id: "uranus", name: "Uranus", au: 19.191, period: 30688.5, meanLongitude: 313.232, inclination: 0.77, node: 74.0, radius: 0.27, color: "#8fe1dd", spectral: "Ice giant", mag: "", note: "An ice giant with an extreme axial tilt, here represented by color and orbit." },
  { id: "neptune", name: "Neptune", au: 30.07, period: 60182, meanLongitude: 304.88, inclination: 1.77, node: 131.8, radius: 0.27, color: "#6d90ff", spectral: "Ice giant", mag: "", note: "Outer major planet; the Kuiper belt lies beyond its orbit in the real solar system." },
];

const EXOPLANET_SYSTEMS = {
  "proxima-centauri": {
    hostName: "Proxima Centauri",
    planets: [
      {
        id: "proxima-d",
        name: "Proxima d",
        au: 0.02881,
        period: 5.1,
        meanLongitude: 236,
        radius: 0.13,
        color: "#c99a82",
        spectral: "Terrestrial",
        mass: "0.26 Earths",
        status: "Confirmed",
        note: "Confirmed terrestrial planet. NASA lists a 5.1 day orbit at 0.02881 AU around Proxima Centauri.",
      },
      {
        id: "proxima-b",
        name: "Proxima b",
        au: 0.04848,
        period: 11.2,
        meanLongitude: 58,
        radius: 0.18,
        color: "#8fc89f",
        spectral: "Super Earth",
        mass: "1.055 Earths",
        status: "Confirmed",
        note: "Confirmed super-Earth in Proxima Centauri's temperate zone. NASA lists an 11.2 day orbit at 0.04848 AU.",
      },
      {
        id: "proxima-c-candidate",
        name: "Proxima c",
        au: 1.49,
        period: 1900,
        meanLongitude: 196,
        radius: 0.24,
        color: "#8eb6ff",
        spectral: "Candidate outer world",
        mass: "Candidate",
        status: "Candidate / disputed",
        candidate: true,
        note: "Long-period outer candidate. It is intentionally drawn faint because current catalogs treat this signal as disputed rather than a secure planet.",
      },
    ],
  },
};

const GALACTIC_CORE = {
  id: "galactic-core",
  name: "Galactic core",
  ra: hms(17, 45, 40),
  dec: dms(-29, 0, 28),
};
const NORTH_GALACTIC_POLE = {
  ra: 192.85948 / 15,
  dec: 27.12825,
};

const PRESETS = {
  solar: { distance: 12, radius: 42, theta: -0.92, phi: 1.08, target: [0, 0, 0], ring: 5 },
  near: { distance: 12, radius: 76, theta: -0.78, phi: 1.05, target: [0, 0, 0], ring: 5 },
  local: { distance: 25, radius: 154, theta: -0.86, phi: 1.02, target: [0, 0, 0], ring: 10 },
  bright: { distance: 50, radius: 275, theta: -0.78, phi: 0.98, target: [0, 0, 0], ring: 25 },
};

const scene = new THREE.Scene();
scene.background = new THREE.Color("#010208");
scene.fog = new THREE.FogExp2("#010208", 0.0026);

const renderer = new THREE.WebGLRenderer({
  canvas: ui.canvas,
  antialias: true,
  powerPreference: "high-performance",
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor("#010208", 1);

const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 1500);
const raycaster = new THREE.Raycaster();
raycaster.params.Sprite.threshold = 0.42;

const ambient = new THREE.AmbientLight("#a9c9ff", 0.28);
scene.add(ambient);

const solarLight = new THREE.PointLight("#ffe0a0", 7, 90, 1.6);
scene.add(solarLight);

const world = new THREE.Group();
scene.add(world);

const gridGroup = new THREE.Group();
const galacticGroup = new THREE.Group();
const starGroup = new THREE.Group();
const solarSystemGroup = new THREE.Group();
const orbitGroup = new THREE.Group();
const exosystemGroup = new THREE.Group();
const labelTargets = [];
const pickables = [];
const stars = [];
const planets = [];
const exoplanets = [];
const localSystemGroups = new Map();

world.add(gridGroup);
world.add(galacticGroup);
world.add(starGroup);
world.add(solarSystemGroup);
world.add(exosystemGroup);
solarSystemGroup.add(orbitGroup);

const routeGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
const routeLine = new THREE.Line(
  routeGeometry,
  new THREE.LineBasicMaterial({ color: SELECTION_COLOR, transparent: true, opacity: 0.64 })
);
routeLine.visible = false;
world.add(routeLine);

const selectionHalo = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: createHaloTexture(SELECTION_COLOR),
    color: SELECTION_COLOR,
    transparent: true,
    depthWrite: false,
    opacity: 0.88,
  })
);
selectionHalo.visible = false;
scene.add(selectionHalo);

const state = {
  selected: null,
  maxDistance: 12,
  showLabels: true,
  showOrbits: true,
  showRoutes: true,
  paused: false,
  timeSpeed: 8,
  orbitOffsetDays: 0,
  lastFrame: performance.now(),
  mode: "solar",
  systemFocus: "sol",
};

const cameraState = {
  theta: PRESETS.solar.theta,
  phi: PRESETS.solar.phi,
  radius: PRESETS.solar.radius,
  targetTheta: PRESETS.solar.theta,
  targetPhi: PRESETS.solar.phi,
  targetRadius: PRESETS.solar.radius,
  target: new THREE.Vector3(0, 0, 0),
  targetTarget: new THREE.Vector3(0, 0, 0),
};

const pointer = {
  active: false,
  id: null,
  startX: 0,
  startY: 0,
  lastX: 0,
  lastY: 0,
  moved: 0,
};

setupScene();
setupUi();
applyPreset("solar");
selectObject(findObject("sol"), { moveCamera: false });
resize();
requestAnimationFrame(animate);

function setupScene() {
  createReferenceGrid();
  createGalacticReference();
  createBackgroundStars();
  createSolarSystem();
  createStars();
  rebuildOptions();
}

function setupUi() {
  window.addEventListener("resize", resize);
  window.visualViewport?.addEventListener("resize", resize);

  ui.canvas.addEventListener("pointerdown", handlePointerDown);
  ui.canvas.addEventListener("pointermove", handlePointerMove);
  ui.canvas.addEventListener("pointerup", handlePointerUp);
  ui.canvas.addEventListener("pointercancel", handlePointerCancel);
  ui.canvas.addEventListener("wheel", handleWheel, { passive: false });

  ui.presetButtons.forEach((button) => {
    button.addEventListener("click", () => applyPreset(button.dataset.preset));
  });

  ui.distanceFilter.addEventListener("input", () => {
    state.maxDistance = Number(ui.distanceFilter.value);
    state.mode = "custom";
    syncPresetButtons();
    syncVisibility();
  });

  ui.toggleLabels.addEventListener("change", () => {
    state.showLabels = ui.toggleLabels.checked;
    updateLabels();
  });

  ui.toggleOrbits.addEventListener("change", () => {
    state.showOrbits = ui.toggleOrbits.checked;
    syncVisibility();
  });

  ui.toggleRoutes.addEventListener("change", () => {
    state.showRoutes = ui.toggleRoutes.checked;
    syncRoute();
  });

  ui.timeSpeed.addEventListener("input", () => {
    state.timeSpeed = Number(ui.timeSpeed.value);
  });

  ui.pauseTime.addEventListener("click", () => {
    state.paused = !state.paused;
    ui.pauseTime.innerHTML = state.paused
      ? '<span aria-hidden="true">▶</span> Resume'
      : '<span aria-hidden="true">Ⅱ</span> Pause';
  });

  ui.centerSelection.addEventListener("click", () => centerSelection());
  ui.resetView.addEventListener("click", () => {
    applyPreset("solar");
    selectObject(findObject("sol"), { moveCamera: false });
  });

  ui.objectSearch.addEventListener("change", searchAndSelect);
  ui.objectSearch.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      searchAndSelect();
    }
  });
}

function createReferenceGrid() {
  const ringMaterial = new THREE.LineBasicMaterial({
    color: "#8ee8f0",
    transparent: true,
    opacity: 0.2,
  });

  [5, 10, 25, 50].forEach((ly) => {
    const ring = createLineRing(ly * LY_SCALE, 192, ringMaterial.clone());
    ring.userData.ly = ly;
    gridGroup.add(ring);
    addLabelTarget({
      id: `ring-${ly}`,
      name: `${ly} ly`,
      type: "ring",
      object: ring,
      getPosition: () => new THREE.Vector3(ly * LY_SCALE, 0, 0),
      isVisible: () => state.maxDistance >= ly && state.showLabels,
    });
  });

  const axisMaterial = new THREE.LineBasicMaterial({
    color: "#f3bf68",
    transparent: true,
    opacity: 0.24,
  });
  const verticalMaterial = new THREE.LineBasicMaterial({
    color: "#9be37d",
    transparent: true,
    opacity: 0.18,
  });

  const axisLength = 50 * LY_SCALE;
  [
    [new THREE.Vector3(-axisLength, 0, 0), new THREE.Vector3(axisLength, 0, 0), axisMaterial],
    [new THREE.Vector3(0, 0, -axisLength), new THREE.Vector3(0, 0, axisLength), axisMaterial],
    [new THREE.Vector3(0, -axisLength * 0.42, 0), new THREE.Vector3(0, axisLength * 0.42, 0), verticalMaterial],
  ].forEach(([start, end, material]) => {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    gridGroup.add(new THREE.Line(geometry, material));
  });
}

function createGalacticReference() {
  const radius = 360;
  const plane = createLineRing(radius, 256, new THREE.LineBasicMaterial({
    color: "#c7b47d",
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
  }));
  const galacticNorth = directionForRaDec(NORTH_GALACTIC_POLE.ra, NORTH_GALACTIC_POLE.dec);
  plane.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), galacticNorth);
  galacticGroup.add(plane);

  const coreDirection = directionForRaDec(GALACTIC_CORE.ra, GALACTIC_CORE.dec);
  const coreRay = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      coreDirection.clone().multiplyScalar(radius * 0.82),
    ]),
    new THREE.LineBasicMaterial({
      color: "#f3bf68",
      transparent: true,
      opacity: 0.11,
      depthWrite: false,
    })
  );
  galacticGroup.add(coreRay);

  const coreShadow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: createCoreShadowTexture(),
      color: "#f3bf68",
      transparent: true,
      opacity: 0.055,
      depthWrite: false,
      depthTest: false,
    })
  );
  coreShadow.position.copy(coreDirection.clone().multiplyScalar(390));
  coreShadow.scale.set(145, 70, 1);
  galacticGroup.add(coreShadow);

  addLabelTarget({
    id: GALACTIC_CORE.id,
    name: GALACTIC_CORE.name,
    type: "reference",
    object: coreShadow,
    getPosition: () => coreDirection.clone().multiplyScalar(250),
    isVisible: () => state.showLabels && state.maxDistance >= 25,
  });
}

function createBackgroundStars() {
  const count = 900;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();

  for (let index = 0; index < count; index += 1) {
    const seed = seeded(index + 19);
    const seedTwo = seeded(index + 241);
    const seedThree = seeded(index + 911);
    const theta = seed * Math.PI * 2;
    const phi = Math.acos(2 * seedTwo - 1);
    const radius = 410 + seedThree * 370;
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    positions[index * 3] = x;
    positions[index * 3 + 1] = y;
    positions[index * 3 + 2] = z;

    color.set(seed > 0.72 ? "#ffe0b0" : seed > 0.42 ? "#d6f6ff" : "#ffffff");
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 1.1,
      sizeAttenuation: false,
      vertexColors: true,
      transparent: true,
      opacity: 0.46,
      depthWrite: false,
    })
  );
  scene.add(points);
}

function createSolarSystem() {
  const sunMaterial = new THREE.MeshStandardMaterial({
    color: "#ffd37a",
    emissive: "#f3a82d",
    emissiveIntensity: 1.7,
    roughness: 0.58,
  });
  const sun = new THREE.Mesh(new THREE.SphereGeometry(0.82, 48, 32), sunMaterial);
  sun.userData.chartObject = {
    id: "sol",
    name: "Sol",
    type: "star",
    source: STAR_DATA[0],
    object: sun,
  };
  solarSystemGroup.add(sun);
  pickables.push(sun);

  addLabelTarget({
    id: "sol",
    name: "Sol",
    type: "star",
    object: sun,
    isVisible: () => true,
  });

  const heliosphere = createLineRing(16.2, 192, new THREE.LineBasicMaterial({
    color: "#9be37d",
    transparent: true,
    opacity: 0.2,
  }));
  heliosphere.rotation.x = THREE.MathUtils.degToRad(2);
  heliosphere.userData.layer = "orbit-line";
  orbitGroup.add(heliosphere);

  PLANET_DATA.forEach((planet) => {
    const radius = displayAu(planet.au);
    const planetOrbitGroup = new THREE.Group();
    planetOrbitGroup.rotation.x = THREE.MathUtils.degToRad(planet.inclination);
    planetOrbitGroup.rotation.y = THREE.MathUtils.degToRad(planet.node);
    orbitGroup.add(planetOrbitGroup);

    const orbitLine = createLineRing(radius, 192, new THREE.LineBasicMaterial({
      color: planet.color,
      transparent: true,
      opacity: planet.au <= 1.6 ? 0.28 : 0.18,
    }));
    orbitLine.userData.layer = "orbit-line";
    planetOrbitGroup.add(orbitLine);

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(planet.radius, 28, 18),
      new THREE.MeshStandardMaterial({
        color: planet.color,
        emissive: planet.color,
        emissiveIntensity: planet.au <= 1.6 ? 0.12 : 0.06,
        roughness: 0.72,
      })
    );
    mesh.userData.chartObject = {
      id: planet.id,
      name: planet.name,
      type: "planet",
      source: planet,
      object: mesh,
      orbitGroup: planetOrbitGroup,
      displayRadius: radius,
    };
    planetOrbitGroup.add(mesh);
    pickables.push(mesh);

    if (planet.id === "saturn") {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.48, 0.72, 42),
        new THREE.MeshBasicMaterial({
          color: "#f1d6a2",
          transparent: true,
          opacity: 0.48,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      ring.rotation.x = Math.PI / 2.4;
      mesh.add(ring);
    }

    planets.push({
      ...planet,
      mesh,
      orbitGroup: planetOrbitGroup,
      displayRadius: radius,
    });

    addLabelTarget({
      id: planet.id,
      name: planet.name,
      type: "planet",
      object: mesh,
      isVisible: () => state.showLabels && (state.mode === "solar" || state.selected?.id === planet.id),
    });
  });
}

function createStars() {
  STAR_DATA.filter((star) => star.distance > 0).forEach((star) => {
    const color = colorForSpectral(star.spectral);
    const position = positionForStar(star);
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createGlowTexture(color),
        color,
        transparent: true,
        depthWrite: false,
        opacity: 0.92,
      })
    );
    sprite.position.copy(position);
    sprite.scale.setScalar(markerSize(star));
    sprite.userData.chartObject = {
      id: star.id,
      name: star.name,
      type: "star",
      source: star,
      object: sprite,
    };

    starGroup.add(sprite);
    pickables.push(sprite);

    const entry = {
      ...star,
      color,
      object: sprite,
      position,
    };
    stars.push(entry);

    if (EXOPLANET_SYSTEMS[star.id]) {
      createExoplanetSystem(entry);
    }

    addLabelTarget({
      id: star.id,
      name: star.name,
      type: "star",
      object: sprite,
      isVisible: () => labelShouldShowStar(entry),
    });
  });
}

function createExoplanetSystem(host) {
  const system = EXOPLANET_SYSTEMS[host.id];
  const group = new THREE.Group();
  group.position.copy(host.position);
  group.visible = false;
  group.userData.hostId = host.id;
  exosystemGroup.add(group);
  localSystemGroups.set(host.id, group);

  const hostCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 36, 24),
    new THREE.MeshStandardMaterial({
      color: host.color,
      emissive: host.color,
      emissiveIntensity: 0.78,
      roughness: 0.7,
    })
  );
  hostCore.userData.chartObject = host.object.userData.chartObject;
  group.add(hostCore);
  pickables.push(hostCore);

  system.planets.forEach((planet, index) => {
    const displayRadius = displayAu(planet.au);
    const orbitTilt = new THREE.Group();
    orbitTilt.rotation.x = THREE.MathUtils.degToRad(2.5 + index * 1.8);
    orbitTilt.rotation.y = THREE.MathUtils.degToRad(index * 37);
    group.add(orbitTilt);

    const orbitLine = createLineRing(displayRadius, 144, new THREE.LineBasicMaterial({
      color: planet.color,
      transparent: true,
      opacity: planet.candidate ? 0.1 : 0.28,
    }));
    orbitLine.userData.layer = "orbit-line";
    orbitTilt.add(orbitLine);

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(planet.radius, 26, 18),
      new THREE.MeshStandardMaterial({
        color: planet.color,
        emissive: planet.color,
        emissiveIntensity: planet.candidate ? 0.04 : 0.1,
        roughness: 0.74,
        transparent: Boolean(planet.candidate),
        opacity: planet.candidate ? 0.42 : 1,
      })
    );
    mesh.userData.chartObject = {
      id: planet.id,
      name: planet.name,
      type: "exoplanet",
      source: planet,
      object: mesh,
      hostId: host.id,
      orbitGroup: orbitTilt,
      displayRadius,
    };
    orbitTilt.add(mesh);
    pickables.push(mesh);

    exoplanets.push({
      ...planet,
      mesh,
      hostId: host.id,
      orbitGroup: orbitTilt,
      displayRadius,
    });

    addLabelTarget({
      id: planet.id,
      name: planet.name,
      type: "planet",
      object: mesh,
      isVisible: () => state.showLabels && state.systemFocus === host.id,
    });
  });
}

function addLabelTarget(target) {
  const element = document.createElement("span");
  element.className = `chart-label chart-label--${target.type}`;
  element.textContent = target.name;
  element.hidden = true;
  ui.labelLayer.appendChild(element);
  labelTargets.push({ ...target, element });
}

function createLineRing(radius, segments, material) {
  const points = [];
  for (let index = 0; index <= segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }
  return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), material);
}

function resize() {
  const rect = ui.scenePanel.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  updateLabels();
}

function animate(now) {
  const delta = Math.min(0.05, Math.max(0, (now - state.lastFrame) / 1000));
  state.lastFrame = now;

  if (!state.paused) {
    state.orbitOffsetDays += delta * state.timeSpeed;
  }

  updatePlanets();
  updateCamera(delta);
  syncSystemFocus();
  syncSelectionHalo();
  syncRoute();
  renderer.render(scene, camera);
  updateLabels();
  requestAnimationFrame(animate);
}

function updatePlanets() {
  const epochDays = (Date.now() - J2000) / DAY_MS + state.orbitOffsetDays;
  const epochDate = new Date(Date.now() + state.orbitOffsetDays * DAY_MS);
  ui.epochValue.textContent = epochDate.getUTCFullYear().toString();

  planets.forEach((planet) => {
    const angle = THREE.MathUtils.degToRad(planet.meanLongitude + (epochDays / planet.period) * 360);
    planet.mesh.position.set(
      Math.cos(angle) * planet.displayRadius,
      0,
      Math.sin(angle) * planet.displayRadius
    );
    planet.mesh.rotation.y += 0.22 * Math.max(0.2, state.timeSpeed / 8);
  });

  exoplanets.forEach((planet) => {
    const angle = THREE.MathUtils.degToRad(planet.meanLongitude + (state.orbitOffsetDays / planet.period) * 360);
    planet.mesh.position.set(
      Math.cos(angle) * planet.displayRadius,
      0,
      Math.sin(angle) * planet.displayRadius
    );
    planet.mesh.rotation.y += 0.24 * Math.max(0.2, state.timeSpeed / 8);
  });
}

function updateCamera(delta) {
  const easing = 1 - Math.exp(-delta * 8);
  cameraState.theta += (cameraState.targetTheta - cameraState.theta) * easing;
  cameraState.phi += (cameraState.targetPhi - cameraState.phi) * easing;
  cameraState.radius += (cameraState.targetRadius - cameraState.radius) * easing;
  cameraState.target.lerp(cameraState.targetTarget, easing);

  const sinPhi = Math.sin(cameraState.phi);
  camera.position.set(
    cameraState.target.x + cameraState.radius * sinPhi * Math.cos(cameraState.theta),
    cameraState.target.y + cameraState.radius * Math.cos(cameraState.phi),
    cameraState.target.z + cameraState.radius * sinPhi * Math.sin(cameraState.theta)
  );
  camera.lookAt(cameraState.target);
}

function applyPreset(name) {
  const preset = PRESETS[name] || PRESETS.solar;
  state.mode = name;
  state.maxDistance = preset.distance;
  state.systemFocus = name === "solar" ? "sol" : null;
  ui.distanceFilter.value = String(preset.distance);
  ui.ringValue.textContent = `${preset.ring} ly`;
  cameraState.targetTheta = preset.theta;
  cameraState.targetPhi = preset.phi;
  cameraState.targetRadius = preset.radius;
  cameraState.targetTarget.set(...preset.target);
  syncPresetButtons();
  syncVisibility();
}

function syncPresetButtons() {
  ui.presetButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.preset === state.mode);
  });
}

function syncVisibility() {
  let visibleCount = 0;

  stars.forEach((star) => {
    const visible = star.distance <= state.maxDistance;
    const brightOnly = state.mode === "bright";
    const opacity = brightOnly && star.mag > 4.75 ? DIMMED_OPACITY : 0.92;
    star.object.visible = visible;
    star.object.material.opacity = opacity;
    star.object.scale.setScalar(markerSize(star));
    if (visible) visibleCount += 1;
  });

  gridGroup.children.forEach((child) => {
    if (child.userData.ly) {
      child.visible = child.userData.ly <= state.maxDistance;
      child.material.opacity = child.userData.ly === state.maxDistance ? 0.33 : 0.19;
    }
  });

  orbitGroup.traverse((object) => {
    if (object.userData.layer === "orbit-line") {
      object.visible = state.showOrbits;
    }
  });
  syncSystemFocus();
  ui.rangeValue.textContent = `${state.maxDistance} ly`;
  ui.visibleValue.textContent = String(visibleCount + 1);
  renderNearbyList();
  updateLabels();
  syncRoute();
}

function syncSystemFocus() {
  galacticGroup.visible = !(state.systemFocus && state.systemFocus !== "sol");

  localSystemGroups.forEach((group, hostId) => {
    group.visible = state.systemFocus === hostId;
    group.traverse((object) => {
      if (object.userData.layer === "orbit-line") {
        object.visible = state.showOrbits;
      }
    });
  });

  stars.forEach((star) => {
    if (EXOPLANET_SYSTEMS[star.id] && state.systemFocus === star.id) {
      star.object.visible = false;
      star.object.material.opacity = 0;
      star.object.scale.setScalar(0.001);
    }
  });
}

function renderNearbyList() {
  const visibleStars = stars
    .filter((star) => star.distance <= state.maxDistance)
    .sort((left, right) => left.distance - right.distance)
    .slice(0, 8);

  ui.nearestCount.textContent = String(visibleStars.length);
  ui.nearbyList.replaceChildren();

  visibleStars.forEach((star) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "nearby-star";
    button.style.setProperty("--star-color", star.color);
    button.innerHTML = `
      <span class="star-dot" aria-hidden="true"></span>
      <strong>${star.name}</strong>
      <span>${formatDistance(star.distance)}</span>
    `;
    button.addEventListener("click", () => selectObject(findObject(star.id), { moveCamera: false }));
    ui.nearbyList.appendChild(button);
  });
}

function selectObject(chartObject, { moveCamera = false } = {}) {
  if (!chartObject) return;
  state.selected = chartObject;
  ui.objectSearch.value = chartObject.name;

  const source = chartObject.source;
  ui.detailName.textContent = chartObject.name;

  if (chartObject.type === "planet") {
    ui.detailType.textContent = source.spectral;
    ui.detailDistance.textContent = `${source.au} AU`;
    ui.detailSpectrum.textContent = "Solar planet";
    ui.detailMag.textContent = "n/a";
    ui.detailNote.textContent = source.note;
  } else if (chartObject.type === "exoplanet") {
    const hostName = EXOPLANET_SYSTEMS[chartObject.hostId]?.hostName || "host star";
    ui.detailType.textContent = source.spectral;
    ui.detailDistance.textContent = `${source.au} AU`;
    ui.detailSpectrum.textContent = source.status || `Orbiting ${hostName}`;
    ui.detailMag.textContent = source.mass || "n/a";
    ui.detailNote.textContent = source.note;
  } else {
    ui.detailType.textContent = source.kind;
    ui.detailDistance.textContent = formatDistance(source.distance);
    ui.detailSpectrum.textContent = source.spectral;
    ui.detailMag.textContent = formatMagnitude(source.mag);
    ui.detailNote.textContent = source.note;
  }

  syncSelectionHalo();
  syncDetailActions();
  syncRoute();
  updateLabels();

  if (moveCamera) {
    centerSelection();
  }
}

function syncDetailActions() {
  if (!state.selected) return;
  const hasLocalSystem = Boolean(EXOPLANET_SYSTEMS[state.selected.id]);
  if (hasLocalSystem) {
    ui.centerSelection.innerHTML = '<span aria-hidden="true">◎</span> Snap in';
    return;
  }

  ui.centerSelection.innerHTML = '<span aria-hidden="true">⊙</span> Center';
}

function centerSelection() {
  if (!state.selected) return;
  const position = getWorldPosition(state.selected.object);
  if (EXOPLANET_SYSTEMS[state.selected.id]) {
    state.systemFocus = state.selected.id;
    state.mode = "system";
    syncPresetButtons();
    syncSystemFocus();
    ui.ringValue.textContent = "local AU";
  } else if (state.selected.id === "sol") {
    state.systemFocus = "sol";
    state.mode = "solar";
    syncPresetButtons();
    syncSystemFocus();
    ui.ringValue.textContent = `${PRESETS.solar.ring} ly`;
  } else if (state.selected.type === "exoplanet") {
    state.systemFocus = state.selected.hostId;
    state.mode = "system";
    syncPresetButtons();
    syncSystemFocus();
    ui.ringValue.textContent = "local AU";
  }
  cameraState.targetTarget.copy(position);
  cameraState.targetRadius = state.selected.type === "planet" || state.selected.type === "exoplanet"
    ? 10
    : EXOPLANET_SYSTEMS[state.selected.id] ? 15 : Math.max(26, markerCameraRadius(state.selected));
}

function markerCameraRadius(chartObject) {
  if (chartObject.source.distance <= 0) return PRESETS.solar.radius;
  return THREE.MathUtils.clamp(chartObject.source.distance * 5.4, 24, 130);
}

function syncSelectionHalo() {
  const selectedIsFocusedHost = EXOPLANET_SYSTEMS[state.selected?.id] && state.systemFocus === state.selected.id;
  if (!state.selected || state.selected.id === "sol" || selectedIsFocusedHost) {
    selectionHalo.visible = false;
    return;
  }

  selectionHalo.visible = true;
  selectionHalo.position.copy(getWorldPosition(state.selected.object));
  const size = state.selected.type === "planet" || state.selected.type === "exoplanet"
    ? 2.1
    : Math.max(3.2, markerSize(state.selected.source) * 1.85);
  selectionHalo.scale.setScalar(size);
}

function syncRoute() {
  const inRemoteSystem = state.systemFocus && state.systemFocus !== "sol";
  if (!state.selected || inRemoteSystem || !state.showRoutes || state.selected.type !== "star" || state.selected.source.distance <= 0) {
    routeLine.visible = false;
    return;
  }

  const points = routeGeometry.attributes.position;
  const target = getWorldPosition(state.selected.object);
  points.setXYZ(0, 0, 0, 0);
  points.setXYZ(1, target.x, target.y, target.z);
  points.needsUpdate = true;
  routeGeometry.computeBoundingSphere();
  routeLine.visible = true;
}

function updateLabels() {
  const rect = ui.canvas.getBoundingClientRect();
  const selectedId = state.selected?.id;
  const candidates = [];

  labelTargets.forEach((target) => {
    const suppressFocusedHostLabel = state.systemFocus && state.systemFocus !== "sol" && target.type === "star";
    const visible = !suppressFocusedHostLabel && (target.isVisible() || target.id === selectedId);
    if (!visible) {
      target.element.hidden = true;
      return;
    }

    const position = target.getPosition ? target.getPosition() : getWorldPosition(target.object);
    const projected = position.clone().project(camera);
    const inView = projected.z > -1 && projected.z < 1 && Math.abs(projected.x) < 1.12 && Math.abs(projected.y) < 1.12;

    if (!inView) {
      target.element.hidden = true;
      return;
    }

    const x = ((projected.x + 1) / 2) * rect.width;
    const y = ((1 - projected.y) / 2) * rect.height;
    const bottomReserve = 74;
    const selected = target.id === selectedId;

    if (!selected && y > rect.height - bottomReserve) {
      target.element.hidden = true;
      return;
    }

    const width = Math.min(160, 18 + target.name.length * 7.1);
    const height = 22;

    if (!selected && (x - width / 2 < 8 || x + width / 2 > rect.width - 8)) {
      target.element.hidden = true;
      return;
    }

    candidates.push({
      target,
      x,
      y,
      selected,
      priority: selected ? 0 : target.type === "planet" ? 1 : target.type === "star" ? 2 : 3,
      width,
      height,
    });
  });

  const placed = [];
  candidates
    .sort((left, right) => left.priority - right.priority || left.y - right.y)
    .forEach((candidate) => {
      const box = {
        left: candidate.x - candidate.width / 2,
        right: candidate.x + candidate.width / 2,
        top: candidate.y - candidate.height / 2,
        bottom: candidate.y + candidate.height / 2,
      };
      const collides = placed.some((other) => boxesOverlap(box, other, 5));
      if (collides && !candidate.selected) {
        candidate.target.element.hidden = true;
        return;
      }

      placed.push(box);
      candidate.target.element.hidden = false;
      candidate.target.element.classList.toggle("chart-label--selected", candidate.selected);
      candidate.target.element.style.left = `${candidate.x}px`;
      candidate.target.element.style.top = `${candidate.y}px`;
    });
}

function boxesOverlap(left, right, padding = 0) {
  return !(
    left.right + padding < right.left
    || left.left - padding > right.right
    || left.bottom + padding < right.top
    || left.top - padding > right.bottom
  );
}

function labelShouldShowStar(star) {
  if (!state.showLabels || star.distance > state.maxDistance) return false;
  if (state.systemFocus && state.systemFocus !== "sol") return false;
  if (state.mode === "solar") return star.distance <= 8.8 || star.mag <= 1.5;
  if (state.maxDistance <= 12) return star.distance <= 12 || star.mag <= 2;
  if (state.maxDistance <= 25) return star.distance <= 12 || star.mag <= 1.2;
  return star.mag <= 0.8;
}

function handlePointerDown(event) {
  pointer.active = true;
  pointer.id = event.pointerId;
  pointer.startX = event.clientX;
  pointer.startY = event.clientY;
  pointer.lastX = event.clientX;
  pointer.lastY = event.clientY;
  pointer.moved = 0;
  ui.canvas.setPointerCapture(event.pointerId);
}

function handlePointerMove(event) {
  if (!pointer.active || pointer.id !== event.pointerId) return;
  const dx = event.clientX - pointer.lastX;
  const dy = event.clientY - pointer.lastY;
  pointer.lastX = event.clientX;
  pointer.lastY = event.clientY;
  pointer.moved += Math.abs(dx) + Math.abs(dy);

  cameraState.targetTheta -= dx * 0.006;
  cameraState.targetPhi = THREE.MathUtils.clamp(
    cameraState.targetPhi - dy * 0.0048,
    0.16,
    Math.PI - 0.16
  );
}

function handlePointerUp(event) {
  if (!pointer.active || pointer.id !== event.pointerId) return;
  ui.canvas.releasePointerCapture(event.pointerId);
  pointer.active = false;

  const clickDistance = Math.hypot(event.clientX - pointer.startX, event.clientY - pointer.startY);
  if (clickDistance <= 5 && pointer.moved <= 8) {
    pickObject(event);
  }
}

function handlePointerCancel(event) {
  if (pointer.id === event.pointerId) {
    pointer.active = false;
  }
}

function handleWheel(event) {
  event.preventDefault();
  const multiplier = Math.exp(event.deltaY * 0.001);
  cameraState.targetRadius = THREE.MathUtils.clamp(cameraState.targetRadius * multiplier, 9, 720);
}

function pickObject(event) {
  const rect = ui.canvas.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -(((event.clientY - rect.top) / rect.height) * 2 - 1)
  );

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(pickables.filter(objectAndAncestorsVisible), true);
  const hit = hits.find((entry) => findChartObject(entry.object));
  if (!hit) return;

  selectObject(findChartObject(hit.object), { moveCamera: false });
}

function searchAndSelect() {
  const needle = normalize(ui.objectSearch.value);
  if (!needle) return;
  const searchable = getSearchableObjects();
  const match = searchable.find((item) => normalize(item.name) === needle)
    || searchable.find((item) => normalize(item.name).includes(needle));

  if (!match) return;

  const object = findObject(match.id);
  if (!object) return;
  if (object.type === "star" && object.source.distance > state.maxDistance) {
    state.maxDistance = Math.min(50, Math.ceil(object.source.distance));
    ui.distanceFilter.value = String(state.maxDistance);
    state.mode = "custom";
    syncPresetButtons();
    syncVisibility();
  }
  selectObject(object, { moveCamera: true });
}

function rebuildOptions() {
  const options = getSearchableObjects()
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((item) => {
      const option = document.createElement("option");
      option.value = item.name;
      return option;
    });
  ui.objectOptions.replaceChildren(...options);
}

function getSearchableObjects() {
  return [
    ...STAR_DATA,
    ...PLANET_DATA,
    ...Object.values(EXOPLANET_SYSTEMS).flatMap((system) => system.planets),
  ];
}

function findObject(id) {
  if (id === "sol") {
    return solarSystemGroup.children.find((child) => child.userData.chartObject?.id === "sol")?.userData.chartObject;
  }

  const star = stars.find((entry) => entry.id === id);
  if (star) return star.object.userData.chartObject;

  const planet = planets.find((entry) => entry.id === id);
  if (planet) return planet.mesh.userData.chartObject;

  const exoplanet = exoplanets.find((entry) => entry.id === id);
  if (exoplanet) return exoplanet.mesh.userData.chartObject;

  return null;
}

function findChartObject(object) {
  let current = object;
  while (current) {
    if (current.userData.chartObject) return current.userData.chartObject;
    current = current.parent;
  }
  return null;
}

function getWorldPosition(object) {
  const position = new THREE.Vector3();
  object.getWorldPosition(position);
  return position;
}

function objectAndAncestorsVisible(object) {
  let current = object;
  while (current) {
    if (current.visible === false) return false;
    current = current.parent;
  }
  return true;
}

function directionForRaDec(raHours, decDegrees) {
  const ra = THREE.MathUtils.degToRad(raHours * 15);
  const dec = THREE.MathUtils.degToRad(decDegrees);
  return new THREE.Vector3(
    Math.cos(dec) * Math.cos(ra),
    Math.sin(dec),
    Math.cos(dec) * Math.sin(ra)
  ).normalize();
}

function positionForStar(star) {
  const distance = star.distance * LY_SCALE;
  const position = directionForRaDec(star.ra, star.dec).multiplyScalar(distance);

  if (star.offset) {
    position.add(new THREE.Vector3(...star.offset).multiplyScalar(LY_SCALE));
  }

  return position;
}

function markerSize(star) {
  const apparent = Number.isFinite(star.mag) ? star.mag : 10;
  const brightness = THREE.MathUtils.clamp((7.5 - apparent) / 8, 0.16, 1.6);
  const nearbyBoost = Math.max(0, 8 - star.distance) * 0.06;
  return THREE.MathUtils.clamp(1.1 + brightness * 2.4 + nearbyBoost, 1.25, 5.6);
}

function displayAu(au) {
  return 1.35 + Math.sqrt(au) * 2.62;
}

function colorForSpectral(spectral) {
  const code = spectral.trim().charAt(0).toUpperCase();
  if (code === "O") return "#9bbcff";
  if (code === "B") return "#afcaff";
  if (code === "A") return "#d8ebff";
  if (code === "F") return "#fff3d5";
  if (code === "G") return "#ffd978";
  if (code === "K") return "#ffae62";
  if (code === "M") return "#ff745d";
  if (code === "L") return "#d58a5a";
  if (code === "T") return "#9ddcff";
  if (code === "Y") return "#bd91ff";
  if (code === "D") return "#eef8ff";
  return "#ffffff";
}

function createGlowTexture(colorValue) {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.18, withAlpha(colorValue, 0.96));
  gradient.addColorStop(0.55, withAlpha(colorValue, 0.32));
  gradient.addColorStop(1, withAlpha(colorValue, 0));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createHaloTexture(colorValue) {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 34, size / 2, size / 2, 62);
  gradient.addColorStop(0, withAlpha(colorValue, 0));
  gradient.addColorStop(0.54, withAlpha(colorValue, 0.18));
  gradient.addColorStop(0.72, withAlpha(colorValue, 0.88));
  gradient.addColorStop(0.82, withAlpha(colorValue, 0.16));
  gradient.addColorStop(1, withAlpha(colorValue, 0));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createCoreShadowTexture() {
  const width = 256;
  const height = 128;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const glow = ctx.createRadialGradient(width * 0.5, height * 0.5, 0, width * 0.5, height * 0.5, width * 0.46);
  glow.addColorStop(0, "rgba(243, 191, 104, 0.42)");
  glow.addColorStop(0.28, "rgba(188, 139, 85, 0.24)");
  glow.addColorStop(0.72, "rgba(72, 77, 86, 0.13)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  const lane = ctx.createLinearGradient(0, height * 0.42, 0, height * 0.62);
  lane.addColorStop(0, "rgba(0, 0, 0, 0)");
  lane.addColorStop(0.42, "rgba(0, 0, 0, 0.35)");
  lane.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = lane;
  ctx.translate(width * 0.5, height * 0.5);
  ctx.rotate(-0.18);
  ctx.fillRect(-width * 0.48, -height * 0.12, width * 0.96, height * 0.24);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function withAlpha(hex, alpha) {
  const color = new THREE.Color(hex);
  return `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, ${alpha})`;
}

function hms(hours, minutes, seconds) {
  return hours + minutes / 60 + seconds / 3600;
}

function dms(degrees, minutes, seconds) {
  const sign = degrees < 0 ? -1 : 1;
  return sign * (Math.abs(degrees) + minutes / 60 + seconds / 3600);
}

function formatDistance(value) {
  if (value === 0) return "0 ly";
  if (value < 1) return `${value.toFixed(3)} ly`;
  return `${value.toFixed(value < 10 ? 2 : 1)} ly`;
}

function formatMagnitude(value) {
  if (value === "" || value === undefined || Number.isNaN(Number(value))) return "n/a";
  return Number(value).toFixed(2);
}

function normalize(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function seeded(value) {
  const x = Math.sin(value * 928.21) * 10000;
  return x - Math.floor(x);
}
