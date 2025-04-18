import { createClient } from "@supabase/supabase-js";
import { type Database } from "@/types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
}

// Optimized client configuration for better performance and reliability
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: "supabase.auth.token",
    storage: {
      getItem: (key) => {
        console.log("Supabase client: Getting session from storage", key);
        // Încercăm să obținem sesiunea din localStorage sau sessionStorage
        const localData = window.localStorage.getItem(key);
        const sessionData = window.sessionStorage.getItem(key);
        const data = localData || sessionData;

        if (data) {
          // Verificăm dacă sesiunea a expirat
          try {
            const parsed = JSON.parse(data);
            if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
              console.log("Session expired, removing from storage");
              window.localStorage.removeItem(key);
              window.sessionStorage.removeItem(key);
              return null;
            }

            // Verificăm dacă avem o sesiune validă
            if (parsed.currentSession && parsed.currentSession.access_token) {
              console.log("Valid session found in storage");

              // Verificăm dacă suntem în modul de dezvoltare și avem conturi de test activate
              if (
                import.meta.env.DEV &&
                import.meta.env.VITE_ENABLE_TEST_ACCOUNTS === "true"
              ) {
                // Verificăm dacă este un cont de test
                if (
                  parsed.currentSession.user?.email?.includes("test") ||
                  parsed.currentSession.user?.email?.includes("demo") ||
                  parsed.currentSession.user?.email?.includes("admin")
                ) {
                  console.log("Test account detected in development mode");
                  // Prelungim automat valabilitatea sesiunii pentru conturile de test în modul de dezvoltare
                  parsed.expiresAt = Date.now() + 24 * 3600 * 1000; // 24 ore valabilitate
                  const updatedData = JSON.stringify(parsed);
                  window.localStorage.setItem(key, updatedData);
                  window.sessionStorage.setItem(key, updatedData);
                  return updatedData;
                }
              }

              return data;
            }
          } catch (e) {
            console.error("Error parsing session data:", e);
          }
        }

        return data;
      },
      setItem: (key, value) => {
        console.log("Supabase client: Setting session in storage", key);
        // Salvăm sesiunea în ambele storage-uri pentru compatibilitate
        try {
          // Verificăm dacă valoarea este validă
          let parsed;
          try {
            parsed = JSON.parse(value);
          } catch (parseError) {
            console.error("Error parsing session value:", parseError);
            // Dacă nu putem parsa, salvăm valoarea așa cum este
            window.localStorage.setItem(key, value);
            window.sessionStorage.setItem(key, value);
            return;
          }

          // Verificăm dacă avem o sesiune validă
          if (parsed && typeof parsed === "object") {
            // Verificăm dacă este formatul vechi (cu currentSession) sau formatul nou (direct sesiune)
            const hasCurrentSession =
              parsed.currentSession && parsed.currentSession.access_token;
            const hasDirectSession = parsed.access_token;

            if (!hasCurrentSession && !hasDirectSession) {
              console.warn("Attempting to store invalid session data");
            }

            // Adăugăm un timestamp de expirare dacă nu există
            if (!parsed.expiresAt && hasCurrentSession) {
              parsed.expiresAt = Date.now() + 24 * 3600 * 1000; // 24 ore valabilitate
              value = JSON.stringify(parsed);
            }

            window.localStorage.setItem(key, value);
            window.sessionStorage.setItem(key, value);

            // Emitem un eveniment pentru a notifica alte componente despre schimbarea sesiunii
            const sessionToEmit = hasCurrentSession
              ? parsed.currentSession
              : hasDirectSession
              ? parsed
              : null;
            if (sessionToEmit) {
              window.dispatchEvent(
                new CustomEvent("supabase-session-update", {
                  detail: { session: sessionToEmit },
                })
              );
            }
          } else {
            // Dacă nu este un obiect valid, salvăm oricum
            window.localStorage.setItem(key, value);
            window.sessionStorage.setItem(key, value);
          }
        } catch (e) {
          console.error("Error setting session data:", e);
          // Încercăm să salvăm oricum
          window.localStorage.setItem(key, value);
          window.sessionStorage.setItem(key, value);
        }
        return;
      },
      removeItem: (key) => {
        console.log(
          "Supabase client: Removing session from storage (Simplified)",
          key
        );
        try {
          window.localStorage.removeItem(key);
          window.sessionStorage.removeItem(key);
          // Clean up related flags just in case
          window.sessionStorage.removeItem("intentional_signout");
          window.sessionStorage.removeItem("session_restore_attempts");
          window.sessionStorage.removeItem("temp_session_backup");
        } catch (e) {
          console.error("Error removing session from storage:", e);
        }

        // Always dispatch the update event immediately when session is removed
        console.log("Dispatching session update event (session: null)");
        window.dispatchEvent(
          new CustomEvent("supabase-session-update", {
            detail: { session: null },
          })
        );
        return;
      },
    },
  },
  global: {
    // Reduced timeout to 15 seconds for faster error detection
    fetch: async (url: URL | RequestInfo, options?: RequestInit) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

      // Determine if this is a GET request for caching purposes
      const isGetRequest = !options?.method || options?.method === "GET";

      // Use a more balanced caching strategy
      const headers = {
        ...options?.headers,
        // Allow caching for GET requests but validate with server
        "Cache-Control": isGetRequest
          ? "max-age=300, stale-while-revalidate=600"
          : "no-cache",
        // Asigurăm că API key-ul este inclus în toate cererile
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        // Adăugăm informații despre aplicație pentru diagnostic
        "x-application-name":
          import.meta.env.VITE_APP_NAME || "InventoryMaster",
        "x-application-version": import.meta.env.VITE_APP_VERSION || "1.0.0",
        "x-client-info": "supabase-js/2.x", // Versiunea clientului
      };

      // Verificăm dacă avem un token de sesiune și îl adăugăm la cerere
      try {
        const localSession =
          localStorage.getItem("supabase.auth.token") ||
          sessionStorage.getItem("supabase.auth.token");
        if (localSession) {
          const parsedSession = JSON.parse(localSession);
          if (parsedSession?.currentSession?.access_token) {
            headers[
              "Authorization"
            ] = `Bearer ${parsedSession.currentSession.access_token}`;
          }
        }
      } catch (e) {
        console.warn("Error adding session token to request:", e);
      }

      return fetch(url, {
        ...options,
        signal: controller.signal,
        headers,
      })
        .then((response) => {
          clearTimeout(timeoutId);
          return response;
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          console.error("Supabase fetch error:", error);
          throw error;
        });
    },
  },
});

