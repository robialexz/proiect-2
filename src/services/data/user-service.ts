import DataService from './data-service';
import { User, UserProfile, UserSettings } from '@/models';
import { enhancedSupabaseService, SupabaseResponse } from '../api/enhanced-supabase-service';
import { authService } from '../auth/auth-service';

/**
 * Serviciu pentru gestionarea utilizatorilor
 */
class UserService extends DataService<User> {
  private profileService: DataService<UserProfile>;
  private settingsService: DataService<UserSettings>;
  
  constructor() {
    super('users');
    this.profileService = new DataService<UserProfile>('profiles');
    this.settingsService = new DataService<UserSettings>('user_settings');
  }
  
  /**
   * Obține profilul utilizatorului curent
   * @returns Profilul utilizatorului sau eroarea
   */
  async getCurrentUserProfile(): Promise<SupabaseResponse<UserProfile>> {
    try {
      // Obținem utilizatorul curent
      const { data: user, error } = await authService.getUser();
      
      if (error || !user) {
        throw new Error(error?.message || 'User not found');
      }
      
      // Obținem profilul utilizatorului
      return this.profileService.getById(user.id);
    } catch (error) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to get current user profile',
          code: 'user_profile_error'
        },
        status: 'error'
      };
    }
  }
  
  /**
   * Obține setările utilizatorului curent
   * @returns Setările utilizatorului sau eroarea
   */
  async getCurrentUserSettings(): Promise<SupabaseResponse<UserSettings>> {
    try {
      // Obținem utilizatorul curent
      const { data: user, error } = await authService.getUser();
      
      if (error || !user) {
        throw new Error(error?.message || 'User not found');
      }
      
      // Obținem setările utilizatorului
      const response = await enhancedSupabaseService.select<UserSettings>('user_settings', '*', {
        filters: { user_id: user.id },
        single: true
      });
      
      // Dacă nu există setări, creăm setări implicite
      if (response.status === 'success' && !response.data) {
        const defaultSettings: Partial<UserSettings> = {
          user_id: user.id,
          theme: 'system',
          language: 'ro',
          email_notifications: true,
          push_notifications: true,
          in_app_notifications: true
        };
        
        return this.settingsService.create(defaultSettings);
      }
      
      return response;
    } catch (error) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to get current user settings',
          code: 'user_settings_error'
        },
        status: 'error'
      };
    }
  }
  
  /**
   * Actualizează profilul utilizatorului curent
   * @param data Datele pentru actualizare
   * @returns Profilul actualizat sau eroarea
   */
  async updateCurrentUserProfile(data: Partial<UserProfile>): Promise<SupabaseResponse<UserProfile>> {
    try {
      // Obținem utilizatorul curent
      const { data: user, error } = await authService.getUser();
      
      if (error || !user) {
        throw new Error(error?.message || 'User not found');
      }
      
      // Actualizăm profilul utilizatorului
      return this.profileService.update(user.id, data);
    } catch (error) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to update current user profile',
          code: 'user_profile_update_error'
        },
        status: 'error'
      };
    }
  }
  
  /**
   * Actualizează setările utilizatorului curent
   * @param data Datele pentru actualizare
   * @returns Setările actualizate sau eroarea
   */
  async updateCurrentUserSettings(data: Partial<UserSettings>): Promise<SupabaseResponse<UserSettings>> {
    try {
      // Obținem utilizatorul curent
      const { data: user, error } = await authService.getUser();
      
      if (error || !user) {
        throw new Error(error?.message || 'User not found');
      }
      
      // Obținem setările curente
      const { data: settings } = await this.getCurrentUserSettings();
      
      if (settings) {
        // Actualizăm setările existente
        return this.settingsService.update(settings.id, data);
      } else {
        // Creăm setări noi
        const newSettings: Partial<UserSettings> = {
          user_id: user.id,
          ...data
        };
        
        return this.settingsService.create(newSettings);
      }
    } catch (error) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to update current user settings',
          code: 'user_settings_update_error'
        },
        status: 'error'
      };
    }
  }
  
  /**
   * Obține rolul utilizatorului curent
   * @returns Rolul utilizatorului sau eroarea
   */
  async getCurrentUserRole(): Promise<SupabaseResponse<string>> {
    try {
      // Obținem utilizatorul curent
      const { data: user, error } = await authService.getUser();
      
      if (error || !user) {
        throw new Error(error?.message || 'User not found');
      }
      
      // Obținem rolul utilizatorului
      const { data } = await enhancedSupabaseService.rpc<{ role: string }>('get_user_role', {
        user_id: user.id
      });
      
      if (!data) {
        return {
          data: 'utilizator', // Rol implicit
          error: null,
          status: 'success'
        };
      }
      
      return {
        data: data.role,
        error: null,
        status: 'success'
      };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to get current user role',
          code: 'user_role_error'
        },
        status: 'error'
      };
    }
  }
}

export const userService = new UserService();
export default userService;
