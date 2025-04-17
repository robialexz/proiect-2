/**
 * Modul pentru preîncărcarea rutelor și resurselor pentru a îmbunătăți performanța
 * Acest modul permite preîncărcarea componentelor și resurselor pentru rutele frecvent accesate
 */

// Importăm lazy din React pentru a putea preîncărca componentele
import { lazy } from 'react';

// Definim rutele frecvent accesate care ar trebui preîncărcate
const frequentRoutes = [
  '/dashboard',
  '/overview',
  '/inventory-management',
  '/projects',
];

// Mapăm rutele la componentele corespunzătoare
const routeComponents: Record<string, () => Promise<any>> = {
  '/dashboard': () => import('../pages/DashboardPage'),
  '/overview': () => import('../pages/OverviewPage'),
  '/inventory-management': () => import('../pages/InventoryManagementPage'),
  '/projects': () => import('../pages/ProjectsPage'),
};

/**
 * Preîncarcă o rută specifică
 * @param route Ruta de preîncărcat
 */
export const preloadRoute = (route: string): void => {
  const componentLoader = routeComponents[route];
  if (componentLoader) {
    // Preîncărcăm componenta
    componentLoader().catch(err => {
      console.warn(`Failed to preload route ${route}:`, err);
    });
  }
};

/**
 * Preîncarcă toate rutele frecvent accesate
 */
export const preloadFrequentRoutes = (): void => {
  frequentRoutes.forEach(route => {
    preloadRoute(route);
  });
};

/**
 * Preîncarcă rutele adiacente rutei curente
 * @param currentRoute Ruta curentă
 */
export const preloadAdjacentRoutes = (currentRoute: string): void => {
  // Preîncărcăm toate rutele frecvente, cu excepția celei curente
  frequentRoutes
    .filter(route => route !== currentRoute)
    .forEach(route => {
      // Folosim requestIdleCallback pentru a preîncărca în timpul inactiv al browserului
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => preloadRoute(route));
      } else {
        // Fallback pentru browsere care nu suportă requestIdleCallback
        setTimeout(() => preloadRoute(route), 200);
      }
    });
};

// Exportăm un obiect cu toate funcțiile
export const routePreloader = {
  preloadRoute,
  preloadFrequentRoutes,
  preloadAdjacentRoutes,
};
