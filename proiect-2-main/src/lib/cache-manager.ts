/**
 * Sistem de gestionare a cache-ului pentru date
 * Oferă funcții pentru stocarea și recuperarea datelor din cache
 */

// Tipuri pentru cache
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number | null; // null înseamnă că nu expiră
}

interface CacheOptions {
  expiry?: number; // Timpul de expirare în milisecunde
  namespace?: string; // Namespace pentru a grupa elementele din cache
}

// Cache-ul în memorie
const memoryCache = new Map<string, CacheItem<any>>();

// Dimensiunea maximă a cache-ului în memorie
const MAX_MEMORY_CACHE_SIZE = 100;

/**
 * Setează un element în cache
 * @param key Cheia elementului
 * @param data Datele de stocat
 * @param options Opțiunile de cache
 */
export function setCacheItem<T>(
  key: string,
  data: T,
  options: CacheOptions = {}
): void {
  const { expiry = 5 * 60 * 1000, namespace = 'default' } = options; // 5 minute implicit
  
  // Construim cheia completă
  const fullKey = `${namespace}:${key}`;
  
  // Creăm elementul de cache
  const cacheItem: CacheItem<T> = {
    data,
    timestamp: Date.now(),
    expiry: expiry ? Date.now() + expiry : null
  };
  
  // Stocăm în cache-ul din memorie
  memoryCache.set(fullKey, cacheItem);
  
  // Stocăm în localStorage dacă este posibil
  try {
    localStorage.setItem(
      `cache:${fullKey}`,
      JSON.stringify({
        data,
        timestamp: cacheItem.timestamp,
        expiry: cacheItem.expiry
      })
    );
  } catch (error) {
    // Removed console statement
  }
  
  // Verificăm dimensiunea cache-ului din memorie
  if (memoryCache.size > MAX_MEMORY_CACHE_SIZE) {
    // Eliminăm cel mai vechi element
    const oldestKey = [...memoryCache.entries()]
      .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
    memoryCache.delete(oldestKey);
  }
}

/**
 * Obține un element din cache
 * @param key Cheia elementului
 * @param options Opțiunile de cache
 * @returns Datele din cache sau null dacă nu există sau a expirat
 */
export function getCacheItem<T>(
  key: string,
  options: CacheOptions = {}
): T | null {
  const { namespace = 'default' } = options;
  
  // Construim cheia completă
  const fullKey = `${namespace}:${key}`;
  
  // Verificăm cache-ul din memorie
  const memoryItem = memoryCache.get(fullKey);
  
  if (memoryItem) {
    // Verificăm dacă a expirat
    if (memoryItem.expiry && memoryItem.expiry < Date.now()) {
      // A expirat, îl eliminăm
      memoryCache.delete(fullKey);
      try {
        localStorage.removeItem(`cache:${fullKey}`);
      } catch (error) {
        // Removed console statement
      }
      return null;
    }
    
    // Nu a expirat, îl returnăm
    return memoryItem.data;
  }
  
  // Verificăm localStorage
  try {
    const localStorageItem = localStorage.getItem(`cache:${fullKey}`);
    
    if (localStorageItem) {
      const parsedItem = JSON.parse(localStorageItem) as CacheItem<T>;
      
      // Verificăm dacă a expirat
      if (parsedItem.expiry && parsedItem.expiry < Date.now()) {
        // A expirat, îl eliminăm
        localStorage.removeItem(`cache:${fullKey}`);
        return null;
      }
      
      // Nu a expirat, îl adăugăm în cache-ul din memorie și îl returnăm
      memoryCache.set(fullKey, parsedItem);
      return parsedItem.data;
    }
  } catch (error) {
    // Removed console statement
  }
  
  // Nu există în cache
  return null;
}

/**
 * Elimină un element din cache
 * @param key Cheia elementului
 * @param options Opțiunile de cache
 */
export function removeCacheItem(
  key: string,
  options: CacheOptions = {}
): void {
  const { namespace = 'default' } = options;
  
  // Construim cheia completă
  const fullKey = `${namespace}:${key}`;
  
  // Eliminăm din cache-ul din memorie
  memoryCache.delete(fullKey);
  
  // Eliminăm din localStorage
  try {
    localStorage.removeItem(`cache:${fullKey}`);
  } catch (error) {
    // Removed console statement
  }
}

/**
 * Elimină toate elementele din cache pentru un namespace
 * @param namespace Namespace-ul pentru care să eliminăm elementele
 */
export function clearCacheNamespace(namespace: string = 'default'): void {
  // Eliminăm din cache-ul din memorie
  for (const key of memoryCache.keys()) {
    if (key.startsWith(`${namespace}:`)) {
      memoryCache.delete(key);
    }
  }
  
  // Eliminăm din localStorage
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`cache:${namespace}:`)) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    // Removed console statement
  }
}

/**
 * Elimină toate elementele expirate din cache
 */
export function clearExpiredCache(): void {
  const now = Date.now();
  
  // Eliminăm din cache-ul din memorie
  for (const [key, item] of memoryCache.entries()) {
    if (item.expiry && item.expiry < now) {
      memoryCache.delete(key);
    }
  }
  
  // Eliminăm din localStorage
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache:')) {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const parsedItem = JSON.parse(item) as CacheItem<any>;
            if (parsedItem.expiry && parsedItem.expiry < now) {
              localStorage.removeItem(key);
            }
          } catch (error) {
            // Ignorăm erorile de parsare
          }
        }
      }
    }
  } catch (error) {
    // Removed console statement
  }
}

/**
 * Verifică dacă un element există în cache și nu a expirat
 * @param key Cheia elementului
 * @param options Opțiunile de cache
 * @returns True dacă elementul există și nu a expirat, false în caz contrar
 */
export function hasCacheItem(
  key: string,
  options: CacheOptions = {}
): boolean {
  return getCacheItem(key, options) !== null;
}

/**
 * Obține un element din cache sau îl generează dacă nu există
 * @param key Cheia elementului
 * @param generator Funcția pentru generarea datelor
 * @param options Opțiunile de cache
 * @returns Datele din cache sau generate
 */
export async function getCacheItemOrGenerate<T>(
  key: string,
  generator: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Verificăm dacă elementul există în cache
  const cachedItem = getCacheItem<T>(key, options);
  
  if (cachedItem !== null) {
    return cachedItem;
  }
  
  // Nu există în cache, îl generăm
  try {
  const generatedData = await generator();
  } catch (error) {
    // Handle error appropriately
  }
  
  // Îl stocăm în cache
  setCacheItem(key, generatedData, options);
  
  // Îl returnăm
  return generatedData;
}

/**
 * Inițializează sistemul de cache
 * Curăță elementele expirate și setează un interval pentru curățarea periodică
 */
export function initializeCache(): void {
  // Curățăm elementele expirate
  clearExpiredCache();
  
  // Setăm un interval pentru curățarea periodică
  setInterval(clearExpiredCache, 5 * 60 * 1000); // 5 minute
}

// Inițializăm cache-ul
if (typeof window !== 'undefined') {
  initializeCache();
}

// Exportăm toate funcțiile într-un singur obiect
export default {
  setCacheItem,
  getCacheItem,
  removeCacheItem,
  clearCacheNamespace,
  clearExpiredCache,
  hasCacheItem,
  getCacheItemOrGenerate,
  initializeCache
};
