/**
 * Model pentru documente
 * Acest fișier conține modelele pentru documente
 */

import { ID } from './index';
import { User } from './user.model';
import { Project } from './project.model';

/**
 * Tipurile de documente
 */
export enum DocumentType {
  IMAGE = 'image',
  PDF = 'pdf',
  WORD = 'word',
  EXCEL = 'excel',
  POWERPOINT = 'powerpoint',
  TEXT = 'text',
  CSV = 'csv',
  OTHER = 'other',
}

/**
 * Categoriile de documente
 */
export enum DocumentCategory {
  CONTRACT = 'contract',
  INVOICE = 'invoice',
  RECEIPT = 'receipt',
  REPORT = 'report',
  PLAN = 'plan',
  SPECIFICATION = 'specification',
  MANUAL = 'manual',
  CERTIFICATE = 'certificate',
  LICENSE = 'license',
  OTHER = 'other',
}

/**
 * Interfața pentru document
 */
export interface Document {
  id: ID;
  name: string;
  description?: string;
  type: DocumentType;
  category: DocumentCategory;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  project_id?: ID;
  project?: Project;
  uploaded_by_id: ID;
  uploaded_by?: User;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Interfața pentru crearea unui document
 */
export interface CreateDocumentInput {
  name: string;
  description?: string;
  type: DocumentType;
  category: DocumentCategory;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  project_id?: ID;
  tags?: string[];
}

/**
 * Interfața pentru actualizarea unui document
 */
export interface UpdateDocumentInput {
  name?: string;
  description?: string;
  type?: DocumentType;
  category?: DocumentCategory;
  project_id?: ID;
  tags?: string[];
}

/**
 * Interfața pentru filtrarea documentelor
 */
export interface DocumentFilter {
  search?: string;
  type?: DocumentType | DocumentType[];
  category?: DocumentCategory | DocumentCategory[];
  project_id?: ID | ID[];
  uploaded_by_id?: ID | ID[];
  tags?: string[];
  created_at_start?: string;
  created_at_end?: string;
  updated_at_start?: string;
  updated_at_end?: string;
}

/**
 * Interfața pentru sortarea documentelor
 */
export interface DocumentSort {
  field: keyof Document;
  direction: 'asc' | 'desc';
}

/**
 * Interfața pentru paginarea documentelor
 */
export interface DocumentPagination {
  page: number;
  limit: number;
}

/**
 * Interfața pentru răspunsul paginat de documente
 */
export interface DocumentPaginatedResponse {
  data: Document[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default {
  DocumentType,
  DocumentCategory,
};
