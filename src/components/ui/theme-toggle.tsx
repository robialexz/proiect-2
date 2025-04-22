import React from "react";
import { Button } from "./button";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle = React.memo(function ThemeToggle({
  className,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  // Memoize the tooltip content to prevent unnecessary re-renders
  const tooltipContent = React.useMemo(() => {
    if (theme === "dark") return "Activează modul luminos";
    if (theme === "light") return "Activează modul întunecat";
    return "Activează tema personalizată";
  }, [theme]);

  // Memoize the icon to prevent unnecessary re-renders
  const themeIcon = React.useMemo(() => {
    if (theme === "dark") {
      return <Moon className="h-5 w-5 text-yellow-300" />;
    }

    if (theme === "light") {
      return <Sun className="h-5 w-5 text-yellow-500" />;
    }

    // Pentru tema de sistem, afișăm iconul în funcție de preferința sistemului
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    return systemTheme === "dark" ? (
      <Moon className="h-5 w-5 text-yellow-300" />
    ) : (
      <Sun className="h-5 w-5 text-yellow-500" />
    );
  }, [theme]);

  // Memoize the onClick handler
  const handleToggleTheme = React.useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleTheme}
            className={`rounded-full ${className}`}
            aria-label="Toggle theme"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -30 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 30 }}
              transition={{ duration: 0.3 }}
              key={theme}
            >
              {themeIcon}
            </motion.div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
