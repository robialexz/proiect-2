import { supabase } from '../lib/supabase';

async function checkDatabase() {
  console.log('Checking database tables...');
  
  // Check if profiles table exists
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);
  
  console.log('Profiles table:', profilesError ? 'Error: ' + profilesError.message : 'OK');
  
  // Check if projects table exists
  const { data: projectsData, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .limit(1);
  
  console.log('Projects table:', projectsError ? 'Error: ' + projectsError.message : 'OK');
  
  // Check if materials table exists
  const { data: materialsData, error: materialsError } = await supabase
    .from('materials')
    .select('*')
    .limit(1);
  
  console.log('Materials table:', materialsError ? 'Error: ' + materialsError.message : 'OK');
}

checkDatabase().catch(console.error);
