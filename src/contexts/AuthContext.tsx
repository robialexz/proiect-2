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
  signIn: (email: string, password: string) => Promise<AuthResponse>;
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

  // Ascultăm evenimentul de forțare a reîmprospătării sesiunii
  useEffect(() => {
    const handleForceSessionRefresh = (event: any) => {
      console.log("AuthContext: Received force-session-refresh event");
      if (event.detail?.session) {
        console.log("AuthContext: Restoring session from event");

        // Folosim un setTimeout pentru a ne asigura că actualizările de stare nu se întâmplă în timpul render-ului
        setTimeout(() => {
          try {
            setSession(event.detail.session);
            setUser(event.detail.session.user);
            setLoading(false);

            // Salvăm sesiunea în localStorage și sessionStorage pentru a asigura persistența
            try {
              const sessionData = {
                currentSession: event.detail.session,
                expiresAt: Date.now() + 3600 * 1000, // 1 oră valabilitate
              };
              localStorage.setItem(
                "supabase.auth.token",
                JSON.stringify(sessionData),
              );
              sessionStorage.setItem(
                "supabase.auth.token",
                JSON.stringify(sessionData),
              );
              console.log("Session saved to storage from event");
            } catch (storageError) {
              console.error(
                "Error saving session to storage from event:",
                storageError,
              );
            }

            // Încercăm să încărcăm profilul utilizatorului
            if (event.detail.session.user?.id) {
              fetchUserProfile(event.detail.session.user.id).catch((error) => {
                console.error("Error fetching user profile from event:", error);
                // Setăm un profil implicit în caz de eroare
                const defaultProfile = {
                  displayName:
                    event.detail.session.user.email?.split("@")[0] || "User",
                  email: event.detail.session.user.email || "",
                };
                setUserProfile(defaultProfile);
              });
            }

            // Notificăm AppLayout că sesiunea a fost restaurată cu succes
            window.dispatchEvent(
              new CustomEvent("session-restored", {
                detail: { success: true },
              }),
            );
          } catch (error) {
            console.error("Error processing session from event:", error);
          }
        }, 0);
      }
    };

    // Adaugăm listener pentru eveniment
    window.addEventListener("force-session-refresh", handleForceSessionRefresh);

    // Adăugăm și un listener pentru evenimentul de actualizare a sesiunii de la Supabase
    window.addEventListener(
      "supabase-session-update",
      handleForceSessionRefresh,
    );

    // Curățăm listener-urile la demontare
    return () => {
      window.removeEventListener(
        "force-session-refresh",
        handleForceSessionRefresh,
      );
      window.removeEventListener(
        "supabase-session-update",
        handleForceSessionRefresh,
      );
    };
  }, []);

  useEffect(() => {
    // DEBUG LOGGING: Track session/user on mount and on change
    console.log("[AuthContext] Session:", session);
    console.log("[AuthContext] User:", user);
    console.log("[AuthContext] UserProfile:", userProfile);
    console.log("[AuthContext] Loading:", loading);
    try {
      const localToken = localStorage.getItem("supabase.auth.token");
      const sessionToken = sessionStorage.getItem("supabase.auth.token");
      console.log("[AuthContext] localStorage token:", localToken);
      console.log("[AuthContext] sessionStorage token:", sessionToken);
    } catch (e) {
      console.error("[AuthContext] Error reading storage:", e);
    }
  }, [session, user, userProfile, loading]);

  useEffect(() => {
    // DEBUG LOGGING: Try to restore session from storage if lost
    if (!session || !user) {
      try {
        const stored = localStorage.getItem("supabase.auth.token") || sessionStorage.getItem("supabase.auth.token");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.currentSession) {
            setSession(parsed.currentSession);
            setUser(parsed.currentSession.user);
            setLoading(false);
            console.log("[AuthContext] Restored session from storage fallback.");
          }
        }
      } catch (e) {
        console.error("[AuthContext] Error restoring session from storage:", e);
      }
    }
  }, [session, user]);

  useEffect(() => {
    // Adăugăm un timeout pentru a evita blocarea la "se încarcă..." - redus drastic pentru performanță mai bună
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log(
          "Auth loading timeout reached after 2 seconds, forcing loading to false",
        );
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
            cacheService.set(cacheKey, defaultProfile, {
              namespace: "auth",
              ttl: 5 * 60 * 1000,
            });
          }
        }
      }
    }, 2000); // Mărim la 2 secunde pentru a da mai mult timp pentru încărcare

    console.log("AuthContext: Checking for existing session...");

    // Verificăm mai întâi dacă avem o sesiune în localStorage sau sessionStorage
    // Verificăm ambele pentru compatibilitate
    const localSession =
      localStorage.getItem("supabase.auth.token") ||
      sessionStorage.getItem("supabase.auth.token");
    if (localSession) {
      // Folosim în orice mediu pentru a asigura persistența sesiunii
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
              fetchUserProfile(userData.id).catch((error) => {
                console.error(
                  "Error fetching user profile from local session:",
                  error,
                );
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
            sessionStorage.removeItem("supabase.auth.token");
          }

          // Continuăm cu verificarea sesiunii la server pentru a o revalida
        }
      } catch (error) {
        console.error("Error parsing local session:", error);
        // În caz de eroare, ștergem sesiunea pentru a preveni probleme
        sessionStorage.removeItem("supabase.auth.token");
      }
    }

    // Get initial session using the improved service
    supabaseService.auth
      .getSession()
      .then(async (response) => {
        console.log("AuthContext: Initial session check result:", {
          success: !!response.data?.session,
          error: response.error ? response.error.message : null,
        });

        if (response.data?.session) {
          setSession(response.data.session);

          // Salvăm sesiunea în localStorage și sessionStorage pentru a asigura persistența
          try {
            const sessionData = {
              currentSession: response.data.session,
              expiresAt: Date.now() + 3600 * 1000, // 1 oră valabilitate
            };
            localStorage.setItem(
              "supabase.auth.token",
              JSON.stringify(sessionData),
            );
            sessionStorage.setItem(
              "supabase.auth.token",
              JSON.stringify(sessionData),
            );
            console.log("Session saved to storage");
          } catch (storageError) {
            console.error("Error saving session to storage:", storageError);
          }

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
              cacheService.set(cacheKey, defaultProfile, {
                namespace: "auth",
                ttl: 5 * 60 * 1000,
              });
            }
          }
        } else {
          console.log("No active session found on server");
          // Dacă nu avem o sesiune activă pe server, dar avem una locală, încercăm să o revalidăm
          if (user && !session) {
            console.log("Attempting to revalidate local session");
            try {
              // Încercăm să reîmprospătăm sesiunea
              const { data: refreshData } =
                await supabase.auth.refreshSession();

              if (refreshData?.session) {
                console.log("Session refreshed successfully");
                setSession(refreshData.session);

                // Salvăm sesiunea reîmprospătată
                const sessionData = {
                  currentSession: refreshData.session,
                  expiresAt: Date.now() + 3600 * 1000, // 1 oră valabilitate
                };

                localStorage.setItem(
                  "supabase.auth.token",
                  JSON.stringify(sessionData),
                );
                sessionStorage.setItem(
                  "supabase.auth.token",
                  JSON.stringify(sessionData),
                );
              }
            } catch (refreshError) {
              console.error("Error refreshing session:", refreshError);
            }
          }
          setLoading(false);
        }
      })
      .catch((error) => {
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
      if (userId.startsWith("test-user-id")) {
        console.log("Using test user profile");
        const defaultProfile = {
          displayName: user?.email?.split("@")[0] || "Test User",
          email: user?.email || "test@example.com",
        };
        setUserProfile(defaultProfile);
        return;
      }

      // Verificăm mai întâi dacă profilul este în cache
      const cacheKey = `user_profile_${userId}`;
      const cachedProfile = cacheService.get<{
        displayName: string;
        email: string;
      }>(cacheKey, { namespace: "auth" });

      if (cachedProfile) {
        console.log("Using cached user profile");
        setUserProfile(cachedProfile);
        return;
      }

      // Dacă nu este în cache, îl încărcăm folosind serviciul îmbunătățit
      const response = await supabaseService.select(
        "profiles",
        "display_name, email",
        {
          filters: { id: userId },
          single: true,
        },
      );

      if (response.status === "error") {
        console.warn("Error fetching user profile:", response.error);
        // Setăm un profil implicit în caz de eroare
        const defaultProfile = {
          displayName: user?.email?.split("@")[0] || "User",
          email: user?.email || "",
        };
        setUserProfile(defaultProfile);

        // Salvăm profilul implicit în cache pentru a evita erori repetate
        cacheService.set(cacheKey, defaultProfile, {
          namespace: "auth",
          ttl: 5 * 60 * 1000,
        });
        return;
      }

      if (response.data) {
        const data = response.data as any;
        const profile = {
          displayName:
            data.display_name || user?.email?.split("@")[0] || "User",
          email: data.email || user?.email || "",
        };

        // Salvăm profilul în cache pentru utilizări viitoare
        cacheService.set(cacheKey, profile, {
          namespace: "auth",
          ttl: 5 * 60 * 1000,
        }); // 5 minute TTL

        setUserProfile(profile);
      } else {
        // Profile should have been created by the trigger handle_new_user
        // If it's not found here, log an error, but don't attempt to create it again.
        console.warn(
          `Profile not found for user ${userId}. It should have been created by the trigger.`,
        );
        // Setăm un profil implicit în caz că nu există în baza de date
        const defaultProfile = {
          displayName: user?.email?.split("@")[0] || "User",
          email: user?.email || "",
        };
        setUserProfile(defaultProfile);

        // Salvăm profilul implicit în cache pentru a evita erori repetate
        cacheService.set(cacheKey, defaultProfile, {
          namespace: "auth",
          ttl: 5 * 60 * 1000,
        });
      }
    } catch (err) {
      console.error("Unexpected error fetching user profile:", err);
      // Setăm un profil implicit în caz de eroare
      const defaultProfile = {
        displayName: user?.email?.split("@")[0] || "User",
        email: user?.email || "",
      };
      setUserProfile(defaultProfile);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Folosim serviciul îmbunătățit pentru autentificare
      const response = await supabaseService.auth.signIn(email, password);

      if (response.status === "error") {
        setLoading(false);
        return { data: null, error: response.error };
      }

      // Salvăm sesiunea în localStorage și sessionStorage dacă există
      if (response.data?.session) {
        const sessionData = {
          currentSession: response.data.session,
          expiresAt: Date.now() + 3600 * 1000, // 1 oră valabilitate
        };
        try {
          localStorage.setItem("supabase.auth.token", JSON.stringify(sessionData));
          sessionStorage.setItem("supabase.auth.token", JSON.stringify(sessionData));
          console.log("[AuthContext] Session saved to storage after login");
        } catch (storageError) {
          console.error("[AuthContext] Error saving session after login:", storageError);
        }
      }

      // Setăm sesiunea și userul în context
      setSession(response.data?.session || null);
      setUser(response.data?.user || null);
      setLoading(false);

      // Încercăm să încărcăm profilul utilizatorului
      if (response.data?.user?.id) {
        fetchUserProfile(response.data.user.id).catch((error) => {
          console.error("Error fetching user profile after login:", error);
          // Setăm un profil implicit în caz de eroare
          const defaultProfile = {
            displayName: response.data.user.email?.split("@")[0] || "User",
            email: response.data.user.email || "",
          };
          setUserProfile(defaultProfile);
        });
      }

      return { data: response.data, error: null };
    } catch (err) {
      console.error("AuthContext: Authentication error:", err);
      // Forțăm resetarea stării de încărcare în caz de eroare
      setLoading(false);
      return {
        data: null,
        error: new Error(
          err instanceof Error
            ? err.message
            : "Authentication failed. Please try again.",
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

      if (response.status === "error") {
        console.error("Registration error:", response.error.message);
      } else if (response.data?.user) {
        // Create user profile with display name if provided
        const newProfile = {
          id: response.data.user.id,
          display_name: displayName || email.split("@")[0] || "User",
          email: email,
        };

        // Folosim serviciul îmbunătățit pentru a crea profilul utilizatorului
        const profileResponse = await supabaseService.insert(
          "profiles",
          newProfile,
        );

        if (profileResponse.status === "error") {
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
        "profiles",
        { display_name: displayName },
        { id: user.id },
      );

      if (response.status === "error") {
        console.error("Error updating user profile:", response.error);
        return;
      }

      // Actualizăm profilul în cache
      const cacheKey = `user_profile_${user.id}`;
      const cachedProfile = cacheService.get<{
        displayName: string;
        email: string;
      }>(cacheKey, { namespace: "auth" });

      if (cachedProfile) {
        cacheService.set(
          cacheKey,
          { displayName, email: cachedProfile.email },
          { namespace: "auth" },
        );
      }

      setUserProfile((prev) => (prev ? { ...prev, displayName } : null));
    } catch (err) {
      console.error("Unexpected error updating user profile:", err);
    }
  };

  const signOut = async () => {
    // Setăm flag-ul pentru deconectare intenționată înainte de a șterge sesiunea
    try {
      sessionStorage.setItem('intentional_signout', 'true');
      console.log("Set intentional_signout flag before logout");
    } catch (error) {
      console.error("Error setting intentional_signout flag:", error);
    }

    // Folosim serviciul îmbunătățit pentru deconectare
    const response = await supabaseService.auth.signOut();

    if (response.status === "error") {
      console.error("Error signing out:", response.error);
    }

    // Ștergem sesiunea din localStorage și sessionStorage
    try {
      localStorage.removeItem("supabase.auth.token");
      sessionStorage.removeItem("supabase.auth.token");
      console.log("Session removed from storage after logout");
    } catch (storageError) {
      console.error("Error removing session from storage:", storageError);
    }

    // Curățăm cache-ul pentru autentificare
    cacheService.clearNamespace("auth");

    // Resetăm starea
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
