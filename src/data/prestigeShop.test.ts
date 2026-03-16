import { describe, expect, it } from "vitest";
import {
  getBurstDuration,
  getBurstMaxInterval,
  getBurstMinInterval,
  getClickMasteryBonus,
  getEvolutionThresholdMultiplier,
  getGeneratorCostMultiplier,
  getIdleBoostMultiplier,
  getPrestigeCost,
  getPrestigeOfflineEfficiency,
  getQuickStartTd,
  getTokenMagnetMultiplier,
  PRESTIGE_UPGRADES,
} from "./prestigeShop";

describe("PRESTIGE_UPGRADES data", () => {
  it("defines 12 upgrades", () => {
    expect(PRESTIGE_UPGRADES).toHaveLength(12);
  });

  it("all upgrades have unique IDs", () => {
    const ids = PRESTIGE_UPGRADES.map((u) => u.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all upgrades have positive costPerLevel and maxLevel", () => {
    for (const u of PRESTIGE_UPGRADES) {
      expect(u.costPerLevel).toBeGreaterThan(0);
      expect(u.maxLevel).toBeGreaterThan(0);
    }
  });
});

describe("getPrestigeCost", () => {
  it("returns costPerLevel", () => {
    const upgrade = PRESTIGE_UPGRADES[0];
    expect(getPrestigeCost(upgrade)).toBe(upgrade.costPerLevel);
  });
});

describe("getQuickStartTd", () => {
  it("returns 0 at level 0", () => {
    expect(getQuickStartTd(0)).toBe(0);
  });

  it("returns 1,000 at level 1", () => {
    expect(getQuickStartTd(1)).toBe(1_000);
  });

  it("returns 10,000 at level 2", () => {
    expect(getQuickStartTd(2)).toBe(10_000);
  });

  it("returns 100,000 at level 3", () => {
    expect(getQuickStartTd(3)).toBe(100_000);
  });
});

describe("getGeneratorCostMultiplier", () => {
  it("returns 1.15 at level 0 (default)", () => {
    expect(getGeneratorCostMultiplier(0)).toBeCloseTo(1.15);
  });

  it("returns 1.14 at level 1", () => {
    expect(getGeneratorCostMultiplier(1)).toBeCloseTo(1.14);
  });

  it("returns 1.12 at level 3", () => {
    expect(getGeneratorCostMultiplier(3)).toBeCloseTo(1.12);
  });
});

describe("getIdleBoostMultiplier", () => {
  it("returns 1 at level 0 (no bonus)", () => {
    expect(getIdleBoostMultiplier(0)).toBe(1);
  });

  it("returns 1.25 at level 1", () => {
    expect(getIdleBoostMultiplier(1)).toBeCloseTo(1.25);
  });

  it("returns 2.25 at level 5", () => {
    expect(getIdleBoostMultiplier(5)).toBeCloseTo(2.25);
  });
});

describe("getPrestigeOfflineEfficiency", () => {
  it("returns 0.5 at level 0 (default)", () => {
    expect(getPrestigeOfflineEfficiency(0)).toBeCloseTo(0.5);
  });

  it("returns 0.6 at level 1", () => {
    expect(getPrestigeOfflineEfficiency(1)).toBeCloseTo(0.6);
  });

  it("returns 0.8 at level 3", () => {
    expect(getPrestigeOfflineEfficiency(3)).toBeCloseTo(0.8);
  });
});

describe("getEvolutionThresholdMultiplier", () => {
  it("returns 1 at level 0 (no reduction)", () => {
    expect(getEvolutionThresholdMultiplier(0)).toBe(1);
  });

  it("returns 0.9 at level 1", () => {
    expect(getEvolutionThresholdMultiplier(1)).toBeCloseTo(0.9);
  });

  it("returns 0.7 at level 3", () => {
    expect(getEvolutionThresholdMultiplier(3)).toBeCloseTo(0.7);
  });
});

describe("getClickMasteryBonus", () => {
  it("returns 0 at level 0", () => {
    expect(getClickMasteryBonus(0)).toBe(0);
  });

  it("returns level value", () => {
    expect(getClickMasteryBonus(5)).toBe(5);
  });
});

describe("getTokenMagnetMultiplier", () => {
  it("returns 1 at level 0 (no bonus)", () => {
    expect(getTokenMagnetMultiplier(0)).toBe(1);
  });

  it("returns 1.2 at level 1", () => {
    expect(getTokenMagnetMultiplier(1)).toBeCloseTo(1.2);
  });

  it("returns 2 at level 5", () => {
    expect(getTokenMagnetMultiplier(5)).toBeCloseTo(2);
  });
});

describe("getBurstMinInterval", () => {
  it("returns 240s at level 0 (4 minutes)", () => {
    expect(getBurstMinInterval(0)).toBe(240);
  });

  it("returns 210s at level 1", () => {
    expect(getBurstMinInterval(1)).toBe(210);
  });

  it("returns 150s at level 3", () => {
    expect(getBurstMinInterval(3)).toBe(150);
  });
});

describe("getBurstMaxInterval", () => {
  it("returns 480s at level 0 (8 minutes)", () => {
    expect(getBurstMaxInterval(0)).toBe(480);
  });

  it("returns 450s at level 1", () => {
    expect(getBurstMaxInterval(1)).toBe(450);
  });

  it("returns 390s at level 3", () => {
    expect(getBurstMaxInterval(3)).toBe(390);
  });
});

describe("getBurstDuration", () => {
  it("returns 30s at level 0", () => {
    expect(getBurstDuration(0)).toBe(30);
  });

  it("returns 40s at level 1", () => {
    expect(getBurstDuration(1)).toBe(40);
  });

  it("returns 60s at level 3", () => {
    expect(getBurstDuration(3)).toBe(60);
  });
});
