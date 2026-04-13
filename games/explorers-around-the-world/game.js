const GAME_TITLE = "Explorers around the world";
const statusEl = document.getElementById("status");
const journalPanel = document.getElementById("journal-panel");
const journalInput = document.getElementById("journal-input");
const journalSave = document.getElementById("journal-save");
const journalHint = document.getElementById("journal-hint");

const width = 960;
const height = 540;

const CHARACTERS = [
  { id: "raya", name: "Raya" },
  { id: "niko", name: "Niko" },
  { id: "teo", name: "Teo" },
];

const COUNTRIES = [
  {
    name: "Kenya",
    wildName: "Savanna",
    intro: "Golden grasslands full of acacia trees and roaming herds.",
    fact: "Elephants use low rumbles to communicate across long distances.",
    creatures: ["Cheetah", "Elephant", "Secretary Bird"],
    color: 0xdba15f,
    sceneTitle: "Savanna Case Site",
    scenePrompt: "Inspect clue points in the grasslands to understand how wildlife moves here.",
    hotspots: [
      {
        id: "tracks",
        label: "Fresh Tracks",
        clue: "Round tracks near the waterhole suggest elephants visited at dawn.",
        x: 92,
        y: 158,
        w: 164,
        h: 50,
      },
      {
        id: "tree",
        label: "Marked Acacia",
        clue: "The bark is rubbed smooth where giraffes and antelope feed.",
        x: 265,
        y: 112,
        w: 156,
        h: 50,
      },
      {
        id: "bird",
        label: "Bird Alert Post",
        clue: "Ground birds call loudly when predators are near the herd.",
        x: 426,
        y: 154,
        w: 146,
        h: 50,
      },
    ],
  },
  {
    name: "Brazil",
    wildName: "Amazon Rainforest",
    intro: "A humid forest with huge rivers, vines, and layered tree canopies.",
    fact: "The Amazon rainforest helps move moisture through much of South America.",
    creatures: ["Toucan", "Jaguar", "Capybara"],
    color: 0x63bb7e,
    sceneTitle: "Rainforest Clue Trail",
    scenePrompt: "Follow signs from canopy to riverbank to piece together this habitat.",
    hotspots: [
      {
        id: "canopy",
        label: "Canopy Nest",
        clue: "Bright fruit peels near the nest show birds spread seeds across the forest.",
        x: 120,
        y: 96,
        w: 152,
        h: 50,
      },
      {
        id: "river",
        label: "River Edge",
        clue: "A muddy bank records paw and hoof prints where animals come to drink.",
        x: 272,
        y: 172,
        w: 164,
        h: 50,
      },
      {
        id: "vines",
        label: "Vine Ladder",
        clue: "Thick vines connect tree levels so many species move without touching ground.",
        x: 426,
        y: 122,
        w: 146,
        h: 50,
      },
    ],
  },
  {
    name: "Australia",
    wildName: "Outback",
    intro: "Wide open lands with red earth, hardy plants, and dramatic skies.",
    fact: "Many outback plants store water to survive long dry periods.",
    creatures: ["Kangaroo", "Koala", "Wombat"],
    color: 0xc9785c,
    sceneTitle: "Outback Evidence Zone",
    scenePrompt: "Scan rock, scrub, and water clues to decode survival in dry country.",
    hotspots: [
      {
        id: "billabong",
        label: "Dry Billabong",
        clue: "Only a small water patch remains, so animals visit during cool hours.",
        x: 96,
        y: 174,
        w: 160,
        h: 50,
      },
      {
        id: "burrow",
        label: "Wombat Burrow",
        clue: "Deep burrows stay cool and protect animals during midday heat.",
        x: 274,
        y: 152,
        w: 154,
        h: 50,
      },
      {
        id: "eucalyptus",
        label: "Eucalyptus Stand",
        clue: "Leaves store oils and water, helping trees handle long dry spells.",
        x: 430,
        y: 98,
        w: 150,
        h: 50,
      },
    ],
  },
  {
    name: "Norway",
    wildName: "Fjord Coast",
    intro: "Steep cliffs and cold waters shaped by ancient glaciers.",
    fact: "Fjords are deep valleys carved by glaciers and later filled with sea water.",
    creatures: ["Puffin", "Reindeer", "Harbor Seal"],
    color: 0x7ca8d9,
    sceneTitle: "Fjord Mystery Map",
    scenePrompt: "Investigate coast clues to learn how glacier-shaped land supports wildlife.",
    hotspots: [
      {
        id: "cliff",
        label: "Cliff Ledge",
        clue: "Puffins nest on high ledges where predators have a hard climb.",
        x: 98,
        y: 106,
        w: 150,
        h: 50,
      },
      {
        id: "shore",
        label: "Tide Shore",
        clue: "Kelp and shell patches show nutrient-rich waters feeding marine life.",
        x: 270,
        y: 182,
        w: 156,
        h: 50,
      },
      {
        id: "valley",
        label: "Glacier Valley",
        clue: "A wide U-shaped valley reveals the path ancient ice carved.",
        x: 430,
        y: 132,
        w: 146,
        h: 50,
      },
    ],
  },
];

