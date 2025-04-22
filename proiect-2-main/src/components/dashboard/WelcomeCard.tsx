import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface WelcomeCardProps {
  userName: string;
  className?: string;
}

const WelcomeCard = ({ userName, className = "" }: WelcomeCardProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      className={`${className} relative overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl"></div>

      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-primary/20">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">
            {t("Welcome to InventoryPro")}
          </h2>
        </div>

        <p className="text-slate-300 mb-6">
          {t("Hello")} {userName.split("@")[0] || t("User")},{" "}
          {t(
            "discover how our platform can help you manage your inventory more efficiently.",
          )}
        </p>

        <div className="flex flex-wrap gap-3">
          <Button size="sm" className="gap-2">
            {t("Take a tour")}
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            {t("Watch tutorial")}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeCard;
