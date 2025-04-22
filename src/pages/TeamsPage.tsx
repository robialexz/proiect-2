import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import {
  PlusCircle,
  Search,
  MoreHorizontal,
  Users,
  UserPlus,
  Edit,
  Trash2,
  UserCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";

type Team = Database["public"]["Tables"]["teams"]["Row"];
type TeamMember = Database["public"]["Tables"]["team_members"]["Row"];

interface NewTeamData {
  name: string;
  description: string;
}

const TeamsPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTeamMembersDialogOpen, setIsTeamMembersDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [newTeam, setNewTeam] = useState<NewTeamData>({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (user) {
      fetchTeams();
    }
  }, [user]);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);

      // Folosim un cache key pentru a stoca datele în localStorage
      const cacheKey = "teams_data";
      const cachedData = localStorage.getItem(cacheKey);

      // Dacă avem date în cache, le folosim pentru afișarea inițială
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          if (Array.isArray(parsedData)) {
            setTeams(parsedData);
            // Continuăm cu încărcarea datelor noi în fundal
          }
        } catch (cacheError) {
          // Removed console statement
          // Dacă cache-ul este corupt, îl ștergem
          localStorage.removeItem(cacheKey);
        }
      }

      // Optimizăm query-ul pentru a reduce timpul de încărcare
      const { data, error } = await supabase
        .from("teams")
        .select("id, name, description, created_at, created_by") // Selectăm doar coloanele necesare
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Actualizăm starea și cache-ul
      setTeams(data || []);
      localStorage.setItem(cacheKey, JSON.stringify(data));

      // Setăm un timeout pentru expirarea cache-ului (30 minute)
      const expireTime = Date.now() + 30 * 60 * 1000;
      localStorage.setItem(`${cacheKey}_expiry`, expireTime.toString());
    } catch (error: any) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t("teams.errors.fetchFailed", "Error loading teams"),
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeam.name.trim()) {
      toast({
        variant: "destructive",
        title: t("teams.errors.nameRequired", "Team name is required"),
        description: t(
          "teams.errors.nameRequiredDesc",
          "Please enter a name for your team"
        ),
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("teams")
        .insert({
          name: newTeam.name,
          description: newTeam.description,
          created_by: user?.id,
        })
        .select();

      if (error) throw error;

      setTeams([...(data || []), ...teams]);
      setNewTeam({ name: "", description: "" });
      setIsCreateDialogOpen(false);

      toast({
        title: t("teams.form.createSuccess", "Team created successfully"),
        description: t(
          "teams.form.createSuccessDescription",
          "The new team has been created and is ready to use"
        ),
      });
    } catch (error: any) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t("teams.form.createError", "Error creating team"),
        description: error.message,
      });
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      const { error } = await supabase.from("teams").delete().eq("id", teamId);

      if (error) throw error;

      setTeams(teams.filter((team) => team.id !== teamId));
      toast({
        title: t("teams.notifications.teamDeleted", "Team deleted"),
        description: t(
          "teams.notifications.teamDeletedDescription",
          "The team has been successfully deleted"
        ),
      });
    } catch (error: any) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t("teams.errors.deleteFailed", "Error deleting team"),
        description: error.message,
      });
    }
  };

  const handleViewMembers = (team: Team) => {
    setSelectedTeam(team);
    setIsTeamMembersDialogOpen(true);
  };

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (team.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white">{t("common.loading", "Loading...")}</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{t("teams.title", "Teams")}</h1>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="search"
                  placeholder={t(
                    "teams.list.searchPlaceholder",
                    "Search teams..."
                  )}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full bg-slate-800 border-slate-700 focus:ring-primary"
                />
              </div>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  {t("teams.actions.addTeam", "Add Team")}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] bg-slate-800 border-slate-700 text-white">
                  <DialogHeader>
                    <DialogTitle>
                      {t("teams.form.createTitle", "Create New Team")}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                      {t(
                        "teams.form.createDescription",
                        "Fill in the details to create a new team"
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label
                        htmlFor="name"
                        className="text-right text-slate-400"
                      >
                        {t("teams.form.fields.name", "Team Name")}
                      </label>
                      <Input
                        id="name"
                        value={newTeam.name}
                        onChange={(e) =>
                          setNewTeam({ ...newTeam, name: e.target.value })
                        }
                        className="col-span-3 bg-slate-700 border-slate-600"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label
                        htmlFor="description"
                        className="text-right text-slate-400"
                      >
                        {t("teams.form.fields.description", "Description")}
                      </label>
                      <Input
                        id="description"
                        value={newTeam.description}
                        onChange={(e) =>
                          setNewTeam({
                            ...newTeam,
                            description: e.target.value,
                          })
                        }
                        className="col-span-3 bg-slate-700 border-slate-600"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="bg-slate-700 border-slate-600 hover:bg-slate-600"
                    >
                      {t("common.cancel", "Cancel")}
                    </Button>
                    <Button onClick={handleCreateTeam}>
                      {t("common.create", "Create")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 6 }).map((_, index) => (
                  <Card
                    key={index}
                    className="bg-slate-800 border-slate-700 h-[200px] animate-pulse"
                  >
                    <CardHeader className="pb-2">
                      <div className="h-6 w-24 bg-slate-700 rounded"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 w-full bg-slate-700 rounded mb-2"></div>
                      <div className="h-4 w-2/3 bg-slate-700 rounded"></div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredTeams.length === 0 ? (
                <div className="col-span-3 text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-slate-500 mb-4" />
                  <h3 className="text-xl font-medium mb-2">
                    {searchTerm
                      ? t(
                          "teams.list.noSearchResults",
                          "No teams found matching your search"
                        )
                      : t(
                          "teams.list.noTeams",
                          "No teams found. Create a new one!"
                        )}
                  </h3>
                  <p className="text-slate-400 max-w-md mx-auto mb-6">
                    {searchTerm
                      ? t(
                          "teams.list.tryDifferentSearch",
                          "Try a different search term or clear the search"
                        )
                      : t(
                          "teams.list.createTeamPrompt",
                          "Create your first team to start collaborating with others"
                        )}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      {t("teams.actions.addTeam", "Add Team")}
                    </Button>
                  )}
                </div>
              ) : (
                filteredTeams.map((team) => (
                  <motion.div
                    key={team.id}
                    whileHover={{
                      y: -5,
                      boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)",
                    }}
                    className="h-full"
                  >
                    <Card className="h-full bg-slate-800 border-slate-700 overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <Badge className="px-2 py-1 text-xs font-medium bg-primary/20 text-primary">
                            {t("teams.teamLabel", "Team")}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-slate-800 border-slate-700 text-white"
                            >
                              <DropdownMenuLabel>
                                {t("teams.actions.manageTeam", "Manage Team")}
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-slate-700" />
                              <DropdownMenuItem
                                className="flex items-center cursor-pointer hover:bg-slate-700"
                                onClick={() => handleViewMembers(team)}
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                {t("teams.actions.viewMembers", "View Members")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center cursor-pointer hover:bg-slate-700"
                                onClick={() => {
                                  setSelectedTeam(team);
                                  setNewTeam({
                                    name: team.name,
                                    description: team.description || "",
                                  });
                                  setIsCreateDialogOpen(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                {t("teams.actions.edit", "Edit")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-slate-700" />
                              <DropdownMenuItem
                                className="flex items-center cursor-pointer text-red-500 hover:bg-red-500/10 hover:text-red-400"
                                onClick={() => handleDeleteTeam(team.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t("teams.actions.delete", "Delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <CardTitle className="mt-2 text-xl">
                          {team.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-400 text-sm mb-4">
                          {team.description ||
                            t("teams.noDescription", "No description provided")}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-slate-500">
                            <Users className="h-4 w-4 mr-1" />
                            <span>
                              {t("teams.createdAt", "Created")}:{" "}
                              {new Date(team.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => handleViewMembers(team)}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            {t("teams.actions.manageMembers", "Manage Members")}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </main>
      </div>

      {/* Team Members Dialog */}
      {selectedTeam && (
        <Dialog
          open={isTeamMembersDialogOpen}
          onOpenChange={setIsTeamMembersDialogOpen}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t("teams.members.title", { teamName: selectedTeam.name })}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {t("teams.members.description", "Manage your team members")}
              </DialogDescription>
            </DialogHeader>

            {/* Team Members Content */}
            <div className="py-4">
              {/* Team Members implementation will go here */}
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 mx-auto text-slate-500 mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  {t(
                    "teams.members.addMembersPrompt",
                    "Add members to your team"
                  )}
                </h3>
                <p className="text-slate-400 max-w-md mx-auto mb-6">
                  {t(
                    "teams.members.addMembersDescription",
                    "Invite team members to collaborate on projects together"
                  )}
                </p>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t("teams.members.addMember", "Add Member")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TeamsPage;
