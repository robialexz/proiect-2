import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { VirtualTable, VirtualTableColumn } from '@/components/ui/virtual-table';
import { AlertTriangle, CheckCircle2, Edit, Trash2, Plus } from 'lucide-react';
import { Material } from '@/models';

interface EnhancedVirtualizedMaterialsTableProps {
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
  onSort: (field: string, direction: 'asc' | 'desc') => void;
  onPageChange: (page: number) => void;
  onConfirmSuplimentar: (id: string) => void;
  onAddMaterial?: () => void;
}

const EnhancedVirtualizedMaterialsTable: React.FC<EnhancedVirtualizedMaterialsTableProps> = React.memo(({
  materials,
  loading,
  pagination,
  sort,
  onEdit,
  onDelete,
  onSort,
  onPageChange,
  onConfirmSuplimentar,
  onAddMaterial
}) => {
  const { t } = useTranslation();
  
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
  
  // Definim coloanele pentru tabel
  const columns = useMemo<VirtualTableColumn<Material>[]>(() => [
    {
      key: 'id',
      header: t('inventory.table.id', 'ID'),
      cell: (material) => (
        <span className="font-mono text-xs">
          {material.id.substring(0, 8)}...
        </span>
      ),
      width: 100,
      sortable: true
    },
    {
      key: 'name',
      header: t('inventory.table.name', 'Nume'),
      cell: (material) => (
        <div className="flex flex-col">
          <span className="font-medium">{material.name}</span>
          {material.description && (
            <span className="text-xs text-muted-foreground truncate max-w-[250px]">
              {material.description}
            </span>
          )}
        </div>
      ),
      sortable: true
    },
    {
      key: 'quantity',
      header: t('inventory.table.quantity', 'Cantitate'),
      cell: (material) => (
        <div className="flex flex-col">
          <div className="flex items-center">
            <span className={`font-medium ${hasLowStock(material) ? 'text-destructive' : ''}`}>
              {material.quantity} {material.unit}
            </span>
            {hasLowStock(material) && (
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
                onClick={() => onConfirmSuplimentar(material.id)}
                title={t('inventory.actions.confirmSuplimentar', 'Confirmă cantitatea suplimentară')}
              >
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </Button>
            </div>
          )}
        </div>
      ),
      sortable: true
    },
    {
      key: 'category',
      header: t('inventory.table.category', 'Categorie'),
      cell: (material) => (
        material.category ? (
          <Badge variant="outline" className="capitalize">
            {material.category}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
      sortable: true
    },
    {
      key: 'location',
      header: t('inventory.table.location', 'Locație'),
      cell: (material) => (
        material.location || (
          <span className="text-muted-foreground">-</span>
        )
      ),
      sortable: true
    },
    {
      key: 'cost_per_unit',
      header: t('inventory.table.price', 'Preț'),
      cell: (material) => formatPrice(material.cost_per_unit),
      sortable: true
    },
    {
      key: 'actions',
      header: t('inventory.table.actions', 'Acțiuni'),
      cell: (material) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(material)}
            title={t('inventory.actions.edit', 'Editează')}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(material)}
            title={t('inventory.actions.delete', 'Șterge')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: 'text-right'
    }
  ], [t, hasLowStock, formatPrice, onConfirmSuplimentar, onEdit, onDelete]);
  
  // Componenta pentru starea de încărcare
  const loadingComponent = (
    <div className="space-y-4 p-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  );
  
  // Componenta pentru starea goală
  const emptyComponent = (
    <div className="p-8 text-center">
      <p className="text-muted-foreground mb-4">
        {t('inventory.table.noMaterials', 'Nu există materiale în inventar.')}
      </p>
      {onAddMaterial && (
        <Button variant="outline" onClick={onAddMaterial}>
          <Plus className="h-4 w-4 mr-2" />
          {t('inventory.actions.addMaterial', 'Adaugă material')}
        </Button>
      )}
    </div>
  );
  
  // Funcție pentru gestionarea sortării
  const handleSort = useCallback((key: string) => {
    const newDirection = sort.field === key && sort.direction === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  }, [sort, onSort]);
  
  return (
    <VirtualTable
      items={materials}
      columns={columns}
      height={500}
      rowHeight={60}
      isLoading={loading}
      loadingComponent={loadingComponent}
      emptyComponent={emptyComponent}
      onSort={handleSort}
      sortColumn={sort.field}
      sortDirection={sort.direction}
      onRowClick={(item) => onEdit(item)}
      keyExtractor={(item) => item.id}
      pagination={{
        page: pagination.page,
        pageSize: pagination.limit,
        totalItems: pagination.total,
        onPageChange
      }}
      stickyHeader
      className="rounded-md border"
    />
  );
});

EnhancedVirtualizedMaterialsTable.displayName = 'EnhancedVirtualizedMaterialsTable';

export default EnhancedVirtualizedMaterialsTable;
