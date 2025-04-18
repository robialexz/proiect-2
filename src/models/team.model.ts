/**
 * Model pentru echipă
 */
export interface Team {
  id: string;
  name: string;
  description?: string;
  leader_id?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Model pentru membrii echipei
 */
export interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  role: string;
  name: string;
  email: string;
  joined_at: string;
  left_at?: string;
  status?: 'active' | 'inactive' | 'on-leave';
}

/**
 * Model pentru rolurile din echipă
 */
export interface TeamRole {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
  created_at: string;
  updated_at?: string;
}

/**
 * Model pentru asocierea echipelor cu proiecte
 */
export interface TeamProject {
  id: string;
  team_id: string;
  project_id: string;
  role?: string;
  assigned_at: string;
  completed_at?: string;
  status?: 'active' | 'completed' | 'on-hold';
}

/**
 * Model pentru performanța echipei
 */
export interface TeamPerformance {
  id: string;
  team_id: string;
  project_id?: string;
  period_start: string;
  period_end: string;
  metrics: {
    tasks_completed?: number;
    on_time_delivery?: number;
    quality_score?: number;
    budget_adherence?: number;
  };
  notes?: string;
  created_at: string;
  created_by: string;
}

/**
 * Model pentru disponibilitatea echipei
 */
export interface TeamAvailability {
  id: string;
  team_id: string;
  date: string;
  available_hours: number;
  allocated_hours: number;
  notes?: string;
  updated_at: string;
}

/**
 * Model pentru competențele echipei
 */
export interface TeamSkill {
  id: string;
  team_id: string;
  skill_name: string;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  members_count?: number;
  created_at: string;
  updated_at?: string;
}
