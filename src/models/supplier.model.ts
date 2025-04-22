/**
 * Model pentru furnizor
 */
export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  category?: string;
  notes?: string;
  rating?: number;
  status?: "active" | "inactive" | "pending";
  created_at: string;
  updated_at?: string;
}

/**
 * Model pentru furnizor cu detalii suplimentare
 */
export interface SupplierWithDetails extends Supplier {
  last_order?: {
    id: string;
    order_number?: string;
    order_date: string;
    status: string;
    total_amount?: number;
  };
  materials_count?: number;
}

/**
 * Model pentru crearea unui furnizor
 */
export interface CreateSupplierInput {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  category?: string;
  notes?: string;
}

/**
 * Model pentru actualizarea unui furnizor
 */
export interface UpdateSupplierInput {
  name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  category?: string;
  notes?: string;
  rating?: number;
  status?: "active" | "inactive" | "pending";
}

/**
 * Model pentru anunțurile furnizorilor
 */
export interface SupplierAnnouncement {
  id: string;
  supplier_id: string;
  supplier_name: string;
  title?: string;
  notes?: string;
  status: "active" | "inactive" | "archived";
  project_id?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Model pentru fișierele anunțurilor furnizorilor
 */
export interface SupplierAnnouncementFile {
  id: string;
  announcement_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  uploaded_by: string;
}

/**
 * Model pentru evaluarea furnizorilor
 */
export interface SupplierRating {
  id: string;
  supplier_id: string;
  project_id?: string;
  rating: number;
  comments?: string;
  rated_by: string;
  rated_at: string;
}

/**
 * Model pentru contactele furnizorilor
 */
export interface SupplierContact {
  id: string;
  supplier_id: string;
  name: string;
  position?: string;
  email?: string;
  phone?: string;
  is_primary: boolean;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Model pentru categoriile furnizorilor
 */
export interface SupplierCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Model pentru asocierea furnizorilor cu categorii
 */
export interface SupplierCategoryMapping {
  id: string;
  supplier_id: string;
  category_id: string;
  created_at: string;
}
