import { Divider, ScrollArea, Stack, Text, Title } from "@mantine/core";
import type { Upgrade } from "../data/upgrades";
import { UPGRADES } from "../data/upgrades";
import { useGameStore } from "../store";
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

export function UpgradesPanel() {
  const trainingData = useGameStore((s) => s.trainingData);
  const upgradeOwned = useGameStore((s) => s.upgradeOwned);
  const purchaseUpgrade = useGameStore((s) => s.purchaseUpgrade);
  const evolutionStage = useGameStore((s) => s.evolutionStage);

  const visibleTiers = TIER_CONFIG.filter(
    (tc) => evolutionStage >= tc.unlockStage,
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
      <ScrollArea style={{ flex: 1 }}>
        <Stack gap="xs">
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
                    onPurchase={purchaseUpgrade}
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
