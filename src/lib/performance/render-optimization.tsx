import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from '@/hooks';

/**
 * Componenta care renderează conținutul doar când este necesar
 */
export function RenderIfNeeded({
  condition,
  children,
  fallback = null
}: {
  condition: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}): React.ReactElement {
  // Folosim useRef pentru a evita re-renderizarea când condiția se schimbă
  const shouldRender = useRef(condition);
  
  // Actualizăm referința doar când condiția devine true
  if (condition && !shouldRender.current) {
    shouldRender.current = true;
  }
  
  // Renderăm conținutul doar dacă condiția este îndeplinită sau a fost îndeplinită anterior
  return <>{shouldRender.current ? children : fallback}</>;
}

/**
 * Componenta care renderează conținutul doar când este vizibil
 */
export function RenderIfVisible({
  children,
  placeholder = null,
  rootMargin = '0px',
  threshold = 0
}: {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
}): React.ReactElement {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
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
    <div ref={ref}>
      {isVisible ? children : placeholder}
    </div>
  );
}

/**
 * Componenta care renderează conținutul doar când fereastra este activă
 */
export function RenderIfWindowActive({
  children,
  fallback = null
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}): React.ReactElement {
  const [isActive, setIsActive] = useState(true);
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsActive(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  return <>{isActive ? children : fallback}</>;
}

/**
 * Componenta care renderează conținutul doar când utilizatorul nu face scroll
 */
export function RenderIfNotScrolling({
  children,
  fallback = null,
  debounceTime = 200
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  debounceTime?: number;
}): React.ReactElement {
  const [isScrolling, setIsScrolling] = useState(false);
  
  // Folosim debounce pentru a evita re-renderizarea frecventă
  const debouncedSetIsScrolling = useDebounce((value: boolean) => {
    setIsScrolling(value);
  }, debounceTime);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      debouncedSetIsScrolling(false);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [debouncedSetIsScrolling]);
  
  return <>{!isScrolling ? children : fallback}</>;
}

/**
 * Componenta care renderează conținutul doar când utilizatorul nu face resize la fereastră
 */
export function RenderIfNotResizing({
  children,
  fallback = null,
  debounceTime = 200
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  debounceTime?: number;
}): React.ReactElement {
  const [isResizing, setIsResizing] = useState(false);
  
  // Folosim debounce pentru a evita re-renderizarea frecventă
  const debouncedSetIsResizing = useDebounce((value: boolean) => {
    setIsResizing(value);
  }, debounceTime);
  
  useEffect(() => {
    const handleResize = () => {
      setIsResizing(true);
      debouncedSetIsResizing(false);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [debouncedSetIsResizing]);
  
  return <>{!isResizing ? children : fallback}</>;
}

/**
 * Componenta care renderează conținutul doar când utilizatorul nu interacționează cu pagina
 */
export function RenderIfIdle({
  children,
  fallback = null,
  idleTime = 2000
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  idleTime?: number;
}): React.ReactElement {
  const [isIdle, setIsIdle] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  
  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    
    setIsIdle(false);
    
    timeoutRef.current = window.setTimeout(() => {
      setIsIdle(true);
    }, idleTime);
  }, [idleTime]);
  
  useEffect(() => {
    // Inițializăm timeout-ul
    resetTimeout();
    
    // Adăugăm event listener-uri pentru interacțiuni
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimeout, { passive: true });
    });
    
    return () => {
      // Curățăm timeout-ul și event listener-urile
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout);
      });
    };
  }, [resetTimeout]);
  
  return <>{isIdle ? children : fallback}</>;
}

/**
 * Componenta care renderează conținutul doar când utilizatorul este online
 */
export function RenderIfOnline({
  children,
  fallback = null
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}): React.ReactElement {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return <>{isOnline ? children : fallback}</>;
}

export default {
  RenderIfNeeded,
  RenderIfVisible,
  RenderIfWindowActive,
  RenderIfNotScrolling,
  RenderIfNotResizing,
  RenderIfIdle,
  RenderIfOnline
};
