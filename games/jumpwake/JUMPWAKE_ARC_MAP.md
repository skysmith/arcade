# Jumpwake Arc Map

Practical next-step planning doc for worldbuilding and future narrative implementation.

This picks up after the current shipped state:

- `Mara`, `Dax`, and `Juno` each have a three-beat recurring thread
- the player can drift toward `Authority` or `Nightglass`
- the `coreArc` already establishes the nearby stars as politically important

The next step is not broad lore expansion.
The next step is to turn existing threads into collisions.

## Goal

Move Jumpwake from:

- interesting contacts with parallel arcs

to:

- recurring contacts whose truths interfere with each other
- faction choices that change what information is safe to carry
- a player identity shaped by who they become useful to

## What The Setting Is Really About

At the next layer, the setting should revolve around three linked questions:

1. Who actually kept the lanes alive when official systems weakened?
2. Who gets to own that history once it surfaces?
3. What does the player have to trade away to stay useful?

Those questions let worldbuilding, future missions, and faction tension all point in the same direction.

## Current Story Spine

The current implementation already gives us five strong narrative pillars:

- `Mara`: trust as infrastructure
- `Dax`: salvage as memory recovery
- `Juno`: logistics as moral pressure
- `Ilya`: records as political power
- `Vey`: secrecy as leverage

`Tovin` is the useful pressure valve:

- law enforcement that is not fully clean
- a combat-facing thread that can expose political compromise

## Next Narrative Layer

The next authored layer should be built around crossovers, not brand-new isolated contacts.

Use this structure for all future planning:

### A thread should now unlock four things

- `Truth`: what the player learns
- `Threat`: who is endangered by that truth
- `Witness`: which other contact notices the player now has it
- `Choice`: what kind of captain the player must be next

If a future beat does not unlock at least one of those, it is probably side flavor instead of arc material.

## Crossover Arc Set

These are the next three arcs worth building.

### 1. Ledger War

Primary contacts:

- `Dax`
- `Ilya`

Supporting contacts:

- `Mara`
- `Juno`

Core premise:

- Dax's recovered ledgers start contradicting the official archive.
- Ilya cannot dismiss the discrepancy forever.
- The records matter because they show the nearby stars carried each other through periods the core now narrates incorrectly.

What it adds to the world:

- concrete history of lane contraction, missing manifests, and selective forgetting
- proof that bureaucracy is not neutral memory, but curated memory
- a believable reason the core suddenly cares about old wreck data

Player pressure:

- hand the evidence to Ilya and help formal recognition
- let Mara route copies through independent hands first
- give Juno enough documentary proof to turn history into labor leverage

Good mission shapes:

- salvage recovery with a non-scrap objective
- courier chain with competing recipients
- one mission where the player chooses which copy is the "real" one

### 2. Relief Network

Primary contacts:

- `Juno`
- `Mara`

Supporting contacts:

- `Tovin`
- `Vey`

Core premise:

- Juno wants durable supply resilience.
- Mara already operates a practical informal network.
- The tension is whether systems survive through solidarity, brokerage, or coercion.

What it adds to the world:

- how clinics, tugs, dock crews, and dispatchers actually keep frontier life working
- how "independence" can mean mutual aid or private gatekeeping depending on who is talking
- how lawful enforcement often arrives after the damage, then claims authority over the fix

Player pressure:

- help Juno formalize emergency corridors
- help Mara keep them unofficial and flexible
- let Tovin secure them in a way that increases inspections
- let Vey monetize their gray edges

Good mission shapes:

- convoy escort tied to medicine or food
- shortage response triggered by sector conditions
- same destination, different sponsor, different moral cost

### 3. Quiet Heat

Primary contacts:

- `Mara`
- `Vey`
- `Tovin`

Supporting contacts:

- `Ilya`

Core premise:

- Nightglass and the Authority both claim they reduce chaos.
- Mara lives in the middle, protecting rooms that neither side fully owns.
- Tovin increasingly targets people whose guilt depends on who wrote the report.

What it adds to the world:

- the difference between lawful order and stable life
- how deniable syndicate logistics can genuinely preserve alternatives
- how "clean" enforcement can still be political violence

Player pressure:

- carry a burn notice that protects a source but frames someone else
- take a lawful interdiction job against a target with ambiguous guilt
- decide whether Grey Exchange remains porous, aligned, or compromised

Good mission shapes:

- interdiction followed by boarding and evidence choice
- smuggling run where the cargo is information, not contraband
- bounty contract that becomes morally unstable after capture

## Character Expansion Priorities

