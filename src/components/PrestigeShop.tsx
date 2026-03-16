import {
  Badge,
  Button,
  Card,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { PRESTIGE_UPGRADES } from "../data/prestigeShop";
import { useGameStore } from "../store";
import { formatNumber } from "../utils/formatNumber";

interface PrestigeShopProps {
  opened: boolean;
  onClose: () => void;
}

export function PrestigeShop({ opened, onClose }: PrestigeShopProps) {
  const prestigeTokenBalance = useGameStore((s) => s.prestigeTokenBalance);
  const prestigeUpgrades = useGameStore((s) => s.prestigeUpgrades);
  const purchasePrestigeUpgrade = useGameStore(
    (s) => s.purchasePrestigeUpgrade,
  );
  const markPrestigeShopOpened = useGameStore((s) => s.markPrestigeShopOpened);
  const burstDiscountExpiresAt = useGameStore((s) => s.burstDiscountExpiresAt);

  // Live countdown for burst discount
  const [discountSecondsLeft, setDiscountSecondsLeft] = useState(0);
  useEffect(() => {
    const remaining = burstDiscountExpiresAt - Date.now();
    if (remaining <= 0) {
      setDiscountSecondsLeft(0);
      return;
    }
    setDiscountSecondsLeft(Math.ceil(remaining / 1000));
    const interval = setInterval(() => {
      const r = burstDiscountExpiresAt - Date.now();
      if (r <= 0) {
        setDiscountSecondsLeft(0);
        clearInterval(interval);
      } else {
        setDiscountSecondsLeft(Math.ceil(r / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [burstDiscountExpiresAt]);

  const hasDiscount = discountSecondsLeft > 0;

  useEffect(() => {
    if (opened) {
      markPrestigeShopOpened();
    }
  }, [opened, markPrestigeShopOpened]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Title order={4} ff="monospace" c="yellow">
          Prestige Shop
        </Title>
      }
      centered
      size="lg"
    >
      <Stack gap="md">
        <Text ta="center" size="sm" ff="monospace" c="yellow.4" fw={600}>
          Wisdom Tokens:{" "}
          <Text span fw={700}>
            {formatNumber(prestigeTokenBalance)} ✦
          </Text>
        </Text>
        {hasDiscount && (
          <Text ta="center" size="sm" ff="monospace" c="cyan" fw={700}>
            ⚡ DATA BURST: 10% off all purchases! ({discountSecondsLeft}s)
          </Text>
        )}

        <ScrollArea.Autosize mah="60vh">
          <Stack gap="xs">
            {PRESTIGE_UPGRADES.map((upgrade) => {
              const level = prestigeUpgrades[upgrade.id] ?? 0;
              const maxed = level >= upgrade.maxLevel;
              const effectiveCost = hasDiscount
                ? Math.floor(upgrade.costPerLevel * 0.9)
                : upgrade.costPerLevel;
              const canAfford = !maxed && prestigeTokenBalance >= effectiveCost;

              return (
                <Card
                  key={upgrade.id}
                  padding="sm"
                  radius="sm"
                  withBorder
                  style={{
                    borderColor: maxed
                      ? "var(--mantine-color-yellow-8)"
                      : canAfford
                        ? "var(--mantine-color-green-8)"
                        : "var(--mantine-color-dark-4)",
                    opacity: maxed ? 0.7 : canAfford ? 1 : 0.5,
                  }}
                >
                  <Group justify="space-between" mb={4}>
                    <Text size="sm" fw={700} ff="monospace">
                      {upgrade.icon} {upgrade.name}
                    </Text>
                    <Badge
                      size="sm"
                      variant="light"
                      color={maxed ? "yellow" : "green"}
                    >
                      {level}/{upgrade.maxLevel}
                    </Badge>
                  </Group>

                  <Text size="xs" c="dimmed" ff="monospace" mb={4}>
                    {upgrade.description}
                  </Text>

                  <Group justify="flex-end">
                    <Button
                      size="compact-xs"
                      variant={canAfford ? "filled" : "default"}
                      color="yellow"
                      disabled={!canAfford}
                      onClick={() => purchasePrestigeUpgrade(upgrade.id)}
                      ff="monospace"
                    >
                      {maxed
                        ? "MAX"
                        : hasDiscount
                          ? `${effectiveCost} ✦ (−10%)`
                          : `${effectiveCost} ✦`}
                    </Button>
                  </Group>
                </Card>
              );
            })}
          </Stack>
        </ScrollArea.Autosize>
      </Stack>
    </Modal>
  );
}
