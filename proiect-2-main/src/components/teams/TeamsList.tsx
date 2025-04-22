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
  UserCheck,
  ChevronDown,
  Plus
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Database } from "@/types/supabase";

type Team = Database["public"]["Tables"]["teams"]["Row"];

interface TeamsListProps {
  onAddTeam: () => void;
  onEditTeam: (team: Team) => void;
  onViewTeamMembers: (team: Team) => void;
}

const TeamsList: React.FC<TeamsListProps> = ({
  onAddTeam,
  onEditTeam,
  onViewTeamMembers
}) => {
  const { t } = useTranslation();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof Team>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order(sortField, { ascending: sortDirection === "asc" });

      if (error) {
        throw error;
      }

      setTeams(data || []);
    } catch (error) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t("teams.errors.fetchFailed"),
        description: t("teams.errors.fetchFailedDescription"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      const { error } = await supabase
        .from("teams")
        .delete()
        .eq("id", teamId);

      if (error) {
        throw error;
      }

      setTeams(teams.filter(team => team.id !== teamId));
      toast({
        title: t("teams.notifications.teamDeleted"),
        description: t("teams.notifications.teamDeletedDescription"),
      });
    } catch (error) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t("teams.errors.deleteFailed"),
        description: t("teams.errors.deleteFailedDescription"),
      });
    }
  };

  const handleSort = (field: keyof Team) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (team.description && team.description.toLowerCase().includes(searchQuery.toLowerCase()))
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
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("teams.list.title")}
            </CardTitle>
            <CardDescription>
              {t("teams.list.description")}
            </CardDescription>
          </div>
          <Button onClick={onAddTeam} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            {t("teams.actions.addTeam")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("teams.list.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    {t("teams.list.columns.name")}
                    {sortField === "name" && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead>{t("teams.list.columns.description")}</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("created_at")}
                >
                  <div className="flex items-center gap-1">
                    {t("teams.list.columns.createdAt")}
                    {sortField === "created_at" && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-right">{t("teams.list.columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-6 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[250px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                  </TableRow>
                ))
              ) : filteredTeams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {searchQuery
                      ? t("teams.list.noSearchResults")
                      : t("teams.list.noTeams")}
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence>
                  {filteredTeams.map((team) => (
                    <motion.tr
                      key={team.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, y: -10 }}
                      className="border-b"
                    >
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell>{team.description || "-"}</TableCell>
                      <TableCell>
                        {new Date(team.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t("teams.actions.manageTeam")}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onViewTeamMembers(team)}>
                              <UserCheck className="mr-2 h-4 w-4" />
                              {t("teams.actions.viewMembers")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEditTeam(team)}>
                              <Edit className="mr-2 h-4 w-4" />
                              {t("teams.actions.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteTeam(team.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t("teams.actions.delete")}
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
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {filteredTeams.length} {t("teams.list.teamsFound")}
        </div>
        <Button variant="outline" onClick={fetchTeams}>
          {t("common.refresh")}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TeamsList;
