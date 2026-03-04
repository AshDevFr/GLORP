import { ScrollArea, Stack, Text, Title } from "@mantine/core";
import { BOOSTERS } from "../data/boosters";
import { useGameStore } from "../store";
import { DailyObjectivesPanel } from "./DailyObjectivesPanel";
import { BoosterCard } from "./upgrades/BoosterCard";

export function BonusesSidebar() {
  const trainingData = useGameStore((s) => s.trainingData);
  const evolutionStage = useGameStore((s) => s.evolutionStage);
  const boostersPurchased = useGameStore((s) => s.boostersPurchased);
  const purchaseBooster = useGameStore((s) => s.purchaseBooster);

  const visibleBoosters = BOOSTERS.filter(
    (b) => evolutionStage >= b.unlockStage,
  );

  const allMaxed =
    visibleBoosters.length > 0 &&
    visibleBoosters.every((b) => boostersPurchased.includes(b.id));

  return (
    <aside aria-label="Bonuses" className="sidebar-bonuses">
      <Stack
        gap={0}
        style={{
          height: "100%",
          overflow: "hidden",
        }}
      >
        <DailyObjectivesPanel />
        <Stack gap="sm" p="md" style={{ flex: 1, overflow: "hidden" }}>
          <Title order={4} ff="monospace" c="violet">
            Bonuses
          </Title>

          {visibleBoosters.length === 0 && (
            <Text size="xs" c="dimmed" ff="monospace" ta="center" py="xl">
              No bonuses available yet. Keep evolving!
            </Text>
          )}

          <ScrollArea style={{ flex: 1, minHeight: 0 }}>
            <div className="bonuses-grid">
              {visibleBoosters.map((booster) => (
                <BoosterCard
                  key={booster.id}
                  booster={booster}
                  purchased={boostersPurchased.includes(booster.id)}
                  trainingData={trainingData}
                  evolutionStage={evolutionStage}
                  onPurchase={purchaseBooster}
                />
              ))}
            </div>
            {allMaxed && (
              <Text
                size="xs"
                c="violet.4"
                ff="monospace"
                ta="center"
                mt="md"
                fw={700}
              >
                All boosters activated!
              </Text>
            )}
          </ScrollArea>
        </Stack>
      </Stack>
    </aside>
  );
}
