import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { inventoryService } from '@/lib/inventory-service';
import { useToast } from '@/components/ui/use-toast';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ImportDialog: React.FC<ImportDialogProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('file');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gestionăm schimbarea fișierului
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
    setPreviewData(null);
    
    if (selectedFile) {
      // Verificăm tipul fișierului
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'application/csv'
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        setError(t('inventory.import.invalidFileType', 'Tip de fișier invalid. Acceptăm doar Excel (.xls, .xlsx) sau CSV.'));
        return;
      }
      
      // Verificăm dimensiunea fișierului (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError(t('inventory.import.fileTooLarge', 'Fișierul este prea mare. Dimensiunea maximă este de 5MB.'));
        return;
      }
      
      // Generăm previzualizarea
      handlePreview();
    }
  };

  // Gestionăm previzualizarea
  const handlePreview = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setProgress(10);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await inventoryService.previewImport(formData);
      
      setProgress(100);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data) {
        setPreviewData(response.data.slice(0, 10)); // Afișăm doar primele 10 rânduri
      }
    } catch (error) {
      // Removed console statement
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsUploading(false);
    }
  };

  // Gestionăm importul
  const handleImport = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulăm progresul
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 500);
      
      try {
      const response = await inventoryService.importInventory(formData);
      } catch (error) {
        // Handle error appropriately
      }
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast({
        title: t('inventory.import.success', 'Import reușit'),
        description: t('inventory.import.successDescription', 'Materialele au fost importate cu succes'),
        variant: 'default'
      });
      
      // Resetăm starea și închidem dialogul
      setTimeout(() => {
        setFile(null);
        setPreviewData(null);
        setError(null);
        onSuccess();
        onClose();
      }, 1000);
    } catch (error) {
      // Removed console statement
      setError(error instanceof Error ? error.message : 'Unknown error');
      
      toast({
        title: t('inventory.import.error', 'Eroare la import'),
        description: error instanceof Error ? error.message : 'A apărut o eroare la importul materialelor',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Gestionăm resetarea
  const handleReset = () => {
    setFile(null);
    setPreviewData(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {t('inventory.import.title', 'Import materiale')}
          </DialogTitle>
          <DialogDescription>
            {t('inventory.import.description', 'Importă materiale din Excel sau CSV')}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="file">
              {t('inventory.import.fileTab', 'Încarcă fișier')}
            </TabsTrigger>
            <TabsTrigger value="template" disabled={isUploading}>
              {t('inventory.import.templateTab', 'Descarcă șablon')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="file" className="space-y-4">
            <div className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="import-file">
                  {t('inventory.import.selectFile', 'Selectează fișier')}
                </Label>
                <Input
                  id="import-file"
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <p className="text-xs text-muted-foreground">
                  {t('inventory.import.fileTypes', 'Acceptăm Excel (.xlsx, .xls) sau CSV')}
                </p>
              </div>
              
              {file && (
                <div className="bg-muted p-3 rounded-md">
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-5 w-5 mr-2 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      disabled={isUploading}
                    >
                      {t('inventory.import.reset', 'Resetează')}
                    </Button>
                  </div>
                </div>
              )}
              
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {progress < 100
                        ? t('inventory.import.uploading', 'Se încarcă...')
                        : t('inventory.import.processing', 'Se procesează...')
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {Math.round(progress)}%
                    </p>
                  </div>
                  <Progress value={progress} />
                </div>
              )}
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{t('inventory.import.error', 'Eroare')}</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {previewData && previewData.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    {t('inventory.import.preview', 'Previzualizare')}
                  </h3>
                  <div className="max-h-[200px] overflow-y-auto border rounded-md">
                    <table className="w-full text-sm">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          {Object.keys(previewData[0]).map((key) => (
                            <th key={key} className="px-2 py-1 text-left font-medium">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, index) => (
                          <tr key={index} className="border-t">
                            {Object.values(row).map((value: any, i) => (
                              <td key={i} className="px-2 py-1 truncate max-w-[150px]">
                                {value !== null && value !== undefined ? String(value) : '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('inventory.import.previewNote', 'Afișăm doar primele 10 rânduri. Importul va procesa toate datele din fișier.')}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="template" className="space-y-4">
            <div className="space-y-4">
              <p>
                {t('inventory.import.templateDescription', 'Descarcă șablonul pentru a vedea formatul corect pentru import.')}
              </p>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => inventoryService.downloadTemplate('xlsx')}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  {t('inventory.import.downloadExcel', 'Descarcă șablon Excel')}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => inventoryService.downloadTemplate('csv')}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  {t('inventory.import.downloadCsv', 'Descarcă șablon CSV')}
                </Button>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('inventory.import.note', 'Notă')}</AlertTitle>
                <AlertDescription>
                  {t('inventory.import.templateNote', 'Asigură-te că datele tale respectă formatul din șablon. Coloanele obligatorii sunt: name, quantity și unit.')}
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            {t('common.cancel', 'Anulează')}
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || isUploading || !!error}
          >
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Upload className="h-4 w-4 mr-2" />
            {t('inventory.import.import', 'Importă')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
