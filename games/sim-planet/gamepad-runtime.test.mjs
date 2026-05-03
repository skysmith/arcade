import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const INDEX_HTML = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const ELEMENT_TAGS = new Map();

for (const match of INDEX_HTML.matchAll(/<([a-z0-9-]+)\b[^>]*\bid="([^"]+)"/gi)) {
  ELEMENT_TAGS.set(match[2], match[1]);
}

const ARCADE_HREF = INDEX_HTML.match(/\bid="arcade-link"[^>]*\bhref="([^"]+)"/)?.[1] || "../../index.html";

class MockClassList {
  constructor(element) {
    this.element = element;
    this.tokens = new Set();
  }

  setFromString(value) {
    this.tokens = new Set(String(value || "").split(/\s+/).filter(Boolean));
    this.sync();
  }

  sync() {
    this.element._className = [...this.tokens].join(" ");
  }

  add(...tokens) {
    for (const token of tokens) {
      if (token) {
        this.tokens.add(token);
      }
    }
    this.sync();
  }

  remove(...tokens) {
    for (const token of tokens) {
      this.tokens.delete(token);
    }
    this.sync();
  }

  contains(token) {
    return this.tokens.has(token);
  }

  toggle(token, force) {
    const shouldAdd = force === undefined ? !this.tokens.has(token) : Boolean(force);
    if (shouldAdd) {
      this.tokens.add(token);
    } else {
      this.tokens.delete(token);
    }
    this.sync();
    return shouldAdd;
  }
}

class MockEventTarget {
  constructor() {
    this.listeners = new Map();
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    this.listeners.set(type, listeners.filter((entry) => entry !== listener));
  }

  dispatchEvent(event) {
    event.target ??= this;
    event.currentTarget = this;
    for (const listener of this.listeners.get(event.type) || []) {
      listener.call(this, event);
    }
    return !event.defaultPrevented;
  }
}

class MockElement extends MockEventTarget {
  constructor(document, tagName = "div", id = "") {
    super();
    this.ownerDocument = document;
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.attributes = new Map();
    this.children = [];
    this.parentElement = null;
    this.style = {};
    this.disabled = false;
    this.title = "";
    this.type = "";
    this.offsetWidth = 960;
    this._textContent = "";
    this._className = "";
    this.classList = new MockClassList(this);
  }

  get className() {
    return this._className;
  }

  set className(value) {
    this.classList.setFromString(value);
  }

  get textContent() {
    if (this.children.length === 0) {
      return this._textContent;
    }
    return this.children.map((child) => child.textContent || "").join("");
  }

