/**
 * Provider pentru sistemul de notificări
 * Acest fișier conține provider-ul pentru sistemul de notificări
 */

import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useNotificationStore } from './notification-store';
import { 
  Notification, 
  NotificationType, 
  NotificationPriority, 
  NotificationCategory,
  NotificationOptions
} from './notification-types';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/store';

// Interfața pentru contextul de notificări
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  showNotification: (title: string, message: string, options?: NotificationOptions) => string;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

// Creăm contextul de notificări
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Provider pentru sistemul de notificări
 * @param props Proprietățile pentru provider
 * @returns Provider-ul pentru sistemul de notificări
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  // Obținem store-ul de notificări
  const {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    clearExpiredNotifications,
    fetchNotifications,
  } = useNotificationStore();
  
  // Obținem toast-ul
  const { toast } = useToast();
  
  // Obținem utilizatorul curent
  const { user } = useAuthStore();
  
  // Funcție pentru a afișa o notificare
  const showNotification = useCallback((
    title: string,
    message: string,
    options: NotificationOptions = {}
  ) => {
    // Adăugăm utilizatorul curent la opțiuni
    if (user) {
      options.userId = user.id;
    }
    
    // Adăugăm notificarea în store
    const id = addNotification(title, message, options);
    
    // Afișăm toast-ul pentru notificările care nu sunt autoclose
    if (options.autoClose !== false) {
      // Determinăm varianta toast-ului în funcție de tipul notificării
      const variant = options.type === NotificationType.ERROR
        ? 'destructive'
        : options.type === NotificationType.SUCCESS
          ? 'success'
          : options.type === NotificationType.WARNING
            ? 'warning'
            : 'default';
      
      // Afișăm toast-ul
      toast({
        title,
        description: message,
        variant,
      });
    }
    
    return id;
  }, [addNotification, toast, user]);
  
  // Efect pentru a încărca notificările la montare
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [fetchNotifications, user]);
  
  // Efect pentru a curăța notificările expirate la fiecare minut
  useEffect(() => {
    const interval = setInterval(() => {
      clearExpiredNotifications();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [clearExpiredNotifications]);
  
  // Valoarea contextului
  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    showNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
  
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <Toaster />
    </NotificationContext.Provider>
  );
}

/**
 * Hook pentru a utiliza sistemul de notificări
 * @returns Contextul de notificări
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications trebuie utilizat în interiorul unui NotificationProvider');
  }
  
  return context;
}

export default {
  NotificationProvider,
  useNotifications,
};
