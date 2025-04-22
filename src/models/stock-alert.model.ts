/**
 * Model pentru alerte de stoc
 */

export type AlertType = 'low_stock' | 'out_of_stock' | 'expiring';

export interface StockAlert {
  id: string;
  material_id: string;
  project_id?: string;
  alert_type: AlertType;
  threshold?: number;
  is_active: boolean;
  last_triggered_at?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Model pentru alerte de stoc cu informații suplimentare
 */
export interface StockAlertWithDetails extends StockAlert {
  material_name?: string;
  material_unit?: string;
  material_quantity?: number;
  project_name?: string;
}

/**
 * Input pentru crearea unei alerte de stoc
 */
export interface CreateStockAlertInput {
  material_id: string;
  project_id?: string;
  alert_type: AlertType;
  threshold?: number;
  is_active?: boolean;
}

/**
 * Input pentru actualizarea unei alerte de stoc
 */
export interface UpdateStockAlertInput {
  alert_type?: AlertType;
  threshold?: number;
  is_active?: boolean;
}

/**
 * Filtre pentru alerte de stoc
 */
export interface StockAlertFilter {
  material_id?: string;
  project_id?: string;
  alert_type?: AlertType;
  is_active?: boolean;
}

/**
 * Sortare pentru alerte de stoc
 */
export interface StockAlertSort {
  field: keyof StockAlert;
  direction: 'asc' | 'desc';
}

/**
 * Paginare pentru alerte de stoc
 */
export interface StockAlertPagination {
  page: number;
  limit: number;
  total?: number;
}

/**
 * Rezultat verificare alerte de stoc
 */
export interface StockAlertCheckResult {
  triggered: boolean;
  alerts: StockAlertWithDetails[];
}
