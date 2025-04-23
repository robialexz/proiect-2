import { supabase } from './supabase';
import { User, UserRole, Role, Permission, UserActivity, UserWithRole } from '@/models/user';
import { errorMonitoring, ErrorSource, ErrorSeverity } from './error-monitoring';

class UserManagementService {
  /**
   * Obține toți utilizatorii din sistem
   */
  async getAllUsers(): Promise<UserWithRole[]> {
    try {
      // Obținem utilizatorii din Auth
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;
      
      if (!authUsers?.users) return [];
      
      // Obținem rolurile utilizatorilor
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
        
      if (rolesError) throw rolesError;
      
      // Combinăm datele
      const usersWithRoles = authUsers.users.map(authUser => {
        const userRole = userRoles?.find(role => role.user_id === authUser.id);
        
        return {
          id: authUser.id,
          email: authUser.email || '',
          created_at: authUser.created_at,
          last_sign_in_at: authUser.last_sign_in_at,
          user_metadata: authUser.user_metadata,
          role: userRole?.role || 'user'
        } as UserWithRole;
      });
      
      return usersWithRoles;
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to get all users',
        source: ErrorSource.AUTH,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține un utilizator după ID
   */
  async getUserById(userId: string): Promise<UserWithRole | null> {
    try {
      // Obținem utilizatorul din Auth
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
      
      if (authError) throw authError;
      if (!authUser?.user) return null;
      
      // Obținem rolul utilizatorului
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (roleError && roleError.code !== 'PGRST116') throw roleError;
      
      // Obținem permisiunile asociate rolului
      let permissions: Permission[] = [];
      if (userRole?.role) {
        const { data: roleData, error: roleDataError } = await supabase
          .from('roles')
          .select('*')
          .eq('name', userRole.role)
          .single();
          
        if (roleDataError && roleDataError.code !== 'PGRST116') throw roleDataError;
        
        if (roleData) {
          const { data: permissionsData, error: permissionsError } = await supabase
            .from('role_permissions')
            .select('permissions(*)')
            .eq('role_id', roleData.id);
            
          if (permissionsError) throw permissionsError;
          
          permissions = permissionsData?.map(p => p.permissions) || [];
        }
      }
      
      return {
        id: authUser.user.id,
        email: authUser.user.email || '',
        created_at: authUser.user.created_at,
        last_sign_in_at: authUser.user.last_sign_in_at,
        user_metadata: authUser.user.user_metadata,
        role: userRole?.role || 'user',
        permissions
      };
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to get user by ID: ${userId}`,
        source: ErrorSource.AUTH,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Actualizează rolul unui utilizator
   */
  async updateUserRole(userId: string, role: string): Promise<void> {
    try {
      // Verificăm dacă utilizatorul există
      const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
      
      if (userError) throw userError;
      if (!user?.user) throw new Error('User not found');
      
      // Verificăm dacă rolul există
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', role)
        .single();
        
      if (roleError) throw roleError;
      if (!roleData) throw new Error('Role not found');
      
      // Verificăm dacă utilizatorul are deja un rol
      const { data: existingRole, error: existingRoleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (existingRoleError && existingRoleError.code !== 'PGRST116') throw existingRoleError;
      
      // Actualizăm sau inserăm rolul
      if (existingRole) {
        const { error: updateError } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId);
          
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
          
        if (insertError) throw insertError;
      }
      
      // Înregistrăm activitatea
      await this.logUserActivity({
        user_id: userId,
        action: 'update',
        resource: 'role',
        details: { role }
      });
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to update user role: ${userId} to ${role}`,
        source: ErrorSource.AUTH,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține toate rolurile disponibile
   */
  async getAllRoles(): Promise<Role[]> {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*');
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to get all roles',
        source: ErrorSource.AUTH,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține toate permisiunile disponibile
   */
  async getAllPermissions(): Promise<Permission[]> {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*');
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to get all permissions',
        source: ErrorSource.AUTH,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Înregistrează activitatea unui utilizator
   */
  async logUserActivity(activity: Partial<UserActivity>): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_activities')
        .insert({
          ...activity,
          ip_address: window.clientInformation ? window.clientInformation.ip : undefined,
          user_agent: navigator.userAgent
        });
        
      if (error) throw error;
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to log user activity',
        source: ErrorSource.AUTH,
        severity: ErrorSeverity.WARNING,
        error: error as Error
      });
      // Nu aruncăm eroarea mai departe pentru a nu întrerupe fluxul principal
    }
  }
  
  /**
   * Obține activitățile unui utilizator
   */
  async getUserActivities(userId: string, limit = 50): Promise<UserActivity[]> {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to get user activities for user: ${userId}`,
        source: ErrorSource.AUTH,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține toate activitățile din sistem
   */
  async getAllActivities(limit = 100): Promise<UserActivity[]> {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to get all user activities',
        source: ErrorSource.AUTH,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Creează un nou rol
   */
  async createRole(role: Partial<Role>): Promise<Role> {
    try {
      const { data, error } = await supabase
        .from('roles')
        .insert({
          name: role.name,
          description: role.description
        })
        .select()
        .single();
        
      if (error) throw error;
      if (!data) throw new Error('Failed to create role');
      
      return data;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to create role: ${role.name}`,
        source: ErrorSource.AUTH,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Adaugă permisiuni la un rol
   */
  async addPermissionsToRole(roleId: string, permissionIds: string[]): Promise<void> {
    try {
      const rolePermissions = permissionIds.map(permissionId => ({
        role_id: roleId,
        permission_id: permissionId
      }));
      
      const { error } = await supabase
        .from('role_permissions')
        .insert(rolePermissions);
        
      if (error) throw error;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to add permissions to role: ${roleId}`,
        source: ErrorSource.AUTH,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
}

export const userManagementService = new UserManagementService();
