import { supabase } from "../lib/supabase";
import {
  requestSuplimentar,
  confirmSuplimentar,
  adjustSuplimentar,
  deleteMaterial,
} from "../lib/edge-functions";

async function testEdgeFunctions() {
  // Removed console statement

  try {
    // First, create a test project
    // Removed console statement
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .insert([{ name: "Test Project" }])
      .select()
      .single();

    if (projectError) {
      // Removed console statement
      return;
    }

    // Removed console statement

    // Create a test material
    // Removed console statement
    try {
    const { data: materialData, error: materialError } = await supabase
    } catch (error) {
      // Handle error appropriately
    }
      .from("materials")
      .insert([
        {
          project_id: projectData.id,
          name: "Test Material",
          dimension: "10x10",
          unit: "pcs",
          quantity: 100,
          manufacturer: "Test Manufacturer",
          category: "Test Category",
          suplimentar: 0,
        },
      ])
      .select()
      .single();

    if (materialError) {
      // Removed console statement
      return;
    }

    // Removed console statement

    // Test requestSuplimentar
    // Removed console statement
    try {
    const { data: requestData, error: requestError } = await requestSuplimentar(
    } catch (error) {
      // Handle error appropriately
    }
      materialData.id,
      10
    );

    if (requestError) {
      // Removed console statement
    } else {
      // Removed console statement
    }

    // Test adjustSuplimentar
    // Removed console statement
    try {
    const { data: adjustData, error: adjustError } = await adjustSuplimentar(
    } catch (error) {
      // Handle error appropriately
    }
      materialData.id,
      5
    );

    if (adjustError) {
      // Removed console statement
    } else {
      // Removed console statement
    }

    // Test confirmSuplimentar
    // Removed console statement
    try {
    const { data: confirmData, error: confirmError } = await confirmSuplimentar(
    } catch (error) {
      // Handle error appropriately
    }
      materialData.id
    );

    if (confirmError) {
      // Removed console statement
    } else {
      // Removed console statement
    }

    // Test deleteMaterial
    // Removed console statement
    try {
    const { data: deleteData, error: deleteError } = await deleteMaterial(
    } catch (error) {
      // Handle error appropriately
    }
      materialData.id
    );

    if (deleteError) {
      // Removed console statement
    } else {
      // Removed console statement
    }

    // Clean up - delete the test project
    // Removed console statement
    try {
    const { error: cleanupError } = await supabase
    } catch (error) {
      // Handle error appropriately
    }
      .from("projects")
      .delete()
      .eq("id", projectData.id);

    if (cleanupError) {
      // Removed console statement
    } else {
      // Removed console statement
    }

    // Removed console statement
  } catch (error) {
    // Removed console statement
  }
}

// Run the tests
testEdgeFunctions().catch((error) => {
  // Handle error appropriately
  // Removed console statement
});
