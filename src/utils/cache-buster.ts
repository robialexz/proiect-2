/**
 * Utilitar pentru a gestiona cache-ul și a forța reîncărcarea paginii
 * când este detectată o versiune nouă a aplicației
 */

// Versiunea curentă a aplicației - schimbă această valoare la fiecare versiune nouă
export const APP_VERSION = "1.0.1";

/**
 * Verifică dacă versiunea aplicației s-a schimbat și forțează reîncărcarea paginii
 * dacă este necesar
 */
export const checkAppVersion = (): void => {
  const lastVersion = localStorage.getItem("app_version");

  if (lastVersion && lastVersion !== APP_VERSION) {
    // Removed console statement

    // Ștergem cache-ul pentru a forța încărcarea noii versiuni
    localStorage.setItem("app_version", APP_VERSION);

    // Forțăm reîncărcarea paginii fără cache
    window.location.reload(true);
  } else if (!lastVersion) {
    // Prima rulare a aplicației, setăm versiunea
    localStorage.setItem("app_version", APP_VERSION);
  }
};

/**
 * Șterge toate datele din localStorage și sessionStorage
 * și forțează reîncărcarea paginii
 */
export const clearAllCacheAndReload = (): void => {
  // Salvăm versiunea curentă
  const currentVersion = APP_VERSION;

  // Ștergem toate datele din localStorage și sessionStorage
  localStorage.clear();
  sessionStorage.clear();

  // Restaurăm versiunea
  localStorage.setItem("app_version", currentVersion);

  // Forțăm reîncărcarea paginii fără cache
  window.location.reload(true);
};

/**
 * Șterge doar datele de autentificare din localStorage și sessionStorage
 * și forțează reîncărcarea paginii
 */
export const clearAuthCacheAndReload = (): void => {
  // Ștergem datele de autentificare din localStorage și sessionStorage
  localStorage.removeItem("supabase.auth.token");
  sessionStorage.removeItem("supabase.auth.token");
  localStorage.removeItem("sb-btvpnzsmrfrlwczanbcg-auth-token");
  sessionStorage.removeItem("sb-btvpnzsmrfrlwczanbcg-auth-token");
  localStorage.removeItem("auth-storage");
  sessionStorage.removeItem("auth-storage");

  // Ștergem toate cheile care conțin "supabase" sau "auth"
  Object.keys(localStorage).forEach((key) => {
    if (key.includes("supabase") || key.includes("auth")) {
      localStorage.removeItem(key);
    }
  });

  Object.keys(sessionStorage).forEach((key) => {
    if (key.includes("supabase") || key.includes("auth")) {
      sessionStorage.removeItem(key);
    }
  });

  // Forțăm reîncărcarea paginii fără cache
  window.location.reload(true);
};

// Adăugăm un buton de "Forțează reîncărcarea" în colțul din dreapta jos
// doar în modul de dezvoltare - am comentat acest cod deoarece am adăugat butonul în AppLayout
/*
if (import.meta.env.DEV) {
  document.addEventListener('DOMContentLoaded', () => {
    const button = document.createElement('button');
    button.innerText = 'Forțează reîncărcarea';
    button.style.position = 'fixed';
    button.style.bottom = '10px';
    button.style.right = '10px';
    button.style.zIndex = '9999';
    button.style.padding = '8px 12px';
    button.style.backgroundColor = '#f44336';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.style.fontWeight = 'bold';

    button.addEventListener('click', () => {
      clearAllCacheAndReload();
    });

    document.body.appendChild(button);
  });
}
*/

// Forțăm o reîncărcare completă a aplicației pentru a încărca versiunea corectă
// Dar doar dacă nu am făcut deja acest lucru în această sesiune
if (!sessionStorage.getItem("forced_reload_done")) {
  // Removed console statement

  // Ștergem cache-ul
  localStorage.clear();
  sessionStorage.setItem("forced_reload_done", "true");
  localStorage.setItem("app_version", APP_VERSION);

  // Forțăm reîncărcarea paginii fără cache
  window.location.reload(true);
} else {
  // Actualizăm versiunea în localStorage pentru a evita reîncărcarea la următoarea accesare
  localStorage.setItem("app_version", APP_VERSION);
}
