import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_PLAYER_LIVES,
  UNLIMITED_LIVES,
  decrementLives,
  hasLivesRemaining,
  isUnlimitedLives,
} from "./lives-config.js";

const SNOW_BROS_RESPAWN_MS = 1300;
const SPACE_INVADERS_RESPAWN_MS = 1100;

function simulateSnowBrosLifeLoss(livesByPlayer, targetIndex, now = 10_000) {
  const players = livesByPlayer.map((lives) => ({
    lives,
    alive: true,
    respawnAt: 0,
  }));

  const player = players[targetIndex];
  player.alive = false;
  player.lives = decrementLives(player.lives);
  player.respawnAt = now + SNOW_BROS_RESPAWN_MS;

  const gameOver = players.every((entry) => !hasLivesRemaining(entry.lives));
  return { players, gameOver };
}

function simulateSpaceInvadersLifeLoss(livesByPlayer, targetIndex, now = 20_000) {
  const players = livesByPlayer.map((lives) => ({
    lives,
    alive: true,
    respawnAt: 0,
  }));

  const player = players[targetIndex];
  player.lives = decrementLives(player.lives);
  player.alive = false;
  player.respawnAt = hasLivesRemaining(player.lives)
    ? now + SPACE_INVADERS_RESPAWN_MS
    : 0;

  const playersStillInRun = players.filter(
    (entry) => entry.alive || hasLivesRemaining(entry.lives),
  );
  const lifeBasedGameOver = playersStillInRun.length === 0;

  return { players, lifeBasedGameOver };
}

test("default player lives are unlimited", () => {
  assert.equal(DEFAULT_PLAYER_LIVES, UNLIMITED_LIVES);
  assert.equal(isUnlimitedLives(DEFAULT_PLAYER_LIVES), true);
  assert.equal(hasLivesRemaining(DEFAULT_PLAYER_LIVES), true);
});

test("decrement does not reduce unlimited lives", () => {
  assert.equal(decrementLives(UNLIMITED_LIVES), UNLIMITED_LIVES);
  assert.equal(decrementLives(UNLIMITED_LIVES, 5), UNLIMITED_LIVES);
});

test("decrement clamps finite lives at zero", () => {
  assert.equal(decrementLives(3), 2);
  assert.equal(decrementLives(1, 2), 0);
  assert.equal(decrementLives(0, 99), 0);
});

test("Snow Bros life loss keeps unlimited players alive and avoids life-based game-over", () => {
  const { players, gameOver } = simulateSnowBrosLifeLoss(
    [UNLIMITED_LIVES, UNLIMITED_LIVES],
    0,
  );

  assert.equal(players[0].lives, UNLIMITED_LIVES);
  assert.equal(players[0].alive, false);
  assert.equal(players[0].respawnAt, 11_300);
  assert.equal(gameOver, false);
});

test("Snow Bros finite life exhaustion still triggers life-based game-over", () => {
  const { players, gameOver } = simulateSnowBrosLifeLoss([1], 0);

  assert.equal(players[0].lives, 0);
  assert.equal(gameOver, true);
});

test("Space Invaders hit handling preserves unlimited lives and skips life-based game-over", () => {
  const { players, lifeBasedGameOver } = simulateSpaceInvadersLifeLoss(
    [UNLIMITED_LIVES],
    0,
  );

  assert.equal(players[0].lives, UNLIMITED_LIVES);
  assert.equal(players[0].alive, false);
  assert.equal(players[0].respawnAt, 21_100);
  assert.equal(lifeBasedGameOver, false);
});

test("Space Invaders finite life exhaustion still causes life-based game-over", () => {
  const { players, lifeBasedGameOver } = simulateSpaceInvadersLifeLoss([1], 0);

  assert.equal(players[0].lives, 0);
  assert.equal(players[0].respawnAt, 0);
  assert.equal(lifeBasedGameOver, true);
});
