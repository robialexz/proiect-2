// Export all models
export * from './user.model';
export * from './project.model';
export * from './material.model';
export * from './supplier.model';
export * from './team.model';

// Export common types
export type ID = string | number;
export type Status = 'idle' | 'loading' | 'success' | 'error';

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

export type SortDirection = 'asc' | 'desc';

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
