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
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }

      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, email")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }

      if (data) {
        setUserProfile({
          displayName:
            data.display_name || user?.email?.split("@")[0] || "User",
          email: data.email || user?.email || "",
        });
      } else {
        // Create a profile if it doesn't exist
        const newProfile = {
          id: userId,
          display_name: user?.email?.split("@")[0] || "User",
          email: user?.email || "",
        };

        const { error: insertError } = await supabase
          .from("profiles")
          .insert([newProfile]);

        if (insertError) {
          console.error("Error creating user profile:", insertError);
        } else {
          setUserProfile({
            displayName: newProfile.display_name,
            email: newProfile.email,
          });
        }
      }
    } catch (err) {
      console.error("Unexpected error fetching user profile:", err);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Authentication error:", error.message);
      }

      return { data: data.session, error };
    } catch (err) {
      console.error("Supabase connection error:", err);
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
