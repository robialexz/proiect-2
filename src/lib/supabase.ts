import { createClient } from "@supabase/supabase-js";
// import { type Database } from "@/types/supabase"; // Commented out - regenerate later

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Consider throwing an error or showing a more user-friendly message
  console.error(
    "Missing Supabase environment variables. Please check your .env file."
  );
  // In a real app, you might want to throw an error or display a message to the user
  // throw new Error("Supabase URL and Anon Key are required.");
}

// Standard Supabase client initialization
// We assume RLS is enabled and the anon key has the necessary grants.
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  // Removed <Database> generic
  auth: {
    // These are the defaults, but explicitly stating them can be helpful
    autoRefreshToken: true,
    persistSession: true, // Persist session across browser tabs/windows
    detectSessionInUrl: true, // Important for OAuth and email links like password recovery
  },
});

// No custom wrappers or listeners needed here for the simplified approach.
// Auth state changes will be handled directly in the AuthContext.
