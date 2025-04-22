import React from "react";
import { useNavigate } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StarRating } from "@/components/ui/star-rating";
import {
  Building,
  Phone,
  Mail,
  Globe,
  MapPin,
  MoreHorizontal,
  Edit,
  Trash2,
  Package,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { SupplierWithDetails } from "@/models/supplier.model";

interface SupplierCardProps {
  supplier: SupplierWithDetails;
  onEdit: (supplier: SupplierWithDetails) => void;
  onDelete: (supplier: SupplierWithDetails) => void;
  onViewMaterials: (supplier: SupplierWithDetails) => void;
  onCreateOrder: (supplier: SupplierWithDetails) => void;
  onUpdateStatus: (
    supplier: SupplierWithDetails,
    status: "active" | "inactive" | "pending"
  ) => void;
  onUpdateRating: (supplier: SupplierWithDetails, rating: number) => void;
}

const SupplierCard: React.FC<SupplierCardProps> = ({
  supplier,
  onEdit,
  onDelete,
  onViewMaterials,
  onCreateOrder,
  onUpdateStatus,
  onUpdateRating,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Funcție pentru formatarea datei
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: ro });
    } catch (error) {
      return dateString;
    }
  };

  // Funcție pentru obținerea culorii badge-ului în funcție de stare
  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  // Funcție pentru obținerea textului în funcție de stare
  const getStatusText = (status?: string) => {
    switch (status) {
      case "active":
        return t("suppliers.status.active", "Active");
      case "inactive":
        return t("suppliers.status.inactive", "Inactive");
      case "pending":
        return t("suppliers.status.pending", "Pending");
      default:
        return t("suppliers.status.unknown", "Unknown");
    }
  };

  // Funcție pentru obținerea iconului în funcție de stare
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "inactive":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        className="pb-2 cursor-pointer"
        onClick={() => navigate(`/suppliers/${supplier.id}`)}
      >
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg hover:text-blue-600 transition-colors">
              {supplier.name}
            </CardTitle>
            {supplier.category && (
              <CardDescription>{supplier.category}</CardDescription>
            )}
          </div>
          <Badge className={getStatusBadgeColor(supplier.status)}>
            <div className="flex items-center space-x-1">
              {getStatusIcon(supplier.status)}
              <span>{getStatusText(supplier.status)}</span>
            </div>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-3">
          {supplier.contact_person && (
            <div className="flex items-center text-sm">
              <Building className="h-4 w-4 mr-2 text-gray-500" />
              <span>{supplier.contact_person}</span>
            </div>
          )}
          {supplier.phone && (
            <div className="flex items-center text-sm">
              <Phone className="h-4 w-4 mr-2 text-gray-500" />
              <span>{supplier.phone}</span>
            </div>
          )}
          {supplier.email && (
            <div className="flex items-center text-sm">
              <Mail className="h-4 w-4 mr-2 text-gray-500" />
              <span>{supplier.email}</span>
            </div>
          )}
          {supplier.website && (
            <div className="flex items-center text-sm">
              <Globe className="h-4 w-4 mr-2 text-gray-500" />
              <a
                href={
                  supplier.website.startsWith("http")
                    ? supplier.website
                    : `https://${supplier.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {supplier.website}
              </a>
            </div>
          )}
          {supplier.address && (
            <div className="flex items-start text-sm">
              <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
              <span>{supplier.address}</span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              {t("suppliers.rating", "Rating")}
            </span>
            <StarRating
              value={supplier.rating || 0}
              onChange={(rating) => onUpdateRating(supplier, rating)}
              size="sm"
            />
          </div>

          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              {t("suppliers.materials", "Materials")}
            </span>
            <span className="text-sm">{supplier.materials_count || 0}</span>
          </div>

          {supplier.last_order && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {t("suppliers.lastOrder", "Last Order")}
              </span>
              <span className="text-sm">
                {formatDate(supplier.last_order.order_date)}
              </span>
            </div>
          )}
        </div>

        {supplier.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">{supplier.notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/suppliers/${supplier.id}`)}
        >
          <Package className="h-4 w-4 mr-2" />
          {t("suppliers.viewDetails", "View Details")}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">{t("common.actions", "Actions")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {t("common.actions", "Actions")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(supplier)}>
              <Edit className="h-4 w-4 mr-2" />
              {t("common.edit", "Edit")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCreateOrder(supplier)}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              {t("suppliers.createOrder", "Create Order")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {supplier.status !== "active" && (
              <DropdownMenuItem
                onClick={() => onUpdateStatus(supplier, "active")}
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                {t("suppliers.setActive", "Set Active")}
              </DropdownMenuItem>
            )}
            {supplier.status !== "inactive" && (
              <DropdownMenuItem
                onClick={() => onUpdateStatus(supplier, "inactive")}
              >
                <XCircle className="h-4 w-4 mr-2 text-red-600" />
                {t("suppliers.setInactive", "Set Inactive")}
              </DropdownMenuItem>
            )}
            {supplier.status !== "pending" && (
              <DropdownMenuItem
                onClick={() => onUpdateStatus(supplier, "pending")}
              >
                <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                {t("suppliers.setPending", "Set Pending")}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(supplier)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("common.delete", "Delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
};

export default SupplierCard;
