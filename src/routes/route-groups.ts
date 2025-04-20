/**
 * Definirea grupurilor de rute pentru o mai bună organizare și code splitting
 * Acest fișier grupează rutele în funcție de funcționalitatea lor
 */

// Tipuri pentru grupurile de rute
export enum RouteGroup {
  AUTH = 'auth',
  DASHBOARD = 'dashboard',
  INVENTORY = 'inventory',
  PROJECTS = 'projects',
  REPORTS = 'reports',
  SETTINGS = 'settings',
  USERS = 'users',
  MISC = 'misc',
  PUBLIC = 'public',
  DESKTOP = 'desktop',
}

// Maparea rutelor la grupuri
export const routeGroupMap: Record<string, RouteGroup> = {
  // Rute publice
  '/': RouteGroup.PUBLIC,
  '/about': RouteGroup.PUBLIC,
  '/terms': RouteGroup.PUBLIC,
  '/pricing': RouteGroup.PUBLIC,
  '/contact': RouteGroup.PUBLIC,
  
  // Rute de autentificare
  '/login': RouteGroup.AUTH,
  '/register': RouteGroup.AUTH,
  '/forgot-password': RouteGroup.AUTH,
  '/reset-password': RouteGroup.AUTH,
  '/auth/callback': RouteGroup.AUTH,
  
  // Rute de dashboard
  '/dashboard': RouteGroup.DASHBOARD,
  '/overview': RouteGroup.DASHBOARD,
  '/analytics': RouteGroup.DASHBOARD,
  '/calendar': RouteGroup.DASHBOARD,
  
  // Rute de inventar
  '/inventory-management': RouteGroup.INVENTORY,
  '/inventory-overview': RouteGroup.INVENTORY,
  '/company-inventory': RouteGroup.INVENTORY,
  '/add-material': RouteGroup.INVENTORY,
  '/upload-excel': RouteGroup.INVENTORY,
  '/inventory-list': RouteGroup.INVENTORY,
  '/item': RouteGroup.INVENTORY,
  '/create-item': RouteGroup.INVENTORY,
  '/categories': RouteGroup.INVENTORY,
  '/import-export': RouteGroup.INVENTORY,
  '/scan': RouteGroup.INVENTORY,
  '/ai-assistant': RouteGroup.INVENTORY,
  
  // Rute de proiecte
  '/projects': RouteGroup.PROJECTS,
  '/suppliers': RouteGroup.PROJECTS,
  '/teams': RouteGroup.PROJECTS,
  '/budget': RouteGroup.PROJECTS,
  '/schedule': RouteGroup.PROJECTS,
  '/tasks': RouteGroup.PROJECTS,
  '/forecast': RouteGroup.PROJECTS,
  
  // Rute de rapoarte
  '/reports': RouteGroup.REPORTS,
  '/resources': RouteGroup.REPORTS,
  '/documents': RouteGroup.REPORTS,
  '/os-report': RouteGroup.REPORTS,
  
  // Rute de setări
  '/settings': RouteGroup.SETTINGS,
  '/profile': RouteGroup.SETTINGS,
  '/edit-profile': RouteGroup.SETTINGS,
  '/preferences': RouteGroup.SETTINGS,
  
  // Rute de utilizatori
  '/users': RouteGroup.USERS,
  '/role-management': RouteGroup.USERS,
  '/audit-logs': RouteGroup.USERS,
  
  // Rute diverse
  '/tutorial': RouteGroup.MISC,
  '/notifications': RouteGroup.MISC,
  '/error-monitoring': RouteGroup.MISC,
  '/tester': RouteGroup.MISC,
  
  // Rute desktop
  '/desktop-info': RouteGroup.DESKTOP,
};

/**
 * Obține grupul pentru o rută dată
 * @param path Calea rutei
 * @returns Grupul rutei
 */
export function getRouteGroup(path: string): RouteGroup {
  // Verificăm dacă ruta este în mapare
  if (path in routeGroupMap) {
    return routeGroupMap[path];
  }
  
  // Verificăm dacă ruta începe cu un prefix cunoscut
  for (const [route, group] of Object.entries(routeGroupMap)) {
    if (path.startsWith(route) && route !== '/') {
      return group;
    }
  }
  
  // Returnăm grupul implicit
  return RouteGroup.MISC;
}

/**
 * Verifică dacă o rută face parte dintr-un grup
 * @param path Calea rutei
 * @param group Grupul de verificat
 * @returns true dacă ruta face parte din grup
 */
export function isRouteInGroup(path: string, group: RouteGroup): boolean {
  return getRouteGroup(path) === group;
}

export default {
  RouteGroup,
  routeGroupMap,
  getRouteGroup,
  isRouteInGroup,
};
