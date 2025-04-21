import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";
import {
  optimizeImage,
  generateBlurPlaceholder,
  preloadImage,
  isImageCached,
} from "@/lib/image-optimization";
import { measurePerformance } from "@/lib/performance-optimizer";

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
  const imgRef = useRef<HTMLImageElement>(null);

  // Verificăm dacă imaginea este deja în cache
  useEffect(() => {
    if (src) {
      // Verificăm cache-ul pentru a evita flicker-ul
      isImageCached(optimizedSrc).then((cached) => {
        if (cached) {
          // Dacă imaginea este în cache, o marcăm ca încărcată imediat
          setIsLoaded(true);
          setIsLoading(false);
        }
      });

      // Preîncărcăm imaginea pentru pagini frecvent accesate
      if (priority) {
        preloadImage(optimizedSrc);
      }
    }
  }, [src, optimizedSrc, priority]);

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
        // Removed console statement
      }
    }

    // Resetăm starea când se schimbă sursa
    setIsLoaded(false);
    setIsLoading(true);
    setHasError(false);
  }, [src, showPlaceholder]);

  // Gestionăm încărcarea imaginii
  const handleLoad = () => {
    // Măsurăm performanța încărcării imaginii
    measurePerformance(`image-load-${src.substring(0, 20)}`, () => {
      setIsLoaded(true);
      setIsLoading(false);
    });
  };

  // Gestionăm erorile de încărcare
  const handleError = () => {
    // Removed console statement
    setHasError(true);
    setIsLoading(false);
  };

  // Folosim Intersection Observer pentru lazy loading avansat
  useEffect(() => {
    if (!imgRef.current || loading === "eager" || priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            // Preîncărcăm imaginea când este aproape de viewport
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute("data-src");
            }
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: "200px 0px" } // Preîncărcăm imaginile când sunt la 200px de viewport
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [loading, priority, finalSrc]);

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
          ref={imgRef}
          src={priority || loading === "eager" ? finalSrc : undefined}
          data-src={!priority && loading !== "eager" ? finalSrc : undefined}
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
          decoding={priority ? "sync" : "async"} // Optimizăm decodarea imaginii
          fetchPriority={priority ? "high" : "auto"} // Optimizăm prioritatea de încărcare
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
            xmlns="{process.env.WWW_W3_ORG_2000_SVG}"
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
        // Removed console statement
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
            xmlns="{process.env.WWW_W3_ORG_2000_SVG}"
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
