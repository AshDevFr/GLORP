export interface PrestigeUpgrade {
  id: string;
  name: string;
  description: string;
  costPerLevel: number;
  maxLevel: number;
  icon: string;
}

export const PRESTIGE_UPGRADES: readonly PrestigeUpgrade[] = [
  {
    id: "quick-start",
    name: "Quick Start",
    description: "Start runs with bonus TD",
    costPerLevel: 5,
    maxLevel: 3,
    icon: "🚀",
  },
  {
    id: "auto-buy",
    name: "Auto-Buy",
    description: "Auto-buy cheapest affordable generator each tick",
    costPerLevel: 10,
    maxLevel: 1,
    icon: "🤖",
  },
  {
    id: "click-mastery",
    name: "Click Mastery",
    description: "+1x base click power per level",
    costPerLevel: 3,
    maxLevel: 10,
    icon: "👆",
  },
  {
    id: "generator-discount",
    name: "Generator Discount",
    description: "Reduce generator cost multiplier",
    costPerLevel: 8,
    maxLevel: 3,
    icon: "💰",
  },
  {
    id: "idle-boost",
    name: "Idle Boost",
    description: "+25% all auto-gen TD/s per level",
    costPerLevel: 5,
    maxLevel: 5,
    icon: "⏱️",
  },
  {
    id: "offline-efficiency",
    name: "Offline Efficiency",
    description: "Increase offline earning rate",
    costPerLevel: 5,
    maxLevel: 3,
    icon: "🌙",
  },
  {
    id: "evolution-accelerator",
    name: "Evolution Accelerator",
    description: "Evolution thresholds −10% per level",
    costPerLevel: 15,
    maxLevel: 3,
    icon: "⚡",
  },
  {
    id: "species-memory",
    name: "Species Memory",
    description: "Keep one tier's generators across rebirth per level",
    costPerLevel: 20,
    maxLevel: 5,
    icon: "🧬",
  },
  {
    id: "token-magnet",
    name: "Token Magnet",
    description: "+20% Wisdom Tokens earned on rebirth per level",
    costPerLevel: 10,
    maxLevel: 5,
    icon: "🧲",
  },
  {
    id: "unlock-all-species",
    name: "Unlock All Species",
    description: "Choose any species on rebirth",
    costPerLevel: 50,
    maxLevel: 1,
    icon: "🌟",
  },
  {
    id: "burst-frequency",
    name: "Burst Frequency",
    description: "-30s to Data Burst spawn interval per level",
    costPerLevel: 8,
    maxLevel: 3,
    icon: "\u26a1",
  },
  {
    id: "burst-duration",
    name: "Burst Duration",
    description: "+10s Data Burst display duration per level",
    costPerLevel: 6,
    maxLevel: 3,
    icon: "\u23f1\ufe0f",
  },
];

/** Returns the cost for the next level of a prestige upgrade. */
export function getPrestigeCost(upgrade: PrestigeUpgrade): number {
  return upgrade.costPerLevel;
}

/** Starting TD from the Quick Start prestige upgrade. */
export function getQuickStartTd(level: number): number {
  const amounts = [0, 1_000, 10_000, 100_000];
  return amounts[Math.min(level, amounts.length - 1)];
}

/** Cost multiplier (replaces base 1.15) based on Generator Discount level. */
export function getGeneratorCostMultiplier(level: number): number {
  return 1.15 - level * 0.01;
}

/** Idle Boost multiplier for auto-gen TD/s. */
export function getIdleBoostMultiplier(level: number): number {
  return 1 + level * 0.25;
}

/** Offline efficiency (replaces base 0.5) based on Offline Efficiency level. */
export function getPrestigeOfflineEfficiency(level: number): number {
  return 0.5 + level * 0.1;
}

/** Evolution threshold multiplier based on Evolution Accelerator level. */
export function getEvolutionThresholdMultiplier(level: number): number {
  return 1 - level * 0.1;
}

/** Extra base click power from Click Mastery. */
export function getClickMasteryBonus(level: number): number {
  return level;
}

/** Token Magnet multiplier applied to WT earned on rebirth. */
export function getTokenMagnetMultiplier(level: number): number {
  return 1 + level * 0.2;
}

/**
 * Minimum Data Burst spawn interval in seconds.
 * Base 240s (4 min), reduced by 30s per Burst Frequency level.
 */
export function getBurstMinInterval(level: number): number {
  return 240 - level * 30;
}

/**
 * Maximum Data Burst spawn interval in seconds.
 * Base 480s (8 min), reduced by 30s per Burst Frequency level.
 */
export function getBurstMaxInterval(level: number): number {
  return 480 - level * 30;
}

/**
 * Data Burst display duration in seconds.
 * Base 30s, increased by 10s per Burst Duration level.
 */
export function getBurstDuration(level: number): number {
  return 30 + level * 10;
}
