import type { DecimalSource } from "break_infinity.js";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BOOSTERS } from "../data/boosters";
import { getChallengeById, isChallengeComplete } from "../data/challenges";
import { CLICK_UPGRADES } from "../data/clickUpgrades";
import {
  getClickMasteryBonus,
  getEvolutionThresholdMultiplier,
  getGeneratorCostMultiplier,
  getIdleBoostMultiplier,
  getQuickStartTd,
  getTokenMagnetMultiplier,
  PRESTIGE_UPGRADES,
} from "../data/prestigeShop";
import type { Species } from "../data/species";
import { getSpeciesBonus, SPECIES_ORDER } from "../data/species";
import { UPGRADES } from "../data/upgrades";
import { computeClickPower, getNextComboCount } from "../engine/clickEngine";
import { getEvolutionStage } from "../engine/evolutionEngine";
import type { Mood } from "../engine/moodEngine";
import {
  canRebirth,
  computeWisdomTokens,
  getNextSpecies,
} from "../engine/rebirthEngine";
import {
  computeBoosterMultiplier,
  getBulkCost,
  getTotalTdPerSecond,
  getUpgradeCost,
} from "../engine/upgradeEngine";
import { D, Decimal, toDecimal } from "../utils/decimal";

export interface GameState {
  trainingData: Decimal;
  totalClicks: number;
  totalTdEarned: Decimal;
  evolutionStage: number;
  lastSaved: number;
  upgradeOwned: Record<string, number>;
  hasSeenFirstEvolution: boolean;
  hasSeenFirstUpgrade: boolean;
  mood: Mood;
  moodChangedAt: number;
  // Click power state
  clickUpgradesPurchased: string[];
  comboCount: number;
  lastClickTime: number;
  // Rebirth state — persists across rebirths
  wisdomTokens: number;
  rebirthCount: number;
  currentSpecies: Species;
  unlockedSpecies: Species[];
  // Prestige shop state — persists across rebirths
  prestigeUpgrades: Record<string, number>;
  prestigeTokenBalance: number;
  hasOpenedPrestigeShop: boolean;
  // Achievements — persists across rebirths
  unlockedAchievements: string[];
  // Booster upgrades — resets on rebirth
  boostersPurchased: string[];
  // Easter eggs — persists across rebirths
  easterEggsUnlocked: string[];
  // Lifetime stats — persists across rebirths
  totalTimePlayed: number;
  // Milestone celebrations — resets on rebirth
  crossedMilestones: number[];
  // Per-run stats — reset on rebirth
  runStart: number;
  peakTdPerSecond: Decimal;
  peakGeneratorsOwned: number;
  // Cumulative lifetime stats — persist across rebirths
  lifetimeTdEarned: Decimal;
  lifetimePeakTdPerSecond: Decimal;
  lifetimeBestRunTd: Decimal;
  lifetimeWisdomEarned: number;
  // Challenge run state — resets on rebirth
  activeChallengeId: string | null;
}

interface GameActions {
  clickFeed: () => void;
  addTrainingData: (amount: DecimalSource) => void;
  purchaseUpgrade: (id: string) => void;
  purchaseBulkUpgrade: (id: string, count: number) => void;
  purchaseBooster: (id: string) => void;
  purchaseClickUpgrade: (id: string) => void;
  purchasePrestigeUpgrade: (id: string) => void;
  markPrestigeShopOpened: () => void;
  markFirstEvolutionSeen: () => void;
  markFirstUpgradeSeen: () => void;
  setMood: (mood: Mood) => void;
  updateLastSaved: () => void;
  performRebirth: (selectedSpecies?: Species, challengeId?: string) => void;
  unlockAchievements: (ids: string[]) => void;
  unlockEasterEgg: (id: string) => void;
  incrementTimePlayed: (seconds: number) => void;
  crossMilestones: (thresholds: number[]) => void;
  updatePeakStats: (
    tdPerSecond: DecimalSource,
    generatorsOwned: number,
  ) => void;
  awardDailyWisdomTokens: (amount: number) => void;
}

export type GameStore = GameState & GameActions;

export const initialGameState: GameState = {
  trainingData: D(0),
  totalClicks: 0,
  totalTdEarned: D(0),
  evolutionStage: 0,
  lastSaved: 0,
  upgradeOwned: {},
  hasSeenFirstEvolution: false,
  hasSeenFirstUpgrade: false,
  mood: "Neutral",
  moodChangedAt: 0,
  clickUpgradesPurchased: [],
  comboCount: 0,
  lastClickTime: 0,
  wisdomTokens: 0,
  rebirthCount: 0,
  currentSpecies: "GLORP",
  unlockedSpecies: ["GLORP"],
  prestigeUpgrades: {},
  prestigeTokenBalance: 0,
  hasOpenedPrestigeShop: false,
  boostersPurchased: [],
  unlockedAchievements: [],
  easterEggsUnlocked: [],
  totalTimePlayed: 0,
  crossedMilestones: [],
  runStart: 0,
  peakTdPerSecond: D(0),
  peakGeneratorsOwned: 0,
  lifetimeTdEarned: D(0),
  lifetimePeakTdPerSecond: D(0),
  lifetimeBestRunTd: D(0),
  lifetimeWisdomEarned: 0,
  activeChallengeId: null,
};

