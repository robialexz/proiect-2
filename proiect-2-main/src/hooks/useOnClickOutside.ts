import { useEffect, RefObject } from 'react';

/**
 * Hook pentru a detecta click-urile în afara unui element
 * @param ref Referința către element
 * @param handler Funcția de handler pentru click-uri în afară
 */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
): void {
  useEffect(() => {
    // Funcție pentru a gestiona click-urile
    const listener = (event: MouseEvent | TouchEvent) => {
      // Verificăm dacă click-ul a fost în afara elementului
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      
      handler(event);
    };
    
    // Adăugăm event listener-uri pentru mouse și touch
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    
    // Curățăm event listener-urile la unmount
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

export default useOnClickOutside;
