import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// Tipuri pentru temă
export type ThemeMode = "light" | "dark" | "system";
export type ThemeColor =
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "red"
  | "indigo";
export type ThemeRadius = "none" | "sm" | "md" | "lg" | "full";
export type ThemeAnimation = "none" | "subtle" | "medium" | "high";

export interface ThemeSettings {
  mode: ThemeMode;
  color: ThemeColor;
  radius: ThemeRadius;
  animation: ThemeAnimation;
  fontSize: number; // 100 = 100% (normal), 90 = 90% (smaller), 110 = 110% (larger)
  reducedMotion: boolean;
  highContrast: boolean;
}

interface ThemeContextType {
  theme: ThemeSettings;
  setTheme: (theme: Partial<ThemeSettings>) => void;
  resetTheme: () => void;
  systemTheme: "light" | "dark";
  effectiveTheme: "light" | "dark";
}

// Tema implicită
const defaultTheme: ThemeSettings = {
  mode: "system",
  color: "indigo",
  radius: "md",
  animation: "medium",
  fontSize: 100,
  reducedMotion: false,
  highContrast: false,
};

// Context pentru temă
const EnhancedThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

// Provider pentru temă
export const EnhancedThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Încărcăm tema din localStorage sau folosim tema implicită
  const [theme, setThemeState] = useState<ThemeSettings>(() => {
    try {
      const storedTheme = localStorage.getItem("enhanced_theme");

      if (!storedTheme) {
        return defaultTheme;
      }

      // Verificăm dacă este un string simplu ('dark' sau 'light')
      if (storedTheme === "dark" || storedTheme === "light") {
        // Convertim string-ul simplu în obiect ThemeSettings
        return {
          ...defaultTheme,
          mode: storedTheme as "dark" | "light",
        };
      }

      // Încercăm să parsăm ca JSON
      return JSON.parse(storedTheme);
    } catch (error) {
      // Removed console statement

      // În caz de eroare, ștergem valoarea invalidă din localStorage
      localStorage.removeItem("enhanced_theme");

      return defaultTheme;
    }
  });

  // Starea pentru tema sistemului
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(() => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Calculăm tema efectivă (light sau dark)
  const effectiveTheme = theme.mode === "system" ? systemTheme : theme.mode;

  // Funcție pentru a actualiza tema
  const setTheme = useCallback((newTheme: Partial<ThemeSettings>) => {
    setThemeState((prevTheme) => {
      const updatedTheme = { ...prevTheme, ...newTheme };

      // Salvăm tema în localStorage
      try {
        localStorage.setItem("enhanced_theme", JSON.stringify(updatedTheme));
      } catch (error) {
        // Removed console statement
      }

      return updatedTheme;
    });
  }, []);

  // Funcție pentru a reseta tema la valorile implicite
  const resetTheme = useCallback(() => {
    setThemeState(defaultTheme);

    // Salvăm tema în localStorage
    try {
      localStorage.setItem("enhanced_theme", JSON.stringify(defaultTheme));
    } catch (error) {
      // Removed console statement
    }
  }, []);

  // Actualizăm clasa documentului când se schimbă tema
  useEffect(() => {
    // Actualizăm clasa pentru modul light/dark
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(effectiveTheme);

    // Actualizăm clasa pentru culoare
    document.documentElement.classList.remove(
      "theme-blue",
      "theme-green",
      "theme-purple",
      "theme-orange",
      "theme-red",
      "theme-indigo"
    );
    document.documentElement.classList.add(`theme-${theme.color}`);

    // Actualizăm clasa pentru raza de colț
    document.documentElement.classList.remove(
      "radius-none",
      "radius-sm",
      "radius-md",
      "radius-lg",
      "radius-full"
    );
    document.documentElement.classList.add(`radius-${theme.radius}`);

    // Actualizăm clasa pentru animații
    document.documentElement.classList.remove(
      "animation-none",
      "animation-subtle",
      "animation-medium",
      "animation-high"
    );
    document.documentElement.classList.add(`animation-${theme.animation}`);

    // Actualizăm clasa pentru dimensiunea fontului
    document.documentElement.style.fontSize = `${theme.fontSize}%`;

    // Actualizăm clasa pentru reducerea mișcării
    if (theme.reducedMotion) {
      document.documentElement.classList.add("reduced-motion");
    } else {
      document.documentElement.classList.remove("reduced-motion");
    }

    // Actualizăm clasa pentru contrast ridicat
    if (theme.highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }

    // Actualizăm meta tag-ul pentru culoarea temei
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        effectiveTheme === "dark" ? "#0f172a" : "#ffffff"
      );
    }
  }, [theme, effectiveTheme]);

  // Ascultăm schimbările de temă ale sistemului
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // Ascultăm schimbările de preferințe pentru reducerea mișcării
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches && !theme.reducedMotion) {
        setTheme({ reducedMotion: true });
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    // Verificăm starea inițială
    if (mediaQuery.matches && !theme.reducedMotion) {
      setTheme({ reducedMotion: true });
    }

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme.reducedMotion, setTheme]);

  return (
    <EnhancedThemeContext.Provider
      value={{
        theme,
        setTheme,
        resetTheme,
        systemTheme,
        effectiveTheme,
      }}
    >
      {children}
    </EnhancedThemeContext.Provider>
  );
};

// Hook pentru utilizarea temei
export const useEnhancedTheme = () => {
  const context = useContext(EnhancedThemeContext);

  if (!context) {
    throw new Error(
      "useEnhancedTheme must be used within a EnhancedThemeProvider"
    );
  }

  return context;
};

export default {
  EnhancedThemeProvider,
  useEnhancedTheme,
};
