import { describe, expect, it } from "vitest";
import { ASCII_ART } from "./asciiArt";

describe("ASCII_ART", () => {
  it("contains stage 0 art", () => {
    expect(ASCII_ART[0]).toBeDefined();
  });

  it("stage 0 art is a multi-line string", () => {
    const lines = ASCII_ART[0].split("\n");
    expect(lines.length).toBeGreaterThanOrEqual(3);
  });

  it("stage 0 art contains GLORP", () => {
    expect(ASCII_ART[0]).toContain("GLORP");
  });

  it("stage 0 art is a string value", () => {
    expect(typeof ASCII_ART[0]).toBe("string");
  });
});
