import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { PlusCircle, Search } from "lucide-react";

import ProjectsList from "@/components/projects/ProjectsList";
import ProjectForm from "@/components/projects/ProjectForm";
import ProjectDetails from "@/components/projects/ProjectDetails";

import { ProjectStatus } from "@/models/project.model";

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
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch projects from the database
  const fetchProjects = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setFetchError(null);

    try {
      // Obținem proiectele utilizatorului din Supabase
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("manager_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Convertim statusul la tipul ProjectStatus
      const projectsWithCorrectStatus = data.map((project) => ({
        ...project,
        status: project.status as ProjectStatus,
      }));
      setProjects(projectsWithCorrectStatus as Project[]);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      setFetchError(error.message);
      // Eliminăm notificarea toast pentru a evita duplicarea
      // Eroarea va fi afișată în interfață prin componenta de eroare
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load projects on component mount
  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, fetchProjects]);

  // Filter projects based on search term
  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description &&
        project.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (project.client_name &&
        project.client_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (project.location &&
        project.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle project actions
  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setIsDetailsDialogOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteProject = async (projectId: string) => {
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

        setProjects(projects.filter((p) => p.id !== projectId));

        // Afișăm o singură notificare de succes
        toast({
          title: t("projects.toasts.deleted", "Project Deleted"),
          description: t(
            "projects.toasts.deletedDesc",
            "The project has been deleted successfully"
          ),
        });
      } catch (error: any) {
        console.error("Error deleting project:", error);
        // Setăm eroarea pentru a fi afișată în interfață
        setFetchError(error.message);
      }
    }
  };

  // Redirect if not authenticated
  if (!loading && !user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 p-4">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className="text-2xl font-bold">
                {t("projects.title", "Projects")}
              </h1>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 md:min-w-[300px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    type="search"
                    placeholder={t(
                      "projects.searchPlaceholder",
                      "Search projects..."
                    )}
                    className="pl-8 bg-slate-900 border-slate-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => {
                    setSelectedProject(null);
                    setIsCreateDialogOpen(true);
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  {t("projects.createButton", "Create Project")}
                </Button>
              </div>
            </div>
          </div>
        </header>
        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="container mx-auto">
            {fetchError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-md mb-6"
              >
                <p className="font-medium">
                  {t("common.error", "Error")}: {fetchError}
                </p>
              </motion.div>
            )}
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
          </div>
        </main>
      </div>

      {/* Project form dialog */}
      <ProjectForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        project={selectedProject || undefined}
        onSuccess={fetchProjects}
      />

      {/* Project details dialog */}
      {selectedProject && (
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
    </div>
  );
};

export default ProjectsPage;
