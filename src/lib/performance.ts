import { useCallback, useMemo, useRef, useEffect } from 'react';

/**
 * Custom hook for memoizing expensive calculations
 * @param callback The function to memoize
 * @param dependencies The dependencies array
 * @returns The memoized value
 */
export function useMemoizedValue<T>(callback: () => T, dependencies: React.DependencyList): T {
  return useMemo(() => callback(), dependencies);
}

/**
 * Custom hook for memoizing callbacks
 * @param callback The callback to memoize
 * @param dependencies The dependencies array
 * @returns The memoized callback
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList
): T {
  return useCallback(callback, dependencies);
}

/**
 * Custom hook for debouncing function calls
 * @param callback The function to debounce
 * @param delay The debounce delay in milliseconds
 * @returns The debounced function
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

/**
 * Custom hook for throttling function calls
 * @param callback The function to throttle
 * @param limit The throttle limit in milliseconds
 * @returns The throttled function
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void {
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRunRef.current;

      if (timeSinceLastRun >= limit) {
        lastRunRef.current = now;
        callback(...args);
      } else if (timeoutRef.current === null) {
        timeoutRef.current = window.setTimeout(() => {
          lastRunRef.current = Date.now();
          timeoutRef.current = null;
          callback(...args);
        }, limit - timeSinceLastRun);
      }
    },
    [callback, limit]
  );
}

/**
 * Utility to create a memoized component
 * @param Component The component to memoize
 * @returns The memoized component
 */
export function createMemoizedComponent<T extends React.ComponentType<any>>(
  Component: T
): T {
  return React.memo(Component) as T;
}
