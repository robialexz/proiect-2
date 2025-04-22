import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  FileText,
  Users,
  Bell,
  ArrowUpRight,
  BarChart2,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Project {
  id: string;
  name: string;
  created_at: string;
  materials_count: number;
  pending_announcements: number;
}

interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  suplimentar: number;
  project_name: string;
  project_id: string;
}

interface Announcement {
  id: string;
  supplier_name: string;
  status: "pending" | "confirmed" | "rejected";
  created_at: string;
  project_name: string;
  project_id: string;
}

const OverviewPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    } else if (!loading) {
      setIsLoading(false);
    }
  }, [user, loading]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch projects with counts
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("id, name, created_at")
        .order("created_at", { ascending: false });

      if (projectsError) throw projectsError;

      // Fetch materials with low stock or supplementary quantities
      const { data: materialsData, error: materialsError } = await supabase
        .from("materials")
        .select(
          "id, name, quantity, unit, suplimentar, project_id, projects(name)"
        )
        .or("suplimentar.gt.0,quantity.lt.10")
        .limit(10);

      if (materialsError) throw materialsError;

      // Fetch recent announcements
      const { data: announcementsData, error: announcementsError } =
        await supabase
          .from("supplier_announcements")
          .select(
            "id, supplier_name, status, created_at, project_id, projects(name)"
          )
          .order("created_at", { ascending: false })
          .limit(10);

      if (announcementsError) throw announcementsError;

      // Process projects with counts
      const projectsWithCounts = await Promise.all(
        projectsData.map(async (project) => {
          // Count materials for this project
          const { count: materialsCount, error: countError } = await supabase
            .from("materials")
            .select("id", { count: "exact" })
            .eq("project_id", project.id);

          if (countError) throw countError;

          // Count pending announcements for this project
          const { count: pendingCount, error: pendingError } = await supabase
            .from("supplier_announcements")
            .select("id", { count: "exact" })
            .eq("project_id", project.id)
            .eq("status", "pending");

          if (pendingError) throw pendingError;

          return {
            ...project,
            materials_count: materialsCount || 0,
            pending_announcements: pendingCount || 0,
          };
        })
      );

      // Process materials data
      const processedMaterials = materialsData.map((material) => ({
        id: material.id,
        name: material.name,
        quantity: material.quantity,
        unit: material.unit,
        suplimentar: material.suplimentar,
        project_id: material.project_id,
        project_name: material.projects?.name || "Unknown Project",
      }));

      // Process announcements data
      const processedAnnouncements = announcementsData.map((announcement) => ({
        id: announcement.id,
        supplier_name: announcement.supplier_name,
        status: announcement.status,
        created_at: announcement.created_at,
        project_id: announcement.project_id,
        project_name: announcement.projects?.name || "Unknown Project",
      }));

      setProjects(projectsWithCounts);
      setMaterials(processedMaterials);
      setAnnouncements(processedAnnouncements);
    } catch (error) {
      // Removed console statement
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/20">
            <Clock className="h-3 w-3 mr-1" />
            {t("inventory.supplierAnnouncement.pending", "Pending")}
          </Badge>
        );
      case "confirmed":
        return (
          <Badge className="bg-green-500/20 text-green-500 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t("inventory.supplierAnnouncement.confirmed", "Confirmed")}
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500/20 text-red-500 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            {t("inventory.supplierAnnouncement.rejected", "Rejected")}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-500/20 text-slate-500 border-slate-500/20">
            <AlertCircle className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  if (loading || isLoading) {
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {t("overview.title", "Overview")}
            </h1>
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
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-400" />
                    {t("overview.projects", "Projects")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{projects.length}</div>
                  <p className="text-sm text-slate-400 mt-1">
                    {t("overview.activeProjects", "Active projects")}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Package className="h-5 w-5 mr-2 text-green-400" />
                    {t("overview.materials", "Materials")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{materials.length}</div>
                  <p className="text-sm text-slate-400 mt-1">
                    {t(
                      "overview.materialsNeedingAttention",
                      "Materials needing attention"
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Truck className="h-5 w-5 mr-2 text-purple-400" />
                    {t("overview.deliveries", "Deliveries")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {announcements.filter((a) => a.status === "pending").length}
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    {t("overview.pendingDeliveries", "Pending deliveries")}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for different sections */}
            <Tabs defaultValue="projects" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6 bg-slate-800">
                <TabsTrigger
                  value="projects"
                  className="data-[state=active]:bg-slate-700"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {t("overview.projects", "Projects")}
                </TabsTrigger>
                <TabsTrigger
                  value="materials"
                  className="data-[state=active]:bg-slate-700"
                >
                  <Package className="h-4 w-4 mr-2" />
                  {t("overview.materials", "Materials")}
                </TabsTrigger>
                <TabsTrigger
                  value="announcements"
                  className="data-[state=active]:bg-slate-700"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  {t("overview.announcements", "Announcements")}
                </TabsTrigger>
              </TabsList>

              {/* Projects Tab */}
              <TabsContent value="projects" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.slice(0, 6).map((project) => (
                    <Card
                      key={project.id}
                      className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl">
                          {project.name}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          {t("overview.createdOn", "Created on")}{" "}
                          {format(new Date(project.created_at), "dd MMM yyyy")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 text-green-400 mr-2" />
                            <span className="text-sm text-slate-300">
                              {project.materials_count}{" "}
                              {t("overview.materials", "Materials")}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Truck className="h-4 w-4 text-purple-400 mr-2" />
                            <span className="text-sm text-slate-300">
                              {project.pending_announcements}{" "}
                              {t("overview.pending", "Pending")}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="ghost"
                          className="w-full justify-center hover:bg-slate-700 hover:text-primary"
                          onClick={() => {
                            window.location.href = `/inventory?project=${project.id}`;
                          }}
                        >
                          {t("overview.viewInventory", "View Inventory")}
                          <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                {projects.length > 6 && (
                  <div className="flex justify-center mt-4">
                    <Button
                      variant="outline"
                      className="border-slate-700 hover:bg-slate-700"
                      onClick={() => {
                        window.location.href = "/projects";
                      }}
                    >
                      {t("overview.viewAllProjects", "View All Projects")}
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Materials Tab */}
              <TabsContent value="materials" className="space-y-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle>
                      {t(
                        "overview.materialsNeedingAttention",
                        "Materials Needing Attention"
                      )}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      {t(
                        "overview.materialsDescription",
                        "Materials with low stock or pending supplementary quantities"
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {materials.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-slate-400">
                          {t(
                            "overview.noMaterialsNeedingAttention",
                            "No materials currently need attention"
                          )}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {materials.map((material) => (
                          <div
                            key={material.id}
                            className="flex justify-between items-center p-3 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors"
                          >
                            <div>
                              <h4 className="font-medium">{material.name}</h4>
                              <p className="text-sm text-slate-400">
                                {material.project_name}
                              </p>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className="text-sm">
                                  {t("overview.quantity", "Quantity")}:{" "}
                                  <span className="font-medium">
                                    {material.quantity} {material.unit}
                                  </span>
                                </p>
                                {material.suplimentar > 0 && (
                                  <p className="text-sm text-yellow-400">
                                    {t(
                                      "overview.supplementary",
                                      "Supplementary"
                                    )}
                                    :{" "}
                                    <span className="font-medium">
                                      {material.suplimentar} {material.unit}
                                    </span>
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  window.location.href = `/inventory?project=${material.project_id}`;
                                }}
                              >
                                <ArrowUpRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Announcements Tab */}
              <TabsContent value="announcements" className="space-y-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle>
                      {t(
                        "overview.recentAnnouncements",
                        "Recent Supplier Announcements"
                      )}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      {t(
                        "overview.announcementsDescription",
                        "Recent delivery announcements from suppliers"
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {announcements.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-slate-400">
                          {t(
                            "overview.noAnnouncements",
                            "No recent supplier announcements"
                          )}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {announcements.map((announcement) => (
                          <div
                            key={announcement.id}
                            className="flex justify-between items-center p-3 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors"
                          >
                            <div>
                              <h4 className="font-medium">
                                {announcement.supplier_name}
                              </h4>
                              <p className="text-sm text-slate-400">
                                {announcement.project_name} •{" "}
                                {format(
                                  new Date(announcement.created_at),
                                  "dd MMM yyyy"
                                )}
                              </p>
                            </div>
                            <div className="flex items-center space-x-4">
                              {getStatusBadge(announcement.status)}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  window.location.href = `/inventory?project=${announcement.project_id}`;
                                }}
                              >
                                <ArrowUpRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default OverviewPage;
