/**
 * Model pentru notificări
 * Acest fișier conține modelele pentru notificări
 */

import { ID } from './index';
import { User } from './user.model';

/**
 * Tipurile de notificări
 */
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

/**
 * Prioritățile notificărilor
 */
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Categoriile de notificări
 */
export enum NotificationCategory {
  SYSTEM = 'system',
  AUTH = 'auth',
  PROJECT = 'project',
  INVENTORY = 'inventory',
  TASK = 'task',
  USER = 'user',
  REPORT = 'report',
  OTHER = 'other',
}

/**
 * Interfața pentru acțiunea notificării
 */
export interface NotificationAction {
  id: string;
  label: string;
  action: string;
  icon?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
}

/**
 * Interfața pentru notificare
 */
export interface Notification {
  id: ID;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  category: NotificationCategory;
  user_id?: ID;
  user?: User;
  read: boolean;
  link?: string;
  icon?: string;
  actions?: NotificationAction[];
  data?: any;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Interfața pentru crearea unei notificări
 */
export interface CreateNotificationInput {
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  category: NotificationCategory;
  user_id?: ID;
  read?: boolean;
  link?: string;
  icon?: string;
  actions?: NotificationAction[];
  data?: any;
  expires_at?: string;
}

/**
 * Interfața pentru actualizarea unei notificări
 */
export interface UpdateNotificationInput {
  title?: string;
  message?: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  category?: NotificationCategory;
  user_id?: ID;
  read?: boolean;
  link?: string;
  icon?: string;
  actions?: NotificationAction[];
  data?: any;
  expires_at?: string;
}

/**
 * Interfața pentru filtrarea notificărilor
 */
export interface NotificationFilter {
  search?: string;
  type?: NotificationType | NotificationType[];
  priority?: NotificationPriority | NotificationPriority[];
  category?: NotificationCategory | NotificationCategory[];
  user_id?: ID | ID[];
  read?: boolean;
  created_at_start?: string;
  created_at_end?: string;
  updated_at_start?: string;
  updated_at_end?: string;
  expires_at_start?: string;
  expires_at_end?: string;
}

/**
 * Interfața pentru sortarea notificărilor
 */
export interface NotificationSort {
  field: keyof Notification;
  direction: 'asc' | 'desc';
}

/**
 * Interfața pentru paginarea notificărilor
 */
export interface NotificationPagination {
  page: number;
  limit: number;
}

/**
 * Interfața pentru răspunsul paginat de notificări
 */
export interface NotificationPaginatedResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default {
  NotificationType,
  NotificationPriority,
  NotificationCategory,
};
