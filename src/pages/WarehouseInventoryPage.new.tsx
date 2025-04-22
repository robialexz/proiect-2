import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMaterials } from "@/hooks/useMaterials";
import { useMaterialOperations } from "@/hooks/useMaterialOperations";
import { useQRCode } from "@/hooks/useQRCode";
import { useStockAlerts } from "@/hooks/useStockAlerts";
import { MaterialOperationWithDetails } from "@/models/material-operation.model";
import { StockAlertWithDetails } from "@/models/stock-alert.model";
import MaterialOperationForm from "@/components/inventory/MaterialOperationForm";
import MaterialOperationsLog from "@/components/inventory/MaterialOperationsLog";
import QRCodeGenerator from "@/components/inventory/QRCodeGenerator";
import QRCodeScanner from "@/components/inventory/QRCodeScanner";
import StockAlertSettings from "@/components/inventory/StockAlertSettings";
import MaterialsTable from "@/components/inventory/MaterialsTable";
import { Loader2, Plus, QrCode, Scan, BellRing, Package, ArrowDown, ArrowUp, RotateCcw, AlertTriangle, Building2 } from "lucide-react";

const WarehouseInventoryPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("materials");
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [showOperationForm, setShowOperationForm] = useState(false);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showAlertSettings, setShowAlertSettings] = useState(false);
  const [operationToEdit, setOperationToEdit] = useState<MaterialOperationWithDetails | null>(null);
  const [alertToEdit, setAlertToEdit] = useState<StockAlertWithDetails | null>(null);
  const [operationType, setOperationType] = useState<"reception" | "consumption" | "return" | null>(null);
  
  const { materials, loading: materialsLoading } = useMaterials();
  const { checkAlerts, checkResult } = useStockAlerts();
  
  // Verificăm alertele la încărcarea paginii
  useEffect(() => {
    checkAlerts();
  }, [checkAlerts]);
  
  // Funcție pentru deschiderea formularului de operațiune
  const openOperationForm = (type: "reception" | "consumption" | "return", materialId?: string) => {
    setOperationType(type);
    if (materialId) {
      setSelectedMaterialId(materialId);
    }
    setOperationToEdit(null);
    setShowOperationForm(true);
  };
  
  // Funcție pentru editarea unei operațiuni
  const editOperation = (operation: MaterialOperationWithDetails) => {
    setOperationToEdit(operation);
    setOperationType(null);
    setShowOperationForm(true);
  };
  
  // Funcție pentru deschiderea generatorului de coduri QR
  const openQRGenerator = (materialId?: string) => {
    if (materialId) {
      setSelectedMaterialId(materialId);
    }
    setShowQRGenerator(true);
  };
  
  // Funcție pentru deschiderea scannerului de coduri QR
  const openQRScanner = () => {
    setShowQRScanner(true);
  };
  
  // Funcție pentru deschiderea setărilor de alertă
  const openAlertSettings = (materialId?: string) => {
    if (materialId) {
      setSelectedMaterialId(materialId);
    }
    setAlertToEdit(null);
    setShowAlertSettings(true);
  };
  
  // Funcție pentru editarea unei alerte
  const editAlert = (alert: StockAlertWithDetails) => {
    setAlertToEdit(alert);
    setShowAlertSettings(true);
  };
  
  // Funcție pentru gestionarea scanării unui cod QR
  const handleQRScan = (code: string) => {
    setShowQRScanner(false);
    
    toast({
      title: t("inventory.qrCodes.scanned", "QR Code Scanned"),
      description: code,
      variant: "default",
    });
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Antet pagină */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("inventory.warehouseInventory", "Warehouse Inventory")}
          </h1>
          <p className="text-muted-foreground">
            {t("inventory.warehouseInventoryDescription", "Manage company-wide inventory and materials")}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/project-inventory")}
        >
          <Building2 className="h-4 w-4 mr-2" />
          {t("inventory.goToProjectInventory", "Go to Project Inventory")}
        </Button>
      </div>
      
      {/* Alerte de stoc */}
      {checkResult?.triggered && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="h-6 w-6 text-orange-500 mt-0.5" />
              <div>
                <h3 className="text-lg font-medium text-orange-700">
                  {t("inventory.alerts.stockAlerts", "Stock Alerts")}
                </h3>
                <p className="text-orange-600 mb-4">
                  {t("inventory.alerts.stockAlertsDescription", "The following materials have triggered stock alerts:")}
                </p>
                <ul className="space-y-2">
                  {checkResult.alerts.map((alert) => (
                    <li key={alert.id} className="flex items-center space-x-2">
                      <span className="h-2 w-2 rounded-full bg-orange-500" />
                      <span className="font-medium">{alert.material_name}</span>
                      <span className="text-orange-600">
                        {alert.alert_type === "low_stock"
                          ? t("inventory.alerts.lowStockAlert", "Low Stock: {{quantity}} {{unit}} (Threshold: {{threshold}} {{unit}})", {
                              quantity: alert.material_quantity,
                              unit: alert.material_unit,
                              threshold: alert.threshold,
                            })
                          : alert.alert_type === "out_of_stock"
                          ? t("inventory.alerts.outOfStockAlert", "Out of Stock: {{quantity}} {{unit}}", {
                              quantity: alert.material_quantity,
                              unit: alert.material_unit,
                            })
                          : t("inventory.alerts.expiringAlert", "Expiring Soon")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Acțiuni rapide */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <Button
              variant="outline"
              className="w-full border-green-300 hover:bg-green-100"
              onClick={() => openOperationForm("reception")}
            >
              <ArrowDown className="h-4 w-4 mr-2 text-green-600" />
              {t("inventory.operations.newReception", "New Reception")}
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <Button
              variant="outline"
              className="w-full border-red-300 hover:bg-red-100"
              onClick={() => openOperationForm("consumption")}
            >
              <ArrowUp className="h-4 w-4 mr-2 text-red-600" />
              {t("inventory.operations.newConsumption", "New Consumption")}
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <Button
              variant="outline"
              className="w-full border-blue-300 hover:bg-blue-100"
              onClick={() => openOperationForm("return")}
            >
              <RotateCcw className="h-4 w-4 mr-2 text-blue-600" />
              {t("inventory.operations.newReturn", "New Return")}
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <Button
              variant="outline"
              className="w-full border-purple-300 hover:bg-purple-100"
              onClick={() => openQRScanner()}
            >
              <Scan className="h-4 w-4 mr-2 text-purple-600" />
              {t("inventory.qrCodes.scanQRCode", "Scan QR Code")}
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs pentru diferite secțiuni */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="materials">
            <Package className="h-4 w-4 mr-2" />
            {t("inventory.materials.title", "Materials")}
          </TabsTrigger>
          <TabsTrigger value="operations">
            <RotateCcw className="h-4 w-4 mr-2" />
            {t("inventory.operations.title", "Operations")}
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <BellRing className="h-4 w-4 mr-2" />
            {t("inventory.alerts.title", "Alerts")}
          </TabsTrigger>
        </TabsList>
        
        {/* Conținut tab Materiale */}
        <TabsContent value="materials">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>{t("inventory.materials.title", "Materials")}</CardTitle>
                  <CardDescription>
                    {t("inventory.materials.warehouseDescription", "Manage materials in the warehouse")}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openQRGenerator()}
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    {t("inventory.qrCodes.generateQRCode", "Generate QR Code")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openAlertSettings()}
                  >
                    <BellRing className="h-4 w-4 mr-2" />
                    {t("inventory.alerts.newAlert", "New Alert")}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <MaterialsTable
                onReception={(materialId) => openOperationForm("reception", materialId)}
                onConsumption={(materialId) => openOperationForm("consumption", materialId)}
                onReturn={(materialId) => openOperationForm("return", materialId)}
                onGenerateQR={(materialId) => openQRGenerator(materialId)}
                onCreateAlert={(materialId) => openAlertSettings(materialId)}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Conținut tab Operațiuni */}
        <TabsContent value="operations">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>{t("inventory.operations.title", "Operations")}</CardTitle>
                  <CardDescription>
                    {t("inventory.operations.warehouseDescription", "Track material operations in the warehouse")}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openOperationForm("reception")}
                  >
                    <ArrowDown className="h-4 w-4 mr-2 text-green-600" />
                    {t("inventory.operations.reception", "Reception")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openOperationForm("consumption")}
                  >
                    <ArrowUp className="h-4 w-4 mr-2 text-red-600" />
                    {t("inventory.operations.consumption", "Consumption")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openOperationForm("return")}
                  >
                    <RotateCcw className="h-4 w-4 mr-2 text-blue-600" />
                    {t("inventory.operations.return", "Return")}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <MaterialOperationsLog
                onEdit={editOperation}
                onDelete={editOperation}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Conținut tab Alerte */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>{t("inventory.alerts.title", "Stock Alerts")}</CardTitle>
                  <CardDescription>
                    {t("inventory.alerts.warehouseDescription", "Manage stock alerts for the warehouse")}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openAlertSettings()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("inventory.alerts.newAlert", "New Alert")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => checkAlerts()}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {t("inventory.alerts.checkAlerts", "Check Alerts")}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Aici ar trebui să fie un tabel cu alertele de stoc */}
              <div className="text-center py-8 text-gray-500">
                {t("inventory.alerts.comingSoon", "Stock alerts management coming soon")}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialog pentru formular de operațiune */}
      <Dialog open={showOperationForm} onOpenChange={setShowOperationForm}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {operationType === "reception"
                ? t("inventory.operations.newReception", "New Reception")
                : operationType === "consumption"
                ? t("inventory.operations.newConsumption", "New Consumption")
                : operationType === "return"
                ? t("inventory.operations.newReturn", "New Return")
                : operationToEdit
                ? t("inventory.operations.editOperation", "Edit Operation")
                : t("inventory.operations.newOperation", "New Operation")}
            </DialogTitle>
            <DialogDescription>
              {operationType === "reception"
                ? t("inventory.operations.warehouseReceptionDescription", "Record materials received into the warehouse")
                : operationType === "consumption"
                ? t("inventory.operations.warehouseConsumptionDescription", "Record materials consumed from the warehouse")
                : operationType === "return"
                ? t("inventory.operations.warehouseReturnDescription", "Record materials returned to the warehouse")
                : t("inventory.operations.warehouseOperationDescription", "Record a material operation in the warehouse")}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            <div className="p-1">
              <MaterialOperationForm
                materialId={selectedMaterialId || undefined}
                initialData={operationToEdit || undefined}
                onSuccess={() => setShowOperationForm(false)}
                onCancel={() => setShowOperationForm(false)}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      {/* Dialog pentru generator de coduri QR */}
      <Dialog open={showQRGenerator} onOpenChange={setShowQRGenerator}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {t("inventory.qrCodes.generator", "QR Code Generator")}
            </DialogTitle>
            <DialogDescription>
              {t("inventory.qrCodes.generatorDescription", "Generate QR codes for materials, equipment, pallets, or locations")}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            <div className="p-1">
              <QRCodeGenerator
                materialId={selectedMaterialId || undefined}
                onSuccess={() => setShowQRGenerator(false)}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      {/* Dialog pentru scanner de coduri QR */}
      <Dialog open={showQRScanner} onOpenChange={setShowQRScanner}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("inventory.qrCodes.scanner", "QR Code Scanner")}
            </DialogTitle>
            <DialogDescription>
              {t("inventory.qrCodes.scannerDescription", "Scan a QR code to identify materials or locations")}
            </DialogDescription>
          </DialogHeader>
          <QRCodeScanner
            onScan={handleQRScan}
            onClose={() => setShowQRScanner(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Dialog pentru setări de alertă */}
      <Dialog open={showAlertSettings} onOpenChange={setShowAlertSettings}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {alertToEdit
                ? t("inventory.alerts.editAlert", "Edit Stock Alert")
                : t("inventory.alerts.newAlert", "New Stock Alert")}
            </DialogTitle>
            <DialogDescription>
              {t("inventory.alerts.alertDescription", "Configure alerts for low stock levels")}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            <div className="p-1">
              <StockAlertSettings
                materialId={selectedMaterialId || undefined}
                initialData={alertToEdit || undefined}
                onSuccess={() => setShowAlertSettings(false)}
                onCancel={() => setShowAlertSettings(false)}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WarehouseInventoryPage;
