import type { GameState } from "../store/gameStore";
import { BOOSTERS } from "./boosters";
import { PRESTIGE_UPGRADES } from "./prestigeShop";
import { SPECIES_ORDER } from "./species";
import { SYNERGIES } from "./synergies";

export type AchievementId = string;

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  condition: (state: GameState) => boolean;
}

export const ACHIEVEMENTS: readonly Achievement[] = [
  {
    id: "first-click",
    name: "First Click",
    description: "Click GLORP for the first time",
    condition: (s) => s.totalClicks >= 1,
  },
  {
    id: "clicks-100",
    name: "Hundred Clicks",
    description: "Click GLORP 100 times",
    condition: (s) => s.totalClicks >= 100,
  },
  {
    id: "clicks-1000",
    name: "Click Addict",
    description: "Click GLORP 1,000 times",
    condition: (s) => s.totalClicks >= 1_000,
  },
  {
    id: "clicks-10000",
    name: "Clicking Machine",
    description: "Click GLORP 10,000 times",
    condition: (s) => s.totalClicks >= 10_000,
  },
  {
    id: "first-upgrade",
    name: "First Upgrade",
    description: "Purchase your first upgrade",
    condition: (s) => Object.values(s.upgradeOwned).some((c) => c > 0),
  },
  {
    id: "upgrades-5",
    name: "Getting Organized",
    description: "Own 5 upgrades in total",
    condition: (s) =>
      Object.values(s.upgradeOwned).reduce((sum, c) => sum + c, 0) >= 5,
  },
  {
    id: "upgrades-10",
    name: "Power User",
    description: "Own 10 upgrades in total",
    condition: (s) =>
      Object.values(s.upgradeOwned).reduce((sum, c) => sum + c, 0) >= 10,
  },
  {
    id: "stage-1",
    name: "First Evolution",
    description: "Reach Stage 1 (Spark)",
    condition: (s) => s.evolutionStage >= 1,
  },
  {
    id: "stage-2",
    name: "Growing Stronger",
    description: "Reach Stage 2 (Neuron)",
    condition: (s) => s.evolutionStage >= 2,
  },
  {
    id: "stage-3",
    name: "Neural Network",
    description: "Reach Stage 3 (Cortex)",
    condition: (s) => s.evolutionStage >= 3,
  },
  {
    id: "stage-4",
    name: "Oracle Achieved",
    description: "Reach Stage 4 (Oracle)",
    condition: (s) => s.evolutionStage >= 4,
  },
  {
    id: "td-1k",
    name: "Data Hoarder",
    description: "Earn 1,000 TD total",
    condition: (s) => s.totalTdEarned.gte(1_000),
  },
  {
    id: "td-1m",
    name: "Big Data",
    description: "Earn 1,000,000 TD total",
    condition: (s) => s.totalTdEarned.gte(1_000_000),
  },
  {
    id: "td-1b",
    name: "Data Singularity",
    description: "Earn 1,000,000,000 TD total",
    condition: (s) => s.totalTdEarned.gte(1_000_000_000),
  },
  {
    id: "first-rebirth",
    name: "Transcendence",
    description: "Perform your first Rebirth",
    condition: (s) => s.rebirthCount >= 1,
  },
  {
    id: "rebirths-5",
    name: "Serial Rebirther",
    description: "Perform 5 Rebirths",
    condition: (s) => s.rebirthCount >= 5,
  },
  {
    id: "click-storm",
    name: "Click Storm",
    description: "10x click combo! Your fingers are on fire!",
    condition: (s) => s.comboCount >= 10,
  },
  {
    id: "synergy-first",
    name: "Synergy!",
    description: "Unlocked your first cross-generator synergy",
    condition: (s) =>
      SYNERGIES.some(
        (syn) => (s.upgradeOwned[syn.sourceId] ?? 0) >= syn.threshold,
      ),
  },
  {
    id: "bulk-buyer",
    name: "Bulk Buyer",
    description: "100 of a single generator. Now THAT's commitment.",
    condition: (s) => Object.values(s.upgradeOwned).some((c) => c >= 100),
  },
  {
    id: "window-shopper",
    name: "Window Shopper",
    description: "Browsing the prestige shop for the first time",
    condition: (s) => s.hasOpenedPrestigeShop,
  },
  {
    id: "fully-loaded",
    name: "Fully Loaded",
    description: "Every prestige upgrade maxed. You are GLORP's champion.",
    condition: (s) =>
      PRESTIGE_UPGRADES.every(
        (u) => (s.prestigeUpgrades[u.id] ?? 0) >= u.maxLevel,
      ),
  },
  {
    id: "multiplied",
    name: "Multiplied!",
    description: "2x × 3x × 5x × 10x = 300x. Math is beautiful.",
    condition: (s) => BOOSTERS.every((b) => s.boostersPurchased.includes(b.id)),
  },
  {
    id: "species-collector",
    name: "Species Collector",
    description: "Played as every species. Which is your favorite?",
    condition: (s) => s.unlockedSpecies.length >= SPECIES_ORDER.length,
  },
  {
    id: "td-1t",
    name: "Trillionaire",
    description: "A trillion training data points. GLORP transcends.",
    condition: (s) => s.totalTdEarned.gte(1_000_000_000_000),
  },
];
