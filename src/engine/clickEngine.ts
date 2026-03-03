import type { ClickUpgrade } from "../data/clickUpgrades";

/** Milliseconds between clicks to maintain combo (≈3 clicks/sec). */
export const COMBO_CLICK_WINDOW_MS = 333;

/** Milliseconds of inactivity before combo resets. */
export const COMBO_DECAY_MS = 2_000;

/** Minimum combo count to activate the bonus multiplier. */
export const COMBO_THRESHOLD = 3;

/** Bonus multiplier applied when combo is active. */
export const COMBO_MULTIPLIER = 1.5;

interface ClickPowerState {
  evolutionStage: number;
  clickUpgradesPurchased: string[];
  comboCount: number;
  lastClickTime: number;
}

/**
 * Compute the total click power.
 *
 * Formula: (1 + evolutionStage + clickMasteryBonus)
 *          × product(purchased upgrade multipliers)
 *          × comboMultiplier × speciesClickMultiplier
 */
export function computeClickPower(
  state: ClickPowerState,
  clickUpgrades: readonly ClickUpgrade[],
  now?: number,
  clickMasteryBonus = 0,
  speciesClickMultiplier = 1,
): number {
  const base = 1 + state.evolutionStage + clickMasteryBonus;

  let upgradeMultiplier = 1;
  for (const upgrade of clickUpgrades) {
    if (state.clickUpgradesPurchased.includes(upgrade.id)) {
      upgradeMultiplier *= upgrade.multiplier;
    }
  }

  const combo = computeComboMultiplier(
    state.comboCount,
    state.lastClickTime,
    now,
  );

  return base * upgradeMultiplier * combo * speciesClickMultiplier;
}

/**
 * Compute the combo multiplier based on current combo count and timing.
 * Returns COMBO_MULTIPLIER if combo >= COMBO_THRESHOLD and not decayed, else 1.
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
    return COMBO_MULTIPLIER;
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
