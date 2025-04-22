/**
 * Provider pentru sistemul de permisiuni
 * Acest fișier conține provider-ul pentru sistemul de permisiuni
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { 
  UserRole, 
  Resource, 
  Action, 
  Permission, 
  PermissionContext 
} from './permission-types';
import { 
  hasPermission, 
  hasResourcePermission, 
  getUserPermissions, 
  hasRouteAccess 
} from './permission-checker';

// Interfața pentru contextul de permisiuni
interface PermissionContextType {
  userRoles: UserRole[];
  hasPermission: (resource: Resource, action: Action, context?: Partial<PermissionContext>) => boolean;
  hasResourcePermission: (resource: Resource, action: Action, resourceId: string, resourceOwnerId: string, context?: Partial<PermissionContext>) => boolean;
  getUserPermissions: () => Permission[];
  hasRouteAccess: (route: string) => boolean;
  canAccessCurrentRoute: boolean;
}

// Creăm contextul de permisiuni
const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

/**
 * Provider pentru sistemul de permisiuni
 * @param props Proprietățile pentru provider
 * @returns Provider-ul pentru sistemul de permisiuni
 */
export function PermissionProvider({ children }: { children: React.ReactNode }) {
  // Obținem utilizatorul curent
  const { user, userProfile } = useAuthStore();
  
  // Obținem locația curentă
  const location = useLocation();
  
  // Obținem rolurile utilizatorului
  const userRoles = useMemo(() => {
    if (!user) return [UserRole.GUEST];
    
    // Obținem rolurile din profilul utilizatorului
    const roles: UserRole[] = [];
    
    if (userProfile?.role) {
      // Verificăm dacă rolul este valid
      if (Object.values(UserRole).includes(userProfile.role as UserRole)) {
        roles.push(userProfile.role as UserRole);
      }
    }
    
    // Dacă nu avem roluri, adăugăm rolul implicit
    if (roles.length === 0) {
      roles.push(UserRole.USER);
    }
    
    return roles;
  }, [user, userProfile]);
  
  // Verificăm dacă utilizatorul are acces la ruta curentă
  const canAccessCurrentRoute = useMemo(() => {
    return hasRouteAccess(userRoles, location.pathname);
  }, [userRoles, location.pathname]);
  
  // Valoarea contextului
  const contextValue: PermissionContextType = {
    userRoles,
    hasPermission: (resource, action, context) => hasPermission(
      userRoles,
      resource,
      action,
      {
        userId: user?.id,
        userRoles,
        ...context,
      }
    ),
    hasResourcePermission: (resource, action, resourceId, resourceOwnerId, context) => hasResourcePermission(
      userRoles,
      resource,
      action,
      resourceId,
      resourceOwnerId,
      {
        userId: user?.id,
        userRoles,
        ...context,
      }
    ),
    getUserPermissions: () => getUserPermissions(userRoles),
    hasRouteAccess: (route) => hasRouteAccess(userRoles, route),
    canAccessCurrentRoute,
  };
  
  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  );
}

/**
 * Hook pentru a utiliza sistemul de permisiuni
 * @returns Contextul de permisiuni
 */
export function usePermissions() {
  const context = useContext(PermissionContext);
  
  if (!context) {
    throw new Error('usePermissions trebuie utilizat în interiorul unui PermissionProvider');
  }
  
  return context;
}

/**
 * Componentă pentru a afișa conținut doar dacă utilizatorul are o permisiune
 * @param props Proprietățile pentru componentă
 * @returns Componenta cu conținutul condiționat
 */
export function PermissionGate({
  resource,
  action,
  resourceId,
  resourceOwnerId,
  fallback = null,
  children,
}: {
  resource: Resource;
  action: Action;
  resourceId?: string;
  resourceOwnerId?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  // Obținem permisiunile
  const { hasPermission, hasResourcePermission } = usePermissions();
  
  // Verificăm dacă utilizatorul are permisiunea
  const hasAccess = resourceId && resourceOwnerId
    ? hasResourcePermission(resource, action, resourceId, resourceOwnerId)
    : hasPermission(resource, action);
  
  // Afișăm conținutul doar dacă utilizatorul are permisiunea
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

/**
 * Componentă pentru a afișa conținut doar dacă utilizatorul are acces la o rută
 * @param props Proprietățile pentru componentă
 * @returns Componenta cu conținutul condiționat
 */
export function RouteGate({
  route,
  fallback = null,
  children,
}: {
  route: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  // Obținem permisiunile
  const { hasRouteAccess } = usePermissions();
  
  // Verificăm dacă utilizatorul are acces la rută
  const hasAccess = hasRouteAccess(route);
  
  // Afișăm conținutul doar dacă utilizatorul are acces la rută
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

export default {
  PermissionProvider,
  usePermissions,
  PermissionGate,
  RouteGate,
};
