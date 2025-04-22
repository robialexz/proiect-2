import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, ChevronRight, ChevronLeft, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface TutorialStep {
  target: string; // CSS selector for the target element
  title: string;
  content: string;
  position?: "top" | "right" | "bottom" | "left";
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  tutorialId: string; // Unique identifier for this tutorial
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  steps,
  isOpen,
  onClose,
  onComplete,
  tutorialId,
}) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<DOMRect | null>(null);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Update window size on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Find and highlight the target element for the current step
  useEffect(() => {
    if (!isOpen || !steps[currentStep]) return;

    const target = document.querySelector(steps[currentStep].target);
    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetElement(rect);

      // Add a highlight class to the target element
      target.classList.add("tutorial-highlight");
      return () => target.classList.remove("tutorial-highlight");
    } else {
      setTargetElement(null);
    }
  }, [currentStep, isOpen, steps]);

  // Save progress to localStorage
  useEffect(() => {
    if (!isOpen) return;

    localStorage.setItem(`tutorial-${tutorialId}-step`, currentStep.toString());
  }, [currentStep, isOpen, tutorialId]);

  // Load saved progress
  useEffect(() => {
    if (!isOpen) return;

    const savedStep = localStorage.getItem(`tutorial-${tutorialId}-step`);
    if (savedStep) {
      const step = parseInt(savedStep, 10);
      if (!isNaN(step) && step < steps.length) {
        setCurrentStep(step);
      }
    }
  }, [isOpen, steps.length, tutorialId]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(`tutorial-${tutorialId}-completed`, "true");
    localStorage.removeItem(`tutorial-${tutorialId}-step`);
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem(`tutorial-${tutorialId}-skipped`, "true");
    onClose();
  };

  if (!isOpen) return null;

  // Calculate tooltip position based on target element
  const getTooltipPosition = () => {
    if (!targetElement) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const step = steps[currentStep];
    const position = step.position || "bottom";
    const padding = 20; // Space between target and tooltip

    switch (position) {
      case "top":
        return {
          bottom: `${windowSize.height - targetElement.top + padding}px`,
          left: `${targetElement.left + targetElement.width / 2}px`,
          transform: "translateX(-50%)",
        };
      case "right":
        return {
          top: `${targetElement.top + targetElement.height / 2}px`,
          left: `${targetElement.right + padding}px`,
          transform: "translateY(-50%)",
        };
      case "bottom":
        return {
          top: `${targetElement.bottom + padding}px`,
          left: `${targetElement.left + targetElement.width / 2}px`,
          transform: "translateX(-50%)",
        };
      case "left":
        return {
          top: `${targetElement.top + targetElement.height / 2}px`,
          right: `${windowSize.width - targetElement.left + padding}px`,
          transform: "translateY(-50%)",
        };
      default:
        return {
          top: `${targetElement.bottom + padding}px`,
          left: `${targetElement.left + targetElement.width / 2}px`,
          transform: "translateX(-50%)",
        };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black opacity-70"
            onClick={handleSkip}
          />

          {/* Target element highlight */}
          {targetElement && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute border-2 border-primary rounded-md z-10"
              style={{
                top: targetElement.top - 4 + "px",
                left: targetElement.left - 4 + "px",
                width: targetElement.width + 8 + "px",
                height: targetElement.height + 8 + "px",
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.7)",
              }}
            />
          )}

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-20"
            style={getTooltipPosition()}
          >
            <Card className="w-80 bg-slate-800 border-slate-700 shadow-lg">
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2 text-primary" />
                    {steps[currentStep]?.title}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-slate-400 hover:text-white"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-slate-300 mb-4">
                  {steps[currentStep]?.content}
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevious}
                      disabled={currentStep === 0}
                      className="text-xs h-8 px-2 border-slate-700"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      {t("tutorial.previous", "Previous")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSkip}
                      className="text-xs h-8 px-2 border-slate-700"
                    >
                      {t("tutorial.skip", "Skip")}
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="text-xs h-8 px-3 bg-primary hover:bg-primary/90"
                  >
                    {currentStep < steps.length - 1
                      ? t("tutorial.next", "Next")
                      : t("tutorial.finish", "Finish")}
                    {currentStep < steps.length - 1 && (
                      <ChevronRight className="h-4 w-4 ml-1" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="px-4 py-2 border-t border-slate-700 bg-slate-800/50">
                <div className="flex justify-center">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full mx-1 ${index === currentStep ? "bg-primary" : "bg-slate-600"}`}
                    />
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TutorialOverlay;
