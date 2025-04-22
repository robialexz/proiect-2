import React from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Clock,
  DollarSign,
  MoreHorizontal,
  Package,
  Users,
  ArrowUpRight,
  BarChart2,
  Flag,
  Building,
  MapPin,
  PlusCircle,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  start_date?: string;
  end_date?: string;
  progress?: number;
  budget?: number;
  client_name?: string;
  client_contact?: string;
  location?: string;
  project_type?: string;
  priority?: string;
  created_at: string;
}

interface ProjectsListProps {
  projects: Project[];
  isLoading: boolean;
  onViewProject: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onCreateProject: () => void;
}

const ProjectsList: React.FC<ProjectsListProps> = ({
  projects,
  isLoading,
  onViewProject,
  onEditProject,
  onDeleteProject,
  onCreateProject,
}) => {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-blue-500/20 text-blue-500 border-blue-500/20";
      case "active":
        return "bg-green-500/20 text-green-500 border-green-500/20";
      case "on-hold":
        return "bg-amber-500/20 text-amber-500 border-amber-500/20";
      case "completed":
        return "bg-purple-500/20 text-purple-500 border-purple-500/20";
      case "cancelled":
        return "bg-red-500/20 text-red-500 border-red-500/20";
      default:
        return "bg-slate-500/20 text-slate-500 border-slate-500/20";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-500/20 text-green-500 border-green-500/20";
      case "medium":
        return "bg-blue-500/20 text-blue-500 border-blue-500/20";
      case "high":
        return "bg-amber-500/20 text-amber-500 border-amber-500/20";
      case "urgent":
        return "bg-red-500/20 text-red-500 border-red-500/20";
      default:
        return "bg-slate-500/20 text-slate-500 border-slate-500/20";
    }
  };

  const getProjectTypeLabel = (type: string) => {
    switch (type) {
      case "residential":
        return t("projects.types.residential", "Residential");
      case "commercial":
        return t("projects.types.commercial", "Commercial");
      case "industrial":
        return t("projects.types.industrial", "Industrial");
      case "infrastructure":
        return t("projects.types.infrastructure", "Infrastructure");
      case "renovation":
        return t("projects.types.renovation", "Renovation");
      case "other":
        return t("projects.types.other", "Other");
      default:
        return type;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-400">{t("common.loading", "Loading...")}</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center h-64 text-center"
      >
        <div className="bg-slate-800/50 p-4 rounded-full mb-4">
          <BarChart2 className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-medium mb-2">
          {t("projects.empty.title", "No projects found")}
        </h3>
        <p className="text-slate-400 mb-6 max-w-md">
          {t(
            "projects.empty.description",
            "You don't have any projects yet. Create your first project to get started."
          )}
        </p>
        <Button onClick={onCreateProject}>
          <PlusCircle className="h-4 w-4 mr-2" />
          {t("projects.createButton", "Create Project")}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {projects.map((project) => (
        <motion.div key={project.id} variants={itemVariants}>
          <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors overflow-hidden h-full flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg line-clamp-1">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description ||
                      t("projects.noDescription", "No description provided")}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                    >
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-slate-800 border-slate-700"
                  >
                    <DropdownMenuLabel>
                      {t("common.actions", "Actions")}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem
                      className="cursor-pointer hover:bg-slate-700"
                      onClick={() => onViewProject(project)}
                    >
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      {t("common.view", "View")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer hover:bg-slate-700"
                      onClick={() => onEditProject(project)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {t("common.edit", "Edit")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-500 hover:text-red-500 hover:bg-red-500/10"
                      onClick={() => onDeleteProject(project.id)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {t("common.delete", "Delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pb-2 flex-grow">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={getStatusColor(project.status)}>
                    {t(`projects.status.${project.status}`, project.status)}
                  </Badge>

                  {project.priority && (
                    <Badge className={getPriorityColor(project.priority)}>
                      <Flag className="h-3 w-3 mr-1" />
                      {t(
                        `projects.priority.${project.priority}`,
                        project.priority
                      )}
                    </Badge>
                  )}

                  {project.project_type && (
                    <Badge className="bg-primary/20 text-primary border-primary/20">
                      <Building className="h-3 w-3 mr-1" />
                      {getProjectTypeLabel(project.project_type)}
                    </Badge>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1 text-xs text-slate-400">
                    <span>{t("projects.progress", "Progress")}</span>
                    <span>{project.progress || 0}%</span>
                  </div>
                  <Progress value={project.progress || 0} className="h-1.5" />
                </div>

                <div className="space-y-2 text-sm">
                  {project.location && (
                    <div className="flex items-center text-slate-400">
                      <MapPin className="h-3.5 w-3.5 mr-2 shrink-0" />
                      <span className="truncate">{project.location}</span>
                    </div>
                  )}

                  {project.budget && (
                    <div className="flex items-center text-slate-400">
                      <DollarSign className="h-3.5 w-3.5 mr-2 shrink-0" />
                      <span>
                        {new Intl.NumberFormat("ro-RO", {
                          style: "currency",
                          currency: "RON",
                        }).format(project.budget)}
                      </span>
                    </div>
                  )}

                  {project.end_date && (
                    <div className="flex items-center text-slate-400">
                      <Clock className="h-3.5 w-3.5 mr-2 shrink-0" />
                      <span>
                        {t("projects.dueDate", "Due")}:{" "}
                        {format(new Date(project.end_date), "PP")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button
                variant="outline"
                className="w-full bg-slate-700 border-slate-600 hover:bg-slate-600"
                onClick={() => onViewProject(project)}
              >
                {t("projects.viewDetails", "View Details")}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProjectsList;
