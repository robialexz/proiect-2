import React from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Package, 
  BarChart2, 
  Settings, 
  TrendingUp, 
  Zap,
  Download,
  RefreshCw,
  FileText
} from "lucide-react";
import { AnimatedContainer, AnimatedText } from "@/components/ui/animated-container";
import InventoryOptimizer from "@/components/inventory/InventoryOptimizer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const InventoryOptimizerPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t("inventory.optimizer.pageTitle", "Optimizator de inventar")}</title>
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        <AnimatedContainer animation="slideUp">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <AnimatedText 
                text={t("inventory.optimizer.pageTitle", "Optimizator de inventar")}
                tag="h1"
                className="text-3xl font-bold tracking-tight"
              />
              <p className="text-muted-foreground">
                {t("inventory.optimizer.pageSubtitle", "Analizează și optimizează inventarul pentru a reduce costurile și a îmbunătăți eficiența")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                {t("inventory.optimizer.generateReport", "Generează raport")}
              </Button>
              <Button>
                <Zap className="h-4 w-4 mr-2" />
                {t("inventory.optimizer.optimizeNow", "Optimizează acum")}
              </Button>
            </div>
          </div>
        </AnimatedContainer>

        <Separator />

        <Tabs defaultValue="optimizer">
          <TabsList className="grid grid-cols-3 w-[400px]">
            <TabsTrigger value="optimizer">
              <Zap className="h-4 w-4 mr-2" />
              {t("inventory.optimizer.tabs.optimizer", "Optimizator")}
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart2 className="h-4 w-4 mr-2" />
              {t("inventory.optimizer.tabs.analytics", "Analiză")}
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              {t("inventory.optimizer.tabs.settings", "Setări")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="optimizer" className="mt-6">
            <AnimatedContainer animation="fade">
              <InventoryOptimizer />
            </AnimatedContainer>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AnimatedContainer animation="fade">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart2 className="mr-2 h-5 w-5" />
                    {t("inventory.optimizer.analytics.title", "Analiză avansată de inventar")}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      "inventory.optimizer.analytics.description",
                      "Analiză detaliată a tendințelor și performanței inventarului"
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12">
                    <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {t("inventory.optimizer.analytics.comingSoon", "În curând")}
                    </h3>
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      {t(
                        "inventory.optimizer.analytics.comingSoonDescription",
                        "Analiza avansată de inventar va fi disponibilă în curând. Aceasta va include grafice de tendințe, previziuni și analize comparative."
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
                    {t("inventory.optimizer.settings.title", "Setări optimizator")}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      "inventory.optimizer.settings.description",
                      "Configurează parametrii și preferințele pentru optimizatorul de inventar"
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12">
                    <Settings className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {t("inventory.optimizer.settings.comingSoon", "În curând")}
                    </h3>
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      {t(
                        "inventory.optimizer.settings.comingSoonDescription",
                        "Setările pentru optimizatorul de inventar vor fi disponibile în curând. Acestea vor include configurarea parametrilor de optimizare, preferințe de notificare și integrări cu alte module."
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

export default InventoryOptimizerPage;
