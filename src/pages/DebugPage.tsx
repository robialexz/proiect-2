import React from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Database, Bug, Wrench } from "lucide-react";
import DatabaseChecker from "@/components/debug/DatabaseChecker";
import DatabaseManager from "@/components/debug/DatabaseManager";

/**
 * Pagină de debug pentru dezvoltatori
 * Conține instrumente pentru verificarea și gestionarea bazei de date
 */
const DebugPage: React.FC = () => {
  const { t } = useTranslation();
  const isDev = import.meta.env.DEV;

  return (
    <div className="container py-8 space-y-8">
      <Helmet>
        <title>
          {t("debug.pageTitle", "Debug și Dezvoltare")} | InventoryMaster
        </title>
      </Helmet>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("debug.pageTitle", "Debug și Dezvoltare")}
          </h1>
          <Badge variant={isDev ? "default" : "destructive"}>
            {isDev
              ? t("debug.devMode", "Mod Dezvoltare")
              : t("debug.prodMode", "Mod Producție")}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          {t(
            "debug.pageDescription",
            "Instrumente pentru dezvoltatori pentru a verifica și gestiona aplicația"
          )}
        </p>
      </div>

      {!isDev && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("debug.warning", "Atenție")}</AlertTitle>
          <AlertDescription>
            {t(
              "debug.prodWarning",
              "Această pagină este destinată doar pentru mediul de dezvoltare. Utilizarea în producție poate duce la pierderea datelor."
            )}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="database">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="database">
            <Database className="h-4 w-4 mr-2" />
            {t("debug.database", "Bază de Date")}
          </TabsTrigger>
          <TabsTrigger value="diagnostics">
            <Bug className="h-4 w-4 mr-2" />
            {t("debug.diagnostics", "Diagnosticare")}
          </TabsTrigger>
          <TabsTrigger value="tools">
            <Wrench className="h-4 w-4 mr-2" />
            {t("debug.tools", "Instrumente")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="space-y-6 mt-6">
          <h2 className="text-2xl font-semibold">
            {t("debug.databaseManagement", "Gestionare Bază de Date")}
          </h2>
          <Separator />

          <DatabaseManager />

          <h3 className="text-xl font-semibold mt-8">
            {t("debug.databaseStatus", "Stare Bază de Date")}
          </h3>
          <Separator />

          <DatabaseChecker />
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-6 mt-6">
          <h2 className="text-2xl font-semibold">
            {t("debug.appDiagnostics", "Diagnosticare Aplicație")}
          </h2>
          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("debug.environmentInfo", "Informații Mediu")}
                </CardTitle>
                <CardDescription>
                  {t(
                    "debug.envDescription",
                    "Detalii despre mediul de execuție al aplicației"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {t("debug.nodeVersion", "Versiune Node")}
                    </span>
                    <span>{process.versions?.node || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {t("debug.environment", "Mediu")}
                    </span>
                    <span>{import.meta.env.MODE}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {t("debug.appVersion", "Versiune Aplicație")}
                    </span>
                    <span>{import.meta.env.VITE_APP_VERSION || "0.0.0"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {t("debug.browserInfo", "Informații Browser")}
                </CardTitle>
                <CardDescription>
                  {t(
                    "debug.browserDescription",
                    "Detalii despre browserul utilizat"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {t("debug.userAgent", "User Agent")}
                    </span>
                    <span className="text-right text-sm max-w-[250px] truncate">
                      {navigator.userAgent}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {t("debug.language", "Limbă")}
                    </span>
                    <span>{navigator.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {t("debug.platform", "Platformă")}
                    </span>
                    <span>{navigator.platform}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6 mt-6">
          <h2 className="text-2xl font-semibold">
            {t("debug.developerTools", "Instrumente Dezvoltator")}
          </h2>
          <Separator />

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("debug.comingSoon", "În curând")}</AlertTitle>
            <AlertDescription>
              {t(
                "debug.toolsComingSoon",
                "Instrumentele pentru dezvoltatori vor fi disponibile în curând."
              )}
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DebugPage;
