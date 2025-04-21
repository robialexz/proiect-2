import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredPermissions?: string[];
  redirectTo?: string;
}

/**
 * Componentă pentru protejarea rutelor în funcție de rol și permisiuni
 * @param children Conținutul care va fi afișat dacă utilizatorul are acces
 * @param allowedRoles Rolurile care au acces la această rută
 * @param requiredPermissions Permisiunile necesare pentru a accesa această rută
 * @param redirectTo Ruta către care se va face redirecționarea în caz de acces neautorizat
 */
const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  redirectTo = "/access-denied",
}) => {
  const { user, userRole, permissions, loading } = useAuth();
  const location = useLocation();

  // Dacă autentificarea este în curs, afișăm un indicator de încărcare
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Verificare acces...</p>
        </div>
      </div>
    );
  }

  // Verificăm dacă utilizatorul este autentificat
  if (!user) {
    // Redirecționăm către pagina de autentificare și salvăm locația curentă
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Verificăm dacă utilizatorul are unul dintre rolurile permise
  const hasAllowedRole =
    allowedRoles.length === 0 || // Dacă nu sunt specificate roluri, toți utilizatorii autentificați au acces
    (userRole && allowedRoles.includes(userRole));

  // Verificăm dacă utilizatorul are toate permisiunile necesare
  const hasRequiredPermissions =
    requiredPermissions.length === 0 || // Dacă nu sunt specificate permisiuni, toți utilizatorii autentificați au acces
    (permissions &&
      requiredPermissions.every(
        (permission) => permissions[permission as keyof typeof permissions]
      ));

  // Dacă utilizatorul nu are rolul sau permisiunile necesare, redirecționăm către pagina specificată
  if (!hasAllowedRole || !hasRequiredPermissions) {
    return <Navigate to={redirectTo} replace />;
  }

  // Dacă utilizatorul are acces, afișăm conținutul
  return <>{children}</>;
};

export default RoleBasedRoute;