  set textContent(value) {
    this._textContent = String(value ?? "");
    this.children = [];
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name === "class") {
      this.className = value;
    } else if (name === "href") {
      this.href = String(value);
    } else {
      this[name] = String(value);
    }
  }

  getAttribute(name) {
    if (name === "class") {
      return this.className;
    }
    if (name === "href" && this.href) {
      return this.href;
    }
    return this.attributes.get(name) ?? null;
  }

  append(...nodes) {
    for (const node of nodes) {
      this.appendChild(typeof node === "string" ? this.ownerDocument.createTextNode(node) : node);
    }
  }

  appendChild(node) {
    node.parentElement = this;
    this.children.push(node);
    return node;
  }

  focus() {
    this.ownerDocument.activeElement = this;
  }

  click() {
    const event = {
      type: "click",
      target: this,
      currentTarget: this,
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
    };
    this.dispatchEvent(event);
  }

  closest(selector) {
    if (!selector?.startsWith(".")) {
      return null;
    }
    const className = selector.slice(1);
    let current = this;
    while (current) {
      if (current.classList?.contains(className)) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  getBoundingClientRect() {
    const width = Number.parseFloat(this.style.width) || this.width || 960;
    const height = Number.parseFloat(this.style.height) || this.height || 540;
    return { left: 0, top: 0, width, height };
  }
}

class MockTextNode {
  constructor(text) {
    this.textContent = String(text ?? "");
    this.parentElement = null;
  }
}

class MockCanvasElement extends MockElement {
  constructor(document, id) {
    super(document, "canvas", id);
    this.width = 960;
    this.height = 540;
    this.context = createMockContext();
    this.context.canvas = this;
  }

  getContext() {
    return this.context;
  }
}

class MockDocument extends MockEventTarget {
  constructor() {
    super();
    this.activeElement = null;
    this.title = "";
    this.elements = new Map();
    this.body = new MockElement(this, "body", "body");

    for (const [id, tagName] of ELEMENT_TAGS.entries()) {
      const element = tagName === "canvas"
        ? new MockCanvasElement(this, id)
        : new MockElement(this, tagName, id);
      if (id === "arcade-link") {
        element.setAttribute("href", ARCADE_HREF);
      }
      if (id === "playfield-shell" || id === "playfield-stage") {
        element.width = 960;
        element.height = 540;
      }
      this.elements.set(id, element);
    }
  }

  createElement(tagName) {
    return new MockElement(this, tagName);
  }

  createTextNode(text) {
    return new MockTextNode(text);
  }

  getElementById(id) {
    return this.elements.get(id) || null;
  }
}

function createMockContext() {
  const gradient = { addColorStop() {} };
  const methods = [
    "arc",
    "beginPath",
    "clip",
    "ellipse",
    "fill",
    "fillRect",
    "fillText",
    "lineTo",
    "moveTo",
    "quadraticCurveTo",
    "rect",
    "restore",
    "rotate",
    "save",
    "scale",
    "setLineDash",
    "setTransform",
    "stroke",
    "strokeRect",
    "translate",
  ];
  const context = {
    canvas: null,
    createRadialGradient() {
      return gradient;
    },
    measureText(text) {
      return { width: String(text).length * 8 };
    },
  };
  for (const method of methods) {
    context[method] = () => {};
  }
  return context;
}

function createMockPad(index, id = `Mock Controller ${index + 1}`) {
  return {
    id,
    index,
    connected: true,
    mapping: "standard",
    axes: [0, 0, 0, 0],
    buttons: Array.from({ length: 16 }, () => ({ pressed: false, value: 0 })),
  };
}

async function setupRuntime(caseName, options = {}) {
  const document = new MockDocument();
  const pads = [0, 1, 2, 3].map((index) => createMockPad(index));
  let now = 1_000;
  let nextFrame = null;
  const assignedHrefs = [];
  const storage = options.storage || new Map();
  const localStorage = {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      storage.set(key, String(value));
    },
    removeItem(key) {
      storage.delete(key);
    },
    clear() {
      storage.clear();
    },
  };

  const window = new MockEventTarget();
  window.document = document;
  window.devicePixelRatio = 1;
  window.visualViewport = new MockEventTarget();
  window.setTimeout = globalThis.setTimeout.bind(globalThis);
  window.clearTimeout = globalThis.clearTimeout.bind(globalThis);
  window.localStorage = localStorage;
  window.location = {
    href: "games/sim-planet/index.html",
    assign(href) {
      assignedHrefs.push(href);
      this.href = href;
    },
  };

  const navigator = {
    getGamepads() {
      return pads;
    },
  };
  window.navigator = navigator;

  const performance = {
    now() {
      return now;
    },
  };

  function requestAnimationFrame(callback) {
    nextFrame = callback;
    return 1;
  }

  Object.assign(globalThis, {
    window,
    document,
    performance,
    requestAnimationFrame,
    localStorage,
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: navigator,
  });

  await import(`./game.js?gamepad-runtime=${caseName}-${Date.now()}-${Math.random()}`);

  function frame(stepMs = 16) {
    assert.equal(typeof nextFrame, "function", "game loop should request the next animation frame");
    const callback = nextFrame;
    nextFrame = null;
    now += stepMs;
    callback(now);
  }

  frame();

  return {
    document,
    pads,
    window,
    storage,
    assignedHrefs,
    frame,
    sim: window.__simPlanet,
    setButton(index, button, pressed) {
      pads[index].buttons[button].pressed = pressed;
      pads[index].buttons[button].value = pressed ? 1 : 0;
    },
    setAxis(index, axis, value) {
      pads[index].axes[axis] = value;
    },
    release(index) {
      pads[index].axes = [0, 0, 0, 0];
      for (const button of pads[index].buttons) {
        button.pressed = false;
        button.value = 0;
      }
    },
  };
}

function activePlayers(sim) {
  return sim.getState().players.filter((player) => player.active);
}

function assertNoDuplicateViewportPlayers(state) {
  const ids = state.viewports.map((viewport) => viewport.playerId);
  assert.equal(new Set(ids).size, ids.length);
}

