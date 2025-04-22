import { useState, useEffect } from 'react';

/**
 * Hook pentru utilizarea localStorage cu suport pentru tipuri
 * @param key Cheia pentru localStorage
 * @param initialValue Valoarea inițială
 * @returns [storedValue, setValue] - Valoarea stocată și funcția pentru actualizare
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Funcție pentru a obține valoarea inițială din localStorage sau valoarea implicită
  const readValue = (): T => {
    // Verificăm dacă suntem în browser
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      // Obținem valoarea din localStorage
      const item = window.localStorage.getItem(key);
      
      // Returnăm valoarea parsată sau valoarea implicită
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Removed console statement
      return initialValue;
    }
  };
  
  // Starea pentru valoarea stocată
  const [storedValue, setStoredValue] = useState<T>(readValue);
  
  // Funcție pentru actualizarea valorii în localStorage și în stare
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Verificăm dacă valoarea este o funcție
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Actualizăm starea
      setStoredValue(valueToStore);
      
      // Verificăm dacă suntem în browser
      if (typeof window !== 'undefined') {
        // Salvăm valoarea în localStorage
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // Emitem un eveniment pentru a notifica alte componente
        window.dispatchEvent(new Event('local-storage'));
      }
    } catch (error) {
      // Removed console statement
    }
  };
  
  // Ascultăm evenimentele de storage pentru a actualiza starea când valoarea se schimbă în altă fereastră
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };
    
    // Ascultăm evenimentele de storage
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleStorageChange);
    
    // Curățăm event listener-urile la unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange);
    };
  }, []);
  
  return [storedValue, setValue];
}

export default useLocalStorage;
