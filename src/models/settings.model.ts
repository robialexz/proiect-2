/**
 * Model pentru setări
 * Acest fișier conține modelele pentru setări
 */

import { ID } from './index';
import { User } from './user.model';

/**
 * Tipurile de setări
 */
export enum SettingType {
  SYSTEM = 'system',
  USER = 'user',
  PROJECT = 'project',
  NOTIFICATION = 'notification',
  APPEARANCE = 'appearance',
  SECURITY = 'security',
  OTHER = 'other',
}

/**
 * Interfața pentru setare
 */
export interface Setting {
  id: ID;
  key: string;
  value: any;
  type: SettingType;
  user_id?: ID;
  user?: User;
  description?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Interfața pentru crearea unei setări
 */
export interface CreateSettingInput {
  key: string;
  value: any;
  type: SettingType;
  user_id?: ID;
  description?: string;
}

/**
 * Interfața pentru actualizarea unei setări
 */
export interface UpdateSettingInput {
  value?: any;
  description?: string;
}

/**
 * Interfața pentru filtrarea setărilor
 */
export interface SettingFilter {
  search?: string;
  key?: string;
  type?: SettingType | SettingType[];
  user_id?: ID | ID[];
  created_at_start?: string;
  created_at_end?: string;
  updated_at_start?: string;
  updated_at_end?: string;
}

/**
 * Interfața pentru sortarea setărilor
 */
export interface SettingSort {
  field: keyof Setting;
  direction: 'asc' | 'desc';
}

/**
 * Interfața pentru paginarea setărilor
 */
export interface SettingPagination {
  page: number;
  limit: number;
}

/**
 * Interfața pentru răspunsul paginat de setări
 */
export interface SettingPaginatedResponse {
  data: Setting[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Interfața pentru setările utilizatorului
 */
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  currencyFormat: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    desktop: boolean;
  };
  sidebar: {
    collapsed: boolean;
    position: 'left' | 'right';
  };
  dashboard: {
    layout: 'grid' | 'list';
    widgets: string[];
  };
}

/**
 * Interfața pentru setările sistemului
 */
export interface SystemSettings {
  maintenance: {
    enabled: boolean;
    message: string;
    allowedIPs: string[];
  };
  security: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      maxAge: number;
    };
    sessionTimeout: number;
    maxLoginAttempts: number;
    accountLockDuration: number;
    twoFactorAuth: {
      enabled: boolean;
      required: boolean;
      methods: string[];
    };
  };
  email: {
    sender: string;
    templates: {
      welcome: string;
      resetPassword: string;
      confirmEmail: string;
      notification: string;
    };
  };
  storage: {
    maxFileSize: number;
    allowedFileTypes: string[];
    maxImageSize: number;
    allowedImageTypes: string[];
  };
  api: {
    rateLimit: {
      enabled: boolean;
      limit: number;
      window: number;
    };
    cors: {
      enabled: boolean;
      origins: string[];
      methods: string[];
      headers: string[];
    };
  };
}

export default {
  SettingType,
};
