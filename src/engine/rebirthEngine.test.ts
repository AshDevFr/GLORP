import { describe, expect, it } from "vitest";
import {
  canRebirth,
  computeWisdomTokens,
  getNextSpecies,
  getRebirthProgress,
  getRebirthThresholdTd,
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
    // floor(sqrt(2 * 5_000_000 / 5_000_000)) = floor(sqrt(2)) = floor(1.414) = 1
    expect(computeWisdomTokens(2 * WISDOM_TOKENS_DIVISOR)).toBe(1);
  });

  it("returns 1 token at minimum rebirth TD (stage 4 = 10M)", () => {
    // floor(sqrt(10_000_000 / 5_000_000)) = floor(sqrt(2)) = floor(1.414) = 1
    expect(computeWisdomTokens(10_000_000)).toBe(1);
  });

  it("scales correctly at 50M TD (mid-game rebirth)", () => {
    // floor(sqrt(50_000_000 / 5_000_000)) = floor(sqrt(10)) = floor(3.162) = 3
    expect(computeWisdomTokens(50_000_000)).toBe(3);
  });

  // Balance snapshots (divisor = 5_000_000)
  it("balance: returns 14 tokens at 1B TD (stage 5 min)", () => {
    // floor(sqrt(1_000_000_000 / 5_000_000)) = floor(sqrt(200)) = floor(14.14) = 14
    expect(computeWisdomTokens(1_000_000_000)).toBe(14);
  });

  it("balance: returns 35 tokens at 1B TD with max multiplier (2.5x)", () => {
    // base = 14, floor(14 * 2.5) = 35
    expect(computeWisdomTokens(1_000_000_000, 2.5)).toBe(35);
  });

  it("balance: returns 31 tokens at 5B TD (extended stage 5 play)", () => {
    // floor(sqrt(5_000_000_000 / 5_000_000)) = floor(sqrt(1000)) = floor(31.62) = 31
    expect(computeWisdomTokens(5_000_000_000)).toBe(31);
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

describe("getRebirthThresholdTd", () => {
  it("returns Stage 4 unlockAt (10 M) by default", () => {
    expect(getRebirthThresholdTd()).toBe(10_000_000);
  });

  it("applies thresholdMultiplier (Evolution Accelerator level 1 = 0.9×)", () => {
    expect(getRebirthThresholdTd(0.9)).toBeCloseTo(9_000_000);
  });

  it("applies full Evolution Accelerator (3 levels = 0.7×)", () => {
    expect(getRebirthThresholdTd(0.7)).toBeCloseTo(7_000_000);
  });
});

describe("getRebirthProgress", () => {
  it("returns 0 at 0 TD earned", () => {
    expect(getRebirthProgress(0)).toBe(0);
  });

  it("returns 0.5 at half the threshold (5 M TD)", () => {
    expect(getRebirthProgress(5_000_000)).toBeCloseTo(0.5);
  });

  it("returns 1 at exactly the threshold (10 M TD)", () => {
    expect(getRebirthProgress(10_000_000)).toBe(1);
  });

  it("clamps to 1 above the threshold", () => {
    expect(getRebirthProgress(20_000_000)).toBe(1);
  });

  it("clamps to 0 for negative input", () => {
    expect(getRebirthProgress(-1)).toBe(0);
  });

  it("accounts for thresholdMultiplier (Evolution Accelerator lvl 1)", () => {
    // threshold = 9 M; 9 M / 9 M = 1
    expect(getRebirthProgress(9_000_000, 0.9)).toBe(1);
  });

  it("returns fractional progress with multiplier", () => {
    // threshold = 7 M; 3.5 M / 7 M = 0.5
    expect(getRebirthProgress(3_500_000, 0.7)).toBeCloseTo(0.5);
  });
});

// ── Pacing simulation ─────────────────────────────────────────────────────────────────────────────
// Validates that a new player reaches Stage 4 (10 M total TD) within the
// design target of 2–4 hours. Full methodology in docs/prestige-pacing.md.
describe("pacing: time-to-Stage-4 simulation (Issue #108)", () => {
  /**
   * Greedy idle+click simulation using the post-#107 economy parameters.
   *
   * Strategy: each second, earn TD from generators + clicks, then buy
   * the generator with the best TD/s per marginal-cost ratio that is
   * currently affordable. Milestone multipliers (×1.5/×2/×3/×6 at
   * 10/25/50/100 owned) are applied; synergies are omitted for conservatism.
   *
   * Returns the simulated time in seconds, or 100 000 if target is never reached.
   */
  function simulateTimeToPrestage4(
    targetTd: number,
    clicksPerSecond: number,
    baseClickPower: number,
  ): number {
    const generators = [
      { baseCost: 10, baseTdPerSec: 0.2 }, // neural-notepad
      { baseCost: 100, baseTdPerSec: 2 }, // data-hamster-wheel
      { baseCost: 1_000, baseTdPerSec: 20 }, // pattern-antenna
      { baseCost: 10_000, baseTdPerSec: 200 }, // intern-algorithm
      { baseCost: 100_000, baseTdPerSec: 2_000 }, // cloud-crumb
      { baseCost: 1_000_000, baseTdPerSec: 20_000 }, // gpu-toaster
    ];

    const MILESTONES = [
      { threshold: 100, mult: 6.0 },
      { threshold: 50, mult: 3.0 },
      { threshold: 25, mult: 2.0 },
      { threshold: 10, mult: 1.5 },
    ];

    function milestoneMult(owned: number): number {
      for (const m of MILESTONES) {
        if (owned >= m.threshold) return m.mult;
      }
      return 1;
    }

    const owned = new Array(generators.length).fill(0) as number[];
    let td = 0;
    let totalTdEarned = 0;
    const DT = 1; // 1-second timestep
    let time = 0;

    while (totalTdEarned < targetTd && time < 100_000) {
      // Earn TD: generators + active clicking
      let genTdPerSec = 0;
      for (let i = 0; i < generators.length; i++) {
        genTdPerSec +=
          generators[i].baseTdPerSec * owned[i] * milestoneMult(owned[i]);
      }
      const earned = (genTdPerSec + clicksPerSecond * baseClickPower) * DT;
      td += earned;
      totalTdEarned += earned;

      // Buy the generator with the best TD/s per marginal-cost ratio
      let bestIdx = -1;
      let bestRatio = -1;
      for (let i = 0; i < generators.length; i++) {
        const marginalCost = generators[i].baseCost * 1.15 ** owned[i];
        if (td >= marginalCost) {
          const ratio = generators[i].baseTdPerSec / marginalCost;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestIdx = i;
          }
        }
      }
      if (bestIdx >= 0) {
        const cost = generators[bestIdx].baseCost * 1.15 ** owned[bestIdx];
        td -= cost;
        owned[bestIdx]++;
      }

      time += DT;
    }

    return time;
  }

  it("active player (4 clicks/s) reaches Stage 4 within 4 hours (14\u202f400 s)", () => {
    const seconds = simulateTimeToPrestage4(10_000_000, 4, 1);
    expect(seconds).toBeLessThan(14_400);
  });

  it("active player (4 clicks/s) reaches Stage 4 after at least 30 min (1\u202f800 s)", () => {
    const seconds = simulateTimeToPrestage4(10_000_000, 4, 1);
    expect(seconds).toBeGreaterThan(1_800);
  });

  it("casual player (1 click/s) reaches Stage 4 within 4 hours (14\u202f400 s)", () => {
    const seconds = simulateTimeToPrestage4(10_000_000, 1, 1);
    expect(seconds).toBeLessThan(14_400);
  });

  it("second-run player with Evolution Accelerator (0.9× threshold) is faster", () => {
    const firstRunSeconds = simulateTimeToPrestage4(10_000_000, 4, 1);
    // Second run: Evolution Accelerator level 1 reduces threshold to 9 M TD
    const secondRunSeconds = simulateTimeToPrestage4(9_000_000, 4, 1);
    expect(secondRunSeconds).toBeLessThan(firstRunSeconds);
  });
});
