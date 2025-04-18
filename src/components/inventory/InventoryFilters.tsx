import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, X } from 'lucide-react';
import ProjectSelector from './ProjectSelector';

interface InventoryFiltersProps {
  categories: string[];
  filters: {
    searchTerm?: string;
    category?: string;
    projectId?: string | null;
    lowStock?: boolean;
  };
  onFilterChange: (filters: any) => void;
  className?: string;
}

const InventoryFilters: React.FC<InventoryFiltersProps> = React.memo(({
  categories,
  filters,
  onFilterChange,
  className
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Gestionăm schimbarea termenului de căutare
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Gestionăm apăsarea tastei Enter în câmpul de căutare
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onFilterChange({ ...filters, searchTerm });
    }
  };

  // Gestionăm apăsarea butonului de căutare
  const handleSearchClick = () => {
    onFilterChange({ ...filters, searchTerm });
  };

  // Gestionăm schimbarea categoriei
  const handleCategoryChange = (value: string) => {
    onFilterChange({ 
      ...filters, 
      category: value === 'all' ? undefined : value 
    });
  };

  // Gestionăm schimbarea proiectului
  const handleProjectChange = (projectId: string | null) => {
    onFilterChange({ ...filters, projectId });
  };

  // Gestionăm schimbarea filtrului pentru stoc scăzut
  const handleLowStockChange = (checked: boolean) => {
    onFilterChange({ ...filters, lowStock: checked });
  };

  // Gestionăm resetarea filtrelor
  const handleResetFilters = () => {
    setSearchTerm('');
    onFilterChange({});
  };

  // Verificăm dacă există filtre active
  const hasActiveFilters = 
    !!filters.searchTerm || 
    !!filters.category || 
    !!filters.projectId || 
    !!filters.lowStock;

  return (
    <div className={`flex flex-col md:flex-row gap-4 ${className}`}>
      {/* Căutare */}
      <div className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder={t('inventory.filters.searchPlaceholder', 'Caută materiale...')}
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            className="pr-10"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full"
            onClick={handleSearchClick}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Buton pentru filtre pe mobil */}
        <div className="md:hidden">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h3 className="font-medium">
                  {t('inventory.filters.title', 'Filtre')}
                </h3>
                
                {/* Selector de proiect */}
                <ProjectSelector
                  selectedProjectId={filters.projectId || null}
                  onProjectChange={handleProjectChange}
                />
                
                {/* Selector de categorie */}
                <div className="space-y-1.5">
                  <Label htmlFor="category-select">
                    {t('inventory.filters.category', 'Categorie')}
                  </Label>
                  <Select
                    value={filters.category || 'all'}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger id="category-select">
                      <SelectValue placeholder={t('inventory.filters.categoryPlaceholder', 'Selectează o categorie')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t('inventory.filters.allCategories', 'Toate categoriile')}
                      </SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Checkbox pentru stoc scăzut */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="low-stock-mobile"
                    checked={!!filters.lowStock}
                    onCheckedChange={handleLowStockChange}
                  />
                  <Label htmlFor="low-stock-mobile" className="cursor-pointer">
                    {t('inventory.filters.lowStock', 'Doar stoc scăzut')}
                  </Label>
                </div>
                
                {/* Buton pentru resetarea filtrelor */}
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleResetFilters}
                  >
                    <X className="h-4 w-4 mr-2" />
                    {t('inventory.filters.resetFilters', 'Resetează filtrele')}
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Filtre desktop */}
      <div className="hidden md:flex md:flex-row gap-4 items-end">
        {/* Selector de categorie */}
        <div className="space-y-1.5">
          <Label htmlFor="category-select-desktop">
            {t('inventory.filters.category', 'Categorie')}
          </Label>
          <Select
            value={filters.category || 'all'}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger id="category-select-desktop" className="w-[180px]">
              <SelectValue placeholder={t('inventory.filters.categoryPlaceholder', 'Selectează o categorie')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('inventory.filters.allCategories', 'Toate categoriile')}
              </SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Checkbox pentru stoc scăzut */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="low-stock-desktop"
            checked={!!filters.lowStock}
            onCheckedChange={handleLowStockChange}
          />
          <Label htmlFor="low-stock-desktop" className="cursor-pointer">
            {t('inventory.filters.lowStock', 'Doar stoc scăzut')}
          </Label>
        </div>
        
        {/* Buton pentru resetarea filtrelor */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
          >
            <X className="h-4 w-4 mr-2" />
            {t('inventory.filters.resetFilters', 'Resetează filtrele')}
          </Button>
        )}
      </div>
    </div>
  );
});

InventoryFilters.displayName = 'InventoryFilters';

export default InventoryFilters;