async function tapPad(runtime, index, button, framesHeld = 1) {
  runtime.setButton(index, button, true);
  for (let frame = 0; frame < framesHeld; frame += 1) {
    runtime.frame();
  }
  runtime.release(index);
  runtime.frame();
}

async function joinPad(runtime, index) {
  await tapPad(runtime, index, 0);
}

test("controller can start from the boot menu and activate the arcade back link", async () => {
  const startRuntime = await setupRuntime("menu-start");
  await joinPad(startRuntime, 0);
  await tapPad(startRuntime, 0, 0);
  const runningState = startRuntime.sim.getState();
  assert.equal(runningState.phase, "running");
  assert.equal(runningState.resources.population, 12);
  assert.equal(startRuntime.document.getElementById("population-value").textContent, "12.0M");
  assert.equal(runningState.hud.ordersOpen, true);
  assert.equal(runningState.hud.ordersSummary, "Next: Habitat");
  assert.equal(runningState.hud.recommendedBlueprintId, "habitat");
  assert.equal(startRuntime.sim.buildStructure("habitat"), true);
  assert.equal(startRuntime.sim.fundProject("survey-network"), false);
  assert.equal(startRuntime.sim.getState().projects.find((project) => project.id === "survey-network").level, 0);
  assert.equal(startRuntime.sim.getState().progression.discoveryCost.plasma, 8);

  const backRuntime = await setupRuntime("menu-back-link");
  await joinPad(backRuntime, 0);
  await tapPad(backRuntime, 0, 15);
  assert.equal(backRuntime.document.activeElement?.id, "arcade-link");
  assert.equal(backRuntime.sim.getState().input.bootMenuFocusIndex, 1);
  await tapPad(backRuntime, 0, 0);
  assert.deepEqual(backRuntime.assignedHrefs, [ARCADE_HREF]);
});

test("two mocked gamepads join and act independently", async () => {
  const runtime = await setupRuntime("two-player");
  await joinPad(runtime, 0);
  await joinPad(runtime, 1);
  await tapPad(runtime, 0, 0);

  let state = runtime.sim.getState();
  assert.equal(state.phase, "running");
  assert.deepEqual(activePlayers(runtime.sim).map((player) => player.controllerIndex), [0, 1]);

  runtime.setButton(0, 15, true);
  runtime.setButton(1, 14, true);
  runtime.frame();
  runtime.release(0);
  runtime.release(1);
  runtime.frame();

  state = runtime.sim.getState();
  const [p1, p2] = state.players;
  assert.notEqual(p1.selection.label, p2.selection.label);
  assert.equal(p1.selection.label, "Latch");
  assert.equal(p2.selection.label, "Reef");

  await tapPad(runtime, 0, 2);
  state = runtime.sim.getState();
  assert.equal(state.players[0].selection.kind, "structure");
  assert.equal(state.structures.some((structure) => structure.blueprintId === "habitat"), true);
  assert.equal(state.players[1].selection.label, "Reef");

  await tapPad(runtime, 1, 3);
  state = runtime.sim.getState();
  assert.equal(state.impactQueue.length, 1);
  assert.equal(state.impactQueue[0].ownerPlayerId, 2);

  await tapPad(runtime, 1, 9);
  assert.equal(runtime.sim.getState().paused, true);

  runtime.sim.reset();
  state = runtime.sim.getState();
  assert.equal(state.phase, "running");
  assert.equal(state.paused, false);
  assert.equal(state.elapsed, 0);
  assert.equal(state.impactQueue.length, 0);
  assert.deepEqual(activePlayers(runtime.sim).map((player) => player.controllerIndex), [0, 1]);
});

test("four active player slots render and update without exceptions", async () => {
  const runtime = await setupRuntime("four-player");
  for (let index = 0; index < 4; index += 1) {
    await joinPad(runtime, index);
  }
  await tapPad(runtime, 0, 0);

  for (let index = 0; index < 4; index += 1) {
    runtime.setButton(index, index % 2 === 0 ? 15 : 14, true);
  }
  runtime.frame();
  for (let index = 0; index < 4; index += 1) {
    runtime.release(index);
  }
  runtime.frame(33);
  runtime.frame(33);

  const state = runtime.sim.getState();
  assert.equal(state.phase, "running");
  assert.equal(activePlayers(runtime.sim).length, 4);
  assert.equal(state.viewports.length, 4);
  assert.equal(state.viewports.every((viewport) => viewport.mode === "quadrants"), true);
  assertNoDuplicateViewportPlayers(state);
  assert.equal(runtime.document.getElementById("player-panels").children.length, 4);
  assert.equal(runtime.document.getElementById("join-count-value").textContent, "4 players");
});

