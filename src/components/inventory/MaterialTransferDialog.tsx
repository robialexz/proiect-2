import React, { useState } from 'react';
import { MaterialWithProject } from '@/models/inventory';
import { Project } from '@/models/project';
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
import { Loader2, ArrowRight, Package, Building } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface MaterialTransferDialogProps {
  material: MaterialWithProject | null;
  projects: Project[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransfer: (materialId: string, fromProjectId: string | null, toProjectId: string | null, quantity: number, notes?: string) => Promise<boolean>;
  loading: boolean;
}

// Schema de validare pentru formular
const transferSchema = z.object({
  quantity: z.coerce.number().min(0.01, { message: 'Quantity must be greater than 0' }),
  to_project_id: z.string({
    required_error: 'Destination project is required',
  }),
  notes: z.string().optional(),
}).refine(data => data.to_project_id !== 'none', {
  message: 'Please select a destination project',
  path: ['to_project_id'],
});

type TransferFormValues = z.infer<typeof transferSchema>;

const MaterialTransferDialog: React.FC<MaterialTransferDialogProps> = ({
  material,
  projects,
  open,
  onOpenChange,
  onTransfer,
  loading
}) => {
  const { t } = useTranslation();
  
  // Inițializăm formularul
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      quantity: material?.quantity || 0,
      to_project_id: '',
      notes: '',
    }
  });
  
  // Actualizăm valorile implicite când se schimbă materialul
  React.useEffect(() => {
    if (material) {
      form.setValue('quantity', material.quantity);
    }
  }, [material, form]);
  
  // Gestionăm transferul
  const handleTransfer = async (values: TransferFormValues) => {
    if (!material) return;
    
    const fromProjectId = material.project_id;
    const toProjectId = values.to_project_id === 'none' ? null : values.to_project_id;
    
    const success = await onTransfer(
      material.id,
      fromProjectId,
      toProjectId,
      values.quantity,
      values.notes
    );
    
    if (success) {
      onOpenChange(false);
    }
  };
  
  // Obținem numele proiectului curent
  const getCurrentProjectName = () => {
    if (!material || !material.project_id) {
      return t('inventory.transfer.companyInventory', 'Company Inventory');
    }
    
    const project = projects.find(p => p.id === material.project_id);
    return project ? project.name : t('inventory.transfer.unknownProject', 'Unknown Project');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2 text-primary" />
            {t('inventory.transfer.title', 'Transfer Material Between Projects')}
          </DialogTitle>
          <DialogDescription>
            {t('inventory.transfer.description', 'Transfer material from one project to another')}
          </DialogDescription>
        </DialogHeader>

        {material && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleTransfer)} className="space-y-4 py-4">
              <div className="flex items-center justify-between bg-muted p-3 rounded-md">
                <div>
                  <h3 className="font-medium">{material.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {material.dimension ? `${material.dimension} - ` : ''}
                    {material.category || t('inventory.transfer.uncategorized', 'Uncategorized')}
                  </p>
                </div>
                <Badge variant="outline">
                  <Package className="h-3 w-3 mr-1" />
                  {t('inventory.transfer.currentStock', 'Current Stock')}: {material.quantity} {material.unit}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-md border">
                <div className="text-center flex-1">
                  <p className="text-sm text-muted-foreground">
                    {t('inventory.transfer.from', 'From')}
                  </p>
                  <p className="font-medium">{getCurrentProjectName()}</p>
                </div>
                
                <ArrowRight className="h-5 w-5 text-muted-foreground mx-4" />
                
                <div className="text-center flex-1">
                  <p className="text-sm text-muted-foreground">
                    {t('inventory.transfer.to', 'To')}
                  </p>
                  <FormField
                    control={form.control}
                    name="to_project_id"
                    render={({ field }) => (
                      <FormItem>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('inventory.transfer.selectDestination', 'Select destination')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">
                              {t('inventory.transfer.companyInventory', 'Company Inventory')}
                            </SelectItem>
                            {projects
                              .filter(p => p.id !== material.project_id)
                              .map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('inventory.transfer.quantity', 'Quantity to Transfer')}</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Input type="number" step="0.01" {...field} />
                        <span className="ml-2">{material.unit}</span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      {t('inventory.transfer.quantityDesc', 'Maximum available: {{quantity}}', { quantity: material.quantity })}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('inventory.transfer.notes', 'Notes')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t('inventory.transfer.notesPlaceholder', 'Add any additional information about this transfer')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                      {t('inventory.transfer.transferring', 'Transferring...')}
                    </>
                  ) : (
                    t('inventory.transfer.transfer', 'Transfer Material')
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

export default MaterialTransferDialog;
