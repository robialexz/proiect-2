import { createClient } from "@supabase/supabase-js";
import { type Database } from "@/types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
}

/**
 * Client Supabase optimizat pentru performanță și fiabilitate
 * Acest client este configurat cu setări optimizate pentru caching și gestionarea sesiunilor
 */
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
          try {
            // Verificăm dacă sesiunea este validă
            const parsedData = JSON.parse(data);
            const expiresAt = parsedData.expiresAt;
            
            // Dacă sesiunea a expirat, returnăm null
            if (expiresAt && expiresAt < Date.now()) {
              console.log("Session expired, returning null");
              return null;
            }
            
            return data;
          } catch (e) {
            console.error("Error parsing session data:", e);
            return data; // Returnăm datele brute în caz de eroare
          }
        }
        
        // Verificăm dacă există un backup al sesiunii
        const backupSession = window.sessionStorage.getItem("temp_session_backup");
        if (backupSession) {
          console.log("Valid session found in storage");
          return backupSession;
        }
        
        return null;
      },
      setItem: (key, value) => {
        try {
          // Salvăm sesiunea în localStorage și sessionStorage pentru redundanță
          window.localStorage.setItem(key, value);
          window.sessionStorage.setItem(key, value);
        } catch (e) {
          console.error("Error saving session to storage:", e);
        }
      },
      removeItem: (key) => {
        console.log("Supabase client: Removing session from storage", key);

        // Verificăm dacă este o deconectare intenționată sau o ștergere automată
        const isIntentionalSignOut =
          window.sessionStorage.getItem("intentional_signout") === "true";
        
        // Contorul de încercări de restaurare a sesiunii
        const currentAttempts = parseInt(window.sessionStorage.getItem("session_restore_attempts") || "0");
        
        // Dacă am depășit numărul maxim de încercări, nu mai încercăm să restaurăm sesiunea
        const maxAttempts = 2; // Limităm la 2 încercări pentru a evita bucle infinite
        
        // Salvăm o copie a sesiunii înainte de a o șterge pentru a o putea restaura în caz de deconectare automată
        if (!isIntentionalSignOut && currentAttempts < maxAttempts) {
          try {
            const sessionData =
              window.localStorage.getItem(key) ||
              window.sessionStorage.getItem(key);
            if (sessionData) {
              // Salvăm temporar sesiunea pentru a o putea restaura în caz de deconectare automată
              window.sessionStorage.setItem("temp_session_backup", sessionData);
              console.log("Session backup created before automatic removal");
              
              // Incrementăm contorul de încercări
              window.sessionStorage.setItem("session_restore_attempts", (currentAttempts + 1).toString());
            }
          } catch (e) {
            console.error("Error creating session backup:", e);
          }
        }

        window.localStorage.removeItem(key);
        window.sessionStorage.removeItem(key);

        // Emitem un eveniment doar dacă este o deconectare intenționată
        if (isIntentionalSignOut) {
          console.log(
            "Intentional sign out detected, dispatching session update event"
          );
          window.dispatchEvent(
            new CustomEvent("supabase-session-update", {
              detail: { session: null },
            })
          );
          // Resetăm flag-ul și contorul de încercări
          window.sessionStorage.removeItem("intentional_signout");
          window.sessionStorage.removeItem("session_restore_attempts");
        } else if (currentAttempts < maxAttempts) {
          console.log(
            "Automatic session removal detected, attempt " + (currentAttempts + 1) + " of " + maxAttempts
          );
          
          // Emitem un eveniment pentru a notifica alte componente despre deconectarea automată
          // pentru a putea încerca să restaureze sesiunea
          setTimeout(() => {
            try {
              const backupSession = window.sessionStorage.getItem(
                "temp_session_backup"
              );
              if (backupSession) {
                console.log("Attempting to restore session from backup");
                window.dispatchEvent(
                  new CustomEvent("force-session-refresh", {
                    detail: { sessionBackup: backupSession },
                  })
                );
              }
            } catch (e) {
              console.error("Error restoring session from backup:", e);
            }
          }, 100);
        } else {
          console.log("Maximum session restore attempts reached, redirecting to login");
          // Resetăm contorul de încercări
          window.sessionStorage.removeItem("session_restore_attempts");
          
          // Notificăm utilizatorul că sesiunea a expirat și trebuie să se autentifice din nou
          window.dispatchEvent(
            new CustomEvent("session-expired", {
              detail: { message: "Sesiunea a expirat. Vă rugăm să vă autentificați din nou." },
            })
          );
          
          // Redirecționăm către pagina de login după o scurtă întârziere
          setTimeout(() => {
            window.location.href = "/login";
          }, 500);
        }
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

      try {
        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    },
  },
});

export default supabase;
