import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useMaterials } from "@/hooks/useMaterials";
import { SupplierMaterialWithDetails, CreateSupplierMaterialInput, UpdateSupplierMaterialInput } from "@/models/supplier-material.model";

interface SupplierMaterialFormProps {
  supplierId: string;
  initialData?: SupplierMaterialWithDetails;
  onSubmit: (data: CreateSupplierMaterialInput | UpdateSupplierMaterialInput) => Promise<{ success: boolean; data?: any; error?: any }>;
  onCancel: () => void;
}

const SupplierMaterialForm: React.FC<SupplierMaterialFormProps> = ({
  supplierId,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Obținem lista de materiale
  const { materials, loading: materialsLoading } = useMaterials();

  // Definim schema de validare
  const formSchema = z.object({
    material_id: z.string().min(1, {
      message: t("suppliers.materials.form.materialRequired", "Material is required"),
    }),
    unit_price: z.coerce.number().min(0).optional(),
    min_order_quantity: z.coerce.number().min(0).optional(),
    lead_time_days: z.coerce.number().min(0).optional(),
    notes: z.string().optional(),
    is_preferred: z.boolean().default(false),
  });

  // Inițializăm formularul
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      material_id: initialData?.material_id || "",
      unit_price: initialData?.unit_price || undefined,
      min_order_quantity: initialData?.min_order_quantity || undefined,
      lead_time_days: initialData?.lead_time_days || undefined,
      notes: initialData?.notes || "",
      is_preferred: initialData?.is_preferred || false,
    },
  });

  // Funcție pentru trimiterea formularului
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Pregătim datele pentru trimitere
      const formData = initialData
        ? {
            unit_price: values.unit_price,
            min_order_quantity: values.min_order_quantity,
            lead_time_days: values.lead_time_days,
            notes: values.notes,
            is_preferred: values.is_preferred,
          }
        : {
            supplier_id: supplierId,
            material_id: values.material_id,
            unit_price: values.unit_price,
            min_order_quantity: values.min_order_quantity,
            lead_time_days: values.lead_time_days,
            notes: values.notes,
            is_preferred: values.is_preferred,
          };
      
      const result = await onSubmit(formData);
      
      if (result.success) {
        toast({
          title: initialData
            ? t("suppliers.materials.form.updateSuccess", "Material Updated")
            : t("suppliers.materials.form.createSuccess", "Material Added"),
          description: initialData
            ? t("suppliers.materials.form.updateSuccessDescription", "The material has been updated successfully.")
            : t("suppliers.materials.form.createSuccessDescription", "The material has been added successfully."),
          variant: "default",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Obținem materialul selectat
  const selectedMaterial = materials.find(m => m.id === form.watch("material_id"));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Material */}
        <FormField
          control={form.control}
          name="material_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("suppliers.materials.form.material", "Material")}</FormLabel>
              <Select
                disabled={isSubmitting || !!initialData}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("suppliers.materials.form.selectMaterial", "Select a material")} />
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
              {selectedMaterial && (
                <FormDescription>
                  {selectedMaterial.category && (
                    <span className="block">
                      {t("suppliers.materials.form.category", "Category")}: {selectedMaterial.category}
                    </span>
                  )}
                  {selectedMaterial.description && (
                    <span className="block">
                      {selectedMaterial.description}
                    </span>
                  )}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Preț unitar */}
          <FormField
            control={form.control}
            name="unit_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("suppliers.materials.form.unitPrice", "Unit Price")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    disabled={isSubmitting}
                    {...field}
                    value={field.value === undefined ? "" : field.value}
                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cantitate minimă de comandă */}
          <FormField
            control={form.control}
            name="min_order_quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("suppliers.materials.form.minOrderQuantity", "Min. Order Quantity")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    disabled={isSubmitting}
                    {...field}
                    value={field.value === undefined ? "" : field.value}
                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Timp de livrare */}
          <FormField
            control={form.control}
            name="lead_time_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("suppliers.materials.form.leadTimeDays", "Lead Time (days)")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={isSubmitting}
                    {...field}
                    value={field.value === undefined ? "" : field.value}
                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Note */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("suppliers.materials.form.notes", "Notes")}</FormLabel>
              <FormControl>
                <Textarea disabled={isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Preferat */}
        <FormField
          control={form.control}
          name="is_preferred"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {t("suppliers.materials.form.preferred", "Preferred Supplier")}
                </FormLabel>
                <FormDescription>
                  {t("suppliers.materials.form.preferredDescription", "Mark this supplier as preferred for this material")}
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
              : t("common.add", "Add")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SupplierMaterialForm;
