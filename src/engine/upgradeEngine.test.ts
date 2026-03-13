import { describe, expect, it } from "vitest";
import type { Booster } from "../data/boosters";
import type { Upgrade } from "../data/upgrades";
import {
  COST_MULTIPLIER,
  computeBoosterMultiplier,
  getBulkCost,
  getMaxAffordable,
  getTotalTdPerSecond,
  getUpgradeCost,
} from "./upgradeEngine";

const mockUpgrade: Upgrade = {
  id: "test-upgrade",
  name: "Test Upgrade",
  description: "A test upgrade",
  baseCost: 100,
  baseTdPerSecond: 1.5,
  tier: "garage-lab",
  icon: "\uD83E\uDDEA",
  unlockStage: 0,
};

const mockUpgrade2: Upgrade = {
  id: "test-upgrade-2",
  name: "Test Upgrade 2",
  description: "Another test upgrade",
  baseCost: 500,
  baseTdPerSecond: 5,
  tier: "startup",
  icon: "\uD83D\uDD2C",
  unlockStage: 0,
};

describe("getUpgradeCost", () => {
  it("returns baseCost when owned is 0", () => {
    expect(getUpgradeCost(mockUpgrade, 0)).toBe(100);
  });

  it("scales cost by 1.15 for each owned", () => {
    expect(getUpgradeCost(mockUpgrade, 1)).toBe(Math.floor(100 * 1.15));
  });

  it("scales exponentially for multiple owned", () => {
    expect(getUpgradeCost(mockUpgrade, 5)).toBe(Math.floor(100 * 1.15 ** 5));
  });

  it("scales correctly for 10 owned", () => {
    expect(getUpgradeCost(mockUpgrade, 10)).toBe(Math.floor(100 * 1.15 ** 10));
  });

  it("floors the result to an integer", () => {
    const cost = getUpgradeCost(mockUpgrade, 1);
    expect(Number.isInteger(cost)).toBe(true);
  });

  it("works with different base costs", () => {
    expect(getUpgradeCost(mockUpgrade2, 0)).toBe(500);
    expect(getUpgradeCost(mockUpgrade2, 3)).toBe(Math.floor(500 * 1.15 ** 3));
  });

  it("applies custom costMultiplier", () => {
    expect(getUpgradeCost(mockUpgrade, 1, 1.1)).toBe(Math.floor(100 * 1.1));
  });

  it("defaults to COST_MULTIPLIER when costMultiplier is omitted", () => {
    expect(getUpgradeCost(mockUpgrade, 3)).toBe(
      getUpgradeCost(mockUpgrade, 3, COST_MULTIPLIER),
    );
  });
});

describe("getBulkCost", () => {
  it("returns 0 for count 0", () => {
    expect(getBulkCost(mockUpgrade, 0, 0)).toBe(0);
  });

  it("returns negative count as 0", () => {
    expect(getBulkCost(mockUpgrade, 0, -1)).toBe(0);
  });

  it("matches getUpgradeCost for count 1 at 0 owned", () => {
    expect(getBulkCost(mockUpgrade, 0, 1)).toBe(getUpgradeCost(mockUpgrade, 0));
  });

  it("matches getUpgradeCost for count 1 at 5 owned", () => {
    expect(getBulkCost(mockUpgrade, 5, 1)).toBe(getUpgradeCost(mockUpgrade, 5));
  });

  it("is greater than single cost and less than 10x the last cost for count 10", () => {
    const singleCost = getBulkCost(mockUpgrade, 0, 1);
    const tenthCost = getUpgradeCost(mockUpgrade, 9);
    const bulk10 = getBulkCost(mockUpgrade, 0, 10);
    expect(bulk10).toBeGreaterThan(singleCost);
    expect(bulk10).toBeLessThan(10 * tenthCost + 1);
  });

  it("is more expensive when owning more already", () => {
    expect(getBulkCost(mockUpgrade, 10, 5)).toBeGreaterThan(
      getBulkCost(mockUpgrade, 0, 5),
    );
  });

  it("returns an integer", () => {
    expect(Number.isInteger(getBulkCost(mockUpgrade, 3, 7))).toBe(true);
  });

  it("works with different base costs", () => {
    expect(getBulkCost(mockUpgrade2, 0, 1)).toBe(500);
    // count=2 should cost more than 1 but less than 2x the second-upgrade cost
    const bulk2 = getBulkCost(mockUpgrade2, 0, 2);
    expect(bulk2).toBeGreaterThan(500);
    expect(bulk2).toBeLessThan(2 * Math.floor(500 * COST_MULTIPLIER) + 1);
  });
});

