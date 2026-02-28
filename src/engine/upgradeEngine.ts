import type { Upgrade } from "../data/upgrades";

const COST_MULTIPLIER = 1.15;

export function getUpgradeCost(upgrade: Upgrade, owned: number): number {
  return Math.floor(upgrade.baseCost * COST_MULTIPLIER ** owned);
}

export function getTotalTdPerSecond(
  upgrades: readonly Upgrade[],
  owned: Record<string, number>,
): number {
  let total = 0;
  for (const upgrade of upgrades) {
    const count = owned[upgrade.id] ?? 0;
    total += upgrade.baseTdPerSecond * count;
  }
  return total;
}
