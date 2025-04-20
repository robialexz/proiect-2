/**
 * Serviciu pentru Supabase
 * Acest fișier conține funcții pentru interacțiunea cu Supabase
 */

import { supabase } from './supabase-client';
import { apiLogger } from '@/lib/logging';
import { createError, ErrorSource, ErrorType, ErrorSeverity } from '@/lib/error-handling';

/**
 * Serviciu pentru autentificare
 */
export const authService = {
  /**
   * Obține sesiunea curentă
   * @returns Sesiunea curentă
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error: any) {
      apiLogger.error('Error getting session:', error);
      
      return {
        data: { session: null },
        error: createError(error.message || 'Error getting session', {
          source: ErrorSource.AUTH,
          type: ErrorType.AUTHENTICATION,
          severity: ErrorSeverity.ERROR,
          originalError: error,
        }),
      };
    }
  },
  
  /**
   * Autentificare cu email și parolă
   * @param email Email-ul utilizatorului
   * @param password Parola utilizatorului
   * @returns Datele de autentificare
   */
  async signInWithPassword(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error: any) {
      apiLogger.error('Error signing in:', error);
      
      return {
        data: { user: null, session: null },
        error: createError(error.message || 'Error signing in', {
          source: ErrorSource.AUTH,
          type: ErrorType.AUTHENTICATION,
          severity: ErrorSeverity.ERROR,
          originalError: error,
        }),
      };
    }
  },
  
  /**
   * Înregistrare cu email și parolă
   * @param email Email-ul utilizatorului
   * @param password Parola utilizatorului
   * @param options Opțiuni suplimentare
   * @returns Datele de înregistrare
   */
  async signUp(email: string, password: string, options?: { data?: Record<string, any> }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options,
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error: any) {
      apiLogger.error('Error signing up:', error);
      
      return {
        data: { user: null, session: null },
        error: createError(error.message || 'Error signing up', {
          source: ErrorSource.AUTH,
          type: ErrorType.AUTHENTICATION,
          severity: ErrorSeverity.ERROR,
          originalError: error,
        }),
      };
    }
  },
  
  /**
   * Deconectare
   * @returns Rezultatul deconectării
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      return { error: null };
    } catch (error: any) {
      apiLogger.error('Error signing out:', error);
      
      return {
        error: createError(error.message || 'Error signing out', {
          source: ErrorSource.AUTH,
          type: ErrorType.AUTHENTICATION,
          severity: ErrorSeverity.ERROR,
          originalError: error,
        }),
      };
    }
  },
  
  /**
   * Resetare parolă
   * @param email Email-ul utilizatorului
   * @returns Rezultatul resetării parolei
   */
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      return { error: null };
    } catch (error: any) {
      apiLogger.error('Error resetting password:', error);
      
      return {
        error: createError(error.message || 'Error resetting password', {
          source: ErrorSource.AUTH,
          type: ErrorType.AUTHENTICATION,
          severity: ErrorSeverity.ERROR,
          originalError: error,
        }),
      };
    }
  },
  
  /**
   * Actualizare parolă
   * @param password Noua parolă
   * @returns Rezultatul actualizării parolei
   */
  async updatePassword(password: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) throw error;
      
      return { error: null };
    } catch (error: any) {
      apiLogger.error('Error updating password:', error);
      
      return {
        error: createError(error.message || 'Error updating password', {
          source: ErrorSource.AUTH,
          type: ErrorType.AUTHENTICATION,
          severity: ErrorSeverity.ERROR,
          originalError: error,
        }),
      };
    }
  },
  
  /**
   * Actualizare utilizator
   * @param data Datele de actualizat
   * @returns Rezultatul actualizării utilizatorului
   */
  async updateUser(data: { email?: string; password?: string; data?: Record<string, any> }) {
    try {
      const { data: userData, error } = await supabase.auth.updateUser(data);
      
      if (error) throw error;
      
      return { data: userData, error: null };
    } catch (error: any) {
      apiLogger.error('Error updating user:', error);
      
      return {
        data: { user: null },
        error: createError(error.message || 'Error updating user', {
          source: ErrorSource.AUTH,
          type: ErrorType.AUTHENTICATION,
          severity: ErrorSeverity.ERROR,
          originalError: error,
        }),
      };
    }
  },
};

/**
 * Serviciu pentru profiluri
 */
export const profileService = {
  /**
   * Obține profilul utilizatorului
   * @param userId ID-ul utilizatorului
   * @returns Profilul utilizatorului
   */
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error: any) {
      apiLogger.error('Error getting profile:', error);
      
      return {
        data: null,
        error: createError(error.message || 'Error getting profile', {
          source: ErrorSource.DATABASE,
          type: ErrorType.SERVER_ERROR,
          severity: ErrorSeverity.ERROR,
          originalError: error,
        }),
      };
    }
  },
  
  /**
   * Actualizează profilul utilizatorului
   * @param userId ID-ul utilizatorului
   * @param profile Datele profilului
   * @returns Profilul actualizat
   */
  async updateProfile(userId: string, profile: Record<string, any>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profile,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error: any) {
      apiLogger.error('Error updating profile:', error);
      
      return {
        data: null,
        error: createError(error.message || 'Error updating profile', {
          source: ErrorSource.DATABASE,
          type: ErrorType.SERVER_ERROR,
          severity: ErrorSeverity.ERROR,
          originalError: error,
        }),
      };
    }
  },
};

/**
 * Serviciu pentru storage
 */
export const storageService = {
  /**
   * Încarcă un fișier
   * @param bucket Bucket-ul
   * @param path Calea fișierului
   * @param file Fișierul
   * @returns URL-ul fișierului
   */
  async uploadFile(bucket: string, path: string, file: File) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true,
        });
      
      if (error) throw error;
      
      // Obținem URL-ul public
      const { data: publicURL } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
      
      return { data: publicURL, error: null };
    } catch (error: any) {
      apiLogger.error('Error uploading file:', error);
      
      return {
        data: null,
        error: createError(error.message || 'Error uploading file', {
          source: ErrorSource.SERVER,
          type: ErrorType.SERVER_ERROR,
          severity: ErrorSeverity.ERROR,
          originalError: error,
        }),
      };
    }
  },
  
  /**
   * Șterge un fișier
   * @param bucket Bucket-ul
   * @param path Calea fișierului
   * @returns Rezultatul ștergerii
   */
  async deleteFile(bucket: string, path: string) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);
      
      if (error) throw error;
      
      return { error: null };
    } catch (error: any) {
      apiLogger.error('Error deleting file:', error);
      
      return {
        error: createError(error.message || 'Error deleting file', {
          source: ErrorSource.SERVER,
          type: ErrorType.SERVER_ERROR,
          severity: ErrorSeverity.ERROR,
          originalError: error,
        }),
      };
    }
  },
  
  /**
   * Obține URL-ul public al unui fișier
   * @param bucket Bucket-ul
   * @param path Calea fișierului
   * @returns URL-ul public
   */
  getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },
};

// Exportăm serviciile
export default {
  authService,
  profileService,
  storageService,
};
