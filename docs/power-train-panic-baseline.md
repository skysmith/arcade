# Power Train Panic: Baseline Flow (S1)

## Local Run Baseline
- Build check (source project): `cd ../power-train-panic && npm run build` passed.
- Runtime check (source project): `npm run dev -- --host 127.0.0.1 --port 5176 --strictPort` started successfully and reported `Local: http://127.0.0.1:5176/`.

## Current Player Loop (As Implemented)
1. **Title screen**: press `Enter`, `Space`, mouse click, or gamepad `A/Start` to begin.
2. **Yard boots** with one active player (P1 keyboard). Trains/hazards start spawning after short delays.
3. **Core objective loop**:
   - Pick up **battery** or **cargo** at the central depot.
   - Carry to a station and deposit.
   - When a train is at that station, interact again to load pending battery/cargo into the train.
   - Send train successfully before timer expires.
4. **Parallel maintenance loop**:
   - Hazards spawn on fixed lane points.
   - Interact near hazard to clear it before TTL expires.
5. **Pacing loop**:
   - Successful actions increase score.
   - Rush level rises with score, shortening spawn timing and pressure.
6. **Failure loop**:
   - Missed trains or expired hazards reduce stability.
   - At stability `0`, run ends; restart with `R`.

## Controls Map
- **P1 (always active)**: `W/A/S/D` move, `Space` interact.
- **P2-P4**: gamepad left stick or d-pad move; `A` or `Start` interact and hot-join.
- **Restart after game over**: `R` (keyboard only).

## Scoring and Failure States
- **Score +60** for clearing a hazard.
- **Score +(120 + rush*18)** for launching a fully loaded train.
- **Stability -1** when a hazard expires.
- **Stability -1** when a train timer reaches zero.
- **Game over** when stability reaches `0`; no explicit win state (endless survival/high-score run).

## Concrete Confusion Moments (First-Time Player)
1. **Title screen (before start)**
   - The screen explains controls but not the exact 3-step delivery chain (pickup -> station prep -> train loading).
   - Likely confusion: players assume dropping at station instantly completes train service.

2. **First yard seconds (0-4s, no train yet)**
   - Station labels are visible immediately and suggest "Needs battery"/"Needs cargo" style needs once updated, but train urgency is not yet visually established.
   - Likely confusion: players may start feeding random stations before understanding where active demand is.

3. **First train spawn (~3.5s initial cooldown)**
   - Train text quickly flips to countdown seconds; loading requires a second interaction pass after station prep.
   - Likely confusion: players may deposit parts and leave, not realizing train boarding is a separate interaction.

4. **First hazard spawn (~7s initial cooldown)**
   - Same interact button handles pickup, station deposit, train loading, and hazard repair.
   - Likely confusion: action priority is implicit (hazard clears first if close), so players can trigger an unexpected action when standing near multiple targets.

5. **Mid-run messaging overlap**
   - Bottom announcer and HUD "Network" message swap frequently as events fire.
   - Likely confusion: short-lived status lines can bury the most important current objective.

6. **Game-over screen**
   - End screen explicitly says "Press R to restart"; gamepad restart is not surfaced.
   - Likely confusion for couch co-op: non-keyboard players may think the run is stuck.

## Win/Loss Clarity Snapshot
- **Win condition**: none (score attack / survive as long as possible).
- **Loss condition**: stability depletes to 0.
- **Primary success metric**: score growth via hazard clears and full train turnarounds.
