import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { measurePerformance } from '@/lib/performance-optimizer';

/**
 * Hook pentru gestionarea tranzițiilor între pagini
 * Acest hook oferă funcționalități pentru a îmbunătăți experiența de tranziție între pagini
 */
export function usePageTransition() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [previousLocation, setPreviousLocation] = useState('');
  const [transitionComplete, setTransitionComplete] = useState(false);

  // Gestionăm schimbarea locației
  useEffect(() => {
    const endMeasurement = measurePerformance(`Page transition to ${location.pathname}`);
    
    // Resetăm starea de tranziție
    setIsLoading(true);
    setTransitionComplete(false);
    
    // Simulăm o tranziție fluidă
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Marcăm tranziția ca fiind completă după ce pagina s-a încărcat
      const completeTimer = setTimeout(() => {
        setTransitionComplete(true);
        endMeasurement();
      }, 100);
      
      return () => clearTimeout(completeTimer);
    }, 100); // Reducem timpul de tranziție la 100ms pentru o experiență mai fluidă
    
    // Salvăm locația anterioară
    setPreviousLocation(location.pathname);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return {
    isLoading,
    transitionComplete,
    previousLocation,
    currentLocation: location.pathname
  };
}

export default usePageTransition;
