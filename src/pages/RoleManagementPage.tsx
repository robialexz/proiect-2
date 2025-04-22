import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useAdvancedRole } from "@/contexts/AdvancedRoleContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Search, Edit, Users, Shield } from "lucide-react";

// Definim tipul pentru utilizator cu rol
interface UserWithRole {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

const RoleManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { hasPermission, loading: roleLoading } = useAdvancedRole();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [newRole, setNewRole] = useState("");

  // Funcție pentru încărcarea utilizatorilor
  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Obținem toți utilizatorii din autentificare
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

      if (authError) throw authError;

      if (!authUsers) {
        setUsers([]);
        return;
      }

      // Obținem rolurile utilizatorilor
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("*");

      if (roleError) throw roleError;

      // Combinăm datele
      const usersWithRoles: UserWithRole[] = authUsers.users.map((authUser) => {
        const userRole = roleData?.find((r) => r.user_id === authUser.id);
        return {
          id: authUser.id,
          email: authUser.email || "No email",
          role: userRole?.role || "utilizator",
          created_at: authUser.created_at,
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t("roleManagement.errors.fetchFailed", "Error loading users"),
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Încărcăm utilizatorii la montarea componentei
  useEffect(() => {
    if (!roleLoading && hasPermission("assign_role")) {
      fetchUsers();
    }
  }, [roleLoading]);

  // Funcție pentru actualizarea rolului unui utilizator
  const updateUserRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      // Verificăm dacă utilizatorul are deja un rol
      const { data, error: checkError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", selectedUser.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 = not found
        throw checkError;
      }

      if (data) {
        // Actualizăm rolul existent
        const { error: updateError } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("user_id", selectedUser.id);

        if (updateError) throw updateError;
      } else {
        // Creăm un nou rol pentru utilizator
        const { error: insertError } = await supabase
          .from("user_roles")
          .insert([{ user_id: selectedUser.id, role: newRole }]);

        if (insertError) throw insertError;
      }

      // Actualizăm lista de utilizatori
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, role: newRole } : u
        )
      );

      toast({
        title: t("roleManagement.roleUpdated", "Role updated"),
        description: t(
          "roleManagement.roleUpdatedDescription",
          "User role has been updated successfully."
        ),
      });

