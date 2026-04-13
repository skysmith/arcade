# breakout

Controller-friendly Breakout cabinet built for quick local play.

Current setup:

- Classic single-court Breakout is the default view
- Settings lets you switch into `Multitap` for four simultaneous courts
- Browser gamepads can hot-join extra courts in multitap
- Keyboard fallback always covers the first court and all four keyboard lanes in multitap

Controls:

- Keyboard classic: arrows move, `Space` serves, `Shift` triggers a short wide-save, `P` pauses, `R` restarts
- Controller classic: left stick or d-pad moves, south/east serves, west/north triggers wide-save, `Start` pauses
- In `Multitap`, each court has its own keyboard lane
- P1 uses arrows plus `Space` / `Shift`
- P2 uses `A` / `D` plus `F` / `G`
- P3 uses `J` / `L` plus `;` / `'`
- P4 uses numpad `4` / `6` plus `0` / `1`

Bluetooth fallback:

- If the browser does not expose the controller, run `games/breakout/scripts/start-controller-bridge.sh`
- Focus the Breakout page and the native bridge will translate the controller into keyboard controls for the classic lane
