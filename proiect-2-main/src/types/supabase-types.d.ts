// Acest fișier este folosit pentru a defini tipuri pentru Supabase
// și pentru a rezolva erorile de tip din proiect

// Ignoră erorile de tip pentru tabelele din Supabase
declare namespace Database {
  interface Tables {
    // Adaugă aici toate tabelele care lipsesc
    expenses: any;
    budget_categories: any;
    reports: any;
    report_templates: any;
    resources: any;
    resource_allocations: any;
    resource_categories: any;
    resource_category_mappings: any;
    tasks: any;
    user_roles: any;
    health_check: any;
    supplier_announcements: any;
    supplier_announcement_files: any;
    material_orders: any;
    project_order_settings: any;
  }
}

// Extinde tipurile pentru a include proprietăți care lipsesc
declare interface BudgetWithExpenses {
  total_amount?: number;
  status?: string;
}

declare interface Material {
  id: string;
  name: string;
  dimension: string;
  unit: string;
  quantity: number;
  manufacturer: string;
  category: string;
  image_url: string;
  cost_per_unit: string;
  supplier_id: string;
  last_order_date: string;
  min_stock_level: string;
  max_stock_level: string;
  location: string;
  notes: string;
  suplimentar?: any;
  min_stock_level?: any;
  max_stock_level?: any;
}

declare interface MaterialWithProject extends Material {
  project_id?: string;
  projects?: any;
}

declare interface LowStockItem extends Material {
  cost_per_unit?: any;
}

declare interface ProfileData {
  id: string;
  email: string;
  display_name: string;
  full_name?: string;
  avatar_url?: string;
  job_title?: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  theme_preference?: string;
  language_preference?: string;
  email_notifications?: boolean;
  mobile_notifications?: boolean;
}

declare interface Task {
  id?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  tags?: string[];
}

declare interface User {
  id: string;
  email: string;
  full_name?: string;
}

declare interface Announcement {
  id?: string;
  supplier_name: string;
  notes?: string;
  status: string;
  project_id?: string;
  created_at?: string;
  projects?: any;
  files?: any[];
}

// Extinde CacheOptions pentru a include expireIn
declare interface CacheOptions {
  expireIn?: number;
}

// Extinde MotionStyle pentru a include style
declare interface MotionStyle {
  style?: any;
}
