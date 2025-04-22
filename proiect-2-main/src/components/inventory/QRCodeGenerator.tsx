import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Download, Printer, QrCode, Package, Warehouse, Palette } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQRCode } from "@/hooks/useQRCode";
import { QRCodeType, CreateQRCodeInput } from "@/models/qr-code.model";
import { useMaterials } from "@/hooks/useMaterials";
import { useProjects } from "@/hooks/useProjects";

interface QRCodeGeneratorProps {
  projectId?: string;
  materialId?: string;
  onSuccess?: (code: string, imageUrl: string) => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  projectId,
  materialId,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { createQRCode, generateQRImage } = useQRCode();
  const { materials, loading: materialsLoading } = useMaterials(projectId);
  const { projects, loading: projectsLoading } = useProjects();
  
  const [activeTab, setActiveTab] = useState<QRCodeType>("material");
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  // Definim schema de validare pentru generarea codului QR
  const formSchema = z.object({
    type: z.enum(["material", "equipment", "pallet", "location"] as const),
    reference_id: z.string({
      required_error: t("inventory.qrCodes.referenceRequired", "Reference is required"),
    }),
    code: z.string().optional(),
    size: z.coerce.number().min(100).max(1000).default(300),
    color: z.string().default("#000000"),
    backgroundColor: z.string().default("#FFFFFF"),
  });

