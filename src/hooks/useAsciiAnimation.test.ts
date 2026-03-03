// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock useReducedMotion before importing the hook
vi.mock("./useReducedMotion", () => ({
  useReducedMotion: vi.fn(() => false),
}));

import { useAsciiAnimation } from "./useAsciiAnimation";
import { useReducedMotion } from "./useReducedMotion";

const mockUseReducedMotion = vi.mocked(useReducedMotion);

describe("useAsciiAnimation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockUseReducedMotion.mockReturnValue(false);
  });

  it("returns the first frame initially", () => {
    const frames = ["frame-0", "frame-1", "frame-2"];
    const { result } = renderHook(() => useAsciiAnimation(frames, 2000));
    expect(result.current).toBe("frame-0");
  });

  it("cycles through frames at the given interval", () => {
    const frames = ["A", "B", "C"];
    const { result } = renderHook(() => useAsciiAnimation(frames, 1000));

    expect(result.current).toBe("A");

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe("B");

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe("C");

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe("A"); // wraps around
  });

  it("returns frame 0 when reduced motion is on", () => {
    mockUseReducedMotion.mockReturnValue(true);
    const frames = ["A", "B", "C"];
    const { result } = renderHook(() => useAsciiAnimation(frames, 500));

    expect(result.current).toBe("A");

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    // Should still be frame 0
    expect(result.current).toBe("A");
  });

  it("handles single-frame arrays without cycling", () => {
    const frames = ["only-frame"];
    const { result } = renderHook(() => useAsciiAnimation(frames, 500));

    expect(result.current).toBe("only-frame");

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current).toBe("only-frame");
  });

  it("returns empty string for empty array", () => {
    const frames: string[] = [];
    const { result } = renderHook(() => useAsciiAnimation(frames, 500));
    expect(result.current).toBe("");
  });

  it("cycles fast when glitching", () => {
    const frames = ["A", "B", "C"];
    const { result } = renderHook(() => useAsciiAnimation(frames, 2000, true));

    expect(result.current).toBe("A");

    // Glitch interval is 80ms
    act(() => {
      vi.advanceTimersByTime(80);
    });
    expect(result.current).toBe("B");

    act(() => {
      vi.advanceTimersByTime(80);
    });
    expect(result.current).toBe("C");
  });
});
