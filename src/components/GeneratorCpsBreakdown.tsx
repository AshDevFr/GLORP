import { Badge, Group, Stack, Text } from "@mantine/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UPGRADES } from "../data/upgrades";
import { computeAllGeneratorsCps } from "../engine/upgradeEngine";
import { useGameStore } from "../store";
import { formatNumber } from "../utils/formatNumber";

/** Number of 1-second buckets for the rolling click average. */
const CLICK_BUFFER_SIZE = 10;

/**
 * Hook that tracks a rolling 10-second average of TD earned from clicks.
 * Uses a circular buffer of 1-second buckets updated via Zustand subscription.
 */
function useRollingClickAverage(): number {
  const bucketsRef = useRef<number[]>(new Array(CLICK_BUFFER_SIZE).fill(0));
  const currentIndexRef = useRef(0);
  const lastTickRef = useRef(Math.floor(Date.now() / 1000));
  const [average, setAverage] = useState(0);

  const advanceBuckets = useCallback(() => {
    const now = Math.floor(Date.now() / 1000);
    const elapsed = now - lastTickRef.current;
    if (elapsed > 0) {
      const steps = Math.min(elapsed, CLICK_BUFFER_SIZE);
      for (let i = 0; i < steps; i++) {
        currentIndexRef.current =
          (currentIndexRef.current + 1) % CLICK_BUFFER_SIZE;
        bucketsRef.current[currentIndexRef.current] = 0;
      }
      lastTickRef.current = now;
    }
  }, []);

  // Subscribe to totalClicks changes to detect click events
  useEffect(() => {
    let prevClicks = useGameStore.getState().totalClicks;
    let prevTd = useGameStore.getState().trainingData;

    const unsub = useGameStore.subscribe((state) => {
      const newClicks = state.totalClicks;
      if (newClicks > prevClicks) {
        advanceBuckets();
        // Estimate TD earned from this click as the delta in trainingData
        const tdDelta = state.trainingData.sub(prevTd).toNumber();
        // Only count positive deltas that coincide with click increments
        if (tdDelta > 0) {
          bucketsRef.current[currentIndexRef.current] += tdDelta;
        }
      }
      prevClicks = newClicks;
      prevTd = state.trainingData;
    });

    return unsub;
  }, [advanceBuckets]);

  // Recalculate average every second
  useEffect(() => {
    const interval = setInterval(() => {
      advanceBuckets();
      const sum = bucketsRef.current.reduce((a, b) => a + b, 0);
      setAverage(sum / CLICK_BUFFER_SIZE);
    }, 1000);
    return () => clearInterval(interval);
  }, [advanceBuckets]);

  return average;
}

/**
 * Renders a compact per-generator CPS breakdown table.
 * Only generators with at least 1 owned unit are shown.
 * Values update reactively whenever upgradeOwned changes.
 */
