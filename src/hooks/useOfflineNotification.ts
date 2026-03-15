import { useCallback, useEffect, useRef } from "react";
import { useSettingsStore } from "../store/settingsStore";

/** The offline-progress cap in milliseconds (8 hours). */
export const OFFLINE_CAP_MS = 8 * 60 * 60 * 1000;

const NOTIFICATION_TITLE = "GLORP";
const NOTIFICATION_BODY =
  "GLORP has maxed out! 8 hours of training data is waiting. \u{1F916}";

function isNotificationSupported(): boolean {
  return typeof Notification !== "undefined";
}

function isPermissionGranted(): boolean {
  return isNotificationSupported() && Notification.permission === "granted";
}

/**
 * Schedules a browser notification to fire when the player has been away
 * long enough for offline progress to hit the 8-hour cap.
 *
 * Behaviour:
 * - Permission is requested lazily on the player's first click (not on mount),
 *   satisfying the Safari user-gesture requirement.
 * - The 8-hour countdown resets each time the tab regains focus
 *   (via the Page Visibility API `visibilitychange` event).
 * - The player can opt out via the `notificationsEnabled` setting even after
 *   granting OS-level permission; toggling it off cancels the pending timer.
 * - If OS/browser permission is "denied" the feature does nothing silently.
 */
export function useOfflineNotification() {
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionStartRef = useRef(Date.now());
  const hasRequestedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleNotification = useCallback(() => {
    clearTimer();
    if (!notificationsEnabled) return;
    if (!isPermissionGranted()) return;

    const elapsed = Date.now() - sessionStartRef.current;
    const remaining = OFFLINE_CAP_MS - elapsed;
    if (remaining <= 0) return;

    timerRef.current = setTimeout(() => {
      // Don't interrupt the player if they're actively viewing the tab.
      if (
        typeof document !== "undefined" &&
        document.visibilityState === "visible"
      ) {
        return;
      }
      const notification = new Notification(NOTIFICATION_TITLE, {
        body: NOTIFICATION_BODY,
        icon: "/favicon.ico",
      });
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }, remaining);
  }, [notificationsEnabled, clearTimer]);

  // Schedule on mount; re-schedule when notificationsEnabled toggles; cancel on unmount.
  useEffect(() => {
    scheduleNotification();
    return clearTimer;
  }, [scheduleNotification, clearTimer]);

  // Reset the 8-hour countdown each time the tab regains focus.
  useEffect(() => {
    if (typeof document === "undefined") return;

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        sessionStartRef.current = Date.now();
        scheduleNotification();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [scheduleNotification]);

  /**
   * Requests OS notification permission after the player's first interaction.
   * Safe to call many times — only ever prompts once.
   */
  const requestPermissionOnInteraction = useCallback(async () => {
    if (!isNotificationSupported()) return;
    if (Notification.permission !== "default") return;
    if (hasRequestedRef.current) return;

    hasRequestedRef.current = true;
    try {
      const result = await Notification.requestPermission();
      if (result === "granted") {
        scheduleNotification();
      }
    } catch {
      // requestPermission may throw in environments where no user gesture is active.
    }
  }, [scheduleNotification]);

  // Use a ref so the first-click listener always calls the latest version of
  // requestPermissionOnInteraction without re-registering on every render.
  const requestPermissionRef = useRef(requestPermissionOnInteraction);
  requestPermissionRef.current = requestPermissionOnInteraction;

  // Register a one-time click listener to prompt for permission after first interaction.
  useEffect(() => {
    if (!isNotificationSupported()) return;
    if (Notification.permission !== "default") return;

    function handleFirstClick() {
      void requestPermissionRef.current();
    }

    document.addEventListener("click", handleFirstClick, { once: true });
    return () => {
      document.removeEventListener("click", handleFirstClick);
    };
  }, []); // mount-only — the ref keeps the callback current

  return { requestPermissionOnInteraction };
}
