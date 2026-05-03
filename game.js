const BUILD_NUMBER = "2026.04.13.1";
const GRID_COLUMNS_DESKTOP = 3;
const NAV_THRESHOLD = 0.4;
const MAPPING_STORAGE_KEY = "arcade-controller-mapping-v1";
const MAPPING_ACTIONS = ["up", "down", "left", "right", "confirm"];
const DEFAULT_MAPPING = {
  up: [{ type: "button", index: 12 }, { type: "axis", index: 1, direction: -1 }, { type: "axis", index: 3, direction: -1 }, { type: "axis", index: 7, direction: -1 }],
  down: [{ type: "button", index: 13 }, { type: "axis", index: 1, direction: 1 }, { type: "axis", index: 3, direction: 1 }, { type: "axis", index: 7, direction: 1 }],
  left: [{ type: "button", index: 14 }, { type: "axis", index: 0, direction: -1 }],
  right: [{ type: "button", index: 15 }, { type: "axis", index: 0, direction: 1 }],
  confirm: [{ type: "button", index: 0 }, { type: "button", index: 1 }, { type: "button", index: 2 }, { type: "button", index: 3 }, { type: "button", index: 9 }],
};

function cloneDefaultMapping() {
  return JSON.parse(JSON.stringify(DEFAULT_MAPPING));
}

function loadStoredMapping() {
  try {
    const raw = window.localStorage.getItem(MAPPING_STORAGE_KEY);
    if (!raw) return cloneDefaultMapping();
    const parsed = JSON.parse(raw);
    const mapping = cloneDefaultMapping();
    MAPPING_ACTIONS.forEach((action) => {
      if (Array.isArray(parsed[action]) && parsed[action].length > 0) {
        mapping[action] = parsed[action];
      }
    });
    return mapping;
  } catch (_error) {
    return cloneDefaultMapping();
  }
}

function saveStoredMapping(mapping) {
  try {
    window.localStorage.setItem(MAPPING_STORAGE_KEY, JSON.stringify(mapping));
  } catch (_error) {
    // Ignore storage failures and keep the live mapping for this session.
  }
}

function buttonPressed(pad, index) {
  return Boolean(pad.buttons[index] && pad.buttons[index].pressed);
}

function axisValue(pad, index) {
  return pad.axes[index] || 0;
}

function strongestVerticalAxis(pad) {
  const candidates = [axisValue(pad, 1), axisValue(pad, 3), axisValue(pad, 7)];
  return candidates.reduce((strongest, value) => (
    Math.abs(value) > Math.abs(strongest) ? value : strongest
  ), 0);
}

const LEGACY_GAMES = [];

const CONNECTIONS_INDEX_PATH = "./arcade.connections.json";

const ui = {
  menuToggle: document.getElementById("menu-toggle"),
  menuBackdrop: document.getElementById("menu-backdrop"),
  startMenu: document.getElementById("start-menu"),
  menuClose: document.getElementById("menu-close"),
  fullscreenToggle: document.getElementById("fullscreen-toggle"),
  fullscreenStatus: document.getElementById("fullscreen-status"),
  buildChip: document.getElementById("build-chip"),
  gameGrid: document.getElementById("game-grid"),
};

const state = {
  games: LEGACY_GAMES.slice(),
  selectedIndex: 0,
  selectedGamepadIndex: null,
  firstConnectedGamepadIndex: null,
  activeGamepadIndex: null,
  gamepadNavigationArmed: false,
  controllerSnapshot: {},
  menuOpen: false,
  mapping: loadStoredMapping(),
};

ui.buildChip.textContent = `build ${BUILD_NUMBER}`;

function activeGames() {
  return state.games.filter((game) => !game.hidden);
}

function openStartMenu() {
  state.menuOpen = true;
  ui.startMenu.hidden = false;
  ui.menuBackdrop.hidden = false;
  ui.startMenu.setAttribute("aria-hidden", "false");
  ui.menuToggle?.setAttribute("aria-expanded", "true");
}

function closeStartMenu() {
  state.menuOpen = false;
  ui.startMenu.hidden = true;
  ui.menuBackdrop.hidden = true;
  ui.startMenu.setAttribute("aria-hidden", "true");
  ui.menuToggle?.setAttribute("aria-expanded", "false");
  focusLauncher();
}

