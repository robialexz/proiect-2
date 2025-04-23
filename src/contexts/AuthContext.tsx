import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { authService } from "@/services/auth/auth-service";
import { roleService } from "@/services/auth/role-service";
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
    try {
      // Obținem profilul utilizatorului, inclusiv rolul și permisiunile
      const userProfileData = await roleService.getUserProfile(user);

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
    console.log("AuthContext: Initializing auth context");
    // Variabilă pentru a ține evidența dacă componenta este montată
    let isMounted = true;

    // Verificăm dacă este o nouă versiune a aplicației
    const appVersion = "1.0.1"; // Schimbă această valoare la fiecare versiune nouă
    const lastVersion = localStorage.getItem("app_version");

    if (lastVersion !== appVersion) {
      console.log("AuthContext: New app version detected");
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
        console.log("AuthContext: Getting initial session");

        // Obținem sesiunea de la Supabase
        let session = null;
        let error = null;

        try {
          const response = await supabase.auth.getSession();
          session = response.data.session;
          error = response.error;
          console.log("AuthContext: Session response", {
            session: !!session,
            error: !!error,
          });
        } catch (err) {
          console.error("AuthContext: Error getting session", err);
          error = err;
        }

        // Verificăm dacă componenta este încă montată
        if (!isMounted) {
          console.log("AuthContext: Component unmounted, aborting");
          return;
        }

        if (error) {
          console.error("AuthContext: Session error", error);
          setSession(null);
          setUser(null);
          setUserProfile(null);
          setLoading(false);
        } else {
          setSession(session);
          setUser(session?.user || null);

          if (session?.user) {
            console.log("AuthContext: User found in session, fetching profile");
            try {
              await fetchUserProfile(session.user);
              console.log("AuthContext: User profile fetched successfully");
            } catch (profileError) {
              console.error(
                "AuthContext: Error fetching user profile",
                profileError
              );
              // Set default profile in case of error
              if (session.user.email) {
                setUserProfile({
                  displayName: session.user.email.split("@")[0],
                  email: session.user.email,
                  role: UserRoles.VIEWER,
                  permissions: ROLE_PERMISSIONS[UserRoles.VIEWER],
                });
              }
            }
          } else {
            console.log("AuthContext: No user in session");
            setUserProfile(null);
          }

          // Setăm loading la false după ce am obținut sesiunea
          if (isMounted) {
            console.log("AuthContext: Setting loading to false");
            setLoading(false);
          }
        }
      } catch (error) {
        console.error(
          "AuthContext: Unexpected error in getInitialSession",
          error
        );
        if (isMounted) {
          setSession(null);
          setUser(null);
          setUserProfile(null);
          setLoading(false);
        }
      }
    };

    // Obținem sesiunea inițială
    getInitialSession();

    // Ascultăm pentru schimbări de autentificare în timp real
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AuthContext: Auth state changed", {
        event,
        session: !!session,
      });

      // Verificăm dacă componenta este încă montată
      if (!isMounted) {
        console.log(
          "AuthContext: Component unmounted during auth state change"
        );
        return;
      }

      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        console.log(
          "AuthContext: User found in auth state change, fetching profile"
        );
        try {
          await fetchUserProfile(session.user);
          console.log(
            "AuthContext: User profile fetched successfully in auth state change"
          );
        } catch (error) {
          console.error(
            "AuthContext: Error fetching user profile in auth state change",
            error
          );
          // Set default profile in case of error
          if (session.user.email) {
            setUserProfile({
              displayName: session.user.email.split("@")[0],
              email: session.user.email,
              role: UserRoles.VIEWER,
              permissions: ROLE_PERMISSIONS[UserRoles.VIEWER],
            });
          }
        }
      } else {
        console.log("AuthContext: No user in auth state change");
        setUserProfile(null);
      }

      // Ensure loading is false after auth state change
      setLoading(false);
    });

    // Curățăm subscripția la demontare
    return () => {
      console.log("AuthContext: Cleaning up auth context");
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
