/**
 * Store pentru sistemul de notificări
 * Acest fișier conține store-ul pentru sistemul de notificări
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationCategory,
  NotificationOptions,
  NotificationsState,
  createNotification,
} from "./notification-types";
import { supabase } from "@/lib/supabase";

// Interfața pentru store-ul de notificări
interface NotificationStore extends NotificationsState {
  // Acțiuni
  addNotification: (
    title: string,
    message: string,
    options?: NotificationOptions
  ) => string;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  clearExpiredNotifications: () => void;
  fetchNotifications: () => Promise<void>;
  syncNotifications: () => Promise<void>;
}

// Creăm store-ul de notificări
export const useNotificationStore = create<NotificationStore>()(
  persist(
    immer((set, get) => ({
      // Starea inițială
      notifications: [],
      unreadCount: 0,

      // Acțiuni
      addNotification: (title, message, options = {}) => {
        const notification = createNotification(title, message, options);

        set((state) => {
          // Adăugăm notificarea la începutul listei
          state.notifications.unshift(notification);

          // Actualizăm numărul de notificări necitite
          state.unreadCount = state.notifications.filter((n) => !n.read).length;

          // Dacă avem mai mult de 100 de notificări, le ștergem pe cele mai vechi
          if (state.notifications.length > 100) {
            state.notifications = state.notifications.slice(0, 100);
          }
        });

        // Dacă avem opțiunea autoClose, ștergem notificarea după un timp
        if (options.autoClose) {
          const timeout =
            typeof options.autoClose === "number" ? options.autoClose : 5000;

          setTimeout(() => {
            get().removeNotification(notification.id);
          }, timeout);
        }

        // Sincronizăm notificările cu serverul
        if (options.userId) {
          get().syncNotifications();
        }

        return notification.id;
      },

      removeNotification: (id) => {
        set((state) => {
          // Ștergem notificarea
          state.notifications = state.notifications.filter((n) => n.id !== id);

          // Actualizăm numărul de notificări necitite
          state.unreadCount = state.notifications.filter((n) => !n.read).length;
        });
      },

      markAsRead: (id) => {
        set((state) => {
          // Marcăm notificarea ca citită
          const notification = state.notifications.find((n) => n.id === id);

          if (notification) {
            notification.read = true;
          }

          // Actualizăm numărul de notificări necitite
          state.unreadCount = state.notifications.filter((n) => !n.read).length;
        });

        // Sincronizăm notificările cu serverul
        get().syncNotifications();
      },

      markAllAsRead: () => {
        set((state) => {
          // Marcăm toate notificările ca citite
          state.notifications.forEach((n) => {
            n.read = true;
          });

          // Actualizăm numărul de notificări necitite
          state.unreadCount = 0;
        });

        // Sincronizăm notificările cu serverul
        get().syncNotifications();
      },

      clearNotifications: () => {
        set((state) => {
          // Ștergem toate notificările
          state.notifications = [];
          state.unreadCount = 0;
        });

        // Sincronizăm notificările cu serverul
        get().syncNotifications();
      },

      clearExpiredNotifications: () => {
        const now = new Date().toISOString();

        set((state) => {
          // Ștergem notificările expirate
          state.notifications = state.notifications.filter((n) => {
            return !n.expiresAt || n.expiresAt > now;
          });

          // Actualizăm numărul de notificări necitite
          state.unreadCount = state.notifications.filter((n) => !n.read).length;
        });
      },

      fetchNotifications: async () => {
        try {
          // Obținem utilizatorul curent
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) return;

          // Obținem notificările utilizatorului
          let data = null;
          let error = null;

          try {
            const response = await supabase
              .from("notifications")
              .select("*")
              .eq("user_id", user.id)
              .order("timestamp", { ascending: false });

            data = response.data;
            error = response.error;
          } catch (err) {
            // Handle error appropriately
            error = err;
          }

          if (error) throw error;

          // Convertim notificările
          const notifications: Notification[] = data.map((n) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type as NotificationType,
            priority: n.priority as NotificationPriority,
            category: n.category as NotificationCategory,
            timestamp: n.timestamp,
            read: n.read,
            link: n.link,
            icon: n.icon,
            actions: n.actions,
            data: n.data,
            expiresAt: n.expires_at,
            userId: n.user_id,
          }));

          set((state) => {
            // Actualizăm notificările
            state.notifications = notifications;

            // Actualizăm numărul de notificări necitite
            state.unreadCount = notifications.filter((n) => !n.read).length;
          });
        } catch (error) {
          // Removed console statement
        }
      },

      syncNotifications: async () => {
        try {
          // Obținem utilizatorul curent
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) return;

          // Obținem notificările utilizatorului
          const { notifications } = get();

          // Convertim notificările pentru Supabase
          const notificationsForSupabase = notifications
            .filter((n) => n.userId === user.id)
            .map((n) => ({
              id: n.id,
              title: n.title,
              message: n.message,
              type: n.type,
              priority: n.priority,
              category: n.category,
              timestamp: n.timestamp,
              read: n.read,
              link: n.link,
              icon: n.icon,
              actions: n.actions,
              data: n.data,
              expires_at: n.expiresAt,
              user_id: n.userId,
            }));

          // Ștergem notificările existente
          try {
            await supabase
              .from("notifications")
              .delete()
              .eq("user_id", user.id);
          } catch (error) {
            // Handle error appropriately
          }

          // Adăugăm notificările noi
          if (notificationsForSupabase.length > 0) {
            try {
              await supabase
                .from("notifications")
                .insert(notificationsForSupabase);
            } catch (error) {
              // Handle error appropriately
            }
          }
        } catch (error) {
          // Removed console statement
        }
      },
    })),
    {
      name: "notifications-storage",
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
);

// Exportăm store-ul
export default useNotificationStore;
