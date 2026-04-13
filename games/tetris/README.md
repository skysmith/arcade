# tetris

Controller-friendly browser Tetris built for quick local play.

Current setup:

- Classic single-board Tetris is the default view
- Settings lets you switch into `Multitap` when you want four separate terminals
- Settings includes built-in lo-fi game music with selectable tracks

Files:

- `index.html` sets up the arcade shell, board layouts, and settings modal
- `style.css` handles the presentation, responsive layout, and sharper corners
- `game.js` contains the gameplay, mode switching, native-bridge messaging, and rendering
- `scripts/start-controller-bridge.sh` starts the native HID-to-keyboard fallback for Bluetooth controllers the browser cannot see
- `arcade.connection.json` is the manifest that registers Tetris in the arcade launcher

Controls:

- Keyboard: arrows move, `Z`/`X` rotate, `C` hold, `Space` hard drop, `P` pause, `R` restart
- Controller: d-pad or left stick moves, south/right shoulder rotate CW, west/left shoulder rotate CCW, east hold, north hard drop, start pause
- In `Multitap`, each terminal has its own keyboard lane
- P1 uses arrows plus `Z`/`X`/`C`/`Space`
- P2 uses `A`/`D`/`S` plus `Q`/`W`/`E`/`F`
- P3 uses `J`/`L`/`K` plus `U`/`I`/`O`/`[`
- P4 uses numpad `4`/`6`/`5` plus `7`/`8`/`9`/`0`

Bluetooth fallback:

- If the browser does not expose the controller, run `games/tetris/scripts/start-controller-bridge.sh`
- Focus the Tetris page and the native bridge will translate the 8BitDo controller into keyboard controls for the classic lane
- The shared helper lives at `tools/controller-bridge/controller-mouse.sh`

Arcade frontend registration:

- `arcade.connection.json` provides the launcher card metadata for this cabinet
- `arcade.connections.json` at the repo root includes `./games/tetris/arcade.connection.json`
- The launcher loads that manifest and uses its `path` field to open `./games/tetris/index.html`
