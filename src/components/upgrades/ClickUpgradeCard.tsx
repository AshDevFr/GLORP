import { Badge, Button, Card, Group, Text } from "@mantine/core";
import { useCallback, useRef, useState } from "react";
import type { ClickUpgrade } from "../../data/clickUpgrades";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { formatNumber } from "../../utils/formatNumber";

interface ClickUpgradeCardProps {
  upgrade: ClickUpgrade;
  purchased: boolean;
  trainingData: number;
  evolutionStage: number;
  onPurchase: (id: string) => void;
}

export function ClickUpgradeCard({
  upgrade,
  purchased,
  trainingData,
  evolutionStage,
  onPurchase,
}: ClickUpgradeCardProps) {
  const canAfford = !purchased && trainingData >= upgrade.cost;
  const locked = evolutionStage < upgrade.unlockStage;
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

  if (locked) return null;

  return (
    <Card
      className={isGlowing ? "glow-pulse" : undefined}
      padding="sm"
      radius="sm"
      withBorder
      style={{
        borderColor: purchased
          ? "var(--mantine-color-yellow-8)"
          : canAfford
            ? "var(--mantine-color-green-8)"
            : "var(--mantine-color-dark-4)",
        opacity: purchased ? 0.7 : canAfford ? 1 : 0.5,
        animation: isGlowing ? "glow-pulse 0.6s ease-in-out" : undefined,
      }}
    >
      <Group justify="space-between" mb={4}>
        <Text size="sm" fw={700} ff="monospace">
          {upgrade.icon} {upgrade.name}
        </Text>
        {purchased && (
          <Badge size="sm" variant="light" color="yellow">
            OWNED
          </Badge>
        )}
      </Group>

      <Text size="xs" c="dimmed" ff="monospace" mb="xs">
        {upgrade.description}
      </Text>

      <Group justify="space-between" align="center">
        <Text size="xs" ff="monospace" c="yellow">
          {upgrade.multiplier}x click power
        </Text>
        {!purchased && (
          <Button
            size="compact-xs"
            variant={canAfford ? "filled" : "default"}
            color="green"
            disabled={!canAfford}
            onClick={handlePurchase}
            ff="monospace"
          >
            {formatNumber(upgrade.cost)} TD
          </Button>
        )}
      </Group>
    </Card>
  );
}
