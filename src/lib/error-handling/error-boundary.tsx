/**
 * Componentă pentru gestionarea erorilor în React
 * Acest fișier conține componenta ErrorBoundary pentru gestionarea erorilor în componente React
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorReporter } from './error-reporter';
import { ErrorSeverity, ErrorSource, ErrorType } from './error-types';

// Proprietățile pentru componenta ErrorBoundary
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetOnRouteChange?: boolean;
}

// Starea pentru componenta ErrorBoundary
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Componentă pentru gestionarea erorilor în React
 * Această componentă prinde erorile din componentele copil și afișează un fallback
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  // Metoda statică pentru actualizarea stării când apare o eroare
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  // Metoda pentru gestionarea erorilor
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Raportăm eroarea
    errorReporter.reportError({
      message: error.message,
      source: ErrorSource.CLIENT,
      type: ErrorType.CLIENT_ERROR,
      severity: ErrorSeverity.ERROR,
      timestamp: new Date().toISOString(),
      context: {
        componentStack: errorInfo.componentStack,
      },
      originalError: error,
    });

    // Apelăm handler-ul personalizat dacă există
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  // Metoda pentru resetarea stării de eroare
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  // Metoda pentru actualizarea componentei când se schimbă proprietățile
  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Resetăm eroarea când se schimbă proprietățile, dacă este configurat
    if (
      this.props.resetOnPropsChange &&
      this.state.hasError &&
      prevProps.children !== this.props.children
    ) {
      this.resetError();
    }
  }

  // Metoda pentru randarea componentei
  render(): ReactNode {
    // Dacă avem o eroare, afișăm fallback-ul
    if (this.state.hasError && this.state.error) {
      // Dacă fallback-ul este o funcție, o apelăm cu eroarea și funcția de resetare
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // Dacă avem un fallback, îl afișăm
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback implicit
      return (
        <div className="error-boundary">
          <h2>A apărut o eroare</h2>
          <p>{this.state.error.message}</p>
          <button onClick={this.resetError}>Încearcă din nou</button>
        </div>
      );
    }

    // Dacă nu avem erori, afișăm copiii
    return this.props.children;
  }
}

/**
 * Hook pentru a crea o limită de eroare pentru o componentă funcțională
 * @param options Opțiunile pentru limita de eroare
 * @returns O funcție pentru a reseta eroarea și o componentă pentru a afișa eroarea
 */
export function useErrorBoundary(options: {
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  onError?: (error: Error) => void;
} = {}): [
  (error: Error) => void,
  ReactNode
] {
  const [error, setError] = React.useState<Error | null>(null);

  // Funcția pentru a raporta o eroare
  const reportError = React.useCallback((error: Error) => {
    setError(error);

    // Raportăm eroarea
    errorReporter.reportError({
      message: error.message,
      source: ErrorSource.CLIENT,
      type: ErrorType.CLIENT_ERROR,
      severity: ErrorSeverity.ERROR,
      timestamp: new Date().toISOString(),
      originalError: error,
    });

    // Apelăm handler-ul personalizat dacă există
    if (options.onError) {
      options.onError(error);
    }
  }, [options.onError]);

  // Funcția pentru a reseta eroarea
  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  // Componenta pentru a afișa eroarea
  const ErrorComponent = React.useMemo(() => {
    if (!error) return null;

    // Dacă fallback-ul este o funcție, o apelăm cu eroarea și funcția de resetare
    if (typeof options.fallback === 'function') {
      return options.fallback(error, resetError);
    }

    // Dacă avem un fallback, îl afișăm
    if (options.fallback) {
      return options.fallback;
    }

    // Fallback implicit
    return (
      <div className="error-boundary">
        <h2>A apărut o eroare</h2>
        <p>{error.message}</p>
        <button onClick={resetError}>Încearcă din nou</button>
      </div>
    );
  }, [error, options.fallback, resetError]);

  return [reportError, ErrorComponent];
}

/**
 * Componentă pentru a crea o limită de eroare pentru o componentă funcțională
 * @param props Proprietățile pentru componenta FunctionErrorBoundary
 * @returns Componenta cu limită de eroare
 */
export function FunctionErrorBoundary({
  children,
  fallback,
  onError,
}: {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  onError?: (error: Error) => void;
}): ReactNode {
  const [reportError, ErrorComponent] = useErrorBoundary({ fallback, onError });

  // Folosim un efect pentru a prinde erorile din efecte
  React.useEffect(() => {
    const originalConsoleError = console.error;

    // Înlocuim console.error pentru a prinde erorile
    console.error = (...args: any[]) => {
      // Apelăm console.error original
      originalConsoleError(...args);

      // Verificăm dacă primul argument este o eroare
      if (args[0] instanceof Error) {
        reportError(args[0]);
      }
    };

    // Restaurăm console.error original la demontare
    return () => {
      console.error = originalConsoleError;
    };
  }, [reportError]);

  // Dacă avem o eroare, afișăm componenta de eroare
  if (ErrorComponent) {
    return ErrorComponent;
  }

  // Dacă nu avem erori, afișăm copiii
  return children;
}

export default {
  ErrorBoundary,
  useErrorBoundary,
  FunctionErrorBoundary,
};
