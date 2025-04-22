/**
 * Serviciu pentru gestionarea funcționalității offline
 * Acest serviciu permite stocarea și sincronizarea datelor când utilizatorul este offline
 */

import { cacheService } from "./cache-service";
import { supabase } from "./supabase";

// Tipuri pentru operațiunile offline
export type OfflineOperation = {
  id: string;
  table: string;
  operation: "insert" | "update" | "delete";
  data: any;
  timestamp: number;
  synced: boolean;
};

// Namespace pentru operațiunile offline în cache
const OFFLINE_NAMESPACE = "offline_operations";

// Verifică dacă utilizatorul este online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Adaugă un listener pentru schimbările de conectivitate
export const addConnectivityListeners = (
  onlineCallback: () => void,
  offlineCallback: () => void
): void => {
  window.addEventListener("online", onlineCallback);
  window.addEventListener("offline", offlineCallback);
};

// Elimină listenerii pentru schimbările de conectivitate
export const removeConnectivityListeners = (
  onlineCallback: () => void,
  offlineCallback: () => void
): void => {
  window.removeEventListener("online", onlineCallback);
  window.removeEventListener("offline", offlineCallback);
};

// Stochează o operațiune pentru sincronizare ulterioară
export const storeOfflineOperation = (
  table: string,
  operation: "insert" | "update" | "delete",
  data: any
): string => {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const offlineOperation: OfflineOperation = {
    id,
    table,
    operation,
    data,
    timestamp: Date.now(),
    synced: false,
  };

  // Obținem operațiunile existente
  const existingOperations = getOfflineOperations();

  // Adăugăm noua operațiune
  existingOperations.push(offlineOperation);

  // Salvăm operațiunile actualizate
  cacheService.set("operations", existingOperations, {
    namespace: OFFLINE_NAMESPACE,
    expireIn: 30 * 24 * 60 * 60 * 1000, // 30 zile
  });

  return id;
};

// Obține toate operațiunile offline
export const getOfflineOperations = (): OfflineOperation[] => {
  return (
    cacheService.get<OfflineOperation[]>("operations", {
      namespace: OFFLINE_NAMESPACE,
    }) || []
  );
};

// Marchează o operațiune ca sincronizată
export const markOperationAsSynced = (id: string): void => {
  const operations = getOfflineOperations();
  const updatedOperations = operations.map((op) =>
    op.id === id ? { ...op, synced: true } : op
  );

  cacheService.set("operations", updatedOperations, {
    namespace: OFFLINE_NAMESPACE,
    expireIn: 30 * 24 * 60 * 60 * 1000, // 30 zile
  });
};

// Elimină operațiunile sincronizate
export const removeCompletedOperations = (): void => {
  const operations = getOfflineOperations();
  const pendingOperations = operations.filter((op) => !op.synced);

  cacheService.set("operations", pendingOperations, {
    namespace: OFFLINE_NAMESPACE,
    expireIn: 30 * 24 * 60 * 60 * 1000, // 30 zile
  });
};

// Sincronizează operațiunile offline cu serverul
export const syncOfflineOperations = async (): Promise<{
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: any[];
}> => {
  if (!isOnline()) {
    return {
      success: false,
      syncedCount: 0,
      failedCount: 0,
      errors: [{ message: "Device is offline" }],
    };
  }

  const operations = getOfflineOperations();
  const pendingOperations = operations.filter((op) => !op.synced);

  if (pendingOperations.length === 0) {
    return {
      success: true,
      syncedCount: 0,
      failedCount: 0,
      errors: [],
    };
  }

  let syncedCount = 0;
  let failedCount = 0;
  const errors: any[] = [];

  // Procesăm fiecare operațiune
  for (const operation of pendingOperations) {
    try {
      let result;

      switch (operation.operation) {
        case "insert":
          result = await supabase.from(operation.table).insert(operation.data);
          break;
        case "update":
          result = await supabase
            .from(operation.table)
            .update(operation.data)
            .match(
              operation.data.id ? { id: operation.data.id } : operation.data
            );
          break;
        case "delete":
          try {
            result = await supabase
              .from(operation.table)
              .delete()
              .match(operation.data);
          } catch (error) {
            // Handle error appropriately
            throw error;
          }
          break;
      }

      if (result?.error) {
        throw result.error;
      }

      // Marcăm operațiunea ca sincronizată
      markOperationAsSynced(operation.id);
      syncedCount++;
    } catch (error) {
      // Removed console statement
      failedCount++;
      errors.push({
        operationId: operation.id,
        error,
      });
    }
  }

  // Eliminăm operațiunile sincronizate
  if (syncedCount > 0) {
    removeCompletedOperations();
  }

  return {
    success: failedCount === 0,
    syncedCount,
    failedCount,
    errors,
  };
};

// Stochează date locale pentru utilizare offline
export const storeOfflineData = <T>(key: string, data: T): void => {
  cacheService.set(key, data, {
    namespace: "offline_data",
    expireIn: 30 * 24 * 60 * 60 * 1000, // 30 zile
  });
};

// Obține date locale pentru utilizare offline
export const getOfflineData = <T>(key: string): T | null => {
  return cacheService.get<T>(key, {
    namespace: "offline_data",
  });
};

// Verifică dacă există date offline pentru o anumită cheie
export const hasOfflineData = (key: string): boolean => {
  return (
    cacheService.get(key, {
      namespace: "offline_data",
    }) !== null
  );
};

// Obține numărul de operațiuni offline în așteptare
export const getPendingOperationsCount = (): number => {
  const operations = getOfflineOperations();
  return operations.filter((op) => !op.synced).length;
};

// Exportăm un obiect cu toate funcțiile
export const offlineService = {
  isOnline,
  addConnectivityListeners,
  removeConnectivityListeners,
  storeOfflineOperation,
  getOfflineOperations,
  markOperationAsSynced,
  removeCompletedOperations,
  syncOfflineOperations,
  storeOfflineData,
  getOfflineData,
  hasOfflineData,
  getPendingOperationsCount,
};
