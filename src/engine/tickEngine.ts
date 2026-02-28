import { UPGRADES } from "../data/upgrades";
import { getTotalTdPerSecond } from "./upgradeEngine";

interface TickState {
  upgradeOwned: Record<string, number>;
}

interface TickResult {
  trainingDataDelta: number;
}

export function computeTick(
  state: TickState,
  deltaSeconds: number,
): TickResult {
  const tdPerSecond = getTotalTdPerSecond(UPGRADES, state.upgradeOwned);
  return {
    trainingDataDelta: tdPerSecond * deltaSeconds,
  };
}
