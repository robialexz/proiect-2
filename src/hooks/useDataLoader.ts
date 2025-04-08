import { useState, useEffect } from 'react';
import { dataLoader } from '@/lib/data-loader';

/**
 * Hook pentru încărcarea optimizată a datelor
 * @param table Numele tabelului
 * @param columns Coloanele de selectat
 * @param options Opțiuni pentru interogare
 * @param cacheKey Cheia pentru cache (opțional)
 * @param expireIn Durata de expirare în milisecunde (opțional)
 * @param dependencies Dependențe pentru reîncărcare (opțional)
 */
export function useDataLoader<T>(
  table: string,
  columns: string,
  options: any = {},
  cacheKey?: string,
  expireIn?: number,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Generăm cheia de cache dacă nu este specificată
  const key = cacheKey || `${table}_${columns}_${JSON.stringify(options)}`;

  // Funcție pentru încărcarea datelor
  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await dataLoader.loadData<T>(table, columns, options, key, expireIn);
      setData(result);
    } catch (err) {
      console.error(`Error loading data for ${key}:`, err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Încărcăm datele la montarea componentei și când se schimbă dependențele
  useEffect(() => {
    loadData();
  }, [key, ...dependencies]);

  // Funcție pentru reîncărcarea manuală a datelor
  const refetch = () => {
    // Invalidăm cache-ul pentru a forța reîncărcarea
    dataLoader.invalidateCache(key);
    return loadData();
  };

  return { data, isLoading, error, refetch };
}

export default useDataLoader;
