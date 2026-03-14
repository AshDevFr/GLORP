import { AppShell, Button, Group } from "@mantine/core";
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
import { useSound } from "../hooks/useSound";
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
import { StorageBanner } from "./StorageBanner";
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
  const konamiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unlockedCount = useGameStore((s) => s.unlockedAchievements.length);
  const reducedMotion = useReducedMotion();
  const { playWelcomeBack } = useSound();
  const playWelcomeBackRef = useRef(playWelcomeBack);
  playWelcomeBackRef.current = playWelcomeBack;

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
      playWelcomeBackRef.current();
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
          <UpgradesSidebar />
          <div className="game-center">
            <PetDisplay />
          </div>
          <BonusesSidebar />
        </div>
      </AppShell.Main>

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
      <StorageBanner />

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