describe("getMaxAffordable", () => {
  it("returns 0 for 0 budget", () => {
    expect(getMaxAffordable(mockUpgrade, 0, 0)).toBe(0);
  });

  it("returns 0 when budget is less than first cost", () => {
    expect(getMaxAffordable(mockUpgrade, 0, 99)).toBe(0);
  });

  it("returns 1 when budget exactly covers first cost", () => {
    expect(getMaxAffordable(mockUpgrade, 0, 100)).toBe(1);
  });

  it("returns a value consistent with getBulkCost for count 10", () => {
    const count = 10;
    const cost = getBulkCost(mockUpgrade, 0, count);
    // With the exact budget, we should get at least count-1 affordable
    expect(getMaxAffordable(mockUpgrade, 0, cost)).toBeGreaterThanOrEqual(
      count - 1,
    );
  });

  it("returns 0 when budget is one less than first cost at 5 owned", () => {
    const firstCost = getUpgradeCost(mockUpgrade, 5);
    expect(getMaxAffordable(mockUpgrade, 5, firstCost - 1)).toBe(0);
  });

  it("affordable count is consistent: buying that many should not exceed budget", () => {
    const budget = 50000;
    const n = getMaxAffordable(mockUpgrade, 0, budget);
    expect(getBulkCost(mockUpgrade, 0, n)).toBeLessThanOrEqual(budget);
    if (n > 0) {
      expect(getBulkCost(mockUpgrade, 0, n + 1)).toBeGreaterThan(budget);
    }
  });

  it("works with a large budget", () => {
    const budget = 1_000_000;
    const n = getMaxAffordable(mockUpgrade, 0, budget);
    expect(n).toBeGreaterThan(0);
    expect(getBulkCost(mockUpgrade, 0, n)).toBeLessThanOrEqual(budget);
  });
});

describe("getTotalTdPerSecond", () => {
  it("returns 0 when no upgrades are owned", () => {
    expect(getTotalTdPerSecond([mockUpgrade, mockUpgrade2], {})).toBe(0);
  });

  it("returns correct TD/s for a single owned upgrade", () => {
    const owned = { "test-upgrade": 3 };
    expect(getTotalTdPerSecond([mockUpgrade], owned)).toBeCloseTo(4.5);
  });

  it("sums TD/s across multiple upgrade types", () => {
    const owned = { "test-upgrade": 2, "test-upgrade-2": 1 };
    expect(getTotalTdPerSecond([mockUpgrade, mockUpgrade2], owned)).toBeCloseTo(
      8,
    );
  });

  it("ignores upgrades not in the owned map", () => {
    const owned = { "test-upgrade": 1 };
    expect(getTotalTdPerSecond([mockUpgrade, mockUpgrade2], owned)).toBeCloseTo(
      1.5,
    );
  });

  it("handles empty upgrades array", () => {
    expect(getTotalTdPerSecond([], { "test-upgrade": 5 })).toBe(0);
  });

  it("applies globalMultiplier correctly", () => {
    const owned = { "test-upgrade": 1 };
    expect(getTotalTdPerSecond([mockUpgrade], owned, 2)).toBeCloseTo(3);
  });

  it("applies boosterMultiplier correctly", () => {
    const owned = { "test-upgrade": 1 };
    expect(getTotalTdPerSecond([mockUpgrade], owned, 1, 3)).toBeCloseTo(4.5);
  });

  it("applies both multipliers combined", () => {
    const owned = { "test-upgrade": 1 };
    // base 1.5 * wisdom 2 * booster 3 = 9
    expect(getTotalTdPerSecond([mockUpgrade], owned, 2, 3)).toBeCloseTo(9);
  });

  it("applies milestone multiplier at 10 owned (\u00d71.5)", () => {
    const owned = { "test-upgrade": 10 };
    // 10 * 1.5 baseTdPerSecond * 1.5 milestone = 22.5
    expect(getTotalTdPerSecond([mockUpgrade], owned)).toBeCloseTo(22.5);
  });

  it("applies milestone multiplier at 25 owned (\u00d72)", () => {
    const owned = { "test-upgrade": 25 };
    // 25 * 1.5 * 2 = 75
    expect(getTotalTdPerSecond([mockUpgrade], owned)).toBeCloseTo(75);
  });

  it("applies milestone multiplier at 50 owned (\u00d73)", () => {
    const owned = { "test-upgrade": 50 };
    // 50 * 1.5 * 3 = 225
    expect(getTotalTdPerSecond([mockUpgrade], owned)).toBeCloseTo(225);
  });

  it("applies milestone multiplier at 100 owned (\u00d76)", () => {
    const owned = { "test-upgrade": 100 };
    // 100 * 1.5 * 6 = 900
    expect(getTotalTdPerSecond([mockUpgrade], owned)).toBeCloseTo(900);
  });

  it("applies milestone per-generator independently", () => {
    // mockUpgrade: 10 owned \u2192 \u00d71.5 milestone; mockUpgrade2: 3 owned \u2192 \u00d71 milestone
    const owned = { "test-upgrade": 10, "test-upgrade-2": 3 };
    // 10 * 1.5 * 1.5 + 3 * 5 * 1 = 22.5 + 15 = 37.5
    expect(getTotalTdPerSecond([mockUpgrade, mockUpgrade2], owned)).toBeCloseTo(
      37.5,
    );
  });

  it("applies no synergy for custom IDs not in the synergy map", () => {
    // test-upgrade and test-upgrade-2 are not synergy sources or targets
    const owned = { "test-upgrade": 50, "test-upgrade-2": 50 };
    // milestone at 50 \u2192 \u00d73; no synergy; 50*1.5*3 + 50*5*3 = 225 + 750 = 975
    expect(getTotalTdPerSecond([mockUpgrade, mockUpgrade2], owned)).toBeCloseTo(
      975,
    );
  });
});

