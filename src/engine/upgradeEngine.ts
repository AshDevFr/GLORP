import type { DecimalSource } from "break_infinity.js";
import type { Booster } from "../data/boosters";
import type { Upgrade } from "../data/upgrades";
import { D, Decimal } from "../utils/decimal";
import { getMilestoneMultiplier, getNextMilestone } from "./milestoneEngine";
import { getSynergyMultiplier } from "./synergyEngine";

export const COST_MULTIPLIER = 1.15;

export function getUpgradeCost(
  upgrade: Upgrade,
  owned: number,
  costMultiplier = COST_MULTIPLIER,
): Decimal {
  return D(upgrade.baseCost).mul(D(costMultiplier).pow(owned)).floor();
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
): Decimal {
  if (count <= 0) return D(0);
  if (count === 1) return getUpgradeCost(upgrade, owned, costMultiplier);
  const firstCost = D(upgrade.baseCost).mul(D(costMultiplier).pow(owned));
  return firstCost
    .mul(D(costMultiplier).pow(count).sub(1))
    .div(D(costMultiplier).sub(1))
    .floor();
}

/**
 * Maximum number of upgrades affordable with `budget`, starting from `owned`.
 * Uses the inverse geometric series formula for O(1) computation.
 */
export function getMaxAffordable(
  upgrade: Upgrade,
  owned: number,
  budget: DecimalSource,
  costMultiplier = COST_MULTIPLIER,
): number {
  const b = new Decimal(budget);
  if (b.lte(0)) return 0;
  const firstCost = D(upgrade.baseCost).mul(D(costMultiplier).pow(owned));
  if (b.lt(firstCost)) return 0;
  const n = Math.floor(
    b.mul(D(costMultiplier).sub(1)).div(firstCost).add(1).log10() /
      D(costMultiplier).log10(),
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
): Decimal {
  let total = D(0);
  for (const upgrade of upgrades) {
    const count = owned[upgrade.id] ?? 0;
    const milestoneMultiplier = getMilestoneMultiplier(count);
    const synergyMultiplier = getSynergyMultiplier(upgrade.id, owned);
    total = total.add(
      D(upgrade.baseTdPerSecond)
        .mul(count)
        .mul(milestoneMultiplier)
        .mul(synergyMultiplier),
    );
  }
  return total.mul(globalMultiplier).mul(boosterMultiplier);
}

/** A single row in the per-generator CPS breakdown panel. */
export interface GeneratorCpsRow {
  id: string;
  name: string;
  icon: string;
  owned: number;
  /** Effective CPS for a single unit (baseTdPerSecond × milestone × synergy). */
  perUnitCps: number;
  /** Total CPS contributed by all owned units of this generator. */
  totalCps: number;
  /** Share of grand total CPS (0–100). */
  percentOfTotal: number;
  /** Next milestone the player is approaching, or null if all milestones reached. */
  nextMilestone: {
    threshold: number;
    multiplier: number;
    label: string;
  } | null;
}

/**
 * Returns a CPS breakdown row for every generator in `upgrades`.
 *
 * Global multipliers (idle boost, species auto-gen, booster) are intentionally
 * excluded so that percentage shares are valid regardless of which global
 * bonuses are active — the same exclusion used by GeneratorTooltipContent.
 */
export function computeAllGeneratorsCps(
  upgrades: readonly Upgrade[],
  owned: Record<string, number>,
): GeneratorCpsRow[] {
  const grandTotal = getTotalTdPerSecond(upgrades, owned, 1, 1);
  const grandTotalNum = grandTotal.toNumber();

  return upgrades.map((upgrade) => {
    const count = owned[upgrade.id] ?? 0;
    const milestoneMultiplier = getMilestoneMultiplier(count);
    const synergyMultiplier = getSynergyMultiplier(upgrade.id, owned);
    const perUnitCps =
      upgrade.baseTdPerSecond * milestoneMultiplier * synergyMultiplier;
    const totalCps = perUnitCps * count;
    const percentOfTotal =
      grandTotalNum > 0 ? (totalCps / grandTotalNum) * 100 : 0;

    return {
      id: upgrade.id,
      name: upgrade.name,
      icon: upgrade.icon,
      owned: count,
      perUnitCps,
      totalCps,
      percentOfTotal,
      nextMilestone: getNextMilestone(count),
    };
  });
}
