import { beforeEach, describe, expect, it } from "vitest";
import {
  getActiveStep,
  initialTutorialState,
  TUTORIAL_STEP,
  useTutorialStore,
} from "./tutorialStore";

beforeEach(() => {
  useTutorialStore.setState(initialTutorialState);
});

describe("useTutorialStore", () => {
  it("has correct initial state", () => {
    const state = useTutorialStore.getState();
    expect(state.completedSteps).toEqual([]);
    expect(state.dismissed).toBe(false);
  });

  it("completeStep adds the step to completedSteps", () => {
    useTutorialStore.getState().completeStep(TUTORIAL_STEP.FEED_BUTTON);
    expect(useTutorialStore.getState().completedSteps).toContain(
      TUTORIAL_STEP.FEED_BUTTON,
    );
  });

  it("completeStep is idempotent (does not duplicate steps)", () => {
    useTutorialStore.getState().completeStep(TUTORIAL_STEP.FEED_BUTTON);
    useTutorialStore.getState().completeStep(TUTORIAL_STEP.FEED_BUTTON);
    const { completedSteps } = useTutorialStore.getState();
    expect(
      completedSteps.filter((s) => s === TUTORIAL_STEP.FEED_BUTTON),
    ).toHaveLength(1);
  });

  it("completeStep does not affect other steps", () => {
    useTutorialStore.getState().completeStep(TUTORIAL_STEP.FEED_BUTTON);
    expect(useTutorialStore.getState().completedSteps).not.toContain(
      TUTORIAL_STEP.TD_COUNTER,
    );
  });

  it("can complete multiple different steps", () => {
    useTutorialStore.getState().completeStep(TUTORIAL_STEP.FEED_BUTTON);
    useTutorialStore.getState().completeStep(TUTORIAL_STEP.TD_COUNTER);
    const { completedSteps } = useTutorialStore.getState();
    expect(completedSteps).toContain(TUTORIAL_STEP.FEED_BUTTON);
    expect(completedSteps).toContain(TUTORIAL_STEP.TD_COUNTER);
  });

  it("skipTutorial sets dismissed to true", () => {
    useTutorialStore.getState().skipTutorial();
    expect(useTutorialStore.getState().dismissed).toBe(true);
  });

  it("skipTutorial does not clear completedSteps", () => {
    useTutorialStore.getState().completeStep(TUTORIAL_STEP.FEED_BUTTON);
    useTutorialStore.getState().skipTutorial();
    expect(useTutorialStore.getState().completedSteps).toContain(
      TUTORIAL_STEP.FEED_BUTTON,
    );
  });

  it("resetTutorial restores initial state", () => {
    useTutorialStore.getState().completeStep(TUTORIAL_STEP.FEED_BUTTON);
    useTutorialStore.getState().skipTutorial();
    useTutorialStore.getState().resetTutorial();
    const state = useTutorialStore.getState();
    expect(state.completedSteps).toEqual([]);
    expect(state.dismissed).toBe(false);
  });
});

describe("getActiveStep", () => {
  it("returns FEED_BUTTON (0) when no steps are completed", () => {
    expect(getActiveStep({ completedSteps: [], dismissed: false })).toBe(
      TUTORIAL_STEP.FEED_BUTTON,
    );
  });

  it("returns TD_COUNTER (1) after FEED_BUTTON is completed", () => {
    expect(
      getActiveStep({
        completedSteps: [TUTORIAL_STEP.FEED_BUTTON],
        dismissed: false,
      }),
    ).toBe(TUTORIAL_STEP.TD_COUNTER);
  });

  it("returns UPGRADES_PANEL (2) after first two steps are completed", () => {
    expect(
      getActiveStep({
        completedSteps: [TUTORIAL_STEP.FEED_BUTTON, TUTORIAL_STEP.TD_COUNTER],
        dismissed: false,
      }),
    ).toBe(TUTORIAL_STEP.UPGRADES_PANEL);
  });

  it("returns EVOLUTION (3) after first three steps are completed", () => {
    expect(
      getActiveStep({
        completedSteps: [
          TUTORIAL_STEP.FEED_BUTTON,
          TUTORIAL_STEP.TD_COUNTER,
          TUTORIAL_STEP.UPGRADES_PANEL,
        ],
        dismissed: false,
      }),
    ).toBe(TUTORIAL_STEP.EVOLUTION);
  });

  it("returns null when all steps are completed", () => {
    expect(
      getActiveStep({
        completedSteps: [
          TUTORIAL_STEP.FEED_BUTTON,
          TUTORIAL_STEP.TD_COUNTER,
          TUTORIAL_STEP.UPGRADES_PANEL,
          TUTORIAL_STEP.EVOLUTION,
        ],
        dismissed: false,
      }),
    ).toBeNull();
  });

  it("returns null when dismissed, regardless of completedSteps", () => {
    expect(getActiveStep({ completedSteps: [], dismissed: true })).toBeNull();
  });

  it("returns null when dismissed even with some steps incomplete", () => {
    expect(
      getActiveStep({
        completedSteps: [TUTORIAL_STEP.FEED_BUTTON],
        dismissed: true,
      }),
    ).toBeNull();
  });
});
