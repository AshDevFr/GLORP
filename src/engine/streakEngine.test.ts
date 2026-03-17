import { describe, expect, it } from "vitest";
import {
  computeStreakUpdate,
  DAILY_BONUS_DURATION_MS,
  daysBetween,
  getStreakMultiplier,
  STREAK_TIERS,
  toUTCDateString,
} from "./streakEngine";

describe("toUTCDateString", () => {
  it("formats a timestamp as YYYY-MM-DD in UTC", () => {
    // 2026-03-15 14:30:00 UTC
    const ts = Date.UTC(2026, 2, 15, 14, 30, 0);
    expect(toUTCDateString(ts)).toBe("2026-03-15");
  });

  it("handles midnight boundary correctly", () => {
    // 2026-03-15 23:59:59 UTC
    const ts = Date.UTC(2026, 2, 15, 23, 59, 59);
    expect(toUTCDateString(ts)).toBe("2026-03-15");
  });

  it("handles start of day correctly", () => {
    // 2026-03-16 00:00:01 UTC
    const ts = Date.UTC(2026, 2, 16, 0, 0, 1);
    expect(toUTCDateString(ts)).toBe("2026-03-16");
  });

  it("pads single-digit months and days", () => {
    const ts = Date.UTC(2026, 0, 5, 12, 0, 0);
    expect(toUTCDateString(ts)).toBe("2026-01-05");
  });
});

describe("daysBetween", () => {
  it("returns 0 for the same date", () => {
    expect(daysBetween("2026-03-15", "2026-03-15")).toBe(0);
  });

  it("returns 1 for consecutive days", () => {
    expect(daysBetween("2026-03-15", "2026-03-16")).toBe(1);
  });

  it("returns correct gap for multi-day difference", () => {
    expect(daysBetween("2026-03-10", "2026-03-15")).toBe(5);
  });

  it("is symmetric (order does not matter)", () => {
    expect(daysBetween("2026-03-16", "2026-03-10")).toBe(6);
  });

  it("handles month boundaries", () => {
    expect(daysBetween("2026-02-28", "2026-03-01")).toBe(1);
  });

  it("handles year boundaries", () => {
    expect(daysBetween("2025-12-31", "2026-01-01")).toBe(1);
  });
});

describe("getStreakMultiplier", () => {
  it("returns 1 for streak of 0", () => {
    expect(getStreakMultiplier(0)).toBe(1);
  });

  it("returns 2x for day 1", () => {
    expect(getStreakMultiplier(1)).toBe(2);
  });

  it("returns 2x for day 2", () => {
    expect(getStreakMultiplier(2)).toBe(2);
  });

  it("returns 3x for day 3", () => {
    expect(getStreakMultiplier(3)).toBe(3);
  });

  it("returns 3x for day 6", () => {
    expect(getStreakMultiplier(6)).toBe(3);
  });

  it("returns 5x for day 7", () => {
    expect(getStreakMultiplier(7)).toBe(5);
  });

  it("returns 5x for day 30 (long streak)", () => {
    expect(getStreakMultiplier(30)).toBe(5);
  });

  it("returns 1 for negative values", () => {
    expect(getStreakMultiplier(-1)).toBe(1);
  });
});

describe("computeStreakUpdate", () => {
  it("first ever login starts streak at 1 with bonus", () => {
    const now = Date.UTC(2026, 2, 15, 10, 0, 0);
    const result = computeStreakUpdate("", 0, now);
    expect(result).toEqual({
      newStreakDays: 1,
      newLastLoginDate: "2026-03-15",
      showBonus: true,
      multiplier: 2,
    });
  });

  it("same-day login does not trigger bonus", () => {
    const now = Date.UTC(2026, 2, 15, 18, 0, 0);
    const result = computeStreakUpdate("2026-03-15", 3, now);
    expect(result).toEqual({
      newStreakDays: 3,
      newLastLoginDate: "2026-03-15",
      showBonus: false,
      multiplier: 1,
    });
  });

  it("next-day login increments streak and shows bonus", () => {
    const now = Date.UTC(2026, 2, 16, 8, 0, 0);
    const result = computeStreakUpdate("2026-03-15", 2, now);
    expect(result).toEqual({
      newStreakDays: 3,
      newLastLoginDate: "2026-03-16",
      showBonus: true,
      multiplier: 3, // day 3 → 3x
    });
  });

  it("2-day gap resets streak to 1", () => {
    const now = Date.UTC(2026, 2, 17, 12, 0, 0);
    const result = computeStreakUpdate("2026-03-15", 5, now);
    expect(result).toEqual({
      newStreakDays: 1,
      newLastLoginDate: "2026-03-17",
      showBonus: true,
      multiplier: 2, // day 1 → 2x
    });
  });

  it("large gap (week+) resets streak to 1", () => {
    const now = Date.UTC(2026, 2, 25, 12, 0, 0);
    const result = computeStreakUpdate("2026-03-15", 10, now);
    expect(result).toEqual({
      newStreakDays: 1,
      newLastLoginDate: "2026-03-25",
      showBonus: true,
      multiplier: 2,
    });
  });

  it("streak day 7 gives 5x multiplier", () => {
    const now = Date.UTC(2026, 2, 22, 10, 0, 0);
    const result = computeStreakUpdate("2026-03-21", 6, now);
    expect(result).toEqual({
      newStreakDays: 7,
      newLastLoginDate: "2026-03-22",
      showBonus: true,
      multiplier: 5,
    });
  });

  it("streak continuation across month boundary", () => {
    const now = Date.UTC(2026, 3, 1, 10, 0, 0); // April 1
    const result = computeStreakUpdate("2026-03-31", 4, now);
    expect(result).toEqual({
      newStreakDays: 5,
      newLastLoginDate: "2026-04-01",
      showBonus: true,
      multiplier: 3, // day 5 → 3x
    });
  });
});

describe("constants", () => {
  it("DAILY_BONUS_DURATION_MS is 60 seconds", () => {
    expect(DAILY_BONUS_DURATION_MS).toBe(60_000);
  });

  it("STREAK_TIERS covers all positive integers", () => {
    // Day 1 through 100 should all have a tier
    for (let d = 1; d <= 100; d++) {
      const tier = STREAK_TIERS.find((t) => d >= t.minDays && d <= t.maxDays);
      expect(tier).toBeDefined();
    }
  });
});