test("local asset actions support build, upgrade, and disassemble flow", async () => {
  const runtime = await setupRuntime("local-actions");
  await joinPad(runtime, 0);
  await tapPad(runtime, 0, 0);

  let state = runtime.sim.getState();
  assert.equal(state.focus.selection.kind, "body");
  assert.equal(state.focus.selection.item.label, "Morrow");
  assert.equal(state.focus.actions.some((action) => action.id === "build-habitat"), true);

  assert.equal(runtime.sim.buildSelectedLocalStructure("habitat"), true);
  state = runtime.sim.getState();
  let habitat = state.structures.find((structure) => structure.blueprintId === "habitat");
  assert.ok(habitat);
  assert.equal(habitat.anchorLabel, "Morrow");
  assert.equal(habitat.level, 1);
  assert.ok(habitat.rates.population > 0);
  assert.ok(habitat.population > 0);
  assert.ok(state.bodies.find((body) => body.label === "Morrow").population > 0);
  assert.equal(state.focus.actions.some((action) => action.id === "project-civic-growth"), true);
  assert.equal(state.focus.actions.some((action) => action.id === "upgrade-structure"), true);

  assert.equal(runtime.sim.upgradeStructure(habitat.label), true);
  state = runtime.sim.getState();
  habitat = state.structures.find((structure) => structure.label === habitat.label);
  assert.equal(habitat.level, 2);

  assert.equal(runtime.sim.disassembleStructure(habitat.label), true);
  state = runtime.sim.getState();
  assert.equal(state.structures.some((structure) => structure.label === habitat.label), false);
  assert.equal(state.focus.selection.kind, "body");
  assert.equal(state.focus.actions.some((action) => action.id === "build-habitat"), true);
});

test("campaign autosaves on quit and restores without resetting", async () => {
  const storage = new Map();
  const runtime = await setupRuntime("autosave-source", { storage });
  await joinPad(runtime, 0);
  await tapPad(runtime, 0, 0);

  assert.equal(runtime.sim.buildSelectedLocalStructure("habitat"), true);
  runtime.frame(1000);
  const savedPopulation = runtime.sim.getState().resources.population;
  assert.ok(savedPopulation > 12);
  runtime.window.dispatchEvent({ type: "pagehide" });
  assert.equal(storage.size, 1);

  const resumed = await setupRuntime("autosave-resume", { storage });
  let state = resumed.sim.getState();
  assert.equal(state.phase, "running");
  assert.equal(state.structures.some((structure) => structure.blueprintId === "habitat"), true);
  assert.equal(state.resources.population, savedPopulation);
  assert.equal(resumed.document.getElementById("boot-panel").classList.contains("is-hidden"), true);

  resumed.sim.start();
  state = resumed.sim.getState();
  assert.equal(state.structures.some((structure) => structure.blueprintId === "habitat"), true);

  resumed.sim.reset();
  assert.equal(storage.size, 0);

  const fresh = await setupRuntime("autosave-after-reset", { storage });
  state = fresh.sim.getState();
  assert.equal(state.phase, "boot");
  assert.equal(state.structures.length, 0);
});

