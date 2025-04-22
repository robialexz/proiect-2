import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import DocumentCollaboration from "@/components/documents/DocumentCollaboration";
import {
  FileText,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Trash2,
  FileSpreadsheet,
  FileImage,
  File,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Document {
  id: string;
  name: string;
  type: "pdf" | "excel" | "image" | "word" | "other";
  size: string;
  uploadedBy: string;
  uploadDate: string;
  project: string;
  category: string;
}

const DocumentsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadFormData, setUploadFormData] = useState({
    name: "",
    project: "",
    category: "",
    description: "",
  });

  // Mock documents data
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Project Requirements.pdf",
      type: "pdf",
      size: "2.4 MB",
      uploadedBy: "John Doe",
      uploadDate: "2023-07-15",
      project: "Office Building Renovation",
      category: "Requirements",
    },
    {
      id: "2",
      name: "Budget Estimation.xlsx",
      type: "excel",
      size: "1.8 MB",
      uploadedBy: "Maria Smith",
      uploadDate: "2023-07-12",
      project: "Residential Complex Phase 1",
      category: "Financial",
    },
    {
      id: "3",
      name: "Site Photos.jpg",
      type: "image",
      size: "5.2 MB",
      uploadedBy: "Alex Johnson",
      uploadDate: "2023-07-10",
      project: "Highway Bridge Repair",
      category: "Photos",
    },
    {
      id: "4",
      name: "Contract Agreement.pdf",
      type: "pdf",
      size: "3.1 MB",
      uploadedBy: "Sarah Williams",
      uploadDate: "2023-07-08",
      project: "Shopping Mall Extension",
      category: "Legal",
    },
    {
      id: "5",
      name: "Material Specifications.pdf",
      type: "pdf",
      size: "4.5 MB",
      uploadedBy: "John Doe",
      uploadDate: "2023-07-05",
      project: "Office Building Renovation",
      category: "Technical",
    },
    {
      id: "6",
      name: "Team Assignments.xlsx",
      type: "excel",
      size: "1.2 MB",
      uploadedBy: "Maria Smith",
      uploadDate: "2023-07-03",
      project: "Residential Complex Phase 1",
      category: "Planning",
    },
  ]);

  const categories = [
    "All",
    "Requirements",
    "Financial",
    "Technical",
    "Legal",
    "Photos",
    "Planning",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setUploadFormData((prev) => ({
        ...prev,
        name: file.name,
      }));
    }
  };

  const handleUploadFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setUploadFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setUploadFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: t("No File Selected"),
        description: t("Please select a file to upload."),
      });
      return;
    }

    if (!uploadFormData.project || !uploadFormData.category) {
      toast({
        variant: "destructive",
        title: t("Missing Information"),
        description: t("Please fill in all required fields."),
      });
      return;
    }

    // Determine file type
    let fileType: Document["type"] = "other";
    if (selectedFile.name.endsWith(".pdf")) fileType = "pdf";
    else if (
      selectedFile.name.endsWith(".xlsx") ||
      selectedFile.name.endsWith(".xls")
    )
      fileType = "excel";
    else if (
      selectedFile.name.endsWith(".jpg") ||
      selectedFile.name.endsWith(".png") ||
      selectedFile.name.endsWith(".jpeg")
    )
      fileType = "image";

    // Add new document to the list
    const newDocument: Document = {
      id: Date.now().toString(),
      name: uploadFormData.name,
      type: fileType,
      size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadedBy: user?.email?.split("@")[0] || "User",
      uploadDate: new Date().toISOString().split("T")[0],
      project: uploadFormData.project,
      category: uploadFormData.category,
    };

    setDocuments((prev) => [newDocument, ...prev]);
    setIsUploadDialogOpen(false);
    setSelectedFile(null);
    setUploadFormData({
      name: "",
      project: "",
      category: "",
      description: "",
    });

    toast({
      title: t("Document Uploaded"),
      description: t("Your document has been successfully uploaded."),
    });
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    toast({
      title: t("Document Deleted"),
      description: t("The document has been removed."),
    });
  };

  const getDocumentIcon = (type: Document["type"]) => {
    switch (type) {
      case "pdf":
        return <File className="h-5 w-5 text-red-400" />;
      case "excel":
        return <FileSpreadsheet className="h-5 w-5 text-green-400" />;
      case "image":
        return <FileImage className="h-5 w-5 text-blue-400" />;
      default:
        return <FileText className="h-5 w-5 text-slate-400" />;
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !selectedCategory ||
      selectedCategory === "All" ||
      doc.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

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
              <FileText className="mr-2 h-6 w-6 text-primary" />
              {t("Documents")}
            </h1>
            <Dialog
              open={isUploadDialogOpen}
              onOpenChange={setIsUploadDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("Upload Document")}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700 text-white">
                <DialogHeader>
                  <DialogTitle>{t("Upload New Document")}</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    {t("Upload a document and add relevant information.")}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div
                    className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:bg-slate-700/30 transition-colors cursor-pointer"
                    onClick={() =>
                      document.getElementById("document-upload")?.click()
                    }
                  >
                    <input
                      id="document-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-medium">
                      {selectedFile
                        ? selectedFile.name
                        : t("Click to select a file")}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      {t("Supported formats: PDF, Excel, Word, Images")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">{t("Document Name")}</Label>
                    <Input
                      id="name"
                      name="name"
                      value={uploadFormData.name}
                      onChange={handleUploadFormChange}
                      placeholder={t("Enter document name")}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project">{t("Project")}</Label>
                    <Select
                      value={uploadFormData.project}
                      onValueChange={(value) =>
                        handleSelectChange("project", value)
                      }
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder={t("Select project")} />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="Office Building Renovation">
                          {t("Office Building Renovation")}
                        </SelectItem>
                        <SelectItem value="Residential Complex Phase 1">
                          {t("Residential Complex Phase 1")}
                        </SelectItem>
                        <SelectItem value="Highway Bridge Repair">
                          {t("Highway Bridge Repair")}
                        </SelectItem>
                        <SelectItem value="Shopping Mall Extension">
                          {t("Shopping Mall Extension")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">{t("Category")}</Label>
                    <Select
                      value={uploadFormData.category}
                      onValueChange={(value) =>
                        handleSelectChange("category", value)
                      }
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder={t("Select category")} />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {categories
                          .filter((cat) => cat !== "All")
                          .map((category) => (
                            <SelectItem key={category} value={category}>
                              {t(category)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsUploadDialogOpen(false)}
                  >
                    {t("Cancel")}
                  </Button>
                  <Button onClick={handleUpload}>{t("Upload")}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder={t("Search documents...")}
                  className="pl-10 bg-slate-800 border-slate-700"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    {selectedCategory
                      ? t(selectedCategory)
                      : t("All Categories")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
                  {categories.map((category) => (
                    <DropdownMenuItem
                      key={category}
                      className="cursor-pointer hover:bg-slate-700"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {t(category)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Documents List */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="bg-slate-800 border-slate-700">
                <TabsTrigger value="all">{t("All Documents")}</TabsTrigger>
                <TabsTrigger value="recent">
                  {t("Recently Uploaded")}
                </TabsTrigger>
                <TabsTrigger value="shared">{t("Shared With Me")}</TabsTrigger>
                <TabsTrigger value="collaboration">{t("Collaboration")}</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle>{t("All Documents")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {filteredDocuments.length > 0 ? (
                      <div className="space-y-4">
                        {filteredDocuments.map((doc) => (
                          <motion.div
                            key={doc.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="p-2 rounded-full bg-slate-600">
                                {getDocumentIcon(doc.type)}
                              </div>
                              <div>
                                <h3 className="font-medium">{doc.name}</h3>
                                <div className="flex gap-4 text-xs text-slate-400 mt-1">
                                  <span>{doc.size}</span>
                                  <span>•</span>
                                  <span>{doc.uploadDate}</span>
                                  <span>•</span>
                                  <span>{doc.project}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteDocument(doc.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-400" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto text-slate-600 mb-2" />
                        <p className="text-slate-400">
                          {t("No documents found")}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recent" className="mt-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle>{t("Recently Uploaded")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-slate-600 mb-2" />
                      <p className="text-slate-400">
                        {t("No recent documents")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="shared" className="mt-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle>{t("Shared With Me")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-slate-600 mb-2" />
                      <p className="text-slate-400">
                        {t("No shared documents")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="collaboration" className="mt-6">
                <DocumentCollaboration className="bg-slate-800 border-slate-700" />
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DocumentsPage;


