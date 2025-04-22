import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSupplierMaterials } from "@/hooks/useSupplierMaterials";
import { SupplierMaterialWithDetails } from "@/models/supplier-material.model";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Star,
  Search,
  Plus,
  RefreshCw,
  Loader2,
} from "lucide-react";
import SupplierMaterialForm from "./SupplierMaterialForm";

interface SupplierMaterialsTableProps {
  supplierId: string;
  supplierName: string;
}

const SupplierMaterialsTable: React.FC<SupplierMaterialsTableProps> = ({
  supplierId,
  supplierName,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const {
    materials,
    filteredMaterials,
    paginatedMaterials,
    loading,
    error,
    filters,
    setFilters,
    pagination,
    setPagination,
    loadMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    setPreferred,
  } = useSupplierMaterials(supplierId);

  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<SupplierMaterialWithDetails | null>(null);

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

  // Funcție pentru editarea unui material
  const handleEdit = (material: SupplierMaterialWithDetails) => {
    setSelectedMaterial(material);
    setShowEditDialog(true);
  };

  // Funcție pentru ștergerea unui material
  const handleDelete = (material: SupplierMaterialWithDetails) => {
    setSelectedMaterial(material);
    setShowDeleteDialog(true);
  };

  // Funcție pentru confirmarea ștergerii
  const confirmDelete = async () => {
    if (!selectedMaterial) return;
    
    const result = await deleteMaterial(selectedMaterial.id);
    
    if (result.success) {
      toast({
        title: t("suppliers.materials.deleteSuccess", "Material Deleted"),
        description: t("suppliers.materials.deleteSuccessDescription", "The material has been deleted successfully."),
        variant: "default",
      });
    }
    
    setShowDeleteDialog(false);
    setSelectedMaterial(null);
  };

  // Funcție pentru setarea unui material ca preferat
  const handleSetPreferred = async (material: SupplierMaterialWithDetails, isPreferred: boolean) => {
    const result = await setPreferred(material.id, isPreferred);
    
    if (result.success) {
      toast({
        title: isPreferred
          ? t("suppliers.materials.setPreferredSuccess", "Set as Preferred")
          : t("suppliers.materials.unsetPreferredSuccess", "Removed from Preferred"),
        description: isPreferred
          ? t("suppliers.materials.setPreferredSuccessDescription", "The material has been set as preferred.")
          : t("suppliers.materials.unsetPreferredSuccessDescription", "The material has been removed from preferred."),
        variant: "default",
      });
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

  // Calculăm numărul total de pagini
  const totalPages = Math.ceil(filteredMaterials.length / pagination.limit);

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
            <Skeleton className="h-4 w-4" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
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
          {t("suppliers.materials.title", "Materials for {{supplierName}}", { supplierName })}
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("suppliers.materials.addMaterial", "Add Material")}
          </Button>
          <Button
            variant="outline"
            onClick={() => loadMaterials()}
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
            placeholder={t("suppliers.materials.search", "Search materials...")}
            className="pl-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="preferred"
            checked={filters.is_preferred}
            onCheckedChange={(checked) => setFilters({ ...filters, is_preferred: checked ? true : undefined })}
          />
          <label
            htmlFor="preferred"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("suppliers.materials.showPreferred", "Show preferred only")}
          </label>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <span className="sr-only">{t("suppliers.materials.preferred", "Preferred")}</span>
              </TableHead>
              <TableHead>{t("suppliers.materials.material", "Material")}</TableHead>
              <TableHead>{t("suppliers.materials.unitPrice", "Unit Price")}</TableHead>
              <TableHead>{t("suppliers.materials.minOrderQuantity", "Min. Order")}</TableHead>
              <TableHead>{t("suppliers.materials.leadTime", "Lead Time")}</TableHead>
              <TableHead>{t("suppliers.materials.category", "Category")}</TableHead>
              <TableHead className="w-10">
                <span className="sr-only">{t("common.actions", "Actions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              renderSkeleton()
            ) : filteredMaterials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {error
                    ? t("suppliers.materials.error", "Error: {{error}}", { error })
                    : t("suppliers.materials.noMaterials", "No materials found")}
                </TableCell>
              </TableRow>
            ) : (
              paginatedMaterials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSetPreferred(material, !material.is_preferred)}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          material.is_preferred ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        }`}
                      />
                      <span className="sr-only">
                        {material.is_preferred
                          ? t("suppliers.materials.unsetPreferred", "Unset as preferred")
                          : t("suppliers.materials.setPreferred", "Set as preferred")}
                      </span>
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">
                    {material.material_name}
                    {material.material_unit && (
                      <span className="text-gray-500 ml-1">({material.material_unit})</span>
                    )}
                  </TableCell>
                  <TableCell>{formatPrice(material.unit_price)}</TableCell>
                  <TableCell>
                    {material.min_order_quantity
                      ? `${material.min_order_quantity} ${material.material_unit || ""}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {material.lead_time_days
                      ? t("suppliers.materials.days", "{{days}} days", { days: material.lead_time_days })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {material.material_category ? (
                      <Badge variant="outline">{material.material_category}</Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
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
                        <DropdownMenuItem onClick={() => handleEdit(material)}>
                          <Edit className="h-4 w-4 mr-2" />
                          {t("common.edit", "Edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleSetPreferred(material, !material.is_preferred)}
                        >
                          <Star className="h-4 w-4 mr-2" />
                          {material.is_preferred
                            ? t("suppliers.materials.unsetPreferred", "Unset as preferred")
                            : t("suppliers.materials.setPreferred", "Set as preferred")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(material)}
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

      {/* Dialog pentru crearea unui material */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t("suppliers.materials.addMaterial", "Add Material")}
            </DialogTitle>
            <DialogDescription>
              {t("suppliers.materials.addMaterialDescription", "Add a new material for this supplier")}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            <div className="p-1">
              <SupplierMaterialForm
                supplierId={supplierId}
                onSubmit={createMaterial}
                onCancel={() => setShowCreateDialog(false)}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Dialog pentru editarea unui material */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t("suppliers.materials.editMaterial", "Edit Material")}
            </DialogTitle>
            <DialogDescription>
              {t("suppliers.materials.editMaterialDescription", "Edit material information")}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            <div className="p-1">
              {selectedMaterial && (
                <SupplierMaterialForm
                  supplierId={supplierId}
                  initialData={selectedMaterial}
                  onSubmit={(data) => updateMaterial(selectedMaterial.id, data)}
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
              {t("suppliers.materials.deleteConfirmTitle", "Are you sure?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("suppliers.materials.deleteConfirmDescription", "This action cannot be undone. This will permanently delete the material from this supplier.")}
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

export default SupplierMaterialsTable;
