# Cabinet Registration

This repo treats the launcher as the shelf and each game as a cabinet living under `games/`.

## Layout

- repo root contains the launcher: `index.html`, `style.css`, `game.js`
- `games/<cabinet>/` contains a single cabinet
- `shared/` contains cross-cabinet browser helpers such as the back-to-arcade control
- `assets/covers/` contains launcher art used by cabinet cards
- `tools/controller-bridge/` contains the shared native controller fallback helper

## How A Cabinet Claims A Slot

Each cabinet claims a spot in the arcade frontend with one manifest file and the generated index:

1. `games/<cabinet>/arcade.connection.json`
2. a generated entry in the repo-root `arcade.connections.json`

The cabinet manifest provides the card metadata:

```json
{
  "id": "tetris",
  "title": "Tetris",
  "image": "./assets/covers/tetris.svg",
  "summary": "Controller-friendly browser Tetris with classic single-board play and a four-board chaos mode when you want one pad steering every lane.",
  "players": "1-4 local",
  "controls": "D-pad, face buttons, start",
  "launchText": "Open cabinet",
  "path": "./games/tetris/index.html",
  "badge": "Controller Ready"
}
```

The root index file then points at that manifest:

```json
[
  "./games/tetris/arcade.connection.json"
]
```

When the launcher boots, `game.js` loads `arcade.connections.json`, fetches each cabinet manifest, normalizes the data, and renders the launcher cards. The visible shelf is manifest-driven instead of maintained as a separate hardcoded launcher list.

Regenerate the index any time cabinets are added or removed:

```bash
node scripts/sync-arcade-connections.mjs
```

That script scans every `arcade.connection.json` under `../`, writes the root index, and keeps the launcher wiring repeatable across sibling game repos.

## Required Manifest Fields

Every cabinet manifest should include:

- `id`: stable unique key for the cabinet
- `title`: label shown in the launcher
- `image`: launcher cover art, usually under `./assets/covers/`
- `summary`: short card copy
- `players`: local player count text
- `controls`: short control hint for the card
- `launchText`: CTA label, usually `Open cabinet`
- `path`: launcher target, usually `./games/<cabinet>/index.html`
- `badge`: small label on the cabinet card

Optional fields:

- `hidden`: when `true`, the manifest stays registered but the cabinet is omitted from the visible shelf

## Recommended Cabinet Shape

Most cabinets in this repo follow this layout:

- `index.html`: cabinet shell and HUD
- `style.css`: cabinet presentation
- `game.js`: gameplay and input handling
- `README.md`: cabinet-specific notes
- `arcade.connection.json`: launcher registration
- `scripts/start-controller-bridge.sh`: optional native fallback launcher

That shape keeps cabinets easy to copy when we spin up new ones.

## Shared Browser Integration

If the cabinet should expose the standard back path, include:

```html
<script defer src="../../shared/arcade-home.js" data-arcade-href="../../index.html"></script>
```

That keeps the cabinet rooted in the arcade shelf instead of becoming a dead end.

## Imports

If a cabinet starts life outside this repo, copy or move it into `games/<cabinet>/`, add `arcade.connection.json`, add a cover under `assets/covers/`, and run `node scripts/sync-arcade-connections.mjs`.
