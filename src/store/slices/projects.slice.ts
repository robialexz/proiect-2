/**
 * Slice pentru starea proiectelor
 * Acest slice gestionează starea proiectelor și a datelor asociate
 */

import { StateCreator } from 'zustand';
import { RootState } from '../store';
import { supabase } from '@/lib/supabase';
import { ProjectStatus } from '@/models/project.model';

// Tipul pentru proiect
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
  budget?: number;
  manager_id?: string;
  client_id?: string;
  created_at?: string;
  updated_at?: string;
  location?: string;
  image_url?: string;
  tags?: string[];
  progress?: number;
}

// Tipul pentru filtrul de proiecte
export interface ProjectFilter {
  search?: string;
  status?: ProjectStatus;
  minBudget?: number;
  maxBudget?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Tipul pentru starea proiectelor
export interface ProjectsState {
  // Starea proiectelor
  projects: Project[];
  filteredProjects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;
  filter: ProjectFilter;
  
  // Acțiuni
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (project: Omit<Project, 'id'>) => Promise<{ success: boolean; error?: string; id?: string }>;
  updateProject: (id: string, project: Partial<Project>) => Promise<{ success: boolean; error?: string }>;
  deleteProject: (id: string) => Promise<{ success: boolean; error?: string }>;
  setFilter: (filter: Partial<ProjectFilter>) => void;
  clearFilter: () => void;
  selectProject: (project: Project | null) => void;
  clearError: () => void;
}

// Creăm slice-ul pentru starea proiectelor
export const createProjectsSlice: StateCreator<
  RootState,
  [],
  [],
  ProjectsState
> = (set, get) => ({
  // Starea inițială
  projects: [],
  filteredProjects: [],
  selectedProject: null,
  isLoading: false,
  error: null,
  filter: {},
  
  // Acțiuni
  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*');
      
      if (error) throw error;
      
      // Convertim statusul la tipul ProjectStatus
      const projectsWithCorrectStatus = (data || []).map(project => ({
        ...project,
        status: project.status as ProjectStatus
      }));
      
      set({ 
        projects: projectsWithCorrectStatus,
        filteredProjects: projectsWithCorrectStatus,
        isLoading: false,
      });
      
      // Aplicăm filtrul curent
      get().setFilter(get().filter);
    } catch (error: any) {
      set({ 
        error: error.message || 'Eroare la încărcarea proiectelor',
        isLoading: false,
      });
    }
  },
  
  fetchProject: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Convertim statusul la tipul ProjectStatus
      const projectWithCorrectStatus = {
        ...data,
        status: data.status as ProjectStatus
      };
      
      set({ 
        selectedProject: projectWithCorrectStatus,
        isLoading: false,
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Eroare la încărcarea proiectului',
        isLoading: false,
      });
    }
  },
  
  createProject: async (project) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([project])
        .select();
      
      if (error) throw error;
      
      // Convertim statusul la tipul ProjectStatus
      const projectWithCorrectStatus = {
        ...data[0],
        status: data[0].status as ProjectStatus
      };
      
      // Actualizăm lista de proiecte
      set((state) => ({ 
        projects: [...state.projects, projectWithCorrectStatus],
        isLoading: false,
      }));
      
      // Aplicăm filtrul curent
      get().setFilter(get().filter);
      
      return { success: true, id: data[0].id };
    } catch (error: any) {
      set({ 
        error: error.message || 'Eroare la crearea proiectului',
        isLoading: false,
      });
      
      return { success: false, error: error.message };
    }
  },
  
  updateProject: async (id, project) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          ...project,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Actualizăm lista de proiecte
      set((state) => ({ 
        projects: state.projects.map((p) => 
          p.id === id ? { ...p, ...project, updated_at: new Date().toISOString() } : p
        ),
        selectedProject: state.selectedProject?.id === id 
          ? { ...state.selectedProject, ...project, updated_at: new Date().toISOString() } 
          : state.selectedProject,
        isLoading: false,
      }));
      
      // Aplicăm filtrul curent
      get().setFilter(get().filter);
      
      return { success: true };
    } catch (error: any) {
      set({ 
        error: error.message || 'Eroare la actualizarea proiectului',
        isLoading: false,
      });
      
      return { success: false, error: error.message };
    }
  },
  
  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Actualizăm lista de proiecte
      set((state) => ({ 
        projects: state.projects.filter((p) => p.id !== id),
        selectedProject: state.selectedProject?.id === id ? null : state.selectedProject,
        isLoading: false,
      }));
      
      // Aplicăm filtrul curent
      get().setFilter(get().filter);
      
      return { success: true };
    } catch (error: any) {
      set({ 
        error: error.message || 'Eroare la ștergerea proiectului',
        isLoading: false,
      });
      
      return { success: false, error: error.message };
    }
  },
  
  setFilter: (filter) => {
    // Actualizăm filtrul
    const newFilter = { ...get().filter, ...filter };
    
    // Filtrăm proiectele
    const { projects } = get();
    let filtered = [...projects];
    
    // Aplicăm filtrele
    if (newFilter.search) {
      const search = newFilter.search.toLowerCase();
      filtered = filtered.filter((p) => 
        p.name.toLowerCase().includes(search) || 
        p.description?.toLowerCase().includes(search) ||
        p.location?.toLowerCase().includes(search)
      );
    }
    
    if (newFilter.status) {
      filtered = filtered.filter((p) => p.status === newFilter.status);
    }
    
    if (newFilter.minBudget !== undefined) {
      filtered = filtered.filter((p) => (p.budget || 0) >= (newFilter.minBudget || 0));
    }
    
    if (newFilter.maxBudget !== undefined) {
      filtered = filtered.filter((p) => (p.budget || 0) <= (newFilter.maxBudget || 0));
    }
    
    if (newFilter.startDate) {
      filtered = filtered.filter((p) => p.start_date && p.start_date >= newFilter.startDate!);
    }
    
    if (newFilter.endDate) {
      filtered = filtered.filter((p) => p.end_date && p.end_date <= newFilter.endDate!);
    }
    
    // Sortăm proiectele
    if (newFilter.sortBy) {
      filtered.sort((a, b) => {
        const aValue = a[newFilter.sortBy as keyof Project];
        const bValue = b[newFilter.sortBy as keyof Project];
        
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return newFilter.sortOrder === 'desc'
            ? bValue.localeCompare(aValue)
            : aValue.localeCompare(bValue);
        }
        
        return newFilter.sortOrder === 'desc'
          ? Number(bValue) - Number(aValue)
          : Number(aValue) - Number(bValue);
      });
    }
    
    set({ 
      filter: newFilter,
      filteredProjects: filtered,
    });
  },
  
  clearFilter: () => {
    set((state) => ({ 
      filter: {},
      filteredProjects: state.projects,
    }));
  },
  
  selectProject: (project) => {
    set({ selectedProject: project });
  },
  
  clearError: () => set({ error: null }),
});
