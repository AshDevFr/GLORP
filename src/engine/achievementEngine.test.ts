import { describe, expect, it } from "vitest";
import type { GameState } from "../store/gameStore";
import { checkAchievements } from "./achievementEngine";

const baseState: GameState = {
  trainingData: 0,
  totalClicks: 0,
  totalTdEarned: 0,
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
    const state = { ...baseState, totalTdEarned: 1_000_000 };
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

  it("excludes all achievements when all are already unlocked", () => {
    const state = {
      ...baseState,
      totalClicks: 100_000,
      totalTdEarned: 2_000_000_000,
      evolutionStage: 4,
      rebirthCount: 10,
      upgradeOwned: { a: 10 },
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
    ];
    const result = checkAchievements(state, allIds);
    expect(result).toEqual([]);
  });
});
