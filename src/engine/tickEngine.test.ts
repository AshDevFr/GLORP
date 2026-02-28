import { describe, expect, it } from "vitest";
import { computeTick } from "./tickEngine";

const BASE_TIME = 1_000_000;

function makeState(
  upgradeOwned: Record<string, number>,
  mood:
    | "Happy"
    | "Neutral"
    | "Hungry"
    | "Sad"
    | "Excited"
    | "Philosophical" = "Neutral",
  moodChangedAt = BASE_TIME,
) {
  return { upgradeOwned, mood, moodChangedAt };
}

describe("computeTick", () => {
  it("returns zero delta when no upgrades are owned", () => {
    const result = computeTick(makeState({}), 1, BASE_TIME);
    expect(result.trainingDataDelta).toBe(0);
  });

  it("returns zero delta when deltaSeconds is 0", () => {
    const result = computeTick(
      makeState({ "neural-notepad": 5 }),
      0,
      BASE_TIME,
    );
    expect(result.trainingDataDelta).toBe(0);
  });

  it("computes correct delta for one upgrade owned", () => {
    // neural-notepad: baseTdPerSecond = 0.1, 1 owned => 0.1 TD/s
    const result = computeTick(
      makeState({ "neural-notepad": 1 }),
      1,
      BASE_TIME,
    );
    expect(result.trainingDataDelta).toBeCloseTo(0.1);
  });

  it("scales with number of upgrades owned", () => {
    // neural-notepad: 0.1 * 3 = 0.3 TD/s
    const result = computeTick(
      makeState({ "neural-notepad": 3 }),
      1,
      BASE_TIME,
    );
    expect(result.trainingDataDelta).toBeCloseTo(0.3);
  });

  it("sums across multiple upgrade types", () => {
    // neural-notepad: 0.1 * 2 = 0.2, data-hamster-wheel: 0.5 * 1 = 0.5 => 0.7
    const result = computeTick(
      makeState({
        "neural-notepad": 2,
        "data-hamster-wheel": 1,
      }),
      1,
      BASE_TIME,
    );
    expect(result.trainingDataDelta).toBeCloseTo(0.7);
  });

  it("scales with delta time", () => {
    // neural-notepad: 0.1 * 1 = 0.1 TD/s, delta = 2.5s => 0.25
    const result = computeTick(
      makeState({ "neural-notepad": 1 }),
      2.5,
      BASE_TIME,
    );
    expect(result.trainingDataDelta).toBeCloseTo(0.25);
  });

  it("handles fractional delta seconds", () => {
    // gpu-toaster: 100 * 1 = 100 TD/s, delta = 0.016s => 1.6
    const result = computeTick(
      makeState({ "gpu-toaster": 1 }),
      0.016,
      BASE_TIME,
    );
    expect(result.trainingDataDelta).toBeCloseTo(1.6);
  });

  it("handles all upgrade types combined", () => {
    // All 6 upgrades, 1 each:
    // 0.1 + 0.5 + 2 + 5 + 20 + 100 = 127.6 TD/s
    const result = computeTick(
      makeState({
        "neural-notepad": 1,
        "data-hamster-wheel": 1,
        "pattern-antenna": 1,
        "intern-algorithm": 1,
        "cloud-crumb": 1,
        "gpu-toaster": 1,
      }),
      1,
      BASE_TIME,
    );
    expect(result.trainingDataDelta).toBeCloseTo(127.6);
  });

  describe("mood decay in tick", () => {
    it("returns null newMood when mood has not decayed", () => {
      const result = computeTick(
        makeState({}, "Happy", BASE_TIME),
        1,
        BASE_TIME + 30_000,
      );
      expect(result.newMood).toBeNull();
    });

    it("returns Neutral when Happy has decayed after 60s", () => {
      const result = computeTick(
        makeState({}, "Happy", BASE_TIME),
        1,
        BASE_TIME + 60_000,
      );
      expect(result.newMood).toBe("Neutral");
    });

    it("returns Hungry when Neutral has decayed after 120s", () => {
      const result = computeTick(
        makeState({}, "Neutral", BASE_TIME),
        1,
        BASE_TIME + 120_000,
      );
      expect(result.newMood).toBe("Hungry");
    });

    it("returns Sad when Hungry has decayed after 120s", () => {
      const result = computeTick(
        makeState({}, "Hungry", BASE_TIME),
        1,
        BASE_TIME + 120_000,
      );
      expect(result.newMood).toBe("Sad");
    });

    it("returns null for Sad (terminal state)", () => {
      const result = computeTick(
        makeState({}, "Sad", BASE_TIME),
        1,
        BASE_TIME + 300_000,
      );
      expect(result.newMood).toBeNull();
    });
  });
});
