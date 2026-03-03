import { create } from "zustand";

export interface MilestoneEvent {
  /** The TD threshold that was crossed. */
  threshold: number;
  /** Monotonically-increasing ID to distinguish successive events. */
  id: number;
}

interface UIState {
  milestoneEvent: MilestoneEvent | null;
}

interface UIActions {
  triggerMilestone: (threshold: number) => void;
  clearMilestoneEvent: () => void;
}

let _eventId = 0;

/** Lightweight, non-persisted store for transient UI events. */
export const useUIStore = create<UIState & UIActions>()((set) => ({
  milestoneEvent: null,
  triggerMilestone: (threshold) =>
    set({ milestoneEvent: { threshold, id: _eventId++ } }),
  clearMilestoneEvent: () => set({ milestoneEvent: null }),
}));
