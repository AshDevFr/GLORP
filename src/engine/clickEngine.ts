import type { ClickUpgrade } from "../data/clickUpgrades";

/** Milliseconds between clicks to maintain combo (≈3 clicks/sec). */
export const COMBO_CLICK_WINDOW_MS = 333;

/** Milliseconds of inactivity before combo resets. */
export const COMBO_DECAY_MS = 2_000;

/** Minimum combo count to activate the bonus multiplier. */
export const COMBO_THRESHOLD = 3;

/** Bonus multiplier applied when combo is active. */
export const COMBO_MULTIPLIER = 1.5;

/**
 * Baseline seconds of passive income earned per click (before any upgrades).
 * At 0 generators (tdPerSecond = 0) a floor of 1 TD applies.
 */
export const BASE_CLICK_SECONDS = 0.05;

/**
 * Seconds of passive income added per Click Mastery prestige level.
 * 10 levels → +1.0s (same contribution as the Synthetic Data Farm upgrade).
 */
export const MASTERY_CLICK_SECONDS_PER_LEVEL = 0.1;

interface ClickPowerState {
  clickUpgradesPurchased: string[];
  comboCount: number;
  lastClickTime: number;
}

/**
 * Returns the total click-seconds value for the given purchased upgrades and
 * Click Mastery bonus level.
 *
 * Formula: BASE_CLICK_SECONDS + Σ(purchased upgrade clickSeconds)
 *          + clickMasteryBonus × MASTERY_CLICK_SECONDS_PER_LEVEL
 */
export function computeClickSeconds(
  purchasedIds: string[],
  clickUpgrades: readonly ClickUpgrade[],
  clickMasteryBonus = 0,
): number {
  let seconds = BASE_CLICK_SECONDS;
  for (const upgrade of clickUpgrades) {
    if (purchasedIds.includes(upgrade.id)) {
      seconds += upgrade.clickSeconds;
    }
  }
  seconds += clickMasteryBonus * MASTERY_CLICK_SECONDS_PER_LEVEL;
  return seconds;
}

/**
 * Compute the total click value in TD.
 *
 * Formula: floor(max(1, clickSeconds × tdPerSecond × speciesClickMultiplier) × comboMultiplier)
 *
 * The floor of 1 preserves early-game playability before any generators are
 * bought (when tdPerSecond = 0).  The combo multiplier is applied after the
 * floor so it remains effective even when tdPerSecond = 0.
 */
export function computeClickPower(
  state: ClickPowerState,
  clickUpgrades: readonly ClickUpgrade[],
  tdPerSecond: number,
  now?: number,
  clickMasteryBonus = 0,
  speciesClickMultiplier = 1,
): number {
  const seconds = computeClickSeconds(
    state.clickUpgradesPurchased,
    clickUpgrades,
    clickMasteryBonus,
  );

  const combo = computeComboMultiplier(
    state.comboCount,
    state.lastClickTime,
    now,
  );

  return Math.floor(
    Math.max(1, seconds * tdPerSecond * speciesClickMultiplier) * combo,
  );
}

/**
 * Compute the combo multiplier based on current combo count and timing.
 * Scales with combo count using sqrt growth:
 *   1 + (COMBO_MULTIPLIER - 1) * sqrt(comboCount / COMBO_THRESHOLD)
 * Returns 1 if combo is below threshold or has decayed.
 */
export function computeComboMultiplier(
  comboCount: number,
  lastClickTime: number,
  now?: number,
): number {
  const currentTime = now ?? Date.now();
  if (
    comboCount >= COMBO_THRESHOLD &&
    currentTime - lastClickTime < COMBO_DECAY_MS
  ) {
    return 1 + (COMBO_MULTIPLIER - 1) * Math.sqrt(comboCount / COMBO_THRESHOLD);
  }
  return 1;
}

/**
 * Update combo state for a new click event.
 * Returns the new combo count based on timing since last click.
 */
export function updateCombo(lastClickTime: number, now: number): number {
  if (lastClickTime === 0) return 1;
  const elapsed = now - lastClickTime;
  if (elapsed <= COMBO_CLICK_WINDOW_MS) {
    // Fast enough to build combo — but we don't know old count here,
    // caller adds to existing count
    return -1; // sentinel: increment existing
  }
  if (elapsed > COMBO_DECAY_MS) {
    return 1; // reset
  }
  // Between combo window and decay: maintain but don't grow
  return -1; // sentinel: increment existing
}

/**
 * Given the previous combo state and the current time of a click,
 * returns the new comboCount.
 */
export function getNextComboCount(
  prevComboCount: number,
  lastClickTime: number,
  now: number,
): number {
  if (lastClickTime === 0) return 1;
  const elapsed = now - lastClickTime;
  if (elapsed > COMBO_DECAY_MS) {
    return 1; // reset combo
  }
  return prevComboCount + 1; // build combo
}
