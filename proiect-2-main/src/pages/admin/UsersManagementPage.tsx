import React, { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { UserRoles } from "@/types/supabase-tables";
import { supabase } from "@/lib/supabase";
import { usersService, UserWithRole } from "@/services/admin/users-service";
import {
  Users,
  Search,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  MoreHorizontal,
  RefreshCw,
  Mail,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";

// Folosim tipul UserWithRole din serviciul de utilizatori

const UsersManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userRole } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [newRole, setNewRole] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Verificăm dacă utilizatorul are rol de admin
  if (userRole !== UserRoles.ADMIN) {
    return <Navigate to="/dashboard" />;
  }

  // Funcție pentru încărcarea utilizatorilor
  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Obținem toți utilizatorii folosind serviciul de utilizatori
      const usersWithRoles = await usersService.getUsers();

      // Transformăm datele în formatul necesar
      const formattedUsers: UserWithRole[] = usersWithRoles.map((user) => ({
        id: user.id,
        email: user.email || "",
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        role: user.role || UserRoles.VIEWER,
        status: user.banned ? "inactive" : user.confirmed_at ? "active" : "pending",
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: t("admin.users.fetchError", "Error fetching users"),
        description: String(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Încărcăm utilizatorii la montarea componentei
  useEffect(() => {
    fetchUsers();
  }, []);

  // Funcție pentru schimbarea rolului unui utilizator
  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    try {
      // Actualizăm rolul utilizatorului folosind serviciul de utilizatori
      await usersService.changeUserRole(selectedUser.id, newRole);

      // Actualizăm lista de utilizatori
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, role: newRole } : u
        )
      );

      toast({
        title: t("admin.users.roleUpdated", "Role updated"),
        description: t("admin.users.roleUpdatedDesc", "User role has been updated successfully"),
      });

      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: t("admin.users.roleUpdateError", "Error updating role"),
        description: String(error),
        variant: "destructive",
      });
    }
  };

  // Funcție pentru ștergerea unui utilizator
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      // Ștergem utilizatorul folosind serviciul de utilizatori
      await usersService.deleteUser(selectedUser.id);

      // Actualizăm lista de utilizatori
      setUsers(users.filter((u) => u.id !== selectedUser.id));

      toast({
        title: t("admin.users.userDeleted", "User deleted"),
        description: t("admin.users.userDeletedDesc", "User has been deleted successfully"),
      });

      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: t("admin.users.userDeleteError", "Error deleting user"),
        description: String(error),
        variant: "destructive",
      });
    }
  };

  // Funcție pentru crearea unui utilizator
  const handleCreateUser = async () => {
    if (!newEmail || !newPassword) return;

    try {
      // Creăm utilizatorul folosind serviciul de utilizatori
      const newUser = await usersService.createUser({
        email: newEmail,
        password: newPassword,
        role: newRole || UserRoles.VIEWER,
      });

      if (newUser) {
        // Adăugăm utilizatorul la listă
        const formattedUser: UserWithRole = {
          id: newUser.id,
          email: newUser.email || "",
          created_at: newUser.created_at,
          last_sign_in_at: null,
          role: newUser.role || UserRoles.VIEWER,
          status: "active",
        };

        setUsers([...users, formattedUser]);

        toast({
          title: t("admin.users.userCreated", "User created"),
          description: t("admin.users.userCreatedDesc", "User has been created successfully"),
        });

        // Resetăm formularul
        setNewEmail("");
        setNewPassword("");
        setNewRole("");
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: t("admin.users.userCreateError", "Error creating user"),
        description: String(error),
        variant: "destructive",
      });
    }
  };

  // Funcție pentru trimiterea unui email de resetare a parolei
  const handleSendPasswordReset = async (userId: string) => {
    try {
      const userToReset = users.find((u) => u.id === userId);
      if (!userToReset) return;

      const { error } = await supabase.auth.resetPasswordForEmail(userToReset.email);

      if (error) throw error;

      toast({
        title: t("admin.users.passwordResetSent", "Password reset email sent"),
        description: t(
          "admin.users.passwordResetSentDesc",
          "A password reset email has been sent to the user"
        ),
      });
    } catch (error) {
      console.error("Error sending password reset:", error);
      toast({
        title: t("admin.users.passwordResetError", "Error sending password reset"),
        description: String(error),
        variant: "destructive",
      });
    }
  };

  // Filtrăm utilizatorii în funcție de termenul de căutare
  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Funcție pentru formatarea datei
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="flex-1 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {t("admin.users.title", "User Management")}
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                type="search"
                placeholder={t("admin.users.searchPlaceholder", "Search users...")}
                className="pl-8 bg-slate-800 border-slate-700 w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={fetchUsers}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("admin.users.refresh", "Refresh")}
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              {t("admin.users.addUser", "Add User")}
            </Button>
          </div>
        </div>

        <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 overflow-hidden relative shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-purple-900/10"></div>
          <CardContent className="p-0 relative z-10">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-slate-400">
                    {t("admin.users.loading", "Loading users...")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-slate-700/50 bg-slate-800">
                      <TableHead className="w-[300px]">
                        {t("admin.users.email", "Email")}
                      </TableHead>
                      <TableHead>{t("admin.users.role", "Role")}</TableHead>
                      <TableHead>{t("admin.users.status", "Status")}</TableHead>
                      <TableHead>{t("admin.users.created", "Created")}</TableHead>
                      <TableHead>{t("admin.users.lastLogin", "Last Login")}</TableHead>
                      <TableHead className="text-right">
                        {t("admin.users.actions", "Actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-slate-400"
                        >
                          {searchTerm
                            ? t(
                                "admin.users.noSearchResults",
                                "No users found matching your search."
                              )
                            : t("admin.users.noUsers", "No users found.")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow
                          key={user.id}
                          className="hover:bg-slate-700/50 border-b border-slate-700/50"
                        >
                          <TableCell className="font-medium text-slate-300">
                            {user.email}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div
                                className={`w-2 h-2 rounded-full mr-2 ${
                                  user.role === UserRoles.ADMIN
                                    ? "bg-purple-500"
                                    : user.role === UserRoles.MANAGER
                                    ? "bg-blue-500"
                                    : "bg-green-500"
                                }`}
                              ></div>
                              <span
                                className={`${
                                  user.role === UserRoles.ADMIN
                                    ? "text-purple-400"
                                    : user.role === UserRoles.MANAGER
                                    ? "text-blue-400"
                                    : "text-green-400"
                                }`}
                              >
                                {user.role}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div
                              className={`px-2 py-1 rounded-full text-xs inline-block ${
                                user.status === "active"
                                  ? "bg-green-500/20 text-green-400"
                                  : user.status === "inactive"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-amber-500/20 text-amber-400"
                              }`}
                            >
                              {user.status}
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-400">
                            {formatDate(user.created_at)}
                          </TableCell>
                          <TableCell className="text-slate-400">
                            {formatDate(user.last_sign_in_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-slate-100"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="bg-slate-800 border-slate-700"
                              >
                                <DropdownMenuLabel className="text-slate-300">
                                  {t("admin.users.actions", "Actions")}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-700" />
                                <DropdownMenuItem
                                  className="text-slate-300 focus:bg-slate-700 focus:text-slate-100 cursor-pointer"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setNewRole(user.role);
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  {t("admin.users.editRole", "Edit Role")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-slate-300 focus:bg-slate-700 focus:text-slate-100 cursor-pointer"
                                  onClick={() => handleSendPasswordReset(user.id)}
                                >
                                  <Mail className="h-4 w-4 mr-2" />
                                  {t("admin.users.resetPassword", "Reset Password")}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-700" />
                                <DropdownMenuItem
                                  className="text-red-400 focus:bg-red-900/20 focus:text-red-300 cursor-pointer"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {t("admin.users.delete", "Delete User")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
      </div>

      {/* Dialog pentru editarea rolului */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {t("admin.users.editRoleTitle", "Edit User Role")}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {t(
                "admin.users.editRoleDesc",
                "Change the role for user: {{email}}",
                { email: selectedUser?.email }
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role">
                {t("admin.users.role", "Role")}
              </Label>
              <Select
                value={newRole}
                onValueChange={setNewRole}
              >
                <SelectTrigger
                  id="role"
                  className="bg-slate-900 border-slate-700 text-white"
                >
                  <SelectValue
                    placeholder={t("admin.users.selectRole", "Select a role")}
                  />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white">
                  <SelectItem value={UserRoles.ADMIN}>
                    {t("admin.users.roleAdmin", "Administrator")}
                  </SelectItem>
                  <SelectItem value={UserRoles.MANAGER}>
                    {t("admin.users.roleManager", "Manager")}
                  </SelectItem>
                  <SelectItem value={UserRoles.TEAM_LEAD}>
                    {t("admin.users.roleTeamLead", "Team Lead")}
                  </SelectItem>
                  <SelectItem value={UserRoles.INVENTORY_MANAGER}>
                    {t("admin.users.roleInventoryManager", "Inventory Manager")}
                  </SelectItem>
                  <SelectItem value={UserRoles.WORKER}>
                    {t("admin.users.roleWorker", "Worker")}
                  </SelectItem>
                  <SelectItem value={UserRoles.VIEWER}>
                    {t("admin.users.roleViewer", "Viewer")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              {t("admin.users.cancel", "Cancel")}
            </Button>
            <Button onClick={handleRoleChange}>
              {t("admin.users.saveChanges", "Save Changes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pentru ștergerea utilizatorului */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {t("admin.users.deleteUserTitle", "Delete User")}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {t(
                "admin.users.deleteUserDesc",
                "Are you sure you want to delete this user? This action cannot be undone."
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-red-400">
              {t(
                "admin.users.deleteUserWarning",
                "You are about to delete the user: {{email}}",
                { email: selectedUser?.email }
              )}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              {t("admin.users.cancel", "Cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
            >
              {t("admin.users.confirmDelete", "Delete User")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pentru crearea unui utilizator */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {t("admin.users.createUserTitle", "Create New User")}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {t(
                "admin.users.createUserDesc",
                "Fill in the details to create a new user account."
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                {t("admin.users.email", "Email")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                {t("admin.users.password", "Password")}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newUserRole">
                {t("admin.users.role", "Role")}
              </Label>
              <Select
                value={newRole}
                onValueChange={setNewRole}
              >
                <SelectTrigger
                  id="newUserRole"
                  className="bg-slate-900 border-slate-700 text-white"
                >
                  <SelectValue
                    placeholder={t("admin.users.selectRole", "Select a role")}
                  />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white">
                  <SelectItem value={UserRoles.ADMIN}>
                    {t("admin.users.roleAdmin", "Administrator")}
                  </SelectItem>
                  <SelectItem value={UserRoles.MANAGER}>
                    {t("admin.users.roleManager", "Manager")}
                  </SelectItem>
                  <SelectItem value={UserRoles.TEAM_LEAD}>
                    {t("admin.users.roleTeamLead", "Team Lead")}
                  </SelectItem>
                  <SelectItem value={UserRoles.INVENTORY_MANAGER}>
                    {t("admin.users.roleInventoryManager", "Inventory Manager")}
                  </SelectItem>
                  <SelectItem value={UserRoles.WORKER}>
                    {t("admin.users.roleWorker", "Worker")}
                  </SelectItem>
                  <SelectItem value={UserRoles.VIEWER}>
                    {t("admin.users.roleViewer", "Viewer")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              {t("admin.users.cancel", "Cancel")}
            </Button>
            <Button onClick={handleCreateUser}>
              {t("admin.users.createUser", "Create User")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagementPage;
