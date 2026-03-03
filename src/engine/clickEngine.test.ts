import { describe, expect, it } from "vitest";
import type { ClickUpgrade } from "../data/clickUpgrades";
import { CLICK_UPGRADES } from "../data/clickUpgrades";
import {
  COMBO_CLICK_WINDOW_MS,
  COMBO_DECAY_MS,
  COMBO_MULTIPLIER,
  COMBO_THRESHOLD,
  computeClickPower,
  computeComboMultiplier,
  getNextComboCount,
} from "./clickEngine";

const mockUpgrades: readonly ClickUpgrade[] = [
  {
    id: "upgrade-a",
    name: "Upgrade A",
    description: "Test",
    multiplier: 2,
    cost: 10,
    unlockStage: 0,
    icon: "A",
  },
  {
    id: "upgrade-b",
    name: "Upgrade B",
    description: "Test",
    multiplier: 3,
    cost: 100,
    unlockStage: 0,
    icon: "B",
  },
  {
    id: "upgrade-c",
    name: "Upgrade C",
    description: "Test",
    multiplier: 5,
    cost: 1000,
    unlockStage: 1,
    icon: "C",
  },
];

describe("computeClickPower", () => {
  it("returns 1 at base state (stage 0, no upgrades, no combo)", () => {
    const power = computeClickPower(
      {
        evolutionStage: 0,
        clickUpgradesPurchased: [],
        comboCount: 0,
        lastClickTime: 0,
      },
      mockUpgrades,
      Date.now(),
    );
    expect(power).toBe(1);
  });

  it("scales with evolution stage: (1 + stage)", () => {
    const power = computeClickPower(
      {
        evolutionStage: 3,
        clickUpgradesPurchased: [],
        comboCount: 0,
        lastClickTime: 0,
      },
      mockUpgrades,
      Date.now(),
    );
    expect(power).toBe(4); // 1 + 3 = 4
  });

  it("at Singularity (stage 5), base is 6x before upgrades", () => {
    const power = computeClickPower(
      {
        evolutionStage: 5,
        clickUpgradesPurchased: [],
        comboCount: 0,
        lastClickTime: 0,
      },
      mockUpgrades,
      Date.now(),
    );
    expect(power).toBe(6); // 1 + 5 = 6
  });

  it("multiplies by purchased click upgrades", () => {
    const power = computeClickPower(
      {
        evolutionStage: 0,
        clickUpgradesPurchased: ["upgrade-a"],
        comboCount: 0,
        lastClickTime: 0,
      },
      mockUpgrades,
      Date.now(),
    );
    expect(power).toBe(2); // 1 * 2 = 2
  });

  it("stacks multiple upgrade multipliers", () => {
    const power = computeClickPower(
      {
        evolutionStage: 0,
        clickUpgradesPurchased: ["upgrade-a", "upgrade-b", "upgrade-c"],
        comboCount: 0,
        lastClickTime: 0,
      },
      mockUpgrades,
      Date.now(),
    );
    expect(power).toBe(30); // 1 * 2 * 3 * 5 = 30
  });

  it("combines evolution stage and upgrades", () => {
    const power = computeClickPower(
      {
        evolutionStage: 2,
        clickUpgradesPurchased: ["upgrade-a"],
        comboCount: 0,
        lastClickTime: 0,
      },
      mockUpgrades,
      Date.now(),
    );
    expect(power).toBe(6); // (1+2) * 2 = 6
  });

  it("applies combo multiplier when combo is active", () => {
    const now = Date.now();
    const power = computeClickPower(
      {
        evolutionStage: 0,
        clickUpgradesPurchased: [],
        comboCount: COMBO_THRESHOLD,
        lastClickTime: now,
      },
      mockUpgrades,
      now,
    );
    expect(power).toBe(COMBO_MULTIPLIER); // 1 * 1.5 = 1.5
  });

  it("combines all three: stage + upgrades + combo", () => {
    const now = Date.now();
    const power = computeClickPower(
      {
        evolutionStage: 5,
        clickUpgradesPurchased: ["upgrade-a", "upgrade-b"],
        comboCount: COMBO_THRESHOLD + 5,
        lastClickTime: now,
      },
      mockUpgrades,
      now,
    );
    // (1+5) * 2 * 3 * 1.5 = 54
    expect(power).toBe(54);
  });

  it("ignores non-existent upgrade IDs", () => {
    const power = computeClickPower(
      {
        evolutionStage: 0,
        clickUpgradesPurchased: ["nonexistent-id"],
        comboCount: 0,
        lastClickTime: 0,
      },
      mockUpgrades,
      Date.now(),
    );
    expect(power).toBe(1);
  });

  it("works with real CLICK_UPGRADES data — all purchased at stage 5", () => {
    const allIds = CLICK_UPGRADES.map((u) => u.id);
    const totalMultiplier = CLICK_UPGRADES.reduce(
      (acc, u) => acc * u.multiplier,
      1,
    );
    const power = computeClickPower(
      {
        evolutionStage: 5,
        clickUpgradesPurchased: allIds,
        comboCount: 0,
        lastClickTime: 0,
      },
      CLICK_UPGRADES,
      Date.now(),
    );
    // (1+5) * 600 = 3600
    expect(power).toBe(6 * totalMultiplier);
    expect(totalMultiplier).toBe(600);
  });
});

