import { useCallback, useEffect, useRef, useState } from "react";
import { BOOSTERS } from "../data/boosters";
import {
  getBurstDuration,
  getBurstMaxInterval,
  getBurstMinInterval,
  getIdleBoostMultiplier,
} from "../data/prestigeShop";
import { getSpeciesBonus } from "../data/species";
import { UPGRADES } from "../data/upgrades";
import {
  computeBoosterMultiplier,
  getTotalTdPerSecond,
} from "../engine/upgradeEngine";
import { useGameStore } from "../store";
import { D } from "../utils/decimal";

/** Duration of the production boost in milliseconds. */
export const BURST_BOOST_DURATION_MS = 45_000;

/** Multiplier applied to auto-gen TD/s during a burst boost. */
export const BURST_BOOST_MULTIPLIER = 3;

export interface DataBurstState {
  isVisible: boolean;
  /** CSS percentage [10–80] for position within the pet display area. */
  position: { x: number; y: number };
  /** Seconds remaining before the current orb disappears (0 when not visible). */
  secondsLeft: number;
}

function randomPosition(): { x: number; y: number } {
  return {
    x: 10 + Math.random() * 70,
    y: 10 + Math.random() * 70,
  };
}

function randomInterval(minMs: number, maxMs: number): number {
  return minMs + Math.random() * (maxMs - minMs);
}

/**
 * Manages Data Burst scheduling and reward logic.
 *
 * Returns current burst visibility state and a handler to call when the
 * player clicks the burst orb.
 */
