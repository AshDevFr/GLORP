import { describe, expect, it } from "vitest";
import { ASCII_ART, getAsciiArt, getAsciiFrames } from "./asciiArt";
import type { Species } from "./species";
import { SPECIES_ORDER } from "./species";

const STAGES = [0, 1, 2, 3, 4, 5] as const;

/**
 * Strip HTML tags from a string so we can measure the
 * "visible" content of frames that contain color spans.
 */
function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, "");
}

describe("ASCII_ART", () => {
  it("contains all 5 species", () => {
    for (const species of SPECIES_ORDER) {
      expect(ASCII_ART[species]).toBeDefined();
    }
  });

  it("each species has frames for all 6 stages", () => {
    for (const species of SPECIES_ORDER) {
      for (const stage of STAGES) {
        const frames = ASCII_ART[species][stage];
        expect(frames).toBeDefined();
        expect(Array.isArray(frames)).toBe(true);
        expect(frames.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("all frames are non-empty strings", () => {
    for (const species of SPECIES_ORDER) {
      for (const stage of STAGES) {
        for (const frame of ASCII_ART[species][stage]) {
          expect(typeof frame).toBe("string");
          expect(frame.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("all frames within a stage have the same line count", () => {
    for (const species of SPECIES_ORDER) {
      for (const stage of STAGES) {
        const frameCounts = ASCII_ART[species][stage].map(
          (f) => stripHtml(f).split("\n").length,
        );
        const first = frameCounts[0];
        for (const count of frameCounts) {
          expect(count).toBe(first);
        }
      }
    }
  });

  describe("GLORP species size requirements", () => {
    it("stage 0 (Blob) is at least 12 lines", () => {
      const lines = stripHtml(ASCII_ART.GLORP[0][0]).split("\n").length;
      expect(lines).toBeGreaterThanOrEqual(12);
    });

    it("stage 1 (Spark) is at least 14 lines", () => {
      const lines = stripHtml(ASCII_ART.GLORP[1][0]).split("\n").length;
      expect(lines).toBeGreaterThanOrEqual(14);
    });

    it("stage 2 (Neuron) is at least 17 lines", () => {
      const lines = stripHtml(ASCII_ART.GLORP[2][0]).split("\n").length;
      expect(lines).toBeGreaterThanOrEqual(17);
    });

    it("stage 3 (Cortex) is at least 20 lines", () => {
      const lines = stripHtml(ASCII_ART.GLORP[3][0]).split("\n").length;
      expect(lines).toBeGreaterThanOrEqual(20);
    });

    it("stage 4 (Oracle) is at least 23 lines", () => {
      const lines = stripHtml(ASCII_ART.GLORP[4][0]).split("\n").length;
      expect(lines).toBeGreaterThanOrEqual(23);
    });

    it("stage 5 (Singularity) is at least 25 lines", () => {
      const lines = stripHtml(ASCII_ART.GLORP[5][0]).split("\n").length;
      expect(lines).toBeGreaterThanOrEqual(25);
    });

    it("art grows in size across stages", () => {
      const sizes = STAGES.map(
        (s) => stripHtml(ASCII_ART.GLORP[s][0]).split("\n").length,
      );
      for (let i = 1; i < sizes.length; i++) {
        expect(sizes[i]).toBeGreaterThan(sizes[i - 1]);
      }
    });
  });

  describe("art is visually distinct between species", () => {
    it("stage 0 art differs across all species", () => {
      const arts = SPECIES_ORDER.map((s) => stripHtml(ASCII_ART[s][0][0]));
      const unique = new Set(arts);
      expect(unique.size).toBe(SPECIES_ORDER.length);
    });

    it("stage 4 art differs across all species", () => {
      const arts = SPECIES_ORDER.map((s) => stripHtml(ASCII_ART[s][4][0]));
      const unique = new Set(arts);
      expect(unique.size).toBe(SPECIES_ORDER.length);
    });
  });

  describe("color spans", () => {
    it("at least some art contains color span markup", () => {
      let found = false;
      for (const species of SPECIES_ORDER) {
        for (const stage of STAGES) {
          if (ASCII_ART[species][stage][0].includes("<span")) {
            found = true;
            break;
          }
        }
        if (found) break;
      }
      expect(found).toBe(true);
    });

    it("all spans are properly closed", () => {
      for (const species of SPECIES_ORDER) {
        for (const stage of STAGES) {
          for (const frame of ASCII_ART[species][stage]) {
            const opens = (frame.match(/<span/g) ?? []).length;
            const closes = (frame.match(/<\/span>/g) ?? []).length;
            expect(opens).toBe(closes);
          }
        }
      }
    });
  });
});

describe("getAsciiFrames", () => {
  it("returns an array of frames for GLORP stage 0", () => {
    const result = getAsciiFrames("GLORP", 0);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result).toBe(ASCII_ART.GLORP[0]);
  });

  it("returns frames for ZAPPY stage 4", () => {
    expect(getAsciiFrames("ZAPPY", 4)).toBe(ASCII_ART.ZAPPY[4]);
  });

  it("returns stage 0 as fallback for unknown stage", () => {
    expect(getAsciiFrames("CHONK", 99)).toBe(ASCII_ART.CHONK[0]);
  });

  it("returns frames for every species at every stage", () => {
    for (const species of SPECIES_ORDER) {
      for (const stage of STAGES) {
        const result = getAsciiFrames(species as Species, stage);
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThanOrEqual(1);
      }
    }
  });
});

describe("getAsciiArt (backward compat)", () => {
  it("returns first frame as a string", () => {
    const art = getAsciiArt("GLORP", 0);
    expect(typeof art).toBe("string");
    expect(art).toBe(ASCII_ART.GLORP[0][0]);
  });

  it("returns stage 0 fallback for unknown stage", () => {
    expect(getAsciiArt("WISP", 99)).toBe(ASCII_ART.WISP[0][0]);
  });
});
