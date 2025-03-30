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

  const floatingParticles = Array.from({ length: 15 }).map((_, i) => (
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
        scale: [1, Math.random() * 0.5 + 1, 1],
      }}
      transition={{
        duration: Math.random() * 5 + 5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: Math.random() * 2,
      }}
    />
  ));

  // Add geometric shapes for more visual interest
  const geometricShapes = Array.from({ length: 5 }).map((_, i) => {
    const shapes = [
      "clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", // diamond
      "clip-path: polygon(50% 0%, 100% 100%, 0% 100%)", // triangle
      "clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)", // hexagon
      "clip-path: polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%)", // shape
      "", // circle (default)
    ];

    return (
      <motion.div
        key={`shape-${i}`}
        className="absolute bg-white opacity-10"
        style={{
          width: Math.random() * 60 + 20,
          height: Math.random() * 60 + 20,
          borderRadius: shapes[i] ? "0" : "50%",
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          transform: `rotate(${Math.random() * 360}deg)`,
          style: shapes[i],
        }}
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.15, 0.05],
        }}
        transition={{
          duration: Math.random() * 10 + 10,
          repeat: Infinity,
          ease: "linear",
          delay: Math.random() * 5,
        }}
      />
    );
  });

  return (
    <motion.div
      className={`w-full bg-gradient-to-r ${backgroundGradient} py-16 px-6 rounded-xl shadow-lg overflow-hidden relative`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
      whileHover={{ boxShadow: "0 0 30px rgba(139, 92, 246, 0.3)" }}
    >
      {/* Animated background elements */}
      {floatingParticles}
      {geometricShapes}

      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 mix-blend-overlay"
        animate={{
          opacity: [0.3, 0.5, 0.3],
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

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
          <motion.div
            className="bg-white/20 backdrop-blur-sm p-3 rounded-full"
            whileHover={{
              scale: 1.1,
              backgroundColor: "rgba(255, 255, 255, 0.3)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.div
              animate={{ rotate: [0, 180, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-8 w-8 text-white" />
            </motion.div>
          </motion.div>
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
              className="bg-white text-primary hover:bg-white/90 hover:text-primary/90 font-semibold text-base px-8 py-6 h-auto relative overflow-hidden group"
              onClick={onPrimaryClick}
            >
              <motion.span
                className="absolute inset-0 bg-white/30 w-full"
                initial={{ x: "-100%", opacity: 0.5 }}
                whileHover={{ x: "100%", opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
              {primaryButtonText}
              <motion.div
                className="ml-2 h-5 w-5 inline-block"
                whileHover={{ x: [0, 5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <ArrowRight className="h-5 w-5" />
              </motion.div>
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
