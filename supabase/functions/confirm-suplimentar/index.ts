import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Confirm Suplimentar function initializing.");

// Helper function to get current quantity
async function getCurrentQuantity(supabaseAdmin: SupabaseClient, materialId: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('materials')
    .select('quantity')
    .eq('id', materialId)
    .single();

  if (error) {
    console.error(`Error fetching current quantity for ${materialId}:`, error);
    throw new Error(`Material not found or error fetching quantity: ${error.message}`);
  }
  if (!data) {
     throw new Error(`Material not found: ${materialId}`);
  }
  return data.quantity ?? 0;
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
    let quantityToAdd: number | null = null;
    let newSuplimentarValue: number | null = null;
    try {
      const body = await req.json();
      materialId = body.material_id;
      quantityToAdd = body.quantity_to_add; // Can be 0 if 'Not procured'
      newSuplimentarValue = body.new_suplimentar_value; // Should usually be 0

      if (!materialId || typeof materialId !== 'string') {
        throw new Error("Missing or invalid 'material_id'");
      }
      if (quantityToAdd === null || typeof quantityToAdd !== 'number' || isNaN(quantityToAdd) || quantityToAdd < 0) {
         throw new Error("Missing or invalid 'quantity_to_add'");
      }
       if (newSuplimentarValue === null || typeof newSuplimentarValue !== 'number' || isNaN(newSuplimentarValue) || newSuplimentarValue < 0) {
         throw new Error("Missing or invalid 'new_suplimentar_value'");
      }
      console.log(`Received confirmation for ID ${materialId}: Add ${quantityToAdd}, Set suplimentar to ${newSuplimentarValue}`);
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

    console.log(`Attempting confirmation update for ${materialId} using admin client...`);

    // Get current quantity before updating
    const currentQuantity = await getCurrentQuantity(supabaseAdmin, materialId);
    const finalQuantity = currentQuantity + quantityToAdd;

    // Perform the update operation
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from("materials")
      .update({
          quantity: finalQuantity,
          suplimentar: newSuplimentarValue
       })
      .match({ id: materialId })
      .select(); // Select to confirm

    if (updateError) {
      console.error(`Supabase update error during confirmation for ID ${materialId}:`, updateError);
      return new Response(JSON.stringify({ error: "Failed to confirm supplementary quantity", details: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

     if (!updateData || updateData.length === 0) {
        console.warn(`Confirmation update for ${materialId} completed, but no data returned. Row might not exist.`);
         return new Response(JSON.stringify({ error: "Material not found or update failed silently during confirmation", material_id: materialId }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    console.log(`Successfully confirmed suplimentar for ${materialId}. Returned data:`, updateData);

    // Return success response
    return new Response(JSON.stringify({ message: "Supplementary quantity confirmed successfully", data: updateData[0] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Unhandled error in function:", error);
     // Check if it's a known error type (like material not found from helper)
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: error.message?.includes("Material not found") ? 404 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
