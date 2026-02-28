import { describe, expect, it } from "vitest";
import { formatNumber } from "./formatNumber";

describe("formatNumber", () => {
  describe("values below 1,000", () => {
    it("formats 0", () => {
      expect(formatNumber(0)).toBe("0");
    });

    it("formats small integers", () => {
      expect(formatNumber(1)).toBe("1");
      expect(formatNumber(42)).toBe("42");
      expect(formatNumber(999)).toBe("999");
    });

    it("truncates decimals to integer", () => {
      expect(formatNumber(1.9)).toBe("1");
      expect(formatNumber(999.99)).toBe("999");
    });
  });

  describe("thousands (K)", () => {
    it("formats exactly 1,000", () => {
      expect(formatNumber(1_000)).toBe("1.00K");
    });

    it("formats with 2 decimal places", () => {
      expect(formatNumber(1_234)).toBe("1.23K");
      expect(formatNumber(9_999)).toBe("10.00K");
      expect(formatNumber(999_999)).toBe("1000.00K");
    });

    it("boundary just below 1M", () => {
      expect(formatNumber(999_999)).toBe("1000.00K");
    });
  });

  describe("millions (M)", () => {
    it("formats exactly 1,000,000", () => {
      expect(formatNumber(1_000_000)).toBe("1.00M");
    });

    it("formats with 2 decimal places", () => {
      expect(formatNumber(4_560_000)).toBe("4.56M");
      expect(formatNumber(999_999_999)).toBe("1000.00M");
    });
  });

  describe("billions (B)", () => {
    it("formats exactly 1,000,000,000", () => {
      expect(formatNumber(1_000_000_000)).toBe("1.00B");
    });

    it("formats large billions", () => {
      expect(formatNumber(1_500_000_000)).toBe("1.50B");
      expect(formatNumber(999_000_000_000)).toBe("999.00B");
    });

    it("formats very large numbers", () => {
      expect(formatNumber(1_000_000_000_000)).toBe("1000.00B");
      expect(formatNumber(1e15)).toBe("1000000.00B");
    });
  });

  describe("negative values", () => {
    it("formats negative small values", () => {
      expect(formatNumber(-42)).toBe("-42");
    });

    it("formats negative thousands", () => {
      expect(formatNumber(-1_234)).toBe("-1.23K");
    });

    it("formats negative millions", () => {
      expect(formatNumber(-4_560_000)).toBe("-4.56M");
    });

    it("formats negative billions", () => {
      expect(formatNumber(-1_000_000_000)).toBe("-1.00B");
    });
  });

  describe("edge cases", () => {
    it("formats -0 as 0", () => {
      expect(formatNumber(-0)).toBe("0");
    });
  });
});