test("opening run starts in a local-orbit tech era with late-game-only warp progression", async () => {
  const runtime = await setupRuntime("progression-ladder");
  await joinPad(runtime, 0);
  await tapPad(runtime, 0, 0);

  let state = runtime.sim.getState();
  assert.equal(state.structures.length, 0);
  assert.equal(state.hud.objective.title, "Build Habitat");
  assert.equal(runtime.document.getElementById("travel-state-value").textContent, "Local Era");

  const surveyArray = state.blueprints.find((blueprint) => blueprint.id === "survey-array");
  const massDriver = state.blueprints.find((blueprint) => blueprint.id === "mass-driver");
  const solarLifter = state.blueprints.find((blueprint) => blueprint.id === "solar-lifter");
  const oNeillCylinder = state.blueprints.find((blueprint) => blueprint.id === "o-neill-cylinder");
  const syntheticWorld = state.blueprints.find((blueprint) => blueprint.id === "synthetic-world");
  const civicGrowth = state.projects.find((project) => project.id === "civic-growth");
  const roboticAutomation = state.projects.find((project) => project.id === "robotic-automation");
  const relays = state.projects.find((project) => project.id === "deep-space-relays");
  const singularityTheory = state.projects.find((project) => project.id === "singularity-theory");
  const warpDrives = state.projects.find((project) => project.id === "warp-drives");
  assert.ok(surveyArray);
  assert.ok(massDriver);
  assert.ok(solarLifter);
  assert.ok(oNeillCylinder);
  assert.ok(syntheticWorld);
  assert.ok(civicGrowth);
  assert.ok(roboticAutomation);
  assert.ok(relays);
  assert.ok(singularityTheory);
  assert.ok(warpDrives);
  assert.equal(surveyArray.canBuild, false);
  assert.equal(massDriver.canBuild, false);
  assert.equal(solarLifter.canBuild, false);
  assert.equal(oNeillCylinder.canBuild, false);
  assert.equal(syntheticWorld.canBuild, false);
  assert.equal(civicGrowth.canFund, false);
  assert.equal(roboticAutomation.canFund, false);
  assert.ok(oNeillCylinder.rates.population > 0);
  assert.ok(syntheticWorld.rates.population > 0);
  assert.equal(relays.canFund, false);
  assert.equal(singularityTheory.canFund, false);
  assert.equal(warpDrives.canFund, false);
  assert.equal(surveyArray.missingRequirements.includes("Shipyard Cradle"), true);
  assert.equal(surveyArray.missingRequirements.includes("Orbital Refueling L1"), true);
  assert.equal(massDriver.missingRequirements.includes("Survey Array"), true);
  assert.equal(massDriver.missingRequirements.includes("Asteroid Prospecting L1"), true);
  assert.equal(solarLifter.missingRequirements.includes("Solar Lifting Rig"), true);
  assert.equal(solarLifter.missingRequirements.includes("Asteroid Refineries L1"), true);
  assert.equal(oNeillCylinder.missingRequirements.includes("Habitat Ring"), true);
  assert.equal(oNeillCylinder.missingRequirements.includes("Megahabitat Charters L1"), true);
  assert.equal(syntheticWorld.missingRequirements.includes("O'Neill Cylinder"), true);
  assert.equal(syntheticWorld.missingRequirements.includes("Synthetic Ecologies L1"), true);
  assert.equal(civicGrowth.missingRequirements.includes("Habitat Ring"), true);
  assert.equal(roboticAutomation.missingRequirements.includes("Shipyard Cradle"), true);
  assert.equal(roboticAutomation.missingRequirements.includes("Logistics Spine L1"), true);
  assert.equal(relays.track, "Science");
  assert.equal(relays.missingRequirements.includes("Survey Array"), true);
  assert.equal(singularityTheory.missingRequirements.includes("Synthetic World"), true);
  assert.equal(warpDrives.track, "Engineering");
  assert.equal(warpDrives.missingRequirements.includes("Shipyard Cradle"), true);
  assert.equal(warpDrives.missingRequirements.includes("Singularity Theory L1"), true);

  assert.equal(runtime.sim.buildSelectedLocalStructure("habitat"), true);
  state = runtime.sim.getState();
  const habitatAfterBuild = state.structures.find((structure) => structure.blueprintId === "habitat");
  const basePopulationRate = habitatAfterBuild.rates.population;
  assert.equal(runtime.sim.fundProject("civic-growth"), true);
  state = runtime.sim.getState();
  const habitatAfterCivic = state.structures.find((structure) => structure.label === habitatAfterBuild.label);
  assert.ok(habitatAfterCivic.rates.population > basePopulationRate);
  assert.equal(state.structures.some((structure) => structure.blueprintId === "survey-array"), false);
  assert.equal(state.hud.objective.title === "Grow Crew" || state.hud.objective.title === "Build Shipyard", true);
  assert.equal(runtime.document.getElementById("discovery-value").textContent.includes("refueling"), true);
});

