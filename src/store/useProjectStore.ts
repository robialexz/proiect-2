import { create } from 'zustand';
import { Project, ProjectMilestone, ProjectBudget, ProjectTask } from '@/models';
import { projectService } from '@/services';

// Definim tipurile pentru starea proiectelor
interface ProjectState {
  // Stare
  projects: Project[];
  currentProject: Project | null;
  projectMilestones: ProjectMilestone[];
  projectBudgets: ProjectBudget[];
  projectTasks: ProjectTask[];
  isLoading: boolean;
  error: string | null;
  
  // Acțiuni
  fetchProjects: () => Promise<void>;
  fetchProject: (projectId: string) => Promise<void>;
  fetchProjectMilestones: (projectId: string) => Promise<void>;
  fetchProjectBudgets: (projectId: string) => Promise<void>;
  fetchProjectTasks: (projectId: string) => Promise<void>;
  createProject: (project: Partial<Project>) => Promise<Project | null>;
  updateProject: (projectId: string, project: Partial<Project>) => Promise<Project | null>;
  deleteProject: (projectId: string) => Promise<boolean>;
  addProjectMilestone: (projectId: string, milestone: Partial<ProjectMilestone>) => Promise<ProjectMilestone | null>;
  addProjectBudget: (projectId: string, budget: Partial<ProjectBudget>) => Promise<ProjectBudget | null>;
  addProjectTask: (projectId: string, task: Partial<ProjectTask>) => Promise<ProjectTask | null>;
  updateProjectStatus: (projectId: string, status: Project['status']) => Promise<boolean>;
  updateProjectProgress: (projectId: string, progress: number) => Promise<boolean>;
  clearError: () => void;
  setLoading: (isLoading: boolean) => void;
}

