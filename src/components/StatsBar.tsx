import { Group, Text } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { BOOSTERS } from "../data/boosters";
import { UPGRADES } from "../data/upgrades";
import { computeWisdomMultiplier } from "../engine/rebirthEngine";
import {
  computeBoosterMultiplier,
  getTotalTdPerSecond,
} from "../engine/upgradeEngine";
import { useInterpolatedTd } from "../hooks/useInterpolatedTd";
import { useGameStore } from "../store";
import { useSettingsStore } from "../store/settingsStore";
import { formatNumber, formatNumberFull } from "../utils/formatNumber";

const RATE_BOOST_DURATION_MS = 3000;

export function StatsBar() {
  const trainingData = useInterpolatedTd();
  const upgradeOwned = useGameStore((s) => s.upgradeOwned);
  const wisdomTokens = useGameStore((s) => s.wisdomTokens);
  const boostersPurchased = useGameStore((s) => s.boostersPurchased);
  const wisdomMultiplier = computeWisdomMultiplier(wisdomTokens);
  const boosterMultiplier = computeBoosterMultiplier(
    BOOSTERS,
    boostersPurchased,
  );
  const tdPerSecond = getTotalTdPerSecond(
    UPGRADES,
    upgradeOwned,
    wisdomMultiplier,
    boosterMultiplier,
  );
  const numberFormat = useSettingsStore((s) => s.numberFormat);
  const fmt = numberFormat === "full" ? formatNumberFull : formatNumber;

  // Rate-of-change indicator: show sparkle when TD/s increases
  const prevTdPerSecondRef = useRef(tdPerSecond);
  const [rateBoosted, setRateBoosted] = useState(false);

  useEffect(() => {
    if (tdPerSecond > prevTdPerSecondRef.current) {
      setRateBoosted(true);
      const timer = setTimeout(
        () => setRateBoosted(false),
        RATE_BOOST_DURATION_MS,
      );
      prevTdPerSecondRef.current = tdPerSecond;
      return () => clearTimeout(timer);
    }
    prevTdPerSecondRef.current = tdPerSecond;
  }, [tdPerSecond]);

  return (
    <Group
      justify="space-between"
      px="md"
      py="xs"
      style={{
        borderBottom: "1px solid var(--mantine-color-dark-4)",
      }}
    >
      <Text size="sm" ff="monospace">
        Training Data:{" "}
        <Text span fw={700} c="green">
          {fmt(trainingData)}
        </Text>
      </Text>
      <Text size="sm" ff="monospace">
        TD/s:{" "}
        <Text span fw={700} c={tdPerSecond > 0 ? "green" : "dimmed"}>
          {tdPerSecond > 0 ? fmt(tdPerSecond) : "0.0"}
        </Text>
        {rateBoosted && (
          <Text
            span
            c="yellow"
            fw={700}
            style={{
              marginLeft: 4,
              opacity: 1,
              animation: "rate-boost-fade 3s ease-out forwards",
            }}
          >
            ▲✦
          </Text>
        )}
      </Text>
      {wisdomTokens > 0 && (
        <Text size="sm" ff="monospace">
          Wisdom:{" "}
          <Text span fw={700} c="yellow">
            {wisdomTokens} ✦ (+{((wisdomMultiplier - 1) * 100).toFixed(0)}%)
          </Text>
        </Text>
      )}
    </Group>
  );
}
