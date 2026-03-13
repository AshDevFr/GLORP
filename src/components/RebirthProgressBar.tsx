import { Badge, Progress, Stack, Text } from "@mantine/core";
import { getEvolutionThresholdMultiplier } from "../data/prestigeShop";
import {
  getRebirthProgress,
  getRebirthThresholdTd,
  REBIRTH_MIN_STAGE,
} from "../engine/rebirthEngine";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useGameStore } from "../store";
import { formatNumber } from "../utils/formatNumber";

/**
 * Prestige progress indicator shown in the main game panel.
 *
 * - Before Stage 4: compact progress bar (TD earned / 10 M threshold).
 * - Once Stage 4 is reached: persistent, non-intrusive "Rebirth Available" banner.
 *
 * The banner pulses with a yellow glow to catch the player's attention without
 * blocking gameplay. Animation is suppressed when prefers-reduced-motion is set.
 */
export function RebirthProgressBar() {
  const totalTdEarned = useGameStore((s) => s.totalTdEarned);
  const evolutionStage = useGameStore((s) => s.evolutionStage);
  const prestigeUpgrades = useGameStore((s) => s.prestigeUpgrades);
  const activeChallengeId = useGameStore((s) => s.activeChallengeId);
  const prefersReduced = useReducedMotion();

  const ep = activeChallengeId === "no-prestige" ? {} : prestigeUpgrades;
  const thresholdMultiplier = getEvolutionThresholdMultiplier(
    ep["evolution-accelerator"] ?? 0,
  );

  const eligible = evolutionStage >= REBIRTH_MIN_STAGE;
  const progress = getRebirthProgress(totalTdEarned, thresholdMultiplier);
  const threshold = getRebirthThresholdTd(thresholdMultiplier);
  const pct = Math.round(progress * 100);

  if (eligible) {
    return (
      <Badge
        size="lg"
        variant="filled"
        color="yellow"
        style={{
          fontFamily: "monospace",
          animation: prefersReduced
            ? undefined
            : "rebirth-pulse 2s ease-in-out infinite",
        }}
        aria-label="Rebirth is now available"
      >
        {"\u26a1"} REBIRTH AVAILABLE {"\u2014"} Oracle consciousness achieved
      </Badge>
    );
  }

  return (
    <Stack gap={4} w="100%" maw={320} align="center">
      <Text size="xs" c="dimmed" ff="monospace">
        Rebirth progress: {pct}%
      </Text>
      <Progress
        value={pct}
        color="yellow"
        size="sm"
        w="100%"
        aria-label={`Rebirth progress: ${pct}%`}
      />
      <Text size="xs" c="dimmed" ff="monospace">
        {formatNumber(totalTdEarned)} / {formatNumber(threshold)} TD earned
      </Text>
    </Stack>
  );
}
