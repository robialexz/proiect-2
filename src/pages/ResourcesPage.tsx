import React, { useState, useEffect, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";
import { Project, ProjectStatus } from "@/models/project.model";
import {
  PlusCircle,
  Search,
  BookOpen,
  RefreshCw,
  FolderPlus,
} from "lucide-react";
import ResourcesList from "@/components/resources/ResourcesList";
import ResourceForm from "@/components/resources/ResourceForm";
import ResourceAllocations from "@/components/resources/ResourceAllocations";
import useDataLoader from "@/hooks/useDataLoader";
import { measurePerformance } from "@/lib/performance-optimizer";
import supabaseService from "@/lib/supabase-service";

type Resource = Database["public"]["Tables"]["resources"]["Row"];

const ResourcesPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // State pentru proiecte
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAllocationsDialogOpen, setIsAllocationsDialogOpen] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );

  // Încărcăm proiectele utilizatorului
  useEffect(() => {
    const loadProjects = async () => {
      if (!user) return;

      setLoadingProjects(true);
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("id, name")
          .eq("manager_id", user.id);

        if (error) throw error;

        // Convertim statusul la tipul ProjectStatus
        const projectsWithCorrectStatus = (data || []).map((project) => ({
          ...project,
          status: project.status as ProjectStatus,
        }));

        setProjects(projectsWithCorrectStatus);
      } catch (error) {
        // Removed console statement
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, [user]);

  // Navigare către pagina de proiecte pentru a crea un proiect nou
  const handleCreateProject = () => {
    navigate("/projects");
  };

  // Folosim hook-ul useDataLoader pentru încărcarea optimizată a resurselor
  const {
    data: resourcesData,
    isLoading: resourcesLoading,
    error: resourcesError,
    refetch: refetchResources,
  } = useDataLoader<Resource>(
    "resources",
    "*",
    { order: { column: "created_at", ascending: false } },
    "all_resources",
    15 * 60 * 1000, // 15 minute cache
    [] // Array gol pentru dependențe
  );

  // Actualizăm starea resurselor când se schimbă datele
  useEffect(() => {
    if (resourcesData) {
      setResources(resourcesData);
    }

    setIsLoading(resourcesLoading);

    if (resourcesError) {
      // Removed console statement
      // Evităm afișarea de notificări multiple pentru aceeași eroare
      // Folosim un timeout pentru a evita problemele de performanță
      const timer = setTimeout(() => {
        toast({
          variant: "destructive",
          title: "Error loading resources",
          description: resourcesError.message,
        });
        // Fallback la metoda tradițională dacă useDataLoader eșuează
        fetchResourcesFallback();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [resourcesData, resourcesLoading, resourcesError]);

  // Metoda de fallback pentru încărcarea resurselor
  const fetchResourcesFallback = async () => {
    const endMeasurement = measurePerformance("Fetch resources fallback");
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setResources(data || []);
    } catch (error: any) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: "Error loading resources",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
      endMeasurement();
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    const endMeasurement = measurePerformance("Delete resource");
    try {
      const { error } = await supabase
        .from("resources")
        .delete()
        .eq("id", resourceId);

      if (error) throw error;

      // Actualizăm starea locală
      setResources(resources.filter((resource) => resource.id !== resourceId));

      // Reîncărcăm datele pentru a asigura sincronizarea
      refetchResources();

      toast({
        title: "Resource deleted",
        description: "The resource has been successfully deleted",
      });
    } catch (error: any) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: "Error deleting resource",
        description: error.message,
      });
    } finally {
      endMeasurement();
    }
  };

  const handleEditResource = (resource: Resource) => {
    setSelectedResource(resource);
    setIsCreateDialogOpen(true);
  };

  const handleViewAllocations = (resource: Resource) => {
    setSelectedResource(resource);
    setIsAllocationsDialogOpen(true);
  };

  const handleViewMaintenance = (resource: Resource) => {
    setSelectedResource(resource);
    setIsMaintenanceDialogOpen(true);
    // This would open a maintenance history dialog
    // For now, we'll just show the allocations dialog
    setIsAllocationsDialogOpen(true);
  };

  const filteredResources = resources.filter(
    (resource) =>
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (resource.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      resource.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Verificare dacă se încarcă datele de autentificare
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white">{t("common.loading", "Loading...")}</div>
      </div>
    );
  }

  // Verificare dacă utilizatorul este autentificat
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Verificare dacă există proiecte
  const hasProjects = projects.length > 0;

  // Render pentru starea fără proiecte
  if (!loadingProjects && !hasProjects) {
    return (
      <div className="flex h-screen bg-slate-900 text-white">
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <FolderPlus className="h-16 w-16 text-slate-400 mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            {t("resources.noProjects.title", "Nu există proiecte")}
          </h1>
          <p className="text-slate-400 mb-6 text-center max-w-md">
            {t(
              "resources.noProjects.description",
              "Pentru a gestiona resursele, trebuie să creați mai întâi un proiect."
            )}
          </p>
          <Button
            onClick={handleCreateProject}
            className="flex items-center gap-2"
          >
            <FolderPlus className="h-4 w-4" />
            {t("resources.noProjects.createButton", "Creați primul proiect")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Resource Management</h1>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="search"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full bg-slate-800 border-slate-700 focus:ring-primary"
                />
              </div>
              <Button
                onClick={() => {
                  setSelectedResource(null);
                  setIsCreateDialogOpen(true);
                }}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key="resources-list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {filteredResources.length}{" "}
                  {filteredResources.length === 1 ? "Resource" : "Resources"}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refetchResources}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-10">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                }
              >
                <ResourcesList
                  resources={filteredResources}
                  isLoading={isLoading}
                  onEditResource={handleEditResource}
                  onDeleteResource={handleDeleteResource}
                  onViewAllocations={handleViewAllocations}
                  onViewMaintenance={handleViewMaintenance}
                />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Resource Form Dialog */}
      <ResourceForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        resource={selectedResource || undefined}
        onSuccess={refetchResources}
      />

      {/* Resource Allocations Dialog */}
      {selectedResource && (
        <ResourceAllocations
          resource={selectedResource}
          open={isAllocationsDialogOpen}
          onOpenChange={setIsAllocationsDialogOpen}
        />
      )}
    </div>
  );
};

export default ResourcesPage;
