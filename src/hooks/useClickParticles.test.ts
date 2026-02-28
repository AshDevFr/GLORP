// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useClickParticles } from "./useClickParticles";

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }) as typeof window.matchMedia;
}

const fakeRect: DOMRect = {
  width: 400,
  height: 300,
  x: 0,
  y: 0,
  top: 0,
  right: 400,
  bottom: 300,
  left: 0,
  toJSON: () => ({}),
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useClickParticles", () => {
  it("starts with empty particles", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useClickParticles());
    expect(result.current.particles).toEqual([]);
  });

  it("spawns 3-5 particles on spawn()", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useClickParticles());

    act(() => {
      result.current.spawn(fakeRect);
    });

    expect(result.current.particles.length).toBeGreaterThanOrEqual(3);
    expect(result.current.particles.length).toBeLessThanOrEqual(5);
  });

  it("each particle has id, x, y properties", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useClickParticles());

    act(() => {
      result.current.spawn(fakeRect);
    });

    for (const p of result.current.particles) {
      expect(typeof p.id).toBe("number");
      expect(typeof p.x).toBe("number");
      expect(typeof p.y).toBe("number");
    }
  });

  it("removes particles after 800ms", () => {
    vi.useFakeTimers();
    mockMatchMedia(false);
    const { result } = renderHook(() => useClickParticles());

    act(() => {
      result.current.spawn(fakeRect);
    });

    expect(result.current.particles.length).toBeGreaterThan(0);

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(result.current.particles).toEqual([]);
    vi.useRealTimers();
  });

  it("does not spawn particles when reduced motion is preferred", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useClickParticles());

    act(() => {
      result.current.spawn(fakeRect);
    });

    expect(result.current.particles).toEqual([]);
  });

  it("accumulates particles from multiple spawns", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useClickParticles());

    act(() => {
      result.current.spawn(fakeRect);
    });
    const firstCount = result.current.particles.length;

    act(() => {
      result.current.spawn(fakeRect);
    });

    expect(result.current.particles.length).toBeGreaterThan(firstCount);
  });
});
