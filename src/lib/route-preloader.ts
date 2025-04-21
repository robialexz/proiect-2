/**
 * Modul pentru preîncărcarea rutelor și resurselor pentru a îmbunătăți performanța
 * Acest modul permite preîncărcarea componentelor și resurselor pentru rutele frecvent accesate
 */

// Importăm utilitățile pentru încărcarea leneșă
import { lazyPage } from "./lazy-pages";
import { RouteGroup, getRouteGroup } from "../routes/route-groups";

// Definim rutele frecvent accesate care ar trebui preîncărcate
const frequentRoutes = [
  "/dashboard",
  "/overview",
  "/inventory-management",
  "/projects",
  "/company-inventory",
  "/suppliers",
  "/teams",
  "/reports",
];

// Mapăm rutele la componentele corespunzătoare
const routeComponents: Record<string, () => Promise<any>> = {
  "/dashboard": () => import("../pages/DashboardPage"),
  "/overview": () => import("../pages/OverviewPage"),
  "/inventory-management": () => import("../pages/InventoryManagementPage"),
  "/projects": () => import("../pages/ProjectsPage"),
  "/company-inventory": () => import("../pages/CompanyInventoryPage"),
  "/suppliers": () => import("../pages/SuppliersPageNew"),
  "/suppliers/:supplierId": () => import("../pages/SupplierDetailsPage"),
  "/teams": () => import("../pages/TeamsPage"),
  "/reports": () => import("../pages/ReportsPageNew"),
};

// Definim grupurile de rute care ar trebui preîncărcate
const preloadGroups = [
  RouteGroup.DASHBOARD,
  RouteGroup.INVENTORY,
  RouteGroup.PROJECTS,
];

// Mapăm grupurile la componentele corespunzătoare
const groupComponents: Record<RouteGroup, Array<() => Promise<any>>> = {
  [RouteGroup.DASHBOARD]: [
    () => import("../pages/DashboardPage"),
    () => import("../pages/OverviewPage"),
  ],
  [RouteGroup.INVENTORY]: [
    () => import("../pages/InventoryManagementPage"),
    () => import("../pages/InventoryOverviewPage"),
    () => import("../pages/CompanyInventoryPage"),
  ],
  [RouteGroup.PROJECTS]: [() => import("../pages/ProjectsPage")],
  [RouteGroup.AUTH]: [
    () => import("../pages/AuthPage"),
    () => import("../pages/ForgotPasswordPage"),
  ],
  [RouteGroup.REPORTS]: [() => import("../pages/ReportsPage")],
  [RouteGroup.SETTINGS]: [
    () => import("../pages/SettingsPage"),
    () => import("../pages/ProfilePage"),
  ],
  [RouteGroup.USERS]: [() => import("../pages/UsersManagementPage")],
  [RouteGroup.MISC]: [],
  [RouteGroup.PUBLIC]: [],
  [RouteGroup.DESKTOP]: [() => import("../pages/DesktopInfoPage")],
};

/**
 * Preîncarcă o rută specifică
 * @param route Ruta de preîncărcat
 */
export const preloadRoute = (route: string): void => {
  const componentLoader = routeComponents[route];
  if (componentLoader) {
    // Preîncărcăm componenta
    componentLoader().catch((err) => {
      // Removed console statement
    });
  }
};

/**
 * Preîncarcă o componentă specifică
 * @param componentPath Calea către componentă
 */
