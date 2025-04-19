import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNotification } from '@/components/ui/notification';
import { Wifi, WifiOff } from 'lucide-react';

// Tipuri pentru contextul offline
interface OfflineContextType {
  isOffline: boolean;
  lastOnlineAt: Date | null;
  lastOfflineAt: Date | null;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
  pendingActions: PendingAction[];
  addPendingAction: (action: Omit<PendingAction, 'id' | 'createdAt'>) => string;
  removePendingAction: (id: string) => void;
  executeAllPendingActions: () => Promise<void>;
  syncStatus: 'idle' | 'syncing' | 'error';
}

// Tipuri pentru acțiunile în așteptare
export interface PendingAction {
  id: string;
  type: string;
  payload: any;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  createdAt: Date;
  retryCount: number;
  maxRetries: number;
  execute: () => Promise<any>;
}

// Context pentru starea offline
const EnhancedOfflineContext = createContext<OfflineContextType | undefined>(undefined);

// Provider pentru starea offline
export const EnhancedOfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(navigator.onLine ? new Date() : null);
  const [lastOfflineAt, setLastOfflineAt] = useState<Date | null>(navigator.onLine ? null : new Date());
  const [connectionQuality, setConnectionQuality] = useState<OfflineContextType['connectionQuality']>(
    navigator.onLine ? 'excellent' : 'offline'
  );
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [syncStatus, setSyncStatus] = useState<OfflineContextType['syncStatus']>('idle');
  
  const { success, error, warning } = useNotification();
  
  // Funcție pentru a adăuga o acțiune în așteptare
  const addPendingAction = useCallback((action: Omit<PendingAction, 'id' | 'createdAt'>) => {
    const id = `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newAction: PendingAction = {
      ...action,
      id,
      createdAt: new Date(),
    };
    
    setPendingActions((prev) => [...prev, newAction]);
    
    // Salvăm acțiunile în localStorage
    try {
      const storedActions = JSON.parse(localStorage.getItem('pendingActions') || '[]');
      localStorage.setItem('pendingActions', JSON.stringify([...storedActions, newAction]));
    } catch (err) {
      console.error('Failed to store pending action in localStorage:', err);
    }
    
    return id;
  }, []);
  
  // Funcție pentru a elimina o acțiune în așteptare
  const removePendingAction = useCallback((id: string) => {
    setPendingActions((prev) => prev.filter((action) => action.id !== id));
    
    // Actualizăm localStorage
    try {
      const storedActions = JSON.parse(localStorage.getItem('pendingActions') || '[]');
      localStorage.setItem(
        'pendingActions',
        JSON.stringify(storedActions.filter((action: PendingAction) => action.id !== id))
      );
    } catch (err) {
      console.error('Failed to remove pending action from localStorage:', err);
    }
  }, []);
  
  // Funcție pentru a executa toate acțiunile în așteptare
  const executeAllPendingActions = useCallback(async () => {
    if (isOffline || pendingActions.length === 0 || syncStatus === 'syncing') {
      return;
    }
    
    setSyncStatus('syncing');
    
    try {
      // Notificăm utilizatorul că sincronizăm datele
      if (pendingActions.length > 0) {
        warning(
          'Sincronizare în curs',
          `Se sincronizează ${pendingActions.length} acțiuni în așteptare...`,
          { duration: 3000 }
        );
      }
      
      // Executăm acțiunile în ordine
      const results = [];
      const failedActions = [];
      
      for (const action of pendingActions) {
        try {
          const result = await action.execute();
          results.push(result);
          removePendingAction(action.id);
        } catch (err) {
          console.error(`Failed to execute pending action ${action.id}:`, err);
          
          // Incrementăm contorul de reîncercări
          const updatedAction = {
            ...action,
            retryCount: action.retryCount + 1,
          };
          
          // Dacă am depășit numărul maxim de reîncercări, eliminăm acțiunea
          if (updatedAction.retryCount >= updatedAction.maxRetries) {
            removePendingAction(action.id);
            error(
              'Sincronizare eșuată',
              `Nu s-a putut executa acțiunea "${action.type}". Acțiunea a fost eliminată.`,
              { duration: 5000 }
            );
          } else {
            // Altfel, actualizăm acțiunea și o păstrăm pentru reîncercare
            failedActions.push(updatedAction);
            setPendingActions((prev) =>
              prev.map((a) => (a.id === action.id ? updatedAction : a))
            );
          }
        }
      }
      
      // Actualizăm starea
      setSyncStatus('idle');
      
      // Notificăm utilizatorul
      if (results.length > 0 && failedActions.length === 0) {
        success(
          'Sincronizare completă',
          `S-au sincronizat cu succes ${results.length} acțiuni.`,
          { duration: 3000 }
        );
      } else if (results.length > 0 && failedActions.length > 0) {
        warning(
          'Sincronizare parțială',
          `S-au sincronizat ${results.length} acțiuni, dar ${failedActions.length} acțiuni au eșuat și vor fi reîncercate.`,
          { duration: 5000 }
        );
      } else if (results.length === 0 && failedActions.length > 0) {
        error(
          'Sincronizare eșuată',
          `Toate cele ${failedActions.length} acțiuni au eșuat și vor fi reîncercate.`,
          { duration: 5000 }
        );
      }
    } catch (err) {
      console.error('Failed to execute pending actions:', err);
      setSyncStatus('error');
      
      // Notificăm utilizatorul
      error(
        'Eroare de sincronizare',
        'A apărut o eroare în timpul sincronizării. Vă rugăm să încercați din nou mai târziu.',
        { duration: 5000 }
      );
    }
  }, [isOffline, pendingActions, syncStatus, removePendingAction, success, error, warning]);
  
  // Funcție pentru a măsura calitatea conexiunii
  const measureConnectionQuality = useCallback(async () => {
    if (!navigator.onLine) {
      setConnectionQuality('offline');
      return;
    }
    
    try {
      const startTime = Date.now();
      const response = await fetch('/api/ping', { method: 'GET', cache: 'no-store' });
      const endTime = Date.now();
      
      if (!response.ok) {
        setConnectionQuality('poor');
        return;
      }
      
      const latency = endTime - startTime;
      
      if (latency < 100) {
        setConnectionQuality('excellent');
      } else if (latency < 300) {
        setConnectionQuality('good');
      } else {
        setConnectionQuality('poor');
      }
    } catch (err) {
      console.error('Failed to measure connection quality:', err);
      setConnectionQuality('poor');
    }
  }, []);
  
  // Gestionăm evenimentele de conectivitate
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setLastOnlineAt(new Date());
      measureConnectionQuality();
      
      // Notificăm utilizatorul
      success(
        'Conexiune restabilită',
        'Conexiunea la internet a fost restabilită. Datele vor fi sincronizate.',
        {
          icon: <Wifi className="h-5 w-5" />,
          duration: 3000,
        }
      );
      
      // Executăm acțiunile în așteptare
      executeAllPendingActions();
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      setLastOfflineAt(new Date());
      setConnectionQuality('offline');
      
      // Notificăm utilizatorul
      warning(
        'Conexiune pierdută',
        'Conexiunea la internet a fost pierdută. Acțiunile vor fi salvate și sincronizate când conexiunea va fi restabilită.',
        {
          icon: <WifiOff className="h-5 w-5" />,
          duration: 5000,
        }
      );
    };
    
    // Verificăm periodic calitatea conexiunii
    const connectionQualityInterval = setInterval(() => {
      if (navigator.onLine) {
        measureConnectionQuality();
      }
    }, 30000); // 30 secunde
    
    // Adăugăm event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Încărcăm acțiunile din localStorage
    try {
      const storedActions = JSON.parse(localStorage.getItem('pendingActions') || '[]');
      if (storedActions.length > 0) {
        setPendingActions(storedActions);
        
        // Notificăm utilizatorul
        warning(
          'Acțiuni în așteptare',
          `Există ${storedActions.length} acțiuni în așteptare care vor fi sincronizate când conexiunea va fi restabilită.`,
          { duration: 5000 }
        );
      }
    } catch (err) {
      console.error('Failed to load pending actions from localStorage:', err);
    }
    
    // Măsurăm calitatea conexiunii inițiale
    measureConnectionQuality();
    
    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(connectionQualityInterval);
    };
  }, [
    executeAllPendingActions,
    measureConnectionQuality,
    success,
    warning,
  ]);
  
  // Executăm acțiunile în așteptare când conexiunea este restabilită
  useEffect(() => {
    if (!isOffline && pendingActions.length > 0 && syncStatus === 'idle') {
      executeAllPendingActions();
    }
  }, [isOffline, pendingActions, syncStatus, executeAllPendingActions]);
  
  return (
    <EnhancedOfflineContext.Provider
      value={{
        isOffline,
        lastOnlineAt,
        lastOfflineAt,
        connectionQuality,
        pendingActions,
        addPendingAction,
        removePendingAction,
        executeAllPendingActions,
        syncStatus,
      }}
    >
      {children}
      
      {/* Indicator de stare offline */}
      {isOffline && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-amber-900 text-white p-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center space-x-2">
            <WifiOff className="h-4 w-4" />
            <span>
              Sunteți offline. Acțiunile vor fi salvate și sincronizate când conexiunea va fi restabilită.
            </span>
          </div>
        </div>
      )}
      
      {/* Indicator de sincronizare */}
      {!isOffline && syncStatus === 'syncing' && pendingActions.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-blue-900 text-white p-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            <span>
              Se sincronizează {pendingActions.length} acțiuni...
            </span>
          </div>
        </div>
      )}
    </EnhancedOfflineContext.Provider>
  );
};

// Hook pentru utilizarea contextului offline
export const useEnhancedOffline = () => {
  const context = useContext(EnhancedOfflineContext);
  
  if (!context) {
    throw new Error('useEnhancedOffline must be used within an EnhancedOfflineProvider');
  }
  
  return context;
};

export default {
  EnhancedOfflineProvider,
  useEnhancedOffline,
};
