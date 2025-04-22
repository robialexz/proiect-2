import React from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Wrench, 
  Bug, 
  Settings, 
  ShieldCheck, 
  FileText,
  RefreshCw,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { AnimatedContainer, AnimatedText } from "@/components/ui/animated-container";
import InventoryButtonFixer from "@/components/inventory/InventoryButtonFixer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const InventoryButtonFixerPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t("inventory.buttonFixer.pageTitle", "Reparare butoane inventar")}</title>
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        <AnimatedContainer animation="slideUp">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <AnimatedText 
                text={t("inventory.buttonFixer.pageTitle", "Reparare butoane inventar")}
                tag="h1"
                className="text-3xl font-bold tracking-tight"
              />
              <p className="text-muted-foreground">
                {t("inventory.buttonFixer.pageSubtitle", "Scanează și repară problemele cu butoanele din paginile de inventar")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                {t("inventory.buttonFixer.generateReport", "Generează raport")}
              </Button>
              <Button>
                <ShieldCheck className="h-4 w-4 mr-2" />
                {t("inventory.buttonFixer.fixAll", "Repară toate")}
              </Button>
            </div>
          </div>
        </AnimatedContainer>

        <Separator />

        <Tabs defaultValue="fixer">
          <TabsList className="grid grid-cols-3 w-[400px]">
            <TabsTrigger value="fixer">
              <Wrench className="h-4 w-4 mr-2" />
              {t("inventory.buttonFixer.tabs.fixer", "Reparare")}
            </TabsTrigger>
            <TabsTrigger value="diagnostics">
              <Bug className="h-4 w-4 mr-2" />
              {t("inventory.buttonFixer.tabs.diagnostics", "Diagnosticare")}
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              {t("inventory.buttonFixer.tabs.settings", "Setări")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fixer" className="mt-6">
            <AnimatedContainer animation="fade">
              <InventoryButtonFixer />
            </AnimatedContainer>
          </TabsContent>

          <TabsContent value="diagnostics" className="mt-6">
            <AnimatedContainer animation="fade">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bug className="mr-2 h-5 w-5" />
                    {t("inventory.buttonFixer.diagnostics.title", "Diagnosticare butoane")}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      "inventory.buttonFixer.diagnostics.description",
                      "Analiză detaliată a problemelor cu butoanele din paginile de inventar"
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              {t("inventory.buttonFixer.diagnostics.totalButtons", "Total butoane")}
                            </p>
                            <h3 className="text-2xl font-bold">42</h3>
                          </div>
                          <Wrench className="h-8 w-8 text-primary opacity-80" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              {t("inventory.buttonFixer.diagnostics.issuesFound", "Probleme găsite")}
                            </p>
                            <h3 className="text-2xl font-bold">5</h3>
                          </div>
                          <AlertTriangle className="h-8 w-8 text-yellow-500 opacity-80" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              {t("inventory.buttonFixer.diagnostics.issuesFixed", "Probleme rezolvate")}
                            </p>
                            <h3 className="text-2xl font-bold">3</h3>
                          </div>
                          <CheckCircle2 className="h-8 w-8 text-green-500 opacity-80" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex flex-col items-center justify-center py-8">
                    <RefreshCw className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {t("inventory.buttonFixer.diagnostics.comingSoon", "În curând")}
                    </h3>
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      {t(
                        "inventory.buttonFixer.diagnostics.comingSoonDescription",
                        "Diagnosticarea detaliată a butoanelor va fi disponibilă în curând. Aceasta va include analize de performanță, verificări de accesibilitate și teste de compatibilitate."
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
                    {t("inventory.buttonFixer.settings.title", "Setări reparare")}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      "inventory.buttonFixer.settings.description",
                      "Configurează parametrii și preferințele pentru repararea butoanelor"
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12">
                    <Settings className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {t("inventory.buttonFixer.settings.comingSoon", "În curând")}
                    </h3>
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      {t(
                        "inventory.buttonFixer.settings.comingSoonDescription",
                        "Setările pentru repararea butoanelor vor fi disponibile în curând. Acestea vor include configurarea parametrilor de scanare, preferințe de notificare și integrări cu alte module."
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

export default InventoryButtonFixerPage;
