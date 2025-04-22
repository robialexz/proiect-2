/**
 * Store-ul principal al aplicației
 * Acest fișier combină toate slice-urile într-un singur store
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Importăm slice-urile
import { AppState, createAppSlice } from './slices/app.slice';
import { AuthState, createAuthSlice } from './slices/auth.slice';
import { InventoryState, createInventorySlice } from './slices/inventory.slice';
import { ProjectsState, createProjectsSlice } from './slices/projects.slice';

// Tipul pentru starea globală
export interface RootState extends 
  AppState,
  AuthState,
  InventoryState,
  ProjectsState {}

// Creăm store-ul
export const useStore = create<RootState>()(
  devtools(
    persist(
      immer((...a) => ({
        // Combinăm toate slice-urile
        ...createAppSlice(...a),
        ...createAuthSlice(...a),
        ...createInventorySlice(...a),
        ...createProjectsSlice(...a),
      })),
      {
        name: 'app-storage',
        // Excludem anumite proprietăți din persistență
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
          // Nu persistăm datele de autentificare, acestea sunt gestionate de Supabase
          // Nu persistăm datele de inventar și proiecte, acestea sunt încărcate de la server
        }),
      }
    )
  )
);

// Exportăm hook-uri pentru fiecare slice
export const useAppStore = () => {
  const {
    theme,
    sidebarOpen,
    currentPage,
    breadcrumbs,
    isLoading: appLoading,
    error: appError,
    setTheme,
    toggleSidebar,
    setSidebarOpen,
    setCurrentPage,
    setLoading: setAppLoading,
    setError: setAppError,
    clearError: clearAppError,
  } = useStore();
  
  return {
    theme,
    sidebarOpen,
    currentPage,
    breadcrumbs,
    isLoading: appLoading,
    error: appError,
    setTheme,
    toggleSidebar,
    setSidebarOpen,
    setCurrentPage,
    setLoading: setAppLoading,
    setError: setAppError,
    clearError: clearAppError,
  };
};

export const useAuthStore = () => {
  const {
    user,
    userProfile,
    isLoading: authLoading,
    error: authError,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshSession,
    fetchUserProfile,
    clearError: clearAuthError,
  } = useStore();
  
  return {
    user,
    userProfile,
    isLoading: authLoading,
    error: authError,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshSession,
    fetchUserProfile,
    clearError: clearAuthError,
  };
};

export const useInventoryStore = () => {
  const {
    materials,
    filteredMaterials,
    selectedMaterial,
    isLoading: inventoryLoading,
    error: inventoryError,
    filter: materialFilter,
    fetchMaterials,
    fetchMaterial,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    setFilter: setMaterialFilter,
    clearFilter: clearMaterialFilter,
    selectMaterial,
    clearError: clearInventoryError,
  } = useStore();
  
  return {
    materials,
    filteredMaterials,
    selectedMaterial,
    isLoading: inventoryLoading,
    error: inventoryError,
    filter: materialFilter,
    fetchMaterials,
    fetchMaterial,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    setFilter: setMaterialFilter,
    clearFilter: clearMaterialFilter,
    selectMaterial,
    clearError: clearInventoryError,
  };
};

export const useProjectsStore = () => {
  const {
    projects,
    filteredProjects,
    selectedProject,
    isLoading: projectsLoading,
    error: projectsError,
    filter: projectFilter,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    setFilter: setProjectFilter,
    clearFilter: clearProjectFilter,
    selectProject,
    clearError: clearProjectsError,
  } = useStore();
  
  return {
    projects,
    filteredProjects,
    selectedProject,
    isLoading: projectsLoading,
    error: projectsError,
    filter: projectFilter,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    setFilter: setProjectFilter,
    clearFilter: clearProjectFilter,
    selectProject,
    clearError: clearProjectsError,
  };
};

export default useStore;
