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
    detectSessionInUrl: true
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
        'Cache-Control': isGetRequest ? 'max-age=300, stale-while-revalidate=600' : 'no-cache'
      };

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
