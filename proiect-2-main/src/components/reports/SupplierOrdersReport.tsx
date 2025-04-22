import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/services/api/supabase-client";
import { Download, FileText, Filter, RefreshCw } from "lucide-react";
import { SupplierOrder } from "@/models/supplier.model";

export const SupplierOrdersReport: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  // Folosim clientul Supabase direct

  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: "all",
    supplier: "all",
    dateFrom: "",
    dateTo: "",
  });
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>(
    []
  );

  // Încărcăm comenzile și furnizorii
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Încărcăm furnizorii
        const { data: suppliersData, error: suppliersError } = await supabase
          .from("suppliers")
          .select("id, name")
          .order("name");

        if (suppliersError) throw suppliersError;
        setSuppliers(suppliersData || []);

        // Încărcăm comenzile
        await loadOrders();
      } catch (error: any) {
        setError(error.message);
        toast({
          title: t("reports.error", "Error"),
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Funcție pentru încărcarea comenzilor
  const loadOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("supplier_orders")
        .select(
          `
          id,
          order_number,
          supplier_id,
          order_date,
          expected_delivery_date,
          status,
          total_amount,
          created_by,
          created_at,
          updated_at,
          suppliers(name)
        `
        )
        .order("order_date", { ascending: false });

      // Aplicăm filtrele
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters.supplier && filters.supplier !== "all") {
        query = query.eq("supplier_id", filters.supplier);
      }

      if (filters.dateFrom) {
        query = query.gte("order_date", filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte("order_date", filters.dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transformăm datele pentru a include numele furnizorului
      const ordersWithSupplierName = data.map((order: any) => ({
        ...order,
        supplier_name: order.suppliers?.name || "Unknown",
      }));

      setOrders(ordersWithSupplierName);
    } catch (error: any) {
      setError(error.message);
      toast({
        title: t("reports.error", "Error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Funcție pentru resetarea filtrelor
  const resetFilters = () => {
    setFilters({
      status: "all",
      supplier: "all",
      dateFrom: "",
      dateTo: "",
    });
  };

  // Funcție pentru aplicarea filtrelor
  const applyFilters = () => {
    loadOrders();
  };

  // Funcție pentru exportul în CSV
  const exportToCSV = () => {
    // Pregătim datele pentru export
    const csvData = orders.map((order) => ({
      "Order Number": order.order_number,
      Supplier: order.supplier_name,
      "Order Date": format(new Date(order.order_date), "dd/MM/yyyy"),
      "Expected Delivery": order.expected_delivery_date
        ? format(new Date(order.expected_delivery_date), "dd/MM/yyyy")
        : "",
      Status: order.status,
      "Total Amount": order.total_amount.toFixed(2),
    }));

    // Convertim în CSV
    const headers = Object.keys(csvData[0]).join(",");
    const rows = csvData.map((row) =>
      Object.values(row)
        .map((value) => `"${value}"`)
        .join(",")
    );
    const csv = [headers, ...rows].join("\\n");

    // Creăm un blob și descărcăm
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `supplier-orders-report-${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculăm statisticile
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalAmount = orders.reduce(
      (sum, order) => sum + order.total_amount,
      0
    );
    const pendingOrders = orders.filter(
      (order) => order.status === "pending"
    ).length;
    const deliveredOrders = orders.filter(
      (order) => order.status === "delivered"
    ).length;

    return {
      totalOrders,
      totalAmount,
      pendingOrders,
      deliveredOrders,
    };
  }, [orders]);

  // Funcție pentru obținerea culorii badge-ului în funcție de stare
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t("reports.supplierOrders.title", "Supplier Orders Report")}
        </CardTitle>
        <CardDescription>
          {t(
            "reports.supplierOrders.description",
            "View and analyze orders from suppliers"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filtre */}
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4" />
            <h3 className="font-medium">{t("reports.filters", "Filters")}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      "reports.supplierOrders.allStatuses",
                      "All statuses"
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("reports.supplierOrders.allStatuses", "All statuses")}
                  </SelectItem>
                  <SelectItem value="pending">
                    {t("reports.supplierOrders.status.pending", "Pending")}
                  </SelectItem>
                  <SelectItem value="confirmed">
                    {t("reports.supplierOrders.status.confirmed", "Confirmed")}
                  </SelectItem>
                  <SelectItem value="shipped">
                    {t("reports.supplierOrders.status.shipped", "Shipped")}
                  </SelectItem>
                  <SelectItem value="delivered">
                    {t("reports.supplierOrders.status.delivered", "Delivered")}
                  </SelectItem>
                  <SelectItem value="cancelled">
                    {t("reports.supplierOrders.status.cancelled", "Cancelled")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={filters.supplier}
                onValueChange={(value) =>
                  setFilters({ ...filters, supplier: value })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      "reports.supplierOrders.allSuppliers",
                      "All suppliers"
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("reports.supplierOrders.allSuppliers", "All suppliers")}
                  </SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                type="date"
                placeholder={t("reports.dateFrom", "Date from")}
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
              />
            </div>
            <div>
              <Input
                type="date"
                placeholder={t("reports.dateTo", "Date to")}
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={resetFilters}>
              {t("reports.resetFilters", "Reset")}
            </Button>
            <Button onClick={applyFilters}>
              {t("reports.applyFilters", "Apply")}
            </Button>
          </div>
        </div>

        {/* Statistici */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {t("reports.supplierOrders.totalOrders", "Total Orders")}
                  </p>
                  <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
                </div>
                <FileText className="h-8 w-8 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {t("reports.supplierOrders.totalAmount", "Total Amount")}
                  </p>
                  <h3 className="text-2xl font-bold">
                    {stats.totalAmount.toFixed(2)} RON
                  </h3>
                </div>
                <FileText className="h-8 w-8 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {t(
                      "reports.supplierOrders.pendingOrders",
                      "Pending Orders"
                    )}
                  </p>
                  <h3 className="text-2xl font-bold">{stats.pendingOrders}</h3>
                </div>
                <FileText className="h-8 w-8 text-yellow-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {t(
                      "reports.supplierOrders.deliveredOrders",
                      "Delivered Orders"
                    )}
                  </p>
                  <h3 className="text-2xl font-bold">
                    {stats.deliveredOrders}
                  </h3>
                </div>
                <FileText className="h-8 w-8 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabel comenzi */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">
              {t("reports.supplierOrders.ordersList", "Orders List")}
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadOrders}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("reports.refresh", "Refresh")}
              </Button>
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                {t("reports.exportCSV", "Export CSV")}
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p>{t("reports.loading", "Loading data...")}</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>{t("reports.noData", "No data available")}</p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t("reports.supplierOrders.orderNumber", "Order #")}
                    </TableHead>
                    <TableHead>
                      {t("reports.supplierOrders.supplier", "Supplier")}
                    </TableHead>
                    <TableHead>
                      {t("reports.supplierOrders.orderDate", "Order Date")}
                    </TableHead>
                    <TableHead>
                      {t(
                        "reports.supplierOrders.expectedDelivery",
                        "Expected Delivery"
                      )}
                    </TableHead>
                    <TableHead>
                      {t("reports.supplierOrders.status", "Status")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("reports.supplierOrders.amount", "Amount")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.order_number}
                      </TableCell>
                      <TableCell>{order.supplier_name}</TableCell>
                      <TableCell>
                        {format(new Date(order.order_date), "dd MMM yyyy", {
                          locale: ro,
                        })}
                      </TableCell>
                      <TableCell>
                        {order.expected_delivery_date
                          ? format(
                              new Date(order.expected_delivery_date),
                              "dd MMM yyyy",
                              { locale: ro }
                            )
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(order.status)}>
                          {t(
                            `reports.supplierOrders.status.${order.status}`,
                            order.status
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {order.total_amount.toFixed(2)} RON
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
