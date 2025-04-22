import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useInventory } from "@/hooks/useInventory";
import { Material } from "@/types";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Package,
  Plus,
  FileDown,
  Upload,
  BarChart4,
  Filter,
  RefreshCw,
  Warehouse,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Componente pentru inventar
import ProjectSelector from "@/components/inventory/ProjectSelector";
import InventoryFilters from "@/components/inventory/InventoryFilters";
import InventoryActions from "@/components/inventory/InventoryActions";
import MaterialsTable from "@/components/inventory/MaterialsTable";
import MaterialDialog from "@/components/inventory/MaterialDialog";
import DeleteConfirmationDialog from "@/components/inventory/DeleteConfirmationDialog";
import ReorderList from "@/components/inventory/ReorderList";
import ImportDialog from "@/components/inventory/ImportDialog";
import ChatBotWidget from "@/components/ai/ChatBotWidget";

const ProjectInventoryPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isManager, loading: roleLoading } = useRole();
  const prefersReducedMotion = useReducedMotion();

  // State pentru gestionarea proiectului selectat
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isReorderDialogOpen, setIsReorderDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
  const [materialToEdit, setMaterialToEdit] = useState<Material | null>(null);

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

  // Gestionăm adăugarea unui material nou
  const handleAddMaterial = () => {
    setIsAddDialogOpen(true);
  };

  // Gestionăm editarea unui material
  const handleEditMaterial = (material: Material) => {
    setMaterialToEdit(material);
    setIsEditDialogOpen(true);
  };

  // Gestionăm ștergerea unui material
  const handleDeleteMaterial = (material: Material) => {
    setMaterialToDelete(material);
    setIsDeleteDialogOpen(true);
  };

  // Gestionăm confirmarea ștergerii
  const handleConfirmDelete = async () => {
    if (!materialToDelete) return;

    try {
      await deleteMaterial(materialToDelete.id);
      toast({
        title: t("inventory.materialDeleted", "Material deleted"),
        description: t(
          "inventory.materialDeletedDesc",
          "The material has been successfully deleted."
        ),
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("inventory.deleteError", "Delete error"),
        description: t(
          "inventory.deleteErrorDesc",
          "An error occurred while deleting the material."
        ),
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setMaterialToDelete(null);
    }
  };

  // Gestionăm exportul inventarului
  const handleExport = async () => {
    try {
      await exportInventory();
      toast({
        title: t("inventory.exportSuccess", "Export successful"),
        description: t(
          "inventory.exportSuccessDesc",
          "The inventory has been successfully exported."
        ),
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("inventory.exportError", "Export error"),
        description: t(
          "inventory.exportErrorDesc",
          "An error occurred while exporting the inventory."
        ),
      });
    }
  };

  // Gestionăm importul inventarului
  const handleImport = () => {
    setIsImportDialogOpen(true);
  };

  // Gestionăm generarea listei de reaprovizionare
  const handleGenerateReorderList = async () => {
    try {
      await generateReorderList();
      setIsReorderDialogOpen(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("inventory.reorderError", "Reorder list error"),
        description: t(
          "inventory.reorderErrorDesc",
          "An error occurred while generating the reorder list."
        ),
      });
    }
  };

  // Gestionăm salvarea unui material nou
  const handleSaveMaterial = async (material: any) => {
    try {
      if (materialToEdit) {
        await updateMaterial(materialToEdit.id, material);
        toast({
          title: t("inventory.materialUpdated", "Material updated"),
          description: t(
            "inventory.materialUpdatedDesc",
            "The material has been successfully updated."
          ),
        });
        setIsEditDialogOpen(false);
        setMaterialToEdit(null);
      } else {
        await createMaterial(material);
        toast({
          title: t("inventory.materialAdded", "Material added"),
          description: t(
            "inventory.materialAddedDesc",
            "The material has been successfully added."
          ),
        });
        setIsAddDialogOpen(false);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: materialToEdit
          ? t("inventory.updateError", "Update error")
          : t("inventory.addError", "Add error"),
        description: t(
          "inventory.saveErrorDesc",
          "An error occurred while saving the material."
        ),
      });
    }
  };

  // Gestionăm importul de materiale
  const handleImportMaterials = async (materials: any[]) => {
    try {
      for (const material of materials) {
        await createMaterial(material);
      }
      toast({
        title: t("inventory.importSuccess", "Import successful"),
        description: t(
          "inventory.importSuccessDesc",
          "The materials have been successfully imported."
        ),
      });
      setIsImportDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("inventory.importError", "Import error"),
        description: t(
          "inventory.importErrorDesc",
          "An error occurred while importing the materials."
        ),
      });
    }
  };

  // Gestionăm confirmarea suplimentarului
  const handleConfirmSuplimentar = async (materialId: string) => {
    try {
      await confirmSuplimentar(materialId);
      toast({
        title: t("inventory.suplimentarConfirmed", "Supplementary confirmed"),
        description: t(
          "inventory.suplimentarConfirmedDesc",
          "The supplementary has been successfully confirmed."
        ),
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("inventory.confirmError", "Confirmation error"),
        description: t(
          "inventory.confirmErrorDesc",
          "An error occurred while confirming the supplementary."
        ),
      });
    }
  };

  // Gestionăm reîmprospătarea datelor
  const handleRefresh = () => {
    loadMaterials();
    toast({
      title: t("inventory.refreshed", "Refreshed"),
      description: t(
        "inventory.refreshedDesc",
        "The inventory data has been refreshed."
      ),
    });
  };

  if (authLoading || roleLoading) {
    return (
      <motion.div
        className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 },
          },
        }}
      >
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          </div>
          <p className="mt-4 text-slate-400 font-medium">
            {t("common.loading", "Loading...")}
          </p>
        </div>
      </motion.div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              duration: 1,
            },
          },
        }}
      >
        <motion.div
          className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-blue-500/10 blur-3xl"
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
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-3xl"
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
      </motion.div>

      <div className="flex h-screen">
        <ChatBotWidget
          initialMessage={t(
            "inventory.chatbot.welcome",
            "Welcome to the project inventory! How can I help you?"
          )}
          contextType="inventory"
        />

        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 relative z-10"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <motion.h1
                className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent"
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              >
                {t("inventory.projectInventory", "Project-Specific Inventory")}
              </motion.h1>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                    >
                      <Button
                        onClick={() => navigate("/warehouse-inventory")}
                        variant="outline"
                        className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50"
                      >
                        <Warehouse className="h-4 w-4 mr-2" />
                        {t(
                          "inventory.goToWarehouseInventory",
                          "Go to Warehouse Inventory"
                        )}
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {t(
                        "inventory.tooltips.warehouseInventory",
                        "View complete warehouse inventory"
                      )}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
              <Card className="md:col-span-5">
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle>{t("inventory.materials.title", "Materials")}</CardTitle>
                      <CardDescription>
                        {t("inventory.materials.description", "Complete list of materials in the inventory")}
                      </CardDescription>
                    </div>
                    <ProjectSelector
                      selectedProjectId={selectedProjectId}
                      onProjectChange={handleProjectChange}
                    />
                  </div>
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
                        onGenerateReorderList={handleGenerateReorderList}
                        onRefresh={handleRefresh}
                      />
                    </div>

                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex justify-center items-center py-10"
                        >
                          <div className="flex flex-col items-center">
                            <div className="relative">
                              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                              <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                            </div>
                            <p className="mt-4 text-slate-400">
                              {t("inventory.loading", "Loading inventory data...")}
                            </p>
                          </div>
                        </motion.div>
                      ) : materials.length === 0 ? (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center text-slate-400 py-10"
                        >
                          {selectedProjectId ? (
                            t(
                              "inventory.noMaterialsForProject",
                              "No materials found for this project. Add materials to your inventory."
                            )
                          ) : (
                            t(
                              "inventory.selectProject",
                              "Please select a project to view its inventory."
                            )
                          )}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="table"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <MaterialsTable
                            materials={paginatedMaterials}
                            pagination={pagination}
                            sort={sort}
                            onPaginationChange={setPagination}
                            onSortChange={setSort}
                            onEdit={handleEditMaterial}
                            onDelete={handleDeleteMaterial}
                            onConfirmSuplimentar={handleConfirmSuplimentar}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>{t("inventory.statistics.title", "Statistics")}</CardTitle>
                  <CardDescription>
                    {t("inventory.statistics.description", "Inventory statistics and insights")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-slate-400 mb-1">
                        {t("inventory.statistics.totalItems", "Total Items")}
                      </h3>
                      <p className="text-2xl font-bold">{materials.length}</p>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-slate-400 mb-1">
                        {t("inventory.statistics.categories", "Categories")}
                      </h3>
                      <p className="text-2xl font-bold">{categories.length}</p>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-slate-400 mb-1">
                        {t("inventory.statistics.lowStock", "Low Stock Items")}
                      </h3>
                      <p className="text-2xl font-bold">
                        {materials.filter(
                          (m) => m.min_stock_level && m.quantity < m.min_stock_level
                        ).length}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate("/inventory-overview")}
                    >
                      <BarChart4 className="h-4 w-4 mr-2" />
                      {t("inventory.viewDetailedStats", "View Detailed Statistics")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </main>
      </div>

      {/* Dialog pentru adăugarea unui material nou */}
      <MaterialDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleSaveMaterial}
        projectId={selectedProjectId}
        categories={categories}
      />

      {/* Dialog pentru editarea unui material */}
      <MaterialDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        material={materialToEdit}
        onSave={handleSaveMaterial}
        projectId={selectedProjectId}
        categories={categories}
      />

      {/* Dialog pentru confirmarea ștergerii */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title={t("inventory.deleteDialog.title", "Delete Material")}
        description={t(
          "inventory.deleteDialog.description",
          "Are you sure you want to delete this material? This action cannot be undone."
        )}
      />

      {/* Dialog pentru importul de materiale */}
      <ImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={handleImportMaterials}
        projectId={selectedProjectId}
      />

      {/* Dialog pentru lista de reaprovizionare */}
      <ReorderList
        open={isReorderDialogOpen}
        onOpenChange={setIsReorderDialogOpen}
      />
    </div>
  );
};

export default ProjectInventoryPage;
