import { Button, Stack, Text } from "@mantine/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { ASCII_ART } from "../data/asciiArt";
import { STAGES } from "../data/stages";
import { getClickMood } from "../engine/moodEngine";
import { useClickParticles } from "../hooks/useClickParticles";
import { useDialogue } from "../hooks/useDialogue";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useGameStore } from "../store";
import { FloatingParticles } from "./FloatingParticles";
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
  const art = ASCII_ART[evolutionStage] ?? ASCII_ART[0];
  const stageMeta = STAGES[evolutionStage] ?? STAGES[0];

  const dialogueLine = useDialogue();
  const [isFlashing, setIsFlashing] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const prevStageRef = useRef(evolutionStage);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const { particles, spawn } = useClickParticles();

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
      <FloatingParticles particles={particles} />
      <Stack align="center" justify="center" gap="lg" h="100%">
        <SpeechBubble text={dialogueLine} />
        <Text size="xs" ff="monospace" c="dimmed">
          Stage {evolutionStage}: {stageMeta.name} [{MOOD_LABELS[mood] ?? mood}]
        </Text>
        <div
          role="img"
          aria-label={`GLORP pet stage ${evolutionStage}: ${stageMeta.name}`}
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
        <Button
          size="lg"
          variant="outline"
          color="green"
          onClick={handleFeed}
          style={{ fontFamily: "monospace" }}
        >
          [ FEED GLORP ]
        </Button>
      </Stack>
    </div>
  );
}
