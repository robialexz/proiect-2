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
import { Switch } from "@/components/ui/switch";
import { Loader2, AlertTriangle, BellRing, BellOff, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useStockAlerts } from "@/hooks/useStockAlerts";
import { useMaterials } from "@/hooks/useMaterials";
import { AlertType, StockAlertWithDetails, CreateStockAlertInput } from "@/models/stock-alert.model";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface StockAlertSettingsProps {
  projectId?: string;
  materialId?: string;
  initialData?: StockAlertWithDetails;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const StockAlertSettings: React.FC<StockAlertSettingsProps> = ({
  projectId,
  materialId,
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { createAlert, updateAlert, deleteAlert, toggleAlert } = useStockAlerts(projectId, materialId);
  const { materials, loading: materialsLoading } = useMaterials(projectId);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Definim schema de validare pentru alerta de stoc
  const formSchema = z.object({
    material_id: z.string({
      required_error: t("inventory.alerts.materialRequired", "Material is required"),
    }),
    alert_type: z.enum(["low_stock", "out_of_stock", "expiring"] as const, {
      required_error: t("inventory.alerts.typeRequired", "Alert type is required"),
    }),
    threshold: z.coerce.number().optional(),
    is_active: z.boolean().default(true),
  });

  // Inițializăm formularul
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      material_id: materialId || initialData?.material_id || "",
      alert_type: initialData?.alert_type || "low_stock",
      threshold: initialData?.threshold || undefined,
      is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
    },
  });

  // Actualizăm valorile implicite când se schimbă proprietățile
  useEffect(() => {
    if (materialId) {
      form.setValue("material_id", materialId);
    }
  }, [materialId, form]);

  // Obținem tipul de alertă curent
  const alertType = form.watch("alert_type");

  // Funcție pentru trimiterea formularului
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Verificăm dacă tipul de alertă necesită un prag
      if (values.alert_type === "low_stock" && !values.threshold) {
        form.setError("threshold", {
          type: "required",
          message: t("inventory.alerts.thresholdRequired", "Threshold is required for low stock alerts"),
        });
        return;
      }
      
      let response;
      
      if (initialData) {
        // Actualizăm alerta existentă
        response = await updateAlert(initialData.id, {
          alert_type: values.alert_type,
          threshold: values.threshold,
          is_active: values.is_active,
        });
      } else {
        // Creăm o alertă nouă
        const alertData: CreateStockAlertInput = {
          material_id: values.material_id,
          project_id: projectId,
          alert_type: values.alert_type,
          threshold: values.threshold,
          is_active: values.is_active,
        };
        
        response = await createAlert(alertData);
      }
      
      if (response.success) {
        toast({
          title: initialData
            ? t("inventory.alerts.updateSuccess", "Alert Updated")
            : t("inventory.alerts.createSuccess", "Alert Created"),
          description: initialData
            ? t("inventory.alerts.updateSuccessDescription", "The stock alert has been updated successfully.")
            : t("inventory.alerts.createSuccessDescription", "The stock alert has been created successfully."),
          variant: "default",
        });
        
        // Apelăm callback-ul de succes
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: t("inventory.alerts.submitError", "Error"),
        description: t("inventory.alerts.submitErrorDescription", "An error occurred while saving the alert."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funcție pentru ștergerea alertei
  const handleDelete = async () => {
    if (!initialData) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await deleteAlert(initialData.id);
      
      if (response.success) {
        toast({
          title: t("inventory.alerts.deleteSuccess", "Alert Deleted"),
          description: t("inventory.alerts.deleteSuccessDescription", "The stock alert has been deleted successfully."),
          variant: "default",
        });
        
        // Apelăm callback-ul de succes
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error("Error deleting alert:", error);
      toast({
        title: t("inventory.alerts.deleteError", "Error"),
        description: t("inventory.alerts.deleteErrorDescription", "An error occurred while deleting the alert."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setShowDeleteDialog(false);
    }
  };

  // Funcție pentru activarea/dezactivarea alertei
  const handleToggle = async (isActive: boolean) => {
    if (!initialData) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await toggleAlert(initialData.id, isActive);
      
      if (response.success) {
        form.setValue("is_active", isActive);
        
        toast({
          title: isActive
            ? t("inventory.alerts.activateSuccess", "Alert Activated")
            : t("inventory.alerts.deactivateSuccess", "Alert Deactivated"),
          description: isActive
            ? t("inventory.alerts.activateSuccessDescription", "The stock alert has been activated successfully.")
            : t("inventory.alerts.deactivateSuccessDescription", "The stock alert has been deactivated successfully."),
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error toggling alert:", error);
      toast({
        title: t("inventory.alerts.toggleError", "Error"),
        description: t("inventory.alerts.toggleErrorDescription", "An error occurred while toggling the alert."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>
              {initialData
                ? t("inventory.alerts.editAlert", "Edit Stock Alert")
                : t("inventory.alerts.newAlert", "New Stock Alert")}
            </CardTitle>
            <CardDescription>
              {t("inventory.alerts.description", "Configure alerts for low stock levels")}
            </CardDescription>
          </div>
          {initialData && (
            <div className="flex items-center space-x-2">
              <Switch
                checked={form.getValues("is_active")}
                onCheckedChange={(checked) => handleToggle(checked)}
                disabled={isSubmitting}
              />
              <span className="text-sm">
                {form.getValues("is_active")
                  ? t("inventory.alerts.active", "Active")
                  : t("inventory.alerts.inactive", "Inactive")}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Material */}
            <FormField
              control={form.control}
              name="material_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("inventory.alerts.material", "Material")}</FormLabel>
                  <Select
                    disabled={!!materialId || isSubmitting || materialsLoading || !!initialData}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("inventory.alerts.selectMaterial", "Select a material")} />
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

            {/* Tip alertă */}
            <FormField
              control={form.control}
              name="alert_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("inventory.alerts.alertType", "Alert Type")}</FormLabel>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("inventory.alerts.selectAlertType", "Select alert type")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low_stock">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                          {t("inventory.alerts.lowStock", "Low Stock")}
                        </div>
                      </SelectItem>
                      <SelectItem value="out_of_stock">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                          {t("inventory.alerts.outOfStock", "Out of Stock")}
                        </div>
                      </SelectItem>
                      <SelectItem value="expiring">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-blue-500" />
                          {t("inventory.alerts.expiring", "Expiring")}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {alertType === "low_stock"
                      ? t("inventory.alerts.lowStockDescription", "Alert when stock falls below a threshold")
                      : alertType === "out_of_stock"
                      ? t("inventory.alerts.outOfStockDescription", "Alert when stock is completely depleted")
                      : t("inventory.alerts.expiringDescription", "Alert when materials are approaching expiration date")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Prag (doar pentru alerte de stoc scăzut) */}
            {alertType === "low_stock" && (
              <FormField
                control={form.control}
                name="threshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("inventory.alerts.threshold", "Threshold")}</FormLabel>
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
                      {t("inventory.alerts.thresholdDescription", "Alert will trigger when stock falls below this value")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Stare activă */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {t("inventory.alerts.activeState", "Active State")}
                    </FormLabel>
                    <FormDescription>
                      {t("inventory.alerts.activeStateDescription", "Enable or disable this alert")}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Butoane */}
            <div className="flex justify-between">
              {initialData ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isSubmitting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("common.delete", "Delete")}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  {t("common.cancel", "Cancel")}
                </Button>
              )}
              
              <div className="flex space-x-2">
                {initialData && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    {t("common.cancel", "Cancel")}
                  </Button>
                )}
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {initialData
                    ? t("common.save", "Save")
                    : t("common.create", "Create")}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>

      {/* Dialog de confirmare pentru ștergere */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("inventory.alerts.deleteConfirmTitle", "Are you sure?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("inventory.alerts.deleteConfirmDescription", "This action cannot be undone. This will permanently delete the stock alert.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("common.cancel", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              {t("common.delete", "Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default StockAlertSettings;
