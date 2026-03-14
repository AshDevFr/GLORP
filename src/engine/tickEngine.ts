import { BOOSTERS } from "../data/boosters";
import { UPGRADES } from "../data/upgrades";
import type { Decimal } from "../utils/decimal";
import { D } from "../utils/decimal";
import type { Mood } from "./moodEngine";
import { getDecayedMood } from "./moodEngine";
import { computeBoosterMultiplier, getTotalTdPerSecond } from "./upgradeEngine";

interface TickState {
  upgradeOwned: Record<string, number>;
  mood: Mood;
  moodChangedAt: number;
  boostersPurchased?: string[];
  idleBoostMultiplier?: number;
  speciesAutoGenMultiplier?: number;
  activeChallengeId?: string | null;
}

interface TickResult {
  trainingDataDelta: Decimal;
  newMood: Mood | null;
}

export function computeTick(
  state: TickState,
  deltaSeconds: number,
  now: number,
): TickResult {
  const decayed = getDecayedMood(state.mood, state.moodChangedAt, now);
  const newMood = decayed !== state.mood ? decayed : null;

  // Click-Only challenge: auto-generators produce no TD
  if (state.activeChallengeId === "click-only") {
    return { trainingDataDelta: D(0), newMood };
  }

  const globalMultiplier =
    (state.idleBoostMultiplier ?? 1) * (state.speciesAutoGenMultiplier ?? 1);
  const boosterMultiplier = computeBoosterMultiplier(
    BOOSTERS,
    state.boostersPurchased ?? [],
  );
  const tdPerSecond = getTotalTdPerSecond(
    UPGRADES,
    state.upgradeOwned,
    globalMultiplier,
    boosterMultiplier,
  );

  return {
    trainingDataDelta: tdPerSecond.mul(deltaSeconds),
    newMood,
  };
}
