import { useState, useEffect, useCallback } from 'react';
import { tenderService } from '@/lib/tender-service';
import { 
  Tender, 
  TenderDocument, 
  TenderFilters, 
  TenderSort, 
  TenderPagination,
  TenderAlert,
  TenderNote
} from '@/models/tender';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

export function useTenders() {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [filters, setFilters] = useState<TenderFilters>({});
  const [sort, setSort] = useState<TenderSort>({ field: 'publication_date', direction: 'desc' });
  const [pagination, setPagination] = useState<TenderPagination>({ page: 1, pageSize: 10, total: 0 });
  const [alerts, setAlerts] = useState<TenderAlert[]>([]);
  const [notes, setNotes] = useState<TenderNote[]>([]);
  const [loading, setLoading] = useState({
    tenders: false,
    tender: false,
    alerts: false,
    notes: false,
    operation: false
  });
  const [error, setError] = useState<string | null>(null);
  
  // Încărcăm licitațiile
  const loadTenders = useCallback(async () => {
    setLoading(prev => ({ ...prev, tenders: true }));
    setError(null);
    
    try {
      const { data, pagination: newPagination } = await tenderService.getAllTenders(
        filters,
        sort,
        pagination
      );
      
      setTenders(data);
      setPagination(newPagination);
    } catch (err) {
      setError(t('tenders.errors.loadFailed', 'Failed to load tenders'));
      toast({
        variant: 'destructive',
        title: t('tenders.errors.loadFailed', 'Failed to load tenders'),
        description: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setLoading(prev => ({ ...prev, tenders: false }));
    }
  }, [filters, sort, pagination, t, toast]);
  
  // Încărcăm licitațiile la inițializare și când se schimbă filtrele, sortarea sau paginarea
  useEffect(() => {
    loadTenders();
  }, [loadTenders]);
  
  // Obținem o licitație după ID
  const getTenderById = useCallback(async (tenderId: string) => {
    setLoading(prev => ({ ...prev, tender: true }));
    
    try {
      const tender = await tenderService.getTenderById(tenderId);
      setSelectedTender(tender);
      
      // Încărcăm notele licitației
      if (tender) {
        await loadNotes(tenderId);
      }
      
      return tender;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('tenders.errors.getTenderFailed', 'Failed to get tender details'),
        description: err instanceof Error ? err.message : String(err)
      });
      return null;
    } finally {
      setLoading(prev => ({ ...prev, tender: false }));
    }
  }, [t, toast]);
  
  // Încărcăm alertele
  const loadAlerts = useCallback(async () => {
    setLoading(prev => ({ ...prev, alerts: true }));
    
    try {
      const alertsData = await tenderService.getAlerts();
      setAlerts(alertsData);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('tenders.errors.loadAlertsFailed', 'Failed to load alerts'),
        description: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setLoading(prev => ({ ...prev, alerts: false }));
    }
  }, [t, toast]);
  
  // Încărcăm notele unei licitații
  const loadNotes = useCallback(async (tenderId: string) => {
    setLoading(prev => ({ ...prev, notes: true }));
    
    try {
      const notesData = await tenderService.getNotes(tenderId);
      setNotes(notesData);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('tenders.errors.loadNotesFailed', 'Failed to load notes'),
        description: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setLoading(prev => ({ ...prev, notes: false }));
    }
  }, [t, toast]);
  
  // Marchează o licitație ca favorită
  const toggleFavorite = useCallback(async (tenderId: string, isFavorite: boolean) => {
    setLoading(prev => ({ ...prev, operation: true }));
    
    try {
      await tenderService.toggleFavorite(tenderId, isFavorite);
      
      // Actualizăm licitația în lista de licitații
      setTenders(prev => prev.map(tender => 
        tender.id === tenderId ? { ...tender, is_favorite: isFavorite } : tender
      ));
      
      // Actualizăm licitația selectată dacă este cazul
      if (selectedTender && selectedTender.id === tenderId) {
        setSelectedTender(prev => prev ? { ...prev, is_favorite: isFavorite } : null);
      }
      
      toast({
        title: isFavorite 
          ? t('tenders.success.addedToFavorites', 'Added to favorites') 
          : t('tenders.success.removedFromFavorites', 'Removed from favorites'),
        description: isFavorite 
          ? t('tenders.success.addedToFavoritesDesc', 'The tender has been added to your favorites') 
          : t('tenders.success.removedFromFavoritesDesc', 'The tender has been removed from your favorites')
      });
      
      return true;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('tenders.errors.toggleFavoriteFailed', 'Failed to update favorite status'),
        description: err instanceof Error ? err.message : String(err)
      });
      return false;
    } finally {
      setLoading(prev => ({ ...prev, operation: false }));
    }
  }, [selectedTender, t, toast]);
  
  // Marchează o licitație ca relevantă
  const toggleRelevant = useCallback(async (tenderId: string, isRelevant: boolean) => {
    setLoading(prev => ({ ...prev, operation: true }));
    
    try {
      await tenderService.toggleRelevant(tenderId, isRelevant);
      
      // Actualizăm licitația în lista de licitații
      setTenders(prev => prev.map(tender => 
        tender.id === tenderId ? { ...tender, is_relevant: isRelevant } : tender
      ));
      
      // Actualizăm licitația selectată dacă este cazul
      if (selectedTender && selectedTender.id === tenderId) {
        setSelectedTender(prev => prev ? { ...prev, is_relevant: isRelevant } : null);
      }
      
      toast({
        title: isRelevant 
          ? t('tenders.success.markedAsRelevant', 'Marked as relevant') 
          : t('tenders.success.markedAsIrrelevant', 'Marked as irrelevant'),
        description: isRelevant 
          ? t('tenders.success.markedAsRelevantDesc', 'The tender has been marked as relevant') 
          : t('tenders.success.markedAsIrrelevantDesc', 'The tender has been marked as irrelevant')
      });
      
      return true;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('tenders.errors.toggleRelevantFailed', 'Failed to update relevance status'),
        description: err instanceof Error ? err.message : String(err)
      });
      return false;
    } finally {
      setLoading(prev => ({ ...prev, operation: false }));
    }
  }, [selectedTender, t, toast]);
  
  // Adaugă o notă la o licitație
  const addNote = useCallback(async (tenderId: string, content: string) => {
    setLoading(prev => ({ ...prev, operation: true }));
    
    try {
      const note = await tenderService.addNote(tenderId, content);
      
      // Actualizăm lista de note
      setNotes(prev => [note, ...prev]);
      
      toast({
        title: t('tenders.success.noteAdded', 'Note added'),
        description: t('tenders.success.noteAddedDesc', 'Your note has been added to the tender')
      });
      
      return true;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('tenders.errors.addNoteFailed', 'Failed to add note'),
        description: err instanceof Error ? err.message : String(err)
      });
      return false;
    } finally {
      setLoading(prev => ({ ...prev, operation: false }));
    }
  }, [t, toast]);
  
  // Creează o alertă
  const createAlert = useCallback(async (alert: Partial<TenderAlert>) => {
    setLoading(prev => ({ ...prev, operation: true }));
    
    try {
      const newAlert = await tenderService.createAlert(alert);
      
      // Actualizăm lista de alerte
      setAlerts(prev => [newAlert, ...prev]);
      
      toast({
        title: t('tenders.success.alertCreated', 'Alert created'),
        description: t('tenders.success.alertCreatedDesc', 'Your alert has been created successfully')
      });
      
      return newAlert;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('tenders.errors.createAlertFailed', 'Failed to create alert'),
        description: err instanceof Error ? err.message : String(err)
      });
      return null;
    } finally {
      setLoading(prev => ({ ...prev, operation: false }));
    }
  }, [t, toast]);
  
  // Actualizează o alertă
  const updateAlert = useCallback(async (alertId: string, alert: Partial<TenderAlert>) => {
    setLoading(prev => ({ ...prev, operation: true }));
    
    try {
      const updatedAlert = await tenderService.updateAlert(alertId, alert);
      
      // Actualizăm lista de alerte
      setAlerts(prev => prev.map(a => a.id === alertId ? updatedAlert : a));
      
      toast({
        title: t('tenders.success.alertUpdated', 'Alert updated'),
        description: t('tenders.success.alertUpdatedDesc', 'Your alert has been updated successfully')
      });
      
      return updatedAlert;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('tenders.errors.updateAlertFailed', 'Failed to update alert'),
        description: err instanceof Error ? err.message : String(err)
      });
      return null;
    } finally {
      setLoading(prev => ({ ...prev, operation: false }));
    }
  }, [t, toast]);
  
  // Șterge o alertă
  const deleteAlert = useCallback(async (alertId: string) => {
    setLoading(prev => ({ ...prev, operation: true }));
    
    try {
      await tenderService.deleteAlert(alertId);
      
      // Actualizăm lista de alerte
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      
      toast({
        title: t('tenders.success.alertDeleted', 'Alert deleted'),
        description: t('tenders.success.alertDeletedDesc', 'Your alert has been deleted successfully')
      });
      
      return true;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('tenders.errors.deleteAlertFailed', 'Failed to delete alert'),
        description: err instanceof Error ? err.message : String(err)
      });
      return false;
    } finally {
      setLoading(prev => ({ ...prev, operation: false }));
    }
  }, [t, toast]);
  
  // Abonează utilizatorul la o licitație
  const subscribeTender = useCallback(async (tenderId: string) => {
    setLoading(prev => ({ ...prev, operation: true }));
    
    try {
      await tenderService.subscribeTender(tenderId);
      
      toast({
        title: t('tenders.success.subscribed', 'Subscribed'),
        description: t('tenders.success.subscribedDesc', 'You have subscribed to this tender')
      });
      
      return true;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('tenders.errors.subscribeFailed', 'Failed to subscribe'),
        description: err instanceof Error ? err.message : String(err)
      });
      return false;
    } finally {
      setLoading(prev => ({ ...prev, operation: false }));
    }
  }, [t, toast]);
  
  // Dezabonează utilizatorul de la o licitație
  const unsubscribeTender = useCallback(async (tenderId: string) => {
    setLoading(prev => ({ ...prev, operation: true }));
    
    try {
      await tenderService.unsubscribeTender(tenderId);
      
      toast({
        title: t('tenders.success.unsubscribed', 'Unsubscribed'),
        description: t('tenders.success.unsubscribedDesc', 'You have unsubscribed from this tender')
      });
      
      return true;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('tenders.errors.unsubscribeFailed', 'Failed to unsubscribe'),
        description: err instanceof Error ? err.message : String(err)
      });
      return false;
    } finally {
      setLoading(prev => ({ ...prev, operation: false }));
    }
  }, [t, toast]);
  
  // Verifică dacă utilizatorul este abonat la o licitație
  const checkSubscription = useCallback(async (tenderId: string) => {
    try {
      return await tenderService.isSubscribed(tenderId);
    } catch (err) {
      console.error('Failed to check subscription:', err);
      return false;
    }
  }, []);
  
  // Descarcă un document al licitației
  const downloadDocument = useCallback(async (document: TenderDocument) => {
    setLoading(prev => ({ ...prev, operation: true }));
    
    try {
      await tenderService.downloadDocument(document);
      
      toast({
        title: t('tenders.success.documentDownloaded', 'Document downloaded'),
        description: t('tenders.success.documentDownloadedDesc', 'The document has been downloaded successfully')
      });
      
      return true;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('tenders.errors.downloadDocumentFailed', 'Failed to download document'),
        description: err instanceof Error ? err.message : String(err)
      });
      return false;
    } finally {
      setLoading(prev => ({ ...prev, operation: false }));
    }
  }, [t, toast]);
  
  return {
    tenders,
    selectedTender,
    filters,
    sort,
    pagination,
    alerts,
    notes,
    loading,
    error,
    setFilters,
    setSort,
    setPagination,
    loadTenders,
    getTenderById,
    loadAlerts,
    loadNotes,
    toggleFavorite,
    toggleRelevant,
    addNote,
    createAlert,
    updateAlert,
    deleteAlert,
    subscribeTender,
    unsubscribeTender,
    checkSubscription,
    downloadDocument,
    setSelectedTender
  };
}
