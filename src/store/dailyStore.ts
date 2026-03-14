import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getCurrentDateUTC } from "../engine/dailyObjectivesEngine";
import { safeStorage } from "../utils/safeStorage";

// ── State ─────────────────────────────────────────────────────────────────────

export interface DailyState {
  /** UTC date string "YYYY-MM-DD" when objectives were last generated. */
  lastGeneratedDate: string;
  /** IDs of objectives completed today. */
  completedObjectiveIds: string[];
  // Per-day event counters — reset when date changes
  todayClickCount: number;
  todayMaxCombo: number;
  todayDidRebirth: boolean;
  todayDidBulkBuy50: boolean;
  todayDidCollectOffline: boolean;
  todayDidPrestigePurchase: boolean;
}

interface DailyActions {
  /** Call on app load and each tick: resets counters if the UTC date has changed. */
  refreshIfNeeded: () => void;
  recordClick: (count?: number) => void;
  recordCombo: (combo: number) => void;
  recordRebirth: () => void;
  recordBulkBuy50: () => void;
  recordOfflineBonus: () => void;
  recordPrestigePurchase: () => void;
  markCompleted: (id: string) => void;
}

export type DailyStore = DailyState & DailyActions;

// ── Defaults ──────────────────────────────────────────────────────────────────

export const initialDailyState: DailyState = {
  lastGeneratedDate: "",
  completedObjectiveIds: [],
  todayClickCount: 0,
  todayMaxCombo: 0,
  todayDidRebirth: false,
  todayDidBulkBuy50: false,
  todayDidCollectOffline: false,
  todayDidPrestigePurchase: false,
};

const FRESH_DAY_STATE: Omit<DailyState, "lastGeneratedDate"> = {
  completedObjectiveIds: [],
  todayClickCount: 0,
  todayMaxCombo: 0,
  todayDidRebirth: false,
  todayDidBulkBuy50: false,
  todayDidCollectOffline: false,
  todayDidPrestigePurchase: false,
};

// ── Store ─────────────────────────────────────────────────────────────────────

export const useDailyStore = create<DailyStore>()(
  persist(
    (set, get) => ({
      ...initialDailyState,

      refreshIfNeeded: () => {
        const today = getCurrentDateUTC();
        if (get().lastGeneratedDate !== today) {
          set({ ...FRESH_DAY_STATE, lastGeneratedDate: today });
        }
      },

      recordClick: (count = 1) =>
        set((s) => ({ todayClickCount: s.todayClickCount + count })),

      recordCombo: (combo) =>
        set((s) => ({
          todayMaxCombo: Math.max(s.todayMaxCombo, combo),
        })),

      recordRebirth: () => set({ todayDidRebirth: true }),

      recordBulkBuy50: () => set({ todayDidBulkBuy50: true }),

      recordOfflineBonus: () => set({ todayDidCollectOffline: true }),

      recordPrestigePurchase: () => set({ todayDidPrestigePurchase: true }),

      markCompleted: (id) =>
        set((s) => {
          if (s.completedObjectiveIds.includes(id)) return s;
          return {
            completedObjectiveIds: [...s.completedObjectiveIds, id],
          };
        }),
    }),
    { name: "glorp-daily", storage: safeStorage },
  ),
);
