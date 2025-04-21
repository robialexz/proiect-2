/**
 * Utilitar pentru gestionarea erorilor
 * Acest fișier conține funcții pentru gestionarea erorilor în aplicație
 */

import { toast } from '@/components/ui/use-toast';

/**
 * Tipuri de erori cunoscute
 */
export enum ErrorType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  NETWORK = 'network',
  UNKNOWN = 'unknown'
}

/**
 * Interfață pentru erori
 */
export interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  originalError?: any;
}

/**
 * Creează o eroare de aplicație
 * @param type Tipul erorii
 * @param message Mesajul erorii
 * @param details Detalii suplimentare
 * @param originalError Eroarea originală
 * @returns Eroarea de aplicație
 */
export function createError(
  type: ErrorType,
  message: string,
  details?: string,
  originalError?: any
): AppError {
  return {
    type,
    message,
    details,
    originalError
  };
}

/**
 * Gestionează o eroare și o afișează utilizatorului
 * @param error Eroarea de gestionat
 * @param showToast Dacă să afișeze un toast
 * @returns Eroarea de aplicație
 */
export function handleError(error: any, showToast = true): AppError {
  // Removed console statement
  
  let appError: AppError;
  
  // Verificăm dacă eroarea este deja o eroare de aplicație
  if (error && error.type && Object.values(ErrorType).includes(error.type)) {
    appError = error as AppError;
  } else {
    // Convertim eroarea într-o eroare de aplicație
    const message = error?.message || 'An unknown error occurred';
    const details = error?.details || error?.hint || '';
    
    // Determinăm tipul erorii
    let type = ErrorType.UNKNOWN;
    
    if (error?.code) {
      if (error.code === 'PGRST301' || error.code === 'PGRST302') {
        type = ErrorType.AUTHORIZATION;
      } else if (error.code === 'PGRST404') {
        type = ErrorType.NOT_FOUND;
      } else if (error.code === 'PGRST400') {
        type = ErrorType.VALIDATION;
      } else if (error.code === 'PGRST500') {
        type = ErrorType.SERVER;
      } else if (error.code === 'NETWORK_ERROR') {
        type = ErrorType.NETWORK;
      } else if (error.code === 'AUTH_ERROR') {
        type = ErrorType.AUTHENTICATION;
      }
    }
    
    appError = createError(type, message, details, error);
  }
  
  // Afișăm un toast dacă este necesar
  if (showToast) {
    // Personalizăm mesajul în funcție de tipul erorii
    let toastTitle = 'Error';
    let toastVariant: 'default' | 'destructive' = 'destructive';
    
    switch (appError.type) {
      case ErrorType.AUTHENTICATION:
        toastTitle = 'Authentication Error';
        break;
      case ErrorType.AUTHORIZATION:
        toastTitle = 'Authorization Error';
        break;
      case ErrorType.VALIDATION:
        toastTitle = 'Validation Error';
        break;
      case ErrorType.NOT_FOUND:
        toastTitle = 'Not Found';
        break;
      case ErrorType.SERVER:
        toastTitle = 'Server Error';
        break;
      case ErrorType.NETWORK:
        toastTitle = 'Network Error';
        break;
      default:
        toastTitle = 'Error';
    }
    
    // Afișăm un mesaj de eroare utilizatorului
    // Ascundem detaliile tehnice în producție
    const description = process.env.NODE_ENV === 'production'
      ? appError.message
      : `${appError.message}${appError.details ? ` (${appError.details})` : ''}`;
    
    toast({
      variant: toastVariant,
      title: toastTitle,
      description
    });
  }
  
  return appError;
}

/**
 * Gestionează o eroare de autentificare
 * @param error Eroarea de gestionat
 * @param showToast Dacă să afișeze un toast
 * @returns Eroarea de aplicație
 */
export function handleAuthError(error: any, showToast = true): AppError {
  const message = error?.message || 'Authentication failed';
  return handleError(createError(ErrorType.AUTHENTICATION, message, undefined, error), showToast);
}

/**
 * Gestionează o eroare de rețea
 * @param error Eroarea de gestionat
 * @param showToast Dacă să afișeze un toast
 * @returns Eroarea de aplicație
 */
export function handleNetworkError(error: any, showToast = true): AppError {
  const message = 'Network connection error. Please check your internet connection.';
  return handleError(createError(ErrorType.NETWORK, message, undefined, error), showToast);
}

/**
 * Gestionează o eroare de validare
 * @param error Eroarea de gestionat
 * @param showToast Dacă să afișeze un toast
 * @returns Eroarea de aplicație
 */
export function handleValidationError(error: any, showToast = true): AppError {
  const message = error?.message || 'Validation failed';
  return handleError(createError(ErrorType.VALIDATION, message, undefined, error), showToast);
}

// Exportăm toate funcțiile într-un singur obiect
export const errorHandler = {
  createError,
  handleError,
  handleAuthError,
  handleNetworkError,
  handleValidationError,
  ErrorType
};
