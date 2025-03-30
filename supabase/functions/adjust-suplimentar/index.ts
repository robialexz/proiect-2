import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Adjust Suplimentar function initializing.");

// Helper function to get current suplimentar value
async function getCurrentSuplimentar(supabaseAdmin: SupabaseClient, materialId: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('materials')
    .select('suplimentar')
    .eq('id', materialId)
    .single();

  if (error) {
    console.error(`Error fetching current suplimentar for ${materialId}:`, error);
    throw new Error(`Material not found or error fetching suplimentar: ${error.message}`);
  }
  if (!data) {
     throw new Error(`Material not found: ${materialId}`);
  }
  return data.suplimentar ?? 0; // Default to 0 if null
}


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

    // Parse the request body
    let materialId: string | null = null;
    let adjustmentValue: number | null = null;
    try {
      const body = await req.json();
      materialId = body.material_id;
      adjustmentValue = body.adjustment_value; // Can be positive or negative

      if (!materialId || typeof materialId !== 'string') {
        throw new Error("Missing or invalid 'material_id'");
      }
      if (adjustmentValue === null || typeof adjustmentValue !== 'number' || isNaN(adjustmentValue)) {
         // Allow 0 adjustment? Maybe not useful. Let's disallow 0 for now.
         if (adjustmentValue === 0) throw new Error("'adjustment_value' cannot be zero");
         throw new Error("Missing or invalid 'adjustment_value'");
      }
      console.log(`Received request to adjust suplimentar for ID ${materialId} by ${adjustmentValue}`);
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(JSON.stringify({ error: "Invalid request body", details: parseError.message }), {
        status: 400,
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
        auth: { autoRefreshToken: false, persistSession: false }
    });

    console.log(`Attempting adjustment update for ${materialId} using admin client...`);

    // Get current suplimentar value
    const currentSuplimentar = await getCurrentSuplimentar(supabaseAdmin, materialId);
    // Calculate the NEW value by adding/subtracting the adjustment
    const newSuplimentarValue = Math.max(0, currentSuplimentar + adjustmentValue); // Ensure it doesn't go below 0

    console.log(`Current suplimentar: ${currentSuplimentar}, Adjustment: ${adjustmentValue}, New value: ${newSuplimentarValue}`);

    // Perform the update operation with the *new calculated value*
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from("materials")
      .update({ suplimentar: newSuplimentarValue }) // Update with the calculated value
      .match({ id: materialId })
      .select(); // Select to confirm

    if (updateError) {
      console.error(`Supabase update error during adjustment for ID ${materialId}:`, updateError);
      return new Response(JSON.stringify({ error: "Failed to adjust supplementary quantity", details: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

     if (!updateData || updateData.length === 0) {
        console.warn(`Adjustment update for ${materialId} completed, but no data returned. Row might not exist.`);
         return new Response(JSON.stringify({ error: "Material not found or update failed silently during adjustment", material_id: materialId }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    console.log(`Successfully adjusted suplimentar for ${materialId}. Returned data:`, updateData);

    // Return success response
    return new Response(JSON.stringify({ message: "Supplementary quantity adjusted successfully", data: updateData[0] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Unhandled error in function:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: error.message?.includes("Material not found") ? 404 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
