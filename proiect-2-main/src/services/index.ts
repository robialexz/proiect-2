/**
 * Exportă toate serviciile
 */

// Importăm serviciile
import { supabase as supabaseClient } from "./api/supabase-client";
import { supabaseService as supabaseServiceImport } from "./api/supabase-service";
import { enhancedSupabaseService as enhancedSupabaseServiceImport } from "./api/enhanced-supabase-service";
import { authService as authServiceImport } from "./auth/auth-service";
import { cacheService as cacheServiceImport } from "./cache/cache-service";
import { DataService as DataServiceImport, userService as userServiceImport } from "./data";
import { projectService as projectServiceImport } from "./project.service";
import { materialService as materialServiceImport } from "./material.service";

// Exportăm serviciile
export const supabase = supabaseClient;
export const supabaseService = supabaseServiceImport;
export const enhancedSupabaseService = enhancedSupabaseServiceImport;
export const authService = authServiceImport;
export const cacheService = cacheServiceImport;
export const DataService = DataServiceImport;
export const userService = userServiceImport;
export const projectService = projectServiceImport;
export const materialService = materialServiceImport;

// Export types
export type {
  SupabaseResponse,
  SupabaseErrorResponse,
} from "./api/supabase-service";

// Export implicit pentru compatibilitate
const services = {
  projectService: projectServiceImport,
  materialService: materialServiceImport,
  userService: userServiceImport,
  authService: authServiceImport,
  cacheService: cacheServiceImport,
  supabaseService: supabaseServiceImport,
  enhancedSupabaseService: enhancedSupabaseServiceImport,
};

export default services;
