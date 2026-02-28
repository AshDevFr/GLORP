import { Button, Stack, Text } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { ASCII_ART } from "../data/asciiArt";
import { STAGES } from "../data/stages";
import { getClickMood } from "../engine/moodEngine";
import { useDialogue } from "../hooks/useDialogue";
import { useGameStore } from "../store";
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
  const prevStageRef = useRef(evolutionStage);

  useEffect(() => {
    if (evolutionStage !== prevStageRef.current) {
      prevStageRef.current = evolutionStage;
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 600);
      return () => clearTimeout(timer);
    }
  }, [evolutionStage]);

  const handlePetClick = () => {
    setMood(getClickMood());
  };

  return (
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
        onClick={clickFeed}
        style={{ fontFamily: "monospace" }}
      >
        [ FEED GLORP ]
      </Button>
    </Stack>
  );
}