const state = {
  phase: "character",
  selectedCharacter: null,
  selectedCountry: null,
  explorerPosition: null,
  followerPosition: null,
  adoptedCreature: null,
  fedCreature: null,
  inspectedHotspots: [],
  activeHotspot: null,
  activeClue: "",
  learnedFact: false,
  savedNote: "",
  history: [],
  hazardAnimals: [],
  hitCount: 0,
  lastDamageTime: 0,
};

const config = {
  type: Phaser.AUTO,
  width,
  height,
  parent: "studio-root",
  backgroundColor: "#13241d",
  scene: { preload, create, update },
};

let sceneRef;
let uiNodes = [];
let uiTweens = [];
let inputKeys;
let controlledExplorer = null;
let controlledFollower = null;
let controlledFrame = null;
let hazardSprites = [];
const controllerState = {
  left: false,
  right: false,
  up: false,
  down: false,
  confirm: false,
  action: false,
  special: false,
  start: false,
  shoulderLeft: false,
  shoulderRight: false,
};
let controllerCharacterIndex = 0;
let controllerCountryIndex = 0;
let controllerCreatureIndex = 0;

new Phaser.Game(config);

function preload() {
  const g = this.add.graphics();

  g.fillStyle(0x3a8757, 1);
  g.fillRoundedRect(0, 20, 56, 56, 14);
  g.fillStyle(0xf2dbb2, 1);
  g.fillCircle(28, 18, 14);
  g.fillStyle(0x2f7c46, 1);
  g.fillRoundedRect(6, 0, 44, 12, 5);
  g.fillStyle(0x235f36, 1);
  g.fillRoundedRect(18, 6, 20, 14, 4);
  g.generateTexture("greenExplorer", 56, 76);
  g.clear();

  g.fillStyle(0x2e5b46, 1);
  g.fillRoundedRect(0, 0, 260, 52, 12);
  g.generateTexture("btnIdle", 260, 52);
  g.clear();

  g.fillStyle(0x4f8f6e, 1);
  g.fillRoundedRect(0, 0, 260, 52, 12);
  g.generateTexture("btnHover", 260, 52);
  g.clear();

  g.fillStyle(0xc7b594, 1);
  g.fillCircle(16, 16, 14);
  g.fillStyle(0xb69f78, 1);
  g.fillCircle(8, 6, 5);
  g.fillCircle(24, 6, 5);
  g.fillStyle(0x2b2b2b, 1);
  g.fillCircle(12, 16, 2);
  g.fillCircle(20, 16, 2);
  g.fillRoundedRect(13, 21, 6, 3, 1);
  g.generateTexture("animalBuddy", 32, 32);

  g.clear();
  g.fillStyle(0xc96e3b, 1);
  g.fillCircle(17, 17, 16);
  g.fillStyle(0x8e4423, 1);
  g.fillCircle(11, 15, 3);
  g.fillCircle(23, 15, 3);
  g.fillStyle(0x6a3218, 1);
  g.fillTriangle(17, 24, 14, 20, 20, 20);
  g.generateTexture("wildHazard", 34, 34);
  g.destroy();
}

function create() {
  sceneRef = this;
  inputKeys = sceneRef.input.keyboard.addKeys("UP,DOWN,LEFT,RIGHT,W,A,S,D");
  wireJournalHandlers();
  render();
}

function wireJournalHandlers() {
  if (!journalSave || !journalInput) return;

  journalSave.addEventListener("click", saveJournalNote);
  journalInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") saveJournalNote();
  });
}

function activeGamepad() {
  if (!navigator.getGamepads) return null;
  const pads = Array.from(navigator.getGamepads()).filter(Boolean);
  return pads[0] || null;
}

function controllerEdge(name, pressed) {
  const previous = controllerState[name] || false;
  controllerState[name] = pressed;
  return pressed && !previous;
}

