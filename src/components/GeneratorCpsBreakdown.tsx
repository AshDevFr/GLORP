import { Badge, Group, Stack, Text } from "@mantine/core";
import { useMemo } from "react";
import { UPGRADES } from "../data/upgrades";
import { computeAllGeneratorsCps } from "../engine/upgradeEngine";
import { useGameStore } from "../store";
import { formatNumber } from "../utils/formatNumber";

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
      <Group justify="space-between" wrap="nowrap" gap="xs" pb={2}
        style={{ borderBottom: "1px solid var(--mantine-color-dark-4)" }}
      >
        <Text size="xs" c="dimmed" ff="monospace" fw={700} style={{ flex: 1 }}>
          Generator
        </Text>
        <Text size="xs" c="dimmed" ff="monospace" fw={700} style={{ flexShrink: 0, minWidth: 70, textAlign: "right" }}>
          CPS
        </Text>
        <Text size="xs" c="dimmed" ff="monospace" fw={700} style={{ flexShrink: 0, minWidth: 42, textAlign: "right" }}>
          Share
        </Text>
      </Group>

      {activeRows.map((row) => (
        <Group
          key={row.id}
          justify="space-between"
          wrap="nowrap"
          gap="xs"
          align="center"
        >
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
      ))}
    </Stack>
  );
}
