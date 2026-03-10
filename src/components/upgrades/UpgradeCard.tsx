import { Badge, Button, Card, Group, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useRef, useState } from "react";
import { MILESTONE_THRESHOLDS } from "../../data/milestones";
import { SYNERGIES } from "../../data/synergies";
import type { Upgrade } from "../../data/upgrades";
import {
  getMilestoneLevel,
  getMilestoneMultiplier,
} from "../../engine/milestoneEngine";
import { getSynergyMultiplier } from "../../engine/synergyEngine";
import { getBulkCost, getMaxAffordable } from "../../engine/upgradeEngine";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { BuyMode } from "../../store/settingsStore";
import { formatNumber } from "../../utils/formatNumber";

interface UpgradeCardProps {
  upgrade: Upgrade;
  owned: number;
  allOwned?: Record<string, number>;
  trainingData: number;
  buyMode: BuyMode;
  onPurchase: (id: string, count: number) => void;
  costMultiplier?: number;
}

export function UpgradeCard({
  upgrade,
  owned,
  allOwned = {},
  trainingData,
  buyMode,
  onPurchase,
  costMultiplier,
}: UpgradeCardProps) {
  const count =
    buyMode === "max"
      ? getMaxAffordable(upgrade, owned, trainingData, costMultiplier)
      : buyMode;
  const cost = getBulkCost(upgrade, owned, count, costMultiplier);
  const canAfford = count > 0 && trainingData >= cost;

  const milestoneLevel = getMilestoneLevel(owned);
  const milestoneMultiplier = getMilestoneMultiplier(owned);
  const nextThreshold = MILESTONE_THRESHOLDS[milestoneLevel];
  const synergyMultiplier = getSynergyMultiplier(upgrade.id, allOwned);

  const [isGlowing, setIsGlowing] = useState(false);
  const [isMilestoneGlowing, setIsMilestoneGlowing] = useState(false);
  const glowTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const milestoneGlowTimerRef =
    useRef<ReturnType<typeof setTimeout>>(undefined);
  const prevOwnedRef = useRef(owned);
  const prefersReduced = useReducedMotion();

  // Detect milestone crossing and synergy unlock; fire celebrations.
  useEffect(() => {
    const prev = prevOwnedRef.current;
    const prevLevel = getMilestoneLevel(prev);
    const newLevel = getMilestoneLevel(owned);

    if (newLevel > prevLevel) {
      const threshold = MILESTONE_THRESHOLDS[newLevel - 1];
      notifications.show({
        title: "🏆 Milestone reached!",
        message: `${upgrade.name}: ×${threshold.multiplier} bonus (${threshold.label})`,
        color: "yellow",
        autoClose: 4000,
      });
      if (!prefersReduced) {
        setIsMilestoneGlowing(true);
        if (milestoneGlowTimerRef.current)
          clearTimeout(milestoneGlowTimerRef.current);
        milestoneGlowTimerRef.current = setTimeout(
          () => setIsMilestoneGlowing(false),
          1000,
        );
      }
    }

    // Check synergy unlock (this generator is the source)
    for (const synergy of SYNERGIES) {
      if (
        synergy.sourceId === upgrade.id &&
        prev < synergy.threshold &&
        owned >= synergy.threshold
      ) {
        notifications.show({
          title: "⚡ Synergy unlocked!",
          message: synergy.description,
          color: "cyan",
          autoClose: 5000,
        });
      }
    }

    prevOwnedRef.current = owned;
  }, [owned, upgrade.name, upgrade.id, prefersReduced]);

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

  const isAnimating = isGlowing || isMilestoneGlowing;
  const effectiveTdPerSecond =
    upgrade.baseTdPerSecond * milestoneMultiplier * synergyMultiplier;

  return (
    <Card
      className={isAnimating ? "glow-pulse" : undefined}
      padding="sm"
      radius="sm"
      withBorder
      aria-disabled={!canAfford ? "true" : undefined}
      style={{
        borderColor: isMilestoneGlowing
          ? "var(--mantine-color-yellow-6)"
          : canAfford
            ? "var(--mantine-color-green-8)"
            : "var(--mantine-color-dark-4)",
        opacity: canAfford ? 1 : 0.5,
        animation: isAnimating ? "glow-pulse 0.6s ease-in-out" : undefined,
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

      <Text size="xs" c="dimmed" ff="monospace" mb={4}>
        {upgrade.description}
      </Text>

      {/* Milestone dots + progress toward next threshold */}
      <Group gap={6} mb="xs" align="center">
        {MILESTONE_THRESHOLDS.map((t) => (
          <Text
            key={t.owned}
            size="xs"
            c={owned >= t.owned ? "yellow" : "dimmed"}
            title={`${t.owned} owned: ×${t.multiplier} (${t.label})`}
            style={{ lineHeight: 1 }}
          >
            {owned >= t.owned ? "●" : "○"}
          </Text>
        ))}
        <Text size="xs" ff="monospace" c="dimmed">
          {nextThreshold ? `${owned}/${nextThreshold.owned}` : "✦ MAX"}
        </Text>
      </Group>

      <Group justify="space-between" align="center">
        <Group gap={4} align="center">
          <Text size="xs" ff="monospace" c="green">
            +{formatNumber(effectiveTdPerSecond)} TD/s
          </Text>
          {milestoneMultiplier > 1 && (
            <Badge size="xs" variant="light" color="yellow">
              ×{milestoneMultiplier}
            </Badge>
          )}
          {synergyMultiplier > 1 && (
            <Badge size="xs" variant="light" color="cyan">
              ⚡×{synergyMultiplier}
            </Badge>
          )}
        </Group>
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
