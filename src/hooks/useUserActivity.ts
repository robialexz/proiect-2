import { useState, useEffect, useCallback } from 'react';
import { 
  userActivityService, 
  UserActivity, 
  UserActivityFilters, 
  UserActivitySort, 
  UserActivityPagination 
} from '@/lib/user-activity-service';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

export function useUserActivity() {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // State pentru activități
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [filters, setFilters] = useState<UserActivityFilters>({});
  const [sort, setSort] = useState<UserActivitySort>({ field: 'created_at', direction: 'desc' });
  const [pagination, setPagination] = useState<UserActivityPagination>({ page: 1, pageSize: 10, total: 0 });
  
  // State pentru statistici
  const [stats, setStats] = useState<{
    totalActivities: number;
    activitiesByAction: Record<string, number>;
    activitiesByResource: Record<string, number>;
    activitiesByUser: Record<string, number>;
    recentTrends: { date: string; count: number }[];
  }>({
    totalActivities: 0,
    activitiesByAction: {},
    activitiesByResource: {},
    activitiesByUser: {},
    recentTrends: []
  });
  
  // State pentru loading și erori
  const [loading, setLoading] = useState({
    activities: false,
    stats: false,
    record: false
  });
  const [error, setError] = useState<string | null>(null);
  
  // Încărcăm activitățile
  const loadActivities = useCallback(async () => {
    setLoading(prev => ({ ...prev, activities: true }));
    setError(null);
    
    try {
      const { data, pagination: newPagination } = await userActivityService.getActivities(
        filters,
        sort,
        pagination
      );
      
      setActivities(data);
      setPagination(newPagination);
    } catch (err) {
      setError(t('userActivity.errors.loadFailed', 'Failed to load user activities'));
      toast({
        variant: 'destructive',
        title: t('userActivity.errors.loadFailed', 'Failed to load user activities'),
        description: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setLoading(prev => ({ ...prev, activities: false }));
    }
  }, [filters, sort, pagination, t, toast]);
  
  // Încărcăm statisticile
  const loadStats = useCallback(async () => {
    setLoading(prev => ({ ...prev, stats: true }));
    
    try {
      const statsData = await userActivityService.getActivityStats();
      setStats(statsData);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('userActivity.errors.loadStatsFailed', 'Failed to load activity statistics'),
        description: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  }, [t, toast]);
  
  // Încărcăm activitățile utilizatorului curent
  const loadCurrentUserActivities = useCallback(async () => {
    setLoading(prev => ({ ...prev, activities: true }));
    setError(null);
    
    try {
      const { data, pagination: newPagination } = await userActivityService.getCurrentUserActivities(
        filters,
        sort,
        pagination
      );
      
      setActivities(data);
      setPagination(newPagination);
    } catch (err) {
      setError(t('userActivity.errors.loadFailed', 'Failed to load user activities'));
      toast({
        variant: 'destructive',
        title: t('userActivity.errors.loadFailed', 'Failed to load user activities'),
        description: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setLoading(prev => ({ ...prev, activities: false }));
    }
  }, [filters, sort, pagination, t, toast]);
  
  // Înregistrăm o activitate
  const recordActivity = useCallback(async (
    action: string,
    resource: string,
    resourceId?: string,
    details?: Record<string, any>
  ) => {
    setLoading(prev => ({ ...prev, record: true }));
    
    try {
      await userActivityService.recordActivity(action, resource, resourceId, details);
      return true;
    } catch (err) {
      console.error('Failed to record activity:', err);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, record: false }));
    }
  }, []);
  
  // Încărcăm activitățile la inițializare
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);
  
  return {
    activities,
    filters,
    sort,
    pagination,
    stats,
    loading,
    error,
    setFilters,
    setSort,
    setPagination,
    loadActivities,
    loadCurrentUserActivities,
    loadStats,
    recordActivity
  };
}
