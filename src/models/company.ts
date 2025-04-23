/**
 * Model pentru companii
 */

export interface Company {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  tax_id?: string;
  registration_number?: string;
  status: CompanyStatus;
  subscription_plan?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  created_at: string;
  updated_at: string;
}

export enum CompanyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  TRIAL = 'trial'
}

export interface CompanyUser {
  id: string;
  company_id: string;
  user_id: string;
  role: CompanyUserRole;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    display_name?: string;
    avatar_url?: string;
  };
}

export enum CompanyUserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  TEAM_LEAD = 'team_lead',
  INVENTORY_MANAGER = 'inventory_manager',
  WORKER = 'worker',
  VIEWER = 'viewer'
}

export interface CompanyFilters {
  name?: string;
  status?: CompanyStatus;
  subscription_plan?: string;
}

export interface CompanySort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface CompanyPagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface CompanyUserFilters {
  company_id?: string;
  role?: CompanyUserRole;
  is_admin?: boolean;
  search?: string;
}

export interface CompanyUserSort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface CompanyUserPagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface CompanyInvitation {
  id: string;
  company_id: string;
  email: string;
  role: CompanyUserRole;
  is_admin: boolean;
  token: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyInvitationRequest {
  company_id: string;
  email: string;
  role: CompanyUserRole;
  is_admin: boolean;
}

export interface CompanyInvitationAcceptRequest {
  token: string;
  password?: string;
}

export interface CompanySubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  features: string[];
  max_users: number;
  max_projects: number;
  max_storage_gb: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
