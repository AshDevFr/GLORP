import { useEffect, useRef, useState } from "react";
import { UPGRADES } from "../data/upgrades";
import { computeWisdomMultiplier } from "../engine/rebirthEngine";
import { getTotalTdPerSecond } from "../engine/upgradeEngine";
import { useGameStore } from "../store";

/**
 * Pure interpolation logic — exported for unit testing.
 *
 * Given the previous displayed value, the authoritative store value, the
 * current TD/s rate, and the elapsed time in seconds since the last frame,
 * returns the new display value.
 *
 * Rules:
 *  - No passive income → snap to actual.
 *  - Display is significantly ahead of actual (e.g. after a purchase) → snap.
 *  - Display is significantly behind actual (e.g. after offline progress) → snap.
 *  - Otherwise → interpolate forward, capped at one tick ahead of actual.
 */
export function interpolateTd(
  prev: number,
  actual: number,
  tdPerSecond: number,
  elapsedSeconds: number,
): number {
  if (tdPerSecond <= 0) return actual;

  // Snap when display has drifted more than 1.5 ticks ahead (e.g. purchase).
  if (prev - actual > tdPerSecond * 1.5) return actual;

  // Snap when actual jumped far ahead (e.g. offline progress load).
  if (actual - prev > tdPerSecond * 2) return actual;

  const next = prev + tdPerSecond * elapsedSeconds;
  // Cap at one tick ahead of actual to prevent visual runaway.
  return Math.min(next, actual + tdPerSecond);
}

/**
 * Returns a smoothly-interpolated Training Data value that updates at ~60 fps
 * via requestAnimationFrame, instead of snapping once per engine tick.
 *
 * The authoritative value (from Zustand) remains the source of truth; this
 * hook only affects the *display*.
 */
export function useInterpolatedTd(): number {
  const [displayTd, setDisplayTd] = useState(
    () => useGameStore.getState().trainingData,
  );
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    const frame = (now: number) => {
      // Cap elapsed to 100 ms to avoid huge jumps after tab becomes active.
      const elapsed = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      const state = useGameStore.getState();
      const wisdomMultiplier = computeWisdomMultiplier(state.wisdomTokens);
      const tdPerSecond = getTotalTdPerSecond(
        UPGRADES,
        state.upgradeOwned,
        wisdomMultiplier,
      );

      setDisplayTd((prev) =>
        interpolateTd(prev, state.trainingData, tdPerSecond, elapsed),
      );

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // Runs once; reads latest store state every frame via getState().

  return displayTd;
}
