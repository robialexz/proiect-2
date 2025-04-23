import { supabase } from './supabase';
import { 
  Tender, 
  TenderDocument, 
  TenderFilters, 
  TenderSort, 
  TenderPagination,
  TenderAlert,
  TenderNote
} from '@/models/tender';
import { errorMonitoring, ErrorSource, ErrorSeverity } from './error-monitoring';

class TenderService {
  /**
   * Obține toate licitațiile
   */
  async getAllTenders(
    filters?: TenderFilters,
    sort?: TenderSort,
    pagination?: TenderPagination
  ): Promise<{ data: Tender[], pagination: TenderPagination }> {
    try {
      // Construim query-ul de bază
      let query = supabase
        .from('tenders')
        .select(`
          id, title, description, reference_number, publication_date, 
          closing_date, estimated_value, currency, contracting_authority, 
          authority_type, cpv_code, cpv_description, location, status, 
          url, source, created_at, updated_at, is_favorite, is_relevant, notes
        `);
      
      // Aplicăm filtrele
      if (filters) {
        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,reference_number.ilike.%${filters.search}%`);
        }
        
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        
        if (filters.cpvCode) {
          query = query.eq('cpv_code', filters.cpvCode);
        }
        
        if (filters.authority) {
          query = query.ilike('contracting_authority', `%${filters.authority}%`);
        }
        
        if (filters.minValue !== undefined) {
          query = query.gte('estimated_value', filters.minValue);
        }
        
        if (filters.maxValue !== undefined) {
          query = query.lte('estimated_value', filters.maxValue);
        }
        
        if (filters.fromDate) {
          query = query.gte('publication_date', filters.fromDate);
        }
        
        if (filters.toDate) {
          query = query.lte('closing_date', filters.toDate);
        }
        
        if (filters.location) {
          query = query.ilike('location', `%${filters.location}%`);
        }
        
        if (filters.onlyFavorites) {
          query = query.eq('is_favorite', true);
        }
        
        if (filters.onlyRelevant) {
          query = query.eq('is_relevant', true);
        }
      }
      
      // Aplicăm sortarea
      if (sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('publication_date', { ascending: false });
      }
      
      // Obținem numărul total de înregistrări pentru paginare
      const { count, error: countError } = await supabase
        .from('tenders')
        .select('id', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      // Aplicăm paginarea
      if (pagination) {
        const from = (pagination.page - 1) * pagination.pageSize;
        const to = from + pagination.pageSize - 1;
        query = query.range(from, to);
      }
      
      // Executăm query-ul
      const { data, error } = await query;
      
      if (error) throw error;
      
      return {
        data: data || [],
        pagination: {
          page: pagination?.page || 1,
          pageSize: pagination?.pageSize || (data?.length || 0),
          total: count || (data?.length || 0)
        }
      };
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to get all tenders',
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține o licitație după ID
   */
  async getTenderById(tenderId: string): Promise<Tender | null> {
    try {
      const { data, error } = await supabase
        .from('tenders')
        .select(`
          id, title, description, reference_number, publication_date, 
          closing_date, estimated_value, currency, contracting_authority, 
          authority_type, cpv_code, cpv_description, location, status, 
          url, source, created_at, updated_at, is_favorite, is_relevant, notes,
          contact_person, contact_email, contact_phone
        `)
        .eq('id', tenderId)
        .single();
      
      if (error) throw error;
      if (!data) return null;
      
      // Obținem documentele licitației
      const { data: documents, error: documentsError } = await supabase
        .from('tender_documents')
        .select('*')
        .eq('tender_id', tenderId);
      
      if (documentsError) throw documentsError;
      
      return { ...data, documents: documents || [] };
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to get tender by ID: ${tenderId}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Marchează o licitație ca favorită
   */
  async toggleFavorite(tenderId: string, isFavorite: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('tenders')
        .update({ is_favorite: isFavorite })
        .eq('id', tenderId);
      
      if (error) throw error;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to toggle favorite for tender: ${tenderId}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Marchează o licitație ca relevantă
   */
  async toggleRelevant(tenderId: string, isRelevant: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('tenders')
        .update({ is_relevant: isRelevant })
        .eq('id', tenderId);
      
      if (error) throw error;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to toggle relevant for tender: ${tenderId}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Adaugă o notă la o licitație
   */
  async addNote(tenderId: string, content: string): Promise<TenderNote> {
    try {
      const { data, error } = await supabase
        .from('tender_notes')
        .insert({
          tender_id: tenderId,
          content,
          user_id: 'current_user', // Ar trebui înlocuit cu ID-ul utilizatorului curent
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Failed to add note');
      
      return data;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to add note to tender: ${tenderId}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține notele unei licitații
   */
  async getNotes(tenderId: string): Promise<TenderNote[]> {
    try {
      const { data, error } = await supabase
        .from('tender_notes')
        .select('*')
        .eq('tender_id', tenderId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to get notes for tender: ${tenderId}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Creează o alertă pentru licitații
   */
  async createAlert(alert: Partial<TenderAlert>): Promise<TenderAlert> {
    try {
      const { data, error } = await supabase
        .from('tender_alerts')
        .insert({
          ...alert,
          user_id: 'current_user', // Ar trebui înlocuit cu ID-ul utilizatorului curent
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Failed to create alert');
      
      return data;
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to create tender alert',
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține alertele utilizatorului curent
   */
  async getAlerts(): Promise<TenderAlert[]> {
    try {
      const { data, error } = await supabase
        .from('tender_alerts')
        .select('*')
        .eq('user_id', 'current_user') // Ar trebui înlocuit cu ID-ul utilizatorului curent
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to get tender alerts',
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Actualizează o alertă
   */
  async updateAlert(alertId: string, alert: Partial<TenderAlert>): Promise<TenderAlert> {
    try {
      const { data, error } = await supabase
        .from('tender_alerts')
        .update({
          ...alert,
          updated_at: new Date().toISOString()
        })
        .eq('id', alertId)
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Failed to update alert');
      
      return data;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to update tender alert: ${alertId}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Șterge o alertă
   */
  async deleteAlert(alertId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tender_alerts')
        .delete()
        .eq('id', alertId);
      
      if (error) throw error;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to delete tender alert: ${alertId}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Abonează utilizatorul la o licitație
   */
  async subscribeTender(tenderId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tender_subscriptions')
        .insert({
          tender_id: tenderId,
          user_id: 'current_user', // Ar trebui înlocuit cu ID-ul utilizatorului curent
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to subscribe to tender: ${tenderId}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Dezabonează utilizatorul de la o licitație
   */
  async unsubscribeTender(tenderId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tender_subscriptions')
        .delete()
        .eq('tender_id', tenderId)
        .eq('user_id', 'current_user'); // Ar trebui înlocuit cu ID-ul utilizatorului curent
      
      if (error) throw error;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to unsubscribe from tender: ${tenderId}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Verifică dacă utilizatorul este abonat la o licitație
   */
  async isSubscribed(tenderId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('tender_subscriptions')
        .select('id')
        .eq('tender_id', tenderId)
        .eq('user_id', 'current_user') // Ar trebui înlocuit cu ID-ul utilizatorului curent
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      return !!data;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to check subscription for tender: ${tenderId}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține licitațiile la care utilizatorul este abonat
   */
  async getSubscribedTenders(): Promise<Tender[]> {
    try {
      const { data, error } = await supabase
        .from('tender_subscriptions')
        .select('tender_id')
        .eq('user_id', 'current_user'); // Ar trebui înlocuit cu ID-ul utilizatorului curent
      
      if (error) throw error;
      
      if (!data || data.length === 0) return [];
      
      const tenderIds = data.map(subscription => subscription.tender_id);
      
      const { data: tenders, error: tendersError } = await supabase
        .from('tenders')
        .select('*')
        .in('id', tenderIds);
      
      if (tendersError) throw tendersError;
      
      return tenders || [];
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to get subscribed tenders',
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Descarcă un document al licitației
   */
  async downloadDocument(document: TenderDocument): Promise<void> {
    try {
      // Simulăm descărcarea documentului
      window.open(document.url, '_blank');
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to download document: ${document.id}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
}

export const tenderService = new TenderService();
