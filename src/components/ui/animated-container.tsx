import React, { ReactNode } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  animation?: "fade" | "slide" | "scale" | "slideUp" | "slideDown" | "none";
  once?: boolean;
  id?: string;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  className,
  delay = 0,
  duration = 0.3,
  animation = "fade",
  once = false,
  id,
}) => {
  // Definim variantele de animație
  const variants: Record<string, Variants> = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    slide: {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { opacity: 1, scale: 1 },
    },
    slideUp: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    },
    slideDown: {
      hidden: { opacity: 0, y: -20 },
      visible: { opacity: 1, y: 0 },
    },
    none: {
      hidden: {},
      visible: {},
    },
  };

  // Selectăm varianta de animație
  const selectedVariant = variants[animation];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        id={id}
        className={cn(className)}
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={selectedVariant}
        transition={{
          duration,
          delay,
          ease: "easeOut",
        }}
        viewport={{ once }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export const AnimatedList: React.FC<
  AnimatedContainerProps & { staggerChildren?: number }
> = ({
  children,
  className,
  delay = 0,
  duration = 0.3,
  animation = "fade",
  once = false,
  staggerChildren = 0.1,
  id,
}) => {
  // Definim variantele de animație pentru container
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren: delay,
      },
    },
  };

  // Definim variantele de animație pentru elemente
  const itemVariants: Record<string, Variants> = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration } },
    },
    slide: {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0, transition: { duration } },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { opacity: 1, scale: 1, transition: { duration } },
    },
    slideUp: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration } },
    },
    slideDown: {
      hidden: { opacity: 0, y: -20 },
      visible: { opacity: 1, y: 0, transition: { duration } },
    },
    none: {
      hidden: {},
      visible: {},
    },
  };

  // Selectăm varianta de animație
  const selectedVariant = itemVariants[animation];

  // Verificăm dacă children este un array
  const childrenArray = React.Children.toArray(children);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        id={id}
        className={cn(className)}
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={containerVariants}
        viewport={{ once }}
      >
        {childrenArray.map((child, index) => (
          <motion.div key={index} variants={selectedVariant}>
            {child}
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export const AnimatedText: React.FC<
  AnimatedContainerProps & { text: string; tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" }
> = ({
  text,
  className,
  delay = 0,
  duration = 0.3,
  animation = "fade",
  once = false,
  tag = "p",
  id,
}) => {
  // Definim variantele de animație
  const variants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: delay,
      },
    },
  };

  // Definim variantele de animație pentru caractere
  const charVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: duration * 0.5 } },
  };

  // Creăm un array de caractere
  const chars = text.split("");

  // Selectăm elementul HTML corect
  const Tag = tag as keyof JSX.IntrinsicElements;

  return (
    <AnimatePresence mode="wait">
      <Tag className={cn(className)} id={id}>
        <motion.span
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={variants}
          viewport={{ once }}
          style={{ display: "inline-block" }}
        >
          {chars.map((char, index) => (
            <motion.span
              key={index}
              variants={charVariants}
              style={{ display: "inline-block", whiteSpace: char === " " ? "pre" : "normal" }}
            >
              {char}
            </motion.span>
          ))}
        </motion.span>
      </Tag>
    </AnimatePresence>
  );
};

export const PageTransition: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
