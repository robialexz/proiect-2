/**
 * Model pentru sarcini
 * Acest fișier conține modelele pentru sarcini
 */

import { ID } from './index';
import { User } from './user.model';
import { Project } from './project.model';

/**
 * Statusurile sarcinilor
 */
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
  BLOCKED = 'blocked',
}

/**
 * Prioritățile sarcinilor
 */
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Tipurile de sarcini
 */
export enum TaskType {
  FEATURE = 'feature',
  BUG = 'bug',
  IMPROVEMENT = 'improvement',
  DOCUMENTATION = 'documentation',
  OTHER = 'other',
}

/**
 * Interfața pentru sarcină
 */
export interface Task {
  id: ID;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  project_id?: ID;
  project?: Project;
  assignee_id?: ID;
  assignee?: User;
  reporter_id?: ID;
  reporter?: User;
  due_date?: string;
  start_date?: string;
  end_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  tags?: string[];
  attachments?: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Interfața pentru crearea unei sarcini
 */
export interface CreateTaskInput {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  project_id?: ID;
  assignee_id?: ID;
  reporter_id?: ID;
  due_date?: string;
  start_date?: string;
  end_date?: string;
  estimated_hours?: number;
  tags?: string[];
  attachments?: string[];
}

/**
 * Interfața pentru actualizarea unei sarcini
 */
export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  project_id?: ID;
  assignee_id?: ID;
  reporter_id?: ID;
  due_date?: string;
  start_date?: string;
  end_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  tags?: string[];
  attachments?: string[];
}

/**
 * Interfața pentru filtrarea sarcinilor
 */
export interface TaskFilter {
  search?: string;
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority | TaskPriority[];
  type?: TaskType | TaskType[];
  project_id?: ID | ID[];
  assignee_id?: ID | ID[];
  reporter_id?: ID | ID[];
  due_date_start?: string;
  due_date_end?: string;
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
 * Interfața pentru sortarea sarcinilor
 */
export interface TaskSort {
  field: keyof Task;
  direction: 'asc' | 'desc';
}

/**
 * Interfața pentru paginarea sarcinilor
 */
export interface TaskPagination {
  page: number;
  limit: number;
}

/**
 * Interfața pentru răspunsul paginat de sarcini
 */
export interface TaskPaginatedResponse {
  data: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default {
  TaskStatus,
  TaskPriority,
  TaskType,
};