The next character work should not add ten more contacts.
It should finish the core ensemble so every major axis has a personal face.

### Priority 1: give Vey a full three-beat thread

Current role:

- faction path face
- mood-rich but not yet equally dimensional in authored beats

Needed beats:

1. `Nightglass Offer`
2. `Quiet Wake`
3. `Burn Notice`

What the arc should reveal:

- Vey does not merely want delivery discipline
- Vey is testing whether the player can carry selective truth
- Nightglass preserves options, but only for people it chooses

### Priority 2: give Ilya a full personal thread

Current role:

- core arc face
- strong thematic role, limited personal progression

Needed beats:

1. `Core Transit Screening`
2. `Old Light Charter`
3. `Blue Archive Hearing`

What the arc should reveal:

- Ilya is not just a clerk, but a curator of legitimacy
- he knows the core depends on frontier systems more than it admits
- his honesty becomes less abstract when the player can embarrass him, help him, or outmaneuver him

### Priority 3: give Tovin a true dilemma arc

Current role:

- strong bounty voice
- not yet a fully realized moral thread

Needed beats:

1. disable raiders
2. identify who benefits from raids
3. choose whether an official target is actually guilty

What the arc should reveal:

- violence in the lane is often administratively useful to somebody
- Tovin is either trapped inside that machine or helping run it
- the player's combat success can create political consequences

## Worldbuilding Targets

These are the world details worth defining next because they generate missions.

### 1. Lane Contraction History

Define:

- when the nearby lanes thinned or were deprioritized
- what the official explanation was
- what independent and frontier crews say actually happened

Why it matters:

- powers the Dax/Ilya conflict
- gives Barnard's Star and the relays historical weight

### 2. Practical Survival Infrastructure

Define:

- who keeps clinics supplied
- who repairs haulers when formal support fails
- which stations are held together by favors rather than budgets

Why it matters:

- powers Juno/Mara crossover
- makes freight stakes feel human, not abstract

### 3. Registry And Permit Logic

Define:

- what permits really grant
- what records can be altered or quietly buried
- how a captain gets flagged, tolerated, or quietly sponsored

Why it matters:

- powers Ilya/Tovin content
- makes lawful vs gray play feel systemic

### 4. Nightglass Operating Model

Define:

- what Nightglass protects
- what it monetizes
- who it considers disposable

Why it matters:

- keeps Vey from feeling like stylish generic smuggling
- sharpens the authority vs syndicate choice into an ideological one

## Recommended Implementation Order

This is the most useful build order for narrative progress.

### Step 1

Add a second planning layer to `CONTACT_BIBLE.md` or keep it here:

- one section per crossover arc
- one paragraph on truth/threat/witness/choice

### Step 2

Implement `Vey`, `Ilya`, and `Tovin` as explicit recurring arc states in `game.js`, parallel to:

- `state.contactArcs.mara`
- `state.contactArcs.dax`
- `state.contactArcs.juno`

Suggested new state shape:

```js
contactArcs: {
  mara: { stage: "intro", completed: [] },
  dax: { stage: "intro", completed: [] },
  juno: { stage: "intro", completed: [] },
  vey: { stage: "intro", completed: [] },
  ilya: { stage: "intro", completed: [] },
  tovin: { stage: "intro", completed: [] },
}
```

### Step 3

Create one crossover contract generator, not just more single-thread beats.

Example concept:

- `generateCrossoverContracts(sectorId)`

It should unlock only when:

- one or more prerequisite contact beats are complete
- the sector makes narrative sense
- the player has already earned enough trust to make the choice meaningful

### Step 4

Let archive entries reflect contradiction, not just progress.

New archive files should increasingly show:

- official record
- recovered record
- dock rumor

That lets the archive become a story engine instead of only a codex.

## Immediate Content Backlog

If we only do one small chunk next, do this:

1. Add `vey`, `ilya`, and `tovin` to `contactArcs`.
2. Author a three-beat chain for each.
3. Add one crossover unlock:
   - `dax-ledger-war-1`
   - unlocks only if `dax-red-ledger` and `core-arc-sol-briefing` are complete

If we do one medium chunk next, do this:

1. Add those three new contact arcs.
2. Add `generateCrossoverContracts(sectorId)`.
3. Add archive contradiction entries for:
   - official archive version
   - recovered ledger version
   - dock rumor version

## One-Sentence North Star

Jumpwake should feel like a game where hauling, salvage, smuggling, and patrol work all gradually reveal the same thing:

- space is held together by whoever moves truth, supplies, and trust faster than institutions can control them.
