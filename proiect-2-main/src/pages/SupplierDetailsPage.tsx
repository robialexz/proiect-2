import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/ui/star-rating";
import { useSuppliers } from "@/hooks/useSuppliers";
import { SupplierWithDetails } from "@/models/supplier.model";
import SupplierForm from "@/components/suppliers/SupplierForm";
import SupplierMaterialsTable from "@/components/suppliers/SupplierMaterialsTable";
import SupplierOrdersTable from "@/components/suppliers/SupplierOrdersTable";
import SupplierOrderForm from "@/components/suppliers/SupplierOrderForm";
import {
  Building,
  Phone,
  Mail,
  Globe,
  MapPin,
  Package,
  ShoppingCart,
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";

const SupplierDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { supplierId } = useParams<{ supplierId: string }>();

  const {
    suppliers,
    loading,
    error,
    loadSuppliers,
    updateSupplier,
    deleteSupplier,
    updateSupplierStatus,
    updateSupplierRating,
  } = useSuppliers();

  const [activeTab, setActiveTab] = useState("details");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateOrderDialog, setShowCreateOrderDialog] = useState(false);
  const [supplier, setSupplier] = useState<SupplierWithDetails | null>(null);

  // Încărcăm furnizorii și găsim furnizorul curent
  useEffect(() => {
    const loadData = async () => {
      await loadSuppliers();
    };

    loadData();
  }, [loadSuppliers]);

  // Actualizăm furnizorul curent când se schimbă lista de furnizori
  useEffect(() => {
    if (supplierId && suppliers.length > 0) {
      const currentSupplier = suppliers.find((s) => s.id === supplierId);
      setSupplier(currentSupplier || null);
    }
  }, [supplierId, suppliers]);

  // Funcție pentru editarea furnizorului
  const handleEdit = () => {
    setShowEditDialog(true);
  };

  // Funcție pentru ștergerea furnizorului
  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  // Funcție pentru confirmarea ștergerii
  const confirmDelete = async () => {
    if (!supplier) return;

    const result = await deleteSupplier(supplier.id);

    if (result.success) {
      toast({
        title: t("suppliers.deleteSuccess", "Supplier Deleted"),
        description: t(
          "suppliers.deleteSuccessDescription",
          "The supplier has been deleted successfully."
        ),
        variant: "default",
      });

      // Navigăm înapoi la lista de furnizori
      navigate("/suppliers");
    }

    setShowDeleteDialog(false);
  };

  // Funcție pentru actualizarea stării furnizorului
  const handleUpdateStatus = async (
    status: "active" | "inactive" | "pending"
  ) => {
    if (!supplier) return;

    const result = await updateSupplierStatus(supplier.id, status);

    if (result.success) {
      toast({
        title: t("suppliers.updateStatusSuccess", "Status Updated"),
        description: t(
          "suppliers.updateStatusSuccessDescription",
          "The supplier status has been updated successfully."
        ),
        variant: "default",
      });
    }
  };

  // Funcție pentru actualizarea ratingului furnizorului
  const handleUpdateRating = async (rating: number) => {
    if (!supplier) return;

    const result = await updateSupplierRating(supplier.id, rating);

    if (result.success) {
      toast({
        title: t("suppliers.updateRatingSuccess", "Rating Updated"),
        description: t(
          "suppliers.updateRatingSuccessDescription",
          "The supplier rating has been updated successfully."
        ),
        variant: "default",
      });
    }
  };

  // Funcție pentru obținerea culorii badge-ului în funcție de stare
  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  // Dacă se încarcă datele, afișăm un indicator de încărcare
  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Dacă furnizorul nu există, afișăm un mesaj de eroare
  if (!supplier) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate("/suppliers")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("suppliers.backToSuppliers", "Back to Suppliers")}
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold mb-2">
                {t("suppliers.notFound", "Supplier Not Found")}
              </h2>
              <p className="text-gray-500">
                {error
                  ? t("suppliers.error", "Error: {{error}}", { error })
                  : t(
                      "suppliers.notFoundDescription",
                      "The supplier you are looking for does not exist or has been deleted."
                    )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate("/suppliers")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("suppliers.backToSuppliers", "Back to Suppliers")}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            {t("common.edit", "Edit")}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            {t("common.delete", "Delete")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{supplier.name}</CardTitle>
                  {supplier.category && (
                    <CardDescription>{supplier.category}</CardDescription>
                  )}
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                    supplier.status
                  )}`}
                >
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(supplier.status)}
                    <span>{getStatusText(supplier.status)}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">
                    {t("suppliers.rating", "Rating")}
                  </span>
                  <StarRating
                    value={supplier.rating || 0}
                    onChange={handleUpdateRating}
                  />
                </div>

                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">
                    {t("suppliers.materials", "Materials")}
                  </span>
                  <span className="text-sm">
                    {supplier.materials_count || 0}
                  </span>
                </div>

                {supplier.last_order && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {t("suppliers.lastOrder", "Last Order")}
                    </span>
                    <span className="text-sm">
                      {new Date(
                        supplier.last_order.order_date
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleUpdateStatus(
                    supplier.status === "active" ? "inactive" : "active"
                  )
                }
              >
                {supplier.status === "active" ? (
                  <XCircle className="h-4 w-4 mr-2 text-red-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                )}
                {supplier.status === "active"
                  ? t("suppliers.setInactive", "Set Inactive")
                  : t("suppliers.setActive", "Set Active")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCreateOrderDialog(true);
                  setActiveTab("orders");
                }}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {t("suppliers.createOrder", "Create Order")}
              </Button>
            </CardFooter>
          </Card>

          {supplier.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("suppliers.notes", "Notes")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {supplier.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="details">
                <Package className="h-4 w-4 mr-2" />
                {t("suppliers.materials.title", "Materials")}
              </TabsTrigger>
              <TabsTrigger value="orders">
                <ShoppingCart className="h-4 w-4 mr-2" />
                {t("suppliers.orders.title", "Orders")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <Card>
                <CardContent className="pt-6">
                  <SupplierMaterialsTable
                    supplierId={supplier.id}
                    supplierName={supplier.name}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="orders">
              <Card>
                <CardContent className="pt-6">
                  <SupplierOrdersTable
                    supplierId={supplier.id}
                    supplierName={supplier.name}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Dialog pentru editarea furnizorului */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t("suppliers.editSupplier", "Edit Supplier")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "suppliers.editSupplierDescription",
                "Edit supplier information"
              )}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            <div className="p-1">
              <SupplierForm
                initialData={supplier}
                categories={[]}
                onSubmit={(data) => updateSupplier(supplier.id, data)}
                onCancel={() => setShowEditDialog(false)}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Dialog pentru confirmarea ștergerii */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("suppliers.deleteConfirmTitle", "Are you sure?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "suppliers.deleteConfirmDescription",
                "This action cannot be undone. This will permanently delete the supplier and all associated data."
              )}
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

      {/* Dialog pentru crearea unei comenzi */}
      <Dialog
        open={showCreateOrderDialog}
        onOpenChange={setShowCreateOrderDialog}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {t("suppliers.orders.newOrder", "New Order")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "suppliers.orders.newOrderDescription",
                "Create a new order for this supplier"
              )}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            <div className="p-1">
              {supplier && (
                <SupplierOrderForm
                  supplierId={supplier.id}
                  onSubmit={async (data) => {
                    // Importăm hook-ul pentru comenzi
                    const { createOrder } = await import(
                      "@/hooks/useSupplierOrders"
                    ).then((module) => ({
                      createOrder: module.useSupplierOrders().createOrder,
                    }));
                    const result = await createOrder(data);
                    if (result.success) {
                      toast({
                        title: t(
                          "suppliers.orders.createSuccess",
                          "Order Created"
                        ),
                        description: t(
                          "suppliers.orders.createSuccessDescription",
                          "The order has been created successfully."
                        ),
                        variant: "default",
                      });
                      setShowCreateOrderDialog(false);
                    }
                    return result;
                  }}
                  onCancel={() => setShowCreateOrderDialog(false)}
                />
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierDetailsPage;
