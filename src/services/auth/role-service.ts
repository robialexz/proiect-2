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
      console.log("RoleService: Getting user role for", userId);

      // Verificăm mai întâi dacă utilizatorul este admin de site
      try {
        const { data: siteAdmin, error: siteAdminError } = await supabase
          .from("site_admins")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (siteAdminError) {
          console.error(
            "RoleService: Error checking site admin",
            siteAdminError
          );
        } else if (siteAdmin) {
          console.log("RoleService: User is a site admin");
          return UserRoles.SITE_ADMIN;
        }
      } catch (error) {
        console.error("RoleService: Error checking site admin", error);
      }

      // Verificăm în tabelul de profile
      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle();

        if (profileError) {
          console.error(
            "RoleService: Error getting profile role",
            profileError
          );
        } else if (profile?.role) {
          console.log("RoleService: Found role in profile", profile.role);
          return profile.role as UserRoles;
        }
      } catch (error) {
        console.error("RoleService: Error getting profile", error);
      }

      // Verificăm în tabelul de roluri utilizatori
      try {
        const { data: userRole, error: userRoleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();

        if (userRoleError && userRoleError.code !== "PGRST116") {
          console.error("RoleService: Error getting user role", userRoleError);
        } else if (userRole?.role) {
          console.log("RoleService: Found role in user_roles", userRole.role);
          return userRole.role as UserRoles;
        }
      } catch (error) {
        console.error("RoleService: Error getting user role", error);
      }

      // Dacă nu avem nici un rol, returnăm rolul implicit
      console.log("RoleService: No role found, returning default role");
      return UserRoles.VIEWER;
    } catch (error) {
      console.error("RoleService: Unexpected error getting user role", error);
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
      console.log("RoleService: Getting user profile for", user.id);

      // Verificăm dacă utilizatorul există în tabelul profiles
      let profile = null;
      let profileError = null;

      try {
        const profileResponse = await supabase
          .from("profiles")
          .select("display_name, email")
          .eq("id", user.id)
          .maybeSingle();

        profile = profileResponse.data;
        profileError = profileResponse.error;

        if (profileError) {
          console.error(
            "RoleService: Error getting user profile",
            profileError
          );
        } else if (!profile) {
          console.log("RoleService: Profile not found, creating one");

          // Dacă profilul nu există, îl creăm
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              email: user.email,
              display_name: user.email?.split("@")[0] || "Utilizator",
              role: UserRoles.VIEWER,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (createError) {
            console.error("RoleService: Error creating profile", createError);
          } else {
            profile = newProfile;
            console.log("RoleService: Profile created successfully", profile);
          }
        } else {
          console.log("RoleService: Profile found", profile);
        }
      } catch (error) {
        console.error("RoleService: Error checking/creating profile", error);
      }

      // Obținem rolul utilizatorului
      const role = await this.getUserRole(user.id);
      console.log("RoleService: User role", role);

      // Obținem permisiunile asociate rolului
      const permissions = this.getRolePermissions(role);
      console.log("RoleService: User permissions", permissions);

      // Construim profilul utilizatorului
      const userProfile = {
        displayName:
          profile?.display_name || user.email?.split("@")[0] || "Utilizator",
        email: profile?.email || user.email || "",
        role,
        permissions,
      };

      console.log("RoleService: Returning user profile", userProfile);
      return userProfile;
    } catch (error) {
      console.error(
        "RoleService: Unexpected error getting user profile",
        error
      );

      // Returnăm un profil implicit în caz de eroare
      const defaultProfile = {
        displayName: user.email?.split("@")[0] || "Utilizator",
        email: user.email || "",
        role: UserRoles.VIEWER,
        permissions: ROLE_PERMISSIONS[UserRoles.VIEWER],
      };

      console.log("RoleService: Returning default profile", defaultProfile);
      return defaultProfile;
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
