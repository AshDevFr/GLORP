import { describe, expect, it } from "vitest";
import type { GameState } from "../store/gameStore";
import { D } from "../utils/decimal";
import { ACHIEVEMENTS } from "./achievements";

const emptyState: GameState = {
  trainingData: D(0),
  totalClicks: 0,
  totalTdEarned: D(0),
  evolutionStage: 0,
  lastSaved: 0,
  upgradeOwned: {},
  hasSeenFirstEvolution: false,
  hasSeenFirstUpgrade: false,
  mood: "Neutral",
  moodChangedAt: 0,
  wisdomTokens: 0,
  rebirthCount: 0,
  currentSpecies: "GLORP",
  unlockedSpecies: ["GLORP"],
  unlockedAchievements: [],
  easterEggsUnlocked: [],
  totalTimePlayed: 0,
  clickUpgradesPurchased: [],
  boostersPurchased: [],
  comboCount: 0,
  lastClickTime: 0,
  crossedMilestones: [],
  prestigeUpgrades: {},
  prestigeTokenBalance: 0,
  hasOpenedPrestigeShop: false,
  runStart: 0,
  peakTdPerSecond: D(0),
  peakGeneratorsOwned: 0,
  lifetimeTdEarned: D(0),
  lifetimePeakTdPerSecond: D(0),
  lifetimeBestRunTd: D(0),
  lifetimeWisdomEarned: 0,
  activeChallengeId: null,
  burstMultiplier: 1,
  burstBoostExpiresAt: 0,
  burstDiscountExpiresAt: 0,
  burstCount: 0,
  lastLoginDate: "",
  streakDays: 0,
  dailyBonusMultiplier: 1,
  dailyBonusExpiresAt: 0,
};

