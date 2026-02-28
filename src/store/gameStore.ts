import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UPGRADES } from "../data/upgrades";
import { getEvolutionStage } from "../engine/evolutionEngine";
import { getUpgradeCost } from "../engine/upgradeEngine";

interface GameState {
  trainingData: number;
  totalClicks: number;
  totalTdEarned: number;
  evolutionStage: number;
  lastSaved: number;
  upgradeOwned: Record<string, number>;
  hasSeenFirstEvolution: boolean;
  hasSeenFirstUpgrade: boolean;
}

interface GameActions {
  clickFeed: () => void;
  addTrainingData: (amount: number) => void;
  purchaseUpgrade: (id: string) => void;
  markFirstEvolutionSeen: () => void;
  markFirstUpgradeSeen: () => void;
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
          };
        }),
      markFirstEvolutionSeen: () => set({ hasSeenFirstEvolution: true }),
      markFirstUpgradeSeen: () => set({ hasSeenFirstUpgrade: true }),
    }),
    {
      name: "glorp-game-state",
    },
  ),
);
