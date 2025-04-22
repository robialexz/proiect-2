import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, Plus } from "lucide-react";

interface Project {
  id: string;
  name: string;
  progress: number;
  status: "active" | "completed" | "on-hold";
  dueDate: string;
}

interface ProjectsOverviewProps {
  className?: string;
}

const ProjectsOverview = ({ className = "" }: ProjectsOverviewProps) => {
  const { t } = useTranslation();

  // Mock projects data
  const projects: Project[] = [
    {
      id: "1",
      name: "Office Building Renovation",
      progress: 75,
      status: "active",
      dueDate: "2023-12-15",
    },
    {
      id: "2",
      name: "Residential Complex Phase 1",
      progress: 45,
      status: "active",
      dueDate: "2024-03-20",
    },
    {
      id: "3",
      name: "Highway Bridge Repair",
      progress: 90,
      status: "active",
      dueDate: "2023-11-30",
    },
    {
      id: "4",
      name: "Shopping Mall Extension",
      progress: 20,
      status: "on-hold",
      dueDate: "2024-05-10",
    },
  ];

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "bg-success/20 text-success";
      case "completed":
        return "bg-primary/20 text-primary";
      case "on-hold":
        return "bg-warning/20 text-warning";
      default:
        return "bg-slate-700 text-slate-300";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-success";
    if (progress >= 40) return "bg-info";
    return "bg-warning";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className={`${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t("Active Projects")}</h2>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          {t("New Project")}
        </Button>
      </div>

      <div className="space-y-4">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium">{project.name}</h3>
              <Badge className={getStatusColor(project.status)}>
                {project.status === "active"
                  ? t("Active")
                  : project.status === "completed"
                    ? t("Completed")
                    : t("On Hold")}
              </Badge>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>{t("Progress")}</span>
                <span>{project.progress}%</span>
              </div>
              <Progress
                value={project.progress}
                className="h-2 bg-slate-700"
                indicatorClassName={getProgressColor(project.progress)}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">
                {t("Due")}: {formatDate(project.dueDate)}
              </span>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}

        <Button variant="ghost" className="w-full justify-center text-sm">
          {t("View all projects")}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default ProjectsOverview;
