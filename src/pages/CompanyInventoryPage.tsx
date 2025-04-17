import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { dataLoader } from "@/lib/data-loader";
import { measurePerformance } from "@/lib/performance-optimizer";
import { Search, Package, FileDown } from "lucide-react";
import OptimizedDataTable from "@/components/inventory/optimized-data-table";
import { getColumns, type Material } from "@/components/inventory/columns";
import ExcelJS from "exceljs";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
// ChatBotWidget a fost mutat în pagina de dashboard
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// --- Types ---
type MaterialWithProject = Material & {
  project_id: string | null;
  project_name?: string | null;
};

// --- Component ---
const CompanyInventoryPage: React.FC = () => {
  // Hooks
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { isManager, loading: roleLoading } = useRole();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [inventoryData, setInventoryData] = useState<MaterialWithProject[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [materialToView, setMaterialToView] =
    useState<MaterialWithProject | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Fetch all materials from all projects
  const fetchAllMaterials = useCallback(async () => {
    const startMeasurement = measurePerformance("fetchAllMaterials");
    setLoadingData(true);
    setFetchError(null);

    // Folosim dataLoader pentru încărcarea optimizată a datelor
    const cacheKey = "all_materials";

    try {
      // Încărcăm datele folosind dataLoader
      const data = await dataLoader.loadData<MaterialWithProject>(
        "materials",
        "id, name, dimension, unit, quantity, manufacturer, category, image_url, suplimentar, project_id, cost_per_unit, supplier_id, last_order_date, min_stock_level, max_stock_level, location, notes",
        {},
        cacheKey,
        30 * 60 * 1000, // 30 minute cache
      );

      // Dacă nu avem date în cache, încărcăm de la server
      if (!data || data.length === 0) {
        console.log("No cached data, fetching from server...");

        // Construim query-ul pentru a obține toate materialele
        const { data: materialsData, error } = await supabase
          .from("materials")
          .select(
            "id, name, dimension, unit, quantity, manufacturer, category, image_url, suplimentar, project_id, cost_per_unit, supplier_id, last_order_date, min_stock_level, max_stock_level, location, notes",
          );

        if (error) throw error;

        // Obținem numele proiectelor pentru fiecare material
        const materialsWithProjects = await Promise.all(
          (materialsData || []).map(async (material) => {
            if (material.project_id) {
              const { data: projectData, error: projectError } = await supabase
                .from("projects")
                .select("name")
                .eq("id", material.project_id)
                .single();

              if (!projectError && projectData) {
                return { ...material, project_name: projectData.name };
              }
            }
            return { ...material, project_name: null };
          }),
        );

        setInventoryData(materialsWithProjects);

        // Salvăm datele în cache
        dataLoader.saveData(cacheKey, materialsWithProjects, 30 * 60 * 1000);
      } else {
        console.log("Using cached data");
        setInventoryData(data);
      }
    } catch (error: unknown) {
      console.error("Error fetching materials:", error);
      let msg = error instanceof Error ? error.message : "Unknown fetch error.";
      setFetchError(t("inventory.errors.fetchFailed", { message: msg }));

      // Afișăm o notificare doar dacă nu avem date în cache
      if (inventoryData.length === 0) {
        toast({
          variant: "destructive",
          title: t("inventory.fetchError", "Error loading inventory"),
          description: msg,
        });
      }
    } finally {
      // Asigurăm-ne că starea de încărcare este setată la false
      setLoadingData(false);
      startMeasurement();
    }
  }, [t, inventoryData.length, toast]);

  // Fetch materials on component mount
  useEffect(() => {
    if (user) {
      fetchAllMaterials();
    }
  }, [user, fetchAllMaterials]);

  // Export to Excel
  const handleExportToExcel = () => {
    try {
      // Create a new workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Company Inventory");

      // Add headers
      worksheet.columns = [
        { header: "Name", key: "name", width: 20 },
        { header: "Dimension", key: "dimension", width: 15 },
        { header: "Unit", key: "unit", width: 10 },
        { header: "Quantity", key: "quantity", width: 10 },
        { header: "Manufacturer", key: "manufacturer", width: 20 },
        { header: "Category", key: "category", width: 15 },
        { header: "Project", key: "project", width: 20 },
        { header: "Supplementary", key: "supplementary", width: 15 },
        { header: "Location", key: "location", width: 15 },
        { header: "Cost Per Unit", key: "costPerUnit", width: 15 },
        { header: "Min Stock Level", key: "minStockLevel", width: 15 },
        { header: "Max Stock Level", key: "maxStockLevel", width: 15 },
        { header: "Notes", key: "notes", width: 30 },
      ];

      // Add rows
      inventoryData.forEach((item) => {
        worksheet.addRow({
          name: item.name,
          dimension: item.dimension || "",
          unit: item.unit,
          quantity: item.quantity,
          manufacturer: item.manufacturer || "",
          category: item.category || "",
          project: item.project_name || "No Project",
          supplementary: item.suplimentar || 0,
          location: item.location || "",
          costPerUnit: item.cost_per_unit || "",
          minStockLevel: item.min_stock_level || "",
          maxStockLevel: item.max_stock_level || "",
          notes: item.notes || "",
        });
      });

      // Generate Excel file
      workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "company_inventory.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
      });

      toast({
        title: t("inventory.exportSuccess", "Export Successful"),
        description: t(
          "inventory.exportSuccessDesc",
          "Inventory data has been exported to Excel.",
        ),
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast({
        variant: "destructive",
        title: t("inventory.exportError", "Export Failed"),
        description: t(
          "inventory.exportErrorDesc",
          "Failed to export inventory data.",
        ),
      });
    }
  };

  // --- Columns ---
  const columns = getColumns({
    setMaterialToDelete: () => {}, // Not used in this view
    setMaterialToEdit: () => {}, // Not used in this view
    setMaterialToView: (material) => {
      setMaterialToView(material as MaterialWithProject);
      setIsViewModalOpen(true);
    },
    setMaterialToRequestSuplimentar: () => {}, // Not used in this view
    setMaterialToConfirmSuplimentar: () => {}, // Not used in this view
    t,
  });

  // Add project column
  const columnsWithProject = [
    ...columns.slice(0, 1),
    {
      accessorKey: "project_name",
      header: t("inventory.columns.project", "Project"),
      cell: ({ row }) => {
        const projectName =
          row.getValue("project_name") ||
          t("inventory.noProject", "No Project");
        return <div>{projectName}</div>;
      },
    },
    ...columns.slice(1),
  ];

  // --- Render ---
  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400">
            {t("common.loading", "Loading...")}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      {/* AI Assistant a fost mutat în pagina de dashboard */}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-bold tracking-tight">
              {t("inventory.companyInventory", "Company Inventory")}
            </h1>
            <Button
              onClick={() => (window.location.href = "/inventory-management")}
              variant="outline"
            >
              {t("inventory.goToProjectInventory", "Go to Project Inventory")}
            </Button>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleExportToExcel}>
                <FileDown className="h-4 w-4 mr-2" />
                {t("inventory.exportToExcel", "Export to Excel")}
              </Button>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                type="search"
                placeholder={t(
                  "inventory.searchPlaceholder",
                  "Search materials...",
                )}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full bg-slate-800 border-slate-700 focus:ring-primary"
              />
            </div>
          </div>

          {/* Inventory Table */}
          <Card className="bg-slate-800 border-slate-700 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center">
                <Package className="h-5 w-5 mr-2" />
                {t("inventory.allMaterials", "All Materials")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="flex justify-center items-center py-10">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : fetchError ? (
                <div className="text-center text-red-400 py-10">
                  {fetchError}
                </div>
              ) : inventoryData.length === 0 ? (
                <div className="text-center text-slate-400 py-10">
                  {t(
                    "inventory.noMaterials",
                    "No materials found. Add materials to your inventory.",
                  )}
                </div>
              ) : (
                <OptimizedDataTable
                  columns={columnsWithProject}
                  data={inventoryData}
                  setMaterialToRequestSuplimentar={() => {}}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* View Material Dialog */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t("inventory.viewDialog.title", "Material Details")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "inventory.viewDialog.description",
                "Detailed information about the material.",
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {materialToView && (
              <>
                <div className="col-span-2 flex justify-center">
                  {materialToView.image_url ? (
                    <img
                      src={materialToView.image_url}
                      alt={materialToView.name}
                      className="max-h-48 object-contain rounded-md"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-slate-700 rounded-md flex items-center justify-center text-slate-400">
                      {t("inventory.noImage", "No Image")}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-1">
                    {t("inventory.columns.name", "Name")}
                  </h3>
                  <p className="font-semibold">{materialToView.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-1">
                    {t("inventory.columns.project", "Project")}
                  </h3>
                  <p>
                    {materialToView.project_name ||
                      t("inventory.noProject", "No Project")}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-1">
                    {t("inventory.columns.dimension", "Dimension")}
                  </h3>
                  <p>{materialToView.dimension || "-"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-1">
                    {t("inventory.columns.unit", "Unit")}
                  </h3>
                  <p>{materialToView.unit}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-1">
                    {t("inventory.columns.quantity", "Quantity")}
                  </h3>
                  <p>{materialToView.quantity}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-1">
                    {t("inventory.columns.suplimentar", "Supplementary")}
                  </h3>
                  <p
                    className={
                      materialToView.suplimentar ? "text-yellow-400" : ""
                    }
                  >
                    {materialToView.suplimentar || 0}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-1">
                    {t("inventory.columns.manufacturer", "Manufacturer")}
                  </h3>
                  <p>{materialToView.manufacturer || "-"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-1">
                    {t("inventory.columns.category", "Category")}
                  </h3>
                  <p>{materialToView.category || "-"}</p>
                </div>
                {isManager && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-slate-400 mb-1">
                        {t(
                          "inventory.managerFields.costPerUnit",
                          "Cost Per Unit",
                        )}
                      </h3>
                      <p>{materialToView.cost_per_unit || "-"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-400 mb-1">
                        {t("inventory.managerFields.location", "Location")}
                      </h3>
                      <p>{materialToView.location || "-"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-400 mb-1">
                        {t(
                          "inventory.managerFields.minStockLevel",
                          "Min Stock Level",
                        )}
                      </h3>
                      <p>{materialToView.min_stock_level || "-"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-400 mb-1">
                        {t(
                          "inventory.managerFields.maxStockLevel",
                          "Max Stock Level",
                        )}
                      </h3>
                      <p>{materialToView.max_stock_level || "-"}</p>
                    </div>
                    <div className="col-span-2">
                      <h3 className="text-sm font-medium text-slate-400 mb-1">
                        {t("inventory.managerFields.notes", "Notes")}
                      </h3>
                      <p className="whitespace-pre-wrap">
                        {materialToView.notes || "-"}
                      </p>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setIsViewModalOpen(false)}>
              {t("common.close", "Close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyInventoryPage;
