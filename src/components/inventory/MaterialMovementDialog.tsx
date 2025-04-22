import React, { useState } from 'react';
import { MaterialWithProject } from '@/models/inventory';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Truck, ArrowRight, Package, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface MaterialMovementDialogProps {
  material: MaterialWithProject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecordMovement: (materialId: string, quantity: number, type: 'receipt' | 'issue' | 'return' | 'adjustment' | 'transfer', notes?: string) => Promise<boolean>;
  loading: boolean;
}

// Schema de validare pentru formular
const movementSchema = z.object({
  quantity: z.coerce.number().min(0.01, { message: 'Quantity must be greater than 0' }),
  movement_type: z.enum(['receipt', 'issue', 'return', 'adjustment', 'transfer'], {
    required_error: 'Movement type is required',
  }),
  notes: z.string().optional(),
});

type MovementFormValues = z.infer<typeof movementSchema>;

const MaterialMovementDialog: React.FC<MaterialMovementDialogProps> = ({
  material,
  open,
  onOpenChange,
  onRecordMovement,
  loading
}) => {
  const { t } = useTranslation();
  
  // Inițializăm formularul
  const form = useForm<MovementFormValues>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      quantity: 0,
      movement_type: 'receipt',
      notes: '',
    }
  });
  
  // Gestionăm înregistrarea mișcării
  const handleRecordMovement = async (values: MovementFormValues) => {
    if (!material) return;
    
    const success = await onRecordMovement(
      material.id,
      values.quantity,
      values.movement_type,
      values.notes
    );
    
    if (success) {
      onOpenChange(false);
    }
  };
  
  // Funcție pentru a verifica dacă un material are stoc scăzut
  const hasLowStock = (material: MaterialWithProject) => {
    return material?.min_stock_level !== undefined && 
           material?.quantity < material.min_stock_level;
  };
  
  // Funcție pentru a obține descrierea tipului de mișcare
  const getMovementTypeDescription = (type: string) => {
    switch (type) {
      case 'receipt':
        return t('inventory.movement.receiptDesc', 'Add items to inventory (e.g., new delivery)');
      case 'issue':
        return t('inventory.movement.issueDesc', 'Remove items from inventory (e.g., used in project)');
      case 'return':
        return t('inventory.movement.returnDesc', 'Return items to inventory (e.g., unused materials)');
      case 'adjustment':
        return t('inventory.movement.adjustmentDesc', 'Adjust inventory count (e.g., after stocktaking)');
      case 'transfer':
        return t('inventory.movement.transferDesc', 'Transfer items between locations');
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Truck className="h-5 w-5 mr-2 text-primary" />
            {t('inventory.movement.title', 'Record Material Movement')}
          </DialogTitle>
          <DialogDescription>
            {t('inventory.movement.description', 'Record receipt, issue, return or adjustment of material')}
          </DialogDescription>
        </DialogHeader>

        {material && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRecordMovement)} className="space-y-4 py-4">
              <div className="flex items-center justify-between bg-muted p-3 rounded-md">
                <div>
                  <h3 className="font-medium">{material.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {material.dimension ? `${material.dimension} - ` : ''}
                    {material.category || t('inventory.movement.uncategorized', 'Uncategorized')}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <Badge variant={hasLowStock(material) ? 'destructive' : 'outline'} className="mb-1">
                    <Package className="h-3 w-3 mr-1" />
                    {t('inventory.movement.currentStock', 'Current Stock')}: {material.quantity} {material.unit}
                  </Badge>
                  {hasLowStock(material) && (
                    <span className="text-xs text-red-500 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {t('inventory.movement.lowStock', 'Low Stock')}
                    </span>
                  )}
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="movement_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('inventory.movement.type', 'Movement Type')}</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('inventory.movement.selectType', 'Select movement type')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="receipt">
                          {t('inventory.movement.receipt', 'Receipt')}
                        </SelectItem>
                        <SelectItem value="issue">
                          {t('inventory.movement.issue', 'Issue')}
                        </SelectItem>
                        <SelectItem value="return">
                          {t('inventory.movement.return', 'Return')}
                        </SelectItem>
                        <SelectItem value="adjustment">
                          {t('inventory.movement.adjustment', 'Adjustment')}
                        </SelectItem>
                        <SelectItem value="transfer">
                          {t('inventory.movement.transfer', 'Transfer')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {getMovementTypeDescription(field.value)}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('inventory.movement.quantity', 'Quantity')}</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Input type="number" step="0.01" {...field} />
                        <span className="ml-2">{material.unit}</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('inventory.movement.notes', 'Notes')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t('inventory.movement.notesPlaceholder', 'Add any additional information about this movement')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="bg-muted p-3 rounded-md mt-4">
                <h4 className="text-sm font-medium mb-2">
                  {t('inventory.movement.preview', 'Movement Preview')}
                </h4>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-muted-foreground">
                      {t('inventory.movement.currentStock', 'Current Stock')}:
                    </span>
                    <span className="ml-1 font-medium">
                      {material.quantity} {material.unit}
                    </span>
                  </div>
                  
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  
                  <div className="text-sm">
                    <span className="text-muted-foreground">
                      {t('inventory.movement.newStock', 'New Stock')}:
                    </span>
                    <span className="ml-1 font-medium">
                      {(() => {
                        const quantity = form.getValues('quantity') || 0;
                        const type = form.getValues('movement_type');
                        
                        switch (type) {
                          case 'receipt':
                          case 'return':
                            return material.quantity + quantity;
                          case 'issue':
                            return Math.max(0, material.quantity - quantity);
                          case 'adjustment':
                            return quantity;
                          case 'transfer':
                            return material.quantity; // No change in total quantity
                          default:
                            return material.quantity;
                        }
                      })()} {material.unit}
                    </span>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('inventory.movement.recording', 'Recording...')}
                    </>
                  ) : (
                    t('inventory.movement.record', 'Record Movement')
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MaterialMovementDialog;
