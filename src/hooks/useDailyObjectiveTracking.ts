import { useEffect, useRef } from "react";
import { useGameStore } from "../store";
import { useDailyStore } from "../store/dailyStore";

/**
 * Subscribes to game-store changes to feed event tracking into the daily store.
 * Must be called once per app session (in GameLayout or a top-level component).
 */
export function useDailyObjectiveTracking() {
  // Snapshot refs to detect deltas
  const prevClicksRef = useRef(useGameStore.getState().totalClicks);
  const prevComboRef = useRef(useGameStore.getState().comboCount);
  const prevRebirthRef = useRef(useGameStore.getState().rebirthCount);
  const prevPrestigeRef = useRef({
    ...useGameStore.getState().prestigeUpgrades,
  });
  const prevOwnedRef = useRef({ ...useGameStore.getState().upgradeOwned });

  useEffect(() => {
    // Initialise date on mount
    useDailyStore.getState().refreshIfNeeded();

    const unsubscribe = useGameStore.subscribe((state) => {
      const daily = useDailyStore.getState();

      // Click tracking
      const clickDelta = state.totalClicks - prevClicksRef.current;
      if (clickDelta > 0) {
        daily.recordClick(clickDelta);
      }
      prevClicksRef.current = state.totalClicks;

      // Combo tracking
      if (state.comboCount > prevComboRef.current) {
        daily.recordCombo(state.comboCount);
      }
      prevComboRef.current = state.comboCount;

      // Rebirth tracking
      if (state.rebirthCount > prevRebirthRef.current) {
        daily.recordRebirth();
      }
      prevRebirthRef.current = state.rebirthCount;

      // Prestige purchase tracking
      const prevP = prevPrestigeRef.current;
      for (const [k, v] of Object.entries(state.prestigeUpgrades)) {
        if ((prevP[k] ?? 0) < v) {
          daily.recordPrestigePurchase();
          break;
        }
      }
      prevPrestigeRef.current = { ...state.prestigeUpgrades };

      // Bulk-buy 50: detect when a single generator count jumps by 50+
      const prevO = prevOwnedRef.current;
      for (const [k, v] of Object.entries(state.upgradeOwned)) {
        if (v - (prevO[k] ?? 0) >= 50) {
          daily.recordBulkBuy50();
          break;
        }
      }
      prevOwnedRef.current = { ...state.upgradeOwned };
    });

    return unsubscribe;
  }, []);
}
