export interface Project {
  id: string;
  name: string;
  description?: string;
  client?: string;
  location?: string;
  manager?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  budget?: number;
  currency?: string;
  progress?: number;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  left_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: string;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  file_path: string;
  file_type: string;
  file_size?: number;
  uploaded_at: string;
  uploaded_by?: string;
  version?: string;
  tags?: string[];
}

export interface ProjectNote {
  id: string;
  project_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface ProjectEvent {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  type: 'meeting' | 'deadline' | 'milestone' | 'other';
  attendees?: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface ProjectBudgetItem {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  type: 'income' | 'expense';
  category?: string;
  date: string;
  status: 'planned' | 'approved' | 'paid' | 'cancelled';
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface ProjectRisk {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  status: 'identified' | 'mitigated' | 'occurred' | 'closed';
  mitigation_plan?: string;
  contingency_plan?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface ProjectFilters {
  search?: string;
  status?: string;
  client?: string;
  location?: string;
  manager?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
}

export interface ProjectSort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ProjectPagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  cancelledProjects: number;
  totalBudget: number;
  totalExpenses: number;
  projectsByClient: Record<string, number>;
  projectsByLocation: Record<string, number>;
  projectsByStatus: Record<string, number>;
  projectsByMonth: { month: string; count: number }[];
}
