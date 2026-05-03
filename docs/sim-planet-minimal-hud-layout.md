# Sim Planet Minimal HUD Layout

Status: target layout
Purpose: define the lighter HUD pass before implementation so the orbital playfield stays readable.

## Layout Goals
- Keep the center 70% of the canvas visually open during normal play.
- Remove always-on boxed HUD blocks from the live orbital view.
- Use compact floating text, chips, and edge-aligned status strips with transparent or near-transparent backing.
- Disable pointer events on passive HUD text so canvas selection remains reliable.
- Keep buttons, command drawers, pause surfaces, and build/travel controls interactive only when open or focused.

## Single-Player Target
- **Top left**: one small objective line with the current goal and a short detail line. No card frame; use subtle text shadow or a 20-30% dark scrim only if contrast fails.
- **Top right**: compact resource chips for Cycle, Stability, Mass, Volatiles, Plasma, Exotic, Crew, Fleet, System, Jumps, and Operators. Chips wrap at the edge and use minimal padding, not article cards.
- **Left edge below objective**: warnings collapse to a single warning count chip while clear. When warnings exist, show at most two short warning lines; full warning details move to pause or a temporary drawer.
- **Bottom left**: P1 focus readout floats as text: selected body/structure, orbit, spin, target, asteroid, and impact mode. The readout is not a boxed command panel.
- **Bottom right**: command hint strip shows keyboard and controller verbs: `A Confirm`, `B Cancel`, `X Build/Command`, `Y Queue`, shoulders/category, d-pad/stick focus. Keep it one line when possible.
- **Context drawers**: build orders, travel controls, event log, and full command buttons are collapsed by default. Open them only after an explicit keyboard/controller/button request or when the boot/pause menu is active.

## Multiplayer Target
- **Split-screen overlays**: each viewport gets a tiny player tag anchored to that viewport corner, with player label, focus label, and one short action hint.
- **Global resources**: stay in one shared top-edge chip row. Do not duplicate full resource rows per player.
- **Global objective**: one short objective line stays at the top or bottom edge, whichever leaves the current split layout clearer.
- **Warnings**: collapse to a shared warning chip in multiplayer; show full warning text only in a drawer or pause view.
- **Player focus**: replace the current four boxed player panels with compact per-viewport text tags. Include target, asteroid, and impact mode only when the player is drafting or has an active impact.
- **Command/build/travel panels**: hidden during normal split-screen play. P1 can open a compact command drawer, but it should cover no more than one split quadrant edge and should auto-collapse after action or cancel.

## Interaction And Discoverability
- Persistent HUD surfaces should set `pointer-events: none`; interactive drawers and buttons opt back in with `pointer-events: auto`.
- Keyboard controls remain discoverable through the bottom hint strip and pause menu.
- Controller controls remain discoverable through the same hint strip plus contextual per-player hints.
- Start menu and pause menu can keep framed panels because the simulation is not actively being inspected there.
- Event log messages become transient edge toasts, capped to one or two lines, with full history available from pause.

## Implementation Boundaries
- Normal running view should show no large boxed panels over the star system.
- Persistent overlay coverage should stay under 15% of the canvas in single-player and under 10% per viewport in multiplayer.
- The lower-middle canvas should remain empty so orbital paths, asteroid impacts, and focused planets remain visible.
- On narrow screens, resource chips collapse to priority values: Stability, Mass, Plasma, Crew, Fleet, and Travel. Secondary values remain available in pause.
- Text must remain legible over bright stars and orbits using shadow, outline, or minimal scrim rather than full panels.
