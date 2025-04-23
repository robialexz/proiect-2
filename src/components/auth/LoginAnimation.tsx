import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";

interface LoginAnimationProps {
  onComplete: () => void;
}

const LoginAnimation: React.FC<LoginAnimationProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { role } = useRole();
  const [showAnimation, setShowAnimation] = useState(true);

  // Verificăm dacă este prima logare în această sesiune
  useEffect(() => {
    const isNewLogin = sessionStorage.getItem("newLoginDetected") === "true";
    
    // Dacă nu este o nouă logare, nu afișăm animația
    if (!isNewLogin) {
      onComplete();
      return;
    }

    // Resetăm flag-ul de nouă logare
    sessionStorage.removeItem("newLoginDetected");
    
    // Afișăm animația pentru 3 secunde
    const timer = setTimeout(() => {
      setShowAnimation(false);
      setTimeout(onComplete, 500); // Așteptăm finalizarea animației de ieșire
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Obținem mesajul de bun venit în funcție de rol
  const getWelcomeMessage = () => {
    if (!user) return t("login.welcome", "Bun venit!");

    if (role === "admin") {
      return t("login.welcomeAdmin", "Bun venit, Administrator!");
    } else if (role === "manager") {
      return t("login.welcomeManager", "Bun venit, Manager!");
    } else {
      return t("login.welcomeUser", `Bun venit, ${user.email}!`);
    }
  };

  return (
    <AnimatePresence>
      {showAnimation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 20,
                delay: 0.2
              }}
              className="mb-8"
            >
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M12 2a10 10 0 0 0-9.95 9h11.64L9.74 7.05a1 1 0 0 1 1.41-1.41l5.66 5.65a1 1 0 0 1 0 1.42l-5.66 5.65a1 1 0 0 1-1.41 0 1 1 0 0 1 0-1.41L13.69 13H2.05A10 10 0 1 0 12 2z" />
                </svg>
              </div>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold text-white mb-4"
            >
              {getWelcomeMessage()}
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-slate-300"
            >
              {t("login.loadingApplication", "Se încarcă aplicația...")}
            </motion.p>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ 
                delay: 0.8, 
                duration: 1.5,
                ease: "easeInOut"
              }}
              className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 mt-8 w-64 mx-auto rounded-full"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginAnimation;
