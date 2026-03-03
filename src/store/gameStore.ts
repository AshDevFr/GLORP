import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BOOSTERS } from "../data/boosters";
import { CLICK_UPGRADES } from "../data/clickUpgrades";
import type { Species } from "../data/species";
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
  markFirstEvolutionSeen: () => void;
  markFirstUpgradeSeen: () => void;
  setMood: (mood: Mood) => void;
  updateLastSaved: () => void;
  performRebirth: () => void;
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
  boostersPurchased: [],
  unlockedAchievements: [],
  easterEggsUnlocked: [],
  totalTimePlayed: 0,
  crossedMilestones: [],
};

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
          const clickPower = computeClickPower(
            {
              evolutionStage: state.evolutionStage,
              clickUpgradesPurchased: state.clickUpgradesPurchased,
              comboCount: newComboCount,
              lastClickTime: now,
            },
            CLICK_UPGRADES,
            now,
          );
          const newTotalTdEarned = state.totalTdEarned + clickPower;
          return {
            trainingData: state.trainingData + clickPower,
            totalClicks: state.totalClicks + 1,
            totalTdEarned: newTotalTdEarned,
            evolutionStage: getEvolutionStage(newTotalTdEarned),
            lastSaved: now,
            comboCount: newComboCount,
            lastClickTime: now,
          };
        }),
      addTrainingData: (amount) =>
        set((state) => {
          const newTotalTdEarned = state.totalTdEarned + amount;
          return {
            trainingData: state.trainingData + amount,
            totalTdEarned: newTotalTdEarned,
            evolutionStage: getEvolutionStage(newTotalTdEarned),
            lastSaved: Date.now(),
          };
        }),
      purchaseUpgrade: (id) =>
        set((state) => {
          const upgrade = UPGRADES.find((u) => u.id === id);
          if (!upgrade) return state;

          const owned = state.upgradeOwned[id] ?? 0;
          const cost = getUpgradeCost(upgrade, owned);

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
          const cost = getBulkCost(upgrade, owned, count);

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

          // Already purchased (one-time only)
          if (state.boostersPurchased.includes(id)) return state;

          // Stage requirement not met
          if (state.evolutionStage < booster.unlockStage) return state;

          // Not enough TD
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

          // Already purchased (one-time only)
          if (state.clickUpgradesPurchased.includes(id)) return state;

          // Not enough TD
          if (state.trainingData < upgrade.cost) return state;

          // Stage requirement not met
          if (state.evolutionStage < upgrade.unlockStage) return state;

          return {
            trainingData: state.trainingData - upgrade.cost,
            clickUpgradesPurchased: [...state.clickUpgradesPurchased, id],
            lastSaved: Date.now(),
            mood: "Excited" as Mood,
            moodChangedAt: Date.now(),
          };
        }),
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
      performRebirth: () =>
        set((state) => {
          if (!canRebirth(state.evolutionStage)) return state;

          const earned = computeWisdomTokens(state.totalTdEarned);
          const newWisdomTokens = state.wisdomTokens + earned;
          const nextSpecies = getNextSpecies(state.currentSpecies);
          const newUnlocked = state.unlockedSpecies.includes(nextSpecies)
            ? state.unlockedSpecies
            : [...state.unlockedSpecies, nextSpecies];

          return {
            // Reset progression
            trainingData: 0,
            totalClicks: 0,
            totalTdEarned: 0,
            evolutionStage: 0,
            upgradeOwned: {},
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
            rebirthCount: state.rebirthCount + 1,
            currentSpecies: nextSpecies,
            unlockedSpecies: newUnlocked,
            // easterEggsUnlocked and totalTimePlayed persist across rebirths
          };
        }),
    }),
    {
      name: "glorp-game-state",
    },
  ),
);
