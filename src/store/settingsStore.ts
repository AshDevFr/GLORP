import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BuyMode = 1 | 10 | 100 | "max";

export type NumberFormat = "compact" | "full";

export interface SettingsState {
  crtEnabled: boolean;
  animationsDisabled: boolean;
  buyMode: BuyMode;
  numberFormat: NumberFormat;
}

interface SettingsActions {
  setCrtEnabled: (enabled: boolean) => void;
  setAnimationsDisabled: (disabled: boolean) => void;
  setBuyMode: (mode: BuyMode) => void;
  setNumberFormat: (format: NumberFormat) => void;
}

export type SettingsStore = SettingsState & SettingsActions;

export const initialSettings: SettingsState = {
  crtEnabled: false,
  animationsDisabled: false,
  buyMode: 1,
  numberFormat: "full",
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
    }),
    { name: "glorp-settings" },
  ),
);
