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

  it("all idle lines are non-empty strings", () => {
    for (const stage of [0, 1, 2]) {
      for (const line of DIALOGUE[stage].idle) {
        expect(typeof line).toBe("string");
        expect(line.length).toBeGreaterThan(0);
      }
    }
  });

  it("has no duplicate idle lines within a stage", () => {
    for (const stage of [0, 1, 2]) {
      const lines = DIALOGUE[stage].idle;
      const unique = new Set(lines);
      expect(unique.size).toBe(lines.length);
    }
  });
});
