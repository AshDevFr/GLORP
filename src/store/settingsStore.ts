import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeStorage } from "../utils/safeStorage";

export type BuyMode = 1 | 10 | 100 | "max";

export type NumberFormat = "compact" | "full";

export interface SettingsState {
  crtEnabled: boolean;
  animationsDisabled: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  buyMode: BuyMode;
  numberFormat: NumberFormat;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

interface SettingsActions {
  setCrtEnabled: (enabled: boolean) => void;
  setAnimationsDisabled: (disabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  setBuyMode: (mode: BuyMode) => void;
  setNumberFormat: (format: NumberFormat) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export type SettingsStore = SettingsState & SettingsActions;

export const initialSettings: SettingsState = {
  crtEnabled: false,
  animationsDisabled: false,
  reducedMotion: false,
  highContrast: false,
  buyMode: 1,
  numberFormat: "full",
  soundEnabled: true,
  notificationsEnabled: true,
};

function getOsReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...initialSettings,
      reducedMotion: getOsReducedMotion(),
      setCrtEnabled: (crtEnabled) => set({ crtEnabled }),
      setAnimationsDisabled: (animationsDisabled) =>
        set({ animationsDisabled }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setBuyMode: (buyMode) => set({ buyMode }),
      setNumberFormat: (numberFormat) => set({ numberFormat }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setNotificationsEnabled: (notificationsEnabled) =>
        set({ notificationsEnabled }),
    }),
    { name: "glorp-settings", storage: safeStorage },
  ),
);
