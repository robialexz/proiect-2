import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSupplierOrders } from "@/hooks/useSupplierOrders";
import { SupplierOrderWithDetails, OrderStatus } from "@/models/supplier-order.model";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Search,
  Plus,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Package,
  FileText,
  Eye,
} from "lucide-react";
import SupplierOrderForm from "./SupplierOrderForm";
import SupplierOrderDetails from "./SupplierOrderDetails";

interface SupplierOrdersTableProps {
  supplierId?: string;
  supplierName?: string;
  projectId?: string;
}

const SupplierOrdersTable: React.FC<SupplierOrdersTableProps> = ({
  supplierId,
  supplierName,
  projectId,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const {
    orders,
    filteredOrders,
    paginatedOrders,
    loading,
    error,
    filters,
    setFilters,
    pagination,
    setPagination,
    loadOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
  } = useSupplierOrders(supplierId, projectId);

  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SupplierOrderWithDetails | null>(null);

  // Actualizăm filtrele când se schimbă termenul de căutare
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    
    // Adăugăm un delay pentru a evita prea multe actualizări
    const timer = setTimeout(() => {
      setFilters({ ...filters, searchTerm: e.target.value });
    }, 300);

    return () => clearTimeout(timer);
  };

  // Funcție pentru schimbarea paginii
  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  // Funcție pentru vizualizarea detaliilor unei comenzi
  const handleViewDetails = (order: SupplierOrderWithDetails) => {
    setSelectedOrder(order);
    setShowDetailsDialog(true);
  };

  // Funcție pentru editarea unei comenzi
  const handleEdit = (order: SupplierOrderWithDetails) => {
    setSelectedOrder(order);
    setShowEditDialog(true);
  };

  // Funcție pentru ștergerea unei comenzi
  const handleDelete = (order: SupplierOrderWithDetails) => {
    setSelectedOrder(order);
    setShowDeleteDialog(true);
  };

  // Funcție pentru confirmarea ștergerii
  const confirmDelete = async () => {
    if (!selectedOrder) return;
    
    const result = await deleteOrder(selectedOrder.id);
    
    if (result.success) {
      toast({
        title: t("suppliers.orders.deleteSuccess", "Order Deleted"),
        description: t("suppliers.orders.deleteSuccessDescription", "The order has been deleted successfully."),
        variant: "default",
      });
    }
    
    setShowDeleteDialog(false);
    setSelectedOrder(null);
  };

  // Funcție pentru actualizarea stării unei comenzi
  const handleUpdateStatus = async (order: SupplierOrderWithDetails, status: OrderStatus) => {
    const result = await updateOrderStatus(order.id, status);
    
    if (result.success) {
      toast({
        title: t("suppliers.orders.updateStatusSuccess", "Status Updated"),
        description: t("suppliers.orders.updateStatusSuccessDescription", "The order status has been updated successfully."),
        variant: "default",
      });
    }
  };

  // Funcție pentru formatarea datei
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: ro });
    } catch (error) {
      return dateString;
    }
  };

  // Funcție pentru formatarea prețului
  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return "-";
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON",
    }).format(price);
  };

  // Funcție pentru obținerea culorii badge-ului în funcție de stare
  const getStatusBadgeColor = (status: OrderStatus) => {
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

  // Funcție pentru obținerea textului în funcție de stare
  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return t("suppliers.orders.status.pending", "Pending");
      case "confirmed":
        return t("suppliers.orders.status.confirmed", "Confirmed");
      case "shipped":
        return t("suppliers.orders.status.shipped", "Shipped");
      case "delivered":
        return t("suppliers.orders.status.delivered", "Delivered");
      case "cancelled":
        return t("suppliers.orders.status.cancelled", "Cancelled");
      default:
        return status;
    }
  };

  // Funcție pentru obținerea iconului în funcție de stare
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "shipped":
        return <Truck className="h-4 w-4 text-purple-600" />;
      case "delivered":
        return <Package className="h-4 w-4 text-green-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  // Calculăm numărul total de pagini
  const totalPages = Math.ceil(filteredOrders.length / pagination.limit);

  // Renderăm paginarea
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-6">
        <nav className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
            disabled={pagination.page === 1}
          >
            {t("common.previous", "Previous")}
          </Button>
          
          {Array.from({ length: totalPages }).map((_, index) => (
            <Button
              key={index}
              variant={pagination.page === index + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.min(totalPages, pagination.page + 1))}
            disabled={pagination.page === totalPages}
          >
            {t("common.next", "Next")}
          </Button>
        </nav>
      </div>
    );
  };

  // Renderăm scheletonul pentru încărcare
  const renderSkeleton = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-8" />
          </TableCell>
        </TableRow>
      ));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold">
          {supplierName
            ? t("suppliers.orders.titleForSupplier", "Orders for {{supplierName}}", { supplierName })
            : t("suppliers.orders.title", "Orders")}
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("suppliers.orders.newOrder", "New Order")}
          </Button>
          <Button
            variant="outline"
            onClick={() => loadOrders()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("common.refresh", "Refresh")}
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder={t("suppliers.orders.search", "Search orders...")}
            className="pl-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("suppliers.orders.orderNumber", "Order Number")}</TableHead>
              {!supplierId && (
                <TableHead>{t("suppliers.orders.supplier", "Supplier")}</TableHead>
              )}
              {!projectId && (
                <TableHead>{t("suppliers.orders.project", "Project")}</TableHead>
              )}
              <TableHead>{t("suppliers.orders.orderDate", "Order Date")}</TableHead>
              <TableHead>{t("suppliers.orders.status", "Status")}</TableHead>
              <TableHead>{t("suppliers.orders.totalAmount", "Total Amount")}</TableHead>
              <TableHead className="w-10">
                <span className="sr-only">{t("common.actions", "Actions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              renderSkeleton()
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={supplierId && projectId ? 5 : (supplierId || projectId) ? 6 : 7} className="h-24 text-center">
                  {error
                    ? t("suppliers.orders.error", "Error: {{error}}", { error })
                    : t("suppliers.orders.noOrders", "No orders found")}
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.order_number || t("suppliers.orders.noOrderNumber", "No order number")}
                  </TableCell>
                  {!supplierId && (
                    <TableCell>{order.supplier_name || "-"}</TableCell>
                  )}
                  {!projectId && (
                    <TableCell>{order.project_name || "-"}</TableCell>
                  )}
                  <TableCell>{formatDate(order.order_date)}</TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{getStatusText(order.status)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatPrice(order.total_amount)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">{t("common.actions", "Actions")}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t("common.actions", "Actions")}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                          <Eye className="h-4 w-4 mr-2" />
                          {t("common.view", "View")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(order)}>
                          <Edit className="h-4 w-4 mr-2" />
                          {t("common.edit", "Edit")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {order.status === "pending" && (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order, "confirmed")}>
                            <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                            {t("suppliers.orders.confirm", "Confirm")}
                          </DropdownMenuItem>
                        )}
                        {order.status === "confirmed" && (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order, "shipped")}>
                            <Truck className="h-4 w-4 mr-2 text-purple-600" />
                            {t("suppliers.orders.markAsShipped", "Mark as Shipped")}
                          </DropdownMenuItem>
                        )}
                        {order.status === "shipped" && (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order, "delivered")}>
                            <Package className="h-4 w-4 mr-2 text-green-600" />
                            {t("suppliers.orders.markAsDelivered", "Mark as Delivered")}
                          </DropdownMenuItem>
                        )}
                        {(order.status === "pending" || order.status === "confirmed") && (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order, "cancelled")}>
                            <XCircle className="h-4 w-4 mr-2 text-red-600" />
                            {t("suppliers.orders.cancel", "Cancel")}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(order)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t("common.delete", "Delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginare */}
      {renderPagination()}

      {/* Dialog pentru crearea unei comenzi */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {t("suppliers.orders.newOrder", "New Order")}
            </DialogTitle>
            <DialogDescription>
              {t("suppliers.orders.newOrderDescription", "Create a new order for this supplier")}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            <div className="p-1">
              <SupplierOrderForm
                supplierId={supplierId}
                projectId={projectId}
                onSubmit={createOrder}
                onCancel={() => setShowCreateDialog(false)}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Dialog pentru editarea unei comenzi */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {t("suppliers.orders.editOrder", "Edit Order")}
            </DialogTitle>
            <DialogDescription>
              {t("suppliers.orders.editOrderDescription", "Edit order information")}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            <div className="p-1">
              {selectedOrder && (
                <SupplierOrderForm
                  supplierId={supplierId || selectedOrder.supplier_id}
                  projectId={projectId || selectedOrder.project_id}
                  initialData={selectedOrder}
                  onSubmit={(data) => updateOrder(selectedOrder.id, data)}
                  onCancel={() => setShowEditDialog(false)}
                />
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Dialog pentru vizualizarea detaliilor unei comenzi */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {t("suppliers.orders.orderDetails", "Order Details")}
            </DialogTitle>
            <DialogDescription>
              {selectedOrder?.order_number
                ? t("suppliers.orders.orderNumberDetails", "Order #{{orderNumber}}", { orderNumber: selectedOrder.order_number })
                : t("suppliers.orders.orderFromDate", "Order from {{date}}", { date: selectedOrder ? formatDate(selectedOrder.order_date) : "" })}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            <div className="p-1">
              {selectedOrder && (
                <SupplierOrderDetails
                  order={selectedOrder}
                  onUpdateStatus={handleUpdateStatus}
                  onEdit={() => {
                    setShowDetailsDialog(false);
                    handleEdit(selectedOrder);
                  }}
                  onDelete={() => {
                    setShowDetailsDialog(false);
                    handleDelete(selectedOrder);
                  }}
                />
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Dialog pentru confirmarea ștergerii */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("suppliers.orders.deleteConfirmTitle", "Are you sure?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("suppliers.orders.deleteConfirmDescription", "This action cannot be undone. This will permanently delete the order and all associated data.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("common.cancel", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
            >
              {t("common.delete", "Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SupplierOrdersTable;
