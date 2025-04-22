/**
 * Enumerare pentru tabelele din Supabase
 * Folosită pentru a asigura consistența numelor de tabele în aplicație
 */
export enum SupabaseTables {
  USERS = 'users',
  PROFILES = 'profiles',
  PROJECTS = 'projects',
  MATERIALS = 'materials',
  RESOURCES = 'resources',
  REPORTS = 'reports',
  SUPPLIERS = 'suppliers',
  TEAMS = 'teams',
  TEAM_MEMBERS = 'team_members',
  NOTIFICATIONS = 'notifications',
  ERROR_LOGS = 'error_logs',
}

/**
 * Enumerare pentru funcțiile RPC din Supabase
 * Folosită pentru a asigura consistența numelor de funcții în aplicație
 */
export enum SupabaseRpcFunctions {
  GET_USER_PROJECTS = 'get_user_projects',
  GET_PROJECT_MATERIALS = 'get_project_materials',
  GET_LOW_STOCK_MATERIALS = 'get_low_stock_materials',
  GENERATE_REPORT = 'generate_report',
  UPDATE_USER_ROLE = 'update_user_role',
}

/**
 * Enumerare pentru rolurile utilizatorilor
 * Folosită pentru a gestiona permisiunile în aplicație
 */
export enum UserRoles {
  ADMIN = 'admin',
  MANAGER = 'manager',
  TEAM_LEAD = 'team_lead',
  INVENTORY_MANAGER = 'inventory_manager',
  WORKER = 'worker',
  VIEWER = 'viewer',
}

/**
 * Interfață pentru permisiunile asociate rolurilor
 */
export interface RolePermissions {
  canCreateProjects: boolean;
  canEditProjects: boolean;
  canDeleteProjects: boolean;
  canViewAllProjects: boolean;
  canManageUsers: boolean;
  canManageInventory: boolean;
  canViewReports: boolean;
  canCreateReports: boolean;
  canViewBudget: boolean;
  canManageBudget: boolean;
  canViewTeams: boolean;
  canManageTeams: boolean;
}

/**
 * Mapare a permisiunilor pentru fiecare rol
 */
export const ROLE_PERMISSIONS: Record<UserRoles, RolePermissions> = {
  [UserRoles.ADMIN]: {
    canCreateProjects: true,
    canEditProjects: true,
    canDeleteProjects: true,
    canViewAllProjects: true,
    canManageUsers: true,
    canManageInventory: true,
    canViewReports: true,
    canCreateReports: true,
    canViewBudget: true,
    canManageBudget: true,
    canViewTeams: true,
    canManageTeams: true,
  },
  [UserRoles.MANAGER]: {
    canCreateProjects: true,
    canEditProjects: true,
    canDeleteProjects: false,
    canViewAllProjects: true,
    canManageUsers: false,
    canManageInventory: true,
    canViewReports: true,
    canCreateReports: true,
    canViewBudget: true,
    canManageBudget: true,
    canViewTeams: true,
    canManageTeams: true,
  },
  [UserRoles.TEAM_LEAD]: {
    canCreateProjects: false,
    canEditProjects: true,
    canDeleteProjects: false,
    canViewAllProjects: false,
    canManageUsers: false,
    canManageInventory: true,
    canViewReports: true,
    canCreateReports: true,
    canViewBudget: true,
    canManageBudget: false,
    canViewTeams: true,
    canManageTeams: false,
  },
  [UserRoles.INVENTORY_MANAGER]: {
    canCreateProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canViewAllProjects: false,
    canManageUsers: false,
    canManageInventory: true,
    canViewReports: true,
    canCreateReports: true,
    canViewBudget: false,
    canManageBudget: false,
    canViewTeams: false,
    canManageTeams: false,
  },
  [UserRoles.WORKER]: {
    canCreateProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canViewAllProjects: false,
    canManageUsers: false,
    canManageInventory: false,
    canViewReports: false,
    canCreateReports: false,
    canViewBudget: false,
    canManageBudget: false,
    canViewTeams: false,
    canManageTeams: false,
  },
  [UserRoles.VIEWER]: {
    canCreateProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canViewAllProjects: false,
    canManageUsers: false,
    canManageInventory: false,
    canViewReports: true,
    canCreateReports: false,
    canViewBudget: false,
    canManageBudget: false,
    canViewTeams: false,
    canManageTeams: false,
  },
};
