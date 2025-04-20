/**
 * Exportă sistemul de validare
 */

// Exportăm schemele de validare
export {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  userProfileSchema,
  projectSchema,
  materialSchema,
  supplierSchema,
  teamSchema,
  taskSchema,
  reportSchema,
} from './schemas';

// Exportăm hook-urile pentru validare
export { useZodForm, useZodFormWithDefaults } from './use-zod-form';

// Export implicit pentru compatibilitate
export { default as schemas } from './schemas';
