// Script pentru a verifica utilizatorii existenți
import { createClient } from '@supabase/supabase-js';

// Configurare Supabase
const supabaseUrl = 'https://btvpnzsmrfrlwczanbcg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0dnBuenNtcmZybHdjemFuYmNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTAwNDUyOSwiZXhwIjoyMDYwNTgwNTI5fQ.pBCv2OSFqsZDZJFf-Fy5GnIRn5B6IbOCQl3tb8TsVkU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  try {
    // Verificăm utilizatorii din tabelul profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('Eroare la obținerea profilurilor:', profilesError);
    } else {
      console.log('Profiluri găsite:', profiles?.length || 0);
      console.log('Profiluri:', profiles);
    }

    // Verificăm utilizatorii din tabelul auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('Eroare la obținerea utilizatorilor din auth:', authError);
    } else {
      console.log('Utilizatori auth găsiți:', authData?.users?.length || 0);
      console.log('Utilizatori auth:', authData?.users);
    }

    // Verificăm rolurile utilizatorilor
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');

    if (rolesError) {
      console.error('Eroare la obținerea rolurilor:', rolesError);
    } else {
      console.log('Roluri găsite:', userRoles?.length || 0);
      console.log('Roluri:', userRoles);
    }
  } catch (error) {
    console.error('Eroare neașteptată:', error);
  }
}

// Rulăm funcția
checkUsers();
