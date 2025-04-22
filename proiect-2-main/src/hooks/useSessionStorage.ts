import { useState, useEffect } from 'react';

/**
 * Hook pentru utilizarea sessionStorage cu suport pentru tipuri
 * @param key Cheia pentru sessionStorage
 * @param initialValue Valoarea inițială
 * @returns [storedValue, setValue] - Valoarea stocată și funcția pentru actualizare
 */
export function useSessionStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Funcție pentru a obține valoarea inițială din sessionStorage sau valoarea implicită
  const readValue = (): T => {
    // Verificăm dacă suntem în browser
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      // Obținem valoarea din sessionStorage
      const item = window.sessionStorage.getItem(key);
      
      // Returnăm valoarea parsată sau valoarea implicită
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Removed console statement
      return initialValue;
    }
  };
  
  // Starea pentru valoarea stocată
  const [storedValue, setStoredValue] = useState<T>(readValue);
  
  // Funcție pentru actualizarea valorii în sessionStorage și în stare
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Verificăm dacă valoarea este o funcție
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Actualizăm starea
      setStoredValue(valueToStore);
      
      // Verificăm dacă suntem în browser
      if (typeof window !== 'undefined') {
        // Salvăm valoarea în sessionStorage
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
        
        // Emitem un eveniment pentru a notifica alte componente
        window.dispatchEvent(new Event('session-storage'));
      }
    } catch (error) {
      // Removed console statement
    }
  };
  
  // Ascultăm evenimentele de storage pentru a actualiza starea când valoarea se schimbă
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };
    
    // Ascultăm evenimentele de storage
    window.addEventListener('session-storage', handleStorageChange);
    
    // Curățăm event listener-urile la unmount
    return () => {
      window.removeEventListener('session-storage', handleStorageChange);
    };
  }, []);
  
  return [storedValue, setValue];
}

export default useSessionStorage;
