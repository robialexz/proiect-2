import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import {
  PlusCircle,
  Search,
  MoreHorizontal,
  Building,
  Phone,
  Mail,
  MapPin,
  Package,
  Star,
  Clock,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  rating: number;
  status: "active" | "inactive" | "pending";
  lastOrder: string;
  materialsCount: number;
}

const SuppliersPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    category: "",
  });

  // Sample suppliers data
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: "1",
      name: "Construct Materials SRL",
      contactPerson: "Ion Popescu",
      email: "contact@constructmaterials.ro",
      phone: "+40 721 234 567",
      address: "Str. Industriei 45, București",
      category: "Building Materials",
      rating: 4.8,
      status: "active",
      lastOrder: "2024-07-15",
      materialsCount: 124,
    },
    {
      id: "2",
      name: "ElectroTech SA",
      contactPerson: "Maria Ionescu",
      email: "office@electrotech.ro",
      phone: "+40 722 345 678",
      address: "Bd. Timișoara 102, București",
      category: "Electrical",
      rating: 4.5,
      status: "active",
      lastOrder: "2024-07-02",
      materialsCount: 87,
    },
    {
      id: "3",
      name: "Plumbing Pro SRL",
      contactPerson: "Alexandru Marin",
      email: "contact@plumbingpro.ro",
      phone: "+40 723 456 789",
      address: "Str. Meșteșugarilor 12, Cluj-Napoca",
      category: "Plumbing",
      rating: 4.2,
      status: "inactive",
      lastOrder: "2024-05-20",
      materialsCount: 56,
    },
    {
      id: "4",
      name: "Steel Solutions SA",
      contactPerson: "Cristian Dumitrescu",
      email: "office@steelsolutions.ro",
      phone: "+40 724 567 890",
      address: "Str. Metalurgiei 78, Galați",
      category: "Metals",
      rating: 4.7,
      status: "active",
      lastOrder: "2024-07-10",
      materialsCount: 93,
    },
    {
      id: "5",
      name: "Wood & More SRL",
      contactPerson: "Elena Popa",
      email: "contact@woodandmore.ro",
      phone: "+40 725 678 901",
      address: "Str. Forestierilor 34, Brașov",
      category: "Wood",
      rating: 4.4,
      status: "pending",
      lastOrder: "2024-06-28",
      materialsCount: 42,
    },
  ]);

  const handleCreateSupplier = () => {
    if (!newSupplier.name.trim() || !newSupplier.email.trim()) {
      toast({
        variant: "destructive",
        title: t("suppliers.errors.requiredFields", "Required fields missing"),
        description: t(
          "suppliers.errors.requiredFieldsDesc",
          "Please fill in all required fields",
        ),
      });
      return;
    }

    const newSupplierData: Supplier = {
      id: Date.now().toString(),
      name: newSupplier.name,
      contactPerson: newSupplier.contactPerson,
      email: newSupplier.email,
      phone: newSupplier.phone,
      address: "",
      category: newSupplier.category,
      rating: 0,
      status: "pending",
      lastOrder: "-",
      materialsCount: 0,
    };

    setSuppliers([newSupplierData, ...suppliers]);
    setNewSupplier({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      category: "",
    });
    setIsCreateDialogOpen(false);

    toast({
      title: t("suppliers.toasts.created", "Supplier Added"),
      description: t(
        "suppliers.toasts.createdDesc",
        "The supplier has been added successfully",
      ),
    });
  };

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "inactive":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return t("suppliers.status.active", "Active");
      case "inactive":
        return t("suppliers.status.inactive", "Inactive");
      case "pending":
        return t("suppliers.status.pending", "Pending");
      default:
        return status;
    }
  };

  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-slate-600"}`}
          />
        ))}
        <span className="ml-1 text-xs">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white">{t("common.loading", "Loading...")}</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-slate-900 text-white">

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {t("suppliers.title", "Suppliers")}
            </h1>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="search"
                  placeholder={t(
                    "suppliers.searchPlaceholder",
                    "Search suppliers...",
                  )}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full bg-slate-800 border-slate-700 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "" : "border-slate-700"}
                >
                  <svg
                    xmlns="{process.env.WWW_W3_ORG_2000_SVG}"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="7" height="7" x="3" y="3" rx="1" />
                    <rect width="7" height="7" x="14" y="3" rx="1" />
                    <rect width="7" height="7" x="3" y="14" rx="1" />
                    <rect width="7" height="7" x="14" y="14" rx="1" />
                  </svg>
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("table")}
                  className={viewMode === "table" ? "" : "border-slate-700"}
                >
                  <svg
                    xmlns="{process.env.WWW_W3_ORG_2000_SVG}"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M3 12h18" />
                    <path d="M3 18h18" />
                  </svg>
                </Button>
              </div>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  {t("suppliers.addButton", "Add Supplier")}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] bg-slate-800 border-slate-700 text-white">
                  <DialogHeader>
                    <DialogTitle>
                      {t("suppliers.addDialog.title", "Add New Supplier")}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                      {t(
                        "suppliers.addDialog.description",
                        "Fill in the supplier details below.",
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label
                        htmlFor="name"
                        className="text-right text-slate-400"
                      >
                        {t("suppliers.form.name", "Company Name")}*
                      </label>
                      <Input
                        id="name"
                        value={newSupplier.name}
                        onChange={(e) =>
                          setNewSupplier({
                            ...newSupplier,
                            name: e.target.value,
                          })
                        }
                        className="col-span-3 bg-slate-700 border-slate-600"
                        placeholder={t(
                          "suppliers.form.namePlaceholder",
                          "Enter company name",
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label
                        htmlFor="contactPerson"
                        className="text-right text-slate-400"
                      >
                        {t("suppliers.form.contactPerson", "Contact Person")}
                      </label>
                      <Input
                        id="contactPerson"
                        value={newSupplier.contactPerson}
                        onChange={(e) =>
                          setNewSupplier({
                            ...newSupplier,
                            contactPerson: e.target.value,
                          })
                        }
                        className="col-span-3 bg-slate-700 border-slate-600"
                        placeholder={t(
                          "suppliers.form.contactPersonPlaceholder",
                          "Enter contact person name",
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label
                        htmlFor="email"
                        className="text-right text-slate-400"
                      >
                        {t("suppliers.form.email", "Email")}*
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={newSupplier.email}
                        onChange={(e) =>
                          setNewSupplier({
                            ...newSupplier,
                            email: e.target.value,
                          })
                        }
                        className="col-span-3 bg-slate-700 border-slate-600"
                        placeholder={t(
                          "suppliers.form.emailPlaceholder",
                          "Enter email address",
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label
                        htmlFor="phone"
                        className="text-right text-slate-400"
                      >
                        {t("suppliers.form.phone", "Phone")}
                      </label>
                      <Input
                        id="phone"
                        value={newSupplier.phone}
                        onChange={(e) =>
                          setNewSupplier({
                            ...newSupplier,
                            phone: e.target.value,
                          })
                        }
                        className="col-span-3 bg-slate-700 border-slate-600"
                        placeholder={t(
                          "suppliers.form.phonePlaceholder",
                          "Enter phone number",
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label
                        htmlFor="category"
                        className="text-right text-slate-400"
                      >
                        {t("suppliers.form.category", "Category")}
                      </label>
                      <Input
                        id="category"
                        value={newSupplier.category}
                        onChange={(e) =>
                          setNewSupplier({
                            ...newSupplier,
                            category: e.target.value,
                          })
                        }
                        className="col-span-3 bg-slate-700 border-slate-600"
                        placeholder={t(
                          "suppliers.form.categoryPlaceholder",
                          "e.g., Building Materials, Electrical",
                        )}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="border-slate-600 hover:bg-slate-700"
                    >
                      {t("common.cancel", "Cancel")}
                    </Button>
                    <Button onClick={handleCreateSupplier}>
                      {t("suppliers.addButton", "Add Supplier")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {viewMode === "grid" ? (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSuppliers.map((supplier) => (
                  <motion.div
                    key={supplier.id}
                    whileHover={{
                      y: -5,
                      boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)",
                    }}
                    className="h-full"
                  >
                    <Card className="h-full bg-slate-800 border-slate-700 overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <Badge
                            className={`${getStatusColor(supplier.status)} px-2 py-1 text-xs font-medium`}
                          >
                            {getStatusText(supplier.status)}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-slate-800 border-slate-700 text-white"
                            >
                              <DropdownMenuLabel>
                                {t("common.actions", "Actions")}
                              </DropdownMenuLabel>
                              <DropdownMenuItem className="focus:bg-slate-700 cursor-pointer">
                                {t("suppliers.actions.edit", "Edit Supplier")}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="focus:bg-slate-700 cursor-pointer">
                                {t(
                                  "suppliers.actions.materials",
                                  "View Materials",
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="focus:bg-slate-700 cursor-pointer">
                                {t("suppliers.actions.orders", "View Orders")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-slate-700" />
                              <DropdownMenuItem className="focus:bg-red-900 text-red-400 cursor-pointer">
                                {t(
                                  "suppliers.actions.delete",
                                  "Delete Supplier",
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <CardTitle className="text-xl mt-2">
                          {supplier.name}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          {supplier.category}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2 space-y-4">
                        {/* Contact info */}
                        <div className="space-y-2">
                          {supplier.contactPerson && (
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-slate-500" />
                              <span className="text-sm">
                                {supplier.contactPerson}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-slate-500" />
                            <span className="text-sm">{supplier.email}</span>
                          </div>
                          {supplier.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-slate-500" />
                              <span className="text-sm">{supplier.phone}</span>
                            </div>
                          )}
                          {supplier.address && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-slate-500" />
                              <span className="text-sm">
                                {supplier.address}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Supplier stats */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                              <Package className="h-4 w-4 text-blue-500" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">
                                {t("suppliers.materials", "Materials")}
                              </p>
                              <p className="text-sm font-medium">
                                {supplier.materialsCount}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                              <Clock className="h-4 w-4 text-purple-500" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">
                                {t("suppliers.lastOrder", "Last Order")}
                              </p>
                              <p className="text-sm font-medium">
                                {supplier.lastOrder}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                            <Star className="h-4 w-4 text-yellow-500" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">
                              {t("suppliers.rating", "Rating")}
                            </p>
                            {renderRatingStars(supplier.rating)}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-center hover:bg-slate-700 hover:text-primary"
                          onClick={() => {
                            // Navigate to supplier details
                          }}
                        >
                          {t("suppliers.viewDetails", "View Details")}
                          <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Table View */
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-700">
                      <TableRow className="hover:bg-slate-700">
                        <TableHead className="text-white">
                          {t("suppliers.table.name", "Name")}
                        </TableHead>
                        <TableHead className="text-white">
                          {t("suppliers.table.contact", "Contact")}
                        </TableHead>
                        <TableHead className="text-white">
                          {t("suppliers.table.category", "Category")}
                        </TableHead>
                        <TableHead className="text-white">
                          {t("suppliers.table.status", "Status")}
                        </TableHead>
                        <TableHead className="text-white">
                          {t("suppliers.table.rating", "Rating")}
                        </TableHead>
                        <TableHead className="text-white">
                          {t("suppliers.table.materials", "Materials")}
                        </TableHead>
                        <TableHead className="text-white">
                          {t("suppliers.table.lastOrder", "Last Order")}
                        </TableHead>
                        <TableHead className="text-white text-right">
                          {t("common.actions", "Actions")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSuppliers.map((supplier) => (
                        <TableRow
                          key={supplier.id}
                          className="hover:bg-slate-750 border-slate-700"
                        >
                          <TableCell className="font-medium">
                            {supplier.name}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div>{supplier.contactPerson}</div>
                              <div className="text-xs text-slate-400">
                                {supplier.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{supplier.category}</TableCell>
                          <TableCell>
                            <Badge
                              className={`${getStatusColor(supplier.status)} px-2 py-1 text-xs font-medium`}
                            >
                              {getStatusText(supplier.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {renderRatingStars(supplier.rating)}
                          </TableCell>
                          <TableCell>{supplier.materialsCount}</TableCell>
                          <TableCell>{supplier.lastOrder}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="bg-slate-800 border-slate-700 text-white"
                              >
                                <DropdownMenuLabel>
                                  {t("common.actions", "Actions")}
                                </DropdownMenuLabel>
                                <DropdownMenuItem className="focus:bg-slate-700 cursor-pointer">
                                  {t("suppliers.actions.edit", "Edit Supplier")}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-slate-700 cursor-pointer">
                                  {t(
                                    "suppliers.actions.materials",
                                    "View Materials",
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-slate-700 cursor-pointer">
                                  {t("suppliers.actions.orders", "View Orders")}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-700" />
                                <DropdownMenuItem className="focus:bg-red-900 text-red-400 cursor-pointer">
                                  {t(
                                    "suppliers.actions.delete",
                                    "Delete Supplier",
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {filteredSuppliers.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-medium mb-2">
                  {t("suppliers.noSuppliers.title", "No suppliers found")}
                </h3>
                <p className="text-slate-400 max-w-md mx-auto mb-6">
                  {searchTerm
                    ? t(
                        "suppliers.noSuppliers.searchMessage",
                        "No suppliers match your search criteria. Try a different search term.",
                      )
                    : t(
                        "suppliers.noSuppliers.emptyMessage",
                        "You haven't added any suppliers yet. Add your first supplier to get started.",
                      )}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    {t("suppliers.addButton", "Add Supplier")}
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default SuppliersPage;


