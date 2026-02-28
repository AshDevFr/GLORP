import { describe, expect, it } from "vitest";
import { STAGES } from "./stages";

describe("STAGES", () => {
  it("has at least 3 stages (0, 1, 2)", () => {
    expect(STAGES.length).toBeGreaterThanOrEqual(3);
  });

  it("stage 0 is Blob unlocked from start", () => {
    expect(STAGES[0].stage).toBe(0);
    expect(STAGES[0].name).toBe("Blob");
    expect(STAGES[0].unlockAt).toBe(0);
  });

  it("stage 1 is Spark with positive threshold", () => {
    expect(STAGES[1].stage).toBe(1);
    expect(STAGES[1].name).toBe("Spark");
    expect(STAGES[1].unlockAt).toBeGreaterThan(0);
  });

  it("stage 2 is Neuron with higher threshold than stage 1", () => {
    expect(STAGES[2].stage).toBe(2);
    expect(STAGES[2].name).toBe("Neuron");
    expect(STAGES[2].unlockAt).toBeGreaterThan(STAGES[1].unlockAt);
  });

  it("thresholds are in ascending order", () => {
    for (let i = 1; i < STAGES.length; i++) {
      expect(STAGES[i].unlockAt).toBeGreaterThan(STAGES[i - 1].unlockAt);
    }
  });
});
