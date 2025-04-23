import React from 'react';
import { UserWithRole } from '@/models/user';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Calendar, Mail, Phone, Briefcase, Building, Shield } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UserDetailsDialogProps {
  user: UserWithRole | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  user,
  open,
  onOpenChange
}) => {
  const { t } = useTranslation();

  // Funcție pentru a formata data
  const formatDate = (dateString?: string) => {
    if (!dateString) return t('admin.users.never', 'Never');
    return format(new Date(dateString), 'PPp', { locale: ro });
  };

  // Funcție pentru a obține culoarea badge-ului în funcție de rol
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'user':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="h-5 w-5 mr-2 text-primary" />
            {t('admin.userDetails.title', 'User Details')}
          </DialogTitle>
          <DialogDescription>
            {t('admin.userDetails.description', 'Detailed information about the user.')}
          </DialogDescription>
        </DialogHeader>

        {user && (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">
                    {user.user_metadata?.full_name || t('admin.users.unnamed', 'Unnamed')}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                  {user.role}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">
                  {t('admin.userDetails.basicInfo', 'Basic Information')}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {t('admin.userDetails.email', 'Email')}
                    </p>
                    <p className="text-sm">{user.email}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {t('admin.userDetails.phone', 'Phone')}
                    </p>
                    <p className="text-sm">
                      {user.user_metadata?.phone || t('admin.userDetails.notProvided', 'Not provided')}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {t('admin.userDetails.position', 'Position')}
                    </p>
                    <p className="text-sm">
                      {user.user_metadata?.position || t('admin.userDetails.notProvided', 'Not provided')}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Building className="h-3 w-3 mr-1" />
                      {t('admin.userDetails.department', 'Department')}
                    </p>
                    <p className="text-sm">
                      {user.user_metadata?.department || t('admin.userDetails.notProvided', 'Not provided')}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">
                  {t('admin.userDetails.accountInfo', 'Account Information')}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {t('admin.userDetails.createdAt', 'Created At')}
                    </p>
                    <p className="text-sm">{formatDate(user.created_at)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {t('admin.userDetails.lastLogin', 'Last Login')}
                    </p>
                    <p className="text-sm">{formatDate(user.last_sign_in_at)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Shield className="h-3 w-3 mr-1" />
                      {t('admin.userDetails.role', 'Role')}
                    </p>
                    <p className="text-sm">{user.role}</p>
                  </div>
                </div>
              </div>

              {user.permissions && user.permissions.length > 0 && (
                <>
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">
                      {t('admin.userDetails.permissions', 'Permissions')}
                    </h4>
                    
                    <div className="flex flex-wrap gap-2">
                      {user.permissions.map((permission) => (
                        <Badge key={permission.id} variant="outline">
                          {permission.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            {t('common.close', 'Close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
