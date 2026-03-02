import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Species } from "../data/species";
import { UPGRADES } from "../data/upgrades";
import { getEvolutionStage } from "../engine/evolutionEngine";
import type { Mood } from "../engine/moodEngine";
import {
  canRebirth,
  computeWisdomTokens,
  getNextSpecies,
} from "../engine/rebirthEngine";
import { getUpgradeCost } from "../engine/upgradeEngine";

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
  // Rebirth state — persists across rebirths
  wisdomTokens: number;
  rebirthCount: number;
  currentSpecies: Species;
  unlockedSpecies: Species[];
  // Achievements — persists across rebirths
  unlockedAchievements: string[];
}

interface GameActions {
  clickFeed: () => void;
  addTrainingData: (amount: number) => void;
  purchaseUpgrade: (id: string) => void;
  markFirstEvolutionSeen: () => void;
  markFirstUpgradeSeen: () => void;
  setMood: (mood: Mood) => void;
  updateLastSaved: () => void;
  performRebirth: () => void;
  unlockAchievements: (ids: string[]) => void;
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
  wisdomTokens: 0,
  rebirthCount: 0,
  currentSpecies: "GLORP",
  unlockedSpecies: ["GLORP"],
  unlockedAchievements: [],
};

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      ...initialGameState,
      clickFeed: () =>
        set((state) => {
          const newTotalTdEarned = state.totalTdEarned + 1;
          return {
            trainingData: state.trainingData + 1,
            totalClicks: state.totalClicks + 1,
            totalTdEarned: newTotalTdEarned,
            evolutionStage: getEvolutionStage(newTotalTdEarned),
            lastSaved: Date.now(),
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
      markFirstEvolutionSeen: () => set({ hasSeenFirstEvolution: true }),
      markFirstUpgradeSeen: () => set({ hasSeenFirstUpgrade: true }),
      setMood: (mood) => set({ mood, moodChangedAt: Date.now() }),
      updateLastSaved: () => set({ lastSaved: Date.now() }),
      unlockAchievements: (ids) =>
        set((state) => ({
          unlockedAchievements: [...state.unlockedAchievements, ...ids],
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
            // Persist rebirth rewards
            wisdomTokens: newWisdomTokens,
            rebirthCount: state.rebirthCount + 1,
            currentSpecies: nextSpecies,
            unlockedSpecies: newUnlocked,
          };
        }),
    }),
    {
      name: "glorp-game-state",
    },
  ),
);
