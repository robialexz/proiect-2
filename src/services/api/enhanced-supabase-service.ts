import { supabase } from "./supabase-client";
import { PostgrestError } from "@supabase/supabase-js";
import {
  supabaseService,
  SupabaseResponse,
  SupabaseErrorResponse,
} from "./supabase-service";
import { SupabaseTables, SupabaseRpcFunctions } from "@/types/supabase-tables";

/**
 * Formatează erorile pentru a fi mai ușor de înțeles
 * @param error Eroarea de formatat
 * @returns Eroarea formatată
 */
const formatError = (
  error: PostgrestError | Error | unknown
): SupabaseErrorResponse => {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: "client_error",
    };
  }

  // Verificăm dacă este o eroare PostgrestError
  const pgError = error as PostgrestError;
  if (pgError && pgError.code) {
    return {
      message: pgError.message,
      details: pgError.details,
      hint: pgError.hint,
      code: pgError.code,
    };
  }

  // Eroare generică
  return {
    message: "An unknown error occurred",
    code: "unknown_error",
  };
};

/**
 * Versiune îmbunătățită a serviciului Supabase cu funcționalități avansate
 * Acest serviciu extinde supabaseService cu metode suplimentare pentru operațiuni complexe
 */
export const enhancedSupabaseService = {
  ...supabaseService,

  /**
   * Obține date cu caching și invalidare automată
   * @param table Numele tabelului
   * @param columns Coloanele de selectat
   * @param options Opțiuni pentru filtrare, ordonare și caching
   * @returns Datele sau eroarea
   */
  async getWithCache<T>(
    table: SupabaseTables | string,
    columns: string = "*",
    options?: {
      filters?: Record<string, any>;
      order?: { column: string; ascending?: boolean };
      cacheTime?: number; // Timpul de caching în milisecunde
      forceRefresh?: boolean; // Forțează reîmprospătarea datelor
    }
  ): Promise<SupabaseResponse<T>> {
    try {
      // Generăm o cheie de cache unică bazată pe parametri
      const cacheKey = `${table}_${columns}_${JSON.stringify(
        options?.filters || {}
      )}_${JSON.stringify(options?.order || {})}`;

      // Implementarea caching-ului va fi adăugată ulterior
      // Deocamdată, delegăm către metoda standard
      return supabaseService.select<T>(table, columns, {
        filters: options?.filters,
        order: options?.order,
      });
    } catch (error) {
      return {
        data: null,
        error: formatError(error),
        status: "error",
      };
    }
  },

  /**
   * Paginează date cu caching
   * @param table Numele tabelului
   * @param columns Coloanele de selectat
   * @param page Numărul paginii
   * @param pageSize Dimensiunea paginii
   * @param options Opțiuni pentru filtrare, ordonare și caching
   * @returns Datele paginate, numărul total de înregistrări și informații despre paginare
   */
  async paginateWithCache<T>(
    table: SupabaseTables | string,
    columns: string = "*",
    page: number = 1,
    pageSize: number = 10,
    options?: {
      filters?: Record<string, any>;
      order?: { column: string; ascending?: boolean };
      cacheTime?: number; // Timpul de caching în milisecunde
      forceRefresh?: boolean; // Forțează reîmprospătarea datelor
    }
  ): Promise<{
    data: T[] | null;
    total: number | null;
    page: number;
    pageSize: number;
    error: SupabaseErrorResponse | null;
    status: "success" | "error";
    fromCache?: boolean;
  }> {
    try {
      // Generăm o cheie de cache unică bazată pe parametri
      const cacheKey = `paginate_${table}_${columns}_${page}_${pageSize}_${JSON.stringify(
        options?.filters || {}
      )}_${JSON.stringify(options?.order || {})}`;

      // Implementarea caching-ului va fi adăugată ulterior
      // Deocamdată, delegăm către metoda standard
      return supabaseService.paginate<T>(table, columns, page, pageSize, {
        filters: options?.filters,
        order: options?.order,
      });
    } catch (error) {
      return {
        data: null,
        total: null,
        page,
        pageSize,
        error: formatError(error),
        status: "error",
      };
    }
  },

  /**
   * Abonează la schimbări în timp real pentru un tabel cu gestionare avansată a evenimentelor
   * @param table Numele tabelului
   * @param event Tipul de eveniment (INSERT, UPDATE, DELETE, *)
   * @param callback Funcția de callback apelată când se primesc date noi
   * @param filters Filtrele pentru a selecta înregistrările de urmărit
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
      let realtime: any = supabase.from(table as any);

      // Aplicăm filtrele dacă există
      if (filters) {
        Object.entries(filters).forEach(([column, value]) => {
          if (value !== undefined && value !== null) {
            realtime = realtime.filter(column, "eq", value);
          }
        });
      }

      return realtime
        .on(event, (payload: any) => {
          // Transformăm payload-ul pentru a fi mai ușor de utilizat
          callback({
            new: payload.new || null,
            old: payload.old || null,
            eventType: payload.eventType,
          });
        })
        .subscribe();
    } catch (error) {
      // Removed console statement
      throw error;
    }
  },

  /**
   * Execută o tranzacție (mai multe operațiuni într-o singură tranzacție)
   * @param operations Funcția care definește operațiunile din tranzacție
   * @returns Rezultatul tranzacției sau eroarea
   */
  async transaction<T>(
    operations: () => Promise<T>
  ): Promise<SupabaseResponse<T>> {
    try {
      // Notă: Supabase nu suportă tranzacții native în JavaScript SDK
      // Această metodă este un wrapper pentru a simula tranzacțiile
      const result = await operations();

      return {
        data: result,
        error: null,
        status: "success",
      };
    } catch (error) {
      return {
        data: null,
        error: formatError(error),
        status: "error",
      };
    }
  },

  /**
   * Execută o interogare complexă cu join-uri
   * @param mainTable Tabelul principal
   * @param joins Array de join-uri
   * @param columns Coloanele de selectat
   * @param filters Filtrele pentru tabelul principal
   * @returns Datele sau eroarea
   */
  async joinTables<T>(
    mainTable: SupabaseTables | string,
    joins: Array<{
      table: SupabaseTables | string;
      on: { mainTableColumn: string; joinTableColumn: string };
      columns: string[];
      type?: "inner" | "left" | "right";
    }>,
    columns: string[] = ["*"],
    filters?: Record<string, any>
  ): Promise<SupabaseResponse<T>> {
    try {
      // Construim query-ul cu join-uri
      const mainColumns = columns
        .map((col) => `${mainTable}.${col}`)
        .join(", ");

      // Construim coloanele pentru join-uri
      const joinColumns = joins
        .map((join) => {
          return join.columns.map((col) => `${join.table}.${col}`).join(", ");
        })
        .join(", ");

      // Construim clauza de select
      const selectClause = `${mainColumns}${
        joinColumns ? ", " + joinColumns : ""
      }`;

      // Construim query-ul
      let query: any = supabase.from(mainTable as any).select(selectClause);

      // Adăugăm join-urile
      joins.forEach((join) => {
        const joinType = join.type || "inner";
        const joinClause = `${join.table}!${join.on.mainTableColumn}=${join.on.joinTableColumn}`;

        if (joinType === "inner") {
          query = query.join(joinClause);
        } else if (joinType === "left") {
          query = query.join(joinClause, {
            foreignTable: join.table,
            type: "left",
          });
        } else if (joinType === "right") {
          query = query.join(joinClause, {
            foreignTable: join.table,
            type: "right",
          });
        }
      });

      // Aplicăm filtrele dacă există
      if (filters) {
        Object.entries(filters).forEach(([column, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(`${mainTable}.${column}`, value);
          }
        });
      }

      try {
      const { data, error } = await query;
      } catch (error) {
        // Handle error appropriately
      }

      if (error) {
        throw error;
      }

      return {
        data: data as T,
        error: null,
        status: "success",
      };
    } catch (error) {
      return {
        data: null,
        error: formatError(error),
        status: "error",
      };
    }
  },

  /**
   * Execută o interogare full-text search
   * @param table Numele tabelului
   * @param column Coloana în care se caută
   * @param query Textul de căutat
   * @param options Opțiuni pentru căutare
   * @returns Datele sau eroarea
   */
  async textSearch<T>(
    table: SupabaseTables | string,
    column: string,
    query: string,
    options?: {
      columns?: string[];
      limit?: number;
      order?: { column: string; ascending?: boolean };
    }
  ): Promise<SupabaseResponse<T>> {
    try {
      // Construim coloanele de selectat
      const selectColumns = options?.columns ? options.columns.join(", ") : "*";

      // Construim query-ul
      let dbQuery: any = supabase
        .from(table as any)
        .select(selectColumns)
        .textSearch(column, query);

      // Aplicăm limita dacă există
      if (options?.limit) {
        dbQuery = dbQuery.limit(options.limit);
      }

      // Aplicăm ordinea dacă există
      if (options?.order) {
        dbQuery = dbQuery.order(options.order.column, {
          ascending: options.order.ascending !== false,
        });
      }

      try {
      const { data, error } = await dbQuery;
      } catch (error) {
        // Handle error appropriately
      }

      if (error) {
        throw error;
      }

      return {
        data: data as T,
        error: null,
        status: "success",
      };
    } catch (error) {
      return {
        data: null,
        error: formatError(error),
        status: "error",
      };
    }
  },

  /**
   * Execută o interogare personalizată folosind un callback
   * @param queryBuilder Funcția care construiește interogarea
   * @returns Datele sau eroarea
   */
  async custom<T>(
    queryBuilder: (supabase: any) => any
  ): Promise<SupabaseResponse<T>> {
    try {
      const query = queryBuilder(supabase);
      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        data: data as T,
        error: null,
        status: "success",
      };
    } catch (error) {
      return {
        data: null,
        error: formatError(error),
        status: "error",
      };
    }
  },
};

export default enhancedSupabaseService;
