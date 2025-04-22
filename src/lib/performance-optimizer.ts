/**
 * Utilitar pentru optimizarea performanței aplicației
 * Acest fișier conține funcții și utilități pentru îmbunătățirea performanței
 */

import { cacheService } from "./cache-service";

// Namespace pentru cache-ul de performanță
const PERFORMANCE_CACHE_NAMESPACE = "performance";

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
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value as T;

    descriptor.value = async function (...args: Parameters<T>) {
      // Generăm o cheie unică bazată pe numele funcției și argumentele sale
      const cacheKey = `${keyPrefix}_${propertyKey}_${JSON.stringify(args)}`;

      // Verificăm dacă rezultatul este în cache
      const cachedResult = cacheService.get<ReturnType<T>>(cacheKey, {
        namespace: PERFORMANCE_CACHE_NAMESPACE,
      });

      if (cachedResult) {
        // Removed console statement
        return cachedResult;
      }

      // Dacă nu este în cache, apelăm metoda originală
      try {
      const result = await originalMethod.apply(this, args);
      } catch (error) {
        // Handle error appropriately
      }

      // Salvăm rezultatul în cache
      cacheService.set(cacheKey, result, {
        namespace: PERFORMANCE_CACHE_NAMESPACE,
        expireIn,
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
      namespace: PERFORMANCE_CACHE_NAMESPACE,
    });

    if (cachedData) {
      // Removed console statement
      return;
    }

    // Încărcăm datele
    // Removed console statement
    try {
    const data = await fetcher(...args);
    } catch (error) {
      // Handle error appropriately
    }

    // Salvăm datele în cache
    cacheService.set(cacheKey, data, {
      namespace: PERFORMANCE_CACHE_NAMESPACE,
      expireIn,
    });

    // Removed console statement
  } catch (error) {
    // Removed console statement
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

  return function (...args: Parameters<T>): void {
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

  return function (...args: Parameters<T>): void {
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
 * Tipuri pentru măsurătorile de performanță
 */
interface PerformanceMeasurement {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  type: "component" | "api" | "render" | "navigation" | "resource" | "custom";
  metadata?: Record<string, any>;
}

// Stocăm măsurătorile de performanță
const performanceMeasurements: PerformanceMeasurement[] = [];

// Limita de măsurători stocate
const MAX_MEASUREMENTS = 100;

/**
 * Funcție pentru măsurarea performanței
 * @param label Eticheta pentru măsurătoare
 */
export function measurePerformance<T>(
  id: string,
  fn: () => T,
  type: PerformanceMeasurement["type"] = "custom",
  metadata?: Record<string, any>
): T {
  // Verificăm dacă avem suport pentru Performance API
  if (typeof performance === "undefined") {
    return fn();
  }

  // Începem măsurătoarea
  const startTime = performance.now();
  // Removed console statement

  try {
    // Executăm funcția
    const result = fn();

    // Finalizăm măsurătoarea
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Removed console statement

    // Stocăm măsurătoarea
    addMeasurement({
      id,
      startTime,
      endTime,
      duration,
      type,
      metadata,
    });

    // Returnăm rezultatul
    return result;
  } catch (error) {
    // Finalizăm măsurătoarea chiar și în caz de eroare
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Removed console statement

    // Stocăm măsurătoarea cu informații despre eroare
    addMeasurement({
      id,
      startTime,
      endTime,
      duration,
      type,
      metadata: {
        ...metadata,
        error: error instanceof Error ? error.message : "Unknown error",
        hasError: true,
      },
    });

    // Propagăm eroarea
    throw error;
  }
}

/**
 * Adaugă o măsurătoare în lista de măsurători
 * @param measurement Măsurătoarea de adăugat
 */
function addMeasurement(measurement: PerformanceMeasurement): void {
  // Adăugăm măsurătoarea
  performanceMeasurements.push(measurement);

  // Limităm numărul de măsurători stocate
  if (performanceMeasurements.length > MAX_MEASUREMENTS) {
    performanceMeasurements.shift();
  }
}

/**
 * Obține toate măsurătorile de performanță
 * @returns Lista de măsurători
 */
export function getMeasurements(): PerformanceMeasurement[] {
  return [...performanceMeasurements];
}

/**
 * Obține măsurătorile de performanță pentru un anumit tip
 * @param type Tipul măsurătorilor
 * @returns Lista de măsurători pentru tipul specificat
 */
export function getMeasurementsByType(
  type: PerformanceMeasurement["type"]
): PerformanceMeasurement[] {
  return performanceMeasurements.filter((m) => m.type === type);
}

/**
 * Măsoară timpul de execuție al unei funcții asincrone
 * @param id Identificatorul măsurătorii
 * @param fn Funcția asincronă de măsurat
 * @param type Tipul măsurătorii
 * @param metadata Metadate adiționale
 * @returns Promisiune cu rezultatul funcției
 */
export async function measureAsyncPerformance<T>(
  id: string,
  fn: () => Promise<T>,
  type: PerformanceMeasurement["type"] = "api",
  metadata?: Record<string, any>
): Promise<T> {
  // Verificăm dacă avem suport pentru Performance API
  if (typeof performance === "undefined") {
    return fn();
  }

  // Începem măsurătoarea
  const startTime = performance.now();
  // Removed console statement

  try {
    // Executăm funcția asincronă
    const result = await fn();

    // Finalizăm măsurătoarea
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Removed console statement

    // Stocăm măsurătoarea
    addMeasurement({
      id,
      startTime,
      endTime,
      duration,
      type,
      metadata,
    });

    // Returnăm rezultatul
    return result;
  } catch (error) {
    // Finalizăm măsurătoarea chiar și în caz de eroare
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Removed console statement

    // Stocăm măsurătoarea cu informații despre eroare
    addMeasurement({
      id,
      startTime,
      endTime,
      duration,
      type,
      metadata: {
        ...metadata,
        error: error instanceof Error ? error.message : "Unknown error",
        hasError: true,
      },
    });

    // Propagăm eroarea
    throw error;
  }
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
    if (url.hostname.includes("cloudinary.com")) {
      // Optimizare pentru Cloudinary
      return src.replace(
        "/upload/",
        `/upload/q_${quality},w_${width || "auto"},h_${height || "auto"}/`
      );
    } else if (url.hostname.includes("imgix.net")) {
      // Optimizare pentru Imgix
      url.searchParams.append("q", quality.toString());
      if (width) url.searchParams.append("w", width.toString());
      if (height) url.searchParams.append("h", height.toString());
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
  srcs.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

/**
 * Măsoară timpul de încărcare al unei pagini
 * @param route Ruta paginii
 * @returns Funcție pentru finalizarea măsurătorii
 */
export function measurePageLoad(route: string): () => void {
  // Verificăm dacă avem suport pentru Performance API
  if (typeof performance === "undefined") {
    return () => {};
  }

  // Începem măsurătoarea
  const startTime = performance.now();

  // Returnăm funcția pentru finalizarea măsurătorii
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Removed console statement

    // Stocăm măsurătoarea
    addMeasurement({
      id: `page-load-${route}`,
      startTime,
      endTime,
      duration,
      type: "navigation",
      metadata: { route },
    });
  };
}

/**
 * Măsoară performanța API-urilor
 * @param apiName Numele API-ului
 * @param endpoint Endpoint-ul API-ului
 * @returns Funcție pentru măsurarea performanței API-ului
 */
export function measureApiCall<T>(
  apiName: string,
  endpoint: string
): (fn: () => Promise<T>) => Promise<T> {
  return (fn: () => Promise<T>) => {
    return measureAsyncPerformance(
      `api-call-${apiName}-${endpoint}`,
      fn,
      "api",
      { apiName, endpoint }
    );
  };
}

/**
 * Măsoară performanța resurselor
 */
export function measureResourcePerformance(): void {
  // Verificăm dacă avem suport pentru Performance API
  if (
    typeof performance === "undefined" ||
    typeof performance.getEntriesByType !== "function"
  ) {
    return;
  }

  // Obținem toate resursele încărcate
  const resources = performance.getEntriesByType("resource");

  // Măsurăm performanța fiecărei resurse
  resources.forEach((resource) => {
    // Ignorăm resursele deja măsurate
    const resourceName = resource.name.split("/").pop() || resource.name;
    const existingMeasurement = performanceMeasurements.find(
      (m) =>
        m.id === `resource-${resourceName}` &&
        m.startTime === resource.startTime
    );

    if (existingMeasurement) return;

    // Stocăm măsurătoarea
    addMeasurement({
      id: `resource-${resourceName}`,
      startTime: resource.startTime,
      endTime: resource.startTime + resource.duration,
      duration: resource.duration,
      type: "resource",
      metadata: {
        resourceName,
        resourceType: resource.initiatorType,
        resourceSize: (resource as any).transferSize || 0,
        resourceUrl: resource.name,
      },
    });
  });
}

// Exportăm toate funcțiile într-un singur obiect
export const performanceOptimizer = {
  memoize,
  preloadData,
  debounce,
  throttle,
  measurePerformance,
  measureAsyncPerformance,
  getMeasurements,
  getMeasurementsByType,
  paginateItems,
  optimizeImageUrl,
  preloadImages,
  measurePageLoad,
  measureApiCall,
  measureResourcePerformance,
};
