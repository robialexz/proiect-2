/**
 * Provider pentru sistemul de teme
 * Acest fișier conține provider-ul pentru sistemul de teme
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppStore } from '@/store';

// Tipul pentru tema
export type Theme = 'light' | 'dark' | 'system';

// Interfața pentru contextul de teme
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  isDark: boolean;
  isLight: boolean;
}

// Creăm contextul de teme
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Provider pentru sistemul de teme
 * @param props Proprietățile pentru provider
 * @returns Provider-ul pentru sistemul de teme
 */
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'app-theme',
  ...props
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}) {
  // Obținem tema din store
  const { theme: storeTheme, setTheme: setStoreTheme } = useAppStore();
  
  // Starea pentru tema
  const [theme, setThemeState] = useState<Theme>(storeTheme || defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  
  // Efect pentru a sincroniza tema cu localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey) as Theme | null;
    
    if (storedTheme) {
      setThemeState(storedTheme);
      setStoreTheme(storedTheme);
    }
  }, [storageKey, setStoreTheme]);
  
  // Efect pentru a aplica tema
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Ștergem clasele existente
    root.classList.remove('light', 'dark');
    
    // Determinăm tema
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      
      root.classList.add(systemTheme);
      setResolvedTheme(systemTheme);
    } else {
      root.classList.add(theme);
      setResolvedTheme(theme);
    }
  }, [theme]);
  
  // Efect pentru a asculta schimbările de temă sistem
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        const systemTheme = mediaQuery.matches ? 'dark' : 'light';
        
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(systemTheme);
        
        setResolvedTheme(systemTheme);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);
  
  // Funcție pentru a seta tema
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setStoreTheme(newTheme);
    localStorage.setItem(storageKey, newTheme);
  };
  
  // Valoarea contextului
  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
  };
  
  return (
    <ThemeContext.Provider value={contextValue} {...props}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook pentru a utiliza sistemul de teme
 * @returns Contextul de teme
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme trebuie utilizat în interiorul unui ThemeProvider');
  }
  
  return context;
}

export default {
  ThemeProvider,
  useTheme,
};
