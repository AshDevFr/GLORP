import type { Particle } from "../hooks/useClickParticles";

interface FloatingParticlesProps {
  particles: Particle[];
}

export function FloatingParticles({ particles }: FloatingParticlesProps) {
  return (
    <>
      {particles.map((p) => (
        <span
          key={p.id}
          className="float-particle"
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            fontFamily: "monospace",
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "var(--neon-green)",
            pointerEvents: "none",
            animation: "float-up 0.8s ease-out forwards",
          }}
        >
          +1
        </span>
      ))}
    </>
  );
}
