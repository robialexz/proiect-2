export interface Tender {
  id: string;
  title: string;
  description?: string;
  reference_number: string;
  publication_date: string;
  closing_date: string;
  estimated_value?: number;
  currency?: string;
  contracting_authority: string;
  authority_type?: string;
  cpv_code?: string;
  cpv_description?: string;
  location?: string;
  status: TenderStatus;
  url?: string;
  source: string;
  created_at: string;
  updated_at: string;
  is_favorite?: boolean;
  is_relevant?: boolean;
  notes?: string;
  documents?: TenderDocument[];
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
}

export type TenderStatus = 
  | 'active' 
  | 'closed' 
  | 'awarded' 
  | 'cancelled' 
  | 'draft';

export interface TenderDocument {
  id: string;
  tender_id: string;
  name: string;
  description?: string;
  url: string;
  type: string;
  size?: number;
  upload_date: string;
}

export interface TenderFilters {
  search?: string;
  status?: TenderStatus;
  cpvCode?: string;
  authority?: string;
  minValue?: number;
  maxValue?: number;
  fromDate?: string;
  toDate?: string;
  location?: string;
  onlyFavorites?: boolean;
  onlyRelevant?: boolean;
}

export interface TenderSort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface TenderPagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface TenderAlert {
  id: string;
  user_id: string;
  name: string;
  keywords: string[];
  cpv_codes?: string[];
  min_value?: number;
  max_value?: number;
  authorities?: string[];
  locations?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TenderSubscription {
  id: string;
  user_id: string;
  tender_id: string;
  created_at: string;
}

export interface TenderNote {
  id: string;
  user_id: string;
  tender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}
