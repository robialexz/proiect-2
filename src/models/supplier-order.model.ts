/**
 * Tipuri de stări pentru comenzi
 */
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

/**
 * Model pentru comenzi către furnizori
 */
export interface SupplierOrder {
  id: string;
  supplier_id: string;
  project_id?: string;
  order_number?: string;
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  status: OrderStatus;
  total_amount?: number;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Model pentru comenzi către furnizori cu detalii suplimentare
 */
export interface SupplierOrderWithDetails extends SupplierOrder {
  supplier_name?: string;
  project_name?: string;
  created_by_name?: string;
  items?: SupplierOrderItemWithDetails[];
}

/**
 * Model pentru elementele comenzii
 */
export interface SupplierOrderItem {
  id: string;
  order_id: string;
  material_id: string;
  quantity: number;
  unit_price?: number;
  total_price?: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Model pentru elementele comenzii cu detalii suplimentare
 */
export interface SupplierOrderItemWithDetails extends SupplierOrderItem {
  material_name?: string;
  material_unit?: string;
}

/**
 * Model pentru crearea unei comenzi
 */
export interface CreateSupplierOrderInput {
  supplier_id: string;
  project_id?: string;
  order_number?: string;
  expected_delivery_date?: string;
  notes?: string;
  items: {
    material_id: string;
    quantity: number;
    unit_price?: number;
    notes?: string;
  }[];
}

/**
 * Model pentru actualizarea unei comenzi
 */
export interface UpdateSupplierOrderInput {
  order_number?: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  status?: OrderStatus;
  notes?: string;
}

/**
 * Model pentru actualizarea unui element al comenzii
 */
export interface UpdateSupplierOrderItemInput {
  quantity?: number;
  unit_price?: number;
  notes?: string;
}

/**
 * Filtre pentru comenzi
 */
export interface SupplierOrderFilter {
  supplier_id?: string;
  project_id?: string;
  status?: OrderStatus;
  date_from?: string;
  date_to?: string;
  created_by?: string;
}

/**
 * Sortare pentru comenzi
 */
export interface SupplierOrderSort {
  field: keyof SupplierOrder;
  direction: 'asc' | 'desc';
}

/**
 * Paginare pentru comenzi
 */
export interface SupplierOrderPagination {
  page: number;
  limit: number;
  total?: number;
}
