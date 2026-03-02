// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useKonamiCode } from "./useKonamiCode";

function fireKeys(keys: string[]) {
  for (const key of keys) {
    window.dispatchEvent(new KeyboardEvent("keydown", { key }));
  }
}

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

describe("useKonamiCode", () => {
  it("calls onSuccess when the full Konami sequence is entered", () => {
    const onSuccess = vi.fn();
    renderHook(() => useKonamiCode(onSuccess));
    act(() => {
      fireKeys(KONAMI);
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("does not call onSuccess for a partial sequence", () => {
    const onSuccess = vi.fn();
    renderHook(() => useKonamiCode(onSuccess));
    act(() => {
      fireKeys(KONAMI.slice(0, 5));
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("does not call onSuccess for wrong sequence", () => {
    const onSuccess = vi.fn();
    renderHook(() => useKonamiCode(onSuccess));
    act(() => {
      fireKeys(["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]);
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("can be triggered multiple times", () => {
    const onSuccess = vi.fn();
    renderHook(() => useKonamiCode(onSuccess));
    act(() => {
      fireKeys(KONAMI);
      fireKeys(KONAMI);
    });
    expect(onSuccess).toHaveBeenCalledTimes(2);
  });

  it("removes event listener on unmount", () => {
    const onSuccess = vi.fn();
    const spy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useKonamiCode(onSuccess));
    unmount();
    expect(spy).toHaveBeenCalledWith("keydown", expect.any(Function));
    spy.mockRestore();
  });
});
