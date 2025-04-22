import React, { createContext, useContext, useState, useEffect } from "react";
import { offlineService } from "@/lib/offline-service";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

// Definim tipul pentru contextul offline
interface OfflineContextType {
  isOnline: boolean;
  isOfflineMode: boolean;
  pendingOperationsCount: number;
  toggleOfflineMode: () => void;
  syncData: () => Promise<void>;
}

// Creăm contextul
const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

// Provider pentru contextul offline
export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState<boolean>(offlineService.isOnline());
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [pendingOperationsCount, setPendingOperationsCount] =
    useState<number>(0);

  // Funcție pentru actualizarea numărului de operațiuni în așteptare
  const updatePendingOperationsCount = () => {
    const count = offlineService.getPendingOperationsCount();
    setPendingOperationsCount(count);
  };

  // Funcție pentru gestionarea evenimentului de conectare online
  const handleOnline = () => {
    setIsOnline(true);

    // Limităm notificările pentru a îmbunătăți performanța
    // Folosim un debounce pentru a evita notificări multiple în timp scurt
    const lastToastTime = localStorage.getItem("lastOnlineToastTime");
    const now = Date.now();

    if (!lastToastTime || now - parseInt(lastToastTime) > 60000) {
      // 1 minut între notificări
      localStorage.setItem("lastOnlineToastTime", now.toString());

      toast({
        title: t("offline.onlineTitle", "You are online"),
        description: t(
          "offline.onlineDescription",
          "Your device is now connected to the internet."
        ),
        variant: "default",
      });

      // Dacă avem operațiuni în așteptare, întrebăm utilizatorul dacă dorește să sincronizeze
      if (pendingOperationsCount > 0) {
        toast({
          title: t("offline.pendingOperationsTitle", "Pending changes"),
          description: t(
            "offline.pendingOperationsDescription",
            "You have {{count}} pending changes. Would you like to sync them now?",
            { count: pendingOperationsCount }
          ),
          variant: "default",
          action: (
            <button
              onClick={syncData}
              className="bg-primary text-white px-3 py-1 rounded-md text-xs font-medium"
            >
              {t("offline.syncNow", "Sync Now")}
            </button>
          ),
        });
      }
    }
  };

  // Funcție pentru gestionarea evenimentului de deconectare
  const handleOffline = () => {
    setIsOnline(false);

    // Limităm notificările pentru a îmbunătăți performanța
    const lastToastTime = localStorage.getItem("lastOfflineToastTime");
    const now = Date.now();

    if (!lastToastTime || now - parseInt(lastToastTime) > 60000) {
      // 1 minut între notificări
      localStorage.setItem("lastOfflineToastTime", now.toString());

      toast({
        title: t("offline.offlineTitle", "You are offline"),
        description: t(
          "offline.offlineDescription",
          "Your device is not connected to the internet."
        ),
        variant: "destructive",
      });
    }
  };

  // Adăugăm listenerii pentru schimbările de conectivitate
  useEffect(() => {
    offlineService.addConnectivityListeners(handleOnline, handleOffline);
    updatePendingOperationsCount();

    return () => {
      offlineService.removeConnectivityListeners(handleOnline, handleOffline);
    };
  }, []);

  // Actualizăm numărul de operațiuni în așteptare când se schimbă starea de conectivitate
  // Folosim un debounce pentru a evita actualizări multiple în timp scurt
  useEffect(() => {
    // Folosim un timeout pentru a reduce frecvența actualizărilor
    const timeoutId = setTimeout(() => {
      updatePendingOperationsCount();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [isOnline]);

  // Funcție pentru comutarea modului offline
  const toggleOfflineMode = () => {
    setIsOfflineMode(!isOfflineMode);
    toast({
      title: !isOfflineMode
        ? t("offline.offlineModeEnabledTitle", "Offline Mode Enabled")
        : t("offline.offlineModeDisabledTitle", "Offline Mode Disabled"),
      description: !isOfflineMode
        ? t(
            "offline.offlineModeEnabledDescription",
            "You can now work offline. Changes will be synced when you reconnect."
          )
        : t(
            "offline.offlineModeDisabledDescription",
            "Your changes will be synced immediately."
          ),
      variant: "default",
    });
  };

  // Funcție pentru sincronizarea datelor
  const syncData = async () => {
    if (!isOnline) {
      toast({
        title: t("offline.cannotSyncTitle", "Cannot Sync"),
        description: t(
          "offline.cannotSyncDescription",
          "You are offline. Please connect to the internet to sync your changes."
        ),
        variant: "destructive",
      });
      return;
    }

    toast({
      title: t("offline.syncingTitle", "Syncing"),
      description: t("offline.syncingDescription", "Syncing your changes..."),
      variant: "default",
    });

    try {
      const result = await offlineService.syncOfflineOperations();

      if (result.success) {
        toast({
          title: t("offline.syncSuccessTitle", "Sync Complete"),
          description: t(
            "offline.syncSuccessDescription",
            "Successfully synced {{count}} changes.",
            { count: result.syncedCount }
          ),
          variant: "default",
        });
      } else {
        toast({
          title: t("offline.syncPartialTitle", "Sync Partially Complete"),
          description: t(
            "offline.syncPartialDescription",
            "Synced {{syncedCount}} changes, but {{failedCount}} failed.",
            {
              syncedCount: result.syncedCount,
              failedCount: result.failedCount,
            }
          ),
          variant: "destructive",
        });
      }

      // Actualizăm numărul de operațiuni în așteptare
      updatePendingOperationsCount();
    } catch (error) {
      // Removed console statement
      toast({
        title: t("offline.syncErrorTitle", "Sync Error"),
        description: t(
          "offline.syncErrorDescription",
          "An error occurred while syncing your changes."
        ),
        variant: "destructive",
      });
    }
  };

  const value = {
    isOnline,
    isOfflineMode,
    pendingOperationsCount,
    toggleOfflineMode,
    syncData,
  };

  return (
    <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>
  );
}

// Hook pentru utilizarea contextului offline
export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error("useOffline must be used within an OfflineProvider");
  }
  return context;
}
