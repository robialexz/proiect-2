import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSupabaseClient } from "@/lib/supabase-provider";
import { useToast } from "@/components/ui/use-toast";
import {
  SupplierOrder,
  SupplierOrderWithDetails,
  CreateSupplierOrderInput,
  UpdateSupplierOrderInput,
  OrderStatus,
} from "@/models/supplier-order.model";

export const useSupplierOrders = (supplierId?: string, projectId?: string) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const supabase = useSupabaseClient();

  const [orders, setOrders] = useState<SupplierOrderWithDetails[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<SupplierOrderWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<{
    status?: OrderStatus;
    dateFrom?: string;
    dateTo?: string;
    searchTerm?: string;
  }>({});

  const [sort, setSort] = useState<{
    field: keyof SupplierOrder;
    direction: "asc" | "desc";
  }>({
    field: "order_date",
    direction: "desc",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Funcție pentru încărcarea comenzilor
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("supplier_orders")
        .select(`
          *,
          suppliers:supplier_id (name),
          projects:project_id (name),
          users:created_by (full_name),
          items:supplier_order_items (
            *,
            materials:material_id (name, unit)
          )
        `);

      // Aplicăm filtrele
      if (supplierId) {
        query = query.eq("supplier_id", supplierId);
      }

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.dateFrom) {
        query = query.gte("order_date", filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte("order_date", filters.dateTo);
      }

      // Aplicăm sortarea
      query = query.order(sort.field, { ascending: sort.direction === "asc" });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Transformăm datele pentru a include informațiile suplimentare
      const transformedData: SupplierOrderWithDetails[] = data.map((item: any) => ({
        ...item,
        supplier_name: item.suppliers?.name,
        project_name: item.projects?.name,
        created_by_name: item.users?.full_name,
        items: item.items?.map((itemData: any) => ({
          ...itemData,
          material_name: itemData.materials?.name,
          material_unit: itemData.materials?.unit,
        })),
      }));

      setOrders(transformedData);
    } catch (error: any) {
      console.error("Error loading orders:", error);
      setError(error.message || "An error occurred while loading orders");
      toast({
        title: t("suppliers.orders.loadError", "Error"),
        description: t("suppliers.orders.loadErrorDescription", "An error occurred while loading orders."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, supplierId, projectId, filters, sort, toast, t]);

  // Funcție pentru crearea unei comenzi
  const createOrder = async (data: CreateSupplierOrderInput) => {
    try {
      // Pasul 1: Creăm comanda
      const { data: orderData, error: orderError } = await supabase
        .from("supplier_orders")
        .insert({
          supplier_id: data.supplier_id,
          project_id: data.project_id,
          order_number: data.order_number,
          expected_delivery_date: data.expected_delivery_date,
          notes: data.notes,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      // Pasul 2: Adăugăm elementele comenzii
      const orderItems = data.items.map(item => ({
        order_id: orderData.id,
        material_id: item.material_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        notes: item.notes,
      }));

      const { error: itemsError } = await supabase
        .from("supplier_order_items")
        .insert(orderItems);

      if (itemsError) {
        throw itemsError;
      }

      // Reîncărcăm comenzile
      await loadOrders();

      return { success: true, data: orderData };
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast({
        title: t("suppliers.orders.createError", "Error"),
        description: t("suppliers.orders.createErrorDescription", "An error occurred while creating the order."),
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Funcție pentru actualizarea unei comenzi
  const updateOrder = async (id: string, data: UpdateSupplierOrderInput) => {
    try {
      const { data: result, error } = await supabase
        .from("supplier_orders")
        .update({
          order_number: data.order_number,
          expected_delivery_date: data.expected_delivery_date,
          actual_delivery_date: data.actual_delivery_date,
          status: data.status,
          notes: data.notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select();

      if (error) {
        throw error;
      }

      // Reîncărcăm comenzile
      await loadOrders();

      return { success: true, data: result[0] };
    } catch (error: any) {
      console.error("Error updating order:", error);
      toast({
        title: t("suppliers.orders.updateError", "Error"),
        description: t("suppliers.orders.updateErrorDescription", "An error occurred while updating the order."),
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Funcție pentru ștergerea unei comenzi
  const deleteOrder = async (id: string) => {
    try {
      const { error } = await supabase
        .from("supplier_orders")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      // Reîncărcăm comenzile
      await loadOrders();

      return { success: true };
    } catch (error: any) {
      console.error("Error deleting order:", error);
      toast({
        title: t("suppliers.orders.deleteError", "Error"),
        description: t("suppliers.orders.deleteErrorDescription", "An error occurred while deleting the order."),
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Funcție pentru actualizarea stării unei comenzi
  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      const { data: result, error } = await supabase
        .from("supplier_orders")
        .update({
          status,
          updated_at: new Date().toISOString(),
          ...(status === "delivered" ? { actual_delivery_date: new Date().toISOString() } : {}),
        })
        .eq("id", id)
        .select();

      if (error) {
        throw error;
      }

      // Reîncărcăm comenzile
      await loadOrders();

      return { success: true, data: result[0] };
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast({
        title: t("suppliers.orders.updateStatusError", "Error"),
        description: t("suppliers.orders.updateStatusErrorDescription", "An error occurred while updating the order status."),
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  // Efect pentru încărcarea inițială a comenzilor
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Efect pentru filtrarea comenzilor
  useEffect(() => {
    // Aplicăm filtrele locale
    let filtered = [...orders];

    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.order_number?.toLowerCase().includes(searchTerm) ||
          order.supplier_name?.toLowerCase().includes(searchTerm) ||
          order.project_name?.toLowerCase().includes(searchTerm) ||
          order.notes?.toLowerCase().includes(searchTerm) ||
          order.created_by_name?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredOrders(filtered);
    setPagination((prev) => ({
      ...prev,
      total: filtered.length,
    }));
  }, [orders, filters]);

  // Calculăm comenzile pentru pagina curentă
  const paginatedOrders = filteredOrders.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  return {
    orders,
    filteredOrders,
    paginatedOrders,
    loading,
    error,
    filters,
    setFilters,
    sort,
    setSort,
    pagination,
    setPagination,
    loadOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
  };
};
