/**
 * Utilitar pentru a șterge complet versiunea veche a site-ului
 * și a forța încărcarea versiunii noi
 */

/**
 * Șterge toate datele din cache, localStorage, sessionStorage, indexedDB
 * și dezînregistrează service worker-ul
 */
export const cleanSite = async (): Promise<void> => {
  // Removed console statement

  // 1. Ștergem toate datele din localStorage și sessionStorage
  try {
    localStorage.clear();
    sessionStorage.clear();
    // Removed console statement
  } catch (error) {
    // Removed console statement
  }

  // 2. Dezînregistrăm service worker-ul
  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      // Removed console statement
    }
  } catch (error) {
    // Removed console statement
  }

  // 3. Ștergem cache-ul API
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(async (cacheName) => {
        await caches.delete(cacheName);
      })
    );
    // Removed console statement
  } catch (error) {
    // Removed console statement
  }

  // 4. Ștergem IndexedDB
  try {
    const databases = await window.indexedDB.databases();
    databases.forEach((db) => {
      if (db.name) {
        window.indexedDB.deleteDatabase(db.name);
      }
    });
    // Removed console statement
  } catch (error) {
    // Removed console statement
  }

  // 5. Setăm un flag pentru a indica faptul că am curățat site-ul
  sessionStorage.setItem("site_cleaned", "true");
  
  // Removed console statement
  
  // 6. Forțăm reîncărcarea paginii
  window.location.reload(true);
};

/**
 * Verifică dacă site-ul a fost curățat în această sesiune
 */
export const isSiteCleaned = (): boolean => {
  return sessionStorage.getItem("site_cleaned") === "true";
};

// Exportăm funcțiile
export default {
  cleanSite,
  isSiteCleaned,
};
