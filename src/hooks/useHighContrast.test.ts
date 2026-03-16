// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { initialSettings, useSettingsStore } from "../store/settingsStore";
import { useHighContrast } from "./useHighContrast";

const HC_ATTR = "data-high-contrast";

beforeEach(() => {
  useSettingsStore.setState(initialSettings);
  document.documentElement.removeAttribute(HC_ATTR);
});

afterEach(() => {
  document.documentElement.removeAttribute(HC_ATTR);
});

describe("useHighContrast", () => {
  it("returns false when highContrast is off", () => {
    const { result } = renderHook(() => useHighContrast());
    expect(result.current).toBe(false);
  });

  it("sets data-high-contrast=false on <html> when off", () => {
    renderHook(() => useHighContrast());
    expect(document.documentElement.getAttribute(HC_ATTR)).toBe("false");
  });

  it("returns true when highContrast is on", () => {
    useSettingsStore.setState({ highContrast: true });
    const { result } = renderHook(() => useHighContrast());
    expect(result.current).toBe(true);
  });

  it("sets data-high-contrast=true on <html> when enabled", () => {
    useSettingsStore.setState({ highContrast: true });
    renderHook(() => useHighContrast());
    expect(document.documentElement.getAttribute(HC_ATTR)).toBe("true");
  });

  it("updates data-high-contrast when store is toggled on", () => {
    const { result } = renderHook(() => useHighContrast());
    expect(result.current).toBe(false);
    act(() => {
      useSettingsStore.setState({ highContrast: true });
    });
    expect(result.current).toBe(true);
    expect(document.documentElement.getAttribute(HC_ATTR)).toBe("true");
  });

  it("updates data-high-contrast back to false when disabled", () => {
    useSettingsStore.setState({ highContrast: true });
    const { result } = renderHook(() => useHighContrast());
    expect(result.current).toBe(true);
    act(() => {
      useSettingsStore.setState({ highContrast: false });
    });
    expect(result.current).toBe(false);
    expect(document.documentElement.getAttribute(HC_ATTR)).toBe("false");
  });
});
