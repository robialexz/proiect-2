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

  // Variante pentru animații - simplificate pentru a reduce flickering
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1, // Redus pentru a fi mai rapid
        duration: 0.2, // Durata redusă
      },
    },
    exit: {
      opacity: 0,
      transition: {
        when: "afterChildren",
        staggerChildren: 0.05, // Redus pentru a fi mai rapid
        staggerDirection: -1,
        duration: 0.2, // Durata redusă
      },
    },
  };

  const textVariants = {
    hidden: { y: 20, opacity: 0 }, // Redus de la 50px la 20px
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "tween", // Înlocuit spring cu tween pentru mai puțină oscilație
        duration: 0.2, // Durata redusă
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0, // Fără mișcare la ieșire pentru a evita flickering
      transition: {
        duration: 0.1, // Durata redusă
      },
    },
  };

  const nameVariants = {
    hidden: { scale: 0.95, opacity: 0 }, // Scalare mai subtilă
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "tween", // Înlocuit spring cu tween
        duration: 0.2, // Durata redusă
        ease: "easeOut",
        delay: 0.1, // Întârziere redusă
      },
    },
    exit: {
      opacity: 0, // Fără scalare la ieșire pentru a evita flickering
      transition: {
        duration: 0.1, // Durata redusă
      },
    },
  };

  const roleVariants = {
    hidden: { opacity: 0 }, // Fără mișcare pe axa X
    visible: {
      opacity: 1,
      transition: {
        type: "tween", // Înlocuit spring cu tween
        duration: 0.2, // Durata redusă
        ease: "easeOut",
        delay: 0.2, // Întârziere redusă
      },
    },
    exit: {
      opacity: 0, // Fără mișcare la ieșire
      transition: {
        duration: 0.1, // Durata redusă
      },
    },
  };

  // Elemente decorative pentru fundal - reduse pentru performanță
  const decorElements = Array.from({ length: 8 }, (_, i) => ({ // Redus de la 20 la 8 elemente
    id: i,
    size: Math.random() * 80 + 40, // Dimensiuni mai mici
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 0.3, // Întârziere mai mică
    duration: Math.random() * 3 + 3, // Durata redusă
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
                opacity: [0, 0.2, 0], // Opacitate redusă
                scale: [0, 1, 0.9], // Scalare mai subtilă
                // Fără mișcare pe axele X și Y pentru a reduce complexitatea
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
