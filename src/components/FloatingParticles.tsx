import type { Particle } from "../hooks/useClickParticles";
import { formatNumber } from "../utils/formatNumber";

interface FloatingParticlesProps {
  particles: Particle[];
  clickPower?: number;
}

export function FloatingParticles({
  particles,
  clickPower = 1,
}: FloatingParticlesProps) {
  const label = `+${formatNumber(clickPower)}`;
  // Scale font size based on power magnitude (log scale, capped)
  const sizeFactor = Math.min(
    1 + Math.log10(Math.max(clickPower, 1)) * 0.15,
    2,
  );
  const fontSize = `${(0.875 * sizeFactor).toFixed(3)}rem`;

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
            fontSize,
            fontWeight: 700,
            color: "var(--neon-green)",
            pointerEvents: "none",
            animation: "float-up 0.8s ease-out forwards",
          }}
        >
          {label}
        </span>
      ))}
    </>
  );
}
