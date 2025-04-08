import { supabase } from '../lib/supabase';
import { requestSuplimentar, confirmSuplimentar, adjustSuplimentar, deleteMaterial } from '../lib/edge-functions';

async function testEdgeFunctions() {
  console.log('Testing edge functions...');
  
  try {
    // First, create a test project
    console.log('Creating test project...');
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert([{ name: 'Test Project' }])
      .select()
      .single();
    
    if (projectError) {
      console.error('Error creating test project:', projectError);
      return;
    }
    
    console.log('Test project created:', projectData);
    
    // Create a test material
    console.log('Creating test material...');
    const { data: materialData, error: materialError } = await supabase
      .from('materials')
      .insert([{
        project_id: projectData.id,
        name: 'Test Material',
        dimension: '10x10',
        unit: 'pcs',
        quantity: 100,
        manufacturer: 'Test Manufacturer',
        category: 'Test Category',
        suplimentar: 0
      }])
      .select()
      .single();
    
    if (materialError) {
      console.error('Error creating test material:', materialError);
      return;
    }
    
    console.log('Test material created:', materialData);
    
    // Test requestSuplimentar
    console.log('Testing requestSuplimentar...');
    const { data: requestData, error: requestError } = await requestSuplimentar(materialData.id, 10);
    
    if (requestError) {
      console.error('Error requesting supplementary quantity:', requestError);
    } else {
      console.log('Supplementary quantity requested:', requestData);
    }
    
    // Test adjustSuplimentar
    console.log('Testing adjustSuplimentar...');
    const { data: adjustData, error: adjustError } = await adjustSuplimentar(materialData.id, 5);
    
    if (adjustError) {
      console.error('Error adjusting supplementary quantity:', adjustError);
    } else {
      console.log('Supplementary quantity adjusted:', adjustData);
    }
    
    // Test confirmSuplimentar
    console.log('Testing confirmSuplimentar...');
    const { data: confirmData, error: confirmError } = await confirmSuplimentar(materialData.id);
    
    if (confirmError) {
      console.error('Error confirming supplementary quantity:', confirmError);
    } else {
      console.log('Supplementary quantity confirmed:', confirmData);
    }
    
    // Test deleteMaterial
    console.log('Testing deleteMaterial...');
    const { data: deleteData, error: deleteError } = await deleteMaterial(materialData.id);
    
    if (deleteError) {
      console.error('Error deleting material:', deleteError);
    } else {
      console.log('Material deleted:', deleteData);
    }
    
    // Clean up - delete the test project
    console.log('Cleaning up...');
    const { error: cleanupError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectData.id);
    
    if (cleanupError) {
      console.error('Error cleaning up:', cleanupError);
    } else {
      console.log('Cleanup successful');
    }
    
    console.log('Edge function tests completed');
  } catch (error) {
    console.error('Unexpected error during tests:', error);
  }
}

// Run the tests
testEdgeFunctions().catch(console.error);
