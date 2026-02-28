import { describe, expect, it } from "vitest";
import { UPGRADES } from "./upgrades";

describe("UPGRADES", () => {
  it("contains at least 6 upgrades", () => {
    expect(UPGRADES.length).toBeGreaterThanOrEqual(6);
  });

  it("has unique ids", () => {
    const ids = UPGRADES.map((u) => u.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("includes both garage-lab and startup tiers", () => {
    const tiers = new Set(UPGRADES.map((u) => u.tier));
    expect(tiers.has("garage-lab")).toBe(true);
    expect(tiers.has("startup")).toBe(true);
  });

  it("each upgrade has required fields", () => {
    for (const u of UPGRADES) {
      expect(u.id).toBeTruthy();
      expect(u.name).toBeTruthy();
      expect(u.description).toBeTruthy();
      expect(u.baseCost).toBeGreaterThan(0);
      expect(u.baseTdPerSecond).toBeGreaterThan(0);
      expect(u.icon).toBeTruthy();
    }
  });

  it("garage-lab upgrades cost between 10 and 500", () => {
    const garageLab = UPGRADES.filter((u) => u.tier === "garage-lab");
    expect(garageLab.length).toBeGreaterThanOrEqual(3);
    for (const u of garageLab) {
      expect(u.baseCost).toBeGreaterThanOrEqual(10);
      expect(u.baseCost).toBeLessThanOrEqual(500);
    }
  });

  it("startup upgrades cost between 1K and 50K", () => {
    const startup = UPGRADES.filter((u) => u.tier === "startup");
    expect(startup.length).toBeGreaterThanOrEqual(3);
    for (const u of startup) {
      expect(u.baseCost).toBeGreaterThanOrEqual(1_000);
      expect(u.baseCost).toBeLessThanOrEqual(50_000);
    }
  });
});
