import { describe, expect, it, vi } from "vitest";
import {
  getClickMood,
  getDecayedMood,
  getUpgradePurchaseMood,
  type Mood,
} from "./moodEngine";

describe("moodEngine", () => {
  describe("getDecayedMood", () => {
    const BASE_TIME = 1_000_000;

    it("returns Happy when less than 60s has passed", () => {
      expect(getDecayedMood("Happy", BASE_TIME, BASE_TIME + 59_999)).toBe(
        "Happy",
      );
    });

    it("decays Happy to Neutral after 60s", () => {
      expect(getDecayedMood("Happy", BASE_TIME, BASE_TIME + 60_000)).toBe(
        "Neutral",
      );
    });

    it("decays Excited to Neutral after 60s", () => {
      expect(getDecayedMood("Excited", BASE_TIME, BASE_TIME + 60_000)).toBe(
        "Neutral",
      );
    });

    it("returns Neutral when less than 120s has passed", () => {
      expect(getDecayedMood("Neutral", BASE_TIME, BASE_TIME + 119_999)).toBe(
        "Neutral",
      );
    });

    it("decays Neutral to Hungry after 120s", () => {
      expect(getDecayedMood("Neutral", BASE_TIME, BASE_TIME + 120_000)).toBe(
        "Hungry",
      );
    });

    it("decays Hungry to Sad after 120s", () => {
      expect(getDecayedMood("Hungry", BASE_TIME, BASE_TIME + 120_000)).toBe(
        "Sad",
      );
    });

    it("does not decay Sad further", () => {
      expect(getDecayedMood("Sad", BASE_TIME, BASE_TIME + 300_000)).toBe("Sad");
    });

    it("does not decay Philosophical", () => {
      expect(
        getDecayedMood("Philosophical", BASE_TIME, BASE_TIME + 300_000),
      ).toBe("Philosophical");
    });

    it("handles zero elapsed time", () => {
      expect(getDecayedMood("Happy", BASE_TIME, BASE_TIME)).toBe("Happy");
    });
  });

  describe("getClickMood", () => {
    it("returns either Happy or Excited", () => {
      const results = new Set<Mood>();
      for (let i = 0; i < 100; i++) {
        results.add(getClickMood());
      }
      expect(results.size).toBeGreaterThanOrEqual(1);
      for (const mood of results) {
        expect(["Happy", "Excited"]).toContain(mood);
      }
    });

    it("returns Happy when random < 0.5", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.3);
      expect(getClickMood()).toBe("Happy");
      vi.restoreAllMocks();
    });

    it("returns Excited when random >= 0.5", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.7);
      expect(getClickMood()).toBe("Excited");
      vi.restoreAllMocks();
    });
  });

  describe("getUpgradePurchaseMood", () => {
    it("returns Excited", () => {
      expect(getUpgradePurchaseMood()).toBe("Excited");
    });
  });
});
