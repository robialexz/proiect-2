// Export all stores
export { default as useAuthStore } from "./useAuthStore";
export { default as useProjectStore } from "./useProjectStore";
export { default as useMaterialStore } from "./useMaterialStore";
export { default as useUIStore } from "./useUIStore";

// Export new Zustand stores
export {
  useStore,
  useAppStore,
  useAuthStore as useZustandAuthStore,
  useInventoryStore,
  useProjectsStore,
} from "./store";

// Re-exportăm tipurile pentru a fi utilizate în aplicație
export type { RootState } from "./store";
export type { AppState } from "./slices/app.slice";
export type { AuthState, UserProfile } from "./slices/auth.slice";
export type {
  InventoryState,
  Material,
  MaterialFilter,
} from "./slices/inventory.slice";
export type {
  ProjectsState,
  Project,
  ProjectFilter,
} from "./slices/projects.slice";

// Export hooks for accessing stores
import { useAuthStore } from "./useAuthStore";
import { useProjectStore } from "./useProjectStore";
import { useMaterialStore } from "./useMaterialStore";
import { useUIStore } from "./useUIStore";

// Custom hooks for accessing store state and actions
export const useAuth = () => {
  const {
    user,
    userProfile,
    userSettings,
    isAuthenticated,
    isLoading,
    error,
    role,
    login,
    logout,
    register,
    resetPassword,
    updatePassword,
    updateProfile,
    updateSettings,
    refreshSession,
    clearError,
  } = useAuthStore();

  return {
    user,
    userProfile,
    userSettings,
    isAuthenticated,
    isLoading,
    error,
    role,
    login,
    logout,
    register,
    resetPassword,
    updatePassword,
    updateProfile,
    updateSettings,
    refreshSession,
    clearError,
  };
};

export const useProjects = () => {
  const {
    projects,
    currentProject,
    projectMilestones,
    projectBudgets,
    projectTasks,
    isLoading,
    error,
    fetchProjects,
    fetchProject,
    fetchProjectMilestones,
    fetchProjectBudgets,
    fetchProjectTasks,
    createProject,
    updateProject,
    deleteProject,
    addProjectMilestone,
    addProjectBudget,
    addProjectTask,
    updateProjectStatus,
    updateProjectProgress,
    clearError,
  } = useProjectStore();

  return {
    projects,
    currentProject,
    projectMilestones,
    projectBudgets,
    projectTasks,
    isLoading,
    error,
    fetchProjects,
    fetchProject,
    fetchProjectMilestones,
    fetchProjectBudgets,
    fetchProjectTasks,
    createProject,
    updateProject,
    deleteProject,
    addProjectMilestone,
    addProjectBudget,
    addProjectTask,
    updateProjectStatus,
    updateProjectProgress,
    clearError,
  };
};

export const useMaterials = () => {
  const {
    materials,
    projectMaterials,
    lowStockMaterials,
    materialsWithProjects,
    currentMaterial,
    isLoading,
    error,
    fetchMaterials,
    fetchProjectMaterials,
    fetchLowStockMaterials,
    fetchMaterialsWithProjects,
    fetchMaterial,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    updateMaterialQuantity,
    transferMaterial,
    searchMaterials,
    addProjectMaterial,
    clearError,
  } = useMaterialStore();

  return {
    materials,
    projectMaterials,
    lowStockMaterials,
    materialsWithProjects,
    currentMaterial,
    isLoading,
    error,
    fetchMaterials,
    fetchProjectMaterials,
    fetchLowStockMaterials,
    fetchMaterialsWithProjects,
    fetchMaterial,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    updateMaterialQuantity,
    transferMaterial,
    searchMaterials,
    addProjectMaterial,
    clearError,
  };
};

export const useUI = () => {
  const {
    theme,
    sidebarOpen,
    sidebarCollapsed,
    currentPage,
    breadcrumbs,
    notifications,
    setTheme,
    toggleSidebar,
    setSidebarOpen,
    toggleSidebarCollapsed,
    setSidebarCollapsed,
    setCurrentPage,
    addNotification,
    removeNotification,
    markNotificationAsRead,
    clearNotifications,
  } = useUIStore();

  return {
    theme,
    sidebarOpen,
    sidebarCollapsed,
    currentPage,
    breadcrumbs,
    notifications,
    setTheme,
    toggleSidebar,
    setSidebarOpen,
    toggleSidebarCollapsed,
    setSidebarCollapsed,
    setCurrentPage,
    addNotification,
    removeNotification,
    markNotificationAsRead,
    clearNotifications,
  };
};
