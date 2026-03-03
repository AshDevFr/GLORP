import { Badge, Button, Group, Stack, Text } from "@mantine/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { getAsciiArt } from "../data/asciiArt";
import { CLICK_UPGRADES } from "../data/clickUpgrades";
import { STAGES } from "../data/stages";
import {
  COMBO_DECAY_MS,
  COMBO_THRESHOLD,
  computeClickPower,
} from "../engine/clickEngine";
import { getClickMood } from "../engine/moodEngine";
import { canRebirth, getNextSpecies } from "../engine/rebirthEngine";
import { useClickParticles } from "../hooks/useClickParticles";
import { useDialogue } from "../hooks/useDialogue";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useGameStore } from "../store";
import { useUIStore } from "../store/uiStore";
import { formatNumber } from "../utils/formatNumber";
import { FloatingParticles } from "./FloatingParticles";
import { RebirthModal } from "./RebirthModal";
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
  const wisdomTokens = useGameStore((s) => s.wisdomTokens);
  const totalTdEarned = useGameStore((s) => s.totalTdEarned);
  const performRebirth = useGameStore((s) => s.performRebirth);
  const clickUpgradesPurchased = useGameStore((s) => s.clickUpgradesPurchased);
  const comboCount = useGameStore((s) => s.comboCount);

  const art = getAsciiArt(currentSpecies, evolutionStage);
  const stageMeta = STAGES[evolutionStage] ?? STAGES[0];
  const rebirthAvailable = canRebirth(evolutionStage);
  const nextSpecies = getNextSpecies(currentSpecies);

  const [rebirthModalOpen, setRebirthModalOpen] = useState(false);
  const [displayCombo, setDisplayCombo] = useState(0);

  const dialogueLine = useDialogue();
  const [isFlashing, setIsFlashing] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const prevStageRef = useRef(evolutionStage);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const { particles, spawn, spawnBurst } = useClickParticles();

  // ── Milestone celebration ────────────────────────────────────────────────
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
  // ────────────────────────────────────────────────────────────────────────

  // Compute current click power for display (without combo since it fluctuates)
  const baseClickPower = computeClickPower(
    {
      evolutionStage,
      clickUpgradesPurchased,
      comboCount: 0,
      lastClickTime: 0,
    },
    CLICK_UPGRADES,
    Date.now(),
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
      setIsFlashing(true);
      const flashTimer = setTimeout(() => setIsFlashing(false), 600);

      if (!prefersReduced) {
        setIsShaking(true);
        const shakeTimer = setTimeout(() => setIsShaking(false), 500);
        return () => {
          clearTimeout(flashTimer);
          clearTimeout(shakeTimer);
        };
      }

      return () => clearTimeout(flashTimer);
    }
  }, [evolutionStage, prefersReduced]);

  const handlePetClick = () => {
    setMood(getClickMood());
  };

  const handleFeed = useCallback(() => {
    clickFeed();
    if (containerRef.current) {
      spawn(containerRef.current.getBoundingClientRect());
    }
  }, [clickFeed, spawn]);

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
          onClick={handlePetClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handlePetClick();
          }}
          style={{
            fontFamily: "monospace",
            whiteSpace: "pre",
            fontSize: "1.5rem",
            lineHeight: 1.4,
            color: isFlashing ? "#fff" : "var(--mantine-color-green-4)",
            textAlign: "center",
            userSelect: "none",
            cursor: "pointer",
            textShadow: isFlashing
              ? "0 0 20px #39ff14, 0 0 40px #39ff14"
              : "none",
            transition: "color 0.3s, text-shadow 0.3s",
          }}
        >
          {art}
        </div>
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
        </Group>
        {displayCombo >= COMBO_THRESHOLD && (
          <Badge
            size="lg"
            variant="light"
            color="yellow"
            style={{ fontFamily: "monospace" }}
          >
            COMBO x{displayCombo} (1.5x)
          </Badge>
        )}
      </Stack>
      <RebirthModal
        opened={rebirthModalOpen}
        onClose={() => setRebirthModalOpen(false)}
        onConfirm={() => {
          performRebirth();
          setRebirthModalOpen(false);
        }}
        totalTdEarned={totalTdEarned}
        currentWisdomTokens={wisdomTokens}
        nextSpecies={nextSpecies}
      />
    </div>
  );
}
