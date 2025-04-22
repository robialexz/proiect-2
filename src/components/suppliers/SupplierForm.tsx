import React, { useState } from "react";
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
import { Loader2 } from "lucide-react";
import { Supplier, CreateSupplierInput, UpdateSupplierInput } from "@/models/supplier.model";

interface SupplierFormProps {
  initialData?: Supplier;
  categories?: string[];
  onSubmit: (data: CreateSupplierInput | UpdateSupplierInput) => Promise<{ success: boolean; data?: any; error?: any }>;
  onCancel: () => void;
}

const SupplierForm: React.FC<SupplierFormProps> = ({
  initialData,
  categories = [],
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Definim schema de validare
  const formSchema = z.object({
    name: z.string().min(2, {
      message: t("suppliers.form.nameRequired", "Name is required"),
    }),
    contact_person: z.string().optional(),
    email: z.string().email({
      message: t("suppliers.form.emailInvalid", "Invalid email address"),
    }).optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
    website: z.string().url({
      message: t("suppliers.form.websiteInvalid", "Invalid website URL"),
    }).optional().or(z.literal("")),
    category: z.string().optional(),
    notes: z.string().optional(),
  });

  // Inițializăm formularul
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      contact_person: initialData?.contact_person || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      website: initialData?.website || "",
      category: initialData?.category || "",
      notes: initialData?.notes || "",
    },
  });

  // Funcție pentru trimiterea formularului
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      const result = await onSubmit(values);
      
      if (result.success) {
        toast({
          title: initialData
            ? t("suppliers.form.updateSuccess", "Supplier Updated")
            : t("suppliers.form.createSuccess", "Supplier Created"),
          description: initialData
            ? t("suppliers.form.updateSuccessDescription", "The supplier has been updated successfully.")
            : t("suppliers.form.createSuccessDescription", "The supplier has been created successfully."),
          variant: "default",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nume */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("suppliers.form.name", "Name")}</FormLabel>
                <FormControl>
                  <Input disabled={isSubmitting} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Persoană de contact */}
          <FormField
            control={form.control}
            name="contact_person"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("suppliers.form.contactPerson", "Contact Person")}</FormLabel>
                <FormControl>
                  <Input disabled={isSubmitting} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("suppliers.form.email", "Email")}</FormLabel>
                <FormControl>
                  <Input type="email" disabled={isSubmitting} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Telefon */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("suppliers.form.phone", "Phone")}</FormLabel>
                <FormControl>
                  <Input disabled={isSubmitting} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Website */}
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("suppliers.form.website", "Website")}</FormLabel>
                <FormControl>
                  <Input disabled={isSubmitting} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Categorie */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("suppliers.form.category", "Category")}</FormLabel>
                <Select
                  disabled={isSubmitting}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("suppliers.form.selectCategory", "Select a category")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">
                      {t("suppliers.form.noCategory", "No category")}
                    </SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Adresă */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("suppliers.form.address", "Address")}</FormLabel>
              <FormControl>
                <Textarea disabled={isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Note */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("suppliers.form.notes", "Notes")}</FormLabel>
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
  );
};

export default SupplierForm;
