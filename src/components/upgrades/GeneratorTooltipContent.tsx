import { Box, Divider, Group, Progress, Stack, Text } from "@mantine/core";
import type { Upgrade } from "../../data/upgrades";
import { formatNumber } from "../../utils/formatNumber";
import { computeGeneratorTooltipData } from "./tooltipHelpers";

interface GeneratorTooltipContentProps {
  upgrade: Upgrade;
  owned: number;
  allOwned: Record<string, number>;
}

export function GeneratorTooltipContent({
  upgrade,
  owned,
  allOwned,
}: GeneratorTooltipContentProps) {
  const {
    baseTdPerUnit,
    milestoneMultiplier,
    synergyMultiplier,
    effectiveTdPerUnit,
    totalTdForGenerator,
    percentOfTotal,
    nextMilestoneOwned,
    nextMilestoneMultiplier,
  } = computeGeneratorTooltipData(upgrade, owned, allOwned);

  const hasMultiplier = milestoneMultiplier > 1 || synergyMultiplier > 1;

  return (
    <Stack gap="xs" w={220}>
      <Text size="sm" fw={700} ff="monospace">
        {upgrade.icon} {upgrade.name}
      </Text>
      <Divider />

      <Group justify="space-between">
        <Text size="xs" c="dimmed" ff="monospace">
          Owned
        </Text>
        <Text size="xs" fw={600} ff="monospace">
          {owned}
        </Text>
      </Group>

      <Group justify="space-between">
        <Text size="xs" c="dimmed" ff="monospace">
          Base TD/s (per unit)
        </Text>
        <Text size="xs" ff="monospace">
          {formatNumber(baseTdPerUnit)}
        </Text>
      </Group>

      {hasMultiplier && (
        <Group justify="space-between">
          <Text size="xs" c="dimmed" ff="monospace">
            Effective TD/s (per unit)
          </Text>
          <Text size="xs" c="green" ff="monospace">
            {formatNumber(effectiveTdPerUnit)}
          </Text>
        </Group>
      )}

      <Group justify="space-between">
        <Text size="xs" c="dimmed" ff="monospace">
          Total TD/s
        </Text>
        <Text size="xs" c="green" fw={600} ff="monospace">
          {formatNumber(totalTdForGenerator)}
        </Text>
      </Group>

      {percentOfTotal > 0 && (
        <Box>
          <Group justify="space-between" mb={4}>
            <Text size="xs" c="dimmed" ff="monospace">
              % of total TD/s
            </Text>
            <Text size="xs" ff="monospace">
              {percentOfTotal.toFixed(1)}%
            </Text>
          </Group>
          <Progress
            value={percentOfTotal}
            size="xs"
            color="green"
            radius="xl"
          />
        </Box>
      )}

      {nextMilestoneOwned !== null && (
        <>
          <Divider />
          <Text size="xs" c="yellow" ff="monospace">
            Next milestone: {nextMilestoneOwned} owned &rarr; &times;
            {nextMilestoneMultiplier} production
          </Text>
        </>
      )}
    </Stack>
  );
}
