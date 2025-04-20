/**
 * Exportă toate serviciile
 */

// API Services
export { supabase } from "./api/supabase-client";
export { supabaseService } from "./api/supabase-service";
export { enhancedSupabaseService } from "./api/enhanced-supabase-service";

// Auth Services
export { authService } from "./auth/auth-service";

// Cache Services
export { cacheService } from "./cache/cache-service";

// Data Services
export { DataService, userService } from "./data";

// Exportăm serviciul pentru proiecte
export { projectService } from "./project.service";

// Exportăm serviciul pentru materiale
export { materialService } from "./material.service";

// Export types
export type {
  SupabaseResponse,
  SupabaseErrorResponse,
} from "./api/supabase-service";

// Export implicit pentru compatibilitate
export default {
  projectService,
  materialService,
  userService,
  authService,
  cacheService,
  supabaseService,
  enhancedSupabaseService,
};
