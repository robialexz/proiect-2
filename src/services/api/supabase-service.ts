import { supabase } from './supabase-client';
import { PostgrestError } from '@supabase/supabase-js';
import { SupabaseTables, SupabaseRpcFunctions } from '@/types/supabase-tables';

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

/**
 * Formatează erorile pentru a fi mai ușor de înțeles
 * @param error Eroarea de formatat
 * @returns Eroarea formatată
 */
const formatError = (error: PostgrestError | Error | unknown): SupabaseErrorResponse => {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'client_error'
    };
  }
  
  // Verificăm dacă este o eroare PostgrestError
  const pgError = error as PostgrestError;
  if (pgError && pgError.code) {
    return {
      message: pgError.message,
      details: pgError.details,
      hint: pgError.hint,
      code: pgError.code
    };
  }
  
  // Eroare generică
  return {
    message: 'An unknown error occurred',
    code: 'unknown_error'
  };
};

/**
 * Gestionează promisiunile de la Supabase și formatează răspunsurile
 * @param promise Promisiunea de la Supabase
 * @returns Răspunsul formatat
 */
const handlePromise = async <T>(promise: Promise<any>): Promise<SupabaseResponse<T>> => {
  try {
    const { data, error } = await promise;
    
    if (error) {
      return {
        data: null,
        error: formatError(error),
        status: 'error'
      };
    }
    
    return {
      data: data as T,
      error: null,
      status: 'success'
    };
  } catch (error) {
    return {
      data: null,
      error: formatError(error),
      status: 'error'
    };
  }
};

/**
 * Serviciu pentru interacțiuni cu Supabase
 * Oferă metode generice pentru operațiuni CRUD și interogări complexe
 */
