import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/services/api/supabase-client";
import { useToast } from "@/components/ui/use-toast";
import {
  SupplierMaterial,
  SupplierMaterialWithDetails,
  CreateSupplierMaterialInput,
  UpdateSupplierMaterialInput,
} from "@/models/supplier-material.model";

export const useSupplierMaterials = (supplierId?: string) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  // Folosim clientul Supabase direct

  const [materials, setMaterials] = useState<SupplierMaterialWithDetails[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<
    SupplierMaterialWithDetails[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<{
    is_preferred?: boolean;
    searchTerm?: string;
  }>({});

  const [sort, setSort] = useState<{
    field: keyof SupplierMaterial;
    direction: "asc" | "desc";
  }>({
    field: "created_at",
    direction: "desc",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Funcție pentru încărcarea materialelor furnizate
  const loadMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from("supplier_materials").select(`
          *,
          suppliers:supplier_id (name),
          materials:material_id (name, unit, category)
        `);

      // Aplicăm filtrele
      if (supplierId) {
        query = query.eq("supplier_id", supplierId);
      }

      if (filters.is_preferred !== undefined) {
        query = query.eq("is_preferred", filters.is_preferred);
      }

      // Aplicăm sortarea
      query = query.order(sort.field, { ascending: sort.direction === "asc" });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Transformăm datele pentru a include informațiile suplimentare
      const transformedData: SupplierMaterialWithDetails[] = data.map(
        (item: any) => ({
          ...item,
          supplier_name: item.suppliers?.name,
          material_name: item.materials?.name,
          material_unit: item.materials?.unit,
          material_category: item.materials?.category,
        })
      );

      setMaterials(transformedData);
    } catch (error: any) {
      console.error("Error loading supplier materials:", error);
      setError(
        error.message || "An error occurred while loading supplier materials"
      );
      toast({
        title: t("suppliers.materials.loadError", "Error"),
        description: t(
          "suppliers.materials.loadErrorDescription",
          "An error occurred while loading supplier materials."
        ),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, supplierId, filters, sort, toast, t]);

  // Funcție pentru crearea unui material furnizat
  const createMaterial = async (data: CreateSupplierMaterialInput) => {
    try {
      const { data: result, error } = await supabase
        .from("supplier_materials")
        .insert({
          supplier_id: data.supplier_id,
          material_id: data.material_id,
          unit_price: data.unit_price,
          min_order_quantity: data.min_order_quantity,
          lead_time_days: data.lead_time_days,
          notes: data.notes,
          is_preferred:
            data.is_preferred !== undefined ? data.is_preferred : false,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Reîncărcăm materialele
      await loadMaterials();

      return { success: true, data: result };
    } catch (error: any) {
      console.error("Error creating supplier material:", error);
      toast({
        title: t("suppliers.materials.createError", "Error"),
        description: t(
          "suppliers.materials.createErrorDescription",
          "An error occurred while creating the supplier material."
        ),
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Funcție pentru actualizarea unui material furnizat
  const updateMaterial = async (
    id: string,
    data: UpdateSupplierMaterialInput
  ) => {
    try {
      const { data: result, error } = await supabase
        .from("supplier_materials")
        .update({
          unit_price: data.unit_price,
          min_order_quantity: data.min_order_quantity,
          lead_time_days: data.lead_time_days,
          notes: data.notes,
          is_preferred: data.is_preferred,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Reîncărcăm materialele
      await loadMaterials();

      return { success: true, data: result };
    } catch (error: any) {
      console.error("Error updating supplier material:", error);
      toast({
        title: t("suppliers.materials.updateError", "Error"),
        description: t(
          "suppliers.materials.updateErrorDescription",
          "An error occurred while updating the supplier material."
        ),
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Funcție pentru ștergerea unui material furnizat
  const deleteMaterial = async (id: string) => {
    try {
      const { error } = await supabase
        .from("supplier_materials")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      // Reîncărcăm materialele
      await loadMaterials();

      return { success: true };
    } catch (error: any) {
      console.error("Error deleting supplier material:", error);
      toast({
        title: t("suppliers.materials.deleteError", "Error"),
        description: t(
          "suppliers.materials.deleteErrorDescription",
          "An error occurred while deleting the supplier material."
        ),
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Funcție pentru setarea unui material ca preferat
  const setPreferred = async (id: string, isPreferred: boolean) => {
    try {
      const { data: result, error } = await supabase
        .from("supplier_materials")
        .update({
          is_preferred: isPreferred,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Reîncărcăm materialele
      await loadMaterials();

      return { success: true, data: result };
    } catch (error: any) {
      console.error("Error setting preferred status:", error);
      toast({
        title: t("suppliers.materials.preferredError", "Error"),
        description: t(
          "suppliers.materials.preferredErrorDescription",
          "An error occurred while setting the preferred status."
        ),
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Efect pentru încărcarea inițială a materialelor
  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  // Efect pentru filtrarea materialelor
  useEffect(() => {
    // Aplicăm filtrele locale
    let filtered = [...materials];

    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (material) =>
          material.material_name?.toLowerCase().includes(searchTerm) ||
          material.material_category?.toLowerCase().includes(searchTerm) ||
          material.supplier_name?.toLowerCase().includes(searchTerm) ||
          material.notes?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredMaterials(filtered);
    setPagination((prev) => ({
      ...prev,
      total: filtered.length,
    }));
  }, [materials, filters]);

  // Calculăm materialele pentru pagina curentă
  const paginatedMaterials = filteredMaterials.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  return {
    materials,
    filteredMaterials,
    paginatedMaterials,
    loading,
    error,
    filters,
    setFilters,
    sort,
    setSort,
    pagination,
    setPagination,
    loadMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    setPreferred,
  };
};
