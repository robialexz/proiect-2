/**
 * Exportă toate hook-urile
 */

// Exportăm hook-urile de utilitate
export { useLocalStorage } from "./useLocalStorage";
export { useSessionStorage } from "./useSessionStorage";
export { useDebounce } from "./useDebounce";
export {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsDarkMode,
} from "./useMediaQuery";
export { useOnClickOutside } from "./useOnClickOutside";
export { useAsync } from "./useAsync";
export type { AsyncState, AsyncStatus, AsyncOptions } from "./useAsync";

// Exportăm hook-ul pentru proiecte
export { useProjects } from "./use-projects";

// Exportăm hook-ul pentru materiale
export { useMaterials } from "./use-materials";

// Export implicit pentru compatibilitate
export default {
  useLocalStorage,
  useSessionStorage,
  useDebounce,
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsDarkMode,
  useOnClickOutside,
  useAsync,
  useProjects,
  useMaterials,
};
