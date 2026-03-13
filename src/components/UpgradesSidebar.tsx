import {
  Badge,
  Button,
  Collapse,
  Group,
  ScrollArea,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { useCallback, useEffect, useState } from "react";
import { CLICK_UPGRADES } from "../data/clickUpgrades";
import { getGeneratorCostMultiplier } from "../data/prestigeShop";
import type { Upgrade } from "../data/upgrades";
import { UPGRADES } from "../data/upgrades";
import { useSound } from "../hooks/useSound";
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

function CategoryHeader({
  label,
  count,
  open,
  onToggle,
  color = "dimmed",
}: {
  label: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  color?: string;
}) {
  return (
    <UnstyledButton
      onClick={onToggle}
      style={{ width: "100%" }}
      aria-expanded={open}
    >
      <Group justify="space-between" wrap="nowrap" py={4}>
        <Group gap="xs" wrap="nowrap">
          <Text size="xs" fw={700} ff="monospace" c={color}>
            {label}
          </Text>
          <Badge size="xs" variant="light" color="gray">
            {count}
          </Badge>
        </Group>
        <Text
          size="xs"
          c="dimmed"
          ff="monospace"
          style={{
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 200ms ease",
          }}
        >
          ▼
        </Text>
      </Group>
    </UnstyledButton>
  );
}

export function UpgradesSidebar() {
  const trainingData = useGameStore((s) => s.trainingData);
  const upgradeOwned = useGameStore((s) => s.upgradeOwned);
  const purchaseBulkUpgrade = useGameStore((s) => s.purchaseBulkUpgrade);
  const purchaseClickUpgrade = useGameStore((s) => s.purchaseClickUpgrade);
  const evolutionStage = useGameStore((s) => s.evolutionStage);
  const clickUpgradesPurchased = useGameStore((s) => s.clickUpgradesPurchased);
  const prestigeUpgrades = useGameStore((s) => s.prestigeUpgrades);
  const costMultiplier = getGeneratorCostMultiplier(
    prestigeUpgrades["generator-discount"] ?? 0,
  );

  const buyMode = useSettingsStore((s) => s.buyMode);
  const setBuyMode = useSettingsStore((s) => s.setBuyMode);

  const { playPurchase } = useSound();

  const handleBulkPurchase = useCallback(
    (id: string, qty: number) => {
      playPurchase();
      purchaseBulkUpgrade(id, qty);
    },
    [purchaseBulkUpgrade, playPurchase],
  );

  const handleClickUpgradePurchase = useCallback(
    (id: string) => {
      playPurchase();
      purchaseClickUpgrade(id);
    },
    [purchaseClickUpgrade, playPurchase],
  );

  // Collapsible state — all open by default
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    {
      "click-boosters": true,
      "garage-lab": true,
      startup: true,
      "scale-up": true,
      "mega-corp": true,
      transcendence: true,
    },
  );

  const toggle = (key: string) =>
    setOpenCategories((prev) => ({ ...prev, [key]: !prev[key] }));

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

  const visibleClickUpgrades = CLICK_UPGRADES.filter(
    (u) => evolutionStage >= u.unlockStage,
  );

  const hasAnyUpgrades =
    visibleClickUpgrades.length > 0 || visibleTiers.length > 0;

  return (
    <aside aria-label="Upgrades" className="sidebar-upgrades">
      <Stack
        gap={0}
        style={{
          height: "100%",
          overflow: "hidden",
        }}
      >
        <Stack gap="sm" p="md" style={{ flex: 1, overflow: "hidden" }}>
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

          {!hasAnyUpgrades && (
            <Text size="xs" c="dimmed" ff="monospace" ta="center" py="xl">
              No upgrades available yet. Keep training!
            </Text>
          )}

          <ScrollArea style={{ flex: 1, minHeight: 0 }}>
            <Stack gap={4}>
              {visibleClickUpgrades.length > 0 && (
                <div>
                  <CategoryHeader
                    label="🖱️ Click Boosters"
                    count={visibleClickUpgrades.length}
                    open={openCategories["click-boosters"] ?? true}
                    onToggle={() => toggle("click-boosters")}
                    color="yellow"
                  />
                  <Collapse
                    in={openCategories["click-boosters"] ?? true}
                    transitionDuration={200}
                  >
                    <div className="upgrades-grid" style={{ marginTop: 4 }}>
                      {visibleClickUpgrades.map((upgrade) => {
                        const purchased = clickUpgradesPurchased.includes(
                          upgrade.id,
                        );
                        const locked = evolutionStage < upgrade.unlockStage;
                        return (
                          <div
                            key={upgrade.id}
                            aria-disabled={locked || undefined}
                            tabIndex={locked ? -1 : undefined}
                          >
                            <ClickUpgradeCard
                              upgrade={upgrade}
                              purchased={purchased}
                              trainingData={trainingData}
                              evolutionStage={evolutionStage}
                              onPurchase={handleClickUpgradePurchase}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </Collapse>
                </div>
              )}

              {visibleTiers.map((tc) => {
                const tierUpgrades = UPGRADES.filter((u) => u.tier === tc.tier);
                return (
                  <div key={tc.tier}>
                    <CategoryHeader
                      label={tc.label}
                      count={tierUpgrades.length}
                      open={openCategories[tc.tier] ?? true}
                      onToggle={() => toggle(tc.tier)}
                    />
                    <Collapse
                      in={openCategories[tc.tier] ?? true}
                      transitionDuration={200}
                    >
                      <div className="upgrades-grid" style={{ marginTop: 4 }}>
                        {tierUpgrades.map((upgrade) => (
                          <UpgradeCard
                            key={upgrade.id}
                            upgrade={upgrade}
                            owned={upgradeOwned[upgrade.id] ?? 0}
                            allOwned={upgradeOwned}
                            trainingData={trainingData}
                            buyMode={buyMode}
                            onPurchase={handleBulkPurchase}
                            costMultiplier={costMultiplier}
                          />
                        ))}
                      </div>
                    </Collapse>
                  </div>
                );
              })}
            </Stack>
          </ScrollArea>
        </Stack>
      </Stack>
    </aside>
  );
}
