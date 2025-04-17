import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, Package, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  suplimentar?: number;
  project_name: string;
  project_id: string;
  status?: "low" | "normal" | "high";
}

interface InventoryPreviewProps {
  materials?: Material[];
  className?: string;
}

const InventoryPreview: React.FC<InventoryPreviewProps> = ({
  materials = [],
  className,
}) => {
  const { t } = useTranslation();

  const getStatusBadge = (status: "low" | "normal" | "high" | undefined) => {
    switch (status) {
      case "low":
        return (
          <Badge className="bg-red-500/20 text-red-500 border-red-500/20">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {t("dashboard.lowStock", "Low Stock")}
          </Badge>
        );
      case "high":
        return (
          <Badge className="bg-green-500/20 text-green-500 border-green-500/20">
            {t("dashboard.highStock", "High Stock")}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/20">
            {t("dashboard.normalStock", "Normal")}
          </Badge>
        );
    }
  };

  return (
    <Card className={`bg-slate-800 border-slate-700 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Package className="h-5 w-5 mr-2 text-primary" />
            {t("dashboard.inventoryPreview", "Inventory Preview")}
          </div>
          <Link to="/inventory-management">
            <Button variant="ghost" size="sm" className="text-primary">
              {t("dashboard.viewAll", "View All")}
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {materials.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>{t("dashboard.noMaterials", "No materials to display")}</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/inventory-management">
                {t("dashboard.addMaterials", "Add Materials")}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {materials.map((material, index) => (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex justify-between items-center p-3 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors"
              >
                <div>
                  <h4 className="font-medium">{material.name}</h4>
                  <p className="text-sm text-slate-400">
                    {material.project_name}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm">
                        <span className="font-medium">
                          {material.quantity} {material.unit}
                        </span>
                      </p>
                      {getStatusBadge(material.status)}
                    </div>
                    {material.suplimentar && material.suplimentar > 0 && (
                      <p className="text-xs text-yellow-400 mt-1">
                        +{material.suplimentar}{" "}
                        {t("dashboard.requested", "requested")}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    asChild
                  >
                    <Link
                      to={`/inventory-management?project=${material.project_id}`}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}

            <div className="text-center pt-4">
              <Button variant="outline" asChild>
                <Link to="/inventory-management">
                  {t("dashboard.manageInventory", "Manage Inventory")}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryPreview;
