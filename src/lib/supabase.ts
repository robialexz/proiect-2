import { createClient } from "@supabase/supabase-js";
import { type Database } from "@/types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
}

// Explicitly add default options with increased timeouts and retry logic
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    // Increase timeout to 30 seconds
    fetch: (url, options) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

      return fetch(url, {
        ...options,
        signal: controller.signal,
        // Add cache control headers to prevent caching
        headers: {
          ...options?.headers,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
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
