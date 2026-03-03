import { Badge, Button, Card, Group, Text } from "@mantine/core";
import { useCallback, useRef, useState } from "react";
import type { Upgrade } from "../../data/upgrades";
import {
  getBulkCost,
  getMaxAffordable,
} from "../../engine/upgradeEngine";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { BuyMode } from "../../store/settingsStore";
import { formatNumber } from "../../utils/formatNumber";

interface UpgradeCardProps {
  upgrade: Upgrade;
  owned: number;
  trainingData: number;
  buyMode: BuyMode;
  onPurchase: (id: string, count: number) => void;
}

export function UpgradeCard({
  upgrade,
  owned,
  trainingData,
  buyMode,
  onPurchase,
}: UpgradeCardProps) {
  const count =
    buyMode === "max"
      ? getMaxAffordable(upgrade, owned, trainingData)
      : buyMode;
  const cost = getBulkCost(upgrade, owned, count);
  const canAfford = count > 0 && trainingData >= cost;

  const [isGlowing, setIsGlowing] = useState(false);
  const glowTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prefersReduced = useReducedMotion();

  const handlePurchase = useCallback(() => {
    onPurchase(upgrade.id, count);
    if (!prefersReduced) {
      setIsGlowing(true);
      if (glowTimerRef.current) clearTimeout(glowTimerRef.current);
      glowTimerRef.current = setTimeout(() => setIsGlowing(false), 600);
    }
  }, [onPurchase, upgrade.id, count, prefersReduced]);

  const buyLabel =
    buyMode === "max"
      ? count > 0
        ? `×${count} — ${formatNumber(cost)} TD`
        : "Max (0)"
      : `${formatNumber(cost)} TD`;

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
          {buyLabel}
        </Button>
      </Group>
    </Card>
  );
}
