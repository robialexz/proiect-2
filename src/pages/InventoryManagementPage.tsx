import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { Navigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, PlusCircle, Search, FolderPlus } from "lucide-react";
import { DataTable } from "@/components/inventory/data-table";
import { getColumns, type Material } from "@/components/inventory/columns";
import * as XLSX from "xlsx";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import SupplierAnnouncementUpload from "@/components/inventory/SupplierAnnouncementUpload";
import SupplierAnnouncementList from "@/components/inventory/SupplierAnnouncementList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Types ---
type Project = { id: string; name: string; created_at: string };
type MaterialWithProject = Material & { project_id: string | null };

// --- Component ---
const InventoryManagementPage: React.FC = () => {
  // Hooks
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { isManager, loading: roleLoading } = useRole();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL params
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [inventoryData, setInventoryData] = useState<MaterialWithProject[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("inventory");
  const [announcementRefreshTrigger, setAnnouncementRefreshTrigger] =
    useState(0);

  // Project State
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    searchParams.get("project"),
  );
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Material Dialog State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    dimension: "",
    unit: "",
    quantity: 0,
    manufacturer: "",
    category: "",
    // Manager fields
    cost_per_unit: "",
    supplier_id: "",
    last_order_date: "",
    min_stock_level: "",
    max_stock_level: "",
    location: "",
    notes: "",
  });

  const [materialToDelete, setMaterialToDelete] =
    useState<MaterialWithProject | null>(null);

  const [materialToEdit, setMaterialToEdit] =
    useState<MaterialWithProject | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editMaterialData, setEditMaterialData] = useState<
    Partial<Omit<Material, "suplimentar" | "project_id">>
  >({});

  const [materialToView, setMaterialToView] =
    useState<MaterialWithProject | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [materialToAdjustSuplimentar, setMaterialToAdjustSuplimentar] =
    useState<MaterialWithProject | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState<number | string>(
    "",
  );

  const [materialToConfirmSuplimentar, setMaterialToConfirmSuplimentar] =
    useState<MaterialWithProject | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmationOption, setConfirmationOption] = useState<
    "full" | "partial" | "none"
  >("full");
  const [confirmedPartialQuantity, setConfirmedPartialQuantity] = useState<
    number | string
  >("");

  // --- Data Fetching ---
  const fetchMaterials = useCallback(async () => {
    if (!selectedProjectId) {
      setInventoryData([]);
      setLoadingData(false);
      return;
    }
    setLoadingData(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .eq("project_id", selectedProjectId);
      if (error) throw error;
      if (data) setInventoryData(data as MaterialWithProject[]);
    } catch (error: unknown) {
      console.error("Error fetching materials:", error);
      let msg = error instanceof Error ? error.message : "Unknown fetch error.";
      setFetchError(t("inventory.errors.fetchFailed", { message: msg }));
    } finally {
      setLoadingData(false);
    }
  }, [selectedProjectId, t]);

  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at");
      if (error) throw error;
      if (data) {
        setProjects(data);
        if (!selectedProjectId && data.length > 0)
          setSelectedProjectId(data[0].id);
        else if (
          selectedProjectId &&
          !data.some((p) => p.id === selectedProjectId)
        )
          setSelectedProjectId(data.length > 0 ? data[0].id : null);
      } else {
        setProjects([]);
        setSelectedProjectId(null);
      }
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      setFetchError(
        t("inventory.errors.fetchProjectsFailed", { message: error.message }),
      );
    } finally {
      setLoadingProjects(false);
    }
  }, [selectedProjectId, t]);

  // --- Handlers ---
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      setFetchError(
        t("inventory.errors.projectNameRequired") ||
          "Project name is required.",
      );
      return;
    }
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert([{ name: newProjectName.trim() }])
        .select()
        .single();
      if (error) throw error;
      if (data) {
        console.log("Project created:", data);
        setIsProjectModalOpen(false);
        setNewProjectName("");
        await fetchProjects();
        setSelectedProjectId(data.id);
        toast({
          title: t("inventory.toasts.projectCreated", "Project Created"),
          description: t("inventory.toasts.projectCreatedDesc", {
            name: data.name,
          }),
        });
      }
    } catch (error: any) {
      console.error("Error creating project:", error);
      setFetchError(
        t("inventory.errors.createProjectFailed", { message: error.message }),
      );
      toast({
        variant: "destructive",
        title: t(
          "inventory.toasts.projectCreateError",
          "Error Creating Project",
        ),
        description: error.message,
      });
    }
  };

  const handleProcessSuplimentarConfirmation = async () => {
    if (!materialToConfirmSuplimentar) return;
    const materialId = materialToConfirmSuplimentar.id;
    const originalSuplimentar = materialToConfirmSuplimentar.suplimentar ?? 0;
    let quantityToAdd = 0;
    let newSuplimentarValue = 0;
    switch (confirmationOption) {
      case "full":
        quantityToAdd = originalSuplimentar;
        newSuplimentarValue = 0;
        break;
      case "partial":
        const pQty =
          typeof confirmedPartialQuantity === "number"
            ? confirmedPartialQuantity
            : parseFloat(confirmedPartialQuantity);
        if (isNaN(pQty) || pQty < 0) {
          setFetchError(
            t("inventory.errors.invalidPartialQuantity") ||
              "Invalid partial quantity",
          );
          return;
        }
        quantityToAdd = pQty;
        newSuplimentarValue = Math.max(0, originalSuplimentar - pQty);
        if (pQty >= originalSuplimentar) newSuplimentarValue = 0;
        break;
      case "none":
        quantityToAdd = 0;
        newSuplimentarValue = 0;
        break;
      default:
        setFetchError(
          t("inventory.errors.invalidConfirmationOption") || "Invalid option",
        );
        return;
    }
    console.log(
      `Invoking confirm-suplimentar: ID=${materialId}, Add=${quantityToAdd}, NewSupl=${newSuplimentarValue}`,
    );
    setFetchError(null);
    setIsConfirmModalOpen(false);
    setMaterialToConfirmSuplimentar(null);
    setConfirmationOption("full");
    setConfirmedPartialQuantity("");
    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        "confirm-suplimentar",
        {
          body: {
            material_id: materialId,
            quantity_to_add: quantityToAdd,
            new_suplimentar_value: newSuplimentarValue,
          },
          method: "POST",
        },
      );
      if (invokeError) {
        let ed = invokeError.message;
        if (
          invokeError.context &&
          typeof invokeError.context.json === "function"
        ) {
          try {
            const fe = await invokeError.context.json();
            ed = fe.details || fe.error || ed;
          } catch (_) {}
        }
        setFetchError(
          t("inventory.errors.confirmFailed", { details: ed }) ||
            `Confirm failed: ${ed}`,
        );
        toast({
          variant: "destructive",
          title: t("inventory.toasts.confirmError", "Confirmation Error"),
          description: ed,
        });
        return;
      }
      if (data?.error) {
        setFetchError(
          t("inventory.errors.confirmFunctionError", {
            details: data.details || data.error,
          }) || `Confirm function error: ${data.details || data.error}`,
        );
        toast({
          variant: "destructive",
          title: t("inventory.toasts.confirmError", "Confirmation Error"),
          description: data.details || data.error,
        });
        return;
      }
      console.log(`Confirm processed for ${materialId}.`);
      fetchMaterials();
      toast({
        title: t(
          "inventory.toasts.confirmSuccess",
          "Supplementary Quantity Confirmed",
        ),
      });
    } catch (error: any) {
      console.error("Error calling confirm-suplimentar:", error);
      setFetchError(
        t("inventory.errors.unexpectedConfirmError", {
          message: error.message,
        }) || `Confirm error: ${error.message}`,
      );
      toast({
        variant: "destructive",
        title: t("inventory.toasts.confirmError", "Confirmation Error"),
        description: error.message,
      });
    }
  };

  const handleDeleteMaterial = async () => {
    if (!materialToDelete) return;
    const materialIdToDelete = materialToDelete.id;
    const materialName = materialToDelete.name;
    setMaterialToDelete(null);
    try {
      console.log(`Invoking delete-material: ID=${materialIdToDelete}`);
      const { data, error: invokeError } = await supabase.functions.invoke(
        "delete-material",
        { body: { material_id: materialIdToDelete }, method: "POST" },
      );
      if (invokeError) {
        let ed = invokeError.message;
        if (
          invokeError.context &&
          typeof invokeError.context.json === "function"
        ) {
          try {
            const fe = await invokeError.context.json();
            ed = fe.details || fe.error || ed;
          } catch (_) {}
        }
        setFetchError(
          t("inventory.errors.deleteFailed", { details: ed }) ||
            `Delete failed: ${ed}`,
        );
        toast({
          variant: "destructive",
          title: t("inventory.toasts.deleteError", "Delete Error"),
          description: ed,
        });
        return;
      }
      if (data?.error) {
        setFetchError(
          t("inventory.errors.deleteFunctionError", {
            details: data.details || data.error,
          }) || `Delete function error: ${data.details || data.error}`,
        );
        toast({
          variant: "destructive",
          title: t("inventory.toasts.deleteError", "Delete Error"),
          description: data.details || data.error,
        });
        return;
      }
      console.log(`Delete processed for ${materialIdToDelete}.`);
      fetchMaterials();
      toast({
        title: t("inventory.toasts.deleteSuccess", "Material Deleted"),
        description: t("inventory.toasts.deleteSuccessDesc", {
          name: materialName,
        }),
      });
    } catch (error: any) {
      console.error("Error calling delete function:", error);
      setFetchError(
        t("inventory.errors.unexpectedDeleteError", {
          message: error.message,
        }) || `Delete error: ${error.message}`,
      );
      toast({
        variant: "destructive",
        title: t("inventory.toasts.deleteError", "Delete Error"),
        description: error.message,
      });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedProjectId) {
      if (!selectedProjectId)
        setFetchError(
          t("inventory.errors.selectProjectFirst") ||
            "Please select a project before uploading.",
        );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFetchError(null);
    console.log("Processing file:", file.name);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const fileData = e.target?.result;
        if (!fileData) throw new Error("Failed to read file data.");
        const workbook = XLSX.read(fileData, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (jsonData.length < 2) {
          console.warn("Excel file is empty or has no data rows.");
          return;
        }
        const header = jsonData[0] as string[];
        const rows = jsonData.slice(1);
        const materialsToInsert = rows
          .map((row: any) => ({
            project_id: selectedProjectId,
            name: String(row[0] ?? ""),
            dimension: String(row[1] ?? null),
            unit: String(row[2] ?? ""),
            quantity: parseFloat(String(row[3] ?? "0")),
            manufacturer: String(row[4] ?? null),
            category: String(row[5] ?? null),
            suplimentar: parseFloat(String(row[6] ?? "0")),
          }))
          .filter(
            (material) =>
              material.name &&
              material.unit &&
              !isNaN(material.quantity) &&
              material.project_id,
          );
        if (materialsToInsert.length === 0) {
          console.warn("No valid materials found in the Excel file.");
          return;
        }
        console.log("Parsed materials for upload:", materialsToInsert);
        const { error: insertError } = await supabase
          .from("materials")
          .insert(materialsToInsert);
        if (insertError) throw insertError;
        console.log(
          `${materialsToInsert.length} materials uploaded successfully.`,
        );
        fetchMaterials();
        toast({
          title: t("inventory.toasts.uploadSuccess", "Upload Successful"),
          description: t("inventory.toasts.uploadSuccessDesc", {
            count: materialsToInsert.length,
          }),
        });
      } catch (error: any) {
        console.error("Error processing Excel file:", error);
        setFetchError(
          t("inventory.errors.uploadFailed", { message: error.message }) ||
            `Failed to process Excel file: ${error.message}`,
        );
        toast({
          variant: "destructive",
          title: t("inventory.toasts.uploadError", "Upload Error"),
          description: error.message,
        });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      setFetchError(
        t("inventory.errors.fileReadError", "Error reading file.") ||
          "Error reading file.",
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsArrayBuffer(file);
  };

  const handleNewMaterialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    setNewMaterial((prev) => ({
      ...prev,
      [id]: type === "number" ? (value === "" ? "" : parseFloat(value)) : value,
    }));
  };

  const handleSaveMaterial = async () => {
    if (!selectedProjectId) {
      setFetchError(
        t("inventory.errors.selectProjectFirst") ||
          "Please select a project before adding materials.",
      );
      return;
    }
    const quantityValue = newMaterial.quantity;
    if (
      !newMaterial.name ||
      !newMaterial.unit ||
      typeof quantityValue !== "number" ||
      isNaN(quantityValue) ||
      quantityValue < 0
    ) {
      setFetchError(
        t("inventory.errors.invalidSaveData") ||
          "Name, Unit, and valid Quantity required.",
      );
      return;
    }
    setFetchError(null);
    try {
      // Process manager fields
      const cost =
        typeof newMaterial.cost_per_unit === "string" &&
        newMaterial.cost_per_unit
          ? parseFloat(newMaterial.cost_per_unit)
          : null;
      const minStock =
        typeof newMaterial.min_stock_level === "string" &&
        newMaterial.min_stock_level
          ? parseFloat(newMaterial.min_stock_level)
          : null;
      const maxStock =
        typeof newMaterial.max_stock_level === "string" &&
        newMaterial.max_stock_level
          ? parseFloat(newMaterial.max_stock_level)
          : null;

      const materialToInsert = {
        project_id: selectedProjectId,
        name: newMaterial.name,
        dimension: newMaterial.dimension || null,
        unit: newMaterial.unit,
        quantity: quantityValue,
        manufacturer: newMaterial.manufacturer || null,
        category: newMaterial.category || null,
        suplimentar: 0,
        // Manager fields
        cost_per_unit: cost,
        supplier_id: newMaterial.supplier_id || null,
        last_order_date: newMaterial.last_order_date || null,
        min_stock_level: minStock,
        max_stock_level: maxStock,
        location: newMaterial.location || null,
        notes: newMaterial.notes || null,
      };

      console.log("Inserting data with project ID:", materialToInsert);
      const { data, error } = await supabase
        .from("materials")
        .insert([materialToInsert])
        .select()
        .single();
      if (error) throw error;
      if (data) {
        console.log("Material saved successfully:", data);
        fetchMaterials();
        setNewMaterial({
          name: "",
          dimension: "",
          unit: "",
          quantity: 0,
          manufacturer: "",
          category: "",
          cost_per_unit: "",
          supplier_id: "",
          last_order_date: "",
          min_stock_level: "",
          max_stock_level: "",
          location: "",
          notes: "",
        });
        setIsAddModalOpen(false);
        toast({
          title: t("inventory.toasts.addSuccess", "Material Added"),
          description: t("inventory.toasts.addSuccessDesc", {
            name: data.name,
          }),
        });
      } else {
        console.warn("Save material returned no data.");
        fetchMaterials();
        setIsAddModalOpen(false);
      }
    } catch (error: any) {
      console.error("Error saving material:", error);
      setFetchError(
        t("inventory.errors.saveFailed", { message: error.message }) ||
          `Failed to save material: ${error.message}`,
      );
      toast({
        variant: "destructive",
        title: t("inventory.toasts.addError", "Error Adding Material"),
        description: error.message,
      });
    }
  };

  const handleAdjustSuplimentar = async (adjustmentSign: number) => {
    if (
      !materialToAdjustSuplimentar ||
      typeof adjustmentQuantity !== "number" ||
      isNaN(adjustmentQuantity) ||
      adjustmentQuantity <= 0
    ) {
      setFetchError(
        t("inventory.errors.invalidAdjustmentQuantity") ||
          "Invalid quantity entered for adjustment.",
      );
      return;
    }
    const materialId = materialToAdjustSuplimentar.id;
    const quantityToAdjust = adjustmentQuantity * adjustmentSign;
    console.log(
      `Invoking adjust-suplimentar: ID=${materialId}, Adjust=${quantityToAdjust}`,
    );
    setFetchError(null);
    setIsAdjustModalOpen(false);
    setMaterialToAdjustSuplimentar(null);
    setAdjustmentQuantity("");
    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        "adjust-suplimentar",
        {
          body: { material_id: materialId, adjustment_value: quantityToAdjust },
          method: "POST",
        },
      );
      if (invokeError) {
        let ed = invokeError.message;
        if (
          invokeError.context &&
          typeof invokeError.context.json === "function"
        ) {
          try {
            const fe = await invokeError.context.json();
            ed = fe.details || fe.error || ed;
          } catch (_) {}
        }
        setFetchError(
          t("inventory.errors.adjustFailed", { details: ed }) ||
            `Adjust failed: ${ed}`,
        );
        toast({
          variant: "destructive",
          title: t("inventory.toasts.adjustError", "Adjustment Error"),
          description: ed,
        });
        return;
      }
      if (data?.error) {
        setFetchError(
          t("inventory.errors.adjustFunctionError", {
            details: data.details || data.error,
          }) || `Adjust function error: ${data.details || data.error}`,
        );
        toast({
          variant: "destructive",
          title: t("inventory.toasts.adjustError", "Adjustment Error"),
          description: data.details || data.error,
        });
        return;
      }
      console.log(`Adjust processed for ${materialId}.`);
      fetchMaterials();
      toast({
        title: t(
          "inventory.toasts.adjustSuccess",
          "Supplementary Quantity Adjusted",
        ),
      });
    } catch (error: any) {
      console.error("Error calling adjust-suplimentar:", error);
      setFetchError(
        t("inventory.errors.unexpectedAdjustError", {
          message: error.message,
        }) || `Adjust error: ${error.message}`,
      );
      toast({
        variant: "destructive",
        title: t("inventory.toasts.adjustError", "Adjustment Error"),
        description: error.message,
      });
    }
  };

  const handleEditMaterialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    setEditMaterialData((prev) => ({
      ...prev,
      [id]: type === "number" ? (value === "" ? "" : parseFloat(value)) : value,
    }));
  };

  const handleUpdateMaterial = async () => {
    if (
      !materialToEdit ||
      !editMaterialData.name ||
      !editMaterialData.unit ||
      isNaN(editMaterialData.quantity ?? NaN) ||
      (editMaterialData.quantity ?? -1) < 0
    ) {
      setFetchError(
        t("inventory.errors.invalidUpdateData") || "Invalid data for update.",
      );
      return;
    }
    setFetchError(null);
    try {
      // Process manager fields
      const cost =
        typeof editMaterialData.cost_per_unit === "string" &&
        editMaterialData.cost_per_unit
          ? parseFloat(editMaterialData.cost_per_unit as string)
          : editMaterialData.cost_per_unit;
      const minStock =
        typeof editMaterialData.min_stock_level === "string" &&
        editMaterialData.min_stock_level
          ? parseFloat(editMaterialData.min_stock_level as string)
          : editMaterialData.min_stock_level;
      const maxStock =
        typeof editMaterialData.max_stock_level === "string" &&
        editMaterialData.max_stock_level
          ? parseFloat(editMaterialData.max_stock_level as string)
          : editMaterialData.max_stock_level;

      const { data, error } = await supabase
        .from("materials")
        .update({
          name: editMaterialData.name,
          dimension: editMaterialData.dimension || null,
          unit: editMaterialData.unit,
          quantity: editMaterialData.quantity,
          manufacturer: editMaterialData.manufacturer || null,
          category: editMaterialData.category || null,
          // Manager fields
          cost_per_unit: cost || null,
          supplier_id: editMaterialData.supplier_id || null,
          last_order_date: editMaterialData.last_order_date || null,
          min_stock_level: minStock || null,
          max_stock_level: maxStock || null,
          location: editMaterialData.location || null,
          notes: editMaterialData.notes || null,
        })
        .match({ id: materialToEdit.id })
        .select()
        .single();

      if (error) throw error;
      console.log("Supabase update result for edit:", { data, error });
      if (data) {
        console.log("Material updated successfully:", data);
        fetchMaterials();
        setIsEditModalOpen(false);
        toast({
          title: t("inventory.toasts.updateSuccess", "Material Updated"),
          description: t("inventory.toasts.updateSuccessDesc", {
            name: data.name,
          }),
        });
      } else {
        console.warn("Update material returned no data.");
        fetchMaterials();
        setIsEditModalOpen(false);
      }
    } catch (error: any) {
      console.error("Error updating material:", error);
      setFetchError(
        t("inventory.errors.updateFailed", { message: error.message }) ||
          `Failed to update material: ${error.message}`,
      );
      toast({
        variant: "destructive",
        title: t("inventory.toasts.updateError", "Error Updating Material"),
        description: error.message,
      });
    }
  };

  // --- Use Effects ---
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  useEffect(() => {
    if (user && selectedProjectId) {
      fetchMaterials();
      // Update URL with project ID
      setSearchParams({ project: selectedProjectId });
    } else if (!authLoading) {
      setInventoryData([]);
      setLoadingData(false);
    }
  }, [user, authLoading, fetchMaterials, selectedProjectId]);
  useEffect(() => {
    if (materialToAdjustSuplimentar) setIsAdjustModalOpen(true);
    else {
      setIsAdjustModalOpen(false);
      setAdjustmentQuantity("");
    }
  }, [materialToAdjustSuplimentar]);
  useEffect(() => {
    if (materialToConfirmSuplimentar) {
      setIsConfirmModalOpen(true);
      setConfirmationOption("full");
      setConfirmedPartialQuantity("");
    } else {
      setIsConfirmModalOpen(false);
    }
  }, [materialToConfirmSuplimentar]);
  useEffect(() => {
    if (materialToEdit) {
      setEditMaterialData({
        name: materialToEdit.name,
        dimension: materialToEdit.dimension ?? "",
        unit: materialToEdit.unit,
        quantity: materialToEdit.quantity,
        manufacturer: materialToEdit.manufacturer ?? "",
        category: materialToEdit.category ?? "",
        // Manager fields
        cost_per_unit: materialToEdit.cost_per_unit ?? "",
        supplier_id: materialToEdit.supplier_id ?? "",
        last_order_date: materialToEdit.last_order_date ?? "",
        min_stock_level: materialToEdit.min_stock_level ?? "",
        max_stock_level: materialToEdit.max_stock_level ?? "",
        location: materialToEdit.location ?? "",
        notes: materialToEdit.notes ?? "",
      });
      setIsEditModalOpen(true);
    }
  }, [materialToEdit]);
  useEffect(() => {
    if (!isEditModalOpen) setMaterialToEdit(null);
  }, [isEditModalOpen]);
  useEffect(() => {
    if (!isViewModalOpen) setMaterialToView(null);
  }, [isViewModalOpen]);

  // --- Loading & Auth ---
  if (authLoading || roleLoading || (loadingProjects && user)) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white">{t("common.loading")}</div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" />;
  }

  // --- Columns ---
  const columns = getColumns({
    setMaterialToDelete,
    setMaterialToEdit,
    setMaterialToView,
    setMaterialToRequestSuplimentar: setMaterialToAdjustSuplimentar,
    setMaterialToConfirmSuplimentar,
    t,
  });

  // --- Render ---
  return (
    <div className="flex h-screen bg-slate-900 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {t("inventory.pageTitle", "Inventory Management")}
            </h1>
            <div className="flex items-center gap-4">
              <Select
                value={selectedProjectId ?? ""}
                onValueChange={(value) => setSelectedProjectId(value || null)}
              >
                <SelectTrigger className="w-[200px] bg-slate-800 border-slate-700 h-9">
                  {" "}
                  <SelectValue
                    placeholder={t("inventory.selectProject", "Select Project")}
                  />{" "}
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {projects.map((project) => (
                    <SelectItem
                      key={project.id}
                      value={project.id}
                      className="focus:bg-slate-700"
                    >
                      {project.name}
                    </SelectItem>
                  ))}
                  {projects.length === 0 && (
                    <SelectItem value="no-projects" disabled>
                      {t("inventory.noProjects", "No projects yet")}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Dialog
                open={isProjectModalOpen}
                onOpenChange={(open) => {
                  setIsProjectModalOpen(open);
                  if (!open) setNewProjectName("");
                }}
              >
                <DialogTrigger asChild>
                  {" "}
                  <Button
                    variant="outline"
                    size="icon"
                    title={
                      t("inventory.createNewProject", "Create New Project") ||
                      ""
                    }
                  >
                    {" "}
                    <FolderPlus className="h-4 w-4" />{" "}
                  </Button>{" "}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700 text-white">
                  <DialogHeader>
                    {" "}
                    <DialogTitle>
                      {t(
                        "inventory.newProjectDialog.title",
                        "Create New Project",
                      )}
                    </DialogTitle>{" "}
                    <DialogDescription>
                      {t(
                        "inventory.newProjectDialog.description",
                        "Enter a name for the new project.",
                      )}
                    </DialogDescription>{" "}
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {" "}
                    <div className="grid grid-cols-4 items-center gap-4">
                      {" "}
                      <Label
                        htmlFor="projectName"
                        className="text-right text-slate-400"
                      >
                        {t("inventory.form.name", "Name")}*
                      </Label>{" "}
                      <Input
                        id="projectName"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder={t(
                          "inventory.newProjectDialog.namePlaceholder",
                          "Project Name",
                        )}
                        className="col-span-3 bg-slate-700 border-slate-600"
                      />{" "}
                    </div>{" "}
                  </div>
                  <DialogFooter>
                    {" "}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsProjectModalOpen(false)}
                    >
                      {t("common.cancel", "Cancel")}
                    </Button>{" "}
                    <Button type="submit" onClick={handleCreateProject}>
                      {t("common.create", "Create Project")}
                    </Button>{" "}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx, .xls, .csv"
                  style={{ display: "none" }}
                />
                {isManager && (
                  <Button
                    onClick={handleUploadClick}
                    disabled={!selectedProjectId}
                  >
                    <Upload className="h-4 w-4 mr-2" />{" "}
                    {t("inventory.uploadExcel", "Upload Excel")}
                  </Button>
                )}
                <Dialog
                  open={isAddModalOpen}
                  onOpenChange={(open) => {
                    setIsAddModalOpen(open);
                    if (!open)
                      setNewMaterial({
                        name: "",
                        dimension: "",
                        unit: "",
                        quantity: 0,
                        manufacturer: "",
                        category: "",
                      });
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant="secondary" disabled={!selectedProjectId}>
                      <PlusCircle className="h-4 w-4 mr-2" />{" "}
                      {t("inventory.addMaterial", "Add Material")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] bg-slate-800 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {t("inventory.addDialog.title", "Add New Material")}
                      </DialogTitle>
                      <DialogDescription>
                        {t(
                          "inventory.addDialog.description",
                          "Enter details. Click save when done.",
                        )}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor="name"
                          className="text-right text-slate-400"
                        >
                          {t("inventory.form.name", "Name")}*
                        </Label>
                        <Input
                          id="name"
                          value={newMaterial.name}
                          onChange={handleNewMaterialChange}
                          placeholder={t(
                            "inventory.form.namePlaceholder",
                            "Material Name",
                          )}
                          className="col-span-3 bg-slate-700 border-slate-600"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor="dimension"
                          className="text-right text-slate-400"
                        >
                          {t("inventory.form.dimension", "Dimension")}
                        </Label>
                        <Input
                          id="dimension"
                          value={newMaterial.dimension}
                          onChange={handleNewMaterialChange}
                          placeholder={t(
                            "inventory.form.dimensionPlaceholder",
                            "e.g., 100x50, DN25",
                          )}
                          className="col-span-3 bg-slate-700 border-slate-600"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor="unit"
                          className="text-right text-slate-400"
                        >
                          {t("inventory.form.unit", "Unit")}*
                        </Label>
                        <Input
                          id="unit"
                          value={newMaterial.unit}
                          onChange={handleNewMaterialChange}
                          placeholder={t(
                            "inventory.form.unitPlaceholder",
                            "e.g., buc, m, kg",
                          )}
                          className="col-span-3 bg-slate-700 border-slate-600"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor="quantity"
                          className="text-right text-slate-400"
                        >
                          {t("inventory.form.quantity", "Quantity")}*
                        </Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={newMaterial.quantity}
                          onChange={handleNewMaterialChange}
                          placeholder="0"
                          className="col-span-3 bg-slate-700 border-slate-600"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor="manufacturer"
                          className="text-right text-slate-400"
                        >
                          {t("inventory.form.manufacturer", "Manufacturer")}
                        </Label>
                        <Input
                          id="manufacturer"
                          value={newMaterial.manufacturer}
                          onChange={handleNewMaterialChange}
                          placeholder={t(
                            "inventory.form.manufacturerPlaceholder",
                            "Manufacturer Name",
                          )}
                          className="col-span-3 bg-slate-700 border-slate-600"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor="category"
                          className="text-right text-slate-400"
                        >
                          {t("inventory.form.category", "Category")}
                        </Label>
                        <Input
                          id="category"
                          value={newMaterial.category}
                          onChange={handleNewMaterialChange}
                          placeholder={t(
                            "inventory.form.categoryPlaceholder",
                            "e.g., HVAC, Electric",
                          )}
                          className="col-span-3 bg-slate-700 border-slate-600"
                        />
                      </div>

                      {/* Import and use ManagerFields component */}
                      <div className="col-span-4">
                        {React.createElement(
                          require("@/components/inventory/ManagerFields")
                            .default,
                          {
                            data: newMaterial,
                            onChange: handleNewMaterialChange,
                          },
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddModalOpen(false)}
                      >
                        {t("common.cancel", "Cancel")}
                      </Button>
                      <Button type="submit" onClick={handleSaveMaterial}>
                        {t("common.save", "Save Material")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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

            {/* Tabs for Inventory and Supplier Announcements */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 mb-6 bg-slate-800">
                <TabsTrigger
                  value="inventory"
                  className="data-[state=active]:bg-slate-700"
                >
                  <Package className="h-4 w-4 mr-2" />
                  {t("inventory.tabs.inventory", "Inventory")}
                </TabsTrigger>
                <TabsTrigger
                  value="announcements"
                  className="data-[state=active]:bg-slate-700"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  {t("inventory.tabs.announcements", "Supplier Announcements")}
                </TabsTrigger>
              </TabsList>

              {/* Inventory Tab */}
              <TabsContent value="inventory" className="space-y-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle>
                      {t("inventory.overviewTitle", "Inventory Overview")}{" "}
                      {selectedProjectId &&
                      projects.find((p) => p.id === selectedProjectId)
                        ? `- ${projects.find((p) => p.id === selectedProjectId)?.name}`
                        : ""}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {fetchError && (
                      <div className="mb-4 p-4 bg-red-900 border border-red-700 text-red-300 rounded-md">
                        {fetchError}
                      </div>
                    )}
                    {selectedProjectId ? (
                      <DataTable
                        columns={columns}
                        data={inventoryData}
                        setMaterialToRequestSuplimentar={
                          setMaterialToAdjustSuplimentar
                        }
                      />
                    ) : (
                      <p className="text-center text-slate-400 py-10">
                        {t(
                          "inventory.selectProjectPrompt",
                          "Please select or create a project to view inventory.",
                        )}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Supplier Announcements Tab */}
              <TabsContent value="announcements" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Upload Section */}
                  <SupplierAnnouncementUpload
                    projectId={selectedProjectId}
                    onUploadSuccess={() =>
                      setAnnouncementRefreshTrigger((prev) => prev + 1)
                    }
                  />

                  {/* Announcements List */}
                  <SupplierAnnouncementList
                    projectId={selectedProjectId}
                    refreshTrigger={announcementRefreshTrigger}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>

        {/* --- Dialogs --- */}
        {/* Delete Confirmation */}
        <AlertDialog
          open={!!materialToDelete}
          onOpenChange={(open) => !open && setMaterialToDelete(null)}
        >
          <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
            {" "}
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("inventory.deleteDialog.title", "Are you absolutely sure?")}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                {t(
                  "inventory.deleteDialog.description",
                  "This action cannot be undone. This will permanently delete the material",
                )}{" "}
                <span className="font-semibold text-slate-300">
                  {materialToDelete?.name}
                </span>
                .
              </AlertDialogDescription>
            </AlertDialogHeader>{" "}
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setMaterialToDelete(null)}
                className="hover:bg-slate-700"
              >
                {t("common.cancel", "Cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteMaterial}
                className="bg-red-600 hover:bg-red-700"
              >
                {t("common.delete", "Delete")}
              </AlertDialogAction>
            </AlertDialogFooter>{" "}
          </AlertDialogContent>
        </AlertDialog>

        {/* Adjust Suplimentar */}
        <Dialog
          open={isAdjustModalOpen}
          onOpenChange={(open) => {
            setIsAdjustModalOpen(open);
            if (!open) setMaterialToAdjustSuplimentar(null);
          }}
        >
          <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700 text-white">
            {" "}
            <DialogHeader>
              {" "}
              <DialogTitle>
                {t(
                  "inventory.adjustDialog.title",
                  "Adjust Supplementary Quantity",
                )}
              </DialogTitle>{" "}
              <DialogDescription>
                {" "}
                {t(
                  "inventory.adjustDialog.description",
                  "Adjust supplementary quantity for {{materialName}}. Current: {{currentValue}}",
                  {
                    materialName: materialToAdjustSuplimentar?.name,
                    currentValue: materialToAdjustSuplimentar?.suplimentar ?? 0,
                  },
                )}{" "}
              </DialogDescription>{" "}
            </DialogHeader>{" "}
            <div className="grid gap-4 py-4">
              {" "}
              <div className="grid grid-cols-4 items-center gap-4">
                {" "}
                <Label
                  htmlFor="adjustQuantity"
                  className="text-right text-slate-400"
                >
                  {t("inventory.form.quantity", "Quantity")}*
                </Label>{" "}
                <Input
                  id="adjustQuantity"
                  type="number"
                  value={adjustmentQuantity}
                  onChange={(e) =>
                    setAdjustmentQuantity(
                      e.target.value === "" ? "" : parseFloat(e.target.value),
                    )
                  }
                  placeholder={t(
                    "inventory.adjustDialog.quantityPlaceholder",
                    "Enter quantity",
                  )}
                  className="col-span-3 bg-slate-700 border-slate-600"
                />{" "}
              </div>{" "}
            </div>{" "}
            <DialogFooter className="sm:justify-between">
              {" "}
              <Button
                type="button"
                variant="outline"
                onClick={() => setMaterialToAdjustSuplimentar(null)}
              >
                {t("common.cancel", "Cancel")}
              </Button>{" "}
              <div className="flex gap-2">
                {" "}
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleAdjustSuplimentar(-1)}
                >
                  {t("inventory.adjustDialog.subtract", "Subtract")}
                </Button>{" "}
                <Button
                  type="button"
                  onClick={() => handleAdjustSuplimentar(1)}
                >
                  {t("inventory.adjustDialog.add", "Add")}
                </Button>{" "}
              </div>{" "}
            </DialogFooter>{" "}
          </DialogContent>
        </Dialog>

        {/* Confirm Suplimentar */}
        <Dialog
          open={isConfirmModalOpen}
          onOpenChange={(open) => {
            setIsConfirmModalOpen(open);
            if (!open) setMaterialToConfirmSuplimentar(null);
          }}
        >
          <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700 text-white">
            {" "}
            <DialogHeader>
              {" "}
              <DialogTitle>
                {t(
                  "inventory.confirmDialog.title",
                  "Confirm Supplementary Quantity",
                )}
              </DialogTitle>{" "}
              <DialogDescription>
                {" "}
                {t(
                  "inventory.confirmDialog.description",
                  "Confirm procurement status for {{materialName}} (Requested: {{requestedValue}}).",
                  {
                    materialName: materialToConfirmSuplimentar?.name,
                    requestedValue:
                      materialToConfirmSuplimentar?.suplimentar ?? 0,
                  },
                )}{" "}
              </DialogDescription>{" "}
            </DialogHeader>{" "}
            <div className="py-4 space-y-4">
              {" "}
              <RadioGroup
                value={confirmationOption}
                onValueChange={(value: "full" | "partial" | "none") =>
                  setConfirmationOption(value)
                }
              >
                {" "}
                <div className="flex items-center space-x-2">
                  {" "}
                  <RadioGroupItem value="full" id="r-full" />{" "}
                  <Label htmlFor="r-full">
                    {t(
                      "inventory.confirmDialog.optionFull",
                      "Fulfilled entirely ({{value}})",
                      { value: materialToConfirmSuplimentar?.suplimentar ?? 0 },
                    )}
                  </Label>{" "}
                </div>{" "}
                <div className="flex items-center space-x-2">
                  {" "}
                  <RadioGroupItem value="partial" id="r-partial" />{" "}
                  <Label htmlFor="r-partial">
                    {t(
                      "inventory.confirmDialog.optionPartial",
                      "Partially fulfilled",
                    )}
                  </Label>{" "}
                </div>{" "}
                {confirmationOption === "partial" && (
                  <div className="grid grid-cols-4 items-center gap-4 pl-6">
                    {" "}
                    <Label
                      htmlFor="partialQuantity"
                      className="text-right text-slate-400 col-span-1"
                    >
                      {t("inventory.confirmDialog.receivedLabel", "Received:")}
                    </Label>{" "}
                    <Input
                      id="partialQuantity"
                      type="number"
                      value={confirmedPartialQuantity}
                      onChange={(e) =>
                        setConfirmedPartialQuantity(
                          e.target.value === ""
                            ? ""
                            : parseFloat(e.target.value),
                        )
                      }
                      placeholder={t(
                        "inventory.confirmDialog.quantityPlaceholder",
                        "Quantity",
                      )}
                      className="col-span-3 bg-slate-700 border-slate-600 h-8"
                    />{" "}
                  </div>
                )}{" "}
                <div className="flex items-center space-x-2">
                  {" "}
                  <RadioGroupItem value="none" id="r-none" />{" "}
                  <Label htmlFor="r-none">
                    {t(
                      "inventory.confirmDialog.optionNone",
                      "Could not procure",
                    )}
                  </Label>{" "}
                </div>{" "}
              </RadioGroup>{" "}
            </div>{" "}
            <DialogFooter>
              {" "}
              <Button
                type="button"
                variant="outline"
                onClick={() => setMaterialToConfirmSuplimentar(null)}
              >
                {t("common.cancel", "Cancel")}
              </Button>{" "}
              <Button
                type="button"
                onClick={handleProcessSuplimentarConfirmation}
              >
                {t("common.confirm", "Confirm")}
              </Button>{" "}
            </DialogFooter>{" "}
          </DialogContent>
        </Dialog>

        {/* Edit Material */}
        <Dialog
          open={isEditModalOpen}
          onOpenChange={(open) => {
            setIsEditModalOpen(open);
            if (!open) setMaterialToEdit(null);
          }}
        >
          <DialogContent className="sm:max-w-[600px] bg-slate-800 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
            {" "}
            <DialogHeader>
              {" "}
              <DialogTitle>
                {t("inventory.editDialog.title", "Edit Material")}
              </DialogTitle>{" "}
              <DialogDescription>
                {t(
                  "inventory.editDialog.description",
                  "Update details. Click save when done.",
                )}
              </DialogDescription>{" "}
            </DialogHeader>{" "}
            <div className="grid gap-4 py-4">
              {" "}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right text-slate-400">
                  {t("inventory.form.name", "Name")}*
                </Label>
                <Input
                  id="name"
                  value={editMaterialData.name ?? ""}
                  onChange={handleEditMaterialChange}
                  placeholder={t(
                    "inventory.form.namePlaceholder",
                    "Material Name",
                  )}
                  className="col-span-3 bg-slate-700 border-slate-600"
                />
              </div>{" "}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="dimension"
                  className="text-right text-slate-400"
                >
                  {t("inventory.form.dimension", "Dimension")}
                </Label>
                <Input
                  id="dimension"
                  value={editMaterialData.dimension ?? ""}
                  onChange={handleEditMaterialChange}
                  placeholder={t(
                    "inventory.form.dimensionPlaceholder",
                    "e.g., 100x50, DN25",
                  )}
                  className="col-span-3 bg-slate-700 border-slate-600"
                />
              </div>{" "}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unit" className="text-right text-slate-400">
                  {t("inventory.form.unit", "Unit")}*
                </Label>
                <Input
                  id="unit"
                  value={editMaterialData.unit ?? ""}
                  onChange={handleEditMaterialChange}
                  placeholder={t(
                    "inventory.form.unitPlaceholder",
                    "e.g., buc, m, kg",
                  )}
                  className="col-span-3 bg-slate-700 border-slate-600"
                />
              </div>{" "}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right text-slate-400">
                  {t("inventory.form.quantity", "Quantity")}*
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={editMaterialData.quantity ?? 0}
                  onChange={handleEditMaterialChange}
                  placeholder="0"
                  className="col-span-3 bg-slate-700 border-slate-600"
                />
              </div>{" "}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="manufacturer"
                  className="text-right text-slate-400"
                >
                  {t("inventory.form.manufacturer", "Manufacturer")}
                </Label>
                <Input
                  id="manufacturer"
                  value={editMaterialData.manufacturer ?? ""}
                  onChange={handleEditMaterialChange}
                  placeholder={t(
                    "inventory.form.manufacturerPlaceholder",
                    "Manufacturer Name",
                  )}
                  className="col-span-3 bg-slate-700 border-slate-600"
                />
              </div>{" "}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right text-slate-400">
                  {t("inventory.form.category", "Category")}
                </Label>
                <Input
                  id="category"
                  value={editMaterialData.category ?? ""}
                  onChange={handleEditMaterialChange}
                  placeholder={t(
                    "inventory.form.categoryPlaceholder",
                    "e.g., HVAC, Electric",
                  )}
                  className="col-span-3 bg-slate-700 border-slate-600"
                />
              </div>
              {/* Import and use ManagerFields component */}
              <div className="col-span-4">
                {React.createElement(
                  require("@/components/inventory/ManagerFields").default,
                  {
                    data: editMaterialData,
                    onChange: handleEditMaterialChange,
                  },
                )}
              </div>
            </div>{" "}
            <DialogFooter>
              {" "}
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                {t("common.cancel", "Cancel")}
              </Button>{" "}
              <Button type="submit" onClick={handleUpdateMaterial}>
                {t("common.save", "Save Changes")}
              </Button>{" "}
            </DialogFooter>{" "}
          </DialogContent>
        </Dialog>

        {/* View Dialog (Add if needed) */}
        {/* <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}> ... </Dialog> */}
      </div>
    </div>
  );
};

export default InventoryManagementPage;
