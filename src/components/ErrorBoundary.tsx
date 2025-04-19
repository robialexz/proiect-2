import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Componenta ErrorBoundary pentru gestionarea erorilor în aplicație
 * Captează erorile din componentele copil și afișează un fallback
 */
class ErrorBoundaryClass extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Actualizăm starea pentru a afișa fallback-ul
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Logăm eroarea
    console.error("Error caught by ErrorBoundary:", error, errorInfo);

    // Actualizăm starea cu informațiile despre eroare
    this.setState({ errorInfo });

    // Apelăm callback-ul onError dacă există
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Trimitem eroarea către un serviciu de monitorizare (dacă există)
    if (window.Sentry) {
      window.Sentry.captureException(error);
    }
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      // Dacă avem un fallback personalizat, îl afișăm
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Altfel, afișăm fallback-ul implicit
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={() =>
            this.setState({ hasError: false, error: null, errorInfo: null })
          }
        />
      );
    }

    // Dacă nu avem erori, afișăm copiii
    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  resetError: () => void;
}

/**
 * Componenta de fallback pentru afișarea erorilor
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  resetError,
}) => {
  // Folosim window.location în loc de useNavigate pentru a evita dependența de Router
  // const navigate = useNavigate();

  const handleRefresh = () => {
    // Resetăm eroarea
    resetError();

    // Reîncărcăm pagina
    window.location.reload();
  };

  const handleGoHome = () => {
    // Resetăm eroarea
    resetError();

    // Navigăm către pagina principală folosind window.location
    window.location.href = "/";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
      <Card className="w-full max-w-md border-red-800 bg-slate-800 text-white shadow-lg">
        <CardHeader className="border-b border-slate-700 pb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <CardTitle className="text-xl text-red-500">
              A apărut o eroare
            </CardTitle>
          </div>
          <CardDescription className="text-slate-400">
            Ne pare rău, dar a apărut o eroare în aplicație.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="rounded-md bg-slate-900 p-4 text-sm">
              <p className="font-mono text-red-400">{error?.toString()}</p>

              {process.env.NODE_ENV === "development" && errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-slate-400 hover:text-slate-300">
                    Detalii tehnice
                  </summary>
                  <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap text-xs text-slate-400">
                    {errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>

            <p className="text-sm text-slate-400">
              Puteți încerca să reîmprospătați pagina sau să vă întoarceți la
              pagina principală.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t border-slate-700 pt-4">
          <Button
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
            onClick={handleGoHome}
          >
            <Home className="mr-2 h-4 w-4" />
            Pagina principală
          </Button>

          <Button
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
            onClick={handleRefresh}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reîmprospătează
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

/**
 * Hook pentru a utiliza ErrorBoundary în componente funcționale
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
): React.FC<P> {
  return (props: P) => (
    <ErrorBoundaryClass fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundaryClass>
  );
}

/**
 * Componenta ErrorBoundary pentru utilizare directă
 */
export const ErrorBoundary: React.FC<Props> = (props) => {
  return <ErrorBoundaryClass {...props} />;
};

export default ErrorBoundary;
