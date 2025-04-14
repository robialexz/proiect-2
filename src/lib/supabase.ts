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
        console.log('Supabase client: Getting session from storage', key);
        // Încercăm să obținem sesiunea din localStorage sau sessionStorage
        const localData = window.localStorage.getItem(key);
        const sessionData = window.sessionStorage.getItem(key);
        const data = localData || sessionData;

        if (data) {
          // Verificăm dacă sesiunea a expirat
          try {
            const parsed = JSON.parse(data);
            if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
              console.log('Session expired, removing from storage');
              window.localStorage.removeItem(key);
              window.sessionStorage.removeItem(key);
              return null;
            }
            
            // Verificăm dacă avem o sesiune validă
            if (parsed.currentSession && parsed.currentSession.access_token) {
              console.log('Valid session found in storage');
              return data;
            }
          } catch (e) {
            console.error('Error parsing session data:', e);
          }
        }

        return data;
      },
      setItem: (key, value) => {
        console.log('Supabase client: Setting session in storage', key);
        // Salvăm sesiunea în ambele storage-uri pentru compatibilitate
        try {
          // Verificăm dacă valoarea este validă
          const parsed = JSON.parse(value);
          if (!parsed.currentSession || !parsed.currentSession.access_token) {
            console.warn('Attempting to store invalid session data');
          }
          
          // Adăugăm un timestamp de expirare dacă nu există
          if (!parsed.expiresAt) {
            parsed.expiresAt = Date.now() + 3600 * 1000; // 1 oră valabilitate
            value = JSON.stringify(parsed);
          }
          
          window.localStorage.setItem(key, value);
          window.sessionStorage.setItem(key, value);
          
          // Emitem un eveniment pentru a notifica alte componente despre schimbarea sesiunii
          if (parsed.currentSession) {
            window.dispatchEvent(new CustomEvent('supabase-session-update', { 
              detail: { session: parsed.currentSession } 
            }));
          }
        } catch (e) {
          console.error('Error setting session data:', e);
          // Încercăm să salvăm oricum
          window.localStorage.setItem(key, value);
          window.sessionStorage.setItem(key, value);
        }
        return;
      },
      removeItem: (key) => {
        console.log('Supabase client: Removing session from storage', key);
        window.localStorage.removeItem(key);
        window.sessionStorage.removeItem(key);
        
        // Emitem un eveniment pentru a notifica alte componente despre ștergerea sesiunii
        window.dispatchEvent(new CustomEvent('supabase-session-update', { 
          detail: { session: null } 
        }));
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
