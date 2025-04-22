import React, { lazy, Suspense, ComponentType } from 'react';

/**
 * Opțiuni pentru încărcarea leneșă
 */
interface LazyLoadOptions {
  fallback?: React.ReactNode;
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error) => void;
  preload?: boolean;
}

/**
 * Încarcă o componentă în mod leneș
 * @param importFn Funcția de import
 * @param options Opțiuni pentru încărcarea leneșă
 * @returns Componenta încărcată leneș
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): React.LazyExoticComponent<T> {
  const {
    fallback = <div className="w-full h-full flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>,
    errorComponent,
    onError,
    preload = false
  } = options;
  
  // Creăm componenta lazy
  const LazyComponent = lazy(() => {
    return importFn().catch(error => {
      // Gestionăm eroarea
      if (onError) {
        onError(error);
      } else {
        // Removed console statement
      }
      
      // Returnăm componenta de eroare sau aruncăm eroarea
      if (errorComponent) {
        return {
          default: (props: any) => (
            <ErrorBoundary
              fallback={(error, retry) => (
                React.createElement(errorComponent, { error, retry, ...props })
              )}
            >
              {() => <div>Failed to load component</div>}
            </ErrorBoundary>
          )
        } as { default: T };
      }
      
      throw error;
    });
  });
  
  // Preîncărcăm componenta dacă este necesar
  if (preload) {
    importFn();
  }
  
  // Returnăm componenta învelită în Suspense
  const WrappedComponent = (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
  
  // Adăugăm metoda preload la componenta învelită
  (WrappedComponent as any).preload = importFn;
  
  return LazyComponent;
}

/**
 * Props pentru componenta ErrorBoundary
 */
interface ErrorBoundaryProps {
  children: (hasError: boolean) => React.ReactNode;
  fallback: (error: Error, retry: () => void) => React.ReactNode;
}

/**
 * Starea pentru componenta ErrorBoundary
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Componenta pentru gestionarea erorilor
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
    this.retry = this.retry.bind(this);
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Removed console statement
  }
  
  retry(): void {
    this.setState({ hasError: false, error: null });
  }
  
  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error, this.retry);
    }
    
    return this.props.children(this.state.hasError);
  }
}

/**
 * Încarcă o imagine în mod leneș
 * @param src Sursa imaginii
 * @param options Opțiuni pentru încărcarea leneșă
 * @returns Componenta de imagine încărcată leneș
 */
export function LazyImage({
  src,
  alt,
  className = '',
  width,
  height,
  placeholder = <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" style={{ width, height }} />,
  onLoad,
  onError,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  placeholder?: React.ReactNode;
}): React.ReactElement {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  
  // Gestionăm încărcarea imaginii
  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (onLoad) {
      onLoad(event);
    }
  };
  
  // Gestionăm erorile de încărcare
  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    if (onError) {
      onError(event);
    }
  };
  
  return (
    <>
      {!isLoaded && !hasError && placeholder}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </>
  );
}

/**
 * Încarcă o componentă doar când este vizibilă în viewport
 * @param Component Componenta de încărcat
 * @param options Opțiuni pentru încărcarea leneșă
 * @returns Componenta încărcată când este vizibilă
 */
export function LazyLoadOnVisible<T extends object>({
  children,
  placeholder = null,
  rootMargin = '100px',
  threshold = 0.1,
  ...props
}: {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
} & T): React.ReactElement {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      { rootMargin, threshold }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [rootMargin, threshold]);
  
  return (
    <div ref={ref} {...props}>
      {isVisible ? children : placeholder}
    </div>
  );
}

export default {
  lazyLoad,
  ErrorBoundary,
  LazyImage,
  LazyLoadOnVisible
};
