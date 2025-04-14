import { createClient } from "@supabase/supabase-js";
import { type Database } from "@/types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
}

// Optimized client configuration for better performance
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    storage: {
      getItem: (key) => {
        // Încercăm să obținem sesiunea din localStorage sau sessionStorage
        const localData = localStorage.getItem(key);
        const sessionData = sessionStorage.getItem(key);
        const data = localData || sessionData;

        if (data) {
          // Verificăm dacă sesiunea a expirat
          try {
            const parsed = JSON.parse(data);
            if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
              console.log('Session expired, removing from storage');
              localStorage.removeItem(key);
              sessionStorage.removeItem(key);
              return null;
            }
          } catch (e) {
            console.error('Error parsing session data:', e);
          }
        }

        return data;
      },
      setItem: (key, value) => {
        // Salvăm sesiunea în ambele storage-uri pentru compatibilitate
        localStorage.setItem(key, value);
        sessionStorage.setItem(key, value);
        return;
      },
      removeItem: (key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
        return;
      }
    }
  },
  global: {
    // Reduced timeout to 15 seconds for faster error detection
    fetch: (url, options) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

      // Create a cache key for GET requests
      const isGetRequest = options?.method === undefined || options?.method === 'GET';
      const cacheKey = isGetRequest ? url.toString() : null;

      // Use a more balanced caching strategy
      const headers = {
        ...options?.headers,
        // Allow caching for GET requests but validate with server
        'Cache-Control': isGetRequest ? 'max-age=300, stale-while-revalidate=600' : 'no-cache',
        // Asigurăm că API key-ul este inclus în toate cererile
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      };

      // Verificăm dacă avem un token de sesiune și îl adăugăm la cerere
      try {
        const localSession = localStorage.getItem('supabase.auth.token') || sessionStorage.getItem('supabase.auth.token');
        if (localSession) {
          const parsedSession = JSON.parse(localSession);
          if (parsedSession?.currentSession?.access_token) {
            headers['Authorization'] = `Bearer ${parsedSession.currentSession.access_token}`;
          }
        }
      } catch (e) {
        console.warn('Error adding session token to request:', e);
      }

      return fetch(url, {
        ...options,
        signal: controller.signal,
        headers
      }).then(response => {
        clearTimeout(timeoutId);
        return response;
      }).catch(error => {
        clearTimeout(timeoutId);
        console.error('Supabase fetch error:', error);
        throw error;
      });
    }
  }
});
