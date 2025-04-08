import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { supabaseService } from "@/lib/supabase-service";
import { cacheService } from "@/lib/cache-service";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  userProfile: { displayName: string; email: string } | null;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signUp: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null };
  }>;
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
    // Adăugăm un timeout pentru a evita blocarea la "se încarcă..."
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log("Auth loading timeout reached, forcing loading to false");
        setLoading(false);
        // Setăm un profil implicit în caz de timeout
        if (user && !userProfile) {
          setUserProfile({
            displayName: user.email?.split("@")[0] || "User",
            email: user.email || "",
          });
        }
      }
    }, 20000); // 20 secunde timeout

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        try {
          await fetchUserProfile(session.user.id);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // Setăm un profil implicit în caz de eroare
          setUserProfile({
            displayName: session.user.email?.split("@")[0] || "User",
            email: session.user.email || "",
          });
        }
      }

      setLoading(false);
    }).catch(error => {
      console.error("Error getting session:", error);
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
      // Verificăm mai întâi dacă profilul este în cache
      const cacheKey = `user_profile_${userId}`;
      const cachedProfile = cacheService.get(cacheKey, { namespace: 'auth' });

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
        // Set a default profile or handle as needed
        const defaultProfile = {
          displayName: user?.email?.split('@')[0] || 'User',
          email: user?.email || '',
        };
        setUserProfile(defaultProfile);
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

      // Folosim serviciul îmbunătățit pentru autentificare
      const response = await supabaseService.auth.signIn(email, password);

      console.log("AuthContext: signIn result:", {
        success: !!response.data?.session,
        error: response.error ? response.error.message : null,
        user: response.data?.user ? response.data.user.id : null
      });

      if (response.status === 'error') {
        console.error("AuthContext: Sign in error:", response.error.message);
      } else if (response.data?.session) {
        console.log("AuthContext: Sign in successful, session established");
        // Immediately update the session and user state
        setSession(response.data.session);
        setUser(response.data.user);

        // Try to fetch the user profile
        if (response.data.user) {
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
      }

      return { data: response.data?.session, error: response.error };
    } catch (err) {
      console.error("AuthContext: Supabase connection error:", err);
      return {
        data: null,
        error: new Error(
          "Connection error. Please check your internet connection.",
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
      const cachedProfile = cacheService.get(cacheKey, { namespace: 'auth' });

      if (cachedProfile) {
        cacheService.set(
          cacheKey,
          { ...cachedProfile, displayName },
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
