import { useEffect, useRef, useState } from "react";
import type { DialogueLine } from "../data/dialogue";
import { getDialogue, getRandomPhase89Line } from "../data/dialogue";
import { PRESTIGE_UPGRADES } from "../data/prestigeShop";
import type { Species } from "../data/species";
import { COMBO_THRESHOLD } from "../engine/clickEngine";
import type { Mood } from "../engine/moodEngine";
import { getActiveSynergies } from "../engine/synergyEngine";
import { useGameStore } from "../store";

function getFilteredLines(
  species: Species,
  stage: number,
  mood: Mood,
): readonly DialogueLine[] {
  const dialogue = getDialogue(species, stage);
  const moodLines = dialogue.idle.filter((l) => l.moods?.includes(mood));
  return moodLines.length > 0 ? moodLines : dialogue.idle;
}

function getRandomIdleLine(
  species: Species,
  stage: number,
  mood: Mood,
): string {
  const lines = getFilteredLines(species, stage, mood);
  return lines[Math.floor(Math.random() * lines.length)].text;
}

function getRandomDelay(): number {
  return (10 + (Math.random() * 4 - 2)) * 1000;
}

export function useDialogue(): string {
  const evolutionStage = useGameStore((s) => s.evolutionStage);
  const upgradeOwned = useGameStore((s) => s.upgradeOwned);
  const hasSeenFirstEvolution = useGameStore((s) => s.hasSeenFirstEvolution);
  const hasSeenFirstUpgrade = useGameStore((s) => s.hasSeenFirstUpgrade);
  const mood = useGameStore((s) => s.mood);
  const currentSpecies = useGameStore((s) => s.currentSpecies);
  const comboCount = useGameStore((s) => s.comboCount);
  const prestigeUpgrades = useGameStore((s) => s.prestigeUpgrades);
  const activeChallengeId = useGameStore((s) => s.activeChallengeId);

  const [currentLine, setCurrentLine] = useState(() =>
    getRandomIdleLine(currentSpecies, evolutionStage, mood),
  );

  const prevStageRef = useRef(evolutionStage);
  const prevHasUpgradesRef = useRef(
    Object.values(upgradeOwned).some((c) => c > 0),
  );
  const hasShownComboRef = useRef(false);
  const prevComboRef = useRef(comboCount);
  const hasShownSynergyRef = useRef(false);
  const prevPrestigeCountRef = useRef(Object.keys(prestigeUpgrades).length);
  const hasShownPrestigeMaxRef = useRef(false);
  const prevChallengeRef = useRef(activeChallengeId);

  // Idle rotation timer — restarts when stage, mood, or species changes
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        setCurrentLine(getRandomIdleLine(currentSpecies, evolutionStage, mood));
        scheduleNext();
      }, getRandomDelay());
    };

    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, [currentSpecies, evolutionStage, mood]);

  // First evolution trigger
  useEffect(() => {
    if (evolutionStage > prevStageRef.current && !hasSeenFirstEvolution) {
      const dialogue = getDialogue(currentSpecies, evolutionStage);
      setCurrentLine(dialogue.triggers.firstEvolution);
      useGameStore.getState().markFirstEvolutionSeen();
    }
    prevStageRef.current = evolutionStage;
  }, [currentSpecies, evolutionStage, hasSeenFirstEvolution]);

  // First upgrade trigger
  useEffect(() => {
    const hasUpgrades = Object.values(upgradeOwned).some((c) => c > 0);
    if (hasUpgrades && !prevHasUpgradesRef.current && !hasSeenFirstUpgrade) {
      const dialogue = getDialogue(currentSpecies, evolutionStage);
      setCurrentLine(dialogue.triggers.firstUpgrade);
      useGameStore.getState().markFirstUpgradeSeen();
    }
    prevHasUpgradesRef.current = hasUpgrades;
  }, [currentSpecies, upgradeOwned, hasSeenFirstUpgrade, evolutionStage]);

  // Phase 8/9: Combo achieved trigger — fires once per session when first reaching threshold
  useEffect(() => {
    if (
      !hasShownComboRef.current &&
      comboCount >= COMBO_THRESHOLD &&
      prevComboRef.current < COMBO_THRESHOLD
    ) {
      setCurrentLine(getRandomPhase89Line("comboAchieved"));
      hasShownComboRef.current = true;
    }
    prevComboRef.current = comboCount;
  }, [comboCount]);

  // Phase 8/9: Synergy activated trigger — fires once per session on first active synergy
  useEffect(() => {
    if (!hasShownSynergyRef.current) {
      const activeSynergies = getActiveSynergies(upgradeOwned);
      if (activeSynergies.length > 0) {
        setCurrentLine(getRandomPhase89Line("synergyActivated"));
        hasShownSynergyRef.current = true;
      }
    }
  }, [upgradeOwned]);

  // Phase 8/9: Prestige shop first purchase trigger
  useEffect(() => {
    const count = Object.keys(prestigeUpgrades).length;
    if (count === 1 && prevPrestigeCountRef.current === 0) {
      setCurrentLine(getRandomPhase89Line("prestigeShopFirstPurchase"));
    }
    prevPrestigeCountRef.current = count;
  }, [prestigeUpgrades]);

  // Phase 8/9: Prestige shop maxed trigger — fires once when all upgrades reach max level
  useEffect(() => {
    if (!hasShownPrestigeMaxRef.current) {
      const allMaxed = PRESTIGE_UPGRADES.every(
        (u) => (prestigeUpgrades[u.id] ?? 0) >= u.maxLevel,
      );
      if (allMaxed && Object.keys(prestigeUpgrades).length > 0) {
        setCurrentLine(getRandomPhase89Line("prestigeShopMaxed"));
        hasShownPrestigeMaxRef.current = true;
      }
    }
  }, [prestigeUpgrades]);

  // Phase 8/9: Challenge run started trigger
  useEffect(() => {
    if (activeChallengeId !== null && prevChallengeRef.current === null) {
      setCurrentLine(getRandomPhase89Line("challengeStart"));
    }
    prevChallengeRef.current = activeChallengeId;
  }, [activeChallengeId]);

  // Data Burst: collect / expired dialogue triggers (fired via window events)
  useEffect(() => {
    const handleCollect = () => {
      setCurrentLine(getRandomPhase89Line("dataBurstCollect"));
    };
    const handleExpired = () => {
      setCurrentLine(getRandomPhase89Line("dataBurstExpired"));
    };
    window.addEventListener("dataBurstCollect", handleCollect);
    window.addEventListener("dataBurstExpired", handleExpired);
    return () => {
      window.removeEventListener("dataBurstCollect", handleCollect);
      window.removeEventListener("dataBurstExpired", handleExpired);
    };
  }, []);

  return currentLine;
}
