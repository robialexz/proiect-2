/**
 * Exportă toate hook-urile
 */

// Importăm hook-urile
import { useLocalStorage as useLocalStorageImport } from "./useLocalStorage";
import { useSessionStorage as useSessionStorageImport } from "./useSessionStorage";
import { useDebounce as useDebounceImport } from "./useDebounce";
import {
  useMediaQuery as useMediaQueryImport,
  useIsMobile as useIsMobileImport,
  useIsTablet as useIsTabletImport,
  useIsDesktop as useIsDesktopImport,
  useIsDarkMode as useIsDarkModeImport,
} from "./useMediaQuery";
import { useOnClickOutside as useOnClickOutsideImport } from "./useOnClickOutside";
import { useAsync as useAsyncImport } from "./useAsync";
import { useProjects as useProjectsImport } from "./use-projects";
import { useMaterials as useMaterialsImport } from "./use-materials";

// Exportăm hook-urile
export const useLocalStorage = useLocalStorageImport;
export const useSessionStorage = useSessionStorageImport;
export const useDebounce = useDebounceImport;
export const useMediaQuery = useMediaQueryImport;
export const useIsMobile = useIsMobileImport;
export const useIsTablet = useIsTabletImport;
export const useIsDesktop = useIsDesktopImport;
export const useIsDarkMode = useIsDarkModeImport;
export const useOnClickOutside = useOnClickOutsideImport;
export const useAsync = useAsyncImport;
export const useProjects = useProjectsImport;
export const useMaterials = useMaterialsImport;

// Exportăm tipurile
export type { AsyncState, AsyncStatus, AsyncOptions } from "./useAsync";

// Export implicit pentru compatibilitate
const hooks = {
  useLocalStorage: useLocalStorageImport,
  useSessionStorage: useSessionStorageImport,
  useDebounce: useDebounceImport,
  useMediaQuery: useMediaQueryImport,
  useIsMobile: useIsMobileImport,
  useIsTablet: useIsTabletImport,
  useIsDesktop: useIsDesktopImport,
  useIsDarkMode: useIsDarkModeImport,
  useOnClickOutside: useOnClickOutsideImport,
  useAsync: useAsyncImport,
  useProjects: useProjectsImport,
  useMaterials: useMaterialsImport,
};

export default hooks;
