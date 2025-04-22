import { enhancedSupabaseService, SupabaseResponse } from '../api/enhanced-supabase-service';
import { cacheService } from '../cache/cache-service';
import { ID, PaginationConfig, SortConfig } from '@/models';

/**
 * Opțiuni pentru interogări
 */
interface QueryOptions {
  filters?: Record<string, any>;
  sort?: SortConfig;
  pagination?: PaginationConfig;
  cacheTime?: number;
  forceRefresh?: boolean;
  namespace?: string;
}

/**
 * Serviciu generic pentru accesul la date
 * Oferă metode standardizate pentru operațiuni CRUD și interogări complexe
 */
export class DataService<T> {
  private tableName: string;
  private defaultCacheTime: number = 5 * 60 * 1000; // 5 minute
  
  /**
   * Constructor
   * @param tableName Numele tabelului
   */
  constructor(tableName: string) {
    this.tableName = tableName;
  }
  
  /**
   * Obține toate înregistrările
   * @param options Opțiuni pentru interogare
   * @returns Înregistrările sau eroarea
   */
  async getAll(options: QueryOptions = {}): Promise<SupabaseResponse<T[]>> {
    const cacheKey = `${this.tableName}_all_${JSON.stringify(options)}`;
    const cacheTime = options.cacheTime || this.defaultCacheTime;
    
    // Verificăm dacă datele sunt în cache
    if (!options.forceRefresh) {
      const cachedData = cacheService.get<SupabaseResponse<T[]>>(cacheKey, {
        namespace: options.namespace || 'data',
        ttl: cacheTime
      });
      
      if (cachedData) {
        return {
          ...cachedData,
          fromCache: true
        };
      }
    }
    
    // Construim opțiunile pentru interogare
    const queryOptions: any = {
      filters: options.filters || {},
    };
    
    // Adăugăm sortarea dacă există
    if (options.sort) {
      queryOptions.order = {
        column: options.sort.field,
        ascending: options.sort.direction === 'asc'
      };
    }
    
    // Executăm interogarea
    const response = await enhancedSupabaseService.select<T[]>(this.tableName, '*', queryOptions);
    
    // Salvăm datele în cache dacă interogarea a reușit
    if (response.status === 'success' && response.data) {
      cacheService.set(cacheKey, response, {
        namespace: options.namespace || 'data',
        ttl: cacheTime
      });
    }
    
    return response;
  }
  
  /**
   * Obține o înregistrare după ID
   * @param id ID-ul înregistrării
   * @param options Opțiuni pentru interogare
   * @returns Înregistrarea sau eroarea
   */
  async getById(id: ID, options: QueryOptions = {}): Promise<SupabaseResponse<T>> {
    const cacheKey = `${this.tableName}_${id}`;
    const cacheTime = options.cacheTime || this.defaultCacheTime;
    
    // Verificăm dacă datele sunt în cache
    if (!options.forceRefresh) {
      const cachedData = cacheService.get<SupabaseResponse<T>>(cacheKey, {
        namespace: options.namespace || 'data',
        ttl: cacheTime
      });
      
      if (cachedData) {
        return {
          ...cachedData,
          fromCache: true
        };
      }
    }
    
    // Executăm interogarea
    const response = await enhancedSupabaseService.select<T>(this.tableName, '*', {
      filters: { id },
      single: true
    });
    
    // Salvăm datele în cache dacă interogarea a reușit
    if (response.status === 'success' && response.data) {
      cacheService.set(cacheKey, response, {
        namespace: options.namespace || 'data',
        ttl: cacheTime
      });
    }
    
    return response;
  }
  
