/**
 * Configurația rutelor
 * Acest fișier conține configurația rutelor aplicației
 */

import { UserRole } from '@/lib/permissions';

/**
 * Interfața pentru o rută
 */
export interface Route {
  path: string;
  title: string;
  description?: string;
  icon?: string;
  roles?: UserRole[];
  children?: Route[];
  isPublic?: boolean;
  isHidden?: boolean;
  isExternal?: boolean;
  badge?: string | number;
  badgeColor?: string;
}

/**
 * Rutele publice
 */
export const publicRoutes: Route[] = [
  {
    path: '/',
    title: 'Acasă',
    description: 'Pagina principală',
    icon: 'home',
    isPublic: true,
  },
  {
    path: '/login',
    title: 'Autentificare',
    description: 'Autentificare în aplicație',
    icon: 'login',
    isPublic: true,
  },
  {
    path: '/register',
    title: 'Înregistrare',
    description: 'Înregistrare în aplicație',
    icon: 'user-plus',
    isPublic: true,
  },
  {
    path: '/forgot-password',
    title: 'Recuperare parolă',
    description: 'Recuperare parolă',
    icon: 'key',
    isPublic: true,
  },
  {
    path: '/reset-password',
    title: 'Resetare parolă',
    description: 'Resetare parolă',
    icon: 'key',
    isPublic: true,
  },
  {
    path: '/terms',
    title: 'Termeni și condiții',
    description: 'Termeni și condiții',
    icon: 'file-text',
    isPublic: true,
  },
  {
    path: '/privacy',
    title: 'Politica de confidențialitate',
    description: 'Politica de confidențialitate',
    icon: 'shield',
    isPublic: true,
  },
  {
    path: '/cookies',
    title: 'Politica de cookies',
    description: 'Politica de cookies',
    icon: 'cookie',
    isPublic: true,
  },
  {
    path: '/about',
    title: 'Despre noi',
    description: 'Despre noi',
    icon: 'info',
    isPublic: true,
  },
  {
    path: '/contact',
    title: 'Contact',
    description: 'Contact',
    icon: 'mail',
    isPublic: true,
  },
  {
    path: '/auth/callback',
    title: 'Callback',
    description: 'Callback pentru autentificare',
    isPublic: true,
    isHidden: true,
  },
];

/**
 * Rutele pentru dashboard
 */
export const dashboardRoutes: Route[] = [
  {
    path: '/dashboard',
    title: 'Panou de control',
    description: 'Panou de control',
    icon: 'layout-dashboard',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.GUEST],
  },
  {
    path: '/overview',
    title: 'Prezentare generală',
    description: 'Prezentare generală',
    icon: 'activity',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
  },
  {
    path: '/analytics',
    title: 'Analiză',
    description: 'Analiză',
    icon: 'bar-chart',
    roles: [UserRole.ADMIN, UserRole.MANAGER],
  },
];

/**
 * Rutele pentru proiecte
 */
export const projectRoutes: Route[] = [
  {
    path: '/projects',
    title: 'Proiecte',
    description: 'Gestionare proiecte',
    icon: 'briefcase',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.GUEST],
  },
  {
    path: '/projects/create',
    title: 'Creare proiect',
    description: 'Creare proiect nou',
    icon: 'plus',
    roles: [UserRole.ADMIN, UserRole.MANAGER],
    isHidden: true,
  },
  {
    path: '/projects/:id',
    title: 'Detalii proiect',
    description: 'Detalii proiect',
    icon: 'info',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.GUEST],
    isHidden: true,
  },
  {
    path: '/projects/:id/edit',
    title: 'Editare proiect',
    description: 'Editare proiect',
    icon: 'edit',
    roles: [UserRole.ADMIN, UserRole.MANAGER],
    isHidden: true,
  },
];

/**
 * Rutele pentru inventar
 */
export const inventoryRoutes: Route[] = [
  {
    path: '/inventory-management',
    title: 'Inventar proiect',
    description: 'Gestionare inventar proiect',
    icon: 'package',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
  },
  {
    path: '/inventory-overview',
    title: 'Prezentare inventar',
    description: 'Prezentare inventar',
    icon: 'list',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
  },
  {
    path: '/company-inventory',
    title: 'Inventar companie',
    description: 'Gestionare inventar companie',
    icon: 'database',
    roles: [UserRole.ADMIN, UserRole.MANAGER],
  },
  {
    path: '/materials',
    title: 'Materiale',
    description: 'Gestionare materiale',
    icon: 'box',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
  },
  {
    path: '/materials/create',
    title: 'Creare material',
    description: 'Creare material nou',
    icon: 'plus',
    roles: [UserRole.ADMIN, UserRole.MANAGER],
    isHidden: true,
  },
  {
    path: '/materials/:id',
    title: 'Detalii material',
    description: 'Detalii material',
    icon: 'info',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
    isHidden: true,
  },
  {
    path: '/materials/:id/edit',
    title: 'Editare material',
    description: 'Editare material',
    icon: 'edit',
    roles: [UserRole.ADMIN, UserRole.MANAGER],
    isHidden: true,
  },
];

