import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface HeaderProps {
  title: string;
  description?: string;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  description,
  className = "",
}) => {
  const { t } = useTranslation();

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-slate-400 mt-1">{description}</p>}
      </motion.div>
    </div>
  );
};

export default Header;
