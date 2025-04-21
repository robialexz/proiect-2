import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMaterialOperations } from "@/hooks/useMaterialOperations";
import { MaterialOperationWithDetails, OperationType } from "@/models/material-operation.model";
import { ArrowDown, ArrowUp, RotateCcw, MoreHorizontal, FileDown, Trash2, Edit, Filter, Search, RefreshCw } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface MaterialOperationsLogProps {
  projectId?: string;
  materialId?: string;
  onEdit?: (operation: MaterialOperationWithDetails) => void;
  onDelete?: (operation: MaterialOperationWithDetails) => void;
}

const MaterialOperationsLog: React.FC<MaterialOperationsLogProps> = ({
  projectId,
  materialId,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const {
    operations,
    filteredOperations,
    paginatedOperations,
    loading,
    error,
    pagination,
    setPagination,
    filters,
    setFilters,
    sort,
    setSort,
    loadOperations,
    deleteOperation,
    exportOperations,
  } = useMaterialOperations(projectId, materialId);

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [operationToDelete, setOperationToDelete] = useState<MaterialOperationWithDetails | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Actualizăm filtrele când se schimbă termenul de căutare
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ ...filters, searchTerm });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, setFilters, filters]);

  // Funcție pentru formatarea datei
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: ro });
    } catch (error) {
      return dateString;
    }
  };

  // Funcție pentru obținerea culorii badge-ului în funcție de tipul operațiunii
  const getOperationBadgeColor = (type: OperationType) => {
    switch (type) {
      case "reception":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "consumption":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "return":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  // Funcție pentru obținerea iconului în funcție de tipul operațiunii
  const getOperationIcon = (type: OperationType) => {
    switch (type) {
      case "reception":
        return <ArrowDown className="h-4 w-4 text-green-600" />;
      case "consumption":
        return <ArrowUp className="h-4 w-4 text-red-600" />;
      case "return":
        return <RotateCcw className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  // Funcție pentru obținerea textului în funcție de tipul operațiunii
  const getOperationText = (type: OperationType) => {
    switch (type) {
      case "reception":
        return t("inventory.operations.reception", "Reception");
      case "consumption":
        return t("inventory.operations.consumption", "Consumption");
      case "return":
        return t("inventory.operations.return", "Return");
      default:
        return type;
    }
  };

  // Funcție pentru ștergerea unei operațiuni
  const handleDelete = async (operation: MaterialOperationWithDetails) => {
    const result = await deleteOperation(operation.id);
    if (result.success) {
      setOperationToDelete(null);
    }
  };

  // Funcție pentru exportul operațiunilor
  const handleExport = async (format: "excel" | "csv") => {
    setIsExporting(true);
    try {
      await exportOperations(format);
    } finally {
      setIsExporting(false);
    }
  };

  // Funcție pentru schimbarea paginii
  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  // Funcție pentru resetarea filtrelor
  const resetFilters = () => {
    setFilters({});
    setSearchTerm("");
    setShowFilters(false);
  };

  // Calculăm numărul total de pagini
  const totalPages = Math.ceil(filteredOperations.length / pagination.limit);

  // Renderăm paginarea
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={pagination.page === i}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
            />
          </PaginationItem>
          
          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
              </PaginationItem>
              {startPage > 2 && <PaginationEllipsis />}
            </>
          )}
          
          {pages}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <PaginationEllipsis />}
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(totalPages)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
          
          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(Math.min(totalPages, pagination.page + 1))}
              disabled={pagination.page === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // Renderăm scheletonul pentru încărcare
  const renderSkeleton = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="h-6 w-6 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-8" />
          </TableCell>
        </TableRow>
      ));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>{t("inventory.operations.log", "Operations Log")}</CardTitle>
            <CardDescription>
              {t("inventory.operations.logDescription", "Track all material operations")}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {t("common.filters", "Filters")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadOperations()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("common.refresh", "Refresh")}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isExporting}>
                  <FileDown className="h-4 w-4 mr-2" />
                  {t("common.export", "Export")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("common.exportFormat", "Export Format")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport("excel")}>
                  Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  CSV (.csv)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Bara de căutare */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder={t("inventory.operations.search", "Search operations...")}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={pagination.limit.toString()}
            onValueChange={(value) => setPagination({ ...pagination, page: 1, limit: parseInt(value) })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("common.rowsPerPage", "Rows per page")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 {t("common.perPage", "per page")}</SelectItem>
              <SelectItem value="10">10 {t("common.perPage", "per page")}</SelectItem>
              <SelectItem value="20">20 {t("common.perPage", "per page")}</SelectItem>
              <SelectItem value="50">50 {t("common.perPage", "per page")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtre */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-md mb-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">
                {t("inventory.operations.filters", "Filters")}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
              >
                {t("common.reset", "Reset")}
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("inventory.operations.operationType", "Operation Type")}
                </label>
                <Select
                  value={filters.operationType || ""}
                  onValueChange={(value) => setFilters({ ...filters, operationType: value as OperationType || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("inventory.operations.allTypes", "All types")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">
                      {t("inventory.operations.allTypes", "All types")}
                    </SelectItem>
                    <SelectItem value="reception">
                      <div className="flex items-center">
                        <ArrowDown className="h-4 w-4 mr-2 text-green-500" />
                        {t("inventory.operations.reception", "Reception")}
                      </div>
                    </SelectItem>
                    <SelectItem value="consumption">
                      <div className="flex items-center">
                        <ArrowUp className="h-4 w-4 mr-2 text-red-500" />
                        {t("inventory.operations.consumption", "Consumption")}
                      </div>
                    </SelectItem>
                    <SelectItem value="return">
                      <div className="flex items-center">
                        <RotateCcw className="h-4 w-4 mr-2 text-blue-500" />
                        {t("inventory.operations.return", "Return")}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("inventory.operations.dateFrom", "Date From")}
                </label>
                <Input
                  type="date"
                  value={filters.dateFrom || ""}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || undefined })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("inventory.operations.dateTo", "Date To")}
                </label>
                <Input
                  type="date"
                  value={filters.dateTo || ""}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || undefined })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tabel */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>
                  {t("inventory.operations.date", "Date")}
                </TableHead>
                <TableHead>
                  {t("inventory.operations.material", "Material")}
                </TableHead>
                <TableHead>
                  {t("inventory.operations.quantity", "Quantity")}
                </TableHead>
                <TableHead>
                  {t("inventory.operations.location", "Location")}
                </TableHead>
                <TableHead>
                  {t("inventory.operations.createdBy", "Created By")}
                </TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                renderSkeleton()
              ) : paginatedOperations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    {error ? (
                      <div className="text-red-500">
                        {t("inventory.operations.error", "Error")}: {error}
                      </div>
                    ) : (
                      t("inventory.operations.noOperations", "No operations found")
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOperations.map((operation) => (
                  <TableRow key={operation.id}>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        {getOperationIcon(operation.operation_type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDate(operation.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {operation.material_name || t("inventory.operations.unknownMaterial", "Unknown Material")}
                      </div>
                      {!materialId && operation.project_name && (
                        <div className="text-xs text-gray-500">
                          {operation.project_name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {operation.quantity}
                        </span>
                        <span className="text-xs text-gray-500">
                          {operation.material_unit}
                        </span>
                      </div>
                      {operation.unit_price && (
                        <div className="text-xs text-gray-500">
                          {t("inventory.operations.unitPrice", "Unit Price")}: {operation.unit_price}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {operation.location || "-"}
                    </TableCell>
                    <TableCell>
                      {operation.created_by_name || "-"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">
                              {t("common.actions", "Actions")}
                            </span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>
                            {t("common.actions", "Actions")}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(operation)}>
                              <Edit className="h-4 w-4 mr-2" />
                              {t("common.edit", "Edit")}
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => setOperationToDelete(operation)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t("common.delete", "Delete")}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Informații despre paginare */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
          <div className="text-sm text-gray-500">
            {t("common.showing", "Showing")} {filteredOperations.length > 0
              ? (pagination.page - 1) * pagination.limit + 1
              : 0}{" "}
            - {Math.min(pagination.page * pagination.limit, filteredOperations.length)}{" "}
            {t("common.of", "of")} {filteredOperations.length} {t("inventory.operations.operations", "operations")}
          </div>
          {renderPagination()}
        </div>
      </CardContent>

      {/* Dialog de confirmare pentru ștergere */}
      <AlertDialog open={!!operationToDelete} onOpenChange={(open) => !open && setOperationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("inventory.operations.deleteConfirmTitle", "Are you sure?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("inventory.operations.deleteConfirmDescription", "This action cannot be undone. This will permanently delete the operation and may affect material quantities.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("common.cancel", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => operationToDelete && handleDelete(operationToDelete)}
            >
              {t("common.delete", "Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default MaterialOperationsLog;
