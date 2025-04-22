/**
 * Serviciu pentru proiecte
 * Acest fișier conține funcții pentru interacțiunea cu proiectele
 */

import { supabase } from '@/lib/supabase';
import { apiLogger } from '@/lib/logging';
import { createError, ErrorSource, ErrorType, ErrorSeverity } from '@/lib/error-handling';
import { Project, CreateProjectInput, UpdateProjectInput, ProjectFilter, ProjectSort, ProjectPagination } from '@/models/project.model';

/**
 * Serviciu pentru proiecte
 */
export const projectService = {
  /**
   * Obține toate proiectele
   * @param filter Filtrul pentru proiecte
   * @param sort Sortarea pentru proiecte
   * @param pagination Paginarea pentru proiecte
   * @returns Lista de proiecte
   */
  async getProjects(
    filter?: ProjectFilter,
    sort?: ProjectSort,
    pagination?: ProjectPagination
  ) {
    try {
      // Construim query-ul
      let query = supabase.from('projects').select('*');
      
      // Aplicăm filtrele
      if (filter) {
        if (filter.search) {
          query = query.or(`name.ilike.%${filter.search}%,description.ilike.%${filter.search}%,location.ilike.%${filter.search}%`);
        }
        
        if (filter.status) {
          if (Array.isArray(filter.status)) {
            query = query.in('status', filter.status);
          } else {
            query = query.eq('status', filter.status);
          }
        }
        
        if (filter.minBudget !== undefined) {
          query = query.gte('budget', filter.minBudget);
        }
        
        if (filter.maxBudget !== undefined) {
          query = query.lte('budget', filter.maxBudget);
        }
        
        if (filter.startDate) {
          query = query.gte('start_date', filter.startDate);
        }
        
        if (filter.endDate) {
          query = query.lte('end_date', filter.endDate);
        }
        
        if (filter.tags && filter.tags.length > 0) {
          query = query.contains('tags', filter.tags);
        }
      }
      
      // Aplicăm sortarea
      if (sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }
      
      // Aplicăm paginarea
      if (pagination) {
        const { page, limit } = pagination;
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        
        query = query.range(from, to);
      }
      
      // Executăm query-ul
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      // Calculăm numărul total de pagini
      const totalPages = pagination
        ? Math.ceil((count || 0) / pagination.limit)
        : 1;
      
      return {
        data,
        total: count || 0,
        page: pagination?.page || 1,
        limit: pagination?.limit || data?.length || 0,
        totalPages,
        error: null,
      };
    } catch (error: any) {
      apiLogger.error('Error getting projects:', error);
      
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        error: createError(error.message || 'Error getting projects', {
          source: ErrorSource.DATABASE,
          type: ErrorType.SERVER_ERROR,
          severity: ErrorSeverity.ERROR,
          originalError: error,
        }),
      };
    }
  },
  
  /**
   * Obține un proiect după ID
   * @param id ID-ul proiectului
   * @returns Proiectul
   */
  async getProjectById(id: string) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error: any) {
      apiLogger.error(`Error getting project with ID ${id}:`, error);
      
      return {
        data: null,
        error: createError(error.message || `Error getting project with ID ${id}`, {
          source: ErrorSource.DATABASE,
          type: ErrorType.SERVER_ERROR,
          severity: ErrorSeverity.ERROR,
          originalError: error,
        }),
      };
    }
  },
  
  /**
   * Creează un proiect
   * @param project Datele proiectului
   * @returns Proiectul creat
   */
  async createProject(project: CreateProjectInput) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          ...project,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error: any) {
      apiLogger.error('Error creating project:', error);
      
      return {
        data: null,
        error: createError(error.message || 'Error creating project', {
          source: ErrorSource.DATABASE,
          type: ErrorType.SERVER_ERROR,
          severity: ErrorSeverity.ERROR,
          originalError: error,
        }),
      };
    }
  },
  
  /**
   * Actualizează un proiect
   * @param id ID-ul proiectului
   * @param project Datele proiectului
   * @returns Proiectul actualizat
   */
  async updateProject(id: string, project: UpdateProjectInput) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...project,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error: any) {
      apiLogger.error(`Error updating project with ID ${id}:`, error);
      
      return {
        data: null,
        error: createError(error.message || `Error updating project with ID ${id}`, {
          source: ErrorSource.DATABASE,
          type: ErrorType.SERVER_ERROR,
          severity: ErrorSeverity.ERROR,
          originalError: error,
        }),
      };
    }
  },
  
  /**
   * Șterge un proiect
   * @param id ID-ul proiectului
   * @returns Rezultatul ștergerii
   */
  async deleteProject(id: string) {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return { error: null };
    } catch (error: any) {
      apiLogger.error(`Error deleting project with ID ${id}:`, error);
      
      return {
        error: createError(error.message || `Error deleting project with ID ${id}`, {
          source: ErrorSource.DATABASE,
          type: ErrorType.SERVER_ERROR,
          severity: ErrorSeverity.ERROR,
          originalError: error,
        }),
      };
    }
  },
};

// Exportăm serviciul
export default projectService;
