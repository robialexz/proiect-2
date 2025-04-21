/**
 * Tipuri pentru cache
 */
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Opțiuni pentru cache
 */
interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  namespace?: string; // Namespace for grouping related cache items
}

/**
 * Serviciu pentru gestionarea cache-ului
 * Oferă metode pentru stocarea și recuperarea datelor din cache
 */
class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minute default TTL
  private maxSize: number = 1000; // Numărul maxim de intrări în cache
  private cleanupInterval: number = 60 * 1000; // Intervalul de curățare a cache-ului (1 minut)
  private cleanupTimer: number | null = null;
  
  constructor() {
    // Inițiem curățarea periodică a cache-ului
    this.startCleanupTimer();
  }
  
  /**
   * Setează un item în cache
   * @param key Cheia pentru item
   * @param data Datele de stocat
   * @param options Opțiuni pentru cache
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || this.defaultTTL;
    const namespace = options.namespace ? `${options.namespace}:` : '';
    const fullKey = `${namespace}${key}`;
    const now = Date.now();
    
    // Verificăm dacă am atins limita de dimensiune
    if (this.cache.size >= this.maxSize && !this.cache.has(fullKey)) {
      this.evictOldest();
    }
    
    this.cache.set(fullKey, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }
  
  /**
   * Obține un item din cache
   * @param key Cheia pentru item
   * @param options Opțiuni pentru cache
   * @returns Datele sau null dacă nu există sau au expirat
   */
  get<T>(key: string, options: CacheOptions = {}): T | null {
    const namespace = options.namespace ? `${options.namespace}:` : '';
    const fullKey = `${namespace}${key}`;
    const item = this.cache.get(fullKey);
    
    if (!item) {
      return null;
    }
    
    const now = Date.now();
    
    // Verificăm dacă item-ul a expirat
    if (now > item.expiresAt) {
      this.cache.delete(fullKey);
      return null;
    }
    
    return item.data as T;
  }
  
  /**
   * Verifică dacă un item există în cache
   * @param key Cheia pentru item
   * @param options Opțiuni pentru cache
   * @returns True dacă item-ul există și nu a expirat, false în caz contrar
   */
  has(key: string, options: CacheOptions = {}): boolean {
    const namespace = options.namespace ? `${options.namespace}:` : '';
    const fullKey = `${namespace}${key}`;
    const item = this.cache.get(fullKey);
    
    if (!item) {
      return false;
    }
    
    const now = Date.now();
    
    // Verificăm dacă item-ul a expirat
    if (now > item.expiresAt) {
      this.cache.delete(fullKey);
      return false;
    }
    
    return true;
  }
  
  /**
   * Șterge un item din cache
   * @param key Cheia pentru item
   * @param options Opțiuni pentru cache
   */
  delete(key: string, options: CacheOptions = {}): void {
    const namespace = options.namespace ? `${options.namespace}:` : '';
    const fullKey = `${namespace}${key}`;
    this.cache.delete(fullKey);
  }
  
  /**
   * Șterge toate item-urile dintr-un namespace
   * @param namespace Namespace-ul de șters
   */
  clearNamespace(namespace: string): void {
    const prefix = `${namespace}:`;
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Șterge toate item-urile expirate
   */
  clearExpired(): void {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Șterge tot cache-ul
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Obține dimensiunea cache-ului
   * @returns Numărul de intrări în cache
   */
  size(): number {
    return this.cache.size;
  }
  
  /**
   * Setează TTL-ul implicit
   * @param ttl TTL-ul implicit în milisecunde
   */
  setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl;
  }
  
  /**
   * Setează dimensiunea maximă a cache-ului
   * @param size Dimensiunea maximă
   */
  setMaxSize(size: number): void {
    this.maxSize = size;
  }
  
  /**
   * Setează intervalul de curățare a cache-ului
   * @param interval Intervalul în milisecunde
   */
  setCleanupInterval(interval: number): void {
    this.cleanupInterval = interval;
    this.restartCleanupTimer();
  }
  
  /**
   * Funcție pentru a obține un item din cache sau a-l încărca dacă nu există
   * @param key Cheia pentru item
   * @param loader Funcția de încărcare a datelor
   * @param options Opțiuni pentru cache
   * @returns Datele din cache sau încărcate
   */
  async getOrSet<T>(
    key: string, 
    loader: () => Promise<T>, 
    options: CacheOptions = {}
  ): Promise<T> {
    const cachedItem = this.get<T>(key, options);
    
    if (cachedItem !== null) {
      return cachedItem;
    }
    
    try {
    const data = await loader();
    } catch (error) {
      // Handle error appropriately
    }
    this.set(key, data, options);
    return data;
  }
  
  /**
   * Elimină cea mai veche intrare din cache
   * @private
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
  
  /**
   * Pornește timer-ul de curățare a cache-ului
   * @private
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer === null) {
      this.cleanupTimer = window.setInterval(() => {
        this.clearExpired();
      }, this.cleanupInterval);
    }
  }
  
  /**
   * Oprește timer-ul de curățare a cache-ului
   * @private
   */
  private stopCleanupTimer(): void {
    if (this.cleanupTimer !== null) {
      window.clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
  
  /**
   * Repornește timer-ul de curățare a cache-ului
   * @private
   */
  private restartCleanupTimer(): void {
    this.stopCleanupTimer();
    this.startCleanupTimer();
  }
}

// Exportă o instanță singleton a serviciului de cache
export const cacheService = new CacheService();

export default cacheService;
