// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getStorageAvailable,
  isLocalStorageAvailable,
  resetStorageAvailableCache,
  type StorageError,
  type StorageErrorHandler,
  safeGetItem,
  safeRemoveItem,
  safeSetItem,
  safeStateStorage,
  setStorageErrorHandler,
} from "./safeStorage";

beforeEach(() => {
  localStorage.clear();
  resetStorageAvailableCache();
  setStorageErrorHandler(null as unknown as StorageErrorHandler);
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("isLocalStorageAvailable", () => {
  it("returns true when localStorage works normally", () => {
    expect(isLocalStorageAvailable()).toBe(true);
  });

  it("returns false when localStorage.setItem throws", () => {
    const origSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = () => {
      throw new Error("SecurityError");
    };
    expect(isLocalStorageAvailable()).toBe(false);
    localStorage.setItem = origSetItem;
  });
});

describe("getStorageAvailable", () => {
  it("caches the result after first call", () => {
    const origSetItem = localStorage.setItem.bind(localStorage);
    let callCount = 0;
    localStorage.setItem = (...args: [string, string]) => {
      callCount++;
      return origSetItem(...args);
    };
    getStorageAvailable();
    const firstCallCount = callCount;
    getStorageAvailable();
    // Second call should not call setItem again (cached)
    expect(callCount).toBe(firstCallCount);
    localStorage.setItem = origSetItem;
  });

  it("returns false when storage is unavailable", () => {
    const origSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = () => {
      throw new Error("SecurityError");
    };
    expect(getStorageAvailable()).toBe(false);
    localStorage.setItem = origSetItem;
  });
});

describe("safeGetItem", () => {
  it("returns the stored value", () => {
    localStorage.setItem("test-key", "test-value");
    expect(safeGetItem("test-key")).toBe("test-value");
  });

  it("returns null for missing keys", () => {
    expect(safeGetItem("nonexistent")).toBeNull();
  });

  it("returns null and logs error when getItem throws", () => {
    // Ensure storage is detected as available
    getStorageAvailable();
    const origGetItem = localStorage.getItem.bind(localStorage);
    localStorage.getItem = () => {
      throw new Error("read failure");
    };
    const handler = vi.fn();
    setStorageErrorHandler(handler);
    expect(safeGetItem("test-key")).toBeNull();
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ type: "read-error" }),
    );
    localStorage.getItem = origGetItem;
  });

  it("returns null when storage is unavailable without throwing", () => {
    const origSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = () => {
      throw new Error("SecurityError");
    };
    resetStorageAvailableCache();
    expect(safeGetItem("test-key")).toBeNull();
    localStorage.setItem = origSetItem;
  });
});

describe("safeSetItem", () => {
  it("returns true on successful write", () => {
    expect(safeSetItem("key", "value")).toBe(true);
    expect(localStorage.getItem("key")).toBe("value");
  });

  it("returns false and notifies on QuotaExceededError", () => {
    // Ensure storage is detected as available first
    getStorageAvailable();
    const origSetItem = localStorage.setItem.bind(localStorage);
    const quotaError = new DOMException("Quota exceeded", "QuotaExceededError");
    localStorage.setItem = () => {
      throw quotaError;
    };
    const handler = vi.fn();
    setStorageErrorHandler(handler);
    expect(safeSetItem("game-state", "data")).toBe(false);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ type: "quota-exceeded" }),
    );
    localStorage.setItem = origSetItem;
  });

  it("returns false and notifies on generic write error", () => {
    getStorageAvailable();
    const origSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = () => {
      throw new Error("write failure");
    };
    const handler = vi.fn();
    setStorageErrorHandler(handler);
    expect(safeSetItem("game-state", "data")).toBe(false);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ type: "write-error" }),
    );
    localStorage.setItem = origSetItem;
  });

  it("returns false without throwing when storage is unavailable", () => {
    const origSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = () => {
      throw new Error("SecurityError");
    };
    resetStorageAvailableCache();
    expect(safeSetItem("key", "value")).toBe(false);
    localStorage.setItem = origSetItem;
  });
});

describe("safeRemoveItem", () => {
  it("removes the item from storage", () => {
    localStorage.setItem("to-remove", "value");
    safeRemoveItem("to-remove");
    expect(localStorage.getItem("to-remove")).toBeNull();
  });

  it("does not throw when storage is unavailable", () => {
    const origSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = () => {
      throw new Error("SecurityError");
    };
    resetStorageAvailableCache();
    expect(() => safeRemoveItem("key")).not.toThrow();
    localStorage.setItem = origSetItem;
  });

  it("notifies handler on removeItem error", () => {
    getStorageAvailable();
    const origRemoveItem = localStorage.removeItem.bind(localStorage);
    localStorage.removeItem = () => {
      throw new Error("remove failure");
    };
    const handler = vi.fn();
    setStorageErrorHandler(handler);
    safeRemoveItem("key");
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ type: "write-error" }),
    );
    localStorage.removeItem = origRemoveItem;
  });
});

describe("safeStateStorage (Zustand StateStorage adapter)", () => {
  it("implements getItem, setItem, removeItem", () => {
    expect(typeof safeStateStorage.getItem).toBe("function");
    expect(typeof safeStateStorage.setItem).toBe("function");
    expect(typeof safeStateStorage.removeItem).toBe("function");
  });

  it("round-trips a value", () => {
    safeStateStorage.setItem("zustand-key", '{"state":{"count":1}}');
    expect(safeStateStorage.getItem("zustand-key")).toBe(
      '{"state":{"count":1}}',
    );
  });

  it("returns null after removeItem", () => {
    safeStateStorage.setItem("zustand-key", "data");
    safeStateStorage.removeItem("zustand-key");
    expect(safeStateStorage.getItem("zustand-key")).toBeNull();
  });
});

describe("error handler registration", () => {
  it("calls the registered handler on errors", () => {
    const errors: StorageError[] = [];
    setStorageErrorHandler((e: StorageError) => errors.push(e));
    getStorageAvailable();
    const origGetItem = localStorage.getItem.bind(localStorage);
    localStorage.getItem = () => {
      throw new Error("fail");
    };
    safeGetItem("key");
    expect(errors).toHaveLength(1);
    expect(errors[0].type).toBe("read-error");
    localStorage.getItem = origGetItem;
  });

  it("handles null handler gracefully", () => {
    setStorageErrorHandler(null as unknown as StorageErrorHandler);
    getStorageAvailable();
    const origGetItem = localStorage.getItem.bind(localStorage);
    localStorage.getItem = () => {
      throw new Error("fail");
    };
    expect(() => safeGetItem("key")).not.toThrow();
    localStorage.getItem = origGetItem;
  });
});
