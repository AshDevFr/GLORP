import { useEffect, useRef } from "react";
import { computeTick } from "../engine/tickEngine";
import { useGameStore } from "../store";

const TICK_INTERVAL_MS = 1000;

export function useGameLoop() {
  const lastTickRef = useRef(Date.now());

  useEffect(() => {
    lastTickRef.current = Date.now();

    const id = setInterval(() => {
      const now = Date.now();
      const deltaSeconds = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      const state = useGameStore.getState();
      const result = computeTick(state, deltaSeconds, now);

      if (result.trainingDataDelta > 0) {
        state.addTrainingData(result.trainingDataDelta);
      }

      if (result.newMood) {
        state.setMood(result.newMood);
      }
    }, TICK_INTERVAL_MS);

    return () => clearInterval(id);
  }, []);
}
