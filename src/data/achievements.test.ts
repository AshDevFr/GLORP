import { describe, expect, it } from "vitest";
import type { GameState } from "../store/gameStore";
import { ACHIEVEMENTS } from "./achievements";

const emptyState: GameState = {
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
    expect(a?.condition({ ...emptyState, totalTdEarned: 1_000_000 })).toBe(
      true,
    );
    expect(a?.condition({ ...emptyState, totalTdEarned: 999_999 })).toBe(false);
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
});
