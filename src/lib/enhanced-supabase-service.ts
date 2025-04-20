import { supabase } from "./supabase";
import { PostgrestError } from "@supabase/supabase-js";
import { supabaseService } from "../services";
import type {
  SupabaseResponse,
  SupabaseErrorResponse,
} from "../services/api/supabase-service";
import { errorHandler } from "./error-handler";
import { inputValidation } from "./input-validation";
import { dataLoader } from "./data-loader";
import { SupabaseTables, SupabaseRpcFunctions } from "../types/supabase-tables";
import { cacheService } from "./cache-service";

/**
 * Versiune îmbunătățită a serviciului Supabase cu funcționalități avansate
 * Acest serviciu extinde supabaseService cu metode suplimentare pentru operațiuni complexe
 */

// Formatează erorile pentru a fi mai ușor de înțeles
const formatError = (
  error: PostgrestError | Error | unknown
): SupabaseErrorResponse => {
  if (error instanceof Error) {
    return {
      message: error.message,
      details: error.stack || "",
      code: "client_error",
    };
  } else if ((error as PostgrestError)?.code) {
    const pgError = error as PostgrestError;
    return {
      message: pgError.message,
      details: pgError.details || "",
      hint: pgError.hint || "",
      code: pgError.code,
    };
  } else {
    return {
      message: "Unknown error",
      details: JSON.stringify(error),
      code: "unknown",
    };
  }
};

// Gestionează răspunsurile de la Supabase
const handleResponse = <T>(
  data: T | null,
  error: PostgrestError | null
): SupabaseResponse<T> => {
  if (error) {
    return {
      data: null,
      error: formatError(error),
      status: "error",
    };
  }
  return {
    data,
    error: null,
    status: "success",
  };
};

// Gestionează promisiunile pentru a reduce codul duplicat
const handlePromise = async <T>(promise: any): Promise<SupabaseResponse<T>> => {
  try {
    const { data, error } = await promise;
    return handleResponse<T>(data as T | null, error);
  } catch (error) {
    errorHandler.handleError(error, false);
    return {
      data: null,
      error: formatError(error),
      status: "error",
    };
  }
};

/**
 * Serviciu îmbunătățit pentru interacțiuni cu Supabase
 * Oferă metode avansate pentru operațiuni CRUD și gestionarea datelor
 */
