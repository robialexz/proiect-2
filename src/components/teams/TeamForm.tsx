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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { Database } from "@/types/supabase";
import { useAuth } from "@/contexts/AuthContext";

type Team = Database["public"]["Tables"]["teams"]["Row"];

interface TeamFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team?: Team;
  onSuccess: () => void;
}

const TeamForm: React.FC<TeamFormProps> = ({
  open,
  onOpenChange,
  team,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Define form schema
  const formSchema = z.object({
    name: z.string().min(2, {
      message: t("teams.form.validation.nameRequired"),
    }),
    description: z.string().optional(),
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: team?.name || "",
      description: team?.description || "",
    },
  });

  // Update form values when team changes
  useEffect(() => {
    if (team) {
      form.reset({
        name: team.name,
        description: team.description || "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
      });
    }
  }, [team, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    try {
      setLoading(true);

      if (team) {
        // Update existing team
        const { error } = await supabase
          .from("teams")
          .update({
            name: values.name,
            description: values.description,
            updated_at: new Date().toISOString(),
          })
          .eq("id", team.id);

        if (error) throw error;

        toast({
          title: t("teams.form.updateSuccess"),
          description: t("teams.form.updateSuccessDescription"),
        });
      } else {
        // Create new team
        try {
        const { error } = await supabase.from("teams").insert({
        } catch (error) {
          // Handle error appropriately
        }
          name: values.name,
          description: values.description,
          created_by: user.id,
        });

        if (error) throw error;

        toast({
          title: t("teams.form.createSuccess"),
          description: t("teams.form.createSuccessDescription"),
        });
      }

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: team
          ? t("teams.form.updateError")
          : t("teams.form.createError"),
        description: t("teams.form.errorDescription"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {team ? t("teams.form.editTitle") : t("teams.form.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {team
              ? t("teams.form.editDescription")
              : t("teams.form.createDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("teams.form.fields.name")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("teams.form.placeholders.name")}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("teams.form.descriptions.name")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("teams.form.fields.description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("teams.form.placeholders.description")}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("teams.form.descriptions.description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <motion.div
                    className="h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin"
                  />
                ) : team ? (
                  t("common.save")
                ) : (
                  t("common.create")
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TeamForm;
