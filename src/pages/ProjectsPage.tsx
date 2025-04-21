import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { PlusCircle, Search, Loader2, AlertCircle, Info } from "lucide-react";

import ProjectsList from "@/components/projects/ProjectsList";
import ProjectForm from "@/components/projects/ProjectForm";
import ProjectDetails from "@/components/projects/ProjectDetails";
import { ProjectStatus } from "@/models/project.model";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
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
  created_by?: string;
}

const ProjectsPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const prefersReducedMotion = useReducedMotion();

  const fetchProjects = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setFetchError(null);

    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("manager_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const projectsWithCorrectStatus = data.map((project) => ({
        ...project,
        status: project.status as ProjectStatus,
      }));
      setProjects(projectsWithCorrectStatus as Project[]);
    } catch (error: any) {
      // Removed console statement
      setFetchError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, fetchProjects]);

  useEffect(() => {
    if (searchTerm) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    }
    return () => {};
  }, [searchTerm]);

  const filteredProjects = useMemo(() => {
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description &&
          project.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (project.client_name &&
          project.client_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (project.location &&
          project.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [projects, searchTerm]);

  const handleViewProject = useCallback((project: Project) => {
    setSelectedProject(project);
    setIsDetailsDialogOpen(true);
  }, []);

  const handleEditProject = useCallback((project: Project) => {
    setSelectedProject(project);
    setIsCreateDialogOpen(true);
  }, []);

  const handleDeleteProject = useCallback(
    async (projectId: string) => {
      if (!user) return;

      if (
        window.confirm(
          t(
            "projects.confirmDelete",
            "Are you sure you want to delete this project? This action cannot be undone."
          )
        )
      ) {
        try {
          const { error } = await supabase
            .from("projects")
            .delete()
            .eq("id", projectId);

          if (error) throw error;

          setProjects((prevProjects) =>
            prevProjects.filter((p) => p.id !== projectId)
          );

          toast({
            title: t("projects.toasts.deleted", "Project Deleted"),
            description: t(
              "projects.toasts.deletedDesc",
              "The project has been deleted successfully"
            ),
            className: "bg-green-500/10 border-green-500/20 text-green-200",
          });
        } catch (error: any) {
          // Removed console statement
          setFetchError(error.message);
        }
      }
    },
    [user, t, toast]
  );

  if (!authLoading && !user) {
    return <Navigate to="/login" />;
  }

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
    visible: { opacity: 1, y: 0 },
  };

  const errorVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-blue-500/5 blur-3xl"
          animate={
            prefersReducedMotion
              ? {}
              : {
                  x: [100, 50, 100],
                  y: [-100, -50, -100],
                  scale: [1, 1.1, 1],
                }
          }
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-3xl"
          animate={
            prefersReducedMotion
              ? {}
              : {
                  x: [-50, -100, -50],
                  y: [50, 100, 50],
                  scale: [1, 1.2, 1],
                }
          }
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="bg-gradient-to-r from-slate-800 to-slate-800/80 border-b border-slate-700/50 backdrop-blur-sm shadow-lg p-4 sticky top-0 z-20">
          <div className="container mx-auto">
            <motion.div
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.h1
                className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent"
                variants={itemVariants}
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              >
                {t("projects.title", "Projects")}
              </motion.h1>
              <motion.div
                className="flex items-center gap-3"
                variants={itemVariants}
              >
                <div className="relative flex-1 md:min-w-[300px]">
                  <Search
                    className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                      isSearching ? "text-blue-400" : "text-slate-500"
                    } transition-colors`}
                  />
                  {isSearching && (
                    <motion.div
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                    </motion.div>
                  )}
                  <Input
                    type="search"
                    placeholder={t(
                      "projects.searchPlaceholder",
                      "Search projects..."
                    )}
                    className="pl-10 pr-10 py-2 bg-slate-800/50 border-slate-700/50 rounded-full focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all shadow-inner"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label={t(
                      "projects.searchAriaLabel",
                      "Search projects"
                    )}
                  />
                </div>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                      >
                        <Button
                          onClick={() => {
                            setSelectedProject(null);
                            setIsCreateDialogOpen(true);
                          }}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-md shadow-blue-900/20 border border-blue-600/20 rounded-full px-4"
                          aria-label={t(
                            "projects.createAriaLabel",
                            "Create new project"
                          )}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          {t("projects.createButton", "Create Project")}
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {t("projects.tooltips.create", "Create a new project")}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>
            </motion.div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="container mx-auto">
            <AnimatePresence mode="wait">
              {fetchError && (
                <motion.div
                  key="error"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={errorVariants}
                  className="bg-gradient-to-r from-red-500/20 to-red-500/10 border border-red-500/30 text-red-200 px-6 py-4 rounded-lg mb-6 shadow-lg flex items-start"
                  role="alert"
                  aria-live="assertive"
                >
                  <AlertCircle className="h-5 w-5 mr-3 mt-0.5 text-red-300 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-100 mb-1">
                      {t("common.error", "Error")}
                    </h3>
                    <p>{fetchError}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ProjectsList
                projects={filteredProjects}
                isLoading={isLoading}
                onViewProject={handleViewProject}
                onEditProject={handleEditProject}
                onDeleteProject={handleDeleteProject}
                onCreateProject={() => {
                  setSelectedProject(null);
                  setIsCreateDialogOpen(true);
                }}
              />
            </motion.div>

            {!isLoading && filteredProjects.length === 0 && searchTerm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <Info className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-300 mb-2">
                  {t("projects.noSearchResults", "No projects found")}
                </h3>
                <p className="text-slate-400 max-w-md mx-auto">
                  {t(
                    "projects.noSearchResultsDesc",
                    "No projects match your search criteria. Try adjusting your search term or create a new project."
                  )}
                </p>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {isCreateDialogOpen && (
          <ProjectForm
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            project={selectedProject || undefined}
            onSuccess={fetchProjects}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDetailsDialogOpen && selectedProject && (
          <ProjectDetails
            open={isDetailsDialogOpen}
            onOpenChange={setIsDetailsDialogOpen}
            project={selectedProject}
            onEdit={() => {
              setIsDetailsDialogOpen(false);
              setIsCreateDialogOpen(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectsPage;
