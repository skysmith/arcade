# asteroids

Shared-screen Asteroids cabinet for the local arcade shelf.

Current setup:

- `1-4` local players
- first controller becomes `P1`, extra pads join on `Start`
- keyboard fallback when no pad is connected
- direct-to-play cabinet with a compact HUD and visible back path
- classic thrust, rotate, shoot loop with asteroid splitting and hyperspace

Controls:

- Keyboard fallback: `Left` / `Right` rotate, `Up` thrust, `Space` fire, `Shift` hyperspace, `P` pause, `R` restart
- Controller: d-pad or left stick rotates, up thrusts, south/east buttons fire, west/north buttons trigger hyperspace, `Start` joins or pauses

Bridge fallback:

- If the browser refuses to expose the pad, run `games/asteroids/scripts/start-controller-bridge.sh`
- That maps the native helper to Asteroids-style keyboard controls for the same local cabinet workflow
