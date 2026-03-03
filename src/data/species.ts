export type Species = "GLORP" | "ZAPPY" | "CHONK" | "WISP" | "MEGA-GLORP";

export interface SpeciesBonus {
  autoGen: number;
  clickPower: number;
  wisdomBonus: number;
}

export const SPECIES_ORDER: readonly Species[] = [
  "GLORP",
  "ZAPPY",
  "CHONK",
  "WISP",
  "MEGA-GLORP",
];

const SPECIES_BONUSES: Readonly<Record<Species, SpeciesBonus>> = {
  GLORP: { autoGen: 1.0, clickPower: 1.0, wisdomBonus: 1.0 },
  ZAPPY: { autoGen: 1.25, clickPower: 1.0, wisdomBonus: 1.0 },
  CHONK: { autoGen: 1.0, clickPower: 1.5, wisdomBonus: 1.0 },
  WISP: { autoGen: 1.0, clickPower: 1.0, wisdomBonus: 1.25 },
  "MEGA-GLORP": { autoGen: 1.1, clickPower: 1.1, wisdomBonus: 1.1 },
};

export function getSpeciesBonus(species: Species): SpeciesBonus {
  return SPECIES_BONUSES[species];
}
