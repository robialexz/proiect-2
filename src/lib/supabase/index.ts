/**
 * Exportă clientul și serviciile Supabase
 */

// Exportăm clientul Supabase
export { supabase } from './supabase-client';
export { default as supabaseClient } from './supabase-client';

// Exportăm serviciile Supabase
export {
  authService,
  profileService,
  storageService,
} from './supabase-service';
export { default as supabaseService } from './supabase-service';

// Export implicit pentru compatibilitate
export { supabase as default } from './supabase-client';
