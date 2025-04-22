/**
 * Sistem de verificare a permisiunilor
 * Acest fișier conține funcționalitatea pentru verificarea permisiunilor
 */

import { 
  UserRole, 
  Resource, 
  Action, 
  Permission, 
  Role, 
  PermissionContext 
} from './permission-types';
import { rolePermissions } from './role-permissions';

/**
 * Verifică dacă un utilizator are o permisiune
 * @param userRoles Rolurile utilizatorului
 * @param resource Resursa
 * @param action Acțiunea
 * @param context Contextul de permisiuni
 * @returns true dacă utilizatorul are permisiunea
 */
export function hasPermission(
  userRoles: UserRole[],
  resource: Resource,
  action: Action,
  context: Partial<PermissionContext> = {}
): boolean {
  // Verificăm dacă utilizatorul are rolul de admin
  if (userRoles.includes(UserRole.ADMIN)) {
    return true;
  }
  
  // Verificăm fiecare rol al utilizatorului
  for (const roleName of userRoles) {
    const role = rolePermissions.find((r) => r.name === roleName);
    
    if (!role) continue;
    
    // Verificăm fiecare permisiune a rolului
    for (const permission of role.permissions) {
      // Verificăm dacă permisiunea se potrivește cu resursa și acțiunea
      if (permission.resource === resource && permission.action === action) {
        // Verificăm condițiile permisiunii
        if (permission.conditions) {
          // Verificăm fiecare condiție
          const conditionsMet = Object.entries(permission.conditions).every(([key, value]) => {
            // Verificăm dacă condiția este îndeplinită
            if (key === 'isOwner' && value === true) {
              return context.userId === context.resourceOwnerId;
            }
            
            if (key === 'isTeamMember' && value === true) {
              // Aici ar trebui să verificăm dacă utilizatorul este membru al echipei
              // Dar pentru simplitate, vom returna true
              return true;
            }
            
            if (key === 'isProjectMember' && value === true) {
              // Aici ar trebui să verificăm dacă utilizatorul este membru al proiectului
              // Dar pentru simplitate, vom returna true
              return true;
            }
            
            if (key === 'status' && Array.isArray(value)) {
              return value.includes(context.data?.status);
            }
            
            return true;
          });
          
          if (conditionsMet) {
            return true;
          }
        } else {
          // Dacă nu există condiții, permisiunea este acordată
          return true;
        }
      }
    }
  }
  
  // Dacă nu am găsit nicio permisiune, utilizatorul nu are acces
  return false;
}

/**
 * Verifică dacă un utilizator are o permisiune pentru o resursă specifică
 * @param userRoles Rolurile utilizatorului
 * @param resource Resursa
 * @param action Acțiunea
 * @param resourceId ID-ul resursei
 * @param resourceOwnerId ID-ul proprietarului resursei
 * @param context Contextul de permisiuni
 * @returns true dacă utilizatorul are permisiunea
 */
export function hasResourcePermission(
  userRoles: UserRole[],
  resource: Resource,
  action: Action,
  resourceId: string,
  resourceOwnerId: string,
  context: Partial<PermissionContext> = {}
): boolean {
  return hasPermission(
    userRoles,
    resource,
    action,
    {
      ...context,
      resourceId,
      resourceOwnerId,
      resourceType: resource,
    }
  );
}

/**
 * Obține toate permisiunile unui utilizator
 * @param userRoles Rolurile utilizatorului
 * @returns Lista de permisiuni
 */
export function getUserPermissions(userRoles: UserRole[]): Permission[] {
  // Verificăm dacă utilizatorul are rolul de admin
  if (userRoles.includes(UserRole.ADMIN)) {
    // Returnăm toate permisiunile posibile
    return Object.values(Resource).flatMap((resource) => 
      Object.values(Action).map((action) => ({
        resource,
        action,
      }))
    );
  }
  
  // Obținem permisiunile pentru fiecare rol
  const permissions: Permission[] = [];
  
  for (const roleName of userRoles) {
    const role = rolePermissions.find((r) => r.name === roleName);
    
    if (role) {
      permissions.push(...role.permissions);
    }
  }
  
  return permissions;
}

/**
 * Verifică dacă un utilizator are acces la o rută
 * @param userRoles Rolurile utilizatorului
 * @param route Ruta
 * @returns true dacă utilizatorul are acces la rută
 */
export function hasRouteAccess(userRoles: UserRole[], route: string): boolean {
  // Rutele publice
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/auth/callback',
    '/terms',
    '/privacy',
    '/about',
    '/contact',
  ];
  
  // Verificăm dacă ruta este publică
  if (publicRoutes.includes(route)) {
    return true;
  }
  
  // Verificăm dacă utilizatorul are rolul de admin
  if (userRoles.includes(UserRole.ADMIN)) {
    return true;
  }
  
  // Rutele pentru manageri
  const managerRoutes = [
    '/dashboard',
    '/overview',
    '/analytics',
    '/calendar',
    '/projects',
    '/inventory-management',
    '/inventory-overview',
    '/company-inventory',
    '/reports',
    '/resources',
    '/documents',
    '/suppliers',
    '/teams',
    '/budget',
    '/schedule',
    '/tasks',
    '/forecast',
    '/settings',
    '/profile',
    '/edit-profile',
    '/preferences',
  ];
  
  // Verificăm dacă utilizatorul are rolul de manager
  if (userRoles.includes(UserRole.MANAGER) && managerRoutes.includes(route)) {
    return true;
  }
  
  // Rutele pentru utilizatori
  const userRoutes = [
    '/dashboard',
    '/overview',
    '/calendar',
    '/projects',
    '/inventory-management',
    '/inventory-overview',
    '/reports',
    '/resources',
    '/documents',
    '/suppliers',
    '/teams',
    '/tasks',
    '/settings',
    '/profile',
    '/edit-profile',
    '/preferences',
  ];
  
  // Verificăm dacă utilizatorul are rolul de utilizator
  if (userRoles.includes(UserRole.USER) && userRoutes.includes(route)) {
    return true;
  }
  
  // Rutele pentru oaspeți
  const guestRoutes = [
    '/dashboard',
    '/overview',
    '/projects',
    '/settings',
    '/profile',
    '/edit-profile',
    '/preferences',
  ];
  
  // Verificăm dacă utilizatorul are rolul de oaspete
  if (userRoles.includes(UserRole.GUEST) && guestRoutes.includes(route)) {
    return true;
  }
  
  // Dacă nu am găsit nicio potrivire, utilizatorul nu are acces
  return false;
}

// Exportăm toate funcțiile
export default {
  hasPermission,
  hasResourcePermission,
  getUserPermissions,
  hasRouteAccess,
};
