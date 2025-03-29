import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CallToActionProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  backgroundGradient?: string;
}

const CallToAction = ({
  title = "Ready to Streamline Your Inventory Management?",
  description = "Get started today and transform how you track, manage, and optimize your project materials.",
  primaryButtonText = "Get Started",
  secondaryButtonText = "View Dashboard",
  onPrimaryClick = () => {},
  onSecondaryClick = () => {},
  backgroundGradient = "from-primary to-secondary",
}: CallToActionProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const buttonHoverVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  const floatingParticles = Array.from({ length: 8 }).map((_, i) => (
    <motion.div
      key={i}
      className="absolute rounded-full bg-white opacity-20"
      style={{
        width: Math.random() * 40 + 10,
        height: Math.random() * 40 + 10,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
      }}
      animate={{
        y: [0, -30, 0],
        x: [0, Math.random() * 20 - 10, 0],
        opacity: [0.1, 0.3, 0.1],
      }}
      transition={{
        duration: Math.random() * 5 + 5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: Math.random() * 2,
      }}
    />
  ));

  return (
    <motion.div
      className={`w-full bg-gradient-to-r ${backgroundGradient} py-16 px-6 rounded-xl shadow-lg overflow-hidden relative`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      {/* Animated background elements */}
      {floatingParticles}

      <motion.div
        className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full"
        animate={{
          x: [0, 10, 0],
          y: [0, 15, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 left-20 w-40 h-40 bg-white opacity-5 rounded-full"
        animate={{
          x: [0, -10, 0],
          y: [0, -15, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          className="inline-block mb-6"
          animate={{ rotate: [0, 5, 0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </motion.div>

        <motion.h2
          className="text-3xl md:text-4xl font-bold text-white mb-4"
          variants={itemVariants}
        >
          {title}
        </motion.h2>

        <motion.p
          className="text-lg text-white/90 mb-8 max-w-2xl mx-auto"
          variants={itemVariants}
        >
          {description}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          variants={itemVariants}
        >
          <motion.div
            variants={buttonHoverVariants}
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 hover:text-primary/90 font-semibold text-base px-8 py-6 h-auto"
              onClick={onPrimaryClick}
            >
              {primaryButtonText}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          <motion.div
            variants={buttonHoverVariants}
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/20 hover:text-white font-semibold text-base px-8 py-6 h-auto"
              onClick={onSecondaryClick}
            >
              {secondaryButtonText}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CallToAction;
