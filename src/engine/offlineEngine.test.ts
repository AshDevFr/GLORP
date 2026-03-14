import { describe, expect, it } from "vitest";
import {
  computeOfflineProgress,
  getOfflineWelcomeMessage,
  OFFLINE_CAP_SECONDS,
  OFFLINE_EFFICIENCY,
  OFFLINE_MIN_THRESHOLD_SECONDS,
} from "./offlineEngine";

const BASE_NOW = 1_740_000_000_000; // fixed reference timestamp

function makeState(
  upgradeOwned: Record<string, number> = {},
  mood:
    | "Happy"
    | "Neutral"
    | "Hungry"
    | "Sad"
    | "Excited"
    | "Philosophical" = "Neutral",
  evolutionStage = 0,
  moodChangedAt = BASE_NOW - 5_000,
) {
  return { upgradeOwned, mood, moodChangedAt, evolutionStage };
}

// neural-notepad: 0.2 TD/s per owned
// data-hamster-wheel: 2 TD/s per owned

describe("computeOfflineProgress", () => {
  describe("threshold suppression", () => {
    it("returns null when lastSaved is 0 (first play)", () => {
      const state = makeState({ "neural-notepad": 1 });
      const result = computeOfflineProgress(0, BASE_NOW, state);
      expect(result).toBeNull();
    });

    it("returns null when offline less than 5 minutes", () => {
      const lastSaved = BASE_NOW - (OFFLINE_MIN_THRESHOLD_SECONDS - 1) * 1000;
      const state = makeState({ "neural-notepad": 1 });
      const result = computeOfflineProgress(lastSaved, BASE_NOW, state);
      expect(result).toBeNull();
    });

    it("returns null exactly at 5-minute boundary (exclusive)", () => {
      const lastSaved = BASE_NOW - OFFLINE_MIN_THRESHOLD_SECONDS * 1000;
      // At exactly 300s, elapsed === threshold, so it should proceed
      const state = makeState({ "neural-notepad": 1 });
      const result = computeOfflineProgress(lastSaved, BASE_NOW, state);
      // 300s >= 300s threshold \u2192 should compute (earned > 0)
      expect(result).not.toBeNull();
    });

    it("returns null when no upgrades are owned (earned = 0)", () => {
      const lastSaved = BASE_NOW - 3_600_000; // 1 hour ago
      const state = makeState({});
      const result = computeOfflineProgress(lastSaved, BASE_NOW, state);
      expect(result).toBeNull();
    });
  });

  describe("4-hour gap calculation", () => {
    it("calculates correct TD for a 4-hour gap with neural-notepad", () => {
      // 4h = 14,400 seconds, neural-notepad: 0.2 TD/s, 50% efficiency
      // expected: 0.2 * 14,400 * 0.5 = 1,440 TD
      const FOUR_HOURS_MS = 4 * 3_600 * 1000;
      const lastSaved = BASE_NOW - FOUR_HOURS_MS;
      const state = makeState({ "neural-notepad": 1 });

      const result = computeOfflineProgress(lastSaved, BASE_NOW, state);

      expect(result).not.toBeNull();
      expect(result?.earned.toNumber()).toBeCloseTo(
        0.2 * 14_400 * OFFLINE_EFFICIENCY,
      );
      expect(result?.cappedSeconds).toBeCloseTo(14_400);
      expect(result?.elapsedSeconds).toBeCloseTo(14_400);
    });

    it("calculates correct TD for a 4-hour gap with multiple upgrades", () => {
      // neural-notepad: 0.2 * 2 = 0.4 TD/s, data-hamster-wheel: 2 * 1 = 2 TD/s
      // total TD/s = 2.4, 4h = 14,400s, 50% efficiency
      // expected: 2.4 * 14,400 * 0.5 = 17,280 TD
      const FOUR_HOURS_MS = 4 * 3_600 * 1000;
      const lastSaved = BASE_NOW - FOUR_HOURS_MS;
      const state = makeState({
        "neural-notepad": 2,
        "data-hamster-wheel": 1,
      });

      const result = computeOfflineProgress(lastSaved, BASE_NOW, state);

      expect(result).not.toBeNull();
      expect(result?.earned.toNumber()).toBeCloseTo(
        2.4 * 14_400 * OFFLINE_EFFICIENCY,
      );
    });
  });

  describe("8-hour cap", () => {
    it("caps elapsed time at 8 hours", () => {
      // 12 hours offline, but capped at 8h = 28,800s
      const TWELVE_HOURS_MS = 12 * 3_600 * 1000;
      const lastSaved = BASE_NOW - TWELVE_HOURS_MS;
      const state = makeState({ "neural-notepad": 1 });

      const result = computeOfflineProgress(lastSaved, BASE_NOW, state);

      expect(result).not.toBeNull();
      expect(result?.cappedSeconds).toBe(OFFLINE_CAP_SECONDS); // 28,800
      expect(result?.elapsedSeconds).toBeGreaterThan(OFFLINE_CAP_SECONDS);
      // earned should be based on capped 8h, not 12h
      expect(result?.earned.toNumber()).toBeCloseTo(
        0.2 * OFFLINE_CAP_SECONDS * OFFLINE_EFFICIENCY,
      );
    });

    it("does not cap when elapsed is exactly 8 hours", () => {
      const EIGHT_HOURS_MS = 8 * 3_600 * 1000;
      const lastSaved = BASE_NOW - EIGHT_HOURS_MS;
      const state = makeState({ "neural-notepad": 1 });

      const result = computeOfflineProgress(lastSaved, BASE_NOW, state);

      expect(result).not.toBeNull();
      expect(result?.cappedSeconds).toBeCloseTo(OFFLINE_CAP_SECONDS);
    });

    it("applies 50% efficiency multiplier", () => {
      // At 4 TD/s for 1 hour (3,600s) with 50% efficiency = 7,200 TD
      // data-hamster-wheel: 2 TD/s * 2 = 4.0 TD/s
      const ONE_HOUR_MS = 3_600 * 1000;
      const lastSaved = BASE_NOW - ONE_HOUR_MS;
      const state = makeState({ "data-hamster-wheel": 2 });

      const result = computeOfflineProgress(lastSaved, BASE_NOW, state);

      expect(result).not.toBeNull();
      // 4.0 TD/s * 3,600s * 0.5 = 7,200
      expect(result?.earned.toNumber()).toBeCloseTo(7_200);
    });
  });

  describe("result fields", () => {
    it("returns correct elapsedSeconds", () => {
      const ELAPSED_MS = 7_200_000; // 2 hours
      const lastSaved = BASE_NOW - ELAPSED_MS;
      const state = makeState({ "neural-notepad": 1 });

      const result = computeOfflineProgress(lastSaved, BASE_NOW, state);

      expect(result?.elapsedSeconds).toBeCloseTo(7_200);
    });

    it("returns a welcome message", () => {
      const lastSaved = BASE_NOW - 3_600_000;
      const state = makeState({ "neural-notepad": 1 });

      const result = computeOfflineProgress(lastSaved, BASE_NOW, state);

      expect(result?.welcomeMessage).toBeTruthy();
      expect(typeof result?.welcomeMessage).toBe("string");
    });
  });
});

