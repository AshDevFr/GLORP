import type { GameState } from "../store/gameStore";
import { getActiveSynergies } from "./synergyEngine";

// ── Objective types ──────────────────────────────────────────────────────────

export type ObjectiveType =
  | "reach-stage"
  | "buy-generator"
  | "click-total"
  | "get-combo"
  | "buy-prestige"
  | "earn-td"
  | "rebirth"
  | "milestone-reach"
  | "synergy-active"
  | "species-play"
  | "bulk-buy"
  | "offline-bonus";

export interface DailyObjective {
  id: string;
  type: ObjectiveType;
  description: string;
  reward: number;
  // Type-specific parameters
  targetStage?: number;
  targetCount?: number;
  targetTd?: number;
  targetSpecies?: string;
}

// ── Objective pool (19 objectives across 12 types) ───────────────────────────

export const DAILY_OBJECTIVE_POOL: readonly DailyObjective[] = [
  {
    id: "reach-stage-2",
    type: "reach-stage",
    description: "Reach the Neuron stage this run",
    reward: 5,
    targetStage: 2,
  },
  {
    id: "reach-stage-3",
    type: "reach-stage",
    description: "Reach the Cortex stage this run",
    reward: 5,
    targetStage: 3,
  },
  {
    id: "reach-stage-4",
    type: "reach-stage",
    description: "Reach the Oracle stage this run",
    reward: 5,
    targetStage: 4,
  },
  {
    id: "buy-generator-25",
    type: "buy-generator",
    description: "Own 25 of any generator",
    reward: 5,
    targetCount: 25,
  },
  {
    id: "buy-generator-50",
    type: "buy-generator",
    description: "Own 50 of any generator",
    reward: 5,
    targetCount: 50,
  },
  {
    id: "click-total-50",
    type: "click-total",
    description: "Click FEED 50 times today",
    reward: 5,
    targetCount: 50,
  },
  {
    id: "click-total-100",
    type: "click-total",
    description: "Click FEED 100 times today",
    reward: 5,
    targetCount: 100,
  },
  {
    id: "click-total-200",
    type: "click-total",
    description: "Click FEED 200 times today",
    reward: 5,
    targetCount: 200,
  },
  {
    id: "get-combo-10",
    type: "get-combo",
    description: "Build a 10× click combo",
    reward: 5,
    targetCount: 10,
  },
  {
    id: "get-combo-20",
    type: "get-combo",
    description: "Build a 20× click combo",
    reward: 5,
    targetCount: 20,
  },
  {
    id: "buy-prestige",
    type: "buy-prestige",
    description: "Purchase any prestige upgrade today",
    reward: 5,
  },
  {
    id: "earn-td-1m",
    type: "earn-td",
    description: "Earn 1,000,000 TD in this run",
    reward: 5,
    targetTd: 1_000_000,
  },
  {
    id: "earn-td-1b",
    type: "earn-td",
    description: "Earn 1,000,000,000 TD in this run",
    reward: 5,
    targetTd: 1_000_000_000,
  },
  {
    id: "rebirth",
    type: "rebirth",
    description: "Perform a rebirth today",
    reward: 5,
  },
  {
    id: "milestone-reach",
    type: "milestone-reach",
    description: "Hit any generator milestone this run",
    reward: 5,
  },
  {
    id: "synergy-active",
    type: "synergy-active",
    description: "Have 3+ active synergies at once",
    reward: 5,
  },
  {
    id: "species-play-zappy",
    type: "species-play",
    description: "Play as ZAPPY this run",
    reward: 5,
    targetSpecies: "ZAPPY",
  },
  {
    id: "bulk-buy-50",
    type: "bulk-buy",
    description: "Buy 50 of one generator in a single purchase",
    reward: 5,
  },
  {
    id: "offline-bonus",
    type: "offline-bonus",
    description: "Collect an offline bonus (away 10+ minutes)",
    reward: 5,
  },
];

// ── Date utilities ────────────────────────────────────────────────────────────

/** Returns the current UTC date as "YYYY-MM-DD". */
export function getCurrentDateUTC(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

/**
 * Converts a "YYYY-MM-DD" string to a numeric seed by stripping hyphens.
 * e.g. "2026-03-04" → 20260304
 */
export function dateToSeed(dateStr: string): number {
  return Number.parseInt(dateStr.replace(/-/g, ""), 10);
}

/**
 * Mulberry32 seeded PRNG — returns a deterministic sequence of numbers in [0, 1).
 * Returns a factory function; call it repeatedly to get the next value.
 */
export function createSeededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s ^ (s >>> 15), s | 1);
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
    return ((s ^ (s >>> 14)) >>> 0) / 0x100000000;
  };
}

// ── Pick daily objectives ─────────────────────────────────────────────────────

/**
 * Deterministically selects 3 objectives from the pool using a date-based seed.
 * All clients generate the same 3 objectives for a given "YYYY-MM-DD" date.
 */
export function pickDailyObjectives(dateStr: string): DailyObjective[] {
  const rng = createSeededRandom(dateToSeed(dateStr));
  const pool = [...DAILY_OBJECTIVE_POOL];
  const result: DailyObjective[] = [];

  for (let i = 0; i < 3 && pool.length > 0; i++) {
    const idx = Math.floor(rng() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }

  return result;
}

// ── Completion check ──────────────────────────────────────────────────────────

/** The subset of daily tracking state needed for objective checks. */
export interface DailyTrackingState {
  todayClickCount: number;
  todayMaxCombo: number;
  todayDidRebirth: boolean;
  todayDidBulkBuy50: boolean;
  todayDidCollectOffline: boolean;
  todayDidPrestigePurchase: boolean;
}

/**
 * Returns true if the given objective is currently satisfied given the
 * current game state and today's tracked events.
 */
export function checkObjectiveCompletion(
  objective: DailyObjective,
  gameState: Pick<
    GameState,
    | "evolutionStage"
    | "upgradeOwned"
    | "totalTdEarned"
    | "crossedMilestones"
    | "currentSpecies"
  >,
  daily: DailyTrackingState,
): boolean {
  switch (objective.type) {
    case "reach-stage":
      return gameState.evolutionStage >= (objective.targetStage ?? 0);

    case "buy-generator":
      return Object.values(gameState.upgradeOwned).some(
        (c) => c >= (objective.targetCount ?? 0),
      );

    case "click-total":
      return daily.todayClickCount >= (objective.targetCount ?? 0);

    case "get-combo":
      return daily.todayMaxCombo >= (objective.targetCount ?? 0);

    case "buy-prestige":
      return daily.todayDidPrestigePurchase;

    case "earn-td":
      return gameState.totalTdEarned.gte(objective.targetTd ?? 0);

    case "rebirth":
      return daily.todayDidRebirth;

    case "milestone-reach":
      return gameState.crossedMilestones.length > 0;

    case "synergy-active":
      return getActiveSynergies(gameState.upgradeOwned).length >= 3;

    case "species-play":
      return gameState.currentSpecies === objective.targetSpecies;

    case "bulk-buy":
      return daily.todayDidBulkBuy50;

    case "offline-bonus":
      return daily.todayDidCollectOffline;

    default:
      return false;
  }
}
