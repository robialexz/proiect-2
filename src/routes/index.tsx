/**
 * Punctul central pentru rutele aplicației
 * Acest fișier exportă toate rutele și funcționalitățile asociate
 */

export { AppRoutes } from './routes';
export { default as routeGroups } from './route-groups';
export { getRouteGroup, isRouteInGroup, RouteGroup } from './route-groups';

// Export implicit pentru compatibilitate
export { AppRoutes as default } from './routes';
