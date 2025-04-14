/**
 * Serviciu pentru încărcarea optimizată a datelor
 * Acest serviciu oferă funcții pentru încărcarea și gestionarea datelor
 */

import { cacheService } from './cache-service';
import { supabaseService } from './supabase-service';
import { offlineService } from './offline-service';

// Namespace pentru cache-ul de date
const DATA_CACHE_NAMESPACE = 'data';

// Durata implicită de expirare a cache-ului (5 minute)
const DEFAULT_CACHE_EXPIRY = 5 * 60 * 1000;

/**
 * Încarcă date din Supabase cu suport pentru cache și offline
 * @param table Numele tabelului
 * @param columns Coloanele de selectat
 * @param options Opțiuni pentru interogare
 * @param cacheKey Cheia pentru cache (opțional, implicit numele tabelului)
 * @param expireIn Durata de expirare în milisecunde (opțional)
 */
export async function loadData<T>(
  table: string,
  columns: string,
  options: any = {},
  cacheKey?: string,
  expireIn: number = DEFAULT_CACHE_EXPIRY
): Promise<T[]> {
  // Generăm cheia de cache dacă nu este specificată
  const key = cacheKey || `${table}_${columns}_${JSON.stringify(options)}`;

  try {
    // Verificăm dacă datele sunt în cache
    const cachedData = cacheService.get<T[]>(key, {
      namespace: DATA_CACHE_NAMESPACE
    });

    if (cachedData) {
      console.log(`[DataLoader] Using cached data for ${key}`);
      return cachedData;
    }

    // Verificăm dacă suntem offline
    if (!offlineService.isOnline()) {
      console.log(`[DataLoader] Device is offline, checking offline data for ${key}`);

      // Verificăm dacă avem date offline
      const offlineData = offlineService.getOfflineData<T[]>(key);

      if (offlineData) {
        console.log(`[DataLoader] Using offline data for ${key}`);
        return offlineData;
      }

      console.warn(`[DataLoader] No offline data available for ${key}`);
      return [];
    }

    // Încărcăm datele din Supabase
    console.log(`[DataLoader] Fetching data for ${key}`);
    const response = await supabaseService.select(table, columns, options);

    if (response.status === 'error') {
      console.error(`[DataLoader] Error fetching data for ${key}:`, response.error);
      // Verificăm dacă avem date offline ca fallback în caz de eroare
      const offlineData = offlineService.getOfflineData<T[]>(key);
      if (offlineData) {
        console.log(`[DataLoader] Using offline data as fallback after error for ${key}`);
        return offlineData;
      }
      throw new Error(response.error?.message || 'Unknown error');
    }

    const data = response.data as T[] || [];

    // Salvăm datele în cache doar dacă avem date valide
    if (data && Array.isArray(data)) {
      cacheService.set(key, data, {
        namespace: DATA_CACHE_NAMESPACE,
        expireIn
      });

      // Salvăm datele pentru utilizare offline
      offlineService.storeOfflineData(key, data);
    }

    return data;
  } catch (error) {
    console.error(`[DataLoader] Unexpected error fetching data for ${key}:`, error);

    // Încercăm să recuperăm date din cache sau offline în caz de eroare
    const cachedData = cacheService.get<T[]>(key, {
      namespace: DATA_CACHE_NAMESPACE
    });

    if (cachedData) {
      console.log(`[DataLoader] Using cached data after error for ${key}`);
      return cachedData;
    }

    const offlineData = offlineService.getOfflineData<T[]>(key);
    if (offlineData) {
      console.log(`[DataLoader] Using offline data after error for ${key}`);
      return offlineData;
    }

    // Dacă nu avem date de rezervă, aruncăm eroarea
    throw error;
  }
}

/**
 * Preîncarcă date pentru utilizare ulterioară
 * @param table Numele tabelului
 * @param columns Coloanele de selectat
 * @param options Opțiuni pentru interogare
 * @param cacheKey Cheia pentru cache (opțional)
 * @param expireIn Durata de expirare în milisecunde (opțional)
 */
export async function preloadData<T>(
  table: string,
  columns: string,
  options: any = {},
  cacheKey?: string,
  expireIn: number = DEFAULT_CACHE_EXPIRY
): Promise<void> {
  try {
    // Generăm cheia de cache dacă nu este specificată
    const key = cacheKey || `${table}_${columns}_${JSON.stringify(options)}`;

    // Verificăm dacă datele sunt deja în cache
    const cachedData = cacheService.get<T[]>(key, {
      namespace: DATA_CACHE_NAMESPACE
    });

    if (cachedData) {
      console.log(`[DataLoader] Data already preloaded for ${key}`);
      return;
    }

    // Preîncărcăm datele
    console.log(`[DataLoader] Preloading data for ${key}`);
    await loadData<T>(table, columns, options, key, expireIn);

    console.log(`[DataLoader] Data preloaded for ${key}`);
  } catch (error) {
    console.error('[DataLoader] Error preloading data:', error);
  }
}

/**
 * Invalidează cache-ul pentru o anumită cheie
 * @param cacheKey Cheia pentru cache
 */
export function invalidateCache(cacheKey: string): void {
  cacheService.delete(cacheKey, {
    namespace: DATA_CACHE_NAMESPACE
  });
  console.log(`[DataLoader] Cache invalidated for ${cacheKey}`);
}

/**
 * Invalidează tot cache-ul de date
 */
export function invalidateAllCache(): void {
  cacheService.clearNamespace(DATA_CACHE_NAMESPACE);
  console.log('[DataLoader] All data cache invalidated');
}

// Exportăm toate funcțiile într-un singur obiect
export const dataLoader = {
  loadData,
  preloadData,
  invalidateCache,
  invalidateAllCache
};
