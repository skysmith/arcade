(function initArcadeHome() {
  function deriveArcadeHref(script) {
    const cabinetMatch = window.location.pathname.match(/^(.*)\/games\/[^/]+\/index\.html$/);
    if (cabinetMatch) {
      const prefix = cabinetMatch[1] || "";
      return new URL(`${prefix}/index.html`, window.location.origin).href;
    }

    if (script?.dataset.arcadeHref) {
      return new URL(script.dataset.arcadeHref, window.location.href).href;
    }

    const match = window.location.pathname.match(/^(.*\/arcade)\/games\/[^/]+\/index\.html$/);
    if (match) {
      return new URL(`${match[1]}/index.html`, window.location.origin).href;
    }

    if (script?.src) {
      return new URL("../index.html", script.src).href;
    }

    return new URL("../../index.html", window.location.href).href;
  }

  const script = document.currentScript
    || document.querySelector('script[data-arcade-href][src*="arcade-home.js"]')
    || document.querySelector('script[src*="arcade-home.js"]');
  const arcadeHref = deriveArcadeHref(script);
  const label = script?.dataset.arcadeLabel || "Arcade";
  const controllerState = {};
  const defaultPauseOptions = [
    { id: "resume", label: "Resume Game", run: () => closePauseMenu() },
    { id: "arcade", label: "Back To Arcade", run: () => navigateToArcade() },
  ];
  let pauseOptions = defaultPauseOptions.slice();
  let pauseSelection = 0;
  let pauseOpen = false;
  const highScoreStoragePrefix = "arcade.highscores.";
  const maxHighScores = 10;
  let resultSelection = 0;
  let resultsOpen = false;
  let resultsContext = null;

  if (!document.body || document.querySelector("[data-arcade-home]")) {
    return;
  }

  const style = document.createElement("style");
  style.textContent = `
    .arcade-home-link {
      position: fixed;
      top: 16px;
      left: 16px;
      z-index: 2147483647;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.16);
      background: rgba(8, 13, 24, 0.84);
      color: #f4f7ff;
      box-shadow: 0 14px 36px rgba(2, 6, 14, 0.34);
      backdrop-filter: blur(14px);
      font: 700 14px/1.1 "Avenir Next", "Segoe UI", sans-serif;
      text-decoration: none;
      letter-spacing: 0.04em;
    }

    .arcade-home-link::before {
      content: "";
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: radial-gradient(circle at 35% 35%, #fff7cf, #ffc65a 58%, #c96937 100%);
      box-shadow: 0 0 14px rgba(255, 198, 90, 0.6);
      flex: 0 0 auto;
    }

    .arcade-home-link:focus-visible,
    .arcade-home-link:hover {
      outline: none;
      border-color: rgba(139, 232, 255, 0.65);
      transform: translateY(-1px);
    }

    @media (max-width: 720px) {
      .arcade-home-link {
        top: auto;
        bottom: 16px;
        left: 16px;
        padding: 9px 12px;
        font-size: 13px;
      }
    }

    .arcade-pause-overlay[hidden] {
      display: none;
    }

    .arcade-pause-overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483646;
      display: grid;
      place-items: center;
      padding: 20px;
      background: rgba(4, 8, 16, 0.62);
      backdrop-filter: blur(10px);
    }

    .arcade-pause-card {
      width: min(360px, 100%);
      display: grid;
      gap: 14px;
      padding: 20px;
      border-radius: 22px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      background: rgba(8, 13, 24, 0.92);
      box-shadow: 0 24px 80px rgba(2, 6, 14, 0.42);
      color: #f4f7ff;
      font-family: "Avenir Next", "Segoe UI", sans-serif;
    }

    .arcade-pause-eyebrow {
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-size: 0.72rem;
      color: #8be8ff;
    }

    .arcade-pause-title,
    .arcade-pause-copy {
      margin: 0;
    }

    .arcade-pause-copy {
      color: rgba(244, 247, 255, 0.72);
      line-height: 1.4;
    }

    .arcade-pause-actions {
      display: grid;
      gap: 10px;
    }

    .arcade-pause-button {
      width: 100%;
      padding: 13px 14px;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.04);
      color: inherit;
      text-align: left;
      font: 700 15px/1.1 "Avenir Next", "Segoe UI", sans-serif;
      cursor: pointer;
    }

    .arcade-pause-button.is-selected,
    .arcade-pause-button:focus-visible {
      outline: none;
      border-color: rgba(139, 232, 255, 0.72);
      box-shadow: 0 0 0 2px rgba(139, 232, 255, 0.18);
      transform: translateY(-1px);
    }

    .arcade-results-overlay[hidden] {
      display: none;
    }

    .arcade-results-overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: grid;
      place-items: center;
      padding: 20px;
      background: rgba(4, 8, 16, 0.78);
      backdrop-filter: blur(14px);
    }

    .arcade-results-card {
      width: min(520px, 100%);
      display: grid;
      gap: 16px;
      padding: 22px;
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      background: rgba(8, 13, 24, 0.96);
      box-shadow: 0 24px 80px rgba(2, 6, 14, 0.48);
      color: #f4f7ff;
      font-family: "Avenir Next", "Segoe UI", sans-serif;
    }

    .arcade-results-header,
    .arcade-results-copy,
    .arcade-results-scoreline,
    .arcade-results-subtitle,
    .arcade-results-empty {
      margin: 0;
    }

    .arcade-results-header {
      display: grid;
      gap: 6px;
    }

    .arcade-results-subtitle {
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-size: 0.72rem;
      color: #8be8ff;
    }

    .arcade-results-copy,
    .arcade-results-empty {
      color: rgba(244, 247, 255, 0.72);
      line-height: 1.4;
    }

    .arcade-results-scoreline {
      font-size: 1.05rem;
      font-weight: 700;
      color: #ffe18e;
    }

    .arcade-results-leaderboard {
      display: grid;
      gap: 10px;
    }

    .arcade-results-list {
      display: grid;
      gap: 8px;
      padding: 0;
      margin: 0;
      list-style: none;
    }

    .arcade-results-entry {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 10px;
      align-items: center;
      padding: 10px 12px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .arcade-results-rank {
      font-size: 0.78rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(244, 247, 255, 0.58);
    }

    .arcade-results-name {
      font-weight: 700;
    }

    .arcade-results-score {
      color: #8be8ff;
      font-weight: 700;
    }

    .arcade-results-name-picker {
      display: grid;
      gap: 10px;
      padding: 14px;
      border-radius: 16px;
      background: rgba(139, 232, 255, 0.07);
      border: 1px solid rgba(139, 232, 255, 0.18);
    }

    .arcade-results-name-options,
    .arcade-results-actions {
      display: grid;
      gap: 10px;
    }

    .arcade-results-input-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 10px;
    }

    .arcade-results-input {
      min-width: 0;
      padding: 12px 14px;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.04);
      color: #f4f7ff;
      font: 600 15px/1.1 "Avenir Next", "Segoe UI", sans-serif;
    }

    .arcade-results-button {
      width: 100%;
      padding: 13px 14px;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.04);
      color: inherit;
      text-align: left;
      font: 700 15px/1.1 "Avenir Next", "Segoe UI", sans-serif;
      cursor: pointer;
    }

    .arcade-results-button.is-selected,
    .arcade-results-button:focus-visible {
      outline: none;
      border-color: rgba(139, 232, 255, 0.72);
      box-shadow: 0 0 0 2px rgba(139, 232, 255, 0.18);
      transform: translateY(-1px);
    }
  `;

  const link = document.createElement("a");
  link.href = arcadeHref;
  link.className = "arcade-home-link";
  link.dataset.arcadeHome = "true";
  link.textContent = label;
  link.setAttribute("aria-label", `${label} home`);
  link.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.assign(arcadeHref);
  });

  const overlay = document.createElement("div");
  overlay.className = "arcade-pause-overlay";
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="arcade-pause-card" role="dialog" aria-modal="true" aria-labelledby="arcade-pause-title">
      <p class="arcade-pause-eyebrow">Pause Menu</p>
      <h2 id="arcade-pause-title" class="arcade-pause-title">Where to next?</h2>
      <p class="arcade-pause-copy">Use the d-pad or stick to choose. Press B or Start again to head back to Arcade.</p>
      <div class="arcade-pause-actions"></div>
    </div>
  `;

  const resultsOverlay = document.createElement("div");
  resultsOverlay.className = "arcade-results-overlay";
  resultsOverlay.hidden = true;
  resultsOverlay.innerHTML = `
    <div class="arcade-results-card" role="dialog" aria-modal="true" aria-labelledby="arcade-results-title">
      <div class="arcade-results-header">
        <p class="arcade-results-subtitle" id="arcade-results-kicker">Game Over</p>
        <h2 id="arcade-results-title" class="arcade-results-title">Cabinet complete</h2>
        <p class="arcade-results-scoreline" id="arcade-results-scoreline"></p>
        <p class="arcade-results-copy" id="arcade-results-copy"></p>
      </div>
      <section class="arcade-results-leaderboard">
        <h3 class="arcade-results-subtitle">High Scores</h3>
        <p class="arcade-results-empty" id="arcade-results-empty" hidden>No scores saved yet.</p>
        <ol class="arcade-results-list" id="arcade-results-list"></ol>
      </section>
      <section class="arcade-results-name-picker" id="arcade-results-name-picker" hidden>
        <p class="arcade-results-copy" id="arcade-results-name-copy"></p>
        <div class="arcade-results-name-options" id="arcade-results-name-options"></div>
        <div class="arcade-results-input-row">
          <input id="arcade-results-name-input" class="arcade-results-input" type="text" maxlength="18" placeholder="Add new name" />
          <button type="button" class="arcade-results-button" data-results-action="save-name">Save Name</button>
        </div>
      </section>
      <div class="arcade-results-actions">
        <button type="button" class="arcade-results-button" data-results-action="restart">Play Again</button>
        <button type="button" class="arcade-results-button" data-results-action="arcade">Back To Arcade</button>
      </div>
    </div>
  `;

  const resultsTitle = resultsOverlay.querySelector("#arcade-results-title");
  const resultsKicker = resultsOverlay.querySelector("#arcade-results-kicker");
  const resultsScoreline = resultsOverlay.querySelector("#arcade-results-scoreline");
  const resultsCopy = resultsOverlay.querySelector("#arcade-results-copy");
  const resultsEmpty = resultsOverlay.querySelector("#arcade-results-empty");
  const resultsList = resultsOverlay.querySelector("#arcade-results-list");
  const resultsNamePicker = resultsOverlay.querySelector("#arcade-results-name-picker");
  const resultsNameCopy = resultsOverlay.querySelector("#arcade-results-name-copy");
  const resultsNameOptions = resultsOverlay.querySelector("#arcade-results-name-options");
  const resultsNameInput = resultsOverlay.querySelector("#arcade-results-name-input");

  function storageKey(gameId) {
    return `${highScoreStoragePrefix}${gameId}`;
  }

  function loadHighScores(gameId) {
    try {
      const raw = window.localStorage.getItem(storageKey(gameId));
      const parsed = JSON.parse(raw || "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((entry) => ({
          name: String(entry?.name || "").trim().slice(0, 18),
          score: Number(entry?.score || 0),
          savedAt: String(entry?.savedAt || ""),
        }))
        .filter((entry) => entry.name && Number.isFinite(entry.score))
        .sort((a, b) => b.score - a.score)
        .slice(0, maxHighScores);
    } catch (_error) {
      return [];
    }
  }

  function writeHighScores(gameId, scores) {
    try {
      window.localStorage.setItem(storageKey(gameId), JSON.stringify(scores.slice(0, maxHighScores)));
    } catch (_error) {
      // Ignore quota/storage failures and keep gameplay moving.
    }
  }

  function qualifiesForHighScore(score, scores) {
    if (!Number.isFinite(score) || score < 0) return false;
    if (scores.length < maxHighScores) return true;
    return score >= scores[scores.length - 1].score;
  }

  function uniqueNameChoices(scores) {
    return [...new Set(scores.map((entry) => entry.name).filter(Boolean))].slice(0, 6);
  }

  function saveHighScore(gameId, name, score) {
    const cleanName = String(name || "").trim().slice(0, 18);
    if (!cleanName) return loadHighScores(gameId);
    const scores = loadHighScores(gameId);
    scores.push({ name: cleanName, score, savedAt: new Date().toISOString() });
    scores.sort((a, b) => b.score - a.score);
    const trimmed = scores.slice(0, maxHighScores);
    writeHighScores(gameId, trimmed);
    return trimmed;
  }

  function renderHighScoreList(scores) {
    resultsList.innerHTML = "";
    resultsEmpty.hidden = scores.length > 0;
    scores.forEach((entry, index) => {
      const item = document.createElement("li");
      item.className = "arcade-results-entry";
      item.innerHTML = `
        <span class="arcade-results-rank">#${index + 1}</span>
        <span class="arcade-results-name">${entry.name}</span>
        <span class="arcade-results-score">${entry.score}</span>
      `;
      resultsList.append(item);
    });
  }

  function syncResultSelection() {
    const buttons = [...resultsOverlay.querySelectorAll(".arcade-results-button")];
    if (buttons.length === 0) return;
    resultSelection = Math.max(0, Math.min(resultSelection, buttons.length - 1));
    buttons.forEach((button, index) => {
      const selected = index === resultSelection;
      button.classList.toggle("is-selected", selected);
      if (selected && document.activeElement !== resultsNameInput) {
        button.focus({ preventScroll: true });
      }
    });
  }

  function closeResultsMenu() {
    resultsOpen = false;
    resultsContext = null;
    resultsOverlay.hidden = true;
    if (document.activeElement === resultsNameInput) {
      resultsNameInput.blur();
    }
  }

  function navigateToArcade() {
    window.location.href = arcadeHref;
  }

  function submitHighScoreName(name) {
    if (!resultsContext?.isHighScore) return;
    const savedScores = saveHighScore(resultsContext.gameId, name, resultsContext.score);
    resultsContext.scores = savedScores;
    resultsContext.isHighScore = false;
    renderHighScoreList(savedScores);
    resultsNamePicker.hidden = true;
    resultsCopy.textContent = `${name} is on the board. Pick your next move.`;
  }

  function handleResultsAction(action) {
    if (!resultsContext) return;
    if (action === "restart") {
      closeResultsMenu();
      resultsContext.onRestart?.();
      return;
    }
    if (action === "arcade") {
      navigateToArcade();
      return;
    }
    if (action === "save-name") {
      submitHighScoreName(resultsNameInput.value);
      resultsNameInput.value = "";
    }
  }

  function openResultsMenu(detail) {
    const gameId = String(detail?.gameId || "").trim();
    if (!gameId) return;

    closePauseMenu();

    const score = Number(detail?.score || 0);
    const scores = loadHighScores(gameId);
    const isHighScore = qualifiesForHighScore(score, scores);
    resultsContext = {
      gameId,
      title: String(detail?.title || "Game").trim() || "Game",
      score,
      onRestart: typeof detail?.onRestart === "function" ? detail.onRestart : null,
      scores,
      isHighScore,
    };

    resultsKicker.textContent = isHighScore ? "New High Score" : "Game Over";
    resultsTitle.textContent = `${resultsContext.title}`;
    resultsScoreline.textContent = `Final score: ${score}`;
    resultsCopy.textContent = isHighScore
      ? "Choose a saved name or add a new one to pin this run to the board."
      : "Play again from here or head back to the arcade shelf.";

    renderHighScoreList(scores);

    resultsNamePicker.hidden = !isHighScore;
    resultsNameOptions.innerHTML = "";
    resultsNameInput.value = "";
    if (isHighScore) {
      resultsNameCopy.textContent = "Save this score with a familiar name, or type a new one.";
      uniqueNameChoices(scores).forEach((name) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "arcade-results-button";
        button.textContent = `Save as ${name}`;
        button.dataset.resultsName = name;
        button.addEventListener("click", () => submitHighScoreName(name));
        resultsNameOptions.append(button);
      });
      if (resultsNameOptions.children.length === 0) {
        resultsNameCopy.textContent = "Type the first saved name for this cabinet.";
      }
    }

    resultsOpen = true;
    resultsOverlay.hidden = false;
    resultSelection = 0;
    syncResultSelection();
  }

  function syncPauseSelection() {
    overlay.querySelectorAll(".arcade-pause-button").forEach((button, index) => {
      const selected = index === pauseSelection;
      button.classList.toggle("is-selected", selected);
      if (selected) {
        button.focus({ preventScroll: true });
      }
    });
  }

  function closePauseMenu() {
    pauseOpen = false;
    overlay.hidden = true;
    cabinetHooks()?.onPauseClose?.();
  }

  function activatePauseSelection() {
    pauseOptions[pauseSelection]?.run?.();
  }

  function openPauseMenu() {
    rebuildPauseOptions();
    pauseOpen = true;
    pauseSelection = 0;
    overlay.hidden = false;
    cabinetHooks()?.onPauseOpen?.();
    syncPauseSelection();
  }

  function edgeTrigger(name, pressed) {
    const previous = controllerState[name] || false;
    controllerState[name] = pressed;
    return pressed && !previous;
  }

  function activeGamepad() {
    const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : [];
    return pads[0] || null;
  }

  function handlePauseController() {
    const pad = activeGamepad();
    if (!pad) return;

    const axisY = pad.axes[1] || 0;
    const altAxisY = pad.axes[7] || 0;
    const upPressed = (pad.buttons[12] && pad.buttons[12].pressed) || axisY <= -0.45 || altAxisY <= -0.45;
    const downPressed = (pad.buttons[13] && pad.buttons[13].pressed) || axisY >= 0.45 || altAxisY >= 0.45;
    const backPressed = (pad.buttons[1] && pad.buttons[1].pressed);
    const confirmPressed = (pad.buttons[0] && pad.buttons[0].pressed)
      || (pad.buttons[1] && pad.buttons[1].pressed)
      || (pad.buttons[9] && pad.buttons[9].pressed);
    const menuPressed = (pad.buttons[8] && pad.buttons[8].pressed)
      || (pad.buttons[9] && pad.buttons[9].pressed)
      || (pad.buttons[16] && pad.buttons[16].pressed);

    if (edgeTrigger("menu", menuPressed)) {
      if (pauseOpen) {
        navigateToArcade();
      } else {
        openPauseMenu();
      }
      return;
    }

    if (!pauseOpen) return;

    if (edgeTrigger("pause-back", backPressed)) {
      navigateToArcade();
      return;
    }

    if (edgeTrigger("up", upPressed)) {
      pauseSelection = (pauseSelection - 1 + pauseOptions.length) % pauseOptions.length;
      syncPauseSelection();
    }
    if (edgeTrigger("down", downPressed)) {
      pauseSelection = (pauseSelection + 1) % pauseOptions.length;
      syncPauseSelection();
    }
    if (edgeTrigger("confirm", confirmPressed)) {
      activatePauseSelection();
    }
  }

  function handleResultsController() {
    const pad = activeGamepad();
    if (!pad) return;

    const axisY = pad.axes[1] || 0;
    const altAxisY = pad.axes[7] || 0;
    const upPressed = (pad.buttons[12] && pad.buttons[12].pressed) || axisY <= -0.45 || altAxisY <= -0.45;
    const downPressed = (pad.buttons[13] && pad.buttons[13].pressed) || axisY >= 0.45 || altAxisY >= 0.45;
    const backPressed = (pad.buttons[1] && pad.buttons[1].pressed)
      || (pad.buttons[8] && pad.buttons[8].pressed)
      || (pad.buttons[9] && pad.buttons[9].pressed);
    const confirmPressed = (pad.buttons[0] && pad.buttons[0].pressed)
      || (pad.buttons[1] && pad.buttons[1].pressed)
      || (pad.buttons[9] && pad.buttons[9].pressed);

    const buttons = [...resultsOverlay.querySelectorAll(".arcade-results-button")];
    if (buttons.length === 0) return;

    if (edgeTrigger("results-back", backPressed)) {
      navigateToArcade();
      return;
    }

    if (edgeTrigger("results-up", upPressed)) {
      resultSelection = (resultSelection - 1 + buttons.length) % buttons.length;
      syncResultSelection();
    }
    if (edgeTrigger("results-down", downPressed)) {
      resultSelection = (resultSelection + 1) % buttons.length;
      syncResultSelection();
    }
    if (edgeTrigger("results-confirm", confirmPressed)) {
      buttons[resultSelection]?.click();
    }
  }

  function frame() {
    if (resultsOpen) {
      handleResultsController();
    } else {
      handlePauseController();
    }
    requestAnimationFrame(frame);
  }

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closePauseMenu();
    }
  });

  overlay.addEventListener("click", (event) => {
    const button = event.target?.closest?.(".arcade-pause-button");
    if (!button) {
      return;
    }
    const index = [...overlay.querySelectorAll(".arcade-pause-button")].indexOf(button);
    if (index >= 0) {
      pauseSelection = index;
      activatePauseSelection();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (resultsOpen) {
      const buttons = [...resultsOverlay.querySelectorAll(".arcade-results-button")];
      if (event.key === "b" || event.key === "B") {
        event.preventDefault();
        navigateToArcade();
        return;
      }
      if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") {
        event.preventDefault();
        if (buttons.length > 0) {
          resultSelection = (resultSelection - 1 + buttons.length) % buttons.length;
          syncResultSelection();
        }
        return;
      }
      if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") {
        event.preventDefault();
        if (buttons.length > 0) {
          resultSelection = (resultSelection + 1) % buttons.length;
          syncResultSelection();
        }
        return;
      }
      if (event.key === "Enter") {
        if (document.activeElement === resultsNameInput) {
          submitHighScoreName(resultsNameInput.value);
          resultsNameInput.value = "";
        } else {
          event.preventDefault();
          buttons[resultSelection]?.click();
        }
        return;
      }
    }

    if (event.key === "Escape") {
      event.preventDefault();
      if (resultsOpen) {
        return;
      }
      if (pauseOpen) {
        navigateToArcade();
      } else {
        openPauseMenu();
      }
      return;
    }
    if (!pauseOpen) return;
    if (event.key === "b" || event.key === "B") {
      event.preventDefault();
      navigateToArcade();
      return;
    }
    if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") {
      event.preventDefault();
      pauseSelection = (pauseSelection - 1 + pauseOptions.length) % pauseOptions.length;
      syncPauseSelection();
    }
    if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") {
      event.preventDefault();
      pauseSelection = (pauseSelection + 1) % pauseOptions.length;
      syncPauseSelection();
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activatePauseSelection();
    }
  });

  resultsOverlay.addEventListener("click", (event) => {
    if (event.target === resultsOverlay) {
      return;
    }
    const button = event.target?.closest?.(".arcade-results-button");
    const action = button?.dataset?.resultsAction;
    if (action) {
      handleResultsAction(action);
    }
  });

  resultsNameInput.addEventListener("focus", () => {
    resultsOverlay.querySelectorAll(".arcade-results-button").forEach((button) => button.classList.remove("is-selected"));
    resultsNameOptions.querySelectorAll(".arcade-results-button").forEach((button) => button.classList.remove("is-selected"));
  });

  document.head.append(style);
  document.body.append(link);
  document.body.append(overlay);
  document.body.append(resultsOverlay);

  const arcadeCabinet = {
    reportGameOver: openResultsMenu,
    closeResults: closeResultsMenu,
    getHighScores: loadHighScores,
    saveHighScore,
    closePause: closePauseMenu,
    navigateToArcade,
  };
  window.ArcadeCabinet = arcadeCabinet;
  rebuildPauseOptions();
  requestAnimationFrame(frame);
})();
  const pauseActions = overlay.querySelector(".arcade-pause-actions");

  function cabinetHooks() {
    return window.__arcadeCabinetHooks || null;
  }

  function customPauseOptions() {
    try {
      const options = cabinetHooks()?.getPauseActions?.();
      if (!Array.isArray(options)) return [];
      return options
        .filter((option) => option && typeof option === "object" && typeof option.label === "string" && typeof option.run === "function")
        .map((option) => ({
          id: String(option.id || option.label).trim() || option.label,
          label: option.label,
          run: option.run,
        }));
    } catch (_error) {
      return [];
    }
  }

  function rebuildPauseOptions() {
    const custom = customPauseOptions();
    pauseOptions = [defaultPauseOptions[0], ...custom, defaultPauseOptions[1]];
    pauseActions.innerHTML = "";
    pauseOptions.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "arcade-pause-button";
      button.dataset.arcadeAction = option.id;
      button.textContent = option.label;
      pauseActions.append(button);
    });
  }
