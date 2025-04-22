/**
 * Reguli de permisiuni
 * Acest fișier conține regulile de permisiuni pentru fiecare rol
 */

import { UserRole, Resource, Action, Role } from './permission-types';

/**
 * Regulile de permisiuni pentru fiecare rol
 */
export const permissionRules: Role[] = [
  // Administrator
  {
    name: UserRole.ADMIN,
    displayName: 'Administrator',
    description: 'Are acces complet la toate funcționalitățile aplicației',
    permissions: [
      // Permisiuni pentru dashboard
      { resource: Resource.DASHBOARD, action: Action.MANAGE },
      
      // Permisiuni pentru proiecte
      { resource: Resource.PROJECT, action: Action.MANAGE },
      
      // Permisiuni pentru inventar
      { resource: Resource.INVENTORY, action: Action.MANAGE },
      { resource: Resource.MATERIAL, action: Action.MANAGE },
      { resource: Resource.SUPPLIER, action: Action.MANAGE },
      
      // Permisiuni pentru echipe
      { resource: Resource.TEAM, action: Action.MANAGE },
      
      // Permisiuni pentru sarcini
      { resource: Resource.TASK, action: Action.MANAGE },
      
      // Permisiuni pentru rapoarte
      { resource: Resource.REPORT, action: Action.MANAGE },
      
      // Permisiuni pentru utilizatori
      { resource: Resource.USER, action: Action.MANAGE },
      { resource: Resource.ROLE, action: Action.MANAGE },
      
      // Permisiuni pentru setări
      { resource: Resource.SETTING, action: Action.MANAGE },
      
      // Permisiuni pentru notificări
      { resource: Resource.NOTIFICATION, action: Action.MANAGE },
      
      // Permisiuni pentru analiză
      { resource: Resource.ANALYTICS, action: Action.MANAGE },
      
      // Permisiuni pentru calendar
      { resource: Resource.CALENDAR, action: Action.MANAGE },
      
      // Permisiuni pentru documente
      { resource: Resource.DOCUMENT, action: Action.MANAGE },
      
      // Permisiuni pentru buget
      { resource: Resource.BUDGET, action: Action.MANAGE },
      
      // Permisiuni pentru program
      { resource: Resource.SCHEDULE, action: Action.MANAGE },
      
      // Permisiuni pentru prognoză
      { resource: Resource.FORECAST, action: Action.MANAGE },
    ],
  },
  
  // Manager
  {
    name: UserRole.MANAGER,
    displayName: 'Manager',
    description: 'Poate gestiona proiecte, echipe și inventar',
    permissions: [
      // Permisiuni pentru dashboard
      { resource: Resource.DASHBOARD, action: Action.READ },
      
      // Permisiuni pentru proiecte
      { resource: Resource.PROJECT, action: Action.CREATE },
      { resource: Resource.PROJECT, action: Action.READ },
      { resource: Resource.PROJECT, action: Action.UPDATE },
      { resource: Resource.PROJECT, action: Action.DELETE },
      { resource: Resource.PROJECT, action: Action.EXPORT },
      { resource: Resource.PROJECT, action: Action.IMPORT },
      { resource: Resource.PROJECT, action: Action.SHARE },
      { resource: Resource.PROJECT, action: Action.ASSIGN },
      { resource: Resource.PROJECT, action: Action.APPROVE },
      { resource: Resource.PROJECT, action: Action.REJECT },
      
      // Permisiuni pentru inventar
      { resource: Resource.INVENTORY, action: Action.CREATE },
      { resource: Resource.INVENTORY, action: Action.READ },
      { resource: Resource.INVENTORY, action: Action.UPDATE },
      { resource: Resource.INVENTORY, action: Action.DELETE },
      { resource: Resource.INVENTORY, action: Action.EXPORT },
      { resource: Resource.INVENTORY, action: Action.IMPORT },
      
      // Permisiuni pentru materiale
      { resource: Resource.MATERIAL, action: Action.CREATE },
      { resource: Resource.MATERIAL, action: Action.READ },
      { resource: Resource.MATERIAL, action: Action.UPDATE },
      { resource: Resource.MATERIAL, action: Action.DELETE },
      { resource: Resource.MATERIAL, action: Action.EXPORT },
      { resource: Resource.MATERIAL, action: Action.IMPORT },
      
      // Permisiuni pentru furnizori
      { resource: Resource.SUPPLIER, action: Action.CREATE },
      { resource: Resource.SUPPLIER, action: Action.READ },
      { resource: Resource.SUPPLIER, action: Action.UPDATE },
      { resource: Resource.SUPPLIER, action: Action.DELETE },
      { resource: Resource.SUPPLIER, action: Action.EXPORT },
      { resource: Resource.SUPPLIER, action: Action.IMPORT },
      
      // Permisiuni pentru echipe
      { resource: Resource.TEAM, action: Action.CREATE },
      { resource: Resource.TEAM, action: Action.READ },
      { resource: Resource.TEAM, action: Action.UPDATE },
      { resource: Resource.TEAM, action: Action.DELETE },
      { resource: Resource.TEAM, action: Action.ASSIGN },
      
      // Permisiuni pentru sarcini
      { resource: Resource.TASK, action: Action.CREATE },
      { resource: Resource.TASK, action: Action.READ },
      { resource: Resource.TASK, action: Action.UPDATE },
      { resource: Resource.TASK, action: Action.DELETE },
      { resource: Resource.TASK, action: Action.ASSIGN },
      { resource: Resource.TASK, action: Action.APPROVE },
      { resource: Resource.TASK, action: Action.REJECT },
      
      // Permisiuni pentru rapoarte
      { resource: Resource.REPORT, action: Action.CREATE },
      { resource: Resource.REPORT, action: Action.READ },
      { resource: Resource.REPORT, action: Action.EXPORT },
      { resource: Resource.REPORT, action: Action.PRINT },
      
      // Permisiuni pentru utilizatori
      { resource: Resource.USER, action: Action.READ },
      
      // Permisiuni pentru notificări
      { resource: Resource.NOTIFICATION, action: Action.READ },
      { resource: Resource.NOTIFICATION, action: Action.CREATE },
      
      // Permisiuni pentru analiză
      { resource: Resource.ANALYTICS, action: Action.READ },
      
      // Permisiuni pentru calendar
      { resource: Resource.CALENDAR, action: Action.READ },
      { resource: Resource.CALENDAR, action: Action.UPDATE },
      
      // Permisiuni pentru documente
      { resource: Resource.DOCUMENT, action: Action.CREATE },
      { resource: Resource.DOCUMENT, action: Action.READ },
      { resource: Resource.DOCUMENT, action: Action.UPDATE },
      { resource: Resource.DOCUMENT, action: Action.DELETE },
      { resource: Resource.DOCUMENT, action: Action.UPLOAD },
      { resource: Resource.DOCUMENT, action: Action.DOWNLOAD },
      
      // Permisiuni pentru buget
      { resource: Resource.BUDGET, action: Action.READ },
      { resource: Resource.BUDGET, action: Action.UPDATE },
      
      // Permisiuni pentru program
      { resource: Resource.SCHEDULE, action: Action.READ },
      { resource: Resource.SCHEDULE, action: Action.UPDATE },
      
      // Permisiuni pentru prognoză
      { resource: Resource.FORECAST, action: Action.READ },
    ],
  },
  
  // Utilizator
  {
    name: UserRole.USER,
    displayName: 'Utilizator',
    description: 'Poate vizualiza și actualiza proiecte și inventar',
    permissions: [
      // Permisiuni pentru dashboard
      { resource: Resource.DASHBOARD, action: Action.READ },
      
      // Permisiuni pentru proiecte
      { resource: Resource.PROJECT, action: Action.READ },
      {
        resource: Resource.PROJECT,
        action: Action.UPDATE,
        conditions: { isProjectMember: true },
      },
      {
        resource: Resource.PROJECT,
        action: Action.COMMENT,
        conditions: { isProjectMember: true },
      },
      
      // Permisiuni pentru inventar
      { resource: Resource.INVENTORY, action: Action.READ },
      {
        resource: Resource.INVENTORY,
        action: Action.UPDATE,
        conditions: { isProjectMember: true },
      },
      
      // Permisiuni pentru materiale
      { resource: Resource.MATERIAL, action: Action.READ },
      {
        resource: Resource.MATERIAL,
        action: Action.UPDATE,
        conditions: { isProjectMember: true },
      },
      
      // Permisiuni pentru furnizori
      { resource: Resource.SUPPLIER, action: Action.READ },
      
      // Permisiuni pentru echipe
      { resource: Resource.TEAM, action: Action.READ },
      
      // Permisiuni pentru sarcini
      { resource: Resource.TASK, action: Action.READ },
      {
        resource: Resource.TASK,
        action: Action.UPDATE,
        conditions: { isAssignee: true },
      },
      {
        resource: Resource.TASK,
        action: Action.COMMENT,
        conditions: { isProjectMember: true },
      },
      
      // Permisiuni pentru rapoarte
      { resource: Resource.REPORT, action: Action.READ },
      
      // Permisiuni pentru notificări
      { resource: Resource.NOTIFICATION, action: Action.READ },
      
      // Permisiuni pentru calendar
      { resource: Resource.CALENDAR, action: Action.READ },
      
      // Permisiuni pentru documente
      { resource: Resource.DOCUMENT, action: Action.READ },
      { resource: Resource.DOCUMENT, action: Action.DOWNLOAD },
      {
        resource: Resource.DOCUMENT,
        action: Action.UPLOAD,
        conditions: { isProjectMember: true },
      },
    ],
  },
  
  // Oaspete
  {
    name: UserRole.GUEST,
    displayName: 'Oaspete',
    description: 'Poate vizualiza proiecte și rapoarte publice',
    permissions: [
      // Permisiuni pentru dashboard
      { resource: Resource.DASHBOARD, action: Action.READ },
      
      // Permisiuni pentru proiecte
      {
        resource: Resource.PROJECT,
        action: Action.READ,
        conditions: { isPublic: true },
      },
      
      // Permisiuni pentru rapoarte
      {
        resource: Resource.REPORT,
        action: Action.READ,
        conditions: { isPublic: true },
      },
    ],
  },
];

// Exportăm regulile
export default permissionRules;
