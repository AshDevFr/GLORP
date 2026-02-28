import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UPGRADES } from "../data/upgrades";
import { getUpgradeCost } from "../engine/upgradeEngine";
import { initialGameState, useGameStore } from "./gameStore";

beforeEach(() => {
  localStorage.clear();
  useGameStore.setState(initialGameState);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("gameStore", () => {
  describe("initial state", () => {
    it("has correct default values", () => {
      const state = useGameStore.getState();
      expect(state.trainingData).toBe(0);
      expect(state.totalClicks).toBe(0);
      expect(state.totalTdEarned).toBe(0);
      expect(state.evolutionStage).toBe(0);
      expect(state.lastSaved).toBe(0);
    });

    it("has empty upgradeOwned", () => {
      const state = useGameStore.getState();
      expect(state.upgradeOwned).toEqual({});
    });
  });

  describe("clickFeed", () => {
    it("increments trainingData by 1", () => {
      useGameStore.getState().clickFeed();
      expect(useGameStore.getState().trainingData).toBe(1);
    });

    it("increments totalClicks by 1", () => {
      useGameStore.getState().clickFeed();
      expect(useGameStore.getState().totalClicks).toBe(1);
    });

    it("increments totalTdEarned by 1", () => {
      useGameStore.getState().clickFeed();
      expect(useGameStore.getState().totalTdEarned).toBe(1);
    });

    it("updates lastSaved timestamp", () => {
      const before = Date.now();
      useGameStore.getState().clickFeed();
      const after = Date.now();
      const { lastSaved } = useGameStore.getState();
      expect(lastSaved).toBeGreaterThanOrEqual(before);
      expect(lastSaved).toBeLessThanOrEqual(after);
    });

    it("accumulates across multiple clicks", () => {
      useGameStore.getState().clickFeed();
      useGameStore.getState().clickFeed();
      useGameStore.getState().clickFeed();
      const state = useGameStore.getState();
      expect(state.trainingData).toBe(3);
      expect(state.totalClicks).toBe(3);
      expect(state.totalTdEarned).toBe(3);
    });
  });

  describe("addTrainingData", () => {
    it("adds the specified amount to trainingData", () => {
      useGameStore.getState().addTrainingData(100);
      expect(useGameStore.getState().trainingData).toBe(100);
    });

    it("adds the amount to totalTdEarned", () => {
      useGameStore.getState().addTrainingData(100);
      expect(useGameStore.getState().totalTdEarned).toBe(100);
    });

    it("does not affect totalClicks", () => {
      useGameStore.getState().addTrainingData(50);
      expect(useGameStore.getState().totalClicks).toBe(0);
    });

    it("updates lastSaved timestamp", () => {
      const before = Date.now();
      useGameStore.getState().addTrainingData(10);
      const after = Date.now();
      const { lastSaved } = useGameStore.getState();
      expect(lastSaved).toBeGreaterThanOrEqual(before);
      expect(lastSaved).toBeLessThanOrEqual(after);
    });

    it("accumulates with existing trainingData", () => {
      useGameStore.getState().addTrainingData(10);
      useGameStore.getState().addTrainingData(20);
      expect(useGameStore.getState().trainingData).toBe(30);
    });

    it("works with fractional amounts", () => {
      useGameStore.getState().addTrainingData(0.5);
      useGameStore.getState().addTrainingData(0.3);
      expect(useGameStore.getState().trainingData).toBeCloseTo(0.8);
    });

    it("combines correctly with clickFeed", () => {
      useGameStore.getState().clickFeed();
      useGameStore.getState().clickFeed();
      useGameStore.getState().addTrainingData(100);
      const state = useGameStore.getState();
      expect(state.trainingData).toBe(102);
      expect(state.totalClicks).toBe(2);
      expect(state.totalTdEarned).toBe(102);
    });
  });

  describe("purchaseUpgrade", () => {
    const firstUpgrade = UPGRADES[0];
    const baseCost = firstUpgrade.baseCost;

    it("deducts cost and increments owned count", () => {
      useGameStore.setState({ trainingData: baseCost });
      useGameStore.getState().purchaseUpgrade(firstUpgrade.id);
      const state = useGameStore.getState();
      expect(state.trainingData).toBe(0);
      expect(state.upgradeOwned[firstUpgrade.id]).toBe(1);
    });

    it("no-ops when player cannot afford", () => {
      useGameStore.setState({ trainingData: baseCost - 1 });
      useGameStore.getState().purchaseUpgrade(firstUpgrade.id);
      const state = useGameStore.getState();
      expect(state.trainingData).toBe(baseCost - 1);
      expect(state.upgradeOwned[firstUpgrade.id]).toBeUndefined();
    });

    it("scales cost after purchase", () => {
      const totalNeeded = baseCost + getUpgradeCost(firstUpgrade, 1);
      useGameStore.setState({ trainingData: totalNeeded });
      useGameStore.getState().purchaseUpgrade(firstUpgrade.id);
      useGameStore.getState().purchaseUpgrade(firstUpgrade.id);
      const state = useGameStore.getState();
      expect(state.upgradeOwned[firstUpgrade.id]).toBe(2);
      expect(state.trainingData).toBe(0);
    });

    it("no-ops for unknown upgrade id", () => {
      useGameStore.setState({ trainingData: 999_999 });
      useGameStore.getState().purchaseUpgrade("nonexistent");
      const state = useGameStore.getState();
      expect(state.trainingData).toBe(999_999);
    });

    it("updates lastSaved on purchase", () => {
      useGameStore.setState({ trainingData: baseCost });
      const before = Date.now();
      useGameStore.getState().purchaseUpgrade(firstUpgrade.id);
      const after = Date.now();
      const { lastSaved } = useGameStore.getState();
      expect(lastSaved).toBeGreaterThanOrEqual(before);
      expect(lastSaved).toBeLessThanOrEqual(after);
    });

    it("allows purchasing different upgrades independently", () => {
      const secondUpgrade = UPGRADES[1];
      useGameStore.setState({
        trainingData: firstUpgrade.baseCost + secondUpgrade.baseCost,
      });
      useGameStore.getState().purchaseUpgrade(firstUpgrade.id);
      useGameStore.getState().purchaseUpgrade(secondUpgrade.id);
      const state = useGameStore.getState();
      expect(state.upgradeOwned[firstUpgrade.id]).toBe(1);
      expect(state.upgradeOwned[secondUpgrade.id]).toBe(1);
      expect(state.trainingData).toBe(0);
    });

    it("does not change totalTdEarned", () => {
      useGameStore.setState({ trainingData: baseCost, totalTdEarned: 50 });
      useGameStore.getState().purchaseUpgrade(firstUpgrade.id);
      expect(useGameStore.getState().totalTdEarned).toBe(50);
    });
  });

  describe("evolution", () => {
    it("stays at stage 0 below threshold", () => {
      useGameStore.getState().addTrainingData(99);
      expect(useGameStore.getState().evolutionStage).toBe(0);
    });

    it("evolves to stage 1 at 100 TD earned", () => {
      useGameStore.getState().addTrainingData(100);
      expect(useGameStore.getState().evolutionStage).toBe(1);
    });

    it("evolves to stage 2 at 5000 TD earned", () => {
      useGameStore.getState().addTrainingData(5_000);
      expect(useGameStore.getState().evolutionStage).toBe(2);
    });

    it("evolves via clickFeed accumulation", () => {
      useGameStore.setState({ totalTdEarned: 99 });
      useGameStore.getState().clickFeed();
      expect(useGameStore.getState().evolutionStage).toBe(1);
    });

    it("evolves via addTrainingData accumulation", () => {
      useGameStore.getState().addTrainingData(50);
      expect(useGameStore.getState().evolutionStage).toBe(0);
      useGameStore.getState().addTrainingData(50);
      expect(useGameStore.getState().evolutionStage).toBe(1);
    });
  });
});
