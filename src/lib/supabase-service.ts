import { supabase } from "./supabase";
import { PostgrestError, AuthError } from "@supabase/supabase-js";
import { errorHandler } from "./error-handler";
import { inputValidation } from "./input-validation";
import { dataLoader } from "./data-loader";
import { SupabaseTables, SupabaseRpcFunctions } from "../types/supabase-tables";
import { RealtimeChannel } from "@supabase/supabase-js"; // Keep RealtimeChannel

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
  status: "success" | "error";
  fromCache?: boolean; // Indică dacă datele provin din cache
}

// Funcție pentru a transforma erorile în SupabaseErrorResponse
const formatError = (
  error: PostgrestError | AuthError | Error | unknown
): SupabaseErrorResponse => {
  const isProduction = process.env.NODE_ENV === "production";

  if (error && typeof error === "object") {
    if (error instanceof AuthError) {
      return {
        message: error.message,
        details: isProduction ? undefined : error.stack,
        code: String(error.status) || undefined,
      };
    }
    if (
      "details" in error &&
      "hint" in error &&
      "code" in error &&
      "message" in error
    ) {
      const pgError = error as PostgrestError;
      return {
        message: pgError.message,
        details: isProduction ? undefined : pgError.details || undefined,
        hint: isProduction ? undefined : pgError.hint || undefined,
        code: pgError.code,
      };
    }
    if (error instanceof Error) {
      return {
        message: error.message,
        details: isProduction ? undefined : error.stack,
      };
    }
  }
  return {
    message: "An unknown error occurred",
    details: isProduction
      ? undefined
      : error
      ? JSON.stringify(error)
      : undefined,
  };
};

