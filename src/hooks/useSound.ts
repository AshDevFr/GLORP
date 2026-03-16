import { useCallback } from "react";
import { useSettingsStore } from "../store/settingsStore";
import {
  getAudioContext,
  synthBurst,
  synthClick,
  synthEvolution,
  synthPurchase,
  synthWelcomeBack,
} from "../utils/synthSounds";
import { useReducedMotion } from "./useReducedMotion";

type SynthFn = (ctx: AudioContext) => void;

/**
 * Returns stable callbacks for each in-game sound.
 * Sounds are silenced when the user has muted audio or enabled
 * prefers-reduced-motion (which implies reducing sensory stimulation).
 */
export function useSound() {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const prefersReduced = useReducedMotion();

  const play = useCallback(
    (fn: SynthFn) => {
      if (!soundEnabled || prefersReduced) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      const resume =
        ctx.state === "suspended" ? ctx.resume() : Promise.resolve();
      resume
        .then(() => fn(ctx))
        .catch(() => {
          // AudioContext blocked by browser policy — ignore silently
        });
    },
    [soundEnabled, prefersReduced],
  );

  const playClick = useCallback(() => play(synthClick), [play]);
  const playPurchase = useCallback(() => play(synthPurchase), [play]);
  const playEvolution = useCallback(() => play(synthEvolution), [play]);
  const playWelcomeBack = useCallback(() => play(synthWelcomeBack), [play]);
  const playBurst = useCallback(() => play(synthBurst), [play]);

  return { playClick, playPurchase, playEvolution, playWelcomeBack, playBurst };
}