function pollController() {
  const pad = activeGamepad();
  if (!pad) {
    Object.keys(controllerState).forEach((key) => {
      controllerState[key] = false;
    });
    return {
      left: false,
      right: false,
      up: false,
      down: false,
      confirmPressed: false,
      actionPressed: false,
      specialPressed: false,
      startPressed: false,
      shoulderLeftPressed: false,
      shoulderRightPressed: false,
      moveX: 0,
      moveY: 0,
    };
  }

  const axisX = pad.axes[0] ?? 0;
  const axisY = pad.axes[1] ?? 0;
  const left = axisX <= -0.4 || !!pad.buttons[14]?.pressed;
  const right = axisX >= 0.4 || !!pad.buttons[15]?.pressed;
  const up = axisY <= -0.4 || !!pad.buttons[12]?.pressed;
  const down = axisY >= 0.4 || !!pad.buttons[13]?.pressed;
  const confirm = !!pad.buttons[0]?.pressed || !!pad.buttons[9]?.pressed;
  const action = !!pad.buttons[2]?.pressed || !!pad.buttons[3]?.pressed;
  const special = !!pad.buttons[1]?.pressed || !!pad.buttons[5]?.pressed;
  const start = !!pad.buttons[9]?.pressed;
  const shoulderLeft = !!pad.buttons[4]?.pressed;
  const shoulderRight = !!pad.buttons[5]?.pressed;

  return {
    left,
    right,
    up,
    down,
    confirmPressed: controllerEdge("confirm", confirm),
    actionPressed: controllerEdge("action", action),
    specialPressed: controllerEdge("special", special),
    startPressed: controllerEdge("start", start),
    shoulderLeftPressed: controllerEdge("shoulderLeft", shoulderLeft),
    shoulderRightPressed: controllerEdge("shoulderRight", shoulderRight),
    leftPressed: controllerEdge("left", left),
    rightPressed: controllerEdge("right", right),
    upPressed: controllerEdge("up", up),
    downPressed: controllerEdge("down", down),
    moveX: Math.abs(axisX) >= 0.18 ? axisX : 0,
    moveY: Math.abs(axisY) >= 0.18 ? axisY : 0,
  };
}

function generatedJournalNote(countryName) {
  const country = COUNTRIES.find((entry) => entry.name === countryName);
  if (!country) return "I learned how animals adapt to their habitat.";
  return `${country.name}: ${country.fact}`;
}

function inspectNearestHotspot() {
  if (!controlledExplorer || !state.selectedCountry) return;
  const country = state.selectedCountry;
  const frame = controlledFrame || { x: 400, y: 145, width: 540, height: 240 };
  const baseWidth = 540;
  const baseHeight = 240;
  let nearest = null;
  let nearestDistance = Infinity;

  country.hotspots.forEach((spot) => {
    const x = frame.x + (spot.x / baseWidth) * frame.width;
    const y = frame.y + (spot.y / baseHeight) * frame.height;
    const distance = Phaser.Math.Distance.Between(controlledExplorer.x, controlledExplorer.y, x, y);
    if (distance < nearestDistance) {
      nearest = spot;
      nearestDistance = distance;
    }
  });

  if (nearest && nearestDistance <= 180) {
    inspectHotspot(nearest);
  } else {
    setJournalHint("Move closer to a clue point, then inspect it.");
  }
}

function feedSelectedCreature() {
  if (state.phase !== "explore" || !state.selectedCountry) return;
  const creature = state.selectedCountry.creatures[controllerCreatureIndex % state.selectedCountry.creatures.length];
  if (!creature) return;
  state.fedCreature = creature;
  state.adoptedCreature = creature;
  state.followerPosition = null;
  setJournalHint(`You fed ${creature} and adopted it for this journey.`);
  render();
}

function learnFactWithController() {
  if (state.phase !== "explore") return;
  if (!state.inspectedHotspots.length) {
    setJournalHint("Inspect at least one scene clue first.");
    return;
  }
  state.learnedFact = true;
  setJournalHint("Fact learned. Press Start to save a journal note.");
  render();
}

function saveJournalNoteWithController() {
  if (state.phase !== "explore") return;
  if (!state.learnedFact) {
    setJournalHint("Learn a wild fact first.");
    return;
  }
  const note = generatedJournalNote(state.selectedCountry?.name);
  state.savedNote = note;
  if (journalInput) {
    journalInput.value = note;
  }
  setJournalHint("Saved from controller. Press A to finish the explore.");
  updateStatus();
  render();
}

function finishExploreWithController() {
  if (state.phase !== "explore") return;
  if (!(state.learnedFact && state.savedNote)) {
    setJournalHint("Learn the fact and save the note first.");
    return;
  }

  state.history.push({
    country: state.selectedCountry.name,
    note: state.savedNote,
    creature: state.adoptedCreature || "No creature adopted",
  });

  state.phase = "country";
  state.selectedCountry = null;
  state.explorerPosition = null;
  state.followerPosition = null;
  state.inspectedHotspots = [];
  state.activeHotspot = null;
  state.activeClue = "";
  state.learnedFact = false;
  state.savedNote = "";
  state.adoptedCreature = null;
  state.fedCreature = null;
  state.hazardAnimals = [];
  state.hitCount = 0;
  state.lastDamageTime = 0;
  resetJournal();
  render();
}

function saveJournalNote() {
  if (state.phase !== "explore") return;

  if (!state.learnedFact) {
    setJournalHint("Learn a wild fact first.");
    return;
  }

  const note = (journalInput?.value || "").trim();
  if (!note) {
    setJournalHint("Please type what you learned.");
    return;
  }

  state.savedNote = note;
  setJournalHint("Saved. You can finish this explore.");
  updateStatus();
  render();
}

function clearUI() {
  for (const tween of uiTweens) tween.remove();
  uiTweens = [];
  for (const node of uiNodes) node.destroy();
  uiNodes = [];
  controlledExplorer = null;
  controlledFollower = null;
  controlledFrame = null;
  hazardSprites = [];
}