// Serviciu pentru interacțiuni cu Supabase
export const supabaseService = {
  // --- Funcții generice CRUD (PostgREST) ---
  async select<T>(
    table: SupabaseTables, // Use specific union type
    columns: string = "*",
    options?: {
      filters?: Record<string, any>;
      order?: { column: string; ascending?: boolean };
      limit?: number;
      single?: boolean;
    }
  ): Promise<SupabaseResponse<T>> {
    try {
      if (!inputValidation.validateText(columns)) {
        throw new Error("Invalid columns specified");
      }

      let query = supabase.from(table).select(columns); // Use table directly

      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (!inputValidation.validateText(key))
            throw new Error(`Invalid filter key: ${key}`);
          if (value !== undefined && value !== null)
            query = query.eq(key, value);
        });
      }
      if (options?.order) {
        if (!inputValidation.validateText(options.order.column))
          throw new Error(`Invalid order column: ${options.order.column}`);
        query = query.order(options.order.column, {
          ascending: options.order.ascending ?? false,
        });
      }
      if (options?.limit) {
        if (options.limit < 0 || options.limit > 1000)
          throw new Error("Invalid limit value.");
        query = query.limit(options.limit);
      }

      const { data, error } = options?.single
        ? await query.single()
        : await query;

      if (error) {
        if (error.message?.includes("JWT") || error.code === "401") {
          console.warn(`Auth error for ${table}, trying refresh...`);
          try {
            const { data: refreshData } = await supabase.auth.refreshSession();
            if (refreshData?.session) {
              console.log(`Session refreshed, retrying fetch for ${table}`);
              const { data: retryData, error: retryError } = options?.single
                ? await query.single()
                : await query;
              if (retryError)
                return {
                  data: null,
                  error: formatError(retryError),
                  status: "error",
                };
              return {
                data: retryData as T | null,
                error: null,
                status: "success",
              };
            }
          } catch (refreshError) {
            console.error(`Error refreshing session:`, refreshError);
          }
        }
        return { data: null, error: formatError(error), status: "error" };
      }
      return { data: data as T | null, error: null, status: "success" };
    } catch (error) {
      console.error(`Error in select operation for table ${table}:`, error);
      if (import.meta.env.DEV) {
        console.log(`Using generated test data after error for ${table}`);
        const testData = dataLoader.generateTestData(String(table), 10);
        return {
          status: "success",
          data: (options?.single ? testData[0] : testData) as T,
          error: null,
        };
      }
      return { data: null, error: formatError(error), status: "error" };
    }
  },

  async insert<T>(
    table: SupabaseTables, // Use specific union type
    data: Partial<T> | Partial<T>[]
  ): Promise<SupabaseResponse<T[]>> {
    try {
      const { data: resultData, error } = await supabase
        .from(table)
        .insert(data as any)
        .select();
      if (error)
        return { data: null, error: formatError(error), status: "error" };
      return { data: resultData as T[], error: null, status: "success" };
    } catch (error) {
      console.error(`Error in insert operation for table ${table}:`, error);
      return { data: null, error: formatError(error), status: "error" };
    }
  },

  async update<T>(
    table: SupabaseTables, // Use specific union type
    data: Partial<T>,
    filters: Record<string, any>
  ): Promise<SupabaseResponse<T[]>> {
    try {
      let query = supabase.from(table).update(data as any);
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) query = query.eq(key, value);
      });
      const { data: resultData, error } = await query.select();
      if (error)
        return { data: null, error: formatError(error), status: "error" };
      return { data: resultData as T[], error: null, status: "success" };
    } catch (error) {
      console.error(`Error in update operation for table ${table}:`, error);
      return { data: null, error: formatError(error), status: "error" };
    }
  },

  async delete<T>(
    table: SupabaseTables, // Use specific union type
    filters: Record<string, any>
  ): Promise<SupabaseResponse<T[]>> {
    try {
      let query = supabase.from(table).delete();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) query = query.eq(key, value);
      });
      const { data: resultData, error } = await query.select();
      if (error)
        return { data: null, error: formatError(error), status: "error" };
      return { data: resultData as T[], error: null, status: "success" };
    } catch (error) {
      console.error(`Error in delete operation for table ${table}:`, error);
      return { data: null, error: formatError(error), status: "error" };
    }
  },

  // --- Funcții pentru autentificare (Simplified) ---
  auth: {
    async signIn(email: string, password: string) {
      console.log("Starting sign in for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error)
        return {
          data: null,
          error: formatError(error),
          status: "error" as const,
        };
      // Manual session saving might still be needed depending on how storage wrapper interacts
      if (data?.session) {
        try {
          const tokenData = {
            currentSession: data.session,
            expiresAt: Date.now() + 3600000,
          };
          window.localStorage.setItem(
            "supabase.auth.token",
            JSON.stringify(tokenData)
          );
          window.sessionStorage.setItem(
            "supabase.auth.token",
            JSON.stringify(tokenData)
          );
          window.dispatchEvent(
            new CustomEvent("supabase-session-update", {
              detail: { session: data.session },
            })
          );
          console.log("Session saved manually after successful authentication");
        } catch (storageError) {
          console.error("Error saving session to storage:", storageError);
        }
      }
      return { data: data, error: null, status: "success" as const };
    },
    async signUp(email: string, password: string) {
      console.log("Starting sign up for:", email);
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error)
        return {
          data: null,
          error: formatError(error),
          status: "error" as const,
        };
      return { data: data, error: null, status: "success" as const };
    },
    async signOut() {
      console.log("Starting sign out");
      const { error } = await supabase.auth.signOut();
      if (error)
        return {
          data: null,
          error: formatError(error),
          status: "error" as const,
        };
      return { data: null, error: null, status: "success" as const };
    },
    async getSession() {
      console.log("Getting session");
      const { data, error } = await supabase.auth.getSession();
      if (error)
        return {
          data: null,
          error: formatError(error),
          status: "error" as const,
        };
      return { data: data, error: null, status: "success" as const };
    },
    async getUser() {
      console.log("Getting user");
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error)
        return {
          data: null,
          error: formatError(error),
          status: "error" as const,
        };
      return { data: user, error: null, status: "success" as const };
    },
  },

  // --- Funcții pentru storage (Simplified) ---
  storage: {
    async upload(bucket: string, path: string, file: File) {
      console.log(`Uploading to ${bucket}/${path}`);
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file);
      if (error)
        return {
          data: null,
          error: formatError(error),
          status: "error" as const,
        };
      return { data: data, error: null, status: "success" as const };
    },
    async download(bucket: string, path: string) {
      console.log(`Downloading from ${bucket}/${path}`);
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);
      if (error)
        return {
          data: null,
          error: formatError(error),
          status: "error" as const,
        };
      return { data: data, error: null, status: "success" as const };
    },
    async remove(bucket: string, paths: string[]) {
      console.log(`Removing from ${bucket}: ${paths.join(", ")}`);
      const { data, error } = await supabase.storage.from(bucket).remove(paths);
      if (error)
        return {
          data: null,
          error: formatError(error),
          status: "error" as const,
        };
      return { data: data, error: null, status: "success" as const };
    },
    getPublicUrl(bucket: string, path: string) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data; // Return the object directly { publicUrl: string }
    },
  },

  // --- Funcții pentru RPC (Remote Procedure Call) (Simplified) ---
  async rpc<T>(
    functionName: SupabaseRpcFunctions, // Use specific union type
    params?: Record<string, any>
  ): Promise<SupabaseResponse<T>> {
    console.log(`Calling RPC function: ${String(functionName)}`);
    try {
      const { data, error } = await supabase.rpc(functionName, params); // Use specific type
      if (error)
        return {
          data: null,
          error: formatError(error),
          status: "error" as const,
        };
      return {
        data: data as T | null,
        error: null,
        status: "success" as const,
      };
    } catch (error) {
      console.error(
        `Error calling RPC function ${String(functionName)}:`,
        error
      );
      return { data: null, error: formatError(error), status: "error" };
    }
  },

  // --- Extindere supabaseService cu metode suplimentare (Simplified) ---
  async upsert<T>(
    table: SupabaseTables, // Use specific union type
    data: Partial<T> | Partial<T>[],
    onConflict?: string[]
  ): Promise<SupabaseResponse<T[]>> {
    try {
      const conflict = Array.isArray(onConflict)
        ? onConflict.join(",")
        : onConflict;
      const { data: resultData, error } = await supabase
        .from(table) // Use table directly
        .upsert(data as any, { onConflict: conflict })
        .select();
      if (error)
        return { data: null, error: formatError(error), status: "error" };
      return { data: resultData as T[], error: null, status: "success" };
    } catch (error) {
      console.error(`Error in upsert operation for table ${table}:`, error);
      return { data: null, error: formatError(error), status: "error" };
    }
  },

  async bulkInsert<T>(
    table: SupabaseTables, // Use specific union type
    data: Partial<T>[]
  ): Promise<SupabaseResponse<T[]>> {
    try {
      const { data: resultData, error } = await supabase
        .from(table) // Use table directly
        .insert(data as any)
        .select();
      if (error)
        return { data: null, error: formatError(error), status: "error" };
      return { data: resultData as T[], error: null, status: "success" };
    } catch (error) {
      console.error(
        `Error in bulk insert operation for table ${table}:`,
        error
      );
      return { data: null, error: formatError(error), status: "error" };
    }
  },

  async bulkUpdate<T>(
    table: SupabaseTables, // Use specific union type
    data: Partial<T>[],
    filters: Record<string, any>
  ): Promise<SupabaseResponse<T[]>> {
    try {
      let query: any = supabase.from(table).update(data as any); // Use table directly
      Object.entries(filters).forEach(([col, val]) => {
        query = query.eq(col, val as any);
      });
      const { data: resultData, error } = await query.select();
      if (error)
        return { data: null, error: formatError(error), status: "error" };
      return { data: resultData as T[], error: null, status: "success" };
    } catch (error) {
      console.error(
        `Error in bulk update operation for table ${table}:`,
        error
      );
      return { data: null, error: formatError(error), status: "error" };
    }
  },
  async bulkDelete<T>(
    table: SupabaseTables, // Use specific union type
    filters: Record<string, any>[]
  ): Promise<SupabaseResponse<T[]>> {
    try {
      let query: any = supabase.from(table).delete(); // Use table directly
      filters.forEach((filt) =>
        Object.entries(filt).forEach(([col, val]) => {
          query = query.eq(col, val as any);
        })
      );
      const { data: resultData, error } = await query.select();
      if (error)
        return { data: null, error: formatError(error), status: "error" };
      return { data: resultData as T[], error: null, status: "success" };
    } catch (error) {
      console.error(
        `Error in bulk delete operation for table ${table}:`,
        error
      );
      return { data: null, error: formatError(error), status: "error" };
    }
  },

  async paginate<T>(
    table: SupabaseTables, // Use specific union type
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
    error: SupabaseErrorResponse | null;
    status: "success" | "error";
  }> {
    try {
      const from = (page - 1) * pageSize;
      const to = page * pageSize - 1;
      let query = supabase
        .from(table) // Use table directly
        .select(columns, { count: "exact" })
        .range(from, to);

      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null)
            query = query.eq(key, value);
        });
      }
      if (options?.order) {
        query = query.order(options.order.column, {
          ascending: options.order.ascending,
        });
      }

      const { data, error, count } = await query;

      if (error) {
        console.error(`Error paginating table ${table}:`, error);
        return {
          data: null,
          total: null,
          page,
          pageSize,
          error: formatError(error),
          status: "error",
        };
      }
      return {
        data: data as T[],
        total: count,
        page,
        pageSize,
        error: null,
        status: "success",
      };
    } catch (error) {
      console.error(
        `Unexpected error during pagination for table ${table}:`,
        error
      );
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

  // Subscribe using channels
  subscribe(
    table: SupabaseTables, // Use specific union type
    event: "INSERT" | "UPDATE" | "DELETE" | "*",
    callback: (payload: any) => void, // Use any for payload flexibility
    filters?: Record<string, string>
  ): RealtimeChannel {
    const channelName = `supabase-service:${table}:${
      filters ? JSON.stringify(filters) : "all"
    }`;
    const channel = supabase.channel(channelName);
    let filterString = "";
    if (filters) {
      filterString = Object.entries(filters)
        .map(([key, value]) => `${key}=eq.${value}`)
        .join("&");
    }
    channel
      .on(
        "postgres_changes", // Correct event type for table changes
        {
          event: event === "*" ? "*" : event,
          schema: "public",
          table: table,
          filter: filterString || undefined,
        },
        (payload: any) => callback(payload) // Use any for payload
      )
      .subscribe((status, err) => {
        if (err) console.error(`Error subscribing to ${channelName}:`, err);
        else console.log(`Subscribed to ${channelName} with status: ${status}`);
      });
    return channel;
  },

  unsubscribe(channel: RealtimeChannel) {
    if (channel) {
      supabase
        .removeChannel(channel)
        .then(() => console.log(`Unsubscribed from channel: ${channel.topic}`))
        .catch((err) => console.error("Error unsubscribing:", err));
    } else {
      console.warn("Attempted to unsubscribe from an invalid channel object.");
    }
  },

  async custom<T>(
    queryFn: (client: any) => Promise<any>
  ): Promise<SupabaseResponse<T>> {
    try {
      const result = await queryFn(supabase);
      if (result && typeof result === "object" && "error" in result) {
        if (result.error)
          return {
            data: null,
            error: formatError(result.error),
            status: "error",
          };
        return {
          data: result.data as T | null,
          error: null,
          status: "success",
        };
      }
      return { data: result as T | null, error: null, status: "success" };
    } catch (error) {
      console.error("Error executing custom query function:", error);
      return { data: null, error: formatError(error), status: "error" };
    }
  },
};

export default supabaseService;
