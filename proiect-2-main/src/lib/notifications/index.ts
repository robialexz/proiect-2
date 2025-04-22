/**
 * Exportă sistemul de notificări
 */

// Exportăm tipurile de notificări
export {
  NotificationType,
  NotificationPriority,
  NotificationCategory,
} from "@/models/notification.model";

// Exportăm utilitarele pentru notificări
export {
  createNotification,
  getNotificationIcon,
  getNotificationColor,
  getNotificationPriorityColor,
  getNotificationPriorityIcon,
  getNotificationCategoryIcon,
  defaultNotificationOptions,
} from "./notification-utils";
export type { Notification, NotificationOptions } from "./notification-utils";
export { default as notificationUtils } from "./notification-utils";

// Exportăm store-ul de notificări
export { useNotificationStore } from "./notification-store";

// Exportăm provider-ul de notificări
export { NotificationProvider, useNotifications } from "./use-notifications";
export { default as useNotificationsExport } from "./use-notifications";

// Export implicit pentru compatibilitate
export { useNotifications as default } from "./use-notifications";
