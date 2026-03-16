import { Box, Button, Group, Portal, Text } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { UPGRADES } from "../data/upgrades";
import { getUpgradeCost } from "../engine/upgradeEngine";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useGameStore } from "../store";
import {
  getActiveStep,
  TUTORIAL_STEP,
  type TutorialStep,
  useTutorialStore,
} from "../store/tutorialStore";

export interface StepConfig {
  targetId: string;
  message: string;
  placement: "top" | "bottom" | "left" | "right";
}

export const STEP_CONFIG: { [K in TutorialStep]: StepConfig } = {
  [TUTORIAL_STEP.FEED_BUTTON]: {
    targetId: "tutorial-feed-btn",
    message: "Click to give GLORP training data!",
    placement: "bottom",
  },
  [TUTORIAL_STEP.TD_COUNTER]: {
    targetId: "tutorial-td-counter",
    message: "Training Data (TD) is your currency. Earn more by clicking!",
    placement: "bottom",
  },
  [TUTORIAL_STEP.UPGRADES_PANEL]: {
    targetId: "tutorial-upgrades-panel",
    message: "Buy upgrades to automate TD generation.",
    placement: "right",
  },
  [TUTORIAL_STEP.EVOLUTION]: {
    targetId: "tutorial-evolution-stage",
    message: "GLORP is growing! Evolution unlocks new upgrades and dialogue.",
    placement: "bottom",
  },
};

const TOOLTIP_GAP = 12;

export function computeTooltipPosition(
  rect: DOMRect,
  placement: StepConfig["placement"],
): { top: number; left: number; transform: string } {
  switch (placement) {
    case "bottom":
      return {
        top: rect.bottom + TOOLTIP_GAP,
        left: rect.left + rect.width / 2,
        transform: "translateX(-50%)",
      };
    case "top":
      return {
        top: rect.top - TOOLTIP_GAP,
        left: rect.left + rect.width / 2,
        transform: "translate(-50%, -100%)",
      };
    case "right":
      return {
        top: rect.top + rect.height / 2,
        left: rect.right + TOOLTIP_GAP,
        transform: "translateY(-50%)",
      };
    case "left":
      return {
        top: rect.top + rect.height / 2,
        left: rect.left - TOOLTIP_GAP,
        transform: "translate(-100%, -50%)",
      };
  }
}

export function TutorialOverlay() {
  const completedSteps = useTutorialStore((s) => s.completedSteps);
  const dismissed = useTutorialStore((s) => s.dismissed);
  const completeStep = useTutorialStore((s) => s.completeStep);
  const skipTutorial = useTutorialStore((s) => s.skipTutorial);

  const totalClicks = useGameStore((s) => s.totalClicks);
  const evolutionStage = useGameStore((s) => s.evolutionStage);
  const trainingData = useGameStore((s) => s.trainingData);
  const upgradeOwned = useGameStore((s) => s.upgradeOwned);

  const prefersReduced = useReducedMotion();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);

  const activeStep = getActiveStep({ completedSteps, dismissed });

  // Auto-advance step 0 → 1: player made their first click
  useEffect(() => {
    if (activeStep === TUTORIAL_STEP.FEED_BUTTON && totalClicks >= 1) {
      completeStep(TUTORIAL_STEP.FEED_BUTTON);
    }
  }, [activeStep, totalClicks, completeStep]);

  // Auto-advance step 1 → 2: player can afford at least one upgrade
  useEffect(() => {
    if (activeStep !== TUTORIAL_STEP.TD_COUNTER) return;
    const canAfford = UPGRADES.some((u) => {
      const cost = getUpgradeCost(u, upgradeOwned[u.id] ?? 0);
      return trainingData.gte(cost);
    });
    if (canAfford) {
      completeStep(TUTORIAL_STEP.TD_COUNTER);
    }
  }, [activeStep, trainingData, upgradeOwned, completeStep]);

  // Auto-advance step 2 → 3: GLORP first evolves
  useEffect(() => {
    if (activeStep === TUTORIAL_STEP.UPGRADES_PANEL && evolutionStage >= 1) {
      completeStep(TUTORIAL_STEP.UPGRADES_PANEL);
    }
  }, [activeStep, evolutionStage, completeStep]);

  // Track the bounding rect of the active tutorial target element.
  // Retries with rAF in case the element isn't mounted yet on first render.
  useEffect(() => {
    if (activeStep === null) {
      setTargetRect(null);
      return;
    }

    const config = STEP_CONFIG[activeStep];

    const updateRect = () => {
      const el = document.getElementById(config.targetId);
      setTargetRect(el ? el.getBoundingClientRect() : null);
    };

    let retries = 0;
    const tryUpdate = () => {
      const el = document.getElementById(config.targetId);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else if (retries < 20) {
        retries++;
        rafRef.current = requestAnimationFrame(tryUpdate);
      }
    };

    rafRef.current = requestAnimationFrame(tryUpdate);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [activeStep]);

  if (activeStep === null || targetRect === null) return null;

  const config = STEP_CONFIG[activeStep];
  const pos = computeTooltipPosition(targetRect, config.placement);

  return (
    <Portal>
      {/* Pulsing highlight ring drawn around the target element */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: targetRect.top - 4,
          left: targetRect.left - 4,
          width: targetRect.width + 8,
          height: targetRect.height + 8,
          borderRadius: 6,
          border: "2px solid rgba(64, 192, 87, 0.9)",
          pointerEvents: "none",
          zIndex: 9000,
          animation: prefersReduced
            ? undefined
            : "tutorial-pulse 1.5s ease-in-out infinite",
        }}
      />

      {/* Tooltip card */}
      <Box
        role="status"
        aria-live="polite"
        style={{
          position: "fixed",
          top: pos.top,
          left: pos.left,
          transform: pos.transform,
          zIndex: 9001,
          background: "var(--mantine-color-dark-6)",
          border: "1px solid var(--mantine-color-green-7)",
          borderRadius: 6,
          padding: "10px 14px",
          maxWidth: 280,
          boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
        }}
      >
        <Text size="xs" c="green" fw={700} mb={6} ff="monospace">
          ▶ TUTORIAL
        </Text>
        <Text size="sm" c="white" ff="monospace" mb={10}>
          {config.message}
        </Text>
        <Group justify="space-between" gap="xs" wrap="nowrap">
          <Button
            size="compact-xs"
            variant="subtle"
            color="gray"
            ff="monospace"
            onClick={skipTutorial}
          >
            Skip tutorial
          </Button>
          <Button
            size="compact-xs"
            variant="subtle"
            color="green"
            ff="monospace"
            onClick={() => completeStep(activeStep)}
            aria-label="Dismiss this tutorial step"
          >
            ✕
          </Button>
        </Group>
      </Box>
    </Portal>
  );
}
