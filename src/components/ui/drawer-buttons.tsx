import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ChevronUp,
  ChevronDown,
  Settings,
  HelpCircle,
  Bell,
  BarChart2,
  User,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export interface DrawerButton {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  tooltip: string;
}

interface DrawerButtonsProps {
  buttons?: DrawerButton[];
}

const DrawerButtons: React.FC<DrawerButtonsProps> = ({ buttons = [] }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Butoane implicite dacă nu sunt furnizate
  const defaultButtons: DrawerButton[] = [
    {
      icon: <Settings size={20} />,
      label: t("drawer.settings", "Setări"),
      onClick: () => navigate("/settings"),
      tooltip: t("drawer.settingsTooltip", "Deschide setările aplicației"),
    },
    {
      icon: <HelpCircle size={20} />,
      label: t("drawer.help", "Ajutor"),
      onClick: () => navigate("/tutorial"),
      tooltip: t("drawer.helpTooltip", "Deschide tutorialul"),
    },
    {
      icon: <Bell size={20} />,
      label: t("drawer.notifications", "Notificări"),
      onClick: () => navigate("/notifications"),
      tooltip: t("drawer.notificationsTooltip", "Vezi notificările"),
    },
    {
      icon: <BarChart2 size={20} />,
      label: t("drawer.analytics", "Analiză"),
      onClick: () => navigate("/analytics"),
      tooltip: t("drawer.analyticsTooltip", "Vezi statisticile"),
    },
    {
      icon: <User size={20} />,
      label: t("drawer.profile", "Profil"),
      onClick: () => navigate("/profile"),
      tooltip: t("drawer.profileTooltip", "Deschide profilul tău"),
    },
  ];

  // Folosim butoanele furnizate sau cele implicite
  const buttonsToShow = buttons.length > 0 ? buttons : defaultButtons;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-2 flex flex-col gap-2"
          >
            {buttonsToShow.map((button, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0,
                        transition: { delay: index * 0.05 } 
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={button.onClick}
                        className="rounded-full h-12 w-12 shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                        size="icon"
                      >
                        {button.icon}
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>{button.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-full h-14 w-14 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              size="icon"
            >
              {isOpen ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>
              {isOpen
                ? t("drawer.close", "Închide sertarul")
                : t("drawer.open", "Deschide sertarul")}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default DrawerButtons;
