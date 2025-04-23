import React, { useState } from 'react';
import { Tender, TenderDocument } from '@/models/tender';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Calendar, 
  Building, 
  MapPin, 
  DollarSign, 
  Tag, 
  Star, 
  StarOff, 
  ThumbsUp, 
  ThumbsDown, 
  Bell, 
  BellOff, 
  ExternalLink, 
  Download, 
  Send, 
  Loader2
} from 'lucide-react';

interface TenderDetailsDialogProps {
  tender: Tender | null;
  notes: any[];
  isSubscribed: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleFavorite: (tender: Tender, isFavorite: boolean) => void;
  onToggleRelevant: (tender: Tender, isRelevant: boolean) => void;
  onSubscribe: (tender: Tender) => void;
  onUnsubscribe: (tender: Tender) => void;
  onOpenExternal: (tender: Tender) => void;
  onDownloadDocument: (document: TenderDocument) => void;
  onAddNote: (tenderId: string, content: string) => Promise<boolean>;
  loading: {
    notes: boolean;
    operation: boolean;
  };
}

const TenderDetailsDialog: React.FC<TenderDetailsDialogProps> = ({
  tender,
  notes,
  isSubscribed,
  open,
  onOpenChange,
  onToggleFavorite,
  onToggleRelevant,
  onSubscribe,
  onUnsubscribe,
  onOpenExternal,
  onDownloadDocument,
  onAddNote,
  loading
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('details');
  const [noteContent, setNoteContent] = useState('');
  
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
  
  // Funcție pentru a adăuga o notă
  const handleAddNote = async () => {
    if (!tender || !noteContent.trim()) return;
    
    const success = await onAddNote(tender.id, noteContent);
    if (success) {
      setNoteContent('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            {t('tenders.details.title', 'Tender Details')}
          </DialogTitle>
          <DialogDescription>
            {t('tenders.details.description', 'Detailed information about this tender')}
          </DialogDescription>
        </DialogHeader>

        {tender && (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="details">
                  <FileText className="h-4 w-4 mr-2" />
                  {t('tenders.details.tabs.details', 'Details')}
                </TabsTrigger>
                <TabsTrigger value="documents">
                  <Download className="h-4 w-4 mr-2" />
                  {t('tenders.details.tabs.documents', 'Documents')}
                </TabsTrigger>
                <TabsTrigger value="notes">
                  <Send className="h-4 w-4 mr-2" />
                  {t('tenders.details.tabs.notes', 'Notes')}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="mt-4">
                <ScrollArea className="max-h-[60vh]">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">{tender.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {tender.reference_number}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStatusBadgeColor(tender.status)}>
                          {t(`tenders.status.${tender.status}`, tender.status)}
                        </Badge>
                        {tender.is_relevant && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {t('tenders.details.relevant', 'Relevant')}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">
                        {t('tenders.details.basicInfo', 'Basic Information')}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center">
                            <Building className="h-3 w-3 mr-1" />
                            {t('tenders.details.authority', 'Contracting Authority')}
                          </p>
                          <p className="text-sm">{tender.contracting_authority}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center">
                            <Building className="h-3 w-3 mr-1" />
                            {t('tenders.details.authorityType', 'Authority Type')}
                          </p>
                          <p className="text-sm">
                            {tender.authority_type || t('tenders.details.notSpecified', 'Not specified')}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {t('tenders.details.publicationDate', 'Publication Date')}
                          </p>
                          <p className="text-sm">{formatDate(tender.publication_date)}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {t('tenders.details.closingDate', 'Closing Date')}
                          </p>
                          <p className="text-sm">{formatDate(tender.closing_date)}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {t('tenders.details.estimatedValue', 'Estimated Value')}
                          </p>
                          <p className="text-sm">
                            {formatValue(tender.estimated_value, tender.currency)}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {t('tenders.details.location', 'Location')}
                          </p>
                          <p className="text-sm">
                            {tender.location || t('tenders.details.notSpecified', 'Not specified')}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center">
                            <Tag className="h-3 w-3 mr-1" />
                            {t('tenders.details.cpvCode', 'CPV Code')}
                          </p>
                          <p className="text-sm">
                            {tender.cpv_code 
                              ? `${tender.cpv_code} - ${tender.cpv_description || ''}` 
                              : t('tenders.details.notSpecified', 'Not specified')}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            {t('tenders.details.source', 'Source')}
                          </p>
                          <p className="text-sm">{tender.source}</p>
                        </div>
                      </div>
                    </div>

                    {tender.description && (
                      <>
                        <Separator />
                        
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium">
                            {t('tenders.details.description', 'Description')}
                          </h4>
                          
                          <div className="space-y-1">
                            <p className="text-sm whitespace-pre-line">
                              {tender.description}
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    {(tender.contact_person || tender.contact_email || tender.contact_phone) && (
                      <>
                        <Separator />
                        
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium">
                            {t('tenders.details.contactInfo', 'Contact Information')}
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tender.contact_person && (
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                  {t('tenders.details.contactPerson', 'Contact Person')}
                                </p>
                                <p className="text-sm">{tender.contact_person}</p>
                              </div>
                            )}
                            
                            {tender.contact_email && (
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                  {t('tenders.details.contactEmail', 'Email')}
                                </p>
                                <p className="text-sm">{tender.contact_email}</p>
                              </div>
                            )}
                            
                            {tender.contact_phone && (
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                  {t('tenders.details.contactPhone', 'Phone')}
                                </p>
                                <p className="text-sm">{tender.contact_phone}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {tender.notes && (
                      <>
                        <Separator />
                        
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium">
                            {t('tenders.details.notes', 'Notes')}
                          </h4>
                          
                          <div className="space-y-1">
                            <p className="text-sm whitespace-pre-line">
                              {tender.notes}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="documents" className="mt-4">
                <ScrollArea className="max-h-[60vh]">
                  <div className="space-y-4">
                    {!tender.documents || tender.documents.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {t('tenders.details.noDocuments', 'No documents available for this tender.')}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {tender.documents.map((document) => (
                          <div
                            key={document.id}
                            className="flex items-center justify-between p-4 border rounded-md"
                          >
                            <div>
                              <p className="font-medium">{document.name}</p>
                              {document.description && (
                                <p className="text-sm text-muted-foreground">
                                  {document.description}
                                </p>
                              )}
                              <div className="flex items-center mt-1">
                                <Badge variant="outline">
                                  {document.type}
                                </Badge>
                                {document.size && (
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {(document.size / 1024 / 1024).toFixed(2)} MB
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground ml-2">
                                  {formatDate(document.upload_date)}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onDownloadDocument(document)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {t('tenders.details.download', 'Download')}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="notes" className="mt-4">
                <div className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <Textarea
                      placeholder={t('tenders.details.addNote', 'Add a note about this tender...')}
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleAddNote}
                        disabled={!noteContent.trim() || loading.operation}
                      >
                        {loading.operation ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {t('tenders.details.saving', 'Saving...')}
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            {t('tenders.details.saveNote', 'Save Note')}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <ScrollArea className="max-h-[300px]">
                    <div className="space-y-4">
                      {loading.notes ? (
                        <div className="flex justify-center items-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : notes.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          {t('tenders.details.noNotes', 'No notes available for this tender.')}
                        </div>
                      ) : (
                        notes.map((note) => (
                          <div
                            key={note.id}
                            className="p-4 border rounded-md"
                          >
                            <p className="whitespace-pre-line">{note.content}</p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs text-muted-foreground">
                                {formatDate(note.created_at)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="flex flex-wrap gap-2 sm:gap-0">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleFavorite(tender, !tender.is_favorite)}
                  className={tender.is_favorite ? 'text-yellow-500' : ''}
                >
                  {tender.is_favorite ? (
                    <>
                      <StarOff className="h-4 w-4 mr-2" />
                      {t('tenders.details.removeFromFavorites', 'Remove from Favorites')}
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 mr-2" />
                      {t('tenders.details.addToFavorites', 'Add to Favorites')}
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleRelevant(tender, !tender.is_relevant)}
                  className={tender.is_relevant ? 'text-blue-500' : ''}
                >
                  {tender.is_relevant ? (
                    <>
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      {t('tenders.details.markAsIrrelevant', 'Mark as Irrelevant')}
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      {t('tenders.details.markAsRelevant', 'Mark as Relevant')}
                    </>
                  )}
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => isSubscribed ? onUnsubscribe(tender) : onSubscribe(tender)}
                >
                  {isSubscribed ? (
                    <>
                      <BellOff className="h-4 w-4 mr-2" />
                      {t('tenders.details.unsubscribe', 'Unsubscribe')}
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4 mr-2" />
                      {t('tenders.details.subscribe', 'Subscribe')}
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => onOpenExternal(tender)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t('tenders.details.openExternal', 'Open in SEAP')}
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TenderDetailsDialog;
