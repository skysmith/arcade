# space-invaders

Minimal local co-op Space Invaders cabinet for the family arcade shelf.

Current setup:

- `1-4` local players
- first controller becomes `P1`, extra pads join on `Start`
- keyboard fallback when no pad is connected
- tiny HUD, no oversized title chrome
- native 8BitDo bridge fallback script for browsers that hide the controller

Controls:

- Keyboard fallback: `Left` / `Right` to move, `Space` to fire, `P` to pause, `R` to restart
- Controller: d-pad or left stick to move, south/east button to fire, start to pause

Bridge fallback:

- If the browser refuses to expose the pad, run `games/space-invaders/scripts/start-controller-bridge.sh`
- That uses the same native helper family as Tetris, but mapped for a shooter lane instead of Tetris actions
