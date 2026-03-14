import type { DecimalSource } from "break_infinity.js";
import { MILESTONE_THRESHOLDS } from "../data/milestones";
import { D } from "../utils/decimal";

/**
 * Returns the number of milestone thresholds reached for the given owned count.
 * E.g. owned=25 → level 2 (crossed 10 and 25).
 */
export function getMilestoneLevel(owned: number): number {
  let level = 0;
  for (const threshold of MILESTONE_THRESHOLDS) {
    if (owned >= threshold.owned) level++;
    else break;
  }
  return level;
}

/**
 * Returns the total TD/s multiplier for a generator with the given owned count.
 * Returns 1 (no bonus) when below the first threshold.
 */
export function getMilestoneMultiplier(owned: number): number {
  const level = getMilestoneLevel(owned);
  if (level === 0) return 1;
  return MILESTONE_THRESHOLDS[level - 1].multiplier;
}

/**
 * Returns the next milestone threshold the player has not yet reached,
 * or `null` if all milestones (10/25/50/100) have been passed.
 */
export function getNextMilestone(
  owned: number,
): { threshold: number; multiplier: number; label: string } | null {
  for (const m of MILESTONE_THRESHOLDS) {
    if (owned < m.owned) {
      return { threshold: m.owned, multiplier: m.multiplier, label: m.label };
    }
  }
  return null;
}

/**
 * TD-earned milestone thresholds. When total TD earned crosses one of these
 * values the UI triggers a celebration event and records it in crossedMilestones.
 */
export const TD_MILESTONES: readonly number[] = [
  1_000, 10_000, 100_000, 1_000_000, 10_000_000, 100_000_000, 1_000_000_000,
  10_000_000_000, 1_000_000_000_000,
];

/**
 * Returns the TD-earned milestone thresholds newly crossed in the interval
 * (prevTd, currentTd], excluding any already in `alreadyCrossed`.
 */
export function checkMilestones(
  prevTd: DecimalSource,
  currentTd: DecimalSource,
  alreadyCrossed: Set<number>,
): number[] {
  const prev = D(prevTd);
  const current = D(currentTd);
  return TD_MILESTONES.filter(
    (t) => D(t).gt(prev) && D(t).lte(current) && !alreadyCrossed.has(t),
  );
}
