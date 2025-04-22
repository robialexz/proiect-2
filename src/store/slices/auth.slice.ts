/**
 * Slice pentru starea de autentificare
 * Acest slice gestionează starea de autentificare a utilizatorului
 */

import { StateCreator } from 'zustand';
import { RootState } from '../store';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

// Tipul pentru profilul utilizatorului
export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

// Tipul pentru starea de autentificare
export interface AuthState {
  // Starea de autentificare
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Acțiuni
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  refreshSession: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  clearError: () => void;
}

// Creăm slice-ul pentru starea de autentificare
export const createAuthSlice: StateCreator<
  RootState,
  [],
  [],
  AuthState
> = (set, get) => ({
  // Starea inițială
  user: null,
  userProfile: null,
  isLoading: true,
  error: null,
  isAuthenticated: false,
  
  // Acțiuni
  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      set({ 
        user: data.user,
        isAuthenticated: !!data.user,
        isLoading: false,
      });
      
      // Încărcăm profilul utilizatorului
      if (data.user) {
        await get().fetchUserProfile();
      }
      
      return { success: true };
    } catch (error: any) {
      set({ 
        error: error.message || 'Eroare la autentificare',
        isLoading: false,
      });
      
      return { success: false, error: error.message };
    }
  },
  
  signUp: async (email, password, displayName) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0],
          },
        },
      });
      
      if (error) throw error;
      
      set({ isLoading: false });
      
      return { success: true };
    } catch (error: any) {
      set({ 
        error: error.message || 'Eroare la înregistrare',
        isLoading: false,
      });
      
      return { success: false, error: error.message };
    }
  },
  
  signOut: async () => {
    set({ isLoading: true });
    
    try {
      await supabase.auth.signOut();
      
      set({ 
        user: null,
        userProfile: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Eroare la deconectare',
        isLoading: false,
      });
    }
  },
  
  resetPassword: async (email) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      set({ isLoading: false });
      
      return { success: true };
    } catch (error: any) {
      set({ 
        error: error.message || 'Eroare la resetarea parolei',
        isLoading: false,
      });
      
      return { success: false, error: error.message };
    }
  },
  
  updatePassword: async (password) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) throw error;
      
      set({ isLoading: false });
      
      return { success: true };
    } catch (error: any) {
      set({ 
        error: error.message || 'Eroare la actualizarea parolei',
        isLoading: false,
      });
      
      return { success: false, error: error.message };
    }
  },
  
  updateProfile: async (profile) => {
    set({ isLoading: true, error: null });
    
    try {
      // Actualizăm datele utilizatorului în Supabase Auth
      if (profile.display_name || profile.avatar_url) {
        const { error: authError } = await supabase.auth.updateUser({
          data: {
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
          },
        });
        
        if (authError) throw authError;
      }
      
      // Actualizăm profilul utilizatorului în baza de date
      const { error: dbError } = await supabase
        .from('profiles')
        .update({
          display_name: profile.display_name,
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', get().user?.id);
      
      if (dbError) throw dbError;
      
      // Reîncărcăm profilul utilizatorului
      await get().fetchUserProfile();
      
      set({ isLoading: false });
      
      return { success: true };
    } catch (error: any) {
      set({ 
        error: error.message || 'Eroare la actualizarea profilului',
        isLoading: false,
      });
      
      return { success: false, error: error.message };
    }
  },
  
  refreshSession: async () => {
    set({ isLoading: true });
    
    try {
      const { data } = await supabase.auth.refreshSession();
      
      set({ 
        user: data.user,
        isAuthenticated: !!data.user,
        isLoading: false,
      });
      
      // Încărcăm profilul utilizatorului
      if (data.user) {
        await get().fetchUserProfile();
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Eroare la reîmprospătarea sesiunii',
        isLoading: false,
      });
    }
  },
  
  fetchUserProfile: async () => {
    const { user } = get();
    
    if (!user) return;
    
    try {
      // Încărcăm profilul utilizatorului din baza de date
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      set({ 
        userProfile: data as UserProfile,
      });
    } catch (error: any) {
      // Removed console statement
      
      // Creăm un profil implicit dacă nu există
      set({ 
        userProfile: {
          id: user.id,
          email: user.email || '',
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Utilizator',
          avatar_url: user.user_metadata?.avatar_url,
          role: user.user_metadata?.role || 'user',
        },
      });
    }
  },
  
  clearError: () => set({ error: null }),
});
