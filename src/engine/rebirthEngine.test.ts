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

  it("returns 0 below divisor TD (sqrt < 1)", () => {
    expect(computeWisdomTokens(WISDOM_TOKENS_DIVISOR - 1)).toBe(0);
  });

  it("returns 1 at exactly WISDOM_TOKENS_DIVISOR TD", () => {
    // floor(sqrt(500_000 / 500_000)) = floor(sqrt(1)) = 1
    expect(computeWisdomTokens(WISDOM_TOKENS_DIVISOR)).toBe(1);
  });

  it("returns 2 at 4× divisor TD", () => {
    // floor(sqrt(2_000_000 / 500_000)) = floor(sqrt(4)) = 2
    expect(computeWisdomTokens(4 * WISDOM_TOKENS_DIVISOR)).toBe(2);
  });

  it("returns 3 at 9× divisor TD", () => {
    // floor(sqrt(4_500_000 / 500_000)) = floor(sqrt(9)) = 3
    expect(computeWisdomTokens(9 * WISDOM_TOKENS_DIVISOR)).toBe(3);
  });

  it("floors fractional results", () => {
    // floor(sqrt(1_000_000 / 500_000)) = floor(sqrt(2)) = floor(1.414) = 1
    expect(computeWisdomTokens(1_000_000)).toBe(1);
  });

  it("returns ~4 tokens at minimum rebirth TD (stage 4 = 10M)", () => {
    // floor(sqrt(10_000_000 / 500_000)) = floor(sqrt(20)) = floor(4.47) = 4
    expect(computeWisdomTokens(10_000_000)).toBe(4);
  });

  it("scales correctly at 50M TD (mid-game rebirth)", () => {
    // floor(sqrt(50_000_000 / 500_000)) = floor(sqrt(100)) = 10
    expect(computeWisdomTokens(50_000_000)).toBe(10);
  });

  it("applies tokenMagnetMultiplier", () => {
    // base = floor(sqrt(2_000_000 / 500_000)) = 2, then floor(2 * 1.5) = 3
    expect(computeWisdomTokens(4 * WISDOM_TOKENS_DIVISOR, 1.5)).toBe(3);
  });

  it("floors result after tokenMagnetMultiplier", () => {
    // base = floor(sqrt(500_000 / 500_000)) = 1, then floor(1 * 1.2) = 1
    expect(computeWisdomTokens(WISDOM_TOKENS_DIVISOR, 1.2)).toBe(1);
  });

  it("tokenMagnetMultiplier of 2 doubles tokens", () => {
    // base = floor(sqrt(4_500_000 / 500_000)) = 3, then floor(3 * 2) = 6
    expect(computeWisdomTokens(9 * WISDOM_TOKENS_DIVISOR, 2)).toBe(6);
  });

  it("defaults tokenMagnetMultiplier to 1", () => {
    expect(computeWisdomTokens(4 * WISDOM_TOKENS_DIVISOR)).toBe(
      computeWisdomTokens(4 * WISDOM_TOKENS_DIVISOR, 1),
    );
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
