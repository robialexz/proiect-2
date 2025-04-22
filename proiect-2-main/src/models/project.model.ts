/**
 * Model pentru proiect
 */
export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress?: number;
  priority?: ProjectPriority;
  start_date?: string;
  end_date?: string;
  budget?: number;
  client_name?: string;
  client_contact?: string;
  location?: string;
  project_type?: string;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  manager_id?: string;
}

/**
 * Statusurile posibile pentru un proiect
 */
export type ProjectStatus = 'planning' | 'active' | 'completed' | 'on-hold' | 'cancelled';

/**
 * Prioritățile posibile pentru un proiect
 */
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Model pentru milestone-urile unui proiect
 */
export interface ProjectMilestone {
  id: string;
  name: string;
  description?: string;
  project_id: string;
  due_date: string;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  completion_date?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Model pentru bugetul unui proiect
 */
export interface ProjectBudget {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  amount: number;
  start_date?: string;
  end_date?: string;
  category?: string;
  status?: 'planned' | 'approved' | 'spent' | 'cancelled';
  created_at: string;
  updated_at?: string;
  created_by?: string;
}

/**
 * Model pentru echipa unui proiect
 */
export interface ProjectTeam {
  id: string;
  project_id: string;
  team_id: string;
  role?: string;
  joined_at: string;
}

/**
 * Model pentru materialele unui proiect
 */
export interface ProjectMaterial {
  id: string;
  project_id: string;
  material_id: string;
  quantity: number;
  allocated_at: string;
  status?: 'ordered' | 'delivered' | 'in-use' | 'returned';
  notes?: string;
}

/**
 * Model pentru documentele unui proiect
 */
export interface ProjectDocument {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
  updated_at?: string;
}

/**
 * Model pentru rapoartele unui proiect
 */
export interface ProjectReport {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  report_url?: string;
  generated_at: string;
  generated_by: string;
  report_type: string;
}

/**
 * Model pentru sarcinile unui proiect
 */
export interface ProjectTask {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  tags?: string[];
  created_at: string;
  updated_at?: string;
  created_by?: string;
}
