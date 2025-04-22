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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { UserRoles, RolePermissions, ROLE_PERMISSIONS } from "@/types/supabase-tables";
import { supabase } from "@/lib/supabase";
import { rolesService, RoleWithStats } from "@/services/admin/roles-service";
import {
  Shield,
  Search,
  RefreshCw,
  Users,
  Edit,
  Info,
} from "lucide-react";
import { Label } from "@/components/ui/label";

// Folosim tipul RoleWithStats din serviciul de roluri

const RoleManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userRole } = useAuth();
  const [roles, setRoles] = useState<RoleWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleWithStats | null>(null);
  const [editedPermissions, setEditedPermissions] = useState<RolePermissions | null>(null);

  // Verificăm dacă utilizatorul are rol de admin
  if (userRole !== UserRoles.ADMIN) {
    return <Navigate to="/dashboard" />;
  }

  // Funcție pentru încărcarea rolurilor și statisticilor
  const fetchRoles = async () => {
    try {
      setLoading(true);

      // Folosim serviciul de roluri pentru a obține datele reale
      const rolesData = await rolesService.getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast({
        title: t("admin.roles.fetchError", "Error fetching roles"),
        description: String(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Încărcăm rolurile la montarea componentei
  useEffect(() => {
    fetchRoles();
  }, []);

  // Funcție pentru obținerea numelui afișat al rolului
  const getDisplayName = (role: string): string => {
    switch (role) {
      case UserRoles.ADMIN:
        return t("admin.roles.roleAdmin", "Administrator");
      case UserRoles.MANAGER:
        return t("admin.roles.roleManager", "Manager");
      case UserRoles.TEAM_LEAD:
        return t("admin.roles.roleTeamLead", "Team Lead");
      case UserRoles.INVENTORY_MANAGER:
        return t("admin.roles.roleInventoryManager", "Inventory Manager");
      case UserRoles.WORKER:
        return t("admin.roles.roleWorker", "Worker");
      case UserRoles.VIEWER:
        return t("admin.roles.roleViewer", "Viewer");
      default:
        return role;
    }
  };

  // Funcție pentru actualizarea permisiunilor unui rol
  const handleUpdatePermissions = async () => {
    if (!selectedRole || !editedPermissions) return;

    try {
      // Folosim serviciul de roluri pentru a actualiza permisiunile în baza de date
      const updatedRole = await rolesService.updateRolePermissions(
        selectedRole.name,
        editedPermissions
      );

      // Actualizăm lista de roluri
      setRoles(
        roles.map((r) =>
          r.name === selectedRole.name
            ? updatedRole
            : r
        )
      );

      toast({
        title: t("admin.roles.permissionsUpdated", "Permissions updated"),
        description: t(
          "admin.roles.permissionsUpdatedDesc",
          "Role permissions have been updated successfully"
        ),
      });

      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast({
        title: t("admin.roles.permissionsUpdateError", "Error updating permissions"),
        description: String(error),
        variant: "destructive",
      });
    }
  };

  // Funcție pentru deschiderea dialogului de editare a permisiunilor
  const openEditDialog = (role: RoleWithStats) => {
    setSelectedRole(role);
    setEditedPermissions({ ...role.permissions });
    setIsEditDialogOpen(true);
  };

  // Funcție pentru actualizarea unei permisiuni
  const updatePermission = (key: keyof RolePermissions, value: boolean) => {
    if (!editedPermissions) return;

    setEditedPermissions({
      ...editedPermissions,
      [key]: value,
    });
  };

  // Filtrăm rolurile în funcție de termenul de căutare
  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="flex-1 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {t("admin.roles.title", "Role Management")}
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                type="search"
                placeholder={t("admin.roles.searchPlaceholder", "Search roles...")}
                className="pl-8 bg-slate-800 border-slate-700 w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={fetchRoles}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("admin.roles.refresh", "Refresh")}
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
                    {t("admin.roles.loading", "Loading roles...")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-slate-700/50 bg-slate-800">
                      <TableHead className="w-[200px]">
                        {t("admin.roles.role", "Role")}
                      </TableHead>
                      <TableHead>{t("admin.roles.displayName", "Display Name")}</TableHead>
                      <TableHead>{t("admin.roles.userCount", "User Count")}</TableHead>
                      <TableHead>{t("admin.roles.permissions", "Permissions")}</TableHead>
                      <TableHead className="text-right">
                        {t("admin.roles.actions", "Actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-8 text-slate-400"
                        >
                          {searchTerm
                            ? t(
                                "admin.roles.noSearchResults",
                                "No roles found matching your search."
                              )
                            : t("admin.roles.noRoles", "No roles found.")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRoles.map((role) => (
                        <TableRow
                          key={role.name}
                          className="hover:bg-slate-700/50 border-b border-slate-700/50"
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <div
                                className={`w-2 h-2 rounded-full mr-2 ${
                                  role.name === UserRoles.ADMIN
                                    ? "bg-purple-500"
                                    : role.name === UserRoles.MANAGER
                                    ? "bg-blue-500"
                                    : "bg-green-500"
                                }`}
                              ></div>
                              <span
                                className={`${
                                  role.name === UserRoles.ADMIN
                                    ? "text-purple-400"
                                    : role.name === UserRoles.MANAGER
                                    ? "text-blue-400"
                                    : "text-green-400"
                                }`}
                              >
                                {role.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {role.displayName}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2 text-slate-400" />
                              <span className="text-slate-300">{role.userCount}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {role.permissions.canCreateProjects && (
                                <div className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
                                  {t("admin.roles.createProjects", "Create Projects")}
                                </div>
                              )}
                              {role.permissions.canManageUsers && (
                                <div className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400">
                                  {t("admin.roles.manageUsers", "Manage Users")}
                                </div>
                              )}
                              {role.permissions.canManageInventory && (
                                <div className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                                  {t("admin.roles.manageInventory", "Manage Inventory")}
                                </div>
                              )}
                              {Object.values(role.permissions).filter(Boolean).length > 3 && (
                                <div className="px-2 py-1 rounded-full text-xs bg-slate-500/20 text-slate-400">
                                  +{Object.values(role.permissions).filter(Boolean).length - 3}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-slate-400 hover:text-slate-100"
                              onClick={() => openEditDialog(role)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              {t("admin.roles.edit", "Edit")}
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

        <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4 text-slate-300">
          <div className="flex items-start">
            <Info className="h-5 w-5 mr-2 text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-400">
                {t("admin.roles.infoTitle", "About Role Management")}
              </h3>
              <p className="mt-1 text-sm">
                {t(
                  "admin.roles.infoDesc",
                  "Roles define what users can do in the system. Each role has a set of permissions that control access to different features. You can edit the permissions for each role to customize access levels."
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog pentru editarea permisiunilor */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {t("admin.roles.editPermissionsTitle", "Edit Role Permissions")}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {t(
                "admin.roles.editPermissionsDesc",
                "Customize permissions for role: {{role}}",
                { role: selectedRole?.displayName }
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="font-medium text-slate-300 border-b border-slate-700 pb-2">
                  {t("admin.roles.projectPermissions", "Project Permissions")}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canCreateProjects"
                      checked={editedPermissions?.canCreateProjects}
                      onCheckedChange={(checked) =>
                        updatePermission("canCreateProjects", checked === true)
                      }
                    />
                    <Label
                      htmlFor="canCreateProjects"
                      className="text-slate-300 cursor-pointer"
                    >
                      {t("admin.roles.canCreateProjects", "Create Projects")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canEditProjects"
                      checked={editedPermissions?.canEditProjects}
                      onCheckedChange={(checked) =>
                        updatePermission("canEditProjects", checked === true)
                      }
                    />
                    <Label
                      htmlFor="canEditProjects"
                      className="text-slate-300 cursor-pointer"
                    >
                      {t("admin.roles.canEditProjects", "Edit Projects")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canDeleteProjects"
                      checked={editedPermissions?.canDeleteProjects}
                      onCheckedChange={(checked) =>
                        updatePermission("canDeleteProjects", checked === true)
                      }
                    />
                    <Label
                      htmlFor="canDeleteProjects"
                      className="text-slate-300 cursor-pointer"
                    >
                      {t("admin.roles.canDeleteProjects", "Delete Projects")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canViewAllProjects"
                      checked={editedPermissions?.canViewAllProjects}
                      onCheckedChange={(checked) =>
                        updatePermission("canViewAllProjects", checked === true)
                      }
                    />
                    <Label
                      htmlFor="canViewAllProjects"
                      className="text-slate-300 cursor-pointer"
                    >
                      {t("admin.roles.canViewAllProjects", "View All Projects")}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-slate-300 border-b border-slate-700 pb-2">
                  {t("admin.roles.userPermissions", "User Permissions")}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canManageUsers"
                      checked={editedPermissions?.canManageUsers}
                      onCheckedChange={(checked) =>
                        updatePermission("canManageUsers", checked === true)
                      }
                    />
                    <Label
                      htmlFor="canManageUsers"
                      className="text-slate-300 cursor-pointer"
                    >
                      {t("admin.roles.canManageUsers", "Manage Users")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canViewTeams"
                      checked={editedPermissions?.canViewTeams}
                      onCheckedChange={(checked) =>
                        updatePermission("canViewTeams", checked === true)
                      }
                    />
                    <Label
                      htmlFor="canViewTeams"
                      className="text-slate-300 cursor-pointer"
                    >
                      {t("admin.roles.canViewTeams", "View Teams")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canManageTeams"
                      checked={editedPermissions?.canManageTeams}
                      onCheckedChange={(checked) =>
                        updatePermission("canManageTeams", checked === true)
                      }
                    />
                    <Label
                      htmlFor="canManageTeams"
                      className="text-slate-300 cursor-pointer"
                    >
                      {t("admin.roles.canManageTeams", "Manage Teams")}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-slate-300 border-b border-slate-700 pb-2">
                  {t("admin.roles.inventoryPermissions", "Inventory Permissions")}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canManageInventory"
                      checked={editedPermissions?.canManageInventory}
                      onCheckedChange={(checked) =>
                        updatePermission("canManageInventory", checked === true)
                      }
                    />
                    <Label
                      htmlFor="canManageInventory"
                      className="text-slate-300 cursor-pointer"
                    >
                      {t("admin.roles.canManageInventory", "Manage Inventory")}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-slate-300 border-b border-slate-700 pb-2">
                  {t("admin.roles.reportPermissions", "Report Permissions")}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canViewReports"
                      checked={editedPermissions?.canViewReports}
                      onCheckedChange={(checked) =>
                        updatePermission("canViewReports", checked === true)
                      }
                    />
                    <Label
                      htmlFor="canViewReports"
                      className="text-slate-300 cursor-pointer"
                    >
                      {t("admin.roles.canViewReports", "View Reports")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canCreateReports"
                      checked={editedPermissions?.canCreateReports}
                      onCheckedChange={(checked) =>
                        updatePermission("canCreateReports", checked === true)
                      }
                    />
                    <Label
                      htmlFor="canCreateReports"
                      className="text-slate-300 cursor-pointer"
                    >
                      {t("admin.roles.canCreateReports", "Create Reports")}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-slate-300 border-b border-slate-700 pb-2">
                  {t("admin.roles.budgetPermissions", "Budget Permissions")}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canViewBudget"
                      checked={editedPermissions?.canViewBudget}
                      onCheckedChange={(checked) =>
                        updatePermission("canViewBudget", checked === true)
                      }
                    />
                    <Label
                      htmlFor="canViewBudget"
                      className="text-slate-300 cursor-pointer"
                    >
                      {t("admin.roles.canViewBudget", "View Budget")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canManageBudget"
                      checked={editedPermissions?.canManageBudget}
                      onCheckedChange={(checked) =>
                        updatePermission("canManageBudget", checked === true)
                      }
                    />
                    <Label
                      htmlFor="canManageBudget"
                      className="text-slate-300 cursor-pointer"
                    >
                      {t("admin.roles.canManageBudget", "Manage Budget")}
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              {t("admin.roles.cancel", "Cancel")}
            </Button>
            <Button onClick={handleUpdatePermissions}>
              {t("admin.roles.saveChanges", "Save Changes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoleManagementPage;
