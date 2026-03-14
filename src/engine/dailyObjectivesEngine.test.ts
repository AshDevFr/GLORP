import { describe, expect, it } from "vitest";
import { D } from "../utils/decimal";
import {
  checkObjectiveCompletion,
  createSeededRandom,
  DAILY_OBJECTIVE_POOL,
  type DailyObjective,
  type DailyTrackingState,
  dateToSeed,
  getCurrentDateUTC,
  pickDailyObjectives,
} from "./dailyObjectivesEngine";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const baseGame = {
  evolutionStage: 0,
  upgradeOwned: {},
  totalTdEarned: D(0),
  crossedMilestones: [] as number[],
  currentSpecies: "GLORP" as const,
} satisfies Parameters<typeof checkObjectiveCompletion>[1];

const baseDaily: DailyTrackingState = {
  todayClickCount: 0,
  todayMaxCombo: 0,
  todayDidRebirth: false,
  todayDidBulkBuy50: false,
  todayDidCollectOffline: false,
  todayDidPrestigePurchase: false,
};

// ── Pool tests ─────────────────────────────────────────────────────────────────

describe("DAILY_OBJECTIVE_POOL", () => {
  it("contains at least 12 distinct objective types", () => {
    const types = new Set(DAILY_OBJECTIVE_POOL.map((o) => o.type));
    expect(types.size).toBeGreaterThanOrEqual(12);
  });

  it("every objective has a unique id", () => {
    const ids = DAILY_OBJECTIVE_POOL.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every objective awards exactly 5 wisdom tokens", () => {
    for (const obj of DAILY_OBJECTIVE_POOL) {
      expect(obj.reward).toBe(5);
    }
  });
});

// ── PRNG / date utilities ─────────────────────────────────────────────────────

describe("dateToSeed", () => {
  it("converts YYYY-MM-DD to an integer", () => {
    expect(dateToSeed("2026-03-04")).toBe(20260304);
  });
});