export function GeneratorCpsBreakdown() {
  const upgradeOwned = useGameStore((s) => s.upgradeOwned);

  const rows = useMemo(
    () => computeAllGeneratorsCps(UPGRADES, upgradeOwned),
    [upgradeOwned],
  );

  const activeRows = rows.filter((r) => r.owned > 0);

  const grandTotalCps = useMemo(
    () => activeRows.reduce((sum, r) => sum + r.totalCps, 0),
    [activeRows],
  );

  const clickAverage = useRollingClickAverage();

  if (activeRows.length === 0) {
    return (
      <Text size="xs" c="dimmed" ff="monospace" ta="center" py="xs">
        No generators owned yet.
      </Text>
    );
  }

  return (
    <Stack gap={3}>
      {/* Column headers */}
      <Group
        justify="space-between"
        wrap="nowrap"
        gap="xs"
        pb={2}
        style={{ borderBottom: "1px solid var(--mantine-color-dark-4)" }}
      >
        <Text size="xs" c="dimmed" ff="monospace" fw={700} style={{ flex: 1 }}>
          Generator
        </Text>
        <Text
          size="xs"
          c="dimmed"
          ff="monospace"
          fw={700}
          style={{ flexShrink: 0, minWidth: 70, textAlign: "right" }}
        >
          CPS
        </Text>
        <Text
          size="xs"
          c="dimmed"
          ff="monospace"
          fw={700}
          style={{ flexShrink: 0, minWidth: 42, textAlign: "right" }}
        >
          Share
        </Text>
      </Group>

      {activeRows.map((row) => (
        <Stack key={row.id} gap={0}>
          <Group justify="space-between" wrap="nowrap" gap="xs" align="center">
            {/* Icon + name + owned badge */}
            <Group gap={4} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
              <Text
                size="xs"
                ff="monospace"
                style={{ flexShrink: 0, lineHeight: 1 }}
                aria-hidden="true"
              >
                {row.icon}
              </Text>
              <Text
                size="xs"
                ff="monospace"
                truncate
                title={row.name}
                style={{ flex: 1, minWidth: 0 }}
              >
                {row.name}
              </Text>
              <Badge
                size="xs"
                variant="light"
                color="gray"
                style={{ flexShrink: 0 }}
                title={`${row.owned} owned`}
              >
                ×{row.owned}
              </Badge>
            </Group>

            {/* Total CPS */}
            <Text
              size="xs"
              ff="monospace"
              c="green"
              style={{ flexShrink: 0, minWidth: 70, textAlign: "right" }}
              title={`${row.totalCps} TD/s`}
            >
              {formatNumber(row.totalCps)}/s
            </Text>

            {/* Percentage share */}
            <Badge
              size="xs"
              variant="light"
              color="cyan"
              style={{ flexShrink: 0, minWidth: 42, textAlign: "center" }}
              title={`${row.percentOfTotal.toFixed(2)}% of total CPS`}
            >
              {row.percentOfTotal.toFixed(1)}%
            </Badge>
          </Group>

          {/* Next milestone hint */}
          {row.nextMilestone && (
            <Text
              size="xs"
              ff="monospace"
              c="dimmed"
              pl={20}
              style={{ lineHeight: 1.3 }}
              title={`${row.nextMilestone.label} bonus at ${row.nextMilestone.threshold} owned`}
            >
              Next ×{row.nextMilestone.multiplier} at{" "}
              {row.nextMilestone.threshold} owned
            </Text>
          )}
        </Stack>
      ))}

      {/* Summary footer */}
      <Group
        justify="space-between"
        wrap="nowrap"
        gap="xs"
        pt={4}
        style={{ borderTop: "1px solid var(--mantine-color-dark-4)" }}
      >
        <Text size="xs" ff="monospace" fw={700} c="teal" style={{ flex: 1 }}>
          Total
        </Text>
        <Text
          size="xs"
          ff="monospace"
          fw={700}
          c="green"
          style={{ flexShrink: 0, minWidth: 70, textAlign: "right" }}
          title={`${grandTotalCps} TD/s from generators`}
        >
          {formatNumber(grandTotalCps)}/s
        </Text>
        <Badge
          size="xs"
          variant="light"
          color="cyan"
          style={{ flexShrink: 0, minWidth: 42, textAlign: "center" }}
        >
          100%
        </Badge>
      </Group>

      {/* Rolling click average */}
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Text size="xs" ff="monospace" c="dimmed" style={{ flex: 1 }}>
          Click avg (10s)
        </Text>
        <Text
          size="xs"
          ff="monospace"
          c="yellow"
          style={{ flexShrink: 0, minWidth: 70, textAlign: "right" }}
          title="Rolling 10-second average TD earned from clicks"
        >
          {formatNumber(clickAverage)}/s
        </Text>
        <div style={{ flexShrink: 0, minWidth: 42 }} />
      </Group>
    </Stack>
  );
}
