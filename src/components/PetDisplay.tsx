import { Badge, Button, Group, Stack, Text } from "@mantine/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { getAsciiFrames } from "../data/asciiArt";
import { BOOSTERS } from "../data/boosters";
import { CHALLENGES } from "../data/challenges";
import { CLICK_UPGRADES } from "../data/clickUpgrades";
import {
  getClickMasteryBonus,
  getIdleBoostMultiplier,
} from "../data/prestigeShop";
import { getSpeciesBonus } from "../data/species";
import { STAGES } from "../data/stages";
import { UPGRADES } from "../data/upgrades";
import {
  COMBO_DECAY_MS,
  COMBO_THRESHOLD,
  computeClickPower,
  computeComboMultiplier,
} from "../engine/clickEngine";
import { getClickMood } from "../engine/moodEngine";
import { canRebirth, getNextSpecies } from "../engine/rebirthEngine";
import {
  computeBoosterMultiplier,
  getTotalTdPerSecond,
} from "../engine/upgradeEngine";
import { useAsciiAnimation } from "../hooks/useAsciiAnimation";
import { useClickParticles } from "../hooks/useClickParticles";
import { useDialogue } from "../hooks/useDialogue";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useSound } from "../hooks/useSound";
import { useGameStore } from "../store";
import { useUIStore } from "../store/uiStore";
import { formatNumber } from "../utils/formatNumber";
import { FloatingParticles } from "./FloatingParticles";
import { PrestigeShop } from "./PrestigeShop";
import { RebirthModal } from "./RebirthModal";
import { RebirthProgressBar } from "./RebirthProgressBar";
import { SpeechBubble } from "./SpeechBubble";

const MOOD_LABELS: Record<string, string> = {
  Happy: ":)",
  Neutral: ":|",
  Hungry: ":(",
  Sad: ":'(",
  Excited: ":D",
  Philosophical: "...",
};