function toggleStartMenu() {
  if (state.menuOpen) {
    closeStartMenu();
  } else {
    openStartMenu();
  }
}

function normalizeGameEntry(game) {
  if (!game || typeof game !== "object") {
    return null;
  }

  if (!game.id || !game.title || !game.path) {
    return null;
  }

  return {
    id: String(game.id),
    title: String(game.title),
    image: String(game.image || "./assets/covers/landmines.svg"),
    summary: String(game.summary || ""),
    players: String(game.players || "1 local"),
    controls: String(game.controls || "Keyboard"),
    launchText: String(game.launchText || "Open cabinet"),
    path: String(game.path),
    badge: String(game.badge || "Cabinet"),
    hidden: Boolean(game.hidden),
  };
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status}`);
  }
  return response.json();
}

async function loadConnectedGames() {
  try {
    const connectionPaths = await fetchJson(CONNECTIONS_INDEX_PATH);
    if (!Array.isArray(connectionPaths)) {
      return [];
    }

    const loadedEntries = await Promise.all(
      connectionPaths.map(async (path) => {
        try {
          const entry = normalizeGameEntry(await fetchJson(path));
          return entry;
        } catch (_error) {
          return null;
        }
      })
    );

    const manifestGames = loadedEntries.filter(Boolean);
    return manifestGames;
  } catch (_error) {
    return [];
  }
}

function focusLauncher() {
  if (typeof window.focus === "function") {
    window.focus();
  }
}

function fullscreenActive() {
  return document.fullscreenElement === document.documentElement;
}

function fullscreenSupported() {
  return typeof document.documentElement.requestFullscreen === "function";
}

function syncFullscreenUi() {
  if (!ui.fullscreenToggle || !ui.fullscreenStatus) return;
  const supported = fullscreenSupported();
  ui.fullscreenToggle.disabled = !supported;
  document.body.classList.toggle("is-fullscreen", supported && fullscreenActive());
  if (!supported) {
    ui.fullscreenToggle.textContent = "Unavailable";
    ui.fullscreenStatus.textContent = "This browser does not support fullscreen here.";
    return;
  }

  const active = fullscreenActive();
  ui.fullscreenToggle.textContent = active ? "Exit Full Screen" : "Full Screen";
  ui.fullscreenStatus.textContent = active
    ? "Arcade is filling the screen. Press Esc to leave fullscreen."
    : "Open Arcade in browser fullscreen mode.";
}

async function toggleFullscreen() {
  if (!fullscreenSupported()) {
    syncFullscreenUi();
    return;
  }

  try {
    if (fullscreenActive()) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen({ navigationUI: "hide" });
    }
  } catch (_error) {
    // Ignore browser permission or gesture failures and leave the menu responsive.
  }

  syncFullscreenUi();
}

function mappingActionPressed(pad, action) {
  const triggers = state.mapping[action] || [];
  return triggers.some((trigger) => {
    if (trigger.type === "button") {
      return buttonPressed(pad, trigger.index);
    }
    if (trigger.type === "axis") {
      const value = axisValue(pad, trigger.index);
      return trigger.direction < 0 ? value <= -NAV_THRESHOLD : value >= NAV_THRESHOLD;
    }
    return false;
  });
}

function renderGrid() {
  const games = activeGames();
  ui.gameGrid.replaceChildren();
  games.forEach((game, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "game-card";
    card.dataset.index = String(index);
    card.tabIndex = index === state.selectedIndex ? 0 : -1;
    card.setAttribute("role", "option");
    card.setAttribute("aria-selected", String(index === state.selectedIndex));
    card.setAttribute("aria-label", game.title);
    card.innerHTML = `
      <img class="game-image" src="${game.image}" alt="" />
      <div class="game-overlay">
        <div class="game-copy">
          <span class="game-kicker">Cabinet</span>
          <h2 class="game-title">${game.title}</h2>
        </div>
        <span class="game-pill">${game.badge}</span>
      </div>
    `;
    card.addEventListener("click", () => {
      selectGame(index);
      navigateToGame(index);
    });
    card.addEventListener("mouseenter", () => {
      selectGame(index, false);
    });
    ui.gameGrid.append(card);
  });
  syncSelectionUi();
}

function currentGame() {
  return activeGames()[state.selectedIndex];
}

function navigateToGame(index) {
  const game = activeGames()[index];
  if (!game) return;
  window.location.href = game.path;
}

function syncSelectionUi(scrollIntoView = true) {
  const cards = ui.gameGrid.querySelectorAll(".game-card");
  cards.forEach((card, index) => {
    const selected = index === state.selectedIndex;
    card.classList.toggle("is-selected", selected);
    card.tabIndex = selected ? 0 : -1;
    card.setAttribute("aria-selected", String(selected));
    if (selected && scrollIntoView) {
      card.scrollIntoView({ block: "nearest", inline: "nearest" });
      card.focus({ preventScroll: true });
    }
  });
}

function selectGame(index, scrollIntoView = true) {
  const games = activeGames();
  const clamped = Math.max(0, Math.min(games.length - 1, index));
  if (clamped === state.selectedIndex && scrollIntoView) {
    syncSelectionUi(true);
    return;
  }
  state.selectedIndex = clamped;
  syncSelectionUi(scrollIntoView);
}

function columnCount() {
  if (window.innerWidth <= 720) return 1;
  if (window.innerWidth <= 1080) return 2;
  return GRID_COLUMNS_DESKTOP;
}

function moveSelection(direction) {
  const games = activeGames();
  const columns = columnCount();
  const rows = Math.ceil(games.length / columns);
  const row = Math.floor(state.selectedIndex / columns);
  const col = state.selectedIndex % columns;

  let nextIndex = state.selectedIndex;
  if (direction === "left") {
    nextIndex = row * columns + Math.max(0, col - 1);
  } else if (direction === "right") {
    nextIndex = row * columns + Math.min(columns - 1, col + 1);
  } else if (direction === "up") {
    nextIndex = Math.max(0, (row - 1) * columns + col);
  } else if (direction === "down") {
    nextIndex = Math.min(games.length - 1, Math.min(rows - 1, row + 1) * columns + col);
  }

  if (nextIndex >= games.length) {
    nextIndex = games.length - 1;
  }
  if (nextIndex !== state.selectedIndex) {
    selectGame(nextIndex);
  }
}

function launchSelectedGame() {
  navigateToGame(state.selectedIndex);
}

function getAvailableGamepads() {
  const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()) : [];
  return pads.filter(Boolean);
}

function refreshControllerOptions() {
  return getAvailableGamepads();
}

function gamepadHasActivity(pad) {
  if (!pad) return false;
  if (pad.buttons.some((button) => button && button.pressed)) return true;
  return pad.axes.some((axis) => Math.abs(axis || 0) > 0.35);
}

function pickGamepad() {
  const pads = getAvailableGamepads();
  if (state.selectedGamepadIndex !== null) {
    const explicit = pads.find((pad) => pad.index === state.selectedGamepadIndex);
    if (explicit) return explicit;
  }
  if (state.firstConnectedGamepadIndex !== null) {
    const firstConnected = pads.find((pad) => pad.index === state.firstConnectedGamepadIndex);
    if (firstConnected) return firstConnected;
  }
  return pads[0] || null;
}

function edgeTrigger(name, pressed) {
  const previous = state.controllerSnapshot[name] || false;
  state.controllerSnapshot[name] = pressed;
  return pressed && !previous;
}

function updateControllerStatus() {
  const pads = getAvailableGamepads();
  const pad = pickGamepad();
  return pad || null;
}

function handleGamepadNavigation(pad) {
  if (!pad) return;

  if (state.activeGamepadIndex !== pad.index) {
    state.activeGamepadIndex = pad.index;
    state.gamepadNavigationArmed = false;
    state.controllerSnapshot = {};
  }

  // Require the pad to return to neutral before the launcher accepts input.
  // This prevents a held confirm/start button from immediately reopening Tetris
  // when a cabinet sends the player back to the arcade shelf.
  if (!state.gamepadNavigationArmed) {
    if (gamepadHasActivity(pad)) {
      return;
    }
    state.gamepadNavigationArmed = true;
    state.controllerSnapshot = {};
    return;
  }

  const menuPressed = buttonPressed(pad, 9) || buttonPressed(pad, 8);
  const backPressed = buttonPressed(pad, 1) || buttonPressed(pad, 9) || buttonPressed(pad, 8);
  const menuConfirmPressed = buttonPressed(pad, 0);
  if (edgeTrigger("menu", menuPressed)) {
    toggleStartMenu();
    return;
  }
  if (state.menuOpen) {
    if (edgeTrigger("menu-back", backPressed)) {
      closeStartMenu();
      return;
    }
    if (edgeTrigger("menu-confirm", menuConfirmPressed)) {
      void toggleFullscreen();
    }
    return;
  }

  const leftPressed = mappingActionPressed(pad, "left");
  const rightPressed = mappingActionPressed(pad, "right");
  const upPressed = mappingActionPressed(pad, "up");
  const downPressed = mappingActionPressed(pad, "down");

  if (edgeTrigger("left", leftPressed)) moveSelection("left");
  if (edgeTrigger("right", rightPressed)) moveSelection("right");
  if (edgeTrigger("up", upPressed)) moveSelection("up");
  if (edgeTrigger("down", downPressed)) moveSelection("down");

  const confirmPressed = mappingActionPressed(pad, "confirm");
  if (edgeTrigger("confirm", confirmPressed)) {
    launchSelectedGame();
  }
}

function onKeyDown(event) {
  if (event.defaultPrevented) return;

  const verticalKeys = new Set(["ArrowUp", "ArrowDown", "w", "W", "s", "S"]);
  const horizontalKeys = new Set(["ArrowLeft", "ArrowRight", "a", "A", "d", "D"]);
  const confirmKeys = new Set(["Enter", " "]);
  const menuKeys = new Set(["Escape"]);

  if (verticalKeys.has(event.key) || horizontalKeys.has(event.key) || confirmKeys.has(event.key) || menuKeys.has(event.key)) {
    event.preventDefault();
  }

  if (event.key === "Escape") {
    toggleStartMenu();
    return;
  }

  if (state.menuOpen) {
    if (event.key === "b" || event.key === "B") {
      closeStartMenu();
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      void toggleFullscreen();
    }
    return;
  }

  if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") moveSelection("left");
  if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") moveSelection("right");
  if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") moveSelection("up");
  if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") moveSelection("down");
  if (confirmKeys.has(event.key)) launchSelectedGame();
}

function bindUi() {
  window.addEventListener("pointerdown", focusLauncher);
  window.addEventListener("mousedown", focusLauncher);
  window.addEventListener("touchstart", focusLauncher, { passive: true });
  ui.menuToggle?.addEventListener("click", toggleStartMenu);
  ui.menuClose?.addEventListener("click", closeStartMenu);
  ui.menuBackdrop?.addEventListener("click", closeStartMenu);
  ui.fullscreenToggle?.addEventListener("click", () => {
    void toggleFullscreen();
  });
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", () => syncSelectionUi(false));
  document.addEventListener("fullscreenchange", syncFullscreenUi);
  window.addEventListener("gamepadconnected", (event) => {
    if (state.firstConnectedGamepadIndex === null) {
      state.firstConnectedGamepadIndex = event.gamepad.index;
    }
    refreshControllerOptions();
  });
  window.addEventListener("gamepaddisconnected", (event) => {
    if (state.firstConnectedGamepadIndex === event.gamepad.index) {
      const remaining = getAvailableGamepads().filter((pad) => pad.index !== event.gamepad.index);
      state.firstConnectedGamepadIndex = remaining[0]?.index ?? null;
      state.controllerSnapshot = {};
    }
    if (state.activeGamepadIndex === event.gamepad.index) {
      state.activeGamepadIndex = null;
      state.gamepadNavigationArmed = false;
      state.controllerSnapshot = {};
    }
    refreshControllerOptions();
  });
}

function frame() {
  const pad = updateControllerStatus();
  handleGamepadNavigation(pad);
  requestAnimationFrame(frame);
}

async function init() {
  state.games = await loadConnectedGames();
  if (state.selectedIndex >= activeGames().length) {
    state.selectedIndex = 0;
  }
  renderGrid();
  refreshControllerOptions();
  bindUi();
  syncSelectionUi(false);
  syncFullscreenUi();
  focusLauncher();
  window.setInterval(() => {
    const pad = updateControllerStatus();
    handleGamepadNavigation(pad);
  }, 120);
  requestAnimationFrame(frame);
}

init();
