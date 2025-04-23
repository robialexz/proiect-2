// Script pentru a face un utilizator admin
import { createClient } from '@supabase/supabase-js';

// Configurare Supabase
const supabaseUrl = 'https://btvpnzsmrfrlwczanbcg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0dnBuenNtcmZybHdjemFuYmNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTAwNDUyOSwiZXhwIjoyMDYwNTgwNTI5fQ.pBCv2OSFqsZDZJFf-Fy5GnIRn5B6IbOCQl3tb8TsVkU';
const supabase = createClient(supabaseUrl, supabaseKey);

// Email-ul utilizatorului pe care doriți să-l faceți admin
const userEmail = 'robialexzi0@gmail.com'; // Email-ul utilizatorului existent

async function makeUserAdmin() {
  try {
    // Obținem utilizatorul după email
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', userEmail);

    if (userError) {
      console.error('Eroare la obținerea utilizatorului:', userError);
      return;
    }

    if (!users || users.length === 0) {
      console.error(`Nu s-a găsit niciun utilizator cu email-ul ${userEmail}`);
      return;
    }

    const userId = users[0].id;

    // Actualizăm rolul în tabelul profiles
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId);

    if (updateError) {
      console.error('Eroare la actualizarea rolului în profiles:', updateError);
      return;
    }

    console.log(`Rol admin acordat în tabelul profiles pentru ${userEmail}`);

    // Actualizăm rolul în tabelul user_roles
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'admin'
      });

    if (roleError) {
      console.error('Eroare la actualizarea rolului în user_roles:', roleError);
      return;
    }

    console.log(`Rol admin acordat în tabelul user_roles pentru ${userEmail}`);
    console.log('Utilizatorul este acum admin!');
  } catch (error) {
    console.error('Eroare neașteptată:', error);
  }
}

// Rulăm funcția
makeUserAdmin();
