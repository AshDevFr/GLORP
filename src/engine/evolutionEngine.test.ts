import { describe, expect, it } from "vitest";
import { getEvolutionStage } from "./evolutionEngine";

describe("getEvolutionStage", () => {
  it("returns stage 0 for 0 TD earned", () => {
    expect(getEvolutionStage(0)).toBe(0);
  });

  it("returns stage 0 below stage 1 threshold", () => {
    expect(getEvolutionStage(99)).toBe(0);
  });

  it("returns stage 1 at exactly 100 TD earned", () => {
    expect(getEvolutionStage(100)).toBe(1);
  });

  it("returns stage 1 between thresholds", () => {
    expect(getEvolutionStage(2_500)).toBe(1);
  });

  it("returns stage 2 at exactly 5000 TD earned", () => {
    expect(getEvolutionStage(5_000)).toBe(2);
  });

  it("returns stage 2 between thresholds", () => {
    expect(getEvolutionStage(100_000)).toBe(2);
  });

  it("returns stage 3 at exactly 500K TD earned", () => {
    expect(getEvolutionStage(500_000)).toBe(3);
  });

  it("returns stage 3 between thresholds", () => {
    expect(getEvolutionStage(1_000_000)).toBe(3);
  });

  it("returns stage 4 at exactly 10M TD earned", () => {
    expect(getEvolutionStage(10_000_000)).toBe(4);
  });

  it("returns stage 4 well above threshold", () => {
    expect(getEvolutionStage(999_999_999)).toBe(4);
  });
});
