// Improved CORS headers for Supabase Edge Functions
// Only allows requests from specific domains for better security
export const corsHeaders = {
  // Restrict to specific domains instead of allowing all (*)
  "Access-Control-Allow-Origin": getOrigin(),
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-auth",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Allow-Credentials": "true",
};

// Function to determine the correct origin based on the request
function getOrigin(): string {
  // List of allowed domains
  const allowedDomains = [
    'https://proiect-2-robialexz.vercel.app',  // Production domain
    'https://proiect-2-git-main-robialexz.vercel.app', // Preview domain
    'http://localhost:5173',  // Local development
    'http://localhost:3000',  // Alternative local development
  ];

  // Get the request origin from the environment
  const requestOrigin = Deno.env.get("ORIGIN") || '';

  // Check if the request origin is in the allowed list
  if (allowedDomains.includes(requestOrigin)) {
    return requestOrigin;
  }

  // Default to the production domain if not matched
  return allowedDomains[0];
}
