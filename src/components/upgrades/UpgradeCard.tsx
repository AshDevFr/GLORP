import { Badge, Button, Card, Group, Text } from "@mantine/core";
import { useCallback, useRef, useState } from "react";
import type { Upgrade } from "../../data/upgrades";
import { getUpgradeCost } from "../../engine/upgradeEngine";
import { useReducedMotion } from "../../hooks/useReducedMotion";
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
  const [isGlowing, setIsGlowing] = useState(false);
  const glowTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prefersReduced = useReducedMotion();

  const handlePurchase = useCallback(() => {
    onPurchase(upgrade.id);
    if (!prefersReduced) {
      setIsGlowing(true);
      if (glowTimerRef.current) clearTimeout(glowTimerRef.current);
      glowTimerRef.current = setTimeout(() => setIsGlowing(false), 600);
    }
  }, [onPurchase, upgrade.id, prefersReduced]);

  return (
    <Card
      className={isGlowing ? "glow-pulse" : undefined}
      padding="sm"
      radius="sm"
      withBorder
      style={{
        borderColor: canAfford
          ? "var(--mantine-color-green-8)"
          : "var(--mantine-color-dark-4)",
        opacity: canAfford ? 1 : 0.5,
        animation: isGlowing ? "glow-pulse 0.6s ease-in-out" : undefined,
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
          onClick={handlePurchase}
          ff="monospace"
        >
          {formatNumber(cost)} TD
        </Button>
      </Group>
    </Card>
  );
}
