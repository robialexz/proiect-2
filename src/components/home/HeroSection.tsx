import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart2, Database, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

const HeroSection = ({
  title = "Streamline Your Inventory Management",
  subtitle = "A powerful dashboard for tracking, managing, and optimizing your project materials with real-time insights and seamless collaboration.",
  primaryCta = "Get Started",
  secondaryCta = "Learn More",
  onPrimaryClick = () => {},
  onSecondaryClick = () => {},
}: HeroSectionProps) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="w-full h-[500px] bg-gradient-to-r from-purple-900 to-indigo-800 text-white flex items-center justify-center px-4 md:px-8 lg:px-12 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-secondary/20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-10 -left-20 w-80 h-80 rounded-full bg-primary/20"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {/* Additional animated elements */}
        <motion.div
          className="absolute top-40 left-1/4 w-20 h-20 rounded-full bg-blue-500/20"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.3, 0.2],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute bottom-40 right-1/4 w-32 h-32 rounded-full bg-green-500/10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        {/* Floating particles */}
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              width: Math.random() * 6 + 2,
              height: Math.random() * 6 + 2,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        className="container mx-auto flex flex-col lg:flex-row items-center justify-between z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Text content */}
        <div className="lg:w-1/2 text-center lg:text-left mb-10 lg:mb-0">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            variants={itemVariants}
          >
            {title}
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0"
            variants={itemVariants}
          >
            {subtitle}
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            variants={itemVariants}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-medium px-8"
                onClick={onPrimaryClick}
              >
                {primaryCta} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={onSecondaryClick}
              >
                {secondaryCta}
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Illustration/Animation */}
        <motion.div
          className="lg:w-1/2 flex justify-center"
          variants={itemVariants}
        >
          <div className="relative w-full max-w-md">
            {/* Dashboard illustration */}
            <motion.div
              className="bg-slate-800/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl p-6 relative z-10"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: [0, -10, 0], opacity: 1 }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                opacity: { duration: 1, ease: "easeIn" },
              }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 0 20px rgba(139, 92, 246, 0.5)",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-sm text-slate-400">
                  Inventory Dashboard
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className={cn(
                    "p-4 rounded-lg flex items-center",
                    "bg-secondary/20 border border-secondary/30",
                  )}
                >
                  <Database className="h-8 w-8 text-secondary mr-3" />
                  <div>
                    <div className="text-sm text-slate-300">Total Items</div>
                    <div className="text-xl font-bold">1,248</div>
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className={cn(
                    "p-4 rounded-lg flex items-center",
                    "bg-primary/20 border border-primary/30",
                  )}
                >
                  <BarChart2 className="h-8 w-8 text-primary mr-3" />
                  <div>
                    <div className="text-sm text-slate-300">Projects</div>
                    <div className="text-xl font-bold">24</div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                className="bg-slate-700/50 rounded-lg p-4 mb-6"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="text-sm font-medium">Recent Activity</div>
                  <div className="text-xs text-slate-400">View All</div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <motion.div
                      key={item}
                      className="flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + item * 0.2 }}
                      whileHover={{ x: 5 }}
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center mr-3">
                        <Users className="h-4 w-4 text-slate-300" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">Material #{item} updated</div>
                        <div className="text-xs text-slate-400">
                          2 hours ago
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Decorative elements */}
            <motion.div
              className="absolute -bottom-6 -right-6 w-64 h-64 bg-gradient-to-r from-secondary to-primary rounded-full blur-3xl opacity-30 z-0"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
