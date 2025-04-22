// Tipuri pentru cache
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  namespace?: string; // Namespace for grouping related cache items
}

// Clasa pentru gestionarea cache-ului
class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minute default TTL
  private maxCacheSize: number = 100; // Dimensiunea maximă a cache-ului
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minute

  // Setează un item în cache
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || this.defaultTTL;
    const namespace = options.namespace ? `${options.namespace}:` : "";
    const fullKey = `${namespace}${key}`;
    const now = Date.now();

    this.cache.set(fullKey, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }

  // Obține un item din cache
  get<T>(key: string, options: CacheOptions = {}): T | null {
    const namespace = options.namespace ? `${options.namespace}:` : "";
    const fullKey = `${namespace}${key}`;
    const item = this.cache.get(fullKey);

    if (!item) {
      return null;
    }

    // Verifică dacă item-ul a expirat
    if (Date.now() > item.expiresAt) {
      this.cache.delete(fullKey);
      return null;
    }

    return item.data as T;
  }

  // Verifică dacă un item există în cache și nu a expirat
  has(key: string, options: CacheOptions = {}): boolean {
    const namespace = options.namespace ? `${options.namespace}:` : "";
    const fullKey = `${namespace}${key}`;
    const item = this.cache.get(fullKey);

    if (!item) {
      return false;
    }

    // Verifică dacă item-ul a expirat
    if (Date.now() > item.expiresAt) {
      this.cache.delete(fullKey);
      return false;
    }

    return true;
  }

  // Șterge un item din cache
  delete(key: string, options: CacheOptions = {}): boolean {
    const namespace = options.namespace ? `${options.namespace}:` : "";
    const fullKey = `${namespace}${key}`;
    return this.cache.delete(fullKey);
  }

  // Șterge toate item-urile dintr-un namespace
  clearNamespace(namespace: string): void {
    const prefix = `${namespace}:`;

    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  // Șterge toate item-urile expirate
  clearExpired(): void {
    const now = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Șterge tot cache-ul
  clear(): void {
    this.cache.clear();
  }

  // Obține dimensiunea cache-ului
  size(): number {
    return this.cache.size;
  }

  // Setează TTL-ul implicit
  setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl;
  }

  // Funcție pentru a obține un item din cache sau a-l încărca dacă nu există
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

  // Inițializează curățarea automată a cache-ului
  initCleanup(): void {
    // Oprim orice interval existent
    this.stopCleanup();

    // Pornim un nou interval
    this.cleanupInterval = setInterval(() => {
      this.clearExpired();

      // Dacă cache-ul este prea mare, ștergem cele mai vechi elemente
      if (this.cache.size > this.maxCacheSize) {
        this.trimCache();
      }
    }, this.CLEANUP_INTERVAL);
  }

  // Oprește curățarea automată
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  // Șterge cele mai vechi elemente din cache pentru a reduce dimensiunea
  private trimCache(): void {
    // Transformăm cache-ul într-un array pentru a-l putea sorta
    const items = Array.from(this.cache.entries());

    // Sortăm după timestamp (cele mai vechi primele)
    items.sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Calculăm câte elemente trebuie șterse
    const itemsToRemove = items.length - this.maxCacheSize;

    if (itemsToRemove > 0) {
      // Ștergem cele mai vechi elemente
      for (let i = 0; i < itemsToRemove; i++) {
        this.cache.delete(items[i][0]);
      }
    }
  }

  // Constructor care inițializează curățarea automată
  constructor() {
    this.initCleanup();
  }
}

// Exportă o instanță singleton a serviciului de cache
export const cacheService = new CacheService();

export default cacheService;
