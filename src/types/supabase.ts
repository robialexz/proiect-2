import { Database } from "./supabase-types";
import { SupabaseTables, SupabaseRpcFunctions } from "./supabase-tables";

// Tipuri pentru tabele
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Tipuri pentru funcții RPC
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

// Tipuri pentru utilizator
export type UserMetadata = {
  name?: string;
  avatar_url?: string;
  role?: string;
  permissions?: string[];
};

// Tipuri pentru sesiune
export type Session = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
  user: User;
};

// Tipuri pentru utilizator
export type User = {
  id: string;
  email?: string;
  app_metadata: {
    provider?: string;
    providers?: string[];
  };
  user_metadata: UserMetadata;
  aud: string;
  created_at: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
  role?: string;
  updated_at?: string;
};

// Tipuri pentru răspunsuri
export type SupabaseResponse<T> = {
  data: T | null;
  error: SupabaseError | null;
  status: "success" | "error";
  fromCache?: boolean;
};

// Tipuri pentru erori
export type SupabaseError = {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
};

// Tipuri pentru opțiuni de interogare
export type QueryOptions = {
  filters?: Record<string, any>;
  order?: {
    column: string;
    ascending?: boolean;
  };
  limit?: number;
  offset?: number;
  single?: boolean;
};

// Tipuri pentru paginare
export type PaginationOptions = {
  page: number;
  pageSize: number;
};

// Tipuri pentru răspunsuri paginate
export type PaginatedResponse<T> = {
  data: T[] | null;
  total: number | null;
  page: number;
  pageSize: number;
  error: SupabaseError | null;
  status: "success" | "error";
  fromCache?: boolean;
};

// Tipuri pentru abonamente în timp real
export type RealtimeSubscription = {
  unsubscribe: () => void;
};

// Tipuri pentru evenimentele în timp real
export type RealtimeEvent<T> = {
  new: T | null;
  old: T | null;
  eventType: "INSERT" | "UPDATE" | "DELETE";
};

// Tipuri pentru funcțiile RPC
export type RpcResponse<T> = {
  data: T | null;
  error: SupabaseError | null;
  status: "success" | "error";
};

// Exportăm toate tipurile
export type { Database, SupabaseTables, SupabaseRpcFunctions };
