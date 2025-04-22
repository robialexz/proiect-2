import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedContainer, AnimatedText } from "@/components/ui/animated-container";
import SystemHealthMonitor from "@/components/system/SystemHealthMonitor";
import { usePermissionCheck } from "@/hooks/usePermissionCheck";
import { AccessDeniedAlert } from "@/components/auth";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bug,
  Download,
  FileText,
  HardDrive,
  RefreshCw,
  Save,
  Server,
  Settings,
  Shield,
  Terminal,
} from "lucide-react";

const SystemHealthPage: React.FC = () => {
  const { t } = useTranslation();
  const { canAccess } = usePermissionCheck();
  const [activeTab, setActiveTab] = useState("overview");

  // Verificăm dacă utilizatorul are acces la această pagină
  const hasAccess = canAccess(["admin"], ["view_system_health"]);

  if (!hasAccess) {
    return (
      <div className="container mx-auto py-6">
        <AccessDeniedAlert
          title={t("systemHealth.accessDenied", "Acces interzis")}
          description={t(
            "systemHealth.accessDeniedDescription",
            "Nu aveți permisiunea necesară pentru a accesa această pagină."
          )}
        />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t("systemHealth.pageTitle", "Stare sistem")}</title>
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        <AnimatedContainer animation="slideUp">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <AnimatedText
                text={t("systemHealth.pageTitle", "Stare sistem")}
                tag="h1"
                className="text-3xl font-bold tracking-tight"
              />
              <p className="text-muted-foreground">
                {t(
                  "systemHealth.pageSubtitle",
                  "Monitorizează starea sistemului și rezolvă probleme"
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                {t("systemHealth.generateReport", "Generează raport")}
              </Button>
              <Button>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("systemHealth.refreshAll", "Reîmprospătează tot")}
              </Button>
            </div>
          </div>
        </AnimatedContainer>

        <Separator />

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-[600px]">
            <TabsTrigger value="overview">
              <Activity className="h-4 w-4 mr-2" />
              {t("systemHealth.tabs.overview", "Prezentare generală")}
            </TabsTrigger>
            <TabsTrigger value="performance">
              <BarChart3 className="h-4 w-4 mr-2" />
              {t("systemHealth.tabs.performance", "Performanță")}
            </TabsTrigger>
            <TabsTrigger value="logs">
              <Terminal className="h-4 w-4 mr-2" />
              {t("systemHealth.tabs.logs", "Jurnale")}
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              {t("systemHealth.tabs.settings", "Setări")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <AnimatedContainer animation="fade">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <SystemHealthMonitor />
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                        {t("systemHealth.alerts", "Alerte active")}
                      </CardTitle>
                      <CardDescription>
                        {t(
                          "systemHealth.alertsDescription",
                          "Probleme care necesită atenție"
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                          {t("systemHealth.noAlerts", "Nicio alertă activă")}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t(
                            "systemHealth.noAlertsDescription",
                            "Toate sistemele funcționează normal."
                          )}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Bug className="h-5 w-5 mr-2 text-primary" />
                        {t("systemHealth.errorRate", "Rată de erori")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-4">
                        <div className="text-4xl font-bold text-green-500 mb-2">0.2%</div>
                        <p className="text-sm text-muted-foreground">
                          {t(
                            "systemHealth.errorRateDescription",
                            "Rata de erori în ultimele 24 de ore"
                          )}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </AnimatedContainer>
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <AnimatedContainer animation="fade">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    {t("systemHealth.performance.title", "Performanță sistem")}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      "systemHealth.performance.description",
                      "Monitorizează performanța sistemului în timp"
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12">
                    <RefreshCw className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {t("systemHealth.performance.comingSoon", "În curând")}
                    </h3>
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      {t(
                        "systemHealth.performance.comingSoonDescription",
                        "Monitorizarea performanței va fi disponibilă în curând. Aceasta va include grafice pentru utilizarea CPU, memorie, timp de răspuns și alte metrici importante."
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </TabsContent>

          <TabsContent value="logs" className="mt-6">
            <AnimatedContainer animation="fade">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        <Terminal className="mr-2 h-5 w-5" />
                        {t("systemHealth.logs.title", "Jurnale sistem")}
                      </CardTitle>
                      <CardDescription>
                        {t(
                          "systemHealth.logs.description",
                          "Vizualizează și analizează jurnalele sistemului"
                        )}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      {t("systemHealth.logs.download", "Descarcă jurnale")}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12">
                    <Terminal className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {t("systemHealth.logs.comingSoon", "În curând")}
                    </h3>
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      {t(
                        "systemHealth.logs.comingSoonDescription",
                        "Vizualizarea jurnalelor va fi disponibilă în curând. Aceasta va include filtrare, căutare și analiză a jurnalelor pentru a identifica și rezolva probleme."
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <AnimatedContainer animation="fade">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    {t("systemHealth.settings.title", "Setări monitorizare")}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      "systemHealth.settings.description",
                      "Configurează setările pentru monitorizarea sistemului"
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12">
                    <Settings className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {t("systemHealth.settings.comingSoon", "În curând")}
                    </h3>
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      {t(
                        "systemHealth.settings.comingSoonDescription",
                        "Setările pentru monitorizarea sistemului vor fi disponibile în curând. Acestea vor include configurarea alertelor, intervalelor de verificare și preferințelor de notificare."
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default SystemHealthPage;
