/**
 * Hook pentru tratarea erorilor
 * Acest fișier conține un hook pentru tratarea erorilor
 */

import React, { useState, useCallback, useEffect } from 'react';
import { createError, reportError, AppError, ErrorOptions } from './error-utils';
import { ErrorSeverity, ErrorSource, ErrorType } from '@/models/error.model';
import { useNotifications } from '@/lib/notifications';
import { logger } from '@/lib/logging';

/**
 * Context pentru error boundary
 */
export const ErrorBoundaryContext = React.createContext<{
  error: Error | null;
  resetError: () => void;
  reportError: (error: Error | string, options?: ErrorOptions) => void;
}>({
  error: null,
  resetError: () => {},
  reportError: () => {},
});

/**
 * Provider pentru error boundary
 * @param props Proprietățile pentru provider
 * @returns Provider-ul pentru error boundary
 */
export function ErrorBoundaryProvider({ children }: { children: React.ReactNode }) {
  // Starea pentru eroare
  const [error, setError] = useState<Error | null>(null);
  
  // Obținem notificările
  const { showNotification } = useNotifications();
  
  // Funcție pentru resetarea erorii
  const resetError = useCallback(() => {
    setError(null);
  }, []);
  
  // Funcție pentru raportarea erorii
  const handleReportError = useCallback((error: Error | string, options: ErrorOptions = {}) => {
    // Creăm eroarea
    const appError = typeof error === 'string'
      ? createError(error, options)
      : ('source' in error
        ? error as AppError
        : createError(error.message, {
            ...options,
            originalError: error,
          }));
    
    // Setăm eroarea
    setError(appError);
    
    // Raportăm eroarea
    reportError(appError);
    
    // Logăm eroarea
    logger.error(appError.message, appError);
    
    // Afișăm notificarea
    if (appError.severity === ErrorSeverity.ERROR || appError.severity === ErrorSeverity.CRITICAL) {
      showNotification(
        'Eroare',
        appError.message,
        {
          type: 'error',
          autoClose: false,
        }
      );
    } else if (appError.severity === ErrorSeverity.WARNING) {
      showNotification(
        'Avertisment',
        appError.message,
        {
          type: 'warning',
        }
      );
    }
  }, [showNotification]);
  
  // Efect pentru tratarea erorilor globale
  useEffect(() => {
    // Funcție pentru tratarea erorilor globale
    const handleGlobalError = (event: ErrorEvent) => {
      handleReportError(event.error || event.message, {
        source: ErrorSource.CLIENT,
        type: ErrorType.CLIENT_ERROR,
        severity: ErrorSeverity.ERROR,
      });
      
      // Prevenim comportamentul implicit
      event.preventDefault();
    };
    
    // Funcție pentru tratarea promisiunilor respinse
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleReportError(event.reason || 'Unhandled promise rejection', {
        source: ErrorSource.CLIENT,
        type: ErrorType.CLIENT_ERROR,
        severity: ErrorSeverity.ERROR,
      });
      
      // Prevenim comportamentul implicit
      event.preventDefault();
    };
    
    // Adăugăm event listener-urile
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Curățăm event listener-urile
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [handleReportError]);
  
  // Valoarea contextului
  const contextValue = {
    error,
    resetError,
    reportError: handleReportError,
  };
  
  return (
    <ErrorBoundaryContext.Provider value={contextValue}>
      {children}
    </ErrorBoundaryContext.Provider>
  );
}

/**
 * Hook pentru utilizarea error boundary
 * @returns Funcții pentru tratarea erorilor
 */
export function useErrorBoundary() {
  const context = React.useContext(ErrorBoundaryContext);
  
  if (!context) {
    throw new Error('useErrorBoundary trebuie utilizat în interiorul unui ErrorBoundaryProvider');
  }
  
  return [context.reportError, context.resetError, context.error] as const;
}

/**
 * Componentă pentru error boundary
 */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Raportăm eroarea
    reportError(
      'source' in error
        ? error as AppError
        : createError(error.message, {
            source: ErrorSource.CLIENT,
            type: ErrorType.CLIENT_ERROR,
            severity: ErrorSeverity.ERROR,
            originalError: error,
            context: { errorInfo },
          })
    );
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    
    return this.props.children;
  }
}

// Exportăm toate componentele și hook-urile
export default {
  ErrorBoundaryProvider,
  useErrorBoundary,
  ErrorBoundary,
};