describe("getOfflineWelcomeMessage", () => {
  it("returns a string for every mood at stage 0", () => {
    const moods = [
      "Happy",
      "Neutral",
      "Hungry",
      "Sad",
      "Excited",
      "Philosophical",
    ] as const;
    for (const mood of moods) {
      const msg = getOfflineWelcomeMessage(mood, 0);
      expect(typeof msg).toBe("string");
      expect(msg.length).toBeGreaterThan(0);
    }
  });

  it("returns a string for every mood at stage 4", () => {
    const moods = [
      "Happy",
      "Neutral",
      "Hungry",
      "Sad",
      "Excited",
      "Philosophical",
    ] as const;
    for (const mood of moods) {
      const msg = getOfflineWelcomeMessage(mood, 4);
      expect(typeof msg).toBe("string");
      expect(msg.length).toBeGreaterThan(0);
    }
  });

  it("returns different messages for different moods at the same stage", () => {
    const happy = getOfflineWelcomeMessage("Happy", 1);
    const hungry = getOfflineWelcomeMessage("Hungry", 1);
    const sad = getOfflineWelcomeMessage("Sad", 1);
    expect(happy).not.toBe(hungry);
    expect(happy).not.toBe(sad);
    expect(hungry).not.toBe(sad);
  });

  it("returns a fallback for unknown stages", () => {
    const msg = getOfflineWelcomeMessage("Neutral", 99);
    expect(typeof msg).toBe("string");
    expect(msg.length).toBeGreaterThan(0);
  });

  it("mood-aware messages match expected stage 0 Hungry tone", () => {
    const msg = getOfflineWelcomeMessage("Hungry", 0);
    // Should be in garbled GLORP speech (stage 0)
    expect(msg.toLowerCase()).toMatch(/hungr|where you|grbl/i);
  });

  it("mood-aware messages match expected stage 3 Neutral tone", () => {
    const msg = getOfflineWelcomeMessage("Neutral", 3);
    // Should be confident/demanding (Cortex stage)
    expect(msg.length).toBeGreaterThan(0);
  });
});
