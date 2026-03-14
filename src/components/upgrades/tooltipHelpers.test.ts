import { describe, expect, it } from "vitest";
import { BOOSTERS } from "../../data/boosters";
import { CLICK_UPGRADES } from "../../data/clickUpgrades";
import { UPGRADES } from "../../data/upgrades";
import {
  computeClickBonusTooltipData,
  computeGeneratorTooltipData,
  computeGlobalMultiplierTooltipData,
} from "./tooltipHelpers";

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
    expect(data.baseTdPerUnit).toBe(0.2);
    expect(data.milestoneMultiplier).toBe(1);
    expect(data.synergyMultiplier).toBe(1);
    expect(data.effectiveTdPerUnit).toBe(0.2);
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
    expect(data.effectiveTdPerUnit).toBeCloseTo(0.2 * 1.5);
    expect(data.totalTdForGenerator).toBeCloseTo(0.2 * 1.5 * 10);
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
    // notepad: 5 x 0.2 = 1 TD/s, hamster: 5 x 2 = 10 TD/s, total = 11
    const allOwned = {
      "neural-notepad": 5,
      "data-hamster-wheel": 5,
    };
    const notepadData = computeGeneratorTooltipData(neuralNotepad, 5, allOwned);
    const hamsterData = computeGeneratorTooltipData(hamsterWheel, 5, allOwned);
    expect(notepadData.percentOfTotal).toBeCloseTo((1 / 11) * 100, 1);
    expect(hamsterData.percentOfTotal).toBeCloseTo((10 / 11) * 100, 1);
    expect(notepadData.percentOfTotal + hamsterData.percentOfTotal).toBeCloseTo(
      100,
      1,
    );
  });

  it("returns correct name and icon", () => {
    const data = computeGeneratorTooltipData(neuralNotepad, 0, {});
    expect(data.name).toBe("Neural Notepad");
    expect(data.icon).toBe("📝");
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

  // ── Delta TD/s tests ──────────────────────────────────────────────────────

  describe("deltaTdPerSecond", () => {
    it("equals baseTdPerSecond for the first unit (0 → 1)", () => {
      // 0 owned → 1 owned, no milestone yet: delta = 0.2 * 1 * 1 - 0 = 0.2
      const data = computeGeneratorTooltipData(neuralNotepad, 0, {});
      expect(data.deltaTdPerSecond).toBeCloseTo(0.2);
      expect(data.milestoneWillCross).toBe(false);
    });

    it("equals baseTdPerSecond for a mid-range unit with no milestone (5 → 6)", () => {
      // No milestone active (owned < 10): delta = base * 6 * 1 - base * 5 * 1 = base
      const allOwned = { "neural-notepad": 5 };
      const data = computeGeneratorTooltipData(neuralNotepad, 5, allOwned);
      expect(data.deltaTdPerSecond).toBeCloseTo(0.2);
      expect(data.milestoneWillCross).toBe(false);
    });

    it("accounts for milestone crossing when buying the 10th unit (9 → 10)", () => {
      // Buying the 10th unit crosses the x1.5 milestone.
      // Current:   0.2 * 9  * 1   = 1.8
      // Future:    0.2 * 10 * 1.5 = 3.0
      // Delta: 3.0 - 1.8 = 1.2
      const allOwned = { "neural-notepad": 9 };
      const data = computeGeneratorTooltipData(neuralNotepad, 9, allOwned);
      expect(data.deltaTdPerSecond).toBeCloseTo(1.2);
      expect(data.milestoneWillCross).toBe(true);
    });

    it("accounts for milestone crossing when buying the 25th unit (24 → 25)", () => {
      // Buying the 25th unit crosses the x2 milestone.
      // Current:   0.2 * 24 * 1.5 = 7.2
      // Future:    0.2 * 25 * 2   = 10.0
      // Delta: 10.0 - 7.2 = 2.8
      const allOwned = { "neural-notepad": 24 };
      const data = computeGeneratorTooltipData(neuralNotepad, 24, allOwned);
      expect(data.deltaTdPerSecond).toBeCloseTo(2.8);
      expect(data.milestoneWillCross).toBe(true);
    });

    it("accounts for milestone crossing when buying the 50th unit (49 → 50)", () => {
      // Buying the 50th unit crosses the x3 milestone AND triggers the
      // neural-notepad self-synergy (+100%, ×2) simultaneously.
      // Current (49 owned):  synergyMultiplier=1  → 0.2 * 49 * 2 * 1 = 19.6
      // Future  (50 owned):  synergyMultiplier=2  → 0.2 * 50 * 3 * 2 = 60.0
      // Delta: 60.0 - 19.6 = 40.4
      const allOwned = { "neural-notepad": 49 };
      const data = computeGeneratorTooltipData(neuralNotepad, 49, allOwned);
      expect(data.deltaTdPerSecond).toBeCloseTo(40.4);
      expect(data.milestoneWillCross).toBe(true);
    });

    it("applies normal delta after milestone (owned=10, 10 → 11)", () => {
      // x1.5 milestone active, no crossing.
      // Current:   0.2 * 10 * 1.5 = 3.0
      // Future:    0.2 * 11 * 1.5 = 3.3
      // Delta: 0.3
      const allOwned = { "neural-notepad": 10 };
      const data = computeGeneratorTooltipData(neuralNotepad, 10, allOwned);
      expect(data.deltaTdPerSecond).toBeCloseTo(0.3);
      expect(data.milestoneWillCross).toBe(false);
    });

    it("applies normal delta at max milestone (owned=100, 100 → 101)", () => {
      // x6 milestone active, no further milestones.
      // The neural-notepad self-synergy (+100%, ×2) is active at 100 owned (≥50).
      // Current:   0.2 * 100 * 6 * 2 = 240.0
      // Future:    0.2 * 101 * 6 * 2 = 242.4
      // Delta: 2.4
      const allOwned = { "neural-notepad": 100 };
      const data = computeGeneratorTooltipData(neuralNotepad, 100, allOwned);
      expect(data.deltaTdPerSecond).toBeCloseTo(2.4);
      expect(data.milestoneWillCross).toBe(false);
    });

    it("milestoneWillCross is false well before a threshold", () => {
      const data = computeGeneratorTooltipData(neuralNotepad, 7, {
        "neural-notepad": 7,
      });
      expect(data.milestoneWillCross).toBe(false);
    });
  });
});