describe("ACHIEVEMENTS", () => {
  it("defines at least 15 achievements", () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(15);
  });

  it("every achievement has a non-empty id, name, and description", () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.id.length).toBeGreaterThan(0);
      expect(a.name.length).toBeGreaterThan(0);
      expect(a.description.length).toBeGreaterThan(0);
    }
  });

  it("all achievement IDs are unique", () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("all achievement conditions are functions", () => {
    for (const a of ACHIEVEMENTS) {
      expect(typeof a.condition).toBe("function");
    }
  });

  it("no achievement fires on an empty game state", () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.condition(emptyState)).toBe(false);
    }
  });

  it("first-click fires when totalClicks >= 1", () => {
    const a = ACHIEVEMENTS.find((x) => x.id === "first-click");
    expect(a).toBeDefined();
    expect(a?.condition({ ...emptyState, totalClicks: 1 })).toBe(true);
  });

  it("first-upgrade fires when an upgrade is owned", () => {
    const a = ACHIEVEMENTS.find((x) => x.id === "first-upgrade");
    expect(a).toBeDefined();
    expect(
      a?.condition({
        ...emptyState,
        upgradeOwned: { "neural-notepad": 1 },
      }),
    ).toBe(true);
  });

  it("upgrades-10 fires when 10 total upgrades are owned", () => {
    const a = ACHIEVEMENTS.find((x) => x.id === "upgrades-10");
    expect(a).toBeDefined();
    expect(
      a?.condition({
        ...emptyState,
        upgradeOwned: { "neural-notepad": 6, "data-pad": 4 },
      }),
    ).toBe(true);
    expect(
      a?.condition({
        ...emptyState,
        upgradeOwned: { "neural-notepad": 5, "data-pad": 4 },
      }),
    ).toBe(false);
  });

  it("stage-4 fires when evolutionStage >= 4", () => {
    const a = ACHIEVEMENTS.find((x) => x.id === "stage-4");
    expect(a).toBeDefined();
    expect(a?.condition({ ...emptyState, evolutionStage: 4 })).toBe(true);
    expect(a?.condition({ ...emptyState, evolutionStage: 3 })).toBe(false);
  });

  it("td-1m fires when totalTdEarned >= 1_000_000", () => {
    const a = ACHIEVEMENTS.find((x) => x.id === "td-1m");
    expect(a).toBeDefined();
    expect(a?.condition({ ...emptyState, totalTdEarned: D(1_000_000) })).toBe(
      true,
    );
    expect(a?.condition({ ...emptyState, totalTdEarned: D(999_999) })).toBe(
      false,
    );
  });

  it("first-rebirth fires when rebirthCount >= 1", () => {
    const a = ACHIEVEMENTS.find((x) => x.id === "first-rebirth");
    expect(a).toBeDefined();
    expect(a?.condition({ ...emptyState, rebirthCount: 1 })).toBe(true);
  });

  it("rebirths-5 fires when rebirthCount >= 5", () => {
    const a = ACHIEVEMENTS.find((x) => x.id === "rebirths-5");
    expect(a).toBeDefined();
    expect(a?.condition({ ...emptyState, rebirthCount: 5 })).toBe(true);
    expect(a?.condition({ ...emptyState, rebirthCount: 4 })).toBe(false);
  });

  it("includes all required milestone achievements", () => {
    const ids = new Set(ACHIEVEMENTS.map((a) => a.id));
    expect(ids.has("first-click")).toBe(true);
    expect(ids.has("first-upgrade")).toBe(true);
    expect(ids.has("stage-1")).toBe(true);
    expect(ids.has("stage-4")).toBe(true);
    expect(ids.has("td-1m")).toBe(true);
    expect(ids.has("upgrades-10")).toBe(true);
    expect(ids.has("first-rebirth")).toBe(true);
  });

  it("gen-10 fires when any generator reaches 10 owned", () => {
    const a = ACHIEVEMENTS.find((x) => x.id === "gen-10");
    expect(a).toBeDefined();
    expect(
      a?.condition({ ...emptyState, upgradeOwned: { "neural-notepad": 10 } }),
    ).toBe(true);
    expect(
      a?.condition({ ...emptyState, upgradeOwned: { "neural-notepad": 9 } }),
    ).toBe(false);
  });

  it("gen-25 fires when any generator reaches 25 owned", () => {
    const a = ACHIEVEMENTS.find((x) => x.id === "gen-25");
    expect(a).toBeDefined();
    expect(
      a?.condition({ ...emptyState, upgradeOwned: { "data-pad": 25 } }),
    ).toBe(true);
    expect(
      a?.condition({ ...emptyState, upgradeOwned: { "data-pad": 24 } }),
    ).toBe(false);
  });

  it("gen-50 fires when any generator reaches 50 owned", () => {
    const a = ACHIEVEMENTS.find((x) => x.id === "gen-50");
    expect(a).toBeDefined();
    expect(
      a?.condition({ ...emptyState, upgradeOwned: { "neural-notepad": 50 } }),
    ).toBe(true);
    expect(
      a?.condition({ ...emptyState, upgradeOwned: { "neural-notepad": 49 } }),
    ).toBe(false);
  });

  it("streak-7 fires when streakDays >= 7", () => {
    const a = ACHIEVEMENTS.find((x) => x.id === "streak-7");
    expect(a).toBeDefined();
    expect(a?.condition({ ...emptyState, streakDays: 7 })).toBe(true);
    expect(a?.condition({ ...emptyState, streakDays: 6 })).toBe(false);
  });

  it("clicks-100000 fires when totalClicks >= 100_000", () => {
    const a = ACHIEVEMENTS.find((x) => x.id === "clicks-100000");
    expect(a).toBeDefined();
    expect(a?.condition({ ...emptyState, totalClicks: 100_000 })).toBe(true);
    expect(a?.condition({ ...emptyState, totalClicks: 99_999 })).toBe(false);
  });

  it("rebirths-10 fires when rebirthCount >= 10", () => {
    const a = ACHIEVEMENTS.find((x) => x.id === "rebirths-10");
    expect(a).toBeDefined();
    expect(a?.condition({ ...emptyState, rebirthCount: 10 })).toBe(true);
    expect(a?.condition({ ...emptyState, rebirthCount: 9 })).toBe(false);
  });

  it("includes generator milestone and streak achievements", () => {
    const ids = new Set(ACHIEVEMENTS.map((a) => a.id));
    expect(ids.has("gen-10")).toBe(true);
    expect(ids.has("gen-25")).toBe(true);
    expect(ids.has("gen-50")).toBe(true);
    expect(ids.has("streak-7")).toBe(true);
    expect(ids.has("clicks-100000")).toBe(true);
    expect(ids.has("rebirths-10")).toBe(true);
  });
});
