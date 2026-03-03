import type { Booster } from "../data/boosters";
import type { Upgrade } from "../data/upgrades";
import { getMilestoneMultiplier } from "./milestoneEngine";

export const COST_MULTIPLIER = 1.15;

export function getUpgradeCost(upgrade: Upgrade, owned: number): number {
  return Math.floor(upgrade.baseCost * COST_MULTIPLIER ** owned);
}

/**
 * Total cost to buy `count` upgrades starting from `owned` already owned.
 * Uses the geometric series formula for O(1) computation.
 */
export function getBulkCost(
  upgrade: Upgrade,
  owned: number,
  count: number,
): number {
  if (count <= 0) return 0;
  if (count === 1) return getUpgradeCost(upgrade, owned);
  const firstCost = upgrade.baseCost * COST_MULTIPLIER ** owned;
  return Math.floor(
    (firstCost * (COST_MULTIPLIER ** count - 1)) / (COST_MULTIPLIER - 1),
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
): number {
  if (budget <= 0) return 0;
  const firstCost = upgrade.baseCost * COST_MULTIPLIER ** owned;
  if (budget < firstCost) return 0;
  const n = Math.floor(
    Math.log((budget * (COST_MULTIPLIER - 1)) / firstCost + 1) /
      Math.log(COST_MULTIPLIER),
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
 * multipliers, then the global wisdom and booster multipliers.
 * Defaults to no bonus (×1) for wisdom and booster multipliers.
 */
export function getTotalTdPerSecond(
  upgrades: readonly Upgrade[],
  owned: Record<string, number>,
  wisdomMultiplier = 1,
  boosterMultiplier = 1,
): number {
  let total = 0;
  for (const upgrade of upgrades) {
    const count = owned[upgrade.id] ?? 0;
    const milestoneMultiplier = getMilestoneMultiplier(count);
    total += upgrade.baseTdPerSecond * count * milestoneMultiplier;
  }
  return total * wisdomMultiplier * boosterMultiplier;
}
