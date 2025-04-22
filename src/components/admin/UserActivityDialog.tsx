import React, { useState, useEffect } from 'react';
import { UserWithRole, UserActivity } from '@/models/user';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Clock, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { userManagementService } from '@/lib/user-management-service';

interface UserActivityDialogProps {
  user: UserWithRole | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserActivityDialog: React.FC<UserActivityDialogProps> = ({
  user,
  open,
  onOpenChange
}) => {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Încărcăm activitățile utilizatorului când se deschide dialogul
  useEffect(() => {
    if (open && user) {
      loadUserActivities(user.id);
    }
  }, [open, user]);

  // Funcție pentru a încărca activitățile utilizatorului
  const loadUserActivities = async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await userManagementService.getUserActivities(userId);
      setActivities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // Funcție pentru a formata data
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPp', { locale: ro });
  };

  // Funcție pentru a obține iconul în funcție de acțiune
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'update':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'delete':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Funcție pentru a obține culoarea badge-ului în funcție de acțiune
  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'update':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delete':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-primary" />
            {t('admin.userActivity.title', 'User Activity')}
          </DialogTitle>
          <DialogDescription>
            {user && (
              <span>
                {t('admin.userActivity.description', 'Activity history for {{email}}', {
                  email: user.email
                })}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] mt-4">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-sm text-gray-500">
                  {t('admin.userActivity.loading', 'Loading activity...')}
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-40">
              <div className="flex flex-col items-center">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <p className="mt-2 text-sm text-red-500">{error}</p>
              </div>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <div className="flex flex-col items-center">
                <Activity className="h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  {t('admin.userActivity.noActivity', 'No activity found for this user.')}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 border rounded-lg bg-card"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      {getActionIcon(activity.action)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium">
                            {t(`admin.userActivity.actions.${activity.action}`, activity.action)}
                            {' '}
                            <span className="text-muted-foreground">
                              {activity.resource}
                            </span>
                          </h4>
                          {activity.details && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {JSON.stringify(activity.details)}
                            </p>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(activity.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            {t('common.close', 'Close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserActivityDialog;