// Configurăm listener pentru schimbările de sesiune
supabase.auth.onAuthStateChange((event, session) => {
  // Log event and session for better debugging
  console.log("Supabase auth state change:", event, session);

  if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
    // Emitem un eveniment pentru a notifica alte componente despre schimbarea sesiunii
    console.log("Dispatching session update event (session updated)");
    window.dispatchEvent(
      new CustomEvent("supabase-session-update", {
        detail: { session },
      })
    );
  } else if (event === "SIGNED_OUT") {
    console.log(
      "SIGNED_OUT event detected. Dispatching session update event (session: null)"
    );
    // Always dispatch null session on SIGNED_OUT immediately
    window.dispatchEvent(
      new CustomEvent("supabase-session-update", {
        detail: { session: null },
      })
    );
    // Clean up the intentional sign out flag if it was set, just in case
    try {
      window.sessionStorage.removeItem("intentional_signout");
    } catch (e) {
      console.error("Error removing intentional_signout flag:", e);
    }
  }
});

// Funcție pentru a verifica dacă utilizatorul este autentificat
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    // În modul de dezvoltare, verificăm dacă avem un cont de test în storage
    if (
      import.meta.env.DEV &&
      import.meta.env.VITE_ENABLE_TEST_ACCOUNTS === "true"
    ) {
      const localSession =
        localStorage.getItem("supabase.auth.token") ||
        sessionStorage.getItem("supabase.auth.token");
      if (localSession) {
        try {
          const parsed = JSON.parse(localSession);
          if (
            parsed.currentSession?.user?.email?.includes("test") ||
            parsed.currentSession?.user?.email?.includes("demo") ||
            parsed.currentSession?.user?.email?.includes("admin")
          ) {
            console.log("Test account session found in development mode");
            return true;
          }
        } catch (e) {
          console.error("Error parsing local session:", e);
        }
      }
    }

    // Verificăm sesiunea normal
    const { data, error } = await supabase.auth.getSession();
    return !!data.session && !error;
  } catch (error) {
    console.error("Error checking authentication status:", error);
    return false;
  }
};

// Funcție pentru a obține sesiunea curentă
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error("Error getting current session:", error);
    return null;
  }
};
