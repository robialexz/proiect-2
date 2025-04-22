import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
  textPosition?: "left" | "right" | "top" | "bottom";
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className,
  text,
  textPosition = "right",
  color = "default",
}) => {
  // Mapăm dimensiunile la clase CSS
  const sizeClasses = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  // Mapăm culorile la clase CSS
  const colorClasses = {
    default: "text-gray-500",
    primary: "text-blue-500",
    secondary: "text-purple-500",
    success: "text-green-500",
    warning: "text-yellow-500",
    danger: "text-red-500",
  };

  // Construim clasa pentru spinner
  const spinnerClass = cn(
    "animate-spin",
    sizeClasses[size],
    colorClasses[color],
    className
  );

  // Construim containerul în funcție de poziția textului
  const containerClass = cn(
    "flex items-center",
    {
      "flex-row gap-2": textPosition === "right",
      "flex-row-reverse gap-2": textPosition === "left",
      "flex-col gap-1": textPosition === "bottom",
      "flex-col-reverse gap-1": textPosition === "top",
    }
  );

  // Construim clasa pentru text
  const textClass = cn(
    "text-sm",
    colorClasses[color]
  );

  return (
    <div className={containerClass}>
      <Loader2 className={spinnerClass} />
      {text && <span className={textClass}>{text}</span>}
    </div>
  );
};
