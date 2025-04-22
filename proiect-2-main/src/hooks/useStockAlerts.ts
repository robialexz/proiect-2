import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { stockAlertsService } from '@/lib/stock-alerts-service';
import { 
  StockAlert, 
  StockAlertWithDetails, 
  CreateStockAlertInput, 
  UpdateStockAlertInput,
  AlertType,
  StockAlertCheckResult
} from '@/models/stock-alert.model';
import { useTranslation } from 'react-i18next';

/**
 * Hook pentru gestionarea alertelor de stoc
 * @param projectId - ID-ul proiectului (opțional)
 * @param materialId - ID-ul materialului (opțional)
 */
export const useStockAlerts = (projectId?: string, materialId?: string) => {
  const [alerts, setAlerts] = useState<StockAlertWithDetails[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<StockAlertWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<StockAlertWithDetails | null>(null);
  const [checkResult, setCheckResult] = useState<StockAlertCheckResult | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [sort, setSort] = useState<{ field: string; direction: 'asc' | 'desc' }>({ field: 'created_at', direction: 'desc' });
  const [filters, setFilters] = useState<{
    alertType?: AlertType;
    isActive?: boolean;
    searchTerm?: string;
  }>({});
  const [subscription, setSubscription] = useState<any>(null);

  const { toast } = useToast();
  const { t } = useTranslation();

  // Funcție pentru încărcarea alertelor
  const loadAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await stockAlertsService.getAlerts({
        projectId,
        materialId,
        alertType: filters.alertType,
        isActive: filters.isActive,
        orderBy: {
          column: sort.field,
          ascending: sort.direction === 'asc'
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      setAlerts(response.data || []);
      
      // Aplicăm filtrele locale
      filterAlerts(response.data || [], filters);
      
      // Actualizăm paginarea
      setPagination(prev => ({
        ...prev,
        total: response.data?.length || 0
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.alerts.loadError', 'Error loading alerts'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, materialId, filters, sort, toast, t]);

  // Funcție pentru filtrarea alertelor
  const filterAlerts = useCallback((data: StockAlertWithDetails[], currentFilters: any) => {
    let filtered = [...data];
    
    // Filtrare după termen de căutare
    if (currentFilters.searchTerm) {
      const searchTerm = currentFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(alert => 
        alert.material_name?.toLowerCase().includes(searchTerm) ||
        alert.project_name?.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredAlerts(filtered);
  }, []);

  // Funcție pentru încărcarea unei alerte după ID
  const loadAlertById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await stockAlertsService.getAlertById(id);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      setSelectedAlert(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.alerts.loadDetailError', 'Error loading alert details'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  // Funcție pentru crearea unei alerte
  const createAlert = useCallback(async (alert: CreateStockAlertInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await stockAlertsService.createAlert(alert);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast({
        title: t('inventory.alerts.createSuccess', 'Alert created'),
        description: t('inventory.alerts.createSuccessDescription', 'The stock alert has been created successfully.'),
        variant: 'default'
      });
      
      // Reîncărcăm alertele
      await loadAlerts();
      
      return { success: true, data: response.data };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.alerts.createError', 'Error creating alert'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [loadAlerts, toast, t]);

  // Funcție pentru actualizarea unei alerte
  const updateAlert = useCallback(async (id: string, alert: UpdateStockAlertInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await stockAlertsService.updateAlert(id, alert);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast({
        title: t('inventory.alerts.updateSuccess', 'Alert updated'),
        description: t('inventory.alerts.updateSuccessDescription', 'The stock alert has been updated successfully.'),
        variant: 'default'
      });
      
      // Reîncărcăm alertele
      await loadAlerts();
      
      return { success: true, data: response.data };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.alerts.updateError', 'Error updating alert'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [loadAlerts, toast, t]);

  // Funcție pentru ștergerea unei alerte
  const deleteAlert = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await stockAlertsService.deleteAlert(id);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast({
        title: t('inventory.alerts.deleteSuccess', 'Alert deleted'),
        description: t('inventory.alerts.deleteSuccessDescription', 'The stock alert has been deleted successfully.'),
        variant: 'default'
      });
      
      // Reîncărcăm alertele
      await loadAlerts();
      
      return { success: true };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.alerts.deleteError', 'Error deleting alert'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [loadAlerts, toast, t]);

  // Funcție pentru verificarea alertelor
  const checkAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await stockAlertsService.checkAlerts({
        projectId,
        materialId
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      setCheckResult(response.data);
      
      if (response.data?.triggered) {
        toast({
          title: t('inventory.alerts.checkTriggered', 'Alerts triggered'),
          description: t('inventory.alerts.checkTriggeredDescription', 'Some stock alerts have been triggered.'),
          variant: 'destructive'
        });
      } else {
        toast({
          title: t('inventory.alerts.checkNoAlerts', 'No alerts triggered'),
          description: t('inventory.alerts.checkNoAlertsDescription', 'No stock alerts have been triggered.'),
          variant: 'default'
        });
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.alerts.checkError', 'Error checking alerts'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [projectId, materialId, toast, t]);

  // Funcție pentru activarea/dezactivarea unei alerte
  const toggleAlert = useCallback(async (id: string, isActive: boolean) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await stockAlertsService.toggleAlert(id, isActive);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      const actionType = isActive ? 
        t('inventory.alerts.activated', 'activated') : 
        t('inventory.alerts.deactivated', 'deactivated');
      
      toast({
        title: t('inventory.alerts.toggleSuccess', 'Alert {{actionType}}', { actionType }),
        description: t('inventory.alerts.toggleSuccessDescription', 'The stock alert has been {{actionType}} successfully.', { actionType }),
        variant: 'default'
      });
      
      // Reîncărcăm alertele
      await loadAlerts();
      
      return { success: true, data: response.data };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.alerts.toggleError', 'Error toggling alert'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [loadAlerts, toast, t]);

  // Funcție pentru crearea alertelor pentru un proiect
  const createAlertsForProject = useCallback(async (projectId: string, threshold: number = 20) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await stockAlertsService.createAlertsForProject(projectId, threshold);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast({
        title: t('inventory.alerts.createProjectSuccess', 'Project alerts created'),
        description: t('inventory.alerts.createProjectSuccessDescription', 'The stock alerts for the project have been created successfully.'),
        variant: 'default'
      });
      
      // Reîncărcăm alertele
      await loadAlerts();
      
      return { success: true, data: response.data };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.alerts.createProjectError', 'Error creating project alerts'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [loadAlerts, toast, t]);

  // Funcție pentru exportul alertelor
  const exportAlerts = useCallback(async (format: 'excel' | 'csv' = 'excel') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await stockAlertsService.exportAlerts(format, {
        projectId,
        materialId,
        alertType: filters.alertType,
        isActive: filters.isActive
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      // Creăm un URL pentru descărcare
      const url = URL.createObjectURL(response.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stock-alerts-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: t('inventory.alerts.exportSuccess', 'Alerts exported'),
        description: t('inventory.alerts.exportSuccessDescription', 'The stock alerts have been exported successfully.'),
        variant: 'default'
      });
      
      return { success: true };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.alerts.exportError', 'Error exporting alerts'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [projectId, materialId, filters, toast, t]);

  // Efect pentru încărcarea alertelor la montare
  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // Efect pentru filtrarea alertelor când se schimbă filtrele
  useEffect(() => {
    filterAlerts(alerts, filters);
  }, [alerts, filters, filterAlerts]);

  // Efect pentru abonarea la schimbări în alerte
  useEffect(() => {
    // Funcția de callback pentru abonament
    const handleRealtimeUpdate = (payload: any) => {
      // Reîncărcăm alertele când se schimbă ceva
      loadAlerts();
    };
    
    // Creăm abonamentul
    const subscription = stockAlertsService.subscribeToAlertChanges(
      handleRealtimeUpdate,
      { 
        projectId,
        materialId
      }
    );
    
    setSubscription(subscription);
    
    // Curățăm abonamentul la demontare
    return () => {
      if (subscription) {
        stockAlertsService.unsubscribeFromAlertChanges(subscription);
      }
    };
  }, [projectId, materialId, loadAlerts]);

  // Calculăm alertele pentru pagina curentă
  const paginatedAlerts = filteredAlerts.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  // Returnăm starea și funcțiile
  return {
    // Stare
    alerts,
    filteredAlerts,
    paginatedAlerts,
    loading,
    error,
    selectedAlert,
    checkResult,
    pagination,
    sort,
    filters,
    
    // Funcții
    loadAlerts,
    loadAlertById,
    createAlert,
    updateAlert,
    deleteAlert,
    checkAlerts,
    toggleAlert,
    createAlertsForProject,
    exportAlerts,
    setFilters,
    setSort,
    setPagination,
    setSelectedAlert,
    setCheckResult
  };
};

export default useStockAlerts;
