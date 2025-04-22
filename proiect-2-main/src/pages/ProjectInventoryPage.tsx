import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Package,
  Plus,
  FileDown,
  Upload,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Filter,
  RefreshCw,
  ArrowUpDown,
  Warehouse,
  BarChart4,
  AlertCircle,
} from "lucide-react";

// Tipuri de date
interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  location?: string;
  min_stock_level?: number;
  max_stock_level?: number;
  project_id?: string;
  supplier_id?: string;
  cost_per_unit?: number;
  last_updated?: string;
}

interface Project {
  id: string;
  name: string;
  code: string;
}

// Componenta principală
const ProjectInventoryPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sortColumn, setSortColumn] = useState<keyof Material>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  // Date de exemplu pentru proiecte
  const sampleProjects: Project[] = [
    { id: "proj-1", name: "Clădire de birouri", code: "CB-2023" },
    { id: "proj-2", name: "Complex rezidențial", code: "CR-2023" },
    { id: "proj-3", name: "Renovare spital", code: "RS-2023" },
    { id: "proj-4", name: "Extindere mall", code: "EM-2023" },
  ];

  // Date de exemplu pentru materiale
  const sampleMaterials: Material[] = Array.from({ length: 20 }).map((_, index) => ({
    id: `mat-${index + 1}`,
    name: `Material ${index + 1}`,
    quantity: Math.floor(Math.random() * 100) + 1,
    unit: index % 2 === 0 ? "buc" : "kg",
    category: `Categoria ${(index % 5) + 1}`,
    location: `Locația ${String.fromCharCode(65 + (index % 8))}`,
    min_stock_level: Math.floor(Math.random() * 20),
    max_stock_level: Math.floor(Math.random() * 50) + 50,
    project_id: sampleProjects[index % sampleProjects.length].id,
    supplier_id: `supp-${(index % 3) + 1}`,
    cost_per_unit: Math.floor(Math.random() * 1000) / 10,
    last_updated: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
  }));

  // Încărcăm datele la inițializare
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Simulăm un delay pentru a arăta loading state
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Setăm proiectele
        setProjects(sampleProjects);

        // Setăm materialele
        setMaterials(sampleMaterials);
        setFilteredMaterials(sampleMaterials);

        // Extragem categoriile unice
        const uniqueCategories = [...new Set(sampleMaterials.map(m => m.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        toast({
          variant: "destructive",
          title: t("inventory.error.title", "Eroare"),
          description: t("inventory.error.description", "Nu s-au putut încărca datele. Încercați din nou."),
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [t, toast]);

  // Filtrăm materialele când se schimbă criteriile de filtrare
  useEffect(() => {
    let result = [...materials];

    // Filtrare după termen de căutare
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        m =>
          m.name.toLowerCase().includes(term) ||
          m.category.toLowerCase().includes(term) ||
          (m.location && m.location.toLowerCase().includes(term))
      );
    }

    // Filtrare după categorie
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter(m => m.category === selectedCategory);
    }

    // Filtrare după proiect
    if (selectedProject && selectedProject !== "all") {
      result = result.filter(m => m.project_id === selectedProject);
    }

    // Sortare
    result.sort((a, b) => {
      const valueA = a[sortColumn];
      const valueB = b[sortColumn];

      if (valueA === valueB) return 0;

      const compareResult = valueA < valueB ? -1 : 1;
      return sortDirection === "asc" ? compareResult : -compareResult;
    });

    setFilteredMaterials(result);
  }, [materials, searchTerm, selectedCategory, selectedProject, sortColumn, sortDirection]);

  // Funcție pentru a schimba sortarea
  const handleSort = (column: keyof Material) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Funcție pentru a adăuga un material nou
  const handleAddMaterial = () => {
    setIsAddDialogOpen(true);
  };

  // Funcție pentru a edita un material
  const handleEditMaterial = (material: Material) => {
    setSelectedMaterial(material);
    setIsAddDialogOpen(true);
  };

  // Funcție pentru a șterge un material
  const handleDeleteMaterial = (material: Material) => {
    setSelectedMaterial(material);
    setIsDeleteDialogOpen(true);
  };

  // Funcție pentru a confirma ștergerea
  const confirmDelete = () => {
    if (!selectedMaterial) return;

    // Ștergem materialul din listă
    setMaterials(prev => prev.filter(m => m.id !== selectedMaterial.id));

    toast({
      title: t("inventory.delete.success", "Material șters"),
      description: t("inventory.delete.successDescription", "Materialul a fost șters cu succes."),
    });

    setIsDeleteDialogOpen(false);
    setSelectedMaterial(null);
  };

  // Funcție pentru a exporta datele
  const handleExport = () => {
    toast({
      title: t("inventory.export.success", "Export reușit"),
      description: t("inventory.export.successDescription", "Datele au fost exportate cu succes."),
    });
  };

  // Funcție pentru a reîmprospăta datele
  const handleRefresh = () => {
    setLoading(true);

    // Simulăm un delay pentru a arăta loading state
    setTimeout(() => {
      setLoading(false);

      toast({
        title: t("inventory.refresh.success", "Date actualizate"),
        description: t("inventory.refresh.successDescription", "Datele au fost actualizate cu succes."),
      });
    }, 1000);
  };

  // Funcție pentru a reseta filtrele
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedProject("");
  };

  // Funcție pentru a formata data
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ro-RO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Funcție pentru a verifica stocul scăzut
  const isLowStock = (material: Material) => {
    return material.min_stock_level !== undefined && material.quantity < material.min_stock_level;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("inventory.projectInventory", "Inventar Proiect")}
          </h1>
          <p className="text-muted-foreground">
            {t("inventory.projectInventoryDescription", "Gestionează materialele asociate proiectelor")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/warehouse-inventory")}>
            <Warehouse className="mr-2 h-4 w-4" />
            {t("inventory.warehouseInventory", "Inventar Depozit")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" />
            {t("common.export", "Exportă")}
          </Button>
          <Button size="sm" onClick={handleAddMaterial}>
            <Plus className="mr-2 h-4 w-4" />
            {t("inventory.addMaterial", "Adaugă Material")}
          </Button>
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

        <div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder={t("inventory.selectCategory", "Selectează categoria")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("common.all", "Toate")}
              </SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger>
              <SelectValue placeholder={t("inventory.selectProject", "Selectează proiectul")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("common.all", "Toate")}
              </SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name} ({project.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={resetFilters}>
            <Filter className="mr-2 h-4 w-4" />
            {t("common.resetFilters", "Resetează filtrele")}
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleRefresh}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {t("common.refresh", "Reîmprospătează")}
          </Button>
        </div>
      </div>

      {/* Conținut principal */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Tabel materiale */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>{t("inventory.materials", "Materiale")}</CardTitle>
            <CardDescription>
              {t("inventory.materialsCount", "Total: {{count}} materiale", { count: filteredMaterials.length })}
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
                        onClick={() => handleSort("name")}
                      >
                        {t("inventory.materialName", "Nume Material")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort("quantity")}
                      >
                        {t("inventory.quantity", "Cantitate")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort("category")}
                      >
                        {t("inventory.category", "Categorie")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort("location")}
                      >
                        {t("inventory.location", "Locație")}
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
                      <TableCell colSpan={5} className="h-24 text-center">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                        <div className="mt-2">{t("common.loading", "Se încarcă...")}</div>
                      </TableCell>
                    </TableRow>
                  ) : filteredMaterials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Package className="h-8 w-8 mb-2" />
                          <p>{t("inventory.noMaterialsFound", "Nu s-au găsit materiale")}</p>
                          <p className="text-sm">
                            {t("inventory.tryChangingFilters", "Încercați să schimbați filtrele sau să adăugați materiale noi")}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMaterials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{material.name}</span>
                            {isLowStock(material) && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AlertCircle className="h-4 w-4 ml-2 text-destructive" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{t("inventory.lowStock", "Stoc scăzut")}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={isLowStock(material) ? "destructive" : "secondary"}>
                            {material.quantity} {material.unit}
                          </Badge>
                        </TableCell>
                        <TableCell>{material.category}</TableCell>
                        <TableCell>{material.location}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>{t("common.actions", "Acțiuni")}</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEditMaterial(material)}>
                                <Edit className="h-4 w-4 mr-2" />
                                {t("common.edit", "Editează")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteMaterial(material)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t("common.delete", "Șterge")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Statistici */}
        <Card>
          <CardHeader>
            <CardTitle>{t("inventory.statistics", "Statistici")}</CardTitle>
            <CardDescription>
              {t("inventory.statisticsDescription", "Statistici despre inventar")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                {t("inventory.totalMaterials", "Total Materiale")}
              </h3>
              <p className="text-2xl font-bold">{filteredMaterials.length}</p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                {t("inventory.totalCategories", "Total Categorii")}
              </h3>
              <p className="text-2xl font-bold">{categories.length}</p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                {t("inventory.lowStockItems", "Materiale cu Stoc Scăzut")}
              </h3>
              <p className="text-2xl font-bold">
                {filteredMaterials.filter(m => isLowStock(m)).length}
              </p>
            </div>

            <Button variant="outline" className="w-full" onClick={() => navigate("/inventory-analytics")}>
              <BarChart4 className="mr-2 h-4 w-4" />
              {t("inventory.viewAnalytics", "Vezi Analiză Detaliată")}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Dialog pentru adăugare/editare material */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedMaterial
                ? t("inventory.editMaterial", "Editează Material")
                : t("inventory.addMaterial", "Adaugă Material")}
            </DialogTitle>
            <DialogDescription>
              {selectedMaterial
                ? t("inventory.editMaterialDescription", "Modifică detaliile materialului")
                : t("inventory.addMaterialDescription", "Completează detaliile pentru noul material")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                {t("inventory.materialName", "Nume")}
              </label>
              <Input
                id="name"
                defaultValue={selectedMaterial?.name || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="quantity" className="text-right">
                {t("inventory.quantity", "Cantitate")}
              </label>
              <Input
                id="quantity"
                type="number"
                defaultValue={selectedMaterial?.quantity || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="unit" className="text-right">
                {t("inventory.unit", "Unitate")}
              </label>
              <Input
                id="unit"
                defaultValue={selectedMaterial?.unit || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="category" className="text-right">
                {t("inventory.category", "Categorie")}
              </label>
              <Select defaultValue={selectedMaterial?.category}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t("inventory.selectCategory", "Selectează categoria")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="project" className="text-right">
                {t("inventory.project", "Proiect")}
              </label>
              <Select defaultValue={selectedMaterial?.project_id}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t("inventory.selectProject", "Selectează proiectul")} />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} ({project.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t("common.cancel", "Anulează")}
            </Button>
            <Button onClick={() => {
              toast({
                title: selectedMaterial
                  ? t("inventory.materialUpdated", "Material actualizat")
                  : t("inventory.materialAdded", "Material adăugat"),
                description: selectedMaterial
                  ? t("inventory.materialUpdatedDescription", "Materialul a fost actualizat cu succes")
                  : t("inventory.materialAddedDescription", "Materialul a fost adăugat cu succes"),
              });
              setIsAddDialogOpen(false);
              setSelectedMaterial(null);
            }}>
              {selectedMaterial
                ? t("common.save", "Salvează")
                : t("common.add", "Adaugă")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pentru confirmare ștergere */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("inventory.confirmDelete", "Confirmă ștergerea")}</DialogTitle>
            <DialogDescription>
              {t("inventory.confirmDeleteDescription", "Ești sigur că vrei să ștergi acest material? Această acțiune nu poate fi anulată.")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedMaterial && (
              <div className="p-4 border rounded-md bg-muted/50">
                <p className="font-medium">{selectedMaterial.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedMaterial.quantity} {selectedMaterial.unit} • {selectedMaterial.category}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t("common.cancel", "Anulează")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t("common.delete", "Șterge")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectInventoryPage;
