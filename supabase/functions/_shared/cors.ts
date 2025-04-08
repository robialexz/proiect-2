// Standard CORS headers for Supabase Edge Functions
// Allows requests from localhost and production domain
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-auth",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Allow-Credentials": "true",
};
