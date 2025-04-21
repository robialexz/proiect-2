/**
 * Utilități pentru tratarea erorilor
 * Acest fișier conține funcții pentru tratarea erorilor
 */

import { ErrorSeverity, ErrorSource, ErrorType } from '@/models/error.model';

/**
 * Interfața pentru opțiunile de eroare
 */
export interface ErrorOptions {
  source?: ErrorSource;
  type?: ErrorType;
  severity?: ErrorSeverity;
  code?: string;
  context?: Record<string, any>;
  originalError?: Error;
}

/**
 * Interfața pentru eroare
 */
export interface AppError extends Error {
  source: ErrorSource;
  type: ErrorType;
  severity: ErrorSeverity;
  code?: string;
  context?: Record<string, any>;
  originalError?: Error;
  timestamp: string;
}

/**
 * Creează o eroare
 * @param message Mesajul erorii
 * @param options Opțiunile erorii
 * @returns Eroarea creată
 */
export function createError(message: string, options: ErrorOptions = {}): AppError {
  const error = new Error(message) as AppError;
  
  error.source = options.source || ErrorSource.UNKNOWN;
  error.type = options.type || ErrorType.UNKNOWN;
  error.severity = options.severity || ErrorSeverity.ERROR;
  error.code = options.code;
  error.context = options.context;
  error.originalError = options.originalError;
  error.timestamp = new Date().toISOString();
  
  return error;
}

/**
 * Formatează o eroare pentru afișare
 * @param error Eroarea de formatat
 * @returns Eroarea formatată
 */
export function formatError(error: AppError | Error): string {
  if ('source' in error) {
    return `[${error.severity}] [${error.source}] [${error.type}] ${error.message}${
      error.code ? ` (${error.code})` : ''
    }`;
  }
  
  return error.message;
}

/**
 * Verifică dacă o eroare este de un anumit tip
 * @param error Eroarea de verificat
 * @param type Tipul de eroare
 * @returns true dacă eroarea este de tipul specificat
 */
export function isErrorType(error: AppError | Error, type: ErrorType): boolean {
  return 'type' in error && error.type === type;
}

/**
 * Verifică dacă o eroare este de o anumită sursă
 * @param error Eroarea de verificat
 * @param source Sursa erorii
 * @returns true dacă eroarea este de sursa specificată
 */
export function isErrorSource(error: AppError | Error, source: ErrorSource): boolean {
  return 'source' in error && error.source === source;
}

/**
 * Verifică dacă o eroare este de o anumită severitate
 * @param error Eroarea de verificat
 * @param severity Severitatea erorii
 * @returns true dacă eroarea este de severitatea specificată
 */
export function isErrorSeverity(error: AppError | Error, severity: ErrorSeverity): boolean {
  return 'severity' in error && error.severity === severity;
}

/**
 * Verifică dacă o eroare este o eroare de validare
 * @param error Eroarea de verificat
 * @returns true dacă eroarea este o eroare de validare
 */
export function isValidationError(error: AppError | Error): boolean {
  return isErrorType(error, ErrorType.VALIDATION);
}

/**
 * Verifică dacă o eroare este o eroare de autentificare
 * @param error Eroarea de verificat
 * @returns true dacă eroarea este o eroare de autentificare
 */
export function isAuthenticationError(error: AppError | Error): boolean {
  return isErrorType(error, ErrorType.AUTHENTICATION);
}

/**
 * Verifică dacă o eroare este o eroare de autorizare
 * @param error Eroarea de verificat
 * @returns true dacă eroarea este o eroare de autorizare
 */
export function isAuthorizationError(error: AppError | Error): boolean {
  return isErrorType(error, ErrorType.AUTHORIZATION);
}

/**
 * Verifică dacă o eroare este o eroare de tip not found
 * @param error Eroarea de verificat
 * @returns true dacă eroarea este o eroare de tip not found
 */
export function isNotFoundError(error: AppError | Error): boolean {
  return isErrorType(error, ErrorType.NOT_FOUND);
}

/**
 * Verifică dacă o eroare este o eroare de timeout
 * @param error Eroarea de verificat
 * @returns true dacă eroarea este o eroare de timeout
 */
export function isTimeoutError(error: AppError | Error): boolean {
  return isErrorType(error, ErrorType.TIMEOUT);
}

/**
 * Verifică dacă o eroare este o eroare de server
 * @param error Eroarea de verificat
 * @returns true dacă eroarea este o eroare de server
 */
export function isServerError(error: AppError | Error): boolean {
  return isErrorType(error, ErrorType.SERVER_ERROR);
}

/**
 * Verifică dacă o eroare este o eroare de client
 * @param error Eroarea de verificat
 * @returns true dacă eroarea este o eroare de client
 */
export function isClientError(error: AppError | Error): boolean {
  return isErrorType(error, ErrorType.CLIENT_ERROR);
}

/**
 * Verifică dacă o eroare este o eroare de rețea
 * @param error Eroarea de verificat
 * @returns true dacă eroarea este o eroare de rețea
 */
export function isNetworkError(error: AppError | Error): boolean {
  return isErrorType(error, ErrorType.NETWORK_ERROR);
}

/**
 * Raportează o eroare
 * @param error Eroarea de raportat
 */
export function reportError(error: AppError | Error): void {
  // Aici putem adăuga logica pentru raportarea erorilor
  // Removed console statement
  
  // Putem trimite eroarea către un serviciu de monitorizare
  // sau putem salva eroarea în baza de date
}

// Exportăm toate funcțiile
export default {
  createError,
  formatError,
  isErrorType,
  isErrorSource,
  isErrorSeverity,
  isValidationError,
  isAuthenticationError,
  isAuthorizationError,
  isNotFoundError,
  isTimeoutError,
  isServerError,
  isClientError,
  isNetworkError,
  reportError,
};
