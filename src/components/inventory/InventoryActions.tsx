import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, FileDown, FileUp, AlertTriangle, MoreHorizontal, RefreshCw } from 'lucide-react';

interface InventoryActionsProps {
  onAddMaterial: () => void;
  onExport: (format: 'csv' | 'json') => void;
  onImport: () => void;
  onReorderList: () => void;
  onRefresh: () => void;
  className?: string;
}

const InventoryActions: React.FC<InventoryActionsProps> = React.memo(({
  onAddMaterial,
  onExport,
  onImport,
  onReorderList,
  onRefresh,
  className
}) => {
  const { t } = useTranslation();

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Button onClick={onAddMaterial}>
        <Plus className="h-4 w-4 mr-2" />
        {t('inventory.actions.addMaterial', 'Adaugă material')}
      </Button>
      
      <Button variant="outline" onClick={onReorderList}>
        <AlertTriangle className="h-4 w-4 mr-2" />
        {t('inventory.actions.reorderList', 'Listă reaprovizionare')}
      </Button>
      
      <Button variant="outline" onClick={onRefresh}>
        <RefreshCw className="h-4 w-4 mr-2" />
        {t('inventory.actions.refresh', 'Reîmprospătează')}
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <MoreHorizontal className="h-4 w-4 mr-2" />
            {t('inventory.actions.more', 'Mai multe')}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onExport('csv')}>
            <FileDown className="h-4 w-4 mr-2" />
            {t('inventory.actions.exportCsv', 'Export CSV')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport('json')}>
            <FileDown className="h-4 w-4 mr-2" />
            {t('inventory.actions.exportJson', 'Export JSON')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onImport}>
            <FileUp className="h-4 w-4 mr-2" />
            {t('inventory.actions.import', 'Import Excel/CSV')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});

InventoryActions.displayName = 'InventoryActions';

export default InventoryActions;