describe("createSeededRandom", () => {
  it("returns values in [0, 1)", () => {
    const rng = createSeededRandom(12345);
    for (let i = 0; i < 20; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("produces deterministic output for the same seed", () => {
    const rng1 = createSeededRandom(42);
    const rng2 = createSeededRandom(42);
    for (let i = 0; i < 10; i++) {
      expect(rng1()).toBe(rng2());
    }
  });

  it("produces different output for different seeds", () => {
    const a = createSeededRandom(1)();
    const b = createSeededRandom(2)();
    expect(a).not.toBe(b);
  });
});

describe("getCurrentDateUTC", () => {
  it("returns a YYYY-MM-DD string", () => {
    expect(getCurrentDateUTC()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// ── pickDailyObjectives ───────────────────────────────────────────────────────

describe("pickDailyObjectives", () => {
  it("returns exactly 3 objectives", () => {
    expect(pickDailyObjectives("2026-03-04")).toHaveLength(3);
  });

  it("is deterministic for the same date", () => {
    const a = pickDailyObjectives("2026-03-04").map((o) => o.id);
    const b = pickDailyObjectives("2026-03-04").map((o) => o.id);
    expect(a).toEqual(b);
  });

  it("returns different objectives for different dates", () => {
    const a = pickDailyObjectives("2026-03-04").map((o) => o.id);
    const b = pickDailyObjectives("2026-03-05").map((o) => o.id);
    expect(a).not.toEqual(b);
  });

  it("never picks the same objective twice in a day", () => {
    const objectives = pickDailyObjectives("2026-03-04");
    const ids = objectives.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ── checkObjectiveCompletion ──────────────────────────────────────────────────

describe("checkObjectiveCompletion — reach-stage", () => {
  const obj: DailyObjective = {
    id: "reach-stage-3",
    type: "reach-stage",
    description: "Reach Cortex",
    reward: 5,
    targetStage: 3,
  };
  it("returns false when below target", () => {
    expect(
      checkObjectiveCompletion(
        obj,
        { ...baseGame, evolutionStage: 2 },
        baseDaily,
      ),
    ).toBe(false);
  });
  it("returns true when at target", () => {
    expect(
      checkObjectiveCompletion(
        obj,
        { ...baseGame, evolutionStage: 3 },
        baseDaily,
      ),
    ).toBe(true);
  });
  it("returns true when above target", () => {
    expect(
      checkObjectiveCompletion(
        obj,
        { ...baseGame, evolutionStage: 5 },
        baseDaily,
      ),
    ).toBe(true);
  });
});

describe("checkObjectiveCompletion — buy-generator", () => {
  const obj: DailyObjective = {
    id: "buy-generator-25",
    type: "buy-generator",
    description: "Own 25",
    reward: 5,
    targetCount: 25,
  };
  it("returns false when no generator meets threshold", () => {
    expect(
      checkObjectiveCompletion(
        obj,
        { ...baseGame, upgradeOwned: { "neural-notepad": 10 } },
        baseDaily,
      ),
    ).toBe(false);
  });
  it("returns true when any generator meets threshold", () => {
    expect(
      checkObjectiveCompletion(
        obj,
        { ...baseGame, upgradeOwned: { "neural-notepad": 25 } },
        baseDaily,
      ),
    ).toBe(true);
  });
});

describe("checkObjectiveCompletion — click-total", () => {
  const obj: DailyObjective = {
    id: "click-total-100",
    type: "click-total",
    description: "Click 100",
    reward: 5,
    targetCount: 100,
  };
  it("returns false below target", () => {
    expect(
      checkObjectiveCompletion(obj, baseGame, {
        ...baseDaily,
        todayClickCount: 50,
      }),
    ).toBe(false);
  });
  it("returns true at target", () => {
    expect(
      checkObjectiveCompletion(obj, baseGame, {
        ...baseDaily,
        todayClickCount: 100,
      }),
    ).toBe(true);
  });
});

describe("checkObjectiveCompletion — get-combo", () => {
  const obj: DailyObjective = {
    id: "get-combo-10",
    type: "get-combo",
    description: "Combo 10×",
    reward: 5,
    targetCount: 10,
  };
  it("returns false below target", () => {
    expect(
      checkObjectiveCompletion(obj, baseGame, {
        ...baseDaily,
        todayMaxCombo: 5,
      }),
    ).toBe(false);
  });
  it("returns true at target", () => {
    expect(
      checkObjectiveCompletion(obj, baseGame, {
        ...baseDaily,
        todayMaxCombo: 10,
      }),
    ).toBe(true);
  });
});

describe("checkObjectiveCompletion — buy-prestige", () => {
  const obj: DailyObjective = {
    id: "buy-prestige",
    type: "buy-prestige",
    description: "Buy prestige",
    reward: 5,
  };
  it("returns false when no prestige bought today", () => {
    expect(checkObjectiveCompletion(obj, baseGame, baseDaily)).toBe(false);
  });
  it("returns true when prestige bought today", () => {
    expect(
      checkObjectiveCompletion(obj, baseGame, {
        ...baseDaily,
        todayDidPrestigePurchase: true,
      }),
    ).toBe(true);
  });
});

describe("checkObjectiveCompletion — earn-td", () => {
  const obj: DailyObjective = {
    id: "earn-td-1m",
    type: "earn-td",
    description: "Earn 1M",
    reward: 5,
    targetTd: 1_000_000,
  };
  it("returns false below target", () => {
    expect(
      checkObjectiveCompletion(
        obj,
        { ...baseGame, totalTdEarned: D(500_000) },
        baseDaily,
      ),
    ).toBe(false);
  });
  it("returns true at target", () => {
    expect(
      checkObjectiveCompletion(
        obj,
        { ...baseGame, totalTdEarned: D(1_000_000) },
        baseDaily,
      ),
    ).toBe(true);
  });
});

describe("checkObjectiveCompletion — rebirth", () => {
  const obj: DailyObjective = {
    id: "rebirth",
    type: "rebirth",
    description: "Rebirth",
    reward: 5,
  };
  it("returns false without rebirth", () => {
    expect(checkObjectiveCompletion(obj, baseGame, baseDaily)).toBe(false);
  });
  it("returns true after rebirth", () => {
    expect(
      checkObjectiveCompletion(obj, baseGame, {
        ...baseDaily,
        todayDidRebirth: true,
      }),
    ).toBe(true);
  });
});

describe("checkObjectiveCompletion — milestone-reach", () => {
  const obj: DailyObjective = {
    id: "milestone-reach",
    type: "milestone-reach",
    description: "Milestone",
    reward: 5,
  };
  it("returns false with no crossed milestones", () => {
    expect(checkObjectiveCompletion(obj, baseGame, baseDaily)).toBe(false);
  });
  it("returns true with at least one crossed milestone", () => {
    expect(
      checkObjectiveCompletion(
        obj,
        { ...baseGame, crossedMilestones: [10] },
        baseDaily,
      ),
    ).toBe(true);
  });
});

describe("checkObjectiveCompletion — synergy-active", () => {
  const obj: DailyObjective = {
    id: "synergy-active",
    type: "synergy-active",
    description: "3 synergies",
    reward: 5,
  };
  it("returns false with no generators", () => {
    expect(checkObjectiveCompletion(obj, baseGame, baseDaily)).toBe(false);
  });
});

describe("checkObjectiveCompletion — species-play", () => {
  const obj: DailyObjective = {
    id: "species-play-zappy",
    type: "species-play",
    description: "Play ZAPPY",
    reward: 5,
    targetSpecies: "ZAPPY",
  };
  it("returns false for different species", () => {
    expect(
      checkObjectiveCompletion(
        obj,
        { ...baseGame, currentSpecies: "GLORP" },
        baseDaily,
      ),
    ).toBe(false);
  });
  it("returns true for matching species", () => {
    expect(
      checkObjectiveCompletion(
        obj,
        { ...baseGame, currentSpecies: "ZAPPY" },
        baseDaily,
      ),
    ).toBe(true);
  });
});

describe("checkObjectiveCompletion — bulk-buy", () => {
  const obj: DailyObjective = {
    id: "bulk-buy-50",
    type: "bulk-buy",
    description: "Bulk buy 50",
    reward: 5,
  };
  it("returns false without bulk buy event", () => {
    expect(checkObjectiveCompletion(obj, baseGame, baseDaily)).toBe(false);
  });
  it("returns true after bulk buy event", () => {
    expect(
      checkObjectiveCompletion(obj, baseGame, {
        ...baseDaily,
        todayDidBulkBuy50: true,
      }),
    ).toBe(true);
  });
});

describe("checkObjectiveCompletion — offline-bonus", () => {
  const obj: DailyObjective = {
    id: "offline-bonus",
    type: "offline-bonus",
    description: "Offline bonus",
    reward: 5,
  };
  it("returns false without offline event", () => {
    expect(checkObjectiveCompletion(obj, baseGame, baseDaily)).toBe(false);
  });
  it("returns true after offline bonus collected", () => {
    expect(
      checkObjectiveCompletion(obj, baseGame, {
        ...baseDaily,
        todayDidCollectOffline: true,
      }),
    ).toBe(true);
  });
});
