import { supabase } from './supabase';

// Stare globală pentru a ține evidența stării conexiunii
let lastConnectionState = {
  internet: true,
  supabase: true,
  lastChecked: 0
};

// Interval minim între verificări (5 secunde)
const MIN_CHECK_INTERVAL = 5000;

/**
 * Serviciu pentru verificarea conexiunii la Supabase
 */
const connectionService = {
  /**
   * Verifică dacă există o conexiune la Supabase
   * @returns Promise<boolean> - true dacă există conexiune, false altfel
   */
  async checkConnection(): Promise<boolean> {
    try {
      // Verificăm dacă am verificat recent conexiunea pentru a evita verificări prea frecvente
      const now = Date.now();
      if (now - lastConnectionState.lastChecked < MIN_CHECK_INTERVAL) {
        console.log('Using cached connection state for Supabase');
        return lastConnectionState.supabase;
      }

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
      const result = await Promise.race([connectionPromise, timeoutPromise]);

      // Actualizăm starea conexiunii
      lastConnectionState.supabase = result;
      lastConnectionState.lastChecked = now;

      return result;
    } catch (error) {
      console.error('Error checking connection:', error);
      lastConnectionState.supabase = false;
      lastConnectionState.lastChecked = Date.now();
      return false;
    }
  },

  /**
   * Verifică dacă există o conexiune la internet
   * @returns Promise<boolean> - true dacă există conexiune, false altfel
   */
  async checkInternetConnection(): Promise<boolean> {
    try {
      // Verificăm dacă am verificat recent conexiunea pentru a evita verificări prea frecvente
      const now = Date.now();
      if (now - lastConnectionState.lastChecked < MIN_CHECK_INTERVAL) {
        console.log('Using cached connection state for internet');
        return lastConnectionState.internet;
      }

      console.log('Checking internet connection...');

      // Folosim un timeout de 3 secunde pentru verificarea conexiunii - redus pentru performanță mai bună
      const timeoutPromise = new Promise<boolean>((resolve, _) => {
        setTimeout(() => {
          console.log('Internet connection check timeout reached');
          // În loc să aruncăm o eroare, returnam false pentru a evita întreruperea fluxului
          resolve(false);
        }, 3000); // Redus de la 5000ms la 3000ms
      });

      // Încercăm să facem o cerere către un serviciu extern pentru a verifica conexiunea
      // Folosim mai multe servicii pentru a crește șansele de succes
      const services = [
        'https://www.google.com',
        'https://www.cloudflare.com',
        'https://www.microsoft.com'
      ];

      // Creăm promisiuni pentru fiecare serviciu
      const connectionPromises = services.map(service =>
        fetch(service, {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache',
        })
        .then(() => true)
        .catch(() => false)
      );

      // Dacă oricare dintre servicii răspunde, considerăm că există conexiune la internet
      const anyConnectionPromise = Promise.all(connectionPromises)
        .then(results => results.some(result => result))
        .then(result => {
          console.log(result ? 'Internet connection successful' : 'Internet connection failed');
          return result;
        })
        .catch(error => {
          console.error('Internet connection check failed:', error);
          return false;
        });

      // Folosim Promise.race pentru a implementa timeout
      const result = await Promise.race([anyConnectionPromise, timeoutPromise]);

      // Actualizăm starea conexiunii
      lastConnectionState.internet = result;
      lastConnectionState.lastChecked = now;

      return result;
    } catch (error) {
      console.error('Error checking internet connection:', error);
      lastConnectionState.internet = false;
      lastConnectionState.lastChecked = Date.now();
      return false;
    }
  },

  /**
   * Verifică dacă există conexiune la internet și la Supabase
   * @returns Promise<{internet: boolean, supabase: boolean}>
   */
  async checkConnections(): Promise<{internet: boolean, supabase: boolean}> {
    // Verificăm mai întâi conexiunea la internet
    const hasInternet = await this.checkInternetConnection();

    // Dacă nu există conexiune la internet, nu are rost să verificăm conexiunea la Supabase
    if (!hasInternet) {
      return {
        internet: false,
        supabase: false
      };
    }

    // Verificăm conexiunea la Supabase
    const hasSupabaseConnection = await this.checkConnection();

    return {
      internet: hasInternet,
      supabase: hasSupabaseConnection
    };
  }
}

export default connectionService;
