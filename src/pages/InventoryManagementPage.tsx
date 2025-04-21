import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useInventory } from "@/hooks/useInventory";
import { Material } from "@/types";
import { Project, ProjectStatus } from "@/models/project.model";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { FolderPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Componente pentru inventar
import ProjectSelector from "@/components/inventory/ProjectSelector";
import InventoryFilters from "@/components/inventory/InventoryFilters";
import InventoryActions from "@/components/inventory/InventoryActions";
import MaterialsTable from "@/components/inventory/MaterialsTable";
import VirtualizedMaterialsTable from "@/components/inventory/VirtualizedMaterialsTable";
import MaterialDialog from "@/components/inventory/MaterialDialog";
import DeleteConfirmationDialog from "@/components/inventory/DeleteConfirmationDialog";
import ReorderList from "@/components/inventory/ReorderList";
import ImportDialog from "@/components/inventory/ImportDialog";

const InventoryManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State pentru proiecte
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // State pentru dialoguri
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReorderListOpen, setIsReorderListOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(
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
          .select("id, name, description, status, created_at")
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

  // Folosim hook-ul personalizat pentru gestionarea inventarului
  const {
    materials,
    paginatedMaterials,
    loading,
    pagination,
    sort,
    filters,
    categories,
    selectedMaterial,
    loadMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    confirmSuplimentar,
    generateReorderList,
    exportInventory,
    setFilters,
    setSort,
    setPagination,
    selectMaterial,
  } = useInventory(selectedProjectId);

  // Gestionăm schimbarea proiectului
  const handleProjectChange = (projectId: string | null) => {
    setSelectedProjectId(projectId);
  };

  // Gestionăm schimbarea filtrelor
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  // Gestionăm sortarea
  const handleSort = (field: string) => {
    const direction =
      sort.field === field && sort.direction === "asc" ? "desc" : "asc";
    setSort(field, direction);
  };

  // Gestionăm schimbarea paginii
  const handlePageChange = (page: number) => {
    setPagination(page);
  };

  // Gestionăm adăugarea unui material
  const handleAddMaterial = () => {
    selectMaterial(null);
    setIsAddDialogOpen(true);
  };

  // Gestionăm editarea unui material
  const handleEditMaterial = (material: Material) => {
    selectMaterial(material);
    setIsEditDialogOpen(true);
  };

  // Gestionăm ștergerea unui material
  const handleDeleteMaterial = (material: Material) => {
    setMaterialToDelete(material as Material);
    setIsDeleteDialogOpen(true);
  };

  // Gestionăm confirmarea cantității suplimentare
  const handleConfirmSuplimentar = async (id: string) => {
    try {
    await confirmSuplimentar(id);
    } catch (error) {
      // Handle error appropriately
    }
  };

  // Gestionăm crearea unui material
  const handleCreateMaterial = async (material: Partial<Material>) => {
    // Ensure required fields are present before casting and sending
    if (
      !material.name ||
      material.quantity === undefined ||
      material.unit === undefined
    ) {
      // Removed console statement
      return { success: false, error: "Missing required fields" };
    }
    // Create a new object with only the fields needed for material creation
    const newMaterial = {
      name: material.name,
      quantity: material.quantity,
      unit: material.unit,
      description: material.description,
      dimension: material.dimension,
      manufacturer: material.manufacturer,
      cost_per_unit: material.cost_per_unit,
      supplier_id: material.supplier_id,
      project_id: material.project_id,
      category: material.category,
      location: material.location,
      min_stock_level: material.min_stock_level,
      max_stock_level: material.max_stock_level,
      suplimentar: material.suplimentar,
      notes: material.notes,
      image_url: material.image_url,
    };

    try {
    return await createMaterial(newMaterial);
    } catch (error) {
      // Handle error appropriately
    }
  };

  // Gestionăm actualizarea unui material
  const handleUpdateMaterial = async (material: Partial<Material>) => {
    if (!selectedMaterial)
      return { success: false, error: "No material selected" };
    try {
    return await updateMaterial(selectedMaterial.id, material);
    } catch (error) {
      // Handle error appropriately
    }
  };

  // Gestionăm confirmarea ștergerii
  const handleConfirmDelete = async (id: string) => {
    try {
    return await deleteMaterial(id);
    } catch (error) {
      // Handle error appropriately
    }
  };

  // Gestionăm exportul inventarului
  const handleExport = async (format: "csv" | "json") => {
    try {
    return await exportInventory(format);
    } catch (error) {
      // Handle error appropriately
    }
  };

  // Gestionăm generarea listei de reaprovizionare
  const handleGenerateReorderList = async () => {
    try {
    return await generateReorderList();
    } catch (error) {
      // Handle error appropriately
    }
  };

  // Gestionăm importul
  const handleImport = () => {
    setIsImportDialogOpen(true);
  };

  // Gestionăm reîmprospătarea datelor
  const handleRefresh = () => {
    loadMaterials();
  };

  // Gestionăm închiderea dialogurilor
  const handleCloseDialogs = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setIsReorderListOpen(false);
    setIsImportDialogOpen(false);
    setMaterialToDelete(null);
  };

  // Gestionăm succesul importului
  const handleImportSuccess = () => {
    loadMaterials();
  };

  // Verificare dacă există proiecte
  const hasProjects = projects.length > 0;

  // Render pentru starea fără proiecte
  if (!loadingProjects && !hasProjects) {
    return (
      <>
        <Helmet>
          <title>{t("inventory.pageTitle", "Gestionare Inventar")}</title>
        </Helmet>

        <div className="container mx-auto py-12">
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <FolderPlus className="h-16 w-16 text-slate-400 mb-4" />
            <h1 className="text-2xl font-bold mb-2">
              {t("inventory.noProjects.title", "Nu există proiecte")}
            </h1>
            <p className="text-slate-400 mb-6">
              {t(
                "inventory.noProjects.description",
                "Pentru a gestiona inventarul, trebuie să creați mai întâi un proiect."
              )}
            </p>
            <Button
              onClick={handleCreateProject}
              className="flex items-center gap-2"
            >
              <FolderPlus className="h-4 w-4" />
              {t("inventory.noProjects.createButton", "Creați primul proiect")}
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t("inventory.pageTitle", "Gestionare Inventar")}</title>
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("inventory.title", "Inventar")}
            </h1>
            <p className="text-muted-foreground">
              {t("inventory.subtitle", "Gestionează materialele și stocurile")}
            </p>
          </div>

          <ProjectSelector
            selectedProjectId={selectedProjectId}
            onProjectChange={handleProjectChange}
          />
        </div>

        <Separator />

        <div className="grid gap-4 md:grid-cols-7">
          <Card className="md:col-span-5">
            <CardHeader className="pb-3">
              <CardTitle>
                {t("inventory.materials.title", "Materiale")}
              </CardTitle>
              <CardDescription>
                {t(
                  "inventory.materials.description",
                  "Lista completă a materialelor din inventar"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <InventoryFilters
                    categories={categories}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                  />

                  <InventoryActions
                    onAddMaterial={handleAddMaterial}
                    onExport={handleExport}
                    onImport={handleImport}
                    onReorderList={() => setIsReorderListOpen(true)}
                    onRefresh={handleRefresh}
                  />
                </div>

                {/* Folosim tabelul virtualizat pentru performanță mai bună */}
                <VirtualizedMaterialsTable
                  materials={paginatedMaterials}
                  loading={loading}
                  pagination={pagination}
                  sort={sort}
                  onEdit={handleEditMaterial}
                  onDelete={handleDeleteMaterial}
                  onSort={handleSort}
                  onPageChange={handlePageChange}
                  onConfirmSuplimentar={handleConfirmSuplimentar}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle>{t("inventory.stats.title", "Statistici")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {t("inventory.stats.totalMaterials", "Total materiale")}
                    </p>
                    <p className="text-2xl font-bold">
                      {loading ? "..." : materials.length}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {t("inventory.stats.categories", "Categorii")}
                    </p>
                    <p className="text-2xl font-bold">
                      {loading ? "..." : categories.length}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("inventory.stats.lowStock", "Stoc scăzut")}
                  </p>
                  <p className="text-2xl font-bold text-yellow-500">
                    {loading
                      ? "..."
                      : materials.filter(
                          (m) =>
                            m.min_stock_level !== undefined &&
                            m.min_stock_level !== null &&
                            m.quantity < m.min_stock_level
                        ).length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t(
                      "inventory.stats.lowStockDescription",
                      "Materiale sub nivelul minim de stoc"
                    )}
                  </p>
                </div>

                <Separator />

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("inventory.stats.lastUpdated", "Ultima actualizare")}
                  </p>
                  <p className="text-base font-medium">
                    {new Date().toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialoguri */}
      <MaterialDialog
        material={null}
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleCreateMaterial}
      />

      <MaterialDialog
        material={selectedMaterial}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmit={handleUpdateMaterial}
        isEdit
      />

      <DeleteConfirmationDialog
        material={materialToDelete}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <ReorderList
        isOpen={isReorderListOpen}
        onClose={() => setIsReorderListOpen(false)}
        onExport={handleExport}
        onGenerateList={handleGenerateReorderList}
      />

      <ImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onSuccess={handleImportSuccess}
      />
    </>
  );
};

export default InventoryManagementPage;
