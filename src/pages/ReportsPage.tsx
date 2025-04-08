import React, { useState, useEffect, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";
import { PlusCircle, Search, BarChart, Zap, RefreshCw, Download } from "lucide-react";
import ReportsList from "@/components/reports/ReportsList";
import ReportForm from "@/components/reports/ReportForm";
import ReportViewer from "@/components/reports/ReportViewer";
import useDataLoader from "@/hooks/useDataLoader";
import { measurePerformance } from "@/lib/performance-optimizer";

type Report = Database["public"]["Tables"]["reports"]["Row"];

const ReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [autoGenerateMode, setAutoGenerateMode] = useState(false);

  // Folosim hook-ul useDataLoader pentru încărcarea optimizată a rapoartelor
  const {
    data: reportsData,
    isLoading: reportsLoading,
    error: reportsError,
    refetch: refetchReports
  } = useDataLoader<Report>(
    "reports",
    "*",
    { order: { column: "created_at", ascending: false } },
    "all_reports",
    15 * 60 * 1000 // 15 minute cache
  );

  // Actualizăm starea rapoartelor când se schimbă datele
  useEffect(() => {
    if (reportsData) {
      setReports(reportsData);
    }

    setIsLoading(reportsLoading);

    if (reportsError) {
      console.error("Error fetching reports:", reportsError);
      toast({
        variant: "destructive",
        title: "Error loading reports",
        description: reportsError.message,
      });
      // Fallback la metoda tradițională dacă useDataLoader eșuează
      fetchReportsFallback();
    }
  }, [reportsData, reportsLoading, reportsError]);

  // Metoda de fallback pentru încărcarea rapoartelor
  const fetchReportsFallback = async () => {
    const endMeasurement = measurePerformance("Fetch reports fallback");
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReports(data || []);
    } catch (error: any) {
      console.error("Error fetching reports (fallback):", error);
      toast({
        variant: "destructive",
        title: "Error loading reports",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
      endMeasurement();
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    const endMeasurement = measurePerformance("Delete report");
    try {
      const { error } = await supabase
        .from("reports")
        .delete()
        .eq("id", reportId);

      if (error) throw error;

      // Actualizăm starea locală
      setReports(reports.filter((report) => report.id !== reportId));

      // Reîncărcăm datele pentru a asigura sincronizarea
      refetchReports();

      toast({
        title: "Report deleted",
        description: "The report has been successfully deleted",
      });
    } catch (error: any) {
      console.error("Error deleting report:", error);
      toast({
        variant: "destructive",
        title: "Error deleting report",
        description: error.message,
      });
    } finally {
      endMeasurement();
    }
  };

  const handleEditReport = (report: Report) => {
    setSelectedReport(report);
    setIsCreateDialogOpen(true);
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setIsViewDialogOpen(true);
  };

  const handleExportReport = (report: Report) => {
    setSelectedReport(report);
    setIsViewDialogOpen(true);
    // Navigate directly to the export tab
    // This would be handled in the ReportViewer component
  };

  const filteredReports = reports.filter(
    (report) =>
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              Reports & Analytics
            </h1>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="search"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full bg-slate-800 border-slate-700 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => {
                  setSelectedReport(null);
                  setIsCreateDialogOpen(true);
                }}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Report
                </Button>
                <Button
                  variant="outline"
                  className="bg-slate-800 border-slate-700 hover:bg-slate-700"
                  onClick={() => {
                    setSelectedReport(null);
                    setAutoGenerateMode(true);
                    setIsCreateDialogOpen(true);
                  }}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Auto-Generate
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key="reports-list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {filteredReports.length} {filteredReports.length === 1 ? 'Report' : 'Reports'}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refetchReports}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              <Suspense fallback={
                <div className="flex items-center justify-center py-10">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              }>
                <ReportsList
                  reports={filteredReports}
                  isLoading={isLoading}
                  onEditReport={handleEditReport}
                  onDeleteReport={handleDeleteReport}
                  onViewReport={handleViewReport}
                  onExportReport={handleExportReport}
                  onAutoGenerateReport={() => {
                    setSelectedReport(null);
                    setAutoGenerateMode(true);
                    setIsCreateDialogOpen(true);
                  }}
                />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Report Form Dialog */}
      <ReportForm
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) setAutoGenerateMode(false);
        }}
        report={selectedReport || undefined}
        onSuccess={refetchReports}
        autoGenerate={autoGenerateMode}
      />

      {/* Report Viewer Dialog */}
      {selectedReport && (
        <ReportViewer
          report={selectedReport}
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
        />
      )}
    </div>
  );
};

export default ReportsPage;


