import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRoles } from "@/types/supabase-tables";

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  requiredPermissions?: string[];
  redirectTo?: string;
}

/**
 * Componentă pentru protejarea rutelor în funcție de rol
 * @param children Conținutul care va fi afișat dacă utilizatorul are rolul necesar
 * @param allowedRoles Rolurile permise pentru această rută
 * @param requiredPermissions Permisiunile necesare pentru această rută (opțional)
 * @param redirectTo Ruta către care se va redirecționa în caz de acces neautorizat (implicit: /access-denied)
 */
export function RoleBasedRoute({
  children,
  allowedRoles,
  requiredPermissions = [],
  redirectTo = "/access-denied",
}: RoleBasedRouteProps) {
  const { userRole, hasPermission } = useAuth();

  // Verificăm dacă utilizatorul are un rol valid
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  // Verificăm dacă rolul utilizatorului este în lista de roluri permise
  // Convertim rolurile la lowercase pentru a asigura compatibilitatea
  const normalizedAllowedRoles = allowedRoles.map((role) => role.toLowerCase());
  const normalizedUserRole = userRole.toLowerCase();

  // Verificăm dacă rolul utilizatorului este în lista de roluri permise
  const hasAllowedRole = normalizedAllowedRoles.includes(normalizedUserRole);

  // Verificăm dacă utilizatorul are toate permisiunile necesare
  const hasAllRequiredPermissions = requiredPermissions.length === 0 || 
    requiredPermissions.every((permission) => hasPermission(permission as any));

  // Dacă utilizatorul nu are rolul sau permisiunile necesare, redirecționăm
  if (!hasAllowedRole || !hasAllRequiredPermissions) {
    return <Navigate to={redirectTo} replace />;
  }

  // Dacă utilizatorul are rolul și permisiunile necesare, afișăm conținutul
  return <>{children}</>;
}

export default RoleBasedRoute;
