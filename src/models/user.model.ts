/**
 * Model pentru utilizator
 */
export interface User {
  id: string;
  email: string;
  role?: string;
  email_confirmed_at?: string;
  created_at?: string;
  updated_at?: string;
  last_sign_in_at?: string;
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
  user_metadata?: Record<string, any>;
}

/**
 * Model pentru profilul utilizatorului
 */
export interface UserProfile {
  id: string;
  display_name: string;
  email: string;
  avatar_url?: string;
  full_name?: string;
  job_title?: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Model pentru setările utilizatorului
 */
export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  email_notifications: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Model pentru rolul utilizatorului
 */
export interface UserRole {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Model pentru sesiunea utilizatorului
 */
export interface UserSession {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  refresh_token: string;
  user: User;
}

/**
 * Model pentru răspunsul de autentificare
 */
export interface AuthResponse {
  session: UserSession | null;
  user: User | null;
  error?: {
    message: string;
    status?: number;
  };
}
