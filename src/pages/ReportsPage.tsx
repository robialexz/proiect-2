import React from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const ReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white">{t("common.loading", "Loading...")}</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {t("reports.title", "Reports")}
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">
                {t("reports.comingSoon.title", "Reports Coming Soon")}
              </h3>
              <p className="text-slate-400 max-w-md mx-auto mb-6">
                {t(
                  "reports.comingSoon.message",
                  "We're working on building a comprehensive reporting system. Check back soon!",
                )}
              </p>
              <Button onClick={() => window.history.back()}>
                {t("common.back", "Go Back")}
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default ReportsPage;
