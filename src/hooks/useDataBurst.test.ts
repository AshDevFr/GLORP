import { describe, expect, it } from "vitest";
import {
  BURST_BOOST_DURATION_MS,
  BURST_BOOST_MULTIPLIER,
  BURST_DISCOUNT_DURATION_MS,
} from "./useDataBurst";

describe("useDataBurst constants", () => {
  it("BURST_BOOST_DURATION_MS is 45 seconds", () => {
    expect(BURST_BOOST_DURATION_MS).toBe(45_000);
  });

  it("BURST_BOOST_MULTIPLIER is 3", () => {
    expect(BURST_BOOST_MULTIPLIER).toBe(3);
  });

  it("BURST_DISCOUNT_DURATION_MS is 30 seconds", () => {
    expect(BURST_DISCOUNT_DURATION_MS).toBe(30_000);
  });
});
