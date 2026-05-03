# Whispering Willow Audio Assets

Voice clips are generated with `scripts/generate-voice-assets.mjs` from `scripts/voice-lines.json`.

The game loads `assets/audio/voice-manifest.json` when present. Each manifest clip includes the character id, voice, text, and relative audio file path so contact-thread messages can replay the matching character performance.

Open `assets/audio/voice-preview.html` from the local arcade server to listen through the manifest clips with search and group filters.

Generation expects `OPENAI_API_KEY` in `games/whispering-willow/.env` or in the shell environment.

Music files in `music/` are local Suno exports copied from Downloads for personal use:

- `roots-of-lumen-dock.mp3`
- `willowlight-path-flight.mp3`
- `roots-of-lumen-map.mp3`
- `willowlight-path-tension.mp3`

The game treats these as a continuous playlist instead of mode-specific tracks, so opening the map or traveling does not interrupt the currently playing song. The contacts/message screens intentionally pause music so character voice lines stay clear, then the same playlist position resumes afterward.
