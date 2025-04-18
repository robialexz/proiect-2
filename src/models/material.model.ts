/**
 * Model pentru material
 */
export interface Material {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  dimension?: string;
  manufacturer?: string;
  cost_per_unit?: number;
  supplier_id?: string;
  project_id?: string;
  category?: string;
  location?: string;
  min_stock_level?: number;
  max_stock_level?: number;
  suplimentar?: number;
  notes?: string;
  image_url?: string;
  created_at: string;
  updated_at?: string;
  created_by?: string;
}

/**
 * Model pentru material cu informații despre proiect
 */
export interface MaterialWithProject extends Material {
  project_id?: string;
  project_name?: string;
  project_status?: string;
}

/**
 * Model pentru material cu stoc scăzut
 */
export interface LowStockItem extends Material {
  deficit?: number;
  reorder_quantity?: number;
}

/**
 * Model pentru categoria de materiale
 */
export interface MaterialCategory {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Model pentru comanda de materiale
 */
export interface MaterialOrder {
  id: string;
  supplier_id: string;
  project_id?: string;
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  status: 'draft' | 'ordered' | 'partial' | 'delivered' | 'cancelled';
  total_amount?: number;
  payment_status?: 'unpaid' | 'partial' | 'paid';
  notes?: string;
  created_at: string;
  updated_at?: string;
  created_by: string;
}

/**
 * Model pentru elementele unei comenzi de materiale
 */
export interface MaterialOrderItem {
  id: string;
  order_id: string;
  material_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  received_quantity?: number;
  status?: 'pending' | 'partial' | 'received' | 'rejected';
  notes?: string;
}

/**
 * Model pentru transferul de materiale
 */
export interface MaterialTransfer {
  id: string;
  material_id: string;
  from_project_id?: string;
  to_project_id?: string;
  from_location?: string;
  to_location?: string;
  quantity: number;
  transfer_date: string;
  status: 'pending' | 'in-transit' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  created_by: string;
}

/**
 * Model pentru ajustarea stocului de materiale
 */
export interface MaterialStockAdjustment {
  id: string;
  material_id: string;
  previous_quantity: number;
  new_quantity: number;
  adjustment_type: 'increase' | 'decrease';
  reason: string;
  adjustment_date: string;
  notes?: string;
  created_by: string;
  created_at: string;
}
