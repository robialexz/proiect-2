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
import { PlusCircle, Search, BookOpen } from "lucide-react";
import ResourcesList from "@/components/resources/ResourcesList";
import ResourceForm from "@/components/resources/ResourceForm";
import ResourceAllocations from "@/components/resources/ResourceAllocations";

type Resource = Database["public"]["Tables"]["resources"]["Row"];

const ResourcesPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAllocationsDialogOpen, setIsAllocationsDialogOpen] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  useEffect(() => {
    if (user) {
      fetchResources();
    }
  }, [user]);

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setResources(data || []);
    } catch (error: any) {
      console.error("Error fetching resources:", error);
      toast({
        variant: "destructive",
        title: "Error loading resources",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    try {
      const { error } = await supabase
        .from("resources")
        .delete()
        .eq("id", resourceId);

      if (error) throw error;

      setResources(resources.filter((resource) => resource.id !== resourceId));
      toast({
        title: "Resource deleted",
        description: "The resource has been successfully deleted",
      });
    } catch (error: any) {
      console.error("Error deleting resource:", error);
      toast({
        variant: "destructive",
        title: "Error deleting resource",
        description: error.message,
      });
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
      (resource.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.type.toLowerCase().includes(searchTerm.toLowerCase())
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
              Resource Management
            </h1>
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
              <Button onClick={() => {
                setSelectedResource(null);
                setIsCreateDialogOpen(true);
              }}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
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
            <ResourcesList
              resources={filteredResources}
              isLoading={isLoading}
              onEditResource={handleEditResource}
              onDeleteResource={handleDeleteResource}
              onViewAllocations={handleViewAllocations}
              onViewMaintenance={handleViewMaintenance}
            />
          </motion.div>
        </main>
      </div>

      {/* Resource Form Dialog */}
      <ResourceForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        resource={selectedResource || undefined}
        onSuccess={fetchResources}
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

