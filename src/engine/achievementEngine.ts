import { ACHIEVEMENTS, type AchievementId } from "../data/achievements";
import type { GameState } from "../store/gameStore";

/**
 * Returns the IDs of achievements that are newly satisfied given the current
 * game state, excluding those already in the `unlocked` list.
 * All conditions must be O(1) — no loops proportional to unbounded data.
 */
export function checkAchievements(
  state: GameState,
  unlocked: readonly string[],
): AchievementId[] {
  const unlockedSet = new Set(unlocked);
  return ACHIEVEMENTS.filter(
    (a) => !unlockedSet.has(a.id) && a.condition(state),
  ).map((a) => a.id);
}
