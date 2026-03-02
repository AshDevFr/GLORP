import { useSettingsStore } from "../store/settingsStore";

export function CrtOverlay() {
  const crtEnabled = useSettingsStore((s) => s.crtEnabled);

  if (!crtEnabled) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
        background:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)",
      }}
    />
  );
}
