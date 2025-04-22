import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Database } from "@/types/supabase";
import { useAuth } from "@/contexts/AuthContext";

type Report = Database["public"]["Tables"]["reports"]["Row"];
type Project = Database["public"]["Tables"]["projects"]["Row"];
type ReportTemplate = Database["public"]["Tables"]["report_templates"]["Row"];

interface ReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report?: Report;
  onSuccess: () => void;
  autoGenerate?: boolean;
}

const ReportForm: React.FC<ReportFormProps> = ({
  open,
  onOpenChange,
  report,
  onSuccess,
  autoGenerate = false,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);

  // Define form schema
  const formSchema = z.object({
    name: z.string().min(2, {
      message: "Report name is required",
    }),
    description: z.string().optional(),
    project_id: z.string().optional(),
    type: z.string().min(1, {
      message: "Report type is required",
    }),
    status: z.string().default("draft"),
    template_id: z.string().optional(),
    auto_generate: z.boolean().default(false),
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: report?.name || "",
      description: report?.description || "",
      project_id: report?.project_id || "",
      type: report?.type || "",
      status: report?.status || "draft",
      template_id: "",
      auto_generate: false,
    },
  });

  // Fetch projects and templates
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch projects
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("*")
          .order("name");

        if (projectsError) throw projectsError;
        setProjects(projectsData || []);

        // Fetch report templates
        const { data: templatesData, error: templatesError } = await supabase
          .from("report_templates")
          .select("*")
          .order("name");

        if (templatesError) throw templatesError;
        setTemplates(templatesData || []);
      } catch (error) {
        // Removed console statement
        toast({
          variant: "destructive",
          title: "Error loading data",
          description:
            "Could not load projects or templates. Please try again.",
        });
      }
    };

    fetchData();
  }, []);

  // Update form values when report changes
  useEffect(() => {
    if (report) {
      form.reset({
        name: report.name,
        description: report.description || "",
        project_id: report.project_id || "",
        type: report.type,
        status: report.status,
        template_id: "",
        auto_generate: autoGenerate,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        project_id: "",
        type: "project",
        status: "draft",
        template_id: "",
        auto_generate: autoGenerate,
      });
    }
  }, [report, form, autoGenerate]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;

    try {
      setLoading(true);

      // If a template is selected, get its data
      let templateData = null;
      if (values.template_id) {
        const template = templates.find((t) => t.id === values.template_id);
        if (template) {
          templateData = template.template;
        }
      }

      // Handle auto-generated report
      if (values.auto_generate && values.project_id) {
        try {
          // Call the database function to generate the report
          const { error } = await supabase.rpc("generate_project_report", {
            project_id_param: values.project_id,
          });

          if (error) throw error;

          toast({
            title: "Auto-generated report created",
            description:
              "A comprehensive report has been automatically generated",
          });

          onOpenChange(false);
          onSuccess();
          return;
        } catch (autoGenError: any) {
          // Removed console statement
          toast({
            variant: "destructive",
            title: "Error generating report",
            description: autoGenError.message,
          });
          // Continue with normal report creation as fallback
        }
      }

      if (report) {
        // Update existing report
        const { error } = await supabase
          .from("reports")
          .update({
            name: values.name,
            description: values.description,
            project_id: values.project_id || null,
            type: values.type,
            status: values.status,
            data: templateData || report.data,
            updated_at: new Date().toISOString(),
          })
          .eq("id", report.id);

        if (error) throw error;

        toast({
          title: "Report updated",
          description: "The report has been updated successfully",
        });
      } else {
        // Create new report
        const { error } = await supabase.from("reports").insert({
          name: values.name,
          description: values.description,
          project_id: values.project_id || null,
          type: values.type,
          status: values.status,
          data: templateData || {},
          created_by: user.id,
        });

        if (error) throw error;

        toast({
          title: "Report created",
          description: "The new report has been created successfully",
        });
      }

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: report ? "Error updating report" : "Error creating report",
        description: error.message,
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
            {report ? "Edit Report" : "Create New Report"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {report
              ? "Update the report details below"
              : "Fill in the details to create a new report"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Report Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter report name"
                        {...field}
                        className="bg-slate-700 border-slate-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="inventory">Inventory</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="project_id"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Project (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue placeholder="Select a project (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="">None</SelectItem>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-slate-400">
                      Associate this report with a specific project
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!report && (
                <>
                  <FormField
                    control={form.control}
                    name="template_id"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Template (Optional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-slate-700 border-slate-600">
                              <SelectValue placeholder="Select a template (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            <SelectItem value="">None</SelectItem>
                            {templates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-slate-400">
                          Start with a pre-defined template
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="auto_generate"
                    render={({ field }) => (
                      <FormItem className="col-span-2 flex flex-row items-start space-x-3 space-y-0 rounded-md border border-slate-600 p-4 bg-slate-700/30">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Generate Automatic Report</FormLabel>
                          <FormDescription className="text-slate-400">
                            Automatically generate a comprehensive report with
                            project status, materials, deliveries and purchases
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a description for the report"
                        {...field}
                        className="bg-slate-700 border-slate-600 min-h-[100px]"
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
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <motion.div className="h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin" />
                ) : report ? (
                  "Save Changes"
                ) : (
                  "Create Report"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportForm;
