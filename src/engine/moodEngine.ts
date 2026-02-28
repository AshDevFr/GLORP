export type Mood =
  | "Happy"
  | "Neutral"
  | "Hungry"
  | "Sad"
  | "Excited"
  | "Philosophical";

const DECAY_CHAIN: ReadonlyArray<{
  from: Mood;
  to: Mood;
  afterMs: number;
}> = [
  { from: "Happy", to: "Neutral", afterMs: 60_000 },
  { from: "Excited", to: "Neutral", afterMs: 60_000 },
  { from: "Neutral", to: "Hungry", afterMs: 120_000 },
  { from: "Hungry", to: "Sad", afterMs: 120_000 },
];

/**
 * Given the current mood and the timestamp it was set, returns the mood
 * after applying any applicable decay. Pure function — no side effects.
 */
export function getDecayedMood(
  mood: Mood,
  moodChangedAt: number,
  now: number,
): Mood {
  const elapsed = now - moodChangedAt;
  const rule = DECAY_CHAIN.find((r) => r.from === mood);
  if (rule && elapsed >= rule.afterMs) {
    return rule.to;
  }
  return mood;
}

/**
 * Returns a random mood for when the pet is clicked (Happy or Excited).
 */
export function getClickMood(): Mood {
  return Math.random() < 0.5 ? "Happy" : "Excited";
}

/**
 * Returns the mood to set when an upgrade is purchased.
 */
export function getUpgradePurchaseMood(): Mood {
  return "Excited";
}
