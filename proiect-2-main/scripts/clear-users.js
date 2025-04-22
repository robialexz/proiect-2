const { createClient } = require('@supabase/supabase-js');
// Load environment variables from .env
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function deleteAllUsers() {
  const { data, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError);
    process.exit(1);
  }
  const users = data?.users || [];
  for (const user of users) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (error) console.error('Error deleting user', user.id, error);
    else console.log('Deleted user', user.id);
  }
  console.log('Finished deleting all users');
}

deleteAllUsers().catch(console.error);
