import { beforeEach, describe, expect, it } from "vitest";
import { initialSettings, useSettingsStore } from "./settingsStore";

beforeEach(() => {
  useSettingsStore.setState(initialSettings);
});

describe("useSettingsStore", () => {
  it("has correct initial state", () => {
    const state = useSettingsStore.getState();
    expect(state.crtEnabled).toBe(false);
    expect(state.animationsDisabled).toBe(false);
  });

  it("setCrtEnabled sets crtEnabled to true", () => {
    useSettingsStore.getState().setCrtEnabled(true);
    expect(useSettingsStore.getState().crtEnabled).toBe(true);
  });

  it("setCrtEnabled sets crtEnabled to false", () => {
    useSettingsStore.setState({ crtEnabled: true });
    useSettingsStore.getState().setCrtEnabled(false);
    expect(useSettingsStore.getState().crtEnabled).toBe(false);
  });

  it("setAnimationsDisabled sets animationsDisabled to true", () => {
    useSettingsStore.getState().setAnimationsDisabled(true);
    expect(useSettingsStore.getState().animationsDisabled).toBe(true);
  });

  it("setAnimationsDisabled sets animationsDisabled to false", () => {
    useSettingsStore.setState({ animationsDisabled: true });
    useSettingsStore.getState().setAnimationsDisabled(false);
    expect(useSettingsStore.getState().animationsDisabled).toBe(false);
  });

  it("setCrtEnabled does not affect animationsDisabled", () => {
    useSettingsStore.getState().setCrtEnabled(true);
    expect(useSettingsStore.getState().animationsDisabled).toBe(false);
  });

  it("setAnimationsDisabled does not affect crtEnabled", () => {
    useSettingsStore.getState().setAnimationsDisabled(true);
    expect(useSettingsStore.getState().crtEnabled).toBe(false);
  });
});
