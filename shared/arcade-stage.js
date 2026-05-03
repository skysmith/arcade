const DEFAULT_MAX_DPR = 2;

function roundSize(value) {
  return Math.max(1, Math.round(value));
}

function fitRect(containerWidth, containerHeight, aspectRatio) {
  let width = Math.max(1, Math.floor(containerWidth));
  let height = roundSize(width / aspectRatio);

  if (height > containerHeight) {
    height = Math.max(1, Math.floor(containerHeight));
    width = roundSize(height * aspectRatio);
  }

  return { width, height };
}

export function attachViewportResize(handler) {
  window.addEventListener("resize", handler);
  window.visualViewport?.addEventListener("resize", handler);
  document.addEventListener("fullscreenchange", handler);

  return () => {
    window.removeEventListener("resize", handler);
    window.visualViewport?.removeEventListener("resize", handler);
    document.removeEventListener("fullscreenchange", handler);
  };
}

export function syncCanvasBackingStore(canvas, {
  logicalWidth,
  logicalHeight,
  maxDpr = DEFAULT_MAX_DPR,
} = {}) {
  const rect = canvas.getBoundingClientRect();
  const cssWidth = roundSize(rect.width);
  const cssHeight = roundSize(rect.height);
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  const renderWidth = roundSize(cssWidth * dpr);
  const renderHeight = roundSize(cssHeight * dpr);

  if (canvas.width !== renderWidth || canvas.height !== renderHeight) {
    canvas.width = renderWidth;
    canvas.height = renderHeight;
  }

  return {
    cssWidth,
    cssHeight,
    dpr,
    renderWidth,
    renderHeight,
    scaleX: renderWidth / logicalWidth,
    scaleY: renderHeight / logicalHeight,
    logicalWidth,
    logicalHeight,
  };
}

export function applyCanvasRenderScale(ctx, renderState, { smoothing = true } = {}) {
  ctx.setTransform(renderState.scaleX, 0, 0, renderState.scaleY, 0, 0);
  ctx.imageSmoothingEnabled = smoothing;
}

export function createArcadeStage({
  shell,
  stage,
  canvas,
  logicalWidth,
  logicalHeight,
  maxDpr = DEFAULT_MAX_DPR,
  smoothing = true,
  manageCanvasBackingStore = true,
  onResize,
} = {}) {
  const aspectRatio = logicalWidth / logicalHeight;
  const state = {
    logicalWidth,
    logicalHeight,
    cssWidth: logicalWidth,
    cssHeight: logicalHeight,
    renderWidth: logicalWidth,
    renderHeight: logicalHeight,
    scaleX: 1,
    scaleY: 1,
    dpr: 1,
    stageWidth: logicalWidth,
    stageHeight: logicalHeight,
  };

  function resize() {
    const shellRect = shell.getBoundingClientRect();
    const fitted = fitRect(shellRect.width, shellRect.height, aspectRatio);

    stage.style.width = `${fitted.width}px`;
    stage.style.height = `${fitted.height}px`;

    if (manageCanvasBackingStore) {
      const renderState = syncCanvasBackingStore(canvas, {
        logicalWidth,
        logicalHeight,
        maxDpr,
      });

      Object.assign(state, renderState, {
        stageWidth: fitted.width,
        stageHeight: fitted.height,
      });
    } else {
      Object.assign(state, {
        cssWidth: fitted.width,
        cssHeight: fitted.height,
        renderWidth: logicalWidth,
        renderHeight: logicalHeight,
        scaleX: 1,
        scaleY: 1,
        dpr: Math.min(window.devicePixelRatio || 1, maxDpr),
        stageWidth: fitted.width,
        stageHeight: fitted.height,
      });
    }

    if (onResize) {
      onResize({ ...state });
    }
  }

  const detach = attachViewportResize(resize);
  resize();

  return {
    state,
    resize,
    destroy() {
      detach();
    },
    syncContext(ctx, options = {}) {
      applyCanvasRenderScale(ctx, state, {
        smoothing: options.smoothing ?? smoothing,
      });
    },
  };
}
