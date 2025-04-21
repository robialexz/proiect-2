import React from "react";
import { usePermissionCheck } from "@/hooks/usePermissionCheck";

interface PermissionGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
}

/**
 * Componentă pentru protejarea conținutului în funcție de rol și permisiuni
 * @param children Conținutul care va fi afișat dacă utilizatorul are acces
 * @param allowedRoles Rolurile care au acces la acest conținut
 * @param requiredPermissions Permisiunile necesare pentru a accesa acest conținut
 * @param fallback Conținutul care va fi afișat dacă utilizatorul nu are acces
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  fallback = null,
}) => {
  const { canAccess } = usePermissionCheck();

  // Verificăm dacă utilizatorul are acces
  const hasAccess = canAccess(allowedRoles, requiredPermissions);

  // Dacă utilizatorul are acces, afișăm conținutul
  if (hasAccess) {
    return <>{children}</>;
  }

  // Dacă utilizatorul nu are acces, afișăm fallback-ul
  return <>{fallback}</>;
};

export default PermissionGuard;
