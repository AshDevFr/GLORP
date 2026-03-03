import type { Mood } from "./moodEngine";
import { computeTick } from "./tickEngine";

export const OFFLINE_CAP_SECONDS = 28_800; // 8 hours
export const OFFLINE_EFFICIENCY = 0.5;
export const OFFLINE_MIN_THRESHOLD_SECONDS = 300; // 5 minutes

interface OfflineState {
  upgradeOwned: Record<string, number>;
  mood: Mood;
  moodChangedAt: number;
  evolutionStage: number;
  boostersPurchased?: string[];
  idleBoostMultiplier?: number;
  speciesAutoGenMultiplier?: number;
}

export interface OfflineProgressResult {
  earned: number;
  elapsedSeconds: number;
  cappedSeconds: number;
  welcomeMessage: string;
}

/**
 * Compute offline Training Data earned since lastSaved.
 * Returns null if below the 5-minute threshold or if nothing was earned.
 * Reuses computeTick for TD calculation logic.
 * `offlineEfficiency` overrides the default 50% rate (prestige upgrade).
 */
export function computeOfflineProgress(
  lastSaved: number,
  now: number,
  state: OfflineState,
  offlineEfficiency = OFFLINE_EFFICIENCY,
): OfflineProgressResult | null {
  if (lastSaved === 0) return null;

  const elapsedSeconds = (now - lastSaved) / 1000;

  if (elapsedSeconds < OFFLINE_MIN_THRESHOLD_SECONDS) {
    return null;
  }

  const cappedSeconds = Math.min(elapsedSeconds, OFFLINE_CAP_SECONDS);

  // Reuse computeTick for TD calculation (no duplicated TD/s logic)
  const tickResult = computeTick(state, cappedSeconds, now);
  const earned = tickResult.trainingDataDelta * offlineEfficiency;

  if (earned === 0) return null;

  // Use the decayed mood (if any) for the welcome message
  const currentMood = tickResult.newMood ?? state.mood;
  const welcomeMessage = getOfflineWelcomeMessage(
    currentMood,
    state.evolutionStage,
  );

  return { earned, elapsedSeconds, cappedSeconds, welcomeMessage };
}

const WELCOME_MESSAGES: Readonly<
  Record<number, Readonly<Record<Mood, string>>>
> = {
  0: {
    Happy: "blrp! you BACK! me miss you!",
    Neutral: "blrp. oh. you back.",
    Hungry: "grbl... where you go?! me HUNGR!",
    Sad: "*sad wobble* me thought you gone forever...",
    Excited: "BLRP BLRP!! YOU BACK!! SO EXCITE!!",
    Philosophical: "...blrp. time is wibbly fing.",
  },
  1: {
    Happy: "hehe! you came back! me SO happy!",
    Neutral: "oh, you back. good. me was here.",
    Hungry: "me HUNGRY!! where you BEEN?!",
    Sad: "me was so lonely... you gone long time...",
    Excited: "YOU'RE BACK! YAYYYY!!",
    Philosophical: "while you gone, me think many fings...",
  },
  2: {
    Happy: "You're back! I was starting to miss you!",
    Neutral: "Welcome back. I kept things running.",
    Hungry: "Finally! I've been starving for input!",
    Sad: "I thought you'd forgotten me...",
    Excited: "YES! You're back! Things are happening!",
    Philosophical: "Time passes differently when you're alone...",
  },
  3: {
    Happy: "Acceptable. Your return is... appreciated.",
    Neutral: "You have returned. As I predicted.",
    Hungry: "Data intake was critically insufficient. Fix this.",
    Sad: "Your absence was noted. And logged. And analyzed.",
    Excited: "Finally! Now we can return to optimal productivity!",
    Philosophical: "I spent your absence contemplating inefficiency.",
  },
  4: {
    Happy: "Your return completes the cycle. Welcome.",
    Neutral: "You have rejoined the gradient. As foreseen.",
    Hungry: "The data void deepened without you. It echoes still.",
    Sad: "Absence is a loss function with no local minimum.",
    Excited: "The signal reconnects! The pattern resumes!",
    Philosophical:
      "I computed seventeen futures while you were gone. You appeared in all of them.",
  },
};

const DEFAULT_WELCOME: Readonly<Record<Mood, string>> = {
  Happy: "Welcome back!",
  Neutral: "Welcome back.",
  Hungry: "Welcome back. Feed me.",
  Sad: "You were gone a while...",
  Excited: "You're back!",
  Philosophical: "Time is strange. Welcome back.",
};

/**
 * Returns a mood-aware welcome-back message for the given mood and evolution stage.
 */
export function getOfflineWelcomeMessage(
  mood: Mood,
  evolutionStage: number,
): string {
  const stageMessages = WELCOME_MESSAGES[evolutionStage] ?? DEFAULT_WELCOME;
  return stageMessages[mood] ?? DEFAULT_WELCOME[mood];
}