function addNode(node) {
  uiNodes.push(node);
  return node;
}

function addTween(tween) {
  uiTweens.push(tween);
  return tween;
}

function label(text, x, y, size = 24, color = "#f4f8ef", align = "left") {
  return addNode(
    sceneRef.add.text(x, y, text, {
      fontFamily: "Avenir Next, Trebuchet MS, sans-serif",
      fontSize: `${size}px`,
      color,
      align,
      wordWrap: { width: 760 },
    })
  );
}

function button(text, x, y, onClick, widthPx = 260) {
  const sprite = addNode(sceneRef.add.image(x, y, "btnIdle").setDisplaySize(widthPx, 52));
  const textNode = addNode(
    sceneRef
      .add
      .text(x, y, text, {
        fontFamily: "Avenir Next, Trebuchet MS, sans-serif",
        fontSize: "18px",
        color: "#f2f8f1",
      })
      .setOrigin(0.5)
  );

  sprite.setInteractive({ useHandCursor: true });
  sprite.on("pointerover", () => sprite.setTexture("btnHover"));
  sprite.on("pointerout", () => sprite.setTexture("btnIdle"));
  sprite.on("pointerdown", onClick);

  return { sprite, textNode };
}

function drawBackdrop(colorA = 0x17372b, colorB = 0x264e3a, areaWidth = width) {
  const g = addNode(sceneRef.add.graphics());
  g.fillGradientStyle(colorA, colorA, colorB, colorB, 1);
  g.fillRect(0, 0, areaWidth, height);
  g.fillStyle(0xffffff, 0.08);
  g.fillCircle(Math.min(areaWidth - 100, 860), 90, 80);
  g.fillCircle(120, 100, 60);
}

function pinToCamera(node) {
  node.setScrollFactor(0);
  return node;
}

function pinButton(buttonNodes) {
  if (!buttonNodes) return;
  pinToCamera(buttonNodes.sprite);
  pinToCamera(buttonNodes.textNode);
}

function drawCountryScene(country, customFrame) {
  const frame = customFrame || { x: 400, y: 145, width: 540, height: 240 };
  const baseWidth = 540;
  const baseHeight = 240;
  const fx = (value) => frame.x + (value / baseWidth) * frame.width;
  const fy = (value) => frame.y + (value / baseHeight) * frame.height;
  const fw = (value) => (value / baseWidth) * frame.width;
  const fh = (value) => (value / baseHeight) * frame.height;
  const g = addNode(sceneRef.add.graphics());

  g.fillStyle(0x11211a, 0.6);
  g.fillRoundedRect(frame.x - 6, frame.y - 6, frame.width + 12, frame.height + 12, 16);

  if (country.name === "Kenya") {
    g.fillGradientStyle(0xf2bf79, 0xf2bf79, 0xd48948, 0xd48948, 1);
    g.fillRoundedRect(frame.x, frame.y, frame.width, frame.height, 14);
    g.fillStyle(0x6f4c2f, 0.95);
    g.fillRect(frame.x, fy(168), frame.width, fh(72));
    g.fillStyle(0x4e3824, 1);
    g.fillRect(fx(144), fy(96), fw(12), fh(96));
    g.fillCircle(fx(150), fy(90), fw(36));
    g.fillCircle(fx(126), fy(104), fw(30));
    g.fillCircle(fx(174), fy(106), fw(28));
  } else if (country.name === "Brazil") {
    g.fillGradientStyle(0x2d6f45, 0x2d6f45, 0x1f4e31, 0x1f4e31, 1);
    g.fillRoundedRect(frame.x, frame.y, frame.width, frame.height, 14);
    g.fillStyle(0x2a8854, 0.9);
    g.fillCircle(fx(92), fy(88), fw(74));
    g.fillCircle(fx(210), fy(74), fw(86));
    g.fillCircle(fx(336), fy(82), fw(78));
    g.fillCircle(fx(454), fy(92), fw(66));
    g.fillStyle(0x4a9fd1, 0.95);
    g.fillRoundedRect(fx(36), fy(170), frame.width - fw(74), fh(42), 18);
  } else if (country.name === "Australia") {
    g.fillGradientStyle(0xe2a56d, 0xe2a56d, 0xa95835, 0xa95835, 1);
    g.fillRoundedRect(frame.x, frame.y, frame.width, frame.height, 14);
    g.fillStyle(0x844328, 0.95);
    g.fillRect(frame.x, fy(156), frame.width, fh(84));
    g.fillStyle(0x63311e, 1);
    g.fillTriangle(
      fx(112),
      fy(178),
      fx(186),
      fy(96),
      fx(258),
      fy(178)
    );
    g.fillTriangle(
      fx(312),
      fy(178),
      fx(372),
      fy(106),
      fx(430),
      fy(178)
    );
  } else {
    g.fillGradientStyle(0x9ec8eb, 0x9ec8eb, 0x4f7fb1, 0x4f7fb1, 1);
    g.fillRoundedRect(frame.x, frame.y, frame.width, frame.height, 14);
    g.fillStyle(0x30507a, 0.96);
    g.fillRect(frame.x, fy(160), frame.width, fh(80));
    g.fillStyle(0xdbe7f4, 1);
    g.fillTriangle(
      fx(42),
      fy(168),
      fx(130),
      fy(62),
      fx(218),
      fy(168)
    );
    g.fillTriangle(
      fx(210),
      fy(168),
      fx(294),
      fy(76),
      fx(380),
      fy(168)
    );
    g.fillTriangle(
      fx(332),
      fy(168),
      fx(430),
      fy(54),
      fx(518),
      fy(168)
    );
  }

  return frame;
}