/** Helper: get a prestige upgrade level from state. */
function pLevel(prestigeUpgrades: Record<string, number>, id: string): number {
  return prestigeUpgrades[id] ?? 0;
}

/**
 * List of GameState keys that are stored as Decimal.
 * Used for serialization/deserialization in the persist middleware.
 */
const DECIMAL_KEYS: ReadonlySet<string> = new Set([
  "trainingData",
  "totalTdEarned",
  "peakTdPerSecond",
  "lifetimeTdEarned",
  "lifetimePeakTdPerSecond",
  "lifetimeBestRunTd",
]);

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      ...initialGameState,
      clickFeed: () =>
        set((state) => {
          const now = Date.now();
          const newComboCount = getNextComboCount(
            state.comboCount,
            state.lastClickTime,
            now,
          );
          // No-prestige challenge: zero out all prestige bonuses
          const isNoPrest = state.activeChallengeId === "no-prestige";
          const effectivePrestige = isNoPrest ? {} : state.prestigeUpgrades;
          const clickMastery = getClickMasteryBonus(
            pLevel(effectivePrestige, "click-mastery"),
          );
          const speciesBonus = getSpeciesBonus(state.currentSpecies);
          const idleBoost = getIdleBoostMultiplier(
            pLevel(effectivePrestige, "idle-boost"),
          );
          const boosterMult = computeBoosterMultiplier(
            BOOSTERS,
            state.boostersPurchased,
          );
          const tdPerSecond = getTotalTdPerSecond(
            UPGRADES,
            state.upgradeOwned,
            idleBoost * speciesBonus.autoGen,
            boosterMult,
          );
          const clickPower = computeClickPower(
            {
              clickUpgradesPurchased: state.clickUpgradesPurchased,
              comboCount: newComboCount,
              lastClickTime: now,
            },
            CLICK_UPGRADES,
            tdPerSecond,
            now,
            clickMastery,
            speciesBonus.clickPower,
          );
          const newTotalTdEarned = state.totalTdEarned.add(clickPower);
          const evoMultiplier = getEvolutionThresholdMultiplier(
            pLevel(effectivePrestige, "evolution-accelerator"),
          );
          return {
            trainingData: state.trainingData.add(clickPower),
            totalClicks: state.totalClicks + 1,
            totalTdEarned: newTotalTdEarned,
            evolutionStage: getEvolutionStage(newTotalTdEarned, evoMultiplier),
            lastSaved: now,
            comboCount: newComboCount,
            lastClickTime: now,
          };
        }),
      addTrainingData: (amount) =>
        set((state) => {
          const amountD = D(amount);
          const newTotalTdEarned = state.totalTdEarned.add(amountD);
          const ep =
            state.activeChallengeId === "no-prestige"
              ? {}
              : state.prestigeUpgrades;
          const evoMultiplier = getEvolutionThresholdMultiplier(
            pLevel(ep, "evolution-accelerator"),
          );
          return {
            trainingData: state.trainingData.add(amountD),
            totalTdEarned: newTotalTdEarned,
            evolutionStage: getEvolutionStage(newTotalTdEarned, evoMultiplier),
            lastSaved: Date.now(),
          };
        }),
      purchaseUpgrade: (id) =>
        set((state) => {
          const upgrade = UPGRADES.find((u) => u.id === id);
          if (!upgrade) return state;

          const owned = state.upgradeOwned[id] ?? 0;
          const ep =
            state.activeChallengeId === "no-prestige"
              ? {}
              : state.prestigeUpgrades;
          const costMultiplier = getGeneratorCostMultiplier(
            pLevel(ep, "generator-discount"),
          );
          const cost = getUpgradeCost(upgrade, owned, costMultiplier);

          if (state.trainingData.lt(cost)) return state;

          return {
            trainingData: state.trainingData.sub(cost),
            upgradeOwned: { ...state.upgradeOwned, [id]: owned + 1 },
            lastSaved: Date.now(),
            mood: "Excited" as Mood,
            moodChangedAt: Date.now(),
          };
        }),
      purchaseBulkUpgrade: (id, count) =>
        set((state) => {
          if (count <= 0) return state;
          const upgrade = UPGRADES.find((u) => u.id === id);
          if (!upgrade) return state;

          const owned = state.upgradeOwned[id] ?? 0;
          const ep =
            state.activeChallengeId === "no-prestige"
              ? {}
              : state.prestigeUpgrades;
          const costMultiplier = getGeneratorCostMultiplier(
            pLevel(ep, "generator-discount"),
          );
          const cost = getBulkCost(upgrade, owned, count, costMultiplier);

          if (state.trainingData.lt(cost)) return state;

          return {
            trainingData: state.trainingData.sub(cost),
            upgradeOwned: { ...state.upgradeOwned, [id]: owned + count },
            lastSaved: Date.now(),
            mood: "Excited" as Mood,
            moodChangedAt: Date.now(),
          };
        }),
      purchaseBooster: (id) =>
        set((state) => {
          const booster = BOOSTERS.find((b) => b.id === id);
          if (!booster) return state;

          if (state.boostersPurchased.includes(id)) return state;
          if (state.evolutionStage < booster.unlockStage) return state;
          if (state.trainingData.lt(booster.cost)) return state;

          return {
            trainingData: state.trainingData.sub(booster.cost),
            boostersPurchased: [...state.boostersPurchased, id],
            lastSaved: Date.now(),
            mood: "Excited" as Mood,
            moodChangedAt: Date.now(),
          };
        }),
      purchaseClickUpgrade: (id) =>
        set((state) => {
          const upgrade = CLICK_UPGRADES.find((u) => u.id === id);
          if (!upgrade) return state;

          if (state.clickUpgradesPurchased.includes(id)) return state;
          if (state.trainingData.lt(upgrade.cost)) return state;
          if (state.evolutionStage < upgrade.unlockStage) return state;

          return {
            trainingData: state.trainingData.sub(upgrade.cost),
            clickUpgradesPurchased: [...state.clickUpgradesPurchased, id],
            lastSaved: Date.now(),
            mood: "Excited" as Mood,
            moodChangedAt: Date.now(),
          };
        }),
      purchasePrestigeUpgrade: (id) =>
        set((state) => {
          const upgrade = PRESTIGE_UPGRADES.find((u) => u.id === id);
          if (!upgrade) return state;

          const currentLevel = pLevel(state.prestigeUpgrades, id);
          if (currentLevel >= upgrade.maxLevel) return state;

          const cost = upgrade.costPerLevel;
          if (state.prestigeTokenBalance < cost) return state;

          return {
            prestigeUpgrades: {
              ...state.prestigeUpgrades,
              [id]: currentLevel + 1,
            },
            prestigeTokenBalance: state.prestigeTokenBalance - cost,
          };
        }),
      markPrestigeShopOpened: () => set({ hasOpenedPrestigeShop: true }),
      markFirstEvolutionSeen: () => set({ hasSeenFirstEvolution: true }),
      markFirstUpgradeSeen: () => set({ hasSeenFirstUpgrade: true }),
      setMood: (mood) => set({ mood, moodChangedAt: Date.now() }),
      updateLastSaved: () => set({ lastSaved: Date.now() }),
      unlockAchievements: (ids) =>
        set((state) => ({
          unlockedAchievements: [...state.unlockedAchievements, ...ids],
        })),
      unlockEasterEgg: (id) =>
        set((state) => ({
          easterEggsUnlocked: state.easterEggsUnlocked.includes(id)
            ? state.easterEggsUnlocked
            : [...state.easterEggsUnlocked, id],
        })),
      incrementTimePlayed: (seconds) =>
        set((state) => ({
          totalTimePlayed: state.totalTimePlayed + seconds,
        })),
      crossMilestones: (thresholds) =>
        set((state) => ({
          crossedMilestones: [...state.crossedMilestones, ...thresholds],
        })),
      updatePeakStats: (tdPerSecond, generatorsOwned) =>
        set((state) => ({
          peakTdPerSecond: Decimal.max(state.peakTdPerSecond, tdPerSecond),
          peakGeneratorsOwned: Math.max(
            state.peakGeneratorsOwned,
            generatorsOwned,
          ),
          lifetimePeakTdPerSecond: Decimal.max(
            state.lifetimePeakTdPerSecond,
            tdPerSecond,
          ),
        })),
      awardDailyWisdomTokens: (amount) =>
        set((state) => ({
          wisdomTokens: state.wisdomTokens + amount,
          prestigeTokenBalance: state.prestigeTokenBalance + amount,
          lifetimeWisdomEarned: state.lifetimeWisdomEarned + amount,
        })),
      performRebirth: (selectedSpecies, challengeId) =>
        set((state) => {
          if (!canRebirth(state.evolutionStage)) return state;

          // Token Magnet bonus
          const tokenMagnet = getTokenMagnetMultiplier(
            pLevel(state.prestigeUpgrades, "token-magnet"),
          );
          // Species wisdom bonus
          const speciesBonus = getSpeciesBonus(state.currentSpecies);
          let earned = computeWisdomTokens(
            state.totalTdEarned,
            tokenMagnet * speciesBonus.wisdomBonus,
          );

          // Challenge completion bonus: 2x tokens if challenge was active and completed
          const activeChallenge = state.activeChallengeId
            ? getChallengeById(state.activeChallengeId)
            : null;
          if (activeChallenge) {
            const now = Date.now();
            if (
              isChallengeComplete(
                activeChallenge,
                state.evolutionStage,
                state.runStart,
                now,
              )
            ) {
              earned = Math.floor(earned * activeChallenge.bonusMultiplier);
            }
          }
          const newWisdomTokens = state.wisdomTokens + earned;
          const newBalance = state.prestigeTokenBalance + earned;

          // Unlock All Species check
          const hasUnlockAll =
            pLevel(state.prestigeUpgrades, "unlock-all-species") >= 1;

          // Determine next species
          let nextSpecies: Species;
          if (selectedSpecies && hasUnlockAll) {
            nextSpecies = selectedSpecies;
          } else {
            nextSpecies = getNextSpecies(state.currentSpecies);
          }

          // Unlocked species list
          let newUnlocked: Species[];
          if (hasUnlockAll) {
            newUnlocked = [...SPECIES_ORDER];
          } else {
            newUnlocked = state.unlockedSpecies.includes(nextSpecies)
              ? [...state.unlockedSpecies]
              : [...state.unlockedSpecies, nextSpecies];
          }

          // No-prestige challenge for next run: disable quick-start
          const nextRunNoPrest = challengeId === "no-prestige";

          // Quick Start TD
          const quickStartTd = nextRunNoPrest
            ? 0
            : getQuickStartTd(pLevel(state.prestigeUpgrades, "quick-start"));

          // Capture run stats before reset
          const runTd = state.totalTdEarned;
          const now = Date.now();

          return {
            // Reset progression
            trainingData: D(quickStartTd),
            totalClicks: 0,
            totalTdEarned: D(quickStartTd),
            evolutionStage:
              quickStartTd > 0 ? getEvolutionStage(quickStartTd) : 0,
            upgradeOwned: {},
            mood: "Neutral" as Mood,
            moodChangedAt: now,
            hasSeenFirstEvolution: false,
            hasSeenFirstUpgrade: false,
            lastSaved: now,
            // Reset click power and booster state
            clickUpgradesPurchased: [],
            boostersPurchased: [],
            comboCount: 0,
            lastClickTime: 0,
            crossedMilestones: [],
            // Reset per-run stats
            runStart: now,
            peakTdPerSecond: D(0),
            peakGeneratorsOwned: 0,
            // Persist rebirth rewards
            wisdomTokens: newWisdomTokens,
            prestigeTokenBalance: newBalance,
            rebirthCount: state.rebirthCount + 1,
            currentSpecies: nextSpecies,
            unlockedSpecies: newUnlocked,
            // Accumulate lifetime stats
            lifetimeTdEarned: state.lifetimeTdEarned.add(runTd),
            lifetimePeakTdPerSecond: Decimal.max(
              state.lifetimePeakTdPerSecond,
              state.peakTdPerSecond,
            ),
            lifetimeBestRunTd: Decimal.max(state.lifetimeBestRunTd, runTd),
            lifetimeWisdomEarned: state.lifetimeWisdomEarned + earned,
            // Challenge for next run (null = normal)
            activeChallengeId: challengeId ?? null,
          };
        }),
    }),
    {
      name: "glorp-game-state",
      merge: (persisted, current) => {
        const saved = persisted as Partial<Record<string, unknown>> | undefined;
        if (!saved) return current;

        // Convert Decimal fields from persisted strings/numbers back to Decimal
        const merged = { ...current, ...(saved as Partial<GameState>) };
        for (const key of DECIMAL_KEYS) {
          const val = saved[key];
          if (val !== undefined) {
            (merged as Record<string, unknown>)[key] = toDecimal(
              val as string | number | null,
            );
          }
        }

        // Migrate old saves: convert wisdomTokens to spendable balance
        if (saved.prestigeUpgrades === undefined) {
          merged.prestigeUpgrades = {};
        }
        if (saved.prestigeTokenBalance === undefined) {
          merged.prestigeTokenBalance = (saved.wisdomTokens as number) ?? 0;
        }
        if (saved.hasOpenedPrestigeShop === undefined) {
          merged.hasOpenedPrestigeShop = false;
        }
        if (saved.runStart === undefined) {
          merged.runStart = Date.now();
        }
        return merged;
      },
    },
  ),
);
