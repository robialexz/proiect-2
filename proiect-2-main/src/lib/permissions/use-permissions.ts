/**
 * Hook pentru permisiuni
 * Acest fișier conține un hook pentru verificarea permisiunilor
 */

import { useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store';
import { UserRole, Resource, Action, PermissionContext } from './permission-types';
import {
  hasPermission,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  createPermissionContext,
} from './permission-service';

/**
 * Hook pentru permisiuni
 * @returns Funcții pentru verificarea permisiunilor
 */
export function usePermissions() {
  // Obținem utilizatorul autentificat
  const { user } = useAuthStore();
  
  // Creăm contextul de permisiuni
  const permissionContext = useMemo<PermissionContext>(() => {
    if (!user) {
      return {
        userId: '',
        userRoles: [UserRole.GUEST],
      };
    }
    
    return createPermissionContext(user.id, [user.role as UserRole]);
  }, [user]);
  
  /**
   * Verifică dacă utilizatorul are o permisiune
   * @param resource Resursa
   * @param action Acțiunea
   * @param options Opțiuni suplimentare
   * @returns true dacă utilizatorul are permisiunea
   */
  const can = useCallback(
    (resource: Resource, action: Action, options: Partial<PermissionContext> = {}) => {
      const context = {
        ...permissionContext,
        ...options,
      };
      
      return hasPermission(context, resource, action);
    },
    [permissionContext]
  );
  
  /**
   * Verifică dacă utilizatorul are un rol
   * @param role Rolul
   * @returns true dacă utilizatorul are rolul
   */
  const is = useCallback(
    (role: UserRole) => {
      return hasRole(permissionContext, role);
    },
    [permissionContext]
  );
  
  /**
   * Verifică dacă utilizatorul are oricare dintre rolurile specificate
   * @param roles Rolurile
   * @returns true dacă utilizatorul are oricare dintre roluri
   */
  const isAny = useCallback(
    (roles: UserRole[]) => {
      return hasAnyRole(permissionContext, roles);
    },
    [permissionContext]
  );
  
  /**
   * Verifică dacă utilizatorul are toate rolurile specificate
   * @param roles Rolurile
   * @returns true dacă utilizatorul are toate rolurile
   */
  const isAll = useCallback(
    (roles: UserRole[]) => {
      return hasAllRoles(permissionContext, roles);
    },
    [permissionContext]
  );
  
  /**
   * Verifică dacă utilizatorul este administrator
   * @returns true dacă utilizatorul este administrator
   */
  const isAdmin = useCallback(() => {
    return is(UserRole.ADMIN);
  }, [is]);
  
  /**
   * Verifică dacă utilizatorul este manager
   * @returns true dacă utilizatorul este manager
   */
  const isManager = useCallback(() => {
    return is(UserRole.MANAGER);
  }, [is]);
  
  /**
   * Verifică dacă utilizatorul este utilizator normal
   * @returns true dacă utilizatorul este utilizator normal
   */
  const isUser = useCallback(() => {
    return is(UserRole.USER);
  }, [is]);
  
  /**
   * Verifică dacă utilizatorul este oaspete
   * @returns true dacă utilizatorul este oaspete
   */
  const isGuest = useCallback(() => {
    return is(UserRole.GUEST);
  }, [is]);
  
  /**
   * Verifică dacă utilizatorul este autentificat
   * @returns true dacă utilizatorul este autentificat
   */
  const isAuthenticated = useCallback(() => {
    return !!user;
  }, [user]);
  
  /**
   * Verifică dacă utilizatorul este proprietarul unei resurse
   * @param resourceOwnerId ID-ul proprietarului resursei
   * @returns true dacă utilizatorul este proprietarul resursei
   */
  const isOwner = useCallback(
    (resourceOwnerId?: string) => {
      if (!user || !resourceOwnerId) {
        return false;
      }
      
      return user.id === resourceOwnerId;
    },
    [user]
  );
  
  /**
   * Verifică dacă utilizatorul poate crea o resursă
   * @param resource Resursa
   * @param options Opțiuni suplimentare
   * @returns true dacă utilizatorul poate crea resursa
   */
  const canCreate = useCallback(
    (resource: Resource, options: Partial<PermissionContext> = {}) => {
      return can(resource, Action.CREATE, options);
    },
    [can]
  );
  
  /**
   * Verifică dacă utilizatorul poate citi o resursă
   * @param resource Resursa
   * @param options Opțiuni suplimentare
   * @returns true dacă utilizatorul poate citi resursa
   */
  const canRead = useCallback(
    (resource: Resource, options: Partial<PermissionContext> = {}) => {
      return can(resource, Action.READ, options);
    },
    [can]
  );
  
  /**
   * Verifică dacă utilizatorul poate actualiza o resursă
   * @param resource Resursa
   * @param options Opțiuni suplimentare
   * @returns true dacă utilizatorul poate actualiza resursa
   */
  const canUpdate = useCallback(
    (resource: Resource, options: Partial<PermissionContext> = {}) => {
      return can(resource, Action.UPDATE, options);
    },
    [can]
  );
  
  /**
   * Verifică dacă utilizatorul poate șterge o resursă
   * @param resource Resursa
   * @param options Opțiuni suplimentare
   * @returns true dacă utilizatorul poate șterge resursa
   */
  const canDelete = useCallback(
    (resource: Resource, options: Partial<PermissionContext> = {}) => {
      return can(resource, Action.DELETE, options);
    },
    [can]
  );
  
  /**
   * Verifică dacă utilizatorul poate gestiona o resursă
   * @param resource Resursa
   * @param options Opțiuni suplimentare
   * @returns true dacă utilizatorul poate gestiona resursa
   */
  const canManage = useCallback(
    (resource: Resource, options: Partial<PermissionContext> = {}) => {
      return can(resource, Action.MANAGE, options);
    },
    [can]
  );
  
  // Returnăm funcțiile
  return {
    can,
    is,
    isAny,
    isAll,
    isAdmin,
    isManager,
    isUser,
    isGuest,
    isAuthenticated,
    isOwner,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canManage,
    permissionContext,
  };
}

// Exportăm hook-ul
export default usePermissions;