export function PetDisplay() {
  const evolutionStage = useGameStore((s) => s.evolutionStage);
  const clickFeed = useGameStore((s) => s.clickFeed);
  const mood = useGameStore((s) => s.mood);
  const setMood = useGameStore((s) => s.setMood);
  const currentSpecies = useGameStore((s) => s.currentSpecies);
  const totalTdEarned = useGameStore((s) => s.totalTdEarned);
  const performRebirth = useGameStore((s) => s.performRebirth);
  const clickUpgradesPurchased = useGameStore((s) => s.clickUpgradesPurchased);
  const comboCount = useGameStore((s) => s.comboCount);
  const prestigeUpgrades = useGameStore((s) => s.prestigeUpgrades);
  const prestigeTokenBalance = useGameStore((s) => s.prestigeTokenBalance);
  const rebirthCount = useGameStore((s) => s.rebirthCount);
  const unlockedSpecies = useGameStore((s) => s.unlockedSpecies);
  const totalClicks = useGameStore((s) => s.totalClicks);
  const peakTdPerSecond = useGameStore((s) => s.peakTdPerSecond);
  const runStart = useGameStore((s) => s.runStart);
  const activeChallengeId = useGameStore((s) => s.activeChallengeId);
  const upgradeOwned = useGameStore((s) => s.upgradeOwned);
  const boostersPurchased = useGameStore((s) => s.boostersPurchased);

  const artFrames = getAsciiFrames(currentSpecies, evolutionStage);
  const stageMeta = STAGES[evolutionStage] ?? STAGES[0];
  const rebirthAvailable = canRebirth(evolutionStage);
  const nextSpecies = getNextSpecies(currentSpecies);

  const [rebirthModalOpen, setRebirthModalOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [displayCombo, setDisplayCombo] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);

  const dialogueLine = useDialogue();
  const [isFlashing, setIsFlashing] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const prevStageRef = useRef(evolutionStage);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const { playClick, playEvolution } = useSound();

  const currentFrame = useAsciiAnimation(artFrames, 2000, isGlitching);

  const { particles, spawn, spawnBurst } = useClickParticles();

  // -- Milestone celebration --
  const milestoneEvent = useUIStore((s) => s.milestoneEvent);
  const clearMilestoneEvent = useUIStore((s) => s.clearMilestoneEvent);
  const prevMilestoneIdRef = useRef<number>(-1);

  useEffect(() => {
    if (!milestoneEvent || milestoneEvent.id === prevMilestoneIdRef.current)
      return;
    prevMilestoneIdRef.current = milestoneEvent.id;

    if (!prefersReduced) {
      setIsFlashing(true);
      setIsShaking(true);
      const flashTimer = setTimeout(() => setIsFlashing(false), 800);
      const shakeTimer = setTimeout(() => setIsShaking(false), 500);
      if (containerRef.current) {
        spawnBurst(containerRef.current.getBoundingClientRect());
      }
      clearMilestoneEvent();
      return () => {
        clearTimeout(flashTimer);
        clearTimeout(shakeTimer);
      };
    }

    clearMilestoneEvent();
  }, [milestoneEvent, clearMilestoneEvent, prefersReduced, spawnBurst]);

  // Compute current click power for display (without combo since it fluctuates)
  const ep = activeChallengeId === "no-prestige" ? {} : prestigeUpgrades;
  const clickMastery = getClickMasteryBonus(ep["click-mastery"] ?? 0);
  const speciesBonus = getSpeciesBonus(currentSpecies);
  const idleBoost = getIdleBoostMultiplier(ep["idle-boost"] ?? 0);
  const boosterMult = computeBoosterMultiplier(BOOSTERS, boostersPurchased);
  const currentTdPerSecond = getTotalTdPerSecond(
    UPGRADES,
    upgradeOwned,
    idleBoost * speciesBonus.autoGen,
    boosterMult,
  );
  const baseClickPower = computeClickPower(
    {
      clickUpgradesPurchased,
      comboCount: 0,
      lastClickTime: 0,
    },
    CLICK_UPGRADES,
    currentTdPerSecond,
    undefined,
    clickMastery,
    speciesBonus.clickPower,
  );

  // Decay combo display when not clicking
  useEffect(() => {
    if (comboCount < COMBO_THRESHOLD) {
      setDisplayCombo(0);
      return;
    }
    setDisplayCombo(comboCount);
    const timer = setTimeout(() => {
      setDisplayCombo(0);
    }, COMBO_DECAY_MS);
    return () => clearTimeout(timer);
  }, [comboCount]);

  useEffect(() => {
    if (evolutionStage !== prevStageRef.current) {
      prevStageRef.current = evolutionStage;
      playEvolution();
      setIsFlashing(true);
      const flashTimer = setTimeout(() => setIsFlashing(false), 600);

      if (!prefersReduced) {
        setIsShaking(true);
        setIsGlitching(true);
        const shakeTimer = setTimeout(() => setIsShaking(false), 500);
        const glitchTimer = setTimeout(() => setIsGlitching(false), 600);
        return () => {
          clearTimeout(flashTimer);
          clearTimeout(shakeTimer);
          clearTimeout(glitchTimer);
        };
      }

      return () => clearTimeout(flashTimer);
    }
  }, [evolutionStage, prefersReduced, playEvolution]);

  const handlePetClick = () => {
    setMood(getClickMood());
  };

  const handleFeed = useCallback(() => {
    playClick();
    clickFeed();
    if (containerRef.current) {
      spawn(containerRef.current.getBoundingClientRect());
    }
  }, [clickFeed, playClick, spawn]);

  return (
    <div
      ref={containerRef}
      className={isShaking ? "screen-shake" : undefined}
      style={{
        position: "relative",
        height: "100%",
        animation: isShaking ? "screen-shake 0.5s ease-in-out" : undefined,
      }}
    >
      {isFlashing && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(57, 255, 20, 0.25)",
            pointerEvents: "none",
            animation: "milestone-flash 0.8s ease-out forwards",
            zIndex: 999,
          }}
        />
      )}
      <FloatingParticles particles={particles} clickPower={baseClickPower} />
      <Stack align="center" justify="center" gap="lg" h="100%">
        <SpeechBubble text={dialogueLine} />
        <Text size="xs" ff="monospace" c="dimmed">
          Stage {evolutionStage}: {stageMeta.name} [{MOOD_LABELS[mood] ?? mood}]
        </Text>
        <div
          role="img"
          aria-label={`${currentSpecies} pet stage ${evolutionStage}: ${stageMeta.name}`}
          className={`ascii-art-container${isGlitching ? " ascii-glitch" : ""}`}
          onClick={handlePetClick}
          onKeyDown={(ev) => {
            if (ev.key === "Enter" || ev.key === " ") handlePetClick();
          }}
          style={{
            fontFamily: "monospace",
            whiteSpace: "pre",
            lineHeight: 1.4,
            color: isFlashing ? "#fff" : "var(--mantine-color-green-4)",
            textAlign: "center",
            userSelect: "none",
            cursor: "pointer",
            textShadow: isFlashing
              ? "0 0 20px #39ff14, 0 0 40px #39ff14"
              : "none",
            transition: "color 0.3s, text-shadow 0.3s",
            animation: isGlitching
              ? "ascii-glitch 0.6s ease-in-out"
              : undefined,
          }}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: art is static data, not user input
          dangerouslySetInnerHTML={{ __html: currentFrame }}
        />
        <Group gap="sm">
          <Button
            size="lg"
            variant="outline"
            color="green"
            onClick={handleFeed}
            style={{ fontFamily: "monospace" }}
          >
            [ FEED {currentSpecies} +{formatNumber(baseClickPower)} TD ]
          </Button>
          {rebirthAvailable && (
            <Button
              size="lg"
              variant="outline"
              color="yellow"
              onClick={() => setRebirthModalOpen(true)}
              style={{ fontFamily: "monospace" }}
            >
              [ REBIRTH ]
            </Button>
          )}
          {rebirthCount > 0 && (
            <Button
              size="lg"
              variant="outline"
              color="yellow"
              onClick={() => setShopOpen(true)}
              style={{ fontFamily: "monospace" }}
            >
              [ PRESTIGE SHOP ]
            </Button>
          )}
        </Group>
        <RebirthProgressBar />
        {activeChallengeId && (
          <Badge
            size="lg"
            variant="light"
            color="orange"
            style={{ fontFamily: "monospace" }}
          >
            CHALLENGE:{" "}
            {CHALLENGES.find((c) => c.id === activeChallengeId)?.name ??
              activeChallengeId}
          </Badge>
        )}
        <Badge
          size="lg"
          variant="light"
          color="yellow"
          style={{
            fontFamily: "monospace",
            visibility: displayCombo >= COMBO_THRESHOLD ? "visible" : "hidden",
          }}
          aria-hidden={displayCombo < COMBO_THRESHOLD}
        >
          COMBO x{displayCombo} (
          {computeComboMultiplier(displayCombo, Date.now(), Date.now()).toFixed(
            2,
          )}
          x)
        </Badge>
      </Stack>
      <RebirthModal
        opened={rebirthModalOpen}
        onClose={() => setRebirthModalOpen(false)}
        onConfirm={(selectedSpecies, challengeId) => {
          performRebirth(selectedSpecies, challengeId);
          setRebirthModalOpen(false);
        }}
        totalTdEarned={totalTdEarned}
        currentBalance={prestigeTokenBalance}
        nextSpecies={nextSpecies}
        currentSpecies={currentSpecies}
        unlockedSpecies={unlockedSpecies}
        hasUnlockAll={(prestigeUpgrades["unlock-all-species"] ?? 0) >= 1}
        tokenMagnetLevel={prestigeUpgrades["token-magnet"] ?? 0}
        activeChallengeId={activeChallengeId}
        totalClicks={totalClicks}
        evolutionStage={evolutionStage}
        peakTdPerSecond={peakTdPerSecond}
        runStart={runStart}
      />
      <PrestigeShop opened={shopOpen} onClose={() => setShopOpen(false)} />
    </div>
  );
}
