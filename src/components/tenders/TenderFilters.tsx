import React, { useState } from 'react';
import { TenderFilters as Filters } from '@/models/tender';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon, 
  Star, 
  ThumbsUp, 
  Tag, 
  Building, 
  MapPin, 
  DollarSign
} from 'lucide-react';

interface TenderFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  cpvCodes: { code: string; description: string }[];
  authorities: string[];
  locations: string[];
  onExport: () => void;
}

const TenderFilters: React.FC<TenderFiltersProps> = ({
  filters,
  onFiltersChange,
  cpvCodes,
  authorities,
  locations,
  onExport
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [fromDate, setFromDate] = useState<Date | undefined>(
    filters.fromDate ? new Date(filters.fromDate) : undefined
  );
  const [toDate, setToDate] = useState<Date | undefined>(
    filters.toDate ? new Date(filters.toDate) : undefined
  );
  
  // Funcție pentru a actualiza filtrele
  const updateFilters = (newFilters: Partial<Filters>) => {
    onFiltersChange({ ...filters, ...newFilters });
  };
  
  // Funcție pentru a reseta filtrele
  const resetFilters = () => {
    setSearchTerm('');
    setFromDate(undefined);
    setToDate(undefined);
    onFiltersChange({});
  };
  
  // Funcție pentru a verifica dacă există filtre active
  const hasActiveFilters = () => {
    return Object.values(filters).some(value => 
      value !== undefined && value !== '' && value !== false
    );
  };
  
  // Funcție pentru a obține numărul de filtre active
  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== '' && value !== false
    ).length;
  };
  
  // Funcție pentru a formata data
  const formatDate = (date?: Date) => {
    if (!date) return '';
    return format(date, 'PPP', { locale: ro });
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder={t('tenders.filters.search', 'Search tenders...')}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateFilters({ search: searchTerm });
              }
            }}
          />
          {searchTerm && (
            <button
              className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700"
              onClick={() => {
                setSearchTerm('');
                updateFilters({ search: '' });
              }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                {t('tenders.filters.filter', 'Filter')}
                {hasActiveFilters() && (
                  <Badge variant="secondary" className="ml-2 px-1 py-0 h-5 min-w-5 flex items-center justify-center">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">
                  {t('tenders.filters.filterTitle', 'Filter Tenders')}
                </h4>
                
                <div className="space-y-2">
                  <Label htmlFor="status">
                    {t('tenders.filters.status', 'Status')}
                  </Label>
                  <Select
                    value={filters.status || ''}
                    onValueChange={(value) => updateFilters({ status: value || undefined })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder={t('tenders.filters.allStatuses', 'All Statuses')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">
                        {t('tenders.filters.allStatuses', 'All Statuses')}
                      </SelectItem>
                      <SelectItem value="active">
                        {t('tenders.status.active', 'Active')}
                      </SelectItem>
                      <SelectItem value="closed">
                        {t('tenders.status.closed', 'Closed')}
                      </SelectItem>
                      <SelectItem value="awarded">
                        {t('tenders.status.awarded', 'Awarded')}
                      </SelectItem>
                      <SelectItem value="cancelled">
                        {t('tenders.status.cancelled', 'Cancelled')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cpvCode">
                    <Tag className="h-4 w-4 mr-2" />
                    {t('tenders.filters.cpvCode', 'CPV Code')}
                  </Label>
                  <Select
                    value={filters.cpvCode || ''}
                    onValueChange={(value) => updateFilters({ cpvCode: value || undefined })}
                  >
                    <SelectTrigger id="cpvCode">
                      <SelectValue placeholder={t('tenders.filters.allCpvCodes', 'All CPV Codes')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">
                        {t('tenders.filters.allCpvCodes', 'All CPV Codes')}
                      </SelectItem>
                      {cpvCodes.map((cpv) => (
                        <SelectItem key={cpv.code} value={cpv.code}>
                          {cpv.code} - {cpv.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="authority">
                    <Building className="h-4 w-4 mr-2" />
                    {t('tenders.filters.authority', 'Authority')}
                  </Label>
                  <Select
                    value={filters.authority || ''}
                    onValueChange={(value) => updateFilters({ authority: value || undefined })}
                  >
                    <SelectTrigger id="authority">
                      <SelectValue placeholder={t('tenders.filters.allAuthorities', 'All Authorities')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">
                        {t('tenders.filters.allAuthorities', 'All Authorities')}
                      </SelectItem>
                      {authorities.map((authority) => (
                        <SelectItem key={authority} value={authority}>
                          {authority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">
                    <MapPin className="h-4 w-4 mr-2" />
                    {t('tenders.filters.location', 'Location')}
                  </Label>
                  <Select
                    value={filters.location || ''}
                    onValueChange={(value) => updateFilters({ location: value || undefined })}
                  >
                    <SelectTrigger id="location">
                      <SelectValue placeholder={t('tenders.filters.allLocations', 'All Locations')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">
                        {t('tenders.filters.allLocations', 'All Locations')}
                      </SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {t('tenders.filters.publicationDate', 'Publication Date')}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          {fromDate ? formatDate(fromDate) : t('tenders.filters.from', 'From')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={fromDate}
                          onSelect={(date) => {
                            setFromDate(date);
                            if (date) {
                              updateFilters({ fromDate: date.toISOString() });
                            } else {
                              const { fromDate, ...rest } = filters;
                              onFiltersChange(rest);
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          {toDate ? formatDate(toDate) : t('tenders.filters.to', 'To')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={toDate}
                          onSelect={(date) => {
                            setToDate(date);
                            if (date) {
                              updateFilters({ toDate: date.toISOString() });
                            } else {
                              const { toDate, ...rest } = filters;
                              onFiltersChange(rest);
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>
                    <DollarSign className="h-4 w-4 mr-2" />
                    {t('tenders.filters.estimatedValue', 'Estimated Value')}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Input
                        type="number"
                        placeholder={t('tenders.filters.min', 'Min')}
                        value={filters.minValue || ''}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value) : undefined;
                          updateFilters({ minValue: value });
                        }}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder={t('tenders.filters.max', 'Max')}
                        value={filters.maxValue || ''}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value) : undefined;
                          updateFilters({ maxValue: value });
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="onlyFavorites"
                    checked={filters.onlyFavorites || false}
                    onCheckedChange={(checked) => 
                      updateFilters({ onlyFavorites: checked === true ? true : undefined })
                    }
                  />
                  <Label htmlFor="onlyFavorites" className="flex items-center">
                    <Star className="h-4 w-4 mr-2 text-yellow-500" />
                    {t('tenders.filters.onlyFavorites', 'Only Favorites')}
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="onlyRelevant"
                    checked={filters.onlyRelevant || false}
                    onCheckedChange={(checked) => 
                      updateFilters({ onlyRelevant: checked === true ? true : undefined })
                    }
                  />
                  <Label htmlFor="onlyRelevant" className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-2 text-blue-500" />
                    {t('tenders.filters.onlyRelevant', 'Only Relevant')}
                  </Label>
                </div>
                
                <Separator />
                
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                    disabled={!hasActiveFilters()}
                  >
                    <X className="h-4 w-4 mr-2" />
                    {t('tenders.filters.reset', 'Reset')}
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => updateFilters({})}
                  >
                    {t('tenders.filters.apply', 'Apply Filters')}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button variant="outline" onClick={onExport}>
            {t('tenders.filters.export', 'Export')}
          </Button>
        </div>
      </div>
      
      {/* Active filters */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.search && (
            <Badge variant="secondary" className="flex items-center">
              <Search className="h-3 w-3 mr-1" />
              {t('tenders.filters.searchFilter', 'Search')}: {filters.search}
              <button
                className="ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setSearchTerm('');
                  const { search, ...rest } = filters;
                  onFiltersChange(rest);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.status && (
            <Badge variant="secondary" className="flex items-center">
              {t('tenders.filters.statusFilter', 'Status')}: {t(`tenders.status.${filters.status}`, filters.status)}
              <button
                className="ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  const { status, ...rest } = filters;
                  onFiltersChange(rest);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.cpvCode && (
            <Badge variant="secondary" className="flex items-center">
              <Tag className="h-3 w-3 mr-1" />
              {t('tenders.filters.cpvCodeFilter', 'CPV Code')}: {filters.cpvCode}
              <button
                className="ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  const { cpvCode, ...rest } = filters;
                  onFiltersChange(rest);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.authority && (
            <Badge variant="secondary" className="flex items-center">
              <Building className="h-3 w-3 mr-1" />
              {t('tenders.filters.authorityFilter', 'Authority')}: {filters.authority}
              <button
                className="ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  const { authority, ...rest } = filters;
                  onFiltersChange(rest);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.location && (
            <Badge variant="secondary" className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {t('tenders.filters.locationFilter', 'Location')}: {filters.location}
              <button
                className="ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  const { location, ...rest } = filters;
                  onFiltersChange(rest);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.fromDate && (
            <Badge variant="secondary" className="flex items-center">
              <CalendarIcon className="h-3 w-3 mr-1" />
              {t('tenders.filters.fromFilter', 'From')}: {formatDate(new Date(filters.fromDate))}
              <button
                className="ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setFromDate(undefined);
                  const { fromDate, ...rest } = filters;
                  onFiltersChange(rest);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.toDate && (
            <Badge variant="secondary" className="flex items-center">
              <CalendarIcon className="h-3 w-3 mr-1" />
              {t('tenders.filters.toFilter', 'To')}: {formatDate(new Date(filters.toDate))}
              <button
                className="ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setToDate(undefined);
                  const { toDate, ...rest } = filters;
                  onFiltersChange(rest);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.minValue !== undefined && (
            <Badge variant="secondary" className="flex items-center">
              <DollarSign className="h-3 w-3 mr-1" />
              {t('tenders.filters.minValueFilter', 'Min Value')}: {filters.minValue}
              <button
                className="ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  const { minValue, ...rest } = filters;
                  onFiltersChange(rest);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.maxValue !== undefined && (
            <Badge variant="secondary" className="flex items-center">
              <DollarSign className="h-3 w-3 mr-1" />
              {t('tenders.filters.maxValueFilter', 'Max Value')}: {filters.maxValue}
              <button
                className="ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  const { maxValue, ...rest } = filters;
                  onFiltersChange(rest);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.onlyFavorites && (
            <Badge variant="secondary" className="flex items-center">
              <Star className="h-3 w-3 mr-1" />
              {t('tenders.filters.onlyFavoritesFilter', 'Only Favorites')}
              <button
                className="ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  const { onlyFavorites, ...rest } = filters;
                  onFiltersChange(rest);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.onlyRelevant && (
            <Badge variant="secondary" className="flex items-center">
              <ThumbsUp className="h-3 w-3 mr-1" />
              {t('tenders.filters.onlyRelevantFilter', 'Only Relevant')}
              <button
                className="ml-1 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  const { onlyRelevant, ...rest } = filters;
                  onFiltersChange(rest);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={resetFilters}
          >
            {t('tenders.filters.clearAll', 'Clear All')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TenderFilters;
