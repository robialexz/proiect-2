/**
 * Model pentru operațiuni de materiale
 */

export type OperationType = "reception" | "consumption" | "return";

export interface MaterialOperation {
  id: string;
  material_id: string;
  project_id?: string;
  operation_type: OperationType;
  quantity: number;
  unit_price?: number;
  location?: string;
  notes?: string;
  qr_code?: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Model pentru operațiuni de materiale cu informații suplimentare
 */
export interface MaterialOperationWithDetails extends MaterialOperation {
  material_name?: string;
  material_unit?: string;
  project_name?: string;
  created_by_name?: string;
}

/**
 * Input pentru crearea unei operațiuni de materiale
 */
export interface CreateMaterialOperationInput {
  material_id: string;
  project_id?: string;
  operation_type: OperationType;
  quantity: number;
  unit_price?: number;
  location?: string;
  notes?: string;
  qr_code?: string;
}

/**
 * Input pentru actualizarea unei operațiuni de materiale
 */
export interface UpdateMaterialOperationInput {
  quantity?: number;
  unit_price?: number;
  location?: string;
  notes?: string;
  qr_code?: string;
}

/**
 * Filtre pentru operațiuni de materiale
 */
export interface MaterialOperationFilter {
  material_id?: string;
  project_id?: string;
  operation_type?: OperationType;
  date_from?: string;
  date_to?: string;
  created_by?: string;
}

/**
 * Sortare pentru operațiuni de materiale
 */
export interface MaterialOperationSort {
  field: keyof MaterialOperation;
  direction: "asc" | "desc";
}

/**
 * Paginare pentru operațiuni de materiale
 */
export interface MaterialOperationPagination {
  page: number;
  limit: number;
  total?: number;
}

/**
 * Model pentru statistici de operațiuni
 */
export interface MaterialOperationStats {
  operation_type: OperationType;
  total_operations: number;
  total_quantity: number;
  total_value: number;
}
