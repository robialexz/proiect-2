import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  optimizeImage,
  generateBlurPlaceholder,
} from "@/lib/image-optimization";

/**
 * Props pentru componenta OptimizedImage
 */
interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png" | "avif";
  blur?: number;
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
  className?: string;
  containerClassName?: string;
  showPlaceholder?: boolean;
  placeholderColor?: string;
  fallbackSrc?: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
}

/**
 * Componenta pentru imagini optimizate
 * Optimizează imaginile și afișează un placeholder în timpul încărcării
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 80,
  format = "webp",
  blur,
  fit = "cover",
  className,
  containerClassName,
  showPlaceholder = true,
  placeholderColor = "bg-slate-200 dark:bg-slate-800",
  fallbackSrc,
  priority = false,
  loading = "lazy",
  ...props
}: OptimizedImageProps): React.ReactElement {
  // Starea pentru încărcare
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [placeholderSrc, setPlaceholderSrc] = useState<string | null>(null);

  // Optimizăm imaginea
  const optimizedSrc = src
    ? optimizeImage(src, {
        width,
        height,
        quality,
        format,
        blur,
        fit,
      })
    : "";

  // Determinăm sursa finală a imaginii
  const finalSrc = hasError ? fallbackSrc || "" : optimizedSrc;

  // Generăm un placeholder blur
  useEffect(() => {
    if (showPlaceholder && src) {
      try {
        const placeholder = generateBlurPlaceholder(src, 10);
        setPlaceholderSrc(placeholder);
      } catch (error) {
        console.error("Error generating placeholder:", error);
      }
    }

    // Resetăm starea când se schimbă sursa
    setIsLoaded(false);
    setIsLoading(true);
    setHasError(false);
  }, [src, showPlaceholder]);

  // Gestionăm încărcarea imaginii
  const handleLoad = () => {
    setIsLoaded(true);
    setIsLoading(false);
  };

  // Gestionăm erorile de încărcare
  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  return (
    <div
      className={cn("relative overflow-hidden", containerClassName)}
      style={{ width, height }}
    >
      {/* Placeholder pentru încărcare */}
      {isLoading && showPlaceholder && (
        <div
          className={cn("absolute inset-0 animate-pulse", placeholderColor)}
          style={{
            backgroundImage: placeholderSrc
              ? `url(${placeholderSrc})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(8px)",
          }}
        />
      )}

      {/* Imaginea optimizată */}
      {finalSrc ? (
        <img
          src={finalSrc}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : loading}
          {...props}
        />
      ) : (
        // Placeholder pentru imagine lipsă
        <div
          className={cn(
            "w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600",
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

/**
 * Props pentru componenta BackgroundImage
 */
interface BackgroundImageProps {
  src: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png" | "avif";
  blur?: number;
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
  className?: string;
  children?: React.ReactNode;
  showPlaceholder?: boolean;
  placeholderColor?: string;
  fallbackSrc?: string;
}

/**
 * Componenta pentru imagini de fundal optimizate
 * Optimizează imaginile și afișează un placeholder în timpul încărcării
 */
export function BackgroundImage({
  src,
  width,
  height,
  quality = 80,
  format = "webp",
  blur,
  fit = "cover",
  className = "",
  children,
  showPlaceholder = true,
  placeholderColor = "bg-slate-200 dark:bg-slate-800",
  fallbackSrc,
}: BackgroundImageProps): React.ReactElement {
  // Starea pentru încărcare
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [placeholderSrc, setPlaceholderSrc] = useState<string | null>(null);

  // Optimizăm imaginea
  const optimizedSrc = src
    ? optimizeImage(src, {
        width,
        height,
        quality,
        format,
        blur,
        fit,
      })
    : "";

  // Determinăm sursa finală a imaginii
  const finalSrc = hasError ? fallbackSrc || "" : optimizedSrc;

  // Generăm un placeholder blur
  useEffect(() => {
    if (showPlaceholder && src) {
      try {
        const placeholder = generateBlurPlaceholder(src, 10);
        setPlaceholderSrc(placeholder);
      } catch (error) {
        console.error("Error generating placeholder:", error);
      }
    }

    // Resetăm starea când se schimbă sursa
    setIsLoaded(false);
    setHasError(false);
  }, [src, showPlaceholder]);

  // Preîncărcăm imaginea
  useEffect(() => {
    if (finalSrc) {
      const img = new Image();
      img.src = finalSrc;

      img.onload = () => {
        setIsLoaded(true);
      };

      img.onerror = () => {
        setHasError(true);
      };

      return () => {
        img.onload = null;
        img.onerror = null;
      };
    }
  }, [finalSrc]);

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        width,
        height,
        backgroundImage:
          isLoaded && !hasError && finalSrc
            ? `url(${finalSrc})`
            : placeholderSrc && showPlaceholder
            ? `url(${placeholderSrc})`
            : undefined,
        backgroundSize: fit,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        filter: isLoaded || !showPlaceholder ? "none" : "blur(8px)",
      }}
    >
      {/* Placeholder */}
      {showPlaceholder && !isLoaded && !hasError && !placeholderSrc && (
        <div
          className={cn("absolute inset-0 animate-pulse", placeholderColor)}
        />
      )}

      {/* Fallback pentru erori */}
      {hasError && !fallbackSrc && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600"
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

      {/* Conținut */}
      {children}
    </div>
  );
}

export default {
  OptimizedImage,
  BackgroundImage,
};
