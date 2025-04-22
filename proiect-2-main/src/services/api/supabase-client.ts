import { createClient } from "@supabase/supabase-js";
import { type Database } from "@/types/supabase-types";

// Afișăm valorile pentru debugging
// Removed console statement
// Removed console statement

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Removed console statement
  // Removed console statement
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
    // Remove custom storage and rely on Supabase's default implementation
    // storageKey: "supabase.auth.token", // Use default storage key
  },
  global: {
    // Timeout mărit la 60 de secunde pentru a permite conexiuni mai lente
    fetch: async (url: URL | RequestInfo, options?: RequestInit) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout (mărit de la 15 secunde)

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
