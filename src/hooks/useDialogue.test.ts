// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DIALOGUE } from "../data/dialogue";
import { initialGameState, useGameStore } from "../store";
import { useDialogue } from "./useDialogue";

beforeEach(() => {
  localStorage.clear();
  useGameStore.setState(initialGameState);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useDialogue", () => {
  it("returns a string from stage 0 idle lines initially", () => {
    const { result } = renderHook(() => useDialogue());
    expect(DIALOGUE[0].idle).toContain(result.current);
  });

  it("rotates dialogue after timeout", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDialogue());

    for (let i = 0; i < 10; i++) {
      act(() => {
        vi.advanceTimersByTime(12_000);
      });
    }

    expect(DIALOGUE[0].idle).toContain(result.current);
    vi.useRealTimers();
  });

  it("uses stage-appropriate lines when stage changes", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDialogue());

    act(() => {
      useGameStore.setState({
        evolutionStage: 1,
        hasSeenFirstEvolution: true,
      });
    });

    act(() => {
      vi.advanceTimersByTime(12_000);
    });

    expect(DIALOGUE[1].idle).toContain(result.current);
    vi.useRealTimers();
  });

  it("marks first evolution as seen on stage change", () => {
    renderHook(() => useDialogue());

    act(() => {
      useGameStore.setState({ evolutionStage: 1 });
    });

    expect(useGameStore.getState().hasSeenFirstEvolution).toBe(true);
  });

  it("marks first upgrade as seen on first purchase", () => {
    renderHook(() => useDialogue());

    act(() => {
      useGameStore.setState({
        upgradeOwned: { "neural-notepad": 1 },
      });
    });

    expect(useGameStore.getState().hasSeenFirstUpgrade).toBe(true);
  });

  it("does not mark evolution seen if already seen", () => {
    const markSpy = vi.fn();
    useGameStore.setState({ hasSeenFirstEvolution: true });
    const originalMark = useGameStore.getState().markFirstEvolutionSeen;
    useGameStore.setState({
      markFirstEvolutionSeen: markSpy,
    });

    renderHook(() => useDialogue());

    act(() => {
      useGameStore.setState({ evolutionStage: 1 });
    });

    expect(markSpy).not.toHaveBeenCalled();
    useGameStore.setState({
      markFirstEvolutionSeen: originalMark,
    });
  });

  it("does not mark upgrade seen if already seen", () => {
    const markSpy = vi.fn();
    useGameStore.setState({ hasSeenFirstUpgrade: true });
    const originalMark = useGameStore.getState().markFirstUpgradeSeen;
    useGameStore.setState({
      markFirstUpgradeSeen: markSpy,
    });

    renderHook(() => useDialogue());

    act(() => {
      useGameStore.setState({
        upgradeOwned: { "neural-notepad": 1 },
      });
    });

    expect(markSpy).not.toHaveBeenCalled();
    useGameStore.setState({
      markFirstUpgradeSeen: originalMark,
    });
  });
});
