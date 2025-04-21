import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/services/api/supabase-client";
import { useToast } from "@/components/ui/use-toast";
import {
  Supplier,
  SupplierWithDetails,
  CreateSupplierInput,
  UpdateSupplierInput,
} from "@/models/supplier.model";

export const useSuppliers = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  // Folosim clientul Supabase direct

  const [suppliers, setSuppliers] = useState<SupplierWithDetails[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<
    SupplierWithDetails[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<{
    status?: "active" | "inactive" | "pending";
    category?: string;
    searchTerm?: string;
  }>({});

  const [sort, setSort] = useState<{
    field: keyof Supplier;
    direction: "asc" | "desc";
  }>({
    field: "name",
    direction: "asc",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Funcție pentru încărcarea furnizorilor
  const loadSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Folosim funcția RPC pentru a obține furnizorii cu detalii suplimentare
      const { data, error } = await supabase.rpc("get_suppliers_with_details");

      if (error) {
        throw error;
      }

      setSuppliers(data || []);
    } catch (error: any) {
      console.error("Error loading suppliers:", error);
      setError(error.message || "An error occurred while loading suppliers");
      toast({
        title: t("suppliers.errors.loadError", "Error"),
        description: t(
          "suppliers.errors.loadErrorDescription",
          "An error occurred while loading suppliers."
        ),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, toast, t]);

  // Funcție pentru crearea unui furnizor
  const createSupplier = async (data: CreateSupplierInput) => {
    try {
      const { data: result, error } = await supabase
        .from("suppliers")
        .insert({
          name: data.name,
          contact_person: data.contact_person,
          email: data.email,
          phone: data.phone,
          address: data.address,
          website: data.website,
          category: data.category,
          notes: data.notes,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Reîncărcăm furnizorii
      await loadSuppliers();

      return { success: true, data: result };
    } catch (error: any) {
      console.error("Error creating supplier:", error);
      toast({
        title: t("suppliers.errors.createError", "Error"),
        description: t(
          "suppliers.errors.createErrorDescription",
          "An error occurred while creating the supplier."
        ),
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Funcție pentru actualizarea unui furnizor
  const updateSupplier = async (id: string, data: UpdateSupplierInput) => {
    try {
      const { data: result, error } = await supabase
        .from("suppliers")
        .update({
          name: data.name,
          contact_person: data.contact_person,
          email: data.email,
          phone: data.phone,
          address: data.address,
          website: data.website,
          category: data.category,
          notes: data.notes,
          rating: data.rating,
          status: data.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Reîncărcăm furnizorii
      await loadSuppliers();

      return { success: true, data: result };
    } catch (error: any) {
      console.error("Error updating supplier:", error);
      toast({
        title: t("suppliers.errors.updateError", "Error"),
        description: t(
          "suppliers.errors.updateErrorDescription",
          "An error occurred while updating the supplier."
        ),
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Funcție pentru ștergerea unui furnizor
  const deleteSupplier = async (id: string) => {
    try {
      const { error } = await supabase.from("suppliers").delete().eq("id", id);

      if (error) {
        throw error;
      }

      // Reîncărcăm furnizorii
      await loadSuppliers();

      return { success: true };
    } catch (error: any) {
      console.error("Error deleting supplier:", error);
      toast({
        title: t("suppliers.errors.deleteError", "Error"),
        description: t(
          "suppliers.errors.deleteErrorDescription",
          "An error occurred while deleting the supplier."
        ),
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Funcție pentru actualizarea stării unui furnizor
  const updateSupplierStatus = async (
    id: string,
    status: "active" | "inactive" | "pending"
  ) => {
    try {
      const { data: result, error } = await supabase
        .from("suppliers")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Reîncărcăm furnizorii
      await loadSuppliers();

      return { success: true, data: result };
    } catch (error: any) {
      console.error("Error updating supplier status:", error);
      toast({
        title: t("suppliers.errors.updateStatusError", "Error"),
        description: t(
          "suppliers.errors.updateStatusErrorDescription",
          "An error occurred while updating the supplier status."
        ),
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Funcție pentru actualizarea ratingului unui furnizor
  const updateSupplierRating = async (id: string, rating: number) => {
    try {
      const { data: result, error } = await supabase
        .from("suppliers")
        .update({
          rating,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Reîncărcăm furnizorii
      await loadSuppliers();

      return { success: true, data: result };
    } catch (error: any) {
      console.error("Error updating supplier rating:", error);
      toast({
        title: t("suppliers.errors.updateRatingError", "Error"),
        description: t(
          "suppliers.errors.updateRatingErrorDescription",
          "An error occurred while updating the supplier rating."
        ),
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Efect pentru încărcarea inițială a furnizorilor
  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  // Efect pentru filtrarea furnizorilor
  useEffect(() => {
    // Aplicăm filtrele locale
    let filtered = [...suppliers];

    if (filters.status) {
      filtered = filtered.filter(
        (supplier) => supplier.status === filters.status
      );
    }

    if (filters.category) {
      filtered = filtered.filter(
        (supplier) => supplier.category === filters.category
      );
    }

    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(searchTerm) ||
          supplier.contact_person?.toLowerCase().includes(searchTerm) ||
          supplier.email?.toLowerCase().includes(searchTerm) ||
          supplier.category?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredSuppliers(filtered);
    setPagination((prev) => ({
      ...prev,
      total: filtered.length,
    }));
  }, [suppliers, filters]);

  // Calculăm furnizorii pentru pagina curentă
  const paginatedSuppliers = filteredSuppliers.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  // Obținem categoriile unice
  const categories = [
    ...new Set(suppliers.map((supplier) => supplier.category).filter(Boolean)),
  ];

  return {
    suppliers,
    filteredSuppliers,
    paginatedSuppliers,
    loading,
    error,
    filters,
    setFilters,
    sort,
    setSort,
    pagination,
    setPagination,
    categories,
    loadSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    updateSupplierStatus,
    updateSupplierRating,
  };
};
