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

  const spawnParticles = useCallback(
    (
      containerRect: DOMRect,
      count: number,
      spreadX: number,
      spreadY: number,
    ) => {
      if (prefersReduced) return;

      const newParticles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        newParticles.push({
          id: nextId.current++,
          x:
            containerRect.width / 2 +
            (Math.random() * spreadX * 2 - spreadX),
          y:
            containerRect.height / 2 +
            (Math.random() * spreadY * 2 - spreadY),
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

  /** Spawn 3–5 particles around the container centre (normal click). */
  const spawn = useCallback(
    (containerRect: DOMRect) => {
      spawnParticles(
        containerRect,
        3 + Math.floor(Math.random() * 3),
        20,
        10,
      );
    },
    [spawnParticles],
  );

  /** Spawn a larger burst of particles for milestone celebrations. */
  const spawnBurst = useCallback(
    (containerRect: DOMRect) => {
      spawnParticles(containerRect, 15, 60, 40);
    },
    [spawnParticles],
  );

  return { particles, spawn, spawnBurst };
}
