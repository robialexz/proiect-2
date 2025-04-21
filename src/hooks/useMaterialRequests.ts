import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { materialRequestsService } from '@/lib/material-requests-service';
import { 
  MaterialRequest, 
  MaterialRequestWithDetails, 
  CreateMaterialRequestInput, 
  UpdateMaterialRequestInput,
  ApproveMaterialRequestInput,
  RequestStatus,
  RequestPriority
} from '@/models/material-request.model';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook pentru gestionarea cererilor de materiale
 * @param projectId - ID-ul proiectului (opțional)
 */
export const useMaterialRequests = (projectId?: string) => {
  const [requests, setRequests] = useState<MaterialRequestWithDetails[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<MaterialRequestWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequestWithDetails | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [sort, setSort] = useState<{ field: string; direction: 'asc' | 'desc' }>({ field: 'created_at', direction: 'desc' });
  const [filters, setFilters] = useState<{
    status?: RequestStatus;
    priority?: RequestPriority;
    dateFrom?: string;
    dateTo?: string;
    searchTerm?: string;
  }>({});
  const [subscription, setSubscription] = useState<any>(null);

  const { toast } = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();

  // Funcție pentru încărcarea cererilor
  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await materialRequestsService.getRequests({
        projectId,
        status: filters.status,
        priority: filters.priority,
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
      
      setRequests(response.data || []);
      
      // Aplicăm filtrele locale
      filterRequests(response.data || [], filters);
      
      // Actualizăm paginarea
      setPagination(prev => ({
        ...prev,
        total: response.data?.length || 0
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.requests.loadError', 'Error loading requests'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, filters, sort, toast, t]);

  // Funcție pentru filtrarea cererilor
  const filterRequests = useCallback((data: MaterialRequestWithDetails[], currentFilters: any) => {
    let filtered = [...data];
    
    // Filtrare după termen de căutare
    if (currentFilters.searchTerm) {
      const searchTerm = currentFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(req => 
        req.project_name?.toLowerCase().includes(searchTerm) ||
        req.requester_name?.toLowerCase().includes(searchTerm) ||
        req.notes?.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredRequests(filtered);
  }, []);

  // Funcție pentru încărcarea unei cereri după ID
  const loadRequestById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await materialRequestsService.getRequestById(id);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      setSelectedRequest(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.requests.loadDetailError', 'Error loading request details'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  // Funcție pentru crearea unei cereri
  const createRequest = useCallback(async (request: CreateMaterialRequestInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await materialRequestsService.createRequest(request);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast({
        title: t('inventory.requests.createSuccess', 'Request created'),
        description: t('inventory.requests.createSuccessDescription', 'The material request has been created successfully.'),
        variant: 'default'
      });
      
      // Reîncărcăm cererile
      await loadRequests();
      
      return { success: true, data: response.data };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.requests.createError', 'Error creating request'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [loadRequests, toast, t]);

  // Funcție pentru actualizarea unei cereri
  const updateRequest = useCallback(async (id: string, request: UpdateMaterialRequestInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await materialRequestsService.updateRequest(id, request);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast({
        title: t('inventory.requests.updateSuccess', 'Request updated'),
        description: t('inventory.requests.updateSuccessDescription', 'The material request has been updated successfully.'),
        variant: 'default'
      });
      
      // Reîncărcăm cererile
      await loadRequests();
      
      return { success: true, data: response.data };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.requests.updateError', 'Error updating request'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [loadRequests, toast, t]);

  // Funcție pentru aprobarea/respingerea unei cereri
  const approveRequest = useCallback(async (id: string, approval: ApproveMaterialRequestInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await materialRequestsService.approveRequest(id, approval);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      const actionType = approval.status === 'approved' ? 
        t('inventory.requests.approved', 'approved') : 
        t('inventory.requests.rejected', 'rejected');
      
      toast({
        title: t('inventory.requests.approveSuccess', 'Request {{actionType}}', { actionType }),
        description: t('inventory.requests.approveSuccessDescription', 'The material request has been {{actionType}} successfully.', { actionType }),
        variant: 'default'
      });
      
      // Reîncărcăm cererile
      await loadRequests();
      
      return { success: true, data: response.data };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.requests.approveError', 'Error processing request'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [loadRequests, toast, t]);

  // Funcție pentru marcarea unei cereri ca finalizată
  const completeRequest = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await materialRequestsService.completeRequest(id);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast({
        title: t('inventory.requests.completeSuccess', 'Request completed'),
        description: t('inventory.requests.completeSuccessDescription', 'The material request has been marked as completed.'),
        variant: 'default'
      });
      
      // Reîncărcăm cererile
      await loadRequests();
      
      return { success: true, data: response.data };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.requests.completeError', 'Error completing request'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [loadRequests, toast, t]);

  // Funcție pentru ștergerea unei cereri
  const deleteRequest = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await materialRequestsService.deleteRequest(id);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast({
        title: t('inventory.requests.deleteSuccess', 'Request deleted'),
        description: t('inventory.requests.deleteSuccessDescription', 'The material request has been deleted successfully.'),
        variant: 'default'
      });
      
      // Reîncărcăm cererile
      await loadRequests();
      
      return { success: true };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.requests.deleteError', 'Error deleting request'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [loadRequests, toast, t]);

  // Funcție pentru exportul cererilor
  const exportRequests = useCallback(async (format: 'excel' | 'csv' = 'excel') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await materialRequestsService.exportRequests(format, {
        projectId,
        status: filters.status,
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
      a.download = `material-requests-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: t('inventory.requests.exportSuccess', 'Requests exported'),
        description: t('inventory.requests.exportSuccessDescription', 'The material requests have been exported successfully.'),
        variant: 'default'
      });
      
      return { success: true };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.requests.exportError', 'Error exporting requests'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [projectId, filters, toast, t]);

  // Funcție pentru obținerea statisticilor
  const getRequestStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await materialRequestsService.getRequestStats(projectId);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.requests.statsError', 'Error loading statistics'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [projectId, toast, t]);

  // Efect pentru încărcarea cererilor la montare
  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Efect pentru filtrarea cererilor când se schimbă filtrele
  useEffect(() => {
    filterRequests(requests, filters);
  }, [requests, filters, filterRequests]);

  // Efect pentru abonarea la schimbări în cereri
  useEffect(() => {
    // Funcția de callback pentru abonament
    const handleRealtimeUpdate = (payload: any) => {
      // Reîncărcăm cererile când se schimbă ceva
      loadRequests();
    };
    
    // Creăm abonamentul
    const subscription = materialRequestsService.subscribeToRequestChanges(
      handleRealtimeUpdate,
      { 
        projectId,
        requesterId: user?.id
      }
    );
    
    setSubscription(subscription);
    
    // Curățăm abonamentul la demontare
    return () => {
      if (subscription) {
        materialRequestsService.unsubscribeFromRequestChanges(subscription);
      }
    };
  }, [projectId, user?.id, loadRequests]);

  // Calculăm cererile pentru pagina curentă
  const paginatedRequests = filteredRequests.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  // Returnăm starea și funcțiile
  return {
    // Stare
    requests,
    filteredRequests,
    paginatedRequests,
    loading,
    error,
    selectedRequest,
    pagination,
    sort,
    filters,
    
    // Funcții
    loadRequests,
    loadRequestById,
    createRequest,
    updateRequest,
    approveRequest,
    completeRequest,
    deleteRequest,
    exportRequests,
    getRequestStats,
    setFilters,
    setSort,
    setPagination,
    setSelectedRequest
  };
};

export default useMaterialRequests;
