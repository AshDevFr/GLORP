import { describe, expect, it } from "vitest";
import { ASCII_ART } from "./asciiArt";

describe("ASCII_ART", () => {
  it("contains stages 0, 1, and 2", () => {
    expect(ASCII_ART[0]).toBeDefined();
    expect(ASCII_ART[1]).toBeDefined();
    expect(ASCII_ART[2]).toBeDefined();
  });

  it("stage 0 (Blob) is at least 3 lines", () => {
    const lines = ASCII_ART[0].split("\n");
    expect(lines.length).toBeGreaterThanOrEqual(3);
  });

  it("stage 1 (Spark) is at least 6 lines", () => {
    const lines = ASCII_ART[1].split("\n");
    expect(lines.length).toBeGreaterThanOrEqual(6);
  });

  it("stage 2 (Neuron) is at least 9 lines", () => {
    const lines = ASCII_ART[2].split("\n");
    expect(lines.length).toBeGreaterThanOrEqual(9);
  });

  it("all stages are string values", () => {
    for (const key of [0, 1, 2]) {
      expect(typeof ASCII_ART[key]).toBe("string");
    }
  });

  it("art grows in size across stages", () => {
    const lines0 = ASCII_ART[0].split("\n").length;
    const lines1 = ASCII_ART[1].split("\n").length;
    const lines2 = ASCII_ART[2].split("\n").length;
    expect(lines1).toBeGreaterThan(lines0);
    expect(lines2).toBeGreaterThan(lines1);
  });
});
