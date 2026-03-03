import { STAGES } from "../data/stages";

/**
 * Returns the evolution stage for a given total TD earned.
 * `thresholdMultiplier` scales unlock thresholds (Evolution Accelerator prestige).
 * A multiplier < 1 makes stages unlock earlier.
 */
export function getEvolutionStage(
  totalTdEarned: number,
  thresholdMultiplier = 1,
): number {
  let stage = 0;
  for (const s of STAGES) {
    if (totalTdEarned >= s.unlockAt * thresholdMultiplier) {
      stage = s.stage;
    }
  }
  return stage;
}
