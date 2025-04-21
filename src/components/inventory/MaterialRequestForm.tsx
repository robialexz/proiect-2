import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Loader2, Package, Calendar, Plus, Trash2 } from "lucide-react";
import { MaterialRequest, MaterialRequestWithDetails, CreateMaterialRequestInput, RequestPriority } from "@/models/material-request.model";
import { useMaterialRequests } from "@/hooks/useMaterialRequests";
import { useProjects } from "@/hooks/useProjects";
import { useMaterials } from "@/hooks/useMaterials";

interface MaterialRequestFormProps {
  projectId?: string;
  initialData?: MaterialRequestWithDetails;
  onSuccess?: (request: MaterialRequest) => void;
  onCancel?: () => void;
}

const MaterialRequestForm: React.FC<MaterialRequestFormProps> = ({
  projectId,
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { createRequest, updateRequest } = useMaterialRequests();
  const { projects, loading: projectsLoading } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId || initialData?.project_id || "");
  const { materials, loading: materialsLoading } = useMaterials(selectedProjectId);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Definim schema de validare pentru elementele cererii
  const requestItemSchema = z.object({
    material_id: z.string({
      required_error: t("inventory.requests.materialRequired", "Material is required"),
    }),
    quantity: z.coerce.number({
      required_error: t("inventory.requests.quantityRequired", "Quantity is required"),
    }).positive({
      message: t("inventory.requests.quantityPositive", "Quantity must be positive"),
    }),
    notes: z.string().optional(),
  });

  // Definim schema de validare pentru cerere
  const formSchema = z.object({
    project_id: z.string({
      required_error: t("inventory.requests.projectRequired", "Project is required"),
    }),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    needed_by_date: z.string().optional(),
    notes: z.string().optional(),
    items: z.array(requestItemSchema).min(1, {
      message: t("inventory.requests.itemsRequired", "At least one material is required"),
    }),
  });

  // Inițializăm formularul
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      project_id: projectId || initialData?.project_id || "",
      priority: initialData?.priority || "medium",
      needed_by_date: initialData?.needed_by_date ? new Date(initialData.needed_by_date).toISOString().split("T")[0] : "",
      notes: initialData?.notes || "",
      items: initialData?.items?.map(item => ({
        material_id: item.material_id,
        quantity: item.quantity,
        notes: item.notes || "",
      })) || [{ material_id: "", quantity: 1, notes: "" }],
    },
  });

  // Configurăm array-ul de câmpuri pentru elementele cererii
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Actualizăm valorile implicite când se schimbă proprietățile
  useEffect(() => {
    if (projectId) {
      form.setValue("project_id", projectId);
      setSelectedProjectId(projectId);
    }
  }, [projectId, form]);

  // Actualizăm proiectul selectat când se schimbă
  const handleProjectChange = (value: string) => {
    form.setValue("project_id", value);
    setSelectedProjectId(value);
  };

  // Funcție pentru trimiterea formularului
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      const requestData: CreateMaterialRequestInput = {
        project_id: values.project_id,
        priority: values.priority as RequestPriority,
        needed_by_date: values.needed_by_date,
        notes: values.notes,
        items: values.items.map(item => ({
          material_id: item.material_id,
          quantity: item.quantity,
          notes: item.notes,
        })),
      };
      
      let response;
      
      if (initialData) {
        // Actualizăm cererea existentă
        response = await updateRequest(initialData.id, {
          priority: values.priority as RequestPriority,
          needed_by_date: values.needed_by_date,
          notes: values.notes,
        });
      } else {
        // Creăm o cerere nouă
        response = await createRequest(requestData);
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
        title: t("inventory.requests.submitError", "Error"),
        description: t("inventory.requests.submitErrorDescription", "An error occurred while saving the request."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funcție pentru adăugarea unui element nou
  const addItem = () => {
    append({ material_id: "", quantity: 1, notes: "" });
  };

  // Renderăm formularul
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData
            ? t("inventory.requests.editRequest", "Edit Material Request")
            : t("inventory.requests.newRequest", "New Material Request")}
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
                  <FormLabel>{t("inventory.requests.project", "Project")}</FormLabel>
                  <Select
                    disabled={!!projectId || isSubmitting || projectsLoading || !!initialData}
                    onValueChange={(value) => handleProjectChange(value)}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("inventory.requests.selectProject", "Select a project")} />
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

            {/* Prioritate */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("inventory.requests.priority", "Priority")}</FormLabel>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("inventory.requests.selectPriority", "Select priority")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center">
                          <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                          {t("inventory.requests.priorityLow", "Low")}
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center">
                          <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                          {t("inventory.requests.priorityMedium", "Medium")}
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center">
                          <span className="h-2 w-2 rounded-full bg-orange-500 mr-2"></span>
                          {t("inventory.requests.priorityHigh", "High")}
                        </div>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <div className="flex items-center">
                          <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                          {t("inventory.requests.priorityUrgent", "Urgent")}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Data necesară */}
            <FormField
              control={form.control}
              name="needed_by_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("inventory.requests.neededByDate", "Needed By Date")} ({t("common.optional", "Optional")})</FormLabel>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <FormControl>
                      <Input
                        type="date"
                        disabled={isSubmitting}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                  </div>
                  <FormDescription>
                    {t("inventory.requests.neededByDateDescription", "When these materials are needed")}
                  </FormDescription>
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
                  <FormLabel>{t("inventory.requests.notes", "Notes")} ({t("common.optional", "Optional")})</FormLabel>
                  <FormControl>
                    <Textarea disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Materiale */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormLabel>{t("inventory.requests.materials", "Materials")}</FormLabel>
                {!initialData && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItem}
                    disabled={isSubmitting}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("inventory.requests.addMaterial", "Add Material")}
                  </Button>
                )}
              </div>
              
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-md space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">
                      {t("inventory.requests.materialItem", "Material {{index}}", { index: index + 1 })}
                    </h4>
                    {!initialData && fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Material */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.material_id`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("inventory.requests.material", "Material")}</FormLabel>
                          <Select
                            disabled={isSubmitting || materialsLoading || !!initialData}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("inventory.requests.selectMaterial", "Select a material")} />
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
                                    <div className="flex items-center">
                                      <Package className="h-4 w-4 mr-2 text-gray-500" />
                                      {material.name} ({material.unit})
                                    </div>
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
                          <FormLabel>{t("inventory.requests.quantity", "Quantity")}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              disabled={isSubmitting || !!initialData}
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Note pentru material */}
                  <FormField
                    control={form.control}
                    name={`items.${index}.notes`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("inventory.requests.materialNotes", "Notes for this material")} ({t("common.optional", "Optional")})</FormLabel>
                        <FormControl>
                          <Input disabled={isSubmitting || !!initialData} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
              
              {form.formState.errors.items?.message && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.items?.message}
                </p>
              )}
            </div>

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
    </Card>
  );
};

export default MaterialRequestForm;
