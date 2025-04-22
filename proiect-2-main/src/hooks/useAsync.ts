import { useState, useCallback, useEffect } from 'react';

// Stările posibile pentru o operațiune asincronă
export type AsyncStatus = 'idle' | 'pending' | 'success' | 'error';

// Tipul pentru rezultatul hook-ului
export interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

// Opțiuni pentru hook
export interface AsyncOptions<T> {
  initialData?: T | null;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onSettled?: (data: T | null, error: Error | null) => void;
  autoExecute?: boolean;
  deps?: any[];
}

/**
 * Hook pentru gestionarea operațiunilor asincrone
 * @param asyncFunction Funcția asincronă de executat
 * @param options Opțiuni pentru hook
 * @returns Starea operațiunii și funcții pentru control
 */
export function useAsync<T, Args extends any[] = any[]>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: AsyncOptions<T> = {}
) {
  // Extragem opțiunile
  const {
    initialData = null,
    onSuccess,
    onError,
    onSettled,
    autoExecute = false,
    deps = []
  } = options;
  
  // Starea pentru operațiunea asincronă
  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: initialData,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false
  });
  
  // Funcție pentru a reseta starea
  const reset = useCallback(() => {
    setState({
      status: 'idle',
      data: initialData,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false
    });
  }, [initialData]);
  
  // Funcție pentru a executa operațiunea asincronă
  const execute = useCallback(
    async (...args: Args) => {
      // Setăm starea de loading
      setState({
        status: 'pending',
        data: initialData,
        error: null,
        isLoading: true,
        isSuccess: false,
        isError: false
      });
      
      try {
        // Executăm funcția asincronă
        const data = await asyncFunction(...args);
        
        // Setăm starea de succes
        setState({
          status: 'success',
          data,
          error: null,
          isLoading: false,
          isSuccess: true,
          isError: false
        });
        
        // Apelăm callback-ul de succes
        onSuccess?.(data);
        
        // Apelăm callback-ul de settled
        onSettled?.(data, null);
        
        return data;
      } catch (error) {
        // Setăm starea de eroare
        setState({
          status: 'error',
          data: initialData,
          error: error as Error,
          isLoading: false,
          isSuccess: false,
          isError: true
        });
        
        // Apelăm callback-ul de eroare
        onError?.(error as Error);
        
        // Apelăm callback-ul de settled
        onSettled?.(null, error as Error);
        
        throw error;
      }
    },
    [asyncFunction, initialData, onSuccess, onError, onSettled, ...deps]
  );
  
  // Executăm automat funcția dacă este specificat
  useEffect(() => {
    if (autoExecute) {
      execute();
    }
  }, [autoExecute, execute]);
  
  return {
    ...state,
    execute,
    reset
  };
}

export default useAsync;
