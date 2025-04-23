/**
 * Enumerare pentru tabelele din Supabase
 * Folosită pentru a asigura consistența numelor de tabele în aplicație
 */
export enum SupabaseTables {
  USERS = "users",
  PROFILES = "profiles",
  PROJECTS = "projects",
  MATERIALS = "materials",
  RESOURCES = "resources",
  REPORTS = "reports",
  SUPPLIERS = "suppliers",
  TEAMS = "teams",
  TEAM_MEMBERS = "team_members",
  NOTIFICATIONS = "notifications",
  ERROR_LOGS = "error_logs",
}

/**
 * Enumerare pentru funcțiile RPC din Supabase
 * Folosită pentru a asigura consistența numelor de funcții în aplicație
 */
export enum SupabaseRpcFunctions {
  GET_USER_PROJECTS = "get_user_projects",
  GET_PROJECT_MATERIALS = "get_project_materials",
  GET_LOW_STOCK_MATERIALS = "get_low_stock_materials",
  GENERATE_REPORT = "generate_report",
  UPDATE_USER_ROLE = "update_user_role",
}

/**
 * Enumerare pentru rolurile utilizatorilor
 * Folosită pentru a gestiona permisiunile în aplicație
 */
export enum UserRoles {
  SITE_ADMIN = "site_admin",
  COMPANY_ADMIN = "company_admin",
  ADMIN = "admin",
  MANAGER = "manager",
  TEAM_LEAD = "team_lead",
  INVENTORY_MANAGER = "inventory_manager",
  WORKER = "worker",
  VIEWER = "viewer",
}

/**
 * Interfață pentru permisiunile asociate rolurilor
 */
export interface RolePermissions {
  // Permisiuni pentru administrarea site-ului
  canManageSite: boolean;
  canManageCompanies: boolean;
  canManageSiteAdmins: boolean;

  // Permisiuni pentru administrarea companiei
  canManageCompanyUsers: boolean;
  canManageCompanySettings: boolean;

  // Permisiuni pentru proiecte
  canCreateProjects: boolean;
  canEditProjects: boolean;
  canDeleteProjects: boolean;
  canViewAllProjects: boolean;

  // Permisiuni pentru utilizatori și echipe
  canManageUsers: boolean;
  canViewTeams: boolean;
  canManageTeams: boolean;

  // Permisiuni pentru inventar
  canManageInventory: boolean;
  canApproveInventoryRequests: boolean;

  // Permisiuni pentru rapoarte și buget
  canViewReports: boolean;
  canCreateReports: boolean;
  canViewBudget: boolean;
  canManageBudget: boolean;
}

/**
 * Mapare a permisiunilor pentru fiecare rol
 */
