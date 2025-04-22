import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  Search, Filter, RefreshCw, Plus, Calendar, ArrowUpDown, ExternalLink,
  Download, BarChart, ListFilter, FileText, Clock, AlertCircle, CheckCircle, Timer
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Tipuri de date
interface Auction {
  id: string;
  title: string;
  organization: string;
  category: string;
  startDate: string;
  endDate: string;
  estimatedValue: string;
  status: "active" | "upcoming" | "closed";
  url: string;
}

const AuctionsPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [filteredAuctions, setFilteredAuctions] = useState<Auction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortColumn, setSortColumn] = useState<keyof Auction>("endDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Date de exemplu
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Simulăm un delay pentru a arăta loading state
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Date de exemplu
        const sampleAuctions: Auction[] = [
          {
            id: "1",
            title: "Construcție clădire administrativă",
            organization: "Primăria Municipiului București",
            category: "Construcții",
            startDate: "2023-10-15",
            endDate: "2023-11-15",
            estimatedValue: "5.500.000 RON",
            status: "active",
            url: "https://e-licitatie.ro/pub/notices/c-notice/v2/view/100145234"
          },
          {
            id: "2",
            title: "Furnizare mobilier școlar",
            organization: "Inspectoratul Școlar Județean Ilfov",
            category: "Mobilier",
            startDate: "2023-10-20",
            endDate: "2023-11-20",
            estimatedValue: "850.000 RON",
            status: "active",
            url: "https://e-licitatie.ro/pub/notices/c-notice/v2/view/100145235"
          },
          {
            id: "3",
            title: "Reabilitare drumuri județene",
            organization: "Consiliul Județean Cluj",
            category: "Infrastructură",
            startDate: "2023-11-01",
            endDate: "2023-12-01",
            estimatedValue: "12.300.000 RON",
            status: "upcoming",
            url: "https://e-licitatie.ro/pub/notices/c-notice/v2/view/100145236"
          },
          {
            id: "4",
            title: "Modernizare sistem iluminat public",
            organization: "Primăria Sectorului 3",
            category: "Electricitate",
            startDate: "2023-09-15",
            endDate: "2023-10-15",
            estimatedValue: "3.200.000 RON",
            status: "closed",
            url: "https://e-licitatie.ro/pub/notices/c-notice/v2/view/100145237"
          },
          {
            id: "5",
            title: "Achiziție echipamente IT",
            organization: "Ministerul Educației",
            category: "IT&C",
            startDate: "2023-10-25",
            endDate: "2023-11-25",
            estimatedValue: "1.750.000 RON",
            status: "active",
            url: "https://e-licitatie.ro/pub/notices/c-notice/v2/view/100145238"
          },
          {
            id: "6",
            title: "Servicii de pază și protecție",
            organization: "Spitalul Județean de Urgență",
            category: "Servicii",
            startDate: "2023-11-10",
            endDate: "2023-12-10",
            estimatedValue: "980.000 RON",
            status: "upcoming",
            url: "https://e-licitatie.ro/pub/notices/c-notice/v2/view/100145239"
          },
          {
            id: "7",
            title: "Construcție complex sportiv",
            organization: "Primăria Municipiului Constanța",
            category: "Construcții",
            startDate: "2023-09-01",
            endDate: "2023-10-01",
            estimatedValue: "8.500.000 RON",
            status: "closed",
            url: "https://e-licitatie.ro/pub/notices/c-notice/v2/view/100145240"
          }
        ];

        setAuctions(sampleAuctions);
        setFilteredAuctions(sampleAuctions);
      } catch (error) {
        toast({
          variant: "destructive",
          title: t("auctions.error.title", "Eroare"),
          description: t("auctions.error.description", "Nu s-au putut încărca datele. Încercați din nou."),
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [t, toast]);

  // Filtrare și sortare
  useEffect(() => {
    let result = [...auctions];

    // Filtrare după termen de căutare
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        a =>
          a.title.toLowerCase().includes(term) ||
          a.organization.toLowerCase().includes(term) ||
          a.category.toLowerCase().includes(term)
      );
    }

    // Filtrare după status
    if (statusFilter !== "all") {
      result = result.filter(a => a.status === statusFilter);
    }

    // Filtrare după categorie
    if (categoryFilter !== "all") {
      result = result.filter(a => a.category === categoryFilter);
    }

    // Sortare
    result.sort((a, b) => {
      const valueA = a[sortColumn];
      const valueB = b[sortColumn];

      if (valueA === valueB) return 0;

      const compareResult = valueA < valueB ? -1 : 1;
      return sortDirection === "asc" ? compareResult : -compareResult;
    });

    setFilteredAuctions(result);
  }, [auctions, searchTerm, statusFilter, categoryFilter, sortColumn, sortDirection]);

  // Funcție pentru a schimba sortarea
  const handleSort = (column: keyof Auction) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Funcție pentru a reîmprospăta datele
  const handleRefresh = () => {
    setLoading(true);

    // Simulăm un delay pentru a arăta loading state
    setTimeout(() => {
      setLoading(false);

      toast({
        title: t("auctions.refresh.success", "Date actualizate"),
        description: t("auctions.refresh.successDescription", "Datele au fost actualizate cu succes."),
      });
    }, 1000);
  };

  // Funcție pentru a reseta filtrele
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
  };

  // Funcție pentru a deschide URL-ul licitației
  const openAuctionUrl = (url: string) => {
    window.open(url, "_blank");
  };

  // Funcție pentru a formata data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ro-RO").format(date);
  };

  // Component pentru timeline
  const AuctionTimeline = ({ auctions }: { auctions: Auction[] }) => {
    // Sortăm licitațiile după data de început
    const sortedAuctions = [...auctions].sort((a, b) => {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    return (
      <div className="relative mt-6 ml-4">
        {/* Linia verticală */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700"></div>

        {/* Evenimentele */}
        <div className="space-y-8">
          {sortedAuctions.map((auction) => {
            // Determinăm culoarea în funcție de status
            let statusColor = "bg-slate-400";
            let statusIcon = <Clock className="h-4 w-4" />;

            if (auction.status === "active") {
              statusColor = "bg-green-500";
              statusIcon = <Timer className="h-4 w-4" />;
            } else if (auction.status === "upcoming") {
              statusColor = "bg-amber-500";
              statusIcon = <AlertCircle className="h-4 w-4" />;
            } else if (auction.status === "closed") {
              statusColor = "bg-slate-500";
              statusIcon = <CheckCircle className="h-4 w-4" />;
            }

            return (
              <div key={auction.id} className="relative pl-6">
                {/* Punctul de pe timeline */}
                <div className={`absolute left-[-8px] top-1.5 h-4 w-4 rounded-full ${statusColor} flex items-center justify-center`}>
                  <div className="h-2 w-2 rounded-full bg-white"></div>
                </div>

                {/* Conținutul evenimentului */}
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{auction.title}</h4>
                    <Badge variant={getStatusBadgeVariant(auction.status) as any}>
                      {translateStatus(auction.status)}
                    </Badge>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(auction.startDate)} - {formatDate(auction.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span>{auction.organization}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium">{auction.estimatedValue}</span>
                    <AnimatedButton
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => openAuctionUrl(auction.url)}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      <span className="text-xs">{t("auctions.view", "Vezi")}</span>
                    </AnimatedButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Funcție pentru a obține culoarea badge-ului în funcție de status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "upcoming":
        return "warning";
      case "closed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Funcție pentru a traduce statusul
  const translateStatus = (status: string) => {
    switch (status) {
      case "active":
        return t("auctions.status.active", "Activă");
      case "upcoming":
        return t("auctions.status.upcoming", "Viitoare");
      case "closed":
        return t("auctions.status.closed", "Închisă");
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("auctions.title", "Licitații Curente")}
          </h1>
          <p className="text-muted-foreground">
            {t("auctions.description", "Monitorizați și participați la licitații publice")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AnimatedButton variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {t("common.refresh", "Reîmprospătează")}
          </AnimatedButton>
          <AnimatedButton size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("auctions.addNotification", "Adaugă Notificare")}
          </AnimatedButton>
        </div>
      </div>

      <Separator />

      {/* Filtre */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("common.search", "Caută...")}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder={t("auctions.selectStatus", "Selectează statusul")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all", "Toate")}</SelectItem>
            <SelectItem value="active">{t("auctions.status.active", "Active")}</SelectItem>
            <SelectItem value="upcoming">{t("auctions.status.upcoming", "Viitoare")}</SelectItem>
            <SelectItem value="closed">{t("auctions.status.closed", "Închise")}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder={t("auctions.selectCategory", "Selectează categoria")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all", "Toate")}</SelectItem>
            <SelectItem value="Construcții">Construcții</SelectItem>
            <SelectItem value="Infrastructură">Infrastructură</SelectItem>
            <SelectItem value="IT&C">IT&C</SelectItem>
            <SelectItem value="Mobilier">Mobilier</SelectItem>
            <SelectItem value="Electricitate">Electricitate</SelectItem>
            <SelectItem value="Servicii">Servicii</SelectItem>
          </SelectContent>
        </Select>

        <AnimatedButton variant="outline" onClick={resetFilters}>
          <Filter className="mr-2 h-4 w-4" />
          {t("common.resetFilters", "Resetează filtrele")}
        </AnimatedButton>
      </div>

      {/* Tabel licitații */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("auctions.activeAuctions", "Licitații Active")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auctions.filter(a => a.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("auctions.activeAuctionsDescription", "Licitații în desfășurare la care puteți participa")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("auctions.upcomingAuctions", "Licitații Viitoare")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auctions.filter(a => a.status === "upcoming").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("auctions.upcomingAuctionsDescription", "Licitații care urmează să înceapă în curând")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("auctions.closedAuctions", "Licitații Închise")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auctions.filter(a => a.status === "closed").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("auctions.closedAuctionsDescription", "Licitații finalizate în ultimele 30 de zile")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("auctions.totalValue", "Valoare Totală")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auctions.filter(a => a.status === "active").reduce((sum, auction) => {
                const value = parseFloat(auction.estimatedValue.replace(/[^0-9]/g, ''));
                return sum + (isNaN(value) ? 0 : value);
              }, 0).toLocaleString('ro-RO')} RON
            </div>
            <p className="text-xs text-muted-foreground">
              {t("auctions.totalValueDescription", "Valoarea estimată a licitațiilor active")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="table" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="table">
              <ListFilter className="h-4 w-4 mr-2" />
              {t("auctions.tableView", "Tabel")}
            </TabsTrigger>
            <TabsTrigger value="timeline">
              <Clock className="h-4 w-4 mr-2" />
              {t("auctions.timelineView", "Cronologie")}
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <AnimatedButton variant="outline" size="sm" onClick={() => {
              // Funcție pentru exportul datelor în CSV
              const headers = ["Titlu", "Organizație", "Categorie", "Data Început", "Data Închidere", "Valoare Estimată", "Status"];
              const rows = filteredAuctions.map(a => [
                a.title,
                a.organization,
                a.category,
                formatDate(a.startDate),
                formatDate(a.endDate),
                a.estimatedValue,
                translateStatus(a.status)
              ]);

              const csvContent = [
                headers.join(","),
                ...rows.map(row => row.join(","))
              ].join("\n");

              const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute("download", `licitatii_${new Date().toISOString().split("T")[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

              toast({
                title: t("auctions.export.success", "Export reușit"),
                description: t("auctions.export.successDescription", "Datele au fost exportate cu succes în format CSV."),
              });
            }}>
              <Download className="h-4 w-4 mr-2" />
              {t("common.exportCSV", "Exportă CSV")}
            </AnimatedButton>
          </div>
        </div>

        <TabsContent value="table" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>{t("auctions.list", "Lista Licitațiilor")}</CardTitle>
              <CardDescription>
                {t("auctions.count", "Total: {{count}} licitații", { count: filteredAuctions.length })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() => handleSort("title")}
                        >
                          {t("auctions.title", "Titlu")}
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() => handleSort("organization")}
                        >
                          {t("auctions.organization", "Organizație")}
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() => handleSort("category")}
                        >
                          {t("auctions.category", "Categorie")}
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() => handleSort("endDate")}
                        >
                          {t("auctions.endDate", "Data Închidere")}
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() => handleSort("estimatedValue")}
                        >
                          {t("auctions.estimatedValue", "Valoare Estimată")}
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() => handleSort("status")}
                        >
                          {t("auctions.status.title", "Status")}
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="text-right">
                        {t("common.actions", "Acțiuni")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                          <div className="mt-2">{t("common.loading", "Se încarcă...")}</div>
                        </TableCell>
                      </TableRow>
                    ) : filteredAuctions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Calendar className="h-8 w-8 mb-2" />
                            <p>{t("auctions.noAuctionsFound", "Nu s-au găsit licitații")}</p>
                            <p className="text-sm">
                              {t("auctions.tryChangingFilters", "Încercați să schimbați filtrele")}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAuctions.map((auction) => (
                        <TableRow key={auction.id}>
                          <TableCell className="font-medium">{auction.title}</TableCell>
                          <TableCell>{auction.organization}</TableCell>
                          <TableCell>{auction.category}</TableCell>
                          <TableCell>{formatDate(auction.endDate)}</TableCell>
                          <TableCell>{auction.estimatedValue}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(auction.status) as any}>
                              {translateStatus(auction.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <AnimatedButton
                              variant="outline"
                              size="sm"
                              onClick={() => openAuctionUrl(auction.url)}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              {t("auctions.view", "Vezi")}
                            </AnimatedButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>{t("auctions.timeline", "Cronologia Licitațiilor")}</CardTitle>
              <CardDescription>
                {t("auctions.timelineDescription", "Vizualizare cronologică a licitațiilor")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                  <div className="mt-2">{t("common.loading", "Se încarcă...")}</div>
                </div>
              ) : filteredAuctions.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                  <Calendar className="h-8 w-8 mb-2" />
                  <p>{t("auctions.noAuctionsFound", "Nu s-au găsit licitații")}</p>
                  <p className="text-sm">
                    {t("auctions.tryChangingFilters", "Încercați să schimbați filtrele")}
                  </p>
                </div>
              ) : (
                <AuctionTimeline auctions={filteredAuctions} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog pentru adăugare notificare */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {t("auctions.addNotification", "Adaugă Notificare")}
            </DialogTitle>
            <DialogDescription>
              {t("auctions.addNotificationDescription", "Configurați notificări pentru licitații care vă interesează")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="keywords" className="text-right">
                {t("auctions.keywords", "Cuvinte cheie")}
              </label>
              <Input
                id="keywords"
                placeholder={t("auctions.keywordsPlaceholder", "ex: construcții, drumuri")}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="category" className="text-right">
                {t("auctions.category", "Categorie")}
              </label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t("auctions.selectCategory", "Selectează categoria")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all", "Toate")}</SelectItem>
                  <SelectItem value="Construcții">Construcții</SelectItem>
                  <SelectItem value="Infrastructură">Infrastructură</SelectItem>
                  <SelectItem value="IT&C">IT&C</SelectItem>
                  <SelectItem value="Mobilier">Mobilier</SelectItem>
                  <SelectItem value="Electricitate">Electricitate</SelectItem>
                  <SelectItem value="Servicii">Servicii</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="minValue" className="text-right">
                {t("auctions.minValue", "Valoare minimă")}
              </label>
              <Input
                id="minValue"
                type="number"
                placeholder="RON"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <AnimatedButton variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t("common.cancel", "Anulează")}
            </AnimatedButton>
            <AnimatedButton onClick={() => {
              toast({
                title: t("auctions.notificationAdded", "Notificare adăugată"),
                description: t("auctions.notificationAddedDescription", "Veți primi notificări pentru licitațiile care corespund criteriilor"),
              });
              setIsAddDialogOpen(false);
            }}>
              {t("common.save", "Salvează")}
            </AnimatedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuctionsPage;
