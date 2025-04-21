import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNotification } from "@/components/ui/notification";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Settings,
  Bell,
  Shield,
  Palette,
  Globe,
  Moon,
  Sun,
  Monitor,
  Save,
  RefreshCw,
} from "lucide-react";

const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, userProfile, updateUserProfile } = useAuth();
  const { userRole, canAccessModule } = useRole();
  const { theme, setTheme } = useTheme();
  const { addNotification } = useNotification();

  // State for user settings
  const [displayName, setDisplayName] = useState(
    userProfile?.displayName || user?.email?.split("@")[0] || ""
  );
  const [email, setEmail] = useState(userProfile?.email || user?.email || "");
  const [language, setLanguage] = useState(i18n.language);
  const [selectedTheme, setSelectedTheme] = useState<
    "light" | "dark" | "system"
  >(theme as "light" | "dark" | "system");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  // State for saving status
  const [isSaving, setIsSaving] = useState(false);

  // Handle saving profile settings
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Verificăm dacă numele de afișare s-a schimbat
      const hasChanges =
        displayName !== userProfile?.displayName ||
        email !== userProfile?.email;

      if (hasChanges) {
        // In a real app, you would update the profile in the database
        // For now, we'll just simulate a delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Update the profile in the context
        if (updateUserProfile) {
          await updateUserProfile({
            displayName,
            email,
          });
        }

        addNotification({
          type: "success",
          title: t("settings.profileSaved"),
          message: t("settings.profileSavedMessage"),
          duration: 3000,
        });
      } else {
        // Dacă nu s-a schimbat nimic, afișăm un mesaj informativ
        addNotification({
          type: "info",
          title: "Nicio modificare",
          message: "Nu au fost detectate modificări în profil.",
          duration: 3000,
        });
      }
    } catch (error) {
      // Removed console statement
      addNotification({
        type: "error",
        title: t("settings.error"),
        message: t("settings.errorSavingProfile"),
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle saving appearance settings
  const handleSaveAppearance = () => {
    setIsSaving(true);
    try {
      // Update the theme
      setTheme(selectedTheme);

      // Update the language
      i18n.changeLanguage(language);

      addNotification({
        type: "success",
        title: t("settings.appearanceSaved"),
        message: t("settings.appearanceSavedMessage"),
        duration: 3000,
      });
    } catch (error) {
      // Removed console statement
      addNotification({
        type: "error",
        title: t("settings.error"),
        message: t("settings.errorSavingAppearance"),
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle saving notification settings
  const handleSaveNotifications = () => {
    setIsSaving(true);
    try {
      // In a real app, you would save these settings to the database
      // For now, we'll just simulate a delay
      setTimeout(() => {
        addNotification({
          type: "success",
          title: t("settings.notificationsSaved"),
          message: t("settings.notificationsSavedMessage"),
          duration: 3000,
        });
        setIsSaving(false);
      }, 1000);
    } catch (error) {
      // Removed console statement
      addNotification({
        type: "error",
        title: t("settings.error"),
        message: t("settings.errorSavingNotifications"),
        duration: 5000,
      });
      setIsSaving(false);
    }
  };

  // Setăm titlul paginii folosind useEffect în loc de Helmet
  useEffect(() => {
    document.title = `${t("settings.pageTitle")} | App`;
  }, [t]);

  return (
    <>
      <div className="container mx-auto py-6 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{t("settings.title")}</h1>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {t("settings.profile")}
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              {t("settings.appearance")}
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              {t("settings.notifications")}
            </TabsTrigger>
            {canAccessModule("settings") && (
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t("settings.advanced")}
              </TabsTrigger>
            )}
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.profileSettings")}</CardTitle>
                <CardDescription>
                  {t("settings.profileDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">
                    {t("settings.displayName")}
                  </Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={t("settings.enterName")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("settings.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("settings.enterEmail")}
                    disabled={!canAccessModule("settings")}
                  />
                  {!canAccessModule("settings") && (
                    <p className="text-sm text-muted-foreground">
                      {t("settings.emailChangeRestricted")}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t("settings.role")}</Label>
                  <div className="p-2 bg-slate-800 rounded-md">
                    <p className="text-sm font-medium">
                      {t(`roles.${userRole}`)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("settings.roleDescription")}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">{t("common.cancel")}</Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {t("common.save")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.appearanceSettings")}</CardTitle>
                <CardDescription>
                  {t("settings.appearanceDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{t("settings.theme")}</h3>
                  <RadioGroup
                    value={selectedTheme}
                    onValueChange={(value) =>
                      setSelectedTheme(value as "light" | "dark" | "system")
                    }
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="light" />
                      <Label
                        htmlFor="light"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Sun className="h-4 w-4" />
                        {t("settings.lightTheme")}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="dark" />
                      <Label
                        htmlFor="dark"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Moon className="h-4 w-4" />
                        {t("settings.darkTheme")}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="system" id="system" />
                      <Label
                        htmlFor="system"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Monitor className="h-4 w-4" />
                        {t("settings.systemTheme")}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    {t("settings.language")}
                  </h3>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("settings.selectLanguage")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">
                        <div className="flex items-center gap-2">
                          <span className="fi fi-gb"></span>
                          {t("languages.en")}
                        </div>
                      </SelectItem>
                      <SelectItem value="ro">
                        <div className="flex items-center gap-2">
                          <span className="fi fi-ro"></span>
                          {t("languages.ro")}
                        </div>
                      </SelectItem>
                      <SelectItem value="fr">
                        <div className="flex items-center gap-2">
                          <span className="fi fi-fr"></span>
                          {t("languages.fr")}
                        </div>
                      </SelectItem>
                      <SelectItem value="de">
                        <div className="flex items-center gap-2">
                          <span className="fi fi-de"></span>
                          {t("languages.de")}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">{t("common.cancel")}</Button>
                <Button
                  onClick={handleSaveAppearance}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {t("common.save")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.notificationSettings")}</CardTitle>
                <CardDescription>
                  {t("settings.notificationDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">
                        {t("settings.enableNotifications")}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t("settings.enableNotificationsDescription")}
                      </p>
                    </div>
                    <Switch
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">
                        {t("settings.emailNotifications")}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t("settings.emailNotificationsDescription")}
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                      disabled={!notificationsEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">
                        {t("settings.pushNotifications")}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t("settings.pushNotificationsDescription")}
                      </p>
                    </div>
                    <Switch
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                      disabled={!notificationsEnabled}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">{t("common.cancel")}</Button>
                <Button
                  onClick={handleSaveNotifications}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {t("common.save")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Advanced Settings - Only for admins */}
          {canAccessModule("settings") && (
            <TabsContent value="advanced">
              <Card>
                <CardHeader>
                  <CardTitle>{t("settings.advancedSettings")}</CardTitle>
                  <CardDescription>
                    {t("settings.advancedDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">
                          {t("settings.autoSave")}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t("settings.autoSaveDescription")}
                        </p>
                      </div>
                      <Switch
                        checked={autoSave}
                        onCheckedChange={setAutoSave}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">
                        {t("settings.dangerZone")}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t("settings.dangerZoneDescription")}
                      </p>
                      <div className="pt-4">
                        <Button variant="destructive">
                          {t("settings.resetApplication")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">{t("common.cancel")}</Button>
                  <Button
                    onClick={handleSaveNotifications}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    {isSaving ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {t("common.save")}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </>
  );
};

export default SettingsPage;
