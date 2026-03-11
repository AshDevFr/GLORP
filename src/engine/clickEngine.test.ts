import { describe, expect, it } from "vitest";
import type { ClickUpgrade } from "../data/clickUpgrades";
import { CLICK_UPGRADES } from "../data/clickUpgrades";
import {
  BASE_CLICK_SECONDS,
  COMBO_CLICK_WINDOW_MS,
  COMBO_DECAY_MS,
  COMBO_MULTIPLIER,
  COMBO_THRESHOLD,
  computeClickPower,
  computeClickSeconds,
  computeComboMultiplier,
  getNextComboCount,
  MASTERY_CLICK_SECONDS_PER_LEVEL,
} from "./clickEngine";

// ── Test helpers ──────────────────────────────────────────────────────────────

const mockUpgrades: readonly ClickUpgrade[] = [
  {
    id: "upgrade-a",
    name: "Upgrade A",
    description: "Test",
    clickSeconds: 0.1,
    cost: 10,
    unlockStage: 0,
    icon: "A",
  },
  {
    id: "upgrade-b",
    name: "Upgrade B",
    description: "Test",
    clickSeconds: 0.15,
    cost: 100,
    unlockStage: 0,
    icon: "B",
  },
  {
    id: "upgrade-c",
    name: "Upgrade C",
    description: "Test",
    clickSeconds: 0.25,
    cost: 1000,
    unlockStage: 1,
    icon: "C",
  },
];

const NO_COMBO = { comboCount: 0, lastClickTime: 0 };

// ── computeClickSeconds ───────────────────────────────────────────────────────

describe("computeClickSeconds", () => {
  it("returns BASE_CLICK_SECONDS with no upgrades or mastery", () => {
    expect(computeClickSeconds([], mockUpgrades)).toBe(BASE_CLICK_SECONDS);
  });

  it("adds clickSeconds for each purchased upgrade", () => {
    expect(computeClickSeconds(["upgrade-a"], mockUpgrades)).toBeCloseTo(
      BASE_CLICK_SECONDS + 0.1,
    );
  });

  it("stacks multiple purchased upgrades", () => {
    expect(
      computeClickSeconds(
        ["upgrade-a", "upgrade-b", "upgrade-c"],
        mockUpgrades,
      ),
    ).toBeCloseTo(BASE_CLICK_SECONDS + 0.1 + 0.15 + 0.25);
  });

  it("adds MASTERY_CLICK_SECONDS_PER_LEVEL per mastery level", () => {
    expect(computeClickSeconds([], mockUpgrades, 3)).toBeCloseTo(
      BASE_CLICK_SECONDS + 3 * MASTERY_CLICK_SECONDS_PER_LEVEL,
    );
  });

  it("ignores non-existent upgrade IDs", () => {
    expect(computeClickSeconds(["nonexistent"], mockUpgrades)).toBe(
      BASE_CLICK_SECONDS,
    );
  });
});

// ── computeClickPower ─────────────────────────────────────────────────────────

describe("computeClickPower", () => {
  it("returns 1 (floor) when tdPerSecond is 0 and no combo", () => {
    const power = computeClickPower(
      { clickUpgradesPurchased: [], ...NO_COMBO },
      mockUpgrades,
      0,
    );
    expect(power).toBe(1);
  });

  it("returns floor of 1 even with upgrades at 0 tdPerSecond", () => {
    const power = computeClickPower(
      { clickUpgradesPurchased: ["upgrade-a"], ...NO_COMBO },
      mockUpgrades,
      0,
    );
    expect(power).toBe(1);
  });

  it("scales linearly with tdPerSecond", () => {
    const tdPerSecond = 1000;
    const power = computeClickPower(
      { clickUpgradesPurchased: [], ...NO_COMBO },
      mockUpgrades,
      tdPerSecond,
    );
    expect(power).toBeCloseTo(BASE_CLICK_SECONDS * tdPerSecond);
  });

  it("adds purchased upgrade seconds to base", () => {
    const tdPerSecond = 1000;
    const expected = (BASE_CLICK_SECONDS + 0.1) * tdPerSecond; // upgrade-a
    const power = computeClickPower(
      { clickUpgradesPurchased: ["upgrade-a"], ...NO_COMBO },
      mockUpgrades,
      tdPerSecond,
    );
    expect(power).toBeCloseTo(expected);
  });

  it("stacks all purchased upgrades", () => {
    const tdPerSecond = 100;
    const totalSeconds = BASE_CLICK_SECONDS + 0.1 + 0.15 + 0.25;
    const power = computeClickPower(
      {
        clickUpgradesPurchased: ["upgrade-a", "upgrade-b", "upgrade-c"],
        ...NO_COMBO,
      },
      mockUpgrades,
      tdPerSecond,
    );
    expect(power).toBeCloseTo(totalSeconds * tdPerSecond);
  });

  it("applies combo multiplier on top", () => {
    const now = Date.now();
    const tdPerSecond = 1000;
    const power = computeClickPower(
      {
        clickUpgradesPurchased: [],
        comboCount: COMBO_THRESHOLD,
        lastClickTime: now,
      },
      mockUpgrades,
      tdPerSecond,
      now,
    );
    const expectedBase = BASE_CLICK_SECONDS * tdPerSecond;
    expect(power).toBeCloseTo(expectedBase * COMBO_MULTIPLIER);
  });

  it("applies combo multiplier to the base-1 floor when tdPerSecond is 0", () => {
    const now = Date.now();
    // comboCount COMBO_THRESHOLD * 4 = 12 → multiplier is exactly 2.0:
    //   1 + (COMBO_MULTIPLIER - 1) * sqrt(12 / COMBO_THRESHOLD)
    //   = 1 + 0.5 * sqrt(4) = 1 + 0.5 * 2 = 2.0
    // floor(max(1, 0) * 2.0) = floor(2.0) = 2
    const power = computeClickPower(
      {
        clickUpgradesPurchased: [],
        comboCount: COMBO_THRESHOLD * 4,
        lastClickTime: now,
      },
      mockUpgrades,
      0,
      now,
    );
    expect(power).toBe(2);
  });


  it("applies species click multiplier", () => {
    const tdPerSecond = 1000;
    const power = computeClickPower(
      { clickUpgradesPurchased: [], ...NO_COMBO },
      mockUpgrades,
      tdPerSecond,
      undefined,
      0,
      1.5, // CHONK species
    );
    expect(power).toBeCloseTo(BASE_CLICK_SECONDS * tdPerSecond * 1.5);
  });

  it("includes click mastery bonus seconds", () => {
    const tdPerSecond = 1000;
    const masteryLevel = 5;
    const expected =
      (BASE_CLICK_SECONDS + masteryLevel * MASTERY_CLICK_SECONDS_PER_LEVEL) *
      tdPerSecond;
    const power = computeClickPower(
      { clickUpgradesPurchased: [], ...NO_COMBO },
      mockUpgrades,
      tdPerSecond,
      undefined,
      masteryLevel,
    );
    expect(power).toBeCloseTo(expected);
  });

  it("click power scales with tdPerSecond — mid game example", () => {
    // At 1,000 TD/s with all real upgrades → ~2.05s × 1000 = 2050 TD/click
    const allIds = CLICK_UPGRADES.map((u) => u.id);
    const power = computeClickPower(
      { clickUpgradesPurchased: allIds, ...NO_COMBO },
      CLICK_UPGRADES,
      1000,
    );
    expect(power).toBeGreaterThan(1000);
  });

  it("click power scales with tdPerSecond — late game example", () => {
    // At 30,000 TD/s with all real upgrades → >60,000 TD/click
    const allIds = CLICK_UPGRADES.map((u) => u.id);
    const power = computeClickPower(
      { clickUpgradesPurchased: allIds, ...NO_COMBO },
      CLICK_UPGRADES,
      30_000,
    );
    expect(power).toBeGreaterThan(60_000);
  });
});

