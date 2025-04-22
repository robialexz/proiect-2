import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Wrench, 
  Zap, 
  Bug, 
  ShieldCheck,
  ArrowRight
} from "lucide-react";

interface ButtonIssue {
  id: string;
  element: string;
  page: string;
  issue: string;
  severity: "high" | "medium" | "low";
  status: "detected" | "fixed" | "ignored";
  details?: string;
}

const InventoryButtonFixer: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [issues, setIssues] = useState<ButtonIssue[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setProgress] = useState(0);
  const [fixedCount, setFixedCount] = useState(0);

  // Funcție pentru a scana butoanele din pagină
  const scanButtons = () => {
    setIsScanning(true);
    setProgress(0);
    
    // Simulăm un proces de scanare
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          
          // Generăm probleme simulate pentru demonstrație
          const simulatedIssues: ButtonIssue[] = [
            {
              id: "btn-1",
              element: "Button[Adaugă material]",
              page: "/inventory-management",
              issue: "Event handler missing error handling",
              severity: "high",
              status: "detected",
              details: "Funcția onAddMaterial nu are gestionare de erori pentru operațiile asincrone"
            },
            {
              id: "btn-2",
              element: "Button[Reîmprospătează]",
              page: "/inventory-management",
              issue: "Multiple click handlers",
              severity: "medium",
              status: "detected",
              details: "Butonul are mai mulți handleri de evenimente care pot cauza comportament imprevizibil"
            },
            {
              id: "btn-3",
              element: "Button[Exportă]",
              page: "/inventory-management",
              issue: "Missing loading state",
              severity: "low",
              status: "detected",
              details: "Butonul nu afișează starea de încărcare în timpul operațiilor lungi"
            },
            {
              id: "btn-4",
              element: "Button[Șterge]",
              page: "/inventory-management",
              issue: "Confirmation dialog not showing",
              severity: "high",
              status: "detected",
              details: "Dialogul de confirmare pentru ștergere nu apare întotdeauna"
            },
            {
              id: "btn-5",
              element: "Button[Filtrează]",
              page: "/inventory-management",
              issue: "Filter not applying correctly",
              severity: "medium",
              status: "detected",
              details: "Filtrele nu se aplică corect în anumite condiții"
            }
          ];
          
          setIssues(simulatedIssues);
        }
        return newProgress;
      });
    }, 300);
    
    return () => clearInterval(interval);
  };

  // Funcție pentru a repara o problemă
  const fixIssue = (id: string) => {
    setIssues(prev => 
      prev.map(issue => 
        issue.id === id 
          ? { ...issue, status: "fixed" } 
          : issue
      )
    );
    
    setFixedCount(prev => prev + 1);
    
    toast({
      title: "Problemă rezolvată",
      description: "Problema a fost rezolvată cu succes.",
      variant: "default",
    });
  };

  // Funcție pentru a ignora o problemă
  const ignoreIssue = (id: string) => {
    setIssues(prev => 
      prev.map(issue => 
        issue.id === id 
          ? { ...issue, status: "ignored" } 
          : issue
      )
    );
    
    toast({
      title: "Problemă ignorată",
      description: "Problema a fost marcată ca ignorată.",
      variant: "default",
    });
  };

  // Funcție pentru a repara toate problemele
  const fixAllIssues = () => {
    const unfixedCount = issues.filter(issue => issue.status === "detected").length;
    
    setIssues(prev => 
      prev.map(issue => 
        issue.status === "detected" 
          ? { ...issue, status: "fixed" } 
          : issue
      )
    );
    
    setFixedCount(prev => prev + unfixedCount);
    
    toast({
      title: "Toate problemele rezolvate",
      description: `${unfixedCount} probleme au fost rezolvate cu succes.`,
      variant: "default",
    });
  };

  // Funcție pentru a obține culoarea pentru severitate
  const getSeverityColor = (severity: "high" | "medium" | "low") => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Funcție pentru a obține textul pentru severitate
  const getSeverityText = (severity: "high" | "medium" | "low") => {
    switch (severity) {
      case "high":
        return t("inventory.buttonFixer.highSeverity", "Severitate ridicată");
      case "medium":
        return t("inventory.buttonFixer.mediumSeverity", "Severitate medie");
      case "low":
        return t("inventory.buttonFixer.lowSeverity", "Severitate scăzută");
      default:
        return "";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center">
              <Wrench className="mr-2 h-5 w-5 text-primary" />
              {t("inventory.buttonFixer.title", "Reparare butoane inventar")}
            </CardTitle>
            <CardDescription>
              {t(
                "inventory.buttonFixer.description",
                "Scanează și repară problemele cu butoanele din paginile de inventar"
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={scanButtons}
              disabled={isScanning}
            >
              {isScanning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {t("inventory.buttonFixer.scanning", "Scanare...")}
                </>
              ) : (
                <>
                  <Bug className="h-4 w-4 mr-2" />
                  {t("inventory.buttonFixer.scan", "Scanează butoane")}
                </>
              )}
            </Button>
            {issues.length > 0 && (
              <Button
                size="sm"
                onClick={fixAllIssues}
                disabled={isScanning || issues.every(issue => issue.status !== "detected")}
              >
                <Zap className="h-4 w-4 mr-2" />
                {t("inventory.buttonFixer.fixAll", "Repară toate")}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isScanning ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-full max-w-md mb-4 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-primary h-2.5 rounded-full"
                style={{ width: `${scanProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground">
              {t(
                "inventory.buttonFixer.scanningDescription",
                "Scanarea butoanelor din paginile de inventar..."
              )}
            </p>
          </div>
        ) : issues.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10">
                  {issues.length} {t("inventory.buttonFixer.issuesFound", "probleme găsite")}
                </Badge>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  {fixedCount} {t("inventory.buttonFixer.issuesFixed", "probleme rezolvate")}
                </Badge>
                <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                  {issues.filter(issue => issue.status === "ignored").length} {t("inventory.buttonFixer.issuesIgnored", "probleme ignorate")}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {t(
                  "inventory.buttonFixer.lastScan",
                  "Ultima scanare: "
                )}{" "}
                {new Date().toLocaleString()}
              </p>
            </div>

            <Separator />

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {issues.map((issue) => (
                  <Card key={issue.id} className="overflow-hidden">
                    <div
                      className={`h-1 w-full ${
                        issue.status === "fixed"
                          ? "bg-green-500"
                          : issue.status === "ignored"
                          ? "bg-gray-500"
                          : issue.severity === "high"
                          ? "bg-red-500"
                          : issue.severity === "medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    />
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{issue.element}</h4>
                            <Badge
                              variant="outline"
                              className={getSeverityColor(issue.severity)}
                            >
                              {getSeverityText(issue.severity)}
                            </Badge>
                            {issue.status === "fixed" && (
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                {t("inventory.buttonFixer.fixed", "Rezolvat")}
                              </Badge>
                            )}
                            {issue.status === "ignored" && (
                              <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                                {t("inventory.buttonFixer.ignored", "Ignorat")}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            <span className="font-medium">{issue.issue}</span> - {issue.page}
                          </p>
                          {issue.details && (
                            <p className="text-xs text-muted-foreground">
                              {issue.details}
                            </p>
                          )}
                        </div>
                        {issue.status === "detected" && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => ignoreIssue(issue.id)}
                            >
                              {t("inventory.buttonFixer.ignore", "Ignoră")}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => fixIssue(issue.id)}
                            >
                              {t("inventory.buttonFixer.fix", "Repară")}
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            {scanProgress === 0 ? (
              <>
                <Bug className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {t("inventory.buttonFixer.noScanPerformed", "Nicio scanare efectuată")}
                </h3>
                <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                  {t(
                    "inventory.buttonFixer.noScanDescription",
                    "Apăsați butonul 'Scanează butoane' pentru a începe verificarea butoanelor din paginile de inventar."
                  )}
                </p>
                <Button onClick={scanButtons}>
                  <Bug className="h-4 w-4 mr-2" />
                  {t("inventory.buttonFixer.startScan", "Începe scanarea")}
                </Button>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {t("inventory.buttonFixer.noIssuesFound", "Nicio problemă găsită")}
                </h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  {t(
                    "inventory.buttonFixer.noIssuesDescription",
                    "Toate butoanele din paginile de inventar funcționează corect. Nu sunt necesare reparații."
                  )}
                </p>
              </>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Alert>
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>
            {t("inventory.buttonFixer.tip", "Sfat pentru butoane")}
          </AlertTitle>
          <AlertDescription>
            {t(
              "inventory.buttonFixer.tipText",
              "Asigurați-vă că toate butoanele au gestionare de erori pentru operațiile asincrone și afișează starea de încărcare pentru operațiile lungi."
            )}
          </AlertDescription>
        </Alert>
      </CardFooter>
    </Card>
  );
};

export default InventoryButtonFixer;
