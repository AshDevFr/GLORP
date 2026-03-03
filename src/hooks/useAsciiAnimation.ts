import { useEffect, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

const GLITCH_INTERVAL_MS = 80;

/**
 * Cycles through ASCII art animation frames at a given interval.
 * Returns the current frame string.
 *
 * When `glitching` is true, frames cycle rapidly (stage transition effect).
 * Respects prefers-reduced-motion and the animations toggle.
 */
export function useAsciiAnimation(
  frames: readonly string[],
  intervalMs = 2000,
  glitching = false,
): string {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();

  // Reset to frame 0 when frames array identity changes
  // (e.g. species/stage change produces a new array reference)
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — reset when frames ref changes
  useEffect(() => {
    setIndex(0);
  }, [frames]);

  useEffect(() => {
    if (reduced || frames.length <= 1) return;

    const ms = glitching ? GLITCH_INTERVAL_MS : intervalMs;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % frames.length);
    }, ms);

    return () => clearInterval(id);
  }, [frames, intervalMs, glitching, reduced]);

  if (reduced || frames.length === 0) {
    return frames[0] ?? "";
  }

  return frames[index % frames.length] ?? frames[0] ?? "";
}
