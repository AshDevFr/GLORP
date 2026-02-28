import { useCallback, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

export interface Particle {
  id: number;
  x: number;
  y: number;
}

const PARTICLE_DURATION = 800;

export function useClickParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const nextId = useRef(0);
  const prefersReduced = useReducedMotion();

  const spawn = useCallback(
    (containerRect: DOMRect) => {
      if (prefersReduced) return;

      const count = 3 + Math.floor(Math.random() * 3); // 3–5 particles
      const newParticles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        newParticles.push({
          id: nextId.current++,
          x: containerRect.width / 2 + (Math.random() * 40 - 20),
          y: containerRect.height / 2 + (Math.random() * 20 - 10),
        });
      }

      setParticles((prev) => [...prev, ...newParticles]);

      setTimeout(() => {
        const ids = new Set(newParticles.map((p) => p.id));
        setParticles((prev) => prev.filter((p) => !ids.has(p.id)));
      }, PARTICLE_DURATION);
    },
    [prefersReduced],
  );

  return { particles, spawn };
}