// ── computeClickBonusTooltipData tests ───────────────────────────────────────

const betterDataset = CLICK_UPGRADES.find((u) => u.id === "better-dataset");
if (!betterDataset)
  throw new Error("better-dataset click upgrade not found in CLICK_UPGRADES");
const stackOverflow = CLICK_UPGRADES.find((u) => u.id === "stack-overflow");
if (!stackOverflow)
  throw new Error("stack-overflow click upgrade not found in CLICK_UPGRADES");

describe("computeClickBonusTooltipData", () => {
  it("delta is 0 when tdPerSecond is 0 and floor of 1 already applied to both", () => {
    // Both current and future floor to 1, so delta is 0
    const data = computeClickBonusTooltipData(
      betterDataset,
      [],
      CLICK_UPGRADES,
      0,
    );
    expect(data.currentClickPower.toNumber()).toBe(1);
    expect(data.futureClickPower.toNumber()).toBe(1);
    expect(data.deltaClickPower.toNumber()).toBe(0);
  });

  it("returns correct delta when tdPerSecond is large enough to escape the floor", () => {
    // BASE_CLICK_SECONDS = 0.05; betterDataset.clickSeconds = 0.1; tdPerSecond = 100
    // currentBase = 0.05 * 100 = 5 → max(1,5) = 5
    // futureBase  = 0.15 * 100 = 15 → max(1,15) = 15
    // delta = 10
    const data = computeClickBonusTooltipData(
      betterDataset,
      [],
      CLICK_UPGRADES,
      100,
    );
    expect(data.currentClickPower.toNumber()).toBeCloseTo(5);
    expect(data.futureClickPower.toNumber()).toBeCloseTo(15);
    expect(data.deltaClickPower.toNumber()).toBeCloseTo(10);
  });

  it("already-purchased upgrade reduces future seconds correctly", () => {
    // betterDataset already purchased; buying stackOverflow (+0.15s)
    // currentSeconds = 0.05 + 0.1 = 0.15, tdPerSecond = 100
    // currentBase = 0.15 * 100 = 15
    // futureBase  = 0.30 * 100 = 30
    // delta = 15
    const data = computeClickBonusTooltipData(
      stackOverflow,
      ["better-dataset"],
      CLICK_UPGRADES,
      100,
    );
    expect(data.currentClickPower.toNumber()).toBeCloseTo(15);
    expect(data.futureClickPower.toNumber()).toBeCloseTo(30);
    expect(data.deltaClickPower.toNumber()).toBeCloseTo(15);
  });

  it("applies clickMasteryBonus to currentSeconds", () => {
    // clickMasteryBonus=1 adds 0.1s to current seconds
    // currentSeconds = 0.05 + 0.1 = 0.15, tdPerSecond = 100
    // futureSeconds  = 0.05 + 0.1 + 0.1 = 0.25
    // delta = (0.25 - 0.15) * 100 = 10
    const data = computeClickBonusTooltipData(
      betterDataset,
      [],
      CLICK_UPGRADES,
      100,
      1, // clickMasteryBonus
    );
    expect(data.deltaClickPower.toNumber()).toBeCloseTo(10);
  });

  it("applies speciesClickMultiplier to both base values", () => {
    // speciesClickMultiplier = 1.5; betterDataset; tdPerSecond = 100; no purchased
    // currentBase = 0.05 * 100 * 1.5 = 7.5
    // futureBase  = 0.15 * 100 * 1.5 = 22.5
    // delta = 15
    const data = computeClickBonusTooltipData(
      betterDataset,
      [],
      CLICK_UPGRADES,
      100,
      0,
      1.5, // speciesClickMultiplier
    );
    expect(data.currentClickPower.toNumber()).toBeCloseTo(7.5);
    expect(data.futureClickPower.toNumber()).toBeCloseTo(22.5);
    expect(data.deltaClickPower.toNumber()).toBeCloseTo(15);
  });
});

