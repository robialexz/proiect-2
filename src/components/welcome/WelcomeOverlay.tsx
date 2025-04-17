import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Star, Sparkles } from 'lucide-react';

interface WelcomeOverlayProps {
  onComplete?: () => void;
}

const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const { userRole, getWelcomeMessage } = useRole();
  const [show, setShow] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    // Obținem mesajul de bun venit personalizat
    const message = getWelcomeMessage();
    setWelcomeMessage(message);
    console.log('Welcome message set:', message);

    // Ascundem overlay-ul după 5 secunde pentru a fi mai vizibil
    const timer = setTimeout(() => {
      setShow(false);
      if (onComplete) {
        onComplete();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [getWelcomeMessage, onComplete]);

  // Obținem ora curentă pentru a personaliza mesajul și iconul
  const getTimeBasedInfo = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        greeting: t('welcome.morning', 'Bună dimineața'),
        icon: <Sun className="h-8 w-8 text-amber-400" />
      };
    } else if (hour >= 12 && hour < 18) {
      return {
        greeting: t('welcome.afternoon', 'Bună ziua'),
        icon: <Sun className="h-8 w-8 text-yellow-400" />
      };
    } else if (hour >= 18 && hour < 22) {
      return {
        greeting: t('welcome.evening', 'Bună seara'),
        icon: <Moon className="h-8 w-8 text-blue-400" />
      };
    } else {
      return {
        greeting: t('welcome.night', 'Noapte bună'),
        icon: <Star className="h-8 w-8 text-indigo-400" />
      };
    }
  };

  // Variante pentru animații
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      transition: {
        when: "afterChildren",
        staggerChildren: 0.1,
        staggerDirection: -1,
        duration: 0.5
      }
    }
  };

  const textVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    },
    exit: {
      y: -50,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
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
        delay: 0.3
      }
    },
    exit: {
      scale: 1.2,
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
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
        delay: 0.5
      }
    },
    exit: {
      x: 50,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  // Elemente decorative pentru fundal
  const decorElements = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 100 + 50,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: Math.random() * 5 + 5
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
                repeatType: "reverse"
              }}
            />
          ))}

          <div className="text-center px-4 relative z-10 max-w-4xl mx-auto">
            {/* Card animat pentru mesajul de bun venit */}
            <motion.div
              className="bg-slate-800/70 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Salut și oră */}
              <motion.div
                className="flex items-center justify-center gap-3 mb-4"
                variants={textVariants}
              >
                {getTimeBasedInfo().icon}
                <span className="text-2xl md:text-3xl text-slate-200">
                  {getTimeBasedInfo().greeting}
                </span>
              </motion.div>

              {/* Numele utilizatorului */}
              <motion.div
                className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-6"
                variants={nameVariants}
              >
                {userProfile?.displayName || 'Utilizator'}
              </motion.div>

              {/* Rol și mesaj personalizat */}
              <motion.div
                className="flex items-center justify-center gap-2 mb-4"
                variants={roleVariants}
              >
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-lg font-medium text-slate-300">
                  {userRole ? `Rol: ${userRole}` : 'Bine ai venit!'}
                </span>
              </motion.div>

              {/* Mesaj personalizat */}
              <motion.div
                className="text-xl md:text-2xl text-slate-200 max-w-2xl mx-auto"
                variants={roleVariants}
              >
                {welcomeMessage}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeOverlay;
