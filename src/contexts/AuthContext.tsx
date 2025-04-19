import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { authService } from "@/services/auth/auth-service";
import { SupabaseErrorResponse } from "@/services/api/supabase-service";

// Definim tipul pentru răspunsul de autentificare
type AuthResponse = {
  data: any;
  error: Error | SupabaseErrorResponse | null;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  userProfile: { displayName: string; email: string } | null;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  loading: boolean;
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
  const [userProfile, setUserProfile] = useState<{
    displayName: string;
    email: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Funcție pentru a obține profilul utilizatorului
  const fetchUserProfile = async (user: User) => {
    try {
      // În aplicația reală, aici am obține profilul utilizatorului din baza de date
      // De exemplu: const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();

      // Pentru moment, creăm un profil simplu bazat pe email
      if (user?.email) {
        setUserProfile({
          displayName: user.email.split("@")[0],
          email: user.email,
        });
      }
    } catch (error) {
      console.error("Eroare la obținerea profilului:", error);
    }
  };

  // Verificăm sesiunea la încărcarea componentei
  useEffect(() => {
    // Variabilă pentru a ține evidența dacă componenta este montată
    let isMounted = true;

    // Verificăm mai întâi dacă avem o sesiune în localStorage pentru a evita întârzierea
    const checkLocalSession = () => {
      try {
        const storedSession = localStorage.getItem("supabase.auth.token");
        if (storedSession) {
          try {
            const parsedSession = JSON.parse(storedSession);
            if (
              parsedSession.currentSession &&
              parsedSession.expiresAt > Date.now()
            ) {
              // Avem o sesiune validă în localStorage, o folosim temporar
              setSession(parsedSession.currentSession);
              setUser(parsedSession.currentSession.user || null);

              if (parsedSession.currentSession.user) {
                // Setăm un profil temporar bazat pe email
                if (parsedSession.currentSession.user.email) {
                  setUserProfile({
                    displayName:
                      parsedSession.currentSession.user.email.split("@")[0],
                    email: parsedSession.currentSession.user.email,
                  });
                }
              }

              // Setăm loading la false pentru a permite afișarea dashboard-ului
              setLoading(false);

              // Vom verifica totuși sesiunea cu serverul în background
              return true;
            }
          } catch (e) {
            console.error("Eroare la parsarea sesiunii din localStorage:", e);
          }
        }
        return false;
      } catch (e) {
        console.error("Eroare la accesarea localStorage:", e);
        return false;
      }
    };

    const checkSession = async () => {
      try {
        const { data } = await authService.getSession();

        // Verificăm dacă componenta este încă montată
        if (!isMounted) return;

        setSession(data.session);
        setUser(data.session?.user || null);

        if (data.session?.user) {
          await fetchUserProfile(data.session.user);
        }
      } catch (error) {
        // Limităm logging-ul pentru a îmbunătăți performanța
        if (process.env.NODE_ENV !== "production") {
          console.error("Eroare la verificarea sesiunii:", error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Încercam mai întâi să folosim sesiunea din localStorage
    checkLocalSession();

    // Verificăm oricum sesiunea cu serverul, dar nu mai blocăm UI-ul dacă avem deja o sesiune locală
    checkSession();

    // Ascultăm pentru schimbări de autentificare
    // Folosim o variabilă pentru a stoca subscripția
    let authSubscription: { unsubscribe: () => void } | null = null;

    const setupAuthListener = () => {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        // Verificăm dacă componenta este încă montată
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUserProfile(null);
        }
      });

      authSubscription = subscription;
    };

    setupAuthListener();

    // Curățăm listener-ul la demontare
    return () => {
      isMounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

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
    setSession(null);
    setUser(null);
    setUserProfile(null);
  };

  const value = {
    session,
    user,
    userProfile,
    signIn,
    signUp,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
