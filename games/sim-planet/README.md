# Sim Planet

Arcade cabinet shell for the orbital civilization sim prototype.

## Current Slice

- Launcher manifest and route registration
- Responsive 16:9 canvas stage using the shared arcade sizing helper
- Deterministic fixed-step star-system simulation with visible orbital paths
- Star, planets, moons, asteroids, orbital structures, orbit values, and spin values
- Resource economy for mass, volatiles, plasma, exotic matter, population, crew, fleet, and stability
- Civilization-wide population HUD plus local population readouts on selected worlds and structures
- Buildable collector arrays, habitat rings, shipyards, survey arrays, solar lifting rigs, retrofit platforms, mass drivers, solar lifters, O'Neill cylinders, synthetic worlds, and conditional black-hole harvesters
- Laddered science and engineering projects for civic growth, orbital refueling, robotic automation, asteroid prospecting, megahabitat charters, synthetic ecologies, singularity theory, and warp drives
- Project-driven resource improvements: civic growth feeds Population/Crew, refueling feeds Fleet, prospecting/refineries feed Mass and Volatiles, solar industry feeds Plasma, lattice work protects Stability, and black-hole work feeds Exotic Matter
- Interstellar charting and travel now sit behind late-game relay, singularity, warp-drive progression, ark population commitments, and stocked shipyards instead of early shipyard access
- No opening megastructures; larger orbitals and missions are now staged behind earlier structures, projects, and resource thresholds
- Generated Flare Forge, Dark Lens, and Ice Drift system archetypes with different resources, hazards, and build opportunities
- Clear disabled build states that list missing resources, prerequisites, black-hole requirements, or jump requirements
- Canvas and button selection for planets, asteroids, moons, black holes, and orbital structures
- Asset-local action menus where planets and structures own build, upgrade, project, chart, jump, and salvage verbs
- Expanded structure control deck that opens on gamepad `A`, enlarges the focus art panel, and lets the stick move between local actions
- Asteroid impact queue with bounded planet spin/orbit nudges
- Structure action bursts and orbit-side feedback for builds, upgrades, projects, salvage, and operations
- Calm background music playlist that continues across boot, running, and paused states after first interaction
- Local 1-4 player shared-system co-op with controller join, per-player focus panels, independent selections, and split-screen viewports

## Controls

- Join co-op: press gamepad A or Start to claim the next P1-P4 slot before or during a run
- Start: `Enter`, `Space`, joined gamepad A, or joined gamepad Start
- Back to arcade: the start-menu link, gamepad B on the boot menu, or gamepad Back/View; during a run Back/View pauses first, then exits on the next press. Quitting autosaves the current campaign.
- Reset: open the arcade pause menu and choose Reset System. Normal starts and quits resume the autosaved campaign instead of resetting.
- Pause/resume: `P`, the pause button, joined gamepad Start, or the arcade pause menu
- Time scale: `-` and `=` or the slower/faster buttons
- Select object: click/tap an object, `[` and `]`, selection buttons, or each joined gamepad d-pad/stick left/right
- Cycle within the current lane: gamepad d-pad/stick up/down steps through the current body or structure lane
- Jump lanes: `LB` snaps back to world/body selections and `RB` snaps across to orbital structures; pressing the same shoulder again cycles within that lane
- Confirm selection: gamepad A opens the selected world's, asteroid's, or structure's local deck; moving selection still drafts impact bodies/targets, and inside the deck A runs the highlighted action
- Cancel/back: gamepad B cancels the current selection back to the drafted target, resumes from pause, or returns to the arcade from the boot menu
- Command/build: gamepad X quick-runs the selected asset action, and while a local deck is open it executes the highlighted action
- Impact draft: select an asteroid and press `A`; select a planet and press `T`; cycle impact mode with `M`
- Queue impact: `Q`, the Queue Impact button, or joined gamepad Y
- Chart next system: `C` or the Chart button after deep-space relay work unlocks discovery
- Jump to charted system: `J` or the Jump button once warp drives, a stocked shipyard, and the required reserves are ready
- Build structures: select a planet or black hole and use its local action menu, or press gamepad X when the selected asset exposes a build action
- Split-screen: when two or more players are active, each player gets an independent camera centered on their current selection
