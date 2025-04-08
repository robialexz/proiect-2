import { supabase } from './supabase';

/**
 * Serviciu pentru verificarea conexiunii la Supabase
 */
export const connectionService = {
  /**
   * Verifică dacă există o conexiune la Supabase
   * @returns Promise<boolean> - true dacă există conexiune, false altfel
   */
  async checkConnection(): Promise<boolean> {
    try {
      console.log('Checking connection to Supabase...');
      
      // Folosim un timeout de 5 secunde pentru verificarea conexiunii
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => {
          console.log('Connection check timeout reached');
          reject(new Error('Connection check timeout'));
        }, 5000);
      });
      
      // Încercăm să facem o interogare simplă pentru a verifica conexiunea
      const connectionPromise = supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true })
        .then(() => {
          console.log('Connection to Supabase successful');
          return true;
        })
        .catch(error => {
          console.error('Connection to Supabase failed:', error);
          return false;
        });
      
      // Folosim Promise.race pentru a implementa timeout
      return await Promise.race([connectionPromise, timeoutPromise]);
    } catch (error) {
      console.error('Error checking connection:', error);
      return false;
    }
  },
  
  /**
   * Verifică dacă există o conexiune la internet
   * @returns Promise<boolean> - true dacă există conexiune, false altfel
   */
  async checkInternetConnection(): Promise<boolean> {
    try {
      console.log('Checking internet connection...');
      
      // Folosim un timeout de 5 secunde pentru verificarea conexiunii
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => {
          console.log('Internet connection check timeout reached');
          reject(new Error('Internet connection check timeout'));
        }, 5000);
      });
      
      // Încercăm să facem o cerere către un serviciu extern pentru a verifica conexiunea
      const connectionPromise = fetch('https://www.google.com', { 
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache',
      })
        .then(() => {
          console.log('Internet connection successful');
          return true;
        })
        .catch(error => {
          console.error('Internet connection failed:', error);
          return false;
        });
      
      // Folosim Promise.race pentru a implementa timeout
      return await Promise.race([connectionPromise, timeoutPromise]);
    } catch (error) {
      console.error('Error checking internet connection:', error);
      return false;
    }
  }
};

export default connectionService;
