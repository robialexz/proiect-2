import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { dataLoader } from "@/lib/data-loader";
import { measurePerformance } from "@/lib/performance-optimizer";
import {
  Search,
  Package,
  FileDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Info,
} from "lucide-react";
import OptimizedDataTable from "@/components/inventory/optimized-data-table";
import { getColumns, type Material } from "@/components/inventory/columns";
import ExcelJS from "exceljs";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type MaterialWithProject = Material & {
  project_id: string | null;
  project_name?: string | null;
};

const CompanyInventoryPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { isManager, loading: roleLoading } = useRole();

  const [searchTerm, setSearchTerm] = useState("");
  const [inventoryData, setInventoryData] = useState<MaterialWithProject[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [materialToView, setMaterialToView] =
    useState<MaterialWithProject | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const fetchAllMaterials = useCallback(async () => {
    const startMeasurement = measurePerformance("fetchAllMaterials", () => {});
    setLoadingData(true);
    setFetchError(null);

    const cacheKey = "all_materials";

    try {
      const data = await dataLoader.loadData<MaterialWithProject>(
        "materials",
        "id, name, dimension, unit, quantity, manufacturer, category, image_url, suplimentar, project_id, cost_per_unit, supplier_id, last_order_date, min_stock_level, max_stock_level, location, notes",
        {},
        cacheKey,
        30 * 60 * 1000
      );

      if (!data || data.length === 0) {
        // Removed console statement

        const { data: materialsData, error } = await supabase
          .from("materials")
          .select(
            "id, name, dimension, unit, quantity, manufacturer, category, image_url, suplimentar, project_id, cost_per_unit, supplier_id, last_order_date, min_stock_level, max_stock_level, location, notes"
          );

        if (error) throw error;

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
          })
        );

        setInventoryData(materialsWithProjects);

        dataLoader.saveData(cacheKey, materialsWithProjects, 30 * 60 * 1000);
      } else {
        // Removed console statement
        setInventoryData(data);
      }
    } catch (error: unknown) {
      // Removed console statement
      let msg = error instanceof Error ? error.message : "Unknown fetch error.";
      setFetchError(t("inventory.errors.fetchFailed", { message: msg }));

      if (inventoryData.length === 0) {
        toast({
          variant: "destructive",
          title: t("inventory.fetchError", "Error loading inventory"),
          description: msg,
        });
      }
    } finally {
      setLoadingData(false);
    }
  }, [t, inventoryData.length, toast]);

  useEffect(() => {
    if (user) {
      fetchAllMaterials();
    }
  }, [user, fetchAllMaterials]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return inventoryData;

    return inventoryData.filter(
      (material) =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.project_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventoryData, searchTerm]);

  const handleExportToExcel = async () => {
    setIsExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Company Inventory");

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
          "Inventory data has been exported to Excel."
        ),
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t("inventory.exportError", "Export Failed"),
        description: t(
          "inventory.exportErrorDesc",
          "Failed to export inventory data."
        ),
      });
    } finally {
      setIsExporting(false);
    }
  };

  const columns = getColumns({
    setMaterialToDelete: () => {},
    setMaterialToEdit: () => {},
    setMaterialToView: (material) => {
      setMaterialToView(material as MaterialWithProject);
      setIsViewModalOpen(true);
    },
    setMaterialToRequestSuplimentar: () => {},
    setMaterialToConfirmSuplimentar: () => {},
    t,
  });

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
                {t("inventory.companyInventory", "Company Inventory")}
              </motion.h1>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                    >
                      <Button
                        onClick={() =>
                          (window.location.href = "/inventory-management")
                        }
                        variant="outline"
                        className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50"
                      >
                        {t(
                          "inventory.goToProjectInventory",
                          "Go to Project Inventory"
                        )}
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {t(
                        "inventory.tooltips.projectInventory",
                        "View project-specific inventory"
                      )}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                      >
                        <Button
                          onClick={handleExportToExcel}
                          disabled={isExporting}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        >
                          {isExporting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <FileDown className="h-4 w-4 mr-2" />
                          )}
                          {t("inventory.exportToExcel", "Export to Excel")}
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {t(
                          "inventory.tooltips.export",
                          "Export inventory data to Excel"
                        )}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="search"
                  placeholder={t(
                    "inventory.searchPlaceholder",
                    "Search materials..."
                  )}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full bg-slate-800/50 border-slate-700 focus:ring-primary rounded-full"
                />
              </div>
            </div>

            <Card className="bg-slate-800/50 border-slate-700 shadow-xl backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  {t("inventory.allMaterials", "All Materials")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {loadingData ? (
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
                  ) : fetchError ? (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-center items-center py-10 text-red-400"
                    >
                      <Info className="h-5 w-5 mr-2" />
                      {fetchError}
                    </motion.div>
                  ) : filteredData.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center text-slate-400 py-10"
                    >
                      {searchTerm
                        ? t(
                            "inventory.noSearchResults",
                            "No materials found matching your search."
                          )
                        : t(
                            "inventory.noMaterials",
                            "No materials found. Add materials to your inventory."
                          )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="table"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <OptimizedDataTable
                        columns={columnsWithProject}
                        data={filteredData}
                        setMaterialToRequestSuplimentar={() => {}}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>

      <AnimatePresence>
        {isViewModalOpen && (
          <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
            <DialogContent className="bg-slate-800/95 backdrop-blur-sm border-slate-700 text-white max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {t("inventory.viewDialog.title", "Material Details")}
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  {t(
                    "inventory.viewDialog.description",
                    "Detailed information about the material."
                  )}
                </DialogDescription>
              </DialogHeader>

              <motion.div
                className="grid grid-cols-2 gap-4 py-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
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
                              "Cost Per Unit"
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
                              "Min Stock Level"
                            )}
                          </h3>
                          <p>{materialToView.min_stock_level || "-"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-slate-400 mb-1">
                            {t(
                              "inventory.managerFields.maxStockLevel",
                              "Max Stock Level"
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
              </motion.div>

              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600"
                >
                  {t("common.close", "Close")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompanyInventoryPage;
