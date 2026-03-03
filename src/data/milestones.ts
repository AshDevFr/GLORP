export interface MilestoneThreshold {
  owned: number;
  multiplier: number;
  label: string;
}

/**
 * Milestone thresholds for generator ownership.
 * Each entry defines the minimum owned count, the total TD/s multiplier
 * applied to that generator, and a human-readable bonus label.
 * Must be sorted ascending by `owned`.
 */
export const MILESTONE_THRESHOLDS: readonly MilestoneThreshold[] = [
  { owned: 10, multiplier: 1.5, label: "+50%" },
  { owned: 25, multiplier: 2, label: "+100%" },
  { owned: 50, multiplier: 3, label: "+200%" },
  { owned: 100, multiplier: 6, label: "+500%" },
];
