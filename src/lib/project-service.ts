import { supabase } from './supabase';
import { Project } from '@/models/project';
import { errorMonitoring, ErrorSource, ErrorSeverity } from './error-monitoring';

class ProjectService {
  /**
   * Obține toate proiectele
   */
  async getAllProjects(): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to get all projects',
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține un proiect după ID
   */
  async getProjectById(projectId: string): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to get project by ID: ${projectId}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Creează un proiect nou
   */
  async createProject(project: Partial<Project>): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...project,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Failed to create project');
      
      return data;
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to create project',
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Actualizează un proiect existent
   */
  async updateProject(projectId: string, project: Partial<Project>): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...project,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Failed to update project');
      
      return data;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to update project: ${projectId}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Șterge un proiect
   */
  async deleteProject(projectId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      
      if (error) throw error;
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to delete project: ${projectId}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține proiectele după status
   */
  async getProjectsByStatus(status: string): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to get projects by status: ${status}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține proiectele după client
   */
  async getProjectsByClient(client: string): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('client', client)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to get projects by client: ${client}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține proiectele după locație
   */
  async getProjectsByLocation(location: string): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('location', location)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to get projects by location: ${location}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține proiectele după manager
   */
  async getProjectsByManager(manager: string): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('manager', manager)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to get projects by manager: ${manager}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține proiectele după data de început
   */
  async getProjectsByStartDate(startDate: string): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .gte('start_date', startDate)
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to get projects by start date: ${startDate}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține proiectele după data de sfârșit
   */
  async getProjectsByEndDate(endDate: string): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .lte('end_date', endDate)
        .order('end_date', { ascending: true });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to get projects by end date: ${endDate}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține proiectele active
   */
  async getActiveProjects(): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to get active projects',
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Obține proiectele finalizate
   */
  async getCompletedProjects(): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      errorMonitoring.captureError({
        message: 'Failed to get completed projects',
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
  
  /**
   * Caută proiecte după termen
   */
  async searchProjects(searchTerm: string): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,client.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,manager.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      errorMonitoring.captureError({
        message: `Failed to search projects: ${searchTerm}`,
        source: ErrorSource.API,
        severity: ErrorSeverity.ERROR,
        error: error as Error
      });
      throw error;
    }
  }
}

export const projectService = new ProjectService();
