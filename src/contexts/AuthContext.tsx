import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { supabaseService, SupabaseErrorResponse } from "@/lib/supabase-service";
import { cacheService } from "@/lib/cache-service"; // Keep cacheService for profile caching

// Definim tipul pentru răspunsul de autentificare
type AuthResponse = {
  data: {
    user: User | null;
    session: Session | null;
  } | null;
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
  updateUserProfile: (displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook pentru a folosi contextul de autentificare
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
  const [loading, setLoading] = useState(true); // Keep loading state

  // Helper function to fetch and set user profile (memoized)
  const fetchUserProfile = useCallback(
    async (userId: string, currentUser: User | null) => {
      // Use currentUser directly if passed, otherwise fallback to state (less ideal)
      const emailForDefault = currentUser?.email || user?.email || "";
      const defaultDisplayName = emailForDefault.split("@")[0] || "User";

      try {
        // Handle test users separately
        if (userId.startsWith("test-user-id")) {
          console.log("AuthContext: Using test user profile");
          setUserProfile({
            displayName: defaultDisplayName,
            email: emailForDefault,
          });
          return;
        }

        // Check cache first
        const cacheKey = `user_profile_${userId}`;
        const cachedProfile = cacheService.get<{
          displayName: string;
          email: string;
        }>(cacheKey, { namespace: "auth" });

        if (cachedProfile) {
          console.log("AuthContext: Using cached user profile");
          setUserProfile(cachedProfile);
          return;
        }

        console.log("AuthContext: Fetching user profile from Supabase");
        // Fetch from Supabase if not cached
        const response = await supabaseService.select(
          "profiles",
          "display_name, email",
          {
            filters: { id: userId },
            single: true,
          }
        );

        if (response.status === "error") {
          console.warn(
            "AuthContext: Error fetching user profile:",
            response.error
          );
          const defaultProfile = {
            displayName: defaultDisplayName,
            email: emailForDefault,
          };
          setUserProfile(defaultProfile);
          // Cache default profile on error to avoid repeated fetches
          cacheService.set(cacheKey, defaultProfile, {
            namespace: "auth",
            ttl: 5 * 60 * 1000,
          });
          return;
        }

        if (response.data) {
          const data = response.data as any;
          const profile = {
            displayName: data.display_name || defaultDisplayName,
            email: data.email || emailForDefault,
          };
          console.log("AuthContext: Caching fetched user profile");
          cacheService.set(cacheKey, profile, {
            namespace: "auth",
            ttl: 5 * 60 * 1000,
          }); // 5 minute TTL
          setUserProfile(profile);
        } else {
          console.warn(
            `AuthContext: Profile not found for user ${userId}. It should have been created by a trigger.`
          );
          const defaultProfile = {
            displayName: defaultDisplayName,
            email: emailForDefault,
          };
          setUserProfile(defaultProfile);
          // Cache default profile if not found
          cacheService.set(cacheKey, defaultProfile, {
            namespace: "auth",
            ttl: 5 * 60 * 1000,
          });
        }
      } catch (err) {
        console.error(
          "AuthContext: Unexpected error fetching user profile:",
          err
        );
        const defaultProfile = {
          displayName: defaultDisplayName,
          email: emailForDefault,
        };
        setUserProfile(defaultProfile);
      }
    },
    [user?.email] // Dependency on user.email for default value generation
  );

  // Effect to listen for session updates from the custom event
  useEffect(() => {
    const handleSessionUpdate = (event: any) => {
      const newSession = event.detail?.session as Session | null;
      console.log("AuthContext: Received supabase-session-update", newSession);

      setSession(newSession);
      const currentUser = newSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        fetchUserProfile(currentUser.id, currentUser).catch((error) => {
          console.error(
            "Error fetching user profile on session update:",
            error
          );
        });
      } else {
        setUserProfile(null);
        cacheService.clearNamespace("auth"); // Clear profile cache on sign out
      }
      setLoading(false); // Ensure loading is false after session update
    };

    window.addEventListener("supabase-session-update", handleSessionUpdate);

    return () => {
      window.removeEventListener(
        "supabase-session-update",
        handleSessionUpdate
      );
    };
  }, [fetchUserProfile]); // Include fetchUserProfile in dependency array

  // Effect for initial session check on mount
  useEffect(() => {
    console.log("AuthContext: Performing initial session check...");
    setLoading(true); // Start in loading state

    supabaseService.auth
      .getSession()
      .then(async (response) => {
        console.log("AuthContext: Initial session check result:", {
          success: !!response.data?.session,
          error: response.error ? response.error.message : null,
        });

        const initialSession = response.data?.session;
        // The event listener above will handle setting the state if a session is found
        // We just need to ensure loading is set to false if no session is found initially
        if (!initialSession) {
          setSession(null);
          setUser(null);
          setUserProfile(null);
          setLoading(false);
        }
        // If a session *is* found, the 'supabase-session-update' event listener
        // (triggered by onAuthStateChange in supabase.ts or the initial getSession)
        // will handle setting the session, user, profile, and loading state.
      })
      .catch((error) => {
        console.error("AuthContext: Error checking initial session:", error);
        setSession(null);
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      });

    // Timeout to prevent getting stuck in loading state
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn(
          "AuthContext: Loading timeout reached after 5 seconds, forcing loading to false"
        );
        setLoading(false);
      }
    }, 5000); // 5 seconds timeout

    return () => {
      clearTimeout(timeoutId);
    };
    // Run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Sign In / Sign Up / Sign Out Methods ---

  const signIn = async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const response = await supabaseService.auth.signIn(email, password);

      if (response.status === "error" || !response.data?.session) {
        setLoading(false);
        // Ensure state is cleared on failed login
        setSession(null);
        setUser(null);
        setUserProfile(null);
        return {
          data: null,
          error: response.error || new Error("Sign in failed."),
        };
      }

      // Session state will be updated by the 'supabase-session-update' event listener.
      // We only need to set the newLoginDetected flag here.
      try {
        sessionStorage.setItem("newLoginDetected", "true");
        console.log("[AuthContext] Set newLoginDetected flag");
      } catch (storageError) {
        console.error(
          "[AuthContext] Error setting newLoginDetected flag:",
          storageError
        );
      }

      // setLoading(false) will be handled by the event listener
      return { data: response.data, error: null };
    } catch (err) {
      console.error("AuthContext: Authentication error:", err);
      setLoading(false);
      setSession(null);
      setUser(null);
      setUserProfile(null);
      return {
        data: null,
        error: new Error(
          err instanceof Error
            ? err.message
            : "Authentication failed. Please try again."
        ),
      };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<AuthResponse> => {
    setLoading(true);
    try {
      // Use the improved service for registration
      const response = await supabaseService.auth.signUp(email, password);

      if (response.status === "error") {
        console.error("Registration error:", response.error?.message);
        setLoading(false);
        return { data: null, error: response.error };
      }

      // Profile creation should ideally be handled by a DB trigger (handle_new_user)
      // If not, uncomment and adapt the following block:
      /*
      else if (response.data?.user) {
        // Create user profile with display name if provided
        const newProfile = {
          id: response.data.user.id,
          display_name: displayName || email.split("@")[0] || "User",
          email: email,
        };
        const profileResponse = await supabaseService.insert(
          "profiles",
          newProfile
        );
        if (profileResponse.status === "error") {
          console.error("Error creating user profile:", profileResponse.error);
          // Decide how to handle profile creation failure - maybe sign out the user?
        }
      }
      */

      setLoading(false); // Set loading false after sign up attempt
      // The user might need email confirmation, session state might not change immediately.
      return { data: response.data, error: response.error };
    } catch (err) {
      console.error(
        "AuthContext: Supabase connection error during sign up:",
        err
      );
      setLoading(false);
      return {
        data: null,
        error: new Error(
          "Connection error during sign up. Please check your internet connection."
        ),
      };
    }
  };

  const updateUserProfile = async (displayName: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await supabaseService.update(
        "profiles",
        { display_name: displayName },
        { id: user.id }
      );

      if (response.status === "error") {
        console.error("Error updating user profile:", response.error);
        setLoading(false);
        return;
      }

      // Update profile in cache
      const cacheKey = `user_profile_${user.id}`;
      const cachedProfile = cacheService.get<{
        displayName: string;
        email: string;
      }>(cacheKey, { namespace: "auth" });

      const updatedProfileData = {
        displayName,
        email: cachedProfile?.email || user.email || "",
      };

      cacheService.set(cacheKey, updatedProfileData, { namespace: "auth" });
      setUserProfile(updatedProfileData); // Update local state
      setLoading(false);
    } catch (err) {
      console.error("Unexpected error updating user profile:", err);
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    // Set intentional sign out flag for supabase.ts listener
    try {
      sessionStorage.setItem("intentional_signout", "true");
      console.log("AuthContext: Set intentional_signout flag before logout");
    } catch (error) {
      console.error(
        "AuthContext: Error setting intentional_signout flag:",
        error
      );
    }

    const response = await supabaseService.auth.signOut();

    if (response.status === "error") {
      console.error("AuthContext: Error signing out:", response.error);
    }

    // State updates (session, user, profile to null) and cache clearing
    // will be handled by the 'supabase-session-update' event listener.
    // We just ensure loading is set to false eventually.
    setLoading(false); // Set loading false after signout attempt
  };

  // --- Context Value ---

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
