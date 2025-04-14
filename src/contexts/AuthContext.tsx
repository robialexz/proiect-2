import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { supabaseService, SupabaseErrorResponse } from "@/lib/supabase-service";
import { cacheService } from "@/lib/cache-service";

// Definim tipul pentru răspunsul de autentificare
type AuthResponse = {
  data: any;
  error: Error | SupabaseErrorResponse | null;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  userProfile: { displayName: string; email: string } | null;
  signIn: (
    email: string,
    password: string,
  ) => Promise<AuthResponse>;
  signUp: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<AuthResponse>;
  updateUserProfile: (displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<{
    displayName: string;
    email: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Adăugăm un timeout pentru a evita blocarea la "se încarcă..." - redus drastic pentru performanță mai bună
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log("Auth loading timeout reached after 2 seconds, forcing loading to false");
        setLoading(false);
        // Setăm un profil implicit în caz de timeout
        if (user && !userProfile) {
          const defaultProfile = {
            displayName: user.email?.split("@")[0] || "User",
            email: user.email || "",
          };
          setUserProfile(defaultProfile);

          // Salvăm profilul implicit în cache pentru a evita încărcarea repetată
          if (user.id) {
            const cacheKey = `user_profile_${user.id}`;
            cacheService.set(cacheKey, defaultProfile, { namespace: 'auth', ttl: 5 * 60 * 1000 });
          }
        }
      }
    }, 2000); // Mărim la 2 secunde pentru a da mai mult timp pentru încărcare

    console.log("AuthContext: Checking for existing session...");

    // Verificăm mai întâi dacă avem o sesiune în localStorage sau sessionStorage
    // În dezvoltare, verificăm ambele pentru compatibilitate
    const localSession = localStorage.getItem('supabase.auth.token') || sessionStorage.getItem('supabase.auth.token');
    if (localSession && import.meta.env.DEV) { // Folosim doar în dezvoltare pentru securitate
      try {
        const parsedSession = JSON.parse(localSession);
        if (parsedSession?.currentSession?.user) {
          // Verificăm dacă sesiunea nu a expirat
          if (parsedSession.expiresAt && parsedSession.expiresAt > Date.now()) {
            console.log("Found local session, using it");
            const userData = parsedSession.currentSession.user;
            setUser(userData);
            setSession(parsedSession.currentSession);

            // Încercăm să încărcăm profilul utilizatorului
            if (userData.id) {
              fetchUserProfile(userData.id).catch(error => {
                console.error("Error fetching user profile from local session:", error);
                // Setăm un profil implicit în caz de eroare
                const defaultProfile = {
                  displayName: userData.email?.split("@")[0] || "User",
                  email: userData.email || "",
                };
                setUserProfile(defaultProfile);
              });
            }
          } else {
            console.log("Local session expired, removing it");
            sessionStorage.removeItem('supabase.auth.token');
          }

          // Continuăm cu verificarea sesiunii la server pentru a o revalida
        }
      } catch (error) {
        console.error("Error parsing local session:", error);
        // În caz de eroare, ștergem sesiunea pentru a preveni probleme
        sessionStorage.removeItem('supabase.auth.token');
      }
    }

    // Get initial session using the improved service
    supabaseService.auth.getSession().then(async (response) => {
      console.log("AuthContext: Initial session check result:", {
        success: !!response.data?.session,
        error: response.error ? response.error.message : null
      });

      if (response.data?.session) {
        setSession(response.data.session);

        // Get user from session
        const userResponse = await supabaseService.auth.getUser();

        if (userResponse.data) {
          console.log("User found in session");
          setUser(userResponse.data);

          try {
            await fetchUserProfile(userResponse.data.id);
          } catch (error) {
            console.error("Error fetching user profile:", error);
            // Setăm un profil implicit în caz de eroare
            const defaultProfile = {
              displayName: userResponse.data.email?.split("@")[0] || "User",
              email: userResponse.data.email || "",
            };
            setUserProfile(defaultProfile);

            // Salvăm profilul implicit în cache pentru a evita încărcarea repetată
            const cacheKey = `user_profile_${userResponse.data.id}`;
            cacheService.set(cacheKey, defaultProfile, { namespace: 'auth', ttl: 5 * 60 * 1000 });
          }
        }
      } else {
        console.log("No active session found on server");
        // Dacă nu avem o sesiune activă pe server, dar avem una locală, încercăm să o revalidăm
        if (user && !session) {
          console.log("Attempting to revalidate local session");
          // Aici am putea încerca să revalidăm sesiunea locală dacă este necesar
        }
        setLoading(false);
      }
    }).catch(error => {
      console.error("Error checking initial session:", error);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        try {
          await fetchUserProfile(session.user.id);
        } catch (error) {
          console.error("Error fetching user profile on auth change:", error);
          // Setăm un profil implicit în caz de eroare
          setUserProfile({
            displayName: session.user.email?.split("@")[0] || "User",
            email: session.user.email || "",
          });
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Verificăm dacă este un utilizator de test
      if (userId.startsWith('test-user-id')) {
        console.log('Using test user profile');
        const defaultProfile = {
          displayName: user?.email?.split('@')[0] || 'Test User',
          email: user?.email || 'test@example.com',
        };
        setUserProfile(defaultProfile);
        return;
      }

      // Verificăm mai întâi dacă profilul este în cache
      const cacheKey = `user_profile_${userId}`;
      const cachedProfile = cacheService.get<{ displayName: string; email: string }>(cacheKey, { namespace: 'auth' });

      if (cachedProfile) {
        console.log('Using cached user profile');
        setUserProfile(cachedProfile);
        return;
      }

      // Dacă nu este în cache, îl încărcăm folosind serviciul îmbunătățit
      const response = await supabaseService.select('profiles', 'display_name, email', {
        filters: { id: userId },
        single: true
      });

      if (response.status === 'error') {
        console.warn('Error fetching user profile:', response.error);
        // Setăm un profil implicit în caz de eroare
        const defaultProfile = {
          displayName: user?.email?.split('@')[0] || 'User',
          email: user?.email || '',
        };
        setUserProfile(defaultProfile);

        // Salvăm profilul implicit în cache pentru a evita erori repetate
        cacheService.set(cacheKey, defaultProfile, { namespace: 'auth', ttl: 5 * 60 * 1000 });
        return;
      }

      if (response.data) {
        const data = response.data as any;
        const profile = {
          displayName: data.display_name || user?.email?.split('@')[0] || 'User',
          email: data.email || user?.email || '',
        };

        // Salvăm profilul în cache pentru utilizări viitoare
        cacheService.set(cacheKey, profile, { namespace: 'auth', ttl: 5 * 60 * 1000 }); // 5 minute TTL

        setUserProfile(profile);
      } else {
        // Profile should have been created by the trigger handle_new_user
        // If it's not found here, log an error, but don't attempt to create it again.
        console.warn(
          `Profile not found for user ${userId}. It should have been created by the trigger.`,
        );
        // Setăm un profil implicit în caz că nu există în baza de date
        const defaultProfile = {
          displayName: user?.email?.split('@')[0] || 'User',
          email: user?.email || '',
        };
        setUserProfile(defaultProfile);

        // Salvăm profilul implicit în cache pentru a evita erori repetate
        cacheService.set(cacheKey, defaultProfile, { namespace: 'auth', ttl: 5 * 60 * 1000 });
      }
    } catch (err) {
      console.error('Unexpected error fetching user profile:', err);
      // Setăm un profil implicit în caz de eroare
      const defaultProfile = {
        displayName: user?.email?.split('@')[0] || 'User',
        email: user?.email || '',
      };
      setUserProfile(defaultProfile);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log("AuthContext: signIn called with email:", email);
    try {
      console.log("AuthContext: Calling supabaseService.auth.signIn");

      // Folosim serviciul îmbunătățit pentru autentificare cu timeout îmbunătățit
      const response = await supabaseService.auth.signIn(email, password);

      console.log("AuthContext: signIn result:", {
        success: !!response.data?.session,
        error: response.error ? response.error.message : null,
        user: response.data?.user ? response.data.user.id : null
      });

      if (response.status === 'error') {
        console.error("AuthContext: Sign in error:", response.error.message);
        throw new Error(response.error.message);
      } else if (response.data?.session) {
        console.log("AuthContext: Sign in successful, session established");
        // Immediately update the session and user state
        setSession(response.data.session);
        setUser(response.data.user);
      } else {
        console.error("AuthContext: No session returned from authentication");
        throw new Error('No session returned from authentication');
      }

      // Try to fetch the user profile
      if (response && response.data && response.data.user) {
        try {
          await fetchUserProfile(response.data.user.id);
        } catch (profileError) {
          console.error("AuthContext: Error fetching profile after login:", profileError);
          // Set default profile
          setUserProfile({
            displayName: response.data.user.email?.split("@")[0] || "User",
            email: response.data.user.email || "",
          });
        }
      }

      return { data: response?.data?.session, error: response?.error };
    } catch (err) {
      console.error("AuthContext: Authentication error:", err);
      // Forțăm resetarea stării de încărcare în caz de eroare
      setLoading(false);
      return {
        data: null,
        error: new Error(
          err instanceof Error ? err.message : "Authentication failed. Please try again.",
        ),
      };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName?: string,
  ) => {
    try {
      // Folosim serviciul îmbunătățit pentru înregistrare
      const response = await supabaseService.auth.signUp(email, password);

      if (response.status === 'error') {
        console.error("Registration error:", response.error.message);
      } else if (response.data?.user) {
        // Create user profile with display name if provided
        const newProfile = {
          id: response.data.user.id,
          display_name: displayName || email.split("@")[0] || "User",
          email: email,
        };

        // Folosim serviciul îmbunătățit pentru a crea profilul utilizatorului
        const profileResponse = await supabaseService.insert('profiles', newProfile);

        if (profileResponse.status === 'error') {
          console.error("Error creating user profile:", profileResponse.error);
        }
      }

      return { data: response.data, error: response.error };
    } catch (err) {
      console.error("Supabase connection error:", err);
      return {
        data: { user: null, session: null },
        error: new Error(
          "Connection error. Please check your internet connection.",
        ),
      };
    }
  };

  const updateUserProfile = async (displayName: string) => {
    if (!user) return;

    try {
      // Folosim serviciul îmbunătățit pentru actualizarea profilului
      const response = await supabaseService.update(
        'profiles',
        { display_name: displayName },
        { id: user.id }
      );

      if (response.status === 'error') {
        console.error("Error updating user profile:", response.error);
        return;
      }

      // Actualizăm profilul în cache
      const cacheKey = `user_profile_${user.id}`;
      const cachedProfile = cacheService.get<{ displayName: string; email: string }>(cacheKey, { namespace: 'auth' });

      if (cachedProfile) {
        cacheService.set(
          cacheKey,
          { displayName, email: cachedProfile.email },
          { namespace: 'auth' }
        );
      }

      setUserProfile((prev) => (prev ? { ...prev, displayName } : null));
    } catch (err) {
      console.error("Unexpected error updating user profile:", err);
    }
  };

  const signOut = async () => {
    // Folosim serviciul îmbunătățit pentru deconectare
    const response = await supabaseService.auth.signOut();

    if (response.status === 'error') {
      console.error('Error signing out:', response.error);
    }

    // Curățăm cache-ul pentru autentificare
    cacheService.clearNamespace('auth');
  };

  const value = {
    session,
    user,
    userProfile,
    signIn,
    signUp,
    updateUserProfile,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
