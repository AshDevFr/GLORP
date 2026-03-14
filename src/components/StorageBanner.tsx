import { Alert, Text } from "@mantine/core";
import { useCallback, useEffect, useState } from "react";
import {
  getStorageAvailable,
  type StorageError,
  setStorageErrorHandler,
} from "../utils/safeStorage";

/**
 * Persistent, non-intrusive banner that appears when:
 * 1. localStorage is completely unavailable, OR
 * 2. A QuotaExceededError occurs during play.
 *
 * Dismissable per-session, but reappears on quota errors.
 */
export function StorageBanner() {
  const [storageUnavailable] = useState(() => !getStorageAvailable());
  const [quotaError, setQuotaError] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleStorageError = useCallback((error: StorageError) => {
    if (error.type === "quota-exceeded") {
      setQuotaError(true);
      setDismissed(false); // Re-show on new quota errors
    }
  }, []);

  useEffect(() => {
    setStorageErrorHandler(handleStorageError);
  }, [handleStorageError]);

  if (dismissed) return null;

  if (storageUnavailable) {
    return (
      <Alert
        color="orange"
        variant="filled"
        withCloseButton
        onClose={() => setDismissed(true)}
        style={{
          position: "fixed",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          maxWidth: 480,
          fontFamily: "monospace",
        }}
        data-testid="storage-banner"
      >
        <Text size="sm" ff="monospace">
          localStorage is unavailable. Your progress will not be saved between
          sessions. Use "Copy Save to Clipboard" in Settings to back up
          manually.
        </Text>
      </Alert>
    );
  }

  if (quotaError) {
    return (
      <Alert
        color="red"
        variant="light"
        withCloseButton
        onClose={() => setDismissed(true)}
        style={{
          position: "fixed",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          maxWidth: 480,
          fontFamily: "monospace",
        }}
        data-testid="storage-banner"
      >
        <Text size="sm" ff="monospace">
          Storage is full! Your latest progress may not be saved. Export your
          save from Settings or clear other site data to free space.
        </Text>
      </Alert>
    );
  }

  return null;
}
