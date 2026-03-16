import { describe, expect, it } from "vitest";
import { TUTORIAL_STEP } from "../store/tutorialStore";
import { computeTooltipPosition, STEP_CONFIG } from "./TutorialOverlay";

/** Minimal DOMRect stand-in for unit tests (no DOM required). */
function makeRect(
  top: number,
  left: number,
  width: number,
  height: number,
): DOMRect {
  return {
    top,
    left,
    bottom: top + height,
    right: left + width,
    width,
    height,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

const TOOLTIP_GAP = 12;

describe("STEP_CONFIG — target element IDs", () => {
  it("FEED_BUTTON targets 'tutorial-feed-btn'", () => {
    expect(STEP_CONFIG[TUTORIAL_STEP.FEED_BUTTON].targetId).toBe(
      "tutorial-feed-btn",
    );
  });

  it("TD_COUNTER targets 'tutorial-td-counter'", () => {
    expect(STEP_CONFIG[TUTORIAL_STEP.TD_COUNTER].targetId).toBe(
      "tutorial-td-counter",
    );
  });

  it("UPGRADES_PANEL targets 'tutorial-upgrades-panel'", () => {
    expect(STEP_CONFIG[TUTORIAL_STEP.UPGRADES_PANEL].targetId).toBe(
      "tutorial-upgrades-panel",
    );
  });

  it("EVOLUTION targets 'tutorial-evolution-stage'", () => {
    expect(STEP_CONFIG[TUTORIAL_STEP.EVOLUTION].targetId).toBe(
      "tutorial-evolution-stage",
    );
  });
});

describe("STEP_CONFIG — acceptance-criteria messages", () => {
  it("FEED_BUTTON message matches AC", () => {
    expect(STEP_CONFIG[TUTORIAL_STEP.FEED_BUTTON].message).toBe(
      "Click to give GLORP training data!",
    );
  });

  it("TD_COUNTER message matches AC", () => {
    expect(STEP_CONFIG[TUTORIAL_STEP.TD_COUNTER].message).toBe(
      "Training Data (TD) is your currency. Earn more by clicking!",
    );
  });

  it("UPGRADES_PANEL message matches AC", () => {
    expect(STEP_CONFIG[TUTORIAL_STEP.UPGRADES_PANEL].message).toBe(
      "Buy upgrades to automate TD generation.",
    );
  });

  it("EVOLUTION message matches AC", () => {
    expect(STEP_CONFIG[TUTORIAL_STEP.EVOLUTION].message).toBe(
      "GLORP is growing! Evolution unlocks new upgrades and dialogue.",
    );
  });

  it("all four steps have a valid placement value", () => {
    const valid = ["top", "bottom", "left", "right"];
    for (const step of Object.values(TUTORIAL_STEP)) {
      expect(valid).toContain(STEP_CONFIG[step].placement);
    }
  });
});

describe("computeTooltipPosition", () => {
  // rect: top=100 left=50 width=200 height=60  →  bottom=160 right=250
  const rect = makeRect(100, 50, 200, 60);

  it("bottom: tooltip appears below element, horizontally centered", () => {
    const pos = computeTooltipPosition(rect, "bottom");
    expect(pos.top).toBe(160 + TOOLTIP_GAP); // rect.bottom + gap
    expect(pos.left).toBe(50 + 100); // rect.left + width/2
    expect(pos.transform).toBe("translateX(-50%)");
  });

  it("top: tooltip appears above element, horizontally centered", () => {
    const pos = computeTooltipPosition(rect, "top");
    expect(pos.top).toBe(100 - TOOLTIP_GAP); // rect.top - gap
    expect(pos.left).toBe(50 + 100); // rect.left + width/2
    expect(pos.transform).toBe("translate(-50%, -100%)");
  });

  it("right: tooltip appears to the right, vertically centered", () => {
    const pos = computeTooltipPosition(rect, "right");
    expect(pos.top).toBe(100 + 30); // rect.top + height/2
    expect(pos.left).toBe(250 + TOOLTIP_GAP); // rect.right + gap
    expect(pos.transform).toBe("translateY(-50%)");
  });

  it("left: tooltip appears to the left, vertically centered", () => {
    const pos = computeTooltipPosition(rect, "left");
    expect(pos.top).toBe(100 + 30); // rect.top + height/2
    expect(pos.left).toBe(50 - TOOLTIP_GAP); // rect.left - gap
    expect(pos.transform).toBe("translate(-100%, -50%)");
  });
});
