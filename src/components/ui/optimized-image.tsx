import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import useOptimizedImage from '@/hooks/useOptimizedImage';
import { ImageSize } from '@/lib/image-optimizer';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  size?: ImageSize;
  quality?: number;
  fallbackSrc?: string;
  className?: string;
  containerClassName?: string;
  showPlaceholder?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  size = ImageSize.MEDIUM,
  quality = 80,
  fallbackSrc,
  className,
  containerClassName,
  showPlaceholder = true,
  ...props
}: OptimizedImageProps) {
  const { src: optimizedSrc, isLoading, error } = useOptimizedImage(src, size, quality);
  const [hasError, setHasError] = useState(false);

  // Determinăm sursa finală a imaginii
  const finalSrc = error || hasError ? (fallbackSrc || '') : optimizedSrc;

  // Gestionăm eroarea de încărcare a imaginii
  const handleError = () => {
    setHasError(true);
  };

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      {/* Placeholder pentru încărcare */}
      {(isLoading && showPlaceholder) && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse" />
      )}

      {/* Imaginea optimizată */}
      {finalSrc ? (
        <img
          src={finalSrc}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            className
          )}
          onError={handleError}
          loading="lazy"
          {...props}
        />
      ) : (
        // Placeholder pentru imagine lipsă
        <div
          className={cn(
            'w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600',
            className
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

export default OptimizedImage;
