# Nova Drift — Game Spec Scaffold

Status: scaffold  
Owner: arcade repo  
Purpose: turn the remake sheet into a buildable game plan for implementation inside this repo.

Related docs:
- `docs/nova-drift-remake-sheet.md`

---

## 1. One-Sentence Pitch
A modern open-galaxy space sandbox where cargo runs, piracy, boarding actions, and faction choices turn a nobody captain into a galactic force.

## 2. Product Intent
This project should capture the feeling of old-school open-ended space games without inheriting their most painful friction. The game should be immediately legible, highly replayable, and full of systems that collide in story-generating ways.

The player should be able to:
- Haul cargo for profit
- Take contracts and faction jobs
- Fight and disable enemy ships
- Board targets and steal cargo or whole hulls
- Build a small escort fleet
- Explore sectors and unlock more dangerous opportunities
- Drift toward trade lord, mercenary, pirate, loyalist, or chaos agent playstyles

---

## 3. Design Goals

### Primary Goals
- Preserve freedom-first sandbox play
- Make progression feel dramatic from the first hour
- Put boarding and capture near the center of the fantasy
- Support systemic storytelling over heavily scripted spectacle
- Keep the interface fast, readable, and low-friction

### Secondary Goals
- Allow strong faction identity and route-based world knowledge
- Support future modding / expansion hooks
- Make the galaxy feel alive without requiring MMO-scale simulation

### Non-Goals
- Not an MMO
- Not a grand strategy game
- Not a hard-sim spreadsheet economy
- Not a cinematic narrative-first game with lots of cutscenes
- Not a bullet-hell shooter

---

## 4. Target Player Experience

### Early Game
The player is fragile, underfunded, curious, and constantly choosing between safe work and risky opportunity.

### Mid Game
The player has a preferred style, a recognizable ship, and enough power to make enemies and shape routes.

### Late Game
The player can field escorts, swing faction outcomes, capture high-value ships, and pursue a self-defined career path.

### Emotional Tone
- Lonely but exciting
- Blue-collar sci-fi
- Scrappy, dangerous, opportunistic
- Slightly romantic about the space-trucker / outlaw fantasy

---

## 5. Core Pillars

### 5.1 Freedom
The player can choose where to go, what to haul, who to work for, and how dirty they want to get.

### 5.2 Risk-to-Reward Escalation
Small risks become larger opportunities. A courier job can become a fight, a boarding action, a ship capture, and a faction incident.

### 5.3 Ship Identity
Ships are not just stat containers. Hull class, weapon layout, cargo space, speed, and boarding potential all shape playstyle.

### 5.4 Consequence
Faction standing, criminal activity, and route choices should change access, hostility, pricing, and mission availability.

### 5.5 Emergence
The game should produce player stories that feel authored even when systems caused them.

---

## 6. Scope by Development Phase

## Phase 1 — Vertical Slice / First Real Game
Goal: prove the fantasy is already fun.

Includes:
- Core flight and combat
- Trading and cargo economy
- Mission board and procedural jobs
- 1 major faction arc stub or mini-campaign
- Boarding and ship capture
- Basic escorts
- 1 starter region + 2 expansion regions
- Basic reputation and hostility
- Save/load

Excludes for now:
- Deep crew simulation
- Capital ships
- Dynamic warfront changes
- Multiplayer
- Full mod tooling

## Phase 2 — Living Galaxy
Goal: add world reactivity and stronger identity.

Adds:
- Dynamic shortages / surpluses
- More factions and branching arcs
- Contraband and scanning
- Rival captains
- Blockades / patrol pressure
- Better fleet commands
- More sector states

## Phase 3 — Forever Layer
Goal: support long-term inhabitability.

Adds:
- Co-op or async features
- Modding hooks
- Scenario tools
- Territory influence
- Capital-adjacent late game systems

---

## 7. Core Gameplay Loop
1. Take a job, rumor, or self-directed route plan
2. Travel through one or more systems
3. Trade, fight, evade, scan, or scavenge
4. Dock and resolve consequences
5. Upgrade ship, loadout, cargo strategy, or faction alignment
6. Unlock riskier but more profitable options
7. Repeat with growing agency and power

### Signature Chain-Reaction Loop
- Accept modest courier contract
- Get intercepted by pirates
- Disable one attacker
- Board and loot
- Realize captured ship is worth more than original contract
- Limp to port under pressure
- Sell, repair, or keep the hull
- Entire run changes your trajectory

This loop should be common enough to define the game’s identity.

---

## 8. Core Systems

## 8.1 Flight
Requirements:
- Immediate, readable ship control
- Distinct feel by hull size and engine profile
- Travel mode vs combat pressure should be clearly legible

Questions to settle:
- Pure 2D top-down vs 2.5D presentation
- Newtonian-lite vs fully arcade handling
- Manual docking vs contextual docking

