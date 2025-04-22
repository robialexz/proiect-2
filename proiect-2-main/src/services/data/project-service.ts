import DataService from './data-service';
import { Project, ProjectMilestone, ProjectBudget, ProjectTask } from '@/models';
import { enhancedSupabaseService, SupabaseResponse } from '../api/enhanced-supabase-service';
import { authService } from '../auth/auth-service';

/**
 * Serviciu pentru gestionarea proiectelor
 */
class ProjectService extends DataService<Project> {
  private milestoneService: DataService<ProjectMilestone>;
  private budgetService: DataService<ProjectBudget>;
  private taskService: DataService<ProjectTask>;
  
  constructor() {
    super('projects');
    this.milestoneService = new DataService<ProjectMilestone>('project_milestones');
    this.budgetService = new DataService<ProjectBudget>('budgets');
    this.taskService = new DataService<ProjectTask>('tasks');
  }
  
  /**
   * Obține proiectele utilizatorului curent
   * @returns Proiectele utilizatorului sau eroarea
   */
  async getCurrentUserProjects(): Promise<SupabaseResponse<Project[]>> {
    try {
      // Obținem utilizatorul curent
      const { data: user, error } = await authService.getUser();
      
      if (error || !user) {
        throw new Error(error?.message || 'User not found');
      }
      
      // Obținem proiectele utilizatorului
      return enhancedSupabaseService.rpc<Project[]>('get_user_projects', {
        user_id: user.id
      });
    } catch (error) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to get current user projects',
          code: 'user_projects_error'
        },
        status: 'error'
      };
    }
  }
  
  /**
   * Obține milestone-urile unui proiect
   * @param projectId ID-ul proiectului
   * @returns Milestone-urile proiectului sau eroarea
   */
  async getProjectMilestones(projectId: string): Promise<SupabaseResponse<ProjectMilestone[]>> {
    return this.milestoneService.getAll({
      filters: { project_id: projectId },
      sort: { field: 'due_date', direction: 'asc' }
    });
  }
  
  /**
   * Obține bugetul unui proiect
   * @param projectId ID-ul proiectului
   * @returns Bugetul proiectului sau eroarea
   */
  async getProjectBudget(projectId: string): Promise<SupabaseResponse<ProjectBudget[]>> {
    return this.budgetService.getAll({
      filters: { project_id: projectId }
    });
  }
  
  /**
   * Obține sarcinile unui proiect
   * @param projectId ID-ul proiectului
   * @returns Sarcinile proiectului sau eroarea
   */
  async getProjectTasks(projectId: string): Promise<SupabaseResponse<ProjectTask[]>> {
    return this.taskService.getAll({
      filters: { project_id: projectId },
      sort: { field: 'due_date', direction: 'asc' }
    });
  }
  
  /**
   * Creează un proiect nou
   * @param project Datele proiectului
   * @returns Proiectul creat sau eroarea
   */
  async createProject(project: Partial<Project>): Promise<SupabaseResponse<Project>> {
    try {
      // Obținem utilizatorul curent
      const { data: user, error } = await authService.getUser();
      
      if (error || !user) {
        throw new Error(error?.message || 'User not found');
      }
      
      // Adăugăm utilizatorul curent ca creator al proiectului
      const projectData: Partial<Project> = {
        ...project,
        created_by: user.id,
        created_at: new Date().toISOString()
      };
      
      // Creăm proiectul
      return this.create(projectData);
    } catch (error) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to create project',
          code: 'project_create_error'
        },
        status: 'error'
      };
    }
  }
  
  /**
   * Actualizează progresul unui proiect
   * @param projectId ID-ul proiectului
   * @param progress Progresul proiectului (0-100)
   * @returns Proiectul actualizat sau eroarea
   */
  async updateProjectProgress(projectId: string, progress: number): Promise<SupabaseResponse<Project>> {
    // Validăm progresul
    const validProgress = Math.max(0, Math.min(100, progress));
    
    // Actualizăm proiectul
    return this.update(projectId, { progress: validProgress });
  }
  
  /**
   * Actualizează statusul unui proiect
   * @param projectId ID-ul proiectului
   * @param status Statusul proiectului
   * @returns Proiectul actualizat sau eroarea
   */
  async updateProjectStatus(projectId: string, status: Project['status']): Promise<SupabaseResponse<Project>> {
    // Actualizăm proiectul
    return this.update(projectId, { status });
  }
  
  /**
   * Adaugă un milestone la un proiect
   * @param projectId ID-ul proiectului
   * @param milestone Datele milestone-ului
   * @returns Milestone-ul creat sau eroarea
   */
  async addProjectMilestone(projectId: string, milestone: Partial<ProjectMilestone>): Promise<SupabaseResponse<ProjectMilestone>> {
    try {
      // Obținem utilizatorul curent
      const { data: user, error } = await authService.getUser();
      
      if (error || !user) {
        throw new Error(error?.message || 'User not found');
      }
      
      // Adăugăm proiectul și data creării
      const milestoneData: Partial<ProjectMilestone> = {
        ...milestone,
        project_id: projectId,
        created_at: new Date().toISOString()
      };
      
      // Creăm milestone-ul
      return this.milestoneService.create(milestoneData);
    } catch (error) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to add project milestone',
          code: 'project_milestone_error'
        },
        status: 'error'
      };
    }
  }
  
  /**
   * Adaugă un buget la un proiect
   * @param projectId ID-ul proiectului
   * @param budget Datele bugetului
   * @returns Bugetul creat sau eroarea
   */
  async addProjectBudget(projectId: string, budget: Partial<ProjectBudget>): Promise<SupabaseResponse<ProjectBudget>> {
    try {
      // Obținem utilizatorul curent
      const { data: user, error } = await authService.getUser();
      
      if (error || !user) {
        throw new Error(error?.message || 'User not found');
      }
      
      // Adăugăm proiectul și data creării
      const budgetData: Partial<ProjectBudget> = {
        ...budget,
        project_id: projectId,
        created_by: user.id,
        created_at: new Date().toISOString()
      };
      
      // Creăm bugetul
      return this.budgetService.create(budgetData);
    } catch (error) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to add project budget',
          code: 'project_budget_error'
        },
        status: 'error'
      };
    }
  }
  
  /**
   * Adaugă o sarcină la un proiect
   * @param projectId ID-ul proiectului
   * @param task Datele sarcinii
   * @returns Sarcina creată sau eroarea
   */
  async addProjectTask(projectId: string, task: Partial<ProjectTask>): Promise<SupabaseResponse<ProjectTask>> {
    try {
      // Obținem utilizatorul curent
      const { data: user, error } = await authService.getUser();
      
      if (error || !user) {
        throw new Error(error?.message || 'User not found');
      }
      
      // Adăugăm proiectul și data creării
      const taskData: Partial<ProjectTask> = {
        ...task,
        project_id: projectId,
        created_by: user.id,
        created_at: new Date().toISOString()
      };
      
      // Creăm sarcina
      return this.taskService.create(taskData);
    } catch (error) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to add project task',
          code: 'project_task_error'
        },
        status: 'error'
      };
    }
  }
  
  /**
   * Obține statistici pentru un proiect
   * @param projectId ID-ul proiectului
   * @returns Statisticile proiectului sau eroarea
   */
  async getProjectStats(projectId: string): Promise<SupabaseResponse<{
    tasksTotal: number;
    tasksCompleted: number;
    milestonesTotal: number;
    milestonesCompleted: number;
    budgetTotal: number;
    budgetSpent: number;
  }>> {
    try {
      // Obținem sarcinile proiectului
      const { data: tasks } = await this.getProjectTasks(projectId);
      
      // Obținem milestone-urile proiectului
      const { data: milestones } = await this.getProjectMilestones(projectId);
      
      // Obținem bugetul proiectului
      const { data: budgets } = await this.getProjectBudget(projectId);
      
      // Calculăm statisticile
      const tasksTotal = tasks?.length || 0;
      const tasksCompleted = tasks?.filter(task => task.status === 'completed').length || 0;
      
      const milestonesTotal = milestones?.length || 0;
      const milestonesCompleted = milestones?.filter(milestone => milestone.status === 'completed').length || 0;
      
      const budgetTotal = budgets?.reduce((total, budget) => total + (budget.amount || 0), 0) || 0;
      const budgetSpent = 0; // Vom implementa această funcționalitate ulterior
      
      return {
        data: {
          tasksTotal,
          tasksCompleted,
          milestonesTotal,
          milestonesCompleted,
          budgetTotal,
          budgetSpent
        },
        error: null,
        status: 'success'
      };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to get project statistics',
          code: 'project_stats_error'
        },
        status: 'error'
      };
    }
  }
}

export const projectService = new ProjectService();
export default projectService;
