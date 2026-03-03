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
import { useEffect } from "react";
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

        <ScrollArea.Autosize mah="60vh">
          <Stack gap="xs">
            {PRESTIGE_UPGRADES.map((upgrade) => {
              const level = prestigeUpgrades[upgrade.id] ?? 0;
              const maxed = level >= upgrade.maxLevel;
              const canAfford =
                !maxed && prestigeTokenBalance >= upgrade.costPerLevel;

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
                      {maxed ? "MAX" : `${upgrade.costPerLevel} ✦`}
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
