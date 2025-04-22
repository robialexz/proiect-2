import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/formatters';
import { 
  Package, 
  AlertTriangle, 
  DollarSign, 
  Layers 
} from 'lucide-react';

interface InventoryStatsProps {
  stats: {
    totalItems: number;
    totalValue: number;
    categoriesCount: number;
    lowStockCount: number;
  };
  loading: boolean;
}

export const InventoryStats: React.FC<InventoryStatsProps> = ({ stats, loading }) => {
  const { t } = useTranslation();
  
  const statItems = [
    {
      title: t('inventory.stats.totalItems', 'Total materiale'),
      value: stats.totalItems,
      icon: <Package className="h-5 w-5 text-blue-500" />,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: t('inventory.stats.totalValue', 'Valoare totală'),
      value: formatCurrency(stats.totalValue),
      icon: <DollarSign className="h-5 w-5 text-green-500" />,
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: t('inventory.stats.categories', 'Categorii'),
      value: stats.categoriesCount,
      icon: <Layers className="h-5 w-5 text-purple-500" />,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      title: t('inventory.stats.lowStock', 'Stoc scăzut'),
      value: stats.lowStockCount,
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700'
    }
  ];
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {loading ? (
        // Skeleton pentru încărcare
        Array(4).fill(0).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-6 w-[80px]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        // Carduri cu statistici
        statItems.map((item, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-full ${item.bgColor} flex items-center justify-center`}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{item.title}</p>
                  <h3 className={`text-2xl font-bold ${item.textColor}`}>
                    {item.value}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default InventoryStats;
