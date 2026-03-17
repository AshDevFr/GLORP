import { notifications } from "@mantine/notifications";
import { useEffect, useRef } from "react";
import { ACHIEVEMENTS } from "../data/achievements";
import { BOOSTERS } from "../data/boosters";
import {
  getGeneratorCostMultiplier,
  getIdleBoostMultiplier,
} from "../data/prestigeShop";
import { getSpeciesBonus } from "../data/species";
import { UPGRADES } from "../data/upgrades";
import { checkAchievements } from "../engine/achievementEngine";
import {
  checkObjectiveCompletion,
  getCurrentDateUTC,
  pickDailyObjectives,
} from "../engine/dailyObjectivesEngine";
import {
  checkEasterEggs,
  EASTER_EGG_MESSAGES,
} from "../engine/easterEggEngine";
import { checkMilestones } from "../engine/milestoneEngine";
import { computeTick } from "../engine/tickEngine";
import {
  computeBoosterMultiplier,
  getTotalTdPerSecond,
  getUpgradeCost,
} from "../engine/upgradeEngine";
import { useGameStore } from "../store";
import { useDailyStore } from "../store/dailyStore";
import { useUIStore } from "../store/uiStore";
import type { Decimal } from "../utils/decimal";

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

      // No-prestige challenge: zero out all prestige levels
      const isNoPrest = state.activeChallengeId === "no-prestige";
      const effectivePrestige = isNoPrest ? {} : state.prestigeUpgrades;

      // Compute prestige multipliers for the tick engine
      const idleBoost = getIdleBoostMultiplier(
        effectivePrestige["idle-boost"] ?? 0,
      );
      const speciesAutoGen = getSpeciesBonus(state.currentSpecies).autoGen;

      // Burst multiplier: active only while boost has not expired
      const burstMultiplier =
        state.burstBoostExpiresAt > now ? state.burstMultiplier : 1;

      // Daily bonus multiplier: active only while bonus has not expired
      const dailyBonusMultiplier =
        state.dailyBonusExpiresAt > now ? state.dailyBonusMultiplier : 1;

      const result = computeTick(
        {
          ...state,
          idleBoostMultiplier: idleBoost * dailyBonusMultiplier,
          speciesAutoGenMultiplier: speciesAutoGen,
          burstMultiplier,
        },
        deltaSeconds,
        now,
      );

      if (result.trainingDataDelta.gt(0)) {
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

      // Track peak TD/s and generators for run stats
      {
        const peakState = useGameStore.getState();
        const boosterMult = computeBoosterMultiplier(
          BOOSTERS,
          peakState.boostersPurchased ?? [],
        );
        const idleBoostMult = getIdleBoostMultiplier(
          peakState.prestigeUpgrades["idle-boost"] ?? 0,
        );
        const speciesAutoGenMult = getSpeciesBonus(
          peakState.currentSpecies,
        ).autoGen;
        const currentTdPerSecond = getTotalTdPerSecond(
          UPGRADES,
          peakState.upgradeOwned,
          idleBoostMult * speciesAutoGenMult,
          boosterMult,
        );
        const currentGenerators = Object.values(peakState.upgradeOwned).reduce(
          (sum, n) => sum + n,
          0,
        );
        peakState.updatePeakStats(currentTdPerSecond, currentGenerators);
      }

      // Auto-Buy: purchase cheapest affordable generator once per tick
      const autoBuyLevel = effectivePrestige["auto-buy"] ?? 0;
      if (autoBuyLevel > 0) {
        const current = useGameStore.getState();
        const costMult = getGeneratorCostMultiplier(
          effectivePrestige["generator-discount"] ?? 0,
        );
        let cheapest: { id: string; cost: Decimal } | null = null;
        for (const u of UPGRADES) {
          if (current.evolutionStage < u.unlockStage) continue;
          const owned = current.upgradeOwned[u.id] ?? 0;
          const cost = getUpgradeCost(u, owned, costMult);
          if (
            cost.lte(current.trainingData) &&
            (cheapest === null || cost.lt(cheapest.cost))
          ) {
            cheapest = { id: u.id, cost };
          }
        }
        if (cheapest) {
          current.purchaseUpgrade(cheapest.id);
        }
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
        // Fire CustomEvent so dialogue and sound hooks can react
        window.dispatchEvent(new CustomEvent("achievementUnlocked"));
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

      // Daily objectives: refresh date, then check completions and award tokens
      const daily = useDailyStore.getState();
      daily.refreshIfNeeded();

      const gameForObjectives = useGameStore.getState();
      const todayObjectives = pickDailyObjectives(getCurrentDateUTC());
      for (const obj of todayObjectives) {
        if (!daily.completedObjectiveIds.includes(obj.id)) {
          const done = checkObjectiveCompletion(obj, gameForObjectives, daily);
          if (done) {
            useDailyStore.getState().markCompleted(obj.id);
            gameForObjectives.awardDailyWisdomTokens(obj.reward);
            notifications.show({
              title: "🎯 Daily Objective Complete!",
              message: `${obj.description} — +${obj.reward} wisdom tokens`,
              color: "cyan",
              autoClose: 5000,
            });
          }
        }
      }
    }, TICK_INTERVAL_MS);

    return () => clearInterval(id);
  }, []);
}