export function useDataBurst(): {
  burstState: DataBurstState;
  onBurstClick: () => void;
} {
  const upgradeOwned = useGameStore((s) => s.upgradeOwned);
  const prestigeUpgrades = useGameStore((s) => s.prestigeUpgrades);
  const activateBurstBoost = useGameStore((s) => s.activateBurstBoost);
  const clearBurstBoost = useGameStore((s) => s.clearBurstBoost);
  const addTrainingData = useGameStore((s) => s.addTrainingData);

  const [burstState, setBurstState] = useState<DataBurstState>({
    isVisible: false,
    position: { x: 50, y: 50 },
    secondsLeft: 0,
  });

  // Refs to hold mutable timer handles
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expireTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const boostClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burstVisibleRef = useRef(false);

  /** True when at least one auto-generator is owned. */
  const hasGenerators =
    Object.values(upgradeOwned).reduce((s, n) => s + n, 0) > 0;

  const burstFrequencyLevel = prestigeUpgrades["burst-frequency"] ?? 0;
  const burstDurationLevel = prestigeUpgrades["burst-duration"] ?? 0;
  const minIntervalMs = getBurstMinInterval(burstFrequencyLevel) * 1000;
  const maxIntervalMs = getBurstMaxInterval(burstFrequencyLevel) * 1000;
  const durationMs = getBurstDuration(burstDurationLevel) * 1000;

  /** Clear all pending timers. */
  const clearAllTimers = useCallback(() => {
    if (spawnTimerRef.current !== null) {
      clearTimeout(spawnTimerRef.current);
      spawnTimerRef.current = null;
    }
    if (expireTimerRef.current !== null) {
      clearTimeout(expireTimerRef.current);
      expireTimerRef.current = null;
    }
    if (countdownIntervalRef.current !== null) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  /** Show the burst orb and start its expiry countdown. */
  const showBurst = useCallback(() => {
    if (burstVisibleRef.current) return; // already visible
    const pos = randomPosition();
    const durationSec = Math.round(durationMs / 1000);
    burstVisibleRef.current = true;
    setBurstState({ isVisible: true, position: pos, secondsLeft: durationSec });

    // Countdown update every second
    let remaining = durationSec;
    countdownIntervalRef.current = setInterval(() => {
      remaining -= 1;
      setBurstState((prev) => ({ ...prev, secondsLeft: remaining }));
    }, 1000);

    // Expiry
    expireTimerRef.current = setTimeout(() => {
      if (countdownIntervalRef.current !== null) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      burstVisibleRef.current = false;
      setBurstState({ isVisible: false, position: pos, secondsLeft: 0 });
      // Trigger expired dialogue via event so dialogue hook can respond
      window.dispatchEvent(new CustomEvent("dataBurstExpired"));
    }, durationMs);
  }, [durationMs]);

  /** Schedule the next burst spawn after a random delay. */
  const scheduleNextBurst = useCallback(() => {
    if (spawnTimerRef.current !== null) clearTimeout(spawnTimerRef.current);
    const delay = randomInterval(minIntervalMs, maxIntervalMs);
    spawnTimerRef.current = setTimeout(() => {
      showBurst();
    }, delay);
  }, [minIntervalMs, maxIntervalMs, showBurst]);

  /** Handle player clicking the burst orb. */
  const onBurstClick = useCallback(() => {
    if (!burstVisibleRef.current) return;

    // Cancel expiry timers
    if (expireTimerRef.current !== null) {
      clearTimeout(expireTimerRef.current);
      expireTimerRef.current = null;
    }
    if (countdownIntervalRef.current !== null) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    burstVisibleRef.current = false;
    setBurstState((prev) => ({ ...prev, isVisible: false, secondsLeft: 0 }));

    // Compute current TD/s for lump-sum reward using latest state snapshot
    const state = useGameStore.getState();
    const isNoPrest = state.activeChallengeId === "no-prestige";
    const ep = isNoPrest ? {} : state.prestigeUpgrades;
    const idleBoost = getIdleBoostMultiplier(ep["idle-boost"] ?? 0);
    const speciesAutoGen = getSpeciesBonus(state.currentSpecies).autoGen;
    const boosterMult = computeBoosterMultiplier(
      BOOSTERS,
      state.boostersPurchased,
    );
    const tdPerSecond = getTotalTdPerSecond(
      UPGRADES,
      state.upgradeOwned,
      idleBoost * speciesAutoGen,
      boosterMult,
    );

    // Pick reward at random (50/50)
    if (Math.random() < 0.5) {
      // Production boost: 3× auto-gen for 45 seconds
      activateBurstBoost(BURST_BOOST_DURATION_MS);
      // Schedule automatic clear
      if (boostClearTimerRef.current !== null)
        clearTimeout(boostClearTimerRef.current);
      boostClearTimerRef.current = setTimeout(() => {
        clearBurstBoost();
        boostClearTimerRef.current = null;
      }, BURST_BOOST_DURATION_MS);
    } else {
      // Lump sum: 30 minutes of current auto-gen
      const lumpSum = tdPerSecond.mul(D(1800));
      if (lumpSum.gt(0)) {
        addTrainingData(lumpSum);
      }
    }

    // Trigger collect dialogue
    window.dispatchEvent(new CustomEvent("dataBurstCollect"));

    // Schedule next burst
    scheduleNextBurst();
  }, [activateBurstBoost, clearBurstBoost, addTrainingData, scheduleNextBurst]);

  // On mount: resume mid-boost if page was refreshed during one.
  // clearBurstBoost is a stable Zustand action so this only runs once.
  useEffect(() => {
    const state = useGameStore.getState();
    const remaining = state.burstBoostExpiresAt - Date.now();
    if (remaining > 0 && state.burstMultiplier > 1) {
      if (boostClearTimerRef.current !== null)
        clearTimeout(boostClearTimerRef.current);
      boostClearTimerRef.current = setTimeout(() => {
        clearBurstBoost();
        boostClearTimerRef.current = null;
      }, remaining);
    }
  }, [clearBurstBoost]);

  // Start scheduling when generators are available; stop when they're gone.
  useEffect(() => {
    if (!hasGenerators) {
      clearAllTimers();
      burstVisibleRef.current = false;
      setBurstState({
        isVisible: false,
        position: { x: 50, y: 50 },
        secondsLeft: 0,
      });
      return;
    }
    // Only schedule if we don't already have a burst or pending spawn
    if (!burstVisibleRef.current && spawnTimerRef.current === null) {
      scheduleNextBurst();
    }
    return clearAllTimers;
  }, [hasGenerators, clearAllTimers, scheduleNextBurst]);

  // Reschedule on tab-focus (visibilitychange) so we don't accumulate
  // stale timers while the tab is hidden, as recommended by the spec.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && hasGenerators) {
        if (!burstVisibleRef.current) {
          clearAllTimers();
          scheduleNextBurst();
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [hasGenerators, clearAllTimers, scheduleNextBurst]);

  return { burstState, onBurstClick };
}
