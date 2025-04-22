import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  aspectRatio?: "auto" | "square" | "video" | "portrait" | "landscape";
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallbackSrc,
  loadingComponent,
  errorComponent,
  aspectRatio = "auto",
  objectFit = "cover",
  threshold = 0.1,
  rootMargin = "0px",
  className,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Mapăm aspectRatio la clase CSS
  const aspectRatioClasses = {
    auto: "",
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
  };

  // Mapăm objectFit la clase CSS
  const objectFitClasses = {
    contain: "object-contain",
    cover: "object-cover",
    fill: "object-fill",
    none: "object-none",
    "scale-down": "object-scale-down",
  };

  // Configurăm Intersection Observer pentru a încărca imaginea doar când este vizibilă
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [threshold, rootMargin]);

  // Gestionăm încărcarea imaginii
  const handleLoad = () => {
    setIsLoaded(true);
    setIsError(false);
    onLoad?.();
  };

  // Gestionăm erorile de încărcare
  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  // Construim clasa pentru container
  const containerClass = cn(
    "relative overflow-hidden",
    aspectRatioClasses[aspectRatio],
    className
  );

  // Construim clasa pentru imagine
  const imageClass = cn(
    "w-full h-full transition-opacity duration-300",
    objectFitClasses[objectFit],
    isLoaded ? "opacity-100" : "opacity-0"
  );

  return (
    <div className={containerClass}>
      {/* Componenta de încărcare */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 flex items-center justify-center">
          {loadingComponent || (
            <Skeleton className="w-full h-full" />
          )}
        </div>
      )}

      {/* Componenta de eroare */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center">
          {errorComponent || (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-500">
                Failed to load image
              </p>
            </div>
          )}
        </div>
      )}

      {/* Imaginea */}
      <img
        ref={imgRef}
        src={isInView ? (isError && fallbackSrc ? fallbackSrc : src) : ""}
        alt={alt}
        className={imageClass}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        {...props}
      />
    </div>
  );
};
