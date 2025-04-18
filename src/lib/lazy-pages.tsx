import React, { Suspense, lazy, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Opțiuni pentru încărcarea leneșă a paginilor
 */
interface LazyPageOptions {
  /**
   * Componenta de afișat în timpul încărcării
   */
  fallback?: React.ReactNode;
  
  /**
   * Preîncarcă pagina
   */
  preload?: boolean;
  
  /**
   * Timpul de întârziere pentru afișarea fallback-ului (ms)
   */
  delay?: number;
  
  /**
   * Timpul minim de afișare a fallback-ului (ms)
   */
  minDisplayTime?: number;
}

/**
 * Componenta de fallback implicită
 */
const DefaultFallback = () => (
  <div className="w-full h-full flex flex-col gap-4 p-6">
    <Skeleton className="h-8 w-1/3" />
    <Skeleton className="h-4 w-2/3" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-2">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  </div>
);

/**
 * Componenta de fallback pentru erori
 */
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
    <h2 className="text-xl font-semibold text-destructive mb-2">Eroare la încărcarea paginii</h2>
    <p className="text-muted-foreground mb-4">{error.message}</p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
    >
      Încearcă din nou
    </button>
  </div>
);

/**
 * Componenta pentru gestionarea erorilor
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }> }) {
    super(props);
    this.state = { hasError: false, error: null };
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  resetErrorBoundary() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const Fallback = this.props.fallback;
      return <Fallback error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />;
    }

    return this.props.children;
  }
}

/**
 * Încarcă o pagină în mod leneș
 * @param importFn Funcția de import
 * @param options Opțiuni pentru încărcarea leneșă
 * @returns Componenta încărcată leneș
 */
export function lazyPage<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyPageOptions = {}
): React.ComponentType<React.ComponentProps<T>> {
  const {
    fallback = <DefaultFallback />,
    preload = false,
    delay = 300,
    minDisplayTime = 500
  } = options;

  // Creăm componenta lazy
  const LazyComponent = lazy(() => {
    // Adăugăm întârziere și timp minim de afișare
    return Promise.all([
      importFn(),
      new Promise(resolve => setTimeout(resolve, delay))
    ])
      .then(([moduleExports]) => {
        // Adăugăm timp minim de afișare
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(moduleExports);
          }, minDisplayTime);
        });
      })
      .catch(error => {
        console.error('Error loading page:', error);
        throw error;
      });
  });

  // Preîncărcăm pagina dacă este necesar
  if (preload) {
    importFn();
  }

  // Returnăm componenta învelită în Suspense și ErrorBoundary
  const WrappedComponent = (props: React.ComponentProps<T>) => (
    <ErrorBoundary fallback={ErrorFallback}>
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );

  // Adăugăm metoda preload la componenta învelită
  (WrappedComponent as any).preload = importFn;

  return WrappedComponent;
}

export default {
  lazyPage,
  DefaultFallback,
  ErrorFallback,
  ErrorBoundary
};
