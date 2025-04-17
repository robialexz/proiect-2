// Acest script forțează autentificarea în modul de dezvoltare
// Rulează-l în consola browserului

function createTestSession() {
  // Creăm un utilizator de test
  const testUser = {
    id: 'test-user-id-' + Date.now().toString(36),
    email: 'test@example.com',
    user_metadata: {
      name: 'Test User',
      role: 'utilizator'
    },
    app_metadata: {
      provider: 'email'
    },
    aud: 'authenticated',
    role: 'authenticated'
  };

  // Creăm o sesiune de test
  const testSession = {
    access_token: 'test-token-' + Date.now().toString(36),
    refresh_token: 'test-refresh-' + Date.now().toString(36),
    expires_at: Date.now() + 30 * 24 * 3600 * 1000, // 30 zile
    user: testUser
  };

  // Creăm obiectul de sesiune pentru Supabase
  const sessionData = {
    currentSession: testSession,
    expiresAt: Date.now() + 30 * 24 * 3600 * 1000 // 30 zile
  };

  // Salvăm sesiunea în localStorage și sessionStorage
  localStorage.setItem('supabase.auth.token', JSON.stringify(sessionData));
  sessionStorage.setItem('supabase.auth.token', JSON.stringify(sessionData));

  // Creăm și o sesiune de rezervă
  const fallbackSession = {
    access_token: 'test-token-' + Date.now().toString(36),
    refresh_token: 'test-refresh-' + Date.now().toString(36),
    expires_at: Date.now() + 30 * 24 * 3600 * 1000, // 30 zile
    user: testUser
  };
  localStorage.setItem('fallback_session', JSON.stringify(fallbackSession));

  console.log('Sesiune de test creată cu succes!');
  console.log('Reîncarcă pagina pentru a te autentifica automat.');
}

// Rulează funcția
createTestSession();
