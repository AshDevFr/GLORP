import { Button, Divider, Group, ScrollArea, Stack, Text, Title } from "@mantine/core";
import { useEffect } from "react";
import { CLICK_UPGRADES } from "../data/clickUpgrades";
import type { Upgrade } from "../data/upgrades";
import { UPGRADES } from "../data/upgrades";
import { useGameStore } from "../store";
import type { BuyMode } from "../store/settingsStore";
import { useSettingsStore } from "../store/settingsStore";
import { ClickUpgradeCard } from "./upgrades/ClickUpgradeCard";
import { UpgradeCard } from "./upgrades/UpgradeCard";

interface TierConfig {
  tier: Upgrade["tier"];
  label: string;
  unlockStage: number;
}

const TIER_CONFIG: readonly TierConfig[] = [
  { tier: "garage-lab", label: "🔬 Garage Lab", unlockStage: 0 },
  { tier: "startup", label: "🚀 Startup", unlockStage: 0 },
  { tier: "scale-up", label: "🏗️ Scale-Up", unlockStage: 2 },
  { tier: "mega-corp", label: "🏢 Mega Corp", unlockStage: 3 },
  { tier: "transcendence", label: "✨ Transcendence", unlockStage: 4 },
];

const BUY_MODES: readonly { mode: BuyMode; label: string; shortcut: string }[] =
  [
    { mode: 1, label: "×1", shortcut: "1" },
    { mode: 10, label: "×10", shortcut: "2" },
    { mode: 100, label: "×100", shortcut: "3" },
    { mode: "max", label: "Max", shortcut: "4" },
  ];

export function UpgradesPanel() {
  const trainingData = useGameStore((s) => s.trainingData);
  const upgradeOwned = useGameStore((s) => s.upgradeOwned);
  const purchaseBulkUpgrade = useGameStore((s) => s.purchaseBulkUpgrade);
  const purchaseClickUpgrade = useGameStore((s) => s.purchaseClickUpgrade);
  const evolutionStage = useGameStore((s) => s.evolutionStage);
  const clickUpgradesPurchased = useGameStore((s) => s.clickUpgradesPurchased);

  const buyMode = useSettingsStore((s) => s.buyMode);
  const setBuyMode = useSettingsStore((s) => s.setBuyMode);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }
      if (e.key === "1") setBuyMode(1);
      else if (e.key === "2") setBuyMode(10);
      else if (e.key === "3") setBuyMode(100);
      else if (e.key === "4") setBuyMode("max");
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setBuyMode]);

  const visibleTiers = TIER_CONFIG.filter(
    (tc) => evolutionStage >= tc.unlockStage,
  );

  // Show click upgrades that are unlocked at or below current stage
  const visibleClickUpgrades = CLICK_UPGRADES.filter(
    (u) => evolutionStage >= u.unlockStage,
  );

  return (
    <Stack
      gap="sm"
      p="md"
      style={{
        borderLeft: "1px solid var(--mantine-color-dark-4)",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Title order={4} ff="monospace" c="green">
        Upgrades
      </Title>
      <Group gap="xs">
        {BUY_MODES.map(({ mode, label, shortcut }) => (
          <Button
            key={String(mode)}
            size="compact-xs"
            variant={buyMode === mode ? "filled" : "default"}
            color="green"
            ff="monospace"
            onClick={() => setBuyMode(mode)}
            title={`Buy ${label} (key: ${shortcut})`}
          >
            {label}
          </Button>
        ))}
      </Group>
      <ScrollArea style={{ flex: 1 }}>
        <Stack gap="xs">
          {visibleClickUpgrades.length > 0 && (
            <div>
              <Text size="xs" fw={700} ff="monospace" c="yellow" mb="xs">
                🖱️ Click Boosters
              </Text>
              {visibleClickUpgrades.map((upgrade) => (
                <ClickUpgradeCard
                  key={upgrade.id}
                  upgrade={upgrade}
                  purchased={clickUpgradesPurchased.includes(upgrade.id)}
                  trainingData={trainingData}
                  evolutionStage={evolutionStage}
                  onPurchase={purchaseClickUpgrade}
                />
              ))}
              <Divider my="xs" />
            </div>
          )}
          {visibleTiers.map((tc, index) => {
            const tierUpgrades = UPGRADES.filter((u) => u.tier === tc.tier);
            return (
              <div key={tc.tier}>
                {index > 0 && <Divider my="xs" />}
                <Text size="xs" fw={700} ff="monospace" c="dimmed" mb="xs">
                  {tc.label}
                </Text>
                {tierUpgrades.map((upgrade) => (
                  <UpgradeCard
                    key={upgrade.id}
                    upgrade={upgrade}
                    owned={upgradeOwned[upgrade.id] ?? 0}
                    trainingData={trainingData}
                    buyMode={buyMode}
                    onPurchase={purchaseBulkUpgrade}
                  />
                ))}
              </div>
            );
          })}
        </Stack>
      </ScrollArea>
    </Stack>
  );
}
