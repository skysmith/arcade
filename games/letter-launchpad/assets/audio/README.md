# Letter Launchpad Audio

Generated voice clips live here, but the generated MP3 files are not required for the cabinet to run. The current Nova MP3 set covers Levels 1-10.

Generate or refresh clips from the arcade repo root:

```bash
node games/letter-launchpad/scripts/generate-voice-assets.mjs --voice=nova
```

Useful variants:

```bash
node games/letter-launchpad/scripts/generate-voice-assets.mjs --dry-run
node games/letter-launchpad/scripts/generate-voice-assets.mjs --voice=marin --force
node games/letter-launchpad/scripts/generate-voice-assets.mjs --format=wav --force
```

The script reads `games/letter-launchpad/.env` when present, then writes `voice-manifest.json` plus audio files under `voice/`. The game loads that manifest when it exists and stays silent when it does not.
