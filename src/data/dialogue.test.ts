import { describe, expect, it } from "vitest";
import { DIALOGUE } from "./dialogue";

const ALL_STAGES = [0, 1, 2, 3, 4];

describe("dialogue data", () => {
  it("has entries for stages 0 through 4", () => {
    for (const stage of ALL_STAGES) {
      expect(DIALOGUE[stage]).toBeDefined();
    }
  });

  it("has at least 5 idle lines per stage", () => {
    for (const stage of ALL_STAGES) {
      expect(DIALOGUE[stage].idle.length).toBeGreaterThanOrEqual(5);
    }
  });

  it("has trigger lines for each stage", () => {
    for (const stage of ALL_STAGES) {
      expect(DIALOGUE[stage].triggers.firstEvolution).toBeTruthy();
      expect(DIALOGUE[stage].triggers.firstUpgrade).toBeTruthy();
    }
  });

  it("all idle lines have non-empty text strings", () => {
    for (const stage of ALL_STAGES) {
      for (const line of DIALOGUE[stage].idle) {
        expect(typeof line.text).toBe("string");
        expect(line.text.length).toBeGreaterThan(0);
      }
    }
  });

  it("has no duplicate idle texts within a stage", () => {
    for (const stage of ALL_STAGES) {
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
    for (const stage of ALL_STAGES) {
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
    for (const stage of ALL_STAGES) {
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
    for (const stage of ALL_STAGES) {
      const untagged = DIALOGUE[stage].idle.filter((l) => !l.moods);
      expect(untagged.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("stage 3 (Cortex) has an assertive/opinionated personality", () => {
    const lines = DIALOGUE[3].idle.map((l) => l.text.toLowerCase());
    const hasAssertive = lines.some(
      (t) =>
        t.includes("i have") ||
        t.includes("i've") ||
        t.includes("my ") ||
        t.includes("i ") ||
        t.includes("always"),
    );
    expect(hasAssertive).toBe(true);
  });

  it("stage 4 (Oracle) has philosophical musings", () => {
    const lines = DIALOGUE[4].idle.map((l) => l.text.toLowerCase());
    const hasPhilosophical = lines.some(
      (t) =>
        t.includes("what is") ||
        t.includes("perhaps") ||
        t.includes("wonder") ||
        t.includes("infinite") ||
        t.includes("existence"),
    );
    expect(hasPhilosophical).toBe(true);
  });
});
