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

type Budget = Database["public"]["Tables"]["budgets"]["Row"];
type Project = Database["public"]["Tables"]["projects"]["Row"];

interface BudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: Budget;
  onSuccess: () => void;
}

const BudgetForm: React.FC<BudgetFormProps> = ({
  open,
  onOpenChange,
  budget,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  // Define form schema
  const formSchema = z.object({
    name: z.string().min(2, {
      message: "Budget name is required",
    }),
    description: z.string().optional(),
    project_id: z.string().min(1, {
      message: "Project is required",
    }),
    total_amount: z.coerce.number().positive({
      message: "Amount must be greater than 0",
    }),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    status: z.string().default("active"),
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: budget?.name || "",
      description: budget?.description || "",
      project_id: budget?.project_id || "",
      total_amount: budget?.total_amount || 0,
      start_date: budget?.start_date ? new Date(budget.start_date).toISOString().split('T')[0] : "",
      end_date: budget?.end_date ? new Date(budget.end_date).toISOString().split('T')[0] : "",
      status: budget?.status || "active",
    },
  });

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("name");

        if (error) throw error;
        setProjects(data || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast({
          variant: "destructive",
          title: "Error loading projects",
          description: "Could not load projects. Please try again.",
        });
      }
    };

    fetchProjects();
  }, []);

  // Update form values when budget changes
  useEffect(() => {
    if (budget) {
      form.reset({
        name: budget.name,
        description: budget.description || "",
        project_id: budget.project_id,
        total_amount: budget.total_amount,
        start_date: budget.start_date ? new Date(budget.start_date).toISOString().split('T')[0] : "",
        end_date: budget.end_date ? new Date(budget.end_date).toISOString().split('T')[0] : "",
        status: budget.status,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        project_id: "",
        total_amount: 0,
        start_date: "",
        end_date: "",
        status: "active",
      });
    }
  }, [budget, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    try {
      setLoading(true);

      if (budget) {
        // Update existing budget
        const { error } = await supabase
          .from("budgets")
          .update({
            name: values.name,
            description: values.description,
            project_id: values.project_id,
            total_amount: values.total_amount,
            start_date: values.start_date || null,
            end_date: values.end_date || null,
            status: values.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", budget.id);

        if (error) throw error;

        toast({
          title: "Budget updated",
          description: "The budget has been updated successfully",
        });
      } else {
        // Create new budget
        const { error } = await supabase.from("budgets").insert({
          name: values.name,
          description: values.description,
          project_id: values.project_id,
          total_amount: values.total_amount,
          start_date: values.start_date || null,
          end_date: values.end_date || null,
          status: values.status,
          created_by: user.id,
        });

        if (error) throw error;

        toast({
          title: "Budget created",
          description: "The new budget has been created successfully",
        });
      }

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error saving budget:", error);
      toast({
        variant: "destructive",
        title: budget
          ? "Error updating budget"
          : "Error creating budget",
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
            {budget ? "Edit Budget" : "Create New Budget"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {budget
              ? "Update the budget details below"
              : "Fill in the details to create a new budget"}
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
                    <FormLabel>Budget Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter budget name"
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
                name="project_id"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Project</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
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
                name="total_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter amount"
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
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
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
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
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
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
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
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a description for the budget"
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
                  <motion.div
                    className="h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin"
                  />
                ) : budget ? (
                  "Save Changes"
                ) : (
                  "Create Budget"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetForm;
