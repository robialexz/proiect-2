import { useState, useEffect, useCallback } from 'react';
import { dataLoader } from '@/lib/data-loader';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();

  // Generăm cheia de cache dacă nu este specificată
  const key = cacheKey || `${table}_${columns}_${JSON.stringify(options)}`;

  // Funcție pentru încărcarea datelor - optimizată cu useCallback
  const loadData = useCallback(async (showToast = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await dataLoader.loadData<T>(table, columns, options, key, expireIn);
      setData(result);
      if (showToast) {
        toast({
          title: "Date încărcate cu succes",
          description: `Datele din ${table} au fost actualizate.`,
          variant: "default"
        });
      }
    } catch (err) {
      // Removed console statement
      setError(err instanceof Error ? err : new Error('Unknown error'));

      // Afișăm o notificare doar dacă este solicitată explicit
      if (showToast) {
        toast({
          title: "Eroare la încărcarea datelor",
          description: err instanceof Error ? err.message : 'Eroare necunoscută',
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [table, columns, JSON.stringify(options), key, expireIn, toast]);

  // Încărcăm datele la montarea componentei și când se schimbă dependențele
  useEffect(() => {
    loadData(false);
  }, [loadData, ...(Array.isArray(dependencies) ? dependencies : [])]);

  // Funcție pentru reîncărcarea manuală a datelor
  const refetch = useCallback(() => {
    // Invalidăm cache-ul pentru a forța reîncărcarea
    dataLoader.invalidateCache(key);
    return loadData(true); // Afișăm notificare la reîncărcare manuală
  }, [key, loadData]);

  return { data, isLoading, error, refetch };
}

export default useDataLoader;
