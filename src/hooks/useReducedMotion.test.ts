// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initialSettings, useSettingsStore } from "../store/settingsStore";
import { useReducedMotion } from "./useReducedMotion";

function mockMatchMedia(matches: boolean) {
  const mql = {
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  window.matchMedia = vi.fn().mockReturnValue(mql) as typeof window.matchMedia;
  return { mql };
}

beforeEach(() => {
  useSettingsStore.setState(initialSettings);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useReducedMotion", () => {
  it("returns false when prefers-reduced-motion is not set", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it("returns true when prefers-reduced-motion is reduce", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it("subscribes to media query changes", () => {
    const { mql } = mockMatchMedia(false);
    renderHook(() => useReducedMotion());
    expect(mql.addEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });

  it("cleans up listener on unmount", () => {
    const { mql } = mockMatchMedia(false);
    const { unmount } = renderHook(() => useReducedMotion());
    unmount();
    expect(mql.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });

  it("returns true when animationsDisabled is set in settings", () => {
    mockMatchMedia(false);
    useSettingsStore.setState({ animationsDisabled: true });
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it("returns true when both OS preference and settings toggle are active", () => {
    mockMatchMedia(true);
    useSettingsStore.setState({ animationsDisabled: true });
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it("returns true when reducedMotion store setting is enabled", () => {
    mockMatchMedia(false);
    useSettingsStore.setState({ reducedMotion: true });
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it("returns false when reducedMotion is false and OS preference is off", () => {
    mockMatchMedia(false);
    useSettingsStore.setState({
      reducedMotion: false,
      animationsDisabled: false,
    });
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });
});
