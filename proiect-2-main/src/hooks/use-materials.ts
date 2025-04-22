/**
 * Hook pentru utilizarea materialelor
 * Acest fișier conține un hook pentru interacțiunea cu materialele
 */

import { useState, useEffect, useCallback } from 'react';
import { useInventoryStore } from '@/store';
import { materialService } from '@/services';
import { Material, CreateMaterialInput, UpdateMaterialInput, MaterialFilter, MaterialSort } from '@/models/material.model';
import { useNotifications } from '@/lib/notifications';
import { useErrorBoundary } from '@/lib/error-handling';

/**
 * Hook pentru utilizarea materialelor
 * @returns Funcții și stare pentru interacțiunea cu materialele
 */
export function useMaterials() {
  // Obținem store-ul de inventar
  const {
    materials,
    filteredMaterials,
    selectedMaterial,
    isLoading,
    error,
    filter,
    fetchMaterials: fetchMaterialsFromStore,
    fetchMaterial: fetchMaterialFromStore,
    createMaterial: createMaterialInStore,
    updateMaterial: updateMaterialInStore,
    deleteMaterial: deleteMaterialInStore,
    setFilter,
    clearFilter,
    selectMaterial,
    clearError,
  } = useInventoryStore();
  
  // Obținem notificările
  const { showNotification } = useNotifications();
  
  // Obținem error boundary
  const [reportError] = useErrorBoundary();
  
  // Stare pentru paginare
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  
  // Stare pentru sortare
  const [sort, setSort] = useState<MaterialSort>({
    field: 'created_at',
    direction: 'desc',
  });
  
  /**
   * Încarcă materialele
   */
  const fetchMaterials = useCallback(async () => {
    try {
      // Încărcăm materialele din store
      await fetchMaterialsFromStore();
      
      // Actualizăm paginarea
      setPagination((prev) => ({
        ...prev,
        total: filteredMaterials.length,
        totalPages: Math.ceil(filteredMaterials.length / prev.limit),
      }));
    } catch (error: any) {
      reportError(error);
    }
  }, [fetchMaterialsFromStore, filteredMaterials.length, reportError]);
  
  /**
   * Încarcă un material după ID
   * @param id ID-ul materialului
   */
  const fetchMaterial = useCallback(async (id: string) => {
    try {
      // Încărcăm materialul din store
      await fetchMaterialFromStore(id);
    } catch (error: any) {
      reportError(error);
    }
  }, [fetchMaterialFromStore, reportError]);
  
  /**
   * Creează un material
   * @param material Datele materialului
   * @returns Rezultatul creării
   */
  const createMaterial = useCallback(async (material: CreateMaterialInput) => {
    try {
      // Creăm materialul în store
      const result = await createMaterialInStore(material);
      
      // Verificăm rezultatul
      if (result.success) {
        // Afișăm notificarea
        showNotification(
          'Material creat',
          'Materialul a fost creat cu succes.',
          { type: 'success' }
        );
        
        // Reîncărcăm materialele
        try {
        await fetchMaterials();
        } catch (error) {
          // Handle error appropriately
        }
        
        return { success: true, id: result.id };
      } else {
        // Afișăm notificarea
        showNotification(
          'Eroare',
          result.error || 'A apărut o eroare la crearea materialului.',
          { type: 'error' }
        );
        
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      // Afișăm notificarea
      showNotification(
        'Eroare',
        error.message || 'A apărut o eroare la crearea materialului.',
        { type: 'error' }
      );
      
      reportError(error);
      
      return { success: false, error: error.message };
    }
  }, [createMaterialInStore, fetchMaterials, reportError, showNotification]);
  
  /**
   * Actualizează un material
   * @param id ID-ul materialului
   * @param material Datele materialului
   * @returns Rezultatul actualizării
   */
  const updateMaterial = useCallback(async (id: string, material: UpdateMaterialInput) => {
    try {
      // Actualizăm materialul în store
      const result = await updateMaterialInStore(id, material);
      
      // Verificăm rezultatul
      if (result.success) {
        // Afișăm notificarea
        showNotification(
          'Material actualizat',
          'Materialul a fost actualizat cu succes.',
          { type: 'success' }
        );
        
        // Reîncărcăm materialele
        try {
        await fetchMaterials();
        } catch (error) {
          // Handle error appropriately
        }
        
        return { success: true };
      } else {
        // Afișăm notificarea
        showNotification(
          'Eroare',
          result.error || 'A apărut o eroare la actualizarea materialului.',
          { type: 'error' }
        );
        
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      // Afișăm notificarea
      showNotification(
        'Eroare',
        error.message || 'A apărut o eroare la actualizarea materialului.',
        { type: 'error' }
      );
      
      reportError(error);
      
      return { success: false, error: error.message };
    }
  }, [updateMaterialInStore, fetchMaterials, reportError, showNotification]);
  
  /**
   * Șterge un material
   * @param id ID-ul materialului
   * @returns Rezultatul ștergerii
   */
  const deleteMaterial = useCallback(async (id: string) => {
    try {
      // Ștergem materialul din store
      const result = await deleteMaterialInStore(id);
      
      // Verificăm rezultatul
      if (result.success) {
        // Afișăm notificarea
        showNotification(
          'Material șters',
          'Materialul a fost șters cu succes.',
          { type: 'success' }
        );
        
        // Reîncărcăm materialele
        try {
        await fetchMaterials();
        } catch (error) {
          // Handle error appropriately
        }
        
        return { success: true };
      } else {
        // Afișăm notificarea
        showNotification(
          'Eroare',
          result.error || 'A apărut o eroare la ștergerea materialului.',
          { type: 'error' }
        );
        
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      // Afișăm notificarea
      showNotification(
        'Eroare',
        error.message || 'A apărut o eroare la ștergerea materialului.',
        { type: 'error' }
      );
      
      reportError(error);
      
      return { success: false, error: error.message };
    }
  }, [deleteMaterialInStore, fetchMaterials, reportError, showNotification]);
  
  /**
   * Setează filtrul pentru materiale
   * @param newFilter Noul filtru
   */
  const setMaterialFilter = useCallback((newFilter: Partial<MaterialFilter>) => {
    setFilter(newFilter);
  }, [setFilter]);
  
  /**
   * Setează sortarea pentru materiale
   * @param field Câmpul după care se face sortarea
   * @param direction Direcția sortării
   */
  const setMaterialSort = useCallback((field: keyof Material, direction: 'asc' | 'desc') => {
    setSort({ field, direction });
    
    // Aplicăm sortarea în store
    setFilter({
      sortBy: field,
      sortOrder: direction,
    });
  }, [setFilter]);
  
  /**
   * Setează paginarea pentru materiale
   * @param page Pagina
   * @param limit Limita
   */
  const setMaterialPagination = useCallback((page: number, limit: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
      limit,
      totalPages: Math.ceil(prev.total / limit),
    }));
  }, []);
  
  /**
   * Obține materialele pentru un proiect
   * @param projectId ID-ul proiectului
   * @returns Lista de materiale
   */
  const getMaterialsByProject = useCallback((projectId: string) => {
    return filteredMaterials.filter((material) => material.project_id === projectId);
  }, [filteredMaterials]);
  
  /**
   * Obține materialele pentru un furnizor
   * @param supplierId ID-ul furnizorului
   * @returns Lista de materiale
   */
  const getMaterialsBySupplier = useCallback((supplierId: string) => {
    return filteredMaterials.filter((material) => material.supplier_id === supplierId);
  }, [filteredMaterials]);
  
  /**
   * Obține materialele după categorie
   * @param category Categoria materialelor
   * @returns Lista de materiale
   */
  const getMaterialsByCategory = useCallback((category: string) => {
    return filteredMaterials.filter((material) => material.category === category);
  }, [filteredMaterials]);
  
  /**
   * Obține materialele după status
   * @param status Statusul materialelor
   * @returns Lista de materiale
   */
  const getMaterialsByStatus = useCallback((status: string) => {
    return filteredMaterials.filter((material) => material.status === status);
  }, [filteredMaterials]);
  
  /**
   * Obține numărul de materiale după categorie
   * @param category Categoria materialelor
   * @returns Numărul de materiale
   */
  const getMaterialCountByCategory = useCallback((category: string) => {
    return getMaterialsByCategory(category).length;
  }, [getMaterialsByCategory]);
  
  /**
   * Obține numărul de materiale după status
   * @param status Statusul materialelor
   * @returns Numărul de materiale
   */
  const getMaterialCountByStatus = useCallback((status: string) => {
    return getMaterialsByStatus(status).length;
  }, [getMaterialsByStatus]);
  
  /**
   * Obține valoarea totală a materialelor
   * @returns Valoarea totală
   */
  const getTotalMaterialValue = useCallback(() => {
    return filteredMaterials.reduce((total, material) => {
      return total + (material.price || 0) * (material.quantity || 0);
    }, 0);
  }, [filteredMaterials]);
  
  // Încărcăm materialele la montare
  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);
  
  // Returnăm funcțiile și starea
  return {
    // Stare
    materials,
    filteredMaterials,
    selectedMaterial,
    isLoading,
    error,
    filter,
    pagination,
    sort,
    
    // Funcții
    fetchMaterials,
    fetchMaterial,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    setFilter: setMaterialFilter,
    clearFilter,
    selectMaterial,
    clearError,
    setSort: setMaterialSort,
    setPagination: setMaterialPagination,
    getMaterialsByProject,
    getMaterialsBySupplier,
    getMaterialsByCategory,
    getMaterialsByStatus,
    getMaterialCountByCategory,
    getMaterialCountByStatus,
    getTotalMaterialValue,
  };
}

// Exportăm hook-ul
export default useMaterials;
