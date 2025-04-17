import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Request Suplimentar function initializing.");

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

    // Parse the request body to get the material ID and quantity
    let materialId: string | null = null;
    let quantity: number | null = null;
    try {
      const body = await req.json();
      materialId = body.material_id;
      quantity = body.quantity;

      if (!materialId || typeof materialId !== 'string') {
        throw new Error("Missing or invalid 'material_id' in request body");
      }
      if (quantity === null || typeof quantity !== 'number' || isNaN(quantity) || quantity <= 0) {
         throw new Error("Missing or invalid 'quantity' in request body");
      }
      console.log(`Received request to set suplimentar for ID ${materialId} to ${quantity}`);
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(JSON.stringify({ error: "Invalid request body", details: parseError.message }), {
        status: 400, // Bad Request
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase Admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
        console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
        throw new Error("Server configuration error: Missing Supabase credentials.");
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    console.log(`Attempting to update suplimentar for ${materialId} to ${quantity} using admin client...`);

    // Perform the update operation
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from("materials")
      .update({ suplimentar: quantity })
      .match({ id: materialId })
      .select(); // Select to confirm

    if (updateError) {
      console.error(`Supabase update error for ID ${materialId}:`, updateError);
      return new Response(JSON.stringify({ error: "Failed to update supplementary quantity", details: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if data was returned
     if (!updateData || updateData.length === 0) {
        console.warn(`Update for ${materialId} completed, but no data returned. Row might not exist.`);
         return new Response(JSON.stringify({ error: "Material not found or update failed silently", material_id: materialId }), {
            status: 404, // Not Found or potentially other issue
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    console.log(`Successfully updated suplimentar for ${materialId}. Returned data:`, updateData);

    // Return success response
    return new Response(JSON.stringify({ message: "Supplementary quantity updated successfully", data: updateData[0] }), {
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
