// User types
export interface User {
  id: string;
  email: string;
  role?: string;
}

export interface UserProfile {
  displayName: string;
  email: string;
  avatar?: string;
  role?: string;
  settings?: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

// Project types
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

export type ProjectStatus = 'planning' | 'active' | 'completed' | 'on-hold' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

// Material types
export interface Material {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  price?: number;
  supplier_id?: string;
  project_id?: string;
  category?: string;
  location?: string;
  min_quantity?: number;
  image_url?: string;
  created_at: string;
  updated_at?: string;
}

// Supplier types
export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  notes?: string;
  rating?: number;
  created_at: string;
  updated_at?: string;
}

// Team types
export interface Team {
  id: string;
  name: string;
  description?: string;
  leader_id?: string;
  members?: TeamMember[];
  created_at: string;
  updated_at?: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  role: string;
  name: string;
  email: string;
  joined_at: string;
}

// Budget types
export interface Budget {
  id: string;
  name: string;
  description?: string;
  amount: number;
  start_date?: string;
  end_date?: string;
  project_id?: string;
  category?: string;
  status?: 'planned' | 'approved' | 'spent' | 'cancelled';
  created_at: string;
  updated_at?: string;
  created_by?: string;
}

export interface Transaction {
  id: string;
  budget_id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
  category?: string;
  payment_method?: string;
  receipt_url?: string;
  created_by: string;
  created_at: string;
}

// Milestone types
export interface Milestone {
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

// Document types
export interface Document {
  id: string;
  name: string;
  description?: string;
  file_url: string;
  file_type: string;
  file_size: number;
  project_id?: string;
  category?: string;
  tags?: string[];
  uploaded_by: string;
  uploaded_at: string;
  updated_at?: string;
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  user_id: string;
  link?: string;
  entity_type?: string;
  entity_id?: string;
}

// Report types
export interface Report {
  id: string;
  title: string;
  description?: string;
  type: 'project' | 'inventory' | 'budget' | 'team' | 'custom';
  parameters?: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at?: string;
  last_run?: string;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    day?: number;
    time?: string;
    recipients?: string[];
  };
}

// UI types
export interface MenuItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  external?: boolean;
  label?: string;
}

export interface NavItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  items?: NavItem[];
}

export interface TableColumn<T> {
  title: string;
  field: keyof T | string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
}

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'password' | 'select' | 'multiselect' | 'date' | 'time' | 'datetime' | 'checkbox' | 'radio' | 'file';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { label: string; value: string | number }[];
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    message?: string;
  };
  defaultValue?: any;
}

// Chart types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    legend?: {
      position?: 'top' | 'bottom' | 'left' | 'right';
      display?: boolean;
    };
    tooltip?: {
      enabled?: boolean;
    };
    title?: {
      display?: boolean;
      text?: string;
    };
  };
  scales?: {
    x?: {
      grid?: {
        display?: boolean;
      };
    };
    y?: {
      grid?: {
        display?: boolean;
      };
      beginAtZero?: boolean;
    };
  };
}

// Filter types
export interface FilterOption {
  label: string;
  value: string | number | boolean;
}

export interface FilterConfig {
  field: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'boolean';
  options?: FilterOption[];
  defaultValue?: any;
}

// Export types
export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  fileName?: string;
  fields?: string[];
  includeHeaders?: boolean;
}

// Theme types
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  input: string;
  ring: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  radius: string;
  fontFamily: string;
}

// Animation types
export interface AnimationVariants {
  initial: Record<string, any>;
  animate: Record<string, any>;
  exit?: Record<string, any>;
  transition?: Record<string, any>;
}

// Utility types
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
}

export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface ErrorState {
  message: string;
  code?: string;
  details?: any;
}

export type ID = string | number;
