import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useSuppliers } from "@/hooks/useSuppliers";
import { SupplierWithDetails } from "@/models/supplier.model";
import SupplierForm from "@/components/suppliers/SupplierForm";
import SupplierCard from "@/components/suppliers/SupplierCard";
import SupplierOrderForm from "@/components/suppliers/SupplierOrderForm";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  FileDown,
  Grid,
  List,
  Loader2,
  Building,
  Package,
  ShoppingCart,
} from "lucide-react";

const SuppliersPageNew: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    suppliers,
    filteredSuppliers,
    paginatedSuppliers,
    loading,
    error,
    filters,
    setFilters,
    pagination,
    setPagination,
    categories,
    loadSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    updateSupplierStatus,
    updateSupplierRating,
  } = useSuppliers();

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateOrderDialog, setShowCreateOrderDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] =
    useState<SupplierWithDetails | null>(null);

  // Actualizăm filtrele când se schimbă termenul de căutare
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);

    // Adăugăm un delay pentru a evita prea multe actualizări
    const timer = setTimeout(() => {
      setFilters({ ...filters, searchTerm: e.target.value });
    }, 300);

    return () => clearTimeout(timer);
  };

  // Funcție pentru resetarea filtrelor
  const resetFilters = () => {
    setFilters({});
    setSearchTerm("");
    setShowFilters(false);
  };

  // Funcție pentru schimbarea paginii
  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  // Funcție pentru editarea unui furnizor
  const handleEdit = (supplier: SupplierWithDetails) => {
    setSelectedSupplier(supplier);
    setShowEditDialog(true);
  };

  // Funcție pentru ștergerea unui furnizor
  const handleDelete = (supplier: SupplierWithDetails) => {
    setSelectedSupplier(supplier);
    setShowDeleteDialog(true);
  };

  // Funcție pentru confirmarea ștergerii
  const confirmDelete = async () => {
    if (!selectedSupplier) return;

    const result = await deleteSupplier(selectedSupplier.id);

    if (result.success) {
      toast({
        title: t("suppliers.deleteSuccess", "Supplier Deleted"),
        description: t(
          "suppliers.deleteSuccessDescription",
          "The supplier has been deleted successfully."
        ),
        variant: "default",
      });
    }

    setShowDeleteDialog(false);
    setSelectedSupplier(null);
  };

  // Funcție pentru vizualizarea materialelor unui furnizor
  const handleViewMaterials = (supplier: SupplierWithDetails) => {
    navigate(`/suppliers/${supplier.id}`);
  };

  // Funcție pentru crearea unei comenzi
  const handleCreateOrder = (supplier: SupplierWithDetails) => {
    setSelectedSupplier(supplier);
    setShowCreateOrderDialog(true);
  };

  // Funcție pentru actualizarea stării unui furnizor
  const handleUpdateStatus = async (
    supplier: SupplierWithDetails,
    status: "active" | "inactive" | "pending"
  ) => {
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

  // Funcție pentru actualizarea ratingului unui furnizor
  const handleUpdateRating = async (
    supplier: SupplierWithDetails,
    rating: number
  ) => {
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

  // Calculăm numărul total de pagini
  const totalPages = Math.ceil(filteredSuppliers.length / pagination.limit);

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
            onClick={() =>
              handlePageChange(Math.min(totalPages, pagination.page + 1))
            }
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
    return Array(6)
      .fill(0)
      .map((_, index) => (
        <Card key={index} className="h-full">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
      ));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("suppliers.title", "Suppliers")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "suppliers.description",
              "Manage your suppliers and their materials"
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("suppliers.addSupplier", "Add Supplier")}
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder={t("suppliers.search", "Search suppliers...")}
            className="pl-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {t("common.filters", "Filters")}
          </Button>
          <Button variant="outline" onClick={() => loadSuppliers()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("common.refresh", "Refresh")}
          </Button>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              className="rounded-r-none"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
              <span className="sr-only">
                {t("common.gridView", "Grid View")}
              </span>
            </Button>
            <Separator orientation="vertical" className="h-full" />
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              className="rounded-l-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">
                {t("common.listView", "List View")}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filtre */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {t("suppliers.filters", "Filters")}
              </h3>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                {t("common.reset", "Reset")}
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("suppliers.status", "Status")}
                </label>
                <Select
                  value={filters.status || ""}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      status: (value as any) || undefined,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("suppliers.allStatuses", "All statuses")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">
                      {t("suppliers.allStatuses", "All statuses")}
                    </SelectItem>
                    <SelectItem value="active">
                      {t("suppliers.status.active", "Active")}
                    </SelectItem>
                    <SelectItem value="inactive">
                      {t("suppliers.status.inactive", "Inactive")}
                    </SelectItem>
                    <SelectItem value="pending">
                      {t("suppliers.status.pending", "Pending")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("suppliers.category", "Category")}
                </label>
                <Select
                  value={filters.category || ""}
                  onValueChange={(value) =>
                    setFilters({ ...filters, category: value || undefined })
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        "suppliers.allCategories",
                        "All categories"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">
                      {t("suppliers.allCategories", "All categories")}
                    </SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistici */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("suppliers.totalSuppliers", "Total Suppliers")}
                </p>
                <h3 className="text-2xl font-bold">{suppliers.length}</h3>
              </div>
              <Building className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("suppliers.activeSuppliers", "Active Suppliers")}
                </p>
                <h3 className="text-2xl font-bold">
                  {suppliers.filter((s) => s.status === "active").length}
                </h3>
              </div>
              <Package className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("suppliers.totalMaterials", "Total Materials")}
                </p>
                <h3 className="text-2xl font-bold">
                  {suppliers.reduce(
                    (acc, supplier) => acc + (supplier.materials_count || 0),
                    0
                  )}
                </h3>
              </div>
              <ShoppingCart className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de furnizori */}
      <div>
        {loading ? (
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`}
          >
            {renderSkeleton()}
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">
              {error
                ? t("suppliers.error", "Error: {{error}}", { error })
                : t("suppliers.noSuppliers", "No suppliers found")}
            </p>
          </Card>
        ) : (
          <div
            className={`grid ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            } gap-6`}
          >
            {paginatedSuppliers.map((supplier) => (
              <SupplierCard
                key={supplier.id}
                supplier={supplier}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewMaterials={handleViewMaterials}
                onCreateOrder={handleCreateOrder}
                onUpdateStatus={handleUpdateStatus}
                onUpdateRating={handleUpdateRating}
              />
            ))}
          </div>
        )}

        {/* Paginare */}
        {renderPagination()}
      </div>

      {/* Dialog pentru crearea unui furnizor */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t("suppliers.addSupplier", "Add Supplier")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "suppliers.addSupplierDescription",
                "Add a new supplier to your list"
              )}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            <div className="p-1">
              <SupplierForm
                categories={categories}
                onSubmit={createSupplier}
                onCancel={() => setShowCreateDialog(false)}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Dialog pentru editarea unui furnizor */}
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
              {selectedSupplier && (
                <SupplierForm
                  initialData={selectedSupplier}
                  categories={categories}
                  onSubmit={(data) => updateSupplier(selectedSupplier.id, data)}
                  onCancel={() => setShowEditDialog(false)}
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
              {selectedSupplier && (
                <SupplierOrderForm
                  supplierId={selectedSupplier.id}
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

export default SuppliersPageNew;
