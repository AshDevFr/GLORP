import { Button, Stack } from "@mantine/core";
import { ASCII_ART } from "../data/asciiArt";
import { useGameStore } from "../store";

export function PetDisplay() {
  const evolutionStage = useGameStore((s) => s.evolutionStage);
  const clickFeed = useGameStore((s) => s.clickFeed);
  const art = ASCII_ART[evolutionStage] ?? ASCII_ART[0];

  return (
    <Stack align="center" justify="center" gap="lg" h="100%">
      <div
        role="img"
        aria-label={`GLORP pet stage ${evolutionStage}`}
        style={{
          fontFamily: "monospace",
          whiteSpace: "pre",
          fontSize: "1.5rem",
          lineHeight: 1.4,
          color: "var(--mantine-color-green-4)",
          textAlign: "center",
          userSelect: "none",
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
