/**
 * Exportă sistemul de API
 */

// Exportăm funcțiile pentru API
export {
  apiRequest,
  get,
  post,
  put,
  patch,
  del,
  clearCache,
  invalidateCache,
} from './api-client';
export type { RequestOptions, ApiResponse } from './api-client';

// Export implicit pentru compatibilitate
export { default as apiClient } from './api-client';
