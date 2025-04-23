import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleIndicatorProps {
  showIcon?: boolean;
  showTooltip?: boolean;
  className?: string;
}

/**
 * Componentă pentru afișarea rolului utilizatorului curent
 * @param showIcon Dacă se afișează iconița
 * @param showTooltip Dacă se afișează tooltip-ul
 * @param className Clase CSS suplimentare
 */
const RoleIndicator: React.FC<RoleIndicatorProps> = ({
  showIcon = true,
  showTooltip = true,
  className,
}) => {
  const { userProfile } = useAuth();
  const userRole = userProfile?.role;

  // Dacă nu există un rol, nu afișăm nimic
  if (!userRole) {
    return null;
  }

  // Definim culorile pentru fiecare rol
  const getRoleColor = (role: string): string => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200";
      case "manager":
        return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200";
      case "user":
        return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200";
      case "viewer":
        return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
    }
  };

  // Definim descrierile pentru fiecare rol
  const getRoleDescription = (role: string): string => {
    switch (role.toLowerCase()) {
      case "admin":
        return "Administrator - Acces complet la toate funcționalitățile";
      case "manager":
        return "Manager - Acces la majoritatea funcționalitățile, fără administrare";
      case "user":
        return "Utilizator - Acces la funcționalitățile de bază";
      case "viewer":
        return "Vizitator - Acces doar pentru vizualizare";
      default:
        return "Rol necunoscut";
    }
  };

  // Obținem culoarea și descrierea pentru rolul curent
  const roleColor = getRoleColor(userRole);
  const roleDescription = getRoleDescription(userRole);

  // Dacă se afișează tooltip-ul, înfășurăm badge-ul într-un tooltip
  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={cn(roleColor, "cursor-help", className)}
            >
              {showIcon && <Shield className="h-3 w-3 mr-1" />}
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{roleDescription}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Dacă nu se afișează tooltip-ul, afișăm doar badge-ul
  return (
    <Badge variant="outline" className={cn(roleColor, className)}>
      {showIcon && <Shield className="h-3 w-3 mr-1" />}
      {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
    </Badge>
  );
};

export default RoleIndicator;