// Creăm store-ul pentru proiecte
export const useProjectStore = create<ProjectState>((set, get) => ({
  // Stare inițială
  projects: [],
  currentProject: null,
  projectMilestones: [],
  projectBudgets: [],
  projectTasks: [],
  isLoading: false,
  error: null,
  
  // Acțiuni
  fetchProjects: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await projectService.getCurrentUserProjects();
      
      if (error || !data) {
        set({ 
          isLoading: false, 
          error: error?.message || 'Eroare la încărcarea proiectelor' 
        });
        return;
      }
      
      set({ 
        projects: data,
        isLoading: false
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Eroare la încărcarea proiectelor' 
      });
    }
  },
  
  fetchProject: async (projectId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await projectService.getById(projectId);
      
      if (error || !data) {
        set({ 
          isLoading: false, 
          error: error?.message || 'Eroare la încărcarea proiectului' 
        });
        return;
      }
      
      set({ 
        currentProject: data,
        isLoading: false
      });
      
      // Încărcăm datele asociate proiectului
      get().fetchProjectMilestones(projectId);
      get().fetchProjectBudgets(projectId);
      get().fetchProjectTasks(projectId);
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Eroare la încărcarea proiectului' 
      });
    }
  },
  
  fetchProjectMilestones: async (projectId: string) => {
    try {
      const { data, error } = await projectService.getProjectMilestones(projectId);
      
      if (error || !data) {
        // Removed console statement
        return;
      }
      
      set({ projectMilestones: data });
    } catch (error) {
      // Removed console statement
    }
  },
  
  fetchProjectBudgets: async (projectId: string) => {
    try {
      const { data, error } = await projectService.getProjectBudget(projectId);
      
      if (error || !data) {
        // Removed console statement
        return;
      }
      
      set({ projectBudgets: data });
    } catch (error) {
      // Removed console statement
    }
  },
  
  fetchProjectTasks: async (projectId: string) => {
    try {
      const { data, error } = await projectService.getProjectTasks(projectId);
      
      if (error || !data) {
        // Removed console statement
        return;
      }
      
      set({ projectTasks: data });
    } catch (error) {
      // Removed console statement
    }
  },
  
  createProject: async (project: Partial<Project>) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await projectService.createProject(project);
      
      if (error || !data) {
        set({ 
          isLoading: false, 
          error: error?.message || 'Eroare la crearea proiectului' 
        });
        return null;
      }
      
      // Actualizăm lista de proiecte
      set(state => ({ 
        projects: [...state.projects, data],
        currentProject: data,
        isLoading: false
      }));
      
      return data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Eroare la crearea proiectului' 
      });
      return null;
    }
  },
  
  updateProject: async (projectId: string, project: Partial<Project>) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await projectService.update(projectId, project);
      
      if (error || !data) {
        set({ 
          isLoading: false, 
          error: error?.message || 'Eroare la actualizarea proiectului' 
        });
        return null;
      }
      
      // Actualizăm proiectul în lista de proiecte
      set(state => ({ 
        projects: state.projects.map(p => p.id === projectId ? data : p),
        currentProject: state.currentProject?.id === projectId ? data : state.currentProject,
        isLoading: false
      }));
      
      return data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Eroare la actualizarea proiectului' 
      });
      return null;
    }
  },
  
  deleteProject: async (projectId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await projectService.delete(projectId);
      
      if (error) {
        set({ 
          isLoading: false, 
          error: error.message || 'Eroare la ștergerea proiectului' 
        });
        return false;
      }
      
      // Eliminăm proiectul din lista de proiecte
      set(state => ({ 
        projects: state.projects.filter(p => p.id !== projectId),
        currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Eroare la ștergerea proiectului' 
      });
      return false;
    }
  },
  
  addProjectMilestone: async (projectId: string, milestone: Partial<ProjectMilestone>) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await projectService.addProjectMilestone(projectId, milestone);
      
      if (error || !data) {
        set({ 
          isLoading: false, 
          error: error?.message || 'Eroare la adăugarea milestone-ului' 
        });
        return null;
      }
      
      // Adăugăm milestone-ul în lista de milestone-uri
      set(state => ({ 
        projectMilestones: [...state.projectMilestones, data],
        isLoading: false
      }));
      
      return data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Eroare la adăugarea milestone-ului' 
      });
      return null;
    }
  },
  
  addProjectBudget: async (projectId: string, budget: Partial<ProjectBudget>) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await projectService.addProjectBudget(projectId, budget);
      
      if (error || !data) {
        set({ 
          isLoading: false, 
          error: error?.message || 'Eroare la adăugarea bugetului' 
        });
        return null;
      }
      
      // Adăugăm bugetul în lista de bugete
      set(state => ({ 
        projectBudgets: [...state.projectBudgets, data],
        isLoading: false
      }));
      
      return data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Eroare la adăugarea bugetului' 
      });
      return null;
    }
  },
  
  addProjectTask: async (projectId: string, task: Partial<ProjectTask>) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await projectService.addProjectTask(projectId, task);
      
      if (error || !data) {
        set({ 
          isLoading: false, 
          error: error?.message || 'Eroare la adăugarea sarcinii' 
        });
        return null;
      }
      
      // Adăugăm sarcina în lista de sarcini
      set(state => ({ 
        projectTasks: [...state.projectTasks, data],
        isLoading: false
      }));
      
      return data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Eroare la adăugarea sarcinii' 
      });
      return null;
    }
  },
  
  updateProjectStatus: async (projectId: string, status: Project['status']) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await projectService.updateProjectStatus(projectId, status);
      
      if (error || !data) {
        set({ 
          isLoading: false, 
          error: error?.message || 'Eroare la actualizarea statusului proiectului' 
        });
        return false;
      }
      
      // Actualizăm proiectul în lista de proiecte
      set(state => ({ 
        projects: state.projects.map(p => p.id === projectId ? data : p),
        currentProject: state.currentProject?.id === projectId ? data : state.currentProject,
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Eroare la actualizarea statusului proiectului' 
      });
      return false;
    }
  },
  
  updateProjectProgress: async (projectId: string, progress: number) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await projectService.updateProjectProgress(projectId, progress);
      
      if (error || !data) {
        set({ 
          isLoading: false, 
          error: error?.message || 'Eroare la actualizarea progresului proiectului' 
        });
        return false;
      }
      
      // Actualizăm proiectul în lista de proiecte
      set(state => ({ 
        projects: state.projects.map(p => p.id === projectId ? data : p),
        currentProject: state.currentProject?.id === projectId ? data : state.currentProject,
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message || 'Eroare la actualizarea progresului proiectului' 
      });
      return false;
    }
  },
  
  clearError: () => set({ error: null }),
  
  setLoading: (isLoading: boolean) => set({ isLoading })
}));

export default useProjectStore;
