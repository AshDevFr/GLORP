import { BOOSTERS } from "../data/boosters";
import { UPGRADES } from "../data/upgrades";
import type { Mood } from "./moodEngine";
import { getDecayedMood } from "./moodEngine";
import { computeWisdomMultiplier } from "./rebirthEngine";
import { computeBoosterMultiplier, getTotalTdPerSecond } from "./upgradeEngine";

interface TickState {
  upgradeOwned: Record<string, number>;
  mood: Mood;
  moodChangedAt: number;
  wisdomTokens?: number;
  boostersPurchased?: string[];
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
  const wisdomMultiplier = computeWisdomMultiplier(state.wisdomTokens ?? 0);
  const boosterMultiplier = computeBoosterMultiplier(
    BOOSTERS,
    state.boostersPurchased ?? [],
  );
  const tdPerSecond = getTotalTdPerSecond(
    UPGRADES,
    state.upgradeOwned,
    wisdomMultiplier,
    boosterMultiplier,
  );

  const decayed = getDecayedMood(state.mood, state.moodChangedAt, now);
  const newMood = decayed !== state.mood ? decayed : null;

  return {
    trainingDataDelta: tdPerSecond * deltaSeconds,
    newMood,
  };
}
