/**
 * Model pentru cereri de materiale
 */

export type RequestStatus = "pending" | "approved" | "rejected" | "completed";
export type RequestPriority = "low" | "medium" | "high" | "urgent";
export type ApprovalStatus = "approved" | "rejected";

export interface MaterialRequest {
  id: string;
  project_id: string;
  requester_id: string;
  status: RequestStatus;
  priority: RequestPriority;
  needed_by_date?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Model pentru elementele cererii de materiale
 */
export interface MaterialRequestItem {
  id: string;
  request_id: string;
  material_id: string;
  quantity: number;
  approved_quantity?: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Model pentru aprobări cereri
 */
export interface MaterialRequestApproval {
  id: string;
  request_id: string;
  approver_id: string;
  status: ApprovalStatus;
  notes?: string;
  created_at: string;
}

/**
 * Model pentru cereri de materiale cu informații suplimentare
 */
export interface MaterialRequestWithDetails extends MaterialRequest {
  project_name?: string;
  requester_name?: string;
  items?: MaterialRequestItemWithDetails[];
  approvals?: MaterialRequestApprovalWithDetails[];
}

/**
 * Model pentru elementele cererii de materiale cu informații suplimentare
 */
export interface MaterialRequestItemWithDetails extends MaterialRequestItem {
  material_name?: string;
  material_unit?: string;
  material_category?: string;
}

/**
 * Model pentru aprobări cereri cu informații suplimentare
 */
export interface MaterialRequestApprovalWithDetails
  extends MaterialRequestApproval {
  approver_name?: string;
}

/**
 * Input pentru crearea unei cereri de materiale
 */
export interface CreateMaterialRequestInput {
  project_id: string;
  priority?: RequestPriority;
  needed_by_date?: string;
  notes?: string;
  items: {
    material_id: string;
    quantity: number;
    notes?: string;
  }[];
}

/**
 * Input pentru actualizarea unei cereri de materiale
 */
export interface UpdateMaterialRequestInput {
  priority?: RequestPriority;
  needed_by_date?: string;
  notes?: string;
}

/**
 * Input pentru aprobarea/respingerea unei cereri de materiale
 */
export interface ApproveMaterialRequestInput {
  status: ApprovalStatus;
  notes?: string;
  items?: {
    id: string;
    approved_quantity: number;
  }[];
}

/**
 * Filtre pentru cereri de materiale
 */
export interface MaterialRequestFilter {
  project_id?: string;
  requester_id?: string;
  status?: RequestStatus;
  priority?: RequestPriority;
  date_from?: string;
  date_to?: string;
}

/**
 * Sortare pentru cereri de materiale
 */
export interface MaterialRequestSort {
  field: keyof MaterialRequest;
  direction: "asc" | "desc";
}

/**
 * Paginare pentru cereri de materiale
 */
export interface MaterialRequestPagination {
  page: number;
  limit: number;
  total?: number;
}

/**
 * Model pentru statistici de cereri
 */
export interface MaterialRequestStats {
  status: RequestStatus;
  total_requests: number;
  total_items: number;
  total_quantity: number;
}
