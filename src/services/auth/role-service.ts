import { supabase } from "@/lib/supabase";
import {
  UserRoles,
  ROLE_PERMISSIONS,
  RolePermissions,
} from "@/types/supabase-tables";
import { User } from "@supabase/supabase-js";

/**
 * Serviciu pentru gestionarea rolurilor utilizatorilor
 */
export const roleService = {
  /**
   * Obține rolul utilizatorului din baza de date
   * @param userId ID-ul utilizatorului
   * @returns Rolul utilizatorului sau rolul implicit (VIEWER)
   */
  async getUserRole(userId: string): Promise<UserRoles> {
    try {
      // Verificăm mai întâi în tabelul de profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (profileError) {
        // Removed console statement
      }

      // Dacă avem un profil cu rol, îl returnăm
      if (profile?.role) {
        return profile.role as UserRoles;
      }

      // Dacă nu avem un profil cu rol, verificăm în tabelul de roluri utilizatori
      let userRole = null;
      let userRoleError = null;

      try {
        const response = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .single();

        userRole = response.data;
        userRoleError = response.error;
      } catch (error) {
        // Handle error appropriately
        userRoleError = error;
      }

      if (userRoleError && userRoleError.code !== "PGRST116") {
        // PGRST116 = not found
        // Removed console statement
      }

      // Dacă avem un utilizator cu rol, îl returnăm
      if (userRole?.role) {
        return userRole.role as UserRoles;
      }

      // Dacă nu avem nici un rol, returnăm rolul implicit
      return UserRoles.VIEWER;
    } catch (error) {
      // Removed console statement
      return UserRoles.VIEWER;
    }
  },

  /**
   * Obține permisiunile asociate unui rol
   * @param role Rolul utilizatorului
   * @returns Permisiunile asociate rolului
   */
  getRolePermissions(role: UserRoles): RolePermissions {
    return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[UserRoles.VIEWER];
  },

  /**
   * Actualizează rolul unui utilizator
   * @param userId ID-ul utilizatorului
   * @param role Noul rol
   * @returns Succes sau eroare
   */
  async updateUserRole(
    userId: string,
    role: UserRoles
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Actualizăm rolul în tabelul de profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId);

      if (profileError) {
        // Removed console statement
        return { success: false, error: profileError.message };
      }

      return { success: true };
    } catch (error: any) {
      // Removed console statement
      return { success: false, error: error.message || "Eroare neașteptată" };
    }
  },

  /**
   * Obține profilul complet al utilizatorului, inclusiv rolul și permisiunile
   * @param user Utilizatorul
   * @returns Profilul utilizatorului
   */
  async getUserProfile(user: User): Promise<{
    displayName: string;
    email: string;
    role: UserRoles;
    permissions: RolePermissions;
  }> {
    try {
      // Obținem rolul utilizatorului
      const role = await this.getUserRole(user.id);

      // Obținem permisiunile asociate rolului
      const permissions = this.getRolePermissions(role);

      // Obținem profilul utilizatorului
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("display_name, email")
        .eq("id", user.id)
        .single();

      if (error) {
        // Removed console statement
      }

      // Construim profilul utilizatorului
      return {
        displayName:
          profile?.display_name || user.email?.split("@")[0] || "Utilizator",
        email: profile?.email || user.email || "",
        role,
        permissions,
      };
    } catch (error) {
      // Removed console statement

      // Returnăm un profil implicit în caz de eroare
      return {
        displayName: user.email?.split("@")[0] || "Utilizator",
        email: user.email || "",
        role: UserRoles.VIEWER,
        permissions: ROLE_PERMISSIONS[UserRoles.VIEWER],
      };
    }
  },

  /**
   * Verifică dacă un utilizator are o anumită permisiune
   * @param userId ID-ul utilizatorului
   * @param permission Permisiunea de verificat
   * @returns True dacă utilizatorul are permisiunea, false în caz contrar
   */
  async hasPermission(
    userId: string,
    permission: keyof RolePermissions
  ): Promise<boolean> {
    try {
      // Obținem rolul utilizatorului
      const role = await this.getUserRole(userId);

      // Obținem permisiunile asociate rolului
      const permissions = this.getRolePermissions(role);

      // Verificăm dacă utilizatorul are permisiunea
      return permissions[permission] === true;
    } catch (error) {
      // Removed console statement
      return false;
    }
  },

  /**
   * Obține toți utilizatorii cu rolurile lor
   * @returns Lista de utilizatori cu roluri
   */
  async getAllUsersWithRoles(): Promise<
    Array<{ id: string; email: string; role: UserRoles }>
  > {
    try {
      // Obținem toți utilizatorii cu rolurile lor
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, role");

      if (error) {
        // Removed console statement
        return [];
      }

      return data.map((user) => ({
        id: user.id,
        email: user.email || "",
        role: (user.role as UserRoles) || UserRoles.VIEWER,
      }));
    } catch (error) {
      // Removed console statement
      return [];
    }
  },
};

export default roleService;