export const ROLE_PERMISSIONS: Record<UserRoles, RolePermissions> = {
  [UserRoles.SITE_ADMIN]: {
    // Permisiuni pentru administrarea site-ului
    canManageSite: true,
    canManageCompanies: true,
    canManageSiteAdmins: true,

    // Permisiuni pentru administrarea companiei
    canManageCompanyUsers: true,
    canManageCompanySettings: true,

    // Permisiuni pentru proiecte
    canCreateProjects: true,
    canEditProjects: true,
    canDeleteProjects: true,
    canViewAllProjects: true,

    // Permisiuni pentru utilizatori și echipe
    canManageUsers: true,
    canViewTeams: true,
    canManageTeams: true,

    // Permisiuni pentru inventar
    canManageInventory: true,
    canApproveInventoryRequests: true,

    // Permisiuni pentru rapoarte și buget
    canViewReports: true,
    canCreateReports: true,
    canViewBudget: true,
    canManageBudget: true,
  },
  [UserRoles.COMPANY_ADMIN]: {
    // Permisiuni pentru administrarea site-ului
    canManageSite: false,
    canManageCompanies: false,
    canManageSiteAdmins: false,

    // Permisiuni pentru administrarea companiei
    canManageCompanyUsers: true,
    canManageCompanySettings: true,

    // Permisiuni pentru proiecte
    canCreateProjects: true,
    canEditProjects: true,
    canDeleteProjects: true,
    canViewAllProjects: true,

    // Permisiuni pentru utilizatori și echipe
    canManageUsers: true,
    canViewTeams: true,
    canManageTeams: true,

    // Permisiuni pentru inventar
    canManageInventory: true,
    canApproveInventoryRequests: true,

    // Permisiuni pentru rapoarte și buget
    canViewReports: true,
    canCreateReports: true,
    canViewBudget: true,
    canManageBudget: true,
  },
  [UserRoles.ADMIN]: {
    // Permisiuni pentru administrarea site-ului
    canManageSite: false,
    canManageCompanies: false,
    canManageSiteAdmins: false,

    // Permisiuni pentru administrarea companiei
    canManageCompanyUsers: false,
    canManageCompanySettings: false,

    // Permisiuni pentru proiecte
    canCreateProjects: true,
    canEditProjects: true,
    canDeleteProjects: true,
    canViewAllProjects: true,

    // Permisiuni pentru utilizatori și echipe
    canManageUsers: true,
    canViewTeams: true,
    canManageTeams: true,

    // Permisiuni pentru inventar
    canManageInventory: true,
    canApproveInventoryRequests: true,

    // Permisiuni pentru rapoarte și buget
    canViewReports: true,
    canCreateReports: true,
    canViewBudget: true,
    canManageBudget: true,
  },
  [UserRoles.MANAGER]: {
    // Permisiuni pentru administrarea site-ului
    canManageSite: false,
    canManageCompanies: false,
    canManageSiteAdmins: false,

    // Permisiuni pentru administrarea companiei
    canManageCompanyUsers: false,
    canManageCompanySettings: false,

    // Permisiuni pentru proiecte
    canCreateProjects: true,
    canEditProjects: true,
    canDeleteProjects: false,
    canViewAllProjects: true,

    // Permisiuni pentru utilizatori și echipe
    canManageUsers: false,
    canViewTeams: true,
    canManageTeams: true,

    // Permisiuni pentru inventar
    canManageInventory: true,
    canApproveInventoryRequests: true,

    // Permisiuni pentru rapoarte și buget
    canViewReports: true,
    canCreateReports: true,
    canViewBudget: true,
    canManageBudget: true,
  },
  [UserRoles.TEAM_LEAD]: {
    // Permisiuni pentru administrarea site-ului
    canManageSite: false,
    canManageCompanies: false,
    canManageSiteAdmins: false,

    // Permisiuni pentru administrarea companiei
    canManageCompanyUsers: false,
    canManageCompanySettings: false,

    // Permisiuni pentru proiecte
    canCreateProjects: false,
    canEditProjects: true,
    canDeleteProjects: false,
    canViewAllProjects: false,

    // Permisiuni pentru utilizatori și echipe
    canManageUsers: false,
    canViewTeams: true,
    canManageTeams: false,

    // Permisiuni pentru inventar
    canManageInventory: true,
    canApproveInventoryRequests: false,

    // Permisiuni pentru rapoarte și buget
    canViewReports: true,
    canCreateReports: true,
    canViewBudget: true,
    canManageBudget: false,
  },
  [UserRoles.INVENTORY_MANAGER]: {
    // Permisiuni pentru administrarea site-ului
    canManageSite: false,
    canManageCompanies: false,
    canManageSiteAdmins: false,

    // Permisiuni pentru administrarea companiei
    canManageCompanyUsers: false,
    canManageCompanySettings: false,

    // Permisiuni pentru proiecte
    canCreateProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canViewAllProjects: false,

    // Permisiuni pentru utilizatori și echipe
    canManageUsers: false,
    canViewTeams: false,
    canManageTeams: false,

    // Permisiuni pentru inventar
    canManageInventory: true,
    canApproveInventoryRequests: true,

    // Permisiuni pentru rapoarte și buget
    canViewReports: true,
    canCreateReports: true,
    canViewBudget: false,
    canManageBudget: false,
  },
  [UserRoles.WORKER]: {
    // Permisiuni pentru administrarea site-ului
    canManageSite: false,
    canManageCompanies: false,
    canManageSiteAdmins: false,

    // Permisiuni pentru administrarea companiei
    canManageCompanyUsers: false,
    canManageCompanySettings: false,

    // Permisiuni pentru proiecte
    canCreateProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canViewAllProjects: false,

    // Permisiuni pentru utilizatori și echipe
    canManageUsers: false,
    canViewTeams: false,
    canManageTeams: false,

    // Permisiuni pentru inventar
    canManageInventory: false,
    canApproveInventoryRequests: false,

    // Permisiuni pentru rapoarte și buget
    canViewReports: false,
    canCreateReports: false,
    canViewBudget: false,
    canManageBudget: false,
  },
  [UserRoles.VIEWER]: {
    // Permisiuni pentru administrarea site-ului
    canManageSite: false,
    canManageCompanies: false,
    canManageSiteAdmins: false,

    // Permisiuni pentru administrarea companiei
    canManageCompanyUsers: false,
    canManageCompanySettings: false,

    // Permisiuni pentru proiecte
    canCreateProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canViewAllProjects: false,

    // Permisiuni pentru utilizatori și echipe
    canManageUsers: false,
    canViewTeams: false,
    canManageTeams: false,

    // Permisiuni pentru inventar
    canManageInventory: false,
    canApproveInventoryRequests: false,

    // Permisiuni pentru rapoarte și buget
    canViewReports: true,
    canCreateReports: false,
    canViewBudget: false,
    canManageBudget: false,
  },
};
