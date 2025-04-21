/**
 * Client pentru API
 * Acest fișier conține funcționalitatea pentru interacțiunea cu API-ul
 */

import { supabase } from '@/lib/supabase';
import { apiLogger } from '@/lib/logging';
import { createError, ErrorSource, ErrorType, ErrorSeverity } from '@/lib/error-handling';

// Interfața pentru opțiunile de request
export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  timeout?: number;
  retry?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheTime?: number;
  signal?: AbortSignal;
}

// Interfața pentru răspunsul API-ului
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  status: number;
  headers: Headers;
}

// Cache-ul pentru răspunsuri
const responseCache = new Map<string, { data: any; timestamp: number }>();

/**
 * Generează o cheie pentru cache
 * @param url URL-ul request-ului
 * @param options Opțiunile request-ului
 * @returns Cheia pentru cache
 */
function generateCacheKey(url: string, options: RequestInit): string {
  return `${options.method || 'GET'}-${url}-${JSON.stringify(options.body || {})}`;
}

/**
 * Verifică dacă un răspuns din cache este valid
 * @param cacheEntry Intrarea din cache
 * @param cacheTime Timpul de cache
 * @returns true dacă răspunsul din cache este valid
 */
function isCacheValid(cacheEntry: { data: any; timestamp: number }, cacheTime: number): boolean {
  return Date.now() - cacheEntry.timestamp < cacheTime;
}

/**
 * Execută un request către API
 * @param url URL-ul request-ului
 * @param options Opțiunile request-ului
 * @returns Răspunsul API-ului
 */
export async function apiRequest<T>(
  url: string,
  options: RequestInit & RequestOptions = {}
): Promise<ApiResponse<T>> {
  // Opțiunile implicite
  const {
    headers = {},
    params = {},
    timeout = 30000,
    retry = 0,
    retryDelay = 1000,
    cache = false,
    cacheTime = 60000,
    signal,
    ...fetchOptions
  } = options;
  
  // Adăugăm parametrii la URL
  const urlWithParams = new URL(url, window.location.origin);
  
  Object.entries(params).forEach(([key, value]) => {
    urlWithParams.searchParams.append(key, value);
  });
  
  // Generăm cheia pentru cache
  const cacheKey = cache ? generateCacheKey(urlWithParams.toString(), fetchOptions) : '';
  
  // Verificăm dacă avem un răspuns în cache
  if (cache && responseCache.has(cacheKey)) {
    const cacheEntry = responseCache.get(cacheKey)!;
    
    if (isCacheValid(cacheEntry, cacheTime)) {
      apiLogger.debug(`Using cached response for ${urlWithParams.toString()}`);
      
      return {
        data: cacheEntry.data,
        error: null,
        status: 200,
        headers: new Headers(),
      };
    } else {
      // Ștergem răspunsul expirat din cache
      responseCache.delete(cacheKey);
    }
  }
  
  // Creăm controller-ul pentru timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  // Combinăm signal-ul din opțiuni cu cel pentru timeout
  const combinedSignal = signal
    ? new AbortController().signal
    : controller.signal;
  
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }
  
  // Adăugăm token-ul de autentificare
  try {
  const { data: { session } } = await supabase.auth.getSession();
  } catch (error) {
    // Handle error appropriately
  }
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  // Logăm request-ul
  apiLogger.debug(`Sending ${fetchOptions.method || 'GET'} request to ${urlWithParams.toString()}`);
  
  try {
    // Executăm request-ul
    const response = await fetch(urlWithParams.toString(), {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: combinedSignal,
    });
    
    // Anulăm timeout-ul
    clearTimeout(timeoutId);
    
    // Verificăm dacă request-ul a fost anulat
    if (combinedSignal.aborted) {
      throw new Error('Request aborted');
    }
    
    // Parsăm răspunsul
    let data: T | null = null;
    let error: Error | null = null;
    
    if (response.ok) {
      try {
        // Verificăm dacă răspunsul este JSON
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          try {
          data = await response.text() as unknown as T;
          } catch (error) {
            // Handle error appropriately
          }
        }
        
        // Adăugăm răspunsul în cache
        if (cache) {
          responseCache.set(cacheKey, {
            data,
            timestamp: Date.now(),
          });
        }
      } catch (e) {
        error = createError('Failed to parse response', {
          source: ErrorSource.CLIENT,
          type: ErrorType.CLIENT_ERROR,
          severity: ErrorSeverity.ERROR,
          originalError: e,
        });
      }
    } else {
      // Încercăm să parsăm eroarea
      try {
        const errorData = await response.json();
        
        error = createError(errorData.message || 'Request failed', {
          source: ErrorSource.SERVER,
          type: ErrorType.SERVER_ERROR,
          severity: ErrorSeverity.ERROR,
          code: errorData.code,
          context: errorData,
        });
      } catch (e) {
        error = createError(`Request failed with status ${response.status}`, {
          source: ErrorSource.SERVER,
          type: ErrorType.SERVER_ERROR,
          severity: ErrorSeverity.ERROR,
          code: response.status.toString(),
        });
      }
      
      // Verificăm dacă trebuie să reîncercăm request-ul
      if (retry > 0 && response.status >= 500) {
        apiLogger.warn(`Retrying request to ${urlWithParams.toString()} (${retry} attempts left)`);
        
        // Așteptăm înainte de a reîncerca
        try {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        } catch (error) {
          // Handle error appropriately
        }
        
        // Reîncercăm request-ul
        return apiRequest<T>(url, {
          ...options,
          retry: retry - 1,
          retryDelay: retryDelay * 2,
        });
      }
    }
    
    // Logăm răspunsul
    if (error) {
      apiLogger.error(`Request to ${urlWithParams.toString()} failed: ${error.message}`);
    } else {
      apiLogger.debug(`Request to ${urlWithParams.toString()} succeeded`);
    }
    
    return {
      data,
      error,
      status: response.status,
      headers: response.headers,
    };
  } catch (e: any) {
    // Anulăm timeout-ul
    clearTimeout(timeoutId);
    
    // Verificăm dacă request-ul a fost anulat din cauza timeout-ului
    if (e.name === 'AbortError') {
      const error = createError('Request timed out', {
        source: ErrorSource.NETWORK,
        type: ErrorType.TIMEOUT,
        severity: ErrorSeverity.ERROR,
        originalError: e,
      });
      
      apiLogger.error(`Request to ${urlWithParams.toString()} timed out`);
      
      return {
        data: null,
        error,
        status: 0,
        headers: new Headers(),
      };
    }
    
    // Verificăm dacă trebuie să reîncercăm request-ul
    if (retry > 0) {
      apiLogger.warn(`Retrying request to ${urlWithParams.toString()} (${retry} attempts left)`);
      
      // Așteptăm înainte de a reîncerca
      try {
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } catch (error) {
        // Handle error appropriately
      }
      
      // Reîncercăm request-ul
      return apiRequest<T>(url, {
        ...options,
        retry: retry - 1,
        retryDelay: retryDelay * 2,
      });
    }
    
    // Creăm eroarea
    const error = createError('Request failed', {
      source: ErrorSource.NETWORK,
      type: ErrorType.NETWORK_ERROR,
      severity: ErrorSeverity.ERROR,
      originalError: e,
    });
    
    apiLogger.error(`Request to ${urlWithParams.toString()} failed: ${e.message}`);
    
    return {
      data: null,
      error,
      status: 0,
      headers: new Headers(),
    };
  }
}

