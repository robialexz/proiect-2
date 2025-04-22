import { Database as DatabaseTypes } from './supabase-types';

export type Database = DatabaseTypes;

// Definim tipurile pentru tabela resources
export interface Resource {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: 'available' | 'in_use' | 'maintenance' | 'retired';
  quantity?: number;
  location?: string;
  assigned_to?: string;
  project_id?: string;
  acquisition_date?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  cost?: number;
  supplier_id?: string;
  created_at: string;
  updated_at?: string;
  created_by?: string;
}

// Definim tipurile pentru alocarea resurselor
export interface ResourceAllocation {
  id: string;
  resource_id: string;
  project_id: string;
  allocated_by: string;
  allocated_at: string;
  returned_at?: string;
  quantity: number;
  notes?: string;
  status: 'allocated' | 'returned' | 'damaged';
}

// Definim tipurile pentru întreținerea resurselor
export interface ResourceMaintenance {
  id: string;
  resource_id: string;
  maintenance_type: 'routine' | 'repair' | 'inspection';
  performed_by: string;
  performed_at: string;
  cost?: number;
  notes?: string;
  next_maintenance?: string;
}

// Exportăm toate tipurile într-un singur obiect
export const SupabaseTypes = {
  Resource,
  ResourceAllocation,
  ResourceMaintenance,
};
