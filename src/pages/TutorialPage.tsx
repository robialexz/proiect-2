import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import TutorialOverlay, { TutorialStep } from "@/components/tutorial/TutorialOverlay";
import { useTutorial } from "@/components/tutorial/useTutorial";
import {
  Package,
  FileText,
  Users,
  DollarSign,
  BarChart3,
  BookOpen,
  Calendar,
  Folder,
  Home,
  Settings,
  PlusCircle,
  Search,
  Upload,
  FolderPlus,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  Star,
  Clock,
  Layers,
  Truck,
  Clipboard,
  Edit,
  Trash2,
  Eye,
  Save,
  Download,
  Filter,
  RefreshCw,
  Zap,
  MessageSquare,
  Bell,
  User
} from "lucide-react";

const TutorialPage = () => {
  const { t } = useTranslation();

  // State for interactive elements
  const [activeStep, setActiveStep] = useState(1);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showTip, setShowTip] = useState(false);

  // Tutorial overlay integration
  const tutorialSteps: TutorialStep[] = [
    {
      target: ".sidebar-navigation",
      title: t("tutorial.overlay.sidebar.title", "Bara laterală"),
      content: t("tutorial.overlay.sidebar.content", "Folosiți bara laterală pentru a naviga între diferitele secțiuni ale aplicației."),
      position: "right"
    },
    {
      target: ".dashboard-overview",
      title: t("tutorial.overlay.dashboard.title", "Panou de control"),
      content: t("tutorial.overlay.dashboard.content", "Aici veți găsi o privire de ansamblu asupra proiectelor și activităților recente."),
      position: "bottom"
    },
    {
      target: ".inventory-management",
      title: t("tutorial.overlay.inventory.title", "Management inventar"),
      content: t("tutorial.overlay.inventory.content", "Gestionați materialele, stocurile și comenzile pentru proiectele dvs."),
      position: "left"
    },
    {
      target: ".user-profile",
      title: t("tutorial.overlay.profile.title", "Profil utilizator"),
      content: t("tutorial.overlay.profile.content", "Accesați și editați informațiile profilului dvs. și preferințele personale."),
      position: "bottom"
    }
  ];

  const {
    isOpen: isTutorialOpen,
    startTutorial,
    closeTutorial,
    completeTutorial,
    resetTutorial
  } = useTutorial({
    tutorialId: "main-app-tutorial",
    steps: tutorialSteps,
    autoStart: false
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  const slideInVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.3 } }
  };

  // Helper function to show a random tip
  const showRandomTip = () => {
    setShowTip(true);
    setTimeout(() => setShowTip(false), 5000);
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      {/* Tutorial Overlay */}
      <TutorialOverlay
        steps={tutorialSteps}
        isOpen={isTutorialOpen}
        onClose={closeTutorial}
        onComplete={completeTutorial}
        tutorialId="main-app-tutorial"
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {t("tutorial.title", "Tutorial")}
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg border border-slate-600 p-8 mb-8 shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full -ml-12 -mb-12 blur-2xl"></div>

              <motion.div variants={itemVariants}>
                <div className="flex items-center mb-4">
                  <div className="bg-primary/20 p-3 rounded-full mr-4">
                    <HelpCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">
                    {t("tutorial.welcome.title", "Bine ați venit la InventoryMaster")}
                  </h2>
                </div>
              </motion.div>

              <motion.p variants={itemVariants} className="text-slate-300 mb-6 text-lg leading-relaxed max-w-3xl">
                {t(
                  "tutorial.welcome.description",
                  "Acest tutorial interactiv vă va ghida prin toate funcționalitățile aplicației și vă va arăta cum să gestionați eficient proiecte, inventar, echipe și multe altele. Urmați pașii de mai jos pentru a deveni expert în utilizarea InventoryMaster."
                )}
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mb-6">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-sm">
                  <Star className="h-4 w-4 mr-1" /> Ghid complet
                </Badge>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-sm">
                  <Clock className="h-4 w-4 mr-1" /> 10 minute de citit
                </Badge>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-sm">
                  <Zap className="h-4 w-4 mr-1" /> Actualizat recent
                </Badge>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="flex gap-3">
                  <Button
                    onClick={showRandomTip}
                    className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    {t("tutorial.welcome.showTip", "Arată un sfat util")}
                  </Button>

                  <Button
                    onClick={startTutorial}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    {t("tutorial.welcome.startInteractive", "Pornește ghidul interactiv")}
                  </Button>
                </div>
              </motion.div>

              <AnimatePresence>
                {showTip && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4"
                  >
                    <Alert className="bg-primary/10 border border-primary/20">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      <AlertTitle className="text-primary font-medium">
                        {t("tutorial.welcome.tipTitle", "Sfat util")}
                      </AlertTitle>
                      <AlertDescription className="text-slate-300">
                        {t(
                          "tutorial.welcome.tipContent",
                          "Puteți accesa oricând acest tutorial din meniul lateral, secțiunea Setări, opțiunea Tutorial."
                        )}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={fadeInVariants} initial="hidden" animate="visible">
              <Tabs defaultValue="navigation" className="w-full">
                <TabsList className="grid grid-cols-5 mb-8 bg-slate-800/80 backdrop-blur border border-slate-600 rounded-xl p-1 shadow-lg">
                  <TabsTrigger value="navigation" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg transition-all duration-300 gap-2">
                    <Home className="h-4 w-4" />
                    {t("tutorial.tabs.navigation", "Navigare")}
                  </TabsTrigger>
                  <TabsTrigger value="projects" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg transition-all duration-300 gap-2">
                    <FileText className="h-4 w-4" />
                    {t("tutorial.tabs.projects", "Proiecte")}
                  </TabsTrigger>
                  <TabsTrigger value="inventory" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg transition-all duration-300 gap-2">
                    <Package className="h-4 w-4" />
                    {t("tutorial.tabs.inventory", "Inventar")}
                  </TabsTrigger>
                  <TabsTrigger value="teams" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg transition-all duration-300 gap-2">
                    <Users className="h-4 w-4" />
                    {t("tutorial.tabs.teams", "Echipe")}
                  </TabsTrigger>
                  <TabsTrigger value="other" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg transition-all duration-300 gap-2">
                    <Settings className="h-4 w-4" />
                    {t("tutorial.tabs.other", "Alte funcții")}
                  </TabsTrigger>
                </TabsList>

              {/* Navigation Tab */}
              <TabsContent value="navigation" className="space-y-8">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  {/* Sidebar Navigation Card */}
                  <motion.div variants={itemVariants} className="col-span-1">
                    <Card className="bg-slate-800 border-slate-600 shadow-lg overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 pb-4">
                        <div className="flex items-center">
                          <div className="bg-primary/20 p-2 rounded-full mr-3">
                            <Home className="h-5 w-5 text-primary" />
                          </div>
                          <CardTitle className="text-xl">
                            {t("tutorial.navigation.sidebar.title", "Bara laterală de navigare")}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-slate-400 mt-2">
                          {t(
                            "tutorial.navigation.sidebar.description",
                            "Bara laterală este principalul mod de navigare în aplicație"
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="main-nav" className="border-slate-700">
                            <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                              <div className="flex items-center">
                                <div className="bg-primary/10 p-1 rounded mr-2">
                                  <Layers className="h-4 w-4 text-primary" />
                                </div>
                                <span>{t("tutorial.navigation.mainNav", "Navigare principală")}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-3 text-slate-300 pl-4 mt-2">
                                <motion.li
                                  className="flex items-start p-2 rounded-md hover:bg-slate-700/50 transition-colors"
                                  whileHover={{ x: 5 }}
                                >
                                  <Home className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-medium text-white">Acasă</span>
                                    <p className="text-sm text-slate-400 mt-1">Pagina principală cu o privire de ansamblu asupra proiectelor și activităților recente. Aici puteți vedea statistici, proiecte active și notificări.</p>
                                  </div>
                                </motion.li>
                                <motion.li
                                  className="flex items-start p-2 rounded-md hover:bg-slate-700/50 transition-colors"
                                  whileHover={{ x: 5 }}
                                >
                                  <FileText className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-medium text-white">Proiecte</span>
                                    <p className="text-sm text-slate-400 mt-1">Gestionarea proiectelor, crearea de proiecte noi și vizualizarea detaliilor. Puteți organiza proiectele pe categorii și statut.</p>
                                  </div>
                                </motion.li>
                                <motion.li
                                  className="flex items-start p-2 rounded-md hover:bg-slate-700/50 transition-colors"
                                  whileHover={{ x: 5 }}
                                >
                                  <Package className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-medium text-white">Management Inventar</span>
                                    <p className="text-sm text-slate-400 mt-1">Adăugarea, editarea și gestionarea materialelor pentru proiecte. Include funcții de căutare, filtrare și import/export.</p>
                                  </div>
                                </motion.li>
                              </ul>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="secondary-nav" className="border-slate-700">
                            <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                              <div className="flex items-center">
                                <div className="bg-primary/10 p-1 rounded mr-2">
                                  <Layers className="h-4 w-4 text-primary" />
                                </div>
                                <span>{t("tutorial.navigation.secondaryNav", "Navigare secundară")}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-3 text-slate-300 pl-4 mt-2">
                                <motion.li
                                  className="flex items-start p-2 rounded-md hover:bg-slate-700/50 transition-colors"
                                  whileHover={{ x: 5 }}
                                >
                                  <Users className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-medium text-white">Echipe</span>
                                    <p className="text-sm text-slate-400 mt-1">Gestionarea echipelor și a membrilor acestora. Puteți crea echipe noi, adăuga membri și asigna roluri.</p>
                                  </div>
                                </motion.li>
                                <motion.li
                                  className="flex items-start p-2 rounded-md hover:bg-slate-700/50 transition-colors"
                                  whileHover={{ x: 5 }}
                                >
                                  <FileSpreadsheet className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-medium text-white">Furnizori</span>
                                    <p className="text-sm text-slate-400 mt-1">Gestionarea furnizorilor și a anunțurilor acestora. Puteți adăuga furnizori noi, gestiona comenzi și urmări livrări.</p>
                                  </div>
                                </motion.li>
                                <motion.li
                                  className="flex items-start p-2 rounded-md hover:bg-slate-700/50 transition-colors"
                                  whileHover={{ x: 5 }}
                                >
                                  <DollarSign className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-medium text-white">Buget</span>
                                    <p className="text-sm text-slate-400 mt-1">Gestionarea bugetului pentru proiecte. Include funcții de planificare, urmărire cheltuieli și raportare financiară.</p>
                                  </div>
                                </motion.li>
                              </ul>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="tools-nav" className="border-slate-700">
                            <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                              <div className="flex items-center">
                                <div className="bg-primary/10 p-1 rounded mr-2">
                                  <Layers className="h-4 w-4 text-primary" />
                                </div>
                                <span>{t("tutorial.navigation.toolsNav", "Instrumente și resurse")}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-3 text-slate-300 pl-4 mt-2">
                                <motion.li
                                  className="flex items-start p-2 rounded-md hover:bg-slate-700/50 transition-colors"
                                  whileHover={{ x: 5 }}
                                >
                                  <BarChart3 className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-medium text-white">Rapoarte</span>
                                    <p className="text-sm text-slate-400 mt-1">Generarea și vizualizarea rapoartelor. Include rapoarte predefinite și posibilitatea de a crea rapoarte personalizate.</p>
                                  </div>
                                </motion.li>
                                <motion.li
                                  className="flex items-start p-2 rounded-md hover:bg-slate-700/50 transition-colors"
                                  whileHover={{ x: 5 }}
                                >
                                  <Calendar className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-medium text-white">Program</span>
                                    <p className="text-sm text-slate-400 mt-1">Vizualizarea și gestionarea programului și evenimentelor. Include calendar, planificare și notificări pentru evenimente.</p>
                                  </div>
                                </motion.li>
                                <motion.li
                                  className="flex items-start p-2 rounded-md hover:bg-slate-700/50 transition-colors"
                                  whileHover={{ x: 5 }}
                                >
                                  <Folder className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-medium text-white">Documente</span>
                                    <p className="text-sm text-slate-400 mt-1">Gestionarea documentelor asociate proiectelor. Include încărcare, organizare și partajare de documente.</p>
                                  </div>
                                </motion.li>
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Interface Navigation Card */}
                  <motion.div variants={itemVariants} className="col-span-1">
                    <Card className="bg-slate-800 border-slate-600 shadow-lg overflow-hidden h-full">
                      <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 pb-4">
                        <div className="flex items-center">
                          <div className="bg-primary/20 p-2 rounded-full mr-3">
                            <Layers className="h-5 w-5 text-primary" />
                          </div>
                          <CardTitle className="text-xl">
                            {t("tutorial.navigation.interface.title", "Interfața aplicației")}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-slate-400 mt-2">
                          {t(
                            "tutorial.navigation.interface.description",
                            "Elemente comune de interfață și cum să le utilizați eficient"
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <h4 className="text-lg font-medium text-white flex items-center">
                              <Search className="h-5 w-5 mr-2 text-primary" />
                              {t("tutorial.navigation.interface.search", "Căutare globală")}
                            </h4>
                            <p className="text-slate-300">
                              {t(
                                "tutorial.navigation.interface.searchDescription",
                                "Bara de căutare din partea de sus vă permite să găsiți rapid proiecte, materiale, documente și alte elemente. Introduceți termenul de căutare și apăsați Enter."
                              )}
                            </p>
                            <div className="bg-slate-700/50 p-3 rounded-md border border-slate-600 mt-2">
                              <div className="flex items-center">
                                <Search className="h-4 w-4 text-slate-400 mr-2" />
                                <div className="text-sm text-slate-400 italic">Caută proiecte, materiale, documente...</div>
                              </div>
                            </div>
                          </div>

                          <Separator className="bg-slate-700" />

                          <div className="space-y-3">
                            <h4 className="text-lg font-medium text-white flex items-center">
                              <Bell className="h-5 w-5 mr-2 text-primary" />
                              {t("tutorial.navigation.interface.notifications", "Notificări")}
                            </h4>
                            <p className="text-slate-300">
                              {t(
                                "tutorial.navigation.interface.notificationsDescription",
                                "Sistemul de notificări vă ține la curent cu actualizări importante, cum ar fi modificări în proiecte, livrări noi de materiale sau evenimente apropiate."
                              )}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className="bg-primary/20 text-primary border-primary/20 px-2 py-1">
                                <Bell className="h-3 w-3 mr-1" /> Notificare nouă
                              </Badge>
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/20 px-2 py-1">
                                <CheckCircle className="h-3 w-3 mr-1" /> Acțiune finalizată
                              </Badge>
                              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/20 px-2 py-1">
                                <AlertCircle className="h-3 w-3 mr-1" /> Atenție necesară
                              </Badge>
                            </div>
                          </div>

                          <Separator className="bg-slate-700" />

                          <div className="space-y-3">
                            <h4 className="text-lg font-medium text-white flex items-center">
                              <Settings className="h-5 w-5 mr-2 text-primary" />
                              {t("tutorial.navigation.interface.userMenu", "Meniul utilizatorului")}
                            </h4>
                            <p className="text-slate-300">
                              {t(
                                "tutorial.navigation.interface.userMenuDescription",
                                "Meniul utilizatorului vă oferă acces la profilul dvs., setări, acest tutorial și opțiunea de deconectare."
                              )}
                            </p>
                            <div className="flex flex-col gap-2 mt-2">
                              <div className="flex items-center p-2 bg-slate-700/50 rounded-md border border-slate-600">
                                <User className="h-4 w-4 text-primary mr-2" />
                                <span className="text-sm">Profil</span>
                              </div>
                              <div className="flex items-center p-2 bg-slate-700/50 rounded-md border border-slate-600">
                                <HelpCircle className="h-4 w-4 text-primary mr-2" />
                                <span className="text-sm">Tutorial</span>
                              </div>
                              <div className="flex items-center p-2 bg-slate-700/50 rounded-md border border-slate-600">
                                <Settings className="h-4 w-4 text-primary mr-2" />
                                <span className="text-sm">Setări</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>

                {/* Keyboard Shortcuts Card */}
                <motion.div
                  variants={fadeInVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-slate-800 border-slate-600 shadow-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 pb-4">
                      <div className="flex items-center">
                        <div className="bg-primary/20 p-2 rounded-full mr-3">
                          <Zap className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-xl">
                          {t("tutorial.navigation.shortcuts.title", "Scurtături de tastatură")}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-slate-400 mt-2">
                        {t(
                          "tutorial.navigation.shortcuts.description",
                          "Utilizați aceste scurtături pentru a naviga mai rapid în aplicație"
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="text-lg font-medium text-white">
                            {t("tutorial.navigation.shortcuts.general", "Generale")}:
                          </h4>
                          <ul className="space-y-2">
                            <li className="flex items-center justify-between">
                              <span className="text-slate-300">Deschide căutarea</span>
                              <div className="flex gap-1">
                                <kbd className="px-2 py-1 bg-slate-700 rounded text-xs font-mono">Ctrl</kbd>
                                <kbd className="px-2 py-1 bg-slate-700 rounded text-xs font-mono">K</kbd>
                              </div>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-slate-300">Navigare la Acasă</span>
                              <div className="flex gap-1">
                                <kbd className="px-2 py-1 bg-slate-700 rounded text-xs font-mono">Alt</kbd>
                                <kbd className="px-2 py-1 bg-slate-700 rounded text-xs font-mono">H</kbd>
                              </div>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-slate-300">Deschide notificările</span>
                              <div className="flex gap-1">
                                <kbd className="px-2 py-1 bg-slate-700 rounded text-xs font-mono">Alt</kbd>
                                <kbd className="px-2 py-1 bg-slate-700 rounded text-xs font-mono">N</kbd>
                              </div>
                            </li>
                          </ul>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-lg font-medium text-white">
                            {t("tutorial.navigation.shortcuts.projects", "Proiecte")}:
                          </h4>
                          <ul className="space-y-2">
                            <li className="flex items-center justify-between">
                              <span className="text-slate-300">Proiect nou</span>
                              <div className="flex gap-1">
                                <kbd className="px-2 py-1 bg-slate-700 rounded text-xs font-mono">Alt</kbd>
                                <kbd className="px-2 py-1 bg-slate-700 rounded text-xs font-mono">P</kbd>
                              </div>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-slate-300">Salvare</span>
                              <div className="flex gap-1">
                                <kbd className="px-2 py-1 bg-slate-700 rounded text-xs font-mono">Ctrl</kbd>
                                <kbd className="px-2 py-1 bg-slate-700 rounded text-xs font-mono">S</kbd>
                              </div>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-slate-300">Actualizare listă</span>
                              <div className="flex gap-1">
                                <kbd className="px-2 py-1 bg-slate-700 rounded text-xs font-mono">F5</kbd>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Projects Tab */}
              <TabsContent value="projects" className="space-y-8">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  {/* Create Project Card */}
                  <motion.div variants={itemVariants} className="col-span-1">
                    <Card className="bg-slate-800 border-slate-600 shadow-lg overflow-hidden h-full">
                      <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 pb-4">
                        <div className="flex items-center">
                          <div className="bg-primary/20 p-2 rounded-full mr-3">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <CardTitle className="text-xl">
                            {t("tutorial.projects.create.title", "Crearea unui proiect nou")}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-slate-400 mt-2">
                          {t(
                            "tutorial.projects.create.description",
                            "Pași detaliați pentru crearea și configurarea unui proiect nou"
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-6">
                          <div className="relative pl-8 pb-8 border-l-2 border-primary/30">
                            <div className="absolute left-[-9px] top-0 bg-primary text-white w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                            <h4 className="text-white font-medium mb-2">Navigați la pagina Proiecte</h4>
                            <p className="text-slate-300 text-sm">Accesați pagina Proiecte din bara laterală de navigare. Aici veți vedea lista tuturor proiectelor existente.</p>
                          </div>

                          <div className="relative pl-8 pb-8 border-l-2 border-primary/30">
                            <div className="absolute left-[-9px] top-0 bg-primary text-white w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                            <h4 className="text-white font-medium mb-2">Apăsați butonul Creare Proiect</h4>
                            <p className="text-slate-300 text-sm">Localizați butonul <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs">+ Creare Proiect</span> din colțul din dreapta sus al paginii și apăsați-l.</p>
                          </div>

                          <div className="relative pl-8 pb-8 border-l-2 border-primary/30">
                            <div className="absolute left-[-9px] top-0 bg-primary text-white w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                            <h4 className="text-white font-medium mb-2">Completați detaliile proiectului</h4>
                            <p className="text-slate-300 text-sm">În dialogul care se deschide, completați următoarele câmpuri:</p>
                            <ul className="mt-2 space-y-2 text-sm">
                              <li className="flex items-start">
                                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs mr-2 mt-0.5">•</span>
                                <span><span className="text-white">Nume proiect</span>: Numele complet al proiectului</span>
                              </li>
                              <li className="flex items-start">
                                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs mr-2 mt-0.5">•</span>
                                <span><span className="text-white">Descriere</span>: O scurtă descriere a proiectului</span>
                              </li>
                              <li className="flex items-start">
                                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs mr-2 mt-0.5">•</span>
                                <span><span className="text-white">Data de început</span>: Data planificată pentru începerea proiectului</span>
                              </li>
                              <li className="flex items-start">
                                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs mr-2 mt-0.5">•</span>
                                <span><span className="text-white">Data de sfârșit</span>: Data estimată pentru finalizarea proiectului</span>
                              </li>
                            </ul>
                          </div>

                          <div className="relative pl-8">
                            <div className="absolute left-[-9px] top-0 bg-primary text-white w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                            <h4 className="text-white font-medium mb-2">Salvați proiectul</h4>
                            <p className="text-slate-300 text-sm">Apăsați butonul <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs">Creare</span> pentru a salva proiectul. Acesta va apărea acum în lista de proiecte.</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Manage Project Card */}
                  <motion.div variants={itemVariants} className="col-span-1">
                    <Card className="bg-slate-800 border-slate-600 shadow-lg overflow-hidden h-full">
                      <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 pb-4">
                        <div className="flex items-center">
                          <div className="bg-primary/20 p-2 rounded-full mr-3">
                            <Clipboard className="h-5 w-5 text-primary" />
                          </div>
                          <CardTitle className="text-xl">
                            {t("tutorial.projects.manage.title", "Gestionarea proiectelor")}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-slate-400 mt-2">
                          {t(
                            "tutorial.projects.manage.description",
                            "Funcționalități disponibile pentru gestionarea proiectelor existente"
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="materials" className="border-slate-700">
                            <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                              <div className="flex items-center">
                                <div className="bg-primary/10 p-1 rounded mr-2">
                                  <Package className="h-4 w-4 text-primary" />
                                </div>
                                <span>{t("tutorial.projects.manage.materials", "Gestionarea materialelor")}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 pl-4 mt-2">
                                <p className="text-slate-300 text-sm">Pentru fiecare proiect, puteți gestiona materialele necesare:</p>
                                <ul className="space-y-2 text-sm">
                                  <li className="flex items-start">
                                    <PlusCircle className="h-4 w-4 mr-2 text-primary shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-white">Adăugare materiale</span>: Adăugați materiale noi în inventarul proiectului cu detalii precum nume, cantitate, unitate de măsură, etc.
                                    </div>
                                  </li>
                                  <li className="flex items-start">
                                    <Edit className="h-4 w-4 mr-2 text-primary shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-white">Editare materiale</span>: Modificați detaliile materialelor existente, actualizați cantitățile sau prețurile.
                                    </div>
                                  </li>
                                  <li className="flex items-start">
                                    <Upload className="h-4 w-4 mr-2 text-primary shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-white">Import din Excel</span>: Încărcați liste de materiale din fișiere Excel pentru adăugare rapidă.
                                    </div>
                                  </li>
                                </ul>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="team" className="border-slate-700">
                            <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                              <div className="flex items-center">
                                <div className="bg-primary/10 p-1 rounded mr-2">
                                  <Users className="h-4 w-4 text-primary" />
                                </div>
                                <span>{t("tutorial.projects.manage.team", "Gestionarea echipei")}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 pl-4 mt-2">
                                <p className="text-slate-300 text-sm">Gestionați membrii echipei implicați în proiect:</p>
                                <ul className="space-y-2 text-sm">
                                  <li className="flex items-start">
                                    <PlusCircle className="h-4 w-4 mr-2 text-primary shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-white">Adăugare membri</span>: Asignați membri ai echipei la proiect din lista de utilizatori disponibili.
                                    </div>
                                  </li>
                                  <li className="flex items-start">
                                    <Settings className="h-4 w-4 mr-2 text-primary shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-white">Asignare roluri</span>: Definiți rolurile și responsabilitățile fiecărui membru în cadrul proiectului.
                                    </div>
                                  </li>
                                  <li className="flex items-start">
                                    <MessageSquare className="h-4 w-4 mr-2 text-primary shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-white">Comunicare</span>: Trimiteți notificări și mesaje către membrii echipei direct din aplicație.
                                    </div>
                                  </li>
                                </ul>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="budget" className="border-slate-700">
                            <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                              <div className="flex items-center">
                                <div className="bg-primary/10 p-1 rounded mr-2">
                                  <DollarSign className="h-4 w-4 text-primary" />
                                </div>
                                <span>{t("tutorial.projects.manage.budget", "Gestionarea bugetului")}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 pl-4 mt-2">
                                <p className="text-slate-300 text-sm">Planificați și monitorizați bugetul proiectului:</p>
                                <ul className="space-y-2 text-sm">
                                  <li className="flex items-start">
                                    <PlusCircle className="h-4 w-4 mr-2 text-primary shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-white">Definire buget</span>: Setați bugetul total al proiectului și alocați-l pe categorii de cheltuieli.
                                    </div>
                                  </li>
                                  <li className="flex items-start">
                                    <Edit className="h-4 w-4 mr-2 text-primary shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-white">Înregistrare cheltuieli</span>: Adăugați cheltuielile efectuate și categorisiți-le pentru o mai bună urmărire.
                                    </div>
                                  </li>
                                  <li className="flex items-start">
                                    <BarChart3 className="h-4 w-4 mr-2 text-primary shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-white">Rapoarte financiare</span>: Generați rapoarte pentru a analiza cheltuielile și a compara cu bugetul planificat.
                                    </div>
                                  </li>
                                </ul>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>

                {/* Project Workflow Card */}
                <motion.div
                  variants={fadeInVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-slate-800 border-slate-600 shadow-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 pb-4">
                      <div className="flex items-center">
                        <div className="bg-primary/20 p-2 rounded-full mr-3">
                          <Layers className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-xl">
                          {t("tutorial.projects.workflow.title", "Fluxul de lucru al unui proiect")}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-slate-400 mt-2">
                        {t(
                          "tutorial.projects.workflow.description",
                          "Etapele principale în gestionarea unui proiect de la început până la finalizare"
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="relative">
                        {/* Timeline */}
                        <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-primary/30"></div>

                        <div className="space-y-8">
                          <motion.div
                            className="relative pl-10"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <div className="absolute left-0 top-0 bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                            <h4 className="text-lg font-medium text-white mb-2">Planificare</h4>
                            <p className="text-slate-300">Definiți scopul proiectului, obiectivele, bugetul și termenele limită. Creați un plan detaliat cu toate activitățile necesare.</p>
                            <div className="mt-2 flex gap-2">
                              <Badge className="bg-primary/20 text-primary border-primary/20">
                                <FileText className="h-3 w-3 mr-1" /> Documentație
                              </Badge>
                              <Badge className="bg-primary/20 text-primary border-primary/20">
                                <Calendar className="h-3 w-3 mr-1" /> Termene
                              </Badge>
                            </div>
                          </motion.div>

                          <motion.div
                            className="relative pl-10"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <div className="absolute left-0 top-0 bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                            <h4 className="text-lg font-medium text-white mb-2">Resurse</h4>
                            <p className="text-slate-300">Alocați resursele necesare: materiale, echipamente, personal. Creați inventarul inițial și asignați membrii echipei.</p>
                            <div className="mt-2 flex gap-2">
                              <Badge className="bg-primary/20 text-primary border-primary/20">
                                <Package className="h-3 w-3 mr-1" /> Materiale
                              </Badge>
                              <Badge className="bg-primary/20 text-primary border-primary/20">
                                <Users className="h-3 w-3 mr-1" /> Echipă
                              </Badge>
                            </div>
                          </motion.div>

                          <motion.div
                            className="relative pl-10"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <div className="absolute left-0 top-0 bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                            <h4 className="text-lg font-medium text-white mb-2">Execuție</h4>
                            <p className="text-slate-300">Implementați planul, monitorizați progresul, gestionați inventarul și actualizați statusul activităților. Rezolvați problemele apărute.</p>
                            <div className="mt-2 flex gap-2">
                              <Badge className="bg-primary/20 text-primary border-primary/20">
                                <Clock className="h-3 w-3 mr-1" /> Progres
                              </Badge>
                              <Badge className="bg-primary/20 text-primary border-primary/20">
                                <Truck className="h-3 w-3 mr-1" /> Livrări
                              </Badge>
                            </div>
                          </motion.div>

                          <motion.div
                            className="relative pl-10"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <div className="absolute left-0 top-0 bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">4</div>
                            <h4 className="text-lg font-medium text-white mb-2">Monitorizare</h4>
                            <p className="text-slate-300">Urmăriți progresul, comparați cu planul inițial, analizați cheltuielile și ajustați planul dacă este necesar.</p>
                            <div className="mt-2 flex gap-2">
                              <Badge className="bg-primary/20 text-primary border-primary/20">
                                <BarChart3 className="h-3 w-3 mr-1" /> Rapoarte
                              </Badge>
                              <Badge className="bg-primary/20 text-primary border-primary/20">
                                <DollarSign className="h-3 w-3 mr-1" /> Buget
                              </Badge>
                            </div>
                          </motion.div>

                          <motion.div
                            className="relative pl-10"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <div className="absolute left-0 top-0 bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">5</div>
                            <h4 className="text-lg font-medium text-white mb-2">Finalizare</h4>
                            <p className="text-slate-300">Încheiați proiectul, evaluați rezultatele, documentați lecțiile învățate și arhivați informațiile pentru referințe viitoare.</p>
                            <div className="mt-2 flex gap-2">
                              <Badge className="bg-primary/20 text-primary border-primary/20">
                                <CheckCircle className="h-3 w-3 mr-1" /> Finalizare
                              </Badge>
                              <Badge className="bg-primary/20 text-primary border-primary/20">
                                <Folder className="h-3 w-3 mr-1" /> Arhivare
                              </Badge>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Inventory Tab */}
              <TabsContent value="inventory" className="space-y-8">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  {/* Add Materials Card */}
                  <motion.div variants={itemVariants} className="col-span-1">
                    <Card className="bg-slate-800 border-slate-600 shadow-lg overflow-hidden h-full">
                      <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 pb-4">
                        <div className="flex items-center">
                          <div className="bg-primary/20 p-2 rounded-full mr-3">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <CardTitle className="text-xl">
                            {t("tutorial.inventory.materials.title", "Adăugarea materialelor")}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-slate-400 mt-2">
                          {t(
                            "tutorial.inventory.materials.description",
                            "Ghid pas cu pas pentru adăugarea materialelor în inventar"
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-6">
                          <div className="relative pl-8 pb-8 border-l-2 border-primary/30">
                            <div className="absolute left-[-9px] top-0 bg-primary text-white w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                            <h4 className="text-white font-medium mb-2">Accesați pagina de inventar</h4>
                            <p className="text-slate-300 text-sm">Navigați la pagina <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs">Management Inventar</span> din bara laterală de navigare.</p>
                          </div>

                          <div className="relative pl-8 pb-8 border-l-2 border-primary/30">
                            <div className="absolute left-[-9px] top-0 bg-primary text-white w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                            <h4 className="text-white font-medium mb-2">Selectați proiectul</h4>
                            <p className="text-slate-300 text-sm">Din meniul dropdown din partea de sus a paginii, selectați proiectul pentru care doriți să adăugați materiale.</p>
                            <div className="mt-2 bg-slate-700/50 p-2 rounded-md border border-slate-600 text-sm">
                              <div className="flex items-center">
                                <Folder className="h-4 w-4 text-primary mr-2" />
                                <span className="text-white">Selectați proiect</span>
                                <ChevronDown className="h-4 w-4 ml-2 text-slate-400" />
                              </div>
                            </div>
                          </div>

                          <div className="relative pl-8 pb-8 border-l-2 border-primary/30">
                            <div className="absolute left-[-9px] top-0 bg-primary text-white w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                            <h4 className="text-white font-medium mb-2">Deschideți formularul de adăugare</h4>
                            <p className="text-slate-300 text-sm">Apăsați butonul <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs">+ Adaugă Material</span> pentru a deschide formularul de adăugare.</p>
                          </div>

                          <div className="relative pl-8 pb-8 border-l-2 border-primary/30">
                            <div className="absolute left-[-9px] top-0 bg-primary text-white w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                            <h4 className="text-white font-medium mb-2">Completați detaliile materialului</h4>
                            <p className="text-slate-300 text-sm">Completați toate câmpurile necesare în formular:</p>
                            <ul className="mt-2 space-y-1 text-sm">
                              <li className="flex items-start">
                                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs mr-2 mt-0.5">•</span>
                                <span><span className="text-white">Nume</span>: Denumirea materialului</span>
                              </li>
                              <li className="flex items-start">
                                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs mr-2 mt-0.5">•</span>
                                <span><span className="text-white">Dimensiune</span>: Dimensiunea materialului (opțional)</span>
                              </li>
                              <li className="flex items-start">
                                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs mr-2 mt-0.5">•</span>
                                <span><span className="text-white">Unitate</span>: Unitatea de măsură (buc, kg, m, etc.)</span>
                              </li>
                              <li className="flex items-start">
                                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs mr-2 mt-0.5">•</span>
                                <span><span className="text-white">Cantitate</span>: Cantitatea disponibilă</span>
                              </li>
                              <li className="flex items-start">
                                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs mr-2 mt-0.5">•</span>
                                <span><span className="text-white">Producător</span>: Numele producătorului (opțional)</span>
                              </li>
                              <li className="flex items-start">
                                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs mr-2 mt-0.5">•</span>
                                <span><span className="text-white">Categorie</span>: Categoria materialului (opțional)</span>
                              </li>
                              <li className="flex items-start">
                                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs mr-2 mt-0.5">•</span>
                                <span><span className="text-white">Imagine</span>: URL sau încărcare de imagine (opțional)</span>
                              </li>
                            </ul>
                          </div>

                          <div className="relative pl-8">
                            <div className="absolute left-[-9px] top-0 bg-primary text-white w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold">5</div>
                            <h4 className="text-white font-medium mb-2">Salvați materialul</h4>
                            <p className="text-slate-300 text-sm">Apăsați butonul <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs">Adaugă</span> pentru a salva materialul în inventar. Acesta va apărea acum în lista de materiale.</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Import Excel Card */}
                  <motion.div variants={itemVariants} className="col-span-1">
                    <Card className="bg-slate-800 border-slate-600 shadow-lg overflow-hidden h-full">
                      <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 pb-4">
                        <div className="flex items-center">
                          <div className="bg-primary/20 p-2 rounded-full mr-3">
                            <Upload className="h-5 w-5 text-primary" />
                          </div>
                          <CardTitle className="text-xl">
                            {t("tutorial.inventory.import.title", "Importarea materialelor din Excel")}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-slate-400 mt-2">
                          {t(
                            "tutorial.inventory.import.description",
                            "Cum să importați rapid liste de materiale din fișiere Excel"
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-6">
                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                            <div className="flex items-start">
                              <Info className="h-5 w-5 text-primary mr-3 mt-0.5 shrink-0" />
                              <div>
                                <h4 className="text-white font-medium mb-1">Format Excel acceptat</h4>
                                <p className="text-slate-300 text-sm">Fișierul Excel trebuie să conțină următoarele coloane:</p>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                  <div className="bg-slate-700/50 p-1.5 rounded border border-slate-600">Nume (obligatoriu)</div>
                                  <div className="bg-slate-700/50 p-1.5 rounded border border-slate-600">Unitate (obligatoriu)</div>
                                  <div className="bg-slate-700/50 p-1.5 rounded border border-slate-600">Cantitate (obligatoriu)</div>
                                  <div className="bg-slate-700/50 p-1.5 rounded border border-slate-600">Dimensiune (opțional)</div>
                                  <div className="bg-slate-700/50 p-1.5 rounded border border-slate-600">Producător (opțional)</div>
                                  <div className="bg-slate-700/50 p-1.5 rounded border border-slate-600">Categorie (opțional)</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="relative pl-8 pb-8 border-l-2 border-primary/30">
                            <div className="absolute left-[-9px] top-0 bg-primary text-white w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                            <h4 className="text-white font-medium mb-2">Pregătiți fișierul Excel</h4>
                            <p className="text-slate-300 text-sm">Creați un fișier Excel cu coloanele necesare și completați datele materialelor pe care doriți să le importați.</p>
                          </div>

                          <div className="relative pl-8 pb-8 border-l-2 border-primary/30">
                            <div className="absolute left-[-9px] top-0 bg-primary text-white w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                            <h4 className="text-white font-medium mb-2">Accesați pagina de inventar</h4>
                            <p className="text-slate-300 text-sm">Navigați la pagina <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs">Management Inventar</span> și selectați proiectul pentru care doriți să importați materialele.</p>
                          </div>

                          <div className="relative pl-8 pb-8 border-l-2 border-primary/30">
                            <div className="absolute left-[-9px] top-0 bg-primary text-white w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                            <h4 className="text-white font-medium mb-2">Inițiați importul</h4>
                            <p className="text-slate-300 text-sm">Apăsați butonul <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs">Import Excel</span> din partea de sus a paginii.</p>
                            <div className="mt-2 flex">
                              <div className="bg-slate-700/50 p-2 rounded-md border border-slate-600 text-sm inline-flex items-center">
                                <Upload className="h-4 w-4 text-primary mr-2" />
                                <span className="text-white">Import Excel</span>
                              </div>
                            </div>
                          </div>

                          <div className="relative pl-8 pb-8 border-l-2 border-primary/30">
                            <div className="absolute left-[-9px] top-0 bg-primary text-white w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                            <h4 className="text-white font-medium mb-2">Selectați fișierul</h4>
                            <p className="text-slate-300 text-sm">Se va deschide un dialog de selecție a fișierelor. Navigați la locația fișierului Excel și selectați-l.</p>
                          </div>

                          <div className="relative pl-8">
                            <div className="absolute left-[-9px] top-0 bg-primary text-white w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold">5</div>
                            <h4 className="text-white font-medium mb-2">Confirmați importul</h4>
                            <p className="text-slate-300 text-sm">Verificați datele afișate în previzualizare și apăsați butonul <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs">Importă</span> pentru a finaliza importul. Materialele vor fi adăugate în inventarul proiectului.</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>

                {/* Search and Filter Card */}
                <motion.div
                  variants={fadeInVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-slate-800 border-slate-600 shadow-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 pb-4">
                      <div className="flex items-center">
                        <div className="bg-primary/20 p-2 rounded-full mr-3">
                          <Search className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-xl">
                          {t("tutorial.inventory.search.title", "Căutarea și filtrarea materialelor")}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-slate-400 mt-2">
                        {t(
                          "tutorial.inventory.search.description",
                          "Tehnici avansate pentru găsirea rapidă a materialelor în inventar"
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-white flex items-center">
                            <Search className="h-5 w-5 mr-2 text-primary" />
                            {t("tutorial.inventory.search.searchTitle", "Căutare după cuvinte cheie")}
                          </h3>

                          <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600">
                            <div className="flex items-center mb-3">
                              <div className="bg-slate-600 rounded-l p-2 border border-slate-500">
                                <Search className="h-4 w-4 text-slate-300" />
                              </div>
                              <div className="flex-1 bg-slate-600 rounded-r p-2 border-t border-r border-b border-slate-500 text-sm text-slate-300">
                                Caută materiale...
                              </div>
                            </div>

                            <p className="text-slate-300 text-sm">Câmpul de căutare vă permite să găsiți rapid materiale după:</p>
                            <ul className="mt-2 space-y-1 text-sm">
                              <li className="flex items-start">
                                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs mr-2 mt-0.5">•</span>
                                <span>Nume</span>
                              </li>
                              <li className="flex items-start">
                                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs mr-2 mt-0.5">•</span>
                                <span>Producător</span>
                              </li>
                              <li className="flex items-start">
                                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs mr-2 mt-0.5">•</span>
                                <span>Categorie</span>
                              </li>
                              <li className="flex items-start">
                                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs mr-2 mt-0.5">•</span>
                                <span>Dimensiune</span>
                              </li>
                            </ul>
                          </div>

                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                            <div className="flex items-start">
                              <Lightbulb className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                              <p className="text-slate-300 text-sm">Puteți folosi căutarea parțială. De exemplu, dacă căutați "cablu", veți găsi toate materialele care conțin acest cuvânt în nume.</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-white flex items-center">
                            <Filter className="h-5 w-5 mr-2 text-primary" />
                            {t("tutorial.inventory.search.filterTitle", "Filtrare avansată")}
                          </h3>

                          <div className="space-y-4">
                            <div className="bg-slate-700/50 p-3 rounded-md border border-slate-600">
                              <h4 className="text-white text-sm font-medium mb-2 flex items-center">
                                <FolderPlus className="h-4 w-4 mr-2 text-primary" />
                                Filtrare după proiect
                              </h4>
                              <p className="text-slate-300 text-sm">Selectați un proiect specific din meniul dropdown pentru a vedea doar materialele asociate acelui proiect.</p>
                            </div>

                            <div className="bg-slate-700/50 p-3 rounded-md border border-slate-600">
                              <h4 className="text-white text-sm font-medium mb-2 flex items-center">
                                <Filter className="h-4 w-4 mr-2 text-primary" />
                                Filtrare după categorie
                              </h4>
                              <p className="text-slate-300 text-sm">Folosiți filtrele de categorie pentru a vedea doar materialele dintr-o anumită categorie (ex: Electric, HVAC, etc.).</p>
                            </div>

                            <div className="bg-slate-700/50 p-3 rounded-md border border-slate-600">
                              <h4 className="text-white text-sm font-medium mb-2 flex items-center">
                                <RefreshCw className="h-4 w-4 mr-2 text-primary" />
                                Sortare
                              </h4>
                              <p className="text-slate-300 text-sm">Apăsați pe antetul unei coloane pentru a sorta materialele după acea coloană (nume, cantitate, etc.).</p>
                            </div>
                          </div>

                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                            <div className="flex items-start">
                              <Lightbulb className="h-4 w-4 text-primary mr-2 mt-0.5 shrink-0" />
                              <p className="text-slate-300 text-sm">Puteți combina căutarea și filtrele pentru a găsi exact materialele de care aveți nevoie. De exemplu, căutați "cablu" și filtrați după categoria "Electric".</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Teams Tab */}
              <TabsContent value="teams" className="space-y-8">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  {/* Team Management Card */}
                  <motion.div variants={itemVariants} className="col-span-1">
                    <Card className="bg-slate-800 border-slate-600 shadow-lg overflow-hidden h-full">
                      <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 pb-4">
                        <div className="flex items-center">
                          <div className="bg-primary/20 p-2 rounded-full mr-3">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <CardTitle className="text-xl">
                            {t("tutorial.teams.management.title", "Gestionarea echipelor")}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-slate-400 mt-2">
                          {t(
                            "tutorial.teams.management.description",
                            "Cum să creați și să gestionați echipele de lucru"
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-6">
                          <div className="relative pl-8 pb-8 border-l-2 border-primary/30">
                            <div className="absolute left-[-9px] top-0 bg-primary text-white w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                            <h4 className="text-white font-medium mb-2">Accesați pagina de echipe</h4>
                            <p className="text-slate-300 text-sm">Navigați la pagina <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs">Echipe</span> din bara laterală de navigare.</p>
                          </div>

                          <div className="relative pl-8 pb-8 border-l-2 border-primary/30">
                            <div className="absolute left-[-9px] top-0 bg-primary text-white w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                            <h4 className="text-white font-medium mb-2">Creați o echipă nouă</h4>
                            <p className="text-slate-300 text-sm">Apăsați butonul <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs">+ Adaugă Echipă</span> pentru a deschide formularul de creare a unei echipe noi.</p>
                            <div className="mt-2 flex">
                              <div className="bg-slate-700/50 p-2 rounded-md border border-slate-600 text-sm inline-flex items-center">
                                <PlusCircle className="h-4 w-4 text-primary mr-2" />
                                <span className="text-white">Adaugă Echipă</span>
                              </div>
                            </div>
                          </div>

                          <div className="relative pl-8 pb-8 border-l-2 border-primary/30">
                            <div className="absolute left-[-9px] top-0 bg-primary text-white w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                            <h4 className="text-white font-medium mb-2">Completați detaliile echipei</h4>
                            <p className="text-slate-300 text-sm">Completați informațiile necesare pentru echipă:</p>
                            <ul className="mt-2 space-y-1 text-sm">
                              <li className="flex items-start">
                                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs mr-2 mt-0.5">•</span>
                                <span><span className="text-white">Nume echipă</span>: Numele complet al echipei</span>
                              </li>
                              <li className="flex items-start">
                                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs mr-2 mt-0.5">•</span>
                                <span><span className="text-white">Descriere</span>: O scurtă descriere a rolului echipei</span>
                              </li>
                              <li className="flex items-start">
                                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs mr-2 mt-0.5">•</span>
                                <span><span className="text-white">Departament</span>: Departamentul din care face parte echipa</span>
                              </li>
                            </ul>
                          </div>

                          <div className="relative pl-8">
                            <div className="absolute left-[-9px] top-0 bg-primary text-white w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                            <h4 className="text-white font-medium mb-2">Salvați echipa</h4>
                            <p className="text-slate-300 text-sm">Apăsați butonul <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs">Creare</span> pentru a salva echipa. Aceasta va apărea acum în lista de echipe.</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Team Members Card */}
                  <motion.div variants={itemVariants} className="col-span-1">
                    <Card className="bg-slate-800 border-slate-600 shadow-lg overflow-hidden h-full">
                      <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 pb-4">
                        <div className="flex items-center">
                          <div className="bg-primary/20 p-2 rounded-full mr-3">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <CardTitle className="text-xl">
                            {t("tutorial.teams.members.title", "Gestionarea membrilor echipei")}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-slate-400 mt-2">
                          {t(
                            "tutorial.teams.members.description",
                            "Cum să adăugați și să gestionați membrii unei echipe"
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="add-members" className="border-slate-700">
                            <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                              <div className="flex items-center">
                                <div className="bg-primary/10 p-1 rounded mr-2">
                                  <PlusCircle className="h-4 w-4 text-primary" />
                                </div>
                                <span>{t("tutorial.teams.members.addMembers", "Adăugarea membrilor")}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 pl-4 mt-2">
                                <p className="text-slate-300 text-sm">Pentru a adăuga membri în echipă:</p>
                                <ol className="space-y-2 text-sm list-decimal pl-5">
                                  <li className="text-slate-300">
                                    Selectați echipa din lista de echipe
                                  </li>
                                  <li className="text-slate-300">
                                    Apăsați butonul <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs">+ Adaugă Membru</span>
                                  </li>
                                  <li className="text-slate-300">
                                    Căutați utilizatorul după nume sau email
                                  </li>
                                  <li className="text-slate-300">
                                    Selectați rolul utilizatorului în echipă
                                  </li>
                                  <li className="text-slate-300">
                                    Apăsați <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs">Adaugă</span> pentru a confirma
                                  </li>
                                </ol>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="assign-roles" className="border-slate-700">
                            <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                              <div className="flex items-center">
                                <div className="bg-primary/10 p-1 rounded mr-2">
                                  <Settings className="h-4 w-4 text-primary" />
                                </div>
                                <span>{t("tutorial.teams.members.assignRoles", "Asignarea rolurilor")}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 pl-4 mt-2">
                                <p className="text-slate-300 text-sm">Rolurile definesc permisiunile și responsabilitățile membrilor echipei:</p>
                                <ul className="space-y-2 text-sm">
                                  <li className="flex items-start">
                                    <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs mr-2 mt-0.5">•</span>
                                    <div>
                                      <span className="text-white">Administrator</span>: Acces complet la gestionarea echipei și a proiectelor asociate
                                    </div>
                                  </li>
                                  <li className="flex items-start">
                                    <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs mr-2 mt-0.5">•</span>
                                    <div>
                                      <span className="text-white">Manager</span>: Poate gestiona proiecte și materiale, dar nu poate modifica echipa
                                    </div>
                                  </li>
                                  <li className="flex items-start">
                                    <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs mr-2 mt-0.5">•</span>
                                    <div>
                                      <span className="text-white">Membru</span>: Poate vizualiza și lucra cu materialele, dar nu poate face modificări majore
                                    </div>
                                  </li>
                                  <li className="flex items-start">
                                    <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs mr-2 mt-0.5">•</span>
                                    <div>
                                      <span className="text-white">Vizitator</span>: Poate doar vizualiza informațiile, fără a putea face modificări
                                    </div>
                                  </li>
                                </ul>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="manage-members" className="border-slate-700">
                            <AccordionTrigger className="text-slate-200 hover:text-white hover:no-underline">
                              <div className="flex items-center">
                                <div className="bg-primary/10 p-1 rounded mr-2">
                                  <Edit className="h-4 w-4 text-primary" />
                                </div>
                                <span>{t("tutorial.teams.members.manageMembers", "Gestionarea membrilor")}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 pl-4 mt-2">
                                <p className="text-slate-300 text-sm">După adăugarea membrilor, puteți:</p>
                                <ul className="space-y-2 text-sm">
                                  <li className="flex items-start">
                                    <Edit className="h-4 w-4 mr-2 text-primary shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-white">Edita rolul</span>: Modificați rolul unui membru în echipă
                                    </div>
                                  </li>
                                  <li className="flex items-start">
                                    <Trash2 className="h-4 w-4 mr-2 text-primary shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-white">Elimina membri</span>: Înlăturați un membru din echipă
                                    </div>
                                  </li>
                                  <li className="flex items-start">
                                    <MessageSquare className="h-4 w-4 mr-2 text-primary shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-white">Comunica</span>: Trimiteți mesaje către membrii echipei
                                    </div>
                                  </li>
                                </ul>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </TabsContent>

              {/* Other Tab */}
              <TabsContent value="other" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-800 rounded-lg border border-slate-700 p-6"
                >
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    {t("tutorial.other.teams.title", "Gestionarea echipelor")}
                  </h3>
                  <p className="text-slate-300 mb-4">
                    {t(
                      "tutorial.other.teams.description",
                      "Pentru a gestiona echipele și membrii acestora:"
                    )}
                  </p>
                  <ol className="space-y-3 text-slate-300 list-decimal pl-5">
                    <li>Navigați la pagina <span className="font-medium">Echipe</span>.</li>
                    <li>Apăsați butonul <span className="font-medium">Adaugă Echipă</span> pentru a crea o echipă nouă.</li>
                    <li>Completați numele echipei și alte detalii.</li>
                    <li>Adăugați membri în echipă folosind butonul <span className="font-medium">Adaugă Membru</span>.</li>
                    <li>Asignați roluri și responsabilități membrilor echipei.</li>
                  </ol>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-slate-800 rounded-lg border border-slate-700 p-6"
                >
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    {t("tutorial.other.schedule.title", "Planificarea evenimentelor")}
                  </h3>
                  <p className="text-slate-300 mb-4">
                    {t(
                      "tutorial.other.schedule.description",
                      "Pentru a planifica și gestiona evenimente:"
                    )}
                  </p>
                  <ol className="space-y-3 text-slate-300 list-decimal pl-5">
                    <li>Navigați la pagina <span className="font-medium">Program</span>.</li>
                    <li>Apăsați butonul <span className="font-medium">Adaugă Eveniment</span>.</li>
                    <li>Completați titlul, data, ora și descrierea evenimentului.</li>
                    <li>Selectați proiectul asociat evenimentului (opțional).</li>
                    <li>Invitați membri ai echipei la eveniment (opțional).</li>
                    <li>Apăsați butonul <span className="font-medium">Salvează</span> pentru a crea evenimentul.</li>
                  </ol>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="bg-slate-800 rounded-lg border border-slate-700 p-6"
                >
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                    {t("tutorial.other.reports.title", "Generarea rapoartelor")}
                  </h3>
                  <p className="text-slate-300 mb-4">
                    {t(
                      "tutorial.other.reports.description",
                      "Pentru a genera și vizualiza rapoarte:"
                    )}
                  </p>
                  <ol className="space-y-3 text-slate-300 list-decimal pl-5">
                    <li>Navigați la pagina <span className="font-medium">Rapoarte</span>.</li>
                    <li>Selectați tipul de raport pe care doriți să-l generați.</li>
                    <li>Setați parametrii raportului (interval de timp, proiect, etc.).</li>
                    <li>Apăsați butonul <span className="font-medium">Generează Raport</span>.</li>
                    <li>Vizualizați raportul generat și exportați-l în format PDF sau Excel dacă este necesar.</li>
                  </ol>
                </motion.div>
              </TabsContent>
            </Tabs>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TutorialPage;

