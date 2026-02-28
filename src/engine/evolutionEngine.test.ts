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

  it("returns stage 2 above threshold", () => {
    expect(getEvolutionStage(100_000)).toBe(2);
  });
});
