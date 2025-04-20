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
      console.log(welcomeMessage);
    } catch (error) {
      console.error("Eroare la obținerea profilului:", error);
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
    console.log("AuthContext: Verificare sesiune inițială");
    // Variabilă pentru a ține evidența dacă componenta este montată
    let isMounted = true;

    // Verificăm dacă este o nouă versiune a aplicației
    const appVersion = "1.0.0"; // Schimbă această valoare la fiecare versiune nouă
    const lastVersion = localStorage.getItem("app_version");

    if (lastVersion !== appVersion) {
      console.log(
        `Versiune nouă detectată: ${appVersion} (anterior: ${
          lastVersion || "necunoscută"
        })`
      );
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
        console.log("AuthContext: Începe obținerea sesiunii inițiale");

        // Nu mai ștergem datele de autentificare pentru a păstra sesiunea la refresh

        // Obținem sesiunea de la Supabase
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        // Verificăm dacă componenta este încă montată
        if (!isMounted) return;

        if (error) {
          console.error("Error getting initial session:", error);
          setSession(null);
          setUser(null);
          setUserProfile(null);
        } else {
          setSession(session);
          setUser(session?.user || null);
          if (session?.user) {
            await fetchUserProfile(session.user);
          } else {
            setUserProfile(null);
          }
        }

        // Setăm loading la false după ce am obținut sesiunea
        if (isMounted) {
          setLoading(false);
        }

        // Codul de mai jos este dezactivat pentru a evita problemele cu sesiunea persistentă
        /*
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        // Verificăm dacă componenta este încă montată
        if (!isMounted) return;

        if (error) {
          console.error("Error getting initial session:", error);
          setSession(null);
          setUser(null);
          setUserProfile(null);
        } else {
          setSession(session);
          setUser(session?.user || null);
          if (session?.user) {
            await fetchUserProfile(session.user);
          } else {
            setUserProfile(null);
          }
        }
        */
      } catch (error) {
        console.error("Unexpected error getting initial session:", error);
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
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("AuthContext: Schimbare de stare de autentificare", _event);
      // Verificăm dacă componenta este încă montată
      if (!isMounted) return;

      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUserProfile(null);
      }
      // Ensure loading is false after auth state change
      setLoading(false);
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
    await authService.signOut();

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
