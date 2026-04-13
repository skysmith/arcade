# bomberman

Shared-screen Bomberman-style cabinet for the family arcade shelf.

Current setup:

- `1-4` local players
- first controller becomes `P1`, extra pads join on `Start`
- keyboard fallback when no pad is connected
- soft blocks hide powerups and the exit hatch
- short rounds with quick restarts and a clean back path

Controls:

- Keyboard fallback: arrows move, `Space` drops a bomb, `P` pauses, `R` restarts
- Controller: d-pad or left stick moves, south or east button drops a bomb, `Start` pauses for seated players

Bridge fallback:

- If the browser refuses to expose the pad, run `games/bomberman/scripts/start-controller-bridge.sh`
- Focus the Bomberman page and the native bridge will translate the controller into keyboard controls for the first bomber
