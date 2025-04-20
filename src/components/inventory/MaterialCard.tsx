import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Material } from '@/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Edit } from 'lucide-react';

interface MaterialCardProps {
  material: Material;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({ material }) => {
  const navigate = useNavigate();
  
  const handleEdit = () => {
    navigate(`/inventory-management/edit/${material.id}`);
  };
  
  return (
    <div className="flex items-start justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
          {material.image_url ? (
            <img 
              src={material.image_url} 
              alt={material.name} 
              className="h-10 w-10 rounded-md object-cover"
            />
          ) : (
            <Package className="h-5 w-5 text-blue-600" />
          )}
        </div>
        
        <div>
          <h4 className="text-sm font-medium">{material.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-500">
              {material.quantity} {material.unit}
            </span>
            
            {material.category && (
              <Badge variant="outline" className="text-xs">
                {material.category}
              </Badge>
            )}
            
            {material.cost_per_unit && (
              <span className="text-xs text-slate-500">
                {formatCurrency(material.cost_per_unit)}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={handleEdit}
        className="h-8 w-8"
      >
        <Edit className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MaterialCard;
