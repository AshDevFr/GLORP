import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Popover,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import type { DecimalSource } from "break_infinity.js";
import { useCallback, useRef, useState } from "react";
import type { Booster } from "../../data/boosters";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { D } from "../../utils/decimal";
import { formatNumber } from "../../utils/formatNumber";
import { BoosterTooltipContent } from "./BoosterTooltipContent";

interface BoosterCardProps {
  booster: Booster;
  purchased: boolean;
  trainingData: DecimalSource;
  evolutionStage: number;
  onPurchase: (id: string) => void;
}

export function BoosterCard({
  booster,
  purchased,
  trainingData,
  evolutionStage,
  onPurchase,
}: BoosterCardProps) {
  const canAfford = !purchased && D(trainingData).gte(booster.cost);
  const locked = evolutionStage < booster.unlockStage;
  const [isGlowing, setIsGlowing] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const isHoverDevice = useRef(false);
  const glowTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prefersReduced = useReducedMotion();

  const handlePurchase = useCallback(() => {
    onPurchase(booster.id);
    if (!prefersReduced) {
      setIsGlowing(true);
      if (glowTimerRef.current) clearTimeout(glowTimerRef.current);
      glowTimerRef.current = setTimeout(() => setIsGlowing(false), 600);
    }
    notifications.show({
      title: `${booster.icon} ${booster.name} activated!`,
      message: `All auto-generation is now ×${booster.multiplier}!`,
      color: "violet",
      autoClose: 4000,
    });
  }, [onPurchase, booster, prefersReduced]);

  if (locked) return null;

  return (
    <Popover
      opened={tooltipOpen}
      onChange={setTooltipOpen}
      position="right"
      withArrow
      shadow="md"
      withinPortal
    >
      <Popover.Target>
        <Card
          onMouseEnter={() => {
            isHoverDevice.current = true;
            setTooltipOpen(true);
          }}
          onMouseLeave={() => setTooltipOpen(false)}
          className={isGlowing ? "glow-pulse" : undefined}
          padding="sm"
          radius="sm"
          withBorder
          style={{
            borderColor: purchased
              ? "var(--mantine-color-violet-8)"
              : canAfford
                ? "var(--mantine-color-green-8)"
                : "var(--mantine-color-dark-4)",
            opacity: purchased ? 0.7 : canAfford ? 1 : 0.5,
            animation: isGlowing ? "glow-pulse 0.6s ease-in-out" : undefined,
          }}
        >
          <Group justify="space-between" mb={4} wrap="nowrap">
            <Text size="sm" fw={700} ff="monospace">
              {booster.icon} {booster.name}
            </Text>
            <Group gap={4} wrap="nowrap">
              {purchased && (
                <Badge size="sm" variant="light" color="violet">
                  ACTIVE
                </Badge>
              )}
              <ActionIcon
                size="xs"
                variant="subtle"
                color="gray"
                aria-label={`Show details for ${booster.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isHoverDevice.current) {
                    setTooltipOpen((o) => !o);
                  }
                }}
              >
                ℹ
              </ActionIcon>
            </Group>
          </Group>

          <Text size="xs" c="dimmed" ff="monospace" mb="xs">
            {booster.description}
          </Text>

          <Group justify="space-between" align="center">
            <Text size="xs" ff="monospace" c="violet">
              ×{booster.multiplier} all auto-gen
            </Text>
            {!purchased && (
              <Button
                size="compact-xs"
                variant={canAfford ? "filled" : "default"}
                color="violet"
                disabled={!canAfford}
                onClick={handlePurchase}
                ff="monospace"
              >
                {formatNumber(booster.cost)} TD
              </Button>
            )}
          </Group>
        </Card>
      </Popover.Target>
      <Popover.Dropdown>
        <BoosterTooltipContent booster={booster} purchased={purchased} />
      </Popover.Dropdown>
    </Popover>
  );
}
