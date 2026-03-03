import { describe, expect, it } from "vitest";
import { formatNumber, formatNumberFull } from "./formatNumber";

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

    it("truncates decimals >= 1 to integer", () => {
      expect(formatNumber(1.9)).toBe("1");
      expect(formatNumber(999.99)).toBe("999");
    });

    it("formats fractional values between 0 and 1 with 2 decimal places", () => {
      expect(formatNumber(0.1)).toBe("0.10");
      expect(formatNumber(0.5)).toBe("0.50");
      expect(formatNumber(0.75)).toBe("0.75");
      expect(formatNumber(0.01)).toBe("0.01");
    });
  });

  describe("thousands", () => {
    it("formats exactly 1,000", () => {
      expect(formatNumber(1_000)).toBe("1,000");
    });

    it("formats thousands with commas", () => {
      expect(formatNumber(1_234)).toBe("1,234");
      expect(formatNumber(9_999)).toBe("9,999");
      expect(formatNumber(999_999)).toBe("999,999");
    });
  });

  describe("millions", () => {
    it("formats exactly 1,000,000", () => {
      expect(formatNumber(1_000_000)).toBe("1,000,000");
    });

    it("formats millions with commas", () => {
      expect(formatNumber(4_560_000)).toBe("4,560,000");
      expect(formatNumber(999_999_999)).toBe("999,999,999");
    });
  });

  describe("billions", () => {
    it("formats exactly 1,000,000,000", () => {
      expect(formatNumber(1_000_000_000)).toBe("1,000,000,000");
    });

    it("formats large billions", () => {
      expect(formatNumber(1_500_000_000)).toBe("1,500,000,000");
      expect(formatNumber(999_000_000_000)).toBe("999,000,000,000");
    });
  });

  describe("trillions", () => {
    it("formats exactly 1 trillion", () => {
      expect(formatNumber(1_000_000_000_000)).toBe("1,000,000,000,000");
    });

    it("formats trillions without exponential notation", () => {
      expect(formatNumber(4_560_000_000_000)).toBe("4,560,000,000,000");
      expect(formatNumber(999_000_000_000_000)).toBe("999,000,000,000,000");
    });
  });

  describe("very large numbers", () => {
    it("formats quadrillions without exponential notation", () => {
      expect(formatNumber(1_000_000_000_000_000)).toBe("1,000,000,000,000,000");
      expect(formatNumber(2_500_000_000_000_000)).toBe("2,500,000,000,000,000");
    });
  });

  describe("negative values", () => {
    it("formats negative small values", () => {
      expect(formatNumber(-42)).toBe("-42");
    });

    it("formats negative thousands", () => {
      expect(formatNumber(-1_234)).toBe("-1,234");
    });

    it("formats negative millions", () => {
      expect(formatNumber(-4_560_000)).toBe("-4,560,000");
    });

    it("formats negative billions", () => {
      expect(formatNumber(-1_000_000_000)).toBe("-1,000,000,000");
    });
  });

  describe("edge cases", () => {
    it("formats -0 as 0", () => {
      expect(formatNumber(-0)).toBe("0");
    });
  });
});

describe("formatNumberFull", () => {
  it("formats 0", () => {
    expect(formatNumberFull(0)).toBe("0");
  });

  it("formats small integers without commas", () => {
    expect(formatNumberFull(42)).toBe("42");
    expect(formatNumberFull(999)).toBe("999");
  });

  it("formats thousands with commas", () => {
    expect(formatNumberFull(1_000)).toBe("1,000");
    expect(formatNumberFull(1_234)).toBe("1,234");
    expect(formatNumberFull(999_999)).toBe("999,999");
  });

  it("formats millions with commas", () => {
    expect(formatNumberFull(1_000_000)).toBe("1,000,000");
    expect(formatNumberFull(1_234_567)).toBe("1,234,567");
  });

  it("formats billions with commas", () => {
    expect(formatNumberFull(1_234_567_890)).toBe("1,234,567,890");
  });

  it("truncates decimals to integer", () => {
    expect(formatNumberFull(1_234.56)).toBe("1,234");
    expect(formatNumberFull(999.99)).toBe("999");
  });

  it("formats fractional values between 0 and 1 with 2 decimal places", () => {
    expect(formatNumberFull(0.5)).toBe("0.50");
    expect(formatNumberFull(0.01)).toBe("0.01");
  });

  it("formats negative values", () => {
    expect(formatNumberFull(-42)).toBe("-42");
    expect(formatNumberFull(-1_234)).toBe("-1,234");
    expect(formatNumberFull(-1_000_000)).toBe("-1,000,000");
  });
});
