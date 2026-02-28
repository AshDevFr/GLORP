import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GameState {
  trainingData: number;
  totalClicks: number;
  evolutionStage: number;
  lastSaved: number;
}

interface GameActions {
  clickFeed: () => void;
  addTrainingData: (amount: number) => void;
}

export type GameStore = GameState & GameActions;

export const initialGameState: GameState = {
  trainingData: 0,
  totalClicks: 0,
  evolutionStage: 0,
  lastSaved: 0,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      ...initialGameState,
      clickFeed: () =>
        set((state) => ({
          trainingData: state.trainingData + 1,
          totalClicks: state.totalClicks + 1,
          lastSaved: Date.now(),
        })),
      addTrainingData: (amount) =>
        set((state) => ({
          trainingData: state.trainingData + amount,
          lastSaved: Date.now(),
        })),
    }),
    {
      name: "glorp-game-state",
    },
  ),
);
