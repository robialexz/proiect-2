import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { Package, Save, ArrowLeft } from "lucide-react";

const AddMaterialPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    unit: "",
    price: "",
    supplier: "",
    description: "",
    project: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    // Removed console statement

    toast({
      title: t("Material Added"),
      description: t("The material has been successfully added to inventory."),
    });

    // Reset form
    setFormData({
      name: "",
      category: "",
      quantity: "",
      unit: "",
      price: "",
      supplier: "",
      description: "",
      project: "",
    });
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
            <h1 className="text-2xl font-bold flex items-center">
              <Package className="mr-2 h-6 w-6 text-primary" />
              {t("Add New Material")}
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("Back")}
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>{t("Material Information")}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("Material Name")}</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={t("Enter material name")}
                        className="bg-slate-700 border-slate-600"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">{t("Category")}</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          handleSelectChange("category", value)
                        }
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue placeholder={t("Select category")} />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="construction">
                            {t("Construction")}
                          </SelectItem>
                          <SelectItem value="electrical">
                            {t("Electrical")}
                          </SelectItem>
                          <SelectItem value="plumbing">
                            {t("Plumbing")}
                          </SelectItem>
                          <SelectItem value="finishing">
                            {t("Finishing")}
                          </SelectItem>
                          <SelectItem value="other">{t("Other")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">{t("Quantity")}</Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder="0"
                        className="bg-slate-700 border-slate-600"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unit">{t("Unit")}</Label>
                      <Select
                        value={formData.unit}
                        onValueChange={(value) =>
                          handleSelectChange("unit", value)
                        }
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue placeholder={t("Select unit")} />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="pcs">{t("Pieces")}</SelectItem>
                          <SelectItem value="kg">{t("Kilograms")}</SelectItem>
                          <SelectItem value="m">{t("Meters")}</SelectItem>
                          <SelectItem value="m2">
                            {t("Square Meters")}
                          </SelectItem>
                          <SelectItem value="m3">
                            {t("Cubic Meters")}
                          </SelectItem>
                          <SelectItem value="l">{t("Liters")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">{t("Price per Unit")}</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="bg-slate-700 border-slate-600"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="supplier">{t("Supplier")}</Label>
                      <Select
                        value={formData.supplier}
                        onValueChange={(value) =>
                          handleSelectChange("supplier", value)
                        }
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue placeholder={t("Select supplier")} />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="supplier1">
                            {t("Supplier 1")}
                          </SelectItem>
                          <SelectItem value="supplier2">
                            {t("Supplier 2")}
                          </SelectItem>
                          <SelectItem value="supplier3">
                            {t("Supplier 3")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="project">{t("Project")}</Label>
                      <Select
                        value={formData.project}
                        onValueChange={(value) =>
                          handleSelectChange("project", value)
                        }
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue placeholder={t("Select project")} />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="project1">
                            {t("Office Building Renovation")}
                          </SelectItem>
                          <SelectItem value="project2">
                            {t("Residential Complex Phase 1")}
                          </SelectItem>
                          <SelectItem value="project3">
                            {t("Highway Bridge Repair")}
                          </SelectItem>
                          <SelectItem value="project4">
                            {t("Shopping Mall Extension")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">{t("Description")}</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder={t("Enter material description")}
                        className="bg-slate-700 border-slate-600 min-h-[100px]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => window.history.back()}
                    >
                      {t("Cancel")}
                    </Button>
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" />
                      {t("Save Material")}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AddMaterialPage;