/**
 * Rutele pentru rapoarte
 */
export const reportRoutes: Route[] = [
  {
    path: '/reports',
    title: 'Rapoarte',
    description: 'Gestionare rapoarte',
    icon: 'file-text',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
  },
  {
    path: '/reports/create',
    title: 'Creare raport',
    description: 'Creare raport nou',
    icon: 'plus',
    roles: [UserRole.ADMIN, UserRole.MANAGER],
    isHidden: true,
  },
  {
    path: '/reports/:id',
    title: 'Detalii raport',
    description: 'Detalii raport',
    icon: 'info',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
    isHidden: true,
  },
];

/**
 * Rutele pentru resurse
 */
export const resourceRoutes: Route[] = [
  {
    path: '/resources',
    title: 'Resurse',
    description: 'Gestionare resurse',
    icon: 'folder',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
  },
  {
    path: '/documents',
    title: 'Documente',
    description: 'Gestionare documente',
    icon: 'file',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
  },
  {
    path: '/suppliers',
    title: 'Furnizori',
    description: 'Gestionare furnizori',
    icon: 'truck',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
  },
  {
    path: '/teams',
    title: 'Echipe',
    description: 'Gestionare echipe',
    icon: 'users',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
  },
];

/**
 * Rutele pentru planificare
 */
export const planningRoutes: Route[] = [
  {
    path: '/calendar',
    title: 'Calendar',
    description: 'Calendar',
    icon: 'calendar',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
  },
  {
    path: '/budget',
    title: 'Buget',
    description: 'Gestionare buget',
    icon: 'dollar-sign',
    roles: [UserRole.ADMIN, UserRole.MANAGER],
  },
  {
    path: '/schedule',
    title: 'Program',
    description: 'Gestionare program',
    icon: 'clock',
    roles: [UserRole.ADMIN, UserRole.MANAGER],
  },
  {
    path: '/tasks',
    title: 'Sarcini',
    description: 'Gestionare sarcini',
    icon: 'check-square',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
  },
  {
    path: '/forecast',
    title: 'Prognoză',
    description: 'Prognoză',
    icon: 'trending-up',
    roles: [UserRole.ADMIN, UserRole.MANAGER],
  },
];

/**
 * Rutele pentru setări
 */
export const settingsRoutes: Route[] = [
  {
    path: '/settings',
    title: 'Setări',
    description: 'Setări',
    icon: 'settings',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.GUEST],
  },
  {
    path: '/profile',
    title: 'Profil',
    description: 'Profil utilizator',
    icon: 'user',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.GUEST],
  },
  {
    path: '/edit-profile',
    title: 'Editare profil',
    description: 'Editare profil utilizator',
    icon: 'edit',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.GUEST],
    isHidden: true,
  },
  {
    path: '/preferences',
    title: 'Preferințe',
    description: 'Preferințe utilizator',
    icon: 'sliders',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.GUEST],
  },
];

/**
 * Rutele pentru administrare
 */
export const adminRoutes: Route[] = [
  {
    path: '/admin',
    title: 'Administrare',
    description: 'Administrare',
    icon: 'shield',
    roles: [UserRole.ADMIN],
  },
  {
    path: '/admin/users',
    title: 'Utilizatori',
    description: 'Gestionare utilizatori',
    icon: 'users',
    roles: [UserRole.ADMIN],
  },
  {
    path: '/admin/roles',
    title: 'Roluri',
    description: 'Gestionare roluri',
    icon: 'key',
    roles: [UserRole.ADMIN],
  },
  {
    path: '/admin/logs',
    title: 'Jurnale',
    description: 'Jurnale',
    icon: 'file-text',
    roles: [UserRole.ADMIN],
  },
  {
    path: '/admin/errors',
    title: 'Erori',
    description: 'Erori',
    icon: 'alert-triangle',
    roles: [UserRole.ADMIN],
  },
  {
    path: '/admin/settings',
    title: 'Setări sistem',
    description: 'Setări sistem',
    icon: 'settings',
    roles: [UserRole.ADMIN],
  },
];

/**
 * Toate rutele
 */
export const routes: Route[] = [
  ...publicRoutes,
  ...dashboardRoutes,
  ...projectRoutes,
  ...inventoryRoutes,
  ...reportRoutes,
  ...resourceRoutes,
  ...planningRoutes,
  ...settingsRoutes,
  ...adminRoutes,
];

/**
 * Rutele pentru navigare
 */
