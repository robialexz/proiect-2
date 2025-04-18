import { createClient } from "@supabase/supabase-js";
import { type Database } from "@/types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Consider throwing an error or showing a more user-friendly message
  throw new Error("Supabase URL and Anon Key are required.");
}

// Standard Supabase client initialization
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // These are the defaults, but explicitly stating them can be helpful
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Important for OAuth and email links
  },
  // Removed custom global fetch options for simplicity
});

// REMOVED: Custom onAuthStateChange listener here. Will be handled in AuthContext.

// REMOVED: Custom isAuthenticated and getCurrentSession helpers. Use Supabase methods directly or context.
