import type { DecimalSource } from "break_infinity.js";
import { STAGES } from "../data/stages";
import { D } from "../utils/decimal";

/**
 * Returns the evolution stage for a given total TD earned.
 * `thresholdMultiplier` scales unlock thresholds (Evolution Accelerator prestige).
 * A multiplier < 1 makes stages unlock earlier.
 */
export function getEvolutionStage(
  totalTdEarned: DecimalSource,
  thresholdMultiplier = 1,
): number {
  const td = D(totalTdEarned);
  let stage = 0;
  for (const s of STAGES) {
    if (td.gte(D(s.unlockAt).mul(thresholdMultiplier))) {
      stage = s.stage;
    }
  }
  return stage;
}
