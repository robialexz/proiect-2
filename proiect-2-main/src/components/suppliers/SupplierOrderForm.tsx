import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm, useFieldArray } from "react-hook-form";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Loader2, CalendarIcon, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/services/api/supabase-client";
import { useProjects } from "@/hooks/use-projects";
import { useMaterials } from "@/hooks/use-materials";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useSupplierMaterials } from "@/hooks/useSupplierMaterials";
import {
  SupplierOrderWithDetails,
  CreateSupplierOrderInput,
  UpdateSupplierOrderInput,
} from "@/models/supplier-order.model";

interface SupplierOrderFormProps {
  supplierId?: string;
  projectId?: string;
  initialData?: SupplierOrderWithDetails;
  onSubmit: (
    data: CreateSupplierOrderInput | UpdateSupplierOrderInput
  ) => Promise<{ success: boolean; data?: any; error?: any }>;
  onCancel: () => void;
}

const SupplierOrderForm: React.FC<SupplierOrderFormProps> = ({
  supplierId,
  projectId,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  // Folosim clientul Supabase direct
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Obținem lista de proiecte
  const { projects, loading: projectsLoading } = useProjects();

  // Obținem lista de furnizori
  const { suppliers, loading: suppliersLoading } = useSuppliers();

  // Obținem lista de materiale
  const { materials, loading: materialsLoading } = useMaterials();

  // Obținem materialele furnizorului selectat
  const [selectedSupplierId, setSelectedSupplierId] = useState<
    string | undefined
  >(supplierId || initialData?.supplier_id);
  const { materials: supplierMaterials, loading: supplierMaterialsLoading } =
    useSupplierMaterials(selectedSupplierId);

  // Definim schema de validare
  const formSchema = z.object({
    supplier_id: z.string().min(1, {
      message: t(
        "suppliers.orders.form.supplierRequired",
        "Supplier is required"
      ),
    }),
    project_id: z.string().optional(),
    order_number: z.string().optional(),
    expected_delivery_date: z.date().optional(),
    actual_delivery_date: z.date().optional(),
    status: z
      .enum(["pending", "confirmed", "shipped", "delivered", "cancelled"])
      .optional(),
    notes: z.string().optional(),
    items: z
      .array(
        z.object({
          material_id: z.string().min(1, {
            message: t(
              "suppliers.orders.form.materialRequired",
              "Material is required"
            ),
          }),
          quantity: z.coerce.number().positive({
            message: t(
              "suppliers.orders.form.quantityPositive",
              "Quantity must be positive"
            ),
          }),
          unit_price: z.coerce
            .number()
            .nonnegative({
              message: t(
                "suppliers.orders.form.priceNonNegative",
                "Price must be non-negative"
              ),
            })
            .optional(),
          notes: z.string().optional(),
        })
      )
      .min(1, {
        message: t(
          "suppliers.orders.form.itemsRequired",
          "At least one item is required"
        ),
      }),
  });

  // Inițializăm formularul
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplier_id: initialData?.supplier_id || supplierId || "",
      project_id: initialData?.project_id || projectId || "",
      order_number: initialData?.order_number || "",
      expected_delivery_date: initialData?.expected_delivery_date
        ? new Date(initialData.expected_delivery_date)
        : undefined,
      actual_delivery_date: initialData?.actual_delivery_date
        ? new Date(initialData.actual_delivery_date)
        : undefined,
      status: initialData?.status || "pending",
      notes: initialData?.notes || "",
      items: initialData?.items?.map((item) => ({
        material_id: item.material_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        notes: item.notes || "",
      })) || [
        { material_id: "", quantity: 1, unit_price: undefined, notes: "" },
      ],
    },
  });

  // Configurăm array-ul de câmpuri pentru elementele comenzii
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Actualizăm furnizorul selectat când se schimbă valoarea în formular
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "supplier_id" && value.supplier_id) {
        setSelectedSupplierId(value.supplier_id as string);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Funcție pentru trimiterea formularului
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      // Pregătim datele pentru trimitere
      const formData = initialData
        ? {
            order_number: values.order_number,
            expected_delivery_date:
              values.expected_delivery_date?.toISOString(),
            actual_delivery_date: values.actual_delivery_date?.toISOString(),
            status: values.status,
            notes: values.notes,
          }
        : {
            supplier_id: values.supplier_id,
            project_id: values.project_id,
            order_number: values.order_number,
            expected_delivery_date:
              values.expected_delivery_date?.toISOString(),
            notes: values.notes,
            items: values.items.map((item) => ({
              material_id: item.material_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              notes: item.notes,
            })),
          };

      const result = await onSubmit(formData);

      if (result.success) {
        toast({
          title: initialData
            ? t("suppliers.orders.form.updateSuccess", "Order Updated")
            : t("suppliers.orders.form.createSuccess", "Order Created"),
          description: initialData
            ? t(
                "suppliers.orders.form.updateSuccessDescription",
                "The order has been updated successfully."
              )
            : t(
                "suppliers.orders.form.createSuccessDescription",
                "The order has been created successfully."
              ),
          variant: "default",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funcție pentru adăugarea unui element nou
  const handleAddItem = () => {
    append({ material_id: "", quantity: 1, unit_price: undefined, notes: "" });
  };

  // Funcție pentru formatarea datei
  const formatDate = (date: Date) => {
    return format(date, "PPP", { locale: ro });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Furnizor */}
          <FormField
            control={form.control}
            name="supplier_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("suppliers.orders.form.supplier", "Supplier")}
                </FormLabel>
                <Select
                  disabled={isSubmitting || !!supplierId || !!initialData}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          "suppliers.orders.form.selectSupplier",
                          "Select a supplier"
                        )}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {suppliersLoading ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>{t("common.loading", "Loading...")}</span>
                      </div>
                    ) : (
                      suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Proiect */}
          <FormField
            control={form.control}
            name="project_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("suppliers.orders.form.project", "Project")}
                </FormLabel>
                <Select
                  disabled={isSubmitting || !!projectId}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          "suppliers.orders.form.selectProject",
                          "Select a project (optional)"
                        )}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">
                      {t("suppliers.orders.form.noProject", "No project")}
                    </SelectItem>
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

          {/* Număr comandă */}
          <FormField
            control={form.control}
            name="order_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("suppliers.orders.form.orderNumber", "Order Number")}
                </FormLabel>
                <FormControl>
                  <Input disabled={isSubmitting} {...field} />
                </FormControl>
                <FormDescription>
                  {t(
                    "suppliers.orders.form.orderNumberDescription",
                    "Optional. Will be generated automatically if left empty."
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Data estimată de livrare */}
          <FormField
            control={form.control}
            name="expected_delivery_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  {t(
                    "suppliers.orders.form.expectedDeliveryDate",
                    "Expected Delivery Date"
                  )}
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isSubmitting}
                      >
                        {field.value ? (
                          formatDate(field.value)
                        ) : (
                          <span>
                            {t("suppliers.orders.form.pickDate", "Pick a date")}
                          </span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Stare (doar pentru editare) */}
          {initialData && (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("suppliers.orders.form.status", "Status")}
                  </FormLabel>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t(
                            "suppliers.orders.form.selectStatus",
                            "Select a status"
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">
                        {t("suppliers.orders.status.pending", "Pending")}
                      </SelectItem>
                      <SelectItem value="confirmed">
                        {t("suppliers.orders.status.confirmed", "Confirmed")}
                      </SelectItem>
                      <SelectItem value="shipped">
                        {t("suppliers.orders.status.shipped", "Shipped")}
                      </SelectItem>
                      <SelectItem value="delivered">
                        {t("suppliers.orders.status.delivered", "Delivered")}
                      </SelectItem>
                      <SelectItem value="cancelled">
                        {t("suppliers.orders.status.cancelled", "Cancelled")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Data efectivă de livrare (doar pentru editare) */}
          {initialData && (
            <FormField
              control={form.control}
              name="actual_delivery_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    {t(
                      "suppliers.orders.form.actualDeliveryDate",
                      "Actual Delivery Date"
                    )}
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isSubmitting}
                        >
                          {field.value ? (
                            formatDate(field.value)
                          ) : (
                            <span>
                              {t(
                                "suppliers.orders.form.pickDate",
                                "Pick a date"
                              )}
                            </span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Note */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("suppliers.orders.form.notes", "Notes")}</FormLabel>
              <FormControl>
                <Textarea disabled={isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Elementele comenzii (doar pentru creare) */}
        {!initialData && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">
                {t("suppliers.orders.form.items", "Order Items")}
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("suppliers.orders.form.addItem", "Add Item")}
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-md space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">
                    {t("suppliers.orders.form.item", "Item")} {index + 1}
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={isSubmitting || fields.length <= 1}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="sr-only">
                      {t("common.remove", "Remove")}
                    </span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Material */}
                  <FormField
                    control={form.control}
                    name={`items.${index}.material_id`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("suppliers.orders.form.material", "Material")}
                        </FormLabel>
                        <Select
                          disabled={isSubmitting || !selectedSupplierId}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t(
                                  "suppliers.orders.form.selectMaterial",
                                  "Select a material"
                                )}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {supplierMaterialsLoading ? (
                              <div className="flex items-center justify-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span>{t("common.loading", "Loading...")}</span>
                              </div>
                            ) : supplierMaterials.length === 0 ? (
                              <div className="p-2 text-center text-sm text-gray-500">
                                {t(
                                  "suppliers.orders.form.noMaterials",
                                  "No materials available for this supplier"
                                )}
                              </div>
                            ) : (
                              supplierMaterials.map((material) => (
                                <SelectItem
                                  key={material.material_id}
                                  value={material.material_id}
                                >
                                  {material.material_name} (
                                  {material.material_unit})
                                  {material.unit_price &&
                                    ` - ${new Intl.NumberFormat("ro-RO", {
                                      style: "currency",
                                      currency: "RON",
                                    }).format(material.unit_price)}`}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Cantitate */}
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("suppliers.orders.form.quantity", "Quantity")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Preț unitar */}
                  <FormField
                    control={form.control}
                    name={`items.${index}.unit_price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("suppliers.orders.form.unitPrice", "Unit Price")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            disabled={isSubmitting}
                            {...field}
                            value={field.value === undefined ? "" : field.value}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : parseFloat(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Note pentru element */}
                  <FormField
                    control={form.control}
                    name={`items.${index}.notes`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("suppliers.orders.form.itemNotes", "Notes")}
                        </FormLabel>
                        <FormControl>
                          <Input disabled={isSubmitting} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

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
  );
};

export default SupplierOrderForm;
