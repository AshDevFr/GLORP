import { Divider, Group, Stack, Text } from "@mantine/core";
import type { Booster } from "../../data/boosters";
import { BOOSTERS } from "../../data/boosters";
import { getIdleBoostMultiplier } from "../../data/prestigeShop";
import { getSpeciesBonus } from "../../data/species";
import { UPGRADES } from "../../data/upgrades";
import {
  computeBoosterMultiplier,
  getTotalTdPerSecond,
} from "../../engine/upgradeEngine";
import { useGameStore } from "../../store";
import { formatNumber } from "../../utils/formatNumber";
import { computeGlobalMultiplierTooltipData } from "./tooltipHelpers";

interface BoosterTooltipContentProps {
  booster: Booster;
  purchased: boolean;
}

export function BoosterTooltipContent({
  booster,
  purchased,
}: BoosterTooltipContentProps) {
  const upgradeOwned = useGameStore((s) => s.upgradeOwned);
  const boostersPurchased = useGameStore((s) => s.boostersPurchased);
  const prestigeUpgrades = useGameStore((s) => s.prestigeUpgrades);
  const currentSpecies = useGameStore((s) => s.currentSpecies);
  const activeChallengeId = useGameStore((s) => s.activeChallengeId);

  // Mirror the no-prestige challenge logic from the game engine
  const effectivePrestige =
    activeChallengeId === "no-prestige" ? {} : prestigeUpgrades;
  const idleBoost = getIdleBoostMultiplier(
    (effectivePrestige as Record<string, number>)["idle-boost"] ?? 0,
  );
  const speciesBonus = getSpeciesBonus(currentSpecies);
  const boosterMult = computeBoosterMultiplier(BOOSTERS, boostersPurchased);
  const currentTdPerSecond = getTotalTdPerSecond(
    UPGRADES,
    upgradeOwned,
    idleBoost * speciesBonus.autoGen,
    boosterMult,
  );

  const { currentTdPerSecond: current, newTdPerSecond } =
    computeGlobalMultiplierTooltipData(booster, currentTdPerSecond);

  return (
    <Stack gap="xs" w={220}>
      <Text size="sm" fw={700} ff="monospace">
        {booster.icon} {booster.name}
      </Text>
      <Divider />

      <Text size="xs" c="dimmed" ff="monospace">
        {booster.description}
      </Text>

      <Group justify="space-between">
        <Text size="xs" c="dimmed" ff="monospace">
          Multiplier
        </Text>
        <Text size="xs" c="violet" fw={700} ff="monospace">
          ×{booster.multiplier} all TD/s
        </Text>
      </Group>

      {!purchased && (
        <>
          <Divider />
          <Group justify="space-between">
            <Text size="xs" c="dimmed" ff="monospace">
              Current TD/s
            </Text>
            <Text size="xs" ff="monospace">
              {formatNumber(current)}
            </Text>
          </Group>

          <Group justify="space-between">
            <Text size="xs" c="dimmed" ff="monospace">
              After purchase
            </Text>
            <Text
              size="xs"
              c="violet"
              fw={700}
              ff="monospace"
              style={{
                textShadow: "0 0 6px var(--mantine-color-violet-5)",
              }}
            >
              {formatNumber(newTdPerSecond)} TD/s
            </Text>
          </Group>
        </>
      )}
    </Stack>
  );
}