      setIsEditDialogOpen(false);
    } catch (error) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t("roleManagement.errors.updateFailed", "Error updating role"),
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Filtrăm utilizatorii în funcție de termenul de căutare
  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Verificăm dacă utilizatorul are permisiunea de a accesa această pagină
  if (roleLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400">
            {t("common.loading", "Loading...")}
          </p>
        </div>
      </div>
    );
  }

  if (!hasPermission("assign_role")) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="flex-1 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {t("roleManagement.pageTitle", "Role Management")}
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                type="search"
                placeholder={t(
                  "roleManagement.searchPlaceholder",
                  "Search users..."
                )}
                className="pl-8 bg-slate-800 border-slate-700 w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={fetchUsers}>
              {t("roleManagement.refreshButton", "Refresh")}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-slate-700"
            >
              <Users className="h-4 w-4 mr-2" />
              {t("roleManagement.tabs.users", "Users & Roles")}
            </TabsTrigger>
            <TabsTrigger
              value="permissions"
              className="data-[state=active]:bg-slate-700"
            >
              <Shield className="h-4 w-4 mr-2" />
              {t("roleManagement.tabs.permissions", "Role Permissions")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle>
                  {t("roleManagement.usersCard.title", "User Roles")}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {t(
                    "roleManagement.usersCard.description",
                    "Manage user roles and permissions."
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="rounded-md border border-slate-700">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-slate-700/50 bg-slate-800">
                          <TableHead className="w-[300px]">
                            {t("roleManagement.table.email", "Email")}
                          </TableHead>
                          <TableHead>
                            {t("roleManagement.table.role", "Role")}
                          </TableHead>
                          <TableHead>
                            {t("roleManagement.table.created", "Created")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("roleManagement.table.actions", "Actions")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="text-center py-8 text-slate-400"
                            >
                              {searchTerm
                                ? t(
                                    "roleManagement.noSearchResults",
                                    "No users found matching your search."
                                  )
                                : t(
                                    "roleManagement.noUsers",
                                    "No users found."
                                  )}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredUsers.map((user) => (
                            <TableRow
                              key={user.id}
                              className="hover:bg-slate-700/50"
                            >
                              <TableCell className="font-medium">
                                {user.email}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                                    user.role
                                  )}`}
                                >
                                  {user.role}
                                </span>
                              </TableCell>
                              <TableCell>
                                {new Date(user.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setNewRole(user.role);
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="mt-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle>
                  {t(
                    "roleManagement.permissionsCard.title",
                    "Role Permissions"
                  )}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {t(
                    "roleManagement.permissionsCard.description",
                    "View and configure permissions for each role."
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Aici vom adăuga matricea de permisiuni în viitor */}
                  <div className="col-span-1 md:col-span-2 flex items-center justify-center py-8 text-slate-400">
                    {t(
                      "roleManagement.permissionsMatrix.comingSoon",
                      "Permissions matrix coming soon..."
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog pentru editarea rolului */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>
              {t("roleManagement.editDialog.title", "Edit User Role")}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {t(
                "roleManagement.editDialog.description",
                "Change the role for this user."
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="user-email" className="text-slate-400">
                  {t("roleManagement.editDialog.email", "Email")}
                </Label>
                <Input
                  id="user-email"
                  value={selectedUser?.email || ""}
                  readOnly
                  className="bg-slate-700 border-slate-600 mt-1"
                />
              </div>
              <div>
                <Label htmlFor="user-role" className="text-slate-400">
                  {t("roleManagement.editDialog.role", "Role")}
                </Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 mt-1">
                    <SelectValue
                      placeholder={t(
                        "roleManagement.editDialog.selectRole",
                        "Select a role"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                    <SelectItem value="director_general">
                      Director General
                    </SelectItem>
                    <SelectItem value="director_executiv">
                      Director Executiv
                    </SelectItem>
                    <SelectItem value="manager_departament">
                      Manager Departament
                    </SelectItem>
                    <SelectItem value="sef_proiect">Șef Proiect</SelectItem>
                    <SelectItem value="inginer">Inginer</SelectItem>
                    <SelectItem value="tehnician">Tehnician</SelectItem>
                    <SelectItem value="magazioner">Magazioner</SelectItem>
                    <SelectItem value="operator_logistica">
                      Operator Logistică
                    </SelectItem>
                    <SelectItem value="administrator_sistem">
                      Administrator Sistem
                    </SelectItem>
                    <SelectItem value="contabil">Contabil</SelectItem>
                    <SelectItem value="resurse_umane">Resurse Umane</SelectItem>
                    <SelectItem value="asistent_administrativ">
                      Asistent Administrativ
                    </SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="furnizor">Furnizor</SelectItem>
                    <SelectItem value="contractor">Contractor</SelectItem>
                    <SelectItem value="utilizator">Utilizator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button onClick={updateUserRole}>{t("common.save", "Save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Funcție pentru obținerea culorii în funcție de rol
const getRoleColor = (role: string): string => {
  const roleColors: Record<string, string> = {
    ADMIN: "bg-red-600/20 text-red-600 border border-red-600/20",
    director_general:
      "bg-purple-600/20 text-purple-600 border border-purple-600/20",
    director_executiv:
      "bg-purple-500/20 text-purple-500 border border-purple-500/20",
    manager_departament:
      "bg-blue-500/20 text-blue-500 border border-blue-500/20",
    sef_proiect: "bg-blue-400/20 text-blue-400 border border-blue-400/20",
    inginer: "bg-cyan-500/20 text-cyan-500 border border-cyan-500/20",
    tehnician: "bg-teal-500/20 text-teal-500 border border-teal-500/20",
    magazioner: "bg-green-500/20 text-green-500 border border-green-500/20",
    operator_logistica:
      "bg-lime-500/20 text-lime-500 border border-lime-500/20",
    administrator_sistem: "bg-red-500/20 text-red-500 border border-red-500/20",
    contabil: "bg-amber-500/20 text-amber-500 border border-amber-500/20",
    resurse_umane: "bg-pink-500/20 text-pink-500 border border-pink-500/20",
    asistent_administrativ:
      "bg-indigo-500/20 text-indigo-500 border border-indigo-500/20",
    client: "bg-orange-500/20 text-orange-500 border border-orange-500/20",
    furnizor: "bg-yellow-500/20 text-yellow-500 border border-yellow-500/20",
    contractor:
      "bg-emerald-500/20 text-emerald-500 border border-emerald-500/20",
    utilizator: "bg-blue-500/20 text-blue-500 border border-blue-500/20",
    vizitator: "bg-gray-500/20 text-gray-500 border border-gray-500/20",
  };

  return (
    roleColors[role] || "bg-gray-500/20 text-gray-500 border border-gray-500/20"
  );
};

export default RoleManagementPage;
