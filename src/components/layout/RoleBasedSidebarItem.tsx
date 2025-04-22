import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { LucideIcon } from "lucide-react";

interface RoleBasedSidebarItemProps {
  path: string;
  icon: LucideIcon;
  label: string;
  translationKey: string;
  allowedRoles?: string[];
  requiredPermissions?: string[];
  collapsed?: boolean;
  iconExtra?: React.ReactNode;
}

/**
 * Componentă pentru elementele din sidebar care sunt afișate în funcție de rol și permisiuni
 * @param path Calea către care va naviga elementul
 * @param icon Iconița elementului
 * @param label Eticheta elementului
 * @param translationKey Cheia de traducere pentru etichetă
 * @param allowedRoles Rolurile care pot vedea acest element
 * @param requiredPermissions Permisiunile necesare pentru a vedea acest element
 * @param collapsed Dacă sidebar-ul este collapsat
 */
const RoleBasedSidebarItem: React.FC<RoleBasedSidebarItemProps> = ({
  path,
  icon: Icon,
  label,
  translationKey,
  allowedRoles = [],
  requiredPermissions = [],
  collapsed = false,
  iconExtra,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole, permissions, hasPermission } = useAuth();

  // Verificăm dacă utilizatorul are unul dintre rolurile permise
  const hasAllowedRole =
    allowedRoles.length === 0 || // Dacă nu sunt specificate roluri, toți utilizatorii autentificați au acces
    (userRole && allowedRoles.includes(userRole));

  // Verificăm dacă utilizatorul are toate permisiunile necesare
  const hasRequiredPermissions =
    requiredPermissions.length === 0 || // Dacă nu sunt specificate permisiuni, toți utilizatorii autentificați au acces
    requiredPermissions.every((permission) => hasPermission(permission as any));

  // Dacă utilizatorul nu are rolul sau permisiunile necesare, nu afișăm elementul
  if (!hasAllowedRole || !hasRequiredPermissions) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full text-slate-400 hover:text-white hover:bg-slate-800 justify-start",
              collapsed && "justify-center",
              location.pathname === path && "bg-slate-800 text-white"
            )}
            onClick={() => navigate(path)}
          >
            <Icon size={20} />
            {!collapsed && (
              <span className="ml-3 flex items-center">
                {t(translationKey, label)}
                {iconExtra}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        {collapsed && (
          <TooltipContent side="right">
            <p>{t(translationKey, label)}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default RoleBasedSidebarItem;
