import { describe, expect, it } from "vitest";
import {
  DIALOGUE,
  getDialogue,
  getPhase89Lines,
  getRandomPhase89Line,
  PHASE89_DIALOGUE,
} from "./dialogue";
import { SPECIES_ORDER } from "./species";

const REQUIRED_TRIGGERS = [
  "comboAchieved",
  "synergyActivated",
  "prestigeShopFirstPurchase",
  "prestigeShopMaxed",
  "challengeStart",
  "dailyObjectiveComplete",
  "dataBurstCollect",
  "dataBurstExpired",
  "achievementUnlocked",
] as const;

const ALL_STAGES = [0, 1, 2, 3, 4];

const VALID_MOODS = [
  "Happy",
  "Neutral",
  "Hungry",
  "Sad",
  "Excited",
  "Philosophical",
];

describe("dialogue data", () => {
  it("has entries for all 5 species", () => {
    for (const species of SPECIES_ORDER) {
      expect(DIALOGUE[species]).toBeDefined();
    }
  });

  it("each species has dialogue for stages 0 through 4", () => {
    for (const species of SPECIES_ORDER) {
      for (const stage of ALL_STAGES) {
        expect(DIALOGUE[species][stage]).toBeDefined();
      }
    }
  });

  it("has at least 5 idle lines per stage per species", () => {
    for (const species of SPECIES_ORDER) {
      for (const stage of ALL_STAGES) {
        expect(DIALOGUE[species][stage].idle.length).toBeGreaterThanOrEqual(5);
      }
    }
  });

  it("has trigger lines for each stage for each species", () => {
    for (const species of SPECIES_ORDER) {
      for (const stage of ALL_STAGES) {
        expect(DIALOGUE[species][stage].triggers.firstEvolution).toBeTruthy();
        expect(DIALOGUE[species][stage].triggers.firstUpgrade).toBeTruthy();
      }
    }
  });

  it("all idle lines have non-empty text strings", () => {
    for (const species of SPECIES_ORDER) {
      for (const stage of ALL_STAGES) {
        for (const line of DIALOGUE[species][stage].idle) {
          expect(typeof line.text).toBe("string");
          expect(line.text.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("has no duplicate idle texts within a stage and species", () => {
    for (const species of SPECIES_ORDER) {
      for (const stage of ALL_STAGES) {
        const texts = DIALOGUE[species][stage].idle.map((l) => l.text);
        const unique = new Set(texts);
        expect(unique.size).toBe(texts.length);
      }
    }
  });

  it("mood tags are valid Mood values when present", () => {
    for (const species of SPECIES_ORDER) {
      for (const stage of ALL_STAGES) {
        for (const line of DIALOGUE[species][stage].idle) {
          if (line.moods) {
            for (const mood of line.moods) {
              expect(VALID_MOODS).toContain(mood);
            }
          }
        }
      }
    }
  });

  it("has mood-tagged lines for Happy, Excited, Hungry, and Sad per species per stage", () => {
    for (const species of SPECIES_ORDER) {
      for (const stage of ALL_STAGES) {
        const moodsPresent = new Set<string>();
        for (const line of DIALOGUE[species][stage].idle) {
          if (line.moods) {
            for (const m of line.moods) {
              moodsPresent.add(m);
            }
          }
        }
        expect(moodsPresent.has("Happy")).toBe(true);
        expect(moodsPresent.has("Excited")).toBe(true);
        expect(moodsPresent.has("Hungry")).toBe(true);
        expect(moodsPresent.has("Sad")).toBe(true);
      }
    }
  });

  it("has untagged lines (available to any mood) per species per stage", () => {
    for (const species of SPECIES_ORDER) {
      for (const stage of ALL_STAGES) {
        const untagged = DIALOGUE[species][stage].idle.filter((l) => !l.moods);
        expect(untagged.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("GLORP stage 3 has assertive personality", () => {
    const lines = DIALOGUE.GLORP[3].idle.map((l) => l.text.toLowerCase());
    const hasAssertive = lines.some(
      (t) =>
        t.includes("i have") ||
        t.includes("i've") ||
        t.includes("my ") ||
        t.includes("always"),
    );
    expect(hasAssertive).toBe(true);
  });

  it("GLORP stage 4 has philosophical musings", () => {
    const lines = DIALOGUE.GLORP[4].idle.map((l) => l.text.toLowerCase());
    const hasPhilosophical = lines.some(
      (t) =>
        t.includes("what is") ||
        t.includes("perhaps") ||
        t.includes("wonder") ||
        t.includes("infinite"),
    );
    expect(hasPhilosophical).toBe(true);
  });

  it("each species has a distinct dialogue flavour at stage 0", () => {
    const stage0Lines = SPECIES_ORDER.map((s) =>
      DIALOGUE[s][0].idle.map((l) => l.text).join(" "),
    );
    const unique = new Set(stage0Lines);
    expect(unique.size).toBe(SPECIES_ORDER.length);
  });
});

describe("PHASE89_DIALOGUE", () => {
  it("has an entry for each required trigger", () => {
    const triggers = PHASE89_DIALOGUE.map((e) => e.trigger);
    for (const key of REQUIRED_TRIGGERS) {
      expect(triggers).toContain(key);
    }
  });

  it("each entry has a non-empty id", () => {
    for (const entry of PHASE89_DIALOGUE) {
      expect(typeof entry.id).toBe("string");
      expect(entry.id.length).toBeGreaterThan(0);
    }
  });

  it("all lines are non-empty strings", () => {
    for (const entry of PHASE89_DIALOGUE) {
      expect(entry.lines.length).toBeGreaterThan(0);
      for (const line of entry.lines) {
        expect(typeof line).toBe("string");
        expect(line.length).toBeGreaterThan(0);
      }
    }
  });

  it("no entry has duplicate lines", () => {
    for (const entry of PHASE89_DIALOGUE) {
      const unique = new Set(entry.lines);
      expect(unique.size).toBe(entry.lines.length);
    }
  });

  it("comboAchieved has at least 3 lines", () => {
    const lines = getPhase89Lines("comboAchieved");
    expect(lines.length).toBeGreaterThanOrEqual(3);
  });

  it("synergyActivated has at least 3 lines", () => {
    const lines = getPhase89Lines("synergyActivated");
    expect(lines.length).toBeGreaterThanOrEqual(3);
  });

  it("prestigeShopFirstPurchase has at least 3 lines", () => {
    const lines = getPhase89Lines("prestigeShopFirstPurchase");
    expect(lines.length).toBeGreaterThanOrEqual(3);
  });

  it("prestigeShopMaxed has at least 3 lines", () => {
    const lines = getPhase89Lines("prestigeShopMaxed");
    expect(lines.length).toBeGreaterThanOrEqual(3);
  });

  it("challengeStart has at least 2 lines", () => {
    const lines = getPhase89Lines("challengeStart");
    expect(lines.length).toBeGreaterThanOrEqual(2);
  });

  it("dailyObjectiveComplete has at least 2 lines", () => {
    const lines = getPhase89Lines("dailyObjectiveComplete");
    expect(lines.length).toBeGreaterThanOrEqual(2);
  });

  it("achievementUnlocked has at least 3 lines", () => {
    const lines = getPhase89Lines("achievementUnlocked");
    expect(lines.length).toBeGreaterThanOrEqual(3);
  });

  it("no duplicate ids across entries", () => {
    const ids = PHASE89_DIALOGUE.map((e) => e.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

describe("getPhase89Lines", () => {
  it("returns lines for a valid trigger key", () => {
    const lines = getPhase89Lines("comboAchieved");
    expect(lines.length).toBeGreaterThan(0);
  });

  it("returns empty array for unknown trigger", () => {
    const lines = getPhase89Lines("nonExistent" as never);
    expect(lines).toEqual([]);
  });
});

describe("getRandomPhase89Line", () => {
  it("returns a non-empty string for a valid trigger", () => {
    const line = getRandomPhase89Line("challengeStart");
    expect(typeof line).toBe("string");
    expect(line.length).toBeGreaterThan(0);
  });

  it("returns a line that exists in the entry", () => {
    const lines = getPhase89Lines("prestigeShopMaxed");
    const line = getRandomPhase89Line("prestigeShopMaxed");
    expect(lines).toContain(line);
  });

  it("returns empty string for unknown trigger", () => {
    const line = getRandomPhase89Line("nonExistent" as never);
    expect(line).toBe("");
  });
});

describe("getDialogue", () => {
  it("returns correct dialogue for GLORP stage 0", () => {
    expect(getDialogue("GLORP", 0)).toBe(DIALOGUE.GLORP[0]);
  });

  it("returns correct dialogue for ZAPPY stage 2", () => {
    expect(getDialogue("ZAPPY", 2)).toBe(DIALOGUE.ZAPPY[2]);
  });

  it("returns stage 0 fallback for unknown stage", () => {
    expect(getDialogue("CHONK", 99)).toBe(DIALOGUE.CHONK[0]);
  });
});
