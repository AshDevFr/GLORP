import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeStorage } from "../utils/safeStorage";

/**
 * Tutorial step indices in order:
 * - FEED_BUTTON (0): pulsing highlight on FEED button, shown on first load
 * - TD_COUNTER (1): tooltip on TD counter, shown after first click
 * - UPGRADES_PANEL (2): tooltip on upgrades panel, shown when first upgrade affordable
 * - EVOLUTION (3): tooltip on evolution indicator, shown on first evolution
 */
export const TUTORIAL_STEP = {
  FEED_BUTTON: 0,
  TD_COUNTER: 1,
  UPGRADES_PANEL: 2,
  EVOLUTION: 3,
} as const;

export type TutorialStep = (typeof TUTORIAL_STEP)[keyof typeof TUTORIAL_STEP];

export const TUTORIAL_TOTAL_STEPS = 4;

export interface TutorialState {
  /** Steps completed by the player (individually dismissed or auto-advanced). */
  completedSteps: TutorialStep[];
  /** True when the player clicked "Skip tutorial" to dismiss all at once. */
  dismissed: boolean;
}

interface TutorialActions {
  /** Mark a single step as complete (idempotent). */
  completeStep: (step: TutorialStep) => void;
  /** Permanently skip the entire tutorial. */
  skipTutorial: () => void;
  /** Reset tutorial to initial state (for testing / dev tools). */
  resetTutorial: () => void;
}

export type TutorialStore = TutorialState & TutorialActions;

export const initialTutorialState: TutorialState = {
  completedSteps: [],
  dismissed: false,
};

/**
 * Returns the first step that has not been completed yet, or null if the
 * tutorial is dismissed or all steps are done.
 */
export function getActiveStep(state: TutorialState): TutorialStep | null {
  if (state.dismissed) return null;
  for (let i = 0; i < TUTORIAL_TOTAL_STEPS; i++) {
    if (!state.completedSteps.includes(i as TutorialStep)) {
      return i as TutorialStep;
    }
  }
  return null;
}

export const useTutorialStore = create<TutorialStore>()(
  persist(
    (set) => ({
      ...initialTutorialState,
      completeStep: (step) =>
        set((state) => ({
          completedSteps: state.completedSteps.includes(step)
            ? state.completedSteps
            : [...state.completedSteps, step],
        })),
      skipTutorial: () => set({ dismissed: true }),
      resetTutorial: () => set(initialTutorialState),
    }),
    { name: "glorp-tutorial", storage: safeStorage },
  ),
);
