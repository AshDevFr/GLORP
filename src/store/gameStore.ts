import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BOOSTERS } from "../data/boosters";
import { CLICK_UPGRADES } from "../data/clickUpgrades";
import {
  getClickMasteryBonus,
  getEvolutionThresholdMultiplier,
  getGeneratorCostMultiplier,
  getQuickStartTd,
  getRetainedTiers,
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
import { getBulkCost, getUpgradeCost } from "../engine/upgradeEngine";

export interface GameState {
  trainingData: number;
  totalClicks: number;
  totalTdEarned: number;
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
}

interface GameActions {
  clickFeed: () => void;
  addTrainingData: (amount: number) => void;
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
  performRebirth: (selectedSpecies?: Species) => void;
  unlockAchievements: (ids: string[]) => void;
  unlockEasterEgg: (id: string) => void;
  incrementTimePlayed: (seconds: number) => void;
  crossMilestones: (thresholds: number[]) => void;
}

export type GameStore = GameState & GameActions;

export const initialGameState: GameState = {
  trainingData: 0,
  totalClicks: 0,
  totalTdEarned: 0,
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
};

/** Helper: get a prestige upgrade level from state. */
function pLevel(prestigeUpgrades: Record<string, number>, id: string): number {
  return prestigeUpgrades[id] ?? 0;
}

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
          const clickMastery = getClickMasteryBonus(
            pLevel(state.prestigeUpgrades, "click-mastery"),
          );
          const speciesBonus = getSpeciesBonus(state.currentSpecies);
          const clickPower = computeClickPower(
            {
              evolutionStage: state.evolutionStage,
              clickUpgradesPurchased: state.clickUpgradesPurchased,
              comboCount: newComboCount,
              lastClickTime: now,
            },
            CLICK_UPGRADES,
            now,
            clickMastery,
            speciesBonus.clickPower,
          );
          const newTotalTdEarned = state.totalTdEarned + clickPower;
          const evoMultiplier = getEvolutionThresholdMultiplier(
            pLevel(state.prestigeUpgrades, "evolution-accelerator"),
          );
          return {
            trainingData: state.trainingData + clickPower,
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
          const newTotalTdEarned = state.totalTdEarned + amount;
          const evoMultiplier = getEvolutionThresholdMultiplier(
            pLevel(state.prestigeUpgrades, "evolution-accelerator"),
          );
          return {
            trainingData: state.trainingData + amount,
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
          const costMultiplier = getGeneratorCostMultiplier(
            pLevel(state.prestigeUpgrades, "generator-discount"),
          );
          const cost = getUpgradeCost(upgrade, owned, costMultiplier);

          if (state.trainingData < cost) return state;

          return {
            trainingData: state.trainingData - cost,
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
          const costMultiplier = getGeneratorCostMultiplier(
            pLevel(state.prestigeUpgrades, "generator-discount"),
          );
          const cost = getBulkCost(upgrade, owned, count, costMultiplier);

          if (state.trainingData < cost) return state;

          return {
            trainingData: state.trainingData - cost,
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
          if (state.trainingData < booster.cost) return state;

          return {
            trainingData: state.trainingData - booster.cost,
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
          if (state.trainingData < upgrade.cost) return state;
          if (state.evolutionStage < upgrade.unlockStage) return state;

          return {
            trainingData: state.trainingData - upgrade.cost,
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
      performRebirth: (selectedSpecies) =>
        set((state) => {
          if (!canRebirth(state.evolutionStage)) return state;

          // Token Magnet bonus
          const tokenMagnet = getTokenMagnetMultiplier(
            pLevel(state.prestigeUpgrades, "token-magnet"),
          );
          // Species wisdom bonus
          const speciesBonus = getSpeciesBonus(state.currentSpecies);
          const earned = computeWisdomTokens(
            state.totalTdEarned,
            tokenMagnet * speciesBonus.wisdomBonus,
          );
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

          // Species Memory: retain owned generators in retained tiers
          const retainedTiers = getRetainedTiers(
            pLevel(state.prestigeUpgrades, "species-memory"),
          );
          const retainedUpgrades: Record<string, number> = {};
          if (retainedTiers.length > 0) {
            for (const u of UPGRADES) {
              if (retainedTiers.includes(u.tier)) {
                const count = state.upgradeOwned[u.id];
                if (count && count > 0) {
                  retainedUpgrades[u.id] = count;
                }
              }
            }
          }

          // Quick Start TD
          const quickStartTd = getQuickStartTd(
            pLevel(state.prestigeUpgrades, "quick-start"),
          );

          return {
            // Reset progression
            trainingData: quickStartTd,
            totalClicks: 0,
            totalTdEarned: quickStartTd,
            evolutionStage:
              quickStartTd > 0 ? getEvolutionStage(quickStartTd) : 0,
            upgradeOwned: retainedUpgrades,
            mood: "Neutral" as Mood,
            moodChangedAt: Date.now(),
            hasSeenFirstEvolution: false,
            hasSeenFirstUpgrade: false,
            lastSaved: Date.now(),
            // Reset click power and booster state
            clickUpgradesPurchased: [],
            boostersPurchased: [],
            comboCount: 0,
            lastClickTime: 0,
            crossedMilestones: [],
            // Persist rebirth rewards
            wisdomTokens: newWisdomTokens,
            prestigeTokenBalance: newBalance,
            rebirthCount: state.rebirthCount + 1,
            currentSpecies: nextSpecies,
            unlockedSpecies: newUnlocked,
          };
        }),
    }),
    {
      name: "glorp-game-state",
      merge: (persisted, current) => {
        const saved = persisted as Partial<GameState> | undefined;
        if (!saved) return current;
        // Migrate old saves: convert wisdomTokens to spendable balance
        const merged = { ...current, ...saved };
        if (saved.prestigeUpgrades === undefined) {
          merged.prestigeUpgrades = {};
        }
        if (saved.prestigeTokenBalance === undefined) {
          merged.prestigeTokenBalance = saved.wisdomTokens ?? 0;
        }
        if (saved.hasOpenedPrestigeShop === undefined) {
          merged.hasOpenedPrestigeShop = false;
        }
        return merged;
      },
    },
  ),
);
