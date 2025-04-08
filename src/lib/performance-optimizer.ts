/**
 * Utilitar pentru optimizarea performanței aplicației
 * Acest fișier conține funcții și utilități pentru îmbunătățirea performanței
 */

import { cacheService } from './cache-service';

// Namespace pentru cache-ul de performanță
const PERFORMANCE_CACHE_NAMESPACE = 'performance';

// Durata implicită de expirare a cache-ului (30 minute)
const DEFAULT_CACHE_EXPIRY = 30 * 60 * 1000;

/**
 * Decorator pentru memorarea rezultatelor funcțiilor
 * @param keyPrefix Prefixul pentru cheia de cache
 * @param expireIn Durata de expirare în milisecunde
 */
export function memoize<T extends (...args: any[]) => Promise<any>>(
  keyPrefix: string,
  expireIn: number = DEFAULT_CACHE_EXPIRY
) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value as T;

    descriptor.value = async function(...args: Parameters<T>) {
      // Generăm o cheie unică bazată pe numele funcției și argumentele sale
      const cacheKey = `${keyPrefix}_${propertyKey}_${JSON.stringify(args)}`;
      
      // Verificăm dacă rezultatul este în cache
      const cachedResult = cacheService.get<ReturnType<T>>(cacheKey, {
        namespace: PERFORMANCE_CACHE_NAMESPACE
      });
      
      if (cachedResult) {
        console.log(`[Performance] Using cached result for ${propertyKey}`);
        return cachedResult;
      }
      
      // Dacă nu este în cache, apelăm metoda originală
      const result = await originalMethod.apply(this, args);
      
      // Salvăm rezultatul în cache
      cacheService.set(cacheKey, result, {
        namespace: PERFORMANCE_CACHE_NAMESPACE,
        expireIn
      });
      
      return result;
    };
    
    return descriptor;
  };
}

/**
 * Funcție pentru preîncărcarea datelor
 * @param fetcher Funcția care încarcă datele
 * @param args Argumentele pentru funcția de încărcare
 * @param cacheKey Cheia pentru cache
 * @param expireIn Durata de expirare în milisecunde
 */
export async function preloadData<T>(
  fetcher: (...args: any[]) => Promise<T>,
  args: any[],
  cacheKey: string,
  expireIn: number = DEFAULT_CACHE_EXPIRY
): Promise<void> {
  try {
    // Verificăm dacă datele sunt deja în cache
    const cachedData = cacheService.get<T>(cacheKey, {
      namespace: PERFORMANCE_CACHE_NAMESPACE
    });
    
    if (cachedData) {
      console.log(`[Performance] Data already preloaded for ${cacheKey}`);
      return;
    }
    
    // Încărcăm datele
    console.log(`[Performance] Preloading data for ${cacheKey}`);
    const data = await fetcher(...args);
    
    // Salvăm datele în cache
    cacheService.set(cacheKey, data, {
      namespace: PERFORMANCE_CACHE_NAMESPACE,
      expireIn
    });
    
    console.log(`[Performance] Data preloaded for ${cacheKey}`);
  } catch (error) {
    console.error(`[Performance] Error preloading data for ${cacheKey}:`, error);
  }
}

/**
 * Funcție pentru debounce
 * @param func Funcția de apelat
 * @param wait Timpul de așteptare în milisecunde
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>): void {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Funcție pentru throttle
 * @param func Funcția de apelat
 * @param limit Limita de timp în milisecunde
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function(...args: Parameters<T>): void {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Funcție pentru măsurarea performanței
 * @param label Eticheta pentru măsurătoare
 */
export function measurePerformance(label: string): () => void {
  const start = performance.now();
  console.log(`[Performance] Starting measurement: ${label}`);
  
  return () => {
    const end = performance.now();
    const duration = end - start;
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  };
}

/**
 * Funcție pentru optimizarea listelor lungi
 * @param items Lista de elemente
 * @param pageSize Dimensiunea paginii
 * @param currentPage Pagina curentă
 */
export function paginateItems<T>(
  items: T[],
  pageSize: number = 10,
  currentPage: number = 1
): T[] {
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return items.slice(startIndex, endIndex);
}

/**
 * Funcție pentru optimizarea imaginilor
 * @param src Sursa imaginii
 * @param width Lățimea dorită
 * @param height Înălțimea dorită
 * @param quality Calitatea imaginii (0-100)
 */
export function optimizeImageUrl(
  src: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  // Verificăm dacă sursa este un URL valid
  try {
    const url = new URL(src);
    
    // Verificăm dacă imaginea este servită de un CDN care suportă parametri de optimizare
    if (url.hostname.includes('cloudinary.com')) {
      // Optimizare pentru Cloudinary
      return src
        .replace('/upload/', `/upload/q_${quality},w_${width || 'auto'},h_${height || 'auto'}/`);
    } else if (url.hostname.includes('imgix.net')) {
      // Optimizare pentru Imgix
      url.searchParams.append('q', quality.toString());
      if (width) url.searchParams.append('w', width.toString());
      if (height) url.searchParams.append('h', height.toString());
      return url.toString();
    }
    
    // Dacă nu este un CDN cunoscut, returnăm sursa originală
    return src;
  } catch (error) {
    // Dacă nu este un URL valid, returnăm sursa originală
    return src;
  }
}

/**
 * Funcție pentru preîncărcarea imaginilor
 * @param srcs Lista de surse de imagini
 */
export function preloadImages(srcs: string[]): void {
  srcs.forEach(src => {
    const img = new Image();
    img.src = src;
  });
}

// Exportăm toate funcțiile într-un singur obiect
export const performanceOptimizer = {
  memoize,
  preloadData,
  debounce,
  throttle,
  measurePerformance,
  paginateItems,
  optimizeImageUrl,
  preloadImages
};
