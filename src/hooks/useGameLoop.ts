import { notifications } from "@mantine/notifications";
import { useEffect, useRef } from "react";
import { ACHIEVEMENTS } from "../data/achievements";
import { checkAchievements } from "../engine/achievementEngine";
import {
  checkEasterEggs,
  EASTER_EGG_MESSAGES,
} from "../engine/easterEggEngine";
import { checkMilestones } from "../engine/milestoneEngine";
import { computeTick } from "../engine/tickEngine";
import { useGameStore } from "../store";
import { useUIStore } from "../store/uiStore";

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

function notifyEasterEggs(newIds: string[]): void {
  for (const id of newIds) {
    const msg = EASTER_EGG_MESSAGES[id as keyof typeof EASTER_EGG_MESSAGES];
    if (msg) {
      notifications.show({
        title: msg.title,
        message: msg.message,
        color: "violet",
        autoClose: 6000,
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
      const prevTdEarned = state.totalTdEarned;
      const result = computeTick(state, deltaSeconds, now);

      if (result.trainingDataDelta > 0) {
        state.addTrainingData(result.trainingDataDelta);

        // Check for milestone crossings and fire celebration events.
        const afterTick = useGameStore.getState();
        const alreadyCrossed = new Set(afterTick.crossedMilestones);
        const newMilestones = checkMilestones(
          prevTdEarned,
          afterTick.totalTdEarned,
          alreadyCrossed,
        );
        if (newMilestones.length > 0) {
          afterTick.crossMilestones(newMilestones);
          afterTick.setMood("Excited");
          for (const threshold of newMilestones) {
            useUIStore.getState().triggerMilestone(threshold);
          }
        }
      } else {
        // Ensure lastSaved is updated even when no TD is earned (e.g. no upgrades)
        state.updateLastSaved();
      }

      if (result.newMood) {
        state.setMood(result.newMood);
      }

      // Increment total time played each tick
      state.incrementTimePlayed(deltaSeconds);

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

      // Check for newly triggered easter eggs (state-based; konami handled in GameLayout)
      const freshState = useGameStore.getState();
      const newEasterEggs = checkEasterEggs(
        freshState,
        freshState.easterEggsUnlocked,
      );
      if (newEasterEggs.length > 0) {
        for (const egg of newEasterEggs) {
          freshState.unlockEasterEgg(egg);
        }
        notifyEasterEggs(newEasterEggs);
      }
    }, TICK_INTERVAL_MS);

    return () => clearInterval(id);
  }, []);
}
