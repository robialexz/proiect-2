import { useState, useEffect } from 'react';
import * as tauriClient from '../lib/tauri-client';

/**
 * Hook pentru a utiliza funcționalitățile Tauri în componentele React
 * @returns Funcționalitățile Tauri și informații despre mediul de execuție
 */
export function useTauri() {
  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  const [systemInfo, setSystemInfo] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkEnvironment = async () => {
      setIsLoading(true);
      
      try {
        // Verificăm dacă suntem într-un mediu Tauri
        const isTauriEnv = tauriClient.isTauri();
        setIsDesktop(isTauriEnv);
        
        // Obținem informații despre sistem dacă suntem într-un mediu Tauri
        if (isTauriEnv) {
          const info = await tauriClient.getSystemInfo();
          setSystemInfo(info);
        } else {
          setSystemInfo('Running in browser');
        }
      } catch (error) {
        // Removed console statement
        setSystemInfo('Error checking environment');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkEnvironment();
  }, []);
  
  return {
    isDesktop,
    systemInfo,
    isLoading,
    ...tauriClient
  };
}

export default useTauri;
