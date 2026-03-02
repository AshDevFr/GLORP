import { AppShell, Button, Grid, Group } from "@mantine/core";
import { useEffect, useState } from "react";
import type { OfflineProgressResult } from "../engine/offlineEngine";
import { computeOfflineProgress } from "../engine/offlineEngine";
import { useGameLoop } from "../hooks/useGameLoop";
import { useGameStore } from "../store";
import { AchievementsModal } from "./AchievementsModal";
import { CrtOverlay } from "./CrtOverlay";
import { OfflineProgressModal } from "./OfflineProgressModal";
import { PetDisplay } from "./PetDisplay";
import { SettingsPanel } from "./SettingsPanel";
import { StatsBar } from "./StatsBar";
import { UpgradesPanel } from "./UpgradesPanel";

export function GameLayout() {
  useGameLoop();

  const [offlineResult, setOfflineResult] =
    useState<OfflineProgressResult | null>(null);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const unlockedCount = useGameStore((s) => s.unlockedAchievements.length);

  useEffect(() => {
    const state = useGameStore.getState();
    const result = computeOfflineProgress(state.lastSaved, Date.now(), state);
    if (result) {
      state.addTrainingData(result.earned);
      setOfflineResult(result);
    }
  }, []);

  return (
    <AppShell header={{ height: 44 }} padding={0}>
      <AppShell.Header>
        <Group h="100%" px="xs" justify="space-between" wrap="nowrap">
          <StatsBar />
          <Group gap="xs" wrap="nowrap">
            <Button
              size="xs"
              variant="subtle"
              color="yellow"
              onClick={() => setAchievementsOpen(true)}
              style={{ fontFamily: "monospace", whiteSpace: "nowrap" }}
            >
              ★ {unlockedCount}
            </Button>
            <Button
              size="xs"
              variant="subtle"
              onClick={() => setSettingsOpen(true)}
              style={{ fontFamily: "monospace" }}
              aria-label="Open settings"
            >
              ⚙
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Grid gutter={0} style={{ minHeight: "calc(100vh - 44px)" }}>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <PetDisplay />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <UpgradesPanel />
          </Grid.Col>
        </Grid>
      </AppShell.Main>

      <OfflineProgressModal
        result={offlineResult}
        onClose={() => setOfflineResult(null)}
      />
      <AchievementsModal
        opened={achievementsOpen}
        onClose={() => setAchievementsOpen(false)}
      />
      <SettingsPanel
        opened={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <CrtOverlay />
    </AppShell>
  );
}
