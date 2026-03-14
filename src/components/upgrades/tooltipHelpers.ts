import { MILESTONE_THRESHOLDS } from "../../data/milestones";
import type { Upgrade } from "../../data/upgrades";
import { UPGRADES } from "../../data/upgrades";
import {
  getMilestoneLevel,
  getMilestoneMultiplier,
} from "../../engine/milestoneEngine";
import { getSynergyMultiplier } from "../../engine/synergyEngine";
import { getTotalTdPerSecond } from "../../engine/upgradeEngine";

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
  };
}