  /**
   * Obține înregistrări paginate
   * @param options Opțiuni pentru interogare
   * @returns Înregistrările paginate sau eroarea
   */
  async getPaginated(options: QueryOptions = {}): Promise<{
    data: T[] | null;
    total: number | null;
    page: number;
    pageSize: number;
    error: any | null;
    status: 'success' | 'error';
    fromCache?: boolean;
  }> {
    const pagination = options.pagination || { page: 1, limit: 10, total: 0 };
    const cacheKey = `${this.tableName}_paginated_${pagination.page}_${pagination.limit}_${JSON.stringify(options.filters || {})}_${JSON.stringify(options.sort || {})}`;
    const cacheTime = options.cacheTime || this.defaultCacheTime;
    
    // Verificăm dacă datele sunt în cache
    if (!options.forceRefresh) {
      const cachedData = cacheService.get<{
        data: T[] | null;
        total: number | null;
        page: number;
        pageSize: number;
        error: any | null;
        status: 'success' | 'error';
      }>(cacheKey, {
        namespace: options.namespace || 'data',
        ttl: cacheTime
      });
      
      if (cachedData) {
        return {
          ...cachedData,
          fromCache: true
        };
      }
    }
    
    // Construim opțiunile pentru interogare
    const queryOptions: any = {
      filters: options.filters || {},
    };
    
    // Adăugăm sortarea dacă există
    if (options.sort) {
      queryOptions.order = {
        column: options.sort.field,
        ascending: options.sort.direction === 'asc'
      };
    }
    
    // Executăm interogarea
    const response = await enhancedSupabaseService.paginate<T>(
      this.tableName,
      '*',
      pagination.page,
      pagination.limit,
      queryOptions
    );
    
    // Salvăm datele în cache dacă interogarea a reușit
    if (response.status === 'success' && response.data) {
      cacheService.set(cacheKey, response, {
        namespace: options.namespace || 'data',
        ttl: cacheTime
      });
    }
    
    return response;
  }
  
  /**
   * Creează o nouă înregistrare
   * @param data Datele pentru noua înregistrare
   * @returns Înregistrarea creată sau eroarea
   */
  async create(data: Partial<T>): Promise<SupabaseResponse<T>> {
    const response = await enhancedSupabaseService.insert<T>(this.tableName, data);
    
    // Invalidăm cache-ul pentru acest tabel
    this.invalidateCache();
    
    return response;
  }
  
  /**
   * Actualizează o înregistrare
   * @param id ID-ul înregistrării
   * @param data Datele pentru actualizare
   * @returns Înregistrarea actualizată sau eroarea
   */
  async update(id: ID, data: Partial<T>): Promise<SupabaseResponse<T>> {
    const response = await enhancedSupabaseService.update<T>(this.tableName, data, { id });
    
    // Invalidăm cache-ul pentru această înregistrare și pentru tabel
    this.invalidateCache(id);
    
    return response;
  }
  
  /**
   * Șterge o înregistrare
   * @param id ID-ul înregistrării
   * @returns Înregistrarea ștearsă sau eroarea
   */
  async delete(id: ID): Promise<SupabaseResponse<T>> {
    const response = await enhancedSupabaseService.delete<T>(this.tableName, { id });
    
    // Invalidăm cache-ul pentru această înregistrare și pentru tabel
    this.invalidateCache(id);
    
    return response;
  }
  
  /**
   * Invalidează cache-ul pentru acest tabel sau pentru o înregistrare specifică
   * @param id ID-ul înregistrării (opțional)
   */
  invalidateCache(id?: ID): void {
    if (id) {
      // Invalidăm cache-ul pentru această înregistrare
      cacheService.delete(`${this.tableName}_${id}`, { namespace: 'data' });
    }
    
    // Invalidăm toate cache-urile pentru acest tabel
    cacheService.clearNamespace(`data:${this.tableName}`);
  }
  
  /**
   * Se abonează la schimbări în timp real pentru acest tabel
   * @param callback Funcția de callback apelată când se primesc date noi
   * @param filters Filtrele pentru a selecta înregistrările de urmărit
   * @returns Obiectul de abonament care poate fi folosit pentru dezabonare
   */
  subscribe(
    callback: (payload: {
      new: T | null;
      old: T | null;
      eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    }) => void,
    filters?: Record<string, any>
  ) {
    return enhancedSupabaseService.subscribe<T>(this.tableName, '*', callback, filters);
  }
  
  /**
   * Se dezabonează de la schimbări în timp real
   * @param subscription Obiectul de abonament returnat de subscribe
   */
  unsubscribe(subscription: any): void {
    enhancedSupabaseService.unsubscribe(subscription);
  }
}

export default DataService;
