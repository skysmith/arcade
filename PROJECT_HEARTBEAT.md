# Arcade Project Heartbeat

This is the cloning guide for family arcade cabinets in this repo.

## Core Rule

Every cabinet should be ready in one move:

- open the arcade shelf
- pick the game
- first player seats automatically, extra players join with `Start`
- play immediately
- leave with one obvious back path

No splash screens.
No big public-facing marketing header.
No account flow.
No setup flow unless something truly broke.

## Experience Principles

- Cabinet-first, not website-first. The game should feel like a machine you step up to, not a product page.
- Fast start. First meaningful input should happen within a few seconds of opening.
- Low reading load. Small status text is fine, but rules should be obvious from play.
- Small chrome. HUD should stay compact and out of the way.
- Shared machine assumptions. These games live on one machine for me and the kids, not for the public internet.
- Short session friendly. A cabinet should be fun for 2 minutes or 20 minutes.

## Input Principles

- Default to local play for `1-4` players.
- Build every new cabinet so it can scale up to four local players.
- Start with one active player.
- If a controller is present, seat the first pad as `P1`.
- Extra browser-visible controllers should join only when `Start` or `Star` is pressed.
- Live join should work during active play, not just before the round begins.
- If controllers disconnect, remove or idle that player cleanly without wedging the cabinet.
- Keep a keyboard fallback for testing when no controller is connected.
- Use the native 8BitDo bridge pattern from Tetris as the fallback when the browser hides a controller.

## Controller Pattern

There are two controller paths:

1. Browser hot-join
   - Use `navigator.getGamepads()`.
   - Poll every frame or on a tight loop.
   - Seat the first available pad as `P1`.
   - Hold extra pads in a waiting state until `Start` is pressed.
   - Remove that player when the pad disappears.

2. Native fallback bridge
   - Tetris already uses `games/tetris/scripts/start-controller-bridge.sh`.
   - That bridge now lives in `tools/controller-bridge/controller-mouse.m`.
   - We now treat that helper as the reusable fallback for cabinets that need dependable 8BitDo support outside browser gamepad detection.

See `docs/controllers.md` for the concrete wiring pattern and cabinet bridge launch scripts.

## Layout Pattern

- No giant title block at the top.
- Main playfield gets most of the screen.
- Tiny top or bottom rail for status is enough.
- Do not place boxes, banners, decorative assets, or other UI on top of the game window; keep the playfield visually clear.
- Back-to-arcade should always be visible or easy to reach.
- Settings should be rare and hidden until needed.

## Cabinet Checklist

Before calling a cabinet done, check:

- loads directly into play
- one player works immediately
- extra controllers can join with one deliberate button press, ideally `Start`
- if no controllers are present, keyboard fallback still works
- there is an obvious way back to the arcade shelf
- no dead-end menu screens
- HUD text is readable from a few feet away
- restart is one button, not a flow

## Must-Have Cabinets

These are strong fits for this shelf and are fully within the kind of work Codex can keep shipping here:

- Space Invaders
- Pac-Man style maze chase
- Breakout or Arkanoid
- Galaga style fixed shooter
- Bomberman style local arena
- Tron light cycles
- Rampage-lite city smash
- Snow Bros or Bubble Bobble style shared screen co-op
- Frogger
- Puzzle Bobble
- River Raid style vertical shooter
- Smash TV style twin-stick room survival

## Multiplayer Defaults

- `1 player`: should still feel complete and worth opening.
- `2 players`: default sweet spot for siblings or parent-plus-kid.
- `3-4 players`: should expand only when extra pads explicitly join, ideally with `Start`.
- When extra players join, rebalance positions instead of restarting if possible.

## Build Style

- Prefer plain HTML/CSS/JS unless the cabinet really needs a heavier runtime.
- Keep assets light.
- Use deterministic rules and visible feedback.
- Favor bold silhouettes and clear hitboxes over polish-heavy art passes.

## Ship Rhythm

For each new cabinet:

1. Define the one-sentence fantasy.
2. Define the 2-4 verbs players use.
3. Make the first playable loop.
4. Add controller join flow.
5. Add restart and back path.
6. Only then add score, juice, audio, or variants.

## Current Baseline

- repo root is the launcher shelf.
- `games/tetris/` is the reference for the native controller bridge.
- `games/space-invaders/` is the reference for browser hot-join plus bridge fallback notes in a stripped-down cabinet.
- `games/donkey-kong/` is the reference for a four-player live-join action cabinet on a classic single-screen stage.

See `docs/cabinets.md` for how manifests, launcher entries, and cabinet file layout fit together.
