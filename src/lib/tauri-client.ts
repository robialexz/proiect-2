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
    return 'Running in browser';
  }
  
  try {
    // @ts-ignore - __TAURI__ este definit doar în mediul Tauri
    return await window.__TAURI__.invoke('get_system_info');
  } catch (error) {
    console.error('Error getting system info:', error);
    return 'Error getting system info';
  }
};

// Funcție pentru a verifica dacă un fișier există
export const fileExists = async (path: string): Promise<boolean> => {
  if (!isTauri()) {
    console.warn('fileExists is only available in Tauri');
    return false;
  }
  
  try {
    // @ts-ignore - __TAURI__ este definit doar în mediul Tauri
    return await window.__TAURI__.invoke('file_exists', { path });
  } catch (error) {
    console.error('Error checking if file exists:', error);
    return false;
  }
};

// Funcție pentru a citi un fișier
export const readFile = async (path: string): Promise<string> => {
  if (!isTauri()) {
    console.warn('readFile is only available in Tauri');
    return '';
  }
  
  try {
    // @ts-ignore - __TAURI__ este definit doar în mediul Tauri
    return await window.__TAURI__.invoke('read_file', { path });
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
};

// Funcție pentru a scrie într-un fișier
export const writeFile = async (path: string, contents: string): Promise<void> => {
  if (!isTauri()) {
    console.warn('writeFile is only available in Tauri');
    return;
  }
  
  try {
    // @ts-ignore - __TAURI__ este definit doar în mediul Tauri
    await window.__TAURI__.invoke('write_file', { path, contents });
  } catch (error) {
    console.error('Error writing file:', error);
    throw error;
  }
};

// Funcție pentru a deschide un dialog de selectare a fișierelor
export const openFileDialog = async (options?: { 
  multiple?: boolean; 
  filters?: { name: string; extensions: string[] }[] 
}): Promise<string | string[] | null> => {
  if (!isTauri()) {
    console.warn('openFileDialog is only available in Tauri');
    return null;
  }
  
  try {
    // @ts-ignore - __TAURI__ este definit doar în mediul Tauri
    const dialog = window.__TAURI__.dialog;
    
    if (options?.multiple) {
      return await dialog.open({
        multiple: true,
        filters: options.filters
      });
    } else {
      return await dialog.open({
        multiple: false,
        filters: options?.filters
      });
    }
  } catch (error) {
    console.error('Error opening file dialog:', error);
    return null;
  }
};

// Funcție pentru a deschide un dialog de salvare a fișierelor
export const saveFileDialog = async (options?: {
  defaultPath?: string;
  filters?: { name: string; extensions: string[] }[]
}): Promise<string | null> => {
  if (!isTauri()) {
    console.warn('saveFileDialog is only available in Tauri');
    return null;
  }
  
  try {
    // @ts-ignore - __TAURI__ este definit doar în mediul Tauri
    const dialog = window.__TAURI__.dialog;
    
    return await dialog.save({
      defaultPath: options?.defaultPath,
      filters: options?.filters
    });
  } catch (error) {
    console.error('Error opening save dialog:', error);
    return null;
  }
};

// Funcție pentru a deschide un director
export const openDirectory = async (): Promise<string | null> => {
  if (!isTauri()) {
    console.warn('openDirectory is only available in Tauri');
    return null;
  }
  
  try {
    // @ts-ignore - __TAURI__ este definit doar în mediul Tauri
    const dialog = window.__TAURI__.dialog;
    
    return await dialog.open({
      directory: true
    });
  } catch (error) {
    console.error('Error opening directory dialog:', error);
    return null;
  }
};

// Funcție pentru a deschide un URL în browser-ul implicit
export const openInBrowser = async (url: string): Promise<void> => {
  if (!isTauri()) {
    window.open(url, '_blank');
    return;
  }
  
  try {
    // @ts-ignore - __TAURI__ este definit doar în mediul Tauri
    await window.__TAURI__.shell.open(url);
  } catch (error) {
    console.error('Error opening URL in browser:', error);
    // Fallback la metoda standard
    window.open(url, '_blank');
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
  openInBrowser
};
