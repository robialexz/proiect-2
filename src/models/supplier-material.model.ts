/**
 * Model pentru materiale furnizate
 */
export interface SupplierMaterial {
  id: string;
  supplier_id: string;
  material_id: string;
  unit_price?: number;
  min_order_quantity?: number;
  lead_time_days?: number;
  notes?: string;
  is_preferred: boolean;
  created_at: string;
  updated_at?: string;
}

/**
 * Model pentru materiale furnizate cu detalii suplimentare
 */
export interface SupplierMaterialWithDetails extends SupplierMaterial {
  supplier_name?: string;
  material_name?: string;
  material_unit?: string;
  material_category?: string;
}

/**
 * Model pentru crearea unui material furnizat
 */
export interface CreateSupplierMaterialInput {
  supplier_id: string;
  material_id: string;
  unit_price?: number;
  min_order_quantity?: number;
  lead_time_days?: number;
  notes?: string;
  is_preferred?: boolean;
}

/**
 * Model pentru actualizarea unui material furnizat
 */
export interface UpdateSupplierMaterialInput {
  unit_price?: number;
  min_order_quantity?: number;
  lead_time_days?: number;
  notes?: string;
  is_preferred?: boolean;
}

/**
 * Filtre pentru materiale furnizate
 */
export interface SupplierMaterialFilter {
  supplier_id?: string;
  material_id?: string;
  is_preferred?: boolean;
}

/**
 * Sortare pentru materiale furnizate
 */
export interface SupplierMaterialSort {
  field: keyof SupplierMaterial;
  direction: 'asc' | 'desc';
}

/**
 * Paginare pentru materiale furnizate
 */
export interface SupplierMaterialPagination {
  page: number;
  limit: number;
  total?: number;
}
