import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SettingsState {
  crtEnabled: boolean;
  animationsDisabled: boolean;
}

interface SettingsActions {
  setCrtEnabled: (enabled: boolean) => void;
  setAnimationsDisabled: (disabled: boolean) => void;
}

export type SettingsStore = SettingsState & SettingsActions;

export const initialSettings: SettingsState = {
  crtEnabled: false,
  animationsDisabled: false,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...initialSettings,
      setCrtEnabled: (crtEnabled) => set({ crtEnabled }),
      setAnimationsDisabled: (animationsDisabled) =>
        set({ animationsDisabled }),
    }),
    { name: "glorp-settings" },
  ),
);
