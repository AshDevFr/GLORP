import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeStorage } from "../utils/safeStorage";

export type BuyMode = 1 | 10 | 100 | "max";

export type NumberFormat = "compact" | "full";

export interface SettingsState {
  crtEnabled: boolean;
  animationsDisabled: boolean;
  buyMode: BuyMode;
  numberFormat: NumberFormat;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

interface SettingsActions {
  setCrtEnabled: (enabled: boolean) => void;
  setAnimationsDisabled: (disabled: boolean) => void;
  setBuyMode: (mode: BuyMode) => void;
  setNumberFormat: (format: NumberFormat) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export type SettingsStore = SettingsState & SettingsActions;

export const initialSettings: SettingsState = {
  crtEnabled: false,
  animationsDisabled: false,
  buyMode: 1,
  numberFormat: "full",
  soundEnabled: true,
  notificationsEnabled: true,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...initialSettings,
      setCrtEnabled: (crtEnabled) => set({ crtEnabled }),
      setAnimationsDisabled: (animationsDisabled) =>
        set({ animationsDisabled }),
      setBuyMode: (buyMode) => set({ buyMode }),
      setNumberFormat: (numberFormat) => set({ numberFormat }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setNotificationsEnabled: (notificationsEnabled) =>
        set({ notificationsEnabled }),
    }),
    { name: "glorp-settings", storage: safeStorage },
  ),
);
