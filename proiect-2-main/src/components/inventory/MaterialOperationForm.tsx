import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package, ArrowDown, ArrowUp, RotateCcw } from "lucide-react";
import { MaterialOperation, OperationType, CreateMaterialOperationInput } from "@/models/material-operation.model";
import { useMaterialOperations } from "@/hooks/useMaterialOperations";
import { useProjects } from "@/hooks/useProjects";
import { useMaterials } from "@/hooks/useMaterials";
import { useQRCode } from "@/hooks/useQRCode";
import { QRCodeScanner } from "./QRCodeScanner";

interface MaterialOperationFormProps {
  projectId?: string;
  materialId?: string;
  initialData?: MaterialOperation;
  onSuccess?: (operation: MaterialOperation) => void;
  onCancel?: () => void;
}

const MaterialOperationForm: React.FC<MaterialOperationFormProps> = ({
  projectId,
  materialId,
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { createOperation, updateOperation } = useMaterialOperations();
  const { projects, loading: projectsLoading } = useProjects();
  const { materials, loading: materialsLoading } = useMaterials(projectId);
  const { scanQRCode } = useQRCode();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);

  // Definim schema de validare
  const formSchema = z.object({
    project_id: z.string({
      required_error: t("inventory.operations.projectRequired", "Project is required"),
    }),
    material_id: z.string({
      required_error: t("inventory.operations.materialRequired", "Material is required"),
    }),
    operation_type: z.enum(["reception", "consumption", "return"], {
      required_error: t("inventory.operations.operationTypeRequired", "Operation type is required"),
    }),
    quantity: z.coerce.number({
      required_error: t("inventory.operations.quantityRequired", "Quantity is required"),
    }).positive({
      message: t("inventory.operations.quantityPositive", "Quantity must be positive"),
    }),
    unit_price: z.coerce.number().optional(),
    location: z.string().optional(),
    notes: z.string().optional(),
    qr_code: z.string().optional(),
  });

  // Inițializăm formularul
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      project_id: projectId || initialData?.project_id || "",
      material_id: materialId || initialData?.material_id || "",
      operation_type: initialData?.operation_type || "reception",
      quantity: initialData?.quantity || 0,
      unit_price: initialData?.unit_price || undefined,
      location: initialData?.location || "",
      notes: initialData?.notes || "",
      qr_code: initialData?.qr_code || "",
    },
  });

  // Actualizăm valorile implicite când se schimbă proprietățile
  useEffect(() => {
    if (projectId) {
      form.setValue("project_id", projectId);
    }
    if (materialId) {
      form.setValue("material_id", materialId);
    }
  }, [projectId, materialId, form]);

  // Funcție pentru trimiterea formularului
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      const operationData: CreateMaterialOperationInput = {
        material_id: values.material_id,
        project_id: values.project_id,
        operation_type: values.operation_type as OperationType,
        quantity: values.quantity,
        unit_price: values.unit_price,
        location: values.location,
        notes: values.notes,
        qr_code: values.qr_code,
      };
      
      let response;
      
      if (initialData) {
        // Actualizăm operațiunea existentă
        response = await updateOperation(initialData.id, operationData);
      } else {
        // Creăm o operațiune nouă
        response = await createOperation(operationData);
      }
      
      if (response.success && response.data) {
        // Apelăm callback-ul de succes
        if (onSuccess) {
          onSuccess(response.data);
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: t("inventory.operations.submitError", "Error"),
        description: t("inventory.operations.submitErrorDescription", "An error occurred while saving the operation."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funcție pentru scanarea unui cod QR
  const handleQRScan = async (code: string) => {
    setShowQRScanner(false);
    
    try {
      const response = await scanQRCode(code);
      
      if (response.success && response.data?.found && response.data.qrCode) {
        const qrCode = response.data.qrCode;
        
        // Actualizăm câmpul qr_code
        form.setValue("qr_code", qrCode.code);
        
        // Dacă codul QR este pentru un material, actualizăm și materialul
        if (qrCode.type === "material") {
          form.setValue("material_id", qrCode.reference_id);
        }
        
        toast({
          title: t("inventory.operations.qrScanSuccess", "QR Code Scanned"),
          description: t("inventory.operations.qrScanSuccessDescription", "QR code has been scanned successfully."),
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error scanning QR code:", error);
      toast({
        title: t("inventory.operations.qrScanError", "Error"),
        description: t("inventory.operations.qrScanErrorDescription", "An error occurred while scanning the QR code."),
        variant: "destructive",
      });
    }
  };

  // Renderăm formularul
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData
            ? t("inventory.operations.editOperation", "Edit Operation")
            : t("inventory.operations.newOperation", "New Operation")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Proiect */}
            <FormField
              control={form.control}
              name="project_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("inventory.operations.project", "Project")}</FormLabel>
                  <Select
                    disabled={!!projectId || isSubmitting || projectsLoading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("inventory.operations.selectProject", "Select a project")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projectsLoading ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>{t("common.loading", "Loading...")}</span>
                        </div>
                      ) : (
                        projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Material */}
            <FormField
              control={form.control}
              name="material_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("inventory.operations.material", "Material")}</FormLabel>
                  <Select
                    disabled={!!materialId || isSubmitting || materialsLoading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("inventory.operations.selectMaterial", "Select a material")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {materialsLoading ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>{t("common.loading", "Loading...")}</span>
                        </div>
                      ) : (
                        materials.map((material) => (
                          <SelectItem key={material.id} value={material.id}>
                            {material.name} ({material.unit})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tip operațiune */}
            <FormField
              control={form.control}
              name="operation_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("inventory.operations.operationType", "Operation Type")}</FormLabel>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("inventory.operations.selectOperationType", "Select operation type")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="reception">
                        <div className="flex items-center">
                          <ArrowDown className="h-4 w-4 mr-2 text-green-500" />
                          {t("inventory.operations.reception", "Reception")}
                        </div>
                      </SelectItem>
                      <SelectItem value="consumption">
                        <div className="flex items-center">
                          <ArrowUp className="h-4 w-4 mr-2 text-red-500" />
                          {t("inventory.operations.consumption", "Consumption")}
                        </div>
                      </SelectItem>
                      <SelectItem value="return">
                        <div className="flex items-center">
                          <RotateCcw className="h-4 w-4 mr-2 text-blue-500" />
                          {t("inventory.operations.return", "Return")}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cantitate */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("inventory.operations.quantity", "Quantity")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      disabled={isSubmitting}
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preț unitar (opțional) */}
            <FormField
              control={form.control}
              name="unit_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("inventory.operations.unitPrice", "Unit Price")} ({t("common.optional", "Optional")})</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      disabled={isSubmitting}
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("inventory.operations.unitPriceDescription", "Price per unit for this operation")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Locație (opțional) */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("inventory.operations.location", "Location")} ({t("common.optional", "Optional")})</FormLabel>
                  <FormControl>
                    <Input disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormDescription>
                    {t("inventory.operations.locationDescription", "Specific location within the project or warehouse")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cod QR (opțional) */}
            <FormField
              control={form.control}
              name="qr_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("inventory.operations.qrCode", "QR Code")} ({t("common.optional", "Optional")})</FormLabel>
                  <div className="flex space-x-2">
                    <FormControl>
                      <Input disabled={isSubmitting} {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowQRScanner(true)}
                      disabled={isSubmitting}
                    >
                      {t("inventory.operations.scan", "Scan")}
                    </Button>
                  </div>
                  <FormDescription>
                    {t("inventory.operations.qrCodeDescription", "Scan or enter a QR code to associate with this operation")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Note (opțional) */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("inventory.operations.notes", "Notes")} ({t("common.optional", "Optional")})</FormLabel>
                  <FormControl>
                    <Textarea disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Butoane */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                {t("common.cancel", "Cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData
                  ? t("common.save", "Save")
                  : t("common.create", "Create")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>

      {/* Scanner QR */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">
              {t("inventory.operations.scanQRCode", "Scan QR Code")}
            </h3>
            <QRCodeScanner onScan={handleQRScan} onClose={() => setShowQRScanner(false)} />
          </div>
        </div>
      )}
    </Card>
  );
};

export default MaterialOperationForm;
