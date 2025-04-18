// Export all stores
export { default as useAuthStore } from './useAuthStore';
export { default as useProjectStore } from './useProjectStore';
export { default as useMaterialStore } from './useMaterialStore';
export { default as useUIStore } from './useUIStore';

// Export hooks for accessing stores
import { useAuthStore } from './useAuthStore';
import { useProjectStore } from './useProjectStore';
import { useMaterialStore } from './useMaterialStore';
import { useUIStore } from './useUIStore';

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
    clearError
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
    clearError
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
    clearError
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
    clearError
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
    clearError
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
    clearError
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
    clearNotifications
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
    clearNotifications
  };
};
