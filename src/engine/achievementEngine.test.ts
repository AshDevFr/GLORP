import { describe, expect, it } from "vitest";
import type { Species } from "../data/species";
import type { GameState } from "../store/gameStore";
import { D } from "../utils/decimal";
import { checkAchievements } from "./achievementEngine";

const baseState: GameState = {
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
};

describe("checkAchievements", () => {
  it("returns empty array when state satisfies no achievements", () => {
    const result = checkAchievements(baseState, []);
    expect(result).toEqual([]);
  });

  it("returns newly unlocked achievement for first click", () => {
    const state = { ...baseState, totalClicks: 1 };
    const result = checkAchievements(state, []);
    expect(result).toContain("first-click");
  });

  it("does not return already-unlocked achievements", () => {
    const state = { ...baseState, totalClicks: 1 };
    const result = checkAchievements(state, ["first-click"]);
    expect(result).not.toContain("first-click");
  });

  it("returns multiple achievements that unlock simultaneously", () => {
    const state = { ...baseState, totalClicks: 100 };
    const result = checkAchievements(state, []);
    expect(result).toContain("first-click");
    expect(result).toContain("clicks-100");
  });

  it("returns clicks-1000 when reaching 1000 clicks", () => {
    const state = { ...baseState, totalClicks: 1_000 };
    const result = checkAchievements(state, ["first-click", "clicks-100"]);
    expect(result).toContain("clicks-1000");
  });

  it("returns first-upgrade when an upgrade is owned", () => {
    const state = { ...baseState, upgradeOwned: { "neural-notepad": 1 } };
    const result = checkAchievements(state, []);
    expect(result).toContain("first-upgrade");
  });

  it("returns upgrades-5 when 5 upgrades are owned in total", () => {
    const state = {
      ...baseState,
      upgradeOwned: { "neural-notepad": 3, "data-pad": 2 },
    };
    const result = checkAchievements(state, ["first-upgrade"]);
    expect(result).toContain("upgrades-5");
  });

  it("returns upgrades-10 when 10 upgrades are owned in total", () => {
    const state = {
      ...baseState,
      upgradeOwned: { "neural-notepad": 5, "data-pad": 5 },
    };
    const result = checkAchievements(state, ["first-upgrade", "upgrades-5"]);
    expect(result).toContain("upgrades-10");
  });

  it("returns stage milestones when evolutionStage is high enough", () => {
    const state = { ...baseState, evolutionStage: 4 };
    const result = checkAchievements(state, []);
    expect(result).toContain("stage-1");
    expect(result).toContain("stage-2");
    expect(result).toContain("stage-3");
    expect(result).toContain("stage-4");
  });

  it("returns td-1m when totalTdEarned reaches 1M", () => {
    const state = { ...baseState, totalTdEarned: D(1_000_000) };
    const result = checkAchievements(state, ["td-1k"]);
    expect(result).toContain("td-1m");
  });

  it("returns first-rebirth when rebirthCount is 1", () => {
    const state = { ...baseState, rebirthCount: 1 };
    const result = checkAchievements(state, []);
    expect(result).toContain("first-rebirth");
  });

  it("returns rebirths-5 when rebirthCount reaches 5", () => {
    const state = { ...baseState, rebirthCount: 5 };
    const result = checkAchievements(state, ["first-rebirth"]);
    expect(result).toContain("rebirths-5");
  });

  it("does not return stage-4 when already unlocked", () => {
    const state = { ...baseState, evolutionStage: 4 };
    const result = checkAchievements(state, ["stage-4"]);
    expect(result).not.toContain("stage-4");
  });

  it("returns click-storm when comboCount reaches 10", () => {
    const state = { ...baseState, comboCount: 10 };
    const result = checkAchievements(state, []);
    expect(result).toContain("click-storm");
  });

  it("returns synergy-first when a synergy threshold is met", () => {
    const state = {
      ...baseState,
      upgradeOwned: { "neural-notepad": 50 },
    };
    const result = checkAchievements(state, []);
    expect(result).toContain("synergy-first");
  });

  it("returns bulk-buyer when a generator reaches 100 owned", () => {
    const state = {
      ...baseState,
      upgradeOwned: { "neural-notepad": 100 },
    };
    const result = checkAchievements(state, []);
    expect(result).toContain("bulk-buyer");
  });

  it("returns window-shopper when prestige shop has been opened", () => {
    const state = { ...baseState, hasOpenedPrestigeShop: true };
    const result = checkAchievements(state, []);
    expect(result).toContain("window-shopper");
  });

  it("returns fully-loaded when all prestige upgrades are at max level", () => {
    const state = {
      ...baseState,
      prestigeUpgrades: {
        "quick-start": 3,
        "auto-buy": 1,
        "click-mastery": 10,
        "generator-discount": 3,
        "idle-boost": 5,
        "offline-efficiency": 3,
        "evolution-accelerator": 3,
        "species-memory": 5,
        "token-magnet": 5,
        "unlock-all-species": 1,
        "burst-frequency": 3,
        "burst-duration": 3,
      },
    };
    const result = checkAchievements(state, []);
    expect(result).toContain("fully-loaded");
  });

  it("returns multiplied when all 4 boosters are purchased", () => {
    const state = {
      ...baseState,
      boostersPurchased: [
        "series-a-funding",
        "hype-train",
        "consciousness-clause",
        "dyson-sphere",
      ],
    };
    const result = checkAchievements(state, []);
    expect(result).toContain("multiplied");
  });

  it("returns species-collector when all 5 species are unlocked", () => {
    const state = {
      ...baseState,
      unlockedSpecies: [
        "GLORP",
        "ZAPPY",
        "CHONK",
        "WISP",
        "MEGA-GLORP",
      ] as Species[],
    };
    const result = checkAchievements(state, []);
    expect(result).toContain("species-collector");
  });

  it("returns td-1t when totalTdEarned reaches 1 trillion", () => {
    const state = { ...baseState, totalTdEarned: D(1_000_000_000_000) };
    const result = checkAchievements(state, []);
    expect(result).toContain("td-1t");
  });

  it("excludes all achievements when all are already unlocked", () => {
    const state = {
      ...baseState,
      totalClicks: 100_000,
      totalTdEarned: D(1_000_000_000_000),
      evolutionStage: 4,
      rebirthCount: 10,
      upgradeOwned: { "neural-notepad": 100 },
      comboCount: 10,
      hasOpenedPrestigeShop: true,
      prestigeUpgrades: {
        "quick-start": 3,
        "auto-buy": 1,
        "click-mastery": 10,
        "generator-discount": 3,
        "idle-boost": 5,
        "offline-efficiency": 3,
        "evolution-accelerator": 3,
        "species-memory": 5,
        "token-magnet": 5,
        "unlock-all-species": 1,
      },
      boostersPurchased: [
        "series-a-funding",
        "hype-train",
        "consciousness-clause",
        "dyson-sphere",
      ],
      unlockedSpecies: [
        "GLORP",
        "ZAPPY",
        "CHONK",
        "WISP",
        "MEGA-GLORP",
      ] as Species[],
    };
    const allIds = [
      "first-click",
      "clicks-100",
      "clicks-1000",
      "clicks-10000",
      "first-upgrade",
      "upgrades-5",
      "upgrades-10",
      "stage-1",
      "stage-2",
      "stage-3",
      "stage-4",
      "td-1k",
      "td-1m",
      "td-1b",
      "first-rebirth",
      "rebirths-5",
      "click-storm",
      "synergy-first",
      "bulk-buyer",
      "window-shopper",
      "fully-loaded",
      "multiplied",
      "species-collector",
      "td-1t",
    ];
    const result = checkAchievements(state, allIds);
    expect(result).toEqual([]);
  });
});
