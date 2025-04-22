/**
 * Exportă sistemul de teme
 */

// Exportăm provider-ul de teme
export { ThemeProvider, useTheme } from './theme-provider';
export type { Theme } from './theme-provider';

// Export implicit pentru compatibilitate
export { useTheme as default } from './theme-provider';
