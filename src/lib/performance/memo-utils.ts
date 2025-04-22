import { memo, useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { isEqual } from 'lodash-es';

/**
 * Memoizează un component cu o comparație profundă a props-urilor
 * @param Component Componenta de memoizat
 * @returns Componenta memoizată
 */
export function memoWithDeepCompare<T>(Component: T): T {
  return memo(Component as any, isEqual) as any;
}

/**
 * Hook pentru a memoiza o valoare cu dependențe
 * @param factory Funcția care creează valoarea
 * @param deps Dependențele pentru memoizare
 * @returns Valoarea memoizată
 */
export function useMemoDeep<T>(factory: () => T, deps: React.DependencyList): T {
  // Folosim useRef pentru a stoca dependențele anterioare și rezultatul
  const depsRef = useRef<React.DependencyList | null>(null);
  const valueRef = useRef<T | null>(null);
  
  // Verificăm dacă dependențele s-au schimbat
  if (depsRef.current === null || !isEqual(depsRef.current, deps)) {
    // Actualizăm dependențele și valoarea
    depsRef.current = deps;
    valueRef.current = factory();
  }
  
  return valueRef.current as T;
}

/**
 * Hook pentru a memoiza un callback cu dependențe
 * @param callback Funcția de callback
 * @param deps Dependențele pentru memoizare
 * @returns Callback-ul memoizat
 */
export function useCallbackDeep<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  // Folosim useMemoDeep pentru a memoiza callback-ul
  return useMemoDeep(() => callback, deps);
}

/**
 * Hook pentru a preveni actualizările inutile ale stării
 * @param initialState Starea inițială
 * @returns [state, setState] - Starea și funcția pentru actualizare
 */
export function useStateWithComparison<T>(initialState: T): [T, (newState: T | ((prevState: T) => T)) => void] {
  const [state, setState] = useState<T>(initialState);
  
  const setStateWithComparison = useCallback((newState: T | ((prevState: T) => T)) => {
    setState(prevState => {
      // Verificăm dacă noua stare este o funcție
      const nextState = typeof newState === 'function'
        ? (newState as ((prevState: T) => T))(prevState)
        : newState;
      
      // Actualizăm starea doar dacă s-a schimbat
      return isEqual(prevState, nextState) ? prevState : nextState;
    });
  }, []);
  
  return [state, setStateWithComparison];
}

/**
 * Hook pentru a memoiza o valoare cu o cheie
 * @param key Cheia pentru memoizare
 * @param factory Funcția care creează valoarea
 * @returns Valoarea memoizată
 */
export function useMemoKey<T>(key: string | number, factory: () => T): T {
  // Folosim useRef pentru a stoca cache-ul
  const cacheRef = useRef<Map<string | number, T>>(new Map());
  
  // Verificăm dacă avem valoarea în cache
  if (!cacheRef.current.has(key)) {
    // Calculăm valoarea și o adăugăm în cache
    cacheRef.current.set(key, factory());
  }
  
  // Returnăm valoarea din cache
  return cacheRef.current.get(key) as T;
}

/**
 * Hook pentru a măsura timpul de execuție al unei funcții
 * @param name Numele funcției
 * @param fn Funcția de măsurat
 * @param enabled Flag pentru activare/dezactivare
 * @returns Funcția originală
 */
export function usePerformanceMonitor<T extends (...args: any[]) => any>(
  name: string,
  fn: T,
  enabled: boolean = true
): T {
  return useCallback((...args: Parameters<T>) => {
    if (!enabled) {
      return fn(...args);
    }
    
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    // Removed console statement
    
    return result;
  }, [name, fn, enabled]) as T;
}

/**
 * Hook pentru a detecta și preveni re-renderizări inutile
 * @param componentName Numele componentei
 * @param props Props-urile componentei
 */
export function useRenderTracker(componentName: string, props: Record<string, any>): void {
  // Folosim useRef pentru a stoca props-urile anterioare
  const prevPropsRef = useRef<Record<string, any>>({});
  
  useEffect(() => {
    // Găsim props-urile care s-au schimbat
    const changedProps: Record<string, { old: any; new: any }> = {};
    
    // Verificăm props-urile curente
    Object.entries(props).forEach(([key, value]) => {
      if (!isEqual(prevPropsRef.current[key], value)) {
        changedProps[key] = {
          old: prevPropsRef.current[key],
          new: value
        };
      }
    });
    
    // Verificăm props-urile anterioare
    Object.keys(prevPropsRef.current).forEach(key => {
      if (!(key in props)) {
        changedProps[key] = {
          old: prevPropsRef.current[key],
          new: undefined
        };
      }
    });
    
    // Afișăm props-urile care s-au schimbat
    if (Object.keys(changedProps).length > 0) {
      // Removed console statement
    }
    
    // Actualizăm props-urile anterioare
    prevPropsRef.current = { ...props };
  });
}

export default {
  memoWithDeepCompare,
  useMemoDeep,
  useCallbackDeep,
  useStateWithComparison,
  useMemoKey,
  usePerformanceMonitor,
  useRenderTracker
};
