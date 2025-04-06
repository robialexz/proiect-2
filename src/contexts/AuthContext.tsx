import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";

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
      // Adăugăm un timeout pentru fetchUserProfile
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Profile fetch timeout")), 15000); // Mărim timeout-ul la 15 secunde
      });

      // Creăm promisiunea pentru fetch
      const fetchPromise = supabase
        .from("profiles")
        .select("display_name, email")
        .eq("id", userId)
        .single();

      // Folosim Promise.race pentru a implementa timeout
      const { data, error } = await Promise.race([
        fetchPromise,
        timeoutPromise.then(() => {
          throw new Error("Profile fetch timeout");
        })
      ]) as any;

      if (error) {
        console.warn("Error fetching user profile:", error);
        // Setăm un profil implicit în caz de eroare
        setUserProfile({
          displayName: user?.email?.split("@")[0] || "User",
          email: user?.email || "",
        });
        return;
      }

      if (data) {
        setUserProfile({
          displayName:
            data.display_name || user?.email?.split("@")[0] || "User",
          email: data.email || user?.email || "",
        });
      } else {
        // Profile should have been created by the trigger handle_new_user
        // If it's not found here, log an error, but don't attempt to create it again.
        console.warn(
          `Profile not found for user ${userId}. It should have been created by the trigger.`,
        );
        // Set a default profile or handle as needed
        setUserProfile({
          displayName: user?.email?.split("@")[0] || "User",
          email: user?.email || "",
        });
      }
    } catch (err) {
      console.error("Unexpected error fetching user profile:", err);
      // Setăm un profil implicit în caz de eroare
      setUserProfile({
        displayName: user?.email?.split("@")[0] || "User",
        email: user?.email || "",
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log("AuthContext: signIn called with email:", email);
    try {
      console.log("AuthContext: Calling supabase.auth.signInWithPassword");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("AuthContext: signInWithPassword result:", {
        success: !!data?.session,
        error: error ? error.message : null,
        user: data?.user ? data.user.id : null
      });

      if (error) {
        console.error("AuthContext: Sign in error:", error.message);
      } else if (data.session) {
        console.log("AuthContext: Sign in successful, session established");
        // Immediately update the session and user state
        setSession(data.session);
        setUser(data.user);

        // Try to fetch the user profile
        if (data.user) {
          try {
            await fetchUserProfile(data.user.id);
          } catch (profileError) {
            console.error("AuthContext: Error fetching profile after login:", profileError);
            // Set default profile
            setUserProfile({
              displayName: data.user.email?.split("@")[0] || "User",
              email: data.user.email || "",
            });
          }
        }
      }

      return { data: data.session, error };
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("Registration error:", error.message);
      } else if (data.user) {
        // Create user profile with display name if provided
        const newProfile = {
          id: data.user.id,
          display_name: displayName || email.split("@")[0] || "User",
          email: email,
        };

        const { error: profileError } = await supabase
          .from("profiles")
          .insert([newProfile]);

        if (profileError) {
          console.error("Error creating user profile:", profileError);
        }
      }

      return { data, error };
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
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating user profile:", error);
        return;
      }

      setUserProfile((prev) => (prev ? { ...prev, displayName } : null));
    } catch (err) {
      console.error("Unexpected error updating user profile:", err);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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