describe("getTotalTdPerSecond \u2014 synergy integration", () => {
  const neuralNotepad: Upgrade = {
    id: "neural-notepad",
    name: "Neural Notepad",
    description: "Test",
    baseCost: 10,
    baseTdPerSecond: 1,
    tier: "garage-lab",
    icon: "\uD83D\uDCDD",
    unlockStage: 0,
  };

  const patternAntenna: Upgrade = {
    id: "pattern-antenna",
    name: "Pattern Antenna",
    description: "Test",
    baseCost: 1_000,
    baseTdPerSecond: 2,
    tier: "garage-lab",
    icon: "\uD83D\uDCE1",
    unlockStage: 0,
  };

  it("applies no synergy when source is below threshold", () => {
    const owned = { "neural-notepad": 49, "pattern-antenna": 5 };
    // neural-notepad: 49 owned \u2192 milestone \u00d72 (10 and 25 crossed), no synergy \u2192 49*1*2=98
    // pattern-antenna: 5 owned \u2192 milestone \u00d71, no synergy \u2192 5*2*1=10
    expect(
      getTotalTdPerSecond([neuralNotepad, patternAntenna], owned),
    ).toBeCloseTo(108);
  });

  it("applies +100% synergy to garage-lab generators when neural-notepad reaches 50", () => {
    const owned = { "neural-notepad": 50, "pattern-antenna": 5 };
    // neural-notepad: 50 owned \u2192 milestone \u00d73, synergy \u00d72 (target of itself) \u2192 50*1*3*2=300
    // pattern-antenna: 5 owned \u2192 milestone \u00d71, synergy \u00d72 \u2192 5*2*1*2=20
    expect(
      getTotalTdPerSecond([neuralNotepad, patternAntenna], owned),
    ).toBeCloseTo(320);
  });

  it("synergy multiplier stacks multiplicatively with milestone", () => {
    // neural-notepad at 50: milestone \u00d73, synergy (self) \u00d72 \u2192 effective rate 1*3*2=6 per unit
    const owned = { "neural-notepad": 50 };
    // 50 * 1 * 3 * 2 = 300
    expect(getTotalTdPerSecond([neuralNotepad], owned)).toBeCloseTo(300);
  });
});

const mockBooster1: Booster = {
  id: "booster-a",
  name: "Booster A",
  description: "Test booster A",
  multiplier: 2,
  cost: 1000,
  unlockStage: 1,
  icon: "\uD83C\uDD70\uFE0F",
};

const mockBooster2: Booster = {
  id: "booster-b",
  name: "Booster B",
  description: "Test booster B",
  multiplier: 3,
  cost: 5000,
  unlockStage: 2,
  icon: "\uD83C\uDD71\uFE0F",
};

describe("computeBoosterMultiplier", () => {
  it("returns 1 when no boosters are purchased", () => {
    expect(computeBoosterMultiplier([mockBooster1, mockBooster2], [])).toBe(1);
  });

  it("returns booster multiplier for a single purchase", () => {
    expect(
      computeBoosterMultiplier([mockBooster1, mockBooster2], ["booster-a"]),
    ).toBe(2);
  });

  it("multiplies two purchased boosters", () => {
    expect(
      computeBoosterMultiplier(
        [mockBooster1, mockBooster2],
        ["booster-a", "booster-b"],
      ),
    ).toBe(6);
  });

  it("ignores boosters not in the purchased list", () => {
    expect(
      computeBoosterMultiplier([mockBooster1, mockBooster2], ["booster-b"]),
    ).toBe(3);
  });

  it("returns 1 when boosters list is empty", () => {
    expect(computeBoosterMultiplier([], ["booster-a"])).toBe(1);
  });

  it("ignores unknown purchased IDs gracefully", () => {
    expect(
      computeBoosterMultiplier([mockBooster1], ["nonexistent-booster"]),
    ).toBe(1);
  });
});
