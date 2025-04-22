import React from 'react';
import { Tender, TenderSort } from '@/models/tender';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MoreHorizontal, 
  Eye, 
  Star, 
  StarOff, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  FileText,
  Bell,
  BellOff,
  ThumbsUp,
  ThumbsDown,
  ExternalLink
} from 'lucide-react';

interface TendersListProps {
  tenders: Tender[];
  onViewTender: (tender: Tender) => void;
  onToggleFavorite: (tender: Tender, isFavorite: boolean) => void;
  onToggleRelevant: (tender: Tender, isRelevant: boolean) => void;
  onSubscribe: (tender: Tender) => void;
  onUnsubscribe: (tender: Tender) => void;
  onOpenExternal: (tender: Tender) => void;
  onSort: (sort: TenderSort) => void;
  currentSort: TenderSort;
  loading: boolean;
}

const TendersList: React.FC<TendersListProps> = ({
  tenders,
  onViewTender,
  onToggleFavorite,
  onToggleRelevant,
  onSubscribe,
  onUnsubscribe,
  onOpenExternal,
  onSort,
  currentSort,
  loading
}) => {
  const { t } = useTranslation();
  
  // Funcție pentru a gestiona sortarea
  const handleSort = (field: string) => {
    if (currentSort.field === field) {
      onSort({
        field,
        direction: currentSort.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      onSort({
        field,
        direction: 'asc'
      });
    }
  };
  
  // Funcție pentru a afișa iconița de sortare
  const getSortIcon = (field: string) => {
    if (currentSort.field !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    
    return currentSort.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };
  
  // Funcție pentru a formata data
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP', { locale: ro });
  };
  
  // Funcție pentru a obține culoarea badge-ului în funcție de status
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'awarded':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'draft':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Funcție pentru a formata valoarea estimată
  const formatValue = (value?: number, currency?: string) => {
    if (value === undefined) return t('tenders.noValue', 'No value');
    
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: currency || 'RON',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="rounded-md border">
      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30px]"></TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center">
                  {t('tenders.list.title', 'Title')}
                  {getSortIcon('title')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('contracting_authority')}
              >
                <div className="flex items-center">
                  {t('tenders.list.authority', 'Authority')}
                  {getSortIcon('contracting_authority')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('publication_date')}
              >
                <div className="flex items-center">
                  {t('tenders.list.publicationDate', 'Publication Date')}
                  {getSortIcon('publication_date')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('closing_date')}
              >
                <div className="flex items-center">
                  {t('tenders.list.closingDate', 'Closing Date')}
                  {getSortIcon('closing_date')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('estimated_value')}
              >
                <div className="flex items-center">
                  {t('tenders.list.value', 'Value')}
                  {getSortIcon('estimated_value')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  {t('tenders.list.status', 'Status')}
                  {getSortIcon('status')}
                </div>
              </TableHead>
              <TableHead className="text-right">
                {t('tenders.list.actions', 'Actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-0 border-2 border-primary/20 rounded-full"></div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      {t('tenders.list.loading', 'Loading tenders...')}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : tenders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  {t('tenders.list.noTenders', 'No tenders found.')}
                </TableCell>
              </TableRow>
            ) : (
              tenders.map((tender) => (
                <TableRow key={tender.id}>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggleFavorite(tender, !tender.is_favorite)}
                      className={tender.is_favorite ? 'text-yellow-500' : ''}
                    >
                      {tender.is_favorite ? (
                        <Star className="h-4 w-4" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {tender.title}
                      {tender.is_relevant && (
                        <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                          {t('tenders.list.relevant', 'Relevant')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tender.reference_number}
                    </p>
                  </TableCell>
                  <TableCell>{tender.contracting_authority}</TableCell>
                  <TableCell>{formatDate(tender.publication_date)}</TableCell>
                  <TableCell>{formatDate(tender.closing_date)}</TableCell>
                  <TableCell>{formatValue(tender.estimated_value, tender.currency)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadgeColor(tender.status)}>
                      {t(`tenders.status.${tender.status}`, tender.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">{t('tenders.list.openMenu', 'Open menu')}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('tenders.list.actions', 'Actions')}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onViewTender(tender)}>
                          <Eye className="h-4 w-4 mr-2" />
                          {t('tenders.list.viewDetails', 'View Details')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onOpenExternal(tender)}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {t('tenders.list.openExternal', 'Open in SEAP')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onToggleFavorite(tender, !tender.is_favorite)}>
                          {tender.is_favorite ? (
                            <>
                              <StarOff className="h-4 w-4 mr-2" />
                              {t('tenders.list.removeFromFavorites', 'Remove from Favorites')}
                            </>
                          ) : (
                            <>
                              <Star className="h-4 w-4 mr-2" />
                              {t('tenders.list.addToFavorites', 'Add to Favorites')}
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onToggleRelevant(tender, !tender.is_relevant)}>
                          {tender.is_relevant ? (
                            <>
                              <ThumbsDown className="h-4 w-4 mr-2" />
                              {t('tenders.list.markAsIrrelevant', 'Mark as Irrelevant')}
                            </>
                          ) : (
                            <>
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              {t('tenders.list.markAsRelevant', 'Mark as Relevant')}
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => tender.is_favorite ? onUnsubscribe(tender) : onSubscribe(tender)}>
                          {tender.is_favorite ? (
                            <>
                              <BellOff className="h-4 w-4 mr-2" />
                              {t('tenders.list.unsubscribe', 'Unsubscribe')}
                            </>
                          ) : (
                            <>
                              <Bell className="h-4 w-4 mr-2" />
                              {t('tenders.list.subscribe', 'Subscribe')}
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default TendersList;
