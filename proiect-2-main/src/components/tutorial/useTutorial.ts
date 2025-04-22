import { useState, useEffect } from "react";
import { TutorialStep } from "./TutorialOverlay";

interface UseTutorialProps {
  tutorialId: string;
  steps: TutorialStep[];
  autoStart?: boolean;
  delay?: number;
}

export const useTutorial = ({
  tutorialId,
  steps,
  autoStart = false,
  delay = 1000,
}: UseTutorialProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [hasSkipped, setHasSkipped] = useState(false);

  // Check if the tutorial has been completed or skipped before
  useEffect(() => {
    const completed =
      localStorage.getItem(`tutorial-${tutorialId}-completed`) === "true";
    const skipped =
      localStorage.getItem(`tutorial-${tutorialId}-skipped`) === "true";

    setHasCompleted(completed);
    setHasSkipped(skipped);
  }, [tutorialId]);

  // Auto-start the tutorial if enabled and not completed/skipped
  useEffect(() => {
    if (autoStart && !hasCompleted && !hasSkipped) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [autoStart, delay, hasCompleted, hasSkipped]);

  const startTutorial = () => {
    setIsOpen(true);
  };

  const closeTutorial = () => {
    setIsOpen(false);
  };

  const completeTutorial = () => {
    setHasCompleted(true);
  };

  const resetTutorial = () => {
    localStorage.removeItem(`tutorial-${tutorialId}-completed`);
    localStorage.removeItem(`tutorial-${tutorialId}-skipped`);
    localStorage.removeItem(`tutorial-${tutorialId}-step`);
    setHasCompleted(false);
    setHasSkipped(false);
  };

  return {
    isOpen,
    hasCompleted,
    hasSkipped,
    startTutorial,
    closeTutorial,
    completeTutorial,
    resetTutorial,
    steps,
  };
};