function renderControlledExplorer(frame) {
  const startPosition = state.explorerPosition || {
    x: frame.x + 36,
    y: frame.y + frame.height - 28,
  };
  const explorer = addNode(
    sceneRef.add.image(startPosition.x, startPosition.y, "greenExplorer").setScale(0.7)
  );
  explorer.setDepth(6);
  controlledExplorer = explorer;
  controlledFrame = frame;
}

function renderFollower() {
  if (!state.adoptedCreature || !controlledExplorer) return;

  const startPosition = state.followerPosition || {
    x: controlledExplorer.x - 30,
    y: controlledExplorer.y + 10,
  };
  const follower = addNode(
    sceneRef.add.image(startPosition.x, startPosition.y, "animalBuddy").setScale(0.7)
  );
  follower.setDepth(5);
  controlledFollower = follower;
}

function initializeHazards(frame, country) {
  if (state.hazardAnimals.length) return;

  const minX = frame.x + 120;
  const maxX = frame.x + frame.width - 120;
  const minY = frame.y + 120;
  const maxY = frame.y + frame.height - 80;
  const hazardCount = 6;

  for (let i = 0; i < hazardCount; i += 1) {
    const direction = Math.random() > 0.5 ? 1 : -1;
    state.hazardAnimals.push({
      x: Phaser.Math.Between(minX, maxX),
      y: Phaser.Math.Between(minY, maxY),
      vx: Phaser.Math.Between(70, 135) * direction,
      vy: Phaser.Math.Between(-35, 35),
      creature: country.creatures[i % country.creatures.length],
    });
  }
}

function renderHazards(frame, country) {
  initializeHazards(frame, country);
  state.hazardAnimals.forEach((hazard, index) => {
    const sprite = addNode(sceneRef.add.image(hazard.x, hazard.y, "wildHazard").setScale(0.85));
    sprite.setDepth(5.5);
    sprite.setTint(index % 2 ? 0xffd39b : 0xffb57e);
    hazardSprites.push(sprite);
  });
}

function renderSceneHotspots(country, frame) {
  const baseWidth = 540;
  const baseHeight = 240;
  country.hotspots.forEach((spot) => {
    const isFound = state.inspectedHotspots.includes(spot.id);
    const isActive = state.activeHotspot === spot.id;
    const fillColor = isActive ? 0x8bcf9f : isFound ? 0x5ea67b : 0x1f3f31;
    const spotX = frame.x + (spot.x / baseWidth) * frame.width;
    const spotY = frame.y + (spot.y / baseHeight) * frame.height;
    const spotW = Math.max(110, (spot.w / baseWidth) * frame.width);
    const spotH = Math.max(42, (spot.h / baseHeight) * frame.height);

    const hotspot = addNode(
      sceneRef
        .add
        .rectangle(spotX, spotY, spotW, spotH, fillColor, 0.9)
        .setStrokeStyle(2, isFound ? 0xd9f0df : 0xa7c8b0, 0.95)
    );

    hotspot.setInteractive({ useHandCursor: true });
    hotspot.on("pointerdown", () => inspectHotspot(spot));
    hotspot.on("pointerover", () => hotspot.setAlpha(1));
    hotspot.on("pointerout", () => hotspot.setAlpha(0.9));

    label(spot.label, spotX - (spotW / 2) + 12, spotY - 12, 14, "#f0f8f2");
  });
}

function inspectHotspot(spot) {
  if (!state.inspectedHotspots.includes(spot.id)) {
    state.inspectedHotspots.push(spot.id);
  }

  state.activeHotspot = spot.id;
  state.activeClue = spot.clue;
  if (!state.learnedFact) {
    setJournalHint("Clue recorded. Connect clues to unlock the wild fact.");
  }
  render();
}

function render() {
  clearUI();
  updateStatus();
  const camera = sceneRef.cameras.main;

  if (state.phase === "explore") {
    camera.setBounds(0, 0, 2200, height);
  } else {
    camera.stopFollow();
    camera.setScroll(0, 0);
    camera.setBounds(0, 0, width, height);
  }

  if (state.phase === "character") {
    showJournal(false);
    renderCharacterStep();
    return;
  }

  if (state.phase === "country") {
    showJournal(false);
    renderCountryStep();
    return;
  }

  if (state.phase === "explore") {
    showJournal(true);
    renderExploreStep();
  }
}

