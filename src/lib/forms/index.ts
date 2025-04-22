/**
 * Exportă sistemul de formulare
 */

// Exportăm utilitarele pentru formulare
export {
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
} from './form-utils';
export type { ValidationError, ValidationResult } from './form-utils';
export { default as formUtils } from './form-utils';

// Exportăm hook-ul pentru formulare
export { useForm } from './use-form';
export type { UseFormOptions, UseFormResult } from './use-form';
export { default as useForm } from './use-form';

// Export implicit pentru compatibilitate
export default {
  useForm,
  formUtils,
};