describe("computeComboMultiplier", () => {
  it("returns 1 when combo count is below threshold", () => {
    const now = Date.now();
    expect(computeComboMultiplier(0, now, now)).toBe(1);
    expect(computeComboMultiplier(COMBO_THRESHOLD - 1, now, now)).toBe(1);
  });

  it("returns COMBO_MULTIPLIER when combo is at threshold and not decayed", () => {
    const now = Date.now();
    expect(computeComboMultiplier(COMBO_THRESHOLD, now, now)).toBe(
      COMBO_MULTIPLIER,
    );
  });

  it("returns COMBO_MULTIPLIER when combo is above threshold and not decayed", () => {
    const now = Date.now();
    expect(computeComboMultiplier(COMBO_THRESHOLD + 10, now, now)).toBe(
      COMBO_MULTIPLIER,
    );
  });

  it("returns 1 when combo has decayed (time exceeded COMBO_DECAY_MS)", () => {
    const now = Date.now();
    const lastClick = now - COMBO_DECAY_MS - 1;
    expect(computeComboMultiplier(COMBO_THRESHOLD, lastClick, now)).toBe(1);
  });

  it("returns COMBO_MULTIPLIER just before decay threshold", () => {
    const now = Date.now();
    const lastClick = now - COMBO_DECAY_MS + 1;
    expect(computeComboMultiplier(COMBO_THRESHOLD, lastClick, now)).toBe(
      COMBO_MULTIPLIER,
    );
  });
});

describe("getNextComboCount", () => {
  it("returns 1 on first click (lastClickTime === 0)", () => {
    expect(getNextComboCount(0, 0, Date.now())).toBe(1);
  });

  it("increments combo when clicks are fast enough", () => {
    const now = Date.now();
    const lastClick = now - 100; // 100ms ago, within window
    expect(getNextComboCount(3, lastClick, now)).toBe(4);
  });

  it("increments combo at the edge of combo window", () => {
    const now = Date.now();
    const lastClick = now - COMBO_CLICK_WINDOW_MS; // exactly at boundary
    expect(getNextComboCount(5, lastClick, now)).toBe(6);
  });

  it("still increments within decay window but beyond combo click window", () => {
    const now = Date.now();
    const lastClick = now - 1000; // 1 second ago, between click window and decay
    expect(getNextComboCount(5, lastClick, now)).toBe(6);
  });

  it("resets combo to 1 after decay timeout", () => {
    const now = Date.now();
    const lastClick = now - COMBO_DECAY_MS - 1;
    expect(getNextComboCount(10, lastClick, now)).toBe(1);
  });

  it("resets combo when a very long time has passed", () => {
    const now = Date.now();
    const lastClick = now - 60_000; // 60 seconds ago
    expect(getNextComboCount(50, lastClick, now)).toBe(1);
  });
});

describe("constants", () => {
  it("COMBO_CLICK_WINDOW_MS is 333 (≈3 clicks/sec)", () => {
    expect(COMBO_CLICK_WINDOW_MS).toBe(333);
  });

  it("COMBO_DECAY_MS is 2000", () => {
    expect(COMBO_DECAY_MS).toBe(2_000);
  });

  it("COMBO_THRESHOLD is 3", () => {
    expect(COMBO_THRESHOLD).toBe(3);
  });

  it("COMBO_MULTIPLIER is 1.5", () => {
    expect(COMBO_MULTIPLIER).toBe(1.5);
  });
});

describe("CLICK_UPGRADES data integrity", () => {
  it("has 5 click upgrades", () => {
    expect(CLICK_UPGRADES).toHaveLength(5);
  });

  it("all upgrades have unique IDs", () => {
    const ids = CLICK_UPGRADES.map((u) => u.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all upgrades have multiplier > 1", () => {
    for (const u of CLICK_UPGRADES) {
      expect(u.multiplier).toBeGreaterThan(1);
    }
  });

  it("total multiplier from all upgrades is 600x", () => {
    const total = CLICK_UPGRADES.reduce((acc, u) => acc * u.multiplier, 1);
    expect(total).toBe(600);
  });

  it("upgrades are ordered by cost", () => {
    for (let i = 1; i < CLICK_UPGRADES.length; i++) {
      expect(CLICK_UPGRADES[i].cost).toBeGreaterThan(
        CLICK_UPGRADES[i - 1].cost,
      );
    }
  });

  it("unlock stages are non-decreasing", () => {
    for (let i = 1; i < CLICK_UPGRADES.length; i++) {
      expect(CLICK_UPGRADES[i].unlockStage).toBeGreaterThanOrEqual(
        CLICK_UPGRADES[i - 1].unlockStage,
      );
    }
  });
});
