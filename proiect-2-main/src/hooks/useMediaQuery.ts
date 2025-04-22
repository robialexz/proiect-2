import { useState, useEffect } from 'react';

/**
 * Hook pentru a verifica dacă un media query se potrivește
 * @param query Media query-ul de verificat
 * @returns True dacă media query-ul se potrivește, false în caz contrar
 */
export function useMediaQuery(query: string): boolean {
  // Funcție pentru a verifica dacă media query-ul se potrivește
  const getMatches = (): boolean => {
    // Verificăm dacă suntem în browser
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  };
  
  // Starea pentru rezultatul media query-ului
  const [matches, setMatches] = useState<boolean>(getMatches());
  
  // Funcție pentru a actualiza starea când media query-ul se schimbă
  function handleChange() {
    setMatches(getMatches());
  }
  
  useEffect(() => {
    // Verificăm dacă suntem în browser
    if (typeof window === 'undefined') {
      return;
    }
    
    // Creăm un MediaQueryList
    const mediaQuery = window.matchMedia(query);
    
    // Adăugăm un event listener pentru schimbări
    // Folosim API-ul vechi pentru compatibilitate
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // @ts-ignore - Pentru browsere mai vechi
      mediaQuery.addListener(handleChange);
    }
    
    // Actualizăm starea inițială
    handleChange();
    
    // Curățăm event listener-ul la unmount
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // @ts-ignore - Pentru browsere mai vechi
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [query]);
  
  return matches;
}

// Hooks predefinite pentru breakpoint-uri comune
export const useIsMobile = () => useMediaQuery('(max-width: 640px)');
export const useIsTablet = () => useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');
export const useIsDarkMode = () => useMediaQuery('(prefers-color-scheme: dark)');

export default useMediaQuery;
