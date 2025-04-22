import { supabase } from "@/lib/supabase";
import { SupabaseTables, UserRoles, RolePermissions, ROLE_PERMISSIONS } from "@/types/supabase-tables";
import { logsService } from "./logs-service";

// Tipul pentru rolul cu statistici
export interface RoleWithStats {
  name: string;
  displayName: string;
  userCount: number;
  permissions: RolePermissions;
}

/**
 * Serviciu pentru gestionarea rolurilor și permisiunilor
 */
class RolesService {
  /**
   * Obține toate rolurile cu statistici
   * @returns Lista de roluri cu statistici
   */
  async getRoles(): Promise<RoleWithStats[]> {
    try {
      // Obținem rolurile utilizatorilor direct din tabela user_roles
      const { data: roleData, error: roleError } = await supabase
        .from(SupabaseTables.USER_ROLES)
        .select("*");

      if (roleError) throw roleError;

      // Calculăm statisticile pentru fiecare rol
      const roleStats: Record<string, number> = {};

      // Inițializăm contoarele pentru fiecare rol
      Object.values(UserRoles).forEach(role => {
        roleStats[role] = 0;
      });

      // Numărăm utilizatorii pentru fiecare rol
      roleData?.forEach(userRole => {
        if (roleStats[userRole.role] !== undefined) {
          roleStats[userRole.role]++;
        }
      });

      // Obținem permisiunile personalizate pentru fiecare rol
      const { data: permissionsData, error: permissionsError } = await supabase
        .from(SupabaseTables.ROLE_PERMISSIONS)
        .select("*");

      if (permissionsError) throw permissionsError;

      // Creăm un map pentru permisiunile personalizate
      const customPermissions: Record<string, RolePermissions> = {};
      permissionsData?.forEach(p => {
        customPermissions[p.role_name] = p.permissions;
      });

      // Creăm lista de roluri cu statistici
      const rolesWithStats: RoleWithStats[] = Object.values(UserRoles).map(role => ({
        name: role,
        displayName: this.getDisplayName(role),
        userCount: roleStats[role] || 0,
        permissions: customPermissions[role] || ROLE_PERMISSIONS[role as UserRoles],
      }));

      return rolesWithStats;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  }

  /**
   * Obține un rol după nume
   * @param roleName Numele rolului
   * @returns Rolul cu statistici
   */
  async getRoleByName(roleName: string): Promise<RoleWithStats | null> {
    try {
      if (!Object.values(UserRoles).includes(roleName as UserRoles)) {
        return null;
      }

      // Obținem toți utilizatorii pentru a calcula statisticile
      const { data: roleData, error: roleError } = await supabase
        .from(SupabaseTables.USER_ROLES)
        .select("*")
        .eq("role", roleName);

      if (roleError) throw roleError;

      // Creăm rolul cu statistici
      const roleWithStats: RoleWithStats = {
        name: roleName,
        displayName: this.getDisplayName(roleName),
        userCount: roleData?.length || 0,
        permissions: ROLE_PERMISSIONS[roleName as UserRoles],
      };

      return roleWithStats;
    } catch (error) {
      console.error("Error fetching role:", error);
      throw error;
    }
  }

  /**
   * Actualizează permisiunile unui rol
   * @param roleName Numele rolului
   * @param permissions Permisiunile actualizate
   * @returns Rolul actualizat
   */
  async updateRolePermissions(
    roleName: string,
    permissions: RolePermissions
  ): Promise<RoleWithStats> {
    try {
      if (!Object.values(UserRoles).includes(roleName as UserRoles)) {
        throw new Error("Rolul specificat nu există");
      }

      // Actualizăm permisiunile în baza de date
      const { data: rolePermissionsData, error: rolePermissionsError } = await supabase
        .from(SupabaseTables.ROLE_PERMISSIONS)
        .upsert({
          role_name: roleName,
          permissions: permissions,
          updated_at: new Date().toISOString()
        })
        .select();

      if (rolePermissionsError) throw rolePermissionsError;

      // Înregistrăm acțiunea
      await logsService.logUserAction(
        "system",
        "update",
        "role_permissions",
        roleName,
        `Updated permissions for role ${roleName}`,
        "info"
      );

      // Returnăm rolul actualizat
      const updatedRole = await this.getRoleByName(roleName);

      if (!updatedRole) {
        throw new Error("Rolul nu a fost găsit");
      }

      return {
        ...updatedRole,
        permissions,
      };
    } catch (error) {
      console.error("Error updating role permissions:", error);
      throw error;
    }
  }

  /**
   * Obține utilizatorii cu un anumit rol
   * @param roleName Numele rolului
   * @returns Lista de utilizatori cu rolul specificat
   */
  async getUsersByRole(roleName: string): Promise<any[]> {
    try {
      if (!Object.values(UserRoles).includes(roleName as UserRoles)) {
        throw new Error("Rolul specificat nu există");
      }

      // Obținem utilizatorii cu rolul specificat
      const { data: roleData, error: roleError } = await supabase
        .from(SupabaseTables.USER_ROLES)
        .select("*")
        .eq("role", roleName);

      if (roleError) throw roleError;

      if (!roleData || roleData.length === 0) {
        return [];
      }

      // Obținem ID-urile utilizatorilor
      const userIds = roleData.map(r => r.user_id);

      // Obținem profilurile utilizatorilor
      const { data: profileData, error: profileError } = await supabase
        .from(SupabaseTables.PROFILES)
        .select("*")
        .in("id", userIds);

      if (profileError) throw profileError;

      // Combinăm datele
      const users = userIds.map(userId => {
        const profile = profileData?.find(p => p.id === userId);
        return {
          id: userId,
          displayName: profile?.display_name || "",
          email: profile?.email || "",
          role: roleName,
        };
      });

      return users;
    } catch (error) {
      console.error("Error fetching users by role:", error);
      throw error;
    }
  }

  /**
   * Obține numele afișat al unui rol
   * @param role Numele rolului
   * @returns Numele afișat al rolului
   */
  getDisplayName(role: string): string {
    switch (role) {
      case UserRoles.ADMIN:
        return "Administrator";
      case UserRoles.MANAGER:
        return "Manager";
      case UserRoles.TEAM_LEAD:
        return "Team Lead";
      case UserRoles.INVENTORY_MANAGER:
        return "Inventory Manager";
      case UserRoles.WORKER:
        return "Worker";
      case UserRoles.VIEWER:
        return "Viewer";
      default:
        return role;
    }
  }
}

export const rolesService = new RolesService();
