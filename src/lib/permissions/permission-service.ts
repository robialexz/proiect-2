/**
 * Serviciu pentru permisiuni
 * Acest fișier conține funcții pentru verificarea permisiunilor
 */

import { UserRole, Resource, Action, Permission, Role, PermissionContext } from './permission-types';
import { permissionRules } from './permission-rules';

/**
 * Verifică dacă un utilizator are o permisiune
 * @param context Contextul de permisiuni
 * @param resource Resursa
 * @param action Acțiunea
 * @returns true dacă utilizatorul are permisiunea
 */
export function hasPermission(
  context: PermissionContext,
  resource: Resource,
  action: Action
): boolean {
  // Verificăm dacă utilizatorul are roluri
  if (!context.userRoles || context.userRoles.length === 0) {
    return false;
  }
  
  // Administratorii au toate permisiunile
  if (context.userRoles.includes(UserRole.ADMIN)) {
    return true;
  }
  
  // Verificăm permisiunile pentru fiecare rol
  for (const role of context.userRoles) {
    // Obținem regulile pentru rol
    const roleRules = permissionRules.find((r) => r.name === role);
    
    if (!roleRules) {
      continue;
    }
    
    // Verificăm permisiunile pentru rol
    for (const permission of roleRules.permissions) {
      // Verificăm dacă permisiunea se potrivește cu resursa și acțiunea
      if (
        (permission.resource === resource || permission.resource === Resource.DASHBOARD) &&
        (permission.action === action || permission.action === Action.MANAGE)
      ) {
        // Verificăm condițiile
        if (!permission.conditions) {
          return true;
        }
        
        // Verificăm condițiile pentru proprietar
        if (
          permission.conditions.isOwner &&
          context.resourceOwnerId &&
          context.userId === context.resourceOwnerId
        ) {
          return true;
        }
        
        // Verificăm condițiile pentru membru al echipei
        if (
          permission.conditions.isTeamMember &&
          context.teamId &&
          isTeamMember(context.userId, context.teamId)
        ) {
          return true;
        }
        
        // Verificăm condițiile pentru membru al proiectului
        if (
          permission.conditions.isProjectMember &&
          context.projectId &&
          isProjectMember(context.userId, context.projectId)
        ) {
          return true;
        }
        
        // Verificăm condițiile pentru resurse publice
        if (permission.conditions.isPublic && isResourcePublic(context.resourceType, context.resourceId)) {
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Verifică dacă un utilizator este membru al unei echipe
 * @param userId ID-ul utilizatorului
 * @param teamId ID-ul echipei
 * @returns true dacă utilizatorul este membru al echipei
 */
function isTeamMember(userId: string, teamId: string): boolean {
  // Aici ar trebui să verificăm în baza de date
  // Pentru moment, returnăm true pentru a permite testarea
  return true;
}

/**
 * Verifică dacă un utilizator este membru al unui proiect
 * @param userId ID-ul utilizatorului
 * @param projectId ID-ul proiectului
 * @returns true dacă utilizatorul este membru al proiectului
 */
function isProjectMember(userId: string, projectId: string): boolean {
  // Aici ar trebui să verificăm în baza de date
  // Pentru moment, returnăm true pentru a permite testarea
  return true;
}

/**
 * Verifică dacă o resursă este publică
 * @param resourceType Tipul resursei
 * @param resourceId ID-ul resursei
 * @returns true dacă resursa este publică
 */
function isResourcePublic(resourceType?: Resource, resourceId?: string): boolean {
  // Aici ar trebui să verificăm în baza de date
  // Pentru moment, returnăm false pentru a fi siguri
  return false;
}

/**
 * Obține permisiunile pentru un rol
 * @param role Rolul
 * @returns Permisiunile pentru rol
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  const roleRules = permissionRules.find((r) => r.name === role);
  
  if (!roleRules) {
    return [];
  }
  
  return roleRules.permissions;
}

/**
 * Obține toate rolurile
 * @returns Toate rolurile
 */
export function getAllRoles(): Role[] {
  return permissionRules;
}

/**
 * Obține un rol după nume
 * @param name Numele rolului
 * @returns Rolul
 */
export function getRoleByName(name: UserRole): Role | undefined {
  return permissionRules.find((r) => r.name === name);
}

/**
 * Verifică dacă un utilizator are un rol
 * @param context Contextul de permisiuni
 * @param role Rolul
 * @returns true dacă utilizatorul are rolul
 */
export function hasRole(context: PermissionContext, role: UserRole): boolean {
  return context.userRoles.includes(role);
}

/**
 * Verifică dacă un utilizator are oricare dintre rolurile specificate
 * @param context Contextul de permisiuni
 * @param roles Rolurile
 * @returns true dacă utilizatorul are oricare dintre roluri
 */
export function hasAnyRole(context: PermissionContext, roles: UserRole[]): boolean {
  return context.userRoles.some((role) => roles.includes(role));
}

/**
 * Verifică dacă un utilizator are toate rolurile specificate
 * @param context Contextul de permisiuni
 * @param roles Rolurile
 * @returns true dacă utilizatorul are toate rolurile
 */
export function hasAllRoles(context: PermissionContext, roles: UserRole[]): boolean {
  return roles.every((role) => context.userRoles.includes(role));
}

/**
 * Creează un context de permisiuni
 * @param userId ID-ul utilizatorului
 * @param userRoles Rolurile utilizatorului
 * @param options Opțiuni suplimentare
 * @returns Contextul de permisiuni
 */
export function createPermissionContext(
  userId: string,
  userRoles: UserRole[],
  options: Partial<PermissionContext> = {}
): PermissionContext {
  return {
    userId,
    userRoles,
    ...options,
  };
}

// Exportăm toate funcțiile
export default {
  hasPermission,
  getPermissionsForRole,
  getAllRoles,
  getRoleByName,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  createPermissionContext,
};