export const navigationRoutes: Route[] = [
  {
    path: '/dashboard',
    title: 'Panou de control',
    description: 'Panou de control',
    icon: 'layout-dashboard',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.GUEST],
    children: [
      {
        path: '/dashboard',
        title: 'Panou de control',
        description: 'Panou de control',
        icon: 'layout-dashboard',
        roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.GUEST],
      },
      {
        path: '/overview',
        title: 'Prezentare generală',
        description: 'Prezentare generală',
        icon: 'activity',
        roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
      },
      {
        path: '/analytics',
        title: 'Analiză',
        description: 'Analiză',
        icon: 'bar-chart',
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
    ],
  },
  {
    path: '/projects',
    title: 'Proiecte',
    description: 'Gestionare proiecte',
    icon: 'briefcase',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.GUEST],
  },
  {
    path: '/inventory-management',
    title: 'Inventar',
    description: 'Gestionare inventar',
    icon: 'package',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
    children: [
      {
        path: '/inventory-management',
        title: 'Inventar proiect',
        description: 'Gestionare inventar proiect',
        icon: 'package',
        roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
      },
      {
        path: '/inventory-overview',
        title: 'Prezentare inventar',
        description: 'Prezentare inventar',
        icon: 'list',
        roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
      },
      {
        path: '/company-inventory',
        title: 'Inventar companie',
        description: 'Gestionare inventar companie',
        icon: 'database',
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
      {
        path: '/materials',
        title: 'Materiale',
        description: 'Gestionare materiale',
        icon: 'box',
        roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
      },
    ],
  },
  {
    path: '/reports',
    title: 'Rapoarte',
    description: 'Gestionare rapoarte',
    icon: 'file-text',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
  },
  {
    path: '/resources',
    title: 'Resurse',
    description: 'Gestionare resurse',
    icon: 'folder',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
    children: [
      {
        path: '/resources',
        title: 'Resurse',
        description: 'Gestionare resurse',
        icon: 'folder',
        roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
      },
      {
        path: '/documents',
        title: 'Documente',
        description: 'Gestionare documente',
        icon: 'file',
        roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
      },
      {
        path: '/suppliers',
        title: 'Furnizori',
        description: 'Gestionare furnizori',
        icon: 'truck',
        roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
      },
      {
        path: '/teams',
        title: 'Echipe',
        description: 'Gestionare echipe',
        icon: 'users',
        roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
      },
    ],
  },
  {
    path: '/calendar',
    title: 'Planificare',
    description: 'Planificare',
    icon: 'calendar',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
    children: [
      {
        path: '/calendar',
        title: 'Calendar',
        description: 'Calendar',
        icon: 'calendar',
        roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
      },
      {
        path: '/budget',
        title: 'Buget',
        description: 'Gestionare buget',
        icon: 'dollar-sign',
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
      {
        path: '/schedule',
        title: 'Program',
        description: 'Gestionare program',
        icon: 'clock',
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
      {
        path: '/tasks',
        title: 'Sarcini',
        description: 'Gestionare sarcini',
        icon: 'check-square',
        roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
      },
      {
        path: '/forecast',
        title: 'Prognoză',
        description: 'Prognoză',
        icon: 'trending-up',
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
    ],
  },
  {
    path: '/settings',
    title: 'Setări',
    description: 'Setări',
    icon: 'settings',
    roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.GUEST],
    children: [
      {
        path: '/settings',
        title: 'Setări',
        description: 'Setări',
        icon: 'settings',
        roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.GUEST],
      },
      {
        path: '/profile',
        title: 'Profil',
        description: 'Profil utilizator',
        icon: 'user',
        roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.GUEST],
      },
      {
        path: '/preferences',
        title: 'Preferințe',
        description: 'Preferințe utilizator',
        icon: 'sliders',
        roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.GUEST],
      },
    ],
  },
  {
    path: '/admin',
    title: 'Administrare',
    description: 'Administrare',
    icon: 'shield',
    roles: [UserRole.ADMIN],
    children: [
      {
        path: '/admin',
        title: 'Administrare',
        description: 'Administrare',
        icon: 'shield',
        roles: [UserRole.ADMIN],
      },
      {
        path: '/admin/users',
        title: 'Utilizatori',
        description: 'Gestionare utilizatori',
        icon: 'users',
        roles: [UserRole.ADMIN],
      },
      {
        path: '/admin/roles',
        title: 'Roluri',
        description: 'Gestionare roluri',
        icon: 'key',
        roles: [UserRole.ADMIN],
      },
      {
        path: '/admin/logs',
        title: 'Jurnale',
        description: 'Jurnale',
        icon: 'file-text',
        roles: [UserRole.ADMIN],
      },
      {
        path: '/admin/errors',
        title: 'Erori',
        description: 'Erori',
        icon: 'alert-triangle',
        roles: [UserRole.ADMIN],
      },
      {
        path: '/admin/settings',
        title: 'Setări sistem',
        description: 'Setări sistem',
        icon: 'settings',
        roles: [UserRole.ADMIN],
      },
    ],
  },
];

// Exportăm configurația
export default {
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
};
