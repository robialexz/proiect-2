import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { qrCodeService } from '@/lib/qr-code-service';
import { 
  QRCode, 
  QRCodeWithDetails, 
  CreateQRCodeInput, 
  UpdateQRCodeInput,
  QRCodeType,
  QRScanResult
} from '@/models/qr-code.model';
import { useTranslation } from 'react-i18next';

/**
 * Hook pentru gestionarea codurilor QR
 * @param type - Tipul codului QR (opțional)
 * @param referenceId - ID-ul referinței (opțional)
 */
export const useQRCode = (type?: QRCodeType, referenceId?: string) => {
  const [qrCodes, setQRCodes] = useState<QRCodeWithDetails[]>([]);
  const [filteredQRCodes, setFilteredQRCodes] = useState<QRCodeWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQRCode, setSelectedQRCode] = useState<QRCodeWithDetails | null>(null);
  const [scanResult, setScanResult] = useState<QRScanResult | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [sort, setSort] = useState<{ field: string; direction: 'asc' | 'desc' }>({ field: 'created_at', direction: 'desc' });
  const [filters, setFilters] = useState<{
    searchTerm?: string;
  }>({});

  const { toast } = useToast();
  const { t } = useTranslation();

  // Funcție pentru încărcarea codurilor QR
  const loadQRCodes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await qrCodeService.getQRCodes({
        type,
        referenceId,
        orderBy: {
          column: sort.field,
          ascending: sort.direction === 'asc'
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      setQRCodes(response.data || []);
      
      // Aplicăm filtrele locale
      filterQRCodes(response.data || [], filters);
      
      // Actualizăm paginarea
      setPagination(prev => ({
        ...prev,
        total: response.data?.length || 0
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.qrCodes.loadError', 'Error loading QR codes'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [type, referenceId, sort, filters, toast, t]);

  // Funcție pentru filtrarea codurilor QR
  const filterQRCodes = useCallback((data: QRCodeWithDetails[], currentFilters: any) => {
    let filtered = [...data];
    
    // Filtrare după termen de căutare
    if (currentFilters.searchTerm) {
      const searchTerm = currentFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(qr => 
        qr.code.toLowerCase().includes(searchTerm) ||
        qr.reference_name?.toLowerCase().includes(searchTerm) ||
        qr.reference_type?.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredQRCodes(filtered);
  }, []);

  // Funcție pentru încărcarea unui cod QR după ID
  const loadQRCodeById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await qrCodeService.getQRCodeById(id);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      setSelectedQRCode(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.qrCodes.loadDetailError', 'Error loading QR code details'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  // Funcție pentru încărcarea unui cod QR după cod
  const loadQRCodeByCode = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await qrCodeService.getQRCodeByCode(code);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      setSelectedQRCode(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.qrCodes.loadDetailError', 'Error loading QR code details'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  // Funcție pentru crearea unui cod QR
  const createQRCode = useCallback(async (qrCode: CreateQRCodeInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await qrCodeService.createQRCode(qrCode);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast({
        title: t('inventory.qrCodes.createSuccess', 'QR code created'),
        description: t('inventory.qrCodes.createSuccessDescription', 'The QR code has been created successfully.'),
        variant: 'default'
      });
      
      // Reîncărcăm codurile QR
      await loadQRCodes();
      
      return { success: true, data: response.data };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.qrCodes.createError', 'Error creating QR code'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [loadQRCodes, toast, t]);

  // Funcție pentru actualizarea unui cod QR
  const updateQRCode = useCallback(async (id: string, qrCode: UpdateQRCodeInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await qrCodeService.updateQRCode(id, qrCode);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast({
        title: t('inventory.qrCodes.updateSuccess', 'QR code updated'),
        description: t('inventory.qrCodes.updateSuccessDescription', 'The QR code has been updated successfully.'),
        variant: 'default'
      });
      
      // Reîncărcăm codurile QR
      await loadQRCodes();
      
      return { success: true, data: response.data };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.qrCodes.updateError', 'Error updating QR code'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [loadQRCodes, toast, t]);

  // Funcție pentru ștergerea unui cod QR
  const deleteQRCode = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await qrCodeService.deleteQRCode(id);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast({
        title: t('inventory.qrCodes.deleteSuccess', 'QR code deleted'),
        description: t('inventory.qrCodes.deleteSuccessDescription', 'The QR code has been deleted successfully.'),
        variant: 'default'
      });
      
      // Reîncărcăm codurile QR
      await loadQRCodes();
      
      return { success: true };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.qrCodes.deleteError', 'Error deleting QR code'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [loadQRCodes, toast, t]);

  // Funcție pentru scanarea unui cod QR
  const scanQRCode = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    setScanResult(null);
    
    try {
      const response = await qrCodeService.scanQRCode(code);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      setScanResult(response.data);
      
      if (response.data.found) {
        toast({
          title: t('inventory.qrCodes.scanSuccess', 'QR code scanned'),
          description: t('inventory.qrCodes.scanSuccessDescription', 'The QR code has been scanned successfully.'),
          variant: 'default'
        });
      } else {
        toast({
          title: t('inventory.qrCodes.scanNotFound', 'QR code not found'),
          description: t('inventory.qrCodes.scanNotFoundDescription', 'The scanned QR code was not found in the system.'),
          variant: 'destructive'
        });
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.qrCodes.scanError', 'Error scanning QR code'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  // Funcție pentru generarea unei imagini QR
  const generateQRImage = useCallback(async (code: string, options?: {
    size?: number;
    margin?: number;
    color?: string;
    backgroundColor?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await qrCodeService.generateQRImage(code, options);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.qrCodes.generateImageError', 'Error generating QR image'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  // Funcție pentru generarea codurilor QR în masă
  const generateBulkQRCodes = useCallback(async (materialIds: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await qrCodeService.generateBulkQRCodes(materialIds);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast({
        title: t('inventory.qrCodes.bulkCreateSuccess', 'QR codes created'),
        description: t('inventory.qrCodes.bulkCreateSuccessDescription', 'The QR codes have been created successfully.'),
        variant: 'default'
      });
      
      // Reîncărcăm codurile QR
      await loadQRCodes();
      
      return { success: true, data: response.data };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.qrCodes.bulkCreateError', 'Error creating QR codes'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [loadQRCodes, toast, t]);

  // Funcție pentru exportul codurilor QR
  const exportQRCodes = useCallback(async (format: 'excel' | 'csv' = 'excel') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await qrCodeService.exportQRCodes(format, {
        type,
        referenceId
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      // Creăm un URL pentru descărcare
      const url = URL.createObjectURL(response.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-codes-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: t('inventory.qrCodes.exportSuccess', 'QR codes exported'),
        description: t('inventory.qrCodes.exportSuccessDescription', 'The QR codes have been exported successfully.'),
        variant: 'default'
      });
      
      return { success: true };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: t('inventory.qrCodes.exportError', 'Error exporting QR codes'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [type, referenceId, toast, t]);

  // Efect pentru încărcarea codurilor QR la montare
  useEffect(() => {
    loadQRCodes();
  }, [loadQRCodes]);

  // Efect pentru filtrarea codurilor QR când se schimbă filtrele
  useEffect(() => {
    filterQRCodes(qrCodes, filters);
  }, [qrCodes, filters, filterQRCodes]);

  // Calculăm codurile QR pentru pagina curentă
  const paginatedQRCodes = filteredQRCodes.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  // Returnăm starea și funcțiile
  return {
    // Stare
    qrCodes,
    filteredQRCodes,
    paginatedQRCodes,
    loading,
    error,
    selectedQRCode,
    scanResult,
    pagination,
    sort,
    filters,
    
    // Funcții
    loadQRCodes,
    loadQRCodeById,
    loadQRCodeByCode,
    createQRCode,
    updateQRCode,
    deleteQRCode,
    scanQRCode,
    generateQRImage,
    generateBulkQRCodes,
    exportQRCodes,
    setFilters,
    setSort,
    setPagination,
    setSelectedQRCode,
    setScanResult
  };
};

export default useQRCode;
