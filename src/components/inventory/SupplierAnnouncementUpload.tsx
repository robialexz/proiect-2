import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { Upload, FileText, Image, FileSpreadsheet, X, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRole } from "@/contexts/RoleContext";

interface SupplierAnnouncementUploadProps {
  projectId: string | null;
  onUploadSuccess: () => void;
}

type FileType = "image" | "excel" | "pdf" | "unknown";

interface UploadedFile {
  id: string;
  file: File;
  type: FileType;
  preview: string;
  name: string;
  size: string;
  uploadProgress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

const SupplierAnnouncementUpload: React.FC<SupplierAnnouncementUploadProps> = ({
  projectId,
  onUploadSuccess,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isManager } = useRole();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [supplierName, setSupplierName] = useState("");
  const [supplierNote, setSupplierNote] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const getFileType = (file: File): FileType => {
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
      return "image";
    } else if (["xls", "xlsx", "csv"].includes(extension)) {
      return "excel";
    } else if (extension === "pdf") {
      return "pdf";
    }
    return "unknown";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const newFiles: UploadedFile[] = [];

    Array.from(fileList).forEach((file) => {
      const fileType = getFileType(file);
      let preview = "";

      if (fileType === "image") {
        preview = URL.createObjectURL(file);
      }

      newFiles.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        type: fileType,
        preview,
        name: file.name,
        size: formatFileSize(file.size),
        uploadProgress: 0,
        status: "pending",
      });
    });

    setUploadedFiles([...uploadedFiles, ...newFiles]);
    // Reset the input
    e.target.value = "";
  };

  const removeFile = (id: string) => {
    setUploadedFiles(uploadedFiles.filter((file) => file.id !== id));
  };

  const handleSubmit = async () => {
    if (!projectId) {
      toast({
        variant: "destructive",
        title: t("inventory.errors.selectProjectFirst", "Select a project"),
        description: t(
          "inventory.errors.selectProjectFirstDesc",
          "Please select a project before uploading files.",
        ),
      });
      return;
    }

    if (uploadedFiles.length === 0) {
      toast({
        variant: "destructive",
        title: t("inventory.errors.noFiles", "No files selected"),
        description: t(
          "inventory.errors.noFilesDesc",
          "Please select at least one file to upload.",
        ),
      });
      return;
    }

    if (!supplierName.trim()) {
      toast({
        variant: "destructive",
        title: t("inventory.errors.noSupplierName", "Supplier name required"),
        description: t(
          "inventory.errors.noSupplierNameDesc",
          "Please enter the supplier name.",
        ),
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create a new announcement record
      const { data: announcement, error: announcementError } = await supabase
        .from("supplier_announcements")
        .insert([
          {
            project_id: projectId,
            supplier_name: supplierName,
            notes: supplierNote,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (announcementError) throw announcementError;

      // Upload each file
      const updatedFiles = [...uploadedFiles];
      for (let i = 0; i < updatedFiles.length; i++) {
        const file = updatedFiles[i];
        file.status = "uploading";
        setUploadedFiles([...updatedFiles]);

        try {
          // Upload to Supabase Storage
          const filePath = `announcements/${announcement.id}/${file.name}`;
          try {
          const { error: uploadError } = await supabase.storage
          } catch (error) {
            // Handle error appropriately
          }
            .from("supplier-files")
            .upload(filePath, file.file);

          if (uploadError) throw uploadError;

          // Create a record in the files table
          try {
          const { error: fileRecordError } = await supabase
          } catch (error) {
            // Handle error appropriately
          }
            .from("supplier_announcement_files")
            .insert([
              {
                announcement_id: announcement.id,
                file_path: filePath,
                file_name: file.name,
                file_type: file.type,
                file_size: file.file.size,
              },
            ]);

          if (fileRecordError) throw fileRecordError;

          // Update the file status
          updatedFiles[i] = {
            ...file,
            uploadProgress: 100,
            status: "success",
          };
          setUploadedFiles([...updatedFiles]);
        } catch (error: any) {
          // Removed console statement
          updatedFiles[i] = {
            ...file,
            status: "error",
            error: error.message || "Upload failed",
          };
          setUploadedFiles([...updatedFiles]);
        }
      }

      toast({
        title: t(
          "inventory.toasts.announcementUploaded",
          "Supplier announcement uploaded",
        ),
        description: t(
          "inventory.toasts.announcementUploadedDesc",
          "Files have been uploaded successfully.",
        ),
      });

      // Reset the form
      setUploadedFiles([]);
      setSupplierName("");
      setSupplierNote("");
      onUploadSuccess();
    } catch (error: any) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t(
          "inventory.errors.announcementFailed",
          "Failed to create announcement",
        ),
        description: error.message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (type: FileType) => {
    switch (type) {
      case "image":
        return <Image className="h-6 w-6 text-blue-500" />;
      case "excel":
        return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
      case "pdf":
        return <FileText className="h-6 w-6 text-red-500" />;
      default:
        return <FileText className="h-6 w-6 text-slate-500" />;
    }
  };

  const viewFile = (file: UploadedFile) => {
    if (file.type === "image" && file.preview) {
      window.open(file.preview, "_blank");
    } else {
      // For non-image files, we can't preview them directly
      // In a real app, you might want to use a PDF viewer or Excel viewer
      toast({
        title: t("inventory.toasts.cannotPreview", "Cannot preview file"),
        description: t(
          "inventory.toasts.cannotPreviewDesc",
          "This file type cannot be previewed directly.",
        ),
      });
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle>
          {t(
            "inventory.supplierAnnouncement.title",
            "Supplier Announcements Upload",
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="supplierName">
            {t("inventory.supplierAnnouncement.supplierName", "Supplier Name")}*
          </Label>
          <Input
            id="supplierName"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            placeholder={t(
              "inventory.supplierAnnouncement.supplierNamePlaceholder",
              "Enter supplier name",
            )}
            className="bg-slate-700 border-slate-600"
            disabled={isUploading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplierNote">
            {t("inventory.supplierAnnouncement.note", "Note")}
          </Label>
          <Input
            id="supplierNote"
            value={supplierNote}
            onChange={(e) => setSupplierNote(e.target.value)}
            placeholder={t(
              "inventory.supplierAnnouncement.notePlaceholder",
              "Additional information about this announcement",
            )}
            className="bg-slate-700 border-slate-600"
            disabled={isUploading}
          />
        </div>

        <div className="space-y-2">
          <Label>
            {t("inventory.supplierAnnouncement.files", "Upload Files")}
          </Label>
          <div
            className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:bg-slate-700/50 transition-colors cursor-pointer"
            onClick={() => document.getElementById("fileUpload")?.click()}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm text-slate-400">
              {t(
                "inventory.supplierAnnouncement.dragDrop",
                "Drag and drop files here or click to browse",
              )}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {t(
                "inventory.supplierAnnouncement.supportedFormats",
                "Supported formats: Images, PDF, Excel",
              )}
            </p>
            <input
              type="file"
              id="fileUpload"
              multiple
              accept="image/*,.pdf,.xls,.xlsx,.csv"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
          </div>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <Label>
              {t(
                "inventory.supplierAnnouncement.selectedFiles",
                "Selected Files",
              )}
            </Label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between bg-slate-700 p-3 rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-400">{file.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {file.type === "image" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          viewFile(file);
                        }}
                        disabled={isUploading}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          className="w-full mt-4"
          onClick={handleSubmit}
          disabled={
            isUploading || uploadedFiles.length === 0 || !supplierName.trim()
          }
        >
          {isUploading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              {t("inventory.supplierAnnouncement.uploading", "Uploading...")}
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              {t(
                "inventory.supplierAnnouncement.submitAnnouncement",
                "Submit Announcement",
              )}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SupplierAnnouncementUpload;
