/**
 * Tipuri pentru sistemul de permisiuni
 * Acest fișier conține tipurile pentru sistemul de permisiuni
 */

// Rolurile utilizatorilor
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  GUEST = 'guest',
}

// Resursele aplicației
export enum Resource {
  PROJECT = 'project',
  INVENTORY = 'inventory',
  MATERIAL = 'material',
  SUPPLIER = 'supplier',
  TEAM = 'team',
  TASK = 'task',
  REPORT = 'report',
  USER = 'user',
  ROLE = 'role',
  SETTING = 'setting',
  NOTIFICATION = 'notification',
  DASHBOARD = 'dashboard',
  ANALYTICS = 'analytics',
  CALENDAR = 'calendar',
  DOCUMENT = 'document',
  BUDGET = 'budget',
  SCHEDULE = 'schedule',
  FORECAST = 'forecast',
}

// Acțiunile asupra resurselor
export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
  EXPORT = 'export',
  IMPORT = 'import',
  SHARE = 'share',
  ASSIGN = 'assign',
  APPROVE = 'approve',
  REJECT = 'reject',
  COMMENT = 'comment',
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  PRINT = 'print',
  VIEW = 'view',
  LIST = 'list',
  SEARCH = 'search',
}

// Interfața pentru permisiune
export interface Permission {
  resource: Resource;
  action: Action;
  conditions?: Record<string, any>;
}

// Interfața pentru rolul utilizatorului
export interface Role {
  name: UserRole;
  displayName: string;
  description: string;
  permissions: Permission[];
}

// Interfața pentru contextul de permisiuni
export interface PermissionContext {
  userId: string;
  userRoles: UserRole[];
  resourceId?: string;
  resourceOwnerId?: string;
  resourceType?: Resource;
  projectId?: string;
  teamId?: string;
  data?: Record<string, any>;
}

// Exportăm toate tipurile
export default {
  UserRole,
  Resource,
  Action,
};
