/**
 * Utilități pentru notificări
 * Acest fișier conține funcții pentru lucrul cu notificări
 */

import { NotificationType, NotificationPriority, NotificationCategory } from '@/models/notification.model';

/**
 * Interfața pentru opțiunile de notificare
 */
export interface NotificationOptions {
  type?: 'info' | 'success' | 'warning' | 'error';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  autoClose?: boolean | number;
  closeButton?: boolean;
  icon?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  actions?: Array<{
    id: string;
    label: string;
    action: () => void;
    variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  }>;
  data?: Record<string, any>;
}

/**
 * Interfața pentru o notificare
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  category: NotificationCategory;
  autoClose: boolean | number;
  closeButton: boolean;
  icon?: string;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  actions?: Array<{
    id: string;
    label: string;
    action: () => void;
    variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  }>;
  data?: Record<string, any>;
  createdAt: Date;
}

/**
 * Opțiunile implicite pentru notificări
 */
export const defaultNotificationOptions: Required<Omit<NotificationOptions, 'actions' | 'data' | 'icon'>> = {
  type: 'info',
  priority: 'medium',
  category: 'system',
  autoClose: 5000,
  closeButton: true,
  position: 'top-right',
};

/**
 * Creează o notificare
 * @param title Titlul notificării
 * @param message Mesajul notificării
 * @param options Opțiunile notificării
 * @returns Notificarea creată
 */
export function createNotification(
  title: string,
  message: string,
  options: NotificationOptions = {}
): Notification {
  const id = `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  return {
    id,
    title,
    message,
    type: mapToNotificationType(options.type || defaultNotificationOptions.type),
    priority: mapToNotificationPriority(options.priority || defaultNotificationOptions.priority),
    category: mapToNotificationCategory(options.category || defaultNotificationOptions.category),
    autoClose: options.autoClose !== undefined ? options.autoClose : defaultNotificationOptions.autoClose,
    closeButton: options.closeButton !== undefined ? options.closeButton : defaultNotificationOptions.closeButton,
    icon: options.icon,
    position: options.position || defaultNotificationOptions.position,
    actions: options.actions,
    data: options.data,
    createdAt: new Date(),
  };
}

/**
 * Mapează tipul de notificare
 * @param type Tipul de notificare
 * @returns Tipul de notificare mapat
 */
function mapToNotificationType(type: string): NotificationType {
  switch (type) {
    case 'info':
      return NotificationType.INFO;
    case 'success':
      return NotificationType.SUCCESS;
    case 'warning':
      return NotificationType.WARNING;
    case 'error':
      return NotificationType.ERROR;
    default:
      return NotificationType.INFO;
  }
}

/**
 * Mapează prioritatea notificării
 * @param priority Prioritatea notificării
 * @returns Prioritatea notificării mapată
 */
function mapToNotificationPriority(priority: string): NotificationPriority {
  switch (priority) {
    case 'low':
      return NotificationPriority.LOW;
    case 'medium':
      return NotificationPriority.MEDIUM;
    case 'high':
      return NotificationPriority.HIGH;
    case 'urgent':
      return NotificationPriority.URGENT;
    default:
      return NotificationPriority.MEDIUM;
  }
}

/**
 * Mapează categoria notificării
 * @param category Categoria notificării
 * @returns Categoria notificării mapată
 */
function mapToNotificationCategory(category: string): NotificationCategory {
  switch (category) {
    case 'system':
      return NotificationCategory.SYSTEM;
    case 'auth':
      return NotificationCategory.AUTH;
    case 'project':
      return NotificationCategory.PROJECT;
    case 'inventory':
      return NotificationCategory.INVENTORY;
    case 'task':
      return NotificationCategory.TASK;
    case 'user':
      return NotificationCategory.USER;
    case 'report':
      return NotificationCategory.REPORT;
    default:
      return NotificationCategory.OTHER;
  }
}

/**
 * Obține iconița pentru un tip de notificare
 * @param type Tipul de notificare
 * @returns Iconița pentru tipul de notificare
 */
export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case NotificationType.INFO:
      return 'info';
    case NotificationType.SUCCESS:
      return 'check-circle';
    case NotificationType.WARNING:
      return 'alert-triangle';
    case NotificationType.ERROR:
      return 'alert-circle';
    default:
      return 'bell';
  }
}

/**
 * Obține culoarea pentru un tip de notificare
 * @param type Tipul de notificare
 * @returns Culoarea pentru tipul de notificare
 */
export function getNotificationColor(type: NotificationType): string {
  switch (type) {
    case NotificationType.INFO:
      return 'blue';
    case NotificationType.SUCCESS:
      return 'green';
    case NotificationType.WARNING:
      return 'yellow';
    case NotificationType.ERROR:
      return 'red';
    default:
      return 'gray';
  }
}

/**
 * Obține culoarea pentru o prioritate de notificare
 * @param priority Prioritatea notificării
 * @returns Culoarea pentru prioritatea notificării
 */
export function getNotificationPriorityColor(priority: NotificationPriority): string {
  switch (priority) {
    case NotificationPriority.LOW:
      return 'gray';
    case NotificationPriority.MEDIUM:
      return 'blue';
    case NotificationPriority.HIGH:
      return 'orange';
    case NotificationPriority.URGENT:
      return 'red';
    default:
      return 'gray';
  }
}

/**
 * Obține iconița pentru o prioritate de notificare
 * @param priority Prioritatea notificării
 * @returns Iconița pentru prioritatea notificării
 */
export function getNotificationPriorityIcon(priority: NotificationPriority): string {
  switch (priority) {
    case NotificationPriority.LOW:
      return 'arrow-down';
    case NotificationPriority.MEDIUM:
      return 'minus';
    case NotificationPriority.HIGH:
      return 'arrow-up';
    case NotificationPriority.URGENT:
      return 'alert-triangle';
    default:
      return 'minus';
  }
}

/**
 * Obține iconița pentru o categorie de notificare
 * @param category Categoria notificării
 * @returns Iconița pentru categoria notificării
 */
export function getNotificationCategoryIcon(category: NotificationCategory): string {
  switch (category) {
    case NotificationCategory.SYSTEM:
      return 'settings';
    case NotificationCategory.AUTH:
      return 'key';
    case NotificationCategory.PROJECT:
      return 'briefcase';
    case NotificationCategory.INVENTORY:
      return 'package';
    case NotificationCategory.TASK:
      return 'check-square';
    case NotificationCategory.USER:
      return 'user';
    case NotificationCategory.REPORT:
      return 'file-text';
    default:
      return 'bell';
  }
}

// Exportăm toate funcțiile
export default {
  createNotification,
  getNotificationIcon,
  getNotificationColor,
  getNotificationPriorityColor,
  getNotificationPriorityIcon,
  getNotificationCategoryIcon,
  defaultNotificationOptions,
};
