import { supabase } from "./supabase";

// Stare globală pentru a ține evidența stării conexiunii
let lastConnectionState = {
  internet: true,
  supabase: true,
  lastChecked: 0,
  retryCount: 0,
  lastError: null as Error | null,
};

// Interval minim între verificări (3 secunde pentru performanță mai bună)
const MIN_CHECK_INTERVAL = 3000;

// Numărul maxim de reîncercări înainte de a considera conexiunea pierdută
const MAX_RETRY_COUNT = 3;

// Eveniment pentru notificarea schimbărilor de stare a conexiunii
const CONNECTION_STATE_CHANGE_EVENT = "connection-state-change";

// Funcție pentru a emite un eveniment de schimbare a stării conexiunii
const emitConnectionStateChange = (state: {
  internet: boolean;
  supabase: boolean;
}) => {
  window.dispatchEvent(
    new CustomEvent(CONNECTION_STATE_CHANGE_EVENT, { detail: state })
  );
};

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
      // În modul de dezvoltare, considerăm întotdeauna că există conexiune la Supabase
      if (import.meta.env.DEV) {
        // Removed console statement
        lastConnectionState.supabase = true;
        lastConnectionState.lastChecked = Date.now();
        return true;
      }

      // Verificăm dacă am verificat recent conexiunea pentru a evita verificări prea frecvente
      const now = Date.now();
      if (now - lastConnectionState.lastChecked < MIN_CHECK_INTERVAL) {
        // Removed console statement
        return lastConnectionState.supabase;
      }

      // Removed console statement

      // Folosim un timeout de 4 secunde pentru verificarea conexiunii (redus pentru performanță mai bună)
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => {
          // Removed console statement
          reject(new Error("Connection check timeout"));
        }, 4000);
      });

      // Încercăm să facem o interogare simplă pentru a verifica conexiunea
      // Folosim o interogare mai ușoară pentru a reduce timpul de răspuns
      const connectionPromise = supabase
        .from("health_check")
        .select("count", { count: "exact", head: true })
        .then(() => {
          // Removed console statement
          // Resetăm contorul de reîncercări în caz de succes
          lastConnectionState.retryCount = 0;
          lastConnectionState.lastError = null;
          return true;
        })
        .catch((error) => {
          // Removed console statement
          // Salvăm eroarea pentru diagnostic
          lastConnectionState.lastError =
            error instanceof Error ? error : new Error(String(error));

          // Încercăm o interogare alternativă dacă prima eșuează
          return supabase
            .from("profiles")
            .select("count", { count: "exact", head: true })
            .then(() => {
              // Removed console statement
              lastConnectionState.retryCount = 0;
              lastConnectionState.lastError = null;
              return true;
            })
            .catch((altError) => {
              // Removed console statement
              lastConnectionState.lastError =
                altError instanceof Error
                  ? altError
                  : new Error(String(altError));
              return false;
            });
        });

      // Folosim Promise.race pentru a implementa timeout
      try {
        const result = await Promise.race([connectionPromise, timeoutPromise]);
      } catch (error) {
        // Handle error appropriately
      }

      // Actualizăm starea conexiunii
      if (!result) {
        // Incrementăm contorul de reîncercări în caz de eșec
        lastConnectionState.retryCount++;

        // Dacă am depășit numărul maxim de reîncercări, considerăm conexiunea pierdută
        if (lastConnectionState.retryCount >= MAX_RETRY_COUNT) {
          lastConnectionState.supabase = false;
          // Emitem un eveniment pentru a notifica schimbarea stării conexiunii
          emitConnectionStateChange({
            internet: lastConnectionState.internet,
            supabase: false,
          });
        }
      } else {
        // În caz de succes, actualizăm starea și emitem un eveniment dacă starea s-a schimbat
        const previousState = lastConnectionState.supabase;
        lastConnectionState.supabase = true;

        if (!previousState) {
          // Emitem un eveniment doar dacă starea s-a schimbat de la offline la online
          emitConnectionStateChange({
            internet: lastConnectionState.internet,
            supabase: true,
          });
        }
      }

      lastConnectionState.lastChecked = now;
      return result;
    } catch (error) {
      // Removed console statement

      // Salvăm eroarea pentru diagnostic
      lastConnectionState.lastError =
        error instanceof Error ? error : new Error(String(error));

      // Incrementăm contorul de reîncercări în caz de eșec
      lastConnectionState.retryCount++;

      // Dacă am depășit numărul maxim de reîncercări, considerăm conexiunea pierdută
      if (lastConnectionState.retryCount >= MAX_RETRY_COUNT) {
        const previousState = lastConnectionState.supabase;
        lastConnectionState.supabase = false;
        lastConnectionState.lastChecked = Date.now();

        if (previousState) {
          // Emitem un eveniment doar dacă starea s-a schimbat de la online la offline
          emitConnectionStateChange({
            internet: lastConnectionState.internet,
            supabase: false,
          });
        }
      }

      return false;
    }
  },

  /**
   * Verifică dacă există o conexiune la internet
   * @returns Promise<boolean> - true dacă există conexiune, false altfel
   */
  async checkInternetConnection(): Promise<boolean> {
    try {
      // În modul de dezvoltare, considerăm întotdeauna că există conexiune la internet
      if (import.meta.env.DEV) {
        // Removed console statement
        lastConnectionState.internet = true;
        lastConnectionState.lastChecked = Date.now();
        return true;
      }

      // Verificăm dacă am verificat recent conexiunea pentru a evita verificări prea frecvente
      const now = Date.now();
      if (now - lastConnectionState.lastChecked < MIN_CHECK_INTERVAL) {
        // Removed console statement
        return lastConnectionState.internet;
      }

      // Removed console statement

      // Folosim un timeout de 3 secunde pentru verificarea conexiunii - redus pentru performanță mai bună
      const timeoutPromise = new Promise<boolean>((resolve, _) => {
        setTimeout(() => {
          // Removed console statement
          // În loc să aruncăm o eroare, returnam false pentru a evita întreruperea fluxului
          resolve(false);
        }, 2500); // Redus pentru performanță mai bună
      });

      // Încercăm să facem o cerere către un serviciu extern pentru a verifica conexiunea
      // Folosim mai multe servicii pentru a crește șansele de succes, inclusiv CDN-uri rapide
      const services = [
        "{process.env.WWW_CLOUDFLARE}",
        "{process.env.WWW_GOOGLE}",
        "{process.env.WWW_MICROSOFT}",
        "{process.env.URL_1}", // CDN JavaScript cu versiune specifică
        "{process.env.URL_2}", // Alt CDN JavaScript cu versiune specifică
      ];

      // Creăm promisiuni pentru fiecare serviciu cu un timeout individual
      const connectionPromises = services.map((service) => {
        // Timeout individual pentru fiecare cerere pentru a evita blocarea
        const fetchWithTimeout = async () => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);

          try {
            const response = await fetch(service, {
              method: "HEAD",
              mode: "no-cors",
              cache: "no-cache",
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return true;
          } catch (error) {
            clearTimeout(timeoutId);
            return false;
          }
        };

        return fetchWithTimeout();
      });

      // Dacă oricare dintre servicii răspunde, considerăm că există conexiune la internet
      const anyConnectionPromise = Promise.all(connectionPromises)
        .then((results) => {
          const hasConnection = results.some((result) => result);
          // Removed console statement

          // Resetăm contorul de reîncercări în caz de succes
          if (hasConnection) {
            lastConnectionState.retryCount = 0;
            lastConnectionState.lastError = null;
          }

          return hasConnection;
        })
        .catch((error) => {
          // Removed console statement
          // Salvăm eroarea pentru diagnostic
          lastConnectionState.lastError =
            error instanceof Error ? error : new Error(String(error));
          return false;
        });

      // Folosim Promise.race pentru a implementa timeout
      try {
        const result = await Promise.race([
          anyConnectionPromise,
          timeoutPromise,
        ]);
      } catch (error) {
        // Handle error appropriately
      }

      // Actualizăm starea conexiunii
      if (!result) {
        // Incrementăm contorul de reîncercări în caz de eșec
        lastConnectionState.retryCount++;

        // Dacă am depășit numărul maxim de reîncercări, considerăm conexiunea pierdută
        if (lastConnectionState.retryCount >= MAX_RETRY_COUNT) {
          const previousState = lastConnectionState.internet;
          lastConnectionState.internet = false;

          if (previousState) {
            // Emitem un eveniment doar dacă starea s-a schimbat de la online la offline
            emitConnectionStateChange({
              internet: false,
              supabase: lastConnectionState.supabase,
            });
          }
        }
      } else {
        // În caz de succes, actualizăm starea și emitem un eveniment dacă starea s-a schimbat
        const previousState = lastConnectionState.internet;
        lastConnectionState.internet = true;

        if (!previousState) {
          // Emitem un eveniment doar dacă starea s-a schimbat de la offline la online
          emitConnectionStateChange({
            internet: true,
            supabase: lastConnectionState.supabase,
          });
        }
      }

      lastConnectionState.lastChecked = now;
      return result;
    } catch (error) {
      // Removed console statement

      // Salvăm eroarea pentru diagnostic
      lastConnectionState.lastError =
        error instanceof Error ? error : new Error(String(error));

      // Incrementăm contorul de reîncercări în caz de eșec
      lastConnectionState.retryCount++;

      // Dacă am depășit numărul maxim de reîncercări, considerăm conexiunea pierdută
      if (lastConnectionState.retryCount >= MAX_RETRY_COUNT) {
        const previousState = lastConnectionState.internet;
        lastConnectionState.internet = false;
        lastConnectionState.lastChecked = Date.now();

        if (previousState) {
          // Emitem un eveniment doar dacă starea s-a schimbat de la online la offline
          emitConnectionStateChange({
            internet: false,
            supabase: lastConnectionState.supabase,
          });
        }
      }

      return false;
    }
  },

  /**
   * Verifică dacă există conexiune la internet și la Supabase
   * @returns Promise<{internet: boolean, supabase: boolean}>
   */
  async checkConnections(): Promise<{ internet: boolean; supabase: boolean }> {
    // Verificăm mai întâi conexiunea la internet
    const hasInternet = await this.checkInternetConnection();

    // Dacă nu există conexiune la internet, nu are rost să verificăm conexiunea la Supabase
    if (!hasInternet) {
      return {
        internet: false,
        supabase: false,
      };
    }

    // Verificăm conexiunea la Supabase
    const hasSupabaseConnection = await this.checkConnection();

    return {
      internet: hasInternet,
      supabase: hasSupabaseConnection,
    };
  },

  /**
   * Adaugă un listener pentru evenimentele de schimbare a stării conexiunii
   * @param callback Funcția care va fi apelată când se schimbă starea conexiunii
   */
  addConnectionStateChangeListener(
    callback: (state: { internet: boolean; supabase: boolean }) => void
  ): void {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{
        internet: boolean;
        supabase: boolean;
      }>;
      callback(customEvent.detail);
    };

    window.addEventListener(CONNECTION_STATE_CHANGE_EVENT, handler);

    // Returnam o funcție pentru a elimina listener-ul
    return () => {
      window.removeEventListener(CONNECTION_STATE_CHANGE_EVENT, handler);
    };
  },

  /**
   * Returnează starea curentă a conexiunii
   */
  getCurrentConnectionState(): {
    internet: boolean;
    supabase: boolean;
    lastChecked: number;
    lastError: Error | null;
  } {
    return {
      internet: lastConnectionState.internet,
      supabase: lastConnectionState.supabase,
      lastChecked: lastConnectionState.lastChecked,
      lastError: lastConnectionState.lastError,
    };
  },
};

export default connectionService;
