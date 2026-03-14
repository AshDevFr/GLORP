/**
 * Safe localStorage wrapper that handles all edge cases:
 * - localStorage completely unavailable (private browsing, iframe sandbox)
 * - QuotaExceededError on writes
 * - Corrupted data on reads (invalid JSON)
 *
 * Provides a Zustand-compatible StateStorage adapter and a reactive
 * "storage available" flag for the UI banner.
 */
import { createJSONStorage, type StateStorage } from "zustand/middleware";

/** Callback signature for storage error notifications. */
export type StorageErrorHandler = (error: StorageError) => void;

export interface StorageError {
  type: "quota-exceeded" | "read-error" | "write-error" | "unavailable";
  message: string;
  originalError?: unknown;
}

let errorHandler: StorageErrorHandler | null = null;

/** Register a handler that is called when storage errors occur. */
export function setStorageErrorHandler(handler: StorageErrorHandler): void {
  errorHandler = handler;
}

function notifyError(error: StorageError): void {
  console.error(
    `[safeStorage] ${error.type}: ${error.message}`,
    error.originalError,
  );
  errorHandler?.(error);
}

/**
 * Detect whether localStorage is available and functional.
 * Returns false if the browser blocks access entirely or throws on use.
 */
export function isLocalStorageAvailable(): boolean {
  const testKey = "__glorp_storage_test__";
  try {
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/** Cached availability flag, computed once at module load. */
let storageAvailable: boolean | null = null;

/** Returns whether localStorage is available (cached after first call). */
export function getStorageAvailable(): boolean {
  if (storageAvailable === null) {
    storageAvailable = isLocalStorageAvailable();
  }
  return storageAvailable;
}

/**
 * Reset the cached availability flag. Only used in tests.
 * @internal
 */
export function resetStorageAvailableCache(): void {
  storageAvailable = null;
}

/**
 * Safe wrapper around localStorage.getItem.
 * Returns null if storage is unavailable or the key doesn't exist.
 */
export function safeGetItem(key: string): string | null {
  if (!getStorageAvailable()) return null;
  try {
    return localStorage.getItem(key);
  } catch (e) {
    notifyError({
      type: "read-error",
      message: `Failed to read key "${key}" from localStorage`,
      originalError: e,
    });
    return null;
  }
}

/**
 * Safe wrapper around localStorage.setItem.
 * Catches QuotaExceededError and other write failures.
 * Returns true if the write succeeded, false otherwise.
 */
export function safeSetItem(key: string, value: string): boolean {
  if (!getStorageAvailable()) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      notifyError({
        type: "quota-exceeded",
        message:
          "localStorage is full. Your progress may not be saved. Try exporting your save or clearing browser data.",
        originalError: e,
      });
    } else {
      notifyError({
        type: "write-error",
        message: `Failed to write key "${key}" to localStorage`,
        originalError: e,
      });
    }
    return false;
  }
}

/**
 * Safe wrapper around localStorage.removeItem.
 * Silently handles errors — removal failure is non-critical.
 */
export function safeRemoveItem(key: string): void {
  if (!getStorageAvailable()) return;
  try {
    localStorage.removeItem(key);
  } catch (e) {
    notifyError({
      type: "write-error",
      message: `Failed to remove key "${key}" from localStorage`,
      originalError: e,
    });
  }
}

/**
 * Raw StateStorage implementation using the safe wrappers.
 */
const safeStateStorage: StateStorage = {
  getItem: (name: string): string | null => {
    return safeGetItem(name);
  },
  setItem: (name: string, value: string): void => {
    safeSetItem(name, value);
  },
  removeItem: (name: string): void => {
    safeRemoveItem(name);
  },
};

/**
 * Zustand-compatible PersistStorage created via createJSONStorage.
 * Use this as the `storage` option in Zustand persist config.
 */
export const safeStorage = createJSONStorage(() => safeStateStorage);

/**
 * Re-export the raw StateStorage for testing.
 * @internal
 */
export { safeStateStorage };
