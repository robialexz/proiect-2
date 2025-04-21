import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { inventoryService } from "@/lib/inventory-service";
import { Material, LowStockItem } from "@/types";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Clock,
  BarChart2,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Download,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { EmptyState } from "@/components/common/EmptyState";
import { MaterialCard } from "@/components/inventory/MaterialCard";
import { LowStockCard } from "@/components/inventory/LowStockCard";
import { RecentActivityCard } from "@/components/inventory/RecentActivityCard";
import { InventoryStats } from "@/components/inventory/InventoryStats";

const InventoryOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();

  const [recentMaterials, setRecentMaterials] = useState<Material[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [stats, setStats] = useState<{
    totalItems: number;
    totalValue: number;
    categoriesCount: number;
    lowStockCount: number;
  }>({
    totalItems: 0,
    totalValue: 0,
    categoriesCount: 0,
    lowStockCount: 0,
  });

  const [loading, setLoading] = useState({
    recentMaterials: true,
    lowStockItems: true,
    recentActivity: true,
    stats: true,
  });

  const [error, setError] = useState<string | null>(null);

  // Funcție pentru a încărca materialele recente
  const loadRecentMaterials = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, recentMaterials: true }));

      const { data, error } = await inventoryService.getItems({
        orderBy: { column: "created_at", ascending: false },
        pageSize: 5,
      });

      if (error) throw new Error(error.message);

      setRecentMaterials(data || []);
    } catch (err: any) {
      // Removed console statement
      setError(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, recentMaterials: false }));
    }
  }, []);

  // Funcție pentru a încărca materialele cu stoc scăzut
  const loadLowStockItems = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, lowStockItems: true }));

      const { data, error } = await inventoryService.getLowStockItems();

      if (error) throw new Error(error.message);

      setLowStockItems(data || []);
    } catch (err: any) {
      // Removed console statement
      setError(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, lowStockItems: false }));
    }
  }, []);

  // Funcție pentru a încărca activitatea recentă
  const loadRecentActivity = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, recentActivity: true }));

      // Aici ar trebui să fie o implementare reală pentru a obține activitatea recentă
      // Pentru moment, vom folosi date simulate
      const mockActivity = [
        {
          id: "1",
          type: "update",
          description: 'Material "Ciment" actualizat',
          user: "John Doe",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minute în urmă
        },
        {
          id: "2",
          type: "create",
          description: 'Material nou "Cărămidă" adăugat',
          user: "Jane Smith",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 ore în urmă
        },
        {
          id: "3",
          type: "delete",
          description: 'Material "Nisip" șters',
          user: "Mike Johnson",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 ore în urmă
        },
      ];

      setRecentActivity(mockActivity);
    } catch (err: any) {
      // Removed console statement
      setError(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, recentActivity: false }));
    }
  }, []);

  // Funcție pentru a încărca statisticile
  const loadStats = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, stats: true }));

      // Obținem toate materialele pentru a calcula statisticile
      const { data, error } = await inventoryService.getItems();

      if (error) throw new Error(error.message);

      const materials = data || [];

      // Calculăm statisticile
      const totalItems = materials.length;
      const totalValue = materials.reduce((sum, item) => {
        const quantity = item.quantity || 0;
        const costPerUnit = item.cost_per_unit || 0;
        return sum + quantity * costPerUnit;
      }, 0);

      // Obținem categoriile unice
      const categories = new Set(
        materials.map((item) => item.category).filter(Boolean)
      );
      const categoriesCount = categories.size;

      // Obținem numărul de materiale cu stoc scăzut
      const lowStockCount = materials.filter(
        (item) => item.min_stock_level && item.quantity < item.min_stock_level
      ).length;

      setStats({
        totalItems,
        totalValue,
        categoriesCount,
        lowStockCount,
      });
    } catch (err: any) {
      // Removed console statement
      setError(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, stats: false }));
    }
  }, []);

  // Încărcăm datele la montarea componentei
  useEffect(() => {
    if (user) {
      loadRecentMaterials();
      loadLowStockItems();
      loadRecentActivity();
      loadStats();
    }
  }, [
    user,
    loadRecentMaterials,
    loadLowStockItems,
    loadRecentActivity,
    loadStats,
  ]);

  // Funcție pentru a reîmprospăta datele
  const handleRefresh = () => {
    loadRecentMaterials();
    loadLowStockItems();
    loadRecentActivity();
    loadStats();

    toast({
      title: t("inventory.refreshed", "Inventar reîmprospătat"),
      description: t(
        "inventory.refreshedDescription",
        "Datele au fost actualizate cu succes"
      ),
    });
  };

  // Funcție pentru a naviga la pagina de management al inventarului
  const handleViewAllMaterials = () => {
    navigate("/inventory-management");
  };

  // Funcție pentru a naviga la pagina de adăugare a unui material nou
  const handleAddMaterial = () => {
    navigate("/inventory-management/add");
  };

  // Funcție pentru a exporta inventarul
  const handleExportInventory = async (format: "csv" | "json" = "csv") => {
    try {
      const { data, error } = await inventoryService.exportInventory(format);

      if (error) throw new Error(error.message);

      if (data) {
        // Creăm un URL pentru blob și descărcăm fișierul
        const url = URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = url;
        a.download = `inventory-export-${
          new Date().toISOString().split("T")[0]
        }.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: t("inventory.exported", "Inventar exportat"),
          description: t(
            "inventory.exportedDescription",
            "Inventarul a fost exportat cu succes"
          ),
        });
      }
    } catch (err: any) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t("inventory.exportFailed", "Eroare la exportare"),
        description: err.message,
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title={t(
          "inventory.overview.title",
          "Prezentare generală a inventarului"
        )}
        description={t(
          "inventory.overview.description",
          "Vizualizați statistici și informații despre inventar"
        )}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("common.refresh", "Reîmprospătare")}
            </Button>
            <Button variant="default" size="sm" onClick={handleAddMaterial}>
              <Plus className="h-4 w-4 mr-2" />
              {t("inventory.addMaterial", "Adaugă material")}
            </Button>
          </div>
        }
      />

      {/* Statistici */}
      <InventoryStats stats={stats} loading={loading.stats} />

      {/* Conținut principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Materiale recente */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Package className="h-5 w-5 mr-2 text-blue-500" />
              {t("inventory.recentMaterials", "Materiale recente")}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleViewAllMaterials}>
              {t("common.viewAll", "Vezi toate")}
            </Button>
          </CardHeader>
          <CardContent>
            {loading.recentMaterials ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentMaterials.length === 0 ? (
              <EmptyState
                icon={<Package className="h-10 w-10 text-muted-foreground" />}
                title={t("inventory.noMaterials", "Nu există materiale")}
                description={t(
                  "inventory.noMaterialsDescription",
                  "Nu există materiale în inventar. Adăugați materiale pentru a le vedea aici."
                )}
                action={
                  <Button onClick={handleAddMaterial}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("inventory.addMaterial", "Adaugă material")}
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                {recentMaterials.map((material) => (
                  <MaterialCard key={material.id} material={material} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Materiale cu stoc scăzut */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              {t("inventory.lowStock", "Stoc scăzut")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading.lowStockItems ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : lowStockItems.length === 0 ? (
              <div className="text-center py-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-sm font-medium">
                  {t("inventory.allStockGood", "Toate stocurile sunt bune")}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t(
                    "inventory.noLowStockItems",
                    "Nu există materiale cu stoc scăzut"
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockItems.map((item) => (
                  <LowStockCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activitate recentă și acțiuni rapide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Activitate recentă */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Clock className="h-5 w-5 mr-2 text-purple-500" />
              {t("inventory.recentActivity", "Activitate recentă")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading.recentActivity ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
                  <Clock className="h-6 w-6 text-slate-600" />
                </div>
                <h3 className="text-sm font-medium">
                  {t("inventory.noRecentActivity", "Nicio activitate recentă")}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t(
                    "inventory.noRecentActivityDescription",
                    "Nu există activitate recentă în inventar"
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <RecentActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acțiuni rapide */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              {t("inventory.quickActions", "Acțiuni rapide")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleAddMaterial}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("inventory.addMaterial", "Adaugă material")}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/inventory-management?filter=lowStock")}
            >
              <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
              {t("inventory.viewLowStock", "Vezi stoc scăzut")}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/inventory-management/search")}
            >
              <Search className="h-4 w-4 mr-2" />
              {t("inventory.searchInventory", "Caută în inventar")}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/inventory-management/categories")}
            >
              <Filter className="h-4 w-4 mr-2" />
              {t("inventory.filterByCategory", "Filtrează după categorie")}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleExportInventory("csv")}
            >
              <Download className="h-4 w-4 mr-2" />
              {t("inventory.exportToCSV", "Exportă în CSV")}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/reports/inventory")}
            >
              <FileText className="h-4 w-4 mr-2" />
              {t("inventory.generateReport", "Generează raport")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryOverviewPage;
