import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
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
import { Button } from "@/components/ui/button";

// Define the form schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  type: z.string().min(1, "Please select a resource type"),
  status: z.string().min(1, "Please select a status"),
  cost_per_day: z.coerce.number().optional(),
  category_ids: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ResourceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource?: any; // The resource to edit, if any
  onSuccess: () => void;
}

const ResourceForm: React.FC<ResourceFormProps> = ({
  open,
  onOpenChange,
  resource,
  onSuccess,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Initialize form with default values or resource values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: resource?.name || "",
      description: resource?.description || "",
      type: resource?.type || "",
      status: resource?.status || "available",
      cost_per_day: resource?.cost_per_day || undefined,
      category_ids: [],
    },
  });

  // Fetch categories and resource categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("resource_categories")
          .select("*")
          .order("name");

        if (error) {
          throw error;
        }

        setCategories(data || []);

        // If editing a resource, fetch its categories
        if (resource) {
          const { data: mappings, error: mappingError } = await supabase
            .from("resource_category_mappings")
            .select("category_id")
            .eq("resource_id", resource.id);

          if (mappingError) {
            throw mappingError;
          }

          const categoryIds = mappings?.map(m => m.category_id) || [];
          setSelectedCategories(categoryIds);
          form.setValue("category_ids", categoryIds);
        }
      } catch (error: any) {
        // Removed console statement
        toast({
          variant: "destructive",
          title: "Error loading categories",
          description: error.message,
        });
      }
    };

    if (open) {
      fetchCategories();
    }
  }, [open, resource, form, toast]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!user) return;

    setLoading(true);

    try {
      if (resource) {
        // Update existing resource
        const { error } = await supabase
          .from("resources")
          .update({
            name: values.name,
            description: values.description,
            type: values.type,
            status: values.status,
            cost_per_day: values.cost_per_day || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", resource.id);

        if (error) throw error;

        // Update categories if they've changed
        if (values.category_ids && values.category_ids.length > 0) {
          // First delete existing mappings
          const { error: deleteError } = await supabase
            .from("resource_category_mappings")
            .delete()
            .eq("resource_id", resource.id);

          if (deleteError) throw deleteError;

          // Then insert new mappings
          const mappings = values.category_ids.map(categoryId => ({
            resource_id: resource.id,
            category_id: categoryId,
          }));

          const { error: insertError } = await supabase
            .from("resource_category_mappings")
            .insert(mappings);

          if (insertError) throw insertError;
        }

        toast({
          title: "Resource updated",
          description: "The resource has been updated successfully",
        });
      } else {
        // Create new resource
        const { data, error } = await supabase
          .from("resources")
          .insert({
            name: values.name,
            description: values.description,
            type: values.type,
            status: values.status,
            cost_per_day: values.cost_per_day || null,
            created_by: user.id,
          })
          .select();

        if (error) throw error;

        // Insert category mappings if any
        if (values.category_ids && values.category_ids.length > 0 && data && data.length > 0) {
          const newResourceId = data[0].id;
          const mappings = values.category_ids.map(categoryId => ({
            resource_id: newResourceId,
            category_id: categoryId,
          }));

          const { error: mappingError } = await supabase
            .from("resource_category_mappings")
            .insert(mappings);

          if (mappingError) throw mappingError;
        }

        toast({
          title: "Resource created",
          description: "The new resource has been created successfully",
        });
      }

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: resource
          ? "Error updating resource"
          : "Error creating resource",
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
            {resource ? "Edit Resource" : "Add New Resource"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {resource
              ? "Update the resource details below"
              : "Fill in the details to add a new resource"}
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
                    <FormLabel>Resource Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter resource name"
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
                    <FormLabel>Resource Type</FormLabel>
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
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="vehicle">Vehicle</SelectItem>
                        <SelectItem value="tool">Tool</SelectItem>
                        <SelectItem value="machinery">Machinery</SelectItem>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="office">Office Equipment</SelectItem>
                        <SelectItem value="personnel">Personnel</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
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
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="in_use">In Use</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cost_per_day"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Cost Per Day (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter cost per day"
                        {...field}
                        className="bg-slate-700 border-slate-600"
                      />
                    </FormControl>
                    <FormDescription className="text-slate-400">
                      The daily cost for using this resource
                    </FormDescription>
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
                        placeholder="Enter a description for the resource"
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
                ) : resource ? (
                  "Save Changes"
                ) : (
                  "Add Resource"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceForm;
