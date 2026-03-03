import { describe, expect, it } from "vitest";
import { interpolateTd } from "./useInterpolatedTd";

describe("interpolateTd", () => {
  describe("snaps when no passive income", () => {
    it("returns actual when tdPerSecond is 0", () => {
      expect(interpolateTd(100, 105, 0, 0.016)).toBe(105);
    });

    it("returns actual when tdPerSecond is negative", () => {
      expect(interpolateTd(100, 50, -1, 0.016)).toBe(50);
    });
  });

  describe("snaps on significant downward drift (purchase)", () => {
    it("snaps when prev is more than 1.5 ticks ahead of actual", () => {
      // tdPerSecond=10, 1.5 ticks = 15 TD drift threshold
      // prev=120, actual=100 → drift=20 > 15 → snap
      expect(interpolateTd(120, 100, 10, 0.016)).toBe(100);
    });

    it("does NOT snap for normal interpolation ahead of actual", () => {
      // prev=105, actual=100 → drift=5 < 15 → interpolate
      const result = interpolateTd(105, 100, 10, 0.016);
      expect(result).toBeGreaterThan(105); // keeps counting
      expect(result).toBeLessThanOrEqual(110); // capped at actual + 1 tick
    });
  });

  describe("snaps on significant upward jump (offline progress)", () => {
    it("snaps when actual is more than 2 ticks ahead of prev", () => {
      // tdPerSecond=10, 2 ticks = 20 TD threshold
      // actual=130, prev=100 → gap=30 > 20 → snap
      expect(interpolateTd(100, 130, 10, 0.016)).toBe(130);
    });

    it("does NOT snap for a normal tick update", () => {
      // prev=99, actual=100 (just ticked), gap=1 < 20 → interpolate
      const result = interpolateTd(99, 100, 10, 0.016);
      expect(result).toBeGreaterThan(99); // keeps counting
    });
  });

  describe("normal interpolation", () => {
    it("advances prev by tdPerSecond * elapsed each frame", () => {
      // prev=100, actual=100, tdPerSecond=10, elapsed=0.016 (1 frame @ 60fps)
      const result = interpolateTd(100, 100, 10, 0.016);
      expect(result).toBeCloseTo(100.16, 1);
    });

    it("caps at actual + tdPerSecond (one tick ahead)", () => {
      // prev=109, actual=100, tdPerSecond=10, ceiling=110
      // next would be 109 + 10*10 = 209, but capped at 110
      const result = interpolateTd(109, 100, 10, 10);
      expect(result).toBe(110);
    });

    it("continues smoothly after tick fires", () => {
      // Tick fires: actual jumps from 100 to 110, prev was interpolated to ~110
      // Now prev≈110, actual=110, tdPerSecond=10
      const result = interpolateTd(110, 110, 10, 0.016);
      expect(result).toBeCloseTo(110.16, 1);
    });
  });

  describe("edge cases", () => {
    it("handles zero actual and zero prev", () => {
      expect(interpolateTd(0, 0, 10, 0.016)).toBeCloseTo(0.16, 1);
    });

    it("handles very small tdPerSecond", () => {
      const result = interpolateTd(0.05, 0, 0.1, 0.016);
      // drift = 0.05 - 0 = 0.05 > 0.1 * 1.5 = 0.15? No → interpolate
      expect(result).toBeCloseTo(0.0516, 3);
    });
  });
});
