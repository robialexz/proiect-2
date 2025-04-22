import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissionCheck } from "@/hooks/usePermissionCheck";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AnimatedContainer, AnimatedText } from "@/components/ui/animated-container";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import {
  Shield,
  Users,
  Settings,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Info,
  ChevronRight,
  Search,
  Filter,
  UserPlus,
  UserMinus,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";

// Definim tipurile pentru permisiuni și roluri
interface Permission {
  id: string;
  name: string;
  description: string;
}

interface RolePermission {
  role: string;
  permissionId: string;
}

interface Role {
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
}

const RolePermissionsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { canAccess } = usePermissionCheck();
  const { toast } = useToast();

  // Verificăm dacă utilizatorul are acces la această pagină
  const hasAccess = canAccess(["admin"], ["manage_roles"]);

  // State pentru permisiuni și roluri
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("roles");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Simulăm încărcarea datelor
  useEffect(() => {
    // În implementarea reală, aici ar trebui să facem un apel către API pentru a obține permisiunile și rolurile
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Simulăm un delay pentru a arăta loading state
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Permisiuni simulate
        const mockPermissions: Permission[] = [
          { id: "view_dashboard", name: "view_dashboard", description: "Poate vizualiza dashboard-ul" },
          { id: "view_projects", name: "view_projects", description: "Poate vizualiza proiectele" },
          { id: "create_project", name: "create_project", description: "Poate crea proiecte noi" },
          { id: "edit_project", name: "edit_project", description: "Poate edita proiecte existente" },
          { id: "delete_project", name: "delete_project", description: "Poate șterge proiecte" },
          { id: "view_inventory", name: "view_inventory", description: "Poate vizualiza inventarul" },
          { id: "manage_inventory", name: "manage_inventory", description: "Poate gestiona inventarul" },
          { id: "view_suppliers", name: "view_suppliers", description: "Poate vizualiza furnizorii" },
          { id: "manage_suppliers", name: "manage_suppliers", description: "Poate gestiona furnizorii" },
          { id: "view_teams", name: "view_teams", description: "Poate vizualiza echipele" },
          { id: "manage_teams", name: "manage_teams", description: "Poate gestiona echipele" },
          { id: "view_reports", name: "view_reports", description: "Poate vizualiza rapoartele" },
          { id: "generate_reports", name: "generate_reports", description: "Poate genera rapoarte noi" },
          { id: "view_settings", name: "view_settings", description: "Poate vizualiza setările" },
          { id: "manage_settings", name: "manage_settings", description: "Poate gestiona setările" },
          { id: "view_users", name: "view_users", description: "Poate vizualiza utilizatorii" },
          { id: "manage_users", name: "manage_users", description: "Poate gestiona utilizatorii" },
          { id: "manage_roles", name: "manage_roles", description: "Poate gestiona rolurile și permisiunile" },
          { id: "view_audit_logs", name: "view_audit_logs", description: "Poate vizualiza jurnalele de audit" },
          { id: "use_inventory_optimizer", name: "use_inventory_optimizer", description: "Poate folosi optimizatorul de inventar" },
          { id: "use_inventory_button_fixer", name: "use_inventory_button_fixer", description: "Poate folosi reparatorul de butoane" },
        ];
        
        // Roluri simulate
        const mockRoles: Role[] = [
          {
            name: "admin",
            displayName: "Administrator",
            description: "Acces complet la toate funcționalitățile",
            permissions: mockPermissions.map(p => p.id),
          },
          {
            name: "manager",
            displayName: "Manager",
            description: "Acces la majoritatea funcționalităților, fără administrare",
            permissions: [
              "view_dashboard", "view_projects", "create_project", "edit_project",
              "view_inventory", "manage_inventory", "view_suppliers", "manage_suppliers",
              "view_teams", "manage_teams", "view_reports", "generate_reports",
              "view_settings", "view_users", "use_inventory_optimizer", "use_inventory_button_fixer"
            ],
          },
          {
            name: "user",
            displayName: "Utilizator",
            description: "Acces la funcționalitățile de bază",
            permissions: [
              "view_dashboard", "view_projects", "view_inventory",
              "view_suppliers", "view_teams", "view_reports",
              "use_inventory_optimizer"
            ],
          },
          {
            name: "viewer",
            displayName: "Vizitator",
            description: "Acces doar pentru vizualizare",
            permissions: [
              "view_dashboard", "view_projects", "view_inventory",
              "view_suppliers", "view_teams", "view_reports"
            ],
          },
        ];
        
        // Relații între roluri și permisiuni
        const mockRolePermissions: RolePermission[] = [];
        mockRoles.forEach(role => {
          role.permissions.forEach(permissionId => {
            mockRolePermissions.push({
              role: role.name,
              permissionId,
            });
          });
        });
        
        setPermissions(mockPermissions);
        setRoles(mockRoles);
        setRolePermissions(mockRolePermissions);
        setSelectedRole(mockRoles[0].name);
      } catch (error) {
        console.error("Eroare la încărcarea datelor:", error);
        toast({
          title: "Eroare",
          description: "Nu s-au putut încărca datele. Încercați din nou mai târziu.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  // Funcție pentru a salva modificările
  const saveChanges = async () => {
    setSaving(true);
    
    try {
      // Simulăm un delay pentru a arăta saving state
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // În implementarea reală, aici ar trebui să facem un apel către API pentru a salva modificările
      
      toast({
        title: "Succes",
        description: "Modificările au fost salvate cu succes.",
        variant: "default",
      });
    } catch (error) {
      console.error("Eroare la salvarea datelor:", error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut salva modificările. Încercați din nou mai târziu.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Funcție pentru a verifica dacă un rol are o anumită permisiune
  const hasPermission = (role: string, permissionId: string): boolean => {
    return rolePermissions.some(rp => rp.role === role && rp.permissionId === permissionId);
  };

  // Funcție pentru a actualiza permisiunile unui rol
  const togglePermission = (role: string, permissionId: string) => {
    if (hasPermission(role, permissionId)) {
      // Eliminăm permisiunea
      setRolePermissions(prev => prev.filter(rp => !(rp.role === role && rp.permissionId === permissionId)));
    } else {
      // Adăugăm permisiunea
      setRolePermissions(prev => [...prev, { role, permissionId }]);
    }
  };

  // Filtrăm permisiunile în funcție de căutare
  const filteredPermissions = searchQuery
    ? permissions.filter(
        p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : permissions;

  // Dacă utilizatorul nu are acces, îl redirecționăm către pagina de acces interzis
  if (!hasAccess) {
    navigate("/access-denied");
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{t("rolePermissions.pageTitle", "Administrare roluri și permisiuni")}</title>
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        <AnimatedContainer animation="slideUp">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <AnimatedText 
                text={t("rolePermissions.pageTitle", "Administrare roluri și permisiuni")}
                tag="h1"
                className="text-3xl font-bold tracking-tight"
              />
              <p className="text-muted-foreground">
                {t("rolePermissions.pageSubtitle", "Gestionează rolurile și permisiunile utilizatorilor")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={saving} onClick={() => window.location.reload()}>
                <RefreshCw className={cn("h-4 w-4 mr-2", saving && "animate-spin")} />
                {t("rolePermissions.refresh", "Reîmprospătează")}
              </Button>
              <Button disabled={saving} onClick={saveChanges}>
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {t("rolePermissions.saving", "Se salvează...")}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t("rolePermissions.save", "Salvează modificările")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </AnimatedContainer>

        <Separator />

        <Tabs defaultValue="roles" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-[400px]">
            <TabsTrigger value="roles">
              <Users className="h-4 w-4 mr-2" />
              {t("rolePermissions.tabs.roles", "Roluri")}
            </TabsTrigger>
            <TabsTrigger value="permissions">
              <Shield className="h-4 w-4 mr-2" />
              {t("rolePermissions.tabs.permissions", "Permisiuni")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="mt-6">
            <AnimatedContainer animation="fade">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Lista de roluri */}
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Users className="h-5 w-5 mr-2 text-primary" />
                      {t("rolePermissions.rolesList", "Lista rolurilor")}
                    </CardTitle>
                    <CardDescription>
                      {t("rolePermissions.rolesDescription", "Selectează un rol pentru a vedea și edita permisiunile sale")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {roles.map(role => (
                          <Button
                            key={role.name}
                            variant={selectedRole === role.name ? "default" : "outline"}
                            className="w-full justify-start"
                            onClick={() => setSelectedRole(role.name)}
                          >
                            {role.name === "admin" && <ShieldAlert className="h-4 w-4 mr-2" />}
                            {role.name === "manager" && <ShieldCheck className="h-4 w-4 mr-2" />}
                            {role.name === "user" && <Users className="h-4 w-4 mr-2" />}
                            {role.name === "viewer" && <ShieldQuestion className="h-4 w-4 mr-2" />}
                            {role.displayName}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Detalii rol și permisiuni */}
                <Card className="md:col-span-3">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center">
                          <Shield className="h-5 w-5 mr-2 text-primary" />
                          {selectedRole && roles.find(r => r.name === selectedRole)?.displayName}
                        </CardTitle>
                        <CardDescription>
                          {selectedRole && roles.find(r => r.name === selectedRole)?.description}
                        </CardDescription>
                      </div>
                      {selectedRole && (
                        <Badge variant="outline" className={
                          selectedRole === "admin" 
                            ? "bg-red-100 text-red-800 border-red-200" 
                            : selectedRole === "manager"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : selectedRole === "user"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-gray-100 text-gray-800 border-gray-200"
                        }>
                          {selectedRole}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : selectedRole ? (
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                          <Input
                            placeholder={t("rolePermissions.searchPermissions", "Caută permisiuni...")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="max-w-sm"
                          />
                        </div>

                        <ScrollArea className="h-[400px] pr-4">
                          <div className="space-y-4">
                            {filteredPermissions.map(permission => (
                              <div
                                key={permission.id}
                                className="flex items-start justify-between p-3 border rounded-md hover:bg-accent/50 transition-colors"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center">
                                    <h4 className="font-medium">{permission.name}</h4>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {permission.description}
                                  </p>
                                </div>
                                <div className="ml-4">
                                  <Switch
                                    checked={hasPermission(selectedRole, permission.id)}
                                    onCheckedChange={() => togglePermission(selectedRole, permission.id)}
                                    disabled={selectedRole === "admin"} // Administratorul are întotdeauna toate permisiunile
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Info className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {t("rolePermissions.selectRole", "Selectează un rol din lista din stânga")}
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    {selectedRole === "admin" && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>
                          {t("rolePermissions.adminAlert", "Rol de administrator")}
                        </AlertTitle>
                        <AlertDescription>
                          {t(
                            "rolePermissions.adminAlertDescription",
                            "Rolul de administrator are întotdeauna toate permisiunile și nu poate fi modificat."
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardFooter>
                </Card>
              </div>
            </AnimatedContainer>
          </TabsContent>

          <TabsContent value="permissions" className="mt-6">
            <AnimatedContainer animation="fade">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-primary" />
                    {t("rolePermissions.permissionsList", "Lista permisiunilor")}
                  </CardTitle>
                  <CardDescription>
                    {t("rolePermissions.permissionsDescription", "Vizualizează toate permisiunile disponibile în sistem")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                        <Input
                          placeholder={t("rolePermissions.searchPermissions", "Caută permisiuni...")}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="max-w-sm"
                        />
                      </div>

                      <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-4">
                          {filteredPermissions.map(permission => (
                            <Card key={permission.id}>
                              <CardHeader className="py-3">
                                <CardTitle className="text-base flex items-center">
                                  <Lock className="h-4 w-4 mr-2 text-primary" />
                                  {permission.name}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="py-2">
                                <p className="text-sm text-muted-foreground">
                                  {permission.description}
                                </p>
                              </CardContent>
                              <CardFooter className="py-3 border-t flex justify-between">
                                <div className="flex flex-wrap gap-2">
                                  {roles.filter(role => hasPermission(role.name, permission.id)).map(role => (
                                    <Badge key={role.name} variant="outline" className={
                                      role.name === "admin" 
                                        ? "bg-red-100 text-red-800 border-red-200" 
                                        : role.name === "manager"
                                        ? "bg-blue-100 text-blue-800 border-blue-200"
                                        : role.name === "user"
                                        ? "bg-green-100 text-green-800 border-green-200"
                                        : "bg-gray-100 text-gray-800 border-gray-200"
                                    }>
                                      {role.displayName}
                                    </Badge>
                                  ))}
                                </div>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedContainer>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default RolePermissionsPage;
