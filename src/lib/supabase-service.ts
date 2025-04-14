import { supabase } from './supabase';
import { PostgrestError } from '@supabase/supabase-js';
import fallbackAuth from "./fallback-auth";
import connectionService from './connection-service';
import { cacheService } from './cache-service';
import { errorHandler, ErrorType } from './error-handler';
import { inputValidation } from './input-validation';

// Flag pentru a activa autentificarea de rezervă - dezactivat în producție pentru securitate
const USE_FALLBACK_AUTH = import.meta.env.DEV ? true : false; // Activat doar în dezvoltare

// Flag pentru a activa cache-ul offline
const USE_OFFLINE_CACHE = true; // Setați la false pentru a dezactiva cache-ul offline

// Tipuri pentru gestionarea erorilor
export interface SupabaseErrorResponse {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// Tipuri pentru răspunsuri
export interface SupabaseResponse<T> {
  data: T | null;
  error: SupabaseErrorResponse | null;
  status: 'success' | 'error';
  fromCache?: boolean; // Indică dacă datele provin din cache
}

// Verifică conexiunea înainte de a face cereri la Supabase
const checkConnectionBeforeRequest = async (): Promise<boolean> => {
  // Verificăm conexiunea la internet și la Supabase
  const { internet, supabase: hasSupabaseConnection } = await connectionService.checkConnections();

  // Dacă nu există conexiune la internet sau la Supabase, returnează false
  return internet && hasSupabaseConnection;
};

// Funcție pentru a transforma erorile PostgrestError în SupabaseErrorResponse - îmbunătățită pentru securitate
const formatError = (error: PostgrestError | Error | unknown): SupabaseErrorResponse => {
  // Ascundem detaliile tehnice în producție pentru a preveni scurgerea de informații
  const isProduction = process.env.NODE_ENV === 'production';

  if (error instanceof Error) {
    if ('code' in error && 'details' in error && 'hint' in error && 'message' in error) {
      // Este un PostgrestError
      const pgError = error as PostgrestError;
      return {
        message: pgError.message,
        // Ascundem detaliile în producție
        details: isProduction ? undefined : pgError.details || undefined,
        hint: isProduction ? undefined : pgError.hint || undefined,
        code: pgError.code,
      };
    }
    // Este un Error standard
    return {
      message: error.message,
      // Ascundem stack trace în producție
      details: isProduction ? undefined : error.stack,
    };
  }
  // Este un tip necunoscut de eroare
  return {
    message: 'An unknown error occurred',
    // Ascundem detaliile în producție
    details: isProduction ? undefined : (error ? JSON.stringify(error) : undefined),
  };
};

// Funcție pentru a gestiona răspunsurile de la Supabase
const handleResponse = <T>(data: T | null, error: PostgrestError | null): SupabaseResponse<T> => {
  if (error) {
    return {
      data: null,
      error: formatError(error),
      status: 'error',
    };
  }
  return {
    data,
    error: null,
    status: 'success',
  };
};

// Funcție pentru a gestiona erorile în promisiuni
const handlePromise = async <T>(promise: Promise<{ data: T | null; error: PostgrestError | null }>): Promise<SupabaseResponse<T>> => {
  try {
    const { data, error } = await promise;
    return handleResponse(data, error);
  } catch (error) {
    return {
      data: null,
      error: formatError(error),
      status: 'error',
    };
  }
};

// Serviciu pentru interacțiuni cu Supabase
export const supabaseService = {
  // Funcții generice CRUD
  async select<T>(table: string, columns: string = '*', options?: {
    filters?: Record<string, any>;
    order?: { column: string; ascending?: boolean };
    limit?: number;
    single?: boolean;
  }): Promise<SupabaseResponse<T>> {
    try {
      // Validare pentru securitate
      if (!inputValidation.validateText(table)) {
        throw new Error('Invalid table name');
      }

      if (!inputValidation.validateText(columns)) {
        throw new Error('Invalid columns');
      }

      let query = supabase.from(table).select(columns);

      // Aplicăm filtrele cu validare
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          // Validare pentru securitate
          if (!inputValidation.validateText(key)) {
            throw new Error(`Invalid filter key: ${key}`);
          }

          if (value !== undefined && value !== null) {
            // Pentru valori de tip string, validăm pentru a preveni SQL injection
            if (typeof value === 'string' && !inputValidation.validateText(value)) {
              throw new Error(`Invalid filter value for ${key}`);
            }

            query = query.eq(key, value);
          }
        });
      }

