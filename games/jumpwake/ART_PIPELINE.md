# Jumpwake Art Pipeline

Local-first workflow for generating Jumpwake character portraits, ship cards, and star-system dock art with the Alcove-compatible image dashboard and local Z Image Turbo.

This is the path we actually used to make the current in-game art.

## Main Paths

- Jumpwake game: `/Users/sky/Documents/codex/lab/games/arcade/games/jumpwake`
- Jumpwake generation scripts: `/Users/sky/Documents/codex/lab/ai-art`
- Dashboard entry point used for these runs: `/Users/sky/Documents/codex/lab/ai-art/dashboard.py`
- Dashboard URL file: `/Users/sky/Documents/codex/lab/ai-art/.dashboard-url`
- Alcove workspace home for the packaged image-gen cockpit: `/Users/sky/Documents/codex/personal/projects/ancestor-books/image-gen`

## What Generates What

- Contacts and recurring character portraits:
  - script: `/Users/sky/Documents/codex/lab/ai-art/run_jumpwake_contact_portraits.py`
  - outputs: `assets/contacts/<slug>.png`
  - in-game comms portraits usually use cropped variants like `assets/contacts/<slug>-avatar.png`
- Sector and dock menu cards:
  - script: `/Users/sky/Documents/codex/lab/ai-art/run_jumpwake_menu_art.py`
  - outputs: `assets/docks/<sector>-card.png`
- Archive and lore cards:
  - script: `/Users/sky/Documents/codex/lab/ai-art/run_jumpwake_archive_art.py`
  - outputs: `assets/archive/<slug>.png`
- Ship menu cards:
  - script: `/Users/sky/Documents/codex/lab/ai-art/run_jumpwake_menu_art.py`
  - outputs: `assets/ships/<hull>-card.png`

## Launch

Most reliable dashboard launch:

```bash
python3 /Users/sky/Documents/codex/lab/ai-art/dashboard.py
```

Convenience launcher:

```bash
bash /Users/sky/Documents/codex/lab/ai-art/launch_dashboard.sh
```

If the launcher writes a stale port or the batch script starts seeing `Connection refused`, restart the dashboard with the direct `python3 dashboard.py` command above.

Confirm the current local dashboard URL:

```bash
cat /Users/sky/Documents/codex/lab/ai-art/.dashboard-url
```

Serve the arcade locally for verification:

```bash
cd /Users/sky/Documents/codex/lab/games/arcade
python3 -m http.server 8017
```

Jumpwake local URL:

```text
http://127.0.0.1:8017/games/jumpwake/index.html
```

## Prompt Rules

Use plain prompt wording.
Do not use quotation marks in prompts.

For sector or dock cards:

- say it is for a space game menu
- name the sector or station
- explicitly say the station is orbiting a world
- explicitly say berth window or external dock camera
- ask for one main orbital station in midground
- ask for dark open composition and negative space for menu overlay
- say `no text`

For ship cards:

- say it is a cinematic hero render for a space game menu
- use `three-quarter hero view`
- ask for a readable silhouette
- keep the backdrop dark and simple
- say `no text` and `no watermark`

Important:

- Local `Z Image Turbo` does not meaningfully honor negative prompts in this workflow.
- Put suppression requirements directly in the main prompt text instead.
- For no-text requests, explicitly say:
  - `no readable text`
  - `no signage`
  - `no interface graphics`
  - `no labels`
  - `no watermark`

## Expected Cleanup

The local model often tries to add big title text at the top of the frame even when the prompt says not to.

Fastest fix:

1. Keep the good render.
2. Crop the texty top strip away with `ffmpeg`.
3. Scale back to `1024x576`.
4. Replace the in-game PNG only after the crop looks good.

Typical cleanup command:

```bash
ffmpeg -y -i input.png -vf "crop=940:410:42:148,scale=1024:576" output.png
```

Check final dimensions:

```bash
sips -g pixelWidth -g pixelHeight output.png
```

## Wiring In-Game

Sector and dock art is mapped in:

- `/Users/sky/Documents/codex/lab/games/arcade/games/jumpwake/game.js`
- table: `SECTOR_MENU_ART`

Ship art is mapped in:

- `/Users/sky/Documents/codex/lab/games/arcade/games/jumpwake/game.js`
- table: `HULL_MENU_ART`

Contact portraits are wired through:

- `/Users/sky/Documents/codex/lab/games/arcade/games/jumpwake/game.js`
- function: `missionContactProfile()`

Detail cards already support images.
For most new ship or sector menu art, the full integration is:

1. generate the PNG into `assets/docks` or `assets/ships`
2. add one entry to `SECTOR_MENU_ART` or `HULL_MENU_ART`
3. hard refresh the local browser page

## Verification

Basic visual pass:

1. Open the game locally.
2. Check the root dock `Context` panel.
3. Open `Ships`.
4. Select the flagship entry and any buy entry that should show art.

Useful direct asset checks:

```bash
curl -I http://127.0.0.1:8017/games/jumpwake/assets/docks/grey-exchange-card.png
curl -I http://127.0.0.1:8017/games/jumpwake/assets/ships/kestrel-card.png
```

For far sectors or hulls that are awkward to reach in normal play, use a temporary local save-state in browser `localStorage` to boot directly into the target sector and shipyard, then remove the preview save after verification.

## Current Approved Assets

Contacts already in use:

- Mara Kade
- Dax Brindle
- Juno Vale
- Clerk Ilya Sen
- Vey Neral
- Marshal Tovin
- Dockrunner Nix

Ship cards currently approved and wired:

- Rust Kestrel
- Courier Cutter
- Dockside Dinghy
- Long Haul Trader

Sector and dock cards currently approved and wired:

- Grey Exchange
- Union Harbor
- Shale Barrens
- Authority Gate
- Cinder Wake

## Batch Expansion Path

The current menu-art script already has prompt entries for the next hull wave:

- `tug-card`
- `raider-card`
- `smuggler-card`
- `patrol-card`
- `corvette-card`

When continuing the batch:

1. start the dashboard
2. run `python3 /Users/sky/Documents/codex/lab/ai-art/run_jumpwake_menu_art.py`
3. inspect each new PNG before trusting it
4. crop out title text when needed
5. verify in the local Jumpwake build

Archive batch:

1. start the dashboard
2. run `python3 /Users/sky/Documents/codex/lab/ai-art/run_jumpwake_archive_art.py`
3. inspect each new PNG before wiring it into archive entries
4. crop out accidental title text when needed
5. hard refresh the local Jumpwake build before judging layout

## Known Quirks

- The dashboard launcher can occasionally leave a stale port in `.dashboard-url`.
- Running `dashboard.py` directly is the safest recovery path.
- The game browser can hold onto old `404` impressions for new files; do a hard refresh after adding new art.
- The shared arcade script still throws `defaultPauseOptions is not defined`. That is unrelated to the Jumpwake art flow.
