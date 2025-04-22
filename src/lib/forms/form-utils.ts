/**
 * Utilități pentru formulare
 * Acest fișier conține funcții pentru lucrul cu formulare
 */

import { z } from 'zod';

/**
 * Interfața pentru eroare de validare
 */
export interface ValidationError {
  path: string;
  message: string;
}

/**
 * Interfața pentru rezultatul validării
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

/**
 * Validează datele folosind o schemă Zod
 * @param schema Schema Zod
 * @param data Datele de validat
 * @returns Rezultatul validării
 */
export function validateWithZod<T>(schema: z.ZodType<T>, data: unknown): ValidationResult<T> {
  try {
    const result = schema.parse(data);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      
      return {
        success: false,
        errors,
      };
    }
    
    return {
      success: false,
      errors: [
        {
          path: '',
          message: 'A apărut o eroare la validarea datelor',
        },
      ],
    };
  }
}

/**
 * Obține erorile de validare pentru un câmp
 * @param errors Erorile de validare
 * @param path Calea câmpului
 * @returns Erorile pentru câmp
 */
export function getFieldErrors(errors: ValidationError[] | undefined, path: string): string[] {
  if (!errors) return [];
  
  return errors
    .filter((error) => error.path === path)
    .map((error) => error.message);
}

/**
 * Verifică dacă un câmp are erori
 * @param errors Erorile de validare
 * @param path Calea câmpului
 * @returns true dacă câmpul are erori
 */
export function hasFieldErrors(errors: ValidationError[] | undefined, path: string): boolean {
  return getFieldErrors(errors, path).length > 0;
}

/**
 * Obține prima eroare pentru un câmp
 * @param errors Erorile de validare
 * @param path Calea câmpului
 * @returns Prima eroare pentru câmp
 */
export function getFirstFieldError(errors: ValidationError[] | undefined, path: string): string {
  const fieldErrors = getFieldErrors(errors, path);
  return fieldErrors.length > 0 ? fieldErrors[0] : '';
}

/**
 * Formatează erorile de validare pentru afișare
 * @param errors Erorile de validare
 * @returns Erorile formatate
 */
export function formatValidationErrors(errors: ValidationError[] | undefined): string {
  if (!errors || errors.length === 0) return '';
  
  return errors.map((error) => `${error.path ? `${error.path}: ` : ''}${error.message}`).join('\n');
}

/**
 * Transformă erorile de validare într-un obiect
 * @param errors Erorile de validare
 * @returns Obiectul cu erori
 */
export function errorsToObject(errors: ValidationError[] | undefined): Record<string, string[]> {
  if (!errors) return {};
  
  const result: Record<string, string[]> = {};
  
  for (const error of errors) {
    const path = error.path || '_global';
    
    if (!result[path]) {
      result[path] = [];
    }
    
    result[path].push(error.message);
  }
  
  return result;
}

/**
 * Transformă un obiect de erori în erori de validare
 * @param errors Obiectul cu erori
 * @returns Erorile de validare
 */
export function objectToErrors(errors: Record<string, string[]>): ValidationError[] {
  const result: ValidationError[] = [];
  
  for (const [path, messages] of Object.entries(errors)) {
    for (const message of messages) {
      result.push({
        path: path === '_global' ? '' : path,
        message,
      });
    }
  }
  
  return result;
}

/**
 * Obține valorile implicite pentru un formular
 * @param schema Schema Zod
 * @returns Valorile implicite
 */
export function getDefaultValues<T extends z.ZodType<any, any>>(schema: T): z.infer<T> {
  const shape = schema._def.shape?.();
  
  if (!shape) {
    return {} as z.infer<T>;
  }
  
  const defaultValues: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(shape)) {
    if (value instanceof z.ZodDefault) {
      defaultValues[key] = value._def.defaultValue();
    } else if (value instanceof z.ZodOptional) {
      defaultValues[key] = undefined;
    } else if (value instanceof z.ZodArray) {
      defaultValues[key] = [];
    } else if (value instanceof z.ZodObject) {
      defaultValues[key] = getDefaultValues(value);
    } else if (value instanceof z.ZodString) {
      defaultValues[key] = '';
    } else if (value instanceof z.ZodNumber) {
      defaultValues[key] = 0;
    } else if (value instanceof z.ZodBoolean) {
      defaultValues[key] = false;
    } else if (value instanceof z.ZodDate) {
      defaultValues[key] = new Date();
    } else if (value instanceof z.ZodEnum) {
      defaultValues[key] = value._def.values[0];
    } else if (value instanceof z.ZodNullable) {
      defaultValues[key] = null;
    } else {
      defaultValues[key] = undefined;
    }
  }
  
  return defaultValues as z.infer<T>;
}

/**
 * Transformă un obiect în FormData
 * @param data Obiectul de transformat
 * @returns FormData
 */
export function objectToFormData(data: Record<string, any>): FormData {
  const formData = new FormData();
  
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) {
      continue;
    }
    
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item instanceof File) {
          formData.append(key, item);
        } else if (typeof item === 'object') {
          formData.append(key, JSON.stringify(item));
        } else {
          formData.append(key, String(item));
        }
      }
    } else if (value instanceof File) {
      formData.append(key, value);
    } else if (value instanceof Date) {
      formData.append(key, value.toISOString());
    } else if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  }
  
  return formData;
}

/**
 * Transformă FormData într-un obiect
 * @param formData FormData de transformat
 * @returns Obiectul
 */
export function formDataToObject(formData: FormData): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') {
      try {
        // Încercăm să parsăm valoarea ca JSON
        result[key] = JSON.parse(value);
      } catch {
        // Dacă nu putem, o folosim ca string
        result[key] = value;
      }
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Transformă un obiect în URLSearchParams
 * @param data Obiectul de transformat
 * @returns URLSearchParams
 */
export function objectToSearchParams(data: Record<string, any>): URLSearchParams {
  const params = new URLSearchParams();
  
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) {
      continue;
    }
    
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'object') {
          params.append(key, JSON.stringify(item));
        } else {
          params.append(key, String(item));
        }
      }
    } else if (value instanceof Date) {
      params.append(key, value.toISOString());
    } else if (typeof value === 'object') {
      params.append(key, JSON.stringify(value));
    } else {
      params.append(key, String(value));
    }
  }
  
  return params;
}

/**
 * Transformă URLSearchParams într-un obiect
 * @param params URLSearchParams de transformat
 * @returns Obiectul
 */
export function searchParamsToObject(params: URLSearchParams): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of params.entries()) {
    try {
      // Încercăm să parsăm valoarea ca JSON
      result[key] = JSON.parse(value);
    } catch {
      // Dacă nu putem, o folosim ca string
      result[key] = value;
    }
  }
  
  return result;
}

// Exportăm toate funcțiile
export default {
  validateWithZod,
  getFieldErrors,
  hasFieldErrors,
  getFirstFieldError,
  formatValidationErrors,
  errorsToObject,
  objectToErrors,
  getDefaultValues,
  objectToFormData,
  formDataToObject,
  objectToSearchParams,
  searchParamsToObject,
};
