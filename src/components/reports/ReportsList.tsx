import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  FileText,
  Calendar,
  Clock,
  PieChart,
  LineChart,
  BarChart2
} from "lucide-react";
import { Database } from "@/types/supabase";

type Report = Database["public"]["Tables"]["reports"]["Row"];

interface ReportsListProps {
  reports: Report[];
  isLoading: boolean;
  onEditReport: (report: Report) => void;
  onDeleteReport: (reportId: string) => void;
  onViewReport: (report: Report) => void;
  onExportReport: (report: Report) => void;
  onAutoGenerateReport?: () => void;
}

const ReportsList: React.FC<ReportsListProps> = ({
  reports,
  isLoading,
  onEditReport,
  onDeleteReport,
  onViewReport,
  onExportReport,
  onAutoGenerateReport,
}) => {
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

  const getReportTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'financial':
        return <BarChart className="h-10 w-10 text-emerald-500" />;
      case 'inventory':
        return <PieChart className="h-10 w-10 text-blue-500" />;
      case 'project':
        return <LineChart className="h-10 w-10 text-purple-500" />;
      case 'team':
        return <BarChart2 className="h-10 w-10 text-amber-500" />;
      default:
        return <FileText className="h-10 w-10 text-slate-500" />;
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'financial':
        return 'bg-emerald-500/10 border-emerald-500/20';
      case 'inventory':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'project':
        return 'bg-purple-500/10 border-purple-500/20';
      case 'team':
        return 'bg-amber-500/10 border-amber-500/20';
      default:
        return 'bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {isLoading ? (
        // Loading skeletons
        Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="bg-slate-800 border-slate-700 h-[250px] animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-6 w-24 bg-slate-700 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-slate-700 rounded mb-4"></div>
              <div className="h-4 w-full bg-slate-700 rounded mb-2"></div>
              <div className="h-4 w-2/3 bg-slate-700 rounded mb-4"></div>
            </CardContent>
          </Card>
        ))
      ) : reports.length === 0 ? (
        <div className="col-span-3 text-center py-12">
          <BarChart className="h-12 w-12 mx-auto text-slate-500 mb-4" />
          <h3 className="text-xl font-medium mb-2">
            No reports found
          </h3>
          <p className="text-slate-400 max-w-md mx-auto mb-6">
            Create your first report to gain insights into your data
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => onEditReport({ id: '', name: '', type: 'project', status: 'draft', created_at: new Date().toISOString() })}>
              Create Report
            </Button>
            <Button
              variant="outline"
              className="bg-slate-700 border-slate-600 hover:bg-slate-600"
              onClick={onAutoGenerateReport}
            >
              Auto-Generate Report
            </Button>
          </div>
        </div>
      ) : (
        reports.map((report) => (
          <motion.div
            key={report.id}
            whileHover={{
              y: -5,
              boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)",
            }}
            className="h-full"
          >
            <Card className={`h-full bg-slate-800 border-slate-700 overflow-hidden ${getReportTypeColor(report.type)}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge className={`${getStatusColor(report.status)} px-2 py-1 text-xs font-medium`}>
                    {report.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-slate-800 border-slate-700 text-white"
                    >
                      <DropdownMenuLabel>
                        Manage Report
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem
                        className="flex items-center cursor-pointer hover:bg-slate-700"
                        onClick={() => onViewReport(report)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Report
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center cursor-pointer hover:bg-slate-700"
                        onClick={() => onExportReport(report)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center cursor-pointer hover:bg-slate-700"
                        onClick={() => onEditReport(report)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem
                        className="flex items-center cursor-pointer text-red-500 hover:bg-red-500/10 hover:text-red-400"
                        onClick={() => onDeleteReport(report.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  {getReportTypeIcon(report.type)}
                  <div>
                    <CardTitle className="text-xl">{report.name}</CardTitle>
                    <Badge variant="outline" className="mt-1 capitalize">
                      {report.type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400 mb-4">
                  {report.description || "No description provided"}
                </CardDescription>

                <div className="flex justify-between text-sm text-slate-400">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary hover:bg-primary/10"
                    onClick={() => onViewReport(report)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}
    </div>
  );
};

export default ReportsList;
