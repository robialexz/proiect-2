/**
 * Utilitar pentru a șterge complet versiunea veche a site-ului
 * și a forța încărcarea versiunii noi
 */

/**
 * Șterge toate datele din cache, localStorage, sessionStorage, indexedDB
 * și dezînregistrează service worker-ul
 */
export const cleanSite = async (): Promise<void> => {
  console.log("Începe curățarea site-ului...");

  // 1. Ștergem toate datele din localStorage și sessionStorage
  try {
    localStorage.clear();
    sessionStorage.clear();
    console.log("✅ LocalStorage și SessionStorage curățate");
  } catch (error) {
    console.error("❌ Eroare la curățarea localStorage/sessionStorage:", error);
  }

  // 2. Dezînregistrăm service worker-ul
  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      console.log(`✅ ${registrations.length} service worker(s) dezînregistrat(e)`);
    }
  } catch (error) {
    console.error("❌ Eroare la dezînregistrarea service worker-ului:", error);
  }

  // 3. Ștergem cache-ul API
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(async (cacheName) => {
        await caches.delete(cacheName);
      })
    );
    console.log(`✅ ${cacheNames.length} cache(s) șterse`);
  } catch (error) {
    console.error("❌ Eroare la ștergerea cache-ului:", error);
  }

  // 4. Ștergem IndexedDB
  try {
    const databases = await window.indexedDB.databases();
    databases.forEach((db) => {
      if (db.name) {
        window.indexedDB.deleteDatabase(db.name);
      }
    });
    console.log(`✅ ${databases.length} baze de date IndexedDB șterse`);
  } catch (error) {
    console.error("❌ Eroare la ștergerea IndexedDB:", error);
  }

  // 5. Setăm un flag pentru a indica faptul că am curățat site-ul
  sessionStorage.setItem("site_cleaned", "true");
  
  console.log("✅ Curățare completă. Reîncărcăm pagina...");
  
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
