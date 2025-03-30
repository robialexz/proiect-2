import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Delete Material function initializing.");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Ensure the request method is POST
    if (req.method !== "POST") {
      console.error("Invalid method:", req.method);
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse the request body to get the material ID
    let materialId: string | null = null;
    try {
      const body = await req.json();
      materialId = body.material_id;
      if (!materialId || typeof materialId !== 'string') {
        throw new Error("Missing or invalid 'material_id' in request body");
      }
      console.log("Received request to delete material ID:", materialId);
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(JSON.stringify({ error: "Invalid request body", details: parseError.message }), {
        status: 400, // Bad Request
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase Admin client
    // Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in Edge Function secrets
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
        console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
        throw new Error("Server configuration error: Missing Supabase credentials.");
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            // Required for admin client
            autoRefreshToken: false,
            persistSession: false
        }
    });

    console.log(`Attempting to delete material ${materialId} using admin client...`);

    // Perform the delete operation
    const { error: deleteError } = await supabaseAdmin
      .from("materials")
      .delete()
      .match({ id: materialId });

    if (deleteError) {
      console.error(`Supabase delete error for ID ${materialId}:`, deleteError);
      // Don't throw here, return error response
      return new Response(JSON.stringify({ error: "Failed to delete material", details: deleteError.message }), {
        status: 500, // Internal Server Error
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Successfully deleted material ${materialId}.`);

    // Return success response
    return new Response(JSON.stringify({ message: "Material deleted successfully" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Unhandled error in function:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
