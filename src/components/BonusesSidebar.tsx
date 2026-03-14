import { Collapse, ScrollArea, Stack, Text, Title, UnstyledButton } from "@mantine/core";
import { useState } from "react";
import { BOOSTERS } from "../data/boosters";
import { useGameStore } from "../store";
import { DailyObjectivesPanel } from "./DailyObjectivesPanel";
import { GeneratorCpsBreakdown } from "./GeneratorCpsBreakdown";
import { BoosterCard } from "./upgrades/BoosterCard";

export function BonusesSidebar() {
  const trainingData = useGameStore((s) => s.trainingData);
  const evolutionStage = useGameStore((s) => s.evolutionStage);
  const boostersPurchased = useGameStore((s) => s.boostersPurchased);
  const purchaseBooster = useGameStore((s) => s.purchaseBooster);

  const [breakdownOpen, setBreakdownOpen] = useState(true);

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
        {/* Production Breakdown — first (topmost) section in right sidebar */}
        <Stack
          gap="xs"
          p="md"
          style={{
            borderBottom: "1px solid var(--mantine-color-dark-4)",
            flexShrink: 0,
          }}
        >
          <UnstyledButton
            onClick={() => setBreakdownOpen((o) => !o)}
            style={{ width: "100%" }}
            aria-expanded={breakdownOpen}
          >
            <Title order={4} ff="monospace" c="teal">
              📊 Production Breakdown
            </Title>
          </UnstyledButton>
          <Collapse in={breakdownOpen} transitionDuration={200}>
            <GeneratorCpsBreakdown />
          </Collapse>
        </Stack>

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
