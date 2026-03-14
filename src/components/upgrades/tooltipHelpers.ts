import type { Booster } from "../../data/boosters";
import type { ClickUpgrade } from "../../data/clickUpgrades";
import { MILESTONE_THRESHOLDS } from "../../data/milestones";
import type { Upgrade } from "../../data/upgrades";
import { UPGRADES } from "../../data/upgrades";
import { computeClickSeconds } from "../../engine/clickEngine";
import {
  getMilestoneLevel,
  getMilestoneMultiplier,
} from "../../engine/milestoneEngine";
import { getSynergyMultiplier } from "../../engine/synergyEngine";
import { getTotalTdPerSecond } from "../../engine/upgradeEngine";
import type { DecimalSource } from "../../utils/decimal";
import { D, Decimal } from "../../utils/decimal";

export interface GeneratorTooltipData {
  name: string;
  icon: string;
  owned: number;
  baseTdPerUnit: number;
  milestoneMultiplier: number;
  synergyMultiplier: number;
  effectiveTdPerUnit: number;
  totalTdForGenerator: number;
  percentOfTotal: number;
  nextMilestoneOwned: number | null;
  nextMilestoneMultiplier: number | null;
  nextMilestoneLabel: string | null;
  /** TD/s gained by purchasing one more unit (accounts for milestone crossing). */
  deltaTdPerSecond: number;
  /** True when buying the next unit crosses a milestone threshold. */
  milestoneWillCross: boolean;
}

/**
 * Computes all data needed to render the rich generator tooltip.
 * Global multipliers (idle boost, species, booster) are excluded from
 * per-generator values because they apply equally to all generators,
 * keeping the percentage calculation correct regardless of global bonuses.
 */
export function computeGeneratorTooltipData(
  upgrade: Upgrade,
  owned: number,
  allOwned: Record<string, number>,
): GeneratorTooltipData {
  const milestoneLevel = getMilestoneLevel(owned);
  const milestoneMultiplier = getMilestoneMultiplier(owned);
  const synergyMultiplier = getSynergyMultiplier(upgrade.id, allOwned);
  const effectiveTdPerUnit =
    upgrade.baseTdPerSecond * milestoneMultiplier * synergyMultiplier;
  const totalTdForGenerator = effectiveTdPerUnit * owned;

  // Use globalMultiplier=1 and boosterMultiplier=1 so the global bonuses
  // cancel out in the percentage calculation — the % share is the same
  // regardless of which global multipliers are active.
  const grandTotal = getTotalTdPerSecond(UPGRADES, allOwned, 1, 1);
  const percentOfTotal = grandTotal.gt(0)
    ? (totalTdForGenerator / grandTotal.toNumber()) * 100
    : 0;

  const nextThreshold = MILESTONE_THRESHOLDS[milestoneLevel] ?? null;

  // Delta: TD/s gained by purchasing one more unit.
  // Milestone crossing is handled correctly: if owned+1 hits a threshold,
  // ALL existing units benefit from the new multiplier too.
  const newOwned = owned + 1;
  const newAllOwned = { ...allOwned, [upgrade.id]: newOwned };
  const newMilestoneMultiplier = getMilestoneMultiplier(newOwned);
  const newSynergyMultiplier = getSynergyMultiplier(upgrade.id, newAllOwned);
  const futureTdForGenerator =
    upgrade.baseTdPerSecond *
    newOwned *
    newMilestoneMultiplier *
    newSynergyMultiplier;
  const deltaTdPerSecond = futureTdForGenerator - totalTdForGenerator;
  const milestoneWillCross = getMilestoneLevel(newOwned) > milestoneLevel;

  return {
    name: upgrade.name,
    icon: upgrade.icon,
    owned,
    baseTdPerUnit: upgrade.baseTdPerSecond,
    milestoneMultiplier,
    synergyMultiplier,
    effectiveTdPerUnit,
    totalTdForGenerator,
    percentOfTotal,
    nextMilestoneOwned: nextThreshold?.owned ?? null,
    nextMilestoneMultiplier: nextThreshold?.multiplier ?? null,
    nextMilestoneLabel: nextThreshold?.label ?? null,
    deltaTdPerSecond,
    milestoneWillCross,
  };
}

// ── Click-bonus tooltip ───────────────────────────────────────────────────────

export interface ClickBonusTooltipData {
  /** TD gained per click with current upgrades (no combo, floor applied). */
  currentClickPower: Decimal;
  /** TD gained per click after purchasing this upgrade (no combo, floor applied). */
  futureClickPower: Decimal;
  /** Net increase in click power from buying this upgrade. */
  deltaClickPower: Decimal;
}

/**
 * Computes the click-power delta shown in a click-bonus upgrade tooltip.
 *
 * Combo is intentionally excluded because it is transient — the tooltip
 * reflects the stable base increase, not a snapshot of a lucky combo streak.
 * The max(1, ...) floor matches the real engine so early-game values (where
 * tdPerSecond ≈ 0) show truthful numbers.
 */
export function computeClickBonusTooltipData(
  upgrade: ClickUpgrade,
  purchasedIds: string[],
  clickUpgrades: readonly ClickUpgrade[],
  tdPerSecond: DecimalSource,
  clickMasteryBonus = 0,
  speciesClickMultiplier = 1,
): ClickBonusTooltipData {
  const currentSeconds = computeClickSeconds(
    purchasedIds,
    clickUpgrades,
    clickMasteryBonus,
  );
  const futureSeconds = currentSeconds + upgrade.clickSeconds;

  const currentBase = D(currentSeconds)
    .mul(tdPerSecond)
    .mul(speciesClickMultiplier);
  const futureBase = D(futureSeconds)
    .mul(tdPerSecond)
    .mul(speciesClickMultiplier);

  const currentClickPower = Decimal.max(1, currentBase);
  const futureClickPower = Decimal.max(1, futureBase);
  const deltaClickPower = futureClickPower.sub(currentClickPower);

  return { currentClickPower, futureClickPower, deltaClickPower };
}

// ── Global-multiplier tooltip ─────────────────────────────────────────────────

export interface GlobalMultiplierTooltipData {
  multiplier: number;
  /** Total TD/s right now (with all current booster multipliers applied). */
  currentTdPerSecond: Decimal;
  /** Projected total TD/s after purchasing this booster. */
  newTdPerSecond: Decimal;
}

/**
 * Computes the before/after TD/s pair for a global-multiplier (booster) tooltip.
 *
 * `currentTdPerSecond` must already include all active booster multipliers.
 * Purchasing this booster multiplies the entire total by `booster.multiplier`,
 * so `newTdPerSecond = currentTdPerSecond × booster.multiplier`.
 */
export function computeGlobalMultiplierTooltipData(
  booster: Booster,
  currentTdPerSecond: DecimalSource,
): GlobalMultiplierTooltipData {
  const current = D(currentTdPerSecond);
  const newTdPerSecond = current.mul(booster.multiplier);
  return {
    multiplier: booster.multiplier,
    currentTdPerSecond: current,
    newTdPerSecond,
  };
}
