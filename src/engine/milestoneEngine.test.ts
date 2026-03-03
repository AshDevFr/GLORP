import { describe, expect, it } from "vitest";
import { checkMilestones, MILESTONE_THRESHOLDS } from "./milestoneEngine";

describe("MILESTONE_THRESHOLDS", () => {
  it("contains the expected thresholds in ascending order", () => {
    expect(MILESTONE_THRESHOLDS).toEqual([
      1_000,
      10_000,
      100_000,
      1_000_000,
      10_000_000,
      100_000_000,
      1_000_000_000,
      1_000_000_000_000,
    ]);
  });
});

describe("checkMilestones", () => {
  const empty = new Set<number>();

  it("returns empty array when no milestones are crossed", () => {
    expect(checkMilestones(0, 999, empty)).toEqual([]);
    expect(checkMilestones(1_000, 1_500, empty)).toEqual([]);
  });

  it("detects a single milestone crossing", () => {
    expect(checkMilestones(999, 1_000, empty)).toEqual([1_000]);
    expect(checkMilestones(0, 1_000, empty)).toEqual([1_000]);
    expect(checkMilestones(500_000, 1_000_000, empty)).toEqual([1_000_000]);
  });

  it("detects multiple milestones crossed in a single tick", () => {
    // Jump from 0 to 15K crosses both 1K and 10K
    const result = checkMilestones(0, 15_000, empty);
    expect(result).toContain(1_000);
    expect(result).toContain(10_000);
    expect(result).not.toContain(100_000);
  });

  it("excludes already-crossed milestones", () => {
    const crossed = new Set([1_000, 10_000]);
    expect(checkMilestones(0, 50_000, crossed)).toEqual([]);
    expect(checkMilestones(0, 100_000, crossed)).toEqual([100_000]);
  });

  it("detects the trillion threshold", () => {
    expect(checkMilestones(999_999_999_999, 1_000_000_000_000, empty)).toEqual(
      [1_000_000_000_000],
    );
  });

  it("returns empty when prevTd exactly equals a threshold (already at it)", () => {
    // Must strictly cross: prevTd < t and newTd >= t
    expect(checkMilestones(1_000, 2_000, empty)).toEqual([]);
  });

  it("detects crossing when newTd exactly equals threshold", () => {
    expect(checkMilestones(999, 1_000, empty)).toEqual([1_000]);
  });

  it("handles zero → zero with no milestones", () => {
    expect(checkMilestones(0, 0, empty)).toEqual([]);
  });
});
