import React, { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FixedSizeList as List } from 'react-window';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Edit, Trash2, Plus, ArrowUpDown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Material } from '@/types';

interface VirtualizedMaterialsTableProps {
  materials: Material[];
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  sort: {
    field: string;
    direction: 'asc' | 'desc';
  };
  onEdit: (material: Material) => void;
  onDelete: (material: Material) => void;
  onSort: (field: string) => void;
  onPageChange: (page: number) => void;
  onConfirmSuplimentar: (id: string) => void;
}

const VirtualizedMaterialsTable: React.FC<VirtualizedMaterialsTableProps> = React.memo(({
  materials,
  loading,
  pagination,
  sort,
  onEdit,
  onDelete,
  onSort,
  onPageChange,
  onConfirmSuplimentar
}) => {
  const { t } = useTranslation();
  const tableRef = useRef<HTMLDivElement>(null);

  // Calculăm numărul total de pagini
  const totalPages = useMemo(() => {
    return Math.ceil(pagination.total / pagination.limit);
  }, [pagination.total, pagination.limit]);

  // Generăm paginile pentru navigare
  const pageItems = useMemo(() => {
    const items = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={i === pagination.page}
            onClick={() => onPageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  }, [pagination.page, totalPages, onPageChange]);

  // Configurăm dimensiunile pentru virtualizare
  const ROW_HEIGHT = 60; // Înălțimea fiecărui rând în pixeli
  const TABLE_HEIGHT = Math.min(materials.length * ROW_HEIGHT, 400); // Înălțimea maximă a tabelului

  // Funcție pentru a genera header-ul de sortare
  const SortableHeader = useCallback(({ field, label }: { field: string, label: string }) => (
    <Button
      variant="ghost"
      onClick={() => onSort(field)}
      className="h-8 font-medium text-left flex items-center"
    >
      {label}
      <ArrowUpDown className={`ml-2 h-4 w-4 ${sort.field === field ? 'opacity-100' : 'opacity-50'}`} />
    </Button>
  ), [onSort, sort.field]);

  // Funcție pentru a verifica dacă un material are stoc scăzut
  const hasLowStock = useCallback((material: Material) => {
    return material.min_stock_level !== undefined &&
           material.min_stock_level !== null &&
           material.quantity < material.min_stock_level;
  }, []);

  // Funcție pentru a formata prețul
  const formatPrice = useCallback((price?: number) => {
    if (price === undefined || price === null) return '-';
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(price);
  }, []);

  // Randăm scheletul de încărcare
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">{t('inventory.table.id', 'ID')}</TableHead>
                <TableHead>{t('inventory.table.name', 'Nume')}</TableHead>
                <TableHead>{t('inventory.table.quantity', 'Cantitate')}</TableHead>
                <TableHead>{t('inventory.table.category', 'Categorie')}</TableHead>
                <TableHead>{t('inventory.table.location', 'Locație')}</TableHead>
                <TableHead>{t('inventory.table.actions', 'Acțiuni')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Skeleton className="h-8 w-8" />
            </PaginationItem>
            <PaginationItem>
              <Skeleton className="h-8 w-8" />
            </PaginationItem>
            <PaginationItem>
              <Skeleton className="h-8 w-8" />
            </PaginationItem>
            <PaginationItem>
              <Skeleton className="h-8 w-8" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  }

  // Randăm tabelul gol dacă nu există materiale
  if (materials.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground mb-4">
          {t('inventory.table.noMaterials', 'Nu există materiale în inventar.')}
        </p>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          {t('inventory.actions.addMaterial', 'Adaugă material')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <SortableHeader
                  field="id"
                  label={t('inventory.table.id', 'ID')}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  field="name"
                  label={t('inventory.table.name', 'Nume')}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  field="quantity"
                  label={t('inventory.table.quantity', 'Cantitate')}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  field="category"
                  label={t('inventory.table.category', 'Categorie')}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  field="location"
                  label={t('inventory.table.location', 'Locație')}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  field="cost_per_unit"
                  label={t('inventory.table.price', 'Preț')}
                />
              </TableHead>
              <TableHead className="text-right">
                {t('inventory.table.actions', 'Acțiuni')}
              </TableHead>
            </TableRow>
          </TableHeader>

          {/* Tabel virtualizat */}
          <TableBody>
            <div ref={tableRef} style={{ height: `${TABLE_HEIGHT}px`, overflow: 'auto' }}>
              <List
                height={TABLE_HEIGHT}
                itemCount={materials.length}
                itemSize={ROW_HEIGHT}
                width="100%"
                itemData={{
                  materials,
                  hasLowStock,
                  formatPrice,
                  onConfirmSuplimentar,
                  onEdit,
                  onDelete,
                  t
                }}
              >
                {({ index, style, data }) => {
                  const material = data.materials[index];
                  return (
                    <TableRow
                      key={material.id}
                      style={style}
                    >
                    <TableCell className="font-mono text-xs">
                      {material.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{material.name}</span>
                        {material.description && (
                          <span className="text-xs text-muted-foreground truncate max-w-[250px]">
                            {material.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <span className={`font-medium ${data.hasLowStock(material) ? 'text-destructive' : ''}`}>
                            {material.quantity} {material.unit}
                          </span>
                          {data.hasLowStock(material) && (
                            <AlertTriangle className="h-4 w-4 text-destructive ml-1" />
                          )}
                        </div>
                        {material.min_stock_level !== undefined && material.min_stock_level !== null && (
                          <span className="text-xs text-muted-foreground">
                            Min: {material.min_stock_level} {material.unit}
                          </span>
                        )}
                        {material.suplimentar !== undefined && material.suplimentar !== null && material.suplimentar > 0 && (
                          <div className="flex items-center mt-1">
                            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200">
                              +{material.suplimentar} {material.unit}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 ml-1"
                              onClick={() => data.onConfirmSuplimentar(material.id)}
                              title={data.t('inventory.actions.confirmSuplimentar', 'Confirmă cantitatea suplimentară')}
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {material.category ? (
                        <Badge variant="outline" className="capitalize">
                          {material.category}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {material.location || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {data.formatPrice(material.cost_per_unit)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => data.onEdit(material)}
                          title={data.t('inventory.actions.edit', 'Editează')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => data.onDelete(material)}
                          title={data.t('inventory.actions.delete', 'Șterge')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
                }}
              </List>
            </div>
          </TableBody>
        </Table>
      </div>

      {/* Paginare */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
                isDisabled={pagination.page === 1}
              />
            </PaginationItem>

            {pageItems}

            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(Math.min(totalPages, pagination.page + 1))}
                isDisabled={pagination.page === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
});

VirtualizedMaterialsTable.displayName = 'VirtualizedMaterialsTable';

export default VirtualizedMaterialsTable;
