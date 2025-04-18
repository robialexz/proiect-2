// Importăm tipurile din modelele de date
export * from "@/models";

// Importăm tipurile pentru Supabase
export * from "./supabase";
export * from "./supabase-tables";

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
  align?: "left" | "center" | "right";
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
  type:
    | "text"
    | "textarea"
    | "number"
    | "email"
    | "password"
    | "select"
    | "multiselect"
    | "date"
    | "time"
    | "datetime"
    | "checkbox"
    | "radio"
    | "file";
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
      position?: "top" | "bottom" | "left" | "right";
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
  type:
    | "text"
    | "select"
    | "multiselect"
    | "date"
    | "daterange"
    | "number"
    | "boolean";
  options?: FilterOption[];
  defaultValue?: any;
}

// Export types
export type ExportFormat = "csv" | "excel" | "pdf" | "json";

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
export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
}

export type Status = "idle" | "loading" | "success" | "error";

export interface ErrorState {
  message: string;
  code?: string;
  details?: any;
}

export type ID = string | number;
