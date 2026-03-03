import { describe, expect, it } from "vitest";
import {
  canRebirth,
  computeWisdomTokens,
  getNextSpecies,
  REBIRTH_MIN_STAGE,
  WISDOM_TOKENS_DIVISOR,
} from "./rebirthEngine";

describe("computeWisdomTokens", () => {
  it("returns 0 for 0 TD earned", () => {
    expect(computeWisdomTokens(0)).toBe(0);
  });

  it("returns 0 below 100K TD (sqrt < 1)", () => {
    expect(computeWisdomTokens(99_999)).toBe(0);
  });

  it("returns 1 at exactly 100K TD", () => {
    // floor(sqrt(100_000 / 100_000)) = floor(sqrt(1)) = 1
    expect(computeWisdomTokens(WISDOM_TOKENS_DIVISOR)).toBe(1);
  });

  it("returns correct tokens for 400K TD", () => {
    // floor(sqrt(400_000 / 100_000)) = floor(sqrt(4)) = 2
    expect(computeWisdomTokens(400_000)).toBe(2);
  });

  it("returns correct tokens for 900K TD", () => {
    // floor(sqrt(9)) = 3
    expect(computeWisdomTokens(900_000)).toBe(3);
  });

  it("returns correct tokens for 1M TD", () => {
    // floor(sqrt(1_000_000 / 100_000)) = floor(sqrt(10)) ≈ floor(3.162) = 3
    expect(computeWisdomTokens(1_000_000)).toBe(3);
  });

  it("floors fractional results", () => {
    // floor(sqrt(200_000 / 100_000)) = floor(sqrt(2)) = floor(1.414) = 1
    expect(computeWisdomTokens(200_000)).toBe(1);
  });

  it("scales correctly at 10M TD", () => {
    // floor(sqrt(10_000_000 / 100_000)) = floor(sqrt(100)) = 10
    expect(computeWisdomTokens(10_000_000)).toBe(10);
  });

  it("applies tokenMagnetMultiplier", () => {
    // base = floor(sqrt(400_000 / 100_000)) = 2, then floor(2 * 1.5) = 3
    expect(computeWisdomTokens(400_000, 1.5)).toBe(3);
  });

  it("floors result after tokenMagnetMultiplier", () => {
    // base = floor(sqrt(100_000 / 100_000)) = 1, then floor(1 * 1.2) = 1
    expect(computeWisdomTokens(100_000, 1.2)).toBe(1);
  });

  it("tokenMagnetMultiplier of 2 doubles tokens", () => {
    // base = floor(sqrt(900_000 / 100_000)) = 3, then floor(3 * 2) = 6
    expect(computeWisdomTokens(900_000, 2)).toBe(6);
  });

  it("defaults tokenMagnetMultiplier to 1", () => {
    expect(computeWisdomTokens(400_000)).toBe(computeWisdomTokens(400_000, 1));
  });
});

describe("canRebirth", () => {
  it("returns false at stage 0", () => {
    expect(canRebirth(0)).toBe(false);
  });

  it("returns false at stage 3", () => {
    expect(canRebirth(3)).toBe(false);
  });

  it("returns true at exactly stage 4 (min stage)", () => {
    expect(canRebirth(REBIRTH_MIN_STAGE)).toBe(true);
  });

  it("returns true above stage 4", () => {
    expect(canRebirth(5)).toBe(true);
  });
});

describe("getNextSpecies", () => {
  it("advances from GLORP to ZAPPY", () => {
    expect(getNextSpecies("GLORP")).toBe("ZAPPY");
  });

  it("advances from ZAPPY to CHONK", () => {
    expect(getNextSpecies("ZAPPY")).toBe("CHONK");
  });

  it("advances from CHONK to WISP", () => {
    expect(getNextSpecies("CHONK")).toBe("WISP");
  });

  it("advances from WISP to MEGA-GLORP", () => {
    expect(getNextSpecies("WISP")).toBe("MEGA-GLORP");
  });

  it("stays at MEGA-GLORP when already at last species", () => {
    expect(getNextSpecies("MEGA-GLORP")).toBe("MEGA-GLORP");
  });
});
