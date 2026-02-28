import { ScrollArea, Stack, Text, Title } from "@mantine/core";
import { UPGRADES } from "../data/upgrades";
import { useGameStore } from "../store";
import { UpgradeCard } from "./upgrades/UpgradeCard";

const GARAGE_LAB_UPGRADES = UPGRADES.filter((u) => u.tier === "garage-lab");
const STARTUP_UPGRADES = UPGRADES.filter((u) => u.tier === "startup");

export function UpgradesPanel() {
  const trainingData = useGameStore((s) => s.trainingData);
  const upgradeOwned = useGameStore((s) => s.upgradeOwned);
  const purchaseUpgrade = useGameStore((s) => s.purchaseUpgrade);

  const hasGarageLabUpgrade = GARAGE_LAB_UPGRADES.some(
    (u) => (upgradeOwned[u.id] ?? 0) > 0,
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
          <Text size="xs" fw={700} ff="monospace" c="dimmed">
            🔬 Garage Lab
          </Text>
          {GARAGE_LAB_UPGRADES.map((upgrade) => (
            <UpgradeCard
              key={upgrade.id}
              upgrade={upgrade}
              owned={upgradeOwned[upgrade.id] ?? 0}
              trainingData={trainingData}
              onPurchase={purchaseUpgrade}
            />
          ))}

          {hasGarageLabUpgrade && (
            <>
              <Text size="xs" fw={700} ff="monospace" c="dimmed" mt="sm">
                🚀 Startup
              </Text>
              {STARTUP_UPGRADES.map((upgrade) => (
                <UpgradeCard
                  key={upgrade.id}
                  upgrade={upgrade}
                  owned={upgradeOwned[upgrade.id] ?? 0}
                  trainingData={trainingData}
                  onPurchase={purchaseUpgrade}
                />
              ))}
            </>
          )}
        </Stack>
      </ScrollArea>
    </Stack>
  );
}
