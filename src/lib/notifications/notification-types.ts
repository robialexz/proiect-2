/**
 * Tipuri pentru sistemul de notificări
 * Acest fișier conține tipurile pentru sistemul de notificări
 */

// Tipul de notificare
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

// Prioritatea notificării
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// Categoria notificării
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

// Interfața pentru notificare
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  category: NotificationCategory;
  timestamp: string;
  read: boolean;
  link?: string;
  icon?: string;
  actions?: NotificationAction[];
  data?: Record<string, any>;
  expiresAt?: string;
  userId?: string;
}

// Interfața pentru acțiunea notificării
export interface NotificationAction {
  id: string;
  label: string;
  action: string;
  icon?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
}

// Interfața pentru opțiunile notificării
export interface NotificationOptions {
  type?: NotificationType;
  priority?: NotificationPriority;
  category?: NotificationCategory;
  link?: string;
  icon?: string;
  actions?: NotificationAction[];
  data?: Record<string, any>;
  expiresAt?: string | Date;
  userId?: string;
  autoClose?: boolean | number;
}

// Interfața pentru starea notificărilor
export interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
}

// Funcție pentru a crea o notificare
export function createNotification(
  title: string,
  message: string,
  options: NotificationOptions = {}
): Notification {
  const id = `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const timestamp = new Date().toISOString();
  
  // Calculăm data de expirare
  let expiresAt: string | undefined;
  if (options.expiresAt) {
    expiresAt = options.expiresAt instanceof Date
      ? options.expiresAt.toISOString()
      : options.expiresAt;
  }
  
  return {
    id,
    title,
    message,
    type: options.type || NotificationType.INFO,
    priority: options.priority || NotificationPriority.MEDIUM,
    category: options.category || NotificationCategory.SYSTEM,
    timestamp,
    read: false,
    link: options.link,
    icon: options.icon,
    actions: options.actions,
    data: options.data,
    expiresAt,
    userId: options.userId,
  };
}

export default {
  NotificationType,
  NotificationPriority,
  NotificationCategory,
  createNotification,
};
