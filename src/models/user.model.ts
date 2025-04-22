/**
 * Model pentru utilizator
 * Acest model este un placeholder pentru noua implementare cu Supabase
 */
export interface User {
  id: string;
  email: string;
  created_at?: string;
  updated_at?: string;
  last_sign_in_at?: string;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
}

/**
 * Model pentru profilul utilizatorului
 * Acest model este un placeholder pentru noua implementare cu Supabase
 */
export interface UserProfile {
  id: string;
  user_id: string;
  display_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}
