// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { initialSettings, useSettingsStore } from "../store/settingsStore";

// synthSounds uses the Web Audio API which is not available in the node test
// environment; mock the module so useSound can be tested without a real AudioContext.
vi.mock("../utils/synthSounds", () => ({
  getAudioContext: vi.fn(() => null),
  synthBurst: vi.fn(),
  synthClick: vi.fn(),
  synthEvolution: vi.fn(),
  synthPurchase: vi.fn(),
  synthWelcomeBack: vi.fn(),
}));

// useReducedMotion depends on window.matchMedia — stub it out
const mockUseReducedMotion = vi.fn(() => false);
vi.mock("./useReducedMotion", () => ({
  get useReducedMotion() {
    return mockUseReducedMotion;
  },
}));

import * as synthSounds from "../utils/synthSounds";
import { useSound } from "./useSound";

// useSound is a React hook; we call it directly because all its inner
// hook dependencies are stubbed above — no React render is required.
function callHook() {
  return renderHook(() => useSound()).result.current;
}

beforeEach(() => {
  useSettingsStore.setState(initialSettings);
  vi.clearAllMocks();
  mockUseReducedMotion.mockReturnValue(false);
});

describe("useSound", () => {
  it("returns five play functions", () => {
    const sound = callHook();
    expect(typeof sound.playClick).toBe("function");
    expect(typeof sound.playPurchase).toBe("function");
    expect(typeof sound.playEvolution).toBe("function");
    expect(typeof sound.playWelcomeBack).toBe("function");
    expect(typeof sound.playBurst).toBe("function");
  });

  it("does not call getAudioContext when soundEnabled is false", () => {
    useSettingsStore.setState({ soundEnabled: false });
    const sound = callHook();
    sound.playClick();
    expect(synthSounds.getAudioContext).not.toHaveBeenCalled();
  });

  it("calls getAudioContext when soundEnabled is true", () => {
    useSettingsStore.setState({ soundEnabled: true });
    const sound = callHook();
    sound.playClick();
    expect(synthSounds.getAudioContext).toHaveBeenCalled();
  });

  it("does not call synthPurchase when audio context is null", () => {
    useSettingsStore.setState({ soundEnabled: true });
    vi.mocked(synthSounds.getAudioContext).mockReturnValue(null);
    const sound = callHook();
    sound.playPurchase();
    expect(synthSounds.getAudioContext).toHaveBeenCalled();
    expect(synthSounds.synthPurchase).not.toHaveBeenCalled();
  });

  it("does not call getAudioContext for playEvolution when muted", () => {
    useSettingsStore.setState({ soundEnabled: false });
    const sound = callHook();
    sound.playEvolution();
    expect(synthSounds.getAudioContext).not.toHaveBeenCalled();
  });

  it("does not call getAudioContext for playWelcomeBack when muted", () => {
    useSettingsStore.setState({ soundEnabled: false });
    const sound = callHook();
    sound.playWelcomeBack();
    expect(synthSounds.getAudioContext).not.toHaveBeenCalled();
  });

  it("silences all sounds when prefers-reduced-motion is true", () => {
    mockUseReducedMotion.mockReturnValue(true);
    useSettingsStore.setState({ soundEnabled: true });
    const { result } = renderHook(() => useSound());
    result.current.playClick();
    expect(synthSounds.getAudioContext).not.toHaveBeenCalled();
  });
});
