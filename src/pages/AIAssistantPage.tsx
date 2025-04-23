import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Bot,
  BarChart2,
  Settings,
  Search,
  Download,
  RefreshCw,
  Sparkles,
  Lightbulb,
  MessageSquare,
  Clock,
  Zap,
} from "lucide-react";
import { AIAnalytics } from "@/components/ai/AIAnalytics";
import {
  AnimatedContainer,
  AnimatedText,
} from "@/components/ui/animated-container";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIService } from "@/hooks/useAIService";

const AIAssistantPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const { suggestions } = useAIService();

  // Funcționalități AI disponibile
  const aiFeatures = [
    {
      id: "assistant",
      title: t("ai.features.assistant.title", "Asistent conversațional"),
      description: t(
        "ai.features.assistant.description",
        "Interacționează cu asistentul AI pentru a primi ajutor și informații despre aplicație."
      ),
      icon: <Bot className="h-8 w-8 text-primary" />,
      status: "active",
    },
    {
      id: "inventory",
      title: t("ai.features.inventory.title", "Analiză inventar"),
      description: t(
        "ai.features.inventory.description",
        "Analizează stocurile și primește recomandări pentru optimizarea inventarului."
      ),
      icon: <BarChart2 className="h-8 w-8 text-blue-500" />,
      status: "active",
    },
    {
      id: "suppliers",
      title: t("ai.features.suppliers.title", "Recomandări furnizori"),
      description: t(
        "ai.features.suppliers.description",
        "Primește recomandări pentru cei mai potriviți furnizori în funcție de nevoile tale."
      ),
      icon: <Sparkles className="h-8 w-8 text-yellow-500" />,
      status: "coming-soon",
    },
    {
      id: "reports",
      title: t("ai.features.reports.title", "Generare rapoarte"),
      description: t(
        "ai.features.reports.description",
        "Generează rapoarte personalizate bazate pe datele din aplicație."
      ),
      icon: <Zap className="h-8 w-8 text-purple-500" />,
      status: "coming-soon",
    },
  ];

  return (
    <>
      <Helmet>
        <title>{t("ai.pageTitle", "Asistent AI")}</title>
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        <AnimatedContainer animation="slideUp">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <AnimatedText
                text={t("ai.title", "Asistent AI")}
                tag="h1"
                className="text-3xl font-bold tracking-tight"
              />
              <p className="text-muted-foreground">
                {t(
                  "ai.subtitle",
                  "Asistentul inteligent care te ajută să lucrezi mai eficient"
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder={t("ai.search", "Caută funcționalități...")}
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                {t("ai.settings", "Setări")}
              </Button>
            </div>
          </div>
        </AnimatedContainer>

        <Separator />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="overview">
              <Bot className="h-4 w-4 mr-2" />
              {t("ai.tabs.overview", "Prezentare generală")}
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart2 className="h-4 w-4 mr-2" />
              {t("ai.tabs.analytics", "Analiză")}
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              {t("ai.tabs.settings", "Setări")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <AnimatedContainer animation="fade" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bot className="mr-2 h-5 w-5 text-primary" />
                      {t("ai.overview.title", "Asistentul tău AI")}
                    </CardTitle>
                    <CardDescription>
                      {t(
                        "ai.overview.description",
                        "Asistentul AI te ajută să lucrezi mai eficient și să găsești informațiile de care ai nevoie."
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p>
                        {t(
                          "ai.overview.intro",
                          "Asistentul AI este disponibil în orice moment pentru a te ajuta cu diverse sarcini:"
                        )}
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Lightbulb className="h-5 w-5 mr-2 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <span>
                            {t(
                              "ai.overview.feature1",
                              "Răspunde la întrebări despre aplicație și funcționalitățile sale"
                            )}
                          </span>
                        </li>
                        <li className="flex items-start">
                          <MessageSquare className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span>
                            {t(
                              "ai.overview.feature2",
                              "Oferă asistență pentru utilizarea diferitelor module"
                            )}
                          </span>
                        </li>
                        <li className="flex items-start">
                          <BarChart2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>
                            {t(
                              "ai.overview.feature3",
                              "Analizează datele și oferă recomandări"
                            )}
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Clock className="h-5 w-5 mr-2 text-purple-500 flex-shrink-0 mt-0.5" />
                          <span>
                            {t(
                              "ai.overview.feature4",
                              "Te ajută să economisești timp prin automatizarea sarcinilor repetitive"
                            )}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">
                      <Bot className="h-4 w-4 mr-2" />
                      {t("ai.overview.openAssistant", "Deschide asistentul")}
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
                      {t("ai.suggestions.title", "Întrebări sugerate")}
                    </CardTitle>
                    <CardDescription>
                      {t(
                        "ai.suggestions.description",
                        "Iată câteva întrebări pe care le poți adresa asistentului AI"
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[220px]">
                      <div className="space-y-2">
                        {suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="w-full justify-start text-left h-auto py-2"
                          >
                            <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span>{suggestion}</span>
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left h-auto py-2"
                        >
                          <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>
                            {t(
                              "ai.suggestions.howTo",
                              "Cum pot să folosesc modulul de inventar?"
                            )}
                          </span>
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left h-auto py-2"
                        >
                          <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>
                            {t(
                              "ai.suggestions.explain",
                              "Explică-mi cum funcționează rapoartele"
                            )}
                          </span>
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left h-auto py-2"
                        >
                          <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>
                            {t(
                              "ai.suggestions.help",
                              "Ajută-mă să creez un proiect nou"
                            )}
                          </span>
                        </Button>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              <h2 className="text-2xl font-bold tracking-tight mt-8">
                {t("ai.features.title", "Funcționalități AI disponibile")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {aiFeatures
                  .filter((feature) =>
                    searchTerm
                      ? feature.title
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        feature.description
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                      : true
                  )
                  .map((feature) => (
                    <Card key={feature.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">
                            {feature.title}
                          </CardTitle>
                          {feature.status === "coming-soon" ? (
                            <Badge
                              variant="outline"
                              className="bg-yellow-100 text-yellow-800 border-yellow-200"
                            >
                              {t("ai.features.comingSoon", "În curând")}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-green-100 text-green-800 border-green-200"
                            >
                              {t("ai.features.active", "Activ")}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col items-center text-center mb-4">
                          <div className="p-3 rounded-full bg-primary/10 mb-3">
                            {feature.icon}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Button
                          className="w-full"
                          variant={
                            feature.status === "coming-soon"
                              ? "outline"
                              : "default"
                          }
                          disabled={feature.status === "coming-soon"}
                        >
                          {feature.status === "coming-soon"
                            ? t(
                                "ai.features.notifyMe",
                                "Notifică-mă când e disponibil"
                              )
                            : t("ai.features.use", "Folosește acum")}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </AnimatedContainer>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AIAnalytics />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <AnimatedContainer animation="fade">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    {t("ai.settings.title", "Setări AI")}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      "ai.settings.description",
                      "Configurează comportamentul asistentului AI"
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-8 text-muted-foreground">
                    {t(
                      "ai.settings.comingSoon",
                      "Setările pentru asistentul AI vor fi disponibile în curând."
                    )}
                  </p>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </TabsContent>
        </Tabs>
      </div>

      {/* Asistentul AI este deja inclus global în aplicație */}
    </>
  );
};

export default AIAssistantPage;
