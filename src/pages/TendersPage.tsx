import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useTenders } from '@/hooks/useTenders';
import { Tender, TenderDocument } from '@/models/tender';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Star, 
  ThumbsUp, 
  Bell, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import TendersList from '@/components/tenders/TendersList';
import TenderFilters from '@/components/tenders/TenderFilters';
import TenderDetailsDialog from '@/components/tenders/TenderDetailsDialog';
import AnimatedButton from '@/components/ui/animated-button';
import { useToast } from '@/components/ui/use-toast';

const TendersPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // State pentru tab-uri și dialoguri
  const [activeTab, setActiveTab] = useState('all');
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // Mock data pentru filtre
  const cpvCodes = [
    { code: '45000000-7', description: 'Construction works' },
    { code: '71000000-8', description: 'Architectural, construction, engineering and inspection services' },
    { code: '79000000-4', description: 'Business services: law, marketing, consulting, recruitment, printing and security' }
  ];
  const authorities = ['City Hall Bucharest', 'Ministry of Transport', 'National Company for Road Infrastructure'];
  const locations = ['Bucharest', 'Cluj', 'Iasi', 'Timisoara', 'Constanta'];
  
  // Folosim hook-ul pentru gestionarea licitațiilor
  const {
    tenders,
    selectedTender,
    filters,
    sort,
    pagination,
    notes,
    loading,
    error,
    setFilters,
    setSort,
    setPagination,
    loadTenders,
    getTenderById,
    loadNotes,
    toggleFavorite,
    toggleRelevant,
    addNote,
    subscribeTender,
    unsubscribeTender,
    checkSubscription,
    downloadDocument,
    setSelectedTender
  } = useTenders();
  
  // Verificăm abonamentul când se schimbă licitația selectată
  useEffect(() => {
    const checkIsSubscribed = async () => {
      if (selectedTender) {
        const subscribed = await checkSubscription(selectedTender.id);
        setIsSubscribed(subscribed);
      }
    };
    
    checkIsSubscribed();
  }, [selectedTender, checkSubscription]);
  
  // Gestionăm schimbarea tab-ului
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Actualizăm filtrele în funcție de tab
    switch (value) {
      case 'favorites':
        setFilters({ ...filters, onlyFavorites: true });
        break;
      case 'relevant':
        setFilters({ ...filters, onlyRelevant: true });
        break;
      case 'all':
      default:
        // Păstrăm celelalte filtre, dar eliminăm filtrele specifice tab-urilor
        const { onlyFavorites, onlyRelevant, ...restFilters } = filters;
        setFilters(restFilters);
        break;
    }
  };
  
  // Gestionăm vizualizarea detaliilor unei licitații
  const handleViewTender = async (tender: Tender) => {
    const tenderDetails = await getTenderById(tender.id);
    if (tenderDetails) {
      setSelectedTender(tenderDetails);
      setIsDetailsDialogOpen(true);
    }
  };
  
  // Gestionăm deschiderea licitației în SEAP
  const handleOpenExternal = (tender: Tender) => {
    if (tender.url) {
      window.open(tender.url, '_blank');
    } else {
      toast({
        variant: 'destructive',
        title: t('tenders.errors.noExternalUrl', 'No external URL'),
        description: t('tenders.errors.noExternalUrlDesc', 'This tender does not have an external URL')
      });
    }
  };
  
  // Gestionăm exportul licitațiilor
  const handleExport = () => {
    // Simulăm exportul
    toast({
      title: t('tenders.success.exportStarted', 'Export started'),
      description: t('tenders.success.exportStartedDesc', 'Your export is being prepared and will be downloaded shortly')
    });
    
    // Creăm un CSV cu licitațiile
    const headers = [
      'Title',
      'Reference Number',
      'Authority',
      'Publication Date',
      'Closing Date',
      'Estimated Value',
      'Status',
      'URL'
    ];
    
    const csvContent = [
      headers.join(','),
      ...tenders.map(tender => [
        `"${tender.title.replace(/"/g, '""')}"`,
        `"${tender.reference_number}"`,
        `"${tender.contracting_authority.replace(/"/g, '""')}"`,
        `"${tender.publication_date}"`,
        `"${tender.closing_date}"`,
        tender.estimated_value || '',
        `"${tender.status}"`,
        `"${tender.url || ''}"`
      ].join(','))
    ].join('\n');
    
    // Descărcăm CSV-ul
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tenders-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <>
      <Helmet>
        <title>{t('tenders.pageTitle', 'Tenders')}</title>
      </Helmet>
      
      <div className="container mx-auto py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t('tenders.title', 'Tenders')}
              </h1>
              <p className="text-muted-foreground">
                {t('tenders.subtitle', 'Browse and manage public tenders from SEAP')}
              </p>
            </div>
            
            <AnimatedButton
              animationType="glow"
              onClick={loadTenders}
              disabled={loading.tenders}
            >
              {loading.tenders ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {t('tenders.refresh', 'Refresh')}
            </AnimatedButton>
          </div>
        </motion.div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="all">
              <FileText className="h-4 w-4 mr-2" />
              {t('tenders.tabs.all', 'All Tenders')}
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Star className="h-4 w-4 mr-2" />
              {t('tenders.tabs.favorites', 'Favorites')}
            </TabsTrigger>
            <TabsTrigger value="relevant">
              <ThumbsUp className="h-4 w-4 mr-2" />
              {t('tenders.tabs.relevant', 'Relevant')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>{t('tenders.all.title', 'All Tenders')}</CardTitle>
                <CardDescription>
                  {t('tenders.all.description', 'Browse all available public tenders')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <TenderFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    cpvCodes={cpvCodes}
                    authorities={authorities}
                    locations={locations}
                    onExport={handleExport}
                  />
                  
                  <TendersList
                    tenders={tenders}
                    onViewTender={handleViewTender}
                    onToggleFavorite={toggleFavorite}
                    onToggleRelevant={toggleRelevant}
                    onSubscribe={subscribeTender}
                    onUnsubscribe={unsubscribeTender}
                    onOpenExternal={handleOpenExternal}
                    onSort={setSort}
                    currentSort={sort}
                    loading={loading.tenders}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="favorites" className="mt-6 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>{t('tenders.favorites.title', 'Favorite Tenders')}</CardTitle>
                <CardDescription>
                  {t('tenders.favorites.description', 'Tenders you have marked as favorites')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <TenderFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    cpvCodes={cpvCodes}
                    authorities={authorities}
                    locations={locations}
                    onExport={handleExport}
                  />
                  
                  <TendersList
                    tenders={tenders}
                    onViewTender={handleViewTender}
                    onToggleFavorite={toggleFavorite}
                    onToggleRelevant={toggleRelevant}
                    onSubscribe={subscribeTender}
                    onUnsubscribe={unsubscribeTender}
                    onOpenExternal={handleOpenExternal}
                    onSort={setSort}
                    currentSort={sort}
                    loading={loading.tenders}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="relevant" className="mt-6 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>{t('tenders.relevant.title', 'Relevant Tenders')}</CardTitle>
                <CardDescription>
                  {t('tenders.relevant.description', 'Tenders you have marked as relevant to your business')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <TenderFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    cpvCodes={cpvCodes}
                    authorities={authorities}
                    locations={locations}
                    onExport={handleExport}
                  />
                  
                  <TendersList
                    tenders={tenders}
                    onViewTender={handleViewTender}
                    onToggleFavorite={toggleFavorite}
                    onToggleRelevant={toggleRelevant}
                    onSubscribe={subscribeTender}
                    onUnsubscribe={unsubscribeTender}
                    onOpenExternal={handleOpenExternal}
                    onSort={setSort}
                    currentSort={sort}
                    loading={loading.tenders}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Dialog pentru detaliile licitației */}
      <TenderDetailsDialog
        tender={selectedTender}
        notes={notes}
        isSubscribed={isSubscribed}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        onToggleFavorite={toggleFavorite}
        onToggleRelevant={toggleRelevant}
        onSubscribe={subscribeTender}
        onUnsubscribe={unsubscribeTender}
        onOpenExternal={handleOpenExternal}
        onDownloadDocument={downloadDocument}
        onAddNote={addNote}
        loading={{
          notes: loading.notes,
          operation: loading.operation
        }}
      />
    </>
  );
};

export default TendersPage;
