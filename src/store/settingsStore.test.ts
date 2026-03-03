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
    expect(state.numberFormat).toBe("full");
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

  it("setNumberFormat switches to full", () => {
    useSettingsStore.getState().setNumberFormat("full");
    expect(useSettingsStore.getState().numberFormat).toBe("full");
  });

  it("setNumberFormat switches back to compact", () => {
    useSettingsStore.setState({ numberFormat: "full" });
    useSettingsStore.getState().setNumberFormat("compact");
    expect(useSettingsStore.getState().numberFormat).toBe("compact");
  });

  it("setNumberFormat does not affect other settings", () => {
    useSettingsStore.getState().setNumberFormat("full");
    expect(useSettingsStore.getState().crtEnabled).toBe(false);
    expect(useSettingsStore.getState().animationsDisabled).toBe(false);
  });
});
