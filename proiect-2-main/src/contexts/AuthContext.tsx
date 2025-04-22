import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { authService } from "@/services/auth/auth-service";
import { roleService } from "@/services/auth/role-service";
import { usersService, logsService } from "@/services/admin";
import { SupabaseErrorResponse } from "@/services/api/supabase-service";
import {
  UserRoles,
  ROLE_PERMISSIONS,
  RolePermissions,
} from "@/types/supabase-tables";

// Definim tipul pentru răspunsul de autentificare
type AuthResponse = {
  data: any;
  error: Error | SupabaseErrorResponse | null;
};

type UserProfile = {
  displayName: string;
  email: string;
  role: UserRoles;
  permissions: RolePermissions;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  userRole: UserRoles | null;
  permissions: RolePermissions | null;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  loading: boolean;
  hasPermission: (permission: keyof RolePermissions) => boolean;
  isAdmin: () => boolean;
  createUser: (email: string, password: string, role: UserRoles) => Promise<AuthResponse>;
  updateUserRole: (userId: string, role: UserRoles) => Promise<AuthResponse>;
  deleteUser: (userId: string) => Promise<AuthResponse>;
  logUserAction: (action: string, resource: string, details?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<UserRoles | null>(null);
  const [permissions, setPermissions] = useState<RolePermissions | null>(null);
  const [loading, setLoading] = useState(true);

  // Funcție pentru a verifica dacă utilizatorul are o anumită permisiune
  const hasPermission = (permission: keyof RolePermissions): boolean => {
    if (!permissions) return false;
    return permissions[permission] === true;
  };

  // Funcție pentru a obține profilul utilizatorului
  const fetchUserProfile = async (user: User) => {
    // Adăugăm un timeout pentru a evita blocarea la încărcarea profilului
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Timeout la încărcarea profilului utilizatorului"));
      }, 10000); // 10 secunde timeout
    });

    try {
      // Folosim Promise.race pentru a implementa timeout-ul
      const userProfileData = await Promise.race([
        roleService.getUserProfile(user),
        timeoutPromise
      ]) as any;

      // Setăm datele în state
      setUserProfile(userProfileData);
      setUserRole(userProfileData.role);
      setPermissions(userProfileData.permissions);

      // Generăm un mesaj de bun venit personalizat în funcție de rol
      const welcomeMessage = getWelcomeMessage(userProfileData.role);
      // Removed console statement
    } catch (error) {
      // Removed console statement
      // Setăm rolul și permisiunile implicite în caz de eroare
      const defaultRole = UserRoles.VIEWER;
      setUserRole(defaultRole);
      setPermissions(ROLE_PERMISSIONS[defaultRole]);

      // Creăm un profil implicit pentru a evita blocarea aplicației
      setUserProfile({
        displayName: user.email?.split("@")[0] || "Utilizator",
        email: user.email || "",
        role: defaultRole,
        permissions: ROLE_PERMISSIONS[defaultRole]
      });

      // Creăm un profil simplu bazat pe email în caz de eroare
      if (user?.email) {
        setUserProfile({
          displayName: user.email.split("@")[0],
          email: user.email,
          role: defaultRole,
          permissions: ROLE_PERMISSIONS[defaultRole],
        });
      }
    }
  };

  // Funcție pentru a genera un mesaj de bun venit personalizat în funcție de rol
  const getWelcomeMessage = (role: UserRoles): string => {
    const hour = new Date().getHours();
    let timeOfDay = "";

    if (hour >= 5 && hour < 12) {
      timeOfDay = "dimineața";
    } else if (hour >= 12 && hour < 18) {
      timeOfDay = "ziua";
    } else {
      timeOfDay = "seara";
    }

    switch (role) {
      case UserRoles.ADMIN:
        return `Bună ${timeOfDay}, șefule! Ai acces complet la sistem.`;
      case UserRoles.MANAGER:
        return `Bună ${timeOfDay}, manager! Ai acces la majoritatea funcționalităților.`;
      case UserRoles.TEAM_LEAD:
        return `Bună ${timeOfDay}, team lead! Poți gestiona echipa și proiectele tale.`;
      case UserRoles.INVENTORY_MANAGER:
        return `Bună ${timeOfDay}! Ai acces la gestionarea inventarului.`;
      case UserRoles.WORKER:
        return `Bună ${timeOfDay}! Ai acces la proiectele tale.`;
      default:
        return `Bună ${timeOfDay}! Bine ai venit în aplicație.`;
    }
  };

  // Verificăm sesiunea la încărcarea componentei și ascultăm schimbările
  useEffect(() => {
    // Removed console statement
    // Variabilă pentru a ține evidența dacă componenta este montată
    let isMounted = true;

    // Verificăm dacă este o nouă versiune a aplicației
    const appVersion = "1.0.0"; // Schimbă această valoare la fiecare versiune nouă
    const lastVersion = localStorage.getItem("app_version");

    if (lastVersion !== appVersion) {
      // Removed console statement
      // Ștergem cache-ul pentru a forța încărcarea noii versiuni
      localStorage.setItem("app_version", appVersion);

      // Trimitem un mesaj către service worker pentru a forța actualizarea
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "SKIP_WAITING",
        });
      }
    }

    // Funcție pentru a obține sesiunea curentă de la Supabase
    const getInitialSession = async () => {
      try {
        // Adăugăm un timeout pentru a evita blocarea la încărcarea sesiunii
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error("Timeout la încărcarea sesiunii"));
          }, 15000); // 15 secunde timeout
        });

        // Obținem sesiunea de la Supabase
        let session = null;
        let error = null;

        try {
          // Folosim Promise.race pentru a implementa timeout-ul
          const response = await Promise.race([
            supabase.auth.getSession(),
            timeoutPromise
          ]) as any;

          session = response.data.session;
          error = response.error;
        } catch (err) {
          error = err;
        }

        // Verificăm dacă componenta este încă montată
        if (!isMounted) return;

        if (error) {
          setSession(null);
          setUser(null);
          setUserProfile(null);
        } else {
          setSession(session);
          setUser(session?.user || null);
          if (session?.user) {
            try {
              await fetchUserProfile(session.user);
            } catch (profileError) {
              // Creăm un profil implicit pentru a evita blocarea aplicației
              const defaultRole = UserRoles.VIEWER;
              setUserRole(defaultRole);
              setPermissions(ROLE_PERMISSIONS[defaultRole]);

              if (session.user?.email) {
                setUserProfile({
                  displayName: session.user.email.split("@")[0] || "Utilizator",
                  email: session.user.email || "",
                  role: defaultRole,
                  permissions: ROLE_PERMISSIONS[defaultRole]
                });
              }
            }
          } else {
            setUserProfile(null);
          }
        }
      } catch (error) {
        if (isMounted) {
          setSession(null);
          setUser(null);
          setUserProfile(null);
        }
      } finally {
        // Setăm loading la false în toate cazurile pentru a evita blocarea aplicației
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Obținem sesiunea inițială
    getInitialSession();

    // Ascultăm pentru schimbări de autentificare în timp real
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Removed console statement
      // Verificăm dacă componenta este încă montată
      if (!isMounted) return;

      try {
        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          try {
            // Adăugăm un timeout pentru a evita blocarea la încărcarea profilului
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => {
                reject(new Error("Timeout la încărcarea profilului utilizatorului"));
              }, 10000); // 10 secunde timeout
            });

            // Folosim Promise.race pentru a implementa timeout-ul
            await Promise.race([
              fetchUserProfile(session.user),
              timeoutPromise
            ]);
          } catch (error) {
            // Creăm un profil implicit pentru a evita blocarea aplicației
            const defaultRole = UserRoles.VIEWER;
            setUserRole(defaultRole);
            setPermissions(ROLE_PERMISSIONS[defaultRole]);

            if (session.user?.email) {
              setUserProfile({
                displayName: session.user.email.split("@")[0] || "Utilizator",
                email: session.user.email || "",
                role: defaultRole,
                permissions: ROLE_PERMISSIONS[defaultRole]
              });
            }
          }
        } else {
          setUserProfile(null);
          setUserRole(null);
          setPermissions(null);
        }
      } catch (error) {
        // Handle any unexpected errors
      } finally {
        // Ensure loading is false after auth state change in all cases
        setLoading(false);
      }
    });

    // Curățăm subscripția la demontare
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  // Funcție pentru autentificare
  const signIn = async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    try {
      const response = await authService.signIn(email, password);
      return response;
    } catch (error: any) {
      return {
        data: null,
        error: error,
      };
    }
  };

  // Funcție pentru înregistrare
  const signUp = async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<AuthResponse> => {
    try {
      // Folosim displayName dacă este furnizat
      const response = await authService.signUp(email, password, displayName);
      return response;
    } catch (error: any) {
      return {
        data: null,
        error: error,
      };
    }
  };

  // Funcție pentru deconectare
  const signOut = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      // Handle error appropriately
    }

    // Ștergem manual sesiunea din localStorage și sessionStorage
    localStorage.removeItem("supabase.auth.token");
    sessionStorage.removeItem("supabase.auth.token");
    localStorage.removeItem("sb-btvpnzsmrfrlwczanbcg-auth-token");
    sessionStorage.removeItem("sb-btvpnzsmrfrlwczanbcg-auth-token");

    // Resetăm starea
    setSession(null);
    setUser(null);
    setUserProfile(null);
  };

  // Funcție pentru a verifica dacă utilizatorul este administrator
  const isAdmin = (): boolean => {
    return userRole === UserRoles.ADMIN;
  };

  // Funcție pentru a crea un utilizator nou (doar pentru administratori)
  const createUser = async (
    email: string,
    password: string,
    role: UserRoles
  ): Promise<AuthResponse> => {
    try {
      if (!isAdmin()) {
        throw new Error("Nu aveți permisiunea de a crea utilizatori");
      }

      // Creăm utilizatorul în Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (error) throw error;

      if (data.user) {
        // Adăugăm rolul pentru utilizator
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert([{ user_id: data.user.id, role }]);

        if (roleError) throw roleError;

        // Înregistrăm acțiunea
        await logUserAction(
          "create",
          "user",
          `Created user ${email} with role ${role}`
        );
      }

      return { data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error,
      };
    }
  };

  // Funcție pentru a actualiza rolul unui utilizator (doar pentru administratori)
  const updateUserRole = async (
    userId: string,
    role: UserRoles
  ): Promise<AuthResponse> => {
    try {
      if (!isAdmin()) {
        throw new Error("Nu aveți permisiunea de a actualiza rolurile utilizatorilor");
      }

      // Verificăm dacă utilizatorul are deja un rol
      const { data, error: checkError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      let updateError = null;

      if (data) {
        // Actualizăm rolul existent
        const { error } = await supabase
          .from("user_roles")
          .update({ role })
          .eq("user_id", userId);

        updateError = error;
      } else {
        // Creăm un nou rol pentru utilizator
        const { error } = await supabase
          .from("user_roles")
          .insert([{ user_id: userId, role }]);

        updateError = error;
      }

      if (updateError) throw updateError;

      // Înregistrăm acțiunea
      await logUserAction(
        "update",
        "user_role",
        `Updated user ${userId} role to ${role}`
      );

      return { data: { success: true }, error: null };
    } catch (error: any) {
      return {
        data: null,
        error,
      };
    }
  };

  // Funcție pentru a șterge un utilizator (doar pentru administratori)
  const deleteUser = async (userId: string): Promise<AuthResponse> => {
    try {
      if (!isAdmin()) {
        throw new Error("Nu aveți permisiunea de a șterge utilizatori");
      }

      // Ștergem utilizatorul din Supabase Auth
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      // Înregistrăm acțiunea
      await logUserAction(
        "delete",
        "user",
        `Deleted user ${userId}`
      );

      return { data: { success: true }, error: null };
    } catch (error: any) {
      return {
        data: null,
        error,
      };
    }
  };

  // Funcție pentru a înregistra acțiunile utilizatorilor
  const logUserAction = async (
    action: string,
    resource: string,
    details?: string
  ): Promise<void> => {
    try {
      if (!user) return;

      const { error } = await supabase.from("user_logs").insert([
        {
          user_id: user.id,
          action,
          resource,
          details,
          ip_address: "127.0.0.1", // În implementarea reală, ar trebui să obținem IP-ul real
          user_agent: navigator.userAgent,
        },
      ]);

      if (error) {
        console.error("Error logging user action:", error);
      }
    } catch (error) {
      console.error("Error logging user action:", error);
    }
  };

  const value = {
    session,
    user,
    userProfile,
    userRole,
    permissions,
    signIn,
    signUp,
    signOut,
    loading,
    hasPermission,
    isAdmin,
    createUser,
    updateUserRole,
    deleteUser,
    logUserAction,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