// ── computeGlobalMultiplierTooltipData tests ─────────────────────────────────

const seriesAFunding = BOOSTERS.find((b) => b.id === "series-a-funding");
if (!seriesAFunding)
  throw new Error("series-a-funding booster not found in BOOSTERS");
const hypeTrain = BOOSTERS.find((b) => b.id === "hype-train");
if (!hypeTrain) throw new Error("hype-train booster not found in BOOSTERS");

describe("computeGlobalMultiplierTooltipData", () => {
  it("doubles TD/s for the 2× booster", () => {
    const data = computeGlobalMultiplierTooltipData(seriesAFunding, 500);
    expect(data.multiplier).toBe(2);
    expect(data.currentTdPerSecond.toNumber()).toBe(500);
    expect(data.newTdPerSecond.toNumber()).toBe(1000);
  });

  it("triples TD/s for the 3× booster", () => {
    const data = computeGlobalMultiplierTooltipData(hypeTrain, 200);
    expect(data.multiplier).toBe(3);
    expect(data.currentTdPerSecond.toNumber()).toBe(200);
    expect(data.newTdPerSecond.toNumber()).toBe(600);
  });

  it("returns 0 new TD/s when current is 0", () => {
    const data = computeGlobalMultiplierTooltipData(seriesAFunding, 0);
    expect(data.currentTdPerSecond.toNumber()).toBe(0);
    expect(data.newTdPerSecond.toNumber()).toBe(0);
  });

  it("preserves current TD/s unchanged in the output", () => {
    const data = computeGlobalMultiplierTooltipData(seriesAFunding, 1234.5);
    expect(data.currentTdPerSecond.toNumber()).toBeCloseTo(1234.5);
  });

  it("handles Decimal input for currentTdPerSecond", () => {
    // Large numbers go through Decimal path
    const data = computeGlobalMultiplierTooltipData(hypeTrain, 1e15);
    expect(data.newTdPerSecond.toNumber()).toBeCloseTo(3e15);
  });
});
