# Lives Implementation Inventory

This file tracks the arcade modules that still implement a player-lives system. Those modules now default to unlimited lives through the shared helpers in `shared/lives-config.js`.

## Life-aware game modules

1. `games/asteroids/game.js`
2. `games/bomberman/game.js`
3. `games/breakout/game.js`
4. `games/donkey-kong/game.js`
5. `games/donkey-kong-2/game.js`
6. `games/snow-bros/game.js`
7. `games/space-invaders/game.js`

## Shared default unlimited behavior

### Canonical default
- Use one shared sentinel: `DEFAULT_PLAYER_LIVES = Number.POSITIVE_INFINITY` (`Infinity`).
- Keep `DEFAULT_FINITE_LIVES = 3` only for bounded displays and score math that must stay finite.
- Shared helpers are defined in `shared/lives-config.js`:
  - `isUnlimitedLives(lives)`
  - `hasLivesRemaining(lives)`
  - `decrementLives(lives, amount)`
  - `formatLives(lives)` (`"∞"` for unlimited)
  - `scoreLivesValue(lives, fallback)`

### Shared interpretation contract
- Spawn/reset defaults: initialize lives from `DEFAULT_PLAYER_LIVES`.
- Life loss: always call `decrementLives` (unlimited remains unlimited).
- Respawn gates: use `hasLivesRemaining` instead of raw `lives > 0`.
- Life-based game-over checks: use `hasLivesRemaining` instead of raw `lives <= 0`.
- HUD labels: use `formatLives` so unlimited renders as `∞` (not `Infinity`).
- Never iterate directly up to `lives` for UI drawing; unlimited must render as a bounded indicator.
- Non-life fail states still end runs normally (for example, invasion-line fail in Space Invaders).

## Unlimited-lives interpretation map by module

### `games/asteroids/game.js`
- `spawnPlayer`, `setupWave`, and `restartRun` use `DEFAULT_PLAYER_LIVES`.
- `destroyPlayer` uses `decrementLives`.
- `maybeRespawnPlayer` and `checkGameOver` use `hasLivesRemaining`.
- `updateHud` renders lives with `formatLives`.
- No lives-based score arithmetic is needed.

### `games/bomberman/game.js`
- `createPlayer` and `resetRun` use `DEFAULT_PLAYER_LIVES`.
- `hitPlayer` uses `decrementLives`; only mark permanently dead when `hasLivesRemaining` is false.
- `respawnPlayers`, `createRound`, `allPlayersSpent`, and status messaging use `hasLivesRemaining`.
- `drawPlayerSprite` must not loop `index < player.lives`; render `∞` once for unlimited lives.

### `games/breakout/game.js`
- `createCourtState` and `resetCourt(freshRun)` use `DEFAULT_PLAYER_LIVES`.
- `loseLife` uses `decrementLives`; mark `court.gameOver` only when `hasLivesRemaining` is false.
- With unlimited lives, a missed ball always returns to serve-lock reset (no life-out game over).
- Footer/HUD lives text uses `formatLives`.

### `games/donkey-kong/game.js`
- `spawnPlayer` and `resetRound(fullReset)` use `DEFAULT_PLAYER_LIVES`.
- `loseLife` uses `decrementLives`; respawn timer is set whenever `hasLivesRemaining` is true.
- Team wipe check uses `!entry.alive && !hasLivesRemaining(entry.lives)`.
- Score panel lives text uses `formatLives`.

### `games/donkey-kong-2/game.js`
- `spawnPlayer` uses `DEFAULT_PLAYER_LIVES`.
- Round-floor behavior preserves unlimited (`Math.max(Infinity, 3) === Infinity`).
- `loseLife` uses `decrementLives`.
- Respawn gate and `survivingPlayers` checks use `hasLivesRemaining`.
- On-screen lives text uses `formatLives`.

### `games/snow-bros/game.js`
- `spawnPlayer` and non-advance resets use `DEFAULT_PLAYER_LIVES`.
- `loseLife` uses `decrementLives`; game over only when every player fails `hasLivesRemaining`.
- Respawn gate uses `hasLivesRemaining`.
- Game-over score formula must not use raw lives; use `scoreLivesValue` to keep score finite.
- On-screen lives text uses `formatLives`.

### `games/space-invaders/game.js`
- `spawnPlayer` and `resetGame` use `DEFAULT_PLAYER_LIVES`.
- Enemy-hit life loss uses `decrementLives`.
- Respawn and alive-player filtering use `hasLivesRemaining`.
- Invasion-line fail state remains an unconditional game-over path.
- Lane lives text uses `formatLives`.

## Modules scanned with no player-lives system

- `games/tetris/game.js` (game-over by board top-out, no lives counter)
- `games/jumpwake/game.js` (uses projectile/particle `life`, not player lives)
- `games/whispering-willow/game.js` (uses projectile/particle `life`, not player lives)
- `games/detective/game.js`, `games/explorers-around-the-world/game.js` (no player lives system)
