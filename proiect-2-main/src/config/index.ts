/**
 * Exportă configurația aplicației
 */

// Exportăm configurația aplicației
export { appConfig } from './app-config';
export { default as appConfig } from './app-config';

// Exportăm configurația rutelor
export {
  publicRoutes,
  dashboardRoutes,
  projectRoutes,
  inventoryRoutes,
  reportRoutes,
  resourceRoutes,
  planningRoutes,
  settingsRoutes,
  adminRoutes,
  routes,
  navigationRoutes,
} from './routes-config';
export type { Route } from './routes-config';
export { default as routesConfig } from './routes-config';

// Export implicit pentru compatibilitate
export default {
  appConfig,
  routesConfig,
};
