import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Props pentru componenta LazyLoad
 */
interface LazyLoadProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  className?: string;
  rootMargin?: string;
  threshold?: number;
  onVisible?: () => void;
  height?: number | string;
  width?: number | string;
  once?: boolean;
}

/**
 * Componenta pentru încărcarea leneșă a conținutului
 * Încarcă conținutul doar când este vizibil în viewport
 */
export function LazyLoad({
  children,
  placeholder,
  className,
  rootMargin = '100px',
  threshold = 0.1,
  onVisible,
  height,
  width,
  once = true
}: LazyLoadProps): React.ReactElement {
  // Starea pentru vizibilitate
  const [isVisible, setIsVisible] = useState(false);
  
  // Referință către container
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Folosim Intersection Observer pentru a detecta când elementul este vizibil
  useEffect(() => {
    // Dacă elementul este deja vizibil și once este true, nu mai facem nimic
    if (isVisible && once) {
      return;
    }
    
    // Creăm un observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Actualizăm starea când elementul devine vizibil
        if (entry.isIntersecting) {
          setIsVisible(true);
          
          // Apelăm callback-ul
          if (onVisible) {
            onVisible();
          }
          
          // Dacă once este true, ne dezabonăm
          if (once && containerRef.current) {
            observer.unobserve(containerRef.current);
          }
        } else if (!once) {
          // Dacă once este false, actualizăm starea când elementul nu mai este vizibil
          setIsVisible(false);
        }
      },
      { rootMargin, threshold }
    );
    
    // Observăm elementul
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    // Curățăm observer-ul la unmount
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [rootMargin, threshold, onVisible, once, isVisible]);
  
  return (
    <div
      ref={containerRef}
      className={cn('overflow-hidden', className)}
      style={{ height, width }}
    >
      {isVisible ? children : placeholder}
    </div>
  );
}

/**
 * Props pentru componenta LazyImage
 */
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholderSrc?: string;
  className?: string;
  containerClassName?: string;
  rootMargin?: string;
  threshold?: number;
  onVisible?: () => void;
}

/**
 * Componenta pentru încărcarea leneșă a imaginilor
 * Încarcă imaginea doar când este vizibilă în viewport
 */
export function LazyImage({
  src,
  alt,
  placeholderSrc,
  className,
  containerClassName,
  rootMargin = '100px',
  threshold = 0.1,
  onVisible,
  ...props
}: LazyImageProps): React.ReactElement {
  // Starea pentru vizibilitate
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Referință către container
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Folosim Intersection Observer pentru a detecta când elementul este vizibil
  useEffect(() => {
    // Dacă imaginea este deja încărcată, nu mai facem nimic
    if (isLoaded) {
      return;
    }
    
    // Creăm un observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Actualizăm starea când elementul devine vizibil
        if (entry.isIntersecting) {
          setIsVisible(true);
          
          // Apelăm callback-ul
          if (onVisible) {
            onVisible();
          }
          
          // Ne dezabonăm
          if (containerRef.current) {
            observer.unobserve(containerRef.current);
          }
        }
      },
      { rootMargin, threshold }
    );
    
    // Observăm elementul
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    // Curățăm observer-ul la unmount
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [rootMargin, threshold, onVisible, isLoaded]);
  
  // Gestionăm încărcarea imaginii
  const handleLoad = () => {
    setIsLoaded(true);
  };
  
  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', containerClassName)}
    >
      {/* Placeholder */}
      {!isLoaded && placeholderSrc && (
        <img
          src={placeholderSrc}
          alt={alt}
          className={cn('absolute inset-0 w-full h-full object-cover', className)}
          style={{ filter: 'blur(10px)' }}
        />
      )}
      
      {/* Imaginea */}
      {isVisible && (
        <img
          src={src}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={handleLoad}
          {...props}
        />
      )}
    </div>
  );
}

export default {
  LazyLoad,
  LazyImage
};
