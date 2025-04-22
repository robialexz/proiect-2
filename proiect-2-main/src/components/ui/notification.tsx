import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Tipuri pentru notificări
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // în milisecunde
  dismissible?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// Context pentru notificări
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider pentru notificări
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification = {
      id,
      dismissible: true,
      duration: 5000, // 5 secunde implicit
      ...notification,
    };
    
    setNotifications((prev) => [...prev, newNotification]);
    
    // Eliminăm automat notificarea după durata specificată
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Hook pentru utilizarea notificărilor
export const useNotification = () => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
};

// Componenta pentru afișarea unei notificări
const NotificationItem: React.FC<{
  notification: Notification;
  onClose: () => void;
}> = ({ notification, onClose }) => {
  const { type, title, message, dismissible } = notification;
  
  // Determinăm iconul și culorile în funcție de tip
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          containerClass: 'bg-green-50 dark:bg-green-900/20 border-green-500',
          titleClass: 'text-green-800 dark:text-green-400',
          messageClass: 'text-green-700 dark:text-green-300',
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          containerClass: 'bg-red-50 dark:bg-red-900/20 border-red-500',
          titleClass: 'text-red-800 dark:text-red-400',
          messageClass: 'text-red-700 dark:text-red-300',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
          containerClass: 'bg-amber-50 dark:bg-amber-900/20 border-amber-500',
          titleClass: 'text-amber-800 dark:text-amber-400',
          messageClass: 'text-amber-700 dark:text-amber-300',
        };
      case 'info':
      default:
        return {
          icon: <Info className="h-5 w-5 text-blue-500" />,
          containerClass: 'bg-blue-50 dark:bg-blue-900/20 border-blue-500',
          titleClass: 'text-blue-800 dark:text-blue-400',
          messageClass: 'text-blue-700 dark:text-blue-300',
        };
    }
  };
  
  const styles = getTypeStyles();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={`flex items-start p-4 mb-3 rounded-lg border-l-4 shadow-md ${styles.containerClass} dark:bg-opacity-10`}
    >
      <div className="flex-shrink-0 mr-3 mt-0.5">
        {styles.icon}
      </div>
      <div className="flex-1 mr-2">
        <h3 className={`font-medium ${styles.titleClass}`}>{title}</h3>
        <div className={`text-sm mt-1 ${styles.messageClass}`}>{message}</div>
      </div>
      {dismissible && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          aria-label="Close notification"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </motion.div>
  );
};

// Container pentru toate notificările
const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();
  
  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationProvider;
