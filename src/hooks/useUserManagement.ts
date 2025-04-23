import { useState, useEffect, useCallback } from 'react';
import { userManagementService } from '@/lib/user-management-service';
import { User, UserWithRole, Role, Permission, UserActivity } from '@/models/user';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

export function useUserManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState({
    users: false,
    roles: false,
    permissions: false,
    activities: false,
    userDetails: false,
    updateRole: false
  });
  const [error, setError] = useState<string | null>(null);

  // Încărcăm toți utilizatorii
  const loadUsers = useCallback(async () => {
    setLoading(prev => ({ ...prev, users: true }));
    setError(null);
    
    try {
      const data = await userManagementService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(t('admin.errors.loadUsers', 'Failed to load users'));
      toast({
        variant: 'destructive',
        title: t('admin.errors.loadUsers', 'Failed to load users'),
        description: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, [t, toast]);

  // Încărcăm toate rolurile
  const loadRoles = useCallback(async () => {
    setLoading(prev => ({ ...prev, roles: true }));
    
    try {
      const data = await userManagementService.getAllRoles();
      setRoles(data);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('admin.errors.loadRoles', 'Failed to load roles'),
        description: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setLoading(prev => ({ ...prev, roles: false }));
    }
  }, [t, toast]);

  // Încărcăm toate permisiunile
  const loadPermissions = useCallback(async () => {
    setLoading(prev => ({ ...prev, permissions: true }));
    
    try {
      const data = await userManagementService.getAllPermissions();
      setPermissions(data);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('admin.errors.loadPermissions', 'Failed to load permissions'),
        description: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setLoading(prev => ({ ...prev, permissions: false }));
    }
  }, [t, toast]);

  // Încărcăm toate activitățile
  const loadActivities = useCallback(async () => {
    setLoading(prev => ({ ...prev, activities: true }));
    
    try {
      const data = await userManagementService.getAllActivities();
      setActivities(data);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('admin.errors.loadActivities', 'Failed to load activities'),
        description: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setLoading(prev => ({ ...prev, activities: false }));
    }
  }, [t, toast]);

  // Încărcăm detaliile unui utilizator
  const loadUserDetails = useCallback(async (userId: string) => {
    setLoading(prev => ({ ...prev, userDetails: true }));
    
    try {
      const data = await userManagementService.getUserById(userId);
      setSelectedUser(data);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('admin.errors.loadUserDetails', 'Failed to load user details'),
        description: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setLoading(prev => ({ ...prev, userDetails: false }));
    }
  }, [t, toast]);

  // Actualizăm rolul unui utilizator
  const updateUserRole = useCallback(async (userId: string, role: string) => {
    setLoading(prev => ({ ...prev, updateRole: true }));
    
    try {
      await userManagementService.updateUserRole(userId, role);
      
      // Actualizăm lista de utilizatori
      await loadUsers();
      
      // Actualizăm utilizatorul selectat dacă este cazul
      if (selectedUser && selectedUser.id === userId) {
        await loadUserDetails(userId);
      }
      
      toast({
        title: t('admin.success.updateRole', 'Role updated successfully'),
        description: t('admin.success.updateRoleDesc', 'The user role has been updated.')
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('admin.errors.updateRole', 'Failed to update role'),
        description: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setLoading(prev => ({ ...prev, updateRole: false }));
    }
  }, [t, toast, loadUsers, loadUserDetails, selectedUser]);

  // Creăm un nou rol
  const createRole = useCallback(async (role: Partial<Role>) => {
    try {
      const newRole = await userManagementService.createRole(role);
      
      // Actualizăm lista de roluri
      await loadRoles();
      
      toast({
        title: t('admin.success.createRole', 'Role created successfully'),
        description: t('admin.success.createRoleDesc', 'The new role has been created.')
      });
      
      return newRole;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('admin.errors.createRole', 'Failed to create role'),
        description: err instanceof Error ? err.message : String(err)
      });
      throw err;
    }
  }, [t, toast, loadRoles]);

  // Adăugăm permisiuni la un rol
  const addPermissionsToRole = useCallback(async (roleId: string, permissionIds: string[]) => {
    try {
      await userManagementService.addPermissionsToRole(roleId, permissionIds);
      
      toast({
        title: t('admin.success.addPermissions', 'Permissions added successfully'),
        description: t('admin.success.addPermissionsDesc', 'The permissions have been added to the role.')
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('admin.errors.addPermissions', 'Failed to add permissions'),
        description: err instanceof Error ? err.message : String(err)
      });
      throw err;
    }
  }, [t, toast]);

  return {
    users,
    roles,
    permissions,
    activities,
    selectedUser,
    loading,
    error,
    loadUsers,
    loadRoles,
    loadPermissions,
    loadActivities,
    loadUserDetails,
    updateUserRole,
    createRole,
    addPermissionsToRole,
    setSelectedUser
  };
}
