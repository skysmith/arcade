# Letter Launchpad

Educational arcade cabinet for early letters, numbers, sounds, and word building.

## Core Loop

- Start from a small controller-friendly menu.
- One shared prompt appears at a time.
- Players move around the board, grab tiles, and bring the matching tile to the themed launch zone.
- Multiplayer rounds spawn multiple correct tiles so each active player can help.
- Correct matches advance the round and fill the level goal.
- Wrong tiles bounce away without ending the run.

## Controls

- Keyboard: arrows or WASD to move, Space or Enter to grab/drop, Esc for the shared level menu, P to pause, R to reset.
- Controller: d-pad or left stick to move, south button to grab/drop, Start opens the shared level menu and live-joins extra pads.
- Back to Arcade uses the shared arcade home button and level menu.

## Voice Clips

The game can play generated voice prompt assets when `assets/audio/voice-manifest.json` exists. Without that file, the cabinet stays silent and runs normally. The current Nova set covers Levels 1-10, including prompts, success lines, mistake lines, and completion lines.

Generate or refresh the MP3 set from the arcade repo root:

```bash
node games/letter-launchpad/scripts/generate-voice-assets.mjs --voice=nova
```

The script reads `games/letter-launchpad/.env` when present. Use `--force` to regenerate existing clips or `--voice=marin --force` to try another supported voice. Voice prompts are AI-generated, and the cabinet discloses that in the footer when audio is enabled.

## Levels

- Level 1: Launchpad Letters, uppercase recognition.
- Level 2: Moon Garden, lowercase-to-uppercase matching.
- Level 3: Planet Count, number recognition and quantities.
- Level 4: Forest Sounds, first-letter sounds.
- Level 5: Word Workshop, short word building.
- Level 6: Dino Dig Site, fossil-themed lowercase matching.
- Level 7: Train Yard, ordered number and letter sequences.
- Level 8: Tractor Farm, harvest-themed counting.
- Level 9: Dragon Hatchery, dragon-themed first-letter sounds.
- Level 10: Word Workshop Plus, bigger word building.
