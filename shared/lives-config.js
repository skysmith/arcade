export const DEFAULT_FINITE_LIVES = 3;
export const UNLIMITED_LIVES = Number.POSITIVE_INFINITY;
export const DEFAULT_PLAYER_LIVES = UNLIMITED_LIVES;

export function isUnlimitedLives(lives) {
  return !Number.isFinite(lives);
}

export function hasLivesRemaining(lives) {
  return isUnlimitedLives(lives) || lives > 0;
}

export function decrementLives(lives, amount = 1) {
  if (isUnlimitedLives(lives)) {
    return lives;
  }
  return Math.max(0, lives - Math.max(0, amount));
}

export function formatLives(lives) {
  if (isUnlimitedLives(lives)) {
    return "∞";
  }
  return String(Math.max(0, Math.floor(lives)));
}

export function scoreLivesValue(lives, fallback = DEFAULT_FINITE_LIVES) {
  if (isUnlimitedLives(lives)) {
    return fallback;
  }
  return Math.max(0, Math.floor(lives));
}
