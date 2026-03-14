import { describe, expect, it } from "vitest";
import {
  checkMilestones,
  getMilestoneLevel,
  getMilestoneMultiplier,
  getNextMilestone,
} from "./milestoneEngine";

describe("getMilestoneLevel", () => {
  it("returns 0 below the first threshold", () => {
    expect(getMilestoneLevel(0)).toBe(0);
    expect(getMilestoneLevel(1)).toBe(0);
    expect(getMilestoneLevel(9)).toBe(0);
  });

  it("returns 1 at exactly the first threshold (10)", () => {
    expect(getMilestoneLevel(10)).toBe(1);
  });

  it("returns 1 between first and second threshold", () => {
    expect(getMilestoneLevel(11)).toBe(1);
    expect(getMilestoneLevel(24)).toBe(1);
  });

  it("returns 2 at exactly the second threshold (25)", () => {
    expect(getMilestoneLevel(25)).toBe(2);
  });

  it("returns 2 between second and third threshold", () => {
    expect(getMilestoneLevel(26)).toBe(2);
    expect(getMilestoneLevel(49)).toBe(2);
  });

  it("returns 3 at exactly the third threshold (50)", () => {
    expect(getMilestoneLevel(50)).toBe(3);
  });

  it("returns 3 between third and fourth threshold", () => {
    expect(getMilestoneLevel(51)).toBe(3);
    expect(getMilestoneLevel(99)).toBe(3);
  });

  it("returns 4 at exactly the fourth threshold (100)", () => {
    expect(getMilestoneLevel(100)).toBe(4);
  });

  it("returns 4 (max level) beyond the last threshold", () => {
    expect(getMilestoneLevel(101)).toBe(4);
    expect(getMilestoneLevel(1000)).toBe(4);
  });
});

describe("getMilestoneMultiplier", () => {
  it("returns 1 when below the first threshold", () => {
    expect(getMilestoneMultiplier(0)).toBe(1);
    expect(getMilestoneMultiplier(9)).toBe(1);
  });

  it("returns 1.5 at exactly 10 owned", () => {
    expect(getMilestoneMultiplier(10)).toBe(1.5);
  });

  it("returns 1.5 between 10 and 24 owned", () => {
    expect(getMilestoneMultiplier(15)).toBe(1.5);
    expect(getMilestoneMultiplier(24)).toBe(1.5);
  });

  it("returns 2 at exactly 25 owned", () => {
    expect(getMilestoneMultiplier(25)).toBe(2);
  });

  it("returns 2 between 25 and 49 owned", () => {
    expect(getMilestoneMultiplier(30)).toBe(2);
    expect(getMilestoneMultiplier(49)).toBe(2);
  });

  it("returns 3 at exactly 50 owned", () => {
    expect(getMilestoneMultiplier(50)).toBe(3);
  });

  it("returns 3 between 50 and 99 owned", () => {
    expect(getMilestoneMultiplier(75)).toBe(3);
    expect(getMilestoneMultiplier(99)).toBe(3);
  });

  it("returns 6 at exactly 100 owned", () => {
    expect(getMilestoneMultiplier(100)).toBe(6);
  });

  it("returns 6 beyond 100 owned", () => {
    expect(getMilestoneMultiplier(101)).toBe(6);
    expect(getMilestoneMultiplier(500)).toBe(6);
  });
});

describe("getNextMilestone", () => {
  it("returns threshold 10 when owned is 0", () => {
    const result = getNextMilestone(0);
    expect(result).toEqual({ threshold: 10, multiplier: 1.5, label: "+50%" });
  });

  it("returns threshold 10 when owned is 5", () => {
    const result = getNextMilestone(5);
    expect(result).toEqual({ threshold: 10, multiplier: 1.5, label: "+50%" });
  });

  it("returns threshold 25 when owned is exactly 10", () => {
    const result = getNextMilestone(10);
    expect(result).toEqual({ threshold: 25, multiplier: 2, label: "+100%" });
  });

  it("returns threshold 25 when owned is 15", () => {
    const result = getNextMilestone(15);
    expect(result).toEqual({ threshold: 25, multiplier: 2, label: "+100%" });
  });

  it("returns threshold 50 when owned is 25", () => {
    const result = getNextMilestone(25);
    expect(result).toEqual({ threshold: 50, multiplier: 3, label: "+200%" });
  });

  it("returns threshold 100 when owned is 50", () => {
    const result = getNextMilestone(50);
    expect(result).toEqual({ threshold: 100, multiplier: 6, label: "+500%" });
  });

  it("returns null when owned is 100 (all milestones reached)", () => {
    expect(getNextMilestone(100)).toBeNull();
  });

  it("returns null when owned exceeds 100", () => {
    expect(getNextMilestone(200)).toBeNull();
  });
});

describe("checkMilestones", () => {
  it("returns empty when no threshold is crossed", () => {
    expect(checkMilestones(0, 999, new Set())).toEqual([]);
  });

  it("returns 1_000 when crossing the first threshold", () => {
    expect(checkMilestones(0, 1_000, new Set())).toEqual([1_000]);
  });

  it("does not return thresholds already in alreadyCrossed", () => {
    expect(checkMilestones(0, 1_000, new Set([1_000]))).toEqual([]);
  });

  it("returns multiple thresholds crossed in one tick", () => {
    const result = checkMilestones(0, 1_000_000, new Set());
    expect(result).toContain(1_000);
    expect(result).toContain(10_000);
    expect(result).toContain(100_000);
    expect(result).toContain(1_000_000);
  });

  it("excludes the previous value (open lower bound)", () => {
    // prevTd === threshold means the threshold was already crossed
    expect(checkMilestones(1_000, 5_000, new Set())).toEqual([]);
  });

  it("includes the current value (closed upper bound)", () => {
    expect(checkMilestones(999, 1_000, new Set())).toEqual([1_000]);
  });

  it("filters already-crossed out of multi-crossing tick", () => {
    const already = new Set([1_000, 10_000]);
    const result = checkMilestones(0, 1_000_000, already);
    expect(result).not.toContain(1_000);
    expect(result).not.toContain(10_000);
    expect(result).toContain(100_000);
    expect(result).toContain(1_000_000);
  });
});
