import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Search, FileText, BarChart, Download, RefreshCw } from "lucide-react";
import { SupplierOrdersReport } from "@/components/reports/SupplierOrdersReport";

const ReportsPageNew: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("supplier-orders");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
      <Helmet>
        <title>{t("reports.pageTitle", "Reports & Analytics")}</title>
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("reports.title", "Reports & Analytics")}
            </h1>
            <p className="text-muted-foreground">
              {t("reports.subtitle", "View and analyze data from your projects")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder={t("reports.search", "Search reports...")}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {t("reports.export", "Export")}
            </Button>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("reports.refresh", "Refresh")}
            </Button>
          </div>
        </div>

        <Separator />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="supplier-orders">
              <FileText className="h-4 w-4 mr-2" />
              {t("reports.supplierOrders.tab", "Supplier Orders")}
            </TabsTrigger>
            <TabsTrigger value="inventory">
              <BarChart className="h-4 w-4 mr-2" />
              {t("reports.inventory.tab", "Inventory")}
            </TabsTrigger>
            <TabsTrigger value="projects">
              <FileText className="h-4 w-4 mr-2" />
              {t("reports.projects.tab", "Projects")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="supplier-orders" className="mt-6">
            <SupplierOrdersReport />
          </TabsContent>

          <TabsContent value="inventory" className="mt-6">
            <div className="flex flex-col items-center justify-center h-64 border rounded-md">
              <FileText className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-lg font-medium">
                {t("reports.comingSoon", "Coming Soon")}
              </p>
              <p className="text-sm text-gray-500">
                {t(
                  "reports.inventory.comingSoonDescription",
                  "Inventory reports will be available in a future update"
                )}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="mt-6">
            <div className="flex flex-col items-center justify-center h-64 border rounded-md">
              <FileText className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-lg font-medium">
                {t("reports.comingSoon", "Coming Soon")}
              </p>
              <p className="text-sm text-gray-500">
                {t(
                  "reports.projects.comingSoonDescription",
                  "Project reports will be available in a future update"
                )}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ReportsPageNew;
