/**
 * Model pentru activități
 * Acest fișier conține modelele pentru activități
 */

import { ID } from './index';
import { User } from './user.model';
import { Project } from './project.model';
import { Task } from './task.model';

/**
 * Tipurile de activități
 */
export enum ActivityType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  COMMENT = 'comment',
  ASSIGN = 'assign',
  COMPLETE = 'complete',
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  LOGIN = 'login',
  LOGOUT = 'logout',
  OTHER = 'other',
}

/**
 * Entitățile pentru activități
 */
export enum ActivityEntity {
  PROJECT = 'project',
  TASK = 'task',
  MATERIAL = 'material',
  SUPPLIER = 'supplier',
  TEAM = 'team',
  USER = 'user',
  DOCUMENT = 'document',
  COMMENT = 'comment',
  REPORT = 'report',
  NOTIFICATION = 'notification',
  SETTING = 'setting',
  OTHER = 'other',
}

/**
 * Interfața pentru activitate
 */
export interface Activity {
  id: ID;
  type: ActivityType;
  entity: ActivityEntity;
  entity_id: ID;
  project_id?: ID;
  project?: Project;
  task_id?: ID;
  task?: Task;
  user_id: ID;
  user?: User;
  description: string;
  data?: any;
  created_at: string;
}

/**
 * Interfața pentru crearea unei activități
 */
export interface CreateActivityInput {
  type: ActivityType;
  entity: ActivityEntity;
  entity_id: ID;
  project_id?: ID;
  task_id?: ID;
  description: string;
  data?: any;
}

/**
 * Interfața pentru filtrarea activităților
 */
export interface ActivityFilter {
  search?: string;
  type?: ActivityType | ActivityType[];
  entity?: ActivityEntity | ActivityEntity[];
  entity_id?: ID | ID[];
  project_id?: ID | ID[];
  task_id?: ID | ID[];
  user_id?: ID | ID[];
  created_at_start?: string;
  created_at_end?: string;
}

/**
 * Interfața pentru sortarea activităților
 */
export interface ActivitySort {
  field: keyof Activity;
  direction: 'asc' | 'desc';
}

/**
 * Interfața pentru paginarea activităților
 */
export interface ActivityPagination {
  page: number;
  limit: number;
}

/**
 * Interfața pentru răspunsul paginat de activități
 */
export interface ActivityPaginatedResponse {
  data: Activity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default {
  ActivityType,
  ActivityEntity,
};