export const supabaseService = {
  /**
   * Selectează date dintr-un tabel
   * @param table Numele tabelului
   * @param columns Coloanele de selectat (implicit '*')
   * @param options Opțiuni pentru filtrare, ordonare și limitare
   * @returns Datele selectate sau eroarea
   */
  async select<T>(table: SupabaseTables | string, columns: string = '*', options?: {
    filters?: Record<string, any>;
    order?: { column: string; ascending?: boolean };
    limit?: number;
    single?: boolean;
  }): Promise<SupabaseResponse<T>> {
    try {
      // Inițiem query-ul
      let query: any = supabase.from(table as any).select(columns);
      
      // Aplicăm filtrele dacă există
      if (options?.filters) {
        Object.entries(options.filters).forEach(([column, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(column, value);
          }
        });
      }
      
      // Aplicăm ordinea dacă există
      if (options?.order) {
        query = query.order(options.order.column, { 
          ascending: options.order.ascending !== false 
        });
      }
      
      // Aplicăm limita dacă există
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      // Returnăm un singur rezultat dacă este specificat
      if (options?.single) {
        query = query.single();
      }
      
      // Executăm query-ul și gestionăm răspunsul
      return handlePromise<T>(query);
    } catch (error) {
      return {
        data: null,
        error: formatError(error),
        status: 'error'
      };
    }
  },
  
  /**
   * Inserează date într-un tabel
   * @param table Numele tabelului
   * @param data Datele de inserat
   * @returns Datele inserate sau eroarea
   */
  async insert<T>(table: SupabaseTables | string, data: Partial<T> | Partial<T>[]): Promise<SupabaseResponse<T>> {
    try {
      return handlePromise<T>(supabase.from(table as any).insert(data).select());
    } catch (error) {
      return {
        data: null,
        error: formatError(error),
        status: 'error'
      };
    }
  },
  
  /**
   * Actualizează date într-un tabel
   * @param table Numele tabelului
   * @param data Datele de actualizat
   * @param filters Filtrele pentru a identifica înregistrările de actualizat
   * @returns Datele actualizate sau eroarea
   */
  async update<T>(
    table: SupabaseTables | string, 
    data: Partial<T>, 
    filters: Record<string, any>
  ): Promise<SupabaseResponse<T>> {
    try {
      let query = supabase.from(table as any).update(data);
      
      // Aplicăm filtrele
      Object.entries(filters).forEach(([column, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(column, value);
        }
      });
      
      return handlePromise<T>(query.select());
    } catch (error) {
      return {
        data: null,
        error: formatError(error),
        status: 'error'
      };
    }
  },
  
  /**
   * Șterge date dintr-un tabel
   * @param table Numele tabelului
   * @param filters Filtrele pentru a identifica înregistrările de șters
   * @returns Datele șterse sau eroarea
   */
  async delete<T>(
    table: SupabaseTables | string, 
    filters: Record<string, any>
  ): Promise<SupabaseResponse<T>> {
    try {
      let query = supabase.from(table as any).delete();
      
      // Aplicăm filtrele
      Object.entries(filters).forEach(([column, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(column, value);
        }
      });
      
      return handlePromise<T>(query.select());
    } catch (error) {
      return {
        data: null,
        error: formatError(error),
        status: 'error'
      };
    }
  },
  
  /**
   * Inserează sau actualizează date într-un tabel (upsert)
   * @param table Numele tabelului
   * @param data Datele de inserat sau actualizat
   * @param onConflict Coloanele pentru care se verifică conflictul
   * @returns Datele inserate sau actualizate sau eroarea
   */
  async upsert<T>(
    table: SupabaseTables | string, 
    data: Partial<T> | Partial<T>[], 
    onConflict?: string[]
  ): Promise<SupabaseResponse<T>> {
    try {
      const conflict = Array.isArray(onConflict) ? onConflict.join(',') : onConflict;
      return handlePromise<T>(supabase.from(table as any).upsert(data, { onConflict: conflict }).select());
    } catch (error) {
      return {
        data: null,
        error: formatError(error),
        status: 'error'
      };
    }
  },
  
  /**
   * Inserează mai multe înregistrări într-un tabel
   * @param table Numele tabelului
   * @param data Datele de inserat
   * @returns Datele inserate sau eroarea
   */
  async bulkInsert<T>(
    table: SupabaseTables | string, 
    data: Partial<T>[]
  ): Promise<SupabaseResponse<T>> {
    try {
      return handlePromise<T>(supabase.from(table as any).insert(data).select());
    } catch (error) {
      return {
        data: null,
        error: formatError(error),
        status: 'error'
      };
    }
  },
  
  /**
   * Paginează datele dintr-un tabel
   * @param table Numele tabelului
   * @param columns Coloanele de selectat (implicit '*')
   * @param page Numărul paginii (implicit 1)
   * @param pageSize Dimensiunea paginii (implicit 10)
   * @param options Opțiuni pentru filtrare și ordonare
   * @returns Datele paginate, numărul total de înregistrări și informații despre paginare
   */
  async paginate<T>(
    table: SupabaseTables | string, 
    columns: string = '*', 
    page: number = 1, 
    pageSize: number = 10, 
    options?: { 
      filters?: Record<string, any>; 
      order?: { column: string; ascending?: boolean } 
    }
  ): Promise<{
    data: T[] | null;
    total: number | null;
    page: number;
    pageSize: number;
    error: SupabaseErrorResponse | null;
    status: 'success' | 'error'
  }> {
    try {
      const from = (page - 1) * pageSize;
      const to = page * pageSize - 1;
      
      let query: any = supabase.from(table as any).select(columns, { count: 'exact' }).range(from, to);
      
      // Aplicăm filtrele dacă există
      if (options?.filters) {
        Object.entries(options.filters).forEach(([column, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(column, value);
          }
        });
      }
      
      // Aplicăm ordinea dacă există
      if (options?.order) {
        query = query.order(options.order.column, { 
          ascending: options.order.ascending !== false 
        });
      }
      
      try {
      const { data, error, count } = await query;
      } catch (error) {
        // Handle error appropriately
      }
      
      if (error) {
        throw error;
      }
      
      return { 
        data: data as T[], 
        total: count, 
        page, 
        pageSize, 
        error: null, 
        status: 'success' 
      };
    } catch (error) {
      return { 
        data: null, 
        total: null, 
        page, 
        pageSize, 
        error: formatError(error), 
        status: 'error' 
      };
    }
  },
  
  /**
   * Se abonează la schimbări în timp real pentru un tabel
   * @param table Numele tabelului
   * @param event Tipul de eveniment (INSERT, UPDATE, DELETE)
   * @param callback Funcția de callback apelată când se primesc date noi
   * @param filters Filtrele pentru a selecta înregistrările de urmărit
   * @returns Obiectul de abonament care poate fi folosit pentru dezabonare
   */
  subscribe<T>(
    table: SupabaseTables | string, 
    event: 'INSERT' | 'UPDATE' | 'DELETE', 
    callback: (payload: any) => void, 
    filters?: Record<string, any>
  ) {
    let realtime: any = supabase.from(table as any);
    
    // Aplicăm filtrele dacă există
    if (filters) {
      Object.entries(filters).forEach(([column, value]) => {
        if (value !== undefined && value !== null) {
          realtime = realtime.filter(column, 'eq', value);
        }
      });
    }
    
    return realtime.on(event, payload => callback(payload)).subscribe();
  },
  
  /**
   * Se dezabonează de la schimbări în timp real
   * @param subscription Obiectul de abonament returnat de subscribe
   */
  unsubscribe(subscription: any) {
    subscription.unsubscribe();
  },
  
  /**
   * Apelează o funcție RPC
   * @param functionName Numele funcției RPC
   * @param params Parametrii pentru funcția RPC
   * @returns Rezultatul funcției RPC sau eroarea
   */
  async rpc<T>(
    functionName: SupabaseRpcFunctions | string, 
    params?: Record<string, any>
  ): Promise<SupabaseResponse<T>> {
    try {
      return handlePromise<T>(supabase.rpc(functionName as any, params));
    } catch (error) {
      return {
        data: null,
        error: formatError(error),
        status: 'error'
      };
    }
  },
  
  /**
   * Obține sesiunea curentă
   * @returns Sesiunea curentă sau null
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      return {
        data: data.session,
        error: null,
        status: 'success'
      };
    } catch (error) {
      return {
        data: null,
        error: formatError(error),
        status: 'error'
      };
    }
  },
  
  /**
   * Obține utilizatorul curent
   * @returns Utilizatorul curent sau null
   */
  async getUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        throw error;
      }
      
      return {
        data: data.user,
        error: null,
        status: 'success'
      };
    } catch (error) {
      return {
        data: null,
        error: formatError(error),
        status: 'error'
      };
    }
  }
};

export default supabaseService;
