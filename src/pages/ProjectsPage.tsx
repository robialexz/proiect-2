import React, { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import {
  PlusCircle,
  Search,
  MoreHorizontal,
  Calendar,
  Users,
  Package,
  Clock,
  ArrowUpRight,
  BarChart2,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "completed" | "on-hold";
  progress: number;
  team: string[];
  dueDate: string;
  materialsCount: number;
}

const ProjectsPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
  });

  // Sample projects data
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "Clădire de birouri - Centru",
      description:
        "Construcția unei clădiri de birouri cu 12 etaje în centrul orașului",
      status: "active",
      progress: 65,
      team: ["John Doe", "Maria Smith", "Alex Johnson"],
      dueDate: "2024-12-15",
      materialsCount: 248,
    },
    {
      id: "2",
      name: "Complex rezidențial - Vest",
      description: "Dezvoltarea unui complex rezidențial cu 120 de apartamente",
      status: "active",
      progress: 32,
      team: ["Robert Brown", "Emma Davis"],
      dueDate: "2025-03-20",
      materialsCount: 187,
    },
    {
      id: "3",
      name: "Renovare hotel - Centru vechi",
      description: "Renovarea completă a unui hotel istoric din centrul vechi",
      status: "on-hold",
      progress: 18,
      team: ["Michael Wilson", "Sophia Miller", "Daniel Taylor"],
      dueDate: "2024-11-30",
      materialsCount: 93,
    },
    {
      id: "4",
      name: "Parc industrial - Nord",
      description:
        "Construcția unui parc industrial cu 5 hale și clădire administrativă",
      status: "completed",
      progress: 100,
      team: ["Olivia Anderson", "William Thomas"],
      dueDate: "2024-06-10",
      materialsCount: 312,
    },
  ]);

  const handleCreateProject = () => {
    if (!newProject.name.trim()) {
      toast({
        variant: "destructive",
        title: t("projects.errors.nameRequired", "Project name is required"),
        description: t(
          "projects.errors.nameRequiredDesc",
          "Please enter a name for your project",
        ),
      });
      return;
    }

    const newProjectData: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description,
      status: "active",
      progress: 0,
      team: [],
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      materialsCount: 0,
    };

    setProjects([newProjectData, ...projects]);
    setNewProject({ name: "", description: "" });
    setIsCreateDialogOpen(false);

    toast({
      title: t("projects.toasts.created", "Project Created"),
      description: t(
        "projects.toasts.createdDesc",
        "Your project has been created successfully",
      ),
    });
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "completed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "on-hold":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return t("projects.status.active", "Active");
      case "completed":
        return t("projects.status.completed", "Completed");
      case "on-hold":
        return t("projects.status.onHold", "On Hold");
      default:
        return status;
    }
  };

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
              {t("projects.title", "Projects")}
            </h1>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="search"
                  placeholder={t(
                    "projects.searchPlaceholder",
                    "Search projects...",
                  )}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full bg-slate-800 border-slate-700 focus:ring-primary"
                />
              </div>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    {t("projects.createButton", "Create Project")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] bg-slate-800 border-slate-700 text-white">
                  <DialogHeader>
                    <DialogTitle>
                      {t("projects.createDialog.title", "Create New Project")}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                      {t(
                        "projects.createDialog.description",
                        "Fill in the details below to create a new project.",
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label
                        htmlFor="name"
                        className="text-right text-slate-400"
                      >
                        {t("projects.form.name", "Name")}*
                      </label>
                      <Input
                        id="name"
                        value={newProject.name}
                        onChange={(e) =>
                          setNewProject({ ...newProject, name: e.target.value })
                        }
                        className="col-span-3 bg-slate-700 border-slate-600"
                        placeholder={t(
                          "projects.form.namePlaceholder",
                          "Enter project name",
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label
                        htmlFor="description"
                        className="text-right text-slate-400"
                      >
                        {t("projects.form.description", "Description")}
                      </label>
                      <Input
                        id="description"
                        value={newProject.description}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            description: e.target.value,
                          })
                        }
                        className="col-span-3 bg-slate-700 border-slate-600"
                        placeholder={t(
                          "projects.form.descriptionPlaceholder",
                          "Enter project description",
                        )}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="border-slate-600 hover:bg-slate-700"
                    >
                      {t("common.cancel", "Cancel")}
                    </Button>
                    <Button onClick={handleCreateProject}>
                      {t("projects.createButton", "Create Project")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  whileHover={{
                    y: -5,
                    boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)",
                  }}
                  className="h-full"
                >
                  <Card className="h-full bg-slate-800 border-slate-700 overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge
                          className={`${getStatusColor(project.status)} px-2 py-1 text-xs font-medium`}
                        >
                          {getStatusText(project.status)}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-slate-800 border-slate-700 text-white"
                          >
                            <DropdownMenuLabel>
                              {t("common.actions", "Actions")}
                            </DropdownMenuLabel>
                            <DropdownMenuItem className="focus:bg-slate-700 cursor-pointer">
                              {t("projects.actions.edit", "Edit Project")}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-slate-700 cursor-pointer">
                              {t(
                                "projects.actions.inventory",
                                "View Inventory",
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-slate-700 cursor-pointer">
                              {t("projects.actions.team", "Manage Team")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-700" />
                            <DropdownMenuItem className="focus:bg-red-900 text-red-400 cursor-pointer">
                              {t("projects.actions.delete", "Delete Project")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardTitle className="text-xl mt-2">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="text-slate-400 line-clamp-2">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      {/* Progress bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-slate-400">
                            {t("projects.progress", "Progress")}
                          </span>
                          <span className="text-sm font-medium">
                            {project.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Project stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">
                              {t("projects.dueDate", "Due Date")}
                            </p>
                            <p className="text-sm font-medium">
                              {project.dueDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <Package className="h-4 w-4 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">
                              {t("projects.materials", "Materials")}
                            </p>
                            <p className="text-sm font-medium">
                              {project.materialsCount}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Team members */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate-400">
                            {t("projects.team", "Team")}
                          </p>
                          <div className="flex items-center mt-1">
                            {project.team.slice(0, 3).map((member, index) => (
                              <div
                                key={index}
                                className="w-6 h-6 rounded-full overflow-hidden border-2 border-slate-800"
                                style={{ marginLeft: index > 0 ? "-8px" : "0" }}
                              >
                                <img
                                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member}`}
                                  alt={member}
                                  className="w-full h-full"
                                />
                              </div>
                            ))}
                            {project.team.length > 3 && (
                              <div
                                className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs border-2 border-slate-800"
                                style={{ marginLeft: "-8px" }}
                              >
                                +{project.team.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-center hover:bg-slate-700 hover:text-primary"
                        onClick={() => {
                          // Navigate to project details
                        }}
                      >
                        {t("projects.viewDetails", "View Details")}
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-medium mb-2">
                  {t("projects.noProjects.title", "No projects found")}
                </h3>
                <p className="text-slate-400 max-w-md mx-auto mb-6">
                  {searchTerm
                    ? t(
                        "projects.noProjects.searchMessage",
                        "No projects match your search criteria. Try a different search term.",
                      )
                    : t(
                        "projects.noProjects.emptyMessage",
                        "You haven't created any projects yet. Create your first project to get started.",
                      )}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    {t("projects.createButton", "Create Project")}
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default ProjectsPage;
