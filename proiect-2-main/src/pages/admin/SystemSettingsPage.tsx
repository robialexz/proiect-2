import React, { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { UserRoles } from "@/types/supabase-tables";
import { supabase } from "@/lib/supabase";
import {
  Settings,
  Save,
  Shield,
  Mail,
  Database,
  Server,
  Lock,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Tipul pentru setările sistemului
interface SystemSettings {
  security: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      maxAge: number;
    };
    sessionTimeout: number;
    maxLoginAttempts: number;
    accountLockDuration: number;
    twoFactorAuth: {
      enabled: boolean;
      required: boolean;
    };
  };
  email: {
    sender: string;
    enableWelcomeEmail: boolean;
    enablePasswordResetEmail: boolean;
    enableNotificationEmails: boolean;
  };
  maintenance: {
    enabled: boolean;
    message: string;
  };
  backup: {
    autoBackup: boolean;
    backupFrequency: number;
    retentionDays: number;
  };
}

const SystemSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userRole } = useAuth();
  const [settings, setSettings] = useState<SystemSettings>({
    security: {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90,
      },
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      accountLockDuration: 15,
      twoFactorAuth: {
        enabled: false,
        required: false,
      },
    },
    email: {
      sender: "noreply@example.com",
      enableWelcomeEmail: true,
      enablePasswordResetEmail: true,
      enableNotificationEmails: true,
    },
    maintenance: {
      enabled: false,
      message: "The system is currently under maintenance. Please try again later.",
    },
    backup: {
      autoBackup: true,
      backupFrequency: 24,
      retentionDays: 30,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Verificăm dacă utilizatorul are rol de admin
  if (userRole !== UserRoles.ADMIN) {
    return <Navigate to="/dashboard" />;
  }

  // Funcție pentru încărcarea setărilor
  const fetchSettings = async () => {
    try {
      setLoading(true);

      // În implementarea reală, aici ar trebui să încărcăm setările din baza de date
      // Pentru moment, folosim setările implicite definite mai sus

      // Simulăm un delay pentru a arăta loading state
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Setările sunt deja inițializate în state
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: t("admin.settings.fetchError", "Error fetching settings"),
        description: String(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Încărcăm setările la montarea componentei
  useEffect(() => {
    fetchSettings();
  }, []);

  // Funcție pentru salvarea setărilor
  const saveSettings = async () => {
    try {
      setSaving(true);

      // În implementarea reală, aici ar trebui să salvăm setările în baza de date
      // Pentru moment, doar simulăm salvarea

      // Simulăm un delay pentru a arăta saving state
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: t("admin.settings.saveSuccess", "Settings saved"),
        description: t(
          "admin.settings.saveSuccessDesc",
          "System settings have been saved successfully"
        ),
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: t("admin.settings.saveError", "Error saving settings"),
        description: String(error),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Funcție pentru actualizarea setărilor
  const updateSettings = (path: string, value: any) => {
    const pathParts = path.split(".");
    setSettings((prevSettings) => {
      const newSettings = { ...prevSettings };
      let current: any = newSettings;
      
      // Navigăm prin obiect până la penultima proprietate
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      
      // Setăm valoarea pentru ultima proprietate
      current[pathParts[pathParts.length - 1]] = value;
      
      return newSettings;
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="flex-1 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {t("admin.settings.title", "System Settings")}
          </h1>
          <Button
            onClick={saveSettings}
            disabled={saving}
            className="relative"
          >
            {saving ? (
              <>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
                <span className="opacity-0">
                  {t("admin.settings.save", "Save Settings")}
                </span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t("admin.settings.save", "Save Settings")}
              </>
            )}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-400">
                {t("admin.settings.loading", "Loading settings...")}
              </p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="security" className="space-y-6">
            <TabsList className="bg-slate-800 border border-slate-700">
              <TabsTrigger value="security" className="data-[state=active]:bg-slate-700">
                <Shield className="h-4 w-4 mr-2" />
                {t("admin.settings.security", "Security")}
              </TabsTrigger>
              <TabsTrigger value="email" className="data-[state=active]:bg-slate-700">
                <Mail className="h-4 w-4 mr-2" />
                {t("admin.settings.email", "Email")}
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="data-[state=active]:bg-slate-700">
                <Server className="h-4 w-4 mr-2" />
                {t("admin.settings.maintenance", "Maintenance")}
              </TabsTrigger>
              <TabsTrigger value="backup" className="data-[state=active]:bg-slate-700">
                <Database className="h-4 w-4 mr-2" />
                {t("admin.settings.backup", "Backup")}
              </TabsTrigger>
            </TabsList>

            {/* Setări de securitate */}
            <TabsContent value="security" className="space-y-6">
              <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 overflow-hidden relative shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-purple-900/10"></div>
                <CardHeader className="relative z-10 border-b border-slate-700/50">
                  <CardTitle className="flex items-center">
                    <Lock className="h-5 w-5 mr-2 text-blue-400" />
                    <span className="text-slate-300">
                      {t("admin.settings.passwordPolicy", "Password Policy")}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="minLength" className="text-slate-400">
                        {t("admin.settings.minLength", "Minimum Length")}
                      </Label>
                      <Input
                        id="minLength"
                        type="number"
                        min="6"
                        max="32"
                        className="bg-slate-900 border-slate-700 text-white"
                        value={settings.security.passwordPolicy.minLength}
                        onChange={(e) =>
                          updateSettings(
                            "security.passwordPolicy.minLength",
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxAge" className="text-slate-400">
                        {t("admin.settings.maxAge", "Maximum Age (days)")}
                      </Label>
                      <Input
                        id="maxAge"
                        type="number"
                        min="0"
                        max="365"
                        className="bg-slate-900 border-slate-700 text-white"
                        value={settings.security.passwordPolicy.maxAge}
                        onChange={(e) =>
                          updateSettings(
                            "security.passwordPolicy.maxAge",
                            parseInt(e.target.value)
                          )
                        }
                      />
                      <p className="text-xs text-slate-500">
                        {t(
                          "admin.settings.maxAgeHint",
                          "Set to 0 to disable password expiration"
                        )}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireUppercase" className="text-slate-400">
                        {t("admin.settings.requireUppercase", "Require Uppercase")}
                      </Label>
                      <Switch
                        id="requireUppercase"
                        checked={settings.security.passwordPolicy.requireUppercase}
                        onCheckedChange={(checked) =>
                          updateSettings(
                            "security.passwordPolicy.requireUppercase",
                            checked
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireLowercase" className="text-slate-400">
                        {t("admin.settings.requireLowercase", "Require Lowercase")}
                      </Label>
                      <Switch
                        id="requireLowercase"
                        checked={settings.security.passwordPolicy.requireLowercase}
                        onCheckedChange={(checked) =>
                          updateSettings(
                            "security.passwordPolicy.requireLowercase",
                            checked
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireNumbers" className="text-slate-400">
                        {t("admin.settings.requireNumbers", "Require Numbers")}
                      </Label>
                      <Switch
                        id="requireNumbers"
                        checked={settings.security.passwordPolicy.requireNumbers}
                        onCheckedChange={(checked) =>
                          updateSettings(
                            "security.passwordPolicy.requireNumbers",
                            checked
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireSpecialChars" className="text-slate-400">
                        {t(
                          "admin.settings.requireSpecialChars",
                          "Require Special Characters"
                        )}
                      </Label>
                      <Switch
                        id="requireSpecialChars"
                        checked={settings.security.passwordPolicy.requireSpecialChars}
                        onCheckedChange={(checked) =>
                          updateSettings(
                            "security.passwordPolicy.requireSpecialChars",
                            checked
                          )
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 overflow-hidden relative shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-purple-900/10"></div>
                <CardHeader className="relative z-10 border-b border-slate-700/50">
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-purple-400" />
                    <span className="text-slate-300">
                      {t("admin.settings.accountSecurity", "Account Security")}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout" className="text-slate-400">
                        {t("admin.settings.sessionTimeout", "Session Timeout (minutes)")}
                      </Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        min="5"
                        max="1440"
                        className="bg-slate-900 border-slate-700 text-white"
                        value={settings.security.sessionTimeout}
                        onChange={(e) =>
                          updateSettings(
                            "security.sessionTimeout",
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxLoginAttempts" className="text-slate-400">
                        {t("admin.settings.maxLoginAttempts", "Max Login Attempts")}
                      </Label>
                      <Input
                        id="maxLoginAttempts"
                        type="number"
                        min="3"
                        max="10"
                        className="bg-slate-900 border-slate-700 text-white"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) =>
                          updateSettings(
                            "security.maxLoginAttempts",
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountLockDuration" className="text-slate-400">
                        {t(
                          "admin.settings.accountLockDuration",
                          "Account Lock Duration (minutes)"
                        )}
                      </Label>
                      <Input
                        id="accountLockDuration"
                        type="number"
                        min="5"
                        max="1440"
                        className="bg-slate-900 border-slate-700 text-white"
                        value={settings.security.accountLockDuration}
                        onChange={(e) =>
                          updateSettings(
                            "security.accountLockDuration",
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="twoFactorEnabled" className="text-slate-400">
                          {t("admin.settings.twoFactorEnabled", "Enable Two-Factor Auth")}
                        </Label>
                        <Switch
                          id="twoFactorEnabled"
                          checked={settings.security.twoFactorAuth.enabled}
                          onCheckedChange={(checked) =>
                            updateSettings("security.twoFactorAuth.enabled", checked)
                          }
                        />
                      </div>
                      {settings.security.twoFactorAuth.enabled && (
                        <div className="flex items-center justify-between">
                          <Label htmlFor="twoFactorRequired" className="text-slate-400">
                            {t(
                              "admin.settings.twoFactorRequired",
                              "Require Two-Factor Auth"
                            )}
                          </Label>
                          <Switch
                            id="twoFactorRequired"
                            checked={settings.security.twoFactorAuth.required}
                            onCheckedChange={(checked) =>
                              updateSettings("security.twoFactorAuth.required", checked)
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Setări de email */}
            <TabsContent value="email" className="space-y-6">
              <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 overflow-hidden relative shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-purple-900/10"></div>
                <CardHeader className="relative z-10 border-b border-slate-700/50">
                  <CardTitle className="flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-blue-400" />
                    <span className="text-slate-300">
                      {t("admin.settings.emailSettings", "Email Settings")}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 pt-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="sender" className="text-slate-400">
                        {t("admin.settings.senderEmail", "Sender Email")}
                      </Label>
                      <Input
                        id="sender"
                        type="email"
                        className="bg-slate-900 border-slate-700 text-white"
                        value={settings.email.sender}
                        onChange={(e) =>
                          updateSettings("email.sender", e.target.value)
                        }
                      />
                    </div>
                    <Separator className="bg-slate-700" />
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-slate-300">
                        {t("admin.settings.emailNotifications", "Email Notifications")}
                      </h3>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enableWelcomeEmail" className="text-slate-400">
                          {t("admin.settings.enableWelcomeEmail", "Welcome Email")}
                        </Label>
                        <Switch
                          id="enableWelcomeEmail"
                          checked={settings.email.enableWelcomeEmail}
                          onCheckedChange={(checked) =>
                            updateSettings("email.enableWelcomeEmail", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="enablePasswordResetEmail"
                          className="text-slate-400"
                        >
                          {t(
                            "admin.settings.enablePasswordResetEmail",
                            "Password Reset Email"
                          )}
                        </Label>
                        <Switch
                          id="enablePasswordResetEmail"
                          checked={settings.email.enablePasswordResetEmail}
                          onCheckedChange={(checked) =>
                            updateSettings("email.enablePasswordResetEmail", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="enableNotificationEmails"
                          className="text-slate-400"
                        >
                          {t(
                            "admin.settings.enableNotificationEmails",
                            "Notification Emails"
                          )}
                        </Label>
                        <Switch
                          id="enableNotificationEmails"
                          checked={settings.email.enableNotificationEmails}
                          onCheckedChange={(checked) =>
                            updateSettings("email.enableNotificationEmails", checked)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Setări de mentenanță */}
            <TabsContent value="maintenance" className="space-y-6">
              <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 overflow-hidden relative shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-purple-900/10"></div>
                <CardHeader className="relative z-10 border-b border-slate-700/50">
                  <CardTitle className="flex items-center">
                    <Server className="h-5 w-5 mr-2 text-amber-400" />
                    <span className="text-slate-300">
                      {t("admin.settings.maintenanceMode", "Maintenance Mode")}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 pt-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="maintenanceEnabled" className="text-slate-300">
                          {t("admin.settings.enableMaintenance", "Enable Maintenance Mode")}
                        </Label>
                        <p className="text-sm text-slate-500 mt-1">
                          {t(
                            "admin.settings.maintenanceDesc",
                            "When enabled, only administrators can access the system"
                          )}
                        </p>
                      </div>
                      <Switch
                        id="maintenanceEnabled"
                        checked={settings.maintenance.enabled}
                        onCheckedChange={(checked) =>
                          updateSettings("maintenance.enabled", checked)
                        }
                      />
                    </div>
                    {settings.maintenance.enabled && (
                      <div className="space-y-2">
                        <Label htmlFor="maintenanceMessage" className="text-slate-400">
                          {t("admin.settings.maintenanceMessage", "Maintenance Message")}
                        </Label>
                        <Input
                          id="maintenanceMessage"
                          className="bg-slate-900 border-slate-700 text-white"
                          value={settings.maintenance.message}
                          onChange={(e) =>
                            updateSettings("maintenance.message", e.target.value)
                          }
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="bg-amber-900/20 border border-amber-500/20 rounded-lg p-4 text-slate-300">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-amber-400">
                      {t("admin.settings.maintenanceWarning", "Warning")}
                    </h3>
                    <p className="mt-1 text-sm">
                      {t(
                        "admin.settings.maintenanceWarningDesc",
                        "Enabling maintenance mode will prevent non-admin users from accessing the system. Make sure to plan maintenance windows accordingly."
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Setări de backup */}
            <TabsContent value="backup" className="space-y-6">
              <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 overflow-hidden relative shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-purple-900/10"></div>
                <CardHeader className="relative z-10 border-b border-slate-700/50">
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2 text-green-400" />
                    <span className="text-slate-300">
                      {t("admin.settings.backupSettings", "Backup Settings")}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 pt-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoBackup" className="text-slate-300">
                          {t("admin.settings.autoBackup", "Automatic Backup")}
                        </Label>
                        <p className="text-sm text-slate-500 mt-1">
                          {t(
                            "admin.settings.autoBackupDesc",
                            "Automatically backup the database on a schedule"
                          )}
                        </p>
                      </div>
                      <Switch
                        id="autoBackup"
                        checked={settings.backup.autoBackup}
                        onCheckedChange={(checked) =>
                          updateSettings("backup.autoBackup", checked)
                        }
                      />
                    </div>
                    {settings.backup.autoBackup && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="backupFrequency" className="text-slate-400">
                            {t(
                              "admin.settings.backupFrequency",
                              "Backup Frequency (hours)"
                            )}
                          </Label>
                          <Input
                            id="backupFrequency"
                            type="number"
                            min="1"
                            max="168"
                            className="bg-slate-900 border-slate-700 text-white"
                            value={settings.backup.backupFrequency}
                            onChange={(e) =>
                              updateSettings(
                                "backup.backupFrequency",
                                parseInt(e.target.value)
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="retentionDays" className="text-slate-400">
                            {t("admin.settings.retentionDays", "Retention Period (days)")}
                          </Label>
                          <Input
                            id="retentionDays"
                            type="number"
                            min="1"
                            max="365"
                            className="bg-slate-900 border-slate-700 text-white"
                            value={settings.backup.retentionDays}
                            onChange={(e) =>
                              updateSettings(
                                "backup.retentionDays",
                                parseInt(e.target.value)
                              )
                            }
                          />
                        </div>
                      </>
                    )}
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                      >
                        <Database className="h-4 w-4 mr-2" />
                        {t("admin.settings.manualBackup", "Create Manual Backup")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4 text-slate-300">
                <div className="flex items-start">
                  <Info className="h-5 w-5 mr-2 text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-400">
                      {t("admin.settings.backupInfo", "About Backups")}
                    </h3>
                    <p className="mt-1 text-sm">
                      {t(
                        "admin.settings.backupInfoDesc",
                        "Regular backups are essential for data protection. We recommend setting up automatic backups and periodically testing the restoration process."
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default SystemSettingsPage;
