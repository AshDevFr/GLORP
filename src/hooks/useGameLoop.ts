import { notifications } from "@mantine/notifications";
import { useEffect, useRef } from "react";
import { ACHIEVEMENTS } from "../data/achievements";
import { checkAchievements } from "../engine/achievementEngine";
import { computeTick } from "../engine/tickEngine";
import { useGameStore } from "../store";

const TICK_INTERVAL_MS = 1000;

function notifyAchievements(newIds: string[]): void {
  for (const id of newIds) {
    const achievement = ACHIEVEMENTS.find((a) => a.id === id);
    if (achievement) {
      notifications.show({
        title: "Achievement Unlocked!",
        message: achievement.name,
        color: "yellow",
        autoClose: 4000,
      });
    }
  }
}

export function useGameLoop() {
  const lastTickRef = useRef(Date.now());

  useEffect(() => {
    lastTickRef.current = Date.now();

    const id = setInterval(() => {
      const now = Date.now();
      const deltaSeconds = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      const state = useGameStore.getState();
      const result = computeTick(state, deltaSeconds, now);

      if (result.trainingDataDelta > 0) {
        state.addTrainingData(result.trainingDataDelta);
      } else {
        // Ensure lastSaved is updated even when no TD is earned (e.g. no upgrades)
        state.updateLastSaved();
      }

      if (result.newMood) {
        state.setMood(result.newMood);
      }

      // Check for newly unlocked achievements after state updates
      const updatedState = useGameStore.getState();
      const newlyUnlocked = checkAchievements(
        updatedState,
        updatedState.unlockedAchievements,
      );
      if (newlyUnlocked.length > 0) {
        updatedState.unlockAchievements(newlyUnlocked);
        notifyAchievements(newlyUnlocked);
      }
    }, TICK_INTERVAL_MS);

    return () => clearInterval(id);
  }, []);
}
