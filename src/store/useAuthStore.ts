import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, UserProfile, UserSettings } from '@/models';
import { authService, userService } from '@/services';

// Definim tipurile pentru starea de autentificare
interface AuthState {
  // Stare
  user: User | null;
  userProfile: UserProfile | null;
  userSettings: UserSettings | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  role: string;
  
  // Acțiuni
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<boolean>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
  clearError: () => void;
  setLoading: (isLoading: boolean) => void;
}

// Creăm store-ul pentru autentificare
export const useAuthStore = create<AuthState>()(
  // Adăugăm middleware pentru persistență
  persist(
    (set, get) => ({
      // Stare inițială
      user: null,
      userProfile: null,
      userSettings: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      role: 'utilizator', // Rol implicit
      
      // Acțiuni
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const { data, error } = await authService.signIn(email, password);
          
          if (error || !data) {
            set({ 
              isLoading: false, 
              error: error?.message || 'Autentificare eșuată' 
            });
            return false;
          }
          
          // Setăm utilizatorul
          set({ 
            user: data.user,
            isAuthenticated: true,
            isLoading: false
          });
          
          // Încărcăm profilul și setările utilizatorului
          get().refreshUserData();
          
          return true;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.message || 'Eroare la autentificare' 
          });
          return false;
        }
      },
      
      logout: async () => {
        try {
          set({ isLoading: true });
          
          await authService.signOut();
          
          // Resetăm starea
          set({ 
            user: null,
            userProfile: null,
            userSettings: null,
            isAuthenticated: false,
            isLoading: false,
            role: 'utilizator'
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.message || 'Eroare la deconectare' 
          });
        }
      },
      
      register: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const { data, error } = await authService.signUp(email, password);
          
          if (error || !data) {
            set({ 
              isLoading: false, 
              error: error?.message || 'Înregistrare eșuată' 
            });
            return false;
          }
          
          // Dacă înregistrarea a reușit, dar necesită confirmare prin email
          if (!data.session) {
            set({
              isLoading: false,
              error: null
            });
            return true;
          }
          
          // Dacă înregistrarea a reușit și utilizatorul este autentificat automat
          set({ 
            user: data.user,
            isAuthenticated: !!data.session,
            isLoading: false
          });
          
          // Încărcăm profilul și setările utilizatorului
          if (data.session) {
            get().refreshUserData();
          }
          
          return true;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.message || 'Eroare la înregistrare' 
          });
          return false;
        }
      },
      
      resetPassword: async (email: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const { error } = await authService.resetPassword(email);
          
          if (error) {
            set({ 
              isLoading: false, 
              error: error.message || 'Resetare parolă eșuată' 
            });
            return false;
          }
          
          set({ isLoading: false });
          return true;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.message || 'Eroare la resetarea parolei' 
          });
          return false;
        }
      },
      
      updatePassword: async (password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const { error } = await authService.updatePassword(password);
          
          if (error) {
            set({ 
              isLoading: false, 
              error: error.message || 'Actualizare parolă eșuată' 
            });
            return false;
          }
          
          set({ isLoading: false });
          return true;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.message || 'Eroare la actualizarea parolei' 
          });
          return false;
        }
      },
      
      updateProfile: async (profile: Partial<UserProfile>) => {
        try {
          set({ isLoading: true, error: null });
          
          const { data, error } = await userService.updateCurrentUserProfile(profile);
          
          if (error || !data) {
            set({ 
              isLoading: false, 
              error: error?.message || 'Actualizare profil eșuată' 
            });
            return false;
          }
          
          set({ 
            userProfile: data,
            isLoading: false
          });
          
          return true;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.message || 'Eroare la actualizarea profilului' 
          });
          return false;
        }
      },
      
      updateSettings: async (settings: Partial<UserSettings>) => {
        try {
          set({ isLoading: true, error: null });
          
          const { data, error } = await userService.updateCurrentUserSettings(settings);
          
          if (error || !data) {
            set({ 
              isLoading: false, 
              error: error?.message || 'Actualizare setări eșuată' 
            });
            return false;
          }
          
          set({ 
            userSettings: data,
            isLoading: false
          });
          
          return true;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.message || 'Eroare la actualizarea setărilor' 
          });
          return false;
        }
      },
      
      refreshSession: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const { data, error } = await authService.refreshSession();
          
          if (error || !data) {
            set({ 
              isLoading: false, 
              error: error?.message || 'Reîmprospătare sesiune eșuată',
              isAuthenticated: false,
              user: null
            });
            return false;
          }
          
          set({ 
            user: data.user,
            isAuthenticated: true,
            isLoading: false
          });
          
          // Încărcăm profilul și setările utilizatorului
          get().refreshUserData();
          
          return true;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.message || 'Eroare la reîmprospătarea sesiunii',
            isAuthenticated: false,
            user: null
          });
          return false;
        }
      },
      
      // Metodă internă pentru încărcarea datelor utilizatorului
      refreshUserData: async () => {
        try {
          // Încărcăm profilul utilizatorului
          const { data: profile } = await userService.getCurrentUserProfile();
          if (profile) {
            set({ userProfile: profile });
          }
          
          // Încărcăm setările utilizatorului
          const { data: settings } = await userService.getCurrentUserSettings();
          if (settings) {
            set({ userSettings: settings });
          }
          
          // Încărcăm rolul utilizatorului
          const { data: role } = await userService.getCurrentUserRole();
          if (role) {
            set({ role });
          }
        } catch (error) {
          // Removed console statement
        }
      },
      
      clearError: () => set({ error: null }),
      
      setLoading: (isLoading: boolean) => set({ isLoading })
    }),
    {
      name: 'auth-storage', // Numele pentru localStorage
      storage: createJSONStorage(() => localStorage), // Folosim localStorage pentru persistență
      partialize: (state) => ({ 
        // Salvăm doar anumite câmpuri în localStorage
        user: state.user,
        userProfile: state.userProfile,
        userSettings: state.userSettings,
        isAuthenticated: state.isAuthenticated,
        role: state.role
      })
    }
  )
);

export default useAuthStore;
