# Whispering Willow Art Pipeline

Local-first workflow for generating `Whispering Willow` concept art and production-ready cabinet assets with the existing Alcove-compatible dashboard and local Z Image Turbo setup.

## Main Paths

- game root: `/Users/sky/Documents/codex/lab/games/arcade/games/whispering-willow`
- generation scripts: `/Users/sky/Documents/codex/lab/ai-art`
- dashboard entry point: `/Users/sky/Documents/codex/lab/ai-art/dashboard.py`
- dashboard URL file: `/Users/sky/Documents/codex/lab/ai-art/.dashboard-url`

## What Generates What

- forest concept wave:
  - script: `/Users/sky/Documents/codex/lab/ai-art/run_whispering_willow_concepts.py`
  - outputs:
    - `assets/contacts/*.png`
    - `assets/locations/*.png`
    - `assets/creatures/*.png`
    - cabinet cover candidate in `/Users/sky/Documents/codex/lab/games/arcade/assets/covers/`

- island shoreline wave:
  - script: `/Users/sky/Documents/codex/lab/ai-art/run_whispering_tides_island_pass.py`
  - outputs:
    - `assets/concepts/places/*.png`
    - `assets/concepts/ships/*.png`
    - `assets/concepts/lore/*.png`
  - intent:
    - keep the lush existing forest cards as larger interior jungle-island references
    - add blue water, sand, rope docks, lagoon shorelines, and brighter island silhouettes
    - explore soft mermaid-rumor imagery without making mermaids fully explicit or common

- cast and sailing wave:
  - script: `/Users/sky/Documents/codex/lab/ai-art/run_whispering_tides_contact_wave.py`
  - outputs:
    - `assets/contacts/*.png`
    - `assets/concepts/places/*.png`
    - `assets/concepts/ships/*.png`
    - `assets/concepts/loot/*.png`
  - intent:
    - replace leftover Jumpwake-era or missing contact portraits with the live island cast
    - add sailing-ship concept art that matches the current skiff/sloop/cutter/caravel roster
    - fill in remaining island places like `Silverpool`, `Moonglass Cay`, and `Sunroot Atoll`

- contact polish wave:
  - script: `/Users/sky/Documents/codex/lab/ai-art/run_whispering_tides_contact_polish.py`
  - outputs:
    - `assets/contacts/*-v2.png`
  - intent:
    - rerun any portraits that came back with baked-in text or overly glossy rendering
    - keep the strongest island cast portraits while improving only the weak outliers

- archive retheme wave:
  - script: `/Users/sky/Documents/codex/lab/ai-art/run_whispering_tides_archive_wave.py`
  - outputs:
    - `assets/archive/*.png`
  - intent:
    - replace remaining old-setting primer, faction, and history cards with island-archipelago lore art
    - bring the archive screens up to the same visual world as the contact and place panels

- production candidate follow-up waves:
  - scripts:
    - `/Users/sky/Documents/codex/lab/ai-art/run_whispering_tides_ship_candidates.py`
    - `/Users/sky/Documents/codex/lab/ai-art/run_whispering_tides_dock_candidates.py`
    - `/Users/sky/Documents/codex/lab/ai-art/run_whispering_tides_archive_candidates.py`
    - chained runner: `/Users/sky/Documents/codex/lab/ai-art/run_whispering_tides_followup_queue.py`
  - outputs:
    - versioned ship candidates beside live `assets/ships/*.png`
    - versioned dock candidates beside live `assets/docks/*.png`
    - versioned archive candidates beside live `assets/archive/*.png`
  - intent:
    - keep the current cabinet stable while generating candidate replacements for the live slots the game still renders
    - avoid overwriting working assets until a swap pass is chosen on purpose
    - let one background runner wait for the current Alcove queue to finish, then push ships, docks, and lore in order

## Prompt Rules

- Use plain prompt wording.
- Do not use quote marks inside prompts.
- Say `no readable text` directly in the main prompt.
- Say `no signs`, `no labels`, and `no interface graphics` when those matter.
- Favor storybook fantasy, gentle mystery, and warm fairy-tale lighting over grimdark.
- Keep danger emotionally safe even when the image is moody or slightly spooky.

Important:

- Local `Z Image Turbo` does not meaningfully honor negative prompts in this workflow.
- Put suppression requirements directly into the main prompt.

## First Asset Priorities

- cabinet cover for the arcade shelf
- Fern portrait
- Jude portrait
- Frieren familiar portrait
- hooded guide portrait
- frightened child portrait
- Mossjaw creature card
- Redwood Inn location card
- Whispering Willow location card
- Crooked Hill-Door location card
- Riverbank location card

## Launch

```bash
python3 /Users/sky/Documents/codex/lab/ai-art/dashboard.py
```

## Queue The First Wave

```bash
python3 /Users/sky/Documents/codex/lab/ai-art/run_whispering_willow_concepts.py
```

## Queue The Follow-Up Production Candidates

```bash
python3 /Users/sky/Documents/codex/lab/ai-art/run_whispering_tides_followup_queue.py
```

## Verification

Serve the arcade locally:

```bash
cd /Users/sky/Documents/codex/lab/games/arcade
python3 -m http.server 8017
```

Then open:

```text
http://127.0.0.1:8017/games/whispering-willow/index.html
```

## Build Intent

The first goal is not to finish every mechanic conversion.
It is to get a convincing forest-adventure cabinet on the shelf quickly, with strong character and location art already landing in the new game's folders.

Current direction update:

The cabinet is now shifting toward `Whispering Willow`, a peaceful magical archipelago story.
Existing forest-heavy cards still work well as bigger, greener interior islands.
The next art priority is shoreline clarity: sand, blue water, docks, lagoon crossings, and tropical jungle silhouettes.
