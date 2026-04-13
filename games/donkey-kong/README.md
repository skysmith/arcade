# donkey-kong

Single-screen Donkey Kong-style cabinet for the local arcade shelf.

Current setup:

- barrel-stage homage with girders, ladders, Kong, and Pauline
- up to `4` simultaneous local climbers
- first controller becomes `P1`, extra pads can join live with `Start`
- keyboard fallback for solo testing
- native 8BitDo bridge launcher for single-lane fallback when the browser hides a pad

Controls:

- Keyboard fallback: `Left` / `Right` move, `Up` / `Down` climb, `Space` jump, `P` pause, `R` restart
- Controller: d-pad or left stick move and climb, south button jumps, `Start` joins or pauses

Bridge fallback:

- If the browser hides the pad, run `games/donkey-kong/scripts/start-controller-bridge.sh`
- That uses the shared native helper with a simple platformer lane mapping
