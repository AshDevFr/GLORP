import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initialGameState, useGameStore } from "../store";

// We test the store integration directly rather than rendering the hook,
// since the core logic is in streakEngine (tested separately).
// Here we validate that the store actions work correctly with the streak system.

describe("daily bonus store integration", () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.setState(initialGameState);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initialGameState has correct streak defaults", () => {
    const state = useGameStore.getState();
    expect(state.lastLoginDate).toBe("");
    expect(state.streakDays).toBe(0);
    expect(state.dailyBonusMultiplier).toBe(1);
    expect(state.dailyBonusExpiresAt).toBe(0);
  });

  it("applyDailyBonus sets streak state and bonus expiry", () => {
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);

    useGameStore.getState().applyDailyBonus(3, "2026-03-15", 3, 60_000);

    const state = useGameStore.getState();
    expect(state.streakDays).toBe(3);
    expect(state.lastLoginDate).toBe("2026-03-15");
    expect(state.dailyBonusMultiplier).toBe(3);
    expect(state.dailyBonusExpiresAt).toBe(now + 60_000);
  });

  it("clearDailyBonus resets multiplier and expiry", () => {
    useGameStore.getState().applyDailyBonus(5, "2026-03-15", 5, 60_000);
    useGameStore.getState().clearDailyBonus();

    const state = useGameStore.getState();
    expect(state.dailyBonusMultiplier).toBe(1);
    expect(state.dailyBonusExpiresAt).toBe(0);
    // Streak data should persist
    expect(state.streakDays).toBe(5);
    expect(state.lastLoginDate).toBe("2026-03-15");
  });

  it("clickFeed applies daily bonus multiplier when bonus is active", () => {
    const now = 1_000_000;
    vi.spyOn(Date, "now").mockReturnValue(now);

    // Set up daily bonus (2x for 60s)
    useGameStore.getState().applyDailyBonus(1, "2026-03-15", 2, 60_000);

    // Click once — base click power is 1 TD (no generators), 2x bonus = 2 TD
    useGameStore.getState().clickFeed();

    const state = useGameStore.getState();
    // With 2x multiplier, floor(1 * 2) = 2
    expect(state.trainingData.toNumber()).toBe(2);
  });

  it("clickFeed does not apply daily bonus when expired", () => {
    const now = 1_000_000;
    vi.spyOn(Date, "now").mockReturnValue(now);

    // Set bonus that already expired
    useGameStore.setState({
      dailyBonusMultiplier: 2,
      dailyBonusExpiresAt: now - 1000, // expired 1s ago
    });

    useGameStore.getState().clickFeed();

    const state = useGameStore.getState();
    // No bonus, base click = 1 TD
    expect(state.trainingData.toNumber()).toBe(1);
  });

  it("performRebirth preserves streak state", () => {
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);

    // Set up some streak state
    useGameStore.setState({
      ...initialGameState,
      lastLoginDate: "2026-03-15",
      streakDays: 5,
      dailyBonusMultiplier: 1,
      dailyBonusExpiresAt: 0,
      // Need enough evolution to rebirth
      evolutionStage: 4,
      totalTdEarned: useGameStore.getState().totalTdEarned,
    });

    useGameStore.getState().performRebirth();

    const state = useGameStore.getState();
    // Streak should persist through rebirth
    expect(state.lastLoginDate).toBe("2026-03-15");
    expect(state.streakDays).toBe(5);
  });
});
