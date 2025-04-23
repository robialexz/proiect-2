import React from 'react';
import { MaterialWithProject } from '@/models/inventory';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Package, 
  Calendar, 
  Tag, 
  MapPin, 
  Truck, 
  DollarSign, 
  AlertTriangle,
  FileText,
  Building,
  Ruler
} from 'lucide-react';

interface MaterialDetailsDialogProps {
  material: MaterialWithProject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}

const MaterialDetailsDialog: React.FC<MaterialDetailsDialogProps> = ({
  material,
  open,
  onOpenChange,
  onEdit
}) => {
  const { t } = useTranslation();

  // Funcție pentru a formata data
  const formatDate = (dateString?: string) => {
    if (!dateString) return t('inventory.materialDetails.never', 'Never');
    return format(new Date(dateString), 'PPp', { locale: ro });
  };
  
  // Funcție pentru a verifica dacă un material are stoc scăzut
  const hasLowStock = (material: MaterialWithProject) => {
    return material?.min_stock_level !== undefined && 
           material?.quantity < material.min_stock_level;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2 text-primary" />
            {t('inventory.materialDetails.title', 'Material Details')}
          </DialogTitle>
          <DialogDescription>
            {t('inventory.materialDetails.description', 'Detailed information about this material')}
          </DialogDescription>
        </DialogHeader>

        {material && (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">{material.name}</h3>
                  {material.dimension && (
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Ruler className="h-3 w-3 mr-1" />
                      {material.dimension}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {hasLowStock(material) && (
                    <Badge variant="destructive" className="flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {t('inventory.materialDetails.lowStock', 'Low Stock')}
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {material.category || t('inventory.materialDetails.uncategorized', 'Uncategorized')}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">
                  {t('inventory.materialDetails.basicInfo', 'Basic Information')}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Tag className="h-3 w-3 mr-1" />
                      {t('inventory.materialDetails.unit', 'Unit')}
                    </p>
                    <p className="text-sm">{material.unit}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Building className="h-3 w-3 mr-1" />
                      {t('inventory.materialDetails.manufacturer', 'Manufacturer')}
                    </p>
                    <p className="text-sm">
                      {material.manufacturer || t('inventory.materialDetails.notSpecified', 'Not specified')}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {t('inventory.materialDetails.costPerUnit', 'Cost Per Unit')}
                    </p>
                    <p className="text-sm">
                      {material.cost_per_unit 
                        ? `${material.cost_per_unit} RON` 
                        : t('inventory.materialDetails.notSpecified', 'Not specified')}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Truck className="h-3 w-3 mr-1" />
                      {t('inventory.materialDetails.supplier', 'Supplier')}
                    </p>
                    <p className="text-sm">
                      {material.supplier_id || t('inventory.materialDetails.notSpecified', 'Not specified')}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">
                  {t('inventory.materialDetails.stockInfo', 'Stock Information')}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Package className="h-3 w-3 mr-1" />
                      {t('inventory.materialDetails.currentStock', 'Current Stock')}
                    </p>
                    <p className="text-sm font-medium">
                      <Badge variant={hasLowStock(material) ? 'destructive' : 'outline'} className="text-base">
                        {material.quantity} {material.unit}
                      </Badge>
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {t('inventory.materialDetails.location', 'Location')}
                    </p>
                    <p className="text-sm">
                      {material.location || t('inventory.materialDetails.notSpecified', 'Not specified')}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {t('inventory.materialDetails.minStockLevel', 'Min Stock Level')}
                    </p>
                    <p className="text-sm">
                      {material.min_stock_level !== undefined 
                        ? `${material.min_stock_level} ${material.unit}` 
                        : t('inventory.materialDetails.notSet', 'Not set')}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {t('inventory.materialDetails.maxStockLevel', 'Max Stock Level')}
                    </p>
                    <p className="text-sm">
                      {material.max_stock_level !== undefined 
                        ? `${material.max_stock_level} ${material.unit}` 
                        : t('inventory.materialDetails.notSet', 'Not set')}
                    </p>
                  </div>
                </div>
              </div>

              {material.project_id && (
                <>
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">
                      {t('inventory.materialDetails.projectInfo', 'Project Information')}
                    </h4>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Building className="h-3 w-3 mr-1" />
                        {t('inventory.materialDetails.assignedProject', 'Assigned Project')}
                      </p>
                      <p className="text-sm">
                        {material.project_name || material.project_id}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {material.notes && (
                <>
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">
                      {t('inventory.materialDetails.notes', 'Notes')}
                    </h4>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center">
                        <FileText className="h-3 w-3 mr-1" />
                        {t('inventory.materialDetails.additionalInfo', 'Additional Information')}
                      </p>
                      <p className="text-sm whitespace-pre-line">
                        {material.notes}
                      </p>
                    </div>
                  </div>
                </>
              )}

              <Separator />
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium">
                  {t('inventory.materialDetails.systemInfo', 'System Information')}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {t('inventory.materialDetails.createdAt', 'Created At')}
                    </p>
                    <p className="text-sm">{formatDate(material.created_at)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {t('inventory.materialDetails.updatedAt', 'Updated At')}
                    </p>
                    <p className="text-sm">{formatDate(material.updated_at)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {t('inventory.materialDetails.lastOrderDate', 'Last Order Date')}
                    </p>
                    <p className="text-sm">{formatDate(material.last_order_date)}</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.close', 'Close')}
          </Button>
          <Button onClick={onEdit}>
            {t('common.edit', 'Edit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialDetailsDialog;
