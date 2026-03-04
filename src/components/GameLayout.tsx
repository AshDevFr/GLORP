import {
  AppShell,
  Button,
  Drawer,
  Group,
  SegmentedControl,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getIdleBoostMultiplier,
  getPrestigeOfflineEfficiency,
} from "../data/prestigeShop";
import { getSpeciesBonus } from "../data/species";
import { EASTER_EGG_MESSAGES } from "../engine/easterEggEngine";
import type { OfflineProgressResult } from "../engine/offlineEngine";
import { computeOfflineProgress } from "../engine/offlineEngine";
import { useDailyObjectiveTracking } from "../hooks/useDailyObjectiveTracking";
import { useGameLoop } from "../hooks/useGameLoop";
import { useKonamiCode } from "../hooks/useKonamiCode";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useGameStore } from "../store";
import { useDailyStore } from "../store/dailyStore";
import { AchievementsModal } from "./AchievementsModal";
import { BonusesSidebar } from "./BonusesSidebar";
import { CrtOverlay } from "./CrtOverlay";
import { OfflineProgressModal } from "./OfflineProgressModal";
import { PetDisplay } from "./PetDisplay";
import { SettingsPanel } from "./SettingsPanel";
import { StatsBar } from "./StatsBar";
import { StatsPanel } from "./StatsPanel";
import { UpgradesSidebar } from "./UpgradesSidebar";

export function GameLayout() {
  useGameLoop();
  useDailyObjectiveTracking();

  const [offlineResult, setOfflineResult] =
    useState<OfflineProgressResult | null>(null);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [konamiVisible, setKonamiVisible] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState("upgrades");
  const konamiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unlockedCount = useGameStore((s) => s.unlockedAchievements.length);
  const reducedMotion = useReducedMotion();

  // Responsive breakpoints
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const isMedium = useMediaQuery("(min-width: 900px)");

  useEffect(() => {
    const state = useGameStore.getState();
    const offlineEff = getPrestigeOfflineEfficiency(
      state.prestigeUpgrades["offline-efficiency"] ?? 0,
    );
    const idleBoost = getIdleBoostMultiplier(
      state.prestigeUpgrades["idle-boost"] ?? 0,
    );
    const speciesAutoGen = getSpeciesBonus(state.currentSpecies).autoGen;
    const result = computeOfflineProgress(
      state.lastSaved,
      Date.now(),
      {
        ...state,
        idleBoostMultiplier: idleBoost,
        speciesAutoGenMultiplier: speciesAutoGen,
      },
      offlineEff,
    );
    if (result) {
      state.addTrainingData(result.earned);
      setOfflineResult(result);
      useDailyStore.getState().recordOfflineBonus();
    }
  }, []);

  const handleKonami = useCallback(() => {
    const state = useGameStore.getState();
    if (!state.easterEggsUnlocked.includes("konami")) {
      state.unlockEasterEgg("konami");
      const msg = EASTER_EGG_MESSAGES.konami;
      notifications.show({
        title: msg.title,
        message: msg.message,
        color: "violet",
        autoClose: 6000,
      });
    }
    if (!reducedMotion) {
      setKonamiVisible(true);
      if (konamiTimerRef.current) clearTimeout(konamiTimerRef.current);
      konamiTimerRef.current = setTimeout(() => setKonamiVisible(false), 2000);
    }
  }, [reducedMotion]);

  useKonamiCode(handleKonami);

  // Close drawer when viewport grows past breakpoint
  useEffect(() => {
    if (isDesktop) setDrawerOpen(false);
  }, [isDesktop]);

  // Determine which sidebar(s) show as drawers
  const showUpgradesSidebar = isMedium;
  const showBonusesSidebar = isDesktop;
  const needsDrawer = !isDesktop;

  return (
    <AppShell header={{ height: 44 }} padding={0}>
      <AppShell.Header>
        <Group h="100%" px="xs" justify="space-between" wrap="nowrap">
          <StatsBar />
          <Group gap="xs" wrap="nowrap">
            {needsDrawer && (
              <Button
                size="xs"
                variant="subtle"
                color="green"
                onClick={() => setDrawerOpen(true)}
                style={{ fontFamily: "monospace" }}
                aria-label={
                  isMedium ? "Open bonuses panel" : "Open upgrades and bonuses"
                }
              >
                {isMedium ? "⚡ Bonuses" : "📋 Panels"}
              </Button>
            )}
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
              color="cyan"
              onClick={() => setStatsOpen(true)}
              style={{ fontFamily: "monospace" }}
              aria-label="Open stats"
            >
              📊
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
        <div className="game-layout">
          {showUpgradesSidebar && <UpgradesSidebar />}
          <div className="game-center">
            <PetDisplay />
          </div>
          {showBonusesSidebar && <BonusesSidebar />}
        </div>
      </AppShell.Main>

      {/* Bottom drawer for responsive layouts */}
      <Drawer
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        position="bottom"
        size="70vh"
        title={null}
        styles={{
          body: {
            padding: 0,
            height: "100%",
            display: "flex",
            flexDirection: "column",
          },
          content: { display: "flex", flexDirection: "column" },
        }}
      >
        {!isMedium && (
          <SegmentedControl
            value={drawerTab}
            onChange={setDrawerTab}
            fullWidth
            data={[
              { label: "🔧 Upgrades", value: "upgrades" },
              { label: "⚡ Bonuses", value: "bonuses" },
            ]}
            style={{ margin: "0 var(--mantine-spacing-sm)" }}
            styles={{ root: { fontFamily: "monospace" } }}
          />
        )}
        <div style={{ flex: 1, overflow: "hidden" }}>
          {isMedium ? (
            <BonusesSidebar />
          ) : drawerTab === "upgrades" ? (
            <UpgradesSidebar />
          ) : (
            <BonusesSidebar />
          )}
        </div>
      </Drawer>

      <OfflineProgressModal
        result={offlineResult}
        onClose={() => setOfflineResult(null)}
      />
      <AchievementsModal
        opened={achievementsOpen}
        onClose={() => setAchievementsOpen(false)}
      />
      <StatsPanel opened={statsOpen} onClose={() => setStatsOpen(false)} />
      <SettingsPanel
        opened={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <CrtOverlay />

      {konamiVisible && (
        <div
          aria-hidden="true"
          className="konami-overlay"
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 9998,
            background:
              "linear-gradient(135deg, #ff0000, #ff7700, #ffff00, #00ff00, #0000ff, #8b00ff)",
            animation: "konami-flash 2s ease-out forwards",
          }}
        />
      )}
    </AppShell>
  );
}
