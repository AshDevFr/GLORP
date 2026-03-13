import { describe, expect, it } from "vitest";
import { UPGRADES } from "./upgrades";

describe("UPGRADES", () => {
  it("contains at least 14 upgrades", () => {
    expect(UPGRADES.length).toBeGreaterThanOrEqual(14);
  });

  it("has unique ids", () => {
    const ids = UPGRADES.map((u) => u.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("includes all four tiers", () => {
    const tiers = new Set(UPGRADES.map((u) => u.tier));
    expect(tiers.has("garage-lab")).toBe(true);
    expect(tiers.has("startup")).toBe(true);
    expect(tiers.has("scale-up")).toBe(true);
    expect(tiers.has("mega-corp")).toBe(true);
  });

  it("each upgrade has required fields", () => {
    for (const u of UPGRADES) {
      expect(u.id).toBeTruthy();
      expect(u.name).toBeTruthy();
      expect(u.description).toBeTruthy();
      expect(u.baseCost).toBeGreaterThan(0);
      expect(u.baseTdPerSecond).toBeGreaterThan(0);
      expect(u.icon).toBeTruthy();
      expect(typeof u.unlockStage).toBe("number");
    }
  });

  it("garage-lab upgrades cost between 10 and 1,000", () => {
    const garageLab = UPGRADES.filter((u) => u.tier === "garage-lab");
    expect(garageLab.length).toBeGreaterThanOrEqual(3);
    for (const u of garageLab) {
      expect(u.baseCost).toBeGreaterThanOrEqual(10);
      expect(u.baseCost).toBeLessThanOrEqual(1_000);
    }
  });

  it("startup upgrades cost between 10K and 1M", () => {
    const startup = UPGRADES.filter((u) => u.tier === "startup");
    expect(startup.length).toBeGreaterThanOrEqual(3);
    for (const u of startup) {
      expect(u.baseCost).toBeGreaterThanOrEqual(10_000);
      expect(u.baseCost).toBeLessThanOrEqual(1_000_000);
    }
  });

  it("scale-up tier has at least 4 upgrades with costs 10M–10B", () => {
    const scaleUp = UPGRADES.filter((u) => u.tier === "scale-up");
    expect(scaleUp.length).toBeGreaterThanOrEqual(4);
    for (const u of scaleUp) {
      expect(u.baseCost).toBeGreaterThanOrEqual(10_000_000);
      expect(u.baseCost).toBeLessThanOrEqual(10_000_000_000);
    }
  });

  it("mega-corp tier has at least 4 upgrades with costs 100B–100T", () => {
    const megaCorp = UPGRADES.filter((u) => u.tier === "mega-corp");
    expect(megaCorp.length).toBeGreaterThanOrEqual(4);
    for (const u of megaCorp) {
      expect(u.baseCost).toBeGreaterThanOrEqual(100_000_000_000);
      expect(u.baseCost).toBeLessThanOrEqual(100_000_000_000_000);
    }
  });

  it("scale-up upgrades have unlockStage 2", () => {
    const scaleUp = UPGRADES.filter((u) => u.tier === "scale-up");
    for (const u of scaleUp) {
      expect(u.unlockStage).toBe(2);
    }
  });

  it("mega-corp upgrades have unlockStage 3", () => {
    const megaCorp = UPGRADES.filter((u) => u.tier === "mega-corp");
    for (const u of megaCorp) {
      expect(u.unlockStage).toBe(3);
    }
  });

  it("garage-lab and startup upgrades have unlockStage 0", () => {
    const earlyTier = UPGRADES.filter(
      (u) => u.tier === "garage-lab" || u.tier === "startup",
    );
    for (const u of earlyTier) {
      expect(u.unlockStage).toBe(0);
    }
  });

  it("each consecutive generator produces 8-12x the previous tier", () => {
    for (let i = 1; i < UPGRADES.length; i++) {
      const ratio =
        UPGRADES[i].baseTdPerSecond / UPGRADES[i - 1].baseTdPerSecond;
      expect(ratio).toBeGreaterThanOrEqual(8);
      expect(ratio).toBeLessThanOrEqual(12);
    }
  });

  it("each consecutive generator costs approximately 10x the previous", () => {
    for (let i = 1; i < UPGRADES.length; i++) {
      const ratio = UPGRADES[i].baseCost / UPGRADES[i - 1].baseCost;
      expect(ratio).toBeGreaterThanOrEqual(5);
      expect(ratio).toBeLessThanOrEqual(15);
    }
  });

  it("cheapest generator pays for itself within 30-60 seconds", () => {
    const cheapest = UPGRADES[0];
    const payback = cheapest.baseCost / cheapest.baseTdPerSecond;
    expect(payback).toBeGreaterThanOrEqual(30);
    expect(payback).toBeLessThanOrEqual(60);
  });
});