## 8.2 Combat
Requirements:
- Real-time combat with clear weapon arcs and damage feedback
- Weapon classes that create different engagement envelopes
- Fights should be lethal enough to matter but not too twitch-heavy

System ideas:
- Shields, armor, hull
- Heat / energy / ammo constraints
- Weapon slots by hull class
- Target disable states for boarding opportunities

## 8.3 Boarding / Capture
This is a signature system and should be treated as a first-class feature.

Phase 1 requirements:
- Disabled ships become boardable
- Boarding presents clear odds and stakes
- Outcomes include loot, failed boarding, or ship capture
- Captured ships can be sold, kept, or converted to escort use

Future depth:
- Crew quality
- Security modules
- Morale / surrender thresholds
- Special event outcomes during boarding

## 8.4 Trade Economy
Requirements:
- Commodity prices vary by region and local context
- Routes should be learnable and exploitable
- The economy should support fantasy, not homework

Commodity categories:
- Essentials
- Industrial goods
- Medicine
- Luxury goods
- Contraband
- Munitions / ship supplies
- Rare tech

## 8.5 Missions / Contracts
Phase 1 mission types:
- Cargo delivery
- Courier / dispatch
- Escort convoy
- Patrol / bounty
- Recovery / salvage
- Smuggling-lite

Mission qualities:
- Quick to read
- Clear risk and reward
- Strong sector/faction flavor
- Sometimes cascade into emergent events

## 8.6 Faction Reputation
Each faction should track:
- Standing / reputation value
- Access unlocks
- Hostility thresholds
- Mission availability
- Market or docking privileges

Example faction set:
- Central authority
- Frontier independents
- Corporate bloc
- Pirate clusters
- Ideological cult / tech sect
- Unknown edge faction

## 8.7 Exploration
Requirements:
- Clear star map
- Discoverable sectors or routes
- Fog / intel gating where useful
- Reasons to leave safe space

## 8.8 Escort Fleet
Phase 1:
- Limited escort count
- Follow / attack / defend basic commands
- Escorts can be hired or captured

Later:
- Formations
- Role assignments
- Fleet logistics
- Carrier behavior

---

## 9. Progression Model

### Main Progression Axes
- Better hulls
- Better weapons and modules
- Larger cargo opportunities
- Better reputation or criminal access
- Fleet growth
- Sector access
- Storyline branch access

### Progression Rule
The player should sometimes be able to skip the normal ladder through risk, luck, and daring. Capturing a bigger ship early should feel thrilling, not invalid.

### Anti-Progression Trap
Do not make the player grind predictable low-risk routes for too long. The game needs surprise and volatility early.

---

## 10. World Structure

## 10.1 Galaxy Layout
Minimum phase 1 structure:
- Starter core pocket
- Frontier route band
- Pirate danger region
- Security-heavy faction core
- Weird edge region teaser

## 10.2 Sector Roles
Each sector should have at least one strong identity:
- Trade hub
- Mining / industrial world
- Agricultural supplier
- Military checkpoint
- Black market stop
- Frontier outpost
- Story-critical sector

## 10.3 Traffic Simulation
Traffic types:
- Traders
- Patrols
- Pirates
- Couriers
- Mission convoys
- Neutrals

Traffic should reinforce the sense that the galaxy exists without the player.

---

## 11. Narrative Structure

### Narrative Philosophy
The story should mostly emerge from systems, but the game still benefits from a few strong authored arcs.

### Phase 1 Story Approach
Build one faction thread that starts with small utility jobs and escalates into consequential decisions.

Possible arc shape:
1. Routine contracts for a frontier contact
2. Suspicious disruption on trade routes
3. Conflict with patrols / pirates / corporate pressure
4. Fork in loyalty or profit motive
5. Early-game climax that changes sector access or faction standing

### Story Content Rules
- Avoid long cutscenes
- Keep mission text punchy
- Let consequences show up in the world state
- Prefer branching through opportunities rather than dialogue trees alone

---

## 12. UI / UX Spec Skeleton

## 12.1 UX Principles
- Fast to parse
- Minimal friction between intent and action
- Strong at-a-glance ship readability
- Trading and loadout screens should feel satisfying, not bureaucratic

## 12.2 Core Screens
Need at minimum:
- Main menu
- Save/load profile
- Galaxy / starmap
- In-flight HUD
- Target / boarding panel
- Dock / station home
- Market / cargo screen
- Shipyard / outfitting screen
- Mission board
- Faction / reputation screen
- Fleet / escort screen
- Event / message log

## 12.3 HUD Elements
Candidate HUD modules:
- Hull / shield / energy / heat
- Speed and heading
- Target info
- Weapon group status
- Cargo risk / contraband alerts
- Nearby contacts radar or tactical ring
- Jump / docking prompts

## 12.4 Readability Priorities
- Boarding opportunity must be obvious
- Illegal goods risk should be obvious
- Friendly vs hostile status must be unmistakable
- Damage state needs strong feedback

---

## 13. Content Model

