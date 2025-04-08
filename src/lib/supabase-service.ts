import { supabase } from './supabase';
import { PostgrestError } from '@supabase/supabase-js';

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
}

// Funcție pentru a transforma erorile PostgrestError în SupabaseErrorResponse
const formatError = (error: PostgrestError | Error | unknown): SupabaseErrorResponse => {
  if (error instanceof Error) {
    if ('code' in error && 'details' in error && 'hint' in error && 'message' in error) {
      // Este un PostgrestError
      const pgError = error as PostgrestError;
      return {
        message: pgError.message,
        details: pgError.details || undefined,
        hint: pgError.hint || undefined,
        code: pgError.code,
      };
    }
    // Este un Error standard
    return {
      message: error.message,
      details: error.stack,
    };
  }
  // Este un tip necunoscut de eroare
  return {
    message: 'An unknown error occurred',
    details: error ? JSON.stringify(error) : undefined,
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
      let query = supabase.from(table).select(columns);

      // Aplicăm filtrele
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      // Aplicăm ordinea
      if (options?.order) {
        query = query.order(options.order.column, { ascending: options.order.ascending ?? false });
      }

      // Aplicăm limita
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      // Returnăm un singur rezultat sau o listă
      if (options?.single) {
        return handlePromise<T>(query.single());
      }
      return handlePromise<T[]>(query) as unknown as Promise<SupabaseResponse<T>>;
    } catch (error) {
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
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return handleResponse(data, error as unknown as PostgrestError);
      } catch (error) {
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