      // Aplicăm ordinea cu validare
      if (options?.order) {
        // Validare pentru securitate
        if (!inputValidation.validateText(options.order.column)) {
          throw new Error(`Invalid order column: ${options.order.column}`);
        }

        query = query.order(options.order.column, { ascending: options.order.ascending ?? false });
      }

      // Aplicăm limita
      if (options?.limit) {
        if (options.limit < 0 || options.limit > 1000) {
          throw new Error('Invalid limit value. Must be between 0 and 1000.');
        }

        query = query.limit(options.limit);
      }

      // Returnăm un singur rezultat sau o listă
      if (options?.single) {
        return handlePromise<T>(query.single());
      }
      return handlePromise<T[]>(query) as unknown as Promise<SupabaseResponse<T>>;
    } catch (error) {
      // Folosim errorHandler pentru o gestionare mai bună a erorilor
      errorHandler.handleError(error, false);

      return {
        data: null,
        error: formatError(error),
        status: 'error',
      };
    }
  },

  async insert<T>(table: string, data: Partial<T> | Partial<T>[]): Promise<SupabaseResponse<T>> {
    try {
      return handlePromise<T>(supabase.from(table).insert(data).select());
    } catch (error) {
      return {
        data: null,
        error: formatError(error),
        status: 'error',
      };
    }
  },

  async update<T>(table: string, data: Partial<T>, filters: Record<string, any>): Promise<SupabaseResponse<T>> {
    try {
      let query = supabase.from(table).update(data);

      // Aplicăm filtrele
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      return handlePromise<T>(query.select());
    } catch (error) {
      return {
        data: null,
        error: formatError(error),
        status: 'error',
      };
    }
  },

  async delete<T>(table: string, filters: Record<string, any>): Promise<SupabaseResponse<T>> {
    try {
      let query = supabase.from(table).delete();

      // Aplicăm filtrele
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      return handlePromise<T>(query.select());
    } catch (error) {
      return {
        data: null,
        error: formatError(error),
        status: 'error',
      };
    }
  },

  // Funcții pentru autentificare
  auth: {
    async signIn(email: string, password: string) {
      try {
        console.log('Starting authentication process for:', email);

        // În mediul de dezvoltare, permitem autentificarea cu orice email/parolă pentru testare
        // IMPORTANT: Acest cod nu va rula în producție pentru securitate
        if (import.meta.env.DEV && process.env.NODE_ENV !== 'production') {
          console.log('Development mode detected, using test credentials');
          // Verificăm dacă email-ul conține "test" sau "demo" pentru a permite autentificarea de test
          if (email.includes('test') || email.includes('demo') || email.includes('admin')) {
            console.log('Using test account authentication');
            // Simulăm un răspuns de succes pentru conturile de test
            // Creăm o sesiune de test
            const testUser = {
              id: 'test-user-id-' + Date.now().toString(36),  // ID unic pentru a evita conflictele
              email: email,
              user_metadata: {
                name: 'Test User'
              }
            };

            const testSession = {
              access_token: 'test-token-' + Date.now() + Math.random().toString(36).substring(2), // Token mai sigur
              refresh_token: 'test-refresh-token-' + Date.now() + Math.random().toString(36).substring(2),
              expires_at: Date.now() + 3600000, // Expiră în 1 oră
              user: {
                id: testUser.id,
                email: email
              }
            };

            // Salvăm sesiunea în sessionStorage în loc de localStorage pentru securitate mai bună
            // Sesiunea va fi disponibilă doar în tab-ul curent și va fi ștearsă la închiderea browser-ului
            sessionStorage.setItem('supabase.auth.token', JSON.stringify({
              currentSession: testSession,
              expiresAt: testSession.expires_at
            }));

            return {
              data: {
                user: testUser,
                session: testSession
              },
              error: null,
              status: 'success'
            };
          }
        }

        // Dacă autentificarea de rezervă este activată, o folosim
        if (USE_FALLBACK_AUTH) {
          console.log('Using fallback authentication due to Supabase connectivity issues');

          try {
            // Încercăm autentificarea de rezervă
            const fallbackResult = await fallbackAuth.signIn(email, password);

            if (fallbackResult.status === 'success' && fallbackResult.data) {
              console.log('Fallback authentication successful');

              // Salvăm sesiunea în localStorage pentru a o putea recupera mai târziu
              localStorage.setItem('fallback_session', JSON.stringify(fallbackResult.data.session));

              return {
                data: {
                  session: fallbackResult.data.session,
                  user: fallbackResult.data.user
                },
                error: null,
                status: 'success'
              };
            } else {
              console.error('Fallback authentication failed:', fallbackResult.error);
              return {
                data: null,
                error: fallbackResult.error,
                status: 'error'
              };
            }
          } catch (fallbackError) {
            console.error('Error in fallback authentication:', fallbackError);
          }
        }

        // Dacă autentificarea de rezervă nu este activată sau a eșuat, încercăm autentificarea normală
        // Adăugăm un timeout explicit pentru autentificare - mărim la 30 secunde
        const timeoutPromise = new Promise<{data: null, error: Error}>((_, reject) => {
          setTimeout(() => {
            console.log('Authentication timeout reached after 30 seconds');
            reject(new Error('Authentication timeout after 30 seconds. Please check your internet connection and try again.'));
          }, 30000); // 30 secunde
        });

        // Promisiunea pentru autentificare
        const authPromise = supabase.auth.signInWithPassword({
          email,
          password,
          options: {
            // Adăugăm opțiuni suplimentare pentru autentificare
            captchaToken: null,
          }
        });

        console.log('Auth request sent, waiting for response...');

        // Folosim Promise.race pentru a implementa timeout
        const result = await Promise.race([
          authPromise,
          timeoutPromise
        ]);

        console.log('Auth response received:', {
          success: !!result.data?.session,
          error: result.error ? 'Error present' : 'No error'
        });

        return handleResponse(result.data, result.error as unknown as PostgrestError);
      } catch (error) {
        console.error('Auth error caught:', error);
        return {
          data: null,
          error: formatError(error),
          status: 'error',
        };
      }
    },

    async signUp(email: string, password: string) {
      try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        return handleResponse(data, error as unknown as PostgrestError);
      } catch (error) {
        return {
          data: null,
          error: formatError(error),
          status: 'error',
        };
      }
    },

    async signOut() {
      try {
        // Dacă autentificarea de rezervă este activată, ștergem sesiunea de rezervă
        if (USE_FALLBACK_AUTH) {
          try {
            await fallbackAuth.signOut();
            console.log('Fallback session cleared');
          } catch (fallbackError) {
            console.error('Error clearing fallback session:', fallbackError);
          }
        }

        // Încercăm să deconectăm utilizatorul de la Supabase
        const { error } = await supabase.auth.signOut();
        return handleResponse(null, error as unknown as PostgrestError);
      } catch (error) {
        return {
          data: null,
          error: formatError(error),
          status: 'error',
        };
      }
    },

    async getSession() {
      try {
        // În modul de dezvoltare, verificăm dacă există o sesiune de test în sessionStorage
        if (import.meta.env.DEV && process.env.NODE_ENV !== 'production') {
          try {
            // Folosim sessionStorage în loc de localStorage pentru securitate mai bună
            const tokenStr = sessionStorage.getItem('supabase.auth.token');

            if (tokenStr) {
              const tokenData = JSON.parse(tokenStr);

              if (tokenData && tokenData.currentSession) {
                // Verificăm dacă sesiunea nu a expirat
                if (tokenData.expiresAt > Date.now()) {
                  console.log('Using test session from sessionStorage');

                  // Creăm un răspuns similar cu cel de la Supabase
                  return {
                    data: {
                      session: tokenData.currentSession
                    },
                    error: null,
                    status: 'success'
                  };
                } else {
                  console.log('Test session expired, removing from sessionStorage');
                  sessionStorage.removeItem('supabase.auth.token');
                }
              }
            }
          } catch (testSessionError) {
            console.error('Error getting test session:', testSessionError);
          }
        }

        // Dacă autentificarea de rezervă este activată, încercăm să recuperăm sesiunea din localStorage
        if (USE_FALLBACK_AUTH) {
          try {
            const fallbackResult = await fallbackAuth.getSession();

            if (fallbackResult.status === 'success' && fallbackResult.data?.session) {
              console.log('Using fallback session');
              return {
                data: {
                  session: fallbackResult.data.session
                },
                error: null,
                status: 'success'
              };
            }
          } catch (fallbackError) {
            console.error('Error getting fallback session:', fallbackError);
          }
        }

        // Dacă nu există sesiune de rezervă, încercăm să recuperăm sesiunea de la Supabase
        const { data, error } = await supabase.auth.getSession();
        return handleResponse(data, error as unknown as PostgrestError);
      } catch (error) {
        return {
          data: null,
          error: formatError(error),
          status: 'error',
        };
      }
    },

    async getUser() {
      try {
        // În modul de dezvoltare, verificăm dacă există o sesiune de test în localStorage
        if (import.meta.env.DEV) {
          try {
            const tokenStr = localStorage.getItem('supabase.auth.token');

            if (tokenStr) {
              const tokenData = JSON.parse(tokenStr);

              if (tokenData && tokenData.currentSession && tokenData.currentSession.user) {
                // Verificăm dacă sesiunea nu a expirat
                if (tokenData.expiresAt > Date.now()) {
                  console.log('Using test user from localStorage');

                  // Creăm un răspuns similar cu cel de la Supabase
                  return {
                    data: {
                      id: tokenData.currentSession.user.id,
                      email: tokenData.currentSession.user.email,
                      user_metadata: {
                        name: 'Test User'
                      }
                    },
                    error: null,
                    status: 'success'
                  };
                } else {
                  console.log('Test session expired, removing from localStorage');
                  localStorage.removeItem('supabase.auth.token');
                }
              }
            }
          } catch (testSessionError) {
            console.error('Error getting test user:', testSessionError);
          }
        }

        // Dacă autentificarea de rezervă este activată, încercăm să recuperăm utilizatorul din sesiunea de rezervă
        if (USE_FALLBACK_AUTH) {
          try {
            const sessionStr = localStorage.getItem('fallback_session');

            if (sessionStr) {
              const session = JSON.parse(sessionStr);

              if (session && session.user) {
                console.log('Using fallback user');
                return {
                  data: session.user,
                  error: null,
                  status: 'success'
                };
              }
            }
          } catch (fallbackError) {
            console.error('Error getting fallback user:', fallbackError);
          }
        }

        // Dacă nu există utilizator de rezervă, încercăm să recuperăm utilizatorul de la Supabase
        const { data, error } = await supabase.auth.getUser();
        return handleResponse(data.user, error as unknown as PostgrestError);
      } catch (error) {
        return {
          data: null,
          error: formatError(error),
          status: 'error',
        };
      }
    },
  },

  // Funcții pentru storage
  storage: {
    async upload(bucket: string, path: string, file: File) {
      try {
        const { data, error } = await supabase.storage.from(bucket).upload(path, file);
        return handleResponse(data, error as unknown as PostgrestError);
      } catch (error) {
        return {
          data: null,
          error: formatError(error),
          status: 'error',
        };
      }
    },

    async download(bucket: string, path: string) {
      try {
        const { data, error } = await supabase.storage.from(bucket).download(path);
        return handleResponse(data, error as unknown as PostgrestError);
      } catch (error) {
        return {
          data: null,
          error: formatError(error),
          status: 'error',
        };
      }
    },

    async remove(bucket: string, paths: string[]) {
      try {
        const { data, error } = await supabase.storage.from(bucket).remove(paths);
        return handleResponse(data, error as unknown as PostgrestError);
      } catch (error) {
        return {
          data: null,
          error: formatError(error),
          status: 'error',
        };
      }
    },

    getPublicUrl(bucket: string, path: string) {
      return supabase.storage.from(bucket).getPublicUrl(path);
    },
  },

  // Funcții pentru RPC (Remote Procedure Call)
  async rpc<T>(functionName: string, params?: Record<string, any>): Promise<SupabaseResponse<T>> {
    try {
      return handlePromise<T>(supabase.rpc(functionName, params));
    } catch (error) {
      return {
        data: null,
        error: formatError(error),
        status: 'error',
      };
    }
  },
};

export default supabaseService;
