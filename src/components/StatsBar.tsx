import { Group, Text } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { BOOSTERS } from "../data/boosters";
import { CLICK_UPGRADES } from "../data/clickUpgrades";
import {
  getClickMasteryBonus,
  getIdleBoostMultiplier,
} from "../data/prestigeShop";
import { getSpeciesBonus } from "../data/species";
import { UPGRADES } from "../data/upgrades";
import { computeClickPower } from "../engine/clickEngine";
import {
  computeBoosterMultiplier,
  getTotalTdPerSecond,
} from "../engine/upgradeEngine";
import { BURST_BOOST_MULTIPLIER } from "../hooks/useDataBurst";
import { useInterpolatedTd } from "../hooks/useInterpolatedTd";
import { useGameStore } from "../store";
import { useSettingsStore } from "../store/settingsStore";
import { D, type Decimal } from "../utils/decimal";
import { formatNumber, formatNumberFull } from "../utils/formatNumber";

const RATE_BOOST_DURATION_MS = 3000;

export function StatsBar() {
  const trainingData = useInterpolatedTd();
  const upgradeOwned = useGameStore((s) => s.upgradeOwned);
  const prestigeTokenBalance = useGameStore((s) => s.prestigeTokenBalance);
  const boostersPurchased = useGameStore((s) => s.boostersPurchased);
  const prestigeUpgrades = useGameStore((s) => s.prestigeUpgrades);
  const currentSpecies = useGameStore((s) => s.currentSpecies);
  const rebirthCount = useGameStore((s) => s.rebirthCount);
  const activeChallengeId = useGameStore((s) => s.activeChallengeId);
  const clickUpgradesPurchased = useGameStore((s) => s.clickUpgradesPurchased);
  const comboCount = useGameStore((s) => s.comboCount);
  const lastClickTime = useGameStore((s) => s.lastClickTime);
  const ep = activeChallengeId === "no-prestige" ? {} : prestigeUpgrades;
  const idleBoost = getIdleBoostMultiplier(ep["idle-boost"] ?? 0);
  const speciesBonus = getSpeciesBonus(currentSpecies);
  const boosterMultiplier = computeBoosterMultiplier(
    BOOSTERS,
    boostersPurchased,
  );
  const rawTdPerSecond = getTotalTdPerSecond(
    UPGRADES,
    upgradeOwned,
    idleBoost * speciesBonus.autoGen,
    boosterMultiplier,
  );
  const tdPerSecond =
    activeChallengeId === "click-only" ? D(0) : rawTdPerSecond;
  const clickMastery = getClickMasteryBonus(ep["click-mastery"] ?? 0);
  const effectiveClickPower = computeClickPower(
    { clickUpgradesPurchased, comboCount, lastClickTime },
    CLICK_UPGRADES,
    tdPerSecond,
    undefined,
    clickMastery,
    speciesBonus.clickPower,
  );
  const burstBoostExpiresAt = useGameStore((s) => s.burstBoostExpiresAt);
  const burstMultiplier = useGameStore((s) => s.burstMultiplier);
  const numberFormat = useSettingsStore((s) => s.numberFormat);
  const fmt = numberFormat === "full" ? formatNumberFull : formatNumber;

  // Burst boost countdown (seconds remaining)
  const [burstSecondsLeft, setBurstSecondsLeft] = useState(0);
  useEffect(() => {
    const remaining = burstBoostExpiresAt - Date.now();
    if (remaining <= 0 || burstMultiplier <= 1) {
      setBurstSecondsLeft(0);
      return;
    }
    setBurstSecondsLeft(Math.ceil(remaining / 1000));
    const interval = setInterval(() => {
      const r = burstBoostExpiresAt - Date.now();
      if (r <= 0) {
        setBurstSecondsLeft(0);
        clearInterval(interval);
      } else {
        setBurstSecondsLeft(Math.ceil(r / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [burstBoostExpiresAt, burstMultiplier]);

  // Rate-of-change indicator: show sparkle when TD/s increases
  const prevTdPerSecondRef = useRef<Decimal>(tdPerSecond);
  const [rateBoosted, setRateBoosted] = useState(false);

  useEffect(() => {
    if (tdPerSecond.gt(prevTdPerSecondRef.current)) {
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
        <Text span fw={700} c={tdPerSecond.gt(0) ? "green" : "dimmed"}>
          {tdPerSecond.gt(0) ? fmt(tdPerSecond) : "0.0"}
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
        {burstSecondsLeft > 0 && (
          <Text span c="cyan" fw={700} ff="monospace" style={{ marginLeft: 6 }}>
            {"\u26a1"} {BURST_BOOST_MULTIPLIER}&#215; for {burstSecondsLeft}s
          </Text>
        )}
      </Text>
      <Text size="sm" ff="monospace">
        Click:{" "}
        <Text span fw={700} c="cyan">
          {fmt(effectiveClickPower)} TD
        </Text>
      </Text>
      {rebirthCount > 0 && (
        <Text size="sm" ff="monospace">
          Wisdom:{" "}
          <Text span fw={700} c="yellow">
            {prestigeTokenBalance} ✦
          </Text>
        </Text>
      )}
    </Group>
  );
}
