import { describe, expect, it } from "vitest";
import { getSpeciesBonus, SPECIES_ORDER } from "./species";

describe("SPECIES_ORDER", () => {
  it("has 5 species", () => {
    expect(SPECIES_ORDER).toHaveLength(5);
  });

  it("starts with GLORP", () => {
    expect(SPECIES_ORDER[0]).toBe("GLORP");
  });

  it("ends with MEGA-GLORP", () => {
    expect(SPECIES_ORDER[SPECIES_ORDER.length - 1]).toBe("MEGA-GLORP");
  });
});

describe("getSpeciesBonus", () => {
  it("GLORP has no bonuses (all 1.0)", () => {
    const bonus = getSpeciesBonus("GLORP");
    expect(bonus.autoGen).toBe(1.0);
    expect(bonus.clickPower).toBe(1.0);
    expect(bonus.wisdomBonus).toBe(1.0);
  });

  it("ZAPPY has +25% auto-gen", () => {
    const bonus = getSpeciesBonus("ZAPPY");
    expect(bonus.autoGen).toBe(1.25);
    expect(bonus.clickPower).toBe(1.0);
    expect(bonus.wisdomBonus).toBe(1.0);
  });

  it("CHONK has +50% click power", () => {
    const bonus = getSpeciesBonus("CHONK");
    expect(bonus.autoGen).toBe(1.0);
    expect(bonus.clickPower).toBe(1.5);
    expect(bonus.wisdomBonus).toBe(1.0);
  });

  it("WISP has +25% wisdom bonus", () => {
    const bonus = getSpeciesBonus("WISP");
    expect(bonus.autoGen).toBe(1.0);
    expect(bonus.clickPower).toBe(1.0);
    expect(bonus.wisdomBonus).toBe(1.25);
  });

  it("MEGA-GLORP has +10% in all categories", () => {
    const bonus = getSpeciesBonus("MEGA-GLORP");
    expect(bonus.autoGen).toBeCloseTo(1.1);
    expect(bonus.clickPower).toBeCloseTo(1.1);
    expect(bonus.wisdomBonus).toBeCloseTo(1.1);
  });
});
