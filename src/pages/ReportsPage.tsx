import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";
import { PlusCircle, Search, BarChart, Zap } from "lucide-react";
import ReportsList from "@/components/reports/ReportsList";
import ReportForm from "@/components/reports/ReportForm";
import ReportViewer from "@/components/reports/ReportViewer";

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

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReports(data || []);
    } catch (error: any) {
      console.error("Error fetching reports:", error);
      toast({
        variant: "destructive",
        title: "Error loading reports",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from("reports")
        .delete()
        .eq("id", reportId);

      if (error) throw error;

      setReports(reports.filter((report) => report.id !== reportId));
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
      <Sidebar />
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
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
          </motion.div>
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
        onSuccess={fetchReports}
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

