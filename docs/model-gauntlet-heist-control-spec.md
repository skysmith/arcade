# Model Gauntlet: Heist Control — One-Page Test Game Spec

Status: draft  
Owner: arcade repo  
Purpose: add a fast, repeatable game mode that stress-tests local multi-model orchestration (mixture-of-experts + looped refinement) under time pressure.

## 1. One-Sentence Pitch
A timed tactical heist where the player issues one action per turn and an AI model squad generates clues, risks, and outcomes that the player must exploit before the alarm maxes out.

## 2. Core Loop (7 bullets)
- Start mission: player gets a mission brief (target, objective, turn limit, alarm threshold).
- Turn intake: player chooses one action (`Scout`, `Hack`, `Social`, `Sabotage`, `Extract`, `Wait`).
- Multi-model pass: specialist models run in parallel (intel, risk, narration), then a resolver model merges outputs into one world-state update.
- Outcome reveal: player receives concise feedback (new clue, success/failure, alarm delta, loot delta, status effects).
- Score update: game updates points, combo/streak, and mission progress after each turn.
- Adaptation loop: AI escalates defenses or exposes opportunities based on player history and current alarm.
- End state: mission resolves on objective completion, turn timeout, or alarm breach; then scoreboard and next mission seed appear.

## 3. Win/Loss Conditions
Win conditions:
- Primary objective completed before `turn_limit` and before `alarm >= alarm_max`.
- Optional perfect win: objective completed with zero critical failures and `alarm <= 60%` of max.

Loss conditions:
- Alarm reaches `alarm_max` (lockdown).
- Turn counter reaches zero before objective completion.
- Team integrity reaches zero (too many failed high-risk actions).

## 4. Scoring
Base scoring:
- Objective completion: `+1000`
- Optional objective (each): `+250`
- Valid clue chain (use clue within next 2 turns): `+120`
- Clean action success: `+80`

Penalties:
- Failed action: `-90`
- Critical failure: `-180`
- Each alarm point gained: `-4`
- `Wait` action spam (2+ consecutive waits): extra `-60` each

Bonuses:
- Low-alarm extraction bonus: `+(alarm_max - final_alarm) * 5`
- Specialist synergy bonus (correct action type after model hint): `+150`
- Speed bonus: `+30` per unused turn

## 5. Per-Turn AI Contract (Inputs/Outputs)
Required AI inputs each turn:
- `mission_state`: objective progress, turn number, alarm, integrity, active modifiers
- `player_action`: action type + optional target
- `recent_history`: last 3 turns (actions, outcomes, clues used/missed)
- `difficulty_profile`: rookie/standard/expert tuning knobs
- `model_roles`: which local models are assigned to intel, risk, resolver, narrator

Required AI outputs each turn:
- `action_resolution`: success/fail/critical with deterministic score impact
- `new_clues`: 0-2 actionable clues tagged by category (`security`, `social`, `network`, `physical`)
- `threat_update`: alarm delta, new guard state, new hazards/opportunities
- `recommended_next_actions`: top 2 actions with confidence values
- `narrative_summary`: 1-2 sentence flavor text for player-facing feedback
- `trace_meta`: model IDs used, latency per role, resolver confidence (for MOE evaluation)

## 6. Model-Mix Test Mapping (Local)
### 6.1 Fixed Expert Roles
- `qwen3:8b` -> Planner (primary): builds turn plan options, reconciles specialist outputs, and returns final world-state proposal.
- `gemma4:e4b` -> Rules/Judge (primary): validates action legality, applies deterministic scoring/alarm rules, and flags contradictions.
- `llama3.2:3b` -> Fast NPC/Dialogue (primary): generates short NPC chatter, mission radio lines, and quick hint text under tight latency.
- `qwen3-vl:4b` -> Primary Vision Analyst: reads mission images/maps and emits structured visual clues with confidence.
- `llava:latest` -> Vision Fallback / Second Opinion: used when the primary vision pass fails, times out, or returns low confidence.

### 6.2 Fallback Order (Failed/Slow Responses)
- Global timeout policy (per role call): soft timeout `1200ms`, hard timeout `2200ms`.
- Planner path:
  - Primary: `qwen3:8b`
  - Fallback A (if planner timeout/failure): `gemma4:e4b` returns reduced-complexity plan template
  - Fallback B: deterministic rules-only turn resolution (no generative plan text)
- Rules/Judge path:
  - Primary: `gemma4:e4b`
  - Fallback A: deterministic local rules engine (authoritative for score/alarm math)
  - Fallback B: `qwen3:8b` consistency pass for non-critical narrative-only rule checks
- NPC/Dialogue path:
  - Primary: `llama3.2:3b`
  - Fallback A: `gemma4:e4b` short-form line generation
  - Fallback B: static templated barks from content table
- Vision path:
  - Primary: `qwen3-vl:4b`
  - Fallback A: `llava:latest` second-opinion parse
  - Fallback B: non-vision mission branch (text-only clues seeded from mission metadata)
- Degradation rule:
  - If 2+ primary roles miss hard timeout in one turn, run judge + deterministic resolver only and skip flavor generation for that turn.

### 6.3 Token/Latency Budgets Per Role (Per Turn)
| Role | Model | Input Token Budget | Output Token Budget | Target Latency | Hard Timeout |
| --- | --- | ---: | ---: | ---: | ---: |
| Planner | `qwen3:8b` | 900 | 260 | 900ms | 2200ms |
| Rules/Judge | `gemma4:e4b` | 650 | 180 | 700ms | 1800ms |
| Fast NPC/Dialogue | `llama3.2:3b` | 260 | 90 | 300ms | 900ms |
| Primary Vision Analyst | `qwen3-vl:4b` | 700 (+image) | 160 | 1200ms | 2200ms |
| Vision Fallback / 2nd Opinion | `llava:latest` | 650 (+image) | 140 | 1500ms | 2600ms |

Budget notes:
- Combined per-turn generated output cap (all roles): `<= 760` tokens before final UI formatting.
- Narrative trimming order under pressure: NPC/dialogue -> clue prose verbosity -> planner rationale (keep rule outputs intact).

This game is intentionally turn-based and auditable so model quality can be compared on win rate, score, and clue usefulness.