## 13.1 Ship Data
Each ship hull should define:
- Hull id
- Faction affinity
- Class
- Base sprite / visual profile
- Cargo capacity
- Speed / turn / mass
- Hull / armor / shield values
- Crew capacity
- Hardpoints / module slots
- Boarding difficulty
- Base price
- License / unlock requirements

## 13.2 Weapon / Module Data
Each item should define:
- Item id
- Type
- Slot compatibility
- Cost
- Damage profile
- Power / heat / ammo impact
- Range
- Special effects

## 13.3 Commodity Data
Each commodity should define:
- Commodity id
- Category
- Base price
- Legality by faction / sector
- Typical source sectors
- Typical sink sectors
- Volatility modifier

## 13.4 Mission Data
Each mission should define:
- Mission id
- Mission type
- Offering faction / source
- Requirements
- Reward
- Failure state
- Expiration rules
- Triggered encounter potential

---

## 14. State / Save Model
Candidate save buckets:
- Player identity and credits
- Current ship and loadout
- Owned ships and escorts
- Cargo inventory
- Faction standings
- Mission states
- Discovered sectors / routes
- Story flags
- Sector conditions
- Message log / intel snippets

Important rule:
The save model should support future dynamic-world additions without hard rewrites.

---

## 15. Technical Architecture Scaffold
This section should be revised once the repo’s preferred stack is confirmed.

### Candidate Runtime Shape
- Core game loop module
- World simulation module
- Combat module
- Economy module
- Mission system module
- Save/load module
- Data-driven content packs for ships/items/commodities/factions
- UI layer for menus, overlays, and station screens

### Architectural Principles
- Favor data-driven definitions over hardcoded content
- Separate simulation state from presentation state
- Keep combat deterministic enough for future replay/debugging if useful
- Build phase 1 in a way that does not trap future expansion

### Open Tech Questions
- Rendering framework / engine
- UI framework inside arcade repo
- Asset pipeline
- Save format
- Content authoring workflow
- Mod support boundary

---

## 16. Milestone Scaffold

## Milestone 0 — Repo Fit
- Confirm engine / framework choice inside arcade repo
- Decide directory structure for Nova Drift game module
- Add placeholder assets / mock data
- Establish run/build/test loop

## Milestone 1 — Flyable Box
- One test ship
- One test map / sector
- Movement and camera
- Docking / undocking loop
- Basic HUD

## Milestone 2 — First Combat Slice
- Enemy spawning
- Weapons and damage
- Disable state
- Loot drop / recovery
- Death / repair loop

## Milestone 3 — Trading Slice
- Market screen
- Commodity definitions
- Cargo capacity
- Profitable route loop

## Milestone 4 — Boarding Slice
- Boardable disabled ships
- Boarding outcome resolution
- Capture / sell / keep flow
- Escort assignment for captured ships

## Milestone 5 — First Real Region
- 5–10 sectors
- 3 factions in playable relationship
- Mission board
- Reputation values
- One short branching storyline

## Milestone 6 — Vertical Slice Polish
- UI cleanup
- Better balancing
- Sound / music pass
- Save/load stability
- Intro flow and onboarding

---

## 17. Balancing Principles
- Trade should be reliable but not dominate every strategy
- Combat should be risky enough to be memorable
- Boarding should be tempting, not trivial
- Pirates should create fear early and opportunity later
- Escorts should feel useful before they feel overpowered
- Better ships should widen options, not erase tension completely

---

## 18. Risks

### Design Risks
- Economy becomes too mathy
- Combat becomes too arcade-twitch or too flat
- Boarding feels like a hidden side mechanic instead of the star feature
- Fleet layer becomes micromanagement sludge

### Production Risks
- World simulation scope balloons too fast
- Too many hulls / factions before core loop is fun
- UI complexity slows iteration
- Narrative ambitions outrun systems quality

---

## 19. Immediate Next Build Tasks
1. Confirm runtime / engine choice for this repo
2. Choose the module path for the Nova Drift game inside arcade
3. Create a thin technical design doc after stack confirmation
4. Define first-pass data schemas for:
   - ships
   - weapons
   - commodities
   - factions
   - missions
5. Build Milestone 1 flyable box before touching deep narrative or faction complexity

---

## 20. Open Questions
- What is the arcade repo’s intended engine or rendering stack?
- Is Nova Drift meant to live as a standalone game package or inside a shared launcher framework?
- What visual style is cheapest to ship while still feeling evocative?
- How much of the economy should be simulated globally vs locally faked?
- Should boarding resolve as pure odds, lightweight tactics, or hybrid event text?
- How many ships are enough for phase 1 without content bloat?
- What is the minimum fun faction model for first playtests?

---

## 21. Definition of Success
A playtester should be able to say something like:

> I took a small freight job, got jumped, barely survived, stole a better ship, sold illegal cargo at a sketchy outpost, and now I think I accidentally joined a political conflict.

If that sentence feels natural after the first real playtest, the project is pointed in the right direction.
