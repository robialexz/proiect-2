/**
 * Exportă sistemul de permisiuni
 */

// Exportăm tipurile de permisiuni
export { UserRole, Resource, Action } from "./permission-types";
export type { Permission, Role, PermissionContext } from "./permission-types";

// Exportăm regulile de permisiuni
export { permissionRules } from "./permission-rules";
export { default as permissionRules } from "./permission-rules";

// Exportăm serviciul de permisiuni
export {
  hasPermission,
  getPermissionsForRole,
  getAllRoles,
  getRoleByName,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  createPermissionContext,
} from "./permission-service";
export { default as permissionService } from "./permission-service";

// Exportăm hook-ul pentru permisiuni
export { usePermissions } from "./use-permissions";
export { default as usePermissions } from "./use-permissions";

// Export implicit pentru compatibilitate
export { default } from "./use-permissions";
