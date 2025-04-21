import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { Material } from "@/types";
import { enhancedSupabaseService } from "@/lib/enhanced-supabase-service";
import { useToast } from "@/components/ui/use-toast";
import { materialSchema } from "@/hooks/useInventory";

interface MaterialFormProps {
  material?: Material;
  onSubmit: (
    material: Partial<Material>
  ) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  isEdit?: boolean;
}

// Tipul pentru formularul de material
type MaterialFormValues = z.infer<typeof materialSchema>;

const MaterialForm: React.FC<MaterialFormProps> = ({
  material,
  onSubmit,
  onCancel,
  isEdit = false,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [categories, setCategories] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>(
    []
  );
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  // Inițializăm formularul cu react-hook-form și zod
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: material?.name || "",
      quantity: material?.quantity || 0,
      unit: material?.unit || "buc",
      dimension: material?.dimension || "",
      manufacturer: material?.manufacturer || "",
      cost_per_unit: material?.cost_per_unit || 0,
      supplier_id: material?.supplier_id || "",
      project_id: material?.project_id || "",
      category: material?.category || "",
      location: material?.location || "",
      min_stock_level: material?.min_stock_level || 0,
      max_stock_level: material?.max_stock_level || 0,
      notes: material?.notes || "",
      image_url: material?.image_url || "",
    },
  });

  // Încărcăm datele pentru selecturi
  useEffect(() => {
    const loadFormData = async () => {
      try {
        // Încărcăm categoriile unice
        const categoriesResponse = await enhancedSupabaseService.custom<
          { category: string }[]
        >(
          "SELECT DISTINCT category FROM materials WHERE category IS NOT NULL ORDER BY category"
        );

        if (categoriesResponse.data) {
          setCategories(categoriesResponse.data.map((item) => item.category));
        }

        // Încărcăm furnizorii
        const suppliersResponse = await enhancedSupabaseService.select(
          "suppliers",
          "id, name",
          { order: { column: "name", ascending: true } }
        );

        if (suppliersResponse.data) {
          setSuppliers(suppliersResponse.data);
        }

        // Încărcăm proiectele
        const projectsResponse = await enhancedSupabaseService.select(
          "projects",
          "id, name",
          {
            filters: { status: "active" },
            order: { column: "name", ascending: true },
          }
        );

        if (projectsResponse.data) {
          setProjects(projectsResponse.data);
        }

        // Încărcăm locațiile unice
        const locationsResponse = await enhancedSupabaseService.custom<
          { location: string }[]
        >(
          "SELECT DISTINCT location FROM materials WHERE location IS NOT NULL ORDER BY location"
        );

        if (locationsResponse.data) {
          setLocations(locationsResponse.data.map((item) => item.location));
        }
      } catch (error) {
        // Removed console statement
        toast({
          title: t(
            "inventory.errors.loadFormDataFailed",
            "Eroare la încărcarea datelor"
          ),
          description:
            error instanceof Error
              ? error.message
              : "A apărut o eroare la încărcarea datelor pentru formular",
          variant: "destructive",
        });
      }
    };

    loadFormData();
  }, [t, toast]);

  // Gestionăm trimiterea formularului
  const handleFormSubmit = async (data: MaterialFormValues) => {
    setIsSubmitting(true);

    try {
      const result = await onSubmit(data);

      if (!result.success) {
        throw new Error(
          result.error || "A apărut o eroare la salvarea materialului"
        );
      }

      // Formularul a fost trimis cu succes
    } catch (error) {
      // Removed console statement
      toast({
        title: t("inventory.errors.submitFailed", "Eroare la salvare"),
        description:
          error instanceof Error
            ? error.message
            : "A apărut o eroare la salvarea materialului",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="general">
            {t("inventory.form.tabs.general", "General")}
          </TabsTrigger>
          <TabsTrigger value="details">
            {t("inventory.form.tabs.details", "Detalii")}
          </TabsTrigger>
          <TabsTrigger value="stock">
            {t("inventory.form.tabs.stock", "Stoc")}
          </TabsTrigger>
        </TabsList>

        {/* Tab General */}
        <TabsContent value="general" className="space-y-4">
          {/* Nume */}
          <div className="space-y-2">
            <Label htmlFor="name">
              {t("inventory.form.name", "Nume")}
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder={t(
                "inventory.form.namePlaceholder",
                "Introduceți numele materialului"
              )}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Cantitate și unitate */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">
                {t("inventory.form.quantity", "Cantitate")}
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.01"
                {...register("quantity", { valueAsNumber: true })}
              />
              {errors.quantity && (
                <p className="text-sm text-destructive">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">
                {t("inventory.form.unit", "Unitate de măsură")}
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Select
                value={watch("unit")}
                onValueChange={(value) => setValue("unit", value)}
              >
                <SelectTrigger id="unit">
                  <SelectValue
                    placeholder={t(
                      "inventory.form.unitPlaceholder",
                      "Selectați unitatea"
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buc">Bucăți</SelectItem>
                  <SelectItem value="kg">Kilograme</SelectItem>
                  <SelectItem value="g">Grame</SelectItem>
                  <SelectItem value="l">Litri</SelectItem>
                  <SelectItem value="ml">Mililitri</SelectItem>
                  <SelectItem value="m">Metri</SelectItem>
                  <SelectItem value="cm">Centimetri</SelectItem>
                  <SelectItem value="mm">Milimetri</SelectItem>
                  <SelectItem value="m2">Metri pătrați</SelectItem>
                  <SelectItem value="m3">Metri cubi</SelectItem>
                  <SelectItem value="set">Set</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                </SelectContent>
              </Select>
              {errors.unit && (
                <p className="text-sm text-destructive">
                  {errors.unit.message}
                </p>
              )}
            </div>
          </div>

          {/* Categorie */}
          <div className="space-y-2">
            <Label htmlFor="category">
              {t("inventory.form.category", "Categorie")}
            </Label>
            <Select
              value={watch("category")}
              onValueChange={(value) => setValue("category", value)}
            >
              <SelectTrigger id="category">
                <SelectValue
                  placeholder={t(
                    "inventory.form.categoryPlaceholder",
                    "Selectați categoria"
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
                <SelectItem value="other">
                  {t("inventory.form.otherCategory", "Altă categorie")}
                </SelectItem>
              </SelectContent>
            </Select>
            {watch("category") === "other" && (
              <Input
                placeholder={t(
                  "inventory.form.newCategoryPlaceholder",
                  "Introduceți noua categorie"
                )}
                className="mt-2"
                onChange={(e) => setValue("category", e.target.value)}
              />
            )}
          </div>

          {/* Locație */}
          <div className="space-y-2">
            <Label htmlFor="location">
              {t("inventory.form.location", "Locație")}
            </Label>
            <Select
              value={watch("location")}
              onValueChange={(value) => setValue("location", value)}
            >
              <SelectTrigger id="location">
                <SelectValue
                  placeholder={t(
                    "inventory.form.locationPlaceholder",
                    "Selectați locația"
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
                <SelectItem value="other">
                  {t("inventory.form.otherLocation", "Altă locație")}
                </SelectItem>
              </SelectContent>
            </Select>
            {watch("location") === "other" && (
              <Input
                placeholder={t(
                  "inventory.form.newLocationPlaceholder",
                  "Introduceți noua locație"
                )}
                className="mt-2"
                onChange={(e) => setValue("location", e.target.value)}
              />
            )}
          </div>
        </TabsContent>

        {/* Tab Detalii */}
        <TabsContent value="details" className="space-y-4">
          {/* Descriere */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              {t("inventory.form.notes", "Descriere / Note")}
            </Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder={t(
                "inventory.form.notesPlaceholder",
                "Introduceți descrierea sau notele pentru material"
              )}
              rows={3}
            />
          </div>

          {/* Dimensiune și producător */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dimension">
                {t("inventory.form.dimension", "Dimensiune")}
              </Label>
              <Input
                id="dimension"
                {...register("dimension")}
                placeholder={t(
                  "inventory.form.dimensionPlaceholder",
                  "ex: 10x20x30 cm"
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer">
                {t("inventory.form.manufacturer", "Producător")}
              </Label>
              <Input
                id="manufacturer"
                {...register("manufacturer")}
                placeholder={t(
                  "inventory.form.manufacturerPlaceholder",
                  "Numele producătorului"
                )}
              />
            </div>
          </div>

          {/* Preț și furnizor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost_per_unit">
                {t("inventory.form.costPerUnit", "Preț per unitate (RON)")}
              </Label>
              <Input
                id="cost_per_unit"
                type="number"
                min="0"
                step="0.01"
                {...register("cost_per_unit", { valueAsNumber: true })}
              />
              {errors.cost_per_unit && (
                <p className="text-sm text-destructive">
                  {errors.cost_per_unit.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier_id">
                {t("inventory.form.supplier", "Furnizor")}
              </Label>
              <Select
                value={watch("supplier_id")}
                onValueChange={(value) => setValue("supplier_id", value)}
              >
                <SelectTrigger id="supplier_id">
                  <SelectValue
                    placeholder={t(
                      "inventory.form.supplierPlaceholder",
                      "Selectați furnizorul"
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">
                    {t("inventory.form.noSupplier", "Fără furnizor")}
                  </SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Proiect */}
          <div className="space-y-2">
            <Label htmlFor="project_id">
              {t("inventory.form.project", "Proiect")}
            </Label>
            <Select
              value={watch("project_id")}
              onValueChange={(value) => setValue("project_id", value)}
            >
              <SelectTrigger id="project_id">
                <SelectValue
                  placeholder={t(
                    "inventory.form.projectPlaceholder",
                    "Selectați proiectul"
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  {t("inventory.form.noProject", "Fără proiect")}
                </SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* URL imagine */}
          <div className="space-y-2">
            <Label htmlFor="image_url">
              {t("inventory.form.imageUrl", "URL imagine")}
            </Label>
            <Input
              id="image_url"
              {...register("image_url")}
              placeholder={t(
                "inventory.form.imageUrlPlaceholder",
                "URL către imaginea materialului"
              )}
            />
          </div>
        </TabsContent>

        {/* Tab Stoc */}
        <TabsContent value="stock" className="space-y-4">
          {/* Nivel minim și maxim de stoc */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_stock_level">
                {t("inventory.form.minStockLevel", "Nivel minim de stoc")}
              </Label>
              <Input
                id="min_stock_level"
                type="number"
                min="0"
                {...register("min_stock_level", { valueAsNumber: true })}
              />
              {errors.min_stock_level && (
                <p className="text-sm text-destructive">
                  {errors.min_stock_level.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {t(
                  "inventory.form.minStockLevelHelp",
                  "Când stocul scade sub acest nivel, materialul va fi marcat pentru reaprovizionare"
                )}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_stock_level">
                {t("inventory.form.maxStockLevel", "Nivel maxim de stoc")}
              </Label>
              <Input
                id="max_stock_level"
                type="number"
                min="0"
                {...register("max_stock_level", { valueAsNumber: true })}
              />
              {errors.max_stock_level && (
                <p className="text-sm text-destructive">
                  {errors.max_stock_level.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {t(
                  "inventory.form.maxStockLevelHelp",
                  "Nivel recomandat pentru stocul maxim"
                )}
              </p>
            </div>
          </div>

          {/* Informații despre stoc */}
          {isEdit && (
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">
                {t("inventory.form.stockInfo", "Informații despre stoc")}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("inventory.form.currentStock", "Stoc curent")}
                  </p>
                  <p className="font-medium">
                    {watch("quantity")} {watch("unit")}
                  </p>
                </div>
                {material?.suplimentar !== undefined &&
                  material.suplimentar > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t(
                          "inventory.form.suplimentar",
                          "Cantitate suplimentară"
                        )}
                      </p>
                      <p className="font-medium">
                        {material.suplimentar} {watch("unit")}
                      </p>
                    </div>
                  )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Butoane */}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t("common.cancel", "Anulează")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit
            ? t("inventory.form.update", "Actualizează")
            : t("inventory.form.create", "Creează")}
        </Button>
      </div>
    </form>
  );
};

export default MaterialForm;
