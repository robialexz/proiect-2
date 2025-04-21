/**
 * Client pentru interacțiunea cu API-ul Tauri
 * Acest modul oferă funcții pentru a interacționa cu sistemul de operare
 * prin intermediul API-ului Tauri
 */

// Verificăm dacă suntem într-un mediu Tauri
export const isTauri = (): boolean => {
  return window.__TAURI__ !== undefined;
};

// Verificăm dacă suntem într-un mediu de dezvoltare
export const isDev = (): boolean => {
  return import.meta.env.DEV;
};

// Funcție pentru a obține informații despre sistem
export const getSystemInfo = async (): Promise<string> => {
  if (!isTauri()) {
    return "Running in browser";
  }

  try {
    // @ts-ignore - __TAURI__ este definit doar în mediul Tauri
    return await window.__TAURI__.invoke("get_system_info");
  } catch (error) {
    // Removed console statement
    return "Error getting system info";
  }
};

// Funcție pentru a verifica dacă un fișier există
export const fileExists = async (path: string): Promise<boolean> => {
  if (!isTauri()) {
    // Removed console statement
    return false;
  }

  try {
    // @ts-ignore - __TAURI__ este definit doar în mediul Tauri
    return await window.__TAURI__.invoke("file_exists", { path });
  } catch (error) {
    // Removed console statement
    return false;
  }
};

// Funcție pentru a citi un fișier
export const readFile = async (path: string): Promise<string> => {
  if (!isTauri()) {
    // Removed console statement
    return "";
  }

  try {
    // @ts-ignore - __TAURI__ este definit doar în mediul Tauri
    return await window.__TAURI__.invoke("read_file", { path });
  } catch (error) {
    // Removed console statement
    throw error;
  }
};

// Funcție pentru a scrie într-un fișier
export const writeFile = async (
  path: string,
  contents: string
): Promise<void> => {
  if (!isTauri()) {
    // Removed console statement
    return;
  }

  try {
    // @ts-ignore - __TAURI__ este definit doar în mediul Tauri
    await window.__TAURI__.invoke("write_file", { path, contents });
  } catch (error) {
    // Removed console statement
    throw error;
  }
};

// Funcție pentru a deschide un dialog de selectare a fișierelor
export const openFileDialog = async (options?: {
  multiple?: boolean;
  filters?: { name: string; extensions: string[] }[];
}): Promise<string | string[] | null> => {
  if (!isTauri()) {
    // Removed console statement
    return null;
  }

  try {
    // @ts-ignore - __TAURI__ este definit doar în mediul Tauri
    const dialog = window.__TAURI__.dialog;

    if (options?.multiple) {
      return await dialog.open({
        multiple: true,
        filters: options.filters,
      });
    } else {
      return await dialog.open({
        multiple: false,
        filters: options?.filters,
      });
    }
  } catch (error) {
    // Removed console statement
    return null;
  }
};

// Funcție pentru a deschide un dialog de salvare a fișierelor
export const saveFileDialog = async (options?: {
  defaultPath?: string;
  filters?: { name: string; extensions: string[] }[];
}): Promise<string | null> => {
  if (!isTauri()) {
    // Removed console statement
    return null;
  }

  try {
    // @ts-ignore - __TAURI__ este definit doar în mediul Tauri
    const dialog = window.__TAURI__.dialog;

    return await dialog.save({
      defaultPath: options?.defaultPath,
      filters: options?.filters,
    });
  } catch (error) {
    // Removed console statement
    return null;
  }
};

// Funcție pentru a deschide un director
export const openDirectory = async (): Promise<string | null> => {
  if (!isTauri()) {
    // Removed console statement
    return null;
  }

  try {
    // @ts-ignore - __TAURI__ este definit doar în mediul Tauri
    const dialog = window.__TAURI__.dialog;

    return await dialog.open({
      directory: true,
    });
  } catch (error) {
    // Removed console statement
    return null;
  }
};

// Funcție pentru a deschide un URL în browser-ul implicit
export const openInBrowser = async (url: string): Promise<void> => {
  if (!isTauri()) {
    window.open(url, "_blank");
    return;
  }

  try {
    // @ts-ignore - __TAURI__ este definit doar în mediul Tauri
    await window.__TAURI__.shell.open(url);
  } catch (error) {
    // Removed console statement
    // Fallback la metoda standard
    window.open(url, "_blank");
  }
};

// Exportăm toate funcțiile
export default {
  isTauri,
  isDev,
  getSystemInfo,
  fileExists,
  readFile,
  writeFile,
  openFileDialog,
  saveFileDialog,
  openDirectory,
  openInBrowser,
};