export const preloadComponent = (componentPath: string): void => {
  try {
    // Folosim o abordare mai robustă pentru importul dinamic
    // În loc să încărcăm direct fișierul .tsx, folosim importul normal
    // care va fi procesat corect de bundler
    const importPath = componentPath.replace(/Page$/, "");

    // Folosim un switch pentru a mapa numele componentei la importul corect
    switch (importPath) {
      case "Dashboard":
        import("../pages/DashboardPage").catch((err) => {
          // Removed console statement
        });
        break;
      case "Overview":
        import("../pages/OverviewPage").catch((err) => {
          // Removed console statement
        });
        break;
      case "InventoryManagement":
        import("../pages/InventoryManagementPage").catch((err) => {
          // Removed console statement
        });
        break;
      case "Projects":
        import("../pages/ProjectsPage").catch((err) => {
          // Removed console statement
        });
        break;
      case "CompanyInventory":
        import("../pages/CompanyInventoryPage").catch((err) => {
          // Removed console statement
        });
        break;
      default:
      // Removed console statement
    }
  } catch (err) {
    // Removed console statement
  }
};

/**
 * Preîncarcă toate rutele frecvent accesate
 */
export const preloadFrequentRoutes = (): void => {
  frequentRoutes.forEach((route) => {
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
    .filter((route) => route !== currentRoute)
    .forEach((route) => {
      // Folosim requestIdleCallback pentru a preîncărca în timpul inactiv al browserului
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => preloadRoute(route));
      } else {
        // Fallback pentru browsere care nu suportă requestIdleCallback
        setTimeout(() => preloadRoute(route), 200);
      }
    });
};

/**
 * Preîncarcă componentele pentru o listă de pagini
 * @param pages Lista de pagini de preîncărcat
 */
export const preloadPages = (pages: string[]): void => {
  pages.forEach((page) => {
    preloadComponent(page);
  });
};

/**
 * Preîncarcă componentele pentru paginile frecvent accesate
 */
export const preloadFrequentPages = (): void => {
  const frequentPages = [
    "DashboardPage",
    "OverviewPage",
    "InventoryManagementPage",
    "ProjectsPage",
    "CompanyInventoryPage",
  ];

  preloadPages(frequentPages);
};

/**
 * Preîncarcă grupurile de rute
 */
export const preloadRouteGroups = (): void => {
  if (typeof window === "undefined") return;

  // Folosim requestIdleCallback pentru a preîncărca în timpul inactiv
  const preloadFn = () => {
    // Removed console statement

    // Preîncărcăm grupurile de rute
    preloadGroups.forEach((group, groupIndex) => {
      const importFns = groupComponents[group];
      if (importFns && importFns.length > 0) {
        // Adăugăm o întârziere pentru a nu bloca thread-ul principal
        setTimeout(() => {
          importFns.forEach((importFn, index) => {
            setTimeout(() => {
              importFn().catch((err) => {
                // Removed console statement
              });
            }, index * 200);
          });
        }, groupIndex * 500);
      }
    });
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(preloadFn, { timeout: 2000 });
  } else {
    setTimeout(preloadFn, 1000);
  }
};

/**
 * Preîncarcă grupul de rute pentru o rută dată
 * @param path Calea rutei
 */
export const preloadRouteGroup = (path: string): void => {
  if (typeof window === "undefined") return;

  // Obținem grupul rutei
  const group = getRouteGroup(path);

  // Verificăm dacă grupul există
  if (group && groupComponents[group]) {
    // Folosim requestIdleCallback pentru a preîncărca în timpul inactiv
    const preloadFn = () => {
      // Removed console statement

      // Preîncărcăm componentele grupului
      const importFns = groupComponents[group];
      if (importFns && importFns.length > 0) {
        importFns.forEach((importFn, index) => {
          setTimeout(() => {
            importFn().catch((err) => {
              // Removed console statement
            });
          }, index * 200);
        });
      }
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(preloadFn, { timeout: 2000 });
    } else {
      setTimeout(preloadFn, 1000);
    }
  }
};

// Exportăm un obiect cu toate funcțiile
export const routePreloader = {
  preloadRoute,
  preloadFrequentRoutes,
  preloadAdjacentRoutes,
  preloadComponent,
  preloadPages,
  preloadFrequentPages,
  preloadRouteGroups,
  preloadRouteGroup,
};
