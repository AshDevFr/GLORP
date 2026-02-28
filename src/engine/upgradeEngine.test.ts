import { describe, expect, it } from "vitest";
import type { Upgrade } from "../data/upgrades";
import { getTotalTdPerSecond, getUpgradeCost } from "./upgradeEngine";

const mockUpgrade: Upgrade = {
  id: "test-upgrade",
  name: "Test Upgrade",
  description: "A test upgrade",
  baseCost: 100,
  baseTdPerSecond: 1.5,
  tier: "garage-lab",
  icon: "🧪",
};

const mockUpgrade2: Upgrade = {
  id: "test-upgrade-2",
  name: "Test Upgrade 2",
  description: "Another test upgrade",
  baseCost: 500,
  baseTdPerSecond: 5,
  tier: "startup",
  icon: "🔬",
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
});
