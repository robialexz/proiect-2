import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LowStockItem } from '@/types';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LowStockCardProps {
  item: LowStockItem;
}

export const LowStockCard: React.FC<LowStockCardProps> = ({ item }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Calculăm procentul de stoc rămas
  const stockPercentage = item.min_stock_level 
    ? Math.min(Math.round((item.quantity / item.min_stock_level) * 100), 100)
    : 0;
  
  // Determinăm culoarea pentru progress bar
  const getProgressColor = (percentage: number) => {
    if (percentage < 30) return 'bg-red-500';
    if (percentage < 70) return 'bg-amber-500';
    return 'bg-green-500';
  };
  
  const handleAddStock = () => {
    navigate(`/inventory-management/edit/${item.id}?tab=stock`);
  };
  
  return (
    <div className="p-3 border rounded-lg hover:bg-slate-50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <h4 className="text-sm font-medium">{item.name}</h4>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={handleAddStock}
        >
          <Plus className="h-3 w-3 mr-1" />
          {t('inventory.addStock', 'Adaugă')}
        </Button>
      </div>
      
      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
        <span>
          {item.quantity} / {item.min_stock_level} {item.unit}
        </span>
        <span className={stockPercentage < 30 ? 'text-red-500 font-medium' : ''}>
          {stockPercentage}%
        </span>
      </div>
      
      <Progress 
        value={stockPercentage} 
        className="h-1.5"
        indicatorClassName={getProgressColor(stockPercentage)}
      />
    </div>
  );
};

export default LowStockCard;
