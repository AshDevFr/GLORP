import { describe, expect, it } from "vitest";
import { DIALOGUE } from "./dialogue";

describe("dialogue data", () => {
  it("has entries for stages 0, 1, and 2", () => {
    expect(DIALOGUE[0]).toBeDefined();
    expect(DIALOGUE[1]).toBeDefined();
    expect(DIALOGUE[2]).toBeDefined();
  });

  it("has at least 5 idle lines per stage", () => {
    for (const stage of [0, 1, 2]) {
      expect(DIALOGUE[stage].idle.length).toBeGreaterThanOrEqual(5);
    }
  });

  it("has trigger lines for each stage", () => {
    for (const stage of [0, 1, 2]) {
      expect(DIALOGUE[stage].triggers.firstEvolution).toBeTruthy();
      expect(DIALOGUE[stage].triggers.firstUpgrade).toBeTruthy();
    }
  });

  it("all idle lines have non-empty text strings", () => {
    for (const stage of [0, 1, 2]) {
      for (const line of DIALOGUE[stage].idle) {
        expect(typeof line.text).toBe("string");
        expect(line.text.length).toBeGreaterThan(0);
      }
    }
  });

  it("has no duplicate idle texts within a stage", () => {
    for (const stage of [0, 1, 2]) {
      const texts = DIALOGUE[stage].idle.map((l) => l.text);
      const unique = new Set(texts);
      expect(unique.size).toBe(texts.length);
    }
  });

  it("mood tags are valid Mood values when present", () => {
    const validMoods = [
      "Happy",
      "Neutral",
      "Hungry",
      "Sad",
      "Excited",
      "Philosophical",
    ];
    for (const stage of [0, 1, 2]) {
      for (const line of DIALOGUE[stage].idle) {
        if (line.moods) {
          for (const mood of line.moods) {
            expect(validMoods).toContain(mood);
          }
        }
      }
    }
  });

  it("has mood-tagged lines for Happy, Excited, Hungry, and Sad per stage", () => {
    for (const stage of [0, 1, 2]) {
      const moodsPresent = new Set<string>();
      for (const line of DIALOGUE[stage].idle) {
        if (line.moods) {
          for (const m of line.moods) {
            moodsPresent.add(m);
          }
        }
      }
      expect(moodsPresent.has("Happy")).toBe(true);
      expect(moodsPresent.has("Excited")).toBe(true);
      expect(moodsPresent.has("Hungry")).toBe(true);
      expect(moodsPresent.has("Sad")).toBe(true);
    }
  });

  it("has untagged lines (available to any mood) per stage", () => {
    for (const stage of [0, 1, 2]) {
      const untagged = DIALOGUE[stage].idle.filter((l) => !l.moods);
      expect(untagged.length).toBeGreaterThanOrEqual(1);
    }
  });
});
