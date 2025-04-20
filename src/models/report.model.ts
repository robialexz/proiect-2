/**
 * Model pentru rapoarte
 * Acest fișier conține modelele pentru rapoarte
 */

import { ID } from './index';
import { User } from './user.model';
import { Project } from './project.model';

/**
 * Tipurile de rapoarte
 */
export enum ReportType {
  PROJECT = 'project',
  INVENTORY = 'inventory',
  FINANCIAL = 'financial',
  CUSTOM = 'custom',
}

/**
 * Formatele de rapoarte
 */
export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
}

/**
 * Perioadele de rapoarte
 */
export enum ReportPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  CUSTOM = 'custom',
}

/**
 * Interfața pentru raport
 */
export interface Report {
  id: ID;
  title: string;
  description?: string;
  type: ReportType;
  format: ReportFormat;
  period: ReportPeriod;
  project_id?: ID;
  project?: Project;
  created_by_id: ID;
  created_by?: User;
  start_date?: string;
  end_date?: string;
  data?: any;
  file_url?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Interfața pentru crearea unui raport
 */
export interface CreateReportInput {
  title: string;
  description?: string;
  type: ReportType;
  format: ReportFormat;
  period: ReportPeriod;
  project_id?: ID;
  start_date?: string;
  end_date?: string;
  data?: any;
  tags?: string[];
}

/**
 * Interfața pentru actualizarea unui raport
 */
export interface UpdateReportInput {
  title?: string;
  description?: string;
  type?: ReportType;
  format?: ReportFormat;
  period?: ReportPeriod;
  project_id?: ID;
  start_date?: string;
  end_date?: string;
  data?: any;
  file_url?: string;
  tags?: string[];
}

/**
 * Interfața pentru filtrarea rapoartelor
 */
export interface ReportFilter {
  search?: string;
  type?: ReportType | ReportType[];
  format?: ReportFormat | ReportFormat[];
  period?: ReportPeriod | ReportPeriod[];
  project_id?: ID | ID[];
  created_by_id?: ID | ID[];
  start_date_start?: string;
  start_date_end?: string;
  end_date_start?: string;
  end_date_end?: string;
  tags?: string[];
  created_at_start?: string;
  created_at_end?: string;
  updated_at_start?: string;
  updated_at_end?: string;
}

/**
 * Interfața pentru sortarea rapoartelor
 */
export interface ReportSort {
  field: keyof Report;
  direction: 'asc' | 'desc';
}

/**
 * Interfața pentru paginarea rapoartelor
 */
export interface ReportPagination {
  page: number;
  limit: number;
}

/**
 * Interfața pentru răspunsul paginat de rapoarte
 */
export interface ReportPaginatedResponse {
  data: Report[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default {
  ReportType,
  ReportFormat,
  ReportPeriod,
};
