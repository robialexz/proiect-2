// Definim tipurile pentru tabelele din Supabase
// Acest fișier ajută la rezolvarea erorilor de tipizare când folosim supabase.from()

export type SupabaseTables = 
  | 'budgets'
  | 'materials'
  | 'profiles'
  | 'project_milestones'
  | 'projects'
  | 'suppliers'
  | 'team_members'
  | 'team_projects'
  | 'teams'
  | 'resources'
  | 'documents'
  | 'settings'
  | 'notifications'
  | 'user_settings'
  | 'reports'
  | 'public_data';

// Tipuri pentru funcțiile RPC
export type SupabaseRpcFunctions = 
  | 'get_user_projects'
  | 'get_project_materials'
  | 'get_team_members'
  | 'get_project_budget'
  | 'get_user_notifications';

// Tipuri pentru rezultatele din Supabase
export interface GenericStringError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

// Tipuri pentru datele din tabele
export interface SupabaseTableData {
  [key: string]: any;
}

// Tipuri pentru parametrii RPC
export interface SupabaseRpcParams {
  [key: string]: any;
}