// ── computeComboMultiplier ────────────────────────────────────────────────────

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

  it("returns higher multiplier when combo is above threshold (scales with count)", () => {
    const now = Date.now();
    const result = computeComboMultiplier(COMBO_THRESHOLD + 10, now, now);
    expect(result).toBeGreaterThan(COMBO_MULTIPLIER);
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

  it("returns 1 for a 1-click combo (below threshold)", () => {
    const now = Date.now();
    expect(computeComboMultiplier(1, now, now)).toBe(1);
  });

  it("returns higher multiplier for 5-click combo than at threshold", () => {
    const now = Date.now();
    const at5 = computeComboMultiplier(5, now, now);
    const atThreshold = computeComboMultiplier(COMBO_THRESHOLD, now, now);
    expect(at5).toBeGreaterThan(atThreshold);
  });

  it("returns higher multiplier for 20-click combo than for 5-click combo", () => {
    const now = Date.now();
    const at20 = computeComboMultiplier(20, now, now);
    const at5 = computeComboMultiplier(5, now, now);
    expect(at20).toBeGreaterThan(at5);
  });

  it("10-click combo produces noticeably higher multiplier than 2-click combo", () => {
    const now = Date.now();
    const at10 = computeComboMultiplier(10, now, now);
    const at2 = computeComboMultiplier(2, now, now); // below threshold → 1
    expect(at10).toBeGreaterThan(at2 + 0.5); // at least 0.5 more
  });

  it("resets to 1 after decay (combo count irrelevant once time expires)", () => {
    const now = Date.now();
    const lastClick = now - COMBO_DECAY_MS - 1;
    expect(computeComboMultiplier(20, lastClick, now)).toBe(1);
  });
});

// ── getNextComboCount ─────────────────────────────────────────────────────────

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

// ── Constants ─────────────────────────────────────────────────────────────────

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

  it("BASE_CLICK_SECONDS is 0.05", () => {
    expect(BASE_CLICK_SECONDS).toBe(0.05);
  });

  it("MASTERY_CLICK_SECONDS_PER_LEVEL is 0.1", () => {
    expect(MASTERY_CLICK_SECONDS_PER_LEVEL).toBe(0.1);
  });
});

// ── CLICK_UPGRADES data integrity ─────────────────────────────────────────────

describe("CLICK_UPGRADES data integrity", () => {
  it("has 5 click upgrades", () => {
    expect(CLICK_UPGRADES).toHaveLength(5);
  });

  it("all upgrades have unique IDs", () => {
    const ids = CLICK_UPGRADES.map((u) => u.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all upgrades have clickSeconds > 0", () => {
    for (const u of CLICK_UPGRADES) {
      expect(u.clickSeconds).toBeGreaterThan(0);
    }
  });

  it("total clickSeconds from all upgrades is 2.0s", () => {
    const total = CLICK_UPGRADES.reduce((acc, u) => acc + u.clickSeconds, 0);
    expect(total).toBeCloseTo(2.0);
  });

  it("with all upgrades, each click gives ~2.05s of passive income", () => {
    const allIds = CLICK_UPGRADES.map((u) => u.id);
    const totalSeconds = computeClickSeconds(allIds, CLICK_UPGRADES);
    expect(totalSeconds).toBeCloseTo(
      BASE_CLICK_SECONDS + 0.1 + 0.15 + 0.25 + 0.5 + 1.0,
    );
    expect(totalSeconds).toBeGreaterThanOrEqual(2.0);
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
