import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { BarChart3, Package, Users, Truck } from "lucide-react";

interface DashboardOverviewProps {
  stats?: {
    projects: number;
    materials: number;
    teams: number;
    deliveries: number;
  };
  className?: string;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats = { projects: 0, materials: 0, teams: 0, deliveries: 0 },
  className,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-slate-800 border-slate-700 hover:border-primary/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
              {t("dashboard.projects", "Projects")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.projects}</div>
            <p className="text-sm text-slate-400 mt-1">
              {t("dashboard.activeProjects", "Active projects")}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="bg-slate-800 border-slate-700 hover:border-primary/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Package className="h-5 w-5 mr-2 text-green-400" />
              {t("dashboard.materials", "Materials")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.materials}</div>
            <p className="text-sm text-slate-400 mt-1">
              {t("dashboard.totalMaterials", "Total materials")}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="bg-slate-800 border-slate-700 hover:border-primary/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2 text-yellow-400" />
              {t("dashboard.teams", "Teams")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.teams}</div>
            <p className="text-sm text-slate-400 mt-1">
              {t("dashboard.activeTeams", "Active teams")}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="bg-slate-800 border-slate-700 hover:border-primary/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Truck className="h-5 w-5 mr-2 text-purple-400" />
              {t("dashboard.deliveries", "Deliveries")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.deliveries}</div>
            <p className="text-sm text-slate-400 mt-1">
              {t("dashboard.pendingDeliveries", "Pending deliveries")}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardOverview;
