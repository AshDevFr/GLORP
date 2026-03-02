import { useEffect, useState } from "react";
import { useSettingsStore } from "../store/settingsStore";

export function useReducedMotion(): boolean {
  const [osPrefersReduced, setOsPrefersReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  const animationsDisabled = useSettingsStore((s) => s.animationsDisabled);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setOsPrefersReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return osPrefersReduced || animationsDisabled;
}
