import React, {
  Component,
  ErrorInfo,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { errorRecovery } from "@/lib/error-recovery";

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
    // Removed console statement

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

    // Folosim sistemul de recuperare din erori
    errorRecovery.handleError(error, false);
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
  // State pentru a ține evidența încercărilor de recuperare
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState("");

  // Verificăm dacă eroarea este recuperabilă
  const structuredError = error ? errorRecovery.processError(error) : null;
  const isRecoverable = structuredError?.recoverable ?? true;

  // Efect pentru a încerca recuperarea automată pentru anumite tipuri de erori
  useEffect(() => {
    if (
      structuredError &&
      structuredError.recoverable &&
      (structuredError.type === "network" ||
        structuredError.type === "authentication") &&
      recoveryAttempts === 0
    ) {
      // Încercăm recuperarea automată pentru erori de rețea sau autentificare
      handleRecovery();
    }
  }, [structuredError]);

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

  const handleRecovery = () => {
    setIsRecovering(true);
    setRecoveryMessage("Se încearcă recuperarea...");
    setRecoveryAttempts((prev) => prev + 1);

    // Încercăm să ne recuperăm din eroare
    setTimeout(() => {
      const recovered = errorRecovery.attemptRecovery();

      if (recovered) {
        setRecoveryMessage("Recuperare reușită! Se reîncărcă pagina...");
        setTimeout(() => {
          resetError();
          window.location.reload();
        }, 1000);
      } else {
        setIsRecovering(false);
        setRecoveryMessage(
          "Recuperarea a eșuat. Încercați din nou sau reîncărcați pagina."
        );
      }
    }, 1500);
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
            {structuredError?.type === "authentication"
              ? "Sesiunea dumneavoastră a expirat sau ați fost deconectat."
              : "Ne pare rău, dar a apărut o eroare în aplicație."}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="space-y-4">
            {isRecovering ? (
              <div className="flex flex-col items-center justify-center py-4 space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                <p className="text-sm text-slate-300">{recoveryMessage}</p>
              </div>
            ) : (
              <>
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

                {recoveryMessage && (
                  <div className="rounded-md bg-slate-800 p-3 text-sm border border-slate-700">
                    <p className="text-slate-300">{recoveryMessage}</p>
                  </div>
                )}

                <p className="text-sm text-slate-400">
                  {isRecoverable
                    ? "Puteți încerca recuperarea automată sau să reîmprospătați pagina manual."
                    : "Puteți încerca să reîmprospătați pagina sau să vă întoarceți la pagina principală."}
                </p>
              </>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t border-slate-700 pt-4">
          <Button
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
            onClick={handleGoHome}
            disabled={isRecovering}
          >
            <Home className="mr-2 h-4 w-4" />
            Pagina principală
          </Button>

          <div className="flex space-x-2">
            {isRecoverable && !isRecovering && (
              <Button
                variant="secondary"
                className="bg-blue-600 hover:bg-blue-500 text-white"
                onClick={handleRecovery}
                disabled={recoveryAttempts >= 3}
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Recuperare
              </Button>
            )}

            <Button
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
              onClick={handleRefresh}
              disabled={isRecovering}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reîmprospătează
            </Button>
          </div>
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
