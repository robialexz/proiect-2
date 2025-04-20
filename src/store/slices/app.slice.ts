/**
 * Slice pentru starea globală a aplicației
 * Acest slice gestionează starea generală a aplicației, cum ar fi tema, sidebar-ul, etc.
 */

import { StateCreator } from 'zustand';
import { RootState } from '../store';

// Tipul pentru breadcrumb
export interface Breadcrumb {
  label: string;
  path: string;
}

// Tipul pentru starea aplicației
export interface AppState {
  // Tema aplicației
  theme: 'light' | 'dark' | 'system';
  // Starea sidebar-ului
  sidebarOpen: boolean;
  // Pagina curentă
  currentPage: string;
  // Breadcrumbs pentru navigare
  breadcrumbs: Breadcrumb[];
  // Starea de încărcare globală
  isLoading: boolean;
  // Starea de eroare globală
  error: string | null;
  // Acțiuni
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentPage: (page: string, breadcrumbs?: Breadcrumb[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Creăm slice-ul pentru starea aplicației
export const createAppSlice: StateCreator<
  RootState,
  [],
  [],
  AppState
> = (set) => ({
  // Starea inițială
  theme: 'dark',
  sidebarOpen: true,
  currentPage: 'Dashboard',
  breadcrumbs: [{ label: 'Home', path: '/' }],
  isLoading: false,
  error: null,
  
  // Acțiuni
  setTheme: (theme) => set({ theme }),
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  setCurrentPage: (page, breadcrumbs) => set({ 
    currentPage: page,
    breadcrumbs: breadcrumbs || [{ label: 'Home', path: '/' }]
  }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
});
