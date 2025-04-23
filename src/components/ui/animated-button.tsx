import React from "react";
import { motion } from "framer-motion";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AnimatedButtonProps extends ButtonProps {
  animationType?: "pulse" | "bounce" | "scale" | "glow" | "slide" | "ripple";
  animationIntensity?: "subtle" | "medium" | "strong";
  children: React.ReactNode;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  animationType = "scale",
  animationIntensity = "medium",
  className,
  children,
  ...props
}) => {
  // Configurări pentru diferite tipuri de animații
  const getAnimationProps = () => {
    const intensityValues = {
      subtle: {
        scale: [1, 1.02, 1],
        y: [0, -2, 0],
        glow: "0px 0px 4px",
      },
      medium: {
        scale: [1, 1.05, 1],
        y: [0, -4, 0],
        glow: "0px 0px 8px",
      },
      strong: {
        scale: [1, 1.1, 1],
        y: [0, -6, 0],
        glow: "0px 0px 15px",
      },
    };

    const intensity = intensityValues[animationIntensity];

    switch (animationType) {
      case "pulse":
        return {
          whileHover: { 
            scale: [1, intensity.scale[1], 1, intensity.scale[1], 1],
            transition: { 
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop" as const,
            }
          },
          whileTap: { scale: 0.95 },
        };
      case "bounce":
        return {
          whileHover: { 
            y: [0, intensity.y[1], 0],
            transition: { 
              duration: 0.6,
              repeat: Infinity,
              repeatType: "loop" as const,
            }
          },
          whileTap: { scale: 0.95 },
        };
      case "glow":
        return {
          whileHover: { 
            boxShadow: `${intensity.glow} rgba(66, 153, 225, 0.6)`,
            transition: { duration: 0.2 }
          },
          whileTap: { 
            boxShadow: `${intensity.glow} rgba(66, 153, 225, 0.8)`,
            scale: 0.98,
          },
        };
      case "slide":
        return {
          whileHover: { 
            x: [0, 5, 0],
            transition: { 
              duration: 0.5,
              repeat: Infinity,
              repeatType: "loop" as const,
            }
          },
          whileTap: { scale: 0.95 },
        };
      case "ripple":
        return {
          whileHover: { 
            scale: 1.05,
            transition: { duration: 0.2 }
          },
          whileTap: { 
            scale: 0.95,
            transition: { duration: 0.1 }
          },
          // Ripple effect is handled in the component with pseudo-elements
          className: cn(className, "relative overflow-hidden"),
        };
      case "scale":
      default:
        return {
          whileHover: { 
            scale: intensity.scale[1],
            transition: { duration: 0.2 }
          },
          whileTap: { scale: 0.95 },
        };
    }
  };

  const animationProps = getAnimationProps();

  return (
    <motion.div
      {...animationProps}
      className={cn(
        "inline-block",
        animationType === "ripple" && "relative overflow-hidden",
        animationProps.className
      )}
    >
      <Button className={className} {...props}>
        {children}
      </Button>
      
      {/* Ripple effect overlay */}
      {animationType === "ripple" && (
        <span className="absolute inset-0 pointer-events-none">
          <span className="absolute inset-0 rounded-md bg-white opacity-0 group-hover:animate-ripple" />
        </span>
      )}
    </motion.div>
  );
};

export default AnimatedButton;
