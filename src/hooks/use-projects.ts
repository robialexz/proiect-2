/**
 * Hook pentru utilizarea proiectelor
 * Acest fișier conține un hook pentru interacțiunea cu proiectele
 */

import { useState, useEffect, useCallback } from 'react';
import { useProjectsStore } from '@/store';
import { projectService } from '@/services';
import { Project, CreateProjectInput, UpdateProjectInput, ProjectFilter, ProjectSort, ProjectStatus } from '@/models/project.model';
import { useNotifications } from '@/lib/notifications';
import { useErrorBoundary } from '@/lib/error-handling';

/**
 * Hook pentru utilizarea proiectelor
 * @returns Funcții și stare pentru interacțiunea cu proiectele
 */
export function useProjects() {
  // Obținem store-ul de proiecte
  const {
    projects,
    filteredProjects,
    selectedProject,
    isLoading,
    error,
    filter,
    fetchProjects: fetchProjectsFromStore,
    fetchProject: fetchProjectFromStore,
    createProject: createProjectInStore,
    updateProject: updateProjectInStore,
    deleteProject: deleteProjectInStore,
    setFilter,
    clearFilter,
    selectProject,
    clearError,
  } = useProjectsStore();
  
  // Obținem notificările
  const { showNotification } = useNotifications();
  
  // Obținem error boundary
  const [reportError] = useErrorBoundary();
  
  // Stare pentru paginare
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  
  // Stare pentru sortare
  const [sort, setSort] = useState<ProjectSort>({
    field: 'created_at',
    direction: 'desc',
  });
  
  /**
   * Încarcă proiectele
   */
  const fetchProjects = useCallback(async () => {
    try {
      // Încărcăm proiectele din store
      await fetchProjectsFromStore();
      
      // Actualizăm paginarea
      setPagination((prev) => ({
        ...prev,
        total: filteredProjects.length,
        totalPages: Math.ceil(filteredProjects.length / prev.limit),
      }));
    } catch (error: any) {
      reportError(error);
    }
  }, [fetchProjectsFromStore, filteredProjects.length, reportError]);
  
  /**
   * Încarcă un proiect după ID
   * @param id ID-ul proiectului
   */
  const fetchProject = useCallback(async (id: string) => {
    try {
      // Încărcăm proiectul din store
      await fetchProjectFromStore(id);
    } catch (error: any) {
      reportError(error);
    }
  }, [fetchProjectFromStore, reportError]);
  
  /**
   * Creează un proiect
   * @param project Datele proiectului
   * @returns Rezultatul creării
   */
  const createProject = useCallback(async (project: CreateProjectInput) => {
    try {
      // Creăm proiectul în store
      const result = await createProjectInStore(project);
      
      // Verificăm rezultatul
      if (result.success) {
        // Afișăm notificarea
        showNotification(
          'Proiect creat',
          'Proiectul a fost creat cu succes.',
          { type: 'success' }
        );
        
        // Reîncărcăm proiectele
        try {
        await fetchProjects();
        } catch (error) {
          // Handle error appropriately
        }
        
        return { success: true, id: result.id };
      } else {
        // Afișăm notificarea
        showNotification(
          'Eroare',
          result.error || 'A apărut o eroare la crearea proiectului.',
          { type: 'error' }
        );
        
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      // Afișăm notificarea
      showNotification(
        'Eroare',
        error.message || 'A apărut o eroare la crearea proiectului.',
        { type: 'error' }
      );
      
      reportError(error);
      
      return { success: false, error: error.message };
    }
  }, [createProjectInStore, fetchProjects, reportError, showNotification]);
  
  /**
   * Actualizează un proiect
   * @param id ID-ul proiectului
   * @param project Datele proiectului
   * @returns Rezultatul actualizării
   */
  const updateProject = useCallback(async (id: string, project: UpdateProjectInput) => {
    try {
      // Actualizăm proiectul în store
      const result = await updateProjectInStore(id, project);
      
      // Verificăm rezultatul
      if (result.success) {
        // Afișăm notificarea
        showNotification(
          'Proiect actualizat',
          'Proiectul a fost actualizat cu succes.',
          { type: 'success' }
        );
        
        // Reîncărcăm proiectele
        try {
        await fetchProjects();
        } catch (error) {
          // Handle error appropriately
        }
        
        return { success: true };
      } else {
        // Afișăm notificarea
        showNotification(
          'Eroare',
          result.error || 'A apărut o eroare la actualizarea proiectului.',
          { type: 'error' }
        );
        
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      // Afișăm notificarea
      showNotification(
        'Eroare',
        error.message || 'A apărut o eroare la actualizarea proiectului.',
        { type: 'error' }
      );
      
      reportError(error);
      
      return { success: false, error: error.message };
    }
  }, [updateProjectInStore, fetchProjects, reportError, showNotification]);
  
  /**
   * Șterge un proiect
   * @param id ID-ul proiectului
   * @returns Rezultatul ștergerii
   */
  const deleteProject = useCallback(async (id: string) => {
    try {
      // Ștergem proiectul din store
      const result = await deleteProjectInStore(id);
      
      // Verificăm rezultatul
      if (result.success) {
        // Afișăm notificarea
        showNotification(
          'Proiect șters',
          'Proiectul a fost șters cu succes.',
          { type: 'success' }
        );
        
        // Reîncărcăm proiectele
        try {
        await fetchProjects();
        } catch (error) {
          // Handle error appropriately
        }
        
        return { success: true };
      } else {
        // Afișăm notificarea
        showNotification(
          'Eroare',
          result.error || 'A apărut o eroare la ștergerea proiectului.',
          { type: 'error' }
        );
        
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      // Afișăm notificarea
      showNotification(
        'Eroare',
        error.message || 'A apărut o eroare la ștergerea proiectului.',
        { type: 'error' }
      );
      
      reportError(error);
      
      return { success: false, error: error.message };
    }
  }, [deleteProjectInStore, fetchProjects, reportError, showNotification]);
  
  /**
   * Setează filtrul pentru proiecte
   * @param newFilter Noul filtru
   */
  const setProjectFilter = useCallback((newFilter: Partial<ProjectFilter>) => {
    setFilter(newFilter);
  }, [setFilter]);
  
  /**
   * Setează sortarea pentru proiecte
   * @param field Câmpul după care se face sortarea
   * @param direction Direcția sortării
   */
  const setProjectSort = useCallback((field: keyof Project, direction: 'asc' | 'desc') => {
    setSort({ field, direction });
    
    // Aplicăm sortarea în store
    setFilter({
      sortBy: field,
      sortOrder: direction,
    });
  }, [setFilter]);
  
  /**
   * Setează paginarea pentru proiecte
   * @param page Pagina
   * @param limit Limita
   */
  const setProjectPagination = useCallback((page: number, limit: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
      limit,
      totalPages: Math.ceil(prev.total / limit),
    }));
  }, []);
  
  /**
   * Obține proiectele după status
   * @param status Statusul proiectelor
   * @returns Lista de proiecte
   */
  const getProjectsByStatus = useCallback((status: ProjectStatus) => {
    return filteredProjects.filter((project) => project.status === status);
  }, [filteredProjects]);
  
  /**
   * Obține numărul de proiecte după status
   * @param status Statusul proiectelor
   * @returns Numărul de proiecte
   */
  const getProjectCountByStatus = useCallback((status: ProjectStatus) => {
    return getProjectsByStatus(status).length;
  }, [getProjectsByStatus]);
  
  /**
   * Obține procentul de proiecte după status
   * @param status Statusul proiectelor
   * @returns Procentul de proiecte
   */
  const getProjectPercentByStatus = useCallback((status: ProjectStatus) => {
    const count = getProjectCountByStatus(status);
    const total = filteredProjects.length;
    
    if (total === 0) return 0;
    
    return Math.round((count / total) * 100);
  }, [getProjectCountByStatus, filteredProjects.length]);
  
  // Încărcăm proiectele la montare
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  
  // Returnăm funcțiile și starea
  return {
    // Stare
    projects,
    filteredProjects,
    selectedProject,
    isLoading,
    error,
    filter,
    pagination,
    sort,
    
    // Funcții
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    setFilter: setProjectFilter,
    clearFilter,
    selectProject,
    clearError,
    setSort: setProjectSort,
    setPagination: setProjectPagination,
    getProjectsByStatus,
    getProjectCountByStatus,
    getProjectPercentByStatus,
  };
}

// Exportăm hook-ul
export default useProjects;
