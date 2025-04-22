/**
 * Exportă toate modelele
 */

// Exportăm modelele pentru utilizatori
export * from "./user.model";

// Exportăm modelele pentru proiecte
export * from "./project.model";

// Exportăm modelele pentru inventar
export * from "./material.model";

// Exportăm modelele pentru furnizori
export * from "./supplier.model";

// Exportăm modelele pentru echipe
export * from "./team.model";

// Exportăm modelele pentru sarcini
export * from "./task.model";

// Exportăm modelele pentru rapoarte
export * from "./report.model";

// Exportăm modelele pentru notificări
export * from "./notification.model";

// Exportăm modelele pentru documente
export * from "./document.model";

// Exportăm modelele pentru comentarii
export * from "./comment.model";

// Exportăm modelele pentru activități
export * from "./activity.model";

// Exportăm modelele pentru erori
export * from "./error.model";

// Exportăm modelele pentru setări
export * from "./settings.model";

// Export common types
export type ID = string | number;
export type Status = "idle" | "loading" | "success" | "error";

export interface ErrorState {
  message: string;
  code?: string;
  details?: any;
}

export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
}

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Export implicit pentru compatibilitate
export default {};
