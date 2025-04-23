export interface Material {
  id: string;
  name: string;
  dimension?: string;
  unit: string;
  quantity: number;
  manufacturer?: string;
  category?: string;
  image_url?: string;
  suplimentar?: number;
  cost_per_unit?: number;
  supplier_id?: string;
  last_order_date?: string;
  min_stock_level?: number;
  max_stock_level?: number;
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  qr_code?: string;
  barcode?: string;
  status?: 'active' | 'inactive' | 'pending' | 'archived';
}

export interface MaterialWithProject extends Material {
  project_id: string | null;
  project_name?: string | null;
}

export interface MaterialWithSupplier extends Material {
  supplier_name?: string;
  supplier_contact?: string;
  supplier_email?: string;
}

export interface MaterialCategory {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MaterialLocation {
  id: string;
  name: string;
  description?: string;
  warehouse_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MaterialMovement {
  id: string;
  material_id: string;
  from_location_id?: string;
  to_location_id?: string;
  from_project_id?: string;
  to_project_id?: string;
  quantity: number;
  movement_date: string;
  movement_type: 'transfer' | 'issue' | 'return' | 'adjustment' | 'receipt';
  notes?: string;
  created_by: string;
  created_at: string;
}

export interface MaterialOrder {
  id: string;
  material_id: string;
  supplier_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  status: 'pending' | 'approved' | 'ordered' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Warehouse {
  id: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryFilters {
  search?: string;
  category?: string;
  minQuantity?: number;
  maxQuantity?: number;
  supplier?: string;
  location?: string;
  lowStock?: boolean;
  project?: string;
  status?: string;
}

export interface InventorySort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface InventoryPagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface QRCodeData {
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  location?: string;
  timestamp: string;
}
