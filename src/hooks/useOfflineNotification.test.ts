// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initialSettings, useSettingsStore } from "../store/settingsStore";
import {
  OFFLINE_CAP_MS,
  useOfflineNotification,
} from "./useOfflineNotification";

// ---------------------------------------------------------------------------
// Notification API mock
// ---------------------------------------------------------------------------

const mockNotificationConstructor = vi.fn();
const mockClose = vi.fn();

class MockNotification {
  static permission: NotificationPermission = "default";
  static requestPermission = vi.fn<[], Promise<NotificationPermission>>();

  body: string;
  icon: string | undefined;
  onclick: ((this: Notification, ev: Event) => unknown) | null = null;
  close = mockClose;

  constructor(
    title: string,
    options?: { body?: string; icon?: string },
  ) {
    this.body = options?.body ?? "";
    this.icon = options?.icon;
    mockNotificationConstructor(title, options);
  }
}

beforeEach(() => {
  vi.useFakeTimers();
  MockNotification.permission = "default";
  MockNotification.requestPermission = vi.fn<
    [],
    Promise<NotificationPermission>
  >();
  mockNotificationConstructor.mockClear();
  mockClose.mockClear();

  Object.defineProperty(globalThis, "Notification", {
    value: MockNotification,
    writable: true,
    configurable: true,
  });

  // Default to hidden so timer callbacks fire without the visibility guard
  // blocking them. Individual tests override this as needed.
  Object.defineProperty(document, "visibilityState", {
    value: "hidden",
    writable: true,
    configurable: true,
  });

  useSettingsStore.setState(initialSettings);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useOfflineNotification", () => {
  it("does not schedule a notification when notificationsEnabled is false", () => {
    useSettingsStore.setState({ notificationsEnabled: false });
    MockNotification.permission = "granted";

    renderHook(() => useOfflineNotification());

    vi.advanceTimersByTime(OFFLINE_CAP_MS + 1000);
    expect(mockNotificationConstructor).not.toHaveBeenCalled();
  });

  it("does not schedule a notification when permission is not granted", () => {
    useSettingsStore.setState({ notificationsEnabled: true });
    MockNotification.permission = "default";

    renderHook(() => useOfflineNotification());

    vi.advanceTimersByTime(OFFLINE_CAP_MS + 1000);
    expect(mockNotificationConstructor).not.toHaveBeenCalled();
  });

  it("does not schedule a notification when permission is denied", () => {
    useSettingsStore.setState({ notificationsEnabled: true });
    MockNotification.permission = "denied";

    renderHook(() => useOfflineNotification());

    vi.advanceTimersByTime(OFFLINE_CAP_MS + 1000);
    expect(mockNotificationConstructor).not.toHaveBeenCalled();
  });

  it("fires a notification after OFFLINE_CAP_MS when permission is granted", () => {
    useSettingsStore.setState({ notificationsEnabled: true });
    MockNotification.permission = "granted";

    renderHook(() => useOfflineNotification());

    vi.advanceTimersByTime(OFFLINE_CAP_MS - 1);
    expect(mockNotificationConstructor).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1001);
    expect(mockNotificationConstructor).toHaveBeenCalledOnce();
    expect(mockNotificationConstructor).toHaveBeenCalledWith(
      "GLORP",
      expect.objectContaining({
        body: expect.stringContaining("GLORP has maxed out!"),
      }),
    );
  });

  it("does not fire the notification while the tab is visible", () => {
    useSettingsStore.setState({ notificationsEnabled: true });
    MockNotification.permission = "granted";

    // Override to visible — the timer fires but the callback should bail out.
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      writable: true,
      configurable: true,
    });

    renderHook(() => useOfflineNotification());

    vi.advanceTimersByTime(OFFLINE_CAP_MS + 1000);
    expect(mockNotificationConstructor).not.toHaveBeenCalled();
  });

  it("resets the 8-hour countdown when the tab regains focus", () => {
    useSettingsStore.setState({ notificationsEnabled: true });
    MockNotification.permission = "granted";

    renderHook(() => useOfflineNotification());

    // Advance 4 hours — no notification yet.
    vi.advanceTimersByTime(4 * 60 * 60 * 1000);
    expect(mockNotificationConstructor).not.toHaveBeenCalled();

    // Tab gains focus — should reset session start and reschedule for 8h from now.
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      writable: true,
      configurable: true,
    });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    // Advance another 4 hours (8h total from original mount, but only 4h since reset).
    // Notification should NOT have fired yet.
    Object.defineProperty(document, "visibilityState", {
      value: "hidden",
      writable: true,
      configurable: true,
    });
    vi.advanceTimersByTime(4 * 60 * 60 * 1000);
    expect(mockNotificationConstructor).not.toHaveBeenCalled();

    // Advance the remaining 4h since the reset — now it fires.
    vi.advanceTimersByTime(4 * 60 * 60 * 1000 + 1000);
    expect(mockNotificationConstructor).toHaveBeenCalledOnce();
  });

  it("cancels the timer when notificationsEnabled is toggled off", () => {
    useSettingsStore.setState({ notificationsEnabled: true });
    MockNotification.permission = "granted";

    renderHook(() => useOfflineNotification());

    // Disable notifications mid-countdown.
    act(() => {
      useSettingsStore.setState({ notificationsEnabled: false });
    });

    vi.advanceTimersByTime(OFFLINE_CAP_MS + 1000);
    expect(mockNotificationConstructor).not.toHaveBeenCalled();
  });

  it("reschedules the timer when notificationsEnabled is toggled back on", () => {
    useSettingsStore.setState({ notificationsEnabled: false });
    MockNotification.permission = "granted";

    renderHook(() => useOfflineNotification());

    // Enable notifications — should schedule the timer.
    act(() => {
      useSettingsStore.setState({ notificationsEnabled: true });
    });

    vi.advanceTimersByTime(OFFLINE_CAP_MS + 1000);
    expect(mockNotificationConstructor).toHaveBeenCalledOnce();
  });

  describe("requestPermissionOnInteraction", () => {
    it("calls Notification.requestPermission on first interaction", async () => {
      MockNotification.permission = "default";
      MockNotification.requestPermission.mockResolvedValue("granted");
      useSettingsStore.setState({ notificationsEnabled: true });

      const { result } = renderHook(() => useOfflineNotification());

      await act(async () => {
        await result.current.requestPermissionOnInteraction();
      });

      expect(MockNotification.requestPermission).toHaveBeenCalledOnce();
    });

    it("only calls requestPermission once even if invoked multiple times", async () => {
      MockNotification.permission = "default";
      MockNotification.requestPermission.mockResolvedValue("granted");
      useSettingsStore.setState({ notificationsEnabled: true });

      const { result } = renderHook(() => useOfflineNotification());

      await act(async () => {
        await result.current.requestPermissionOnInteraction();
        await result.current.requestPermissionOnInteraction();
        await result.current.requestPermissionOnInteraction();
      });

      expect(MockNotification.requestPermission).toHaveBeenCalledOnce();
    });

    it("does not prompt if permission is already granted", async () => {
      MockNotification.permission = "granted";
      useSettingsStore.setState({ notificationsEnabled: true });

      const { result } = renderHook(() => useOfflineNotification());

      await act(async () => {
        await result.current.requestPermissionOnInteraction();
      });

      expect(MockNotification.requestPermission).not.toHaveBeenCalled();
    });

    it("does not prompt if permission is already denied", async () => {
      MockNotification.permission = "denied";
      useSettingsStore.setState({ notificationsEnabled: true });

      const { result } = renderHook(() => useOfflineNotification());

      await act(async () => {
        await result.current.requestPermissionOnInteraction();
      });

      expect(MockNotification.requestPermission).not.toHaveBeenCalled();
    });

    it("schedules a notification after permission is granted", async () => {
      MockNotification.permission = "default";
      MockNotification.requestPermission.mockResolvedValue("granted");
      useSettingsStore.setState({ notificationsEnabled: true });

      const { result } = renderHook(() => useOfflineNotification());

      await act(async () => {
        await result.current.requestPermissionOnInteraction();
        // Simulate permission becoming granted after the prompt.
        MockNotification.permission = "granted";
      });

      vi.advanceTimersByTime(OFFLINE_CAP_MS + 1000);
      expect(mockNotificationConstructor).toHaveBeenCalledOnce();
    });
  });
});
