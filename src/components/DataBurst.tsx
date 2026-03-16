import { Text } from "@mantine/core";
import type { DataBurstState } from "../hooks/useDataBurst";

interface DataBurstProps {
  burst: DataBurstState;
  onClick: () => void;
}

/**
 * Renders the clickable "Data Burst" orb at its randomised position inside
 * the pet display area.  The parent container must have `position: relative`
 * so the absolute-positioned orb lands in the right place.
 */
export function DataBurst({ burst, onClick }: DataBurstProps) {
  if (!burst.isVisible) return null;

  return (
    <button
      type="button"
      aria-label="Data Burst — click to collect!"
      onClick={onClick}
      style={{
        position: "absolute",
        left: `${burst.position.x}%`,
        top: `${burst.position.y}%`,
        transform: "translate(-50%, -50%)",
        cursor: "pointer",
        userSelect: "none",
        zIndex: 10,
        animation: "data-burst-pulse 1s ease-in-out infinite",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        background: "none",
        border: "none",
        padding: 0,
      }}
    >
      <Text
        ff="monospace"
        fw={700}
        size="sm"
        style={{
          color: "#00ffff",
          textShadow: "0 0 8px #00ffff, 0 0 16px #00ffff, 0 0 32px #0088ff",
          whiteSpace: "nowrap",
        }}
      >
        {"\u00bb\u2605DATA\u2605\u00ab"}
      </Text>
      <Text
        ff="monospace"
        size="xs"
        style={{
          color: "#00cccc",
          textShadow: "0 0 4px #00ffff",
          opacity: 0.85,
        }}
      >
        [{burst.secondsLeft}s]
      </Text>
    </button>
  );
}
