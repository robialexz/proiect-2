/**
 * Permisiunile pentru fiecare rol
 * Acest fișier conține permisiunile pentru fiecare rol din aplicație
 */

import { 
  UserRole, 
  Resource, 
  Action, 
  Role 
} from './permission-types';

// Permisiunile pentru rolul de admin
const adminRole: Role = {
  name: UserRole.ADMIN,
  displayName: 'Administrator',
  description: 'Are acces complet la toate funcționalitățile aplicației',
  permissions: [
    // Permisiuni pentru toate resursele și acțiunile
    ...Object.values(Resource).flatMap((resource) => 
      Object.values(Action).map((action) => ({
        resource,
        action,
      }))
    ),
  ],
};

// Permisiunile pentru rolul de manager
const managerRole: Role = {
  name: UserRole.MANAGER,
  displayName: 'Manager',
  description: 'Are acces la majoritatea funcționalităților aplicației',
  permissions: [
    // Permisiuni pentru proiecte
    { resource: Resource.PROJECT, action: Action.CREATE },
    { resource: Resource.PROJECT, action: Action.READ },
    { resource: Resource.PROJECT, action: Action.UPDATE },
    { resource: Resource.PROJECT, action: Action.DELETE },
    { resource: Resource.PROJECT, action: Action.MANAGE },
    { resource: Resource.PROJECT, action: Action.EXPORT },
    { resource: Resource.PROJECT, action: Action.IMPORT },
    { resource: Resource.PROJECT, action: Action.SHARE },
    { resource: Resource.PROJECT, action: Action.ASSIGN },
    { resource: Resource.PROJECT, action: Action.APPROVE },
    { resource: Resource.PROJECT, action: Action.REJECT },
    { resource: Resource.PROJECT, action: Action.COMMENT },
    { resource: Resource.PROJECT, action: Action.VIEW },
    { resource: Resource.PROJECT, action: Action.LIST },
    { resource: Resource.PROJECT, action: Action.SEARCH },
    
    // Permisiuni pentru inventar
    { resource: Resource.INVENTORY, action: Action.CREATE },
    { resource: Resource.INVENTORY, action: Action.READ },
    { resource: Resource.INVENTORY, action: Action.UPDATE },
    { resource: Resource.INVENTORY, action: Action.DELETE },
    { resource: Resource.INVENTORY, action: Action.MANAGE },
    { resource: Resource.INVENTORY, action: Action.EXPORT },
    { resource: Resource.INVENTORY, action: Action.IMPORT },
    { resource: Resource.INVENTORY, action: Action.VIEW },
    { resource: Resource.INVENTORY, action: Action.LIST },
    { resource: Resource.INVENTORY, action: Action.SEARCH },
    
    // Permisiuni pentru materiale
    { resource: Resource.MATERIAL, action: Action.CREATE },
    { resource: Resource.MATERIAL, action: Action.READ },
    { resource: Resource.MATERIAL, action: Action.UPDATE },
    { resource: Resource.MATERIAL, action: Action.DELETE },
    { resource: Resource.MATERIAL, action: Action.MANAGE },
    { resource: Resource.MATERIAL, action: Action.EXPORT },
    { resource: Resource.MATERIAL, action: Action.IMPORT },
    { resource: Resource.MATERIAL, action: Action.VIEW },
    { resource: Resource.MATERIAL, action: Action.LIST },
    { resource: Resource.MATERIAL, action: Action.SEARCH },
    
    // Permisiuni pentru furnizori
    { resource: Resource.SUPPLIER, action: Action.CREATE },
    { resource: Resource.SUPPLIER, action: Action.READ },
    { resource: Resource.SUPPLIER, action: Action.UPDATE },
    { resource: Resource.SUPPLIER, action: Action.DELETE },
    { resource: Resource.SUPPLIER, action: Action.MANAGE },
    { resource: Resource.SUPPLIER, action: Action.EXPORT },
    { resource: Resource.SUPPLIER, action: Action.IMPORT },
    { resource: Resource.SUPPLIER, action: Action.VIEW },
    { resource: Resource.SUPPLIER, action: Action.LIST },
    { resource: Resource.SUPPLIER, action: Action.SEARCH },
    
    // Permisiuni pentru echipe
    { resource: Resource.TEAM, action: Action.CREATE },
    { resource: Resource.TEAM, action: Action.READ },
    { resource: Resource.TEAM, action: Action.UPDATE },
    { resource: Resource.TEAM, action: Action.DELETE },
    { resource: Resource.TEAM, action: Action.MANAGE },
    { resource: Resource.TEAM, action: Action.ASSIGN },
    { resource: Resource.TEAM, action: Action.VIEW },
    { resource: Resource.TEAM, action: Action.LIST },
    { resource: Resource.TEAM, action: Action.SEARCH },
    
    // Permisiuni pentru sarcini
    { resource: Resource.TASK, action: Action.CREATE },
    { resource: Resource.TASK, action: Action.READ },
    { resource: Resource.TASK, action: Action.UPDATE },
    { resource: Resource.TASK, action: Action.DELETE },
    { resource: Resource.TASK, action: Action.MANAGE },
    { resource: Resource.TASK, action: Action.ASSIGN },
    { resource: Resource.TASK, action: Action.APPROVE },
    { resource: Resource.TASK, action: Action.REJECT },
    { resource: Resource.TASK, action: Action.COMMENT },
    { resource: Resource.TASK, action: Action.VIEW },
    { resource: Resource.TASK, action: Action.LIST },
    { resource: Resource.TASK, action: Action.SEARCH },
    
    // Permisiuni pentru rapoarte
    { resource: Resource.REPORT, action: Action.CREATE },
    { resource: Resource.REPORT, action: Action.READ },
    { resource: Resource.REPORT, action: Action.UPDATE },
    { resource: Resource.REPORT, action: Action.DELETE },
    { resource: Resource.REPORT, action: Action.EXPORT },
    { resource: Resource.REPORT, action: Action.PRINT },
    { resource: Resource.REPORT, action: Action.SHARE },
    { resource: Resource.REPORT, action: Action.VIEW },
    { resource: Resource.REPORT, action: Action.LIST },
    { resource: Resource.REPORT, action: Action.SEARCH },
    
    // Permisiuni pentru utilizatori
    { resource: Resource.USER, action: Action.READ },
    { resource: Resource.USER, action: Action.VIEW },
    { resource: Resource.USER, action: Action.LIST },
    { resource: Resource.USER, action: Action.SEARCH },
    
    // Permisiuni pentru dashboard
    { resource: Resource.DASHBOARD, action: Action.READ },
    { resource: Resource.DASHBOARD, action: Action.VIEW },
    
    // Permisiuni pentru analytics
    { resource: Resource.ANALYTICS, action: Action.READ },
    { resource: Resource.ANALYTICS, action: Action.VIEW },
    
    // Permisiuni pentru calendar
    { resource: Resource.CALENDAR, action: Action.READ },
    { resource: Resource.CALENDAR, action: Action.UPDATE },
    { resource: Resource.CALENDAR, action: Action.VIEW },
    
    // Permisiuni pentru documente
    { resource: Resource.DOCUMENT, action: Action.CREATE },
    { resource: Resource.DOCUMENT, action: Action.READ },
    { resource: Resource.DOCUMENT, action: Action.UPDATE },
    { resource: Resource.DOCUMENT, action: Action.DELETE },
    { resource: Resource.DOCUMENT, action: Action.UPLOAD },
    { resource: Resource.DOCUMENT, action: Action.DOWNLOAD },
    { resource: Resource.DOCUMENT, action: Action.SHARE },
    { resource: Resource.DOCUMENT, action: Action.VIEW },
    { resource: Resource.DOCUMENT, action: Action.LIST },
    { resource: Resource.DOCUMENT, action: Action.SEARCH },
    
    // Permisiuni pentru buget
    { resource: Resource.BUDGET, action: Action.READ },
    { resource: Resource.BUDGET, action: Action.UPDATE },
    { resource: Resource.BUDGET, action: Action.VIEW },
    
    // Permisiuni pentru program
    { resource: Resource.SCHEDULE, action: Action.READ },
    { resource: Resource.SCHEDULE, action: Action.UPDATE },
    { resource: Resource.SCHEDULE, action: Action.VIEW },
    
    // Permisiuni pentru prognoză
    { resource: Resource.FORECAST, action: Action.READ },
    { resource: Resource.FORECAST, action: Action.VIEW },
    
    // Permisiuni pentru notificări
    { resource: Resource.NOTIFICATION, action: Action.READ },
    { resource: Resource.NOTIFICATION, action: Action.UPDATE },
    { resource: Resource.NOTIFICATION, action: Action.DELETE },
    { resource: Resource.NOTIFICATION, action: Action.VIEW },
    { resource: Resource.NOTIFICATION, action: Action.LIST },
  ],
};

