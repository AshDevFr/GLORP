import { useEffect, useRef, useState } from "react";
import { DIALOGUE } from "../data/dialogue";
import { useGameStore } from "../store";

function getRandomIdleLine(stage: number): string {
  const dialogue = DIALOGUE[stage] ?? DIALOGUE[0];
  const lines = dialogue.idle;
  return lines[Math.floor(Math.random() * lines.length)];
}

function getRandomDelay(): number {
  return (10 + (Math.random() * 4 - 2)) * 1000;
}

export function useDialogue(): string {
  const evolutionStage = useGameStore((s) => s.evolutionStage);
  const upgradeOwned = useGameStore((s) => s.upgradeOwned);
  const hasSeenFirstEvolution = useGameStore((s) => s.hasSeenFirstEvolution);
  const hasSeenFirstUpgrade = useGameStore((s) => s.hasSeenFirstUpgrade);

  const [currentLine, setCurrentLine] = useState(() =>
    getRandomIdleLine(evolutionStage),
  );

  const prevStageRef = useRef(evolutionStage);
  const prevHasUpgradesRef = useRef(
    Object.values(upgradeOwned).some((c) => c > 0),
  );

  // Idle rotation timer — restarts when stage changes
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        setCurrentLine(getRandomIdleLine(evolutionStage));
        scheduleNext();
      }, getRandomDelay());
    };

    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, [evolutionStage]);

  // First evolution trigger
  useEffect(() => {
    if (evolutionStage > prevStageRef.current && !hasSeenFirstEvolution) {
      const dialogue = DIALOGUE[evolutionStage] ?? DIALOGUE[0];
      setCurrentLine(dialogue.triggers.firstEvolution);
      useGameStore.getState().markFirstEvolutionSeen();
    }
    prevStageRef.current = evolutionStage;
  }, [evolutionStage, hasSeenFirstEvolution]);

  // First upgrade trigger
  useEffect(() => {
    const hasUpgrades = Object.values(upgradeOwned).some((c) => c > 0);
    if (hasUpgrades && !prevHasUpgradesRef.current && !hasSeenFirstUpgrade) {
      const dialogue = DIALOGUE[evolutionStage] ?? DIALOGUE[0];
      setCurrentLine(dialogue.triggers.firstUpgrade);
      useGameStore.getState().markFirstUpgradeSeen();
    }
    prevHasUpgradesRef.current = hasUpgrades;
  }, [upgradeOwned, hasSeenFirstUpgrade, evolutionStage]);

  return currentLine;
}
