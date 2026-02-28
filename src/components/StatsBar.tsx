import { Group, Text } from "@mantine/core";
import { UPGRADES } from "../data/upgrades";
import { getTotalTdPerSecond } from "../engine/upgradeEngine";
import { useGameStore } from "../store";
import { formatNumber } from "../utils/formatNumber";

export function StatsBar() {
  const trainingData = useGameStore((s) => s.trainingData);
  const upgradeOwned = useGameStore((s) => s.upgradeOwned);
  const tdPerSecond = getTotalTdPerSecond(UPGRADES, upgradeOwned);

  return (
    <Group
      justify="space-between"
      px="md"
      py="xs"
      style={{
        borderBottom: "1px solid var(--mantine-color-dark-4)",
      }}
    >
      <Text size="sm" ff="monospace">
        Training Data:{" "}
        <Text span fw={700} c="green">
          {formatNumber(trainingData)}
        </Text>
      </Text>
      <Text size="sm" ff="monospace">
        TD/s:{" "}
        <Text span fw={700} c={tdPerSecond > 0 ? "green" : "dimmed"}>
          {tdPerSecond > 0 ? formatNumber(tdPerSecond) : "0.0"}
        </Text>
      </Text>
    </Group>
  );
}
