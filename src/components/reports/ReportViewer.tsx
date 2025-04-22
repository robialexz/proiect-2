import React, { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import {
  Download,
  FileText,
  BarChart,
  PieChart,
  LineChart,
  ArrowLeft,
  Calendar,
  User,
  FileSpreadsheet,
  File, // Înlocuim FilePdf cu File
  FileImage
} from "lucide-react";
import { Database } from "@/types/supabase";

type Report = Database["public"]["Tables"]["reports"]["Row"];
type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ReportViewerProps {
  report: Report;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReportViewer: React.FC<ReportViewerProps> = ({
  report,
  open,
  onOpenChange
}) => {
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch project details if report is associated with a project
  React.useEffect(() => {
    const fetchProject = async () => {
      if (!report.project_id) {
        setProject(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", report.project_id)
          .single();

        if (error) throw error;
        setProject(data);
      } catch (error) {
        // Removed console statement
      }
    };

    if (open && report) {
      fetchProject();
    }
  }, [open, report]);

  const handleExport = async (format: string) => {
    setLoading(true);

    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Report exported",
        description: `The report has been exported as ${format.toUpperCase()}`,
      });

      // In a real implementation, you would:
      // 1. Call an API to generate the export
      // 2. Get a download URL
      // 3. Trigger the download
    } catch (error) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Could not export the report. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getReportTypeIcon = () => {
    switch (report.type.toLowerCase()) {
      case 'financial':
        return <BarChart className="h-6 w-6 text-emerald-500" />;
      case 'inventory':
        return <PieChart className="h-6 w-6 text-blue-500" />;
      case 'project':
        return <LineChart className="h-6 w-6 text-purple-500" />;
      default:
        return <FileText className="h-6 w-6 text-slate-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-green-500/20 text-green-500';
      case 'draft':
        return 'bg-amber-500/20 text-amber-500';
      case 'archived':
        return 'bg-slate-500/20 text-slate-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  // Parse report data (or use default if not available)
  const reportData = report.data || {};
  const reportSections = Array.isArray(reportData.sections) ? reportData.sections : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getReportTypeIcon()}
            <div>
              <DialogTitle className="text-xl">{report.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`${getStatusColor(report.status)} px-2 py-1 text-xs font-medium`}>
                  {report.status}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {report.type}
                </Badge>
              </div>
            </div>
          </div>
          <DialogDescription className="text-slate-400 mt-2">
            {report.description || "No description provided"}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 bg-slate-700">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-slate-400">Created</h3>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span>{new Date(report.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-slate-400">Last Updated</h3>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span>{new Date(report.updated_at).toLocaleString()}</span>
                </div>
              </div>

              {project && (
                <div className="col-span-2 space-y-2">
                  <h3 className="text-sm font-medium text-slate-400">Project</h3>
                  <div className="p-3 bg-slate-700 rounded-md">
                    <div className="font-medium">{project.name}</div>
                    <div className="text-sm text-slate-400">{project.description}</div>
                  </div>
                </div>
              )}

              {reportSections.length > 0 && (
                <div className="col-span-2 space-y-2">
                  <h3 className="text-sm font-medium text-slate-400">Report Sections</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {reportSections.map((section, index) => (
                      <div key={index} className="p-3 bg-slate-700 rounded-md">
                        <div className="font-medium capitalize">{section.replace(/_/g, ' ')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="data" className="mt-4">
            <div className="p-6 bg-slate-700 rounded-md text-center">
              <FileText className="h-12 w-12 mx-auto text-slate-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Report Data Visualization</h3>
              <p className="text-slate-400 mb-4">
                This is a placeholder for the actual report data visualization.
                In a real implementation, this would show charts, tables, and other visualizations.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-slate-800 rounded-md">
                  <div className="h-20 bg-slate-700 rounded-md mb-2 flex items-center justify-center">
                    <BarChart className="h-10 w-10 text-slate-600" />
                  </div>
                  <div className="text-sm font-medium">Chart 1</div>
                </div>
                <div className="p-4 bg-slate-800 rounded-md">
                  <div className="h-20 bg-slate-700 rounded-md mb-2 flex items-center justify-center">
                    <PieChart className="h-10 w-10 text-slate-600" />
                  </div>
                  <div className="text-sm font-medium">Chart 2</div>
                </div>
                <div className="p-4 bg-slate-800 rounded-md">
                  <div className="h-20 bg-slate-700 rounded-md mb-2 flex items-center justify-center">
                    <LineChart className="h-10 w-10 text-slate-600" />
                  </div>
                  <div className="text-sm font-medium">Chart 3</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="export" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="p-6 h-auto flex flex-col items-center gap-2 bg-slate-700 border-slate-600 hover:bg-slate-600"
                onClick={() => handleExport('pdf')}
                disabled={loading}
              >
                <File className="h-12 w-12 text-rose-500" />
                <span className="text-lg font-medium">PDF</span>
                <span className="text-xs text-slate-400">Export as PDF document</span>
              </Button>

              <Button
                variant="outline"
                className="p-6 h-auto flex flex-col items-center gap-2 bg-slate-700 border-slate-600 hover:bg-slate-600"
                onClick={() => handleExport('excel')}
                disabled={loading}
              >
                <FileSpreadsheet className="h-12 w-12 text-emerald-500" />
                <span className="text-lg font-medium">Excel</span>
                <span className="text-xs text-slate-400">Export as Excel spreadsheet</span>
              </Button>

              <Button
                variant="outline"
                className="p-6 h-auto flex flex-col items-center gap-2 bg-slate-700 border-slate-600 hover:bg-slate-600"
                onClick={() => handleExport('image')}
                disabled={loading}
              >
                <FileImage className="h-12 w-12 text-blue-500" />
                <span className="text-lg font-medium">Image</span>
                <span className="text-xs text-slate-400">Export as PNG image</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-1 bg-slate-700 border-slate-600 hover:bg-slate-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Button>

          {activeTab !== 'export' && (
            <Button
              className="flex items-center gap-1"
              onClick={() => setActiveTab('export')}
            >
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportViewer;
