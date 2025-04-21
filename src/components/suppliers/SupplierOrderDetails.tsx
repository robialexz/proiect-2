import React from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { SupplierOrderWithDetails, OrderStatus } from "@/models/supplier-order.model";
import {
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Package,
  FileText,
  Download,
  Printer,
} from "lucide-react";

interface SupplierOrderDetailsProps {
  order: SupplierOrderWithDetails;
  onUpdateStatus: (order: SupplierOrderWithDetails, status: OrderStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const SupplierOrderDetails: React.FC<SupplierOrderDetailsProps> = ({
  order,
  onUpdateStatus,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  // Funcție pentru formatarea datei
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "PPP", { locale: ro });
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

  // Calculăm totalul comenzii
  const calculateTotal = () => {
    if (order.total_amount) return order.total_amount;
    
    return order.items?.reduce((total, item) => {
      const itemTotal = item.total_price || (item.quantity * (item.unit_price || 0));
      return total + itemTotal;
    }, 0) || 0;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("suppliers.orders.details.orderInfo", "Order Information")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("suppliers.orders.orderNumber", "Order Number")}
                </p>
                <p className="text-sm">
                  {order.order_number || t("suppliers.orders.noOrderNumber", "No order number")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("suppliers.orders.status", "Status")}
                </p>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="ml-1">{getStatusText(order.status)}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("suppliers.orders.orderDate", "Order Date")}
                </p>
                <p className="text-sm">{formatDate(order.order_date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("suppliers.orders.expectedDeliveryDate", "Expected Delivery")}
                </p>
                <p className="text-sm">{formatDate(order.expected_delivery_date)}</p>
              </div>
              {order.actual_delivery_date && (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {t("suppliers.orders.actualDeliveryDate", "Actual Delivery")}
                  </p>
                  <p className="text-sm">{formatDate(order.actual_delivery_date)}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("suppliers.orders.totalAmount", "Total Amount")}
                </p>
                <p className="text-sm font-semibold">{formatPrice(calculateTotal())}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("suppliers.orders.details.supplierInfo", "Supplier Information")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {t("suppliers.name", "Name")}
              </p>
              <p className="text-sm font-semibold">{order.supplier_name}</p>
            </div>
            {order.project_name && (
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("projects.project", "Project")}
                </p>
                <p className="text-sm">{order.project_name}</p>
              </div>
            )}
            {order.created_by_name && (
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("suppliers.orders.createdBy", "Created By")}
                </p>
                <p className="text-sm">{order.created_by_name}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle>{t("suppliers.orders.notes", "Notes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-line">{order.notes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("suppliers.orders.items", "Order Items")}</CardTitle>
          <CardDescription>
            {t("suppliers.orders.itemsCount", "{{count}} items", { count: order.items?.length || 0 })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("suppliers.orders.items.material", "Material")}</TableHead>
                <TableHead className="text-right">{t("suppliers.orders.items.quantity", "Quantity")}</TableHead>
                <TableHead className="text-right">{t("suppliers.orders.items.unitPrice", "Unit Price")}</TableHead>
                <TableHead className="text-right">{t("suppliers.orders.items.totalPrice", "Total Price")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.material_name}
                    {item.notes && (
                      <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.quantity} {item.material_unit}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(item.unit_price)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(item.total_price || (item.quantity * (item.unit_price || 0)))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <div></div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-500">
              {t("suppliers.orders.totalAmount", "Total Amount")}
            </p>
            <p className="text-lg font-semibold">
              {formatPrice(calculateTotal())}
            </p>
          </div>
        </CardFooter>
      </Card>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4 mr-2" />
            {t("common.edit", "Edit")}
          </Button>
          <Button
            variant="outline"
            className="text-red-600"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t("common.delete", "Delete")}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {order.status === "pending" && (
            <Button
              variant="outline"
              className="text-blue-600"
              onClick={() => onUpdateStatus(order, "confirmed")}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {t("suppliers.orders.confirm", "Confirm")}
            </Button>
          )}
          {order.status === "confirmed" && (
            <Button
              variant="outline"
              className="text-purple-600"
              onClick={() => onUpdateStatus(order, "shipped")}
            >
              <Truck className="h-4 w-4 mr-2" />
              {t("suppliers.orders.markAsShipped", "Mark as Shipped")}
            </Button>
          )}
          {order.status === "shipped" && (
            <Button
              variant="outline"
              className="text-green-600"
              onClick={() => onUpdateStatus(order, "delivered")}
            >
              <Package className="h-4 w-4 mr-2" />
              {t("suppliers.orders.markAsDelivered", "Mark as Delivered")}
            </Button>
          )}
          {(order.status === "pending" || order.status === "confirmed") && (
            <Button
              variant="outline"
              className="text-red-600"
              onClick={() => onUpdateStatus(order, "cancelled")}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {t("suppliers.orders.cancel", "Cancel")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierOrderDetails;
