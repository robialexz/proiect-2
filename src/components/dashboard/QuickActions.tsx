import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
  Plus,
  FileUp,
  BarChart3,
  Users,
  Package,
  Truck,
  Calendar,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickActionProps {
  className?: string;
}

const QuickActions = ({ className = "" }: QuickActionProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const actions = [
    {
      name: t("Add Material"),
      icon: <Plus className="h-5 w-5" />,
      color: "bg-primary/10 text-primary",
      onClick: () => navigate("/add-material"),
    },
    {
      name: t("Upload Excel"),
      icon: <FileUp className="h-5 w-5" />,
      color: "bg-secondary/10 text-secondary",
      onClick: () => navigate("/upload-excel"),
    },
    {
      name: t("View Reports"),
      icon: <BarChart3 className="h-5 w-5" />,
      color: "bg-accent/10 text-accent",
      onClick: () => navigate("/reports"),
    },
    {
      name: t("Team Management"),
      icon: <Users className="h-5 w-5" />,
      color: "bg-success/10 text-success",
      onClick: () => navigate("/teams"),
    },
    {
      name: t("Inventory"),
      icon: <Package className="h-5 w-5" />,
      color: "bg-info/10 text-info",
      onClick: () => navigate("/inventory-management"),
    },
    {
      name: t("Suppliers"),
      icon: <Truck className="h-5 w-5" />,
      color: "bg-warning/10 text-warning",
      onClick: () => navigate("/suppliers"),
    },
    {
      name: t("Schedule"),
      icon: <Calendar className="h-5 w-5" />,
      color: "bg-primary/10 text-primary",
      onClick: () => navigate("/schedule"),
    },
    {
      name: t("Documents"),
      icon: <FileText className="h-5 w-5" />,
      color: "bg-secondary/10 text-secondary",
      onClick: () => navigate("/documents"),
    },
  ];

  return (
    <div className={`${className}`}>
      <h2 className="text-xl font-semibold mb-4">{t("Quick Actions")}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Button
              variant="outline"
              className={`w-full h-24 flex flex-col items-center justify-center gap-2 border border-slate-700 ${action.color} hover:bg-slate-800/50`}
              onClick={action.onClick}
            >
              <div className="text-2xl">{action.icon}</div>
              <span className="text-sm font-medium">{action.name}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
