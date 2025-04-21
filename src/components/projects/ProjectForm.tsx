import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { inputValidation } from "@/lib/input-validation";
import { supabase } from "@/lib/supabase";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  start_date?: string;
  end_date?: string;
  progress?: number;
  budget?: number;
  client_name?: string;
  client_contact?: string;
  location?: string;
  project_type?: string;
  priority?: string;
  created_at: string;
}

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
  onSuccess: () => void;
}

const PROJECT_TYPES = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "renovation", label: "Renovation" },
  { value: "other", label: "Other" },
];

const PRIORITY_LEVELS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const STATUS_OPTIONS = [
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "on-hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const ProjectForm: React.FC<ProjectFormProps> = ({
  open,
  onOpenChange,
  project,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Define form schema with improved validation for security
  const formSchema = z
    .object({
      name: z
        .string()
        .min(2, {
          message: t(
            "projects.form.validation.nameRequired",
            "Project name is required"
          ),
        })
        .refine((val) => inputValidation.validateText(val), {
          message: t(
            "projects.form.validation.invalidName",
            "Project name contains invalid characters"
          ),
        }),
      description: z
        .string()
        .optional()
        .refine(
          (val) =>
            val === undefined ||
            val === "" ||
            inputValidation.validateText(val),
          {
            message: t(
              "projects.form.validation.invalidDescription",
              "Description contains invalid characters"
            ),
          }
        ),
      status: z.string().default("planning"),
      start_date: z.date().nullable(),
      end_date: z.date().nullable(),
      budget: z.coerce.number().nonnegative().default(0),
      client_name: z
        .string()
        .optional()
        .refine(
          (val) =>
            val === undefined ||
            val === "" ||
            inputValidation.validateText(val),
          {
            message: t(
              "projects.form.validation.invalidClientName",
              "Client name contains invalid characters"
            ),
          }
        ),
      client_contact: z
        .string()
        .optional()
        .refine(
          (val) =>
            val === undefined ||
            val === "" ||
            inputValidation.validateEmail(val),
          {
            message: t(
              "projects.form.validation.invalidClientContact",
              "Client contact must be a valid email"
            ),
          }
        ),
      location: z
        .string()
        .optional()
        .refine(
          (val) =>
            val === undefined ||
            val === "" ||
            inputValidation.validateText(val),
          {
            message: t(
              "projects.form.validation.invalidLocation",
              "Location contains invalid characters"
            ),
          }
        ),
      project_type: z.string().optional(),
      priority: z.string().default("medium"),
    })
    .refine(
      (data) => {
        if (data.start_date && data.end_date) {
          return data.end_date >= data.start_date;
        }
        return true;
      },
      {
        message: t(
          "projects.form.validation.endDateAfterStartDate",
          "End date must be after start date"
        ),
        path: ["end_date"],
      }
    );

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
      status: project?.status || "planning",
      start_date: project?.start_date ? new Date(project.start_date) : null,
      end_date: project?.end_date ? new Date(project.end_date) : null,
      budget: project?.budget || 0,
      client_name: project?.client_name || "",
      client_contact: project?.client_contact || "",
      location: project?.location || "",
      project_type: project?.project_type || "",
      priority: project?.priority || "medium",
    },
  });

  // Update form when project changes
  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        description: project.description || "",
        status: project.status,
        start_date: project.start_date ? new Date(project.start_date) : null,
        end_date: project.end_date ? new Date(project.end_date) : null,
        budget: project.budget || 0,
        client_name: project.client_name || "",
        client_contact: project.client_contact || "",
        location: project.location || "",
        project_type: project.project_type || "",
        priority: project.priority || "medium",
      });
    } else {
      form.reset({
        name: "",
        description: "",
        status: "planning",
        start_date: null,
        end_date: null,
        budget: 0,
        client_name: "",
        client_contact: "",
        location: "",
        project_type: "",
        priority: "medium",
      });
    }
  }, [project, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;

    try {
      setLoading(true);

      // Pregătim datele proiectului pentru salvare în Supabase
      const projectData = {
        name: values.name,
        description: values.description || "",
        status: values.status || "planning",
        start_date: values.start_date
          ? values.start_date.toISOString().split("T")[0]
          : null,
        end_date: values.end_date
          ? values.end_date.toISOString().split("T")[0]
          : null,
        budget: values.budget || 0,
        client_name: values.client_name || null,
        client_contact: values.client_contact || null,
        location: values.location || null,
        project_type: values.project_type || null,
        priority: values.priority || "medium",
        progress: project?.progress || 0,
        manager_id: user.id,
      };

      let result;

      if (project) {
        // Actualizăm proiectul existent
        result = await supabase
          .from("projects")
          .update(projectData)
          .eq("id", project.id);

        if (result.error) throw result.error;

        toast({
          title: t("projects.toasts.updated", "Project Updated"),
          description: t(
            "projects.toasts.updatedDesc",
            "The project has been updated successfully"
          ),
        });
      } else {
        // Creăm un proiect nou
        result = await supabase.from("projects").insert([projectData]).select();

        if (result.error) throw result.error;

        toast({
          title: t("projects.toasts.created", "Project Created"),
          description: t(
            "projects.toasts.createdDesc",
            "The new project has been created successfully"
          ),
        });
      }

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: project
          ? t("projects.errors.updateFailed", "Error updating project")
          : t("projects.errors.createFailed", "Error creating project"),
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>
            {project
              ? t("projects.form.editTitle", "Edit Project")
              : t("projects.form.createTitle", "Create New Project")}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {project
              ? t(
                  "projects.form.editDescription",
                  "Update the details of your project"
                )
              : t(
                  "projects.form.createDescription",
                  "Fill in the details to create a new project"
                )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>
                      {t("projects.form.fields.name", "Project Name")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "projects.form.placeholders.name",
                          "Enter project name"
                        )}
                        className="bg-slate-900 border-slate-700"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>
                      {t("projects.form.fields.description", "Description")}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t(
                          "projects.form.placeholders.description",
                          "Enter project description"
                        )}
                        className="bg-slate-900 border-slate-700 min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("projects.form.fields.status", "Status")}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-slate-900 border-slate-700">
                          <SelectValue
                            placeholder={t(
                              "projects.form.placeholders.status",
                              "Select status"
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {t(`projects.status.${status.value}`, status.label)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("projects.form.fields.priority", "Priority")}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-slate-900 border-slate-700">
                          <SelectValue
                            placeholder={t(
                              "projects.form.placeholders.priority",
                              "Select priority"
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {PRIORITY_LEVELS.map((priority) => (
                          <SelectItem
                            key={priority.value}
                            value={priority.value}
                          >
                            {t(
                              `projects.priority.${priority.value}`,
                              priority.label
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      {t("projects.form.fields.startDate", "Start Date")}
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal bg-slate-900 border-slate-700",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>
                                {t(
                                  "projects.form.placeholders.date",
                                  "Select date"
                                )}
                              </span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 bg-slate-800 border-slate-700"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      {t("projects.form.fields.endDate", "End Date")}
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal bg-slate-900 border-slate-700",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>
                                {t(
                                  "projects.form.placeholders.date",
                                  "Select date"
                                )}
                              </span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 bg-slate-800 border-slate-700"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("projects.form.fields.budget", "Budget")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t(
                          "projects.form.placeholders.budget",
                          "Enter budget amount"
                        )}
                        className="bg-slate-900 border-slate-700"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="project_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("projects.form.fields.type", "Project Type")}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-slate-900 border-slate-700">
                          <SelectValue
                            placeholder={t(
                              "projects.form.placeholders.type",
                              "Select type"
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {PROJECT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {t(`projects.types.${type.value}`, type.label)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("projects.form.fields.clientName", "Client Name")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "projects.form.placeholders.clientName",
                          "Enter client name"
                        )}
                        className="bg-slate-900 border-slate-700"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client_contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t(
                        "projects.form.fields.clientContact",
                        "Client Contact"
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "projects.form.placeholders.clientContact",
                          "Enter client contact"
                        )}
                        className="bg-slate-900 border-slate-700"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>
                      {t("projects.form.fields.location", "Location")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "projects.form.placeholders.location",
                          "Enter project location"
                        )}
                        className="bg-slate-900 border-slate-700"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="bg-slate-700 border-slate-600 hover:bg-slate-600"
              >
                {t("common.cancel", "Cancel")}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <span>{t("common.saving", "Saving...")}</span>
                ) : project ? (
                  t("common.update", "Update")
                ) : (
                  t("common.create", "Create")
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectForm;
