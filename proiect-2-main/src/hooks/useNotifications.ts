import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '@/lib/notification-service';

/**
 * Hook pentru utilizarea serviciului de notificări în componente
 */
export function useNotifications() {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  // Verifică suportul și permisiunea la montarea componentei
  useEffect(() => {
    const supported = notificationService.areNotificationsSupported();
    setIsSupported(supported);
    
    if (supported) {
      setHasPermission(notificationService.hasPermission());
    }
  }, []);

  // Funcție pentru solicitarea permisiunii
  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;
    
    try {
    const granted = await notificationService.requestPermission();
    } catch (error) {
      // Handle error appropriately
    }
    setHasPermission(granted);
    return granted;
  }, [isSupported]);

  // Funcții pentru afișarea notificărilor
  const showNotification = useCallback(
    async (title: string, options?: { body?: string; onClick?: () => void }) => {
      if (!isSupported) return null;
      
      if (!hasPermission) {
        try {
        const granted = await requestPermission();
        } catch (error) {
          // Handle error appropriately
        }
        if (!granted) return null;
      }
      
      return notificationService.showNotification({
        title,
        body: options?.body,
        onClick: options?.onClick,
      });
    },
    [isSupported, hasPermission, requestPermission]
  );

  const showSuccess = useCallback(
    async (title: string, message?: string, onClick?: () => void) => {
      if (!isSupported) return null;
      
      if (!hasPermission) {
        try {
        const granted = await requestPermission();
        } catch (error) {
          // Handle error appropriately
        }
        if (!granted) return null;
      }
      
      return notificationService.showSuccess(title, message, onClick);
    },
    [isSupported, hasPermission, requestPermission]
  );

  const showError = useCallback(
    async (title: string, message?: string, onClick?: () => void) => {
      if (!isSupported) return null;
      
      if (!hasPermission) {
        try {
        const granted = await requestPermission();
        } catch (error) {
          // Handle error appropriately
        }
        if (!granted) return null;
      }
      
      return notificationService.showError(title, message, onClick);
    },
    [isSupported, hasPermission, requestPermission]
  );

  const showInfo = useCallback(
    async (title: string, message?: string, onClick?: () => void) => {
      if (!isSupported) return null;
      
      if (!hasPermission) {
        try {
        const granted = await requestPermission();
        } catch (error) {
          // Handle error appropriately
        }
        if (!granted) return null;
      }
      
      return notificationService.showInfo(title, message, onClick);
    },
    [isSupported, hasPermission, requestPermission]
  );

  return {
    isSupported,
    hasPermission,
    requestPermission,
    showNotification,
    showSuccess,
    showError,
    showInfo,
  };
}