// Permisiunile pentru rolul de utilizator
const userRole: Role = {
  name: UserRole.USER,
  displayName: 'Utilizator',
  description: 'Are acces la funcționalitățile de bază ale aplicației',
  permissions: [
    // Permisiuni pentru proiecte
    { resource: Resource.PROJECT, action: Action.READ },
    { resource: Resource.PROJECT, action: Action.COMMENT },
    { resource: Resource.PROJECT, action: Action.VIEW },
    { resource: Resource.PROJECT, action: Action.LIST },
    { resource: Resource.PROJECT, action: Action.SEARCH },
    
    // Permisiuni pentru inventar
    { resource: Resource.INVENTORY, action: Action.READ },
    { resource: Resource.INVENTORY, action: Action.VIEW },
    { resource: Resource.INVENTORY, action: Action.LIST },
    { resource: Resource.INVENTORY, action: Action.SEARCH },
    
    // Permisiuni pentru materiale
    { resource: Resource.MATERIAL, action: Action.READ },
    { resource: Resource.MATERIAL, action: Action.VIEW },
    { resource: Resource.MATERIAL, action: Action.LIST },
    { resource: Resource.MATERIAL, action: Action.SEARCH },
    
    // Permisiuni pentru furnizori
    { resource: Resource.SUPPLIER, action: Action.READ },
    { resource: Resource.SUPPLIER, action: Action.VIEW },
    { resource: Resource.SUPPLIER, action: Action.LIST },
    { resource: Resource.SUPPLIER, action: Action.SEARCH },
    
    // Permisiuni pentru echipe
    { resource: Resource.TEAM, action: Action.READ },
    { resource: Resource.TEAM, action: Action.VIEW },
    { resource: Resource.TEAM, action: Action.LIST },
    { resource: Resource.TEAM, action: Action.SEARCH },
    
    // Permisiuni pentru sarcini
    { resource: Resource.TASK, action: Action.READ },
    { resource: Resource.TASK, action: Action.UPDATE, conditions: { isAssigned: true } },
    { resource: Resource.TASK, action: Action.COMMENT },
    { resource: Resource.TASK, action: Action.VIEW },
    { resource: Resource.TASK, action: Action.LIST },
    { resource: Resource.TASK, action: Action.SEARCH },
    
    // Permisiuni pentru rapoarte
    { resource: Resource.REPORT, action: Action.READ },
    { resource: Resource.REPORT, action: Action.VIEW },
    { resource: Resource.REPORT, action: Action.LIST },
    { resource: Resource.REPORT, action: Action.SEARCH },
    
    // Permisiuni pentru dashboard
    { resource: Resource.DASHBOARD, action: Action.READ },
    { resource: Resource.DASHBOARD, action: Action.VIEW },
    
    // Permisiuni pentru calendar
    { resource: Resource.CALENDAR, action: Action.READ },
    { resource: Resource.CALENDAR, action: Action.VIEW },
    
    // Permisiuni pentru documente
    { resource: Resource.DOCUMENT, action: Action.READ },
    { resource: Resource.DOCUMENT, action: Action.DOWNLOAD },
    { resource: Resource.DOCUMENT, action: Action.VIEW },
    { resource: Resource.DOCUMENT, action: Action.LIST },
    { resource: Resource.DOCUMENT, action: Action.SEARCH },
    
    // Permisiuni pentru notificări
    { resource: Resource.NOTIFICATION, action: Action.READ },
    { resource: Resource.NOTIFICATION, action: Action.UPDATE },
    { resource: Resource.NOTIFICATION, action: Action.VIEW },
    { resource: Resource.NOTIFICATION, action: Action.LIST },
  ],
};

