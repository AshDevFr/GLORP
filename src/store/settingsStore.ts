import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BuyMode = 1 | 10 | 100 | "max";

export interface SettingsState {
  crtEnabled: boolean;
  animationsDisabled: boolean;
  buyMode: BuyMode;
}

interface SettingsActions {
  setCrtEnabled: (enabled: boolean) => void;
  setAnimationsDisabled: (disabled: boolean) => void;
  setBuyMode: (mode: BuyMode) => void;
}

export type SettingsStore = SettingsState & SettingsActions;

export const initialSettings: SettingsState = {
  crtEnabled: false,
  animationsDisabled: false,
  buyMode: 1,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...initialSettings,
      setCrtEnabled: (crtEnabled) => set({ crtEnabled }),
      setAnimationsDisabled: (animationsDisabled) =>
        set({ animationsDisabled }),
      setBuyMode: (buyMode) => set({ buyMode }),
    }),
    { name: "glorp-settings" },
  ),
);
