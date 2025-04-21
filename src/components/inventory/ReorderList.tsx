import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Loader2, Download, Printer, AlertTriangle } from 'lucide-react';
import { LowStockItem } from '@/types';

interface ReorderListProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'csv' | 'json') => Promise<{ success: boolean; error?: string }>;
  onGenerateList: () => Promise<{ success: boolean; data?: LowStockItem[]; error?: string }>;
}

const ReorderList: React.FC<ReorderListProps> = ({
  isOpen,
  onClose,
  onExport,
  onGenerateList
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<LowStockItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Generăm lista de reaprovizionare
  const generateList = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await onGenerateList();
      
      if (result.success && result.data) {
        setItems(result.data);
      } else {
        setError(result.error || t('inventory.reorder.generateError', 'Eroare la generarea listei'));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Exportăm lista
  const handleExport = async (format: 'csv' | 'json') => {
    try {
      await onExport(format);
    } catch (error) {
      // Removed console statement
    }
  };

  // Printăm lista
  const handlePrint = () => {
    window.print();
  };

  // Calculăm valoarea totală a listei
  const totalValue = items.reduce((total, item) => {
    const itemCost = (item.cost_per_unit || 0) * (item.reorderQuantity || 0);
    return total + itemCost;
  }, 0);

  // Formatăm prețul
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(price);
  };

  // Încărcăm lista la deschiderea dialogului
  React.useEffect(() => {
    if (isOpen) {
      generateList();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            {t('inventory.reorder.title', 'Listă de reaprovizionare')}
          </DialogTitle>
          <DialogDescription>
            {t('inventory.reorder.description', 'Materiale cu stoc sub nivelul minim care necesită reaprovizionare')}
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">
              {t('inventory.reorder.loading', 'Se generează lista...')}
            </span>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 p-4 rounded-md text-destructive">
            <h3 className="font-medium mb-1">
              {t('inventory.reorder.error', 'Eroare')}
            </h3>
            <p>{error}</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={generateList}
            >
              {t('inventory.reorder.retry', 'Încearcă din nou')}
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="font-medium mb-2">
              {t('inventory.reorder.noItems', 'Nu există materiale care necesită reaprovizionare')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t('inventory.reorder.allStocked', 'Toate materialele sunt la niveluri adecvate de stoc')}
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-md border print:border-none">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('inventory.table.name', 'Nume')}</TableHead>
                    <TableHead className="text-right">{t('inventory.table.currentStock', 'Stoc curent')}</TableHead>
                    <TableHead className="text-right">{t('inventory.table.minStock', 'Stoc minim')}</TableHead>
                    <TableHead className="text-right">{t('inventory.table.deficit', 'Deficit')}</TableHead>
                    <TableHead className="text-right">{t('inventory.table.reorderQuantity', 'Cantitate de comandat')}</TableHead>
                    <TableHead className="text-right">{t('inventory.table.unitPrice', 'Preț unitar')}</TableHead>
                    <TableHead className="text-right">{t('inventory.table.totalPrice', 'Preț total')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{item.name}</span>
                          {item.category && (
                            <Badge variant="outline" className="w-fit mt-1">
                              {item.category}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {item.min_stock_level} {item.unit}
                      </TableCell>
                      <TableCell className="text-right font-mono text-destructive">
                        {item.deficit} {item.unit}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {item.reorderQuantity} {item.unit}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {item.cost_per_unit ? formatPrice(item.cost_per_unit) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {item.cost_per_unit && item.reorderQuantity
                          ? formatPrice(item.cost_per_unit * item.reorderQuantity)
                          : '-'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('inventory.reorder.totalItems', 'Total materiale')}: <span className="font-medium">{items.length}</span>
                </p>
                <p className="text-sm font-medium">
                  {t('inventory.reorder.totalValue', 'Valoare totală')}: <span className="font-medium">{formatPrice(totalValue)}</span>
                </p>
              </div>
              
              <div className="flex gap-2 print:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('csv')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('inventory.reorder.exportCsv', 'Export CSV')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  {t('inventory.reorder.print', 'Printează')}
                </Button>
              </div>
            </div>
          </>
        )}
        
        <DialogFooter className="print:hidden">
          <Button variant="outline" onClick={onClose}>
            {t('common.close', 'Închide')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReorderList;
