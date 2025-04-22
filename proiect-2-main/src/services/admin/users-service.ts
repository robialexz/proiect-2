import { supabase } from "@/lib/supabase";
import { SupabaseTables, UserRoles } from "@/types/supabase-tables";
import { logsService } from "./logs-service";

// Tipul pentru utilizator cu rol
export interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  role: string;
  status: "active" | "inactive" | "pending";
  displayName?: string;
}

/**
 * Serviciu pentru gestionarea utilizatorilor
 */
class UsersService {
  /**
   * Obține toți utilizatorii cu rolurile lor
   * @returns Lista de utilizatori cu roluri
   */
  async getUsers(): Promise<UserWithRole[]> {
    try {
      // Folosim o funcție PostgreSQL pentru a obține utilizatorii cu rolurile lor
      const { data, error } = await supabase
        .rpc('get_users_with_roles');

      if (error) throw error;

      if (!data) {
        return [];
      }

      // Transformăm datele în formatul necesar
      const usersWithRoles: UserWithRole[] = data.map((user: any) => ({
        id: user.id,
        email: user.email || "",
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        role: user.role || UserRoles.VIEWER,
        status: user.banned ? "inactive" : user.confirmed_at ? "active" : "pending",
        displayName: user.display_name || user.email?.split("@")[0] || "",
      }));

      return usersWithRoles;
    } catch (error) {
      console.error("Error fetching users:", error);
      
      // Dacă funcția RPC nu există, încercam o metodă alternativă
      try {
        // Obținem utilizatorii din tabela de roluri
        const { data: roleData, error: roleError } = await supabase
          .from(SupabaseTables.USER_ROLES)
          .select(`
            user_id,
            role,
            profiles:${SupabaseTables.PROFILES}(id, display_name, email, created_at, last_sign_in_at)
          `);

        if (roleError) throw roleError;

        if (!roleData) {
          return [];
        }

        // Transformăm datele în formatul necesar
        const usersWithRoles: UserWithRole[] = roleData.map((item: any) => ({
          id: item.user_id,
          email: item.profiles?.email || "",
          created_at: item.profiles?.created_at || new Date().toISOString(),
          last_sign_in_at: item.profiles?.last_sign_in_at,
          role: item.role || UserRoles.VIEWER,
          status: "active", // Nu putem determina starea exactă fără acces la auth.users
          displayName: item.profiles?.display_name || item.profiles?.email?.split("@")[0] || "",
        }));

        return usersWithRoles;
      } catch (fallbackError) {
        console.error("Error in fallback method for fetching users:", fallbackError);
        throw error; // Aruncăm eroarea originală
      }
    }
  }

  /**
   * Obține un utilizator după ID
   * @param id ID-ul utilizatorului
   * @returns Utilizatorul cu rolul său
   */
  async getUserById(id: string): Promise<UserWithRole | null> {
    try {
      // Obținem utilizatorul din tabela de roluri și profiluri
      const { data, error } = await supabase
        .from(SupabaseTables.USER_ROLES)
        .select(`
          user_id,
          role,
          profiles:${SupabaseTables.PROFILES}(id, display_name, email, created_at, last_sign_in_at)
        `)
        .eq("user_id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") { // Not found
          return null;
        }
        throw error;
      }

      if (!data) {
        return null;
      }

      // Combinăm datele
      const userWithRole: UserWithRole = {
        id: data.user_id,
        email: data.profiles?.email || "",
        created_at: data.profiles?.created_at || new Date().toISOString(),
        last_sign_in_at: data.profiles?.last_sign_in_at,
        role: data.role || UserRoles.VIEWER,
        status: "active", // Nu putem determina starea exactă fără acces la auth.users
        displayName: data.profiles?.display_name || data.profiles?.email?.split("@")[0] || "",
      };

      return userWithRole;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }

  /**
   * Creează un utilizator nou
   * @param params Parametrii pentru crearea utilizatorului
   * @returns Utilizatorul creat
   */
  async createUser(params: {
    email: string;
    password: string;
    role: string;
    displayName?: string;
  }): Promise<UserWithRole> {
    try {
      const { email, password, role, displayName } = params;
      
      // Creăm utilizatorul în Supabase Auth folosind signUp în loc de admin.createUser
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            display_name: displayName || email.split("@")[0] || ""
          }
        }
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error("Nu s-a putut crea utilizatorul");
      }

      // Adăugăm rolul pentru utilizator
      const { error: roleError } = await supabase
        .from(SupabaseTables.USER_ROLES)
        .insert([{ user_id: data.user.id, role }]);

      if (roleError) throw roleError;

      // Adăugăm profilul utilizatorului
      const { error: profileError } = await supabase
        .from(SupabaseTables.PROFILES)
        .insert([{ 
          id: data.user.id, 
          display_name: displayName || email.split("@")[0] || "",
          email: email
        }]);

      if (profileError) throw profileError;

      // Înregistrăm acțiunea
      await logsService.logUserAction(
        "system", // Folosim system în loc de ID-ul utilizatorului pentru că nu avem acces la sesiune
        "create",
        "user",
        data.user.id,
        `Created user ${email} with role ${role}`,
        "success"
      );

      // Returnăm utilizatorul creat
      return {
        id: data.user.id,
        email: email,
        created_at: data.user.created_at,
        last_sign_in_at: null,
        role: role as UserRoles,
        status: "active",
        displayName: displayName || email.split("@")[0] || "",
      };
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  /**
   * Actualizează un utilizator
   * @param id ID-ul utilizatorului
   * @param data Datele de actualizat
   * @returns Utilizatorul actualizat
   */
  async updateUser(
    id: string,
    data: {
      email?: string;
      role?: UserRoles;
      displayName?: string;
      status?: "active" | "inactive";
    }
  ): Promise<UserWithRole> {
    try {
      // Obținem utilizatorul curent
      const currentUser = await this.getUserById(id);

      if (!currentUser) {
        throw new Error("Utilizatorul nu a fost găsit");
      }

      // Actualizăm rolul dacă este furnizat
      if (data.role && data.role !== currentUser.role) {
        // Verificăm dacă utilizatorul are deja un rol
        const { data: roleData, error: checkError } = await supabase
          .from(SupabaseTables.USER_ROLES)
          .select("*")
          .eq("user_id", id)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          throw checkError;
        }

        if (roleData) {
          // Actualizăm rolul existent
          const { error: updateError } = await supabase
            .from(SupabaseTables.USER_ROLES)
            .update({ role: data.role })
            .eq("user_id", id);

          if (updateError) throw updateError;
        } else {
          // Creăm un nou rol pentru utilizator
          const { error: insertError } = await supabase
            .from(SupabaseTables.USER_ROLES)
            .insert([{ user_id: id, role: data.role }]);

          if (insertError) throw insertError;
        }
      }

      // Actualizăm numele afișat dacă este furnizat
      if (data.displayName && data.displayName !== currentUser.displayName) {
        // Verificăm dacă utilizatorul are deja un profil
        const { data: profileData, error: checkError } = await supabase
          .from(SupabaseTables.PROFILES)
          .select("*")
          .eq("id", id)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          throw checkError;
        }

        if (profileData) {
          // Actualizăm profilul existent
          const { error: updateError } = await supabase
            .from(SupabaseTables.PROFILES)
            .update({ display_name: data.displayName })
            .eq("id", id);

          if (updateError) throw updateError;
        } else {
          // Creăm un nou profil pentru utilizator
          const { error: insertError } = await supabase
            .from(SupabaseTables.PROFILES)
            .insert([{ id, display_name: data.displayName }]);

          if (insertError) throw insertError;
        }
      }

      // Înregistrăm acțiunea
      await logsService.logUserAction(
        "system",
        "update",
        "user",
        id,
        `Updated user ${currentUser.email}`,
        "success"
      );

      // Returnăm utilizatorul actualizat
      return await this.getUserById(id) as UserWithRole;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  /**
   * Șterge un utilizator
   * @param id ID-ul utilizatorului
   * @returns Rezultatul operațiunii
   */
  async deleteUser(id: string): Promise<{ success: boolean }> {
    try {
      // Obținem utilizatorul pentru a înregistra acțiunea
      const user = await this.getUserById(id);

      if (!user) {
        throw new Error("Utilizatorul nu a fost găsit");
      }

      // Ștergem utilizatorul din tabelele asociate
      // Ștergem rolul utilizatorului
      const { error: roleError } = await supabase
        .from(SupabaseTables.USER_ROLES)
        .delete()
        .eq("user_id", id);

      if (roleError) throw roleError;

      // Ștergem profilul utilizatorului
      const { error: profileError } = await supabase
        .from(SupabaseTables.PROFILES)
        .delete()
        .eq("id", id);

      if (profileError) throw profileError;

      // Înregistrăm acțiunea
      await logsService.logUserAction(
        "system",
        "delete",
        "user",
        id,
        `Deleted user ${user.email}`,
        "warning"
      );

      return { success: true };
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  /**
   * Trimite un email de resetare a parolei
   * @param email Email-ul utilizatorului
   * @returns Rezultatul operațiunii
   */
  async resetPassword(email: string): Promise<{ success: boolean }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) throw error;

      // Înregistrăm acțiunea
      await logsService.logUserAction(
        "system",
        "reset_password",
        "user",
        undefined,
        `Sent password reset email to ${email}`,
        "info"
      );

      return { success: true };
    } catch (error) {
      console.error("Error sending password reset:", error);
      throw error;
    }
  }

  /**
   * Schimbă rolul unui utilizator
   * @param id ID-ul utilizatorului
   * @param role Noul rol
   * @returns Utilizatorul actualizat
   */
  async changeUserRole(id: string, role: UserRoles): Promise<UserWithRole> {
    return this.updateUser(id, { role });
  }
}

export const usersService = new UsersService();
