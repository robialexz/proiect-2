/**
 * Exportă sistemul de tratare a erorilor
 */

// Exportăm tipurile de erori
export { ErrorSeverity, ErrorSource, ErrorType } from "@/models/error.model";

// Exportăm utilitarele pentru erori
export {
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
} from "./error-utils";
export type { AppError, ErrorOptions } from "./error-utils";

// Exportăm hook-ul pentru error boundary
export {
  ErrorBoundaryProvider,
  useErrorBoundary,
  ErrorBoundary,
  ErrorBoundaryContext,
} from "./use-error-boundary";

// Export implicit pentru compatibilitate
export { default as errorUtils } from "./error-utils";
