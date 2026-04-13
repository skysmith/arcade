# Controller Wiring

This repo uses a browser-first controller model, with Tetris as the reference cabinet for the native fallback path.

## Default Flow

Most cabinets should work in this order:

1. The cabinet opens and starts with keyboard support.
2. The browser-visible controller becomes `P1`.
3. Extra controllers join live when the cabinet decides to seat them, usually on `Start`.
4. The shared back-to-arcade affordance stays available through `shared/arcade-home.js`.

That gives us a fast path when `navigator.getGamepads()` is enough and keeps local testing easy when no controller is connected.

## Reference Cabinet: Tetris

`games/tetris/` is the reference for the most complete controller setup in this repo.

- Browser controls are mapped directly inside `games/tetris/game.js`.
- The cabinet supports a native fallback launcher at `games/tetris/scripts/start-controller-bridge.sh`.
- That launcher calls the shared helper at `tools/controller-bridge/controller-mouse.sh`.
- The helper builds `controller-mouse.bin` on demand from `controller-mouse.m` if needed.

The Tetris bridge is the baseline pattern for cabinets that need dependable 8BitDo support even when the browser hides the pad.

## Shared Native Bridge

The vendored bridge helper lives under `tools/controller-bridge/`.

- `controller-mouse.m` is the Objective-C source for the HID bridge.
- `build-controller-mouse.sh` compiles the native binary on macOS.
- `controller-mouse.sh` ensures the binary exists, then launches it.

Cabinet launch scripts in `games/*/scripts/start-controller-bridge.sh` are intentionally tiny wrappers around that shared helper.

## Cabinet-Specific Launchers

Each cabinet wrapper decides which keyboard lane the native helper should emulate.

- `games/tetris/scripts/start-controller-bridge.sh` uses `--tetris`, which is the richest mapping in the repo.
- `games/donkey-kong/scripts/start-controller-bridge.sh` maps the pad onto a simple platformer lane.
- `games/space-invaders/scripts/start-controller-bridge.sh` maps left, right, fire, pause, and restart.
- `games/breakout/scripts/start-controller-bridge.sh` maps paddle, serve, pause, and restart.
- `games/asteroids/scripts/start-controller-bridge.sh` maps rotate, thrust, fire, pause, and restart.
- `games/bomberman/scripts/start-controller-bridge.sh` maps move, bomb, pause, and restart.

If a new cabinet needs native fallback support, copy one of those scripts and adjust the helper flags to match the cabinet's keyboard controls.

## When To Use The Native Fallback

Reach for the bridge when:

- the browser does not expose the controller at all
- the browser exposes the pad unreliably
- the cabinet needs a stable single-lane mapping for local play

If browser gamepad input is already dependable, prefer that path and treat the native bridge as the fallback rather than the default.
