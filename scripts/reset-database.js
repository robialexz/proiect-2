/**
 * Script pentru resetarea completă a bazei de date Supabase
 * Acest script va șterge toate datele din tabelele existente și va recrea structura bazei de date
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Obținem credențialele din variabilele de mediu
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

// Creăm un client Supabase cu cheia service_role pentru a avea acces complet
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

// Lista tabelelor care vor fi resetate
const TABLES_TO_RESET = [
  'profiles',
  'projects',
  'materials',
  'budgets',
  'expenses',
  'budget_categories',
  'reports',
  'report_templates',
  'resources',
  'resource_allocations',
  'resource_categories',
  'resource_category_mappings',
  'tasks',
  'user_roles',
  'health_check',
  'supplier_announcements',
  'supplier_announcement_files',
  'material_orders',
  'project_order_settings'
];

/**
 * Funcție pentru ștergerea tuturor datelor dintr-un tabel
 * @param {string} tableName Numele tabelului
 */
async function clearTable(tableName) {
  try {
    console.log(`Clearing table: ${tableName}`);
    const { error } = await supabaseAdmin.from(tableName).delete().neq('id', 'dummy_value_to_delete_all');
    
    if (error) {
      // Dacă tabela nu există, ignorăm eroarea
      if (error.code === '42P01') { // PGSQL code for undefined_table
        console.log(`Table ${tableName} does not exist. Skipping.`);
        return;
      }
      console.error(`Error clearing table ${tableName}:`, error);
    } else {
      console.log(`Successfully cleared table: ${tableName}`);
    }
  } catch (error) {
    console.error(`Error clearing table ${tableName}:`, error);
  }
}

/**
 * Funcție pentru ștergerea tuturor utilizatorilor
 */
async function deleteAllUsers() {
  try {
    console.log('Deleting all users...');
    const { data, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return;
    }
    
    const users = data?.users || [];
    console.log(`Found ${users.length} users to delete.`);
    
    for (const user of users) {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      if (error) {
        console.error(`Error deleting user ${user.id}:`, error);
      } else {
        console.log(`Deleted user: ${user.id}`);
      }
    }
    
    console.log('Finished deleting all users');
  } catch (error) {
    console.error('Error deleting users:', error);
  }
}

/**
 * Funcție pentru crearea tabelelor necesare
 */
async function createTables() {
  try {
    console.log('Creating tables...');
    
    // Creăm tabela profiles
    const { error: profilesError } = await supabaseAdmin.rpc('create_profiles_table');
    if (profilesError) {
      console.error('Error creating profiles table:', profilesError);
    } else {
      console.log('Created profiles table');
    }
    
    // Creăm tabela projects
    const { error: projectsError } = await supabaseAdmin.rpc('create_projects_table');
    if (projectsError) {
      console.error('Error creating projects table:', projectsError);
    } else {
      console.log('Created projects table');
    }
    
    // Creăm tabela materials
    const { error: materialsError } = await supabaseAdmin.rpc('create_materials_table');
    if (materialsError) {
      console.error('Error creating materials table:', materialsError);
    } else {
      console.log('Created materials table');
    }
    
    console.log('Finished creating tables');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

/**
 * Funcție principală pentru resetarea bazei de date
 */
async function resetDatabase() {
  try {
    console.log('Starting database reset...');
    
    // Ștergem toate datele din tabele
    for (const table of TABLES_TO_RESET) {
      await clearTable(table);
    }
    
    // Ștergem toți utilizatorii
    await deleteAllUsers();
    
    // Creăm tabelele necesare
    await createTables();
    
    console.log('Database reset completed successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
  }
}

// Executăm funcția principală
resetDatabase().catch(console.error);
