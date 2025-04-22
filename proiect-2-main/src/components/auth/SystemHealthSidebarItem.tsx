import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Activity } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SystemHealthSidebarItemProps {
  collapsed: boolean;
}

/**
 * Componentă pentru elementul de stare a sistemului din sidebar
 * @param collapsed Dacă sidebar-ul este colpasat
 */
const SystemHealthSidebarItem: React.FC<SystemHealthSidebarItemProps> = ({
  collapsed,
}) => {
  const { userRole } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();
  const [systemStatus, setSystemStatus] = useState<"healthy" | "warning" | "error">("healthy");

  // Verificăm dacă utilizatorul are rol de admin
  const isAdmin = userRole === "admin";

  // Dacă utilizatorul nu este admin, nu afișăm elementul
  if (!isAdmin) {
    return null;
  }

  // Verificăm dacă elementul este activ
  const isActive = location.pathname === "/system-health";

  // Simulăm verificarea stării sistemului
  useEffect(() => {
    // În implementarea reală, aici ar trebui să verificăm starea sistemului
    // Pentru moment, folosim o stare aleatoare
    const statuses: ("healthy" | "warning" | "error")[] = ["healthy", "warning", "error"];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    setSystemStatus(randomStatus);
  }, []);

  // Obținem culoarea în funcție de starea sistemului
  const getStatusColor = () => {
    switch (systemStatus) {
      case "healthy":
        return "bg-green-500";
      case "warning":
        return "bg-amber-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-slate-500";
    }
  };

  // Dacă sidebar-ul este colpasat, afișăm doar iconița cu tooltip
  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/system-health"
              className={cn(
                "flex items-center justify-center w-full p-2 text-slate-400 hover:text-white rounded-md",
                isActive && "bg-slate-800 text-white"
              )}
            >
              <span className="relative">
                <Activity size={20} />
                <span
                  className={cn(
                    "absolute -top-1 -right-1 w-2 h-2 rounded-full",
                    getStatusColor()
                  )}
                ></span>
              </span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{t("sidebar.systemHealth", "Stare Sistem")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Dacă sidebar-ul este expandat, afișăm elementul complet
  return (
    <Link
      to="/system-health"
      className={cn(
        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
        isActive
          ? "bg-slate-800 text-white"
          : "text-slate-400 hover:text-white hover:bg-slate-800"
      )}
    >
      <span className="relative">
        <Activity size={20} />
        <span
          className={cn(
            "absolute -top-1 -right-1 w-2 h-2 rounded-full",
            getStatusColor()
          )}
        ></span>
      </span>
      <span className="ml-3 flex-1">{t("sidebar.systemHealth", "Stare Sistem")}</span>
    </Link>
  );
};

export default SystemHealthSidebarItem;