  // Inițializăm formularul
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: activeTab,
      reference_id: materialId || "",
      code: "",
      size: 300,
      color: "#000000",
      backgroundColor: "#FFFFFF",
    },
  });

  // Actualizăm valorile implicite când se schimbă proprietățile
  useEffect(() => {
    if (materialId) {
      form.setValue("reference_id", materialId);
      form.setValue("type", "material");
      setActiveTab("material");
    }
  }, [materialId, form]);

  // Actualizăm tipul când se schimbă tab-ul
  useEffect(() => {
    form.setValue("type", activeTab);
    form.setValue("reference_id", "");
  }, [activeTab, form]);

  // Funcție pentru generarea codului QR
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsGenerating(true);
    setQrImageUrl(null);
    setGeneratedCode(null);
    
    try {
      // Creăm codul QR
      const qrCodeData: CreateQRCodeInput = {
        type: values.type,
        reference_id: values.reference_id,
        code: values.code || undefined,
      };
      
      const response = await createQRCode(qrCodeData);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data) {
        // Generăm imaginea QR
        const imageResponse = await generateQRImage(response.data.code, {
          size: values.size,
          color: values.color,
          backgroundColor: values.backgroundColor,
        });
        
        if (imageResponse.error) {
          throw new Error(imageResponse.error.message);
        }
        
        if (imageResponse.data) {
          setQrImageUrl(imageResponse.data);
          setGeneratedCode(response.data.code);
          
          toast({
            title: t("inventory.qrCodes.generateSuccess", "QR Code Generated"),
            description: t("inventory.qrCodes.generateSuccessDescription", "The QR code has been generated successfully."),
            variant: "default",
          });
          
          // Apelăm callback-ul de succes
          if (onSuccess) {
            onSuccess(response.data.code, imageResponse.data);
          }
        }
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast({
        title: t("inventory.qrCodes.generateError", "Error"),
        description: t("inventory.qrCodes.generateErrorDescription", "An error occurred while generating the QR code."),
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Funcție pentru descărcarea imaginii QR
  const downloadQRImage = () => {
    if (!qrImageUrl) return;
    
    const link = document.createElement("a");
    link.href = qrImageUrl;
    link.download = `qr-code-${generatedCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Funcție pentru imprimarea imaginii QR
  const printQRImage = () => {
    if (!qrImageUrl) return;
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            img {
              max-width: 100%;
              max-height: 80vh;
            }
            .code {
              margin-top: 20px;
              font-family: Arial, sans-serif;
              font-size: 16px;
            }
          </style>
        </head>
        <body>
          <img src="${qrImageUrl}" alt="QR Code" />
          <div class="code">${generatedCode}</div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  // Funcție pentru obținerea referințelor în funcție de tipul selectat
  const getReferenceOptions = () => {
    switch (activeTab) {
      case "material":
        return materialsLoading ? (
          <div className="flex items-center justify-center p-2">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span>{t("common.loading", "Loading...")}</span>
          </div>
        ) : (
          materials.map((material) => (
            <SelectItem key={material.id} value={material.id}>
              <div className="flex items-center">
                <Package className="h-4 w-4 mr-2 text-gray-500" />
                {material.name} ({material.unit})
              </div>
            </SelectItem>
          ))
        );
      case "equipment":
        // Aici ar trebui să fie o listă de echipamente
        return (
          <SelectItem value="demo-equipment-1">
            <div className="flex items-center">
              <Package className="h-4 w-4 mr-2 text-gray-500" />
              Demo Equipment 1
            </div>
          </SelectItem>
        );
      case "pallet":
        // Aici ar trebui să fie o listă de paleți
        return (
          <SelectItem value="demo-pallet-1">
            <div className="flex items-center">
              <Palette className="h-4 w-4 mr-2 text-gray-500" />
              Demo Pallet 1
            </div>
          </SelectItem>
        );
      case "location":
        // Aici ar trebui să fie o listă de locații
        return projectsLoading ? (
          <div className="flex items-center justify-center p-2">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span>{t("common.loading", "Loading...")}</span>
          </div>
        ) : (
          projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              <div className="flex items-center">
                <Warehouse className="h-4 w-4 mr-2 text-gray-500" />
                {project.name}
              </div>
            </SelectItem>
          ))
        );
      default:
        return null;
    }
  };

  // Funcție pentru obținerea etichetei referinței în funcție de tipul selectat
  const getReferenceLabel = () => {
    switch (activeTab) {
      case "material":
        return t("inventory.qrCodes.material", "Material");
      case "equipment":
        return t("inventory.qrCodes.equipment", "Equipment");
      case "pallet":
        return t("inventory.qrCodes.pallet", "Pallet");
      case "location":
        return t("inventory.qrCodes.location", "Location");
      default:
        return t("inventory.qrCodes.reference", "Reference");
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t("inventory.qrCodes.generator", "QR Code Generator")}</CardTitle>
        <CardDescription>
          {t("inventory.qrCodes.generatorDescription", "Generate QR codes for materials, equipment, pallets, or locations")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as QRCodeType)}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="material">
              <Package className="h-4 w-4 mr-2" />
              {t("inventory.qrCodes.material", "Material")}
            </TabsTrigger>
            <TabsTrigger value="equipment">
              <Package className="h-4 w-4 mr-2" />
              {t("inventory.qrCodes.equipment", "Equipment")}
            </TabsTrigger>
            <TabsTrigger value="pallet">
              <Palette className="h-4 w-4 mr-2" />
              {t("inventory.qrCodes.pallet", "Pallet")}
            </TabsTrigger>
            <TabsTrigger value="location">
              <Warehouse className="h-4 w-4 mr-2" />
              {t("inventory.qrCodes.location", "Location")}
            </TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Referință */}
                  <FormField
                    control={form.control}
                    name="reference_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{getReferenceLabel()}</FormLabel>
                        <Select
                          disabled={isGenerating || (activeTab === "material" && !!materialId)}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("inventory.qrCodes.selectReference", "Select a reference")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getReferenceOptions()}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Cod (opțional) */}
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("inventory.qrCodes.code", "Code")} ({t("common.optional", "Optional")})</FormLabel>
                        <FormControl>
                          <Input disabled={isGenerating} {...field} />
                        </FormControl>
                        <FormDescription>
                          {t("inventory.qrCodes.codeDescription", "Leave empty to generate automatically")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Dimensiune */}
                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("inventory.qrCodes.size", "Size")} (px)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="100"
                            max="1000"
                            step="50"
                            disabled={isGenerating}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Culori */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("inventory.qrCodes.color", "Color")}</FormLabel>
                          <FormControl>
                            <div className="flex space-x-2">
                              <Input
                                type="color"
                                disabled={isGenerating}
                                {...field}
                                className="w-12 h-9 p-1"
                              />
                              <Input
                                type="text"
                                disabled={isGenerating}
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="backgroundColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("inventory.qrCodes.backgroundColor", "Background")}</FormLabel>
                          <FormControl>
                            <div className="flex space-x-2">
                              <Input
                                type="color"
                                disabled={isGenerating}
                                {...field}
                                className="w-12 h-9 p-1"
                              />
                              <Input
                                type="text"
                                disabled={isGenerating}
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center space-y-4">
                  {qrImageUrl ? (
                    <>
                      <div className="border rounded-md p-4 bg-white">
                        <img
                          src={qrImageUrl}
                          alt="Generated QR Code"
                          className="max-w-full h-auto"
                        />
                      </div>
                      {generatedCode && (
                        <div className="text-center">
                          <p className="text-sm text-gray-500 mb-1">
                            {t("inventory.qrCodes.generatedCode", "Generated Code")}:
                          </p>
                          <p className="font-mono font-medium">{generatedCode}</p>
                        </div>
                      )}
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={downloadQRImage}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {t("inventory.qrCodes.download", "Download")}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={printQRImage}
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          {t("inventory.qrCodes.print", "Print")}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="border rounded-md p-4 bg-gray-50 flex items-center justify-center w-full h-64">
                      <div className="text-center text-gray-500">
                        <QrCode className="h-12 w-12 mx-auto mb-2 opacity-30" />
                        <p>
                          {t("inventory.qrCodes.preview", "QR code preview will appear here")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Buton de generare */}
              <Button
                type="submit"
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <QrCode className="h-4 w-4 mr-2" />
                {t("inventory.qrCodes.generate", "Generate QR Code")}
              </Button>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
