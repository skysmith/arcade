# arcade

Controller-friendly landing page for the local game shelf, with the simpler cabinets living inside this repo.

## Workspace Metadata

- Name: Arcade
- Domain: lab
- Status: active
- Purpose: Controller-friendly launcher and cabinet shelf for local browser games
- Path: lab/games/arcade
- Related:
  - lab/games
  - lab/media
- Upstream:
  - lab/games
- Tags:
  - arcade
  - launcher
  - local-multiplayer
  - browser-games

Current focus:

- Browsable arcade launcher for local browser games
- Keyboard and Gamepad API navigation
- Quick handoff into bundled cabinet folders under `games/`
- Four-player-ready cabinets with live join support
- Reusable project heartbeat for cloning future cabinets
- Minimal new local cabinets like `space-invaders` and `donkey-kong`

Controls:

- Keyboard: arrows or `WASD` to browse, `Enter` or `Space` to launch
- Controller: d-pad or left stick to browse, south button or start to launch

Notes:

- `index.html` builds the arcade shell
- `style.css` defines the launcher look and responsive cabinet grid
- `game.js` handles selection state, controller detection, and game launching
- `games/` contains the in-repo cabinets for the shelf
- `tools/controller-bridge/` vendors the native 8BitDo fallback helper used by cabinet launch scripts
- `arcade.connections.json` lists cabinet manifest files the launcher should read
- each cabinet can expose an `arcade.connection.json` file with its launcher metadata
- `scripts/sync-arcade-connections.mjs` regenerates the launcher index from every manifest under `../`
- use `"hidden": true` inside a cabinet manifest when a project should stay out of the visible shelf without deleting its launcher metadata
- `PROJECT_HEARTBEAT.md` is the family arcade design guide for future cabinets
- `docs/controllers.md` explains the browser-first controller flow and the native fallback bridge pattern from Tetris
- `docs/cabinets.md` explains how a cabinet claims a slot in the arcade frontend
- Tetris remains the native-bridge reference point, Space Invaders is the compact live-join shooter, and Donkey Kong is the four-player single-screen climber
