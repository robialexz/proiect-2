import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  max = 5,
  onChange,
  size = "md",
  className,
}) => {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  // Determinăm dimensiunea stelelor în funcție de prop-ul size
  const getStarSize = () => {
    switch (size) {
      case "sm":
        return "h-3.5 w-3.5";
      case "lg":
        return "h-6 w-6";
      case "md":
      default:
        return "h-5 w-5";
    }
  };

  // Determinăm spațiul dintre stele în funcție de prop-ul size
  const getSpacing = () => {
    switch (size) {
      case "sm":
        return "space-x-0.5";
      case "lg":
        return "space-x-2";
      case "md":
      default:
        return "space-x-1";
    }
  };

  // Funcție pentru a determina dacă o stea este plină, goală sau parțial plină
  const getStarFill = (starPosition: number) => {
    const currentValue = hoverValue !== null ? hoverValue : value;
    
    if (currentValue >= starPosition) {
      return "text-yellow-400 fill-yellow-400";
    } else if (currentValue >= starPosition - 0.5) {
      return "text-yellow-400 fill-yellow-400 opacity-50";
    } else {
      return "text-gray-300";
    }
  };

  return (
    <div
      className={cn("flex items-center", getSpacing(), className)}
      onMouseLeave={() => setHoverValue(null)}
    >
      {Array.from({ length: max }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            getStarSize(),
            getStarFill(index + 1),
            onChange ? "cursor-pointer" : "cursor-default"
          )}
          onMouseEnter={() => onChange && setHoverValue(index + 1)}
          onClick={() => onChange && onChange(index + 1)}
        />
      ))}
    </div>
  );
};
