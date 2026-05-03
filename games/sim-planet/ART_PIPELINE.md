# Sim Planet Art Pipeline

Local-first workflow for generating Sim Planet focused asset cards with the existing Alcove-compatible dashboard and local queue scripts.

These images feed the in-game focus inspector so planets and structures can show a cinematic sci-fi card when selected.

## Main Paths

- game root: `/Users/sky/Documents/codex/lab/games/arcade/games/sim-planet`
- focus art destination: `/Users/sky/Documents/codex/lab/games/arcade/games/sim-planet/assets/focus`
- queue scripts home: `/Users/sky/Documents/codex/lab/ai-art`
- dashboard entry point currently available on this machine: `/Users/sky/Documents/codex/lab/ai-art/dashboard.py`
- dashboard URL file: `/Users/sky/Documents/codex/lab/ai-art/.dashboard-url`

## What Generates What

- focus card wave:
  - script: `/Users/sky/Documents/codex/lab/ai-art/run_sim_planet_focus_art.py`
  - outputs:
    - `assets/focus/survey-array-card.png`
    - `assets/focus/mass-driver-card.png`
    - `assets/focus/solar-lifter-card.png`
    - `assets/focus/collector-array-card.png`
    - `assets/focus/habitat-ring-card.png`
    - `assets/focus/shipyard-cradle-card.png`
    - `assets/focus/solar-lifting-rig-card.png`
    - `assets/focus/retrofit-platform-card.png`
    - `assets/focus/black-hole-harvester-card.png`
    - `assets/focus/aster-world-card.png`
    - `assets/focus/vela-world-card.png`
    - `assets/focus/morrow-world-card.png`
    - `assets/focus/latch-moon-card.png`
    - `assets/focus/reef-moon-card.png`
    - `assets/focus/icar-01-asteroid-card.png`
    - `assets/focus/planet-generic-card.png`
    - `assets/focus/moon-generic-card.png`
    - `assets/focus/asteroid-generic-card.png`
    - `assets/focus/black-hole-body-card.png`

## Prompt Rules

- use plain prompt wording
- do not use quote marks inside prompts
- say `no readable text` directly in the main prompt
- say `no labels`, `no interface graphics`, and `no watermark`
- favor cinematic hard-surface sci-fi concept art over painterly fantasy
- keep silhouettes readable in a narrow HUD crop
- ask for one main subject with strong foreground and background separation

Important:

- the local image workflow does not reliably honor negative prompts, so keep all suppression language in the main prompt text
- these images are for a small inspector card, so one dominant subject is better than busy scenes

## Launch

```bash
python3 /Users/sky/Documents/codex/lab/ai-art/dashboard.py
```

If the queue script reports `Connection refused`, restart the dashboard with the command above.

## Queue The Focus Wave

```bash
python3 /Users/sky/Documents/codex/lab/ai-art/run_sim_planet_focus_art.py
```

## Wiring In-Game

Focus art is mapped in:

- `/Users/sky/Documents/codex/lab/games/arcade/games/sim-planet/game.js`
- table: `FOCUS_ART_LIBRARY`

The inspector will fall back to an in-engine concept card when a PNG is still missing, so new files can land incrementally.

## Verification

Serve the arcade locally:

```bash
cd /Users/sky/Documents/codex/lab/games/arcade
python3 -m http.server 8017
```

Then open:

```text
http://127.0.0.1:8017/games/sim-planet/index.html
```

Check:

1. click `Survey Array`, `Mass Driver`, and `Solar Lifter`
2. click `Aster`, `Vela`, `Morrow`, `Latch`, `Reef`, and `Icar-01`
3. confirm the focus inspector swaps art cleanly and still reads without the image

## First Priorities

- Solar Lifter
- Survey Array
- Mass Driver
- Habitat Ring
- Shipyard Cradle
- Solar Lifting Rig
- Morrow
- Aster

## Known State

- the old top-right build rail is now suggestion-only
- actual build, upgrade, project, and salvage verbs now live in the focused asset menu
- missing PNGs do not block gameplay because the inspector renders a styled fallback card
