import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook pentru verificarea permisiunilor la nivel de componente
 * Permite verificarea rapidă dacă utilizatorul curent are anumite permisiuni sau roluri
 */
export function usePermissionCheck() {
  const { userRole, hasPermission } = useAuth();

  /**
   * Verifică dacă utilizatorul are unul dintre rolurile specificate
   * @param allowedRoles Rolurile permise
   * @returns true dacă utilizatorul are unul dintre rolurile specificate, false în caz contrar
   */
  const hasRole = (allowedRoles: string[]): boolean => {
    if (!userRole) return false;
    return allowedRoles.includes(userRole);
  };

  /**
   * Verifică dacă utilizatorul are toate permisiunile specificate
   * @param requiredPermissions Permisiunile necesare
   * @returns true dacă utilizatorul are toate permisiunile specificate, false în caz contrar
   */
  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    if (!requiredPermissions.length) return true;
    return requiredPermissions.every((permission) => hasPermission(permission as any));
  };

  /**
   * Verifică dacă utilizatorul are cel puțin una dintre permisiunile specificate
   * @param permissions Permisiunile de verificat
   * @returns true dacă utilizatorul are cel puțin una dintre permisiunile specificate, false în caz contrar
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!permissions.length) return true;
    return permissions.some((permission) => hasPermission(permission as any));
  };

  /**
   * Verifică dacă utilizatorul are acces la o anumită funcționalitate
   * @param allowedRoles Rolurile care au acces
   * @param requiredPermissions Permisiunile necesare (toate trebuie să fie prezente)
   * @returns true dacă utilizatorul are acces, false în caz contrar
   */
  const canAccess = (
    allowedRoles: string[] = [],
    requiredPermissions: string[] = []
  ): boolean => {
    // Dacă nu sunt specificate roluri sau permisiuni, toți utilizatorii autentificați au acces
    if (allowedRoles.length === 0 && requiredPermissions.length === 0) {
      return true;
    }

    // Verificăm rolurile
    const hasAllowedRole = allowedRoles.length === 0 || hasRole(allowedRoles);

    // Verificăm permisiunile
    const hasRequiredPermissions =
      requiredPermissions.length === 0 || hasAllPermissions(requiredPermissions);

    // Utilizatorul trebuie să aibă atât rolul cât și permisiunile necesare
    return hasAllowedRole && hasRequiredPermissions;
  };

  return {
    hasRole,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    canAccess,
  };
}
