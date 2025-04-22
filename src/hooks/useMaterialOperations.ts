import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { materialOperationsService } from '@/lib/material-operations-service';
import { 
  MaterialOperation, 
  MaterialOperationWithDetails, 
  CreateMaterialOperationInput, 
  UpdateMaterialOperationInput,
  OperationType
} from '@/models/material-operation.model';
import { useTranslation } from 'react-i18next';

/**
 * Hook pentru gestionarea operațiunilor de materiale
 * @param projectId - ID-ul proiectului (opțional)
 * @param materialId - ID-ul materialului (opțional)
 */
export const useMaterialOperations = (projectId?: string, materialId?: string) => {
  const [operations, setOperations] = useState<MaterialOperationWithDetails[]>([]);
  const [filteredOperations, setFilteredOperations] = useState<MaterialOperationWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<MaterialOperationWithDetails | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [sort, setSort] = useState<{ field: string; direction: 'asc' | 'desc' }>({ field: 'created_at', direction: 'desc' });
  const [filters, setFilters] = useState<{
    operationType?: OperationType;
    dateFrom?: string;
    dateTo?: string;
    searchTerm?: string;
  }>({});
  const [subscription, setSubscription] = useState<any>(null);

  const { toast } = useToast();
  const { t } = useTranslation();

  // Funcție pentru încărcarea operațiunilor
  const loadOperations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await materialOperationsService.getOperations({
        projectId,
        materialId,
        operationType: filters.operationType,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        orderBy: {
          column: sort.field,
          ascending: sort.direction === 'asc'
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      setOperations(response.data || []);
      
      // Aplicăm filtrele locale
      filterOperations(response.data || [], filters);
      
      // Actualizăm paginarea
      setPagination(prev => ({
        ...prev,
        total: response.data?.length || 0
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.operations.loadError', 'Error loading operations'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, materialId, filters, sort, toast, t]);

  // Funcție pentru filtrarea operațiunilor
  const filterOperations = useCallback((data: MaterialOperationWithDetails[], currentFilters: any) => {
    let filtered = [...data];
    
    // Filtrare după termen de căutare
    if (currentFilters.searchTerm) {
      const searchTerm = currentFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(op => 
        op.material_name?.toLowerCase().includes(searchTerm) ||
        op.project_name?.toLowerCase().includes(searchTerm) ||
        op.notes?.toLowerCase().includes(searchTerm) ||
        op.location?.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredOperations(filtered);
  }, []);

  // Funcție pentru crearea unei operațiuni
  const createOperation = useCallback(async (operation: CreateMaterialOperationInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await materialOperationsService.createOperation(operation);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast({
        title: t('inventory.operations.createSuccess', 'Operation created'),
        description: t('inventory.operations.createSuccessDescription', 'The operation has been created successfully.'),
        variant: 'default'
      });
      
      // Reîncărcăm operațiunile
      await loadOperations();
      
      return { success: true, data: response.data };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.operations.createError', 'Error creating operation'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [loadOperations, toast, t]);

  // Funcție pentru actualizarea unei operațiuni
  const updateOperation = useCallback(async (id: string, operation: UpdateMaterialOperationInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await materialOperationsService.updateOperation(id, operation);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast({
        title: t('inventory.operations.updateSuccess', 'Operation updated'),
        description: t('inventory.operations.updateSuccessDescription', 'The operation has been updated successfully.'),
        variant: 'default'
      });
      
      // Reîncărcăm operațiunile
      await loadOperations();
      
      return { success: true, data: response.data };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.operations.updateError', 'Error updating operation'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [loadOperations, toast, t]);

  // Funcție pentru ștergerea unei operațiuni
  const deleteOperation = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await materialOperationsService.deleteOperation(id);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast({
        title: t('inventory.operations.deleteSuccess', 'Operation deleted'),
        description: t('inventory.operations.deleteSuccessDescription', 'The operation has been deleted successfully.'),
        variant: 'default'
      });
      
      // Reîncărcăm operațiunile
      await loadOperations();
      
      return { success: true };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.operations.deleteError', 'Error deleting operation'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [loadOperations, toast, t]);

  // Funcție pentru exportul operațiunilor
  const exportOperations = useCallback(async (format: 'excel' | 'csv' = 'excel') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await materialOperationsService.exportOperations(format, {
        projectId,
        materialId,
        operationType: filters.operationType,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      // Creăm un URL pentru descărcare
      const url = URL.createObjectURL(response.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `material-operations-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: t('inventory.operations.exportSuccess', 'Operations exported'),
        description: t('inventory.operations.exportSuccessDescription', 'The operations have been exported successfully.'),
        variant: 'default'
      });
      
      return { success: true };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.operations.exportError', 'Error exporting operations'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [projectId, materialId, filters, toast, t]);

  // Funcție pentru obținerea statisticilor
  const getOperationStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await materialOperationsService.getOperationStats(projectId);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.operations.statsError', 'Error loading statistics'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [projectId, toast, t]);

  // Efect pentru încărcarea operațiunilor la montare
  useEffect(() => {
    loadOperations();
  }, [loadOperations]);

  // Efect pentru filtrarea operațiunilor când se schimbă filtrele
  useEffect(() => {
    filterOperations(operations, filters);
  }, [operations, filters, filterOperations]);

  // Efect pentru abonarea la schimbări în operațiuni
  useEffect(() => {
    // Funcția de callback pentru abonament
    const handleRealtimeUpdate = (payload: any) => {
      // Reîncărcăm operațiunile când se schimbă ceva
      loadOperations();
    };
    
    // Creăm abonamentul
    const subscription = materialOperationsService.subscribeToOperationChanges(
      handleRealtimeUpdate,
      { projectId, materialId }
    );
    
    setSubscription(subscription);
    
    // Curățăm abonamentul la demontare
    return () => {
      if (subscription) {
        materialOperationsService.unsubscribeFromOperationChanges(subscription);
      }
    };
  }, [projectId, materialId, loadOperations]);

  // Calculăm operațiunile pentru pagina curentă
  const paginatedOperations = filteredOperations.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  // Returnăm starea și funcțiile
  return {
    // Stare
    operations,
    filteredOperations,
    paginatedOperations,
    loading,
    error,
    selectedOperation,
    pagination,
    sort,
    filters,
    
    // Funcții
    loadOperations,
    createOperation,
    updateOperation,
    deleteOperation,
    exportOperations,
    getOperationStats,
    setFilters,
    setSort,
    setPagination,
    setSelectedOperation
  };
};

export default useMaterialOperations;
