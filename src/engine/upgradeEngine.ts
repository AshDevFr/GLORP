import type { Upgrade } from "../data/upgrades";

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
 * Returns the total TD/s from owned upgrades, multiplied by the permanent
 * wisdom multiplier (1 + wisdomTokens * 0.05). Defaults to no bonus (×1).
 */
export function getTotalTdPerSecond(
  upgrades: readonly Upgrade[],
  owned: Record<string, number>,
  wisdomMultiplier = 1,
): number {
  let total = 0;
  for (const upgrade of upgrades) {
    const count = owned[upgrade.id] ?? 0;
    total += upgrade.baseTdPerSecond * count;
  }
  return total * wisdomMultiplier;
}