export const enhancedSupabaseService = {
  ...supabaseService,

  /**
   * Inserează sau actualizează date în funcție de cheia de conflict
   * @param table - Numele tabelului
   * @param data - Datele de inserat sau actualizat (un obiect sau un array de obiecte)
   * @param onConflictKeys - Cheile care determină conflictul (de obicei 'id')
   * @returns Răspuns cu datele inserate/actualizate sau eroare
   */
  async upsert<T>(
    table: SupabaseTables | string,
    data: Partial<T> | Partial<T>[],
    onConflictKeys: string[] = ["id"]
  ): Promise<SupabaseResponse<T>> {
    try {
      // Validare pentru securitate
      if (!inputValidation.validateText(table)) {
        throw new Error("Invalid table name");
      }

      // Validăm cheile de conflict
      for (const key of onConflictKeys) {
        if (!inputValidation.validateText(key)) {
          throw new Error(`Invalid conflict key: ${key}`);
        }
      }

      // Construim string-ul pentru onConflict
      const onConflict = onConflictKeys.join(",");

      // Executăm operațiunea upsert
      const result = await handlePromise<T>(
        (supabase.from(table as any) as any)
          .upsert(data, { onConflict, returning: "representation" })
          .select()
      );

      // Invalidăm cache-ul pentru acest tabel pentru a asigura date proaspete
      if (result.status === "success") {
        dataLoader.invalidateCache(table);
      }

      return result;
    } catch (error) {
      errorHandler.handleError(error, false);
      return {
        data: null,
        error: formatError(error),
        status: "error",
      };
    }
  },

  /**
   * Inserează mai multe înregistrări într-un singur apel
   * @param table - Numele tabelului
   * @param data - Array de obiecte de inserat
   * @returns Răspuns cu datele inserate sau eroare
   */
  async bulkInsert<T>(
    table: SupabaseTables | string,
    data: Partial<T>[]
  ): Promise<SupabaseResponse<T>> {
    try {
      // Validare pentru securitate
      if (!inputValidation.validateText(table)) {
        throw new Error("Invalid table name");
      }

      // Verificăm dacă avem date de inserat
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("No data to insert");
      }

      // Executăm operațiunea de inserare în masă
      const result = await handlePromise<T>(
        (supabase.from(table as any) as any).insert(data).select()
      );

      // Invalidăm cache-ul pentru acest tabel
      if (result.status === "success") {
        dataLoader.invalidateCache(table);
      }

      return result;
    } catch (error) {
      errorHandler.handleError(error, false);
      return {
        data: null,
        error: formatError(error),
        status: "error",
      };
    }
  },

  /**
   * Actualizează mai multe înregistrări care îndeplinesc criteriile de filtrare
   * @param table - Numele tabelului
   * @param data - Datele de actualizat
   * @param filters - Filtre pentru a selecta înregistrările de actualizat
   * @returns Răspuns cu datele actualizate sau eroare
   */
  async bulkUpdate<T>(
    table: SupabaseTables | string,
    data: Partial<T>,
    filters: Record<string, any>
  ): Promise<SupabaseResponse<T>> {
    try {
      // Validare pentru securitate
      if (!inputValidation.validateText(table)) {
        throw new Error("Invalid table name");
      }

      // Verificăm dacă avem date de actualizat
      if (!data || Object.keys(data).length === 0) {
        throw new Error("No data to update");
      }

      // Inițiem query-ul de actualizare
      let query: any = (supabase.from(table as any) as any).update(data);

      // Aplicăm filtrele cu validare
      if (filters && Object.keys(filters).length > 0) {
        Object.entries(filters).forEach(([key, value]) => {
          // Validare pentru securitate
          if (!inputValidation.validateText(key)) {
            throw new Error(`Invalid filter key: ${key}`);
          }

          if (value !== undefined && value !== null) {
            // Pentru valori de tip string, validăm pentru a preveni SQL injection
            if (
              typeof value === "string" &&
              !inputValidation.validateText(value)
            ) {
              throw new Error(`Invalid filter value for ${key}`);
            }

            query = query.eq(key, value);
          }
        });
      } else {
        throw new Error("No filters provided for bulk update");
      }

      // Executăm operațiunea de actualizare
      const result = await handlePromise<T>(query.select());

      // Invalidăm cache-ul pentru acest tabel
      if (result.status === "success") {
        dataLoader.invalidateCache(table);
      }

      return result;
    } catch (error) {
      errorHandler.handleError(error, false);
      return {
        data: null,
        error: formatError(error),
        status: "error",
      };
    }
  },

  /**
   * Șterge mai multe înregistrări care îndeplinesc criteriile de filtrare
   * @param table - Numele tabelului
   * @param filters - Filtre pentru a selecta înregistrările de șters
   * @returns Răspuns cu datele șterse sau eroare
   */
  async bulkDelete<T>(
    table: SupabaseTables | string,
    filters: Record<string, any>
  ): Promise<SupabaseResponse<T>> {
    try {
      // Validare pentru securitate
      if (!inputValidation.validateText(table)) {
        throw new Error("Invalid table name");
      }

      // Verificăm dacă avem filtre
      if (!filters || Object.keys(filters).length === 0) {
        throw new Error("No filters provided for bulk delete");
      }

      // Inițiem query-ul de ștergere
      let query: any = (supabase.from(table as any) as any).delete();

      // Aplicăm filtrele cu validare
      Object.entries(filters).forEach(([key, value]) => {
        // Validare pentru securitate
        if (!inputValidation.validateText(key)) {
          throw new Error(`Invalid filter key: ${key}`);
        }

        if (value !== undefined && value !== null) {
          // Pentru valori de tip string, validăm pentru a preveni SQL injection
          if (
            typeof value === "string" &&
            !inputValidation.validateText(value)
          ) {
            throw new Error(`Invalid filter value for ${key}`);
          }

          query = query.eq(key, value);
        }
      });

      // Executăm operațiunea de ștergere
      const result = await handlePromise<T>(query.select());

      // Invalidăm cache-ul pentru acest tabel
      if (result.status === "success") {
        dataLoader.invalidateCache(table);
      }

      return result;
    } catch (error) {
      errorHandler.handleError(error, false);
      return {
        data: null,
        error: formatError(error),
        status: "error",
      };
    }
  },

  /**
   * Obține date paginat cu numărul total de înregistrări
   * @param table - Numele tabelului
   * @param columns - Coloanele de selectat
   * @param page - Numărul paginii (începe de la 1)
   * @param pageSize - Numărul de înregistrări per pagină
   * @param options - Opțiuni suplimentare (filtre, ordine)
   * @returns Răspuns cu datele paginat, numărul total de înregistrări și informații despre pagină
   */
  async paginate<T>(
    table: SupabaseTables | string,
    columns: string = "*",
    page: number = 1,
    pageSize: number = 10,
    options?: {
      filters?: Record<string, any>;
      order?: { column: string; ascending?: boolean };
    }
  ): Promise<{
    data: T[] | null;
    total: number | null;
    page: number;
    pageSize: number;
    totalPages: number | null;
    error: SupabaseErrorResponse | null;
    status: "success" | "error";
    fromCache?: boolean;
  }> {
    try {
      // Validare pentru securitate
      if (!inputValidation.validateText(table)) {
        throw new Error("Invalid table name");
      }

      if (!inputValidation.validateText(columns)) {
        throw new Error("Invalid columns");
      }

      // Validăm parametrii de paginare
      if (page < 1) {
        throw new Error("Page number must be at least 1");
      }

      if (pageSize < 1 || pageSize > 100) {
        throw new Error("Page size must be between 1 and 100");
      }

      // Calculăm intervalul de înregistrări
      const from = (page - 1) * pageSize;
      const to = page * pageSize - 1;

      // Construim cheia de cache
      const cacheKey = `paginate_${table}_${columns}_${page}_${pageSize}_${JSON.stringify(
        options || {}
      )}`;

      // Verificăm dacă avem date în cache
      const cachedData = cacheService.get(cacheKey);
      if (cachedData) {
        return {
          ...cachedData,
          fromCache: true,
        };
      }

      // Inițiem query-ul
      let query: any = (supabase.from(table as any) as any)
        .select(columns, { count: "exact" })
        .range(from, to);

      // Aplicăm filtrele cu validare
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          // Validare pentru securitate
          if (!inputValidation.validateText(key)) {
            throw new Error(`Invalid filter key: ${key}`);
          }

          if (value !== undefined && value !== null) {
            // Pentru valori de tip string, validăm pentru a preveni SQL injection
            if (
              typeof value === "string" &&
              !inputValidation.validateText(value)
            ) {
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

        query = query.order(options.order.column, {
          ascending: options.order.ascending ?? false,
        });
      }

      // Executăm query-ul
      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      // Calculăm numărul total de pagini
      const totalPages = count ? Math.ceil(count / pageSize) : null;

      // Construim rezultatul
      const result = {
        data: data as T[],
        total: count,
        page,
        pageSize,
        totalPages,
        error: null,
        status: "success" as const,
      };

      // Salvăm în cache
      cacheService.set(cacheKey, result, { expireIn: 5 * 60 * 1000 }); // 5 minute

      return result;
    } catch (error) {
      errorHandler.handleError(error, false);
      return {
        data: null,
        total: null,
        page,
        pageSize,
        totalPages: null,
        error: formatError(error),
        status: "error",
      };
    }
  },

  /**
   * Abonează la schimbări în timp real pentru un tabel
   * @param table - Numele tabelului
   * @param event - Tipul de eveniment (INSERT, UPDATE, DELETE)
   * @param callback - Funcția de callback apelată când se primesc date noi
   * @param filters - Filtre pentru a selecta înregistrările de urmărit
   * @returns Obiectul de abonament care poate fi folosit pentru dezabonare
   */
  subscribe<T>(
    table: SupabaseTables | string,
    event: "INSERT" | "UPDATE" | "DELETE" | "*",
    callback: (payload: {
      new: T | null;
      old: T | null;
      eventType: "INSERT" | "UPDATE" | "DELETE";
    }) => void,
    filters?: Record<string, any>
  ) {
    try {
      // Validare pentru securitate
      if (!inputValidation.validateText(table)) {
        throw new Error("Invalid table name");
      }

      // Inițiem query-ul de abonare
      let realtime: any = supabase.from(table as any) as any;

      // Aplicăm filtrele cu validare
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          // Validare pentru securitate
          if (!inputValidation.validateText(key)) {
            throw new Error(`Invalid filter key: ${key}`);
          }

          if (value !== undefined && value !== null) {
            // Pentru valori de tip string, validăm pentru a preveni SQL injection
            if (
              typeof value === "string" &&
              !inputValidation.validateText(value)
            ) {
              throw new Error(`Invalid filter value for ${key}`);
            }

            realtime = realtime.filter(key, "eq", value);
          }
        });
      }

      // Creăm abonamentul
      const subscription = realtime
        .on(event, (payload: any) => {
          // Transformăm payload-ul pentru a fi mai ușor de utilizat
          const transformedPayload = {
            new: payload.new || null,
            old: payload.old || null,
            eventType: payload.eventType as "INSERT" | "UPDATE" | "DELETE",
          };

          // Apelăm callback-ul cu payload-ul transformat
          callback(transformedPayload);

          // Invalidăm cache-ul pentru acest tabel
          dataLoader.invalidateCache(table);
        })
        .subscribe();

      // Adăugăm o metodă de dezabonare pentru a face utilizarea mai ușoară
      const enhancedSubscription = {
        ...subscription,
        unsubscribe: () => {
          subscription.unsubscribe();
        },
      };

      return enhancedSubscription;
    } catch (error) {
      errorHandler.handleError(error, false);
      console.error("Error creating subscription:", error);

      // Returnăm un obiect de abonament fals pentru a evita erorile
      return {
        unsubscribe: () => {},
      };
    }
  },

  /**
   * Dezabonează de la un abonament
   * @param subscription - Obiectul de abonament returnat de metoda subscribe
   */
  unsubscribe(subscription: any) {
    if (subscription && typeof subscription.unsubscribe === "function") {
      subscription.unsubscribe();
    }
  },

  /**
   * Execută mai multe operațiuni într-o singură tranzacție
   * Notă: Aceasta este o implementare simplificată, tranzacțiile reale necesită funcții RPC în Supabase
   * @param operations - Array de funcții care returnează promisiuni
   * @returns Rezultatul operațiunilor sau eroare
   */
  async transaction<T>(
    operations: (() => Promise<any>)[]
  ): Promise<SupabaseResponse<T>> {
    try {
      // Verificăm dacă avem operațiuni
      if (!Array.isArray(operations) || operations.length === 0) {
        throw new Error("No operations provided for transaction");
      }

      // Executăm operațiunile în ordine
      const results = [];
      for (const operation of operations) {
        const result = await operation();
        results.push(result);

        // Dacă o operațiune eșuează, anulăm tranzacția
        if (result.error) {
          throw new Error(`Transaction failed: ${result.error.message}`);
        }
      }

      return {
        data: results as T,
        error: null,
        status: "success",
      };
    } catch (error) {
      errorHandler.handleError(error, false);
      return {
        data: null,
        error: formatError(error),
        status: "error",
      };
    }
  },

  /**
   * Execută un query personalizat folosind builder-ul de query Supabase
   * @param queryFn - Funcția care construiește query-ul
   * @returns Rezultatul query-ului sau eroare
   */
  async custom<T>(
    queryFn: (supabase: typeof supabase) => any
  ): Promise<SupabaseResponse<T>> {
    try {
      // Construim și executăm query-ul
      const query = queryFn(supabase);
      return handlePromise<T>(query);
    } catch (error) {
      errorHandler.handleError(error, false);
      return {
        data: null,
        error: formatError(error),
        status: "error",
      };
    }
  },

  /**
   * Exportă date în format CSV sau JSON
   * @param table - Numele tabelului
   * @param format - Formatul de export (csv sau json)
   * @param options - Opțiuni suplimentare (filtre, coloane, etc.)
   * @returns Blob cu datele exportate sau eroare
   */
  async export<T>(
    table: SupabaseTables | string,
    format: "csv" | "json" = "csv",
    options?: {
      filters?: Record<string, any>;
      columns?: string[];
      fileName?: string;
    }
  ): Promise<SupabaseResponse<Blob>> {
    try {
      // Validare pentru securitate
      if (!inputValidation.validateText(table)) {
        throw new Error("Invalid table name");
      }

      // Construim query-ul
      const columns = options?.columns?.join(",") || "*";
      let query: any = (supabase.from(table as any) as any).select(columns);

      // Aplicăm filtrele cu validare
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          // Validare pentru securitate
          if (!inputValidation.validateText(key)) {
            throw new Error(`Invalid filter key: ${key}`);
          }

          if (value !== undefined && value !== null) {
            // Pentru valori de tip string, validăm pentru a preveni SQL injection
            if (
              typeof value === "string" &&
              !inputValidation.validateText(value)
            ) {
              throw new Error(`Invalid filter value for ${key}`);
            }

            query = query.eq(key, value);
          }
        });
      }

      // Executăm query-ul
      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Transformăm datele în formatul dorit
      let blob: Blob;
      if (format === "csv") {
        // Construim CSV
        const headers = options?.columns || Object.keys(data[0] || {});
        const csvRows = [
          headers.join(","), // Header row
          ...data.map((row: any) =>
            headers
              .map((header) => {
                const value = row[header];
                // Escapăm valorile care conțin virgule sau ghilimele
                if (
                  typeof value === "string" &&
                  (value.includes(",") || value.includes('"'))
                ) {
                  return `"${value.replace(/"/g, '""')}"`;
                }
                return value !== null && value !== undefined ? value : "";
              })
              .join(",")
          ),
        ];
        const csvContent = csvRows.join("\n");
        blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      } else {
        // JSON format
        const jsonContent = JSON.stringify(data, null, 2);
        blob = new Blob([jsonContent], {
          type: "application/json;charset=utf-8;",
        });
      }

      return {
        data: blob,
        error: null,
        status: "success",
      };
    } catch (error) {
      errorHandler.handleError(error, false);
      return {
        data: null,
        error: formatError(error),
        status: "error",
      };
    }
  },
};

export default enhancedSupabaseService;
