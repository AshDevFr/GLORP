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
    // neural-notepad: baseTdPerSecond = 0.2, 1 owned => 0.2 TD/s
    const result = computeTick(
      makeState({ "neural-notepad": 1 }),
      1,
      BASE_TIME,
    );
    expect(result.trainingDataDelta).toBeCloseTo(0.2);
  });

  it("scales with number of upgrades owned", () => {
    // neural-notepad: 0.2 * 3 = 0.6 TD/s
    const result = computeTick(
      makeState({ "neural-notepad": 3 }),
      1,
      BASE_TIME,
    );
    expect(result.trainingDataDelta).toBeCloseTo(0.6);
  });

  it("sums across multiple upgrade types", () => {
    // neural-notepad: 0.2 * 2 = 0.4, data-hamster-wheel: 2 * 1 = 2 => 2.4
    const result = computeTick(
      makeState({
        "neural-notepad": 2,
        "data-hamster-wheel": 1,
      }),
      1,
      BASE_TIME,
    );
    expect(result.trainingDataDelta).toBeCloseTo(2.4);
  });

  it("scales with delta time", () => {
    // neural-notepad: 0.2 * 1 = 0.2 TD/s, delta = 2.5s => 0.5
    const result = computeTick(
      makeState({ "neural-notepad": 1 }),
      2.5,
      BASE_TIME,
    );
    expect(result.trainingDataDelta).toBeCloseTo(0.5);
  });

  it("handles fractional delta seconds", () => {
    // gpu-toaster: 20,000 * 1 = 20,000 TD/s, delta = 0.016s => 320
    const result = computeTick(
      makeState({ "gpu-toaster": 1 }),
      0.016,
      BASE_TIME,
    );
    expect(result.trainingDataDelta).toBeCloseTo(320);
  });

  it("handles all upgrade types combined", () => {
    // All 6 early upgrades, 1 each:
    // 0.2 + 2 + 20 + 200 + 2,000 + 20,000 = 22,222.2 TD/s
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
    expect(result.trainingDataDelta).toBeCloseTo(22_222.2);
  });

  describe("booster multiplier in tick", () => {
    it("applies no bonus when boostersPurchased is empty", () => {
      const result = computeTick(
        { ...makeState({ "neural-notepad": 1 }), boostersPurchased: [] },
        1,
        BASE_TIME,
      );
      expect(result.trainingDataDelta).toBeCloseTo(0.2);
    });

    it("applies series-a-funding 2x multiplier", () => {
      const result = computeTick(
        {
          ...makeState({ "neural-notepad": 1 }),
          boostersPurchased: ["series-a-funding"],
        },
        1,
        BASE_TIME,
      );
      // neural-notepad 0.2 TD/s * 2 = 0.4
      expect(result.trainingDataDelta).toBeCloseTo(0.4);
    });

    it("stacks two booster multipliers multiplicatively", () => {
      const result = computeTick(
        {
          ...makeState({ "neural-notepad": 1 }),
          boostersPurchased: ["series-a-funding", "hype-train"],
        },
        1,
        BASE_TIME,
      );
      // neural-notepad 0.2 TD/s * 2 * 3 = 1.2
      expect(result.trainingDataDelta).toBeCloseTo(1.2);
    });

    it("uses default 1x when boostersPurchased is undefined", () => {
      const result = computeTick(
        makeState({ "neural-notepad": 1 }),
        1,
        BASE_TIME,
      );
      expect(result.trainingDataDelta).toBeCloseTo(0.2);
    });
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

  describe("challenge handicaps", () => {
    it("click-only challenge produces zero auto-gen TD", () => {
      const result = computeTick(
        {
          ...makeState({ "neural-notepad": 10, "gpu-toaster": 5 }),
          activeChallengeId: "click-only",
        },
        1,
        BASE_TIME,
      );
      expect(result.trainingDataDelta).toBe(0);
    });

    it("click-only challenge still decays mood", () => {
      const result = computeTick(
        {
          ...makeState({ "neural-notepad": 1 }, "Happy", BASE_TIME),
          activeChallengeId: "click-only",
        },
        1,
        BASE_TIME + 60_000,
      );
      expect(result.trainingDataDelta).toBe(0);
      expect(result.newMood).toBe("Neutral");
    });

    it("null activeChallengeId does not affect auto-gen", () => {
      const result = computeTick(
        {
          ...makeState({ "neural-notepad": 1 }),
          activeChallengeId: null,
        },
        1,
        BASE_TIME,
      );
      expect(result.trainingDataDelta).toBeCloseTo(0.2);
    });

    it("non-click-only challenge does not disable auto-gen", () => {
      const result = computeTick(
        {
          ...makeState({ "neural-notepad": 1 }),
          activeChallengeId: "speed-run",
        },
        1,
        BASE_TIME,
      );
      expect(result.trainingDataDelta).toBeCloseTo(0.2);
    });
  });
});
