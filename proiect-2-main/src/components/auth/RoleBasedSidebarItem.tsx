import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RoleBasedSidebarItemProps {
  path: string;
  icon: React.ElementType;
  label: string;
  translationKey: string;
  allowedRoles: string[];
  collapsed: boolean;
  iconExtra?: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

/**
 * Componentă pentru elementele din sidebar care sunt afișate în funcție de rol
 * @param path Calea către pagină
 * @param icon Iconița elementului
 * @param label Eticheta elementului
 * @param translationKey Cheia de traducere pentru etichetă
 * @param allowedRoles Rolurile care pot vedea acest element
 * @param collapsed Dacă sidebar-ul este colpasat
 * @param iconExtra Element suplimentar pentru iconiță
 * @param badge Badge pentru element
 * @param badgeColor Culoarea badge-ului
 */
const RoleBasedSidebarItem: React.FC<RoleBasedSidebarItemProps> = ({
  path,
  icon: Icon,
  label,
  translationKey,
  allowedRoles,
  collapsed,
  iconExtra,
  badge,
  badgeColor,
}) => {
  const { userRole } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  // Verificăm dacă utilizatorul are unul dintre rolurile permise
  const hasAllowedRole =
    allowedRoles.length === 0 ||
    (userRole && allowedRoles.includes(userRole.toLowerCase()));

  // Dacă utilizatorul nu are rolul necesar, nu afișăm elementul
  if (!hasAllowedRole) {
    return null;
  }

  // Verificăm dacă elementul este activ
  const isActive = location.pathname === path;

  // Dacă sidebar-ul este colpasat, afișăm doar iconița cu tooltip
  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to={path}
              className={cn(
                "flex items-center justify-center w-full p-2 text-slate-400 hover:text-white rounded-md",
                isActive && "bg-slate-800 text-white"
              )}
            >
              <span className="relative">
                <Icon size={20} />
                {iconExtra}
                {badge && (
                  <span
                    className={cn(
                      "absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white rounded-full",
                      badgeColor || "bg-primary"
                    )}
                  >
                    {badge}
                  </span>
                )}
              </span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{t(translationKey, label)}</p>
            {badge && (
              <span
                className={cn(
                  "ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white rounded-full",
                  badgeColor || "bg-primary"
                )}
              >
                {badge}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Dacă sidebar-ul este expandat, afișăm elementul complet
  return (
    <Link
      to={path}
      className={cn(
        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
        isActive
          ? "bg-slate-800 text-white"
          : "text-slate-400 hover:text-white hover:bg-slate-800"
      )}
    >
      <span className="relative">
        <Icon size={20} />
        {iconExtra}
      </span>
      <span className="ml-3 flex-1">{t(translationKey, label)}</span>
      {badge && (
        <span
          className={cn(
            "ml-auto flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white rounded-full",
            badgeColor || "bg-primary"
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
};

export default RoleBasedSidebarItem;