/**
 * Execută un request GET către API
 * @param url URL-ul request-ului
 * @param options Opțiunile request-ului
 * @returns Răspunsul API-ului
 */
export async function get<T>(
  url: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'GET',
    ...options,
  });
}

/**
 * Execută un request POST către API
 * @param url URL-ul request-ului
 * @param data Datele pentru request
 * @param options Opțiunile request-ului
 * @returns Răspunsul API-ului
 */
export async function post<T>(
  url: string,
  data: any,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * Execută un request PUT către API
 * @param url URL-ul request-ului
 * @param data Datele pentru request
 * @param options Opțiunile request-ului
 * @returns Răspunsul API-ului
 */
export async function put<T>(
  url: string,
  data: any,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * Execută un request PATCH către API
 * @param url URL-ul request-ului
 * @param data Datele pentru request
 * @param options Opțiunile request-ului
 * @returns Răspunsul API-ului
 */
export async function patch<T>(
  url: string,
  data: any,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'PATCH',
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * Execută un request DELETE către API
 * @param url URL-ul request-ului
 * @param options Opțiunile request-ului
 * @returns Răspunsul API-ului
 */
export async function del<T>(
  url: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: 'DELETE',
    ...options,
  });
}

/**
 * Golește cache-ul pentru răspunsuri
 */
export function clearCache(): void {
  responseCache.clear();
}

/**
 * Șterge o intrare din cache
 * @param url URL-ul request-ului
 * @param options Opțiunile request-ului
 */
export function invalidateCache(url: string, options: RequestInit = {}): void {
  const cacheKey = generateCacheKey(url, options);
  responseCache.delete(cacheKey);
}

// Exportăm toate funcțiile
export default {
  apiRequest,
  get,
  post,
  put,
  patch,
  del,
  clearCache,
  invalidateCache,
};