function renderCharacterStep() {
  drawBackdrop(0x183f2f, 0x2f6b49);

  label(GAME_TITLE, 36, 26, 34);
  label("Step 1: Choose your green-hatted explorer", 36, 80, 20, "#d7ebde");

  let y = 170;
  CHARACTERS.forEach((character) => {
    addNode(sceneRef.add.image(140, y, "greenExplorer"));
    button(`${character.name} the Explorer`, 350, y, () => {
      state.selectedCharacter = character;
      state.phase = "country";
      render();
    }, 320);
    y += 118;
  });

  label("Each explorer wears green and keeps the same hat style.", 36, 486, 16, "#d2e9d8");
  label(`Controller: ${CHARACTERS[controllerCharacterIndex]?.name || "Raya"} selected · D-pad to choose · A to start`, 36, 514, 15, "#dceee1");
}

function renderCountryStep() {
  drawBackdrop(0x213a2d, 0x345643);

  label(`Explorer: ${state.selectedCharacter.name}`, 36, 24, 22, "#d7ebde");
  addNode(sceneRef.add.image(220, 62, "greenExplorer").setScale(0.7));
  label("Step 2: Pick a country to explore", 36, 84, 28);

  let x = 210;
  let y = 170;
  COUNTRIES.forEach((country, index) => {
    button(country.name, x, y, () => {
      state.selectedCountry = country;
      state.explorerPosition = null;
      state.followerPosition = null;
      state.adoptedCreature = null;
      state.fedCreature = null;
      state.inspectedHotspots = [];
      state.activeHotspot = null;
      state.activeClue = "";
      state.learnedFact = false;
      state.savedNote = "";
      state.hazardAnimals = [];
      state.hitCount = 0;
      state.lastDamageTime = 0;
      resetJournal();
      state.phase = "explore";
      render();
    });

    x += 300;
    if (index % 2 === 1) {
      x = 210;
      y += 96;
    }
  });

  if (state.history.length) {
    const last = state.history[state.history.length - 1];
    label(`Last explore: ${last.country} - ${last.note}`, 36, 478, 16, "#d2e9d8");
  }

  label(`Controller: ${COUNTRIES[controllerCountryIndex]?.name || "Kenya"} selected · D-pad to choose · A to explore`, 36, 510, 15, "#dceee1");
}

function renderExploreStep() {
  const country = state.selectedCountry;
  const worldWidth = 2200;
  drawBackdrop(country.color, 0x224132, worldWidth);
  const sceneFrame = drawCountryScene(country, { x: 12, y: 12, width: worldWidth - 24, height: 516 });
  renderSceneHotspots(country, sceneFrame);
  renderControlledExplorer(sceneFrame);
  renderFollower();
  renderHazards(sceneFrame, country);

  const camera = sceneRef.cameras.main;
  camera.startFollow(controlledExplorer, true, 0.09, 0.09);

  pinToCamera(addNode(sceneRef.add.rectangle(300, 50, 560, 74, 0x0f1d17, 0.66).setStrokeStyle(1, 0xa9c7b1, 0.5)));
  pinToCamera(label(`${country.name} · ${country.wildName}`, 32, 20, 30));
  pinToCamera(label(country.intro, 32, 56, 16, "#dbeee1"));
  pinToCamera(label(`Explorer: ${state.selectedCharacter.name} · Move with arrow keys or WASD`, 32, 78, 14, "#d7ebde"));
  pinToCamera(label(`Dodge wild animals: hits ${state.hitCount}`, 32, 98, 14, "#ffd7b8"));
  pinToCamera(label("Controller: move with left stick/d-pad · A inspect/finish · X feed · Y learn fact · Start save note", 32, 118, 13, "#dceee1"));

  pinToCamera(addNode(sceneRef.add.rectangle(210, 462, 390, 132, 0x0f1d17, 0.66).setStrokeStyle(1, 0xa9c7b1, 0.5)));
  pinToCamera(label("Journey camp: feed one creature to adopt it", 28, 402, 14, "#d7ebde"));

  let creatureY = 430;
  country.creatures.forEach((creature) => {
    const actionLabel = state.adoptedCreature === creature
      ? `Adopted after feeding: ${creature}`
      : `Feed ${creature} to adopt`;

    const feedButton = button(
      actionLabel,
      210,
      creatureY,
      () => {
        state.fedCreature = creature;
        state.adoptedCreature = creature;
        state.followerPosition = null;
        setJournalHint(`You fed ${creature} and adopted it for this journey.`);
        render();
      },
      344
    );
    pinButton(feedButton);
    creatureY += 34;
  });

  pinToCamera(addNode(sceneRef.add.rectangle(640, 462, 590, 132, 0x0f1d17, 0.66).setStrokeStyle(1, 0xa9c7b1, 0.5)));
  pinToCamera(label(
    `Clues found: ${state.inspectedHotspots.length}/${country.hotspots.length}`,
    360,
    402,
    15,
    "#ddf1e3"
  ));
  pinToCamera(label(
    state.activeClue || "Click a highlighted clue spot inside the scene.",
    360,
    424,
    14,
    "#d4e9da"
  ));

  const journeySummary = state.adoptedCreature
    ? `Journey progress: Start camp -> fed ${state.adoptedCreature} -> clue trail`
    : "Journey progress: Start camp -> choose an animal to feed -> clue trail";
  pinToCamera(label(journeySummary, 360, 448, 13, "#dceee1"));

  const clueButtonLabel = state.learnedFact
    ? "Wild Fact Learned"
    : state.inspectedHotspots.length
      ? "Connect Clues -> Learn Fact"
      : "Inspect Scene Clues First";

  const clueButton = button(
    clueButtonLabel,
    640,
    482,
    () => {
      if (!state.inspectedHotspots.length) {
        setJournalHint("Inspect at least one scene clue first.");
        return;
      }
      state.learnedFact = true;
      setJournalHint("Now type what you learned in the top-right box.");
      render();
    },
    300
  );
  pinButton(clueButton);

  if (state.learnedFact) {
    pinToCamera(label(`Wild fact: ${country.fact}`, 360, 472, 14, "#f3f7f0"));
  } else {
    pinToCamera(label("Inspect clues, then unlock the fact and save your note.", 360, 472, 14, "#e0efe3"));
  }

  const canFinish = state.learnedFact && state.savedNote;
  const finishButton = button("Finish Explore", 820, 514, () => {
    if (!canFinish) {
      setJournalHint("Save a learning note first.");
      return;
    }

    state.history.push({
      country: country.name,
      note: state.savedNote,
      creature: state.adoptedCreature || "No creature adopted",
    });

    state.phase = "country";
    state.selectedCountry = null;
    state.explorerPosition = null;
    state.followerPosition = null;
    state.inspectedHotspots = [];
    state.activeHotspot = null;
    state.activeClue = "";
    state.learnedFact = false;
    state.savedNote = "";
    state.adoptedCreature = null;
    state.fedCreature = null;
    state.hazardAnimals = [];
    state.hitCount = 0;
    state.lastDamageTime = 0;
    resetJournal();
    render();
  });
  pinButton(finishButton);

  const recent = state.history.slice(-1);
  if (recent.length) {
    let recentY = 130;
    pinToCamera(label("Recent learning note:", 744, recentY, 13, "#e5f2e7"));
    recentY += 22;

    recent.forEach((entry) => {
      pinToCamera(label(`- ${entry.country}: ${entry.note}`, 744, recentY, 12, "#d6eadb"));
    });
  }
}

