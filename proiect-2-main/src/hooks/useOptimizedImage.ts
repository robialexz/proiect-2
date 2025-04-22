import { useState, useEffect } from 'react';
import { imageOptimizer, ImageSize } from '@/lib/image-optimizer';

/**
 * Hook pentru optimizarea și încărcarea imaginilor
 * @param src URL-ul imaginii
 * @param size Dimensiunea dorită
 * @param quality Calitatea imaginii (0-100)
 */
export function useOptimizedImage(
  src: string,
  size: ImageSize = ImageSize.MEDIUM,
  quality: number = 80
) {
  const [optimizedSrc, setOptimizedSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!src) {
      setOptimizedSrc('');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Optimizăm URL-ul imaginii
      const optimized = imageOptimizer.optimizeImageUrl(src, size, quality);
      setOptimizedSrc(optimized);

      // Preîncărcăm imaginea pentru a o avea în cache
      imageOptimizer.preloadImage(optimized)
        .then(() => {
          setIsLoading(false);
        })
        .catch((err) => {
          // Removed console statement
          setError(err);
          setIsLoading(false);
        });
    } catch (err) {
      // Removed console statement
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setOptimizedSrc(src); // Folosim sursa originală în caz de eroare
      setIsLoading(false);
    }
  }, [src, size, quality]);

  return { src: optimizedSrc, isLoading, error };
}

export default useOptimizedImage;
