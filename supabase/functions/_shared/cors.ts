// Standard CORS headers for Supabase Edge Functions
// Allows requests from any origin (adjust if needed for production)
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
