import { supabase } from './supabase';
import { errorMonitoring, ErrorSource, ErrorSeverity } from './error-monitoring';

export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface UserActivityFilters {
  userId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  fromDate?: string;
  toDate?: string;
}

export interface UserActivitySort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface UserActivityPagination {
  page: number;
  pageSize: number;
  total: number;
}

class UserActivityService {
  /**
   * Înregistrează o activitate a utilizatorului
   */
  async recordActivity(
    action: string,
    resource: string,
    resourceId?: string,
    details?: Record<string, any>
  ): Promise<UserActivity | null> {
    try {
      // Obținem utilizatorul curent
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // Obținem informații despre browser și IP
      const ipAddress = await this.getIPAddress();
      const userAgent = navigator.userAgent;
      
      // Înregistrăm activitatea
      const { data, error } = await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          action,
          resource,
          resource_id: resourceId,
          details,
          ip_address: ipAddress,
          user_agent: userAgent,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to record user activity',
        source: ErrorSource.API,
        severity: ErrorSeverity.WARNING,
        error: error as Error
      });
      
      // Nu aruncăm eroarea mai departe pentru a nu întrerupe fluxul aplicației
      console.error('Failed to record user activity:', error);
      return null;
    }
  }
  
  /**
   * Obține activitățile utilizatorilor
   */
  async getActivities(
    filters?: UserActivityFilters,
    sort?: UserActivitySort,
    pagination?: UserActivityPagination
  ): Promise<{ data: UserActivity[], pagination: UserActivityPagination }> {
    try {
      // Construim query-ul de bază
      let query = supabase
        .from('user_activities')
        .select('*');
      
      // Aplicăm filtrele
      if (filters) {
        if (filters.userId) {
          query = query.eq('user_id', filters.userId);
        }
        
        if (filters.action) {
          query = query.eq('action', filters.action);
        }
        
        if (filters.resource) {
          query = query.eq('resource', filters.resource);
        }
        
        if (filters.resourceId) {
          query = query.eq('resource_id', filters.resourceId);
        }
        
        if (filters.fromDate) {
          query = query.gte('created_at', filters.fromDate);
        }
        
        if (filters.toDate) {
          query = query.lte('created_at', filters.toDate);
        }
      }
      
      // Obținem numărul total de înregistrări pentru paginare
      const { count, error: countError } = await supabase
        .from('user_activities')
        .select('id', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      // Aplicăm sortarea
      if (sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }
      
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
        message: 'Failed to get user activities',
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține activitățile utilizatorului curent
   */
  async getCurrentUserActivities(
    filters?: Omit<UserActivityFilters, 'userId'>,
    sort?: UserActivitySort,
    pagination?: UserActivityPagination
  ): Promise<{ data: UserActivity[], pagination: UserActivityPagination }> {
    try {
      // Obținem utilizatorul curent
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          data: [],
          pagination: {
            page: pagination?.page || 1,
            pageSize: pagination?.pageSize || 0,
            total: 0
          }
        };
      }
      
      // Adăugăm ID-ul utilizatorului curent la filtre
      const updatedFilters = {
        ...filters,
        userId: user.id
      };
      
      return this.getActivities(updatedFilters, sort, pagination);
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to get current user activities',
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține acțiunile unice
   */
  async getUniqueActions(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('action')
        .order('action');
      
      if (error) throw error;
      
      // Extragem acțiunile unice
      const actions = [...new Set(data.map(item => item.action))];
      
      return actions;
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to get unique actions',
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține resursele unice
   */
  async getUniqueResources(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('resource')
        .order('resource');
      
      if (error) throw error;
      
      // Extragem resursele unice
      const resources = [...new Set(data.map(item => item.resource))];
      
      return resources;
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to get unique resources',
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține statistici despre activitățile utilizatorilor
   */
  async getActivityStats(): Promise<{
    totalActivities: number;
    activitiesByAction: Record<string, number>;
    activitiesByResource: Record<string, number>;
    activitiesByUser: Record<string, number>;
    recentTrends: { date: string; count: number }[];
  }> {
    try {
      // Obținem numărul total de activități
      const { count: totalActivities, error: totalError } = await supabase
        .from('user_activities')
        .select('id', { count: 'exact', head: true });
      
      if (totalError) throw totalError;
      
      // Obținem numărul de activități pentru fiecare acțiune
      const { data: activitiesByActionData, error: actionError } = await supabase
        .from('user_activities')
        .select('action, count')
        .group('action');
      
      if (actionError) throw actionError;
      
      const activitiesByAction: Record<string, number> = {};
      activitiesByActionData?.forEach(item => {
        activitiesByAction[item.action] = item.count;
      });
      
      // Obținem numărul de activități pentru fiecare resursă
      const { data: activitiesByResourceData, error: resourceError } = await supabase
        .from('user_activities')
        .select('resource, count')
        .group('resource');
      
      if (resourceError) throw resourceError;
      
      const activitiesByResource: Record<string, number> = {};
      activitiesByResourceData?.forEach(item => {
        activitiesByResource[item.resource] = item.count;
      });
      
      // Obținem numărul de activități pentru fiecare utilizator
      const { data: activitiesByUserData, error: userError } = await supabase
        .from('user_activities')
        .select('user_id, count')
        .group('user_id');
      
      if (userError) throw userError;
      
      const activitiesByUser: Record<string, number> = {};
      activitiesByUserData?.forEach(item => {
        activitiesByUser[item.user_id] = item.count;
      });
      
      // Obținem tendințele recente (ultimele 7 zile)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: recentTrendsData, error: trendsError } = await supabase
        .from('user_activities')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString());
      
      if (trendsError) throw trendsError;
      
      const recentTrends: { date: string; count: number }[] = [];
      
      // Grupăm activitățile pe zile
      if (recentTrendsData) {
        const activitiesByDay: Record<string, number> = {};
        
        recentTrendsData.forEach(item => {
          const date = new Date(item.created_at).toISOString().split('T')[0];
          activitiesByDay[date] = (activitiesByDay[date] || 0) + 1;
        });
        
        // Creăm un array pentru ultimele 7 zile
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          recentTrends.unshift({
            date: dateStr,
            count: activitiesByDay[dateStr] || 0
          });
        }
      }
      
      return {
        totalActivities: totalActivities || 0,
        activitiesByAction,
        activitiesByResource,
        activitiesByUser,
        recentTrends
      };
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to get activity stats',
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      
      // Returnăm valori implicite în caz de eroare
      return {
        totalActivities: 0,
        activitiesByAction: {},
        activitiesByResource: {},
        activitiesByUser: {},
        recentTrends: []
      };
    }
  }
  
  /**
   * Obține adresa IP a utilizatorului
   */
  private async getIPAddress(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Failed to get IP address:', error);
      return 'unknown';
    }
  }
}

export const userActivityService = new UserActivityService();
