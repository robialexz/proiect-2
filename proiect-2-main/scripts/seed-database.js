/**
 * Script pentru popularea bazei de date cu date de test
 * Acest script va crea un utilizator de test și va adăuga date de test în tabelele principale
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

// Configurare pentru datele de test
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
  user_metadata: {
    full_name: 'Test User'
  }
};

const TEST_PROJECTS = [
  {
    name: 'Proiect de test 1',
    description: 'Acesta este un proiect de test pentru dezvoltare',
    status: 'active',
    start_date: '2023-01-01',
    end_date: '2023-12-31',
    budget: 100000,
    client: 'Client de test',
    location: 'București'
  },
  {
    name: 'Proiect de test 2',
    description: 'Al doilea proiect de test pentru dezvoltare',
    status: 'on_hold',
    start_date: '2023-02-01',
    end_date: '2023-11-30',
    budget: 75000,
    client: 'Alt client de test',
    location: 'Cluj'
  }
];

const TEST_MATERIALS = [
  {
    name: 'Material de test 1',
    dimension: '10x10',
    unit: 'buc',
    quantity: 100,
    manufacturer: 'Producător de test',
    category: 'Categoria 1',
    cost_per_unit: 10.5,
    min_stock_level: 20,
    max_stock_level: 200,
    location: 'Depozit A'
  },
  {
    name: 'Material de test 2',
    dimension: '20x20',
    unit: 'kg',
    quantity: 50,
    manufacturer: 'Alt producător',
    category: 'Categoria 2',
    cost_per_unit: 25.75,
    min_stock_level: 10,
    max_stock_level: 100,
    location: 'Depozit B'
  },
  {
    name: 'Material de test 3',
    dimension: '30x30',
    unit: 'm',
    quantity: 200,
    manufacturer: 'Producător de test',
    category: 'Categoria 1',
    cost_per_unit: 5.25,
    min_stock_level: 50,
    max_stock_level: 500,
    location: 'Depozit A'
  }
];

/**
 * Funcție pentru crearea unui utilizator de test
 */
async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Verificăm dacă utilizatorul există deja
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return null;
    }
    
    const existingUser = existingUsers?.users?.find(user => user.email === TEST_USER.email);
    
    if (existingUser) {
      console.log(`Test user ${TEST_USER.email} already exists with ID: ${existingUser.id}`);
      return existingUser.id;
    }
    
    // Creăm utilizatorul de test
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: TEST_USER.email,
      password: TEST_USER.password,
      email_confirm: true,
      user_metadata: TEST_USER.user_metadata
    });
    
    if (error) {
      console.error('Error creating test user:', error);
      return null;
    }
    
    console.log(`Created test user with ID: ${data.user.id}`);
    return data.user.id;
  } catch (error) {
    console.error('Error creating test user:', error);
    return null;
  }
}

/**
 * Funcție pentru crearea profilului utilizatorului
 * @param {string} userId ID-ul utilizatorului
 */
async function createUserProfile(userId) {
  try {
    console.log('Creating user profile...');
    
    // Verificăm dacă profilul există deja
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error checking existing profile:', checkError);
      return;
    }
    
    if (existingProfile) {
      console.log(`Profile for user ${userId} already exists`);
      return;
    }
    
    // Creăm profilul utilizatorului
    const { error } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email: TEST_USER.email,
        display_name: TEST_USER.user_metadata.full_name,
        full_name: TEST_USER.user_metadata.full_name
      });
    
    if (error) {
      console.error('Error creating user profile:', error);
      return;
    }
    
    console.log(`Created profile for user ${userId}`);
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
}

/**
 * Funcție pentru crearea proiectelor de test
 * @param {string} userId ID-ul utilizatorului care creează proiectele
 */
async function createTestProjects(userId) {
  try {
    console.log('Creating test projects...');
    
    const projectIds = [];
    
    for (const project of TEST_PROJECTS) {
      // Adăugăm ID-ul utilizatorului ca manager și creator
      const projectData = {
        ...project,
        manager_id: userId,
        created_by: userId
      };
      
      // Creăm proiectul
      const { data, error } = await supabaseAdmin
        .from('projects')
        .insert(projectData)
        .select('id')
        .single();
      
      if (error) {
        console.error(`Error creating project "${project.name}":`, error);
        continue;
      }
      
      console.log(`Created project "${project.name}" with ID: ${data.id}`);
      projectIds.push(data.id);
    }
    
    return projectIds;
  } catch (error) {
    console.error('Error creating test projects:', error);
    return [];
  }
}

/**
 * Funcție pentru crearea materialelor de test
 * @param {string[]} projectIds ID-urile proiectelor pentru care se creează materialele
 * @param {string} userId ID-ul utilizatorului care creează materialele
 */
async function createTestMaterials(projectIds, userId) {
  try {
    console.log('Creating test materials...');
    
    if (!projectIds.length) {
      console.log('No project IDs provided. Skipping materials creation.');
      return;
    }
    
    // Creăm materiale pentru fiecare proiect
    for (let i = 0; i < projectIds.length; i++) {
      const projectId = projectIds[i];
      
      // Selectăm materialele pentru acest proiect
      const projectMaterials = TEST_MATERIALS.map(material => ({
        ...material,
        project_id: projectId,
        created_by: userId,
        name: `${material.name} (Proiect ${i + 1})`
      }));
      
      // Creăm materialele
      const { data, error } = await supabaseAdmin
        .from('materials')
        .insert(projectMaterials);
      
      if (error) {
        console.error(`Error creating materials for project ${projectId}:`, error);
        continue;
      }
      
      console.log(`Created ${projectMaterials.length} materials for project ${projectId}`);
    }
    
    // Creăm și materiale fără proiect (inventar general)
    const generalMaterials = TEST_MATERIALS.map(material => ({
      ...material,
      created_by: userId,
      name: `${material.name} (General)`
    }));
    
    const { error } = await supabaseAdmin
      .from('materials')
      .insert(generalMaterials);
    
    if (error) {
      console.error('Error creating general materials:', error);
    } else {
      console.log(`Created ${generalMaterials.length} general materials`);
    }
  } catch (error) {
    console.error('Error creating test materials:', error);
  }
}

/**
 * Funcție principală pentru popularea bazei de date
 */
async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Creăm utilizatorul de test
    const userId = await createTestUser();
    
    if (!userId) {
      console.error('Failed to create test user. Aborting.');
      return;
    }
    
    // Creăm profilul utilizatorului
    await createUserProfile(userId);
    
    // Creăm proiectele de test
    const projectIds = await createTestProjects(userId);
    
    // Creăm materialele de test
    await createTestMaterials(projectIds, userId);
    
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Executăm funcția principală
seedDatabase().catch(console.error);
