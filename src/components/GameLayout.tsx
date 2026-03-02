import { AppShell, Grid } from "@mantine/core";
import { useEffect, useState } from "react";
import type { OfflineProgressResult } from "../engine/offlineEngine";
import { computeOfflineProgress } from "../engine/offlineEngine";
import { useGameLoop } from "../hooks/useGameLoop";
import { useGameStore } from "../store";
import { OfflineProgressModal } from "./OfflineProgressModal";
import { PetDisplay } from "./PetDisplay";
import { StatsBar } from "./StatsBar";
import { UpgradesPanel } from "./UpgradesPanel";

export function GameLayout() {
  useGameLoop();

  const [offlineResult, setOfflineResult] =
    useState<OfflineProgressResult | null>(null);

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
        <StatsBar />
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
    </AppShell>
  );
}
