import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import {
  Users,
  UserPlus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowLeft,
  Mail,
  Phone,
  Plus
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Database } from "@/types/supabase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

type Team = Database["public"]["Tables"]["teams"]["Row"];
type TeamMember = Database["public"]["Tables"]["team_members"]["Row"];

interface TeamMembersProps {
  team: Team;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TeamMembers: React.FC<TeamMembersProps> = ({
  team,
  open,
  onOpenChange
}) => {
  const { t } = useTranslation();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    if (open && team) {
      fetchTeamMembers();
    }
  }, [open, team]);

  const fetchTeamMembers = async () => {
    if (!team) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("team_id", team.id)
        .order("name");

      if (error) {
        throw error;
      }

      setMembers(data || []);
    } catch (error) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t("teams.members.errors.fetchFailed"),
        description: t("teams.members.errors.fetchFailedDescription"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);

      if (error) {
        throw error;
      }

      setMembers(members.filter(member => member.id !== memberId));
      toast({
        title: t("teams.members.notifications.memberDeleted"),
        description: t("teams.members.notifications.memberDeletedDescription"),
      });
    } catch (error) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t("teams.members.errors.deleteFailed"),
        description: t("teams.members.errors.deleteFailedDescription"),
      });
    }
  };

  const filteredMembers = members.filter(member =>
    (member.name && member.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (member.email && member.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (member.role && member.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("teams.members.title", { teamName: team?.name })}
            </DialogTitle>
            <DialogDescription>
              {t("teams.members.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("teams.members.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button
                onClick={() => {
                  setEditMember(null);
                  setAddMemberOpen(true);
                }}
                className="flex items-center gap-1"
              >
                <UserPlus className="h-4 w-4" />
                {t("teams.members.addMember")}
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("teams.members.columns.name")}</TableHead>
                    <TableHead>{t("teams.members.columns.email")}</TableHead>
                    <TableHead>{t("teams.members.columns.role")}</TableHead>
                    <TableHead>{t("teams.members.columns.phone")}</TableHead>
                    <TableHead className="text-right">{t("teams.members.columns.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-6 w-[150px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[120px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {searchQuery
                          ? t("teams.members.noSearchResults")
                          : t("teams.members.noMembers")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    <AnimatePresence>
                      {filteredMembers.map((member) => (
                        <motion.tr
                          key={member.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit={{ opacity: 0, y: -10 }}
                          className="border-b"
                        >
                          <TableCell className="font-medium">{member.name || "-"}</TableCell>
                          <TableCell>
                            {member.email ? (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                {member.email}
                              </div>
                            ) : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {member.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {member.phone ? (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                {member.phone}
                              </div>
                            ) : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{t("teams.members.actions.manageMember")}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditMember(member);
                                    setAddMemberOpen(true);
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  {t("teams.members.actions.edit")}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleDeleteMember(member.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {t("teams.members.actions.delete")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("common.back")}
            </Button>
            <div className="text-sm text-muted-foreground">
              {filteredMembers.length} {t("teams.members.membersFound")}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TeamMemberForm
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        teamId={team?.id}
        member={editMember}
        onSuccess={fetchTeamMembers}
      />
    </>
  );
};

// Team Member Form Component
interface TeamMemberFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId?: string;
  member?: TeamMember | null;
  onSuccess: () => void;
}

const TeamMemberForm: React.FC<TeamMemberFormProps> = ({
  open,
  onOpenChange,
  teamId,
  member,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  // Define form schema
  const formSchema = z.object({
    name: z.string().min(2, {
      message: t("teams.members.form.validation.nameRequired"),
    }),
    email: z.string().email({
      message: t("teams.members.form.validation.emailInvalid"),
    }),
    role: z.string().min(1, {
      message: t("teams.members.form.validation.roleRequired"),
    }),
    phone: z.string().optional(),
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: member?.name || "",
      email: member?.email || "",
      role: member?.role || "member",
      phone: member?.phone || "",
    },
  });

  // Update form values when member changes
  useEffect(() => {
    if (member) {
      form.reset({
        name: member.name || "",
        email: member.email || "",
        role: member.role || "member",
        phone: member.phone || "",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        role: "member",
        phone: "",
      });
    }
  }, [member, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!teamId) return;

    try {
      setLoading(true);

      if (member) {
        // Update existing member
        const { error } = await supabase
          .from("team_members")
          .update({
            name: values.name,
            email: values.email,
            role: values.role,
            phone: values.phone,
            updated_at: new Date().toISOString(),
          })
          .eq("id", member.id);

        if (error) throw error;

        toast({
          title: t("teams.members.form.updateSuccess"),
          description: t("teams.members.form.updateSuccessDescription"),
        });
      } else {
        // Create new member
        try {
        const { error } = await supabase.from("team_members").insert({
        } catch (error) {
          // Handle error appropriately
        }
          team_id: teamId,
          name: values.name,
          email: values.email,
          role: values.role,
          phone: values.phone,
        });

        if (error) throw error;

        toast({
          title: t("teams.members.form.createSuccess"),
          description: t("teams.members.form.createSuccessDescription"),
        });
      }

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: member
          ? t("teams.members.form.updateError")
          : t("teams.members.form.createError"),
        description: t("teams.members.form.errorDescription"),
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
            {member ? t("teams.members.form.editTitle") : t("teams.members.form.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {member
              ? t("teams.members.form.editDescription")
              : t("teams.members.form.createDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("teams.members.form.fields.name")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("teams.members.form.placeholders.name")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("teams.members.form.fields.email")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("teams.members.form.placeholders.email")}
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("teams.members.form.fields.role")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("teams.members.form.placeholders.role")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="manager">{t("teams.members.roles.manager")}</SelectItem>
                      <SelectItem value="lead">{t("teams.members.roles.lead")}</SelectItem>
                      <SelectItem value="member">{t("teams.members.roles.member")}</SelectItem>
                      <SelectItem value="guest">{t("teams.members.roles.guest")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("teams.members.form.fields.phone")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("teams.members.form.placeholders.phone")}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("teams.members.form.descriptions.phone")}
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
                ) : member ? (
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

export default TeamMembers;
