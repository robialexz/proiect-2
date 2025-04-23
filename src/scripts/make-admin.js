// Script pentru a face un utilizator admin
// Rulați acest script cu Node.js pentru a face un utilizator admin

const { createClient } = require('@supabase/supabase-js');

// Configurare Supabase
const supabaseUrl = 'https://btvpnzsmrfrlwczanbcg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0dnBuenNtcmZybHdjemFuYmNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTAwNDUyOSwiZXhwIjoyMDYwNTgwNTI5fQ.pBCv2OSFqsZDZJFf-Fy5GnIRn5B6IbOCQl3tb8TsVkU';
const supabase = createClient(supabaseUrl, supabaseKey);

// Email-ul utilizatorului pe care doriți să-l faceți admin
const userEmail = 'robialexz@gmail.com'; // Înlocuiți cu email-ul dvs.

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
      
      // Verificăm în tabelul auth.users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Eroare la obținerea utilizatorilor din auth:', authError);
        return;
      }
      
      const authUser = authUsers?.users?.find(u => u.email === userEmail);
      
      if (!authUser) {
        console.error(`Nu s-a găsit niciun utilizator cu email-ul ${userEmail} în auth.users`);
        return;
      }
      
      // Creăm un profil pentru utilizator
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          email: userEmail,
          display_name: userEmail.split('@')[0],
          role: 'admin'
        });
      
      if (profileError) {
        console.error('Eroare la crearea profilului:', profileError);
        return;
      }
      
      console.log(`Profil creat și rol admin acordat pentru ${userEmail}`);
      
      // Adăugăm și în tabelul user_roles
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authUser.id,
          role: 'admin'
        });
      
      if (roleError) {
        console.error('Eroare la adăugarea rolului:', roleError);
        return;
      }
      
      console.log(`Rol admin adăugat în tabelul user_roles pentru ${userEmail}`);
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

    // Verificăm dacă există deja o înregistrare în user_roles
    const { data: existingRoles, error: roleCheckError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);

    if (roleCheckError) {
      console.error('Eroare la verificarea rolurilor existente:', roleCheckError);
      return;
    }

    if (existingRoles && existingRoles.length > 0) {
      // Actualizăm rolul existent
      const { error: roleUpdateError } = await supabase
        .from('user_roles')
        .update({ role: 'admin' })
        .eq('user_id', userId);

      if (roleUpdateError) {
        console.error('Eroare la actualizarea rolului în user_roles:', roleUpdateError);
        return;
      }
    } else {
      // Adăugăm un nou rol
      const { error: roleInsertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'admin'
        });

      if (roleInsertError) {
        console.error('Eroare la adăugarea rolului în user_roles:', roleInsertError);
        return;
      }
    }

    console.log(`Rol admin acordat în tabelul user_roles pentru ${userEmail}`);
    console.log('Utilizatorul este acum admin!');
  } catch (error) {
    console.error('Eroare neașteptată:', error);
  }
}

// Rulăm funcția
makeUserAdmin();
