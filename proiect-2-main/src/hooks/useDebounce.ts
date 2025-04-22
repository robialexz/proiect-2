import { useState, useEffect } from 'react';

/**
 * Hook pentru debounce - întârzie actualizarea unei valori
 * @param value Valoarea de debounce
 * @param delay Întârzierea în milisecunde
 * @returns Valoarea după debounce
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  // Starea pentru valoarea debounced
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    // Setăm un timer pentru a actualiza valoarea după întârziere
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    // Curățăm timer-ul la unmount sau când valoarea se schimbă
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

export default useDebounce;
