import { describe, expect, it } from "vitest";
import { UPGRADES } from "../../data/upgrades";
import { computeGeneratorTooltipData } from "./tooltipHelpers";

const neuralNotepad = UPGRADES.find((u) => u.id === "neural-notepad");
if (!neuralNotepad)
  throw new Error("neural-notepad upgrade not found in UPGRADES");
const hamsterWheel = UPGRADES.find((u) => u.id === "data-hamster-wheel");
if (!hamsterWheel)
  throw new Error("data-hamster-wheel upgrade not found in UPGRADES");

describe("computeGeneratorTooltipData", () => {
  it("returns baseline values with 0 owned", () => {
    const data = computeGeneratorTooltipData(neuralNotepad, 0, {});
    expect(data.owned).toBe(0);
    expect(data.baseTdPerUnit).toBe(0.1);
    expect(data.milestoneMultiplier).toBe(1);
    expect(data.synergyMultiplier).toBe(1);
    expect(data.effectiveTdPerUnit).toBe(0.1);
    expect(data.totalTdForGenerator).toBe(0);
    expect(data.percentOfTotal).toBe(0);
  });

  it("shows next milestone threshold at 10 when owned < 10", () => {
    const data = computeGeneratorTooltipData(neuralNotepad, 5, {
      "neural-notepad": 5,
    });
    expect(data.nextMilestoneOwned).toBe(10);
    expect(data.nextMilestoneMultiplier).toBe(1.5);
    expect(data.nextMilestoneLabel).toBe("+50%");
  });

  it("applies x1.5 milestone multiplier at 10 owned", () => {
    const allOwned = { "neural-notepad": 10 };
    const data = computeGeneratorTooltipData(neuralNotepad, 10, allOwned);
    expect(data.milestoneMultiplier).toBe(1.5);
    expect(data.effectiveTdPerUnit).toBeCloseTo(0.1 * 1.5);
    expect(data.totalTdForGenerator).toBeCloseTo(0.1 * 1.5 * 10);
    expect(data.nextMilestoneOwned).toBe(25);
  });

  it("applies x2 milestone multiplier at 25 owned", () => {
    const allOwned = { "neural-notepad": 25 };
    const data = computeGeneratorTooltipData(neuralNotepad, 25, allOwned);
    expect(data.milestoneMultiplier).toBe(2);
    expect(data.nextMilestoneOwned).toBe(50);
  });

  it("applies x3 milestone multiplier at 50 owned", () => {
    const allOwned = { "neural-notepad": 50 };
    const data = computeGeneratorTooltipData(neuralNotepad, 50, allOwned);
    expect(data.milestoneMultiplier).toBe(3);
    expect(data.nextMilestoneOwned).toBe(100);
  });

  it("returns null next milestone when at max milestone (100 owned)", () => {
    const allOwned = { "neural-notepad": 100 };
    const data = computeGeneratorTooltipData(neuralNotepad, 100, allOwned);
    expect(data.milestoneMultiplier).toBe(6);
    expect(data.nextMilestoneOwned).toBeNull();
    expect(data.nextMilestoneMultiplier).toBeNull();
    expect(data.nextMilestoneLabel).toBeNull();
  });

  it("shows 100% when only one generator type is owned", () => {
    const allOwned = { "neural-notepad": 5 };
    const data = computeGeneratorTooltipData(neuralNotepad, 5, allOwned);
    expect(data.percentOfTotal).toBeCloseTo(100);
  });

  it("computes correct % share with two generators", () => {
    // notepad: 5 x 0.1 = 0.5 TD/s, hamster: 5 x 0.5 = 2.5 TD/s, total = 3.0
    const allOwned = {
      "neural-notepad": 5,
      "data-hamster-wheel": 5,
    };
    const notepadData = computeGeneratorTooltipData(neuralNotepad, 5, allOwned);
    const hamsterData = computeGeneratorTooltipData(hamsterWheel, 5, allOwned);
    expect(notepadData.percentOfTotal).toBeCloseTo((0.5 / 3.0) * 100, 1);
    expect(hamsterData.percentOfTotal).toBeCloseTo((2.5 / 3.0) * 100, 1);
    expect(notepadData.percentOfTotal + hamsterData.percentOfTotal).toBeCloseTo(
      100,
      1,
    );
  });

  it("returns correct name and icon", () => {
    const data = computeGeneratorTooltipData(neuralNotepad, 0, {});
    expect(data.name).toBe("Neural Notepad");
    expect(data.icon).toBe("\uD83D\uDCDD");
  });

  it("effectiveTdPerUnit equals baseTdPerUnit when no multipliers apply", () => {
    const data = computeGeneratorTooltipData(neuralNotepad, 3, {
      "neural-notepad": 3,
    });
    expect(data.effectiveTdPerUnit).toBeCloseTo(data.baseTdPerUnit);
  });

  it("totalTdForGenerator is effectiveTdPerUnit x owned", () => {
    const allOwned = { "neural-notepad": 10 };
    const data = computeGeneratorTooltipData(neuralNotepad, 10, allOwned);
    expect(data.totalTdForGenerator).toBeCloseTo(
      data.effectiveTdPerUnit * data.owned,
    );
  });
});
