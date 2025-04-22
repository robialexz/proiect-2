/**
 * Model pentru erori
 * Acest fișier conține modelele pentru erori
 */

import { ID } from './index';
import { User } from './user.model';

/**
 * Severitatea erorilor
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Sursa erorilor
 */
export enum ErrorSource {
  CLIENT = 'client',
  SERVER = 'server',
  NETWORK = 'network',
  AUTH = 'auth',
  DATABASE = 'database',
  UNKNOWN = 'unknown',
}

/**
 * Tipul de eroare
 */
export enum ErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  TIMEOUT = 'timeout',
  SERVER_ERROR = 'server_error',
  CLIENT_ERROR = 'client_error',
  NETWORK_ERROR = 'network_error',
  UNKNOWN = 'unknown',
}

/**
 * Interfața pentru eroare
 */
export interface ErrorReport {
  id: ID;
  message: string;
  code?: string;
  source: ErrorSource;
  type: ErrorType;
  severity: ErrorSeverity;
  timestamp: string;
  user_id?: ID;
  user?: User;
  session_id?: string;
  url?: string;
  user_agent?: string;
  context?: any;
  stack_trace?: string;
  resolved?: boolean;
  resolution_notes?: string;
}

/**
 * Interfața pentru crearea unei erori
 */
export interface CreateErrorReportInput {
  message: string;
  code?: string;
  source: ErrorSource;
  type: ErrorType;
  severity: ErrorSeverity;
  user_id?: ID;
  session_id?: string;
  url?: string;
  user_agent?: string;
  context?: any;
  stack_trace?: string;
}

/**
 * Interfața pentru actualizarea unei erori
 */
export interface UpdateErrorReportInput {
  resolved?: boolean;
  resolution_notes?: string;
}

/**
 * Interfața pentru filtrarea erorilor
 */
export interface ErrorReportFilter {
  search?: string;
  source?: ErrorSource | ErrorSource[];
  type?: ErrorType | ErrorType[];
  severity?: ErrorSeverity | ErrorSeverity[];
  user_id?: ID | ID[];
  resolved?: boolean;
  timestamp_start?: string;
  timestamp_end?: string;
}

/**
 * Interfața pentru sortarea erorilor
 */
export interface ErrorReportSort {
  field: keyof ErrorReport;
  direction: 'asc' | 'desc';
}

/**
 * Interfața pentru paginarea erorilor
 */
export interface ErrorReportPagination {
  page: number;
  limit: number;
}

/**
 * Interfața pentru răspunsul paginat de erori
 */
export interface ErrorReportPaginatedResponse {
  data: ErrorReport[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default {
  ErrorSeverity,
  ErrorSource,
  ErrorType,
};
