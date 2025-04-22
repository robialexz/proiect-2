/**
 * Definirea tipurilor de erori pentru aplicație
 * Acest fișier conține tipurile de erori și utilitare pentru gestionarea erorilor
 */

// Severitatea erorilor
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

// Sursa erorilor
export enum ErrorSource {
  CLIENT = 'client',
  SERVER = 'server',
  NETWORK = 'network',
  AUTH = 'auth',
  DATABASE = 'database',
  UNKNOWN = 'unknown',
}

// Tipul de eroare
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

// Interfața pentru erori
export interface AppError {
  message: string;
  code?: string;
  source: ErrorSource;
  type: ErrorType;
  severity: ErrorSeverity;
  timestamp: string;
  context?: Record<string, any>;
  originalError?: any;
}

// Funcție pentru a crea o eroare
export function createError(
  message: string,
  options: {
    code?: string;
    source?: ErrorSource;
    type?: ErrorType;
    severity?: ErrorSeverity;
    context?: Record<string, any>;
    originalError?: any;
  } = {}
): AppError {
  return {
    message,
    code: options.code,
    source: options.source || ErrorSource.UNKNOWN,
    type: options.type || ErrorType.UNKNOWN,
    severity: options.severity || ErrorSeverity.ERROR,
    timestamp: new Date().toISOString(),
    context: options.context,
    originalError: options.originalError,
  };
}

// Funcție pentru a formata o eroare pentru afișare
export function formatErrorForDisplay(error: AppError): string {
  return `${error.message}${error.code ? ` (${error.code})` : ''}`;
}

// Funcție pentru a determina dacă o eroare ar trebui raportată
export function shouldReportError(error: AppError): boolean {
  // Raportăm doar erorile critice și cele de severitate ERROR
  return (
    error.severity === ErrorSeverity.CRITICAL ||
    (error.severity === ErrorSeverity.ERROR &&
      error.source !== ErrorSource.CLIENT)
  );
}

// Funcție pentru a converti o eroare necunoscută într-o eroare de aplicație
export function normalizeError(error: any): AppError {
  if (isAppError(error)) {
    return error;
  }

  // Verificăm dacă este o eroare de rețea
  if (error instanceof TypeError && error.message.includes('network')) {
    return createError('Eroare de conexiune la rețea', {
      source: ErrorSource.NETWORK,
      type: ErrorType.NETWORK_ERROR,
      severity: ErrorSeverity.ERROR,
      originalError: error,
    });
  }

  // Verificăm dacă este o eroare de autentificare
  if (
    error.message &&
    (error.message.includes('auth') ||
      error.message.includes('authentication') ||
      error.message.includes('token') ||
      error.message.includes('session'))
  ) {
    return createError(error.message, {
      source: ErrorSource.AUTH,
      type: ErrorType.AUTHENTICATION,
      severity: ErrorSeverity.ERROR,
      originalError: error,
    });
  }

  // Eroare generică
  return createError(
    error.message || 'A apărut o eroare necunoscută',
    {
      source: ErrorSource.UNKNOWN,
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.ERROR,
      originalError: error,
    }
  );
}

// Funcție pentru a verifica dacă un obiect este o eroare de aplicație
export function isAppError(error: any): error is AppError {
  return (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    'source' in error &&
    'type' in error &&
    'severity' in error &&
    'timestamp' in error
  );
}

export default {
  ErrorSeverity,
  ErrorSource,
  ErrorType,
  createError,
  formatErrorForDisplay,
  shouldReportError,
  normalizeError,
  isAppError,
};
