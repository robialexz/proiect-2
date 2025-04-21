import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { useTranslation } from "react-i18next";

interface WelcomeOverlayProps {
  onComplete?: () => void;
}

const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const { userRole, getWelcomeMessage } = useRole();
  const [show, setShow] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState("");

  useEffect(() => {
    // Obținem mesajul de bun venit personalizat
    const message = getWelcomeMessage();
    setWelcomeMessage(message);
    // Removed console statement

    // Ascundem overlay-ul după 5 secunde pentru a fi mai vizibil
    const timer = setTimeout(() => {
      setShow(false);
      if (onComplete) {
        onComplete();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [getWelcomeMessage, onComplete]);

  // Obținem ora curentă pentru a personaliza mesajul
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("welcome.morning", "Bună dimineața");
    if (hour < 18) return t("welcome.afternoon", "Bună ziua");
    return t("welcome.evening", "Bună seara");
  };

  // Variante pentru animații
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        when: "afterChildren",
        staggerChildren: 0.1,
        staggerDirection: -1,
        duration: 0.5,
      },
    },
  };

  const textVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
    exit: {
      y: -50,
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  const nameVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10,
        delay: 0.3,
      },
    },
    exit: {
      scale: 1.2,
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const roleVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        delay: 0.5,
      },
    },
    exit: {
      x: 50,
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Elemente decorative pentru fundal
  const decorElements = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 100 + 50,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: Math.random() * 5 + 5,
  }));

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Elemente decorative animate */}
          {decorElements.map((elem) => (
            <motion.div
              key={elem.id}
              className="absolute rounded-full bg-primary/10"
              style={{
                width: elem.size,
                height: elem.size,
                left: `${elem.x}%`,
                top: `${elem.y}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.3, 0],
                scale: [0, 1, 0.8],
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
              }}
              transition={{
                duration: elem.duration,
                delay: elem.delay,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}

          <div className="text-center px-4 z-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl flex flex-col items-center justify-center">
            <motion.div
              className="text-2xl md:text-3xl text-slate-300 mb-2"
              variants={textVariants}
            >
              {getTimeBasedGreeting()}
            </motion.div>

            <motion.div
              className="text-4xl md:text-6xl font-bold text-white mb-4"
              variants={nameVariants}
            >
              {userProfile?.displayName || "Utilizator"}
            </motion.div>

            <motion.div
              className="text-xl md:text-2xl text-primary"
              variants={roleVariants}
            >
              {welcomeMessage}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeOverlay;
