import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  BarChart2, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Zap,
  Package,
  ArrowDownUp,
  Truck,
  Calendar,
  DollarSign
} from "lucide-react";
import { useSupabaseClient } from "@/lib/supabase-provider";
import { useToast } from "@/components/ui/use-toast";
import { Material } from "@/models/material.model";
import { cacheService } from "@/lib/cache-service";

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  excessStockItems: number;
  averageTurnoverDays: number;
  topCategories: { category: string; count: number }[];
}

interface OptimizationSuggestion {
  id: string;
  type: "reorder" | "excess" | "supplier" | "category" | "location";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  savings?: number;
  materials?: string[];
}

const InventoryOptimizer: React.FC = () => {
  const { t } = useTranslation();
  const supabase = useSupabaseClient();
  const { toast } = useToast();
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [optimizationProgress, setOptimizationProgress] = useState(0);

  // Funcție pentru a încărca statisticile de inventar
  const loadInventoryStats = useCallback(async () => {
    setIsLoading(true);
    try {
      // Verificăm dacă avem date în cache
      const cachedStats = cacheService.get<InventoryStats>("inventory_optimizer_stats", {
        namespace: "inventory",
      });

      if (cachedStats) {
        setStats(cachedStats);
        setIsLoading(false);
        return;
      }

      // Obținem toate materialele
      const { data: materials, error } = await supabase
        .from("materials")
        .select("id, name, quantity, unit, cost_per_unit, category, min_stock_level, max_stock_level, last_order_date");

      if (error) throw error;

      if (!materials || materials.length === 0) {
        setStats({
          totalItems: 0,
          totalValue: 0,
          lowStockItems: 0,
          excessStockItems: 0,
          averageTurnoverDays: 0,
          topCategories: [],
        });
        setIsLoading(false);
        return;
      }

      // Calculăm statisticile
      const totalItems = materials.length;
      const totalValue = materials.reduce(
        (sum, item) => sum + (item.quantity * (item.cost_per_unit || 0)),
        0
      );
      const lowStockItems = materials.filter(
        (item) => item.min_stock_level && item.quantity < item.min_stock_level
      ).length;
      const excessStockItems = materials.filter(
        (item) => item.max_stock_level && item.quantity > item.max_stock_level
      ).length;

      // Calculăm rata de rotație a stocului (aproximativ)
      const now = new Date();
      const averageTurnoverDays = materials.reduce((sum, item) => {
        if (item.last_order_date) {
          const orderDate = new Date(item.last_order_date);
          const daysSinceOrder = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
          return sum + daysSinceOrder;
        }
        return sum + 30; // Valoare implicită de 30 de zile
      }, 0) / totalItems;

      // Obținem categoriile de top
      const categoryCounts: Record<string, number> = {};
      materials.forEach((item) => {
        const category = item.category || "Necategorizat";
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });

      const topCategories = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const newStats = {
        totalItems,
        totalValue,
        lowStockItems,
        excessStockItems,
        averageTurnoverDays,
        topCategories,
      };

      // Salvăm statisticile în cache
      cacheService.set("inventory_optimizer_stats", newStats, {
        namespace: "inventory",
        expireIn: 30 * 60 * 1000, // 30 minute
      });

      setStats(newStats);
      
      // Generăm sugestii de optimizare
      generateOptimizationSuggestions(materials);
    } catch (error) {
      console.error("Error loading inventory stats:", error);
      toast({
        title: t("inventory.optimizer.error", "Eroare"),
        description: t(
          "inventory.optimizer.errorLoading",
          "A apărut o eroare la încărcarea statisticilor de inventar."
        ),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, toast, t]);

  // Funcție pentru a genera sugestii de optimizare
  const generateOptimizationSuggestions = useCallback((materials: any[]) => {
    const suggestions: OptimizationSuggestion[] = [];

    // Simulăm un proces de analiză
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setOptimizationProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        
        // 1. Sugestii pentru reaprovizionare
        const lowStockMaterials = materials.filter(
          (item) => item.min_stock_level && item.quantity < item.min_stock_level
        );
        
        if (lowStockMaterials.length > 0) {
          suggestions.push({
            id: "reorder-1",
            type: "reorder",
            title: t("inventory.optimizer.reorderSuggestion", "Reaprovizionare necesară"),
            description: t(
              "inventory.optimizer.reorderDescription",
              `${lowStockMaterials.length} materiale au stocul sub nivelul minim. Recomandăm reaprovizionarea acestora pentru a evita întreruperile în proiecte.`
            ),
            impact: lowStockMaterials.length > 5 ? "high" : "medium",
            materials: lowStockMaterials.map(m => m.name),
          });
        }
        
        // 2. Sugestii pentru stoc în exces
        const excessStockMaterials = materials.filter(
          (item) => item.max_stock_level && item.quantity > item.max_stock_level
        );
        
        if (excessStockMaterials.length > 0) {
          const excessValue = excessStockMaterials.reduce(
            (sum, item) => sum + ((item.quantity - (item.max_stock_level || 0)) * (item.cost_per_unit || 0)),
            0
          );
          
          suggestions.push({
            id: "excess-1",
            type: "excess",
            title: t("inventory.optimizer.excessSuggestion", "Stoc în exces"),
            description: t(
              "inventory.optimizer.excessDescription",
              `${excessStockMaterials.length} materiale au stocul peste nivelul maxim. Reducerea acestora ar putea elibera capital de aproximativ ${excessValue.toFixed(2)} RON.`
            ),
            impact: excessValue > 10000 ? "high" : "medium",
            savings: excessValue,
            materials: excessStockMaterials.map(m => m.name),
          });
        }
        
        // 3. Sugestii pentru optimizarea furnizorilor
        const suppliersCount: Record<string, number> = {};
        materials.forEach((item) => {
          if (item.supplier_id) {
            suppliersCount[item.supplier_id] = (suppliersCount[item.supplier_id] || 0) + 1;
          }
        });
        
        const supplierEntries = Object.entries(suppliersCount);
        if (supplierEntries.length > 10) {
          suggestions.push({
            id: "supplier-1",
            type: "supplier",
            title: t("inventory.optimizer.supplierSuggestion", "Consolidare furnizori"),
            description: t(
              "inventory.optimizer.supplierDescription",
              `Aveți ${supplierEntries.length} furnizori diferiți. Consolidarea comenzilor la mai puțini furnizori ar putea reduce costurile administrative și de transport.`
            ),
            impact: "medium",
          });
        }
        
        // 4. Sugestii pentru categorii
        const uncategorizedMaterials = materials.filter(item => !item.category || item.category === "");
        if (uncategorizedMaterials.length > 0) {
          suggestions.push({
            id: "category-1",
            type: "category",
            title: t("inventory.optimizer.categorySuggestion", "Materiale necategorizate"),
            description: t(
              "inventory.optimizer.categoryDescription",
              `${uncategorizedMaterials.length} materiale nu au o categorie atribuită. Categorizarea acestora ar îmbunătăți organizarea și ar facilita găsirea lor.`
            ),
            impact: uncategorizedMaterials.length > 10 ? "medium" : "low",
            materials: uncategorizedMaterials.map(m => m.name),
          });
        }
        
        // 5. Sugestii pentru locație
        const noLocationMaterials = materials.filter(item => !item.location || item.location === "");
        if (noLocationMaterials.length > 0) {
          suggestions.push({
            id: "location-1",
            type: "location",
            title: t("inventory.optimizer.locationSuggestion", "Locații lipsă"),
            description: t(
              "inventory.optimizer.locationDescription",
              `${noLocationMaterials.length} materiale nu au o locație specificată. Adăugarea locațiilor ar îmbunătăți eficiența găsirii materialelor în depozit.`
            ),
            impact: noLocationMaterials.length > 20 ? "medium" : "low",
          });
        }
        
        // Sortăm sugestiile după impact
        const sortedSuggestions = suggestions.sort((a, b) => {
          const impactOrder = { high: 0, medium: 1, low: 2 };
          return impactOrder[a.impact] - impactOrder[b.impact];
        });
        
        setSuggestions(sortedSuggestions);
      }
    }, 200);
    
    return () => clearInterval(interval);
  }, [t]);

  // Încărcăm statisticile la montarea componentei
  useEffect(() => {
    loadInventoryStats();
  }, [loadInventoryStats]);

  // Funcție pentru a reîmprospăta datele
  const handleRefresh = () => {
    // Ștergem cache-ul pentru a forța reîncărcarea datelor
    cacheService.delete("inventory_optimizer_stats", { namespace: "inventory" });
    loadInventoryStats();
    setOptimizationProgress(0);
  };

  // Funcție pentru a formata valoarea monetară
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Funcție pentru a obține culoarea pentru impact
  const getImpactColor = (impact: "high" | "medium" | "low") => {
    switch (impact) {
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

  // Funcție pentru a obține iconul pentru tipul de sugestie
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "reorder":
        return <Truck className="h-5 w-5 text-blue-500" />;
      case "excess":
        return <Package className="h-5 w-5 text-purple-500" />;
      case "supplier":
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case "category":
        return <ArrowDownUp className="h-5 w-5 text-orange-500" />;
      case "location":
        return <Calendar className="h-5 w-5 text-indigo-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center">
              <Zap className="mr-2 h-5 w-5 text-primary" />
              {t("inventory.optimizer.title", "Optimizator de inventar")}
            </CardTitle>
            <CardDescription>
              {t(
                "inventory.optimizer.description",
                "Analizează și optimizează inventarul pentru a reduce costurile și a îmbunătăți eficiența"
              )}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("inventory.optimizer.refresh", "Reîmprospătează")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="overview">
              <BarChart2 className="h-4 w-4 mr-2" />
              {t("inventory.optimizer.overview", "Prezentare generală")}
            </TabsTrigger>
            <TabsTrigger value="suggestions">
              <TrendingUp className="h-4 w-4 mr-2" />
              {t("inventory.optimizer.suggestions", "Sugestii de optimizare")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
                <p>{t("inventory.optimizer.loading", "Se încarcă statisticile...")}</p>
              </div>
            ) : stats ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {t("inventory.optimizer.totalItems", "Total materiale")}
                          </p>
                          <h3 className="text-2xl font-bold">{stats.totalItems}</h3>
                        </div>
                        <Package className="h-8 w-8 text-primary opacity-80" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {t("inventory.optimizer.totalValue", "Valoare totală")}
                          </p>
                          <h3 className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</h3>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-500 opacity-80" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {t("inventory.optimizer.turnoverDays", "Zile de rotație")}
                          </p>
                          <h3 className="text-2xl font-bold">{Math.round(stats.averageTurnoverDays)}</h3>
                        </div>
                        <Calendar className="h-8 w-8 text-blue-500 opacity-80" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">
                        {t("inventory.optimizer.stockStatus", "Starea stocului")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">
                              {t("inventory.optimizer.lowStock", "Stoc scăzut")}
                            </span>
                            <span className="text-sm font-medium text-red-600">
                              {stats.lowStockItems} {t("inventory.optimizer.items", "materiale")}
                            </span>
                          </div>
                          <Progress
                            value={(stats.lowStockItems / stats.totalItems) * 100}
                            className="h-2 bg-red-100"
                            indicatorClassName="bg-red-600"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">
                              {t("inventory.optimizer.excessStock", "Stoc în exces")}
                            </span>
                            <span className="text-sm font-medium text-yellow-600">
                              {stats.excessStockItems} {t("inventory.optimizer.items", "materiale")}
                            </span>
                          </div>
                          <Progress
                            value={(stats.excessStockItems / stats.totalItems) * 100}
                            className="h-2 bg-yellow-100"
                            indicatorClassName="bg-yellow-600"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">
                              {t("inventory.optimizer.optimalStock", "Stoc optim")}
                            </span>
                            <span className="text-sm font-medium text-green-600">
                              {stats.totalItems - stats.lowStockItems - stats.excessStockItems}{" "}
                              {t("inventory.optimizer.items", "materiale")}
                            </span>
                          </div>
                          <Progress
                            value={
                              ((stats.totalItems - stats.lowStockItems - stats.excessStockItems) /
                                stats.totalItems) *
                              100
                            }
                            className="h-2 bg-green-100"
                            indicatorClassName="bg-green-600"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">
                        {t("inventory.optimizer.topCategories", "Categorii principale")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {stats.topCategories.map((category, index) => (
                          <div key={index}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">{category.category}</span>
                              <span className="text-sm font-medium">
                                {category.count} {t("inventory.optimizer.items", "materiale")}
                              </span>
                            </div>
                            <Progress
                              value={(category.count / stats.totalItems) * 100}
                              className="h-2"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertTitle>
                    {t("inventory.optimizer.optimizationTip", "Sfat de optimizare")}
                  </AlertTitle>
                  <AlertDescription>
                    {t(
                      "inventory.optimizer.optimizationTipText",
                      "Reducerea stocului în exces și reaprovizionarea materialelor cu stoc scăzut poate îmbunătăți semnificativ eficiența inventarului."
                    )}
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <AlertTriangle className="h-8 w-8 text-yellow-500 mb-4" />
                <p>
                  {t(
                    "inventory.optimizer.noData",
                    "Nu există date disponibile pentru analiză. Adăugați materiale în inventar pentru a vedea statistici."
                  )}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="suggestions">
            {optimizationProgress < 100 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-full max-w-md mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">
                      {t("inventory.optimizer.analyzing", "Analizarea inventarului")}
                    </span>
                    <span className="text-sm font-medium">{optimizationProgress}%</span>
                  </div>
                  <Progress value={optimizationProgress} className="h-2" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "inventory.optimizer.analyzingDescription",
                    "Se analizează datele de inventar pentru a genera sugestii de optimizare..."
                  )}
                </p>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="overflow-hidden">
                    <div
                      className={`h-1 w-full ${
                        suggestion.impact === "high"
                          ? "bg-red-500"
                          : suggestion.impact === "medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    />
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {getSuggestionIcon(suggestion.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{suggestion.title}</h4>
                            <Badge
                              variant="outline"
                              className={getImpactColor(suggestion.impact)}
                            >
                              {suggestion.impact === "high"
                                ? t("inventory.optimizer.highImpact", "Impact ridicat")
                                : suggestion.impact === "medium"
                                ? t("inventory.optimizer.mediumImpact", "Impact mediu")
                                : t("inventory.optimizer.lowImpact", "Impact scăzut")}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {suggestion.description}
                          </p>
                          {suggestion.savings && (
                            <div className="flex items-center text-sm text-green-600 mb-2">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {t("inventory.optimizer.potentialSavings", "Economii potențiale")}:{" "}
                              {formatCurrency(suggestion.savings)}
                            </div>
                          )}
                          {suggestion.materials && suggestion.materials.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {suggestion.materials.slice(0, 3).map((material, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {material}
                                </Badge>
                              ))}
                              {suggestion.materials.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{suggestion.materials.length - 3} {t("inventory.optimizer.more", "mai multe")}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <CheckCircle2 className="h-8 w-8 text-green-500 mb-4" />
                <p>
                  {t(
                    "inventory.optimizer.noSuggestions",
                    "Nu există sugestii de optimizare în acest moment. Inventarul pare să fie bine gestionat!"
                  )}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <p className="text-sm text-muted-foreground">
          {t(
            "inventory.optimizer.footer",
            "Analizele și sugestiile sunt generate automat pe baza datelor de inventar actuale. Actualizați inventarul pentru rezultate mai precise."
          )}
        </p>
      </CardFooter>
    </Card>
  );
};

export default InventoryOptimizer;
