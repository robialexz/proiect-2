import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useUserActivity } from '@/hooks/useUserActivity';
import { UserActivity, UserActivityFilters } from '@/lib/user-activity-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon, 
  RefreshCw, 
  User, 
  FileText, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

const UserActivityPage: React.FC = () => {
  const { t } = useTranslation();
  
  // State pentru filtre
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  
  // Folosim hook-ul pentru activitățile utilizatorilor
  const {
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
    loadStats
  } = useUserActivity();
  
  // Încărcăm statisticile
  React.useEffect(() => {
    loadStats();
  }, [loadStats]);
  
  // Funcție pentru a actualiza filtrele
  const updateFilters = (newFilters: Partial<UserActivityFilters>) => {
    setFilters({ ...filters, ...newFilters });
  };
  
  // Funcție pentru a reseta filtrele
  const resetFilters = () => {
    setSearchTerm('');
    setFromDate(undefined);
    setToDate(undefined);
    setFilters({});
  };
  
  // Funcție pentru a verifica dacă există filtre active
  const hasActiveFilters = () => {
    return Object.values(filters).some(value => 
      value !== undefined && value !== '' && value !== false
    );
  };
  
  // Funcție pentru a formata data
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP, HH:mm:ss', { locale: ro });
  };
  
  // Funcție pentru a obține culoarea badge-ului în funcție de acțiune
  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'add':
      case 'insert':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'update':
      case 'edit':
      case 'modify':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delete':
      case 'remove':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'view':
      case 'read':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'login':
      case 'logout':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Funcție pentru a obține culoarea badge-ului în funcție de resursă
  const getResourceBadgeColor = (resource: string) => {
    switch (resource.toLowerCase()) {
      case 'project':
      case 'projects':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'material':
      case 'materials':
      case 'inventory':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'user':
      case 'users':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'tender':
      case 'tenders':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'report':
      case 'reports':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Funcție pentru a gestiona paginarea
  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };
  
  // Funcție pentru a gestiona sortarea
  const handleSort = (field: string) => {
    if (sort.field === field) {
      setSort({
        field,
        direction: sort.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setSort({
        field,
        direction: 'asc'
      });
    }
  };
  
  // Funcție pentru a obține iconița de sortare
  const getSortIcon = (field: string) => {
    if (sort.field !== field) {
      return null;
    }
    
    return sort.direction === 'asc' 
      ? <ChevronLeft className="h-4 w-4" />
      : <ChevronRight className="h-4 w-4" />;
  };
  
  // Funcție pentru a obține detaliile activității
  const getActivityDetails = (activity: UserActivity) => {
    if (!activity.details) return null;
    
    return (
      <div className="mt-2 text-xs text-muted-foreground">
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(activity.details, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>{t('userActivity.pageTitle', 'User Activity')}</title>
      </Helmet>
      
      <div className="container mx-auto py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t('userActivity.title', 'User Activity')}
              </h1>
              <p className="text-muted-foreground">
                {t('userActivity.subtitle', 'Monitor and track user actions in the system')}
              </p>
            </div>
            
            <Button
              onClick={() => {
                loadActivities();
                loadStats();
              }}
              disabled={loading.activities || loading.stats}
            >
              {loading.activities || loading.stats ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {t('userActivity.refresh', 'Refresh')}
            </Button>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {t('userActivity.stats.totalActivities', 'Total Activities')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalActivities}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {t('userActivity.stats.uniqueUsers', 'Unique Users')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(stats.activitiesByUser).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {t('userActivity.stats.uniqueActions', 'Unique Actions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(stats.activitiesByAction).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {t('userActivity.stats.uniqueResources', 'Unique Resources')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(stats.activitiesByResource).length}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('userActivity.activityLog', 'Activity Log')}</CardTitle>
            <CardDescription>
              {t('userActivity.activityLogDescription', 'View and filter user activities in the system')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder={t('userActivity.filters.search', 'Search activities...')}
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateFilters({ 
                          userId: searchTerm.includes('@') ? searchTerm : undefined,
                          action: !searchTerm.includes('@') ? searchTerm : undefined
                        });
                      }
                    }}
                  />
                  {searchTerm && (
                    <button
                      className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700"
                      onClick={() => {
                        setSearchTerm('');
                        const { userId, action, ...rest } = filters;
                        setFilters(rest);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex items-center">
                        <Filter className="h-4 w-4 mr-2" />
                        {t('userActivity.filters.filter', 'Filter')}
                        {hasActiveFilters() && (
                          <Badge variant="secondary" className="ml-2 px-1 py-0 h-5 min-w-5 flex items-center justify-center">
                            {Object.keys(filters).length}
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <h4 className="font-medium">
                          {t('userActivity.filters.filterTitle', 'Filter Activities')}
                        </h4>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            {t('userActivity.filters.action', 'Action')}
                          </label>
                          <Select
                            value={filters.action || ''}
                            onValueChange={(value) => updateFilters({ action: value || undefined })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('userActivity.filters.allActions', 'All Actions')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">
                                {t('userActivity.filters.allActions', 'All Actions')}
                              </SelectItem>
                              <SelectItem value="create">Create</SelectItem>
                              <SelectItem value="update">Update</SelectItem>
                              <SelectItem value="delete">Delete</SelectItem>
                              <SelectItem value="view">View</SelectItem>
                              <SelectItem value="login">Login</SelectItem>
                              <SelectItem value="logout">Logout</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            {t('userActivity.filters.resource', 'Resource')}
                          </label>
                          <Select
                            value={filters.resource || ''}
                            onValueChange={(value) => updateFilters({ resource: value || undefined })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('userActivity.filters.allResources', 'All Resources')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">
                                {t('userActivity.filters.allResources', 'All Resources')}
                              </SelectItem>
                              <SelectItem value="project">Project</SelectItem>
                              <SelectItem value="material">Material</SelectItem>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="tender">Tender</SelectItem>
                              <SelectItem value="report">Report</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            {t('userActivity.filters.date', 'Date Range')}
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                  {fromDate ? format(fromDate, 'PPP', { locale: ro }) : t('userActivity.filters.from', 'From')}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={fromDate}
                                  onSelect={(date) => {
                                    setFromDate(date);
                                    if (date) {
                                      updateFilters({ fromDate: date.toISOString() });
                                    } else {
                                      const { fromDate, ...rest } = filters;
                                      setFilters(rest);
                                    }
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                  {toDate ? format(toDate, 'PPP', { locale: ro }) : t('userActivity.filters.to', 'To')}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={toDate}
                                  onSelect={(date) => {
                                    setToDate(date);
                                    if (date) {
                                      updateFilters({ toDate: date.toISOString() });
                                    } else {
                                      const { toDate, ...rest } = filters;
                                      setFilters(rest);
                                    }
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetFilters}
                            disabled={!hasActiveFilters()}
                          >
                            <X className="h-4 w-4 mr-2" />
                            {t('userActivity.filters.reset', 'Reset')}
                          </Button>
                          
                          <Button
                            size="sm"
                            onClick={() => updateFilters({})}
                          >
                            {t('userActivity.filters.apply', 'Apply Filters')}
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              {/* Active filters */}
              {hasActiveFilters() && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {filters.userId && (
                    <Badge variant="secondary" className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {t('userActivity.filters.userFilter', 'User')}: {filters.userId}
                      <button
                        className="ml-1 text-gray-500 hover:text-gray-700"
                        onClick={() => {
                          const { userId, ...rest } = filters;
                          setFilters(rest);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  
                  {filters.action && (
                    <Badge variant="secondary" className="flex items-center">
                      <Activity className="h-3 w-3 mr-1" />
                      {t('userActivity.filters.actionFilter', 'Action')}: {filters.action}
                      <button
                        className="ml-1 text-gray-500 hover:text-gray-700"
                        onClick={() => {
                          const { action, ...rest } = filters;
                          setFilters(rest);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  
                  {filters.resource && (
                    <Badge variant="secondary" className="flex items-center">
                      <FileText className="h-3 w-3 mr-1" />
                      {t('userActivity.filters.resourceFilter', 'Resource')}: {filters.resource}
                      <button
                        className="ml-1 text-gray-500 hover:text-gray-700"
                        onClick={() => {
                          const { resource, ...rest } = filters;
                          setFilters(rest);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  
                  {filters.fromDate && (
                    <Badge variant="secondary" className="flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {t('userActivity.filters.fromFilter', 'From')}: {format(new Date(filters.fromDate), 'PPP', { locale: ro })}
                      <button
                        className="ml-1 text-gray-500 hover:text-gray-700"
                        onClick={() => {
                          setFromDate(undefined);
                          const { fromDate, ...rest } = filters;
                          setFilters(rest);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  
                  {filters.toDate && (
                    <Badge variant="secondary" className="flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {t('userActivity.filters.toFilter', 'To')}: {format(new Date(filters.toDate), 'PPP', { locale: ro })}
                      <button
                        className="ml-1 text-gray-500 hover:text-gray-700"
                        onClick={() => {
                          setToDate(undefined);
                          const { toDate, ...rest } = filters;
                          setFilters(rest);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={resetFilters}
                  >
                    {t('userActivity.filters.clearAll', 'Clear All')}
                  </Button>
                </div>
              )}
              
              <div className="rounded-md border">
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="w-[180px] cursor-pointer"
                          onClick={() => handleSort('created_at')}
                        >
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {t('userActivity.table.timestamp', 'Timestamp')}
                            {getSortIcon('created_at')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="w-[120px] cursor-pointer"
                          onClick={() => handleSort('user_id')}
                        >
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {t('userActivity.table.user', 'User')}
                            {getSortIcon('user_id')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="w-[100px] cursor-pointer"
                          onClick={() => handleSort('action')}
                        >
                          <div className="flex items-center">
                            <Activity className="h-4 w-4 mr-1" />
                            {t('userActivity.table.action', 'Action')}
                            {getSortIcon('action')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer"
                          onClick={() => handleSort('resource')}
                        >
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            {t('userActivity.table.resource', 'Resource')}
                            {getSortIcon('resource')}
                          </div>
                        </TableHead>
                        <TableHead>
                          {t('userActivity.table.details', 'Details')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading.activities ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <div className="flex flex-col items-center">
                              <div className="relative">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <div className="absolute inset-0 border-2 border-primary/20 rounded-full"></div>
                              </div>
                              <p className="mt-2 text-sm text-gray-500">
                                {t('userActivity.loading', 'Loading activities...')}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : activities.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            {t('userActivity.noActivities', 'No activities found.')}
                          </TableCell>
                        </TableRow>
                      ) : (
                        activities.map((activity) => (
                          <TableRow key={activity.id}>
                            <TableCell className="font-mono text-xs">
                              {formatDate(activity.created_at)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1 text-gray-500" />
                                <span className="truncate max-w-[100px]" title={activity.user_id}>
                                  {activity.user_id.substring(0, 8)}...
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getActionBadgeColor(activity.action)}>
                                {activity.action}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Badge variant="outline" className={getResourceBadgeColor(activity.resource)}>
                                  {activity.resource}
                                </Badge>
                                {activity.resource_id && (
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    {activity.resource_id.substring(0, 8)}...
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getActivityDetails(activity)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {t('userActivity.pagination.showing', 'Showing')} {activities.length} {t('userActivity.pagination.of', 'of')} {pagination.total} {t('userActivity.pagination.activities', 'activities')}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.page === 1 || loading.activities}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1 || loading.activities}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    {t('userActivity.pagination.page', 'Page')} {pagination.page} {t('userActivity.pagination.of', 'of')} {Math.ceil(pagination.total / pagination.pageSize)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize) || loading.activities}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.ceil(pagination.total / pagination.pageSize))}
                    disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize) || loading.activities}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default UserActivityPage;
