import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

// Tipuri pentru notificări
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  }[];
  onClose?: () => void;
  icon?: React.ReactNode;
  progress?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// Context pentru notificări
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider pentru notificări
export const EnhancedNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Adaugă o notificare
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000, // 5 secunde implicit
    };
    
    setNotifications((prev) => [...prev, newNotification]);
    
    // Eliminăm notificarea după durata specificată
    if (newNotification.duration !== Infinity) {
      setTimeout(() => {
        removeNotification(id);
        // Apelăm callback-ul onClose dacă există
        if (notification.onClose) {
          notification.onClose();
        }
      }, newNotification.duration);
    }
    
    return id;
  }, []);

  // Elimină o notificare
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => {
      const notification = prev.find((n) => n.id === id);
      if (notification?.onClose) {
        notification.onClose();
      }
      return prev.filter((n) => n.id !== id);
    });
  }, []);

  // Elimină toate notificările
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Curățăm notificările la demontare
  useEffect(() => {
    return () => {
      setNotifications([]);
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Hook pentru utilizarea notificărilor
export const useNotification = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  const { addNotification, removeNotification, clearNotifications } = context;
  
  // Funcții helper pentru tipurile de notificări
  const success = useCallback(
    (title: string, message: string, options?: Omit<Notification, 'id' | 'type' | 'title' | 'message'>) => {
      return addNotification({
        type: 'success',
        title,
        message,
        icon: <CheckCircle className="h-5 w-5" />,
        ...options,
      });
    },
    [addNotification]
  );
  
  const error = useCallback(
    (title: string, message: string, options?: Omit<Notification, 'id' | 'type' | 'title' | 'message'>) => {
      return addNotification({
        type: 'error',
        title,
        message,
        icon: <AlertCircle className="h-5 w-5" />,
        ...options,
      });
    },
    [addNotification]
  );
  
  const info = useCallback(
    (title: string, message: string, options?: Omit<Notification, 'id' | 'type' | 'title' | 'message'>) => {
      return addNotification({
        type: 'info',
        title,
        message,
        icon: <Info className="h-5 w-5" />,
        ...options,
      });
    },
    [addNotification]
  );
  
  const warning = useCallback(
    (title: string, message: string, options?: Omit<Notification, 'id' | 'type' | 'title' | 'message'>) => {
      return addNotification({
        type: 'warning',
        title,
        message,
        icon: <AlertTriangle className="h-5 w-5" />,
        ...options,
      });
    },
    [addNotification]
  );
  
  return {
    notify: addNotification,
    success,
    error,
    info,
    warning,
    remove: removeNotification,
    clear: clearNotifications,
  };
};

// Componenta pentru afișarea notificărilor
const NotificationContainer: React.FC = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    return null;
  }
  
  const { notifications, removeNotification } = context;
  
  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-4 max-h-screen overflow-hidden pointer-events-none">
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

// Componenta pentru un element de notificare
const NotificationItem: React.FC<{
  notification: Notification;
  onClose: () => void;
}> = ({ notification, onClose }) => {
  const [progress, setProgress] = useState(100);
  const { id, type, title, message, duration, actions, icon, progress: showProgress } = notification;
  
  // Actualizăm progresul
  useEffect(() => {
    if (duration === Infinity || !showProgress) return;
    
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    const updateProgress = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const percentage = (remaining / duration) * 100;
      setProgress(percentage);
      
      if (remaining > 0) {
        requestAnimationFrame(updateProgress);
      }
    };
    
    const animationFrame = requestAnimationFrame(updateProgress);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [duration, showProgress]);
  
  // Determinăm culorile în funcție de tip
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-900/90 border-green-700',
          icon: 'text-green-400',
          progress: 'bg-green-500',
        };
      case 'error':
        return {
          container: 'bg-red-900/90 border-red-700',
          icon: 'text-red-400',
          progress: 'bg-red-500',
        };
      case 'info':
        return {
          container: 'bg-blue-900/90 border-blue-700',
          icon: 'text-blue-400',
          progress: 'bg-blue-500',
        };
      case 'warning':
        return {
          container: 'bg-amber-900/90 border-amber-700',
          icon: 'text-amber-400',
          progress: 'bg-amber-500',
        };
      default:
        return {
          container: 'bg-slate-800/90 border-slate-700',
          icon: 'text-slate-400',
          progress: 'bg-slate-500',
        };
    }
  };
  
  const typeStyles = getTypeStyles();
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'pointer-events-auto w-80 rounded-lg border shadow-lg backdrop-blur-sm',
        typeStyles.container
      )}
    >
      <div className="relative overflow-hidden rounded-lg">
        <div className="p-4">
          <div className="flex items-start">
            <div className={cn('flex-shrink-0', typeStyles.icon)}>
              {icon || <Bell className="h-5 w-5" />}
            </div>
            
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium text-white">{title}</p>
              <p className="mt-1 text-sm text-slate-300">{message}</p>
              
              {actions && actions.length > 0 && (
                <div className="mt-3 flex space-x-2">
                  {actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        action.onClick();
                        onClose();
                      }}
                      className={cn(
                        'rounded px-2 py-1 text-xs font-medium',
                        action.variant === 'outline'
                          ? 'border border-slate-600 text-white hover:bg-slate-700'
                          : action.variant === 'ghost'
                          ? 'text-white hover:bg-slate-700'
                          : 'bg-indigo-600 text-white hover:bg-indigo-500'
                      )}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="ml-4 flex flex-shrink-0">
              <button
                onClick={onClose}
                className="inline-flex rounded-md text-slate-400 hover:text-slate-200 focus:outline-none"
              >
                <span className="sr-only">Închide</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        {showProgress && duration !== Infinity && (
          <div className="h-1 w-full bg-slate-700">
            <div
              className={cn('h-full transition-all', typeStyles.progress)}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default {
  EnhancedNotificationProvider,
  useNotification,
};
