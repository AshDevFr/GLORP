import { AppShell, Grid } from "@mantine/core";
import { useGameLoop } from "../hooks/useGameLoop";
import { PetDisplay } from "./PetDisplay";
import { StatsBar } from "./StatsBar";
import { UpgradesPanel } from "./UpgradesPanel";

export function GameLayout() {
  useGameLoop();

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
    </AppShell>
  );
}
