import React, { useState, useEffect } from 'react';
import { UserWithRole, Role } from '@/models/user';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Shield, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface UserRoleDialogProps {
  user: UserWithRole | null;
  roles: Role[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateRole: (userId: string, role: string) => Promise<void>;
  loading: boolean;
}

const UserRoleDialog: React.FC<UserRoleDialogProps> = ({
  user,
  roles,
  open,
  onOpenChange,
  onUpdateRole,
  loading
}) => {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Actualizăm rolul selectat când se schimbă utilizatorul
  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  // Gestionăm actualizarea rolului
  const handleUpdateRole = async () => {
    if (!user) return;
    
    try {
      setError(null);
      await onUpdateRole(user.id, selectedRole);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-primary" />
            {t('admin.userRole.title', 'Edit User Role')}
          </DialogTitle>
          <DialogDescription>
            {t('admin.userRole.description', 'Change the role and permissions for this user.')}
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user-email">
                {t('admin.userRole.user', 'User')}
              </Label>
              <div id="user-email" className="px-3 py-2 rounded-md bg-muted">
                {user.email}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">
                {t('admin.userRole.role', 'Role')}
              </Label>
              <Select
                value={selectedRole}
                onValueChange={setSelectedRole}
                disabled={loading}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder={t('admin.userRole.selectRole', 'Select a role')} />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name} - {role.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('admin.userRole.error', 'Error')}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleUpdateRole} disabled={loading || !selectedRole}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('admin.userRole.updating', 'Updating...')}
              </>
            ) : (
              t('admin.userRole.updateRole', 'Update Role')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserRoleDialog;
