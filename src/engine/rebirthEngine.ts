import type { Species } from "../data/species";
import { SPECIES_ORDER } from "../data/species";
import { STAGES } from "../data/stages";

/** Minimum evolution stage required to trigger a Rebirth. */
export const REBIRTH_MIN_STAGE = 4;

/** Divisor used in the Wisdom Token formula: floor(sqrt(totalTdEarned / divisor)). */
export const WISDOM_TOKENS_DIVISOR = 5_000_000;

/**
 * Number of Wisdom Tokens earned for a Rebirth given the total TD earned
 * at the moment of rebirth.
 *
 * Formula: floor(sqrt(totalTdEarned / WISDOM_TOKENS_DIVISOR) * tokenMagnetMultiplier)
 * The optional `tokenMagnetMultiplier` scales the result (default 1).
 */
export function computeWisdomTokens(
  totalTdEarned: number,
  tokenMagnetMultiplier = 1,
): number {
  const base = Math.floor(Math.sqrt(totalTdEarned / WISDOM_TOKENS_DIVISOR));
  return Math.floor(base * tokenMagnetMultiplier);
}

/** Returns true when the player is eligible to Rebirth. */
export function canRebirth(evolutionStage: number): boolean {
  return evolutionStage >= REBIRTH_MIN_STAGE;
}

/**
 * Returns the total-TD-earned threshold for the Rebirth-eligible stage (Stage 4).
 * `thresholdMultiplier` mirrors the Evolution Accelerator prestige upgrade
 * (level 3 → multiplier 0.7, reducing the threshold by 30%).
 */
export function getRebirthThresholdTd(thresholdMultiplier = 1): number {
  const rebirthStage = STAGES.find((s) => s.stage === REBIRTH_MIN_STAGE);
  return (rebirthStage?.unlockAt ?? 10_000_000) * thresholdMultiplier;
}

/**
 * Returns progress toward first Rebirth as a value in [0, 1].
 *
 * - 0  = no progress
 * - 1  = Stage 4 threshold reached (Rebirth available)
 *
 * Values above the threshold are clamped to 1.
 * `thresholdMultiplier` mirrors the Evolution Accelerator prestige upgrade.
 */
export function getRebirthProgress(
  totalTdEarned: number,
  thresholdMultiplier = 1,
): number {
  const threshold = getRebirthThresholdTd(thresholdMultiplier);
  if (totalTdEarned >= threshold) return 1;
  return Math.max(0, totalTdEarned / threshold);
}

/**
 * Returns the next species in the unlock order.
 * If already at the last species, stays there (no further unlocks).
 */
export function getNextSpecies(currentSpecies: Species): Species {
  const idx = SPECIES_ORDER.indexOf(currentSpecies);
  if (idx === -1 || idx >= SPECIES_ORDER.length - 1) {
    return SPECIES_ORDER[SPECIES_ORDER.length - 1];
  }
  return SPECIES_ORDER[idx + 1];
}
