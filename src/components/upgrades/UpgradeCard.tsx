import { Badge, Button, Card, Group, Text } from "@mantine/core";
import type { Upgrade } from "../../data/upgrades";
import { getUpgradeCost } from "../../engine/upgradeEngine";
import { formatNumber } from "../../utils/formatNumber";

interface UpgradeCardProps {
  upgrade: Upgrade;
  owned: number;
  trainingData: number;
  onPurchase: (id: string) => void;
}

export function UpgradeCard({
  upgrade,
  owned,
  trainingData,
  onPurchase,
}: UpgradeCardProps) {
  const cost = getUpgradeCost(upgrade, owned);
  const canAfford = trainingData >= cost;

  return (
    <Card
      padding="sm"
      radius="sm"
      withBorder
      style={{
        borderColor: canAfford
          ? "var(--mantine-color-green-8)"
          : "var(--mantine-color-dark-4)",
        opacity: canAfford ? 1 : 0.5,
      }}
    >
      <Group justify="space-between" mb={4}>
        <Text size="sm" fw={700} ff="monospace">
          {upgrade.icon} {upgrade.name}
        </Text>
        <Badge size="sm" variant="light" color="green">
          x{owned}
        </Badge>
      </Group>

      <Text size="xs" c="dimmed" ff="monospace" mb="xs">
        {upgrade.description}
      </Text>

      <Group justify="space-between" align="center">
        <Text size="xs" ff="monospace" c="green">
          +{formatNumber(upgrade.baseTdPerSecond)} TD/s
        </Text>
        <Button
          size="compact-xs"
          variant={canAfford ? "filled" : "default"}
          color="green"
          disabled={!canAfford}
          onClick={() => onPurchase(upgrade.id)}
          ff="monospace"
        >
          {formatNumber(cost)} TD
        </Button>
      </Group>
    </Card>
  );
}
