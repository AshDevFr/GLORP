import { describe, expect, it } from "vitest";
import { computeTick } from "./tickEngine";

describe("computeTick", () => {
  it("returns zero delta when no upgrades are owned", () => {
    const result = computeTick({ upgradeOwned: {} }, 1);
    expect(result.trainingDataDelta).toBe(0);
  });

  it("returns zero delta when deltaSeconds is 0", () => {
    const result = computeTick({ upgradeOwned: { "neural-notepad": 5 } }, 0);
    expect(result.trainingDataDelta).toBe(0);
  });

  it("computes correct delta for one upgrade owned", () => {
    // neural-notepad: baseTdPerSecond = 0.1, 1 owned => 0.1 TD/s
    const result = computeTick({ upgradeOwned: { "neural-notepad": 1 } }, 1);
    expect(result.trainingDataDelta).toBeCloseTo(0.1);
  });

  it("scales with number of upgrades owned", () => {
    // neural-notepad: 0.1 * 3 = 0.3 TD/s
    const result = computeTick({ upgradeOwned: { "neural-notepad": 3 } }, 1);
    expect(result.trainingDataDelta).toBeCloseTo(0.3);
  });

  it("sums across multiple upgrade types", () => {
    // neural-notepad: 0.1 * 2 = 0.2, data-hamster-wheel: 0.5 * 1 = 0.5 => 0.7
    const result = computeTick(
      {
        upgradeOwned: {
          "neural-notepad": 2,
          "data-hamster-wheel": 1,
        },
      },
      1,
    );
    expect(result.trainingDataDelta).toBeCloseTo(0.7);
  });

  it("scales with delta time", () => {
    // neural-notepad: 0.1 * 1 = 0.1 TD/s, delta = 2.5s => 0.25
    const result = computeTick({ upgradeOwned: { "neural-notepad": 1 } }, 2.5);
    expect(result.trainingDataDelta).toBeCloseTo(0.25);
  });

  it("handles fractional delta seconds", () => {
    // gpu-toaster: 100 * 1 = 100 TD/s, delta = 0.016s => 1.6
    const result = computeTick({ upgradeOwned: { "gpu-toaster": 1 } }, 0.016);
    expect(result.trainingDataDelta).toBeCloseTo(1.6);
  });

  it("handles all upgrade types combined", () => {
    // All 6 upgrades, 1 each:
    // 0.1 + 0.5 + 2 + 5 + 20 + 100 = 127.6 TD/s
    const result = computeTick(
      {
        upgradeOwned: {
          "neural-notepad": 1,
          "data-hamster-wheel": 1,
          "pattern-antenna": 1,
          "intern-algorithm": 1,
          "cloud-crumb": 1,
          "gpu-toaster": 1,
        },
      },
      1,
    );
    expect(result.trainingDataDelta).toBeCloseTo(127.6);
  });
});
