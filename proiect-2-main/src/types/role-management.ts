// Tipuri pentru gestionarea rolurilor

// Tipul pentru un utilizator cu rol
export interface UserWithRole {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

// Tipul pentru un rol de utilizator în baza de date
export interface UserRole {
  user_id: string;
  role: string;
}

// Importăm tipul Permission din AdvancedRoleContext
import { Permission as BasePermission } from "@/contexts/AdvancedRoleContext";

// Permisiuni personalizate pentru gestionarea rolurilor
export type RoleManagementPermission =
  | "assign_role"
  | "view_roles"
  | "manage_permissions";

// Exportăm tipul extins pentru a fi folosit în aplicație
export type ExtendedPermission = BasePermission | RoleManagementPermission;

// Adăugăm permisiunile personalizate la tipul Permission din AdvancedRoleContext
declare module "@/contexts/AdvancedRoleContext" {
  interface Permission {
    assign_role: "assign_role";
    view_roles: "view_roles";
    manage_permissions: "manage_permissions";
  }
}