function showJournal(visible) {
  if (!journalPanel) return;
  journalPanel.classList.toggle("hidden", !visible);
}

function resetJournal() {
  if (journalInput) journalInput.value = "";
  setJournalHint("Learn first, then write your note.");
}

function setJournalHint(message) {
  if (journalHint) journalHint.textContent = message;
}

function updateStatus() {
  if (!statusEl) return;

  const explorer = state.selectedCharacter ? state.selectedCharacter.name : "none";
  const trips = state.history.length;
  statusEl.textContent = `Explorer: ${explorer} · Explores finished: ${trips}`;
}

function update(_, delta) {
  const controller = pollController();

  if (state.phase === "character") {
    if (controller.leftPressed || controller.upPressed) {
      controllerCharacterIndex = (controllerCharacterIndex - 1 + CHARACTERS.length) % CHARACTERS.length;
      render();
    }
    if (controller.rightPressed || controller.downPressed) {
      controllerCharacterIndex = (controllerCharacterIndex + 1) % CHARACTERS.length;
      render();
    }
    if (controller.confirmPressed) {
      state.selectedCharacter = CHARACTERS[controllerCharacterIndex];
      state.phase = "country";
      render();
    }
    return;
  }

  if (state.phase === "country") {
    if (controller.leftPressed) {
      controllerCountryIndex = (controllerCountryIndex + COUNTRIES.length - 1) % COUNTRIES.length;
      render();
    }
    if (controller.rightPressed) {
      controllerCountryIndex = (controllerCountryIndex + 1) % COUNTRIES.length;
      render();
    }
    if (controller.upPressed) {
      controllerCountryIndex = (controllerCountryIndex + COUNTRIES.length - 2) % COUNTRIES.length;
      render();
    }
    if (controller.downPressed) {
      controllerCountryIndex = (controllerCountryIndex + 2) % COUNTRIES.length;
      render();
    }
    if (controller.confirmPressed) {
      const country = COUNTRIES[controllerCountryIndex];
      state.selectedCountry = country;
      state.explorerPosition = null;
      state.followerPosition = null;
      state.adoptedCreature = null;
      state.fedCreature = null;
      state.inspectedHotspots = [];
      state.activeHotspot = null;
      state.activeClue = "";
      state.learnedFact = false;
      state.savedNote = "";
      state.hazardAnimals = [];
      state.hitCount = 0;
      state.lastDamageTime = 0;
      controllerCreatureIndex = 0;
      resetJournal();
      state.phase = "explore";
      render();
    }
    return;
  }

  if (state.phase !== "explore" || !controlledExplorer || !controlledFrame || !inputKeys) return;

  let dx = 0;
  let dy = 0;

  if (inputKeys.LEFT.isDown || inputKeys.A.isDown) dx -= 1;
  if (inputKeys.RIGHT.isDown || inputKeys.D.isDown) dx += 1;
  if (inputKeys.UP.isDown || inputKeys.W.isDown) dy -= 1;
  if (inputKeys.DOWN.isDown || inputKeys.S.isDown) dy += 1;
  if (controller.left) dx -= 1;
  if (controller.right) dx += 1;
  if (controller.up) dy -= 1;
  if (controller.down) dy += 1;

  const minX = controlledFrame.x + 24;
  const maxX = controlledFrame.x + controlledFrame.width - 24;
  const minY = controlledFrame.y + 34;
  const maxY = controlledFrame.y + controlledFrame.height - 16;

  if (dx || dy) {
    const length = Math.hypot(dx, dy) || 1;
    const speed = 220;
    const distance = speed * (delta / 1000);

    const nextX = controlledExplorer.x + (dx / length) * distance;
    const nextY = controlledExplorer.y + (dy / length) * distance;

    controlledExplorer.x = Phaser.Math.Clamp(nextX, minX, maxX);
    controlledExplorer.y = Phaser.Math.Clamp(nextY, minY, maxY);
    controlledExplorer.setFlipX(dx < 0);

    state.explorerPosition = {
      x: controlledExplorer.x,
      y: controlledExplorer.y,
    };
  }

  if (controller.shoulderLeftPressed && state.selectedCountry) {
    controllerCreatureIndex = (controllerCreatureIndex + state.selectedCountry.creatures.length - 1) % state.selectedCountry.creatures.length;
    setJournalHint(`Selected creature: ${state.selectedCountry.creatures[controllerCreatureIndex]}`);
  }
  if (controller.shoulderRightPressed && state.selectedCountry) {
    controllerCreatureIndex = (controllerCreatureIndex + 1) % state.selectedCountry.creatures.length;
    setJournalHint(`Selected creature: ${state.selectedCountry.creatures[controllerCreatureIndex]}`);
  }
  if (controller.actionPressed) {
    feedSelectedCreature();
  }
  if (controller.specialPressed) {
    learnFactWithController();
  }
  if (controller.startPressed) {
    saveJournalNoteWithController();
  }
  if (controller.confirmPressed) {
    if (state.learnedFact && state.savedNote) {
      finishExploreWithController();
      return;
    }
    inspectNearestHotspot();
  }

  if (controlledFollower) {
    const followDistanceX = controlledExplorer.flipX ? 30 : -30;
    const targetX = Phaser.Math.Clamp(controlledExplorer.x + followDistanceX, minX, maxX);
    const targetY = Phaser.Math.Clamp(controlledExplorer.y + 10, minY, maxY);
    const t = Math.min(1, delta / 120);
    controlledFollower.x = Phaser.Math.Linear(controlledFollower.x, targetX, t);
    controlledFollower.y = Phaser.Math.Linear(controlledFollower.y, targetY, t);
    controlledFollower.setFlipX(controlledExplorer.flipX);

    state.followerPosition = {
      x: controlledFollower.x,
      y: controlledFollower.y,
    };
  }

  if (!hazardSprites.length || !state.hazardAnimals.length) return;

  const timeNow = sceneRef.time.now;
  const hazardRadius = 22;
  const explorerRadius = 20;
  const hazardMinX = minX + 24;
  const hazardMaxX = maxX - 24;
  const hazardMinY = minY + 24;
  const hazardMaxY = maxY - 10;

  state.hazardAnimals.forEach((hazard, index) => {
    hazard.x += hazard.vx * (delta / 1000);
    hazard.y += hazard.vy * (delta / 1000);

    if (hazard.x < hazardMinX || hazard.x > hazardMaxX) {
      hazard.vx *= -1;
      hazard.x = Phaser.Math.Clamp(hazard.x, hazardMinX, hazardMaxX);
    }
    if (hazard.y < hazardMinY || hazard.y > hazardMaxY) {
      hazard.vy *= -1;
      hazard.y = Phaser.Math.Clamp(hazard.y, hazardMinY, hazardMaxY);
    }

    const sprite = hazardSprites[index];
    if (sprite) {
      sprite.x = hazard.x;
      sprite.y = hazard.y;
      sprite.setFlipX(hazard.vx < 0);
    }

    const distance = Phaser.Math.Distance.Between(
      controlledExplorer.x,
      controlledExplorer.y,
      hazard.x,
      hazard.y
    );

    if (distance < hazardRadius + explorerRadius && timeNow - state.lastDamageTime > 900) {
      state.lastDamageTime = timeNow;
      state.hitCount += 1;
      setJournalHint(`You bumped into a wild animal. Dodge them! Hits: ${state.hitCount}`);
      sceneRef.cameras.main.shake(140, 0.0022);
    }
  });
}
