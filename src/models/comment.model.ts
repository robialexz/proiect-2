/**
 * Model pentru comentarii
 * Acest fișier conține modelele pentru comentarii
 */

import { ID } from './index';
import { User } from './user.model';
import { Project } from './project.model';
import { Task } from './task.model';

/**
 * Tipurile de comentarii
 */
export enum CommentType {
  PROJECT = 'project',
  TASK = 'task',
  DOCUMENT = 'document',
  OTHER = 'other',
}

/**
 * Interfața pentru comentariu
 */
export interface Comment {
  id: ID;
  content: string;
  type: CommentType;
  project_id?: ID;
  project?: Project;
  task_id?: ID;
  task?: Task;
  document_id?: ID;
  parent_id?: ID;
  parent?: Comment;
  author_id: ID;
  author?: User;
  attachments?: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Interfața pentru crearea unui comentariu
 */
export interface CreateCommentInput {
  content: string;
  type: CommentType;
  project_id?: ID;
  task_id?: ID;
  document_id?: ID;
  parent_id?: ID;
  attachments?: string[];
}

/**
 * Interfața pentru actualizarea unui comentariu
 */
export interface UpdateCommentInput {
  content?: string;
  attachments?: string[];
}

/**
 * Interfața pentru filtrarea comentariilor
 */
export interface CommentFilter {
  search?: string;
  type?: CommentType | CommentType[];
  project_id?: ID | ID[];
  task_id?: ID | ID[];
  document_id?: ID | ID[];
  parent_id?: ID | ID[];
  author_id?: ID | ID[];
  created_at_start?: string;
  created_at_end?: string;
  updated_at_start?: string;
  updated_at_end?: string;
}

/**
 * Interfața pentru sortarea comentariilor
 */
export interface CommentSort {
  field: keyof Comment;
  direction: 'asc' | 'desc';
}

/**
 * Interfața pentru paginarea comentariilor
 */
export interface CommentPagination {
  page: number;
  limit: number;
}

/**
 * Interfața pentru răspunsul paginat de comentarii
 */
export interface CommentPaginatedResponse {
  data: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default {
  CommentType,
};
