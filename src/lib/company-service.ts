import { supabase } from './supabase';
import { 
  Company, 
  CompanyStatus, 
  CompanyUser, 
  CompanyUserRole,
  CompanyFilters,
  CompanySort,
  CompanyPagination,
  CompanyUserFilters,
  CompanyUserSort,
  CompanyUserPagination,
  CompanyInvitation,
  CompanyInvitationRequest,
  CompanyInvitationAcceptRequest
} from '@/models/company';
import { errorMonitoring, ErrorSource, ErrorSeverity } from './error-monitoring';

class CompanyService {
  /**
   * Obține toate companiile
   */
  async getAllCompanies(
    filters?: CompanyFilters,
    sort?: CompanySort,
    pagination?: CompanyPagination
  ): Promise<{ data: Company[], pagination: CompanyPagination }> {
    try {
      let query = supabase
        .from('companies')
        .select('*', { count: 'exact' });
      
      // Aplicăm filtrele
      if (filters) {
        if (filters.name) {
          query = query.ilike('name', `%${filters.name}%`);
        }
        
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        
        if (filters.subscription_plan) {
          query = query.eq('subscription_plan', filters.subscription_plan);
        }
      }
      
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
      
      const { data, error, count } = await query;
      
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
        message: 'Failed to get companies',
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține o companie după ID
   */
  async getCompanyById(id: string): Promise<Company> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to get company with ID ${id}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Creează o companie nouă
   */
  async createCompany(company: Partial<Company>): Promise<Company> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({
          ...company,
          status: company.status || CompanyStatus.ACTIVE,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to create company',
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Actualizează o companie
   */
  async updateCompany(id: string, company: Partial<Company>): Promise<Company> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .update({
          ...company,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to update company with ID ${id}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Șterge o companie
   */
  async deleteCompany(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to delete company with ID ${id}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține utilizatorii unei companii
   */
  async getCompanyUsers(
    companyId: string,
    filters?: CompanyUserFilters,
    sort?: CompanyUserSort,
    pagination?: CompanyUserPagination
  ): Promise<{ data: CompanyUser[], pagination: CompanyUserPagination }> {
    try {
      let query = supabase
        .from('company_users')
        .select('*, user:profiles(id, email, display_name, avatar_url)', { count: 'exact' })
        .eq('company_id', companyId);
      
      // Aplicăm filtrele
      if (filters) {
        if (filters.role) {
          query = query.eq('role', filters.role);
        }
        
        if (filters.is_admin !== undefined) {
          query = query.eq('is_admin', filters.is_admin);
        }
        
        if (filters.search) {
          query = query.or(`user.email.ilike.%${filters.search}%,user.display_name.ilike.%${filters.search}%`);
        }
      }
      
      // Aplicăm sortarea
      if (sort) {
        if (sort.field.startsWith('user.')) {
          // Sortare după câmpuri din relația user
          const userField = sort.field.replace('user.', '');
          query = query.order(`user:profiles.${userField}`, { ascending: sort.direction === 'asc' });
        } else {
          // Sortare după câmpuri din company_users
          query = query.order(sort.field, { ascending: sort.direction === 'asc' });
        }
      } else {
        query = query.order('created_at', { ascending: false });
      }
      
      // Aplicăm paginarea
      if (pagination) {
        const from = (pagination.page - 1) * pagination.pageSize;
        const to = from + pagination.pageSize - 1;
        query = query.range(from, to);
      }
      
      const { data, error, count } = await query;
      
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
        message: `Failed to get users for company with ID ${companyId}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Adaugă un utilizator la o companie
   */
  async addUserToCompany(companyId: string, userId: string, role: CompanyUserRole, isAdmin: boolean): Promise<CompanyUser> {
    try {
      const { data, error } = await supabase
        .from('company_users')
        .insert({
          company_id: companyId,
          user_id: userId,
          role,
          is_admin: isAdmin,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to add user ${userId} to company ${companyId}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Actualizează rolul unui utilizator într-o companie
   */
  async updateCompanyUser(companyId: string, userId: string, role: CompanyUserRole, isAdmin: boolean): Promise<CompanyUser> {
    try {
      const { data, error } = await supabase
        .from('company_users')
        .update({
          role,
          is_admin: isAdmin,
          updated_at: new Date().toISOString()
        })
        .eq('company_id', companyId)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to update user ${userId} in company ${companyId}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Elimină un utilizator dintr-o companie
   */
  async removeUserFromCompany(companyId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('company_users')
        .delete()
        .eq('company_id', companyId)
        .eq('user_id', userId);
      
      if (error) throw error;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to remove user ${userId} from company ${companyId}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Invită un utilizator într-o companie
   */
  async inviteUserToCompany(invitation: CompanyInvitationRequest): Promise<CompanyInvitation> {
    try {
      // Generăm un token unic
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Setăm data de expirare la 7 zile de acum
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      const { data, error } = await supabase
        .from('company_invitations')
        .insert({
          company_id: invitation.company_id,
          email: invitation.email,
          role: invitation.role,
          is_admin: invitation.is_admin,
          token,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Aici ar trebui să trimitem un email de invitație
      // Implementarea trimiterii de email va fi adăugată ulterior
      
      return data;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to invite user ${invitation.email} to company ${invitation.company_id}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Acceptă o invitație într-o companie
   */
  async acceptCompanyInvitation(request: CompanyInvitationAcceptRequest): Promise<CompanyUser> {
    try {
      // Obținem invitația după token
      const { data: invitation, error: invitationError } = await supabase
        .from('company_invitations')
        .select('*')
        .eq('token', request.token)
        .single();
      
      if (invitationError) throw invitationError;
      
      if (!invitation) {
        throw new Error('Invitation not found');
      }
      
      // Verificăm dacă invitația a expirat
      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error('Invitation has expired');
      }
      
      // Verificăm dacă utilizatorul există deja
      const { data: existingUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', invitation.email)
        .single();
      
      let userId: string;
      
      if (userError) {
        // Utilizatorul nu există, îl creăm
        if (request.password) {
          // Înregistrăm utilizatorul cu parola furnizată
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: invitation.email,
            password: request.password
          });
          
          if (authError) throw authError;
          
          userId = authData.user?.id || '';
          
          // Creăm profilul utilizatorului
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: invitation.email,
              display_name: invitation.email.split('@')[0],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (profileError) throw profileError;
        } else {
          throw new Error('Password is required for new users');
        }
      } else {
        // Utilizatorul există deja
        userId = existingUser.id;
      }
      
      // Adăugăm utilizatorul la companie
      const companyUser = await this.addUserToCompany(
        invitation.company_id,
        userId,
        invitation.role,
        invitation.is_admin
      );
      
      // Ștergem invitația
      const { error: deleteError } = await supabase
        .from('company_invitations')
        .delete()
        .eq('id', invitation.id);
      
      if (deleteError) throw deleteError;
      
      return companyUser;
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to accept company invitation',
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Verifică dacă un utilizator este admin de site
   */
  async isSiteAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('site_admins')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Nu s-a găsit niciun rezultat
          return false;
        }
        throw error;
      }
      
      return !!data;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to check if user ${userId} is site admin`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      return false;
    }
  }
  
  /**
   * Adaugă un utilizator ca admin de site
   */
  async addSiteAdmin(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('site_admins')
        .insert({
          user_id: userId,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to add user ${userId} as site admin`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Elimină un utilizator din lista de admini de site
   */
  async removeSiteAdmin(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('site_admins')
        .delete()
        .eq('user_id', userId);
      
      if (error) throw error;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to remove user ${userId} from site admins`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține toate companiile unui utilizator
   */
  async getUserCompanies(userId: string): Promise<Company[]> {
    try {
      const { data, error } = await supabase
        .from('company_users')
        .select('company:companies(*)')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      return data?.map(item => item.company) || [];
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to get companies for user ${userId}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Verifică dacă un utilizator este admin într-o companie
   */
  async isCompanyAdmin(userId: string, companyId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('company_users')
        .select('is_admin')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Nu s-a găsit niciun rezultat
          return false;
        }
        throw error;
      }
      
      return data?.is_admin || false;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to check if user ${userId} is admin in company ${companyId}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      return false;
    }
  }
  
  /**
   * Obține rolul unui utilizator într-o companie
   */
  async getUserCompanyRole(userId: string, companyId: string): Promise<CompanyUserRole | null> {
    try {
      const { data, error } = await supabase
        .from('company_users')
        .select('role')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Nu s-a găsit niciun rezultat
          return null;
        }
        throw error;
      }
      
      return data?.role || null;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to get role for user ${userId} in company ${companyId}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      return null;
    }
  }
}

export const companyService = new CompanyService();
