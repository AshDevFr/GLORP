import { BOOSTERS } from "../data/boosters";
import { UPGRADES } from "../data/upgrades";
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
}

interface TickResult {
  trainingDataDelta: number;
  newMood: Mood | null;
}

export function computeTick(
  state: TickState,
  deltaSeconds: number,
  now: number,
): TickResult {
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

  const decayed = getDecayedMood(state.mood, state.moodChangedAt, now);
  const newMood = decayed !== state.mood ? decayed : null;

  return {
    trainingDataDelta: tdPerSecond * deltaSeconds,
    newMood,
  };
}
