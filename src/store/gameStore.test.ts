import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
      expect(state.evolutionStage).toBe(0);
      expect(state.lastSaved).toBe(0);
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
    });

    it("does not affect evolutionStage", () => {
      useGameStore.getState().clickFeed();
      expect(useGameStore.getState().evolutionStage).toBe(0);
    });
  });

  describe("addTrainingData", () => {
    it("adds the specified amount to trainingData", () => {
      useGameStore.getState().addTrainingData(100);
      expect(useGameStore.getState().trainingData).toBe(100);
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
    });
  });
});