// Permisiunile pentru rolul de oaspete
const guestRole: Role = {
  name: UserRole.GUEST,
  displayName: 'Oaspete',
  description: 'Are acces limitat la aplicație',
  permissions: [
    // Permisiuni pentru proiecte
    { resource: Resource.PROJECT, action: Action.READ, conditions: { isPublic: true } },
    { resource: Resource.PROJECT, action: Action.VIEW, conditions: { isPublic: true } },
    { resource: Resource.PROJECT, action: Action.LIST, conditions: { isPublic: true } },
    { resource: Resource.PROJECT, action: Action.SEARCH, conditions: { isPublic: true } },
    
    // Permisiuni pentru dashboard
    { resource: Resource.DASHBOARD, action: Action.READ },
    { resource: Resource.DASHBOARD, action: Action.VIEW },
    
    // Permisiuni pentru notificări
    { resource: Resource.NOTIFICATION, action: Action.READ },
    { resource: Resource.NOTIFICATION, action: Action.VIEW },
    { resource: Resource.NOTIFICATION, action: Action.LIST },
  ],
};

// Lista cu toate rolurile
export const rolePermissions: Role[] = [
  adminRole,
  managerRole,
  userRole,
  guestRole,
];

// Exportăm toate rolurile
export default rolePermissions;
