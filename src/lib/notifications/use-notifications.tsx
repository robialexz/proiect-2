/**
 * Hook pentru notificări
 * Acest fișier conține un hook pentru lucrul cu notificări
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createNotification, Notification, NotificationOptions } from './notification-utils';
import { useAuthStore } from '@/store';
import { supabase } from '@/lib/supabase';
import { NotificationType, NotificationPriority, NotificationCategory } from '@/models/notification.model';

/**
 * Interfața pentru contextul de notificări
 */
interface NotificationContextType {
  notifications: Notification[];
  showNotification: (title: string, message: string, options?: NotificationOptions) => string;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  dismissNotification: (id: string) => void;
  dismissAllNotifications: () => void;
}

/**
 * Contextul de notificări
 */
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Provider pentru notificări
 * @param props Proprietățile pentru provider
 * @returns Provider-ul pentru notificări
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  // Starea pentru notificări
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Obținem utilizatorul autentificat
  const { user } = useAuthStore();
  
  /**
   * Afișează o notificare
   * @param title Titlul notificării
   * @param message Mesajul notificării
   * @param options Opțiunile notificării
   * @returns ID-ul notificării
   */
  const showNotification = useCallback(
    (title: string, message: string, options: NotificationOptions = {}): string => {
      const notification = createNotification(title, message, options);
      
      setNotifications((prevNotifications) => [...prevNotifications, notification]);
      
      // Salvăm notificarea în baza de date dacă utilizatorul este autentificat
      if (user) {
        saveNotificationToDatabase(notification, user.id);
      }
      
      // Setăm un timer pentru închiderea automată a notificării
      if (notification.autoClose) {
        const timeout = typeof notification.autoClose === 'number' ? notification.autoClose : 5000;
        
        setTimeout(() => {
          dismissNotification(notification.id);
        }, timeout);
      }
      
      return notification.id;
    },
    [user]
  );
  
  /**
   * Actualizează o notificare
   * @param id ID-ul notificării
   * @param updates Actualizările pentru notificare
   */
  const updateNotification = useCallback((id: string, updates: Partial<Notification>) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === id ? { ...notification, ...updates } : notification
      )
    );
  }, []);
  
  /**
   * Închide o notificare
   * @param id ID-ul notificării
   */
  const dismissNotification = useCallback((id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  }, []);
  
  /**
   * Închide toate notificările
   */
  const dismissAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  /**
   * Salvează o notificare în baza de date
   * @param notification Notificarea de salvat
   * @param userId ID-ul utilizatorului
   */
  const saveNotificationToDatabase = async (notification: Notification, userId: string) => {
    try {
      await supabase.from('notifications').insert([
        {
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority,
          category: notification.category,
          user_id: userId,
          read: false,
          icon: notification.icon,
          data: notification.data,
          created_at: notification.createdAt.toISOString(),
        },
      ]);
    } catch (error) {
      // Removed console statement
    }
  };
  
  // Efect pentru încărcarea notificărilor din baza de date
  useEffect(() => {
    if (!user) return;
    
    const loadNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .eq('read', false)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        
        if (data) {
          const loadedNotifications = data.map((item) => ({
            id: item.id,
            title: item.title,
            message: item.message,
            type: item.type as NotificationType,
            priority: item.priority as NotificationPriority,
            category: item.category as NotificationCategory,
            autoClose: false,
            closeButton: true,
            icon: item.icon,
            position: 'top-right' as const,
            data: item.data,
            createdAt: new Date(item.created_at),
          }));
          
          setNotifications((prevNotifications) => [
            ...prevNotifications,
            ...loadedNotifications,
          ]);
        }
      } catch (error) {
        // Removed console statement
      }
    };
    
    loadNotifications();
    
    // Setăm un canal pentru notificări în timp real
    const notificationsChannel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as any;
          
          const notification: Notification = {
            id: newNotification.id,
            title: newNotification.title,
            message: newNotification.message,
            type: newNotification.type as NotificationType,
            priority: newNotification.priority as NotificationPriority,
            category: newNotification.category as NotificationCategory,
            autoClose: false,
            closeButton: true,
            icon: newNotification.icon,
            position: 'top-right',
            data: newNotification.data,
            createdAt: new Date(newNotification.created_at),
          };
          
          setNotifications((prevNotifications) => [...prevNotifications, notification]);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(notificationsChannel);
    };
  }, [user]);
  
  // Valoarea contextului
  const contextValue = {
    notifications,
    showNotification,
    updateNotification,
    dismissNotification,
    dismissAllNotifications,
  };
  
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook pentru utilizarea notificărilor
 * @returns Funcții pentru lucrul cu notificări
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications trebuie utilizat în interiorul unui NotificationProvider');
  }
  
  return context;
}

// Exportăm hook-ul și provider-ul
export default {
  NotificationProvider,
  useNotifications,
};
