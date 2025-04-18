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
  notes?: string;
  rating?: number;
  created_at: string;
  updated_at?: string;
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
  status: 'active' | 'inactive' | 'archived';
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
