import React, { Suspense, lazy, ComponentType } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

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

  /**
   * Prioritatea de preîncărcare (0-100)
   * Cu cât este mai mare, cu atât pagina va fi preîncărcată mai devreme
   */
  priority?: number;
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
 * Componenta de fallback pentru pagini
 */
const PageFallback = () => (
  <div className="w-full h-full p-4 space-y-4">
    <Skeleton className="h-8 w-1/3 mb-6" />
    <Card className="p-4">
      <Skeleton className="h-4 w-full mb-4" />
      <Skeleton className="h-4 w-3/4 mb-4" />
      <Skeleton className="h-4 w-1/2" />
    </Card>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </Card>
        ))}
    </div>
  </div>
);

/**
 * Componenta de fallback pentru erori
 */
const ErrorFallback = ({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) => (
  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
    <h2 className="text-xl font-semibold text-destructive mb-2">
      Eroare la încărcarea paginii
    </h2>
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
  {
    children: React.ReactNode;
    fallback: React.ComponentType<{
      error: Error;
      resetErrorBoundary: () => void;
    }>;
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: {
    children: React.ReactNode;
    fallback: React.ComponentType<{
      error: Error;
      resetErrorBoundary: () => void;
    }>;
  }) {
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
      return (
        <Fallback
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
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
    minDisplayTime = 500,
  } = options;

  // Creăm componenta lazy cu optimizări de performanță
  const LazyComponent = lazy(() => {
    // Folosim performance.mark pentru a măsura timpul de încărcare
    const startMark = `lazy-load-${Math.random().toString(36).substring(2, 9)}`;
    performance.mark(startMark);

    // Adăugăm întârziere și timp minim de afișare
    return Promise.all([
      importFn(),
      // Folosim delay doar dacă este mai mare de 0
      delay > 0
        ? new Promise((resolve) => setTimeout(resolve, delay))
        : Promise.resolve(),
    ])
      .then(([moduleExports]) => {
        // Adăugăm timp minim de afișare doar dacă este mai mare de 0
        if (minDisplayTime > 0) {
          return new Promise((resolve) => {
            setTimeout(() => {
              // Măsurăm timpul de încărcare
              performance.measure(`lazy-load-time`, startMark);
              resolve(moduleExports);
            }, minDisplayTime);
          });
        }

        // Măsurăm timpul de încărcare
        performance.measure(`lazy-load-time`, startMark);
        return moduleExports;
      })
      .catch((error) => {
        // Removed console statement
        // Măsurăm timpul de încărcare chiar și în caz de eroare
        performance.measure(`lazy-load-error-time`, startMark);
        throw error;
      });
  });

  // Preîncărcăm pagina dacă este necesar
  if (preload) {
    // Folosim requestIdleCallback pentru a preîncărca în timpul inactiv
    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(
          () => {
            importFn().catch(() => {
              // Ignorăm erorile de preîncărcare
            });
          },
          { timeout: 2000 }
        );
      } else {
        setTimeout(() => {
          importFn().catch(() => {
            // Ignorăm erorile de preîncărcare
          });
        }, 1000);
      }
    }
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

/**
 * Preîncarcă o pagină
 * @param importFn Funcția de import pentru pagină
 */
export function preloadPage<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): void {
  // Folosim requestIdleCallback pentru a preîncărca în timpul inactiv
  if (typeof window !== "undefined") {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(
        () => {
          importFn().catch(() => {
            // Ignorăm erorile de preîncărcare
          });
        },
        { timeout: 2000 }
      );
    } else {
      setTimeout(() => {
        importFn().catch(() => {
          // Ignorăm erorile de preîncărcare
        });
      }, 1000);
    }
  }
}

/**
 * Preîncarcă mai multe pagini în funcție de prioritate
 * @param pages Obiect cu funcțiile de import și prioritățile lor
 */
export function preloadPages(
  pages: Record<string, { importFn: () => Promise<any>; priority: number }>
): void {
  // Sortăm paginile după prioritate (descrescător)
  const sortedPages = Object.entries(pages).sort(
    (a, b) => b[1].priority - a[1].priority
  );

  // Preîncărcăm paginile una câte una, cu întârzieri între ele
  sortedPages.forEach(([_, { importFn }], index) => {
    setTimeout(() => {
      preloadPage(importFn);
    }, index * 300); // 300ms între preîncărcări pentru a nu bloca thread-ul principal
  });
}

export default {
  lazyPage,
  preloadPage,
  preloadPages,
  DefaultFallback,
  PageFallback,
  ErrorFallback,
  ErrorBoundary,
};
