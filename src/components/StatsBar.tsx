import { Group, Text } from "@mantine/core";
import { useGameStore } from "../store";
import { formatNumber } from "../utils/formatNumber";

export function StatsBar() {
  const trainingData = useGameStore((s) => s.trainingData);

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
        <Text span fw={700} c="dimmed">
          0.0
        </Text>
      </Text>
    </Group>
  );
}
