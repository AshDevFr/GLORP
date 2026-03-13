import { Badge, Divider, Group, Stack, Text } from "@mantine/core";
import type { ClickUpgrade } from "../../data/clickUpgrades";
import { formatNumber } from "../../utils/formatNumber";

interface ClickUpgradeTooltipContentProps {
  upgrade: ClickUpgrade;
  purchased: boolean;
}

export function ClickUpgradeTooltipContent({
  upgrade,
  purchased,
}: ClickUpgradeTooltipContentProps) {
  return (
    <Stack gap="xs" w={210}>
      <Group justify="space-between" wrap="nowrap">
        <Text size="sm" fw={700} ff="monospace">
          {upgrade.icon} {upgrade.name}
        </Text>
        {purchased && (
          <Badge size="xs" variant="light" color="yellow">
            OWNED
          </Badge>
        )}
      </Group>
      <Divider />

      <Text size="xs" c="dimmed" ff="monospace">
        {upgrade.description}
      </Text>

      <Group justify="space-between">
        <Text size="xs" c="dimmed" ff="monospace">
          Effect
        </Text>
        <Text size="xs" c="yellow" ff="monospace">
          +{upgrade.clickSeconds}s per click
        </Text>
      </Group>

      {!purchased && (
        <Group justify="space-between">
          <Text size="xs" c="dimmed" ff="monospace">
            Cost
          </Text>
          <Text size="xs" ff="monospace">
            {formatNumber(upgrade.cost)} TD
          </Text>
        </Group>
      )}
    </Stack>
  );
}
