/**
 * Sistem de recuperare din erori
 * Oferă funcții pentru gestionarea și recuperarea din erori în aplicație
 */

// Tipuri de erori cunoscute
export enum ErrorType {
  AUTHENTICATION = 'authentication',
  NETWORK = 'network',
  DATABASE = 'database',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  UNKNOWN = 'unknown'
}

// Interfață pentru erori structurate
export interface StructuredError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
  recoverable: boolean;
  timestamp: Date;
}

// Starea globală pentru erori
let globalErrorState = {
  hasUnrecoverableError: false,
  lastError: null as StructuredError | null,
  errorCount: 0,
  recoveryAttempts: 0
};

/**
 * Resetează starea globală de erori
 */
export function resetErrorState(): void {
  globalErrorState = {
    hasUnrecoverableError: false,
    lastError: null,
    errorCount: 0,
    recoveryAttempts: 0
  };
}

/**
 * Procesează o eroare și o transformă într-o eroare structurată
 * @param error Eroarea originală
 * @returns Eroarea structurată
 */
export function processError(error: any): StructuredError {
  // Eroare deja structurată
  if (error && typeof error === 'object' && 'type' in error && 'recoverable' in error) {
    return error as StructuredError;
  }

  // Eroare de autentificare
  if (
    error?.message?.includes('authentication') ||
    error?.message?.includes('auth') ||
    error?.message?.includes('login') ||
    error?.message?.includes('token') ||
    error?.message?.includes('session') ||
    error?.code === 'auth/invalid-credential'
  ) {
    return {
      type: ErrorType.AUTHENTICATION,
      message: error.message || 'Eroare de autentificare',
      code: error.code,
      details: error,
      recoverable: true,
      timestamp: new Date()
    };
  }

  // Eroare de rețea
  if (
    error instanceof TypeError && error.message.includes('fetch') ||
    error?.message?.includes('network') ||
    error?.message?.includes('connection') ||
    error?.message?.includes('offline') ||
    error?.code === 'NETWORK_ERROR'
  ) {
    return {
      type: ErrorType.NETWORK,
      message: error.message || 'Eroare de rețea',
      code: error.code,
      details: error,
      recoverable: true,
      timestamp: new Date()
    };
  }

  // Eroare de bază de date
  if (
    error?.message?.includes('database') ||
    error?.message?.includes('db') ||
    error?.message?.includes('query') ||
    error?.message?.includes('supabase') ||
    error?.code?.includes('PGRST')
  ) {
    return {
      type: ErrorType.DATABASE,
      message: error.message || 'Eroare de bază de date',
      code: error.code,
      details: error,
      recoverable: false,
      timestamp: new Date()
    };
  }

  // Eroare de validare
  if (
    error?.message?.includes('validation') ||
    error?.message?.includes('invalid') ||
    error?.message?.includes('required') ||
    error?.code === 'VALIDATION_ERROR'
  ) {
    return {
      type: ErrorType.VALIDATION,
      message: error.message || 'Eroare de validare',
      code: error.code,
      details: error,
      recoverable: true,
      timestamp: new Date()
    };
  }

  // Eroare de permisiune
  if (
    error?.message?.includes('permission') ||
    error?.message?.includes('access') ||
    error?.message?.includes('forbidden') ||
    error?.message?.includes('unauthorized') ||
    error?.code === 'PERMISSION_DENIED'
  ) {
    return {
      type: ErrorType.PERMISSION,
      message: error.message || 'Eroare de permisiune',
      code: error.code,
      details: error,
      recoverable: false,
      timestamp: new Date()
    };
  }

  // Eroare necunoscută
  return {
    type: ErrorType.UNKNOWN,
    message: error?.message || 'A apărut o eroare necunoscută',
    code: error?.code,
    details: error,
    recoverable: true,
    timestamp: new Date()
  };
}

/**
 * Gestionează o eroare și încearcă să se recupereze
 * @param error Eroarea originală
 * @param silent Dacă eroarea ar trebui gestionată silențios
 * @returns Dacă eroarea a fost recuperată
 */
export function handleError(error: any, silent: boolean = false): boolean {
  // Procesăm eroarea
  const structuredError = processError(error);
  
  // Actualizăm starea globală
  globalErrorState.lastError = structuredError;
  globalErrorState.errorCount++;
  
  // Logăm eroarea
  if (!silent) {
    // Removed console statement
  }
  
  // Verificăm dacă eroarea este recuperabilă
  if (!structuredError.recoverable) {
    globalErrorState.hasUnrecoverableError = true;
    return false;
  }
  
  // Încercăm să ne recuperăm în funcție de tipul erorii
  switch (structuredError.type) {
    case ErrorType.AUTHENTICATION:
      // Încercăm să reautentificăm utilizatorul
      if (window.location.pathname !== '/login') {
        // Redirecționăm către pagina de login
        setTimeout(() => {
          window.location.href = '/login?error=session_expired';
        }, 100);
      }
      return true;
      
    case ErrorType.NETWORK:
      // Încercăm să reîncărcăm datele
      globalErrorState.recoveryAttempts++;
      
      // Dacă am încercat de prea multe ori, renunțăm
      if (globalErrorState.recoveryAttempts > 3) {
        return false;
      }
      
      // Încercăm din nou după o scurtă pauză
      setTimeout(() => {
        // Reîncărcăm pagina dacă este necesar
        if (globalErrorState.recoveryAttempts > 2) {
          window.location.reload();
        }
      }, 1000 * globalErrorState.recoveryAttempts);
      
      return true;
      
    case ErrorType.VALIDATION:
      // Validarea este gestionată de componentele individuale
      return true;
      
    default:
      return false;
  }
}

/**
 * Verifică dacă aplicația are o eroare nerecuperabilă
 * @returns Dacă aplicația are o eroare nerecuperabilă
 */
export function hasUnrecoverableError(): boolean {
  return globalErrorState.hasUnrecoverableError;
}

/**
 * Obține ultima eroare
 * @returns Ultima eroare sau null dacă nu există
 */
export function getLastError(): StructuredError | null {
  return globalErrorState.lastError;
}

/**
 * Obține numărul de erori
 * @returns Numărul de erori
 */
export function getErrorCount(): number {
  return globalErrorState.errorCount;
}

/**
 * Încearcă să se recupereze din ultima eroare
 * @returns Dacă recuperarea a reușit
 */
export function attemptRecovery(): boolean {
  if (!globalErrorState.lastError) {
    return true;
  }
  
  // Incrementăm numărul de încercări
  globalErrorState.recoveryAttempts++;
  
  // Verificăm dacă eroarea este recuperabilă
  if (!globalErrorState.lastError.recoverable) {
    return false;
  }
  
  // Încercăm să ne recuperăm în funcție de tipul erorii
  switch (globalErrorState.lastError.type) {
    case ErrorType.AUTHENTICATION:
      // Redirecționăm către pagina de login
      window.location.href = '/login?error=session_expired';
      return true;
      
    case ErrorType.NETWORK:
      // Reîncărcăm pagina
      window.location.reload();
      return true;
      
    default:
      return false;
  }
}

// Exportăm toate funcțiile într-un singur obiect
export const errorRecovery = {
  resetErrorState,
  processError,
  handleError,
  hasUnrecoverableError,
  getLastError,
  getErrorCount,
  attemptRecovery
};
