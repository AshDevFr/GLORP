/**
 * Major TD milestones that trigger celebrations.
 * Sorted ascending so we can iterate in order.
 */
export const MILESTONE_THRESHOLDS = [
  1_000,
  10_000,
  100_000,
  1_000_000,
  10_000_000,
  100_000_000,
  1_000_000_000,
  1_000_000_000_000,
] as const satisfies readonly number[];

/**
 * Returns the milestone thresholds crossed when totalTdEarned grows from
 * `prevTd` to `newTd`, excluding any already crossed milestones.
 */
export function checkMilestones(
  prevTd: number,
  newTd: number,
  alreadyCrossed: ReadonlySet<number>,
): number[] {
  return [...MILESTONE_THRESHOLDS].filter(
    (t) => !alreadyCrossed.has(t) && prevTd < t && newTd >= t,
  );
}
