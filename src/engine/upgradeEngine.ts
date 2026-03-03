import type { Booster } from "../data/boosters";
import type { Upgrade } from "../data/upgrades";
import { getMilestoneMultiplier } from "./milestoneEngine";
import { getSynergyMultiplier } from "./synergyEngine";

export const COST_MULTIPLIER = 1.15;

export function getUpgradeCost(
  upgrade: Upgrade,
  owned: number,
  costMultiplier = COST_MULTIPLIER,
): number {
  return Math.floor(upgrade.baseCost * costMultiplier ** owned);
}

/**
 * Total cost to buy `count` upgrades starting from `owned` already owned.
 * Uses the geometric series formula for O(1) computation.
 */
export function getBulkCost(
  upgrade: Upgrade,
  owned: number,
  count: number,
  costMultiplier = COST_MULTIPLIER,
): number {
  if (count <= 0) return 0;
  if (count === 1) return getUpgradeCost(upgrade, owned, costMultiplier);
  const firstCost = upgrade.baseCost * costMultiplier ** owned;
  return Math.floor(
    (firstCost * (costMultiplier ** count - 1)) / (costMultiplier - 1),
  );
}

/**
 * Maximum number of upgrades affordable with `budget`, starting from `owned`.
 * Uses the inverse geometric series formula for O(1) computation.
 */
export function getMaxAffordable(
  upgrade: Upgrade,
  owned: number,
  budget: number,
  costMultiplier = COST_MULTIPLIER,
): number {
  if (budget <= 0) return 0;
  const firstCost = upgrade.baseCost * costMultiplier ** owned;
  if (budget < firstCost) return 0;
  const n = Math.floor(
    Math.log((budget * (costMultiplier - 1)) / firstCost + 1) /
      Math.log(costMultiplier),
  );
  return Math.max(0, n);
}

/**
 * Product of the multipliers for all purchased boosters.
 * Returns 1 (no bonus) when nothing has been purchased.
 */
export function computeBoosterMultiplier(
  boosters: readonly Booster[],
  purchased: readonly string[],
): number {
  return boosters
    .filter((b) => purchased.includes(b.id))
    .reduce((acc, b) => acc * b.multiplier, 1);
}

/**
 * Returns the total TD/s from owned upgrades, applying per-generator milestone
 * and synergy multipliers, then the global multipliers (idle boost, species
 * auto-gen bonus, booster multiplier).
 */
export function getTotalTdPerSecond(
  upgrades: readonly Upgrade[],
  owned: Record<string, number>,
  globalMultiplier = 1,
  boosterMultiplier = 1,
): number {
  let total = 0;
  for (const upgrade of upgrades) {
    const count = owned[upgrade.id] ?? 0;
    const milestoneMultiplier = getMilestoneMultiplier(count);
    const synergyMultiplier = getSynergyMultiplier(upgrade.id, owned);
    total +=
      upgrade.baseTdPerSecond * count * milestoneMultiplier * synergyMultiplier;
  }
  return total * globalMultiplier * boosterMultiplier;
}
