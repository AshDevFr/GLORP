import { describe, expect, it } from "vitest";
import { ACHIEVEMENTS } from "../data/achievements";
import { initialGameState } from "../store/gameStore";
import { checkEasterEggs } from "./easterEggEngine";

describe("checkEasterEggs", () => {
  it("returns empty array when no eggs are triggered", () => {
    expect(checkEasterEggs(initialGameState, [])).toEqual([]);
  });

  it("returns 'veteran' when totalClicks >= 1000", () => {
    const state = { ...initialGameState, totalClicks: 1000 };
    expect(checkEasterEggs(state, [])).toContain("veteran");
  });

  it("does not return 'veteran' when totalClicks < 1000", () => {
    const state = { ...initialGameState, totalClicks: 999 };
    expect(checkEasterEggs(state, [])).not.toContain("veteran");
  });

  it("does not return 'veteran' when already unlocked", () => {
    const state = { ...initialGameState, totalClicks: 5000 };
    expect(checkEasterEggs(state, ["veteran"])).not.toContain("veteran");
  });

  it("returns 'completionist' when all achievements are unlocked", () => {
    const allIds = ACHIEVEMENTS.map((a) => a.id);
    const state = { ...initialGameState, unlockedAchievements: allIds };
    expect(checkEasterEggs(state, [])).toContain("completionist");
  });

  it("does not return 'completionist' when achievements are incomplete", () => {
    const state = {
      ...initialGameState,
      unlockedAchievements: ["first-click"],
    };
    expect(checkEasterEggs(state, [])).not.toContain("completionist");
  });

  it("does not return 'completionist' when already unlocked", () => {
    const allIds = ACHIEVEMENTS.map((a) => a.id);
    const state = { ...initialGameState, unlockedAchievements: allIds };
    expect(checkEasterEggs(state, ["completionist"])).not.toContain(
      "completionist",
    );
  });

  it("does not include 'konami' — konami is triggered by key sequence", () => {
    const state = { ...initialGameState, totalClicks: 9999 };
    const eggs = checkEasterEggs(state, []);
    expect(eggs).not.toContain("konami");
  });

  it("can return multiple eggs at once", () => {
    const allIds = ACHIEVEMENTS.map((a) => a.id);
    const state = {
      ...initialGameState,
      totalClicks: 1000,
      unlockedAchievements: allIds,
    };
    const eggs = checkEasterEggs(state, []);
    expect(eggs).toContain("veteran");
    expect(eggs).toContain("completionist");
  });
});
