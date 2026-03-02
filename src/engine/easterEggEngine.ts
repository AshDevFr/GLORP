import { ACHIEVEMENTS } from "../data/achievements";
import type { GameState } from "../store/gameStore";

export type EasterEggId = "veteran" | "konami" | "completionist";

/**
 * Returns the IDs of newly unlocked easter eggs given the current game state.
 * Does not include "konami" — that is triggered by key sequence, not state.
 */
export function checkEasterEggs(
  state: GameState,
  unlocked: readonly string[],
): EasterEggId[] {
  const unlockedSet = new Set(unlocked);
  const newEggs: EasterEggId[] = [];

  // EE1: veteran — clicked 1000 times total
  if (!unlockedSet.has("veteran") && state.totalClicks >= 1000) {
    newEggs.push("veteran");
  }

  // EE3: completionist — all achievements unlocked
  if (
    !unlockedSet.has("completionist") &&
    state.unlockedAchievements.length >= ACHIEVEMENTS.length
  ) {
    newEggs.push("completionist");
  }

  return newEggs;
}

export const EASTER_EGG_MESSAGES: Record<
  EasterEggId,
  { title: string; message: string }
> = {
  veteran: {
    title: "🐾 Veteran!",
    message: "I... I remember you. You've been here all along.",
  },
  konami: {
    title: "🌈 KONAMI!",
    message: "↑↑↓↓←→←→BA — You know the old ways.",
  },
  completionist: {
    title: "🌟 Transcendent!",
    message: "All achievements unlocked. NEXUS stirs in the void.",
  },
};