test("planet deck opens on A and controller focus can execute local world actions", async () => {
  const runtime = await setupRuntime("body-deck");
  await joinPad(runtime, 0);
  await tapPad(runtime, 0, 0);

  let state = runtime.sim.getState();
  assert.equal(state.focus.selection.kind, "body");
  assert.equal(state.focus.selection.item.label, "Morrow");
  assert.equal(state.focus.menuOpen, false);
  assert.equal(state.focus.actions[0].id, "build-habitat");
  assert.equal(runtime.document.getElementById("command-panel").hidden, true);

  await tapPad(runtime, 0, 0);
  state = runtime.sim.getState();
  assert.equal(state.focus.menuOpen, true);
  assert.equal(state.focus.actionIndex, 0);
  assert.equal(state.focus.actions[0].focused, true);
  assert.equal(runtime.document.getElementById("command-panel").hidden, false);

  await tapPad(runtime, 0, 15);
  state = runtime.sim.getState();
  assert.equal(state.focus.menuOpen, true);
  assert.equal(state.focus.actionIndex, 1);
  assert.equal(state.focus.actions[1].focused, true);
  assert.equal(state.focus.actions[1].id, "build-collector");

  await tapPad(runtime, 0, 0);
  state = runtime.sim.getState();
  const collector = state.structures.find((structure) => structure.blueprintId === "collector");
  assert.ok(collector);
  assert.equal(collector.anchorLabel, "Morrow");
  assert.equal(state.focus.selection.kind, "structure");
  assert.equal(state.focus.selection.item.label, collector.label);
  assert.equal(state.focus.menuOpen, false);
  assert.equal(state.hud.outcome.title, `${collector.label} online`);
  assert.match(state.hud.outcome.now, /Boost Collectors/);
  assert.match(runtime.document.getElementById("outcome-now-value").textContent, /Boost Collectors/);
  assert.equal(runtime.document.getElementById("outcome-report").hidden, false);
});

test("shoulder buttons split world and orbital lanes for controller navigation", async () => {
  const runtime = await setupRuntime("lane-shoulders");
  await joinPad(runtime, 0);
  await tapPad(runtime, 0, 0);

  assert.equal(runtime.sim.buildSelectedLocalStructure("habitat"), true);
  let state = runtime.sim.getState();
  const habitat = state.structures.find((structure) => structure.blueprintId === "habitat");
  assert.ok(habitat);
  assert.equal(state.focus.selection.kind, "structure");
  assert.equal(state.focus.selection.item.label, habitat.label);

  await tapPad(runtime, 0, 4);
  state = runtime.sim.getState();
  assert.equal(state.focus.selection.kind, "body");
  assert.equal(state.focus.selection.item.label, "Morrow");

  await tapPad(runtime, 0, 5);
  state = runtime.sim.getState();
  assert.equal(state.focus.selection.kind, "structure");
  assert.equal(state.focus.selection.item.label, habitat.label);
});

test("structure deck opens on A and controller focus moves across local actions", async () => {
  const runtime = await setupRuntime("structure-deck");
  await joinPad(runtime, 0);
  await tapPad(runtime, 0, 0);

  assert.equal(runtime.sim.buildSelectedLocalStructure("habitat"), true);
  let state = runtime.sim.getState();
  let habitat = state.structures.find((structure) => structure.blueprintId === "habitat");
  assert.ok(habitat);

  runtime.sim.selectObject("structure", habitat.label);
  state = runtime.sim.getState();
  assert.equal(state.focus.menuOpen, false);
  assert.equal(state.focus.actionIndex, 0);
  assert.equal(state.focus.actions[0].id, "run-structure");

  await tapPad(runtime, 0, 0);
  state = runtime.sim.getState();
  assert.equal(state.focus.menuOpen, true);
  assert.equal(state.focus.actionIndex, 0);
  assert.equal(state.focus.actions[0].focused, true);

  await tapPad(runtime, 0, 15);
  state = runtime.sim.getState();
  assert.equal(state.focus.menuOpen, true);
  assert.equal(state.focus.actionIndex, 1);
  assert.equal(state.focus.actions[1].id, "upgrade-structure");
  assert.equal(state.focus.actions[1].focused, true);

  await tapPad(runtime, 0, 0);
  state = runtime.sim.getState();
  habitat = state.structures.find((structure) => structure.label === habitat.label);
  assert.equal(habitat.level, 2);
  assert.equal(state.focus.menuOpen, true);
  assert.equal(state.focus.actions[1].focused, true);

  await tapPad(runtime, 0, 1);
  state = runtime.sim.getState();
  assert.equal(state.focus.menuOpen, false);
});
