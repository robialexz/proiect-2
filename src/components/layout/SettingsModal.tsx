import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTranslation } from "react-i18next";
import { Moon, Sun, Monitor, Bell, Eye, Lock, Palette } from "lucide-react";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState<"light" | "dark" | "system">("dark");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  const handleSaveSettings = () => {
    // Here you would save the settings to your state management or localStorage
    // Removed console statement

    // Apply theme changes
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else if (theme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      // System theme logic would go here
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      }
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {t("Settings")}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {t("Customize your application preferences")}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid grid-cols-3 gap-4 bg-slate-700/50 p-1">
            <TabsTrigger
              value="appearance"
              className="data-[state=active]:bg-primary"
            >
              <Palette className="h-4 w-4 mr-2" />
              {t("Appearance")}
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-primary"
            >
              <Bell className="h-4 w-4 mr-2" />
              {t("Notifications")}
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="data-[state=active]:bg-primary"
            >
              <Eye className="h-4 w-4 mr-2" />
              {t("Preferences")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t("Theme")}</h3>
              <RadioGroup
                value={theme}
                onValueChange={(value) =>
                  setTheme(value as "light" | "dark" | "system")
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label
                    htmlFor="light"
                    className="flex items-center cursor-pointer"
                  >
                    <Sun className="h-4 w-4 mr-2 text-yellow-400" />
                    {t("Light")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label
                    htmlFor="dark"
                    className="flex items-center cursor-pointer"
                  >
                    <Moon className="h-4 w-4 mr-2 text-blue-400" />
                    {t("Dark")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="system" />
                  <Label
                    htmlFor="system"
                    className="flex items-center cursor-pointer"
                  >
                    <Monitor className="h-4 w-4 mr-2 text-green-400" />
                    {t("System")}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t("Language")}</h3>
              <RadioGroup
                value={i18n.language}
                onValueChange={(value) => i18n.changeLanguage(value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="en" id="en" />
                  <Label htmlFor="en" className="cursor-pointer">
                    {t("languages.en")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ro" id="ro" />
                  <Label htmlFor="ro" className="cursor-pointer">
                    {t("languages.ro")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fr" id="fr" />
                  <Label htmlFor="fr" className="cursor-pointer">
                    {t("languages.fr")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="de" id="de" />
                  <Label htmlFor="de" className="cursor-pointer">
                    {t("languages.de")}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">
                    {t("Enable Notifications")}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {t("Receive notifications about important updates")}
                  </p>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">
                    {t("Email Notifications")}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {t("Receive notifications via email")}
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                  disabled={!notificationsEnabled}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="mt-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">{t("Auto-save")}</h3>
                  <p className="text-sm text-slate-400">
                    {t("Automatically save changes")}
                  </p>
                </div>
                <Switch checked={autoSave} onCheckedChange={setAutoSave} />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSaveSettings}>{t("common.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
