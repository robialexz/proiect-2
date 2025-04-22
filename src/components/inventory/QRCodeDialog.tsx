import React, { useRef } from 'react';
import { MaterialWithProject } from '@/models/inventory';
import { useTranslation } from 'react-i18next';
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
import { QrCode, Download, Printer, Package } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import html2canvas from 'html2canvas';

interface QRCodeDialogProps {
  material: MaterialWithProject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QRCodeDialog: React.FC<QRCodeDialogProps> = ({
  material,
  open,
  onOpenChange
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const qrCodeRef = useRef<HTMLDivElement>(null);
  
  // Funcție pentru a descărca codul QR ca imagine
  const handleDownload = async () => {
    if (!qrCodeRef.current || !material) return;
    
    try {
      const canvas = await html2canvas(qrCodeRef.current);
      const image = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.href = image;
      link.download = `qr-code-${material.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: t('inventory.qrCode.downloadSuccess', 'QR Code Downloaded'),
        description: t('inventory.qrCode.downloadSuccessDesc', 'The QR code has been downloaded successfully')
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('inventory.qrCode.downloadError', 'Download Failed'),
        description: t('inventory.qrCode.downloadErrorDesc', 'Failed to download the QR code')
      });
    }
  };
  
  // Funcție pentru a printa codul QR
  const handlePrint = async () => {
    if (!qrCodeRef.current || !material) return;
    
    try {
      const canvas = await html2canvas(qrCodeRef.current);
      const image = canvas.toDataURL('image/png');
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Could not open print window');
      }
      
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${material.name}</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                text-align: center;
                font-family: Arial, sans-serif;
              }
              .qr-container {
                display: inline-block;
                padding: 15px;
                border: 1px solid #ccc;
                border-radius: 8px;
              }
              .material-name {
                margin-top: 10px;
                font-size: 16px;
                font-weight: bold;
              }
              .material-info {
                margin-top: 5px;
                font-size: 14px;
                color: #666;
              }
              @media print {
                @page {
                  size: 80mm 50mm;
                  margin: 0;
                }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <img src="${image}" alt="QR Code" style="max-width: 100%; height: auto;" />
              <div class="material-name">${material.name}</div>
              <div class="material-info">${material.dimension || ''} - ${material.quantity} ${material.unit}</div>
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  setTimeout(function() {
                    window.close();
                  }, 500);
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      toast({
        title: t('inventory.qrCode.printSuccess', 'Print Started'),
        description: t('inventory.qrCode.printSuccessDesc', 'The QR code is being sent to the printer')
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('inventory.qrCode.printError', 'Print Failed'),
        description: t('inventory.qrCode.printErrorDesc', 'Failed to print the QR code')
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <QrCode className="h-5 w-5 mr-2 text-primary" />
            {t('inventory.qrCode.title', 'Material QR Code')}
          </DialogTitle>
          <DialogDescription>
            {t('inventory.qrCode.description', 'Scan this QR code to quickly access material information')}
          </DialogDescription>
        </DialogHeader>

        {material && (
          <div className="py-4 flex flex-col items-center">
            <div 
              ref={qrCodeRef}
              className="bg-white p-4 rounded-lg border shadow-sm"
            >
              {material.qr_code ? (
                <img 
                  src={material.qr_code} 
                  alt={`QR Code for ${material.name}`}
                  className="w-48 h-48 object-contain"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded">
                  <p className="text-sm text-gray-500 text-center">
                    {t('inventory.qrCode.noQRCode', 'QR code not available')}
                  </p>
                </div>
              )}
              
              <div className="mt-3 text-center">
                <h3 className="font-medium">{material.name}</h3>
                <div className="flex items-center justify-center mt-1">
                  <Badge variant="outline" className="mr-2">
                    <Package className="h-3 w-3 mr-1" />
                    {material.quantity} {material.unit}
                  </Badge>
                  {material.dimension && (
                    <Badge variant="outline">
                      {material.dimension}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                {t('inventory.qrCode.download', 'Download')}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" />
                {t('inventory.qrCode.print', 'Print')}
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            {t('common.close', 'Close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDialog;
